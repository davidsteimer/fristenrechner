// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const selectedStage=process.argv.find(value=>value.startsWith('--stage='))?.slice('--stage='.length);
if(selectedStage)assert.match(selectedStage,/^\.work\/ap23k3-spfx-build-[A-Za-z0-9]{6}$/);
const bind=async path=>{const bytes=await readFile(path);return{path,byteLength:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};};
const report=selectedStage
  ?{testPackage:await bind(`${selectedStage}/spfx/sharepoint/solution/fristenrechner-schweiz.sppkg`)}
  :JSON.parse(await readFile('outputs/ap23k3-2026-10-27/spfx-build.json','utf8'));
if(!selectedStage)assert.equal(report.status,'passed');
const typed=spawnSync(process.execPath,['node_modules/typescript/bin/tsc','--noEmit'],{encoding:'utf8',maxBuffer:16*1024*1024});
await writeFile('outputs/ap23k3-2026-10-27/typecheck-final.txt',(typed.stdout??'')+(typed.stderr??''));
assert.equal(typed.status,0,'Final TypeScript check failed');
const result=spawnSync(process.execPath,['--import','tsx','--test','tests/hosts/ap23k3-packaged.test.ts'],{encoding:'utf8',maxBuffer:16*1024*1024,
  env:{...process.env,...(selectedStage?{AP23K3_PACKAGE_STAGE:selectedStage}:{})}});
const text=(result.stdout??'')+(result.stderr??'');
await writeFile('outputs/ap23k3-2026-10-27/actual-package.txt',text);
const counts=Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));
assert.deepEqual(await bind(report.testPackage.path),report.testPackage,'Actual tested package changed during tests');
const verification={workPackage:'AP23K3',status:result.status===0?'passed':'failed',typecheckExitCode:typed.status,localOnly:true,syntheticApprovalsOnly:true,
  scope:'Actual compiled package tests only. Overall SPFx pipeline acceptance is verified separately by the finalizer.',
  package:report.testPackage,counts,log:'outputs/ap23k3-2026-10-27/actual-package.txt',sha256:createHash('sha256').update(text).digest('hex')};
await writeFile('outputs/ap23k3-2026-10-27/actual-package.json',JSON.stringify(verification,null,2)+'\n');
console.log(JSON.stringify(verification));process.exitCode=result.status??1;
