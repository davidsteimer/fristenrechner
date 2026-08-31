// SPDX-License-Identifier: AGPL-3.0-only

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildUiPreview, outputDirectory } from './build-ui-preview.mjs';

const host = process.env.UI_PREVIEW_HOST ?? '127.0.0.1';
const port = Number(process.env.UI_PREVIEW_PORT ?? '4173');

await buildUiPreview();

const resources = new Map([
  ['/', { path: resolve(outputDirectory, 'index.html'), type: 'text/html; charset=utf-8' }],
  ['/index.html', { path: resolve(outputDirectory, 'index.html'), type: 'text/html; charset=utf-8' }],
  ['/app.js', { path: resolve(outputDirectory, 'app.js'), type: 'text/javascript; charset=utf-8' }],
  ['/app.js.map', { path: resolve(outputDirectory, 'app.js.map'), type: 'application/json; charset=utf-8' }],
  ['/app.css', { path: resolve(outputDirectory, 'app.css'), type: 'text/css; charset=utf-8' }],
  ['/app.css.map', { path: resolve(outputDirectory, 'app.css.map'), type: 'application/json; charset=utf-8' }]
]);

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${host}:${port}`);
  const resource = resources.get(url.pathname);
  if (!resource) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  try {
    const content = await readFile(resource.path);
    response.writeHead(200, {
      'content-type': resource.type,
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff'
    });
    response.end(content);
  } catch (error) {
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    response.end(error instanceof Error ? error.message : String(error));
  }
});

server.listen(port, host, () => {
  process.stdout.write(`MVP 0.2 UI preview: http://${host}:${port}\n`);
});
