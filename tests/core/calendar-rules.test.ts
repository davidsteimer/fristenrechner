// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  calculateCalendarRuleOccurrence,
  calculateGregorianEaster,
  CalendarGenerationError,
  generateCalendarFromRules,
  isLeapYear
} from '../../src/core';
import type {
  CalendarRule,
  CalendarRuleOccurrence,
  CalendarRuleSet,
  Holiday,
  SuspensionSet
} from '../../src/core';

const repositoryRoot = process.cwd();
const candidateDirectory = 'data/candidates/2026-08-31-ap12a-eternal-calendar';

interface ReferenceSuite {
  readonly algorithmCases: readonly {
    readonly caseId: string;
    readonly year: number;
    readonly calculation: Parameters<typeof calculateCalendarRuleOccurrence>[0];
    readonly expected: CalendarRuleOccurrence;
  }[];
  readonly leapYearCases: readonly {
    readonly caseId: string;
    readonly year: number;
    readonly expectedLeapYear: boolean;
  }[];
}

interface LegacyCalendar {
  readonly holidays: readonly Holiday[];
  readonly suspensionSets: readonly SuspensionSet[];
}

function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(join(repositoryRoot, relativePath), 'utf8')) as unknown;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const chRules = readJson(`${candidateDirectory}/ch-federal-calendar.json`) as CalendarRuleSet;
const beRules = readJson(`${candidateDirectory}/be-public-holidays.json`) as CalendarRuleSet;
const referenceSuite = readJson(
  'tests/calendar-rules/candidates/ap12a-reference-cases.json'
) as ReferenceSuite;
const legacyCh = readJson(
  'data/releases/2026-08-31-mvp-02-approved.1/calendars/ch-federal-calendar.json'
) as LegacyCalendar;
const legacyBe = readJson(
  'data/releases/2026-08-31-mvp-02-approved.1/calendars/be-public-holidays.json'
) as LegacyCalendar;

function errorReason(reasonKey: string): (error: unknown) => boolean {
  return error => error instanceof CalendarGenerationError && error.reasonKey === reasonKey;
}

function sortedProfiles(values: readonly string[]): string[] {
  return [...values].sort();
}

function overrideRule(
  ruleId: string,
  operation: 'add' | 'suppress' | 'replace',
  priority = 200,
  targetRuleId = 'CH-CAL-HOL-NATIONAL-DAY'
): CalendarRule {
  const common = {
    ruleId,
    calendarId: 'ch-federal-calendar',
    jurisdiction: { level: 'federal' as const, code: 'CH' },
    labelKey: 'override.ch.nationalDay',
    labels: {
      de: 'Einmalige Abweichung zum Bundesfeiertag',
      fr: 'Dérogation unique à la fête nationale'
    },
    priority,
    validity: { from: '2028-08-01', to: '2028-08-02' },
    sourceRefs: [{ sourceId: 'SRC-BUNDESFEIERTAG-19940701', locator: 'Art. 1' }]
  };
  const replacementHoliday = {
    kind: 'federalHoliday' as const,
    labelKey: 'holiday.ch.nationalDay',
    labels: { de: 'Bundesfeiertag', fr: 'Fête nationale' },
    legalEffect: 'nonWorkingDayEquivalentToSunday' as const,
    resultIdSuffix: operation === 'add' ? 'EXTRA-HOLIDAY' : 'NATIONAL-DAY'
  };
  if (operation === 'add') {
    return {
      ...common,
      calculation: { type: 'explicitDateOverride', date: '2028-08-02' },
      effect: { type: 'explicitDateOverride', operation, replacementHoliday }
    };
  }
  if (operation === 'suppress') {
    return {
      ...common,
      calculation: { type: 'explicitDateOverride', targetDate: '2028-08-01' },
      effect: { type: 'explicitDateOverride', operation, targetRuleId }
    };
  }
  return {
    ...common,
    calculation: {
      type: 'explicitDateOverride',
      targetDate: '2028-08-01',
      replacementDate: '2028-08-02'
    },
    effect: {
      type: 'explicitDateOverride',
      operation,
      targetRuleId,
      replacementHoliday
    }
  };
}

