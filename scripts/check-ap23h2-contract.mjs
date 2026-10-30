// SPDX-License-Identifier: AGPL-3.0-only
// Isolated AP23H2 contract probe. No new runtime, capability, release or export.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertSchema} from '../src/core/schemaContract.ts';
import {assertAdministrativeProcedureCatalogV4} from '../src/core/administrativeCatalogV4.ts';
import {parseFormat11Data,parseFormat11LocalReferenceData} from '../src/core/releaseFormat11.ts';
import {calculateAdministrativeDeadline} from '../src/core/administrativeDeadline.ts';
import {countDayDeadline} from '../src/core/dayDeadlineArithmetic.ts';
import {administrativePeriodDate} from '../src/core/administrativeCatalog.ts';
import {generateCalendarFromRules,calculateCalendarRuleOccurrence} from '../src/core/generateCalendar.ts';
import {assertHolidayCatalogV10} from '../src/core/holidayActivationV10.ts';
import {parseIsoDate,addCalendarDays} from '../src/core/date.ts';
import {administrativeInput11} from '../tests/core/ap23g3Fixtures.ts';
import {ROOT,BASE,OUTPUT,ADMIN,RELEASE,sha,objSha,encode,buildH2Candidate} from './build-ap23h2-candidate.mjs';
import {buildH2Schemas,H2_SCHEMA_FILES} from './build-ap23h2-schemas.mjs';

const OUT='outputs/ap23h2-2026-10-22';
const H1='docs/fachrecht/ap23h1/referenzfaelle.json';
const WINDOW={from:'2026-08-29',to:'2027-12-31'};
const HOLIDAY='holiday-catalogs/ch-holiday-catalog.json';
const PROCESS_CALENDARS={OW:'ap23h2-ow-procedural-core',NW:'ap23h2-nw-procedural-core'};
const same=(a,b,label)=>assert.deepEqual(a,b,label);
const read=p=>readFile(resolve(ROOT,p),'utf8');
const json=async p=>JSON.parse(await read(p));
const H1_LAWS=(await Promise.all(['ow','nw'].map(c=>json('docs/fachrecht/ap23h1/befund-'+c+'.json')))).flatMap(b=>b.laws);
const SOURCE_IDS={OW2025:'SRC-AP23H1-OW-STVG-20250101',OW2027:'SRC-AP23H1-OW-STVG-20270101',
  OWVGV:'SRC-AP23H1-OW-VGV-20110101',OWVWVV:'SRC-AP23H1-OW-VWVV-20200101',OWGOG:'SRC-AP23H1-OW-GOG-20220401',
  OWRTG:'SRC-AP23H1-OW-RTG-20090801',ZPO:'SRC-AP23H1-CH-ZPO-20260701',BGG:'SRC-AP23H1-CH-BGG-20260401',
  NWVRG:'SRC-AP23H1-NW-VRG-20260801',NWRTG:'SRC-AP23H1-NW-RTG-20160101'};
const SOURCE_META=new Map(H1_LAWS.map(l=>['SRC-'+l.id,{url:l.url,versionDescription:(l.versionFrom??l.versionOn)+' / '+(l.versionId?'Version '+l.versionId:'amtliches XML'),
  locators:(l.locators??['Art. 64 und 67']).join(', ')}]));
const map=(rows,key)=>{const m=new Map(rows.map(r=>[r[key],r]));same(m.size,rows.length,'Duplicate '+key);return m;};
const within=(d,r)=>!!parseIsoDate(d)&&d>=r.from&&(r.to===null||d<=r.to);
const knownFacts=s=>new Set([...Object.keys(s.sharedSyntheticFacts),...s.paths.flatMap(p=>Object.keys(p.syntheticFacts))]);
const boundary=reason=>({outcome:'qualificationBoundaryProposed',reason,exportAllowed:false});
const windowBoundary=()=>({outcome:'researchWindowBoundary',reason:'outsideReferenceWindow',exportAllowed:false});

export function researchInput(item,suite){
  const p=suite.paths.find(p=>p.id===item.path)??suite.paths[0];
  return{path:item.path.toLowerCase(),pathRevision:1,authoritySeatCanton:p.canton,
    trigger:item.trigger,days:item.days,facts:{...suite.sharedSyntheticFacts,...p.syntheticFacts,...item.facts}};
}

/** Actual candidate policy and calendar parameters, not the accepted oracle. */
export function evaluateH2(i,c,calendars,inputSchema){
  const p=c.paths.find(p=>p.pathId===i.path),q=c.qualificationPolicies.find(q=>q.pathId===i.path);
  if(!p||q?.mode!=='qualifiedDayProcedureV5')return boundary('unknownResearchPath');
  if(!parseIsoDate(i.trigger))return boundary('invalidResearchDate');
  if(i.pathRevision!==p.revision||c.laws.find(l=>l.lawId===p.lawId)?.canton!==i.authoritySeatCanton)return boundary('pathContextMismatch');
  const allowed=new Set(c.qualificationPolicies.filter(q=>q.mode==='qualifiedDayProcedureV5').flatMap(q=>q.requirements.map(r=>r.key)));
  for(const k of['openingOrigin','priorReasonsRequest'])allowed.add(k);
  if(!i.facts||Object.keys(i.facts).some(k=>!allowed.has(k)))return boundary('unknownResearchFact');
  for(const r of q.requirements)if(i.facts[r.key]!==r.value)return boundary(r.reason);
  if(q.openingChainPolicy==='requireOriginalOrTimelyRequestedReasons'){
    if(!['originalReasoned','reasonedFollowingTimelyRequest'].includes(i.facts.openingOrigin))return boundary('openingOriginNotQualified');
    if(i.facts.openingOrigin==='reasonedFollowingTimelyRequest'&&i.facts.priorReasonsRequest!=='timelyEstablished')return boundary('priorReasonsRequestNotEstablished');
  }
  if(!Number.isSafeInteger(i.days)||i.days<1)return boundary('dayDurationNotSpecified');
  if(p.duration.kind==='statutoryDays'&&i.days!==p.duration.value)return boundary('statutoryDurationMismatch');
  if(p.duration.kind==='authorityOrderedDays'&&(i.days<p.duration.minimum||i.days>p.duration.maximum))return boundary('orderedDurationOutsideTechnicalGuard');
  try{assertSchema(i,inputSchema);}catch{return boundary('inputContractInvalid');}
  const h=c.holidayBindings.find(h=>h.holidayBindingId===p.holidayBindingId);
  const calendar=calendars.find(cal=>cal.calendarId===h.physicalBaseline.calendarId);
  const bindings=[];
  const covered=d=>{
    const spans=[p.temporalBinding.caseCoverage,p.temporalBinding.calculationCoverage,p.temporalBinding.sourceCoverage,calendar.validity];
    const norm=p.normTimeline.filter(t=>within(d,t.interval));
    if(!spans.every(r=>within(d,r))||norm.length!==1)return false;
    if(!bindings.includes(norm[0].researchBindingId))bindings.push(norm[0].researchBindingId);
    return true;
  };
  if(!covered(i.trigger))return windowBoundary();
  const range=p.temporalBinding.calculationCoverage;
  const generated=generateCalendarFromRules(calendars,calendar.calendarId,range),holidays=new Map();
  for(const holiday of generated.calendar.holidays)holidays.set(holiday.date,[...(holidays.get(holiday.date)??[]),holiday]);
  const profile=c.suspensionProfiles.find(s=>s.suspensionProfileId===p.suspensionProfileId),periods=[];
  for(let y=Number(range.from.slice(0,4))-1;y<=Number(range.to.slice(0,4));y++)for(const period of profile.periods)
    periods.push({periodId:period.periodId+'-'+y,startsOn:administrativePeriodDate(period.start,y),endsOn:administrativePeriodDate(period.end,y)});
  const result=countDayDeadline({legallyRelevantDate:i.trigger,deadlineDays:i.days,periods,shiftStartDuringSuspension:true,
    holidaysByDate:holidays,isCovered:covered,blockEndShiftIntoSuspension:p.endShiftGuard==='blockWhenEnteringApplicableSuspension'});
  if(result.outcome==='blocked'){
    if(result.reason!=='endShiftIntoSuspensionUnresolved')return windowBoundary();
    let ordinaryShiftEnd=result.provisionalEnd;
    while([0,6].includes(new Date(ordinaryShiftEnd+'T00:00:00Z').getUTCDay())||holidays.has(ordinaryShiftEnd)){
      ordinaryShiftEnd=addCalendarDays(ordinaryShiftEnd,1);if(!covered(ordinaryShiftEnd))return windowBoundary();
    }
    return{outcome:'unresolvedBoundaryProposed',reason:'H1-END-SUSPENSION',nominalEnd:result.provisionalEnd,
      ordinaryShiftEnd,firstSuspendedShiftDate:result.blockedDate,exportAllowed:false};
  }
  return{outcome:'datedResearchValue',ordinaryStart:result.ordinaryStart,firstCountedDay:result.countedDates[0],
    nominalEnd:result.provisionalEnd,end:result.finalEnd,skippedDays:result.skippedCalendarDays,
    endShiftDays:(Date.parse(result.finalEnd)-Date.parse(result.provisionalEnd))/86400000,
    temporalBindings:bindings,exportAllowed:false};
}

