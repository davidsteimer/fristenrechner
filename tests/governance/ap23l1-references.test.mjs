// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluate,validDate,holidays,paused,runReferences} from '../../scripts/check-ap23l1-references.mjs';
const opening={modeFact:'openingMode',qualifiedValue:'qualifiedLegalOpening',trackingValue:'trackingPhysicalReceipt',expectedServiceFact:'expectedService'};
const base={id:'AI',canton:'AI',days:null,minimumDays:1,suspension:'none',calendarBinding:{type:'fixed',calendar:'AI'},
 requirements:[{key:'scope',value:'cantonal',reason:'scopeNotQualified'}],opening};
const suite={window:{from:'2026-08-29',to:'2027-12-31'},calendars:{AI:{fixed:['01-01','08-01','09-22','11-01','12-08','12-25'],
 easterOffsets:[-2,0,1,39,49,50,60],federalFast:true,stephenAvoidThreeConsecutiveRestDays:true},
 SZ:{fixed:['01-01','01-06','03-19','08-01','08-15','11-01','11-11','12-08','12-25','12-26'],easterOffsets:[-2,0,1,39,49,50,60],federalFast:true}},
 paths:[base,{...base,id:'AI-COURT',suspension:'three'},
 {...base,id:'SZ',canton:'SZ',suspension:'szThree',calendarBinding:{type:'fixed',calendar:'SZ'},opening:undefined},
 {...base,id:'LONG',durationFact:'statedDays',durationBaseFact:'ordinaryDays',requirements:[...base.requirements,{key:'ordinaryDays',oneOf:[7,10,30],reason:'ordinaryPeriodUnknown'}]},
 {...base,id:'FIXED',days:7},
 {...base,id:'ANCHOR',calendarBinding:{type:'fact',fact:'anchor',allowed:['AI']}}]};
