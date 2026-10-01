// SPDX-License-Identifier: AGPL-3.0-only

import { joinUrl } from '../path';
import type { IReleaseProvider } from '../types';

export class GitHubReleaseProvider implements IReleaseProvider {
  public readonly id: string;
  public readonly kind = 'github' as const;
  private readonly normalizedBaseUrl: string;

  public constructor(baseUrl: string) {
    const url = new URL(baseUrl.trim());
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
      throw new Error('Die GitHub-Basisadresse muss eine HTTPS-Adresse ohne Zugangsdaten, Abfrage oder Fragment sein.');
    }
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (url.hostname !== 'raw.githubusercontent.com' || !/^[a-f0-9]{40}$/i.test(pathParts[2] ?? '')) {
      throw new Error('Der GitHub-Release muss auf raw.githubusercontent.com und einen unveränderlichen Commit gepinnt sein.');
    }
    this.normalizedBaseUrl = url.toString().replace(/\/$/, '');
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
