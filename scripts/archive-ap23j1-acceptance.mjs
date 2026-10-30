// SPDX-License-Identifier: AGPL-3.0-only
// Exact accepted J1 research snapshot. Historical pending flags are never rewritten.
import assert from 'node:assert/strict';
import {lstat,mkdir,readdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkedPath,exact,safeRelative,sha256} from './prepare-ap23j1.mjs';
export {checkedPath,exact,safeRelative,sha256};
const output='outputs/ap23j1-2026-10-27';
export const archiveConfig=Object.freeze({
  target:'outputs/ap23j1-abnahme-2026-10-27',proofPath:output+'/local-completion.json',
  proofSha256:'36ae92089986a63dab51b23b15829f45467e3bc2c75a413fea4cca0338f12fdc',bindingCount:100,
  sourcePrefix:output+'/sources/',sourceCount:66,explicitCount:48,groups:36,groupsByCanton:{FR:11,GE:7,JU:18},
  cases:673,manualCases:78,extraCases:595,manualCounts:{dated:57,qualification:14,collision:3,window:4},
  outcomeCounts:{datedResearchValue:93,unresolvedBoundaryProposed:3,qualificationBoundaryProposed:573,researchWindowBoundary:4},
  tests:104,protectedCount:4214,calendarProbes:13,calendarDays:2190,requireGitHead:true,
  guardPath:output+'/protected-inputs.json',preservationPath:output+'/preservation-verification.json',
  referencePath:output+'/reference-verification.json',independentPath:output+'/reference-independent-verification.json',
  evidencePath:output+'/evidence-verification.json',testLog:output+'/research-checker-tests.txt',
  fixturePath:'docs/fachrecht/ap23j1/referenzfaelle.json',checkerPath:'scripts/check-ap23j1-references.mjs',
  independentCheckerPath:'scripts/check_ap23j1_independent.py',
  acceptance:{kind:'acceptedAP23J1ResearchSnapshot',acceptedOn:'2026-10-27',acceptedBy:'David Steimer',
    userStatement:'AP23J1 ist einschliesslich der Punkte J1-A bis J1-G fachlich abgenommen. Bitte starte AP23J2.',
    professionalAcceptance:true,acceptedDecisionPoints:['J1-A','J1-B','J1-C','J1-D','J1-E','J1-F','J1-G'],
    j2Started:true,formatDecision:false,implementationStarted:false,runtimeActivation:false,sourceReleaseApproved:false,
    releaseBuildPerformed:false,commitCreated:false,sourcePushPerformed:false,operatingChanges:false,
    composition:'Exact accepted J1 research, sources, static analyst references, synthetic probes and original test reports. Original pending/false flags stay historical. Previously protected inputs are verified, not recursively copied again.',
    boundaries:['Human acceptance covers J1-A through J1-G, not a new product format or implementation.',
      'J2 is local technical contract planning and isolated structure verification only.',
      'No product build, commit, push, source promotion, upload, installation, E/Q/P, permission or hosting change.']}
});
async function exists(path){try{await lstat(path);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
async function inventory(root,path=''){
  const files=[],directories=[];
  for(const item of await readdir(resolve(root,path),{withFileTypes:true})){
    const next=path?path+'/'+item.name:item.name;assert.ok(!item.isSymbolicLink(),'Symlink in archive '+next);
    if(item.isDirectory()){directories.push(next);const nested=await inventory(root,next);files.push(...nested.files);directories.push(...nested.directories);}
    else{assert.ok(item.isFile());files.push(next);}
  }return{files:files.sort(),directories:directories.sort()};
}
const flags=['professionalAcceptance','sourceReleaseApproved','formatDecision','implementationStarted','runtimeActivation',
  'productCodeChanged','schemasChanged','acceptedLegalDataChanged','existingTestsChanged','releaseBuildPerformed','commitCreated',
  'sourcePushPerformed','githubStatusPublished','operatingChanges'];
function passed(value,n){assert.equal(value.tests,n);assert.equal(value.pass,n);for(const k of['fail','cancelled','skipped','todo'])assert.equal(value[k],0,k);}
export async function archiveAcceptance({root=process.cwd(),write=false,config=archiveConfig,
  readHead=dir=>execFileSync('git',['rev-parse','HEAD'],{cwd:dir,encoding:'utf8'}).trim()}={}){
  root=resolve(root);safeRelative(config.target);await checkedPath(root,config.target,{missing:true});
  const target=resolve(root,config.target),complete=await exists(target);if(complete)assert.ok(await exists(resolve(target,'receipt.json')),'Partial archive without receipt');
  const input=complete?target:root,descriptors=new Map(),buffers=new Map();
  function add(item){safeRelative(item.path);assert.match(item.sha256,/^[a-f0-9]{64}$/u);
    if(item.byteLength!==undefined)assert.ok(Number.isSafeInteger(item.byteLength)&&item.byteLength>=0);
    const old=descriptors.get(item.path);if(old){assert.equal(old.sha256,item.sha256,'Conflicting descriptor');if(old.byteLength!==undefined&&item.byteLength!==undefined)assert.equal(old.byteLength,item.byteLength);}
    descriptors.set(item.path,{path:item.path,sha256:item.sha256,...(item.byteLength===undefined&&old?.byteLength===undefined?{}:{byteLength:item.byteLength??old.byteLength})});}
  async function bytes(path){const d=descriptors.get(path);assert.ok(d,'Unbound evidence '+path);
    if(!buffers.has(path))buffers.set(path,await exact(input,path,d.sha256));const raw=buffers.get(path);if(d.byteLength!==undefined)assert.equal(raw.length,d.byteLength);return raw;}
  const json=async path=>JSON.parse(await bytes(path));
  add({path:config.proofPath,sha256:config.proofSha256});const proof=await json(config.proofPath);
  assert.equal(proof.workPackage,'AP23J1');assert.equal(proof.status,'research-completed-awaiting-human-acceptance');
  assert.equal(proof.scopeConfirmed,true);assert.equal(proof.scopeConfirmedBy,'David Steimer');for(const key of flags)assert.equal(proof[key],false,'Historical boundary '+key);
  assert.equal(proof.bindings.length,config.bindingCount);assert.equal(new Set(proof.bindings.map(b=>b.path)).size,config.bindingCount);proof.bindings.forEach(add);
  assert.equal(proof.researchGroups,config.groups);assert.deepEqual(proof.groupsByCanton,config.groupsByCanton);
  assert.equal(proof.manualLegalReferences,config.manualCases);assert.equal(proof.extraSyntheticProbes,config.extraCases);
  assert.deepEqual(proof.manualReferenceCounts,config.manualCounts);assert.equal(proof.allResearchComparisons,config.cases);
  assert.equal(proof.independentImplementationComparisons,config.cases);assert.deepEqual(proof.counts,config.outcomeCounts);
  assert.equal(proof.calendarProbes,config.calendarProbes);assert.equal(proof.calendarEndEligibilityComparisons,config.calendarDays);assert.equal(proof.namedHolidayDateSetsEqual,true);
  passed(proof.researchCheckerTests,config.tests);assert.equal(proof.researchCheckerTests.productTests,false);
  passed(Object.fromEntries([...String(await bytes(config.testLog)).matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])])),config.tests);
  const evidence=await json(config.evidencePath),ref=await json(config.referencePath),independent=await json(config.independentPath);
  assert.equal(evidence.status,'captured-source-bytes-verified');assert.equal(evidence.inventoriedEvidenceFiles,config.sourceCount);
  assert.equal(evidence.explicitSourceBindings,config.explicitCount);assert.equal(evidence.fileInventory.length,config.sourceCount);
  assert.equal(proof.evidenceFiles,config.sourceCount);assert.equal(proof.explicitEvidenceBindings,config.explicitCount);
  assert.equal(new Set(evidence.fileInventory.map(b=>b.path)).size,config.sourceCount);
  for(const d of evidence.fileInventory){assert.ok(d.path.startsWith(config.sourcePrefix));assert.ok(descriptors.has(d.path));add(d);}
  assert.equal([...descriptors.keys()].filter(p=>p.startsWith(config.sourcePrefix)).length,config.sourceCount);
  for(const k of['professionalAcceptance','sourceReleaseApproved','productDataChanged','operatingChanges'])assert.equal(evidence[k],false);
  assert.equal(ref.status,'passedResearchComparison');assert.equal(ref.paths,config.groups);assert.equal(ref.referenceCases,config.cases);
  assert.equal(ref.results.length,config.cases);assert.deepEqual(ref.counts,config.outcomeCounts);assert.deepEqual(ref.discrepancies,[]);
  assert.equal(ref.calendarProbes,config.calendarProbes);assert.equal(ref.calendarComparisons.reduce((n,c)=>n+c.daysCompared,0),config.calendarDays);
  assert.ok(ref.calendarComparisons.every(c=>c.namedHolidayDateSetsEqual&&c.endEligibilityDifferences===0));
  assert.equal(ref.fixtureSha256,descriptors.get(config.fixturePath)?.sha256);assert.equal(ref.checkerSha256,descriptors.get(config.checkerPath)?.sha256);
  assert.equal(independent.status,'passedIndependentResearchComparison');assert.equal(independent.referenceComparisons,config.cases);
  assert.equal(independent.calendarEndEligibilityComparisons,config.calendarDays);assert.equal(independent.calendarProbes,config.calendarProbes);assert.deepEqual(independent.discrepancies,[]);
  assert.equal(independent.fixtureSha256,ref.fixtureSha256);assert.equal(independent.nodeReportSha256,descriptors.get(config.referencePath)?.sha256);
  assert.equal(independent.checkerSha256,descriptors.get(config.independentCheckerPath)?.sha256);
  for(const r of[ref,independent])for(const k of['runtimeActive','exportTest','legalApproval'])assert.equal(r[k],false);
  const fixture=await json(config.fixturePath);assert.equal(fixture.paths.length,config.groups);assert.equal(fixture.cases.length,config.cases);
  assert.equal(fixture.cases.filter(c=>c.provenance==='canton-analyst-static-reference').length,config.manualCases);
  for(const k of['runtimeActive','productTest','legalApproval'])assert.equal(fixture[k],false);
  for(const d of fixture.sourceModels){assert.ok(descriptors.has(d.path));add(d);}
  const guard=await json(config.guardPath),preservation=await json(config.preservationPath);
  assert.equal(guard.workPackage,'AP23J1');assert.equal(guard.capturedBeforeResearch,true);assert.equal(guard.capturedBeforeLivingUpdates,true);
  assert.equal(Object.keys(guard.files).length,config.protectedCount);assert.equal(preservation.protectedFilesVerified,config.protectedCount);
  assert.equal(preservation.protectedInputSha256,descriptors.get(config.guardPath)?.sha256);assert.deepEqual(preservation,proof.preservation);
  assert.equal(preservation.status,'research-inputs-preserved');assert.equal(guard.head,proof.head);assert.equal(preservation.gitHead,proof.head);
  for(const k of['productCodeChanged','acceptedLegalDataChanged','schemasChanged','existingTestsChanged','originalPreparationChanged','i3HistoricalEvidenceChanged','userDocumentChanged','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(preservation[k],false);
  assert.ok(descriptors.has(proof.readOnlyCountercheckNote));assert.equal(proof.diffWhitespaceCheckPassed,true);
  if(!complete){if(config.requireGitHead)assert.equal(await readHead(root),proof.head,'Git head changed');for(const[path,hash]of Object.entries(guard.files))await exact(root,path,hash);}
  const verified=[];for(const d of[...descriptors.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'))){const raw=await bytes(d.path);verified.push({item:{path:d.path,byteLength:raw.length,sha256:d.sha256},bytes:raw});}
  const receipt={...config.acceptance,proof:{path:config.proofPath,sha256:config.proofSha256},originalBindings:config.bindingCount,
    researchGroups:config.groups,groupsByCanton:config.groupsByCanton,manualLegalReferences:config.manualCases,extraSyntheticProbes:config.extraCases,
    allResearchComparisons:config.cases,outcomeCounts:config.outcomeCounts,originalSourceFiles:config.sourceCount,originalResearchTests:config.tests,
    calendarProbes:config.calendarProbes,calendarDays:config.calendarDays,historicalProtectedInputsCheckedWithoutRecopy:config.protectedCount,artifacts:verified.map(v=>v.item)};
  const payload=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
  if(complete){assert.deepEqual(await exact(target,'receipt.json'),payload,'Receipt does not match accepted snapshot');
    const actual=await inventory(target),expected=[...descriptors.keys(),'receipt.json'].sort(),directories=new Set();
    for(const file of expected){let path=dirname(file);while(path!=='.'){directories.add(path);path=dirname(path);}}
    assert.deepEqual(actual.files,expected,'Unexpected archive files');assert.deepEqual(actual.directories,[...directories].sort(),'Unexpected archive directories');
  }else if(write){await mkdir(dirname(target),{recursive:true});await mkdir(target);
    for(const{item,bytes:raw}of verified){await checkedPath(target,item.path,{missing:true});await mkdir(dirname(resolve(target,item.path)),{recursive:true});await checkedPath(target,item.path,{missing:true});await writeFile(resolve(target,item.path),raw,{flag:'wx'});await exact(target,item.path,item.sha256);}
    await writeFile(resolve(target,'receipt.json'),payload,{flag:'wx'});}
  return{verified:true,target:config.target,mode:complete?'archive-reverified':write?'archive-created':'source-preflight-only',files:verified.length,
    sourceFiles:config.sourceCount,payloadBytes:verified.reduce((n,v)=>n+v.bytes.length,0),historicalProtectedInputsNotRecopied:config.protectedCount,
    receiptSha256:sha256(payload),receiptByteLength:payload.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(a=>a==='--write'||a==='--check'));assert.ok(!(process.argv.includes('--write')&&process.argv.includes('--check')));
  console.log(JSON.stringify(await archiveAcceptance({write:process.argv.includes('--write')}),null,2));
}
