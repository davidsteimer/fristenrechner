// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm, mkdir, symlink } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { inventoryPath, inventoryHash, candidateHash, reviewGroups, resultPath, assertSourceEvidencePath, validateMvp07SourceCoverage,
  validateMvp07Evidence, writeMvp07SourceCoverage, validateMvp07VersionBridges, versionBridgeBindings,
  } from '../../scripts/consolidate-mvp07-sources.mjs';
import { verifyHistoricalMvp07SourceProof } from './mvp07HistoricalSourceProof.mjs';

const inventory = JSON.parse(readFileSync(inventoryPath));
const bytes = Buffer.from('Synthetic bound source text for validator tests only.\n');
const binding = { path: '.work/mvp07-unit-source.txt', sha256: createHash('sha256').update(bytes).digest('hex') };
const fresh = { ...binding, url: 'https://example.invalid/validator-fixture', retrievedAt: '2026-10-08T19:00:00Z', method: 'synthetic-fixture-not-a-real-retrieval' };
function fixture() {
  return Object.fromEntries(Object.entries(reviewGroups).map(([name, groups]) => [name, {
    checkedOn: '2026-10-08', humanApproval: false, sourceReleaseApproved: false,
    candidateReleaseId: '2026-10-08-ap22c3-reference.1',
    candidateManifest: { path: 'outputs/ap22c3-2026-10-08/bundle/manifest.json', sha256: candidateHash },
    inputInventory: { path: inventoryPath, sha256: inventoryHash },
    rows: inventory.rows.filter(row => groups.includes(row.group)).map(row => ({
      sourceId: row.sourceId,
      outcome: row.sourceId === 'SRC-AI-RUHETAGE-LISTE-2026' ? 'unclear' : 'unchanged',
      method: 'synthetic-validation-fixture', rationale: 'Synthetic rationale, not a substantive source finding.',
      relevantProvisions: ['synthetic provision'], versionFinding: 'Synthetic version comparison.',
      reusedEvidence: [{ ...binding, originalCheckedOn: '2026-09-22', scope: 'Synthetic earlier reading for validator tests only.' }],
      freshEvidence: row.sourceId === 'SRC-AI-RUHETAGE-LISTE-2026' ? [] : [{ ...fresh }],
      ...(row.sourceId === 'SRC-AI-RUHETAGE-LISTE-2026' ? { followUp: 'Retain documented statutory treatment and known source conflict.' } : {})
    }))
  }]));
}

test('MVP07 requires exactly 77+73+82 source findings and preserves structural exclusion meaning', () => {
  const rows = validateMvp07SourceCoverage(inventory, fixture());
  assert.equal(rows.length, 232);
  assert.equal(rows.filter(row => row.reviewGroup === 'baseline').length, 77);
  assert.equal(rows.filter(row => row.reviewGroup === 'activation').length, 73);
  assert.equal(rows.filter(row => row.reviewGroup === 'catalog').length, 82);
  assert.equal(rows.filter(row => row.structuralReferenceUse === 'exclusion-only').length, 4);
  assert.equal(rows.filter(row => row.structuralReferenceUse === 'supporting-or-monitoring-unreferenced').length, 90);
});

