// SPDX-License-Identifier: AGPL-3.0-only

import type { IValidatedRelease, IValidatedReleaseStore } from './types';

const RELEASE_STORE = 'releases';
const STATE_STORE = 'state';
const ACTIVE_KEY = 'active';
const BOUND_RELEASE_STORE = 'configuredReleases';

interface IBoundRelease {
  readonly cacheIdentity: string;
  readonly release: IValidatedRelease;
}

function assertCacheIdentity(cacheIdentity: string): void {
  if (!/^provider-v1:[a-f0-9]{64}$/.test(cacheIdentity)) {
    throw new Error('Ungültige konfigurierte Cacheidentität.');
  }
}

function assertCurrent(isCurrent: () => boolean): void {
  if (!isCurrent()) throw new Error('Der Ladevorgang ist nicht mehr aktuell.');
}

interface IActiveState {
  readonly key: typeof ACTIVE_KEY;
  readonly releaseId: string;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB-Anfrage fehlgeschlagen.'));
  });
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB-Transaktion fehlgeschlagen.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB-Transaktion wurde abgebrochen.'));
  });
}

export class IndexedDbValidatedReleaseStore implements IValidatedReleaseStore {
  private databasePromise?: Promise<IDBDatabase>;

  public constructor(
    private readonly databaseName = 'fristenrechner-spfx',
    private readonly indexedDb: IDBFactory = globalThis.indexedDB
  ) {}

  public async activate(
    release: IValidatedRelease,
    cacheIdentity?: string,
    isCurrent: () => boolean = () => true
  ): Promise<void> {
    assertCurrent(isCurrent);
    if (cacheIdentity !== undefined) {
      assertCacheIdentity(cacheIdentity);
      const database = await this.openDatabase();
      assertCurrent(isCurrent);
      const transaction = database.transaction(BOUND_RELEASE_STORE, 'readwrite');
      transaction.objectStore(BOUND_RELEASE_STORE).put({ cacheIdentity, release } as IBoundRelease);
      await transactionComplete(transaction);
      return;
    }
    // Legacy entries stay readable for explicit archival inspection, but are
    // never used by ReleaseService, which always supplies a configuration key.
    const database = await this.openDatabase();
    assertCurrent(isCurrent);
    const transaction = database.transaction([RELEASE_STORE, STATE_STORE], 'readwrite');

    transaction.objectStore(RELEASE_STORE).put(release);
    transaction.objectStore(STATE_STORE).put({ key: ACTIVE_KEY, releaseId: release.releaseId });

    await transactionComplete(transaction);
  }

  public async getActive(cacheIdentity?: string): Promise<IValidatedRelease | undefined> {
    if (cacheIdentity !== undefined) {
      assertCacheIdentity(cacheIdentity);
      const database = await this.openDatabase();
      const transaction = database.transaction(BOUND_RELEASE_STORE, 'readonly');
      const entry = await requestResult<IBoundRelease | undefined>(
        transaction.objectStore(BOUND_RELEASE_STORE).get(cacheIdentity)
      );
      await transactionComplete(transaction);
      if (entry && entry.cacheIdentity !== cacheIdentity) {
        throw new Error('Cacheeintrag gehört nicht zur aktuellen Datenkonfiguration.');
      }
      return entry?.release;
    }
    const database = await this.openDatabase();
    const transaction = database.transaction([RELEASE_STORE, STATE_STORE], 'readonly');
    const state = await requestResult<IActiveState | undefined>(
      transaction.objectStore(STATE_STORE).get(ACTIVE_KEY)
    );

    if (!state) {
      await transactionComplete(transaction);
      return undefined;
    }

    const release = await requestResult<IValidatedRelease | undefined>(
      transaction.objectStore(RELEASE_STORE).get(state.releaseId)
    );
    await transactionComplete(transaction);
    return release;
  }

  private openDatabase(): Promise<IDBDatabase> {
    if (!this.indexedDb) {
      return Promise.reject(new Error('IndexedDB ist in diesem Host nicht verfügbar.'));
    }

    if (!this.databasePromise) {
      let abandoned = false;
      const opening = new Promise<IDBDatabase>((resolve, reject) => {
        const request = this.indexedDb.open(this.databaseName, 2);
        const fail = (error: unknown): void => {
          abandoned = true;
          reject(error);
        };
        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains(RELEASE_STORE)) {
            database.createObjectStore(RELEASE_STORE, { keyPath: 'releaseId' });
          }
          if (!database.objectStoreNames.contains(STATE_STORE)) {
            database.createObjectStore(STATE_STORE, { keyPath: 'key' });
          }
          if (!database.objectStoreNames.contains(BOUND_RELEASE_STORE)) {
            database.createObjectStore(BOUND_RELEASE_STORE, { keyPath: 'cacheIdentity' });
          }
        };
        request.onsuccess = () => {
          const database = request.result;
          // A blocked request can succeed after its caller has already failed.
          if (abandoned) {
            database.close();
            return;
          }
          database.onversionchange = () => {
            database.close();
            if (this.databasePromise === opening) this.databasePromise = undefined;
          };
          resolve(database);
        };
        request.onerror = () => fail(request.error ?? new Error('IndexedDB konnte nicht geöffnet werden.'));
        request.onblocked = () => fail(new Error('IndexedDB-Aktualisierung ist durch eine offene Sitzung blockiert.'));
      });
      this.databasePromise = opening;
      // Retry on the same store after a transient opening failure. Do not clear
      // a newer attempt when an abandoned request finishes late.
      void opening.catch(() => {
        if (this.databasePromise === opening) this.databasePromise = undefined;
      });
    }

    return this.databasePromise;
  }
}

export class MemoryValidatedReleaseStore implements IValidatedReleaseStore {
  private active?: IValidatedRelease;
  private readonly configured = new Map<string, IValidatedRelease>();

  public async activate(
    release: IValidatedRelease,
    cacheIdentity?: string,
    isCurrent: () => boolean = () => true
  ): Promise<void> {
    assertCurrent(isCurrent);
    if (cacheIdentity !== undefined) {
      assertCacheIdentity(cacheIdentity);
      this.configured.set(cacheIdentity, release);
      return;
    }
    this.active = release;
  }

  public async getActive(cacheIdentity?: string): Promise<IValidatedRelease | undefined> {
    if (cacheIdentity !== undefined) {
      assertCacheIdentity(cacheIdentity);
      return this.configured.get(cacheIdentity);
    }
    return this.active;
  }
}
