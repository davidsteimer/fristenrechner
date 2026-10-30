// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {validateSourcePartition,verifyDescriptors} from '../../scripts/r10-a2-review-contract.mjs';
const inventory={rows:[{sourceId:'A',ownerLotId:'L1',referenceUse:'positive',referenceLocations:['doc#/a'],newReferenceLocations:[]},{sourceId:'B',ownerLotId:'L2',referenceUse:'exclusion',referenceLocations:['doc#/b'],newReferenceLocations:['doc#/b']}],reviewLots:[{id:'L1',sourceIds:['A']},{id:'L2',sourceIds:['B']}]};
const a={sourceId:'A',ownerLotId:'L1',referenceLocations:['doc#/a'],method:'fresh official targeted reading',relevantProvisions:['Art. 1 Abs. 1'],outcome:'unchanged',sourceEvidence:{path:'fixture-raw.json',sha256:'a'.repeat(64),byteLength:1},humanApproval:false,sourceReleaseApproved:false};
const b={...a,sourceId:'B',ownerLotId:'L2',referenceLocations:['doc#/b'],newReferenceLocations:['doc#/b'],newUseAssessment:'New exclusion use individually compared to the current provision.'};
const report=rows=>({checkedOn:'2026-10-28',humanApproval:false,sourceReleaseApproved:false,rows});
test('Partial review retains rather than hides pending IDs',()=>{const r=validateSourcePartition(inventory,[report([a])],{requiredLotIds:['L1']});assert.deepEqual(r.pendingSourceIds,['B']);assert.equal(r.referenceCount,1);});
test('Common review closes exactly the expected ID and use set',()=>{const r=validateSourcePartition(inventory,[report([a,b])],{complete:true});assert.equal(r.sourceCount,2);assert.equal(r.referenceCount,2);assert.equal(r.newReferenceCount,1);assert.deepEqual(r.pendingSourceIds,[]);});
test('Reject incomplete lot',()=>assert.throws(()=>validateSourcePartition(inventory,[report([a])],{requiredLotIds:['L2']})));
test('Reject incomplete full review',()=>assert.throws(()=>validateSourcePartition(inventory,[report([a])],{complete:true})));
test('Reject duplicate canonical source, even with equal physical URL',()=>assert.throws(()=>validateSourcePartition(inventory,[report([a,a])])));
test('Reject unknown canonical source',()=>assert.throws(()=>validateSourcePartition(inventory,[report([{...a,sourceId:'X'}])])));
test('Reject reassignment of an owner lot',()=>assert.throws(()=>validateSourcePartition(inventory,[report([{...a,ownerLotId:'L2'}])])));
test('Reject omitted concrete use',()=>assert.throws(()=>validateSourcePartition(inventory,[report([{...a,referenceLocations:[]}])])));
test('Reject invented additional concrete use',()=>assert.throws(()=>validateSourcePartition(inventory,[report([{...a,referenceLocations:['doc#/a','doc#/x']}])])));
test('Reject unassessed new uses',()=>assert.throws(()=>validateSourcePartition(inventory,[report([{...b,newUseAssessment:null}])])));
test('A method label alone cannot replace individually bound source evidence',()=>assert.throws(()=>validateSourcePartition(inventory,[report([{...a,sourceEvidence:undefined}])])));
test('Reject an omitted explicit new-use list',()=>assert.throws(()=>validateSourcePartition(inventory,[report([{...b,newReferenceLocations:undefined}])])));
test('Reject an incorrectly reused old-use list for a new source use',()=>assert.throws(()=>validateSourcePartition(inventory,[report([{...b,newReferenceLocations:[]}])])));
for(const key of ['humanApproval','sourceReleaseApproved']){test('Reject fabricated current row '+key,()=>assert.throws(()=>validateSourcePartition(inventory,[report([{...a,[key]:true}])])));test('Reject fabricated current report '+key,()=>assert.throws(()=>validateSourcePartition(inventory,[{...report([a]),[key]:true}])));}
for(const key of ['dataPromotionApproved','publicationApproved','operatingApproval','commitCreated','operatingChanges','completeCommonReview']){test('Reject optional row action '+key,()=>assert.throws(()=>validateSourcePartition(inventory,[report([{...a,[key]:true}])])));test('Reject optional report action '+key,()=>assert.throws(()=>validateSourcePartition(inventory,[{...report([a]),[key]:true}])));}
test('Reject relabelling an old review as the current decision',()=>assert.throws(()=>validateSourcePartition(inventory,[report([{...a,currentReviewOn:'2026-10-18'}])])));
test('Reject a future current-review date',()=>assert.throws(()=>validateSourcePartition(inventory,[report([{...a,checkedOn:'2026-11-15'}])])));
test('An old original date is allowed when the current decision has its own date',()=>{assert.equal(validateSourcePartition(inventory,[report([{...a,originalCheckedOn:'2026-10-18',currentReviewOn:'2026-10-28'}])]).sourceCount,1);});
for(const outcome of ['pending','not-reviewed','in-progress','awaiting-review'])test('An unfinished source outcome is rejected: '+outcome,()=>assert.throws(()=>validateSourcePartition(inventory,[report([{...a,outcome}])])));
test('A terminal uncertainty may remain, without positive activation',()=>assert.equal(validateSourcePartition(inventory,[report([{...a,outcome:'unclear'}])]).sourceCount,1));
test('A former companion dependency requires its concrete checked closure',()=>{const row={...a,outcome:'historical-assertion-confirmed-pending-companion-norm-closure'};assert.throws(()=>validateSourcePartition(inventory,[report([row])]));assert.equal(validateSourcePartition(inventory,[report([row])],{resolvedCompanionSourceIds:['A']}).sourceCount,1);});
test('Equal hashes do not hide conflicting byte lengths for the same path',async()=>{const first={path:'never-read.json',sha256:'a'.repeat(64),byteLength:5690};await assert.rejects(verifyDescriptors('/not-read',[first,{...first,byteLength:5691}]),/Conflicting evidence length/u);});
