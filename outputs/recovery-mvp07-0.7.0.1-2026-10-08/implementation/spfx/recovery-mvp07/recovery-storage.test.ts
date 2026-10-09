// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { describe, it, type TestContext } from 'node:test';
import {
  createBrowserRecoveryStorage,
  createRecoveryStorage,
  RECOVERY_DEFAULTS_RESET_MARKER,
  RECOVERY_DEFAULTS_STORAGE_KEY,
  SHARED_DEFAULTS_STORAGE_KEY,
  type StorageLike
} from './RecoveryStorage';
import {
  clearDefaults,
  DEFAULTS_STORAGE_KEY,
  saveDefaults,
  type StoredDefaults
} from '../../outputs/release-mvp06-spfx-0.6.0.1-2026-10-01/build-evidence/inputs/src/ui/defaults';

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();
  readonly calls: Array<{ method: string; key: string }> = [];

  getItem(key: string): string | null {
    this.calls.push({ method: 'get', key });
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.calls.push({ method: 'set', key });
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.calls.push({ method: 'remove', key });
    this.values.delete(key);
  }
}

const sharedV4 = '{ "version": 4, "locale": "fr", "calendarMode": "manual", "extra": [1,2,3] }';
const ownV3 = '{ "version": 3, "locale": "de", "deadlineDays": 30 }';
const defaults: StoredDefaults = {
  version: 3,
  locale: 'fr',
  authorityCode: 'BE',
  profileId: 'stpo',
  deadlineDays: 20,
  calendarId: 'be-public-holidays',
  specialRegimeId: '',
  specialDefinitionId: '',
  selectors: {},
  vrpgSelection: { area: '', law: '', action: '', stage: '' }
};

function browserWindow(context: TestContext, value: unknown): void {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value });
  context.after(() => {
    if (original) Object.defineProperty(globalThis, 'window', original);
    else Reflect.deleteProperty(globalThis, 'window');
  });
}

