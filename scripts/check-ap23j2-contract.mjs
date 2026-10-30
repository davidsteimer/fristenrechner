// SPDX-License-Identifier: AGPL-3.0-only
// Isolated J2 proposal probe. No Format14 production reader or export capability.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertSchema} from '../src/core/schemaContract.ts';
import {assertAdministrativeProcedureCatalogV6} from '../src/core/administrativeCatalogV6.ts';
import {parseFormat13Data,parseFormat13LocalReferenceData} from '../src/core/releaseFormat13.ts';
import {calculateAdministrativeDeadline} from '../src/core/administrativeDeadline.ts';
import {administrativeInput13} from '../tests/core/ap23i3Fixtures.ts';
import {ROOT,BASE,OUTPUT,ADMIN,HOLIDAYS,RESEARCH,WINDOW,sha,objSha,encode,
  buildJ2Candidate,durationFor,selectionFor,openingFor,eligibilityFor,stagesFor} from './build-ap23j2-candidate.mjs';
import {buildJ2Schemas,J2_SCHEMA_FILES,projectJ2Requirement} from './build-ap23j2-schemas.mjs';

const read=path=>readFile(resolve(ROOT,path),'utf8');
const json=async path=>JSON.parse(await read(path));
const same=(a,b,label)=>assert.deepEqual(a,b,label);
const index=(rows,key)=>{const map=new Map(rows.map(row=>[row[key],row]));same(map.size,rows.length,'Duplicate '+key);return map;};
const dayMs=86400000,epoch=date=>Date.parse(date+'T00:00:00Z')/dayMs;
const iso=n=>new Date(n*dayMs).toISOString().slice(0,10),add=(date,n)=>iso(epoch(date)+n);
const valid=date=>typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(epoch(date))&&iso(epoch(date))===date;
const within=(date,span)=>valid(date)&&date>=span.from&&(span.to===null||date<=span.to);
const weekday=date=>new Date(date+'T00:00:00Z').getUTCDay(),weekend=date=>[0,6].includes(weekday(date));
const boundary=reason=>({outcome:'qualificationBoundaryProposed',reason,exportAllowed:false});
const windowBoundary=()=>({outcome:'researchWindowBoundary',reason:'outsideReferenceWindow',exportAllowed:false});
const scalar=value=>typeof value==='string'||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value);
function dataProperties(value){
  return value!==null&&typeof value==='object'&&!Array.isArray(value)&&[Object.prototype,null].includes(Object.getPrototypeOf(value))
    &&Reflect.ownKeys(value).every(key=>typeof key==='string'&&Object.hasOwn(Object.getOwnPropertyDescriptor(value,key),'value'));
}

const fixtureAnnotations={
  'JU-J1-R11':{path:'JU-REVIEW-ORDERED',values:{actualReviewTarget:'GouvernementUnder172'}},
  'JU-J1-R13':{path:'JU-CONFIRMATION-REQUEST5-INITIAL',values:{qualifiedLegalOpening:true,triggerKind:'actualLawfulOralOpening'}},
  'JU-J1-R14':{path:'JU-CONFIRMATION-REQUEST5-REVIEW',values:{qualifiedLegalOpening:true,triggerKind:'actualLawfulOralOpening'}},
  'JU-J1-R15':{path:'JU-CONFIRMATION-REQUEST5-PROVISIONAL',values:{qualifiedLegalOpening:true,triggerKind:'actualLawfulOralOpening'}},
  'JU-J1-R22':{path:'JU-REVIEW-FINAL30',values:{actualReviewTarget:'unqualifiedSpecialCommission'},blockingFact:{reviewTargetQualified:false}}
};
export function researchProvenance(item){
  const annotation=fixtureAnnotations[item.id],currentOverrides=structuredClone(item.facts??{}),annotations={};
  if(annotation){same(item.path,annotation.path,'Exact annotated fixture path '+item.id);
    for(const[key,value]of Object.entries(annotation.values)){same(currentOverrides[key],value,'Exact annotated fixture value '+item.id+'/'+key);
      annotations[key]=currentOverrides[key];delete currentOverrides[key];}
    for(const[key,value]of Object.entries(annotation.blockingFact??{}))same(currentOverrides[key],value,'Preserved negative qualification '+item.id+'/'+key);
  }
  return{originalOverrides:structuredClone(item.facts??{}),annotations,currentOverrides};
}

/** Research-only adaptation. Real calls never receive synthetic defaults. */
export function researchInput(item,suite){
  const p=suite.paths.find(row=>row.id===item.path)??suite.paths[0];
  const base={...suite.sharedSyntheticFacts,...p.syntheticFacts};
  const allowed=new Set([...suite.sharedRequirements,...p.requirements].map(row=>row.key));
  const selected=Object.fromEntries(Object.entries(base).filter(([key])=>allowed.has(key)));
  return{path:item.path.toLowerCase(),pathRevision:1,authoritySeatCanton:p.canton,trigger:item.trigger,days:item.days,
    facts:{...selected,...researchProvenance(item).currentOverrides}};
}

export function easter(year){
  const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),
    h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),v=h+l-7*m+114;
  return`${year}-${String(Math.floor(v/31)).padStart(2,'0')}-${String(v%31+1).padStart(2,'0')}`;
}
const periodDate=(expr,year)=>expr.type==='easterOffset'?add(easter(year+expr.yearOffset),expr.days):
  `${year+expr.yearOffset}-${String(expr.month).padStart(2,'0')}-${String(expr.day).padStart(2,'0')}`;
