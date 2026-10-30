// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveCrossPartCompanions,normalize,lotConfigs} from '../../scripts/finalize-r10-a2-lot.mjs';
const config=()=>({crossPartCompanions:[{requestingSourceIds:['cantonal'],companionSourceId:'federal',assessment:'Explicit current federal provisions are read and bound only for the qualified cantonal referral, not for every special procedure.'}]});
const reports=()=>[{rows:[{sourceId:'cantonal'}]},normalize({sourceRows:[{sourceId:'federal',method:'current provision reading',relevantProvisions:['Art. 145']} ]})];
const parts=[{path:'cantonal.json',sha256:'a'.repeat(64),byteLength:1},{path:'federal.json',sha256:'b'.repeat(64),byteLength:1}];
test('A concrete cross-part norm resolves to its native report pointer',()=>{const r=resolveCrossPartCompanions(config(),reports(),parts);assert.equal(r[0].companion.reviewBinding.pointer,'/sourceRows/0');assert.equal(r[0].humanApproval,false);assert.equal(r[0].sourceReleaseApproved,false);});
test('A missing companion cannot be closed by a similar source URL',()=>{const c=config();c.crossPartCompanions[0].companionSourceId='similar-but-unreviewed';assert.throws(()=>resolveCrossPartCompanions(c,reports(),parts));});
test('A missing requesting source cannot create a synthetic closure',()=>{const c=config();c.crossPartCompanions[0].requestingSourceIds=['unreviewed'];assert.throws(()=>resolveCrossPartCompanions(c,reports(),parts));});
test('A boolean is not a substantive cross-part assessment',()=>{const c=config();c.crossPartCompanions[0].assessment=true;assert.throws(()=>resolveCrossPartCompanions(c,reports(),parts));});
test('Existing lots without cross-part dependencies remain byte-stable',()=>assert.deepEqual(resolveCrossPartCompanions({},reports(),parts),[]));
test('Normalization leaves the original native report unchanged',()=>{const r={method:'shared complete current text',sourceRows:[{sourceId:'federal',actualStatements:{relevantProvisions:['Art. 145']}}]},before=structuredClone(r);normalize(r);assert.deepEqual(r,before);});
test('The SH coordination correction retains the original and binds the right paragraphs',()=>{const c=lotConfigs['R10-A2-AP23G1'];assert.equal(c.output,'lot-06-completion-r2.json');assert.equal(c.coordinationCorrection.supersedes.sha256,'a87c4508e9a2d13b5083dd808fe30eed95de2bda5500501ca9ec19e9c6f4db39');assert.match(c.coordinationCorrection.correctedFinding,/Art\. 50 Abs\. 1/u);assert.match(c.coordinationCorrection.correctedFinding,/Abs\. 2 übernimmt nur/u);assert.equal(c.coordinationCorrection.sourceReleaseApproved,false);});
