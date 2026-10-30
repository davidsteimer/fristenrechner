// SPDX-License-Identifier: AGPL-3.0-only
// Exact accepted M2 snapshot. Original proposal flags remain historical bytes.
import assert from 'node:assert/strict';
import {lstat,mkdir,readdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkedPath,exact,safeRelative,sha256} from './prepare-ap23m2.mjs';
import {validateMetadata,flags} from './finalize-ap23m2.mjs';
export {checkedPath,exact,safeRelative,sha256};
export const archiveConfig=Object.freeze({target:'outputs/ap23m2-abnahme-2026-10-28',proofPath:'outputs/ap23m2-2026-10-28/local-completion.json',
 proofSha256:'b23876599a8855d921293787aacc1c429c9aefa6205fd7d0a7e13f89d7ab9cd0',bindingCount:180,
 guard:{path:'outputs/ap23m2-2026-10-28/protected-inputs.json',sha256:'af68d4b6c0fb33d731c50f99b3ca3c63bc1c573d5635d259798a5ed28953c3b1',count:11414},
 requireGitHead:true,acceptance:{kind:'acceptedAP23M2Snapshot',acceptedBy:'David Steimer',acceptedOn:'2026-10-28',
  userStatement:'AP23M2 ist technisch abgenommen. Ich bestätige DEC-2026-042 mit Katalog 10.0.0 sowie Manifest und Mindestconsumer 17.0.0. Bitte starte AP23M3.',
  technicalAcceptance:true,technicalM2Acceptance:true,contractDecision:{id:'DEC-2026-042',status:'approved',on:'2026-10-28'},
  approvedFormats:{administrativeCatalog:'10.0.0',manifest:'17.0.0',minimumConsumer:'17.0.0'},m3Commissioned:true,m3Started:true,
  professionalM3Acceptance:false,sourceReleaseApproved:false,deployable:false,deployed:false,sourcePublished:false,operatingChanges:false,commitCreated:false,sourcePushPerformed:false,
  boundary:'Exact accepted M2 evidence. Original pending and false flags remain unchanged. M3 permits local native integration and artefact tests only. No source release, commit, push, upload, installation, AP5/AP21 or E/Q/P change.'}});
