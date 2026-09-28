import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const here = new URL('.', import.meta.url);
const cc = (work, date) => `https://www.fedlex.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/${work}/${date}/de/xml/fedlex-data-admin-ch-eli-cc-${work.replaceAll('/', '-')}-${date}-de-xml.xml`;
const targets = [
  ['ATSG.xml', cc('2002/510', '20240101')],
  ['KVG-20260101.xml', cc('1995/1328_1328_1328', '20260101')],
  ['KVG-20260701.xml', cc('1995/1328_1328_1328', '20260701')],
  ['GSOG.json', 'https://www.belex.sites.be.ch/api/de/texts_of_law/161.1'],
  ['FRG.json', 'https://www.belex.sites.be.ch/api/de/texts_of_law/555.1'],
];
const query = `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT DISTINCT ?work ?impact ?date ?target ?source WHERE {
 VALUES ?work {
  <https://fedlex.data.admin.ch/eli/cc/2002/510>
  <https://fedlex.data.admin.ch/eli/cc/1995/1328_1328_1328>
 }
 ?impact jolux:impactToLegalResource ?target;
   jolux:legalResourceImpactHasDateEntryInForce ?date.
 ?target jolux:legalResourceSubdivisionIsPartOf ?work.
 OPTIONAL { ?impact jolux:impactFromLegalResource/jolux:legalResourceSubdivisionIsPartOf ?source }
 FILTER(str(?date) >= "2026-09-28" && str(?date) <= "2027-12-31")
} ORDER BY ?work ?date ?target`;
const metadataQuery = `SELECT ?resource ?predicate ?value WHERE {
 VALUES ?resource {
  <https://fedlex.data.admin.ch/eli/cc/2002/510>
  <https://fedlex.data.admin.ch/eli/cc/1995/1328_1328_1328>
  <https://fedlex.data.admin.ch/eli/cc/1995/1328_1328_1328/20260701>
 }
 ?resource ?predicate ?value
} ORDER BY ?resource ?predicate ?value`;
for (const [name, text] of [['future-index', query], ['version-metadata', metadataQuery]]) {
  await writeFile(new URL(`${name}.rq`, here), text + '\n');
  targets.push([`${name}.json`, 'https://fedlex.data.admin.ch/sparqlendpoint?query=' + encodeURIComponent(text)]);
}
const results = [];
for (const [file, url] of targets) {
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetch(url, { headers: { Accept: ['future-index.json', 'version-metadata.json'].includes(file) ? 'application/sparql-results+json' : file.endsWith('.json') ? 'application/json' : '*/*' }, signal: AbortSignal.timeout(30000) });
    const data = Buffer.from(await response.arrayBuffer());
    await writeFile(new URL(file, here), data);
    results.push({ file, url, checkedAt, status: response.status, contentType: response.headers.get('content-type'), bytes: data.length, sha256: createHash('sha256').update(data).digest('hex'), prefix: data.toString('utf8').slice(0, 70) });
  } catch (error) {
    results.push({ file, url, checkedAt, error: String(error) });
  }
}
await writeFile(new URL('fetch-results.json', here), JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
