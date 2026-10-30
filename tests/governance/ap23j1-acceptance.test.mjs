// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic fixtures only. No real J1 source, report, receipt or archive is edited.
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,rm,symlink,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {archiveAcceptance,archiveConfig,safeRelative,sha256} from '../../scripts/archive-ap23j1-acceptance.mjs';

const passed=n=>({tests:n,pass:n,fail:0,cancelled:0,skipped:0,todo:0});
const originalFalseFlags=['professionalAcceptance','sourceReleaseApproved','formatDecision','implementationStarted','runtimeActivation',
  'productCodeChanged','schemasChanged','acceptedLegalDataChanged','existingTestsChanged','releaseBuildPerformed','commitCreated',
  'sourcePushPerformed','githubStatusPublished','operatingChanges'];
const preservationFalseFlags=['productCodeChanged','acceptedLegalDataChanged','schemasChanged','existingTestsChanged',
  'originalPreparationChanged','i3HistoricalEvidenceChanged','userDocumentChanged','commitCreated','sourcePushPerformed','operatingChanges'];

async function fixture(t,alterProof=()=>{}){
  const root=await mkdtemp(join(tmpdir(),'ap23j1-acceptance-'));
  t.after(()=>rm(root,{recursive:true,force:true}));
  const descriptors=[];
  async function file(path,value,bound=true){
    const bytes=Buffer.from(typeof value==='string'?value:JSON.stringify(value));
    await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),bytes);
    const descriptor={path,byteLength:bytes.length,sha256:sha256(bytes)};
    if(bound)descriptors.push(descriptor);return descriptor;
  }
  const old=await file('old/protected.txt','protected before J1',false);
  const living=await file('docs/living.md','accepted J1 living text');
  const source=await file('proof/sources/official.txt','synthetic official source body');
  const checker=await file('scripts/research.mjs','synthetic Node research checker');
  const python=await file('scripts/independent.py','synthetic independent checker');
  const model=await file('docs/model.json',{canton:'FR',research:true});
  const countercheck=await file('docs/countercheck.md','synthetic read-only countercheck');
  const head='1'.repeat(40);
  const guard=await file('proof/guard.json',{workPackage:'AP23J1',capturedBeforeResearch:true,capturedBeforeLivingUpdates:true,head,files:{[old.path]:old.sha256}});
  const preservationValue={status:'research-inputs-preserved',gitHead:head,protectedFilesVerified:1,protectedInputSha256:guard.sha256,
    ...Object.fromEntries(preservationFalseFlags.map(key=>[key,false]))};
  const preservation=await file('proof/preservation.json',preservationValue);
  const fixtureFile=await file('docs/fixture.json',{paths:[{id:'FR-SYNTHETIC'}],cases:[{id:'positive',provenance:'canton-analyst-static-reference'}],
    sourceModels:[model],runtimeActive:false,productTest:false,legalApproval:false});
  const outcomeCounts={datedResearchValue:1,unresolvedBoundaryProposed:0,qualificationBoundaryProposed:0,researchWindowBoundary:0};
  const manualCounts={dated:1,qualification:0,collision:0,window:0};
  const reference=await file('proof/reference.json',{status:'passedResearchComparison',referenceCases:1,paths:1,counts:outcomeCounts,
    results:[{id:'positive'}],discrepancies:[],calendarProbes:1,calendarComparisons:[{daysCompared:1,namedHolidayDateSetsEqual:true,endEligibilityDifferences:0}],
    fixtureSha256:fixtureFile.sha256,checkerSha256:checker.sha256,runtimeActive:false,exportTest:false,legalApproval:false});
  const independent=await file('proof/independent.json',{status:'passedIndependentResearchComparison',referenceComparisons:1,
    calendarEndEligibilityComparisons:1,calendarProbes:1,discrepancies:[],fixtureSha256:fixtureFile.sha256,
    nodeReportSha256:reference.sha256,checkerSha256:python.sha256,runtimeActive:false,exportTest:false,legalApproval:false});
  const evidence=await file('proof/evidence.json',{status:'captured-source-bytes-verified',inventoriedEvidenceFiles:1,explicitSourceBindings:1,
    fileInventory:[source],professionalAcceptance:false,sourceReleaseApproved:false,productDataChanged:false,operatingChanges:false});
  const log=await file('proof/tests.txt',Object.entries(passed(2)).map(([key,value])=>'# '+key+' '+value).join('\n')+'\n');
  const proof={workPackage:'AP23J1',status:'research-completed-awaiting-human-acceptance',scopeConfirmed:true,scopeConfirmedBy:'David Steimer',head,
    bindings:descriptors,researchGroups:1,groupsByCanton:{FR:1,GE:0,JU:0},manualLegalReferences:1,extraSyntheticProbes:0,
    manualReferenceCounts:manualCounts,allResearchComparisons:1,independentImplementationComparisons:1,counts:outcomeCounts,
    calendarProbes:1,calendarEndEligibilityComparisons:1,namedHolidayDateSetsEqual:true,researchCheckerTests:{...passed(2),productTests:false},
    evidenceFiles:1,explicitEvidenceBindings:1,preservation:preservationValue,readOnlyCountercheckNote:countercheck.path,diffWhitespaceCheckPassed:true,
    ...Object.fromEntries(originalFalseFlags.map(key=>[key,false]))};
  alterProof(proof);
  const original=await file('proof/local-completion.json',proof,false);
  const config={...archiveConfig,target:'archive/j1',proofPath:original.path,proofSha256:original.sha256,bindingCount:descriptors.length,
    sourcePrefix:'proof/sources/',sourceCount:1,explicitCount:1,groups:1,groupsByCanton:{FR:1,GE:0,JU:0},cases:1,manualCases:1,extraCases:0,
    manualCounts,outcomeCounts,tests:2,protectedCount:1,calendarProbes:1,calendarDays:1,requireGitHead:false,
    guardPath:guard.path,preservationPath:preservation.path,referencePath:reference.path,independentPath:independent.path,
    evidencePath:evidence.path,testLog:log.path,fixturePath:fixtureFile.path,checkerPath:checker.path,independentCheckerPath:python.path};
  async function mutateProof(fn){
    const current=JSON.parse(await readFile(join(root,config.proofPath)));fn(current);
    const updated=await file(config.proofPath,current,false);config.proofSha256=updated.sha256;
  }
  async function change(path,fn){
    const current=JSON.parse(await readFile(join(root,path)));fn(current);
    const descriptor=await file(path,current,false);
    await mutateProof(proof=>{proof.bindings=proof.bindings.map(item=>item.path===path?descriptor:item);});
  }
  return{root,config,file,change,mutateProof,old,living,source,checker,python,model,countercheck,guard,reference,independent,evidence,log};
}

