// SPDX-License-Identifier: AGPL-3.0-only
// Tests of a research checker, not of the released application.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluate,holidays,suspended,runReferences} from '../../scripts/check-ap23i1-references.mjs';

function sample(){
  const common={authorityLevel:'cantonal',specialLaw:'excluded',service:'knownLegalTrigger',unit:'day',direction:'forward'};
  return{window:{from:'2026-08-29',to:'2027-12-31'},easter:{2026:'2026-04-05',2027:'2027-03-28'},
    sharedSyntheticFacts:common,sharedRequirements:Object.entries(common).map(([key,value])=>({key,value,reason:key+'NotQualified'})),
    temporalBindings:{GL:[{id:'GL-RESEARCH',from:'2026-08-29',to:'2027-12-31'}],TG:[{id:'TG-RESEARCH',from:'2026-08-29',to:'2027-12-31'}]},
    calendars:{GL:{fixed:['01-01','08-01','11-01','12-25','12-26'],easterOffsets:[-2,1,39,50],naefelserFahrt:true},
      TG:{fixed:['01-01','01-02','05-01','08-01','12-25','12-26'],easterOffsets:[-2,1,39,50]}},
    paths:[{id:'test-statutory',canton:'GL',stage:'test',days:10,calendar:'GL',suspension:'three',endShiftCollision:'proposedBoundary',syntheticFacts:{},requirements:[]},
      {id:'test-ordered',canton:'GL',stage:'test',days:null,calendar:'GL',suspension:'none',endShiftCollision:'proposedBoundary',syntheticFacts:{},requirements:[]},
      {id:'test-notice',canton:'TG',stage:'test',days:5,calendar:'TG',suspension:'tgNotice',endShiftCollision:'proposedBoundary',syntheticFacts:{exceptionNotice:'given'},requirements:[]},
      {id:'test-shortened',canton:'TG',stage:'test',days:null,minimumDays:5,maximumDays:29,calendar:'TG',suspension:'none',endShiftCollision:'proposedBoundary',syntheticFacts:{shorteningEstablished:true},requirements:[{key:'shorteningEstablished',value:true,reason:'shorteningNotEstablished'}]}]};
}
const input=(overrides={})=>({path:'test-statutory',trigger:'2026-10-02',days:10,...overrides});

