// SPDX-License-Identifier: AGPL-3.0-only
// New isolated technical evidence only. Accepted H1/G3 artefacts are never refreshed.
import assert from 'node:assert/strict';
import {readFile,readdir,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const out='outputs/ap23h2-2026-10-22',candidate='outputs/ap23h2-candidate-2026-10-22',proof=out+'/local-completion.json';
const hash=b=>createHash('sha256').update(b).digest('hex');
const read=p=>readFile(resolve(root,p));
const json=async p=>JSON.parse(await read(p));
const bind=async path=>{const b=await read(path);return{path,byteLength:b.length,sha256:hash(b)};};
async function walk(path){const paths=[];for(const e of await readdir(resolve(root,path),{withFileTypes:true})){
  assert.ok(!e.isSymbolicLink(),'Symlink '+path+'/'+e.name);
  if(e.isDirectory())paths.push(...await walk(path+'/'+e.name));else{assert.ok(e.isFile());paths.push(path+'/'+e.name);}
}return paths.sort();}
assert.ok(process.argv.slice(2).every(a=>['--write','--check'].includes(a)));
assert.notEqual(process.argv.includes('--write'),process.argv.includes('--check'),'Choose exactly one mode');
if(process.argv.includes('--check')){
  const saved=await json(proof);assert.equal(saved.status,'passed-awaiting-technical-acceptance');
  for(const b of saved.bindings)assert.deepEqual(await bind(b.path),b,b.path);
  console.log(JSON.stringify({status:'bound-H2-result-reverified',bindings:saved.bindings.length,
    professionalH1Acceptance:true,technicalH2Acceptance:false,contractDecision:'proposed',runtimeActive:false},null,2));
}else{
  const steps=[];
  const commands=[
    ['schemas',process.execPath,['scripts/build-ap23h2-schemas.mjs']],
    ['candidate',process.execPath,['scripts/build-ap23h2-candidate.mjs','--check']],
    ['contract',process.execPath,['--import','tsx','scripts/check-ap23h2-contract.mjs','--write']],
    ['independent',resolve(root,'.venv/bin/python'),['scripts/check_ap23h2_independent.py','--write']],
    ['h1-archive',process.execPath,['scripts/archive-ap23h1-acceptance.mjs','--check']],
    ['h1-archive-tests',process.execPath,['--test','tests/governance/ap23h1-acceptance.test.mjs']],
    ['preservation',process.execPath,['scripts/check-ap23h2-preservation.mjs','--write']],
    ['typecheck',process.execPath,['node_modules/typescript/bin/tsc','--noEmit']],
    ['whitespace','git',['diff','--check']]
  ];
  for(const[id,command,args]of commands){
    const r=spawnSync(command,args,{cwd:root,encoding:'utf8',maxBuffer:20*1024*1024,
      env:{...process.env,PATH:dirname(process.execPath)+':'+(process.env.PATH??'')}});
    const log=(r.stdout??'')+(r.stderr??'')+(r.error?String(r.error):''),path=out+'/'+id+'.txt';
    await writeFile(resolve(root,path),log);
    steps.push({id,command:command===process.execPath?'node':command===resolve(root,'.venv/bin/python')?'.venv/bin/python':command,args,
      exitCode:r.status,...await bind(path)});
    assert.equal(r.status,0,'Failed H2 step '+id);
    if(id==='h1-archive-tests')for(const[k,n]of Object.entries({tests:48,pass:48,fail:0,skipped:0}))assert.match(log,new RegExp('# '+k+' '+n+'\\n'));
  }
  const qa=await json(out+'/QA-AP23H2.json'),independent=await json(out+'/QA-AP23H2-INDEPENDENT.json');
  assert.equal(qa.status,'passed');assert.equal(qa.referenceCases,118);assert.equal(independent.referenceCases,118);
  assert.equal(independent.status,'passedIndependentStructuralAndResearchComparison');
  assert.equal(qa.paths,79);assert.equal(qa.preservedPaths,58);assert.equal(qa.newPaths,21);
  assert.equal(qa.readerNegatives.length,6);assert.equal(qa.oldNativeReferenceCalculations,58);assert.equal(qa.forgedContextBlocks,174);
  assert.ok(qa.negativeCatalogMutations>=40,'Missing resealed candidate mutation probes');
  assert.ok(qa.negativeInputMutations>=30,'Missing explicit current-fact probes');
  for(const row of qa.results)assert.equal(row.actual.exportAllowed,false);
  const integrity=await json(candidate+'/candidate-integrity.json');
  assert.equal(hash(await read(integrity.manifest.path)),integrity.manifest.sha256);
  for(const a of integrity.artifacts)assert.deepEqual(await bind(a.path),a,a.path);
  const bundle=await walk(candidate+'/bundle');assert.equal(bundle.length,45);
  const preservation=await json(out+'/preservation-verification.json');assert.equal(preservation.protectedFilesVerified,1754);
  const project=await json(out+'/issue48-status.json');assert.equal(project.readbackVerified,true);assert.equal(project.publicUpdatePerformed,true);
  const documents=[
    'docs/fachrecht/abnahme-ap23h1.md','docs/architektur/verwaltungsverfahrensvertrag-ap23h2.md',
    'docs/architektur/verwaltungsverfahrensvertrag-ap23h2-pruefung.md',
    'docs/entscheidungen/DEC-2026-037-prozesskalender-und-qualifizierte-handlungen-v5.md'
  ];
  const living=preservation.livingStatus.map(r=>r.path);let localLinksChecked=0;
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
  const files=[...new Set([
    ...documents,...living,'scripts/build-ap23h2-candidate.mjs','scripts/build-ap23h2-schemas.mjs',
    'scripts/check-ap23h2-contract.mjs','scripts/check_ap23h2_independent.py','scripts/check-ap23h2-preservation.mjs',
    'scripts/finalize-ap23h2.mjs','scripts/archive-ap23h1-acceptance.mjs','tests/governance/ap23h1-acceptance.test.mjs',
    ...await walk('schemas/candidates/ap23h2'),...await walk(candidate),...(await walk(out)).filter(p=>p!==proof)
  ])].sort();
  const bindings=await Promise.all(files.map(bind));
  const head=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim();assert.equal(head,preservation.head);
  const report={workPackage:'AP23H2',asOf:'2026-10-22',status:'passed-awaiting-technical-acceptance',head,
    professionalH1Acceptance:true,technicalH2Acceptance:false,contractDecision:{id:'DEC-2026-037',status:'proposed'},
    proposedFormats:{administrativeCatalog:'5.0.0',manifest:'12.0.0',minimumConsumer:'12.0.0',holidayCatalog:'2.0.0',calendar:'3.0.0'},
    counts:integrity.counts,referenceCases:qa.referenceCases,referenceCounts:qa.counts,
    negativeCatalogMutations:qa.negativeCatalogMutations,negativeInputMutations:qa.negativeInputMutations,
    nativeReaderNegatives:qa.readerNegatives.length,oldNativeReferenceCalculations:58,forgedContextBlocks:174,
    calendarEndEligibilityComparisons:qa.calendarEndEligibilityComparisons,h1ArchiveTests:48,
    protectedFilesVerified:1754,independentStatus:independent.status,
    manifest:integrity.manifest,localLinksChecked,steps,bindings,
    runtimeActive:false,productIntegration:false,calendarExportEnabled:false,sourceReleaseApproved:false,
    productCodeChanged:false,nativeSchemasChanged:false,acceptedLegalDataChanged:false,existingTestsChanged:false,
    releaseBuildPerformed:false,commitCreated:false,sourcePushPerformed:false,operatingChanges:false,h3Started:false,
    publicProjectStatusUpdated:true,publicTechnicalH2FindingsPublished:false,
    nextGate:'Technical AP23H2 acceptance and explicit DEC-2026-037 decision, then separately commissioned AP23H3.'};
  await writeFile(resolve(root,proof),JSON.stringify(report,null,2)+'\n');
  for(const a of bindings)assert.deepEqual(await bind(a.path),a,'Final readback '+a.path);
  await access(resolve(root,proof));
  console.log(JSON.stringify({...report,bindings:bindings.length,steps:steps.map(s=>({id:s.id,exitCode:s.exitCode}))},null,2));
}
