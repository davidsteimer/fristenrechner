// SPDX-License-Identifier: AGPL-3.0-only
// Exact accepted J2 snapshot. Proposal flags in original evidence remain historical.
import assert from 'node:assert/strict';
import {lstat,mkdir,readdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkedPath,exact,safeRelative,sha256} from './prepare-ap23j2.mjs';
export {checkedPath,exact,safeRelative,sha256};
export const archiveConfig=Object.freeze({
  target:'outputs/ap23j2-abnahme-2026-10-27',proofPath:'outputs/ap23j2-2026-10-27/local-completion.json',
  proofSha256:'7afd5e4b9411b3853c12690154756c2af74e050b58ae2d424b5852eb7af6eba3',bindingCount:93,
  guard:{path:'outputs/ap23j2-2026-10-27/protected-inputs.json',sha256:'1d65ba6006db51cea44198a52cb61def7830b67887e6f502aa8445a3f0cb6b17',count:4413},
  paths:149,newPaths:36,preservedPaths:113,cases:673,tests:416,negativeCatalogMutations:38,negativeInputMutations:542,
  readerNegatives:5,openingProbes:11,sourceByteBindings:19,requireGitHead:true,
  acceptance:{kind:'acceptedAP23J2Snapshot',acceptedBy:'David Steimer',acceptedOn:'2026-10-27',
    userStatement:'AP23J2 ist technisch abgenommen. Ich bestätige DEC-2026-039 mit Katalog 7.0.0 sowie Manifest und Mindestconsumer 14.0.0. Bitte starte AP23J3.',
    technicalAcceptance:true,contractDecision:{id:'DEC-2026-039',status:'approved',on:'2026-10-27'},
    approvedFormats:{administrativeCatalog:'7.0.0',manifest:'14.0.0',minimumConsumer:'14.0.0'},
    j3Commissioned:true,professionalJ3Acceptance:false,sourceReleaseApproved:false,deployable:false,deployed:false,sourcePublished:false,
    boundary:'Exact accepted J2 evidence. Original pending and false flags remain unchanged. J3 is local product integration and artefact testing, not a source release, commit, push, upload, installation or E/Q/P change.'}
});
const falseKeys=['runtimeActive','productIntegration','sourceReleaseApproved','calendarExportEnabled','productCodeChanged','nativeSchemasChanged',
  'acceptedLegalDataChanged','existingTestsChanged','commitCreated','sourcePushPerformed','releaseBuildPerformed','operatingChanges','j3Started',
  'publicProjectStatusUpdated','publicTechnicalFindingsPublished'];
