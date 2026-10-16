// SPDX-License-Identifier: AGPL-3.0-only
// Local integration proof. Historical evidence and legal bytes are read-only.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const output='outputs/ap23d3-2026-10-15';
const archive='outputs/ap23d2-abnahme-2026-10-15';
const write=process.argv.includes('--write'), finalize=process.argv.includes('--finalize');
assert.ok(process.argv.slice(2).every(arg=>['--write','--finalize'].includes(arg)));
assert.match(process.version,/^v22\./);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
async function descriptor(path) { const bytes=await readFile(resolve(root,path)); return {path,byteLength:bytes.length,sha256:sha(bytes)}; }
async function json(path) {return JSON.parse(await readFile(resolve(root,path),'utf8'));}
async function files(path) {
  const result=[];
  for(const entry of await readdir(resolve(root,path),{withFileTypes:true})) {
    assert.equal(entry.isSymbolicLink(),false,path);
    result.push(...entry.isDirectory()?await files(path+'/'+entry.name):[path+'/'+entry.name]);
  }
  return result.sort();
}
const protectedRoots=(await json('outputs/ap23d2-ux-2026-10-15/QA-AP23D2-UX.json')).protectedRoots.filter(item=>item.root!=='src/core');
async function preserved() {
  for(const expected of protectedRoots) {
    const entries=await Promise.all((await files(expected.root)).map(async path=>({path,sha256:(await descriptor(path)).sha256})));
    assert.equal(entries.length,expected.count,expected.root);
    assert.equal(sha(JSON.stringify(entries)),expected.sha256,expected.root);
  }
  assert.equal((await descriptor(archive+'/receipt.json')).sha256,'536e83bae2216ef17e3a13dbb3aa9e6349e84a1cfd5c3ae8cef66a6ee9240ff5');
  const receipt=await json(archive+'/receipt.json');
  for(const item of receipt.artifacts) assert.deepEqual(await descriptor(archive+'/'+item.path),{...item,path:archive+'/'+item.path});
  for(const proof of receipt.proofs) assert.equal((await descriptor(proof.path)).sha256,proof.sha256);
  assert.equal((await descriptor('src/ui/styles.css')).sha256,(await descriptor(archive+'/src/ui/styles.css')).sha256);
  const d1=await json('outputs/ap23d1-2026-10-14/QA-AP23D1.json');
  const arithmetic=d1.artifacts.find(item=>item.path==='src/core/dayDeadlineArithmetic.ts');
  assert.ok(arithmetic); assert.deepEqual(await descriptor(arithmetic.path),arithmetic);
}
const testPaths=[...(await files('src/core')),...(await files('src/ui')),...(await files('src/release')),
  ...(await files('src/public-app')),...(await files('tests/core')),...(await files('tests/ui')),
  ...(await files('tests/hosts')),...(await files('tests/public-app')),
  ...(await files('spfx/src/core')),...(await files('spfx/src/webparts')),
  ...(await files('spfx/test')),...(await files('spfx/test-build')),
  'scripts/build-public-app.mjs','scripts/build-ap23d3-public.mjs','scripts/build-ap23d3-spfx.mjs',
  'spfx/scripts/sync-schemas.mjs','spfx/scripts/sync-product-source.mjs','spfx/tsconfig.json','scripts/check-ap23d3.mjs'];
