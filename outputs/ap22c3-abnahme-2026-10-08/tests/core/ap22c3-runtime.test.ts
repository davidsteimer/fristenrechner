// SPDX-License-Identifier: AGPL-3.0-only
// Explicitly synthetic approvals exist only in this in-memory test transport.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createCalculatorRuntime, createFormat7CalculationData, sameFormat7SourceIdentity } from '../../src/core/calculatorRuntime';
import { calculateCalendarBoundDeadline } from '../../src/core/calculateCalendarBoundDeadline';
import { calculateDeadline } from '../../src/core/calculateDeadline';
import { calculateSocialDeadline } from '../../src/core/socialDeadline';
import { calculateSpecialDeadline } from '../../src/core/calculateSpecialDeadline';
import { projectActivatedCalendars } from '../../src/core/holidayActivation';
import { rebindSocialCalendarCandidate } from '../../src/core/calendarMigration';
import { FORMAT7_LEGACY_CALENDAR_BASELINE } from '../../src/core/format7Baseline';
import { mvp06CalculationData, mvp06Release } from '../../src/release/mvp06ReleaseData';
import type { CalculationData, CalculationInput } from '../../src/core/types';
import type { SocialDeadlineInput } from '../../src/core/socialTypes';

const base = 'data/releases/2026-10-01-mvp-06-approved.1/';
const prefix = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
const read = (path: string): any => JSON.parse(readFileSync(path, 'utf8'));
const encode = (value: unknown): string => JSON.stringify(value, null, 2) + '\n';
const sha = (value: string): string => createHash('sha256').update(value).digest('hex');
function fixture(approved = false) {
  const manifest = read(base + 'manifest.json');
  const releaseId = approved ? '2026-10-08-synthetic-approved.1' : '2026-10-08-synthetic-reference.1';
  const catalog = read('tests/golden/candidates/ap22b-holiday-contract.json');
  catalog.activation.contractDecision = { id: 'DEC-2026-030', status: 'approved', on: '2026-10-08' };
  if (approved) catalog.activation.releaseEligibility = { status: 'approved', releaseId,
    approval: { on: '2026-10-08', by: 'SYNTHETIC TEST ONLY', evidence: 'TEST-NOT-A-RELEASE' } };
  const files = new Map<string, string>();
  files.set('holiday-catalogs/ch-holiday-catalog.json', encode(catalog));
  const calendars = projectActivatedCalendars(catalog, sha(encode(catalog)), FORMAT7_LEGACY_CALENDAR_BASELINE);
  for (const calendar of calendars) files.set(`calendars/${calendar.calendarId}.json`, encode(calendar));
  for (const artifact of manifest.artifacts) if (['legalProfile','specialRegimeCatalog'].includes(artifact.role)) files.set(artifact.path, readFileSync(base + artifact.path, 'utf8'));
  const refs = ['ch-federal-calendar','be-public-holidays'].map(id => ({role:'calendar' as const,contentId:id,sha256:sha(files.get(`calendars/${id}.json`)!)}));
  const social: any = rebindSocialCalendarCandidate(read(base + 'social-procedures/ch-social-procedures.json'), releaseId,
    [...refs,{role:'holidayCatalog',contentId:'ch-holiday-catalog',sha256:sha(encode(catalog))}]);
  if (approved) for (const entry of social.releaseEligibility) { entry.status='approved'; entry.approval={approvedBy:'SYNTHETIC TEST ONLY',approvedOn:'2026-10-08',decisionRef:'TEST-NOT-A-RELEASE'}; }
  files.set('social-procedures/ch-social-procedures.json',encode(social));
  const schemas:Record<string,string>={legalProfile:'legal-profile',calendar:'calendar-rules-v3',specialRegimeCatalog:'special-regime-catalog-v3',holidayCatalog:'holiday-catalog-v2',socialProcedureCatalog:'social-procedure-catalog-v2'};
  manifest.$schema=prefix+(approved?'release-manifest-v7':'local-reference-manifest-v7')+'.schema.json';
  manifest.releaseId=releaseId; manifest.formatVersion='7.0.0';manifest.releaseStatus=approved?'approved':'candidate';
  manifest.compatibility.minimumConsumerFormatVersion='7.0.0';manifest.coverage={from:'2026-08-29',to:null};manifest.calendarIds=calendars.map(c=>c.calendarId);
  manifest.sourceSummary={latestReviewedOn:approved?'2026-10-08':null,legalBasisReviewStatus:approved?'verified':'pending',technicalValidationStatus:'passed',
    sourceIds:[...new Set([...files.values()].flatMap(text=>(JSON.parse(text).sources??[]).map((source:any)=>source.sourceId)))].sort()};
  manifest.artifacts=[...files].map(([path,text])=>{const d=JSON.parse(text),role=d.dataKind;return {path,role,contentId:role==='legalProfile'?d.profileId:role==='calendar'?d.calendarId:d.catalogId,mediaType:'application/json',schemaId:prefix+schemas[role]+'.schema.json',byteLength:Buffer.byteLength(text),sha256:sha(text)};});
  return {manifest,files};
}
const candidate=fixture(), approved=fixture(true);
const load=(f= candidate, reference=true)=>createFormat7CalculationData(encode(f.manifest),f.files,{mode:reference?'localReference':'approved'});
const c=load(), a=load(approved,false);
const input=(profile='stpo',inputDate='2026-09-16',deadlineDays=10):CalculationInput=>({profileId:profile,inputDate,inputDateSemantics:'legallyRelevantDeliveryOrEventDate',deadlineDays,calendarId:'be-public-holidays',holidayAnchorCandidates:['BE'],confirmations:{},selectors:profile==='zpo'?{procedureVariant:'summary'}:['bgg','vwvg'].includes(profile)?{subjectMatter:'interimMeasures'}:{}});
const context=(profile='stpo',canton='BE')=>({role:profile==='zpo'?'court' as const:'partyWithoutRepresentative' as const,canton,areaFacts:canton==='AI'?{'AI-RTG-INNER-ADDITIONAL':false}:canton==='NE'?{'NE-LANDERON-ADDITIONAL':false}:{}});
const calculate=(r=c, value=input(),place=context())=>calculateCalendarBoundDeadline(value,place,r.data,r.calendarRuntime);
function change(f:ReturnType<typeof fixture>,path:string,mutate:(v:any)=>void):void {const value=JSON.parse(f.files.get(path)!);mutate(value);const text=encode(value);f.files.set(path,text);const ref=f.manifest.artifacts.find((a:any)=>a.path===path);ref.sha256=sha(text);ref.byteLength=Buffer.byteLength(text);}
const clone=(f=candidate)=>({manifest:structuredClone(f.manifest),files:new Map(f.files)});

