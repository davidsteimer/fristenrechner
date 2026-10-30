// SPDX-License-Identifier: AGPL-3.0-only
// Independent additive comparison with the actual previous native runtime.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createFormat14CalculationData} from '../../src/core/format14CalculationData';
import {createFormat13CalculationData} from '../../src/core/format13CalculationData';
import {calculateCalendarBoundDeadline} from '../../src/core/calculateCalendarBoundDeadline';
import {calculateSocialDeadline} from '../../src/core/socialDeadline';
import {calculateSpecialDeadline} from '../../src/core/calculateSpecialDeadline';
import {calculateAdministrativeDeadline} from '../../src/core/administrativeDeadline';
import {buildSyntheticFormat14,encode14,administrativeInput14} from './ap23j3Fixtures';
import {buildSyntheticFormat13,encode13,administrativeInput13} from './ap23i3Fixtures';
import type {CalculationData,CalculationInput} from '../../src/core/types';
import type {SocialDeadlineInput} from '../../src/core/socialTypes';

const local=buildSyntheticFormat14();
const current=createFormat14CalculationData(encode14(local.manifest),local.files,{mode:'localReference'});
const previous=buildSyntheticFormat13();
const old=createFormat13CalculationData(encode13(previous.manifest),previous.files,{mode:'localReference'});
const synthetic=buildSyntheticFormat14('approved');
const approved=createFormat14CalculationData(encode14(synthetic.manifest),synthetic.files);
const input=(profileId:string,inputDate='2026-10-02',deadlineDays=10):CalculationInput=>({
  profileId,inputDate,inputDateSemantics:'legallyRelevantDeliveryOrEventDate',deadlineDays,
  calendarId:'be-public-holidays',holidayAnchorCandidates:['BE'],
  confirmations:profileId==='vrpg-be'?{specialLawChecked:true}:{},
  selectors:profileId==='zpo'?{procedureVariant:'summary'}:['bgg','vwvg'].includes(profileId)?{subjectMatter:'interimMeasures'}:{}
});
const location=(profileId:string,canton:string)=>({
  role:profileId==='zpo'?'court'as const:'partyWithoutRepresentative'as const,canton,
  areaFacts:canton==='AI'?{'AI-RTG-INNER-ADDITIONAL':false}:canton==='NE'?{'NE-LANDERON-ADDITIONAL':false}:{}
});
const dates=(r:any)=>({outcome:r.outcome,finalEnd:r.finalEnd,provisionalEnd:r.provisionalEnd,
  deadlineStart:r.deadlineStart,legallyRelevantDate:r.legallyRelevantDate,
  january:r.januaryComparison?.outcome,blockReasonKeys:r.blockReasonKeys});

test('AP23J3 all104 federal canton/profile contexts preserve actual native13 dates and identity boundaries',()=>{
  const cantons='ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' ');
  let comparisons=0;
  for(const profile of ['stpo','zpo','bgg','vwvg'])for(const canton of cantons){
    const v=input(profile),place=location(profile,canton);
    const r=calculateCalendarBoundDeadline(v,place,current.data,current.calendarRuntime);
    const prior=calculateCalendarBoundDeadline(v,place,old.data,old.calendarRuntime);
    assert.deepEqual(dates(r),dates(prior),profile+'/'+canton);
    assert.equal(r.outcome,'calculated',profile+'/'+canton);
    assert.equal(r.calendarExportAllowed,false);
    assert.equal(r.referenceOnly,true);
    assert.equal(calculateCalendarBoundDeadline(v,place,{...current.data},current.calendarRuntime).outcome,'blocked');
    assert.equal(calculateCalendarBoundDeadline(v,place,current.data,{...current.calendarRuntime}).outcome,'blocked');
    comparisons++;
  }
  assert.equal(comparisons,104);
});

test('AP23J3 keeps the four January comparisons and explicit regional qualification boundaries',()=>{
  for(const[profile,canton]of [['stpo','SG'],['bgg','SG'],['vwvg','SG'],['stpo','SH']]as const){
    const v=input(profile,'2029-01-01',1),place=location(profile,canton);
    const r=calculateCalendarBoundDeadline(v,place,current.data,current.calendarRuntime);
    assert.deepEqual(dates(r),dates(calculateCalendarBoundDeadline(v,place,old.data,old.calendarRuntime)));
    assert.equal(r.outcome,'blocked');
    assert.equal(r.januaryComparison?.outcome,'different');
    assert.equal(r.calendarExportAllowed,false);
  }
  for(const canton of ['AI','NE']){
    const r=calculateCalendarBoundDeadline(input('stpo'),{role:'partyWithoutRepresentative',canton,areaFacts:{}},current.data,current.calendarRuntime);
    assert.equal(r.outcome,'blocked');
    assert.equal(r.calendarExportAllowed,false);
  }
});

