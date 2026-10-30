// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,rm,symlink,writeFile,lstat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {archiveAcceptance,safeRelative,sha256} from '../../scripts/archive-ap23h1-acceptance.mjs';

async function fixture(t,{modifyProof=()=>{},modifyEvidence=()=>{},modifyReference=()=>{},modifyIndependent=()=>{}}={}){
  const root=await mkdtemp(join(tmpdir(),'ap23h1-archive-test-'));t.after(()=>rm(root,{recursive:true,force:true}));
  async function file(path,value){const bytes=Buffer.from(typeof value==='string'?value:JSON.stringify(value));
    await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),bytes);return{path,byteLength:bytes.length,sha256:sha256(bytes)};}
  const source=await file('docs/entry.md','original living entry');
  const original=await file('proof/sources/law.pdf','synthetic public legal source');
  const protectedSource=await file('product/unchanged.ts','old product source');
  const upstreamSource=await file('prior/archive/candidate.json','old accepted candidate');
  const upstream=await file('prior/archive/receipt.json',{artifacts:[{...upstreamSource,path:'candidate.json'}]});
  const guard=await file('proof/protected.json',{files:{[protectedSource.path]:protectedSource.sha256}});
  const preservationObject={status:'research-inputs-preserved',protectedFilesVerified:1};
  const preservation=await file('proof/preservation.json',preservationObject);
  const referenceObject={workPackage:'AP23H1',status:'passedResearchComparison',legalApproval:false,runtimeActive:false,discrepancies:[],paths:1,referenceCases:1};
  modifyReference(referenceObject);const reference=await file('proof/reference.json',referenceObject);
  const independentObject={workPackage:'AP23H1',status:'passedIndependentResearchComparison',legalApproval:false,runtimeActive:false,discrepancies:[],referenceComparisons:1};
  modifyIndependent(independentObject);const independent=await file('proof/independent.json',independentObject);
  const evidenceObject={status:'research-source-bindings-verified',inventoriedEvidenceFiles:1,fileInventory:[original],
    legalInterpretationAutomaticallyValidated:false,professionalAcceptance:false,runtimeActive:false,operatingChanges:false};
  modifyEvidence(evidenceObject);const evidence=await file('proof/evidence.json',evidenceObject);
  const proofObject={workPackage:'AP23H1',status:'research-completed-awaiting-human-acceptance',scopeConfirmed:true,scopeConfirmedBy:'David Steimer',
    researchGroups:1,researchCases:1,professionalAcceptance:false,formatDecision:false,implementationStarted:false,runtimeActivation:false,
    productCodeChanged:false,schemasChanged:false,acceptedLegalDataChanged:false,existingTestsChanged:false,releaseBuildPerformed:false,
    commitCreated:false,sourcePushPerformed:false,operatingChanges:false,preservation:preservationObject,
    bindings:[source,original,guard,preservation,reference,independent,evidence]};
  modifyProof(proofObject);const proof=await file('proof/completion.json',proofObject);
  return{root,file,source,original,guard,preservation,reference,independent,evidence,proof,protectedSource,upstreamSource,upstream,
    config:{target:'archive/accepted',proofPath:proof.path,proofSha256:proof.sha256,bindingCount:proofObject.bindings.length,
      sourceCount:1,groups:1,cases:1,evidencePath:evidence.path,referencePath:reference.path,independentPath:independent.path,
      preservationPath:preservation.path,sourcePrefix:'proof/sources/',protected:{...guard,count:1},upstream:{...upstream,payloads:1},
      acceptance:{kind:'acceptedAP23H1Snapshot',professionalAcceptance:true,accepted:true,technicalContractApproved:false,
        runtimeActive:false,sourceReleaseApproved:false,acceptedDecisionPoints:['H1-A','H1-B','H1-C','H1-D','H1-E','H1-F']}}};
}
test('focused archive is autonomous, does not rewrite original status, and does not recursively copy old sources',async t=>{
  const f=await fixture(t),pre=await archiveAcceptance(f);assert.equal(pre.mode,'source-preflight-only');
  await assert.rejects(lstat(join(f.root,f.config.target)),{code:'ENOENT'});
  const created=await archiveAcceptance({...f,write:true});assert.equal(created.mode,'archive-created');assert.equal(created.files,8);
  assert.equal(created.protectedInputsNotRecopied,1);assert.equal(created.upstreamPayloadsNotRecopied,1);
  const receipt=JSON.parse(await readFile(join(f.root,f.config.target,'receipt.json')));assert.equal(receipt.professionalAcceptance,true);
  const oldProof=JSON.parse(await readFile(join(f.root,f.config.target,f.proof.path)));assert.equal(oldProof.professionalAcceptance,false);
  await assert.rejects(lstat(join(f.root,f.config.target,f.protectedSource.path)),{code:'ENOENT'});
  await writeFile(join(f.root,f.source.path),'changed living entry');await writeFile(join(f.root,f.original.path),'later source');
  await writeFile(join(f.root,f.protectedSource.path),'later implementation');await rm(join(f.root,f.upstream.path));
  const verified=await archiveAcceptance(f);assert.equal(verified.mode,'archive-reverified');assert.equal(verified.receiptSha256,created.receiptSha256);
});
for(const key of['source','original','guard','preservation','reference','independent','evidence','proof','protectedSource','upstreamSource','upstream']){
  test('reject changed '+key+' before any archive is created',async t=>{const f=await fixture(t);await writeFile(join(f.root,f[key].path),'changed');
    await assert.rejects(archiveAcceptance({...f,write:true}),/SHA-256 mismatch/);await assert.rejects(lstat(join(f.root,f.config.target)),{code:'ENOENT'});});
}
test('reject missing bound source before writing',async t=>{const f=await fixture(t);await rm(join(f.root,f.original.path));
  await assert.rejects(archiveAcceptance({...f,write:true}),{code:'ENOENT'});await assert.rejects(lstat(join(f.root,f.config.target)),{code:'ENOENT'});});
