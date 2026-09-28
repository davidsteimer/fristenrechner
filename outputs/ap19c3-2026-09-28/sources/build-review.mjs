import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const here = new URL('.', import.meta.url);
const read = name => readFile(new URL(name, here));
const fetches = JSON.parse(await read('fetch-results.json'));
const extracts = JSON.parse(await read('article-extracts.json'));
const entries = JSON.parse(await read('future-index.json')).results.bindings;
const versions = JSON.parse(await read('versions.json')).results.bindings.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value.value])));
assert.deepEqual(entries, []);
assert.equal(extracts.comparison.identicalNormText, true);
assert.equal(extracts.comparison.identicalFullTextIncludingNotes, true);
for (const article of ['3', '25_a', '61', '64_a']) assert.equal(extracts['KVG-20260101'][article].fullText, extracts['KVG-20260701'][article].fullText);
for (const law of ['GSOG', 'FRG']) assert.deepEqual(extracts[law].future_versions, []);
const kvgVersions = versions.filter(row => row.work.endsWith('1328_1328_1328') && row.from >= '2026-01-01' && row.from <= '2028-01-01');
assert.deepEqual(kvgVersions.map(row => [row.from, row.to]), [['2026-01-01','2026-06-30'], ['2026-07-01','2027-12-31'], ['2028-01-01','2031-12-31']]);
const specifications = [
  ['ATSG.xml', 'SRC-AP17C-ATSG-20240101', '2024-01-01', ['2','38','39','40','41','49','51','52','55','56','57','58','60','61'], '14d2ca1bb3ea367fb2c23dc05a1b6fc7d78c478f7b9bf2c2984fca02968a67ed'],
  ['KVG-20260101.xml', 'SRC-AP19C3-KVG-20260101', '2026-01-01', ['1','1a','3','25','25a','53','54','61','64','64a','67','80','85','87','89'], '7fbede8de313f1f6accd376fe29ba3ef76880de1f60aca8923bc25cf730740f1'],
  ['KVG-20260701.xml', 'SRC-AP19C3-KVG-20260701', '2026-07-01', ['1','1a','3','25','25a','53','54','61','64','64a','67','80','85','87','89'], '32b0745cd3827c26d6ad5a0789d45269509e980a671afc70fdcbade07f64f8b9'],
  ['GSOG.json', 'SRC-AP19C-GSOG-BE', '2026-05-01', ['54'], '78095ce15851896ec4bc7067abf3a7327772021d960841b904594dc9d8ae259f'],
  ['FRG.json', 'SRC-AP17C-FRG-BE-20210401', '2021-04-01', ['2'], '1894ea812b87e55dd6bda23262a683bdf7ad8b9e1cbe6e59c91112df733cdee8'],
];
const checks = [];
for (const [file, sourceRef, documentVersionDate, articles, expectedSha] of specifications) {
  const fetch = fetches.find(row => row.file === file);
  assert.equal(fetch.status, 200);
  assert.equal(fetch.sha256, expectedSha);
  assert.equal(createHash('sha256').update(await read(file)).digest('hex'), expectedSha);
  checks.push({ checkId: sourceRef, sourceRef, file, mode: file.endsWith('.xml') ? 'fresh-official-xml' : 'fresh-official-json-xhtml', checkedAt: fetch.checkedAt, url: fetch.url, documentVersionDate, articles, responseSha256: fetch.sha256, matchesAcceptedPriorHash: true, result: 'no-relevant-change-detected' });
}
for (const [file, sourceRef, mode, extra] of [
  ['future-index.json', 'SRC-AP19C3-KVG-FUTURE-INDEX-20260928', 'fresh-official-complete-article-impact-index', { query: 'future-index.rq', from: '2026-09-28', to: '2027-12-31', noPublicationYearFilter: true, noPreselectedArticleFilter: true, entries, result: 'no-indexed-future-impact-detected' }],
  ['versions.json', 'AP19C3-CONSOLIDATION-VERSIONS', 'fresh-official-consolidation-metadata', { query: 'versions.rq', versions, result: 'two-kvg-editions-cover-2026-2027-next-edition-2028' }],
]) {
  const fetch = fetches.find(row => row.file === file);
  assert.equal(fetch.status, 200);
  assert.equal(createHash('sha256').update(await read(file)).digest('hex'), fetch.sha256);
  checks.push({ checkId: sourceRef, sourceRef, file, mode, checkedAt: fetch.checkedAt, url: 'https://fedlex.data.admin.ch/sparqlendpoint', responseSha256: fetch.sha256, ...extra });
}
const review = {
  reviewId: 'AP19C3-SOURCE-REVIEW-20260928', kind: 'technical-source-refresh-evidence', checkedOn: '2026-09-28', status: 'completed-technical-review', humanApproval: false, productionApproval: false, runtimeActivation: false,
  report: 'docs/fachrecht/quellenabgleich-ap19c3.md',
  scope: { newLaw: 'kvg', matter: 'kvg-okp-individual-benefits', newPaths: 4, contextCanton: 'BE', sourceCoverage: { from: '2026-01-01', to: '2027-12-31' } },
  checks,
  comparison: { ...extracts.comparison, additionalExclusionArticlesIdentical: true, outsideScopeChangedArticles: ['53','54'], legalEffectiveDateNotDerivedFromConsolidationDate: true },
  productReferenceDate: { routeId: 'be-kvg-okp-product-scope', field: 'legalTriggerDate', meaning: 'Wohnsitz der versicherten Person zum rechtlich massgebenden fristausloesenden Eroeffnungstag', status: 'explicit-implementation-of-accepted-product-boundary-not-statutory-jurisdiction-rule', insurerSeatIndependent: true },
  acceptedPriorEvidence: [
    { sourceRef: 'SRC-AP19C-GSOG-BE', mode: 'accepted-prior-evidence-not-refetched', report: 'docs/fachrecht/quellenabgleich-ap19b.md', url: 'https://www.belex.sites.be.ch/api/de/versions/3144/pdf_file', article: '54', versionFrom: '2026-01-01', versionTo: '2026-04-30', responseSha256: 'dc468710cc6e28ccffd796175e7205361a9ec3c6a0926ddc02caf51acf889cdd' },
  ],
  jurisprudence: { sourceRef: 'JUD-AP17C-BGER-8C-767-2008-20090112', decision: 'BGer 8C_767/2008 vom 12. Januar 2009, E. 4.3.2', mode: 'fresh-full-consideration-read-via-swiss-caselaw-with-identity-check-via-entscheidsuche', checkedOn: '2026-09-28', url: 'https://mcp.opencaselaw.ch/entscheid/bger_8C_767_2008#e-4-3-2', identity: 'CH_BGer_008_8C-767-2008_2009-01-12', result: 'narrow-formal-complaint-correction-only', caseIsKvgSpecific: false, applicationToKvg: 'accepted-transfer-of-general-atsg-procedure-rule', exhaustiveNewerCaseLawSearch: false },
  limits: ['No re-review of all Swiss holiday sources', 'No substantive OKP benefit entitlement determination', 'Source coverage is not normative entry into force', 'No extension beyond four accepted individual OKP paths', 'No general court-order deadline calculation', 'Other C1 and C2 source evidence is not re-dated by this review', 'No human candidate approval or production activation']
};
await writeFile(new URL('source-review.json', here), JSON.stringify(review, null, 2) + '\n');
console.log(JSON.stringify({ checks: checks.length, futureEntries: entries.length, sourceCoverage: review.scope.sourceCoverage, sha256: createHash('sha256').update(await read('source-review.json')).digest('hex') }));
