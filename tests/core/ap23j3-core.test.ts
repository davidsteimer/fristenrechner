// SPDX-License-Identifier: AGPL-3.0-only
// Actual native14 calculations. Synthetic facts never become application defaults.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ap23j3CandidateRuntime as runtime} from '../../src/release/ap23j3CandidateData';
import {calculateAdministrativeDeadline} from '../../src/core/administrativeDeadline';
import {resolveAdministrativeSuspensionV7} from '../../src/core/administrativeDeadlineV7';
import {administrativeInput14,administrativeReferenceInput14} from './ap23j3Fixtures';
const catalog=runtime.administrativeContext.administrativeCatalog;
const research=JSON.parse(readFileSync(new URL('../../docs/fachrecht/ap23j1/referenzfaelle.json',import.meta.url),'utf8'));
const calc=(input:any,context:unknown=runtime.administrativeContext)=>calculateAdministrativeDeadline(input,context);
const ge=(mode:string,date='2026-09-05',id='ge-recours-30',days=30)=>administrativeInput14(catalog,id,date,days,undefined,{openingMode:mode});
test('AP23J3 all36 new groups calculate and expose actual immutable qualified trigger provenance',()=>{
 for(const path of research.paths){
  const row=research.cases.find((r:any)=>r.path===path.id&&r.expected.outcome==='datedResearchValue');
  const input=administrativeReferenceInput14(catalog,row),r=calc(input);
  assert.equal(r.outcome,'calculated',path.id);if(r.outcome!=='calculated')throw Error(path.id);
  assert.equal(r.finalEnd,row.expected.end);assert.equal(r.calendarExportAllowed,false);
  const opening=r.provenance.openingResolution!;assert.ok(opening);assert.equal(opening.inputDate,row.trigger);
  assert.ok(Object.isFrozen(r)&&Object.isFrozen(r.provenance)&&Object.isFrozen(opening)&&Object.isFrozen(opening.openingShiftDates));
  assert.ok(Object.isFrozen(opening.evaluatedNormSegments)&&Object.isFrozen(opening.sourceRefs));
  assert.equal(opening.openingPolicySha256,(catalog.releaseBinding.pathEligibility.find(e=>e.pathId===input.selection.pathId) as any).openingPolicySha256);
 }
});
test('AP23J3 all36 new paths reject copied serialized inherited and invented contexts',()=>{
 const contexts=[{...runtime.administrativeContext},Object.create(runtime.administrativeContext),JSON.parse(JSON.stringify(runtime.administrativeContext)),{approved:true}];
 for(const p of research.paths){const row=research.cases.find((r:any)=>r.path===p.id&&r.expected.outcome==='datedResearchValue'),input=administrativeReferenceInput14(catalog,row);
  for(const context of contexts){const r=calc(input,context);assert.equal(r.outcome,'blocked');assert.equal(r.calendarExportAllowed,false);}}
});
test('AP23J3 every current requirement remains mandatory in every new group',()=>{
 let checks=0;
 for(const p of research.paths){const row=research.cases.find((r:any)=>r.path===p.id&&r.expected.outcome==='datedResearchValue'),policy=catalog.qualificationPolicies.find(q=>q.pathId===p.id.toLowerCase())!;
  assert.equal(policy.mode,'qualifiedDayProcedureV7');if(policy.mode!=='qualifiedDayProcedureV7')throw Error(p.id);
  for(const req of policy.requirements){const input:any=administrativeReferenceInput14(catalog,row);delete input.caseQualification[req.key];
   const r=calc(input);assert.equal(r.outcome,'blocked',p.id+'/'+req.key);assert.equal(r.calendarExportAllowed,false);checks++;}}
 assert.ok(checks>500);
});
test('AP23J3 GE physical Saturday opens Monday then counts exactly once',()=>{
 const r=calc(ge('ordinaryPostPhysicalReceipt'));assert.equal(r.outcome,'calculated');if(r.outcome!=='calculated')return;
 assert.equal(r.ordinaryStart,'2026-09-08');assert.equal(r.finalEnd,'2026-10-07');
 assert.deepEqual(r.provenance.openingResolution?.openingShiftDates,['2026-09-06','2026-09-07']);
 assert.equal(r.provenance.openingResolution?.qualifiedOpeningDate,'2026-09-07');
 assert.equal(r.provenance.openingResolution?.inputMeaning,'physicalOrdinaryPostReceiptDate');
 assert.ok(r.provenance.openingResolution?.evaluatedNormSegments.length);
});
test('AP23J3 GE already qualified Saturday is not shifted a second time',()=>{
 const r=calc(ge('qualifiedLegalOpening'));assert.equal(r.outcome,'calculated');if(r.outcome!=='calculated')return;
 assert.equal(r.ordinaryStart,'2026-09-06');assert.equal(r.finalEnd,'2026-10-05');
 assert.equal(r.provenance.openingResolution?.qualifiedOpeningDate,'2026-09-05');assert.deepEqual(r.provenance.openingResolution?.openingShiftDates,[]);
 assert.equal(r.provenance.openingResolution?.inputMeaning,'qualifiedLegalOpeningDate');
});
test('AP23J3 GE court recess affects counting but never postpones legal post opening',()=>{
 const r=calc(ge('ordinaryPostPhysicalReceipt','2027-03-21','ge-recours-10',10));assert.equal(r.outcome,'calculated');if(r.outcome!=='calculated')return;
 assert.equal(r.provenance.openingResolution?.qualifiedOpeningDate,'2027-03-22');assert.equal(r.ordinaryStart,'2027-03-23');
 assert.equal(r.countedDates[0],'2027-04-05');assert.equal(r.finalEnd,'2027-04-14');
});
test('AP23J3 GE firstAugustSunday creates no substitute holiday on Monday',()=>{
 const postal=calc(ge('ordinaryPostPhysicalReceipt','2027-08-01','ge-admin-ordered',1)),legal=calc(ge('qualifiedLegalOpening','2027-08-01','ge-admin-ordered',1));
 assert.equal(postal.outcome,'calculated');assert.equal(legal.outcome,'calculated');if(postal.outcome!=='calculated'||legal.outcome!=='calculated')return;
 assert.equal(postal.provenance.openingResolution?.qualifiedOpeningDate,'2027-08-02');assert.equal(postal.finalEnd,'2027-08-03');assert.equal(legal.finalEnd,'2027-08-02');
});
test('AP23J3 GE Jeune ordinary receipt and subsequent end shift remain separate',()=>{
 const r=calc(ge('ordinaryPostPhysicalReceipt','2027-09-09','ge-admin-ordered',1));assert.equal(r.outcome,'calculated');if(r.outcome!=='calculated')return;
 assert.equal(r.provenance.openingResolution?.qualifiedOpeningDate,'2027-09-10');assert.equal(r.provisionalEnd,'2027-09-11');assert.equal(r.finalEnd,'2027-09-13');
});
for(const value of[undefined,'unknown','electronic',true,0,null,[],new String('qualifiedLegalOpening')])test('AP23J3 GE missing or nonprimitive mode blocks '+String(value),()=>{
 const input:any=ge('qualifiedLegalOpening');if(value===undefined)delete input.caseQualification.openingMode;else input.caseQualification.openingMode=value;
 const r=calc(input);assert.equal(r.outcome,'blocked');assert.equal(r.calendarExportAllowed,false);assert.equal('finalEnd'in r,false);
});
test('AP23J3 facts input and nested selection getters or symbols are not invoked as qualification',()=>{
 let invoked=false;
 const input:any=ge('ordinaryPostPhysicalReceipt'),facts={...input.caseQualification};Object.defineProperty(facts,'openingMode',{enumerable:true,get(){invoked=true;return'ordinaryPostPhysicalReceipt';}});
 assert.equal(calc({...input,caseQualification:facts}).outcome,'blocked');assert.equal(invoked,false);
 assert.equal(calc({...input,caseQualification:Object.create(input.caseQualification)}).outcome,'blocked');
 assert.equal(calc({...input,caseQualification:{...input.caseQualification,[Symbol('foreign')]:true}}).outcome,'blocked');
 const getter:any={...input};Object.defineProperty(getter,'selection',{enumerable:true,get(){invoked=true;return input.selection;}});
 assert.equal(calc(getter).outcome,'blocked');assert.equal(invoked,false);
});
test('AP23J3 physical receipt and every opening-shift date stay inside full source and case window',()=>{
 for(const date of ['2026-08-28','2027-12-31']){const r=calc(ge('ordinaryPostPhysicalReceipt',date));assert.equal(r.outcome,'blocked');assert.equal('finalEnd'in r,false);assert.equal(r.calendarExportAllowed,false);}
});
test('AP23J3 FR source segments change during a real full calculation without simultaneous CPJA versions',()=>{
 const r=calc(administrativeInput14(catalog,'fr-nontc-recours-30','2026-09-15',30));assert.equal(r.outcome,'calculated');if(r.outcome!=='calculated')return;
 const segments=r.provenance.evaluatedNormSegments!;assert.equal(segments.length,2);
 assert.ok(segments[0]!.sourceRefs.some(s=>s.sourceId.endsWith('7947')));assert.ok(!segments[0]!.sourceRefs.some(s=>s.sourceId.endsWith('8637')));
 assert.ok(segments[1]!.sourceRefs.some(s=>s.sourceId.endsWith('8637')));assert.ok(!segments[1]!.sourceRefs.some(s=>s.sourceId.endsWith('7947')));
});
test('AP23J3 FR and JU distinct qualified triggers never synthesize following legal openings',()=>{
 for(const id of ['fr-nontc-nachfrist-3','fr-tc-begruendung-30','ju-confirmation-request5-initial','ju-motivation-request30-initial']){
  const p=catalog.paths.find(p=>p.pathId===id)!,r=calc(administrativeInput14(catalog,id,'2026-10-02',p.duration.kind==='statutoryDays'?p.duration.value:10));
  assert.equal(r.outcome,'calculated');if(r.outcome!=='calculated')continue;
  assert.equal(r.provenance.openingResolution?.qualifiedOpeningDate,'2026-10-02');assert.deepEqual(r.provenance.openingResolution?.openingShiftDates,[]);
  assert.equal(r.provenance.openingResolution?.inputMeaning,'qualifiedCurrentTriggerDate');assert.equal('followingOpeningDate'in r.provenance.openingResolution!,false);
 }
});
test('AP23J3 FR refusal before old expiry and JU unqualified review target remain blocked',()=>{
 for(const fact of ['originalLegalDeadlineExpired','noLongerSurvivingDeadline']){
  const input:any=administrativeInput14(catalog,'fr-nontc-nachfrist-3','2026-10-02',3);input.caseQualification[fact]=false;
  const r=calc(input);assert.equal(r.outcome,'blocked');assert.equal(r.calendarExportAllowed,false);
  if(r.outcome==='blocked')assert.deepEqual(r.blockReasonKeys,['administrative.FR-REFUSAL-BEFORE-EXPIRY']);
 }
 const row=research.cases.find((r:any)=>r.id==='JU-J1-R22');assert.ok(row);
 const input=administrativeReferenceInput14(catalog,row),r=calc(input);
 assert.equal((input.caseQualification as any).reviewTargetQualified,false);assert.equal(r.outcome,'blocked');assert.equal(r.calendarExportAllowed,false);
 if(r.outcome==='blocked')assert.deepEqual(r.blockReasonKeys,['administrative.ju.reviewTargetQualifiedNotQualified']);
});
test('AP23J3 pure end shift into applicable recess stays a limited block, not opening normalisation',()=>{
 const r=calc(ge('qualifiedLegalOpening','2027-03-10','ge-recours-10',10));assert.equal(r.outcome,'blocked');if(r.outcome!=='blocked')return;
 assert.equal(r.blockReasonKeys[0],'endShiftIntoSuspensionUnresolved');assert.equal(r.provisionalEnd,'2027-03-20');assert.equal(r.ordinaryShiftEnd,'2027-03-22');
 assert.equal(r.provenance?.openingResolution?.qualifiedOpeningDate,'2027-03-10');assert.equal(r.calendarExportAllowed,false);
});
test('AP23J3 typed current-trigger input is not accepted on an unchanged V6 route or vice versa',()=>{
 const old:any=administrativeInput14(catalog,'tg-vg-30','2026-10-02',30);old.qualification.delivery='qualifiedTriggerAccordingToOpeningPolicy';
 assert.equal(calc(old).outcome,'blocked');
 const fresh:any=ge('qualifiedLegalOpening');fresh.qualification.delivery='qualifiedActualDelivery';assert.equal(calc(fresh).outcome,'blocked');
});
test('AP23J3 descriptive suspension selection requires real Format14 context and current TG notice',()=>{
 assert.equal(resolveAdministrativeSuspensionV7(runtime.administrativeContext,'fr-nontc-recours-30')?.suspensionProfileId,'fr-two');
 assert.equal(resolveAdministrativeSuspensionV7(runtime.administrativeContext,'tg-vg-execution-5'),undefined);
 assert.equal(resolveAdministrativeSuspensionV7(runtime.administrativeContext,'tg-vg-execution-5',{exceptionNotice:'given'})?.suspensionProfileId,'tg-none');
 assert.equal(resolveAdministrativeSuspensionV7(runtime.administrativeContext,'tg-vg-execution-5',{exceptionNotice:'absent'})?.suspensionProfileId,'tg-three');
 assert.equal(resolveAdministrativeSuspensionV7({...runtime.administrativeContext},'fr-nontc-recours-30'),undefined);
});
