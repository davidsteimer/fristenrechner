// SPDX-License-Identifier: AGPL-3.0-only
// Human K3 acceptance is a separate receipt. Never relabel the technical proof.
import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {lstat,mkdir,open,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const out='outputs/ap23k3-2026-10-27';
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export const archiveConfig=Object.freeze({
 target:'outputs/ap23k3-abnahme-2026-10-27',proofPath:out+'/local-completion.json',
 proofSha256:'39832ef824ac573dbcbeffe2aed5f965781903513475c1c381e041dc7de2b458',bindingCount:1323,
 head:'70ce67425e046a7a38a4fbe66acbd93c75ca5983',requireGitHead:true,
 guard:{path:out+'/protected-inputs.json',sha256:'23f5406ec3218aa30d0fb1ac95c0aff507106523f1c7645125020bf127738ce1',count:6696},
 paths:{qa:out+'/QA-AP23K3.json',spfx:out+'/spfx-build.json',packaged:out+'/actual-package.json',web:out+'/web-build.json',
  browser:out+'/browser-verification.json',exported:out+'/export-verification.json',native:out+'/native-reference-verification.json',
  independent:out+'/independent-verification.json',inherited:out+'/inherited-reference-verification.json',
  negative:out+'/trace-text-negative-control.json',bundle:out+'/bundle-integrity.json'},
 qaCounts:{'product-regression':3379,'host-lifecycle':70,'actual-web-bundle':32,governance:90},
 spfxCounts:[283,170],packageTests:13,sourceTestFiles:23,historicalTestFiles:31,copiedInputs:304,screenshots:7,browserCases:8,
 acceptance:{kind:'acceptedAP23K3Snapshot',acceptedBy:'David Steimer',acceptedOn:'2026-10-27',
  userStatement:'AP23K3 ist fachlich-technisch abgenommen. Bitte schlage die nächste Kantonstranche vor und bereite den nächsten fachlichen Schritt vor.',
  professionalTechnicalAcceptance:true,sourceReleaseApproved:false,calendarExportEnabled:false,deployable:false,deployed:false,
  sourcePublished:false,operatingPermission:false,commitPermission:false,sourcePushPermission:false,nextProfessionalStepStarted:false,
  acceptedCantons:21,operationalCantons:6,localOnlyAcceptedCantons:15,
  remainingCantons:['AI','NE','SZ','VD','VS'],
  composition:'Exactly the 1323 final K3 bindings and original completion proof. Prior archives and protected inputs are retained as bound metadata, not recursively recopied.',
  boundary:'Human K3 acceptance only. The next canton tranche may be proposed and its professional scope prepared, not started or accepted. No source release, commit, push, upload, installation, mirror change or E/Q/P change.'}
});
export function safeRelative(path){assert.equal(typeof path,'string');assert.ok(path.length>0&&!/[\\\0\r\n]/u.test(path),'Unsafe relative path');
 assert.ok(!path.startsWith('/')&&!/^[A-Za-z]:/u.test(path),'Unsafe relative path');
 assert.ok(path.split('/').every(part=>part!==''&&part!=='.'&&part!=='..'),'Unsafe relative path');return path;}
async function checkedPath(root,path,missing=false){assert.ok((await lstat(root)).isDirectory());assert.equal((await lstat(root)).isSymbolicLink(),false);
 let current=root;const parts=safeRelative(path).split('/');for(const[index,part]of parts.entries()){
  current=resolve(current,part);let stat;try{stat=await lstat(current);}catch(error){if(missing&&error.code==='ENOENT')return;throw error;}
  assert.equal(stat.isSymbolicLink(),false,'Symlink not allowed '+path);assert.ok(index===parts.length-1||stat.isDirectory(),'Not a directory '+path);}}
export async function exact(root,item){await checkedPath(root,item.path);const handle=await open(resolve(root,item.path),constants.O_RDONLY|constants.O_NOFOLLOW);
 try{assert.ok((await handle.stat()).isFile(),'Not a file '+item.path);const bytes=await handle.readFile();
  assert.equal(sha256(bytes),item.sha256,'SHA-256 mismatch '+item.path);if(item.byteLength!==undefined)assert.equal(bytes.length,item.byteLength,'Byte length '+item.path);return bytes;
 }finally{await handle.close();}}
async function exists(path){try{await lstat(path);return true;}catch(error){if(error.code==='ENOENT')return false;throw error;}}
async function inventory(root,path=''){const files=[],directories=[];for(const item of await readdir(resolve(root,path),{withFileTypes:true})){
 const next=path?path+'/'+item.name:item.name;assert.equal(item.isSymbolicLink(),false,'Symlink in archive '+next);
 if(item.isDirectory()){directories.push(next);const nested=await inventory(root,next);files.push(...nested.files);directories.push(...nested.directories);}
 else{assert.ok(item.isFile(),'Not a regular archive file '+next);files.push(next);}}return{files:files.sort(),directories:directories.sort()};}
function tapCounts(bytes){return Object.fromEntries([...bytes.toString().matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));}
function passed(counts,expected){assert.equal(counts.tests,expected);assert.equal(counts.pass,expected);
 for(const key of['fail','cancelled','skipped','todo'])assert.equal(counts[key],0,key);}
const proofFalse=['professionalTechnicalAcceptance','sourceReleaseApproved','calendarExportEnabled','commitCreated','sourcePushPerformed','installationPerformed','regularIntermediateRelease','operatingChanges'];
const receiptFalse=['sourceReleaseApproved','calendarExportEnabled','deployable','deployed','sourcePublished','operatingPermission','commitPermission','sourcePushPermission','nextProfessionalStepStarted'];
export async function archiveAcceptance({root=process.cwd(),write=false,config=archiveConfig,
 readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
 root=resolve(root);safeRelative(config.target);await checkedPath(root,config.target,true);
 for(const key of receiptFalse)assert.equal(config.acceptance[key],false,'Acceptance cannot raise '+key);assert.equal(config.acceptance.professionalTechnicalAcceptance,true);
 const target=resolve(root,config.target),complete=await exists(target);if(complete)assert.ok(await exists(resolve(target,'receipt.json')),'Partial archive without receipt');
 const input=complete?target:root,proofBytes=await exact(input,{path:config.proofPath,sha256:config.proofSha256}),proof=JSON.parse(proofBytes);
 assert.equal(proof.workPackage,'AP23K3');assert.equal(proof.status,'local-technical-verification-passed-awaiting-human-acceptance');
 assert.equal(proof.k2TechnicallyAccepted,true);assert.equal(proof.operatingPackagePreserved,true);assert.equal(proof.head,config.head);
 assert.deepEqual(proof.contractDecision,{id:'DEC-2026-040',status:'approved',on:'2026-10-27'});
 assert.deepEqual(proof.formats,{manifest:'15.0.0',minimumConsumer:'15.0.0',administrativeCatalog:'8.0.0'});
 for(const key of proofFalse)assert.equal(proof[key],false,'Historical boundary '+key);
 assert.equal(proof.bindings.length,config.bindingCount,'Original binding inventory');assert.equal(proof.protectedFiles,config.guard.count);
 for(const[key,value]of Object.entries({administrativePaths:165,preservedAdministrativePaths:149,newAdministrativePaths:16,calendars:35,totalHolidayRules:499,
  preservedSocialRules:44,preservedBernSocialBindings:50,rawUnchangedFromJ3:42,annualOfficeClosureDays:13,uncertainClosureDays:1}))assert.equal(proof.counts[key],value,key);
 assert.deepEqual(proof.qaCounts,config.qaCounts);assert.equal(proof.spfxSourceTests,config.spfxCounts[0]);assert.equal(proof.historicalPackageTests,config.spfxCounts[1]);assert.equal(proof.actualPackageTests,config.packageTests);
 const descriptors=new Map(),buffers=new Map();for(const item of[{path:config.proofPath,sha256:config.proofSha256,byteLength:proofBytes.length},...proof.bindings]){
  safeRelative(item.path);assert.notEqual(item.path,'receipt.json');assert.ok(!item.path.startsWith(config.target+'/'),'Archive cannot contain itself');
  assert.match(item.sha256,/^[a-f0-9]{64}$/u);assert.ok(Number.isSafeInteger(item.byteLength)&&item.byteLength>=0);
  assert.ok(!descriptors.has(item.path),'Duplicate binding '+item.path);descriptors.set(item.path,item);buffers.set(item.path,await exact(input,item));}
 function bound(item){const descriptor=descriptors.get(item.path);assert.ok(descriptor,'Unbound input '+item.path);assert.deepEqual(descriptor,item,'Input descriptor '+item.path);return buffers.get(item.path);}
 function json(path){assert.ok(descriptors.has(path),'Unbound report '+path);return JSON.parse(buffers.get(path));}
 const qa=json(config.paths.qa);assert.equal(qa.status,'passed');assert.equal(qa.workPackage,'AP23K3');assert.equal(qa.steps.length,16);assert.equal(qa.head,proof.head);
 const seen=new Set();for(const step of qa.steps){assert.equal(step.exitCode,0);const bytes=bound({path:step.log,byteLength:step.byteLength,sha256:step.sha256});
  if(Object.hasOwn(config.qaCounts,step.id)){assert.ok(!seen.has(step.id));seen.add(step.id);passed(step.counts,config.qaCounts[step.id]);passed(tapCounts(bytes),config.qaCounts[step.id]);}}
 assert.deepEqual([...seen].sort(),Object.keys(config.qaCounts).sort());
 const bundle=json(config.paths.bundle),manifest=json(proof.candidateManifest.path);assert.deepEqual(bundle.counts,proof.counts);assert.deepEqual(bundle.manifest,proof.candidateManifest);
 bound(proof.candidateManifest);bundle.artifacts.forEach(bound);assert.equal(bundle.referenceOnly,true);assert.equal(bundle.sourceReleaseApproved,false);
 assert.equal(manifest.releaseStatus,'candidate');assert.equal(manifest.formatVersion,'15.0.0');assert.equal(manifest.compatibility.minimumConsumerFormatVersion,'15.0.0');assert.equal(manifest.sourceSummary.legalBasisReviewStatus,'pending');
 const web=json(config.paths.web),spfx=json(config.paths.spfx),packaged=json(config.paths.packaged);for(const report of[web,spfx,packaged])assert.equal(report.status,'passed');
 for(const report of[web,spfx]){assert.equal(report.localOnly,true);assert.equal(report.deployable,false);assert.deepEqual(report.protectedBefore,report.protectedAfter);}
 assert.equal(spfx.operatingPackagePreserved,true);assert.equal(spfx.steps.length,7);assert.deepEqual(spfx.testPackage,proof.actualPackage);bound(spfx.testPackage);
 assert.deepEqual(json(spfx.stage+'/verification.json'),spfx);assert.deepEqual(packaged.package,spfx.testPackage);assert.equal(packaged.typecheckExitCode,0);assert.equal(packaged.localOnly,true);assert.equal(packaged.syntheticApprovalsOnly,true);
 passed(packaged.counts,config.packageTests);passed(tapCounts(bound(descriptors.get(packaged.log))),config.packageTests);assert.equal(sha256(buffers.get(packaged.log)),packaged.sha256);
 for(const step of spfx.steps){assert.equal(step.exitCode,0);bound({path:step.log,byteLength:step.byteLength,sha256:step.sha256});}
 for(const[index,count]of[[2,config.spfxCounts[0]],[6,config.spfxCounts[1]]])passed(tapCounts(buffers.get(spfx.steps[index].log)),count);
 assert.equal(spfx.steps[2].args.filter(arg=>arg.endsWith('.test.ts')).length,config.sourceTestFiles);assert.equal(spfx.steps[6].args.filter(arg=>arg.endsWith('.test.cjs')).length,config.historicalTestFiles);
 web.artifacts.forEach(bound);
 const native=json(config.paths.native),independent=json(config.paths.independent),inherited=json(config.paths.inherited),browser=json(config.paths.browser),exported=json(config.paths.exported),negative=json(config.paths.negative);
 assert.equal(native.status,'passed-native-reference-only');assert.equal(native.consumerCases,65);assert.equal(native.syntheticCases,46);assert.equal(native.oldNativeCases,149);native.evidence.forEach(bound);
 assert.equal(independent.status,'passedIndependentNativeComparison');assert.deepEqual(independent.discrepancies,[]);assert.equal(independent.referenceCases,65);assert.equal(independent.syntheticCases,46);independent.inputs.forEach(bound);
 assert.equal(inherited.status,'passed-inherited-673-reference-cases');assert.equal(inherited.referenceCases,673);inherited.evidence.forEach(bound);
 assert.equal(browser.status,'passed');assert.equal(browser.realDeviceOrM365Test,false);assert.equal(browser.screenshots,config.screenshots);assert.equal(browser.cases.length,config.browserCases);browser.evidence.forEach(bound);
 assert.equal(exported.status,'passed');assert.equal(exported.qualifiedCases,50);assert.equal(exported.syntheticInMemoryArtifacts,100);assert.equal(exported.actualIcsFilesSaved,0);assert.equal(exported.outlookImports,0);assert.equal(exported.humanReleaseApproval,false);exported.bindings.forEach(bound);
 for(const report of[native,independent,inherited,browser,exported])assert.equal(report.sourceReleaseApproved,false);
 assert.equal(negative.status,'old-package-rejected-as-expected');assert.equal(negative.observedExitCode,1);assert.equal(negative.failure.expectedOccurrencesOfCorrectedTraceText,2);assert.equal(negative.failure.actualOccurrencesInOldBundle,0);bound(negative.oldPackage);bound(negative.test);
 const guard=json(config.guard.path);assert.equal(sha256(buffers.get(config.guard.path)),config.guard.sha256);assert.equal(Object.keys(guard.files).length,config.guard.count);
 if(!complete){if(config.requireGitHead)assert.equal(await readHead(root),proof.head,'Git HEAD changed');for(const[path,hash]of Object.entries(guard.files))await exact(root,{path,sha256:hash});}
 const verified=[...descriptors.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'));
 const receipt={...config.acceptance,proof:{path:config.proofPath,byteLength:proofBytes.length,sha256:config.proofSha256},
  originalBindingCount:proof.bindings.length,originalFormats:proof.formats,originalCounts:proof.counts,originalQaCounts:proof.qaCounts,
  originalProofAndPendingFlagsUnchanged:true,protectedInputsCheckedWithoutRecopy:config.guard.count,artifacts:verified};
 const receiptBytes=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
 if(complete){assert.deepEqual(await exact(target,{path:'receipt.json',sha256:sha256(receiptBytes)}),receiptBytes,'Receipt changed');
  const current=await inventory(target),files=[...descriptors.keys(),'receipt.json'].sort(),directories=new Set();for(const file of files){let directory=dirname(file);while(directory!=='.'){directories.add(directory);directory=dirname(directory);}}
  assert.deepEqual(current.files,files,'Unexpected archive files');assert.deepEqual(current.directories,[...directories].sort(),'Unexpected archive directories');
 }else if(write){await checkedPath(root,config.target,true);await mkdir(dirname(target),{recursive:true});await mkdir(target);
  for(const item of verified){await checkedPath(target,item.path,true);await mkdir(dirname(resolve(target,item.path)),{recursive:true});await checkedPath(target,item.path,true);
   await writeFile(resolve(target,item.path),buffers.get(item.path),{flag:'wx'});await exact(target,item);}
  await writeFile(resolve(target,'receipt.json'),receiptBytes,{flag:'wx'});}
 return{verified:true,mode:complete?'archive-reverified':write?'archive-created':'source-preflight-only',target:config.target,
  files:verified.length,payloadBytes:verified.reduce((sum,item)=>sum+item.byteLength,0),receiptSha256:sha256(receiptBytes),receiptByteLength:receiptBytes.length,
  protectedInputsNotRecopied:config.guard.count,professionalTechnicalAcceptance:true,sourceReleaseApproved:false,operatingChanges:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.ok(process.argv.slice(2).every(arg=>['--write','--check'].includes(arg)));assert.ok(!(process.argv.includes('--write')&&process.argv.includes('--check')));
 console.log(JSON.stringify(await archiveAcceptance({write:process.argv.includes('--write')}),null,2));}
