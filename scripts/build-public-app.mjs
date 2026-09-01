// SPDX-License-Identifier: AGPL-3.0-only

import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

import { browserGlobalsPlugin } from './browser-globals-plugin.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicSourceDirectory = resolve(repositoryRoot, 'public-app');
export const publicOutputDirectory = resolve(repositoryRoot, '.work/public-app');

function absoluteOutputPath(outputPath) {
  return isAbsolute(outputPath) ? outputPath : resolve(repositoryRoot, outputPath);
}

function relativeAssetHref(outputPath) {
  return `./${relative(publicOutputDirectory, absoluteOutputPath(outputPath)).split(sep).join('/')}`;
}

async function writeVendorAsset(sourcePath, basename) {
  const content = await readFile(resolve(repositoryRoot, sourcePath));
  const hash = createHash('sha256').update(content).digest('hex').slice(0, 12);
  const relativePath = `assets/${basename}-${hash}.js`;
  await writeFile(resolve(publicOutputDirectory, relativePath), content);
  return `./${relativePath}`;
}

export async function buildPublicApp() {
  await rm(publicOutputDirectory, { recursive: true, force: true });
  await mkdir(resolve(publicOutputDirectory, 'assets'), { recursive: true });

  const [reactHref, reactDomHref, fluentUiHref] = await Promise.all([
    writeVendorAsset('node_modules/react/umd/react.production.min.js', 'react'),
    writeVendorAsset('node_modules/react-dom/umd/react-dom.production.min.js', 'react-dom'),
    writeVendorAsset('node_modules/@fluentui/react/dist/fluentui-react.min.js', 'fluent-ui-react')
  ]);

  const result = await build({
    entryPoints: {
      app: resolve(repositoryRoot, 'src/public-app/main.tsx')
    },
    outdir: publicOutputDirectory,
    entryNames: 'assets/[name]-[hash]',
    assetNames: 'assets/[name]-[hash]',
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    minify: true,
    sourcemap: false,
    metafile: true,
    legalComments: 'external',
    plugins: [browserGlobalsPlugin],
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    logLevel: 'info'
  });

  const entry = Object.entries(result.metafile.outputs)
    .find(([, metadata]) => metadata.entryPoint?.endsWith('src/public-app/main.tsx'));
  if (!entry) {
    throw new Error('Der öffentliche JavaScript-Einstieg wurde im Buildmanifest nicht gefunden.');
  }

  const [javascriptPath, entryMetadata] = entry;
  if (!entryMetadata.cssBundle) {
    throw new Error('Das öffentliche Stylesheet wurde im Buildmanifest nicht gefunden.');
  }

  const javascriptHref = relativeAssetHref(javascriptPath);
  const stylesheetHref = relativeAssetHref(entryMetadata.cssBundle);
  const template = await readFile(resolve(publicSourceDirectory, 'index.template.html'), 'utf8');
  const html = template
    .replaceAll('{{APP_JS}}', javascriptHref)
    .replaceAll('{{APP_CSS}}', stylesheetHref)
    .replaceAll('{{REACT_JS}}', reactHref)
    .replaceAll('{{REACT_DOM_JS}}', reactDomHref)
    .replaceAll('{{FLUENT_JS}}', fluentUiHref);
  if (html.includes('{{APP_')) {
    throw new Error('Nicht aufgelöster Assetplatzhalter in der öffentlichen HTML-Datei.');
  }

  await Promise.all([
    writeFile(resolve(publicOutputDirectory, 'index.html'), html, 'utf8'),
    copyFile(resolve(publicSourceDirectory, '.htaccess'), resolve(publicOutputDirectory, '.htaccess')),
    copyFile(resolve(publicSourceDirectory, 'favicon.svg'), resolve(publicOutputDirectory, 'favicon.svg')),
    mkdir(resolve(publicOutputDirectory, 'licenses'), { recursive: true }).then(() => Promise.all([
      copyFile(
        resolve(repositoryRoot, 'node_modules/react/LICENSE'),
        resolve(publicOutputDirectory, 'licenses/react-MIT.txt')
      ),
      copyFile(
        resolve(repositoryRoot, 'node_modules/react-dom/LICENSE'),
        resolve(publicOutputDirectory, 'licenses/react-dom-MIT.txt')
      ),
      copyFile(
        resolve(repositoryRoot, 'node_modules/@fluentui/react/LICENSE'),
        resolve(publicOutputDirectory, 'licenses/fluent-ui-MIT.txt')
      )
    ])),
    writeFile(
      resolve(publicOutputDirectory, 'build-manifest.json'),
      `${JSON.stringify({
        application: 'fristenrechner-public',
        version: '0.3.0',
        dataReleaseId: '2026-08-31-mvp-03-approved.1',
        canonicalUrl: 'https://www.steimer.ch/fristenrechner/',
        basePath: '/fristenrechner/',
        assets: {
          javascript: javascriptHref,
          stylesheet: stylesheetHref,
          vendors: {
            react: reactHref,
            reactDom: reactDomHref,
            fluentUiReact: fluentUiHref
          }
        }
      }, null, 2)}\n`,
      'utf8'
    )
  ]);

  return {
    javascriptHref,
    stylesheetHref,
    outputDirectory: publicOutputDirectory
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildPublicApp();
}
