// SPDX-License-Identifier: AGPL-3.0-only
// Technical coverage only. Never creates a human approval or changes live data.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, lstat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyMvp04SourceApproval } from './verify-mvp04-source-approval.mjs';
import { verifyMvp05SourceApproval } from './verify-mvp05-source-approval.mjs';
import { candidatePath, candidateHash, historicalRoot, outputPath as preparationPath,
  assertSafeEvidencePath, prepareMvp06Inputs } from './prepare-mvp06-inputs.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const prefix = 'outputs/release-mvp06-2026-10-01';
export const resultPath = `${prefix}/source-review-completeness.json`;
export const inventoryPath = `${prefix}/source-inventory.json`;
export const inventoryHash = 'f0082d7a1a6a48730cee56e03d42ad4e9490338106ae59e44a224f1eb10eef0b';
export const remainderPath = `${prefix}/sources/remainder/source-review.json`;
export const bridgesPath = `${prefix}/sources/source-original-bridges.json`;
const bridgesHash = '27e6174c8d9805b1286287689d366c59a74dc439e1641dbc7e3e4b6b2d6424bd';
export const indexAddendumPath = `${prefix}/sources/ap20-index-addendum.json`;
export const indexAssessmentPath = `${prefix}/sources/ap20-index-assessment.json`;
const indexAddendumHash = '07d8c8dceb96f70adbb635f891b9f6ed87e2b33419a594ff140dc9e1f84d5f11';
const indexAssessmentHash = '540c89aef2d1d4da528e610c3e25e534e82bf052206da6bdead68fa6ac5cfbbe';
const remainderHash = 'f0ad71ac9d6caa11f06b29ca0cb9959c0e9eed108767211e5d68b51014628109';
const previous04Path = 'outputs/release-mvp04-2026-09-22/source-approval.json';
const previous05Path = 'outputs/release-mvp05-2026-09-28/source-approval.json';
const productionPath = 'data/releases/2026-09-28-mvp-05-approved.1';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const unique = values => [...new Set(values)].sort();
const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const broaderIds = ['SRC-AP17C-ATSG-20240101', 'SRC-AP19C-ELG-20260101',
  'SRC-AP19C-ELG-20270101', 'SRC-AP17C-VRPG-BE-20260901', 'SRC-VRPG-BE-20230801'].sort();
const exclusionOnlyIds = ['JUD-AP17C-VGER-BE-200-2017-814-20180117',
  'SRC-AP20C1-EOG-20270701', 'SRC-AP20C3-EGKUMV-BE-20220101', 'SRC-AP20C3-UELV-20250101'].sort();

