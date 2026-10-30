// SPDX-License-Identifier: AGPL-3.0-only
// Full local native integration QA. No historical report refresh or deployment.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),out='outputs/ap23k3-2026-10-27';
const sha=raw=>createHash('sha256').update(raw).digest('hex');
const env={...process.env,PYTHONDONTWRITEBYTECODE:'1',PATH:dirname(process.execPath)+':'+(process.env.PATH??'')};
const hosts=(await readdir(resolve(root,'tests/hosts'))).filter(name=>/^ap23[e-k]3-spfx-host\.test\.ts$/u.test(name)).sort().map(name=>'tests/hosts/'+name);
assert.equal(hosts.length,7);
const commands=[
 ['preservation-before',process.execPath,['scripts/check-ap23k3-preservation.mjs','--write']],
 ['typecheck',process.execPath,['node_modules/typescript/bin/tsc','--noEmit']],
 ['native-schemas',process.execPath,['scripts/build-ap23k3-schemas.mjs','--check']],
 ['candidate',process.execPath,['--import','tsx','scripts/build-ap23k3-candidate.ts','--check']],
 ['native-references',process.execPath,['--import','tsx','scripts/check-ap23k3-references.ts','--check']],
 ['inherited-references',process.execPath,['--import','tsx','scripts/check-ap23k3-inherited-references.ts']],
 ['product-regression',process.execPath,['scripts/run-standard-tests.mjs','product']],
 ['host-lifecycle',process.execPath,['--import','tsx','--test',...hosts]],
 ['actual-web-bundle',process.execPath,['--import','tsx','--test','--test-timeout=900000','tests/public-app/ap23k3-build.test.ts']],
 ['independent-native',resolve(root,'.venv/bin/python'),['scripts/check_ap23k3_independent.py','--write']],
 ['independent-contract',resolve(root,'.venv/bin/python'),['tests/data/test_ap23k3_contract.py']],
 ['k2-archive',process.execPath,['scripts/archive-ap23k2-acceptance.mjs','--check']],
 ['governance',process.execPath,['--test','tests/governance/ap23k2-acceptance.test.mjs','tests/governance/ap23k3-preservation.test.mjs']],
 ['web-build',process.execPath,['scripts/build-ap23k3-public.mjs']],
 ['preservation-after',process.execPath,['scripts/check-ap23k3-preservation.mjs','--write']],
 ['whitespace','git',['diff','--check']]
];
await mkdir(resolve(root,out),{recursive:true});
const guard=JSON.parse(await readFile(resolve(root,out+'/protected-inputs.json'),'utf8'));
const report={workPackage:'AP23K3',status:'running',localOnly:true,sourceReleaseApproved:false,installationPerformed:false,githubPushPerformed:false,
 head:guard.head,sourceInventoryStableRequired:true,steps:[]};
for(const [id,command,args] of commands){
 const result=spawnSync(command,args,{cwd:root,env,encoding:'utf8',maxBuffer:64*1024*1024});
 const text=(result.stdout??'')+(result.stderr??'')+(result.error?String(result.error):''),log=out+'/'+id+'.txt';await writeFile(resolve(root,log),text);
 const counts=Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));
 const step={id,command:command===process.execPath?'node':command===resolve(root,'.venv/bin/python')?'.venv/bin/python':command,args,
  exitCode:result.status,log,byteLength:Buffer.byteLength(text),sha256:sha(text),counts};report.steps.push(step);console.log(JSON.stringify(step));
 if(result.status!==0){report.status='failed';break;}
 if(Object.hasOwn(counts,'tests')){assert.ok(counts.tests>0);assert.equal(counts.pass,counts.tests,id);for(const key of ['fail','cancelled','skipped','todo'])assert.equal(counts[key],0,id+' '+key);}
}
if(report.status!=='failed')report.status='passed';
await writeFile(resolve(root,out+'/QA-AP23K3.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,steps:report.steps.length}));process.exitCode=report.status==='passed'?0:1;
