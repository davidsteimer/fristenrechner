// SPDX-License-Identifier: AGPL-3.0-only
// Isolated proposal tests, not an application or operating acceptance.
import test from 'node:test';
import assert from 'node:assert/strict';
import {buildJ2Candidate,ADMIN,encode,sha,objSha} from '../../scripts/build-ap23j2-candidate.mjs';
import {buildJ2Schemas} from '../../scripts/build-ap23j2-schemas.mjs';
import {runJ2,evaluateJ2,researchInput,researchProvenance,validateJ2,resealJ2,calendarDates} from '../../scripts/check-ap23j2-contract.mjs';

const built=await buildJ2Candidate(),{schemas}=await buildJ2Schemas();
const calendars=[...built.files.values()].map(JSON.parse).filter(row=>row.dataKind==='calendar');
const positive=id=>researchInput(built.research.cases.find(row=>row.path===id&&row.expected.outcome==='datedResearchValue'),built.research);
const path=(catalog,id)=>catalog.paths.find(row=>row.pathId===id);
const probe=(input,catalog=built.catalog,cals=calendars,coverage)=>evaluateJ2(input,catalog,cals,schemas.input,coverage);

test('J2 actual candidate: 673 full J1 references, native13 rejection, real old calculations and resealed mutations',async()=>{
  const report=await runJ2();assert.equal(report.status,'passed');assert.equal(report.referenceCases,673);
  assert.deepEqual(report.counts,{datedResearchValue:93,unresolvedBoundaryProposed:3,qualificationBoundaryProposed:573,researchWindowBoundary:4});
  assert.equal(report.oldNativeReferenceCalculations,113);assert.equal(report.forgedContextBlocks,339);assert.ok(report.readerNegatives.length>=5);
  assert.ok(report.negativeCatalogMutations>=30);assert.ok(report.negativeInputMutations>100);
  assert.ok(report.results.every(row=>row.actual.exportAllowed===false));
  assert.ok(report.mutationRejections.every(row=>row.actualDescriptorHashesVerified&&row.afterRecomputedEligibilityAndDescriptorHashes));
});

test('J2 preserves 113 complete old path, policy and eligibility objects and 43 raw non-admin payloads',()=>{
  assert.deepEqual(built.catalog.paths.slice(0,113),built.old.paths);
  assert.deepEqual(built.catalog.qualificationPolicies.slice(0,113),built.old.qualificationPolicies);
  assert.deepEqual(built.catalog.releaseBinding.pathEligibility.slice(0,113),built.old.releaseBinding.pathEligibility);
  for(const[path,raw]of built.files)if(path!==ADMIN)assert.ok(raw.length>0,path);
});

test('GE physical Saturday becomes Monday once and exposes physical and legal provenance',()=>{
  const input=positive('GE-RECOURS-30');Object.assign(input,{trigger:'2026-09-05'});input.facts.openingMode='ordinaryPostPhysicalReceipt';
  const actual=probe(input);assert.equal(actual.end,'2026-10-07');assert.equal(actual.legalOpening,'2026-09-07');
  assert.equal(actual.ordinaryStart,'2026-09-08');assert.equal(actual.openingShiftDays,2);
  assert.deepEqual(actual.openingResolution.openingShiftDates,['2026-09-06','2026-09-07']);
  assert.equal(actual.openingResolution.inputDate,'2026-09-05');assert.equal(actual.openingResolution.qualifiedOpeningDate,'2026-09-07');
  assert.equal(actual.openingResolution.openingPolicySha256,objSha(path(built.catalog,input.path).openingPolicy));
  assert.ok(actual.openingResolution.sourceRefs.length>0);assert.ok(actual.openingResolution.evaluatedNormSegments.length>0);
  assert.equal(actual.openingResolution.exportAllowed,false);assert.equal(actual.exportAllowed,false);
});

test('GE separately qualified legal Saturday is not shifted or double-normalised',()=>{
  const input=positive('GE-RECOURS-30');input.trigger='2026-09-05';input.facts.openingMode='qualifiedLegalOpening';
  const actual=probe(input);assert.equal(actual.legalOpening,'2026-09-05');assert.equal(actual.ordinaryStart,'2026-09-06');
  assert.equal(actual.end,'2026-10-05');assert.equal(actual.openingShiftDays,0);assert.deepEqual(actual.openingResolution.openingShiftDates,[]);
});

