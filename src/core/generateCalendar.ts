// SPDX-License-Identifier: AGPL-3.0-only

import {
  addCalendarDays,
  compareIsoDates,
  parseIsoDate,
  weekdayIndex
} from './date';
import type {
  CalendarGenerationRange,
  CalendarRule,
  CalendarRuleApplication,
  CalendarRuleOccurrence,
  CalendarRuleSet,
  CalendarRuleValidity,
  ExplicitDateOverrideCalculation,
  GeneratedCalendar,
  HolidayCalendarRule,
  OverrideCalendarRule,
  PeriodBoundary,
  RelativePeriodCalculation,
  SuspensionCalendarRule
} from './calendarRuleTypes';
import type { Holiday, IsoDate, SuspensionPeriod, SuspensionSet } from './types';

const MIN_GREGORIAN_YEAR = 1583;
const MAX_ISO_YEAR = 9999;

export class CalendarGenerationError extends Error {
  public override readonly name = 'CalendarGenerationError';

  public constructor(
    public readonly reasonKey: string,
    message: string
  ) {
    super(message);
  }
}

interface InternalHoliday extends Holiday {
  readonly ruleId: string;
  readonly calendarId: string;
}

interface InternalSuspensionSet {
  readonly applicableProfileIds: readonly string[];
  readonly periods: Map<string, SuspensionPeriod>;
}

function fail(reasonKey: string, message: string): never {
  throw new CalendarGenerationError(reasonKey, message);
}

function pad(value: number, width: number): string {
  return String(value).padStart(width, '0');
}

