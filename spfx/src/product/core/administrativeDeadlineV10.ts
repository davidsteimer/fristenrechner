// SPDX-License-Identifier: AGPL-3.0-only
// Native V10 context with explicitly preserved V6/V7/V8 arithmetic branches.
import inputSchema from '../../schemas/implementation/ap23m3/administrative-input-v10.schema.json';
import {calculateAdministrativeDeadlineV9InV10,resolveAdministrativeCalendarV9InV10} from './administrativeDeadlineV9InV10';
import type {AdministrativeProceduralCalendarSupplementV9} from './administrativeTypesV9';
import {parseIsoDate,addCalendarDays,weekdayReason} from './date';
import {countDayDeadline} from './dayDeadlineArithmetic';
import {generateCalendarFromRules} from './generateCalendar';
import {administrativeIntervalContains,administrativePeriodDate} from './administrativeCatalog';
import {socialObjectSha256} from './socialCatalog';
import {getVerifiedAdministrativeDataV10} from './releaseFormat17';
import type {AdministrativeDeadlineInput,AdministrativeDeadlineResult,AdministrativeProvenance} from './administrativeDeadline';
import type {AdministrativeInterval,AdministrativeSourceRef} from './administrativeTypes';
import type {AdministrativeNormSegment} from './administrativeTypesV3';
import type {AdministrativeQualificationPolicyV6} from './administrativeTypesV6';
import type {AdministrativeOpeningResolutionV7,AdministrativeQualificationPolicyV7,AdministrativeOpeningModeV7} from './administrativeTypesV7';
import type {AdministrativeAreaFactsV8,AdministrativeCalendarResolutionV8,AdministrativeAnnualEndShiftResolutionV8,
 AdministrativeOpeningResolutionV8,AdministrativeQualificationPolicyV8,AdministrativeHolidayBindingV8,AdministrativeDynamicTerminalV8} from './administrativeTypesV8';
import type {CalendarProjectionRecipe} from './holidayActivationTypes';
import type {Holiday} from './types';
import type {AdministrativeQualificationPolicyV10,AdministrativeOpeningResolutionV10,AdministrativeProceduralCalendarSupplementResolutionV10,AdministrativeDurationResolutionV10,AdministrativeCalendarResolutionV10} from './administrativeTypesV10';
const own=(value:object,key:string):boolean=>Object.prototype.hasOwnProperty.call(value,key);
function plain(value:unknown):value is Record<string,unknown>{return!!value&&typeof value==='object'&&!Array.isArray(value)&&[Object.prototype,null].includes(Object.getPrototypeOf(value))
 &&Reflect.ownKeys(value).every(key=>typeof key==='string'&&Object.getOwnPropertyDescriptor(value,key)!.enumerable&&'value'in Object.getOwnPropertyDescriptor(value,key)!);}
