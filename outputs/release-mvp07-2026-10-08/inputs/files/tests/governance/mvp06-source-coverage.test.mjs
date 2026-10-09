// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { consolidateMvp06Sources, loadMvp06SourceEvidence, validateMvp06SourceCoverage,
  validateMvp06BoundEvidence, validateMvp06Retrieval, validateMvp06OriginalBridges, validateMvp06IndexAddendum, resolveMvp06HistoricalEvidence,
  inventoryPath, inventoryHash, bridgesPath, indexAddendumPath, indexAssessmentPath } from '../../scripts/consolidate-mvp06-sources.mjs';
import { outputPath as preparationPath, historicalRoot } from '../../scripts/prepare-mvp06-inputs.mjs';

const context = await loadMvp06SourceEvidence();
const fixture = () => structuredClone(context.inputs);
const cloneFiles = () => new Map([...context.files].map(([path, bytes]) => [path, Buffer.from(bytes)]));

test('MVP06 resolves exactly 32+45 manifest sources and 82 catalog-only references without approval', async () => {
  const report = await consolidateMvp06Sources();
  assert.deepEqual(report.counts, { manifestSources: 77, freshEogReleaseRefreshSources: 6,
    sameDayReusedSources: 26, broaderPriorArticleReadingsExplicit: 5, remainingManifestSources: 45,
    holidayCatalogSources: 84, overlap: 2, reusedCatalogOnlySources: 82, distinctSources: 159,
    unchangedInModelledScope: 158, knownUnclearConflict: 1 });
  assert.equal(report.completeTechnicalSourceCoverage, true);
  assert.equal(report.allSourcesSubstantivelyConfirmed, false);
  assert.equal(report.recordStatus, 'candidate');
  assert.equal(report.humanApproval, false);
  assert.equal(report.dataPromotionApproved, false);
  assert.equal(report.productionActivation, false);
  assert.equal(report.manifestCoverage.length, 77);
  assert.equal(report.reusedCatalogCoverage.length, 82);
  assert.ok(report.reusedCatalogCoverage.every(entry => entry.reviewedOn === '2026-09-22'));
  assert.equal(report.reusedCatalogCoverage.filter(entry => entry.outcome === 'unclear').length, 1);
  assert.equal(report.preparationSnapshot.evidenceFiles, 180);
  assert.equal(report.preparationSnapshot.historicalArchives, 85);
  assert.equal(report.historicalApprovalsVerified.length, 2);
  assert.equal(report.inventoryCorrections.sourceOriginalBridges.correction.previousWholeOriginalIdentityAssumptionCorrect, false);
  assert.equal(report.inventoryCorrections.broaderVrpgIdentityBasis.length, 2);
  assert.equal(report.manifestCoverage.filter(entry => entry.inventoryAssertionCorrection).length, 4);
  assert.equal(report.inventoryCorrections.explicitWholeWorkIndex.rawNoDeltaInComparedIndexes, false);
  assert.equal(report.inventoryCorrections.explicitWholeWorkIndex.assessment.knownWindowExtensionAccountedFor, true);
});

test('MVP06 preserves the real index delta and binds its separate material-benefit assessment', () => {
  validateMvp06IndexAddendum(context.indexAddendum, context.indexAssessment, context.bridges);
  assert.equal(context.indexAddendum.scope.lawCount, 12);
  assert.equal(context.indexAddendum.noDeltaInComparedIndexes, false);
  assert.equal(context.indexAddendum.counts.impacts, 100);
  assert.equal(context.indexAssessment.result.newDeadlineRuleRequired, false);
});

for (const [name, mutate] of [
  ['lost index assessment', x => { x.assessment = {}; }],
  ['hidden raw index delta', x => { x.index.noDeltaInComparedIndexes = true; }],
  ['unassessed added index row', x => { x.index.fullWindowDeltas.impacts.added.push({ date: '2027-12-01' }); }],
  ['lost whole-work query branch', x => { x.index.indexes.find(e => e.name === 'impacts').query = 'FILTER(?target = ?work)'; }],
  ['changed assessment row', x => { x.assessment.additionalIndexRow.target += 'a'; }],
  ['invented index approval', x => { x.index.humanApproval = true; }],
  ['invented assessment runtime activation', x => { x.assessment.runtimeActivation = true; }]
]) test(`MVP06 rejects ${name}`, () => {
  const value = { index: structuredClone(context.indexAddendum), assessment: structuredClone(context.indexAssessment) };
  mutate(value);
  assert.throws(() => validateMvp06IndexAddendum(value.index, value.assessment, context.bridges));
});

