// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ap23m3CandidateRuntime as runtime} from '../../src/release/ap23m3CandidateData';
import {createFormat17CalculationData} from '../../src/core/format17CalculationData';
import {createFormat16CalculationData} from '../../src/core/format16CalculationData';
import {assertAdministrativeProcedureCatalogV10} from '../../src/core/administrativeCatalogV10';
import {hasMatchingFormat17Runtime} from '../../src/core/format17Runtime';
import {AP23M3_ADMIN,AP23M3_BASE,buildSyntheticFormat17,changeSyntheticFormat17,resealSyntheticFormat17,encode17,sha17} from './ap23m3Fixtures';
const read=(path:string):string=>readFileSync(new URL('../../'+path,import.meta.url),'utf8');
const old=JSON.parse(read('outputs/ap23m2-candidate-2026-10-28/bundle/'+AP23M3_ADMIN));
test('AP23M3 actual44 payloads and all245 accepted semantic objects are bound',()=>{
 const f=buildSyntheticFormat17(),c=JSON.parse(f.files.get(AP23M3_ADMIN)!);assert.equal(f.manifest.formatVersion,'17.0.0');assert.equal(f.manifest.compatibility.minimumConsumerFormatVersion,'17.0.0');assert.equal(f.files.size,44);
 for(const d of f.manifest.artifacts){const raw=f.files.get(d.path)!;assert.equal(sha17(raw),d.sha256);assert.equal(Buffer.byteLength(raw),d.byteLength);}
 for(const group of['paths','qualificationPolicies','laws','sources','suspensionProfiles','excludedPaths','preserved'])assert.deepEqual(c[group],old[group],group);
 assert.equal(c.paths.length,245);assert.equal(c.holidayBindings.length,36);assert.equal(c.laws.length,25);assert.equal(c.suspensionProfiles.length,46);assert.equal(c.sources.length,148);
 let unchanged=0;for(const[path,raw]of f.files)if(raw===read('outputs/ap23m2-candidate-2026-10-28/bundle/'+path))unchanged++;assert.equal(unchanged,42);
 assert.equal(c.contractDecision.status,'approved');assert.equal(c.releaseBinding.status,'candidate');assert.equal(c.releaseBinding.approval,null);assert.equal(c.runtimeActive,false);
 assert.equal(f.manifest.extensions['steimer.local-reference'].sourceReleaseApproved,false);assert.equal(f.manifest.extensions['steimer.local-reference'].productionActivation,false);
});
const path=(c:any,id:string)=>c.paths.find((p:any)=>p.pathId===id),binding=(c:any,id:string)=>c.holidayBindings.find((b:any)=>b.holidayBindingId===id);
for(const[id,edit]of[
 ['tracking-requirement-removed',(c:any)=>path(c,'ai-admin-ordered').openingPolicy.trackingRequirements.shift()],
 ['qualified-opening-transformed',(c:any)=>path(c,'ai-admin-ordered').openingPolicy.qualifiedTransformation='nextWorkingDayIfNonWorkingReceipt'],
 ['oral-opening-tracking',(c:any)=>path(c,'ai-admin-written-7').openingPolicy=structuredClone(path(c,'ai-admin-ordered').openingPolicy)],
 ['knowledge-opening-tracking',(c:any)=>path(c,'ai-internal-denial-30').openingPolicy=structuredClone(path(c,'ai-admin-ordered').openingPolicy)],
 ['longer-notice-saved-instead-of-current',(c:any)=>path(c,'ai-internal-notice-long').duration.valueFact='savedDays'],
 ['longer-notice-15',(c:any)=>path(c,'ai-internal-notice-long').duration.minimum=15],
 ['automatic-sz-ten-days',(c:any)=>path(c,'sz-admin-provisional-opposition').duration={kind:'statutoryDays',value:10,overridable:false}],
 ['sz-eleven-days',(c:any)=>path(c,'sz-admin-provisional-opposition').duration.maximum=11],
 ['martinstag-removed',(c:any)=>binding(c,'sz-qualified-authority-seat').proceduralCalendarSupplement.dates.pop()],
 ['martinstag-outside-window',(c:any)=>binding(c,'sz-qualified-authority-seat').proceduralCalendarSupplement.dates.push('2028-11-11')],
 ['martinstag-suspension',(c:any)=>binding(c,'sz-qualified-authority-seat').proceduralCalendarSupplement.effect='suspension'],
 ['martinstag-for-ai',(c:any)=>binding(c,'ai-qualified-authority-seat').proceduralCalendarSupplement=structuredClone(binding(c,'sz-qualified-authority-seat').proceduralCalendarSupplement)],
 ['unqualified-sz-seat',(c:any)=>c.qualificationPolicies.find((q:any)=>q.pathId==='sz-admin-ordered').requirements=c.qualificationPolicies.find((q:any)=>q.pathId==='sz-admin-ordered').requirements.filter((r:any)=>r.key!=='authorityMunicipality')],
 ['sz-winter-shortened',(c:any)=>c.suspensionProfiles.find((p:any)=>p.suspensionProfileId==='sz-three').periods.at(-1).end.day=2],
 ['ai-collision-guard-removed',(c:any)=>path(c,'ai-court-ordered').endShiftGuard='none'],
 ['sz-norm-gap',(c:any)=>path(c,'sz-court-ordered').normTimeline[0].interval.to='2027-06-29'],
 ['sz-norm-overlap',(c:any)=>path(c,'sz-court-ordered').normTimeline[1].interval.from='2027-06-30'],
 ['changed-old-path',(c:any)=>c.paths[0].revision++],
 ['changed-new-source',(c:any)=>c.sources.at(-1).versionDescription='other source'],
 ['wider-window',(c:any)=>path(c,'sz-court-ordered').temporalBinding.calculationCoverage.to='2028-12-31'],
]as const)test('AP23M3 native semantic pin rejects resealed '+id,()=>{const f=buildSyntheticFormat17(),c=JSON.parse(f.files.get(AP23M3_ADMIN)!);edit(c);f.files.set(AP23M3_ADMIN,encode17(c));resealSyntheticFormat17(f);assert.throws(()=>createFormat17CalculationData(encode17(f.manifest),f.files));});
test('AP23M3 approved-shaped byte reader rejects stale physical and social references',()=>{
 for(const target of['physical','social']){const f=buildSyntheticFormat17('approved');
  if(target==='physical')changeSyntheticFormat17(f,AP23M3_ADMIN,c=>{c.holidayBindings.at(-1).physicalSource.references[0].sha256='f'.repeat(64);});
  else changeSyntheticFormat17(f,'social-procedures/ch-social-procedures.json',s=>{s.releaseEligibility[0].releaseId='unrelated-release';});
  assert.throws(()=>createFormat17CalculationData(encode17(f.manifest),f.files));
 }
});
test('AP23M3 byte integrity cannot be bypassed by forged payload iteration',()=>{
 for(const method of['entries','keys','get']){const f=buildSyntheticFormat17();let invoked=false;Object.defineProperty(f.files,method,{value:()=>{invoked=true;return'forged';}});assert.throws(()=>createFormat17CalculationData(encode17(f.manifest),f.files));assert.equal(invoked,false);}
 class ForeignMap extends Map<string,string>{}const f=buildSyntheticFormat17();assert.throws(()=>createFormat17CalculationData(encode17(f.manifest),new ForeignMap(f.files)));
 const x=buildSyntheticFormat17();x.files.set('calendars/ap22-ai-f507435d8aa8.json',x.files.get('calendars/ap22-ai-f507435d8aa8.json')!+' ');assert.throws(()=>createFormat17CalculationData(encode17(x.manifest),x.files));
});
test('AP23M3 old reader rejects new format and all attempted downgrades',()=>{
 for(const version of['17.0.0','16.0.0']){const f=buildSyntheticFormat17();if(version==='16.0.0'){f.manifest.formatVersion=version;f.manifest.$schema=f.manifest.$schema.replace('ap23m3','ap23l3').replace('v17','v16');f.manifest.compatibility.minimumConsumerFormatVersion='16.0.0';}assert.throws(()=>createFormat16CalculationData(encode17(f.manifest),f.files,{mode:'localReference'}));}
});
test('AP23M3 in-memory capability is identity-bound and deeply immutable',()=>{
 assert.ok(hasMatchingFormat17Runtime(runtime.data,runtime.calendarRuntime,runtime.administrativeContext));
 assert.equal(hasMatchingFormat17Runtime({...runtime.data},runtime.calendarRuntime,runtime.administrativeContext),false);
 assert.equal(hasMatchingFormat17Runtime(runtime.data,{...runtime.calendarRuntime},runtime.administrativeContext),false);
 assert.equal(hasMatchingFormat17Runtime(runtime.data,runtime.calendarRuntime,{...runtime.administrativeContext}),false);
 assert.equal('set'in runtime.administrativeContext.artifacts,false);assert.ok(Object.isFrozen(runtime.administrativeContext.administrativeCatalog.paths));
 assert.throws(()=>{(runtime.administrativeContext.administrativeCatalog.paths as any).pop();});
});
test('AP23M3 catalog rejects accessor trees without invocation and false DEC status',()=>{
 const f=buildSyntheticFormat17(),c=JSON.parse(f.files.get(AP23M3_ADMIN)!);let invoked=false;Object.defineProperty(c,'paths',{enumerable:true,get(){invoked=true;return[];}});assert.throws(()=>assertAdministrativeProcedureCatalogV10(c));assert.equal(invoked,false);
 const d=JSON.parse(f.files.get(AP23M3_ADMIN)!);d.contractDecision.status='proposed';assert.throws(()=>assertAdministrativeProcedureCatalogV10(d));
 assert.ok(read(AP23M3_BASE+'manifest.json').includes('candidate'));
});
for(const[id,edit]of[
 ['postal-permission-policy-removed',(c:any)=>path(c,'vd-admin-ordered').openingPolicy.trackingRequirements.shift()],
 ['postal-ai-extra-condition',(c:any)=>path(c,'vd-admin-ordered').openingPolicy.trackingRequirements.push({key:'expectedService',value:true,reason:'AI-B-OPENING',explanation:'not VD'})],
 ['qualified-opening-transformed-again',(c:any)=>path(c,'vd-admin-ordered').openingPolicy.qualifiedTransformation='nextWorkingDayIfNonWorkingReceipt'],
 ['ne-gains-raw-postal-transform',(c:any)=>path(c,'ne-admin-ordered').openingPolicy=structuredClone(path(c,'vd-admin-ordered').openingPolicy)],
 ['vs-oral-gains-raw-postal-transform',(c:any)=>path(c,'vs-admin-written-5').openingPolicy=structuredClone(path(c,'vd-admin-ordered').openingPolicy)],
 ['vs-long-ai-thirty-one',(c:any)=>path(c,'vs-admin-notice-long').duration.minimum=31],
 ['vs-long-unbound-current-fact',(c:any)=>path(c,'vs-admin-notice-long').duration.valueFact='savedDays'],
 ['ne-region-default',(c:any)=>binding(c,'ne-admin-qualified-authority-seat').calendarSelection.defaultAllowed=true],
 ['ne-region-swapped',(c:any)=>binding(c,'ne-admin-qualified-authority-seat').calendarSelection.cases.reverse()],
 ['ne-role-party-not-authority',(c:any)=>binding(c,'ne-admin-qualified-authority-seat').anchor='qualifiedPartyOrRepresentativeCanton'],
 ['ne-court-le-landeron',(c:any)=>binding(c,'ne-court-qualified-authority-seat').calendarSelection.calendarId='ap22-ne-21f519039621'],
 ['ne-no-administrative-recess',(c:any)=>c.suspensionProfiles.find((p:any)=>p.suspensionProfileId==='ne-three').periods=[]],
 ['vd-provisional-gets-recess',(c:any)=>path(c,'vd-court-provisional-ordered').suspensionSelection.suspensionProfileId='vd-three'],
 ['vs-winter-shortened',(c:any)=>c.suspensionProfiles.find((p:any)=>p.suspensionProfileId==='vs-three').periods.at(-1).end.day=2],
 ['vs-trigger-unqualified',(c:any)=>c.qualificationPolicies.find((p:any)=>p.pathId==='vs-admin-appeal-30').requirements=c.qualificationPolicies.find((p:any)=>p.pathId==='vs-admin-appeal-30').requirements.filter((r:any)=>r.key!=='triggerQualification')],
 ['grace-prior-expiry-removed',(c:any)=>c.qualificationPolicies.find((p:any)=>p.pathId==='ne-admin-extension-refusal-3').requirements=c.qualificationPolicies.find((p:any)=>p.pathId==='ne-admin-extension-refusal-3').requirements.filter((r:any)=>r.key!=='refusalTiming')],
 ['new-recess-collision-ignored',(c:any)=>path(c,'ne-admin-ordered').endShiftGuard='none'],
 ['norm-window-gap',(c:any)=>path(c,'ne-admin-ordered').normTimeline[0].interval.from='2026-08-30'],
 ['contract-decision-forged',(c:any)=>c.contractDecision.on='2026-10-29'],
 ['release-forged',(c:any)=>c.releaseBinding.status='approved'],
 ['export-forged',(c:any)=>path(c,'ne-admin-ordered').calendarExportAllowed=true],
 ['old-path-modified-again',(c:any)=>c.paths[0].duration.value++],
]as const)test('AP23M3 V10 closed native contract rejects resealed '+id,()=>{
 const f=buildSyntheticFormat17(),c=JSON.parse(f.files.get(AP23M3_ADMIN)!);edit(c);f.files.set(AP23M3_ADMIN,encode17(c));resealSyntheticFormat17(f);
 assert.throws(()=>createFormat17CalculationData(encode17(f.manifest),f.files));
});
test('AP23M3 physical calendar mutation cannot hide behind fresh descriptor hashes',()=>{
 const f=buildSyntheticFormat17();changeSyntheticFormat17(f,'calendars/ap22-ne-027ceadbf103.json',(c:any)=>c.rules[0].ruleId='forged');
 assert.throws(()=>createFormat17CalculationData(encode17(f.manifest),f.files));
});
test('AP23M3 direct catalog rejects hidden descriptors symbols arrayholes and accessors before reading them',()=>{
 const fresh=()=>JSON.parse(buildSyntheticFormat17().files.get(AP23M3_ADMIN)!);let invoked=false;
 for(const key of['paths','hiddenUnknown']){const c=fresh();Object.defineProperty(c,key,{enumerable:false,value:c[key]??true});assert.throws(()=>assertAdministrativeProcedureCatalogV10(c));}
 const symbol=fresh();symbol[Symbol('unknown')]=true;assert.throws(()=>assertAdministrativeProcedureCatalogV10(symbol));
 const hole=fresh();delete hole.paths[0];assert.throws(()=>assertAdministrativeProcedureCatalogV10(hole));
 const accessor=fresh();Object.defineProperty(accessor.paths,'0',{enumerable:true,get(){invoked=true;return{};}});assert.throws(()=>assertAdministrativeProcedureCatalogV10(accessor));
 const extra=fresh();Object.defineProperty(extra.paths,'hidden',{enumerable:false,value:true});assert.throws(()=>assertAdministrativeProcedureCatalogV10(extra));
 assert.equal(invoked,false);
});

