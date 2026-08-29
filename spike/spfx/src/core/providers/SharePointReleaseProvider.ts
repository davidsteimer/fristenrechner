// SPDX-License-Identifier: AGPL-3.0-only

import { SPHttpClient } from '@microsoft/sp-http';

import { assertSafeReleasePath } from '../path';
import type { IReleaseProvider } from '../types';

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

function normalizeServerRelativePath(siteAbsoluteUrl: string, configuredPath: string): string {
  const trimmed = configuredPath.trim().replace(/\/+$/, '');

  if (!trimmed) {
    throw new Error('Der SharePoint-Mirrorpfad ist nicht konfiguriert.');
  }

  if (/^https:\/\//.test(trimmed)) {
    const configuredUrl = new URL(trimmed);
    const siteUrl = new URL(siteAbsoluteUrl);

    if (configuredUrl.origin !== siteUrl.origin) {
      throw new Error('Der SharePoint-Mirror muss im gleichen Tenant wie die aktuelle Site liegen.');
    }

    return decodeURIComponent(configuredUrl.pathname);
  }

  if (!trimmed.startsWith('/')) {
    throw new Error('Der SharePoint-Mirrorpfad muss serverrelativ oder eine HTTPS-Adresse sein.');
  }

  return trimmed;
}

export class SharePointReleaseProvider implements IReleaseProvider {
  public readonly id: string;
  public readonly kind = 'sharepointMirror' as const;
  private readonly serverRelativeBasePath: string;

  public constructor(
    private readonly spHttpClient: SPHttpClient,
    private readonly siteAbsoluteUrl: string,
    configuredPath: string
  ) {
    this.serverRelativeBasePath = normalizeServerRelativePath(siteAbsoluteUrl, configuredPath);
    this.id = `sharepointMirror:${this.serverRelativeBasePath}`;
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
