// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createContract05Model,ruleDate05} from '../../scripts/ap18b-03-contract.mjs';
import {createBatch03Model,validateBatch03Model} from '../../scripts/ap18b-03-cantons.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const base=await createContract05Model(root), model=await createBatch03Model(root);
const added=model.rules.slice(base.rules.length);
const inCanton=c=>added.filter(r=>r.jurisdiction===`CH-${c}`);
const dates=c=>[...new Set(inCanton(c).map(r=>ruleDate05(r,2027)))].sort();

describe('AP18B-03: quellenbegrenzte Erfassung VS, FR, SO und GE',()=>{
  it('ergänzt 76 offene Regelzeilen und erhält die 116 bisherigen Regeln',()=>{
    assert.equal(model.rules.length,192);
    assert.deepEqual(model.rules.slice(0,116),base.rules);
    assert.deepEqual(['VS','FR','SO','GE'].map(c=>inCanton(c).length),[13,33,21,9]);
    assert.equal(model.rules.filter(r=>r.status==='approved').length,12);
    assert.ok(added.every(r=>r.status==='open'&&r.approvalBasis===null&&r.exportClass==='blockedEffect'));
    assert.equal(validateBatch03Model(model,base),true);
  });
  for(const [c,expected] of [
    ['VS',['01-01','01-02','03-19','03-29','05-06','05-17','05-27','08-01','08-15','11-01','12-08','12-25','12-26']],
    ['FR',['01-01','01-02','03-26','03-28','03-29','05-06','05-16','05-17','05-27','08-01','08-15','11-01','12-08','12-25','12-26']],
    ['SO',['01-01','03-26','03-28','05-01','05-06','05-16','05-27','08-01','08-15','09-19','11-01','12-25']],
    ['GE',['01-01','03-26','03-29','05-06','05-17','08-01','09-09','12-25','12-31']]
  ])it(`${c}: unabhängige Datumsreferenz 2027, keine Gleichsetzung der Profile`,()=>{
    assert.deepEqual(dates(c),expected.map(value=>`2027-${value}`));
  });
  it('Genfer Bettag nutzt den ausdrücklichen Typ und trifft auch einen ersten Donnerstag',()=>{
    const rule=inCanton('GE').find(r=>r.calculation.type==='nthWeekdayOffsetDays');
    assert.deepEqual(rule.calculation,{type:'nthWeekdayOffsetDays',month:9,isoWeekday:7,occurrence:1,offsetDays:4});
    for(const[y,expected]of [[2026,'2026-09-10'],[2027,'2027-09-09'],[2028,'2028-09-07'],[2030,'2030-09-05']])assert.equal(ruleDate05(rule,y),expected);
    assert.ok(!inCanton('GE').some(r=>r.calculation.type==='fixedMonthDay'&&r.calculation.month===1&&r.calculation.day===2));
    assert.equal(model.batch03Boundary.geSundaySubstitution,false);
  });
  it('Solothurn enthält genau zwei 1.-Mai-Anwendungen als Halbtag',()=>{
    const halves=added.filter(r=>r.dayPortion==='afternoonFromNoon');
    assert.equal(halves.length,2);
    assert.ok(halves.every(r=>r.jurisdiction==='CH-SO'&&r.calculation.month===5&&r.calculation.day===1));
    assert.deepEqual([...new Set(inCanton('SO').map(r=>r.scope))].map(id=>inCanton('SO').filter(r=>r.scope===id).length).sort((a,b)=>a-b),[9,12]);
    assert.equal(model.batch03Boundary.soPartialDayDeadlineEffect,'open');
  });
  it('Freiburg behält drei rechtlich getrennte Listen',()=>{
    const scopes=[...new Set(inCanton('FR').map(r=>r.scope))];
    assert.equal(scopes.length,3);
    assert.deepEqual(scopes.map(id=>inCanton('FR').filter(r=>r.scope===id).length).sort((a,b)=>a-b),[9,9,15]);
    const parts=model.assignments.filter(a=>a.areaType==='Ortsteil'&&a.scopeId.startsWith('FR-'));
    assert.ok(parts.some(a=>a.de.includes('Flamatt')));
    assert.ok(parts.some(a=>a.de.includes('Sensebrügg')));
    assert.ok(model.areaSourceEvidence.length>0);
  });
  it('Wallis ergänzt genau vier Prozessfeiertage und erfindet keinen Karfreitag',()=>{
    assert.equal(inCanton('VS').filter(r=>r.category==='proceduralEquivalentDay').length,4);
    assert.ok(!dates('VS').includes('2027-03-26'));
  });
  it('neue Regeln erzeugen vor Beginn der Erfassungsperiode keine Kalenderfreigabe',()=>{
    assert.ok(added.every(r=>ruleDate05(r,2025)===null));
    assert.equal(model.batch03Boundary.productExport,false);
    assert.equal(model.batch03Boundary.legalApproval,false);
    assert.equal(model.batch03Boundary.municipalLawIncluded,false);
  });
});

describe('AP18B-03: negative Vollständigkeits- und Freigabeproben',()=>{
  for(const[name,mutate]of [
    ['fehlende Regel',m=>m.rules.pop()],
    ['Duplikat',m=>m.rules.push(structuredClone(m.rules.at(-1)))],
    ['neue Freigabe',m=>m.rules.at(-1).status='approved'],
    ['fehlende Quelle',m=>m.sources.pop()],
    ['anderer Quellenstand',m=>m.sources.at(-1)[5]='2010-01-01'],
    ['fehlender Verfahrenshinweis',m=>m.mappings.pop()],
    ['fehlender Gebietsbeleg',m=>m.areaSourceEvidence.pop()],
    ['geänderte Gebietszuordnung',m=>m.assignments.at(-1).effect='exclude'],
    ['Halbtag als Ganztag',m=>m.rules.find(r=>r.dayPortion==='afternoonFromNoon').dayPortion='fullDay'],
    ['Genfer falscher Wochentag',m=>m.rules.find(r=>r.calculation.type==='nthWeekdayOffsetDays').calculation.isoWeekday=4],
    ['veränderte Referenz',m=>m.rules[0].de='Geändert'],
    ['Produktaktivierung',m=>m.batch03Boundary.productExport=true]
  ])it(`weist ${name} ab`,()=>{const copy=structuredClone(model);mutate(copy);assert.throws(()=>validateBatch03Model(copy,base));});
});