test('GE holidays bind nine official dates, not personal leave or substitute Monday',()=>{
  const p=path(built.catalog,'ge-admin-ordered'),b=built.catalog.holidayBindings.find(row=>row.holidayBindingId===p.holidayBindingId);
  for(const year of[2026,2027])assert.equal(calendarDates(b.physicalBaseline.calendarId,calendars,year,false).size,9);
  const dates=calendarDates(b.physicalBaseline.calendarId,calendars,2027,false);
  for(const excluded of['2027-01-02','2027-05-01','2027-08-02','2027-12-26'])assert.equal(dates.has(excluded),false);
  assert.ok(dates.has('2027-09-09'));assert.equal(dates.has('2027-09-02'),false);
});

test('GE August2 is opening Monday for ordinary post and a possible end day for qualified opening',()=>{
  const input=positive('GE-ADMIN-ORDERED');input.trigger='2027-08-01';input.days=1;
  input.facts.openingMode='ordinaryPostPhysicalReceipt';const postal=probe(input);assert.equal(postal.legalOpening,'2027-08-02');assert.equal(postal.end,'2027-08-03');
  input.facts.openingMode='qualifiedLegalOpening';const legal=probe(input);assert.equal(legal.legalOpening,'2027-08-01');assert.equal(legal.end,'2027-08-02');
});

test('GE normal-post legal opening does not wait for the end of applicable court holidays',()=>{
  const input=positive('GE-RECOURS-10');input.trigger='2027-03-21';input.facts.openingMode='ordinaryPostPhysicalReceipt';
  const actual=probe(input);assert.equal(actual.legalOpening,'2027-03-22');assert.equal(actual.ordinaryStart,'2027-03-23');
  assert.equal(actual.firstCountedDay,'2027-04-05');assert.equal(actual.end,'2027-04-14');
});

test('GE ordinary post on Jeune shifts before counting, then ordinary end shift remains distinct',()=>{
  const input=positive('GE-ADMIN-ORDERED');input.trigger='2027-09-09';input.days=1;input.facts.openingMode='ordinaryPostPhysicalReceipt';
  const actual=probe(input);assert.equal(actual.legalOpening,'2027-09-10');assert.equal(actual.nominalEnd,'2027-09-11');assert.equal(actual.end,'2027-09-13');
});

for(const value of[undefined,null,'unknown','electronic',true,0,[],['ordinaryPostPhysicalReceipt'],new String('qualifiedLegalOpening')])
  test('GE requires an explicit scalar qualified openingMode '+String(value),()=>{
    const input=positive('GE-RECOURS-30');if(value===undefined)delete input.facts.openingMode;else input.facts.openingMode=value;
    const actual=probe(input);assert.equal(actual.outcome,'qualificationBoundaryProposed');assert.equal(Object.hasOwn(actual,'end'),false);assert.equal(actual.exportAllowed,false);
  });

test('GE accessor and inherited opening facts are rejected without being evaluated',()=>{
  const input=positive('GE-RECOURS-30');let invoked=false;
  Object.defineProperty(input.facts,'openingMode',{enumerable:true,get(){invoked=true;return'ordinaryPostPhysicalReceipt';}});
  assert.equal(probe(input).outcome,'qualificationBoundaryProposed');assert.equal(invoked,false);
  const clean=positive('GE-RECOURS-30');clean.facts=Object.create(clean.facts);assert.equal(probe(clean).outcome,'qualificationBoundaryProposed');
});

for(const date of['2026-09-05','2026-09-06','2026-09-07'])test('GE source chronology binds every pre-count date including '+date,()=>{
  const input=positive('GE-RECOURS-30');input.trigger='2026-09-05';input.facts.openingMode='ordinaryPostPhysicalReceipt';
  const c=structuredClone(built.catalog),p=path(c,input.path),span=p.normTimeline[0];
  const epoch=Date.parse(date+'T00:00:00Z'),before=new Date(epoch-86400000).toISOString().slice(0,10),after=new Date(epoch+86400000).toISOString().slice(0,10);
  p.normTimeline=[{...structuredClone(span),interval:{from:span.interval.from,to:before}},{...structuredClone(span),interval:{from:after,to:span.interval.to}}];
  resealJ2(c);const actual=probe(input,c);assert.equal(actual.outcome,'researchWindowBoundary');assert.equal(Object.hasOwn(actual,'end'),false);
});

