// SPDX-License-Identifier: AGPL-3.0-only
// Isolated V8 structure probe. New arithmetic never calls a product calculator.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from '../spfx/node_modules/ajv/dist/2020.js';
import addFormats from '../spfx/node_modules/ajv-formats/dist/index.js';
import {parseFormat14Data,parseFormat14LocalReferenceData} from '../src/core/releaseFormat14.ts';
import {calculateAdministrativeDeadline} from '../src/core/administrativeDeadline.ts';
import {administrativeInput14} from '../tests/core/ap23j3Fixtures.ts';
import {ROOT,BASE,OUTPUT,ADMIN,HOLIDAYS,WINDOW,CANTONS,sha,objSha,encode,canonical,
 buildK2Candidate,assertK2Preservation,eligibilityFor,bindingIdFor} from './build-ap23k2-candidate.mjs';
import {buildK2Schemas,K2_SCHEMA_FILES} from './build-ap23k2-schemas.mjs';
const issued=new WeakSet();
const schemaChecks=new WeakMap();
function assertSchema(value,schema){
 let check=schemaChecks.get(schema);if(!check){const ajv=new Ajv2020({strict:false,allErrors:true});addFormats(ajv);check=ajv.compile(schema);schemaChecks.set(schema,check);}
 assert.equal(check(value),true,JSON.stringify(check.errors));
}
const ms=86400000,ordinal=date=>Date.parse(date+'T00:00:00Z')/ms,iso=value=>new Date(value*ms).toISOString().slice(0,10);
export const add=(date,count)=>iso(ordinal(date)+count);
const weekday=date=>new Date(date+'T00:00:00Z').getUTCDay(),weekend=date=>[0,6].includes(weekday(date));
const valid=date=>typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(ordinal(date))&&iso(ordinal(date))===date;
const within=(date,span)=>valid(date)&&date>=span.from&&(span.to===null||date<=span.to);
const boundary=reason=>({outcome:'qualificationBoundaryProposed',reason,exportAllowed:false});
const outside=()=>({outcome:'researchWindowBoundary',reason:'outsideReferenceWindow',exportAllowed:false});
const same=(a,b,message)=>assert.deepEqual(a,b,message);
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const plain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&[Object.prototype,null].includes(Object.getPrototypeOf(value))
 &&Reflect.ownKeys(value).every(key=>typeof key==='string'&&own(Object.getOwnPropertyDescriptor(value,key),'value'));
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
export function easter(year){const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),v=h+l-7*m+114;return`${year}-${String(Math.floor(v/31)).padStart(2,'0')}-${String(v%31+1).padStart(2,'0')}`;}
export function physicalRuleOccurrence(rule,year){
 const c=rule.calculation;let date;
 if(c.type==='fixedMonthDay')date=`${year}-${String(c.month).padStart(2,'0')}-${String(c.day).padStart(2,'0')}`;
 else if(c.type==='easterOffsetDays')date=add(easter(year),c.offsetDays);
 else{assert.ok(['nthWeekdayOfMonth','nthWeekdayOffsetDays'].includes(c.type));date=`${year}-${String(c.month).padStart(2,'0')}-01`;let n=0;for(;;date=add(date,1))if((weekday(date)||7)===c.isoWeekday&&++n===c.occurrence)break;if(c.type==='nthWeekdayOffsetDays')date=add(date,c.offsetDays);}
 if(rule.condition==='unlessTuesdayOrSaturday'&&[2,6].includes(weekday(date)))return null;
 if(rule.condition==='onlyMonday'&&weekday(date)!==1)return null;
 if(rule.condition==='shiftHolyThursdayBy7Days'&&date>=add(easter(year),-7)&&date<easter(year))date=add(date,7);
 else assert.ok(['always','unlessTuesdayOrSaturday','onlyMonday','shiftHolyThursdayBy7Days',undefined].includes(rule.condition));
 return date;
}
export function calendarDates(id,calendars,year,visited=new Set()){
 assert.ok(!visited.has(id),'Calendar inheritance cycle');const next=new Set(visited);next.add(id);
 const calendar=calendars.find(row=>row.calendarId===id);assert.ok(calendar,'Missing calendar '+id);const dates=new Set();
 for(const rule of calendar.rules){if(rule.effect?.type!=='holiday')continue;const date=physicalRuleOccurrence(rule,year);if(date&&within(date,calendar.validity)&&within(date,rule.validity))dates.add(date);}
 for(const parent of calendar.inherits)for(const date of calendarDates(parent,calendars,year,next))dates.add(date);return dates;
}
/** Metadata annotations are exact accepted case observations, not input defaults. */
export function researchProvenance(item){
 const facts=structuredClone(item.facts),annotations={};
 if(item.id.startsWith('K1-BS-')){
  for(const key of ['authorityCanton','partyCanton','openingProvenance','orderProvenance'])if(own(facts,key)){
   const allowed={authorityCanton:['BS'],partyCanton:['TI'],openingProvenance:['lawfulPublicationConfirmed','actualSaturdayReceiptLegallyEstablished'],orderProvenance:['reasonsExtensionActuallyGrantedWithFresh15DayTerms']};
   assert.ok(allowed[key].includes(facts[key]),'Unaccepted case annotation '+item.id+'/'+key);annotations[key]=facts[key];delete facts[key];
  }
 }
 let kind='consumerReference';
 if(item.id.startsWith('K1-BL-')){
  assert.ok(own(facts,'regionalOfficeMode'),'Missing original BL uncertainty observation');
  const value=facts.regionalOfficeMode;
  if(['K1-BL-R17','K1-BL-R18'].includes(item.id)){same(value,item.id==='K1-BL-R17'?'noOptionalFullClosure':'confirmedFullClosure');kind='diagnosticWorldOracle';}
  else same(value,'unknown','A live case must not gain a closure override');
  annotations.regionalOfficeMode=value;delete facts.regionalOfficeMode;
 }
 return{originalFacts:structuredClone(item.facts),annotations,facts,kind};
}
export function researchInput(item,suite){
 const p=suite.paths.find(row=>row.id===item.path);assert.ok(p);const provenance=researchProvenance(item);
 return{input:{path:item.path.toLowerCase(),pathRevision:1,authoritySeatCanton:p.canton,trigger:item.trigger,days:item.days,facts:provenance.facts},provenance};
}
export function resealK2(catalog){
 for(const path of catalog.paths){if(path.contractFamily!=='qualifiedDayProcedureV8')continue;const policy=catalog.qualificationPolicies.find(row=>row.pathId===path.pathId);policy.pathSha256=objSha(path);Object.assign(catalog.releaseBinding.pathEligibility.find(row=>row.pathId===path.pathId),eligibilityFor(path,policy,catalog));}
}
export function validateK2(catalog,manifest,files,built,schemas){
 same([...files.keys()].sort(),manifest.artifacts.map(row=>row.path).sort(),'Exact actual payload inventory');
 for(const row of manifest.artifacts){const raw=files.get(row.path);same(sha(raw),row.sha256,'Actual descriptor SHA '+row.path);same(Buffer.byteLength(raw),row.byteLength,'Actual descriptor size '+row.path);}
 assertSchema(catalog,schemas.catalog);assertSchema(manifest,schemas.localManifest);
 assertK2Preservation({...built,catalog,files});
 // The guard and accepted K1/J3 bodies are the semantic authority. Resealing is insufficient.
 same(catalog,built.catalog,'Changed accepted K1 projection or preserved historical meaning');
 same(manifest,built.manifest,'Changed bound isolated manifest');
 const calendars=[...files.entries()].filter(([path])=>path.startsWith('calendars/')).map(([,bytes])=>JSON.parse(bytes));
 same(calendars.length,35);const holidays=JSON.parse(files.get(HOLIDAYS));same(holidays,built.holidayCatalog);
 const context=freeze({catalog:structuredClone(catalog),holidayCatalog:holidays,calendars,inputSchema:structuredClone(schemas.input)});issued.add(context);return context;
}
function resolvedCalendar(input,path,binding,context){
 const choice=binding.calendarSelection;
 if(choice.kind==='fixedAuthoritySeat')return{calendarId:choice.calendarId,projectionId:choice.projectionId,boundaryIds:[],ambiguity:null,alternativeCalendarId:null,terminal:null};
 if(input.facts[choice.qualificationFact]!==choice.qualifiedValue)return{error:'holidayAnchorNotQualified'};
 const canton=input.facts[choice.cantonFact];if(typeof canton!=='string'||!CANTONS.includes(canton))return{error:'holidayAnchorNotQualified'};
 const terminals=choice.terminals.filter(row=>row.canton===canton);if(terminals.length!==1)return{error:'calendarTerminalNotUnique'};const terminal=terminals[0];
 const area=input.areaFacts??{};if(!plain(area)||Object.keys(area).some(key=>!['AI-RTG-INNER-ADDITIONAL','NE-LANDERON-ADDITIONAL'].includes(key)||typeof area[key]!=='boolean'))return{error:'calendarAreaFactInvalid'};
 if(terminal.requiredAreaScopeIds.some(id=>!own(area,id)||typeof area[id]!=='boolean'))return{error:'calendarAreaFactRequired'};
 const variants=terminal.variants.filter(row=>row.areaFacts.every(fact=>own(area,fact.scopeId)&&area[fact.scopeId]===fact.member));if(variants.length!==1)return{error:'calendarVariantNotUnique'};
 const variant=variants[0],projection=context.holidayCatalog.activation.projections.find(row=>row.id===variant.projectionId);
 const alternative=variant.alternativeProjectionId===null?null:context.holidayCatalog.activation.projections.find(row=>row.id===variant.alternativeProjectionId);
 if(!projection||objSha(projection)!==variant.projectionSha256||alternative&&objSha(alternative)!==variant.alternativeProjectionSha256)return{error:'calendarProjectionInvalid'};
 return{calendarId:variant.calendarId,projectionId:variant.projectionId,boundaryIds:terminal.boundaryIds,ambiguity:terminal.ambiguity,alternativeCalendarId:alternative?.calendarId??null,terminal,projection,alternative};
}
function calculate(input,context,diagnosticWorld=null){
 if(!issued.has(context))return boundary('untrustedIsolatedProposal');
 if(!plain(input)||!plain(input.facts))return boundary('inputContractInvalid');
 const catalog=context.catalog,path=catalog.paths.find(row=>row.pathId===input.path&&row.contractFamily==='qualifiedDayProcedureV8');if(!path)return boundary('unknownResearchPath');
 if(!valid(input.trigger))return boundary('invalidResearchDate');
 const policy=catalog.qualificationPolicies.find(row=>row.pathId===input.path),binding=catalog.holidayBindings.find(row=>row.holidayBindingId===path.holidayBindingId),law=catalog.laws.find(row=>row.lawId===path.lawId);
 if(input.pathRevision!==path.revision||input.authoritySeatCanton!==law.canton)return boundary('pathContextMismatch');
 const allowed=new Set(policy.requirements.map(row=>row.key));if(binding.calendarSelection.kind==='qualifiedPartyOrRepresentativeCanton')allowed.add(binding.calendarSelection.cantonFact);
 if(Object.keys(input.facts).some(key=>!allowed.has(key)))return boundary('unknownResearchFact');
 for(const row of policy.requirements){if(!own(input.facts,row.key)|| (own(row,'value')?input.facts[row.key]!==row.value:!row.oneOf.includes(input.facts[row.key])))return boundary(row.reason);}
 if(!Number.isSafeInteger(input.days)||input.days<1)return boundary('dayDurationNotSpecified');
 if(path.duration.kind==='statutoryDays'&&input.days!==path.duration.value)return boundary('statutoryDurationMismatch');
 if(path.duration.kind==='authorityOrderedDays'&&(input.days<path.duration.minimum||input.days>path.duration.maximum))return boundary('orderedDurationOutsideTechnicalGuard');
 try{assertSchema(input,context.inputSchema);}catch{return boundary('inputContractInvalid');}
 const resolved=resolvedCalendar(input,path,binding,context);if(resolved.error)return boundary(resolved.error);
 const e=catalog.releaseBinding.pathEligibility.find(row=>row.pathId===path.pathId);if(e.pathSha256!==objSha(path)||e.qualificationPolicySha256!==objSha(policy)||e.holidayBindingSha256!==objSha(binding)||e.calendarSelectionSha256!==objSha(binding.calendarSelection)||e.annualEndShiftPolicySha256!==objSha(binding.annualEndShiftPolicy))return boundary('eligibilityBindingInvalid');
 const annual=binding.annualEndShiftPolicy,annualActive=annual.kind==='blCantonalOfficeClosures';
 const dependencies=[];function collect(id,seen=new Set()){assert.ok(!seen.has(id));if(dependencies.some(row=>row.calendarId===id))return;const c=context.calendars.find(row=>row.calendarId===id);assert.ok(c);dependencies.push(c);const next=new Set(seen);next.add(id);c.inherits.forEach(parent=>collect(parent,next));}
 collect(resolved.calendarId);if(resolved.alternativeCalendarId)collect(resolved.alternativeCalendarId);
 const spans=[WINDOW,path.temporalBinding.caseCoverage,path.temporalBinding.calculationCoverage,path.temporalBinding.sourceCoverage,e.caseCoverage,e.calculationCoverage,...dependencies.map(row=>row.validity),...dependencies.flatMap(row=>row.rules.filter(rule=>rule.effect?.type==='holiday').map(rule=>rule.validity))];
 if(annualActive)spans.push(annual.coverage);
 if(resolved.terminal){const raw=context.holidayCatalog.activation.procedureBindings.find(row=>row.id===resolved.terminal.bindingId);if(!raw||objSha(raw)!==resolved.terminal.bindingSha256)return boundary('calendarTerminalInvalid');spans.push(raw.caseCoverage);
  for(const recipe of [resolved.projection,resolved.alternative].filter(Boolean)){
   for(const id of new Set([...recipe.scopeIds,...raw.requiredAreaScopeIds])){const scope=context.holidayCatalog.data.scopes.find(row=>row.id===id),supp=context.holidayCatalog.activation.supplementalScopes.find(row=>row.id===id);if(!scope&&!supp)return boundary('calendarScopeInvalid');spans.push(scope?{from:scope.from,to:scope.to}:supp.legalValidity);for(const assignment of context.holidayCatalog.data.assignments.filter(row=>row.scopeId===id))spans.push({from:assignment.from,to:assignment.to});}
   for(const id of recipe.ruleIds){const rule=context.holidayCatalog.data.rules.find(row=>row.id===id),supp=context.holidayCatalog.activation.supplementalRules.find(row=>row.id===id);if(!rule&&!supp)return boundary('calendarRuleInvalid');spans.push(rule?{from:rule.from,to:rule.to}:supp.legalValidity);}
  }
 }
 const normIds=[],evaluatedNormSegments=[];function covered(date){if(!spans.every(span=>within(date,span)))return false;const norms=path.normTimeline.filter(row=>within(date,row.interval));if(norms.length!==1)return false;
  if(!normIds.includes(norms[0].researchBindingId)){normIds.push(norms[0].researchBindingId);evaluatedNormSegments.push(norms[0]);}
  if(annualActive&&annual.years.filter(row=>within(date,row.coverage)).length!==1)return false;return true;}
 if(!covered(input.trigger)||input.days>ordinal(WINDOW.to)-ordinal(input.trigger))return outside();
 let nominal=input.trigger;for(let n=0;n<input.days;n++){nominal=add(nominal,1);if(!covered(nominal))return outside();}
 const fixedClosures=new Set(annualActive?annual.years.flatMap(row=>row.dates):[]),optional=new Set(annualActive?annual.uncertainty.dates:[]),cache=new Map();
 const holiday=(date,calendarId)=>{const key=calendarId+'/'+date.slice(0,4);if(!cache.has(key))cache.set(key,calendarDates(calendarId,context.calendars,Number(date.slice(0,4))));return cache.get(key).has(date);};
 function shifted(calendarId,withOptional){let end=nominal;const chain=[];while(weekend(end)||holiday(end,calendarId)||fixedClosures.has(end)||withOptional&&optional.has(end)){chain.push(end);end=add(end,1);if(!covered(end))return{outside:true,chain};}return{end,chain};}
 const first=shifted(resolved.calendarId,false),second=annualActive?shifted(resolved.calendarId,true):first;
 const jan=resolved.alternativeCalendarId?shifted(resolved.alternativeCalendarId,false):null;
 if(first.outside||second.outside||jan?.outside)return outside();
 const provenance={holidayBindingId:binding.holidayBindingId,holidayBindingSha256:objSha(binding),calendarSelectionSha256:objSha(binding.calendarSelection),
  annualEndShiftPolicySha256:objSha(binding.annualEndShiftPolicy),openingPolicySha256:objSha(path.openingPolicy),inputMeaning:'qualifiedLegalOpeningDate',qualifiedOpeningDate:input.trigger,
  calendarId:resolved.calendarId,projectionId:resolved.projectionId,holidayRole:binding.anchor,authoritySeatCanton:law.canton,
  legalAnchorCanton:binding.anchor==='qualifiedPartyOrRepresentativeCanton'?input.facts.legalAnchorCanton:null,
  terminalBindingId:resolved.terminal?.bindingId??null,terminalBindingSha256:resolved.terminal?.bindingSha256??null,
  boundaryIds:[...resolved.boundaryIds],areaFacts:structuredClone(input.areaFacts??{}),evaluatedNormSegments:structuredClone(evaluatedNormSegments),
  sourceRefs:structuredClone([...path.sourceRefs,...binding.legalBinding.sourceRefs,...evaluatedNormSegments.flatMap(row=>row.sourceRefs),...annualActive?annual.years.flatMap(row=>row.sourceRefs):[]]),
  annualComparison:annualActive?{kind:'BL-B-FASNACHT',withoutOptionalEnd:first.end,withOptionalEnd:second.end,comparison:'twoCompleteAdministrativePaths',diagnosticOnly:true}:null,
  januaryComparison:jan?{bindingId:resolved.terminal.bindingId,variedCatalogRuleIds:[...resolved.ambiguity.catalogRuleIds],withoutJanuary2:first.end,withJanuary2:jan.end,diagnosticOnly:true}:null};
 if(diagnosticWorld===null){
  if(jan&&first.end!==jan.end)return{outcome:'unresolvedBoundaryProposed',reason:'januaryClarificationRequired',legalOpening:input.trigger,nominalEnd:nominal,provenance,exportAllowed:false};
  if(annualActive&&first.end!==second.end)return{outcome:'unresolvedBoundaryProposed',reason:annual.uncertainty.boundaryId,legalOpening:input.trigger,nominalEnd:nominal,provenance,exportAllowed:false};
 }
 const selected=diagnosticWorld==='withOptionalClosure'?second:first;
 return{outcome:'datedResearchValue',legalOpening:input.trigger,ordinaryStart:add(input.trigger,1),nominalEnd:nominal,end:selected.end,
  endShiftDays:ordinal(selected.end)-ordinal(nominal),suspension:'none',temporalBindings:[...normIds],provenance,exportAllowed:false};
}
export function evaluateK2(input,context){return calculate(input,context);}
function rehash(catalog,manifest,files){resealK2(catalog);const raw=encode(catalog);files.set(ADMIN,raw);Object.assign(manifest.artifacts.find(row=>row.path===ADMIN),{sha256:sha(raw),byteLength:Buffer.byteLength(raw)});}
export async function runK2(){
 const built=await buildK2Candidate(),schemaBuild=await buildK2Schemas(),schemas=schemaBuild.schemas;
 const {catalog,manifest,files}=built,context=validateK2(catalog,manifest,files,built,schemas),calendars=context.calendars;
 const results=[],branchOracleResults=[],adaptation=[];
 for(const original of built.research.cases){const {input,provenance}=researchInput(original,built.research);adaptation.push({id:original.id,originalFacts:provenance.originalFacts,annotations:provenance.annotations,kind:provenance.kind,projectedInput:input,analystExpected:original.analystExpected??original.expected});
  const expected=original.expected;if(provenance.kind==='diagnosticWorldOracle'){const world=original.id==='K1-BL-R17'?'withoutOptionalClosure':'withOptionalClosure',actual=calculate(input,context,world);same(actual.outcome,expected.outcome);same(actual.end,expected.end);branchOracleResults.push({id:original.id,input,world,expected,actual,consumerInput:false});}
  else{const actual=evaluateK2(input,context);same(actual.outcome,expected.outcome,'Original K1 outcome '+original.id);if(expected.outcome==='datedResearchValue')same(actual.end,expected.end,'Original K1 end '+original.id);results.push({id:original.id,input,expected,actual,provenance:'acceptedK1ConsumerReference'});}}
 same(results.length,65);same(branchOracleResults.length,2);same(adaptation.length,67);
 const syntheticProbeResults=[];function probe(id,input,expected){const actual=evaluateK2(input,context);same(actual.outcome,expected.outcome,id);if(expected.end)same(actual.end,expected.end,id);syntheticProbeResults.push({id,input,expected,actual,provenance:'explicitSyntheticK2Probe'});return actual;}
 const bs=researchInput(built.research.cases.find(row=>row.id==='K1-BS-R03'),built.research).input;
 const bl=researchInput(built.research.cases.find(row=>row.id==='K1-BL-R01'),built.research).input;
 const bsAnchor=(canton,trigger='2026-10-02',days=10)=>({...structuredClone(bs),trigger,days,facts:{...bs.facts,legalAnchorCanton:canton}});
 probe('bs-court-bl-anchor-no-bl-office-closure',bsAnchor('BL','2026-12-14'),{outcome:'datedResearchValue',end:'2026-12-24'});
 probe('bl-procedure-uses-annual-closure-chain',{...structuredClone(bl),trigger:'2026-12-14',days:10},{outcome:'datedResearchValue',end:'2027-01-04'});
 for(const canton of CANTONS){const input=bsAnchor(canton),areaFacts=canton==='AI'?{'AI-RTG-INNER-ADDITIONAL':false}:canton==='NE'?{'NE-LANDERON-ADDITIONAL':false}:{};if(Object.keys(areaFacts).length)input.areaFacts=areaFacts;probe('bs-qualified-national-anchor-'+canton,input,{outcome:'datedResearchValue',end:'2026-10-12'});}
 for(const [canton,key] of [['AI','AI-RTG-INNER-ADDITIONAL'],['NE','NE-LANDERON-ADDITIONAL']]){
  probe('bs-'+canton+'-missing-current-area',bsAnchor(canton),{outcome:'qualificationBoundaryProposed'});
  probe('bs-'+canton+'-explicit-positive-area',{...bsAnchor(canton),areaFacts:{[key]:true}},{outcome:'datedResearchValue',end:'2026-10-12'});
 }
 for(const [member,end] of [[false,'2027-09-22'],[true,'2027-09-23']])probe('bs-ai-september-region-'+member,{...bsAnchor('AI','2027-09-12'),areaFacts:{'AI-RTG-INNER-ADDITIONAL':member}},{outcome:'datedResearchValue',end});
 for(const [member,end] of [[false,'2027-05-27'],[true,'2027-05-28']])probe('bs-ne-corpus-christi-region-'+member,{...bsAnchor('NE','2027-05-17'),areaFacts:{'NE-LANDERON-ADDITIONAL':member}},{outcome:'datedResearchValue',end});
 const sg=probe('bs-sg-bound-january-comparison',bsAnchor('SG','2026-12-23'),{outcome:'datedResearchValue',end:'2027-01-04'});same(sg.provenance.januaryComparison.variedCatalogRuleIds,['SG-ZPO-ADDITIONAL-DAY-BERCHTOLD']);
 for(const [id,input] of [['bs-missing-anchor',{...bs,facts:{...bs.facts,legalAnchorCanton:''}}],['bs-multiple-anchors',{...bs,facts:{...bs.facts,legalAnchorCanton:['BS','TI']}}],['bs-authority-anchor-only',{...bs,facts:{...bs.facts,legalAnchorQualification:'authoritySeatOnly'}}],['bs-unknown-area-key',{...bs,areaFacts:{unknown:true}}],['bs-foreign-role-input',{...bs,role:'partyWithoutRepresentative'}]])probe(id,input,{outcome:'qualificationBoundaryProposed'});
 for(const mode of ['noOptionalFullClosure','confirmedFullClosure'])probe('bl-consumer-override-forbidden-'+mode,{...bl,facts:{...bl.facts,regionalOfficeMode:mode}},{outcome:'qualificationBoundaryProposed'});
 for(const date of ['2026-08-28','2027-12-31'])probe('complete-window-'+date,{...bl,trigger:date},{outcome:'researchWindowBoundary'});
 const inputMutations=[];
 for(const path of built.research.paths){const positive=results.find(row=>row.input.path===path.id.toLowerCase()&&row.actual.outcome==='datedResearchValue');assert.ok(positive,'No positive K2 consumer example '+path.id);const q=catalog.qualificationPolicies.find(row=>row.pathId===positive.input.path);
  for(const requirement of q.requirements){const changed=structuredClone(positive.input);delete changed.facts[requirement.key];same(evaluateK2(changed,context).outcome,'qualificationBoundaryProposed');inputMutations.push(path.id+':missing:'+requirement.key);}}
 let accessorInvoked=false;const accessor={...bs,facts:{...bs.facts}};Object.defineProperty(accessor.facts,'legalAnchorCanton',{enumerable:true,get(){accessorInvoked=true;return'BS';}});same(evaluateK2(accessor,context).outcome,'qualificationBoundaryProposed');same(accessorInvoked,false);inputMutations.push('accessor-not-invoked');
 same(evaluateK2(bs,structuredClone(context)).outcome,'qualificationBoundaryProposed');same(evaluateK2(bs,{}).outcome,'qualificationBoundaryProposed');inputMutations.push('serialized-and-forged-proposal-contexts');
 const mutationRejections=[];
 function invalid(id,edit){const c=structuredClone(catalog),m=structuredClone(manifest),f=new Map(files);edit(c,m,f);rehash(c,m,f);assert.throws(()=>validateK2(c,m,f,built,schemas),undefined,id);mutationRejections.push({id,actualDescriptorHashesVerified:true,afterRecomputedEligibilityAndDescriptorHashes:true});}
 const newBinding=(c,id)=>c.holidayBindings.find(row=>row.holidayBindingId===id);
 const p=c=>c.paths.find(row=>row.pathId==='bs-court-register-10');
 for(const [id,edit] of [
  ['annual-closure-removed',c=>newBinding(c,'bl-authority-seat').annualEndShiftPolicy.years[0].dates.pop()],
  ['half-day-promoted',c=>newBinding(c,'bl-authority-seat').annualEndShiftPolicy.years[1].dates.push('2027-02-15')],
  ['closure-added-to-bs-party-calendar',c=>newBinding(c,'bs-party-representative').annualEndShiftPolicy=structuredClone(newBinding(c,'bl-authority-seat').annualEndShiftPolicy)],
  ['regional-override-enabled',c=>newBinding(c,'bl-authority-seat').annualEndShiftPolicy.uncertainty.inputOverride='allowed'],
  ['fasnacht-shifted',c=>newBinding(c,'bl-authority-seat').annualEndShiftPolicy.uncertainty.dates=['2027-02-10']],
  ['terminal-removed',c=>newBinding(c,'bs-party-representative').calendarSelection.terminals.pop()],
  ['terminal-fallback',c=>newBinding(c,'bs-party-representative').calendarSelection.otherwise='useBS'],
  ['terminal-regions-removed',c=>newBinding(c,'bs-party-representative').calendarSelection.terminals.find(row=>row.canton==='AI').requiredAreaScopeIds=[]],
  ['sg-foreign-rule-varied',c=>newBinding(c,'bs-party-representative').calendarSelection.terminals.find(row=>row.canton==='SG').ambiguity.catalogRuleIds=['CH-CAL-HOL-NATIONAL-DAY']],
  ['norm-date-gap',c=>p(c).normTimeline[0].interval.to='2026-12-30'],
  ['overlapping-norms',c=>p(c).normTimeline[1].interval.from='2026-12-31'],
  ['court-recess-introduced',c=>c.suspensionProfiles.find(row=>row.suspensionProfileId==='bs-none').periods.push({periodId:'fake'})],
  ['same-trigger-rebound-to-registration',c=>p(c).openingPolicy.triggerKind='registrationResult'],
  ['source-role-upgraded',c=>c.sources.find(row=>row.sourceId==='SRC-K1-BL-RRB2025-51').kind='statute'],
  ['source-dropped',c=>c.sources.pop()],['decision-approved',c=>c.contractDecision.status='approved'],
  ['release-approved',c=>c.releaseBinding.status='approved'],['candidate-export-enabled',(c,m)=>m.extensions['steimer.local-reference'].calendarExportEnabled=true],
  ['nonadmin-calendar-mutated',(c,m,f)=>{const key='calendars/ap22-bs-39a64bdfc0fe.json',v=JSON.parse(f.get(key));v.rules.pop();f.set(key,encode(v));const d=m.artifacts.find(row=>row.path===key);d.sha256=sha(f.get(key));d.byteLength=Buffer.byteLength(f.get(key));}]
 ])invalid(id,edit);
 // Old parsing/calculation is a separate regression lane, never the V8 arithmetic oracle.
 const baseFiles=new Map();for(const row of built.manifest0.artifacts)baseFiles.set(row.path,(await readFile(resolve(ROOT,BASE,row.path))).toString('utf8'));
 const oldData=parseFormat14LocalReferenceData(encode(built.manifest0),baseFiles),oldResults=[];
 for(const path of built.old.paths){const q=built.old.qualificationPolicies.find(row=>row.pathId===path.pathId),days=path.duration.kind==='statutoryDays'?path.duration.value:Math.max(7,path.duration.minimum??1);
  const overrides=q.mode==='qualifiedDayProcedureV7'?Object.fromEntries(q.requirements.map(row=>[row.key,own(row,'value')?row.value:row.oneOf[0]])):undefined;
  const input=administrativeInput14(built.old,path.pathId,'2026-10-02',days,path.stages[0],overrides),actual=calculateAdministrativeDeadline(input,oldData);
  same(actual.outcome,'calculated','Preserved native reference '+path.pathId);same(actual.referenceOnly,true);same(actual.calendarExportAllowed,false);oldResults.push({pathId:path.pathId,input,finalEnd:actual.finalEnd,outcome:actual.outcome,exportAllowed:false});}
 const readerNegatives=[],readerApprovalSpoofChecks=[];
 const spoofApproved=structuredClone(manifest);spoofApproved.releaseStatus='approved';spoofApproved.extensions['steimer.local-reference'].sourceReleaseApproved=true;spoofApproved.extensions['steimer.local-reference'].calendarExportEnabled=true;
 for(const [id,parser] of [['format14-local-rejects-format15',parseFormat14LocalReferenceData],['format14-approved-rejects-format15',parseFormat14Data]]){assert.throws(()=>parser(encode(manifest),files));readerNegatives.push(id);assert.throws(()=>parser(encode(spoofApproved),files));readerApprovalSpoofChecks.push({reader:id,formatVersion:'15.0.0',releaseStatus:'approved',sourceReleaseApproved:true,calendarExportEnabled:true,result:'rejected'});}
 const counts=Object.fromEntries(['datedResearchValue','qualificationBoundaryProposed','unresolvedBoundaryProposed','researchWindowBoundary'].map(kind=>[kind,results.filter(row=>row.actual.outcome===kind).length]));
 const calendarProbeResults=[];
 for(const [calendarId,date,expected] of [['ap22-ar-88bb22c08a22','2026-12-26',false],['ap22-ar-88bb22c08a22','2027-12-26',true],['ap22-ai-5d4e5a68e106','2026-12-26',false],['ap22-ai-5d4e5a68e106','2027-12-26',true],['ap22-gl-87c11e156541','2026-04-02',false],['ap22-gl-87c11e156541','2026-04-09',true],['ap22-gl-87c11e156541','2027-04-01',true]]){
  const formulaOnly=date<'2026-08-29',calendar=calendars.find(row=>row.calendarId===calendarId),year=Number(date.slice(0,4));
  // April2026 predates the approved activation. Inspect its formula, never bypass a consumer window.
  const actual=formulaOnly?calendar.rules.filter(rule=>rule.effect?.type==='holiday').some(rule=>physicalRuleOccurrence(rule,year)===date):calendarDates(calendarId,calendars,year).has(date);
  same(actual,expected,'Physical rule date '+calendarId+'/'+date);calendarProbeResults.push({calendarId,date,expected,actual,calendarDataOnly:true,legalCaseWindowApplied:false,calendarActivationApplied:!formulaOnly,probeMeaning:formulaOnly?'formulaOnlyNotAnEligibleCalendarDate':'activatedCalendarData'});}
 const evidence=await Promise.all(['scripts/build-ap23k2-candidate.mjs','scripts/check-ap23k2-contract.mjs',OUTPUT+'/candidate-integrity.json',OUTPUT+'/source-crosswalk.json',OUTPUT+'/research-map.json',OUTPUT+'/bundle/manifest.json',OUTPUT+'/bundle/'+ADMIN,...Object.values(K2_SCHEMA_FILES)]
  .map(async path=>{const bytes=await readFile(resolve(ROOT,path));return{path,byteLength:bytes.length,sha256:sha(bytes)};}));
 return{workPackage:'AP23K2',status:'passed',runtimeActive:false,productIntegrationTest:false,sourceReleaseApproved:false,calendarExportEnabled:false,
  paths:165,newPaths:16,preservedPaths:149,artifacts:44,unchangedRawArtifacts:43,physicalCalendars:35,holidayCatalogRules:499,
  originalK1Cases:67,consumerReferenceCases:65,diagnosticWorldOracleCases:2,consumerOutcomeCounts:counts,originalCaseFactsPreserved:true,
  allNewArithmeticProductImports:false,oldNativeReferenceCalculations:oldResults.length,readerNegatives,readerApprovalSpoofChecks,negativeCatalogMutations:mutationRejections.length,
  allCatalogMutationsResealed:true,negativeInputMutations:inputMutations.length,syntheticProbes:syntheticProbeResults.length,
  physicalCalendarProbes:calendarProbeResults.length,results,branchOracleResults,syntheticProbeResults,calendarProbeResults,oldResults,adaptation,mutationRejections,inputMutations,evidence};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.ok(process.argv.slice(2).every(arg=>arg==='--write'));const report=await runK2();if(process.argv.includes('--write'))await writeFile(resolve(ROOT,OUTPUT,'QA-AP23K2.json'),encode(report));
 console.log(JSON.stringify({...report,results:undefined,branchOracleResults:undefined,syntheticProbeResults:undefined,calendarProbeResults:undefined,oldResults:undefined,adaptation:undefined,mutationRejections:undefined,inputMutations:undefined,evidence:undefined},null,2));
}
