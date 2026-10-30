// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import test from 'node:test';
import {buildReview} from '../../scripts/review-r10-a2-baseline-judgments.mjs';

const base='outputs/r10-a2-2026-10-28/baseline-judgments';
const review=JSON.parse(await readFile(base+'/review.json'));
const excerpts=JSON.parse(await readFile(base+'/pinpoint-readings.json'));
const inventory=JSON.parse(await readFile('outputs/r10-a1-2026-10-28/sources/source-inventory.json'));

test('judgment lane exactly partitions the ten baseline judgment IDs',()=>{
 assert.deepEqual(review.rows.map(r=>r.sourceId).sort(),inventory.rows.filter(r=>r.ownerLotId==='R10-A2-BASELINE'&&r.sourceId.startsWith('JUD')).map(r=>r.sourceId).sort());
 assert.equal(new Set(review.rows.map(r=>r.sourceId)).size,10);
 assert.equal(review.rows.reduce((n,r)=>n+r.actualUseAssessments.length,0),42);
 assert.equal(review.rows.flatMap(r=>r.actualUseAssessments).filter(r=>r.role==='exclusion').length,6);
});

test('fresh mirror reads are not counted as official originals or exclusive historical reuse',()=>{
 assert.equal(review.counts.freshMcpFullTextResponses,10);
 assert.equal(review.counts.freshOfficialPublicationResponses,0);
 assert.equal(review.counts.exclusivelyHistoricalReuseWithoutFreshReading,0);
 for(const r of review.rows){assert.equal(r.freshContentRead,true);assert.equal(r.exclusivelyReusedWithoutFreshRead,false);assert.match(r.sourceClassification,/nonofficial/u);assert.equal(r.originalAssessment.originalDatePreserved,true);assert.notEqual(r.originalAssessment.originalCheckedOn,r.currentReviewDate);}
});

test('all 42 uses are unchanged and each companion norm ID actually exists',()=>{
 for(const r of review.rows){const source=inventory.rows.find(s=>s.sourceId===r.sourceId);assert.deepEqual(r.referenceLocations,source.priorReferenceLocations);assert.equal(r.newUsesAssessment.newUses,0);assert.equal(r.newUsesAssessment.priorReferenceGraphUnchanged,true);for(const id of r.normCompanionAssessment.sourceIds)assert.ok(inventory.rows.some(s=>s.sourceId===id),id);}
});

test('contemporary statute companion checks are not falsely marked complete in the preliminary judgment review',()=>{
 assert.equal(review.recordStatus,'content-reviewed-awaiting-current-companion-norm-closure');
 for(const r of review.rows){assert.equal(r.normCompanionAssessment.status,'pending-separate-official-statute-review');assert.deepEqual(r.normCompanionAssessment.normReviewEvidence,[]);assert.equal(r.humanApproval,false);assert.equal(r.sourceReleaseApproved,false);assert.equal(r.dataPromotionApproved,false);}
 for(const flag of ['humanApproval','sourceReleaseApproved','dataPromotionApproved','productChanges','registerChanges','operatingChanges'])assert.equal(review[flag],false);
});

test('historical transition decisions are not used to displace current ATSG rules',()=>{
 for(const id of ['JUD-BGER-8C-620-2007','JUD-BGER-9C-757-2007']){const r=review.rows.find(s=>s.sourceId===id);assert.match(r.usedAssertions.join(' '),/2007|01\.01\.2008/u);assert.match(r.remainingBoundaries.join(' '),/historisch|Übergangsfall/u);assert.equal(r.referenceLocations.length,1);}
 const socialHelp=review.rows.find(r=>r.sourceId==='JUD-BE-VG-200-2026-421');assert.match(socialHelp.usageFinding,/Sozialhilfe/u);assert.match(socialHelp.usageFinding,/nicht als ATSG-Fall/u);
});

test('the BPR case citation and the current norm are kept distinct',()=>{
 const r=review.rows.find(s=>s.sourceId==='JUD-BGER-1C-275-2009');assert.match(r.usageFinding,/Art\. 77 Abs\. 1/u);assert.match(r.usageFinding,/Art\. 79 Abs\. 1/u);assert.equal(r.actualUseAssessments.length,2);
});

test('every freshly read pinpoint is byte-bound to a saved MCP full text',async()=>{
 assert.equal(excerpts.rows.length,10);
 for(const row of excerpts.rows){const b=await readFile(row.rawBinding.path);assert.equal(b.length,row.rawBinding.byteLength);assert.equal(createHash('sha256').update(b).digest('hex'),row.rawBinding.sha256);const raw=JSON.parse(b);const c=raw.result.structuredContent;const text=c.full_text??c.result?.text;for(const section of row.sections){assert.equal(text.slice(section.characterStart,section.characterEndExclusive).trim(),section.text);assert.ok(section.text.length>100);}}
});

test('full report and excerpt generation reproduces without writing old or new evidence',async()=>{
 const current=await buildReview();assert.deepEqual(current.review,review);assert.deepEqual(current.excerpts,excerpts);
});