function verifyRefs(rows,sources,label){
  assert.ok(Array.isArray(rows)&&rows.length,label);same(new Set(rows.map(r=>r.sourceId)).size,rows.length,label);
  for(const r of rows){assert.ok(sources.has(r.sourceId),'Unknown source '+label);assert.ok(r.locator?.trim(),'Missing locator '+label);}
}

const expectedLegalKeys=(p,future=false)=>p.canton==='NW'?['NWVRG','NWRTG']:
  [future?'OW2027':'OW2025','OWVGV','OWGOG','OWRTG','ZPO',...(p.id.includes('REASONS')?['BGG',...(p.stage==='administration'?['OWVWVV']:[])]:[])];
const expectedRefs=keys=>keys.map(k=>({sourceId:SOURCE_IDS[k],locator:SOURCE_META.get(SOURCE_IDS[k]).locators}));
function actionLocator(id){
  if(id==='NW-EINSPRACHE-20')return'Art. 56 Abs. 2 Ziff. 3, Art. 62/64 und 71 VRG';
  if(id==='NW-EINWENDUNG-ORDERED')return'Art. 60b Abs. 2 mit Art. 33a Abs. 1 VRG';
  if(id.includes('VERNEHMLASSUNG'))return'Art. 76 Abs. 2–3 VRG';
  if(id.includes('REPLIK'))return'Art. 77 Abs. 1 und 3 VRG';
  if(id.includes('DUPLIK'))return'Art. 77 Abs. 2–3 VRG';
  if(id==='NW-ADMIN-20')return'Art. 71 Abs. 1 mit Art. 81 VRG';
  if(id==='NW-COURT-20')return'Art. 71 Abs. 1 mit Art. 89 VRG';
  if(id==='OW-COURT-SUSPENSIVE-5')return'Art. 12 Abs. 3 VGV und abgenommene Massnahmenanalogie H1-C';
  return'Art. 33–36 und Art. 33a VRG, konkrete Tagesanordnung';
}

function expectedPathRefs(p){
  const timeline=(p.canton==='OW'?[false,true]:[false]).map(f=>expectedRefs(expectedLegalKeys(p,f)));
  const rows=[...new Map(timeline.flat().map(r=>[r.sourceId,r])).values()];
  if(p.canton==='NW')rows.find(r=>r.sourceId===SOURCE_IDS.NWVRG).locator=actionLocator(p.id);
  if(p.id==='OW-COURT-SUSPENSIVE-5')rows.find(r=>r.sourceId===SOURCE_IDS.OWVGV).locator=actionLocator(p.id);
  return rows;
}

