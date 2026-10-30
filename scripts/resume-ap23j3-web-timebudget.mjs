// SPDX-License-Identifier: AGPL-3.0-only
// Preserve the real failed run and repeat the complete unchanged web test file.
// Only the global file budget changes. No product, release or operating change.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {access,mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const out='outputs/ap23j3-2026-10-27',archive=out+'/initial-web-timebudget';
const qaPath=out+'/QA-AP23J3.json',runnerPath='scripts/check-ap23j3.mjs';
const contextPath=archive+'/continuation-inputs.json',stage='.work/ap23j3-spfx-build-704YSX';
const failedQaSha256='2a41b26845cb5ecd793c8aa4b3e34e02d1d89da29b36fae09ca4e96ad819ee65';
const failedWebSha256='cdf4b18f05db93a95cfd7df11356a93630ee6534db87423ca7918c6bba5b8451';
const initialRunnerSha256='dd5ef374240191a7c2f53405b56ecd97c0826368baa4cfec4637de15f2f2e6cf';
const webTest='tests/public-app/ap23j3-build.test.ts';
const initialArgs=['--import','tsx','--test','--test-timeout=180000',webTest];
const finalArgs=['--import','tsx','--test','--test-timeout=900000',webTest];
const firstSix=['typecheck','native-schema-rebuild','candidate-rebuild','native-references','product-regression','host-lifecycle'];
const initialCounts={tests:22,pass:21,fail:0,cancelled:1,skipped:0,todo:0};
const finalCounts={tests:27,pass:27,fail:0,cancelled:0,skipped:0,todo:0};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const raw=path=>readFile(resolve(root,path));
const json=async path=>JSON.parse(await raw(path));
const bind=async path=>{const bytes=await raw(path);return{path,byteLength:bytes.length,sha256:hash(bytes)};};
const tap=text=>Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));
const env={...process.env,PYTHONDONTWRITEBYTECODE:'1',PATH:dirname(process.execPath)+':'+(process.env.PATH??'')};
const run=(command,args)=>spawnSync(command,args,{cwd:root,env,encoding:'utf8',maxBuffer:64*1024*1024});
function passed(value,label){assert.ok(value.tests>0,label);assert.equal(value.pass,value.tests,label);
  for(const key of['fail','cancelled','skipped','todo'])assert.equal(value[key],0,label+' '+key);}
