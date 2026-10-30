// SPDX-License-Identifier: AGPL-3.0-only
// Research checker tests. They are not assertions about implemented UI blocking.
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {evaluate,evaluateIsolatedPractice,holidays,runReferences,suspended} from '../../scripts/check-ap23h1-references.mjs';
const suite=JSON.parse(await readFile(new URL('../../docs/fachrecht/ap23h1/referenzfaelle.json',import.meta.url)));
const input=(p,facts={})=>({path:p.id,trigger:'2026-10-02',days:p.days??10,facts});
const path=id=>suite.paths.find(p=>p.id===id);
const dayMs=86400000;
const add=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*dayMs).toISOString().slice(0,10);
const weekend=d=>[0,6].includes(new Date(d+'T00:00:00Z').getUTCDay());

test('All explicit research expectations pass without operational or legal approval',async()=>{
  const{report:r}=await runReferences();
  assert.equal(r.paths,21);assert.equal(r.referenceCases,118);assert.deepEqual(r.discrepancies,[]);
  assert.deepEqual(r.counts,{datedResearchValue:58,unresolvedBoundaryProposed:18,qualificationBoundaryProposed:38,researchWindowBoundary:4});
  for(const k of ['runtimeActive','productTest','exportTest','legalApproval'])assert.equal(r[k],false);
  assert.equal(r.calendarComparisons.length,4);
  assert.equal(r.calendarComparisons.reduce((n,c)=>n+c.daysCompared,0),1460);
  assert.ok(r.calendarComparisons.every(c=>c.endEligibilityDifferences===0&&c.proposedProjectionDates===17));
});
for(const p of suite.paths)test('Qualified research group '+p.id,()=>{
  assert.equal(evaluate(input(p),suite).outcome,'datedResearchValue');
  const wrongDuration=p.days===null?null:p.days+1;
  assert.equal(evaluate({...input(p),days:wrongDuration},suite).outcome,'qualificationBoundaryProposed');
});
for(const p of suite.paths)test('Current facts must stay qualified in '+p.id,()=>{
  for(const requirement of [...suite.sharedRequirements,...p.requirements]){
    const actual=evaluate(input(p,{[requirement.key]:null}),suite);
    assert.equal(actual.outcome,'qualificationBoundaryProposed',p.id+'/'+requirement.key);
    assert.equal(actual.reason,requirement.reason,p.id+'/'+requirement.key);
    assert.equal(Object.hasOwn(actual,'end'),false);
  }
});
for(const p of suite.paths.filter(p=>p.suspension==='three'))test('Independent end-shift collision '+p.id,()=>{
  const c=suite.cases.find(c=>c.path===p.id&&c.expected.outcome==='unresolvedBoundaryProposed');
  assert.ok(c);const r=evaluate(c,suite);
  assert.equal(r.reason,'H1-END-SUSPENSION');assert.equal(r.nominalEnd,'2027-03-20');
  assert.equal(r.ordinaryShiftEnd,'2027-03-22');assert.equal(Object.hasOwn(r,'end'),false);
});
test('Winter-only has no invented pure end-shift collision in the actual two-year window',()=>{
  const p=path('NW-EINWENDUNG-ORDERED');let collisions=0,dates=0;
  for(let nominal=suite.referenceWindow.from;nominal<=suite.referenceWindow.to;nominal=add(nominal,1)){
    if(suspended(nominal,p,suite))continue;
    let d=nominal,shifted=[];
    while(weekend(d)||holidays(p.calendar,Number(d.slice(0,4)),suite).has(d)){
      d=add(d,1);if(d>suite.referenceWindow.to)break;shifted.push(d);
    }
    if(shifted.some(d=>suspended(d,p,suite)))collisions++;
    dates++;
  }
  assert.ok(dates>400);assert.equal(collisions,0);
  assert.equal(new Date('2026-12-18T00:00:00Z').getUTCDay(),5);
  assert.equal(new Date('2027-12-18T00:00:00Z').getUTCDay(),6);
});
test('NW no, winter-only and three-period suspension are not interchangeable',()=>{
  const summer=p=>evaluate({path:p,trigger:'2027-07-10',days:20},suite);
  assert.equal(summer('NW-ADMIN-ORDERED').end,'2027-07-30');
  assert.equal(summer('NW-EINWENDUNG-ORDERED').end,'2027-07-30');
  assert.equal(summer('NW-APPEAL-ORDERED').end,'2027-08-31');
  const winter=p=>evaluate({path:p,trigger:'2026-12-10',days:20},suite);
  assert.equal(winter('NW-ADMIN-ORDERED').end,'2026-12-30');
  assert.equal(winter('NW-EINWENDUNG-ORDERED').end,'2027-01-15');
});
test('OW qualified five-day review is a distinct proposed no-suspension group',()=>{
  const r=evaluate({path:'OW-COURT-SUSPENSIVE-5',trigger:'2026-12-23',days:5},suite);
  assert.equal(r.end,'2026-12-28');assert.equal(r.skippedDays,0);
  assert.equal(evaluate(input(path('OW-COURT-SUSPENSIVE-5'),{suspensionException:'ordinaryNoException'}),suite).outcome,'qualificationBoundaryProposed');
});
for(const p of suite.paths.filter(p=>p.openingChain))test('Later reasoned opening requires an established timely request '+p.id,()=>{
  assert.equal(evaluate(input(p,{openingOrigin:'reasonedFollowingTimelyRequest',priorReasonsRequest:'timelyEstablished'}),suite).outcome,'datedResearchValue');
  for(const priorReasonsRequest of ['late','unknown',null])assert.equal(evaluate(input(p,{openingOrigin:'reasonedFollowingTimelyRequest',priorReasonsRequest}),suite).reason,'priorReasonsRequestNotEstablished');
});
test('OW actual 2027 source boundary is tracked across the whole counted and paused run',()=>{
  const r=evaluate({path:'OW-ADMIN-20',trigger:'2026-12-10',days:20},suite);
  assert.deepEqual(r.temporalBindings,['OW-STVG-1917','OW-STVG-2031']);
  const changed=structuredClone(suite);changed.temporalBindings.OW.pop();
  assert.throws(()=>evaluate({path:'OW-ADMIN-20',trigger:'2026-12-10',days:20},changed),/temporal binding/);
});
test('Covered receipt alone does not authorise a run extending beyond the window',()=>{
  const r=evaluate({path:'NW-ADMIN-ORDERED',trigger:'2027-12-31',days:1},suite);
  assert.equal(r.outcome,'researchWindowBoundary');assert.equal(Object.hasOwn(r,'end'),false);
});
test('OW Bruderklaus and NW Josefstag are not unioned across cantons',()=>{
  assert.equal(holidays('OW-PROCESS',2026,suite).has('2026-09-25'),true);
  assert.equal(holidays('NW-PROCESS',2026,suite).has('2026-09-25'),false);
  assert.equal(holidays('NW-PROCESS',2027,suite).has('2027-03-19'),true);
  assert.equal(holidays('OW-PROCESS',2027,suite).has('2027-03-19'),false);
});
test('Practice arithmetic stays separate from the product window and release approval',()=>{
  const probe=suite.isolatedPracticeProbes[0],r=evaluateIsolatedPractice(probe,suite);
  assert.equal(r.end,'2024-08-26');assert.equal(r.skippedDays,32);assert.equal(r.isolatedPracticeOnly,true);assert.equal(r.normReleaseApproval,false);
  assert.equal(evaluate(probe,suite).outcome,'researchWindowBoundary');
  assert.throws(()=>evaluateIsolatedPractice({...probe,productScope:true},suite));
});

