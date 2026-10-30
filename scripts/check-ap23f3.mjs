// SPDX-License-Identifier: AGPL-3.0-only
// Reproducible local integration verification. No release or deployment action.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'outputs/ap23f3-2026-10-22');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const input = JSON.parse(await readFile(resolve(output, 'protected-inputs.json'), 'utf8'));
await mkdir(output, {recursive:true});
const report = {workPackage:'AP23F3', status:'running', localOnly:true, sourceReleaseApproved:false,
  installationPerformed:false, githubPushPerformed:false, head:input.head, steps:[], protectedFiles:[]};
for (const [path, expected] of Object.entries(input.files)) {
  const actual = sha(await readFile(resolve(root,path)));
  assert.equal(actual, expected, 'Protected historical or operating input changed: '+path);
  report.protectedFiles.push({path,sha256:actual});
}
const env = {...process.env,PATH:dirname(process.execPath)+':'+(process.env.PATH ?? '')};
const commands = [
  ['typecheck',process.execPath,['node_modules/typescript/bin/tsc','--noEmit']],
  ['candidate-rebuild',process.execPath,['--import','tsx','scripts/build-ap23f3-candidate.ts','--check']],
  ['product-regression',process.execPath,['scripts/run-standard-tests.mjs','product']],
  ['host-lifecycle',process.execPath,['--import','tsx','--test','tests/hosts/ap23e3-spfx-host.test.ts','tests/hosts/ap23f3-spfx-host.test.ts']],
  ['actual-web-bundle',process.execPath,['--import','tsx','--test','tests/public-app/ap23f3-build.test.ts']],
  ['independent-schema',resolve(root,'.venv/bin/python'),['tests/data/test_ap23f3_contract.py']],
  ['web-build',process.execPath,['scripts/build-ap23f3-public.mjs']]
];
for (const [id,command,args] of commands) {
  const result=spawnSync(command,args,{cwd:root,env,encoding:'utf8',maxBuffer:64*1024*1024});
  const log=resolve(output,id+'.txt');
  const text=(result.stdout??'')+(result.stderr??'')+(result.error?String(result.error):'');
  await writeFile(log,text);
  const counts=Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));
  report.steps.push({id,exitCode:result.status,log:relative(root,log),sha256:sha(text),counts});
  console.log(JSON.stringify(report.steps.at(-1)));
  if(result.status!==0){report.status='failed'; break;}
}
const git=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'});
assert.equal(git.stdout.trim(),input.head,'Unexpected commit');
for(const entry of report.protectedFiles) assert.equal(sha(await readFile(resolve(root,entry.path))),entry.sha256,entry.path);
report.status=report.status==='failed'?'failed':'passed';
report.manifestSha256=sha(await readFile(resolve(root,'data/candidates/2026-10-22-ap23f3/manifest.json')));
await writeFile(resolve(output,'QA-AP23F3.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,protectedFiles:report.protectedFiles.length}));
process.exitCode=report.status==='passed'?0:1;