async function exists(path){try{await lstat(path);return true;}catch(error){if(error.code==='ENOENT')return false;throw error;}}
async function inventory(root,path=''){
 const files=[],directories=[];for(const entry of await readdir(resolve(root,path),{withFileTypes:true})){
  const next=path?path+'/'+entry.name:entry.name;assert.ok(!entry.isSymbolicLink(),'Symlink in archive '+next);
  if(entry.isDirectory()){directories.push(next);const nested=await inventory(root,next);files.push(...nested.files);directories.push(...nested.directories);}
  else{assert.ok(entry.isFile(),'Not a regular archive file '+next);files.push(next);}
 }return{files:files.sort(),directories:directories.sort()};
}
export async function archiveAcceptance({root=process.cwd(),write=false,config=archiveConfig,
 readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
 root=resolve(root);safeRelative(config.target);await checkedPath(root,config.target,{missing:true});const target=resolve(root,config.target),complete=await exists(target);
 if(complete)assert.ok(await exists(resolve(target,'receipt.json')),'Partial archive without receipt');const input=complete?target:root;
 const proofBytes=await exact(input,config.proofPath,config.proofSha256),proof=JSON.parse(proofBytes);validateMetadata(proof);
 assert.equal(proof.workPackage,'AP23M2');assert.equal(proof.technicalM2Acceptance,false);assert.equal(proof.professionalM1Acceptance,true);
 for(const flag of flags)assert.equal(proof[flag],false,'Historical boundary '+flag);assert.equal(proof.bindings.length,config.bindingCount);assert.equal(proof.governanceTests,476);
 const descriptors=new Map();for(const item of[{path:config.proofPath,byteLength:proofBytes.length,sha256:config.proofSha256},...proof.bindings]){
  safeRelative(item.path);assert.match(item.sha256,/^[a-f0-9]{64}$/u);assert.ok(Number.isSafeInteger(item.byteLength)&&item.byteLength>=0);
  assert.ok(!descriptors.has(item.path),'Duplicate binding '+item.path);descriptors.set(item.path,item);}
 const verified=[];for(const item of[...descriptors.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'))){const bytes=await exact(input,item.path,item.sha256);assert.equal(bytes.length,item.byteLength,'Byte length '+item.path);verified.push({item,bytes});}
 const reports=new Map(verified.filter(row=>row.item.path.endsWith('.json')).map(row=>[row.item.path,JSON.parse(row.bytes)]));
 const qa=reports.get('outputs/ap23m2-candidate-2026-10-28/QA-AP23M2.json');assert.ok(qa);assert.equal(qa.status,'passed');
 assert.equal(qa.results.length,109);assert.equal(qa.syntheticProbes,33);assert.equal(qa.missingCurrentFactRejections,560);assert.equal(qa.negativeCatalogMutations,23);
 const independent=reports.get('outputs/ap23m2-2026-10-28/independent-verification.json');assert.ok(independent);assert.equal(independent.status,'passed');
 assert.equal(independent.counts.originalReferences,109);assert.equal(independent.counts.independentProbes,1239);assert.equal(independent.counts.physicalCalendarProbes,22);assert.equal(independent.counts.mutationSensitivities,3);
 for(const descriptor of[independent.nodeComparison.evidence,...['guard','manifest','catalog','suite','inputVocabularySchema','neFreshnessGate'].map(key=>independent.binding[key])])assert.deepEqual(descriptors.get(descriptor.path),descriptor,'Independent binding '+descriptor.path);
 const native=reports.get('outputs/ap23m2-2026-10-28/native-regression.json');assert.ok(native);assert.equal(native.status,'native-format16-baseline-preserved');
 assert.equal(native.calculatedCases,196);assert.equal(native.unsupportedReaderRejections,12);assert.equal(native.newNEVDVSCalculations,0);
 for(const row of native.results){assert.equal(row.acceptedResultEqual,true);assert.equal(row.native.referenceOnly,true);assert.equal(row.native.calendarExportAllowed,false);}
 for(const report of[qa,independent,native])for(const flag of['sourceReleaseApproved','calendarExportEnabled'])assert.equal(report[flag],false,flag);
 const manifest=reports.get(proof.manifest.path);assert.ok(manifest);assert.equal(manifest.formatVersion,'17.0.0');assert.equal(manifest.releaseStatus,'candidate');
 const base=dirname(proof.manifest.path);for(const descriptor of manifest.artifacts){const bound=descriptors.get(base+'/'+descriptor.path);assert.ok(bound,'Unbound candidate artifact');assert.equal(descriptor.sha256,bound.sha256);assert.equal(descriptor.byteLength,bound.byteLength);}
 const gate=reports.get('outputs/ap23m2-2026-10-28/ne-fassungsgate.json');assert.equal(gate.sources.length,9);for(const row of gate.sources){const bound=descriptors.get(gate.sourceBase+'/'+row.file);assert.ok(bound);assert.equal(bound.sha256,row.sha256);assert.equal(bound.byteLength,row.bytes);}
 for(const step of proof.steps){assert.equal(step.exitCode,0);const bound=descriptors.get(step.path);assert.ok(bound);assert.equal(bound.sha256,step.sha256);assert.equal(bound.byteLength,step.byteLength);}
 const testPath=proof.steps.find(row=>row.id==='governance-tests').path,testText=verified.find(row=>row.item.path===testPath).bytes.toString();
 for(const[key,value]of Object.entries({tests:476,pass:476,fail:0,cancelled:0,skipped:0,todo:0}))assert.match(testText,new RegExp('^# '+key+' '+value+'$','m'));
 if(!complete){if(config.requireGitHead)assert.equal(await readHead(root),proof.head,'Git HEAD changed');if(config.guard){const guard=JSON.parse(await exact(root,config.guard.path,config.guard.sha256));assert.equal(Object.keys(guard.files).length,config.guard.count);for(const[path,hash]of Object.entries(guard.files))await exact(root,path,hash);}}
 const receipt={...config.acceptance,proof:{path:config.proofPath,sha256:config.proofSha256},originalBindingCount:180,originalPaths:245,originalNewPaths:49,
  originalReferenceCases:109,originalGovernanceTests:476,protectedInputsCheckedWithoutRecopy:config.guard?.count??0,artifacts:verified.map(row=>row.item)},bytes=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
 if(complete){assert.deepEqual(await exact(target,'receipt.json'),bytes,'Receipt changed');const current=await inventory(target),expectedFiles=[...descriptors.keys(),'receipt.json'].sort(),expectedDirectories=new Set();
  for(const file of expectedFiles){let parent=dirname(file);while(parent!=='.'){expectedDirectories.add(parent);parent=dirname(parent);}}
  assert.deepEqual(current.files,expectedFiles,'Unexpected archive files');assert.deepEqual(current.directories,[...expectedDirectories].sort(),'Unexpected archive directories');
 }else if(write){await mkdir(dirname(target),{recursive:true});await mkdir(target);for(const{item,bytes:raw}of verified){await checkedPath(target,item.path,{missing:true});await mkdir(dirname(resolve(target,item.path)),{recursive:true});await checkedPath(target,item.path,{missing:true});await writeFile(resolve(target,item.path),raw,{flag:'wx'});await exact(target,item.path,item.sha256);}await writeFile(resolve(target,'receipt.json'),bytes,{flag:'wx'});}
 return{verified:true,target:config.target,mode:complete?'archive-reverified':write?'archive-created':'source-preflight-only',files:verified.length,payloadBytes:verified.reduce((sum,row)=>sum+row.bytes.length,0),protectedInputsNotRecopied:config.guard?.count??0,receiptSha256:sha256(bytes),receiptByteLength:bytes.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.ok(process.argv.slice(2).every(arg=>['--write','--check'].includes(arg)));assert.ok(!(process.argv.includes('--write')&&process.argv.includes('--check')));console.log(JSON.stringify(await archiveAcceptance({write:process.argv.includes('--write')}),null,2));}
