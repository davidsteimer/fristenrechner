// SPDX-License-Identifier: AGPL-3.0-only
// Local structural probe only. Deliberately not exported by src/core or a host.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertSchema} from '../src/core/schemaContract.ts';
import {assertAdministrativeProcedureCatalogV5} from '../src/core/administrativeCatalogV5.ts';
import {parseFormat12Data,parseFormat12LocalReferenceData} from '../src/core/releaseFormat12.ts';
import {calculateAdministrativeDeadline} from '../src/core/administrativeDeadline.ts';
import {countDayDeadline} from '../src/core/dayDeadlineArithmetic.ts';
import {administrativePeriodDate} from '../src/core/administrativeCatalog.ts';
import {generateCalendarFromRules} from '../src/core/generateCalendar.ts';
import {parseIsoDate,addCalendarDays} from '../src/core/date.ts';
import {administrativeInput12} from '../tests/core/ap23h3Fixtures.ts';
import {ROOT,BASE,OUTPUT,ADMIN,HOLIDAYS,RELEASE,RESEARCH,WINDOW,DEFINITIONS,STAGE_CROSSWALK,sha,objSha,encode,
  buildI2Candidate,durationFor,selectionFor,eligibilityFor} from './build-ap23i2-candidate.mjs';
import {buildI2Schemas,I2_SCHEMA_FILES,projectI2Requirement} from './build-ap23i2-schemas.mjs';

const read=path=>readFile(resolve(ROOT,path),'utf8');
const json=async path=>JSON.parse(await read(path));
const same=(a,b,label)=>assert.deepEqual(a,b,label);
const index=(rows,key)=>{const m=new Map(rows.map(row=>[row[key],row]));same(m.size,rows.length,'Duplicate '+key);return m;};
const within=(d,span)=>typeof d==='string'&&!!parseIsoDate(d)&&d>=span.from&&(span.to===null||d<=span.to);
const boundary=reason=>({outcome:'qualificationBoundaryProposed',reason,exportAllowed:false});
const windowBoundary=()=>({outcome:'researchWindowBoundary',reason:'outsideReferenceWindow',exportAllowed:false});
const scalar=value=>value===null||['string','boolean'].includes(typeof value)||typeof value==='number'&&Number.isFinite(value);
const plain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&[Object.prototype,null].includes(Object.getPrototypeOf(value));
function dataProperties(value){return plain(value)&&Reflect.ownKeys(value).every(key=>typeof key==='string'&&
  Object.hasOwn(Object.getOwnPropertyDescriptor(value,key),'value'));}

export function researchInput(item,suite){
  const p=suite.paths.find(p=>p.id===item.path)??suite.paths[0];
  return{path:item.path.toLowerCase(),pathRevision:1,authoritySeatCanton:p.canton,trigger:item.trigger,days:item.days,
    facts:{...suite.sharedSyntheticFacts,...p.syntheticFacts,...item.facts}};
}

export function resolveSelectionI2(input,catalog){
  if(!dataProperties(input)||!dataProperties(input.facts))return null;
  const path=catalog.paths.find(row=>row.pathId===input.path),policy=catalog.qualificationPolicies.find(row=>row.pathId===input.path);
  if(path?.contractFamily!=='qualifiedDayProcedureV6'||policy?.mode!=='qualifiedDayProcedureV6')return null;
  if(input.pathRevision!==path.revision||catalog.laws.find(row=>row.lawId===path.lawId)?.canton!==input.authoritySeatCanton)return null;
  const allowed=new Set(policy.requirements.map(row=>row.key));
  if(Object.keys(input.facts).some(key=>!allowed.has(key)))return null;
  for(const row of policy.requirements){const value=input.facts[row.key];
    if(!Object.hasOwn(input.facts,row.key)||!scalar(value)||(Object.hasOwn(row,'value')?value!==row.value:!row.oneOf.some(v=>v===value)))return null;}
  const selection=path.suspensionSelection,profiles=selection.kind==='fixed'?[selection.suspensionProfileId]:
    selection.cases.filter(row=>row.value===input.facts[selection.factKey]).map(row=>row.suspensionProfileId);
  if(profiles.length!==1)return null;
  const selected=catalog.suspensionProfiles.find(row=>row.suspensionProfileId===profiles[0]);
  if(!selected)return null;
  const eligible=catalog.releaseBinding.pathEligibility.find(row=>row.pathId===path.pathId);
  return{selectionSha256:objSha(selection),factKey:selection.kind==='currentFact'?selection.factKey:null,
    factValue:selection.kind==='currentFact'?input.facts[selection.factKey]:null,selectedProfileId:selected.suspensionProfileId,
    selectedProfileSha256:objSha(selected),permittedProfiles:structuredClone(eligible.suspensionProfiles)};
}

