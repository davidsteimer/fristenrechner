// SPDX-License-Identifier: AGPL-3.0-only
// Exact accepted L2 snapshot. Original proposal flags remain historical bytes.
import assert from 'node:assert/strict';
import {lstat,mkdir,readdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkedPath,exact,safeRelative,sha256} from './prepare-ap23l2.mjs';
import {validateCompletionMetadata,completionFlags} from './finalize-ap23l2.mjs';
export {checkedPath,exact,safeRelative,sha256};
export const archiveConfig=Object.freeze({
 target:'outputs/ap23l2-abnahme-2026-10-27',proofPath:'outputs/ap23l2-2026-10-27/local-completion.json',
 proofSha256:'6a4807a7e28ab44c0f0a8834ef9a804c9084a1d04417fcec57b4d96b825d50e6',bindingCount:136,
 guard:{path:'outputs/ap23l2-2026-10-27/protected-inputs.json',sha256:'6b8540b694a67a1fffd292486a7480728eca06f37f53f490f8df75fad2786bb1',count:9048},
 requireGitHead:true,
 acceptance:{kind:'acceptedAP23L2Snapshot',acceptedBy:'David Steimer',acceptedOn:'2026-10-27',
  userStatement:'AP23L2 ist technisch abgenommen. Ich bestätige DEC-2026-041 mit Katalog 9.0.0 sowie Manifest und Mindestconsumer 16.0.0. Bitte starte AP23L3.',
  technicalAcceptance:true,technicalL2Acceptance:true,contractDecision:{id:'DEC-2026-041',status:'approved',on:'2026-10-27'},
  approvedFormats:{administrativeCatalog:'9.0.0',manifest:'16.0.0',minimumConsumer:'16.0.0'},
  l3Commissioned:true,l3Started:true,professionalL3Acceptance:false,sourceReleaseApproved:false,deployable:false,deployed:false,sourcePublished:false,
  operatingChanges:false,commitCreated:false,sourcePushPerformed:false,
  boundary:'Exact accepted L2 evidence. Original pending and false flags remain unchanged. L3 permits local product integration and artefact testing only. No source release, commit, push, upload, installation, AP5/AP21 or E/Q/P change.'}
});
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
 const target=resolve(root,config.target),complete=await exists(target);if(complete)assert.ok(await exists(resolve(target,'receipt.json')),'Partial archive without receipt');
 const input=complete?target:root,proofBytes=await exact(input,config.proofPath,config.proofSha256),proof=JSON.parse(proofBytes);
 assert.equal(proof.workPackage,'AP23L2');assert.equal(proof.status,'passed-awaiting-technical-acceptance');
 assert.equal(proof.technicalL2Acceptance,false);assert.equal(proof.professionalL1Acceptance,true);
 assert.deepEqual(proof.contractDecision,{id:'DEC-2026-041',status:'proposed'});for(const key of completionFlags)assert.equal(proof[key],false,'Historical boundary '+key);
 assert.equal(proof.bindings.length,config.bindingCount);const descriptors=new Map();
 for(const item of[{path:config.proofPath,byteLength:proofBytes.length,sha256:config.proofSha256},...proof.bindings]){
  safeRelative(item.path);assert.match(item.sha256,/^[a-f0-9]{64}$/u);assert.ok(Number.isSafeInteger(item.byteLength)&&item.byteLength>=0);
  assert.ok(!descriptors.has(item.path),'Duplicate binding '+item.path);descriptors.set(item.path,item);
 }
 const verified=[];
 for(const item of[...descriptors.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'))){const bytes=await exact(input,item.path,item.sha256);assert.equal(bytes.length,item.byteLength,'Byte length '+item.path);verified.push({item,bytes});}
 const reports=new Map(verified.filter(row=>row.item.path.endsWith('.json')).map(row=>[row.item.path,JSON.parse(row.bytes)]));
 const integrity=reports.get('outputs/ap23l2-candidate-2026-10-27/candidate-integrity.json');assert.ok(integrity,'Missing candidate integrity');assert.equal(integrity.kind,'ap23l2-structural-contract-candidate');
 validateCompletionMetadata(proof,integrity);assert.equal(proof.governanceTests,400);
 const qa=reports.get('outputs/ap23l2-candidate-2026-10-27/QA-AP23L2.json');assert.ok(qa,'Missing Node QA');
 assert.equal(qa.status,'passed');assert.equal(qa.consumerReferenceCases,83);assert.equal(qa.syntheticProbes,20);assert.equal(qa.missingCurrentFactRejections,336);assert.equal(qa.negativeCatalogMutations,22);
 const independent=reports.get('outputs/ap23l2-2026-10-27/independent-verification.json');assert.ok(independent,'Missing independent QA');
 assert.equal(independent.status,'passed');assert.equal(independent.counts.originalReferences,83);assert.equal(independent.counts.independentProbes,697);
 assert.equal(independent.counts.physicalCalendarProbes,12);assert.equal(independent.counts.mutationSensitivities,3);assert.equal(independent.binding.sourceEvidence.length,31);
 assert.equal(independent.binding.operativeSourceCount,17);assert.equal(independent.binding.physicalCalendars,35);assert.equal(independent.binding.holidayRules,499);
 for(const reference of[independent.nodeComparison.evidence,independent.binding.manifest,independent.binding.catalog,independent.binding.suite])assert.deepEqual(reference,descriptors.get(reference.path),'Independent binding '+reference.path);
 for(const reference of independent.binding.sourceEvidence){const bound=descriptors.get(reference.path);assert.ok(bound,'Unbound source evidence '+reference.path);assert.equal(reference.sha256,bound.sha256);assert.equal(reference.byteLength,bound.byteLength);}
 const native=reports.get('outputs/ap23l2-2026-10-27/native-regression.json');assert.ok(native,'Missing native QA');
 assert.equal(native.status,'native-format15-baseline-preserved');assert.equal(native.calculatedCases,165);assert.equal(native.unsupportedReaderRejections,12);assert.equal(native.newAISZCalculations,0);
 for(const report of[qa,independent,native])for(const flag of['sourceReleaseApproved','calendarExportEnabled'])assert.equal(report[flag],false,flag);
 for(const row of native.results){assert.equal(row.acceptedResultEqual,true);assert.equal(row.native.referenceOnly,true);assert.equal(row.native.calendarExportAllowed,false);}
 const manifest=reports.get(proof.manifest.path);assert.ok(manifest);assert.equal(manifest.formatVersion,'16.0.0');assert.equal(manifest.releaseStatus,'candidate');
 const base=dirname(proof.manifest.path);for(const descriptor of manifest.artifacts){const bound=descriptors.get(base+'/'+descriptor.path);assert.ok(bound,'Unbound candidate artifact');assert.equal(descriptor.sha256,bound.sha256);assert.equal(descriptor.byteLength,bound.byteLength);}
 for(const step of proof.steps){assert.equal(step.exitCode,0);const descriptor=descriptors.get(step.path);assert.ok(descriptor,'Unbound step');assert.equal(descriptor.sha256,step.sha256);assert.equal(descriptor.byteLength,step.byteLength);}
 const testStep=proof.steps.find(step=>step.id==='governance-tests'),testText=verified.find(row=>row.item.path===testStep.path).bytes.toString();
 for(const[key,value]of Object.entries({tests:400,pass:400,fail:0,cancelled:0,skipped:0,todo:0}))assert.match(testText,new RegExp('^# '+key+' '+value+'$','m'),'Test evidence '+key);
 if(!complete){if(config.requireGitHead)assert.equal(await readHead(root),proof.head,'Git HEAD changed');
  if(config.guard){const guard=JSON.parse(await exact(root,config.guard.path,config.guard.sha256));assert.equal(Object.keys(guard.files).length,config.guard.count);for(const[path,hash]of Object.entries(guard.files))await exact(root,path,hash);}}
 const receipt={...config.acceptance,proof:{path:config.proofPath,sha256:config.proofSha256},originalBindingCount:proof.bindings.length,
  originalPaths:196,originalNewPaths:31,originalReferenceCases:83,originalGovernanceTests:400,
  protectedInputsCheckedWithoutRecopy:config.guard?.count??0,artifacts:verified.map(row=>row.item)};
 const bytes=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
 if(complete){assert.deepEqual(await exact(target,'receipt.json'),bytes,'Receipt changed');const current=await inventory(target);
  const expectedFiles=[...descriptors.keys(),'receipt.json'].sort(),expectedDirectories=new Set();
  for(const file of expectedFiles){let path=dirname(file);while(path!=='.'){expectedDirectories.add(path);path=dirname(path);}}
  assert.deepEqual(current.files,expectedFiles,'Unexpected archive files');assert.deepEqual(current.directories,[...expectedDirectories].sort(),'Unexpected archive directories');
 }else if(write){await checkedPath(root,config.target,{missing:true});await mkdir(dirname(target),{recursive:true});await mkdir(target);
  for(const{item,bytes:value}of verified){await checkedPath(target,item.path,{missing:true});await mkdir(dirname(resolve(target,item.path)),{recursive:true});await checkedPath(target,item.path,{missing:true});await writeFile(resolve(target,item.path),value,{flag:'wx'});await exact(target,item.path,item.sha256);}
  await writeFile(resolve(target,'receipt.json'),bytes,{flag:'wx'});
 }
 return{verified:true,target:config.target,mode:complete?'archive-reverified':write?'archive-created':'source-preflight-only',files:verified.length,
  payloadBytes:verified.reduce((sum,row)=>sum+row.bytes.length,0),protectedInputsNotRecopied:config.guard?.count??0,receiptSha256:sha256(bytes),receiptByteLength:bytes.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.ok(process.argv.slice(2).every(arg=>['--write','--check'].includes(arg)));assert.ok(!(process.argv.includes('--write')&&process.argv.includes('--check')));
 console.log(JSON.stringify(await archiveAcceptance({write:process.argv.includes('--write')}),null,2));
}
