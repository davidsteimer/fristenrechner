// SPDX-License-Identifier: AGPL-3.0-only
// Bounded read-only index addendum. Earlier source proofs remain unchanged.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const path = 'outputs/release-mvp06-2026-10-01/sources/ap20-index-addendum.json';
const rawRoot = '.work/release-mvp06-2026-10-01/ap20-index-addendum';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = p => readFile(resolve(root, p));
const json = async p => JSON.parse(await read(p));
const paths = {
  eog: 'outputs/release-mvp06-2026-10-01/sources/ap20c1-refresh.json',
  c2: 'outputs/ap20c2-2026-10-01/quellenkontrolle.json',
  c3: 'outputs/ap20c3-2026-10-01/quellenkontrolle.json'
};
const eog = await json(paths.eog), c2 = await json(paths.c2), c3 = await json(paths.c3);
const groups = [
  {name: 'EOG-EOV', path: paths.eog, indexes: eog.federalIndexes},
  {name: 'AP20C2-FamZG-FLG-FLV-ATSG', path: paths.c2, indexes: c2.federalIndexes},
  {name: 'AP20C2-FamZV-supporting-check', path: paths.c2, indexes: c2.additionalFamZVReview.federalIndexes},
  {name: 'AP20C3-MVG-MVV-UELG-UELV-ATSG', path: paths.c3, indexes: c3.federalIndexes},
  {name: 'AP20C3-ELG-cross-reference', path: paths.c3, indexes: [
    {name: 'versions', ...c3.elgCrossReference.versionIndex}, {name: 'impacts', ...c3.elgCrossReference.futureIndex}
  ], work: 'https://fedlex.data.admin.ch/eli/cc/2007/804', previousImpactWindowFrom: '2026-09-30'}
];
const works = [...new Set(groups.flatMap(group => group.indexes.find(index => index.name === 'versions').rows.map(row => row.work || group.work)))].sort();
assert.equal(works.length, 12);
const values = works.map(work => `<${work}>`).join('\n');
const queries = {
  versions: `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT DISTINCT ?work ?version ?start ?end ?expression ?xml WHERE {
 VALUES ?work { ${values} }
 ?version jolux:isMemberOf ?work; jolux:dateApplicability ?start.
 OPTIONAL { ?version jolux:dateEndApplicability ?end }
 OPTIONAL {
   ?version jolux:isRealizedBy ?expression.
   ?expression jolux:language <http://publications.europa.eu/resource/authority/language/DEU>;
     jolux:isEmbodiedBy ?manifestation.
   ?manifestation jolux:format <http://publications.europa.eu/resource/authority/file-type/XML>;
     jolux:isExemplifiedBy ?xml.
 }
 FILTER(str(?start) <= "2027-12-31" && (!BOUND(?end) || str(?end) >= "2026-01-01"))
} ORDER BY ?work ?start`,
  impacts: `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT DISTINCT ?work ?impact ?date ?target ?source WHERE {
 VALUES ?work { ${values} }
 { ?impact jolux:impactToLegalResource ?work. BIND(?work AS ?target) }
 UNION
 { ?impact jolux:impactToLegalResource ?target. ?target jolux:legalResourceSubdivisionIsPartOf ?work. }
 ?impact jolux:legalResourceImpactHasDateEntryInForce ?date.
 OPTIONAL { ?impact jolux:impactFromLegalResource/jolux:legalResourceSubdivisionIsPartOf ?source }
 FILTER(str(?date) >= "2026-01-01" && str(?date) <= "2027-12-31")
} ORDER BY ?work ?date ?target`
};
const canonical = value => JSON.stringify(Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))));
const uniqueRows = rows => [...new Map(rows.map(row => [canonical(row), row])).values()].sort((a, b) => canonical(a).localeCompare(canonical(b)));
const results = [];
for (const [name, query] of Object.entries(queries)) {
  const url = 'https://fedlex.data.admin.ch/sparqlendpoint?query=' + encodeURIComponent(query);
  const checkedAt = new Date().toISOString();
  const response = await fetch(url, {headers: {Accept: 'application/sparql-results+json'}, signal: AbortSignal.timeout(30000)});
  const bytes = Buffer.from(await response.arrayBuffer());
  await mkdir(resolve(root, rawRoot), {recursive: true});
  const rawPath = `${rawRoot}/${name}.json`;
  await writeFile(resolve(root, rawPath), bytes, {flag: 'wx'});
  assert.equal(response.status, 200);
  const raw = JSON.parse(bytes);
  const rows = uniqueRows(raw.results.bindings.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value.value]))));
  results.push({name, query, receipt: {url, finalUrl: response.url, checkedAt, status: response.status,
    contentType: response.headers.get('content-type'), bytes: bytes.length, sha256: sha(bytes), rawPath}, rows});
}
const comparisons = [];
for (const group of groups) for (const previous of group.indexes) {
  const scopedWorks = [...new Set(group.indexes.find(index => index.name === 'versions').rows.map(row => row.work || group.work))].sort();
  const keys = [...new Set(previous.rows.flatMap(row => Object.keys(row)))].sort();
  // Empty prior index: retain the complete standard columns to expose additions.
  if (!keys.length) keys.push(...(previous.name === 'impacts' ? ['date', 'impact', 'source', 'target', 'work'] : ['end', 'expression', 'start', 'version', 'work', 'xml']));
  const project = row => Object.fromEntries(keys.filter(key => row[key] !== undefined).map(key => [key, row[key]]));
  const freshAll = results.find(result => result.name === previous.name).rows.filter(row => scopedWorks.includes(row.work));
  const freshComparable = uniqueRows(freshAll.filter(row => previous.name !== 'impacts' || !group.previousImpactWindowFrom || row.date >= group.previousImpactWindowFrom).map(project));
  const old = uniqueRows(previous.rows);
  const addedRows = freshComparable.filter(row => !old.some(other => canonical(other) === canonical(row)));
  const removedRows = old.filter(row => !freshComparable.some(other => canonical(other) === canonical(row)));
  comparisons.push({group: group.name, name: previous.name, previousEvidencePath: group.path,
    works: scopedWorks, comparedFields: keys, previousWindowFrom: previous.name === 'impacts' ? group.previousImpactWindowFrom || '2026-01-01' : 'interval-overlap',
    freshComparableRows: freshComparable, previousCount: old.length, freshComparableCount: freshComparable.length,
    previousProjectionSha256: sha(Buffer.from(JSON.stringify(old))), freshProjectionSha256: sha(Buffer.from(JSON.stringify(freshComparable))),
    addedRows, removedRows, identicalInPriorWindow: addedRows.length === 0 && removedRows.length === 0,
    additionalEarlierWindowRows: previous.name === 'impacts' && group.previousImpactWindowFrom
      ? freshAll.filter(row => row.date < group.previousImpactWindowFrom) : []});
}
const originalVersions = uniqueRows(groups.flatMap(group => group.indexes.find(index => index.name === 'versions').rows
  .map(row => row.work ? row : {...row, work: group.work, expression: `${row.version}/de`})));
