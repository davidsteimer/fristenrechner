// SPDX-License-Identifier: AGPL-3.0-only
// Preserved V9/V6/V7/V8 arithmetic in an authentic native Format-17 context.
// No Format-16 context, manifest downgrade or semantic conversion is issued.
import {parseIsoDate,addCalendarDays,weekdayReason} from './date';
import {countDayDeadline} from './dayDeadlineArithmetic';
import {generateCalendarFromRules} from './generateCalendar';
import {administrativeIntervalContains,administrativePeriodDate} from './administrativeCatalog';
import {socialObjectSha256} from './socialCatalog';
import {getVerifiedAdministrativeDataV10} from './releaseFormat17';
import type {VerifiedAdministrativeDataV9} from './releaseFormat16';
// This type projection is restricted below to historical selected branches.
// It does not create a parser result, convert bytes or register an older context.
const getVerifiedAdministrativeDataV9=(context:unknown):VerifiedAdministrativeDataV9|undefined=>getVerifiedAdministrativeDataV10(context) as unknown as VerifiedAdministrativeDataV9|undefined;
import type {AdministrativeDeadlineInput,AdministrativeDeadlineResult,AdministrativeProvenance} from './administrativeDeadline';
import type {AdministrativeInterval,AdministrativeSourceRef} from './administrativeTypes';
import type {AdministrativeNormSegment} from './administrativeTypesV3';
import type {AdministrativeQualificationPolicyV6} from './administrativeTypesV6';
import type {AdministrativeOpeningResolutionV7,AdministrativeQualificationPolicyV7,AdministrativeOpeningModeV7} from './administrativeTypesV7';
import type {AdministrativeAreaFactsV8,AdministrativeCalendarResolutionV8,AdministrativeAnnualEndShiftResolutionV8,
 AdministrativeOpeningResolutionV8,AdministrativeQualificationPolicyV8,AdministrativeHolidayBindingV8,AdministrativeDynamicTerminalV8} from './administrativeTypesV8';
import type {CalendarProjectionRecipe} from './holidayActivationTypes';
import type {Holiday} from './types';
import type {AdministrativeQualificationPolicyV9,AdministrativeOpeningResolutionV9,AdministrativeProceduralCalendarSupplementResolutionV9,AdministrativeDurationResolutionV9} from './administrativeTypesV9';
const own=(value:object,key:string):boolean=>Object.prototype.hasOwnProperty.call(value,key);
function plain(value:unknown):value is Record<string,unknown>{return!!value&&typeof value==='object'&&!Array.isArray(value)&&[Object.prototype,null].includes(Object.getPrototypeOf(value))
 &&Reflect.ownKeys(value).every(key=>typeof key==='string'&&'value'in Object.getOwnPropertyDescriptor(value,key)!);}