function occurrence(rule,year){
  const c=rule.calculation;let date;
  if(c.type==='fixedMonthDay')date=`${year}-${String(c.month).padStart(2,'0')}-${String(c.day).padStart(2,'0')}`;
  else if(c.type==='easterOffsetDays')date=add(easter(year),c.offsetDays);
  else{
    assert.ok(['nthWeekdayOfMonth','nthWeekdayOffsetDays'].includes(c.type),'Unknown physical calculation');
    date=`${year}-${String(c.month).padStart(2,'0')}-01`;let n=0;
    for(;;date=add(date,1))if((weekday(date)||7)===c.isoWeekday&&++n===c.occurrence)break;
    if(c.type==='nthWeekdayOffsetDays')date=add(date,c.offsetDays);
  }
  if(rule.condition==='unlessTuesdayOrSaturday'&&[2,6].includes(weekday(date)))return null;
  if(rule.condition==='onlyMonday'&&weekday(date)!==1)return null;
  if(rule.condition==='shiftHolyThursdayBy7Days'&&date>=add(easter(year),-7)&&date<easter(year))date=add(date,7);
  else assert.ok(['always','unlessTuesdayOrSaturday','onlyMonday','shiftHolyThursdayBy7Days',undefined].includes(rule.condition),'Unknown condition');
  return date;
}
export function calendarDates(id,calendars,year,legalValidity=true,visiting=new Set()){
  assert.ok(!visiting.has(id),'Cyclic physical dependency');visiting.add(id);
  const calendar=calendars.find(row=>row.calendarId===id);assert.ok(calendar,'Missing physical calendar '+id);const dates=new Set();
  for(const rule of calendar.rules){
    if(rule.effect?.type!=='holiday')continue;
    const date=occurrence(rule,year);if(date&&(!legalValidity||within(date,calendar.validity)&&within(date,rule.validity)))dates.add(date);
  }
  for(const parent of calendar.inherits)for(const date of calendarDates(parent,calendars,year,legalValidity,new Set(visiting)))dates.add(date);
  return dates;
}

function qualifications(input,catalog){
  if(!dataProperties(input))return{error:'inputContractInvalid'};
  const p=catalog.paths.find(row=>row.pathId===input.path),q=catalog.qualificationPolicies.find(row=>row.pathId===input.path);
  if(!p||p.contractFamily!=='qualifiedDayProcedureV7'||q?.mode!=='qualifiedDayProcedureV7')return{error:'unknownResearchPath'};
  if(!valid(input.trigger))return{error:'invalidResearchDate'};
  if(input.pathRevision!==p.revision||catalog.laws.find(row=>row.lawId===p.lawId)?.canton!==input.authoritySeatCanton)return{error:'pathContextMismatch'};
  const allowed=new Set(q.requirements.map(row=>row.key));
  if(!dataProperties(input.facts)||Object.keys(input.facts).some(key=>!allowed.has(key)))return{error:'unknownResearchFact'};
  for(const row of q.requirements){const value=input.facts[row.key];
    if(!Object.hasOwn(input.facts,row.key)||!scalar(value)||(Object.hasOwn(row,'value')?value!==row.value:!row.oneOf.some(expected=>value===expected)))return{error:row.reason};}
  return{p,q};
}

