// SPDX-License-Identifier: AGPL-3.0-only
// Isolated contract probe. No format-11 runtime, release promotion or export.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSchema } from '../src/core/schemaContract.ts';
import { administrativePeriodDate } from '../src/core/administrativeCatalog.ts';
import { assertAdministrativeProcedureCatalogV3 } from '../src/core/administrativeCatalogV3.ts';
import { parseFormat10Data, parseFormat10LocalReferenceData } from '../src/core/releaseFormat10.ts';
import { calculateAdministrativeDeadline } from '../src/core/administrativeDeadline.ts';
import { countDayDeadline } from '../src/core/dayDeadlineArithmetic.ts';
import { generateCalendarFromRules, calculateCalendarRuleOccurrence } from '../src/core/generateCalendar.ts';
import { parseIsoDate, addCalendarDays } from '../src/core/date.ts';
import { administrativeInput10 } from '../tests/core/ap23f3Fixtures.ts';
import { ROOT, BASE, OUTPUT, ADMIN, sha, objSha, encode, buildG2Candidate } from './build-ap23g2-candidate.mjs';
import { buildG2Schemas, G2_SCHEMA_FILES } from './build-ap23g2-schemas.mjs';

const same = (a,b,label) => assert.deepEqual(a,b,label);
const read = p => readFile(resolve(ROOT,p),'utf8');
const json = async p => JSON.parse(await read(p));
const maps = (rows,key) => {const m=new Map(rows.map(r=>[r[key],r]));same(m.size,rows.length,`unique ${key}`);return m;};
const within = (i,d) => !!parseIsoDate(d)&&d>=i.from&&(i.to===null||d<=i.to);
const window = {from:'2026-08-29',to:'2027-12-31'};
const calendarIds = {UR:'ap22-ur-67275ff3e872',SO:'ap22-so-3f5f7b7f54f5',SH:'ap22-sh-ec7d0988145a'};
const ids = {UR:'SRC-AP23G1-UR-VRPV-20160301',URLSG:'SRC-AP23G1-UR-LSG-20030101',SO:'SRC-AP23G1-SO-VRG-20250801',
  SOGS:'SRC-AP23G1-SO-GS201463',SH:'SRC-AP23G1-SH-VRG-20251101',SHJG:'SRC-AP23G1-SH-JG-20260501',
  SHRTG:'SRC-AP23G1-SH-RTG-20070101',SHOGE:'JUD-AP23G1-SH-OGE-4020181K-20180824',
  SHBGER:'JUD-AP23G1-SH-BGER-2C4832025-20260312',ZPO:'SRC-AP23G1-CH-ZPO-20260701',NATIONAL:'SRC-AP23G1-CH-BUNDESFEIERTAG-19940701'};
