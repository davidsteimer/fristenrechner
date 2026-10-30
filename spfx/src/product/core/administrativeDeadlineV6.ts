// SPDX-License-Identifier: AGPL-3.0-only
// Native V6 calculation. Metadata resolution is never a calculation capability.
import {parseIsoDate} from './date';
import {countDayDeadline} from './dayDeadlineArithmetic';
import {generateCalendarFromRules} from './generateCalendar';
import {administrativeIntervalContains,administrativePeriodDate} from './administrativeCatalog';
import {socialObjectSha256} from './socialCatalog';
import {getVerifiedAdministrativeDataV6} from './releaseFormat13';
import type {AdministrativeDeadlineInput,AdministrativeDeadlineResult,AdministrativeProvenance} from './administrativeDeadline';
import type {AdministrativeSourceRef} from './administrativeTypes';
import type {AdministrativeNormSegment} from './administrativeTypesV3';
import type {AdministrativePathV6,AdministrativeQualificationPolicyV6} from './administrativeTypesV6';
import type {Holiday} from './types';
const own=(value:object,key:string):boolean=>Object.prototype.hasOwnProperty.call(value,key);
function plain(value:unknown):value is Record<string,unknown>{
 return !!value&&typeof value==='object'&&!Array.isArray(value)&&[Object.prototype,null].includes(Object.getPrototypeOf(value))
  &&Object.values(Object.getOwnPropertyDescriptors(value)).every(descriptor=>'value'in descriptor);
}
function exact(value:unknown,required:readonly string[],optional:readonly string[]=[]):value is Record<string,unknown>{
 return plain(value)&&required.every(key=>own(value,key))&&Object.keys(value).every(key=>required.includes(key)||optional.includes(key));
}
const scalar=(value:unknown):value is string|number|boolean=>typeof value==='string'||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value);
function freeze<T>(value:T):T{if(value&&typeof value==='object'){Object.values(value).forEach(child=>freeze(child));Object.freeze(value);}return value;}
const blocked=(reason:string):AdministrativeDeadlineResult=>freeze({outcome:'blocked',blockReasonKeys:[reason],calendarExportAllowed:false});
function qualify(facts:unknown,policy:AdministrativeQualificationPolicyV6):string|undefined{
 if(!plain(facts))return'administrative.inputContractInvalid';
 const keys=policy.requirements.map(row=>row.key);
 if(Object.keys(facts).some(key=>!keys.includes(key)))return'administrative.inputContractInvalid';
 for(const row of policy.requirements){const actual=facts[row.key];
  if(!own(facts,row.key)||!scalar(actual)||(row.oneOf? !row.oneOf.some(value=>value===actual):actual!==row.value))return'administrative.'+row.reason;}
 return undefined;
}
export interface AdministrativeResolvedSuspensionV6 {
 readonly suspensionProfileId:string;readonly suspensionProfileSha256:string;readonly suspensionSelectionSha256:string;
}
/** Descriptive checked parameters only, not case approval or an export token. */
export function resolveAdministrativeSuspensionV6(context:unknown,pathId:string,facts?:unknown):AdministrativeResolvedSuspensionV6|undefined{
 const data=getVerifiedAdministrativeDataV6(context);if(!data)return undefined;
 const path=data.catalog.paths.find(row=>row.pathId===pathId);
 if(!path||!('suspensionSelection'in path))return undefined;
 const choice=path.suspensionSelection;
 let id:string|undefined;
 if(choice.kind==='fixed')id=choice.suspensionProfileId;
 else{
  if(!plain(facts)||!own(facts,choice.factKey))return undefined;
  const actual=facts[choice.factKey];if(!scalar(actual))return undefined;
  const matches=choice.cases.filter(row=>row.value===actual);if(matches.length!==1)return undefined;
  id=matches[0]!.suspensionProfileId;
 }
 const profile=data.catalog.suspensionProfiles.find(row=>row.suspensionProfileId===id&&row.lawId===path.lawId);
 if(!profile)return undefined;
 return Object.freeze({suspensionProfileId:profile.suspensionProfileId,suspensionProfileSha256:socialObjectSha256(profile),
  suspensionSelectionSha256:socialObjectSha256(choice)});
}
const uniqueRefs=(rows:readonly AdministrativeSourceRef[]):readonly AdministrativeSourceRef[]=>rows.filter((row,index)=>
 rows.findIndex(other=>row.sourceId===other.sourceId&&row.locator===other.locator)===index);
