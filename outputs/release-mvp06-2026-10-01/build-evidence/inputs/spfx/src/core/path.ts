// SPDX-License-Identifier: AGPL-3.0-only

const SAFE_RELEASE_PATH = /^[a-z0-9][a-z0-9._/-]*\.json$/;

export function assertSafeReleasePath(relativePath: string): string {
  const path = relativePath.trim();

  if (
    !SAFE_RELEASE_PATH.test(path) ||
    path.startsWith('/') ||
    path.includes('..') ||
    path.includes('\\') ||
    path.includes('//')
  ) {
    throw new Error(`Unsicherer Releasepfad: ${relativePath}`);
  }

  return path;
}

export function joinUrl(baseUrl: string, relativePath: string): string {
  const path = assertSafeReleasePath(relativePath);
  const base = baseUrl.trim().replace(/\/+$/, '');

  if (!/^https:\/\//.test(base)) {
    throw new Error('Die GitHub-Basisadresse muss eine HTTPS-Adresse sein.');
  }

  return `${base}/${path.split('/').map(encodeURIComponent).join('/')}`;
}