/** Pure validation used by production consolidation and adversarial fixtures. */
export function validateMvp06SourceCoverage({ manifest, catalog, inventory, remainder,
  previous04, previous05, catalogSha256, previousCatalogSha256 }) {
  assert.equal(manifest.releaseStatus, 'candidate');
  assert.equal(manifest.releaseId, '2026-10-01-ap20c3-candidate.1');
  assert.equal(inventory.status, 'candidate');
  assert.equal(inventory.humanApproval, false);
  assert.equal(inventory.completeReleaseReview, false, 'Historical inventory remains provisional');
  assert.equal(remainder.recordStatus, 'candidate');
  assert.equal(remainder.formalApproval, false);
  for (const document of [inventory, remainder]) for (const key of ['humanApproval', 'dataPromotionApproved', 'dataPromotionAuthorized', 'productionActivation', 'operatingApproval', 'runtimeActivation', 'productionApproval'])
    assert.ok(document[key] === undefined || document[key] === false, `Fabricated ${key}`);
  assert.equal(previous04.recordStatus, 'approved');
  assert.equal(previous04.approvedOn, '2026-09-22');
  assert.equal(previous05.recordStatus, 'approved');
  assert.equal(previous05.approvedOn, '2026-09-28');
  for (const previous of [previous04, previous05]) {
    assert.equal(previous.knownConflict.sourceId, 'SRC-AI-RUHETAGE-LISTE-2026');
    assert.equal(previous.knownConflict.treatmentUnchanged, true);
    assert.equal(previous.knownConflict.officialCorrectionClaimed, false);
  }
  const manifestIds = manifest.sourceSummary.sourceIds;
  assert.equal(manifestIds.length, 77);
  assert.equal(unique(manifestIds).length, 77);
  assert.equal(inventory.entries.length, 77);
  assert.equal(unique(inventory.entries.map(e => e.sourceId)).length, 77);
  assert.deepEqual(unique(inventory.entries.map(e => e.sourceId)), unique(manifestIds));
  assert.equal(inventory.candidateReleaseId, manifest.releaseId);
  const bound = inventory.entries.filter(entry => entry.preparationEvidence);
  assert.equal(bound.length, 32);
  assert.equal(bound.filter(entry => entry.preparationEvidence.method === 'fresh-official-original-and-targeted-article-comparison').length, 6);
  assert.equal(bound.filter(entry => entry.preparationEvidence.method === 'reused-same-day-source-control-with-exact-original-binding').length, 26);
  assert.ok(bound.every(entry => entry.preparationEvidence.checkedOn === '2026-10-01'));
  assert.deepEqual(bound.filter(entry => entry.preparationEvidence.broaderArticleReuse).map(e => e.sourceId).sort(), broaderIds,
    'Broader prior article readings must remain explicit');
  for (const entry of bound.filter(entry => entry.preparationEvidence.broaderArticleReuse)) {
    const reuse = entry.preparationEvidence.broaderArticleReuse;
    assert.equal(reuse.freshCompleteOriginalIdentityDoesNotClaimFreshFullArticleReread, true);
    assert.ok(reuse.note?.length > 40);
    assert.ok(reuse.priorAcceptedCombinedReview?.path && reuse.humanAcceptance?.path);
  }
  assert.deepEqual(inventory.entries.filter(e => e.referenceUse === 'exclusion-only').map(e => e.sourceId).sort(), exclusionOnlyIds,
    'Excluded paths are not positive runtime authority');
  assert.equal(remainder.checks.length, 45);
  const restIds = remainder.checks.map(entry => entry.sourceId);
  assert.equal(unique(restIds).length, 45);
  assert.deepEqual(unique(restIds), unique(inventory.remainingManifestSourceIds));
  assert.deepEqual(unique(restIds), unique(inventory.entries.filter(e => !e.preparationEvidence).map(e => e.sourceId)));
  const all = [...bound.map(entry => entry.sourceId), ...restIds];
  assert.equal(all.length, 77);
  assert.equal(unique(all).length, 77, 'Duplicate cross-group source');
  assert.deepEqual(unique(all), unique(manifestIds));
  for (const entry of remainder.checks) {
    assert.equal(entry.checkedOn, '2026-10-01');
    assert.equal(entry.outcome, 'unchanged', 'New unresolved source finding requires explicit treatment');
    assert.ok(entry.method && entry.finding && entry.receipt && entry.baselineEvidence);
  }
  assert.match(catalogSha256, /^[a-f0-9]{64}$/);
  assert.equal(catalogSha256, previousCatalogSha256, 'Reused holiday catalog changed');
  assert.equal(catalogSha256, inventory.catalogCarryForward.catalogArtifact.sha256);
  assert.equal(inventory.catalogCarryForward.byteidenticalToMvp05, true);
  assert.equal(inventory.catalogCarryForward.lastFullOriginalReviewOn, '2026-09-22');
  assert.equal(inventory.catalogCarryForward.acceptedReuseOn, '2026-09-28');
  assert.equal(inventory.catalogCarryForward.noFreshFullCatalogReviewClaim, true);
  assert.equal(inventory.catalogCarryForward.knownConflict.sourceId, 'SRC-AI-RUHETAGE-LISTE-2026');
  assert.equal(inventory.catalogCarryForward.knownConflict.outcome, 'unclear');
  const catalogIds = catalog.data.sources.map(entry => entry.id);
  assert.equal(catalogIds.length, 84);
  assert.equal(unique(catalogIds).length, 84);
  const catalogOnly = catalogIds.filter(id => !manifestIds.includes(id)).sort();
  assert.equal(catalogOnly.length, 82);
  assert.deepEqual(catalogOnly, [...inventory.catalogCarryForward.sourceIds].sort());
  assert.ok(catalogOnly.includes(previous04.knownConflict.sourceId));
  assert.equal(unique([...manifestIds, ...catalogIds]).length, 159);
  return { manifestSources: 77, freshEogReleaseRefreshSources: 6, sameDayReusedSources: 26,
    broaderPriorArticleReadingsExplicit: 5, remainingManifestSources: 45,
    holidayCatalogSources: 84, overlap: 2, reusedCatalogOnlySources: 82, distinctSources: 159,
    unchangedInModelledScope: 158, knownUnclearConflict: 1, catalogOnly };
}