test('preflight is read-only and the separate J1 receipt accepts no product or release permission',async t=>{
  const f=await fixture(t),preflight=await archiveAcceptance(f);
  assert.equal(preflight.mode,'source-preflight-only');
  await assert.rejects(readFile(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});
  const archived=await archiveAcceptance({...f,write:true});assert.equal(archived.mode,'archive-created');
  assert.equal(archived.sourceFiles,1);assert.equal(archived.historicalProtectedInputsNotRecopied,1);
  const historical=JSON.parse(await readFile(join(f.root,f.config.target,f.config.proofPath)));
  const receipt=JSON.parse(await readFile(join(f.root,f.config.target,'receipt.json')));
  for(const key of originalFalseFlags)assert.equal(historical[key],false,key);
  assert.equal(receipt.professionalAcceptance,true);assert.equal(receipt.j2Started,true);
  assert.deepEqual(receipt.acceptedDecisionPoints,['J1-A','J1-B','J1-C','J1-D','J1-E','J1-F','J1-G']);
  for(const key of['formatDecision','implementationStarted','runtimeActivation','sourceReleaseApproved','releaseBuildPerformed','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(receipt[key],false,key);
  await assert.rejects(readFile(join(f.root,f.config.target,f.old.path)),{code:'ENOENT'});
});

test('complete archive verifies autonomously without current source, living text or historic guard inputs',async t=>{
  const f=await fixture(t),first=await archiveAcceptance({...f,write:true});
  for(const directory of['docs','proof','scripts','old'])await rm(join(f.root,directory),{recursive:true});
  const second=await archiveAcceptance(f);assert.equal(second.mode,'archive-reverified');
  assert.equal(second.receiptSha256,first.receiptSha256);
});

test('repeat write verifies rather than replacing accepted bytes',async t=>{
  const f=await fixture(t),first=await archiveAcceptance({...f,write:true}),second=await archiveAcceptance({...f,write:true});
  assert.equal(second.mode,'archive-reverified');assert.equal(first.receiptSha256,second.receiptSha256);
});

for(const name of['source','old','living','model','countercheck'])test('changed '+name+' bytes halt before capture',async t=>{
  const f=await fixture(t);await f.file(f[name].path,'changed synthetic input',false);
  await assert.rejects(archiveAcceptance({...f,write:true}),/Protected bytes changed/);
  await assert.rejects(readFile(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});
});
test('changed proof hash halts before capture',async t=>{const f=await fixture(t);f.config.proofSha256='0'.repeat(64);await assert.rejects(archiveAcceptance({...f,write:true}),/Protected bytes changed/);});
test('missing official source halts before capture',async t=>{const f=await fixture(t);await rm(join(f.root,f.source.path));await assert.rejects(archiveAcceptance({...f,write:true}),{code:'ENOENT'});});

for(const key of originalFalseFlags)test('historical false flag cannot acquire acceptance or authority: '+key,async t=>{
  const f=await fixture(t,proof=>{proof[key]=true;});await assert.rejects(archiveAcceptance({...f,write:true}),/Historical boundary/);
});
for(const key of['bindingCount','sourceCount','explicitCount','groups','cases','manualCases','extraCases','tests','protectedCount','calendarProbes','calendarDays'])test('closed inventory enforced: '+key,async t=>{
  const f=await fixture(t);f.config[key]++;await assert.rejects(archiveAcceptance({...f,write:true}));
});
test('canton group distribution cannot hide behind an equal total',async t=>{const f=await fixture(t);f.config.groupsByCanton={FR:0,GE:1,JU:0};await assert.rejects(archiveAcceptance({...f,write:true}));});
test('manual outcome distribution is bound independently from overall totals',async t=>{const f=await fixture(t);f.config.manualCounts={dated:0,qualification:1,collision:0,window:0};await assert.rejects(archiveAcceptance({...f,write:true}));});
test('duplicate primary binding refused even when count is adjusted',async t=>{const f=await fixture(t,proof=>proof.bindings.push(proof.bindings[0]));await assert.rejects(archiveAcceptance({...f,write:true}));});
test('conflicting source digest is rejected after evidence JSON has been resealed',async t=>{const f=await fixture(t);await f.change(f.config.evidencePath,evidence=>{evidence.fileInventory[0].sha256='0'.repeat(64);});await assert.rejects(archiveAcceptance({...f,write:true}),/Conflicting descriptor/);});
test('conflicting source byte length is rejected after evidence JSON has been resealed',async t=>{const f=await fixture(t);await f.change(f.config.evidencePath,evidence=>{evidence.fileInventory[0].byteLength++;});await assert.rejects(archiveAcceptance({...f,write:true}));});
test('missing source cannot be concealed by successful inventory counts',async t=>{const f=await fixture(t);await f.change(f.config.evidencePath,evidence=>{evidence.fileInventory[0].path='proof/sources/not-bound.txt';});await assert.rejects(archiveAcceptance({...f,write:true}));});
test('a non-source path cannot masquerade as official evidence',async t=>{const f=await fixture(t);await f.change(f.config.evidencePath,evidence=>{evidence.fileInventory[0]=f.living;});await assert.rejects(archiveAcceptance({...f,write:true}));});
for(const key of['professionalAcceptance','sourceReleaseApproved','productDataChanged','operatingChanges'])test('evidence report cannot claim additional permission: '+key,async t=>{const f=await fixture(t);await f.change(f.config.evidencePath,evidence=>{evidence[key]=true;});await assert.rejects(archiveAcceptance({...f,write:true}));});

test('failing TAP cannot hide behind passing JSON test totals',async t=>{
  const f=await fixture(t),changed=await f.file(f.log.path,'# tests 2\n# pass 1\n# fail 1\n# cancelled 0\n# skipped 0\n# todo 0\n',false);
  await f.mutateProof(proof=>{proof.bindings=proof.bindings.map(item=>item.path===changed.path?changed:item);});
  await assert.rejects(archiveAcceptance({...f,write:true}));
});
test('research JSON test totals cannot relabel skipped checks as passing',async t=>{const f=await fixture(t,proof=>{proof.researchCheckerTests.skipped=1;});await assert.rejects(archiveAcceptance({...f,write:true}));});
test('research tests cannot be relabelled as product tests',async t=>{const f=await fixture(t,proof=>{proof.researchCheckerTests.productTests=true;});await assert.rejects(archiveAcceptance({...f,write:true}));});
test('reference results must contain the bound number of comparisons',async t=>{const f=await fixture(t);await f.change(f.config.referencePath,reference=>{reference.results=[];});await assert.rejects(archiveAcceptance({...f,write:true}));});
test('reference discrepancy cannot be dropped behind a passing status',async t=>{const f=await fixture(t);await f.change(f.config.referencePath,reference=>{reference.discrepancies=[{id:'unexpected'}];});await assert.rejects(archiveAcceptance({...f,write:true}));});
test('independent report must bind the exact Node report bytes',async t=>{const f=await fixture(t);await f.change(f.config.independentPath,reference=>{reference.nodeReportSha256='0'.repeat(64);});await assert.rejects(archiveAcceptance({...f,write:true}));});
test('independent report must bind the exact independent checker bytes',async t=>{const f=await fixture(t);await f.change(f.config.independentPath,reference=>{reference.checkerSha256='0'.repeat(64);});await assert.rejects(archiveAcceptance({...f,write:true}));});
test('calendar date equality cannot be replaced with end-eligibility equality alone',async t=>{const f=await fixture(t);await f.change(f.config.referencePath,reference=>{reference.calendarComparisons[0].namedHolidayDateSetsEqual=false;});await assert.rejects(archiveAcceptance({...f,write:true}));});
test('calendar end-eligibility differences cannot hide behind equal holiday dates',async t=>{const f=await fixture(t);await f.change(f.config.referencePath,reference=>{reference.calendarComparisons[0].endEligibilityDifferences=1;});await assert.rejects(archiveAcceptance({...f,write:true}));});
test('manual analyst cases cannot be silently relabelled as generated probes',async t=>{const f=await fixture(t);await f.change(f.config.fixturePath,fixture=>{fixture.cases[0].provenance='generated';});await assert.rejects(archiveAcceptance({...f,write:true}));});
test('fixture source model must remain a bound exact accepted model',async t=>{const f=await fixture(t);await f.change(f.config.fixturePath,fixture=>{fixture.sourceModels[0].sha256='0'.repeat(64);});await assert.rejects(archiveAcceptance({...f,write:true}));});

test('partial archive is neither completed nor silently replaced',async t=>{const f=await fixture(t);await mkdir(join(f.root,f.config.target),{recursive:true});await assert.rejects(archiveAcceptance({...f,write:true}),/Partial archive/);});
for(const kind of['payload','receipt','extra file','extra empty directory'])test('archive tampering refused: '+kind,async t=>{
  const f=await fixture(t);await archiveAcceptance({...f,write:true});
  if(kind==='payload')await f.file(f.config.target+'/'+f.source.path,'changed',false);
  else if(kind==='receipt')await f.file(f.config.target+'/receipt.json','{}',false);
  else if(kind==='extra file')await f.file(f.config.target+'/extra','extra',false);
  else await mkdir(join(f.root,f.config.target,'empty'));
  await assert.rejects(archiveAcceptance(f));
});
for(const kind of['file','directory','archive payload','archive root'])test('symlink refused: '+kind,async t=>{
  const f=await fixture(t);
  if(kind==='archive payload'){
    await archiveAcceptance({...f,write:true});await rm(join(f.root,f.config.target,f.source.path));
    await symlink(join(f.root,f.source.path),join(f.root,f.config.target,f.source.path));
  }else if(kind==='archive root'){
    await mkdir(join(f.root,'other-archive'));await mkdir(dirname(join(f.root,f.config.target)),{recursive:true});
    await symlink(join(f.root,'other-archive'),join(f.root,f.config.target));
  }else if(kind==='file'){
    await f.file('other','synthetic official source body',false);await rm(join(f.root,f.source.path));
    await symlink('../../other',join(f.root,f.source.path));
  }else{
    await f.file('other/official.txt','synthetic official source body',false);await rm(join(f.root,'proof/sources'),{recursive:true});
    await symlink('../other',join(f.root,'proof/sources'));
  }
  await assert.rejects(archiveAcceptance(f),/Symlink/);
});
test('unsafe relative paths are rejected before archive operations',()=>{
  for(const path of['../a','/a','a/../b','./a','a//b','a\\b','C:/a','','a\0b'])assert.throws(()=>safeRelative(path));
});
test('traversal in an original binding is rejected even after proof is resealed',async t=>{
  const f=await fixture(t,proof=>{proof.bindings[0]={...proof.bindings[0],path:'../outside'};});
  await assert.rejects(archiveAcceptance({...f,write:true}));
});
test('changed Git head is refused before archive creation',async t=>{
  const f=await fixture(t);f.config.requireGitHead=true;
  await assert.rejects(archiveAcceptance({...f,write:true,readHead:()=> '2'.repeat(40)}),/Git head changed/);
});
