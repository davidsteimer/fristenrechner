// SPDX-License-Identifier: AGPL-3.0-only

import { copyFile, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

import { browserGlobalsPlugin } from './browser-globals-plugin.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const outputDirectory = resolve(repositoryRoot, '.work/ui-preview');

export async function buildUiPreview() {
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });
  await mkdir(resolve(outputDirectory, 'vendor'), { recursive: true });
  await Promise.all([
    copyFile(
      resolve(repositoryRoot, 'node_modules/react/umd/react.production.min.js'),
      resolve(outputDirectory, 'vendor/react.js')
    ),
    copyFile(
      resolve(repositoryRoot, 'node_modules/react-dom/umd/react-dom.production.min.js'),
      resolve(outputDirectory, 'vendor/react-dom.js')
    ),
    copyFile(
      resolve(repositoryRoot, 'node_modules/@fluentui/react/dist/fluentui-react.min.js'),
      resolve(outputDirectory, 'vendor/fluent-ui-react.js')
    )
  ]);
  const result = await build({
    entryPoints: [resolve(repositoryRoot, 'src/ui/preview/main.tsx')],
    outfile: resolve(outputDirectory, 'app.js'),
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    sourcemap: true,
    legalComments: 'external',
    plugins: [browserGlobalsPlugin],
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
