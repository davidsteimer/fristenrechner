// SPDX-License-Identifier: AGPL-3.0-only
// Isolated local contract handoff. No native integration, product build or remote write.
import assert from 'node:assert/strict';
import {readFile,readdir,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const out='outputs/ap23k2-2026-10-27',candidate='outputs/ap23k2-candidate-2026-10-27',proof=out+'/local-completion.json';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=path=>readFile(resolve(root,path)),json=async path=>JSON.parse(await read(path));
const bind=async path=>{const bytes=await read(path);return {path,byteLength:bytes.length,sha256:hash(bytes)};};
const living=['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
  'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md'];
const documents=['docs/fachrecht/abnahme-ap23k1.md','docs/architektur/start-ap23k2.md',
  'docs/architektur/verwaltungsverfahrensvertrag-ap23k2.md','docs/architektur/verwaltungsverfahrensvertrag-ap23k2-pruefung.md',
  'docs/entscheidungen/DEC-2026-040-dynamische-feiertagsbindung-und-bueroschliesstage-v8.md'];
const sources=['scripts/archive-ap23k1-acceptance.mjs','scripts/prepare-ap23k2.mjs','scripts/check-ap23k2-preservation.mjs',
  'scripts/build-ap23k2-schemas.mjs','scripts/build-ap23k2-candidate.mjs','scripts/check-ap23k2-contract.mjs',
  'scripts/check_ap23k2_independent.py','scripts/finalize-ap23k2.mjs',
  'tests/governance/ap23k1-acceptance.test.mjs',
  'outputs/ap23k1-abnahme-2026-10-27/receipt.json','outputs/ap23k1-2026-10-27/local-completion.json'];
const flags=['runtimeActive','productIntegration','calendarExportEnabled','sourceReleaseApproved','productCodeChanged',
  'nativeSchemasChanged','acceptedLegalDataChanged','existingTestsChanged','releaseBuildPerformed','commitCreated',
  'sourcePushPerformed','operatingChanges','k3Started','formatDecision','publicProjectStatusUpdated','publicTechnicalFindingsPublished'];
const expectedFormats={administrativeCatalog:'8.0.0',manifest:'15.0.0',minimumConsumer:'15.0.0',
  profiles:'1.0.0',holidayCatalog:'2.0.0',calendar:'3.0.0',specialRegimeCatalog:'3.0.0',socialProcedureCatalog:'2.0.0',defaults:5};
export function validateCompletionMetadata(saved,integrity){
  assert.equal(saved.workPackage,'AP23K2');assert.equal(saved.asOf,'2026-10-27');
  assert.equal(saved.status,'passed-awaiting-technical-acceptance');assert.equal(saved.professionalK1Acceptance,true);
  assert.equal(saved.technicalK2Acceptance,false);assert.deepEqual(saved.contractDecision,{id:'DEC-2026-040',status:'proposed'});
  assert.deepEqual(saved.proposedFormats,expectedFormats);for(const flag of flags)assert.equal(saved[flag],false,flag);
  assert.deepEqual(saved.counts,integrity.counts);assert.deepEqual(saved.manifest,integrity.manifest);
  assert.equal(saved.counts.totalPaths,165);assert.equal(saved.counts.preservedPaths,149);assert.equal(saved.counts.newPaths,16);
  assert.equal(saved.counts.unchangedRawArtifacts,43);assert.equal(saved.counts.physicalCalendars,35);
  assert.equal(saved.counts.totalHolidayRules,499);assert.equal(saved.counts.newHolidayRules,0);
  assert.equal(saved.counts.annualOfficeClosureDays,13);assert.equal(saved.counts.uncertainClosureDays,1);
  assert.equal(saved.counts.dynamicTerminalBindings,26);assert.equal(saved.counts.dynamicTerminalVariants,28);assert.equal(saved.counts.dynamicProjections,29);
  assert.equal(saved.counts.socialRules,44);assert.equal(saved.counts.socialBernBindings,50);
  assert.equal(saved.originalK1Cases,67);assert.equal(saved.consumerReferenceCases,65);assert.equal(saved.diagnosticWorldOracleCases,2);
  assert.deepEqual(saved.consumerOutcomeCounts,{datedResearchValue:40,qualificationBoundaryProposed:18,unresolvedBoundaryProposed:2,researchWindowBoundary:5});
  assert.equal(saved.oldNativeReferenceCalculations,149);assert.equal(saved.nativeReaderNegatives,2);
  assert.ok(saved.syntheticProbes>=46);assert.ok(saved.negativeCatalogMutations>=19);assert.ok(saved.negativeInputMutations>=109);
  assert.ok(saved.governanceTests>=200);assert.equal(saved.protectedFilesVerified,6612);
  assert.equal(saved.independentStatus,'passedIndependentStructuralAndResearchComparison');
  assert.ok(Number.isSafeInteger(saved.localLinksChecked)&&saved.localLinksChecked>0);
  assert.match(saved.head,/^[a-f0-9]{40}$/u);assert.ok(Array.isArray(saved.bindings)&&saved.bindings.length>90);
  assert.equal(new Set(saved.bindings.map(row=>row.path)).size,saved.bindings.length);
  assert.deepEqual(saved.steps.map(row=>row.id),['schemas','candidate','contract','independent','k1-archive','governance-tests','preservation','typecheck','whitespace']);
  for(const step of saved.steps)assert.equal(step.exitCode,0,step.id);
  assert.equal(saved.nextGate,'Technical AP23K2 acceptance and explicit DEC-2026-040 decision, then separately commissioned AP23K3.');
  const keys=['workPackage','asOf','status','head','professionalK1Acceptance','technicalK2Acceptance','contractDecision','proposedFormats',
    'counts','originalK1Cases','consumerReferenceCases','diagnosticWorldOracleCases','consumerOutcomeCounts','syntheticProbes',
    'negativeCatalogMutations','negativeInputMutations','nativeReaderNegatives','oldNativeReferenceCalculations',
    'governanceTests','protectedFilesVerified','independentStatus','manifest','localLinksChecked','steps','bindings',...flags,'nextGate'];
  assert.deepEqual(Object.keys(saved).sort(),keys.sort(),'Closed completion metadata fields');return true;
}
async function walk(path){
  const files=[];
  for(const item of await readdir(resolve(root,path),{withFileTypes:true})){
    const next=path+'/'+item.name;assert.ok(!item.isSymbolicLink(),'Symlink '+next);
    if(item.isDirectory())files.push(...await walk(next));else{assert.ok(item.isFile());files.push(next);}
  }return files.sort();
}
async function testFiles(){return (await walk('tests/governance')).filter(path=>/^tests\/governance\/ap23k2-[^/]+\.test\.mjs$/u.test(path));}
async function bindingPaths(){
  const integrity=await json(candidate+'/candidate-integrity.json');
  return [...new Set([...documents,...living,...sources,...await testFiles(),
    ...await walk('schemas/candidates/ap23k2'),...await walk(candidate),
    ...(await walk(out)).filter(path=>path!==proof),...integrity.basedOn.map(row=>row.path)])].sort();
}
async function assertIndependent(qa,independent){
  assert.equal(qa.status,'passed');assert.equal(independent.status,'passedIndependentStructuralAndResearchComparison');
  assert.deepEqual(independent.discrepancies,[]);assert.equal(independent.nodeEvidenceSha256,hash(await read(candidate+'/QA-AP23K2.json')));
  assert.equal(independent.fixtureSha256,hash(await read('docs/fachrecht/ap23k1/referenzfaelle.json')));
  assert.equal(independent.referenceCases,65);assert.equal(independent.diagnosticBranchOracleCases,2);
  assert.deepEqual(independent.counts,qa.consumerOutcomeCounts);assert.equal(independent.nodeConsumerComparisons,65);
  assert.equal(independent.sourceByteBindings,27);assert.equal(independent.holidayRules,499);assert.equal(independent.physicalProjectionRules,431);
  assert.equal(independent.catalogPaths,165);assert.equal(independent.preservedPaths,149);assert.equal(independent.unchangedRawArtifacts,43);
  for(const report of [qa,independent])for(const key of ['runtimeActive','sourceReleaseApproved','calendarExportEnabled'])assert.equal(report[key],false,key);
  for(const row of [...qa.results,...qa.branchOracleResults,...qa.syntheticProbeResults])assert.equal(row.actual.exportAllowed,false);
}
function testCount(log){
  const counts=Object.fromEntries([...log.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(row=>[row[1],Number(row[2])]));
  assert.ok(counts.tests>=200);assert.equal(counts.tests,counts.pass);for(const key of ['fail','cancelled','skipped','todo'])assert.equal(counts[key],0);
  return counts.tests;
}
export async function finalize({write=false,check=false}={}){
  assert.notEqual(write,check,'Choose --write or --check');
  if(check){
    const saved=await json(proof),integrity=await json(candidate+'/candidate-integrity.json');validateCompletionMetadata(saved,integrity);
    assert.deepEqual(saved.bindings.map(row=>row.path),await bindingPaths(),'Exact required evidence inventory');
    for(const row of saved.bindings){assert.match(row.sha256,/^[a-f0-9]{64}$/u);assert.ok(Number.isSafeInteger(row.byteLength)&&row.byteLength>=0);
      assert.deepEqual(await bind(row.path),row,'Changed final evidence '+row.path);}
    const qa=await json(candidate+'/QA-AP23K2.json'),independent=await json(out+'/independent-verification.json');await assertIndependent(qa,independent);
    for(const field of ['originalK1Cases','consumerReferenceCases','diagnosticWorldOracleCases','consumerOutcomeCounts','syntheticProbes',
      'negativeCatalogMutations','negativeInputMutations','oldNativeReferenceCalculations'])assert.deepEqual(saved[field],qa[field],'Bound QA counter '+field);
    assert.equal(saved.nativeReaderNegatives,qa.readerNegatives.length);assert.equal(saved.governanceTests,testCount((await read(out+'/governance-tests.txt')).toString()));
    for(const step of saved.steps){const descriptor=saved.bindings.find(row=>row.path===step.path);
      assert.deepEqual({path:step.path,byteLength:step.byteLength,sha256:step.sha256},descriptor,'Exact step evidence '+step.id);}
    assert.equal(spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim(),saved.head);
    for(const file of ['scripts/archive-ap23k1-acceptance.mjs','scripts/check-ap23k2-preservation.mjs']){
      const result=spawnSync(process.execPath,[file,...(file.includes('archive')?['--check']:[])],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
      assert.equal(result.status,0,'Fresh immutable verification '+file);
    }
    return {status:'bound-K2-result-reverified',bindings:saved.bindings.length,professionalK1Acceptance:true,
      technicalK2Acceptance:false,contractDecision:'proposed',runtimeActive:false};
  }
  const steps=[],commands=[
    ['schemas',process.execPath,['scripts/build-ap23k2-schemas.mjs','--check']],
    ['candidate',process.execPath,['scripts/build-ap23k2-candidate.mjs','--check']],
    ['contract',process.execPath,['--import','tsx','scripts/check-ap23k2-contract.mjs','--write']],
    ['independent',resolve(root,'.venv/bin/python'),['scripts/check_ap23k2_independent.py','--write']],
    ['k1-archive',process.execPath,['scripts/archive-ap23k1-acceptance.mjs','--check']],
    ['governance-tests',process.execPath,['--import','tsx','--test','tests/governance/ap23k1-acceptance.test.mjs',...await testFiles()]],
    ['preservation',process.execPath,['scripts/check-ap23k2-preservation.mjs','--write']],
    ['typecheck',process.execPath,['node_modules/typescript/bin/tsc','--noEmit']],
    ['whitespace','git',['diff','--check']]
  ];
  for(const [id,command,args] of commands){
    const result=spawnSync(command,args,{cwd:root,encoding:'utf8',maxBuffer:48*1024*1024,
      env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PATH:dirname(process.execPath)+':'+(process.env.PATH??'')}});
    const path=out+'/'+id+'.txt';await writeFile(resolve(root,path),(result.stdout??'')+(result.stderr??'')+(result.error?String(result.error):''));
    steps.push({id,command:command===process.execPath?'node':command===resolve(root,'.venv/bin/python')?'.venv/bin/python':command,
      args,exitCode:result.status,...await bind(path)});assert.equal(result.status,0,'Failed K2 step '+id);
  }
  const qa=await json(candidate+'/QA-AP23K2.json'),independent=await json(out+'/independent-verification.json');await assertIndependent(qa,independent);
  const integrity=await json(candidate+'/candidate-integrity.json');assert.deepEqual(await bind(integrity.manifest.path),integrity.manifest);
  for(const row of integrity.artifacts)assert.deepEqual(await bind(row.path),row,'Actual candidate artifact '+row.path);
  assert.equal((await walk(candidate+'/bundle')).length,45);
  const preservation=await json(out+'/preservation-verification.json');assert.equal(preservation.protectedFilesVerified,6612);
  assert.equal(preservation.acceptedK1Archive.files,125);let localLinksChecked=0;
  for(const path of [...documents,...living]){
    const text=(await read(path)).toString();if(documents.includes(path))assert.equal(/[;ß]/u.test(text),false,'Swiss project prose '+path);
    for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
      let target=match[1].replace(/^<|>$/g,'').split(/\s+"/)[0];if(/^(?:https?:|mailto:|codex:|plugin:|#)/iu.test(target))continue;
      target=decodeURIComponent(target.split('#')[0]);if(!target)continue;const absolute=resolve(root,dirname(path),target);
      if(absolute!==resolve(root,proof))await access(absolute).catch(()=>{throw Error('Broken local link '+path+' -> '+target);});localLinksChecked++;
    }
  }
  const files=await bindingPaths(),bindings=await Promise.all(files.map(bind)),report={
    workPackage:'AP23K2',asOf:'2026-10-27',status:'passed-awaiting-technical-acceptance',head:preservation.gitHead,
    professionalK1Acceptance:true,technicalK2Acceptance:false,contractDecision:{id:'DEC-2026-040',status:'proposed'},proposedFormats:expectedFormats,
    counts:integrity.counts,originalK1Cases:qa.originalK1Cases,consumerReferenceCases:qa.consumerReferenceCases,
    diagnosticWorldOracleCases:qa.diagnosticWorldOracleCases,consumerOutcomeCounts:qa.consumerOutcomeCounts,
    syntheticProbes:qa.syntheticProbes,negativeCatalogMutations:qa.negativeCatalogMutations,negativeInputMutations:qa.negativeInputMutations,
    nativeReaderNegatives:qa.readerNegatives.length,oldNativeReferenceCalculations:qa.oldNativeReferenceCalculations,
    governanceTests:testCount((await read(out+'/governance-tests.txt')).toString()),protectedFilesVerified:6612,
    independentStatus:independent.status,manifest:integrity.manifest,localLinksChecked,steps,bindings,
    ...Object.fromEntries(flags.map(flag=>[flag,false])),
    nextGate:'Technical AP23K2 acceptance and explicit DEC-2026-040 decision, then separately commissioned AP23K3.'};
  validateCompletionMetadata(report,integrity);await writeFile(resolve(root,proof),JSON.stringify(report,null,2)+'\n');
  for(const row of bindings)assert.deepEqual(await bind(row.path),row,'Final readback '+row.path);
  return {...report,bindings:bindings.length,steps:steps.map(step=>({id:step.id,exitCode:step.exitCode}))};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(arg=>['--write','--check'].includes(arg)));
  console.log(JSON.stringify(await finalize({write:process.argv.includes('--write'),check:process.argv.includes('--check')}),null,2));
}
