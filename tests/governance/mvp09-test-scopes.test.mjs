// SPDX-License-Identifier: AGPL-3.0-only
// Scope routing only. Does not open human decisions or private source bytes.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { privateMvp05Suites, privateMvp06Suites, privateMvp07Suites, privateMvp08Suites,
  privateMvp09Suites, privateMvp09ExecutionPlan, selectStandardSuites } from '../../scripts/run-standard-tests.mjs';

test('MVP09 private source and release evidence remains an explicit separate audit', () => {
  assert.deepEqual(privateMvp09Suites, [
    'tests/governance/mvp09-source-inventory.test.mjs',
    'tests/governance/mvp09-source-coverage.test.mjs',
    'tests/governance/mvp09-source-approval.test.mjs',
    'tests/governance/r09b-proposal.test.mjs',
    'tests/governance/mvp09-recovery.test.mjs'
  ]);
  const privatePaths = [...privateMvp05Suites, ...privateMvp06Suites, ...privateMvp07Suites,
    ...privateMvp08Suites, ...privateMvp09Suites];
  assert.equal(new Set(privatePaths).size, privatePaths.length);
  const publicPaths = ['tests/ui/mvp05-release.test.ts', 'tests/public-app/mvp08-build.test.ts',
    'tests/public-app/mvp09-build.test.ts', 'tests/governance/mvp09-test-scopes.test.mjs'];
  assert.deepEqual(selectStandardSuites([...privatePaths, ...publicPaths]), publicPaths);
});

test('unknown tests are not silently omitted or treated as private', () => {
  const paths = ['tests/governance/unclassified-new-audit.test.mjs', 'tests/ui/mvp09-new.test.ts'];
  assert.deepEqual(selectStandardSuites(paths), paths);
});

test('historical R09 source expectations run against the sealed before-adoption snapshot, not the new registry', () => {
  assert.equal(privateMvp09ExecutionPlan.historicalSnapshotRunner, 'scripts/check-mvp09-historical-source-tests.mjs');
  assert.deepEqual(privateMvp09ExecutionPlan.historicalSuites, privateMvp09Suites.slice(0, 4));
  assert.deepEqual(privateMvp09ExecutionPlan.currentSuites, ['tests/governance/mvp09-recovery.test.mjs']);
  assert.deepEqual([...privateMvp09ExecutionPlan.historicalSuites, ...privateMvp09ExecutionPlan.currentSuites], privateMvp09Suites);
});
