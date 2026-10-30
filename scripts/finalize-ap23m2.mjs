// SPDX-License-Identifier: AGPL-3.0-only
// Bind a local M2 contract proposal. Never a native release or operating approval.
import assert from 'node:assert/strict';
import {readFile,readdir,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
export const OUTPUT='outputs/ap23m2-2026-10-28',CANDIDATE='outputs/ap23m2-candidate-2026-10-28',PROOF=OUTPUT+'/local-completion.json';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=path=>readFile(resolve(root,path)),json=async path=>JSON.parse(await read(path));
const bind=async path=>{const bytes=await read(path);return{path,byteLength:bytes.length,sha256:sha(bytes)};};
const living=['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
 'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md'];
const documents=['docs/fachrecht/abnahme-ap23m1.md','docs/architektur/start-ap23m2.md','docs/architektur/verwaltungsverfahrensvertrag-ap23m2.md',
 'docs/architektur/verwaltungsverfahrensvertrag-ap23m2-pruefung.md','docs/entscheidungen/DEC-2026-042-ne-vd-vs-verfahrensvertrag-v10.md'];
export const flags=['runtimeActive','productIntegration','calendarExportEnabled','sourceReleaseApproved','productCodeChanged','nativeSchemasChanged',
 'acceptedLegalDataChanged','existingTestsChanged','acceptedM1ResearchChanged','releaseBuildPerformed','commitCreated','sourcePushPerformed',
 'operatingChanges','m3Started','formatDecision','publicProjectStatusUpdated','publicTechnicalFindingsPublished'];
export const formats={administrativeCatalog:'10.0.0',manifest:'17.0.0',minimumConsumer:'17.0.0',profiles:'1.0.0',holidayCatalog:'2.0.0',calendar:'3.0.0',specialRegimeCatalog:'3.0.0',socialProcedureCatalog:'2.0.0',defaults:5};
export const outcomes={datedResearchValue:73,qualificationBoundaryProposed:27,researchWindowBoundary:6,unresolvedBoundaryProposed:3};
const counts={artifacts:44,totalFilesIncludingManifest:45,unchangedRawArtifacts:43,newArtifacts:0,preservedPaths:196,newPaths:49,totalPaths:245,qualificationPolicies:245,
 laws:25,suspensionProfiles:46,holidayBindings:36,newSources:19,totalSources:148,physicalCalendars:35,totalHolidayRules:499,newHolidayRules:0,newProceduralSupplementDates:0,belegFiles:64,socialRules:44,socialBernBindings:50};
const stepsExpected=['schemas','candidate','contract','independent','native','m1-archive','governance-tests','preservation','typecheck','whitespace'];
async function walk(path){const out=[];for(const e of await readdir(resolve(root,path),{withFileTypes:true})){
 const file=path+'/'+e.name;assert.ok(!e.isSymbolicLink(),'No evidence symlinks');if(e.isDirectory())out.push(...await walk(file));else{assert.ok(e.isFile());out.push(file);}}return out.sort();}
async function tests(){return(await walk('tests/governance')).filter(path=>/^tests\/governance\/ap23m2-[^/]+\.test\.mjs$/u.test(path));}
async function inventory(){const i=await json(CANDIDATE+'/candidate-integrity.json');return[...new Set([...documents,...living,
 'scripts/archive-ap23m1-acceptance.mjs','tests/governance/ap23m1-acceptance.test.mjs',
 ...(await walk('scripts')).filter(path=>/^scripts\/[^/]*ap23m2[^/]*$/u.test(path)),...await tests(),...await walk('schemas/candidates/ap23m2'),
 ...await walk(CANDIDATE),...(await walk(OUTPUT)).filter(path=>path!==PROOF),...i.basedOn.map(row=>row.path)])].sort();}
export function governanceCount(log){const c=Object.fromEntries([...log.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(r=>[r[1],Number(r[2])]));
 assert.ok(c.tests>=400);assert.equal(c.tests,c.pass);for(const key of ['fail','cancelled','skipped','todo'])assert.equal(c[key],0);return c.tests;}
export function validateMetadata(saved){
 assert.equal(saved.workPackage,'AP23M2');assert.equal(saved.asOf,'2026-10-28');assert.equal(saved.status,'passed-awaiting-technical-acceptance');
 assert.equal(saved.professionalM1Acceptance,true);assert.equal(saved.technicalM2Acceptance,false);assert.deepEqual(saved.contractDecision,{id:'DEC-2026-042',status:'proposed'});
 assert.deepEqual(saved.proposedFormats,formats);assert.deepEqual(saved.counts,counts);assert.deepEqual(saved.consumerOutcomeCounts,outcomes);
 for(const key of flags)assert.equal(saved[key],false,key);
 for(const[key,value]of Object.entries({consumerReferenceCases:109,syntheticProbes:33,missingCurrentFactRejections:560,negativeCatalogMutations:23,
  independentReferences:109,independentAdditionalProbes:1239,independentPhysicalCalendarProbes:22,independentMutationSensitivities:3,
  oldNativeReferenceCalculations:196,nativeReaderNegatives:12,newNativeNEVDVSCalculations:0,protectedFilesVerified:11414}))assert.equal(saved[key],value,key);
 assert.equal(saved.vdArticle81NumericLegalityInference,false);assert.equal(saved.independentStatus,'passed');assert.equal(saved.neGateStatus,'fresh-official-evidence-no-new-relevant-commencement-observed');
 assert.match(saved.head,/^[a-f0-9]{40}$/u);assert.ok(saved.governanceTests>=400);assert.ok(saved.localLinksChecked>0);
 assert.deepEqual(saved.steps.map(row=>row.id),stepsExpected);for(const step of saved.steps)assert.equal(step.exitCode,0,step.id);
 assert.ok(saved.bindings.length>100);assert.equal(new Set(saved.bindings.map(r=>r.path)).size,saved.bindings.length);
 assert.equal(saved.nextGate,'Technical AP23M2 acceptance and explicit DEC-2026-042 decision, then separately commissioned AP23M3.');
 const keys=['workPackage','asOf','status','head','professionalM1Acceptance','technicalM2Acceptance','contractDecision','proposedFormats','counts',
  'consumerReferenceCases','consumerOutcomeCounts','syntheticProbes','missingCurrentFactRejections','negativeCatalogMutations',
  'independentReferences','independentAdditionalProbes','independentPhysicalCalendarProbes','independentMutationSensitivities','independentStatus',
  'oldNativeReferenceCalculations','nativeReaderNegatives','newNativeNEVDVSCalculations','protectedFilesVerified','vdArticle81NumericLegalityInference',
  'neGateStatus','governanceTests','manifest','localLinksChecked','steps','bindings',...flags,'nextGate'];
 assert.deepEqual(Object.keys(saved).sort(),keys.sort(),'Closed handoff fields');return true;
}
export async function validateReports(){
 const qa=await json(CANDIDATE+'/QA-AP23M2.json'),independent=await json(OUTPUT+'/independent-verification.json'),native=await json(OUTPUT+'/native-regression.json'),gate=await json(OUTPUT+'/ne-fassungsgate.json');
 assert.equal(qa.status,'passed');assert.equal(qa.results.length,109);assert.deepEqual(qa.consumerOutcomeCounts,outcomes);assert.equal(qa.syntheticProbeResults.length,33);
 assert.equal(qa.missingFactRejections.length,560);assert.equal(qa.mutationRejections.length,23);assert.equal(qa.untrustedContextRejected,true);assert.equal(qa.accessorRejectedWithoutInvocation,true);
 assert.equal(qa.manifestSha256,(await bind(CANDIDATE+'/bundle/manifest.json')).sha256);assert.equal(qa.catalogSha256,(await bind(CANDIDATE+'/bundle/administrative-procedures/ch-cantonal-administrative-procedures.json')).sha256);
 assert.equal(independent.status,'passed');assert.equal(independent.nodeComparison.matchedFixtures,109);assert.equal(independent.nodeComparison.syntheticProbeComparisons.length,33);
 assert.equal(independent.nodeComparison.nodeMissingFactComparisons.length,560);assert.deepEqual(independent.nodeComparison.evidence,await bind(CANDIDATE+'/QA-AP23M2.json'));
 assert.equal(independent.counts.originalReferences,109);assert.equal(independent.counts.positivePaths,49);assert.deepEqual(independent.counts.referenceOutcomes,outcomes);
 assert.equal(independent.counts.independentProbes,1239);assert.equal(independent.counts.physicalCalendarProbes,22);assert.equal(independent.counts.mutationSensitivities,3);
 for(const key of ['importsProductCode','importsNodeCode','importsResearchOracle','usesResearchCalendarOrPathModel','annotationRemoval','implicitCaseFacts'])assert.equal(independent[key],false,key);
 assert.equal(native.status,'native-format16-baseline-preserved');assert.equal(native.calculatedCases,196);assert.equal(native.results.length,196);assert.equal(native.unsupportedReaderRejections,12);assert.equal(native.rejections.length,12);
 assert.equal(native.newNEVDVSCalculations,0);for(const row of native.results){assert.equal(row.acceptedResultEqual,true);assert.equal(row.native.calendarExportAllowed,false);}
 for(const row of native.rejections)assert.equal(row.rejected,true);
 for(const report of [qa,independent,native])for(const flag of ['sourceReleaseApproved','calendarExportEnabled'])assert.equal(report[flag],false,flag);
 for(const row of [...qa.results,...qa.syntheticProbeResults]){assert.equal(row.actual.exportAllowed,false);assert.equal(Object.hasOwn(row.actual,'end'),row.actual.outcome==='datedResearchValue');}
 assert.equal(qa.vdArticle81NumericLegalityInference,false);assert.equal(independent.vdArticle81NumericLegalityInference,false);
 assert.equal(gate.status,'fresh-official-evidence-no-new-relevant-commencement-observed');assert.equal(gate.sources.length,9);assert.equal(gate.reviewedOn,'2026-10-28');
 for(const row of gate.sources){assert.ok(!row.file.includes('/')&&!row.file.includes('..'));const actual=await bind(gate.sourceBase+'/'+row.file);assert.equal(actual.byteLength,row.bytes);assert.equal(actual.sha256,row.sha256);}
 return{qa,independent,native,gate};
}
export async function finalize({write=false,check=false}={}){
 assert.notEqual(write,check,'Choose exactly --write or --check');
 if(check){const saved=await json(PROOF);validateMetadata(saved);assert.deepEqual(saved.manifest,(await json(CANDIDATE+'/candidate-integrity.json')).manifest);assert.deepEqual(saved.bindings.map(row=>row.path),await inventory(),'Exact evidence inventory');
  for(const row of saved.bindings){assert.deepEqual(Object.keys(row).sort(),['byteLength','path','sha256']);assert.deepEqual(await bind(row.path),row,'Changed evidence '+row.path);}
  await validateReports();assert.equal(saved.governanceTests,governanceCount((await read(OUTPUT+'/governance-tests.txt')).toString()));
  for(const step of saved.steps)assert.deepEqual({path:step.path,byteLength:step.byteLength,sha256:step.sha256},saved.bindings.find(row=>row.path===step.path));
  assert.deepEqual(saved.steps.find(s=>s.id==='governance-tests').args,['--import','tsx','--test','tests/governance/ap23m1-acceptance.test.mjs',...await tests()]);
  assert.equal(spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim(),saved.head);
  for(const args of [['scripts/build-ap23m2-schemas.mjs','--check'],['scripts/build-ap23m2-candidate.mjs','--check'],['scripts/archive-ap23m1-acceptance.mjs','--check'],['scripts/check-ap23m2-preservation.mjs'],['--import','tsx','scripts/check-ap23m2-native.mjs','--check']]){
   const run=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:48*1024*1024});assert.equal(run.status,0,'Fresh bound verification '+args.join(' '));}
  return{status:'bound-M2-result-reverified',bindings:saved.bindings.length,technicalM2Acceptance:false,contractDecision:'proposed',runtimeActive:false};
 }
 const steps=[],commands=[['schemas',process.execPath,['scripts/build-ap23m2-schemas.mjs','--check']],['candidate',process.execPath,['scripts/build-ap23m2-candidate.mjs','--check']],
  ['contract',process.execPath,['scripts/check-ap23m2-contract.mjs']],['independent',resolve(root,'.venv/bin/python'),['scripts/check_ap23m2_independent.py','--write']],
  ['native',process.execPath,['--import','tsx','scripts/check-ap23m2-native.mjs','--write']],['m1-archive',process.execPath,['scripts/archive-ap23m1-acceptance.mjs','--check']],
  ['governance-tests',process.execPath,['--import','tsx','--test','tests/governance/ap23m1-acceptance.test.mjs',...await tests()]],
  ['preservation',process.execPath,['scripts/check-ap23m2-preservation.mjs','--write']],['typecheck',process.execPath,['node_modules/typescript/bin/tsc','--noEmit']],['whitespace','git',['diff','--check']]];
 for(const[id,command,args]of commands){const run=spawnSync(command,args,{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PATH:dirname(process.execPath)+':'+(process.env.PATH??'')}});
  const path=OUTPUT+'/'+id+'.txt';await writeFile(resolve(root,path),(run.stdout??'')+(run.stderr??'')+(run.error?String(run.error):''));
  steps.push({id,command:command===process.execPath?'node':command===resolve(root,'.venv/bin/python')?'.venv/bin/python':command,args,exitCode:run.status,...await bind(path)});assert.equal(run.status,0,'Failed M2 step '+id);
 }
 const{qa,independent,native,gate}=await validateReports(),integrity=await json(CANDIDATE+'/candidate-integrity.json'),preserved=await json(OUTPUT+'/preservation-verification.json');
 assert.deepEqual(integrity.counts,counts);assert.deepEqual(await bind(integrity.manifest.path),integrity.manifest);for(const row of integrity.artifacts)assert.deepEqual(await bind(row.path),row);
 assert.equal((await walk(CANDIDATE+'/bundle')).length,45);assert.equal(preserved.protectedFilesVerified,11414);assert.equal(preserved.acceptedM1Archive.files,110);
 let localLinksChecked=0;for(const path of [...documents,...living]){const text=(await read(path)).toString();if(documents.includes(path))assert.equal(/[;ß]/u.test(text),false,'Swiss project prose '+path);
  for(const match of text.matchAll(/\]\(([^)]+)\)/g)){let target=match[1].replace(/^<|>$/g,'').split(/\s+"/)[0];if(/^(?:https?:|mailto:|codex:|plugin:|#)/iu.test(target))continue;
   target=decodeURIComponent(target.split('#')[0]);if(!target)continue;const absolute=resolve(root,dirname(path),target);if(absolute!==resolve(root,PROOF))await access(absolute).catch(()=>{throw Error('Broken local link '+path+' -> '+target);});localLinksChecked++;}}
 const report={workPackage:'AP23M2',asOf:'2026-10-28',status:'passed-awaiting-technical-acceptance',head:preserved.gitHead,
  professionalM1Acceptance:true,technicalM2Acceptance:false,contractDecision:{id:'DEC-2026-042',status:'proposed'},proposedFormats:formats,counts,
  consumerReferenceCases:109,consumerOutcomeCounts:qa.consumerOutcomeCounts,syntheticProbes:qa.syntheticProbes,missingCurrentFactRejections:qa.missingCurrentFactRejections,negativeCatalogMutations:qa.negativeCatalogMutations,
  independentReferences:109,independentAdditionalProbes:independent.counts.independentProbes,independentPhysicalCalendarProbes:independent.counts.physicalCalendarProbes,independentMutationSensitivities:independent.counts.mutationSensitivities,independentStatus:independent.status,
  oldNativeReferenceCalculations:native.calculatedCases,nativeReaderNegatives:native.unsupportedReaderRejections,newNativeNEVDVSCalculations:native.newNEVDVSCalculations,
  protectedFilesVerified:11414,vdArticle81NumericLegalityInference:false,neGateStatus:gate.status,governanceTests:governanceCount((await read(OUTPUT+'/governance-tests.txt')).toString()),
  manifest:integrity.manifest,localLinksChecked,steps,bindings:await Promise.all((await inventory()).map(bind)),...Object.fromEntries(flags.map(flag=>[flag,false])),
  nextGate:'Technical AP23M2 acceptance and explicit DEC-2026-042 decision, then separately commissioned AP23M3.'};
 validateMetadata(report);await writeFile(resolve(root,PROOF),JSON.stringify(report,null,2)+'\n');for(const row of report.bindings)assert.deepEqual(await bind(row.path),row,'Final readback '+row.path);
 return{...report,bindings:report.bindings.length,steps:steps.map(s=>({id:s.id,exitCode:s.exitCode}))};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.ok(process.argv.slice(2).every(arg=>['--write','--check'].includes(arg)));console.log(JSON.stringify(await finalize({write:process.argv.includes('--write'),check:process.argv.includes('--check')}),null,2));}
