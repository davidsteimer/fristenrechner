// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic, in-memory records only. These tests do not create review evidence.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { validateCoverage, validateKnownConflict } from '../../scripts/consolidate-mvp04-source-checks.mjs';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const catalog = read('../../data/releases/2026-09-22-mvp-04-approved.1/holiday-catalogs/ch-holiday-catalog.json');
const manifest = read('../../data/releases/2026-09-22-mvp-04-approved.1/manifest.json');
function fixture() {
  const ids = manifest.sourceSummary.sourceIds;
  const scopes = {
    central: ['CH', 'CH-AG', 'CH-BL', 'CH-BS', 'CH-SO', 'CH-TI', 'CH-UR', 'CH-OW', 'CH-NW'],
    west: ['CH-FR', 'CH-GE', 'CH-JU', 'CH-NE', 'CH-VD', 'CH-VS'],
    east: ['CH-AI', 'CH-AR', 'CH-GL', 'CH-GR', 'CH-LU', 'CH-SG', 'CH-SH', 'CH-SZ', 'CH-TG', 'CH-ZG', 'CH-ZH'],
  };
  const batches = Object.fromEntries(Object.entries(scopes).map(([key, scope]) => [key, {
    checkedOn: '2026-09-22',
    catalogSha256: 'b53f9ed3dec29c8bb479b3840a801f3056531374cbb84611b377d7a01e93d1b7',
    entries: catalog.data.sources.filter(s => scope.includes(s.jurisdiction) && !ids.includes(s.id)).map(s => ({
      sourceId: s.id, outcome: 'unchanged', finding: 'Synthetic test fixture, not legal evidence or human approval.',
      method: 'targetedSubstantiveComparison', retrievalUrl: s.url, relevantProvisions: [s.locator],
    })),
  }]));
  return { catalog: structuredClone(catalog), manifest: structuredClone(manifest),
    catalogHash: 'b53f9ed3dec29c8bb479b3840a801f3056531374cbb84611b377d7a01e93d1b7',
    operative: { checkedOn: '2026-09-22', substantivelyRecheckedSourceIds: [...ids], notRecheckedSourceIds: [],
      checks: ids.map(sourceId => ({ sourceId, liveCheckStatus: 'targetedSubstantiveComparison' })) },
    event: { comparedReleaseIds: [manifest.releaseId], entries: ids.map(sourceId => ({ sourceId,
      reviewedOn: '2026-09-22', outcome: 'unchanged', evidence: { method: 'targetedSubstantiveComparison',
        relevantProvisions: ['Synthetic test locator'], finding: 'Synthetic test fixture, not a substantive review.' } })) }, batches };
}
test('covers 120 unique sources without granting formal approval', () => {
  const result = validateCoverage(fixture());
  assert.equal(result.entries.length, 82);
  assert.equal(result.scope.uniqueSources, 120);
  assert.equal(result.formalApproval, false);
  assert.equal(result.publicationAuthorized, false);
  assert.equal(result.allSourcesSubstantivelyConfirmed, true);
});
test('missing batch rejected', () => { const f = fixture(); delete f.batches.west; assert.throws(() => validateCoverage(f)); });
test('missing source rejected', () => { const f = fixture(); f.batches.east.entries.pop(); assert.throws(() => validateCoverage(f)); });
test('duplicated source rejected', () => { const f = fixture(); f.batches.west.entries[0] = f.batches.west.entries[1]; assert.throws(() => validateCoverage(f)); });
test('missing operative review rejected', () => { const f = fixture(); f.operative.substantivelyRecheckedSourceIds.pop(); assert.throws(() => validateCoverage(f)); });
test('changed catalog hash rejected', () => { const f = fixture(); f.catalogHash = '0'.repeat(64); assert.throws(() => validateCoverage(f)); });
test('stale review date rejected', () => { const f = fixture(); f.batches.central.checkedOn = '2026-09-13'; assert.throws(() => validateCoverage(f)); });
test('missing finding or locator rejected', () => {
  for (const property of ['finding', 'relevantProvisions', 'method', 'retrievalUrl', 'outcome']) {
    const f = fixture(); delete f.batches.central.entries[0][property]; assert.throws(() => validateCoverage(f), property);
  }
});
test('unavailable and unclear remain unresolved, never silently passed', () => {
  const f = fixture(); f.batches.west.entries[0].outcome = 'unavailable'; f.batches.east.entries[0].outcome = 'unclear';
  const result = validateCoverage(f);
  assert.equal(result.completeReviewCoverage, true);
  assert.equal(result.allSourcesSubstantivelyConfirmed, false);
  assert.equal(result.unresolved.length, 2);
  assert.equal(result.formalApproval, false);
});
test('operative self-declaration without individual checks rejected', () => {
  const f = fixture(); f.operative.checks = []; assert.throws(() => validateCoverage(f));
});
test('contradicting unreviewed-source list rejected', () => {
  const f = fixture(); f.operative.notRecheckedSourceIds = [f.manifest.sourceSummary.sourceIds[0]]; assert.throws(() => validateCoverage(f));
});
test('canonical review event is mandatory and checked', () => {
  const f = fixture(); f.event.entries.pop(); assert.throws(() => validateCoverage(f));
});
test('report bound to a different catalog rejected', () => {
  const f = fixture(); f.batches.east.catalogSha256 = '0'.repeat(64); assert.throws(() => validateCoverage(f));
});
test('HTTP-only checks cannot become substantive confirmation', () => {
  const f = fixture(); f.batches.central.entries[0].method = 'httpOnly'; assert.throws(() => validateCoverage(f));
  const g = fixture(); g.event.entries[0].evidence.method = 'httpOnly'; assert.throws(() => validateCoverage(g));
});
test('duplicate manifest source ID rejected', () => {
  const f = fixture(); f.manifest.sourceSummary.sourceIds.push(f.manifest.sourceSummary.sourceIds[0]); assert.throws(() => validateCoverage(f));
});
test('unresolved operative event cannot be passed by confirmed catalog sources', () => {
  const f = fixture(); f.event.entries[0].outcome = 'unclear';
  const result = validateCoverage(f); assert.equal(result.allSourcesSubstantivelyConfirmed, false); assert.equal(result.unresolved[0].scope, 'operative');
});
test('known AI conflict requires hash-bound follow-up and existing decision', () => {
  const id = 'SRC-AI-RUHETAGE-LISTE-2026';
  const followUp = { sourceId: id, reviewReportSha256: 'test-hash', sourceOutcome: 'unclear',
    classification: 'knownConflictWithAcceptedTreatment',
    existingDecision: { decidedBy: 'David Steimer', reference: '../../docs/fachrecht/abnahme-ap18b-05.md' },
    releaseImpact: { newSourceReviewApprovalPending: true, newLegalQuestion: false, productDataChangeRequired: false, officialCorrectionClaimed: false },
    followUp: { required: true, action: 'Synthetic follow-up for this in-memory test only.' },
    formalApproval: false, publicationAuthorized: false, deploymentAuthorized: false };
  assert.doesNotThrow(() => validateKnownConflict([{ sourceId: id }], followUp, 'test-hash'));
  assert.throws(() => validateKnownConflict([{ sourceId: id }], followUp, 'other-hash'));
  assert.throws(() => validateKnownConflict([{ sourceId: id }, { sourceId: 'unexpected' }], followUp, 'test-hash'));
  assert.throws(() => validateKnownConflict([{ sourceId: id }], { ...followUp, formalApproval: true }, 'test-hash'));
  assert.throws(() => validateKnownConflict([{ sourceId: id }], { ...followUp, followUp: { required: false } }, 'test-hash'));
});