/** Exact current fact selection. No coercion, default, profile union or first hit. */
export function evaluateI2(input,catalog,calendars,inputSchema){
  if(!dataProperties(input))return boundary('inputContractInvalid');
  const p=catalog.paths.find(p=>p.pathId===input.path),q=catalog.qualificationPolicies.find(q=>q.pathId===input.path);
  if(!p||q?.mode!=='qualifiedDayProcedureV6')return boundary('unknownResearchPath');
  if(typeof input.trigger!=='string'||!parseIsoDate(input.trigger))return boundary('invalidResearchDate');
  if(input.pathRevision!==p.revision||catalog.laws.find(l=>l.lawId===p.lawId)?.canton!==input.authoritySeatCanton)return boundary('pathContextMismatch');
  const allowed=new Set(q.requirements.map(r=>r.key));
  if(!dataProperties(input.facts)||Object.keys(input.facts).some(key=>!allowed.has(key)))return boundary('unknownResearchFact');
  for(const r of q.requirements){
    const value=input.facts[r.key];
    if(!Object.hasOwn(input.facts,r.key)||!scalar(value)||
      (Object.hasOwn(r,'value')?value!==r.value:!r.oneOf.some(expected=>value===expected)))return boundary(r.reason);
  }
  if(!Number.isSafeInteger(input.days)||input.days<1)return boundary('dayDurationNotSpecified');
  if(p.duration.kind==='statutoryDays'&&input.days!==p.duration.value)return boundary('statutoryDurationMismatch');
  if(p.duration.kind==='authorityOrderedDays'&&(input.days<p.duration.minimum||input.days>p.duration.maximum))return boundary('orderedDurationOutsideTechnicalGuard');
  if(p.duration.kind==='concretisedStatutoryDays'&&(input.days<p.duration.minimum||input.days>p.duration.maximum))return boundary('durationOutsideQualifiedRange');
  try{assertSchema(input,inputSchema);}catch{return boundary('inputContractInvalid');}
  const selection=p.suspensionSelection;
  let selected;
  if(selection.kind==='fixed')selected=selection.suspensionProfileId;
  else if(selection.kind==='currentFact'){
    const matches=selection.cases.filter(row=>row.value===input.facts[selection.factKey]);
    if(matches.length!==1)return boundary('exceptionNoticeUnresolved');
    selected=matches[0].suspensionProfileId;
  }else return boundary('suspensionSelectionInvalid');
  const profiles=catalog.suspensionProfiles.filter(s=>s.suspensionProfileId===selected);
  if(profiles.length!==1||profiles[0].lawId!==p.lawId)return boundary('suspensionSelectionInvalid');
  const binding=catalog.holidayBindings.find(b=>b.holidayBindingId===p.holidayBindingId);
  const calendar=calendars.find(c=>c.calendarId===binding?.physicalBaseline.calendarId);
  if(!calendar)return boundary('calendarBindingInvalid');
  const temporalBindings=[];
  const covered=date=>{
    const spans=[p.temporalBinding.caseCoverage,p.temporalBinding.calculationCoverage,p.temporalBinding.sourceCoverage,calendar.validity];
    const norms=p.normTimeline.filter(t=>within(date,t.interval));
    if(!spans.every(span=>within(date,span))||norms.length!==1)return false;
    if(!temporalBindings.includes(norms[0].researchBindingId))temporalBindings.push(norms[0].researchBindingId);
    return true;
  };
  if(!covered(input.trigger))return windowBoundary();
  const range=p.temporalBinding.calculationCoverage,generated=generateCalendarFromRules(calendars,calendar.calendarId,range),holidays=new Map();
  for(const holiday of generated.calendar.holidays)holidays.set(holiday.date,[...(holidays.get(holiday.date)??[]),holiday]);
  const periods=[];
  for(let year=Number(range.from.slice(0,4))-1;year<=Number(range.to.slice(0,4));year++)for(const period of profiles[0].periods)
    periods.push({periodId:period.periodId+'-'+year,startsOn:administrativePeriodDate(period.start,year),endsOn:administrativePeriodDate(period.end,year)});
  const result=countDayDeadline({legallyRelevantDate:input.trigger,deadlineDays:input.days,periods,shiftStartDuringSuspension:true,
    holidaysByDate:holidays,isCovered:covered,blockEndShiftIntoSuspension:p.endShiftGuard==='blockWhenEnteringApplicableSuspension'});
  if(result.outcome==='blocked'){
    if(result.reason!=='endShiftIntoSuspensionUnresolved')return windowBoundary();
    let ordinaryShiftEnd=result.provisionalEnd;
    while([0,6].includes(new Date(ordinaryShiftEnd+'T00:00:00Z').getUTCDay())||holidays.has(ordinaryShiftEnd)){
      ordinaryShiftEnd=addCalendarDays(ordinaryShiftEnd,1);if(!covered(ordinaryShiftEnd))return windowBoundary();
    }
    return{outcome:'unresolvedBoundaryProposed',reason:'I1-END-SUSPENSION',nominalEnd:result.provisionalEnd,
      ordinaryShiftEnd,firstSuspendedShiftDate:result.blockedDate,exportAllowed:false};
  }
  return{outcome:'datedResearchValue',ordinaryStart:result.ordinaryStart,firstCountedDay:result.countedDates[0],
    nominalEnd:result.provisionalEnd,end:result.finalEnd,skippedDays:result.skippedCalendarDays,
    endShiftDays:(Date.parse(result.finalEnd)-Date.parse(result.provisionalEnd))/86400000,
    suspension:profiles[0].periods.length?'three':'none',temporalBindings,exportAllowed:false};
}

