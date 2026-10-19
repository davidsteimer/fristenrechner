// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic bookkeeping tests, not legal assessments or release approvals.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { mkdtemp, readFile, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCoverage, validateEvidence, collectEvidenceDescriptors, expectedGroups, safeEvidencePath, writeReport, encode, hash,
  inventoryPath, inventoryHash, candidatePath, candidateHash, priorPrefix, resultPath } from '../../scripts/consolidate-mvp09-sources.mjs';
import { validateSealedQa } from '../../scripts/check-mvp09-source-review.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const inventory = JSON.parse(fs.readFileSync(resolve(root, inventoryPath)));
const priorReviews = Object.fromEntries(['baseline', 'calendar', 'administrative'].map(name =>
  [name, JSON.parse(fs.readFileSync(resolve(root, priorPrefix, 'sources', name + '-review.json')))]));
const groups = expectedGroups(inventory, priorReviews);
const sample = Buffer.from('Synthetic source review evidence only.');
const descriptor = { path: 'outputs/synthetic.json', sha256: hash(sample), byteLength: sample.length };
function qaFixture() {
  const report = { checkedOn: '2026-10-18', counts: { sourceIds: 251 }, acceptedSnapshot: { mode: 'synthetic' } };
  const counts = { tests: 68, pass: 68, fail: 0, skipped: 0, cancelled: 0, todo: 0 };
  const log = Object.entries(counts).map(([k, v]) => '# ' + k + ' ' + v).join('\n') + '\n';
  const qa = { verificationId: 'MVP09-R09A2-LOCAL-VERIFICATION-20261018', checkedOn: report.checkedOn,
    technicalValidationPassed: true, humanApproval: false, sourceReleaseApproved: false,
    dataPromotionApproved: false, publicationApproved: false, productDataChanged: false, deploymentPerformed: false,
    counts: report.counts, acceptedArchive: report.acceptedSnapshot,
    humanReadableReport: 'docs/fachrecht/quellenabgleich-mvp09.md', localReportLinksChecked: 7,
    bindings: [descriptor], tests: { ...counts, node: 'v22.23.2',
      logPath: 'outputs/release-mvp09-2026-10-18/source-review-tests.txt',
      command: 'node --test tests/governance/ap23e3-acceptance.test.mjs tests/governance/mvp09-source-inventory.test.mjs tests/governance/mvp09-source-coverage.test.mjs' } };
  return { report, qa, log };
}
test('sealed QA binds the exact expected files, counts and test log', () => {
  const { report, qa, log } = qaFixture();
  validateSealedQa(qa, report, [descriptor], log, 7);
});
test('sealed QA rejects empty bindings, missing files, invented counts and test claims', () => {
  for (const mutate of [q => { q.bindings = []; }, q => { q.bindings.push(descriptor); },
    q => { q.counts = { sourceIds: 250 }; }, q => { q.tests.pass = 999; },
    q => { q.tests.command = 'invented'; }, q => { q.productDataChanged = true; }]) {
    const { report, qa, log } = qaFixture(); mutate(qa);
    assert.throws(() => validateSealedQa(qa, report, [descriptor], log, 7));
  }
});
function fixtures() {
  return Object.fromEntries(Object.entries(groups).map(([name, ids]) => [name, {
    recordStatus: 'candidate', checkedOn: '2026-10-18', candidateReleaseId: inventory.candidateReleaseId,
    candidateManifest: { path: candidatePath, sha256: candidateHash },
    inputInventory: { path: inventoryPath, sha256: inventoryHash },
    humanApproval: false, sourceReleaseApproved: false, dataPromotionApproved: false, publicationApproved: false,
    sourceIds: ids,
    rows: ids.map(sourceId => ({ sourceId,
      outcome: ['SRC-AI-RUHETAGE-LISTE-2026', 'SRC-AP22-FR-PRAXIS'].includes(sourceId) ? 'unclear' : 'unchanged',
      method: 'Synthetic structure test only, no source assessment.',
      rationale: 'Synthetic bounded rationale for coverage validation only.',
      outcomeScope: 'Synthetic limited proposition, not a legal finding.',
      versionFinding: 'Synthetic version marker, not a fresh online verification.',
      newUseAssessment: 'Synthetic explicit assessment of the new reference scope only.',
      relevantProvisions: ['Synthetic relevant paragraph'],
      followUp: 'Preserve the documented boundary in this synthetic test.',
      reusedEvidence: [{ ...descriptor, originalCheckedOn: '2026-10-15',
        scope: 'Reuse of the limited prior assessment without expanding its scope.' }],
      freshEvidence: [{ ...descriptor, url: 'https://example.invalid/evidence',
        retrievedAt: '2026-10-18T12:00:00Z', method: 'Synthetic retrieval evidence for tests only.' }]
    }))
  }]));
}
test('251 sources in exact 77/155/19 groups with preserved uncertainty', () => {
  const rows = validateCoverage(inventory, fixtures(), groups);
  assert.equal(rows.length, 251);
  assert.equal(rows.filter(row => row.reviewGroup === 'administrative').length, 19);
  assert.equal(rows.find(row => row.sourceId === 'SRC-AP22-FR-PRAXIS').positiveOrSharedEdges, 0);
});
test('same-day E1 evidence can be reused explicitly without being relabelled fresh', () => {
  const f = fixtures();
  const r = f.administrative.rows.find(row => row.sourceId === 'SRC-AP23E1-LU-VRG-20210901');
  r.freshEvidence = [];
  r.reusedEvidence[0].originalCheckedOn = '2026-10-18';
  assert.equal(validateCoverage(inventory, f, groups).find(row => row.sourceId === r.sourceId).freshEvidence.length, 0);
});
const mutations = {
  'missing source': f => f.baseline.rows.pop(),
  'duplicate source': f => f.baseline.rows.push(f.baseline.rows[0]),
  'foreign source': f => { f.baseline.rows[0].sourceId = 'NOT-IN-INVENTORY'; },
  'wrong group': f => { [f.baseline.rows[0], f.calendar.rows[0]] = [f.calendar.rows[0], f.baseline.rows[0]]; },
  'extra group': f => { f.extra = f.baseline; },
  'wrong candidate': f => { f.baseline.candidateManifest.sha256 = '0'.repeat(64); },
  'wrong inventory': f => { f.baseline.inputInventory.sha256 = '0'.repeat(64); },
  'forged group human approval': f => { f.baseline.humanApproval = true; },
  'forged row operating approval': f => { f.baseline.rows[0].operatingApproval = true; },
  'empty rationale': f => { f.baseline.rows[0].rationale = ''; },
  'empty version assessment': f => { f.baseline.rows[0].versionFinding = {}; },
  'missing provisions': f => { f.baseline.rows[0].relevantProvisions = []; },
  'missing evidence': f => { f.baseline.rows[0].freshEvidence = []; f.baseline.rows[0].reusedEvidence = []; },
  'future reuse date': f => { f.baseline.rows[0].reusedEvidence[0].originalCheckedOn = '2099-01-01'; },
  'historical retrieval labelled fresh': f => { f.baseline.rows[0].freshEvidence[0].retrievedAt = '2026-10-15T10:00:00Z'; },
  'future retrieval': f => { f.baseline.rows[0].freshEvidence[0].retrievedAt = '2026-10-19T10:00:00Z'; },
  'future report and retrieval together': f => { f.baseline.checkedOn = '2099-01-01'; f.baseline.rows[0].freshEvidence[0].retrievedAt = '2099-01-01T10:00:00Z'; },
  'missing byte length': f => { delete f.baseline.rows[0].freshEvidence[0].byteLength; },
  'changed finding without follow-up': f => { f.baseline.rows[0].outcome = 'changed'; delete f.baseline.rows[0].followUp; },
  'AI conflict removed': f => { f.calendar.rows.find(row => row.sourceId === 'SRC-AI-RUHETAGE-LISTE-2026').outcome = 'unchanged'; },
  'FR limitation removed': f => { f.calendar.rows.find(row => row.sourceId === 'SRC-AP22-FR-PRAXIS').outcome = 'unchanged'; },
  'missing new source use assessment': f => { delete f.administrative.rows.find(row => row.sourceId === 'SRC-AP23E1-LU-VRG-20210901').newUseAssessment; },
  'missing changed use of existing source': f => { delete f.administrative.rows.find(row => row.sourceId === 'SRC-AP23B-CH-HOL').newUseAssessment; }
};
for (const [name, mutate] of Object.entries(mutations)) test('reject ' + name, () => {
  const f = fixtures(); mutate(f); assert.throws(() => validateCoverage(inventory, f, groups));
});
test('reject supplementary FR source promoted to a positive reference', () => {
  const inv = structuredClone(inventory);
  inv.rows.find(row => row.sourceId === 'SRC-AP22-FR-PRAXIS').positiveOrSharedEdges = 1;
  assert.throws(() => validateCoverage(inv, fixtures(), groups));
});
test('reject incomplete historical group partition', () => {
  const p = structuredClone(priorReviews);
  p.calendar.rows.pop();
  assert.throws(() => expectedGroups(inventory, p));
});
test('valid evidence deduplicates without weakening hash or length checks', () => {
  assert.equal(validateEvidence(new Map([[descriptor.path, sample]]), [descriptor, descriptor]), 1);
});
test('auxiliary and nested evidence outside source rows remain bound', () => {
  const value = { rows: [{ freshEvidence: [descriptor] }], auxiliaryEvidence: [descriptor],
    retrievalManifest: descriptor, assessment: { old: { evidence: descriptor } } };
  const descriptors = collectEvidenceDescriptors(value);
  assert.equal(descriptors.length, 4);
  assert.equal(validateEvidence(new Map([[descriptor.path, sample]]), descriptors), 1);
  assert.throws(() => validateEvidence(new Map(), descriptors));
});
test('reject missing, changed, wrong length or inconsistent evidence', () => {
  assert.throws(() => validateEvidence(new Map(), [descriptor]));
  assert.throws(() => validateEvidence(new Map([[descriptor.path, Buffer.from('changed')]]), [descriptor]));
  assert.throws(() => validateEvidence(new Map([[descriptor.path, sample]]), [{ ...descriptor, byteLength: 1 }]));
  assert.throws(() => validateEvidence(new Map([[descriptor.path, sample]]), [descriptor, { ...descriptor, sha256: '0'.repeat(64) }]));
});
test('reject unsafe or unrelated evidence locations', () => {
  for (const path of ['/etc/passwd', '../outside', 'outputs/../x', 'outputs\\x', 'outputs/a\u0000',
    'src/core/index.ts', '.git/config', 'Userinput/secret', '.work/private/file', '.work/credential.json']) {
    assert.throws(() => safeEvidencePath(path), path);
  }
});
const emptyReport = () => ({ recordStatus: 'candidate', humanApproval: false, sourceReleaseApproved: false,
  dataPromotionApproved: false, publicationApproved: false, evidence: [], testOnly: true });
test('exclusive report creation permits identical checks, never replacing changed reports', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'mvp09-source-report-'));
  const report = emptyReport();
  await writeReport(report, temporary);
  assert.deepEqual(await readFile(resolve(temporary, resultPath)), encode(report));
  await writeReport(report, temporary);
  await assert.rejects(writeReport({ ...report, testOnly: false }, temporary));
  await assert.rejects(writeReport({ ...report, humanApproval: true }, temporary));
});
test('writer rejects symlink parents and evidence changed after assessment', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'mvp09-source-symlink-'));
  const outside = await mkdtemp(resolve(tmpdir(), 'mvp09-source-outside-'));
  await symlink(outside, resolve(temporary, 'outputs'));
  await assert.rejects(writeReport(emptyReport(), temporary));
  const other = await mkdtemp(resolve(tmpdir(), 'mvp09-source-missing-'));
  await assert.rejects(writeReport({ ...emptyReport(), evidence: [descriptor] }, other));
});
