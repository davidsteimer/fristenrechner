// SPDX-License-Identifier: AGPL-3.0-only
// Historical MVP09 web tests use original sealed build inputs, not today's entry.
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,symlink,cp,readdir,lstat,readFile,writeFile} from 'node:fs/promises';
import {execFileSync,spawnSync} from 'node:child_process';
import {dirname,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {root,prefix,proposalPath,hash,encode,readRegular,writeExclusive,bind} from './record-r10b-execution-approval.mjs';
// These are technical index-test contexts, not additional legal source reviews.
// The unchanged historical tests refer to frozen 57-/81-source index snapshots.
export const historicalPythonContext=Object.freeze({
 modules:['test_source_reviews_mvp05','test_source_reviews_mvp06'],
 currentValidator:'tests/governance/validate_source_reviews.py',
 fixture:'outputs/release-mvp09-2026-10-18/build-evidence/fixtures/tests/governance/validate_source_reviews.py',
 sha256:'40d8bdb6f26a7fe710a4430e2ce45e7a709896348250c649c18fdeafa392eedd',byteLength:26984,
 publication:'outputs/publication-mvp09-2026-10-19/publication-package.json',
 publicationSha256:'be8c283620e72df15c6803bedcde6d2c5ff83d5d2428631fc21130778ed46a97',
 publicationByteLength:117422,publicationPointer:'/files/508',
 priorInventory:'outputs/release-mvp09-2026-10-18/portability-standard-no-private-20261018-05/input-inventory.json',
 expectedMethodCounts:{all:45,current:32,historical:13}
});
function safeRelative(path){assert.ok(typeof path==='string'&&path&&!path.startsWith('/')&&!/[\\:\x00-\x1f]/u.test(path)&&path.split('/').every(p=>p&&p!=='.'&&p!=='..'),path);return path;}
async function bytesAt(base,path){safeRelative(path);let target=base;for(const part of path.split('/')){target=resolve(target,part);assert.equal((await lstat(target)).isSymbolicLink(),false,path);}assert.equal((await lstat(target)).isFile(),true,path);return readFile(target);}
function pythonEnv(base){return{...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONPATH:resolve(base,'tests/governance'),FRISTENRECHNER_DATA_CANDIDATE:''};}
function discoveredPythonIds(base,python){
 const code="import json, unittest\ndef flat(s):\n for x in s:\n  if isinstance(x, unittest.TestSuite): yield from flat(x)\n  else: yield x.id()\ns=unittest.TestLoader().discover('tests/governance', pattern='test_*.py')\nprint(json.dumps(list(flat(s))))\n";
 const result=spawnSync(python,['-B','-c',code],{cwd:base,env:pythonEnv(base),encoding:'utf8',maxBuffer:4*1024*1024});
 if(result.error)throw result.error;assert.equal(result.status,0,result.stderr);const ids=JSON.parse(result.stdout);assert.ok(ids.length>0);assert.equal(new Set(ids).size,ids.length);for(const id of ids)assert.ok(!id.startsWith('unittest.loader._FailedTest.'),'Failed discovery '+id);return ids.sort();
}
export function splitPythonGovernanceIds(ids){
 assert.equal(new Set(ids).size,ids.length,'Duplicate unittest method');
 const historical=ids.filter(id=>historicalPythonContext.modules.some(name=>id.startsWith(name+'.'))),current=ids.filter(id=>!historical.includes(id));
 assert.deepEqual([...current,...historical].sort(),[...ids].sort(),'Incomplete unittest partition');
 assert.deepEqual({all:ids.length,current:current.length,historical:historical.length},historicalPythonContext.expectedMethodCounts,'Explicit Python context inventory changed. Do not silently omit new methods.');
 return{all:[...ids].sort(),current,historical};
}
export async function verifyHistoricalPythonFixture(base){
 const fixture=await bytesAt(base,historicalPythonContext.fixture);assert.equal(hash(fixture),historicalPythonContext.sha256);assert.equal(fixture.length,historicalPythonContext.byteLength);
 const publication=await bytesAt(base,historicalPythonContext.publication);assert.equal(hash(publication),historicalPythonContext.publicationSha256);assert.equal(publication.length,historicalPythonContext.publicationByteLength);
 const row=JSON.parse(publication).files[508];assert.equal(row.path,historicalPythonContext.currentValidator);assert.equal(row.sha256,historicalPythonContext.sha256);assert.equal(row.byteLength,historicalPythonContext.byteLength);
 return{fixture:{path:historicalPythonContext.fixture,sha256:hash(fixture),byteLength:fixture.length},publicBinding:{path:historicalPythonContext.publication,sha256:hash(publication),byteLength:publication.length,pointer:historicalPythonContext.publicationPointer},bytes:fixture};
}
export async function runPythonGovernanceContexts({base=root,inputFiles,python=resolve(root,'.venv/bin/python'),onLog}={}){
 const partition=splitPythonGovernanceIds(discoveredPythonIds(base,python)),fixture=await verifyHistoricalPythonFixture(base),sourceRows=inputFiles??[];
 assert.ok(sourceRows.length>0,'A closed, explicit nonprivate input inventory is required');
 assert.equal(new Set(sourceRows.map(r=>r.path)).size,sourceRows.length,'Duplicate context input');
 const parentInputs=[];
 for(const row of sourceRows){const b=await bytesAt(base,row.path);assert.equal(hash(b),row.sha256,row.path);assert.equal(b.length,row.byteLength,row.path);parentInputs.push({...row});}
 await mkdir(resolve(base,'.work'),{recursive:true});const historicalBase=await mkdtemp(resolve(base,'.work/mvp10-python-historical-context-')),historicalInputs=[];
 for(const row of parentInputs){const b=row.path===historicalPythonContext.currentValidator?fixture.bytes:await bytesAt(base,row.path);await mkdir(dirname(resolve(historicalBase,row.path)),{recursive:true});await writeFile(resolve(historicalBase,row.path),b,{flag:'wx'});historicalInputs.push({...row,sha256:hash(b),byteLength:b.length});}
 // Only dependencies are shared. No project-data, source-evidence or .git link.
 await symlink(resolve(root,'.venv'),resolve(historicalBase,'.venv'),'dir');
 assert.deepEqual(discoveredPythonIds(historicalBase,python),partition.all,'Historical derived discovery changed');
 const differences=historicalInputs.filter((row,i)=>row.sha256!==parentInputs[i].sha256||row.byteLength!==parentInputs[i].byteLength);
 assert.deepEqual(differences.map(r=>r.path),[historicalPythonContext.currentValidator]);
 const steps=[];
 for(const[id,cwd,ids]of[['governance-python-current',base,partition.current],['governance-python-historical',historicalBase,partition.historical]]){
  const args=['-B','-m','unittest','-v',...ids],startedAt=new Date().toISOString(),result=spawnSync(python,args,{cwd,env:pythonEnv(cwd),encoding:'utf8',maxBuffer:16*1024*1024});
  if(result.error)throw result.error;const bytes=Buffer.from((result.stdout??'')+(result.stderr??'')),text=bytes.toString(),tests=Number(text.match(/^Ran (\d+) tests? in /mu)?.[1]??0);
  const passed=result.status===0&&tests===ids.length&&/^OK\s*$/mu.test(text)&&!/\b(?:skipped|expected failure|unexpected success)\b/iu.test(text);
  const step={id,command:[python,...args],startedAt,finishedAt:new Date().toISOString(),exitCode:result.status,tests,expectedMethodIds:ids,passed,context:id.endsWith('historical')?'exact-public-MVP09-walker-and-unchanged-historical-tests':'current-MVP10-walker'};
  if(onLog)step.log=await onLog(id,bytes);else{process.stdout.write(text);}
  steps.push(step);
 }
 for(const row of parentInputs){const b=await bytesAt(base,row.path);assert.equal(hash(b),row.sha256,row.path);assert.equal(b.length,row.byteLength,row.path);}
 for(const row of historicalInputs){const b=await bytesAt(historicalBase,row.path);assert.equal(hash(b),row.sha256,row.path);assert.equal(b.length,row.byteLength,row.path);}
 return{kind:'mvp10-disjoint-python-index-test-contexts',passed:steps.every(s=>s.passed),partition,steps,
  historicalContext:{stage:relative(base,historicalBase),inputCount:historicalInputs.length,inputFiles:historicalInputs,derivedFromSameNonprivateInputs:true,onlyReplacedPath:historicalPythonContext.currentValidator,replacement:fixture.fixture,publicBinding:fixture.publicBinding,allOtherInputBytesUnchanged:true,noGitRequired:true},
  currentValidatorUnchanged:true,oldTestsAndIndicesUnchanged:true,testsSkipped:false,assertionsRemoved:false,newLegalSourceReviewClaimed:false};
}
export async function standalonePythonGovernanceInputs(){
 const prior=JSON.parse(await bytesAt(root,historicalPythonContext.priorInventory)),paths=new Set(prior.files.map(r=>r.path));
 assert.equal(prior.files.length,2799);assert.equal(prior.privateRawEvidenceIncluded,false);
 // The old public reference set is only the historical-metadata base. Bind the
 // entire CURRENT runtime/event/schema tree and every discovered Python test,
 // rather than misrepresenting the old 2799-file set as today's full closure.
 async function addTree(path,extension){for(const entry of await readdir(resolve(root,path),{withFileTypes:true})){const child=path+'/'+entry.name;assert.equal(entry.isSymbolicLink(),false,child);if(entry.isDirectory()){if(entry.name==='__pycache__')continue;await addTree(child,extension);}else if(entry.isFile()&&extension.test(entry.name))paths.add(child);}}
 await addTree('data',/\.json$/u);await addTree('schemas',/\.json$/u);await addTree('tests/governance',/\.py$/u);
 paths.add(historicalPythonContext.fixture);paths.add(historicalPythonContext.publication);paths.add(historicalPythonContext.currentValidator);
 const rows=[];for(const path of [...paths].sort()){assert.doesNotMatch(path,/(?:^|\/)(?:\.git|\.work|\.private|Userinput|private|raw|__pycache__)(?:\/|$)|\.pyc$/iu);const b=await bytesAt(root,path);rows.push({path,sha256:hash(b),byteLength:b.length});}
 return rows;
}
export async function runStandalonePythonGovernance(){
 const rows=await standalonePythonGovernanceInputs();
 const result=await runPythonGovernanceContexts({base:root,inputFiles:rows});console.log(JSON.stringify({kind:result.kind,passed:result.passed,discovery:{all:result.partition.all.length,current:result.partition.current.length,historical:result.partition.historical.length},boundCurrentInputCount:rows.length,historicalDerivedInputCount:result.historicalContext.inputCount,steps:result.steps.map(s=>({id:s.id,tests:s.tests,passed:s.passed,exitCode:s.exitCode})),currentValidatorUnchanged:result.currentValidatorUnchanged,oldTestsAndIndicesUnchanged:result.oldTestsAndIndicesUnchanged,testsSkipped:result.testsSkipped,assertionsRemoved:result.assertionsRemoved}));process.exitCode=result.passed?0:1;return result;
}
const json=async path=>JSON.parse(await readRegular(root,path));
async function exact(row,path=row.path){const bytes=await readRegular(root,path);assert.equal(bytes.length,row.byteLength);assert.equal(hash(bytes),row.sha256,path);return bytes;}
export async function verifyHistoricalSourceEvidence(){
 const {verifyArchive}=await import('../outputs/r10-b-vorbereitung-2026-10-28/tools/archive-r10-a2-acceptance.mjs');
 const {privateMvp10InitialResearchSuites:privateMvp10HistoricalResearchSuites}=await import('./check-mvp10-portability.mjs');
 const archive=await verifyArchive(resolve(root,'outputs/r10-a2-abnahme-2026-10-28'));
 const guard=await json(prefix+'/execution-protection.json'),byPath=new Map(guard.protectedFiles.map(row=>[row.path,row]));
 const suites=[];for(const path of privateMvp10HistoricalResearchSuites){const row=byPath.get(path);assert.ok(row,'Unbound historical suite '+path);await exact(row);suites.push(row);}
 assert.equal(suites.length,28);
 const proof=await json('outputs/r10-a2-2026-10-28/common-completion.json');
 assert.equal(proof.governanceTests.pass,117);assert.equal(proof.technicalEvidenceClosure,true);
 const report={kind:'mvp10-bounded-historical-source-evidence-reuse',status:'passed',checkedAt:new Date().toISOString(),archive,suites,originalGovernanceTests:117,historicalSuitesReexecuted:false,currentSourceTests:'Separate MVP10 source-inventory/source-approval/source-coverage suites',scope:'Byte integrity and accepted evidence reuse only. No new legal assessment and no old finalizer against the changed release workspace.',a2Common:await bind('outputs/r10-a2-2026-10-28/common-completion.json')};
 await writeExclusive(root,prefix+'/historical-source-evidence.json',encode(report));return report;
}
export async function prepareHistoricalWeb(){const p=await json(proposalPath),rec=p.recovery;await exact(rec.buildProof);await exact(rec.actualPackage);await exact(rec.artifactVerification);const stage=await mkdtemp(resolve(root,'.work/mvp10-historical-mvp09-web-'));for(const row of rec.archiveInputs){const bytes=await exact(row);await mkdir(dirname(resolve(stage,row.originalPath)),{recursive:true});await writeExclusive(root,relative(root,resolve(stage,row.originalPath)),bytes);}for(const row of rec.helperBlobs){const bytes=execFileSync('git',['show',row.commit+':'+row.path],{cwd:root,maxBuffer:4*1024*1024});assert.equal(bytes.length,row.byteLength);assert.equal(hash(bytes),row.sha256);await mkdir(dirname(resolve(stage,row.path)),{recursive:true});await writeExclusive(root,relative(root,resolve(stage,row.path)),bytes);}await symlink(resolve(root,'node_modules'),resolve(stage,'node_modules'),'dir');await symlink(resolve(root,'spfx/node_modules'),resolve(stage,'spfx/node_modules'),'dir');const built=spawnSync(process.execPath,['scripts/build-public-app.mjs'],{cwd:stage,env:{...process.env,FRISTENRECHNER_DATA_CANDIDATE:'',PATH:dirname(process.execPath)+':'+(process.env.PATH??'')},encoding:'utf8',maxBuffer:16*1024*1024});const log=relative(root,stage)+'/web.log';await writeExclusive(root,log,Buffer.from((built.stdout??'')+(built.stderr??'')));assert.equal(built.status,0,'Historical MVP09 web build failed');const output=relative(root,stage)+'/.work/public-app',manifest=JSON.parse(await readRegular(root,output+'/build-manifest.json'));assert.equal(manifest.version,'0.9.0');assert.equal(manifest.dataReleaseId,'2026-10-18-mvp-09-approved.1');return{status:'passed',historicalBaseline:'MVP09',stage:relative(root,stage),output:resolve(root,output),manifest:await bind(output+'/build-manifest.json'),log:await bind(log),historicalInputsReverified:955,helpers:5,currentNormalEntryUsed:false};}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.equal(process.argv.length,3);assert.ok(['--mvp09-web','--source-evidence','--python-governance'].includes(process.argv[2]));if(process.argv[2]==='--python-governance')await runStandalonePythonGovernance();else console.log(JSON.stringify(process.argv[2]==='--source-evidence'?await verifyHistoricalSourceEvidence():await prepareHistoricalWeb()));}
