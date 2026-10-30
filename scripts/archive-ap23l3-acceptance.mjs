// SPDX-License-Identifier: AGPL-3.0-only
// Human L3 acceptance is a separate autonomous receipt. Never relabel its proof.
import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {lstat,mkdir,open,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const out='outputs/ap23l3-2026-10-27';
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export const archiveConfig=Object.freeze({
 target:'outputs/ap23l3-abnahme-2026-10-27',proofPath:out+'/local-completion.json',
 proofSha256:'7d69d82b8edd262a383647f84080e576259cf38c6751a40bc1d9b69a38850b49',bindingCount:1426,
 head:'70ce67425e046a7a38a4fbe66acbd93c75ca5983',requireGitHead:true,
 guard:{path:out+'/protected-inputs.json',sha256:'365a023fed55f849a83d44ebd2c4899c0e436bb77abbe2a40d4c4bd5d2912375',count:9130},
 paths:{qa:out+'/QA-AP23L3.json',spfx:out+'/spfx-build.json',packaged:out+'/actual-package.json',web:out+'/web-build.json',
  browser:out+'/browser-verification.json',exported:out+'/calendar-export-verification.json',native:out+'/native-reference-verification.json',
  independent:out+'/independent-verification.json',inherited:out+'/inherited-reference-verification.json',bundle:out+'/bundle-integrity.json'},
 qaCounts:{'product-regression':3588,'host-lifecycle':80,'actual-web-bundle':9,governance:125},
 spfxCounts:[288,170],packageTests:10,sourceTestFiles:24,historicalTestFiles:31,copiedInputs:321,browserCases:3,
 acceptance:{kind:'acceptedAP23L3Snapshot',acceptedBy:'David Steimer',acceptedOn:'2026-10-27',
  userStatement:'AP23L3 ist fachlich-technisch abgenommen. Bitte schlage die nächste Kantonstranche vor und bereite den nächsten fachlichen Schritt vor.',
  professionalTechnicalAcceptance:true,sourceReleaseApproved:false,calendarExportEnabled:false,deployable:false,deployed:false,
  sourcePublished:false,operatingPermission:false,commitPermission:false,sourcePushPermission:false,nextProfessionalStepStarted:false,
  additionalRiskDecision:false,acceptedCantons:23,operationalCantons:6,localOnlyAcceptedCantons:17,remainingCantons:['NE','VD','VS'],
  documentedLintReservation:{totalWarnings:112,newV9Format16Warnings:13,existingOrCommonWarnings:99,
   newWarningBreakdown:{unusedVariables:6,explicitReturnTypes:3,explicitAny:4},additionalHumanRiskDecision:false},
  composition:'Exactly the 1426 final L3 bindings and original completion proof. Bound prior archive metadata is preserved, but prior archives and unbound protected inputs are not recursively recopied.',
  boundary:'Human L3 acceptance only. The next canton tranche may be proposed and its professional scope prepared, not started or accepted. No source release, commit, push, upload, installation, mirror change or E/Q/P change.'}
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
const receiptFalse=['sourceReleaseApproved','calendarExportEnabled','deployable','deployed','sourcePublished','operatingPermission','commitPermission','sourcePushPermission','nextProfessionalStepStarted','additionalRiskDecision'];
export async function archiveAcceptance({root=process.cwd(),write=false,config=archiveConfig,
 readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
 root=resolve(root);safeRelative(config.target);await checkedPath(root,config.target,true);
 for(const key of receiptFalse)assert.equal(config.acceptance[key],false,'Acceptance cannot raise '+key);assert.equal(config.acceptance.professionalTechnicalAcceptance,true);
 assert.deepEqual(Object.keys(config.acceptance).sort(),Object.keys(archiveConfig.acceptance).sort(),'Closed human receipt');
 for(const key of['kind','acceptedBy','acceptedOn','acceptedCantons','operationalCantons','localOnlyAcceptedCantons','remainingCantons'])assert.deepEqual(config.acceptance[key],archiveConfig.acceptance[key],'Exact accepted scope '+key);
 assert.deepEqual(config.acceptance.documentedLintReservation,archiveConfig.acceptance.documentedLintReservation,'Unchanged documented lint reservation');
 assert.equal(config.acceptance.userStatement,archiveConfig.acceptance.userStatement,'Exact human statement');
 const target=resolve(root,config.target),complete=await exists(target);if(complete)assert.ok(await exists(resolve(target,'receipt.json')),'Partial archive without receipt');
 const input=complete?target:root,proofBytes=await exact(input,{path:config.proofPath,sha256:config.proofSha256}),proof=JSON.parse(proofBytes);
 assert.equal(proof.workPackage,'AP23L3');assert.equal(proof.status,'local-technical-verification-passed-awaiting-human-acceptance');
 assert.equal(proof.l2TechnicallyAccepted,true);assert.equal(proof.operatingPackagePreserved,true);assert.equal(proof.head,config.head);
 assert.deepEqual(proof.contractDecision,{id:'DEC-2026-041',status:'approved',on:'2026-10-27'});
 assert.deepEqual(proof.formats,{manifest:'16.0.0',minimumConsumer:'16.0.0',administrativeCatalog:'9.0.0'});
 for(const key of proofFalse)assert.equal(proof[key],false,'Historical boundary '+key);
 assert.equal(proof.bindings.length,config.bindingCount,'Original binding inventory');assert.equal(proof.protectedFiles,config.guard.count);
 for(const[key,value]of Object.entries({administrativePaths:196,preservedAdministrativePaths:165,newAdministrativePaths:31,calendars:35,totalHolidayRules:499,
  preservedSocialRules:44,preservedBernSocialBindings:50,rawUnchangedFromL2:42,proceduralSupplementDates:2}))assert.equal(proof.counts[key],value,key);
 assert.deepEqual(proof.qaCounts,config.qaCounts);assert.deepEqual(proof.hostCounts,{sourceTestFiles:config.sourceTestFiles,historicalTestFiles:config.historicalTestFiles,
  copiedSourceInputs:config.copiedInputs,sourceTests:config.spfxCounts[0],historicalPackageTests:config.spfxCounts[1],actualPackageTests:config.packageTests});
 assert.deepEqual(proof.nativeCounts,{consumerReferences:83,syntheticCases:20,oldNativeReferences:165,
  consumerOutcomes:{datedResearchValue:54,qualificationBoundaryProposed:22,researchWindowBoundary:5,unresolvedBoundaryProposed:2}});
 assert.equal(proof.inheritedReferenceCases,673);assert.equal(proof.independentCounts.independentProbes,697);
 assert.equal(proof.independentCounts.physicalCalendarProbes,12);assert.equal(proof.independentCounts.mutationSensitivities,3);
 const descriptors=new Map(),buffers=new Map();for(const item of[{path:config.proofPath,sha256:config.proofSha256,byteLength:proofBytes.length},...proof.bindings]){
  safeRelative(item.path);assert.deepEqual(Object.keys(item).sort(),['byteLength','path','sha256']);assert.notEqual(item.path,'receipt.json');assert.ok(!item.path.startsWith(config.target+'/'),'Archive cannot contain itself');
  assert.match(item.sha256,/^[a-f0-9]{64}$/u);assert.ok(Number.isSafeInteger(item.byteLength)&&item.byteLength>=0);
  assert.ok(!descriptors.has(item.path),'Duplicate binding '+item.path);descriptors.set(item.path,item);buffers.set(item.path,await exact(input,item));}
 function bound(item){const descriptor=descriptors.get(item.path);assert.ok(descriptor,'Unbound input '+item.path);assert.deepEqual(descriptor,item,'Input descriptor '+item.path);return buffers.get(item.path);}
 function json(path){assert.ok(descriptors.has(path),'Unbound report '+path);return JSON.parse(buffers.get(path));}
 const qa=json(config.paths.qa);assert.equal(qa.status,'passed');assert.equal(qa.workPackage,'AP23L3');assert.equal(qa.steps.length,16);assert.equal(qa.head,proof.head);
 const seen=new Set();for(const step of qa.steps){assert.equal(step.exitCode,0);const bytes=bound({path:step.log,byteLength:step.byteLength,sha256:step.sha256});
  if(Object.hasOwn(config.qaCounts,step.id)){assert.ok(!seen.has(step.id));seen.add(step.id);passed(step.counts,config.qaCounts[step.id]);passed(tapCounts(bytes),config.qaCounts[step.id]);}}
 assert.deepEqual([...seen].sort(),Object.keys(config.qaCounts).sort());
 const bundle=json(config.paths.bundle),manifest=json(proof.candidateManifest.path);assert.deepEqual(bundle.counts,proof.counts);assert.deepEqual(bundle.manifest,proof.candidateManifest);
 bound(proof.candidateManifest);bundle.artifacts.forEach(bound);assert.equal(bundle.referenceOnly,true);assert.equal(bundle.sourceReleaseApproved,false);
 assert.equal(manifest.releaseStatus,'candidate');assert.equal(manifest.formatVersion,'16.0.0');assert.equal(manifest.compatibility.minimumConsumerFormatVersion,'16.0.0');assert.equal(manifest.sourceSummary.legalBasisReviewStatus,'pending');
 const web=json(config.paths.web),spfx=json(config.paths.spfx),packaged=json(config.paths.packaged);for(const report of[web,spfx,packaged])assert.equal(report.status,'passed');
 for(const report of[web,spfx]){assert.equal(report.localOnly,true);assert.equal(report.deployable,false);assert.deepEqual(report.protectedBefore,report.protectedAfter);}
 assert.equal(spfx.operatingPackagePreserved,true);assert.equal(spfx.steps.length,7);assert.deepEqual(spfx.testPackage,proof.actualPackage);bound(spfx.testPackage);
 assert.deepEqual(json(spfx.stage+'/verification.json'),spfx);assert.deepEqual(packaged.package,spfx.testPackage);assert.equal(packaged.typecheckExitCode,0);assert.equal(packaged.localOnly,true);assert.equal(packaged.syntheticApprovalsOnly,true);
 passed(packaged.counts,config.packageTests);passed(tapCounts(bound(descriptors.get(packaged.log))),config.packageTests);assert.equal(sha256(buffers.get(packaged.log)),packaged.sha256);
 for(const step of spfx.steps){assert.equal(step.exitCode,0);bound({path:step.log,byteLength:step.byteLength,sha256:step.sha256});}
 for(const[index,count]of[[2,config.spfxCounts[0]],[6,config.spfxCounts[1]]])passed(tapCounts(buffers.get(spfx.steps[index].log)),count);
 assert.equal(spfx.steps[2].args.filter(arg=>arg.endsWith('.test.ts')).length,config.sourceTestFiles);assert.equal(spfx.steps[6].args.filter(arg=>arg.endsWith('.test.cjs')).length,config.historicalTestFiles);
 web.artifacts.forEach(bound);
 const native=json(config.paths.native),independent=json(config.paths.independent),inherited=json(config.paths.inherited),browser=json(config.paths.browser),exported=json(config.paths.exported);
 assert.equal(native.status,'passed-native-reference-only');assert.equal(native.consumerCases,83);assert.equal(native.results.length,83);assert.equal(native.syntheticCases,20);assert.equal(native.syntheticResults.length,20);assert.equal(native.oldNativeCases,165);assert.equal(native.oldResults.length,165);native.evidence.forEach(bound);
 assert.equal(independent.status,'passed');assert.deepEqual(independent.counts,proof.independentCounts);assert.equal(independent.results.length,83);assert.equal(independent.independentProbeResults.length,697);
 assert.equal(independent.physicalCalendarProbeResults.length,12);assert.equal(independent.mutationSensitivity.length,3);
 assert.equal(independent.nodeComparison.matchedFixtures,83);assert.equal(independent.nodeComparison.syntheticProbeComparisons.length,20);
 assert.equal(independent.nodeComparison.oldNativeMathematicalComparisons,165);assert.equal(independent.nodeComparison.inheritedReferenceComparisons,673);
 for(const item of[independent.binding.guard,independent.binding.manifest,independent.binding.catalog,independent.binding.suite,independent.binding.inputVocabularySchema,
  independent.nodeComparison.evidence,independent.nodeComparison.inheritedEvidence,independent.nodeComparison.acceptedInheritedEvidence,...independent.binding.sourceEvidence])bound(item);
 for(const key of['importsProductCode','importsNodeCode','importsResearchOracle','usesResearchCalendarOrPathModel','annotationRemoval','implicitCaseFacts'])assert.equal(independent[key],false);
 assert.equal(inherited.status,'passed-inherited-reference-cases');assert.equal(inherited.referenceCases,673);assert.equal(inherited.results.length,673);inherited.evidence.forEach(bound);
 assert.equal(browser.status,'passed');assert.equal(browser.realDeviceOrM365Test,false);assert.equal(browser.cases.length,config.browserCases);browser.evidence.forEach(bound);
 assert.equal(exported.status,'passed');assert.equal(exported.qualifiedCases,54);assert.equal(exported.qualifiedPaths,31);assert.equal(exported.syntheticInMemoryArtifacts,108);assert.equal(exported.blockedCasesDenied,29);
 assert.equal(exported.actualIcsFilesSaved,0);assert.equal(exported.outlookImports,0);assert.equal(exported.humanReleaseApproval,false);exported.bindings.forEach(bound);
 for(const report of[native,independent,inherited,browser,exported])assert.equal(report.sourceReleaseApproved,false);
 for(const report of[native,independent,inherited])assert.equal(report.calendarExportEnabled,false);
 const guard=json(config.guard.path);assert.equal(sha256(buffers.get(config.guard.path)),config.guard.sha256);assert.equal(Object.keys(guard.files).length,config.guard.count);
 if(!complete){if(config.requireGitHead)assert.equal(await readHead(root),proof.head,'Git HEAD changed');for(const[path,hash]of Object.entries(guard.files))await exact(root,{path,sha256:hash});}
 const verified=[...descriptors.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'));
 const receipt={...config.acceptance,proof:{path:config.proofPath,byteLength:proofBytes.length,sha256:config.proofSha256},
  originalBindingCount:proof.bindings.length,originalFormats:proof.formats,originalCounts:proof.counts,originalQaCounts:proof.qaCounts,originalHostCounts:proof.hostCounts,
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
