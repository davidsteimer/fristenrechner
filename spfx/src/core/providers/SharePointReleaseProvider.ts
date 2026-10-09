// SPDX-License-Identifier: AGPL-3.0-only

import { SPHttpClient } from '@microsoft/sp-http';

import { assertSafeReleasePath } from '../path';
import type { ProviderCacheConfiguration } from '../cacheIdentity';
import type { IReleaseProvider } from '../types';
import { normalizeSharePointMirrorPath, normalizeSharePointSiteUrl } from './sharePointPath';

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

export class SharePointReleaseProvider implements IReleaseProvider {
  public readonly id: string;
  public readonly kind = 'sharepointMirror' as const;
  public readonly cacheConfiguration: ProviderCacheConfiguration;
  private readonly serverRelativeBasePath: string;
  private readonly siteAbsoluteUrl: string;

  public constructor(
    private readonly spHttpClient: SPHttpClient,
    siteAbsoluteUrl: string,
    configuredPath: string
  ) {
    this.siteAbsoluteUrl = normalizeSharePointSiteUrl(siteAbsoluteUrl);
    this.serverRelativeBasePath = normalizeSharePointMirrorPath(this.siteAbsoluteUrl, configuredPath);
    this.cacheConfiguration = { kind: this.kind, siteAbsoluteUrl: this.siteAbsoluteUrl, mirrorPath: this.serverRelativeBasePath };
    this.id = `sharepointMirror:${this.siteAbsoluteUrl}:${this.serverRelativeBasePath}`;
  }

  public async fetchBytes(relativePath: string): Promise<Uint8Array> {
    const path = assertSafeReleasePath(relativePath);
    const filePath = `${this.serverRelativeBasePath}/${path}`;
    const endpoint = `${this.siteAbsoluteUrl}/_api/web/GetFileByServerRelativePath(decodedUrl='${escapeODataString(filePath)}')/$value`;
    const response = await this.spHttpClient.get(endpoint, SPHttpClient.configurations.v1, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`SharePoint-Abruf fehlgeschlagen: ${response.status} ${response.statusText}`);
    }

    return new Uint8Array(await response.arrayBuffer());
  }
}