export function resealI2(catalog){
  for(const p of catalog.paths){
    const q=catalog.qualificationPolicies.find(q=>q.pathId===p.pathId),e=catalog.releaseBinding.pathEligibility.find(e=>e.pathId===p.pathId);
    if(!q||!e)continue;q.pathSha256=objSha(p);
    if(p.contractFamily==='qualifiedDayProcedureV6')Object.assign(e,eligibilityFor(p,q,catalog));
    else{const b=catalog.holidayBindings.find(b=>b.holidayBindingId===p.holidayBindingId),s=catalog.suspensionProfiles.find(s=>s.suspensionProfileId===p.suspensionProfileId);
      if(b&&s)Object.assign(e,{pathSha256:objSha(p),qualificationPolicySha256:objSha(q),holidayBindingId:b.holidayBindingId,
        holidayBindingSha256:objSha(b),suspensionProfileId:s.suspensionProfileId,suspensionProfileSha256:objSha(s),
        caseCoverage:structuredClone(p.temporalBinding.caseCoverage),calculationCoverage:structuredClone(p.temporalBinding.calculationCoverage)});}
  }
}

/** Closed semantics checked before formal shape, so recomputing hashes is no escape. */
export function validateI2(catalog,manifest,files,built,schemas){
  same([...files.keys()].sort(),manifest.artifacts.map(a=>a.path).sort(),'Actual inventory');
  const paths=index(catalog.paths,'pathId'),policies=index(catalog.qualificationPolicies,'pathId'),eligible=index(catalog.releaseBinding.pathEligibility,'pathId');
  const laws=index(catalog.laws,'lawId'),profiles=index(catalog.suspensionProfiles,'suspensionProfileId'),bindings=index(catalog.holidayBindings,'holidayBindingId');
  index(catalog.sources,'sourceId');index(catalog.excludedPaths,'exclusionId');
  same([paths.size,policies.size,eligible.size,laws.size,profiles.size,bindings.size],[113,113,113,15,29,21]);
  const expectedIds=[...built.old.paths.map(p=>p.pathId),...built.research.paths.map(p=>p.id.toLowerCase())].sort();
  for(const map of[paths,policies,eligible])same([...map.keys()].sort(),expectedIds);
  for(const[field,key]of[['paths','pathId'],['qualificationPolicies','pathId'],['laws','lawId'],['sources','sourceId'],
    ['suspensionProfiles','suspensionProfileId'],['holidayBindings','holidayBindingId'],['excludedPaths','exclusionId']]){
    const actual=index(catalog[field],key);for(const row of built.old[field])same(actual.get(row[key]),row,'Preserved '+field+'/'+row[key]);
  }
  for(const row of built.old.releaseBinding.pathEligibility)same(eligible.get(row.pathId),row,'Preserved old eligibility '+row.pathId);
  for(const research of built.research.paths){
    const p=paths.get(research.id.toLowerCase()),q=policies.get(p.pathId),e=eligible.get(p.pathId);
    same(p.contractFamily,'qualifiedDayProcedureV6');same(q.mode,'qualifiedDayProcedureV6');same(p.revision,1);same(q.pathRevision,1);
    same(p.duration,durationFor(research),'Qualified duration '+p.pathId);
    same(p.suspensionSelection,selectionFor(research),'Qualified notice selection '+p.pathId);
    assert.ok(!Object.hasOwn(p,'suspensionProfileId'),'No hidden fixed profile on V6');
    same(q.requirements,[...built.research.sharedRequirements,...research.requirements].map(projectI2Requirement),'Exact accepted current facts '+p.pathId);
    same(new Set(q.requirements.map(r=>r.key)).size,q.requirements.length,'Unique fact keys');
    same(q.openingChainPolicy,'notApplicable');same(q.localHolidayPolicy,'notApplicable');
    same(q.pathSha256,objSha(p),'Policy path hash');same(e,eligibilityFor(p,q,catalog),'Complete unique selection/profile closure '+p.pathId);
    same(p.action,research.action);same(p.stages,[STAGE_CROSSWALK[research.stage]]);same(p.researchRef,research.id);
    const law=laws.get(p.lawId),binding=bindings.get(p.holidayBindingId);assert.ok(law&&binding);same(law.canton,research.canton);same(binding.lawId,p.lawId);
    for(const selected of e.suspensionProfiles)same(profiles.get(selected.suspensionProfileId)?.lawId,p.lawId);
    for(const span of['caseCoverage','calculationCoverage','sourceCoverage'])same(p.temporalBinding[span],WINDOW);
    same(p.normTimeline.map(t=>({id:t.researchBindingId,from:t.interval.from,to:t.interval.to})),
      built.research.temporalBindings[research.canton].map(t=>({id:t.id,from:t.from,to:t.to})));
    const accepted=built.befunde[research.canton].pathProposals.find(row=>row.id===research.id);assert.ok(accepted);
    const expectedSourceIds=research.sourceIds.map(id=>(id.includes('-TVR')?'JUD-':'SRC-')+id);
    same(p.sourceRefs.map(row=>row.sourceId),expectedSourceIds,'Accepted I1 path source identities');
    for(const ref of p.sourceRefs){
      let locator;
      if(research.canton==='TG'){
        const rows=accepted.locators.filter(text=>ref.sourceId.includes('-TVR')?text.includes(ref.sourceId.split('-TVR')[1].replace('-',' Nr. ')):
          ref.sourceId.includes('-BOTSCHAFT')?text.includes('Botschaft'):text.startsWith('§'));
        assert.ok(rows.length,'Every I1 TG source has accepted specific path pinpoints');locator=rows.join('; ');
      }else locator=ref.sourceId.includes('-VRG-')?accepted.duration.basis+'; Art. 32, 89–90 und 140a VRG; '+
        (research.id.startsWith('GL-COURT-')?'Art. 105–108 VRG':research.id==='GL-ADMIN-INITIAL-ORDERED'?'Art. 28–36 VRG':'Art. 102–104 VRG'):'Art. 2 und 7 Ruhetagsgesetz';
      same(ref.locator,locator,'Actual source-specific path pinpoint '+p.pathId);
    }
    for(const timeline of p.normTimeline)same(timeline.sourceRefs,p.sourceRefs,'Identical accepted timeline pinpoints');
  }
  const allAccepted=[...built.befunde.GL.laws,...built.befunde.TG.laws,...built.befunde.TG.practiceEvidence,
    ...built.befunde.TG.additionalEvidence];
  for(const source of catalog.sources.filter(row=>!built.old.sources.some(old=>old.sourceId===row.sourceId))){
    const id=source.sourceId.replace(/^(SRC|JUD)-/,''),original=allAccepted.find(row=>row.id===id);assert.ok(original);
    same(source.url,original.url,'Original official URL, not metadata search result');
    same(source.kind,id.includes('-TVR')?'judgment':id.includes('-BOTSCHAFT')?'officialMaterials':'statute');
    same(source.locators,original.locators.join(', '),'Actually read norm metadata');
    same(source.versionDescription,original.versionFrom?original.versionFrom+' / Version '+original.versionId:
      original.decisionOn?original.decisionOn+' / '+original.court+(original.docket?' / '+original.docket:''):
        original.date+' / historische amtliche Botschaft','Actual I1 version/judgment date/court');
    const crosswalk=built.crosswalk.find(row=>row.catalogSourceId===source.sourceId);
    same(crosswalk.roleLimit,original.limit??'Geltende Norm im abgenommenen I1-Untersuchungsfenster. Kein neuer Quellenrelease.','Historical scope warning preserved');
  }
  for(const a of manifest.artifacts){
    const raw=files.get(a.path);same(sha(raw),a.sha256,'Actual bytes '+a.path);same(Buffer.byteLength(raw),a.byteLength,a.path);
    if(a.path!==ADMIN)same(raw,built.files.get(a.path),'Unchanged H3 raw artifact '+a.path);
  }
  same(JSON.parse(files.get(ADMIN)),catalog,'Actual admin bytes');
  // Also close source URLs, locators, all law/profile/binding semantics, exclusions,
  // release flags and metadata to the accepted research-derived target, not only hashes.
  same(catalog,built.catalog,'Exact research and baseline-derived contract');
  const local=manifest.extensions?.['steimer.local-reference'];assert.ok(local,'Closed local structural extension');
  for(const key of['productionActivation','sourceReleaseApproved','calendarExportEnabled'])same(local[key],false,'Unapproved '+key);
  same(local.structuralContractProbeOnly,true,'Structural probe only');same(manifest.releaseStatus,'candidate','No approved release');
  // Important: check the exact manifest only AFTER actual bytes and semantic
  // closure. Resealed semantic mutation tests must not pass by a hash mismatch.
  same(manifest,built.manifest,'Exact candidate manifest and unapproved status');
  assertSchema(catalog,schemas.catalog);assertSchema(manifest,schemas.localManifest);
  assert.throws(()=>assertSchema(manifest,schemas.manifest));
  return true;
}

