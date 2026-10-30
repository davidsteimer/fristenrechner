// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {buildM2Candidate,ROOT,OUTPUT,ADMIN,encode,sha,objSha} from '../../scripts/build-ap23m2-candidate.mjs';
import {validateM2,evaluateM2,researchInput,resealM2,calendarDates} from '../../scripts/check-ap23m2-contract.mjs';
const built=await buildM2Candidate(),manifest=JSON.parse(await readFile(resolve(ROOT,OUTPUT,'bundle/manifest.json'),'utf8'));
const files=new Map(await Promise.all(manifest.artifacts.map(async d=>[d.path,await readFile(resolve(ROOT,OUTPUT,'bundle',d.path),'utf8')]))),catalog=JSON.parse(files.get(ADMIN));
const context=validateM2(catalog,manifest,files),qa=JSON.parse(await readFile(resolve(ROOT,OUTPUT,'QA-AP23M2.json'),'utf8'));
for(const item of built.research.cases)test('Original accepted M1 case '+item.id,()=>{
 const input=researchInput(item,catalog),actual=evaluateM2(input,context);
 assert.deepEqual(input.facts,item.facts,'No synthesized current case facts');
 for(const[key,value]of Object.entries(item.expected))assert.deepEqual(actual[key],value);
 assert.equal(actual.exportAllowed,false);assert.equal(Object.hasOwn(actual,'end'),actual.outcome==='datedResearchValue');
 assert.deepEqual(actual,qa.results.find(row=>row.id===item.id).actual);
});
for(const item of qa.syntheticProbeResults)test('Explicit M2 probe '+item.id,()=>{
 assert.deepEqual(evaluateM2(item.input,context),item.actual);assert.equal(item.actual.exportAllowed,false);
});
test('Actual bundle and additive paths are exactly bound',()=>{
 assert.equal(files.size,44);assert.equal(catalog.paths.length,245);assert.equal(catalog.formatVersion,'10.0.0');assert.equal(manifest.formatVersion,'17.0.0');
 assert.equal(qa.manifestSha256,sha(encode(manifest)));assert.equal(qa.catalogSha256,sha(files.get(ADMIN)));
 for(const path of built.old.paths)assert.deepEqual(catalog.paths.find(row=>row.pathId===path.pathId),path);
 for(const e of built.old.releaseBinding.pathEligibility)assert.deepEqual(catalog.releaseBinding.pathEligibility.find(row=>row.pathId===e.pathId),e);
 assert.equal(built.integrity.counts.unchangedRawArtifacts,43);assert.equal(built.integrity.counts.totalHolidayRules,499);
});
for(const row of built.research.paths)test('Every current requirement remains mandatory '+row.id,()=>{
 const path=catalog.paths.find(p=>p.researchRef===row.id&&p.contractFamily==='qualifiedDayProcedureV10'),policy=catalog.qualificationPolicies.find(p=>p.pathId===path.pathId);
 const example=qa.results.find(r=>r.input.path===path.pathId&&r.actual.outcome==='datedResearchValue');assert.ok(example);
 for(const req of policy.requirements){const input=structuredClone(example.input);delete input.facts[req.key];assert.equal(evaluateM2(input,context).outcome,'qualificationBoundaryProposed');}
});
test('Current NE regional fact is not recovered from a default',()=>{
 const input=structuredClone(qa.results.find(r=>r.input.path==='ne-admin-ordered').input);delete input.facts.authorityHolidayRegion;
 assert.equal(evaluateM2(input,context).reason,'holidayAnchorNotQualified');assert.equal(evaluateM2(input,context).end,undefined);
});
test('Serialized or copied reference contexts confer no capability',()=>{
 const input=qa.results[0].input;
 for(const fake of [{},structuredClone(context),JSON.parse(JSON.stringify(context))])assert.equal(evaluateM2(input,fake).reason,'untrustedIsolatedProposal');
});
test('Accessor case facts are rejected without execution',()=>{
 let invoked=false;const input=structuredClone(qa.results[0].input);Object.defineProperty(input.facts,'evil',{enumerable:true,get(){invoked=true;return true;}});
 assert.equal(evaluateM2(input,context).reason,'inputContractInvalid');assert.equal(invoked,false);
});
test('Cyclic and non-plain input facts are rejected',()=>{
 const a=structuredClone(qa.results[0].input);a.facts.loop=a;assert.equal(evaluateM2(a,context).reason,'inputContractInvalid');
 const b=structuredClone(qa.results[0].input);Object.setPrototypeOf(b.facts,{extra:true});assert.equal(evaluateM2(b,context).reason,'inputContractInvalid');
});
for(const kind of ['unknownFact','topLevel','requiredFact'])test('Non-enumerable input cannot evade closed JSON contract '+kind,()=>{
 const input=structuredClone(qa.results[0].input),target=kind==='topLevel'?input:input.facts;
 const key=kind==='requiredFact'?'authorityCanton':kind==='topLevel'?'exportAllowed':'foreignUnknownFact';
 Object.defineProperty(target,key,{value:kind==='requiredFact'?input.facts.authorityCanton:true,enumerable:false,configurable:true});
 assert.equal(evaluateM2(input,context).reason,'inputContractInvalid');
});
test('Symbol facts and sparse pseudo-JSON are rejected',()=>{
 const input=structuredClone(qa.results[0].input);input.facts[Symbol('foreign')]=true;assert.equal(evaluateM2(input,context).reason,'inputContractInvalid');
 const a=structuredClone(qa.results[0].input);a.facts.authorityCanton=[];a.facts.authorityCanton.length=1;a.facts.authorityCanton.foreign='NE';assert.equal(evaluateM2(a,context).reason,'inputContractInvalid');
});
for(const method of ['get','keys','entries',Symbol.iterator])test('Payload override cannot split verified bytes '+String(method),()=>{
 const evil=new Map(files);Object.defineProperty(evil,method,{value:()=>new Map(files)[method](),enumerable:true});
 assert.throws(()=>validateM2(catalog,manifest,evil),/Overridden payload/);
});
test('Payload subclasses cannot split validation and use',()=>{
 class ForeignMap extends Map{}assert.throws(()=>validateM2(catalog,manifest,new ForeignMap(files)),/Ordinary payload/);
});
test('Mutating caller payload after validation leaves immutable context intact',()=>{
 const input=qa.results[0].input,before=evaluateM2(input,context),mutableCatalog=structuredClone(catalog),mutableFiles=new Map(files);
 const fresh=validateM2(mutableCatalog,manifest,mutableFiles);mutableCatalog.paths.length=0;mutableFiles.clear();
 assert.deepEqual(evaluateM2(input,fresh),before);assert.throws(()=>fresh.catalog.paths.pop());
});
test('Resealed semantically modified policies are not trustworthy',()=>{
 const c=structuredClone(catalog),m=structuredClone(manifest),f=new Map(files),p=c.paths.find(p=>p.pathId==='vs-admin-notice-long');
 p.duration.minimum=31;resealM2(c,m,f);assert.throws(()=>validateM2(c,m,f));
});
test('Payload omissions, extras and bad descriptors are rejected',()=>{
 const missing=new Map(files);missing.delete(ADMIN);assert.throws(()=>validateM2(catalog,manifest,missing));
 const extra=new Map(files);extra.set('extra.json','{}');assert.throws(()=>validateM2(catalog,manifest,extra));
 const m=structuredClone(manifest);m.artifacts[0].byteLength++;assert.throws(()=>validateM2(catalog,m,files));
});
test('Provenance binds actual choice, duration, profiles and current trigger',()=>{
 for(const r of qa.results.filter(r=>r.actual.outcome==='datedResearchValue')){
  const p=catalog.paths.find(p=>p.pathId===r.input.path),e=catalog.releaseBinding.pathEligibility.find(e=>e.pathId===p.pathId),prov=r.actual.provenance;
  assert.equal(prov.durationPolicySha256,objSha(p.duration));assert.equal(prov.pathSha256,e.pathSha256);assert.equal(prov.physicalInput,r.input.trigger);
  assert.equal(prov.qualifiedOpening,r.actual.legalOpening);assert.ok(prov.evaluatedNormSegments.length);
  assert.ok(context.calendars.some(c=>c.calendarId===prov.baseCalendarId));
 }
});
test('All 64 source raw files retain distinct role mapping',()=>{
 assert.equal(built.crosswalk.length,64);assert.equal(built.crosswalk.filter(r=>r.catalogSourceId).length,19);
 for(const r of built.crosswalk)assert.equal(r.sourcePromotion,false);
 for(const r of built.crosswalk.filter(r=>r.researchRole==='officialTechnicalAccessProvenance'))assert.equal(r.catalogSourceId,null);
});
test('Waadt order qualification is not an invented numeric Art81 validator',()=>{
 assert.equal(qa.vdArticle81NumericLegalityInference,false);
 const pass=qa.syntheticProbeResults.find(r=>r.id==='vd-current-qualified-order-not-global-thirty-cap');assert.equal(pass.input.days,40);assert.equal(pass.actual.outcome,'datedResearchValue');
 const fail=qa.syntheticProbeResults.find(r=>r.id==='vd-unqualified-initial-order-no-numeric-inference');assert.equal(fail.actual.reason,'VD-B-ORDER-LEGALITY');
});
test('Physical VS calendar excludes Good Friday and VD excludes Boxing Day',()=>{
 const vs=calendarDates('ap22-vs-6c002f32b1b0',context.calendars,2027),vd=calendarDates('ap22-vd-26f452ff34ee',context.calendars,2026);
 assert.equal(vs.has('2027-03-26'),false);assert.equal(vd.has('2026-12-26'),false);
});
test('Counts separate accepted law cases and new technical tests',()=>{
 assert.equal(qa.consumerReferenceCases,109);assert.equal(qa.syntheticProbes,33);assert.equal(qa.missingCurrentFactRejections,560);assert.equal(qa.negativeCatalogMutations,23);
 assert.deepEqual(qa.consumerOutcomeCounts,{datedResearchValue:73,qualificationBoundaryProposed:27,researchWindowBoundary:6,unresolvedBoundaryProposed:3});
 for(const flag of ['runtimeActive','sourceReleaseApproved','calendarExportEnabled','productModulesImported','nativeProductChanged'])assert.equal(qa[flag],false);
});
