// SPDX-License-Identifier: AGPL-3.0-only
// Exact accepted K1 snapshot. Never rewrite historical pending flags.
import assert from 'node:assert/strict';
import {lstat,mkdir,readdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkedPath,exact,safeRelative,sha256} from './prepare-ap23k1.mjs';
export {checkedPath,exact,safeRelative,sha256};
const output='outputs/ap23k1-2026-10-27';
export const archiveConfig=Object.freeze({
  target:'outputs/ap23k1-abnahme-2026-10-27',proofPath:output+'/local-completion.json',
  proofSha256:'0f77e1b6921d670e1e8f957711ee885a3fc60c0f4efce5a4eb84c53c8595ceb2',bindingCount:121,
  sourcePrefix:output+'/sources/',sourceCount:92,explicitCount:69,groups:16,groupsByCanton:{BS:8,BL:8},
  cases:67,outcomeCounts:{datedResearchValue:42,qualificationBoundaryProposed:18,unresolvedBoundaryProposed:2,researchWindowBoundary:5},
  tests:107,protectedCount:6367,calendarProbes:11,calendarDays:2190,calendarBaselines:3,requireGitHead:true,
  guardPath:output+'/protected-inputs.json',preservationPath:output+'/preservation-verification.json',
  referencePath:output+'/reference-verification.json',independentPath:output+'/reference-independent-verification.json',
  evidencePath:output+'/evidence-verification.json',testLog:output+'/research-checker-tests.txt',
  fixturePath:'docs/fachrecht/ap23k1/referenzfaelle.json',checkerPath:'scripts/check-ap23k1-references.mjs',independentCheckerPath:'scripts/check-ap23k1-references.py',
  acceptance:{kind:'acceptedAP23K1ResearchSnapshot',acceptedOn:'2026-10-27',acceptedBy:'David Steimer',
    userStatement:'AP23K1 ist einschliesslich der Punkte K1-A bis K1-G fachlich abgenommen. Bitte starte AP23K2.',
    professionalAcceptance:true,acceptedDecisionPoints:['K1-A','K1-B','K1-C','K1-D','K1-E','K1-F','K1-G'],
    k2Started:true,formatDecision:false,implementationStarted:false,runtimeActivation:false,sourceReleaseApproved:false,
    releaseBuildPerformed:false,commitCreated:false,sourcePushPerformed:false,operatingChanges:false,
    composition:'Exact K1 research bytes plus the three explicitly referenced raw calendar baselines. No recursive copy of historical protected inputs. Original pending flags remain historical.',
    boundaries:['K1-A through K1-G accepted by the human decision maker.',
      'K2 is local contract planning and isolated structure verification, not native integration.',
      'No format decision, product build, commit, push, upload, installation or operating permission.']}
});
export const historicalFlags=['professionalAcceptance','sourceReleaseApproved','formatDecision','implementationStarted','runtimeActivation',
  'productCodeChanged','schemasChanged','acceptedLegalDataChanged','existingTestsChanged','releaseBuildPerformed','commitCreated',
  'sourcePushPerformed','githubStatusPublished','operatingChanges'];