function rehash(c,m,f){
  resealI2(c);f.set(ADMIN,encode(c));
  for(const d of m.artifacts){d.sha256=sha(f.get(d.path));d.byteLength=Buffer.byteLength(f.get(d.path));}
}

export async function runI2(){
  const built=await buildI2Candidate(),{schemas}=await buildI2Schemas(),manifest=await json(OUTPUT+'/bundle/manifest.json'),
    catalog=await json(OUTPUT+'/bundle/'+ADMIN),files=new Map();
  same(await json(OUTPUT+'/candidate-integrity.json'),built.integrity);same(await read(OUTPUT+'/source-crosswalk.json'),built.crosswalkText);
  for(const[key,path]of Object.entries(I2_SCHEMA_FILES))same(await json(path),schemas[key]);
  for(const a of manifest.artifacts)files.set(a.path,await read(OUTPUT+'/bundle/'+a.path));
  validateI2(catalog,manifest,files,built,schemas);
  const calendars=[...files.values()].map(JSON.parse).filter(x=>x.dataKind==='calendar');
  const peer=await json('outputs/ap23i1-2026-10-22/reference-verification.json');
  const results=built.research.cases.map(item=>{
    const input=researchInput(item,built.research),actual=evaluateI2(input,catalog,calendars,schemas.input);
    for(const[key,value]of Object.entries(item.expected))same(actual[key],value,item.id+'/'+key);
    const{exportAllowed,...withoutFlag}=actual;same(withoutFlag,peer.results.find(row=>row.id===item.id).actual,'Full independent I1 result '+item.id);
    same(exportAllowed,false);return{id:item.id,input,actual,resolvedSelection:resolveSelectionI2(input,catalog)};
  });
  const counts=Object.fromEntries(['datedResearchValue','unresolvedBoundaryProposed','qualificationBoundaryProposed','researchWindowBoundary'].map(k=>[k,results.filter(row=>row.actual.outcome===k).length]));
  same(Object.values(counts),[110,16,117,6]);
  const baseFiles=new Map();for(const a of built.manifest0.artifacts)baseFiles.set(a.path,await read(BASE+'/'+a.path));
  const native=parseFormat12LocalReferenceData(encode(built.manifest0),baseFiles),readerNegatives=[];
  assert.throws(()=>assertAdministrativeProcedureCatalogV5(catalog));readerNegatives.push('native-catalog5-rejects-catalog6');
  for(const[name,reader]of[['approved',parseFormat12Data],['local',parseFormat12LocalReferenceData]]){
    assert.throws(()=>reader(encode(manifest),files));readerNegatives.push(name+'-format12-rejects-format13');
  }
  const relabel=structuredClone(catalog);Object.assign(relabel,{$schema:built.old.$schema,formatVersion:'5.0.0',contractDecision:built.old.contractDecision});
  assert.throws(()=>assertAdministrativeProcedureCatalogV5(relabel));readerNegatives.push('relabelled-v5-rejects-new-semantics');
  const forgedManifest=structuredClone(built.manifest0),forgedFiles=new Map(files),relabelText=encode(relabel);forgedFiles.set(ADMIN,relabelText);
  Object.assign(forgedManifest.artifacts.find(a=>a.path===ADMIN),{sha256:sha(relabelText),byteLength:Buffer.byteLength(relabelText)});
  assert.throws(()=>parseFormat12LocalReferenceData(encode(forgedManifest),forgedFiles));readerNegatives.push('rehashed-format12-relabel-rejected');
  const oldResults=built.old.paths.map(p=>{
    const input=administrativeInput12(built.old,p.pathId,'2026-10-02',p.duration.kind==='statutoryDays'?p.duration.value:10);
    const actual=calculateAdministrativeDeadline(input,native);same(actual.outcome,'calculated',p.pathId);
    for(const fake of[{catalog,manifest},structuredClone(native),JSON.parse(JSON.stringify(native))])same(calculateAdministrativeDeadline(input,fake).outcome,'blocked');
    return{pathId:p.pathId,end:actual.finalEnd,fakeContextsBlocked:3};
  });
  const mutations=[],mutationRejections=[];
  function invalid(id,edit){
    const c=structuredClone(catalog),m=structuredClone(manifest),f=new Map(files);edit(c,m,f);
    rehash(c,m,f);
    for(const descriptor of m.artifacts){same(sha(f.get(descriptor.path)),descriptor.sha256,id+' actual descriptor sha');
      same(Buffer.byteLength(f.get(descriptor.path)),descriptor.byteLength,id+' actual descriptor length');}
    let error;try{validateI2(c,m,f,built,schemas);}catch(caught){error=caught;}
    assert.ok(error,id);assert.ok(!error.message.startsWith('Exact candidate manifest'),id+' must fail semantic/actual closure before exact manifest');
    mutations.push(id);mutationRejections.push({id,rejection:error.message.split('\n')[0],actualDescriptorHashesVerified:true,afterRecomputedDescriptorAndEligibilityHashes:true});
  }
  const p=(c,id)=>c.paths.find(p=>p.pathId===id),q=(c,id)=>c.qualificationPolicies.find(p=>p.pathId===id),
    b=(c,id)=>c.holidayBindings.find(p=>p.holidayBindingId===id),s=(c,id)=>c.suspensionProfiles.find(p=>p.suspensionProfileId===id);
  for(const[id,edit]of[
    ['missing-new-path',c=>c.paths.pop()],['duplicate-new-path',c=>c.paths.push(structuredClone(c.paths.at(-1)))],
    ['old-path-changed',c=>p(c,'ar-execution-5').duration.value=6],['old-policy-changed',c=>q(c,'ow-admin-20').requirements.pop()],
    ['old-source-changed',c=>c.sources[0].url='https://example.org/false'],['old-calendar-binding-changed',c=>c.holidayBindings[0].anchor='partySeat'],
    ['old-eligibility-target-forged',c=>c.releaseBinding.pathEligibility[0].targetComponentRefs.push({role:'calendar',contentId:'fake',sha256:'0'.repeat(64),path:'calendars/fake.json'})],
    ['new-source-url',c=>c.sources.at(-1).url='https://example.org/false'],['new-source-version',c=>c.sources.at(-1).versionDescription='current statutory law'],
    ['new-source-promoted-review',c=>c.sources.at(-1).reviewBasis='Release verified'],['historical-rr-wrong-court',c=>c.sources.find(s=>s.sourceId==='JUD-AP23I1-TG-TVR2003-45').versionDescription='2003-01-14 / Obergericht'],
    ['runtime-enabled',c=>c.runtimeActive=true],['contract-approved',c=>c.contractStatus='approved'],['decision-predated',c=>c.contractDecision.on='2026-10-22'],
    ['source-release-approved',(c,m)=>m.extensions['steimer.local-reference'].sourceReleaseApproved=true],
    ['export-enabled',(c,m)=>m.extensions['steimer.local-reference'].calendarExportEnabled=true],
    ['non-admin-byte-changed',(c,m,f)=>{const key='calendars/ap22-gl-87c11e156541.json';const cal=JSON.parse(f.get(key));cal.rules.pop();f.set(key,encode(cal));}],
    ['holiday-catalog-changed',(c,m,f)=>{const hc=JSON.parse(f.get(HOLIDAYS));hc.data.rules.pop();f.set(HOLIDAYS,encode(hc));}],
    ['social-data-changed',(c,m,f)=>{const a=m.artifacts.find(a=>a.role==='socialProcedureCatalog');const v=JSON.parse(f.get(a.path));v.sources.pop();f.set(a.path,encode(v));}],
    ['gl-fixed2-invented',c=>p(c,'gl-admin-shortened-end').duration={kind:'statutoryDays',value:2,overridable:false}],
    ['tg-fixed5-invented',c=>p(c,'tg-rekurs-shortened').duration={kind:'statutoryDays',value:5,overridable:false}],
    ['shortened-as-ordered',c=>p(c,'gl-court-shortened-interim').duration={kind:'authorityOrderedDays',minimum:1,maximum:365,boundMeaning:'technicalSafetyLimitNotLegalMaximum'}],
    ['shortened-overridable',c=>p(c,'tg-vg-shortened').duration.overridable=true],
    ['shortened-extension-invented',c=>p(c,'tg-vg-shortened').duration.legalNature='authorityExtendable'],
    ['gl-wrong-minimum',c=>p(c,'gl-admin-shortened-end').duration.minimum=1],
    ['tg-wrong-minimum',c=>p(c,'tg-rekurs-shortened').duration.minimum=2],
    ['interim-wrong-maximum',c=>p(c,'gl-admin-shortened-interim').duration.maximum=29],
    ['no-shortening-confirmation',c=>delete p(c,'gl-admin-shortened-end').duration.confirmationFact],
    ['tg-old20-imported',c=>p(c,'tg-rr-30').duration.value=20],
    ['gl-ordered-pause-invented',c=>p(c,'gl-court-ordered').suspensionSelection.suspensionProfileId='gl-three'],
    ['tg-admin-pause-invented',c=>p(c,'tg-admin-ordered').suspensionSelection.suspensionProfileId='tg-three'],
    ['tg-notice-fixed-free',c=>p(c,'tg-vg-provisional-30').suspensionSelection={kind:'fixed',suspensionProfileId:'tg-none'}],
    ['tg-notice-fixed-three',c=>p(c,'tg-vg-execution-5').suspensionSelection={kind:'fixed',suspensionProfileId:'tg-three'}],
    ['tg-notice-reversed',c=>p(c,'tg-vg-execution-5').suspensionSelection.cases.reverse()],
    ['tg-notice-wrong-case',c=>p(c,'tg-vg-provisional-ordered').suspensionSelection.cases[0].value='unknown'],
    ['tg-notice-union',c=>p(c,'tg-vg-provisional-30').suspensionSelection.cases[0].suspensionProfileId='tg-three'],
    ['tg-notice-first-hit',c=>p(c,'tg-vg-execution-5').suspensionSelection.cases.push(structuredClone(p(c,'tg-vg-execution-5').suspensionSelection.cases[0]))],
    ['tg-notice-fallback',c=>p(c,'tg-vg-provisional-30').suspensionSelection.otherwise='tg-three'],
    ['v6-hidden-fixed-profile',c=>p(c,'tg-vg-provisional-30').suspensionProfileId='tg-none'],
    ['tg-notice-missing-qualification',c=>{const policy=q(c,'tg-vg-execution-5');policy.requirements=policy.requirements.filter(r=>r.key!=='exceptionNotice');}],
    ['rr-competence-first-only',c=>q(c,'tg-rr-30').requirements.find(r=>r.key==='regierungsratCompetenceBasis').oneOf.pop()],
    ['rr-competence-both-values-and-oneof',c=>q(c,'tg-rr-30').requirements.find(r=>r.key==='regierungsratCompetenceBasis').value='vrg55Abs1Nr8Qualified'],
    ['rr-competence-object-value',c=>q(c,'tg-rr-30').requirements.find(r=>r.key==='regierungsratCompetenceBasis').oneOf.push({value:'other'})],
    ['gl-old-law-guard-removed',c=>{const policy=q(c,'gl-admin-30');policy.requirements=policy.requirements.filter(r=>r.key!=='newLawApplies');}],
    ['gl-urgency-danger-conflated',c=>q(c,'gl-admin-30-exception').requirements.find(r=>r.key==='art90Exception').value='specialUrgencyOnly'],
    ['foreign-binding',c=>p(c,'gl-admin-30').holidayBindingId='tg-administration-seat'],
    ['foreign-profile',c=>s(c,'gl-three').lawId='vrg-tg'],['wrong-profile-period',c=>s(c,'tg-three').periods[2].start.day=19],
    ['wrong-endguard',c=>p(c,'gl-admin-30').endShiftGuard='none'],
    ['broadened-window',c=>p(c,'gl-admin-30').temporalBinding.calculationCoverage.to='2028-12-31'],
    ['norm-gap',c=>p(c,'tg-vg-30').normTimeline[0].interval.to='2026-12-01'],
    ['wrong-source-pinpoint',c=>p(c,'gl-admin-30').sourceRefs[0].locator='Art. 999'],
    ['binding-party-union',c=>b(c,'gl-court-seat').legalBinding.roleUnion=true],
    ['binding-wrong-calendar',c=>b(c,'gl-administration-seat').physicalBaseline.calendarId='ap22-tg-3d6514fbabb1'],
    ['binding-missing-parent',c=>b(c,'tg-court-seat').physicalBaseline.references=b(c,'tg-court-seat').physicalBaseline.references.filter(r=>r.contentId!=='ch-federal-calendar')],
    ['binding-historical-permission-inherited',c=>b(c,'tg-court-seat').physicalReuse.permissionInheritance='approved'],
    ['binding-wrong-baseline-sha',c=>b(c,'gl-court-seat').physicalReuse.sourceCatalogSha256='f'.repeat(64)]
  ])invalid(id,edit);
  // Break a freshly resealed eligibility afterwards, without making it an unbound byte test.
  for(const[id,edit]of[
    ['selection-hash-forged',e=>e.suspensionSelectionSha256='f'.repeat(64)],
    ['selection-profile-closure-missing',e=>e.suspensionProfiles.pop()],
    ['selection-profile-closure-duplicate',e=>e.suspensionProfiles.push(structuredClone(e.suspensionProfiles[0]))],
    ['selection-profile-hash-forged',e=>e.suspensionProfiles[0].sha256='0'.repeat(64)]
  ]){
    const c=structuredClone(catalog),m=structuredClone(manifest),f=new Map(files);resealI2(c);
    edit(c.releaseBinding.pathEligibility.find(e=>e.pathId==='tg-vg-execution-5'));f.set(ADMIN,encode(c));
    Object.assign(m.artifacts.find(a=>a.path===ADMIN),{sha256:sha(f.get(ADMIN)),byteLength:Buffer.byteLength(f.get(ADMIN))});
    let error;try{validateI2(c,m,f,built,schemas);}catch(caught){error=caught;}
    assert.ok(error,id);assert.ok(!error.message.startsWith('Exact candidate manifest'),id+' must fail selection semantics');
    mutations.push(id);mutationRejections.push({id,rejection:error.message.split('\n')[0],actualDescriptorHashesVerified:true,afterRecomputedDescriptorAndEligibilityHashes:true});
  }
  const inputMutations=[],oneOfAlternatives=[];
  for(const research of built.research.paths){
    const row=built.research.cases.find(item=>item.path===research.id&&item.expected.outcome==='datedResearchValue'),positive=researchInput(row,built.research);
    for(const requirement of q(catalog,positive.path).requirements){
      const input=structuredClone(positive);delete input.facts[requirement.key];
      same(evaluateI2(input,catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');inputMutations.push(research.id+':missing:'+requirement.key);
      if(requirement.oneOf)for(const value of requirement.oneOf){const i=structuredClone(positive);i.facts[requirement.key]=value;
        same(evaluateI2(i,catalog,calendars,schemas.input).outcome,'datedResearchValue');oneOfAlternatives.push(research.id+':'+requirement.key+':'+value);}
    }
    if(p(catalog,positive.path).duration.kind==='concretisedStatutoryDays'){
      const d=p(catalog,positive.path).duration;
      for(const days of[d.minimum-1,d.maximum+1]){same(evaluateI2({...positive,days},catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');inputMutations.push(research.id+':duration:'+days);}
      for(const days of[d.minimum,d.maximum])same(evaluateI2({...positive,days},catalog,calendars,schemas.input).outcome,'datedResearchValue');
    }
  }
  const noticePositive=researchInput(built.research.cases.find(row=>row.id==='TG-VG-EXECUTION-5-WINTER'),built.research);
  for(const value of['unknown','incomplete','disputed',null,true,[],['given'],new String('given'),{toString(){throw new Error('must not coerce');}}]){
    const input={...noticePositive,facts:{...noticePositive.facts,exceptionNotice:value}};
    same(evaluateI2(input,catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');inputMutations.push('notice-nonscalar-or-unqualified:'+String(inputMutations.length));
  }
  let accessorCalled=false;const accessor={...noticePositive,facts:{...noticePositive.facts}};
  Object.defineProperty(accessor.facts,'exceptionNotice',{enumerable:true,get(){accessorCalled=true;return'given';}});
  same(evaluateI2(accessor,catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');same(accessorCalled,false);inputMutations.push('accessor-not-invoked');
  const borrowed={...noticePositive,facts:Object.create(noticePositive.facts)};
  same(evaluateI2(borrowed,catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');inputMutations.push('inherited-facts-not-defaults');
  for(const[path,key,value]of[['TG-VG-30','exceptionNotice','incomplete'],['GL-ADMIN-30','regierungsratCompetenceBasis','vrg55Abs1Nr8Qualified']]){
    const input=researchInput(built.research.cases.find(row=>row.path===path&&row.expected.outcome==='datedResearchValue'),built.research);
    input.facts[key]=value;same(evaluateI2(input,catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');
    same(resolveSelectionI2(input,catalog),null);inputMutations.push('foreign-known-fact:'+path+':'+key);
  }
  for(const[key,value]of[['pathRevision',2],['authoritySeatCanton','GL']]){
    const input={...noticePositive,[key]:value};same(resolveSelectionI2(input,catalog),null);
    same(evaluateI2(input,catalog,calendars,schemas.input).reason,'pathContextMismatch');inputMutations.push('wrong-selection-context:'+key);
  }
  for(const key of['path','pathRevision','authoritySeatCanton','trigger','days','facts']){
    const input=structuredClone(noticePositive);delete input[key];same(evaluateI2(input,catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');inputMutations.push('missing-input:'+key);
  }
  const probes=built.research.calendarProbes.map(probe=>{
    const canton=probe.calendar.slice(0,2),year=Number(probe.date.slice(0,4)),d=DEFINITIONS[canton],cal=calendars.find(c=>c.calendarId===d.calendarId);
    // Physical calendar coverage is open from 2026-08-29. For earlier 2026 probes,
    // rule occurrence is checked against the accepted raw source calendar separately in Python.
    if(probe.date<cal.validity.from)return{...probe,scope:'rawRuleOccurrenceIndependentPython'};
    const generated=generateCalendarFromRules(calendars,d.calendarId,{from:year+'-01-01'>cal.validity.from?year+'-01-01':cal.validity.from,to:year+'-12-31'});
    const actual=generated.calendar.holidays.some(h=>h.date===probe.date);same(actual,probe.isHoliday,probe.date);return{...probe,actual};
  });
  const evidence=await Promise.all(['scripts/build-ap23i2-candidate.mjs','scripts/check-ap23i2-contract.mjs','scripts/build-ap23i2-schemas.mjs',
    ...Object.values(I2_SCHEMA_FILES),OUTPUT+'/candidate-integrity.json',OUTPUT+'/source-crosswalk.json',OUTPUT+'/bundle/manifest.json',OUTPUT+'/bundle/'+ADMIN]
    .map(async path=>{const bytes=await readFile(resolve(ROOT,path));return{path,byteLength:bytes.length,sha256:sha(bytes)};}));
  return{workPackage:'AP23I2',status:'passed',runtimeActive:false,productIntegrationTest:false,sourceReleaseApproved:false,calendarExportEnabled:false,
    paths:113,newPaths:34,preservedPaths:79,physicalCalendars:35,artifacts:44,unchangedRawArtifacts:43,
    referenceCases:results.length,counts,calendarProbes:probes.length,oldNativeReferenceCalculations:oldResults.length,forgedContextBlocks:oldResults.length*3,
    readerNegatives,negativeCatalogMutations:mutations.length,allCatalogMutationsResealed:true,negativeInputMutations:inputMutations.length,
    oneOfAlternativePositiveChecks:oneOfAlternatives.length,results,probes,oldResults,mutations,mutationRejections,inputMutations,oneOfAlternatives,evidence};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const report=await runI2();if(process.argv.includes('--write'))await writeFile(resolve(ROOT,OUTPUT,'QA-AP23I2.json'),encode(report));
  console.log(JSON.stringify({...report,results:undefined,probes:undefined,oldResults:undefined,mutations:undefined,mutationRejections:undefined,inputMutations:undefined,oneOfAlternatives:undefined,evidence:undefined},null,2));
}
