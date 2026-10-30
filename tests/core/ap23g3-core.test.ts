// SPDX-License-Identifier: AGPL-3.0-only
// Native Format-11 tests. All positive facts and approval shapes are synthetic.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { calculateAdministrativeDeadline } from '../../src/core/administrativeDeadline';
import { parseFormat11Data, parseFormat11LocalReferenceData, getVerifiedAdministrativeDataV4, assertTrustedFormat11Data } from '../../src/core/releaseFormat11';
import { parseFormat10Data, parseFormat10LocalReferenceData, getVerifiedAdministrativeDataV3 } from '../../src/core/releaseFormat10';
import { assertAdministrativeProcedureCatalogV3 } from '../../src/core/administrativeCatalogV3';
import { buildSyntheticFormat11, changeSyntheticFormat11, encode11, AP23G3_ADMIN, administrativeInput11, resealAdministrative11 } from './ap23g3Fixtures';
import { administrativeInput10 } from './ap23f3Fixtures';
import { createFormat11CalculationData } from '../../src/core/format11CalculationData';
import { createCalculatorRuntime } from '../../src/core/calculatorRuntime';
import { trustedFormat11Runtime, hasMatchingFormat11Runtime } from '../../src/core/format11Runtime';
import { calculateDeadline, calculateRuntimeDeadline } from '../../src/core/calculateDeadline';
import { calculateCalendarBoundDeadline } from '../../src/core/calculateCalendarBoundDeadline';
import { calculateSpecialDeadline } from '../../src/core/calculateSpecialDeadline';
import { resolveSocialDeadline } from '../../src/core/socialDeadline';
import { canonicalSocialJson } from '../../src/core/socialCatalog';

const fixture=buildSyntheticFormat11();
const context=parseFormat11LocalReferenceData(encode11(fixture.manifest),fixture.files);
const catalog=context.administrativeCatalog;
const research=JSON.parse(readFileSync('docs/fachrecht/ap23g1/referenzfaelle.json','utf8'));
const input=(id?:string,date?:string,days?:number,stage?:string)=>administrativeInput11(catalog,id,date,days,stage);
function adaptG1(row:any):any {
  const p=research.paths.find((p:any)=>p.id===row.path);
  if(!p)return{...input(),selection:{...input().selection,pathId:'unknown'},inputDate:row.trigger,deadlineDays:row.days};
  const v:any=input(p.id.toLowerCase(),row.trigger,row.days);
  for(const[k,value]of Object.entries(row.facts??{})){
    if(k==='stage')v.selection.stage=value;
    else if(k==='authorityLevel')v.authoritySeat.level=value;
    else if(k==='specialLaw')v.qualification.specialLaw=value==='ATSG'?'applicableFederalSpecialLaw':value;
    else if(k==='fixedEndDate'||k==='deviatingStart')v.qualification[k]=value;
    else if(k==='coordinatedDecision'&&!('coordinatedDecision'in v.caseQualification)){
      // G1 explicitly proves that an already ordered duration does not use the
      // longest coordinated-appeal rule. This API intentionally requests no
      // irrelevant coordination fact for those paths.
      assert.equal(p.days,null);
    }else v.caseQualification[k]=value;
  }
  return v;
}
function blocked(v:any,key?:string,ctx?:unknown):void {
  const actualContext=arguments.length<3?context:ctx;
  const r=calculateAdministrativeDeadline(v,actualContext);assert.equal(r.outcome,'blocked',JSON.stringify(r));
  assert.equal(r.calendarExportAllowed,false);assert.equal('finalEnd'in r,false);
  if(key&&r.outcome==='blocked')assert.ok(r.blockReasonKeys.includes(key),JSON.stringify(r));
}

