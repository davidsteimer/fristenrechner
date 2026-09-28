// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { consolidateMvp05Sources, validateMvp05SourceCoverage } from '../../scripts/consolidate-mvp05-sources.mjs';
const read = path => JSON.parse(readFileSync(path));
const base = 'outputs/release-mvp05-2026-09-28';
const inputs = () => [
  read('data/candidates/2026-09-28-ap19c3/manifest.json'),
  read('data/candidates/2026-09-28-ap19c3/holiday-catalogs/ch-holiday-catalog.json').data.sources.map(item => item.id),
  read(`${base}/sources/ap19-source-review.json`), read(`${base}/sources/remainder/source-review.json`),
  read('outputs/release-mvp04-2026-09-22/source-approval.json')
];
test('MVP05 resolves 53 manifest sources and exactly 82 explicitly reused catalog sources without approval', async () => {
  const report = await consolidateMvp05Sources();
  assert.equal(report.counts.distinctSources, 135);
  assert.equal(report.counts.knownUnclearConflict, 1);
  assert.equal(report.humanApproval, false);
  assert.ok(report.reusedCatalogCoverage.every(item => item.reviewedOn === '2026-09-22'));
  assert.equal(report.manifestCoverage.length, 53);
});
for (const [name, mutate] of [
  ['missing source', args => args[2].entries.pop()],
  ['cross-group duplicate', args => { args[3].checks[0].sourceId = args[2].entries[0].sourceId; }],
  ['unexpected changed outcome', args => { args[3].checks[0].outcome = 'changed'; }],
  ['pretended human approval', args => { args[2].humanApproval = true; }],
  ['lost AI conflict', args => { args[4].knownConflict.sourceId = 'SRC-NONEXISTENT'; }]
]) test(`MVP05 rejects ${name}`, () => {
  const args = inputs(); mutate(args);
  assert.throws(() => validateMvp05SourceCoverage(...args));
});
