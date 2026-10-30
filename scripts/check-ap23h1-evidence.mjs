// SPDX-License-Identifier: AGPL-3.0-only
// Bind research sources and declared calendar comparisons. No product validation.
import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const out='outputs/ap23h1-2026-10-22';
const sha=b=>createHash('sha256').update(b).digest('hex');
const readJson=async p=>JSON.parse(await readFile(p,'utf8'));
const inventory=new Map(),bound=new Set();
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){
  assert.ok(!e.isSymbolicLink(),'Unexpected source symlink '+dir+'/'+e.name);
  const path=dir+'/'+e.name;if(e.isDirectory())await walk(path);else{
    const bytes=await readFile(path);
    if(path.endsWith('.pdf'))assert.equal(bytes.subarray(0,5).toString(),'%PDF-',path);
    if(path.endsWith('.xml'))assert.match(bytes.toString('utf8',0,300),/<\?xml/,path);
    inventory.set(path,{path,byteLength:bytes.length,sha256:sha(bytes)});
  }
}}
await walk(out+'/sources');
function scan(value,canton){
  if(!value||typeof value!=='object')return;
  if(typeof value.sha256==='string'&&(value.path||value.file)){
    let path=value.path??value.file;
    if(!path.startsWith('outputs/'))path=out+'/sources/'+canton+'/'+path;
    assert.ok(path.startsWith(out+'/sources/')&&!path.includes('/../'),'Outside research evidence '+path);
    const actual=inventory.get(path);assert.ok(actual,'Missing evidence '+path);
    assert.equal(actual.sha256,value.sha256,path);
    if(value.byteLength!==undefined)assert.equal(actual.byteLength,value.byteLength,path);
    bound.add(path);
  }
  for(const child of Object.values(value))scan(child,canton);
}
const counts={};
const fixture=await readJson('docs/fachrecht/ap23h1/referenzfaelle.json');
const groups=[];
for(const[canton,n]of[['ow',7],['nw',14]]){
  const report=await readJson('docs/fachrecht/ap23h1/befund-'+canton+'.json');
  assert.equal(report.pathProposals.length,n,'Unexpected proposed groups '+canton);
  const paths=fixture.paths.filter(p=>p.canton===canton.toUpperCase());
  assert.deepEqual(paths.map(p=>p.id).sort(),report.pathProposals.map(p=>p.id).sort(),'Reference group identities '+canton);
  for(const p of report.pathProposals){
    const ref=paths.find(r=>r.id===p.id);
    assert.equal(ref.days,p.duration.days,'Reference duration '+p.id);
    const suspension=canton==='nw'?p.suspension:p.suspension.startsWith('none-')?'none':'three';
    assert.equal(ref.suspension,suspension,'Reference suspension '+p.id);
    assert.equal(ref.calendar,canton.toUpperCase()+'-PROCESS','Reference calendar '+p.id);
    groups.push({id:p.id,days:ref.days,suspension:ref.suspension,calendar:ref.calendar});
  }
  counts[canton.toUpperCase()]=n;scan(report,canton);
  for(const path of inventory.keys())if(path.startsWith(out+'/sources/'+canton+'/')&&path.endsWith('.json'))scan(await readJson(path),canton);
}
const metadata=[];
for(const[path,id,future]of[
  ['ow/stvg-130.1-api.json',1917,[2031]],['ow/vgv-134.14-api.json',1659,[]],
  ['ow/vwvv-133.21-api.json',1658,[]],['ow/gog-134.1-api.json',1792,[]],['ow/rtg-975.2-api.json',103,[]],
  ['nw/vrg-265.1-api-20261022.json',1519,[]],['nw/rtg-921.1-api-20261022.json',668,[]]]){
  const p=out+'/sources/'+path,t=(await readJson(p)).text_of_law;
  assert.equal(t.current_version.id,id,p);assert.equal(t.selected_version.id,id,'Selected version differs '+p);
  assert.deepEqual(t.future_versions.map(x=>x.id),future,p);
  assert.ok(t.selected_version.xhtml_tol.length>1000,p);
  metadata.push({path:p,versionId:id,versionDescription:t.current_version.version_dates_str,
    future:t.future_versions.map(x=>({id:x.id,description:x.version_dates_str})),sha256:inventory.get(p).sha256});
  if(path.startsWith('nw/')){
    const derived=p.replace(/\.json$/,'.xhtml');
    assert.equal(await readFile(derived,'utf8'),t.selected_version.xhtml_tol,'API extraction differs '+derived);
  }
}
const reference=await readJson(out+'/reference-verification.json');
assert.equal(reference.status,'passedResearchComparison');assert.equal(reference.discrepancies.length,0);
assert.equal(reference.calendarComparisons.length,4);
for(const c of reference.calendarComparisons){assert.equal(c.baselineRules,13);assert.equal(c.proposedProjectionDates,17);
  assert.equal(c.relevantNamedResearchDates,14);assert.equal(c.endEligibilityDifferences,0);assert.equal(c.daysCompared,365);}
const report={workPackage:'AP23H1',status:'research-source-bindings-verified',asOf:'2026-10-22',
  proposedCantonGroups:counts,researchGroupConsistency:groups,
  inventoriedEvidenceFiles:inventory.size,explicitEvidenceBindingsVerified:bound.size,
  fileInventory:[...inventory.values()].sort((a,b)=>a.path.localeCompare(b.path)),explicitlyBoundPaths:[...bound].sort(),
  officialMetadata:metadata,calendarComparisons:reference.calendarComparisons,
  calendarEndEligibilityComparisons:reference.calendarComparisons.reduce((n,c)=>n+c.daysCompared,0),
  calendarNote:'Independent research projection only: four missing procedural dates per canton supplement existing general data. Sunday labels differ from fourteen named research days, but end-day eligibility is compared with weekends. No existing calendar bytes changed.',
  legalInterpretationAutomaticallyValidated:false,professionalAcceptance:false,runtimeActive:false,operatingChanges:false};
assert.ok(process.argv.slice(2).every(x=>x==='--write'));
if(process.argv.includes('--write'))await writeFile(out+'/evidence-verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,fileInventory:undefined,explicitlyBoundPaths:undefined},null,2));
