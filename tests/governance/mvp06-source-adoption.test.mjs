// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { root, prefix, hash, releaseId, completenessPath, approvalPath } from '../../scripts/verify-mvp06-source-approval.mjs';
import { historicalRoot } from '../../scripts/prepare-mvp06-inputs.mjs';
import { assembleMvp06SourceGovernance, prepareMvp06SourceGovernance, validateMvp06AdoptionManifest, registerPath } from '../../scripts/prepare-mvp06-source-reviews.mjs';
const json = async path => JSON.parse(await readFile(resolve(root, path)));
const manifest = await json(`data/releases/${releaseId}/manifest.json`);
const original = { oldRegister: await json(`${historicalRoot}/${registerPath}`), manifest,
  documents: await Promise.all(manifest.artifacts.map(item => json(`data/releases/${releaseId}/${item.path}`))),
  inventory: await json(`${prefix}/source-inventory.json`), completeness: await json(completenessPath), approval: await json(approvalPath) };
const fixture = () => structuredClone(original);

test('MVP06 deterministic governance adds exactly 24 records and one 77-source event', async () => {
  const first = await prepareMvp06SourceGovernance(), second = await prepareMvp06SourceGovernance();
  assert.deepEqual(first, second);
  assert.equal(first.register.sources.length, 81);
  assert.equal(first.newIds.length, 24);
  assert.equal(first.event.entries.length, 77);
  assert.equal(first.historicalEvents.size, 3);
  assert.deepEqual(first.event.entries.map(e => e.sourceId).sort(), [...manifest.sourceSummary.sourceIds].sort());
  for (const row of original.oldRegister.sources) assert.deepEqual(first.register.sources.find(item => item.sourceId === row.sourceId), row);
  assert.equal(first.register.sources.filter(row => !manifest.sourceSummary.sourceIds.includes(row.sourceId)).length, 4);
});
test('new pure exclusion sources are supporting and all four exclusion references remain negative', () => {
  const result = assembleMvp06SourceGovernance(fixture());
  assert.equal(result.exclusionOnlySourceIds.length, 4);
  for (const id of result.exclusionOnlySourceIds) {
    assert.match(result.event.entries.find(e => e.sourceId === id).evidence.finding, /keine positive operative Aktivierung/);
    if (result.newIds.includes(id)) assert.equal(result.register.sources.find(e => e.sourceId === id).usageStatus, 'supporting');
  }
  assert.equal(result.register.sources.find(e => e.sourceId === 'SRC-AP20C1-EOV-20270701').usageStatus, 'monitoring');
  assert.equal(result.register.sources.find(e => e.sourceId === 'SRC-AP20C2-FLG-20270701').usageStatus, 'monitoring');
});
test('catalog-only AI remains outside the fresh operative event and OF001 follows real source IDs', () => {
  const { event } = assembleMvp06SourceGovernance(fixture());
  assert.ok(!event.entries.some(e => e.sourceId === 'SRC-AI-RUHETAGE-LISTE-2026'));
  assert.ok(event.entries.every(e => e.reviewedOn === '2026-10-01'));
  assert.equal(event.nextAnnualReviewDue, '2027-11-15');
  assert.deepEqual(event.entries.filter(e => e.followUp.required).map(e => e.sourceId).sort(), ['SRC-BGG-20260401', 'SRC-VWVG-20220701']);
});
test('event does not repeat the rejected whole-original identity assertion', () => {
  const { event } = assembleMvp06SourceGovernance(fixture());
  for (const id of ['SRC-AP17C-ATSG-20240101', 'SRC-AP19C-ELG-20260101', 'SRC-AP20C3-ELG-20260101']) {
    const finding = event.entries.find(e => e.sourceId === id).evidence.finding;
    assert.match(finding, /Keine Byteidentität/);
    assert.match(finding, /source-original-bridges\.json/);
    assert.doesNotMatch(finding, /Complete original byte identity|identical whole-source bytes/);
  }
});
test('reject duplicate/missing manifest and coverage IDs', () => {
  const f = fixture(); f.manifest.sourceSummary.sourceIds[0] = f.manifest.sourceSummary.sourceIds[1]; assert.throws(() => assembleMvp06SourceGovernance(f));
  const g = fixture(); g.completeness.manifestCoverage.pop(); assert.throws(() => assembleMvp06SourceGovernance(g));
});
test('reject source metadata drift and positive activation of a negative reference', () => {
  const f = fixture(); const doc = f.documents.find(doc => doc.sources?.some(s => s.sourceId === 'SRC-AP20C3-UELV-20250101'));
  doc.sources.find(s => s.sourceId === 'SRC-AP20C3-UELV-20250101').title += ' changed'; assert.throws(() => assembleMvp06SourceGovernance(f), /metadata drift/);
  const g = fixture(); g.documents[0].syntheticPositiveRule = { sourceRefs: [{ sourceId: 'SRC-AP20C3-UELV-20250101', locator: 'Art. 38' }] };
  assert.throws(() => assembleMvp06SourceGovernance(g), /Reference use changed/);
});
test('reject unapproved release, stale review date, changed outcome or already adopted baseline', () => {
  const f = fixture(); f.manifest.releaseStatus = 'candidate'; assert.throws(() => assembleMvp06SourceGovernance(f));
  const g = fixture(); g.completeness.manifestCoverage[0].reviewedOn = '2026-09-30'; assert.throws(() => assembleMvp06SourceGovernance(g));
  const h = fixture(); h.completeness.manifestCoverage[0].outcome = 'changed'; assert.throws(() => assembleMvp06SourceGovernance(h));
  const j = fixture(); j.oldRegister.scope.productiveReleaseIds.push(releaseId); assert.throws(() => assembleMvp06SourceGovernance(j));
});
test('adoption binds the exact approved manifest, not a self-consistent altered descriptor set', async () => {
  const bytes = await readFile(resolve(root, `data/releases/${releaseId}/manifest.json`));
  assert.deepEqual(validateMvp06AdoptionManifest(bytes), manifest);
  const altered = structuredClone(manifest); altered.artifacts[0].sha256 = '0'.repeat(64);
  assert.throws(() => validateMvp06AdoptionManifest(Buffer.from(JSON.stringify(altered, null, 2) + '\n')), /exact approved/);
  assert.throws(() => validateMvp06AdoptionManifest(Buffer.concat([bytes, Buffer.from('\n')])), /exact approved/);
});
test('historical test preimages remain exact and the 180/85 preparation snapshot unchanged', async () => {
  const archive = await json(`${prefix}/historical-test-baseline/manifest.json`);
  for (const item of archive.entries) {
    const bytes = await readFile(resolve(root, item.archivedAt));
    assert.equal(hash(bytes), item.sha256); assert.equal(bytes.length, item.byteLength);
  }
  const bytes = await readFile(resolve(root, `${prefix}/preparation-inputs.json`));
  assert.equal(hash(bytes), 'e38f06f47f258f3a7d54359d5ca5c0c12bc37fe846f197c4194d784c0a7c585a');
  assert.equal(JSON.parse(bytes).evidence.length, 180);
  assert.deepEqual(archive.originalSnapshotUnchanged, { evidenceFiles: 180, historicalArchives: 85 });
});
