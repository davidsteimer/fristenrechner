// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import test from 'node:test';
import {buildClosure} from '../../scripts/close-r10-a2-baseline-judgment-norms.mjs';
const base='outputs/r10-a2-2026-10-28/baseline-judgments';
const closure=JSON.parse(await readFile(base+'/companion-norm-closure.json'));
const preliminary=JSON.parse(await readFile(base+'/review.json'));

test('ten bounded judgment dependencies are closed through 22 concrete norm IDs for 42 actual uses',()=>{
 assert.equal(closure.rows.length,10);assert.equal(closure.counts.actualReferenceLocations,42);assert.equal(closure.counts.requiredNormSources,22);assert.equal(closure.counts.pendingCompanionDependencies,0);
 assert.deepEqual(closure.rows.map(r=>r.sourceId).sort(),preliminary.rows.map(r=>r.sourceId).sort());
 for(const r of closure.rows){assert.equal(r.normCompanionStatus,'closed-for-the-exact-existing-uses');assert.deepEqual(r.normAssessments.map(n=>n.sourceId).sort(),r.requiredNormIds);assert.ok(r.normAssessments.every(n=>n.reviewedNormProvisions.length>0&&n.officialEvidence.length>0));}
});

test('the original pending record remains byte-identical and does not acquire human approval',async()=>{
 const b=await readFile(base+'/review.json');assert.equal(createHash('sha256').update(b).digest('hex'),'8e206fff7ea1510ece10e5608fa717852cf8eebaf2b6b363ace55f3880b9c7aa');
 assert.equal(preliminary.recordStatus,'content-reviewed-awaiting-current-companion-norm-closure');
 for(const r of closure.rows){assert.equal(r.historicalJudgmentReviewNotRewritten,true);assert.equal(r.humanApproval,false);assert.equal(r.sourceReleaseApproved,false);assert.equal(r.dataPromotionApproved,false);}
 for(const key of ['humanApproval','sourceReleaseApproved','dataPromotionApproved','productChanges','registerChanges','operatingChanges'])assert.equal(closure[key],false);
});

test('the material KVG edition finding is retained and not flattened to an unchanged law',()=>{
 const correction=closure.rows.find(r=>r.sourceId==='JUD-AP17C-BGER-8C-767-2008-20090112');const kvg=correction.normAssessments.find(n=>n.sourceId==='SRC-AP19C3-KVG-20260101');assert.equal(kvg.outcome,'used-assertions-confirmed-with-explicit-material-edition-finding');assert.match(kvg.contentFinding,/materiell/u);assert.match(kvg.contentFinding,/AS 2025 769/u);assert.match(correction.closureConclusion,/positiven Art\. 1, 80 und 85/u);assert.equal(kvg.actualJudgmentUseEffect,'existing-limited-assertion-confirmed');
});

test('the concrete companion closure fully reproduces with report and leaf hashes checked',async()=>assert.deepEqual(await buildClosure(),closure));
