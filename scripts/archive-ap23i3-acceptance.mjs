// SPDX-License-Identifier: AGPL-3.0-only
// Exact accepted I3 snapshot. Original false/pending flags remain historical.
import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {lstat,mkdir,open,readdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const out='outputs/ap23i3-2026-10-22';
export const archiveConfig=Object.freeze({
  target:'outputs/ap23i3-abnahme-2026-10-27',proofPath:out+'/local-completion.json',
  proofSha256:'6e836e4da071fb5f983507c88bf4972f5672c5b52d937479fde8ce920607810a',
  bindingCount:820,candidateRoot:'data/candidates/2026-10-22-ap23i3',candidateFiles:45,protectedCount:2839,requireGitHead:true,
  supplements:[{path:'.work/ap23i3-spfx-build-E4oL80/step-5-budget240.log',byteLength:56376,
    sha256:'a071592142404d3578e47af33a095b6383e30bbb780a0e2386347503676e8c9a'}],
  paths:{qa:out+'/QA-AP23I3.json',bundle:out+'/bundle-integrity.json',web:out+'/web-build.json',spfx:out+'/spfx-build.json',
    packaged:out+'/actual-package.json',browser:out+'/browser-verification.json',exported:out+'/export-verification.json',
    native:out+'/native-reference-verification.json',independent:out+'/independent-verification.json',
    guard:out+'/protected-inputs.json',preservation:out+'/preservation-verification.json'},
  qaCounts:{'product-regression':3110,'host-lifecycle':50,'actual-web-bundle':22,'i3-governance':91},
  spfxCounts:[261,170],packageCount:8,referenceCases:249,screenshotCount:6,historicalTestFiles:31,
  expectedCounts:{artifacts:44,totalFilesIncludingManifest:45,calendars:35,profiles:5,administrativePaths:113,
    preservedAdministrativePaths:79,newAdministrativePaths:34,qualificationPolicies:113,laws:15,suspensionProfiles:29,
    holidayBindings:21,basisHolidayRules:479,supplementalRules:20,newHolidayRules:0,totalHolidayRules:499,
    preservedSocialRules:44,preservedBernSocialBindings:50,rawUnchangedFromH3:42},
  acceptance:{kind:'acceptedAP23I3Snapshot',acceptedOn:'2026-10-27',acceptedBy:'David Steimer',
    userStatement:'AP23I3 ist fachlich-technisch abgenommen. Bitte schlage die nächste Kantonstranche vor und bereite den nächsten fachlichen Schritt vor.',
    professionalTechnicalAcceptance:true,sourceReleaseApproved:false,calendarExportEnabled:false,deployable:false,deployed:false,
    sourcePublished:false,operatingPermission:false,commitPermission:false,sourcePushPermission:false,
    composition:'Exact 820 final I3 bindings plus the original completion proof and one successful retest log already hash-bound by those records. No recursive expansion of prior archives. Original candidate, pending and false flags remain unchanged.',
    boundaries:['Human I3 acceptance is recorded only in this separate receipt.',
      'No new source release, definitive release package, commit, push, upload, installation, mirror change or E/Q/P change.',
      'The local reference candidate and existing-version isolated SPFx package remain non-deployable.',
      'The next canton tranche may be proposed and its next professional step prepared, not already accepted.']}
});
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export function safeRelative(path){
  assert.equal(typeof path,'string');assert.ok(path.length>0&&!path.includes('\\')&&!path.includes('\0'),'Unsafe relative path');
  assert.ok(!path.startsWith('/')&&!/^[A-Za-z]:/.test(path),'Unsafe relative path');
  assert.ok(path.split('/').every(part=>part!==''&&part!=='.'&&part!=='..'),'Unsafe relative path');return path;
}
async function exists(path){try{await lstat(path);return true;}catch(error){if(error.code==='ENOENT')return false;throw error;}}
async function noSymlinks(root,path,missing=false){
  const base=await lstat(root);assert.ok(base.isDirectory()&&!base.isSymbolicLink(),'Invalid root');
  let current=root;const parts=safeRelative(path).split('/');
  for(const[index,part]of parts.entries()){
    current=resolve(current,part);let stat;try{stat=await lstat(current);}catch(error){if(missing&&error.code==='ENOENT')return;throw error;}
    assert.ok(!stat.isSymbolicLink(),'Symlink not allowed: '+current);
    assert.ok(index===parts.length-1||stat.isDirectory(),'Not a directory: '+current);
  }
}
async function readExact(root,item){
  await noSymlinks(root,item.path);const handle=await open(resolve(root,item.path),constants.O_RDONLY|constants.O_NOFOLLOW);
  try{assert.ok((await handle.stat()).isFile(),'Not a regular file: '+item.path);const bytes=await handle.readFile();
    assert.equal(sha256(bytes),item.sha256,'SHA-256 mismatch: '+item.path);
    if(item.byteLength!==undefined)assert.equal(bytes.length,item.byteLength,'Byte length mismatch: '+item.path);return bytes;
  }finally{await handle.close();}
}
async function walk(root,path=''){
  const files=[],directories=[];
  for(const entry of await readdir(resolve(root,path),{withFileTypes:true})){
    const next=path?path+'/'+entry.name:entry.name;assert.ok(!entry.isSymbolicLink(),'Symlink in archive: '+next);
    if(entry.isDirectory()){directories.push(next);const nested=await walk(root,next);files.push(...nested.files);directories.push(...nested.directories);}
    else{assert.ok(entry.isFile(),'Not a regular archive file: '+next);files.push(next);}
  }
  return{files:files.sort(),directories:directories.sort()};
}
const falseProofKeys=['professionalTechnicalAcceptance','sourceReleaseApproved','calendarExportEnabled','commitCreated','sourcePushPerformed',
  'installationPerformed','regularIntermediateRelease','operatingChanges'];
const falseAcceptanceKeys=['sourceReleaseApproved','calendarExportEnabled','deployable','deployed','sourcePublished','operatingPermission','commitPermission','sourcePushPermission'];
function tapCounts(bytes){return Object.fromEntries([...bytes.toString().matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));}
function passedCounts(value,expected,label){assert.equal(value.tests,expected,label+' tests');assert.equal(value.pass,expected,label+' pass');
  for(const key of['fail','cancelled','skipped','todo'])assert.equal(value[key],0,label+' '+key);}
export async function archiveAcceptance({root=process.cwd(),write=false,config=archiveConfig,
  readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
  root=resolve(root);safeRelative(config.target);await noSymlinks(root,config.target,true);
  for(const key of falseAcceptanceKeys)assert.equal(config.acceptance[key],false,'Acceptance cannot raise '+key);
  assert.equal(config.acceptance.professionalTechnicalAcceptance,true);
  const target=resolve(root,config.target),complete=await exists(target);
  if(complete)assert.ok(await exists(resolve(target,'receipt.json')),'Partial archive without receipt');
  const input=complete?target:root;
  const proofBytes=await readExact(input,{path:config.proofPath,sha256:config.proofSha256});
  const proof=JSON.parse(proofBytes),descriptors=new Map(),buffers=new Map([[config.proofPath,proofBytes]]);
  assert.equal(proof.workPackage,'AP23I3');assert.equal(proof.status,'local-technical-verification-passed-awaiting-human-acceptance');
  assert.equal(proof.i2TechnicallyAccepted,true);assert.equal(proof.operatingPackagePreserved,true);
  for(const key of falseProofKeys)assert.equal(proof[key],false,'Historical boundary '+key);
  assert.deepEqual(proof.contractDecision,{id:'DEC-2026-038',status:'approved',on:'2026-10-22'});
  assert.deepEqual(proof.formats,{manifest:'13.0.0',minimumConsumer:'13.0.0',administrativeCatalog:'6.0.0'});
  assert.deepEqual(proof.counts,config.expectedCounts);assert.equal(proof.protectedFiles,config.protectedCount);
  assert.equal(proof.bindings.length,config.bindingCount,'Original binding inventory');
  assert.equal(config.supplements.length,1,'One closed retest-log supplement');
  for(const item of[{path:config.proofPath,sha256:config.proofSha256,byteLength:proofBytes.length},...proof.bindings,...config.supplements]){
    safeRelative(item.path);assert.match(item.sha256,/^[a-f0-9]{64}$/u);assert.ok(Number.isSafeInteger(item.byteLength)&&item.byteLength>=0);
    assert.ok(!descriptors.has(item.path),'Duplicate binding: '+item.path);descriptors.set(item.path,item);
  }
  for(const item of descriptors.values())buffers.set(item.path,await readExact(input,item));
  function bound(item){const existing=descriptors.get(item.path);assert.ok(existing,'Unbound required artifact: '+item.path);
    assert.equal(existing.sha256,item.sha256,'Descriptor hash mismatch: '+item.path);
    if(item.byteLength!==undefined)assert.equal(existing.byteLength,item.byteLength,'Descriptor length mismatch: '+item.path);return buffers.get(item.path);}
  const upstreamReferences=new Map();
  function upstream(item){safeRelative(item.path);assert.match(item.sha256,/^[a-f0-9]{64}$/u);
    if(descriptors.has(item.path))bound(item);else{const prior=upstreamReferences.get(item.path);
      if(prior)assert.equal(prior.sha256,item.sha256,'Conflicting upstream reference');upstreamReferences.set(item.path,item);}}
  function json(path){assert.ok(descriptors.has(path),'Unbound required report: '+path);return JSON.parse(buffers.get(path));}
  const qa=json(config.paths.qa);assert.equal(qa.workPackage,'AP23I3');assert.equal(qa.status,'passed');assert.equal(qa.localOnly,true);
  assert.equal(qa.head,proof.head);assert.equal(qa.steps.length,12);
  for(const key of['sourceReleaseApproved','installationPerformed','githubPushPerformed'])assert.equal(qa[key],false,'QA boundary '+key);
  const qaSeen=new Set();
  for(const step of qa.steps){assert.equal(step.exitCode,0);const bytes=bound({path:step.log,sha256:step.sha256,byteLength:step.byteLength});
    if(Object.hasOwn(config.qaCounts,step.id)){assert.ok(!qaSeen.has(step.id));qaSeen.add(step.id);
      passedCounts(step.counts,config.qaCounts[step.id],step.id);passedCounts(tapCounts(bytes),config.qaCounts[step.id],step.log);}}
  assert.deepEqual([...qaSeen].sort(),Object.keys(config.qaCounts).sort());
  const bundle=json(config.paths.bundle);assert.equal(bundle.kind,'ap23i3-local-reference-bundle');assert.equal(bundle.releaseStatus,'candidate');
  assert.equal(bundle.contractDecision,'DEC-2026-038');assert.equal(bundle.contractStatus,'approved');assert.equal(bundle.sourceReview,'pending');
  assert.equal(bundle.referenceOnly,true);for(const key of['sourceReleaseApproved','productionActivation','calendarExportEnabled'])assert.equal(bundle[key],false);
  assert.deepEqual(bundle.counts,proof.counts);assert.deepEqual(bundle.manifest,proof.candidateManifest);bound(proof.candidateManifest);
  for(const item of[...bundle.artifacts,...bundle.generatedModules,bundle.buildScript])bound(item);
  // Upstream pointers are retained in the exact bound report, not recursively promoted to payloads.
  bundle.basedOn.forEach(upstream);
  const manifest=json(proof.candidateManifest.path);assert.equal(manifest.releaseStatus,'candidate');assert.equal(manifest.formatVersion,'13.0.0');
  assert.equal(manifest.compatibility.minimumConsumerFormatVersion,'13.0.0');assert.equal(manifest.sourceSummary.legalBasisReviewStatus,'pending');
  assert.equal(manifest.releaseId,bundle.releaseId);assert.equal(manifest.artifacts.length+1,config.candidateFiles);
  const candidatePaths=[proof.candidateManifest.path,...manifest.artifacts.map(item=>{const path=config.candidateRoot+'/'+safeRelative(item.path);bound({...item,path});return path;})].sort();
  assert.equal(new Set(candidatePaths).size,config.candidateFiles);assert.deepEqual([...descriptors.keys()].filter(path=>path.startsWith(config.candidateRoot+'/')).sort(),candidatePaths);
  assert.deepEqual((await walk(input,config.candidateRoot)).files,candidatePaths,'Exact raw candidate inventory');
  const web=json(config.paths.web),spfx=json(config.paths.spfx);
  for(const build of[web,spfx]){assert.equal(build.workPackage,'AP23I3');assert.equal(build.status,'passed');assert.equal(build.localOnly,true);
    assert.equal(build.deployable,false);assert.deepEqual(build.protectedAfter,build.protectedBefore);}
  assert.equal(web.sourceReleaseApproved,false);assert.equal(web.dataReleaseId,manifest.releaseId);web.artifacts.forEach(bound);
  assert.equal(spfx.operatingPackagePreserved,true);assert.equal(spfx.compiler.target,'es2015');bound(spfx.compiler.configuration);bound(spfx.testPackage);
  assert.deepEqual(spfx.testPackage,proof.actualPackage);assert.equal(spfx.steps.length,5);
  for(const step of spfx.steps){assert.equal(step.exitCode,0);bound({path:step.log,sha256:step.sha256,byteLength:step.byteLength});}
  passedCounts(tapCounts(buffers.get(spfx.steps[0].log)),config.spfxCounts[0],'SPFx source');
  passedCounts(tapCounts(buffers.get(spfx.steps[4].log)),config.spfxCounts[1],'SPFx historical package');
  const initial=json(spfx.initialTimeBudgetAttempt.path);bound(spfx.initialTimeBudgetAttempt);
  assert.equal(initial.status,'failed');assert.deepEqual(initial.steps.map(step=>step.exitCode),[0,0,0,0,1]);
  assert.deepEqual(json(spfx.stage+'/verification.json'),initial);assert.deepEqual(json(spfx.verificationPath),spfx);
  for(const step of initial.steps)bound({path:step.log,sha256:step.sha256,byteLength:step.byteLength});
  assert.deepEqual(tapCounts(buffers.get(initial.steps[4].log)),{tests:163,pass:160,fail:0,cancelled:3,skipped:0,todo:0});
  const historicalFiles=initial.steps[4].args.filter(arg=>arg.endsWith('.test.cjs'));
  assert.equal(historicalFiles.length,config.historicalTestFiles);assert.equal(new Set(historicalFiles).size,config.historicalTestFiles);
  assert.deepEqual(historicalFiles,spfx.timeBudgetRetest.args.filter(arg=>arg.endsWith('.test.cjs')));
  assert.equal(spfx.historicalTestFileCount,config.historicalTestFiles);assert.equal(spfx.retestOnly,true);assert.equal(spfx.compilerAndPackageRebuilt,false);
  assert.deepEqual(config.supplements[0],{path:spfx.timeBudgetRetest.log,byteLength:spfx.timeBudgetRetest.byteLength,sha256:spfx.timeBudgetRetest.sha256},'Exact already-bound retest supplement');
  assert.ok(initial.steps[4].args.includes('--test-timeout=60000'));assert.ok(spfx.timeBudgetRetest.args.includes('--test-timeout=240000'));
  assert.equal(spfx.timeBudgetRetest.exitCode,0);passedCounts(spfx.timeBudgetRetest.counts,config.spfxCounts[1],'240s retest');bound(spfx.timeBudgetRetest);
  const packaged=json(config.paths.packaged);assert.equal(packaged.status,'passed');assert.equal(packaged.localOnly,true);
  assert.equal(packaged.syntheticApprovalsOnly,true);assert.equal(packaged.typecheckExitCode,0);assert.deepEqual(packaged.package,spfx.testPackage);
  passedCounts(packaged.counts,config.packageCount,'Actual I3 package');passedCounts(tapCounts(bound({path:packaged.log,sha256:packaged.sha256})),config.packageCount,'Actual package TAP');
  const browser=json(config.paths.browser);assert.deepEqual(browser,proof.browser);assert.equal(browser.status,'passed');assert.equal(browser.actualLocalBuild,true);
  assert.deepEqual(browser.languages,['de','fr']);for(const key of['realDeviceTest','realM365HostTest','actualExportEnabled'])assert.equal(browser[key],false);
  assert.equal(browser.twoColumnLayout,true);assert.equal(browser.horizontalOverflow,false);assert.equal(browser.screenshots.length,config.screenshotCount);
  [browser.asset,browser.domObservation,...browser.accessibility,...browser.screenshots].forEach(bound);
  assert.ok(web.artifacts.some(item=>item.path===browser.asset.path&&item.sha256===browser.asset.sha256));
  const exported=json(config.paths.exported);assert.equal(exported.status,'passed');assert.equal(exported.qualifiedPaths,34);assert.equal(exported.qualifiedCases,39);
  assert.equal(exported.syntheticInMemoryArtifacts,78);for(const key of['actualIcsFilesSaved','outlookImports'])assert.equal(exported[key],0);
  for(const key of['humanReleaseApproval','sourceReleaseApproved','operatingChanges'])assert.equal(exported[key],false);exported.bindings.forEach(bound);
  const native=json(config.paths.native),independent=json(config.paths.independent);
  assert.equal(native.status,'passedNativeFullReferenceComparison');assert.equal(independent.status,'passedIndependentNativeComparison');
  for(const report of[native,independent]){assert.equal(report.referenceCases,config.referenceCases);report.inputs.forEach(upstream);}
  assert.equal(proof.nativeReferenceCases,config.referenceCases);assert.equal(proof.independentReferenceCases,config.referenceCases);
  assert.equal(independent.calendarEndEligibilityComparisons,1460);assert.equal(independent.calendarProbes,15);assert.equal(independent.unchangedRawArtifacts,42);
  for(const step of proof.supplemental){assert.equal(step.exitCode,0);bound(step);}
  const guard=json(config.paths.guard),preservation=json(config.paths.preservation);
  assert.equal(guard.head,proof.head);assert.equal(preservation.head,proof.head);assert.equal(Object.keys(guard.files).length,config.protectedCount);
  assert.equal(preservation.protectedFilesVerified,config.protectedCount);assert.equal(preservation.status,'protected-integration-baselines-preserved');
  assert.equal(preservation.inventorySha256,descriptors.get(config.paths.guard).sha256);
  for(const key of['acceptedLegalDataChanged','existingTestsChanged','acceptedResearchChanged','historicalEvidenceChanged','userModifiedDocxChanged','sourceReleaseApproved','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(preservation[key],false);
  assert.equal(preservation.oldReaderAndArithmeticBytesPreserved,true);
  if(!complete){if(config.requireGitHead)assert.equal(await readHead(root),proof.head,'Git HEAD changed');
    for(const[path,hash]of Object.entries(guard.files))await readExact(root,{path,sha256:hash});}
  const verified=[...descriptors.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'));
  const receipt={...config.acceptance,proof:{path:config.proofPath,byteLength:proofBytes.length,sha256:config.proofSha256},head:proof.head,
    originalBindingCount:proof.bindings.length,explicitTransitivePayloads:config.supplements,
    upstreamReferencesRetainedAsMetadataNotRecursivelyExpanded:[...upstreamReferences.values()].sort((a,b)=>a.path.localeCompare(b.path,'en')),
    formats:proof.formats,counts:proof.counts,
    candidate:{manifest:proof.candidateManifest.path,releaseId:manifest.releaseId,files:config.candidateFiles},
    historicalProtectedInputsCheckedWithoutRecopy:config.protectedCount,
    numericalEvidence:{qa:config.qaCounts,spfx:config.spfxCounts,actualPackage:config.packageCount,nativeReferences:config.referenceCases,independentReferences:config.referenceCases},
    browserScreenshotsCopied:browser.screenshots.length,browserEvidenceCopied:true,inMemoryExportEvidenceCopied:true,
    initialTimeoutAndSameByteRetestCopied:true,historicalTestFiles:historicalFiles.length,artifacts:verified};
  const bytes=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
  if(complete){await readExact(target,{path:'receipt.json',sha256:sha256(bytes),byteLength:bytes.length});
    const inventory=await walk(target),expectedFiles=[...descriptors.keys(),'receipt.json'].sort(),directories=new Set();
    for(const path of expectedFiles){let directory=dirname(path);while(directory!=='.'){directories.add(directory);directory=dirname(directory);}}
    assert.deepEqual(inventory.files,expectedFiles,'Unexpected archive files');assert.deepEqual(inventory.directories,[...directories].sort(),'Unexpected archive directories');
  }else if(write){await noSymlinks(root,config.target,true);await mkdir(dirname(target),{recursive:true});await mkdir(target);
    for(const item of verified){await noSymlinks(target,item.path,true);await mkdir(dirname(resolve(target,item.path)),{recursive:true});
      await noSymlinks(target,item.path,true);await writeFile(resolve(target,item.path),buffers.get(item.path),{flag:'wx'});await readExact(target,item);}
    await writeFile(resolve(target,'receipt.json'),bytes,{flag:'wx'});
  }
  return{verified:true,target:config.target,mode:complete?'archive-reverified':write?'archive-created':'source-preflight-only',
    originalBindings:proof.bindings.length,explicitTransitivePayloads:config.supplements.length,files:verified.length,candidateFiles:config.candidateFiles,
    payloadBytes:verified.reduce((sum,item)=>sum+item.byteLength,0),historicalProtectedInputsNotRecopied:config.protectedCount,
    receiptSha256:sha256(bytes),receiptByteLength:bytes.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(arg=>['--write','--check'].includes(arg)));assert.ok(!(process.argv.includes('--write')&&process.argv.includes('--check')));
  console.log(JSON.stringify(await archiveAcceptance({write:process.argv.includes('--write')}),null,2));
}