export function validateMvp06BoundEvidence(files, bindings) {
  const seen = new Map();
  for (const entry of bindings) {
    assertSafeEvidencePath(entry.path);
    assert.match(entry.sha256, /^[a-f0-9]{64}$/);
    assert.ok(files.has(entry.path), `Missing source evidence: ${entry.path}`);
    assert.equal(digest(files.get(entry.path)), entry.sha256, `Changed source evidence: ${entry.path}`);
    if (entry.byteLength !== undefined) assert.equal(files.get(entry.path).length, entry.byteLength);
    if (seen.has(entry.path)) assert.equal(seen.get(entry.path), entry.sha256, 'Conflicting evidence hashes');
    seen.set(entry.path, entry.sha256);
  }
  return seen.size;
}

export function resolveMvp06HistoricalEvidence(path, snapshot) {
  assertSafeEvidencePath(path);
  const archive = snapshot.preservation.historicalArchives.find(entry => entry.path === path);
  if (path.startsWith('data/source-reviews/')) assert.ok(archive, `Missing historical governance mapping: ${path}`);
  if (archive) assert.equal(archive.archivedAt, `${historicalRoot}/${path}`, 'Unexpected historical resolution');
  return archive;
}

export function validateMvp06Retrieval(receipt, fetches) {
  const matches = fetches.retrievals.filter(item => item.id === receipt.retrievalId);
  assert.equal(matches.length, 1, 'Ambiguous retrieval identity');
  const actual = matches[0];
  for (const key of ['sha256', 'rawPath', 'status', 'checkedAt', 'url', 'contentType'])
    assert.equal(actual[key], receipt[key], `Receipt provenance mismatch: ${key}`);
  assert.equal(actual.bytes, receipt.byteLength);
}

export function validateMvp06OriginalBridges(bridges) {
  assert.equal(bridges.reviewId, 'MVP06-SOURCE-ORIGINAL-BRIDGES-20261001');
  assert.equal(bridges.checkedOn, '2026-10-01');
  assert.equal(bridges.recordStatus, 'candidate');
  for (const key of ['humanApproval', 'dataPromotionAuthorized', 'operatingApproval']) assert.equal(bridges[key], false);
  for (const key of ['dataPromotionApproved', 'productionActivation', 'runtimeActivation', 'productionApproval']) assert.ok(bridges[key] === undefined || bridges[key] === false);
  assert.deepEqual(bridges.errors, []);
  assert.equal(bridges.verifiedNormTextBridgeInCheckedScope, true);
  assert.equal(bridges.correction.target, inventoryPath);
  assert.equal(bridges.correction.historicInventoryRetainedUnchanged, true);
  assert.equal(bridges.correction.previousWholeOriginalIdentityAssumptionCorrect, false);
  assert.equal(bridges.originals.length, 4);
  assert.equal(bridges.comparisons.length, 2);
  const expected = {
    ELG: { versionOn: '2026-01-01', articles: ['1', '2', '3', '14', '15', '16', '21'], sourceIds: ['SRC-AP19C-ELG-20260101', 'SRC-AP20C3-ELG-20260101'] },
    ATSG: { versionOn: '2024-01-01', articles: ['2', '38', '39', '40', '41', '49', '51', '52', '55', '56', '57', '58', '60', '61'], sourceIds: ['SRC-AP17C-ATSG-20240101', 'SRC-ATSG-20240101'] }
  };
  assert.deepEqual(bridges.comparisons.map(item => item.law).sort(), Object.keys(expected).sort());
  for (const comparison of bridges.comparisons) {
    const spec = expected[comparison.law];
    assert.equal(comparison.versionOn, spec.versionOn);
    assert.deepEqual(comparison.articles, spec.articles);
    assert.deepEqual(comparison.sourceIds, spec.sourceIds);
    assert.equal(comparison.comparisonCompleted, true);
    assert.equal(comparison.boundOriginalHashesMatch, true);
    assert.equal(comparison.wholeOriginalBytesEqual, false, 'Representation bridge is not byte identity');
    assert.equal(comparison.allSelectedNormTextsEqual, true);
    assert.equal(comparison.allSelectedParagraphContentAndOrderEqual, true);
    assert.deepEqual(comparison.articleComparisons.map(item => item.article), spec.articles);
    const originals = bridges.originals.filter(item => item.law === comparison.law);
    assert.deepEqual(originals.map(item => item.side).sort(), ['AP20C3', 'MVP05']);
    for (const original of originals) {
      assert.equal(original.versionOn, spec.versionOn);
      assert.deepEqual(original.selectedArticles, spec.articles);
      assert.equal(original.boundOriginalHashMatches, true);
      assert.equal(original.receipt.httpStatus, 200);
      assert.equal(original.receipt.sha256, original.expectedSha256);
      assert.match(original.receipt.contentType, /xml/);
    }
    assert.notEqual(originals[0].expectedSha256, originals[1].expectedSha256);
    for (const article of comparison.articleComparisons) {
      assert.equal(article.normalisedNormTextEqual, true);
      assert.equal(article.oldNormText, article.currentNormText);
      assert.equal(digest(Buffer.from(article.oldNormText)), article.oldNormTextSha256);
      assert.equal(digest(Buffer.from(article.currentNormText)), article.currentNormTextSha256);
      assert.equal(article.paragraphContentAndOrderEqual, true);
      const identifiersEqual = JSON.stringify(article.oldParagraphIds) === JSON.stringify(article.currentParagraphIds);
      assert.equal(article.paragraphStructureAndTextsEqual, identifiersEqual);
      if (!identifiersEqual) assert.ok(article.xmlIdentifierDifferences.length > 0, 'Unexplained XML identifier difference');
      for (const difference of article.xmlIdentifierDifferences) {
        assert.equal(difference.normTextEqual, true);
        assert.equal(digest(Buffer.from(difference.paragraphNormText)), difference.paragraphNormTextSha256);
      }
    }
    if (comparison.law === 'ELG') {
      const paragraph = comparison.explicitParagraphComparison;
      assert.equal(paragraph.article, '21');
      assert.equal(paragraph.paragraph, '2');
      assert.equal(paragraph.normalisedNormTextEqual, true);
      assert.equal(paragraph.oldNormText, paragraph.currentNormText);
    }
  }
}

