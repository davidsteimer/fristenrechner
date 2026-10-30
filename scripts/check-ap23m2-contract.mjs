// SPDX-License-Identifier: AGPL-3.0-only
// New V10 arithmetic is isolated from product and M1 research calculators.
import assert from 'node:assert/strict';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from '../spfx/node_modules/ajv/dist/2020.js';
import addFormats from '../spfx/node_modules/ajv-formats/dist/index.js';
import {ROOT,BASE,OUTPUT,ADMIN,HOLIDAYS,WINDOW,sha,objSha,encode,canonical,buildM2Candidate,assertM2Preservation,eligibilityFor}
 from './build-ap23m2-candidate.mjs';
import {buildM2Schemas,M2_SCHEMA_FILES} from './build-ap23m2-schemas.mjs';
const trustedBuild=await buildM2Candidate(),schemaBuild=await buildM2Schemas(),schemas=schemaBuild.schemas;
const trustedCatalog=structuredClone(trustedBuild.catalog),trustedManifest=structuredClone(trustedBuild.manifest);
const issued=new WeakSet(),ajv=new Ajv2020({strict:false,allErrors:true});addFormats(ajv);
const catalogueCheck=ajv.compile(schemas.catalog),manifestCheck=ajv.compile(schemas.localManifest),inputCheck=ajv.compile(schemas.input);
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
function isJson(value,ancestors=new Set()){
 if(value===null||typeof value==='string'||typeof value==='boolean')return true;
 if(typeof value==='number')return Number.isFinite(value);
 if(typeof value!=='object'||ancestors.has(value))return false;
 if(!Array.isArray(value)&&![Object.prototype,null].includes(Object.getPrototypeOf(value)))return false;
 const next=new Set(ancestors);next.add(value);
 if(Array.isArray(value)&&Object.keys(value).length!==value.length)return false;
 for(const key of Reflect.ownKeys(value)){
  if(Array.isArray(value)&&key==='length')continue;
  if(typeof key!=='string')return false;
  if(Array.isArray(value)&&(!/^(?:0|[1-9]\d*)$/u.test(key)||Number(key)>=value.length))return false;
  const descriptor=Object.getOwnPropertyDescriptor(value,key);if(!descriptor||descriptor.enumerable!==true||!own(descriptor,'value')||!isJson(descriptor.value,next))return false;
 }return true;
}
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
const day=86400000,number=date=>Date.parse(date+'T00:00:00Z')/day;
export const add=(date,days)=>new Date((number(date)+days)*day).toISOString().slice(0,10);
const week=date=>new Date(date+'T00:00:00Z').getUTCDay(),weekend=date=>[0,6].includes(week(date));
const valid=date=>typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/u.test(date)&&Number.isFinite(number(date))&&add(date,0)===date;
const inside=(date,span)=>valid(date)&&date>=span.from&&(span.to===null||date<=span.to);
const boundary=reason=>({outcome:'qualificationBoundaryProposed',reason,exportAllowed:false});
const outside=()=>({outcome:'researchWindowBoundary',reason:'outsideReferenceWindow',exportAllowed:false});
const matches=(value,row)=>own(row,'value')?Object.is(value,row.value):row.oneOf.some(expected=>Object.is(value,expected));
export function easter(year){
 const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,
 i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),n=h+l-7*m+114;
 return year+'-'+String(Math.floor(n/31)).padStart(2,'0')+'-'+String(n%31+1).padStart(2,'0');
}
function ruleDate(rule,year){
 const calculation=rule.calculation;let date;
 if(calculation.type==='fixedMonthDay')date=year+'-'+String(calculation.month).padStart(2,'0')+'-'+String(calculation.day).padStart(2,'0');
 else if(calculation.type==='easterOffsetDays')date=add(easter(year),calculation.offsetDays);
 else{assert.ok(['nthWeekdayOfMonth','nthWeekdayOffsetDays'].includes(calculation.type));date=year+'-'+String(calculation.month).padStart(2,'0')+'-01';let n=0;
  for(;;date=add(date,1))if((week(date)||7)===calculation.isoWeekday&&++n===calculation.occurrence)break;
  date=add(date,calculation.offsetDays??0);}
 if(rule.condition==='unlessTuesdayOrSaturday'&&[2,6].includes(week(date)))return null;
 if(rule.condition==='onlyMonday'&&week(date)!==1)return null;
 if(rule.condition==='shiftHolyThursdayBy7Days'&&date===add(easter(year),-3))date=add(date,7);
 else assert.ok(['always','unlessTuesdayOrSaturday','onlyMonday','shiftHolyThursdayBy7Days'].includes(rule.condition));
 return date;
}
export function calendarDates(id,calendars,year,seen=new Set()){
 assert.ok(!seen.has(id),'Calendar inheritance cycle');const next=new Set(seen);next.add(id);
 const calendar=calendars.find(row=>row.calendarId===id);assert.ok(calendar,'Missing physical calendar');const dates=new Set();
 for(const rule of calendar.rules){if(rule.effect?.type!=='holiday')continue;const date=ruleDate(rule,year);
  if(date&&inside(date,calendar.validity)&&inside(date,rule.validity))dates.add(date);}
 for(const parent of calendar.inherits)for(const date of calendarDates(parent,calendars,year,next))dates.add(date);return dates;
}
function endpoint(spec,year){const y=year+spec.yearOffset;
 return spec.type==='easterOffset'?add(easter(y),spec.days):y+'-'+String(spec.month).padStart(2,'0')+'-'+String(spec.day).padStart(2,'0');}
