// SPDX-License-Identifier: AGPL-3.0-only
// Stage-only device-test boundary. This module is not part of the normal host.
import { getProviderCacheIdentity } from './cacheIdentity';
import { sha256 } from './ReleaseValidator';
import { IndexedDbValidatedReleaseStore } from './ValidatedReleaseStore';
import type { IReleaseProvider, IValidatedRelease, IValidatedReleaseStore } from './types';
import type { StorageLike } from '../product/ui/defaults';
import { E_TEST_CONFIG, E_TEST_TARGETS } from './ap21ETestConfig';

export function assertETestRelease(release: IValidatedRelease): void {
  if (release.releaseId !== E_TEST_CONFIG.releaseId || release.formatVersion !== E_TEST_CONFIG.formatVersion
    || release.manifestSha256 !== E_TEST_CONFIG.manifestSha256) {
    throw new Error('AP21 E-Gerätetest: Nur der exakt gebundene MVP-0.6-Datenstand ist zulässig.');
  }
}

function assertConfiguration(key: string | undefined): void {
  if (!key || !E_TEST_TARGETS.some(target => target.cacheIdentity === key)) {
    throw new Error('AP21 E-Gerätetest: Diese Site oder Datenquelle gehört nicht zum Prüfauftrag.');
  }
}

export function bindETestProvider(provider: IReleaseProvider): IReleaseProvider {
  assertConfiguration(getProviderCacheIdentity(provider));
  if (provider.kind !== 'sharepointMirror') throw new Error('AP21 E-Gerätetest: SharePoint-Mirror erforderlich.');
  return {
    id: provider.id, kind: provider.kind, cacheConfiguration: provider.cacheConfiguration,
    async fetchBytes(path: string): Promise<Uint8Array> {
      const bytes = await provider.fetchBytes(path);
      if (path === 'manifest.json' && await sha256(bytes) !== E_TEST_CONFIG.manifestSha256) {
        throw new Error('AP21 E-Gerätetest: Manifest gehört nicht zum gebundenen MVP-0.6-Stand.');
      }
      return bytes;
    }
  };
}

export class ETestStore implements IValidatedReleaseStore {
  public constructor(private readonly inner: IValidatedReleaseStore = new IndexedDbValidatedReleaseStore(E_TEST_CONFIG.databaseName)) {}

  public async activate(release: IValidatedRelease, cacheIdentity?: string): Promise<void> {
    assertConfiguration(cacheIdentity);
    assertETestRelease(release);
    await this.inner.activate(release, cacheIdentity);
  }

  public async getActive(cacheIdentity?: string): Promise<IValidatedRelease | undefined> {
    assertConfiguration(cacheIdentity);
    const release = await this.inner.getActive(cacheIdentity);
    if (release) assertETestRelease(release);
    return release;
  }
}

export function createETestStorage(storage?: StorageLike): StorageLike {
  // Always return an adapter. Returning undefined would select product storage.
  const target = (): StorageLike => {
    if (storage) return storage;
    if (typeof window === 'undefined') throw new Error('Browserstorage ist nicht verfügbar.');
    return window.localStorage;
  };
  return {
    getItem: () => target().getItem(E_TEST_CONFIG.defaultsStorageKey),
    setItem: (_key: string, value: string) => target().setItem(E_TEST_CONFIG.defaultsStorageKey, value),
    removeItem: () => target().removeItem(E_TEST_CONFIG.defaultsStorageKey)
  };
}
