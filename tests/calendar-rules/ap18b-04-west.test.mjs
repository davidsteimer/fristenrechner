// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { createBatch03Model } from '../../scripts/ap18b-03-cantons.mjs';
import { createWestAdditions } from '../../scripts/ap18b-04-west.mjs';
import { ruleDate05, validateContract05 } from '../../scripts/ap18b-03-contract.mjs';

const base = await createBatch03Model(process.cwd());
const snapshot = structuredClone(base);
const added = createWestAdditions(base);
const keys = scope => added.rules.filter(rule => rule.scope === scope).map(rule => added.ruleKeys[rule.id]);
// Independent transcriptions of the statutory day lists. No builder constants imported.
const EXPECTED = {
  'BS-RLG-ALL': 'NEW-YEAR GOOD-FRIDAY EASTER EASTER-MONDAY MAY1 ASCENSION PENTECOST WHIT-MONDAY NATIONAL-DAY FEDERAL-FAST CHRISTMAS ST-STEPHEN',
  'BL-RTG-ALL': 'NEW-YEAR GOOD-FRIDAY EASTER EASTER-MONDAY MAY1 ASCENSION PENTECOST WHIT-MONDAY NATIONAL-DAY FEDERAL-FAST CHRISTMAS ST-STEPHEN',
  'VD-LEMP-ALL': 'NEW-YEAR BERCHTOLD GOOD-FRIDAY EASTER-MONDAY ASCENSION WHIT-MONDAY NATIONAL-DAY FEDERAL-FAST-MONDAY CHRISTMAS',
  'NE-LDJF-BASE': 'NEW-YEAR NE-REPUBLIC GOOD-FRIDAY MAY1 ASCENSION NATIONAL-DAY CHRISTMAS',
  'NE-LANDERON-ADDITIONAL': 'CORPUS-CHRISTI',
  'NE-LPA-ADDITIONAL': 'BERCHTOLD EASTER-MONDAY ASCENSION-FRIDAY WHIT-MONDAY FEDERAL-FAST-MONDAY CHRISTMAS-EVE ST-STEPHEN NEW-YEAR-EVE',
  'JU-LJF-OFFICIAL': 'NEW-YEAR BERCHTOLD GOOD-FRIDAY EASTER EASTER-MONDAY MAY1 ASCENSION PENTECOST WHIT-MONDAY CORPUS-CHRISTI JU-PLEBISCITE NATIONAL-DAY ASSUMPTION ALL-SAINTS CHRISTMAS',
  'JU-LJF-LABOUR': 'NEW-YEAR GOOD-FRIDAY EASTER-MONDAY MAY1 ASCENSION WHIT-MONDAY CORPUS-CHRISTI NATIONAL-DAY CHRISTMAS'
};
const FIXED = {
  'NEW-YEAR': '01-01', BERCHTOLD: '01-02', 'NE-REPUBLIC': '03-01', MAY1: '05-01',
  'JU-PLEBISCITE': '06-23', 'NATIONAL-DAY': '08-01', ASSUMPTION: '08-15',
  'ALL-SAINTS': '11-01', 'CHRISTMAS-EVE': '12-24', CHRISTMAS: '12-25',
  'ST-STEPHEN': '12-26', 'NEW-YEAR-EVE': '12-31'
};
// Literal calendar expectations. BS/VD official 2026–2028 lists, JU/NE 2026–2027
// lists and independent Gregorian 2028 checks. Sunday dates retained from laws.
const VARIABLE = {
  2026: { 'GOOD-FRIDAY': '04-03', EASTER: '04-05', 'EASTER-MONDAY': '04-06', ASCENSION: '05-14',
    'ASCENSION-FRIDAY': '05-15', PENTECOST: '05-24', 'WHIT-MONDAY': '05-25', 'CORPUS-CHRISTI': '06-04',
    'FEDERAL-FAST': '09-20', 'FEDERAL-FAST-MONDAY': '09-21' },
  2027: { 'GOOD-FRIDAY': '03-26', EASTER: '03-28', 'EASTER-MONDAY': '03-29', ASCENSION: '05-06',
    'ASCENSION-FRIDAY': '05-07', PENTECOST: '05-16', 'WHIT-MONDAY': '05-17', 'CORPUS-CHRISTI': '05-27',
    'FEDERAL-FAST': '09-19', 'FEDERAL-FAST-MONDAY': '09-20' },
  2028: { 'GOOD-FRIDAY': '04-14', EASTER: '04-16', 'EASTER-MONDAY': '04-17', ASCENSION: '05-25',
    'ASCENSION-FRIDAY': '05-26', PENTECOST: '06-04', 'WHIT-MONDAY': '06-05', 'CORPUS-CHRISTI': '06-15',
    'FEDERAL-FAST': '09-17', 'FEDERAL-FAST-MONDAY': '09-18' }
};

