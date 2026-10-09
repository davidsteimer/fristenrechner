// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  assertHolidayCatalog, assertHolidayCatalogProjection, assertHolidayCatalogSchemaContract, evaluateHolidayCatalogRule,
  isHolidayCatalogScopeMember, projectHolidayRules, HolidayCatalogError
} from '../../src/core/holidayCatalog';
import type { HolidayCatalog, HolidayCatalogRule } from '../../src/core/holidayCatalogTypes';
import type { CalendarRuleSet, HolidayCalendarRule } from '../../src/core/calendarRuleTypes';

const readJson = (path: string): any => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const IMPORT = readJson('../../data/candidates/2026-09-22-ap18c-workbook/holiday-candidate.json');
const BASELINE: CalendarRuleSet[] = ['ch-federal-calendar', 'be-public-holidays'].map(id =>
  readJson(`../../data/releases/2026-08-31-mvp-03-approved.1/calendars/${id}.json`));

test('catalog errors retain their Error and domain identity', () => {
  const error = new HolidayCatalogError('holidayCatalog.invalidContract', 'Test error');
  assert.ok(error instanceof Error);
  assert.ok(error instanceof HolidayCatalogError);
  assert.equal(Object.getPrototypeOf(error), HolidayCatalogError.prototype);
  assert.equal(error.name, 'HolidayCatalogError');
  assert.equal(error.reasonKey, 'holidayCatalog.invalidContract');
  assert.equal(error.message, 'Test error');
});

test('schema interpreter rejects later unsupported keywords instead of weakening validation', () => {
  const schema = readJson('../../schemas/holiday-catalog-v1.schema.json');
  assert.doesNotThrow(() => assertHolidayCatalogSchemaContract(schema));
  for (const [key, value] of [['anyOf', []], ['allOf', []], ['if', {}], ['unevaluatedProperties', false],
    ['uniqueItems', true], ['minProperties', 1], ['not', {}]] as const) {
    const changed = structuredClone(schema);
    changed.$defs.rule[key] = value;
    assert.throws(() => assertHolidayCatalogSchemaContract(changed), /Schema-Schlüsselwort/);
  }
  const refSibling = structuredClone(schema);
  refSibling.$defs.rule.properties.calculation.const = {};
  assert.throws(() => assertHolidayCatalogSchemaContract(refSibling), /Referenz-Geschwister/);
  const numberType = structuredClone(schema);
  numberType.$defs.rule.properties.priority.type = 'number';
  assert.throws(() => assertHolidayCatalogSchemaContract(numberType), /Schema-Datentyp/);
  const dateTime = structuredClone(schema);
  dateTime.$defs.rule.properties.from.format = 'date-time';
  assert.throws(() => assertHolidayCatalogSchemaContract(dateTime), /Schema-Format/);
  for (const pattern of ['', '(a+)+$', '^unknown$', 42]) {
    const unknownPattern = structuredClone(schema);
    unknownPattern.$defs.rule.properties.id.pattern = pattern;
    assert.throws(() => assertHolidayCatalogSchemaContract(unknownPattern), /Schema-Muster/);
  }
});
function fixture(): any {
  return structuredClone({
    $schema: 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/holiday-catalog-v1.schema.json',
    formatVersion: '1.0.0', dataKind: 'holidayCatalog', catalogId: 'ch-holiday-catalog',
    provenance: { workbook: IMPORT.source, importSha256: '9553f483678bc5f209099703588402a7dd65cf4d9aac8a00aadb6f9dbe966099', decision: 'DEC-2026-023' },
    acceptance: IMPORT.acceptance, data: IMPORT.data, areaSourceLinks: IMPORT.areaSourceLinks,
    interpretation: IMPORT.interpretation,
    calendarProjections: BASELINE.flatMap(c => c.rules.filter((r): r is HolidayCalendarRule => r.effect.type === 'holiday'))
      .map(r => ({ catalogRuleId: r.ruleId, calendarId: r.calendarId, ruleId: r.ruleId,
        labelKey: r.labelKey, kind: r.effect.kind, resultIdSuffix: r.effect.resultIdSuffix,
        legalEffect: r.effect.legalEffect, approvalBasis: '2026-08-31-mvp-03-approved.1' }))
  });
}
function rule(id: string): HolidayCatalogRule {
  const found = IMPORT.data.rules.find((r: HolidayCatalogRule) => r.id === id);
  assert.ok(found, id);
  return structuredClone(found);
}
function probe(id: string): HolidayCatalogRule {
  // Test-only broad validity is not a legal extension of the approved workbook.
  return { ...rule(id), from: '1583-01-01', to: '9999-12-31' };
}