export function validateMvp06IndexAddendum(addendum, assessment, bridges) {
  assert.equal(addendum.reviewId, 'MVP06-AP20-INDEX-ADDENDUM-20261001');
  assert.equal(assessment.reviewId, 'MVP06-AP20-INDEX-WINDOW-ASSESSMENT-20261001');
  for (const document of [addendum, assessment]) {
    assert.equal(document.recordStatus, 'candidate');
    assert.equal(document.checkedOn, '2026-10-01');
    for (const key of ['formalApproval', 'humanApproval', 'runtimeActivation', 'dataPromotionApproved']) assert.equal(document[key], false);
    for (const key of ['productionApproval', 'productionActivation', 'operatingApproval', 'dataPromotionAuthorized']) assert.ok(document[key] === undefined || document[key] === false);
  }
  assert.equal(addendum.scope.from, '2026-01-01');
  assert.equal(addendum.scope.to, '2027-12-31');
  const works = ['1952/1021_1046_1050', '1952/823_843_839', '1952/896_916_912', '1993/3043_3043_3043',
    '1993/3080_3080_3080', '2002/510', '2005/187', '2007/804', '2008/51', '2008/52', '2021/373', '2021/376']
    .map(work => `https://fedlex.data.admin.ch/eli/cc/${work}`).sort();
  assert.equal(addendum.scope.lawCount, 12);
  assert.deepEqual(addendum.scope.works, works);
  for (const key of ['wholeWorkImpactsIncluded', 'subdivisionImpactsIncluded', 'optionalOpenEndedVersionIntervals', 'supportingFamZVIncluded', 'noNewManifestSourceId']) assert.equal(addendum.scope[key], true);
  assert.equal(addendum.scope.publicationYearFilter, null);
  assert.equal(addendum.scope.preselectedArticleFilter, null);
  assert.deepEqual(addendum.indexes.map(index => index.name).sort(), ['impacts', 'versions']);
  const impacts = addendum.indexes.find(index => index.name === 'impacts');
  const versions = addendum.indexes.find(index => index.name === 'versions');
  assert.match(impacts.query, /\?impact\s+jolux:impactToLegalResource\s+\?work/);
  assert.match(impacts.query, /BIND\s*\(\s*\?work\s+AS\s+\?target\s*\)/i);
  assert.match(impacts.query, /\?target\s+jolux:legalResourceSubdivisionIsPartOf\s+\?work/);
  assert.doesNotMatch(impacts.query, /UNION\s*\{\s*FILTER\s*\(\s*\?target\s*=\s*\?work/i);
  assert.match(versions.query, /!BOUND\(\?end\)/);
  assert.equal(versions.rows.length, 19);
  assert.equal(impacts.rows.length, 100);
  assert.equal(impacts.rows.filter(row => row.target === row.work).length, 0);
  assert.deepEqual(addendum.counts, { officialRequests: 2, versions: 19, impacts: 100, wholeWorkImpacts: 0,
    exactPriorGroupComparisons: 10, addedVersionRows: 0, removedVersionRows: 0, addedImpactRows: 1, removedImpactRows: 0 });
  assert.equal(addendum.comparisons.length, 10);
  assert.ok(addendum.comparisons.every(item => item.identicalInPriorWindow && item.addedRows.length === 0 && item.removedRows.length === 0));
  const delta = { work: 'https://fedlex.data.admin.ch/eli/cc/2007/804',
    impact: 'https://fedlex.data.admin.ch/eli/oc/2025/704/legal-analysis/LegalResourceImpact/5',
    date: '2026-01-01', target: 'https://fedlex.data.admin.ch/eli/cc/2007/804/art_11', source: 'https://fedlex.data.admin.ch/eli/oc/2025/704' };
  assert.deepEqual(addendum.fullWindowDeltas, { versions: { added: [], removed: [] }, impacts: { added: [delta], removed: [] } });
  assert.deepEqual(addendum.comparisons.flatMap(item => item.additionalEarlierWindowRows), [delta]);
  assert.equal(addendum.noDeltaInComparedIndexes, false, 'Preserve the actual raw index delta');
  assert.deepEqual(assessment.additionalIndexRow, delta);
  assert.equal(assessment.classification, 'already-effective-material-benefit-rule-in-existing-2026-consolidation');
  assert.deepEqual(assessment.result, { knownWindowExtensionAccountedFor: true, newFutureCommencementDetected: false,
    newDeadlineRuleRequired: false, newJurisdictionRuleRequired: false, rawIndexNoDeltaFalsePreserved: true, earlierProofsRewritten: false });
  assert.equal(assessment.reading.article, '11');
  assert.equal(assessment.reading.paragraph, '3');
  assert.equal(assessment.reading.letter, 'i');
  assert.equal(assessment.reading.outsideUsedDeadlineAndJurisdictionArticles, true);
  assert.deepEqual(assessment.originalReceipt, bridges.originals.find(item => item.law === 'ELG' && item.side === 'MVP05').receipt);
}

async function readRegular(repositoryRoot, path) {
  assertSafeEvidencePath(path);
  const parts = path.split('/');
  for (let index = 0; index < parts.length; index++) {
    const selected = parts.slice(0, index + 1).join('/');
    const stat = await lstat(resolve(repositoryRoot, selected));
    assert.ok(!stat.isSymbolicLink() && (index === parts.length - 1 ? stat.isFile() : stat.isDirectory()), `Not regular source evidence: ${selected}`);
  }
  return readFile(resolve(repositoryRoot, path));
}

/** Resolves evolving historical files from the pinned preparation snapshot only. */
export async function loadMvp06SourceEvidence(repositoryRoot = root) {
  const prepared = await prepareMvp06Inputs(repositoryRoot);
  const previousApprovals = [await verifyMvp04SourceApproval(repositoryRoot), await verifyMvp05SourceApproval(repositoryRoot)];
  const files = new Map(), resolutions = new Map(), bindings = [];
  const read = async path => {
    assertSafeEvidencePath(path);
    if (files.has(path)) return files.get(path);
    const archive = resolveMvp06HistoricalEvidence(path, prepared.snapshot);
    const bytes = prepared.files.has(path) ? prepared.files.get(path) : await readRegular(repositoryRoot, path);
    if (archive) {
      assert.equal(digest(bytes), archive.sha256);
      resolutions.set(path, { path, resolvedPath: archive.archivedAt, sha256: archive.sha256 });
    }
    files.set(path, bytes);
    return bytes;
  };
  const check = async entry => { await read(entry.path); bindings.push(entry); validateMvp06BoundEvidence(files, [entry]); };
  const json = async path => JSON.parse(await read(path));
  // Mandatory supplementary proof. The provisional inventory's two whole-file
  // identity assertions cannot be accepted without representation bridges.
  await check({ path: bridgesPath, sha256: bridgesHash });
  const bridges = await json(bridgesPath);
  validateMvp06OriginalBridges(bridges);
  for (const entry of bridges.baselineBindings) await check(entry);
  const oldSocialReview = await json('outputs/release-mvp05-2026-09-28/sources/ap19-source-review.json');
  const currentControl = await json('outputs/ap20c3-2026-10-01/quellenkontrolle.json');
  for (const comparison of bridges.comparisons) {
    const old = oldSocialReview.entries.find(entry => entry.sourceId === comparison.oldSourceId);
    const current = comparison.law === 'ELG' ? currentControl.elgCrossReference.originals.find(entry => entry.start === comparison.versionOn)
      : currentControl.federalOriginals.find(entry => entry.law === comparison.law && entry.start === comparison.versionOn);
    for (const side of ['MVP05', 'AP20C3']) {
      const original = bridges.originals.find(entry => entry.law === comparison.law && entry.side === side);
      assert.equal(original.expectedSha256, side === 'MVP05' ? old.originalSha256 : current.receipt.sha256, 'Bridge must use the exact previously bound representation');
      assert.equal(original.recordedUrl, side === 'MVP05' ? old.officialUrl : current.receipt.url);
    }
  }
  const oldRestReview = await json('outputs/release-mvp05-2026-09-28/sources/remainder/source-review.json');
  const vrpgMetadata = currentControl.bernOriginals.find(entry => entry.law === 'VRPG').metadataReceipt;
  const vrpgOriginalIdentity = ['SRC-AP17C-VRPG-BE-20260901', 'SRC-VRPG-BE-20230801'].map(sourceId => {
    const old = oldRestReview.checks.find(entry => entry.sourceId === sourceId);
    assert.equal(old.retrievedSha256, vrpgMetadata.sha256, 'Broader VRPG reuse needs the complete original API identity');
    return { sourceId, proof: 'fresh-complete-api-original-identical-to-MVP05-broader-reading',
      oldEvidencePath: 'outputs/release-mvp05-2026-09-28/sources/remainder/source-review.json',
      currentEvidencePath: 'outputs/ap20c3-2026-10-01/quellenkontrolle.json',
      completeApiSha256: vrpgMetadata.sha256, currentApiUrl: vrpgMetadata.url };
  });
  assert.equal(oldSocialReview.entries.find(entry => entry.sourceId === 'SRC-AP19C-ELG-20270101').originalSha256,
    currentControl.elgCrossReference.originals.find(entry => entry.start === '2027-01-01').receipt.sha256,
    'ELG2027 broad reuse requires actual complete-original identity');
  // This separate screen repairs the insufficient correlated FILTER arm of
  // earlier AP20 SPARQL queries. Old evidence is preserved, not rewritten.
  await check({ path: indexAddendumPath, sha256: indexAddendumHash });
  await check({ path: indexAssessmentPath, sha256: indexAssessmentHash });
  const indexAddendum = await json(indexAddendumPath), indexAssessment = await json(indexAssessmentPath);
  validateMvp06IndexAddendum(indexAddendum, indexAssessment, bridges);
  for (const document of [indexAddendum, indexAssessment]) for (const entry of document.evidenceBindings) await check(entry);
  for (const index of indexAddendum.indexes) {
    const receipt = index.receipt;
    await check({ path: receipt.rawPath, sha256: receipt.sha256, byteLength: receipt.bytes });
    assert.equal(receipt.status, 200);
    assert.equal(new URL(receipt.url).searchParams.get('query'), index.query, 'Actual query receipt differs');
    const rawRows = (await json(receipt.rawPath)).results.bindings.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value.value])));
    const stableRows = rows => rows.map(row => JSON.stringify(Object.fromEntries(Object.entries(row).sort(([a], [b]) => a.localeCompare(b))))).sort();
    assert.deepEqual(stableRows(index.rows), stableRows(rawRows), 'Index summary rows must equal the actual official response apart from row/property order');
  }
  await check({ path: inventoryPath, sha256: inventoryHash });
  await check({ path: remainderPath, sha256: remainderHash });
  await check({ path: `${candidatePath}/manifest.json`, sha256: candidateHash });
  const inventory = await json(inventoryPath), remainder = await json(remainderPath), manifest = await json(`${candidatePath}/manifest.json`);
  for (const entry of inventory.evidenceBindings) await check(entry);
  for (const entry of remainder.evidenceBindings) await check(entry);
  for (const path of ['data/source-reviews/source-register.json', 'data/source-reviews/index.json']) {
    const entry = prepared.snapshot.evidence.find(e => e.path === path);
    assert.ok(entry, 'Missing governance snapshot binding');
    await check(entry);
  }
  for (const entry of inventory.entries.filter(item => item.preparationEvidence)) {
    const evidence = entry.preparationEvidence;
    await check(evidence.evidence);
    const proof = await json(evidence.evidence.path);
    assert.equal(proof.checkedOn, evidence.checkedOn);
    assert.equal(proof.reviewId, evidence.reviewId);
    assert.equal(proof.noDeltaInCheckedScope, true);
    assert.deepEqual(proof.errors, []);
    for (const bound of proof.baselineBindings) await check(bound);
    if (evidence.broaderArticleReuse) for (const key of ['priorAcceptedCombinedReview', 'humanAcceptance']) await check(evidence.broaderArticleReuse[key]);
  }
  for (const entry of remainder.checks) {
    await check(entry.baselineEvidence);
    const receipt = entry.receipt;
    await check({ path: receipt.rawPath, sha256: receipt.sha256, byteLength: receipt.byteLength });
    assert.ok(remainder.evidenceBindings.some(item => item.path === receipt.fetchEvidencePath), 'Unbound retrieval log');
    const fetches = await json(receipt.fetchEvidencePath);
    validateMvp06Retrieval(receipt, fetches);
  }
  // Future-index, availability, supplementary-original and MCP receipts are
  // evidence too, even when they are not a one-to-one manifest-source check.
  for (const path of remainder.evidenceBindings.filter(entry => /(?:fetch-run-\d+|earlier-consolidations)\.json$/.test(entry.path)).map(entry => entry.path)) {
    for (const receipt of (await json(path)).retrievals ?? []) if (receipt.rawPath && receipt.sha256)
      await check({ path: receipt.rawPath, sha256: receipt.sha256, byteLength: receipt.bytes });
  }
  const comparison = await json(`${prefix}/sources/remainder/bounded-comparison.json`);
  await check({ path: comparison.jurisprudence.rawToolResponsePath, sha256: comparison.jurisprudence.rawToolResponseSha256 });
  const descriptor = manifest.artifacts.find(item => item.role === 'holidayCatalog');
  const catalogPath = `${candidatePath}/${descriptor.path}`, previousCatalogPath = `${productionPath}/${descriptor.path}`;
  await check({ path: catalogPath, sha256: descriptor.sha256 });
  await check(inventory.catalogCarryForward.catalogArtifact);
  const inputs = { manifest, inventory, remainder, catalog: await json(catalogPath),
    previous04: await json(previous04Path), previous05: await json(previous05Path),
    catalogSha256: digest(await read(catalogPath)), previousCatalogSha256: digest(await read(previousCatalogPath)) };
  for (const path of [remainderPath, previous04Path, previous05Path, preparationPath, previousCatalogPath]) await read(path);
  validateMvp06BoundEvidence(files, bindings);
  bindings.push({ path: bridgesPath, sha256: digest(files.get(bridgesPath)) });
  return { inputs, files, bindings, bridges, indexAddendum, indexAssessment, vrpgOriginalIdentity, historicalEvidenceResolutions: [...resolutions.values()].sort((a, b) => a.path.localeCompare(b.path)), previousApprovals,
    preparationEvidenceCount: prepared.snapshot.evidence.length, preparationArchiveCount: prepared.snapshot.preservation.historicalArchives.length };
}

