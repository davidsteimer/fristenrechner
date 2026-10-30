// SPDX-License-Identifier: AGPL-3.0-only
// New Format-11 dispatch must preserve existing federal and social semantics.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createFormat11CalculationData } from '../../src/core/format11CalculationData';
import { createFormat10CalculationData } from '../../src/core/format10CalculationData';
import { calculateCalendarBoundDeadline } from '../../src/core/calculateCalendarBoundDeadline';
import { calculateSocialDeadline } from '../../src/core/socialDeadline';
import { calculateSpecialDeadline } from '../../src/core/calculateSpecialDeadline';
import { buildSyntheticFormat11, encode11 } from './ap23g3Fixtures';
import { buildSyntheticFormat10, encode10 } from './ap23f3Fixtures';
import type { CalculationData, CalculationInput } from '../../src/core/types';
import type { SocialDeadlineInput } from '../../src/core/socialTypes';

const local=buildSyntheticFormat11(),c=createFormat11CalculationData(encode11(local.manifest),local.files,{mode:'localReference'});
const previous=buildSyntheticFormat10(),old=createFormat10CalculationData(encode10(previous.manifest),previous.files,{mode:'localReference'});
const synthetic=buildSyntheticFormat11('approved'),a=createFormat11CalculationData(encode11(synthetic.manifest),synthetic.files);
const input=(profileId:string,inputDate='2026-10-02',deadlineDays=10):CalculationInput=>({
  profileId,inputDate,inputDateSemantics:'legallyRelevantDeliveryOrEventDate',deadlineDays,calendarId:'be-public-holidays',
  holidayAnchorCandidates:['BE'],confirmations:profileId==='vrpg-be'?{specialLawChecked:true}:{},
  selectors:profileId==='zpo'?{procedureVariant:'summary'}:['bgg','vwvg'].includes(profileId)?{subjectMatter:'interimMeasures'}:{}
});
const location=(profileId:string,canton:string)=>({role:profileId==='zpo'?'court'as const:'partyWithoutRepresentative'as const,canton,
  areaFacts:canton==='AI'?{'AI-RTG-INNER-ADDITIONAL':false}:canton==='NE'?{'NE-LANDERON-ADDITIONAL':false}:{}});
const dates=(r:any)=>({outcome:r.outcome,finalEnd:r.finalEnd,provisionalEnd:r.provisionalEnd,deadlineStart:r.deadlineStart,
  legallyRelevantDate:r.legallyRelevantDate,january:r.januaryComparison?.outcome,blockReasonKeys:r.blockReasonKeys});

test('AP23G3 all26 federal calendar contexts retain native10 results in native11',()=>{
  const cantons='ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' ');
  let pairs=0;
  for(const profile of['stpo','zpo','bgg','vwvg'])for(const canton of cantons){
    const v=input(profile),place=location(profile,canton),r=calculateCalendarBoundDeadline(v,place,c.data,c.calendarRuntime),prior=calculateCalendarBoundDeadline(v,place,old.data,old.calendarRuntime);
    assert.deepEqual(dates(r),dates(prior),`${profile}/${canton}`);assert.equal(r.outcome,'calculated',`${profile}/${canton}`);
    assert.equal(r.calendarExportAllowed,false);assert.equal(r.referenceOnly,true);pairs++;
    assert.equal(calculateCalendarBoundDeadline(v,place,{...c.data},c.calendarRuntime).outcome,'blocked');
    assert.equal(calculateCalendarBoundDeadline(v,place,c.data,{...c.calendarRuntime}).outcome,'blocked');
  }
  assert.equal(pairs,104);
});

test('AP23G3 January comparison and concrete regional facts stay qualified in native11',()=>{
  for(const[profile,canton]of[['stpo','SG'],['bgg','SG'],['vwvg','SG'],['stpo','SH']]as const){
    const v=input(profile,'2029-01-01',1),place=location(profile,canton);
    const r=calculateCalendarBoundDeadline(v,place,c.data,c.calendarRuntime),prior=calculateCalendarBoundDeadline(v,place,old.data,old.calendarRuntime);
    assert.deepEqual(dates(r),dates(prior));assert.equal(r.outcome,'blocked');assert.equal(r.januaryComparison?.outcome,'different');assert.equal(r.calendarExportAllowed,false);
  }
  for(const canton of['AI','NE']){
    const r=calculateCalendarBoundDeadline(input('stpo'),{role:'partyWithoutRepresentative',canton,areaFacts:{}},c.data,c.calendarRuntime);
    assert.equal(r.outcome,'blocked');assert.equal(r.calendarExportAllowed,false);
  }
});

