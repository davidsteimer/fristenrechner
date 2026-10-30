// SPDX-License-Identifier: AGPL-3.0-only
// These mutations test a research checker, not a running application or a legal approval.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {evaluate,holidays,runReferences} from '../../scripts/check-ap23k1-references.mjs';

function sample(){
  const facts={authorityLevel:'cantonal',specialLaw:'excluded',unit:'day',openingQualified:true};
  const base={days:10,minimumDays:1,suspension:'none',opening:'qualifiedLegalOpening',requirements:[],syntheticFacts:{},
    calendarBinding:{type:'fixed',calendar:'BS'}};
  const calendar={fixed:['01-01','05-01','08-01','12-25','12-26'],easterOffsets:[-2,1,39,50]};
  return{window:{from:'2026-08-29',to:'2027-12-31'},easter:{2026:'2026-04-05',2027:'2027-03-28'},
    sharedSyntheticFacts:facts,sharedRequirements:Object.entries(facts).map(([key,value])=>({key,value,reason:key+'NotQualified'})),
    temporalBindings:{BS:[{id:'BS-K1',from:'2026-08-29',to:'2027-12-31'}],BL:[{id:'BL-K1',from:'2026-08-29',to:'2027-12-31'}]},
    calendars:{BS:structuredClone(calendar),BL:structuredClone(calendar),PARTY:{...structuredClone(calendar),fixed:[...calendar.fixed,'12-08']}},
    officeClosures:{BL:{dates:['2026-12-24','2026-12-28','2026-12-29','2026-12-30','2026-12-31',
      '2027-03-25','2027-05-07','2027-12-24','2027-12-27','2027-12-28','2027-12-29','2027-12-30','2027-12-31'],
      uncertainty:{fact:'optionalOfficeClosure',dates:['2027-02-09'],reason:'K1-BL-OPTIONAL-CLOSURE'}}},
    paths:[{...structuredClone(base),id:'bs-registration',canton:'BS'},
      {...structuredClone(base),id:'bs-reasons',canton:'BS',days:30},
      {...structuredClone(base),id:'bs-court',canton:'BS',calendarBinding:{type:'fact',fact:'holidayCalendar',allowed:['BS','PARTY']},
        syntheticFacts:{holidayCalendar:'BS'}},
      {...structuredClone(base),id:'bl-admin',canton:'BL',calendarBinding:{type:'fixed',calendar:'BL'},officeClosure:'BL',syntheticFacts:{optionalOfficeClosure:'notApplicable'}},
      {...structuredClone(base),id:'bl-objection',canton:'BL',days:5,calendarBinding:{type:'fixed',calendar:'BL'},officeClosure:'BL',syntheticFacts:{optionalOfficeClosure:'notApplicable'}},
      {...structuredClone(base),id:'bl-granted',canton:'BL',days:null,calendarBinding:{type:'fixed',calendar:'BL'},officeClosure:'BL',
        syntheticFacts:{optionalOfficeClosure:'notApplicable',granted:true},requirements:[{key:'granted',value:true,reason:'extensionNotGranted'}]}]};
}
const input=(extra={})=>({path:'bs-registration',trigger:'2026-10-02',days:10,...extra});

test('ordinary counting starts the following day and includes intermediate weekends',()=>{
  const result=evaluate(input(),sample());assert.equal(result.ordinaryStart,'2026-10-03');assert.equal(result.end,'2026-10-12');
});
test('BS registration and reasons count independently from the same opening',()=>{
  const suite=sample();assert.equal(evaluate(input(),suite).end,'2026-10-12');
  assert.equal(evaluate(input({path:'bs-reasons',days:30}),suite).end,'2026-11-02');
  assert.equal(evaluate(input({path:'bs-reasons',trigger:'2026-10-12',days:30}),suite).end,'2026-11-11');
});
test('BS no ordinary December recess and no imported BL office closure',()=>{
  assert.equal(evaluate(input({trigger:'2026-12-14'}),sample()).end,'2026-12-24');
});
test('BL fixed whole-day closure extends the end, not the count inside the deadline',()=>{
  const result=evaluate(input({path:'bl-admin',trigger:'2026-12-14'}),sample());
  assert.equal(result.nominalEnd,'2026-12-24');assert.equal(result.end,'2027-01-04');
  assert.deepEqual(result.officeClosureDays,['2026-12-24','2026-12-28','2026-12-29','2026-12-30','2026-12-31']);
});
test('BL Maundy Thursday 2027 whole closure chains through the Easter weekend',()=>{
  const result=evaluate(input({path:'bl-admin',trigger:'2027-03-15'}),sample());
  assert.equal(result.nominalEnd,'2027-03-25');assert.equal(result.end,'2027-03-30');
});
test('BL post-Ascension whole closure is separate from the statutory holiday',()=>{
  const suite=sample();assert.equal(holidays('BL',2027,suite).has('2027-05-07'),false);
  assert.equal(evaluate(input({path:'bl-admin',trigger:'2027-04-27'}),suite).end,'2027-05-10');
});
test('unknown optional whole closure is a boundary only when the final answer differs',()=>{
  const result=evaluate(input({path:'bl-objection',trigger:'2027-02-04',days:5,facts:{optionalOfficeClosure:'unknown'}}),sample());
  assert.equal(result.reason,'K1-BL-OPTIONAL-CLOSURE');assert.equal(result.endWithoutOptionalClosure,'2027-02-09');
  assert.equal(result.endWithOptionalClosure,'2027-02-10');assert.equal(Object.hasOwn(result,'end'),false);
});
test('an uncertain office day in the middle does not pause the clock or block a later end',()=>{
  const result=evaluate(input({path:'bl-objection',trigger:'2027-02-06',days:5,facts:{optionalOfficeClosure:'unknown'}}),sample());
  assert.equal(result.end,'2027-02-11');
});
for(const[mode,end]of[['confirmedOpen','2027-02-09'],['notApplicable','2027-02-09'],['confirmedClosed','2027-02-10']])
  test('qualified optional-office mode '+mode,()=>assert.equal(evaluate(input({path:'bl-objection',trigger:'2027-02-04',days:5,facts:{optionalOfficeClosure:mode}}),sample()).end,end));