for (const [name, alter] of [
  ['missing source', reviews => reviews.baseline.rows.pop()],
  ['duplicate source', reviews => { reviews.baseline.rows[1] = structuredClone(reviews.baseline.rows[0]); }],
  ['cross-group substitution', reviews => { reviews.catalog.rows[0].sourceId = reviews.activation.rows[0].sourceId; }],
  ['invented new source', reviews => { reviews.activation.rows[0].sourceId = 'SRC-INVENTED'; }],
  ['pending outcome', reviews => { reviews.activation.rows[0].outcome = 'pending'; }],
  ['wrong review day', reviews => { reviews.catalog.checkedOn = '2026-09-22'; }],
  ['wrong candidate identity', reviews => { reviews.baseline.candidateReleaseId = 'wrong-release'; }],
  ['wrong candidate bytes', reviews => { reviews.activation.candidateManifest.sha256 = '0'.repeat(64); }],
  ['wrong inventory bytes', reviews => { reviews.catalog.inputInventory.sha256 = '0'.repeat(64); }],
  ['conflicting alternate candidate hash', reviews => { reviews.catalog.candidatehash = '0'.repeat(64); }],
  ['conflicting camel-case inventory hash', reviews => { reviews.activation.inputHash = '0'.repeat(64); }],
  ['human approval', reviews => { reviews.baseline.humanApproval = true; }],
  ['source approval', reviews => { reviews.activation.sourceReleaseApproved = true; }],
  ['row activation', reviews => { reviews.catalog.rows[0].productionActivation = true; }],
  ['lost provisions', reviews => { reviews.activation.rows[0].relevantProvisions = []; }],
  ['empty provision entry', reviews => { reviews.activation.rows[0].relevantProvisions = ['']; }],
  ['lost version check', reviews => { reviews.activation.rows[0].versionFinding = ''; }],
  ['empty version object', reviews => { reviews.activation.rows[0].versionFinding = {}; }],
  ['empty follow-up object', reviews => { reviews.baseline.rows[0].outcome = 'changed'; reviews.baseline.rows[0].followUp = {}; }],
  ['unbound assertion', reviews => { reviews.baseline.rows[0].freshEvidence = []; reviews.baseline.rows[0].reusedEvidence = []; }],
  ['erased AI conflict', reviews => { reviews.catalog.rows.find(row => row.sourceId === 'SRC-AI-RUHETAGE-LISTE-2026').outcome = 'unchanged'; }],
  ['untreated new change', reviews => { reviews.baseline.rows[0].outcome = 'changed'; }],
  ['untreated unavailable source', reviews => { reviews.baseline.rows[0].outcome = 'unavailable'; }],
  ['false fresh retrieval date', reviews => { reviews.activation.rows[0].freshEvidence[0].retrievedAt = '2026-10-02T12:00:00Z'; }],
  ['future historical reading', reviews => { reviews.catalog.rows[0].reusedEvidence[0].originalCheckedOn = '2027-01-01'; }],
  ['unqualified reuse', reviews => { reviews.catalog.rows[0].reusedEvidence[0].scope = ''; }],
  ['source evidence path escape', reviews => { reviews.activation.rows[0].freshEvidence[0].path = '../outside'; }]
]) test(`MVP07 rejects ${name}`, () => {
  const reviews = fixture(); alter(reviews);
  assert.throws(() => validateMvp07SourceCoverage(inventory, reviews));
});

test('MVP07 accepts explicitly assessed non-unchanged outcomes without converting them to approvals', () => {
  const reviews = fixture();
  reviews.baseline.rows[0].outcome = 'changed';
  reviews.baseline.rows[0].followUp = 'Assess new version and preserve the raw difference before any promotion.';
  const result = validateMvp07SourceCoverage(inventory, reviews);
  assert.equal(result.find(row => row.sourceId === reviews.baseline.rows[0].sourceId).outcome, 'changed');
  assert.equal(reviews.baseline.humanApproval, false);
});

test('MVP07 distinguishes explicit historical reuse from a fresh evidence reference', () => {
  const reviews = fixture();
  reviews.catalog.rows[0].freshEvidence = [];
  const result = validateMvp07SourceCoverage(inventory, reviews);
  const row = result.find(row => row.sourceId === reviews.catalog.rows[0].sourceId);
  assert.equal(row.freshEvidence.length, 0);
  assert.equal(row.reusedEvidence[0].originalCheckedOn, '2026-09-22');
});

test('MVP07 binds all evidence bytes and rejects missing files, wrong size, altered text and hash conflict', () => {
  const files = new Map([[binding.path, bytes]]);
  assert.equal(validateMvp07Evidence(files, [binding, binding]), 1);
  assert.throws(() => validateMvp07Evidence(new Map(), [binding]));
  assert.throws(() => validateMvp07Evidence(files, [{ ...binding, byteLength: bytes.length + 1 }]));
  assert.throws(() => validateMvp07Evidence(new Map([[binding.path, Buffer.concat([bytes, Buffer.from('changed')])]]), [binding]));
  assert.throws(() => validateMvp07Evidence(files, [binding, { ...binding, sha256: 'a'.repeat(64) }]));
});

