// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic review rows test bookkeeping, not substantive law or approval.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { mkdtemp, mkdir, readFile, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCoverage, validateEvidence, validateNewNormBridges, safeEvidencePath, writeReport, encode, hash,
  inventoryPath, inventoryHash, candidatePath, candidateHash, resultPath } from '../../scripts/consolidate-mvp08-sources.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const inventory = JSON.parse(fs.readFileSync(resolve(root, inventoryPath)));
const prior = JSON.parse(fs.readFileSync(resolve(root, 'outputs/release-mvp07-2026-10-08/source-review-completeness.json')));
const sample = Buffer.from('Synthetic evidence for structure tests only.');
const descriptor = { path: 'outputs/synthetic.json', sha256: hash(sample), byteLength: sample.length };
function fixtures() {
  const sets = {
    baseline: prior.coverage.filter(row => row.reviewGroup === 'baseline').map(row => row.sourceId),
    calendar: prior.coverage.filter(row => ['activation', 'catalog'].includes(row.reviewGroup)).map(row => row.sourceId),
    administrative: inventory.groups.newAdministrativeAP23B
  };
  return Object.fromEntries(Object.entries(sets).map(([name, ids]) => [name, {
    recordStatus: 'candidate', checkedOn: '2026-10-15', candidateReleaseId: inventory.candidateReleaseId,
    candidateManifest: { path: candidatePath, sha256: candidateHash }, inputInventory: { path: inventoryPath, sha256: inventoryHash },
    humanApproval: false, sourceReleaseApproved: false, dataPromotionApproved: false, publicationApproved: false,
    sourceIds: ids,
    rows: ids.map(sourceId => ({ sourceId,
      outcome: sourceId === 'SRC-AI-RUHETAGE-LISTE-2026' ? 'unclear' : 'unchanged',
      outcomeScope: 'Synthetic bounded proposition, not an actual legal finding.', method: 'synthetic test only',
      rationale: 'Synthetic per-source rationale for schema tests, not a source assessment.',
      relevantProvisions: ['Synthetic specific provision'], versionFinding: 'Synthetic version finding for structure tests only.',
      followUp: 'Keep the existing boundary for this synthetic fixture.',
      reusedEvidence: [{ ...descriptor, originalCheckedOn: '2026-10-08', scope: 'Original limited proposition and unchanged use.' }],
      freshEvidence: [{ ...descriptor, url: 'https://example.invalid/evidence', retrievedAt: '2026-10-15T12:00:00Z', method: 'Synthetic retrieval marker only.' }]
    }))
  }]));
}

