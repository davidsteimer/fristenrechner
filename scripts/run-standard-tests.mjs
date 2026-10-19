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
export const privateMvp09Suites = Object.freeze([
  'tests/governance/mvp09-source-inventory.test.mjs',
  'tests/governance/mvp09-source-coverage.test.mjs',
  'tests/governance/mvp09-source-approval.test.mjs',
  'tests/governance/r09b-proposal.test.mjs',
  'tests/governance/mvp09-recovery.test.mjs'
]);
export const privateMvp09ExecutionPlan = Object.freeze({
  historicalSnapshotRunner: 'scripts/check-mvp09-historical-source-tests.mjs',
  historicalSuites: Object.freeze(privateMvp09Suites.slice(0, 4)),
  currentSuites: Object.freeze(privateMvp09Suites.slice(4))
});
export function selectStandardSuites(paths) {
  return paths.filter(path => !privateMvp05Suites.includes(path) && !privateMvp06Suites.includes(path) && !privateMvp07Suites.includes(path)
    && !privateMvp08Suites.includes(path) && !privateMvp09Suites.includes(path));
}
const root = fileURLToPath(new URL('../', import.meta.url));
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const scope = process.argv[2];
  assert.equal(process.argv.length, 3);
  assert.ok(['product', 'governance', 'private-mvp05', 'private-mvp06', 'private-mvp07', 'private-mvp08', 'private-mvp09'].includes(scope), 'Select an explicit test scope');
  const directories = scope === 'product' ? ['tests/core', 'tests/ui'] : ['tests/governance'];
  const paths = scope === 'private-mvp05' ? privateMvp05Suites : scope === 'private-mvp06' ? privateMvp06Suites : scope === 'private-mvp07' ? privateMvp07Suites
    : scope === 'private-mvp08' ? privateMvp08Suites : scope === 'private-mvp09' ? privateMvp09Suites : selectStandardSuites((await Promise.all(
    directories.map(async directory => (await readdir(resolve(root, directory)))
      .filter(name => /\.test\.(?:tsx?|mjs)$/.test(name)).sort().map(name => `${directory}/${name}`)))).flat());
  assert.ok(paths.length, 'Empty test scope');
  console.log(`Test scope: ${scope}. ${paths.length} suites. Private MVP05/MVP06/MVP07/MVP08/MVP09 audits are explicit separate commands.`);
  if (scope === 'private-mvp09') {
    // R09 A1/A2 expectations belong to the sealed 247-source input snapshot.
    // Never rerun them against the adopted 255-source register or rewrite them.
    const historical = spawnSync(process.execPath, [privateMvp09ExecutionPlan.historicalSnapshotRunner],
      { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    process.stdout.write(historical.stdout ?? ''); process.stderr.write(historical.stderr ?? '');
    if (historical.error) throw historical.error;
    assert.equal(historical.status, 0, 'Historical R09 snapshot test failure');
    const proof = JSON.parse(historical.stdout.trim().split('\n').at(-1));
    assert.equal(proof.status, 'passed');
    assert.ok(proof.counts.tests > 0 && proof.counts.pass === proof.counts.tests);
    for (const key of ['fail', 'cancelled', 'skipped', 'todo']) assert.equal(proof.counts[key], 0);
    const current = spawnSync(process.execPath, ['--import', 'tsx', '--test', ...privateMvp09ExecutionPlan.currentSuites],
      { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    process.stdout.write(current.stdout ?? ''); process.stderr.write(current.stderr ?? '');
    if (current.error) throw current.error;
    assert.equal(current.status, 0, 'Current R09 private test failure');
    const counts = Object.fromEntries([...current.stdout.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)]
      .map(match => [match[1], Number(match[2])]));
    assert.ok(counts.tests > 0 && counts.pass === counts.tests);
    for (const key of ['fail', 'cancelled', 'skipped', 'todo']) assert.equal(counts[key], 0);
    console.log('# Combined explicit R09 snapshot and current private checks');
    for (const key of ['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo'])
      console.log(`# ${key} ${counts[key] + proof.counts[key]}`);
  } else {
    const result = spawnSync(process.execPath, ['--import', 'tsx', '--test', ...paths], { cwd: root, stdio: 'inherit' });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  }
}
