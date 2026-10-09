// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  calculateCalendarRuleOccurrence,
  CalendarGenerationError,
  generateCalendarFromRules
} from '../../src/core/generateCalendar';
import type {
  CalendarHolidayCondition,
  CalendarRuleSet,
  HolidayCalendarRule
} from '../../src/core/calendarRuleTypes';

function holiday(
  calculation: HolidayCalendarRule['calculation'] = { type: 'fixedMonthDay', month: 1, day: 1 },
  condition: CalendarHolidayCondition = 'always'
): HolidayCalendarRule {
  return {
    ruleId: 'TEST-HOLIDAY', calendarId: 'test-calendar',
    jurisdiction: { level: 'cantonal', code: 'SO' },
    labelKey: 'holiday.test', labels: { de: 'Prüftag', fr: 'Jour de contrôle' },
    priority: 100, validity: { from: '1583-01-01', to: null },
    sourceRefs: [{ sourceId: 'SRC-TEST', locator: 'Testvertrag' }],
    calculation, condition,
    effect: {
      type: 'holiday', kind: 'proceduralEquivalentDay',
      legalEffect: 'nonWorkingDayEquivalentToSunday', resultIdSuffix: 'TEST'
    }
  };
}

function calendar(rule = holiday()): CalendarRuleSet {
  return {
    formatVersion: '3.0.0', dataKind: 'calendar', calendarId: 'test-calendar',
    jurisdiction: { level: 'cantonal', code: 'SO' },
    validity: { from: '1583-01-01', to: null }, inherits: [],
    sources: [{ sourceId: 'SRC-TEST' }], rules: [rule],
    projection: {
      catalogId: 'ch-holiday-catalog', catalogFormatVersion: '2.0.0',
      projectionId: 'projection-test', sourceHash: 'a'.repeat(64)
    }
  };
}

function dates(rule: HolidayCalendarRule, from = '2026-01-01', to = '2026-12-31'): string[] {
  return generateCalendarFromRules([calendar(rule)], 'test-calendar', { from, to })
    .calendar.holidays.map(value => value.date);
}

test('AP22C1 generates procedural equivalent days with source trace and Format 3 identity', () => {
  const generated = generateCalendarFromRules([calendar()], 'test-calendar', {
    from: '2026-01-01', to: '2026-12-31'
  });
  assert.equal(generated.calendar.formatVersion, '3.0.0');
  assert.equal(generated.calendar.holidays[0]?.kind, 'proceduralEquivalentDay');
  assert.equal(generated.calendar.holidays[0]?.legalEffect, 'nonWorkingDayEquivalentToSunday');
  assert.deepEqual(generated.trace[0]?.sourceRefs, [{ sourceId: 'SRC-TEST', locator: 'Testvertrag' }]);
});

test('AP22C1 AR/AI exclusion and both NE substitutes match independent civil weekdays for 400 years', () => {
  const stephen = dates(holiday({ type: 'fixedMonthDay', month: 12, day: 26 }, 'unlessTuesdayOrSaturday'), '2000-01-01', '2399-12-31');
  const jan = dates(holiday({ type: 'fixedMonthDay', month: 1, day: 2 }, 'onlyMonday'), '2000-01-01', '2399-12-31');
  const dec = dates(holiday({ type: 'fixedMonthDay', month: 12, day: 26 }, 'onlyMonday'), '2000-01-01', '2399-12-31');
  for (let year = 2000; year <= 2399; year += 1) {
    const december = `${year}-12-26`;
    const january = `${year}-01-02`;
    assert.equal(stephen.includes(december), ![2, 6].includes(new Date(`${december}T12:00:00Z`).getUTCDay()), december);
    assert.equal(jan.includes(january), new Date(`${january}T12:00:00Z`).getUTCDay() === 1, january);
    assert.equal(dec.includes(december), new Date(`${december}T12:00:00Z`).getUTCDay() === 1, december);
  }
});

test('AP22C1 isolated GL arithmetic (not product coverage) shifts Holy Thursday and checks actual-date validity', () => {
  const rule = holiday({ type: 'nthWeekdayOfMonth', month: 4, isoWeekday: 4, occurrence: 1 }, 'shiftHolyThursdayBy7Days');
  assert.deepEqual(dates(rule), ['2026-04-09']);
  assert.deepEqual(dates(rule, '2027-01-01', '2027-12-31'), ['2027-04-01']);
  assert.deepEqual(dates(rule, '2028-01-01', '2028-12-31'), ['2028-04-06']);
  assert.deepEqual(dates({ ...rule, validity: { from: '2026-04-03', to: null } }), ['2026-04-09']);
  assert.deepEqual(dates({ ...rule, validity: { from: '2026-01-01', to: '2026-04-08' } }), []);
});