const originalImpacts = uniqueRows(groups.flatMap(group => group.indexes.find(index => index.name === 'impacts').rows
  .map(row => row.work ? row : {...row, work: group.work})));
const currentVersions = results.find(result => result.name === 'versions').rows;
const currentImpacts = results.find(result => result.name === 'impacts').rows;
const deltas = (old, current) => ({added: current.filter(row => !old.some(other => canonical(other) === canonical(row))),
  removed: old.filter(row => !current.some(other => canonical(other) === canonical(row)))});
const versionDelta = deltas(originalVersions, currentVersions), impactDelta = deltas(originalImpacts, currentImpacts);
const noDelta = comparisons.every(comparison => comparison.identicalInPriorWindow)
  && !versionDelta.added.length && !versionDelta.removed.length && !impactDelta.added.length && !impactDelta.removed.length;
const evidenceBindings = await Promise.all([...Object.values(paths), 'outputs/release-mvp06-2026-10-01/sources/ap20-index-addendum.mjs'].map(async file => {
  const bytes = await read(file); return {path: file, sha256: sha(bytes), byteLength: bytes.length};
}));
const report = {
  reviewId: 'MVP06-AP20-INDEX-ADDENDUM-20261001', checkedOn: '2026-10-01', completedAt: new Date().toISOString(),
  recordStatus: 'candidate', formalApproval: false, humanApproval: false, runtimeActivation: false, dataPromotionApproved: false,
  purpose: 'Resolve the review concern about FILTER-only whole-work UNION branches using fresh explicit triple patterns, without changing any earlier proof.',
  scope: {from: '2026-01-01', to: '2027-12-31', works, lawCount: works.length,
    wholeWorkImpactsIncluded: true, subdivisionImpactsIncluded: true, optionalOpenEndedVersionIntervals: true,
    publicationYearFilter: null, preselectedArticleFilter: null,
    supportingFamZVIncluded: true, noNewManifestSourceId: true},
  indexes: results, comparisons, fullWindowDeltas: {versions: versionDelta, impacts: impactDelta},
  counts: {officialRequests: results.length, versions: currentVersions.length, impacts: currentImpacts.length,
    wholeWorkImpacts: currentImpacts.filter(row => row.target === row.work).length,
    exactPriorGroupComparisons: comparisons.length, addedVersionRows: versionDelta.added.length,
    removedVersionRows: versionDelta.removed.length, addedImpactRows: impactDelta.added.length, removedImpactRows: impactDelta.removed.length},
  noDeltaInComparedIndexes: noDelta,
  finding: noDelta ? 'The explicit complete query returns the same full-window union of version and impact rows as the separate earlier proofs. The scope-evidence concern is closed without legal or model changes.'
    : 'Differences are listed explicitly and require bounded assessment. This addendum does not approve or dismiss a legal delta.',
  normalization: 'Property ordering and response row order only. ELG rows receive their explicit work identity. Its omitted expression column is deterministically derived from the same German version identity for the union comparison. No dates, targets, sources or XML addresses are removed from the respective prior-scope comparisons.',
  limitations: ['Index metadata does not itself prove full-text retrieval', 'No general legal or case-law research',
    'No human source approval and no source-register, runtime, publication or environment change',
    'Earlier narrower query results remain historical evidence and are not rewritten'],
  evidenceBindings
};
const bytes = Buffer.from(JSON.stringify(report, null, 2) + '\n');
await writeFile(resolve(root, path), bytes, {flag: 'wx'});
assert.ok((await read(path)).equals(bytes));
console.log(JSON.stringify({path, sha256: sha(bytes), counts: report.counts, noDeltaInComparedIndexes: noDelta}));
