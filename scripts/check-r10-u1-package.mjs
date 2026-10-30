// SPDX-License-Identifier: AGPL-3.0-only
// Actual isolated AMD artefact, never an installation or a source approval.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const out='outputs/r10-u1-2026-10-28';
const stage=process.argv.find(v=>v.startsWith('--stage='))?.slice(8)??JSON.parse(await readFile(out+'/spfx-build.json','utf8')).stage;
assert.match(stage,/^\.work\/r10-u1-spfx-build-[A-Za-z0-9]{6}$/u);
const bind=async path=>{const b=await readFile(path);return{path,byteLength:b.length,sha256:createHash('sha256').update(b).digest('hex')};};
const before=await bind(stage+'/spfx/sharepoint/solution/fristenrechner-schweiz.sppkg');
const args=['--import','tsx','--test','--test-timeout=900000','tests/hosts/r10-u1-packaged.test.ts','tests/hosts/r10-u1-social-packaged.test.ts','tests/hosts/r10-u1-layout.test.ts'];
const result=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:32*1024*1024,env:{...process.env,R10_U1_PACKAGE_STAGE:stage,R10_U1_LAYOUT_STAGE:stage}});
const output=(result.stdout??'')+(result.stderr??''),log=out+'/actual-package.txt';await writeFile(log,output);
const counts=Object.fromEntries([...output.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));
assert.deepEqual(await bind(before.path),before,'Actual package changed during verification');
const report={workPackage:'R10-U1',status:result.status===0?'passed':'failed',localOnly:true,syntheticApprovalsOnly:true,installationPerformed:false,args,
 stage,package:before,counts,exitCode:result.status,log,sha256:createHash('sha256').update(output).digest('hex')};
await writeFile(out+'/actual-package.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));process.exitCode=result.status??1;