test('ordinary follow-day ten-day research count',()=>{
  const r=evaluate(input(),sample());assert.equal(r.end,'2026-10-12');assert.equal(r.ordinaryStart,'2026-10-03');assert.equal(r.firstCountedDay,'2026-10-03');
});
test('intermediate weekends count, nominal Sunday shifts to Monday',()=>{
  const r=evaluate(input({days:10,trigger:'2026-10-01'}),sample());assert.equal(r.nominalEnd,'2026-10-11');assert.equal(r.end,'2026-10-12');
});
test('GL statutory winter pause, ten days',()=>assert.equal(evaluate(input({trigger:'2026-12-10'}),sample()).end,'2027-01-05'));
test('GL ordered daily deadline is not automatically paused',()=>{
  const r=evaluate(input({path:'test-ordered',trigger:'2026-12-10',days:10}),sample());assert.equal(r.end,'2026-12-21');assert.equal(r.skippedDays,0);
});
test('opening during winter has first counted day January three',()=>{
  const r=evaluate(input({trigger:'2026-12-20'}),sample());assert.equal(r.firstCountedDay,'2027-01-03');assert.equal(r.end,'2027-01-12');
});
test('GL Fahrt 2026 is shifted out of Holy Thursday',()=>{
  const dates=holidays('GL',2026,sample());assert.ok(dates.has('2026-04-09'));assert.equal(dates.has('2026-04-02'),false);
});
test('GL Fahrt 2027 is first Thursday without Easter displacement',()=>{
  const dates=holidays('GL',2027,sample());assert.ok(dates.has('2027-04-01'));assert.equal(dates.has('2027-04-08'),false);
});
test('GL ordered end on Fahrt shifts once, not through judicial holidays',()=>{
  const r=evaluate(input({path:'test-ordered',trigger:'2027-03-31',days:1}),sample());assert.equal(r.end,'2027-04-02');
});
test('GL does not invent January two or May one',()=>{
  const dates=holidays('GL',2027,sample());assert.equal(dates.has('2027-01-02'),false);assert.equal(dates.has('2027-05-01'),false);
});
test('TG includes January two and May one',()=>{
  const dates=holidays('TG',2027,sample());assert.ok(dates.has('2027-01-02'));assert.ok(dates.has('2027-05-01'));
});
test('TG existing exception notice means no pause in designated exception group',()=>{
  const r=evaluate(input({path:'test-notice',trigger:'2026-12-14',days:5}),sample());assert.equal(r.end,'2026-12-21');assert.equal(r.suspension,'none');
});
test('TG fully absent notice restores holidays only in designated group',()=>{
  const r=evaluate(input({path:'test-notice',trigger:'2026-12-14',days:5,facts:{exceptionNotice:'absent'}}),sample());assert.equal(r.end,'2027-01-04');assert.equal(r.suspension,'three');
});
for(const notice of['unclear','incomplete','disputed',null,false,0])test('TG unqualified notice cannot receive a definite end '+notice,()=>{
  const r=evaluate(input({path:'test-notice',days:5,facts:{exceptionNotice:notice}}),sample());assert.equal(r.reason,'exceptionNoticeUnresolved');assert.equal(Object.hasOwn(r,'end'),false);
});
test('no notice fact changes an ordinary non-conditional path',()=>{
  const r=evaluate(input({facts:{exceptionNotice:'absent'}}),sample());assert.equal(r.suspension,'three');assert.equal(r.end,'2026-10-12');
});
test('shortened deadline uses actual established duration, not automatic five',()=>{
  const r=evaluate(input({path:'test-shortened',days:7}),sample());assert.equal(r.end,'2026-10-09');
});
for(const days of[1,4,30,99])test('shortened duration outside established legal range '+days,()=>{
  const r=evaluate(input({path:'test-shortened',days}),sample());assert.equal(r.reason,'durationOutsideQualifiedRange');assert.equal(Object.hasOwn(r,'end'),false);
});
for(const value of[false,null,'true',0])test('shortening requires explicit current fact '+value,()=>{
  assert.equal(evaluate(input({path:'test-shortened',days:7,facts:{shorteningEstablished:value}}),sample()).reason,'shorteningNotEstablished');
});
for(const days of[0,-1,1.5,true,null,'10',NaN,Infinity])test('invalid duration is not coerced '+days,()=>{
  assert.equal(evaluate(input({days}),sample()).reason,'dayDurationNotSpecified');
});
test('fixed statutory duration cannot be overridden',()=>assert.equal(evaluate(input({days:9}),sample()).reason,'statutoryDurationMismatch'));
test('pure end shift into new holidays has no definite research end',()=>{
  const r=evaluate(input({trigger:'2027-03-10'}),sample());assert.equal(r.outcome,'unresolvedBoundaryProposed');assert.equal(r.nominalEnd,'2027-03-20');assert.equal(r.ordinaryShiftEnd,'2027-03-22');assert.equal(Object.hasOwn(r,'end'),false);
});
test('count genuinely entering holidays is not a pure end collision',()=>{
  const r=evaluate(input({trigger:'2027-03-19'}),sample());assert.equal(r.end,'2027-04-13');assert.equal(r.skippedDays,15);
});
for(const date of['2026-08-28','2027-12-31','2028-01-01'])test('full-window requirement '+date,()=>{
  const r=evaluate(input({trigger:date}),sample());assert.equal(r.outcome,'researchWindowBoundary');assert.equal(Object.hasOwn(r,'end'),false);
});
for(const date of['2026-02-30','26.10.2026','2026-13-01','2026-1-1','',null])test('invalid ISO date is not normalised '+date,()=>assert.equal(evaluate(input({trigger:date}),sample()).reason,'invalidResearchDate'));
test('unknown research path rejected',()=>assert.equal(evaluate(input({path:'missing'}),sample()).reason,'unknownResearchPath'));
test('unknown case fact rejected',()=>assert.equal(evaluate(input({facts:{pretendShortcut:true}}),sample()).reason,'unknownResearchFact'));
test('explicit allowed-value alternatives are scalar case facts, not arrays',()=>{
  const s=sample();s.paths[0].requirements.push({key:'ground',oneOf:['A','B'],reason:'groundUnqualified'});s.paths[0].syntheticFacts.ground='A';
  assert.equal(evaluate(input({facts:{ground:'B'}}),s).end,'2026-10-12');
  assert.equal(evaluate(input({facts:{ground:['A','B']}}),s).reason,'groundUnqualified');
});
test('empty allowed-value alternatives are invalid research definitions',()=>{
  const s=sample();s.paths[0].requirements.push({key:'ground',oneOf:[],reason:'groundUnqualified'});assert.throws(()=>evaluate(input(),s));
});
for(const[key,value]of Object.entries(sample().sharedSyntheticFacts))test('shared current qualification cannot be omitted '+key,()=>{
  const r=evaluate(input({facts:{[key]:null}}),sample());assert.equal(r.reason,key+'NotQualified');assert.equal(Object.hasOwn(r,'end'),false);
});
test('ambiguous temporal legal binding fails closed',()=>{
  const s=sample();s.temporalBindings.GL.push({...s.temporalBindings.GL[0],id:'conflict'});assert.throws(()=>evaluate(input(),s),/temporal binding/);
});
test('missing temporal legal binding fails closed',()=>{
  const s=sample();s.temporalBindings.GL=[];assert.throws(()=>evaluate(input(),s),/temporal binding/);
});
test('collision boundary also requires a complete temporal legal binding',()=>{
  const s=sample();s.temporalBindings.GL=[];assert.throws(()=>evaluate(input({trigger:'2027-03-10'}),s),/temporal binding/);
});
for(const policy of['misspelled',null,undefined,'notApplicable'])test('suspended path needs a valid explicit collision boundary '+policy,()=>{
  const s=sample();s.paths[0].endShiftCollision=policy;assert.throws(()=>evaluate(input({trigger:'2027-03-10'}),s),/collision/);
});
for(const mode of['none','three'])test('holiday boundaries inclusive '+mode,()=>{
  const s=sample();for(const date of['2027-03-21','2027-04-04','2027-07-15','2027-08-15','2026-12-18','2027-01-02'])assert.equal(suspended(date,mode,s),mode==='three');
});
test('dates just outside holiday boundaries count',()=>{
  const s=sample();for(const date of['2027-03-20','2027-04-05','2027-07-14','2027-08-16','2026-12-17','2027-01-03'])assert.equal(suspended(date,'three',s),false);
});
test('unknown suspension mode rejected',()=>assert.throws(()=>suspended('2027-01-01','invented',sample())));
test('actual research fixture and all static expectations pass without product imports',async()=>{
  const {suite,report}=await runReferences();assert.equal(report.status,'passedResearchComparison');assert.deepEqual(report.discrepancies,[]);
  assert.equal(report.calendarComparisons.reduce((n,c)=>n+c.daysCompared,0),1460);
  for(const p of suite.paths)assert.ok(report.results.some(r=>r.path===p.id&&r.actual.outcome==='datedResearchValue'));
});
test('research source has no imports from product core or product data generators',async()=>{
  for(const path of['scripts/check-ap23i1-references.mjs','scripts/check_ap23i1_independent.py']){
    const text=await readFile(path,'utf8');assert.equal(/(?:from\s+['"][^'"]*(?:src\/|spfx\/)|import\s*\([^)]*(?:src\/|spfx\/))/.test(text),false);
  }
});
