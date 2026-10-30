// SPDX-License-Identifier: AGPL-3.0-only
// Actual local integration QA. No historical proof refresh or deployment.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),out='outputs/ap23j3-2026-10-27';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const raw=path=>readFile(resolve(root,path));
const initial=JSON.parse(await raw(out+'/protected-inputs.json'));
function verify(){
  const result=spawnSync(process.execPath,['scripts/check-ap23j3-preservation.mjs','--write'],
    {cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
  assert.equal(result.status,0,(result.stdout??'')+(result.stderr??''));
}
verify();await mkdir(resolve(root,out),{recursive:true});
const commands=[
  ['typecheck',process.execPath,['node_modules/typescript/bin/tsc','--noEmit']],
  ['native-schema-rebuild',process.execPath,['scripts/build-ap23j3-schemas.mjs','--check']],
  ['candidate-rebuild',process.execPath,['--import','tsx','scripts/build-ap23j3-candidate.ts','--check']],
  ['native-references',process.execPath,['--import','tsx','scripts/check-ap23j3-references.ts','--write']],
  ['product-regression',process.execPath,['scripts/run-standard-tests.mjs','product']],
  ['host-lifecycle',process.execPath,['--import','tsx','--test','tests/hosts/ap23e3-spfx-host.test.ts',
    'tests/hosts/ap23f3-spfx-host.test.ts','tests/hosts/ap23g3-spfx-host.test.ts',
    'tests/hosts/ap23h3-spfx-host.test.ts','tests/hosts/ap23i3-spfx-host.test.ts','tests/hosts/ap23j3-spfx-host.test.ts']],
  ['actual-web-bundle',process.execPath,['--import','tsx','--test','--test-timeout=900000','tests/public-app/ap23j3-build.test.ts']],
  ['independent-native',resolve(root,'.venv/bin/python'),['scripts/check_ap23j3_independent.py','--write']],
  ['independent-schema',resolve(root,'.venv/bin/python'),['tests/data/test_ap23j3_contract.py']],
  ['j2-archive',process.execPath,['scripts/archive-ap23j2-acceptance.mjs','--check']],
  ['j3-governance',process.execPath,['--test','tests/governance/ap23j2-acceptance.test.mjs',
    'tests/governance/ap23j3-preservation.test.mjs']],
  ['web-build',process.execPath,['scripts/build-ap23j3-public.mjs']]
];
const report={workPackage:'AP23J3',status:'running',localOnly:true,sourceReleaseApproved:false,installationPerformed:false,
  githubPushPerformed:false,head:initial.head,steps:[]};
for(const[id,command,args]of commands){
  const result=spawnSync(command,args,{cwd:root,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PATH:dirname(process.execPath)+':'+(process.env.PATH??'')},
    encoding:'utf8',maxBuffer:64*1024*1024});
  const text=(result.stdout??'')+(result.stderr??'')+(result.error?String(result.error):''),log=out+'/'+id+'.txt';
  await writeFile(resolve(root,log),text);
  const counts=Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)]
    .map(match=>[match[1],Number(match[2])]));
  const step={id,exitCode:result.status,log,byteLength:Buffer.byteLength(text),sha256:hash(text),counts};
  report.steps.push(step);console.log(JSON.stringify(step));
  if(result.status!==0){report.status='failed';break;}
  if(Object.hasOwn(counts,'tests')){
    assert.ok(counts.tests>0);assert.equal(counts.pass,counts.tests);
    for(const key of['fail','cancelled','skipped','todo'])assert.equal(counts[key],0,id+' '+key);
  }
}
verify();
if(report.status!=='failed')report.status='passed';
report.manifestSha256=hash(await raw('data/candidates/2026-10-27-ap23j3/manifest.json'));
await writeFile(resolve(root,out+'/QA-AP23J3.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,steps:report.steps.length}));
process.exitCode=report.status==='passed'?0:1;

