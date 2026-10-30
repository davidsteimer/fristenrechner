// SPDX-License-Identifier: AGPL-3.0-only
// Bind completed local L1 research without modifying a product or historical proof.
import assert from 'node:assert/strict';
import {readFile,writeFile,readdir,lstat,access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkPreservation} from './check-ap23l1-preservation.mjs';
import {sha256} from './check-ap23l1-references.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out='outputs/ap23l1-2026-10-27';
const proof=out+'/local-completion.json',mode=process.argv[2];assert.ok(['--write','--check'].includes(mode));
const read=path=>readFile(resolve(root,path));
async function bind(path){const stat=await lstat(resolve(root,path));assert.ok(stat.isFile()&&!stat.isSymbolicLink());
 const bytes=await read(path);return{path,byteLength:bytes.length,sha256:sha256(bytes)};}
async function walk(path){const result=[];for(const entry of await readdir(resolve(root,path),{withFileTypes:true})){
 const location=path+'/'+entry.name;assert.ok(!entry.isSymbolicLink());
 if(entry.isDirectory())result.push(...await walk(location));else{assert.ok(entry.isFile());result.push(location);}}return result.sort();}
function run(file,args){const result=spawnSync(file,args,{cwd:root,encoding:'utf8',maxBuffer:20*1024*1024});
 assert.equal(result.status,0,(result.stdout??'')+(result.stderr??''));return(result.stdout??'')+(result.stderr??'');}
const documents=['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
 'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md',
 'docs/fachrecht/start-ap23l1.md','docs/fachrecht/verwaltungsverfahren-ap23l1.md','docs/fachrecht/quellenpruefung-ap23l1.md',
 'docs/fachrecht/referenzfaelle-ap23l1.md'];
const scripts=['scripts/prepare-ap23l1.mjs','scripts/check-ap23l1-preservation.mjs','scripts/build-ap23l1-reference-fixture.mjs',
 'scripts/check-ap23l1-references.mjs','scripts/check_ap23l1_independent.py','scripts/check-ap23l1-completion.mjs'];
const tests=['tests/governance/ap23l1-research.test.mjs','tests/governance/ap23l1-references.test.mjs'];
const flags=['professionalAcceptance','sourceReleaseApproved','formatDecision','l2Started','l3Started','productCodeChanged',
 'acceptedLegalDataChanged','calendarChanged','schemasChanged','existingTestsChanged','productBuilt','commitCreated',
 'sourcePushPerformed','githubStatusPublished','installationPerformed','operatingChanges','calendarExportEnabled'];
