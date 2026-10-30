// SPDX-License-Identifier: AGPL-3.0-only
// New local I2 evidence only. Never refresh historical I1/H3 proofs.
import assert from 'node:assert/strict';
import {readFile,readdir,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const out='outputs/ap23i2-2026-10-22',candidate='outputs/ap23i2-candidate-2026-10-22',proof=out+'/local-completion.json';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=path=>readFile(resolve(root,path));
const json=async path=>JSON.parse(await read(path));
const bind=async path=>{const bytes=await read(path);return{path,byteLength:bytes.length,sha256:hash(bytes)};};
const documents=['docs/fachrecht/abnahme-ap23i1.md','docs/architektur/verwaltungsverfahrensvertrag-ap23i2.md',
  'docs/architektur/verwaltungsverfahrensvertrag-ap23i2-pruefung.md',
  'docs/entscheidungen/DEC-2026-038-konkretisierte-gesetzliche-fristen-und-hinweiszweige-v6.md'];
const sourceFiles=['scripts/build-ap23i2-candidate.mjs','scripts/build-ap23i2-schemas.mjs','scripts/check-ap23i2-contract.mjs',
  'scripts/check_ap23i2_independent.py','scripts/finalize-ap23i2.mjs','scripts/check-ap23i2-preservation.mjs',
  'scripts/prepare-ap23i2.mjs','scripts/archive-ap23i1-acceptance.mjs','tests/governance/ap23i1-acceptance.test.mjs',
  'tests/governance/ap23i2-preservation.test.mjs','tests/governance/ap23i2-schemas.test.mjs','tests/governance/ap23i2-contract.test.mjs',
  'tests/governance/ap23i2-completion.test.mjs',
  'outputs/ap23i1-abnahme-2026-10-22/receipt.json','outputs/ap23i1-2026-10-22/local-completion.json'];
const boundaryKeys=['runtimeActive','productIntegration','calendarExportEnabled','sourceReleaseApproved','productCodeChanged',
  'nativeSchemasChanged','acceptedLegalDataChanged','existingTestsChanged','releaseBuildPerformed','commitCreated','sourcePushPerformed',
  'operatingChanges','i3Started','publicProjectStatusUpdated','publicTechnicalFindingsPublished'];
export function validateCompletionMetadata(saved,integrity){
  assert.equal(saved.workPackage,'AP23I2');assert.equal(saved.asOf,'2026-10-22');
  assert.equal(saved.status,'passed-awaiting-technical-acceptance');assert.equal(saved.professionalI1Acceptance,true);
  assert.equal(saved.technicalI2Acceptance,false);assert.deepEqual(saved.contractDecision,{id:'DEC-2026-038',status:'proposed'});
  assert.deepEqual(saved.proposedFormats,{administrativeCatalog:'6.0.0',manifest:'13.0.0',minimumConsumer:'13.0.0',holidayCatalog:'2.0.0',calendar:'3.0.0'});
  for(const key of boundaryKeys)assert.equal(saved[key],false,key);
  assert.deepEqual(saved.counts,integrity.counts);assert.deepEqual(saved.manifest,integrity.manifest);
  assert.equal(saved.referenceCases,249);assert.equal(saved.oldNativeReferenceCalculations,79);assert.equal(saved.forgedContextBlocks,237);
  assert.deepEqual(saved.referenceCounts,{datedResearchValue:110,unresolvedBoundaryProposed:16,qualificationBoundaryProposed:117,researchWindowBoundary:6});
  assert.equal(saved.nativeReaderNegatives,5);assert.ok(saved.negativeCatalogMutations>=40);assert.ok(saved.negativeInputMutations>=30);
  assert.ok(saved.governanceTests>=230);assert.equal(saved.protectedFilesVerified,2759);
  assert.equal(saved.independentStatus,'passedIndependentStructuralAndResearchComparison');
  assert.ok(Number.isSafeInteger(saved.localLinksChecked)&&saved.localLinksChecked>0);
  assert.match(saved.head,/^[a-f0-9]{40}$/);assert.ok(Array.isArray(saved.bindings)&&saved.bindings.length>60);
  assert.equal(new Set(saved.bindings.map(row=>row.path)).size,saved.bindings.length);
  assert.deepEqual(saved.steps.map(row=>row.id),['schemas','candidate','contract','independent','i1-archive','governance-tests','preservation','typecheck','whitespace']);
  for(const step of saved.steps)assert.equal(step.exitCode,0,step.id);
  assert.equal(saved.nextGate,'Technical AP23I2 acceptance and explicit DEC-2026-038 decision, then separately commissioned AP23I3.');
  const keys=['workPackage','asOf','status','head','professionalI1Acceptance','technicalI2Acceptance','contractDecision','proposedFormats',
    'counts','referenceCases','referenceCounts','negativeCatalogMutations','negativeInputMutations','nativeReaderNegatives',
    'oldNativeReferenceCalculations','forgedContextBlocks','governanceTests','protectedFilesVerified','independentStatus','manifest',
    'localLinksChecked','steps','bindings',...boundaryKeys,'nextGate'];
  assert.deepEqual(Object.keys(saved).sort(),keys.sort(),'Closed completion proof fields');
  return true;
}
async function walk(path){
  const paths=[];
  for(const item of await readdir(resolve(root,path),{withFileTypes:true})){
    assert.ok(!item.isSymbolicLink(),'Symlink '+path+'/'+item.name);
    if(item.isDirectory())paths.push(...await walk(path+'/'+item.name));
    else{assert.ok(item.isFile());paths.push(path+'/'+item.name);}
  }
  return paths.sort();
}
async function bindingPaths(living){return [...new Set([...documents,...living,...sourceFiles,
  ...await walk('schemas/candidates/ap23i2'),...await walk(candidate),...(await walk(out)).filter(path=>path!==proof)])].sort();}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
assert.ok(process.argv.slice(2).every(arg=>['--write','--check'].includes(arg)));
assert.notEqual(process.argv.includes('--write'),process.argv.includes('--check'),'Choose exactly one mode');
if(process.argv.includes('--check')){
  const saved=await json(proof);
  const integrity=await json(candidate+'/candidate-integrity.json'),preservation=await json(out+'/preservation-verification.json');
  validateCompletionMetadata(saved,integrity);
  assert.deepEqual(saved.bindings.map(row=>row.path),await bindingPaths(preservation.livingStatus.map(row=>row.path)),'Exact final evidence inventory');
  for(const row of saved.bindings)assert.deepEqual(await bind(row.path),row,row.path);
  const qa=await json(candidate+'/QA-AP23I2.json'),independent=await json(candidate+'/QA-AP23I2-INDEPENDENT.json');
  for(const key of ['referenceCases','negativeCatalogMutations','negativeInputMutations','oldNativeReferenceCalculations','forgedContextBlocks'])
    assert.equal(saved[key],qa[key],'Exact bound QA counter '+key);
  assert.deepEqual(saved.referenceCounts,qa.counts);assert.equal(saved.nativeReaderNegatives,qa.readerNegatives.length);
  assert.equal(saved.referenceCases,independent.referenceCases);assert.equal(saved.independentStatus,independent.status);
  const testLog=(await read(out+'/governance-tests.txt')).toString();
  assert.equal(saved.governanceTests,Number(testLog.match(/^# tests (\d+)$/m)?.[1]),'Exact TAP count');
  assert.match(testLog,/^# fail 0$/m);assert.match(testLog,/^# skipped 0$/m);assert.match(testLog,/^# todo 0$/m);
  const head=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim();assert.equal(saved.head,head);
  for(const script of ['scripts/archive-ap23i1-acceptance.mjs','scripts/check-ap23i2-preservation.mjs']){
    const result=spawnSync(process.execPath,[script,...(script.includes('archive')?['--check']:[])],{cwd:root,encoding:'utf8'});
    assert.equal(result.status,0,'Fresh read-only verification '+script);
  }
  for(const step of saved.steps){
    const descriptor=saved.bindings.find(row=>row.path===step.path);
    assert.deepEqual({path:step.path,byteLength:step.byteLength,sha256:step.sha256},descriptor,'Exact step descriptor '+step.id);
    assert.deepEqual(await bind(step.path),descriptor);
  }
  console.log(JSON.stringify({status:'bound-I2-result-reverified',bindings:saved.bindings.length,
    professionalI1Acceptance:true,technicalI2Acceptance:false,contractDecision:'proposed',runtimeActive:false},null,2));
}else{
  const steps=[];
  const commands=[
    ['schemas',process.execPath,['scripts/build-ap23i2-schemas.mjs']],
    ['candidate',process.execPath,['scripts/build-ap23i2-candidate.mjs','--check']],
    ['contract',process.execPath,['--import','tsx','scripts/check-ap23i2-contract.mjs','--write']],
    ['independent',resolve(root,'.venv/bin/python'),['scripts/check_ap23i2_independent.py','--write']],
    ['i1-archive',process.execPath,['scripts/archive-ap23i1-acceptance.mjs','--check']],
    ['governance-tests',process.execPath,['--import','tsx','--test','tests/governance/ap23i1-acceptance.test.mjs',
      'tests/governance/ap23i2-preservation.test.mjs','tests/governance/ap23i2-schemas.test.mjs','tests/governance/ap23i2-contract.test.mjs',
      'tests/governance/ap23i2-completion.test.mjs']],
    ['preservation',process.execPath,['scripts/check-ap23i2-preservation.mjs','--write']],
    ['typecheck',process.execPath,['node_modules/typescript/bin/tsc','--noEmit']],
    ['whitespace','git',['diff','--check']]
  ];
  for(const[id,command,args]of commands){
    const result=spawnSync(command,args,{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024,
      env:{...process.env,PATH:dirname(process.execPath)+':'+(process.env.PATH??'')}});
    const log=(result.stdout??'')+(result.stderr??'')+(result.error?String(result.error):''),path=out+'/'+id+'.txt';
    await writeFile(resolve(root,path),log);
    steps.push({id,command:command===process.execPath?'node':command===resolve(root,'.venv/bin/python')?'.venv/bin/python':command,
      args,exitCode:result.status,...await bind(path)});
    assert.equal(result.status,0,'Failed I2 step '+id);
  }
  const qa=await json(candidate+'/QA-AP23I2.json'),independent=await json(candidate+'/QA-AP23I2-INDEPENDENT.json');
  assert.equal(qa.status,'passed');assert.equal(qa.referenceCases,249);assert.equal(independent.referenceCases,249);
  assert.equal(independent.status,'passedIndependentStructuralAndResearchComparison');
  assert.equal(qa.oldNativeReferenceCalculations,79);assert.equal(qa.forgedContextBlocks,237);
  assert.ok(qa.readerNegatives.length>=5);assert.ok(qa.negativeCatalogMutations>=40);assert.ok(qa.negativeInputMutations>=30);
  for(const row of qa.results)assert.equal(row.actual.exportAllowed,false);
  const integrity=await json(candidate+'/candidate-integrity.json');
  assert.equal(hash(await read(integrity.manifest.path)),integrity.manifest.sha256);
  assert.equal(integrity.counts.totalPaths,113);assert.equal(integrity.counts.newPaths,34);assert.equal(integrity.counts.preservedPaths,79);
  assert.equal(integrity.counts.unchangedRawArtifacts,43);assert.equal(integrity.counts.physicalCalendars,35);
  for(const row of integrity.artifacts)assert.deepEqual(await bind(row.path),row,row.path);
  assert.equal((await walk(candidate+'/bundle')).length,45);
  const preservation=await json(out+'/preservation-verification.json');
  assert.equal(preservation.protectedFilesVerified,2759);
  const living=preservation.livingStatus.map(row=>row.path);let localLinksChecked=0;
  for(const path of [...documents,...living]){
    const text=(await read(path)).toString();
    if(documents.includes(path))assert.equal(/[;ß]/u.test(text),false,'Language style '+path);
    for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
      let target=match[1].replace(/^<|>$/g,'').split(/\s+"/)[0];
      if(/^(?:https?:|mailto:|codex:|plugin:|#)/i.test(target))continue;
      target=decodeURIComponent(target.split('#')[0]);if(!target)continue;
      const absolute=resolve(root,dirname(path),target);
      if(absolute!==resolve(root,proof))await access(absolute).catch(()=>{throw Error('Broken local link '+path+' -> '+target);});
      localLinksChecked++;
    }
  }
  const testLog=(await read(out+'/governance-tests.txt')).toString();
  const tests=Number(testLog.match(/^# tests (\d+)$/m)?.[1]);
  assert.ok(tests>=230);assert.match(testLog,/^# fail 0$/m);assert.match(testLog,/^# skipped 0$/m);assert.match(testLog,/^# todo 0$/m);
  const files=await bindingPaths(living);
  const bindings=await Promise.all(files.map(bind));
  const head=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim();
  assert.equal(head,preservation.gitHead);
  const report={workPackage:'AP23I2',asOf:'2026-10-22',status:'passed-awaiting-technical-acceptance',head,
    professionalI1Acceptance:true,technicalI2Acceptance:false,contractDecision:{id:'DEC-2026-038',status:'proposed'},
    proposedFormats:{administrativeCatalog:'6.0.0',manifest:'13.0.0',minimumConsumer:'13.0.0',holidayCatalog:'2.0.0',calendar:'3.0.0'},
    counts:integrity.counts,referenceCases:qa.referenceCases,referenceCounts:qa.counts,
    negativeCatalogMutations:qa.negativeCatalogMutations,negativeInputMutations:qa.negativeInputMutations,
    nativeReaderNegatives:qa.readerNegatives.length,oldNativeReferenceCalculations:qa.oldNativeReferenceCalculations,
    forgedContextBlocks:qa.forgedContextBlocks,governanceTests:tests,protectedFilesVerified:2759,
    independentStatus:independent.status,manifest:integrity.manifest,localLinksChecked,steps,bindings,
    runtimeActive:false,productIntegration:false,calendarExportEnabled:false,sourceReleaseApproved:false,
    productCodeChanged:false,nativeSchemasChanged:false,acceptedLegalDataChanged:false,existingTestsChanged:false,
    releaseBuildPerformed:false,commitCreated:false,sourcePushPerformed:false,operatingChanges:false,i3Started:false,
    publicProjectStatusUpdated:false,publicTechnicalFindingsPublished:false,
    nextGate:'Technical AP23I2 acceptance and explicit DEC-2026-038 decision, then separately commissioned AP23I3.'};
  validateCompletionMetadata(report,integrity);
  await writeFile(resolve(root,proof),JSON.stringify(report,null,2)+'\n');
  for(const row of bindings)assert.deepEqual(await bind(row.path),row,'Final readback '+row.path);
  console.log(JSON.stringify({...report,bindings:bindings.length,steps:steps.map(step=>({id:step.id,exitCode:step.exitCode}))},null,2));
}
}
