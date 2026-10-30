// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ap23m3CandidateRuntime as runtime} from '../../src/release/ap23m3CandidateData';
import {calculateAdministrativeDeadline} from '../../src/core/administrativeDeadline';
import {resolveAdministrativeCalendarV10,resolveAdministrativeSuspensionV10} from '../../src/core/administrativeDeadlineV10';
import {acceptedM2,administrativeReferenceInput17,administrativeInput17} from './ap23m3Fixtures';
const catalog=runtime.administrativeContext.administrativeCatalog;
const calc=(input:any,context:unknown=runtime.administrativeContext)=>calculateAdministrativeDeadline(input,context);
const from=(id:string):any=>administrativeReferenceInput17(catalog,acceptedM2.results.find((r:any)=>r.id===id).input);
for(const row of[...acceptedM2.results,...acceptedM2.syntheticProbeResults])test('AP23M3 accepted native '+row.id,()=>{
 const result=calc(administrativeReferenceInput17(catalog,row.input));
 if(row.actual.outcome==='datedResearchValue'){
  assert.equal(result.outcome,'calculated');if(result.outcome!=='calculated')throw Error(JSON.stringify(result));
  for(const[key,native]of Object.entries({end:result.finalEnd,nominalEnd:result.provisionalEnd,ordinaryStart:result.ordinaryStart,
   firstCountedDay:result.countedDates[0],skippedDays:result.skippedCalendarDays,
   legalOpening:result.provenance.openingResolution?.qualifiedOpeningDate}))assert.deepEqual(native,row.actual[key],row.id+'/'+key);
  assert.equal(result.provenance.calendarId,row.actual.calendar);
  assert.deepEqual(result.provenance.evaluatedNormSegments,row.actual.provenance.evaluatedNormSegments);
  assert.deepEqual(result.provenance.openingResolution?.openingShiftDates,row.actual.provenance.openingShiftDates);
  assert.equal(result.referenceOnly,true);assert.ok(Object.isFrozen(result)&&Object.isFrozen(result.provenance));
 }else{assert.equal(result.outcome,'blocked');assert.equal('finalEnd'in result,false);}
 assert.equal(result.calendarExportAllowed,false);
});
test('AP23M3 all560 accepted mandatory facts remain current and fail closed',()=>{
 let count=0;for(const p of catalog.paths.filter(p=>'contractFamily'in p&&p.contractFamily==='qualifiedDayProcedureV10')){
  const example=acceptedM2.results.find((r:any)=>r.input.path===p.pathId&&r.actual.outcome==='datedResearchValue');assert.ok(example);
  const q:any=catalog.qualificationPolicies.find(q=>q.pathId===p.pathId);
  for(const req of q.requirements){const input:any=administrativeReferenceInput17(catalog,example.input);delete input.caseQualification[req.key];
   const result=calc(input);assert.equal(result.outcome,'blocked',p.pathId+'/'+req.key);
   if(result.outcome==='blocked')assert.deepEqual(result.blockReasonKeys,['administrative.'+req.reason]);
   assert.equal(result.calendarExportAllowed,false);count++;
  }
 }assert.equal(count,560);
});
test('AP23M3 NE has exactly2 current authority regions and a separate fixed court binding',()=>{
 const base=from('M1-NE-GENERAL-CORPUS-NO');
 const general=calc(base);assert.equal(general.outcome,'calculated');if(general.outcome!=='calculated')throw Error('NE');
 assert.equal(general.finalEnd,'2027-05-27');assert.equal(general.provenance.calendarId,'ap22-ne-027ceadbf103');
 assert.deepEqual(general.warningKeys,['NE-YEAR-LOCAL-RESERVE']);
 base.caseQualification.authorityHolidayRegion='leLanderon';const local=calc(base);assert.equal(local.outcome,'calculated');
 if(local.outcome==='calculated'){assert.equal(local.finalEnd,'2027-05-28');assert.equal(local.provenance.calendarId,'ap22-ne-21f519039621');}
 for(const value of['unknown',null,undefined,'BE']){const i=structuredClone(base);i.caseQualification.authorityHolidayRegion=value;assert.equal(calc(i).outcome,'blocked');}
 delete base.caseQualification.authorityHolidayRegion;assert.equal(calc(base).outcome,'blocked');
 const court=from('M1-NE-COURT-ORDERED-BASE');court.inputDate='2027-05-26';court.deadlineDays=1;const r=calc(court);
 assert.equal(r.outcome,'calculated');if(r.outcome==='calculated')assert.equal(r.finalEnd,'2027-05-27');
 court.caseQualification.authorityHolidayRegion='leLanderon';assert.equal(calc(court).outcome,'blocked');
 const qualified=calc(from('M1-NE-OPENING-CLOSURE-UNCHANGED'));assert.equal(qualified.outcome,'calculated');
 if(qualified.outcome==='calculated'){assert.equal(qualified.provenance.openingResolution?.qualifiedOpeningDate,'2026-12-24');assert.deepEqual(qualified.provenance.openingResolution?.openingShiftDates,[]);}
});
test('AP23M3 VD raw post needs its2 current qualifications but never AI expectability',()=>{
 const input=from('M1-VD-POSTAL-BETTAG-3');const result=calc(input);assert.equal(result.outcome,'calculated');
 if(result.outcome==='calculated'){assert.equal(result.finalEnd,'2026-09-25');assert.equal(result.provenance.openingResolution?.inputMeaning,'physicalUnsignedPostalReceiptDate');assert.equal(result.provenance.openingResolution?.qualifiedOpeningDate,'2026-09-22');}
 for(const key of['unsignedPostalService','entryIntoRecipientSphere']){const i=structuredClone(input);delete i.caseQualification[key];assert.equal(calc(i).outcome,'blocked');}
 for(const value of[true,false,'unknown',null]){const i=structuredClone(input);i.caseQualification.expectedService=value;assert.equal(calc(i).outcome,'blocked');}
 const qualified=calc(from('M1-VD-QUALIFIED-SATURDAY-3'));assert.equal(qualified.outcome,'calculated');
 if(qualified.outcome==='calculated')assert.equal(qualified.provenance.openingResolution?.qualifiedOpeningDate,'2026-09-19');
});
test('AP23M3 VS longer instruction uses exact actual current days above10or30, without AI threshold',()=>{
 for(const id of['M1-VS-ADMIN-NOTICE-LONG-BASE','M1-VS-COURT-NOTICE-LONG-BASE']){
  const input=from(id);input.deadlineDays=11;input.caseQualification.ordinaryDays=10;input.caseQualification.actualInstructionDays=11;
  const result=calc(input);assert.equal(result.outcome,'calculated');if(result.outcome!=='calculated')throw Error(JSON.stringify(result));
  assert.equal(result.finalEnd,'2026-10-13');assert.deepEqual(result.provenance.durationResolution,{kind:'qualifiedVsLongerNoticeDays',actualInstructionDays:11,ordinaryDays:10});
  for(const edit of[(i:any)=>i.caseQualification.ordinaryDays=30,(i:any)=>i.caseQualification.actualInstructionDays=12,(i:any)=>delete i.caseQualification.actualInstructionDays]){
   const i=structuredClone(input);edit(i);assert.equal(calc(i).outcome,'blocked');
  }
 }
 const court=from('M1-VS-COURT-ORDERED-BASE');court.inputDate='2027-01-04';court.deadlineDays=1;
 const r=calc(court);assert.equal(r.outcome,'calculated');if(r.outcome==='calculated')assert.equal(r.finalEnd,'2027-01-06');
});
test('AP23M3 grace is not a new payment, statutory extension or shortening engine',()=>{
 for(const id of['M1-NE-ADMIN-EXTENSION-REFUSAL-3-BASE','M1-NE-COURT-EXTENSION-REFUSAL-3-BASE']){
  const i=from(id);i.caseQualification.refusalTiming='qualifiedRefusalOpeningBeforeOrOnOriginalExpiry';assert.equal(calc(i).outcome,'blocked');
 }
 for(const id of['M1-VD-VD-ADMIN-GRACE-3-BASE','M1-VD-VD-COURT-GRACE-3-BASE']){
  const i=from(id);i.caseQualification.originalDeadlineAtRefusalOpening='stillRunning';assert.equal(calc(i).outcome,'blocked');
 }
 const ordinary=from('M1-VD-VD-ADMIN-ORDERED-BASE');ordinary.deadlineDays=40;
 assert.equal(calc(ordinary).outcome,'calculated');
 // The composed current qualification is manual. No invented Art81 numeric discriminator.
 ordinary.caseQualification.orderLegalScope='article81InitialExceedsThirty';assert.equal(calc(ordinary).outcome,'blocked');
});
test('AP23M3 descriptors, symbols, hidden fields and fact objects are rejected without accessors',()=>{
 const input=from('M1-VD-POSTAL-BETTAG-3');let invoked=false;
 for(const key of['selection','inputDate','qualification','caseQualification']){
  const i={...input};Object.defineProperty(i,key,{enumerable:true,get(){invoked=true;return input[key];}});assert.equal(calc(i).outcome,'blocked');
 }
 for(const key of['openingMode','unsignedPostalService','hiddenUnknown']){
  const facts={...input.caseQualification};Object.defineProperty(facts,key,{enumerable:true,get(){invoked=true;return true;}});assert.equal(calc({...input,caseQualification:facts}).outcome,'blocked');
 }
 assert.equal(invoked,false);
 for(const key of['openingMode','unsignedPostalService','hiddenUnknown']){
  const facts={...input.caseQualification};Object.defineProperty(facts,key,{enumerable:false,value:input.caseQualification[key]??true});assert.equal(calc({...input,caseQualification:facts}).outcome,'blocked');
 }
 const top={...input};Object.defineProperty(top,'hiddenTop',{enumerable:false,value:true});assert.equal(calc(top).outcome,'blocked');
 for(const facts of[Object.create(input.caseQualification),{...input.caseQualification,[Symbol('unknown')]:true},[],{...input.caseQualification,unsignedPostalService:{qualified:true}}])assert.equal(calc({...input,caseQualification:facts}).outcome,'blocked');
 for(const context of[{...runtime.administrativeContext},Object.create(runtime.administrativeContext),JSON.parse(JSON.stringify(runtime.administrativeContext))])assert.equal(calc(input,context).outcome,'blocked');
});
test('AP23M3 optional VD facts use exact Input10 finite vocabulary in the already qualified branch',()=>{
 const props=JSON.parse(readFileSync(new URL('../../schemas/implementation/ap23m3/administrative-input-v10.schema.json',import.meta.url),'utf8')).properties.facts.properties;
 let checked=0;for(const p of catalog.paths.filter(p=>'contractFamily'in p&&p.contractFamily==='qualifiedDayProcedureV10'&&p.openingPolicy.kind==='vdQualifiedOrUnsignedPost')){
  const input:any=administrativeInput17(catalog,p.pathId,'2026-10-02',p.duration.kind==='statutoryDays'?p.duration.value:10);
  for(const key of['unsignedPostalService','entryIntoRecipientSphere'])for(const value of props[key].enum){
   const i=structuredClone(input);i.caseQualification[key]=value;assert.equal(calc(i).outcome,'calculated',p.pathId+'/'+key+'/'+String(value));checked++;
  }
  for(const key of['unsignedPostalService','entryIntoRecipientSphere'])for(const value of[true,0,'false',{},[],undefined,NaN]){
   const i=structuredClone(input);i.caseQualification[key]=value;assert.equal(calc(i).outcome,'blocked');checked++;
  }
 }assert.equal(checked,418);
});
test('AP23M3 parameter metadata cannot replace current case facts or issue export',()=>{
 const context=runtime.administrativeContext;
 assert.equal(resolveAdministrativeCalendarV10(context,'ne-admin-ordered'),undefined);
 assert.equal(resolveAdministrativeCalendarV10(context,'ne-admin-ordered',{authorityHolidayRegion:'leLanderon'})?.calendarId,'ap22-ne-21f519039621');
 assert.ok(resolveAdministrativeSuspensionV10(context,'vs-court-ordered'));
 assert.equal(resolveAdministrativeCalendarV10({...context},'ne-admin-ordered',{authorityHolidayRegion:'leLanderon'}),undefined);
 const input=from('M1-NE-ADMIN-ORDERED-BASE');input.caseQualification={};assert.equal(calc(input).outcome,'blocked');
});
