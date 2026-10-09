// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { assertHolidayCatalog } from '../../src/core/holidayCatalog';
import { assertHolidayCatalogV2, assertActivatedCalendarProjection, projectActivatedCalendars, isHolidayActivationReleased, activatedRuleId } from '../../src/core/holidayActivation';
import { generateCalendarFromRules } from '../../src/core/generateCalendar';
import { parseCalendarRuleSetV3 } from '../../src/core/releaseFormat7';
import type { CalendarRuleSet, HolidayCalendarRule } from '../../src/core/calendarRuleTypes';
import type { HolidayCatalogV2 } from '../../src/core/holidayActivationTypes';

const read = (path:string):any=>JSON.parse(readFileSync(path,'utf8'));
const base = 'data/releases/2026-10-01-mvp-06-approved.1';
const draft = read('tests/golden/candidates/ap22b-holiday-contract.json');
const catalog = structuredClone(draft);
catalog.activation.contractDecision={id:'DEC-2026-030',status:'approved',on:'2026-10-08'};
const legacy = ['ch-federal-calendar','be-public-holidays'].map(id=>read(`${base}/calendars/${id}.json`)) as CalendarRuleSet[];
const bytes=JSON.stringify(catalog,null,2)+'\n';
const hash=createHash('sha256').update(bytes).digest('hex');
const projected=projectActivatedCalendars(catalog,hash,legacy);
const clone=():any=>structuredClone(catalog);

test('C1 parses approved contract and preserves complete archive without granting runtime permission',()=>{
  assertHolidayCatalogV2(catalog);
  assertHolidayCatalogV2(draft);
  assert.equal(isHolidayActivationReleased(catalog,'any-release'),false);
  assert.equal(isHolidayActivationReleased(draft,'any-release'),false);
  const old=read(`${base}/holiday-catalogs/ch-holiday-catalog.json`);
  const {activation:_a,$schema:_s,formatVersion:_v,...archive}=catalog;
  const {$schema:_os,formatVersion:_ov,...expected}=old;
  assert.deepEqual(archive,expected);
  assert.equal(catalog.data.rules.length,479);
  assert.equal(catalog.activation.supplementalRules.length,12);
  assert.throws(()=>assertHolidayCatalog(catalog));
});

test('C1 projections are deterministic, full-hash bound and have unique rule identities',()=>{
  assert.equal(projected.length,32);
  assert.deepEqual(projectActivatedCalendars(catalog,hash,legacy),projected);
  assertActivatedCalendarProjection(catalog,hash,projected,legacy);
  const ownIds=projected.flatMap(calendar=>calendar.rules.map(rule=>rule.ruleId));
  assert.equal(new Set(ownIds).size,ownIds.length);
  for(const calendar of projected){
    parseCalendarRuleSetV3(calendar);
    assert.equal(calendar.formatVersion,'3.0.0');
    assert.equal(calendar.projection?.sourceHash,hash);
    assert.deepEqual(calendar.inherits,calendar.calendarId==='ch-federal-calendar'?[]:['ch-federal-calendar']);
    for(const rule of calendar.rules) if(rule.effect.type==='holiday') assert.ok((rule as HolidayCalendarRule).condition);
  }
});

test('inherited effective holiday IDs exactly equal each terminal catalog recipe',()=>{
  const federal=projected.find(row=>row.calendarId==='ch-federal-calendar')!;
  for(const recipe of (catalog as HolidayCatalogV2).activation.projections){
    const calendar=projected.find(row=>row.calendarId===recipe.calendarId)!;
    const own=calendar.rules.filter(rule=>rule.effect.type==='holiday').map(rule=>rule.ruleId);
    const inherited=calendar.inherits.length?federal.rules.filter(rule=>rule.effect.type==='holiday').map(rule=>rule.ruleId):[];
    assert.deepEqual([...own,...inherited].sort(),recipe.ruleIds.map(id=>activatedRuleId(id,recipe)).sort());
  }
});

test('CH/BE holiday IDs, rule metadata and all federal suspensions are preserved',()=>{
  for(const old of legacy){
    const current=projected.find(row=>row.calendarId===old.calendarId)!;
    const stripped=current.rules.map(rule=>{ const {condition:_condition,...rest}=rule as any; return rest; });
    assert.deepEqual(stripped.sort((a,b)=>a.ruleId.localeCompare(b.ruleId)),[...old.rules].sort((a,b)=>a.ruleId.localeCompare(b.ruleId)));
    for(const range of [{from:'2026-08-29',to:'2027-12-31'},{from:'2028-01-01',to:'2030-12-31'}]){
      const actual=generateCalendarFromRules(projected,old.calendarId,range).calendar;
      const expected=generateCalendarFromRules(legacy,old.calendarId,range).calendar;
      assert.deepEqual(actual.holidays,expected.holidays);
      assert.deepEqual(actual.suspensionSets,expected.suspensionSets);
    }
  }
});

