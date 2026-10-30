// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,rm,writeFile,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {archiveAcceptance,archiveConfig,historicalFlags,safeRelative,sha256} from '../../scripts/archive-ap23l1-acceptance.mjs';
async function fixture(t,alter=()=>{}){
 const root=await mkdtemp(join(tmpdir(),'ap23l1-acceptance-'));t.after(()=>rm(root,{recursive:true,force:true}));const bindings=[];
 async function file(path,value,bound=true){const raw=Buffer.from(typeof value==='string'?value:JSON.stringify(value));
  await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),raw);
  const row={path,byteLength:raw.length,sha256:sha256(raw)};if(bound)bindings.push(row);return row;}
 const old=await file('old/input','old',false),head='1'.repeat(40),source=await file('sources/official','source');
 const register=await file('docs/sources.json',{sourceBase:'sources',sources:[{id:'source',file:'official',sha256:source.sha256,bytes:source.byteLength}],
  professionalAcceptance:false,sourceReleaseApproved:false,operatingChanges:false});
 const calendar=await file('data/cal.json',{rules:[]},false),guard=await file('proof/guard.json',{workPackage:'AP23L1',capturedAtResearchStart:true,
  capturedBeforeLivingUpdates:true,head,files:{[old.path]:old.sha256}});
 const preservation=await file('proof/preservation.json',{status:'research-inputs-preserved',protectedFilesVerified:1,protectedInputSha256:guard.sha256,gitHead:head});
 const suite=await file('docs/fixture.json',{paths:[{id:'one'}],cases:[{id:'one'}],calendarBaselines:[calendar],sourceModels:[{...register,sourceRegister:true}],
  runtimeActive:false,productTest:false,legalApproval:false,exportTest:false});
 const ref=await file('proof/reference.json',{status:'research-references-verified',fixtureSha256:suite.sha256,paths:1,cases:1,results:[{id:'one'}],discrepancies:[]});
 const independent=await file('proof/independent.json',{status:'passedIndependentResearchComparison',fixtureSha256:suite.sha256,nodeReportSha256:ref.sha256,
  referenceComparisons:1,calendarEndEligibilityComparisons:1,calendarProbes:1,discrepancies:[],runtimeActive:false,exportTest:false,legalApproval:false});
 const log=await file('proof/tests.txt','# tests 1\n# pass 1\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n');
 const outcomes={datedResearchValue:1,qualificationBoundaryProposed:0,researchWindowBoundary:0,unresolvedBoundaryProposed:0};
 const value={workPackage:'AP23L1',status:'local-research-verified-awaiting-human-acceptance',scopeConfirmed:true,professionalStepStarted:true,
  head,bindings,pathProposals:1,aiPathProposals:1,szPathProposals:0,references:1,sourceFiles:1,sourceBytes:source.byteLength,researchTests:1,
  protectedFiles:1,protectedInputSha256:guard.sha256,referenceOutcomes:outcomes,calendarEndEligibilityComparisons:1,calendarProbes:1,
  window:{from:'2026-08-29',to:'2027-12-31'},realDeviceTest:false,m365HostTest:false,icsFilesCreated:0,outlookImports:0,
  ...Object.fromEntries(historicalFlags.map(flag=>[flag,false]))};alter(value);
 const proof=await file('proof/local-completion.json',value,false);
 const config={...archiveConfig,target:'archive/l1',proofPath:proof.path,proofSha256:proof.sha256,bindingCount:bindings.length,protectedCount:1,
  paths:1,aiPaths:1,szPaths:0,cases:1,sourceCount:1,sourceBytes:source.byteLength,tests:1,calendarBaselines:1,calendarDays:1,calendarProbes:1,outcomes,
  guardPath:guard.path,preservationPath:preservation.path,testLog:log.path,fixturePath:suite.path,referencePath:ref.path,independentPath:independent.path,requireGitHead:false};
 return{root,config,file,source,calendar,old};
}
test('actual accepted L1 archive independently revalidates',async()=>{
 const result=await archiveAcceptance();assert.equal(result.mode,'archive-reverified');assert.equal(result.files,66);
 assert.equal(result.receiptSha256,'028e05ee3a514a3465dc9c91e95d48fd1dad3d9a19d27423da57add33122de77');
});
test('acceptance is separate and original flags survive',async t=>{
 const f=await fixture(t),result=await archiveAcceptance({...f,write:true});assert.equal(result.files,f.config.bindingCount+2);
 const receipt=JSON.parse(await readFile(join(f.root,f.config.target,'receipt.json')));assert.equal(receipt.professionalAcceptance,true);assert.equal(receipt.l2Started,true);
 const original=JSON.parse(await readFile(join(f.root,f.config.target,f.config.proofPath)));for(const flag of historicalFlags)assert.equal(original[flag],false);
 await assert.rejects(readFile(join(f.root,f.config.target,f.old.path)),{code:'ENOENT'});
});
test('autonomous archive survives original removal',async t=>{
 const f=await fixture(t);const a=await archiveAcceptance({...f,write:true});
 for(const path of['docs','proof','data','sources','old'])await rm(join(f.root,path),{recursive:true});
 const b=await archiveAcceptance(f);assert.equal(b.receiptSha256,a.receiptSha256);assert.equal(b.mode,'archive-reverified');
});
test('repeated write cannot replace archived truth',async t=>{const f=await fixture(t);const a=await archiveAcceptance({...f,write:true});assert.equal((await archiveAcceptance({...f,write:true})).receiptSha256,a.receiptSha256);});
for(const flag of historicalFlags)test('historical pending flag cannot be rewritten '+flag,async t=>{const f=await fixture(t,p=>p[flag]=true);await assert.rejects(archiveAcceptance({...f,write:true}),/Historical boundary/);});
for(const kind of['realDeviceTest','m365HostTest'])test('no invented host or device test '+kind,async t=>{const f=await fixture(t,p=>p[kind]=true);await assert.rejects(archiveAcceptance(f));});
for(const kind of['icsFilesCreated','outlookImports'])test('no invented export '+kind,async t=>{const f=await fixture(t,p=>p[kind]=1);await assert.rejects(archiveAcceptance(f));});
for(const name of['old','source','calendar'])test('changed '+name+' fails before acceptance',async t=>{const f=await fixture(t);await f.file(f[name].path,'changed',false);await assert.rejects(archiveAcceptance({...f,write:true}));});
for(const key of['bindingCount','protectedCount','paths','aiPaths','szPaths','cases','sourceCount','sourceBytes','tests','calendarBaselines','calendarDays','calendarProbes'])test('closed inventory '+key,async t=>{const f=await fixture(t);f.config[key]++;await assert.rejects(archiveAcceptance(f));});
for(const kind of['payload','receipt','extra','directory','symlink'])test('archive mutation rejected '+kind,async t=>{
 const f=await fixture(t);await archiveAcceptance({...f,write:true});
 if(kind==='payload')await f.file(f.config.target+'/'+f.calendar.path,'changed',false);
 if(kind==='receipt')await f.file(f.config.target+'/receipt.json','{}',false);
 if(kind==='extra')await f.file(f.config.target+'/extra','extra',false);
 if(kind==='directory')await mkdir(join(f.root,f.config.target,'extra'));
 if(kind==='symlink')await symlink(join(f.root,f.config.target,f.source.path),join(f.root,f.config.target,'extra'));
 await assert.rejects(archiveAcceptance(f));
});
test('partial archive cannot be overwritten',async t=>{const f=await fixture(t);await mkdir(join(f.root,f.config.target),{recursive:true});await assert.rejects(archiveAcceptance({...f,write:true}),/Partial archive/);});
test('unsafe path rejected',()=>{for(const path of['../x','/x','x/../y','x//y','x\\y','C:/x','','x\0y'])assert.throws(()=>safeRelative(path));});