// Fixed identities of independently reviewed proposal objects. These freeze URL,
// version, pinpoint, role and exclusion metadata. They are not a legal oracle and
// do not replace the separate G1 mappings or actual-calendar date comparisons.
const proposalPins={
  sources:{
    'SRC-AP23G1-UR-VRPV-20160301':'81282a26f46e83457e4a5da3530e18e5ff884b14ffa6a7787c3fde91d1731cf2',
    'SRC-AP23G1-UR-LSG-20030101':'35e7c7fbd7d7668329412148d7550af62fb56b2a74bb1acbaed243dff992f954',
    'SRC-AP23G1-SO-VRG-20250801':'1873479d28447b21bab6b7773a818e83de605b0f80018d31dce5342f82676484',
    'SRC-AP23G1-SO-GS201463':'3aa6d1ee13dc004d3f6b7919ee1a3f9a6282bf1d1e0a0a7cbf77ebb5f264d3b9',
    'SRC-AP23G1-SH-VRG-20251101':'8547909650da3beadd16c4bb7aed374d6e692d53e389bd01b7e0b2871cd9f931',
    'SRC-AP23G1-SH-JG-20260501':'0da8d23c8119f5b29ede5e04e44d8707be31236091ce67c5fa5a09cc67547f9c',
    'SRC-AP23G1-SH-RTG-20070101':'1e69c4c3b8743689141a6c43167cd0460b355d9425dc03de151544479677b712',
    'JUD-AP23G1-SH-OGE-4020181K-20180824':'289231fc5aa3aa7e7a9c4092a13d8322542764779ec2e0eb1b9259db32c50ee1',
    'JUD-AP23G1-SH-BGER-2C4832025-20260312':'0a6cc02cb60188f9c3c387e533eac89330d735a0795c447231da748377e6a381',
    'SRC-AP23G1-CH-ZPO-20260701':'88654248a8f206d7004b07ffb052aed9d4b890cc5cd161b1a892ac5bc76a6bc3',
    'SRC-AP23G1-CH-BUNDESFEIERTAG-19940701':'430f762870294fc9c6bd002a7cb5a1a1249b631192f7188991c62efe40785253'},
  laws:{'vrpv-ur':'8ee11fc4ffed8b581480f26ee98be37b6d6a9841b3248ef569aa923953ba3ca1',
    'vrg-so':'99050edab900cfc4af13e058aab1cf79ef6868f65913dc6f68483952fc9d120a',
    'vrg-sh':'41ffede80cdde74c1c64dd8cfa385e40a01539604b435ef06505a81302cadeea'},
  suspensionProfiles:{'ur-none':'4487dce573d2fb8e2b340be2075d2daa310e8adca996110cc5459999b2a61ab2',
    'ur-three':'db461509b4bd05b17302b23f98c3daf523e7c83169b173ff859edef38aa1c315',
    'so-none':'665b804adf3eba7d2861cefa4ef29fa942cd3c3ab84cfad81c0fbe0364dc94c2',
    'so-three':'79b1ed43e40fe936ad0dcd21e65d2fe7b55cc8c8de370f767c0296238d7934d1',
    'sh-none':'0cc9667945c2024f79df56c29770fdf6d8db67c3c012e3441366ca3dafb9ef9f',
    'sh-three':'361b83c0b0bd4ea78413f100019d7a496f731a6384d877f6ff28bce0ca42e30b'},
  holidayBindings:{'ur-administration-seat':'aa4d395d7d40c7b82588d581d6581e0dca553bda78c588873ead8326034e437a',
    'so-administration-seat':'5c9b22e8d2ca64acfff99017405a1d5e60dcdfddb9fdedd9cc2fb2e200569d99',
    'sh-administration-seat':'f386e6ca409bc70167538b2fb55200a92b699591da52827cf40ba67ff5514ddb',
    'sh-court-seat':'4966aa5dc6881fe779ba9235a3849fcc1af6597035ea9cf8698f4d0acaef96c9'},
  excludedPaths:{'g1-ur-local':'e1eae56623c5c50db2ef167d8672105d40fa821642ea3758131f5567a791e3f2',
    'g1-ur-opening':'9bc399c2911c1dc5cac17858b7d6f2d9ebf61518d85c6f10449581006463c8b1',
    'g1-ur-coordination':'75d2cf3f0e022bfc3c5a9bc36c84b7831bb5a1354f92b6c2ea693903e90e5f57',
    'g1-reasons-chain':'807977cc79c76fbbc7dd2e77cd9848fbb35e2ee60b7ed3cb58577d367fdd5c13',
    'g1-sh-shortening':'6d48a7cc72cadf433e9623741158715e9bc494d619e442eb707973e29e3169b8',
    'g1-end-suspension':'328f4eb9087cf17683763eb506152f48770cf556b461bdb9cc2c6466b0bd52c3'}
};
// Expected semantics come from accepted G1 facts, not the candidate builder.
const expectedPolicy = p => ({action:p.action,opening:p.opening,holidayAnchor:p.holidayAnchor,authorityLevel:'cantonal',specialLaw:'excluded',
  materialPerformance:false,fixedEndDate:false,deviatingStart:false,termChange:'none',unit:'day',direction:'forward',notice:'uncontested',
  suspensionContext:'ordinaryNoException',serviceContext:'effectiveLegalTriggerKnown',requiredTargetCourt:p.requiredCourt??'notApplicable',
  requiredSameIssuingCourt:p.sameIssuingCourt??false,openingChainPolicy:p.opening==='completeReasonedAdministrativeDecision'?'requireOriginalOrTimelyRequestedReasons':'notApplicable',
  coordinationPolicy:['UR-ADMIN-20','UR-COURT-20'].includes(p.id)?'excludeCoordinatedAppeal':'notApplicable',
  localHolidayPolicy:p.canton==='UR'?'blockConcreteUnresolvedAdditionalEndEffect':'notApplicable',
  specialOpeningPolicy:p.canton==='UR'?'ordinaryEffectiveUROpening':'notApplicable',shorteningPolicy:p.canton==='SH'?'noShortenedSHRekurs':'notApplicable'});
const legalKeys = (c,court) => c==='UR'?['UR','URLSG',...(court?['ZPO']:[])]:c==='SO'?['SO','SOGS','NATIONAL',...(court?['ZPO']:[])]:
  court?['SH','SHJG','SHRTG','SHOGE','ZPO']:['SH','SHRTG','SHBGER'];
const expectedAction = p => p.action==='requestAdministrativeReasons'?'administrative-reasons-request':p.action==='requestCourtReasons'?'court-reasons-request':
  `${p.days===null?'ordered':'ordinary'}-${p.stage==='court'?'court':'administrative'}-${p.days===null?'submission':'appeal'}`;