const item=(patch={})=>({id:'synthetic',path:'AI',trigger:'2026-10-02',days:7,facts:{scope:'cantonal',openingMode:'qualifiedLegalOpening'},...patch});
test('strict dates reject overflow and non-date values',()=>{
 for(const value of['2026-02-30','2026-9-01','02.10.2026',null,undefined,20261002])assert.equal(validDate(value),false);
 assert.equal(validDate('2026-10-02'),true);
});
test('no missing case fact is inferred from a path',()=>assert.deepEqual(evaluate(item({facts:{}}),suite),{outcome:'qualificationBoundaryProposed',reason:'scopeNotQualified'}));
test('unknown fact is not ignored',()=>assert.equal(evaluate(item({facts:{scope:'cantonal',openingMode:'qualifiedLegalOpening',invented:true}}),suite).reason,'unknownResearchFact'));
test('duration is not coerced from text or fraction',()=>{
 for(const days of['7',0,-1,1.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1])assert.equal(evaluate(item({days}),suite).reason,'dayDurationNotSpecified');
});
test('statutory duration cannot be freely overridden',()=>assert.equal(evaluate(item({path:'FIXED',days:8}),suite).reason,'statutoryDurationMismatch'));
test('actual longer notice has an independently qualified base',()=>{
 assert.equal(evaluate(item({path:'LONG',days:45,facts:{scope:'cantonal',openingMode:'qualifiedLegalOpening',ordinaryDays:30,statedDays:45}}),suite).end,'2026-11-16');
 assert.equal(evaluate(item({path:'LONG',days:45,facts:{scope:'cantonal',openingMode:'qualifiedLegalOpening',ordinaryDays:30,statedDays:40}}),suite).reason,'noticeDurationNotQualified');
 assert.equal(evaluate(item({path:'LONG',days:30,facts:{scope:'cantonal',openingMode:'qualifiedLegalOpening',ordinaryDays:30,statedDays:30}}),suite).reason,'noticeDurationNotQualified');
});
test('Saturday qualified opening is not rebased',()=>{
 const actual=evaluate(item({trigger:'2026-10-03',days:1}),suite);assert.equal(actual.legalOpening,'2026-10-03');assert.equal(actual.ordinaryStart,'2026-10-04');assert.equal(actual.end,'2026-10-05');
});
test('tracking Saturday is rebased only with explicit expected service',()=>{
 const facts={scope:'cantonal',openingMode:'trackingPhysicalReceipt',expectedService:true};
 const actual=evaluate(item({trigger:'2026-10-03',days:1,facts}),suite);assert.equal(actual.legalOpening,'2026-10-05');assert.equal(actual.end,'2026-10-06');
 assert.equal(evaluate(item({trigger:'2026-10-03',facts:{...facts,expectedService:false}}),suite).reason,'trackingExpectedServiceNotQualified');
});
test('no unsupported postal/electronic mode is silently normalized',()=>assert.equal(evaluate(item({facts:{scope:'cantonal',openingMode:'unknownPlatform'}}),suite).reason,'openingModeUnqualified'));
test('AI Mauritius affects qualified tracking opening and final day, not interior day counting',()=>{
 const tracking=evaluate(item({trigger:'2026-09-22',days:1,facts:{scope:'cantonal',openingMode:'trackingPhysicalReceipt',expectedService:true}}),suite);
 assert.equal(tracking.legalOpening,'2026-09-23');assert.equal(tracking.end,'2026-09-24');
 assert.equal(evaluate(item({trigger:'2026-09-21',days:1}),suite).end,'2026-09-23');
 assert.equal(evaluate(item({trigger:'2026-09-21',days:2}),suite).skippedDays,0);
});
test('AI and SZ winter recesses are different',()=>{
 assert.equal(paused('2027-01-04','three'),false);assert.equal(paused('2027-01-04','szThree'),true);
 assert.equal(evaluate(item({path:'AI-COURT',trigger:'2026-12-17',days:1}),suite).end,'2027-01-04');
 assert.equal(evaluate(item({path:'SZ',trigger:'2026-12-17',days:1}),suite).end,'2027-01-08');
});
test('court recess applies to a short AI deadline unless a different qualified path says otherwise',()=>assert.equal(evaluate(item({path:'AI-COURT',trigger:'2026-12-17',days:7}),suite).end,'2027-01-11'));
test('endshift into a new recess is a visible boundary, not an invented definitive end',()=>{
 const actual=evaluate(item({path:'AI-COURT',trigger:'2027-03-13',days:7}),suite);
 assert.deepEqual(actual,{outcome:'unresolvedBoundaryProposed',reason:'L1-END-SUSPENSION',nominalEnd:'2027-03-20',ordinaryShiftEnd:'2027-03-22',firstSuspendedShiftDate:'2027-03-21'});
 assert.equal(Object.hasOwn(actual,'end'),false);
});
test('AI Stephanstag preserves the accepted statutory exception',()=>{
 assert.equal(holidays('AI',2026,suite).has('2026-12-26'),false);
 assert.equal(holidays('AI',2027,suite).has('2027-12-26'),true);
 assert.equal(holidays('AI',2028,suite).has('2028-12-26'),false);
});
test('SZ Schwyz calendar includes Martinstag only in the explicit research binding',()=>{
 assert.equal(holidays('SZ',2026,suite).has('2026-11-11'),true);assert.equal(holidays('AI',2026,suite).has('2026-11-11'),false);
});
test('missing or foreign calendar anchor has no canton fallback',()=>{
 assert.equal(evaluate(item({path:'ANCHOR'}),suite).reason,'holidayAnchorNotQualified');
 assert.equal(evaluate(item({path:'ANCHOR',facts:{scope:'cantonal',openingMode:'qualifiedLegalOpening',anchor:'BE'}}),suite).reason,'holidayAnchorNotQualified');
});
test('trigger, all count days, opening rebase and full endshift remain inside the window',()=>{
 for(const trigger of['2026-08-28','2028-01-01','2027-12-31'])assert.deepEqual(evaluate(item({trigger,days:1}),suite),{outcome:'researchWindowBoundary',reason:'outsideReferenceWindow'});
 assert.equal(evaluate(item({path:'SZ',trigger:'2027-12-17',days:1}),suite).outcome,'researchWindowBoundary');
});
test('fresh combined analyst fixture passes without importing product code',async()=>{
 const result=await runReferences();assert.equal(result.discrepancies.length,0);assert.equal(result.productImports,false);
 assert.equal(result.legalApproval,false);assert.equal(result.exportTest,false);assert.ok(result.paths>0);assert.ok(result.cases>result.paths);
});
test('checker and independent oracle have no product imports',async()=>{
 for(const path of['scripts/check-ap23l1-references.mjs','scripts/check_ap23l1_independent.py']){
  const source=await readFile(new URL('../../'+path,import.meta.url),'utf8');
  assert.doesNotMatch(source,/(?:from|import\s*\()\s*['"](?:\.\.\/)+(?:src|spfx|data)\//u);
 }
});
