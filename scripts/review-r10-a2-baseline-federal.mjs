// R10-A2 BASELINE, federal partition. New evidence only, no product writes.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const base = 'outputs/r10-a2-2026-10-28/baseline-federal';
const inventoryPath = 'outputs/r10-a1-2026-10-28/sources/source-inventory.json';
const priorPath = 'outputs/release-mvp09-2026-10-18/sources/baseline-review.json';
const hash = b => createHash('sha256').update(b).digest('hex');
const read = async p => fs.readFile(path.join(root, p));
const json = async p => JSON.parse(await read(p));
const descriptor = async p => { const b = await read(p); return { path: p, sha256: hash(b), byteLength: b.length }; };
const emitNew = async (p, value) => {
  assert.ok(p.startsWith(base + '/'));
  await fs.mkdir(path.dirname(path.join(root, p)), { recursive: true });
  await fs.writeFile(path.join(root, p), value instanceof Uint8Array ? value : JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
};
assert.equal((await descriptor(inventoryPath)).sha256, 'e9949adea7ef5c0192ed5015ed8bfac7594bdb73c1417f4e81f0df3dee837ec6');
const inventory = await json(inventoryPath);
const prior = await json(priorPath);
const rows = inventory.rows.filter(r => r.ownerLotId === 'R10-A2-BASELINE' && r.urls.some(u => /fedlex(\.data)?\.admin\.ch/.test(new URL(u).hostname)));
assert.equal(rows.length, 44);
const ids = new Set(rows.map(r => r.sourceId));
const oldRows = prior.rows.filter(r => ids.has(r.sourceId));
assert.equal(oldRows.length, 44);
const workOf = r => r.historicalAssessment.versionFinding.work;
const works = [...new Set(rows.map(workOf).filter(Boolean))].sort();
assert.equal(works.length, 25);
const general = rows.filter(r => ['SRC-BGG-20260401', 'SRC-BPR-20221023', 'SRC-BUNDESFEIERTAG-19940701', 'SRC-STPO-20250401', 'SRC-VPR-20220701', 'SRC-VWVG-20220701', 'SRC-ZPO-20260701'].includes(r.sourceId)).map(workOf).sort();
assert.equal(general.length, 7);
const values = works.map(w => `<${w}>`).join('\n');
const generalIn = general.map(w => `<${w}>`).join(',');
const prefix = 'PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>\n';
const versionQuery = prefix + `SELECT DISTINCT ?work ?version ?start ?end ?expression ?xml WHERE {
 VALUES ?work { ${values} }
 ?version jolux:isMemberOf ?work; jolux:dateApplicability ?start.
 OPTIONAL { ?version jolux:dateEndApplicability ?end }
 OPTIONAL {
  ?version jolux:isRealizedBy ?expression.
  ?expression jolux:language <http://publications.europa.eu/resource/authority/language/DEU>; jolux:isEmbodiedBy ?manifestation.
  ?manifestation jolux:format <http://publications.europa.eu/resource/authority/file-type/XML>; jolux:isExemplifiedBy ?xml.
 }
 FILTER((!BOUND(?end) || str(?end) >= "2026-01-01") && (?work IN (${generalIn}) || str(?start) <= "2027-12-31"))
} ORDER BY ?work ?start ?xml`;
const impactQuery = prefix + `SELECT DISTINCT ?work ?impact ?date ?target ?source WHERE {
 VALUES ?work { ${values} }
 { ?impact jolux:impactToLegalResource ?work. BIND(?work AS ?target) }
 UNION
 { ?impact jolux:impactToLegalResource ?target. ?target jolux:legalResourceSubdivisionIsPartOf ?work. }
 ?impact jolux:legalResourceImpactHasDateEntryInForce ?date.
 OPTIONAL { ?impact jolux:impactFromLegalResource/jolux:legalResourceSubdivisionIsPartOf ?source }
 FILTER(str(?date) >= "2026-01-01" && (?work IN (${generalIn}) || str(?date) <= "2027-12-31"))
} ORDER BY ?work ?date ?target ?source`;
const targets = new Map();
for (const row of oldRows) for (const e of row.freshEvidence) {
  const t = targets.get(e.url) ?? { id: path.basename(e.path).replace(/\.response$/, '').replace(/\.xml$/, ''), url: e.url,
    baseline: { path: e.path, sha256: e.sha256, byteLength: e.byteLength, originalRetrievedAt: e.retrievedAt }, sourceIds: [], role: e.method };
  t.sourceIds.push(row.sourceId);
  targets.set(e.url, t);
}
assert.equal(targets.size, 62);
const indexUrl = query => 'https://fedlex.data.admin.ch/sparqlendpoint?query=' + encodeURIComponent(query);
for (const [id, query] of [['r10-versions-scoped', versionQuery], ['r10-impacts-scoped', impactQuery]]) targets.set(indexUrl(query), { id, url: indexUrl(query), query, sourceIds: [...ids].sort(), role: 'fresh-official-published-version-index-not-a-norm-text' });
const records = [];
async function retrieve(target, index) {
  const record = { ...target, sourceIds: [...new Set(target.sourceIds)].sort(), retrievedAt: new Date().toISOString() };
  try {
    const host = new URL(target.url).hostname;
    assert.ok(['www.fedlex.admin.ch', 'fedlex.data.admin.ch', 'www.bj.admin.ch'].includes(host), host);
    const response = await fetch(target.url, { signal: AbortSignal.timeout(45000), headers: { Accept: target.url.includes('sparqlendpoint') ? 'application/sparql-results+json' : '*/*' } });
    const b = new Uint8Array(await response.arrayBuffer());
    const p = `${base}/raw/${String(index + 1).padStart(3, '0')}-${target.id.replace(/[^A-Za-z0-9_.-]/g, '_')}.response`;
    await emitNew(p, b);
    const text = new TextDecoder().decode(b);
    let bodyKind = /<akomaNtoso[\s>]|<akn:akomaNtoso[\s>]/.test(text) ? 'akn-xml' : /<html[\s>]/i.test(text) ? 'html-not-norm-xml' : 'other';
    if (target.url.includes('sparqlendpoint')) {
      try { const j = JSON.parse(text); bodyKind = Array.isArray(j.results?.bindings) ? 'sparql-results' : 'json-not-result-set'; } catch { bodyKind = 'unparseable-index'; }
    }
    Object.assign(record, { status: response.status, finalUrl: response.url, headers: Object.fromEntries(response.headers), contentType: response.headers.get('content-type'), path: p,
      byteLength: b.length, sha256: hash(b), bodyKind, wholeBytesEqual: target.baseline ? hash(b) === target.baseline.sha256 : null });
  } catch (e) { record.error = String(e) + (e.cause?.message ? ': ' + e.cause.message : ''); }
  records[index] = record;
  console.log(JSON.stringify({ index, id: record.id, status: record.status, bodyKind: record.bodyKind, equal: record.wholeBytesEqual, error: record.error }));
}
async function batch(ts, offset) {
  let next = 0;
  async function worker() { while (next < ts.length) { const n = next++; await retrieve(ts[n], n + offset); } }
  await Promise.all(Array.from({ length: 4 }, worker));
}
await batch([...targets.values()], 0);
const index = records.find(r => r.id === 'r10-versions-scoped');
if (index.status === 200 && index.bodyKind === 'sparql-results') {
  const bs = (await json(index.path)).results.bindings.map(b => Object.fromEntries(Object.entries(b).map(([k,v]) => [k,v.value])));
  const additions = new Map();
  for (const b of bs.filter(b => b.xml)) {
    if (targets.has(b.xml) || additions.has(b.xml)) continue;
    additions.set(b.xml, { id: 'discovered-' + b.work.replace('https://fedlex.data.admin.ch/eli/cc/', '').replaceAll('/', '-') + '-' + b.start,
      url: b.xml, sourceIds: rows.filter(r => workOf(r) === b.work).map(r => r.sourceId), role: 'fresh-official-XML-manifestation-discovered-from-current-version-index', discoveredFrom: index.path,
      work: b.work, version: b.version, applicabilityFrom: b.start, applicabilityTo: b.end ?? null });
  }
  await batch([...additions.values()], records.length);
}
const report = { reviewId: 'R10-A2-BASELINE-federal-retrievals', checkedOn: new Date().toISOString().slice(0,10), createdAt: new Date().toISOString(),
  recordStatus: 'evidence-only-not-reviewed', humanApproval: false, sourceReleaseApproved: false, ownerLotId: 'R10-A2-BASELINE', sourceIds: [...ids].sort(),
  sourceInventory: await descriptor(inventoryPath), historicalReview: { ...await descriptor(priorPath), originalCheckedOn: '2026-10-18' },
  windows: { socialAssessment: { from: '2026-01-01', to: '2027-12-31' }, generalProfiles: 'Already published official versions/impacts with no upper-year filter. No product window extension.' },
  works, generalWorks: general, retrievals: records,
  limits: ['HTTP 200, XML availability and metadata identity do not themselves establish a content review.', 'Historical review dates remain historical.', 'No product, source register, release, package or environment changes.'] };
await emitNew(`${base}/retrievals.json`, report);
console.log(JSON.stringify({ count: records.length, ok: records.filter(r=>r.status===200).length, nonXml200: records.filter(r=>r.status===200&&r.bodyKind==='html-not-norm-xml').map(r=>r.id), failed: records.filter(r=>r.status!==200).map(r=>({id:r.id,error:r.error,status:r.status})), changed: records.filter(r=>r.wholeBytesEqual===false).map(r=>r.id) }));
