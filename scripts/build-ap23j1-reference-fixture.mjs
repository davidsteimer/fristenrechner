// SPDX-License-Identifier: AGPL-3.0-only
// Compile research proposals and pre-established expectations, never derive expected dates from a calculator.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256} from './prepare-ap23j1.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=path=>readFile(resolve(root,path));
const baselinePaths={FR:'ap22-fr-7d8c38f7c610',GE:'ap22-ge-a36ff7926d08',JU:'ap22-ju-b096c09f506c'};
const suite={formatVersion:'ap23j1-research-references-1',asOf:'2026-10-27',runtimeActive:false,productTest:false,legalApproval:false,
  expectedPathCount:0,window:{from:'2026-08-29',to:'2027-12-31'},easter:{2026:'2026-04-05',2027:'2027-03-28'},
  sharedSyntheticFacts:{unit:'day',direction:'forward'},sharedRequirements:[
    {key:'unit',value:'day',reason:'J1-UNIT'},{key:'direction',value:'forward',reason:'J1-DIRECTION'}],
  sourceModels:[],temporalBindings:{
    FR:[{id:'FR-CPJA7947-LJ7926',from:'2026-08-29',to:'2026-09-30'},
      {id:'FR-CPJA8637-LJ7926',from:'2026-10-01',to:'2027-12-31'}],
    GE:[{id:'GE-LPA20250601-LJF19910101',from:'2026-08-29',to:'2027-12-31'}],
    JU:[{id:'JU-CPA-V8-HOLIDAYS20230101',from:'2026-08-29',to:'2027-12-31'}]},
  calendars:{},calendarBaselines:[],calendarProbes:[],paths:[],cases:[],
  interpretation:'Synthetic research case facts are explicit analyst assumptions, never user defaults. Source models retain complete original facts and explanations. Independent date checkers only assert the original outcome and any fixed expected dates. Diagnostic prose is retained separately, not silently reclassified as a product contract.'};
function assertRequirement(q){assert.ok(q&&typeof q==='object'&&typeof q.key==='string'&&q.key&&typeof q.reason==='string');
  if(Object.hasOwn(q,'oneOf'))assert.ok(Array.isArray(q.oneOf)&&q.oneOf.length&&q.oneOf.every(x=>x!==null&&typeof x!=='object'));
  else assert.ok(Object.hasOwn(q,'value')&&q.value!==null&&typeof q.value!=='object');return q;}
