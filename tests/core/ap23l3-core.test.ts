// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ap23l3CandidateRuntime as runtime} from '../../src/release/ap23l3CandidateData';
import {ap23k3CandidateRuntime as oldRuntime} from '../../src/release/ap23k3CandidateData';
import {calculateAdministrativeDeadline} from '../../src/core/administrativeDeadline';
import {resolveAdministrativeCalendarV9,resolveAdministrativeSuspensionV9} from '../../src/core/administrativeDeadlineV9';
import {administrativeInput15} from './ap23k3Fixtures';
import {acceptedL2,administrativeInput16,administrativeReferenceInput16,buildSyntheticFormat16,encode16} from './ap23l3Fixtures';
import {createFormat16CalculationData} from '../../src/core/format16CalculationData';
import type {AdministrativePathV9} from '../../src/core/administrativeTypesV9';
const catalog=runtime.administrativeContext.administrativeCatalog;
const calc=(input:any,context:unknown=runtime.administrativeContext)=>calculateAdministrativeDeadline(input,context);
const from=(id:string):any=>administrativeReferenceInput16(catalog,acceptedL2.results.find((row:any)=>row.id===id).input);
for(const row of acceptedL2.results)test('AP23L3 accepted L2 native '+row.id,()=>{
 const r=calc(administrativeReferenceInput16(catalog,row.input));
 if(row.actual.outcome==='datedResearchValue'){
  assert.equal(r.outcome,'calculated');if(r.outcome!=='calculated')throw Error(JSON.stringify(r));
  assert.equal(r.finalEnd,row.actual.end);assert.equal(r.provisionalEnd,row.actual.nominalEnd);assert.equal(r.ordinaryStart,row.actual.ordinaryStart);
  assert.equal(r.deadlineStart,row.actual.firstCountedDay);assert.equal(r.skippedCalendarDays,row.actual.skippedDays);
  assert.equal(r.provenance.openingResolution?.qualifiedOpeningDate,row.actual.legalOpening);
  assert.deepEqual(r.provenance.openingResolution?.openingShiftDates,row.actual.provenance.openingShiftDates);
  assert.deepEqual(r.provenance.evaluatedNormSegments,row.actual.provenance.evaluatedNormSegments);
  assert.deepEqual(r.provenance.proceduralCalendarSupplementResolution?.shiftedDates,row.actual.provenance.supplementDates);
  assert.equal(r.referenceOnly,true);assert.ok(Object.isFrozen(r)&&Object.isFrozen(r.provenance));
 }else{assert.equal(r.outcome,'blocked');assert.equal('finalEnd'in r,false);}
 assert.equal(r.calendarExportAllowed,false);
});
for(const row of acceptedL2.syntheticProbeResults)test('AP23L3 accepted technical synthetic '+row.id,()=>{
 const r=calc(administrativeReferenceInput16(catalog,row.input));if(row.actual.outcome==='datedResearchValue'){assert.equal(r.outcome,'calculated');if(r.outcome!=='calculated')throw Error(JSON.stringify(r));assert.equal(r.finalEnd,row.actual.end);}else{assert.equal(r.outcome,'blocked');assert.equal('finalEnd'in r,false);}assert.equal(r.calendarExportAllowed,false);
});
test('AP23L3 all165 preserved paths retain every native mathematical result',()=>{
 let checked=0;for(const p of oldRuntime.administrativeContext.administrativeCatalog.paths){
  const q:any=oldRuntime.administrativeContext.administrativeCatalog.qualificationPolicies.find(q=>q.pathId===p.pathId),days=p.duration.kind==='statutoryDays'?p.duration.value:Math.max(7,p.duration.minimum);
  const override=['qualifiedDayProcedureV6','qualifiedDayProcedureV7'].includes(q.mode)?Object.fromEntries(q.requirements.map((r:any)=>[r.key,r.oneOf?r.oneOf[0]:r.value])):undefined;
  const input=administrativeInput15(oldRuntime.administrativeContext.administrativeCatalog,p.pathId,'2026-10-02',days,p.stages[0],override),a=calc(input,oldRuntime.administrativeContext),b=calc(input);
  assert.equal(a.outcome,'calculated',p.pathId);assert.equal(b.outcome,'calculated',p.pathId);if(a.outcome!=='calculated'||b.outcome!=='calculated')throw Error(p.pathId);
  for(const key of['ordinaryStart','deadlineStart','provisionalEnd','finalEnd','countedDates','skippedCalendarDays','encounteredPeriodIds','shiftReasonKeys','shiftedHolidayIds','startShiftApplied']as const)assert.deepEqual(b[key],a[key],p.pathId+'/'+key);
  assert.equal(b.calendarExportAllowed,false);checked++;
 }assert.equal(checked,165);
});
test('AP23L3 all336 current new-path facts remain mandatory',()=>{
 let checked=0;for(const p of catalog.paths.filter(p=>'contractFamily'in p&&p.contractFamily==='qualifiedDayProcedureV9')){
  const example=acceptedL2.results.find((r:any)=>r.input.path===p.pathId&&r.actual.outcome==='datedResearchValue'),q:any=catalog.qualificationPolicies.find(q=>q.pathId===p.pathId);assert.ok(example);
  for(const req of q.requirements){const i:any=administrativeReferenceInput16(catalog,example.input);delete i.caseQualification[req.key];const r=calc(i);assert.equal(r.outcome,'blocked',p.pathId+'/'+req.key);if(r.outcome==='blocked')assert.ok(r.blockReasonKeys.includes('administrative.'+req.reason));assert.equal(r.calendarExportAllowed,false);checked++;}
 }assert.equal(checked,336);
});
test('AP23L3 AI tracks only the qualified current receipt branch',()=>{
 const i=from('L1-AI-R22');for(const key of['expectedService','entryIntoSphere','receiptHolidayRegime']){const changed=structuredClone(i);delete changed.caseQualification[key];assert.equal(calc(changed).outcome,'blocked');}
 const q=calc(from('L1-AI-R21'));assert.equal(q.outcome,'calculated');if(q.outcome!=='calculated')return;assert.equal(q.provenance.openingResolution?.qualifiedOpeningDate,'2026-09-19');assert.deepEqual(q.provenance.openingResolution?.openingShiftDates,[]);
 const t=calc(i);assert.equal(t.outcome,'calculated');if(t.outcome!=='calculated')return;assert.equal(t.provenance.openingResolution?.inputMeaning,'physicalTrackingReceiptDate');assert.ok(t.provenance.openingResolution!.openingShiftDates.length>0);
});
const input9FactVocabulary=JSON.parse(readFileSync(new URL('../../schemas/candidates/ap23l2/administrative-input-v9.schema.json',import.meta.url),'utf8')).properties.facts.properties as Record<string,{enum:unknown[]}>;
const trackingFactKeys=['expectedService','entryIntoSphere','receiptHolidayRegime']as const;
const input9Accepts=(key:string,value:unknown):boolean=>input9FactVocabulary[key]!.enum.some(allowed=>allowed===value);
const trackingPaths=catalog.paths.filter((p):p is AdministrativePathV9=>'contractFamily'in p&&p.contractFamily==='qualifiedDayProcedureV9'&&p.openingPolicy.kind==='aiQualifiedOrTrackingPost');
function qualifiedTrackingInput(pathId:string):any{
 const example=acceptedL2.results.find((row:any)=>row.input.path===pathId&&row.actual.outcome==='datedResearchValue');assert.ok(example);
 const i:any=administrativeReferenceInput16(catalog,example.input);i.caseQualification.openingMode='qualifiedLegalOpening';
 for(const key of trackingFactKeys)delete i.caseQualification[key];return i;
}
test('AP23L3 optional tracking facts use exactly the accepted Input9 vocabulary on all16 AI branches',()=>{
 assert.equal(trackingPaths.length,16);let checked=0;
 for(const path of trackingPaths){
  const i=qualifiedTrackingInput(path.pathId),base=calc(i);assert.equal(base.outcome,'calculated');if(base.outcome!=='calculated')throw Error(path.pathId);
  for(const key of trackingFactKeys)for(const value of input9FactVocabulary[key]!.enum){
   const changed=structuredClone(i);changed.caseQualification[key]=value;const result=calc(changed);
   assert.equal(result.outcome,'calculated',path.pathId+'/'+key+'/'+String(value));if(result.outcome!=='calculated')throw Error(JSON.stringify(result));
   assert.equal(result.finalEnd,base.finalEnd);assert.equal(result.provisionalEnd,base.provisionalEnd);
   assert.deepEqual(result.provenance.openingResolution,base.provenance.openingResolution);
   assert.equal(result.calendarExportAllowed,false);assert.equal(changed.caseQualification[key],value);checked++;
  }
 }
 assert.equal(checked,208);
});
test('AP23L3 malformed irrelevant tracking facts cannot bypass the finite Input9 types or values',()=>{
 const values:unknown[]=['invalid-non-boolean','true','false','unverified',true,false,0,1,1.5,NaN,Infinity,-Infinity,undefined,[],{},new Boolean(true)];let checked=0;
 for(const path of trackingPaths)for(const key of trackingFactKeys)for(const value of values){
  if(input9Accepts(key,value))continue;
  const i=qualifiedTrackingInput(path.pathId);i.caseQualification[key]=value;const r=calc(i);
  assert.equal(r.outcome,'blocked',path.pathId+'/'+key+'/'+String(value));if(r.outcome==='blocked')assert.deepEqual(r.blockReasonKeys,['administrative.inputContractInvalid']);
  assert.equal('finalEnd'in r,false);assert.equal(r.calendarExportAllowed,false);checked++;
 }
 assert.equal(checked,736);
});
test('AP23L3 structurally valid tracking diagnostics cannot replace positive current branch qualification',()=>{
 let checked=0;for(const path of trackingPaths){
  if(path.openingPolicy.kind!=='aiQualifiedOrTrackingPost')throw Error(path.pathId);
  const i=qualifiedTrackingInput(path.pathId);i.caseQualification.openingMode=path.openingPolicy.trackingMode;
  for(const req of path.openingPolicy.trackingRequirements)i.caseQualification[req.key]=req.value;
  for(const req of path.openingPolicy.trackingRequirements)for(const value of input9FactVocabulary[req.key]!.enum){
   if(value===req.value)continue;
   const changed=structuredClone(i);changed.caseQualification[req.key]=value;const r=calc(changed);assert.equal(r.outcome,'blocked');
   if(r.outcome==='blocked')assert.deepEqual(r.blockReasonKeys,['administrative.'+req.reason]);assert.equal(r.calendarExportAllowed,false);checked++;
  }
 }
 assert.equal(checked,160);
});
test('AP23L3 every mandatory fact remains closed and only the three conditional tracking facts can be optional',()=>{
 let checked=0;for(const path of catalog.paths.filter(p=>'contractFamily'in p&&p.contractFamily==='qualifiedDayProcedureV9')){
  const example=acceptedL2.results.find((r:any)=>r.input.path===path.pathId&&r.actual.outcome==='datedResearchValue'),i:any=administrativeReferenceInput16(catalog,example.input);
  const policy:any=catalog.qualificationPolicies.find(p=>p.pathId===path.pathId);assert.ok(policy);
  const allowed=new Set(policy.requirements.map((req:any)=>req.key));
  if(path.openingPolicy.kind==='aiQualifiedOrTrackingPost')for(const req of path.openingPolicy.trackingRequirements)allowed.add(req.key);
  if(path.duration.kind==='qualifiedLongerNoticeDays')allowed.add(path.duration.valueFact);
  for(const req of policy.requirements){assert.ok(input9FactVocabulary[req.key]);for(const value of ['not-in-input9',1.5,NaN,Infinity,{},[],null,undefined]){
   assert.equal(input9Accepts(req.key,value),value===null);const changed=structuredClone(i);changed.caseQualification[req.key]=value;assert.equal(calc(changed).outcome,'blocked',path.pathId+'/'+req.key);checked++;
  }}
  for(const key of Object.keys(input9FactVocabulary).filter(key=>!allowed.has(key))){const changed=structuredClone(i);changed.caseQualification[key]=input9FactVocabulary[key]!.enum[0];assert.equal(calc(changed).outcome,'blocked',path.pathId+'/'+key);checked++;}
  for(const key of ['unknownFact','statedDuration','__extra']){const changed=structuredClone(i);changed.caseQualification[key]=true;assert.equal(calc(changed).outcome,'blocked');checked++;}
 }
 assert.ok(checked>2900);
});
test('AP23L3 current durations reject noninteger nonfinite out-of-range and wrong-type facts',()=>{
 const values:unknown[]=[0,-1,1.5,NaN,Infinity,-Infinity,Number.MAX_SAFE_INTEGER+1,'31',true,null,undefined];let checked=0;
 for(const pathId of ['ai-admin-ordered','sz-admin-provisional-opposition','ai-internal-notice-long','ai-court-notice-long']){
  const example=acceptedL2.results.find((row:any)=>row.input.path===pathId&&row.actual.outcome==='datedResearchValue');assert.ok(example);
  const i:any=administrativeReferenceInput16(catalog,example.input);for(const value of values){const changed=structuredClone(i);changed.deadlineDays=value;assert.equal(calc(changed).outcome,'blocked',pathId+'/days/'+String(value));checked++;}
  if(pathId.endsWith('-long'))for(const key of ['actualLongerInstructionDays','ordinaryStatutoryDays'])for(const value of values){const changed=structuredClone(i);changed.caseQualification[key]=value;assert.equal(calc(changed).outcome,'blocked',pathId+'/'+key+'/'+String(value));checked++;}
 }
 assert.equal(checked,88);
});
test('AP23L3 irrelevant tracking accessors symbols inherited keys and objects stay rejected without invocation',()=>{
 const i=qualifiedTrackingInput('ai-admin-ordered');let invoked=false;
 for(const key of trackingFactKeys){const f:any={...i.caseQualification};Object.defineProperty(f,key,{enumerable:true,get(){invoked=true;return true;}});assert.equal(calc({...i,caseQualification:f}).outcome,'blocked');}
 assert.equal(invoked,false);
 for(const facts of [Object.create(i.caseQualification),{...i.caseQualification,[Symbol('extra')]:true},{...i.caseQualification,extra:true}])assert.equal(calc({...i,caseQualification:facts}).outcome,'blocked');
 for(const [key,value]of [['hiddenUnknown',true],['expectedService','invalid-non-boolean'],['expectedService',true],['authorityCanton','AI']]as const){const facts={...i.caseQualification};Object.defineProperty(facts,key,{value,enumerable:false});assert.equal(calc({...i,caseQualification:facts}).outcome,'blocked');}
});
test('AP23L3 longer notice is linked to actual current value and current base',()=>{
 const p=catalog.paths.find(p=>p.pathId==='ai-internal-notice-long')!,example=acceptedL2.results.find((r:any)=>r.input.path===p.pathId&&r.actual.outcome==='datedResearchValue');
 const i:any=administrativeReferenceInput16(catalog,example.input);assert.equal(calc(i).outcome,'calculated');
 for(const edit of[(v:any)=>v.deadlineDays++,(v:any)=>delete v.caseQualification.actualLongerInstructionDays,(v:any)=>v.caseQualification.ordinaryStatutoryDays=7,(v:any)=>v.caseQualification.longerInstructionQualification='unknown',(v:any)=>{v.deadlineDays=30;v.caseQualification.actualLongerInstructionDays=30;}]){const v=structuredClone(i);edit(v);assert.equal(calc(v).outcome,'blocked');}
 const r=calc(i);if(r.outcome==='calculated'){assert.equal(r.provenance.durationResolution?.actualLongerInstructionDays,i.deadlineDays);assert.equal(r.provenance.durationResolution?.ordinaryStatutoryDays,i.caseQualification.ordinaryStatutoryDays);assert.ok(r.provenance.durationPolicySha256);}
});
test('AP23L3 Schwyz supplement has no fabricated physical holiday identity',()=>{
 const r=calc(from('L1-SZ-R09'));assert.equal(r.outcome,'calculated');if(r.outcome!=='calculated')throw Error(JSON.stringify(r));
 const s=r.provenance.proceduralCalendarSupplementResolution;assert.equal(s?.kind,'szSchwyzMartinstag');assert.deepEqual(s?.boundDates.map(d=>d.date),['2026-11-11','2027-11-11']);assert.deepEqual(s?.shiftedDates,['2026-11-11']);
 assert.ok(r.shiftReasonKeys.includes('administrativeProceduralSupplement'));assert.ok(r.shiftedHolidayIds.every(id=>!id.toLowerCase().includes('martin')));
 const i=from('L1-SZ-R09');i.inputDate='2026-11-02';const interior=calc(i);assert.equal(interior.outcome,'calculated');if(interior.outcome==='calculated'){assert.equal(interior.finalEnd,'2026-11-12');assert.equal(interior.skippedCalendarDays,0);assert.deepEqual(interior.provenance.proceduralCalendarSupplementResolution?.shiftedDates,[]);}
});
test('AP23L3 norm time and window cover physical input through complete end chain',()=>{
 const i=from('L1-SZ-R01');i.inputDate='2027-06-25';i.deadlineDays=20;const r=calc(i);assert.equal(r.outcome,'calculated');if(r.outcome!=='calculated')return;
 assert.deepEqual(r.provenance.evaluatedNormSegments?.map(s=>s.interval),[{from:'2026-08-29',to:'2027-06-30'},{from:'2027-07-01',to:'2027-12-31'}]);
 for(const date of['2026-08-28','2027-12-31']){const q=from('L1-AI-R22');q.inputDate=date;const b=calc(q);assert.equal(b.outcome,'blocked');assert.equal('finalEnd'in b,false);assert.equal(b.calendarExportAllowed,false);}
});
test('AP23L3 resolvers expose metadata but cannot confirm current facts',()=>{
 assert.ok(resolveAdministrativeCalendarV9(runtime.administrativeContext,'sz-admin-ordered'));assert.ok(resolveAdministrativeSuspensionV9(runtime.administrativeContext,'ai-court-ordered'));
 const i=from('L1-SZ-R01');i.caseQualification={};assert.equal(calc(i).outcome,'blocked');
 assert.equal(resolveAdministrativeCalendarV9({...runtime.administrativeContext},'sz-admin-ordered'),undefined);
});
test('AP23L3 copied contexts inherited/accessor facts and extra roles are not authority',()=>{
 const i=from('L1-AI-R22');for(const context of[{...runtime.administrativeContext},Object.create(runtime.administrativeContext),JSON.parse(JSON.stringify(runtime.administrativeContext)),{formatVersion:'16.0.0',approved:true}]){assert.equal(calc(i,context).outcome,'blocked');}
 let invoked=false;const getter:any={...i};Object.defineProperty(getter,'selection',{enumerable:true,get(){invoked=true;return i.selection;}});assert.equal(calc(getter).outcome,'blocked');assert.equal(invoked,false);
 const f:any={...i.caseQualification};Object.defineProperty(f,'expectedService',{enumerable:true,get(){invoked=true;return true;}});assert.equal(calc({...i,caseQualification:f}).outcome,'blocked');assert.equal(invoked,false);
 for(const facts of[Object.create(i.caseQualification),{...i.caseQualification,[Symbol('extra')]:true},{...i.caseQualification,expectedService:new Boolean(true)},{...i.caseQualification,extra:true}])assert.equal(calc({...i,caseQualification:facts}).outcome,'blocked');
 for(const extra of[{role:'other'},{areaFacts:{}},{previousResult:{finalEnd:'2026-09-30'}},{calendarExportAllowed:true}])assert.equal(calc({...i,...extra}).outcome,'blocked');
});
test('AP23L3 future approved test shape remains explicitly synthetic',()=>{
 const f=buildSyntheticFormat16('approved'),r=createFormat16CalculationData(encode16(f.manifest),f.files);assert.equal(f.manifest.extensions['steimer.synthetic-test'].humanApproval,false);
 const a=calc(administrativeInput16(r.administrativeContext.administrativeCatalog,'ai-admin-ordered','2026-10-02',7),r.administrativeContext);assert.equal(a.outcome,'calculated');if(a.outcome!=='calculated')throw Error(JSON.stringify(a));assert.equal(a.referenceOnly,false);assert.equal(a.calendarExportAllowed,true);
});
