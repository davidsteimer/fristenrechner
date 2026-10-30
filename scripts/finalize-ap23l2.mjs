// SPDX-License-Identifier: AGPL-3.0-only
// Bind an isolated contract proposal, never a native release or operating approval.
import assert from 'node:assert/strict';
import {readFile,readdir,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const out='outputs/ap23l2-2026-10-27',candidate='outputs/ap23l2-candidate-2026-10-27',proof=out+'/local-completion.json';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=path=>readFile(resolve(root,path)),json=async path=>JSON.parse(await read(path));
const bind=async path=>{const bytes=await read(path);return{path,byteLength:bytes.length,sha256:hash(bytes)};};
const living=['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
 'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md'];
const documents=['docs/fachrecht/abnahme-ap23l1.md','docs/architektur/start-ap23l2.md',
 'docs/architektur/verwaltungsverfahrensvertrag-ap23l2.md','docs/architektur/verwaltungsverfahrensvertrag-ap23l2-pruefung.md',
 'docs/entscheidungen/DEC-2026-041-qualifizierte-eroeffnung-und-fristdauer-v9.md'];
const sources=['scripts/archive-ap23l1-acceptance.mjs','scripts/prepare-ap23l2.mjs','scripts/check-ap23l2-preservation.mjs',
 'scripts/build-ap23l2-schemas.mjs','scripts/build-ap23l2-candidate.mjs','scripts/check-ap23l2-contract.mjs',
 'scripts/check_ap23l2_independent.py','scripts/check-ap23l2-native.mjs','scripts/finalize-ap23l2.mjs',
 'tests/governance/ap23l1-acceptance.test.mjs','outputs/ap23l1-abnahme-2026-10-27/receipt.json','outputs/ap23l1-2026-10-27/local-completion.json'];
export const completionFlags=['runtimeActive','productIntegration','calendarExportEnabled','sourceReleaseApproved','productCodeChanged',
 'nativeSchemasChanged','acceptedLegalDataChanged','existingTestsChanged','acceptedL1ResearchChanged','releaseBuildPerformed','commitCreated',
 'sourcePushPerformed','operatingChanges','l3Started','formatDecision','publicProjectStatusUpdated','publicTechnicalFindingsPublished'];
const formats={administrativeCatalog:'9.0.0',manifest:'16.0.0',minimumConsumer:'16.0.0',profiles:'1.0.0',holidayCatalog:'2.0.0',
 calendar:'3.0.0',specialRegimeCatalog:'3.0.0',socialProcedureCatalog:'2.0.0',defaults:5};
const outcomes={datedResearchValue:54,qualificationBoundaryProposed:22,researchWindowBoundary:5,unresolvedBoundaryProposed:2};
const stepIds=['schemas','candidate','contract','independent','native','l1-archive','governance-tests','preservation','typecheck','whitespace'];
export function validateCompletionMetadata(saved,integrity){
 assert.equal(saved.workPackage,'AP23L2');assert.equal(saved.asOf,'2026-10-27');assert.equal(saved.status,'passed-awaiting-technical-acceptance');
 assert.equal(saved.professionalL1Acceptance,true);assert.equal(saved.technicalL2Acceptance,false);
 assert.deepEqual(saved.contractDecision,{id:'DEC-2026-041',status:'proposed'});assert.deepEqual(saved.proposedFormats,formats);
 for(const flag of completionFlags)assert.equal(saved[flag],false,flag);
 assert.deepEqual(saved.counts,integrity.counts);assert.deepEqual(saved.manifest,integrity.manifest);
 for(const[key,value]of Object.entries({totalPaths:196,preservedPaths:165,newPaths:31,artifacts:44,totalFilesIncludingManifest:45,
  unchangedRawArtifacts:43,physicalCalendars:35,totalHolidayRules:499,newHolidayRules:0,proceduralSupplementDates:2,
  newSources:17,belegFiles:31,socialRules:44,socialBernBindings:50}))assert.equal(saved.counts[key],value,key);
 assert.equal(saved.consumerReferenceCases,83);assert.deepEqual(saved.consumerOutcomeCounts,outcomes);
 assert.equal(saved.syntheticProbes,20);assert.equal(saved.missingCurrentFactRejections,336);assert.equal(saved.negativeCatalogMutations,22);
 assert.equal(saved.independentReferences,83);assert.equal(saved.independentAdditionalProbes,697);assert.equal(saved.independentPhysicalCalendarProbes,12);
 assert.equal(saved.independentMutationSensitivities,3);assert.equal(saved.independentStatus,'passed');
 assert.equal(saved.oldNativeReferenceCalculations,165);assert.equal(saved.nativeReaderNegatives,12);
 assert.equal(saved.newNativeAISZCalculations,0);assert.equal(saved.protectedFilesVerified,9048);
 assert.ok(Number.isSafeInteger(saved.governanceTests)&&saved.governanceTests>=350);
 assert.ok(Number.isSafeInteger(saved.localLinksChecked)&&saved.localLinksChecked>0);assert.match(saved.head,/^[a-f0-9]{40}$/u);
 assert.ok(Array.isArray(saved.bindings)&&saved.bindings.length>90);assert.equal(new Set(saved.bindings.map(row=>row.path)).size,saved.bindings.length);
 assert.deepEqual(saved.steps.map(row=>row.id),stepIds);for(const step of saved.steps)assert.equal(step.exitCode,0,step.id);
 assert.equal(saved.nextGate,'Technical AP23L2 acceptance and explicit DEC-2026-041 decision, then separately commissioned AP23L3.');
 const keys=['workPackage','asOf','status','head','professionalL1Acceptance','technicalL2Acceptance','contractDecision','proposedFormats','counts',
  'consumerReferenceCases','consumerOutcomeCounts','syntheticProbes','missingCurrentFactRejections','negativeCatalogMutations',
  'independentReferences','independentAdditionalProbes','independentPhysicalCalendarProbes','independentMutationSensitivities','independentStatus',
  'oldNativeReferenceCalculations','nativeReaderNegatives','newNativeAISZCalculations','governanceTests','protectedFilesVerified','manifest',
  'localLinksChecked','steps','bindings',...completionFlags,'nextGate'];
 assert.deepEqual(Object.keys(saved).sort(),keys.sort(),'Closed handoff fields');return true;
}
async function walk(path){const result=[];for(const entry of await readdir(resolve(root,path),{withFileTypes:true})){
 const file=path+'/'+entry.name;assert.ok(!entry.isSymbolicLink(),'No evidence symlinks');if(entry.isDirectory())result.push(...await walk(file));
 else{assert.ok(entry.isFile());result.push(file);}}return result.sort();}
async function tests(){return(await walk('tests/governance')).filter(path=>/^tests\/governance\/ap23l2-[^/]+\.test\.mjs$/u.test(path));}
async function inventory(){const integrity=await json(candidate+'/candidate-integrity.json');return[...new Set([...documents,...living,...sources,
 ...await tests(),...await walk('schemas/candidates/ap23l2'),...await walk(candidate),...(await walk(out)).filter(path=>path!==proof),
 ...integrity.basedOn.map(row=>row.path)])].sort();}
export function governanceCount(log){const counts=Object.fromEntries([...log.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(row=>[row[1],Number(row[2])]));
 assert.ok(counts.tests>=350);assert.equal(counts.tests,counts.pass);for(const key of ['fail','cancelled','skipped','todo'])assert.equal(counts[key],0);return counts.tests;}
export async function validateReports(qa,independent,native){
 assert.equal(qa.status,'passed');assert.equal(qa.consumerReferenceCases,83);assert.deepEqual(qa.consumerOutcomeCounts,outcomes);
 assert.equal(qa.results.length,83);assert.equal(qa.syntheticProbeResults.length,20);assert.equal(qa.missingFactRejections.length,336);assert.equal(qa.mutationRejections.length,22);
 assert.equal(qa.accessorRejectedWithoutInvocation,true);assert.equal(qa.untrustedContextRejected,true);
 assert.equal(independent.status,'passed');assert.equal(independent.nodeComparison.matchedFixtures,83);
 assert.equal(independent.nodeComparison.syntheticProbeComparisons.length,20);assert.equal(independent.nodeComparison.comparedFieldCounts.boundProvenance,54);
 assert.deepEqual(independent.nodeComparison.evidence,await bind(candidate+'/QA-AP23L2.json'));
 assert.deepEqual(independent.binding.manifest,await bind(candidate+'/bundle/manifest.json'));
 assert.deepEqual(independent.binding.catalog,await bind(candidate+'/bundle/administrative-procedures/ch-cantonal-administrative-procedures.json'));
 assert.deepEqual(independent.binding.suite,await bind('docs/fachrecht/ap23l1/referenzfaelle.json'));
 assert.equal(independent.counts.originalReferences,83);assert.deepEqual(independent.counts.referenceOutcomes,outcomes);
 assert.equal(independent.counts.independentProbes,697);assert.equal(independent.counts.physicalCalendarProbes,12);assert.equal(independent.counts.mutationSensitivities,3);
 assert.equal(independent.binding.sourceEvidence.length,31);assert.equal(independent.binding.operativeSourceCount,17);
 assert.equal(independent.binding.physicalCalendars,35);assert.equal(independent.binding.holidayRules,499);
 assert.deepEqual(independent.binding.administrativeOnlySupplementDates,['2026-11-11','2027-11-11']);
 for(const flag of ['importsProductCode','importsNodeCode','importsResearchOracle','usesResearchCalendarOrPathModel','implicitCaseFacts','annotationRemoval'])assert.equal(independent[flag],false,flag);
 for(const report of [qa,independent,native])for(const flag of ['sourceReleaseApproved','calendarExportEnabled'])assert.equal(report[flag],false,flag);
 for(const row of [...qa.results,...qa.syntheticProbeResults]){assert.equal(row.actual.exportAllowed,false);assert.equal(Object.hasOwn(row.actual,'end'),row.actual.outcome==='datedResearchValue');}
 for(const row of [...independent.results,...independent.independentProbeResults])assert.equal(row.actual.calendarExport,false);
 assert.equal(native.status,'native-format15-baseline-preserved');assert.equal(native.calculatedCases,165);assert.equal(native.baselinePaths,165);
 assert.equal(native.unsupportedReaderRejections,12);assert.equal(native.newAISZCalculations,0);assert.equal(native.results.length,165);
 assert.equal(native.rejections.length,12);assert.equal(native.referenceOnly,true);assert.equal(native.runtimeActivation,false);
 for(const row of native.results){assert.equal(row.acceptedResultEqual,true);assert.equal(row.native.referenceOnly,true);assert.equal(row.native.calendarExportAllowed,false);}
 for(const row of native.rejections)assert.equal(row.rejected,true);
}
export async function finalize({write=false,check=false}={}){
 assert.notEqual(write,check,'Choose exactly --write or --check');
 if(check){const saved=await json(proof),integrity=await json(candidate+'/candidate-integrity.json');validateCompletionMetadata(saved,integrity);
  assert.deepEqual(saved.bindings.map(row=>row.path),await inventory(),'Exact evidence inventory');
  for(const row of saved.bindings){assert.deepEqual(Object.keys(row).sort(),['byteLength','path','sha256']);assert.deepEqual(await bind(row.path),row,'Changed evidence '+row.path);}
  await validateReports(await json(candidate+'/QA-AP23L2.json'),await json(out+'/independent-verification.json'),await json(out+'/native-regression.json'));
  assert.equal(saved.governanceTests,governanceCount((await read(out+'/governance-tests.txt')).toString()));
  for(const step of saved.steps)assert.deepEqual({path:step.path,byteLength:step.byteLength,sha256:step.sha256},saved.bindings.find(row=>row.path===step.path));
  assert.deepEqual(saved.steps.find(step=>step.id==='governance-tests').args,
   ['--import','tsx','--test','tests/governance/ap23l1-acceptance.test.mjs',...await tests()],'Every bound governance test was actually run');
  assert.equal(spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim(),saved.head);
  for(const args of [['scripts/build-ap23l2-schemas.mjs','--check'],['scripts/build-ap23l2-candidate.mjs','--check'],
   ['scripts/archive-ap23l1-acceptance.mjs','--check'],['scripts/check-ap23l2-preservation.mjs'],['--import','tsx','scripts/check-ap23l2-native.mjs','--check']]){
   const run=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});assert.equal(run.status,0,'Fresh bound verification '+args.join(' '));}
  return{status:'bound-L2-result-reverified',bindings:saved.bindings.length,technicalL2Acceptance:false,contractDecision:'proposed',runtimeActive:false};
 }
 const steps=[],commands=[['schemas',process.execPath,['scripts/build-ap23l2-schemas.mjs','--check']],
  ['candidate',process.execPath,['scripts/build-ap23l2-candidate.mjs','--check']],['contract',process.execPath,['scripts/check-ap23l2-contract.mjs']],
  ['independent',resolve(root,'.venv/bin/python'),['scripts/check_ap23l2_independent.py','--write']],
  ['native',process.execPath,['--import','tsx','scripts/check-ap23l2-native.mjs','--write']],
  ['l1-archive',process.execPath,['scripts/archive-ap23l1-acceptance.mjs','--check']],
  ['governance-tests',process.execPath,['--import','tsx','--test','tests/governance/ap23l1-acceptance.test.mjs',...await tests()]],
  ['preservation',process.execPath,['scripts/check-ap23l2-preservation.mjs','--write']],
  ['typecheck',process.execPath,['node_modules/typescript/bin/tsc','--noEmit']],['whitespace','git',['diff','--check']]];
 for(const[id,command,args]of commands){const result=spawnSync(command,args,{cwd:root,encoding:'utf8',maxBuffer:48*1024*1024,
  env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PATH:dirname(process.execPath)+':'+(process.env.PATH??'')}});
  const path=out+'/'+id+'.txt';await writeFile(resolve(root,path),(result.stdout??'')+(result.stderr??'')+(result.error?String(result.error):''));
  steps.push({id,command:command===process.execPath?'node':command===resolve(root,'.venv/bin/python')?'.venv/bin/python':command,args,exitCode:result.status,...await bind(path)});
  assert.equal(result.status,0,'Failed L2 step '+id);
 }
 const integrity=await json(candidate+'/candidate-integrity.json'),qa=await json(candidate+'/QA-AP23L2.json'),independent=await json(out+'/independent-verification.json'),native=await json(out+'/native-regression.json');
 assert.deepEqual(steps.find(step=>step.id==='governance-tests').args,
  ['--import','tsx','--test','tests/governance/ap23l1-acceptance.test.mjs',...await tests()],'Test inventory changed during pipeline');
 await validateReports(qa,independent,native);assert.deepEqual(await bind(integrity.manifest.path),integrity.manifest);
 for(const row of integrity.artifacts)assert.deepEqual(await bind(row.path),row);assert.equal((await walk(candidate+'/bundle')).length,45);
 const preserved=await json(out+'/preservation-verification.json');assert.equal(preserved.protectedFilesVerified,9048);assert.equal(preserved.acceptedL1Archive.files,66);
 let localLinksChecked=0;for(const path of [...documents,...living]){const text=(await read(path)).toString();
  if(documents.includes(path))assert.equal(/[;ß]/u.test(text),false,'Swiss project prose '+path);
  for(const match of text.matchAll(/\]\(([^)]+)\)/g)){let target=match[1].replace(/^<|>$/g,'').split(/\s+"/)[0];
   if(/^(?:https?:|mailto:|codex:|plugin:|#)/iu.test(target))continue;target=decodeURIComponent(target.split('#')[0]);if(!target)continue;
   const absolute=resolve(root,dirname(path),target);if(absolute!==resolve(root,proof))await access(absolute).catch(()=>{throw Error('Broken local link '+path+' -> '+target);});localLinksChecked++;}}
 const bindings=await Promise.all((await inventory()).map(bind)),report={workPackage:'AP23L2',asOf:'2026-10-27',status:'passed-awaiting-technical-acceptance',
  head:preserved.gitHead,professionalL1Acceptance:true,technicalL2Acceptance:false,contractDecision:{id:'DEC-2026-041',status:'proposed'},proposedFormats:formats,
  counts:integrity.counts,consumerReferenceCases:83,consumerOutcomeCounts:qa.consumerOutcomeCounts,syntheticProbes:qa.syntheticProbes,
  missingCurrentFactRejections:qa.missingCurrentFactRejections,negativeCatalogMutations:qa.negativeCatalogMutations,
  independentReferences:83,independentAdditionalProbes:independent.counts.independentProbes,independentPhysicalCalendarProbes:independent.counts.physicalCalendarProbes,
  independentMutationSensitivities:independent.counts.mutationSensitivities,independentStatus:independent.status,
  oldNativeReferenceCalculations:native.calculatedCases,nativeReaderNegatives:native.unsupportedReaderRejections,newNativeAISZCalculations:native.newAISZCalculations,
  governanceTests:governanceCount((await read(out+'/governance-tests.txt')).toString()),protectedFilesVerified:9048,manifest:integrity.manifest,
  localLinksChecked,steps,bindings,...Object.fromEntries(completionFlags.map(flag=>[flag,false])),
  nextGate:'Technical AP23L2 acceptance and explicit DEC-2026-041 decision, then separately commissioned AP23L3.'};
 validateCompletionMetadata(report,integrity);await writeFile(resolve(root,proof),JSON.stringify(report,null,2)+'\n');
 for(const row of bindings)assert.deepEqual(await bind(row.path),row,'Final readback '+row.path);
 return{...report,bindings:bindings.length,steps:steps.map(step=>({id:step.id,exitCode:step.exitCode}))};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.ok(process.argv.slice(2).every(arg=>['--write','--check'].includes(arg)));
 console.log(JSON.stringify(await finalize({write:process.argv.includes('--write'),check:process.argv.includes('--check')}),null,2));
}