test('west batch is deterministic and does not modify the accepted historical model', () => {
  assert.deepEqual(base, snapshot);
  assert.deepEqual(added, createWestAdditions(base));
  assert.equal(added.rules.length, 73);
  assert.equal(added.scopes.length, 8);
  assert.equal(added.sources.length, 17);
  assert.equal(added.mappings.length, 13);
  assert.equal(added.reviews.length, 17);
  assert.equal(added.assignments.length, 8);
  assert.deepEqual([...new Set(added.rules.map(rule => rule.jurisdiction))], ['CH-BS', 'CH-BL', 'CH-VD', 'CH-NE', 'CH-JU']);
});

for (const [scope, expected] of Object.entries(EXPECTED)) {
  test(`${scope}: statutory list exactly retained`, () => assert.deepEqual(keys(scope), expected.split(' ')));
}

for (const year of [2026, 2027, 2028]) {
  test(`all 73 west rule dates match independent literal expectations for ${year}`, () => {
    for (const rule of added.rules) {
      const key = added.ruleKeys[rule.id];
      const expected = FIXED[key] || VARIABLE[year][key];
      assert.ok(expected, `Missing independent expectation ${key}`);
      assert.equal(ruleDate05(rule, year), `${year}-${expected}`, rule.id);
    }
  });
}

test('the west additions satisfy the unchanged 0.5.0 workbook contract', () => {
  const model = structuredClone(base);
  for (const key of ['rules', 'scopes', 'sources', 'mappings', 'reviews', 'assignments']) model[key].push(...added[key]);
  model.scopeLabels = { ...base.scopeLabels, ...added.scopeLabels };
  model.ruleKeys = { ...base.ruleKeys, ...added.ruleKeys };
  assert.equal(validateContract05(model), true);
});

test('new federal applications do not inherit federal approval', () => {
  const federal = added.rules.filter(rule => added.ruleKeys[rule.id] === 'NATIONAL-DAY');
  assert.equal(federal.length, 6);
  for (const rule of federal) assert.equal(rule.source, 'SRC-BUNDESFEIERTAG-19940701');
  for (const rule of added.rules) {
    assert.equal(rule.from, '2026-01-01');
    assert.equal(rule.to, null);
    assert.equal(rule.status, 'open');
    assert.equal(rule.approvalBasis, null);
    assert.equal(rule.reference, null);
    assert.equal(rule.exportClass, 'blockedEffect');
    assert.equal(rule.dayPortion, 'fullDay');
    for (const language of ['de', 'fr', 'it', 'rm']) assert.ok(rule[language].trim());
  }
});

test('NE distinguishes unresolved conditional general days from unconditional LPA supplements', () => {
  assert.ok(!keys('NE-LDJF-BASE').includes('BERCHTOLD'));
  assert.ok(!keys('NE-LDJF-BASE').includes('ST-STEPHEN'));
  assert.ok(keys('NE-LPA-ADDITIONAL').includes('BERCHTOLD'));
  assert.ok(keys('NE-LPA-ADDITIONAL').includes('ST-STEPHEN'));
  assert.equal(added.pendingCases.find(item => item.id === 'NE-PENDING-SUNDAY-SUBSTITUTION').status, 'contractGap');
  assert.equal(added.pendingCases.find(item => item.id === 'NE-PENDING-COMPENSATION').status, 'sourceGap');
  for (const pending of added.pendingCases) {
    assert.ok(added.mappings.some(row => row.some(cell => typeof cell === 'string' && cell.includes(pending.id))));
    assert.ok(pending.sourceIds.every(id => added.sources.some(row => row[0] === id)));
  }
});