async function exists(path){try{await lstat(path);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
async function inventory(root,path=''){
  const files=[],directories=[];
  for(const item of await readdir(resolve(root,path),{withFileTypes:true})){
    const next=path?path+'/'+item.name:item.name;assert.ok(!item.isSymbolicLink(),'Symlink in archive '+next);
    if(item.isDirectory()){directories.push(next);const nested=await inventory(root,next);files.push(...nested.files);directories.push(...nested.directories);}
    else{assert.ok(item.isFile());files.push(next);}
  }return{files:files.sort(),directories:directories.sort()};
}
function passed(value,n){assert.equal(value.tests,n);assert.equal(value.pass,n);for(const k of ['fail','cancelled','skipped','todo'])assert.equal(value[k],0,k);}
export async function archiveAcceptance({root=process.cwd(),write=false,config=archiveConfig,
  readHead=dir=>execFileSync('git',['rev-parse','HEAD'],{cwd:dir,encoding:'utf8'}).trim()}={}){
  root=resolve(root);safeRelative(config.target);await checkedPath(root,config.target,{missing:true});
  const target=resolve(root,config.target),complete=await exists(target);
  if(complete)assert.ok(await exists(resolve(target,'receipt.json')),'Partial archive without receipt');
  const input=complete?target:root,descriptors=new Map(),buffers=new Map(),extra=[];
  function add(item){
    safeRelative(item.path);assert.match(item.sha256,/^[a-f0-9]{64}$/u);
    if(item.byteLength!==undefined)assert.ok(Number.isSafeInteger(item.byteLength)&&item.byteLength>0);
    const old=descriptors.get(item.path);if(old){assert.equal(old.sha256,item.sha256,'Conflicting descriptor');
      if(old.byteLength!==undefined&&item.byteLength!==undefined)assert.equal(old.byteLength,item.byteLength);}
    descriptors.set(item.path,{path:item.path,sha256:item.sha256,...(item.byteLength===undefined&&old?.byteLength===undefined?{}:{byteLength:item.byteLength??old.byteLength})});
  }
  async function bytes(path){const d=descriptors.get(path);assert.ok(d,'Unbound evidence '+path);
    if(!buffers.has(path))buffers.set(path,await exact(input,path,d.sha256));const raw=buffers.get(path);
    if(d.byteLength!==undefined)assert.equal(raw.length,d.byteLength);return raw;}
  const json=async path=>JSON.parse(await bytes(path));
  add({path:config.proofPath,sha256:config.proofSha256});const proof=await json(config.proofPath);
  assert.equal(proof.workPackage,'AP23K1');assert.equal(proof.status,'research-completed-awaiting-human-acceptance');
  assert.equal(proof.scopeConfirmed,true);assert.equal(proof.scopeConfirmedBy,'David Steimer');
  for(const key of historicalFlags)assert.equal(proof[key],false,'Historical boundary '+key);
  assert.equal(proof.bindings.length,config.bindingCount);assert.equal(new Set(proof.bindings.map(b=>b.path)).size,config.bindingCount);proof.bindings.forEach(add);
  assert.equal(proof.researchGroups,config.groups);assert.deepEqual(proof.groupsByCanton,config.groupsByCanton);
  assert.equal(proof.manualLegalReferences,config.cases);assert.equal(proof.independentImplementationComparisons,config.cases);
  assert.deepEqual(proof.researchResultCounts,config.outcomeCounts);assert.equal(proof.calendarProbes,config.calendarProbes);
  assert.equal(proof.calendarEndEligibilityComparisons,config.calendarDays);assert.equal(proof.diffWhitespaceCheckPassed,true);
  passed(proof.researchCheckerTests,config.tests);assert.equal(proof.researchCheckerTests.productTests,false);
  passed(Object.fromEntries([...String(await bytes(config.testLog)).matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])])),config.tests);
  const evidence=await json(config.evidencePath),ref=await json(config.referencePath),independent=await json(config.independentPath);
  assert.equal(evidence.status,'captured-source-bytes-verified');assert.equal(evidence.inventoriedEvidenceFiles,config.sourceCount);
  assert.equal(evidence.explicitSourceBindings,config.explicitCount);assert.equal(evidence.fileInventory.length,config.sourceCount);
  assert.equal(proof.evidenceFiles,config.sourceCount);assert.equal(proof.explicitEvidenceBindings,config.explicitCount);
  assert.equal(new Set(evidence.fileInventory.map(d=>d.path)).size,config.sourceCount);
  for(const d of evidence.fileInventory){assert.ok(d.path.startsWith(config.sourcePrefix));assert.ok(descriptors.has(d.path));add(d);}
  assert.equal([...descriptors.keys()].filter(path=>path.startsWith(config.sourcePrefix)).length,config.sourceCount);
  for(const key of ['professionalAcceptance','sourceReleaseApproved','productDataChanged','operatingChanges'])assert.equal(evidence[key],false);
  assert.equal(ref.status,'passedResearchComparison');assert.equal(ref.paths,config.groups);assert.equal(ref.referenceCases,config.cases);
  assert.equal(ref.handSpecifiedReferences,config.cases);assert.equal(ref.results.length,config.cases);assert.deepEqual(ref.counts,config.outcomeCounts);
  assert.deepEqual(ref.discrepancies,[]);assert.equal(ref.calendarProbes,config.calendarProbes);
  assert.equal(ref.calendarComparisons.reduce((n,c)=>n+c.daysCompared,0),config.calendarDays);
  assert.ok(ref.calendarComparisons.every(c=>c.weekdayDateSetsEqual&&c.officeClosuresExcluded));
  assert.equal(ref.fixtureSha256,descriptors.get(config.fixturePath)?.sha256);assert.equal(ref.checkerSha256,descriptors.get(config.checkerPath)?.sha256);
  assert.equal(independent.status,'passedIndependentResearchComparison');assert.equal(independent.referenceComparisons,config.cases);
  assert.equal(independent.calendarEndEligibilityComparisons,config.calendarDays);assert.equal(independent.calendarProbes,config.calendarProbes);
  assert.deepEqual(independent.discrepancies,[]);assert.equal(independent.fixtureSha256,ref.fixtureSha256);
  assert.equal(independent.nodeReportSha256,descriptors.get(config.referencePath)?.sha256);assert.equal(independent.checkerSha256,descriptors.get(config.independentCheckerPath)?.sha256);
  for(const report of [ref,independent])for(const key of ['runtimeActive','exportTest','legalApproval'])assert.equal(report[key],false);
  const fixture=await json(config.fixturePath);assert.equal(fixture.paths.length,config.groups);assert.equal(fixture.cases.length,config.cases);
  assert.equal(fixture.cases.filter(c=>c.provenance==='canton-analyst-static-reference').length,config.cases);
  for(const key of ['runtimeActive','productTest','exportTest','legalApproval'])assert.equal(fixture[key],false);
  for(const d of fixture.sourceModels){assert.ok(descriptors.has(d.path));add(d);}
  assert.equal(fixture.calendarBaselines.length,config.calendarBaselines);
  for(const d of fixture.calendarBaselines){if(!descriptors.has(d.path))extra.push(d.path);add(d);}
  const guard=await json(config.guardPath),preservation=await json(config.preservationPath);
  assert.equal(guard.workPackage,'AP23K1');assert.equal(guard.capturedBeforeResearch,true);assert.equal(guard.capturedBeforeLivingUpdates,true);
  assert.equal(Object.keys(guard.files).length,config.protectedCount);assert.equal(preservation.protectedFilesVerified,config.protectedCount);
  assert.equal(preservation.protectedInputSha256,descriptors.get(config.guardPath)?.sha256);assert.deepEqual(preservation,proof.preservation);
  assert.equal(preservation.status,'research-inputs-preserved');assert.equal(guard.head,proof.head);assert.equal(preservation.gitHead,proof.head);
  for(const key of ['productCodeChanged','acceptedLegalDataChanged','schemasChanged','existingTestsChanged','originalPreparationChanged',
    'j3HistoricalEvidenceChanged','userDocumentChanged','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(preservation[key],false);
  assert.ok(descriptors.has(proof.readOnlyCountercheckNote));
  if(!complete){if(config.requireGitHead)assert.equal(await readHead(root),proof.head,'Git head changed');
    for(const[path,hash]of Object.entries(guard.files))await exact(root,path,hash);}
  const verified=[];
  for(const d of [...descriptors.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'))){const raw=await bytes(d.path);
    verified.push({item:{path:d.path,byteLength:raw.length,sha256:d.sha256},bytes:raw});}
  const receipt={...config.acceptance,proof:{path:config.proofPath,sha256:config.proofSha256},originalBindings:config.bindingCount,
    explicitTransitiveCalendarPayloads:extra.sort(),researchGroups:config.groups,groupsByCanton:config.groupsByCanton,
    manualLegalReferences:config.cases,outcomeCounts:config.outcomeCounts,originalSourceFiles:config.sourceCount,
    originalResearchTests:config.tests,calendarProbes:config.calendarProbes,calendarDays:config.calendarDays,
    historicalProtectedInputsCheckedWithoutRecopy:config.protectedCount,artifacts:verified.map(v=>v.item)};
  const payload=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
  if(complete){assert.deepEqual(await exact(target,'receipt.json'),payload,'Receipt differs from accepted snapshot');
    const actual=await inventory(target),expected=[...descriptors.keys(),'receipt.json'].sort(),directories=new Set();
    for(const file of expected){let path=dirname(file);while(path!=='.'){directories.add(path);path=dirname(path);}}
    assert.deepEqual(actual.files,expected,'Unexpected archive files');assert.deepEqual(actual.directories,[...directories].sort(),'Unexpected archive directories');
  }else if(write){await mkdir(dirname(target),{recursive:true});await mkdir(target);
    for(const{item,bytes:raw}of verified){await checkedPath(target,item.path,{missing:true});await mkdir(dirname(resolve(target,item.path)),{recursive:true});
      await checkedPath(target,item.path,{missing:true});await writeFile(resolve(target,item.path),raw,{flag:'wx'});await exact(target,item.path,item.sha256);}
    await writeFile(resolve(target,'receipt.json'),payload,{flag:'wx'});}
  return{verified:true,target:config.target,mode:complete?'archive-reverified':write?'archive-created':'source-preflight-only',
    files:verified.length,originalBindings:config.bindingCount,explicitTransitiveCalendarPayloads:extra.length,sourceFiles:config.sourceCount,
    payloadBytes:verified.reduce((n,v)=>n+v.bytes.length,0),historicalProtectedInputsNotRecopied:config.protectedCount,
    receiptSha256:sha256(payload),receiptByteLength:payload.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(arg=>arg==='--write'||arg==='--check'));assert.ok(!(process.argv.includes('--write')&&process.argv.includes('--check')));
  console.log(JSON.stringify(await archiveAcceptance({write:process.argv.includes('--write')}),null,2));
}
