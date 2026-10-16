// SPDX-License-Identifier: AGPL-3.0-only
// AP23D2 UX addendum: local checks only, no historical report rewrite.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../',import.meta.url));
const outputPath = 'outputs/ap23d2-ux-2026-10-15';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const write = process.argv.includes('--write');
assert.ok(process.argv.slice(2).every(arg=>arg==='--write'));
assert.match(process.version,/^v22\./);
const protectedRoots = [
  {
    "root": "src/core",
    "count": 33,
    "sha256": "790ea0395631f9eb09c2eba6a4d7d610e03d2477361b69e3b7318286f2250d93"
  },
  {
    "root": "data/releases",
    "count": 175,
    "sha256": "b60c7f3a4a79668c2e2967f6689bf2213758666abc8e042b3477cca2741b6611"
  },
  {
    "root": "schemas",
    "count": 38,
    "sha256": "3288c66163b37751191e8f5f1aebc70c44867a78a48d6e870a6860fb6e86a805"
  },
  {
    "root": "outputs/ap23d2-candidate-2026-10-15",
    "count": 43,
    "sha256": "2588a09afea3f87a3e4bd64e270d475b0522e6a476a615a223497ff3b8ca07d2"
  },
  {
    "root": "outputs/ap23d2-2026-10-15",
    "count": 12,
    "sha256": "d063bdf50948da4e82cf251c982da0f7061455766c475b53a15af7eb9fb49c70"
  }
];
async function files(path) {
  const result=[];
  for (const entry of await readdir(resolve(root,path),{withFileTypes:true})) {
    assert.equal(entry.isSymbolicLink(),false);
    result.push(...entry.isDirectory()?await files(path+'/'+entry.name):[path+'/'+entry.name]);
  }
  return result.sort();
}
async function descriptor(path) {
  const bytes=await readFile(resolve(root,path));
  return {path,byteLength:bytes.length,sha256:sha(bytes)};
}
async function preserved() {
  for(const expected of protectedRoots) {
    const paths=await files(expected.root);
    const actual=await Promise.all(paths.map(async path=>({path,sha256:(await descriptor(path)).sha256})));
    assert.equal(actual.length,expected.count,expected.root+' inventory changed');
    assert.equal(sha(JSON.stringify(actual)),expected.sha256,expected.root+' bytes changed');
  }
}
async function run(name,args,tests=false) {
  const chunks=[];
  const child=spawn(process.execPath,args,{cwd:root,env:{...process.env,FORCE_COLOR:'0'},stdio:['ignore','pipe','pipe']});
  child.stdout.on('data',value=>chunks.push(value));
  child.stderr.on('data',value=>chunks.push(value));
  const code=await new Promise((done,reject)=>{child.on('error',reject);child.on('close',done);});
  const output=Buffer.concat(chunks).toString('utf8');
  const outputFile=outputPath+'/'+name+'.txt';
  if(write) await writeFile(resolve(root,outputFile),output);
  if(code!==0) {console.error(output.split('\n').slice(-80).join('\n'));throw new Error(name+' failed, see '+outputFile);}
  const counts={};
  if(tests) {
    for(const key of ['tests','pass','fail','cancelled','skipped','todo']) {
      const matches=[...output.matchAll(new RegExp('^# '+key+' (\\d+)\\r?$','gm'))];
      assert.equal(matches.length,1,name+' '+key);
      counts[key]=Number(matches[0][1]);
    }
    assert.ok(counts.tests>0);
    assert.equal(counts.pass,counts.tests);
    for(const key of ['fail','cancelled','skipped','todo']) assert.equal(counts[key],0);
  }
  console.log(name+': passed'+(tests?' ('+counts.tests+' tests)':''));
  return {command:['node',...args],passed:true,...tests?{counts}:{},outputPath:outputFile,outputSha256:sha(output)};
}
await preserved();
if(write) await mkdir(resolve(root,outputPath),{recursive:true});
const testFiles=(await files('tests')).filter(path=>/\/ap23d2-.*\.test\.tsx?$/.test(path));
const runs={};
runs.types=await run('typecheck',['node_modules/typescript/bin/tsc','--noEmit']);
runs.candidate=await run('candidate-reproduction',['--import','tsx','scripts/build-ap23d2-candidate.ts','--check']);
runs.d2=await run('d2-tests',['--import','tsx','--test',...testFiles],true);
runs.legacy=await run('legacy-equivalence',['--import','tsx','scripts/check-ap23d1-legacy-equivalence.mjs']);
runs.product=await run('product-regression',['scripts/run-standard-tests.mjs','product'],true);
await preserved();
execFileSync('git',['diff','--check'],{cwd:root});
const browserPath=outputPath+'/browser-evidence.json';
const browser=JSON.parse(await readFile(resolve(root,browserPath),'utf8'));
assert.equal(browser.status,'passed');
assert.equal(browser.scope,'local-preview');
assert.ok(browser.checks.length>0 && browser.checks.every(check=>check.passed===true));
for(const item of browser.artifacts) assert.deepEqual(await descriptor(item.path),item);
const paths=[...new Set([
  'src/ui/FristenrechnerApp.tsx','src/ui/calendarContextUi.tsx','src/ui/calendarMessages.ts',
  'src/ui/tracePresentation.tsx','src/ui/administrativeUi.tsx','src/ui/administrativeMessages.ts',
  'src/ui/styles.css','src/ui/i18n.ts','tests/ui/ap22c2-ui.test.tsx','tests/ui/ap19c-social.test.ts',...testFiles,
  'scripts/check-ap23d2-ux.mjs','docs/architektur/verwaltungsintegration-ap23d2-ux.md',
  'README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
  'package.json',browserPath,...browser.artifacts.map(item=>item.path)
])].sort();
const artifacts=await Promise.all(paths.map(descriptor));
const report={
  kind:'ap23d2-ux-addendum-qa',date:'2026-10-15',status:'ready-for-ui-acceptance',accepted:false,
  scope:'Local UX addendum. No AP23D3, new legal rules, legal release, SPFx package, deployment or publication.',
  coreRulesUnchanged:true,legalDataUnchanged:true,twoColumnFormPreserved:true,protectedRoots,
  sourceReleaseApproved:false,ap23d3Started:false,releaseBuilt:false,deployment:false,published:false,
  runs,tests:testFiles,browser:{path:browserPath,checks:browser.checks.length,limitations:browser.limitations},artifacts
};
if(write) await writeFile(resolve(root,outputPath,'QA-AP23D2-UX.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,d2Tests:runs.d2.counts.tests,productTests:runs.product.counts.tests,browserChecks:browser.checks.length,protectedFiles:protectedRoots.reduce((n,item)=>n+item.count,0)},null,2));

