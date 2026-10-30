// SPDX-License-Identifier: AGPL-3.0-only
// Human M3 acceptance is a separate autonomous receipt. Never relabel its proof.
import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {lstat,mkdir,open,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const out='outputs/ap23m3-2026-10-28';
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export const archiveConfig=Object.freeze({
 target:'outputs/ap23m3-abnahme-2026-10-28',proofPath:out+'/local-completion.json',
 proofSha256:'6a86fb73400c1144cbed78035f648187843f313562d280e245fb41a3946a7a01',bindingCount:1537,
 head:'70ce67425e046a7a38a4fbe66acbd93c75ca5983',requireGitHead:true,
 guard:{path:out+'/protected-inputs.json',sha256:'999058873565d1395f04767d040ca218ec8da04303b899f23d7f80cbcd7227f9',count:11540},
 finalGovernanceTests:141,
 paths:{finalGovernance:out+'/governance-final.json',qa:out+'/QA-AP23M3.json',spfx:out+'/spfx-build.json',packaged:out+'/actual-package.json',web:out+'/web-build.json',
  browser:out+'/browser-verification.json',exported:out+'/calendar-export-verification.json',native:out+'/native-reference-verification.json',
  independent:out+'/independent-verification.json',inherited:out+'/inherited-reference-verification.json',bundle:out+'/bundle-integrity.json',postAcceptanceFinding:out+'/post-acceptance-social-ui-finding.json'},
 qaCounts:{"product-regression":3876,"host-lifecycle":90,"actual-web-bundle":9,"governance":140},
 spfxCounts:[293,170],packageTests:8,sourceTestFiles:25,historicalTestFiles:31,copiedInputs:340,browserCases:4,
 acceptance:{kind:'acceptedAP23M3Snapshot',acceptedBy:'David Steimer',acceptedOn:'2026-10-28',
  userStatement:'AP23M3 ist fachlich-technisch abgenommen. Damit sind alle Kantone im vereinbarten Umfang lokal integriert. Bitte bereite die nächsten Schritte für den gebündelten Release vor.',
  professionalTechnicalAcceptance:true,sourceReleaseApproved:false,calendarExportEnabled:false,deployable:false,deployed:false,
  sourcePublished:false,operatingPermission:false,commitPermission:false,sourcePushPermission:false,nextProfessionalStepStarted:false,
  additionalRiskDecision:false,acceptedCantons:26,operationalCantons:6,localOnlyAcceptedCantons:20,remainingCantons:[],bundledReleasePreparationRequested:true,
  postAcceptanceFinding:{kind:'format17SocialUiUnavailable',discoveredAfterUserAcceptance:true,humanAcceptanceOfFinding:false,fixAuthorized:false,additionalRiskDecision:false,blocksBundledRelease:true},
  documentedLintReservation:{totalWarnings:136,newV10Format17Warnings:24,existingOrCommonWarnings:112,
   newWarningBreakdown:{unusedVariables:17,explicitReturnTypes:3,explicitAny:4},additionalHumanRiskDecision:false},
  composition:'Exactly the 1537 final M3 bindings and original completion proof. Bound prior archive metadata is preserved, but prior archives and unbound protected inputs are not recursively recopied.',
  boundary:'Human M3 acceptance of the agreed canton integration and preparation of the bundled release only. A social UI blocker was discovered afterwards and is not treated as human-accepted or authorized for correction. No release version is decided here. No source release, commit, push, upload, installation, mirror change or E/Q/P change.'}
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
 for(const key of['kind','acceptedBy','acceptedOn','acceptedCantons','operationalCantons','localOnlyAcceptedCantons','remainingCantons','bundledReleasePreparationRequested'])assert.deepEqual(config.acceptance[key],archiveConfig.acceptance[key],'Exact accepted scope '+key);
 assert.deepEqual(config.acceptance.documentedLintReservation,archiveConfig.acceptance.documentedLintReservation,'Unchanged documented lint reservation');
 assert.deepEqual(config.acceptance.postAcceptanceFinding,archiveConfig.acceptance.postAcceptanceFinding,'No inferred acceptance or fix authority for late social UI finding');
 assert.equal(config.acceptance.userStatement,archiveConfig.acceptance.userStatement,'Exact human statement');
 const target=resolve(root,config.target),complete=await exists(target);if(complete)assert.ok(await exists(resolve(target,'receipt.json')),'Partial archive without receipt');
 const input=complete?target:root,proofBytes=await exact(input,{path:config.proofPath,sha256:config.proofSha256}),proof=JSON.parse(proofBytes);
 assert.equal(proof.workPackage,'AP23M3');assert.equal(proof.status,'local-scoped-verification-passed-with-release-blocker');
 assert.equal(proof.m2TechnicallyAccepted,true);assert.equal(proof.operatingPackagePreserved,true);assert.equal(proof.head,config.head);
 assert.deepEqual(proof.contractDecision,{id:'DEC-2026-042',status:'approved',on:'2026-10-28'});
 assert.deepEqual(proof.formats,{manifest:'17.0.0',minimumConsumer:'17.0.0',administrativeCatalog:'10.0.0'});
 for(const key of proofFalse)assert.equal(proof[key],false,'Historical boundary '+key);
 assert.equal(proof.bindings.length,config.bindingCount,'Original binding inventory');assert.equal(proof.protectedFiles,config.guard.count);
 for(const[key,value]of Object.entries({administrativePaths:245,preservedAdministrativePaths:196,newAdministrativePaths:49,calendars:35,totalHolidayRules:499,
  preservedSocialRules:44,preservedBernSocialBindings:50,rawUnchangedFromM2:42,proceduralSupplementDates:2}))assert.equal(proof.counts[key],value,key);
 assert.deepEqual(proof.qaCounts,config.qaCounts);assert.deepEqual(proof.hostCounts,{sourceTestFiles:config.sourceTestFiles,historicalTestFiles:config.historicalTestFiles,
  copiedSourceInputs:config.copiedInputs,sourceTests:config.spfxCounts[0],historicalPackageTests:config.spfxCounts[1],actualPackageTests:config.packageTests});
 assert.deepEqual(proof.nativeCounts,{consumerReferences:109,syntheticCases:33,oldNativeReferences:196,
  consumerOutcomes:{datedResearchValue:73,qualificationBoundaryProposed:27,researchWindowBoundary:6,unresolvedBoundaryProposed:3}});
 assert.deepEqual(proof.releaseReadiness,{ready:false,blockingFinding:'R10-H01: social UI is not enabled for Format 17',fixImplemented:false,humanAcceptanceOfFinding:false});
 assert.equal(proof.inheritedReferenceCases,776);assert.equal(proof.independentCounts.independentProbes,1239);
 assert.equal(proof.independentCounts.physicalCalendarProbes,22);assert.equal(proof.independentCounts.mutationSensitivities,3);
 const descriptors=new Map(),buffers=new Map();for(const item of[{path:config.proofPath,sha256:config.proofSha256,byteLength:proofBytes.length},...proof.bindings]){
  safeRelative(item.path);assert.deepEqual(Object.keys(item).sort(),['byteLength','path','sha256']);assert.notEqual(item.path,'receipt.json');assert.ok(!item.path.startsWith(config.target+'/'),'Archive cannot contain itself');
  assert.match(item.sha256,/^[a-f0-9]{64}$/u);assert.ok(Number.isSafeInteger(item.byteLength)&&item.byteLength>=0);
  assert.ok(!descriptors.has(item.path),'Duplicate binding '+item.path);descriptors.set(item.path,item);buffers.set(item.path,await exact(input,item));}
 function bound(item){const descriptor=descriptors.get(item.path);assert.ok(descriptor,'Unbound input '+item.path);assert.deepEqual(descriptor,item,'Input descriptor '+item.path);return buffers.get(item.path);}
 function json(path){assert.ok(descriptors.has(path),'Unbound report '+path);return JSON.parse(buffers.get(path));}
 const qa=json(config.paths.qa);assert.equal(qa.status,'passed');assert.equal(qa.workPackage,'AP23M3');assert.equal(qa.steps.length,16);assert.equal(qa.head,proof.head);
 const seen=new Set();for(const step of qa.steps){assert.equal(step.exitCode,0);const bytes=bound({path:step.log,byteLength:step.byteLength,sha256:step.sha256});
  if(Object.hasOwn(config.qaCounts,step.id)){assert.ok(!seen.has(step.id));seen.add(step.id);passed(step.counts,config.qaCounts[step.id]);passed(tapCounts(bytes),config.qaCounts[step.id]);}}
 assert.deepEqual([...seen].sort(),Object.keys(config.qaCounts).sort());
 const finalGovernance=json(config.paths.finalGovernance);assert.equal(finalGovernance.status,'passed');assert.equal(finalGovernance.exitCode,0);passed(proof.finalGovernanceCounts,config.finalGovernanceTests);passed(finalGovernance.counts,config.finalGovernanceTests);passed(tapCounts(bound(finalGovernance.log)),config.finalGovernanceTests);finalGovernance.inputs.forEach(bound);
 const bundle=json(config.paths.bundle),manifest=json(proof.candidateManifest.path);assert.deepEqual(bundle.counts,proof.counts);assert.deepEqual(bundle.manifest,proof.candidateManifest);
 bound(proof.candidateManifest);bundle.artifacts.forEach(bound);assert.equal(bundle.referenceOnly,true);assert.equal(bundle.sourceReleaseApproved,false);
 assert.equal(manifest.releaseStatus,'candidate');assert.equal(manifest.formatVersion,'17.0.0');assert.equal(manifest.compatibility.minimumConsumerFormatVersion,'17.0.0');assert.equal(manifest.sourceSummary.legalBasisReviewStatus,'pending');
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
 assert.equal(native.status,'passed-native-reference-only');assert.equal(native.consumerCases,109);assert.equal(native.results.length,109);assert.equal(native.syntheticCases,33);assert.equal(native.syntheticResults.length,33);assert.equal(native.oldNativeCases,196);assert.equal(native.oldResults.length,196);native.evidence.forEach(bound);
 assert.equal(independent.status,'passed');assert.deepEqual(independent.counts,proof.independentCounts);assert.equal(independent.results.length,109);assert.equal(independent.independentProbeResults.length,1239);
 assert.equal(independent.physicalCalendarProbeResults.length,22);assert.equal(independent.mutationSensitivity.length,3);
 assert.equal(independent.nativeComparison.matchedFixtures,109);assert.equal(independent.nativeComparison.syntheticProbeComparisons.length,33);
 assert.equal(independent.nativeComparison.oldNativeMathematicalComparisons,196);assert.equal(independent.nativeComparison.inheritedReferenceComparisons,776);
 for(const item of[independent.binding.guard,independent.binding.manifest,independent.binding.catalog,independent.binding.suite,independent.binding.inputVocabularySchema,
  independent.nativeComparison.evidence,independent.nativeComparison.inheritedReferenceEvidence,independent.nativeComparison.oldNativeAcceptedEvidence,...independent.nativeComparison.inheritedAcceptedEvidence,...independent.binding.sourceEvidence])bound(item);
 for(const key of['importsProductCode','importsNodeCode','importsResearchOracle','usesResearchCalendarOrPathModel','annotationRemoval','implicitCaseFacts'])assert.equal(independent[key],false);
 assert.equal(inherited.status,'passed-inherited-reference-cases');assert.equal(inherited.referenceCases,776);assert.equal(inherited.results.length,776);inherited.evidence.forEach(bound);
 assert.equal(browser.status,'passed');assert.equal(browser.workPackage,'AP23M3');assert.equal(browser.localOnly,true);assert.equal(browser.dataReleaseId,web.dataReleaseId);assert.equal(browser.dataReleaseId,manifest.releaseId);assert.equal(browser.url,'http://127.0.0.1:8811/fristenrechner/');assert.equal(browser.realDeviceOrM365Test,false);assert.equal(browser.cases.length,config.browserCases);browser.evidence.forEach(bound);
 const browserBuild=web.artifacts.filter(item=>item.path.endsWith('/index.html')||/\/assets\/app-[A-Z0-9]+\.js$/u.test(item.path));assert.equal(browserBuild.length,2);for(const item of browserBuild)assert.deepEqual(browser.evidence.find(row=>row.path===item.path),item,'Browser observed current actual build');
 assert.equal(exported.status,'passed');assert.equal(exported.qualifiedCases,73);assert.equal(exported.qualifiedPaths,49);assert.equal(exported.syntheticInMemoryArtifacts,146);assert.equal(exported.blockedCasesDenied,36);
 assert.equal(exported.actualIcsFilesSaved,0);assert.equal(exported.outlookImports,0);assert.equal(exported.humanReleaseApproval,false);exported.bindings.forEach(bound);
 for(const report of[native,independent,inherited,browser,exported])assert.equal(report.sourceReleaseApproved,false);
 for(const report of[native,independent,inherited])assert.equal(report.calendarExportEnabled,false);
 const finding=json(config.paths.postAcceptanceFinding);assert.equal(finding.kind,'ap23m3-post-acceptance-social-ui-finding');assert.equal(finding.id,'social-ui-format17-disabled');assert.equal(finding.gate,'R10-H01');assert.equal(finding.status,'confirmed-release-blocker');assert.equal(finding.localOnly,true);assert.equal(finding.knownAfterHumanAcceptance,true);assert.equal(finding.assertionsPassed,true);assert.equal(finding.reportDoesNotAuthorizeFix,true);
 for(const key of['legalRulesChanged','humanAcceptanceOfFinding','fixImplemented','sourceReleaseApproved','operatingChanges'])assert.equal(finding[key],false,'Late finding boundary '+key);
 assert.equal(finding.current.formatVersion,'17.0.0');assert.equal(finding.current.hasSocialUi,false);assert.equal(finding.current.federalRules,44);assert.equal(finding.current.bernBindings,50);assert.equal(finding.prior.hasSocialUi,true);finding.bindings.forEach(bound);
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