function validateCalendarAdditions(c,old,manifest,files,baseManifest,oldHoliday){
  const hc=JSON.parse(files.get(HOLIDAY)),descriptors=map(manifest.artifacts,'contentId'),oldDescriptors=map(baseManifest.artifacts,'contentId');
  for(const key of Object.keys(oldHoliday))if(key!=='activation')same(hc[key],oldHoliday[key],'Unchanged holiday root '+key);
  const changed=new Set(['supplementalScopes','supplementalRules','sourceEvidence','sourceIdMap','projections','releaseEligibility']);
  for(const key of Object.keys(oldHoliday.activation))if(!changed.has(key))same(hc.activation[key],oldHoliday.activation[key],'Unchanged activation '+key);
  for(const[key,id]of[['supplementalScopes','id'],['supplementalRules','id'],['sourceEvidence','id'],['sourceIdMap','evidenceId'],['projections','id']]){
    const rows=map(hc.activation[key],id);for(const oldRow of oldHoliday.activation[key])same(rows.get(oldRow[id]),oldRow,'Preserved activation '+oldRow[id]);
    same(rows.size,oldHoliday.activation[key].length+({supplementalScopes:2,supplementalRules:8,sourceEvidence:2,sourceIdMap:2,projections:2}[key]));
  }
  same(hc.data.rules.length,479);same(hc.activation.supplementalRules.length,20);
  same(hc.activation.releaseEligibility,{status:'candidate',releaseId:null,approval:null});
  for(const canton of['OW','NW']){
    const key=canton==='OW'?'OWGOG':'NWVRG',sourceId=SOURCE_IDS[key],metadata=SOURCE_META.get(sourceId),scope=canton+'-PROCEDURAL-ALL',
      calId=PROCESS_CALENDARS[canton],parent=canton==='OW'?'ap22-ow-76c151dccf1f':'ap22-nw-5dfca484e4af',
      sourceDate=canton==='OW'?'2022-04-01':'2026-08-01',jurisdiction='CH-'+canton,
      oldProjection=oldHoliday.activation.projections.find(p=>p.calendarId===parent),projection=hc.activation.projections.find(p=>p.calendarId===calId);
    assert.ok(projection);same(projection,{id:'projection-'+calId,calendarId:calId,jurisdiction,baseScopeId:oldProjection.baseScopeId,
      supplementScopeIds:[scope],scopeIds:[...oldProjection.scopeIds,scope],
      ruleIds:[...oldProjection.ruleIds,...['BERCHTOLD','EASTER-MONDAY','WHIT-MONDAY','ST-STEPHEN'].map(s=>scope+'-DAY-'+s)].sort()});
    same(projection.ruleIds.length,18);
    same(hc.activation.supplementalScopes.find(s=>s.id===scope),{id:scope,jurisdiction,scopeType:'canton',legacyMatrixId:'AP23H1-'+canton+'-PROCEDURAL-CORE',legalValidity:{from:sourceDate,to:null}});
    const source=hc.activation.sourceEvidence.find(s=>s.id===sourceId);assert.ok(source);
    same(source.url,metadata.url);same(source.versionOn,sourceDate);same(source.jurisdiction,jurisdiction);
    same(source.locator,canton==='OW'?'Art. 28 Abs. 2':'Art. 34 Abs. 2');
    same(hc.activation.sourceIdMap.find(s=>s.evidenceId===sourceId),{evidenceId:sourceId,sourceId});
    const newRules=hc.activation.supplementalRules.filter(r=>r.scopeId===scope);same(newRules.length,4);
    for(const suffix of['BERCHTOLD','EASTER-MONDAY','WHIT-MONDAY','ST-STEPHEN']){
      const original=oldHoliday.activation.supplementalRules.find(r=>r.id==='SO-PROCEDURAL-ALL-DAY-'+suffix),r=newRules.find(r=>r.id===scope+'-DAY-'+suffix);
      same(r,{id:scope+'-DAY-'+suffix,scopeId:scope,labels:original.labels,category:'proceduralEquivalentDay',dayPortion:'fullDay',
        calculation:original.calculation,condition:'always',legalValidity:{from:sourceDate,to:null},sourceRefs:[{evidenceId:sourceId,
          locator:canton==='OW'?'Art. 28 Abs. 2 GOG, administrative Reichweite gemäss H1-D':'Art. 34 Abs. 2 VRG'}]});
    }
    const cal=JSON.parse(files.get(descriptors.get(calId).path));
    same(cal.calendarId,calId);same(cal.jurisdiction,{level:'cantonal',code:canton});same(cal.formatVersion,'3.0.0');
    same(cal.validity,WINDOW);same(cal.inherits,[parent]);same(cal.rules.length,4);
    same(cal.projection,{catalogId:hc.catalogId,catalogFormatVersion:'2.0.0',projectionId:projection.id,sourceHash:sha(files.get(HOLIDAY))});
    same(cal.sources.length,1);same(cal.sources[0].sourceId,sourceId);same(cal.sources[0].url,metadata.url);same(cal.sources[0].documentVersionDate,sourceDate);
    for(const r of newRules){const rule=cal.rules.find(x=>x.ruleId===canton+'-CAL-'+r.id);assert.ok(rule);
      same(rule.calendarId,calId);same(rule.jurisdiction,cal.jurisdiction);same(rule.calculation,r.calculation);same(rule.condition,'always');
      same(rule.labels,{de:r.labels.de,fr:r.labels.fr});same(rule.labelKey,'holiday.'+canton.toLowerCase()+'.'+r.id);
      same(rule.validity,r.legalValidity);same(rule.priority,100);same(rule.sourceRefs,[{sourceId,locator:canton==='OW'?'Art. 28 Abs. 2':'Art. 34 Abs. 2'}]);
      same(rule.effect,{type:'holiday',kind:'cantonalPublicHoliday',legalEffect:'nonWorkingDayEquivalentToSunday',resultIdSuffix:r.id});}
    same(sha(files.get(oldDescriptors.get(parent).path)),oldDescriptors.get(parent).sha256,'Parent calendar actual bytes');
    for(const court of[false,true]){
      const b=c.holidayBindings.find(b=>b.holidayBindingId===canton.toLowerCase()+'-'+(court?'court':'administration')+'-seat');assert.ok(b);
      same(b.authoritySeatCanton,canton);same(b.authorityLevel,'cantonal');same(b.anchor,court?'courtSeat':'authoritySeat');same(b.bindingVersion,'5.0.0');
      same(b.physicalBaseline,{releaseId:RELEASE,calendarId:calId,projectionId:projection.id,
        references:[calId,parent,'ch-federal-calendar','ch-holiday-catalog'].map(id=>{const d=descriptors.get(id);return{role:d.role,contentId:id,path:d.path,sha256:d.sha256};}),
        eligibilityMeaning:'physicalSourceOnlyNotFederalProcedurePermission'});
      const keys=canton==='OW'?['OW2025','OW2027','OWVGV','OWGOG','OWRTG','ZPO']:['NWVRG','NWRTG'];
      same(b.legalBinding,{sourceRefs:expectedRefs(keys),projectDecisionRef:'DEC-2026-031',roleUnion:false,partyOrRepresentativeRequired:false});
      same(b.projectionEvidence,{kind:'proceduralSupplementProjection',baselineReleaseId:baseManifest.releaseId,baselineCalendarId:parent,
        baselineCalendarSha256:oldDescriptors.get(parent).sha256,baselineCatalogSha256:oldDescriptors.get('ch-holiday-catalog').sha256,
        baseScopeId:projection.baseScopeId,supplementScopeIds:[scope],newRuleIds:newRules.map(r=>r.id),catalogRuleIds:projection.ruleIds,
        permissionInheritance:'none',legalScope:canton+'-'+(court?'COURT':'ADMIN'),
        legalInterpretation:canton==='NW'?'directVRG34':court?'directCourtStatute':'systematicAdministrativeTransferConfirmedH1D'});
    }
  }
  return true;
}

export function resealH2(c){
  for(const p of c.paths){const q=c.qualificationPolicies.find(q=>q.pathId===p.pathId),e=c.releaseBinding.pathEligibility.find(e=>e.pathId===p.pathId),
    b=c.holidayBindings.find(b=>b.holidayBindingId===p.holidayBindingId),s=c.suspensionProfiles.find(s=>s.suspensionProfileId===p.suspensionProfileId);
    if(q)q.pathSha256=objSha(p);if(e&&q&&b&&s)Object.assign(e,{pathSha256:objSha(p),qualificationPolicySha256:objSha(q),
      holidayBindingId:b.holidayBindingId,holidayBindingSha256:objSha(b),suspensionProfileId:s.suspensionProfileId,suspensionProfileSha256:objSha(s),
      caseCoverage:structuredClone(p.temporalBinding.caseCoverage),calculationCoverage:structuredClone(p.temporalBinding.calculationCoverage)});
  }
}

