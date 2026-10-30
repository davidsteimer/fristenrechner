// SPDX-License-Identifier: AGPL-3.0-only
// Separate human acceptance. Historical M1 bytes and pending flags never change.
import assert from 'node:assert/strict';
import {lstat,mkdir,readdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkedPath,exact,safeRelative,sha256} from './prepare-ap23m1.mjs';
export {checkedPath,exact,safeRelative,sha256};
export const historicalFlags=Object.freeze(['professionalAcceptance','sourceReleaseApproved','formatDecision','m2Started','m3Started',
 'productCodeChanged','acceptedLegalDataChanged','calendarChanged','schemasChanged','existingTestsChanged','productBuilt',
 'commitCreated','sourcePushPerformed','githubStatusPublished','installationPerformed','operatingChanges','calendarExportEnabled']);
export const acceptance=Object.freeze({kind:'acceptedAP23M1ResearchSnapshot',acceptedOn:'2026-10-28',acceptedBy:'David Steimer',
 userStatement:'AP23M1 ist einschliesslich M1 A bis M1 G, der 49 Gruppen, der Kalenderbindungen, des Zeitfensters und der begrenzten Behandlung der offenen Punkte fachlich abgenommen. Bitte starte AP23M2.',
 professionalAcceptance:true,acceptedDecisionPoints:['M1-A','M1-B','M1-C','M1-D','M1-E','M1-F','M1-G'],
 calendarBindingsAccepted:true,windowAccepted:true,limitedBoundaryTreatmentAccepted:true,m2Started:true,
 formatDecision:false,implementationStarted:false,runtimeActivation:false,sourceReleaseApproved:false,releaseBuildPerformed:false,
 commitCreated:false,sourcePushPerformed:false,operatingChanges:false,acceptedCantons:23,operationalCantons:6,localOnlyAcceptedCantons:17,
 scope:'Exact M1 research bytes, original completion and explicitly referenced calendar baselines. No recursive historical archive copy. Human M1 acceptance is separate from historical false flags and does not approve a new format, native integration, source release or operation.'});
const base='outputs/ap23m1-2026-10-27';
export const archiveConfig=Object.freeze({target:'outputs/ap23m1-abnahme-2026-10-28',proofPath:base+'/local-completion.json',
 proofSha256:'6094e2fed3f07fb9db15556c75adcfa3a52301a52170ad276f67bdca90611368',bindingCount:109,protectedCount:11212,
 paths:49,groupsByCanton:{NE:16,VD:19,VS:14},cases:109,sourceCount:64,sourceBytes:22234913,tests:124,calendarBaselines:4,calendarDays:2920,calendarProbes:3,
 outcomes:{datedResearchValue:73,qualificationBoundaryProposed:27,unresolvedBoundaryProposed:3,researchWindowBoundary:6},
 guardPath:base+'/protected-inputs.json',guardSha256:'51ab033044ec8c0c6424b0d7f5eac17a85c7b01836d5febc3c8ae1770ce8e610',
 preservationPath:base+'/preservation-verification.json',testLog:base+'/research-tests.txt',fixturePath:'docs/fachrecht/ap23m1/referenzfaelle.json',
 referencePath:base+'/reference-verification.json',independentPath:base+'/independent-verification.json',requireGitHead:true});
