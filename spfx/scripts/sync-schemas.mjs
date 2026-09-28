// SPDX-License-Identifier: AGPL-3.0-only

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(projectRoot, '..');
const targetDirectory = resolve(projectRoot, 'src', 'core', 'schemas');
// The byte-identical product copy resolves ../../schemas from src/product/core.
const productSchemaDirectory = resolve(projectRoot, 'src', 'schemas');
const schemaNames = [
  'common.schema.json',
  'release-manifest.schema.json',
  'release-manifest-v5.schema.json',
  'social-procedure-catalog.schema.json',
  'legal-profile.schema.json',
  'calendar.schema.json',
  'calendar-rules-v2.schema.json',
  'filing-profile.schema.json',
  'deadline-definition.schema.json',
  'special-regime-catalog-v2.schema.json',
  'special-regime-catalog-v3.schema.json',
  'holiday-catalog-v1.schema.json'
];

await mkdir(targetDirectory, { recursive: true });
await mkdir(productSchemaDirectory, { recursive: true });

for (const schemaName of schemaNames) {
  const source = await readFile(resolve(repositoryRoot, 'schemas', schemaName));
  await writeFile(resolve(targetDirectory, schemaName), source);
  if (schemaName === 'holiday-catalog-v1.schema.json') {
    await writeFile(resolve(productSchemaDirectory, schemaName), source);
  }
}

console.log(`Synchronisiert: ${schemaNames.length} JSON-Schemas`);
