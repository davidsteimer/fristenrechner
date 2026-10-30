// SPDX-License-Identifier: AGPL-3.0-only
// Research arithmetic and fail-closed qualification, not an application acceptance test.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluate,holidays,suspended,runReferences} from '../../scripts/check-ap23j1-references.mjs';
function sample(){
  const common={authorityLevel:'cantonal',specialLaw:'excluded',unit:'day',direction:'forward'};
  return{window:{from:'2026-08-29',to:'2027-12-31'},easter:{2026:'2026-04-05',2027:'2027-03-28'},
    sharedSyntheticFacts:common,sharedRequirements:Object.entries(common).map(([key,value])=>({key,value,reason:key+'NotQualified'})),
    temporalBindings:{FR:[{id:'FR-BEFORE',from:'2026-08-29',to:'2026-09-30'},{id:'FR-AFTER',from:'2026-10-01',to:'2027-12-31'}],
      GE:[{id:'GE-RESEARCH',from:'2026-08-29',to:'2027-12-31'}],JU:[{id:'JU-RESEARCH',from:'2026-08-29',to:'2027-12-31'}]},
    calendars:{FR:{fixed:['01-01','01-02','08-01','08-15','11-01','12-08','12-25','12-26'],easterOffsets:[-2,0,1,39,49,50,60]},
      GE:{fixed:['01-01','08-01','12-25','12-31'],easterOffsets:[-2,1,39,50],genevaFast:true},
      JU:{fixed:['01-01','01-02','05-01','06-23','08-01','08-15','11-01','12-25'],easterOffsets:[-2,0,1,39,49,50,60]}},
    paths:[{id:'fr-admin',canton:'FR',days:10,calendar:'FR',suspension:'two',opening:'qualifiedLegalOpening',endShiftCollision:'proposedBoundary',syntheticFacts:{},requirements:[]},
      {id:'fr-court',canton:'FR',days:10,calendar:'FR',suspension:'three',opening:'qualifiedLegalOpening',endShiftCollision:'proposedBoundary',syntheticFacts:{},requirements:[]},
      {id:'ge-admin',canton:'GE',days:null,calendar:'GE',suspension:'none',opening:'geQualifiedOrOrdinaryPost',endShiftCollision:'notApplicable',syntheticFacts:{openingMode:'qualifiedLegalOpening'},requirements:[]},
      {id:'ju-first',canton:'JU',days:null,calendar:'JU',suspension:'none',opening:'qualifiedLegalOpening',endShiftCollision:'notApplicable',syntheticFacts:{},requirements:[]},
      {id:'ju-opposition',canton:'JU',days:10,calendar:'JU',suspension:'three',opening:'qualifiedLegalOpening',endShiftCollision:'proposedBoundary',syntheticFacts:{oppositionAvailable:true},requirements:[{key:'oppositionAvailable',value:true,reason:'oppositionUnavailable'}]}]};
}
const input=(extra={})=>({path:'fr-admin',trigger:'2026-10-02',days:10,...extra});
test('ordinary follow-day count includes intermediate weekend days',()=>{
  const a=evaluate(input(),sample());assert.equal(a.end,'2026-10-12');assert.equal(a.firstCountedDay,'2026-10-03');
});
test('FR general administrative path has no summer recess',()=>assert.equal(evaluate(input({trigger:'2027-07-10'}),sample()).end,'2027-07-20'));
test('FR Tribunal cantonal path has additional summer recess',()=>{
  const a=evaluate(input({path:'fr-court',trigger:'2027-07-10'}),sample());assert.equal(a.nominalEnd,'2027-08-21');assert.equal(a.end,'2027-08-23');assert.equal(a.skippedDays,32);
});
test('FR procedural holiday December eight is not inferred from a regional labour list',()=>{
  const s=sample();s.paths[0].days=null;assert.equal(evaluate(input({trigger:'2026-12-07',days:1}),s).end,'2026-12-09');
});
test('FR count crossing the October version change binds both versions',()=>{
  const a=evaluate(input({trigger:'2026-09-25'}),sample());assert.deepEqual(a.temporalBindings,['FR-BEFORE','FR-AFTER']);assert.equal(a.end,'2026-10-05');
});
test('GE physically received ordinary post Saturday is legally communicated Monday',()=>{
  const a=evaluate(input({path:'ge-admin',trigger:'2026-10-03',days:10,facts:{openingMode:'ordinaryPostPhysicalReceipt'}}),sample());
  assert.equal(a.legalOpening,'2026-10-05');assert.equal(a.ordinaryStart,'2026-10-06');assert.equal(a.end,'2026-10-15');assert.equal(a.openingShiftDays,2);
});
test('a separately qualified GE legal opening Saturday is not shifted a second time',()=>{
  const a=evaluate(input({path:'ge-admin',trigger:'2026-10-03',days:10}),sample());assert.equal(a.legalOpening,'2026-10-03');assert.equal(a.end,'2026-10-13');
});
test('GE 2027 August two is not an extra procedural holiday',()=>{
  const s=sample();assert.equal(holidays('GE',2027,s).has('2027-08-02'),false);
  const a=evaluate(input({path:'ge-admin',trigger:'2027-08-01',days:1,facts:{openingMode:'ordinaryPostPhysicalReceipt'}}),s);
  assert.equal(a.legalOpening,'2027-08-02');assert.equal(a.end,'2027-08-03');
});
test('GE qualified opening August one gives August two end, no second delay',()=>{
  assert.equal(evaluate(input({path:'ge-admin',trigger:'2027-08-01',days:1}),sample()).end,'2027-08-02');
});
test('GE Jeune is Thursday after first Sunday, not simply first Thursday',()=>{
  const s=sample();assert.ok(holidays('GE',2027,s).has('2027-09-09'));assert.equal(holidays('GE',2027,s).has('2027-09-02'),false);
});
test('GE ordinary-post opening is shifted over Jeune once before counting',()=>{
  const a=evaluate(input({path:'ge-admin',trigger:'2027-09-09',days:1,facts:{openingMode:'ordinaryPostPhysicalReceipt'}}),sample());
  assert.equal(a.legalOpening,'2027-09-10');assert.equal(a.nominalEnd,'2027-09-11');assert.equal(a.end,'2027-09-13');
});
for(const openingMode of[null,'unknown','electronic',false,0])test('GE unknown opening mode has no guessed result '+openingMode,()=>{
  const a=evaluate(input({path:'ge-admin',facts:{openingMode}}),sample());assert.equal(a.reason,'openingModeUnqualified');assert.equal(Object.hasOwn(a,'end'),false);
});
test('JU first-instance ordered path does not acquire opposition holidays',()=>{
  assert.equal(evaluate(input({path:'ju-first',trigger:'2026-12-20'}),sample()).end,'2026-12-30');
  assert.equal(evaluate(input({path:'ju-opposition',trigger:'2026-12-20'}),sample()).end,'2027-01-12');
});
test('JU June23 official holiday is included regardless of labour Sunday subset',()=>{
  assert.equal(evaluate(input({path:'ju-first',trigger:'2027-06-22',days:1}),sample()).end,'2027-06-24');
});
test('JU December26 is not added from another canton',()=>assert.equal(holidays('JU',2027,sample()).has('2027-12-26'),false));
test('opposition must currently be available',()=>assert.equal(evaluate(input({path:'ju-opposition',facts:{oppositionAvailable:false}}),sample()).reason,'oppositionUnavailable'));
for(const mode of['none','two','three'])test('inclusive seasonal boundaries '+mode,()=>{
  const s=sample();for(const date of['2027-03-21','2027-04-04','2026-12-18','2027-01-02'])assert.equal(suspended(date,mode,s),mode!=='none');
  for(const date of['2027-07-15','2027-08-15'])assert.equal(suspended(date,mode,s),mode==='three');
  for(const date of['2027-03-20','2027-04-05','2027-07-14','2027-08-16','2026-12-17','2027-01-03'])assert.equal(suspended(date,mode,s),false);
});
test('pure end shift into newly beginning recess is explicitly unresolved',()=>{
  const a=evaluate(input({trigger:'2027-03-10'}),sample());assert.equal(a.reason,'J1-END-SUSPENSION');assert.equal(a.nominalEnd,'2027-03-20');assert.equal(a.ordinaryShiftEnd,'2027-03-22');assert.equal(Object.hasOwn(a,'end'),false);
});
for(const date of['2026-08-28','2027-12-31','2028-01-01'])test('all dates, not only trigger, must fit the reference window '+date,()=>{
  const a=evaluate(input({trigger:date}),sample());assert.equal(a.outcome,'researchWindowBoundary');assert.equal(Object.hasOwn(a,'end'),false);
});
for(const date of['2026-02-30','2026-13-01','2026-1-1','02.10.2026','',null])test('invalid input date not normalised '+date,()=>assert.equal(evaluate(input({trigger:date}),sample()).reason,'invalidResearchDate'));
for(const days of[0,-1,1.5,true,null,'10',NaN,Infinity])test('invalid day duration not coerced '+days,()=>assert.equal(evaluate(input({days}),sample()).reason,'dayDurationNotSpecified'));
test('statutory duration cannot be overridden',()=>assert.equal(evaluate(input({days:9}),sample()).reason,'statutoryDurationMismatch'));
test('unknown case fact rejected',()=>assert.equal(evaluate(input({facts:{invented:true}}),sample()).reason,'unknownResearchFact'));
test('unknown path rejected',()=>assert.equal(evaluate(input({path:'other'}),sample()).reason,'unknownResearchPath'));
for(const[key]of Object.entries(sample().sharedSyntheticFacts))test('current shared fact cannot be omitted '+key,()=>{
  assert.equal(evaluate(input({facts:{[key]:null}}),sample()).reason,key+'NotQualified');
});
test('missing temporal coverage fails closed',()=>{const s=sample();s.temporalBindings.FR=[];assert.throws(()=>evaluate(input(),s),/temporal binding/);});
test('ambiguous temporal coverage fails closed',()=>{
  const s=sample();s.temporalBindings.FR.push({id:'ambiguous',from:'2026-10-01',to:'2027-12-31'});assert.throws(()=>evaluate(input(),s),/temporal binding/);
});
test('temporal coverage includes GE legal opening shift',()=>{
  const s=sample();s.temporalBindings.GE=[{id:'missing-opening',from:'2026-10-04',to:'2027-12-31'}];
  assert.throws(()=>evaluate(input({path:'ge-admin',trigger:'2026-10-03',facts:{openingMode:'ordinaryPostPhysicalReceipt'}}),s),/temporal binding/);
});
for(const policy of[null,undefined,'automatic','notApplicable'])test('suspended path requires explicit qualified collision policy '+policy,()=>{
  const s=sample();s.paths[0].endShiftCollision=policy;assert.throws(()=>evaluate(input(),s),/collision/);
});
test('actual research fixture and expectations agree without product imports',async()=>{
  const{suite,report}=await runReferences();assert.equal(report.status,'passedResearchComparison');assert.deepEqual(report.discrepancies,[]);
  assert.equal(report.calendarComparisons.reduce((n,c)=>n+c.daysCompared,0),2190);
  for(const p of suite.paths)assert.ok(report.results.some(r=>r.path===p.id&&r.actual.outcome==='datedResearchValue'));
});
test('research algorithms do not import runtime or product generators',async()=>{
  for(const path of['scripts/check-ap23j1-references.mjs','scripts/check_ap23j1_independent.py']){
    const text=await readFile(path,'utf8');assert.equal(/(?:from\s+['"][^'"]*(?:src\/|spfx\/)|import\s*\([^)]*(?:src\/|spfx\/))/.test(text),false);
  }
});
