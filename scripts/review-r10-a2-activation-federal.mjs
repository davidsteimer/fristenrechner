// R10-A2 second lot, federal partition only. New evidence, no product changes.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const base='outputs/r10-a2-2026-10-28/activation-federal';
const read=p=>fs.readFile(path.join(root,p));
const json=async p=>JSON.parse(await read(p));
const hash=b=>createHash('sha256').update(b).digest('hex');
const binding=async p=>{const b=await read(p);return{path:p,sha256:hash(b),byteLength:b.length}};
const emit=async(p,v)=>{assert.ok(p.startsWith(base+'/'));await fs.mkdir(path.dirname(path.join(root,p)),{recursive:true});await fs.writeFile(path.join(root,p),v instanceof Uint8Array?v:JSON.stringify(v,null,2)+'\n',{flag:'wx'})};
const invPath='outputs/r10-a1-2026-10-28/sources/source-inventory.json';
const inventory=await json(invPath);
assert.equal((await binding(invPath)).sha256,'e9949adea7ef5c0192ed5015ed8bfac7594bdb73c1417f4e81f0df3dee837ec6');
const sources=inventory.rows.filter(r=>r.ownerLotId==='R10-A2-CALENDAR-ACTIVATION'&&r.kind!=='caseLaw'&&r.urls.some(u=>/fedlex(\.data)?\.admin\.ch/.test(new URL(u).hostname)));
assert.equal(sources.length,14);
const mode=process.argv[2]??'--collect';
if(mode==='--check'){
 const r=await json(base+'/review.json');
 assert.equal(r.ownerLotId,'R10-A2-CALENDAR-ACTIVATION');assert.equal(r.sourceRows.length,14);
 assert.deepEqual(r.sourceRows.map(x=>x.sourceId).sort(),sources.map(x=>x.sourceId).sort());
 let n=0;const evidence=new Map();
 for(const row of r.sourceRows){const source=sources.find(s=>s.sourceId===row.sourceId);assert.deepEqual(row.referenceLocations,source.referenceLocations);assert.equal(row.humanApproval,false);assert.equal(row.sourceReleaseApproved,false);assert.equal(row.ownerLotId,source.ownerLotId);assert.ok(row.method&&row.relevantProvisions.length&&row.currentFutureFinding);assert.ok(row.freshEvidence.length||row.reusedEvidence.length);n+=row.referenceLocations.length;for(const e of [...row.freshEvidence,...row.reusedEvidence])evidence.set(e.path,e)}
 assert.equal(n,140);
 const gather=v=>{if(Array.isArray(v)){for(const x of v)gather(x);return}if(!v||typeof v!=='object')return;if(typeof v.path==='string'&&typeof v.sha256==='string'&&Number.isInteger(v.byteLength))evidence.set(v.path,v);for(const x of Object.values(v))gather(x)};
 gather(r);gather(await json(base+'/content-evidence.json'));gather(await json(base+'/retrievals.json'));
 for(const e of evidence.values()){const b=await read(e.path);assert.equal(b.length,e.byteLength,e.path);assert.equal(hash(b),e.sha256,e.path)}
 assert.equal(r.humanApproval,false);assert.equal(r.sourceReleaseApproved,false);
 console.log(JSON.stringify({ok:true,sourceRows:14,referenceLocations:n,boundEvidenceFiles:evidence.size,report:await binding(base+'/review.json')},null,2));
 process.exit(0);
}
assert.equal(mode,'--collect');
const priorTargets=[
 ['EUFR-text','.work/mvp07-source-review-2026-10-08/activation/raw/OFFICIAL-EUFR.bin'],
 ['BBL2008','.work/mvp07-source-review-2026-10-08/activation/raw/OFFICIAL-BBL2008.bin'],
 ['BBL2025','.work/mvp07-source-review-2026-10-08/activation/raw/OFFICIAL-BBL2025.bin'],
 ['VWVG2027','.work/mvp07-source-review-2026-10-08/activation/raw/SRC-AP22CLOSE-BUND-VWVG2027.bin']
];
const targets=[];
for(const[id,p]of priorTargets){
 const es=sources.flatMap(s=>s.historicalAssessment.evidence).filter(e=>e.path===p);assert.ok(es.length);const e=es[0];assert.deepEqual(await binding(p),{path:p,sha256:e.sha256,byteLength:e.byteLength});
 targets.push({id,url:e.url,historicalEvidence:{path:p,sha256:e.sha256,byteLength:e.byteLength,originalCheckedOn:e.originalCheckedOn},role:id==='BBL2008'||id==='BBL2025'?'historical-official-material-not-enacted-law':'official-consolidated-norm-text'});
}
const work='https://fedlex.data.admin.ch/eli/cc/1983/500_500_500';
const prefix='PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>\n';
const versions=prefix+`SELECT DISTINCT ?work ?version ?from ?to ?expression ?xml WHERE {
 VALUES ?work { <${work}> }
 ?version jolux:isMemberOf ?work; jolux:dateApplicability ?from.
 OPTIONAL {?version jolux:dateEndApplicability ?to}
 OPTIONAL {?version jolux:isRealizedBy ?expression. ?expression jolux:language <http://publications.europa.eu/resource/authority/language/DEU>; jolux:isEmbodiedBy ?m. ?m jolux:format <http://publications.europa.eu/resource/authority/file-type/XML>; jolux:isExemplifiedBy ?xml}
 FILTER(!BOUND(?to)||str(?to)>="2026-01-01")
} ORDER BY ?from ?xml`;
const impacts=prefix+`SELECT DISTINCT ?work ?impact ?date ?target ?source WHERE {
 VALUES ?work { <${work}> }
 { ?impact jolux:impactToLegalResource ?work. BIND(?work AS ?target) } UNION { ?impact jolux:impactToLegalResource ?target. ?target jolux:legalResourceSubdivisionIsPartOf ?work }
 ?impact jolux:legalResourceImpactHasDateEntryInForce ?date.
 OPTIONAL {?impact jolux:impactFromLegalResource/jolux:legalResourceSubdivisionIsPartOf ?source}
 FILTER(str(?date)>="2026-01-01")
} ORDER BY ?date ?target`;
for(const[id,query]of[['EUFR-published-versions-unbounded',versions],['EUFR-published-impacts-unbounded',impacts]])targets.push({id,url:'https://fedlex.data.admin.ch/sparqlendpoint?query='+encodeURIComponent(query),query,role:'official-current-and-published-future-metadata-not-content-proof'});
const retrievals=[];
async function fetchOne(t,n){
 const r={...t,retrievedAt:new Date().toISOString()};
 try{assert.ok(['www.fedlex.admin.ch','fedlex.data.admin.ch'].includes(new URL(t.url).hostname));const response=await fetch(t.url,{signal:AbortSignal.timeout(45000),headers:{Accept:t.query?'application/sparql-results+json':'*/*'}});const b=new Uint8Array(await response.arrayBuffer());const p=base+'/raw/'+String(n+1).padStart(3,'0')+'-'+t.id+'.response';await emit(p,b);Object.assign(r,{status:response.status,finalUrl:response.url,headers:Object.fromEntries(response.headers),contentType:response.headers.get('content-type'),path:p,sha256:hash(b),byteLength:b.length,wholeBytesEqual:t.historicalEvidence?hash(b)===t.historicalEvidence.sha256:null})}catch(e){r.error=String(e)}retrievals[n]=r;console.log(JSON.stringify({id:t.id,status:r.status,equal:r.wholeBytesEqual,error:r.error}));
}
await Promise.all(targets.map((t,n)=>fetchOne(t,n)));
const v=retrievals.find(r=>r.id==='EUFR-published-versions-unbounded');
if(v.status===200){const j=await json(v.path);assert.ok(j.results?.bindings);const extra=[...new Set(j.results.bindings.map(b=>b.xml?.value).filter(Boolean))];for(const url of extra)await fetchOne({id:'EUFR-indexed-XML-'+String(retrievals.length),url,role:'official-XML-manifestation-discovered-in-current-index',discoveredFrom:v.path},retrievals.length)}
await emit(base+'/retrievals.json',{reviewId:'R10-A2-CALENDAR-ACTIVATION-federal-retrievals',checkedOn:'2026-10-28',recordStatus:'evidence-only',humanApproval:false,sourceReleaseApproved:false,sourceIds:sources.map(r=>r.sourceId),retrievals});
console.log(JSON.stringify({count:retrievals.length,failed:retrievals.filter(r=>r.status!==200).map(r=>r.id)},null,2));
