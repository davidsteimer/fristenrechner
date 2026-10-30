// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp,mkdir,readFile,writeFile,rm,symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname,join } from 'node:path';
import { archiveAcceptance,safeRelative,sha256 } from '../../scripts/archive-ap23h2-acceptance.mjs';
async function fixture(t,edit=()=>{}){
  const root=await mkdtemp(join(tmpdir(),'ap23h2-archive-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const file=async(path,value)=>{const b=Buffer.from(typeof value==='string'?value:JSON.stringify(value));await mkdir(dirname(join(root,path)),{recursive:true});
    await writeFile(join(root,path),b);return{path,byteLength:b.length,sha256:sha256(b)};};
  const source=await file('source/file.ts','accepted technical source');
  const qa=await file('proof/qa.json',{workPackage:'AP23H2',status:'passed',referenceCases:118,negativeCatalogMutations:78,negativeInputMutations:36,readerNegatives:[1,2,3,4,5,6]});
  const manifest=await file('candidate/manifest.json',{formatVersion:'12.0.0',releaseStatus:'candidate'});
  const proof={workPackage:'AP23H2',status:'passed-awaiting-technical-acceptance',technicalH2Acceptance:false,professionalH1Acceptance:true,contractDecision:{id:'DEC-2026-037',status:'proposed'},
    counts:{totalPaths:79},referenceCases:118,bindings:[source,qa,manifest],steps:[],manifest,
    ...Object.fromEntries(['runtimeActive','productIntegration','sourceReleaseApproved','calendarExportEnabled','productCodeChanged','nativeSchemasChanged','existingTestsChanged','acceptedLegalDataChanged',
      'commitCreated','sourcePushPerformed','releaseBuildPerformed','operatingChanges','h3Started'].map(k=>[k,false]))};
  edit(proof);const p=await file('proof/completion.json',proof);
  return{root,source,file,config:{target:'accepted/archive',proofPath:p.path,proofSha256:p.sha256,bindingCount:proof.bindings.length,paths:79,cases:118,
    acceptance:{kind:'acceptedAP23H2Snapshot',technicalAcceptance:true,sourceReleaseApproved:false}}};
}
test('preflight read-only, exact snapshot and autonomous verification after living edits',async t=>{
  const f=await fixture(t);assert.equal((await archiveAcceptance(f)).mode,'source-preflight-only');
  await assert.rejects(readFile(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});
  const a=await archiveAcceptance({...f,write:true});assert.equal(a.files,4);await f.file(f.source.path,'later working source');
  const b=await archiveAcceptance(f);assert.equal(b.receiptSha256,a.receiptSha256);assert.equal(b.mode,'archive-reverified');
});
test('changed source stops before copy',async t=>{const f=await fixture(t);await f.file(f.source.path,'tampered');
  await assert.rejects(archiveAcceptance({...f,write:true}),/SHA-256/);await assert.rejects(readFile(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});});
test('missing source stops before copy',async t=>{const f=await fixture(t);await rm(join(f.root,f.source.path));await assert.rejects(archiveAcceptance({...f,write:true}),{code:'ENOENT'});});
test('duplicate descriptor rejected',async t=>{const f=await fixture(t,p=>p.bindings.push(p.bindings[0]));await assert.rejects(archiveAcceptance(f),/Duplicate binding/);});
test('path escapes rejected',()=>{for(const p of['../x','/x','a//b','a/../b','a\\b','C:/a','','a\0b'])assert.throws(()=>safeRelative(p));});
for(const kind of['file','directory'])test('reject '+kind+' symlink',async t=>{const f=await fixture(t);
  if(kind==='file'){await f.file('other.ts','accepted technical source');await rm(join(f.root,f.source.path));await symlink('../other.ts',join(f.root,f.source.path));}
  else{await f.file('other/file.ts','accepted technical source');await rm(join(f.root,'source'),{recursive:true});await symlink('other',join(f.root,'source'));}
  await assert.rejects(archiveAcceptance({...f,write:true}),/Symlink/);});
test('partial archive stops without repair',async t=>{const f=await fixture(t);await mkdir(join(f.root,f.config.target),{recursive:true});await assert.rejects(archiveAcceptance({...f,write:true}),/Partial archive/);});
test('archive payload tampering rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await f.file(f.config.target+'/'+f.source.path,'tampered');await assert.rejects(archiveAcceptance(f),/SHA-256/);});
test('unexpected archive file rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await f.file(f.config.target+'/extra','unexpected');await assert.rejects(archiveAcceptance(f),/Unexpected archive/);});
test('receipt tampering rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await f.file(f.config.target+'/receipt.json',{});await assert.rejects(archiveAcceptance(f),/Receipt changed/);});
test('repeat write only verifies',async t=>{const f=await fixture(t);const a=await archiveAcceptance({...f,write:true}),b=await archiveAcceptance({...f,write:true});assert.equal(a.receiptSha256,b.receiptSha256);assert.equal(b.mode,'archive-reverified');});
for(const key of['runtimeActive','productIntegration','sourceReleaseApproved','calendarExportEnabled','productCodeChanged','nativeSchemasChanged','existingTestsChanged','acceptedLegalDataChanged',
  'commitCreated','sourcePushPerformed','releaseBuildPerformed','operatingChanges','h3Started'])test('original proof boundary '+key+' retained',async t=>{
    const f=await fixture(t,p=>p[key]=true);await assert.rejects(archiveAcceptance(f));});
for(const[key,value]of[['status','accepted'],['technicalH2Acceptance',true],['workPackage','AP23H3'],['contractDecision',{id:'DEC-2026-037',status:'approved'}]])
test('historical '+key+' not relabelled',async t=>{const f=await fixture(t,p=>p[key]=value);await assert.rejects(archiveAcceptance(f));});
