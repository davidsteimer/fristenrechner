// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,rm,symlink,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {archiveAcceptance,safeRelative,sha256} from '../../scripts/archive-ap23f3-acceptance.mjs';

async function fixture(t,modifyProof=()=>{}){
  const root=await mkdtemp(join(tmpdir(),'ap23f3-archive-test-'));
  t.after(()=>rm(root,{recursive:true,force:true}));
  async function file(path,value){
    const bytes=Buffer.from(typeof value==='string'?value:JSON.stringify(value));
    await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),bytes);
    return{path,byteLength:bytes.length,sha256:sha256(bytes)};
  }
  const source=await file('src/a.ts','accepted source');
  const old=await file('historical/old.json','unchanged old data');
  const guard=await file('proof/guards.json',{files:{[old.path]:old.sha256}});
  const extra=await file('proof/extra.json',{});
  const artifact=await file('candidate/data.json',{candidate:true});
  const manifest=await file('candidate/manifest.json',{formatVersion:'10.0.0',releaseStatus:'candidate',releaseId:'reference.1',
    artifacts:[{...artifact,path:'data.json'}]});
  const log=await file('proof/test.log','all tests passed');
  const buildLog=await file('stage/build.log','build passed');
  const packageLog=await file('proof/package.log','actual package passed');
  const pkg=await file('stage/test.sppkg','synthetic archive fixture package');
  const compiler=await file('stage/tsconfig.json',{target:'es2015'});
  const qa=await file('proof/qa.json',{status:'passed',localOnly:true,sourceReleaseApproved:false,
    steps:[{exitCode:0,log:log.path,sha256:log.sha256}],protectedFiles:[old]});
  const bundle=await file('proof/bundle.json',{releaseStatus:'candidate',sourceReleaseApproved:false,productionActivation:false,
    calendarExportEnabled:false,manifest,artifacts:[artifact]});
  const web=await file('proof/web.json',{status:'passed',localOnly:true,deployable:false,sourceReleaseApproved:false,
    protectedBefore:[old],protectedAfter:[old],artifacts:[]});
  const spfx=await file('proof/spfx.json',{status:'passed',localOnly:true,deployable:false,operatingPackagePreserved:true,
    protectedBefore:[old],protectedAfter:[old],testPackage:pkg,compiler:{configuration:compiler},
    steps:[{exitCode:0,log:buildLog.path}]});
  const actual=await file('proof/actual.json',{status:'passed',localOnly:true,syntheticApprovalsOnly:true,typecheckExitCode:0,
    counts:{tests:1,pass:1,fail:0},package:pkg,log:packageLog.path,sha256:packageLog.sha256});
  const proof={workPackage:'AP23F3',status:'local-technical-verification-passed-awaiting-human-acceptance',
    sourceReleaseApproved:false,commitCreated:false,sourcePushPerformed:false,installationPerformed:false,regularIntermediateRelease:false,
    operatingPackagePreserved:true,protectedFiles:1,sourceBindings:[source],candidateManifest:manifest,evidence:[qa,bundle,web,spfx,actual]};
  modifyProof(proof);
  const descriptor=await file('proof/completion.json',proof);
  return{root,file,source,old,artifact,config:{target:'archive/accepted',proofPath:descriptor.path,proofSha256:descriptor.sha256,
    sourceCount:1,candidateFiles:2,qaPath:qa.path,bundlePath:bundle.path,webPath:web.path,spfxPath:spfx.path,packagePath:actual.path,
    guardPaths:[guard.path,extra.path],supplements:[guard,extra,buildLog],
    acceptance:{kind:'acceptedAP23F3Snapshot',accepted:true,sourceReleaseApproved:false,deployable:false}}};
}

