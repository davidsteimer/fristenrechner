// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,writeFile,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {archiveAcceptance,safeRelative,sha256} from '../../scripts/archive-ap23j2-acceptance.mjs';
const boundaries=['runtimeActive','productIntegration','sourceReleaseApproved','calendarExportEnabled','productCodeChanged','nativeSchemasChanged',
  'acceptedLegalDataChanged','existingTestsChanged','commitCreated','sourcePushPerformed','releaseBuildPerformed','operatingChanges','j3Started',
  'publicProjectStatusUpdated','publicTechnicalFindingsPublished'];
async function fixture(t,edit=()=>{}){
  const root=await mkdtemp(join(tmpdir(),'ap23j2-archive-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const file=async(path,value)=>{const bytes=Buffer.from(typeof value==='string'?value:JSON.stringify(value));await mkdir(dirname(join(root,path)),{recursive:true});
    await writeFile(join(root,path),bytes);return{path,byteLength:bytes.length,sha256:sha256(bytes)};};
  const source=await file('source/file.ts','accepted technical source');
  const qa=await file('proof/QA-AP23J2.json',{workPackage:'AP23J2',status:'passed',referenceCases:673,negativeCatalogMutations:38,negativeInputMutations:542,readerNegatives:[1,2,3,4,5]});
  const independent=await file('proof/independent.json',{status:'passedIndependentStructuralAndResearchComparison',referenceCases:673,
    openingProvenanceComparisons:11,sourceByteBindings:19,holidayRules:499,physicalProjectionRules:431,nodeEvidenceSha256:qa.sha256,discrepancies:[]});
  const manifest=await file('candidate/manifest.json',{formatVersion:'14.0.0',releaseStatus:'candidate'});
  const log=await file('proof/tests.txt','# tests 416\n# pass 416\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n');
  const proof={workPackage:'AP23J2',status:'passed-awaiting-technical-acceptance',technicalJ2Acceptance:false,professionalJ1Acceptance:true,
    contractDecision:{id:'DEC-2026-039',status:'proposed'},counts:{totalPaths:149,newPaths:36,preservedPaths:113},referenceCases:673,governanceTests:416,
    bindings:[source,qa,independent,manifest,log],steps:[{id:'governance-tests',exitCode:0,...log}],manifest,
    ...Object.fromEntries(boundaries.map(key=>[key,false]))};
  edit(proof);const p=await file('proof/completion.json',proof);
  return{root,source,file,proof,config:{target:'accepted/archive',proofPath:p.path,proofSha256:p.sha256,bindingCount:proof.bindings.length,
    paths:149,newPaths:36,preservedPaths:113,cases:673,tests:416,negativeCatalogMutations:38,negativeInputMutations:542,readerNegatives:5,
    openingProbes:11,sourceByteBindings:19,requireGitHead:false,
    acceptance:{kind:'acceptedAP23J2Snapshot',technicalAcceptance:true,sourceReleaseApproved:false}}};
}
test('read-only preflight, exact capture and autonomous verification after source changes',async t=>{
  const f=await fixture(t);assert.equal((await archiveAcceptance(f)).mode,'source-preflight-only');
  await assert.rejects(readFile(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});
  const a=await archiveAcceptance({...f,write:true});assert.equal(a.files,6);await f.file(f.source.path,'later source');
  const b=await archiveAcceptance(f);assert.equal(a.receiptSha256,b.receiptSha256);assert.equal(b.mode,'archive-reverified');
});
test('changed source stops before archive creation',async t=>{const f=await fixture(t);await f.file(f.source.path,'tampered');
  await assert.rejects(archiveAcceptance({...f,write:true}),/Protected bytes changed/);await assert.rejects(readFile(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});});
test('missing source stops before archive creation',async t=>{const f=await fixture(t);await rm(join(f.root,f.source.path));await assert.rejects(archiveAcceptance({...f,write:true}),{code:'ENOENT'});});
test('duplicate descriptors rejected',async t=>{const f=await fixture(t,p=>p.bindings.push(p.bindings[0]));await assert.rejects(archiveAcceptance(f),/Duplicate binding/);});
test('unsafe archive paths rejected',()=>{for(const p of['../x','/x','a//b','a/../b','a\\b','C:/a','','a\0b'])assert.throws(()=>safeRelative(p));});
for(const kind of['file','directory'])test('reject '+kind+' symlink',async t=>{const f=await fixture(t);
  if(kind==='file'){await f.file('other.ts','accepted technical source');await rm(join(f.root,f.source.path));await symlink('../other.ts',join(f.root,f.source.path));}
  else{await f.file('other/file.ts','accepted technical source');await rm(join(f.root,'source'),{recursive:true});await symlink('other',join(f.root,'source'));}
  await assert.rejects(archiveAcceptance({...f,write:true}),/Symlink/);});
test('partial archive is never repaired silently',async t=>{const f=await fixture(t);await mkdir(join(f.root,f.config.target),{recursive:true});await assert.rejects(archiveAcceptance({...f,write:true}),/Partial archive/);});
test('payload modification is rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await f.file(f.config.target+'/'+f.source.path,'tampered');await assert.rejects(archiveAcceptance(f),/Protected bytes changed/);});
test('unexpected archive file rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await f.file(f.config.target+'/extra','unexpected');await assert.rejects(archiveAcceptance(f),/Unexpected archive/);});
test('unexpected archive directory rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await mkdir(join(f.root,f.config.target,'extra'));await assert.rejects(archiveAcceptance(f),/Unexpected archive directories/);});
test('receipt modification is rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await f.file(f.config.target+'/receipt.json',{});await assert.rejects(archiveAcceptance(f),/Receipt changed/);});
test('repeat write only verifies',async t=>{const f=await fixture(t);const a=await archiveAcceptance({...f,write:true}),b=await archiveAcceptance({...f,write:true});assert.equal(a.receiptSha256,b.receiptSha256);assert.equal(b.mode,'archive-reverified');});
for(const key of boundaries)test('historical false boundary '+key+' stays false',async t=>{const f=await fixture(t,p=>p[key]=true);await assert.rejects(archiveAcceptance(f));});
for(const[key,value]of[['status','accepted'],['technicalJ2Acceptance',true],['professionalJ1Acceptance',false],['workPackage','AP23J3'],
  ['contractDecision',{id:'DEC-2026-039',status:'approved'}],['referenceCases',248],['governanceTests',280]])
  test('original '+key+' not relabelled',async t=>{const f=await fixture(t,p=>p[key]=value);await assert.rejects(archiveAcceptance(f));});
for(const[key,value]of[['totalPaths',112],['newPaths',33],['preservedPaths',78]])test('original '+key+' exact',async t=>{
  const f=await fixture(t,p=>p.counts[key]=value);await assert.rejects(archiveAcceptance(f));});
test('failed step is rejected',async t=>{const f=await fixture(t,p=>p.steps[0].exitCode=1);await assert.rejects(archiveAcceptance(f));});
test('step descriptor must be exact',async t=>{const f=await fixture(t,p=>p.steps[0].sha256='f'.repeat(64));await assert.rejects(archiveAcceptance(f));});