for(const row of research.cases)test('AP23G3 native11 matches accepted G1 '+row.id,()=>{
  const r=calculateAdministrativeDeadline(adaptG1(row),context);assert.equal(r.calendarExportAllowed,false);
  if(row.expected.outcome!=='datedResearchValue'){
    assert.equal(r.outcome,'blocked',JSON.stringify(r));assert.equal('finalEnd'in r,false);
    if(r.outcome!=='blocked')return;
    if(row.expected.outcome==='unresolvedBoundaryProposed'){
      assert.ok(r.blockReasonKeys.includes('endShiftIntoSuspensionUnresolved'));assert.equal(r.provisionalEnd,row.expected.nominalEnd);
      assert.equal(r.blockedDate,'2027-03-21');
    }else if(row.expected.outcome==='researchWindowBoundary')assert.ok(r.blockReasonKeys.some(k=>['administrative.outsideCaseCoverage','dataCoverageExceeded'].includes(k)));
    return;
  }
  assert.equal(r.outcome,'calculated',JSON.stringify(r));if(r.outcome!=='calculated')return;
  assert.equal(r.finalEnd,row.expected.end);assert.equal(r.referenceOnly,true);
  if(row.expected.nominalEnd)assert.equal(r.provisionalEnd,row.expected.nominalEnd);
  if(row.expected.firstCountedDay)assert.equal(r.countedDates[0],row.expected.firstCountedDay);
  if(row.expected.skippedDays!==undefined)assert.equal(r.skippedCalendarDays,row.expected.skippedDays);
  if(row.expected.warnings)assert.deepEqual(r.warningKeys,row.expected.warnings.map(()=> 'administrative.urArt22OpeningRestriction'));
  assert.ok(r.provenance.evaluatedNormSegments?.length);
});

test('AP23G3 counts and native contract preserve all 16 independent groups',()=>{
  assert.equal(research.cases.length,115);assert.equal(catalog.paths.length,58);
  assert.deepEqual(['datedResearchValue','unresolvedBoundaryProposed','qualificationBoundaryProposed','researchWindowBoundary']
    .map(k=>research.cases.filter((r:any)=>r.expected.outcome===k).length),[70,7,34,4]);
  const paths=catalog.paths.filter(p=>'openingWarnings'in p);
  assert.equal(paths.length,16);assert.equal(paths.filter(p=>'openingWarnings'in p&&p.openingWarnings.length).length,2);
  assert.equal(paths.filter(p=>p.endShiftGuard==='blockWhenEnteringApplicableSuspension').length,7);
  for(const p of paths)assert.ok(research.cases.some((c:any)=>c.path===p.researchRef&&c.expected.outcome==='datedResearchValue'));
});

test('AP23G3 conditional facts are exact and every required omission is blocked',()=>{
  for(const p of catalog.paths.filter(p=>'openingWarnings'in p)){
    const full:any=input(p.pathId,'2026-10-02',p.duration.kind==='authorityOrderedDays'?10:undefined);
    const before=calculateAdministrativeDeadline(full,context);assert.equal(before.outcome,'calculated',p.pathId);
    const absent=structuredClone(full);delete absent.caseQualification;blocked(absent,'administrative.caseQualificationRequired');
    for(const key of Object.keys(full.caseQualification)){const c=structuredClone(full);delete c.caseQualification[key];blocked(c);}
    for(const [key,value]of Object.entries({action:'unknown',opening:'unknown',holidayAnchor:'partyOrRepresentativeSeat',materialPerformance:true,
      unit:'hour',direction:'backward',notice:'missing',termChange:'restorationRequested',suspensionContext:'taxCase',serviceContext:'unknown'})){
      const c=structuredClone(full);c.caseQualification[key]=value;blocked(c);
    }
    const c=structuredClone(full);c.caseQualification.approved=true;blocked(c,'administrative.inputContractInvalid');
    const extra=structuredClone(full);extra.fictionAccepted=true;blocked(extra,'administrative.inputContractInvalid');
    blocked({...full,urgency:'explicitJudicialUrgencyOrder'},'administrative.unsupportedUrgency');
  }
});

test('AP23G3 exactly six ordinary paths require explicit current opening chains',()=>{
  const chains=catalog.qualificationPolicies.filter(p=>p.mode==='qualifiedDayProcedureV4'&&p.requirements.openingChainPolicy==='requireOriginalOrTimelyRequestedReasons');
  assert.equal(chains.length,6);
  for(const p of chains){
    const original:any=input(p.pathId);const initial=calculateAdministrativeDeadline(original,context);assert.equal(initial.outcome,'calculated');
    assert.equal('priorReasonsRequest'in original.caseQualification,false);
    const next=structuredClone(original);next.caseQualification.openingOrigin='reasonedFollowingRequest';
    blocked(next);for(const value of['late','unknown']){next.caseQualification.priorReasonsRequest=value;blocked(next,'administrative.priorReasonsRequestNotEstablished');}
    next.caseQualification.priorReasonsRequest='timelyEstablished';const final=calculateAdministrativeDeadline(next,context);
    assert.equal(final.outcome,'calculated');if(initial.outcome==='calculated'&&final.outcome==='calculated')assert.equal(final.finalEnd,initial.finalEnd);
    const unknown=structuredClone(original);unknown.caseQualification.openingOrigin='unknown';blocked(unknown,'administrative.openingOriginNotQualified');
    for(const forged of[new String('originalReasoned'),{toString:()=> 'originalReasoned'},{valueOf:()=> 'originalReasoned'}]){
      const invalid=structuredClone(original);invalid.caseQualification.openingOrigin=forged;blocked(invalid,'administrative.openingOriginNotQualified');
    }
    const stale=structuredClone(original);stale.caseQualification.priorReasonsRequest='timelyEstablished';blocked(stale,'administrative.inputContractInvalid');
  }
});