async function tree(path){const files=[];for(const item of await readdir(resolve(root,path),{withFileTypes:true})){
  assert.ok(!item.isSymbolicLink(),'Unexpected source symlink '+path+'/'+item.name);
  if(item.isDirectory())files.push(...await tree(path+'/'+item.name));else{assert.ok(item.isFile());files.push(path+'/'+item.name);}
}return files.sort();}
async function guard(){
  const result=run(process.execPath,['scripts/check-ap23j3-preservation.mjs']);
  assert.equal(result.status,0,(result.stdout??'')+(result.stderr??''));
  const actual=JSON.parse(result.stdout);assert.equal(actual.protectedFilesVerified,4466);
  assert.equal(actual.inventorySha256,'8b431957fa6228e53f271c6bab994486919247d1a84b20684f116e8578424f31');
  const accepted=run(process.execPath,['scripts/archive-ap23j2-acceptance.mjs','--check']);
  assert.equal(accepted.status,0,(accepted.stdout??'')+(accepted.stderr??''));return actual;
}
async function inputSnapshot(){
  const paths=['package.json','package-lock.json','tsconfig.json','scripts/build-public-app.mjs',
    'scripts/build-ap23j3-public.mjs','scripts/resume-ap23j3-web-timebudget.mjs',
    'scripts/check_ap23j3_independent.py','scripts/check-ap23j3-references.ts',
    'scripts/build-ap23j3-schemas.mjs','scripts/build-ap23j3-candidate.ts'];
  for(const dir of['src','schemas','data/candidates/2026-10-27-ap23j3','tests','spfx/src','spfx/scripts','spfx/config','spfx/test','spfx/test-build'])
    paths.push(...(await tree(dir)).filter(path=>/\.(?:ts|tsx|js|mjs|cjs|py|json|css|scss|html|svg)$/.test(path)));
  for(const item of await readdir(resolve(root,'spfx'),{withFileTypes:true}))if(item.isFile())paths.push('spfx/'+item.name);
  return Promise.all([...new Set(paths)].sort().map(bind));
}
async function stageSnapshot(){
  const pairs=[];
  for(const dir of['spfx/src','spfx/scripts','spfx/config','spfx/test','spfx/test-build']){
    const current=await tree(dir),copied=(await tree(stage+'/'+dir)).map(path=>path.slice(stage.length+1));
    assert.deepEqual(copied,current,'Unchanged stage inventory '+dir);
    for(const path of current){const source=await bind(path),copy=await bind(stage+'/'+path);
      assert.equal(source.sha256,copy.sha256,'Frozen stage source/test input '+path);assert.equal(source.byteLength,copy.byteLength);pairs.push({source,stage:copy});}
  }
  for(const dir of['src/core','src/ui'])for(const path of(await tree(dir)).filter(path=>/\.(?:ts|tsx|css)$/.test(path)&&!path.includes('/preview/'))){
    const copy=await bind(stage+'/spfx/src/product/'+path.slice(4));assert.equal(hash(await raw(path)),copy.sha256,'Frozen compiled product input '+path);
  }
  return pairs;
}
async function optionalEvidence(){
  const rows=[];for(const path of[out+'/export-verification.json',out+'/browser-verification.json']){
    try{await access(resolve(root,path));rows.push(await bind(path));}catch(error){if(error.code!=='ENOENT')throw error;}
  }return rows;
}
async function verifyInitial(){
  const failedBytes=await raw(archive+'/QA-AP23J3.failed.json'),logBytes=await raw(archive+'/actual-web-bundle-timeout180000.txt');
  assert.equal(hash(failedBytes),failedQaSha256);assert.equal(failedBytes.length,2534);
  assert.equal(hash(logBytes),failedWebSha256);assert.equal(logBytes.length,6319);
  const failed=JSON.parse(failedBytes);assert.equal(failed.status,'failed');assert.equal(failed.steps.length,7);
  assert.deepEqual(failed.steps.slice(0,6).map(step=>step.id),firstSix);
  assert.deepEqual(failed.steps.map(step=>step.exitCode),[0,0,0,0,0,0,1]);
  assert.deepEqual(failed.steps[6].counts,initialCounts);assert.deepEqual(tap(logBytes.toString()),initialCounts);
  assert.equal(failed.steps[6].sha256,failedWebSha256);assert.equal(failed.steps[6].byteLength,logBytes.length);
  assert.match(logBytes.toString(),/failureType: 'testTimeoutFailure'/);assert.match(logBytes.toString(),/test timed out after 180000ms/);
  assert.equal([...logBytes.toString().matchAll(/^not ok /gm)].length,1);
  const oldRunner=await raw(archive+'/check-ap23j3-timeout180000.mjs');assert.equal(hash(oldRunner),initialRunnerSha256);
  const replacement=oldRunner.toString().replace("'--test-timeout=180000'","'--test-timeout=900000'");
  assert.notEqual(replacement,oldRunner.toString());assert.equal((await raw(runnerPath)).toString(),replacement,'Full runner changes only its global web budget');
  for(const row of failed.steps.slice(0,6))assert.deepEqual(await bind(row.log),{path:row.log,byteLength:row.byteLength,sha256:row.sha256});
  assert.deepEqual(failed.steps[4].counts,{tests:3191,pass:3191,fail:0,cancelled:0,skipped:0,todo:0});
  assert.deepEqual(failed.steps[5].counts,{tests:60,pass:60,fail:0,cancelled:0,skipped:0,todo:0});
  return failed;
}
const mode=process.argv[2];assert.ok(['--prepare','--resume'].includes(mode)&&process.argv.length===3);
if(mode==='--prepare'){
  const preserved=await guard(),qaBytes=await raw(qaPath),logBytes=await raw(out+'/actual-web-bundle.txt'),runnerBytes=await raw(runnerPath);
  assert.equal(hash(qaBytes),failedQaSha256);assert.equal(hash(logBytes),failedWebSha256);assert.equal(hash(runnerBytes),initialRunnerSha256);
  const inputs=await inputSnapshot(),stageInputs=await stageSnapshot(),unchangedEvidence=await optionalEvidence();
  const webArtifacts=await Promise.all((await tree('.work/public-ap23j3')).map(bind));
  await mkdir(resolve(root,archive));
  for(const[path,bytes]of[[archive+'/QA-AP23J3.failed.json',qaBytes],[archive+'/actual-web-bundle-timeout180000.txt',logBytes],
    [archive+'/check-ap23j3-timeout180000.mjs',runnerBytes]])await writeFile(resolve(root,path),bytes,{flag:'wx'});
  const context={workPackage:'AP23J3',kind:'bounded-complete-web-test-timebudget-continuation',head:preserved.head,
    guardSha256:preserved.inventorySha256,stage,initialCommand:{command:process.execPath,args:initialArgs},
    finalCommand:{command:process.execPath,args:finalArgs},initialCounts,expectedFinalCounts:finalCounts,
    failedQa:await bind(archive+'/QA-AP23J3.failed.json'),failedWebLog:await bind(archive+'/actual-web-bundle-timeout180000.txt'),
    initialRunner:await bind(archive+'/check-ap23j3-timeout180000.mjs'),testFile:await bind(webTest),
    sourceInputsBefore:inputs,stageInputsBefore:stageInputs,webArtifactsBefore:webArtifacts,unchangedEvidence,
    productChangesAllowed:false,sourceReleaseApproved:false,operatingChanges:false};
  await writeFile(resolve(root,contextPath),JSON.stringify(context,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({status:'initial-failure-archived-exactly',context:await bind(contextPath),inputs:inputs.length,
    stageInputs:stageInputs.length,initialCounts},null,2));
}else{
  const preserved=await guard(),context=await json(contextPath),failed=await verifyInitial();
  assert.equal(context.stage,stage);assert.equal(context.head,preserved.head);assert.deepEqual(context.initialCommand.args,initialArgs);
  assert.deepEqual(context.finalCommand.args,finalArgs);assert.deepEqual(context.testFile,await bind(webTest));
  assert.deepEqual(await inputSnapshot(),context.sourceInputsBefore,'All product/test/data inputs unchanged since failure archive');
  assert.deepEqual(await stageSnapshot(),context.stageInputsBefore,'Frozen actual package source parity before continuation');
  for(const row of context.unchangedEvidence)assert.deepEqual(await bind(row.path),row,'Existing browser/export evidence');
  const commands=[
    ['actual-web-bundle',process.execPath,finalArgs],
    ['independent-native',resolve(root,'.venv/bin/python'),['scripts/check_ap23j3_independent.py','--write']],
    ['independent-schema',resolve(root,'.venv/bin/python'),['tests/data/test_ap23j3_contract.py']],
    ['j2-archive',process.execPath,['scripts/archive-ap23j2-acceptance.mjs','--check']],
    ['j3-governance',process.execPath,['--test','tests/governance/ap23j2-acceptance.test.mjs','tests/governance/ap23j3-preservation.test.mjs']],
    ['web-build',process.execPath,['scripts/build-ap23j3-public.mjs']]
  ];
  const continuation={context:await bind(contextPath),initialQa:context.failedQa,initialWebLog:context.failedWebLog,initialRunner:context.initialRunner,
    initialCounts,initialGlobalTimeoutMs:180000,finalGlobalTimeoutMs:900000,testFile:context.testFile,
    initialCommand:context.initialCommand,finalCommand:context.finalCommand,firstSixStepsReused:true,
    assertionFailuresInInitialAttempt:0,initialCancelledTests:1,completeTestFileRepeated:true,
    commands:commands.map(([id,command,args])=>({id,command,args})),
    sourceInputsBefore:context.sourceInputsBefore,stageInputsBefore:context.stageInputsBefore,
    webArtifactsBefore:context.webArtifactsBefore,unchangedEvidence:context.unchangedEvidence,
    sourceReleaseApproved:false,operatingChanges:false};
  const report={...failed,status:'running',steps:failed.steps.slice(0,6),webTimeBudgetContinuation:continuation};
  await writeFile(resolve(root,qaPath),JSON.stringify(report,null,2)+'\n');
  for(const[id,command,args]of commands){
    const result=run(command,args),text=(result.stdout??'')+(result.stderr??'')+(result.error?String(result.error):''),log=out+'/'+id+'.txt';
    await writeFile(resolve(root,log),text);
    const step={id,command,args,exitCode:result.status,log,...await bind(log),counts:tap(text)};
    report.steps.push(step);if(result.status!==0)report.status='failed';
    await writeFile(resolve(root,qaPath),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(step));
    if(result.status!==0)break;
    if(Object.hasOwn(step.counts,'tests'))passed(step.counts,id);
    if(id==='actual-web-bundle')assert.deepEqual(step.counts,finalCounts,'Entire unchanged test file must finish all 27 tests');
  }
  await guard();
  continuation.sourceInputsAfter=await inputSnapshot();assert.deepEqual(continuation.sourceInputsAfter,context.sourceInputsBefore);
  continuation.stageInputsAfter=await stageSnapshot();assert.deepEqual(continuation.stageInputsAfter,context.stageInputsBefore);
  continuation.webArtifactsAfter=await Promise.all((await tree('.work/public-ap23j3')).map(bind));
  assert.deepEqual(continuation.webArtifactsAfter,context.webArtifactsBefore,'Only reproducible byte-identical web rebuilds');
  for(const row of context.unchangedEvidence)assert.deepEqual(await bind(row.path),row,'Browser/export evidence unchanged');
  assert.deepEqual(report.steps.slice(0,6),failed.steps.slice(0,6),'Reused first six exact successful step descriptors');
  if(report.status!=='failed'){assert.equal(report.steps.length,12);report.status='passed';}
  report.manifestSha256=hash(await raw('data/candidates/2026-10-27-ap23j3/manifest.json'));
  await writeFile(resolve(root,qaPath),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,steps:report.steps.length,initialFailurePreserved:context.failedQa,
    initialWebLogPreserved:context.failedWebLog,completeWebTests:report.steps[6].counts,productInputsChanged:false,operatingChanges:false},null,2));
  process.exitCode=report.status==='passed'?0:1;
}