/** Only a local proposal evaluator. Its successful result never permits export. */
export function evaluateJ2(input,catalog,calendars,inputSchema,manifestCoverage=WINDOW){
  const checked=qualifications(input,catalog);if(checked.error)return boundary(checked.error);
  const{p,q}=checked;
  if(!Number.isSafeInteger(input.days)||input.days<1)return boundary('dayDurationNotSpecified');
  if(p.duration.kind==='statutoryDays'&&input.days!==p.duration.value)return boundary('statutoryDurationMismatch');
  if(p.duration.kind==='authorityOrderedDays'&&(input.days<p.duration.minimum||input.days>p.duration.maximum))return boundary('orderedDurationOutsideTechnicalGuard');
  try{assertSchema(input,inputSchema);}catch{return boundary('inputContractInvalid');}
  const e=catalog.releaseBinding.pathEligibility.find(row=>row.pathId===p.pathId&&row.pathRevision===p.revision);
  const binding=catalog.holidayBindings.find(row=>row.holidayBindingId===p.holidayBindingId);
  if(!e||e.status!=='candidate'||e.pathSha256!==objSha(p)||e.qualificationPolicySha256!==objSha(q)
    ||e.openingPolicySha256!==objSha(p.openingPolicy)||e.holidayBindingId!==p.holidayBindingId||e.holidayBindingSha256!==objSha(binding))return boundary('proposalEligibilityInvalid');
  if(p.qualification.delivery!=='qualifiedTriggerAccordingToOpeningPolicy'||q.openingChainPolicy!=='notApplicable')return boundary('openingContractInvalid');
  if(p.suspensionSelection.kind!=='fixed'||e.suspensionSelectionSha256!==objSha(p.suspensionSelection))return boundary('suspensionSelectionInvalid');
  const profile=catalog.suspensionProfiles.find(row=>row.suspensionProfileId===p.suspensionSelection.suspensionProfileId);
  if(!profile||profile.lawId!==p.lawId||e.suspensionProfiles.length!==1||e.suspensionProfiles[0].suspensionProfileId!==profile.suspensionProfileId
    ||e.suspensionProfiles[0].sha256!==objSha(profile))return boundary('suspensionSelectionInvalid');
  if(!binding||binding.lawId!==p.lawId||binding.authoritySeatCanton!==input.authoritySeatCanton)return boundary('calendarBindingInvalid');
  const dependencies=[];
  function collect(id,visiting=new Set()){
    if(visiting.has(id))throw new Error('Cyclic calendar');if(dependencies.some(row=>row.calendarId===id))return;
    const c=calendars.find(row=>row.calendarId===id);if(!c)throw new Error('Missing calendar dependency');dependencies.push(c);
    const next=new Set(visiting);next.add(id);for(const parent of c.inherits)collect(parent,next);
  }
  collect(binding.physicalBaseline.calendarId);
  const spans=[manifestCoverage,p.temporalBinding.caseCoverage,p.temporalBinding.calculationCoverage,p.temporalBinding.sourceCoverage,
    e.caseCoverage,e.calculationCoverage,...dependencies.map(row=>row.validity)];
  const temporalBindings=[],openingNormSegments=[],allNormSegments=[];
  function covered(date,openingPhase=false){
    const norms=p.normTimeline.filter(row=>within(date,row.interval));
    if(!spans.every(span=>within(date,span))||norms.length!==1)return false;
    if(!temporalBindings.includes(norms[0].researchBindingId))temporalBindings.push(norms[0].researchBindingId);
    if(!allNormSegments.includes(norms[0]))allNormSegments.push(norms[0]);
    if(openingPhase&&!openingNormSegments.includes(norms[0]))openingNormSegments.push(norms[0]);return true;
  }
  const holidayCache=new Map(),isHoliday=date=>{
    const year=Number(date.slice(0,4));if(!holidayCache.has(year))holidayCache.set(year,calendarDates(binding.physicalBaseline.calendarId,calendars,year));
    return holidayCache.get(year).has(date);
  };
  const paused=date=>profile.periods.some(period=>[Number(date.slice(0,4))-1,Number(date.slice(0,4))].some(year=>
    date>=periodDate(period.start,year)&&date<=periodDate(period.end,year)));
  if(!covered(input.trigger,true))return windowBoundary();
  const op=p.openingPolicy;let opening=input.trigger;const openingShiftDates=[];
  if(op.kind==='qualifiedCurrentTrigger'){
    if(op.transformation!=='none')return boundary('openingContractInvalid');
  }else if(op.kind==='geQualifiedOrOrdinaryPost'){
    if(input.authoritySeatCanton!=='GE'||op.factKey!=='openingMode'||op.otherwise!=='block'||op.holidayBinding!=='sameAsPath'
      ||op.ordinaryPostTransformation!=='nextWorkingDayIfNonWorkingReceipt'
      ||JSON.stringify(op.allowedModes)!==JSON.stringify(['qualifiedLegalOpening','ordinaryPostPhysicalReceipt']))return boundary('openingContractInvalid');
    if(!Object.hasOwn(input.facts,op.factKey)||!op.allowedModes.includes(input.facts[op.factKey]))return boundary('openingModeUnqualified');
    if(input.facts.openingMode==='ordinaryPostPhysicalReceipt')while(weekend(opening)||isHoliday(opening)){
      opening=add(opening,1);if(!covered(opening,true))return windowBoundary();openingShiftDates.push(opening);
    }
  }else return boundary('openingContractInvalid');
  const inputMeaning=op.kind==='qualifiedCurrentTrigger'?'qualifiedCurrentTriggerDate':
    input.facts.openingMode==='ordinaryPostPhysicalReceipt'?'physicalOrdinaryPostReceiptDate':'qualifiedLegalOpeningDate';
  const openingResolution={policyKind:op.kind,openingPolicySha256:objSha(op),inputMode:op.kind==='geQualifiedOrOrdinaryPost'?input.facts.openingMode:null,inputMeaning,
    inputDate:input.trigger,qualifiedOpeningDate:opening,openingShiftDates,triggerKind:op.kind==='qualifiedCurrentTrigger'?op.triggerKind:null,
    evaluatedNormSegments:structuredClone(openingNormSegments),sourceRefs:structuredClone(op.sourceRefs),exportAllowed:false};
  let date=opening,counted=0,skippedDays=0,firstCountedDay;
  while(counted<input.days){date=add(date,1);if(!covered(date))return windowBoundary();
    if(paused(date)){skippedDays++;continue;}firstCountedDay??=date;counted++;}
  const nominalEnd=date,shifted=[];
  while(weekend(date)||isHoliday(date)){date=add(date,1);if(!covered(date))return windowBoundary();shifted.push(date);}
  const collision=shifted.find(paused);
  if(collision&&p.endShiftGuard==='blockWhenEnteringApplicableSuspension')return{outcome:'unresolvedBoundaryProposed',reason:'J1-END-SUSPENSION',
    legalOpening:opening,nominalEnd,ordinaryShiftEnd:date,firstSuspendedShiftDate:collision,openingResolution,exportAllowed:false};
  return{outcome:'datedResearchValue',legalOpening:opening,ordinaryStart:add(opening,1),firstCountedDay,nominalEnd,end:date,
    openingShiftDays:epoch(opening)-epoch(input.trigger),skippedDays,endShiftDays:epoch(date)-epoch(nominalEnd),
    suspension:profile.periods.length===3?'three':profile.periods.length===2?'two':'none',temporalBindings,openingResolution,exportAllowed:false};
}