test('GE a synthetic norm transition in the legal-opening shift records both actual source segments',()=>{
  const input=positive('GE-RECOURS-30');input.trigger='2026-09-05';input.facts.openingMode='ordinaryPostPhysicalReceipt';
  const c=structuredClone(built.catalog),p=path(c,input.path),span=p.normTimeline[0];
  p.normTimeline=[{...structuredClone(span),researchBindingId:'synthetic-before',interval:{from:span.interval.from,to:'2026-09-05'}},
    {...structuredClone(span),researchBindingId:'synthetic-after',interval:{from:'2026-09-06',to:span.interval.to}}];
  resealJ2(c);const actual=probe(input,c);assert.equal(actual.outcome,'datedResearchValue');
  assert.deepEqual(actual.temporalBindings,['synthetic-before','synthetic-after']);
  assert.deepEqual(actual.openingResolution.evaluatedNormSegments.map(row=>row.researchBindingId),['synthetic-before','synthetic-after']);
});

test('GE input before the window cannot be rescued by a legal opening inside the window',()=>{
  const input=positive('GE-RECOURS-30');input.trigger='2026-08-28';input.facts.openingMode='ordinaryPostPhysicalReceipt';
  assert.equal(probe(input).outcome,'researchWindowBoundary');
});

test('GE legal opening outside the window stops before any definitive result',()=>{
  const input=positive('GE-ADMIN-ORDERED');input.trigger='2027-12-31';input.days=1;input.facts.openingMode='ordinaryPostPhysicalReceipt';
  const actual=probe(input);assert.equal(actual.outcome,'researchWindowBoundary');assert.equal(Object.hasOwn(actual,'end'),false);assert.equal(actual.exportAllowed,false);
});

test('GE manifest and source coverage also apply before counting starts',()=>{
  const input=positive('GE-RECOURS-30');input.trigger='2026-09-05';input.facts.openingMode='ordinaryPostPhysicalReceipt';
  assert.equal(probe(input,built.catalog,calendars,{from:'2026-09-06',to:'2027-12-31'}).outcome,'researchWindowBoundary');
  const c=structuredClone(built.catalog);path(c,input.path).temporalBinding.sourceCoverage.to='2026-09-05';resealJ2(c);
  assert.equal(probe(input,c).outcome,'researchWindowBoundary');
});

test('opening policy hash is necessary even for an otherwise positive local proposal',()=>{
  const input=positive('GE-RECOURS-30'),c=structuredClone(built.catalog);
  c.releaseBinding.pathEligibility.find(row=>row.pathId===input.path).openingPolicySha256='f'.repeat(64);
  assert.equal(probe(input,c).reason,'proposalEligibilityInvalid');
});

test('new opening policy cannot be attached to a foreign canton or substituted by warning-only metadata',()=>{
  const c=structuredClone(built.catalog),p=path(c,'fr-nontc-recours-30');p.openingPolicy=structuredClone(path(c,'ge-recours-30').openingPolicy);
  resealJ2(c);const m=structuredClone(built.manifest),files=new Map(built.files);files.set(ADMIN,encode(c));
  Object.assign(m.artifacts.find(row=>row.path===ADMIN),{sha256:sha(files.get(ADMIN)),byteLength:Buffer.byteLength(files.get(ADMIN))});
  assert.throws(()=>validateJ2(c,m,files,built,schemas));
});