export function validateG2(c,old,research,schemas,descriptors,files) {
  assertSchema(c,schemas.catalog);
  same(c.contractStatus,'proposed');same(c.contractDecision,{id:'DEC-2026-036',status:'proposed',on:null});same(c.runtimeActive,false);
  const paths=maps(c.paths,'pathId'),policies=maps(c.qualificationPolicies,'pathId'),eligible=maps(c.releaseBinding.pathEligibility,'pathId');
  const laws=maps(c.laws,'lawId'),suspensions=maps(c.suspensionProfiles,'suspensionProfileId'),bindings=maps(c.holidayBindings,'holidayBindingId');
  const sources=maps(c.sources,'sourceId');
  same([paths.size,policies.size,eligible.size,laws.size,suspensions.size,bindings.size,sources.size],[58,58,58,11,20,13,45]);
  for(const[field,key]of[['paths','pathId'],['qualificationPolicies','pathId'],['laws','lawId'],['sources','sourceId'],
    ['suspensionProfiles','suspensionProfileId'],['holidayBindings','holidayBindingId'],['excludedPaths','exclusionId']]){
    const values=maps(c[field],key);for(const row of old[field])same(values.get(row[key]),row,`preserved ${field}/${row[key]}`);
  }
  for(const[field,key]of[['sources','sourceId'],['laws','lawId'],['suspensionProfiles','suspensionProfileId'],
    ['holidayBindings','holidayBindingId'],['excludedPaths','exclusionId']]){
    const newRows=c[field].filter(r=>!old[field].some(x=>x[key]===r[key]));
    same(Object.fromEntries(newRows.map(r=>[r[key],objSha(r)])),proposalPins[field],`Frozen reviewed proposal identities ${field}`);
  }
  const expectedIds=[...old.paths.map(p=>p.pathId),...research.paths.map(p=>p.id.toLowerCase())].sort();
  for(const m of[paths,policies,eligible])same([...m.keys()].sort(),expectedIds);
  const rb=c.releaseBinding;same(rb.status,'candidate');same(rb.releaseId,null);same(rb.approval,null);same(rb.targetComponentRefs,[]);
  same(rb.sourceReviewRef,null);same(rb.referenceSuiteRef,null);
  const refs=(rows,keys)=>{assert.ok(rows.length);same(rows.map(r=>r.sourceId).sort(),keys.map(k=>ids[k]).sort());
    for(const r of rows){assert.ok(sources.has(r.sourceId));assert.ok(r.locator.trim());}};
  const exactLegalRefs=(rows,keys)=>{refs(rows,keys);same(rows,keys.map(k=>({sourceId:ids[k],locator:sources.get(ids[k]).locators})));};
  for(const p of paths.values()){
    const q=policies.get(p.pathId),e=eligible.get(p.pathId),h=bindings.get(p.holidayBindingId),s=suspensions.get(p.suspensionProfileId),l=laws.get(p.lawId);
    assert.ok(h&&s&&l);same(h.lawId,p.lawId);same(s.lawId,p.lawId);
    same(q.pathSha256,objSha(p));same(q.pathRevision,p.revision);same(e.pathSha256,objSha(p));same(e.pathRevision,p.revision);
    same(e.qualificationPolicySha256,objSha(q));same(e.holidayBindingId,h.holidayBindingId);same(e.holidayBindingSha256,objSha(h));
    same(e.suspensionProfileId,s.suspensionProfileId);same(e.suspensionProfileSha256,objSha(s));same(e.status,'candidate');
    same(e.targetComponentRefs,[]);same(e.sourceReviewRef,null);same(e.referenceSuiteRef,null);
    same(e.caseCoverage,p.temporalBinding.caseCoverage);same(e.calculationCoverage,p.temporalBinding.calculationCoverage);
    if(old.paths.some(x=>x.pathId===p.pathId))continue;
    const r=research.paths.find(r=>r.id.toLowerCase()===p.pathId);assert.ok(r);const court=r.stage==='court',keys=legalKeys(r.canton,court);
    same(p.researchRef,r.id);same(p.revision,1);same(p.action,expectedAction(r));same(p.stages,[r.stage]);same(l.canton,r.canton);
    same(q.mode,'qualifiedDayProcedureV4');same(q.requirements,expectedPolicy(r));
    same(p.duration,r.days===null?{kind:'authorityOrderedDays',minimum:1,maximum:365,boundMeaning:'technicalSafetyLimitNotLegalMaximum'}:
      {kind:'statutoryDays',value:r.days,overridable:false});
    same(p.holidayBindingId,`${r.canton.toLowerCase()}-${r.canton==='SH'&&court?'court':'administration'}-seat`);
    same(p.suspensionProfileId,`${r.canton.toLowerCase()}-${r.suspension}`);same(p.urgencyPolicy,'notApplicable');same(p.endShiftPolicy,'nextWorkingDay');
    same(p.endShiftGuard,court?'blockWhenEnteringApplicableSuspension':'none');
    for(const k of['caseCoverage','calculationCoverage','sourceCoverage'])same(p.temporalBinding[k],window);
    same(p.temporalBinding.evaluation,'eachEvaluatedDayIncludingEndShift');same(p.normTimeline.length,1);same(p.normTimeline[0].interval,window);
    exactLegalRefs(p.normTimeline[0].sourceRefs,keys);exactLegalRefs(p.sourceRefs,keys);
    same(s.periods.length,court?3:0);
    for(const year of[2026,2027])if(court)same(s.periods.map(x=>[administrativePeriodDate(x.start,year),administrativePeriodDate(x.end,year)]).sort(),
      [[addCalendarDays(research.easter[year],-7),addCalendarDays(research.easter[year],7)],[`${year}-07-15`,`${year}-08-15`],[`${year}-12-18`,`${year+1}-01-02`]].sort());
    same(p.openingWarnings.length,r.openingRestriction?1:0);
    if(r.openingRestriction){const w=p.openingWarnings[0];same(w.warningId,'ur-art22-opening-restriction');same(w.evaluatedOn,'qualifiedOpeningDate');
      same(w.effect,'noticeOnlyNoDateChange');refs(w.sourceRefs,['UR']);same(w.sourceRefs[0].locator,'Art. 22');same(w.periods.length,2);
      for(const year of[2026,2027])same(w.periods.map(x=>[administrativePeriodDate(x.start,year),administrativePeriodDate(x.end,year)]).sort(),
        [[addCalendarDays(research.easter[year],-8),addCalendarDays(research.easter[year],8)],[`${year}-12-18`,`${year+1}-01-06`]].sort());}
  }
  const hc=JSON.parse(files.get(descriptors.get('ch-holiday-catalog').path));
  for(const h of c.holidayBindings.filter(h=>h.bindingVersion==='4.0.0')){
    const court=h.holidayBindingId==='sh-court-seat',canton=h.authoritySeatCanton,keys=legalKeys(canton,court),physical=h.physicalBaseline;
    same(physical.calendarId,calendarIds[canton]);same(physical.releaseId,'2026-10-22-ap23f3-candidate.1');
    same(h.anchor,court?'courtSeat':'authoritySeat');same(h.authorityLevel,'cantonal');same(h.legalBinding.roleUnion,false);same(h.legalBinding.partyOrRepresentativeRequired,false);
    refs(h.legalBinding.sourceRefs,keys);refs(h.physicalReuse.evidenceRefs,keys);
    const calendar=JSON.parse(files.get(descriptors.get(physical.calendarId).path));same(calendar.jurisdiction.code,canton);
    same(physical.references.map(r=>r.contentId).sort(),[physical.calendarId,'ch-federal-calendar','ch-holiday-catalog'].sort());
    for(const r of physical.references){const d=descriptors.get(r.contentId);same(r,{role:d.role,contentId:d.contentId,path:d.path,sha256:d.sha256});}
    same(h.physicalReuse.kind,'sameDatesIndependentLegalBasis');same(h.physicalReuse.permissionInheritance,'none');
    same(h.physicalReuse.sourceReleaseId,physical.releaseId);same(h.physicalReuse.sourceCatalogSha256,descriptors.get('ch-holiday-catalog').sha256);
    same(h.physicalReuse.selectedRuleIds,calendar.rules.map(r=>r.ruleId));
    same(h.physicalReuse.projectionRuleIds,hc.activation.projections.find(p=>p.calendarId===calendar.calendarId).ruleIds);
    const shAdmin=canton==='SH'&&!court;same(h.physicalReuse.notDerivedFrom,shAdmin?'SH-ZPO-ADDITIONAL':'notApplicable');
    if(shAdmin){same(h.practiceAddition.day,'01-02');same(h.practiceAddition.scope,'newSHGeneralAdministrativeOnly');
      same(h.practiceAddition.evidenceLimit,'nonDispositiveCantonalLawDescription');refs(h.practiceAddition.sourceRefs,['SHBGER']);same(h.practiceAddition.sourceRefs[0].locator,'E. 3.1');}
    else same(h.practiceAddition,null);
  }
  same(c.excludedPaths.length,22);
  return true;
}

