// SPDX-License-Identifier: AGPL-3.0-only

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(projectRoot, '..');
const targetRoot = resolve(projectRoot, 'src', 'product');
const sourceRoot = resolve(repositoryRoot, 'src');

const isProductSource = source => {
  const extension = extname(source);
  return extension === '' || extension === '.ts' || extension === '.tsx' || extension === '.css';
};

await rm(targetRoot, { recursive: true, force: true });
await mkdir(targetRoot, { recursive: true });
await cp(resolve(sourceRoot, 'core'), resolve(targetRoot, 'core'), {
  recursive: true,
  filter: isProductSource
});
await cp(resolve(sourceRoot, 'ui'), resolve(targetRoot, 'ui'), {
  recursive: true,
  filter: source => !source.includes('/preview') && isProductSource(source)
});

const productStyles = await readFile(resolve(targetRoot, 'ui', 'styles.css'), 'utf8');
await writeFile(
  resolve(targetRoot, 'ui', 'styles.module.scss'),
  `:global {\n${productStyles}\n}\n`,
  'utf8'
);

console.log('Synchronisiert: Rechenkern und Rechneroberfläche');
