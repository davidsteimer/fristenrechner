// SPDX-License-Identifier: AGPL-3.0-only
// Record bounded fresh evidence, without source approval or runtime mutation.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const out = 'outputs/release-mvp06-2026-10-01/sources/remainder';
const prior = 'outputs/release-mvp05-2026-09-28/sources';
const read = path => readFile(resolve(root, path));
const json = async path => JSON.parse(await read(path));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const bind = async path => { const bytes = await read(path); return {path, sha256: sha(bytes), byteLength: bytes.length}; };
const immutable = async (path, value) => {
  const bytes = Buffer.from(JSON.stringify(value, null, 2) + '\n');
  try { await writeFile(resolve(root, path), bytes, {flag: 'wx'}); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  assert.ok((await read(path)).equals(bytes), `Existing output differs: ${path}`);
};
const fetchPath = `${out}/fetch-run-03.json`;
const fetched = await json(fetchPath), extra = await json(`${out}/earlier-consolidations.json`);
const comparison = await json(`${out}/bounded-comparison.json`);
const rows = [...fetched.retrievals, ...extra.retrievals];
assert.equal(fetched.bindings.length, 45);
assert.equal(new Set(fetched.bindings.map(x => x.sourceId)).size, 45);
assert.equal(fetched.retrievals.length, 51);
assert.equal(extra.retrievals.length, 2);
for (const row of rows) {
  assert.equal(row.status, 200, row.id);
  const bytes = await read(row.rawPath);
  assert.equal(sha(bytes), row.sha256, row.id);
  assert.equal(bytes.length, row.bytes);
  if (row.baselinePath) assert.equal(sha(await read(row.baselinePath)), row.baselineSha256);
  if (row.sourceClassification === 'official-original' || row.sourceClassification === 'official-monitoring-original') {
    assert.equal(row.previousWholeDocumentHashMatches, true, row.id);
  }
}
const receipt = row => ({retrievalId: row.id, fetchEvidencePath: fetched.retrievals.includes(row) ? fetchPath : `${out}/earlier-consolidations.json`,
  checkedAt: row.checkedAt, status: row.status, contentType: row.contentType, sha256: row.sha256,
  byteLength: row.bytes, url: row.url, rawPath: row.rawPath, rawStorage: 'private-local-not-for-publication'});
const byId = id => { const row = rows.find(x => x.id === id); assert.ok(row, id); return row; };
const flatten = value => value.results.bindings.map(row => Object.fromEntries(Object.entries(row).map(([key, item]) => [key, item.value])));
const impacts = flatten(await json(byId('future-index').rawPath));
const versions = flatten(await json(byId('versions').rawPath));
assert.equal(impacts.length, 91);
assert.equal(versions.length, 25);
assert.equal(new Set(versions.map(x => x.work)).size, 14);
const oldRest = await json(`${prior}/remainder/source-review.json`);
const oldAp19 = await json(`${prior}/ap19-source-review.json`);
const oldImpacts = [...oldRest.futureReview.records, ...oldAp19.changeScreen.impacts]
  .filter(item => versions.some(version => version.work === item.work));
const identity = row => [row.work, row.impact, row.date, row.target, row.source || ''].join('|');
const futureImpacts = impacts.filter(row => row.date >= '2026-09-28');
assert.deepEqual(futureImpacts.map(identity).sort(), oldImpacts.map(identity).sort(), 'Unexpected new future impact');
assert.equal(futureImpacts.length, 21);
const consolidationCoverage = versions.map(version => {
  const marker = version.version.replace('https://fedlex.data.admin.ch/eli/cc/', '');
  const row = rows.find(item => item.url.includes(`/eli/cc/${marker}/de/xml/`));
  assert.ok(row, `Missing overlap consolidation retrieval: ${version.version}`);
  const xml = /xml/i.test(row.contentType || '') && !/<!doctype html/i.test(row.prefix || '');
  if (!xml) assert.equal(row.id, 'AVIV-20270201-availability');
  return {...version, retrievalId: row.id, originalSha256: row.sha256,
    fullTextAvailable: xml, method: xml ? 'fresh-full-original' : 'accepted-option-B-amendment-chain-required'};
});
assert.equal(consolidationCoverage.filter(row => row.fullTextAvailable).length, 24);
for (const work of new Set(versions.map(row => row.work))) {
  const group = versions.filter(row => row.work === work).sort((a, b) => a.from.localeCompare(b.from));
  assert.ok(group[0].from <= '2026-01-01');
  assert.ok(!group.at(-1).to || group.at(-1).to >= '2027-12-31');
  for (let i = 1; i < group.length; i++) {
    assert.ok(group[i - 1].to);
    const next = new Date(`${group[i - 1].to}T00:00:00Z`); next.setUTCDate(next.getUTCDate() + 1);
    assert.equal(next.toISOString().slice(0, 10), group[i].from);
  }
}
const pastImpacts = impacts.filter(row => row.date < '2026-09-28').map(row => {
  const consolidation = consolidationCoverage.find(version => version.work === row.work && version.from <= row.date && (!version.to || version.to >= row.date));
  assert.ok(consolidation?.fullTextAvailable, row.impact);
  return {...row, classification: 'already-effective-in-accepted-baseline', coveringConsolidation: consolidation.version,
    coveringOriginalSha256: consolidation.originalSha256,
    finding: 'Fresh full original matches the accepted edition. Existing bounded article findings are reused, no new substantive re-interpretation is claimed.'};
});
assert.equal(pastImpacts.length, 70);
const cantonalVersions = rows.filter(row => row.url.includes('belex.sites.be.ch/api/de/texts_of_law/'));
const cantonal = [];
for (const row of cantonalVersions) {
  const law = (await json(row.rawPath)).text_of_law;
  assert.equal(law.selected_version.id, law.current_version.id);
  assert.deepEqual(law.future_versions, []);
  cantonal.push({retrievalId: row.id, currentVersion: law.current_version, futureVersions: law.future_versions,
    selectedEqualsReportedCurrent: true, metadataOriginalByteIdentical: row.previousWholeDocumentHashMatches});
}
const projectionPath = `${out}/index-projection.json`;
await immutable(projectionPath, {checkedOn: '2026-10-01', formalApproval: false,
  scope: {from: '2026-01-01', to: '2027-12-31', lawCount: 14, wholeWorkImpactsIncluded: true,
    subdivisionImpactsIncluded: true, publicationYearFilter: null, preselectedArticleFilter: null,
    versionRule: 'interval-overlap including older editions and optional open end'},
  impactReceipt: receipt(byId('future-index')), versionReceipt: receipt(byId('versions')),
  impactQuery: byId('future-index').query, versionQuery: byId('versions').query,
  counts: {impacts: 91, alreadyEffective: 70, futureKnownImpacts: 21, versions: 25, fullTextAvailable: 24,
    optionBUnavailableConsolidations: 1, cantonalCurrentMetadata: cantonal.length},
  futureImpacts, futureProjectionMatchesAcceptedMvp05: true, pastImpacts, consolidationCoverage, cantonalVersions: cantonal});
const checks = [];
for (const binding of fetched.bindings) {
  const row = byId(binding.targetId);
  const isIndex = binding.targetId === 'future-index';
  const isJudgment = binding.sourceId.startsWith('JUD-');
  const freshPinpoint = binding.sourceId === comparison.jurisprudence.sourceId;
  if (isJudgment && !freshPinpoint) assert.equal(row.previousWholeDocumentHashMatches, true);
  let finding = binding.baselineFinding || 'No change to the previously accepted, bounded article and procedural findings. Full original bytes were freshly compared with the approved baseline.';
  if (isIndex) finding = 'The complete 2026–2027 index was freshly queried. Its future projection is identical to the accepted MVP05 assessment. Historical source ID stays unchanged.';
  if (freshPinpoint) finding = comparison.jurisprudence.finding;
  checks.push({sourceId: binding.sourceId, checkedOn: '2026-10-01', outcome: 'unchanged',
    outcomeScope: 'Previously modeled procedure, facts, time horizon and arithmetic only',
    method: isIndex ? 'fresh-official-full-window-index-and-accepted-future-projection-comparison'
      : freshPinpoint ? 'fresh-judgment-mirror-and-exact-case-MCP-pinpoint-read'
      : isJudgment ? 'fresh-identical-judgment-mirror-bytes-with-explicit-reuse-of-prior-pinpoint-reading'
      : 'fresh-identical-official-original-with-explicit-reuse-of-bound-article-findings',
    sourceClassification: isJudgment ? 'nonofficial-court-text-mirror-not-newly-verified-official-publication' : 'official-source',
    receipt: receipt(row), baselineEvidence: await bind(binding.baselineEvidencePath),
    priorReviewDate: binding.priorReviewDate, originalWholeDocumentMatches: row.previousWholeDocumentHashMatches,
    articles: binding.articles || [], priorPinpointsReused: freshPinpoint ? [] : binding.baselinePinpoints || [],
    freshPinpointsRead: freshPinpoint ? ['4.3.1', '4.3.2'] : [], finding, followUpRequired: false,
    ...(isJudgment ? {exhaustiveNewerCaseLawSearch: false} : {})});
}
const aviv = byId('AVIV-20270201-availability');
assert.equal(aviv.status, 200);
assert.match(aviv.contentType, /html/i);
assert.match(aviv.prefix, /doctype html/i);
assert.equal(comparison.monitoringOF001.bjVisibleTextUnchanged, true);
const evidencePaths = [...new Set([
  `${out}/refresh.mjs`, `${out}/supplement.mjs`, `${out}/compare.py`, `${out}/build-review.mjs`,
  `${out}/fetch-run-01.json`, `${out}/fetch-run-02.json`, fetchPath, `${out}/earlier-consolidations.json`,
  `${out}/bounded-comparison.json`, projectionPath, ...fetched.bindings.map(row => row.baselineEvidencePath),
  `${prior}/remainder/article-extracts.json`, `${prior}/remainder/future-article-comparison.json`,
  `${prior}/article-extracts.json`, 'outputs/ap19c2-2026-09-28/sources/article-extracts.json',
  'outputs/ap19c3-2026-09-28/sources/article-extracts.json',
  'outputs/release-mvp05-2026-09-28/source-approval.json', 'docs/fachrecht/abnahme-quellenpruefung-mvp05.md'
])].sort();
const report = {
  reviewId: 'MVP06-REMAINDER-SOURCE-REVIEW-20261001', checkedOn: '2026-10-01', recordStatus: 'candidate',
  formalApproval: false, productionApproval: false, runtimeActivation: false,
  performedBy: 'Codex as documented AI work instrument, no independent second approval',
  scope: 'Exactly 45 prior MVP05 manifest source IDs. Eight other prior IDs and all 24 new AP20 IDs are handled in the separate AP20 review inventory. The 82 catalog-only sources are not refreshed here.',
  counts: {sourceIds: checks.length, distinctSuccessfulNetworkResponses: rows.length, manifestOfficialSourceIds: 35,
    manifestJudgmentSourceIds: 10, freshJudgmentMirrorFiles: 10, freshMcpPinpointReads: 1,
    byteBoundPreviousJudgmentPinpointReadingsReused: 9, futureImpacts: 21, wholeWindowImpacts: 91,
    overlappingConsolidations: 25, missingConsolidatedFullTexts: 1, unexpectedSourceChanges: 0, modelRuleChangesRequired: 0},
  checks,
  futureReview: {evidencePath: projectionPath, ...await bind(projectionPath), from: '2026-01-01', to: '2027-12-31',
    wholeWorkAndSubdivisionImpacts: true, futureAssessmentReusedAfterFreshIdentityCheck: true,
    finding: 'All 21 impacts effective on/after the prior review date match its bounded assessment. Seventy earlier impacts are already included in freshly byte-verified consolidations. Nine selected BGG/ZPO deadline-article pairs are equal in the supplementary 2025 editions and their 2026 successors.'},
  avivOptionB: {status: 'retained', sourceId: 'SRC-AP19C2-AVIV-AS-2026-258', receipt: receipt(aviv),
    finding: 'The 2027-02-01 XML address still returns HTTP 200 with an HTML application shell, not a consolidated legal full text. Version metadata is not treated as successful full-text retrieval. The accepted Option B amendment chain, including AS 2025 814 and AS 2026 258, is freshly byte-verified and retained without scope extension.'},
  monitoring: {id: 'OF-001', status: 'open', reviewedOn: '2026-10-01',
    receipts: ['OF001-BJ', 'BBl-2025-2891', 'SRC-BGG-20260401', 'SRC-VWVG-20220701', 'VwVG-20270101', 'future-index'].map(id => receipt(byId(id))),
    visibleBjPageUnchanged: true, bjRawBytesChanged: true,
    finding: 'The BJ dossier still links the referendum text. The unchanged BBl text delegates commencement to the Federal Council. The checked current/future consolidations and full-window impact index provide no basis for activating the proposed weekend delivery fiction. No commencement date is asserted.',
    action: 'Retain OF-001 and existing calculation rules. Recheck upon official commencement evidence or the next release.'},
  technicalRetrievalHistory: {initialSandboxAttempt: `${out}/fetch-run-01.json`,
    firstSuccessfulAttempt: `${out}/fetch-run-02.json`, finalExpandedWindowAttempt: fetchPath,
    finding: 'Initial local network failures are environment failures, not legal source unavailability. The successful second run remains recorded. The final third run adds complete whole-work impact and interval-overlap queries without rewriting earlier results.'},
  limitations: ['No exhaustive search for newer case law', 'Court mirrors are not official publication sites',
    'OpenCaseLaw had no callable connector in this session', 'Byte identity supports reuse of bounded prior readings, not a claim that every article was reread',
    'Official metadata is checked as retrieved and is not a guarantee against later or missing publication',
    'The missing February 2027 AVIV consolidated full text remains covered only by the accepted Option B',
    'No refresh of the 82 nonoperative catalog-only sources', 'No source register, approved event, candidate, release, mirror, permission or environment was changed'],
  pendingGates: ['Consolidated human source acceptance', 'Separate controlled data promotion and definitive local build approval', 'Separate installation and publication permissions'],
  evidenceBindings: await Promise.all(evidencePaths.map(bind))
};
await immutable(`${out}/source-review.json`, report);
console.log(JSON.stringify({path: `${out}/source-review.json`, sha256: sha(await read(`${out}/source-review.json`)), counts: report.counts}));