const catalogMutations: readonly [string,(value:any)=>void][]=[
  ['unknown root field',c=>{c.extra=true;}],
  ['unknown activation field',c=>{c.activation.allowAll=true;}],
  ['fabricated release permission',c=>{c.activation.releaseEligibility.status='approved';}],
  ['approval date missing',c=>{c.activation.contractDecision.on=null;}],
  ['missing evidence decision',c=>{c.activation.matrixDecisions.pop();}],
  ['duplicate binding',c=>{c.activation.procedureBindings[1]=c.activation.procedureBindings[0];}],
  ['missing source mapping',c=>{c.activation.sourceIdMap.pop();}],
  ['source-ID alias collision',c=>{c.activation.sourceIdMap[1].sourceId=c.activation.sourceIdMap[0].sourceId;}],
  ['archive evidence changed',c=>{c.activation.sourceEvidence[0].url='https://example.org/changed';}],
  ['partial terminal rule list',c=>{c.activation.projections[0].ruleIds.pop();}],
  ['free list union',c=>{c.activation.projections[0].supplementScopeIds.push('AG-ARG-BADEN');}],
  ['wrong projection identity',c=>{c.activation.projections[0].id='projection-0000000000000000';}],
  ['missing provenance decision',c=>{c.activation.procedureBindings[0].matrixDecisionIds.pop();}],
  ['authority fallback',c=>{c.activation.procedureBindings[0].jurisdiction='CH';}],
  ['coverage silently broadened',c=>{c.activation.procedureBindings[0].caseCoverage.from='2020-01-01';}],
  ['unqualified representative',c=>{c.activation.anchorPolicies.find((x:any)=>x.profileId==='stpo').resolvedModes=['court'];}],
  ['regional unknown equated false',c=>{c.activation.procedureBindings.find((x:any)=>x.requiredAreaScopeIds.length).variants[0].areaFacts=[];}],
  ['NE boundary erased',c=>{c.activation.procedureBindings.find((x:any)=>x.jurisdiction==='CH-NE').boundaryIds=[];}],
  ['January alternative erased',c=>{c.activation.procedureBindings.find((x:any)=>x.ambiguity).variants[0].alternativeProjectionId=null;}],
  ['SO day calculation changed',c=>{c.activation.supplementalRules[0].calculation.day=3;}],
  ['SO half-day promoted',c=>{c.activation.supplementalRules[0].dayPortion='afternoonFromNoon';}],
  ['SO norm validity changed',c=>{c.activation.supplementalRules[0].legalValidity.from='2020-01-01';}],
  ['SO source changed',c=>{c.activation.supplementalRules[0].sourceRefs[0].evidenceId='AP22CLOSE-BUND-ZPO';}]
];
for(const [name,mutate] of catalogMutations) test(`C1 rejects ${name}`,()=>{const value=clone();mutate(value);assert.throws(()=>assertHolidayCatalogV2(value));});

const projectionMutations:readonly [string,(value:any[])=>void][]=[
  ['missing calendar',x=>{x.pop();}],
  ['extra calendar',x=>{x.push(structuredClone(x[0]));}],
  ['catalog hash mismatch',x=>{x[0].projection.sourceHash='a'.repeat(64);}],
  ['foreign parent',x=>{x[0].inherits.push('be-public-holidays');}],
  ['inheritance cycle',x=>{x[0].inherits=[x[0].calendarId];}],
  ['own inherited duplicate',x=>{x[0].rules.push(structuredClone(x.find(c=>c.calendarId==='ch-federal-calendar').rules[0]));}],
  ['changed arithmetic',x=>{x[0].rules[0].calculation={type:'fixedMonthDay',month:1,day:3};}],
  ['changed condition',x=>{x[0].rules[0].condition='onlyMonday';}],
  ['changed norm validity',x=>{x[0].rules[0].validity.from='2026-10-09';}],
  ['changed source locator',x=>{x[0].rules[0].sourceRefs[0].locator='changed';}],
  ['changed source URL',x=>{x[0].sources[0].url='https://example.org/changed';}],
  ['changed legal effect',x=>{x[0].rules[0].effect.kind='federalHoliday';}],
  ['missing suspension',x=>{const ch=x.find(c=>c.calendarId==='ch-federal-calendar');ch.rules=ch.rules.filter((r:any)=>r.effect.type==='holiday');}]
];
for(const [name,mutate] of projectionMutations) test(`C1 projection rejects ${name}`,()=>{
  const value=structuredClone(projected) as any[];mutate(value);assert.throws(()=>assertActivatedCalendarProjection(catalog,hash,value,legacy));
});

test('legacy provenance cannot be replaced by a plausible-looking altered CH suspension',()=>{
  const changed=structuredClone(legacy) as any[];
  changed[0].rules.find((rule:any)=>rule.effect.type==='suspensionPeriod').calculation.startsOn.offsetDays=-6;
  assert.throws(()=>projectActivatedCalendars(catalog,hash,changed));
});
