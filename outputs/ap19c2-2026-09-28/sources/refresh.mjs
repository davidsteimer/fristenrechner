import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const here = new URL('.', import.meta.url);
const cc = (work, date) => `https://www.fedlex.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/${work}/${date}/de/xml/fedlex-data-admin-ch-eli-cc-${work.replaceAll('/', '-')}-${date}-de-xml.xml`;
const oc = (year, n) => `https://www.fedlex.admin.ch/filestore/fedlex.data.admin.ch/eli/oc/${year}/${n}/de/xml/fedlex-data-admin-ch-eli-oc-${year}-${n}-de-xml.xml`;
const targets = [
  ['ATSG.xml', cc('2002/510', '20240101')],
  ['AVIG.xml', cc('1982/2184_2184_2184', '20260101')],
  ['AVIV-20260101.xml', cc('1983/1205_1205_1205', '20260101')],
  ['AVIV-20260801.xml', cc('1983/1205_1205_1205', '20260801')],
  ['AVIV-20270101.xml', cc('1983/1205_1205_1205', '20270101')],
  ['AVIV-20270201-response.txt', cc('1983/1205_1205_1205', '20270201')],
  ['AS-2025-814.xml', oc(2025, 814)],
  ['AS-2026-258.xml', oc(2026, 258)],
  ['AMG.json', 'https://www.belex.sites.be.ch/api/de/texts_of_law/836.11'],
  ['GSOG.json', 'https://www.belex.sites.be.ch/api/de/texts_of_law/161.1'],
  ['FRG.json', 'https://www.belex.sites.be.ch/api/de/texts_of_law/555.1'],
];
const query = `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT DISTINCT ?work ?impact ?date ?target ?source WHERE {
 VALUES ?work {
  <https://fedlex.data.admin.ch/eli/cc/2002/510>
  <https://fedlex.data.admin.ch/eli/cc/1982/2184_2184_2184>
  <https://fedlex.data.admin.ch/eli/cc/1983/1205_1205_1205>
 }
 ?impact jolux:impactToLegalResource ?target;
   jolux:legalResourceImpactHasDateEntryInForce ?date.
 ?target jolux:legalResourceSubdivisionIsPartOf ?work.
 OPTIONAL { ?impact jolux:impactFromLegalResource/jolux:legalResourceSubdivisionIsPartOf ?source }
 FILTER(str(?date) >= "2026-09-28" && str(?date) <= "2027-12-31")
} ORDER BY ?work ?date ?target`;
await writeFile(new URL('future-index.rq', here), query + '\n');
targets.push(['future-index.json', 'https://fedlex.data.admin.ch/sparqlendpoint?query=' + encodeURIComponent(query)]);
const results = [];
for (const [file, url] of targets) {
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetch(url, { headers: { Accept: file === 'future-index.json' ? 'application/sparql-results+json' : file.endsWith('.json') ? 'application/json' : '*/*' }, signal: AbortSignal.timeout(30000) });
    const data = Buffer.from(await response.arrayBuffer());
    await writeFile(new URL(file, here), data);
    results.push({ file, url, checkedAt, status: response.status, contentType: response.headers.get('content-type'), bytes: data.length, sha256: createHash('sha256').update(data).digest('hex'), prefix: data.toString('utf8').slice(0, 70) });
  } catch (error) {
    results.push({file, url, checkedAt, error: String(error)});
  }
}
await writeFile(new URL('fetch-results.json', here), JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
