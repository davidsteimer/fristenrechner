// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import {BASE,own,articles,buildReport,review} from './review-r10-a2-ap23g1-sh.mjs';
import {bytes,bind} from './fetch-r10-a2-catalog-east.mjs';
const load=async p=>JSON.parse(await bytes(p));
const inv=await load('outputs/r10-a1-2026-10-28/sources/source-inventory.json');
const {report:r,summary:s}=await buildReport();
const vrg=r.rows[4],bger=r.rows[0],oge=r.rows[1];
test('exact five native identifiers, 55 new edges, no prior edge inherited',()=>{
 const original=inv.rows.filter(own);assert.deepEqual(r.rows.map(x=>x.sourceId),original.map(x=>x.sourceId));assert.deepEqual(r.rows.map(x=>x.actualUseCount),[8,7,8,14,18]);assert.equal(r.counts.referenceLocations,55);
 for(const row of r.rows){assert.deepEqual(row.referenceLocations,original.find(x=>x.sourceId===row.sourceId).referenceLocations);assert.deepEqual(row.referenceLocations,row.newReferenceLocations);assert.deepEqual(row.priorReferenceLocations,[]);assert.equal(row.ownerLotId,'R10-A2-AP23G1');assert.equal(row.newUseAssessment.allNewUsesIndividuallyAssessed,true);for(const use of row.newUseAssessment.actualUses){assert.equal(use.newUse,true);assert.equal(use.notInheritedFromExactUrlOrExistingCalendar,true);assert.ok(use.locator);}}
});
test('every evidence descriptor matches current on-disk raw bytes',async()=>{
 assert.ok(r.evidenceBindings.length>35);for(const d of r.evidenceBindings)await bind(d.path,d);
});
test('eight new official retrievals, seven identical full bodies, no false BGer byte equality',()=>{
 assert.equal(r.counts.freshOfficialRetrievals,8);assert.equal(r.counts.officialBodiesByteIdenticalToG1,7);assert.equal(r.counts.bgerRawBytesDifferentButUsedSectionsEqual,1);
 assert.equal(bger.currentVersionAssessment.fullRawBytesEqual,false);assert.equal(bger.currentVersionAssessment.usedBgerSectionsEqual,true);assert.equal(oge.currentVersionAssessment.fullRawBytesEqual,true);
});
test('current exact SH versions and published future indexes are separately read',()=>{
 const expected={'173.200':2100,'900.200':1886,'172.200':2030};
 for(const row of r.rows.filter(x=>x.sourceKind==='statute')){const v=row.currentVersionAssessment;assert.equal(v.current.id,expected[v.systematicNumber]);assert.equal(v.selected,v.current.id);assert.deepEqual(v.publishedFutureVersions,[]);assert.deepEqual(v.changeDocuments,[]);assert.equal(v.abrogated,false);assert.equal(v.abrogatedScheduled,false);assert.equal(v.individualCanonicalIdentityLanguageVersionAndExpandedRoleVerified,true);}
});
test('full article extraction includes sibling paragraphs and enumerations, not just headings',()=>{
 const sample="<div><div class='article'><div class='article_number'>Art. 8</div></div><div class='paragraph'>1 Complete body</div><table class='enumeration_item'><tr><td>b) Ten days</td></tr></table><div class='article'><div class='article_number'>Art. 9</div></div><div class='paragraph'>2 Next body</div></div>";
 const result=articles(sample);assert.equal(result.length,2);assert.ok(result[0].text.includes('Complete body'));assert.ok(result[0].text.includes('b) Ten days'));assert.equal(result[0].text.includes('Next body'),false);assert.ok(result[1].text.includes('Next body'));
 const norm=s.currentNorms.find(x=>x.sourceId===vrg.sourceId);for(const id of ['8','9','20','39','47','50'])assert.ok(norm.completeUsedArticles.find(x=>x.article===id).text.length>150);
 assert.equal(s.diagnostics[0].status,'initial-title-only-article-extractor-not-accepted-or-used-as-full-norm-evidence');
});
test('ordinary administrative and court deadlines both twenty, no invented 31 days',()=>{
 for(const id of ['sh-admin-20','sh-court-20'])assert.equal(s.pathChecks.find(x=>x.pathId===id).path.duration.value,20);assert.equal(s.pathChecks.some(x=>x.path.duration.value===31),false);
 assert.equal(s.pathChecks.find(x=>x.pathId==='sh-admin-20').policy.requirements.shorteningPolicy,'noShortenedSHRekurs');
 assert.ok(vrg.usedAssertions.some(x=>x.includes('48 Stunden')));
});
test('administrative reasons ten and same-court reasons thirty cannot be conflated',()=>{
 const admin=s.pathChecks.find(x=>x.pathId==='sh-admin-reasons-10'),court=s.pathChecks.find(x=>x.pathId==='sh-court-reasons-30');assert.equal(admin.path.duration.value,10);assert.equal(admin.policy.requirements.opening,'lawfullyUnreasonedAdministrativeDecisionWithExpressReasonsOffer');assert.equal(admin.policy.requirements.holidayAnchor,'issuingAuthoritySeat');assert.equal(court.path.duration.value,30);assert.equal(court.policy.requirements.requiredTargetCourt,'SH-Obergericht');assert.equal(court.policy.requirements.requiredSameIssuingCourt,true);assert.equal(court.policy.requirements.opening,'legallyQualifiedCourtDispositiveOrOralOpening');assert.ok(vrg.usedAssertions.some(x=>x.includes('rechtzeitig verlangten')));
});
test('ordered durations are actual inputs with technical, not legal maxima',()=>{
 for(const p of s.pathChecks.filter(x=>x.pathId.endsWith('-ordered'))){assert.equal(p.path.duration.kind,'authorityOrderedDays');assert.equal(p.path.duration.boundMeaning,'technicalSafetyLimitNotLegalMaximum');assert.equal(p.policy.requirements.opening,'orderedForwardDayPeriod');assert.equal(p.policy.requirements.materialPerformance,false);assert.equal(p.policy.requirements.fixedEndDate,false);}
});
test('administration no general holidays, qualified ordinary court three periods',()=>{
 for(const p of s.pathChecks){const court=p.path.stages[0]==='court';assert.equal(p.path.suspensionProfileId,court?'sh-three':'sh-none');assert.equal(p.path.endShiftGuard,court?'blockWhenEnteringApplicableSuspension':'none');assert.equal(p.policy.requirements.specialLaw,'excluded');assert.equal(p.policy.requirements.suspensionContext,'ordinaryNoException');}
 assert.ok(vrg.usedAssertions.some(x=>x.includes('Steuer-Ferienausschluss')));assert.ok(s.nativeCourtReferral.substance.includes('Steuerrecht ausdrücklich ausgeschlossen'));
});
test('SH court ZPO referral actual Article 50 with limited paragraph two import',()=>{
 assert.deepEqual(s.nativeCourtReferral.provisions,['Art. 35 Abs. 1/2,39 Abs.1/2,47 Abs.1/2,50 Abs.1/2']);assert.equal(s.nativeCourtReferral.reportRowPointer,'/rows/4');assert.equal(s.nativeCourtReferral.jgReportRowPointer,'/rows/2');assert.ok(s.nativeCourtReferral.substance.includes('nicht8–10'));assert.ok(vrg.usedAssertions.some(x=>x.includes('nur Art. 4a, 4b, 6, 7 und 18 Abs. 2')));
});
test('SH article 22 is evidence, not a copied Uri opening warning',()=>{
 assert.ok(s.nativeCourtReferral.article22.includes('Beweismittel'));for(const p of s.pathChecks){assert.deepEqual(p.path.openingWarnings,[]);assert.equal(p.policy.requirements.specialOpeningPolicy,'notApplicable');assert.equal(p.article22Treatment,'SH-VRG-22-only-evidence-not-UR-opening-warning');}
});
test('narrow end-shift collision and original temporal window remain bounded',()=>{
 for(const p of s.pathChecks){assert.equal(p.path.temporalBinding.caseCoverage.from,'2026-08-29');assert.equal(p.path.temporalBinding.caseCoverage.to,'2027-12-31');assert.equal(p.policy.requirements.serviceContext,'effectiveLegalTriggerKnown');}
 assert.ok(vrg.remainingBoundaries.some(x=>x.includes('ohne definitives Resultat oder Export')));assert.ok(vrg.remainingBoundaries.some(x=>x.includes('Kein zusätzlicher Ferienaufschlag')));
});
test('same physical calendars do not erase distinct authority and court legal bases',()=>{
 assert.equal(s.calendarBindings.length,2);for(const c of s.calendarBindings){assert.equal(c.binding.legalBinding.roleUnion,false);assert.equal(c.binding.legalBinding.partyOrRepresentativeRequired,false);assert.equal(c.binding.physicalReuse.permissionInheritance,'none');assert.equal(c.physicalRuleCount,13);assert.equal(c.berchtoldCount,1);}
 const admin=s.calendarBindings.find(c=>c.binding.anchor==='authoritySeat');assert.equal(admin.binding.practiceAddition.evidenceLimit,'nonDispositiveCantonalLawDescription');assert.equal(admin.binding.physicalReuse.notDerivedFrom,'SH-ZPO-ADDITIONAL');assert.equal(s.calendarBindings.find(c=>c.binding.anchor==='courtSeat').binding.practiceAddition,null);
});
test('BGer own administrative practice statement remains non-dispositive and willkuer-limited',()=>{
 assert.equal(bger.currentVersionAssessment.decisionDate,'2026-03-12');assert.equal(bger.currentNormCompanionAssessment.overallStatus,'closed-specific-SH-norm-companions');assert.ok(bger.usedAssertions.some(x=>x.includes('nicht entscheidungstragend')));assert.ok(bger.usedAssertions.some(x=>x.includes('Willkür')));assert.equal(s.bgerSectionComparison.sections.length,7);assert.ok(s.bgerSectionComparison.sections.every(x=>x.normalizedEqual));assert.equal(s.bgerSectionComparison.currentEncoding,'windows-1252');
 for(const u of bger.newUseAssessment.actualUses)if(u.pathId)assert.ok(u.pathId.startsWith('sh-admin-'));assert.ok(bger.remainingBoundaries.some(x=>x.includes('Kein eigener Volltext')));
});
test('OGE actual date and paragraph 2.1.4 scope, not ten-day summary procedure import',()=>{
 assert.equal(oge.currentVersionAssessment.decisionDate,'2018-08-24');assert.equal(oge.currentVersionAssessment.docket,'40/2018/1/K');assert.ok(oge.usedAssertions.some(x=>x.includes('Zehntagesfrist werden nicht')));assert.ok(s.ogePinpoint.paragraphs.includes('2.1.4'));assert.deepEqual(s.ogePinpoint.printedPages,[84,85,86,87]);for(const u of oge.newUseAssessment.actualUses)if(u.pathId)assert.ok(u.pathId.startsWith('sh-court-'));
});
test('current ZPO full articles read here, native external row remains expressly open',()=>{
 assert.equal(r.counts.pendingCompanionDependencies,1);assert.equal(r.pendingCompanionDependencies[0].sourceId,'SRC-AP23G1-CH-ZPO-20260701');assert.equal(r.pendingCompanionDependencies[0].currentPrimaryContentReadHere,true);assert.equal(r.pendingCompanionDependencies[0].nativeNewUseAndCurrentFutureReviewNotClosedHere,true);assert.deepEqual(s.nativeCourtReferral.zpoNativeCompanion.completeUsedArticleIds,['art_142','art_143','art_144','art_145','art_146']);assert.equal(s.nativeCourtReferral.zpoNativeCompanion.completeUsedArticlesEqual,true);assert.equal(s.nativeCourtReferral.zpoNativeCompanion.individualIdentity.notUrlOnlyAlias,true);assert.ok(oge.currentNormCompanionAssessment.overallStatus.includes('pending'));
});
test('original dates, human approval and product/release boundaries never overwritten',()=>{
 for(const row of r.rows){assert.equal(row.currentReviewDate,'2026-10-28');assert.equal(row.boundedReuse.originalReportDate,'2026-10-22');assert.equal(row.humanApproval,false);assert.equal(row.sourceReleaseApproved,false);assert.equal(row.dataPromotionApproved,false);assert.equal(row.productChanges,false);assert.equal(row.boundedReuse.exhaustiveCaseLawSearch,false);}
 for(const key of ['humanApproval','sourceReleaseApproved','dataPromotionApproved','productChanges','registerChanges','operatingChanges','laterSourceOwnerLotsClosed'])assert.equal(r[key],false);
});
test('deterministic report reconstruction including evidence hashes',async()=>{
 const result=await review(false);assert.equal(result.status,'ap23g1-sh-review-reverified');assert.equal(result.report.path,BASE+'/review.json');assert.equal(result.sourceIds,5);assert.equal(result.newReferenceLocations,55);
});
