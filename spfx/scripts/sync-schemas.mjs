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
  'release-manifest-v6.schema.json',
  'release-manifest-v9.schema.json',
  'administrative-procedure-catalog-v2.schema.json',
  'social-procedure-catalog.schema.json',
  'social-procedure-catalog-v2.schema.json',
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
  await writeFile(resolve(productSchemaDirectory, schemaName), source);
}

// Format 7/8 core imports keep their repository-relative schema paths. These
// copies are build inputs only, not changes to the frozen C1 contracts.
const implementationSchemas = [
  'ap22c1/release-manifest-v7.schema.json',
  'ap22c1/calendar-rules-v3.schema.json',
  'ap22c1/holiday-catalog-v2.schema.json',
  'ap22c3/local-reference-manifest-v7.schema.json',
  'ap23d1/release-manifest-v8.schema.json',
  'ap23d1/local-reference-manifest-v8.schema.json',
  'ap23d1/administrative-procedure-catalog.schema.json',
  'ap23e3/local-reference-manifest-v9.schema.json'
];
for (const name of implementationSchemas) {
  const target = resolve(productSchemaDirectory, 'implementation', name);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, await readFile(resolve(repositoryRoot, 'schemas/implementation', name)));
  if (name === 'ap22c1/release-manifest-v7.schema.json') {
    await writeFile(resolve(targetDirectory, 'release-manifest-v7.schema.json'), await readFile(target));
  }
  if (name === 'ap23d1/release-manifest-v8.schema.json') {
    await writeFile(resolve(targetDirectory, 'release-manifest-v8.schema.json'), await readFile(target));
  }
}

console.log(`Synchronisiert: ${schemaNames.length} JSON-Schemas`);