async function exists(path){try{await lstat(path);return true;}catch(error){if(error.code==='ENOENT')return false;throw error;}}
async function inventory(root,path=''){
  const files=[],directories=[];
  for(const item of await readdir(resolve(root,path),{withFileTypes:true})){
    const next=path?path+'/'+item.name:item.name;assert.ok(!item.isSymbolicLink(),'Symlink in archive: '+next);
    if(item.isDirectory()){directories.push(next);const nested=await inventory(root,next);files.push(...nested.files);directories.push(...nested.directories);}
    else{assert.ok(item.isFile(),'Not a regular archive file: '+next);files.push(next);}
  }
  return{files:files.sort(),directories:directories.sort()};
}
export async function archiveAcceptance({root=process.cwd(),write=false,config=archiveConfig,
  readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
  root=resolve(root);safeRelative(config.target);await checkedPath(root,config.target,{missing:true});
  const target=resolve(root,config.target),complete=await exists(target);
  if(complete)assert.ok(await exists(resolve(target,'receipt.json')),'Partial archive without receipt');
  const input=complete?target:root,proofBytes=await exact(input,config.proofPath,config.proofSha256),proof=JSON.parse(proofBytes);
  assert.equal(proof.workPackage,'AP23J2');assert.equal(proof.status,'passed-awaiting-technical-acceptance');
  assert.equal(proof.technicalJ2Acceptance,false);assert.equal(proof.professionalJ1Acceptance,true);
  assert.deepEqual(proof.contractDecision,{id:'DEC-2026-039',status:'proposed'});
  assert.equal(proof.counts.totalPaths,config.paths);assert.equal(proof.counts.newPaths,config.newPaths);assert.equal(proof.counts.preservedPaths,config.preservedPaths);
  assert.equal(proof.referenceCases,config.cases);assert.equal(proof.governanceTests,config.tests);
  for(const key of falseKeys)assert.equal(proof[key],false,'Historical boundary '+key);
  assert.equal(proof.bindings.length,config.bindingCount);const descriptors=new Map();
  for(const item of[{path:config.proofPath,byteLength:proofBytes.length,sha256:config.proofSha256},...proof.bindings]){
    safeRelative(item.path);assert.match(item.sha256,/^[a-f0-9]{64}$/u);assert.ok(Number.isSafeInteger(item.byteLength)&&item.byteLength>=0);
    assert.ok(!descriptors.has(item.path),'Duplicate binding: '+item.path);descriptors.set(item.path,item);
  }
  const verified=[];
  for(const item of[...descriptors.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'))){
    const bytes=await exact(input,item.path,item.sha256);assert.equal(bytes.length,item.byteLength,'Byte length '+item.path);verified.push({item,bytes});
  }
  const reports=new Map(verified.filter(x=>x.item.path.endsWith('.json')).map(x=>[x.item.path,JSON.parse(x.bytes)]));
  const qa=[...reports.values()].find(x=>x.workPackage==='AP23J2'&&x.status==='passed');assert.ok(qa,'Missing Node QA');
  assert.equal(qa.referenceCases,config.cases);assert.equal(qa.negativeCatalogMutations,config.negativeCatalogMutations);
  assert.equal(qa.negativeInputMutations,config.negativeInputMutations);assert.equal(qa.readerNegatives.length,config.readerNegatives);
  const independent=[...reports.values()].find(x=>x.status==='passedIndependentStructuralAndResearchComparison');assert.ok(independent,'Missing independent QA');
  assert.equal(independent.referenceCases,config.cases);assert.equal(independent.openingProvenanceComparisons,config.openingProbes);
  assert.equal(independent.sourceByteBindings,config.sourceByteBindings);assert.equal(independent.holidayRules,499);assert.equal(independent.physicalProjectionRules,431);assert.deepEqual(independent.discrepancies,[]);
  const qaDescriptor=verified.find(x=>x.item.path.endsWith('/QA-AP23J2.json'))?.item;assert.ok(qaDescriptor);assert.equal(independent.nodeEvidenceSha256,qaDescriptor.sha256);
  for(const step of proof.steps){assert.equal(step.exitCode,0);const descriptor=descriptors.get(step.path);assert.ok(descriptor,'Unbound step');
    assert.equal(descriptor.sha256,step.sha256);assert.equal(descriptor.byteLength,step.byteLength);}
  const testStep=proof.steps.find(step=>step.id==='governance-tests');assert.ok(testStep,'Missing test evidence');
  const text=verified.find(x=>x.item.path===testStep.path).bytes.toString();
  for(const[key,value]of Object.entries({tests:config.tests,pass:config.tests,fail:0,cancelled:0,skipped:0,todo:0}))
    assert.match(text,new RegExp('^# '+key+' '+value+'$','m'),'Test evidence '+key);
  const manifest=reports.get(proof.manifest.path);assert.ok(manifest);assert.equal(manifest.formatVersion,'14.0.0');assert.equal(manifest.releaseStatus,'candidate');
  if(!complete){
    if(config.requireGitHead)assert.equal(await readHead(root),proof.head,'Git HEAD changed');
    if(config.guard){const guard=JSON.parse(await exact(root,config.guard.path,config.guard.sha256));assert.equal(Object.keys(guard.files).length,config.guard.count);
      for(const[path,hash]of Object.entries(guard.files))await exact(root,path,hash);}
  }
  const receipt={...config.acceptance,proof:{path:config.proofPath,sha256:config.proofSha256},originalBindingCount:proof.bindings.length,
    originalPaths:config.paths,originalNewPaths:config.newPaths,originalReferenceCases:config.cases,originalGovernanceTests:config.tests,
    protectedInputsCheckedWithoutRecopy:config.guard?.count??0,artifacts:verified.map(x=>x.item)};
  const bytes=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
  if(complete){assert.deepEqual(await exact(target,'receipt.json'),bytes,'Receipt changed');const current=await inventory(target);
    const expectedFiles=[...descriptors.keys(),'receipt.json'].sort(),expectedDirectories=new Set();
    for(const file of expectedFiles){let path=dirname(file);while(path!=='.'){expectedDirectories.add(path);path=dirname(path);}}
    assert.deepEqual(current.files,expectedFiles,'Unexpected archive files');assert.deepEqual(current.directories,[...expectedDirectories].sort(),'Unexpected archive directories');
  }else if(write){
    await checkedPath(root,config.target,{missing:true});await mkdir(dirname(target),{recursive:true});await mkdir(target);
    for(const{item,bytes:value}of verified){await checkedPath(target,item.path,{missing:true});await mkdir(dirname(resolve(target,item.path)),{recursive:true});
      await checkedPath(target,item.path,{missing:true});await writeFile(resolve(target,item.path),value,{flag:'wx'});await exact(target,item.path,item.sha256);}
    await writeFile(resolve(target,'receipt.json'),bytes,{flag:'wx'});
  }
  return{verified:true,target:config.target,mode:complete?'archive-reverified':write?'archive-created':'source-preflight-only',files:verified.length,
    payloadBytes:verified.reduce((sum,x)=>sum+x.bytes.length,0),protectedInputsNotRecopied:config.guard?.count??0,receiptSha256:sha256(bytes),receiptByteLength:bytes.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(arg=>['--write','--check'].includes(arg)));assert.ok(!(process.argv.includes('--write')&&process.argv.includes('--check')));
  console.log(JSON.stringify(await archiveAcceptance({write:process.argv.includes('--write')}),null,2));
}

