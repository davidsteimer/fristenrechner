// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculateAdministrativeDeadline} from '../../src/core/administrativeDeadline';
import {ap23h3CandidateRuntime as runtime} from '../../src/release/ap23h3CandidateData';
import {administrativeInput12} from './ap23h3Fixtures';
// @ts-expect-error The immutable research oracle intentionally has no product imports.
import {evaluate} from '../../scripts/check-ap23h1-references.mjs';
const research=JSON.parse(readFileSync(new URL('../../docs/fachrecht/ap23h1/referenzfaelle.json',import.meta.url),'utf8'));
const catalog=runtime.administrativeContext.administrativeCatalog;
function input(item:any):any{
 const path=research.paths.find((p:any)=>p.id===item.path),id=path?.id.toLowerCase()??'ow-admin-20';
 const base:any=administrativeInput12(catalog,id,item.trigger,item.days),q=catalog.qualificationPolicies.find(q=>q.pathId===id)!;
 if(!path){base.selection.pathId='unknown';return base;}
 if(q.mode!=='qualifiedDayProcedureV5')throw Error('Wrong research policy');
 const facts={...research.sharedSyntheticFacts,...path.syntheticFacts,...item.facts};
 base.caseQualification=Object.fromEntries(q.requirements.map(r=>[r.key,facts[r.key]]));
 if(q.openingChainPolicy==='requireOriginalOrTimelyRequestedReasons'){
   base.caseQualification.openingOrigin=facts.openingOrigin;
   if(facts.openingOrigin==='reasonedFollowingTimelyRequest')base.caseQualification.priorReasonsRequest=facts.priorReasonsRequest;
 }
 const allKnown=new Set([...Object.keys(research.sharedSyntheticFacts),...research.paths.flatMap((p:any)=>Object.keys(p.syntheticFacts))]);
 for(const[k,v]of Object.entries(item.facts??{}))if(!allKnown.has(k))base.caseQualification[k]=v;
 return base;
}
test('AP23H3 all118 accepted H1 cases use the actual native reader and arithmetic',()=>{
 const counts:Record<string,number>={};
 for(const item of research.cases){const expected=evaluate(item,research),r:any=calculateAdministrativeDeadline(input(item),runtime.administrativeContext);counts[expected.outcome]=(counts[expected.outcome]??0)+1;
  assert.equal(r.calendarExportAllowed,false,item.id);
  if(expected.outcome==='datedResearchValue'){
   assert.equal(r.outcome,'calculated',item.id+': '+JSON.stringify(r));assert.equal(r.finalEnd,expected.end,item.id);
   assert.equal(r.ordinaryStart,expected.ordinaryStart,item.id);assert.equal(r.deadlineStart,expected.firstCountedDay,item.id);
   assert.equal(r.provisionalEnd,expected.nominalEnd,item.id);assert.equal(r.skippedCalendarDays,expected.skippedDays,item.id);
   assert.equal((Date.parse(r.finalEnd)-Date.parse(r.provisionalEnd))/86400000,expected.endShiftDays,item.id);
   assert.deepEqual(r.provenance.evaluatedNormSegments.map((s:any)=>s.researchBindingId),expected.temporalBindings,item.id);
   if(item.path.startsWith('OW-'))for(const [segment,id]of [['OW-STVG-1917','SRC-AP23H1-OW-STVG-20250101'],['OW-STVG-2031','SRC-AP23H1-OW-STVG-20270101']])assert.equal(r.provenance.sourceRefs.some((s:any)=>s.sourceId===id),expected.temporalBindings.includes(segment),item.id+' actual norm sources');
   assert.equal(r.countedDates.length,item.days,item.id);assert.equal(r.referenceOnly,true,item.id);
  }else{
   assert.equal(r.outcome,'blocked',item.id);assert.equal(r.finalEnd,undefined,item.id);
   if(expected.outcome==='researchWindowBoundary')assert.deepEqual(r.blockReasonKeys,[item.trigger<research.referenceWindow.from||item.trigger>research.referenceWindow.to?'administrative.outsideCaseCoverage':'dataCoverageExceeded'],item.id);
   if(expected.outcome==='unresolvedBoundaryProposed'){assert.equal(r.provisionalEnd,expected.nominalEnd,item.id);assert.equal(r.ordinaryShiftEnd,expected.ordinaryShiftEnd,item.id);assert.equal(r.blockedDate,expected.firstSuspendedShiftDate,item.id);}
   if(expected.outcome==='qualificationBoundaryProposed'){
    const aliases:Record<string,string>={unknownResearchPath:'administrative.unknownPath',unknownResearchFact:'administrative.inputContractInvalid',invalidResearchDate:'administrative.inputContractInvalid',dayDurationNotSpecified:'administrative.inputContractInvalid',statutoryDurationMismatch:'administrative.durationMismatch'};
    assert.deepEqual(r.blockReasonKeys,[aliases[expected.reason]??'administrative.'+expected.reason],item.id);
   }
  }
 }
 assert.deepEqual(counts,{datedResearchValue:58,unresolvedBoundaryProposed:18,researchWindowBoundary:4,qualificationBoundaryProposed:38});
});
test('AP23H3 all21 paths remain reference-only and every context clone is denied',()=>{
 const contexts=[{...runtime.administrativeContext},Object.create(runtime.administrativeContext),JSON.parse(JSON.stringify(runtime.administrativeContext)),{approved:true}];let n=0;
 for(const p of research.paths){const v=administrativeInput12(catalog,p.id.toLowerCase(),'2026-10-02',p.days??10);assert.equal(calculateAdministrativeDeadline(v,runtime.administrativeContext).outcome,'calculated');
  for(const context of contexts){const r=calculateAdministrativeDeadline(v,context);assert.equal(r.outcome,'blocked');assert.equal(r.calendarExportAllowed,false);n++;}}
 assert.equal(n,84);
});
