import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Read-only official-source requests. Existing AP19 evidence is never changed.
const scriptDirectory = new URL('.', import.meta.url);
const here = new URL(process.argv[2] || '.', scriptDirectory);
await mkdir(here, { recursive: true });
const project = new URL('../../../', scriptDirectory);
const prior = JSON.parse(await readFile(new URL('outputs/ap19c1-2026-09-25/source-review.json', project), 'utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const works = ['2002/510', '2007/804', '1959/827_857_845', '63/837_843_843', '1982/1676_1676_1676', '1961/29_29_29', '1982/2184_2184_2184', '1983/1205_1205_1205', '1995/1328_1328_1328'];
const selected = prior.checks.filter(x => /^CH-(ELG|IVG|AHVG|UVG|IVV)-/.test(x.checkId) || x.checkId === 'BE-EG-ELG-3072');
const targets = selected.map(x => ({ file: x.checkId + (x.mode.includes('xml') ? '.xml' : '.json'), url: x.url, priorCheckId: x.checkId, priorSha256: x.responseSha256, articles: x.articles, accept: x.mode.includes('xml') ? '*/*' : 'application/json' }));
const values = works.map(w => ` <https://fedlex.data.admin.ch/eli/cc/${w}>`).join('\n');
const futureQuery = `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT DISTINCT ?work ?impact ?date ?target ?source WHERE {
 VALUES ?work {\n${values}\n }
 ?impact jolux:impactToLegalResource ?target; jolux:legalResourceImpactHasDateEntryInForce ?date.
 ?target jolux:legalResourceSubdivisionIsPartOf ?work.
 OPTIONAL { ?impact jolux:impactFromLegalResource/jolux:legalResourceSubdivisionIsPartOf ?source }
 FILTER(str(?date) >= "2026-09-28" && str(?date) <= "2027-12-31")
} ORDER BY ?work ?date ?target`;
const versionsQuery = `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT DISTINCT ?work ?version ?from ?to WHERE {
 VALUES ?work {\n${values}\n }
 ?version jolux:isMemberOf ?work; jolux:dateApplicability ?from.
 OPTIONAL { ?version jolux:dateEndApplicability ?to }
 FILTER(str(?from) >= "2024-01-01" && str(?from) <= "2028-01-01")
} ORDER BY ?work ?from`;
for (const [name, query] of [['future-index', futureQuery], ['versions', versionsQuery]]) {
  await writeFile(new URL(name + '.rq', here), query + '\n', { flag: 'wx' });
  targets.push({ file: name + '.json', url: 'https://fedlex.data.admin.ch/sparqlendpoint?query=' + encodeURIComponent(query), accept: 'application/sparql-results+json' });
}
const results = [];
for (const target of targets) {
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetch(target.url, { headers: { Accept: target.accept }, signal: AbortSignal.timeout(30000) });
    const bytes = Buffer.from(await response.arrayBuffer());
    await writeFile(new URL(target.file, here), bytes, { flag: 'wx' });
    results.push({ ...target, checkedAt, status: response.status, contentType: response.headers.get('content-type'), bytes: bytes.length, sha256: sha256(bytes), matchesPriorHash: target.priorSha256 ? sha256(bytes) === target.priorSha256 : null, prefix: bytes.toString('utf8').slice(0, 60) });
  } catch (error) {
    results.push({ ...target, checkedAt, error: String(error) });
  }
}
await writeFile(new URL('fetch-results.json', here), JSON.stringify(results, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(results.map(({ file, checkedAt, status, contentType, bytes, sha256, matchesPriorHash, error }) => ({ file, checkedAt, status, contentType, bytes, sha256, matchesPriorHash, error })), null, 2));
