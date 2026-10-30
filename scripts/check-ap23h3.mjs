// SPDX-License-Identifier: AGPL-3.0-only
// Actual local integration QA. Does not refresh historical evidence or deploy.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),out='outputs/ap23h3-2026-10-22';
const hash=b=>createHash('sha256').update(b).digest('hex'),raw=p=>readFile(resolve(root,p));
const initial=JSON.parse(await raw(out+'/protected-inputs.json'));
function verify(){const r=spawnSync(process.execPath,['scripts/check-ap23h3-preservation.mjs','--write'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(r.status,0,r.stdout+r.stderr);}
verify();await mkdir(resolve(root,out),{recursive:true});
const commands=[
 ['typecheck',process.execPath,['node_modules/typescript/bin/tsc','--noEmit']],
 ['native-schema-rebuild',process.execPath,['scripts/build-ap23h3-schemas.mjs','--check']],
 ['candidate-rebuild',process.execPath,['--import','tsx','scripts/build-ap23h3-candidate.ts','--check']],
 ['product-regression',process.execPath,['scripts/run-standard-tests.mjs','product']],
 ['host-lifecycle',process.execPath,['--import','tsx','--test','tests/hosts/ap23e3-spfx-host.test.ts','tests/hosts/ap23f3-spfx-host.test.ts','tests/hosts/ap23g3-spfx-host.test.ts','tests/hosts/ap23h3-spfx-host.test.ts']],
 ['actual-web-bundle',process.execPath,['--import','tsx','--test','--test-timeout=180000','tests/public-app/ap23h3-build.test.ts']],
 ['independent-schema',resolve(root,'.venv/bin/python'),['tests/data/test_ap23h3_contract.py']],
 ['h2-archive',process.execPath,['scripts/archive-ap23h2-acceptance.mjs','--check']],
 ['h2-archive-tests',process.execPath,['--test','tests/governance/ap23h2-acceptance.test.mjs']],
 ['web-build',process.execPath,['scripts/build-ap23h3-public.mjs']]
];
const report={workPackage:'AP23H3',status:'running',localOnly:true,sourceReleaseApproved:false,installationPerformed:false,githubPushPerformed:false,head:initial.head,protectedFiles:1810,explicitAdditionalRegistryDispatches:2,originalProtectedBindings:1812,steps:[]};
for(const[id,command,args]of commands){
 const r=spawnSync(command,args,{cwd:root,env:{...process.env,PATH:dirname(process.execPath)+':'+(process.env.PATH??'')},encoding:'utf8',maxBuffer:64*1024*1024});
 const text=(r.stdout??'')+(r.stderr??'')+(r.error?String(r.error):''),log=out+'/'+id+'.txt';await writeFile(resolve(root,log),text);
 const counts=Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));
 const step={id,exitCode:r.status,log,byteLength:Buffer.byteLength(text),sha256:hash(text),counts};report.steps.push(step);console.log(JSON.stringify(step));
 if(r.status!==0){report.status='failed';break;}
}
verify();if(report.status!=='failed')report.status='passed';
report.manifestSha256=hash(await raw('data/candidates/2026-10-22-ap23h3/manifest.json'));
await writeFile(resolve(root,out+'/QA-AP23H3.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,protectedFiles:report.protectedFiles}));process.exitCode=report.status==='passed'?0:1;
