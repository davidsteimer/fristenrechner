// SPDX-License-Identifier: AGPL-3.0-only
// Completeness and integrity checks, not a legal approval or automatic release.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const releaseId = '2026-09-22-mvp-04-approved.1';
const reviewDate = '2026-09-22';
const expectedCatalogHash = 'b53f9ed3dec29c8bb479b3840a801f3056531374cbb84611b377d7a01e93d1b7';
const batchScopes = {
  central: ['CH', 'CH-AG', 'CH-BL', 'CH-BS', 'CH-SO', 'CH-TI', 'CH-UR', 'CH-OW', 'CH-NW'],
  west: ['CH-FR', 'CH-GE', 'CH-JU', 'CH-NE', 'CH-VD', 'CH-VS'],
  east: ['CH-AI', 'CH-AR', 'CH-GL', 'CH-GR', 'CH-LU', 'CH-SG', 'CH-SH', 'CH-SZ', 'CH-TG', 'CH-ZG', 'CH-ZH'],
};
const sorted = values => [...values].sort();
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export function validateCoverage({ catalog, catalogHash, manifest, operative, event, batches }) {
  assert.equal(catalogHash, expectedCatalogHash, 'Accepted holiday catalog has changed');
  assert.equal(manifest.releaseId, releaseId);
  assert.equal(operative.checkedOn, reviewDate, 'Operative review date is not current');
  const operativeIds = new Set(manifest.sourceSummary.sourceIds);
  assert.equal(operativeIds.size, 38);
  assert.equal(manifest.sourceSummary.sourceIds.length, 38, 'Duplicate manifest source ID');
  assert.deepEqual(sorted(operative.substantivelyRecheckedSourceIds), sorted(operativeIds), 'Operative review is incomplete or duplicated');
  assert.deepEqual(operative.notRecheckedSourceIds, [], 'Operative report lists unreviewed sources');
  assert.deepEqual(sorted(operative.checks.map(check => check.sourceId)), sorted(operativeIds), 'Operative individual checks are incomplete');
  assert.deepEqual(event.comparedReleaseIds, [releaseId]);
  assert.deepEqual(sorted(event.entries.map(entry => entry.sourceId)), sorted(operativeIds), 'Canonical event is incomplete');
  for (const entry of event.entries) {
    assert.equal(entry.reviewedOn, reviewDate);
    assert.equal(entry.evidence.method, 'targetedSubstantiveComparison', `Substantive operative method missing: ${entry.sourceId}`);
    assert.ok(entry.evidence.relevantProvisions?.length && entry.evidence.finding?.length > 20, `Operative evidence missing: ${entry.sourceId}`);
    assert.ok(['unchanged', 'changed', 'unclear', 'unavailable'].includes(entry.outcome));
    const check = operative.checks.find(check => check.sourceId === entry.sourceId);
    assert.equal(check.liveCheckStatus, 'targetedSubstantiveComparison', `Operative summary contradicts event: ${entry.sourceId}`);
  }
  const catalogIds = new Set(catalog.data.sources.map(source => source.id));
  assert.equal(catalogIds.size, 84);
  assert.equal(catalog.data.sources.length, 84, 'Duplicate catalog source ID');
  const overlap = sorted([...catalogIds].filter(id => operativeIds.has(id)));
  assert.equal(overlap.length, 2);
  const entries = [];
  for (const [batch, jurisdictions] of Object.entries(batchScopes)) {
    const report = batches[batch];
    assert.ok(report, `Missing batch ${batch}`);
    assert.equal(report.catalogSha256, catalogHash, `Wrong catalog binding in ${batch}`);
    const checks = report.entries ?? report.checks;
    assert.ok(Array.isArray(checks), `Missing entries in ${batch}`);
    const expected = catalog.data.sources.filter(source => jurisdictions.includes(source.jurisdiction) && !operativeIds.has(source.id));
    assert.deepEqual(sorted(checks.map(check => check.sourceId)), sorted(expected.map(source => source.id)), `Incomplete or duplicated batch ${batch}`);
    for (const check of checks) {
      assert.equal(check.checkedOn ?? report.checkedOn, reviewDate, `Review date missing: ${check.sourceId}`);
      assert.ok(['unchanged', 'changed', 'unclear', 'unavailable'].includes(check.outcome), `Outcome missing: ${check.sourceId}`);
      assert.ok(typeof check.finding === 'string' && check.finding.trim().length > 20, `Substantive finding missing: ${check.sourceId}`);
      assert.ok(check.method === 'targetedSubstantiveComparison' || (check.outcome === 'unavailable' && check.method === 'retrievalAttempt'), `Substantive method missing: ${check.sourceId}`);
      const url = check.retrievalUrl || check.officialUrl || check.url;
      assert.ok(typeof url === 'string' && /^https:\/\//.test(url), `Evidence URL missing: ${check.sourceId}`);
      if (check.outcome === 'unchanged') {
        assert.ok(check.relevantProvisions?.length || check.locator, `Substantive locator missing: ${check.sourceId}`);
      }
      entries.push({ batch, ...check, checkedOn: check.checkedOn ?? report.checkedOn });
    }
  }
  assert.equal(entries.length, 82);
  assert.equal(new Set(entries.map(entry => entry.sourceId)).size, 82);
  const operativeUnresolved = event.entries.filter(entry => entry.outcome !== 'unchanged').map(entry => ({ scope: 'operative', ...entry }));
  const unresolved = [...operativeUnresolved, ...entries.filter(entry => entry.outcome !== 'unchanged')];
  return {
    checkedOn: reviewDate,
    releaseId,
    catalogSha256: catalogHash,
    scope: { operativeManifestSources: 38, catalogSources: 84, overlap: 2, additionalCatalogSources: 82, uniqueSources: 120 },
    completeReviewCoverage: true,
    allSourcesSubstantivelyConfirmed: unresolved.length === 0,
    outcomes: Object.fromEntries(['unchanged', 'changed', 'unclear', 'unavailable'].map(outcome => [outcome, entries.filter(entry => entry.outcome === outcome).length])),
    operativeOutcomes: Object.fromEntries(['unchanged', 'changed', 'unclear', 'unavailable'].map(outcome => [outcome, event.entries.filter(entry => entry.outcome === outcome).length])),
    overlapSourceIds: overlap,
    unresolved,
    formalApproval: false,
    publicationAuthorized: false,
    deploymentAuthorized: false,
    productDataChanged: false,
    entries: entries.sort((a, b) => a.sourceId.localeCompare(b.sourceId, 'en')),
  };
}

export async function consolidate() {
  const approvalPath = 'outputs/release-mvp04-2026-09-22/source-approval.json';
  let hasApproval = false;
  try {
    await readFile(resolve(root, approvalPath));
    hasApproval = true;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (hasApproval) {
    const { verifyMvp04SourceApproval } = await import('./verify-mvp04-source-approval.mjs');
    const verification = await verifyMvp04SourceApproval(root);
    return { ...verification, action: 'verified-noop', filesWritten: 0 };
  }
  const evidence = [];
  const read = async path => {
    const bytes = await readFile(resolve(root, path));
    evidence.push({ path, sha256: sha256(bytes) });
    return JSON.parse(bytes);
  };
  const catalogPath = `data/releases/${releaseId}/holiday-catalogs/ch-holiday-catalog.json`;
  const catalog = await read(catalogPath);
  const manifest = await read(`data/releases/${releaseId}/manifest.json`);
  const operative = await read('outputs/release-mvp04-2026-09-22/source-check.json');
  const event = await read('data/source-reviews/events/2026-09-22-mvp-04-prerelease.1.json');
  assert.equal(event.recordStatus, 'candidate', 'Approved event requires its verified source approval, not regeneration');
  const batches = {};
  for (const batch of Object.keys(batchScopes)) {
    batches[batch] = await read(`outputs/release-mvp04-2026-09-22/catalog-refresh-${batch}.json`);
  }
  const result = validateCoverage({ catalog, catalogHash: evidence[0].sha256, manifest, operative, event, batches });
  const followUp = await read('outputs/release-mvp04-2026-09-22/catalog-follow-up.json');
  const eastReport = evidence.find(item => item.path.endsWith('/catalog-refresh-east.json'));
  validateKnownConflict(result.unresolved, followUp, eastReport.sha256);
  result.knownConflictsWithAcceptedTreatment = [followUp.sourceId];
  result.newUndisposedFindings = [];
  result.followUpRecord = 'catalog-follow-up.json';
  result.evidence = evidence;
  await writeFile(resolve(root, 'outputs/release-mvp04-2026-09-22/source-review-completeness.json'), `${JSON.stringify(result, null, 2)}\n`);
  return result;
}

export function validateKnownConflict(unresolved, followUp, reportHash) {
  assert.deepEqual(unresolved.map(entry => entry.sourceId), ['SRC-AI-RUHETAGE-LISTE-2026'], 'New source findings require separate disposition');
  assert.equal(followUp.sourceId, unresolved[0].sourceId);
  assert.equal(followUp.reviewReportSha256, reportHash, 'Follow-up is bound to another review report');
  assert.equal(followUp.sourceOutcome, 'unclear');
  assert.equal(followUp.classification, 'knownConflictWithAcceptedTreatment');
  assert.equal(followUp.existingDecision.decidedBy, 'David Steimer');
  assert.equal(followUp.existingDecision.reference, '../../docs/fachrecht/abnahme-ap18b-05.md');
  assert.equal(followUp.releaseImpact.newSourceReviewApprovalPending, true);
  assert.equal(followUp.releaseImpact.newLegalQuestion, false);
  assert.equal(followUp.releaseImpact.productDataChangeRequired, false);
  assert.equal(followUp.releaseImpact.officialCorrectionClaimed, false);
  assert.equal(followUp.followUp.required, true);
  assert.ok(followUp.followUp.action?.length > 20, 'Follow-up action is missing');
  assert.equal(followUp.formalApproval, false);
  assert.equal(followUp.publicationAuthorized, false);
  assert.equal(followUp.deploymentAuthorized, false);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // The verifier reuses these pure validators. Do not suspend this module's
  // evaluation while dynamically importing that verifier from its CLI path.
  consolidate().then(({ entries, evidence, unresolved, ...summary }) => {
    console.log(JSON.stringify({ ...summary, ...(unresolved ? { unresolvedSourceIds: unresolved.map(entry => entry.sourceId) } : {}) }, null, 2));
  }).catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
