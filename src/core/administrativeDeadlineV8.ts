// SPDX-License-Identifier: AGPL-3.0-only
// Native V8 branch. No research script or serializable approval can authorise it.
import {parseIsoDate,addCalendarDays,weekdayReason} from './date';
import {countDayDeadline} from './dayDeadlineArithmetic';
import {generateCalendarFromRules} from './generateCalendar';
import {administrativeIntervalContains,administrativePeriodDate} from './administrativeCatalog';
import {socialObjectSha256} from './socialCatalog';
import {getVerifiedAdministrativeDataV8} from './releaseFormat15';
import type {AdministrativeDeadlineInput,AdministrativeDeadlineResult,AdministrativeProvenance} from './administrativeDeadline';
import type {AdministrativeInterval,AdministrativeSourceRef} from './administrativeTypes';
import type {AdministrativeNormSegment} from './administrativeTypesV3';
import type {AdministrativeQualificationPolicyV6} from './administrativeTypesV6';
import type {AdministrativeOpeningResolutionV7,AdministrativeQualificationPolicyV7,AdministrativeOpeningModeV7} from './administrativeTypesV7';
import type {AdministrativeAreaFactsV8,AdministrativeCalendarResolutionV8,AdministrativeAnnualEndShiftResolutionV8,
 AdministrativeOpeningResolutionV8,AdministrativeQualificationPolicyV8,AdministrativeHolidayBindingV8,AdministrativeDynamicTerminalV8} from './administrativeTypesV8';
import type {CalendarProjectionRecipe} from './holidayActivationTypes';
import type {Holiday} from './types';
const own=(value:object,key:string):boolean=>Object.prototype.hasOwnProperty.call(value,key);
function plain(value:unknown):value is Record<string,unknown>{return!!value&&typeof value==='object'&&!Array.isArray(value)&&[Object.prototype,null].includes(Object.getPrototypeOf(value))
 &&Reflect.ownKeys(value).every(key=>typeof key==='string'&&'value'in Object.getOwnPropertyDescriptor(value,key)!);}
