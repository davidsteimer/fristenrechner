// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic archive fixtures only. Real accepted research bytes are never edited.
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,rm,symlink,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {archiveAcceptance,archiveConfig,safeRelative,sha256} from '../../scripts/archive-ap23i1-acceptance.mjs';
const counts=n=>({tests:n,pass:n,fail:0,cancelled:0,skipped:0,todo:0});
async function fixture(t,alterProof=()=>{}){
  const root=await mkdtemp(join(tmpdir(),'ap23i1-acceptance-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const descriptors=[];
  async function file(path,value,bound=true){const bytes=Buffer.from(typeof value==='string'?value:JSON.stringify(value));await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),bytes);const row={path,byteLength:bytes.length,sha256:sha256(bytes)};if(bound)descriptors.push(row);return row;}
  const old=await file('old/protected.txt','original protected input',false),living=await file('docs/living.md','accepted living text');
  const source=await file('proof/sources/official.txt','original official source'),checker=await file('scripts/research.mjs','node checker'),py=await file('scripts/independent.py','independent checker');
  const model=await file('docs/model.json',{research:true}),head='1'.repeat(40);
  const guard=await file('proof/guard.json',{workPackage:'AP23I1',capturedBeforeResearch:true,capturedBeforeLivingUpdates:true,head,files:{[old.path]:old.sha256}});
  const preservationValue={status:'research-inputs-preserved',gitHead:head,protectedFilesVerified:1,protectedInputSha256:guard.sha256};
  for(const key of['productCodeChanged','acceptedLegalDataChanged','schemasChanged','existingTestsChanged','originalPreparationChanged','h3HistoricalEvidenceChanged','userDocumentChanged','commitCreated','sourcePushPerformed','operatingChanges'])preservationValue[key]=false;
  const preservation=await file('proof/preservation.json',preservationValue);
  const cardValue={noRemoteWritePerformed:true};for(const key of['liveReadPerformed','publicUpdatePerformed','sourcePublicationPerformed','professionalAcceptance','i2Started','i3Started'])cardValue[key]=false;
  const card=await file('proof/card.json',cardValue);
  const fixtureFile=await file('docs/fixture.json',{paths:[{id:'one'}],cases:[{id:'positive'}],sourceModels:[model],runtimeActive:false,productTest:false,legalApproval:false});
  const outcomes={datedResearchValue:1,unresolvedBoundaryProposed:0,qualificationBoundaryProposed:0,researchWindowBoundary:0};
  const reference=await file('proof/reference.json',{status:'passedResearchComparison',referenceCases:1,paths:1,counts:outcomes,results:[{id:'positive'}],discrepancies:[],calendarProbes:1,
    calendarComparisons:[{daysCompared:1}],fixtureSha256:fixtureFile.sha256,checkerSha256:checker.sha256,runtimeActive:false,exportTest:false,legalApproval:false});
  const independent=await file('proof/independent.json',{status:'passedIndependentResearchComparison',referenceComparisons:1,calendarEndEligibilityComparisons:1,calendarProbes:1,discrepancies:[],
    fixtureSha256:fixtureFile.sha256,nodeReportSha256:reference.sha256,checkerSha256:py.sha256,runtimeActive:false,exportTest:false,legalApproval:false});
  const evidence=await file('proof/evidence.json',{status:'research-source-bindings-verified',inventoriedEvidenceFiles:1,explicitEvidenceBindingsVerified:1,fileInventory:[source],officialCantonMetadataChecks:[{}],professionalAcceptance:false,sourceReleaseApproved:false,runtimeActive:false,operatingChanges:false});
  const log=await file('proof/tests.txt',Object.entries(counts(2)).map(([k,v])=>'# '+k+' '+v).join('\n')+'\n');
  const proof={workPackage:'AP23I1',status:'research-completed-awaiting-human-acceptance',scopeConfirmed:true,scopeConfirmedBy:'David Steimer',head,bindings:descriptors,
    researchGroups:1,groupsByCanton:{GL:1,TG:0},researchCases:1,counts:outcomes,independentReferenceComparisons:1,calendarProbes:1,calendarEndEligibilityComparisons:1,
    researchCheckerTests:{...counts(2),reference:1,governance:1,productTests:false},evidenceFiles:1,explicitEvidenceBindings:1,officialMetadataChecks:1,
    preservation:preservationValue,projectCardStatus:cardValue,aiReadOnlyCountercheck:{reviewedDocuments:[living],reportedBlockingFindings:0},diffWhitespaceCheckPassed:true};
  for(const key of['professionalAcceptance','sourceReleaseApproved','formatDecision','implementationStarted','runtimeActivation','productCodeChanged','schemasChanged','acceptedLegalDataChanged','existingTestsChanged','releaseBuildPerformed','commitCreated','sourcePushPerformed','operatingChanges'])proof[key]=false;
  alterProof(proof);const original=await file('proof/local-completion.json',proof,false);
  const config={...archiveConfig,target:'archive/i1',proofPath:original.path,proofSha256:original.sha256,bindingCount:descriptors.length,sourcePrefix:'proof/sources/',sourceCount:1,explicitCount:1,metadataCount:1,
    groups:1,groupsByCanton:{GL:1,TG:0},cases:1,calendarProbes:1,calendarDays:1,outcomeCounts:outcomes,tests:2,referenceTests:1,governanceTests:1,protectedCount:1,requireGitHead:false,
    guardPath:guard.path,preservationPath:preservation.path,referencePath:reference.path,independentPath:independent.path,evidencePath:evidence.path,testLog:log.path,cardPath:card.path,fixturePath:fixtureFile.path,checkerPath:checker.path,independentCheckerPath:py.path};
  async function change(path,fn){const value=JSON.parse(await readFile(join(root,path)));fn(value);const d=await file(path,value,false);const p=JSON.parse(await readFile(join(root,config.proofPath)));p.bindings=p.bindings.map(x=>x.path===path?d:x);const updated=await file(config.proofPath,p,false);config.proofSha256=updated.sha256;}
  return{root,config,file,change,source,old,living,guard,reference,evidence,log};
}
test('preflight is read-only, exact capture preserves old false flags and accepts I1 separately',async t=>{
  const f=await fixture(t),p=await archiveAcceptance(f);assert.equal(p.mode,'source-preflight-only');await assert.rejects(readFile(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});
  const r=await archiveAcceptance({...f,write:true});assert.equal(r.mode,'archive-created');assert.equal(r.sourceFiles,1);assert.equal(r.historicalProtectedInputsNotRecopied,1);
  const proof=JSON.parse(await readFile(join(f.root,f.config.target,f.config.proofPath))),receipt=JSON.parse(await readFile(join(f.root,f.config.target,'receipt.json')));
  assert.equal(proof.professionalAcceptance,false);assert.equal(receipt.professionalAcceptance,true);assert.equal(receipt.formatDecision,false);assert.equal(receipt.i2Started,true);
  assert.deepEqual(receipt.acceptedDecisionPoints,['I1-A','I1-B','I1-C','I1-D','I1-E','I1-F','I1-G']);
  await assert.rejects(readFile(join(f.root,f.config.target,f.old.path)),{code:'ENOENT'});
  await f.file(f.old.path,'later protected state',false);await f.file(f.living.path,'later living text',false);await f.file(f.source.path,'later source',false);
  const checked=await archiveAcceptance(f);assert.equal(checked.mode,'archive-reverified');assert.equal(checked.receiptSha256,r.receiptSha256);
});
for(const name of['source','old','living'])test('changed '+name+' halts before capture',async t=>{const f=await fixture(t);await f.file(f[name].path,'changed',false);await assert.rejects(archiveAcceptance({...f,write:true}),/Protected bytes changed/);await assert.rejects(readFile(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});});
test('missing source halts before capture',async t=>{const f=await fixture(t);await rm(join(f.root,f.source.path));await assert.rejects(archiveAcceptance({...f,write:true}),{code:'ENOENT'});});
for(const key of['professionalAcceptance','sourceReleaseApproved','formatDecision','implementationStarted','runtimeActivation','productCodeChanged','schemasChanged','acceptedLegalDataChanged','existingTestsChanged','releaseBuildPerformed','commitCreated','sourcePushPerformed','operatingChanges'])test('original false flag cannot be relabelled: '+key,async t=>{const f=await fixture(t,p=>p[key]=true);await assert.rejects(archiveAcceptance({...f,write:true}),/Historical boundary/);});
for(const key of['bindingCount','sourceCount','explicitCount','metadataCount','groups','cases','tests','referenceTests','governanceTests','protectedCount'])test('bound inventory enforced: '+key,async t=>{const f=await fixture(t);f.config[key]++;await assert.rejects(archiveAcceptance({...f,write:true}));});
test('duplicate original binding refused',async t=>{const f=await fixture(t,p=>p.bindings.push(p.bindings[0]));await assert.rejects(archiveAcceptance({...f,write:true}),/Duplicate primary binding/);});
test('source descriptor conflict refused',async t=>{const f=await fixture(t);await f.change(f.config.evidencePath,e=>e.fileInventory[0].sha256='0'.repeat(64));await assert.rejects(archiveAcceptance({...f,write:true}),/Conflicting descriptor/);});
test('unbound original source cannot disappear behind successful counts',async t=>{const f=await fixture(t);await f.change(f.config.evidencePath,e=>e.fileInventory[0].path='proof/sources/missing.txt');await assert.rejects(archiveAcceptance({...f,write:true}),/Source absent/);});
test('failed TAP cannot hide behind successful JSON counts',async t=>{const f=await fixture(t);const b=await f.file(f.log.path,'# tests 2\n# pass 1\n# fail 1\n# cancelled 0\n# skipped 0\n# todo 0\n',false);await f.change(f.config.proofPath,p=>p.bindings=p.bindings.map(x=>x.path===b.path?b:x));await assert.rejects(archiveAcceptance({...f,write:true}),/Not all tests passed/);});
test('historical project card does not acquire I2-start status',async t=>{const f=await fixture(t);await f.change(f.config.cardPath,c=>c.i2Started=true);await assert.rejects(archiveAcceptance({...f,write:true}));});
test('independent report must bind the exact Node report',async t=>{const f=await fixture(t);await f.change(f.config.independentPath,r=>r.nodeReportSha256='0'.repeat(64));await assert.rejects(archiveAcceptance({...f,write:true}));});
test('a partial archive is not repaired or replaced',async t=>{const f=await fixture(t);await mkdir(join(f.root,f.config.target),{recursive:true});await assert.rejects(archiveAcceptance({...f,write:true}),/Partial archive/);});
test('repeat write autonomously verifies instead of replacing',async t=>{const f=await fixture(t),a=await archiveAcceptance({...f,write:true}),b=await archiveAcceptance({...f,write:true});assert.equal(b.mode,'archive-reverified');assert.equal(a.receiptSha256,b.receiptSha256);});
for(const kind of['payload','receipt','extra file','extra empty directory'])test('archive tampering refused: '+kind,async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});if(kind==='payload')await f.file(f.config.target+'/'+f.source.path,'changed',false);else if(kind==='receipt')await f.file(f.config.target+'/receipt.json','{}',false);else if(kind==='extra file')await f.file(f.config.target+'/extra','extra',false);else await mkdir(join(f.root,f.config.target,'empty'));await assert.rejects(archiveAcceptance(f));});
for(const kind of['file','directory','archive'])test('symlink refused: '+kind,async t=>{const f=await fixture(t);if(kind==='archive'){await archiveAcceptance({...f,write:true});await rm(join(f.root,f.config.target,f.source.path));await symlink(join(f.root,f.source.path),join(f.root,f.config.target,f.source.path));}else if(kind==='file'){await f.file('other','original official source',false);await rm(join(f.root,f.source.path));await symlink('../../other',join(f.root,f.source.path));}else{await f.file('other/official.txt','original official source',false);await rm(join(f.root,'proof/sources'),{recursive:true});await symlink('../other',join(f.root,'proof/sources'));}await assert.rejects(archiveAcceptance(f),/Symlink/);});
test('unsafe relative paths are rejected',()=>{for(const path of['../a','/a','a/../b','./a','a//b','a\\b','C:/a','','a\0b'])assert.throws(()=>safeRelative(path));});
test('changed Git head is refused before capture',async t=>{const f=await fixture(t);f.config.requireGitHead=true;await assert.rejects(archiveAcceptance({...f,write:true,readHead:()=> '2'.repeat(40)}),/Git head changed/);});