test('AP23G3 UR Article22 is an opening warning, never a pause, delayed trigger or traversed-date warning',()=>{
  for(const id of['ur-admin-20','ur-court-20'])for(const[date,hasWarning]of[
    ['2027-03-19',false],['2027-03-20',true],['2027-04-05',true],['2027-04-06',false],
    ['2026-12-17',false],['2026-12-18',true],['2027-01-06',true],['2027-01-07',false]
  ]as const){
    const r=calculateAdministrativeDeadline(input(id,date),context);assert.equal(r.outcome,'calculated',id+date);
    if(r.outcome==='calculated'){assert.equal(r.warningKeys?.includes('administrative.urArt22OpeningRestriction'),hasWarning);assert.equal(r.ordinaryStart,new Date(Date.parse(date+'T00:00:00Z')+86400000).toISOString().slice(0,10));}
  }
  const administration=calculateAdministrativeDeadline(input('ur-admin-20','2026-12-23'),context);
  assert.equal(administration.outcome,'calculated');if(administration.outcome==='calculated'){
    assert.equal(administration.skippedCalendarDays,0);assert.equal(administration.finalEnd,'2027-01-12');
  }
  for(const id of['ur-admin-ordered','ur-court-ordered','ur-admin-reasons-10']){
    const r=calculateAdministrativeDeadline(input(id,'2026-12-23',10),context);assert.equal(r.outcome,'calculated');
    if(r.outcome==='calculated')assert.deepEqual(r.warningKeys,[]);
  }
});

test('AP23G3 authority role, local effect, coordination and SH same court do not silently generalize',()=>{
  for(const id of['ur-admin-20','ur-court-20']){const v:any=input(id);v.caseQualification.coordinatedDecision=true;blocked(v,'administrative.urCoordinatedPeriodUnresolved');}
  for(const id of['ur-admin-ordered','ur-court-ordered','ur-admin-reasons-10'])assert.equal('coordinatedDecision'in (input(id,'2026-10-02',10).caseQualification as any),false);
  for(const p of catalog.paths.filter(p=>p.pathId.startsWith('ur-'))){const v:any=input(p.pathId,'2026-10-02',p.duration.kind==='authorityOrderedDays'?10:undefined);
    for(const effect of['concretePotentialEndChangeUnresolved','unknown']){v.caseQualification.localHolidayEffect=effect;blocked(v,'administrative.urLocalHolidayEffectUnresolved');}}
  const sh:any=input('sh-court-reasons-30');sh.caseQualification.sameIssuingCourt=false;blocked(sh,'administrative.courtReasonsWrongRecipient');
  const wrong:any=input('sh-court-reasons-30');wrong.caseQualification.targetCourt='lowerSpecialAdministrativeCourt';blocked(wrong,'administrative.targetCourtNotQualified');
  for(const p of catalog.paths.filter(p=>p.pathId.startsWith('sh-'))){const v:any=input(p.pathId,'2026-10-02',p.duration.kind==='authorityOrderedDays'?10:undefined);
    v.caseQualification.shortenedRekurs=true;blocked(v,'administrative.shShortenedRekursUnresolved');}
});

