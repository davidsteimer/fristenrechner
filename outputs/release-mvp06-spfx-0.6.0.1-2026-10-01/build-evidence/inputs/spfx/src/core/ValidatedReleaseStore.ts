// SPDX-License-Identifier: AGPL-3.0-only

import type { IValidatedRelease, IValidatedReleaseStore } from './types';

const RELEASE_STORE = 'releases';
const STATE_STORE = 'state';
const ACTIVE_KEY = 'active';

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

  public async activate(release: IValidatedRelease): Promise<void> {
    const database = await this.openDatabase();
    const transaction = database.transaction([RELEASE_STORE, STATE_STORE], 'readwrite');

    transaction.objectStore(RELEASE_STORE).put(release);
    transaction.objectStore(STATE_STORE).put({ key: ACTIVE_KEY, releaseId: release.releaseId });

    await transactionComplete(transaction);
  }

  public async getActive(): Promise<IValidatedRelease | undefined> {
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
      this.databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
        const request = this.indexedDb.open(this.databaseName, 1);
        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains(RELEASE_STORE)) {
            database.createObjectStore(RELEASE_STORE, { keyPath: 'releaseId' });
          }
          if (!database.objectStoreNames.contains(STATE_STORE)) {
            database.createObjectStore(STATE_STORE, { keyPath: 'key' });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('IndexedDB konnte nicht geöffnet werden.'));
        request.onblocked = () => reject(new Error('IndexedDB-Aktualisierung ist durch eine offene Sitzung blockiert.'));
      });
    }

    return this.databasePromise;
  }
}

export class MemoryValidatedReleaseStore implements IValidatedReleaseStore {
  private active?: IValidatedRelease;

  public async activate(release: IValidatedRelease): Promise<void> {
    this.active = release;
  }

  public async getActive(): Promise<IValidatedRelease | undefined> {
    return this.active;
  }
}