test('exact 243 sources, three bounded groups, false permissions and preserved uncertainty', () => {
  const rows = validateCoverage(inventory, fixtures(), prior);
  assert.equal(rows.length, 243);
  assert.equal(rows.filter(row => row.reviewGroup === 'administrative').length, 11);
  assert.equal(rows.find(row => row.sourceId === 'SRC-AP22-FR-PRAXIS').positiveOrSharedEdges, 0);
});
const mutations = {
  'missing source': r => r.baseline.rows.pop(),
  'duplicate source': r => r.baseline.rows.push(r.baseline.rows[0]),
  'foreign source': r => { r.baseline.rows[0].sourceId = 'NOT-A-SOURCE'; },
  'wrong group': r => { [r.baseline.rows[0], r.calendar.rows[0]] = [r.calendar.rows[0], r.baseline.rows[0]]; },
  'wrong inventory': r => { r.baseline.inputInventory.sha256 = '0'.repeat(64); },
  'wrong candidate': r => { r.baseline.candidateManifest.sha256 = '0'.repeat(64); },
  'forged human approval': r => { r.baseline.humanApproval = true; },
  'forged row promotion': r => { r.baseline.rows[0].dataPromotionApproved = true; },
  'empty rationale': r => { r.baseline.rows[0].rationale = ''; },
  'empty version finding': r => { r.baseline.rows[0].versionFinding = {}; },
  'missing provisions': r => { r.baseline.rows[0].relevantProvisions = []; },
  'unbound assertion': r => { r.baseline.rows[0].freshEvidence = []; r.baseline.rows[0].reusedEvidence = []; },
  'redated historical evidence': r => { r.baseline.rows[0].reusedEvidence[0].originalCheckedOn = '2026-10-15'; },
  'historical retrieval called fresh': r => { r.baseline.rows[0].freshEvidence[0].retrievedAt = '2026-10-08T12:00:00Z'; },
  'changed finding without follow-up': r => { r.baseline.rows[0].outcome = 'changed'; delete r.baseline.rows[0].followUp; },
  'AI conflict removed': r => { r.calendar.rows.find(row => row.sourceId === 'SRC-AI-RUHETAGE-LISTE-2026').outcome = 'unchanged'; }
};
for (const [name, mutate] of Object.entries(mutations)) test(`reject ${name}`, () => {
  const review = fixtures(); mutate(review); assert.throws(() => validateCoverage(inventory, review, prior));
});
test('refuse turning supplementary FR mirror into positive reference', () => {
  const altered = structuredClone(inventory);
  altered.rows.find(row => row.sourceId === 'SRC-AP22-FR-PRAXIS').positiveOrSharedEdges = 1;
  assert.throws(() => validateCoverage(altered, fixtures(), prior));
});
test('valid evidence hashes and bytes deduplicate consistently', () => {
  assert.equal(validateEvidence(new Map([[descriptor.path, sample]]), [descriptor, descriptor]), 1);
});
test('reject missing, altered, wrong-length and conflicting evidence', () => {
  assert.throws(() => validateEvidence(new Map(), [descriptor]));
  assert.throws(() => validateEvidence(new Map([[descriptor.path, Buffer.from('Changed')]]), [descriptor]));
  assert.throws(() => validateEvidence(new Map([[descriptor.path, sample]]), [{ ...descriptor, byteLength: 1 }]));
  assert.throws(() => validateEvidence(new Map([[descriptor.path, sample]]), [descriptor, { ...descriptor, sha256: '0'.repeat(64) }]));
});
test('reject path escape, private or unrelated material', () => {
  for (const path of ['/etc/passwd', '../outside', 'outputs/../secret', 'outputs\\escape', 'Userinput/file',
    '.work/private/a', '.work/credential.json', 'outputs/a\u0000', 'src/core/index.ts']) assert.throws(() => safeEvidencePath(path));
});
test('report creation is exclusive, identical check idempotent, altered reports cannot overwrite', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'mvp08-coverage-test-'));
  const report = { recordStatus: 'candidate', humanApproval: false, sourceReleaseApproved: false,
    dataPromotionApproved: false, publicationApproved: false, evidence: [], testOnly: true };
  await writeReport(report, temporary);
  assert.deepEqual(await readFile(resolve(temporary, resultPath)), encode(report));
  await writeReport(report, temporary);
  await assert.rejects(writeReport({ ...report, testOnly: false }, temporary));
  await assert.rejects(writeReport({ ...report, humanApproval: true }, temporary));
});
test('writer refuses symlink directory and stale evidence', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'mvp08-coverage-symlink-'));
  const outside = await mkdtemp(resolve(tmpdir(), 'mvp08-coverage-outside-'));
  await symlink(outside, resolve(temporary, 'outputs'));
  await assert.rejects(writeReport({ recordStatus: 'candidate', evidence: [] }, temporary));
  const other = await mkdtemp(resolve(tmpdir(), 'mvp08-coverage-missing-'));
  await assert.rejects(writeReport({ recordStatus: 'candidate', evidence: [descriptor] }, other));
});

test('retain all five new amending acts, eight families, eighteen source deltas and availability boundaries', () => {
  const review = JSON.parse(fs.readFileSync(resolve(root, 'outputs/release-mvp08-2026-10-15/sources/baseline-review.json')));
  assert.deepEqual(validateNewNormBridges(review).counts, { newlyPublishedActs: 5, affectedLawFamilies: 8,
    newIntermediateVersions: 5, sourceRowsWithNormDeltas: 18, changedUsedRules: 0 });
  for (const alter of [
    r => { delete r.newNormBridges.IVV; },
    r => { r.newNormBridges.IVV.consolidatedXmlAvailableAtCheckedEndpoint = true; },
    r => { r.newNormBridges.EOG.requiredR08BBinding = ''; },
    r => { r.newNormBridges.IVV.freshVersionIndexRow.work = r.newNormBridges.UELG.work; },
    r => { r.newNormBridges.IVV.freshVersionIndexRow.end = '2099-12-31'; },
    r => { r.newNormBridges.IVV.finding = 'Unbound altered legal proposition.'; },
    r => { r.newNormBridges.EOV.humanApproval = true; },
    r => { r.rows.find(row => row.versionFinding.newNormDelta).versionFinding.newNormDelta = false; }
  ]) {
    const copy = structuredClone(review); alter(copy); assert.throws(() => validateNewNormBridges(copy));
  }
});