const preservation=await checkPreservation({root});assert.equal(preservation.protectedFilesVerified,8649);
const fixturePath='docs/fachrecht/ap23l1/referenzfaelle.json',suite=JSON.parse(await read(fixturePath));
assert.equal(suite.paths.length,31);assert.equal(suite.cases.length,83);
assert.equal(suite.paths.filter(path=>path.canton==='AI').length,18);assert.equal(suite.paths.filter(path=>path.canton==='SZ').length,13);
const sourceIds=new Set();let sourceCount=0,sourceBytes=0;
for(const model of suite.sourceModels){
 assert.equal((await bind(model.path)).sha256,model.sha256,'Research input changed after assembly');const content=JSON.parse(await read(model.path));
 for(const flag of['professionalAcceptance','sourceReleaseApproved','operatingChanges'])assert.equal(content[flag],false,flag);
 if(model.sourceRegister)for(const entry of content.sources){assert.ok(!sourceIds.has(entry.id));sourceIds.add(entry.id);
  const actual=await bind(content.sourceBase+'/'+entry.file);assert.equal(actual.sha256,entry.sha256);assert.equal(actual.byteLength,entry.bytes);sourceCount++;sourceBytes+=entry.bytes;}
}
assert.equal(sourceCount,31);assert.equal(sourceBytes,9196390);
for(const path of suite.paths)for(const id of path.sourceIds)assert.ok(sourceIds.has(id),'Unbound legal source '+path.id+'/'+id);
const statusText=(await read('docs/fachrecht/verwaltungsverfahren-ap23l1.md')).toString();
assert.ok(statusText.includes('31 fachliche Gruppen'));assert.ok(statusText.includes('noch nicht abgenommen'));
for(const key of['AI-O1','AI-O2','AI-O3','SZ-O1','L1-END-SUSPENSION'])assert.ok(statusText.includes(key),key);
let links=0;for(const path of documents)for(const match of(await read(path)).toString().matchAll(/\]\(([^)]+)\)/gu)){
 const target=match[1].replace(/^<|>$/gu,'').split('#')[0];if(!target||/^(?:https?:|mailto:|codex:|plugin:)/iu.test(target))continue;
 const absolute=resolve(root,dirname(path),decodeURIComponent(target));if(absolute===resolve(root,proof)&&mode==='--write')continue;
 await access(absolute);links++;
}
const expectedCounts={datedResearchValue:54,qualificationBoundaryProposed:22,researchWindowBoundary:5,unresolvedBoundaryProposed:2};
assert.deepEqual(suite.cases.reduce((result,item)=>(result[item.expected.outcome]=(result[item.expected.outcome]??0)+1,result),{}),expectedCounts);
const testLog=out+'/research-tests.txt';
if(mode==='--write'){
 const tap=run(process.execPath,['--test',...tests]);const counts=Object.fromEntries([...tap.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gmu)].map(match=>[match[1],Number(match[2])]));
 assert.equal(counts.tests,67);assert.equal(counts.pass,67);for(const key of['fail','cancelled','skipped','todo'])assert.equal(counts[key],0);
 await writeFile(resolve(root,testLog),tap);
 const python=JSON.parse(run(resolve(root,'.venv/bin/python'),['scripts/check_ap23l1_independent.py','--write']));
 assert.equal(python.status,'passedIndependentResearchComparison');assert.equal(python.referenceComparisons,83);assert.equal(python.calendarEndEligibilityComparisons,2190);
 const node=JSON.parse(await read(out+'/reference-verification.json'));assert.equal(node.cases,83);assert.equal(node.sourceFiles,31);assert.deepEqual(node.discrepancies,[]);
 assert.equal(python.fixtureSha256,sha256(await read(fixturePath)));assert.equal(python.nodeReportSha256,sha256(await read(out+'/reference-verification.json')));
 run('git',['diff','--check']);await writeFile(resolve(root,out,'preservation-verification.json'),JSON.stringify(preservation,null,2)+'\n');
 const paths=[...new Set([...documents,...scripts,...tests,...await walk('docs/fachrecht/ap23l1'),...await walk(out)])].filter(path=>path!==proof).sort();
 const bindings=await Promise.all(paths.map(bind));const report={workPackage:'AP23L1',asOf:'2026-10-27',status:'local-research-verified-awaiting-human-acceptance',
  head:preservation.gitHead,scopeConfirmed:true,professionalStepStarted:true,acceptedCantons:21,operationalCantons:6,localOnlyAcceptedCantons:15,
  proposedNewCantons:['AI','SZ'],remainingCantons:['AI','NE','SZ','VD','VS'],window:suite.window,
  currentFormats:{administrativeCatalog:'8.0.0',manifest:'15.0.0',minimumConsumer:'15.0.0'},pathProposals:31,aiPathProposals:18,szPathProposals:13,
  references:83,referenceOutcomes:expectedCounts,sourceFiles:sourceCount,sourceBytes,calendarEndEligibilityComparisons:2190,calendarProbes:13,
  researchTests:67,protectedFiles:8649,protectedInputSha256:preservation.protectedInputSha256,acceptedK3Archive:preservation.acceptedK3Archive,
  localLinksChecked:links,legalInterpretationAutomaticallyValidated:false,realDeviceTest:false,m365HostTest:false,icsFilesCreated:0,outlookImports:0,
  ...Object.fromEntries(flags.map(flag=>[flag,false])),bindings};
 await writeFile(resolve(root,proof),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({...report,bindings:bindings.length}));
}else{
 const report=JSON.parse(await read(proof));assert.equal(report.status,'local-research-verified-awaiting-human-acceptance');
 assert.equal(report.head,preservation.gitHead);assert.equal(report.scopeConfirmed,true);assert.equal(report.professionalStepStarted,true);
 assert.equal(report.acceptedCantons,21);assert.equal(report.pathProposals,31);assert.equal(report.references,83);assert.equal(report.sourceFiles,sourceCount);
 assert.equal(report.sourceBytes,sourceBytes);assert.deepEqual(report.referenceOutcomes,expectedCounts);
 for(const flag of flags)assert.equal(report[flag],false,flag);
 const paths=[...new Set([...documents,...scripts,...tests,...await walk('docs/fachrecht/ap23l1'),...await walk(out)])].filter(path=>path!==proof).sort();
 assert.deepEqual(report.bindings.map(row=>row.path),paths,'Research input tree changed');
 for(const row of report.bindings)assert.deepEqual(await bind(row.path),row,'Bound research bytes changed '+row.path);
 console.log(JSON.stringify({status:'bound-L1-research-reverified',bindings:report.bindings.length,references:83,protectedFiles:8649,professionalAcceptance:false,operatingChanges:false}));
}
