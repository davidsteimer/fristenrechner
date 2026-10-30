// SPDX-License-Identifier: AGPL-3.0-only
// Exact accepted research snapshot. Original pending/false flags remain historical.
import assert from 'node:assert/strict';
import {lstat,mkdir,readdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkedPath,exact,safeRelative,sha256} from './prepare-ap23i1.mjs';
export {checkedPath,exact,safeRelative,sha256};
const output='outputs/ap23i1-2026-10-22';
export const archiveConfig=Object.freeze({
  target:'outputs/ap23i1-abnahme-2026-10-22',proofPath:output+'/local-completion.json',
  proofSha256:'6682f9394d03a2439293863c6493766b34cf2e14ef14a9b6367a2782fafb1991',
  bindingCount:132,sourcePrefix:output+'/sources/',sourceCount:99,explicitCount:98,metadataCount:7,
  groups:34,groupsByCanton:{GL:19,TG:15},cases:249,calendarProbes:15,calendarDays:1460,
  outcomeCounts:{datedResearchValue:110,unresolvedBoundaryProposed:16,qualificationBoundaryProposed:117,researchWindowBoundary:6},
  tests:116,referenceTests:70,governanceTests:46,protectedCount:2496,requireGitHead:true,
  guardPath:output+'/protected-inputs.json',preservationPath:output+'/preservation-verification.json',
  referencePath:output+'/reference-verification.json',independentPath:output+'/reference-independent-verification.json',
  evidencePath:output+'/evidence-verification.json',testLog:output+'/research-checker-tests.txt',
  cardPath:output+'/project-card-status.json',fixturePath:'docs/fachrecht/ap23i1/referenzfaelle.json',
  checkerPath:'scripts/check-ap23i1-references.mjs',independentCheckerPath:'scripts/check_ap23i1_independent.py',
  acceptance:{kind:'acceptedAP23I1ResearchSnapshot',acceptedOn:'2026-10-22',acceptedBy:'David Steimer',
    userStatement:'AP23I1 ist einschliesslich der Punkte I1-A bis I1-G fachlich abgenommen. Bitte starte AP23I2.',
    professionalAcceptance:true,acceptedDecisionPoints:['I1-A','I1-B','I1-C','I1-D','I1-E','I1-F','I1-G'],
    i2Started:true,formatDecision:false,implementationStarted:false,runtimeActivation:false,
    sourceReleaseApproved:false,releaseBuildPerformed:false,commitCreated:false,sourcePushPerformed:false,operatingChanges:false,
    composition:'Exact accepted I1 research sources, reports, proposed groups, references and original test evidence. Original pending/false flags are not relabelled. Historical protected inputs are verified before capture but not recursively recopied.',
    boundaries:['Human professional acceptance covers I1-A through I1-G, not a new technical format decision or runtime integration.',
      'I2 is authorised as local technical planning and isolated contract research only.',
      'No product build, commit, push, source promotion, upload, installation, E/Q/P, permission or hosting change.']}
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
function passedCounts(value,expected){
  assert.equal(value.tests,expected,'Unexpected test count');assert.equal(value.pass,expected,'Not all tests passed');
  for(const key of['fail','cancelled','skipped','todo'])assert.equal(value[key],0,'Non-passing tests: '+key);
}
export async function archiveAcceptance({root=process.cwd(),write=false,config=archiveConfig,
  readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
  root=resolve(root);safeRelative(config.target);await checkedPath(root,config.target,{missing:true});
  const target=resolve(root,config.target),complete=await exists(target);
  if(complete)assert.ok(await exists(resolve(target,'receipt.json')),'Partial archive without receipt');
  const input=complete?target:root,descriptors=new Map(),buffers=new Map();
  function add(item){
    safeRelative(item.path);assert.match(item.sha256,/^[a-f0-9]{64}$/u,'Invalid descriptor hash');
    if(item.byteLength!==undefined)assert.ok(Number.isSafeInteger(item.byteLength)&&item.byteLength>=0,'Invalid descriptor length');
    const prior=descriptors.get(item.path);
    if(prior){assert.equal(prior.sha256,item.sha256,'Conflicting descriptor: '+item.path);
      if(prior.byteLength!==undefined&&item.byteLength!==undefined)assert.equal(prior.byteLength,item.byteLength,'Conflicting descriptor length');}
    descriptors.set(item.path,{path:item.path,sha256:item.sha256,...(item.byteLength===undefined&&prior?.byteLength===undefined?{}:{byteLength:item.byteLength??prior.byteLength})});
  }
  async function bytes(path){
    const item=descriptors.get(path);assert.ok(item,'Unbound report or evidence: '+path);
    if(!buffers.has(path))buffers.set(path,await exact(input,path,item.sha256));
    const value=buffers.get(path);if(item.byteLength!==undefined)assert.equal(value.length,item.byteLength,'Byte length mismatch: '+path);return value;
  }
  const json=async path=>JSON.parse(await bytes(path));
  add({path:config.proofPath,sha256:config.proofSha256});const proof=await json(config.proofPath);
  assert.equal(proof.workPackage,'AP23I1');assert.equal(proof.status,'research-completed-awaiting-human-acceptance');
  assert.equal(proof.scopeConfirmed,true);assert.equal(proof.scopeConfirmedBy,'David Steimer');
  for(const key of['professionalAcceptance','sourceReleaseApproved','formatDecision','implementationStarted','runtimeActivation','productCodeChanged','schemasChanged','acceptedLegalDataChanged','existingTestsChanged','releaseBuildPerformed','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(proof[key],false,'Historical boundary '+key);
  assert.equal(proof.bindings.length,config.bindingCount,'Unexpected I1 binding count');
  assert.equal(new Set(proof.bindings.map(x=>x.path)).size,proof.bindings.length,'Duplicate primary binding');proof.bindings.forEach(add);
  assert.equal(proof.researchGroups,config.groups);assert.deepEqual(proof.groupsByCanton,config.groupsByCanton);
  assert.equal(proof.researchCases,config.cases);assert.deepEqual(proof.counts,config.outcomeCounts);
  assert.equal(proof.independentReferenceComparisons,config.cases);assert.equal(proof.calendarProbes,config.calendarProbes);
  assert.equal(proof.calendarEndEligibilityComparisons,config.calendarDays);
  passedCounts(proof.researchCheckerTests,config.tests);assert.equal(proof.researchCheckerTests.reference,config.referenceTests);
  assert.equal(proof.researchCheckerTests.governance,config.governanceTests);assert.equal(proof.researchCheckerTests.productTests,false);
  const taps=Object.fromEntries([...String(await bytes(config.testLog)).matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));passedCounts(taps,config.tests);
  const evidence=await json(config.evidencePath),reference=await json(config.referencePath),independent=await json(config.independentPath);
  assert.equal(evidence.status,'research-source-bindings-verified');assert.equal(evidence.inventoriedEvidenceFiles,config.sourceCount);
  assert.equal(evidence.explicitEvidenceBindingsVerified,config.explicitCount);assert.equal(evidence.fileInventory.length,config.sourceCount);
  assert.equal(evidence.officialCantonMetadataChecks.length,config.metadataCount);
  assert.equal(proof.evidenceFiles,config.sourceCount);assert.equal(proof.explicitEvidenceBindings,config.explicitCount);assert.equal(proof.officialMetadataChecks,config.metadataCount);
  assert.equal(new Set(evidence.fileInventory.map(x=>x.path)).size,config.sourceCount,'Duplicate source inventory');
  for(const item of evidence.fileInventory){assert.ok(item.path.startsWith(config.sourcePrefix),'Out-of-scope research source');assert.ok(descriptors.has(item.path),'Source absent from original bindings');add(item);}
  assert.equal([...descriptors.keys()].filter(x=>x.startsWith(config.sourcePrefix)).length,config.sourceCount,'Incomplete source-byte inventory');
  for(const key of['professionalAcceptance','sourceReleaseApproved','runtimeActive','operatingChanges'])assert.equal(evidence[key],false,'Evidence boundary '+key);
  assert.equal(reference.status,'passedResearchComparison');assert.equal(reference.referenceCases,config.cases);assert.equal(reference.paths,config.groups);
  assert.deepEqual(reference.counts,config.outcomeCounts);assert.equal(reference.results.length,config.cases);assert.deepEqual(reference.discrepancies,[]);
  assert.equal(reference.calendarProbes,config.calendarProbes);assert.equal(reference.calendarComparisons.reduce((n,c)=>n+c.daysCompared,0),config.calendarDays);
  assert.equal(reference.fixtureSha256,descriptors.get(config.fixturePath)?.sha256);assert.equal(reference.checkerSha256,descriptors.get(config.checkerPath)?.sha256);
  assert.equal(independent.status,'passedIndependentResearchComparison');assert.equal(independent.referenceComparisons,config.cases);
  assert.equal(independent.calendarEndEligibilityComparisons,config.calendarDays);assert.equal(independent.calendarProbes,config.calendarProbes);assert.deepEqual(independent.discrepancies,[]);
  assert.equal(independent.fixtureSha256,reference.fixtureSha256);assert.equal(independent.nodeReportSha256,descriptors.get(config.referencePath)?.sha256);
  assert.equal(independent.checkerSha256,descriptors.get(config.independentCheckerPath)?.sha256);
  for(const value of[reference,independent])for(const key of['runtimeActive','exportTest','legalApproval'])assert.equal(value[key],false,'Research reference boundary '+key);
  const fixture=await json(config.fixturePath);assert.equal(fixture.paths.length,config.groups);assert.equal(fixture.cases.length,config.cases);
  for(const key of['runtimeActive','productTest','legalApproval'])assert.equal(fixture[key],false);
  for(const item of fixture.sourceModels){assert.ok(descriptors.has(item.path),'Unbound source model');add(item);}
  const guard=await json(config.guardPath),preservation=await json(config.preservationPath),card=await json(config.cardPath);
  assert.equal(guard.workPackage,'AP23I1');assert.equal(guard.capturedBeforeResearch,true);assert.equal(guard.capturedBeforeLivingUpdates,true);
  assert.equal(Object.keys(guard.files).length,config.protectedCount);assert.equal(preservation.protectedFilesVerified,config.protectedCount);
  assert.equal(preservation.protectedInputSha256,descriptors.get(config.guardPath)?.sha256);assert.deepEqual(preservation,proof.preservation);
  assert.equal(preservation.status,'research-inputs-preserved');assert.equal(guard.head,proof.head);assert.equal(preservation.gitHead,proof.head);
  for(const key of['productCodeChanged','acceptedLegalDataChanged','schemasChanged','existingTestsChanged','originalPreparationChanged','h3HistoricalEvidenceChanged','userDocumentChanged','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(preservation[key],false,'Preservation boundary '+key);
  assert.deepEqual(card,proof.projectCardStatus);
  for(const key of['liveReadPerformed','publicUpdatePerformed','sourcePublicationPerformed','professionalAcceptance','i2Started','i3Started'])assert.equal(card[key],false,'Historical card boundary '+key);
  assert.equal(card.noRemoteWritePerformed,true);
  for(const item of proof.aiReadOnlyCountercheck.reviewedDocuments){assert.equal(descriptors.get(item.path)?.sha256,item.sha256,'Reviewed text is not bound');}
  assert.equal(proof.aiReadOnlyCountercheck.reportedBlockingFindings,0);assert.equal(proof.diffWhitespaceCheckPassed,true);
  if(!complete){
    if(config.requireGitHead)assert.equal(await readHead(root),proof.head,'Git head changed');
    for(const[path,hash]of Object.entries(guard.files))await exact(root,path,hash);
  }
  const verified=[];
  for(const item of[...descriptors.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'))){const value=await bytes(item.path);verified.push({item:{path:item.path,byteLength:value.length,sha256:item.sha256},bytes:value});}
  const receipt={...config.acceptance,proof:{path:config.proofPath,sha256:config.proofSha256},originalBindings:proof.bindings.length,
    researchGroups:config.groups,groupsByCanton:config.groupsByCanton,researchCases:config.cases,outcomeCounts:config.outcomeCounts,
    originalSourceFiles:config.sourceCount,originalResearchTests:config.tests,calendarProbes:config.calendarProbes,calendarDays:config.calendarDays,
    historicalProtectedInputsCheckedWithoutRecopy:config.protectedCount,artifacts:verified.map(x=>x.item)};
  const payload=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
  if(complete){
    assert.deepEqual(await exact(target,'receipt.json'),payload,'Receipt is not the exact derived acceptance record');
    const current=await inventory(target),expectedFiles=[...descriptors.keys(),'receipt.json'].sort(),expectedDirectories=new Set();
    for(const file of expectedFiles){let path=dirname(file);while(path!=='.'){expectedDirectories.add(path);path=dirname(path);}}
    assert.deepEqual(current.files,expectedFiles,'Unexpected archive files');assert.deepEqual(current.directories,[...expectedDirectories].sort(),'Unexpected archive directories');
  }else if(write){
    await checkedPath(root,config.target,{missing:true});await mkdir(dirname(target),{recursive:true});await mkdir(target);
    for(const{item,bytes:value}of verified){await checkedPath(target,item.path,{missing:true});await mkdir(dirname(resolve(target,item.path)),{recursive:true});await checkedPath(target,item.path,{missing:true});await writeFile(resolve(target,item.path),value,{flag:'wx'});await exact(target,item.path,item.sha256);}
    await writeFile(resolve(target,'receipt.json'),payload,{flag:'wx'});
  }
  return{verified:true,target:config.target,mode:complete?'archive-reverified':write?'archive-created':'source-preflight-only',
    files:verified.length,sourceFiles:config.sourceCount,payloadBytes:verified.reduce((n,v)=>n+v.bytes.length,0),
    historicalProtectedInputsNotRecopied:config.protectedCount,receiptSha256:sha256(payload),receiptByteLength:payload.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(arg=>arg==='--write'||arg==='--check'),'Only --write or --check');
  assert.ok(!(process.argv.includes('--write')&&process.argv.includes('--check')),'Choose exactly one mode');
  console.log(JSON.stringify(await archiveAcceptance({write:process.argv.includes('--write')}),null,2));
}