function exact(value:unknown,required:readonly string[],optional:readonly string[]=[]):value is Record<string,unknown>{return plain(value)&&required.every(key=>own(value,key))&&Object.keys(value).every(key=>required.includes(key)||optional.includes(key));}
const scalar=(v:unknown):v is string|number|boolean=>typeof v==='string'||typeof v==='boolean'||typeof v==='number'&&Number.isFinite(v);
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
export interface AdministrativeResolvedSuspensionV8 {readonly suspensionProfileId:string;readonly suspensionProfileSha256:string;readonly suspensionSelectionSha256:string}
/** Descriptive metadata, never current case approval or an export token. */
export function resolveAdministrativeSuspensionV8(context:unknown,pathId:string,facts?:unknown):AdministrativeResolvedSuspensionV8|undefined{
 const data=getVerifiedAdministrativeDataV8(context);if(!data)return undefined;const path=data.catalog.paths.find(p=>p.pathId===pathId);if(!path||!('suspensionSelection'in path))return undefined;
 const choice=path.suspensionSelection;let id:string|undefined;
 if(choice.kind==='fixed')id=choice.suspensionProfileId;
 else{if(!plain(facts)||!own(facts,choice.factKey)||!scalar(facts[choice.factKey]))return undefined;const matches=choice.cases.filter(r=>r.value===facts[choice.factKey]);if(matches.length!==1)return undefined;id=matches[0]!.suspensionProfileId;}
 const profile=data.catalog.suspensionProfiles.find(p=>p.suspensionProfileId===id&&p.lawId===path.lawId);return profile?freeze({suspensionProfileId:profile.suspensionProfileId,suspensionProfileSha256:socialObjectSha256(profile),suspensionSelectionSha256:socialObjectSha256(choice)}):undefined;
}
/** Eager parameter display may resolve a binding, but cannot create an issued result. */
export function resolveAdministrativeCalendarV8(context:unknown,pathId:string,facts?:unknown,areaFacts?:unknown):AdministrativeCalendarResolutionV8|undefined{
 const data=getVerifiedAdministrativeDataV8(context);if(!data)return undefined;const path=data.catalog.paths.find(p=>p.pathId===pathId);if(!path||!('contractFamily'in path)||path.contractFamily!=='qualifiedDayProcedureV8')return undefined;
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
/** V6/V7 keep their own semantics in an authentic native15 context. No old-reader downgrade. */
export function calculateAdministrativeDeadlineV8(input:AdministrativeDeadlineInput,context:unknown):AdministrativeDeadlineResult{
 try{
  const data=getVerifiedAdministrativeDataV8(context);if(!data)return blocked('administrative.untrustedRelease');
  if(!exact(input,['selection','authoritySeat','inputDate','qualification','urgency'],['deadlineDays','caseQualification','areaFacts']))return blocked('administrative.inputContractInvalid');
  const selected=input.selection,seat=input.authoritySeat,q=input.qualification;
  if(!exact(selected,['kind','lawId','pathId','revision','stage'])||selected.kind!=='cantonalAdministrative'||typeof selected.pathId!=='string'||typeof selected.lawId!=='string'||typeof selected.stage!=='string'
   ||!Number.isInteger(selected.revision)||selected.revision<1||!exact(seat,['canton','level','qualification'])||seat.level!=='cantonal'||seat.qualification!=='competentAuthorityForCurrentAction'
   ||typeof input.inputDate!=='string'||!parseIsoDate(input.inputDate)||!exact(q,['delivery','generalRoute','specialLaw','explicitHolidayException','fixedEndDate','deviatingStart','evidenceAdvance'])
   ||!['qualifiedActualDelivery','qualifiedTriggerAccordingToOpeningPolicy'].includes(q.delivery)||q.generalRoute!=='qualified'||[q.fixedEndDate,q.deviatingStart,q.evidenceAdvance].some(v=>typeof v!=='boolean'))return blocked('administrative.inputContractInvalid');
  if(q.specialLaw==='applicableFederalSpecialLaw')return blocked('administrative.separatelyQualifiedFederalPathRequired');if(q.specialLaw!=='excluded')return blocked('administrative.specialLawUnresolved');
  if(q.explicitHolidayException!=='none')return blocked('administrative.explicitHolidayExceptionUnresolved');if(q.fixedEndDate||q.deviatingStart||q.evidenceAdvance)return blocked('administrative.unsupportedProcedure');
  const path=data.catalog.paths.find(p=>p.pathId===selected.pathId&&p.lawId===selected.lawId&&p.revision===selected.revision);if(!path||!('suspensionSelection'in path))return blocked('administrative.unknownPath');
  if(!path.stages.some(stage=>stage===selected.stage))return blocked('administrative.stageMismatch');
  const isV8=path.contractFamily==='qualifiedDayProcedureV8',law=data.catalog.laws.find(l=>l.lawId===path.lawId)!,binding=data.catalog.holidayBindings.find(b=>b.holidayBindingId===path.holidayBindingId)!;
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
  const suspensionResolution=resolveAdministrativeSuspensionV8(context,path.pathId,facts);
  if(!suspensionResolution||suspensionResolution.suspensionSelectionSha256!==eligibility.suspensionSelectionSha256||!eligibility.suspensionProfiles.some(p=>p.suspensionProfileId===suspensionResolution.suspensionProfileId&&p.sha256===suspensionResolution.suspensionProfileSha256))return blocked('administrative.suspensionSelectionInvalid');
  const suspension=data.catalog.suspensionProfiles.find(p=>p.suspensionProfileId===suspensionResolution.suspensionProfileId)!;
  const calendarResolution=isV8?resolveAdministrativeCalendarV8(context,path.pathId,facts,input.areaFacts):undefined;
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