function exact(value:unknown,required:readonly string[],optional:readonly string[]=[]):value is Record<string,unknown>{return plain(value)&&required.every(key=>own(value,key))&&Object.keys(value).every(key=>required.includes(key)||optional.includes(key));}
const scalar=(v:unknown):v is string|number|boolean=>typeof v==='string'||typeof v==='boolean'||typeof v==='number'&&Number.isFinite(v);
const factVocabulary=inputSchema.properties.facts.properties as Record<string,{readonly enum:readonly unknown[]}>;
const validV10CurrentFactValue=(key:string,value:unknown):boolean=>own(factVocabulary,key)&&factVocabulary[key]!.enum.some(allowed=>allowed===value);
function freeze<T>(value:T):T{if(value&&typeof value==='object'){Object.values(value).forEach(child=>freeze(child));Object.freeze(value);}return value;}
const blocked=(reason:string):AdministrativeDeadlineResult=>freeze({outcome:'blocked',blockReasonKeys:[reason],calendarExportAllowed:false});
const refs=(rows:readonly AdministrativeSourceRef[]):readonly AdministrativeSourceRef[]=>rows.filter((row,i)=>rows.findIndex(other=>row.sourceId===other.sourceId&&row.locator===other.locator)===i);
const areaKeys=['AI-RTG-INNER-ADDITIONAL','NE-LANDERON-ADDITIONAL']as const;
function areaValid(value:unknown):value is AdministrativeAreaFactsV8{return plain(value)&&Object.keys(value).every(key=>(areaKeys as readonly string[]).includes(key)&&typeof value[key]==='boolean');}
type Policy=AdministrativeQualificationPolicyV6|AdministrativeQualificationPolicyV7|AdministrativeQualificationPolicyV8;
function qualify(facts:unknown,policy:Policy,dynamic:boolean):string|undefined{
 if(!plain(facts))return'administrative.inputContractInvalid';const keys=policy.requirements.map(r=>r.key);if(dynamic)keys.push('legalAnchorCanton');
 if(Object.keys(facts).some(key=>!keys.includes(key)))return'administrative.inputContractInvalid';
 for(const row of policy.requirements){const actual=facts[row.key];if(!own(facts,row.key)||!scalar(actual)||(row.oneOf?!row.oneOf.some(v=>v===actual):actual!==row.value))return'administrative.'+row.reason;}
 return undefined;
}
/** Current qualified facts, not the path name or a previous calculation. */
export function calculateAdministrativeDeadlineV10(input:AdministrativeDeadlineInput,context:unknown):AdministrativeDeadlineResult{
 try{
  const data=getVerifiedAdministrativeDataV10(context);if(!data)return blocked('administrative.untrustedRelease');
  if(!exact(input,['selection','authoritySeat','inputDate','qualification','urgency'],['deadlineDays','caseQualification','areaFacts']))return blocked('administrative.inputContractInvalid');
  const selected=input.selection,seat=input.authoritySeat,q=input.qualification;
  if(!exact(selected,['kind','lawId','pathId','revision','stage'])||selected.kind!=='cantonalAdministrative'||typeof selected.pathId!=='string'||typeof selected.lawId!=='string'||typeof selected.stage!=='string'
   ||!Number.isSafeInteger(selected.revision)||!exact(seat,['canton','level','qualification'])||seat.level!=='cantonal'||seat.qualification!=='competentAuthorityForCurrentAction'
   ||typeof input.inputDate!=='string'||!parseIsoDate(input.inputDate)||!exact(q,['delivery','generalRoute','specialLaw','explicitHolidayException','fixedEndDate','deviatingStart','evidenceAdvance']))return blocked('administrative.inputContractInvalid');
  const path=data.catalog.paths.find(p=>p.pathId===selected.pathId&&p.lawId===selected.lawId&&p.revision===selected.revision);
  if(!path)return blocked('administrative.unknownPath');
  if(!('contractFamily'in path)||path.contractFamily!=='qualifiedDayProcedureV10')return calculateAdministrativeDeadlineV9InV10(input,context);
  if(q.delivery!=='qualifiedTriggerAccordingToOpeningPolicy'||q.generalRoute!=='qualified'||[q.fixedEndDate,q.deviatingStart,q.evidenceAdvance].some(v=>typeof v!=='boolean'))return blocked('administrative.inputContractInvalid');
  if(q.specialLaw==='applicableFederalSpecialLaw')return blocked('administrative.separatelyQualifiedFederalPathRequired');if(q.specialLaw!=='excluded')return blocked('administrative.specialLawUnresolved');
  if(q.explicitHolidayException!=='none')return blocked('administrative.explicitHolidayExceptionUnresolved');if(q.fixedEndDate||q.deviatingStart||q.evidenceAdvance)return blocked('administrative.unsupportedProcedure');
  if(own(input,'areaFacts'))return blocked('administrative.inputContractInvalid');if(input.urgency!=='none')return blocked('administrative.unsupportedUrgency');
  if(!path.stages.some(stage=>stage===selected.stage))return blocked('administrative.stageMismatch');
  const law=data.catalog.laws.find(l=>l.lawId===path.lawId)!,binding=data.catalog.holidayBindings.find(b=>b.holidayBindingId===path.holidayBindingId);
  if(!binding||!('bindingVersion'in binding)||binding.bindingVersion!=='10.0.0')return blocked('administrative.holidayBindingInvalid');
  if(law.canton!==seat.canton||binding.authoritySeatCanton!==seat.canton)return blocked('administrative.authoritySeatMismatch');
  const policy=data.catalog.qualificationPolicies.find(p=>p.pathId===path.pathId&&p.pathRevision===path.revision);
  if(!policy||policy.mode!=='qualifiedDayProcedureV10')return blocked('administrative.qualificationPolicyMissing');
  const facts=input.caseQualification;if(!plain(facts)||Object.getOwnPropertyNames(facts).some(key=>!Object.prototype.propertyIsEnumerable.call(facts,key)))return blocked('administrative.inputContractInvalid');
  const keys=policy.requirements.map(row=>row.key),opening=path.openingPolicy,duration=path.duration;
  if(opening.kind==='vdQualifiedOrUnsignedPost')keys.push(...opening.trackingRequirements.map(row=>row.key));
  if(duration.kind==='qualifiedVsLongerNoticeDays')keys.push(duration.valueFact,duration.ordinaryBaseFact);
  if(binding.calendarSelection.kind==='qualifiedAuthoritySeatRegion')keys.push(binding.calendarSelection.factKey);
  // Keep the accepted specific qualification reason before reporting irrelevant facts.
  for(const req of policy.requirements){const actual=facts[req.key];if(!own(facts,req.key)||!scalar(actual)||(req.oneOf?!req.oneOf.some(v=>v===actual):actual!==req.value))return blocked('administrative.'+req.reason);}
  if(Object.keys(facts).some(key=>!keys.includes(key)))return blocked('administrative.unknownResearchFact');
  if(Object.entries(facts).some(([key,value])=>!validV10CurrentFactValue(key,value)))return blocked('administrative.inputContractInvalid');
  if(opening.kind==='vdQualifiedOrUnsignedPost'&&facts.openingMode===opening.trackingMode)for(const req of opening.trackingRequirements){const actual=facts[req.key];if(!own(facts,req.key)||(req.oneOf?!req.oneOf.some(v=>v===actual):actual!==req.value))return blocked('administrative.'+req.reason);}
  let days:number,durationResolution:AdministrativeDurationResolutionV10|undefined;
  if(duration.kind==='statutoryDays'){if(own(input,'deadlineDays')&&input.deadlineDays!==duration.value)return blocked('administrative.statutoryDurationMismatch');days=duration.value;}
  else{
   if(typeof input.deadlineDays!=='number'||!Number.isSafeInteger(input.deadlineDays)||input.deadlineDays<1)return blocked('administrative.dayDurationNotSpecified');days=input.deadlineDays;
   if(duration.kind==='qualifiedVsLongerNoticeDays'){
    const actual=facts[duration.valueFact],base=facts[duration.ordinaryBaseFact];
    if(typeof actual!=='number'||!Number.isSafeInteger(actual)||actual!==days||typeof base!=='number'||!duration.ordinaryBaseAllowed.includes(base as 10|30)||actual<=base||actual<duration.minimum||actual>duration.maximum)return blocked('administrative.noticeDurationNotQualified');
    durationResolution={kind:'qualifiedVsLongerNoticeDays',actualInstructionDays:actual,ordinaryDays:base};
   }else if(days<duration.minimum||days>duration.maximum)return blocked('administrative.orderedDurationOutsideTechnicalGuard');
  }
  const eligibility=data.catalog.releaseBinding.pathEligibility.find(e=>e.pathId===path.pathId&&e.pathRevision===path.revision&&e.status===(data.referenceOnly?'candidate':'approved'));
  if(!eligibility||!('proceduralCalendarSupplementSha256'in eligibility)||!('durationPolicySha256'in eligibility)||eligibility.durationPolicySha256!==socialObjectSha256(duration)||eligibility.proceduralCalendarSupplementSha256!==socialObjectSha256(binding.proceduralCalendarSupplement))return blocked('administrative.pathNotReleased');
  const suspensionResolution=resolveAdministrativeSuspensionV10(context,path.pathId,facts),calendarResolution=resolveAdministrativeCalendarV10(context,path.pathId,facts);
  if(!calendarResolution)return blocked('administrative.holidayAnchorNotQualified');
  if(!suspensionResolution||suspensionResolution.suspensionSelectionSha256!==eligibility.suspensionSelectionSha256||!eligibility.suspensionProfiles.some(p=>p.suspensionProfileId===suspensionResolution.suspensionProfileId&&p.sha256===suspensionResolution.suspensionProfileSha256))return blocked('administrative.suspensionSelectionInvalid');
  const suspension=data.catalog.suspensionProfiles.find(p=>p.suspensionProfileId===suspensionResolution.suspensionProfileId)!,supplement=binding.proceduralCalendarSupplement as AdministrativeProceduralCalendarSupplementV9;
  const calendars:typeof data.calendars[number][]=[];const collect=(id:string,trail=new Set<string>()):void=>{if(trail.has(id))throw Error('Calendar cycle');if(calendars.some(c=>c.calendarId===id))return;const c=data.calendars.find(c=>c.calendarId===id);if(!c)throw Error('Missing V10 calendar');calendars.push(c);const next=new Set(trail);next.add(id);c.inherits.forEach(parent=>collect(parent,next));};collect(calendarResolution.calendarId);
  // Calendar/rule validity is not the same thing. Generate each individual rule
  // only on its valid days. Do not intersect unrelated rule intervals globally.
  const intervals:AdministrativeInterval[]=[data.coverage,...[path.temporalBinding.caseCoverage,path.temporalBinding.calculationCoverage,path.temporalBinding.sourceCoverage],eligibility.caseCoverage,eligibility.calculationCoverage,...calendars.map(c=>c.validity),...(supplement.kind==='none'?[]:[supplement.coverage])];
  const touched=new Set<AdministrativeNormSegment>();
  const covered=(date:string):boolean=>{if(!intervals.every(span=>administrativeIntervalContains(span,date)))return false;const segments=path.normTimeline.filter(s=>administrativeIntervalContains(s.interval,date));if(segments.length!==1)return false;touched.add(segments[0]!);return true;};
  if(![path.temporalBinding.caseCoverage,eligibility.caseCoverage].every(span=>administrativeIntervalContains(span,input.inputDate)))return blocked('administrative.outsideCaseCoverage');
  const from=intervals.map(s=>s.from).sort().at(-1)!,to=intervals.flatMap(s=>s.to===null?[]:[s.to]).sort()[0];if(!to||from>to||!covered(input.inputDate))return blocked('dataCoverageExceeded');
  const holidays=new Map<string,Holiday[]>();generateCalendarFromRules(calendars,calendarResolution.calendarId,{from,to}).calendar.holidays.forEach(h=>holidays.set(h.date,[...(holidays.get(h.date)??[]),h]));
  let legalOpening=input.inputDate;const openingShiftDates:string[]=[];
  if(opening.kind==='vdQualifiedOrUnsignedPost'){
   if(facts.openingMode===opening.trackingMode)while(weekdayReason(legalOpening)||holidays.has(legalOpening)){openingShiftDates.push(legalOpening);legalOpening=addCalendarDays(legalOpening,1);if(!covered(legalOpening))return blocked('dataCoverageExceeded');}
   else if(facts.openingMode!==opening.qualifiedMode)return blocked('administrative.openingModeUnqualified');
  }else if(facts.openingMode!=='qualifiedLegalOpening')return blocked('administrative.openingModeUnqualified');
  const openingResolution:AdministrativeOpeningResolutionV10={policyKind:opening.kind,openingPolicySha256:socialObjectSha256(opening),inputMeaning:opening.kind==='vdQualifiedOrUnsignedPost'&&facts.openingMode===opening.trackingMode?'physicalUnsignedPostalReceiptDate':'qualifiedLegalOpeningDate',inputMode:typeof facts.openingMode==='string'?facts.openingMode as 'qualifiedLegalOpening'|'vdUnsignedPostalReceipt':null,inputDate:input.inputDate,qualifiedOpeningDate:legalOpening,openingShiftDates,triggerKind:'qualifiedLegalOpening',evaluatedNormSegments:[...touched],sourceRefs:opening.sourceRefs};
  const periods:{periodId:string;startsOn:string;endsOn:string}[]=[];for(let year=Number(from.slice(0,4))-1;year<=Number(to.slice(0,4));year++)for(const p of suspension.periods)periods.push({periodId:p.periodId+'-'+year,startsOn:administrativePeriodDate(p.start,year),endsOn:administrativePeriodDate(p.end,year)});
  const raw=countDayDeadline({legallyRelevantDate:legalOpening,deadlineDays:days,periods,shiftStartDuringSuspension:true,holidaysByDate:holidays,isCovered:covered,blockEndShiftIntoSuspension:false});
  const shiftedDates:string[]=[],shiftReasonKeys:string[]=[],shiftedHolidayIds:string[]=[];let finalEnd=raw.provisionalEnd,collision:string|undefined,collisionPeriods:string[]=[],endCoverageFailure:string|undefined;
  if(raw.outcome==='calculated'){
   finalEnd=raw.provisionalEnd;let inspected=0;
   for(;;){if(++inspected>36600||!covered(finalEnd)){endCoverageFailure=finalEnd;break;}
    const weekend=weekdayReason(finalEnd),real=holidays.get(finalEnd)??[],extra=supplement.kind!=='none'&&supplement.dates.includes(finalEnd as '2026-11-11'|'2027-11-11');if(!weekend&&!real.length&&!extra)break;
    if(weekend&&!shiftReasonKeys.includes(weekend))shiftReasonKeys.push(weekend);if(real.length&&!shiftReasonKeys.includes('publicHoliday'))shiftReasonKeys.push('publicHoliday');for(const h of real)if(!shiftedHolidayIds.includes(h.holidayId))shiftedHolidayIds.push(h.holidayId);
    if(extra){shiftedDates.push(finalEnd);if(!shiftReasonKeys.includes('administrativeProceduralSupplement'))shiftReasonKeys.push('administrativeProceduralSupplement');}
    finalEnd=addCalendarDays(finalEnd,1);if(!covered(finalEnd)){endCoverageFailure=finalEnd;break;}
    const active=periods.filter(p=>p.startsOn<=finalEnd!&&p.endsOn>=finalEnd!);if(path.endShiftGuard==='blockWhenEnteringApplicableSuspension'&&active.length&&!collision){collision=finalEnd;collisionPeriods=active.map(p=>p.periodId);}
   }
  }
  const supplementResolution:AdministrativeProceduralCalendarSupplementResolutionV10={kind:supplement.kind,proceduralCalendarSupplementSha256:socialObjectSha256(supplement),effect:supplement.kind==='none'?'none':'endShiftOnly',coverage:supplement.kind==='none'?null:supplement.coverage,authorityMunicipality:supplement.kind==='none'?null:supplement.authorityMunicipality,boundDates:supplement.kind==='none'?[]:supplement.dates.map(date=>({date,sourceRefs:supplement.sourceRefs})),shiftedDates};
  const evaluatedNormSegments=path.normTimeline.filter(s=>touched.has(s));
  const provenance:AdministrativeProvenance={kind:'cantonalAdministrative',catalogId:data.catalog.catalogId,lawId:path.lawId,pathId:path.pathId,revision:path.revision,stage:selected.stage,releaseId:data.releaseId,holidayBindingId:binding.holidayBindingId,calendarId:calendarResolution.calendarId,projectionId:calendarResolution.projectionId,holidayRole:binding.anchor,authoritySeatCanton:law.canton,
   suspensionProfileId:suspensionResolution.suspensionProfileId,suspensionProfileSha256:suspensionResolution.suspensionProfileSha256,suspensionSelectionSha256:suspensionResolution.suspensionSelectionSha256,permittedSuspensionProfiles:eligibility.suspensionProfiles.map(p=>({...p})),suspensionSelectionFact:null,
   openingResolution,calendarResolution,proceduralCalendarSupplementResolution:supplementResolution,durationPolicySha256:eligibility.durationPolicySha256,...durationResolution?{durationResolution}:{},urgencyApplied:false,qualificationPolicySha256:eligibility.qualificationPolicySha256,evaluatedNormSegments,
   sourceRefs:refs([...law.sourceRefs,...path.sourceRefs,...binding.legalBinding.sourceRefs,...opening.sourceRefs,...suspension.sourceRefs,...evaluatedNormSegments.flatMap(s=>s.sourceRefs),...supplement.kind==='none'?[]:supplement.sourceRefs])};
  if(raw.outcome==='blocked'){const{reason,...trace}=raw;return freeze({...trace,blockReasonKeys:[reason],calendarExportAllowed:false,provenance});}
  if(endCoverageFailure)return freeze({outcome:'blocked',blockReasonKeys:['dataCoverageExceeded'],calendarExportAllowed:false,provisionalEnd:raw.provisionalEnd,blockedDate:endCoverageFailure,provenance});
  if(collision)return freeze({outcome:'blocked',blockReasonKeys:['endShiftIntoSuspensionUnresolved'],calendarExportAllowed:false,provisionalEnd:raw.provisionalEnd,blockedDate:collision,ordinaryShiftEnd:finalEnd!,periodIds:collisionPeriods,shiftReasonKeys,shiftedHolidayIds,provenance});
  const order=new Map([['saturday',0],['sunday',1],['publicHoliday',2],['administrativeProceduralSupplement',3]]);shiftReasonKeys.sort((a,b)=>(order.get(a)??99)-(order.get(b)??99));shiftedHolidayIds.sort();
  return freeze({...raw,finalEnd:finalEnd!,shiftReasonKeys,shiftedHolidayIds,deadlineDays:days,referenceOnly:data.referenceOnly,calendarExportAllowed:!data.referenceOnly,provenance,...calendarResolution.boundaryIds.length?{warningKeys:calendarResolution.boundaryIds}:{}});
 }catch{return blocked('administrative.dataContractInvalid');}
}
export interface AdministrativeResolvedSuspensionV10 {readonly suspensionProfileId:string;readonly suspensionProfileSha256:string;readonly suspensionSelectionSha256:string}
/** Descriptive metadata cannot confirm current facts or issue a result. */
export function resolveAdministrativeSuspensionV10(context:unknown,pathId:string,facts?:unknown):AdministrativeResolvedSuspensionV10|undefined{
 const data=getVerifiedAdministrativeDataV10(context);if(!data)return undefined;const path=data.catalog.paths.find(p=>p.pathId===pathId);if(!path||!('suspensionSelection'in path))return undefined;
 const choice=path.suspensionSelection;let id:string|undefined;
 if(choice.kind==='fixed')id=choice.suspensionProfileId;
 else{if(!plain(facts)||!own(facts,choice.factKey)||!scalar(facts[choice.factKey]))return undefined;const matches=choice.cases.filter(r=>r.value===facts[choice.factKey]);if(matches.length!==1)return undefined;id=matches[0]!.suspensionProfileId;}
 const profile=data.catalog.suspensionProfiles.find(p=>p.suspensionProfileId===id&&p.lawId===path.lawId);return profile?freeze({suspensionProfileId:profile.suspensionProfileId,suspensionProfileSha256:socialObjectSha256(profile),suspensionSelectionSha256:socialObjectSha256(choice)}):undefined;
}
/** Current explicit NE region selection. No first match, union, party-role reuse or default. */
export function resolveAdministrativeCalendarV10(context:unknown,pathId:string,facts?:unknown,areaFacts?:unknown):AdministrativeCalendarResolutionV10|undefined{
 const data=getVerifiedAdministrativeDataV10(context);if(!data)return undefined;const path=data.catalog.paths.find(p=>p.pathId===pathId);if(!path)return undefined;
 if(!('contractFamily'in path)||path.contractFamily!=='qualifiedDayProcedureV10')return resolveAdministrativeCalendarV9InV10(context,pathId,facts,areaFacts);
 const binding=data.catalog.holidayBindings.find(b=>b.holidayBindingId===path.holidayBindingId);if(!binding||!('bindingVersion'in binding)||binding.bindingVersion!=='10.0.0'||areaFacts!==undefined)return undefined;
 const selection=binding.calendarSelection;let selected:{readonly calendarId:string;readonly projectionId:string},region:'neWithoutLeLanderon'|'leLanderon'|null=null;
 if(selection.kind==='fixedAuthoritySeat')selected=selection;
 else{if(!plain(facts)||!own(facts,selection.factKey))return undefined;const matches=selection.cases.filter(row=>row.value===facts[selection.factKey]);if(matches.length!==1)return undefined;selected=matches[0]!;region=matches[0]!.value;}
 return freeze({selectionKind:selection.kind,calendarSelectionSha256:socialObjectSha256(selection),holidayBindingSha256:socialObjectSha256(binding),authoritySeatCanton:binding.authoritySeatCanton,
  calendarId:selected.calendarId,projectionId:selected.projectionId,authorityHolidayRegion:region,legalAnchorQualification:null,legalAnchorCanton:null,terminalBindingId:null,terminalBindingSha256:null,
  requiredAreaScopeIds:[],areaFacts:{},boundaryIds:binding.authoritySeatCanton==='NE'?['NE-YEAR-LOCAL-RESERVE']:[],januaryComparison:null});
}