function socialInput(data:CalculationData,bindingId:string,date='2026-09-16'):SocialDeadlineInput{
  const catalog=data.socialProcedureCatalogs!.get('ch-social-procedures')!;
  const binding=catalog.cantonalBindings.find(b=>b.bindingId===bindingId)!;
  const rule=catalog.federalRules.find(r=>r.ruleId===binding.ruleId)!,route=binding.contextRoutes[0]!;
  const selectors=new Set([...rule.normBindings,...binding.normBindings].map(n=>n.temporalSelector));
  return{ruleId:rule.ruleId,bindingId,contextRouteId:route.contextRouteId,procedureContextCanton:'BE',
    caseFacts:Object.fromEntries(route.requiredFacts.map(f=>[f.factKey,f.allowedValues[0]])),qualificationBasis:'confirmed-case-facts',
    matter:rule.matter,triggerKind:rule.triggerKind,notificationChannel:rule.notificationChannels[0]!,notificationConfirmed:true,legalTriggerDate:date,
    ...(selectors.has('jurisdictionReferenceDate')?{jurisdictionReferenceDate:date}:{}),
    ...(selectors.has('procedureStartDate')?{procedureStartDate:date}:{}),
    holidayResolution:{status:'resolved',calendarBindingId:'be-party',anchors:[{role:'party',canton:'BE',spatialScopeId:'BE'}]},
    ...(rule.calculation.durationInputId?{days:10}:{})};
}

test('AP23J3 all50 Bern social bindings preserve native13 outcomes without widening canton or year coverage',()=>{
  const catalog=current.data.socialProcedureCatalogs!.get('ch-social-procedures')!;
  assert.equal(catalog.cantonalBindings.length,50);
  assert.equal(new Set(catalog.cantonalBindings.map(b=>b.ruleId)).size,44);
  for(const binding of catalog.cantonalBindings){
    const v=socialInput(current.data,binding.bindingId),prior=calculateSocialDeadline(v,old.data);
    assert.equal(prior.outcome,'calculated',binding.bindingId);
    for(const runtime of [current,approved]){
      const r=calculateSocialDeadline(v,runtime.data);
      assert.equal(r.outcome,'calculated',binding.bindingId+':'+r.blockReasonKeys);
      assert.equal(r.finalDeadline?.date,prior.finalDeadline?.date);
      assert.equal(r.socialEvidence?.releaseId,runtime.data.releaseId);
      assert.equal(calculateSocialDeadline({...v,procedureContextCanton:'NW'},runtime.data).outcome,'blocked');
      assert.equal(calculateSocialDeadline(socialInput(runtime.data,binding.bindingId,'2028-01-02'),runtime.data).outcome,'blocked');
      assert.equal(calculateSocialDeadline(v,{...runtime.data}).outcome,'blocked');
    }
  }
});

test('AP23J3 preserves the genuine Bern special route and rejects generic ATSG bypass',()=>{
  const regime=current.data.specialRegimeCatalogs.get('vrpg-be-special-regimes-rest')!.regimes.find(r=>r.regimeId==='vrpg-be-general')!;
  const v={profileId:'vrpg-be',regimeId:regime.regimeId,ruleId:'VRPGBE-SPEC-REL-GENERAL-001',dateValues:{eventDate:'2026-09-04'},
    localTimeValues:{},integerValues:{deadlineDays:10},calendarProfileId:regime.calendarProfileId!,suspensionProfileId:regime.suspensionProfileId!,
    filingProfileId:regime.filingProfileId!,overrideConfirmations:[]};
  assert.equal(calculateSpecialDeadline(v,current.data).finalDeadline?.date,'2026-09-14');
  assert.equal(calculateSpecialDeadline(v,current.data).finalDeadline?.date,calculateSpecialDeadline(v,old.data).finalDeadline?.date);
  assert.equal(calculateSpecialDeadline(v,{...current.data}).outcome,'blocked');
  assert.deepEqual(calculateSpecialDeadline({...v,ruleId:'ATSG-SPEC-REL-060'},current.data).blockReasonKeys,['socialResolverRequired']);
});

test('AP23J3 all113 prior administrative paths preserve native13 outcomes across opening summer winter and year boundaries',()=>{
  const oldCatalog=old.administrativeContext.administrativeCatalog;
  const newCatalog=current.administrativeContext.administrativeCatalog;
  assert.equal(oldCatalog.paths.length,113);
  let comparisons=0;
  for(const path of oldCatalog.paths)for(const date of ['2026-10-02','2026-12-23','2027-03-19','2027-07-10','2027-12-30']){
    const days=path.duration.kind==='authorityOrderedDays'?10:undefined;
    const r=calculateAdministrativeDeadline(administrativeInput14(newCatalog,path.pathId,date,days),current.administrativeContext);
    const prior=calculateAdministrativeDeadline(administrativeInput13(oldCatalog,path.pathId,date,days),old.administrativeContext);
    assert.deepEqual({...r,provenance:undefined},{...prior,provenance:undefined},path.pathId+'/'+date);
    if(r.provenance&&prior.provenance){
      assert.deepEqual({...r.provenance,releaseId:undefined},{...prior.provenance,releaseId:undefined},path.pathId+'/'+date+'/legal provenance');
    }
    assert.equal(r.calendarExportAllowed,false);
    comparisons++;
  }
  assert.equal(comparisons,565);
});


