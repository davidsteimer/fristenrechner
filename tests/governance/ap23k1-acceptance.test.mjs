// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic archive fixtures only. Never mutate accepted K1 inputs.
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {archiveAcceptance,archiveConfig,historicalFlags,safeRelative,sha256} from '../../scripts/archive-ap23k1-acceptance.mjs';
async function fixture(t,alter=()=>{}){
  const root=await mkdtemp(join(tmpdir(),'ap23k1-archive-test-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const descriptors=[];
  async function file(path,value,bound=true){const bytes=Buffer.from(typeof value==='string'?value:JSON.stringify(value));
    await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),bytes);
    const d={path,byteLength:bytes.length,sha256:sha256(bytes)};if(bound)descriptors.push(d);return d;}
  const old=await file('old/input','historical input',false),source=await file('proof/sources/official.txt','source body');
  const living=await file('docs/living.md','accepted status'),model=await file('docs/model.json',{scope:'BS'});
  const checker=await file('scripts/reference.mjs','node checker'),python=await file('scripts/independent.py','python checker');
  const note=await file('docs/check.md','countercheck'),head='1'.repeat(40);
  const guard=await file('proof/guard.json',{workPackage:'AP23K1',capturedBeforeResearch:true,capturedBeforeLivingUpdates:true,head,files:{[old.path]:old.sha256}});
  const preservationValue={status:'research-inputs-preserved',gitHead:head,protectedFilesVerified:1,protectedInputSha256:guard.sha256,
    ...Object.fromEntries(['productCodeChanged','acceptedLegalDataChanged','schemasChanged','existingTestsChanged','originalPreparationChanged',
      'j3HistoricalEvidenceChanged','userDocumentChanged','commitCreated','sourcePushPerformed','operatingChanges'].map(k=>[k,false]))};
  const preservation=await file('proof/preservation.json',preservationValue);
  const calendar=await file('data/cal.json',{rules:[]},false);
  const suite=await file('docs/fixture.json',{paths:[{id:'BS-one'}],cases:[{id:'one',provenance:'canton-analyst-static-reference'}],
    sourceModels:[model],calendarBaselines:[calendar],runtimeActive:false,productTest:false,exportTest:false,legalApproval:false});
  const outcomes={datedResearchValue:1,qualificationBoundaryProposed:0,unresolvedBoundaryProposed:0,researchWindowBoundary:0};
  const reference=await file('proof/reference.json',{status:'passedResearchComparison',paths:1,referenceCases:1,handSpecifiedReferences:1,
    results:[{id:'one'}],counts:outcomes,discrepancies:[],calendarProbes:1,calendarComparisons:[{daysCompared:1,weekdayDateSetsEqual:true,officeClosuresExcluded:true}],
    fixtureSha256:suite.sha256,checkerSha256:checker.sha256,runtimeActive:false,exportTest:false,legalApproval:false});
  const independent=await file('proof/independent.json',{status:'passedIndependentResearchComparison',referenceComparisons:1,
    calendarEndEligibilityComparisons:1,calendarProbes:1,discrepancies:[],fixtureSha256:suite.sha256,nodeReportSha256:reference.sha256,
    checkerSha256:python.sha256,runtimeActive:false,exportTest:false,legalApproval:false});
  const evidence=await file('proof/evidence.json',{status:'captured-source-bytes-verified',inventoriedEvidenceFiles:1,explicitSourceBindings:1,
    fileInventory:[source],professionalAcceptance:false,sourceReleaseApproved:false,productDataChanged:false,operatingChanges:false});
  const tests={tests:2,pass:2,fail:0,cancelled:0,skipped:0,todo:0};
  const log=await file('proof/tests.txt',Object.entries(tests).map(([k,v])=>'# '+k+' '+v).join('\n')+'\n');
  const proof={workPackage:'AP23K1',status:'research-completed-awaiting-human-acceptance',scopeConfirmed:true,scopeConfirmedBy:'David Steimer',head,
    bindings:descriptors,researchGroups:1,groupsByCanton:{BS:1,BL:0},manualLegalReferences:1,independentImplementationComparisons:1,
    researchResultCounts:outcomes,calendarProbes:1,calendarEndEligibilityComparisons:1,researchCheckerTests:{...tests,productTests:false},
    evidenceFiles:1,explicitEvidenceBindings:1,preservation:preservationValue,readOnlyCountercheckNote:note.path,diffWhitespaceCheckPassed:true,
    ...Object.fromEntries(historicalFlags.map(k=>[k,false]))};alter(proof);
  const original=await file('proof/local-completion.json',proof,false);
  const config={...archiveConfig,target:'archive/k1',proofPath:original.path,proofSha256:original.sha256,bindingCount:descriptors.length,
    sourcePrefix:'proof/sources/',sourceCount:1,explicitCount:1,groups:1,groupsByCanton:{BS:1,BL:0},cases:1,outcomeCounts:outcomes,
    tests:2,protectedCount:1,calendarProbes:1,calendarDays:1,calendarBaselines:1,requireGitHead:false,
    guardPath:guard.path,preservationPath:preservation.path,referencePath:reference.path,independentPath:independent.path,
    evidencePath:evidence.path,testLog:log.path,fixturePath:suite.path,checkerPath:checker.path,independentCheckerPath:python.path};
  return{root,config,file,old,source,living,calendar};
}
test('separate acceptance preserves historical flags and copies only closed transitive baselines',async t=>{
  const f=await fixture(t),a=await archiveAcceptance({...f,write:true});assert.equal(a.files,f.config.bindingCount+2);
  assert.equal(a.explicitTransitiveCalendarPayloads,1);const receipt=JSON.parse(await readFile(join(f.root,f.config.target,'receipt.json')));
  assert.equal(receipt.professionalAcceptance,true);assert.equal(receipt.k2Started,true);assert.equal(receipt.formatDecision,false);
  const original=JSON.parse(await readFile(join(f.root,f.config.target,f.config.proofPath)));for(const k of historicalFlags)assert.equal(original[k],false);
  await assert.rejects(readFile(join(f.root,f.config.target,f.old.path)),{code:'ENOENT'});
});
test('archive autonomously verifies after originals and old guard inputs disappear',async t=>{
  const f=await fixture(t),a=await archiveAcceptance({...f,write:true});for(const d of ['docs','scripts','proof','data','old'])await rm(join(f.root,d),{recursive:true});
  const b=await archiveAcceptance(f);assert.equal(b.mode,'archive-reverified');assert.equal(a.receiptSha256,b.receiptSha256);
});
test('repeat write cannot replace an accepted snapshot',async t=>{const f=await fixture(t);const a=await archiveAcceptance({...f,write:true}),b=await archiveAcceptance({...f,write:true});assert.equal(b.mode,'archive-reverified');assert.equal(a.receiptSha256,b.receiptSha256);});
for(const name of ['old','source','living','calendar'])test('changed '+name+' fails before archive',async t=>{const f=await fixture(t);await f.file(f[name].path,'changed',false);await assert.rejects(archiveAcceptance({...f,write:true}));});
for(const flag of historicalFlags)test('historical authority cannot be rewritten: '+flag,async t=>{const f=await fixture(t,p=>p[flag]=true);await assert.rejects(archiveAcceptance({...f,write:true}),/Historical boundary/);});
for(const key of ['bindingCount','sourceCount','explicitCount','groups','cases','tests','protectedCount','calendarProbes','calendarDays','calendarBaselines'])test('closed inventory: '+key,async t=>{const f=await fixture(t);f.config[key]++;await assert.rejects(archiveAcceptance({...f,write:true}));});
for(const kind of ['payload','receipt','extra file','extra directory'])test('archive mutation fails: '+kind,async t=>{
  const f=await fixture(t);await archiveAcceptance({...f,write:true});
  if(kind==='payload')await f.file(f.config.target+'/'+f.calendar.path,'changed',false);
  if(kind==='receipt')await f.file(f.config.target+'/receipt.json','{}',false);
  if(kind==='extra file')await f.file(f.config.target+'/extra','extra',false);
  if(kind==='extra directory')await mkdir(join(f.root,f.config.target,'extra'));
  await assert.rejects(archiveAcceptance(f));
});
test('partial archive is not silently overwritten',async t=>{const f=await fixture(t);await mkdir(join(f.root,f.config.target),{recursive:true});await assert.rejects(archiveAcceptance({...f,write:true}),/Partial archive/);});
test('safe relative paths remain mandatory',()=>{for(const path of ['../x','/x','x/../y','./x','x//y','x\\y','C:/x','','x\0y'])assert.throws(()=>safeRelative(path));});
