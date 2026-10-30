// SPDX-License-Identifier: AGPL-3.0-only
// Extra native VS review checks. These are not part of Root's 117 governance tests.
import assert from 'node:assert/strict';
import {H,enc,bytes,bind} from './fetch-r10-a2-catalog-east.mjs';
import {BASE,save} from './fetch-r10-a2-ap23m1-vs.mjs';
import {IDS,USE_COUNTS,ADMIN,ACCEPTED,candidateChecks,independentReference,review} from './review-r10-a2-ap23m1-vs.mjs';
const json=async p=>JSON.parse(await bytes(p)),clone=structuredClone;
const c=await json(ADMIN),accepted=await json(ACCEPTED),research=await json('docs/fachrecht/ap23m1/befund-vs.json'),refs=await json('docs/fachrecht/ap23m1/referenzfaelle.json');
const results=[];
const run=(name,f)=>{f();results.push({name,passed:true});};
const corrupt=(name,mutation)=>run(name,()=>{const x=clone(c);mutation(x);assert.throws(()=>candidateChecks(x,accepted,research));});
const path=(x,id)=>x.paths.find(p=>p.pathId===id),policy=(x,id)=>x.qualificationPolicies.find(p=>p.pathId===id);
run('positive-unmodified-M3-paths-and-M1-qualifications',()=>assert.equal(candidateChecks(c,accepted,research).paths.length,14));
corrupt('reject-five-days-relabelled-ten',x=>path(x,'vs-admin-written-5').duration.value=10);
corrupt('reject-interlocutory-ten-days-relabelled-thirty',x=>path(x,'vs-court-interlocutory-10').duration.value=30);
corrupt('reject-free-overriding-statutory-thirty',x=>path(x,'vs-admin-appeal-30').duration.overridable=true);
corrupt('reject-invented-seven-day-order',x=>path(x,'vs-admin-ordered').duration={kind:'statutoryDays',value:7,overridable:false});
corrupt('reject-wrong-order-trigger',x=>policy(x,'vs-admin-ordered').requirements.find(r=>r.key==='triggerQualification').value='qualifiedWrittenDecisionOpening');
corrupt('reject-raw-tracking-opening',x=>path(x,'vs-admin-ordered').openingPolicy.triggerKind='trackingPhysicalReceipt');
corrupt('reject-Saturday-opening-Monday-transformation',x=>path(x,'vs-admin-ordered').openingPolicy.transformation='nextWorkingDay');
corrupt('reject-general-court-pause-for-Conseil-Etat',x=>path(x,'vs-admin-appeal-30').suspensionSelection.suspensionProfileId='vs-three');
corrupt('reject-removal-own-court-short-frist-pause',x=>path(x,'vs-court-written-5').suspensionSelection.suspensionProfileId='vs-none');
corrupt('reject-winter-end-January2-federal-profile-import',x=>x.suspensionProfiles.find(p=>p.suspensionProfileId==='vs-three').periods[2].end.day=2);
corrupt('reject-winter-end-January7-other-canton-import',x=>x.suspensionProfiles.find(p=>p.suspensionProfileId==='vs-three').periods[2].end.day=7);
corrupt('reject-unqualified-longer-instruction',x=>policy(x,'vs-court-notice-long').requirements.find(r=>r.key==='noticeStatus').value='missingOrDefective');
corrupt('reject-longer-instruction-not-strictly-longer',x=>path(x,'vs-admin-notice-long').duration.comparison='greaterOrEqual');
corrupt('reject-fixed-end-in-generic-order',x=>path(x,'vs-court-ordered').qualification.fixedEndDate=true);
corrupt('reject-payment-or-evidence-advance-positive-flag',x=>path(x,'vs-admin-ordered').qualification.evidenceAdvance=true);
corrupt('reject-automatic-art79a-collision-resolution',x=>path(x,'vs-court-ordered').endShiftGuard='none');
corrupt('reject-unlimited-window-extension',x=>path(x,'vs-court-appeal-30').temporalBinding.calculationCoverage.to=null);
corrupt('reject-party-authority-calendar-free-union',x=>x.holidayBindings.find(h=>h.holidayBindingId==='vs-qualified-authority-seat').legalBinding.roleUnion=true);
corrupt('reject-municipal-profile-expansion',x=>policy(x,'vs-admin-appeal-30').requirements.find(r=>r.key==='authorityScope').value='communal');
corrupt('reject-unqualified-general-interlocutory-case',x=>policy(x,'vs-court-interlocutory-10').requirements.find(r=>r.key==='actionQualification').value='anyInterlocutoryDecision');
corrupt('reject-duplicate-procedural-calendar-supplement',x=>x.holidayBindings.find(h=>h.holidayBindingId==='vs-qualified-authority-seat').proceduralCalendarSupplement={kind:'fixedDates',dates:['01-02','12-26']});
for(const id of ['M1-VS-SATURDAY-QUALIFIED-OPENING','M1-VS-GOOD-FRIDAY-NOT-HOLIDAY','M1-VS-COURT-ORAL-WINTER','M1-VS-END-RECESS-COLLISION','M1-VS-OUTSIDE','M1-VS-NO-NOT-LONGER'])run('independent-'+id,()=>{const f=refs.cases.find(x=>x.id===id);assert.deepEqual(independentReference(c,f),f.expected);});
const report=await json(BASE+'/review.json');
function validate(r){assert.equal(r.humanApproval,false);assert.equal(r.sourceReleaseApproved,false);assert.equal(r.productChanges,false);assert.equal(r.registerChanges,false);assert.equal(r.operatingChanges,false);assert.equal(r.counts.pendingCompanionDependencies,0);assert.equal(r.counts.referenceLocations,275);assert.deepEqual(r.rows.map(x=>x.sourceId),IDS);let sum=0;for(let i=0;i<r.rows.length;i++){const x=r.rows[i];assert.equal(x.humanApproval,false);assert.equal(x.sourceReleaseApproved,false);assert.equal(x.ownerLotId,'R10-A2-AP23M1');assert.equal(x.actualUseCount,USE_COUNTS[i]);assert.equal(x.referenceLocations.length,USE_COUNTS[i]);assert.deepEqual(x.referenceLocations,x.newReferenceLocations);assert.deepEqual(x.referenceLocations,[...x.newUseAssessment.allActualUses.map(y=>y.referenceLocation)].sort());assert.equal(x.originalAssessment.historicalM1ReportDate,'2026-10-27');assert.deepEqual(x.originalAssessment.declaredNativeReviewedOn,['2026-10-28']);assert.equal(x.currentNormCompanionAssessment.pendingCompanionDependencies,0);for(const n of x.currentNormCompanionAssessment.normRows){assert.equal(r.rows[+n.pointer.split('/').at(-1)].sourceId,n.sourceId);assert.ok(n.relevantProvisions.length>0);assert.equal(n.status,'today-substantively-read-self-contained-companion');}sum+=x.actualUseCount;}assert.equal(sum,275);assert.equal(r.phaseAndRevisionAssessment.currentEffectiveFrom,'2025-01-01');assert.equal(r.commonBoundaries.saturdayEndShiftIsJudicialInterpretationNotLiteralCurrentClause,true);assert.equal(r.commonBoundaries.winterThroughJanuary5Inclusive,true);assert.equal(r.commonBoundaries.noExhaustiveLaterJurisprudenceSearch,true);assert.equal(r.commonBoundaries.statutoryCostAdvanceArticle90NotActivated,true);assert.equal(new Set(r.evidenceBindings.map(x=>x.path)).size,r.evidenceBindings.length);}
run('positive-complete-native-contract-and-companion-closure',()=>validate(report));
for(const[name,mutate]of[
 ['reject-false-human-approval',x=>x.humanApproval=true],
 ['reject-false-source-release',x=>x.rows[0].sourceReleaseApproved=true],
 ['reject-foreign-canonical-source-ID',x=>x.rows[0].sourceId='JUD-SOME-OTHER-ID'],
 ['reject-missing-native-edge',x=>x.rows[1].newUseAssessment.allActualUses.pop()],
 ['reject-erased-pending-companion',x=>x.rows[0].currentNormCompanionAssessment.pendingCompanionDependencies=1],
 ['reject-companion-source-pointer-alias',x=>x.rows[0].currentNormCompanionAssessment.normRows[0].pointer='/rows/3'],
 ['reject-redating-original-report',x=>x.rows[0].originalAssessment.historicalM1ReportDate='2026-10-28'],
 ['reject-2024-publication-as-effective-date',x=>x.phaseAndRevisionAssessment.currentEffectiveFrom='2024-10-08'],
 ['reject-literal-current-Saturday-clause-claim',x=>x.commonBoundaries.saturdayEndShiftIsJudicialInterpretationNotLiteralCurrentClause=false],
 ['reject-exhaustive-jurisprudence-claim',x=>x.commonBoundaries.noExhaustiveLaterJurisprudenceSearch=false],
 ['reject-positive-cost-advance',x=>x.commonBoundaries.statutoryCostAdvanceArticle90NotActivated=false]
])run(name,()=>{const x=clone(report);mutate(x);assert.throws(()=>validate(x));});
for(const d of report.evidenceBindings)await bind(d.path,d);
results.push({name:'all-'+report.evidenceBindings.length+'-physical-byte-descriptors-reverified',passed:true});
await assert.rejects(bind(report.evidenceBindings[0].path,{...report.evidenceBindings[0],sha256:'0'.repeat(64)}));results.push({name:'reject-wrong-physical-SHA256',passed:true});
await assert.rejects(bytes('../outside'));results.push({name:'reject-path-traversal',passed:true});
await review(false);results.push({name:'deterministic-native-check-no-rewrite',passed:true});
const out={testId:'R10-A2-AP23M1-VS-NATIVE-CHECKS',checkedOn:'2026-10-28',report:await bind(BASE+'/review.json'),counts:{passed:results.length,failed:0},results,rootGovernanceTestsNotRecounted:true,cloneMutationsOnly:true,noProductEdits:true,humanApproval:false,sourceReleaseApproved:false};
await save(BASE+'/negative-checks.json',enc(out));
console.log(JSON.stringify({passed:results.length,report:await bind(BASE+'/review.json'),checks:await bind(BASE+'/negative-checks.json')},null,2));