describe('MVP06 recovery defaults isolation', { concurrency: false }, () => {
  it('matches the unchanged UI key and uses one stable recovery key', () => {
    assert.equal(SHARED_DEFAULTS_STORAGE_KEY, DEFAULTS_STORAGE_KEY);
    assert.equal(RECOVERY_DEFAULTS_STORAGE_KEY, 'fristenrechner.defaults.recovery-mvp06.v1');
  });

  for (const version of [1, 2, 3]) {
    it(`reads shared version ${version} byte for byte without writes`, () => {
      const backend = new MemoryStorage();
      const original = `{ "version": ${version}, "locale": "fr", "preserved": true }`;
      backend.values.set(SHARED_DEFAULTS_STORAGE_KEY, original);
      assert.equal(createRecoveryStorage(backend).getItem(DEFAULTS_STORAGE_KEY), original);
      assert.ok(backend.calls.every(call => call.method === 'get'));
      assert.equal(backend.values.size, 1);
    });
  }

  it('leaves existing v4 bytes unchanged through save, reset, reload and resave', () => {
    const backend = new MemoryStorage();
    backend.values.set(SHARED_DEFAULTS_STORAGE_KEY, sharedV4);
    const storage = createRecoveryStorage(backend);
    assert.equal(storage.getItem(DEFAULTS_STORAGE_KEY), null);
    assert.equal(saveDefaults(storage, defaults), true);
    assert.equal(JSON.parse(backend.values.get(RECOVERY_DEFAULTS_STORAGE_KEY)!).version, 3);
    assert.equal(backend.values.get(SHARED_DEFAULTS_STORAGE_KEY), sharedV4);
    assert.equal(clearDefaults(storage), true);
    assert.equal(backend.values.get(RECOVERY_DEFAULTS_STORAGE_KEY), RECOVERY_DEFAULTS_RESET_MARKER);
    const reloaded = createRecoveryStorage(backend);
    assert.equal(reloaded.getItem(DEFAULTS_STORAGE_KEY), null);
    assert.equal(saveDefaults(reloaded, defaults), true);
    assert.equal(backend.values.get(SHARED_DEFAULTS_STORAGE_KEY), sharedV4);
    assert.ok(backend.calls.filter(call => call.method !== 'get')
      .every(call => call.method === 'set' && call.key === RECOVERY_DEFAULTS_STORAGE_KEY));
  });

  it('does not create a shared key when originals do not exist', () => {
    const backend = new MemoryStorage();
    const storage = createRecoveryStorage(backend);
    assert.equal(storage.getItem(DEFAULTS_STORAGE_KEY), null);
    storage.setItem(DEFAULTS_STORAGE_KEY, ownV3);
    storage.removeItem(DEFAULTS_STORAGE_KEY);
    assert.equal(backend.values.has(SHARED_DEFAULTS_STORAGE_KEY), false);
    assert.equal(backend.values.size, 1);
  });

  it('prefers recovery values and preserves originals written later', () => {
    const backend = new MemoryStorage();
    const storage = createRecoveryStorage(backend);
    storage.setItem(DEFAULTS_STORAGE_KEY, ownV3);
    backend.values.set(SHARED_DEFAULTS_STORAGE_KEY, sharedV4);
    assert.equal(createRecoveryStorage(backend).getItem(DEFAULTS_STORAGE_KEY), ownV3);
    storage.removeItem(DEFAULTS_STORAGE_KEY);
    assert.equal(backend.values.get(SHARED_DEFAULTS_STORAGE_KEY), sharedV4);
  });

  it('does not cache original defaults before recovery values exist', () => {
    const backend = new MemoryStorage();
    const storage = createRecoveryStorage(backend);
    assert.equal(storage.getItem(DEFAULTS_STORAGE_KEY), null);
    backend.values.set(SHARED_DEFAULTS_STORAGE_KEY, ownV3);
    assert.equal(storage.getItem(DEFAULTS_STORAGE_KEY), ownV3);
    backend.values.set(SHARED_DEFAULTS_STORAGE_KEY, sharedV4);
    assert.equal(storage.getItem(DEFAULTS_STORAGE_KEY), null);
  });

  it('keeps legacy originals suppressed after reset and a fresh adapter', () => {
    const backend = new MemoryStorage();
    backend.values.set(SHARED_DEFAULTS_STORAGE_KEY, ownV3);
    const storage = createRecoveryStorage(backend);
    assert.equal(storage.getItem(DEFAULTS_STORAGE_KEY), ownV3);
    storage.removeItem(DEFAULTS_STORAGE_KEY);
    assert.equal(createRecoveryStorage(backend).getItem(DEFAULTS_STORAGE_KEY), null);
    assert.equal(backend.values.get(SHARED_DEFAULTS_STORAGE_KEY), ownV3);
  });

  it('does not fall back from invalid, unknown or reset recovery values', () => {
    for (const raw of ['', '{broken', 'null', '[]', '{"version":"3"}', sharedV4, RECOVERY_DEFAULTS_RESET_MARKER]) {
      const backend = new MemoryStorage();
      backend.values.set(SHARED_DEFAULTS_STORAGE_KEY, ownV3);
      backend.values.set(RECOVERY_DEFAULTS_STORAGE_KEY, raw);
      assert.equal(createRecoveryStorage(backend).getItem(DEFAULTS_STORAGE_KEY), null);
      assert.deepEqual(backend.calls, [{ method: 'get', key: RECOVERY_DEFAULTS_STORAGE_KEY }]);
      assert.equal(backend.values.get(RECOVERY_DEFAULTS_STORAGE_KEY), raw);
    }
  });

  it('does not expose or rewrite unsupported original contents', () => {
    for (const raw of ['', '{broken', 'null', '[]', '{"version":"3"}', '{"version":5}', sharedV4]) {
      const backend = new MemoryStorage();
      backend.values.set(SHARED_DEFAULTS_STORAGE_KEY, raw);
      assert.equal(createRecoveryStorage(backend).getItem(DEFAULTS_STORAGE_KEY), null);
      assert.equal(backend.values.get(SHARED_DEFAULTS_STORAGE_KEY), raw);
      assert.equal(backend.values.size, 1);
    }
  });

  it('rejects foreign logical keys before any backend access', () => {
    const backend = new MemoryStorage();
    const storage = createRecoveryStorage(backend);
    for (const key of ['other.key', '', RECOVERY_DEFAULTS_STORAGE_KEY, 'fristenrechner.defaults.v4']) {
      assert.throws(() => storage.getItem(key));
      assert.throws(() => storage.setItem(key, ownV3));
      assert.throws(() => storage.removeItem(key));
    }
    assert.deepEqual(backend.calls, []);
  });

  it('rejects nonlegacy saves without changing either saved value', () => {
    const backend = new MemoryStorage();
    backend.values.set(SHARED_DEFAULTS_STORAGE_KEY, sharedV4);
    backend.values.set(RECOVERY_DEFAULTS_STORAGE_KEY, ownV3);
    const storage = createRecoveryStorage(backend);
    for (const value of [sharedV4, '{broken', 'null', RECOVERY_DEFAULTS_RESET_MARKER]) {
      assert.throws(() => storage.setItem(DEFAULTS_STORAGE_KEY, value));
    }
    assert.deepEqual(backend.calls, []);
    assert.equal(backend.values.get(SHARED_DEFAULTS_STORAGE_KEY), sharedV4);
    assert.equal(backend.values.get(RECOVERY_DEFAULTS_STORAGE_KEY), ownV3);
  });

  it('returns a non-null unavailable adapter and lets the old UI report failure', () => {
    const storage = createRecoveryStorage();
    assert.ok(storage);
    assert.equal(storage.getItem(DEFAULTS_STORAGE_KEY), null);
    assert.throws(() => storage.setItem(DEFAULTS_STORAGE_KEY, ownV3));
    assert.throws(() => storage.removeItem(DEFAULTS_STORAGE_KEY));
    assert.equal(saveDefaults(storage, defaults), false);
    assert.equal(clearDefaults(storage), false);
  });

  it('propagates backend quota/access failures to the unchanged UI', () => {
    const failure = new Error('QuotaExceededError');
    const backend: StorageLike = {
      getItem: () => { throw failure; },
      setItem: () => { throw failure; },
      removeItem: () => { throw new Error('Backend removal must never be used'); }
    };
    const storage = createRecoveryStorage(backend);
    assert.throws(() => storage.getItem(DEFAULTS_STORAGE_KEY), error => error === failure);
    assert.throws(() => storage.setItem(DEFAULTS_STORAGE_KEY, ownV3), error => error === failure);
    assert.throws(() => storage.removeItem(DEFAULTS_STORAGE_KEY), error => error === failure);
    assert.equal(saveDefaults(storage, defaults), false);
    assert.equal(clearDefaults(storage), false);
  });

  it('can be constructed without a DOM and never exposes an undefined adapter', context => {
    browserWindow(context, undefined);
    const storage = createBrowserRecoveryStorage();
    assert.ok(storage);
    assert.equal(storage.getItem(DEFAULTS_STORAGE_KEY), null);
    assert.equal(saveDefaults(storage, defaults), false);
    assert.equal(clearDefaults(storage), false);
  });

  it('defers and catches a blocked localStorage getter', context => {
    let accesses = 0;
    browserWindow(context, {
      get localStorage(): never {
        accesses += 1;
        throw new Error('SecurityError');
      }
    });
    const storage = createBrowserRecoveryStorage();
    assert.equal(accesses, 0);
    assert.ok(storage);
    assert.equal(storage.getItem(DEFAULTS_STORAGE_KEY), null);
    assert.equal(saveDefaults(storage, defaults), false);
    assert.equal(clearDefaults(storage), false);
    assert.equal(accesses, 3);
  });

  it('uses the guarded browser backend once it becomes available', context => {
    const backend = new MemoryStorage();
    backend.values.set(SHARED_DEFAULTS_STORAGE_KEY, sharedV4);
    let enabled = false;
    browserWindow(context, {
      get localStorage(): StorageLike {
        if (!enabled) throw new Error('SecurityError');
        return backend;
      }
    });
    const storage = createBrowserRecoveryStorage();
    assert.equal(saveDefaults(storage, defaults), false);
    enabled = true;
    assert.equal(saveDefaults(storage, defaults), true);
    assert.equal(backend.values.get(SHARED_DEFAULTS_STORAGE_KEY), sharedV4);
    assert.equal(clearDefaults(storage), true);
    assert.equal(createBrowserRecoveryStorage().getItem(DEFAULTS_STORAGE_KEY), null);
  });
});