function isoDate(year: number, month: number, day: number, ruleId?: string): IsoDate {
  const value = `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
  if (!parseIsoDate(value)) {
    fail(
      'calendar.invalidFixedDate',
      `${ruleId ? `${ruleId}: ` : ''}Ungültiges gregorianisches Kalenderdatum ${value}.`
    );
  }
  return value;
}

function assertIsoDate(value: string, label: string): IsoDate {
  if (!parseIsoDate(value)) {
    fail('calendar.invalidFixedDate', `${label} enthält kein gültiges ISO-Kalenderdatum: ${value}`);
  }
  return value;
}

function assertValidity(validity: CalendarRuleValidity, label: string): void {
  assertIsoDate(validity.from, `${label}/from`);
  if (validity.to !== null) {
    assertIsoDate(validity.to, `${label}/to`);
    if (compareIsoDates(validity.from, validity.to) > 0) {
      fail('calendar.outsideValidity', `${label} enthält eine umgekehrte Gültigkeit.`);
    }
  }
}

function validityContains(validity: CalendarRuleValidity, value: IsoDate): boolean {
  return compareIsoDates(value, validity.from) >= 0
    && (validity.to === null || compareIsoDates(value, validity.to) <= 0);
}

function validitiesOverlap(left: CalendarRuleValidity, right: CalendarRuleValidity): boolean {
  const from = compareIsoDates(left.from, right.from) >= 0 ? left.from : right.from;
  const to = left.to === null
    ? right.to
    : right.to === null
      ? left.to
      : compareIsoDates(left.to, right.to) <= 0
        ? left.to
        : right.to;
  return to === null || compareIsoDates(from, to) <= 0;
}

function sameJurisdiction(
  left: CalendarRuleSet['jurisdiction'],
  right: CalendarRuleSet['jurisdiction']
): boolean {
  return left.level === right.level && left.code === right.code;
}

function isIntegerWithin(value: number, minimum: number, maximum: number): boolean {
  return Number.isInteger(value) && value >= minimum && value <= maximum;
}

export function calculateGregorianEaster(year: number): IsoDate {
  if (!isIntegerWithin(year, MIN_GREGORIAN_YEAR, MAX_ISO_YEAR)) {
    fail(
      'calendar.unsupportedGregorianYear',
      `Ostern wird nur für gregorianische Jahre von ${MIN_GREGORIAN_YEAR} bis ${MAX_ISO_YEAR} berechnet.`
    );
  }
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return isoDate(year, month, day);
}

function fixedMonthDay(
  year: number,
  month: number,
  day: number,
  ruleId?: string
): IsoDate {
  if (!isIntegerWithin(year, 1, MAX_ISO_YEAR)
    || !isIntegerWithin(month, 1, 12)
    || !isIntegerWithin(day, 1, 31)) {
    fail('calendar.invalidFixedDate', `${ruleId ?? 'Kalenderregel'} enthält ein ungültiges Fixdatum.`);
  }
  return isoDate(year, month, day, ruleId);
}

function nthWeekdayOfMonth(
  year: number,
  month: number,
  isoWeekday: number,
  occurrence: number,
  ruleId?: string
): IsoDate {
  if (!isIntegerWithin(month, 1, 12)
    || !isIntegerWithin(isoWeekday, 1, 7)
    || !isIntegerWithin(occurrence, 1, 5)) {
    fail('calendar.invalidNthWeekday', `${ruleId ?? 'Kalenderregel'} enthält ungültige Wochentagsparameter.`);
  }
  const first = fixedMonthDay(year, month, 1, ruleId);
  const delta = (isoWeekday - (weekdayIndex(first) + 1) + 7) % 7;
  const result = addCalendarDays(first, delta + 7 * (occurrence - 1));
  if (parseIsoDate(result)?.month !== month) {
    fail(
      'calendar.invalidNthWeekday',
      `${ruleId ?? 'Kalenderregel'} verlangt ein nicht vorhandenes Wochentagsvorkommen.`
    );
  }
  return result;
}

function calculateBoundary(boundary: PeriodBoundary, year: number, ruleId?: string): IsoDate {
  const anchorYear = year + boundary.yearOffset;
  if (!isIntegerWithin(anchorYear, 1, MAX_ISO_YEAR)) {
    fail('calendar.invalidFixedDate', `${ruleId ?? 'Kalenderregel'} überschreitet den ISO-Jahresbereich.`);
  }
  const anchor = boundary.anchor === 'fixedMonthDay'
    ? fixedMonthDay(anchorYear, boundary.month, boundary.day, ruleId)
    : calculateGregorianEaster(anchorYear);
  const result = addCalendarDays(anchor, boundary.offsetDays);
  if (!parseIsoDate(result)) {
    fail('calendar.invalidFixedDate', `${ruleId ?? 'Kalenderregel'} erzeugt ein ungültiges Periodendatum.`);
  }
  return result;
}

export function calculateCalendarRuleOccurrence(
  calculation: HolidayCalendarRule['calculation'] | RelativePeriodCalculation,
  year: number,
  ruleId?: string
): CalendarRuleOccurrence {
  switch (calculation.type) {
    case 'fixedMonthDay':
      return { date: fixedMonthDay(year, calculation.month, calculation.day, ruleId) };
    case 'easterOffsetDays':
      return {
        date: addCalendarDays(calculateGregorianEaster(year), calculation.offsetDays)
      };
    case 'nthWeekdayOfMonth':
      return {
        date: nthWeekdayOfMonth(
          year,
          calculation.month,
          calculation.isoWeekday,
          calculation.occurrence,
          ruleId
        )
      };
    case 'relativePeriod': {
      const startsOn = calculateBoundary(calculation.startsOn, year, ruleId);
      const endsOn = calculateBoundary(calculation.endsOn, year, ruleId);
      if (compareIsoDates(startsOn, endsOn) > 0) {
        fail('calendar.invalidFixedDate', `${ruleId ?? 'Kalenderregel'} erzeugt eine umgekehrte Periode.`);
      }
      return { startsOn, endsOn };
    }
    default:
      return fail('calendar.unknownRuleType', 'Unbekannter Kalenderregeltyp.');
  }
}

function validateCalculation(rule: CalendarRule): void {
  const calculationType = rule.calculation.type;
  if (calculationType === 'fixedMonthDay') {
    fixedMonthDay(2000, rule.calculation.month, rule.calculation.day, rule.ruleId);
  } else if (calculationType === 'easterOffsetDays') {
    if (!isIntegerWithin(rule.calculation.offsetDays, -366, 366)) {
      fail('calendar.invalidRuleConfiguration', `${rule.ruleId} enthält einen ungültigen Osterversatz.`);
    }
  } else if (calculationType === 'nthWeekdayOfMonth') {
    nthWeekdayOfMonth(
      2000,
      rule.calculation.month,
      rule.calculation.isoWeekday,
      rule.calculation.occurrence,
      rule.ruleId
    );
  } else if (calculationType === 'relativePeriod') {
    calculateCalendarRuleOccurrence(rule.calculation, 2000, rule.ruleId);
  } else if (calculationType === 'explicitDateOverride') {
    validateOverrideShape(rule as OverrideCalendarRule);
  } else {
    fail('calendar.unknownRuleType', `${rule.ruleId} enthält den unbekannten Kalenderregeltyp ${String(calculationType)}.`);
  }

  if (['fixedMonthDay', 'easterOffsetDays', 'nthWeekdayOfMonth'].includes(calculationType)) {
    if (rule.effect.type !== 'holiday') {
      fail('calendar.invalidRuleConfiguration', `${rule.ruleId} verbindet eine Feiertagsberechnung mit der falschen Wirkung.`);
    }
  } else if (calculationType === 'relativePeriod') {
    if (rule.effect.type !== 'suspensionPeriod') {
      fail('calendar.invalidRuleConfiguration', `${rule.ruleId} verbindet eine Periode mit der falschen Wirkung.`);
    }
  } else if (calculationType === 'explicitDateOverride' && rule.effect.type !== 'explicitDateOverride') {
    fail('calendar.invalidRuleConfiguration', `${rule.ruleId} verbindet einen Override mit der falschen Wirkung.`);
  }
}

function definedOverrideFields(calculation: ExplicitDateOverrideCalculation): string[] {
  return ['date', 'targetDate', 'replacementDate']
    .filter(field => calculation[field as keyof ExplicitDateOverrideCalculation] !== undefined);
}

function validateOverrideShape(rule: OverrideCalendarRule): void {
  if (rule.effect.type !== 'explicitDateOverride') {
    fail('calendar.invalidRuleConfiguration', `${rule.ruleId} besitzt keine Overridewirkung.`);
  }
  const operation = rule.effect.operation;
  const expectedFields = operation === 'add'
    ? ['date']
    : operation === 'suppress'
      ? ['targetDate']
      : ['targetDate', 'replacementDate'];
  if (JSON.stringify(definedOverrideFields(rule.calculation)) !== JSON.stringify(expectedFields)) {
    fail('calendar.invalidRuleConfiguration', `${rule.ruleId} enthält unpassende Datumsfelder für ${operation}.`);
  }
  if (operation === 'add') {
    if (rule.effect.targetRuleId !== undefined || rule.effect.replacementHoliday === undefined) {
      fail('calendar.invalidRuleConfiguration', `${rule.ruleId} ist kein vollständiger Add-Override.`);
    }
  } else if (operation === 'suppress') {
    if (rule.effect.targetRuleId === undefined || rule.effect.replacementHoliday !== undefined) {
      fail('calendar.invalidRuleConfiguration', `${rule.ruleId} ist kein vollständiger Suppress-Override.`);
    }
  } else if (operation === 'replace') {
    if (rule.effect.targetRuleId === undefined || rule.effect.replacementHoliday === undefined) {
      fail('calendar.invalidRuleConfiguration', `${rule.ruleId} ist kein vollständiger Replace-Override.`);
    }
  } else {
    fail('calendar.invalidRuleConfiguration', `${rule.ruleId} enthält eine unbekannte Overrideoperation.`);
  }
  for (const value of [
    rule.calculation.date,
    rule.calculation.targetDate,
    rule.calculation.replacementDate
  ]) {
    if (value !== undefined) {
      assertIsoDate(value, rule.ruleId);
    }
  }
}

function validateRuleSets(ruleSets: readonly CalendarRuleSet[]): ReadonlyMap<string, CalendarRuleSet> {
  const byId = new Map<string, CalendarRuleSet>();
  const ruleIds = new Set<string>();
  const overrideRules: OverrideCalendarRule[] = [];
  for (const ruleSet of ruleSets) {
    if (ruleSet.dataKind !== 'calendar' || ruleSet.formatVersion !== '2.0.0') {
      fail('calendar.invalidRuleConfiguration', `${ruleSet.calendarId} ist kein Kalenderformat 2.0.0.`);
    }
    if (byId.has(ruleSet.calendarId)) {
      fail('calendar.duplicateRuleId', `Doppelte Kalender-ID ${ruleSet.calendarId}.`);
    }
    byId.set(ruleSet.calendarId, ruleSet);
    assertValidity(ruleSet.validity, ruleSet.calendarId);
    const sourceIds = new Set(ruleSet.sources.map(source => source.sourceId));
    for (const rule of ruleSet.rules) {
      if (ruleIds.has(rule.ruleId)) {
        fail('calendar.duplicateRuleId', `Doppelte Kalenderregel-ID ${rule.ruleId}.`);
      }
      ruleIds.add(rule.ruleId);
      if (rule.calendarId !== ruleSet.calendarId || !sameJurisdiction(rule.jurisdiction, ruleSet.jurisdiction)) {
        fail('calendar.invalidRuleConfiguration', `${rule.ruleId} widerspricht seinem Kalenderartefakt.`);
      }
      if (!Number.isInteger(rule.priority) || rule.priority < 0) {
        fail('calendar.invalidRuleConfiguration', `${rule.ruleId} enthält eine ungültige Priorität.`);
      }
      assertValidity(rule.validity, rule.ruleId);
      if (!validitiesOverlap(ruleSet.validity, rule.validity)) {
        fail('calendar.outsideValidity', `${rule.ruleId} liegt vollständig ausserhalb der Kalendergültigkeit.`);
      }
      for (const sourceRef of rule.sourceRefs) {
        if (!sourceIds.has(sourceRef.sourceId)) {
          fail('calendar.invalidRuleConfiguration', `${rule.ruleId} verweist auf die unbekannte Quelle ${sourceRef.sourceId}.`);
        }
      }
      validateCalculation(rule);
      if (rule.calculation.type === 'explicitDateOverride') {
        overrideRules.push(rule as OverrideCalendarRule);
      }
    }
  }
  const overrideTargets = new Set<string>();
  for (const rule of overrideRules) {
    const targetRuleId = rule.effect.targetRuleId;
    if (targetRuleId !== undefined && !ruleIds.has(targetRuleId)) {
      fail('calendar.unmatchedOverride', `${rule.ruleId} zielt auf die unbekannte Regel ${targetRuleId}.`);
    }
    if (targetRuleId !== undefined && rule.calculation.targetDate !== undefined) {
      const collisionKey = `${targetRuleId}\u0000${rule.calculation.targetDate}\u0000${rule.priority}`;
      if (overrideTargets.has(collisionKey)) {
        fail(
          'calendar.priorityConflict',
          `${rule.ruleId} kollidiert mit einem gleich priorisierten Override für ${targetRuleId}.`
        );
      }
      overrideTargets.add(collisionKey);
    }
  }
  return byId;
}

function orderedRuleSets(
  calendarId: string,
  byId: ReadonlyMap<string, CalendarRuleSet>
): CalendarRuleSet[] {
  const ordered: CalendarRuleSet[] = [];
  const visited = new Set<string>();
  const visit = (currentId: string, ancestry: ReadonlySet<string>): void => {
    if (ancestry.has(currentId)) {
      fail('calendar.inheritanceCycle', `Zyklische Kalendervererbung bei ${currentId}.`);
    }
    if (visited.has(currentId)) {
      return;
    }
    const current = byId.get(currentId);
    if (!current) {
      fail('calendar.unknownInheritedCalendar', `Unbekannter Kalender ${currentId}.`);
    }
    const nextAncestry = new Set(ancestry).add(currentId);
    [...current.inherits].sort().forEach(parentId => visit(parentId, nextAncestry));
    visited.add(currentId);
    ordered.push(current);
  };
  visit(calendarId, new Set());
  return ordered;
}

function effectiveValidity(ruleSets: readonly CalendarRuleSet[]): CalendarRuleValidity {
  let from = ruleSets[0]?.validity.from;
  let to = ruleSets[0]?.validity.to;
  if (from === undefined || to === undefined) {
    fail('calendar.unknownInheritedCalendar', 'Der Kalender enthält keine auflösbaren Regelbestände.');
  }
  for (const ruleSet of ruleSets.slice(1)) {
    if (compareIsoDates(ruleSet.validity.from, from) > 0) {
      from = ruleSet.validity.from;
    }
    if (ruleSet.validity.to !== null && (to === null || compareIsoDates(ruleSet.validity.to, to) < 0)) {
      to = ruleSet.validity.to;
    }
  }
  if (to !== null && compareIsoDates(from, to) > 0) {
    fail('calendar.outsideValidity', 'Die geerbten Kalendergültigkeiten überschneiden sich nicht.');
  }
  return { from, to };
}

function assertRange(range: CalendarGenerationRange, validity: CalendarRuleValidity): void {
  assertIsoDate(range.from, 'Kalenderbereich/from');
  assertIsoDate(range.to, 'Kalenderbereich/to');
  if (compareIsoDates(range.from, range.to) > 0) {
    fail('calendar.outsideValidity', 'Der angefragte Kalenderbereich ist umgekehrt.');
  }
  if (!validityContains(validity, range.from) || !validityContains(validity, range.to)) {
    fail('calendar.outsideValidity', 'Der angefragte Kalenderbereich liegt ausserhalb der Kalendergültigkeit.');
  }
}

function minDate(values: readonly IsoDate[]): IsoDate {
  const first = values[0];
  if (first === undefined) {
    fail('calendar.invalidRuleConfiguration', 'Eine Datumsmenge ist unerwartet leer.');
  }
  return values.reduce((result, value) => compareIsoDates(value, result) < 0 ? value : result, first);
}

function maxDate(values: readonly IsoDate[]): IsoDate {
  const first = values[0];
  if (first === undefined) {
    fail('calendar.invalidRuleConfiguration', 'Eine Datumsmenge ist unerwartet leer.');
  }
  return values.reduce((result, value) => compareIsoDates(value, result) > 0 ? value : result, first);
}

function withinRange(value: IsoDate, range: CalendarGenerationRange): boolean {
  return compareIsoDates(value, range.from) >= 0 && compareIsoDates(value, range.to) <= 0;
}

function periodIntersects(
  startsOn: IsoDate,
  endsOn: IsoDate,
  range: CalendarGenerationRange
): boolean {
  return compareIsoDates(endsOn, range.from) >= 0 && compareIsoDates(startsOn, range.to) <= 0;
}

function overrideDates(rule: OverrideCalendarRule): IsoDate[] {
  return [rule.calculation.date, rule.calculation.targetDate, rule.calculation.replacementDate]
    .filter((value): value is IsoDate => value !== undefined);
}

function relevantOverride(rule: OverrideCalendarRule, range: CalendarGenerationRange): boolean {
  return overrideDates(rule).some(value => withinRange(value, range));
}

function yearsForRange(range: CalendarGenerationRange): number[] {
  const fromYear = parseIsoDate(range.from)?.year;
  const toYear = parseIsoDate(range.to)?.year;
  if (fromYear === undefined || toYear === undefined) {
    fail('calendar.invalidFixedDate', 'Der Kalenderbereich enthält ein ungültiges Jahr.');
  }
  const start = Math.max(MIN_GREGORIAN_YEAR, fromYear - 2);
  const end = Math.min(MAX_ISO_YEAR - 1, toYear + 2);
  return Array.from({ length: end - start + 1 }, (_value, index) => start + index);
}

function periodId(prefix: string, startsOn: IsoDate, endsOn: IsoDate): string {
  const startYear = parseIsoDate(startsOn)?.year;
  const endYear = parseIsoDate(endsOn)?.year;
  if (startYear === undefined || endYear === undefined) {
    fail('calendar.invalidFixedDate', 'Eine Stillstandsperiode enthält ein ungültiges Jahr.');
  }
  return startYear === endYear
    ? `${prefix}-${startYear}`
    : `${prefix}-${startYear}-${endYear}`;
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

function addHoliday(
  holidays: InternalHoliday[],
  holidayIds: Set<string>,
  rule: CalendarRule,
  date: IsoDate,
  holiday: {
    readonly kind: Holiday['kind'];
    readonly labelKey: string;
    readonly legalEffect: Holiday['legalEffect'];
    readonly resultIdSuffix: string;
  }
): InternalHoliday {
  const holidayId = `${rule.jurisdiction.code}-${date}-${holiday.resultIdSuffix}`;
  if (holidayIds.has(holidayId)) {
    fail('calendar.duplicateResultId', `Doppelte erzeugte Feiertags-ID ${holidayId}.`);
  }
  holidayIds.add(holidayId);
  const entry: InternalHoliday = {
    holidayId,
    date,
    kind: holiday.kind,
    labelKey: holiday.labelKey,
    legalEffect: holiday.legalEffect,
    sourceRefs: rule.sourceRefs,
    ruleId: rule.ruleId,
    calendarId: rule.calendarId
  };
  holidays.push(entry);
  return entry;
}

function traceApplication(
  rule: CalendarRule,
  operation: CalendarRuleApplication['operation'],
  generatedIds: readonly string[],
  removedIds: readonly string[]
): CalendarRuleApplication {
  return {
    ruleId: rule.ruleId,
    calendarId: rule.calendarId,
    operation,
    sourceRefs: rule.sourceRefs,
    generatedIds,
    removedIds
  };
}

function generateBaseRules(
  rules: readonly CalendarRule[],
  holidayRange: CalendarGenerationRange,
  requestedRange: CalendarGenerationRange
): {
  holidays: InternalHoliday[];
  holidayIds: Set<string>;
  suspensionSets: Map<string, InternalSuspensionSet>;
  trace: CalendarRuleApplication[];
} {
  const holidays: InternalHoliday[] = [];
  const holidayIds = new Set<string>();
  const suspensionSets = new Map<string, InternalSuspensionSet>();
  const trace: CalendarRuleApplication[] = [];
  const holidayYears = yearsForRange(holidayRange);
  const periodYears = yearsForRange(requestedRange);
  for (const rule of [...rules].sort((left, right) => left.ruleId.localeCompare(right.ruleId))) {
    if (rule.calculation.type === 'explicitDateOverride') {
      continue;
    }
    if (rule.calculation.type === 'relativePeriod') {
      const suspensionRule = rule as SuspensionCalendarRule;
      for (const year of periodYears) {
        const occurrence = calculateCalendarRuleOccurrence(
          suspensionRule.calculation,
          year,
          suspensionRule.ruleId
        );
        if (!('startsOn' in occurrence)) {
          fail('calendar.invalidRuleConfiguration', `${rule.ruleId} erzeugt keine Stillstandsperiode.`);
        }
        if (!periodIntersects(occurrence.startsOn, occurrence.endsOn, requestedRange)) {
          continue;
        }
        const startsBeforeValidity = compareIsoDates(occurrence.startsOn, rule.validity.from) < 0;
        const endsAfterValidity = rule.validity.to !== null
          && compareIsoDates(occurrence.endsOn, rule.validity.to) > 0;
        if (startsBeforeValidity || endsAfterValidity) {
          const entirelyBefore = compareIsoDates(occurrence.endsOn, rule.validity.from) < 0;
          const entirelyAfter = rule.validity.to !== null
            && compareIsoDates(occurrence.startsOn, rule.validity.to) > 0;
          if (entirelyBefore || entirelyAfter) {
            continue;
          }
          fail('calendar.outsideValidity', `${rule.ruleId} schneidet seine Gültigkeitsgrenze.`);
        }
        const effect = suspensionRule.effect;
        const profiles = [...effect.applicableProfileIds].sort();
        const existingSet = suspensionSets.get(effect.suspensionSetId);
        if (existingSet && !sameStrings(existingSet.applicableProfileIds, profiles)) {
          fail(
            'calendar.inconsistentSuspensionSet',
            `${effect.suspensionSetId} enthält widersprüchliche Rechtsprofile.`
          );
        }
        const set = existingSet ?? { applicableProfileIds: profiles, periods: new Map() };
        suspensionSets.set(effect.suspensionSetId, set);
        const generatedPeriodId = periodId(effect.resultIdPrefix, occurrence.startsOn, occurrence.endsOn);
        if (set.periods.has(generatedPeriodId)) {
          fail('calendar.duplicateResultId', `Doppelte Stillstandsperioden-ID ${generatedPeriodId}.`);
        }
        set.periods.set(generatedPeriodId, {
          periodId: generatedPeriodId,
          startsOn: occurrence.startsOn,
          endsOn: occurrence.endsOn,
          inclusive: true,
          labelKey: rule.labelKey
        });
        trace.push(traceApplication(rule, 'generateSuspensionPeriod', [generatedPeriodId], []));
      }
      continue;
    }
    const holidayRule = rule as HolidayCalendarRule;
    for (const year of holidayYears) {
      const occurrence = calculateCalendarRuleOccurrence(
        holidayRule.calculation,
        year,
        holidayRule.ruleId
      );
      if (!('date' in occurrence)
        || !withinRange(occurrence.date, holidayRange)
        || !validityContains(rule.validity, occurrence.date)) {
        continue;
      }
      const entry = addHoliday(holidays, holidayIds, rule, occurrence.date, {
        kind: holidayRule.effect.kind,
        labelKey: rule.labelKey,
        legalEffect: holidayRule.effect.legalEffect,
        resultIdSuffix: holidayRule.effect.resultIdSuffix
      });
      trace.push(traceApplication(rule, 'generateHoliday', [entry.holidayId], []));
    }
  }
  return { holidays, holidayIds, suspensionSets, trace };
}

function selectedTargetOverrides(overrides: readonly OverrideCalendarRule[]): OverrideCalendarRule[] {
  const groups = new Map<string, OverrideCalendarRule[]>();
  const addRules: OverrideCalendarRule[] = [];
  for (const rule of overrides) {
    if (rule.effect.operation === 'add') {
      addRules.push(rule);
      continue;
    }
    const targetRuleId = rule.effect.targetRuleId;
    const targetDate = rule.calculation.targetDate;
    if (targetRuleId === undefined || targetDate === undefined) {
      fail('calendar.invalidRuleConfiguration', `${rule.ruleId} enthält kein vollständiges Overrideziel.`);
    }
    const key = `${targetRuleId}\u0000${targetDate}`;
    const entries = groups.get(key) ?? [];
    entries.push(rule);
    groups.set(key, entries);
  }
  const selected = [...addRules];
  for (const entries of groups.values()) {
    const highestPriority = Math.max(...entries.map(rule => rule.priority));
    const winners = entries.filter(rule => rule.priority === highestPriority);
    if (winners.length !== 1) {
      fail(
        'calendar.priorityConflict',
        `Gleich priorisierte Overrides ${winners.map(rule => rule.ruleId).sort().join(', ')} widersprechen sich.`
      );
    }
    selected.push(winners[0] as OverrideCalendarRule);
  }
  return selected.sort(
    (left, right) => right.priority - left.priority || left.ruleId.localeCompare(right.ruleId)
  );
}

function applyOverrides(
  overrides: readonly OverrideCalendarRule[],
  holidays: InternalHoliday[],
  holidayIds: Set<string>,
  effectiveCalendarValidity: CalendarRuleValidity,
  trace: CalendarRuleApplication[]
): void {
  for (const rule of selectedTargetOverrides(overrides)) {
    const dates = overrideDates(rule);
    if (dates.some(value => !validityContains(rule.validity, value)
      || !validityContains(effectiveCalendarValidity, value))) {
      fail('calendar.outsideValidity', `${rule.ruleId} liegt ausserhalb seiner Kalendergültigkeit.`);
    }
    if (rule.effect.operation === 'add') {
      const date = rule.calculation.date;
      const replacement = rule.effect.replacementHoliday;
      if (date === undefined || replacement === undefined) {
        fail('calendar.invalidRuleConfiguration', `${rule.ruleId} ist kein vollständiger Add-Override.`);
      }
      const added = addHoliday(holidays, holidayIds, rule, date, {
        kind: replacement.kind,
        labelKey: replacement.labelKey,
        legalEffect: replacement.legalEffect,
        resultIdSuffix: replacement.resultIdSuffix
      });
      trace.push(traceApplication(rule, 'addHoliday', [added.holidayId], []));
      continue;
    }
    const targetRuleId = rule.effect.targetRuleId;
    const targetDate = rule.calculation.targetDate;
    if (targetRuleId === undefined || targetDate === undefined) {
      fail('calendar.invalidRuleConfiguration', `${rule.ruleId} ist kein vollständiger Ziel-Override.`);
    }
    const targetIndex = holidays.findIndex(
      holiday => holiday.ruleId === targetRuleId && holiday.date === targetDate
    );
    if (targetIndex < 0) {
      fail('calendar.unmatchedOverride', `${rule.ruleId} findet ${targetRuleId} am ${targetDate} nicht.`);
    }
    const removed = holidays[targetIndex];
    if (!removed) {
      fail('calendar.unmatchedOverride', `${rule.ruleId} besitzt kein entfernbares Ziel.`);
    }
    holidays.splice(targetIndex, 1);
    holidayIds.delete(removed.holidayId);
    if (rule.effect.operation === 'suppress') {
      trace.push(traceApplication(rule, 'suppressHoliday', [], [removed.holidayId]));
      continue;
    }
    const replacementDate = rule.calculation.replacementDate;
    const replacement = rule.effect.replacementHoliday;
    if (replacementDate === undefined || replacement === undefined) {
      fail('calendar.invalidRuleConfiguration', `${rule.ruleId} ist kein vollständiger Replace-Override.`);
    }
    const added = addHoliday(holidays, holidayIds, rule, replacementDate, {
      kind: replacement.kind,
      labelKey: replacement.labelKey,
      legalEffect: replacement.legalEffect,
      resultIdSuffix: replacement.resultIdSuffix
    });
    trace.push(traceApplication(rule, 'replaceHoliday', [added.holidayId], [removed.holidayId]));
  }
}

function publicHoliday(holiday: InternalHoliday): Holiday {
  return {
    holidayId: holiday.holidayId,
    date: holiday.date,
    kind: holiday.kind,
    labelKey: holiday.labelKey,
    legalEffect: holiday.legalEffect,
    sourceRefs: holiday.sourceRefs
  };
}

function publicSuspensionSets(sets: ReadonlyMap<string, InternalSuspensionSet>): SuspensionSet[] {
  return [...sets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([suspensionSetId, set]) => ({
      suspensionSetId,
      applicableProfileIds: [...set.applicableProfileIds].sort(),
      periods: [...set.periods.values()].sort(
        (left, right) => left.startsOn.localeCompare(right.startsOn)
          || left.periodId.localeCompare(right.periodId)
      )
    }));
}

export function generateCalendarFromRules(
  ruleSets: readonly CalendarRuleSet[],
  calendarId: string,
  requestedRange: CalendarGenerationRange
): GeneratedCalendar {
  const byId = validateRuleSets(ruleSets);
  const orderedSets = orderedRuleSets(calendarId, byId);
  const target = byId.get(calendarId);
  if (!target) {
    fail('calendar.unknownInheritedCalendar', `Unbekannter Zielkalender ${calendarId}.`);
  }
  const calendarValidity = effectiveValidity(orderedSets);
  assertRange(requestedRange, calendarValidity);
  const allRules = orderedSets.flatMap(ruleSet => [...ruleSet.rules]);
  const relevantOverrides = allRules
    .filter((rule): rule is OverrideCalendarRule => rule.calculation.type === 'explicitDateOverride')
    .filter(rule => relevantOverride(rule, requestedRange));
  const extendedDates = [
    requestedRange.from,
    requestedRange.to,
    ...relevantOverrides.flatMap(overrideDates)
  ];
  const holidayRange = { from: minDate(extendedDates), to: maxDate(extendedDates) };
  assertRange(holidayRange, calendarValidity);
  const generated = generateBaseRules(allRules, holidayRange, requestedRange);
  applyOverrides(
    relevantOverrides,
    generated.holidays,
    generated.holidayIds,
    calendarValidity,
    generated.trace
  );
  const holidays = generated.holidays
    .filter(holiday => withinRange(holiday.date, requestedRange))
    .sort((left, right) => left.date.localeCompare(right.date)
      || left.holidayId.localeCompare(right.holidayId))
    .map(publicHoliday);
  const appliedOverrideRuleIds = [...new Set(
    generated.trace
      .filter(step => ['addHoliday', 'suppressHoliday', 'replaceHoliday'].includes(step.operation))
      .map(step => step.ruleId)
  )].sort();
  const appliedRuleIds = [...new Set(generated.trace.map(step => step.ruleId))].sort();
  return {
    calendar: {
      dataKind: 'calendar',
      formatVersion: '2.0.0',
      calendarId,
      jurisdiction: target.jurisdiction,
      coverage: requestedRange,
      inherits: [],
      holidays,
      suspensionSets: publicSuspensionSets(generated.suspensionSets)
    },
    appliedRuleIds,
    appliedOverrideRuleIds,
    trace: generated.trace
  };
}
