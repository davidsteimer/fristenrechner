// SPDX-License-Identifier: AGPL-3.0-only
// Immutable H2 technical acceptance. Historical proposal flags remain unchanged.
import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {lstat,mkdir,open,readFile,readdir,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {safeRelative,sha256} from './archive-ap23h1-acceptance.mjs';
export {safeRelative,sha256};
export const archiveConfig=Object.freeze({
  target:'outputs/ap23h2-abnahme-2026-10-22',proofPath:'outputs/ap23h2-2026-10-22/local-completion.json',
  proofSha256:'e2398539e3c1ba0c06948fa50dae62aa17c0dc39d011962ab5b2a43888072dd1',bindingCount:84,paths:79,cases:118,
  protected:{path:'outputs/ap23h2-2026-10-22/protected-inputs.json',sha256:'4149bd30afa1d71885d065ade999149633bf7ab9c81249a49dc3389fe45afdf7',count:1754},
  acceptance:{kind:'acceptedAP23H2Snapshot',acceptedBy:'David Steimer',acceptedOn:'2026-10-22',
    userStatement:'AP23H2 ist technisch abgenommen. Ich bestätige DEC-2026-037 mit Katalog 5.0.0 sowie Manifest und Mindestconsumer 12.0.0. Bitte starte AP23H3.',
    technicalAcceptance:true,contractDecision:{id:'DEC-2026-037',status:'approved',on:'2026-10-22'},
    approvedFormats:{administrativeCatalog:'5.0.0',manifest:'12.0.0',minimumConsumer:'12.0.0'},
    h3Commissioned:true,professionalH3Acceptance:false,sourceReleaseApproved:false,deployable:false,deployed:false,sourcePublished:false,
    boundary:'Exact accepted H2 evidence. Its original false approval flags remain historical. H3 is local integration only, no source release, export, commit, push, upload, installation or E/Q/P permission.'}
});
async function exists(p){try{await lstat(p);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
async function checkedPath(root,path,missing=false){
  const initial=await lstat(root);assert.ok(initial.isDirectory()&&!initial.isSymbolicLink(),'Invalid root');
  let cursor=root;const parts=safeRelative(path).split('/');for(const[i,part]of parts.entries()){
    cursor=resolve(cursor,part);let s;try{s=await lstat(cursor);}catch(e){if(missing&&e.code==='ENOENT')return;throw e;}
    assert.ok(!s.isSymbolicLink(),'Symlink not allowed: '+path);assert.ok(i===parts.length-1||s.isDirectory(),'Not a directory: '+path);
  }
}
async function exact(root,d){await checkedPath(root,d.path);const f=await open(resolve(root,d.path),constants.O_RDONLY|constants.O_NOFOLLOW);
  try{assert.ok((await f.stat()).isFile(),'Not a regular file');const b=await f.readFile();assert.equal(sha256(b),d.sha256,'SHA-256 mismatch: '+d.path);
    if(d.byteLength!==undefined)assert.equal(b.length,d.byteLength,'Byte length mismatch: '+d.path);return b;}finally{await f.close();}}
async function walk(root,path=''){const rows=[];for(const e of await readdir(resolve(root,path),{withFileTypes:true})){
  const p=path?path+'/'+e.name:e.name;assert.ok(!e.isSymbolicLink(),'Symlink in archive: '+p);
  if(e.isDirectory())rows.push(...await walk(root,p));else{assert.ok(e.isFile(),'Not a regular file');rows.push(p);}
}return rows.sort();}
export async function archiveAcceptance({root=process.cwd(),write=false,config=archiveConfig}={}){
  root=resolve(root);safeRelative(config.target);await checkedPath(root,config.target,true);
  const target=resolve(root,config.target),complete=await exists(target);
  if(complete)assert.ok(await exists(resolve(target,'receipt.json')),'Partial archive without receipt');
  const input=complete?target:root,proofBytes=await exact(input,{path:config.proofPath,sha256:config.proofSha256}),p=JSON.parse(proofBytes);
  assert.equal(p.workPackage,'AP23H2');assert.equal(p.status,'passed-awaiting-technical-acceptance');assert.equal(p.technicalH2Acceptance,false);
  assert.equal(p.professionalH1Acceptance,true);assert.deepEqual(p.contractDecision,{id:'DEC-2026-037',status:'proposed'});
  assert.equal(p.counts.totalPaths,config.paths);assert.equal(p.referenceCases,config.cases);
  for(const k of['runtimeActive','productIntegration','sourceReleaseApproved','calendarExportEnabled','productCodeChanged','nativeSchemasChanged',
    'acceptedLegalDataChanged','existingTestsChanged','commitCreated','sourcePushPerformed','releaseBuildPerformed','operatingChanges','h3Started'])assert.equal(p[k],false,k);
  assert.equal(p.bindings.length,config.bindingCount);const descriptors=new Map();
  for(const d of[{path:config.proofPath,byteLength:proofBytes.length,sha256:config.proofSha256},...p.bindings]){
    safeRelative(d.path);assert.match(d.sha256,/^[a-f0-9]{64}$/u);assert.ok(Number.isSafeInteger(d.byteLength)&&d.byteLength>=0);
    assert.ok(!descriptors.has(d.path),'Duplicate binding: '+d.path);descriptors.set(d.path,d);
  }
  const verified=[];for(const d of[...descriptors.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'))){verified.push({descriptor:d,bytes:await exact(input,d)});}
  const reports=new Map(verified.filter(x=>x.descriptor.path.endsWith('.json')).map(x=>[x.descriptor.path,JSON.parse(x.bytes)]));
  const qa=[...reports.values()].find(x=>x.workPackage==='AP23H2'&&x.status==='passed');assert.ok(qa);assert.equal(qa.referenceCases,config.cases);
  assert.equal(qa.negativeCatalogMutations,78);assert.equal(qa.negativeInputMutations,36);assert.equal(qa.readerNegatives.length,6);
  for(const s of p.steps){assert.equal(s.exitCode,0);const d=descriptors.get(s.path);assert.ok(d);assert.equal(d.sha256,s.sha256);}
  const manifest=reports.get(p.manifest.path);assert.ok(manifest);assert.equal(manifest.formatVersion,'12.0.0');assert.equal(manifest.releaseStatus,'candidate');
  if(!complete&&config.protected){const g=JSON.parse(await exact(root,config.protected));assert.equal(Object.keys(g.files).length,config.protected.count);
    for(const[path,sha256]of Object.entries(g.files))await exact(root,{path,sha256});}
  const receipt={...config.acceptance,proof:{path:config.proofPath,sha256:config.proofSha256},originalBindingCount:p.bindings.length,
    protectedInputsCheckedWithoutRecopy:config.protected?.count??0,artifacts:verified.map(x=>x.descriptor)};
  const bytes=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
  if(complete){await checkedPath(target,'receipt.json');assert.deepEqual(await readFile(resolve(target,'receipt.json')),bytes,'Receipt changed');
    assert.deepEqual(await walk(target),[...descriptors.keys(),'receipt.json'].sort(),'Unexpected archive files');
  }else if(write){await checkedPath(root,config.target,true);await mkdir(dirname(target),{recursive:true});await mkdir(target);
    for(const x of verified){await checkedPath(target,x.descriptor.path,true);const path=resolve(target,x.descriptor.path);
      await mkdir(dirname(path),{recursive:true});await checkedPath(target,x.descriptor.path,true);await writeFile(path,x.bytes,{flag:'wx'});await exact(target,x.descriptor);}
    await writeFile(resolve(target,'receipt.json'),bytes,{flag:'wx'});}
  return{verified:true,target:config.target,mode:complete?'archive-reverified':write?'archive-created':'source-preflight-only',files:verified.length,
    payloadBytes:verified.reduce((n,x)=>n+x.bytes.length,0),protectedInputsNotRecopied:config.protected?.count??0,
    receiptSha256:sha256(bytes),receiptByteLength:bytes.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(x=>['--write','--check'].includes(x)));assert.ok(!(process.argv.includes('--write')&&process.argv.includes('--check')));
  console.log(JSON.stringify(await archiveAcceptance({write:process.argv.includes('--write')}),null,2));
}