/** Resealing adversarial proposals does not grant a capability. */
export function resealJ2(catalog){
  for(const p of catalog.paths){const q=catalog.qualificationPolicies.find(row=>row.pathId===p.pathId),e=catalog.releaseBinding.pathEligibility.find(row=>row.pathId===p.pathId);
    if(!q||!e)continue;q.pathSha256=objSha(p);
    if(p.contractFamily==='qualifiedDayProcedureV7')Object.assign(e,eligibilityFor(p,q,catalog));
    else{const b=catalog.holidayBindings.find(row=>row.holidayBindingId===p.holidayBindingId);
      if(b)Object.assign(e,{pathSha256:objSha(p),qualificationPolicySha256:objSha(q),holidayBindingId:b.holidayBindingId,holidayBindingSha256:objSha(b)});}
  }
}

/** Exact accepted research and preserved source objects are semantic trust roots. */
export function validateJ2(catalog,manifest,files,built,schemas){
  same([...files.keys()].sort(),manifest.artifacts.map(row=>row.path).sort(),'Actual payload inventory');
  const paths=index(catalog.paths,'pathId'),policies=index(catalog.qualificationPolicies,'pathId'),eligibility=index(catalog.releaseBinding.pathEligibility,'pathId');
  const laws=index(catalog.laws,'lawId'),profiles=index(catalog.suspensionProfiles,'suspensionProfileId'),bindings=index(catalog.holidayBindings,'holidayBindingId');
  index(catalog.sources,'sourceId');index(catalog.excludedPaths,'exclusionId');
  same([paths.size,policies.size,eligibility.size,laws.size,profiles.size,bindings.size],[149,149,149,18,35,27],'Complete accepted J2 inventory');
  const expectedIds=[...built.old.paths.map(row=>row.pathId),...built.research.paths.map(row=>row.id.toLowerCase())].sort();
  for(const map of[paths,policies,eligibility])same([...map.keys()].sort(),expectedIds,'Exact path-policy-eligibility ids');
  for(const[field,key]of[['paths','pathId'],['qualificationPolicies','pathId'],['laws','lawId'],['sources','sourceId'],
    ['suspensionProfiles','suspensionProfileId'],['holidayBindings','holidayBindingId'],['excludedPaths','exclusionId']]){
    const actual=index(catalog[field],key);for(const row of built.old[field])same(actual.get(row[key]),row,'Preserved '+field+'/'+row[key]);}
  for(const row of built.old.releaseBinding.pathEligibility)same(eligibility.get(row.pathId),row,'Preserved old eligibility '+row.pathId);
  for(const research of built.research.paths){
    const p=paths.get(research.id.toLowerCase()),q=policies.get(p.pathId),e=eligibility.get(p.pathId);
    same(p.contractFamily,'qualifiedDayProcedureV7');same(q.mode,'qualifiedDayProcedureV7');same(p.revision,1);same(q.pathRevision,1);
    same(p.qualification.delivery,'qualifiedTriggerAccordingToOpeningPolicy','Explicit new trigger contract');
    same(p.duration,durationFor(research),'Qualified duration '+p.pathId);same(p.suspensionSelection,selectionFor(research),'Qualified recess '+p.pathId);
    same(p.openingPolicy,built.catalog.paths.find(row=>row.pathId===p.pathId).openingPolicy,'Qualified opening policy '+p.pathId);
    same(q.requirements,[...built.research.sharedRequirements,...research.requirements].map(projectJ2Requirement),'Exact current qualification '+p.pathId);
    same(new Set(q.requirements.map(row=>row.key)).size,q.requirements.length,'Unique required facts');
    same(q.openingChainPolicy,'notApplicable');same(q.localHolidayPolicy,'notApplicable');
    same(q.pathSha256,objSha(p),'Policy path binding');same(e,eligibilityFor(p,q,catalog),'Complete eligibility and opening binding '+p.pathId);
    same(p.action,research.action);same(p.stages,stagesFor(research),'Actual qualified procedural functions');same(p.researchRef,research.id);
    same(laws.get(p.lawId)?.canton,research.canton);same(bindings.get(p.holidayBindingId)?.lawId,p.lawId);
    same(profiles.get(p.suspensionSelection.suspensionProfileId)?.lawId,p.lawId);
    for(const span of['caseCoverage','calculationCoverage','sourceCoverage'])same(p.temporalBinding[span],WINDOW);
    same(p.normTimeline.map(row=>({id:row.researchBindingId,from:row.interval.from,to:row.interval.to})),
      built.research.temporalBindings[research.canton].map(row=>({id:row.id,from:row.from,to:row.to})),'Version chronology');
    if(research.canton==='FR')for(const segment of p.normTimeline){
      const refs=segment.sourceRefs.map(row=>row.sourceId);assert.equal(refs.some(id=>id.includes(segment.interval.from<'2026-10-01'?'8637':'7947')),false,'No inactive CPJA variant in segment');}
  }
  for(const descriptor of manifest.artifacts){const raw=files.get(descriptor.path);same(sha(raw),descriptor.sha256,'Actual payload sha '+descriptor.path);
    same(Buffer.byteLength(raw),descriptor.byteLength,'Actual payload length '+descriptor.path);if(descriptor.path!==ADMIN)same(raw,built.files.get(descriptor.path),'Unchanged I3 payload '+descriptor.path);}
  same(JSON.parse(files.get(ADMIN)),catalog,'Actual administrative bytes');
  same(catalog,built.catalog,'Closed research-derived catalogue semantics');
  const local=manifest.extensions?.['steimer.local-reference'];assert.ok(local,'Isolated local extension');
  for(const key of['productionActivation','sourceReleaseApproved','calendarExportEnabled'])same(local[key],false,'No '+key);
  same(local.structuralContractProbeOnly,true);same(manifest.releaseStatus,'candidate');
  same(manifest,built.manifest,'Exact candidate manifest after semantic closure');
  assertSchema(catalog,schemas.catalog);assertSchema(manifest,schemas.localManifest);assert.throws(()=>assertSchema(manifest,schemas.manifest));
  return true;
}