test('FR refusal uses its own qualified trigger, JU oral and motivation paths use distinct event kinds',()=>{
  assert.equal(path(built.catalog,'fr-nontc-nachfrist-3').openingPolicy.triggerKind,'qualifiedExtensionRefusalAfterExpiredDeadline');
  assert.equal(path(built.catalog,'fr-tc-begruendung-30').openingPolicy.triggerKind,'qualifiedTcDispositifOpening');
  assert.equal(path(built.catalog,'ju-confirmation-request5-initial').openingPolicy.triggerKind,'qualifiedOralDecisionOpening');
  assert.equal(path(built.catalog,'ju-motivation-request30-initial').openingPolicy.triggerKind,'qualifiedFullyFavourableAbbreviatedOpening');
  for(const id of['FR-NONTC-NACHFRIST-3','JU-CONFIRMATION-REQUEST5-INITIAL','JU-MOTIVATION-REQUEST30-INITIAL']){
    const input=positive(id),actual=probe(input);assert.equal(actual.legalOpening,input.trigger);assert.equal(actual.openingShiftDays,0);
    assert.deepEqual(actual.openingResolution.openingShiftDates,[]);assert.equal(actual.exportAllowed,false);
  }
});

test('pure end shift into GE recess is not confused with opening normalisation',()=>{
  const input=positive('GE-RECOURS-10');input.trigger='2027-03-10';input.facts.openingMode='qualifiedLegalOpening';
  const actual=probe(input);assert.equal(actual.outcome,'unresolvedBoundaryProposed');assert.equal(actual.nominalEnd,'2027-03-20');
  assert.equal(actual.ordinaryShiftEnd,'2027-03-22');assert.equal(actual.legalOpening,'2027-03-10');assert.equal(Object.hasOwn(actual,'end'),false);
});

test('research adapter preserves actual overrides while explicitly projecting only five bound fixture annotations',()=>{
  const p=built.research.paths.find(row=>row.id==='JU-CONFIRMATION-REQUEST5-REVIEW'),row=built.research.cases.find(row=>row.path===p.id&&row.expected.outcome==='datedResearchValue');
  const input=researchInput(row,built.research);assert.equal(Object.hasOwn(input.facts,'syntheticFixtureOnly'),false);
  const negative=researchInput({...row,facts:{...row.facts,inventedCurrentFact:true}},built.research);
  assert.equal(negative.facts.inventedCurrentFact,true);assert.equal(probe(negative).reason,'unknownResearchFact');
  const proof=researchProvenance(row);assert.deepEqual(proof.annotations,{qualifiedLegalOpening:true,triggerKind:'actualLawfulOralOpening'});
  assert.equal(proof.originalOverrides.triggerKind,'actualLawfulOralOpening');assert.equal(Object.hasOwn(input.facts,'triggerKind'),false);
  assert.throws(()=>researchInput({...row,facts:{...row.facts,triggerKind:'differentTrigger'}},built.research),/Exact annotated fixture value/);
  const other=researchInput({...row,id:'not-the-bound-fixture'},built.research);assert.equal(other.facts.triggerKind,'actualLawfulOralOpening');
  assert.equal(probe(other).reason,'unknownResearchFact');
});

test('the annotated JU special-commission negative retains its actual false qualification and blocking reason',()=>{
  const row=built.research.cases.find(row=>row.id==='JU-J1-R22'),input=researchInput(row,built.research),actual=probe(input);
  assert.equal(input.facts.reviewTargetQualified,false);assert.equal(Object.hasOwn(input.facts,'actualReviewTarget'),false);
  assert.equal(actual.outcome,'qualificationBoundaryProposed');assert.equal(actual.reason,'ju.reviewTargetQualifiedNotQualified');
  assert.deepEqual(researchProvenance(row).annotations,{actualReviewTarget:'unqualifiedSpecialCommission'});
  assert.throws(()=>researchInput({...row,facts:{...row.facts,reviewTargetQualified:true}},built.research),/Preserved negative qualification/);
});

test('candidate has no approved decision, new source release, runtime reader or export authority',()=>{
  assert.equal(built.catalog.contractStatus,'proposed');assert.equal(built.catalog.runtimeActive,false);
  assert.deepEqual(built.catalog.contractDecision,{id:'DEC-2026-039',status:'proposed',on:null});
  assert.equal(built.catalog.releaseBinding.status,'candidate');
  for(const key of['sourceReleaseApproved','productionActivation','calendarExportEnabled'])assert.equal(built.manifest.extensions['steimer.local-reference'][key],false);
});
