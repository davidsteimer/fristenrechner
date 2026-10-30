// SPDX-License-Identifier: AGPL-3.0-only
// Read-only checks of the bounded new R10-A2 lot-5 evidence.
import assert from 'node:assert/strict';
import test from 'node:test';
import {BASE,own,buildReport,review} from './review-r10-a2-ap23f1-ag-ch.mjs';
import {bytes,bind} from './fetch-r10-a2-catalog-east.mjs';
const load=async p=>JSON.parse(await bytes(p));
const inventory=await load('outputs/r10-a1-2026-10-28/sources/source-inventory.json');
const {report:r,summary:s,normTexts}=await buildReport();
const byId=id=>r.rows.find(row=>row.sourceId===id);
const vrpg=byId('SRC-AP23F1-AG-VRPG-20240701'),zpo=byId('SRC-AP23F1-CH-ZPO-20260701');
test('native five IDs and exact unchanged inventory reference edges',()=>{
 assert.deepEqual(r.rows.map(row=>row.sourceId),inventory.rows.filter(own).map(row=>row.sourceId));
 assert.deepEqual(r.rows.map(row=>row.actualUseCount),[0,11,15,1,43]);
 for(const row of r.rows){const original=inventory.rows.find(x=>x.sourceId===row.sourceId);assert.deepEqual(row.referenceLocations,original.referenceLocations);assert.deepEqual(row.newReferenceLocations,original.newReferenceLocations);assert.equal(row.ownerLotId,'R10-A2-AP23F1');}
});
test('all 70 uses are genuinely new, old-release aliases cannot cover them',()=>{
 assert.equal(r.rows.reduce((n,row)=>n+row.actualUseCount,0),70);
 for(const row of r.rows){assert.deepEqual(row.priorReferenceLocations,[]);assert.equal(row.newUseAssessment.sourceExistingElsewhereDoesNotCoverNewRole,true);assert.equal(row.newUseAssessment.allNewUsesExplicitlyRead,true);for(const use of row.newUseAssessment.actualUses){assert.equal(use.newUse,true);assert.equal(use.sourceRoleNotInferredFromUrlEquality,true);assert.ok(use.locator);assert.ok(use.legalRole);}}
});
test('all evidence paths bind actual raw bytes',async()=>{
 assert.ok(r.evidenceBindings.length>20);for(const d of r.evidenceBindings)await bind(d.path,d);
});
test('fresh complete original PDFs confirmed, not stale URL identities',()=>{
 assert.equal(r.counts.freshOfficialPdfRetrievals,4);
 for(const row of r.rows.filter(row=>!row.sourceId.includes('-CH-ZPO-'))){const pdf=row.freshEvidence[0];assert.equal(pdf.status,200);assert.equal(pdf.fullOriginalBytesIdentical,true);assert.equal(pdf.sha256,pdf.originalF1.sha256);assert.ok(pdf.retrievedAt.startsWith('2026-10-28'));assert.equal(pdf.originalF1.originalCheckedOn,'2026-10-22');}
});
test('three AG full law texts independently check current and published future',()=>{
 const expected={'961.200':3837,'221.200':3615,'271.200':3449};
 for(const row of r.rows.filter(row=>row.currentVersionAssessment.systematicNumber in expected)){const a=row.currentVersionAssessment;assert.equal(a.currentVersion.id,expected[a.systematicNumber]);assert.deepEqual(a.publishedFutureVersions,[]);assert.equal(a.abrogated,false);assert.equal(a.abrogatedScheduled,false);assert.equal(a.language,'de');assert.equal(a.sameDaySourceMapping.individualIdentityLanguageVersionAndAssertionChecked,true);assert.equal(a.sameDaySourceMapping.oldCalendarOnlyAssessmentNotSufficientForNewAdministrativeUses,true);}
});
test('zero-use EG ArR is retained as supporting contrast, not operative calendar',()=>{
 const row=byId('SRC-AP23F1-AG-EGARR-20250901');assert.equal(row.actualUseCount,0);assert.equal(row.newUseAssessment.supportingZeroUseRetained,true);assert.ok(row.usedAssertions[0].includes('nicht operative Gegenprobe'));assert.equal(r.counts.supportingZeroUseIds,1);
});
test('AG own fourteen-day process calendar is not regional labour calendar union',()=>{
 assert.equal(s.calendar.ruleCount,14);assert.equal(s.calendar.notRegionalArGUnion,true);assert.equal(s.holidayBinding.anchor,'authoritySeat');assert.equal(s.holidayBinding.legalBinding.roleUnion,false);assert.equal(s.holidayBinding.legalBinding.partyOrRepresentativeRequired,false);assert.ok(byId('SRC-AP23F1-AG-EGZPO-20220101').usedAssertions[0].includes('§§ 1–2'));assert.ok(byId('SRC-AP23F1-AG-EGZPO-20220101').usedAssertions[0].includes('systematischen'));
});
test('AG ordinary 30-day, actual ordered and qualified 10-day paths stay distinct',()=>{
 assert.equal(s.agPaths.length,5);for(const p of s.agPaths){assert.equal(p.qualification.authorityLevel,'cantonal');assert.equal(p.qualification.delivery,'qualifiedActualDelivery');assert.equal(p.temporalBinding.caseCoverage.from,'2026-08-29');assert.equal(p.temporalBinding.caseCoverage.to,'2027-12-31');if(p.pathId.endsWith('-30'))assert.equal(p.duration.value,30);if(p.pathId.endsWith('-ordered'))assert.equal(p.duration.kind,'authorityOrderedDays');if(p.pathId==='ag-execution-10')assert.equal(p.duration.value,10);}
});
test('AG judicial suspension and narrow end-shift boundary are retained',()=>{
 for(const p of s.agPaths){if(p.stages[0]==='court'){assert.equal(p.suspensionProfileId,'ag-three');assert.equal(p.endShiftGuard,'blockWhenEnteringApplicableSuspension');}else{assert.equal(p.suspensionProfileId,'ag-none');assert.equal(p.endShiftGuard,'none');}}
 assert.ok(vrpg.remainingBoundaries.some(x=>x.includes('ohne definitives Ergebnis/Export')));
});
test('AG section 79/83 scope proven against actual positive path, policy and UI',()=>{
 const p=vrpg.newUseAssessment.executionScopeProof;assert.equal(p.pathPointer,'/paths/33');assert.equal(p.policyPointer,'/qualificationPolicies/33');assert.equal(p.path.pathId,'ag-execution-10');assert.equal(p.policy.requirements.decisionKind,'qualifiedAGVRPG83ExecutionOrder');assert.equal(p.policy.requirements.targetBody,'administrativeCourt');assert.equal(p.policy.requirements.action,'executionAppeal');assert.equal(p.materialProductMismatchFound,false);assert.equal(p.productPatch,false);assert.ok(p.section79Precision.includes('Entscheide im verwaltungsrechtlichen Klageverfahren'));assert.ok(p.legalMeaning.includes('bewusste Nutzereingabe')||p.boundary.includes('bewusste Nutzereingabe'));assert.equal(p.implementationAndUiEvidence.length,4);assert.ok(p.implementationAndUiEvidence.some(d=>d.selectedLines.some(l=>l.text.includes('facts.decisionKind !== required.decisionKind'))));assert.ok(p.implementationAndUiEvidence.some(d=>d.selectedLines.some(l=>l.text.includes('state.qualification'))));
});
test('one WBE pinpoint bound to execution path and specific current companions',()=>{
 const row=byId('SRC-AP23F1-AG-WBE2024299-20250331');assert.equal(row.actualUseCount,1);assert.equal(row.newUseAssessment.actualUses[0].pathId,'ag-execution-10');assert.equal(row.currentVersionAssessment.decisionDate,'2025-03-31');assert.equal(row.currentVersionAssessment.normCompanionStatus,'closed-in-this-subset-on-individually-read-current-norms');assert.equal(row.currentVersionAssessment.exhaustiveNewCaseLawSearch,false);assert.deepEqual(s.wbePinpoint.usedPdfPages,[5,6,7]);assert.ok(row.remainingBoundaries[0].includes('Zustellfiktion'));assert.deepEqual(row.newUseAssessment.executionScopeProof,vrpg.newUseAssessment.executionScopeProof);
});
test('ZPO all five entire used articles compared, raw inequality not hidden',()=>{
 const c=zpo.currentVersionAssessment;assert.equal(c.rawBytesIdentical,false);assert.equal(c.usedCompleteArticlesIdentical,true);assert.deepEqual(c.usedArticleIds,['art_142','art_143','art_145','art_146','art_248']);const n=normTexts.records.find(row=>row.sourceId===zpo.sourceId);assert.equal(n.articles.length,5);for(const a of n.articles)assert.ok(a.text.length>100);assert.ok(n.articles.find(a=>a.article==='art_248').text.includes('d. für die vorsorglichen Massnahmen'));assert.ok(n.articles.find(a=>a.article==='art_142').text.includes('1bis'));assert.ok(n.articles.find(a=>a.article==='art_145').text.includes('18. Dezember'));
});
test('ZPO published versions and effects expressly checked without future guarantee',()=>{
 const c=zpo.currentVersionAssessment;assert.deepEqual(c.publishedFutureVersions,[]);assert.ok(c.publishedVersionIndex.some(x=>x.start.value==='2026-07-01'&&!x.end));assert.equal(c.publishedVersionIndex.some(x=>x.start.value>'2026-10-28'),false);assert.equal(c.publishedImpactIndex.some(x=>x.date.value>'2026-10-28'),false);assert.ok(c.finding.includes('Kein unbegrenzter Beständigkeitsnachweis'));
});
test('43 new ZPO edges explicitly split ZH 7, AG 11 and SG 25',()=>{
 const counts={};for(const u of zpo.newUseAssessment.actualUses){const key=u.pathId?.split('-')[0]??u.suspensionProfileId?.split('-')[0];counts[key]=(counts[key]??0)+1;}assert.deepEqual(counts,{zh:7,ag:11,sg:25});
 const admin=zpo.newUseAssessment.actualUses.filter(u=>u.pathId?.includes('ag-admin')||u.pathId?.includes('sg-admin'));assert.ok(admin.length>0);for(const u of admin)assert.ok(u.legalRole.includes('no-general-court-suspension-import'));
 const interim=zpo.newUseAssessment.actualUses.filter(u=>u.pathId==='sg-court-interim-5');assert.equal(interim.length,3);assert.ok(interim.every(u=>u.suspensionProfileId==='sg-none'));
});
test('current canton referrals and published phases bound to exact source IDs',()=>{
 const c=zpo.newUseAssessment.concreteCantonalNormCompanions;assert.equal(c.reports.length,2);assert.equal(c.reports[0].nativeSourceBindings[0].sourceId,'SRC-AP23F1-ZH-VRG-20260701');assert.equal(c.reports[1].nativeSourceBindings[0].sourceId,'SRC-AP23F1-SG-VRP-20240101');assert.ok(c.reports[1].nativeSourceBindings[0].meaning.includes('Art. 146'));assert.ok(c.reports[1].nativeSourceBindings[0].meaning.includes('Art.-60'));assert.ok(c.reports[1].nativeSourceBindings[2].meaning.includes('01.06.2027'));assert.equal(r.counts.pendingCompanionDependencies,0);assert.ok(c.qualification.includes('ursprünglich noch offene CH-Abhängigkeit'));
});
test('original assessment dates and every human/release/product boundary remain separate',()=>{
 assert.equal(r.humanApproval,false);assert.equal(r.sourceReleaseApproved,false);assert.equal(r.dataPromotionApproved,false);assert.equal(r.productChanges,false);assert.equal(r.registerChanges,false);assert.equal(r.operatingChanges,false);assert.equal(r.laterSourceOwnerLotsClosed,false);
 for(const row of r.rows){assert.equal(row.currentReviewDate,'2026-10-28');assert.equal(row.boundedReuse.originalReportDate,'2026-10-22');assert.equal(row.humanApproval,false);assert.equal(row.sourceReleaseApproved,false);assert.equal(row.dataPromotionApproved,false);assert.ok(row.remainingBoundaries.length);}
});
test('deterministic full reconstruction and raw-byte check',async()=>{
 const result=await review(false);assert.equal(result.status,'ap23f1-ag-ch-review-reverified');assert.equal(result.sourceIds,5);assert.equal(result.referenceLocations,70);assert.equal(result.report.path,BASE+'/review.json');
});