test('actual approved workbook entities and boundaries survive the runtime projection losslessly', () => {
  const catalog = fixture();
  const before = JSON.stringify(catalog);
  assertHolidayCatalog(catalog);
  assert.equal(catalog.data.rules.length, 479);
  assert.equal(catalog.data.jurisdictions.length, 27);
  assert.equal(catalog.data.scopes.length, 49);
  assert.equal(catalog.data.assignments.length, 95);
  assert.equal(catalog.data.sources.length, 84);
  assert.equal(catalog.data.mappings.length, 92);
  assert.equal(catalog.data.reviews.length, 90);
  assert.equal(catalog.areaSourceLinks.length, 29);
  assert.deepEqual(catalog.data, IMPORT.data);
  assert.deepEqual(catalog.acceptance, IMPORT.acceptance);
  assert.deepEqual(catalog.interpretation, IMPORT.interpretation);
  assert.equal(JSON.stringify(catalog), before, 'validation must not mutate input');
  assert.ok(!Object.hasOwn(catalog, 'workbookEvidence'));
  assert.ok(!Object.hasOwn(catalog, 'annualOccurrences'));
});

test('all 1,437 independently imported 2026–2028 occurrences agree with the runtime evaluator', () => {
  const catalog: HolidayCatalog = fixture();
  for (const occurrence of IMPORT.annualOccurrences) {
    const r = catalog.data.rules.find(item => item.id === occurrence.ruleId)!;
    assert.deepEqual(evaluateHolidayCatalogRule(r, occurrence.year),
      { status: occurrence.status, date: occurrence.date }, `${r.id}/${occurrence.year}`);
  }
});

test('exactly twelve unchanged operative rules, unchanged inheritance and three court holidays', () => {
  const catalog: HolidayCatalog = fixture();
  assertHolidayCatalogProjection(catalog, BASELINE);
  const projected = projectHolidayRules(catalog);
  assert.deepEqual(projected, BASELINE.flatMap(c => c.rules.filter(r => r.effect.type === 'holiday')));
  const reordered = fixture();
  reordered.data.rules.reverse();
  reordered.calendarProjections.reverse();
  assert.deepEqual(projectHolidayRules(reordered), projected, 'projection is deterministic, not input-order dependent');
  assert.ok(projected.every(r => ['CH', 'BE'].includes(r.jurisdiction.code)));
  assert.equal(catalog.data.rules.filter(r => r.dayPortion === 'afternoonFromNoon').length, 2);
  assert.ok(!projected.some(r => r.ruleId.startsWith('SO-') || r.ruleId.startsWith('GR-') || r.ruleId.startsWith('NE-')));
});

