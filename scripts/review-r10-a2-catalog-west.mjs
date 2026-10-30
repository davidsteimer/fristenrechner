// Third sequential lot only, 29 western/southern catalogue IDs, no product writes.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const base='outputs/r10-a2-2026-10-28/catalog-west';
const hash=b=>createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFile(path.join(root,p));
const json=async p=>JSON.parse(await read(p));
const bind=async p=>{const b=await read(p);return{path:p,sha256:hash(b),byteLength:b.length}};
const emit=async(p,v)=>{assert.ok(p.startsWith(base+'/'));await fs.mkdir(path.dirname(path.join(root,p)),{recursive:true});await fs.writeFile(path.join(root,p),v instanceof Uint8Array?v:JSON.stringify(v,null,2)+'\n',{flag:'wx'})};
const invPath='outputs/r10-a1-2026-10-28/sources/source-inventory.json';
const inv=await json(invPath);assert.equal((await bind(invPath)).sha256,'e9949adea7ef5c0192ed5015ed8bfac7594bdb73c1417f4e81f0df3dee837ec6');
const sources=inv.rows.filter(r=>r.ownerLotId==='R10-A2-CALENDAR-CATALOG'&&/^SRC-(FR|GE|JU|NE|TI|VD|VS)-/.test(r.sourceId)&&r.sourceId!=='SRC-TI-KANTONSNAME-RM');
assert.equal(sources.length,29);assert.equal(sources.reduce((n,r)=>n+r.referenceLocations.length,0),134);
if(process.argv.includes('--check')){
 const r=await json(base+'/review.json');assert.deepEqual(r.rows.map(x=>x.sourceId).sort(),sources.map(x=>x.sourceId).sort());
 let refs=0;for(const row of r.rows){const s=sources.find(s=>s.sourceId===row.sourceId);assert.deepEqual(row.referenceLocations,s.referenceLocations);assert.equal(row.ownerLotId,s.ownerLotId);assert.equal(row.humanApproval,false);assert.equal(row.sourceReleaseApproved,false);assert.ok(row.method&&row.relevantProvisions.length&&row.currentFutureFinding&&row.outcome);assert.ok(row.freshEvidence.length||row.boundedReuse);refs+=row.referenceLocations.length}assert.equal(refs,134);
 const all=new Map();const gather=x=>{if(Array.isArray(x)){x.forEach(gather);return}if(!x||typeof x!=='object')return;if(typeof x.path==='string'&&typeof x.sha256==='string'&&Number.isInteger(x.byteLength))all.set(x.path,x);Object.values(x).forEach(gather)};
 gather(r);gather(await json(base+'/retrievals.json'));gather(await json(base+'/content-evidence.json'));
 for(const e of all.values())assert.deepEqual(await bind(e.path),{path:e.path,sha256:e.sha256,byteLength:e.byteLength});
 console.log(JSON.stringify({ok:true,rows:29,referenceLocations:refs,boundFiles:all.size,report:await bind(base+'/review.json')},null,2));process.exit(0);
}
const shared=await json('outputs/r10-a2-2026-10-28/activation-cantonal/fetch-index.json');
const targets=new Map();
function add(url,id,role,historical){const t=targets.get(url)??{url,sourceIds:[],role,historical:[]};if(id)t.sourceIds.push(id);if(historical)t.historical.push(historical);targets.set(url,t)}
for(const s of sources){for(const e of s.historicalAssessment.evidence.filter(e=>e.path.startsWith('.work/r09-a2-calendar/'))){if(e.url)add(e.url,s.sourceId,'fresh-current-source-with-comparison-to-bound-R09-original',{path:e.path,sha256:e.sha256,byteLength:e.byteLength,originalCheckedOn:s.historicalAssessment.originalCheckedOn})}}
for(const[id,url]of[
 ['SRC-FR-LEMT-866111-FR-V8126','https://bdlf.fr.ch/api/fr/texts_of_law/866.1.1'],
 ['SRC-FR-LJ-1301-FR-V7926','https://bdlf.fr.ch/api/fr/texts_of_law/130.1'],
 ['SRC-VS-RUHE-8222-20130301','https://lex.vs.ch/api/de/texts_of_law/822.2'],
 ['SRC-VS-VEKARG-822100-20161001','https://lex.vs.ch/api/de/texts_of_law/822.100']
])add(url,id,'fresh-exact-registered-language-current-full-text-and-future-version-index');
for(const e of (await json('outputs/r10-a2-2026-10-28/activation-cantonal/review.json')).rows.find(r=>r.sourceId==='SRC-AP22CLOSE-PROC-VD').freshEvidence)add(e.url,'SRC-VD-LEMP-82211-20120401','shared-same-day-official-full-text-and-version-history');
add('https://www.jura.ch/fr/Autorites/Administration/DES/Economie-et-Emploi-SEE/Documentations-formulaires-et-bases-legales/Documentations-formulaires-et-bases-legales/Jours-feries-officiels-dans-le-Canton-du-Jura.html','SRC-JU-LJF-5551-20230101','fresh-official-current-publication-index-support');
add('https://silgeneve.ch/legis/program/books/rsg/toc.htm','SRC-GE-LJF-J145-19910101','fresh-official-current-systematic-index-support');
const results=[];let next=0;const list=[...targets.values()];
async function run(){while(next<list.length){const n=next++,t=list[n];const same=shared.requests.find(r=>r.url===t.url&&r.httpStatus===200);if(same){assert.deepEqual(await bind(same.path),{path:same.path,sha256:same.sha256,byteLength:same.byteLength});results[n]={...t,sourceIds:[...new Set(t.sourceIds)],path:same.path,sha256:same.sha256,byteLength:same.byteLength,retrievedAt:same.retrievedAt,status:same.httpStatus,contentType:same.contentType,sameDayPhysicalReuse:true,firstOwnerLotId:'R10-A2-CALENDAR-ACTIVATION'};continue}
 const r={...t,sourceIds:[...new Set(t.sourceIds)],retrievedAt:new Date().toISOString(),sameDayPhysicalReuse:false};
 try{const u=new URL(t.url);assert.ok(['www.fr.ch','bdlf.fr.ch','www.ge.ch','silgeneve.ch','www.jura.ch','rsju.jura.ch','rsn.ne.ch','www.ne.ch','www3.ti.ch','m3.ti.ch','www4.ti.ch','www.vd.ch','prestations.vd.ch','lex.vs.ch'].includes(u.hostname));const response=await fetch(t.url,{signal:AbortSignal.timeout(45000),headers:{Accept:'*/*'}});const b=new Uint8Array(await response.arrayBuffer());const p=base+'/raw/'+String(n+1).padStart(3,'0')+'.response';await emit(p,b);Object.assign(r,{status:response.status,finalUrl:response.url,contentType:response.headers.get('content-type'),path:p,byteLength:b.length,sha256:hash(b),historicalRawComparison:t.historical.map(h=>({path:h.path,equal:h.sha256===hash(b)}))})}catch(e){r.error=String(e)}results[n]=r;console.log(JSON.stringify({n,url:t.url,status:r.status,error:r.error,equal:r.historicalRawComparison?.map(x=>x.equal)}));}}
await Promise.all(Array.from({length:4},run));
await emit(base+'/retrievals.json',{ownerLotId:'R10-A2-CALENDAR-CATALOG',partition:'catalog-west',checkedOn:'2026-10-28',humanApproval:false,sourceReleaseApproved:false,sourceIds:sources.map(s=>s.sourceId),sourceInventory:await bind(invPath),sharedSameDayIndex:await bind('outputs/r10-a2-2026-10-28/activation-cantonal/fetch-index.json'),requests:results});
console.log(JSON.stringify({targets:results.length,newRetrievals:results.filter(r=>!r.sameDayPhysicalReuse).length,shared:results.filter(r=>r.sameDayPhysicalReuse).length,failures:results.filter(r=>r.status!==200).map(r=>({url:r.url,status:r.status,error:r.error}))},null,2));