test('AP22C1 weekday offset handles the GE and VD patterns', () => {
  assert.deepEqual(dates(holiday({ type: 'nthWeekdayOffsetDays', month: 9, isoWeekday: 7, occurrence: 1, offsetDays: 4 })), ['2026-09-10']);
  assert.deepEqual(dates(holiday({ type: 'nthWeekdayOffsetDays', month: 9, isoWeekday: 7, occurrence: 3, offsetDays: 1 })), ['2026-09-21']);
});

test('AP22C1 offset anchors are drawn from adjacent years and results retain actual-date validity', () => {
  const nextYear = holiday({ type: 'nthWeekdayOffsetDays', month: 12, isoWeekday: 7, occurrence: 4, offsetDays: 7 });
  assert.deepEqual(dates(nextYear, '2027-01-01', '2027-01-03'), ['2027-01-03']);
  assert.deepEqual(dates({ ...nextYear, validity: { from: '2027-01-01', to: null } }, '2027-01-01', '2027-01-03'), ['2027-01-03']);
  const previousYear = holiday({ type: 'nthWeekdayOffsetDays', month: 1, isoWeekday: 1, occurrence: 1, offsetDays: -7 });
  assert.deepEqual(dates(previousYear, '2025-12-29', '2025-12-31'), ['2025-12-29']);
  assert.deepEqual(dates({ ...previousYear, validity: { from: '2026-01-01', to: null } }, '2025-12-29', '2025-12-31'), []);
  assert.deepEqual(dates(holiday({ type: 'nthWeekdayOffsetDays', month: 12, isoWeekday: 7, occurrence: 4, offsetDays: 366 }), '2027-12-28', '2027-12-28'), ['2027-12-28']);
  assert.deepEqual(dates(holiday({ type: 'nthWeekdayOffsetDays', month: 1, isoWeekday: 1, occurrence: 1, offsetDays: -366 }), '2025-01-04', '2025-01-04'), ['2025-01-04']);
});

test('AP22C1 same-day source contributions remain distinct in the rule trace', () => {
  const first = holiday();
  const second = {
    ...first, ruleId: 'TEST-SECOND-BASIS', sourceRefs: [{ sourceId: 'SRC-SECOND', locator: 'Zweite Norm' }],
    effect: { ...first.effect, resultIdSuffix: 'SECOND' }
  };
  const fixture = {
    ...calendar(first), rules: [first, second],
    sources: [{ sourceId: 'SRC-TEST' }, { sourceId: 'SRC-SECOND' }]
  };
  const generated = generateCalendarFromRules([fixture], 'test-calendar', { from: '2026-01-01', to: '2026-01-01' });
  assert.deepEqual(generated.calendar.holidays.map(value => value.date), ['2026-01-01', '2026-01-01']);
  assert.deepEqual(generated.appliedRuleIds, ['TEST-HOLIDAY', 'TEST-SECOND-BASIS']);
  assert.equal(new Set(generated.trace.flatMap(value => value.generatedIds)).size, 2);
  const colliding = { ...fixture, rules: [first, { ...second, effect: first.effect }] };
  assert.throws(() => generateCalendarFromRules([colliding], 'test-calendar', { from: '2026-01-01', to: '2026-01-01' }), CalendarGenerationError);
});

test('AP22C1 fifth weekdays are tested in the actual anchor year, not an arbitrary preflight year', () => {
  const fifth = holiday({ type: 'nthWeekdayOffsetDays', month: 1, isoWeekday: 5, occurrence: 5, offsetDays: 0 });
  assert.deepEqual(dates(fifth, '2026-01-01', '2026-01-31'), ['2026-01-30']);
  assert.throws(() => dates(fifth, '2024-01-01', '2024-01-31'), CalendarGenerationError);
  const withoutOffset = holiday({ type: 'nthWeekdayOfMonth', month: 1, isoWeekday: 5, occurrence: 5 });
  assert.deepEqual(dates(withoutOffset, '2026-01-01', '2026-01-31'), ['2026-01-30']);
});

test('AP22C1 rejects unknown conditions, omitted conditions and incompatible anchors', () => {
  for (const condition of [undefined, null, '', 'sometimes', 'unlessTuesdayOrSaturday', 'onlyMonday', 'shiftHolyThursdayBy7Days']) {
    const rule = { ...holiday(), condition } as unknown as HolidayCalendarRule;
    assert.throws(() => dates(rule), CalendarGenerationError, String(condition));
  }
  for (const [month, day] of [[1, 26], [12, 2]]) {
    assert.throws(() => dates(holiday({ type: 'fixedMonthDay', month: month!, day: day! }, 'onlyMonday')), CalendarGenerationError);
  }
});