export async function consolidateMvp06Sources(repositoryRoot = root) {
  const context = await loadMvp06SourceEvidence(repositoryRoot);
  const { inputs, files, bindings } = context;
  const { catalogOnly, ...counts } = validateMvp06SourceCoverage(inputs);
  const inventoryById = new Map(inputs.inventory.entries.map(entry => [entry.sourceId, entry]));
  const evidence = [...files.entries()].map(([path, bytes]) => ({ path, sha256: digest(bytes), byteLength: bytes.length,
    ...(context.historicalEvidenceResolutions.find(e => e.path === path) ? { resolvedPath: context.historicalEvidenceResolutions.find(e => e.path === path).resolvedPath } : {}) })).sort((a, b) => a.path.localeCompare(b.path));
  return {
    reviewId: 'MVP06-CONSOLIDATED-SOURCE-PREPARATION-20261001', checkedOn: '2026-10-01',
    recordStatus: 'candidate', humanApproval: false, dataPromotionApproved: false, productionActivation: false,
    completeTechnicalSourceCoverage: true, allSourcesSubstantivelyConfirmed: false,
    counts, checkedBoundEvidence: validateMvp06BoundEvidence(files, bindings), evidence,
    historicalEvidenceResolutions: context.historicalEvidenceResolutions,
    historicalApprovalsVerified: context.previousApprovals.map(item => ({ releaseId: item.releaseId, verifiedEvidenceFiles: item.verifiedEvidenceFiles, use: 'historical-only-no-MVP06-approval' })),
    preparationSnapshot: { path: preparationPath, sha256: digest(files.get(preparationPath)), evidenceFiles: context.preparationEvidenceCount, historicalArchives: context.preparationArchiveCount },
    manifestCoverage: [...inputs.inventory.entries.filter(entry => entry.preparationEvidence).map(entry => ({ sourceId: entry.sourceId,
      reviewedOn: entry.preparationEvidence.checkedOn, mode: entry.preparationEvidence.method, outcome: 'unchanged',
      evidencePath: entry.preparationEvidence.evidence.path, evidenceSha256: entry.preparationEvidence.evidence.sha256,
      referenceUse: entry.referenceUse, freshArticleScope: entry.preparationEvidence.freshArticleScope,
      broaderArticleReuse: entry.preparationEvidence.broaderArticleReuse,
      ...(context.bridges.comparisons.some(comparison => comparison.sourceIds.includes(entry.sourceId)) ? {
        inventoryAssertionCorrection: { evidencePath: bridgesPath, evidenceSha256: digest(files.get(bridgesPath)),
          method: 'fresh-exact-original-pair-norm-text-and-paragraph-content-comparison', wholeOriginalBytesEqual: false,
          selectedNormTextsEqual: true, originalInventoryWholeIdentityRationaleSuperseded: true,
          freshComparedArticles: context.bridges.comparisons.find(comparison => comparison.sourceIds.includes(entry.sourceId)).articles }
      } : {}), limits: entry.preparationEvidence.limits })),
      ...inputs.remainder.checks.map(entry => ({ sourceId: entry.sourceId, reviewedOn: entry.checkedOn, mode: entry.method,
        outcome: entry.outcome, evidencePath: remainderPath, evidenceSha256: digest(files.get(remainderPath)),
        referenceUse: inventoryById.get(entry.sourceId).referenceUse, finding: entry.finding }))].sort((a, b) => a.sourceId.localeCompare(b.sourceId)),
    reusedCatalogCoverage: catalogOnly.map(sourceId => ({ sourceId, reviewedOn: '2026-09-22',
      mode: 'reused-human-approved-review-not-refreshed', outcome: sourceId === inputs.previous04.knownConflict.sourceId ? 'unclear' : 'unchanged',
      evidencePath: previous04Path, acceptedReuseEvidencePath: previous05Path })),
    inventoryCorrections: { inventoryPath, inventorySha256: inventoryHash, inventoryLeftUnchanged: true,
      broaderVrpgIdentityBasis: context.vrpgOriginalIdentity,
      explicitWholeWorkIndex: { path: indexAddendumPath, sha256: digest(files.get(indexAddendumPath)),
        assessmentPath: indexAssessmentPath, assessmentSha256: digest(files.get(indexAssessmentPath)),
        counts: context.indexAddendum.counts, rawNoDeltaInComparedIndexes: false, additionalEarlierWindowRow: context.indexAssessment.additionalIndexRow,
        assessment: context.indexAssessment.result, previousFilterOnlyWholeWorkRationaleSuperseded: true },
      sourceOriginalBridges: { path: bridgesPath, sha256: digest(files.get(bridgesPath)),
        correction: context.bridges.correction, scope: context.bridges.scope,
        result: 'ELG2026 and ATSG2024 whole original files differ. All 21 selected article texts and paragraph content/order are freshly equal. XML identifier differences remain explicit. This replaces, not confirms, the provisional whole-file identity assertion.' } },
    retainedLimits: ['AI list conflict remains unclear with accepted statutory treatment, no official correction claimed',
      'AVIV February 2027 remains Option B, no valid official XML consolidation retrieved',
      'OF-001 remains open and is attached to actual BGG/VwVG sources, no new delivery fiction activated',
      'Five broader prior readings remain explicitly identified. ELG2026 and ATSG2024 whole-file identity assertions are corrected by fresh article/paragraph comparisons. ELG2027 and the complete VRPG API response remain byte-bound to the earlier reading',
      'Historical PDFs and known judgments do not establish an exhaustive newer case-law search',
      'Exclusion-only references remain exclusion-only and do not activate new positive routes',
      'Corrected whole-work/subdivision index has one additional earlier ELG11 row. Its material-benefit assessment is separate and the raw delta remains visible',
      '24 new register references and a candidate review event remain separate controlled-promotion work',
      'No new annual full review, next ordinary date remains 2027-11-15',
      'Release source acceptance, data promotion, definitive build, E/Q/P installation and publication remain separate gates',
      'Freshness must be reconsidered after delay or new relevant amendment evidence']
  };
}

export async function persistMvp06SourceCompleteness(report, repositoryRoot = root) {
  const expected = await consolidateMvp06Sources(repositoryRoot);
  assert.deepEqual(report, expected, 'Only reproducible completeness may be persisted');
  const bytes = encode(report);
  await mkdir(dirname(resolve(repositoryRoot, resultPath)), { recursive: true });
  try { await writeFile(resolve(repositoryRoot, resultPath), bytes, { flag: 'wx' }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  assert.ok((await readRegular(repositoryRoot, resultPath)).equals(bytes), 'Existing completeness differs, refusing overwrite');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await consolidateMvp06Sources();
  await persistMvp06SourceCompleteness(report);
  console.log(JSON.stringify({ resultPath, ...report.counts, humanApproval: false, dataPromotionApproved: false }));
}
