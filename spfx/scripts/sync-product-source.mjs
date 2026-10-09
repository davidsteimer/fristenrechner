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

// Immutable normative CH/BE projection inputs, not an alternate release or
// fallback. The shared format-7 factory verifies these bytes on use.
const baseline = 'data/releases/2026-10-01-mvp-06-approved.1/calendars';
for (const name of ['ch-federal-calendar.json', 'be-public-holidays.json']) {
  const target = resolve(projectRoot, 'src', baseline, name);
  await mkdir(dirname(target), { recursive: true });
  await cp(resolve(repositoryRoot, baseline, name), target);
}

const productStyles = await readFile(resolve(targetRoot, 'ui', 'styles.css'), 'utf8');
await writeFile(
  resolve(targetRoot, 'ui', 'styles.module.scss'),
  `:global {\n${productStyles}\n}\n`,
  'utf8'
);

console.log('Synchronisiert: Rechenkern und Rechneroberfläche');
