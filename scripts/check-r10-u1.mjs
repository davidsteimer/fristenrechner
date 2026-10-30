// SPDX-License-Identifier: AGPL-3.0-only
// Narrow local follow-up QA, never refresh accepted M3 proofs or deploy anything.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {preservationConfig,checkPreservation} from './check-r10-u1-preservation.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out='outputs/r10-u1-2026-10-28';
export function tapCounts(text){return Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(row=>[row[1],Number(row[2])]));}
export function assertPassedCounts(counts,label){assert.ok(Number.isSafeInteger(counts.tests)&&counts.tests>0,label);assert.equal(counts.pass,counts.tests,label);for(const key of['fail','cancelled','skipped','todo'])assert.equal(counts[key],0,label+' '+key);}
export async function buildPlan(){
 const host=(await readdir(resolve(root,'tests/hosts'))).filter(name=>/^ap23[e-m]3-spfx-host\.test\.ts$/u.test(name)).sort().map(name=>'tests/hosts/'+name);
 const governance=(await readdir(resolve(root,'tests/governance'))).filter(name=>/^r10-u1[^/]+\.test\.mjs$/u.test(name)).sort().map(name=>'tests/governance/'+name);
 assert.equal(host.length,9);assert.ok(governance.length);
 return[
  ['preservation-before',process.execPath,['scripts/check-r10-u1-preservation.mjs','--write']],
  ['typecheck',process.execPath,['node_modules/typescript/bin/tsc','--noEmit']],
  ['product-regression',process.execPath,['scripts/run-standard-tests.mjs','product']],
  ['host-lifecycle',process.execPath,['--import','tsx','--test',...host]],
  ['actual-web-bundle',process.execPath,['--import','tsx','--test','--test-timeout=900000','tests/public-app/r10-u1-build.test.ts']],
  ['accepted-m3-archive',process.execPath,['scripts/archive-ap23m3-acceptance.mjs','--check']],
  ['governance',process.execPath,['--import','tsx','--test',...governance]],
  ['web-build',process.execPath,['scripts/build-r10-u1-public.mjs']],
  ['preservation-after',process.execPath,['scripts/check-r10-u1-preservation.mjs','--write']],
  ['whitespace','git',['diff','--check']]
 ];
}
export async function runChecks(){
 const plan=await buildPlan(),guard=JSON.parse(await readFile(resolve(root,out+'/protected-inputs.json'),'utf8'));
 const preservation=await checkPreservation();
 const inputPaths=[...new Set([...preservationConfig.mutableAllowed,...preservation.newFollowUpFiles,'scripts/run-standard-tests.mjs','tsconfig.json'])].sort();
 const bindInputs=async()=>Promise.all(inputPaths.map(async path=>{const bytes=await readFile(resolve(root,path));return{path,byteLength:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};}));
 const inputsBefore=await bindInputs();
 const report={workPackage:'R10-U1',status:'running',head:guard.head,localOnly:true,sourceReleaseApproved:false,installationPerformed:false,githubPushPerformed:false,steps:[]};
 const env={...process.env,PATH:dirname(process.execPath)+':'+(process.env.PATH??'')};
 for(const[id,command,args]of plan){const result=spawnSync(command,args,{cwd:root,env,encoding:'utf8',maxBuffer:96*1024*1024});
  const output=(result.stdout??'')+(result.stderr??'')+(result.error?String(result.error):''),log=out+'/'+id+'.txt';await writeFile(resolve(root,log),output);
  const counts=tapCounts(output),step={id,command:command===process.execPath?'node':command,args,exitCode:result.status,log,byteLength:Buffer.byteLength(output),sha256:createHash('sha256').update(output).digest('hex'),counts};
  report.steps.push(step);console.log(JSON.stringify(step));if(result.status!==0){report.status='failed';break;}if(Object.hasOwn(counts,'tests'))assertPassedCounts(counts,id);
 }
 report.inputsBefore=inputsBefore;report.inputsAfter=await bindInputs();assert.deepEqual(report.inputsAfter,report.inputsBefore,'QA inputs changed during execution');
 if(report.status!=='failed')report.status='passed';await writeFile(resolve(root,out+'/QA-R10-U1.json'),JSON.stringify(report,null,2)+'\n');return report;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.equal(process.argv.length,2);const report=await runChecks();console.log(JSON.stringify({status:report.status,steps:report.steps.length}));process.exitCode=report.status==='passed'?0:1;}
