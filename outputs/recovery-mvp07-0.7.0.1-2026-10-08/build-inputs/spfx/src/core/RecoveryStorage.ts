// SPDX-License-Identifier: AGPL-3.0-only

/** Structural match for the unchanged MVP06 UI storage property. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const SHARED_DEFAULTS_STORAGE_KEY = 'fristenrechner.defaults.v1';
export const RECOVERY_DEFAULTS_STORAGE_KEY = 'fristenrechner.defaults.recovery-mvp06.v1';
export const RECOVERY_DEFAULTS_RESET_MARKER = '{"recoveryDefaultsReset":true}';

function assertDefaultsKey(key: string): void {
  if (key !== SHARED_DEFAULTS_STORAGE_KEY) {
    throw new Error('Recovery storage only accepts the UI defaults key.');
  }
}

/** Recognise legacy versions without changing or migrating their contents. */
function legacyDefaults(raw: string | null): string | null {
  if (raw === null) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
    const version = (value as Record<string, unknown>).version;
    return version === 1 || version === 2 || version === 3 ? raw : null;
  } catch {
    return null;
  }
}

function recoveryStorage(resolveBackend: () => StorageLike | undefined): StorageLike {
  function writableBackend(): StorageLike {
    const backend = resolveBackend();
    if (!backend) throw new Error('Browser storage is unavailable.');
    return backend;
  }

  return {
    getItem(key: string): string | null {
      assertDefaultsKey(key);
      const backend = resolveBackend();
      if (!backend) return null;
      const own = backend.getItem(RECOVERY_DEFAULTS_STORAGE_KEY);
      // Any own entry, including reset or invalid content, suppresses fallback.
      if (own !== null) return legacyDefaults(own);
      return legacyDefaults(backend.getItem(SHARED_DEFAULTS_STORAGE_KEY));
    },
    setItem(key: string, value: string): void {
      assertDefaultsKey(key);
      if (legacyDefaults(value) === null) {
        throw new Error('Recovery storage only accepts defaults versions 1, 2 and 3.');
      }
      // Propagate quota/access errors so the unchanged UI reports saveFailed.
      writableBackend().setItem(RECOVERY_DEFAULTS_STORAGE_KEY, value);
    },
    removeItem(key: string): void {
      assertDefaultsKey(key);
      // Persist reset without deleting originals or reviving them after reload.
      writableBackend().setItem(RECOVERY_DEFAULTS_STORAGE_KEY, RECOVERY_DEFAULTS_RESET_MARKER);
    }
  };
}

/** Always returns an adapter, including when storage is unavailable. */
export function createRecoveryStorage(backend?: StorageLike): StorageLike {
  return recoveryStorage(() => backend);
}

/** Resolve localStorage lazily because its getter can throw in browser hosts. */
export function createBrowserRecoveryStorage(): StorageLike {
  return recoveryStorage(() => {
    try {
      return typeof window === 'undefined' ? undefined : window.localStorage;
    } catch {
      return undefined;
    }
  });
}