test('MVP06 validates both representation bridges, including technical paragraph-ID changes', () => {
  validateMvp06OriginalBridges(context.bridges);
  const atsg = context.bridges.comparisons.find(entry => entry.law === 'ATSG');
  assert.equal(atsg.allSelectedNormTextsEqual, true);
  assert.equal(atsg.allSelectedParagraphContentAndOrderEqual, true);
  assert.equal(atsg.allSelectedParagraphStructuresAndTextsEqual, false);
  assert.equal(atsg.wholeOriginalBytesEqual, false);
  assert.equal(context.bridges.comparisons.reduce((sum, entry) => sum + entry.articleComparisons.length, 0), 21);
});

for (const [name, mutate] of [
  ['missing representation bridge', x => x.comparisons.pop()],
  ['missing ATSG57 comparison', x => { x.comparisons.find(e => e.law === 'ATSG').articleComparisons = x.comparisons.find(e => e.law === 'ATSG').articleComparisons.filter(e => e.article !== '57'); }],
  ['false whole-original identity', x => { x.comparisons[0].wholeOriginalBytesEqual = true; }],
  ['changed substantive norm text', x => { x.comparisons[0].articleComparisons[0].currentNormText += ' different'; }],
  ['changed bound original hash', x => { x.originals[0].receipt.sha256 = 'f'.repeat(64); }],
  ['lost inventory assertion correction', x => { x.correction.previousWholeOriginalIdentityAssumptionCorrect = true; }],
  ['invented bridge approval', x => { x.humanApproval = true; }]
]) test(`MVP06 rejects ${name}`, () => {
  const value = structuredClone(context.bridges); mutate(value);
  assert.throws(() => validateMvp06OriginalBridges(value));
});

for (const [name, mutate] of [
  ['missing manifest source', x => x.inventory.entries.pop()],
  ['duplicated inventory source', x => { x.inventory.entries[1].sourceId = x.inventory.entries[0].sourceId; }],
  ['missing remainder source', x => x.remainder.checks.pop()],
  ['duplicated remainder source', x => { x.remainder.checks[1].sourceId = x.remainder.checks[0].sourceId; }],
  ['cross-group duplicate', x => { x.remainder.checks[0].sourceId = x.inventory.entries.find(e => e.preparationEvidence).sourceId; }],
  ['unresolved new source finding', x => { x.remainder.checks[0].outcome = 'unclear'; }],
  ['wrong actual review day', x => { x.remainder.checks[0].checkedOn = '2026-09-28'; }],
  ['lost broader prior reading', x => { x.inventory.entries.find(e => e.preparationEvidence?.broaderArticleReuse).preparationEvidence.broaderArticleReuse = null; }],
  ['whole-file identity misrepresented as full reread', x => { x.inventory.entries.find(e => e.preparationEvidence?.broaderArticleReuse).preparationEvidence.broaderArticleReuse.freshCompleteOriginalIdentityDoesNotClaimFreshFullArticleReread = false; }],
  ['exclusion reference promoted to positive', x => { x.inventory.entries.find(e => e.sourceId === 'SRC-AP20C3-EGKUMV-BE-20220101').referenceUse = 'positive-or-shared-reference'; }],
  ['fabricated inventory approval', x => { x.inventory.humanApproval = true; }],
  ['fabricated remainder approval', x => { x.remainder.formalApproval = true; }],
  ['fabricated data promotion', x => { x.remainder.dataPromotionApproved = true; }],
  ['fabricated data promotion authorization', x => { x.remainder.dataPromotionAuthorized = true; }],
  ['fabricated production approval', x => { x.remainder.productionApproval = true; }],
  ['fabricated runtime activation', x => { x.remainder.runtimeActivation = true; }],
  ['invented current source acceptance', x => { x.inventory.status = 'approved'; }],
  ['lost AI conflict', x => { x.inventory.catalogCarryForward.knownConflict.outcome = 'unchanged'; }],
  ['falsely fresh catalog date', x => { x.inventory.catalogCarryForward.lastFullOriginalReviewOn = '2026-10-01'; }],
  ['changed holiday catalog bytes', x => { x.catalogSha256 = 'a'.repeat(64); }],
  ['changed holiday catalog source set', x => { x.catalog.data.sources[0].id = 'INVENTED'; }],
  ['missing catalog-only source', x => x.inventory.catalogCarryForward.sourceIds.pop()]
]) test(`MVP06 rejects ${name}`, () => {
  const value = fixture(); mutate(value);
  assert.throws(() => validateMvp06SourceCoverage(value));
});