test('AP22C3 constructs genuine Format7 data with32 Format3 calendars without the Format6 reference adapter',()=>{
  assert.equal(c.data.formatVersion,'7.0.0');assert.equal(c.data.calendars.size,32);assert.equal(c.data.profiles.size,5);
  assert.ok([...c.data.calendarRuleSets.values()].every(v=>v.formatVersion==='3.0.0'));
  assert.equal(c.data.holidayCatalogs.get('ch-holiday-catalog')?.formatVersion,'2.0.0');
  assert.equal(calculate().outcome,'calculated');assert.equal(calculate().calendarExportAllowed,false);
  assert.equal(calculate(a).outcome,'calculated');assert.equal(calculate(a).calendarExportAllowed,true);
  assert.equal(calculate(a).referenceOnly,false);
});
test('AP22C3 all104 terminal bindings calculate on genuine Format7 data',()=>{
  for(const canton of 'ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' '))for(const profile of ['stpo','zpo','bgg','vwvg']){
    const result=calculate(c,input(profile),context(profile,canton));assert.equal(result.outcome,'calculated',`${profile}/${canton}: ${result.blockReasonKeys}`);assert.equal(result.calendarExportAllowed,false);
  }
});
test('AP22C3 candidate and approved schemas are mutually exclusive and mode is explicit',()=>{
  assert.throws(()=>createFormat7CalculationData(encode(candidate.manifest),candidate.files));
  assert.throws(()=>load(approved,true));assert.throws(()=>load(candidate,false));
  const f=clone();f.manifest.sourceSummary.legalBasisReviewStatus='verified';assert.throws(()=>load(f));
});
test('AP22C3 preserves exactly the two archived Bundesfeiertag review objects, not arbitrary same-ID conflicts',()=>{
  const inherited = JSON.parse(candidate.files.get('calendars/ch-federal-calendar.json')!).sources.find((s:any)=>s.sourceId==='SRC-BUNDESFEIERTAG-19940701');
  const local = JSON.parse(candidate.files.get('calendars/ap22-ai-5d4e5a68e106.json')!).sources.find((s:any)=>s.sourceId==='SRC-BUNDESFEIERTAG-19940701');
  assert.notDeepEqual(local,inherited);assert.equal(sameFormat7SourceIdentity(local,inherited),true);
  for(const patch of [{url:'https://example.invalid/changed'},{documentVersionDate:'1995-07-01'},{reviewStatus:'verified'},{unexpected:'metadata'}]) assert.equal(sameFormat7SourceIdentity({...local,...patch},inherited),false);
  assert.equal(sameFormat7SourceIdentity({...local,sourceId:'SRC-OTHER'},{...inherited,sourceId:'SRC-OTHER'}),false);
});
test('AP22C3 default core call cannot bypass role, region orJanuary qualification with a raw calendarId',()=>{
  for(const profile of ['stpo','zpo','bgg','vwvg']) assert.equal(calculateDeadline(input(profile),a.data).outcome,'blocked');
  const noCapability={...a.data,format7Runtime:undefined} as unknown as CalculationData;
  assert.equal(calculateDeadline(input('vrpg-be'),noCapability).outcome,'blocked');
  assert.equal(calculateCalendarBoundDeadline(input(),context(),a.data,{...a.calendarRuntime}).outcome,'blocked');
  const result=calculate(a,input('stpo','2029-01-01',1),context('stpo','SG'));
  assert.equal(result.outcome,'blocked');assert.equal(result.januaryComparison?.outcome,'different');assert.equal(result.calendarExportAllowed,false);
});
for(const [name,mutate]of[
  ['manifest alone',(f:any)=>{f.manifest.releaseStatus='candidate';}],
  ['one social permission',(f:any)=>change(f,'social-procedures/ch-social-procedures.json',v=>{v.releaseEligibility[0].status='candidate';v.releaseEligibility[0].approval=null;})],
  ['stale social component',(f:any)=>change(f,'social-procedures/ch-social-procedures.json',v=>{v.releaseEligibility[0].componentRefs[0].sha256='0'.repeat(64);})],
  ['changed calendar semantics',(f:any)=>change(f,'calendars/be-public-holidays.json',v=>{v.rules[0].calculation.day=2;})],
  ['missing source summary',(f:any)=>{f.manifest.sourceSummary.sourceIds=f.manifest.sourceSummary.sourceIds.slice(1);}],
  ['extended social window',(f:any)=>change(f,'social-procedures/ch-social-procedures.json',v=>{v.releaseEligibility[0].caseCoverage.to='2028-12-31';})]
]as const)test(`AP22C3 rejects resealed ${name}`,()=>{const f=clone(approved);mutate(f);assert.throws(()=>load(f,false));});
function socialInput(data:CalculationData,bindingId:string,date='2026-09-16'):SocialDeadlineInput{
  const catalog=data.socialProcedureCatalogs!.get('ch-social-procedures')!,binding=catalog.cantonalBindings.find(b=>b.bindingId===bindingId)!,rule=catalog.federalRules.find(r=>r.ruleId===binding.ruleId)!,route=binding.contextRoutes[0]!;
  const selectors=new Set([...rule.normBindings,...binding.normBindings].map(n=>n.temporalSelector));
  return {ruleId:rule.ruleId,bindingId,contextRouteId:route.contextRouteId,procedureContextCanton:'BE',caseFacts:Object.fromEntries(route.requiredFacts.map(f=>[f.factKey,f.allowedValues[0]])),qualificationBasis:'confirmed-case-facts',matter:rule.matter,triggerKind:rule.triggerKind,notificationChannel:rule.notificationChannels[0]!,notificationConfirmed:true,legalTriggerDate:date,
    ...(selectors.has('jurisdictionReferenceDate')?{jurisdictionReferenceDate:date}:{}),...(selectors.has('procedureStartDate')?{procedureStartDate:date}:{}),
    holidayResolution:{status:'resolved',calendarBindingId:'be-party',anchors:[{role:'party',canton:'BE',spatialScopeId:'BE'}]},...(rule.calculation.durationInputId?{days:10}:{})};
}
test('AP22C3 all50 unchanged Bern socialbindings remain calculable only inapproved or explicit localreference mode',()=>{
  const catalog=c.data.socialProcedureCatalogs!.get('ch-social-procedures')!;
  for(const binding of catalog.cantonalBindings){const v=socialInput(c.data,binding.bindingId);const result=calculateSocialDeadline(v,c.data);assert.equal(result.outcome,'calculated',`${binding.bindingId}: ${result.blockReasonKeys}`);
    const old=calculateSocialDeadline(v,mvp06CalculationData);assert.equal(result.finalDeadline?.date,old.finalDeadline?.date,binding.bindingId);
    assert.equal(calculateSocialDeadline(v,a.data).outcome,'calculated');
    assert.equal(calculateSocialDeadline({...v,procedureContextCanton:'ZH'},c.data).outcome,'blocked');
    assert.equal(calculateSocialDeadline(socialInput(c.data,binding.bindingId,'2028-01-02'),c.data).outcome,'blocked');
  }
  assert.ok(catalog.releaseEligibility.every(e=>e.status==='candidate'&&e.approval===null));
});
test('AP22C3 remaining VRPG arithmetic also requires the issued Format7 runtime',()=>{
  const catalog=c.data.specialRegimeCatalogs.get('vrpg-be-special-regimes-rest')!;
  const regime=catalog.regimes.find(r=>r.regimeId==='vrpg-be-general')!;
  const value={profileId:'vrpg-be',regimeId:regime.regimeId,ruleId:'VRPGBE-SPEC-REL-GENERAL-001',dateValues:{eventDate:'2026-09-04'},localTimeValues:{},integerValues:{deadlineDays:10},calendarProfileId:regime.calendarProfileId!,suspensionProfileId:regime.suspensionProfileId!,filingProfileId:regime.filingProfileId!,overrideConfirmations:[]};
  const result=calculateSpecialDeadline(value,c.data);assert.equal(result.outcome,'calculated',result.blockReasonKeys.join(','));assert.equal(result.finalDeadline?.date,'2026-09-14');
  const {format7Runtime:_,...withoutCapability}=c.data;
  assert.equal(calculateSpecialDeadline(value,withoutCapability).outcome,'blocked');
  assert.equal(calculateSpecialDeadline(value,{...c.data,format7Runtime:{...c.calendarRuntime}}).outcome,'blocked');
});
test('AP22C3 hostadapterrevalidates actualbytes and doesnottrust parsedcachemetadata',()=>{
  const manifestBytes=Buffer.from(encode(approved.manifest));
  const release={...mvp06Release,releaseId:approved.manifest.releaseId,formatVersion:'7.0.0',coverageFrom:approved.manifest.coverage.from,coverageTo:null,calendarIds:approved.manifest.calendarIds,manifestBytes,manifestSha256:sha(manifestBytes.toString()),artifacts:approved.manifest.artifacts.map((descriptor:any)=>({descriptor,bytes:Buffer.from(approved.files.get(descriptor.path)!),parsed:{untrusted:'ignored'}}))};
  assert.equal(createCalculatorRuntime(release).data.calendars.size,32);
  assert.throws(()=>createCalculatorRuntime({...release,manifestSha256:'0'.repeat(64)}));
  const bad={...release,artifacts:[...release.artifacts]};bad.artifacts[0]={...bad.artifacts[0],bytes:Buffer.from('{}')};assert.throws(()=>createCalculatorRuntime(bad));
  assert.equal(createCalculatorRuntime(mvp06Release).data.formatVersion,'6.0.0');
});
