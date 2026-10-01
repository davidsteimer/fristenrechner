// SPDX-License-Identifier: AGPL-3.0-only
// Fresh read-only source retrieval. Raw responses stay in private .work.
// Existing source proofs, candidates and live source governance remain unchanged.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const output = 'outputs/release-mvp06-2026-10-01/sources/remainder';
const run = process.argv[2] || 'run-01';
assert.match(run, /^run-\d{2}$/);
const rawRoot = `.work/release-mvp06-2026-10-01/remainder/${run}`;
const read = path => readFile(resolve(root, path));
const json = async path => JSON.parse(await read(path));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const emit = async (path, value) => {
  await mkdir(dirname(resolve(root, path)), {recursive: true});
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(JSON.stringify(value, null, 2) + '\n');
  await writeFile(resolve(root, path), bytes, {flag: 'wx'});
  assert.ok((await read(path)).equals(bytes));
};
const priorRoot = 'outputs/release-mvp05-2026-09-28/sources';
const oldManifest = await json('data/releases/2026-09-28-mvp-05-approved.1/manifest.json');
const remainder = await json(`${priorRoot}/remainder/source-review.json`);
const originalFetches = await json(`${priorRoot}/remainder/fetch-results.json`);
const ap19 = await json(`${priorRoot}/ap19-source-review.json`);
const coveredElsewhere = [
  'SRC-AP17C-ATSG-20240101', 'SRC-ATSG-20240101', 'SRC-AP19C-GSOG-BE',
  'SRC-AP19C-EGELG-BE-20250101', 'SRC-AP19C-ELG-20260101', 'SRC-AP19C-ELG-20270101',
  'SRC-AP17C-VRPG-BE-20260901', 'SRC-VRPG-BE-20230801'
];
const sourceIds = oldManifest.sourceSummary.sourceIds.filter(id => !coveredElsewhere.includes(id));
assert.equal(sourceIds.length, 45);
const targets = new Map();
const bindings = [];
const add = target => {
  const existing = targets.get(target.url);
  if (existing) {
    if (target.baselineSha256 && existing.baselineSha256) assert.equal(target.baselineSha256, existing.baselineSha256);
    return existing.id;
  }
  targets.set(target.url, target);
  return target.id;
};
for (const sourceId of sourceIds) {
  const old = remainder.checks.find(x => x.sourceId === sourceId);
  if (old) {
    const fetched = originalFetches.retrievals.find(x => x.file === old.retrievedFile);
    const targetId = add({id: sourceId, url: old.retrievedUrl, file: old.retrievedFile,
      baselinePath: `${priorRoot}/remainder/${old.retrievedFile}`, baselineSha256: old.retrievedSha256,
      sourceClassification: sourceId.startsWith('JUD-') ? 'judgment-mirror-not-official-publication' : 'official-original',
      accept: fetched.accept || '*/*'});
    bindings.push({sourceId, targetId, baselineEvidencePath: `${priorRoot}/remainder/source-review.json`,
      baselineFinding: old.finding, baselinePinpoints: old.pinpointsReadToday || [], priorReviewDate: '2026-09-28'});
    continue;
  }
  const entry = ap19.entries.find(x => x.sourceId === sourceId);
  assert.ok(entry, sourceId);
  if (sourceId === 'JUD-AP17C-BGER-8C-767-2008-20090112') {
    const targetId = add({id: sourceId, url: 'https://entscheidsuche.ch/docs/CH_BGer/CH_BGer_008_8C-767-2008_2009-01-12.html',
      file: `${sourceId}.html`, sourceClassification: 'judgment-mirror-not-official-publication'});
    bindings.push({sourceId, targetId, baselineEvidencePath: entry.evidencePath,
      baselineFinding: 'Narrow formal complaint correction only, no blanket application to later court orders',
      baselinePinpoints: ['4.3.1', '4.3.2'], priorReviewDate: '2026-09-28'});
    continue;
  }
  if (sourceId.includes('FUTURE-INDEX')) {
    bindings.push({sourceId, targetId: 'future-index', baselineEvidencePath: entry.evidencePath, priorReviewDate: '2026-09-28'});
    continue;
  }
  let path = entry.originalPath, url = entry.officialUrl, hash = entry.originalSha256;
  let articles = entry.articles || [];
  if (!path) {
    const review = await json(entry.evidencePath);
    const check = review.checks.find(x => x.checkId === entry.checkId);
    assert.ok(check, sourceId);
    path = `${dirname(entry.evidencePath)}/${check.file}`;
    url = check.url;
    hash = check.responseSha256;
    articles = check.articles || [];
  }
  const targetId = add({id: sourceId, url, file: path.split('/').pop(), baselinePath: path,
    baselineSha256: hash, sourceClassification: 'official-original'});
  bindings.push({sourceId, targetId, articles, baselineEvidencePath: entry.evidencePath || `${priorRoot}/ap19-source-review.json`, priorReviewDate: '2026-09-28'});
}
const works = [
  '2010/267', '2010/262', '2006/218', '1969/737_757_755', '1978/688_688_688',
  '1978/712_712_712', '1994/1340_1340_1340', '63/837_843_843', '1959/827_857_845',
  '1961/29_29_29', '1982/1676_1676_1676', '1982/2184_2184_2184', '1983/1205_1205_1205', '1995/1328_1328_1328'
];
const values = works.map(work => `<https://fedlex.data.admin.ch/eli/cc/${work}>`).join('\n');
const queries = {
  'future-index': `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT DISTINCT ?work ?impact ?date ?target ?source WHERE {
 VALUES ?work { ${values} }
 { ?impact jolux:impactToLegalResource ?work. BIND(?work AS ?target) }
 UNION
 { ?impact jolux:impactToLegalResource ?target. ?target jolux:legalResourceSubdivisionIsPartOf ?work. }
 ?impact jolux:legalResourceImpactHasDateEntryInForce ?date.
 OPTIONAL { ?impact jolux:impactFromLegalResource/jolux:legalResourceSubdivisionIsPartOf ?source }
 FILTER(str(?date) >= "2026-01-01" && str(?date) <= "2027-12-31")
} ORDER BY ?work ?date ?target`,
  versions: `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT DISTINCT ?work ?version ?from ?to WHERE {
 VALUES ?work { ${values} }
 ?version jolux:isMemberOf ?work; jolux:dateApplicability ?from.
 OPTIONAL { ?version jolux:dateEndApplicability ?to }
 FILTER(str(?from) <= "2027-12-31" && (!BOUND(?to) || str(?to) >= "2026-01-01"))
} ORDER BY ?work ?from`
};
for (const [id, query] of Object.entries(queries)) {
  add({id, file: `${id}.json`, url: 'https://fedlex.data.admin.ch/sparqlendpoint?query=' + encodeURIComponent(query),
    accept: 'application/sparql-results+json', query, sourceClassification: 'official-index'});
}
const futureFetches = await json(`${priorRoot}/remainder/future-fetch-results.json`);
for (const target of futureFetches) add({id: target.file.replace(/\.xml$/, ''), file: target.file, url: target.url,
  baselinePath: `${priorRoot}/remainder/${target.file}`, baselineSha256: target.sha256,
  sourceClassification: 'official-monitoring-original'});