/** Semantic expectations come from accepted H1 plus unchanged G3 objects. */
export function validateH2(c,old,research,schemas,manifest,files,baseManifest,oldHoliday){
  assertSchema(c,schemas.catalog);assertSchema(manifest,schemas.localManifest);assert.throws(()=>assertSchema(manifest,schemas.manifest));
  same(manifest.artifacts.length,44);same(manifest.calendarIds.length,35);
  for(const d of baseManifest.artifacts)if(![ADMIN,HOLIDAY].includes(d.path))same(sha(files.get(d.path)),d.sha256,'Unchanged G3 bytes '+d.path);
  const filePaths=new Set(manifest.artifacts.map(d=>d.path));same(filePaths.size,44);
  same([...files.keys()].sort(),[...filePaths].sort(),'Manifest actual byte inventory');
  for(const d of manifest.artifacts){const raw=files.get(d.path);same(sha(raw),d.sha256,'Actual bytes '+d.path);same(Buffer.byteLength(raw),d.byteLength,d.path);}
  for(const oldDescriptor of baseManifest.artifacts){const actual=manifest.artifacts.find(d=>d.path===oldDescriptor.path);assert.ok(actual);
    for(const key of['path','role','contentId','mediaType','schemaId'])same(actual[key],key==='schemaId'&&oldDescriptor.path===ADMIN?schemas.catalog.$id:oldDescriptor[key],'Manifest descriptor '+oldDescriptor.path+'/'+key);}
  same(manifest.calendarIds,[...baseManifest.calendarIds,...Object.values(PROCESS_CALENDARS)].sort());
  for(const key of['profileIds','specialRegimeCatalogIds','holidayCatalogIds','socialProcedureCatalogIds','administrativeProcedureCatalogIds'])same(manifest[key],baseManifest[key]);
  same(manifest.sourceSummary.sourceIds,[...new Set([...files.values()].flatMap(raw=>(JSON.parse(raw).sources??[]).map(s=>s.sourceId)))].sort(),'Actual source inventory');
  same(JSON.parse(files.get(ADMIN)),c,'Actual administrative bytes');
  same(c.formatVersion,'5.0.0');same(manifest.formatVersion,'12.0.0');same(manifest.compatibility.minimumConsumerFormatVersion,'12.0.0');
  same(c.contractStatus,'proposed');same(c.runtimeActive,false);
  same(c.contractDecision,{id:'DEC-2026-037',status:'proposed',on:null});
  same(manifest.releaseStatus,'candidate');same(manifest.releaseId,RELEASE);
  same(manifest.sourceSummary.legalBasisReviewStatus,'pending');same(manifest.sourceSummary.technicalValidationStatus,'pending');
  const ext=manifest.extensions?.['steimer.local-reference'];assert.ok(ext);
  for(const k of['productionActivation','sourceReleaseApproved','calendarExportEnabled'])same(ext[k],false,'Unapproved extension '+k);
  same(ext.structuralContractProbeOnly,true);same(ext.contractDecision,'DEC-2026-037');same(ext.contractDecisionStatus,'proposed');
  const paths=map(c.paths,'pathId'),policies=map(c.qualificationPolicies,'pathId'),eligible=map(c.releaseBinding.pathEligibility,'pathId'),
    laws=map(c.laws,'lawId'),profiles=map(c.suspensionProfiles,'suspensionProfileId'),bindings=map(c.holidayBindings,'holidayBindingId'),sources=map(c.sources,'sourceId');
  same([paths.size,policies.size,eligible.size,laws.size,profiles.size,bindings.size],[79,79,79,13,25,17]);
  for(const[field,key]of[['paths','pathId'],['qualificationPolicies','pathId'],['laws','lawId'],['sources','sourceId'],
    ['suspensionProfiles','suspensionProfileId'],['holidayBindings','holidayBindingId'],['excludedPaths','exclusionId']]){
    const actual=map(c[field],key);for(const row of old[field])same(actual.get(row[key]),row,'Preserved '+field+'/'+row[key]);
  }
  const expectedIds=[...old.paths.map(p=>p.pathId),...research.paths.map(p=>p.id.toLowerCase())].sort();
  for(const values of[paths,policies,eligible])same([...values.keys()].sort(),expectedIds);
  const release=c.releaseBinding;same(release.status,'candidate');
  for(const k of['releaseId','approval','sourceReviewRef','referenceSuiteRef'])same(release[k],null,k);same(release.targetComponentRefs,[]);
  for(const p of paths.values()){
    const q=policies.get(p.pathId),e=eligible.get(p.pathId),b=bindings.get(p.holidayBindingId),s=profiles.get(p.suspensionProfileId);
    assert.ok(b&&s&&laws.has(p.lawId));same(b.lawId,p.lawId);same(s.lawId,p.lawId);same(q.pathSha256,objSha(p));same(q.pathRevision,p.revision);
    same(e.pathSha256,objSha(p));same(e.qualificationPolicySha256,objSha(q));same(e.holidayBindingSha256,objSha(b));same(e.suspensionProfileSha256,objSha(s));
    same(e.holidayBindingId,p.holidayBindingId);same(e.suspensionProfileId,p.suspensionProfileId);same(e.pathRevision,p.revision);same(e.status,'candidate');
    same(e.sourceReviewRef,null);same(e.referenceSuiteRef,null);same(e.targetComponentRefs,[]);
    same(e.caseCoverage,p.temporalBinding.caseCoverage);same(e.calculationCoverage,p.temporalBinding.calculationCoverage);
    if(old.paths.some(x=>x.pathId===p.pathId))continue;
    const r=research.paths.find(r=>r.id.toLowerCase()===p.pathId);assert.ok(r);same(p.researchRef,r.id);same(p.revision,1);
    same(p.lawId,r.canton==='OW'?'stvg-vgv-ow':'vrg-nw');
    same(p.contractFamily,'qualifiedDayProcedureV5');same(p.action,r.action);same(p.stages,[r.stage]);same(laws.get(p.lawId).canton,r.canton);
    same(q.mode,'qualifiedDayProcedureV5');same(q.requirements,[...research.sharedRequirements,...r.requirements]);
    same(new Set(q.requirements.map(x=>x.key)).size,q.requirements.length,'Unique requirement '+p.pathId);
    same(q.openingChainPolicy,r.openingChain?'requireOriginalOrTimelyRequestedReasons':'notApplicable');
    same(q.localHolidayPolicy,'blockConcreteUnresolvedAdditionalEndEffect');
    same(p.duration,r.days===null?{kind:'authorityOrderedDays',minimum:1,maximum:365,boundMeaning:'technicalSafetyLimitNotLegalMaximum'}:
      {kind:'statutoryDays',value:r.days,overridable:false});
    same(p.holidayBindingId,r.canton.toLowerCase()+'-'+(r.stage==='court'?'court':'administration')+'-seat');
    same(p.suspensionProfileId,r.canton.toLowerCase()+'-'+r.suspension);same(p.endShiftPolicy,'nextWorkingDay');
    same(p.endShiftGuard,r.endShiftCollision==='proposedBoundary'?'blockWhenEnteringApplicableSuspension':'none');
    same(p.openingWarnings,[]);same(p.urgencyPolicy,'notApplicable');
    for(const k of['caseCoverage','calculationCoverage','sourceCoverage'])same(p.temporalBinding[k],WINDOW);
    same(p.temporalBinding.evaluation,'eachEvaluatedDayIncludingEndShift');
    same(p.normTimeline.map(t=>({id:t.researchBindingId,from:t.interval.from,to:t.interval.to})),
      research.temporalBindings[r.canton].map(t=>({id:t.id,from:t.from,to:t.to})));
    verifyRefs(p.sourceRefs,sources,p.pathId);for(const t of p.normTimeline)verifyRefs(t.sourceRefs,sources,p.pathId+'/timeline');
    same(p.sourceRefs,expectedPathRefs(r),'Path source meaning '+p.pathId);
    for(const t of p.normTimeline){const expected=expectedRefs(expectedLegalKeys(r,t.researchBindingId==='OW-STVG-2031'));
      if(t===p.normTimeline.at(-1)&&r.canton==='NW')expected.find(ref=>ref.sourceId===SOURCE_IDS.NWVRG).locator=actionLocator(r.id);
      if(t===p.normTimeline.at(-1)&&r.id==='OW-COURT-SUSPENSIVE-5')expected.find(ref=>ref.sourceId===SOURCE_IDS.OWVGV).locator=actionLocator(r.id);
      same(t.sourceRefs,expected,'Timeline source meaning '+p.pathId+'/'+t.researchBindingId);}
    const expectedPeriods=r.suspension==='none'?[]:r.suspension==='winter'?[['2026-12-18','2027-01-02']]:
      [['2026-03-29','2026-04-12'],['2026-07-15','2026-08-15'],['2026-12-18','2027-01-02']];
    same(s.periods.map(x=>[administrativePeriodDate(x.start,2026),administrativePeriodDate(x.end,2026)]).sort(),expectedPeriods.sort());
  }
  const freshSources=c.sources.filter(s=>!old.sources.some(o=>o.sourceId===s.sourceId));same(freshSources.length,10);
  same(freshSources.map(s=>s.sourceId).sort(),[...SOURCE_META.keys()].sort());
  for(const source of freshSources){const m=SOURCE_META.get(source.sourceId);same(source.url,m.url);same(source.versionDescription,m.versionDescription);
    same(source.locators,m.locators);same(source.kind,'statute');same(source.reviewedOn,'2026-10-22');}
  for(const canton of['OW','NW']){
    const law=laws.get(canton==='OW'?'stvg-vgv-ow':'vrg-nw');
    same(law.holidayPolicyReview,{explicitDeviation:canton==='OW'?'explicitCourtLocationRule':'noneIdentifiedInReviewedGeneralLaw',
      sourceRefs:expectedRefs(canton==='OW'?['OW2025','OW2027','OWVGV','OWGOG','ZPO']:['NWVRG','NWRTG']),projectDecisionRef:'DEC-2026-031'});
    same(law.sourceRefs,expectedRefs(canton==='OW'?['OW2025','OW2027','OWVGV','OWVWVV']:['NWVRG']));
    for(const s of c.suspensionProfiles.filter(s=>s.lawId===law.lawId)){
      const expected=canton==='OW'?expectedRefs(['OW2025','OW2027','OWVGV','ZPO']):[{sourceId:SOURCE_IDS.NWVRG,locator:'Art. 33a Abs. 1–3'}];
      same(s.sourceRefs,expected,'Suspension sources '+s.suspensionProfileId);for(const period of s.periods)same(period.inclusive,true);
    }
  }
  validateCalendarAdditions(c,old,manifest,files,baseManifest,oldHoliday);
  return true;
}

