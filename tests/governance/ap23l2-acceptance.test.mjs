// SPDX-License-Identifier: AGPL-3.0-only
// Separate human acceptance. Existing L2 evidence is never relabelled.
import assert from 'node:assert/strict';
import test from 'node:test';
import {cp,mkdtemp,readFile,rm,writeFile,mkdir,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance,archiveConfig,sha256} from '../../scripts/archive-ap23l2-acceptance.mjs';
import {completionFlags} from '../../scripts/finalize-ap23l2.mjs';
const workspace=fileURLToPath(new URL('../../',import.meta.url));
async function fixture(t){const root=await mkdtemp(join(tmpdir(),'ap23l2-acceptance-'));t.after(()=>rm(root,{recursive:true,force:true}));
 await cp(resolve(workspace,archiveConfig.target),resolve(root,archiveConfig.target),{recursive:true});
 const config={...archiveConfig,requireGitHead:false};return{root,config,target:resolve(root,config.target),
  async changeProof(change){const path=resolve(root,config.target,config.proofPath),value=JSON.parse(await readFile(path));change(value);const bytes=Buffer.from(JSON.stringify(value,null,2)+'\n');await writeFile(path,bytes);config.proofSha256=sha256(bytes);},
  async change(path){await writeFile(resolve(root,config.target,path),'changed');}};}
test('actual L2 acceptance preserves exactly 136 bindings plus original proof',async()=>{const result=await archiveAcceptance({root:workspace});assert.equal(result.mode,'archive-reverified');assert.equal(result.files,137);assert.equal(result.receiptSha256,'0f6a9be9fcebc2e1a16531c8e06299683d7bfe9172a3ca5f6808266383717afa');});
test('the receipt records human acceptance without editing historical flags',async()=>{const receipt=JSON.parse(await readFile(resolve(workspace,archiveConfig.target,'receipt.json'))),proof=JSON.parse(await readFile(resolve(workspace,archiveConfig.target,archiveConfig.proofPath)));
 assert.equal(receipt.technicalL2Acceptance,true);assert.equal(receipt.l3Commissioned,true);assert.equal(receipt.l3Started,true);assert.equal(receipt.professionalL3Acceptance,false);
 assert.deepEqual(receipt.contractDecision,{id:'DEC-2026-041',status:'approved',on:'2026-10-27'});assert.equal(receipt.userStatement,archiveConfig.acceptance.userStatement);
 assert.equal(proof.technicalL2Acceptance,false);for(const flag of completionFlags)assert.equal(proof[flag],false);
 for(const flag of['sourceReleaseApproved','deployable','deployed','sourcePublished','operatingChanges','commitCreated','sourcePushPerformed'])assert.equal(receipt[flag],false);
});
test('autonomous recheck needs no original workspace files or Git head',async t=>{const f=await fixture(t),r=await archiveAcceptance({...f,readHead:()=>{throw Error('Original HEAD must not be consulted');}});assert.equal(r.mode,'archive-reverified');assert.equal(r.files,137);});
for(const flag of completionFlags)test('archived original permission remains false: '+flag,async t=>{const f=await fixture(t);await f.changeProof(p=>{p[flag]=true;});await assert.rejects(archiveAcceptance(f));});
for(const[key,value]of[['workPackage','AP23L3'],['status','approved'],['technicalL2Acceptance',true],['professionalL1Acceptance',false],['governanceTests',399],['consumerReferenceCases',82],['oldNativeReferenceCalculations',164],['nativeReaderNegatives',11],['newNativeAISZCalculations',31]])test('original L2 metadata cannot be rewritten: '+key,async t=>{const f=await fixture(t);await f.changeProof(p=>{p[key]=value;});await assert.rejects(archiveAcceptance(f));});
test('receipt cannot promote an operating release',async t=>{const f=await fixture(t),path=join(f.target,'receipt.json'),v=JSON.parse(await readFile(path));v.sourceReleaseApproved=true;await writeFile(path,JSON.stringify(v));await assert.rejects(archiveAcceptance(f),/Receipt changed/);});
test('a candidate artifact byte change is rejected',async t=>{const f=await fixture(t);await f.change('outputs/ap23l2-candidate-2026-10-27/bundle/administrative-procedures/ch-cantonal-administrative-procedures.json');await assert.rejects(archiveAcceptance(f),/bytes changed/i);});
test('missing archive payload is rejected',async t=>{const f=await fixture(t);await rm(join(f.target,'docs/architektur/verwaltungsverfahrensvertrag-ap23l2.md'));await assert.rejects(archiveAcceptance(f),{code:'ENOENT'});});
test('extra archive file is rejected',async t=>{const f=await fixture(t);await writeFile(join(f.target,'unexpected.txt'),'extra');await assert.rejects(archiveAcceptance(f),/Unexpected archive files/);});
test('extra empty archive directory is rejected',async t=>{const f=await fixture(t);await mkdir(join(f.target,'unexpected'));await assert.rejects(archiveAcceptance(f),/Unexpected archive directories/);});
test('archive symlink is rejected',async t=>{const f=await fixture(t);await symlink('receipt.json',join(f.target,'unexpected-link'));await assert.rejects(archiveAcceptance(f),/Symlink/);});
test('a partial archive is not resumed or overwritten',async t=>{const f=await fixture(t);await rm(join(f.target,'receipt.json'));await assert.rejects(archiveAcceptance({...f,write:true}),/Partial archive/);});
test('write mode only revalidates an existing complete archive',async t=>{const f=await fixture(t),before=await readFile(join(f.target,'receipt.json'));const r=await archiveAcceptance({...f,write:true});assert.equal(r.mode,'archive-reverified');assert.deepEqual(await readFile(join(f.target,'receipt.json')),before);});
