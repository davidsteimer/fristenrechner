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
const output='outputs/ap23f3-2026-10-22';
export const archiveConfig=Object.freeze({
  target:'outputs/ap23f3-abnahme-2026-10-22',
  proofPath:output+'/local-completion.json',
  proofSha256:'bbf8d3ac815b30224563f98c552e1ac9006e4c58e7b12e5370b0211b65a1541f',
  sourceCount:114,candidateFiles:43,
  qaPath:output+'/QA-AP23F3.json',bundlePath:output+'/bundle-integrity.json',
  webPath:output+'/web-build.json',spfxPath:output+'/spfx-build.json',packagePath:output+'/actual-package.json',
  guardPaths:[output+'/protected-inputs.json',output+'/additional-protected-inputs.json'],
  // These supplement descriptors close log references not hashed in the
  // original SPFx report. They do not alter that report or its claim.
  supplements:[
    {path:output+'/protected-inputs.json',byteLength:57602,sha256:'31d20757d18b20e2d0a481facf3c4636e8b607142c3b968a097e17a14605da36'},
    {path:output+'/additional-protected-inputs.json',byteLength:1223,sha256:'1e3f37a68249ae86824294e9a38544997fc0aa77c64468c6ef669c7e2a406f38'},
    {path:output+'/typecheck-final.txt',byteLength:0,sha256:'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'},
    {path:output+'/actual-package-initial.json',byteLength:614,sha256:'73a0c7df19e547a5cb90c51998418fbc6edc6f1efe33669ef1c06888be77337a'},
    {path:output+'/actual-package-initial.txt',byteLength:3668,sha256:'3ce196ce7eb584268c25a7140015ecb27a03a128affc83d97622b7c181fc73f3'},
    {path:'.work/ap23f3-spfx-build-jP0hLQ/verification.json',byteLength:3347,sha256:'05af6aaa831be9685aff51c2ebd35fcbe1d603c074f1b26999513fc523faed6a'},
    {path:'.work/ap23f3-spfx-build-jP0hLQ/step-1.log',byteLength:248395,sha256:'fde97f7a2eb039473c0b13244d5201db05ce49f74e0d1c6112bf7ec1200f2e68'},
    {path:'.work/ap23f3-spfx-build-aH4B9b/step-1.log',byteLength:49501,sha256:'4fefe5dc2daa7ee02499c2e2a3877ef2a241c92fd0539f251b329e93d3ef9481'},
    {path:'.work/ap23f3-spfx-build-aH4B9b/step-2.log',byteLength:14149,sha256:'3c3151f4e7720f0535f40a280268308e64b7a59582c42a79cbde13ec276a6cb2'},
    {path:'.work/ap23f3-spfx-build-aH4B9b/step-3.log',byteLength:69,sha256:'29fdd3e296d6e326a7d5d5081418a7aa36a7c50388efb89ecb95e08d2a49d893'},
    {path:'.work/ap23f3-spfx-build-aH4B9b/step-4.log',byteLength:6185,sha256:'b731e8ef26503c91b49146fd49840c27d9846f3f8ae8d7e61ed959267882223d'},
    {path:'.work/ap23f3-spfx-build-aH4B9b/step-5.log',byteLength:56378,sha256:'72b5855b85d10d0718d52eab3c157694e37e770f5e87b88bfca7260992bae4c1'}
  ],
  acceptance:{
    kind:'acceptedAP23F3Snapshot',acceptedOn:'2026-10-22',acceptedBy:'David Steimer',
    userStatement:'AP23F3 ist fachlich-technisch abgenommen. Bitte schlage die nächste Kantonstranche vor und bereite den nächsten fachlichen Schritt vor.',
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
  assert.equal(proof.workPackage,'AP23F3');
  assert.equal(proof.status,'local-technical-verification-passed-awaiting-human-acceptance');
  for(const key of ['sourceReleaseApproved','commitCreated','sourcePushPerformed','installationPerformed','regularIntermediateRelease'])assert.equal(proof[key],false,key);
  assert.equal(proof.operatingPackagePreserved,true);
  if(config.sourceCount!==undefined)assert.equal(proof.sourceBindings.length,config.sourceCount,'Unexpected source inventory');
  [...proof.sourceBindings,...proof.evidence,proof.candidateManifest,...config.supplements].forEach(add);
  const qa=await verifiedJson(config.qaPath);
  assert.equal(qa.status,'passed');assert.equal(qa.localOnly,true);assert.equal(qa.sourceReleaseApproved,false);
  for(const step of qa.steps){assert.equal(step.exitCode,0);add({path:step.log,sha256:step.sha256});}
  const bundle=await verifiedJson(config.bundlePath);
  assert.equal(bundle.releaseStatus,'candidate');assert.equal(bundle.sourceReleaseApproved,false);
  assert.equal(bundle.productionActivation,false);assert.equal(bundle.calendarExportEnabled,false);
  add(bundle.manifest);bundle.artifacts.forEach(add);
  const manifest=await verifiedJson(proof.candidateManifest.path);
  assert.equal(manifest.releaseStatus,'candidate');assert.equal(manifest.formatVersion,'10.0.0');
  if(config.candidateFiles!==undefined)assert.equal(manifest.artifacts.length+1,config.candidateFiles,'Unexpected candidate inventory');
  for(const d of manifest.artifacts)add({...d,path:dirname(proof.candidateManifest.path)+'/'+safeRelative(d.path)});
  for(const path of [config.webPath,config.spfxPath]){
    const build=await verifiedJson(path);
    assert.equal(build.status,'passed');assert.equal(build.localOnly,true);assert.equal(build.deployable,false);
    assert.deepEqual(build.protectedAfter,build.protectedBefore,'Changed protected build inputs');
    if(path===config.webPath){assert.equal(build.sourceReleaseApproved,false);build.artifacts.forEach(add);}
    else{
      assert.equal(build.operatingPackagePreserved,true);add(build.testPackage);add(build.compiler.configuration);
      for(const step of build.steps){assert.equal(step.exitCode,0);assert.ok(descriptors.has(step.log),'Unbound build log: '+step.log);}
    }
    if(!complete)for(const item of build.protectedBefore)await readExact(root,item);
  }
  const packaged=await verifiedJson(config.packagePath);
  assert.equal(packaged.status,'passed');assert.equal(packaged.localOnly,true);assert.equal(packaged.syntheticApprovalsOnly,true);
  assert.equal(packaged.typecheckExitCode,0);assert.equal(packaged.counts.fail,0);
  add(packaged.package);add({path:packaged.log,sha256:packaged.sha256});
  // The protected historical files are read once in source preflight. A
  // completed archive is thereafter verifiable exclusively from its own bytes.
  const guards=await Promise.all(config.guardPaths.map(verifiedJson));
  const historical={...guards[0].files,...guards[1]};
  assert.equal(Object.keys(historical).length,proof.protectedFiles,'Protected inventory count');
  for(const item of qa.protectedFiles)assert.equal(historical[item.path],item.sha256,'Inconsistent protected assertion');
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
    verified:true,receiptSha256:sha256(payload),receiptByteLength:payload.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(a=>a==='--check'||a==='--write'),'Only --check or --write');
  assert.ok(!(process.argv.includes('--check')&&process.argv.includes('--write')),'Choose one mode');
  console.log(JSON.stringify(await archiveAcceptance({write:process.argv.includes('--write')}),null,2));
}
