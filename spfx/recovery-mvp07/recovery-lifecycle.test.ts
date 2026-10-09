// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import { transformSync } from 'esbuild';
import { IDBFactory } from 'fake-indexeddb';
import { getProviderCacheIdentity } from '../src/core/cacheIdentity';
import type { IReleaseActivationResult, IReleaseProvider, IValidatedRelease } from '../src/core/types';

type Current = () => boolean;
interface Store {
  activate(release: IValidatedRelease, key?: string, isCurrent?: Current): Promise<void>;
  getActive(key?: string): Promise<IValidatedRelease | undefined>;
}
interface Service {
  refresh(provider: IReleaseProvider, isCurrent?: Current): Promise<IReleaseActivationResult>;
  getActive(provider?: IReleaseProvider): Promise<IValidatedRelease | undefined>;
}
interface Validator { validateProvider(provider: IReleaseProvider): Promise<IValidatedRelease> }

// Compile the exact overlay bytes in memory. Sibling imports resolve where the
// builder installs them, without creating or changing the production sources.
// These are lifecycle tests with controlled validators, not format acceptance.
function loadOverlay<T>(name: string): T {
  const source = readFileSync(new URL(`./${name}.ts`, import.meta.url), 'utf8');
  const compiled = transformSync(source, { loader: 'ts', format: 'cjs', target: 'es2020' }).code;
  const module = { exports: {} };
  const require = createRequire(new URL('../src/core/ReleaseService.ts', import.meta.url));
  new Function('require', 'module', 'exports', compiled)(require, module, module.exports);
  return module.exports as T;
}

const { ReleaseService } = loadOverlay<{
  ReleaseService: new (store: Store, validator: Validator) => Service;
}>('ReleaseService');
const { IndexedDbValidatedReleaseStore, MemoryValidatedReleaseStore } = loadOverlay<{
  IndexedDbValidatedReleaseStore: new (name: string, factory: IDBFactory) => Store;
  MemoryValidatedReleaseStore: new () => Store;
}>('ValidatedReleaseStore');

const provider: IReleaseProvider = {
  id: 'local-lifecycle-review',
  kind: 'sharepointMirror',
  cacheConfiguration: {
    kind: 'sharepointMirror',
    siteAbsoluteUrl: 'https://example.invalid/sites/review',
    mirrorPath: '/sites/review/releases/approved'
  },
  async fetchBytes() { throw new Error('Network is prohibited in this local lifecycle test'); }
};
const key = getProviderCacheIdentity(provider);

function release(id: string): IValidatedRelease {
  const manifestBytes = new TextEncoder().encode(JSON.stringify({ releaseId: id }));
  return {
    releaseId: id, formatVersion: '6.0.0', coverageFrom: '2026-01-01', coverageTo: null,
    profileIds: [], calendarIds: [], artifacts: [], manifestBytes,
    manifestSha256: createHash('sha256').update(manifestBytes).digest('hex'),
    validatedAt: '2026-10-08T00:00:00.000Z'
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

function openDatabase(factory: IDBFactory, name: string, version: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = factory.open(name, version);
    let failed = false;
    request.onupgradeneeded = () => {
      if (version === 1) {
        request.result.createObjectStore('releases', { keyPath: 'releaseId' });
        request.result.createObjectStore('state', { keyPath: 'key' });
      }
    };
    request.onsuccess = () => {
      if (failed) request.result.close();
      else resolve(request.result);
    };
    request.onerror = () => { failed = true; reject(request.error); };
    request.onblocked = () => { failed = true; reject(new Error('Unexpected leaked database handle')); };
  });
}