test('AP23G3 SH provenance uses independent administrative law and practice, not generator OGE authority',()=>{
  for(const id of['sh-admin-20','sh-admin-ordered','sh-admin-reasons-10']){
    const r=calculateAdministrativeDeadline(input(id,'2026-12-23',id.endsWith('ordered')?10:undefined),context);assert.equal(r.outcome,'calculated');if(r.outcome!=='calculated')continue;
    const ids=r.provenance.sourceRefs.map(s=>s.sourceId);assert.ok(ids.includes('JUD-AP23G1-SH-BGER-2C4832025-20260312'));
    assert.equal(ids.includes('JUD-AP23G1-SH-OGE-4020181K-20180824'),false);assert.equal(ids.includes('SRC-AP23G1-CH-ZPO-20260701'),false);
    assert.equal(r.provenance.holidayRole,id.endsWith('reasons-10')?'issuingAuthoritySeat':'targetAuthoritySeat');
  }
  const court=calculateAdministrativeDeadline(input('sh-court-20'),context);assert.equal(court.outcome,'calculated');if(court.outcome==='calculated'){
    assert.equal(court.provenance.holidayRole,'courtSeat');assert.ok(court.provenance.sourceRefs.some(r=>r.sourceId==='JUD-AP23G1-SH-OGE-4020181K-20180824'));
  }
});

test('AP23G3 preserves all42 previous native10 paths and their input semantics',()=>{
  const base='data/candidates/2026-10-22-ap23f3/',text=readFileSync(base+'manifest.json','utf8'),m=JSON.parse(text);
  const old=parseFormat10LocalReferenceData(text,new Map(m.artifacts.map((d:any)=>[d.path,readFileSync(base+d.path,'utf8')])));
  for(const p of old.administrativeCatalog.paths){assert.deepEqual(catalog.paths.find(x=>x.pathId===p.pathId),p);
    for(const date of['2026-10-02','2026-12-17','2027-03-18','2027-07-20'])for(const stage of p.stages){
      const v=administrativeInput10(old.administrativeCatalog,p.pathId,date,p.duration.kind==='authorityOrderedDays'?10:undefined,stage);
      const semantic=(r:any)=>{const{provenance,referenceOnly,calendarExportAllowed,...rest}=r;return rest;};
      assert.deepEqual(semantic(calculateAdministrativeDeadline(v,context)),semantic(calculateAdministrativeDeadline(v,old)),p.pathId+date+stage);
    }
  }
});

test('AP23G3 own immutable native11 capabilities cannot be copied or downgraded',()=>{
  assertTrustedFormat11Data(context);assert.equal(getVerifiedAdministrativeDataV3(context),undefined);
  for(const fake of[undefined,null,{}, {...context},JSON.parse(JSON.stringify(context)),Object.create(context),new Proxy(context,{})]){
    assert.equal(getVerifiedAdministrativeDataV4(fake),undefined);assert.throws(()=>assertTrustedFormat11Data(fake));
    for(const p of catalog.paths)blocked(input(p.pathId,'2026-10-02',p.duration.kind==='authorityOrderedDays'?10:undefined),undefined,fake);
  }
  assert.throws(()=>{(catalog.paths as any).pop();},TypeError);assert.equal(typeof(context.artifacts as any).set,'undefined');
  assert.throws(()=>assertAdministrativeProcedureCatalogV3(catalog));assert.throws(()=>parseFormat10LocalReferenceData(encode11(fixture.manifest),fixture.files));
  assert.throws(()=>parseFormat10Data(encode11(fixture.manifest),fixture.files));
});

test('AP23G3 candidates cannot promote themselves, synthetic approved shapes remain in test memory only',()=>{
  assert.throws(()=>parseFormat11Data(encode11(fixture.manifest),fixture.files));
  const approved=buildSyntheticFormat11('approved'),native=parseFormat11Data(encode11(approved.manifest),approved.files);
  assert.throws(()=>parseFormat11LocalReferenceData(encode11(approved.manifest),approved.files));
  const r=calculateAdministrativeDeadline(input('sh-court-reasons-30'),native);assert.equal(r.outcome,'calculated');assert.equal(r.calendarExportAllowed,true);
  assert.equal(catalog.releaseBinding.status,'candidate');assert.equal(catalog.releaseBinding.approval,null);
});