test('MVP06 checks exact original/proof bytes and refuses missing evidence or conflicting hashes', () => {
  const original = context.bindings.find(entry => entry.path.startsWith('.work/'));
  assert.ok(original);
  for (const path of [original.path, bridgesPath, inventoryPath, indexAddendumPath, indexAssessmentPath]) {
    const files = cloneFiles();
    files.set(path, Buffer.concat([files.get(path), Buffer.from('\n')]));
    const expected = path === inventoryPath ? { path, sha256: inventoryHash }
      : context.bindings.find(entry => entry.path === path);
    assert.ok(expected, path);
    assert.throws(() => validateMvp06BoundEvidence(files, [expected]), /Changed source evidence/);
    files.delete(path);
    assert.throws(() => validateMvp06BoundEvidence(files, [expected]), /Missing source evidence/);
  }
  assert.throws(() => validateMvp06BoundEvidence(context.files, [{ ...original, sha256: 'f'.repeat(64) }]));
});

test('MVP06 binds receipt identity, timestamp, status, URL and raw original to the actual retrieval row', () => {
  const receipt = context.inputs.remainder.checks[0].receipt;
  const log = JSON.parse(context.files.get(receipt.fetchEvidencePath));
  validateMvp06Retrieval(receipt, log);
  for (const key of ['retrievalId', 'checkedAt', 'status', 'url', 'rawPath', 'sha256', 'byteLength', 'contentType']) {
    const altered = structuredClone(receipt);
    altered[key] = typeof altered[key] === 'number' ? altered[key] + 1 : altered[key] + '-changed';
    assert.throws(() => validateMvp06Retrieval(altered, log));
  }
  const duplicate = structuredClone(log);
  duplicate.retrievals.push(duplicate.retrievals.find(entry => entry.id === receipt.retrievalId));
  assert.throws(() => validateMvp06Retrieval(receipt, duplicate), /Ambiguous/);
});

test('MVP06 preserves provisional inventory and archived register/index resolution across future promotion', () => {
  const snapshot = JSON.parse(readFileSync(preparationPath));
  assert.equal(snapshot.evidence.length, 180);
  assert.equal(snapshot.preservation.historicalArchives.length, 85);
  assert.equal(context.inputs.inventory.completeReleaseReview, false);
  for (const path of ['data/source-reviews/source-register.json', 'data/source-reviews/index.json']) {
    const resolution = context.historicalEvidenceResolutions.find(entry => entry.path === path);
    assert.equal(resolution.resolvedPath, `${historicalRoot}/${path}`);
    assert.equal(resolveMvp06HistoricalEvidence(path, snapshot).archivedAt, resolution.resolvedPath);
    const missing = structuredClone(snapshot);
    missing.preservation.historicalArchives = missing.preservation.historicalArchives.filter(entry => entry.path !== path);
    assert.throws(() => resolveMvp06HistoricalEvidence(path, missing), /Missing historical/);
    const wrong = structuredClone(snapshot);
    wrong.preservation.historicalArchives.find(entry => entry.path === path).archivedAt = path;
    assert.throws(() => resolveMvp06HistoricalEvidence(path, wrong), /Unexpected historical/);
  }
});
