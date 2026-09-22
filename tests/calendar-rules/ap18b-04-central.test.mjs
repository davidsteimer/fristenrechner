// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { createBatch03Model } from '../../scripts/ap18b-03-cantons.mjs';
import { createCentralAdditions } from '../../scripts/ap18b-04-central.mjs';
import { ruleDate05, validateContract05 } from '../../scripts/ap18b-03-contract.mjs';

const base = await createBatch03Model(process.cwd());
const before = structuredClone(base);
const additions = createCentralAdditions(base);
const keys = scope => additions.rules.filter(r => r.scope === scope).map(r => additions.ruleKeys[r.id]).sort();
const sorted = values => [...values].sort();

// Independently transcribed source lists, not imported implementation profiles.
const EXPECTED = {
  'LU-RLG-ALL': ['NEW-YEAR', 'GOOD-FRIDAY', 'ASCENSION', 'CORPUS-CHRISTI', 'NATIONAL-DAY', 'ASSUMPTION', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS', 'ST-STEPHEN', 'EASTER', 'PENTECOST', 'FEDERAL-FAST'],
  'LU-JUSG-ART76': ['NEW-YEAR', 'BERCHTOLD', 'GOOD-FRIDAY', 'EASTER-MONDAY', 'ASCENSION', 'WHIT-MONDAY', 'CORPUS-CHRISTI', 'NATIONAL-DAY', 'ASSUMPTION', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS', 'ST-STEPHEN'],
  'LU-VRG-ADDITIONAL': ['BERCHTOLD', 'EASTER-MONDAY', 'WHIT-MONDAY'],
  'UR-LSG-ALL': ['NEW-YEAR', 'EPIPHANY', 'ST-JOSEPH', 'GOOD-FRIDAY', 'EASTER-MONDAY', 'ASCENSION', 'WHIT-MONDAY', 'CORPUS-CHRISTI', 'NATIONAL-DAY', 'ASSUMPTION', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS', 'ST-STEPHEN'],
  'SZ-RTG-ALL': ['NEW-YEAR', 'EPIPHANY', 'ST-JOSEPH', 'GOOD-FRIDAY', 'EASTER', 'EASTER-MONDAY', 'ASCENSION', 'PENTECOST', 'WHIT-MONDAY', 'CORPUS-CHRISTI', 'NATIONAL-DAY', 'ASSUMPTION', 'FEDERAL-FAST', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS', 'ST-STEPHEN'],
  'OW-RTG-ALL': ['NEW-YEAR', 'GOOD-FRIDAY', 'EASTER', 'ASCENSION', 'PENTECOST', 'CORPUS-CHRISTI', 'NATIONAL-DAY', 'ASSUMPTION', 'FEDERAL-FAST', 'BRUDER-KLAUS', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS'],
  'NW-RTG-ALL': ['NEW-YEAR', 'ST-JOSEPH', 'GOOD-FRIDAY', 'EASTER', 'ASCENSION', 'PENTECOST', 'CORPUS-CHRISTI', 'NATIONAL-DAY', 'ASSUMPTION', 'FEDERAL-FAST', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS'],
  'ZG-RLG-ALL': ['NEW-YEAR', 'GOOD-FRIDAY', 'ASCENSION', 'CORPUS-CHRISTI', 'NATIONAL-DAY', 'ASSUMPTION', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS', 'EASTER', 'PENTECOST', 'FEDERAL-FAST'],
  'ZG-VRG-ART10': ['NEW-YEAR', 'BERCHTOLD', 'GOOD-FRIDAY', 'EASTER', 'EASTER-MONDAY', 'ASCENSION', 'PENTECOST', 'WHIT-MONDAY', 'CORPUS-CHRISTI', 'NATIONAL-DAY', 'ASSUMPTION', 'FEDERAL-FAST', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS', 'ST-STEPHEN'],
  'GL-RTG-ALL': ['NEW-YEAR', 'GOOD-FRIDAY', 'EASTER', 'EASTER-MONDAY', 'ASCENSION', 'PENTECOST', 'WHIT-MONDAY', 'NATIONAL-DAY', 'FEDERAL-FAST', 'ALL-SAINTS', 'CHRISTMAS', 'ST-STEPHEN']
};
for (const [scope, list] of Object.entries(EXPECTED)) test(`Central normative membership ${scope}`, () => assert.deepEqual(keys(scope), sorted(list)));

// Fixed norm dates and separately recorded 2026–2028 Gregorian fixtures.
const FIXED = { 'NEW-YEAR': '01-01', BERCHTOLD: '01-02', EPIPHANY: '01-06', 'ST-JOSEPH': '03-19',
  'NATIONAL-DAY': '08-01', ASSUMPTION: '08-15', 'BRUDER-KLAUS': '09-25', 'ALL-SAINTS': '11-01',
  'IMMACULATE-CONCEPTION': '12-08', CHRISTMAS: '12-25', 'ST-STEPHEN': '12-26' };
const VARIABLE = {
  2026: { 'GOOD-FRIDAY': '04-03', EASTER: '04-05', 'EASTER-MONDAY': '04-06', ASCENSION: '05-14', PENTECOST: '05-24', 'WHIT-MONDAY': '05-25', 'CORPUS-CHRISTI': '06-04', 'FEDERAL-FAST': '09-20' },
  2027: { 'GOOD-FRIDAY': '03-26', EASTER: '03-28', 'EASTER-MONDAY': '03-29', ASCENSION: '05-06', PENTECOST: '05-16', 'WHIT-MONDAY': '05-17', 'CORPUS-CHRISTI': '05-27', 'FEDERAL-FAST': '09-19' },
  2028: { 'GOOD-FRIDAY': '04-14', EASTER: '04-16', 'EASTER-MONDAY': '04-17', ASCENSION: '05-25', PENTECOST: '06-04', 'WHIT-MONDAY': '06-05', 'CORPUS-CHRISTI': '06-15', 'FEDERAL-FAST': '09-17' }
};
for (const year of [2026, 2027, 2028]) test(`Central exact dates for every captured rule ${year}`, () => {
  for (const rule of additions.rules) {
    const key = additions.ruleKeys[rule.id];
    const monthDay = FIXED[key] ?? VARIABLE[year][key];
    assert.ok(monthDay, `Missing independent fixture ${key}`);
    assert.equal(ruleDate05(rule, year), `${year}-${monthDay}`, `${rule.id} ${year}`);
  }
});

test('Central additions preserve accepted base, counts and review boundaries', () => {
  assert.deepEqual(base, before);
  assert.equal(additions.rules.length, 126);
  assert.equal(additions.scopes.length, 10);
  assert.equal(additions.sources.length, 16);
  assert.equal(additions.mappings.length, 30);
  assert.equal(additions.reviews.length, 16);
  assert.equal(additions.assignments.length, 10);
  for (const rule of additions.rules) {
    assert.equal(rule.status, 'open'); assert.equal(rule.exportClass, 'blockedEffect');
    assert.equal(rule.from, '2026-01-01'); assert.equal(rule.to, null); assert.equal(rule.dayPortion, 'fullDay');
    assert.equal(rule.approvalBasis, null); assert.equal(rule.reference, null);
    for (const language of ['de', 'fr', 'it', 'rm']) assert.ok(rule[language].trim());
  }
  assert.equal(additions.notes.municipalLawIncluded, false);
  assert.equal(additions.notes.languageApproval, false);
  assert.equal(additions.notes.proceduralApproval, false);
});

test('Central additions fit the unchanged 0.5 contract and source relations', () => {
  const model = structuredClone(base);
  for (const key of ['rules', 'scopes', 'sources', 'mappings', 'reviews', 'assignments']) model[key].push(...additions[key]);
  for (const key of ['scopeLabels', 'jurisdictionLabels', 'ruleKeys', 'holidayDefinitions']) Object.assign(model[key], additions[key]);
  assert.equal(validateContract05(model), true);
  for (const source of additions.sources) { assert.equal(source[6], '2026-09-13'); assert.match(source[4], /^https:\/\//); }
  for (const scope of additions.scopes) assert.ok(additions.scopeLabels[scope[0]].it && additions.scopeLabels[scope[0]].rm);
  for (const a of additions.assignments) { assert.equal(a.areaType, 'Kanton'); assert.equal(a.parentAreaId, 'GEO-CH'); assert.equal(a.officialId, ''); }
});

test('Glarus known Fahrtsfest is visible as a contract gap, never a wrong April rule', () => {
  const gap = additions.pendingCases.find(p => p.id === 'GAP-GL-FAHRT-APRIL');
  assert.equal(gap.status, 'contractGap'); assert.equal(gap.canton, 'CH-GL');
  assert.equal(gap.sourceIds.length, 3);
  assert.ok(gap.sourceIds.every(id => additions.sources.some(s => s[0] === id)));
  assert.ok(additions.mappings.some(m => m.join(' ').includes(gap.id)));
  assert.ok(additions.reviews.some(r => r.join(' ').includes(gap.id)));
  assert.ok(!additions.rules.some(r => /FAHRT|FAHRTSFEST/.test(r.id)));
  assert.match(additions.scopes.find(s => s[0] === 'GL-RTG-ALL')[4], /Unvollständiges/);
  assert.match(additions.sources.find(s => s[0] === 'SRC-GL-FAHRT-RR-20260106')[7], /09\.04\.2026/);
  // The legal programme delegation is not misrepresented as a statutory formula.
  assert.match(additions.sources.find(s => s[0] === 'SRC-GL-FAHRT-IA31-18350524')[7], /keine ausformulierte/);
});

test('Luzern procedure lists are not conflated with rest or labour profiles', () => {
  assert.ok(!keys('LU-RLG-ALL').includes('BERCHTOLD'));
  assert.ok(keys('LU-JUSG-ART76').includes('BERCHTOLD'));
  assert.ok(!keys('LU-JUSG-ART76').includes('FEDERAL-FAST'));
  assert.ok(additions.rules.filter(r => r.scope === 'LU-JUSG-ART76').every(r => r.source === 'SRC-LU-JUSG-260-20260101' && r.category === 'proceduralEquivalentDay'));
  assert.match(additions.scopes.find(s => s[0] === 'LU-VRG-ADDITIONAL')[4], /Keine vollständige VRG-Liste/);
  assert.match(additions.mappings.find(m => m[0] === 'MAP-LU-RLG-ALL-LABOUR')[4], /Stephanstag/);
  assert.doesNotMatch(additions.mappings.find(m => m[0] === 'MAP-LU-RLG-ALL-LABOUR')[4], /Mariä Empfängnis/);
});

test('Uri Stephanstag is unconditional in current LSG, not imported historical weekday restriction', () => {
  const rule = additions.rules.find(r => r.id === 'UR-LSG-ALL-DAY-ST-STEPHEN');
  assert.deepEqual(rule.calculation, { type: 'fixedMonthDay', month: 12, day: 26 });
  assert.equal(rule.source, 'SRC-UR-LSG-701421-20030101');
  assert.doesNotMatch(additions.mappings.find(m => m[0] === 'MAP-UR-LSG-ALL-LABOUR')[4], /Stephanstag/);
});

test('Obwalden Bruderklausenfest and Nidwalden Josefstag remain rest-only differences', () => {
  assert.equal(ruleDate05(additions.rules.find(r => r.id === 'OW-RTG-ALL-DAY-BRUDER-KLAUS'), 2026), '2026-09-25');
  assert.doesNotMatch(additions.mappings.find(m => m[0] === 'MAP-OW-RTG-ALL-LABOUR')[4], /Bruderklaus/);
  assert.ok(keys('NW-RTG-ALL').includes('ST-JOSEPH'));
  assert.doesNotMatch(additions.mappings.find(m => m[0] === 'MAP-NW-RTG-ALL-LABOUR')[4], /Josef/);
  assert.match(additions.mappings.find(m => m[0] === 'MAP-SZ-RTG-ALL-LABOUR')[4], /Josef/);
});

test('Zug 16-day VRG list includes holidays not public labour holidays', () => {
  for (const key of ['BERCHTOLD', 'EASTER-MONDAY', 'WHIT-MONDAY', 'ST-STEPHEN']) {
    assert.ok(keys('ZG-VRG-ART10').includes(key)); assert.ok(!keys('ZG-RLG-ALL').includes(key));
  }
  assert.ok(additions.rules.filter(r => r.scope === 'ZG-VRG-ART10').every(r => r.category === 'proceduralEquivalentDay'));
  const sunday = additions.rules.find(r => r.id === 'ZG-RLG-ALL-DAY-FEDERAL-FAST');
  assert.match(sunday.locator, /§ 5 Abs\. 2/);
});

test('Seven new federal applications remain open and no Sunday substitution is added', () => {
  const applications = additions.rules.filter(r => r.source === 'SRC-BUNDESFEIERTAG-19940701');
  assert.equal(applications.length, 7);
  for (const r of applications) assert.equal(ruleDate05(r, 2027), '2027-08-01');
  assert.ok(additions.rules.every(r => r.target === null && r.action === 'add'));
  assert.ok(!additions.rules.some(r => /PATRON|SECHSE|FASNACHT|SILVESTER|CHRISTMAS-EVE/.test(r.id)));
  assert.equal(additions.mappings.filter(m => m[0].endsWith('-LOCAL-OUT')).length, 5);
});
