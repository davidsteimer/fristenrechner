import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const here = new URL('.', import.meta.url);
const fetches = JSON.parse(await readFile(new URL('fetch-results.json', here), 'utf8'));
const extracts = JSON.parse(await readFile(new URL('article-extracts.json', here), 'utf8'));
const index = JSON.parse(await readFile(new URL('future-index.json', here), 'utf8'));
const entries = index.results.bindings.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value.value])));
assert.deepEqual(entries.map(row => [row.date, row.target.split('/').at(-1)]), [['2027-01-01', 'art_46'], ['2027-01-01', 'art_66a'], ['2027-02-01', 'art_57b']]);
for (const article of ['26', '77', '119', '128']) {
  assert.equal(extracts['AVIV-20260101'][article], extracts['AVIV-20260801'][article]);
  assert.equal(extracts['AVIV-20260801'][article], extracts['AVIV-20270101'][article]);
}
for (const law of ['AMG', 'GSOG', 'FRG']) assert.deepEqual(extracts[law].future_versions, []);
const specifications = [
  ['ATSG.xml', 'SRC-AP17C-ATSG-20240101', '2024-01-01', ['2','38','39','40','41','49','51','52','55','56','58','60','61'], '14d2ca1bb3ea367fb2c23dc05a1b6fc7d78c478f7b9bf2c2984fca02968a67ed'],
  ['AVIG.xml', 'SRC-AP19C2-AVIG-20260101', '2026-01-01', ['1','20','100','101'], '0e6df9120acc98d859ece90883a4d768ab98032efc93db41d1da718007bd0411'],
  ['AVIV-20260101.xml', 'SRC-AP19C2-AVIV-20260101', '2026-01-01', ['26','77','119','128','46','66a','57b'], 'e9903774d2e0f629fa55be79f522609111bfdc955e7a26db7f0b3e8ff45c2c8b'],
  ['AVIV-20260801.xml', 'SRC-AP19C2-AVIV-20260801', '2026-08-01', ['26','77','119','128','46','66a','57b'], '5357eb9666f0294d5adcf738e449e1516e965296346b4f0128f1434194f8937b'],
  ['AVIV-20270101.xml', 'SRC-AP19C2-AVIV-20270101', '2027-01-01', ['26','77','119','128','46','66a','57b'], '54f9f68c1691e6e7f89d5877b4b3e82083d5d449ed08d845957305de3d871349'],
  ['AS-2025-814.xml', 'SRC-AP19C2-AVIV-AS-2025-814', '2025-11-26', ['46 paragraph 2','66a paragraph 2','III'], 'efebc389bfa708f2965248204713f6798e83a0276a5745088518de426eb7ac39'],
  ['AS-2026-258.xml', 'SRC-AP19C2-AVIV-AS-2026-258', '2026-05-27', ['57b','II'], 'e05054e3d463535c987b30b86b3bd3289236404c331a6ccc881ce3570eb04fac'],
  ['AMG.json', 'SRC-AP19C2-AMG-BE-ART35', '2026-09-01', ['35'], 'd810db9160f0ca647c3ff1051a4a52c768a6f6c69bfdffdc7c784690994888e5'],
  ['GSOG.json', 'SRC-AP19C-GSOG-BE', '2026-05-01', ['54'], '78095ce15851896ec4bc7067abf3a7327772021d960841b904594dc9d8ae259f'],
  ['FRG.json', 'SRC-AP17C-FRG-BE-20210401', '2021-04-01', ['2'], '1894ea812b87e55dd6bda23262a683bdf7ad8b9e1cbe6e59c91112df733cdee8'],
];
const checks = [];
for (const [file, sourceRef, documentVersionDate, articles, expectedSha] of specifications) {
  const fetch = fetches.find(row => row.file === file);
  assert.equal(fetch.status, 200);
  assert.equal(fetch.sha256, expectedSha);
  assert.equal(createHash('sha256').update(await readFile(new URL(file, here))).digest('hex'), expectedSha);
  checks.push({ checkId: sourceRef, sourceRef, file, mode: file.endsWith('.xml') ? 'fresh-official-xml' : 'fresh-official-json-xhtml', checkedAt: fetch.checkedAt, url: fetch.url, documentVersionDate, articles, responseSha256: fetch.sha256, matchesAcceptedPriorHash: true, result: 'no-relevant-change-detected' });
}
const futureFetch = fetches.find(row => row.file === 'future-index.json');
checks.push({ checkId: 'AP19C2-FUTURE-INDEX', sourceRef: 'SRC-AP19C2-AVIV-FUTURE-INDEX-20260928', mode: 'fresh-official-complete-article-impact-index', checkedAt: futureFetch.checkedAt, url: 'https://fedlex.data.admin.ch/sparqlendpoint', query: 'future-index.rq', response: 'future-index.json', responseSha256: futureFetch.sha256, from: '2026-09-28', to: '2027-12-31', noPublicationYearFilter: true, noPreselectedArticleFilter: true, entries, result: 'three-known-avig-regulation-impacts-no-new-relevant-impact' });
const failedExport = fetches.find(row => row.file === 'AVIV-20270201-response.txt');
assert.equal(failedExport.contentType, 'text/html');
const review = {
  reviewId: 'AP19C2-SOURCE-REVIEW-20260928', kind: 'technical-source-refresh-evidence', checkedOn: '2026-09-28', status: 'completed-technical-review', humanApproval: false, productionApproval: false, runtimeActivation: false,
  report: 'docs/fachrecht/quellenabgleich-ap19c2.md',
  scope: { newLaw: 'avig', matter: 'individual-unemployment-benefit', newPaths: 4, contextCanton: 'BE', sourceCoverage: { from: '2026-01-01', to: '2027-12-31' } },
  checks,
  officialAmendmentReconstruction: { method: 'official-amendment-reconstruction', acceptedMethodReference: 'docs/fachrecht/abnahme-ap19b.md', reconstructedFrom: '2027-02-01', reconstructedThrough: '2027-12-31', evidenceSourceRefs: ['SRC-AP19C2-AVIV-20270101','SRC-AP19C2-AVIV-AS-2025-814','SRC-AP19C2-AVIV-AS-2026-258','SRC-AP19C2-AVIV-FUTURE-INDEX-20260928'], noClaimOfOfficialConsolidatedFebruaryText: true, failedExport: { checkedAt: failedExport.checkedAt, url: failedExport.url, status: failedExport.status, contentType: failedExport.contentType, responseSha256: failedExport.sha256, result: 'html-fallback-not-valid-legal-source' } },
  acceptedPriorEvidence: [
    { sourceRef: 'SRC-AP19C2-AMG-BE-20220201', mode: 'accepted-prior-evidence-not-refetched', report: 'docs/fachrecht/quellenabgleich-ap19b.md', url: 'https://www.belex.sites.be.ch/api/de/versions/2480/pdf_file', article: '35', versionFrom: '2022-02-01', versionTo: '2026-08-31', responseSha256: '3876608893f55c7716efcdaa0af6364c86370750a724cb8308dd10697e31305b' },
    { mode: 'accepted-prior-evidence-not-refetched', report: 'docs/fachrecht/quellenabgleich-ap19b.md', url: 'https://www.belex.sites.be.ch/api/de/versions/3144/pdf_file', article: '54', versionFrom: '2026-01-01', versionTo: '2026-04-30', responseSha256: 'dc468710cc6e28ccffd796175e7205361a9ec3c6a0926ddc02caf51acf889cdd' },
  ],
  jurisprudence: { decision: 'BGer 8C_767/2008 vom 12. Januar 2009, E. 4.3.2', mode: 'fresh-full-consideration-read-via-swiss-caselaw-with-identity-check-via-entscheidsuche', checkedOn: '2026-09-28', url: 'https://mcp.opencaselaw.ch/entscheid/bger_8C_767_2008#e-4-3-2', identity: 'CH_BGer_008_8C-767-2008_2009-01-12', result: 'narrow-formal-complaint-correction-only', exhaustiveNewerCaseLawSearch: false },
  limits: ['No re-review of all Swiss holiday sources', 'Source coverage is not normative entry into force', 'No extension beyond four approved ALE paths', 'C1 sources outside this bounded refresh retain prior evidence only', 'No human candidate approval or production activation']
};
await writeFile(new URL('source-review.json', here), JSON.stringify(review, null, 2) + '\n');
console.log(JSON.stringify({ checks: checks.length, futureEntries: entries.length, sourceCoverage: review.scope.sourceCoverage, result: review.status }));