function defaultFact(q){return Object.hasOwn(q,'value')?q.value:q.oneOf[0];}
for(const canton of['FR','GE','JU']){
  const path='docs/fachrecht/ap23j1/befund-'+canton.toLowerCase()+'.json',raw=await read(path),model=JSON.parse(raw);
  assert.equal(model.workPackage,'AP23J1');assert.equal(model.canton,canton);
  suite.sourceModels.push({path,byteLength:raw.length,sha256:sha256(raw)});
  const calendarMapping={};let cantonSpec;
  for(const c of model.calendarProposals){
    let spec=c.ruleSpec;
    if(!spec){assert.ok(Array.isArray(c.holidayRules));spec={fixed:[],easterOffsets:[]};
      for(const r of c.holidayRules){if(/^\d\d-\d\d$/.test(r.rule))spec.fixed.push(r.rule);
        else{assert.match(r.rule,/^easter(?:[+-]\d+)?$/);spec.easterOffsets.push(Number(r.rule.slice(6)||0));}}
    }
    assert.ok(Array.isArray(spec.fixed)&&Array.isArray(spec.easterOffsets));
    const normalized={fixed:[...spec.fixed].sort(),easterOffsets:[...spec.easterOffsets].sort((a,b)=>a-b),...(spec.genevaFast?{genevaFast:true}:{})};
    const arithmeticID=canton+'-RESEARCH-ALL';calendarMapping[c.id]=arithmeticID;
    if(cantonSpec)assert.deepEqual(normalized,cantonSpec,'Distinct legal roles may share arithmetic only if independently proposed rules are identical');
    else{cantonSpec=normalized;suite.calendars[arithmeticID]=normalized;}
    if(spec.genevaFast&&typeof spec.genevaFast==='object')assert.deepEqual(spec.genevaFast,{month:9,firstIsoWeekday:7,offsetDays:4});
    const baseline='data/candidates/2026-10-22-ap23i3/calendars/'+baselinePaths[canton]+'.json';
    if(!suite.calendarBaselines.some(b=>b.calendar===arithmeticID))suite.calendarBaselines.push({calendar:arithmeticID,path:baseline,sha256:sha256(await read(baseline))});
  }
  for(const p of model.pathProposals){
    const own=p.qualificationRequirements??p.requirements;assert.ok(Array.isArray(own)&&own.every(q=>typeof q==='object'),'Formal path qualifications required '+p.id);
    const common=Array.isArray(model.commonRequirements)?model.commonRequirements:Object.entries(model.commonRequirements).map(([key,value])=>({key,value,reason:canton.toLowerCase()+'.'+key+'NotQualified'}));
    const byKey=new Map();
    for(const q of[...common,...own]){assertRequirement(q);if(byKey.has(q.key)){
      const old=byKey.get(q.key);assert.deepEqual(Object.hasOwn(old,'oneOf')?old.oneOf:old.value,Object.hasOwn(q,'oneOf')?q.oneOf:q.value,'Contradicting qualification '+p.id+'/'+q.key);
    }byKey.set(q.key,{...q});}
    const requirements=[...byKey.values()],syntheticFacts={};
    for(const q of requirements){const value=defaultFact(q);if(Object.hasOwn(syntheticFacts,q.key))assert.equal(syntheticFacts[q.key],value,'Conflicting qualification '+p.id);syntheticFacts[q.key]=value;}
    if(p.syntheticFacts)Object.assign(syntheticFacts,p.syntheticFacts);
    const duration=p.duration;assert.ok(['ordered-days','statutory-days'].includes(duration.type));
    const days=duration.type==='statutory-days'?duration.days:null;if(days!==null)assert.ok(Number.isSafeInteger(days)&&days>0);
    const opening=p.opening??'qualifiedLegalOpening';assert.ok(['qualifiedLegalOpening','geQualifiedOrOrdinaryPost'].includes(opening));
    const sourceCalendarUseProposal=p.calendar??p.calendarProjectionProposal;assert.ok(calendarMapping[sourceCalendarUseProposal]);
    suite.paths.push({id:p.id,canton,stage:p.stage,action:p.action,target:p.target,days,minimumDays:duration.minimumDays??1,
      ...(duration.maximumDays?{maximumDays:duration.maximumDays}:{}),suspension:p.suspension,opening,
      calendar:calendarMapping[sourceCalendarUseProposal],sourceCalendarUseProposal,
      sourceTriggerRule:p.start??p.opening,sourceIds:p.sourceIds,requirements,syntheticFacts,
      endShiftCollision:p.suspension==='none'?'notApplicable':'proposedBoundary'});
  }
  for(const c of model.localReferenceCases){
    const p=suite.paths.find(p=>p.id===c.path);assert.ok(p,'Unknown analyst path '+c.id);
    const known=new Set([...Object.keys(suite.sharedSyntheticFacts),...Object.keys(p.syntheticFacts)]);
    const facts=Object.fromEntries(Object.entries(c.facts??{}).filter(([key])=>known.has(key)));
    const expected={outcome:c.expected.outcome};
    for(const key of['end','legalOpening','nominalEnd','ordinaryShiftEnd','firstCountedDay'])if(Object.hasOwn(c.expected,key))expected[key]=c.expected[key];
    suite.cases.push({id:c.id,path:c.path,trigger:c.trigger,days:c.days,facts,expected,
      analystExpected:c.expected,analystFacts:c.facts,note:c.note,provenance:'canton-analyst-static-reference'});
  }
}
// Additional baseline ends are fixed by the simple October 2026 calendar, not by either checker.
const ordinaryOctoberEnds={1:'2026-10-05',3:'2026-10-05',5:'2026-10-07',10:'2026-10-12',30:'2026-11-02'};
for(const p of suite.paths){
  const days=p.days??10;assert.ok(ordinaryOctoberEnds[days],'Manual baseline end missing '+p.id);
  suite.cases.push({id:'J1-BASE-'+p.id,path:p.id,trigger:'2026-10-02',days,facts:{},
    expected:{outcome:'datedResearchValue',end:ordinaryOctoberEnds[days]},
    note:'Explizit synthetische positive aktuelle Fallqualifikation nach diesem Forschungsweg. Ab 3. Oktober '+days+' Kalendertage, Wochenende und gegebenenfalls Allerheiligen am 1. November zum 2. November verschoben.',provenance:'root-static-october-baseline'});
  for(const[index,q]of[...suite.sharedRequirements,...p.requirements].entries())suite.cases.push({
    id:'J1-QUAL-'+p.id+'-'+String(index+1).padStart(2,'0'),path:p.id,trigger:'2026-10-02',days,facts:{[q.key]:null},
    expected:{outcome:'qualificationBoundaryProposed',reason:q.reason},note:'Fehlende aktuelle positive Qualifikation: '+q.key+'. Keine Ergänzung aus Benutzerstandards.',provenance:'explicit-qualification-negative'});
  if(p.days!==null)suite.cases.push({id:'J1-DURATION-'+p.id,path:p.id,trigger:'2026-10-02',days:p.days+1,facts:{},
    expected:{outcome:'qualificationBoundaryProposed',reason:'statutoryDurationMismatch'},note:'Gesetzliche Dauer darf nicht frei überschrieben werden.',provenance:'duration-negative'});
}
for(const[calendar,c]of Object.entries(suite.calendars)){
  const canton=suite.paths.find(p=>p.calendar===calendar)?.canton;assert.ok(canton);
  for(const[date,isHoliday]of canton==='GE'?[['2027-08-01',true],['2027-08-02',false],['2027-09-09',true],['2027-09-02',false],['2027-05-01',false]]:
    canton==='FR'?[['2026-12-08',true],['2027-01-02',true],['2027-08-02',false],['2027-03-28',true]]:
      [['2027-06-23',true],['2027-05-01',true],['2027-12-26',false],['2027-03-28',true]])suite.calendarProbes.push({calendar,date,isHoliday});
}
suite.expectedPathCount=suite.paths.length;
assert.equal(new Set(suite.paths.map(p=>p.id)).size,suite.paths.length);assert.equal(new Set(suite.cases.map(c=>c.id)).size,suite.cases.length);
assert.equal(Object.keys(suite.calendars).length,3,'Exactly three verified canton research calendars expected');
const target='docs/fachrecht/ap23j1/referenzfaelle.json',bytes=Buffer.from(JSON.stringify(suite,null,2)+'\n');await writeFile(resolve(root,target),bytes);
console.log(JSON.stringify({workPackage:'AP23J1',path:target,sha256:sha256(bytes),groups:suite.paths.length,cases:suite.cases.length,
  groupsByCanton:Object.fromEntries(['FR','GE','JU'].map(c=>[c,suite.paths.filter(p=>p.canton===c).length])),runtimeActive:false},null,2));
