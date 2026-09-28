import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const here = new URL('.', import.meta.url);
const query = `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT DISTINCT ?work ?version ?from ?to WHERE {
 VALUES ?work {
  <https://fedlex.data.admin.ch/eli/cc/2002/510>
  <https://fedlex.data.admin.ch/eli/cc/1995/1328_1328_1328>
 }
 ?version jolux:isMemberOf ?work; jolux:dateApplicability ?from.
 OPTIONAL { ?version jolux:dateEndApplicability ?to }
 FILTER(str(?from) >= "2024-01-01")
} ORDER BY ?work ?from`;
await writeFile(new URL('versions.rq', here), query + '\n');
const url = 'https://fedlex.data.admin.ch/sparqlendpoint?query=' + encodeURIComponent(query);
const checkedAt = new Date().toISOString();
const response = await fetch(url, { headers: { Accept: 'application/sparql-results+json' }, signal: AbortSignal.timeout(30000) });
const data = Buffer.from(await response.arrayBuffer());
await writeFile(new URL('versions.json', here), data);
const entry = { file: 'versions.json', url, checkedAt, status: response.status, contentType: response.headers.get('content-type'), bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') };
const old = JSON.parse(await readFile(new URL('fetch-results.json', here), 'utf8'));
await writeFile(new URL('fetch-results.json', here), JSON.stringify([...old.filter(row => row.file !== entry.file), entry], null, 2) + '\n');
console.log(JSON.stringify(entry, null, 2));
console.log(data.toString('utf8'));
