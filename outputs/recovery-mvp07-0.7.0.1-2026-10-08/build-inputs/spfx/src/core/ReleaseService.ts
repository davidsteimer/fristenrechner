// SPDX-License-Identifier: AGPL-3.0-only

import { ReleaseValidator, sha256 } from './ReleaseValidator';
import { getProviderCacheIdentity } from './cacheIdentity';
import type {
  IReleaseActivationResult,
  IReleaseProvider,
  IValidatedRelease,
  IValidatedReleaseStore
} from './types';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function assertCurrent(isCurrent: () => boolean): void {
  if (!isCurrent()) throw new Error('Der Ladevorgang ist nicht mehr aktuell.');
}

export class ReleaseService {
  public constructor(
    private readonly store: IValidatedReleaseStore,
    private readonly validator = new ReleaseValidator()
  ) {}

  public async refresh(
    provider: IReleaseProvider,
    isCurrent: () => boolean = () => true
  ): Promise<IReleaseActivationResult> {
    assertCurrent(isCurrent);
    // Resolve before entering the fallback branch. An invalid or absent data
    // configuration must not revive any previous, differently configured app.
    const cacheIdentity = getProviderCacheIdentity(provider);
    try {
      const validated = await this.validator.validateProvider(provider);
      assertCurrent(isCurrent);
      // The store repeats this guard after opening IndexedDB, before writing.
      await this.store.activate(validated, cacheIdentity, isCurrent);
      assertCurrent(isCurrent);
      return {
        mode: 'network',
        providerId: provider.id,
        release: validated
      };
    } catch (error) {
      // Cancellation is not a source failure and must not initiate fallback.
      assertCurrent(isCurrent);
      let active: IValidatedRelease | undefined;
      try {
        active = await this.readValidatedCache(provider, cacheIdentity);
      } catch (cacheError) {
        assertCurrent(isCurrent);
        throw new Error(`${errorMessage(error)} Der konfigurierte Cache ist nicht verwendbar: ${errorMessage(cacheError)}`);
      }
      assertCurrent(isCurrent);
      if (!active) {
        throw error;
      }

      return {
        mode: 'fallback',
        providerId: provider.id,
        release: active,
        warning: errorMessage(error)
      };
    }
  }

  public async getActive(provider?: IReleaseProvider): Promise<IValidatedRelease | undefined> {
    if (!provider) return undefined;
    return this.readValidatedCache(provider, getProviderCacheIdentity(provider));
  }

  private async readValidatedCache(provider: IReleaseProvider, cacheIdentity: string): Promise<IValidatedRelease | undefined> {
    const cached = await this.store.getActive(cacheIdentity);
    if (!cached) return undefined;
    if (!(cached.manifestBytes instanceof Uint8Array)
      || await sha256(cached.manifestBytes) !== cached.manifestSha256) {
      throw new Error('Gespeicherte Manifestbytes stimmen nicht mit ihrer SHA-256-Prüfsumme überein.');
    }
    const files = new Map<string, Uint8Array>([['manifest.json', cached.manifestBytes]]);
    cached.artifacts.forEach(artifact => {
      const path = artifact.descriptor.path;
      if (files.has(path) || !(artifact.bytes instanceof Uint8Array)) {
        throw new Error(`Ungültiges oder doppeltes gespeichertes Artefakt: ${path}`);
      }
      files.set(path, artifact.bytes);
    });
    // Parsed objects, coverage, IDs and the old validatedAt are not trusted.
    // The same complete validator rebuilds them from persisted original bytes.
    const revalidated = await this.validator.validateProvider({
      id: provider.id,
      kind: provider.kind,
      cacheConfiguration: provider.cacheConfiguration,
      async fetchBytes(path: string): Promise<Uint8Array> {
        const bytes = files.get(path);
        if (!bytes) throw new Error(`Gespeichertes Artefakt fehlt: ${path}`);
        return bytes.slice();
      }
    });
    if (revalidated.artifacts.length !== cached.artifacts.length) {
      throw new Error('Gespeicherte Artefaktmenge widerspricht dem Manifest.');
    }
    return revalidated;
  }
}