const bj = originalFetches.retrievals.find(x => x.id === 'OF001-BJ');
add({id: 'OF001-BJ', file: bj.file, url: bj.url, baselinePath: `${priorRoot}/remainder/${bj.file}`,
  baselineSha256: bj.sha256, sourceClassification: 'official-monitoring-page'});
const avivFetch = (await json('outputs/ap19c2-2026-09-28/sources/fetch-results.json')).find(x => x.file === 'AVIV-20270201-response.txt');
add({id: 'AVIV-20270201-availability', file: avivFetch.file, url: avivFetch.url, sourceClassification: 'official-availability-check'});
const results = [];
const list = [...targets.values()];
for (let offset = 0; offset < list.length; offset += 4) {
  results.push(...await Promise.all(list.slice(offset, offset + 4).map(async target => {
    const record = {...target, checkedAt: new Date().toISOString()};
    if (target.baselinePath) assert.equal(sha(await read(target.baselinePath)), target.baselineSha256, `Baseline changed ${target.id}`);
    try {
      const response = await fetch(target.url, {headers: {Accept: target.accept || '*/*'}, signal: AbortSignal.timeout(30000)});
      const bytes = Buffer.from(await response.arrayBuffer());
      const rawPath = `${rawRoot}/${target.file}`;
      await emit(rawPath, bytes);
      Object.assign(record, {status: response.status, contentType: response.headers.get('content-type'), bytes: bytes.length,
        sha256: sha(bytes), rawPath, finalUrl: response.url, prefix: bytes.toString('utf8').slice(0, 80),
        previousWholeDocumentHashMatches: target.baselineSha256 ? sha(bytes) === target.baselineSha256 : null});
    } catch (error) { record.error = String(error); }
    return record;
  })));
  console.log(JSON.stringify({completed: results.length, total: list.length, failed: results.filter(x => x.error || x.status !== 200).map(x => x.id)}));
}
await emit(`${output}/fetch-${run}.json`, {reviewId: 'MVP06-REMAINDER-RETRIEVAL-20261001', checkedOn: '2026-10-01',
  completedAt: new Date().toISOString(), sourceIds, coveredElsewhere, bindings, retrievals: results,
  formalApproval: false, rawFilesPrivate: true, runtimeActivation: false});
console.log(JSON.stringify({file: `${output}/fetch-${run}.json`, total: results.length, changed: results.filter(x => x.previousWholeDocumentHashMatches === false).map(x => x.id)}));