async function exists(path){try{await lstat(path);return true;}catch(error){if(error.code==='ENOENT')return false;throw error;}}
async function inventory(root,path=''){
 const files=[],directories=[];
 for(const entry of await readdir(resolve(root,path),{withFileTypes:true})){
  const next=path?path+'/'+entry.name:entry.name;assert.ok(!entry.isSymbolicLink(),'Archive symlink '+next);
  if(entry.isDirectory()){directories.push(next);const nested=await inventory(root,next);files.push(...nested.files);directories.push(...nested.directories);}
  else{assert.ok(entry.isFile());files.push(next);}
 }return{files:files.sort(),directories:directories.sort()};
}
function counts(log){return Object.fromEntries([...String(log).matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gmu)].map(match=>[match[1],Number(match[2])]));}
export async function archiveAcceptance({root=process.cwd(),write=false,config=archiveConfig,
 readHead=path=>execFileSync('git',['rev-parse','HEAD'],{cwd:path,encoding:'utf8'}).trim()}={}){
 root=resolve(root);safeRelative(config.target);await checkedPath(root,config.target,{missing:true});
 const target=resolve(root,config.target),complete=await exists(target);
 if(complete)assert.ok(await exists(resolve(target,'receipt.json')),'Partial archive without receipt');
 const input=complete?target:root,descriptors=new Map(),buffers=new Map(),extra=[];
 function add(row){safeRelative(row.path);assert.match(row.sha256,/^[a-f0-9]{64}$/u);
  if(row.byteLength!==undefined)assert.ok(Number.isSafeInteger(row.byteLength)&&row.byteLength>=0);
  const prior=descriptors.get(row.path);if(prior){assert.equal(prior.sha256,row.sha256,'Conflicting bound descriptor');
   if(prior.byteLength!==undefined&&row.byteLength!==undefined)assert.equal(prior.byteLength,row.byteLength);}
  descriptors.set(row.path,{path:row.path,sha256:row.sha256,...(row.byteLength===undefined?{}:{byteLength:row.byteLength})});}
 async function bytes(path){const row=descriptors.get(path);assert.ok(row,'Unbound archive dependency '+path);
  if(!buffers.has(path))buffers.set(path,await exact(input,path,row.sha256));const raw=buffers.get(path);
  if(row.byteLength!==undefined)assert.equal(raw.length,row.byteLength,'Bound byte length '+path);return raw;}
 const json=async path=>JSON.parse(await bytes(path));
 add({path:config.proofPath,sha256:config.proofSha256});const proof=await json(config.proofPath);
 assert.equal(proof.workPackage,'AP23M1');assert.equal(proof.status,'local-research-verified-awaiting-human-acceptance');
 assert.equal(proof.scopeConfirmed,true);assert.equal(proof.professionalStepStarted,true);
 for(const flag of historicalFlags)assert.equal(proof[flag],false,'Historical boundary '+flag);
 for(const flag of['realDeviceTest','m365HostTest','legalInterpretationAutomaticallyValidated'])assert.equal(proof[flag],false,flag);
 assert.equal(proof.icsFilesCreated,0);assert.equal(proof.outlookImports,0);
 assert.equal(proof.bindings.length,config.bindingCount);assert.equal(new Set(proof.bindings.map(row=>row.path)).size,config.bindingCount);
 for(const row of proof.bindings)add(row);
 for(const[key,value]of Object.entries({pathProposals:config.paths,references:config.cases,sourceFiles:config.sourceCount,sourceBytes:config.sourceBytes,
  researchTests:config.tests,protectedFiles:config.protectedCount,calendarEndEligibilityComparisons:config.calendarDays,calendarProbes:config.calendarProbes}))assert.equal(proof[key],value,key);
 assert.deepEqual(proof.pathProposalsByCanton,config.groupsByCanton);assert.deepEqual(proof.referenceOutcomes,config.outcomes);
 assert.deepEqual(proof.window,{from:'2026-08-29',to:'2027-12-31'});assert.deepEqual(proof.currentFormats,{administrativeCatalog:'9.0.0',manifest:'16.0.0',minimumConsumer:'16.0.0'});
 const tap=counts(await bytes(config.testLog));assert.equal(tap.tests,config.tests);assert.equal(tap.pass,config.tests);
 for(const key of['fail','cancelled','skipped','todo'])assert.equal(tap[key],0,key);
 const fixture=await json(config.fixturePath),ref=await json(config.referencePath),independent=await json(config.independentPath);
 assert.equal(fixture.paths.length,config.paths);assert.equal(fixture.cases.length,config.cases);assert.equal(fixture.calendarBaselines.length,config.calendarBaselines);
 for(const flag of['runtimeActive','productTest','legalApproval','exportTest'])assert.equal(fixture[flag],false,flag);
 assert.equal(ref.status,'research-references-verified');assert.equal(ref.fixtureSha256,descriptors.get(config.fixturePath).sha256);
 assert.equal(ref.paths,config.paths);assert.equal(ref.cases,config.cases);assert.equal(ref.results.length,config.cases);assert.deepEqual(ref.discrepancies,[]);
 assert.equal(independent.status,'passedIndependentResearchComparison');assert.equal(independent.fixtureSha256,ref.fixtureSha256);
 assert.equal(independent.nodeReportSha256,descriptors.get(config.referencePath).sha256);assert.equal(independent.referenceComparisons,config.cases);
 assert.equal(independent.calendarEndEligibilityComparisons,config.calendarDays);assert.equal(independent.calendarProbes,config.calendarProbes);assert.deepEqual(independent.discrepancies,[]);
 for(const flag of['runtimeActive','exportTest','legalApproval','productModulesImported','legalInterpretationAutomaticallyValidated'])assert.equal(independent[flag],false,flag);
 let sourceFiles=0,sourceBytes=0;const sourceIds=new Set();
 for(const model of fixture.sourceModels){assert.ok(descriptors.has(model.path));add(model);const content=await json(model.path);
  for(const flag of['professionalAcceptance','sourceReleaseApproved','operatingChanges'])assert.equal(content[flag],false,flag);
  if(model.sourceRegister){assert.equal((content.additionalRawCompanions??[]).length,0,'Unexpected raw companion');for(const row of content.sources){
   assert.ok(!sourceIds.has(row.id));sourceIds.add(row.id);const path=safeRelative(content.sourceBase+'/'+row.file);assert.ok(descriptors.has(path),'Unbound registered source');
   const raw=await bytes(path);assert.equal(sha256(raw),row.sha256);assert.equal(raw.length,row.bytes);sourceFiles++;sourceBytes+=raw.length;}}
 }
 assert.equal(sourceFiles,config.sourceCount);assert.equal(sourceBytes,config.sourceBytes);
 for(const row of fixture.calendarBaselines){if(!descriptors.has(row.path))extra.push(row.path);add(row);}
 for(const row of independent.calendarBaselineInputs){add(row);await bytes(row.path);}
 const guard=await json(config.guardPath),preservation=await json(config.preservationPath);
 assert.equal(descriptors.get(config.guardPath).sha256,config.guardSha256);assert.equal(guard.workPackage,'AP23M1');assert.equal(Object.keys(guard.files).length,config.protectedCount);
 assert.equal(guard.capturedAtResearchStart,true);assert.equal(guard.capturedBeforeLivingUpdates,true);
 assert.equal(preservation.status,'research-inputs-preserved');assert.equal(preservation.protectedFilesVerified,config.protectedCount);
 assert.equal(preservation.protectedInputSha256,config.guardSha256);assert.equal(proof.protectedInputSha256,config.guardSha256);
 assert.equal(guard.head,proof.head);assert.equal(preservation.gitHead,proof.head);
 if(!complete){if(config.requireGitHead)assert.equal(await readHead(root),proof.head,'Git HEAD changed');for(const[path,hash]of Object.entries(guard.files))await exact(root,path,hash);}
 const verified=[];for(const row of [...descriptors.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'))){const raw=await bytes(row.path);verified.push({item:{path:row.path,byteLength:raw.length,sha256:row.sha256},bytes:raw});}
 const receipt={...acceptance,proof:{path:config.proofPath,sha256:config.proofSha256},originalBindings:config.bindingCount,
  explicitTransitiveCalendarPayloads:extra.sort(),researchGroups:config.paths,groupsByCanton:config.groupsByCanton,references:config.cases,outcomeCounts:config.outcomes,
  sourceFiles,sourceBytes,originalResearchTests:config.tests,calendarDays:config.calendarDays,calendarProbes:config.calendarProbes,
  historicalProtectedInputsCheckedWithoutRecopy:config.protectedCount,artifacts:verified.map(value=>value.item)};
 const payload=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
 if(complete){assert.deepEqual(await exact(target,'receipt.json'),payload,'Accepted receipt mismatch');const actual=await inventory(target),expected=[...descriptors.keys(),'receipt.json'].sort(),directories=new Set();
  for(const path of expected){let parent=dirname(path);while(parent!=='.'){directories.add(parent);parent=dirname(parent);}}
  assert.deepEqual(actual.files,expected,'Archive file inventory');assert.deepEqual(actual.directories,[...directories].sort(),'Archive directory inventory');
 }else if(write){await mkdir(dirname(target),{recursive:true});await mkdir(target);for(const{item,bytes:raw}of verified){await checkedPath(target,item.path,{missing:true});await mkdir(dirname(resolve(target,item.path)),{recursive:true});
   await checkedPath(target,item.path,{missing:true});await writeFile(resolve(target,item.path),raw,{flag:'wx'});await exact(target,item.path,item.sha256);}
  await writeFile(resolve(target,'receipt.json'),payload,{flag:'wx'});}
 return{verified:true,target:config.target,mode:complete?'archive-reverified':write?'archive-created':'source-preflight-only',files:verified.length,
  originalBindings:config.bindingCount,explicitTransitiveCalendarPayloads:extra.length,sourceFiles,sourceBytes,payloadBytes:verified.reduce((sum,value)=>sum+value.bytes.length,0),
  historicalProtectedInputsNotRecopied:config.protectedCount,receiptSha256:sha256(payload),receiptByteLength:payload.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.ok(process.argv.slice(2).every(arg=>['--write','--check'].includes(arg)));assert.ok(!(process.argv.includes('--write')&&process.argv.includes('--check')));
 console.log(JSON.stringify(await archiveAcceptance({write:process.argv.includes('--write')}),null,2));
}
