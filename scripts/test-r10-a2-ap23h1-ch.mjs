// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import {BASE,own,xmlArticles,xmlIdentity,pathChecks,buildReport,review} from './review-r10-a2-ap23h1-ch.mjs';
import {bytes,bind} from './fetch-r10-a2-catalog-east.mjs';
const load=async p=>JSON.parse(await bytes(p));
const inv=await load('outputs/r10-a1-2026-10-28/sources/source-inventory.json');
const {report:r,summary:s}=await buildReport();
const bgg=r.rows[0],zpo=r.rows[1];
test('exact two native IDs and original 6/26 new reference edges',()=>{
 const originals=inv.rows.filter(own);assert.deepEqual(r.rows.map(x=>x.sourceId),originals.map(x=>x.sourceId));assert.deepEqual(r.rows.map(x=>x.actualUseCount),[6,26]);for(const row of r.rows){assert.deepEqual(row.referenceLocations,originals.find(x=>x.sourceId===row.sourceId).referenceLocations);assert.deepEqual(row.referenceLocations,row.newReferenceLocations);assert.deepEqual(row.priorReferenceLocations,[]);assert.equal(row.ownerLotId,'R10-A2-AP23H1');}
});
test('all 32 uses individually bound, no physical-source permission inheritance',()=>{
 assert.equal(r.counts.newReferenceLocations,32);for(const row of r.rows){assert.equal(row.newUseAssessment.allNewUsesIndividuallyAssessed,true);assert.equal(row.newUseAssessment.oldFederalScopeDoesNotApproveNewCantonalUse,true);for(const use of row.newUseAssessment.actualUses){assert.equal(use.newUse,true);assert.equal(use.notCoveredByOldFederalSourceRole,true);assert.ok(use.locator);assert.ok(use.legalRole.length>20);}}
});
test('all evidence hashes and byte lengths verified',async()=>{
 assert.ok(r.evidenceBindings.length>25);for(const d of r.evidenceBindings)await bind(d.path,d);
});
test('actual XML identity checks SR, edition work and expression language against H1',()=>{
 for(const row of r.rows){const m=row.currentVersionAssessment.xmlMetadataIdentityProof;assert.deepEqual(m.current,m.originalH1);assert.equal(m.metadataFieldsEqual,true);assert.equal(m.notUrlOnlyAlias,true);assert.equal(m.current.language,'de');assert.equal(m.current.systematicNumber,row.currentVersionAssessment.sr);assert.equal(m.current.expressionUri,m.current.workUri+'/de');}
});
test('ten complete article comparisons, not bare unchanged URL or raw-byte assertion',()=>{
 assert.equal(r.counts.fullUsedArticleComparisons,10);for(const row of r.rows){assert.equal(row.currentVersionAssessment.fullUsedArticlesIdentical,true);assert.equal(row.currentVersionAssessment.rawBytesIdentical,false);assert.equal(row.currentVersionAssessment.currentIdentityNotDerivedFromUrlOnly,true);const c=s.completeFederalArticleReadings.records.find(c=>c.sourceId===row.sourceId);assert.equal(c.usedCompleteArticles.length,5);for(const a of c.usedCompleteArticles)assert.ok(a.text.length>100);}
});
test('current and published future general-law indices are not year-capped',()=>{
 for(const row of r.rows){const v=row.currentVersionAssessment;assert.equal(v.unboundedPublishedGeneralLawIndex,true);assert.deepEqual(v.publishedFutureVersions,[]);assert.equal(v.publishedVersionRows.some(x=>x.start.value>'2026-10-28'),false);assert.equal(v.publishedImpactRows.some(x=>x.date.value>'2026-10-28'),false);assert.ok(v.finding.includes('Keine Garantie'));
 }
});
test('BGG six edges only two thirty-day same-issuer requests, no federal appeal',()=>{
 for(const use of bgg.newUseAssessment.actualUses){assert.ok(['ow-admin-reasons-30','ow-court-reasons-30'].includes(use.pathId));assert.equal(use.duration.value,30);assert.equal(use.legalRole,'BGG112(2)-thirty-day-and-unreasoned-opening-only-not-global-BGG45-46-import');}
 assert.ok(bgg.usedAssertions.some(x=>x.includes('nicht um eine neue Beschwerde ans Bundesgericht')));assert.ok(bgg.remainingBoundaries.some(x=>x.includes('Gegenargumentation')));
});
test('BGG45 party place and BGG46 exceptions not silently imported into OW',()=>{
 assert.ok(bgg.usedAssertions.some(x=>x.includes('nicht still importiert')));assert.ok(bgg.remainingBoundaries.some(x=>x.includes('nur systematischer Vergleich')));
 for(const b of s.ownHolidayBindings){assert.equal(b.authoritySeatCanton,'OW');assert.equal(b.legalBinding.partyOrRepresentativeRequired,false);assert.equal(b.legalBinding.roleUnion,false);}
});
test('ZPO26 edges include all seven OW paths and no NW edge',()=>{
 const paths=new Set(zpo.newUseAssessment.actualUses.filter(x=>x.pathId).map(x=>x.pathId));assert.equal(paths.size,7);for(const p of paths)assert.ok(p.startsWith('ow-'));assert.equal(r.counts.actualNwFederalEdges,0);assert.equal(s.concreteNormCompanions.NWIsRequiredCompanion,false);assert.equal(zpo.newUseAssessment.noInventedNwFederalEdge,true);
 const n=zpo.newUseAssessment.actualUses.filter(x=>!x.pathId);assert.equal(n.length,5);assert.equal(zpo.newUseAssessment.actualUses.filter(x=>x.normPhase).length,14);
});
test('specific OW statutory referral closes only with current canton reports',()=>{
 const c=s.concreteNormCompanions;assert.equal(c.requiredCanton,'OW');assert.ok(c.nativeBindings.some(x=>x.sourceId.includes('STVG')));assert.ok(c.nativeBindings.some(x=>x.sourceId.includes('VGV')));assert.ok(c.nativeBindings.some(x=>x.sourceId.includes('VWVV')));assert.ok(c.nativeBindings.some(x=>x.sourceId.includes('GOG')));assert.equal(r.counts.pendingCompanionDependencies,0);for(const row of r.rows)assert.equal(row.currentNormCompanionAssessment.status,'closed-concrete-current-OW-norms-and-published-future-companions');
});
test('OW ordinary 20/30 and actual ordered day inputs remain distinct',()=>{
 assert.equal(s.pathChecks.find(x=>x.pathId==='ow-admin-20').path.duration.value,20);assert.equal(s.pathChecks.find(x=>x.pathId==='ow-court-30').path.duration.value,30);for(const p of s.pathChecks.filter(x=>x.pathId.endsWith('-ordered'))){assert.equal(p.path.duration.kind,'authorityOrderedDays');assert.equal(p.path.duration.boundMeaning,'technicalSafetyLimitNotLegalMaximum');assert.equal(p.positivelyRequiredFacts.durationBasis,'concreteDayOrder');}
});
test('six OW paths use cantonally referred three periods including administration',()=>{
 const ordinary=s.pathChecks.filter(p=>p.pathId!=='ow-court-suspensive-5');assert.equal(ordinary.length,6);for(const p of ordinary){assert.equal(p.path.suspensionProfileId,'ow-three');assert.equal(p.path.endShiftGuard,'blockWhenEnteringApplicableSuspension');assert.equal(p.positivelyRequiredFacts.suspensionException,'ordinaryNoException');}
 assert.equal(ordinary.find(x=>x.pathId==='ow-admin-20').path.suspensionProfileId,'ow-three');
});
test('H1-B reasons requests retain cantonal timing and same-issuer current facts',()=>{
 for(const p of s.pathChecks.filter(x=>x.pathId.includes('-reasons-'))){assert.equal(p.acceptedInterpretationRef,'H1-B');assert.equal(p.path.duration.value,30);assert.equal(p.positivelyRequiredFacts.reasonsContext,'qualifiedRequestUnderBGG112');assert.equal(p.positivelyRequiredFacts[p.path.stages[0]==='court'?'sameIssuingCourt':'sameIssuingAuthority'],true);}
 assert.equal(s.pathChecks.find(x=>x.pathId==='ow-admin-20').policy.openingChainPolicy,'requireOriginalOrTimelyRequestedReasons');
});
test('H1-C five-day exception is narrow accepted interpretation, not generic urgency',()=>{
 const p=s.pathChecks.find(x=>x.pathId==='ow-court-suspensive-5');assert.equal(p.path.duration.value,5);assert.equal(p.path.suspensionProfileId,'ow-none');assert.equal(p.path.endShiftGuard,'none');assert.equal(p.positivelyRequiredFacts.suspensionException,'provisionalMeasureAnalogy');assert.equal(p.positivelyRequiredFacts.suspensiveReviewContext,'sameOverallCourt');assert.equal(p.acceptedInterpretationRef,'H1-C');assert.ok(s.additionalReadOnlyReview.H1C.includes('not explicit OW-law text'));
});
test('local boundary and full unchanged case window retained in both norm phases',()=>{
 for(const p of s.pathChecks){assert.equal(p.policy.localHolidayPolicy,'blockConcreteUnresolvedAdditionalEndEffect');assert.equal(p.positivelyRequiredFacts.localHolidayEffect,'noAdditionalRelevantLocalHoliday');assert.equal(p.path.temporalBinding.caseCoverage.from,'2026-08-29');assert.equal(p.path.temporalBinding.caseCoverage.to,'2027-12-31');assert.deepEqual(p.path.normTimeline.map(n=>n.interval),[{from:'2026-08-29',to:'2026-12-31'},{from:'2027-01-01',to:'2027-12-31'}]);}
});
test('subsidiary VwVG2027 bounded, not a changed primary OW regime',()=>{
 const v=s.concreteNormCompanions.VwVG2027;assert.ok(v);assert.equal(v.doesNotReplaceSpecificCantonalReferral,true);assert.ok(JSON.stringify(v).includes('2027'));assert.ok(JSON.stringify(v).includes('IGE'));assert.ok(JSON.stringify(v).includes('20'));
});
test('all source/human/product approvals false and original assessment date preserved',()=>{
 for(const row of r.rows){assert.equal(row.currentReviewDate,'2026-10-28');assert.equal(row.boundedReuse.originalReportDate,'2026-10-22');assert.equal(row.humanApproval,false);assert.equal(row.sourceReleaseApproved,false);assert.equal(row.dataPromotionApproved,false);assert.equal(row.productChanges,false);}
 for(const key of ['humanApproval','sourceReleaseApproved','dataPromotionApproved','productChanges','registerChanges','operatingChanges','laterSourceOwnerLotsClosed'])assert.equal(r[key],false);
});
test('deterministic report and hash reconstruction',async()=>{
 const result=await review(false);assert.equal(result.status,'ap23h1-ch-review-reverified');assert.equal(result.report.path,BASE+'/review.json');assert.equal(result.newReferenceLocations,32);
});