const block=(reason,category='qualificationBoundaryProposed',other={})=>({outcome:'blocked',category,reason,exportAllowed:false,...other});
/** Reads actual candidate parameters, using unchanged shared product arithmetic. */
export function evaluateG2(i,c,calendars,schema){
  try{assertSchema(i,schema);}catch{return block('inputContractInvalid');}
  const p=c.paths.find(p=>p.pathId===i.path),q=c.qualificationPolicies.find(q=>q.pathId===i.path);
  if(!p||q?.mode!=='qualifiedDayProcedureV4')return block('pathNotQualified');
  const r=q.requirements,l=c.laws.find(l=>l.lawId===p.lawId);
  if(p.revision!==i.pathRevision||!p.stages.includes(i.stage)||l.canton!==i.authoritySeatCanton)return block('pathContextMismatch');
  for(const k of['action','opening','holidayAnchor','authorityLevel','specialLaw','materialPerformance','fixedEndDate','deviatingStart',
    'termChange','unit','direction','notice','suspensionContext','serviceContext'])if(i[k]!==r[k])return block('notQualified:'+k);
  if(r.requiredTargetCourt!=='notApplicable'&&i.targetCourt!==r.requiredTargetCourt)return block('targetCourtNotQualified');
  if(r.requiredSameIssuingCourt&&i.sameIssuingCourt!==true)return block('courtReasonsWrongRecipient');
  if(r.openingChainPolicy==='requireOriginalOrTimelyRequestedReasons'){
    if(!['originalReasoned','reasonedFollowingRequest'].includes(i.openingOrigin))return block('openingOriginNotQualified');
    if(i.openingOrigin==='reasonedFollowingRequest'&&i.priorReasonsRequest!=='timelyEstablished')return block('priorReasonsRequestNotEstablished');}
  if(r.coordinationPolicy==='excludeCoordinatedAppeal'&&i.coordinatedDecision!==false)return block('urCoordinatedLongestPeriodNotQualified');
  if(r.localHolidayPolicy==='blockConcreteUnresolvedAdditionalEndEffect'&&i.localHolidayEffect!=='noAdditionalRelevantLocalHoliday')return block('urLocalHolidayEffectUnresolved');
  if(r.specialOpeningPolicy==='ordinaryEffectiveUROpening'&&i.urOpeningConsequence!=='ordinaryEffectiveOpening')return block('urOpeningSpecialConsequenceUnresolved');
  if(r.shorteningPolicy==='noShortenedSHRekurs'&&i.shortenedRekurs!==false)return block('shShortenedRekursOutsideOrdinaryPath');
  if(p.duration.kind==='statutoryDays'&&i.days!==p.duration.value)return block('statutoryDurationMismatch');
  if(p.duration.kind==='authorityOrderedDays'&&(i.days<p.duration.minimum||i.days>p.duration.maximum))return block('orderedDurationOutsideTechnicalGuard');
  const h=c.holidayBindings.find(h=>h.holidayBindingId===p.holidayBindingId),calendar=calendars.find(c=>c.calendarId===h.physicalBaseline.calendarId);
  const coverage=[p.temporalBinding.caseCoverage,p.temporalBinding.calculationCoverage,p.temporalBinding.sourceCoverage,calendar.validity];
  const covered=d=>coverage.every(x=>within(x,d))&&p.normTimeline.filter(t=>within(t.interval,d)).length===1;
  if(!covered(i.trigger))return block('outsideReferenceWindow','researchWindowBoundary');
  const range=p.temporalBinding.calculationCoverage,generated=generateCalendarFromRules(calendars,calendar.calendarId,range),holidays=new Map();
  for(const h of generated.calendar.holidays)holidays.set(h.date,[...(holidays.get(h.date)??[]),h]);
  const expand=periods=>{const out=[];for(let year=Number(range.from.slice(0,4))-1;year<=Number(range.to.slice(0,4));year++)
    for(const p of periods)out.push({periodId:`${p.periodId}-${year}`,startsOn:administrativePeriodDate(p.start,year),endsOn:administrativePeriodDate(p.end,year)});return out;};
  const periods=expand(c.suspensionProfiles.find(s=>s.suspensionProfileId===p.suspensionProfileId).periods);
  const a=countDayDeadline({legallyRelevantDate:i.trigger,deadlineDays:i.days,periods,shiftStartDuringSuspension:true,holidaysByDate:holidays,isCovered:covered,
    blockEndShiftIntoSuspension:p.endShiftGuard==='blockWhenEnteringApplicableSuspension'});
  if(a.outcome==='blocked')return block(a.reason,a.reason==='endShiftIntoSuspensionUnresolved'?'unresolvedBoundaryProposed':'researchWindowBoundary',
    {nominalEnd:a.provisionalEnd,blockedDate:a.blockedDate});
  const warnings=p.openingWarnings.filter(w=>expand(w.periods).some(x=>x.startsOn<=i.trigger&&i.trigger<=x.endsOn)).map(()=> 'UR-ART22');
  return{outcome:'reference',category:'datedResearchValue',ordinaryStart:a.ordinaryStart,firstCountedDay:a.countedDates[0],end:a.finalEnd,
    nominalEnd:a.provisionalEnd,skippedDays:a.skippedCalendarDays,endShiftDays:(Date.parse(a.finalEnd)-Date.parse(a.provisionalEnd))/86400000,warnings,exportAllowed:false};
}
function syntheticInput(item,research){
  const p=research.paths.find(p=>p.id===item.path)??research.paths[0];
  return{...research.sharedSyntheticFacts,path:research.paths.some(p=>p.id===item.path)?item.path.toLowerCase():'unknown',pathRevision:1,
    authoritySeatCanton:p.canton,stage:p.stage,action:p.action,opening:p.opening,holidayAnchor:p.holidayAnchor,targetCourt:p.requiredCourt??'notApplicable',
    sameIssuingCourt:p.sameIssuingCourt??false,openingOrigin:p.opening==='completeReasonedAdministrativeDecision'?'originalReasoned':'notApplicable',
    trigger:item.trigger,days:item.days,...item.facts};
}
function reseal(c){for(const p of c.paths){const q=c.qualificationPolicies.find(q=>q.pathId===p.pathId),e=c.releaseBinding.pathEligibility.find(e=>e.pathId===p.pathId);
  if(!q||!e)continue;q.pathSha256=objSha(p);const h=c.holidayBindings.find(h=>h.holidayBindingId===p.holidayBindingId),s=c.suspensionProfiles.find(s=>s.suspensionProfileId===p.suspensionProfileId);
  Object.assign(e,{pathSha256:objSha(p),qualificationPolicySha256:objSha(q),holidayBindingId:h?.holidayBindingId,holidayBindingSha256:objSha(h),
    suspensionProfileId:s?.suspensionProfileId,suspensionProfileSha256:objSha(s),caseCoverage:p.temporalBinding.caseCoverage,calculationCoverage:p.temporalBinding.calculationCoverage});}}

