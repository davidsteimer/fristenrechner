// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {buildI2Candidate,ROOT,OUTPUT,ADMIN,sha,encode} from '../../scripts/build-ap23i2-candidate.mjs';
import {buildI2Schemas} from '../../scripts/build-ap23i2-schemas.mjs';
import {runI2,evaluateI2,researchInput,resolveSelectionI2,validateI2,resealI2} from '../../scripts/check-ap23i2-contract.mjs';

const built=await buildI2Candidate(),{schemas}=await buildI2Schemas();
const calendars=[...built.files.values()].map(JSON.parse).filter(v=>v.dataKind==='calendar');
const positive=id=>researchInput(built.research.cases.find(c=>c.path===id&&c.expected.outcome==='datedResearchValue'),built.research);

test('I2 real bundle: all 249 full accepted references, native rejection and resealed semantic negatives',async()=>{
  const report=await runI2();
  assert.equal(report.referenceCases,249);assert.deepEqual(Object.values(report.counts),[110,16,117,6]);
  assert.equal(report.oldNativeReferenceCalculations,79);assert.equal(report.forgedContextBlocks,237);
  assert.equal(report.readerNegatives.length,5);assert.equal(report.negativeCatalogMutations,61);
  assert.ok(report.mutationRejections.every(r=>r.actualDescriptorHashesVerified&&r.afterRecomputedDescriptorAndEligibilityHashes));
  assert.ok(report.mutationRejections.every(r=>!r.rejection.startsWith('Exact candidate manifest')));
});

test('I2 leaves 43 H3 payloads and every old path/policy/eligibility object unchanged',()=>{
  assert.equal(built.integrity.counts.unchangedRawArtifacts,43);
  assert.deepEqual(built.catalog.paths.slice(0,79),built.old.paths);
  assert.deepEqual(built.catalog.qualificationPolicies.slice(0,79),built.old.qualificationPolicies);
  assert.deepEqual(built.catalog.releaseBinding.pathEligibility.slice(0,79),built.old.releaseBinding.pathEligibility);
});

test('I2 TG notice given/absent resolve distinct concrete profile hashes, no static lie',()=>{
  const input=positive('TG-VG-EXECUTION-5');input.trigger='2026-12-14';
  const given=resolveSelectionI2(input,built.catalog),givenResult=evaluateI2(input,built.catalog,calendars,schemas.input);
  input.facts.exceptionNotice='absent';
  const absent=resolveSelectionI2(input,built.catalog),absentResult=evaluateI2(input,built.catalog,calendars,schemas.input);
  assert.equal(given.selectedProfileId,'tg-none');assert.equal(absent.selectedProfileId,'tg-three');
  assert.notEqual(given.selectedProfileSha256,absent.selectedProfileSha256);
  assert.deepEqual(given.permittedProfiles,absent.permittedProfiles);assert.equal(given.permittedProfiles.length,2);
  assert.equal(givenResult.end,'2026-12-21');assert.equal(absentResult.end,'2027-01-04');
  assert.equal(givenResult.exportAllowed,false);assert.equal(absentResult.exportAllowed,false);
});

test('I2 unresolved notice and inherited/object/accessor facts never select a fake profile',()=>{
  const input=positive('TG-VG-PROVISIONAL-ORDERED');
  for(const value of['unknown','incomplete','disputed',null,true,['given'],new String('given'),{value:'given'}]){
    input.facts.exceptionNotice=value;
    assert.equal(resolveSelectionI2(input,built.catalog),null);
    assert.equal(evaluateI2(input,built.catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');
  }
  let read=false;Object.defineProperty(input.facts,'exceptionNotice',{enumerable:true,get(){read=true;return'given';}});
  assert.equal(resolveSelectionI2(input,built.catalog),null);assert.equal(read,false);
});

test('I2 known facts from another current path cannot leak into qualification or selection',()=>{
  for(const[id,key,value]of[['TG-VG-30','exceptionNotice','incomplete'],['GL-ADMIN-30','regierungsratCompetenceBasis','vrg55Abs1Nr8Qualified']]){
    const input=positive(id);input.facts[key]=value;
    assert.equal(resolveSelectionI2(input,built.catalog),null);
    assert.equal(evaluateI2(input,built.catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');
  }
});

test('I2 diagnostic profile provenance rejects a foreign canton or stale path revision',()=>{
  const input=positive('TG-VG-30');
  for(const[key,value]of[['authoritySeatCanton','GL'],['pathRevision',2]]){
    const changed={...input,[key]:value};assert.equal(resolveSelectionI2(changed,built.catalog),null);
    assert.equal(evaluateI2(changed,built.catalog,calendars,schemas.input).reason,'pathContextMismatch');
  }
});

test('I2 limited shortened statutory durations are not defaults or ordered extendable periods',()=>{
  for(const[id,min,max]of[['GL-ADMIN-SHORTENED-END',2,29],['GL-COURT-SHORTENED-INTERIM',2,9],['TG-REKURS-SHORTENED',5,29]]){
    const input=positive(id),path=built.catalog.paths.find(p=>p.pathId===input.path);
    assert.equal(path.duration.kind,'concretisedStatutoryDays');assert.equal(path.duration.legalNature,'statutoryNotExtendable');
    assert.equal(path.duration.overridable,false);assert.equal(Object.hasOwn(path.duration,'value'),false);
    for(const days of[min,max])assert.equal(evaluateI2({...input,days},built.catalog,calendars,schemas.input).outcome,'datedResearchValue');
    for(const days of[min-1,max+1])assert.equal(evaluateI2({...input,days},built.catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');
    input.facts[path.duration.confirmationFact]=false;
    assert.equal(evaluateI2(input,built.catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');
  }
});

test('I2 both current RR competence bases and both administrative shortening grounds work',()=>{
  for(const[id,key,values]of[['TG-RR-30','regierungsratCompetenceBasis',['vrg55Abs1Nr8Qualified','vrg55Abs1Nr9Qualified']],
    ['TG-REKURS-SHORTENED','shorteningGround',['provisionalMeasure','otherUrgentCase']]]){
    const input=positive(id);
    for(const value of values){input.facts[key]=value;assert.equal(evaluateI2(input,built.catalog,calendars,schemas.input).outcome,'datedResearchValue');}
    input.facts[key]='unknown';assert.equal(evaluateI2(input,built.catalog,calendars,schemas.input).outcome,'qualificationBoundaryProposed');
  }
});

test('I2 a fully resealed wrong duration reaches semantic rejection, not exact-manifest rejection',()=>{
  const c=structuredClone(built.catalog),m=structuredClone(built.manifest),files=new Map(built.files);
  c.paths.find(p=>p.pathId==='tg-rr-30').duration.value=20;resealI2(c);files.set(ADMIN,encode(c));
  Object.assign(m.artifacts.find(a=>a.path===ADMIN),{sha256:sha(files.get(ADMIN)),byteLength:Buffer.byteLength(files.get(ADMIN))});
  assert.throws(()=>validateI2(c,m,files,built,schemas),error=>error.message.startsWith('Qualified duration'));
});

test('I2 generated metadata never claims runtime/source/contract approval or calendar export',async()=>{
  const integrity=JSON.parse(await readFile(resolve(ROOT,OUTPUT,'candidate-integrity.json')));
  for(const key of['runtimeReadable','productionActivation','calendarExportEnabled'])assert.equal(integrity[key],false);
  assert.equal(integrity.contractStatus,'proposed');assert.equal(integrity.sourceReview,'pending');
  assert.deepEqual(built.catalog.contractDecision,{id:'DEC-2026-038',status:'proposed',on:null});
});