const path=(c:any,id:string)=>c.paths.find((p:any)=>p.pathId===id),policy=(c:any,id:string)=>c.qualificationPolicies.find((p:any)=>p.pathId===id).requirements;
for(const[name,edit]of[
  ['opening chain removed',(c:any)=>{policy(c,'ur-admin-20').openingChainPolicy='notApplicable';}],
  ['SO express reasons offer removed',(c:any)=>{policy(c,'so-admin-reasons-10').opening='lawfullyUnreasonedAdministrativeDecision';}],
  ['SH same court removed',(c:any)=>{policy(c,'sh-court-reasons-30').requiredSameIssuingCourt=false;}],
  ['SH reasons duration swapped',(c:any)=>{path(c,'sh-court-reasons-30').duration.value=10;}],
  ['UR warning missing',(c:any)=>{path(c,'ur-admin-20').openingWarnings=[];}],
  ['UR warning wrong Easter',(c:any)=>{path(c,'ur-admin-20').openingWarnings[0].periods[0].start.days=-7;}],
  ['UR warning as suspension',(c:any)=>{path(c,'ur-admin-20').suspensionProfileId='ur-three';}],
  ['UR local effect removed',(c:any)=>{policy(c,'ur-admin-ordered').localHolidayPolicy='notApplicable';}],
  ['UR coordination widened',(c:any)=>{policy(c,'ur-admin-ordered').coordinationPolicy='excludeCoordinatedAppeal';}],
  ['SH shortened48h admitted',(c:any)=>{policy(c,'sh-admin-20').shorteningPolicy='notApplicable';}],
  ['new collision guard removed',(c:any)=>{path(c,'so-court-10').endShiftGuard='none';}],
  ['new norm gap',(c:any)=>{path(c,'sh-admin-20').normTimeline[0].interval.to='2026-12-31';}],
  ['new path pinpoint',(c:any)=>{path(c,'sh-admin-20').sourceRefs[0].locator='Art. 999';}],
  ['SH administration fake source URL',(c:any)=>{c.sources.find((s:any)=>s.sourceId==='JUD-AP23G1-SH-BGER-2C4832025-20260312').url='https://example.org/fake';}],
  ['SH administrative OGE substitute',(c:any)=>{c.holidayBindings.find((b:any)=>b.holidayBindingId==='sh-administration-seat').legalBinding.sourceRefs.at(-1).sourceId='JUD-AP23G1-SH-OGE-4020181K-20180824';}],
  ['SH January practice omitted',(c:any)=>{c.holidayBindings.find((b:any)=>b.holidayBindingId==='sh-administration-seat').practiceAddition=null;}],
  ['SH court authority anchor',(c:any)=>{c.holidayBindings.find((b:any)=>b.holidayBindingId==='sh-court-seat').anchor='authoritySeat';}],
  ['SH practice becomes dispositive',(c:any)=>{c.holidayBindings.find((b:any)=>b.holidayBindingId==='sh-administration-seat').practiceAddition.evidenceLimit='dispositive';}],
  ['physical source provenance relabelled',(c:any)=>{c.holidayBindings.find((b:any)=>b.holidayBindingId==='sh-administration-seat').physicalReuse.sourceReleaseId=fixture.manifest.releaseId;}],
  ['physical rule selection dropped',(c:any)=>{c.holidayBindings.find((b:any)=>b.holidayBindingId==='sh-administration-seat').physicalReuse.selectedRuleIds.pop();}],
  ['old path duration changed',(c:any)=>{path(c,'zh-rekurs-30').duration.value=31;}],
  ['new frozen exception erased',(c:any)=>{c.excludedPaths.at(-1).reason='No limit';}],
  ['stale actual release',(c:any)=>{c.holidayBindings.at(-1).physicalBaseline.releaseId='2026-10-22-ap23f3-candidate.1';}],
  ['stale actual hash',(c:any)=>{c.holidayBindings.at(-1).physicalBaseline.references[0].sha256='0'.repeat(64);}],
  ['candidate approval flag',(c:any)=>{c.releaseBinding.status='approved';c.releaseBinding.releaseId=fixture.manifest.releaseId;}],
]as const)test('AP23G3 resealed semantic mutation rejected: '+name,()=>{
  const altered=buildSyntheticFormat11();changeSyntheticFormat11(altered,AP23G3_ADMIN,c=>{edit(c);resealAdministrative11(c);});
  assert.throws(()=>parseFormat11LocalReferenceData(encode11(altered.manifest),altered.files));
});

