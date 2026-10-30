// SPDX-License-Identifier: AGPL-3.0-only
// R10-D additive CLI correction. Historical validators and assertions stay sealed.
import assert from 'node:assert/strict';
import {readFile,readdir,lstat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runPythonGovernanceContexts,historicalPythonContext} from './check-mvp10-historical-source-tests.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
export const contextPaths='tests/governance/fixtures/source-review-context-paths.json';
export function requireSuccessfulStep(result,label){
 if(result.error)throw result.error;
 assert.equal(result.signal??null,null,label+' terminated by signal');
 assert.equal(result.status,0,label+' failed');
}
export async function runSourceReviewSteps({selfTest,pythonContexts,nodeGovernance}){
 requireSuccessfulStep(await selfTest(),'Current source-index self-test');
 const result=await pythonContexts();
 assert.equal(result.passed,true,'Disjoint Python governance failed');
 assert.deepEqual({all:result.partition.all.length,current:result.partition.current.length,historical:result.partition.historical.length},historicalPythonContext.expectedMethodCounts);
 requireSuccessfulStep(await nodeGovernance(),'Complete Node governance');
 return{passed:true,pythonMethods:historicalPythonContext.expectedMethodCounts};
}
export async function publicPythonContextInputs(base=root){
 const paths=new Set(JSON.parse(await readFile(resolve(base,contextPaths))));
 for(const path of paths)assert.match(path,/^outputs\/.*\.json$/u);
 async function tree(path,ext){for(const e of await readdir(resolve(base,path),{withFileTypes:true})){
  const p=path+'/'+e.name;assert.equal(e.isSymbolicLink(),false,p);
  if(e.isDirectory()&&e.name!=='__pycache__')await tree(p,ext);
  else if(e.isFile()&&ext.test(e.name))paths.add(p);
 }}
 await tree('data',/\.json$/u);await tree('schemas',/\.json$/u);await tree('tests/governance',/\.py$/u);
 paths.add(historicalPythonContext.fixture);paths.add(historicalPythonContext.publication);
 const rows=[];
 for(const path of [...paths].sort()){
  assert.ok(!path.startsWith('/')&&!/[\\:\x00-\x1f]/u.test(path)&&path.split('/').every(p=>p&&p!=='.'&&p!=='..'));
  assert.doesNotMatch(path,/(?:^|\/)(?:\.work|\.git|private|raw|Userinput|__pycache__)(?:\/|$)|\.private\./u);
  let full=base;for(const p of path.split('/')){full=resolve(full,p);assert.equal((await lstat(full)).isSymbolicLink(),false,path);}
  const b=await readFile(full);rows.push({path,byteLength:b.length,sha256:createHash('sha256').update(b).digest('hex')});
 }
 return rows;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,2);
 const python=resolve(root,'.venv/bin/python');
 const run=(exe,args)=>spawnSync(exe,args,{cwd:root,stdio:'inherit',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',FRISTENRECHNER_DATA_CANDIDATE:''}});
 const result=await runSourceReviewSteps({
  selfTest:()=>run(python,['-B','tests/governance/validate_source_reviews.py','--self-test']),
  pythonContexts:async()=>runPythonGovernanceContexts({base:root,inputFiles:await publicPythonContextInputs(root),python}),
  nodeGovernance:()=>run(process.execPath,['scripts/run-standard-tests.mjs','governance'])
 });
 console.log(JSON.stringify({kind:'source-review-cli-completion',...result,newLegalReviewClaimed:false}));
}