test('read-only preflight, focused copy and autonomous verification after living sources change',async t=>{
  const f=await fixture(t),before=await archiveAcceptance(f);
  assert.equal(before.mode,'source-preflight-only');
  await assert.rejects(readFile(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});
  const created=await archiveAcceptance({...f,write:true});
  assert.equal(created.mode,'archive-created');assert.equal(created.candidateFiles,2);
  assert.equal(created.historicalProtectedFilesNotRecopied,1);
  await assert.rejects(readFile(join(f.root,f.config.target,f.old.path)),{code:'ENOENT'});
  await writeFile(join(f.root,f.source.path),'later living source');
  await writeFile(join(f.root,f.old.path),'later historical source');
  const checked=await archiveAcceptance(f);
  assert.equal(checked.mode,'archive-reverified');assert.equal(checked.receiptSha256,created.receiptSha256);
  assert.equal((await readFile(join(f.root,f.config.target,f.source.path))).toString(),'accepted source');
});
for(const kind of ['source','candidate','historical'])test('reject changed '+kind+' before creating a target',async t=>{
  const f=await fixture(t),path=kind==='source'?f.source.path:kind==='candidate'?f.artifact.path:f.old.path;
  await writeFile(join(f.root,path),'tampered');
  await assert.rejects(archiveAcceptance({...f,write:true}),/SHA-256 mismatch/);
  await assert.rejects(readFile(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});
});
test('reject missing source before creating a target',async t=>{
  const f=await fixture(t);await rm(join(f.root,f.source.path));
  await assert.rejects(archiveAcceptance({...f,write:true}),{code:'ENOENT'});
});
test('reject repeated conflicting descriptors',async t=>{
  const f=await fixture(t,p=>p.sourceBindings.push({...p.sourceBindings[0],sha256:'0'.repeat(64)}));
  f.config.sourceCount=2;
  await assert.rejects(archiveAcceptance({...f,write:true}),/Conflicting descriptor/);
});
test('reject escapes, absolute paths, ambiguous separators and NUL',()=>{
  for(const path of ['../a','/a','a/../b','./a','a//b','a\\b','C:/a','','a\0b'])assert.throws(()=>safeRelative(path));
  assert.equal(safeRelative('.work/stage/a.js'),'.work/stage/a.js');
});
for(const kind of ['file','directory'])test('reject '+kind+' symlink',async t=>{
  const f=await fixture(t);
  if(kind==='file'){
    await f.file('other.ts','accepted source');await rm(join(f.root,f.source.path));
    await symlink('../other.ts',join(f.root,f.source.path));
  }else{
    await f.file('other/a.ts','accepted source');await rm(join(f.root,'src'),{recursive:true});
    await symlink('other',join(f.root,'src'));
  }
  await assert.rejects(archiveAcceptance({...f,write:true}),/Symlink not allowed/);
});
test('partial archive halts without repair',async t=>{
  const f=await fixture(t);await mkdir(join(f.root,f.config.target),{recursive:true});
  await assert.rejects(archiveAcceptance({...f,write:true}),/Partial archive/);
});
test('completed archive tampering is rejected without consulting the live copy',async t=>{
  const f=await fixture(t);await archiveAcceptance({...f,write:true});
  await writeFile(join(f.root,f.config.target,f.source.path),'archive tamper');
  await assert.rejects(archiveAcceptance(f),/SHA-256 mismatch/);
});
test('receipt tampering is rejected',async t=>{
  const f=await fixture(t);await archiveAcceptance({...f,write:true});
  await writeFile(join(f.root,f.config.target,'receipt.json'),'{}');
  await assert.rejects(archiveAcceptance(f),/exact derived acceptance record/);
});
test('repeated write re-verifies the complete archive without replacing it',async t=>{
  const f=await fixture(t),first=await archiveAcceptance({...f,write:true});
  const again=await archiveAcceptance({...f,write:true});assert.equal(again.mode,'archive-reverified');
  assert.equal(again.receiptSha256,first.receiptSha256);
});
for(const [key,value] of [['workPackage','AP23E3'],['status','accepted'],['sourceReleaseApproved',true],['commitCreated',true],
  ['sourcePushPerformed',true],['installationPerformed',true],['regularIntermediateRelease',true],['operatingPackagePreserved',false]])
test('reject changed historical proof boundary '+key,async t=>{
  const f=await fixture(t,p=>p[key]=value);
  await assert.rejects(archiveAcceptance({...f,write:true}));
});
test('reject an unbound build report',async t=>{
  const f=await fixture(t);f.config.webPath='unbound.json';
  await assert.rejects(archiveAcceptance({...f,write:true}),/Report is not bound/);
});
test('reject an unbound build log',async t=>{
  const f=await fixture(t);f.config.supplements.pop();
  await assert.rejects(archiveAcceptance({...f,write:true}),/Unbound build log/);
});
test('reject inconsistent candidate count',async t=>{
  const f=await fixture(t);f.config.candidateFiles=3;
  await assert.rejects(archiveAcceptance({...f,write:true}),/Unexpected candidate inventory/);
});
test('reject inconsistent source count',async t=>{
  const f=await fixture(t);f.config.sourceCount=2;
  await assert.rejects(archiveAcceptance({...f,write:true}),/Unexpected source inventory/);
});
test('completed archive rejects a symlink inside the archive',async t=>{
  const f=await fixture(t);await archiveAcceptance({...f,write:true});
  await rm(join(f.root,f.config.target,f.source.path));await symlink(join(f.root,f.source.path),join(f.root,f.config.target,f.source.path));
  await assert.rejects(archiveAcceptance(f),/Symlink not allowed/);
});
