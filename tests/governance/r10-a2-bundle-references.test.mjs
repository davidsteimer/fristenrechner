// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {isLogicalBundleReference,collectDescriptors,verifyDescriptors} from '../../scripts/r10-a2-review-contract.mjs';
import {findLogicalReferences,matchManifestReference,candidateBinding} from '../../scripts/r10-a2-bundle-references.mjs';
const ref=()=>({role:'calendar',contentId:'calendar-one',path:'calendars/calendar-one.json',sha256:'a'.repeat(64)});
const manifest=()=>({releaseId:candidateBinding.releaseId,artifacts:[{...ref(),byteLength:12}]});
const entry=()=>({reference:ref(),releaseId:candidateBinding.releaseId});
test('A strictly typed logical tuple is not a root-relative file descriptor',()=>{assert.equal(isLogicalBundleReference(ref()),true);assert.deepEqual(collectDescriptors(ref()),[]);assert.equal(matchManifestReference(entry(),manifest()).path,candidateBinding.root+'/calendars/calendar-one.json');});
test('Release context and the exact native JSON pointer survive traversal',()=>{const r=findLogicalReferences({physicalBaseline:{releaseId:candidateBinding.releaseId,references:[ref()]}});assert.equal(r.length,1);assert.equal(r[0].pointer,'/physicalBaseline/references/0');assert.equal(r[0].releaseId,candidateBinding.releaseId);});
for(const key of ['sha256','contentId','role'])test('A logical '+key+' mismatch is rejected',()=>{const e=entry();e.reference[key]=key==='sha256'?'b'.repeat(64):'other';assert.throws(()=>matchManifestReference(e,manifest()));});
test('A foreign release cannot borrow the current candidate manifest',()=>assert.throws(()=>matchManifestReference({...entry(),releaseId:'foreign'},manifest())));
test('An absent or duplicated manifest artifact is rejected',()=>{assert.throws(()=>matchManifestReference(entry(),{...manifest(),artifacts:[]}));const m=manifest();m.artifacts.push(m.artifacts[0]);assert.throws(()=>matchManifestReference(entry(),m));});
test('A normal missing-byte-length artifact descriptor is not silently skipped',async()=>{const d={path:'outputs/raw.json',sha256:'a'.repeat(64)};assert.equal(isLogicalBundleReference(d),false);assert.equal(collectDescriptors(d).length,1);await assert.rejects(verifyDescriptors('/not-read',[d]),/Missing evidence length/u);});
test('Unknown extra fields do not turn an incomplete artifact into a trusted logical tuple',()=>{const d={...ref(),unverified:true};assert.equal(isLogicalBundleReference(d),false);assert.equal(collectDescriptors(d).length,1);});
test('Traversal paths cannot masquerade as manifest tuples',()=>assert.equal(isLogicalBundleReference({...ref(),path:'calendars/../secret.json'}),false));
