// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import { privateMvp05Suites, privateMvp06Suites, privateMvp07Suites, privateMvp08Suites,
  selectStandardSuites } from '../../scripts/run-standard-tests.mjs';

test('only the two raw-dependent MVP05 audits move to an explicit private scope', () => {
  assert.deepEqual(privateMvp05Suites, [
    'tests/governance/mvp05-source-approval.test.mjs',
    'tests/governance/mvp05-source-coverage.test.mjs'
  ]);
  const publicPaths = ['tests/governance/mvp06-public-integrity.test.mjs',
    'tests/governance/mvp07-public-integrity.test.mjs', 'tests/governance/mvp08-public-integrity.test.mjs',
    'tests/governance/mvp08-impact-mapping.test.mjs', 'tests/governance/future-unknown.test.mjs',
    'tests/core/mvp08-promotion-delta.test.ts', 'tests/ui/ap23d3-app.test.tsx'];
  const privatePaths = [...privateMvp05Suites, ...privateMvp06Suites, ...privateMvp07Suites, ...privateMvp08Suites];
  assert.equal(new Set(privatePaths).size, privatePaths.length);
  assert.deepEqual(selectStandardSuites([...privatePaths, ...publicPaths]), publicPaths);
});