test('MVP07 refuses unrelated or redirected evidence paths', () => {
  for (const path of ['/etc/passwd', '../outside', 'outputs/../outside', 'outputs//file', '.git/config',
    '.work/private/secret.json', 'Userinput/person.docx', '.work/credentials.txt', '.work/file\nname']) {
    assert.throws(() => assertSourceEvidencePath(path));
  }
});

test('MVP07 source-review writer preserves an existing different report and allows exact verification', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'mvp07-source-coverage-'));
  try {
    const report = { recordStatus: 'candidate', humanApproval: false, fixture: true };
    await writeMvp07SourceCoverage(report, folder);
    const before = await readFile(join(folder, resultPath));
    await writeMvp07SourceCoverage(report, folder);
    await assert.rejects(writeMvp07SourceCoverage({ ...report, fixture: false }, folder), /differs/);
    assert.ok((await readFile(join(folder, resultPath))).equals(before));
    await assert.rejects(writeMvp07SourceCoverage({ ...report, humanApproval: true }, folder));
    await assert.rejects(writeMvp07SourceCoverage({ ...report, sourceReleaseApproved: true }, folder));
    await assert.rejects(writeMvp07SourceCoverage({ ...report, productionActivation: true }, folder));
  } finally { await rm(folder, { recursive: true }); }
});

test('MVP07 source-review writer rejects symlinked output directories', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'mvp07-source-coverage-'));
  try {
    await mkdir(join(folder, 'destination'));
    await symlink(join(folder, 'destination'), join(folder, 'outputs'));
    await assert.rejects(writeMvp07SourceCoverage({ recordStatus: 'candidate', humanApproval: false }, folder), /Unsafe source review directory/);
  } finally { await rm(folder, { recursive: true }); }
});

test('MVP07 binds the two actual version changes without confusing them with calculation changes', () => {
  const proofs = versionBridgeBindings.map(binding => {
    const bytes = readFileSync(binding.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), binding.sha256);
    return JSON.parse(bytes);
  });
  const events = validateMvp07VersionBridges(...proofs);
  assert.equal(events.length, 2);
  assert.ok(events.every(event => event.sourceVersionDelta && !event.ruleChangeRequired));
  const alteredStpo = structuredClone(proofs[0]);
  alteredStpo.StPO.deadlineArticles[0].newText += ' synthetic change';
  assert.throws(() => validateMvp07VersionBridges(alteredStpo, proofs[1]));
  const alteredLu = structuredClone(proofs[1]);
  alteredLu.ruleChangeRequired = true;
  assert.throws(() => validateMvp07VersionBridges(proofs[0], alteredLu));
});

test('MVP07 preserves the 232-row source review and its archived pre-promotion inputs and approval gates', async () => {
  const report = await verifyHistoricalMvp07SourceProof();
  assert.equal(report.counts.sourceIds, 232);
  assert.equal(report.counts.withFreshEvidence, 204);
  assert.equal(report.counts.reusedWithoutFreshEvidence, 28);
  assert.equal(report.counts.protectedFilesUnchanged, 185);
  assert.equal(report.preparationSnapshot.inputFiles, 576);
  assert.equal(report.legalChangeEvents.length, 2);
  assert.equal(report.humanApproval, false);
  assert.equal(report.sourceReleaseApproved, false);
  assert.equal(report.dataPromotionApproved, false);
  assert.equal(report.allSourcesSubstantivelyConfirmed, false);
  assert.deepEqual(report.coverage.filter(row => row.outcome === 'unclear').map(row => row.sourceId).sort(),
    ['SRC-AI-RUHETAGE-LISTE-2026', 'SRC-AP22-FR-PRAXIS']);
  assert.equal(report.coverage.find(row => row.sourceId === 'SRC-AP22-FR-PRAXIS').structuralReferenceUse,
    'supporting-or-monitoring-unreferenced');
});
