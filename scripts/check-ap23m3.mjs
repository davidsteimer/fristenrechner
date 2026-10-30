// SPDX-License-Identifier: AGPL-3.0-only
// Full local native integration QA. No historical refresh, package build or deployment.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),out='outputs/ap23m3-2026-10-28';
const sha=raw=>createHash('sha256').update(raw).digest('hex');
export function tapCounts(text){return Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(row=>[row[1],Number(row[2])]));}
export function assertPassedCounts(counts,label){assert.ok(Number.isSafeInteger(counts.tests)&&counts.tests>0,label);assert.equal(counts.pass,counts.tests,label);for(const key of['fail','cancelled','skipped','todo'])assert.equal(counts[key],0,label+' '+key);}
export async function buildPlan(){
 const hosts=(await readdir(resolve(root,'tests/hosts'))).filter(name=>/^ap23[e-m]3-spfx-host\.test\.ts$/u.test(name)).sort().map(name=>'tests/hosts/'+name);
 assert.ok(hosts.includes('tests/hosts/ap23m3-spfx-host.test.ts'),'Current actual host lifecycle suite required');
 const governance=(await readdir(resolve(root,'tests/governance'))).filter(name=>/^ap23m3[^/]+\.test\.mjs$/u.test(name)).sort().map(name=>'tests/governance/'+name);
 assert.ok(governance.length>0);
 return[
  ['preservation-before',process.execPath,['scripts/check-ap23m3-preservation.mjs','--write']],
  ['typecheck',process.execPath,['node_modules/typescript/bin/tsc','--noEmit']],
  ['native-schemas',process.execPath,['scripts/build-ap23m3-schemas.mjs','--check']],
  ['candidate',process.execPath,['--import','tsx','scripts/build-ap23m3-candidate.ts','--check']],
  ['native-references',process.execPath,['--import','tsx','scripts/check-ap23m3-references.ts','--write']],
  ['inherited-references',process.execPath,['--import','tsx','scripts/check-ap23m3-inherited-references.ts']],
  ['product-regression',process.execPath,['scripts/run-standard-tests.mjs','product']],
  ['host-lifecycle',process.execPath,['--import','tsx','--test',...hosts]],
  ['actual-web-bundle',process.execPath,['--import','tsx','--test','--test-timeout=900000','tests/public-app/ap23m3-build.test.ts']],
  ['independent-native',resolve(root,'.venv/bin/python'),['scripts/check_ap23m3_independent.py','--write']],
  ['calendar-export',process.execPath,['--import','tsx','scripts/check-ap23m3-export.mjs']],
  ['m2-archive',process.execPath,['scripts/archive-ap23m2-acceptance.mjs','--check']],
  ['governance',process.execPath,['--import','tsx','--test',...governance]],
  ['web-build',process.execPath,['scripts/build-ap23m3-public.mjs']],
  ['preservation-after',process.execPath,['scripts/check-ap23m3-preservation.mjs','--write']],
  ['whitespace','git',['diff','--check']]
 ];
}
export async function runChecks(){
 const env={...process.env,PYTHONDONTWRITEBYTECODE:'1',PATH:dirname(process.execPath)+':'+(process.env.PATH??'')};
 await mkdir(resolve(root,out),{recursive:true});const guard=JSON.parse(await readFile(resolve(root,out+'/protected-inputs.json'),'utf8'));
 const plan=await buildPlan(),report={workPackage:'AP23M3',status:'running',localOnly:true,sourceReleaseApproved:false,installationPerformed:false,githubPushPerformed:false,
  head:guard.head,sourceInventoryStableRequired:true,steps:[]};
 for(const[id,command,args]of plan){
  const result=spawnSync(command,args,{cwd:root,env,encoding:'utf8',maxBuffer:96*1024*1024});
  const text=(result.stdout??'')+(result.stderr??'')+(result.error?String(result.error):''),log=out+'/'+id+'.txt';await writeFile(resolve(root,log),text);
  const counts=tapCounts(text),step={id,command:command===process.execPath?'node':command===resolve(root,'.venv/bin/python')?'.venv/bin/python':command,args,
   exitCode:result.status,log,byteLength:Buffer.byteLength(text),sha256:sha(text),counts};report.steps.push(step);console.log(JSON.stringify(step));
  if(result.status!==0){report.status='failed';break;}
  if(Object.hasOwn(counts,'tests'))assertPassedCounts(counts,id);
 }
 if(report.status!=='failed')report.status='passed';await writeFile(resolve(root,out+'/QA-AP23M3.json'),JSON.stringify(report,null,2)+'\n');
 return report;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,2,'No implicit partial or alternate plan');const report=await runChecks();console.log(JSON.stringify({status:report.status,steps:report.steps.length}));process.exitCode=report.status==='passed'?0:1;
}