export async function runG2(){
  const built=await buildG2Candidate(),{schemas}=await buildG2Schemas(),{old,research}=built;
  for(const[k,p]of Object.entries(G2_SCHEMA_FILES))same(await json(p),schemas[k]);
  const m=await json(`${OUTPUT}/bundle/manifest.json`),c=await json(`${OUTPUT}/bundle/${ADMIN}`),files=new Map();
  same(m,built.manifest);same(c,built.catalog);assertSchema(m,schemas.localManifest);assert.throws(()=>assertSchema(m,schemas.manifest));
  same(m.artifacts.length,42);same(m.calendarIds.length,33);same(m.formatVersion,'11.0.0');same(m.compatibility.minimumConsumerFormatVersion,'11.0.0');
  let unchangedRaw=0;for(const d of m.artifacts){const b=await read(`${OUTPUT}/bundle/${d.path}`);same(sha(b),d.sha256);same(Buffer.byteLength(b),d.byteLength);
    same(b,built.files.get(d.path));files.set(d.path,b);if(d.path!==ADMIN){same(b,await read(`${BASE}/${d.path}`));unchangedRaw++;}}
  same(unchangedRaw,41);const descriptors=maps(m.artifacts,'contentId');validateG2(c,old,research,schemas,descriptors,files);
  const calendars=[...files.values()].map(JSON.parse).filter(d=>d.dataKind==='calendar');
  const results=research.cases.map(item=>{const input=syntheticInput(item,research),result=evaluateG2(input,c,calendars,schemas.input);
    same(result.category,item.expected.outcome,item.id);same(result.exportAllowed,false);
    for(const k of['end','nominalEnd','firstCountedDay','ordinaryStart','skippedDays','endShiftDays','warnings'])
      if(Object.hasOwn(item.expected,k))same(result[k],item.expected[k],`${item.id}/${k}`);
    if(item.expected.outcome==='unresolvedBoundaryProposed'){
      same(result.reason,'endShiftIntoSuspensionUnresolved');same(result.blockedDate,addCalendarDays(item.expected.nominalEnd,1),item.id);
      assert.ok(result.blockedDate<=item.expected.ordinaryShiftEnd);same(Object.hasOwn(result,'end'),false);
    }
    return{id:item.id,input,...result};});
  const counts=Object.fromEntries(['datedResearchValue','unresolvedBoundaryProposed','qualificationBoundaryProposed','researchWindowBoundary'].map(k=>[k,results.filter(r=>r.category===k).length]));
  same(Object.values(counts),[70,7,34,4]);
  for(const p of research.paths)assert.ok(results.some(r=>r.input.path===p.id.toLowerCase()&&r.outcome==='reference'));
  const dates=(id,year,seen=new Set())=>{if(seen.has(id))return new Set();seen.add(id);const cal=calendars.find(c=>c.calendarId===id);assert.ok(cal);
    const out=new Set(cal.rules.filter(r=>r.effect.type==='holiday').map(r=>{same(r.condition,'always');return calculateCalendarRuleOccurrence(r.calculation,year,r.ruleId).date;}));
    for(const parent of cal.inherits)for(const d of dates(parent,year,seen))out.add(d);return out;};
  const annual=[];for(const canton of['UR','SO','SH'])for(const year of[2026,2027]){
    const set=dates(calendarIds[canton],year);same(set.size,{UR:14,SO:13,SH:13}[canton]);annual.push({canton,year,days:[...set].sort()});}
  const probes=research.calendarProbes.map(p=>{const canton=p.calendar.slice(0,2),actual=dates(calendarIds[canton],Number(p.date.slice(0,4))).has(p.date);same(actual,p.isHoliday);return{...p,actual};});
  const mutations=[];const invalid=(id,edit)=>{const altered=structuredClone(c);edit(altered);reseal(altered);
    assert.throws(()=>validateG2(altered,old,research,schemas,descriptors,files),undefined,id);mutations.push(id);};
  const path=(c,id)=>c.paths.find(p=>p.pathId===id),policy=(c,id)=>c.qualificationPolicies.find(p=>p.pathId===id).requirements;
  for(const[id,edit]of[
    ['missing-new-group',c=>c.paths.pop()],['duplicate-group',c=>c.paths.push(c.paths.at(-1))],
    ['old-path-changed',c=>path(c,'zh-rekurs-30').duration.value=31],['old-policy-changed',c=>policy(c,'zh-rekurs-30').notice='unknown'],
    ['forged-runtime',c=>c.runtimeActive=true],['forged-contract-approval',c=>c.contractStatus='approved'],
    ['forged-release-approval',c=>c.releaseBinding.status='approved'],['wrong-reasons-duration',c=>path(c,'sh-court-reasons-30').duration.value=10],
    ['wrong-reasons-opening',c=>policy(c,'so-admin-reasons-10').opening='lawfullyUnreasonedAdministrativeDecision'],
    ['wrong-reasons-recipient',c=>policy(c,'sh-court-reasons-30').requiredSameIssuingCourt=false],
    ['drop-opening-chain',c=>policy(c,'ur-admin-20').openingChainPolicy='notApplicable'],
    ['drop-local-boundary',c=>policy(c,'ur-admin-ordered').localHolidayPolicy='notApplicable'],
    ['drop-coordination-boundary',c=>policy(c,'ur-admin-20').coordinationPolicy='notApplicable'],
    ['broaden-coordination-to-ordered',c=>policy(c,'ur-admin-ordered').coordinationPolicy='excludeCoordinatedAppeal'],
    ['drop-sh-shortening',c=>policy(c,'sh-admin-20').shorteningPolicy='notApplicable'],
    ['wrong-holiday-role',c=>policy(c,'ur-admin-reasons-10').holidayAnchor='targetAuthoritySeat'],
    ['drop-art22-warning',c=>path(c,'ur-admin-20').openingWarnings=[]],
    ['warning-as-pause',c=>path(c,'ur-admin-20').suspensionProfileId='ur-three'],
    ['art22-wrong-easter-boundary',c=>path(c,'ur-admin-20').openingWarnings[0].periods[0].start.days=-7],
    ['art22-wrong-january-boundary',c=>path(c,'ur-admin-20').openingWarnings[0].periods[1].end.day=2],
    ['drop-court-collision-guard',c=>path(c,'so-court-10').endShiftGuard='none'],
    ['wrong-sh-court-anchor',c=>c.holidayBindings.find(h=>h.holidayBindingId==='sh-court-seat').anchor='authoritySeat'],
    ['drop-sh-admin-practice',c=>c.holidayBindings.find(h=>h.holidayBindingId==='sh-administration-seat').practiceAddition=null],
    ['weaken-sh-practice-evidence',c=>c.holidayBindings.find(h=>h.holidayBindingId==='sh-administration-seat').practiceAddition.evidenceLimit='fullyDispositive'],
    ['inherit-zpo-legal-permission',c=>c.holidayBindings.find(h=>h.holidayBindingId==='sh-administration-seat').physicalReuse.permissionInheritance='ZPO'],
    ['wrong-physical-selection',c=>c.holidayBindings.find(h=>h.holidayBindingId==='sh-administration-seat').physicalReuse.selectedRuleIds.pop()],
    ['replace-sh-admin-bger-by-oge',c=>{const h=c.holidayBindings.find(h=>h.holidayBindingId==='sh-administration-seat');h.legalBinding.sourceRefs.at(-1).sourceId=ids.SHOGE;}],
    ['broaden-window',c=>path(c,'ur-admin-20').temporalBinding.calculationCoverage.to='2028-12-31'],
    ['norm-hole',c=>path(c,'ur-court-20').normTimeline[0].interval.to='2026-12-31'],
    ['duplicate-norm-interval',c=>path(c,'so-court-10').normTimeline.push(path(c,'so-court-10').normTimeline[0])],
    ['forged-new-source-url',c=>c.sources.find(s=>s.sourceId===ids.SHBGER).url='https://example.org/forged'],
    ['forged-new-source-version',c=>c.sources.find(s=>s.sourceId===ids.SHBGER).versionDescription='Fiktive Fassung'],
    ['forged-new-path-pinpoint',c=>path(c,'sh-admin-20').sourceRefs.at(-1).locator='E. 9.99'],
    ['forged-new-timeline-pinpoint',c=>path(c,'sh-admin-20').normTimeline[0].sourceRefs.at(-1).locator='E. 9.99'],
    ['forged-legal-binding-pinpoint',c=>c.holidayBindings.find(h=>h.holidayBindingId==='sh-administration-seat').legalBinding.sourceRefs.at(-1).locator='E. 9.99'],
    ['forged-physical-evidence-pinpoint',c=>c.holidayBindings.find(h=>h.holidayBindingId==='sh-administration-seat').physicalReuse.evidenceRefs.at(-1).locator='E. 9.99'],
    ['foreign-suspension-source',c=>c.suspensionProfiles.find(s=>s.suspensionProfileId==='ur-three').sourceRefs[0].sourceId=ids.SO],
    ['forged-law-deviation-review',c=>c.laws.find(l=>l.lawId==='vrg-sh').holidayPolicyReview.explicitDeviation='noneIdentifiedInReviewedGeneralLaw'],
    ['forged-law-review-source',c=>c.laws.find(l=>l.lawId==='vrg-sh').holidayPolicyReview.sourceRefs[0].sourceId=ids.UR],
    ['forged-physical-projection-id',c=>c.holidayBindings.find(h=>h.holidayBindingId==='sh-administration-seat').physicalBaseline.projectionId='projection-forged'],
    ['consistently-renamed-new-law',c=>{for(const field of['laws','paths','suspensionProfiles','holidayBindings'])for(const row of c[field])if(row.lawId==='vrpv-ur')row.lawId='vrpv-fake';}],
    ['forged-exclusion-id',c=>c.excludedPaths.at(-1).exclusionId='g1-unrelated'],
    ['forged-exclusion-meaning',c=>c.excludedPaths.at(-1).reason='Kein Vorbehalt erforderlich']
  ])invalid(id,edit);
  const inputMutations=[],positive=syntheticInput(research.cases[0],research);
  for(const k of Object.keys(positive)){const i={...positive};delete i[k];same(evaluateG2(i,c,calendars,schemas.input).outcome,'blocked',`missing ${k}`);inputMutations.push('missing:'+k);}
  for(const[k,v]of[['pathRevision',2],['authoritySeatCanton','BE'],['days',21],['openingOrigin','unknown'],['specialLaw','ATSG'],['notice','incorrect'],['unit','hour'],['unrecognisedFact',true]]){
    same(evaluateG2({...positive,[k]:v},c,calendars,schemas.input).outcome,'blocked',k);inputMutations.push('changed:'+k);}
  const gap=structuredClone(c);path(gap,'ur-court-20').normTimeline[0].interval.to='2026-12-31';
  const spanning=syntheticInput(research.cases.find(r=>r.id==='UR10'),research);
  same(evaluateG2(spanning,gap,calendars,schemas.input).category,'researchWindowBoundary');inputMutations.push('post-receipt-norm-gap');
  const overlap=structuredClone(c);path(overlap,'ur-court-20').normTimeline.push({interval:{from:'2027-01-01',to:'2027-12-31'},sourceRefs:path(overlap,'ur-court-20').sourceRefs});
  same(evaluateG2(spanning,overlap,calendars,schemas.input).category,'researchWindowBoundary');inputMutations.push('post-receipt-norm-overlap');
  const baseManifestText=await read(`${BASE}/manifest.json`),baseManifest=JSON.parse(baseManifestText),baseFiles=new Map();
  for(const d of baseManifest.artifacts)baseFiles.set(d.path,await read(`${BASE}/${d.path}`));
  const ctx=parseFormat10LocalReferenceData(baseManifestText,baseFiles),readerNegatives=[];
  assert.throws(()=>assertAdministrativeProcedureCatalogV3(c));readerNegatives.push('native-catalog3-rejects-catalog4');
  for(const[name,reader]of[['approved',parseFormat10Data],['local',parseFormat10LocalReferenceData]]){
    assert.throws(()=>reader(encode(m),files));readerNegatives.push(name+'-format10-rejects-format11');}
  const forged=structuredClone(c);Object.assign(forged,{$schema:old.$schema,formatVersion:'3.0.0',contractStatus:'approved',contractDecision:old.contractDecision});
  assert.throws(()=>assertAdministrativeProcedureCatalogV3(forged));readerNegatives.push('relabelled-catalog3-rejected');
  const forgedManifest=structuredClone(baseManifest),forgedFiles=new Map(files),text=encode(forged);forgedFiles.set(ADMIN,text);
  Object.assign(forgedManifest.artifacts.find(a=>a.path===ADMIN),{sha256:sha(text),byteLength:Buffer.byteLength(text)});
  assert.throws(()=>parseFormat10LocalReferenceData(encode(forgedManifest),forgedFiles));readerNegatives.push('rehash-and-manifest10-relabel-rejected');
  const oldSized=structuredClone(old);oldSized.paths.find(p=>p.pathId==='ar-execution-5').duration.value=6;reseal(oldSized);
  assertSchema(oldSized,await json('schemas/administrative-procedure-catalog-v3.schema.json'));
  assert.throws(()=>assertAdministrativeProcedureCatalogV3(oldSized));readerNegatives.push('old-schema-valid-inventory42-semantic-change-rejected');
  const oldResults=old.paths.map(p=>{const input=administrativeInput10(old,p.pathId,'2026-10-02',p.duration.kind==='statutoryDays'?p.duration.value:10);
    const a=calculateAdministrativeDeadline(input,ctx);same(a.outcome,'calculated',p.pathId);
    for(const fake of[{catalog:c,manifest:m},structuredClone(ctx),JSON.parse(JSON.stringify(ctx))])same(calculateAdministrativeDeadline(input,fake).outcome,'blocked');
    return{pathId:p.pathId,end:a.finalEnd,fakeContextsBlocked:3};});
  const evidence=await Promise.all(['scripts/check-ap23g2-contract.mjs','scripts/build-ap23g2-candidate.mjs','scripts/build-ap23g2-schemas.mjs',
    ...Object.values(G2_SCHEMA_FILES),`${OUTPUT}/candidate-integrity.json`,`${OUTPUT}/bundle/manifest.json`,`${OUTPUT}/bundle/${ADMIN}`].map(async path=>{
      const b=await readFile(resolve(ROOT,path));return{path,byteLength:b.length,sha256:sha(b)};}));
  return{status:'passed',workPackage:'AP23G2',technicalAcceptance:'pending',decision:'DEC-2026-036 proposed',runtimeActive:false,productIntegrationTest:false,
    sourceReleaseApproved:false,calendarExportEnabled:false,paths:58,newPaths:16,preservedPaths:42,policies:58,laws:11,suspensionProfiles:20,holidayBindings:13,
    physicalCalendars:33,artifacts:42,unchangedRawArtifacts:unchangedRaw,referenceCases:115,counts,calendarProbes:probes.length,annualCalendarChecks:annual.length,
    negativeCatalogMutations:mutations.length,allCatalogMutationsResealed:true,negativeInputMutations:inputMutations.length,readerNegatives,
    oldNativeReferenceCalculations:oldResults.length,forgedContextBlocks:oldResults.length*3,manifestSha256:sha(encode(m)),
    results,annual,probes,mutations,inputMutations,oldResults,evidence};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const r=await runG2();if(process.argv.includes('--write'))await writeFile(resolve(ROOT,'outputs/ap23g2-2026-10-22/QA-AP23G2.json'),encode(r));
  const{results,annual,probes,mutations,inputMutations,oldResults,evidence,...summary}=r;console.log(JSON.stringify(summary,null,2));
}