test('AP22C1 validates weekday offset shape and rejects ISO overflow', () => {
  const valid = { type: 'nthWeekdayOffsetDays' as const, month: 9, isoWeekday: 7, occurrence: 3, offsetDays: 1 };
  for (const offsetDays of [-367, 367, 0.5, Number.NaN]) {
    assert.throws(() => calculateCalendarRuleOccurrence({ ...valid, offsetDays }, 2026), CalendarGenerationError);
  }
  for (const patch of [{ month: 0 }, { month: 13 }, { isoWeekday: 0 }, { isoWeekday: 8 }, { occurrence: 0 }, { occurrence: 6 }]) {
    assert.throws(() => calculateCalendarRuleOccurrence({ ...valid, ...patch }, 2026), CalendarGenerationError);
  }
  assert.throws(() => calculateCalendarRuleOccurrence({ ...valid, month: 12, offsetDays: 366 }, 9999), CalendarGenerationError);
  assert.throws(() => calculateCalendarRuleOccurrence({ ...valid, month: 1, offsetDays: -366 }, 1), CalendarGenerationError);
});

test('AP22C1 requires valid projection metadata, while explicit null is valid for unprojected rules', () => {
  const fixture = calendar();
  for (const projection of [undefined, {}, { ...fixture.projection, sourceHash: 'wrong' }, { ...fixture.projection, catalogFormatVersion: '1.0.0' }]) {
    const invalid = { ...fixture, projection } as unknown as CalendarRuleSet;
    assert.throws(() => generateCalendarFromRules([invalid], 'test-calendar', { from: '2026-01-01', to: '2026-12-31' }), CalendarGenerationError);
  }
  const unprojected = { ...fixture, formatVersion: '3.0.0' as const, projection: null };
  assert.doesNotThrow(() => generateCalendarFromRules([unprojected], 'test-calendar', { from: '2026-01-01', to: '2026-12-31' }));
});

test('AP22C1 v3 does not smuggle its additions into historical v2', () => {
  const fixture = calendar();
  const rule = holiday();
  const oldRule = { ...rule, effect: { ...rule.effect, kind: 'cantonalPublicHoliday' as const } };
  delete (oldRule as { condition?: unknown }).condition;
  const old = { ...fixture, formatVersion: '2.0.0', rules: [oldRule] } as unknown as CalendarRuleSet;
  delete (old as { projection?: unknown }).projection;
  assert.doesNotThrow(() => generateCalendarFromRules([old], 'test-calendar', { from: '2026-01-01', to: '2026-12-31' }));
  for (const changed of [
    { ...old, projection: null },
    { ...old, rules: [{ ...oldRule, condition: 'always' }] },
    { ...old, rules: [rule] },
    { ...old, rules: [{ ...oldRule, calculation: { type: 'nthWeekdayOffsetDays', month: 9, isoWeekday: 7, occurrence: 3, offsetDays: 1 } }] }
  ]) {
    assert.throws(() => generateCalendarFromRules([changed as unknown as CalendarRuleSet], 'test-calendar', { from: '2026-01-01', to: '2026-12-31' }), CalendarGenerationError);
  }
});

test('AP22C1 CH/BE rules and federal suspensions produce the same historical results after v3 translation', () => {
  const path = 'data/releases/2026-10-01-mvp-06-approved.1/calendars/';
  const original = ['ch-federal-calendar', 'be-public-holidays'].map(id => JSON.parse(readFileSync(`${path}${id}.json`, 'utf8')) as CalendarRuleSet);
  const translated = original.map(value => ({
    ...value, formatVersion: '3.0.0' as const, projection: null,
    rules: value.rules.map(rule => rule.effect.type === 'holiday' ? { ...rule, condition: 'always' as const } : rule)
  }));
  const range = { from: '2026-01-01', to: '2029-12-31' };
  const previous = generateCalendarFromRules(original, 'be-public-holidays', range);
  const current = generateCalendarFromRules(translated, 'be-public-holidays', range);
  assert.deepEqual({ ...current, calendar: { ...current.calendar, formatVersion: '2.0.0' } }, previous);
  const suspension = translated[0]!.rules.find(rule => rule.effect.type === 'suspensionPeriod')!;
  const broken = { ...translated[0]!, rules: [{ ...suspension, condition: 'always' }] } as unknown as CalendarRuleSet;
  assert.throws(() => generateCalendarFromRules([broken], 'ch-federal-calendar', range), CalendarGenerationError);
  assert.throws(() => generateCalendarFromRules([original[0]!, translated[1]!], 'be-public-holidays', range), CalendarGenerationError);
  assert.throws(() => generateCalendarFromRules([translated[0]!, original[1]!], 'be-public-holidays', range), CalendarGenerationError);
});