const mutations: readonly [string, (catalog: any) => void][] = [
  ['unknown root field', c => { c.enabled = true; }],
  ['unknown data entity', c => { c.data.municipalLaw = []; }],
  ['unknown rule field', c => { c.data.rules[20].runtimeEnabled = true; }],
  ['prototype-named rule field', c => { c.data.rules[20].constructor = {}; }],
  ['prototype-named data field', c => { c.data.toString = {}; }],
  ['explicit __proto__ field', c => { Object.defineProperty(c.data.rules[20], '__proto__', { value: {}, enumerable: true }); }],
  ['unknown provenance field', c => { c.data.rules[20].provenance.official = true; }],
  ['missing Italian label', c => { delete c.data.rules[20].it; }],
  ['blank Rumantsch label', c => { c.data.rules[20].rm = ' '; }],
  ['unknown category', c => { c.data.rules[20].category = 'anyDay'; }],
  ['unknown date type', c => { c.data.rules[20].calculation.type = 'formula'; }],
  ['free date formula', c => { c.data.rules[20].calculation.formula = 'eval(1)'; }],
  ['invalid fixed date', c => { c.data.rules[20].calculation = { type: 'fixedMonthDay', month: 2, day: 31 }; }],
  ['missing condition', c => { delete c.data.rules[20].condition; }],
  ['unknown condition', c => { c.data.rules[20].condition = 'unlessHoliday'; }],
  ['incompatible condition anchor', c => { c.data.rules[20].condition = 'onlyMonday'; }],
  ['out of range offset', c => { c.data.rules[20].calculation = { type: 'easterOffsetDays', offsetDays: 367 }; }],
  ['fractional weekday', c => { c.data.rules[20].calculation = { type: 'nthWeekdayOfMonth', month: 9, isoWeekday: 1.5, occurrence: 3 }; }],
  ['reversed validity', c => { c.data.rules[20].to = '2025-12-31'; }],
  ['invalid ISO date', c => { c.data.rules[20].from = '2026-02-30'; }],
  ['rule outside scope validity', c => { c.data.rules[20].from = '2025-01-01'; }],
  ['duplicate rule', c => { c.data.rules.push(c.data.rules[20]); }],
  ['duplicate source', c => { c.data.sources.push(c.data.sources[20]); }],
  ['missing jurisdiction', c => { c.data.jurisdictions.pop(); }],
  ['unknown scope', c => { c.data.rules[20].scope = 'MISSING'; }],
  ['unknown source', c => { c.data.rules[20].source = 'MISSING'; }],
  ['wrong source jurisdiction', c => { c.data.sources[20].jurisdiction = 'CH-BE'; }],
  ['non-HTTPS source', c => { c.data.sources[20].url = 'http://example.org'; }],
  ['credentials in source', c => { c.data.sources[20].url = 'https://user:secret@example.org/'; }],
  ['false historical approval', c => { c.data.rules[20].status = 'approved'; c.data.rules[20].approvalBasis = '2026-08-31-mvp-03-approved.1'; }],
  ['false source approval', c => { c.data.sources[20].status = 'approved'; c.data.sources[20].approvalBasis = '2026-08-31-mvp-03-approved.1'; }],
  ['false review approval', c => { c.data.reviews[20].status = 'approved'; }],
  ['false mapping approval', c => { c.data.mappings[20].status = 'approved'; c.data.mappings[20].approvalBasis = '2026-08-31-mvp-03-approved.1'; }],
  ['missing acceptance boundary', c => { c.acceptance.boundaries.pop(); }],
  ['rewritten acceptance boundary', c => { c.acceptance.boundaries[0].statement = 'SO hat Fristwirkung'; }],
  ['changed workbook hash', c => { c.provenance.workbook.sha256 = '0'.repeat(64); }],
  ['official translation assertion', c => { c.interpretation.translationsAreNotOfficialLanguageApproval = false; }],
  ['unverified official identifier', c => { c.data.assignments[20].officialId = '1234'; }],
  ['unknown parent area', c => { c.data.assignments[20].parentAreaId = 'MISSING'; }],
  ['area cycle', c => { c.data.assignments[0].parentAreaId = 'GEO-BE'; }],
  ['conflicting repeated area', c => { c.data.assignments.find((a: any) => a.scopeId === 'FR-BAMG-REFORMED').de = 'Changed'; }],
  ['scope without inclusion', c => { c.data.assignments[1].effect = 'exclude'; }],
  ['overlapping assignment', c => { c.data.assignments.push({ ...c.data.assignments[20], id: 'DUP-AREA' }); }],
  ['assignment outside scope', c => { c.data.assignments[20].from = '2025-01-01'; }],
  ['missing area source link', c => { c.areaSourceLinks.pop(); }],
  ['duplicated area source link', c => { c.areaSourceLinks.push(c.areaSourceLinks[0]); }],
  ['contradictory area source', c => { c.areaSourceLinks[0].normSourceId = c.areaSourceLinks[0].areaSourceId; }],
  ['fabricated area source approval', c => { c.areaSourceLinks[0].status = 'approved'; }],
  ['extra operative projection', c => { c.calendarProjections.push(c.calendarProjections[0]); }],
  ['missing projection', c => { c.calendarProjections.pop(); }],
  ['renamed result ID', c => { c.calendarProjections[0].resultIdSuffix = 'CHANGED'; }],
  ['labour-law rule activation', c => { c.calendarProjections[0].catalogRuleId = c.data.rules.find((r: any) => r.category === 'labourLawHoliday').id; }],
  ['half-day activation', c => { c.calendarProjections[0].catalogRuleId = c.data.rules.find((r: any) => r.dayPortion === 'afternoonFromNoon').id; }],
  ['changed baseline date', c => { c.data.rules[0].calculation.day = 2; }],
  ['changed baseline label', c => { c.data.rules[0].de = 'Changed'; }],
  ['changed baseline source locator', c => { c.data.rules[0].locator = 'Art. 2'; }]
];
for (const [name, mutate] of mutations) test(`fail closed: ${name}`, () => {
  const catalog = fixture();
  mutate(catalog);
  assert.throws(() => assertHolidayCatalog(catalog));
});