function socialInput(data:CalculationData,bindingId:string,date='2026-09-16'):SocialDeadlineInput{
  const catalog=data.socialProcedureCatalogs!.get('ch-social-procedures')!,binding=catalog.cantonalBindings.find(b=>b.bindingId===bindingId)!;
  const rule=catalog.federalRules.find(r=>r.ruleId===binding.ruleId)!,route=binding.contextRoutes[0]!;
  const selectors=new Set([...rule.normBindings,...binding.normBindings].map(n=>n.temporalSelector));
  return{ruleId:rule.ruleId,bindingId,contextRouteId:route.contextRouteId,procedureContextCanton:'BE',
    caseFacts:Object.fromEntries(route.requiredFacts.map(f=>[f.factKey,f.allowedValues[0]])),qualificationBasis:'confirmed-case-facts',
    matter:rule.matter,triggerKind:rule.triggerKind,notificationChannel:rule.notificationChannels[0]!,notificationConfirmed:true,legalTriggerDate:date,
    ...(selectors.has('jurisdictionReferenceDate')?{jurisdictionReferenceDate:date}:{}),...(selectors.has('procedureStartDate')?{procedureStartDate:date}:{}),
    holidayResolution:{status:'resolved',calendarBindingId:'be-party',anchors:[{role:'party',canton:'BE',spatialScopeId:'BE'}]},
    ...(rule.calculation.durationInputId?{days:10}:{})};
}

test('AP23G3 all50 BE social bindings preserve native10 outcomes and limited permissions in native11',()=>{
  const catalog=c.data.socialProcedureCatalogs!.get('ch-social-procedures')!;assert.equal(catalog.cantonalBindings.length,50);
  assert.equal(new Set(catalog.cantonalBindings.map(b=>b.ruleId)).size,44);
  for(const binding of catalog.cantonalBindings){const v=socialInput(c.data,binding.bindingId),prior=calculateSocialDeadline(v,old.data);
    assert.equal(prior.outcome,'calculated',binding.bindingId);
    for(const runtime of[c,a]){const r=calculateSocialDeadline(v,runtime.data);assert.equal(r.outcome,'calculated',`${binding.bindingId}:${r.blockReasonKeys}`);
      assert.equal(r.finalDeadline?.date,prior.finalDeadline?.date);assert.equal(r.socialEvidence?.releaseId,runtime.data.releaseId);
      assert.equal(calculateSocialDeadline({...v,procedureContextCanton:'ZH'},runtime.data).outcome,'blocked');
      assert.equal(calculateSocialDeadline(socialInput(runtime.data,binding.bindingId,'2028-01-02'),runtime.data).outcome,'blocked');
      assert.equal(calculateSocialDeadline(v,{...runtime.data}).outcome,'blocked');
    }
  }
});

test('AP23G3 retained VRPG special path uses native11 and keeps generic ATSG bypass blocked',()=>{
  const regime=c.data.specialRegimeCatalogs.get('vrpg-be-special-regimes-rest')!.regimes.find(r=>r.regimeId==='vrpg-be-general')!;
  const v={profileId:'vrpg-be',regimeId:regime.regimeId,ruleId:'VRPGBE-SPEC-REL-GENERAL-001',dateValues:{eventDate:'2026-09-04'},
    localTimeValues:{},integerValues:{deadlineDays:10},calendarProfileId:regime.calendarProfileId!,suspensionProfileId:regime.suspensionProfileId!,
    filingProfileId:regime.filingProfileId!,overrideConfirmations:[]};
  assert.equal(calculateSpecialDeadline(v,c.data).finalDeadline?.date,'2026-09-14');
  assert.equal(calculateSpecialDeadline(v,c.data).finalDeadline?.date,calculateSpecialDeadline(v,old.data).finalDeadline?.date);
  assert.equal(calculateSpecialDeadline(v,{...c.data}).outcome,'blocked');
  assert.deepEqual(calculateSpecialDeadline({...v,ruleId:'ATSG-SPEC-REL-060'},c.data).blockReasonKeys,['socialResolverRequired']);
});
