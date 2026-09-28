import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const here = new URL('.', import.meta.url);
const priorPath = 'outputs/release-mvp04-2026-09-22/source-check.json';
const prior = JSON.parse(await fs.readFile(priorPath));
const register = JSON.parse(await fs.readFile('data/source-reviews/source-register.json'));
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const federal = [
  ['StPO', '2010/267', '20250401'], ['ZPO', '2010/262', '20260701'],
  ['BGG', '2006/218', '20260401'], ['VwVG', '1969/737_757_755', '20220701'],
  ['BPR', '1978/688_688_688', '20221023'], ['VPR', '1978/712_712_712', '20220701'],
  ['Bundesfeiertag', '1994/1340_1340_1340', '19940701'],
];
const ids = ['StPO', 'ZPO', 'BGG', 'VwVG', 'BPR', 'VPR', 'Bundesfeiertag', 'VRPG', 'IVOEB', 'IVOEBG', 'IVOEBV', 'PRG', 'PRV', 'IVOEB-OLD', 'PRG-MATERIALS', 'RRB-498-2024'];
const targets = ids.map(id => {
  const old = prior.retrievals.find(r => r.id === id);
  if (!old) throw new Error(`Missing baseline ${id}`);
  return { id, file: `${id}.${old.format}`, url: old.url, oldSha256: old.sha256, baselinePath: `.work/release-mvp04-sources/${id}.${old.format}` };
});
const works = federal.map(([,eli])=>`<https://fedlex.data.admin.ch/eli/cc/${eli}>`).join('\n');
const queries = {
  'future-index': `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT DISTINCT ?work ?impact ?date ?target ?source WHERE {
 VALUES ?work { ${works} }
 ?impact jolux:impactToLegalResource ?target; jolux:legalResourceImpactHasDateEntryInForce ?date.
 ?target jolux:legalResourceSubdivisionIsPartOf ?work.
 OPTIONAL { ?impact jolux:impactFromLegalResource/jolux:legalResourceSubdivisionIsPartOf ?source }
 FILTER(str(?date) >= "2026-09-22" && str(?date) <= "2027-12-31")
} ORDER BY ?work ?date ?target`,
  versions: `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT DISTINCT ?work ?version ?from ?to WHERE {
 VALUES ?work { ${works} }
 ?version jolux:isMemberOf ?work; jolux:dateApplicability ?from.
 OPTIONAL { ?version jolux:dateEndApplicability ?to }
 FILTER(str(?from) >= "2022-01-01")
} ORDER BY ?work ?from`,
};
for (const [id,query] of Object.entries(queries)) {
  await fs.writeFile(new URL(`${id}.rq`, here), query+'\n');
  targets.push({ id, file: `${id}.json`, url: 'https://fedlex.data.admin.ch/sparqlendpoint?query='+encodeURIComponent(query), accept: 'application/sparql-results+json' });
}
targets.push({id:'OF001-BJ',file:'OF001-BJ.html',url:'https://www.bj.admin.ch/de/zustellung-an-wochenenden-und-feiertagen-mit-a-post-plus'});
const judgments = JSON.parse(await fs.readFile('outputs/release-mvp04-2026-09-22/judgment-refresh.json')).checks.filter(r=>r.sourceId!=='JUD-AP17C-BGER-8C-767-2008-20090112');
for (const j of judgments) targets.push({id:j.sourceId,file:j.sourceId+(j.retrievalUrl.endsWith('.pdf')?'.pdf':'.html'),url:j.retrievalUrl,sourceClassification:'judgmentMirrorNotOfficialPublication'});
const results = [];
for (let offset=0; offset<targets.length; offset+=4) {
  results.push(...await Promise.all(targets.slice(offset,offset+4).map(async target=>{
    const record={...target,checkedAt:new Date().toISOString()};
    try {
      const response=await fetch(target.url,{headers:{Accept:target.accept??'*/*'},signal:AbortSignal.timeout(30000)});
      const bytes=Buffer.from(await response.arrayBuffer());
      await fs.writeFile(new URL(target.file,here),bytes);
      Object.assign(record,{status:response.status,contentType:response.headers.get('content-type'),bytes:bytes.length,sha256:hash(bytes),finalUrl:response.url});
      if(target.oldSha256) record.previousHashMatches=target.oldSha256===record.sha256;
      if(target.baselinePath) {
        const baseline=await fs.readFile(target.baselinePath);
        record.baselineLocalSha256=hash(baseline);
        record.baselineLocalMatchesRecorded=record.baselineLocalSha256===target.oldSha256;
      }
    } catch(error) {record.error=String(error);}
    return record;
  })));
}
await fs.writeFile(new URL('fetch-results.json',here),JSON.stringify({checkedOn:'2026-09-28',formalApproval:false,comparisonPath:priorPath,comparisonSha256:hash(await fs.readFile(priorPath)),retrievals:results},null,2)+'\n');
console.log(JSON.stringify(results.map(({id,status,bytes,previousHashMatches,error})=>({id,status,bytes,previousHashMatches,error})),null,2));