/** Only authentic Format13 contexts can enter this new semantic branch. */
export function calculateAdministrativeDeadlineV6(input:AdministrativeDeadlineInput,context:unknown):AdministrativeDeadlineResult{
 try{
  const data=getVerifiedAdministrativeDataV6(context);if(!data)return blocked('administrative.untrustedRelease');
  if(!exact(input,['selection','authoritySeat','inputDate','qualification','urgency'],['deadlineDays','caseQualification']))return blocked('administrative.inputContractInvalid');
  const selection=input.selection,seat=input.authoritySeat,q=input.qualification;
  if(!exact(selection,['kind','lawId','pathId','revision','stage'])||selection.kind!=='cantonalAdministrative'
   ||!Number.isInteger(selection.revision)||selection.revision<1
   ||!exact(seat,['canton','level','qualification'])||seat.level!=='cantonal'||seat.qualification!=='competentAuthorityForCurrentAction'
   ||typeof input.inputDate!=='string'||!parseIsoDate(input.inputDate)
   ||!exact(q,['delivery','generalRoute','specialLaw','explicitHolidayException','fixedEndDate','deviatingStart','evidenceAdvance'])
   ||q.delivery!=='qualifiedActualDelivery'||q.generalRoute!=='qualified'
   ||[q.fixedEndDate,q.deviatingStart,q.evidenceAdvance].some(value=>typeof value!=='boolean'))return blocked('administrative.inputContractInvalid');
  if(q.specialLaw==='applicableFederalSpecialLaw')return blocked('administrative.separatelyQualifiedFederalPathRequired');
  if(q.specialLaw!=='excluded')return blocked('administrative.specialLawUnresolved');
  if(q.explicitHolidayException!=='none')return blocked('administrative.explicitHolidayExceptionUnresolved');
  if(q.fixedEndDate||q.deviatingStart||q.evidenceAdvance)return blocked('administrative.unsupportedProcedure');
  const path=data.catalog.paths.find(row=>row.pathId===selection.pathId&&row.lawId===selection.lawId&&row.revision===selection.revision);
  if(!path||!('suspensionSelection'in path))return blocked('administrative.unknownPath');
  if(!path.stages.some(stage=>stage===selection.stage))return blocked('administrative.stageMismatch');
  const law=data.catalog.laws.find(row=>row.lawId===path.lawId)!,binding=data.catalog.holidayBindings.find(row=>row.holidayBindingId===path.holidayBindingId)!;
  if(law.canton!==seat.canton||binding.authoritySeatCanton!==seat.canton)return blocked('administrative.authoritySeatMismatch');
  const policy=data.catalog.qualificationPolicies.find(row=>row.pathId===path.pathId&&row.pathRevision===path.revision);
  if(policy?.mode!=='qualifiedDayProcedureV6')return blocked('administrative.qualificationPolicyMissing');
  const reason=qualify(input.caseQualification,policy);if(reason)return blocked(reason);
  if(input.urgency!=='none')return blocked('administrative.unsupportedUrgency');
  const duration=path.duration;
  let days:number;
  if(duration.kind==='statutoryDays'){
   if(own(input,'deadlineDays')&&input.deadlineDays!==duration.value)return blocked('administrative.statutoryDurationMismatch');days=duration.value;
  }else{
   if(typeof input.deadlineDays!=='number'||!Number.isSafeInteger(input.deadlineDays)||input.deadlineDays<1)return blocked('administrative.dayDurationNotSpecified');
   if(input.deadlineDays<duration.minimum||input.deadlineDays>duration.maximum)return blocked(duration.kind==='concretisedStatutoryDays'?
    'administrative.durationOutsideQualifiedRange':'administrative.orderedDurationOutsideTechnicalGuard');
   days=input.deadlineDays;
  }
  const eligibility=data.catalog.releaseBinding.pathEligibility.find(row=>row.pathId===path.pathId&&row.pathRevision===path.revision
   &&row.status===(data.referenceOnly?'candidate':'approved'));
  if(!eligibility||!('suspensionProfiles'in eligibility))return blocked('administrative.pathNotReleased');
  const resolved=resolveAdministrativeSuspensionV6(context,path.pathId,input.caseQualification);
  if(!resolved||resolved.suspensionSelectionSha256!==eligibility.suspensionSelectionSha256
   ||!eligibility.suspensionProfiles.some(ref=>ref.suspensionProfileId===resolved.suspensionProfileId&&ref.sha256===resolved.suspensionProfileSha256))return blocked('administrative.suspensionSelectionInvalid');
  const suspension=data.catalog.suspensionProfiles.find(row=>row.suspensionProfileId===resolved.suspensionProfileId)!;
  const temporal=path.temporalBinding;
  if(![temporal.caseCoverage,eligibility.caseCoverage].every(span=>administrativeIntervalContains(span,input.inputDate)))return blocked('administrative.outsideCaseCoverage');
  const calendars:typeof data.calendars[number][]=[];
  const collect=(id:string):void=>{if(calendars.some(row=>row.calendarId===id))return;const cal=data.calendars.find(row=>row.calendarId===id);
   if(!cal)throw new Error('Missing V6 calendar dependency');calendars.push(cal);cal.inherits.forEach(collect);};
  collect(binding.physicalBaseline.calendarId);
  const intervals=[data.coverage,temporal.calculationCoverage,temporal.sourceCoverage,eligibility.calculationCoverage,...calendars.map(cal=>cal.validity)];
  const touched=new Set<AdministrativeNormSegment>();
  const covered=(date:string):boolean=>{
   if(!intervals.every(span=>administrativeIntervalContains(span,date)))return false;
   const segments=path.normTimeline.filter(span=>administrativeIntervalContains(span.interval,date));
   if(segments.length!==1)return false;touched.add(segments[0]!);return true;
  };
  const from=intervals.map(span=>span.from).sort().slice(-1)[0]!,to=intervals.map(span=>span.to).filter((day):day is string=>day!==null).sort()[0];
  if(!to||from>to||!covered(input.inputDate))return blocked('dataCoverageExceeded');
  const range={from,to},generated=generateCalendarFromRules(calendars,binding.physicalBaseline.calendarId,range),holidays=new Map<string,Holiday[]>();
  generated.calendar.holidays.forEach(day=>holidays.set(day.date,[...(holidays.get(day.date)??[]),day]));
  const periods:{periodId:string;startsOn:string;endsOn:string}[]=[];
  for(let year=Number(from.slice(0,4))-1;year<=Number(to.slice(0,4));year++)for(const period of suspension.periods)
   periods.push({periodId:period.periodId+'-'+year,startsOn:administrativePeriodDate(period.start,year),endsOn:administrativePeriodDate(period.end,year)});
  const result=countDayDeadline({legallyRelevantDate:input.inputDate,deadlineDays:days,periods,shiftStartDuringSuspension:true,holidaysByDate:holidays,isCovered:covered,
   blockEndShiftIntoSuspension:path.endShiftGuard==='blockWhenEnteringApplicableSuspension'});
  const evaluatedNormSegments=path.normTimeline.filter(segment=>touched.has(segment));
  const choice=path.suspensionSelection;
  const provenance:AdministrativeProvenance={kind:'cantonalAdministrative',catalogId:data.catalog.catalogId,lawId:path.lawId,pathId:path.pathId,revision:path.revision,
   stage:selection.stage,releaseId:data.releaseId,holidayBindingId:binding.holidayBindingId,calendarId:binding.physicalBaseline.calendarId,
   projectionId:binding.physicalBaseline.projectionId,holidayRole:binding.anchor,authoritySeatCanton:law.canton,
   suspensionProfileId:resolved.suspensionProfileId,suspensionProfileSha256:resolved.suspensionProfileSha256,suspensionSelectionSha256:resolved.suspensionSelectionSha256,
   permittedSuspensionProfiles:eligibility.suspensionProfiles.map(ref=>({...ref})),
   suspensionSelectionFact:choice.kind==='currentFact'?{key:choice.factKey,value:(input.caseQualification as Record<string,string>)[choice.factKey]!}:null,
   urgencyApplied:false,qualificationPolicySha256:eligibility.qualificationPolicySha256,evaluatedNormSegments,
   sourceRefs:uniqueRefs([...law.sourceRefs,...path.sourceRefs,...binding.legalBinding.sourceRefs,...suspension.sourceRefs,
    ...evaluatedNormSegments.flatMap(segment=>segment.sourceRefs)])};
  if(result.outcome==='blocked'){
   const {reason:why,outcome,...trace}=result;
   const diagnostic=why==='endShiftIntoSuspensionUnresolved'?countDayDeadline({legallyRelevantDate:input.inputDate,deadlineDays:days,periods,
    shiftStartDuringSuspension:true,holidaysByDate:holidays,isCovered:covered,blockEndShiftIntoSuspension:false}):undefined;
   return freeze({outcome,...trace,...(diagnostic?.outcome==='calculated'?{ordinaryShiftEnd:diagnostic.finalEnd}:{}),blockReasonKeys:[why],calendarExportAllowed:false,provenance});
  }
  return freeze({...result,deadlineDays:days,referenceOnly:data.referenceOnly,calendarExportAllowed:!data.referenceOnly,provenance});
 }catch{return blocked('administrative.dataContractInvalid');}
}
