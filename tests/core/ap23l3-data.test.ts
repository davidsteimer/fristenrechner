// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ap23l3CandidateRuntime as runtime} from '../../src/release/ap23l3CandidateData';
import {createFormat16CalculationData} from '../../src/core/format16CalculationData';
import {createFormat15CalculationData} from '../../src/core/format15CalculationData';
import {assertAdministrativeProcedureCatalogV9} from '../../src/core/administrativeCatalogV9';
import {hasMatchingFormat16Runtime} from '../../src/core/format16Runtime';
import {AP23L3_ADMIN,AP23L3_BASE,buildSyntheticFormat16,changeSyntheticFormat16,resealSyntheticFormat16,encode16,sha16} from './ap23l3Fixtures';
const read=(path:string):string=>readFileSync(new URL('../../'+path,import.meta.url),'utf8');
const old=JSON.parse(read('outputs/ap23l2-candidate-2026-10-27/bundle/'+AP23L3_ADMIN));
test('AP23L3 actual44 payloads and all196 accepted semantic objects are bound',()=>{
 const f=buildSyntheticFormat16(),c=JSON.parse(f.files.get(AP23L3_ADMIN)!);assert.equal(f.manifest.formatVersion,'16.0.0');assert.equal(f.manifest.compatibility.minimumConsumerFormatVersion,'16.0.0');assert.equal(f.files.size,44);
 for(const d of f.manifest.artifacts){const raw=f.files.get(d.path)!;assert.equal(sha16(raw),d.sha256);assert.equal(Buffer.byteLength(raw),d.byteLength);}
 for(const group of['paths','qualificationPolicies','laws','sources','suspensionProfiles','excludedPaths','preserved'])assert.deepEqual(c[group],old[group],group);
 assert.equal(c.paths.length,196);assert.equal(c.holidayBindings.length,32);assert.equal(c.laws.length,22);assert.equal(c.suspensionProfiles.length,41);assert.equal(c.sources.length,129);
 let unchanged=0;for(const[path,raw]of f.files)if(raw===read('outputs/ap23l2-candidate-2026-10-27/bundle/'+path))unchanged++;assert.equal(unchanged,42);
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
]as const)test('AP23L3 native semantic pin rejects resealed '+id,()=>{const f=buildSyntheticFormat16(),c=JSON.parse(f.files.get(AP23L3_ADMIN)!);edit(c);f.files.set(AP23L3_ADMIN,encode16(c));resealSyntheticFormat16(f);assert.throws(()=>createFormat16CalculationData(encode16(f.manifest),f.files));});
test('AP23L3 approved-shaped byte reader rejects stale physical and social references',()=>{
 for(const target of['physical','social']){const f=buildSyntheticFormat16('approved');
  if(target==='physical')changeSyntheticFormat16(f,AP23L3_ADMIN,c=>{c.holidayBindings.at(-1).physicalSource.references[0].sha256='f'.repeat(64);});
  else changeSyntheticFormat16(f,'social-procedures/ch-social-procedures.json',s=>{s.releaseEligibility[0].releaseId='unrelated-release';});
  assert.throws(()=>createFormat16CalculationData(encode16(f.manifest),f.files));
 }
});
test('AP23L3 byte integrity cannot be bypassed by forged payload iteration',()=>{
 for(const method of['entries','keys','get']){const f=buildSyntheticFormat16();let invoked=false;Object.defineProperty(f.files,method,{value:()=>{invoked=true;return'forged';}});assert.throws(()=>createFormat16CalculationData(encode16(f.manifest),f.files));assert.equal(invoked,false);}
 class ForeignMap extends Map<string,string>{}const f=buildSyntheticFormat16();assert.throws(()=>createFormat16CalculationData(encode16(f.manifest),new ForeignMap(f.files)));
 const x=buildSyntheticFormat16();x.files.set('calendars/ap22-ai-f507435d8aa8.json',x.files.get('calendars/ap22-ai-f507435d8aa8.json')!+' ');assert.throws(()=>createFormat16CalculationData(encode16(x.manifest),x.files));
});
test('AP23L3 old reader rejects new format and all attempted downgrades',()=>{
 for(const version of['16.0.0','15.0.0']){const f=buildSyntheticFormat16();if(version==='15.0.0'){f.manifest.formatVersion=version;f.manifest.$schema=f.manifest.$schema.replace('ap23l3','ap23k3').replace('v16','v15');f.manifest.compatibility.minimumConsumerFormatVersion='15.0.0';}assert.throws(()=>createFormat15CalculationData(encode16(f.manifest),f.files,{mode:'localReference'}));}
});
test('AP23L3 in-memory capability is identity-bound and deeply immutable',()=>{
 assert.ok(hasMatchingFormat16Runtime(runtime.data,runtime.calendarRuntime,runtime.administrativeContext));
 assert.equal(hasMatchingFormat16Runtime({...runtime.data},runtime.calendarRuntime,runtime.administrativeContext),false);
 assert.equal(hasMatchingFormat16Runtime(runtime.data,{...runtime.calendarRuntime},runtime.administrativeContext),false);
 assert.equal(hasMatchingFormat16Runtime(runtime.data,runtime.calendarRuntime,{...runtime.administrativeContext}),false);
 assert.equal('set'in runtime.administrativeContext.artifacts,false);assert.ok(Object.isFrozen(runtime.administrativeContext.administrativeCatalog.paths));
 assert.throws(()=>{(runtime.administrativeContext.administrativeCatalog.paths as any).pop();});
});
test('AP23L3 catalog rejects accessor trees without invocation and false DEC status',()=>{
 const f=buildSyntheticFormat16(),c=JSON.parse(f.files.get(AP23L3_ADMIN)!);let invoked=false;Object.defineProperty(c,'paths',{enumerable:true,get(){invoked=true;return[];}});assert.throws(()=>assertAdministrativeProcedureCatalogV9(c));assert.equal(invoked,false);
 const d=JSON.parse(f.files.get(AP23L3_ADMIN)!);d.contractDecision.status='proposed';assert.throws(()=>assertAdministrativeProcedureCatalogV9(d));
 assert.ok(read(AP23L3_BASE+'manifest.json').includes('candidate'));
});
