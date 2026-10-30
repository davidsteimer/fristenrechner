// SPDX-License-Identifier: AGPL-3.0-only
// Bind completed M1 research only after actual independent checks. No product build.
import assert from 'node:assert/strict';
import {readFile,writeFile,readdir,lstat,access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkPreservation} from './check-ap23m1-preservation.mjs';
import {researchConfig,safeRelative,sha256,exact} from './prepare-ap23m1.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out=researchConfig.output;
export const completionConfig=Object.freeze({out,proof:out+'/local-completion.json',fixture:'docs/fachrecht/ap23m1/referenzfaelle.json',
 documents:[...researchConfig.living,researchConfig.proposal,'docs/fachrecht/ap23m1/start.md','docs/fachrecht/ap23m1/fachvorlage-ne-vd-vs.md',
  'docs/fachrecht/ap23m1/quellenpruefung.md','docs/fachrecht/ap23m1/referenzfaelle.md'],
 scripts:[...researchConfig.allowedNewResearchScripts],tests:[...researchConfig.allowedNewResearchTests],cantons:['NE','VD','VS']});
export const completionFlags=['professionalAcceptance','sourceReleaseApproved','formatDecision','m2Started','m3Started','productCodeChanged',
 'acceptedLegalDataChanged','calendarChanged','schemasChanged','existingTestsChanged','productBuilt','commitCreated','sourcePushPerformed',
 'githubStatusPublished','installationPerformed','operatingChanges','calendarExportEnabled'];
const raw=path=>readFile(resolve(root,path)),json=async path=>JSON.parse(await raw(path));
async function bind(path){safeRelative(path);const stat=await lstat(resolve(root,path));assert.ok(stat.isFile()&&!stat.isSymbolicLink());
 const bytes=await exact(root,path);return{path,byteLength:bytes.length,sha256:sha256(bytes)};}
async function walk(path){const files=[];for(const entry of await readdir(resolve(root,path),{withFileTypes:true})){
 const target=path+'/'+entry.name;assert.ok(!entry.isSymbolicLink(),'Symlink '+target);if(entry.isDirectory())files.push(...await walk(target));else{assert.ok(entry.isFile());files.push(target);}}
 return files.sort();}
function run(command,args){const result=spawnSync(command,args,{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});
 assert.equal(result.status,0,(result.stdout??'')+(result.stderr??''));return(result.stdout??'')+(result.stderr??'');}
export function tapCounts(text){return Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gmu)].map(row=>[row[1],Number(row[2])]));}
export function passedTests(counts){assert.ok(Number.isSafeInteger(counts.tests)&&counts.tests>0);assert.equal(counts.pass,counts.tests);
 for(const key of['fail','cancelled','skipped','todo'])assert.equal(counts[key],0,key);}
