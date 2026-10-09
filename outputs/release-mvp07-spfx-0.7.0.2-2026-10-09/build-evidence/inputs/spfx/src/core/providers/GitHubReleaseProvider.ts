// SPDX-License-Identifier: AGPL-3.0-only

import { joinUrl } from '../path';
import { normalizeGitHubReleaseUrl, type ProviderCacheConfiguration } from '../cacheIdentity';
import type { IReleaseProvider } from '../types';

export class GitHubReleaseProvider implements IReleaseProvider {
  public readonly id: string;
  public readonly kind = 'github' as const;
  public readonly cacheConfiguration: ProviderCacheConfiguration;
  private readonly normalizedBaseUrl: string;

  public constructor(baseUrl: string) {
    this.normalizedBaseUrl = normalizeGitHubReleaseUrl(baseUrl);
    this.cacheConfiguration = { kind: this.kind, baseUrl: this.normalizedBaseUrl };
    this.id = `github:${this.normalizedBaseUrl}`;
  }

  public async fetchBytes(relativePath: string): Promise<Uint8Array> {
    const url = joinUrl(this.normalizedBaseUrl, relativePath);
    const response = await fetch(url, {
      cache: 'no-store',
      credentials: 'omit',
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub-Abruf fehlgeschlagen: ${response.status} ${response.statusText}`);
    }

    return new Uint8Array(await response.arrayBuffer());
  }
}
