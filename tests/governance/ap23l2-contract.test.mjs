// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {ROOT,OUTPUT,ADMIN,buildL2Candidate,encode,sha} from '../../scripts/build-ap23l2-candidate.mjs';
import {evaluateL2,validateL2,researchInput,resealL2,calendarDates} from '../../scripts/check-ap23l2-contract.mjs';
const built=await buildL2Candidate(),context=validateL2(built.catalog,built.manifest,built.files);
const qa=JSON.parse(await readFile(resolve(ROOT,OUTPUT,'QA-AP23L2.json')));
const inputFor=id=>researchInput(built.research.cases.find(row=>row.id===id));
for(const original of built.research.cases)test('L2 actual consumer retains '+original.id,()=>{
 const row=qa.results.find(item=>item.id===original.id);assert.deepEqual(row.input,researchInput(original));assert.deepEqual(row.expected,original.expected);
 const actual=evaluateL2(row.input,context);assert.deepEqual(actual,row.actual);
 for(const[key,value]of Object.entries(original.expected))assert.deepEqual(actual[key],value);
 assert.equal(actual.exportAllowed,false);assert.equal(Object.hasOwn(actual,'end'),actual.outcome==='datedResearchValue');
});
for(const row of qa.syntheticProbeResults)test('L2 synthetic '+row.id,()=>{assert.deepEqual(evaluateL2(row.input,context),row.actual);assert.equal(row.actual.exportAllowed,false);});
test('L2 report has original83 cases, no runtime or product permission',()=>{
 assert.equal(qa.consumerReferenceCases,83);assert.deepEqual(qa.consumerOutcomeCounts,{datedResearchValue:54,qualificationBoundaryProposed:22,researchWindowBoundary:5,unresolvedBoundaryProposed:2});
 for(const flag of ['runtimeActive','sourceReleaseApproved','calendarExportEnabled','productModulesImported','nativeProductChanged'])assert.equal(qa[flag],false);
 assert.equal(qa.missingCurrentFactRejections,336);assert.equal(qa.negativeCatalogMutations,22);
});
test('L2 every current qualification fact is independently required',()=>{
 let rejected=0;
 for(const path of built.catalog.paths.filter(row=>row.contractFamily==='qualifiedDayProcedureV9')){
  const positive=qa.results.find(row=>row.input.path===path.pathId&&row.actual.outcome==='datedResearchValue');assert.ok(positive);
  const policy=built.catalog.qualificationPolicies.find(row=>row.pathId===path.pathId);
  for(const req of policy.requirements){const input=structuredClone(positive.input);delete input.facts[req.key];
   const actual=evaluateL2(input,context);assert.equal(actual.outcome,'qualificationBoundaryProposed');assert.equal(actual.reason,req.reason);assert.equal(Object.hasOwn(actual,'end'),false);rejected++;}
 }assert.equal(rejected,336);
});
test('L2 context is issued and deeply frozen, serialisation grants no authority',()=>{
 assert.ok(Object.isFrozen(context)&&Object.isFrozen(context.catalog.paths)&&Object.isFrozen(context.catalog.holidayBindings.at(-1).proceduralCalendarSupplement));
 assert.equal(evaluateL2(inputFor('L1-AI-R22'),JSON.parse(JSON.stringify(context))).reason,'untrustedIsolatedProposal');
 assert.equal(evaluateL2(inputFor('L1-AI-R22'),{}).reason,'untrustedIsolatedProposal');
});
test('L2 accessors and non-JSON values are rejected without execution',()=>{
 const input=inputFor('L1-AI-R22');let invoked=false;
 Object.defineProperty(input.facts,'expectedService',{enumerable:true,get(){invoked=true;return true;}});
 assert.equal(evaluateL2(input,context).outcome,'qualificationBoundaryProposed');assert.equal(invoked,false);
 for(const value of [NaN,Infinity,undefined,1n,()=>true,new Date()]){const probe=inputFor('L1-AI-R22');probe.facts.extra=value;assert.equal(evaluateL2(probe,context).outcome,'qualificationBoundaryProposed');}
 const cycle=inputFor('L1-AI-R22');cycle.facts.cycle=cycle;assert.equal(evaluateL2(cycle,context).outcome,'qualificationBoundaryProposed');
});
test('L2 Martinstag supplement never edits physical calendar or pauses internal counting',()=>{
 const b=built.catalog.holidayBindings.find(row=>row.holidayBindingId==='sz-qualified-authority-seat');
 assert.deepEqual(b.proceduralCalendarSupplement.dates,['2026-11-11','2027-11-11']);assert.equal(b.proceduralCalendarSupplement.effect,'endShiftOnly');
 assert.equal(calendarDates(b.calendarSelection.calendarId,context.calendars,2026).has('2026-11-11'),false);
 const row=qa.syntheticProbeResults.find(row=>row.id==='martinstag-inside-count-is-not-recess');assert.equal(row.actual.skippedDays,0);assert.equal(row.actual.end,'2026-11-12');
});
test('L2 tracking distinguishes physical input, qualified opening and counted start',()=>{
 const row=qa.results.find(row=>row.id==='L1-AI-R22');assert.notEqual(row.actual.legalOpening,row.input.trigger);
 assert.equal(row.actual.provenance.physicalInput,row.input.trigger);assert.equal(row.actual.provenance.qualifiedOpening,row.actual.legalOpening);
 assert.ok(row.actual.provenance.openingShiftDates.length>0);
 const recess=qa.syntheticProbeResults.find(row=>row.id==='tracking-opening-not-shifted-to-end-of-recess');
 assert.equal(recess.actual.legalOpening,'2026-12-28');assert.equal(recess.actual.firstCountedDay,'2027-01-03');
});
test('L2 current facts and durations are not silently filled from path or cached proof',()=>{
 const longer=qa.results.find(row=>row.input.path==='ai-internal-notice-long'&&row.actual.outcome==='datedResearchValue');
 for(const key of ['actualLongerInstructionDays','ordinaryStatutoryDays','longerInstructionQualification']){
  const probe=structuredClone(longer.input);delete probe.facts[key];assert.equal(evaluateL2(probe,context).outcome,'qualificationBoundaryProposed');
 }
 const mismatch=structuredClone(longer.input);mismatch.days++;assert.equal(evaluateL2(mismatch,context).outcome,'qualificationBoundaryProposed');
 const ordered=qa.results.find(row=>row.input.path==='sz-admin-provisional-opposition'&&row.actual.outcome==='datedResearchValue');
 for(const value of [undefined,0,11,365]){const probe=structuredClone(ordered.input);probe.days=value;assert.equal(evaluateL2(probe,context).outcome,'qualificationBoundaryProposed');}
});
test('L2 end/recess collision has no definitive end or calendar permission',()=>{
 const collisions=qa.results.filter(row=>row.actual.outcome==='unresolvedBoundaryProposed');assert.equal(collisions.length,2);
 for(const row of collisions){assert.equal(Object.hasOwn(row.actual,'end'),false);assert.equal(row.actual.reason,'L1-END-SUSPENSION');assert.equal(row.actual.exportAllowed,false);assert.ok(row.actual.firstSuspendedShiftDate);}
});
test('L2 source phase is evaluated over each counted day',()=>{
 const row=qa.syntheticProbeResults.find(row=>row.id==='sz-real-july-phase-not-new-math');assert.deepEqual(row.actual.temporalBindings,['SZ-NORMS-PHASE1','SZ-NORMS-PHASE2']);
 assert.equal(row.actual.provenance.evaluatedNormSegments[0].interval.to,'2027-06-30');assert.equal(row.actual.provenance.evaluatedNormSegments[1].interval.from,'2027-07-01');
});
for(const[id,edit]of[
 ['oral-tracking',c=>c.paths.find(p=>p.pathId==='ai-admin-written-7').openingPolicy=structuredClone(c.paths.find(p=>p.pathId==='ai-admin-ordered').openingPolicy)],
 ['martinstag-scope',c=>c.holidayBindings.find(b=>b.holidayBindingId==='sz-qualified-authority-seat').proceduralCalendarSupplement.authorityMunicipality='other'],
 ['longer-base',c=>c.paths.find(p=>p.pathId==='ai-internal-notice-long').duration.ordinaryBaseAllowed=[10]],
 ['old-path',c=>c.paths[0].revision++]
])test('L2 fully rehashed semantic mutation '+id+' is not trusted',()=>{
 const c=structuredClone(built.catalog),m=structuredClone(built.manifest),f=new Map(built.files);edit(c);resealL2(c,m,f);
 const raw=f.get(ADMIN),descriptor=m.artifacts.find(row=>row.path===ADMIN);assert.equal(sha(raw),descriptor.sha256);assert.equal(Buffer.byteLength(raw),descriptor.byteLength);
 assert.throws(()=>validateL2(c,m,f));
});
test('L2 exact payload inventory and actual bytes are mandatory',()=>{
 for(const edit of [f=>f.delete(ADMIN),f=>f.set('unknown.json','{}'),f=>f.set(ADMIN,encode({...built.catalog,extra:true}))]){
  const files=new Map(built.files);edit(files);assert.throws(()=>validateL2(built.catalog,built.manifest,files));
 }
});
for(const method of ['entries','get','keys'])test('L2 payload map cannot override '+method,()=>{
 let invoked=false;const files=new Map(built.files);
 Object.defineProperty(files,method,{value(){invoked=true;throw Error('Untrusted payload operation');}});
 assert.throws(()=>validateL2(built.catalog,built.manifest,files));assert.equal(invoked,false);
});
test('L2 payload subclass cannot smuggle a second calendar view',()=>{
 class AlternativePayload extends Map{entries(){throw Error('Untrusted alternative calendar view');}}
 assert.throws(()=>validateL2(built.catalog,built.manifest,new AlternativePayload(built.files)));
});
