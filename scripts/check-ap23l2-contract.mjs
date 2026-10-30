// SPDX-License-Identifier: AGPL-3.0-only
// New V9 arithmetic is isolated from product and L1 research calculators.
import assert from 'node:assert/strict';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from '../spfx/node_modules/ajv/dist/2020.js';
import addFormats from '../spfx/node_modules/ajv-formats/dist/index.js';
import {ROOT,BASE,OUTPUT,ADMIN,HOLIDAYS,WINDOW,sha,objSha,encode,canonical,buildL2Candidate,assertL2Preservation,eligibilityFor}
 from './build-ap23l2-candidate.mjs';
import {buildL2Schemas,L2_SCHEMA_FILES} from './build-ap23l2-schemas.mjs';
const trustedBuild=await buildL2Candidate(),schemaBuild=await buildL2Schemas(),schemas=schemaBuild.schemas;
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
  const descriptor=Object.getOwnPropertyDescriptor(value,key);if(!descriptor||!own(descriptor,'value')||!isJson(descriptor.value,next))return false;
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
export function validateL2(catalog,manifest,files){
 assert.ok(isJson(catalog)&&isJson(manifest),'Non-JSON or accessor candidate');assert.ok(files instanceof Map);
 assert.equal(Object.getPrototypeOf(files),Map.prototype,'Ordinary payload map required');
 assert.deepEqual(Reflect.ownKeys(files),[],'Overridden payload accessors or iterators are not trusted');
 // Snapshot native map slots once. Validation and context construction use only these same bytes.
 files=new Map(Map.prototype.entries.call(files));
 assert.equal(catalogueCheck(catalog),true,JSON.stringify(catalogueCheck.errors));assert.equal(manifestCheck(manifest),true,JSON.stringify(manifestCheck.errors));
 assert.deepEqual([...files.keys()].sort(),manifest.artifacts.map(row=>row.path).sort(),'Exact actual payload inventory');
 for(const descriptor of manifest.artifacts){const bytes=files.get(descriptor.path);assert.equal(typeof bytes,'string');
  assert.equal(sha(bytes),descriptor.sha256,'Actual descriptor SHA');assert.equal(Buffer.byteLength(bytes),descriptor.byteLength,'Actual descriptor size');}
 // Internal expected values come from the frozen L1/K3 inputs, never a caller's resealed object.
 assert.deepEqual(catalog,trustedCatalog,'Changed accepted L1 projection or historical meaning');
 assert.deepEqual(manifest,trustedManifest,'Changed bound isolated manifest');
 assertL2Preservation({...trustedBuild,catalog,manifest,files,filesMap:files});
 const calendars=[...files.entries()].filter(([path])=>path.startsWith('calendars/')).map(([,bytes])=>JSON.parse(bytes));assert.equal(calendars.length,35);
 const holidayCatalog=JSON.parse(files.get(HOLIDAYS));assert.deepEqual(holidayCatalog,trustedBuild.holidayCatalog);
 const context=freeze({catalog:structuredClone(catalog),calendars,holidayCatalog});issued.add(context);return context;
}
export function researchInput(item,catalog=trustedCatalog){
 const path=catalog.paths.find(row=>row.researchRef===item.path&&row.contractFamily==='qualifiedDayProcedureV9');assert.ok(path);
 return{path:path.pathId,pathRevision:path.revision,authoritySeatCanton:catalog.laws.find(row=>row.lawId===path.lawId).canton,
  trigger:item.trigger,days:item.days,facts:structuredClone(item.facts)};
}
export function evaluateL2(input,context){
 if(!issued.has(context))return boundary('untrustedIsolatedProposal');
 if(!isJson(input)||!input||!input.facts||Array.isArray(input)||Array.isArray(input.facts))return boundary('inputContractInvalid');
 const catalog=context.catalog,path=catalog.paths.find(row=>row.pathId===input.path&&row.contractFamily==='qualifiedDayProcedureV9');
 if(!path)return boundary('unknownResearchPath');if(!valid(input.trigger))return boundary('invalidResearchDate');
 const policy=catalog.qualificationPolicies.find(row=>row.pathId===path.pathId),binding=catalog.holidayBindings.find(row=>row.holidayBindingId===path.holidayBindingId),
 law=catalog.laws.find(row=>row.lawId===path.lawId),entry=catalog.releaseBinding.pathEligibility.find(row=>row.pathId===path.pathId),
 openingPolicy=path.openingPolicy,duration=path.duration,profile=catalog.suspensionProfiles.find(row=>row.suspensionProfileId===path.suspensionSelection.suspensionProfileId);
 if(input.pathRevision!==path.revision||input.authoritySeatCanton!==law.canton)return boundary('pathContextMismatch');
 const keys=new Set(policy.requirements.map(row=>row.key));
 if(openingPolicy.kind==='aiQualifiedOrTrackingPost')for(const req of openingPolicy.trackingRequirements)keys.add(req.key);
 if(duration.kind==='qualifiedLongerNoticeDays'){keys.add(duration.valueFact);keys.add(duration.ordinaryBaseFact);keys.add(duration.qualificationFact);}
 for(const req of policy.requirements)if(!own(input.facts,req.key)||!matches(input.facts[req.key],req))return boundary(req.reason);
 if(Object.keys(input.facts).some(key=>!keys.has(key)))return boundary('unknownResearchFact');
 if(!Number.isSafeInteger(input.days)||input.days<1)return boundary('dayDurationNotSpecified');
 if(duration.kind==='statutoryDays'&&input.days!==duration.value)return boundary('statutoryDurationMismatch');
 if(duration.kind==='authorityOrderedDays'&&(input.days<duration.minimum||input.days>duration.maximum))
  return boundary(duration.boundMeaning==='statutoryMaximumForCurrentOrder'?'durationOutsideQualifiedRange':'orderedDurationOutsideTechnicalGuard');
 if(duration.kind==='qualifiedLongerNoticeDays'){
  const stated=input.facts[duration.valueFact],ordinary=input.facts[duration.ordinaryBaseFact];
  if(!Number.isSafeInteger(stated)||stated!==input.days||!duration.ordinaryBaseAllowed.includes(ordinary)||stated<=ordinary||stated<duration.minimum||stated>duration.maximum
   ||input.facts[duration.qualificationFact]!==duration.qualifiedValue)return boundary('noticeDurationNotQualified');
 }
 if(!inputCheck(input))return boundary('inputContractInvalid');
 const expectedEligibility=eligibilityFor(path,policy,catalog);if(canonical(expectedEligibility)!==canonical(entry))return boundary('eligibilityBindingInvalid');
 const selection=binding.calendarSelection,supplement=binding.proceduralCalendarSupplement;assert.equal(selection.kind,'fixedAuthoritySeat');
 const dependencies=[];function collect(id,seen=new Set()){
  assert.ok(!seen.has(id));if(dependencies.some(row=>row.calendarId===id))return;const calendar=context.calendars.find(row=>row.calendarId===id);assert.ok(calendar);
  dependencies.push(calendar);const next=new Set(seen);next.add(id);calendar.inherits.forEach(parent=>collect(parent,next));}
 collect(selection.calendarId);
 const spans=[WINDOW,...Object.values(path.temporalBinding).filter(value=>value&&typeof value==='object'&&own(value,'from')),
  entry.caseCoverage,entry.calculationCoverage,...dependencies.map(row=>row.validity),...dependencies.flatMap(row=>row.rules.filter(rule=>rule.effect?.type==='holiday').map(rule=>rule.validity))];
 if(supplement.kind!=='none')spans.push(supplement.coverage);
 const normIds=[],normSegments=[];
 function covered(date){if(!spans.every(span=>inside(date,span)))return false;const segments=path.normTimeline.filter(segment=>inside(date,segment.interval));
  if(segments.length!==1)return false;const segment=segments[0];if(!normIds.includes(segment.researchBindingId)){normIds.push(segment.researchBindingId);normSegments.push(segment);}return true;}
 if(!covered(input.trigger))return outside();
 const cache=new Map();const physicalHoliday=date=>{const year=Number(date.slice(0,4));if(!cache.has(year))cache.set(year,calendarDates(selection.calendarId,context.calendars,year));return cache.get(year).has(date);};
 let opening=input.trigger;const mode=input.facts.openingMode,openingShift=[];
 if(openingPolicy.kind==='aiQualifiedOrTrackingPost'){
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
 if(collision)return{outcome:'unresolvedBoundaryProposed',reason:'L1-END-SUSPENSION',nominalEnd:nominal,ordinaryShiftEnd:date,firstSuspendedShiftDate:collision,
  temporalBindings:normIds,provenance,exportAllowed:false};
 const suspension=profile.periods.length?(profile.suspensionProfileId==='sz-three'?'szThree':'three'):'none';
 return{outcome:'datedResearchValue',legalOpening:opening,ordinaryStart:add(opening,1),firstCountedDay,nominalEnd:nominal,end:date,
  skippedDays,endShiftDays:number(date)-number(nominal),suspension,calendar:selection.calendarId,temporalBindings:normIds,provenance,exportAllowed:false};
}
export function resealL2(catalog,manifest,files){
 for(const path of catalog.paths.filter(path=>path.contractFamily==='qualifiedDayProcedureV9')){
  const policy=catalog.qualificationPolicies.find(row=>row.pathId===path.pathId);policy.pathSha256=objSha(path);
  Object.assign(catalog.releaseBinding.pathEligibility.find(row=>row.pathId===path.pathId),eligibilityFor(path,policy,catalog));}
 const raw=encode(catalog);files.set(ADMIN,raw);const descriptor=manifest.artifacts.find(row=>row.path===ADMIN);
 Object.assign(descriptor,{sha256:sha(raw),byteLength:Buffer.byteLength(raw)});
}
async function actualFiles(manifest){const files=new Map();for(const descriptor of manifest.artifacts)files.set(descriptor.path,await readFile(resolve(ROOT,OUTPUT,'bundle',descriptor.path),'utf8'));return files;}
export async function runL2(){
 const manifest=JSON.parse(await readFile(resolve(ROOT,OUTPUT,'bundle/manifest.json'),'utf8')),files=await actualFiles(manifest),catalog=JSON.parse(files.get(ADMIN));
 const context=validateL2(catalog,manifest,files),results=[];
 for(const item of trustedBuild.research.cases){const input=researchInput(item,catalog),actual=evaluateL2(input,context);
  for(const[key,value]of Object.entries(item.expected))assert.deepEqual(actual[key],value,item.id+'/'+key);
  assert.equal(actual.exportAllowed,false);assert.equal(Object.hasOwn(actual,'end'),actual.outcome==='datedResearchValue');
  results.push({id:item.id,input,expected:structuredClone(item.expected),actual,provenance:'acceptedL1ConsumerReference'});}
 assert.equal(results.length,83);
 const syntheticProbeResults=[];function probe(id,input,expected){const actual=evaluateL2(input,context);
  for(const[key,value]of Object.entries(expected))assert.deepEqual(actual[key],value,id+'/'+key);
  syntheticProbeResults.push({id,input,expected,actual,provenance:'explicitTechnicalSyntheticProbe'});return actual;}
 const from=id=>structuredClone(results.find(row=>row.id===id).input),positive=id=>results.find(row=>row.input.path===id&&row.actual.outcome==='datedResearchValue');
 const missingFactRejections=[];
 for(const path of catalog.paths.filter(row=>row.contractFamily==='qualifiedDayProcedureV9')){
  const example=positive(path.pathId);assert.ok(example,'No positive contract example '+path.pathId);
  const policy=catalog.qualificationPolicies.find(row=>row.pathId===path.pathId);
  for(const req of policy.requirements){const input=structuredClone(example.input);delete input.facts[req.key];
   assert.equal(evaluateL2(input,context).outcome,'qualificationBoundaryProposed');missingFactRejections.push({path:path.pathId,fact:req.key});}}
 const ai=from('L1-AI-R22'),qualified=from('L1-AI-R21'),sz=from('L1-SZ-R09');
 for(const [id,edit]of[
  ['tracking-missing-expected',input=>delete input.facts.expectedService],['tracking-missing-entry',input=>delete input.facts.entryIntoSphere],
  ['tracking-wrong-holiday-regime',input=>input.facts.receiptHolidayRegime='other'],['tracking-string-true',input=>input.facts.expectedService='true'],
  ['wrong-revision',input=>input.pathRevision=2],['wrong-authority',input=>input.authoritySeatCanton='SZ'],['unknown-fact',input=>input.facts.extra=true],
  ['foreign-top-level-value',input=>input.exportAllowed=true],['invalid-date-overflow',input=>input.trigger='2026-02-30'],
  ['noninteger-duration',input=>input.days=2.5],['string-duration',input=>input.days='10'],['zero-duration',input=>input.days=0],
 ]){const input=structuredClone(ai);edit(input);probe(id,input,{outcome:'qualificationBoundaryProposed'});}
 const noOp=probe('qualified-saturday-no-tracking-rebase',qualified,{outcome:'datedResearchValue',legalOpening:'2026-09-19',end:'2026-09-29'});
 assert.deepEqual(noOp.provenance.openingShiftDates,[]);
 const winter=from('L1-AI-R25');probe('tracking-opening-not-shifted-to-end-of-recess',winter,{outcome:'datedResearchValue',legalOpening:'2026-12-28',firstCountedDay:'2027-01-03',end:'2027-01-12'});
 const physical=from('L1-AI-R22');physical.trigger='2026-09-22';physical.days=1;
 probe('tracking-mauritius-first-qualify-then-count',physical,{outcome:'datedResearchValue',legalOpening:'2026-09-23',end:'2026-09-24'});
 const interior=structuredClone(sz);interior.trigger='2026-11-02';probe('martinstag-inside-count-is-not-recess',interior,{outcome:'datedResearchValue',end:'2026-11-12',skippedDays:0});
 const crossing=from('L1-SZ-R01');crossing.trigger='2027-06-25';crossing.days=20;
 const phase=probe('sz-real-july-phase-not-new-math',crossing,{outcome:'datedResearchValue',end:'2027-08-16'});assert.deepEqual(phase.temporalBindings,['SZ-NORMS-PHASE1','SZ-NORMS-PHASE2']);
 for(const date of['2026-08-28','2027-12-31']){const input=structuredClone(ai);input.trigger=date;probe('full-window-'+date,input,{outcome:'researchWindowBoundary'});}
 const tooLong=from('L1-AI-R01');tooLong.days=366;probe('ordered-safety-guard-not-legal-maximum',tooLong,{outcome:'qualificationBoundaryProposed'});
 const fakeContext=JSON.parse(JSON.stringify(context));assert.equal(evaluateL2(ai,fakeContext).reason,'untrustedIsolatedProposal');
 let accessorInvoked=false;const accessor=structuredClone(ai);Object.defineProperty(accessor.facts,'expectedService',{enumerable:true,get(){accessorInvoked=true;return true;}});
 assert.equal(evaluateL2(accessor,context).outcome,'qualificationBoundaryProposed');assert.equal(accessorInvoked,false);
 const mutationRejections=[];
 function invalid(id,edit){const c=structuredClone(catalog),m=structuredClone(manifest),f=new Map(files);edit(c,m,f);resealL2(c,m,f);
  assert.throws(()=>validateL2(c,m,f),undefined,id);mutationRejections.push({id,recomputedEligibilityAndDescriptorHashes:true});}
 const p=(c,id)=>c.paths.find(row=>row.pathId===id),b=(c,id)=>c.holidayBindings.find(row=>row.holidayBindingId===id);
 for(const[id,edit]of[
  ['tracking-expected-service-removed',c=>p(c,'ai-admin-ordered').openingPolicy.trackingRequirements.shift()],
  ['tracking-rebases-every-receipt',c=>p(c,'ai-admin-ordered').openingPolicy.qualifiedTransformation='nextWorkingDayIfNonWorkingReceipt'],
  ['oral-action-gains-tracking',c=>p(c,'ai-admin-written-7').openingPolicy=structuredClone(p(c,'ai-admin-ordered').openingPolicy)],
  ['knowledge-action-gains-tracking',c=>p(c,'ai-internal-denial-30').openingPolicy=structuredClone(p(c,'ai-admin-ordered').openingPolicy)],
  ['longer-notice-unlinked-from-current-fact',c=>p(c,'ai-internal-notice-long').duration.valueFact='savedDays'],
  ['longer-notice-ambiguous-under31',c=>p(c,'ai-internal-notice-long').duration.minimum=11],
  ['provisional-automatic10',c=>p(c,'sz-admin-provisional-opposition').duration={kind:'statutoryDays',value:10,overridable:false}],
  ['provisional-maximum365',c=>p(c,'sz-admin-provisional-opposition').duration.maximum=365],
  ['martinstag-removed',c=>b(c,'sz-qualified-authority-seat').proceduralCalendarSupplement.dates.pop()],
  ['martinstag-altered',c=>b(c,'sz-qualified-authority-seat').proceduralCalendarSupplement.dates[0]='2026-11-12'],
  ['martinstag-counting-recess',c=>b(c,'sz-qualified-authority-seat').proceduralCalendarSupplement.effect='suspension'],
  ['martinstag-applied-to-ai',c=>b(c,'ai-qualified-authority-seat').proceduralCalendarSupplement=structuredClone(b(c,'sz-qualified-authority-seat').proceduralCalendarSupplement)],
  ['municipality-qualification-removed',c=>c.qualificationPolicies.find(row=>row.pathId==='sz-admin-ordered').requirements=c.qualificationPolicies.find(row=>row.pathId==='sz-admin-ordered').requirements.filter(row=>row.key!=='authorityMunicipality')],
  ['ai-end-collision-guard-removed',c=>p(c,'ai-court-ordered').endShiftGuard='none'],
  ['sz-winter-shortened-to-january2',c=>c.suspensionProfiles.find(row=>row.suspensionProfileId==='sz-three').periods.at(-1).end.day=2],
  ['sz-norm-gap',c=>p(c,'sz-court-ordered').normTimeline[0].interval.to='2027-06-29'],
  ['sz-norm-overlap',c=>p(c,'sz-court-ordered').normTimeline[1].interval.from='2027-06-30'],
  ['contract-decision-forged',c=>c.contractDecision.status='approved'],['release-forged',c=>c.releaseBinding.status='approved'],
  ['export-permission-forged',(c,m)=>m.extensions['steimer.local-reference'].calendarExportEnabled=true],
  ['old-path-modified',c=>c.paths[0].revision++],
  ['physical-calendar-modified',(c,m,f)=>{const location='calendars/ap22-sz-ec9f2c557fe4.json',v=JSON.parse(f.get(location));v.rules.pop();f.set(location,encode(v));
   const descriptor=m.artifacts.find(row=>row.path===location);descriptor.sha256=sha(f.get(location));descriptor.byteLength=Buffer.byteLength(f.get(location));}]
 ])invalid(id,edit);
 const counts=Object.fromEntries(['datedResearchValue','qualificationBoundaryProposed','researchWindowBoundary','unresolvedBoundaryProposed'].map(kind=>[kind,results.filter(row=>row.actual.outcome===kind).length]));
 const report={workPackage:'AP23L2',status:'passed',fixtureSha256:sha(await readFile(resolve(ROOT,'docs/fachrecht/ap23l1/referenzfaelle.json'))),
  manifestSha256:sha(encode(manifest)),catalogSha256:sha(files.get(ADMIN)),consumerReferenceCases:83,consumerOutcomeCounts:counts,
  syntheticProbes:syntheticProbeResults.length,missingCurrentFactRejections:missingFactRejections.length,negativeCatalogMutations:mutationRejections.length,
  untrustedContextRejected:true,accessorRejectedWithoutInvocation:!accessorInvoked,results,syntheticProbeResults,missingFactRejections,mutationRejections,
  runtimeActive:false,sourceReleaseApproved:false,calendarExportEnabled:false,productModulesImported:false,nativeProductChanged:false};
 await writeFile(resolve(ROOT,OUTPUT,'QA-AP23L2.json'),encode(report));return report;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,2);const report=await runL2();console.log(JSON.stringify({...report,results:report.results.length,syntheticProbeResults:report.syntheticProbeResults.length,
  missingFactRejections:report.missingFactRejections.length,mutationRejections:report.mutationRejections.length}));
}