function chWithRules(...rules: readonly CalendarRule[]): CalendarRuleSet {
  return { ...chRules, rules: [...chRules.rules, ...rules] };
}

function mutableRuleSets(): Array<Record<string, unknown>> {
  return clone([chRules, beRules]) as unknown as Array<Record<string, unknown>>;
}

function mutableRules(ruleSet: Record<string, unknown>): Array<Record<string, unknown>> {
  return ruleSet.rules as Array<Record<string, unknown>>;
}

function asRuleSets(value: Array<Record<string, unknown>>): CalendarRuleSet[] {
  return value as unknown as CalendarRuleSet[];
}

describe('AP12B-Kalenderalgorithmen', () => {
  for (const referenceCase of referenceSuite.algorithmCases) {
    it(`${referenceCase.caseId} stimmt mit dem abgenommenen Referenzvertrag überein`, () => {
      assert.deepEqual(
        calculateCalendarRuleOccurrence(
          referenceCase.calculation,
          referenceCase.year,
          referenceCase.caseId
        ),
        referenceCase.expected
      );
    });
  }

  for (const referenceCase of referenceSuite.leapYearCases) {
    it(`${referenceCase.caseId} verwendet die gregorianische Schaltjahrregel`, () => {
      assert.equal(isLeapYear(referenceCase.year), referenceCase.expectedLeapYear);
    });
  }

  it('blockiert Ostern ausserhalb des unterstützten gregorianischen Bereichs', () => {
    assert.throws(() => calculateGregorianEaster(1582), errorReason('calendar.unsupportedGregorianYear'));
  });

  it('enthält keine JavaScript-Date-Arithmetik im Produktgenerator', () => {
    const source = readFileSync(join(repositoryRoot, 'src/core/generateCalendar.ts'), 'utf8');
    assert.doesNotMatch(source, /\b(?:new\s+)?Date\s*\(/);
  });
});

describe('AP12B-Parität und Vererbung', () => {
  it('rekonstruiert den eidgenössischen MVP-0.2-Kalender einschliesslich Randperioden', () => {
    const generated = generateCalendarFromRules(
      [chRules, beRules],
      'ch-federal-calendar',
      { from: '2025-12-18', to: '2029-01-02' }
    );
    assert.deepEqual(generated.calendar.holidays, legacyCh.holidays);
    assert.equal(generated.calendar.suspensionSets.length, 1);
    const generatedSet = generated.calendar.suspensionSets[0];
    const legacySet = legacyCh.suspensionSets[0];
    assert.ok(generatedSet && legacySet);
    assert.equal(generatedSet.suspensionSetId, 'ch-court-holidays');
    assert.deepEqual(
      sortedProfiles(generatedSet.applicableProfileIds),
      sortedProfiles(legacySet.applicableProfileIds)
    );
    assert.deepEqual(generatedSet.periods, legacySet.periods);
    assert.equal(generated.calendar.inherits.length, 0);
  });

  it('löst den bernischen Kalender mit geerbtem Bundesfeiertag und Stillständen vollständig auf', () => {
    const generated = generateCalendarFromRules(
      [chRules, beRules],
      'be-public-holidays',
      { from: '2026-01-01', to: '2028-12-31' }
    );
    const expectedHolidays = [...legacyBe.holidays, ...legacyCh.holidays]
      .filter(holiday => holiday.date >= '2026-01-01' && holiday.date <= '2028-12-31')
      .sort((left, right) => left.date.localeCompare(right.date)
        || left.holidayId.localeCompare(right.holidayId));
    assert.deepEqual(generated.calendar.holidays, expectedHolidays);
    assert.equal(generated.calendar.holidays.length, 36);
    assert.equal(generated.calendar.suspensionSets[0]?.periods.length, 10);
    assert.ok(generated.appliedRuleIds.includes('CH-CAL-HOL-NATIONAL-DAY'));
    assert.ok(generated.appliedRuleIds.includes('BE-CAL-HOL-FEDERAL-FAST'));
    assert.ok(generated.trace.every(step => step.sourceRefs.length > 0));
  });

  it('liefert bei wiederholter Generierung bytegleiches JSON', () => {
    const first = generateCalendarFromRules(
      [chRules, beRules],
      'be-public-holidays',
      { from: '2026-01-01', to: '2028-12-31' }
    );
    const second = generateCalendarFromRules(
      [chRules, beRules],
      'be-public-holidays',
      { from: '2026-01-01', to: '2028-12-31' }
    );
    assert.equal(JSON.stringify(first), JSON.stringify(second));
  });
});

describe('AP12B-Overrides', () => {
  it('fügt einen einmaligen zusätzlichen Feiertag hinzu', () => {
    const rule = overrideRule('CH-CAL-OVERRIDE-ADD-2028', 'add');
    const generated = generateCalendarFromRules(
      [chWithRules(rule)],
      'ch-federal-calendar',
      { from: '2028-08-01', to: '2028-08-02' }
    );
    assert.deepEqual(
      generated.calendar.holidays.map(holiday => holiday.date),
      ['2028-08-01', '2028-08-02']
    );
    assert.deepEqual(generated.appliedOverrideRuleIds, ['CH-CAL-OVERRIDE-ADD-2028']);
  });

  it('unterdrückt ein eindeutig bezeichnetes Regelergebnis', () => {
    const rule = overrideRule('CH-CAL-OVERRIDE-SUPPRESS-2028', 'suppress');
    const generated = generateCalendarFromRules(
      [chWithRules(rule)],
      'ch-federal-calendar',
      { from: '2028-08-01', to: '2028-08-01' }
    );
    assert.deepEqual(generated.calendar.holidays, []);
    assert.deepEqual(generated.trace.at(-1), {
      ruleId: 'CH-CAL-OVERRIDE-SUPPRESS-2028',
      calendarId: 'ch-federal-calendar',
      operation: 'suppressHoliday',
      sourceRefs: [{ sourceId: 'SRC-BUNDESFEIERTAG-19940701', locator: 'Art. 1' }],
      generatedIds: [],
      removedIds: ['CH-2028-08-01-NATIONAL-DAY']
    });
  });

  it('ersetzt einen Feiertag an einem anderen konkreten Datum', () => {
    const rule = overrideRule('CH-CAL-OVERRIDE-REPLACE-2028', 'replace');
    const generated = generateCalendarFromRules(
      [chWithRules(rule)],
      'ch-federal-calendar',
      { from: '2028-08-01', to: '2028-08-02' }
    );
    assert.deepEqual(
      generated.calendar.holidays.map(holiday => [holiday.holidayId, holiday.date]),
      [['CH-2028-08-02-NATIONAL-DAY', '2028-08-02']]
    );
    assert.deepEqual(generated.appliedOverrideRuleIds, ['CH-CAL-OVERRIDE-REPLACE-2028']);
  });

  it('wendet bei unterschiedlichen Prioritäten nur den eindeutigen Gewinner an', () => {
    const suppress = overrideRule('CH-CAL-OVERRIDE-SUPPRESS-2028', 'suppress', 200);
    const replace = overrideRule('CH-CAL-OVERRIDE-REPLACE-2028', 'replace', 300);
    const generated = generateCalendarFromRules(
      [chWithRules(suppress, replace)],
      'ch-federal-calendar',
      { from: '2028-08-01', to: '2028-08-02' }
    );
    assert.deepEqual(
      generated.calendar.holidays.map(holiday => holiday.date),
      ['2028-08-02']
    );
    assert.deepEqual(generated.appliedOverrideRuleIds, ['CH-CAL-OVERRIDE-REPLACE-2028']);
  });
});

describe('AP12B-Sicherheitsgrenzen', () => {
  it('blockiert einen unbekannten Regeltyp', () => {
    const invalid = mutableRuleSets();
    const rule = mutableRules(invalid[0] as Record<string, unknown>)[0] as Record<string, unknown>;
    (rule.calculation as Record<string, unknown>).type = 'lunarGuess';
    assert.throws(
      () => generateCalendarFromRules(
        asRuleSets(invalid),
        'ch-federal-calendar',
        { from: '2026-01-01', to: '2026-12-31' }
      ),
      errorReason('calendar.unknownRuleType')
    );
  });

  it('blockiert ein ungültiges Fixdatum', () => {
    const invalid = mutableRuleSets();
    const rule = mutableRules(invalid[1] as Record<string, unknown>)[0] as Record<string, unknown>;
    Object.assign(rule.calculation as Record<string, unknown>, { month: 2, day: 30 });
    assert.throws(
      () => generateCalendarFromRules(
        asRuleSets(invalid),
        'be-public-holidays',
        { from: '2026-01-01', to: '2026-12-31' }
      ),
      errorReason('calendar.invalidFixedDate')
    );
  });

  it('blockiert eine doppelte Regel-ID', () => {
    const invalid = mutableRuleSets();
    const rules = mutableRules(invalid[1] as Record<string, unknown>);
    (rules[1] as Record<string, unknown>).ruleId = (rules[0] as Record<string, unknown>).ruleId;
    assert.throws(
      () => generateCalendarFromRules(
        asRuleSets(invalid),
        'be-public-holidays',
        { from: '2026-01-01', to: '2026-12-31' }
      ),
      errorReason('calendar.duplicateRuleId')
    );
  });

  it('blockiert einen Vererbungszyklus', () => {
    const invalid = mutableRuleSets();
    (invalid[0] as Record<string, unknown>).inherits = ['be-public-holidays'];
    assert.throws(
      () => generateCalendarFromRules(
        asRuleSets(invalid),
        'be-public-holidays',
        { from: '2026-01-01', to: '2026-12-31' }
      ),
      errorReason('calendar.inheritanceCycle')
    );
  });

  it('blockiert einen Override ohne auflösbares Ziel', () => {
    const rule = overrideRule(
      'CH-CAL-OVERRIDE-UNMATCHED-2028',
      'suppress',
      200,
      'CH-CAL-HOL-UNKNOWN'
    );
    assert.throws(
      () => generateCalendarFromRules(
        [chWithRules(rule)],
        'ch-federal-calendar',
        { from: '2028-08-01', to: '2028-08-01' }
      ),
      errorReason('calendar.unmatchedOverride')
    );
  });

  it('blockiert widersprüchliche Overrides mit gleicher Priorität', () => {
    const suppress = overrideRule('CH-CAL-OVERRIDE-SUPPRESS-2028', 'suppress', 200);
    const replace = overrideRule('CH-CAL-OVERRIDE-REPLACE-2028', 'replace', 200);
    assert.throws(
      () => generateCalendarFromRules(
        [chWithRules(suppress, replace)],
        'ch-federal-calendar',
        { from: '2028-08-01', to: '2028-08-02' }
      ),
      errorReason('calendar.priorityConflict')
    );
  });

  it('blockiert eine Anfrage ausserhalb der gemeinsamen Kalendergültigkeit', () => {
    assert.throws(
      () => generateCalendarFromRules(
        [chRules, beRules],
        'be-public-holidays',
        { from: '2025-12-31', to: '2026-01-02' }
      ),
      errorReason('calendar.outsideValidity')
    );
  });

  it('blockiert doppelte Ergebnis-IDs auch bei formal vollständigen Add-Overrides', () => {
    const duplicate = clone(overrideRule('CH-CAL-OVERRIDE-DUPLICATE-2028', 'add')) as unknown as {
      effect: { replacementHoliday: { resultIdSuffix: string } };
      calculation: { date: string };
    };
    duplicate.effect.replacementHoliday.resultIdSuffix = 'NATIONAL-DAY';
    duplicate.calculation.date = '2028-08-01';
    assert.throws(
      () => generateCalendarFromRules(
        [chWithRules(duplicate as unknown as CalendarRule)],
        'ch-federal-calendar',
        { from: '2028-08-01', to: '2028-08-01' }
      ),
      errorReason('calendar.duplicateResultId')
    );
  });
});