describe('Recovery request lifecycle', { timeout: 10000 }, () => {
  it('keeps the ordinary optional-callback contract', async () => {
    const store = new MemoryValidatedReleaseStore();
    const expected = release('current');
    const result = await new ReleaseService(store, { validateProvider: async () => expected }).refresh(provider);
    assert.equal(result.mode, 'network');
    assert.equal((await store.getActive(key))?.releaseId, 'current');
    assert.equal(await store.getActive(), undefined);
  });

  it('rejects an already stale operation before validation or cache access', async () => {
    let calls = 0;
    const store: Store = {
      async activate() { calls += 1; },
      async getActive() { calls += 1; return undefined; }
    };
    const service = new ReleaseService(store, { async validateProvider() { calls += 1; return release('unused'); } });
    await assert.rejects(service.refresh(provider, () => false), /nicht mehr aktuell/);
    assert.equal(calls, 0);
  });

  it('never lets an older validation overwrite the newer cache or initiate fallback', async () => {
    const memory = new MemoryValidatedReleaseStore();
    let reads = 0;
    const store: Store = {
      activate: (...args) => memory.activate(...args),
      async getActive(cacheKey) { reads += 1; return memory.getActive(cacheKey); }
    };
    let current = true;
    const oldValidation = deferred<IValidatedRelease>();
    const oldOperation = new ReleaseService(store, { validateProvider: () => oldValidation.promise })
      .refresh(provider, () => current);
    await new ReleaseService(store, { validateProvider: async () => release('newer') }).refresh(provider);
    current = false;
    const rejected = assert.rejects(oldOperation, /nicht mehr aktuell/);
    oldValidation.resolve(release('older'));
    await rejected;
    assert.equal((await memory.getActive(key))?.releaseId, 'newer');
    assert.equal(reads, 0);
  });

  it('does not start fallback when a stale network operation fails', async () => {
    let current = true;
    let reads = 0;
    let writes = 0;
    const validation = deferred<IValidatedRelease>();
    const store: Store = {
      async activate() { writes += 1; },
      async getActive() { reads += 1; return release('cached'); }
    };
    const operation = new ReleaseService(store, { validateProvider: () => validation.promise })
      .refresh(provider, () => current);
    current = false;
    const rejected = assert.rejects(operation, /nicht mehr aktuell/);
    validation.reject(new Error('Late network failure'));
    await rejected;
    assert.equal(reads, 0);
    assert.equal(writes, 0);
  });

  it('does not return a fallback that becomes stale during byte revalidation', async () => {
    const store = new MemoryValidatedReleaseStore();
    const cached = release('cached');
    await store.activate(cached, key);
    let current = true;
    let validations = 0;
    const fallbackStarted = deferred<void>();
    const fallbackValidation = deferred<IValidatedRelease>();
    const operation = new ReleaseService(store, {
      async validateProvider() {
        validations += 1;
        if (validations === 1) throw new Error('Offline');
        fallbackStarted.resolve();
        return fallbackValidation.promise;
      }
    }).refresh(provider, () => current);
    await fallbackStarted.promise;
    current = false;
    const rejected = assert.rejects(operation, /nicht mehr aktuell/);
    fallbackValidation.resolve(cached);
    await rejected;
    assert.equal((await store.getActive(key))?.releaseId, 'cached');
  });

  it('still returns a current fully revalidated fallback without adopting legacy cache', async () => {
    const store = new MemoryValidatedReleaseStore();
    const cached = release('configured');
    await store.activate(release('legacy'));
    await store.activate(cached, key);
    let validations = 0;
    const result = await new ReleaseService(store, {
      async validateProvider() {
        if (++validations === 1) throw new Error('Offline');
        return cached;
      }
    }).refresh(provider, () => true);
    assert.equal(result.mode, 'fallback');
    assert.equal(result.release.releaseId, 'configured');
    assert.equal(validations, 2);
    assert.equal((await store.getActive())?.releaseId, 'legacy');
  });

  for (const cacheKey of [key, undefined]) {
    it(`guards MemoryStore ${cacheKey ? 'configured' : 'legacy'} writes`, async () => {
      const store = new MemoryValidatedReleaseStore();
      await store.activate(release('preserved'), cacheKey);
      await assert.rejects(store.activate(release('stale'), cacheKey, () => false), /nicht mehr aktuell/);
      assert.equal((await store.getActive(cacheKey))?.releaseId, 'preserved');
    });
  }
});

