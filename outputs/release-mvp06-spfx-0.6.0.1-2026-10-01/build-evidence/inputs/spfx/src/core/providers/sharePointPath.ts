// SPDX-License-Identifier: AGPL-3.0-only

export function normalizeSharePointMirrorPath(
  siteAbsoluteUrl: string,
  configuredPath: string
): string {
  const trimmed = configuredPath.trim().replace(/\/+$/, '');

  if (!trimmed) {
    throw new Error('Der SharePoint-Mirrorpfad ist nicht konfiguriert.');
  }

  const siteUrl = new URL(siteAbsoluteUrl);
  const sitePath = decodeURIComponent(siteUrl.pathname).replace(/\/+$/, '');
  let serverRelativePath: string;

  if (/^https:\/\//.test(trimmed)) {
    const configuredUrl = new URL(trimmed);
    if (
      configuredUrl.origin !== siteUrl.origin
      || configuredUrl.username
      || configuredUrl.password
      || configuredUrl.search
      || configuredUrl.hash
    ) {
      throw new Error('Der SharePoint-Mirror muss im gleichen Tenant wie die aktuelle Site liegen.');
    }
    serverRelativePath = decodeURIComponent(configuredUrl.pathname);
  } else {
    if (!trimmed.startsWith('/')) {
      throw new Error('Der SharePoint-Mirrorpfad muss serverrelativ oder eine HTTPS-Adresse sein.');
    }
    serverRelativePath = trimmed;
  }

  if (serverRelativePath.split('/').some(part => part === '.' || part === '..')) {
    throw new Error('Der SharePoint-Mirrorpfad darf keine relativen Pfadsegmente enthalten.');
  }

  const comparableSitePath = sitePath.toLocaleLowerCase('de-CH');
  const comparableMirrorPath = serverRelativePath.toLocaleLowerCase('de-CH');
  if (
    comparableSitePath
    && comparableMirrorPath !== comparableSitePath
    && !comparableMirrorPath.startsWith(`${comparableSitePath}/`)
  ) {
    throw new Error('Der SharePoint-Mirror muss für AP10 auf der aktuellen SharePoint-Website liegen.');
  }
  return serverRelativePath;
}
