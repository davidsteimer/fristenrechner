// SPDX-License-Identifier: AGPL-3.0-only

import { socialObjectSha256 } from '../product/core';
import { normalizeSharePointMirrorPath, normalizeSharePointSiteUrl } from './providers/sharePointPath';
import type { IReleaseProvider } from './types';

export type ProviderCacheConfiguration =
  | { readonly kind: 'github'; readonly baseUrl: string }
  | { readonly kind: 'sharepointMirror'; readonly siteAbsoluteUrl: string; readonly mirrorPath: string };

export function normalizeGitHubReleaseUrl(baseUrl: string): string {
  const url = new URL(baseUrl.trim());
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('Die GitHub-Basisadresse muss eine HTTPS-Adresse ohne Zugangsdaten, Abfrage oder Fragment sein.');
  }
  const pathParts = url.pathname.split('/').filter(Boolean);
  if (url.hostname !== 'raw.githubusercontent.com' || !/^[a-f0-9]{40}$/i.test(pathParts[2] ?? '')) {
    throw new Error('Der GitHub-Release muss auf raw.githubusercontent.com und einen unveränderlichen Commit gepinnt sein.');
  }
  return url.toString().replace(/\/+$/, '');
}

/** A provider label or release ID alone never identifies a data configuration. */
export function getProviderCacheIdentity(provider: IReleaseProvider): string {
  const configuration = provider.cacheConfiguration;
  if (!configuration || configuration.kind !== provider.kind) {
    throw new Error('Die Datenquelle besitzt keine eindeutig zuordenbare Cachekonfiguration.');
  }
  const normalized: ProviderCacheConfiguration = configuration.kind === 'github'
    ? { kind: 'github', baseUrl: normalizeGitHubReleaseUrl(configuration.baseUrl) }
    : {
      kind: 'sharepointMirror',
      siteAbsoluteUrl: normalizeSharePointSiteUrl(configuration.siteAbsoluteUrl),
      mirrorPath: normalizeSharePointMirrorPath(configuration.siteAbsoluteUrl, configuration.mirrorPath)
    };
  return `provider-v1:${socialObjectSha256(normalized)}`;
}
