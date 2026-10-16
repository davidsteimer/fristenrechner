// SPDX-License-Identifier: AGPL-3.0-only
// Differential verification against the exact pre-AP23D1 counting source.
// The historical implementation is loaded only in this test process.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { transform } from 'esbuild';
import { calculateDeadline } from '../src/core/calculateDeadline.ts';
import { calculationInput, loadCalculationData, loadGoldenSuite } from '../tests/core/fixtures.ts';

const baselineCommit = 'a1aca59aa7cb333cac085278db93b18ce3038eec';
const path = 'src/core/calculateDeadline.ts';
const source = execFileSync('git', ['show', `${baselineCommit}:${path}`], { encoding: 'utf8' });
const fixture = JSON.parse(await readFile('tests/golden/candidates/ap23c-administrative-contract.json', 'utf8'));
const expected = fixture.preserved.find(item => item.path === path).sha256;
assert.equal(createHash('sha256').update(source).digest('hex'), expected);
const compiled = await transform(source, { loader: 'ts', format: 'esm', target: 'es2022' });
// Retain the current shared data/date modules and their actual identity guards.
const code = compiled.code.replace(/from\s+["'](\.\/[^"']+)["']/g,
  (_, relative) => `from ${JSON.stringify(pathToFileURL(resolve('src/core', `${relative}.ts`)).href)}`);
const original = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const data = loadCalculationData();
let comparisons = 0;
const dates = ['2026-09-16', '2026-12-17', '2026-12-18', '2026-12-24', '2026-12-31',
  '2027-01-02', '2027-01-03', '2027-03-20', '2027-03-21', '2027-04-04', '2027-04-05',
  '2027-07-14', '2027-07-15', '2027-08-15', '2027-08-16', '2027-12-17', '2027-12-18',
  '2027-12-31', '2028-02-28', '2028-12-17', '2028-12-24', '2028-12-31'];
for (const reference of [...loadGoldenSuite('approved').cases, ...loadGoldenSuite('unresolved').cases]) {
  for (const inputDate of dates) for (const deadlineDays of [1, 10, 30, 365]) {
    const input = { ...calculationInput(reference), inputDate, deadlineDays };
    assert.deepEqual(calculateDeadline(input, data), original.calculateDeadline(input, data),
      `${reference.caseId}/${inputDate}/${deadlineDays}`);
    comparisons++;
  }
}
console.log(JSON.stringify({ status: 'passed', baselineCommit, baselineSourceSha256: expected,
  comparisons, scope: 'complete-legacy-results-and-traces-on-historical-AP5-data', node: process.version }, null, 2));