test('reject duplicate research descriptor even when identical',async t=>{const f=await fixture(t,{modifyProof:p=>p.bindings.push(p.bindings[0])});
  await assert.rejects(archiveAcceptance({...f,write:true}),/Duplicate research bindings/);});
test('reject duplicate source inventory',async t=>{const f=await fixture(t,{modifyEvidence:e=>{e.fileInventory.push(e.fileInventory[0]);e.inventoriedEvidenceFiles=2;}});
  f.config.sourceCount=2;await assert.rejects(archiveAcceptance({...f,write:true}),/Duplicate source inventory/);});
test('reject source outside scoped evidence folder',async t=>{const f=await fixture(t,{modifyEvidence:e=>e.fileInventory[0].path='private/unrelated.pdf'});
  await assert.rejects(archiveAcceptance({...f,write:true}),/Source outside scoped inventory/);});
test('reject source absent from completion bindings',async t=>{const f=await fixture(t,{modifyProof:p=>p.bindings=p.bindings.filter(d=>!d.path.endsWith('law.pdf'))});
  await assert.rejects(archiveAcceptance({...f,write:true}),/Source not already in proof bindings/);});
test('reject an unbound report',async t=>{const f=await fixture(t);f.config.referencePath='unbound.json';
  await assert.rejects(archiveAcceptance({...f,write:true}),/Report is not bound/);});
test('reject mismatched preservation object',async t=>{const f=await fixture(t,{modifyProof:p=>p.preservation={...p.preservation,extra:true}});
  await assert.rejects(archiveAcceptance({...f,write:true}),/Preservation proof differs/);});
test('reject source byte length mismatch with matching hash',async t=>{const f=await fixture(t,{modifyProof:p=>p.bindings[0].byteLength++});
  await assert.rejects(archiveAcceptance({...f,write:true}),/Byte length mismatch/);});
for(const [key,value]of[['workPackage','AP23H2'],['status','accepted'],['scopeConfirmed',false],['scopeConfirmedBy','other'],
  ['professionalAcceptance',true],['formatDecision',true],['implementationStarted',true],['runtimeActivation',true],
  ['productCodeChanged',true],['schemasChanged',true],['acceptedLegalDataChanged',true],['existingTestsChanged',true],
  ['releaseBuildPerformed',true],['commitCreated',true],['sourcePushPerformed',true],['operatingChanges',true]]){
  test('preserve original boundary '+key,async t=>{const f=await fixture(t,{modifyProof:p=>p[key]=value});await assert.rejects(archiveAcceptance({...f,write:true}));});
}
test('reject reference discrepancy',async t=>{const f=await fixture(t,{modifyReference:r=>r.discrepancies.push('bad')});await assert.rejects(archiveAcceptance({...f,write:true}));});
test('reject independent approval claim',async t=>{const f=await fixture(t,{modifyIndependent:r=>r.legalApproval=true});await assert.rejects(archiveAcceptance({...f,write:true}));});
test('reject changed evidence approval boundary',async t=>{const f=await fixture(t,{modifyEvidence:e=>e.professionalAcceptance=true});await assert.rejects(archiveAcceptance({...f,write:true}));});
test('reject path escapes and ambiguous separators',()=>{for(const p of['../a','/a','a/../b','./a','a//b','a\\b','C:/a','','a\0b'])assert.throws(()=>safeRelative(p));assert.equal(safeRelative('docs/file.md'),'docs/file.md');});
for(const kind of['file','directory'])test('reject '+kind+' symlink',async t=>{const f=await fixture(t);await f.file('other/file.md','original living entry');
  if(kind==='file'){await rm(join(f.root,f.source.path));await symlink('../other/file.md',join(f.root,f.source.path));}
  else{await rm(join(f.root,'docs'),{recursive:true});await symlink('other',join(f.root,'docs'));}
  await assert.rejects(archiveAcceptance({...f,write:true}),/Symlink not allowed/);});
test('partial target halts without repair',async t=>{const f=await fixture(t);await mkdir(join(f.root,f.config.target),{recursive:true});
  await assert.rejects(archiveAcceptance({...f,write:true}),/Partial archive/);await assert.rejects(lstat(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});});
test('reject payload tampering without replacing bytes',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});
  const p=join(f.root,f.config.target,f.source.path);await writeFile(p,'tampered');await assert.rejects(archiveAcceptance({...f,write:true}),/SHA-256 mismatch/);assert.equal((await readFile(p)).toString(),'tampered');});
test('reject extra archive file',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await f.file(f.config.target+'/extra.txt','not accepted');await assert.rejects(archiveAcceptance(f),/Unexpected archive files/);});
test('reject receipt tampering',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await writeFile(join(f.root,f.config.target,'receipt.json'),'{}');await assert.rejects(archiveAcceptance(f),/exact derived acceptance record/);});
test('reject archive symlink',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});const p=join(f.root,f.config.target,f.source.path);await rm(p);await symlink(join(f.root,f.source.path),p);await assert.rejects(archiveAcceptance(f),/Symlink not allowed/);});
test('repeat write only verifies complete archive',async t=>{const f=await fixture(t),a=await archiveAcceptance({...f,write:true}),b=await archiveAcceptance({...f,write:true});assert.equal(b.mode,'archive-reverified');assert.equal(a.receiptSha256,b.receiptSha256);});