async function fixture(t,change){
  const dir=await mkdtemp(join(tmpdir(),'ap23h1-reference-test-'));
  t.after(()=>rm(dir,{recursive:true,force:true}));
  const copy=structuredClone(suite);change(copy);const file=join(dir,'references.json');await writeFile(file,JSON.stringify(copy));
  return file;
}
for(const [name,change,pattern]of [
  ['runtime activation',s=>s.runtimeActive=true,/runtimeActive/],
  ['duplicate path',s=>s.paths[1].id=s.paths[0].id,/strict|Expected|actual/i],
  ['duplicate case',s=>s.cases[1].id=s.cases[0].id,/strict|Expected|actual/i],
  ['wrong path inventory',s=>s.expectedPathCount++,/strict|Expected|actual/i],
  ['missing explicit expectation',s=>delete s.cases[0].expected,/explicit expected/],
  ['unknown expected outcome',s=>s.cases[0].expected.outcome='greenEnough',/Unknown expected/],
  ['missing dated end',s=>delete s.cases[0].expected.end,/explicit end/],
  ['boundary carrying end',s=>s.cases.find(c=>c.expected.outcome==='researchWindowBoundary').expected.end='2027-01-01',/must not carry/],
  ['calendar source tamper',s=>s.calendarBaselines[0].sha256='0'.repeat(64),/SHA|ap22-ow/],
  ['missing positive group',s=>s.cases=s.cases.filter(c=>c.path!=='NW-COURT-VERNEHMLASSUNG-20'),/Missing positive/]
])test('Checker rejects '+name,async t=>{
  const file=await fixture(t,change);await assert.rejects(runReferences({fixturePath:file}),pattern);
});
test('A wrong static expected date yields a red comparison, never a silent rewrite',async t=>{
  const file=await fixture(t,s=>s.cases[0].expected.end='2026-10-23');
  const{report}=await runReferences({fixturePath:file});
  assert.equal(report.status,'discrepancies');assert.ok(report.discrepancies.some(d=>d.id==='B01'&&d.key==='end'));
});