const inputs=await Promise.all([...new Set(testPaths)].sort().map(descriptor));
async function run(name,args,tests=false) {
  const chunks=[];
  const child=spawn(process.execPath,args,{cwd:root,env:{...process.env,FORCE_COLOR:'0'},stdio:['ignore','pipe','pipe']});
  child.stdout.on('data',value=>chunks.push(value)); child.stderr.on('data',value=>chunks.push(value));
  const code=await new Promise((done,reject)=>{child.on('error',reject);child.on('close',done);});
  const log=Buffer.concat(chunks).toString('utf8'),path=output+'/'+name+'.txt';
  if(write) await writeFile(resolve(root,path),log);
  if(code!==0) {console.error(log.split('\n').slice(-85).join('\n'));throw new Error(name+' failed, see '+path);}
  const counts={};
  if(tests) {
    for(const key of ['tests','pass','fail','cancelled','skipped','todo']) {
      const matches=[...log.matchAll(new RegExp('^# '+key+' (\\d+)\\r?$','gm'))]; assert.equal(matches.length,1,name+' '+key);
      counts[key]=Number(matches[0][1]);
    }
    assert.ok(counts.tests>0); assert.equal(counts.tests,counts.pass);
    for(const key of ['fail','cancelled','skipped','todo']) assert.equal(counts[key],0,name+' '+key);
  }
  console.log(name+': passed'+(tests?' ('+counts.tests+' tests)':''));
  return {command:['node',...args],passed:true,...tests?{counts}:{},log:await descriptor(path)};
}
await preserved();
if(write) await mkdir(resolve(root,output),{recursive:true});
if(!finalize) {
  assert.ok(write,'Use --write to retain the actual test evidence.');
  const runs={};
  runs.types=await run('typecheck',['node_modules/typescript/bin/tsc','--noEmit']);
  runs.candidate=await run('candidate-reproduction',['--import','tsx','scripts/build-ap23d2-candidate.ts','--check']);
  runs.product=await run('product-regression',['scripts/run-standard-tests.mjs','product'],true);
  runs.hosts=await run('host-lifecycle',['--import','tsx','--test',...(await files('tests/hosts')).filter(p=>p.endsWith('.test.ts'))],true);
  runs.public=await run('public-build-tests',['--import','tsx','--test',...(await files('tests/public-app')).filter(p=>p.endsWith('.test.ts'))],true);
  runs.legacy=await run('legacy-equivalence',['--import','tsx','scripts/check-ap23d1-legacy-equivalence.mjs']);
  const legacy=JSON.parse(await readFile(resolve(root,runs.legacy.log.path),'utf8'));
  assert.equal(legacy.comparisons,1584); runs.legacy.comparisons=legacy.comparisons;
  for(const item of inputs) assert.deepEqual(await descriptor(item.path),item,'Input changed during tests: '+item.path);
  await preserved(); execFileSync('git',['diff','--check'],{cwd:root});
  await writeFile(resolve(root,output,'test-evidence.json'),JSON.stringify({date:'2026-10-15',status:'passed',inputs,runs},null,2)+'\n');
} else {
  const evidence=await json(output+'/test-evidence.json'); assert.equal(evidence.status,'passed');
  assert.deepEqual(inputs,evidence.inputs,'Code/test inputs changed since the recorded tests.');
  for(const run of Object.values(evidence.runs)) assert.deepEqual(await descriptor(run.log.path),run.log);
  const web=await json(output+'/web-build.json'),spfx=await json(output+'/spfx-build.json'),browser=await json(output+'/browser-evidence.json');
  for(const build of [web,spfx]) {
    assert.equal(build.status,'passed'); assert.equal(build.localOnly,true); assert.equal(build.deployable,false);
    assert.deepEqual(build.protectedBefore,build.protectedAfter);
    for(const item of build.protectedAfter) assert.deepEqual(await descriptor(item.path),item);
  }
  for(const item of web.artifacts) assert.deepEqual(await descriptor(item.path),item);
  assert.deepEqual(await descriptor(spfx.testPackage.path),spfx.testPackage);
  const buildLogs=[];
  for(const step of spfx.steps) {
    assert.equal(step.exitCode,0); buildLogs.push(await descriptor(step.log));
  }
  const sourceParity=[];
  for(const path of [...await files('src/core'),...await files('src/ui')].filter(p=>!p.includes('/preview'))) {
    if(!/\.(tsx?|css)$/.test(path)) continue;
    const hash=(await descriptor(path)).sha256;
    for(const target of ['spfx/src/product/'+path.slice(4),spfx.stage+'/spfx/src/product/'+path.slice(4)]) {
      assert.equal((await descriptor(target)).sha256,hash,target); sourceParity.push(await descriptor(target));
    }
  }
  for(const name of ['release-manifest-v8.schema.json','local-reference-manifest-v8.schema.json','administrative-procedure-catalog.schema.json']) {
    const path='schemas/implementation/ap23d1/'+name, hash=(await descriptor(path)).sha256;
    const copies=['spfx/src/schemas/implementation/ap23d1/'+name,spfx.stage+'/spfx/src/schemas/implementation/ap23d1/'+name];
    if(name==='release-manifest-v8.schema.json') copies.push('spfx/src/core/schemas/'+name,spfx.stage+'/spfx/src/core/schemas/'+name);
    for(const target of copies) {assert.equal((await descriptor(target)).sha256,hash,target);sourceParity.push(await descriptor(target));}
  }
  assert.deepEqual(await readFile(resolve(root,'spfx/tsconfig.json')),await readFile(resolve(root,spfx.stage,'spfx/tsconfig.json')));
  assert.equal(browser.status,'passed'); assert.equal(browser.scope,'local-built-web');
  assert.ok(browser.checks.length>0&&browser.checks.every(check=>check.passed===true));
  for(const item of browser.artifacts) assert.deepEqual(await descriptor(item.path),item);
  const extra=['package.json','README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
    'docs/fachrecht/abnahme-ap23d2.md','docs/architektur/verwaltungsintegration-ap23d3.md','scripts/archive-ap23d2-acceptance.mjs',
    output+'/test-evidence.json',output+'/web-build.json',output+'/spfx-build.json',output+'/browser-evidence.json'];
  const artifacts=await Promise.all(extra.map(descriptor));
  const report={kind:'ap23d3-local-integration-qa',date:'2026-10-15',status:'ready-for-technical-acceptance',accepted:false,
    legalRulesUnchanged:true,legalDataUnchanged:true,sourceReleaseApproved:false,deployable:false,deployed:false,published:false,
    protectedRoots,acceptedD2Snapshot:await descriptor(archive+'/receipt.json'),runs:evidence.runs,
    inputs,sourceParity,buildLogs,webArtifacts:web.artifacts,localSpfxPackage:spfx.testPackage,
    browser:{checks:browser.checks,limitations:browser.limitations,artifacts:browser.artifacts},artifacts};
  if(write) await writeFile(resolve(root,output,'QA-AP23D3.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,productTests:evidence.runs.product.counts.tests,
    hostTests:evidence.runs.hosts.counts.tests,publicTests:evidence.runs.public.counts.tests,
    legacyComparisons:1584,browserChecks:browser.checks.length,sourceCopies:sourceParity.length},null,2));
}
