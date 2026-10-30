// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCommonCounts,commonConfig} from '../../scripts/finalize-r10-a2.mjs';
const counts=()=>({sourceCount:380,referenceCount:5045,newReferenceCount:2909,pendingSourceIds:[]});
const lots=()=>Array.from({length:12},(_,i)=>({number:i+1,id:'lot-'+(i+1),humanApproval:false,sourceReleaseApproved:false}));
test('The common closure requires all 380 sources, 5045 uses and 2909 new uses',()=>assert.equal(validateCommonCounts(counts(),lots()),true));
for(const key of ['sourceCount','referenceCount','newReferenceCount'])test('A partial '+key+' cannot close the common review',()=>{const r=counts();r[key]--;assert.throws(()=>validateCommonCounts(r,lots()));});
test('Pending sources are not hidden by matching totals',()=>{const r=counts();r.pendingSourceIds=['source'];assert.throws(()=>validateCommonCounts(r,lots()));});
test('Eleven closed lots are not twelve',()=>assert.throws(()=>validateCommonCounts(counts(),lots().slice(0,-1))));
test('An out-of-order lot is rejected',()=>{const l=lots();[l[0],l[1]]=[l[1],l[0]];assert.throws(()=>validateCommonCounts(counts(),l));});
test('A duplicated lot identity is rejected',()=>{const l=lots();l[1].id=l[0].id;assert.throws(()=>validateCommonCounts(counts(),l));});
for(const key of ['humanApproval','sourceReleaseApproved'])test('The evidence collector never fabricates '+key,()=>{const l=lots();l[0][key]=true;assert.throws(()=>validateCommonCounts(counts(),l));});
test('The common output is an A2 evidence artifact, not a release directory',()=>{assert.match(commonConfig.out,/^outputs\/r10-a2-2026-10-28\//u);assert.doesNotMatch(commonConfig.out,/data\//u);});