export async function runH2(){
  const built=await buildH2Candidate(),{schemas}=await buildH2Schemas(),{old,research}=built;
  const manifest=await json(OUTPUT+'/bundle/manifest.json'),catalog=await json(OUTPUT+'/bundle/'+ADMIN),files=new Map();
  same(manifest,built.manifest);same(catalog,built.catalog);
  const integrity=await json(OUTPUT+'/candidate-integrity.json');same(integrity,built.integrity);
  for(const key of['runtimeReadable','productionActivation','calendarExportEnabled'])same(integrity[key],false,key);
  same(integrity.sourceReview,'pending');same(integrity.contractStatus,'proposed');same(integrity.referenceOnly,true);
  for(const [k,p] of Object.entries(H2_SCHEMA_FILES))same(await json(p),schemas[k]);
  let unchangedRaw=0;const baseManifest=await json(BASE+'/manifest.json'),baseDescriptors=map(baseManifest.artifacts,'path');
  for(const d of manifest.artifacts){const bytes=await read(OUTPUT+'/bundle/'+d.path);same(sha(bytes),d.sha256,d.path);same(Buffer.byteLength(bytes),d.byteLength,d.path);
    files.set(d.path,bytes);if(baseDescriptors.has(d.path)&&bytes===await read(BASE+'/'+d.path))unchangedRaw++;}
  same(manifest.artifacts.length,44);same(manifest.calendarIds.length,35);same(unchangedRaw,40);
  validateH2(catalog,old,research,schemas,manifest,files,baseManifest,built.oldHolidays);
  const calendars=[...files.values()].map(JSON.parse).filter(x=>x.dataKind==='calendar');
  const results=research.cases.map(item=>{const input=researchInput(item,research),actual=evaluateH2(input,catalog,calendars,schemas.input);
    for(const[k,v]of Object.entries(item.expected))same(actual[k],v,item.id+'/'+k);
    same(actual.exportAllowed,false);return{id:item.id,input,actual};});
  const peer=await json('outputs/ap23h1-2026-10-22/reference-verification.json');
  for(const row of results){const{exportAllowed,...actual}=row.actual;same(actual,peer.results.find(p=>p.id===row.id).actual,'Full H1 result '+row.id);}
  const counts=Object.fromEntries(['datedResearchValue','unresolvedBoundaryProposed','qualificationBoundaryProposed','researchWindowBoundary'].map(k=>[k,results.filter(r=>r.actual.outcome===k).length]));
  same(Object.values(counts),[58,18,38,4]);
  const annual=[],probes=[],calendarComparisons=[];
  for(const canton of ['OW','NW'])for(const year of[2026,2027]){
    const set=new Set(),rawDates=new Set(),seen=new Set();
    function collect(id){if(seen.has(id))return;seen.add(id);const cal=calendars.find(x=>x.calendarId===id);assert.ok(cal);
      for(const rule of cal.rules){if(rule.effect.type!=='holiday')continue;same(rule.condition,'always');rawDates.add(calculateCalendarRuleOccurrence(rule.calculation,year,rule.ruleId).date);}
      for(const parent of cal.inherits)collect(parent);
    }
    collect(PROCESS_CALENDARS[canton]);same(rawDates.size,17);
    for(const md of research.calendarDefinitions[canton+'-PROCESS'].fixed)set.add(year+'-'+md);
    for(const offset of research.calendarDefinitions[canton+'-PROCESS'].easterOffsets)set.add(addCalendarDays(research.easter[year],offset));
    same(set.size,14);let compared=0;
    for(let d=year+'-01-01';d<=year+'-12-31';d=addCalendarDays(d,1)){
      const weekend=[0,6].includes(new Date(d+'T00:00:00Z').getUTCDay());
      same(weekend||rawDates.has(d),weekend||set.has(d),canton+'/'+d);compared++;
    }
    annual.push({canton,year,rawProjectedDates:rawDates.size,independentlyNamedDates:set.size});calendarComparisons.push({canton,year,compared,differences:0});
  }
  for(const probe of research.calendarProbes){const canton=probe.calendar.slice(0,2),year=Number(probe.date.slice(0,4)),
    generated=generateCalendarFromRules(calendars,PROCESS_CALENDARS[canton],{from:[year+'-01-01',WINDOW.from].sort().at(-1),to:[year+'-12-31',WINDOW.to].sort()[0]});
    const actual=generated.calendar.holidays.some(h=>h.date===probe.date);same(actual,probe.isHoliday,probe.date);probes.push({...probe,actual});}
  const baseFiles=new Map();for(const d of baseManifest.artifacts)baseFiles.set(d.path,await read(BASE+'/'+d.path));
  const nativeContext=parseFormat11LocalReferenceData(encode(baseManifest),baseFiles),readerNegatives=[];
  assert.throws(()=>assertAdministrativeProcedureCatalogV4(catalog));readerNegatives.push('native-catalog4-rejects-catalog5');
  for(const[name,reader]of[['approved',parseFormat11Data],['local',parseFormat11LocalReferenceData]]){
    assert.throws(()=>reader(encode(manifest),files));readerNegatives.push(name+'-format11-rejects-format12');}
  const relabel=structuredClone(catalog);Object.assign(relabel,{$schema:old.$schema,formatVersion:'4.0.0',contractStatus:'approved',contractDecision:old.contractDecision});
  assert.throws(()=>assertAdministrativeProcedureCatalogV4(relabel));readerNegatives.push('relabelled-catalog4-rejects-new-semantics');
  const forgedManifest=structuredClone(baseManifest),forgedFiles=new Map(files),relabelText=encode(relabel);forgedFiles.set(ADMIN,relabelText);
  Object.assign(forgedManifest.artifacts.find(a=>a.path===ADMIN),{sha256:sha(relabelText),byteLength:Buffer.byteLength(relabelText)});
  assert.throws(()=>parseFormat11LocalReferenceData(encode(forgedManifest),forgedFiles));readerNegatives.push('rehashed-format11-relabel-rejected');
  const newHoliday=JSON.parse(files.get(HOLIDAY));assertSchema(newHoliday,await json('schemas/holiday-catalog-v2.schema.json'));
  assert.throws(()=>assertHolidayCatalogV10(newHoliday));readerNegatives.push('native-v10-activation-rejects-schema2-valid-expanded-holiday-catalog');
  const oldResults=old.paths.map(p=>{const input=administrativeInput11(old,p.pathId,'2026-10-02',p.duration.kind==='statutoryDays'?p.duration.value:10);
    const result=calculateAdministrativeDeadline(input,nativeContext);same(result.outcome,'calculated',p.pathId);
    for(const fake of[{catalog,manifest},structuredClone(nativeContext),JSON.parse(JSON.stringify(nativeContext))])same(calculateAdministrativeDeadline(input,fake).outcome,'blocked');
    return{pathId:p.pathId,end:result.finalEnd,fakeContextsBlocked:3};});
  const mutations=[],getPath=(c,id)=>c.paths.find(p=>p.pathId===id),getPolicy=(c,id)=>c.qualificationPolicies.find(q=>q.pathId===id),
    getBinding=(c,id)=>c.holidayBindings.find(b=>b.holidayBindingId===id),getProfile=(c,id)=>c.suspensionProfiles.find(s=>s.suspensionProfileId===id),
    editFile=(f,path,change)=>{const value=JSON.parse(f.get(path));change(value);f.set(path,encode(value));};
  function rehash(c,m,f,refreshRefs=true){
    const hcHash=sha(f.get(HOLIDAY));
    if(refreshRefs)for(const id of Object.values(PROCESS_CALENDARS))editFile(f,'calendars/'+id+'.json',cal=>{cal.projection.sourceHash=hcHash;});
    for(const d of m.artifacts)if(d.path!==ADMIN){d.sha256=sha(f.get(d.path));d.byteLength=Buffer.byteLength(f.get(d.path));}
    if(refreshRefs)for(const b of c.holidayBindings.filter(b=>b.bindingVersion==='5.0.0'))for(const r of b.physicalBaseline.references){
      const actual=m.artifacts.find(a=>a.contentId===r.contentId);if(actual)r.sha256=actual.sha256;
    }
    resealH2(c);f.set(ADMIN,encode(c));const admin=m.artifacts.find(d=>d.path===ADMIN);admin.sha256=sha(f.get(ADMIN));admin.byteLength=Buffer.byteLength(f.get(ADMIN));
  }
  function invalid(id,edit,postSeal){
    const c=structuredClone(catalog),m=structuredClone(manifest),f=new Map(files);edit(c,m,f);rehash(c,m,f);
    if(postSeal){postSeal(c,m,f);rehash(c,m,f,false);}
    assert.throws(()=>validateH2(c,old,research,schemas,m,f,baseManifest,built.oldHolidays),undefined,id);mutations.push(id);
  }
  for(const[id,edit]of[
    ['missing-new-group',c=>c.paths.pop()],['duplicate-new-group',c=>c.paths.push(structuredClone(c.paths.at(-1)))],
    ['old-path-changed',c=>getPath(c,'ar-execution-5').duration.value=6],
    ['old-policy-changed',c=>getPolicy(c,'sh-admin-20').requirements.notice='disputed'],
    ['forged-runtime',c=>c.runtimeActive=true],['forged-contract-approval',c=>c.contractStatus='approved'],
    ['wrong-decision',c=>c.contractDecision.id='DEC-2026-036'],['forged-release-approval',c=>c.releaseBinding.status='approved'],
    ['forged-source-review',c=>c.releaseBinding.sourceReviewRef={id:'fake',sha256:'1'.repeat(64)}],
    ['extension-fake-activation',(c,m)=>m.extensions['steimer.local-reference'].productionActivation=true],
    ['extension-fake-source-approval',(c,m)=>m.extensions['steimer.local-reference'].sourceReleaseApproved=true],
    ['extension-fake-export',(c,m)=>m.extensions['steimer.local-reference'].calendarExportEnabled=true],
    ['extension-not-structural',(c,m)=>m.extensions['steimer.local-reference'].structuralContractProbeOnly=false],
    ['manifest-fake-source-check',(c,m)=>m.sourceSummary.legalBasisReviewStatus='verified'],
    ['manifest-wrong-existing-role',(c,m)=>{const d=m.artifacts.find(d=>d.path==='calendars/ap22-ow-76c151dccf1f.json');d.role='legalProfile';d.schemaId=m.artifacts.find(d=>d.role==='legalProfile').schemaId;}],
    ['manifest-missing-source-identity',(c,m)=>m.sourceSummary.sourceIds.pop()],
    ['wrong-statutory-duration',c=>getPath(c,'ow-admin-20').duration.value=30],
    ['reasons-zpo10-duration',c=>getPath(c,'ow-court-reasons-30').duration.value=10],
    ['suspensive-ordinary30-duration',c=>getPath(c,'ow-court-suspensive-5').duration.value=30],
    ['suspensive-generic-action',c=>getPath(c,'ow-court-suspensive-5').action='ordinaryAdministrativeCourtAppeal'],
    ['suspensive-generic-policy',c=>getPolicy(c,'ow-court-suspensive-5').requirements.find(r=>r.key==='action').value='ordinaryAdministrativeCourtAppeal'],
    ['suspensive-unqualified-ferienfreiheit',c=>getPolicy(c,'ow-court-suspensive-5').requirements.find(r=>r.key==='suspensionException').value='ordinaryNoException'],
    ['suspensive-three-periods',c=>getPath(c,'ow-court-suspensive-5').suspensionProfileId='ow-three'],
    ['winter-path-three-periods',c=>getPath(c,'nw-einwendung-ordered').suspensionProfileId='nw-three'],
    ['first-instance-three-periods',c=>getPath(c,'nw-admin-ordered').suspensionProfileId='nw-three'],
    ['missing-consent-fact',c=>{const q=getPolicy(c,'nw-appeal-ordered');q.requirements=q.requirements.filter(r=>r.key!=='deadlineAgreement');}],
    ['missing-einsprache-admissibility',c=>{const q=getPolicy(c,'nw-einsprache-20');q.requirements=q.requirements.filter(r=>r.key!=='einspracheAdmissibility');}],
    ['exchange-ordinary-ordered-duration',c=>getPath(c,'nw-court-replik-20').duration={kind:'authorityOrderedDays',minimum:1,maximum:365,boundMeaning:'technicalSafetyLimitNotLegalMaximum'}],
    ['exchange-wrong-document',c=>getPolicy(c,'nw-court-duplik-20').requirements.find(r=>r.key==='opening').value='vernehmlassungServedForReply'],
    ['exchange-transferred-to-einsprache',c=>getPolicy(c,'nw-admin-vernehmlassung-20').requirements.find(r=>r.key==='opening').value='orderedForwardDayPeriodInEinsprache'],
    ['reasons-wrong-admin-recipient',c=>getPolicy(c,'ow-admin-reasons-30').requirements.find(r=>r.key==='sameIssuingAuthority').value=false],
    ['reasons-wrong-court-recipient',c=>getPolicy(c,'ow-court-reasons-30').requirements.find(r=>r.key==='sameIssuingCourt').value=false],
    ['wrong-target-court',c=>getPolicy(c,'ow-court-30').requirements.find(r=>r.key==='targetCourt').value='NW-Verwaltungsgericht'],
    ['drop-opening-chain',c=>getPolicy(c,'ow-admin-20').openingChainPolicy='notApplicable'],
    ['drop-local-policy',c=>getPolicy(c,'nw-admin-20').localHolidayPolicy='notApplicable'],
    ['drop-local-requirement',c=>{const q=getPolicy(c,'ow-court-30');q.requirements=q.requirements.filter(r=>r.key!=='localHolidayEffect');}],
    ['drop-end-shift-guard',c=>getPath(c,'ow-admin-reasons-30').endShiftGuard='none'],
    ['empty-requirements',c=>getPolicy(c,'nw-court-20').requirements=[]],
    ['duplicate-requirement',c=>getPolicy(c,'nw-court-20').requirements.push(structuredClone(getPolicy(c,'nw-court-20').requirements[0]))],
    ['wrong-stage',c=>getPath(c,'nw-court-replik-20').stages=['administration']],
    ['broadened-window',c=>getPath(c,'ow-admin-20').temporalBinding.calculationCoverage.to='2028-12-31'],
    ['post-receipt-norm-gap',c=>getPath(c,'ow-admin-20').normTimeline[0].interval.to='2026-12-01'],
    ['overlapping-norm-sections',c=>getPath(c,'ow-admin-20').normTimeline[1].interval.from='2026-12-31'],
    ['wrong-temporal-label',c=>getPath(c,'ow-admin-20').normTimeline[1].researchBindingId='OW-STVG-1917'],
    ['future-source-replaced-by-current',c=>getPath(c,'ow-admin-20').normTimeline[1].sourceRefs[0].sourceId=SOURCE_IDS.OW2025],
    ['current-source-replaced-by-future',c=>getPath(c,'ow-admin-20').normTimeline[0].sourceRefs[0].sourceId=SOURCE_IDS.OW2027],
    ['forged-source-url',c=>c.sources.find(s=>s.sourceId===SOURCE_IDS.OWGOG).url='https://example.org/fake'],
    ['forged-source-version',c=>c.sources.find(s=>s.sourceId===SOURCE_IDS.NWVRG).versionDescription='2011-01-01 / Version 0'],
    ['forged-source-pinpoint',c=>c.sources.find(s=>s.sourceId===SOURCE_IDS.OWVGV).locators='Art. 999'],
    ['forged-path-pinpoint',c=>getPath(c,'nw-court-replik-20').sourceRefs[0].locator='Art. 999'],
    ['forged-timeline-pinpoint',c=>getPath(c,'ow-court-reasons-30').normTimeline[0].sourceRefs[0].locator='Art. 999'],
    ['foreign-law-source',c=>c.laws.find(l=>l.lawId==='stvg-vgv-ow').sourceRefs[0].sourceId=SOURCE_IDS.NWVRG],
    ['foreign-law-holiday-review',c=>c.laws.find(l=>l.lawId==='vrg-nw').holidayPolicyReview.sourceRefs[0].sourceId=SOURCE_IDS.OWGOG],
    ['foreign-profile-law',c=>getProfile(c,'ow-three').lawId='vrg-nw'],
    ['foreign-profile-source',c=>getProfile(c,'nw-winter').sourceRefs[0].sourceId=SOURCE_IDS.OWVGV],
    ['foreign-binding-law',c=>getBinding(c,'ow-administration-seat').lawId='vrg-nw'],
    ['renamed-new-law',c=>{for(const key of['laws','paths','suspensionProfiles','holidayBindings'])for(const x of c[key])if(x.lawId==='vrg-nw')x.lawId='fake-law';}],
    ['wrong-suspension-boundary',c=>getProfile(c,'nw-winter').periods[0].start.day=19],
    ['missing-suspension-source',c=>getProfile(c,'ow-three').sourceRefs.pop()],
    ['ow-admin-direct-gog-claim',c=>getBinding(c,'ow-administration-seat').projectionEvidence.legalInterpretation='directCourtStatute'],
    ['ow-court-administrative-transfer-claim',c=>getBinding(c,'ow-court-seat').projectionEvidence.legalInterpretation='systematicAdministrativeTransferConfirmedH1D'],
    ['foreign-binding-source',c=>getBinding(c,'nw-court-seat').legalBinding.sourceRefs[0].sourceId=SOURCE_IDS.OWGOG],
    ['fake-party-calendar-union',c=>getBinding(c,'nw-administration-seat').legalBinding.roleUnion=true],
    ['missing-active-parent',c=>{const b=getBinding(c,'ow-court-seat');b.physicalBaseline.references=b.physicalBaseline.references.filter(r=>r.contentId!=='ap22-ow-76c151dccf1f');}],
    ['forged-baseline-parent-hash',c=>getBinding(c,'ow-court-seat').projectionEvidence.baselineCalendarSha256='0'.repeat(64)],
    ['forged-physical-projection-id',c=>getBinding(c,'nw-administration-seat').physicalBaseline.projectionId='projection-fake'],
    ['wrong-inheritance-parent',(c,m,f)=>editFile(f,'calendars/ap23h2-ow-procedural-core.json',cal=>{cal.inherits=['ap22-nw-5dfca484e4af'];})],
    ['free-calendar-union',(c,m,f)=>editFile(f,'calendars/ap23h2-ow-procedural-core.json',cal=>{cal.inherits.push('ap22-nw-5dfca484e4af');})],
    ['existing-parent-payload-changed',(c,m,f)=>editFile(f,'calendars/ap22-ow-76c151dccf1f.json',cal=>{cal.rules[0].labels.de='Forged';})],
    ['old-holiday-rule-changed',(c,m,f)=>editFile(f,HOLIDAY,hc=>{hc.data.rules[0].de='Forged';})],
    ['wrong-new-rule-date',(c,m,f)=>editFile(f,HOLIDAY,hc=>{hc.activation.supplementalRules.find(r=>r.id==='OW-PROCEDURAL-ALL-DAY-BERCHTOLD').calculation.day=3;})],
    ['halfday-new-rule',(c,m,f)=>editFile(f,HOLIDAY,hc=>{hc.activation.supplementalRules.find(r=>r.id==='NW-PROCEDURAL-ALL-DAY-ST-STEPHEN').dayPortion='halfDay';})],
    ['foreign-new-rule-source',(c,m,f)=>editFile(f,HOLIDAY,hc=>{hc.activation.supplementalRules.find(r=>r.id==='OW-PROCEDURAL-ALL-DAY-BERCHTOLD').sourceRefs[0].evidenceId=SOURCE_IDS.NWVRG;})],
    ['wrong-new-calendar-rule',(c,m,f)=>editFile(f,'calendars/ap23h2-nw-procedural-core.json',cal=>{cal.rules[0].calculation.day=3;})],
    ['foreign-new-calendar-rule-source',(c,m,f)=>editFile(f,'calendars/ap23h2-ow-procedural-core.json',cal=>{cal.rules[0].sourceRefs[0].sourceId=SOURCE_IDS.NWVRG;})],
    ['missing-projection-supplement',(c,m,f)=>editFile(f,HOLIDAY,hc=>{hc.activation.projections.find(p=>p.calendarId==='ap23h2-ow-procedural-core').supplementScopeIds=[];})],
    ['foreign-projection-rule-id',(c,m,f)=>editFile(f,HOLIDAY,hc=>{hc.activation.projections.find(p=>p.calendarId==='ap23h2-ow-procedural-core').ruleIds[0]='FAKE';})]
  ])invalid(id,edit);
  invalid('wrong-active-parent-hash-after-dependent-reseal',()=>{},c=>{getBinding(c,'ow-court-seat').physicalBaseline.references.find(r=>r.contentId==='ap22-ow-76c151dccf1f').sha256='f'.repeat(64);});
  const inputMutations=[],positive=researchInput(research.cases.find(x=>x.path==='OW-ADMIN-20'&&x.expected.outcome==='datedResearchValue'),research);
  for(const key of['path','pathRevision','authoritySeatCanton','trigger','days','facts']){
    const i=structuredClone(positive);delete i[key];let actual;
    try{actual=evaluateH2(i,catalog,calendars,schemas.input);}catch{actual={outcome:'invalidInputRejected'};}
    assert.notEqual(actual.outcome,'datedResearchValue','Missing input '+key);inputMutations.push('missing:'+key);
  }
  for(const r of getPolicy(catalog,'ow-admin-20').requirements){const i=structuredClone(positive);delete i.facts[r.key];same(evaluateH2(i,catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');inputMutations.push('missing-current-fact:'+r.key);}
  for(const[key,value]of[['pathRevision',2],['authoritySeatCanton','BE'],['days',21]]){
    same(evaluateH2({...positive,[key]:value},catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');inputMutations.push('changed:'+key);
  }
  for(const [path,key,value]of[
    ['NW-EINSPRACHE-20','einspracheAdmissibility','unknown'],['NW-APPEAL-ORDERED','deadlineAgreement','agreedWithParties'],
    ['OW-ADMIN-REASONS-30','sameIssuingAuthority',false],['OW-COURT-REASONS-30','sameIssuingCourt',false],
    ['OW-COURT-SUSPENSIVE-5','suspensiveReviewContext','other'],['NW-COURT-REPLIK-20','opening','appealServedForComments'],
    ['NW-COURT-DUPLIK-20','opening','vernehmlassungServedForReply'],['OW-COURT-30','localHolidayEffect','concretePotentialEndChangeUnresolved']]){
    const item=research.cases.find(x=>x.path===path&&x.expected.outcome==='datedResearchValue'),i=researchInput(item,research);i.facts[key]=value;
    same(evaluateH2(i,catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');inputMutations.push(path+':'+key);
  }
  const spanning=research.cases.find(x=>x.expected.temporalBindings?.length===2);assert.ok(spanning,'H1 cross-version reference');
  for(const type of['gap','overlap']){const c=structuredClone(catalog),p=getPath(c,spanning.path.toLowerCase());
    if(type==='gap')p.normTimeline[0].interval.to='2026-12-20';else p.normTimeline[1].interval.from='2026-12-31';
    same(evaluateH2(researchInput(spanning,research),c,calendars,schemas.input).outcome,'researchWindowBoundary');inputMutations.push('actual-calculation-norm-'+type);}
  const evidence=await Promise.all(['scripts/check-ap23h2-contract.mjs','scripts/build-ap23h2-candidate.mjs','scripts/build-ap23h2-schemas.mjs',
    ...Object.values(H2_SCHEMA_FILES),OUTPUT+'/candidate-integrity.json',OUTPUT+'/bundle/manifest.json',OUTPUT+'/bundle/'+ADMIN].map(async path=>{
      const bytes=await readFile(resolve(ROOT,path));return{path,byteLength:bytes.length,sha256:sha(bytes)};}));
  return{workPackage:'AP23H2',status:'passed',runtimeActive:false,productIntegrationTest:false,sourceReleaseApproved:false,
    calendarExportEnabled:false,paths:79,newPaths:21,preservedPaths:58,physicalCalendars:35,artifacts:44,unchangedRawArtifacts:unchangedRaw,
    referenceCases:118,counts,calendarProbes:probes.length,calendarAnnualChecks:annual.length,
    calendarEndEligibilityComparisons:calendarComparisons.reduce((n,r)=>n+r.compared,0),readerNegatives,
    oldNativeReferenceCalculations:oldResults.length,forgedContextBlocks:oldResults.length*3,
    negativeCatalogMutations:mutations.length,allCatalogMutationsResealed:true,negativeInputMutations:inputMutations.length,
    results,annual,probes,calendarComparisons,oldResults,mutations,inputMutations,evidence};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const report=await runH2();if(process.argv.includes('--write'))await writeFile(resolve(ROOT,OUT,'QA-AP23H2.json'),encode(report));
  console.log(JSON.stringify({...report,results:undefined,evidence:undefined,annual:undefined,probes:undefined,oldResults:undefined,mutations:undefined,inputMutations:undefined},null,2));
}
