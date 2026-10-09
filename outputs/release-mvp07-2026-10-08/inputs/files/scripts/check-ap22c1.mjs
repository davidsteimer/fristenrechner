// SPDX-License-Identifier: AGPL-3.0-only
// Reproducible C1 implementation checks. No promotion, app build or publication.
import {readFile, writeFile, readdir, mkdir} from 'node:fs/promises';
import {resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const output=resolve(root,'outputs/ap22c1-2026-10-08');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const load=async path=>JSON.parse(await readFile(resolve(root,path),'utf8'));
const python=resolve(root,'.venv/bin/python');
assert.match(process.version,/^v22\./,'Use the project Node 22 toolchain for the final C1 proof');
async function run(name,command,args){
  const chunks=[];
  const child=spawn(command,args,{cwd:root,env:{...process.env,FORCE_COLOR:'0'},stdio:['ignore','pipe','pipe']});
  child.stdout.on('data',chunk=>chunks.push(chunk));child.stderr.on('data',chunk=>chunks.push(chunk));
  const code=await new Promise((ok,bad)=>{child.on('error',bad);child.on('close',ok);});
  const text=Buffer.concat(chunks).toString('utf8');
  if(process.argv.includes('--write')){await mkdir(output,{recursive:true});await writeFile(join(output,`${name}.txt`),text);}
  if(code!==0){console.error(text);throw new Error(`${name} failed (${code})`);}
  console.log(`${name}: passed`);
  const tests=Number(/# tests (\d+)/.exec(text)?.[1]??/Ran (\d+) tests/.exec(text)?.[1]??0);
  return {command:[command,...args],passed:true,tests,outputSha256:sha(text)};
}
async function frozenCheck(){
  const report=await load('outputs/ap22b-vertrag-2026-10-08/QA-AP22B.json');
  for(const entry of report.artifacts){const raw=await readFile(resolve(root,entry.path));assert.equal(raw.length,entry.byteLength);assert.equal(sha(raw),entry.sha256);}
  for(const kind of ['node','python']) assert.equal(sha(await readFile(resolve(root,`outputs/ap22b-vertrag-2026-10-08/${kind}-tests.txt`))),report.tests[kind].outputSha256);
  return {files:report.artifacts.length,testLogs:2};
}
const historical=await frozenCheck();
const runs={};
runs.build=await run('build',process.execPath,['--import','tsx','scripts/build-ap22c1-candidate.ts']);
const inventoryBefore=sha(await readFile(join(output,'inventory.json')));
runs.repeatBuild=await run('repeat-build',process.execPath,['--import','tsx','scripts/build-ap22c1-candidate.ts']);
assert.equal(sha(await readFile(join(output,'inventory.json'))),inventoryBefore,'Non-deterministic candidate build');
runs.types=await run('typecheck',process.execPath,['node_modules/typescript/bin/tsc','--noEmit']);
const c1=(await readdir(resolve(root,'tests/core'))).filter(name=>name.startsWith('ap22c1-')&&name.endsWith('.test.ts')).sort().map(name=>`tests/core/${name}`);
runs.node=await run('node-tests',process.execPath,['--import','tsx','--test','--test-reporter=tap',...c1]);
runs.python=await run('python-tests',python,['-m','unittest','discover','-s','tests/data','-p','test_ap22c1_contract.py','-v']);
runs.regression=await run('product-regression',process.execPath,['scripts/run-standard-tests.mjs','product']);
runs.ap22bNode=await run('ap22b-node-regression',process.execPath,['--test','--test-reporter=tap','tests/governance/ap22b-contract.test.mjs','tests/governance/ap22b-reference-index.test.mjs']);
runs.ap22bPython=await run('ap22b-python-regression',python,['-m','unittest','discover','-s','tests/data','-p','test_ap22b_*.py']);
runs.historicalData=await run('historical-data-unchanged','git',['diff','--exit-code','--','data/releases','schemas/calendar-rules-v2.schema.json','schemas/holiday-catalog-v1.schema.json','schemas/release-manifest-v6.schema.json','src/core/data.ts','src/release']);
runs.whitespace=await run('diff-check','git',['diff','--check']);
await frozenCheck();
const inventory=await load('outputs/ap22c1-2026-10-08/inventory.json');
for(const artifact of inventory.artifacts){const bytes=await readFile(join(output,artifact.path));assert.equal(sha(bytes),artifact.sha256);assert.equal(bytes.length,artifact.byteLength);}
const files=[
 'docs/architektur/kalenderintegration-ap22c1.md','package.json',
 'src/core/calendarRuleTypes.ts','src/core/generateCalendar.ts','src/core/types.ts','src/core/socialCatalog.ts',
 'src/core/holidayActivationTypes.ts','src/core/holidayActivation.ts','src/core/schemaContract.ts',
 'src/core/releaseFormat7.ts','src/core/calendarMigration.ts','scripts/build-ap22c1-candidate.ts','scripts/check-ap22c1.mjs',
 ...c1,'tests/data/ap22c1_contract.py','tests/data/test_ap22c1_contract.py',
 ...['holiday-catalog-v2','calendar-rules-v3','release-manifest-v7'].map(name=>`schemas/implementation/ap22c1/${name}.schema.json`)
];
const artifacts=[];
for(const path of files){const bytes=await readFile(resolve(root,path));artifacts.push({path,sha256:sha(bytes),byteLength:bytes.length});}
const probes=await load('outputs/ap22c1-2026-10-08/date-probes.json');
const report={kind:'ap22c1-implementation-qa',date:'2026-10-08',status:'ready-for-review',
  accepted:false,contractDecision:'DEC-2026-030',runtimeEnabled:false,releaseBuilt:false,published:false,
  environment:{node:process.version,python:'.venv/bin/python',scope:'C1 data implementation and local regression, not a host build'},
  counts:inventory.counts,sourceReviewPerformed:false,fullJanuaryCalculationsPerformed:false,
  crossLanguage:{from:probes.from,to:probes.to,calendarDefinitions:32,holidayOccurrences:probes.occurrences.length},
  deterministicInventorySha256:inventoryBefore,frozenAP22B:historical,runs,artifacts};
if(process.argv.includes('--write'))await writeFile(join(output,'QA-AP22C1.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,nodeTests:runs.node.tests,pythonTests:runs.python.tests,regressionTests:runs.regression.tests,crossLanguage:report.crossLanguage},null,2));
