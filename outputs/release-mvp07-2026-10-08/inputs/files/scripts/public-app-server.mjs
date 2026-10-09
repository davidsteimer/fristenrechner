// SPDX-License-Identifier: AGPL-3.0-only

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { buildPublicApp, publicOutputDirectory } from './build-public-app.mjs';

const host = process.env.PUBLIC_APP_HOST ?? '127.0.0.1';
const port = Number(process.env.PUBLIC_APP_PORT ?? '4180');
const basePath = '/fristenrechner/';

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8']
]);

await buildPublicApp();

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${host}:${port}`);
  if (url.pathname === '/') {
    response.writeHead(302, { location: basePath });
    response.end();
    return;
  }
  if (!url.pathname.startsWith(basePath)) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  const pathWithinApp = url.pathname.slice(basePath.length);
  const relativePath = pathWithinApp === '' ? 'index.html' : decodeURIComponent(pathWithinApp);
  const target = resolve(publicOutputDirectory, relativePath);
  const outputPrefix = `${publicOutputDirectory}${sep}`;

  if (target !== resolve(publicOutputDirectory, 'index.html') && !target.startsWith(outputPrefix)) {
    response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Bad request');
    return;
  }

  try {
    const targetStat = await stat(target);
    if (!targetStat.isFile()) {
      throw new Error('Not a file');
    }
    const content = await readFile(target);
    const extension = extname(target);
    const cacheControl = extension === '.html'
      ? 'no-cache, no-store, must-revalidate'
      : extension === '.js' || extension === '.css'
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=2592000';
    response.writeHead(200, {
      'content-type': contentTypes.get(extension) ?? 'application/octet-stream',
      'cache-control': cacheControl,
      'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'self'; manifest-src 'self'; worker-src 'none'",
      'permissions-policy': 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'SAMEORIGIN'
    });
    response.end(content);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, host, () => {
  process.stdout.write(`AP16 public candidate: http://${host}:${port}${basePath}\n`);
});
