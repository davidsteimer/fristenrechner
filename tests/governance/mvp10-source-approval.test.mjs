// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {loadApprovalInputs,makeSourceApproval,validateSourceApproval,readRegular,writeExclusive,resultPath} from '../../scripts/record-mvp10-source-approval.mjs';
const inputs=await loadApprovalInputs(),approval=makeSourceApproval(inputs);
test('A2 acceptance remains distinct from B execution and operating authority',()=>{
 assert.equal(approval.acceptedSourceIds.length,380);assert.equal(new Set(approval.acceptedSourceIds).size,380);assert.equal(approval.humanSourceApproval,true);assert.equal(approval.sourceReleaseApproved,false);assert.equal(approval.scope.administrativePaths,245);assert.equal(approval.scope.actualUses,5045);assert.equal(approval.scope.newUses,2909);assert.deepEqual(approval.scope.socialOperativeCantons,['BE']);assert.equal(approval.explicitBoundedReuse.nextOrdinarySourceReview,'2026-11-15');assert.equal(approval.explicitBoundedReuse.annualReviewCompleted,false);validateSourceApproval(approval,inputs);
});
for(const[name,mutate]of Object.entries({
 'invented publication':v=>{v.publicationApproved=true;},'invented source release':v=>{v.sourceReleaseApproved=true;},
 'invented data permission':v=>{v.permissions.localDataPromotionAuthorized=true;},'invented case':v=>{v.scope.additionalCasesApproved=true;},
 'expanded social canton':v=>{v.scope.socialOperativeCantons.push('ZH');},'lost KVG edition':v=>{v.explicitBoundedReuse.KVGmaterialEditionFindingRetained=false;},
 'invented current AI conflict':v=>{v.explicitBoundedReuse.AIcurrentConflictClaim=true;},'invented FR activation':v=>{v.explicitBoundedReuse.FRmirrorPositiveApproval=true;},
 'lost NE gate':v=>{v.explicitBoundedReuse.NEgatePreserved=false;},'premature annual completion':v=>{v.explicitBoundedReuse.annualReviewCompleted=true;},
 'changed evidence':v=>{v.evidence[0].sha256='0'.repeat(64);},'missing source':v=>{v.acceptedSourceIds.pop();}
}))test('reject '+name,()=>{const value=structuredClone(approval);mutate(value);assert.throws(()=>validateSourceApproval(value,inputs));});
test('makeSourceApproval rejects changed bytes and detached parsed objects',()=>{
 const changed={...inputs,files:new Map(inputs.files)};changed.files.set(resultPath,Buffer.from('changed'));assert.throws(()=>makeSourceApproval(changed));
 const detached={...inputs,receipt:structuredClone(inputs.receipt)};detached.receipt.userStatement+=' invented';assert.throws(()=>makeSourceApproval(detached));
 const evidence={...inputs,evidence:structuredClone(inputs.evidence)};evidence.evidence.pop();assert.throws(()=>makeSourceApproval(evidence));
});
test('exclusive file helper rejects traversal, symlinks, changed and empty existing outputs',async()=>{
 const temp=await mkdtemp(join(tmpdir(),'mvp10-source-approval-'));await writeExclusive(temp,'proof/a.txt',Buffer.from('synthetic'));await writeExclusive(temp,'proof/a.txt',Buffer.from('synthetic'));await assert.rejects(writeExclusive(temp,'proof/a.txt',Buffer.from('changed')));await writeExclusive(temp,'proof/empty.txt',Buffer.alloc(0));await assert.rejects(writeExclusive(temp,'proof/empty.txt',Buffer.from('changed')));
 await mkdir(join(temp,'real'));await symlink(join(temp,'real'),join(temp,'linked'));await assert.rejects(writeExclusive(temp,'linked/x.txt',Buffer.from('x')));
 for(const path of['../outside','/tmp/outside','a//b','a/./b','a:bad','a\\b'])await assert.rejects(readRegular(temp,path,true));
});
