// SPDX-License-Identifier: AGPL-3.0-only

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(projectRoot, '..');
const targetDirectory = resolve(projectRoot, 'src', 'core', 'schemas');
const schemaNames = [
  'common.schema.json',
  'release-manifest.schema.json',
  'legal-profile.schema.json',
  'calendar.schema.json'
];

await mkdir(targetDirectory, { recursive: true });

for (const schemaName of schemaNames) {
  const source = await readFile(resolve(repositoryRoot, 'schemas', schemaName));
  await writeFile(resolve(targetDirectory, schemaName), source);
}

console.log(`Synchronisiert: ${schemaNames.length} JSON-Schemas`);
