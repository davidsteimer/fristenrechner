// SPDX-License-Identifier: AGPL-3.0-only
// Exact accepted H3 integration snapshot. Historical flags are never rewritten.
import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {lstat,mkdir,open,readFile,readdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {safeRelative,sha256} from './archive-ap23g3-acceptance.mjs';
export {safeRelative,sha256};
const output='outputs/ap23h3-2026-10-22';
export const archiveConfig=Object.freeze({
  target:'outputs/ap23h3-abnahme-2026-10-22',proofPath:output+'/local-completion.json',
  proofSha256:'abbdc0fdb5af0a853c5f0f213848b599be5661607c5dd403916687fd32f4e06a',
  sourceCount:314,evidenceCount:51,candidateFiles:45,upstreamCount:9,generatedCount:3,
  originalProtectedCount:1812,protectedCount:1810,additionalCount:2,mutableCount:107,livingCount:7,requireGitHead:true,
  qaPath:output+'/QA-AP23H3.json',bundlePath:output+'/bundle-integrity.json',webPath:output+'/web-build.json',
  spfxPath:output+'/spfx-build.json',packagePath:output+'/actual-package.json',browserPath:output+'/browser-verification.json',
  exportPath:output+'/export-verification.json',reviewPath:output+'/independent-core-review.json',
  guardPaths:[output+'/protected-inputs.json',output+'/mutable-inputs.json',output+'/additional-mutable-inputs.json',output+'/preservation-verification.json'],
  qaCounts:{'product-regression':3053,'host-lifecycle':40,'actual-web-bundle':16,'h2-archive-tests':29},
  spfxCounts:[248,170],packageCount:9,reviewCount:13,screenshotCount:4,qualifiedPaths:21,
  expectedCounts:{artifacts:44,totalFilesIncludingManifest:45,calendars:35,profiles:5,administrativePaths:79,
    preservedAdministrativePaths:58,newAdministrativePaths:21,qualificationPolicies:79,laws:13,suspensionProfiles:25,
    holidayBindings:17,basisHolidayRules:479,supplementalSoRules:12,newProceduralRules:8,totalHolidayRules:499,
    preservedSocialRules:44,preservedBernSocialBindings:50,rawUnchangedFromG3:6},
  acceptance:{kind:'acceptedAP23H3Snapshot',acceptedOn:'2026-10-22',acceptedBy:'David Steimer',
    userStatement:'AP23H3 ist fachlich-technisch abgenommen. Bitte schlage die nächste Kantonstranche vor und bereite den nächsten fachlichen Schritt vor.',
    professionalTechnicalAcceptance:true,sourceReleaseApproved:false,calendarExportEnabled:false,
    deployable:false,deployed:false,published:false,operatingPermission:false,
    composition:'Exact accepted H3 source, candidate, original QA, native generated modules, actual web/SPFx artifacts and browser/export evidence. Original pending/false flags remain historical. Explicit upstream references are copied, never recursively expanded.',
    boundaries:['No new source release, approved data release, definitive release package, commit, push, upload, installation or E/Q/P change.',
      'The local reference candidate and existing-version isolated SPFx package remain non-deployable.',
      'The next canton tranche is to be proposed and prepared, not already accepted.']}
});
async function exists(path){try{await lstat(path);return true;}catch(error){if(error.code==='ENOENT')return false;throw error;}}
async function noSymlinks(root,path,missing=false){
  const base=await lstat(root);assert.ok(base.isDirectory()&&!base.isSymbolicLink(),'Invalid root');
  const parts=safeRelative(path).split('/');let current=root;
  for(const[index,part]of parts.entries()){
    current=resolve(current,part);let stat;
    try{stat=await lstat(current);}catch(error){if(missing&&error.code==='ENOENT')return;throw error;}
    assert.ok(!stat.isSymbolicLink(),'Symlink not allowed: '+current);
    assert.ok(index===parts.length-1||stat.isDirectory(),'Not a directory: '+current);
  }
}
async function readExact(root,item){
  await noSymlinks(root,item.path);const handle=await open(resolve(root,item.path),constants.O_RDONLY|constants.O_NOFOLLOW);
  try{
    assert.ok((await handle.stat()).isFile(),'Not a regular file: '+item.path);
    const bytes=await handle.readFile();assert.equal(sha256(bytes),item.sha256,'SHA-256 mismatch: '+item.path);
    if(item.byteLength!==undefined)assert.equal(bytes.length,item.byteLength,'Byte length mismatch: '+item.path);
    return bytes;
  }finally{await handle.close();}
}
async function walk(root,path=''){
  const files=[],directories=[];
  for(const entry of await readdir(resolve(root,path),{withFileTypes:true})){
    const next=path?path+'/'+entry.name:entry.name;
    assert.ok(!entry.isSymbolicLink(),'Symlink in archive: '+next);
    if(entry.isDirectory()){
      directories.push(next);const nested=await walk(root,next);files.push(...nested.files);directories.push(...nested.directories);
    }else{assert.ok(entry.isFile(),'Not a regular archive file: '+next);files.push(next);}
  }
  return{files:files.sort(),directories:directories.sort()};
}
function countTests(value,expected,label){
  assert.equal(value.tests,expected,'Unexpected test inventory: '+label);assert.equal(value.pass,expected,'Passed tests: '+label);
  for(const key of['fail','cancelled','skipped','todo'])assert.equal(value[key],0,'Non-passing tests: '+label+' '+key);
}
function tapCounts(bytes){return Object.fromEntries([...bytes.toString().matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));}
export async function archiveAcceptance({root=process.cwd(),write=false,config=archiveConfig}={}){
  root=resolve(root);safeRelative(config.target);await noSymlinks(root,config.target,true);
  const target=resolve(root,config.target),complete=await exists(target);
  if(complete)assert.ok(await exists(resolve(target,'receipt.json')),'Partial archive without receipt');
  const input=complete?target:root,descriptors=new Map(),buffers=new Map();
  function add(item){
    safeRelative(item.path);assert.match(item.sha256,/^[a-f0-9]{64}$/u,'Invalid hash: '+item.path);
    if(item.byteLength!==undefined)assert.ok(Number.isSafeInteger(item.byteLength)&&item.byteLength>=0,'Invalid length');
    const prior=descriptors.get(item.path);
    if(prior){assert.equal(prior.sha256,item.sha256,'Conflicting descriptor: '+item.path);
      if(prior.byteLength!==undefined&&item.byteLength!==undefined)assert.equal(prior.byteLength,item.byteLength,'Conflicting descriptor length');}
    descriptors.set(item.path,{path:item.path,sha256:item.sha256,
      ...(item.byteLength===undefined&&prior?.byteLength===undefined?{}:{byteLength:item.byteLength??prior.byteLength})});
  }
  async function verifiedBytes(path){
    const item=descriptors.get(path);assert.ok(item,'Report or log is not bound: '+path);
    const bytes=buffers.get(path)??await readExact(input,item);buffers.set(path,bytes);return bytes;
  }
  async function json(path){return JSON.parse(await verifiedBytes(path));}
  add({path:config.proofPath,sha256:config.proofSha256});
  const proof=await json(config.proofPath);
  assert.equal(proof.workPackage,'AP23H3');assert.equal(proof.status,'local-technical-verification-passed-awaiting-human-acceptance');
  for(const key of['professionalTechnicalAcceptance','sourceReleaseApproved','calendarExportEnabled','commitCreated','sourcePushPerformed','installationPerformed','regularIntermediateRelease'])assert.equal(proof[key],false,'Historical boundary '+key);
  assert.equal(proof.operatingPackagePreserved,true);assert.deepEqual(proof.formats,{manifest:'12.0.0',minimumConsumer:'12.0.0',administrativeCatalog:'5.0.0'});
  assert.equal(proof.sourceBindings.length,config.sourceCount,'Unexpected source inventory');
  assert.equal(proof.evidence.length,config.evidenceCount,'Unexpected evidence inventory');
  for(const list of[proof.sourceBindings,proof.evidence])assert.equal(new Set(list.map(x=>x.path)).size,list.length,'Duplicate primary binding');
  [...proof.sourceBindings,...proof.evidence,proof.candidateManifest].forEach(add);
  assert.deepEqual(proof.counts,config.expectedCounts,'Unexpected candidate component counts');
  const qa=await json(config.qaPath);
  assert.equal(qa.workPackage,'AP23H3');assert.equal(qa.status,'passed');assert.equal(qa.localOnly,true);
  for(const key of['sourceReleaseApproved','installationPerformed','githubPushPerformed'])assert.equal(qa[key],false,key);
  assert.equal(qa.head,proof.head);assert.equal(qa.manifestSha256,proof.candidateManifest.sha256);
  const counted=new Set();
  for(const step of qa.steps){
    assert.equal(step.exitCode,0);add({path:step.log,sha256:step.sha256,byteLength:step.byteLength});
    if(Object.hasOwn(config.qaCounts,step.id)){
      assert.ok(!counted.has(step.id),'Repeated QA step');counted.add(step.id);
      countTests(step.counts,config.qaCounts[step.id],step.id);countTests(tapCounts(await verifiedBytes(step.log)),config.qaCounts[step.id],step.log);
    }
  }
  assert.deepEqual([...counted].sort(),Object.keys(config.qaCounts).sort(),'Missing numerical QA step');
  const bundle=await json(config.bundlePath);
  assert.equal(bundle.kind,'ap23h3-local-reference-bundle');assert.equal(bundle.releaseStatus,'candidate');
  assert.equal(bundle.contractDecision,'DEC-2026-037');assert.equal(bundle.contractStatus,'approved');
  for(const key of['sourceReleaseApproved','productionActivation','calendarExportEnabled'])assert.equal(bundle[key],false,key);
  assert.equal(bundle.referenceOnly,true);assert.equal(bundle.sourceReview,'pending');assert.deepEqual(bundle.counts,proof.counts);
  add(bundle.manifest);bundle.artifacts.forEach(add);
  assert.equal(bundle.generatedModules.length,config.generatedCount,'Native generated module inventory');
  for(const item of bundle.generatedModules){
    assert.ok(proof.sourceBindings.some(source=>source.path===item.path&&source.sha256===item.sha256),'Unbound generated module');add(item);
  }
  add(bundle.buildScript);
  assert.equal(bundle.basedOn.length,config.upstreamCount,'Explicit upstream reference inventory');bundle.basedOn.forEach(add);
  const manifest=await json(proof.candidateManifest.path);
  assert.deepEqual(bundle.manifest,proof.candidateManifest);assert.equal(manifest.releaseId,bundle.releaseId);
  assert.equal(manifest.releaseStatus,'candidate');assert.equal(manifest.formatVersion,'12.0.0');assert.equal(manifest.compatibility.minimumConsumerFormatVersion,'12.0.0');
  assert.equal(manifest.artifacts.length+1,config.candidateFiles,'Unexpected candidate inventory');
  assert.equal(proof.counts.artifacts,manifest.artifacts.length);assert.equal(bundle.artifacts.length,manifest.artifacts.length);
  for(const item of manifest.artifacts)add({...item,path:dirname(proof.candidateManifest.path)+'/'+safeRelative(item.path)});
  const web=await json(config.webPath),spfx=await json(config.spfxPath);
  for(const build of[web,spfx]){
    assert.equal(build.workPackage,'AP23H3');assert.equal(build.status,'passed');assert.equal(build.localOnly,true);assert.equal(build.deployable,false);
    assert.deepEqual(build.protectedAfter,build.protectedBefore,'Changed protected build inputs');
    if(!complete)for(const item of build.protectedBefore)await readExact(root,item);
  }
  assert.equal(web.sourceReleaseApproved,false);assert.equal(web.dataReleaseId,manifest.releaseId);web.artifacts.forEach(add);
  assert.equal(spfx.operatingPackagePreserved,true);assert.equal(spfx.compiler.target,'es2015');add(spfx.testPackage);add(spfx.compiler.configuration);
  assert.equal(spfx.steps.length,5,'SPFx build gate inventory');
  for(const step of spfx.steps){assert.equal(step.exitCode,0);assert.ok(descriptors.has(step.log),'Unbound build log: '+step.log);add({path:step.log,sha256:step.sha256,byteLength:step.byteLength});}
  countTests(tapCounts(await verifiedBytes(spfx.steps[0].log)),config.spfxCounts[0],'SPFx unit');
  countTests(tapCounts(await verifiedBytes(spfx.steps[4].log)),config.spfxCounts[1],'SPFx built');
  const packaged=await json(config.packagePath);
  assert.equal(packaged.workPackage,'AP23H3');assert.equal(packaged.status,'passed');assert.equal(packaged.localOnly,true);assert.equal(packaged.syntheticApprovalsOnly,true);assert.equal(packaged.typecheckExitCode,0);
  countTests(packaged.counts,config.packageCount,'Actual H3 package');add(packaged.package);assert.deepEqual(packaged.package,spfx.testPackage);
  add({path:packaged.log,sha256:packaged.sha256});countTests(tapCounts(await verifiedBytes(packaged.log)),config.packageCount,'Actual H3 package log');
  const browser=await json(config.browserPath);
  assert.deepEqual(browser,proof.browser,'Browser evidence differs from original proof');
  assert.equal(browser.status,'passed');assert.equal(browser.actualLocalBuild,true);assert.deepEqual(browser.languages,['de','fr']);
  for(const key of['realDeviceTest','realM365HostTest','narrowViewportVisualTest','sourceReleaseApproved','operatingPermission'])assert.equal(browser[key],false,'Browser boundary '+key);
  assert.equal(browser.layout.horizontalOverflow,false);assert.equal(browser.layout.formGridColumns.length,2);
  assert.equal(browser.screenshots.length,config.screenshotCount);add(browser.asset);browser.screenshots.forEach(add);
  assert.ok(web.artifacts.some(x=>x.path===browser.asset.path&&x.sha256===browser.asset.sha256),'Browser asset not in actual web build');
  const exported=await json(config.exportPath);
  assert.equal(exported.workPackage,'AP23H3');assert.equal(exported.status,'passed');assert.equal(exported.kind,'supplemental-in-memory-export-verification');
  assert.deepEqual(exported.languages,['de','fr']);assert.equal(exported.qualifiedPaths,config.qualifiedPaths);assert.equal(exported.syntheticInMemoryArtifacts,2*config.qualifiedPaths);
  for(const key of['referenceExportsDenied','changedInputsDenied','resultClonesDenied','contextClonesDenied'])assert.equal(exported[key],config.qualifiedPaths,key);
  for(const key of['actualIcsFilesSaved','outlookImports'])assert.equal(exported[key],0,key);
  for(const key of['humanReleaseApproval','sourceReleaseApproved','operatingChanges'])assert.equal(exported[key],false,key);exported.bindings.forEach(add);
  const reviewed=await json(config.reviewPath);
  assert.equal(reviewed.status,'passed');assert.equal(reviewed.kind,'separate-ai-technical-countercheck');
  for(const key of['humanFourEyesReview','professionalAcceptance','operatingPermission'])assert.equal(reviewed[key],false,key);
  countTests(reviewed.tests,config.reviewCount,'Independent AI review');add(reviewed.tests.log);reviewed.bindings.forEach(add);
  countTests(tapCounts(await verifiedBytes(reviewed.tests.log.path)),config.reviewCount,'Independent AI review log');
  assert.equal(config.guardPaths.length,4,'Exactly four H3 preservation records');
  const[guard,mutable,additional,preservation]=await Promise.all(config.guardPaths.map(json));
  assert.equal(guard.capturedBeforeIntegration,true);assert.equal(mutable.capturedBeforeIntegration,true);
  assert.equal(Object.keys(guard.files).length,config.originalProtectedCount);assert.equal(Object.keys(mutable.existingFiles).length,config.mutableCount);
  assert.equal(Object.keys(mutable.livingAtStart).length,config.livingCount);assert.equal(Object.keys(additional.files).length,config.additionalCount);
  assert.equal(additional.productOperatingChanges,false);assert.equal(preservation.status,'protected-baselines-preserved');
  assert.equal(preservation.originalProtectedBindings,config.originalProtectedCount);assert.equal(preservation.protectedFilesVerified,config.protectedCount);
  assert.equal(proof.protectedFiles,config.protectedCount);assert.equal(qa.protectedFiles,config.protectedCount);
  assert.equal(proof.separatelyBoundRegistryChanges,config.additionalCount);assert.equal(qa.explicitAdditionalRegistryDispatches,config.additionalCount);
  assert.equal(qa.originalProtectedBindings,config.originalProtectedCount);assert.equal(preservation.additionalMutableInputs.length,config.additionalCount);
  for(const key of['acceptedLegalDataChanged','existingTestsChanged','historicalResearchReportsChanged','userModifiedDocxChanged','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(preservation[key],false,key);
  for(const key of['oldReaderAndArithmeticBytesPreserved'])assert.equal(preservation[key],true,key);
  for(const item of preservation.additionalMutableInputs){
    assert.equal(guard.files[item.path],item.before);assert.equal(additional.files[item.path].beforeSha256,item.before);
    assert.equal(descriptors.get(item.path)?.sha256,item.current,'Unbound current registry change');
  }
  for(const path of config.guardPaths.slice(0,3))assert.equal(preservation.inventorySha256[path.split('/').at(-1)],descriptors.get(path).sha256,'Frozen inventory changed');
  for(const record of[preservation.intendedMutableInputs,preservation.livingStatus]){
    const expected=record===preservation.intendedMutableInputs?mutable.existingFiles:mutable.livingAtStart;
    assert.equal(record.length,Object.keys(expected).length);
    for(const item of record){assert.equal(expected[item.path],item.before);assert.equal(descriptors.get(item.path)?.sha256,item.current,'Unbound accepted mutable source');}
  }
  assert.equal(guard.head,proof.head);assert.equal(mutable.head,proof.head);assert.equal(preservation.head,proof.head);
  if(!complete){
    if(config.requireGitHead)assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),proof.head,'Git head changed');
    let historical=0;
    for(const[path,hash]of Object.entries(guard.files)){
      if(Object.hasOwn(additional.files,path))continue;await readExact(root,{path,sha256:hash});historical++;
    }
    assert.equal(historical,config.protectedCount);
  }
  for(const item of proof.supplemental){assert.equal(item.exitCode,0);assert.ok(descriptors.has(item.path),'Unbound supplemental log');add(item);}
  const verified=[];
  for(const item of[...descriptors.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'))){
    const bytes=await verifiedBytes(item.path);assert.equal(sha256(bytes),item.sha256,item.path);
    if(item.byteLength!==undefined)assert.equal(bytes.length,item.byteLength,item.path);
    verified.push({item:{path:item.path,byteLength:bytes.length,sha256:item.sha256},bytes});
  }
  const receipt={...config.acceptance,proof:{path:config.proofPath,sha256:config.proofSha256},
    originalSourceBindings:proof.sourceBindings.length,originalEvidenceBindings:proof.evidence.length,
    candidate:{manifest:proof.candidateManifest.path,releaseId:manifest.releaseId,files:manifest.artifacts.length+1},
    exactGeneratedModules:bundle.generatedModules,historicalProtectedInputsCheckedWithoutRecopy:config.protectedCount,
    separatelyBoundRegistryChanges:config.additionalCount,numericalEvidence:{qa:config.qaCounts,spfx:config.spfxCounts,actualPackage:config.packageCount,independentAiReview:config.reviewCount},
    browserEvidenceCopied:true,inMemoryExportEvidenceCopied:true,artifacts:verified.map(x=>x.item)};
  const payload=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
  if(complete){
    await noSymlinks(target,'receipt.json');assert.deepEqual(await readFile(resolve(target,'receipt.json')),payload,'Receipt is not the exact derived acceptance record');
    const inventory=await walk(target),files=[...descriptors.keys(),'receipt.json'].sort(),directories=new Set();
    for(const file of files){let path=dirname(file);while(path!=='.'){directories.add(path);path=dirname(path);}}
    assert.deepEqual(inventory.files,files,'Unexpected archive files');assert.deepEqual(inventory.directories,[...directories].sort(),'Unexpected archive directories');
  }else if(write){
    await noSymlinks(root,config.target,true);await mkdir(dirname(target),{recursive:true});await mkdir(target);
    for(const{item,bytes}of verified){
      await noSymlinks(target,item.path,true);await mkdir(dirname(resolve(target,item.path)),{recursive:true});await noSymlinks(target,item.path,true);
      await writeFile(resolve(target,item.path),bytes,{flag:'wx'});await readExact(target,item);
    }
    await writeFile(resolve(target,'receipt.json'),payload,{flag:'wx'});
  }
  return{verified:true,target:config.target,mode:complete?'archive-reverified':write?'archive-created':'source-preflight-only',
    files:verified.length,candidateFiles:manifest.artifacts.length+1,payloadBytes:verified.reduce((sum,x)=>sum+x.bytes.length,0),
    historicalProtectedInputsNotRecopied:config.protectedCount,separatelyBoundRegistryChanges:config.additionalCount,
    receiptSha256:sha256(payload),receiptByteLength:payload.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(x=>x==='--check'||x==='--write'),'Only --check or --write');
  assert.ok(!(process.argv.includes('--check')&&process.argv.includes('--write')),'Choose one mode');
  console.log(JSON.stringify(await archiveAcceptance({write:process.argv.includes('--write')}),null,2));
}