const calendarMutations: readonly [string, (calendars: any[]) => void][] = [
  ['extra calendar', c => { c.push({ ...c[1], calendarId: 'ti-calendar' }); }],
  ['changed inheritance', c => { c[1].inherits = []; }],
  ['unknown inheritance', c => { c[1].inherits.push('extra-calendar'); }],
  ['calendar validity', c => { c[1].validity.from = '2025-01-01'; }],
  ['calendar jurisdiction', c => { c[1].jurisdiction.code = 'TI'; }],
  ['additional holiday', c => { c[1].rules.push({ ...c[1].rules[0], ruleId: 'EXTRA' }); }],
  ['missing holiday', c => { c[1].rules.pop(); }],
  ['changed holiday', c => { c[1].rules[0].calculation.day = 3; }],
  ['changed court holiday', c => { c[0].rules[1].calculation.startsOn.offsetDays = -8; }],
  ['additional override', c => { c[0].rules.push({ ...c[0].rules[0], ruleId: 'EXTRA', effect: { type: 'explicitDateOverride', operation: 'add' } }); }]
];
for (const [name, mutate] of calendarMutations) test(`reject inconsistent operative projection: ${name}`, () => {
  const calendars = structuredClone(BASELINE) as any[];
  mutate(calendars);
  assert.throws(() => assertHolidayCatalogProjection(fixture(), calendars));
});

test('altering the catalog and its operative calendar together cannot bypass the historical reference', () => {
  const catalog = fixture();
  const calendars = structuredClone(BASELINE) as any[];
  catalog.data.rules[0].calculation.day = 2;
  calendars[0].rules[0].calculation.day = 2;
  assert.throws(() => assertHolidayCatalogProjection(catalog, calendars));
});

test('FR geographic exceptions are intersections, not religious assumptions or procedural activation', () => {
  const catalog = fixture();
  assert.equal(isHolidayCatalogScopeMember(catalog, 'FR-BAMG-CATHOLIC', 'GEO-FR-WUENNEWIL-FLAMATT', '2026-09-22'), true);
  assert.equal(isHolidayCatalogScopeMember(catalog, 'FR-BAMG-CATHOLIC', 'GEO-FR-FLAMATT', '2026-09-22'), false);
  assert.equal(isHolidayCatalogScopeMember(catalog, 'FR-BAMG-REFORMED', 'GEO-FR-WUENNEWIL-FLAMATT', '2026-09-22'), false);
  assert.equal(isHolidayCatalogScopeMember(catalog, 'FR-BAMG-REFORMED', 'GEO-FR-FLAMATT', '2026-09-22'), true);
  assert.equal(isHolidayCatalogScopeMember(catalog, 'BE-ALL', 'GEO-FR-FLAMATT', '2026-09-22'), false);
  assert.equal(isHolidayCatalogScopeMember(catalog, 'FR-BAMG-CATHOLIC', 'GEO-FR-FLAMATT', '2025-09-22'), false);
  assert.throws(() => isHolidayCatalogScopeMember(catalog, 'MISSING', 'GEO-FR', '2026-09-22'));
  assert.throws(() => isHolidayCatalogScopeMember(catalog, 'FR-BAMG-CATHOLIC', 'MISSING', '2026-09-22'));
  assert.throws(() => isHolidayCatalogScopeMember(catalog, 'FR-BAMG-CATHOLIC', 'GEO-FR', '2026-02-30'));
  assert.equal(projectHolidayRules(catalog).length, 12);
});