function exact(value:unknown,required:readonly string[],optional:readonly string[]=[]):value is Record<string,unknown>{return plain(value)&&required.every(key=>own(value,key))&&Object.keys(value).every(key=>required.includes(key)||optional.includes(key));}
const scalar=(v:unknown):v is string|number|boolean=>typeof v==='string'||typeof v==='boolean'||typeof v==='number'&&Number.isFinite(v);
// These three facts are optional outside the tracking branch. Their complete
// finite Input9 vocabulary still applies, including diagnostic null/unknown
// values. An irrelevant optional fact is not an untyped extension slot.
const trackingFactVocabularyV9:Readonly<Record<string,readonly unknown[]>>={
 expectedService:[true,false,'unknown','other',null],
 entryIntoSphere:['verified','unknown','other',null],
 receiptHolidayRegime:['sameAsBoundAuthorityCalendar','unknown','other',null]
};
const validV9CurrentFactValue=(key:string,value:unknown):boolean=>own(trackingFactVocabularyV9,key)?trackingFactVocabularyV9[key]!.some(allowed=>allowed===value):scalar(value);
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
export function calculateAdministrativeDeadlineV9InV10(input:AdministrativeDeadlineInput,context:unknown):AdministrativeDeadlineResult{
 try{
  const data=getVerifiedAdministrativeDataV9(context);if(!data)return blocked('administrative.untrustedRelease');
  if(!exact(input,['selection','authoritySeat','inputDate','qualification','urgency'],['deadlineDays','caseQualification','areaFacts']))return blocked('administrative.inputContractInvalid');
  const selected=input.selection,seat=input.authoritySeat,q=input.qualification;
  if(!exact(selected,['kind','lawId','pathId','revision','stage'])||selected.kind!=='cantonalAdministrative'||typeof selected.pathId!=='string'||typeof selected.lawId!=='string'||typeof selected.stage!=='string'
   ||!Number.isSafeInteger(selected.revision)||!exact(seat,['canton','level','qualification'])||seat.level!=='cantonal'||seat.qualification!=='competentAuthorityForCurrentAction'
   ||typeof input.inputDate!=='string'||!parseIsoDate(input.inputDate)||!exact(q,['delivery','generalRoute','specialLaw','explicitHolidayException','fixedEndDate','deviatingStart','evidenceAdvance']))return blocked('administrative.inputContractInvalid');
  const path=data.catalog.paths.find(p=>p.pathId===selected.pathId&&p.lawId===selected.lawId&&p.revision===selected.revision);
  if(!path)return blocked('administrative.unknownPath');
  if(!('contractFamily'in path)||path.contractFamily!=='qualifiedDayProcedureV9')return calculateInheritedAdministrativeDeadlineV9InV10(input,context);
  if(q.delivery!=='qualifiedTriggerAccordingToOpeningPolicy'||q.generalRoute!=='qualified'||[q.fixedEndDate,q.deviatingStart,q.evidenceAdvance].some(v=>typeof v!=='boolean'))return blocked('administrative.inputContractInvalid');
  if(q.specialLaw==='applicableFederalSpecialLaw')return blocked('administrative.separatelyQualifiedFederalPathRequired');if(q.specialLaw!=='excluded')return blocked('administrative.specialLawUnresolved');
  if(q.explicitHolidayException!=='none')return blocked('administrative.explicitHolidayExceptionUnresolved');if(q.fixedEndDate||q.deviatingStart||q.evidenceAdvance)return blocked('administrative.unsupportedProcedure');
  if(own(input,'areaFacts'))return blocked('administrative.inputContractInvalid');if(input.urgency!=='none')return blocked('administrative.unsupportedUrgency');
  if(!path.stages.some(stage=>stage===selected.stage))return blocked('administrative.stageMismatch');
  const law=data.catalog.laws.find(l=>l.lawId===path.lawId)!,binding=data.catalog.holidayBindings.find(b=>b.holidayBindingId===path.holidayBindingId);
  if(!binding||!('bindingVersion'in binding)||binding.bindingVersion!=='9.0.0')return blocked('administrative.holidayBindingInvalid');
  if(law.canton!==seat.canton||binding.authoritySeatCanton!==seat.canton)return blocked('administrative.authoritySeatMismatch');
  const policy=data.catalog.qualificationPolicies.find(p=>p.pathId===path.pathId&&p.pathRevision===path.revision);
  if(!policy||policy.mode!=='qualifiedDayProcedureV9')return blocked('administrative.qualificationPolicyMissing');
  const facts=input.caseQualification;if(!plain(facts)||Object.getOwnPropertyNames(facts).some(key=>!Object.prototype.propertyIsEnumerable.call(facts,key)))return blocked('administrative.inputContractInvalid');
  const keys=policy.requirements.map(row=>row.key),opening=path.openingPolicy,duration=path.duration;
  if(opening.kind==='aiQualifiedOrTrackingPost')keys.push(...opening.trackingRequirements.map(row=>row.key));
  if(duration.kind==='qualifiedLongerNoticeDays')keys.push(duration.valueFact,duration.ordinaryBaseFact,duration.qualificationFact);
  // Keep the accepted specific qualification reason before reporting irrelevant facts.
  for(const req of policy.requirements){const actual=facts[req.key];if(!own(facts,req.key)||!scalar(actual)||(req.oneOf?!req.oneOf.some(v=>v===actual):actual!==req.value))return blocked('administrative.'+req.reason);}
  if(Object.keys(facts).some(key=>!keys.includes(key))||Object.entries(facts).some(([key,value])=>!validV9CurrentFactValue(key,value)))return blocked('administrative.inputContractInvalid');
  if(opening.kind==='aiQualifiedOrTrackingPost'&&facts.openingMode===opening.trackingMode)for(const req of opening.trackingRequirements){const actual=facts[req.key];if(!own(facts,req.key)||(req.oneOf?!req.oneOf.some(v=>v===actual):actual!==req.value))return blocked('administrative.'+req.reason);}
  let days:number,durationResolution:AdministrativeDurationResolutionV9|undefined;
  if(duration.kind==='statutoryDays'){if(own(input,'deadlineDays')&&input.deadlineDays!==duration.value)return blocked('administrative.statutoryDurationMismatch');days=duration.value;}
  else{
   if(typeof input.deadlineDays!=='number'||!Number.isSafeInteger(input.deadlineDays)||input.deadlineDays<1)return blocked('administrative.dayDurationNotSpecified');days=input.deadlineDays;
   if(duration.kind==='qualifiedLongerNoticeDays'){
    const actual=facts[duration.valueFact],base=facts[duration.ordinaryBaseFact];
    if(typeof actual!=='number'||!Number.isSafeInteger(actual)||actual!==days||typeof base!=='number'||!duration.ordinaryBaseAllowed.includes(base as 7|10|30)||actual<=base||actual<duration.minimum||actual>duration.maximum||facts[duration.qualificationFact]!==duration.qualifiedValue)return blocked('administrative.noticeDurationNotQualified');
    durationResolution={kind:'qualifiedLongerNoticeDays',actualLongerInstructionDays:actual,ordinaryStatutoryDays:base,qualification:duration.qualifiedValue};
   }else if(days<duration.minimum||days>duration.maximum)return blocked(duration.boundMeaning==='statutoryMaximumForCurrentOrder'?'administrative.durationOutsideQualifiedRange':'administrative.orderedDurationOutsideTechnicalGuard');
  }
  const eligibility=data.catalog.releaseBinding.pathEligibility.find(e=>e.pathId===path.pathId&&e.pathRevision===path.revision&&e.status===(data.referenceOnly?'candidate':'approved'));
  if(!eligibility||!('proceduralCalendarSupplementSha256'in eligibility)||!('durationPolicySha256'in eligibility)||eligibility.durationPolicySha256!==socialObjectSha256(duration)||eligibility.proceduralCalendarSupplementSha256!==socialObjectSha256(binding.proceduralCalendarSupplement))return blocked('administrative.pathNotReleased');
  const suspensionResolution=resolveAdministrativeSuspensionV9InV10(context,path.pathId,facts),calendarResolution=resolveAdministrativeCalendarV9InV10(context,path.pathId,facts);
  if(!suspensionResolution||!calendarResolution||suspensionResolution.suspensionSelectionSha256!==eligibility.suspensionSelectionSha256||!eligibility.suspensionProfiles.some(p=>p.suspensionProfileId===suspensionResolution.suspensionProfileId&&p.sha256===suspensionResolution.suspensionProfileSha256))return blocked('administrative.suspensionSelectionInvalid');
  const suspension=data.catalog.suspensionProfiles.find(p=>p.suspensionProfileId===suspensionResolution.suspensionProfileId)!,supplement=binding.proceduralCalendarSupplement;
  const calendars:typeof data.calendars[number][]=[];const collect=(id:string,trail=new Set<string>()):void=>{if(trail.has(id))throw Error('Calendar cycle');if(calendars.some(c=>c.calendarId===id))return;const c=data.calendars.find(c=>c.calendarId===id);if(!c)throw Error('Missing V9 calendar');calendars.push(c);const next=new Set(trail);next.add(id);c.inherits.forEach(parent=>collect(parent,next));};collect(calendarResolution.calendarId);
  // Calendar/rule validity is not the same thing. Generate each individual rule
  // only on its valid days. Do not intersect unrelated rule intervals globally.
  const intervals:AdministrativeInterval[]=[data.coverage,...[path.temporalBinding.caseCoverage,path.temporalBinding.calculationCoverage,path.temporalBinding.sourceCoverage],eligibility.caseCoverage,eligibility.calculationCoverage,...calendars.map(c=>c.validity),...(supplement.kind==='none'?[]:[supplement.coverage])];
  const touched=new Set<AdministrativeNormSegment>();
  const covered=(date:string):boolean=>{if(!intervals.every(span=>administrativeIntervalContains(span,date)))return false;const segments=path.normTimeline.filter(s=>administrativeIntervalContains(s.interval,date));if(segments.length!==1)return false;touched.add(segments[0]!);return true;};
  if(![path.temporalBinding.caseCoverage,eligibility.caseCoverage].every(span=>administrativeIntervalContains(span,input.inputDate)))return blocked('administrative.outsideCaseCoverage');
  const from=intervals.map(s=>s.from).sort().at(-1)!,to=intervals.flatMap(s=>s.to===null?[]:[s.to]).sort()[0];if(!to||from>to||!covered(input.inputDate))return blocked('dataCoverageExceeded');
  const holidays=new Map<string,Holiday[]>();generateCalendarFromRules(calendars,calendarResolution.calendarId,{from,to}).calendar.holidays.forEach(h=>holidays.set(h.date,[...(holidays.get(h.date)??[]),h]));
  let legalOpening=input.inputDate;const openingShiftDates:string[]=[];
  if(opening.kind==='aiQualifiedOrTrackingPost'){
   if(facts.openingMode===opening.trackingMode)while(weekdayReason(legalOpening)||holidays.has(legalOpening)){openingShiftDates.push(legalOpening);legalOpening=addCalendarDays(legalOpening,1);if(!covered(legalOpening))return blocked('dataCoverageExceeded');}
   else if(facts.openingMode!==opening.qualifiedMode)return blocked('administrative.openingModeUnqualified');
  }else if(facts.openingMode!=='qualifiedLegalOpening')return blocked('administrative.openingModeUnqualified');
  const openingResolution:AdministrativeOpeningResolutionV9={policyKind:opening.kind,openingPolicySha256:socialObjectSha256(opening),inputMeaning:opening.kind==='aiQualifiedOrTrackingPost'&&facts.openingMode===opening.trackingMode?'physicalTrackingReceiptDate':'qualifiedLegalOpeningDate',inputMode:typeof facts.openingMode==='string'?facts.openingMode as 'qualifiedLegalOpening'|'trackingPhysicalReceipt':null,inputDate:input.inputDate,qualifiedOpeningDate:legalOpening,openingShiftDates,triggerKind:'qualifiedLegalOpening',evaluatedNormSegments:[...touched],sourceRefs:opening.sourceRefs};
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
  const supplementResolution:AdministrativeProceduralCalendarSupplementResolutionV9={kind:supplement.kind,proceduralCalendarSupplementSha256:socialObjectSha256(supplement),effect:supplement.kind==='none'?'none':'endShiftOnly',coverage:supplement.kind==='none'?null:supplement.coverage,authorityMunicipality:supplement.kind==='none'?null:supplement.authorityMunicipality,boundDates:supplement.kind==='none'?[]:supplement.dates.map(date=>({date,sourceRefs:supplement.sourceRefs})),shiftedDates};
  const evaluatedNormSegments=path.normTimeline.filter(s=>touched.has(s));
  const provenance:AdministrativeProvenance={kind:'cantonalAdministrative',catalogId:data.catalog.catalogId,lawId:path.lawId,pathId:path.pathId,revision:path.revision,stage:selected.stage,releaseId:data.releaseId,holidayBindingId:binding.holidayBindingId,calendarId:calendarResolution.calendarId,projectionId:calendarResolution.projectionId,holidayRole:binding.anchor,authoritySeatCanton:law.canton,
   suspensionProfileId:suspensionResolution.suspensionProfileId,suspensionProfileSha256:suspensionResolution.suspensionProfileSha256,suspensionSelectionSha256:suspensionResolution.suspensionSelectionSha256,permittedSuspensionProfiles:eligibility.suspensionProfiles.map(p=>({...p})),suspensionSelectionFact:null,
   openingResolution,calendarResolution,proceduralCalendarSupplementResolution:supplementResolution,durationPolicySha256:eligibility.durationPolicySha256,...durationResolution?{durationResolution}:{},urgencyApplied:false,qualificationPolicySha256:eligibility.qualificationPolicySha256,evaluatedNormSegments,
   sourceRefs:refs([...law.sourceRefs,...path.sourceRefs,...binding.legalBinding.sourceRefs,...opening.sourceRefs,...suspension.sourceRefs,...evaluatedNormSegments.flatMap(s=>s.sourceRefs),...supplement.kind==='none'?[]:supplement.sourceRefs])};
  if(raw.outcome==='blocked'){const{reason,...trace}=raw;return freeze({...trace,blockReasonKeys:[reason],calendarExportAllowed:false,provenance});}
  if(endCoverageFailure)return freeze({outcome:'blocked',blockReasonKeys:['dataCoverageExceeded'],calendarExportAllowed:false,provisionalEnd:raw.provisionalEnd,blockedDate:endCoverageFailure,provenance});
  if(collision)return freeze({outcome:'blocked',blockReasonKeys:['endShiftIntoSuspensionUnresolved'],calendarExportAllowed:false,provisionalEnd:raw.provisionalEnd,blockedDate:collision,ordinaryShiftEnd:finalEnd!,periodIds:collisionPeriods,shiftReasonKeys,shiftedHolidayIds,provenance});
  const order=new Map([['saturday',0],['sunday',1],['publicHoliday',2],['administrativeProceduralSupplement',3]]);shiftReasonKeys.sort((a,b)=>(order.get(a)??99)-(order.get(b)??99));shiftedHolidayIds.sort();
  return freeze({...raw,finalEnd:finalEnd!,shiftReasonKeys,shiftedHolidayIds,deadlineDays:days,referenceOnly:data.referenceOnly,calendarExportAllowed:!data.referenceOnly,provenance});
 }catch{return blocked('administrative.dataContractInvalid');}
}
export interface AdministrativeResolvedSuspensionV9 {readonly suspensionProfileId:string;readonly suspensionProfileSha256:string;readonly suspensionSelectionSha256:string}
/** Descriptive metadata, never current case approval or an export token. */
export function resolveAdministrativeSuspensionV9InV10(context:unknown,pathId:string,facts?:unknown):AdministrativeResolvedSuspensionV9|undefined{
 const data=getVerifiedAdministrativeDataV9(context);if(!data)return undefined;const path=data.catalog.paths.find(p=>p.pathId===pathId);if(!path||!('suspensionSelection'in path))return undefined;
 const choice=path.suspensionSelection;let id:string|undefined;
 if(choice.kind==='fixed')id=choice.suspensionProfileId;
 else{if(!plain(facts)||!own(facts,choice.factKey)||!scalar(facts[choice.factKey]))return undefined;const matches=choice.cases.filter(r=>r.value===facts[choice.factKey]);if(matches.length!==1)return undefined;id=matches[0]!.suspensionProfileId;}
 const profile=data.catalog.suspensionProfiles.find(p=>p.suspensionProfileId===id&&p.lawId===path.lawId);return profile?freeze({suspensionProfileId:profile.suspensionProfileId,suspensionProfileSha256:socialObjectSha256(profile),suspensionSelectionSha256:socialObjectSha256(choice)}):undefined;
}
/** Eager parameter display may resolve a binding, but cannot create an issued result. */
export function resolveAdministrativeCalendarV9InV10(context:unknown,pathId:string,facts?:unknown,areaFacts?:unknown):AdministrativeCalendarResolutionV8|undefined{
 const data=getVerifiedAdministrativeDataV9(context);if(!data)return undefined;const path=data.catalog.paths.find(p=>p.pathId===pathId);if(!path||!('contractFamily'in path)||!['qualifiedDayProcedureV8','qualifiedDayProcedureV9'].includes(path.contractFamily))return undefined;
 const binding=data.catalog.holidayBindings.find(b=>b.holidayBindingId===path.holidayBindingId);if(!binding||!('physicalSource'in binding))return undefined;
 const selection=binding.calendarSelection,area=areaFacts??{};if(!areaValid(area))return undefined;
 const common={calendarSelectionSha256:socialObjectSha256(selection),holidayBindingSha256:socialObjectSha256(binding),authoritySeatCanton:binding.authoritySeatCanton,januaryComparison:null};
 if(selection.kind==='fixedAuthoritySeat')return areaFacts!==undefined?undefined:freeze({...common,selectionKind:selection.kind,calendarId:selection.calendarId,projectionId:selection.projectionId,
  legalAnchorQualification:null,legalAnchorCanton:null,terminalBindingId:null,terminalBindingSha256:null,requiredAreaScopeIds:[],areaFacts:{},boundaryIds:[]});
 if(!plain(facts)||facts[selection.qualificationFact]!==selection.qualifiedValue||typeof facts[selection.cantonFact]!=='string')return undefined;
 const terminals=selection.terminals.filter(t=>t.canton===facts[selection.cantonFact]);if(terminals.length!==1)return undefined;const terminal=terminals[0]!;
 const raw=data.holidayCatalog.activation.procedureBindings.find(t=>t.id===terminal.bindingId);if(!raw||socialObjectSha256(raw)!==terminal.bindingSha256||raw.profileId!=='vwvg')return undefined;
 if(terminal.requiredAreaScopeIds.length===0&&areaFacts!==undefined||Object.keys(area).length!==terminal.requiredAreaScopeIds.length||terminal.requiredAreaScopeIds.some(key=>!own(area,key)||typeof area[key]!=='boolean'))return undefined;
 const variants=terminal.variants.filter(v=>v.areaFacts.every(f=>own(area,f.scopeId)&&area[f.scopeId]===f.member));if(variants.length!==1)return undefined;const variant=variants[0]!;
 const projection=data.holidayCatalog.activation.projections.find(p=>p.id===variant.projectionId),alternative=variant.alternativeProjectionId===null?null:data.holidayCatalog.activation.projections.find(p=>p.id===variant.alternativeProjectionId);
 if(!projection||socialObjectSha256(projection)!==variant.projectionSha256||projection.calendarId!==variant.calendarId||variant.alternativeProjectionId!==null&&(!alternative||socialObjectSha256(alternative)!==variant.alternativeProjectionSha256))return undefined;
 return freeze({...common,selectionKind:selection.kind,calendarId:variant.calendarId,projectionId:variant.projectionId,legalAnchorQualification:selection.qualifiedValue,legalAnchorCanton:terminal.canton,
  terminalBindingId:terminal.bindingId,terminalBindingSha256:terminal.bindingSha256,requiredAreaScopeIds:[...terminal.requiredAreaScopeIds],areaFacts:{...area},boundaryIds:[...terminal.boundaryIds]});
}
/** V6/V7/V8 keep their semantics inside the authentic native Format-16 context. */
export function calculateInheritedAdministrativeDeadlineV9InV10(input:AdministrativeDeadlineInput,context:unknown):AdministrativeDeadlineResult{
 try{
  const data=getVerifiedAdministrativeDataV9(context);if(!data)return blocked('administrative.untrustedRelease');
  if(!exact(input,['selection','authoritySeat','inputDate','qualification','urgency'],['deadlineDays','caseQualification','areaFacts']))return blocked('administrative.inputContractInvalid');
  const selected=input.selection,seat=input.authoritySeat,q=input.qualification;
  if(!exact(selected,['kind','lawId','pathId','revision','stage'])||selected.kind!=='cantonalAdministrative'||typeof selected.pathId!=='string'||typeof selected.lawId!=='string'||typeof selected.stage!=='string'
   ||!Number.isInteger(selected.revision)||selected.revision<1||!exact(seat,['canton','level','qualification'])||seat.level!=='cantonal'||seat.qualification!=='competentAuthorityForCurrentAction'
   ||typeof input.inputDate!=='string'||!parseIsoDate(input.inputDate)||!exact(q,['delivery','generalRoute','specialLaw','explicitHolidayException','fixedEndDate','deviatingStart','evidenceAdvance'])
   ||!['qualifiedActualDelivery','qualifiedTriggerAccordingToOpeningPolicy'].includes(q.delivery)||q.generalRoute!=='qualified'||[q.fixedEndDate,q.deviatingStart,q.evidenceAdvance].some(v=>typeof v!=='boolean'))return blocked('administrative.inputContractInvalid');
  if(q.specialLaw==='applicableFederalSpecialLaw')return blocked('administrative.separatelyQualifiedFederalPathRequired');if(q.specialLaw!=='excluded')return blocked('administrative.specialLawUnresolved');
  if(q.explicitHolidayException!=='none')return blocked('administrative.explicitHolidayExceptionUnresolved');if(q.fixedEndDate||q.deviatingStart||q.evidenceAdvance)return blocked('administrative.unsupportedProcedure');
  const path=data.catalog.paths.find(p=>p.pathId===selected.pathId&&p.lawId===selected.lawId&&p.revision===selected.revision);if(!path||!('suspensionSelection'in path)||path.contractFamily==='qualifiedDayProcedureV9')return blocked('administrative.unknownPath');
  if(!path.stages.some(stage=>stage===selected.stage))return blocked('administrative.stageMismatch');
  const isV8=path.contractFamily==='qualifiedDayProcedureV8',law=data.catalog.laws.find(l=>l.lawId===path.lawId)!,binding=data.catalog.holidayBindings.find(b=>b.holidayBindingId===path.holidayBindingId)!;
  if(binding&&'bindingVersion'in binding&&binding.bindingVersion==='9.0.0')return blocked('administrative.holidayBindingInvalid');
  if(law.canton!==seat.canton||binding.authoritySeatCanton!==seat.canton)return blocked('administrative.authoritySeatMismatch');
  if(isV8!==('physicalSource'in binding))return blocked('administrative.holidayBindingInvalid');
  if(!isV8&&own(input,'areaFacts')||own(input,'areaFacts')&&!areaValid(input.areaFacts))return blocked('administrative.inputContractInvalid');
  const policy=data.catalog.qualificationPolicies.find(p=>p.pathId===path.pathId&&p.pathRevision===path.revision),expectedMode=isV8?'qualifiedDayProcedureV8':'openingPolicy'in path?'qualifiedDayProcedureV7':'qualifiedDayProcedureV6';
  if(!policy||policy.mode!==expectedMode)return blocked('administrative.qualificationPolicyMissing');
  if(q.delivery!==('openingPolicy'in path?'qualifiedTriggerAccordingToOpeningPolicy':'qualifiedActualDelivery'))return blocked('administrative.inputContractInvalid');
  const dynamic='physicalSource'in binding&&binding.calendarSelection.kind==='qualifiedPartyOrRepresentativeCanton',reason=qualify(input.caseQualification,policy as Policy,dynamic);if(reason)return blocked(reason);
  const facts=input.caseQualification as Readonly<Record<string,string|number|boolean>>;if(input.urgency!=='none')return blocked('administrative.unsupportedUrgency');
  let days:number;const duration=path.duration;
  if(duration.kind==='statutoryDays'){if(own(input,'deadlineDays')&&input.deadlineDays!==duration.value)return blocked('administrative.statutoryDurationMismatch');days=duration.value;}
  else{if(typeof input.deadlineDays!=='number'||!Number.isSafeInteger(input.deadlineDays)||input.deadlineDays<1)return blocked('administrative.dayDurationNotSpecified');
   if(input.deadlineDays<duration.minimum||input.deadlineDays>duration.maximum)return blocked(duration.kind==='concretisedStatutoryDays'?'administrative.durationOutsideQualifiedRange':'administrative.orderedDurationOutsideTechnicalGuard');days=input.deadlineDays;}
  const eligibility=data.catalog.releaseBinding.pathEligibility.find(e=>e.pathId===path.pathId&&e.pathRevision===path.revision&&e.status===(data.referenceOnly?'candidate':'approved'));
  if(!eligibility||!('suspensionProfiles'in eligibility))return blocked('administrative.pathNotReleased');
  const suspensionResolution=resolveAdministrativeSuspensionV9InV10(context,path.pathId,facts);
  if(!suspensionResolution||suspensionResolution.suspensionSelectionSha256!==eligibility.suspensionSelectionSha256||!eligibility.suspensionProfiles.some(p=>p.suspensionProfileId===suspensionResolution.suspensionProfileId&&p.sha256===suspensionResolution.suspensionProfileSha256))return blocked('administrative.suspensionSelectionInvalid');
  const suspension=data.catalog.suspensionProfiles.find(p=>p.suspensionProfileId===suspensionResolution.suspensionProfileId)!;
  const calendarResolution=isV8?resolveAdministrativeCalendarV9InV10(context,path.pathId,facts,input.areaFacts):undefined;
  if(isV8&&!calendarResolution)return blocked('administrative.holidayAnchorNotQualified');
  const calendarId=calendarResolution?.calendarId??('physicalBaseline'in binding?binding.physicalBaseline.calendarId:''),projectionId=calendarResolution?.projectionId??('physicalBaseline'in binding?binding.physicalBaseline.projectionId:'');
  let terminal:AdministrativeDynamicTerminalV8|undefined,recipes:CalendarProjectionRecipe[]=[];
  if('physicalSource'in binding&&binding.calendarSelection.kind==='qualifiedPartyOrRepresentativeCanton'){
   terminal=binding.calendarSelection.terminals.find(t=>t.bindingId===calendarResolution!.terminalBindingId)!;
   const variant=terminal.variants.find(v=>v.projectionId===projectionId)!;
   recipes=[variant.projectionId,...variant.alternativeProjectionId?[variant.alternativeProjectionId]:[]].map(id=>data.holidayCatalog.activation.projections.find(p=>p.id===id)!);
  }
  if(isV8&&(!('physicalSource'in binding)||!('calendarSelectionSha256'in eligibility)||!('annualEndShiftPolicySha256'in eligibility)
   ||eligibility.calendarSelectionSha256!==socialObjectSha256(binding.calendarSelection)||eligibility.annualEndShiftPolicySha256!==socialObjectSha256(binding.annualEndShiftPolicy)))return blocked('administrative.endCalendarPolicyInvalid');
  const annual='physicalSource'in binding?binding.annualEndShiftPolicy:{kind:'none'as const},annualActive=annual.kind==='blCantonalOfficeClosures';
  const temporal=path.temporalBinding;if(![temporal.caseCoverage,eligibility.caseCoverage].every(span=>administrativeIntervalContains(span,input.inputDate)))return blocked('administrative.outsideCaseCoverage');
  const calendars:typeof data.calendars[number][]=[];const collect=(id:string,trail=new Set<string>()):void=>{if(trail.has(id))throw Error('Calendar cycle');if(calendars.some(c=>c.calendarId===id))return;const c=data.calendars.find(c=>c.calendarId===id);if(!c)throw Error('Missing V8 calendar');calendars.push(c);const next=new Set(trail);next.add(id);c.inherits.forEach(p=>collect(p,next));};
  collect(calendarId);for(const recipe of recipes)collect(recipe.calendarId);
  const intervals:AdministrativeInterval[]=[data.coverage,temporal.caseCoverage,eligibility.caseCoverage,temporal.calculationCoverage,temporal.sourceCoverage,eligibility.calculationCoverage,
   ...calendars.map(c=>c.validity),...calendars.flatMap(c=>c.rules.map(r=>r.validity))];
  if(annualActive)intervals.push(annual.coverage);
  if(terminal){const raw=data.holidayCatalog.activation.procedureBindings.find(t=>t.id===terminal!.bindingId)!;intervals.push(raw.caseCoverage);
   for(const recipe of recipes){
    for(const id of new Set([...recipe.scopeIds,...terminal.requiredAreaScopeIds])){const scope=data.holidayCatalog.data.scopes.find(s=>s.id===id),supp=data.holidayCatalog.activation.supplementalScopes.find(s=>s.id===id);if(!scope&&!supp)return blocked('administrative.calendarScopeInvalid');intervals.push(scope?{from:scope.from,to:scope.to}:supp!.legalValidity);
     const assignments=data.holidayCatalog.data.assignments.filter(a=>a.scopeId===id);if(scope&&!assignments.length)return blocked('administrative.calendarScopeInvalid');assignments.forEach(a=>intervals.push({from:a.from,to:a.to}));}
    for(const id of recipe.ruleIds){const rule=data.holidayCatalog.data.rules.find(r=>r.id===id),supp=data.holidayCatalog.activation.supplementalRules.find(r=>r.id===id);if(!rule&&!supp)return blocked('administrative.calendarRuleInvalid');intervals.push(rule?{from:rule.from,to:rule.to}:supp!.legalValidity);}
   }
  }
  const touched=new Set<AdministrativeNormSegment>(),years=new Set<number>();
  const covered=(date:string):boolean=>{if(!intervals.every(span=>administrativeIntervalContains(span,date)))return false;const segments=path.normTimeline.filter(s=>administrativeIntervalContains(s.interval,date));if(segments.length!==1)return false;touched.add(segments[0]!);
   if(annualActive){const rows=annual.years.filter(y=>administrativeIntervalContains(y.coverage,date));if(rows.length!==1)return false;years.add(rows[0]!.year);}return true;};
  const from=intervals.map(s=>s.from).sort().at(-1)!,to=intervals.flatMap(s=>s.to===null?[]:[s.to]).sort()[0];if(!to||from>to||!covered(input.inputDate))return blocked('dataCoverageExceeded');
  const range={from,to},holidayMaps=new Map<string,Map<string,Holiday[]>>();
  const holidaysFor=(id:string):Map<string,Holiday[]>=>{let map=holidayMaps.get(id);if(!map){map=new Map();generateCalendarFromRules(calendars,id,range).calendar.holidays.forEach(h=>map!.set(h.date,[...(map!.get(h.date)??[]),h]));holidayMaps.set(id,map);}return map;};
  const holidays=holidaysFor(calendarId),periods:{periodId:string;startsOn:string;endsOn:string}[]=[];
  for(let year=Number(from.slice(0,4))-1;year<=Number(to.slice(0,4));year++)for(const p of suspension.periods)periods.push({periodId:p.periodId+'-'+year,startsOn:administrativePeriodDate(p.start,year),endsOn:administrativePeriodDate(p.end,year)});
  let legalOpening=input.inputDate;const openingShiftDates:string[]=[],openingSegments=[...touched];let openingResolution:AdministrativeOpeningResolutionV7|AdministrativeOpeningResolutionV8|undefined;
  if('openingPolicy'in path){const opening=path.openingPolicy;if(!('openingPolicySha256'in eligibility)||eligibility.openingPolicySha256!==socialObjectSha256(opening))return blocked('administrative.openingPolicyInvalid');
   if(opening.kind==='geQualifiedOrOrdinaryPost'){
    const mode=facts.openingMode;if(law.canton!=='GE'||typeof mode!=='string'||!opening.allowedModes.includes(mode as AdministrativeOpeningModeV7))return blocked('administrative.openingModeNotQualified');
    if(mode==='ordinaryPostPhysicalReceipt')while(weekdayReason(legalOpening)||holidays.has(legalOpening)){legalOpening=addCalendarDays(legalOpening,1);if(!covered(legalOpening))return blocked('dataCoverageExceeded');openingShiftDates.push(legalOpening);}
   }
   for(const s of touched)if(!openingSegments.includes(s))openingSegments.push(s);
   const base={policyKind:opening.kind,openingPolicySha256:socialObjectSha256(opening),inputMode:opening.kind==='geQualifiedOrOrdinaryPost'?facts.openingMode as AdministrativeOpeningModeV7:null,
    inputDate:input.inputDate,qualifiedOpeningDate:legalOpening,openingShiftDates,evaluatedNormSegments:openingSegments,sourceRefs:opening.sourceRefs};
   openingResolution=isV8?{...base,inputMeaning:'qualifiedLegalOpeningDate',triggerKind:'qualifiedLegalOpening'} as AdministrativeOpeningResolutionV8:
    {...base,inputMeaning:opening.kind==='qualifiedCurrentTrigger'?'qualifiedCurrentTriggerDate':facts.openingMode==='ordinaryPostPhysicalReceipt'?'physicalOrdinaryPostReceiptDate':'qualifiedLegalOpeningDate',triggerKind:opening.kind==='qualifiedCurrentTrigger'?opening.triggerKind:null} as AdministrativeOpeningResolutionV7;
  }
  const closures=new Set(annualActive?annual.years.flatMap(y=>y.dates):[]),optionalClosures=new Set(annualActive?annual.uncertainty.dates:[]),endShiftGuard=path.endShiftGuard;
  function completePath(id:string,includeOptional:boolean){
   const h=holidaysFor(id),r=countDayDeadline({legallyRelevantDate:legalOpening,deadlineDays:days,periods,shiftStartDuringSuspension:true,holidaysByDate:h,isCovered:covered,blockEndShiftIntoSuspension:endShiftGuard==='blockWhenEnteringApplicableSuspension'});
   if(r.outcome==='blocked'||!annualActive)return{result:r,shiftedOfficeClosureDates:[]as string[]};
   // The ordinary counter has completed. Re-evaluate only the end chain with a distinct legal effect.
   let end=r.provisionalEnd;const shiftedHolidayIds:string[]=[],shiftReasonKeys:string[]=[],shiftedOfficeClosureDates:string[]=[];let inspected=0;
   for(;;){if(++inspected>36600||!covered(end))return{result:{outcome:'blocked'as const,reason:'dataCoverageExceeded'as const,provisionalEnd:r.provisionalEnd,blockedDate:end},shiftedOfficeClosureDates};
    const weekend=weekdayReason(end),realHolidays=h.get(end)??[],closure=closures.has(end)||includeOptional&&optionalClosures.has(end);if(!weekend&&!realHolidays.length&&!closure)break;
    if(weekend&&!shiftReasonKeys.includes(weekend))shiftReasonKeys.push(weekend);if(realHolidays.length&&!shiftReasonKeys.includes('publicHoliday'))shiftReasonKeys.push('publicHoliday');
    for(const day of realHolidays)if(!shiftedHolidayIds.includes(day.holidayId))shiftedHolidayIds.push(day.holidayId);
    if(closure){if(!shiftReasonKeys.includes('administrativeOfficeClosure'))shiftReasonKeys.push('administrativeOfficeClosure');shiftedOfficeClosureDates.push(end);}end=addCalendarDays(end,1);
   }
   const order=new Map([['saturday',0],['sunday',1],['publicHoliday',2],['administrativeOfficeClosure',3]]);shiftReasonKeys.sort((a,b)=>(order.get(a)??99)-(order.get(b)??99));shiftedHolidayIds.sort();
   return{result:{...r,finalEnd:end,shiftReasonKeys,shiftedHolidayIds},shiftedOfficeClosureDates};
  }
  const first=completePath(calendarId,false),second=annualActive?completePath(calendarId,true):first;
  const alternativeRecipe=recipes.length===2?recipes[1]:undefined,alternative=alternativeRecipe?completePath(alternativeRecipe.calendarId,false):undefined;
  const evaluatedNormSegments=path.normTimeline.filter(s=>touched.has(s));
  const finalCalendarResolution:AdministrativeCalendarResolutionV8|undefined=calendarResolution?{...calendarResolution,januaryComparison:alternative?.result.outcome==='calculated'&&first.result.outcome==='calculated'?{
   variedCatalogRuleIds:terminal!.ambiguity!.catalogRuleIds,withoutJanuary2:first.result.finalEnd,withJanuary2:alternative.result.finalEnd,outcome:first.result.finalEnd===alternative.result.finalEnd?'equal':'different'}:null}:undefined;
  const endResolution:AdministrativeAnnualEndShiftResolutionV8|undefined=isV8?{kind:annual.kind,annualEndShiftPolicySha256:socialObjectSha256(annual),effect:annualActive?'endShiftOnly':'none',evaluatedYears:[...years].sort(),
   boundOfficeClosureDays:annualActive?annual.years.flatMap(y=>y.dates.map(date=>({date,year:y.year,sourceRefs:y.sourceRefs}))):[],shiftedOfficeClosureDates:first.shiftedOfficeClosureDates,
   uncertaintyComparison:annualActive&&first.result.outcome==='calculated'&&second.result.outcome==='calculated'?{boundaryId:annual.uncertainty.boundaryId,variedDates:annual.uncertainty.dates,withoutOptionalEnd:first.result.finalEnd,withOptionalEnd:second.result.finalEnd,outcome:first.result.finalEnd===second.result.finalEnd?'equal':'different'}:null}:undefined;
  const provenance:AdministrativeProvenance={kind:'cantonalAdministrative',catalogId:data.catalog.catalogId,lawId:path.lawId,pathId:path.pathId,revision:path.revision,stage:selected.stage,releaseId:data.releaseId,
   holidayBindingId:binding.holidayBindingId,calendarId,projectionId,holidayRole:binding.anchor,authoritySeatCanton:law.canton,
   suspensionProfileId:suspensionResolution.suspensionProfileId,suspensionProfileSha256:suspensionResolution.suspensionProfileSha256,suspensionSelectionSha256:suspensionResolution.suspensionSelectionSha256,
   permittedSuspensionProfiles:eligibility.suspensionProfiles.map(p=>({...p})),suspensionSelectionFact:path.suspensionSelection.kind==='currentFact'?{key:path.suspensionSelection.factKey,value:String(facts[path.suspensionSelection.factKey])}:null,
   ...(openingResolution?{openingResolution}:{}),...(finalCalendarResolution?{calendarResolution:finalCalendarResolution}:{}),...(endResolution?{annualEndShiftResolution:endResolution}:{}),urgencyApplied:false,
   qualificationPolicySha256:eligibility.qualificationPolicySha256,evaluatedNormSegments,sourceRefs:refs([...law.sourceRefs,...path.sourceRefs,...binding.legalBinding.sourceRefs,...suspension.sourceRefs,...evaluatedNormSegments.flatMap(s=>s.sourceRefs),
    ...annualActive?[...annual.years.filter(y=>years.has(y.year)).flatMap(y=>y.sourceRefs),...annual.uncertainty.sourceRefs]:[]])};
  for(const attempt of[first,second,...alternative?[alternative]:[]])if(attempt.result.outcome==='blocked'){
   const{reason:why,outcome,...trace}=attempt.result;const diagnostic=why==='endShiftIntoSuspensionUnresolved'?countDayDeadline({legallyRelevantDate:legalOpening,deadlineDays:days,periods,shiftStartDuringSuspension:true,holidaysByDate:holidays,isCovered:covered,blockEndShiftIntoSuspension:false}):undefined;
   return freeze({outcome,...trace,...(diagnostic?.outcome==='calculated'?{ordinaryShiftEnd:diagnostic.finalEnd}:{}),blockReasonKeys:[why],calendarExportAllowed:false,provenance});
  }
  if(finalCalendarResolution?.januaryComparison?.outcome==='different')return freeze({outcome:'blocked',blockReasonKeys:['calendarBinding.januaryClarificationRequired'],calendarExportAllowed:false,provenance});
  if(endResolution?.uncertaintyComparison?.outcome==='different')return freeze({outcome:'blocked',blockReasonKeys:['administrative.blOfficeClosureClarificationRequired'],calendarExportAllowed:false,provenance});
  if(first.result.outcome!=='calculated')return blocked('administrative.dataContractInvalid');
  return freeze({...first.result,deadlineDays:days,referenceOnly:data.referenceOnly,calendarExportAllowed:!data.referenceOnly,provenance,...calendarResolution?{warningKeys:[...calendarResolution.boundaryIds]}:{}});
 }catch{return blocked('administrative.dataContractInvalid');}
}