export async function collectResearchEvidence(){
 const preservation=await checkPreservation({root});assert.equal(preservation.protectedFilesVerified,11212);
 const suite=await json(completionConfig.fixture),node=await json(out+'/reference-verification.json'),independent=await json(out+'/independent-verification.json');
 assert.equal(suite.formatVersion,'ap23m1-research-references-1');assert.equal(suite.factPolicy,'explicitCaseFactsOnly');assert.equal(suite.sharedSyntheticFacts,undefined);
 assert.deepEqual(suite.window,{from:'2026-08-29',to:'2027-12-31'});
 for(const flag of['runtimeActive','productTest','legalApproval','exportTest'])assert.equal(suite[flag],false,flag);
 for(const field of['paths','cases','sourceModels','calendarBaselines','calendarProbes'])assert.ok(Array.isArray(suite[field])&&suite[field].length>0,field);
 assert.equal(new Set(suite.paths.map(row=>row.id)).size,suite.paths.length);assert.equal(new Set(suite.cases.map(row=>row.id)).size,suite.cases.length);
 assert.deepEqual([...new Set(suite.paths.map(row=>row.canton))].sort(),completionConfig.cantons);
 const pathProposalsByCanton=Object.fromEntries(completionConfig.cantons.map(canton=>[canton,suite.paths.filter(path=>path.canton===canton).length]));
 const sourceIds=new Set(),sourceBindings=[],companionBindings=[],sourceFilesByCanton={},findingCantons=new Set(),registerCantons=new Set();let sourceBytes=0,companionBytes=0;
 for(const model of suite.sourceModels){const descriptor=await bind(model.path);assert.equal(descriptor.sha256,model.sha256,'Research input changed after suite assembly');const content=await json(model.path);
  assert.ok(completionConfig.cantons.includes(content.canton),'Unexpected canton model');
  for(const flag of['professionalAcceptance','sourceReleaseApproved','operatingChanges'])assert.equal(content[flag],false,model.path+'/'+flag);
  if(model.cantonFindings){assert.ok(!findingCantons.has(content.canton));findingCantons.add(content.canton);}
  if(model.sourceRegister){assert.ok(!registerCantons.has(content.canton));registerCantons.add(content.canton);assert.ok(Array.isArray(content.sources)&&content.sources.length>0);
   assert.ok(content.sourceBase.startsWith(out+'/sources/'),'Final source copies must be durable M1 outputs');sourceFilesByCanton[content.canton]=content.sources.length;
   for(const item of content.sources){assert.ok(!sourceIds.has(item.id),'Duplicate legal source '+item.id);sourceIds.add(item.id);safeRelative(item.file);
    const source=await bind(content.sourceBase+'/'+item.file);assert.equal(source.sha256,item.sha256,item.id);assert.equal(source.byteLength,item.bytes,item.id);sourceBindings.push(source);sourceBytes+=source.byteLength;}
   for(const item of content.additionalRawCompanions??[]){safeRelative(item.file);const actual=await bind(content.sourceBase+'/'+item.file);
    assert.equal(actual.sha256,item.sha256,item.file);assert.equal(actual.byteLength,item.bytes,item.file);companionBindings.push(actual);companionBytes+=actual.byteLength;}}
 }
 assert.deepEqual([...findingCantons].sort(),completionConfig.cantons);assert.deepEqual([...registerCantons].sort(),completionConfig.cantons);assert.equal(suite.sourceModels.length,6);
 for(const path of suite.paths){assert.ok(Array.isArray(path.sourceIds)&&path.sourceIds.length>0);for(const id of path.sourceIds)assert.ok(sourceIds.has(id),'Unbound legal source '+path.id+'/'+id);
  assert.ok(suite.cases.some(item=>item.path===path.id&&item.expected.outcome==='datedResearchValue'),'No positive reference '+path.id);}
 const referenceOutcomes={};for(const item of suite.cases){assert.ok(suite.paths.some(path=>path.id===item.path),'Unknown reference path');const outcome=item.expected.outcome;
  assert.ok(['datedResearchValue','qualificationBoundaryProposed','researchWindowBoundary','unresolvedBoundaryProposed'].includes(outcome));
  assert.equal(Object.hasOwn(item.expected,'end'),outcome==='datedResearchValue','Boundary must not claim definitive end');referenceOutcomes[outcome]=(referenceOutcomes[outcome]??0)+1;}
 assert.equal(node.status,'research-references-verified');assert.deepEqual(node.discrepancies,[]);assert.equal(node.fixtureSha256,sha256(await raw(completionConfig.fixture)));
 assert.equal(node.paths,suite.paths.length);assert.equal(node.cases,suite.cases.length);assert.equal(node.results.length,suite.cases.length);
 assert.equal(node.sourceFiles,sourceBindings.length);assert.equal(node.sourceBytes,sourceBytes);assert.equal(node.calendarProbes,suite.calendarProbes.length);
 assert.equal(node.companionFiles,companionBindings.length);assert.equal(node.companionBytes,companionBytes);
 assert.deepEqual(node.results.map(row=>row.id).sort(),suite.cases.map(row=>row.id).sort());
 for(const flag of['productImports','productTest','legalApproval','exportTest','operatingChanges'])assert.equal(node[flag],false,flag);
 assert.equal(independent.status,'passedIndependentResearchComparison');assert.deepEqual(independent.discrepancies,[]);
 assert.equal(independent.fixtureSha256,node.fixtureSha256);assert.equal(independent.nodeReportSha256,sha256(await raw(out+'/reference-verification.json')));
 assert.equal(independent.referenceComparisons,suite.cases.length);assert.equal(independent.calendarProbes,suite.calendarProbes.length);
 assert.ok(Number.isSafeInteger(independent.calendarEndEligibilityComparisons)&&independent.calendarEndEligibilityComparisons>0);
 assert.equal(independent.checkerSha256,sha256(await raw('scripts/check_ap23m1_references.py')));
 for(const item of independent.calendarBaselineInputs)assert.deepEqual(await bind(item.path),item);
 for(const flag of['productModulesImported','legalInterpretationAutomaticallyValidated','runtimeActive','exportTest','legalApproval'])assert.equal(independent[flag],false,flag);
 const testText=(await raw(out+'/research-tests.txt')).toString(),testCounts=tapCounts(testText);passedTests(testCounts);
 return{preservation,suite,node,independent,sourceBindings,sourceBytes,companionBindings,companionBytes,sourceFilesByCanton,pathProposalsByCanton,referenceOutcomes,testCounts};
}
export function metadataFromEvidence(e){return structuredClone({workPackage:'AP23M1',asOf:'2026-10-27',status:'local-research-verified-awaiting-human-acceptance',
 head:e.preservation.gitHead,scopeConfirmed:true,professionalStepStarted:true,acceptedCantons:23,operationalCantons:6,localOnlyAcceptedCantons:17,
 proposedNewCantons:['NE','VD','VS'],remainingCantons:['NE','VD','VS'],window:e.suite.window,
 currentFormats:{administrativeCatalog:'9.0.0',manifest:'16.0.0',minimumConsumer:'16.0.0'},pathProposals:e.suite.paths.length,pathProposalsByCanton:e.pathProposalsByCanton,
 references:e.suite.cases.length,referenceOutcomes:e.referenceOutcomes,sourceFiles:e.sourceBindings.length,sourceFilesByCanton:e.sourceFilesByCanton,sourceBytes:e.sourceBytes,
 rawCompanionFiles:e.companionBindings.length,rawCompanionBytes:e.companionBytes,rawEvidenceFiles:e.sourceBindings.length+e.companionBindings.length,
 calendarEndEligibilityComparisons:e.independent.calendarEndEligibilityComparisons,calendarProbes:e.suite.calendarProbes.length,researchTests:e.testCounts.tests,
 protectedFiles:11212,protectedInputSha256:e.preservation.protectedInputSha256,acceptedL3Archive:e.preservation.acceptedL3Archive,startSnapshot:e.preservation.startSnapshot,
 legalInterpretationAutomaticallyValidated:false,realDeviceTest:false,m365HostTest:false,icsFilesCreated:0,outlookImports:0,
 ...Object.fromEntries(completionFlags.map(flag=>[flag,false]))});}