test('AP23G3 review refresh is not a changed norm identity or source-release approval',()=>{
  const altered=buildSyntheticFormat11();changeSyntheticFormat11(altered,AP23G3_ADMIN,c=>{
    const s=c.sources.find((s:any)=>s.sourceId==='JUD-AP23G1-SH-BGER-2C4832025-20260312');s.reviewedOn='2026-10-21';s.reviewBasis='SYNTHETIC REFRESH, NO LEGAL PERMISSION';
  });
  const reviewed=parseFormat11LocalReferenceData(encode11(altered.manifest),altered.files);assert.equal(reviewed.mode,'localReference');
  assert.equal(reviewed.administrativeCatalog.releaseBinding.status,'candidate');
});

test('AP23G3 provider boundary, calculation scope and preserved legacy gates use native11 identity',()=>{
  const runtime=createFormat11CalculationData(encode11(fixture.manifest),fixture.files,{mode:'localReference'});
  assert.equal(runtime.data.formatVersion,'11.0.0');assert.equal(trustedFormat11Runtime(runtime.data),runtime.calendarRuntime);
  assert.equal(hasMatchingFormat11Runtime(runtime.data,runtime.calendarRuntime,runtime.administrativeContext),true);
  assert.equal(hasMatchingFormat11Runtime({...runtime.data},runtime.calendarRuntime,runtime.administrativeContext),false);
  const bytes=new TextEncoder().encode(encode11(fixture.manifest));
  const transport:any={releaseId:fixture.manifest.releaseId,formatVersion:'11.0.0',coverageFrom:fixture.manifest.coverage.from,coverageTo:fixture.manifest.coverage.to,
    manifestBytes:bytes,manifestSha256:rawHash(encode11(fixture.manifest)),profileIds:fixture.manifest.profileIds,calendarIds:fixture.manifest.calendarIds,
    specialRegimeCatalogIds:fixture.manifest.specialRegimeCatalogIds,holidayCatalogIds:fixture.manifest.holidayCatalogIds,socialProcedureCatalogIds:fixture.manifest.socialProcedureCatalogIds,
    administrativeProcedureCatalogIds:fixture.manifest.administrativeProcedureCatalogIds,artifacts:fixture.manifest.artifacts.map((d:any)=>({descriptor:d,bytes:new TextEncoder().encode(fixture.files.get(d.path)!)}))};
  const transported=createCalculatorRuntime(transport,{mode:'localReference'});assert.equal(transported.data.formatVersion,'11.0.0');
  assert.throws(()=>createCalculatorRuntime({...transport,manifestBytes:undefined},{mode:'localReference'}));
  assert.throws(()=>createCalculatorRuntime({...transport,manifestSha256:'0'.repeat(64)},{mode:'localReference'}));
  assert.throws(()=>createCalculatorRuntime({...transport,profileIds:[]},{mode:'localReference'}));
  const legacy:any={profileId:'stpo',calendarId:'ap22-ur-67275ff3e872',inputDate:'2026-10-02',deadlineDays:10,
    inputDateSemantics:'legallyRelevantDeliveryOrEventDate',selectors:{},confirmations:{},holidayAnchorCandidates:['UR']};
  assert.equal(calculateDeadline(legacy,runtime.data).outcome,'blocked');assert.equal(calculateRuntimeDeadline(legacy,{...runtime.data}).outcome,'blocked');
  const bound=calculateCalendarBoundDeadline(legacy,{role:'partyWithoutRepresentative',canton:'UR',areaFacts:{}},runtime.data,runtime.calendarRuntime);
  assert.equal(bound.outcome,'calculated',JSON.stringify(bound));assert.equal(bound.calendarExportAllowed,false);
  const forged=calculateCalendarBoundDeadline(legacy,{role:'partyWithoutRepresentative',canton:'UR',areaFacts:{}},{...runtime.data},runtime.calendarRuntime);
  assert.equal(forged.outcome,'blocked');
  const social=resolveSocialDeadline({}as any,{...runtime.data});assert.equal(social.outcome,'blocked');
  const special=calculateSpecialDeadline({profileId:'vrpg-be',ruleId:'ATSG-SPEC-REL-060',dateValues:{}}as any,runtime.data);assert.equal(special.outcome,'blocked');
  assert.equal(canonicalSocialJson(runtime.data.releaseArtifactRefs),canonicalSocialJson(fixture.manifest.artifacts.map(({role,contentId,sha256}:any)=>({role,contentId,sha256}))));
});

// Keep the provider probe synchronous without depending on a builder as oracle.
function rawHash(text:string):string{return createHash('sha256').update(text).digest('hex');}