function suspended(date,profile){const year=Number(date.slice(0,4));return[year-1,year].some(y=>profile.periods.some(period=>date>=endpoint(period.start,y)&&date<=endpoint(period.end,y)));}
export function validateM2(catalog,manifest,files){
 assert.ok(isJson(catalog)&&isJson(manifest),'Non-JSON or accessor candidate');assert.ok(files instanceof Map);
 assert.equal(Object.getPrototypeOf(files),Map.prototype,'Ordinary payload map required');
 assert.deepEqual(Reflect.ownKeys(files),[],'Overridden payload accessors or iterators are not trusted');
 // Snapshot native map slots once. Validation and context construction use only these same bytes.
 files=new Map(Map.prototype.entries.call(files));
 assert.equal(catalogueCheck(catalog),true,JSON.stringify(catalogueCheck.errors));assert.equal(manifestCheck(manifest),true,JSON.stringify(manifestCheck.errors));
 assert.deepEqual([...files.keys()].sort(),manifest.artifacts.map(row=>row.path).sort(),'Exact actual payload inventory');
 for(const descriptor of manifest.artifacts){const bytes=files.get(descriptor.path);assert.equal(typeof bytes,'string');
  assert.equal(sha(bytes),descriptor.sha256,'Actual descriptor SHA');assert.equal(Buffer.byteLength(bytes),descriptor.byteLength,'Actual descriptor size');}
 // Internal expected values come from the frozen M1/L3 inputs, never a caller's resealed object.
 assert.deepEqual(catalog,trustedCatalog,'Changed accepted M1 projection or historical meaning');
 assert.deepEqual(manifest,trustedManifest,'Changed bound isolated manifest');
 assertM2Preservation({...trustedBuild,catalog,manifest,files,filesMap:files});
 const calendars=[...files.entries()].filter(([path])=>path.startsWith('calendars/')).map(([,bytes])=>JSON.parse(bytes));assert.equal(calendars.length,35);
 const holidayCatalog=JSON.parse(files.get(HOLIDAYS));assert.deepEqual(holidayCatalog,trustedBuild.holidayCatalog);
 const context=freeze({catalog:structuredClone(catalog),calendars,holidayCatalog});issued.add(context);return context;
}
export function researchInput(item,catalog=trustedCatalog){
 const path=catalog.paths.find(row=>row.researchRef===item.path&&row.contractFamily==='qualifiedDayProcedureV10');assert.ok(path);
 return{path:path.pathId,pathRevision:path.revision,authoritySeatCanton:catalog.laws.find(row=>row.lawId===path.lawId).canton,
  trigger:item.trigger,days:item.days,facts:structuredClone(item.facts)};
}
export function evaluateM2(input,context){
 if(!issued.has(context))return boundary('untrustedIsolatedProposal');
 if(!isJson(input)||!input||!input.facts||Array.isArray(input)||Array.isArray(input.facts))return boundary('inputContractInvalid');
 const catalog=context.catalog,path=catalog.paths.find(row=>row.pathId===input.path&&row.contractFamily==='qualifiedDayProcedureV10');
 if(!path)return boundary('unknownResearchPath');if(!valid(input.trigger))return boundary('invalidResearchDate');
 const policy=catalog.qualificationPolicies.find(row=>row.pathId===path.pathId),binding=catalog.holidayBindings.find(row=>row.holidayBindingId===path.holidayBindingId),
 law=catalog.laws.find(row=>row.lawId===path.lawId),entry=catalog.releaseBinding.pathEligibility.find(row=>row.pathId===path.pathId),
 openingPolicy=path.openingPolicy,duration=path.duration,profile=catalog.suspensionProfiles.find(row=>row.suspensionProfileId===path.suspensionSelection.suspensionProfileId);
 if(input.pathRevision!==path.revision||input.authoritySeatCanton!==law.canton)return boundary('pathContextMismatch');
 const keys=new Set(policy.requirements.map(row=>row.key));
 if(openingPolicy.kind==='vdQualifiedOrUnsignedPost')for(const req of openingPolicy.trackingRequirements)keys.add(req.key);
 if(duration.kind==='qualifiedVsLongerNoticeDays'){keys.add(duration.valueFact);keys.add(duration.ordinaryBaseFact);}
 const calendarSelection=binding.calendarSelection;if(calendarSelection.kind==='qualifiedAuthoritySeatRegion')keys.add(calendarSelection.factKey);
 for(const req of policy.requirements)if(!own(input.facts,req.key)||!matches(input.facts[req.key],req))return boundary(req.reason);
 if(Object.keys(input.facts).some(key=>!keys.has(key)))return boundary('unknownResearchFact');
 if(!Number.isSafeInteger(input.days)||input.days<1)return boundary('dayDurationNotSpecified');
 if(duration.kind==='statutoryDays'&&input.days!==duration.value)return boundary('statutoryDurationMismatch');
 if(duration.kind==='authorityOrderedDays'&&(input.days<duration.minimum||input.days>duration.maximum))
  return boundary(duration.boundMeaning==='statutoryMaximumForCurrentOrder'?'durationOutsideQualifiedRange':'orderedDurationOutsideTechnicalGuard');
 if(duration.kind==='qualifiedVsLongerNoticeDays'){
  const stated=input.facts[duration.valueFact],ordinary=input.facts[duration.ordinaryBaseFact];
  if(!Number.isSafeInteger(stated)||stated!==input.days||!duration.ordinaryBaseAllowed.includes(ordinary)||stated<=ordinary||stated<duration.minimum||stated>duration.maximum
   )return boundary('noticeDurationNotQualified');
 }
 if(!inputCheck(input))return boundary('inputContractInvalid');
 const expectedEligibility=eligibilityFor(path,policy,catalog);if(canonical(expectedEligibility)!==canonical(entry))return boundary('eligibilityBindingInvalid');
 let selection=binding.calendarSelection;const supplement=binding.proceduralCalendarSupplement;
 if(selection.kind==='qualifiedAuthoritySeatRegion'){const choice=selection.cases.find(row=>Object.is(row.value,input.facts[selection.factKey]));if(!choice)return boundary('holidayAnchorNotQualified');selection={kind:'fixedAuthoritySeat',...choice};}
 assert.equal(selection.kind,'fixedAuthoritySeat');
 const dependencies=[];function collect(id,seen=new Set()){
  assert.ok(!seen.has(id));if(dependencies.some(row=>row.calendarId===id))return;const calendar=context.calendars.find(row=>row.calendarId===id);assert.ok(calendar);
  dependencies.push(calendar);const next=new Set(seen);next.add(id);calendar.inherits.forEach(parent=>collect(parent,next));}
 collect(selection.calendarId);
 const spans=[WINDOW,...Object.values(path.temporalBinding).filter(value=>value&&typeof value==='object'&&own(value,'from')),
  entry.caseCoverage,entry.calculationCoverage,...dependencies.map(row=>row.validity)];
 if(supplement.kind!=='none')spans.push(supplement.coverage);
 const normIds=[],normSegments=[];
 function covered(date){if(!spans.every(span=>inside(date,span)))return false;const segments=path.normTimeline.filter(segment=>inside(date,segment.interval));
  if(segments.length!==1)return false;const segment=segments[0];if(!normIds.includes(segment.researchBindingId)){normIds.push(segment.researchBindingId);normSegments.push(segment);}return true;}
 if(!covered(input.trigger))return outside();
 const cache=new Map();const physicalHoliday=date=>{const year=Number(date.slice(0,4));if(!cache.has(year))cache.set(year,calendarDates(selection.calendarId,context.calendars,year));return cache.get(year).has(date);};
 let opening=input.trigger;const mode=input.facts.openingMode,openingShift=[];
 if(openingPolicy.kind==='vdQualifiedOrUnsignedPost'){
  if(mode===openingPolicy.trackingMode){
   for(const req of openingPolicy.trackingRequirements)if(!own(input.facts,req.key)||!matches(input.facts[req.key],req))return boundary(req.reason);
   while(weekend(opening)||physicalHoliday(opening)){openingShift.push(opening);opening=add(opening,1);if(!covered(opening))return outside();}
  }else if(mode!==openingPolicy.qualifiedMode)return boundary('openingModeUnqualified');
 }else if(mode!=='qualifiedLegalOpening')return boundary('openingModeUnqualified');
 let date=opening,left=input.days,firstCountedDay=null,skippedDays=0;
 while(left>0){date=add(date,1);if(!covered(date))return outside();if(suspended(date,profile))skippedDays++;else{firstCountedDay??=date;left--;}}
 const nominal=date,shiftedDates=[],supplementDates=[];let collision=null;
 while(weekend(date)||physicalHoliday(date)||supplement.kind!=='none'&&supplement.dates.includes(date)){
  shiftedDates.push(date);if(supplement.kind!=='none'&&supplement.dates.includes(date))supplementDates.push(date);
  date=add(date,1);if(!covered(date))return outside();
  if(path.endShiftGuard==='blockWhenEnteringApplicableSuspension'&&suspended(date,profile))collision??=date;
 }
 const provenance={pathId:path.pathId,pathSha256:entry.pathSha256,qualificationPolicySha256:entry.qualificationPolicySha256,
  durationPolicySha256:entry.durationPolicySha256,openingPolicySha256:entry.openingPolicySha256,holidayBindingId:binding.holidayBindingId,
  holidayBindingSha256:entry.holidayBindingSha256,baseCalendarId:selection.calendarId,baseProjectionId:selection.projectionId,
  calendarSelectionSha256:entry.calendarSelectionSha256,proceduralCalendarSupplementSha256:entry.proceduralCalendarSupplementSha256,
  suspensionSelectionSha256:entry.suspensionSelectionSha256,suspensionProfileId:profile.suspensionProfileId,suspensionProfileSha256:objSha(profile),
  physicalInput:input.trigger,qualifiedOpening:opening,openingShiftDates:openingShift,shiftedDates,supplementDates,
  evaluatedNormSegments:structuredClone(normSegments),sourceRefs:structuredClone([...path.sourceRefs,...binding.legalBinding.sourceRefs,...profile.sourceRefs,
   ...openingPolicy.sourceRefs,...(supplement.sourceRefs??[]),...normSegments.flatMap(row=>row.sourceRefs)])};
 if(collision)return{outcome:'unresolvedBoundaryProposed',reason:'M1-END-SUSPENSION',nominalEnd:nominal,ordinaryShiftEnd:date,firstSuspendedShiftDate:collision,
  temporalBindings:normIds,provenance,exportAllowed:false};
 const suspension=profile.periods.length?(profile.suspensionProfileId==='vs-three'?'threeWinterJan5':'three'):'none';
 return{outcome:'datedResearchValue',legalOpening:opening,ordinaryStart:add(opening,1),firstCountedDay,nominalEnd:nominal,end:date,
  skippedDays,endShiftDays:number(date)-number(nominal),suspension,calendar:selection.calendarId,temporalBindings:normIds,provenance,exportAllowed:false};
}
export function resealM2(catalog,manifest,files){
 for(const path of catalog.paths.filter(path=>path.contractFamily==='qualifiedDayProcedureV10')){
  const policy=catalog.qualificationPolicies.find(row=>row.pathId===path.pathId);policy.pathSha256=objSha(path);
  Object.assign(catalog.releaseBinding.pathEligibility.find(row=>row.pathId===path.pathId),eligibilityFor(path,policy,catalog));}
 const raw=encode(catalog);files.set(ADMIN,raw);const descriptor=manifest.artifacts.find(row=>row.path===ADMIN);
 Object.assign(descriptor,{sha256:sha(raw),byteLength:Buffer.byteLength(raw)});
}
async function actualFiles(manifest){const files=new Map();for(const descriptor of manifest.artifacts)files.set(descriptor.path,await readFile(resolve(ROOT,OUTPUT,'bundle',descriptor.path),'utf8'));return files;}

