// SPDX-License-Identifier: AGPL-3.0-only
// Explicit test scopes. Missing private files never silently turn into skips.
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const privateMvp06Suites = Object.freeze([
  'tests/core/mvp06-release-promotion.test.ts',
  'tests/governance/mvp06-preparation.test.mjs',
  'tests/governance/mvp06-source-coverage.test.mjs',
  'tests/governance/mvp06-source-approval.test.mjs',
  'tests/governance/mvp06-source-adoption.test.mjs'
]);
export function selectStandardSuites(paths) {
  return paths.filter(path => !privateMvp06Suites.includes(path));
}
const root = fileURLToPath(new URL('../', import.meta.url));
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const scope = process.argv[2];
  assert.equal(process.argv.length, 3);
  assert.ok(['product', 'governance', 'private-mvp06'].includes(scope), 'Select an explicit test scope');
  const directories = scope === 'product' ? ['tests/core', 'tests/ui'] : ['tests/governance'];
  const paths = scope === 'private-mvp06' ? privateMvp06Suites : selectStandardSuites((await Promise.all(
    directories.map(async directory => (await readdir(resolve(root, directory)))
      .filter(name => /\.test\.(?:ts|mjs)$/.test(name)).sort().map(name => `${directory}/${name}`)))).flat());
  assert.ok(paths.length, 'Empty test scope');
  console.log(`Test scope: ${scope}. ${paths.length} suites. Private MVP06 audit is an explicit separate command.`);
  const result = spawnSync(process.execPath, ['--import', 'tsx', '--test', ...paths], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
