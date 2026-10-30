// SPDX-License-Identifier: AGPL-3.0-only
// Verify research evidence and cross-document identities, not a legal or source-release approval.
import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const output='outputs/ap23i1-2026-10-22';
const sourceRoot=output+'/sources/';
const sha=b=>createHash('sha256').update(b).digest('hex');
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const files=new Map(),explicit=new Set();
async function walk(path){
  for(const item of await readdir(path,{withFileTypes:true})){
    const next=path+'/'+item.name;assert.ok(!item.isSymbolicLink(),'Source symlink '+next);
    if(item.isDirectory())await walk(next);else{
      assert.ok(item.isFile());const bytes=await readFile(next);
      if(next.endsWith('.pdf'))assert.equal(bytes.subarray(0,5).toString(),'%PDF-',next);
      files.set(next,{path:next,byteLength:bytes.length,sha256:sha(bytes)});
    }
  }
}
await walk(sourceRoot.slice(0,-1));
async function verifyDeclared(value,canton){
  if(!value||typeof value!=='object')return;
  if(typeof value.sha256==='string'&&typeof(value.path??value.file)==='string'){
    const declared=value.path??value.file;
    if(!declared.startsWith('data/')){
      const path=declared.startsWith('outputs/')?declared:sourceRoot+canton+'/'+declared;
      assert.ok(path.startsWith(sourceRoot+canton+'/')&&!path.includes('/../'),'Out-of-scope evidence path '+path);
      const current=files.get(path);assert.ok(current,'Missing source '+path);
      assert.equal(current.sha256,value.sha256,path);
      if(value.byteLength!==undefined)assert.equal(current.byteLength,value.byteLength,path);
      explicit.add(path);
    }
  }
  for(const child of Object.values(value))await verifyDeclared(child,canton);
}
const fixture=await json('docs/fachrecht/ap23i1/referenzfaelle.json');
const modelComparisons=[];
for(const[canton,count]of[['gl',19],['tg',15]]){
  const path='docs/fachrecht/ap23i1/befund-'+canton+'.json';
  const bytes=await readFile(path),model=JSON.parse(bytes);
  const bound=fixture.sourceModels.find(b=>b.path===path);assert.ok(bound);
  assert.equal(sha(bytes),bound.sha256,'Stale research model '+path);
  assert.equal(model.pathProposals.length,count);
  const ours=fixture.paths.filter(p=>p.canton===canton.toUpperCase());
  assert.deepEqual(ours.map(p=>p.id).sort(),model.pathProposals.map(p=>p.id).sort());
  for(const p of model.pathProposals){
    const r=ours.find(r=>r.id===p.id);
    assert.equal(r.days,p.duration.days,p.id);
    for(const key of['minimumDays','maximumDays'])assert.equal(r[key],p.duration[key],p.id+'/'+key);
    assert.equal(r.durationBasis,p.duration.type,p.id);
    assert.equal(r.suspension,p.suspension,p.id);
    assert.equal(r.calendar,canton.toUpperCase()+'-RESEARCH');
    assert.deepEqual(r.sourceIds,p.sourceIds,p.id);
    assert.ok(Array.isArray(p.requirements),'Final conditions must be explicit '+p.id);
    for(const condition of p.requirements){
      const actual=r.requirements.find(q=>q.key===condition.key);assert.ok(actual,'Missing condition '+p.id+'/'+condition.key);
      for(const key of['value','oneOf'])if(Object.hasOwn(condition,key))assert.deepEqual(actual[key],condition[key],p.id+'/'+condition.key);
    }
    for(const[key,value]of Object.entries(model.commonRequirements??{})){
      const actual=r.requirements.find(q=>q.key===key);assert.ok(actual);assert.deepEqual(actual.value,value,p.id+'/'+key);
    }
    modelComparisons.push({id:p.id,canton:canton.toUpperCase(),days:r.days,suspension:r.suspension,requirements:r.requirements.length});
  }
  await verifyDeclared(model,canton);
  const index=sourceRoot+canton+'/source-bindings.json';
  assert.ok(files.has(index));await verifyDeclared(await json(index),canton);
  for(const file of files.keys())if(file.startsWith(sourceRoot+canton+'/')&&/(?:retrieval-bindings|practice-bindings)/.test(file)&&file.endsWith('.json'))await verifyDeclared(await json(file),canton);
}
const metadata=[];
for(const[path,id]of[
  ['gl/vrg-metadata.json',2395],['gl/gog-metadata.json',2280],['gl/ruhetag-metadata.json',2110],['gl/fahrt-metadata.json',687],
  ['tg/vrg-170.1-api-20261022.json',2774],['tg/rtg-822.9-api-20261022.json',2949],['tg/veu-170.15-api-20261022.json',3034]]){
  const full=sourceRoot+path,t=(await json(full)).text_of_law;
  assert.equal(t.current_version.id,id,full);assert.equal(t.selected_version.id,id,full);
  assert.deepEqual(t.future_versions,[],full);assert.ok(t.selected_version.xhtml_tol.length>500,full);
  metadata.push({path:full,currentVersion:id,versionDescription:t.current_version.version_dates_str,futureVersionIds:[],sha256:files.get(full).sha256});
}
const reference=await json(output+'/reference-verification.json');
const independent=await json(output+'/reference-independent-verification.json');
assert.equal(reference.status,'passedResearchComparison');assert.equal(independent.status,'passedIndependentResearchComparison');
assert.equal(reference.referenceCases,249);assert.equal(reference.paths,34);
assert.equal(reference.fixtureSha256,sha(await readFile('docs/fachrecht/ap23i1/referenzfaelle.json')));
assert.equal(independent.fixtureSha256,reference.fixtureSha256);
assert.equal(independent.nodeReportSha256,sha(await readFile(output+'/reference-verification.json')));
assert.deepEqual(reference.discrepancies,[]);assert.deepEqual(independent.discrepancies,[]);
assert.equal(reference.calendarComparisons.length,4);
assert.equal(independent.calendarEndEligibilityComparisons,1460);
for(const row of reference.calendarComparisons){assert.equal(row.rawRules,13);assert.equal(row.namedResearchDates,10);assert.equal(row.daysCompared,365);assert.equal(row.endEligibilityDifferences,0);}
const report={workPackage:'AP23I1',asOf:'2026-10-22',status:'research-source-bindings-verified',
  inventoriedEvidenceFiles:files.size,explicitEvidenceBindingsVerified:explicit.size,
  fileInventory:[...files.values()].sort((a,b)=>a.path.localeCompare(b.path)),explicitlyBoundPaths:[...explicit].sort(),
  officialCantonMetadataChecks:metadata,researchGroupConsistency:modelComparisons,
  referenceCases:reference.referenceCases,calendarComparisons:reference.calendarComparisons,
  calendarEndEligibilityComparisons:1460,legalInterpretationAutomaticallyValidated:false,
  professionalAcceptance:false,sourceReleaseApproved:false,runtimeActive:false,operatingChanges:false,
  note:'Current and historical sources, extracts and retrieval indexes are bound as research evidence. Missing independently located change originals remain explicitly qualified in the source report. No source promotion or product calendar modification.'};
assert.ok(process.argv.slice(2).every(arg=>arg==='--write'));
if(process.argv.includes('--write'))await writeFile(output+'/evidence-verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,fileInventory:undefined,explicitlyBoundPaths:undefined,researchGroupConsistency:undefined},null,2));