for(const mode of[null,false,'automatic','halfDay'])test('unqualified office mode does not silently mean open '+mode,()=>{
  assert.equal(evaluate(input({path:'bl-admin',facts:{optionalOfficeClosure:mode}}),sample()).reason,'officeClosureNotQualified');
});
test('half a day alone is not inserted into full-day closures',()=>{
  const suite=sample();assert.equal(suite.officeClosures.BL.dates.includes('2027-02-08'),false);
});
test('fact-bound holiday anchor has no implicit BS fallback',()=>{
  const result=evaluate(input({path:'bs-court',facts:{holidayCalendar:null}}),sample());
  assert.equal(result.reason,'holidayAnchorNotQualified');assert.equal(Object.hasOwn(result,'end'),false);
});
test('different qualified anchor can change the end but is never freely united',()=>{
  const suite=sample();suite.paths.find(path=>path.id==='bs-court').days=null;
  assert.equal(evaluate(input({path:'bs-court',trigger:'2026-12-07',days:1,facts:{holidayCalendar:'BS'}}),suite).end,'2026-12-08');
  assert.equal(evaluate(input({path:'bs-court',trigger:'2026-12-07',days:1,facts:{holidayCalendar:'PARTY'}}),suite).end,'2026-12-09');
});
test('pending request does not become a granted new day deadline',()=>{
  assert.equal(evaluate(input({path:'bl-granted',facts:{granted:false}}),sample()).reason,'extensionNotGranted');
});
for(const date of['2026-08-28','2027-12-31','2028-01-01'])test('full chain, not only receipt, must fit the window '+date,()=>{
  const result=evaluate(input({trigger:date}),sample());assert.equal(result.outcome,'researchWindowBoundary');assert.equal(Object.hasOwn(result,'end'),false);
});
test('end-shift beyond 2027 remains outside even if nominal end fits',()=>{
  const result=evaluate(input({path:'bl-admin',trigger:'2027-12-20'}),sample());assert.equal(result.outcome,'researchWindowBoundary');
});
for(const date of['2026-02-30','2026-13-01','2026-1-1','02.10.2026','',null])test('invalid date is not coerced '+date,()=>{
  assert.equal(evaluate(input({trigger:date}),sample()).reason,'invalidResearchDate');
});
for(const days of[0,-1,1.5,true,null,'10',NaN,Infinity])test('invalid duration is not coerced '+days,()=>{
  assert.equal(evaluate(input({days}),sample()).reason,'dayDurationNotSpecified');
});
test('huge safe integer duration is a clean window boundary, not date overflow',()=>{
  const suite=sample();suite.paths[0].days=null;assert.equal(evaluate(input({days:Number.MAX_SAFE_INTEGER}),suite).outcome,'researchWindowBoundary');
});
test('fixed statutory duration cannot be overridden',()=>assert.equal(evaluate(input({days:9}),sample()).reason,'statutoryDurationMismatch'));
test('unknown case fact rejected',()=>assert.equal(evaluate(input({facts:{invented:true}}),sample()).reason,'unknownResearchFact'));
test('unknown path rejected',()=>assert.equal(evaluate(input({path:'other'}),sample()).reason,'unknownResearchPath'));
for(const key of Object.keys(sample().sharedSyntheticFacts))test('current case qualification required '+key,()=>{
  assert.equal(evaluate(input({facts:{[key]:null}}),sample()).reason,key+'NotQualified');
});
test('missing temporal binding fails closed',()=>{const suite=sample();suite.temporalBindings.BS=[];assert.throws(()=>evaluate(input(),suite),/temporal binding/);});
test('ambiguous temporal binding fails closed',()=>{
  const suite=sample();suite.temporalBindings.BS.push(...suite.temporalBindings.BS);assert.throws(()=>evaluate(input(),suite),/temporal binding/);
});
test('new year shift verifies both year segments, not only start',()=>{
  const suite=sample();suite.temporalBindings.BL=[{id:'only2026',from:'2026-08-29',to:'2026-12-31'}];
  assert.throws(()=>evaluate(input({path:'bl-admin',trigger:'2026-12-14'}),suite),/temporal binding/);
});
test('unexpected recess policy rejected, never imported from another canton',()=>{
  const suite=sample();suite.paths[0].suspension='three';assert.throws(()=>evaluate(input(),suite),/general recess/);
});
test('unexpected service-fiction policy rejected',()=>{
  const suite=sample();suite.paths[0].opening='postalFiction';assert.throws(()=>evaluate(input(),suite),/service fiction/);
});
test('actual bound research fixture has consistent static expectations',async()=>{
  const{suite,report}=await runReferences();assert.equal(report.status,'passedResearchComparison');assert.deepEqual(report.discrepancies,[]);
  assert.ok(suite.cases.length>=30);assert.ok(report.handSpecifiedReferences>=30);
  assert.ok(report.calendarComparisons.length>=4);
});
test('actual fixture never fills a missing current fact from a default',async()=>{
  const{suite}=await runReferences();
  for(const path of suite.paths){
    const original=suite.cases.find(row=>row.path===path.id&&row.expected.outcome==='datedResearchValue');assert.ok(original);
    for(const requirement of[...suite.sharedRequirements,...path.requirements]){
      const altered=structuredClone(original);delete altered.facts[requirement.key];
      const result=evaluate(altered,suite);assert.equal(result.outcome,'qualificationBoundaryProposed',path.id+'/'+requirement.key);
      assert.equal(Object.hasOwn(result,'end'),false);
    }
  }
});
test('actual BS court crossing binds both VwVG versions without importing them into internal procedure',async()=>{
  const{report}=await runReferences();
  assert.deepEqual(report.results.find(row=>row.id==='K1-BS-R33').actual.temporalBindings,['BS-VWVG-2026','BS-VWVG-2027']);
  assert.deepEqual(report.results.find(row=>row.id==='K1-BS-R07').actual.temporalBindings,['BS-ADMIN-WINDOW']);
});
async function mutatedFixture(change,check){
  const folder=await mkdtemp('/private/tmp/ap23k1-reference-mutation-');
  try{
    const suite=JSON.parse(await readFile('docs/fachrecht/ap23k1/referenzfaelle.json','utf8'));change(suite);
    const path=join(folder,'fixture.json');await writeFile(path,JSON.stringify(suite));await check(path);
  }finally{await rm(folder,{recursive:true,force:true});}
}
test('raw model hash mutation is detected before comparison',async()=>{
  await mutatedFixture(suite=>suite.sourceModels[0].sha256='0'.repeat(64),async path=>assert.rejects(runReferences({fixturePath:path}),/Source-model bytes/));
});
test('static analyst expectation cannot be silently replaced',async()=>{
  await mutatedFixture(suite=>suite.cases[0].analystExpected.end='2026-10-13',async path=>assert.rejects(runReferences({fixturePath:path}),/Changed static expectation/));
});
test('case facts cannot be changed under an unchanged analyst provenance',async()=>{
  await mutatedFixture(suite=>suite.cases[0].facts.openingMode='invented',async path=>assert.rejects(runReferences({fixturePath:path}),/Changed analyst reference/));
});
test('mutated calendar reference hash is detected',async()=>{
  await mutatedFixture(suite=>suite.calendarBaselines[0].sha256='0'.repeat(64),async path=>assert.rejects(runReferences({fixturePath:path}),/Calendar baseline bytes/));
});
test('mutated effective holiday set does not quietly reuse an old raw calendar',async()=>{
  await mutatedFixture(suite=>suite.calendars.BS.fixed.push('12-08'),async path=>assert.rejects(runReferences({fixturePath:path}),/holiday projection differs/));
});
test('both research checkers avoid application modules and generators',async()=>{
  for(const path of['scripts/check-ap23k1-references.mjs','scripts/check-ap23k1-references.py']){
    const source=await readFile(path,'utf8');assert.equal(/(?:from\s+['"][^'"]*(?:src\/|spfx\/)|import\s*\([^)]*(?:src\/|spfx\/))/.test(source),false);
  }
});
