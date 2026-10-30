// SPDX-License-Identifier: AGPL-3.0-only
// Retest only the already built, byte-pinned I3 SPPKG. No compiler or package rebuild.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const reportPath='outputs/ap23i3-2026-10-22/spfx-build.json';
const initialBytes=await readFile(reportPath);
const initial=JSON.parse(initialBytes);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const bind=async path=>{const bytes=await readFile(path);return{path,byteLength:bytes.length,sha256:sha(bytes)};};
if(process.argv.includes('--finalize-existing')){
  assert.equal(initial.status,'passed');assert.equal(initial.retestOnly,true);assert.equal(initial.compilerAndPackageRebuilt,false);
  const original=JSON.parse(await readFile(initial.initialTimeBudgetAttempt.path));
  const retest=initial.timeBudgetRetest;
  assert.equal(retest.exitCode,0);assert.deepEqual(retest.args.slice(3),original.steps[4].args.slice(3));
  assert.equal(retest.counts.fail,0);assert.equal(retest.counts.cancelled,0);
  assert.deepEqual(await bind(initial.testPackage.path),initial.testPackage);
  const final={...initial,steps:[...original.steps.slice(0,4),retest],
    verificationPath:`${initial.stage}/verification-budget240.json`,historicalTestFileCount:retest.args.slice(3).length};
  await writeFile(reportPath,JSON.stringify(final,null,2)+'\n');
  await writeFile(final.verificationPath,JSON.stringify(final,null,2)+'\n');
  console.log(JSON.stringify({status:final.status,historicalTestFileCount:final.historicalTestFileCount,counts:retest.counts,package:final.testPackage}));
  process.exit(0);
}
assert.equal(initial.status,'failed');
assert.equal(initial.steps.length,5);
assert.deepEqual(initial.steps.map(step=>step.exitCode),[0,0,0,0,1]);
assert.equal(initial.operatingPackagePreserved,true);
const stage=initial.stage;
const packagePath=`${stage}/spfx/sharepoint/solution/fristenrechner-schweiz.sppkg`;
const packageBefore=await bind(packagePath);
assert.equal(packageBefore.sha256,'481b337573991dbdd2b41a4f327811a6d2fc4211dcb219e3c5845f009f1dd1fd');
for(const item of initial.protectedBefore)assert.deepEqual(await bind(item.path),item);
for(const step of initial.steps){const bytes=await readFile(step.log);assert.equal(sha(bytes),step.sha256);assert.equal(bytes.length,step.byteLength);}
const initialText=await readFile(initial.steps[4].log,'utf8');
assert.match(initialText,/^# pass 160$/m);assert.match(initialText,/^# fail 0$/m);assert.match(initialText,/^# cancelled 3$/m);
const cancelled=[...initialText.matchAll(/^not ok \d+ - (test-build\/[^\n]+)$/gm)].map(match=>match[1]);
assert.deepEqual(cancelled,['test-build/ap23d3.test.cjs','test-build/ap23e3.test.cjs','test-build/mvp09-ar.test.cjs']);
const initialPath='outputs/ap23i3-2026-10-22/spfx-build-initial-timebudget.json';
await writeFile(initialPath,initialBytes,{flag:'wx'});
const args=['--test','--test-concurrency=2','--test-timeout=240000',
  ...(await readdir(`${stage}/spfx/test-build`)).filter(name=>name.endsWith('.test.cjs')).sort().map(name=>`test-build/${name}`)];
assert.deepEqual(args.slice(3),initial.steps[4].args.slice(3),'The exact historical test-file inventory must be identical');
const result=spawnSync(process.execPath,args,{cwd:resolve(stage,'spfx'),encoding:'utf8',maxBuffer:64*1024*1024});
const log=`${stage}/step-5-budget240.log`;
const text=(result.stdout??'')+(result.stderr??'')+(result.error?String(result.error):'');
await writeFile(log,text,{flag:'wx'});
const packageAfter=await bind(packagePath);assert.deepEqual(packageAfter,packageBefore);
const protectedAfter=await Promise.all(initial.protectedBefore.map(item=>bind(item.path)));
assert.deepEqual(protectedAfter,initial.protectedBefore);
const counts=Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));
const retestStep={command:process.execPath,args,exitCode:result.status,log,counts,...await bind(log)};
const final={...initial,status:result.status===0?'passed':'failed',protectedAfter,
  initialTimeBudgetAttempt:{path:initialPath,byteLength:initialBytes.length,sha256:sha(initialBytes),
    counts:{tests:163,pass:160,fail:0,cancelled:3},cancelledFiles:cancelled,reason:'Three unchanged historical test files exceeded the 60-second file budget. No assertion failed.'},
  retestOnly:true,compilerAndPackageRebuilt:false,testPackage:packageAfter,
  verificationPath:`${stage}/verification-budget240.json`,historicalTestFileCount:args.slice(3).length,
  steps:[...initial.steps.slice(0,4),retestStep],timeBudgetRetest:retestStep};
await writeFile(reportPath,JSON.stringify(final,null,2)+'\n');
await writeFile(`${stage}/verification-budget240.json`,JSON.stringify(final,null,2)+'\n');
console.log(JSON.stringify(final));process.exitCode=result.status??1;