function rehash(catalog,manifest,files){
  resealJ2(catalog);files.set(ADMIN,encode(catalog));for(const d of manifest.artifacts){d.sha256=sha(files.get(d.path));d.byteLength=Buffer.byteLength(files.get(d.path));}
}
const arithmetic=result=>{const{openingResolution,exportAllowed,...value}=result;return value;};

export async function runJ2(){
  const built=await buildJ2Candidate(),{schemas}=await buildJ2Schemas(),manifest=await json(OUTPUT+'/bundle/manifest.json'),
    catalog=await json(OUTPUT+'/bundle/'+ADMIN),files=new Map();
  for(const descriptor of manifest.artifacts)files.set(descriptor.path,await read(OUTPUT+'/bundle/'+descriptor.path));
  for(const[key,path]of Object.entries(J2_SCHEMA_FILES))same(await json(path),schemas[key],'Actual isolated schema '+key);
  same(await json(OUTPUT+'/candidate-integrity.json'),built.integrity);same(await read(OUTPUT+'/source-crosswalk.json'),built.crosswalkText);
  validateJ2(catalog,manifest,files,built,schemas);
  const calendars=[...files.values()].map(JSON.parse).filter(row=>row.dataKind==='calendar');
  const peer=await json('outputs/ap23j1-2026-10-27/reference-verification.json');
  const results=built.research.cases.map(item=>{
    const input=researchInput(item,built.research),actual=evaluateJ2(input,catalog,calendars,schemas.input,manifest.coverage);
    for(const[key,value]of Object.entries(item.expected))same(actual[key],value,item.id+'/'+key);
    same(arithmetic(actual),peer.results.find(row=>row.id===item.id).actual,'Full accepted J1 arithmetic '+item.id);
    same(actual.exportAllowed,false);return{id:item.id,input,actual,provenance:researchProvenance(item)};
  });
  const counts=Object.fromEntries(['datedResearchValue','unresolvedBoundaryProposed','qualificationBoundaryProposed','researchWindowBoundary'].map(key=>[key,results.filter(row=>row.actual.outcome===key).length]));
  same(results.length,673);
  const readerNegatives=[],baseFiles=new Map();for(const descriptor of built.manifest0.artifacts)baseFiles.set(descriptor.path,await read(BASE+'/'+descriptor.path));
  const oldContext=parseFormat13LocalReferenceData(encode(built.manifest0),baseFiles);
  assert.throws(()=>assertAdministrativeProcedureCatalogV6(catalog));readerNegatives.push('native-catalog6-rejects-catalog7');
  for(const[name,reader]of[['approved',parseFormat13Data],['local',parseFormat13LocalReferenceData]]){
    assert.throws(()=>reader(encode(manifest),files));readerNegatives.push(name+'-format13-rejects-format14');}
  const relabel=structuredClone(catalog);Object.assign(relabel,{$schema:built.old.$schema,formatVersion:'6.0.0',contractDecision:built.old.contractDecision});
  // Remove the accepted historical HTTP-source exception only in this adversarial
  // copy. Reader13 must reject V7 semantics, not merely an unrelated URL pattern.
  for(const source of relabel.sources)if(source.url.startsWith('http://'))source.url=source.url.replace('http://','https://');
  assert.throws(()=>assertAdministrativeProcedureCatalogV6(relabel));readerNegatives.push('relabelled-v6-new-opening-semantics-rejected');
  const forgedManifest=structuredClone(built.manifest0),forgedFiles=new Map(files);forgedFiles.set(ADMIN,encode(relabel));
  Object.assign(forgedManifest.artifacts.find(row=>row.path===ADMIN),{sha256:sha(forgedFiles.get(ADMIN)),byteLength:Buffer.byteLength(forgedFiles.get(ADMIN))});
  assert.throws(()=>parseFormat13LocalReferenceData(encode(forgedManifest),forgedFiles));readerNegatives.push('rehashed-format13-relabel-rejected');
  const oldResults=built.old.paths.map(path=>{
    const input=administrativeInput13(built.old,path.pathId,'2026-10-02',path.duration.kind==='statutoryDays'?path.duration.value:Math.min(10,path.duration.maximum));
    const actual=calculateAdministrativeDeadline(input,oldContext);same(actual.outcome,'calculated',path.pathId);
    for(const fake of[{catalog,manifest},structuredClone(oldContext),JSON.parse(JSON.stringify(oldContext))])same(calculateAdministrativeDeadline(input,fake).outcome,'blocked');
    return{pathId:path.pathId,end:actual.finalEnd,forgedContextsBlocked:3};
  });
  const mutations=[],mutationRejections=[];
  function invalid(id,edit){
    const c=structuredClone(catalog),m=structuredClone(manifest),f=new Map(files);edit(c,m,f);rehash(c,m,f);
    for(const d of m.artifacts){same(sha(f.get(d.path)),d.sha256,id+' actual descriptor sha');same(Buffer.byteLength(f.get(d.path)),d.byteLength,id+' actual length');}
    let error;try{validateJ2(c,m,f,built,schemas);}catch(caught){error=caught;}
    assert.ok(error,id);assert.ok(!error.message.startsWith('Exact candidate manifest'),id+' must reach semantic/actual closure before exact manifest');
    mutations.push(id);mutationRejections.push({id,rejection:error.message.split('\n')[0],actualDescriptorHashesVerified:true,afterRecomputedEligibilityAndDescriptorHashes:true});
  }
  const p=(c,id)=>c.paths.find(row=>row.pathId===id),q=(c,id)=>c.qualificationPolicies.find(row=>row.pathId===id),
    e=(c,id)=>c.releaseBinding.pathEligibility.find(row=>row.pathId===id);
  for(const[id,edit]of[
    ['missing-new-path',c=>c.paths.pop()],['duplicate-new-path',c=>c.paths.push(structuredClone(c.paths.at(-1)))],
    ['old-path-changed',c=>p(c,'ar-execution-5').duration.value=6],['old-policy-changed',c=>c.qualificationPolicies[0].mode='foreign'],
    ['new-duration-changed',c=>p(c,'ge-recours-30').duration.value=31],['source-url-forged',c=>c.sources.at(-1).url='https://example.org/fake'],
    ['source-version-forged',c=>c.sources.at(-1).versionDescription='never verified'],['source-locator-forged',c=>p(c,'ge-recours-30').sourceRefs[0].locator='Art. 999'],
    ['ge-qualified-shift-invented',c=>p(c,'ge-recours-30').openingPolicy.qualifiedTransformation='nextWorkingDay'],
    ['ge-fallback-qualified',c=>p(c,'ge-recours-30').openingPolicy.otherwise='qualifiedLegalOpening'],
    ['ge-opening-mode-order-changed',c=>p(c,'ge-recours-30').openingPolicy.allowedModes.reverse()],
    ['ge-opening-mode-unknown-admitted',c=>p(c,'ge-recours-30').openingPolicy.allowedModes.push('unknown')],
    ['ge-opening-calendar-unbound',c=>p(c,'ge-recours-30').openingPolicy.holidayBinding='uiCalendar'],
    ['ge-opening-reference-removed',c=>p(c,'ge-recours-30').openingPolicy.sourceRefs=[]],
    ['ge-opening-transformation-invented',c=>p(c,'ge-recours-30').openingPolicy.ordinaryPostTransformation='alwaysAddTwoDays'],
    ['ge-mode-current-fact-removed',c=>q(c,'ge-recours-30').requirements=q(c,'ge-recours-30').requirements.filter(row=>row.key!=='openingMode')],
    ['ge-foreign-opening-on-fr',c=>p(c,'fr-nontc-recours-30').openingPolicy=structuredClone(p(c,'ge-recours-30').openingPolicy)],
    ['ge-extra-holiday-union',c=>c.holidayBindings.find(row=>row.holidayBindingId===p(c,'ge-recours-30').holidayBindingId).legalBinding.roleUnion=true],
    ['ge-ordinary-mode-hidden',c=>p(c,'ge-recours-30').openingPolicy={kind:'qualifiedCurrentTrigger',triggerKind:'qualifiedWrittenOpening',transformation:'none',sourceRefs:p(c,'ge-recours-30').openingPolicy.sourceRefs}],
    ['new-chain-invented',c=>q(c,'ju-opposition-final30').openingChainPolicy='requireOriginalOrTimelyRequestedReasons'],
    ['ju-motivation-automatic-appeal-invented',c=>p(c,'ju-motivation-request30-initial').openingPolicy.triggerKind='automaticNewAppealAfterReasons'],
    ['fr-refusal-replaced-by-original-date',c=>p(c,'fr-nontc-nachfrist-3').openingPolicy.triggerKind='qualifiedWrittenOpening'],
    ['fr-inactive-version-in-segment',c=>p(c,'fr-nontc-recours-30').normTimeline[0].sourceRefs=p(c,'fr-nontc-recours-30').sourceRefs],
    ['case-window-broadened',c=>p(c,'ge-recours-30').temporalBinding.caseCoverage.from='2026-01-01'],
    ['opening-day-norm-gap',c=>p(c,'ge-recours-30').normTimeline[0].interval.from='2026-09-01'],
    ['recess-period-wrong',c=>c.suspensionProfiles.find(row=>row.suspensionProfileId==='ge-three').periods[0].start.days=-6],
    ['runtime-enabled',c=>c.runtimeActive=true],['contract-approved',c=>c.contractStatus='approved'],
    ['decision-approved',c=>c.contractDecision.status='approved'],['decision-predated',c=>c.contractDecision.on='2026-10-27'],
    ['release-approved',c=>c.releaseBinding.status='approved'],['manifest-source-approved',(c,m)=>m.extensions['steimer.local-reference'].sourceReleaseApproved=true],
    ['manifest-export-enabled',(c,m)=>m.extensions['steimer.local-reference'].calendarExportEnabled=true],
    ['non-admin-calendar-changed',(c,m,f)=>{const k='calendars/ap22-ge-a36ff7926d08.json',v=JSON.parse(f.get(k));v.rules.pop();f.set(k,encode(v));}],
    ['non-admin-social-changed',(c,m,f)=>{const d=m.artifacts.find(row=>row.role==='socialProcedureCatalog'),v=JSON.parse(f.get(d.path));v.sources.pop();f.set(d.path,encode(v));}],
    ['holiday-catalog-changed',(c,m,f)=>{const v=JSON.parse(f.get(HOLIDAYS));v.data.rules.pop();f.set(HOLIDAYS,encode(v));}]
  ])invalid(id,edit);
  for(const[id,edit]of[['opening-policy-hash-forged',row=>row.openingPolicySha256='0'.repeat(64)],
    ['profile-closure-forged',row=>row.suspensionProfiles[0].sha256='0'.repeat(64)]]){
    const c=structuredClone(catalog),m=structuredClone(manifest),f=new Map(files);resealJ2(c);edit(e(c,'ge-recours-30'));f.set(ADMIN,encode(c));
    Object.assign(m.artifacts.find(row=>row.path===ADMIN),{sha256:sha(f.get(ADMIN)),byteLength:Buffer.byteLength(f.get(ADMIN))});
    assert.throws(()=>validateJ2(c,m,f,built,schemas));mutations.push(id);
    mutationRejections.push({id,rejection:'Complete eligibility and opening binding',actualDescriptorHashesVerified:true,afterRecomputedEligibilityAndDescriptorHashes:true});
  }
  const inputMutations=[],openingProbes=[];
  for(const research of built.research.paths){
    const row=built.research.cases.find(item=>item.path===research.id&&item.expected.outcome==='datedResearchValue');assert.ok(row,research.id);
    const positive=researchInput(row,built.research);
    for(const required of q(catalog,positive.path).requirements){const changed=structuredClone(positive);delete changed.facts[required.key];
      same(evaluateJ2(changed,catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');inputMutations.push(research.id+':missing:'+required.key);}
  }
  const ge=researchInput(built.research.cases.find(row=>row.id==='J1-GE-R08'),built.research);
  for(const value of['unknown','electronic',null,false,0,[],new String('qualifiedLegalOpening')]){
    const changed={...ge,facts:{...ge.facts,openingMode:value}};same(evaluateJ2(changed,catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');inputMutations.push('ge-mode-invalid:'+inputMutations.length);}
  let invoked=false;const accessor={...ge,facts:{...ge.facts}};Object.defineProperty(accessor.facts,'openingMode',{enumerable:true,get(){invoked=true;return'qualifiedLegalOpening';}});
  same(evaluateJ2(accessor,catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');same(invoked,false);inputMutations.push('ge-accessor-not-invoked');
  const inherited={...ge,facts:Object.create(ge.facts)};same(evaluateJ2(inherited,catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');inputMutations.push('ge-inherited-facts-blocked');
  for(const mode of['qualifiedLegalOpening','ordinaryPostPhysicalReceipt']){
    const input={...ge,facts:{...ge.facts,openingMode:mode}},actual=evaluateJ2(input,catalog,calendars,schemas.input);
    same(actual.outcome,'datedResearchValue');same(actual.legalOpening,mode==='qualifiedLegalOpening'?'2026-09-05':'2026-09-07');
    same(actual.openingResolution.openingPolicySha256,e(catalog,ge.path).openingPolicySha256);same(actual.openingResolution.exportAllowed,false);
    openingProbes.push({id:'ge-explicit-mode-'+mode,input,actual});
  }
  for(const date of['2026-08-28','2027-12-31']){
    const input={...ge,trigger:date},actual=evaluateJ2(input,catalog,calendars,schemas.input);same(actual.outcome,'researchWindowBoundary');
    openingProbes.push({id:'opening-chain-window-'+date,input,actual});
  }
  // Probe sources on physical, intermediate and qualified opening dates individually.
  for(const missingDate of['2026-09-05','2026-09-06','2026-09-07']){
    const changed=structuredClone(catalog),path=p(changed,ge.path),span=path.normTimeline[0],last=path.normTimeline.at(-1);
    path.normTimeline=[{...structuredClone(span),interval:{from:span.interval.from,to:add(missingDate,-1)}},
      {...structuredClone(last),interval:{from:add(missingDate,1),to:last.interval.to}}];resealJ2(changed);
    const actual=evaluateJ2(ge,changed,calendars,schemas.input);same(actual.outcome,'researchWindowBoundary');
    openingProbes.push({id:'norm-gap-in-opening-chain-'+missingDate,input:ge,mutatedCatalog:changed,actual});
  }
  for(const mode of['qualifiedLegalOpening','ordinaryPostPhysicalReceipt']){
    const research=built.research.cases.find(row=>row.path==='GE-ADMIN-ORDERED'&&row.expected.outcome==='datedResearchValue');
    const input=researchInput(research,built.research);input.trigger='2027-08-01';input.days=1;input.facts.openingMode=mode;
    const actual=evaluateJ2(input,catalog,calendars,schemas.input);same(actual.legalOpening,mode==='qualifiedLegalOpening'?'2027-08-01':'2027-08-02');
    same(actual.end,mode==='qualifiedLegalOpening'?'2027-08-02':'2027-08-03');
    openingProbes.push({id:'ge-no-substitute-monday-'+mode,input,actual});
  }
  {
    const research=built.research.cases.find(row=>row.path==='GE-RECOURS-10'&&row.expected.outcome==='datedResearchValue');
    const input=researchInput(research,built.research);input.trigger='2027-03-21';input.facts.openingMode='ordinaryPostPhysicalReceipt';
    const actual=evaluateJ2(input,catalog,calendars,schemas.input);same(actual.legalOpening,'2027-03-22');same(actual.firstCountedDay,'2027-04-05');same(actual.end,'2027-04-14');
    openingProbes.push({id:'ge-opening-does-not-wait-for-recess',input,actual});
  }
  {
    const changed=structuredClone(catalog),path=p(changed,ge.path),span=path.normTimeline[0];
    path.normTimeline=[{...structuredClone(span),researchBindingId:'synthetic-before',interval:{from:span.interval.from,to:'2026-09-05'}},
      {...structuredClone(span),researchBindingId:'synthetic-after',interval:{from:'2026-09-06',to:span.interval.to}}];resealJ2(changed);
    const actual=evaluateJ2(ge,changed,calendars,schemas.input);same(actual.openingResolution.evaluatedNormSegments.map(row=>row.researchBindingId),['synthetic-before','synthetic-after']);
    openingProbes.push({id:'synthetic-source-transition-in-opening-chain',input:ge,mutatedCatalog:changed,mutation:'syntheticNormTransition',actual});
  }
  const probes=built.research.calendarProbes.map(probe=>{
    const research=built.research.paths.find(path=>path.calendar===probe.calendar),path=p(catalog,research.id.toLowerCase()),binding=bindingsFor(catalog,path);
    const actual=calendarDates(binding.physicalBaseline.calendarId,calendars,Number(probe.date.slice(0,4)),false).has(probe.date);
    same(actual,probe.isHoliday,probe.date);return{...probe,actual};
  });
  const evidence=await Promise.all(['scripts/check-ap23j2-contract.mjs','scripts/build-ap23j2-candidate.mjs','scripts/build-ap23j2-schemas.mjs',
    ...Object.values(J2_SCHEMA_FILES),OUTPUT+'/candidate-integrity.json',OUTPUT+'/source-crosswalk.json',OUTPUT+'/bundle/manifest.json',OUTPUT+'/bundle/'+ADMIN]
    .map(async path=>{const raw=await readFile(resolve(ROOT,path));return{path,byteLength:raw.length,sha256:sha(raw)};}));
  const adaptation=built.research.paths.map(path=>{const selected=new Set([...built.research.sharedRequirements,...path.requirements].map(row=>row.key));
    return{researchId:path.id,pathId:path.id.toLowerCase(),discardedSyntheticMetadataKeys:Object.keys({...built.research.sharedSyntheticFacts,...path.syntheticFacts}).filter(key=>!selected.has(key)).sort(),caseOverridesDiscarded:false,
      exactCaseAnnotationProjectionIds:Object.keys(fixtureAnnotations).filter(id=>fixtureAnnotations[id].path===path.id)};});
  return{workPackage:'AP23J2',status:'passed',runtimeActive:false,productIntegrationTest:false,sourceReleaseApproved:false,calendarExportEnabled:false,
    paths:149,newPaths:36,preservedPaths:113,physicalCalendars:35,artifacts:44,unchangedRawArtifacts:43,referenceCases:results.length,counts,
    oldNativeReferenceCalculations:oldResults.length,forgedContextBlocks:oldResults.length*3,readerNegatives,negativeCatalogMutations:mutations.length,
    allCatalogMutationsResealed:true,negativeInputMutations:inputMutations.length,openingProbes:openingProbes.length,results,oldResults,mutations,mutationRejections,inputMutations,
    openingProbeResults:openingProbes.map(({mutatedCatalog,...rest})=>({...rest,...(mutatedCatalog?{mutation:rest.mutation??'missingNormDate',mutatedNormTimeline:p(mutatedCatalog,ge.path).normTimeline}: {})})),
    probes,adaptation,evidence};
}
function bindingsFor(catalog,path){return catalog.holidayBindings.find(row=>row.holidayBindingId===path.holidayBindingId);}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(arg=>arg==='--write'));
  const report=await runJ2();if(process.argv.includes('--write'))await writeFile(resolve(ROOT,OUTPUT,'QA-AP23J2.json'),encode(report));
  console.log(JSON.stringify({...report,results:undefined,oldResults:undefined,mutations:undefined,mutationRejections:undefined,inputMutations:undefined,
    openingProbeResults:undefined,probes:undefined,adaptation:undefined,evidence:undefined},null,2));
}