test('NE procedural supplements use current LPA and do not generalise personnel calendars', () => {
  for (const rule of added.rules.filter(rule => rule.scope === 'NE-LPA-ADDITIONAL')) {
    assert.equal(rule.category, 'proceduralEquivalentDay');
    assert.equal(rule.source, 'SRC-NE-LPA-152130-20260101');
    assert.match(rule.locator, /33 Abs\. 3.*RDF Art\. 11 Abs\. 1/);
  }
  assert.equal(added.sources.find(row => row[0] === 'SRC-NE-LPA-152130-20260101')[5], '2026-01-01');
  assert.ok(!added.rules.some(rule => rule.id.includes('COMPENSATION')));
});

test('Le Landeron is an explicit cantonally defined municipality and only an addition', () => {
  const area = added.assignments.find(row => row.scopeId === 'NE-LANDERON-ADDITIONAL');
  assert.equal(area.areaId, 'GEO-NE-LE-LANDERON');
  assert.equal(area.parentAreaId, 'GEO-NE');
  assert.equal(area.areaType, 'Gemeinde');
  assert.equal(area.de, 'Le Landeron');
  assert.equal(area.sourceId, 'SRC-NE-ADJF-941020-20250527');
  assert.equal(area.officialId, '');
  assert.ok(!added.assignments.some(row => /Cerneux/.test(row.de)));
  assert.equal(added.areaSourceEvidence.length, 0);
});

test('JU official 15-day list and narrower nine-day labour list stay distinct', () => {
  const publicKeys = keys('JU-LJF-OFFICIAL'), labourKeys = keys('JU-LJF-LABOUR');
  assert.equal(publicKeys.length, 15);
  assert.equal(labourKeys.length, 9);
  assert.deepEqual(publicKeys.filter(key => !labourKeys.includes(key)),
    ['BERCHTOLD', 'EASTER', 'PENTECOST', 'JU-PLEBISCITE', 'ASSUMPTION', 'ALL-SAINTS']);
  assert.ok(!added.rules.some(rule => /MARTIN|STEPHEN/.test(rule.id) && rule.jurisdiction === 'CH-JU'));
});

test('BS and BL May Day is full-day and their lists do not gain Berchtold or Fasnacht', () => {
  for (const scope of ['BS-RLG-ALL', 'BL-RTG-ALL']) {
    assert.ok(!keys(scope).includes('BERCHTOLD'));
    assert.ok(!keys(scope).some(key => /FASNACHT|CARNIVAL/.test(key)));
    assert.equal(added.rules.find(rule => rule.id === `${scope}-DAY-MAY1`).dayPortion, 'fullDay');
  }
  assert.equal(added.sources.find(row => row[0] === 'SRC-BS-RLG-811100-20200701')[5], '2020-07-01');
});

test('VD includes Bettag Monday but not the movable extra personnel day', () => {
  assert.ok(keys('VD-LEMP-ALL').includes('FEDERAL-FAST-MONDAY'));
  assert.ok(!keys('VD-LEMP-ALL').includes('ST-STEPHEN'));
  const rule = added.rules.find(row => row.id === 'VD-LEMP-ALL-DAY-FEDERAL-FAST-MONDAY');
  assert.deepEqual(rule.calculation, { type: 'nthWeekdayOffsetDays', month: 9, isoWeekday: 7, occurrence: 3, offsetDays: 1 });
});

test('all source references and review records are explicit and unapproved', () => {
  for (const source of added.sources) {
    assert.match(source[4], /^https:\/\//);
    assert.equal(source[6], '2026-09-13');
    assert.equal(source[8], 'open');
    assert.equal(source[9], null);
    assert.ok(added.reviews.some(review => review[1] === source[0]));
  }
  assert.equal(added.notes.legalApproval, false);
  assert.equal(added.notes.runtimeEnabled, false);
  assert.equal(added.notes.municipalLawIncluded, false);
});