describe('Recovery IndexedDB lifecycle', { timeout: 10000 }, () => {
  for (const cacheKey of [key, undefined]) {
    it(`checks current state after a suspended open before ${cacheKey ? 'configured' : 'legacy'} writes`, async () => {
      const factory = new IDBFactory();
      const store = new IndexedDbValidatedReleaseStore('suspended-open', factory);
      await store.activate(release('preserved'), cacheKey);
      const internal = store as Store & { openDatabase(): Promise<IDBDatabase> };
      const originalOpen = internal.openDatabase.bind(internal);
      const opened = deferred<void>();
      const resume = deferred<void>();
      internal.openDatabase = async () => {
        const database = await originalOpen();
        opened.resolve();
        await resume.promise;
        return database;
      };
      let current = true;
      const operation = store.activate(release('stale'), cacheKey, () => current);
      await opened.promise;
      current = false;
      const rejected = assert.rejects(operation, /nicht mehr aktuell/);
      resume.resolve();
      await rejected;
      assert.equal((await store.getActive(cacheKey))?.releaseId, 'preserved');
      (await originalOpen()).close();
    });
  }

  it('threads the service guard through an awaited IndexedDB open and skips fallback', async () => {
    const store = new IndexedDbValidatedReleaseStore('service-suspended-open', new IDBFactory());
    await store.activate(release('preserved'), key);
    const internal = store as Store & { openDatabase(): Promise<IDBDatabase> };
    const originalOpen = internal.openDatabase.bind(internal);
    const opened = deferred<void>();
    const resume = deferred<void>();
    internal.openDatabase = async () => {
      const database = await originalOpen();
      opened.resolve();
      await resume.promise;
      return database;
    };
    let reads = 0;
    const originalGet = store.getActive.bind(store);
    store.getActive = async cacheKey => { reads += 1; return originalGet(cacheKey); };
    let current = true;
    const operation = new ReleaseService(store, { validateProvider: async () => release('stale') })
      .refresh(provider, () => current);
    await opened.promise;
    current = false;
    const rejected = assert.rejects(operation, /nicht mehr aktuell/);
    resume.resolve();
    await rejected;
    assert.equal(reads, 0);
    assert.equal((await originalGet(key))?.releaseId, 'preserved');
    (await originalOpen()).close();
  });

  it('recovers on the same store after a blocked upgrade and closes late success handles', async () => {
    const factory = new IDBFactory();
    const name = 'blocked-retry';
    const legacy = await openDatabase(factory, name, 1);
    const store = new IndexedDbValidatedReleaseStore(name, factory);
    await assert.rejects(store.getActive(key), /offene Sitzung blockiert/);
    legacy.close();
    // The first rejected request can still finish. This concurrent retry must
    // retain its own opening promise and not leak the abandoned connection.
    await store.activate(release('after-close'), key);
    assert.equal((await store.getActive(key))?.releaseId, 'after-close');
    assert.equal(await store.getActive(), undefined);
    // An abandoned open connection would block this upgrade indefinitely.
    const upgraded = await openDatabase(factory, name, 3);
    upgraded.close();
  });

  it('does not cache a failed open and retries without deleting data', async () => {
    const factory = new IDBFactory();
    const actualOpen = factory.open.bind(factory);
    let attempts = 0;
    factory.open = ((...args: Parameters<IDBFactory['open']>) => {
      if (++attempts === 1) throw new Error('Transient open failure');
      return actualOpen(...args);
    }) as IDBFactory['open'];
    const store = new IndexedDbValidatedReleaseStore('failed-open-retry', factory);
    await assert.rejects(store.getActive(key), /Transient open failure/);
    await store.activate(release('retry'), key);
    assert.equal((await store.getActive(key))?.releaseId, 'retry');
    assert.equal(attempts, 2);
    (await (store as Store & { openDatabase(): Promise<IDBDatabase> }).openDatabase()).close();
  });

  it('closes on versionchange and invalidates its resolved connection promise', async () => {
    const factory = new IDBFactory();
    const actualOpen = factory.open.bind(factory);
    let opens = 0;
    factory.open = ((...args: Parameters<IDBFactory['open']>) => {
      opens += 1;
      return actualOpen(...args);
    }) as IDBFactory['open'];
    const name = 'versionchange';
    const store = new IndexedDbValidatedReleaseStore(name, factory);
    await store.activate(release('preserved'), key);
    assert.equal(opens, 1);
    const upgraded = await openDatabase(factory, name, 3);
    upgraded.close();
    assert.equal(opens, 2);
    // Reopening the old schema correctly fails instead of reusing a closed DB.
    await assert.rejects(store.getActive(key), error => (error as Error).name === 'VersionError');
    assert.equal(opens, 3);
    await assert.rejects(store.getActive(key), error => (error as Error).name === 'VersionError');
    assert.equal(opens, 4);
    const inspection = await openDatabase(factory, name, 3);
    const preserved = await new Promise<{ release: IValidatedRelease }>((resolve, reject) => {
      const request = inspection.transaction('configuredReleases', 'readonly').objectStore('configuredReleases').get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    assert.equal(preserved.release.releaseId, 'preserved');
    inspection.close();
  });
});
