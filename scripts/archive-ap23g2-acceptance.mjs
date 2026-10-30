// SPDX-License-Identifier: AGPL-3.0-only
// Exact accepted G2 bytes. An acceptance never rewrites its former proposal.
import assert from 'node:assert/strict';
import { constants } from 'node:fs';
import { lstat, mkdir, open, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { safeRelative, sha256 } from './archive-ap23g1-acceptance.mjs';
export { safeRelative, sha256 };
export const archiveConfig=Object.freeze({target:'outputs/ap23g2-abnahme-2026-10-22',
  proofPath:'outputs/ap23g2-2026-10-22/local-completion.json',proofSha256:'bc06bf3e6fa10986be2c27dbf927b7e4988f9522e98b20f82803f141d0d378f8',
  bindingCount:83,paths:58,cases:115,
  acceptance:{kind:'acceptedAP23G2Snapshot',acceptedBy:'David Steimer',acceptedOn:'2026-10-22',
    userStatement:'AP23G2 ist technisch abgenommen. Ich bestätige DEC-2026-036 mit Katalog 4.0.0 sowie Manifest und Mindestconsumer 11.0.0. Bitte starte AP23G3.',
    technicalAcceptance:true,contractDecision:{id:'DEC-2026-036',status:'approved',on:'2026-10-22'},
    approvedFormats:{administrativeCatalog:'4.0.0',manifest:'11.0.0',minimumConsumer:'11.0.0'},
    g3Commissioned:true,sourceReleaseApproved:false,deployable:false,deployed:false,sourcePublished:false,
    boundary:'Exact G2 evidence only. Prior false acceptance flags remain historical. G3 is a new local integration, no approval of a source release, export, installation or E/Q/P.'}});
async function exists(p){try{await lstat(p);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
async function checkedPath(root,path,missing=false){let cursor=root;for(const part of safeRelative(path).split('/')){
  cursor=resolve(cursor,part);let s;try{s=await lstat(cursor);}catch(e){if(missing&&e.code==='ENOENT')return;throw e;}
  assert.ok(!s.isSymbolicLink(),'Symlink not allowed: '+path);}}
async function exact(root,d){await checkedPath(root,d.path);const f=await open(resolve(root,d.path),constants.O_RDONLY|constants.O_NOFOLLOW);
  try{assert.ok((await f.stat()).isFile());const b=await f.readFile();assert.equal(sha256(b),d.sha256,'SHA-256 mismatch: '+d.path);
    if(d.byteLength!==undefined)assert.equal(b.length,d.byteLength,'Byte length mismatch: '+d.path);return b;}finally{await f.close();}}
async function walk(root,path=''){const rows=[];for(const e of await readdir(resolve(root,path),{withFileTypes:true})){
  assert.ok(!e.isSymbolicLink(),'Symlink in archive');const p=path?path+'/'+e.name:e.name;rows.push(...(e.isDirectory()?await walk(root,p):[p]));}return rows.sort();}
export async function archiveAcceptance({root=process.cwd(),write=false,config=archiveConfig}={}){
  root=resolve(root);safeRelative(config.target);await checkedPath(root,config.target,true);const target=resolve(root,config.target),complete=await exists(target);
  if(complete)assert.ok(await exists(resolve(target,'receipt.json')),'Partial archive without receipt');
  const base=complete?target:root,proofBytes=await exact(base,{path:config.proofPath,sha256:config.proofSha256}),p=JSON.parse(proofBytes);
  assert.equal(p.workPackage,'AP23G2');assert.equal(p.status,'passed-awaiting-technical-acceptance');assert.equal(p.technicalAcceptance,false);
  assert.deepEqual(p.contractDecision,{id:'DEC-2026-036',status:'proposed'});assert.equal(p.counts.paths,config.paths);assert.equal(p.counts.cases,config.cases);
  for(const k of['runtimeActive','productIntegration','sourceReleaseApproved','calendarExportEnabled','productCodeChanged','acceptedLegalDataChanged',
    'commitCreated','sourcePushPerformed','releaseBuildPerformed','operatingChanges','g3Started'])assert.equal(p[k],false,k);
  assert.equal(p.bindings.length,config.bindingCount);const descriptors=new Map();
  for(const d of[{path:config.proofPath,byteLength:proofBytes.length,sha256:config.proofSha256},...p.bindings]){
    safeRelative(d.path);assert.match(d.sha256,/^[a-f0-9]{64}$/);assert.ok(Number.isSafeInteger(d.byteLength)&&d.byteLength>=0);
    assert.ok(!descriptors.has(d.path),'Duplicate binding: '+d.path);descriptors.set(d.path,d);}
  const verified=[];for(const d of [...descriptors.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'))){const b=await exact(base,d);verified.push({descriptor:d,bytes:b});}
  const reports=new Map(verified.filter(x=>x.descriptor.path.endsWith('.json')).map(x=>[x.descriptor.path,JSON.parse(x.bytes)]));
  const qa=[...reports.values()].find(x=>x.workPackage==='AP23G2'&&x.status==='passed');assert.ok(qa);assert.equal(qa.referenceCases,config.cases);
  assert.equal(qa.negativeCatalogMutations,43);assert.equal(qa.negativeInputMutations,38);assert.equal(qa.readerNegatives.length,6);
  for(const s of p.steps){assert.equal(s.exitCode,0);const d=descriptors.get(s.path);assert.ok(d);assert.equal(d.sha256,s.sha256);}
  const manifest=reports.get(p.manifest.path);assert.ok(manifest);assert.equal(manifest.formatVersion,'11.0.0');assert.equal(manifest.releaseStatus,'candidate');
  const receipt={...config.acceptance,proof:{path:config.proofPath,sha256:config.proofSha256},
    originalBindingCount:p.bindings.length,artifacts:verified.map(x=>x.descriptor)};
  const b=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
  if(complete){assert.deepEqual(await readFile(resolve(target,'receipt.json')),b,'Receipt changed');
    assert.deepEqual(await walk(target),[...descriptors.keys(),'receipt.json'].sort(),'Unexpected archive files');
  }else if(write){await mkdir(dirname(target),{recursive:true});await mkdir(target);for(const x of verified){
    await checkedPath(target,x.descriptor.path,true);const path=resolve(target,x.descriptor.path);await mkdir(dirname(path),{recursive:true});
    await writeFile(path,x.bytes,{flag:'wx'});await exact(target,x.descriptor);}
    await writeFile(resolve(target,'receipt.json'),b,{flag:'wx'});}
  return{verified:true,target:config.target,mode:complete?'archive-reverified':write?'archive-created':'source-preflight-only',
    files:verified.length,payloadBytes:verified.reduce((n,x)=>n+x.bytes.length,0),receiptSha256:sha256(b),receiptByteLength:b.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(x=>['--write','--check'].includes(x)));assert.ok(!(process.argv.includes('--write')&&process.argv.includes('--check')));
  console.log(JSON.stringify(await archiveAcceptance({write:process.argv.includes('--write')}),null,2));
}
