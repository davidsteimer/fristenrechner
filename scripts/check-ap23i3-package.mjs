// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const report=JSON.parse(await readFile('outputs/ap23i3-2026-10-22/spfx-build.json','utf8'));
assert.equal(report.status,'passed');
const typed=spawnSync(process.execPath,['node_modules/typescript/bin/tsc','--noEmit'],{encoding:'utf8',maxBuffer:16*1024*1024});
await writeFile('outputs/ap23i3-2026-10-22/typecheck-final.txt',(typed.stdout??'')+(typed.stderr??''));
assert.equal(typed.status,0,'Final TypeScript check failed');
const result=spawnSync(process.execPath,['--import','tsx','--test','tests/hosts/ap23i3-packaged.test.ts'],{encoding:'utf8',maxBuffer:16*1024*1024});
const text=(result.stdout??'')+(result.stderr??'');
await writeFile('outputs/ap23i3-2026-10-22/actual-package.txt',text);
const counts=Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));
const verification={workPackage:'AP23I3',status:result.status===0?'passed':'failed',typecheckExitCode:typed.status,localOnly:true,syntheticApprovalsOnly:true,
  package:report.testPackage,counts,log:'outputs/ap23i3-2026-10-22/actual-package.txt',sha256:createHash('sha256').update(text).digest('hex')};
await writeFile('outputs/ap23i3-2026-10-22/actual-package.json',JSON.stringify(verification,null,2)+'\n');
console.log(JSON.stringify(verification));process.exitCode=result.status??1;
