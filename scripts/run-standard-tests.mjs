// SPDX-License-Identifier: AGPL-3.0-only
// Explicit test scopes. Missing private files never silently turn into skips.
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const privateMvp05Suites = Object.freeze([
  'tests/governance/mvp05-source-approval.test.mjs',
  'tests/governance/mvp05-source-coverage.test.mjs'
]);
export const privateMvp06Suites = Object.freeze([
  'tests/core/mvp06-release-promotion.test.ts',
  'tests/governance/mvp06-preparation.test.mjs',
  'tests/governance/mvp06-source-coverage.test.mjs',
  'tests/governance/mvp06-source-approval.test.mjs',
  'tests/governance/mvp06-source-adoption.test.mjs'
]);
export const privateMvp07Suites = Object.freeze([
  'tests/governance/mvp07-preparation.test.mjs',
  'tests/governance/mvp07-source-coverage.test.mjs',
  'tests/governance/mvp07-source-approval.test.mjs',
  'tests/governance/mvp07-source-adoption.test.mjs',
  'tests/governance/mvp07-promotion-safety.test.mjs'
]);
export const privateMvp08Suites = Object.freeze([
  'tests/governance/mvp08-source-inventory.test.mjs',
  'tests/governance/mvp08-source-coverage.test.mjs',
  'tests/governance/mvp08-source-approval.test.mjs',
  'tests/governance/mvp08-recovery.test.mjs'
]);
export function selectStandardSuites(paths) {
  return paths.filter(path => !privateMvp05Suites.includes(path) && !privateMvp06Suites.includes(path) && !privateMvp07Suites.includes(path)
    && !privateMvp08Suites.includes(path));
}
const root = fileURLToPath(new URL('../', import.meta.url));
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const scope = process.argv[2];
  assert.equal(process.argv.length, 3);
  assert.ok(['product', 'governance', 'private-mvp05', 'private-mvp06', 'private-mvp07', 'private-mvp08'].includes(scope), 'Select an explicit test scope');
  const directories = scope === 'product' ? ['tests/core', 'tests/ui'] : ['tests/governance'];
  const paths = scope === 'private-mvp05' ? privateMvp05Suites : scope === 'private-mvp06' ? privateMvp06Suites : scope === 'private-mvp07' ? privateMvp07Suites
    : scope === 'private-mvp08' ? privateMvp08Suites : selectStandardSuites((await Promise.all(
    directories.map(async directory => (await readdir(resolve(root, directory)))
      .filter(name => /\.test\.(?:tsx?|mjs)$/.test(name)).sort().map(name => `${directory}/${name}`)))).flat());
  assert.ok(paths.length, 'Empty test scope');
  console.log(`Test scope: ${scope}. ${paths.length} suites. Private MVP05/MVP06/MVP07/MVP08 audits are explicit separate commands.`);
  const result = spawnSync(process.execPath, ['--import', 'tsx', '--test', ...paths], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
