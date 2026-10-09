// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBatch03Model } from '../../scripts/ap18b-03-cantons.mjs';
import { createEastAdditions } from '../../scripts/ap18b-04-east.mjs';
import { ruleDate05, validateContract05 } from '../../scripts/ap18b-03-contract.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const base = await createBatch03Model(root);
const original = structuredClone(base);
const additions = createEastAdditions(base);
const profile = id => additions.rules.filter(rule => rule.scope === id);
const keys = id => profile(id).map(rule => additions.ruleKeys[rule.id]).sort();
const basic = ['NEW-YEAR', 'GOOD-FRIDAY', 'EASTER-MONDAY', 'ASCENSION', 'WHIT-MONDAY', 'NATIONAL-DAY', 'CHRISTMAS', 'ST-STEPHEN'];
const sundays = ['EASTER', 'PENTECOST', 'FEDERAL-FAST'];
const expectedProfiles = {
  'ZH-RLG-ALL': [...basic, 'MAY1', ...sundays],
  'ZH-GOG-ALL': [...basic, 'MAY1', 'BERCHTOLD'],
  'SH-RTG-ALL': [...basic, 'MAY1', ...sundays],
  'SH-ZPO-ADDITIONAL': ['BERCHTOLD'],
  'TG-RTG-ALL': [...basic, 'MAY1', 'BERCHTOLD', ...sundays],
  'SG-RLG-ALL': [...basic, 'ALL-SAINTS', ...sundays],
  'SG-ZPO-ADDITIONAL': ['BERCHTOLD'],
  'AR-ARG-ALL': basic.filter(key => key !== 'ST-STEPHEN'),
  'AI-RTG-ALL': [...basic.filter(key => key !== 'ST-STEPHEN'), 'CORPUS-CHRISTI', 'ASSUMPTION', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION', ...sundays],
  'AI-RTG-INNER-ADDITIONAL': ['MAURITIUS']
};
const fixed = {
  'NEW-YEAR': '01-01', BERCHTOLD: '01-02', MAY1: '05-01', 'NATIONAL-DAY': '08-01',
  ASSUMPTION: '08-15', MAURITIUS: '09-22', 'ALL-SAINTS': '11-01',
  'IMMACULATE-CONCEPTION': '12-08', CHRISTMAS: '12-25', 'ST-STEPHEN': '12-26'
};
// Explicit independent expectations, not generated with the implementation under test.
const moving = {
  2026: { 'GOOD-FRIDAY': '04-03', EASTER: '04-05', 'EASTER-MONDAY': '04-06', ASCENSION: '05-14', PENTECOST: '05-24', 'WHIT-MONDAY': '05-25', 'CORPUS-CHRISTI': '06-04', 'FEDERAL-FAST': '09-20' },
  2027: { 'GOOD-FRIDAY': '03-26', EASTER: '03-28', 'EASTER-MONDAY': '03-29', ASCENSION: '05-06', PENTECOST: '05-16', 'WHIT-MONDAY': '05-17', 'CORPUS-CHRISTI': '05-27', 'FEDERAL-FAST': '09-19' },
  2028: { 'GOOD-FRIDAY': '04-14', EASTER: '04-16', 'EASTER-MONDAY': '04-17', ASCENSION: '05-25', PENTECOST: '06-04', 'WHIT-MONDAY': '06-05', 'CORPUS-CHRISTI': '06-15', 'FEDERAL-FAST': '09-17' }
};

describe('AP18B-04 Ost: abgegrenzte offene Quellenaufnahme', () => {
  it('ergänzt 83 Regeln in zehn Profilen ohne Mutation des abgenommenen Vorbestands', () => {
    assert.deepEqual(base, original);
    assert.deepEqual(['ZH', 'SH', 'TG', 'SG', 'AR', 'AI'].map(canton => additions.rules.filter(rule => rule.jurisdiction === `CH-${canton}`).length), [22, 13, 13, 13, 7, 15]);
    assert.deepEqual([additions.rules.length, additions.scopes.length, additions.sources.length, additions.mappings.length, additions.reviews.length, additions.assignments.length, additions.areaSourceEvidence.length], [83, 10, 14, 12, 14, 13, 4]);
  });
  for (const [id, expected] of Object.entries(expectedProfiles)) it(`${id}: eigenständige Soll-Liste und Ausschlüsse`, () => {
    assert.deepEqual(keys(id), [...expected].sort());
  });
  for (const year of [2026, 2027, 2028]) it(`${year}: sämtliche Regeln gegen unabhängige feste und bewegliche Termine`, () => {
    for (const rule of additions.rules) {
      const key = additions.ruleKeys[rule.id];
      const date = fixed[key] ?? moving[year][key];
      assert.ok(date, `Unabhängiger Sollwert fehlt für ${key}`);
      assert.equal(ruleDate05(rule, year), `${year}-${date}`, rule.id);
    }
  });
  it('erzeugt alle offenen Datensätze ganztägig und sperrt jede Produktwirkung', () => {
    assert.ok(additions.rules.every(rule => rule.status === 'open' && rule.exportClass === 'blockedEffect' && rule.approvalBasis === null && rule.reference === null && rule.dayPortion === 'fullDay'));
    assert.ok(additions.mappings.every(row => row[6] === 'blocked' && row[7] === null));
    assert.ok(additions.rules.every(rule => rule.from === '2026-01-01' && ruleDate05(rule, 2025) === null));
    assert.deepEqual([additions.notes.productExport, additions.notes.legalApproval, additions.notes.languageApproval, additions.notes.municipalLawIncluded], [false, false, false, false]);
  });
  it('trennt zwölf prozessuale Anwendungen von öffentlichen und arbeitsrechtlichen Listen', () => {
    const procedural = additions.rules.filter(rule => rule.category === 'proceduralEquivalentDay');
    assert.equal(procedural.length, 12);
    assert.deepEqual([...new Set(procedural.map(rule => rule.scope))].sort(), ['SG-ZPO-ADDITIONAL', 'SH-ZPO-ADDITIONAL', 'ZH-GOG-ALL']);
    assert.ok(additions.scopes.filter(row => ['SG-ZPO-ADDITIONAL', 'SH-ZPO-ADDITIONAL'].includes(row[0])).every(row => row[4].includes('Nur Ergänzung')));
    assert.equal(profile('AR-ARG-ALL').filter(rule => rule.category === 'labourLawHoliday').length, 6);
  });
  it('übernimmt Bundesquelle ohne Übertragung der alten Fachabnahme', () => {
    const national = additions.rules.filter(rule => additions.ruleKeys[rule.id] === 'NATIONAL-DAY' && rule.scope !== 'ZH-GOG-ALL');
    assert.equal(national.length, 6);
    assert.ok(national.every(rule => rule.source === 'SRC-BUNDESFEIERTAG-19940701' && rule.status === 'open'));
  });
  it('verwendet TG-Neuerlass 2026 und aktuellen Zürcher GOG-Nachtrag 131', () => {
    assert.equal(additions.sources.find(row => row[0] === 'SRC-TG-RTG-8229-V2949')[5], '2026-01-01');
    assert.equal(additions.sources.find(row => row[0] === 'SRC-ZH-GOG-2111-N131')[5], '2026-01-01');
    assert.ok(additions.sources.every(row => row[6] === '2026-09-13'));
  });
  it('führt zwei isolierte Stephanstag-Lücken statt einer stillen Vollständigkeitsbehauptung', () => {
    assert.deepEqual(additions.pendingCases.map(p => [p.canton, p.status]), [['CH-AR', 'contractGap'], ['CH-AI', 'sourceConflict']]);
    for (const pending of additions.pendingCases) {
      assert.ok(!additions.rules.some(rule => rule.jurisdiction === pending.canton && additions.ruleKeys[rule.id] === 'ST-STEPHEN'));
      assert.ok(additions.mappings.some(row => row.some(cell => typeof cell === 'string' && cell.includes(pending.id))));
      assert.ok(pending.sourceIds.every(id => additions.sources.some(row => row[0] === id)));
    }
    assert.ok(additions.pendingCases[1].reason.includes('26.12.2026'));
  });
  it('konkretisiert inneren Landesteil mit vier Bezirken, ohne Oberegg einzuschliessen', () => {
    const areas = additions.assignments.filter(row => row.scopeId === 'AI-RTG-INNER-ADDITIONAL');
    assert.deepEqual(areas.map(row => row.de).sort(), ['Appenzell', 'Gonten', 'Schlatt-Haslen', 'Schwende-Rüte']);
    assert.ok(areas.every(row => row.areaType === 'Bezirk' && row.parentAreaId === 'GEO-AI' && row.effect === 'include'));
    assert.ok(areas.every(row => additions.areaSourceEvidence.some(e => e.assignmentId === row.id)));
    assert.equal(profile('AI-RTG-INNER-ADDITIONAL')[0].source, 'SRC-AI-RTG-822200-V1327');
  });
  it('füllt vier Sprachen provisorisch und nimmt keine gewöhnliche Sonntagsserie auf', () => {
    assert.ok(additions.rules.every(rule => ['de', 'fr', 'it', 'rm'].every(language => rule[language]?.trim())));
    assert.ok(additions.rules.every(rule => ['fixedMonthDay', 'easterOffsetDays', 'nthWeekdayOfMonth'].includes(rule.calculation.type)));
    assert.equal(additions.holidayDefinitions.MAURITIUS.calculation.day, 22);
    assert.ok(additions.sources.every(row => row[7].includes('provisorisch')));
  });
  it('passt unverändert in den Vertrag 0.5.0', () => {
    const model = structuredClone(base);
    for (const field of ['rules', 'scopes', 'sources', 'mappings', 'reviews', 'assignments', 'areaSourceEvidence']) model[field].push(...additions[field]);
    for (const field of ['scopeLabels', 'ruleKeys', 'holidayDefinitions', 'jurisdictionLabels']) model[field] = { ...model[field], ...additions[field] };
    assert.equal(validateContract05(model), true);
  });
  it('weist falschen Ausgangsvertrag und fehlende Bundesreferenz zurück', () => {
    assert.throws(() => createEastAdditions({ ...base, contractVersion: '0.4.0' }), /Expected contract/);
    assert.throws(() => createEastAdditions({ ...base, sources: [] }), /Expected contract/);
  });
});
