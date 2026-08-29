// SPDX-License-Identifier: AGPL-3.0-only

import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const outputDirectory = resolve(repositoryRoot, '.work/ui-preview');

export async function buildUiPreview() {
  await mkdir(outputDirectory, { recursive: true });
  const result = await build({
    entryPoints: [resolve(repositoryRoot, 'src/ui/preview/main.tsx')],
    outfile: resolve(outputDirectory, 'app.js'),
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    sourcemap: true,
    legalComments: 'external',
    define: {
      'process.env.NODE_ENV': '"development"'
    },
    logLevel: 'info'
  });
  await copyFile(
    resolve(repositoryRoot, 'preview/index.html'),
    resolve(outputDirectory, 'index.html')
  );
  return result;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildUiPreview();
}
