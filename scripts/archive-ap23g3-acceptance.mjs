// SPDX-License-Identifier: AGPL-3.0-only
// Focused accepted integration snapshot. Historical operating data are checked,
// not recursively duplicated. The old pre-acceptance proof remains unchanged.
import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {lstat,mkdir,open,readFile,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {safeRelative,sha256} from './archive-ap23e3-acceptance.mjs';
export {safeRelative,sha256};
const output='outputs/ap23g3-2026-10-22';
export const archiveConfig=Object.freeze({
  target:'outputs/ap23g3-abnahme-2026-10-22',
  proofPath:output+'/local-completion.json',
  proofSha256:'4a394c06458724f6a1e955651efb5c98012ea1998607d7e31283c69d87a60278',
  sourceCount:130,candidateFiles:43,
  qaPath:output+'/QA-AP23G3.json',bundlePath:output+'/bundle-integrity.json',
  webPath:output+'/web-build.json',spfxPath:output+'/spfx-build.json',packagePath:output+'/actual-package.json',
  guardPaths:[output+'/protected-inputs.json'],
  supplements:[],
  acceptance:{
    kind:'acceptedAP23G3Snapshot',acceptedOn:'2026-10-22',acceptedBy:'David Steimer',
    userStatement:'AP23G3 ist fachlich-technisch abgenommen. Bitte schlage die nächste Kantonstranche vor und bereite den nächsten fachlichen Schritt vor.',
    accepted:true,sourceReleaseApproved:false,deployable:false,deployed:false,published:false,
    composition:'Exact accepted local integration bytes and explicit proof, candidate, build and log references. Historical protected inputs stay separately referenced and are not recursively copied.',
    boundaries:['No sources promoted, commits, source push, uploads, installation or E/Q/P changes.',
      'The accepted candidate and local SPFx test package remain non-deployable.',
      'The next canton tranche is to be proposed and prepared, not already accepted.']
  }
});
async function exists(path){try{await lstat(path);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
async function noSymlinks(root,path,{missing=false}={}){
  const base=await lstat(root);assert.ok(base.isDirectory()&&!base.isSymbolicLink(),'Invalid root');
  const parts=safeRelative(path).split('/');let current=root;
  for(const [i,part] of parts.entries()){
    current=resolve(current,part);let stat;
    try{stat=await lstat(current);}catch(e){if(missing&&e.code==='ENOENT')return;throw e;}
    assert.ok(!stat.isSymbolicLink(),'Symlink not allowed: '+current);
    assert.ok(i===parts.length-1||stat.isDirectory(),'Not a directory: '+current);
  }
}
async function readExact(root,item){
  await noSymlinks(root,item.path);
  const handle=await open(resolve(root,item.path),constants.O_RDONLY|constants.O_NOFOLLOW);
  try{
    assert.ok((await handle.stat()).isFile(),'Not a file: '+item.path);
    const bytes=await handle.readFile();assert.equal(sha256(bytes),item.sha256,'SHA-256 mismatch: '+item.path);
    if(item.byteLength!==undefined)assert.equal(bytes.length,item.byteLength,'Byte length mismatch: '+item.path);
    return bytes;
  }finally{await handle.close();}
}
export async function archiveAcceptance({root=process.cwd(),write=false,config=archiveConfig}={}){
  root=resolve(root);safeRelative(config.target);await noSymlinks(root,config.target,{missing:true});
  const target=resolve(root,config.target),complete=await exists(target);
  if(complete)assert.ok(await exists(resolve(target,'receipt.json')),'Partial archive without receipt');
  const input=complete?target:root,descriptors=new Map(),buffers=new Map();
  function add(item){
    safeRelative(item.path);assert.match(item.sha256,/^[a-f0-9]{64}$/u,'Invalid hash: '+item.path);
    if(item.byteLength!==undefined)assert.ok(Number.isSafeInteger(item.byteLength)&&item.byteLength>=0,'Invalid length');
    const prior=descriptors.get(item.path);
    if(prior){
      assert.equal(prior.sha256,item.sha256,'Conflicting descriptor: '+item.path);
      if(prior.byteLength!==undefined&&item.byteLength!==undefined)assert.equal(prior.byteLength,item.byteLength,'Conflicting descriptor length');
    }
    descriptors.set(item.path,{path:item.path,sha256:item.sha256,...(item.byteLength===undefined&&prior?.byteLength===undefined?{}:{byteLength:item.byteLength??prior.byteLength})});
  }
  async function verifiedJson(path){
    const item=descriptors.get(path);assert.ok(item,'Report is not bound: '+path);
    const bytes=await readExact(input,item);buffers.set(path,bytes);return JSON.parse(bytes);
  }
  add({path:config.proofPath,sha256:config.proofSha256});
  const proof=await verifiedJson(config.proofPath);
  assert.equal(proof.workPackage,'AP23G3');
  assert.equal(proof.status,'local-technical-verification-passed-awaiting-human-acceptance');
  for(const key of ['sourceReleaseApproved','commitCreated','sourcePushPerformed','installationPerformed','regularIntermediateRelease'])assert.equal(proof[key],false,key);
  assert.equal(proof.operatingPackagePreserved,true);
  assert.equal(proof.professionalTechnicalAcceptance,false,'Historical pre-acceptance state');
  assert.equal(proof.calendarExportEnabled,false);
  assert.deepEqual(proof.formats,{manifest:'11.0.0',minimumConsumer:'11.0.0',administrativeCatalog:'4.0.0'});
  if(config.sourceCount!==undefined)assert.equal(proof.sourceBindings.length,config.sourceCount,'Unexpected source inventory');
  [...proof.sourceBindings,...proof.evidence,proof.candidateManifest,...config.supplements].forEach(add);
  const qa=await verifiedJson(config.qaPath);
  assert.equal(qa.status,'passed');assert.equal(qa.localOnly,true);assert.equal(qa.sourceReleaseApproved,false);
  for(const step of qa.steps){assert.equal(step.exitCode,0);add({path:step.log,sha256:step.sha256,byteLength:step.byteLength});}
  const bundle=await verifiedJson(config.bundlePath);
  assert.equal(bundle.releaseStatus,'candidate');assert.equal(bundle.sourceReleaseApproved,false);
  assert.equal(bundle.productionActivation,false);assert.equal(bundle.calendarExportEnabled,false);
  add(bundle.manifest);bundle.artifacts.forEach(add);
  const manifest=await verifiedJson(proof.candidateManifest.path);
  assert.equal(manifest.releaseStatus,'candidate');assert.equal(manifest.formatVersion,'11.0.0');
  assert.equal(manifest.compatibility.minimumConsumerFormatVersion,'11.0.0');
  if(config.candidateFiles!==undefined)assert.equal(manifest.artifacts.length+1,config.candidateFiles,'Unexpected candidate inventory');
  for(const d of manifest.artifacts)add({...d,path:dirname(proof.candidateManifest.path)+'/'+safeRelative(d.path)});
  for(const path of [config.webPath,config.spfxPath]){
    const build=await verifiedJson(path);
    assert.equal(build.status,'passed');assert.equal(build.localOnly,true);assert.equal(build.deployable,false);
    assert.deepEqual(build.protectedAfter,build.protectedBefore,'Changed protected build inputs');
    if(path===config.webPath){assert.equal(build.sourceReleaseApproved,false);build.artifacts.forEach(add);}
    else{
      assert.equal(build.operatingPackagePreserved,true);add(build.testPackage);add(build.compiler.configuration);
      for(const step of build.steps){
        assert.equal(step.exitCode,0);assert.ok(descriptors.has(step.log),'Unbound build log: '+step.log);
        add({path:step.log,sha256:step.sha256,byteLength:step.byteLength});
      }
    }
    if(!complete)for(const item of build.protectedBefore)await readExact(root,item);
  }
  const packaged=await verifiedJson(config.packagePath);
  assert.equal(packaged.status,'passed');assert.equal(packaged.localOnly,true);assert.equal(packaged.syntheticApprovalsOnly,true);
  assert.equal(packaged.typecheckExitCode,0);assert.equal(packaged.counts.fail,0);
  assert.equal(packaged.counts.pass,packaged.counts.tests);assert.equal(packaged.counts.skipped,0);
  add(packaged.package);add({path:packaged.log,sha256:packaged.sha256});
  // The protected historical files are read once in source preflight. A
  // completed archive is thereafter verifiable exclusively from its own bytes.
  const guards=await Promise.all(config.guardPaths.map(verifiedJson));
  assert.equal(guards.length,1,'Exactly one protected source inventory');
  const historical=guards[0].files;
  assert.ok(historical&&typeof historical==='object'&&!Array.isArray(historical));
  assert.equal(Object.keys(historical).length,proof.protectedFiles,'Protected inventory count');
  assert.equal(qa.protectedFiles,Object.keys(historical).length,'Inconsistent protected assertion');
  for(const supplement of proof.supplemental??[]){
    assert.equal(supplement.exitCode,0);
    assert.ok(descriptors.has(supplement.path),'Unbound supplemental log: '+supplement.path);
    add(supplement);
  }
  if(!complete)for(const [path,sha256] of Object.entries(historical))await readExact(root,{path,sha256});
  const verified=[];
  for(const item of [...descriptors.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'))){
    const bytes=buffers.get(item.path)??await readExact(input,item);
    assert.equal(sha256(bytes),item.sha256,item.path);
    if(item.byteLength!==undefined)assert.equal(bytes.length,item.byteLength,item.path);
    verified.push({item:{path:item.path,byteLength:bytes.length,sha256:item.sha256},bytes});
  }
  const receipt={...config.acceptance,proof:{path:config.proofPath,sha256:config.proofSha256},
    candidate:{manifest:proof.candidateManifest.path,releaseId:manifest.releaseId,artifactCount:manifest.artifacts.length+1},
    historicalProtectedFilesVerifiedWithoutRecopy:Object.keys(historical).length,
    artifacts:verified.map(row=>row.item)};
  const payload=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
  if(complete){
    await noSymlinks(target,'receipt.json');
    assert.deepEqual(await readFile(resolve(target,'receipt.json')),payload,'Receipt is not the exact derived acceptance record');
  }else if(write){
    await noSymlinks(root,config.target,{missing:true});await mkdir(dirname(target),{recursive:true});await mkdir(target);
    for(const {item,bytes} of verified){
      await noSymlinks(target,item.path,{missing:true});await mkdir(dirname(resolve(target,item.path)),{recursive:true});
      await noSymlinks(target,item.path,{missing:true});await writeFile(resolve(target,item.path),bytes,{flag:'wx'});await readExact(target,item);
    }
    await writeFile(resolve(target,'receipt.json'),payload,{flag:'wx'});
  }
  return{target:config.target,mode:complete?'archive-reverified':write?'archive-created':'source-preflight-only',
    files:verified.length,candidateFiles:manifest.artifacts.length+1,historicalProtectedFilesNotRecopied:Object.keys(historical).length,
    verified:true,receiptSha256:sha256(payload),receiptByteLength:payload.length,
    payloadByteLength:verified.reduce((sum,row)=>sum+row.bytes.length,0)};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(a=>a==='--check'||a==='--write'),'Only --check or --write');
  assert.ok(!(process.argv.includes('--check')&&process.argv.includes('--write')),'Choose one mode');
  console.log(JSON.stringify(await archiveAcceptance({write:process.argv.includes('--write')}),null,2));
}
