// SPDX-License-Identifier: AGPL-3.0-only
// Exact accepted J3 snapshot. Original false/pending flags remain historical.
import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {lstat,mkdir,open,readdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const out='outputs/ap23j3-2026-10-27';
export const archiveConfig=Object.freeze({
  target:'outputs/ap23j3-abnahme-2026-10-27',proofPath:out+'/local-completion.json',
  proofSha256:'0af5b41ed029890c2f9538fd4052bad69ca9c6f50dde2f0af5fdcc3ecd921595',
  bindingCount:1232,candidateRoot:'data/candidates/2026-10-27-ap23j3',candidateFiles:45,protectedCount:4466,requireGitHead:true,
  supplementContext:{path:out+'/initial-web-timebudget/continuation-inputs.json',sha256:'40b96da27f381ebc66ebd69774922c944f9525f34170867dad5de8adf7302e91'},
  supplementListSha256:'a1106bdf1d867ebc045c6ffaf6c8e59f8b4b31cec12b395ca5d4b0238741eaaf',
  supplements:[{"path":"tests/ap21-e/candidate-r2.test.cjs","byteLength":24920,"sha256":"e02b243ba625ba2b413b9e41c11d983668328d88652396fc522292a9f2538513"},{"path":"tests/ap21-e/candidate.test.cjs","byteLength":18750,"sha256":"5898fd5134ce8811162195c38ea082fc7b537f6ae383759bc4c1340ed1bd9897"},{"path":"tests/archive/ap18-workbook-archive.test.mjs","byteLength":17276,"sha256":"f3516d61d381e8599a08d0db441b4a0a72bf40ba3884fc4d44de0be46977dbdb"},{"path":"tests/archive/ap19b-references.accepted-2026-09-25.mjs","byteLength":12640,"sha256":"ac9c85d9877f0e20b7ea95e71ac533b662a5d8d5e10a22382dd3ec753bbc329e"},{"path":"tests/archive/test_ap18_publication_workbooks.py","byteLength":20811,"sha256":"2d13d9e997d22a357eadc1ca375f29b5f8cb82d32c5032965d590c3d321a09d3"},{"path":"tests/calendar-rules/ap18a-area-assignments.test.mjs","byteLength":8940,"sha256":"9454a853ed95dc98825fcf455dea8e523d008405f31a93194bdf794d4410095d"},{"path":"tests/calendar-rules/ap18a-workbook-model.test.mjs","byteLength":14574,"sha256":"d8666e0059a921fe259d6a8af33d1da43690f9aca3b7ef20769f467e5a6ceb57"},{"path":"tests/calendar-rules/ap18b-03-cantons.test.mjs","byteLength":5310,"sha256":"b77d4a48dad1725529acaf4112d1ff6dc5bfad20f1ac2d31d26f857ee21e80ad"},{"path":"tests/calendar-rules/ap18b-03-contract.test.mjs","byteLength":12161,"sha256":"0c60eb5b748682f1366ca6988dd277652ea621c9968ad7e8f1be60fa54586258"},{"path":"tests/calendar-rules/ap18b-04-cantons.test.mjs","byteLength":2869,"sha256":"beb1ee4029dd54c5b3ff322d24d22db24d5815a3afaf7f667d7f125c3d8f9d73"},{"path":"tests/calendar-rules/ap18b-04-central.test.mjs","byteLength":10025,"sha256":"a2e5fedc782a2fe688f53718463369e6f4dafeadf8eefc8f9cde3397f3ca4809"},{"path":"tests/calendar-rules/ap18b-04-east.test.mjs","byteLength":8469,"sha256":"f459a43a2872c3e019f12f3799c6ca40cc652d3a610f07f5d107fc361a27eba2"},{"path":"tests/calendar-rules/ap18b-04-west.test.mjs","byteLength":9216,"sha256":"de3f3058e2f39ab26b59c62be859b5030fecc66c8a8661e6ccf012d8db9875bf"},{"path":"tests/calendar-rules/ap18b-05-conditions.test.mjs","byteLength":13382,"sha256":"61ddca8cb41f45c9df0b7372fa7c84b2d01f499bc21d5144bb8694ae323ce32b"},{"path":"tests/calendar-rules/ap18b-ag-model.test.mjs","byteLength":15416,"sha256":"403ca3ec03a442bdbfccbee9dce89fd9d9d13beaef93f5dc71685f413e5be9e6"},{"path":"tests/calendar-rules/ap18b-complete-labels.test.mjs","byteLength":5180,"sha256":"dce060907c91249573a70b9ca2eb95147e8e8ef5a7fd69cb798a452e4538cc26"},{"path":"tests/calendar-rules/ap18b-rg-labels.test.mjs","byteLength":1729,"sha256":"66dc18b0b4932701c0641eb02f7e91d7fc0cce992a4dd9b4535c1099308a4d3d"},{"path":"tests/calendar-rules/ap18b-ti-gr-model.test.mjs","byteLength":20034,"sha256":"334d0fad34473421728ff1e0f1af29bd43c3bef68018bee6bab825c0bdb95909"},{"path":"tests/calendar-rules/ap18c-import.test.mjs","byteLength":20966,"sha256":"09048fbe80f2e95d653fa65b00b9aee55de9cdf80777210ea53a6e2e95968e08"},{"path":"tests/calendar-rules/ap18c-release.test.mjs","byteLength":8655,"sha256":"a5b72d2d03635e9e7478638a90fc3e2f997aef5786d3042b6a257bf62e60e239"},{"path":"tests/calendar-rules/candidates/ap12a-reference-cases.json","byteLength":10818,"sha256":"d421fcd45378d1073b3a9bb6831c196bacab278fce96cbd5bfd385600d4ff63b"},{"path":"tests/calendar-rules/mvp04-promotion.test.mjs","byteLength":12690,"sha256":"a48be3c563a26e6be306d01b71f5397059958655aa7acb32c4333cc039b71d32"},{"path":"tests/calendar-rules/mvp05-promotion.test.mjs","byteLength":5668,"sha256":"5ec39bd90bacbc581bf1e5aae3ccf5902da9173d7bbfbac3c095b7713b0dbb4b"},{"path":"tests/calendar-rules/test_ap18c_reader.py","byteLength":11594,"sha256":"8b5547cbef92a63c16f2ffc378b9411fae5e9a59d168a6fd5040aefa7d46ff8d"},{"path":"tests/calendar-rules/validate_ap12a_candidates.py","byteLength":25759,"sha256":"a76e4ab5d4c2bfe87a3f6146d60f97c75a8dd9a1eb8796e49670f4c6e988f629"},{"path":"tests/fixtures/ap18c/manifest-format3.schema.json","byteLength":10245,"sha256":"016abce21e480fd24c6ba45213df66622c9216299986cd89a22e95ea751cad55"},{"path":"tests/fixtures/mvp07-public-integrity/index.json","byteLength":364410,"sha256":"8ffa79680dd02c29e10cedf81ca7b833e897d8b3c8274d7b0a8e6ee30fce797d"},{"path":"tests/fixtures/mvp07-public-integrity/source-register.json","byteLength":184920,"sha256":"4da56b5c2e6b02730a33e4eb74d2c0f1c6aa52188ff1bfe649204b58a4e4eb20"},{"path":"tests/golden/approved/golden-cases.json","byteLength":34678,"sha256":"05ec38dc2766377d5b842d9b93d2d08d872025589d505322915f317dc98fe095"},{"path":"tests/golden/approved/vrpg-be-special-cases.json","byteLength":34295,"sha256":"5683da616e78f9973af0e3264cfa8aa275f1b6db903de9fa4c680890fe0795dc"},{"path":"tests/golden/candidates/ap11a-vrpg-be-special-cases.json","byteLength":20314,"sha256":"4c9008670915fd46b9a0a8982ccf770fb6a317364e0897022ab7d43ea3d09bee"},{"path":"tests/golden/candidates/ap17b-anwendbarkeit.json","byteLength":56152,"sha256":"d180d6c7dd67f30bf8abe9b101878b22b1e455ad42bbd2ca633b1ee4487b5f47"},{"path":"tests/golden/candidates/ap19a-national-model.json","byteLength":8515,"sha256":"88eddd275b9d50efc190f1e8035bd6aaaf4414fa2524bb9c95cc2031086cb8df"},{"path":"tests/golden/candidates/ap19b-migration-plan.json","byteLength":6406,"sha256":"105875c6ffa5b225c845f6da056568361aa610f8479d2256c2924f9ed7ad2087"},{"path":"tests/golden/candidates/ap19b-social-deadlines.json","byteLength":48765,"sha256":"da5895b8d09ce46f61830d08613f93ee0a673bd1cefbd7cbbadeb4c054940ae8"},{"path":"tests/golden/candidates/ap20b-social-contract.json","byteLength":4523,"sha256":"12890e16cf50e6b1a2fcb50e79f6a7e5540053d398b2418248c1135227791e9c"},{"path":"tests/golden/candidates/ap20b-social-dates.json","byteLength":2228,"sha256":"9740ce84883a54beec81f2f8a6cb1c450d690c9b6f440c5841d5821dfad16fa3"},{"path":"tests/golden/candidates/ap22b-calendar-references.json","byteLength":36049,"sha256":"7341cf47846885e9fa4416a5849816e1af78bd1787d077d160c17005c8caca42"},{"path":"tests/golden/candidates/ap22b-holiday-contract.json","byteLength":1183558,"sha256":"572b735fdb5cdbd7a397b41f6f1cb7eb99a15db43e506d9bc8e312293ba00c0a"},{"path":"tests/golden/candidates/ap23b-administrative.json","byteLength":17107,"sha256":"a795a22a07945e02369f917dcea4d047a7bb3bb897e198a1fe1ffbea4a65a5d1"},{"path":"tests/golden/candidates/ap23c-administrative-contract.json","byteLength":49618,"sha256":"9600d1474f3622eb258284bed03d00e99cc7bcd089d5d1452552472b12f2af18"},{"path":"tests/golden/candidates/ap23e1-administrative.json","byteLength":20403,"sha256":"769e9c7db0d63b768909a5042bd1446b708f5e0ed6be7bb92abe7f33669d7ddb"},{"path":"tests/golden/invalid/missing-deadline-days.json","byteLength":1916,"sha256":"4e1cc55e0dcb874d3a8395e53e30ca8fb8889c3ddb6e1b78b8107412c9d87f70"},{"path":"tests/golden/unresolved/open-cases.json","byteLength":5221,"sha256":"3c66720d552122c83f7a02c83aaf6c543ab1d6d00ed9c62e48632e45fe829b7d"},{"path":"tests/golden/validate_ap17b_candidates.py","byteLength":19044,"sha256":"556732d41293b02cb1f2e4b802cdb280642203860861e43c73778364f427072a"},{"path":"tests/golden/validate_golden_cases.py","byteLength":26273,"sha256":"88073ad18ea558ae05199cd8bb01ec4bc6e2fbde8bc8da11d981220a192397d2"},{"path":"tests/private/mvp06_mirror_git_audit.py","byteLength":1528,"sha256":"c105faa2e81d552ce3b73425e48436f62cc9670cccba24fed21fe7c6ced3a59f"},{"path":"tests/special-regimes/invalid/original-without-cutoff.json","byteLength":478,"sha256":"2214455bfa259f0739d5307867c973c1a2c402f5aeb6783c7e8b1f32a395d2f4"},{"path":"tests/special-regimes/invalid/unknown-calculation-type.json","byteLength":671,"sha256":"e6be35c0844c844514b4e2cf84d3529f797dbadff0c586f0a84dd2c7337139b3"},{"path":"tests/special-regimes/validate_special_regime_candidates.py","byteLength":25906,"sha256":"fb633d2c7ba6e1d7c7f7dab526dc7b150e8d6016bd8d1a6c78f9d664b2ae7a23"},{"path":"tests/special-regimes/validate_special_regime_release.py","byteLength":16131,"sha256":"5a5e0d73ccbc5d3f74e9d15f3ea8db56fd8b91e178452e3edebb27611e983f19"}],sourceInputCount:899,stageInputCount:278,
  paths:{qa:out+'/QA-AP23J3.json',bundle:out+'/bundle-integrity.json',web:out+'/web-build.json',spfx:out+'/spfx-build.json',
    packaged:out+'/actual-package.json',browser:out+'/browser-verification.json',exported:out+'/export-verification.json',
    native:out+'/native-reference-verification.json',independent:out+'/independent-verification.json',
    guard:out+'/protected-inputs.json',preservation:out+'/preservation-verification.json'},
  qaCounts:{'product-regression':3191,'host-lifecycle':60,'actual-web-bundle':27,'j3-governance':105},
  spfxCounts:[274,170],packageCount:8,referenceCases:673,screenshotCount:6,historicalTestFiles:31,sourceTestFiles:22,
  expectedCounts:{artifacts:44,totalFilesIncludingManifest:45,calendars:35,profiles:5,administrativePaths:149,
    preservedAdministrativePaths:113,newAdministrativePaths:36,qualificationPolicies:149,laws:18,suspensionProfiles:35,
    holidayBindings:27,basisHolidayRules:479,supplementalRules:20,newHolidayRules:0,totalHolidayRules:499,
    preservedSocialRules:44,preservedBernSocialBindings:50,rawUnchangedFromI3:42},
  acceptance:{kind:'acceptedAP23J3Snapshot',acceptedOn:'2026-10-27',acceptedBy:'David Steimer',
    userStatement:'AP23J3 ist fachlich-technisch abgenommen. Bitte schlage die nächste Kantonstranche vor und bereite den nächsten fachlichen Schritt vor.',
    professionalTechnicalAcceptance:true,sourceReleaseApproved:false,calendarExportEnabled:false,deployable:false,deployed:false,
    sourcePublished:false,operatingPermission:false,commitPermission:false,sourcePushPermission:false,nextProfessionalStepStarted:false,
    composition:'Exact 1232 final J3 bindings plus the original completion proof and precisely 51 additional raw inputs already bound in the frozen continuation context. No recursive expansion of prior archives. Original candidate, pending and false flags remain unchanged.',
    boundaries:['Human J3 acceptance is recorded only in this separate receipt.',
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
const falseAcceptanceKeys=['sourceReleaseApproved','calendarExportEnabled','deployable','deployed','sourcePublished','operatingPermission','commitPermission','sourcePushPermission','nextProfessionalStepStarted'];
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
  assert.equal(proof.workPackage,'AP23J3');assert.equal(proof.status,'local-technical-verification-passed-awaiting-human-acceptance');
  assert.equal(proof.j2TechnicallyAccepted,true);assert.equal(proof.operatingPackagePreserved,true);
  for(const key of falseProofKeys)assert.equal(proof[key],false,'Historical boundary '+key);
  assert.deepEqual(proof.contractDecision,{id:'DEC-2026-039',status:'approved',on:'2026-10-27'});
  assert.deepEqual(proof.formats,{manifest:'14.0.0',minimumConsumer:'14.0.0',administrativeCatalog:'7.0.0'});
  assert.deepEqual(proof.counts,config.expectedCounts);assert.equal(proof.protectedFiles,config.protectedCount);
  assert.equal(proof.bindings.length,config.bindingCount,'Original binding inventory');
  const contextDescriptor=proof.bindings.find(item=>item.path===config.supplementContext.path);
  assert.ok(contextDescriptor,'Continuation context must be in the original final inventory');
  assert.equal(contextDescriptor.sha256,config.supplementContext.sha256,'Closed original continuation context');
  const supplementContext=JSON.parse(await readExact(input,contextDescriptor));
  const originalDescriptors=new Map(proof.bindings.map(item=>[item.path,item])),transitive=new Map();
  for(const item of[...supplementContext.sourceInputsBefore,...supplementContext.stageInputsBefore.flatMap(pair=>[pair.source,pair.stage])]){
    safeRelative(item.path);const prior=transitive.get(item.path);if(prior)assert.deepEqual(prior,item,'Conflicting transitive descriptor');
    transitive.set(item.path,item);const original=originalDescriptors.get(item.path);if(original)assert.deepEqual(original,item,'Transitive descriptor conflicts with original');
  }
  const closedInputs=[...transitive.values()].filter(item=>!originalDescriptors.has(item.path)).sort((a,b)=>a.path.localeCompare(b.path,'en'));
  assert.deepEqual(config.supplements,closedInputs,'Only exact missing continuation inputs may be copied');
  assert.equal(sha256(Buffer.from(JSON.stringify(closedInputs,null,2)+'\n')),config.supplementListSha256,'Closed supplement list hash');
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
  function jsonPathText(path){assert.ok(descriptors.has(path),'Unbound required source: '+path);return buffers.get(path).toString();}
  const qa=json(config.paths.qa);assert.equal(qa.workPackage,'AP23J3');assert.equal(qa.status,'passed');assert.equal(qa.localOnly,true);
  assert.equal(qa.head,proof.head);assert.equal(qa.steps.length,12);
  for(const key of['sourceReleaseApproved','installationPerformed','githubPushPerformed'])assert.equal(qa[key],false,'QA boundary '+key);
  const qaSeen=new Set();
  for(const step of qa.steps){assert.equal(step.exitCode,0);const bytes=bound({path:step.log,sha256:step.sha256,byteLength:step.byteLength});
    if(Object.hasOwn(config.qaCounts,step.id)){assert.ok(!qaSeen.has(step.id));qaSeen.add(step.id);
      passedCounts(step.counts,config.qaCounts[step.id],step.id);passedCounts(tapCounts(bytes),config.qaCounts[step.id],step.log);}}
  assert.deepEqual([...qaSeen].sort(),Object.keys(config.qaCounts).sort());
  const bundle=json(config.paths.bundle);assert.equal(bundle.kind,'ap23j3-local-reference-bundle');assert.equal(bundle.releaseStatus,'candidate');
  assert.equal(bundle.contractDecision,'DEC-2026-039');assert.equal(bundle.contractStatus,'approved');assert.equal(bundle.sourceReview,'pending');
  assert.equal(bundle.referenceOnly,true);for(const key of['sourceReleaseApproved','productionActivation','calendarExportEnabled'])assert.equal(bundle[key],false);
  assert.deepEqual(bundle.counts,proof.counts);assert.deepEqual(bundle.manifest,proof.candidateManifest);bound(proof.candidateManifest);
  for(const item of[...bundle.artifacts,...bundle.generatedModules,bundle.buildScript])bound(item);
  // Upstream pointers are retained in the exact bound report, not recursively promoted to payloads.
  bundle.basedOn.forEach(upstream);
  const manifest=json(proof.candidateManifest.path);assert.equal(manifest.releaseStatus,'candidate');assert.equal(manifest.formatVersion,'14.0.0');
  assert.equal(manifest.compatibility.minimumConsumerFormatVersion,'14.0.0');assert.equal(manifest.sourceSummary.legalBasisReviewStatus,'pending');
  assert.equal(manifest.releaseId,bundle.releaseId);assert.equal(manifest.artifacts.length+1,config.candidateFiles);
  const candidatePaths=[proof.candidateManifest.path,...manifest.artifacts.map(item=>{const path=config.candidateRoot+'/'+safeRelative(item.path);bound({...item,path});return path;})].sort();
  assert.equal(new Set(candidatePaths).size,config.candidateFiles);assert.deepEqual([...descriptors.keys()].filter(path=>path.startsWith(config.candidateRoot+'/')).sort(),candidatePaths);
  assert.deepEqual((await walk(input,config.candidateRoot)).files,candidatePaths,'Exact raw candidate inventory');
  const web=json(config.paths.web),spfx=json(config.paths.spfx);
  for(const build of[web,spfx]){assert.equal(build.workPackage,'AP23J3');assert.equal(build.status,'passed');assert.equal(build.localOnly,true);
    assert.equal(build.deployable,false);assert.deepEqual(build.protectedAfter,build.protectedBefore);}
  assert.equal(web.sourceReleaseApproved,false);assert.equal(web.dataReleaseId,manifest.releaseId);web.artifacts.forEach(bound);
  assert.equal(spfx.operatingPackagePreserved,true);assert.equal(spfx.compiler.target,'es2015');bound(spfx.compiler.configuration);bound(spfx.testPackage);
  assert.deepEqual(spfx.testPackage,proof.actualPackage);assert.equal(spfx.steps.length,7);
  for(const step of spfx.steps){assert.equal(step.exitCode,0);bound({path:step.log,sha256:step.sha256,byteLength:step.byteLength});}
  assert.deepEqual(json(spfx.stage+'/verification.json'),spfx,'Actual regular SPFx stage verification');
  for(const key of['initialTimeBudgetAttempt','timeBudgetRetest','retestOnly'])assert.equal(Object.hasOwn(spfx,key),false);
  assert.deepEqual(spfx.steps[0].args,['scripts/sync-schemas.mjs']);assert.deepEqual(spfx.steps[1].args,['scripts/sync-product-source.mjs']);
  assert.deepEqual(spfx.steps[3].args,['test','--clean','--production']);assert.deepEqual(spfx.steps[4].args,['scripts/audit-product-css.mjs']);
  assert.deepEqual(spfx.steps[5].args,['package-solution','--production']);
  passedCounts(tapCounts(buffers.get(spfx.steps[2].log)),config.spfxCounts[0],'SPFx source');
  passedCounts(tapCounts(buffers.get(spfx.steps[6].log)),config.spfxCounts[1],'SPFx historical package');
  const sourceTests=spfx.steps[2].args.filter(arg=>arg.endsWith('.test.ts'));
  const historicalFiles=spfx.steps[6].args.filter(arg=>arg.endsWith('.test.cjs'));
  assert.equal(sourceTests.length,config.sourceTestFiles);assert.equal(new Set(sourceTests).size,config.sourceTestFiles);
  assert.equal(historicalFiles.length,config.historicalTestFiles);assert.equal(new Set(historicalFiles).size,config.historicalTestFiles);
  for(const index of[2,6])assert.ok(spfx.steps[index].args.includes('--test-timeout=240000'));
  const continuation=qa.webTimeBudgetContinuation;assert.deepEqual(continuation,proof.webTimeBudgetContinuation);
  assert.ok(continuation,'Complete original web-timeout evidence');
  for(const item of[continuation.context,continuation.initialQa,continuation.initialWebLog,continuation.initialRunner,continuation.testFile])bound(item);
  const initial=json(continuation.initialQa.path),context=json(continuation.context.path);
  assert.equal(initial.status,'failed');assert.equal(initial.steps.length,7);assert.deepEqual(initial.steps.map(step=>step.exitCode),[0,0,0,0,0,0,1]);
  assert.deepEqual(initial.steps.slice(0,6),qa.steps.slice(0,6),'Same prior six successful steps');
  const initialCounts={tests:22,pass:21,fail:0,cancelled:1,skipped:0,todo:0};
  assert.deepEqual(initial.steps[6].counts,initialCounts);
  const initialLog=bound(continuation.initialWebLog).toString();assert.deepEqual(tapCounts(initialLog),initialCounts);
  assert.match(initialLog,/failureType: 'testTimeoutFailure'/);assert.match(initialLog,/test timed out after 180000ms/);
  assert.equal([...initialLog.matchAll(/^not ok /gm)].length,1);
  assert.equal(continuation.initialGlobalTimeoutMs,180000);assert.equal(continuation.finalGlobalTimeoutMs,900000);
  assert.equal(continuation.completeTestFileRepeated,true);assert.equal(continuation.firstSixStepsReused,true);
  assert.equal(continuation.assertionFailuresInInitialAttempt,0);assert.equal(continuation.initialCancelledTests,1);
  const oldArgs=continuation.initialCommand.args,newArgs=continuation.finalCommand.args;
  assert.deepEqual(oldArgs,['--import','tsx','--test','--test-timeout=180000',continuation.testFile.path]);
  assert.deepEqual(newArgs,['--import','tsx','--test','--test-timeout=900000',continuation.testFile.path]);
  assert.deepEqual(qa.steps[6].args,newArgs);passedCounts(qa.steps[6].counts,27,'Complete web retest');
  const oldRunner=bound(continuation.initialRunner).toString(),currentRunner=jsonPathText('scripts/check-ap23j3.mjs');
  assert.equal(currentRunner,oldRunner.replace("'--test-timeout=180000'","'--test-timeout=900000'"));
  assert.deepEqual(continuation.commands,qa.steps.slice(6).map(({id,command,args})=>({id,command,args})));
  assert.equal(context.stage,spfx.stage);assert.equal(context.head,proof.head);
  assert.equal(context.sourceInputsBefore.length,config.sourceInputCount);assert.equal(context.stageInputsBefore.length,config.stageInputCount);
  assert.deepEqual(continuation.sourceInputsBefore,context.sourceInputsBefore);assert.deepEqual(continuation.sourceInputsAfter,context.sourceInputsBefore);
  assert.deepEqual(continuation.stageInputsBefore,context.stageInputsBefore);assert.deepEqual(continuation.stageInputsAfter,context.stageInputsBefore);
  assert.deepEqual(continuation.webArtifactsBefore,context.webArtifactsBefore);assert.deepEqual(continuation.webArtifactsAfter,context.webArtifactsBefore);
  assert.deepEqual(continuation.unchangedEvidence,context.unchangedEvidence);
  for(const item of continuation.sourceInputsAfter)bound(item);
  for(const pair of continuation.stageInputsAfter){bound(pair.source);bound(pair.stage);assert.equal(pair.source.sha256,pair.stage.sha256);}
  for(const item of[...continuation.webArtifactsAfter,...continuation.unchangedEvidence])bound(item);
  assert.deepEqual([...continuation.webArtifactsAfter].sort((a,b)=>a.path.localeCompare(b.path)),[...web.artifacts].sort((a,b)=>a.path.localeCompare(b.path)));
  for(const value of[continuation,context]){assert.equal(value.sourceReleaseApproved,false);assert.equal(value.operatingChanges,false);}
  assert.equal(context.productChangesAllowed,false);
  const packaged=json(config.paths.packaged);assert.equal(packaged.status,'passed');assert.equal(packaged.localOnly,true);
  assert.equal(packaged.syntheticApprovalsOnly,true);assert.equal(packaged.typecheckExitCode,0);assert.deepEqual(packaged.package,spfx.testPackage);
  passedCounts(packaged.counts,config.packageCount,'Actual J3 package');passedCounts(tapCounts(bound({path:packaged.log,sha256:packaged.sha256})),config.packageCount,'Actual package TAP');
  const browser=json(config.paths.browser);assert.deepEqual(browser,proof.browser);assert.equal(browser.status,'passed');assert.equal(browser.actualLocalBuild,true);
  assert.deepEqual(browser.languages,['de','fr']);for(const key of['realDeviceTest','realM365HostTest','actualExportEnabled'])assert.equal(browser[key],false);
  assert.equal(browser.twoColumnLayout,true);assert.equal(browser.horizontalOverflow,false);assert.equal(browser.screenshots.length,config.screenshotCount);
  [browser.asset,browser.domObservation,...browser.accessibility,...browser.screenshots].forEach(bound);
  assert.ok(web.artifacts.some(item=>item.path===browser.asset.path&&item.sha256===browser.asset.sha256));
  const exported=json(config.paths.exported);assert.equal(exported.status,'passed');assert.equal(exported.qualifiedPaths,36);assert.equal(exported.qualifiedCases,44);
  assert.equal(exported.syntheticInMemoryArtifacts,88);for(const key of['actualIcsFilesSaved','outlookImports'])assert.equal(exported[key],0);
  for(const key of['humanReleaseApproval','sourceReleaseApproved','operatingChanges'])assert.equal(exported[key],false);exported.bindings.forEach(bound);
  const native=json(config.paths.native),independent=json(config.paths.independent);
  assert.equal(native.status,'passedNativeFullReferenceComparison');assert.equal(independent.status,'passedIndependentNativeComparison');
  for(const report of[native,independent]){assert.equal(report.referenceCases,config.referenceCases);report.inputs.forEach(upstream);}
  assert.equal(proof.nativeReferenceCases,config.referenceCases);assert.equal(proof.independentReferenceCases,config.referenceCases);
  assert.equal(independent.calendarEndEligibilityComparisons,2190);assert.equal(independent.calendarProbes,13);assert.equal(independent.unchangedRawArtifacts,42);
  assert.equal(independent.openingProvenanceComparisons,96);
  assert.equal(proof.calendarEndEligibilityComparisons,2190);assert.equal(proof.calendarProbes,13);assert.equal(proof.openingProvenanceComparisons,96);
  assert.equal(browser.cases.length,10);
  for(const step of proof.supplemental){assert.equal(step.exitCode,0);bound(step);}
  const guard=json(config.paths.guard),preservation=json(config.paths.preservation);
  assert.equal(guard.head,proof.head);assert.equal(preservation.head,proof.head);assert.equal(Object.keys(guard.files).length,config.protectedCount);
  assert.equal(preservation.protectedFilesVerified,config.protectedCount);assert.equal(preservation.status,'protected-integration-baselines-preserved');
  assert.equal(preservation.inventorySha256,descriptors.get(config.paths.guard).sha256);
  for(const key of['acceptedLegalDataChanged','existingTestsChanged','acceptedResearchChanged','historicalEvidenceChanged','userModifiedDocxChanged','sourceReleaseApproved','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(preservation[key],false);
  assert.equal(preservation.oldReaderAndArithmeticBytesPreserved,true);
  if(!complete){if(config.requireGitHead)assert.equal(await readHead(root),proof.head,'Git HEAD changed');
    for(const[path,hash]of Object.entries(guard.files))await readExact(root,{path,sha256:hash});
    for(const item of upstreamReferences.values())await readExact(root,item);}
  const verified=[...descriptors.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'));
  const receipt={...config.acceptance,proof:{path:config.proofPath,byteLength:proofBytes.length,sha256:config.proofSha256},head:proof.head,
    originalBindingCount:proof.bindings.length,explicitTransitivePayloads:config.supplements,
    upstreamReferencesRetainedAsMetadataNotRecursivelyExpanded:[...upstreamReferences.values()].sort((a,b)=>a.path.localeCompare(b.path,'en')),
    formats:proof.formats,counts:proof.counts,
    candidate:{manifest:proof.candidateManifest.path,releaseId:manifest.releaseId,files:config.candidateFiles},
    historicalProtectedInputsCheckedWithoutRecopy:config.protectedCount,
    upstreamInputsFreshlyCheckedWithoutRecopy:upstreamReferences.size,
    continuationInputsCopiedAutonomously:{sourceInputs:config.sourceInputCount,sourceStagePairs:config.stageInputCount,
      originalContext:config.supplementContext,additionalRawInputs:config.supplements.length,supplementListSha256:config.supplementListSha256},
    numericalEvidence:{qa:config.qaCounts,spfx:config.spfxCounts,actualPackage:config.packageCount,nativeReferences:config.referenceCases,independentReferences:config.referenceCases},
    browserScreenshotsCopied:browser.screenshots.length,browserEvidenceCopied:true,inMemoryExportEvidenceCopied:true,
    initialWebTimeoutAndCompleteSameByteRetestCopied:true,sourceTestFiles:sourceTests.length,historicalTestFiles:historicalFiles.length,artifacts:verified};
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