test('400-year probes for AR/AI/NE conditions use independent civil weekdays', () => {
  for (let year = 2000; year < 2400; year++) {
    for (const id of ['AR-ARG-ALL-DAY-ST-STEPHEN', 'AI-RTG-ALL-DAY-ST-STEPHEN']) {
      const result = evaluateHolidayCatalogRule(probe(id), year);
      const christmasWeekday = new Date(Date.UTC(year, 11, 25)).getUTCDay();
      assert.deepEqual(result, [1, 5].includes(christmasWeekday)
        ? { status: 'notApplicable', date: null } : { status: 'occurs', date: `${year}-12-26` });
    }
    for (const [id, month, day] of [
      ['NE-LDJF-BASE-DAY-NEW-YEAR-SUBSTITUTE', 1, 2],
      ['NE-LDJF-BASE-DAY-CHRISTMAS-SUBSTITUTE', 12, 26]
    ] as const) {
      const previousIsSunday = new Date(Date.UTC(year, month - 1, day - 1)).getUTCDay() === 0;
      assert.deepEqual(evaluateHolidayCatalogRule(probe(id), year), previousIsSunday
        ? { status: 'occurs', date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` }
        : { status: 'notApplicable', date: null });
    }
  }
});

test('GL moves Holy Thursday by seven days and applies validity to the resulting date', () => {
  const base = rule('GL-RTG-ALL-DAY-NAEFELSER-FAHRT');
  assert.deepEqual(evaluateHolidayCatalogRule(base, 2026), { status: 'occurs', date: '2026-04-09' });
  assert.deepEqual(evaluateHolidayCatalogRule({ ...base, from: '2026-04-03' }, 2026), { status: 'occurs', date: '2026-04-09' });
  assert.deepEqual(evaluateHolidayCatalogRule({ ...base, to: '2026-04-08' }, 2026), { status: 'outsideValidity', date: null });
  assert.deepEqual(evaluateHolidayCatalogRule(base, 2027), { status: 'occurs', date: '2027-04-01' });
  assert.deepEqual(evaluateHolidayCatalogRule(base, 2028), { status: 'occurs', date: '2028-04-06' });
});

test('offset weekday calculation crosses month and year boundaries without timezone dependence', () => {
  const base = probe('GE-CAL-DAY-NEW-YEAR');
  assert.deepEqual(evaluateHolidayCatalogRule({ ...base, calculation: {
    type: 'nthWeekdayOffsetDays', month: 12, isoWeekday: 7, occurrence: 4, offsetDays: 7
  } }, 2026), { status: 'occurs', date: '2027-01-03' });
  assert.deepEqual(evaluateHolidayCatalogRule({ ...base, calculation: {
    type: 'nthWeekdayOffsetDays', month: 1, isoWeekday: 1, occurrence: 1, offsetDays: -7
  } }, 2026), { status: 'occurs', date: '2025-12-29' });
  assert.deepEqual(evaluateHolidayCatalogRule({ ...base, calculation: {
    type: 'fixedMonthDay', month: 2, day: 29
  } }, 2024), { status: 'occurs', date: '2024-02-29' });
  assert.throws(() => evaluateHolidayCatalogRule({ ...base, calculation: { type: 'fixedMonthDay', month: 2, day: 29 } }, 2026));
});

test('invalid dates, non-existing fifth weekdays and Gregorian overflow throw, never silently omit', () => {
  const base = probe('GE-CAL-DAY-NEW-YEAR');
  for (const year of [1582, 10000, 2026.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => evaluateHolidayCatalogRule(base, year));
  }
  assert.throws(() => evaluateHolidayCatalogRule({ ...base, calculation: {
    type: 'nthWeekdayOfMonth', month: 2, isoWeekday: 1, occurrence: 5
  } }, 2026));
  assert.throws(() => evaluateHolidayCatalogRule({ ...base, calculation: {
    type: 'nthWeekdayOffsetDays', month: 12, isoWeekday: 7, occurrence: 4, offsetDays: 366
  } }, 9999));
  assert.throws(() => evaluateHolidayCatalogRule({ ...base, calculation: {
    type: 'easterOffsetDays', offsetDays: -366
  } }, 1583));
});

test('absent annual occurrence and out-of-validity occurrence remain different', () => {
  assert.deepEqual(evaluateHolidayCatalogRule(rule('AR-ARG-ALL-DAY-ST-STEPHEN'), 2026), { status: 'notApplicable', date: null });
  assert.deepEqual(evaluateHolidayCatalogRule(rule('AR-ARG-ALL-DAY-ST-STEPHEN'), 2025), { status: 'outsideValidity', date: null });
  assert.deepEqual(evaluateHolidayCatalogRule(rule('BE-CAL-HOL-NEW-YEAR'), 2025), { status: 'outsideValidity', date: null });
});
