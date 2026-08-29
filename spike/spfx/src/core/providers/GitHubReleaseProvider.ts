// SPDX-License-Identifier: AGPL-3.0-only

import { joinUrl } from '../path';
import type { IReleaseProvider } from '../types';

export class GitHubReleaseProvider implements IReleaseProvider {
  public readonly id: string;
  public readonly kind = 'github' as const;

  public constructor(private readonly baseUrl: string) {
    this.id = `github:${baseUrl}`;
  }

  public async fetchBytes(relativePath: string): Promise<Uint8Array> {
    const url = joinUrl(this.baseUrl, relativePath);
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
