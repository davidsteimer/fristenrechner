// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import test from 'node:test';
import {extract} from './extract-r10-a2-activation-judgments.mjs';
import {buildReview} from './review-r10-a2-activation-judgments.mjs';
import {buildClosure} from './close-r10-a2-activation-judgment-norms.mjs';
const base='outputs/r10-a2-2026-10-28/activation-judgments';
const review=JSON.parse(await readFile(base+'/review.json'));
const pinpoints=JSON.parse(await readFile(base+'/pinpoint-readings.json'));
const closure=JSON.parse(await readFile(base+'/companion-norm-closure.json'));
const inv=JSON.parse(await readFile('outputs/r10-a1-2026-10-28/sources/source-inventory.json'));

test('all 27 canonical activation judgment IDs are represented exactly once',()=>{
 const expected=inv.rows.filter(r=>r.ownerLotId==='R10-A2-CALENDAR-ACTIVATION'&&r.kind==='caseLaw').map(r=>r.sourceId).sort();
 assert.deepEqual(review.rows.map(r=>r.sourceId).sort(),expected);assert.equal(new Set(review.rows.map(r=>r.sourceId)).size,27);assert.deepEqual(closure.rows.map(r=>r.sourceId).sort(),expected);
});
test('47 actual references are unchanged and 16 supplementary IDs stay unreferenced',()=>{
 assert.equal(review.rows.reduce((n,r)=>n+r.referenceLocations.length,0),47);assert.equal(review.rows.filter(r=>r.referenceLocations.length===0).length,16);
 for(const r of review.rows){const old=inv.rows.find(s=>s.sourceId===r.sourceId);assert.deepEqual(r.referenceLocations,old.priorReferenceLocations);assert.equal(r.newUsesAssessment.count,0);assert.equal(r.actualUseAssessments.length,r.referenceLocations.length);}
});
test('18 physical case families have bibliographic content checks, not URL-only identity',()=>{
 assert.equal(pinpoints.families.length,18);for(const f of pinpoints.families){assert.equal(f.identityConfirmedFromBoundContent,true);assert.equal(f.identityNotInferredFromUrlEquality,true);assert.ok(f.identityMarkers.length>=2);assert.ok(f.sections.length>0);assert.ok(f.sections.every(s=>s.text.length>100));}
});
test('historical reuses do not become fresh online downloads or newly dated interpretation',()=>{
 assert.equal(review.counts.individuallyJustifiedHistoricalReuses,27);assert.equal(review.counts.newOnlineRetrievals,0);
 for(const r of review.rows){assert.equal(r.freshOnlineRetrievals,0);assert.deepEqual(r.freshEvidence,[]);assert.equal(r.boundedReuse.justified,true);assert.equal(r.boundedReuse.originalCheckedOn,r.originalAssessment.originalCheckedOn);assert.equal(r.originalAssessment.originalDatePreserved,true);assert.notEqual(r.currentReviewDate,r.boundedReuse.originalCheckedOn);assert.match(r.bibliographicIdentity.originalRetrievalAt,/^2026-10-08T/u);}
});
test('the FR practice mirror remains unclear, supplementary and without positive activation',()=>{
 const r=review.rows.find(r=>r.sourceId==='SRC-AP22-FR-PRAXIS'),c=closure.rows.find(r=>r.sourceId==='SRC-AP22-FR-PRAXIS');
 assert.equal(r.outcome,'unclear');assert.equal(r.referenceLocations.length,0);assert.equal(r.positiveCaseApproval,false);assert.equal(r.bibliographicIdentity.nonofficialMirror,true);assert.equal(r.bibliographicIdentity.officialOriginalIdentityStillUnclear,true);assert.match(r.usedAssertions[0],/mardi 9 avril 2012/u);assert.equal(c.finalBoundedOutcome,'unclear');assert.equal(c.newPositiveCaseApproval,false);assert.match(c.closureConclusion,/authentifiziert.*nicht/u);
});
test('4A538 is only a corrected historical counterexample and 2E8 is actually bound',()=>{
 const r=review.rows.find(r=>r.sourceId==='SRC-AP22-4A538');assert.equal(r.referenceLocations.length,1);assert.equal(r.actualUseAssessments[0].statementRole,'historical-corrected-counterexample-not-positive-calculation-authority');assert.deepEqual(r.courtCompanionSourceIds,['SRC-AP22CLOSE-BGER-2E8']);const c=closure.rows.find(s=>s.sourceId===r.sourceId);assert.equal(c.courtCompanionAssessments[0].sourceId,'SRC-AP22CLOSE-BGER-2E8');assert.match(r.usedAssertions[0],/fehlerhaft/u);
});
test('the 17 BGG transfer uses are explicitly inference or retained uncertainty',()=>{
 const r=review.rows.find(r=>r.sourceId==='SRC-AP22CLOSE-PROC-BGG-TRANSFER');assert.equal(r.actualUseAssessments.length,17);for(const use of r.actualUseAssessments)assert.ok(['bounded-normative-transfer-inference-not-canton-specific-precedent','limited-uncertainty-evidence-not-definitive-holiday-recognition'].includes(use.statementRole));
});
test('all four January boundaries remain unresolved with full-calculation comparison',()=>{
 const bindings=new Map();for(const r of review.rows)for(const u of r.actualUseAssessments)if(u.ambiguity)bindings.set(u.bindingId,u);
 assert.deepEqual([...bindings.keys()].sort(),['AP22-BIND-SG-BGG','AP22-BIND-SG-STPO','AP22-BIND-SG-VWVG','AP22-BIND-SH-STPO']);
 for(const u of bindings.values()){assert.equal(u.ambiguity.decision,'DEC-2026-029');assert.equal(u.ambiguity.comparison,'fullCalculation');assert.equal(u.ambiguity.onDifference,'clarificationRequired');assert.equal(u.ambiguity.onEqual,'resolved');}
 for(const r of closure.rows)assert.equal(r.underlyingLegalUncertaintyResolved,false);
});
test('current norm closure has concrete IDs, provisions and pointers for every case, not a global count shortcut',()=>{
 assert.equal(closure.counts.concreteNormSources,31);assert.equal(closure.counts.pendingCompanionDependencies,0);
 for(const r of closure.rows){assert.deepEqual(r.normAssessments.map(n=>n.sourceId),r.requiredNormSourceIds);assert.ok(r.normAssessments.length>0);for(const n of r.normAssessments){assert.match(n.reportBinding.pointer,/^\/(?:sourceRows|rows)\/\d+$/u);assert.ok(n.relevantProvisions.length>0);assert.ok(n.contentFinding);assert.ok(n.officialEvidence.length+n.contentEvidence.length>0);}}
});
test('three supplementary current SG/SH norm bodies do not close later source-owner lots',()=>{
 assert.equal(closure.counts.additionalPhysicalNormCompanions,3);assert.equal(closure.laterSourceOwnerLotsClosed,false);const extras=new Map();for(const r of closure.rows)for(const a of r.additionalPurposeBoundNormAssessments){assert.equal(a.laterSourceOwnerReviewClosed,false);extras.set(a.id,a);}assert.deepEqual([...extras.keys()].sort(),['SG-PERSV','SG-RLG','SH-PERSV']);
});
test('NE LPA/RDF companions do not silently close the LJu promulgation gate',()=>{
 const r=closure.rows.find(r=>r.sourceId==='SRC-AP22CLOSE-BGER-9C396');assert.match(r.remainingBoundaries.join(' '),/NE-O4 nicht/u);assert.match(r.remainingBoundaries.join(' '),/En attente promulgation/u);
});
test('pending history remains unchanged and no source, product or operating approval is invented',async()=>{
 const b=await readFile(base+'/review.json');assert.equal(createHash('sha256').update(b).digest('hex'),'81c3530f3b9ee9137ffa8e17c1a3092b534f0c2b639531419e2028028a043b9e');
 assert.equal(review.recordStatus,'historical-assertions-reviewed-awaiting-concrete-current-norm-closure');
 for(const d of [review,closure])for(const key of ['humanApproval','sourceReleaseApproved','dataPromotionApproved','registerChanges','productChanges','operatingChanges'])assert.equal(d[key],false);
 for(const r of closure.rows){assert.equal(r.historicalPendingRecordUnchanged,true);assert.equal(r.humanApproval,false);assert.equal(r.sourceReleaseApproved,false);assert.equal(r.newPositiveCaseApproval,false);}
});
test('local extraction, per-source review and companion closure reproduce without writes',async()=>{
 const copies=await extract({write:false});assert.equal(copies.physicalDecisionFamilies,18);const r=await buildReview();assert.deepEqual(r.review,review);assert.deepEqual(r.pinpoints,pinpoints);assert.deepEqual(await buildClosure(),closure);
});