export async function runM2(){
 const manifest=JSON.parse(await readFile(resolve(ROOT,OUTPUT,'bundle/manifest.json'),'utf8')),files=await actualFiles(manifest),catalog=JSON.parse(files.get(ADMIN));
 const context=validateM2(catalog,manifest,files),results=[];
 for(const item of trustedBuild.research.cases){const input=researchInput(item,catalog),actual=evaluateM2(input,context);
  for(const[key,value]of Object.entries(item.expected))assert.deepEqual(actual[key],value,item.id+'/'+key);
  assert.equal(actual.exportAllowed,false);assert.equal(Object.hasOwn(actual,'end'),actual.outcome==='datedResearchValue');
  results.push({id:item.id,input,expected:structuredClone(item.expected),actual,provenance:'acceptedM1ConsumerReference'});}
 assert.equal(results.length,109);
 const syntheticProbeResults=[],missingFactRejections=[];
 function probe(id,input,expected){const actual=evaluateM2(input,context);for(const[key,value]of Object.entries(expected))assert.deepEqual(actual[key],value,id+'/'+key);
  assert.equal(actual.exportAllowed,false);syntheticProbeResults.push({id,input:structuredClone(input),expected:structuredClone(expected),actual,provenance:'explicitTechnicalSyntheticProbe'});return actual;}
 const from=id=>{const r=results.find(row=>row.id===id);assert.ok(r,id);return structuredClone(r.input);};
 const positive=id=>{const r=results.find(row=>row.input.path===id&&row.actual.outcome==='datedResearchValue');assert.ok(r,id);return structuredClone(r.input);};
 for(const path of catalog.paths.filter(row=>row.contractFamily==='qualifiedDayProcedureV10')){
  const example=positive(path.pathId),policy=catalog.qualificationPolicies.find(row=>row.pathId===path.pathId);
  for(const req of policy.requirements){const input=structuredClone(example);delete input.facts[req.key];assert.equal(evaluateM2(input,context).outcome,'qualificationBoundaryProposed');missingFactRejections.push({path:path.pathId,fact:req.key});}
 }
 const vd=from('M1-VD-POSTAL-BETTAG-3'),ne=positive('ne-admin-ordered'),vs=positive('vs-admin-notice-long');
 for(const[id,edit]of[
  ['postal-permission-missing',i=>delete i.facts.unsignedPostalService],['postal-entry-missing',i=>delete i.facts.entryIntoRecipientSphere],
  ['ai-expected-fact-is-not-vd',i=>i.facts.expectedService=true],['postal-entry-unverified',i=>i.facts.entryIntoRecipientSphere='unknown'],
  ['path-revision-wrong',i=>i.pathRevision=2],['authority-wrong',i=>i.authoritySeatCanton='NE'],['unknown-fact',i=>i.facts.extra=true],
  ['foreign-top-level-export',i=>i.exportAllowed=true],['invalid-date-overflow',i=>i.trigger='2026-02-30'],
  ['days-noninteger',i=>i.days=2.5],['days-string',i=>i.days='3'],['days-zero',i=>i.days=0]
 ]){const input=structuredClone(vd);edit(input);probe(id,input,{outcome:'qualificationBoundaryProposed'});}
 const qualified=structuredClone(vd);qualified.facts.openingMode='qualifiedLegalOpening';delete qualified.facts.unsignedPostalService;delete qualified.facts.entryIntoRecipientSphere;
 const q=probe('vd-qualified-saturday-no-second-shift',qualified,{outcome:'datedResearchValue',legalOpening:'2026-09-19',end:'2026-09-22'});assert.deepEqual(q.provenance.openingShiftDates,[]);
 const unsigned=probe('vd-unsigned-no-ai-expectability-required',vd,{outcome:'datedResearchValue',legalOpening:'2026-09-22',end:'2026-09-25'});assert.equal(Object.hasOwn(vd.facts,'expectedService'),false);assert.equal(unsigned.provenance.baseCalendarId,'ap22-vd-26f452ff34ee');
 for(const[id,edit]of[['missing',i=>delete i.facts.authorityHolidayRegion],['unknown',i=>i.facts.authorityHolidayRegion='unknown'],['party-role',i=>{delete i.facts.authorityHolidayRegion;i.facts.legalAnchorCanton='NE';}]]){
  const input=structuredClone(ne);edit(input);probe('ne-region-'+id,input,{outcome:'qualificationBoundaryProposed'});}
 for(const[region,end]of[['neWithoutLeLanderon','2027-05-27'],['leLanderon','2027-05-28']]){const input=structuredClone(ne);input.trigger='2027-05-26';input.days=1;input.facts.authorityHolidayRegion=region;
  probe('ne-corpus-'+region,input,{outcome:'datedResearchValue',end});}
 const court=positive('ne-court-ordered');court.trigger='2027-05-26';court.days=1;probe('ne-court-fixed-neuchatel',court,{outcome:'datedResearchValue',end:'2027-05-27'});
 const longer=structuredClone(vs);longer.days=15;longer.facts.actualInstructionDays=15;longer.facts.ordinaryDays=10;
 probe('vs-fifteen-above-ten-not-ai-thirty-one',longer,{outcome:'datedResearchValue',end:'2026-10-19'});
 for(const[id,edit]of[['base-missing',i=>delete i.facts.ordinaryDays],['base-invalid',i=>i.facts.ordinaryDays=7],['actual-missing',i=>delete i.facts.actualInstructionDays],
  ['actual-mismatch',i=>i.facts.actualInstructionDays=16],['not-above-base',i=>i.facts.ordinaryDays=30]]){const input=structuredClone(longer);edit(input);probe('vs-long-'+id,input,{outcome:'qualificationBoundaryProposed'});}
 const winter=positive('vs-court-ordered');winter.trigger='2026-12-17';winter.days=1;probe('vs-winter-through-january-five',winter,{outcome:'datedResearchValue',firstCountedDay:'2027-01-06',end:'2027-01-06'});
 const winterNe=structuredClone(court);winterNe.trigger='2026-12-17';winterNe.days=1;probe('ne-winter-through-january-two',winterNe,{outcome:'datedResearchValue',firstCountedDay:'2027-01-03',end:'2027-01-04'});
 const order=positive('vd-admin-ordered');order.days=40;probe('vd-current-qualified-order-not-global-thirty-cap',order,{outcome:'datedResearchValue'});
 order.facts.orderLegalScope='article81InitialExceedsThirty';probe('vd-unqualified-initial-order-no-numeric-inference',order,{outcome:'qualificationBoundaryProposed',reason:'VD-B-ORDER-LEGALITY'});
 for(const date of['2026-08-28','2027-12-31']){const input=structuredClone(ne);input.trigger=date;probe('full-window-'+date,input,{outcome:'researchWindowBoundary'});}
 const guard=structuredClone(ne);guard.days=366;probe('ordered-technical-safety-not-legal-maximum',guard,{outcome:'qualificationBoundaryProposed'});
 const fake=JSON.parse(JSON.stringify(context));assert.equal(evaluateM2(vd,fake).reason,'untrustedIsolatedProposal');
 let accessorInvoked=false;const accessor=structuredClone(vd);Object.defineProperty(accessor.facts,'entryIntoRecipientSphere',{enumerable:true,get(){accessorInvoked=true;return 'verified';}});
 assert.equal(evaluateM2(accessor,context).outcome,'qualificationBoundaryProposed');assert.equal(accessorInvoked,false);
 const mutationRejections=[];
 function invalid(id,edit){const c=structuredClone(catalog),m=structuredClone(manifest),f=new Map(files);edit(c,m,f);resealM2(c,m,f);assert.throws(()=>validateM2(c,m,f),undefined,id);mutationRejections.push({id,recomputedEligibilityAndDescriptorHashes:true});}
 const p=(c,id)=>c.paths.find(row=>row.pathId===id),b=(c,id)=>c.holidayBindings.find(row=>row.holidayBindingId===id);
 for(const[id,edit]of[
  ['postal-permission-policy-removed',c=>p(c,'vd-admin-ordered').openingPolicy.trackingRequirements.shift()],
  ['postal-ai-extra-condition',c=>p(c,'vd-admin-ordered').openingPolicy.trackingRequirements.push({key:'expectedService',value:true,reason:'wrong'})],
  ['qualified-opening-transformed-again',c=>p(c,'vd-admin-ordered').openingPolicy.qualifiedTransformation='nextWorkingDayIfNonWorkingReceipt'],
  ['ne-gains-raw-postal-transform',c=>p(c,'ne-admin-ordered').openingPolicy=structuredClone(p(c,'vd-admin-ordered').openingPolicy)],
  ['vs-oral-gains-raw-postal-transform',c=>p(c,'vs-admin-written-5').openingPolicy=structuredClone(p(c,'vd-admin-ordered').openingPolicy)],
  ['vs-long-ai-thirty-one',c=>p(c,'vs-admin-notice-long').duration.minimum=31],
  ['vs-long-unbound-current-fact',c=>p(c,'vs-admin-notice-long').duration.valueFact='savedDays'],
  ['ne-region-default',c=>b(c,'ne-admin-qualified-authority-seat').calendarSelection.defaultAllowed=true],
  ['ne-region-swapped',c=>b(c,'ne-admin-qualified-authority-seat').calendarSelection.cases.reverse()],
  ['ne-role-party-not-authority',c=>b(c,'ne-admin-qualified-authority-seat').anchor='partySeat'],
  ['ne-court-le-landeron',c=>b(c,'ne-court-qualified-authority-seat').calendarSelection.calendarId='ap22-ne-21f519039621'],
  ['ne-no-administrative-recess',c=>p(c,'ne-admin-ordered').suspensionSelection.suspensionProfileId='vd-none'],
  ['vd-provisional-gets-recess',c=>p(c,'vd-court-external-provisional-30').suspensionSelection.suspensionProfileId='vd-three'],
  ['vs-winter-shortened',c=>c.suspensionProfiles.find(row=>row.suspensionProfileId==='vs-three').periods.at(-1).end.day=2],
  ['vs-trigger-unqualified',c=>c.qualificationPolicies.find(row=>row.pathId==='vs-admin-written-5').requirements=c.qualificationPolicies.find(row=>row.pathId==='vs-admin-written-5').requirements.filter(row=>row.key!=='triggerQualification')],
  ['grace-prior-expiry-removed',c=>c.qualificationPolicies.find(row=>row.pathId==='vd-admin-grace-3').requirements=c.qualificationPolicies.find(row=>row.pathId==='vd-admin-grace-3').requirements.filter(row=>row.key!=='originalDeadlineAtRefusalOpening')],
  ['new-recess-collision-ignored',c=>p(c,'vs-court-ordered').endShiftGuard='none'],
  ['norm-window-gap',c=>p(c,'ne-admin-ordered').normTimeline[0].interval.from='2026-08-30'],
  ['contract-decision-forged',c=>c.contractDecision.status='approved'],['release-forged',c=>c.releaseBinding.status='approved'],
  ['export-forged',(c,m)=>m.extensions['steimer.local-reference'].calendarExportEnabled=true],['old-path-modified',c=>c.paths[0].revision++],
  ['physical-calendar-modified',(c,m,f)=>{const location='calendars/ap22-vs-6c002f32b1b0.json',v=JSON.parse(f.get(location));v.rules.pop();f.set(location,encode(v));const d=m.artifacts.find(row=>row.path===location);d.sha256=sha(f.get(location));d.byteLength=Buffer.byteLength(f.get(location));}]
 ])invalid(id,edit);
 const counts=Object.fromEntries(['datedResearchValue','qualificationBoundaryProposed','researchWindowBoundary','unresolvedBoundaryProposed'].map(kind=>[kind,results.filter(row=>row.actual.outcome===kind).length]));
 const report={workPackage:'AP23M2',status:'passed',fixtureSha256:sha(await readFile(resolve(ROOT,'docs/fachrecht/ap23m1/referenzfaelle.json'))),
  manifestSha256:sha(encode(manifest)),catalogSha256:sha(files.get(ADMIN)),consumerReferenceCases:109,consumerOutcomeCounts:counts,
  syntheticProbes:syntheticProbeResults.length,missingCurrentFactRejections:missingFactRejections.length,negativeCatalogMutations:mutationRejections.length,
  untrustedContextRejected:true,accessorRejectedWithoutInvocation:!accessorInvoked,results,syntheticProbeResults,missingFactRejections,mutationRejections,
  vdArticle81NumericLegalityInference:false,runtimeActive:false,sourceReleaseApproved:false,calendarExportEnabled:false,productModulesImported:false,nativeProductChanged:false};
 await writeFile(resolve(ROOT,OUTPUT,'QA-AP23M2.json'),encode(report));return report;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,2);const report=await runM2();console.log(JSON.stringify({...report,results:report.results.length,syntheticProbeResults:report.syntheticProbeResults.length,missingFactRejections:report.missingFactRejections.length,mutationRejections:report.mutationRejections.length}));
}

