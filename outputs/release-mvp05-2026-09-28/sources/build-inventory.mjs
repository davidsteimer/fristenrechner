import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const project = new URL('../../../', import.meta.url);
const json = async path => JSON.parse(await readFile(new URL(path, project), 'utf8'));
const hash = async path => createHash('sha256').update(await readFile(new URL(path, project))).digest('hex');
const out = 'outputs/release-mvp05-2026-09-28/';
const candidate = 'data/candidates/2026-09-28-ap19c3/';
const manifest = await json(candidate + 'manifest.json');
const prior = await json('data/releases/2026-09-22-mvp-04-approved.1/manifest.json');
const catalog = await json(candidate + 'holiday-catalogs/ch-holiday-catalog.json');
const registry = await json('data/source-reviews/source-register.json');
const c1Path = 'outputs/ap19c1-2026-09-25/source-review.json';
const c2Path = 'outputs/ap19c2-2026-09-28/sources/source-review.json';
const c3Path = 'outputs/ap19c3-2026-09-28/sources/source-review.json';
const c1 = await json(c1Path), c2 = await json(c2Path), c3 = await json(c3Path);
assert.equal(await hash(c1Path), 'a3a423687f45a3706dc34095d41c5356cd97891b21e7989bde47b6f363acf773');
assert.equal(await hash(c2Path), '33d2fe1c6f6e1d54a97f8a9a54c97ce4a58aea56d0158a029ffa2a5d0f43abc3');
assert.equal(await hash(c3Path), '00f16cfb9653d32a73555c9ccd6c22a32af7810aae0068fe540d5497aac1b6e9');
assert.equal(await hash(candidate + 'manifest.json'), '8e0f7aa1901b1e26878ddead049a35c81cbf540fd6d68002597830f5c7e6b0da');
const fetches = await json(out + 'sources/retry-01/fetch-results.json');
assert.equal(fetches.length, 12);
for (const record of fetches) {
  assert.equal(record.status, 200);
  assert.equal(await hash(out + 'sources/retry-01/' + record.file), record.sha256);
}
const extracts = await json(out + 'sources/article-extracts.json');
assert.ok(extracts.comparison.every(c => c.allSelectedArticleTextsEqual));
const index = await json(out + 'sources/retry-01/future-index.json');
const impacts = index.results.bindings.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value.value])));
assert.equal(impacts.length, 14);
const expected = new Map([
  ['1959/827_857_845', ['art_13a', 'art_14ter', 'art_67', 'art_68novies', 'art_78', 'dtrans_']],
  ['1961/29_29_29', ['art_21', 'art_39h']],
  ['1983/1205_1205_1205', ['art_46', 'art_66a', 'art_57b']],
  ['2007/804', ['art_10', 'art_11']],
  ['63/837_843_843', ['art_20']],
]);
for (const [work, targets] of expected) assert.deepEqual(impacts.filter(i => i.work.endsWith('/' + work)).map(i => i.target.split('/').pop()).sort(), targets.slice().sort());
const c1Map = {
  'CH-ELG-20260101': 'SRC-AP19C-ELG-20260101',
  'CH-ELG-20270101': 'SRC-AP19C-ELG-20270101',
  'CH-IVG-20260101': 'SRC-AP17C-IVG-20260101',
  'CH-IVG-20270101': 'SRC-AP17C-IVG-20270101',
  'CH-AHVG-20260101': 'SRC-AP17C-AHVG-20260101',
  'CH-AHVG-20270101': 'SRC-AP17C-AHVG-20270101',
  'CH-UVG-20260101': 'SRC-AP17C-UVG-20260101',
  'CH-IVV-20250601': 'SRC-AP17C-IVV-20250601',
  'CH-IVV-20270701': 'SRC-AP17C-IVV-20270701',
  'BE-EG-ELG-3072': 'SRC-AP19C-EGELG-BE-20250101',
};
const entries = [];
for (const record of fetches.filter(f => f.priorCheckId)) {
  assert.equal(record.matchesPriorHash, true);
  entries.push({ sourceId: c1Map[record.priorCheckId], checkedOn: '2026-09-28', mode: 'fresh-official-original-and-targeted-article-comparison', checkedAt: record.checkedAt, officialUrl: record.url, originalPath: out + 'sources/retry-01/' + record.file, originalSha256: record.sha256, articles: record.articles, comparisonEvidence: c1Path, result: 'unchanged-in-bounded-AP19-scope' });
}
const addSameDay = (sourceId, review, path, sourceRef = sourceId) => {
  const check = review.checks.find(c => c.sourceRef === sourceRef);
  assert.ok(check, sourceId);
  entries.push({ sourceId, checkedOn: '2026-09-28', mode: sourceId === sourceRef ? 'reused-same-day-bounded-official-review' : 'reused-same-day-identical-official-source-alias', checkedAt: check.checkedAt, evidencePath: path, checkId: check.checkId, sourceRef, officialUrl: check.url, originalSha256: check.responseSha256, articles: check.articles || [], result: 'unchanged-in-bounded-AP19-scope' });
};
for (const sourceId of ['SRC-AP17C-ATSG-20240101', 'SRC-AP19C-GSOG-BE', 'SRC-AP17C-FRG-BE-20210401', 'SRC-AP19C3-KVG-20260101', 'SRC-AP19C3-KVG-20260701', 'SRC-AP19C3-KVG-FUTURE-INDEX-20260928']) addSameDay(sourceId, c3, c3Path);
addSameDay('SRC-ATSG-20240101', c3, c3Path, 'SRC-AP17C-ATSG-20240101');
addSameDay('SRC-FRG-BE-20210401', c3, c3Path, 'SRC-AP17C-FRG-BE-20210401');
for (const sourceId of manifest.sourceSummary.sourceIds.filter(id => id.startsWith('SRC-AP19C2-'))) addSameDay(sourceId, c2, c2Path);
entries.push({ sourceId: 'JUD-AP17C-BGER-8C-767-2008-20090112', checkedOn: '2026-09-28', mode: 'reused-same-day-pinpoint-review-not-a-newer-case-law-search', evidencePath: c3Path, sourceRef: c3.jurisprudence.sourceRef, officialDecisionIdentity: c3.jurisprudence.identity, result: 'unchanged-narrow-formal-complaint-correction-only' });
entries.sort((a,b) => a.sourceId.localeCompare(b.sourceId));
assert.equal(entries.length, 27);
assert.equal(new Set(entries.map(x => x.sourceId)).size, 27);
for (const entry of entries) assert.ok(manifest.sourceSummary.sourceIds.includes(entry.sourceId));
const bindings = [];
for (const path of [c1Path, c2Path, c3Path, 'docs/fachrecht/abnahme-ap19c1.md', 'docs/fachrecht/abnahme-ap19c2.md', 'docs/fachrecht/abnahme-ap19c3.md', 'docs/fachrecht/abnahme-quellenpruefung-mvp04.md', 'outputs/release-mvp04-2026-09-22/source-approval.json']) bindings.push({ path, sha256: await hash(path) });
const review = {
  reviewId: 'MVP05-AP19-SOURCE-PREPARATION-20260928', kind: 'bounded-technical-prerelease-source-evidence', status: 'candidate', checkedOn: '2026-09-28', humanApproval: false, productionApproval: false, runtimeActivation: false,
  comparedReleaseId: manifest.releaseId, manifestSha256: await hash(candidate + 'manifest.json'), sourceCoverage: { from: '2026-01-01', to: '2027-12-31' },
  summary: { distinctManifestSourceIdsCovered: 27, freshlyRetrievedSourceIds: 10, sameDayReusedSourceIds: 17, freshlyRetrievedOfficialResponses: 12, otherManifestSourcesNotRefreshedByThisReport: 26, catalogOnlySourcesNotRefreshedByThisReport: 82 },
  entries, evidenceBindings: bindings,
  changeScreen: { source: 'official-full-article-impact-index', checkedAt: fetches.find(f=>f.file==='future-index.json').checkedAt, responsePath: out + 'sources/retry-01/future-index.json', responseSha256: await hash(out + 'sources/retry-01/future-index.json'), effectiveFrom: '2026-09-28', effectiveTo: '2027-12-31', lawCount: 9, publicationYearFilter: null, preselectedArticleFilter: null, impactCount: impacts.length, impacts, result: 'only-previously-assessed-targets-no-new-AP19-impact-detected' },
  versionScreen: { responsePath: out + 'sources/retry-01/versions.json', responseSha256: await hash(out + 'sources/retry-01/versions.json'), queryFrom: '2024-01-01', queryTo: '2028-01-01', metadataDoesNotProveSuccessfulFullTextRetrieval: true, avivFebruary2027: 'same-day-C2-Option-B-evidence-reused-not-refetched-again' },
  preservedBoundaries: ['No whole-country holiday refresh', 'No operating approval for additional cantons', 'No exhaustive search for newer court decisions in this report', 'Historical GSOG and AMG evidence reused with original dates', 'Source horizon is not statutory entry into force', 'Technical retrieval failure in initial sandbox attempt is preserved separately and not misclassified as legal source unavailability'],
  pendingGates: ['Consolidate all 53 manifest IDs and catalog carry-forward evidence', 'Complete source register evolution and source-index resolution for socialProcedureCatalog', 'Human acceptance of the consolidated prerelease source findings', 'Separate data promotion and exact approval bindings', 'Separate E/Q/P and publication authorizations'],
};
const catalogIds = catalog.data.sources.map(s => s.id), manifestIds = manifest.sourceSummary.sourceIds;
const inventory = {
  inventoryId: 'MVP05-SOURCE-INVENTORY-20260928', kind: 'local-release-preparation-inventory', preparedOn: '2026-09-28', status: 'candidate', humanApproval: false,
  comparedReleaseId: prior.releaseId, candidateReleaseId: manifest.releaseId, candidateManifestSha256: await hash(candidate+'manifest.json'),
  counts: { previousManifestSources: 38, addedAP19ManifestSources: 15, manifestSources: 53, holidayCatalogSources: 84, overlap: 2, distinctTotal: 135, AP19ReviewSourceIds: 27, remainingManifestSourceIds: 26, catalogOnlySourceIds: 82, currentGovernanceRegister: 42, proposedRegisterAfterAdding15: 57 },
  note: 'This inventory keeps historical baseline dates. It is not itself an AP13-approved review event. Other agents may supply later separate reviews for the remaining 26 entries.',
  evidenceBindings: bindings,
  addedManifestSourceIds: manifestIds.filter(id => !prior.sourceSummary.sourceIds.includes(id)),
  remainingManifestSourceIds: manifestIds.filter(id => !entries.some(e => e.sourceId === id)),
  unchangedArtifacts: manifest.artifacts.filter(a => prior.artifacts.some(p => p.path === a.path && p.sha256 === a.sha256)).map(a => ({ path: a.path, sha256: a.sha256 })),
  entries: [...new Set([...manifestIds, ...catalogIds])].sort().map(sourceId => {
    const reviewEntry = entries.find(e => e.sourceId === sourceId), inManifest = manifestIds.includes(sourceId), inCatalog = catalogIds.includes(sourceId);
    return { sourceId, inManifest, inHolidayCatalog: inCatalog, inCurrentGovernanceRegister: registry.sources.some(s => s.sourceId === sourceId), baselineLatestCheckedOn: prior.sourceSummary.sourceIds.includes(sourceId) || inCatalog ? '2026-09-22' : sourceId.startsWith('SRC-AP19C-') ? '2026-09-25' : '2026-09-28', preparationEvidence: reviewEntry ? { reviewId: review.reviewId, mode: reviewEntry.mode, checkedOn: reviewEntry.checkedOn } : null, carryForwardBasis: reviewEntry ? null : 'MVP04-formally-approved-review-20260922', disposition: reviewEntry ? 'bounded-AP19-review-prepared-awaiting-consolidated-acceptance' : inManifest ? 'separate-prerelease-check-required' : 'unchanged-nonoperative-catalog-prior-review-carry-forward-proposed', knownConflict: sourceId === 'SRC-AI-RUHETAGE-LISTE-2026' ? 'unclear-accepted-statutory-treatment-preserved' : null };
  }),
};
assert.equal(inventory.entries.length, 135);
assert.equal(inventory.remainingManifestSourceIds.length, 26);
for (const [path, data] of [[out + 'source-inventory.json', inventory], [out + 'sources/ap19-source-review.json', review]]) await writeFile(new URL(path, project), JSON.stringify(data, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ inventory: inventory.counts, review: review.summary, changeScreen: review.changeScreen.result, hashes: { inventory: await hash(out + 'source-inventory.json'), review: await hash(out + 'sources/ap19-source-review.json') } }, null, 2));