export function validateCompletionMetadata(saved,e){const expected=metadataFromEvidence(e);for(const[key,value]of Object.entries(expected))assert.deepEqual(saved[key],value,key);
 assert.match(saved.head,/^[a-f0-9]{40}$/u);assert.ok(Number.isSafeInteger(saved.localLinksChecked)&&saved.localLinksChecked>0);assert.ok(Array.isArray(saved.bindings)&&saved.bindings.length>0);
 assert.equal(new Set(saved.bindings.map(row=>row.path)).size,saved.bindings.length);for(const row of saved.bindings){safeRelative(row.path);assert.deepEqual(Object.keys(row).sort(),['byteLength','path','sha256']);
  assert.ok(Number.isSafeInteger(row.byteLength)&&row.byteLength>=0);assert.match(row.sha256,/^[a-f0-9]{64}$/u);}
 assert.deepEqual(Object.keys(saved).sort(),[...Object.keys(expected),'localLinksChecked','bindings'].sort(),'Closed M1 completion metadata');return true;}
async function inventory(e){return[...new Set([...completionConfig.documents,...completionConfig.scripts,...completionConfig.tests,
 ...await walk('docs/fachrecht/ap23m1'),...await walk(out),...await walk(researchConfig.startSnapshot),researchConfig.archive+'/receipt.json',
 ...e.sourceBindings.map(row=>row.path),...e.companionBindings.map(row=>row.path),...e.independent.calendarBaselineInputs.map(row=>row.path)])].filter(path=>path!==completionConfig.proof).sort();}
export async function finalize(mode){assert.ok(['--write','--check'].includes(mode));
 if(mode==='--write'){run(process.execPath,['scripts/check-ap23m1.mjs']);run(resolve(root,'.venv/bin/python'),['scripts/check_ap23m1_references.py','--write']);
  const tap=run(process.execPath,['--test',...completionConfig.tests]);passedTests(tapCounts(tap));await writeFile(resolve(root,out+'/research-tests.txt'),tap);
  run('git',['diff','--check']);const preservation=await checkPreservation({root});await writeFile(resolve(root,out+'/preservation-verification.json'),JSON.stringify(preservation,null,2)+'\n');}
 const e=await collectResearchEvidence();let links=0;for(const path of completionConfig.documents)for(const match of(await raw(path)).toString().matchAll(/\]\(([^)]+)\)/gu)){
  const target=match[1].replace(/^<|>$/gu,'').split('#')[0];if(!target||/^(?:https?:|mailto:|codex:|plugin:)/iu.test(target))continue;
  const absolute=resolve(root,dirname(path),decodeURIComponent(target));if(absolute!==resolve(root,completionConfig.proof)||mode!=='--write')await access(absolute);links++;}
 if(mode==='--check'){const saved=await json(completionConfig.proof);validateCompletionMetadata(saved,e);assert.equal(saved.localLinksChecked,links);assert.deepEqual(saved.bindings.map(row=>row.path),await inventory(e));
  for(const item of saved.bindings)assert.deepEqual(await bind(item.path),item,'Bound M1 bytes changed '+item.path);
  return{status:'bound-M1-research-reverified',bindings:saved.bindings.length,references:saved.references,protectedFiles:11212,professionalAcceptance:false,operatingChanges:false};}
 const bindings=await Promise.all((await inventory(e)).map(bind)),report={...metadataFromEvidence(e),localLinksChecked:links,bindings};validateCompletionMetadata(report,e);
 await writeFile(resolve(root,completionConfig.proof),JSON.stringify(report,null,2)+'\n');for(const item of bindings)assert.deepEqual(await bind(item.path),item,'M1 completion readback '+item.path);return{...report,bindings:bindings.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(await finalize(process.argv[2]),null,2));
