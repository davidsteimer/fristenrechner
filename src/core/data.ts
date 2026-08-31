// SPDX-License-Identifier: AGPL-3.0-only

import { addCalendarDays, compareIsoDates, parseIsoDate } from './date';
import { generateCalendarFromRules } from './generateCalendar';
import type { CalendarGenerationRange, CalendarRuleSet } from './calendarRuleTypes';
import type {
  CalculationData,
  CalendarData,
  CalendarGenerationEvidence,
  Holiday,
  IsoDate,
  LegalProfile,
  ResolvedCalendar,
  SuspensionSet,
  ValidatedReleaseLike
} from './types';
import type { SpecialRegimeCatalog } from './specialTypes';

type JsonObject = Record<string, unknown>;

const MIN_ISO_DATE = '0001-01-01';
const MAX_ISO_DATE = '9999-12-31';
const DEFAULT_CALENDAR_LOOKBACK_DAYS = 370;
const DEFAULT_CALENDAR_LOOKAHEAD_DAYS = 730;

export class CoreDataError extends Error {
  public override readonly name = 'CoreDataError';
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertIsoDate(value: string, label: string): void {
  if (!parseIsoDate(value)) {
    throw new CoreDataError(`${label} enthält kein gültiges ISO-Kalenderdatum: ${value}`);
  }
}

function safeAddCalendarDays(value: IsoDate, days: number): IsoDate {
  try {
    return addCalendarDays(value, days);
  } catch {
    return days < 0 ? MIN_ISO_DATE : MAX_ISO_DATE;
  }
}

export function isWithinReleaseCoverage(value: IsoDate, data: CalculationData): boolean {
  return compareIsoDates(value, data.coverage.from) >= 0
    && (data.coverage.to === null || compareIsoDates(value, data.coverage.to) <= 0);
}

export function calendarGenerationRangeForDates(
  data: CalculationData,
  dates: readonly IsoDate[],
  lookbackDays = DEFAULT_CALENDAR_LOOKBACK_DAYS,
  lookaheadDays = DEFAULT_CALENDAR_LOOKAHEAD_DAYS
): CalendarGenerationRange | undefined {
  if (dates.length === 0 || dates.some(value => !parseIsoDate(value))) {
    return undefined;
  }
  const ordered = [...dates].sort(compareIsoDates);
  const first = ordered[0];
  const last = ordered.at(-1);
  if (!first || !last) {
    return undefined;
  }
  const requestedFrom = safeAddCalendarDays(first, -lookbackDays);
  const requestedTo = safeAddCalendarDays(last, lookaheadDays);
  const from = compareIsoDates(requestedFrom, data.coverage.from) < 0
    ? data.coverage.from
    : requestedFrom;
  const to = data.coverage.to !== null && compareIsoDates(requestedTo, data.coverage.to) > 0
    ? data.coverage.to
    : requestedTo;
  return compareIsoDates(from, to) <= 0 ? { from, to } : undefined;
}

function assertDocument(
  value: unknown,
  kind: 'legalProfile' | 'calendar' | 'specialRegimeCatalog',
  id: string
): JsonObject {
  if (!isObject(value) || value.dataKind !== kind) {
    throw new CoreDataError(`Das validierte Artefakt ${id} ist kein ${kind}.`);
  }
  const idProperty = kind === 'legalProfile'
    ? 'profileId'
    : kind === 'calendar'
      ? 'calendarId'
      : 'catalogId';
  if (value[idProperty] !== id) {
    throw new CoreDataError(`Content-ID und Dokument-ID stimmen bei ${id} nicht überein.`);
  }
  return value;
}

function assertSameIds(label: string, expected: readonly string[], actual: readonly string[]): void {
  const expectedSorted = [...expected].sort();
  const actualSorted = [...actual].sort();
  if (JSON.stringify(expectedSorted) !== JSON.stringify(actualSorted)) {
    throw new CoreDataError(`${label} des validierten Release stimmen nicht mit den Artefakten überein.`);
  }
}

function assertCalendarReferences(calendars: ReadonlyMap<string, CalendarData>): void {
  const visit = (calendarId: string, ancestry: ReadonlySet<string>): void => {
    if (ancestry.has(calendarId)) {
      throw new CoreDataError(`Zyklische Kalendervererbung bei ${calendarId}.`);
    }
    const calendar = calendars.get(calendarId);
    if (!calendar) {
      throw new CoreDataError(`Unbekannte Kalenderreferenz: ${calendarId}`);
    }
    const nextAncestry = new Set(ancestry).add(calendarId);
    calendar.inherits.forEach(parentId => visit(parentId, nextAncestry));
  };

  calendars.forEach(calendar => visit(calendar.calendarId, new Set()));
}

export function createCalculationData(release: ValidatedReleaseLike): CalculationData {
  const majorVersion = Number.parseInt(release.formatVersion.split('.')[0] ?? '', 10);
  if (majorVersion !== 1 && majorVersion !== 2 && majorVersion !== 3) {
    throw new CoreDataError(`Nicht unterstützte Hauptversion des Datenformats: ${release.formatVersion}`);
  }
  assertIsoDate(release.coverageFrom, 'Releaseabdeckung');
  if (release.coverageTo !== null) {
    assertIsoDate(release.coverageTo, 'Releaseabdeckung');
    if (compareIsoDates(release.coverageFrom, release.coverageTo) > 0) {
      throw new CoreDataError('Die Releaseabdeckung ist umgekehrt.');
    }
  }
  if (majorVersion < 3 && release.coverageTo === null) {
    throw new CoreDataError('Die Formate 1 und 2 benötigen eine endliche Releaseabdeckung.');
  }
  if (majorVersion === 3 && release.coverageTo !== null) {
    throw new CoreDataError('Das Format 3 benötigt eine nach oben offene Releaseabdeckung.');
  }

  const profiles = new Map<string, LegalProfile>();
  const calendars = new Map<string, CalendarData>();
  const calendarRuleSets = new Map<string, CalendarRuleSet>();
  const specialRegimeCatalogs = new Map<string, SpecialRegimeCatalog>();
  release.artifacts.forEach(artifact => {
    const document = assertDocument(artifact.parsed, artifact.descriptor.role, artifact.descriptor.contentId);
    if (artifact.descriptor.role === 'legalProfile') {
      if (profiles.has(artifact.descriptor.contentId)) {
        throw new CoreDataError(`Doppeltes Rechtsprofil: ${artifact.descriptor.contentId}`);
      }
      profiles.set(artifact.descriptor.contentId, document as unknown as LegalProfile);
      return;
    }
    if (artifact.descriptor.role === 'specialRegimeCatalog') {
      if (specialRegimeCatalogs.has(artifact.descriptor.contentId)) {
        throw new CoreDataError(`Doppelter Spezialregimekatalog: ${artifact.descriptor.contentId}`);
      }
      specialRegimeCatalogs.set(
        artifact.descriptor.contentId,
        document as unknown as SpecialRegimeCatalog
      );
      return;
    }
    if (calendars.has(artifact.descriptor.contentId)) {
      throw new CoreDataError(`Doppelter Kalender: ${artifact.descriptor.contentId}`);
    }
    if (majorVersion === 3) {
      if (document.formatVersion !== '2.0.0' || !Array.isArray(document.rules) || !isObject(document.validity)) {
        throw new CoreDataError(
          `Format-3-Kalender ${artifact.descriptor.contentId} ist keine Regelkomponente 2.0.0.`
        );
      }
      const ruleSet = document as unknown as CalendarRuleSet;
      calendarRuleSets.set(artifact.descriptor.contentId, ruleSet);
      calendars.set(artifact.descriptor.contentId, {
        dataKind: 'calendar',
        formatVersion: ruleSet.formatVersion,
        calendarId: ruleSet.calendarId,
        jurisdiction: ruleSet.jurisdiction,
        coverage: {
          from: ruleSet.validity.from,
          to: ruleSet.validity.to ?? MAX_ISO_DATE
        },
        inherits: ruleSet.inherits,
        holidays: [],
        suspensionSets: []
      });
      return;
    }
    calendars.set(artifact.descriptor.contentId, document as unknown as CalendarData);
  });

  assertSameIds('Profil-IDs', release.profileIds, [...profiles.keys()]);
  assertSameIds('Kalender-IDs', release.calendarIds, [...calendars.keys()]);
  assertSameIds(
    'Spezialregimekatalog-IDs',
    release.specialRegimeCatalogIds ?? [],
    [...specialRegimeCatalogs.keys()]
  );
  assertCalendarReferences(calendars);

  specialRegimeCatalogs.forEach(catalog => {
    if (!profiles.has(catalog.profileId)) {
      throw new CoreDataError(
        `Spezialregimekatalog ${catalog.catalogId} verweist auf das unbekannte Profil ${catalog.profileId}.`
      );
    }
    catalog.calendarProfiles.forEach(calendarProfile => {
      if (calendarProfile.calendarId !== null && !calendars.has(calendarProfile.calendarId)) {
        throw new CoreDataError(
          `Spezialregimekatalog ${catalog.catalogId} verweist auf den unbekannten Kalender ${calendarProfile.calendarId}.`
        );
      }
    });
  });

  return {
    releaseId: release.releaseId,
    formatVersion: release.formatVersion,
    coverage: { from: release.coverageFrom, to: release.coverageTo },
    profiles,
    calendars,
    calendarRuleSets,
    specialRegimeCatalogs
  };
}

function resolvedCalendar(
  calendar: CalendarData,
  generation?: CalendarGenerationEvidence
): ResolvedCalendar {
  const holidays = new Map<string, Holiday[]>();
  calendar.holidays.forEach(holiday => {
    const entries = holidays.get(holiday.date) ?? [];
    entries.push(holiday);
    holidays.set(holiday.date, entries);
  });
  holidays.forEach(entries => entries.sort((left, right) => left.holidayId.localeCompare(right.holidayId)));
  return {
    calendarId: calendar.calendarId,
    jurisdictionCode: calendar.jurisdiction.code,
    coverage: calendar.coverage,
    holidaysByDate: holidays,
    suspensionSets: new Map(calendar.suspensionSets.map(set => [set.suspensionSetId, set])),
    ...(generation ? { generation } : {})
  };
}

export function resolveCalendar(
  data: CalculationData,
  calendarId: string,
  requestedRange?: CalendarGenerationRange
): ResolvedCalendar | undefined {
  const root = data.calendars.get(calendarId);
  if (!root) {
    return undefined;
  }

  if (data.calendarRuleSets.size > 0) {
    if (!data.calendarRuleSets.has(calendarId)) {
      throw new CoreDataError(`Für ${calendarId} fehlt die regelbasierte Kalenderkomponente.`);
    }
    if (!requestedRange) {
      throw new CoreDataError(`Der regelbasierte Kalender ${calendarId} benötigt einen Berechnungsbereich.`);
    }
    const from = compareIsoDates(requestedRange.from, root.coverage.from) < 0
      ? root.coverage.from
      : requestedRange.from;
    const to = compareIsoDates(requestedRange.to, root.coverage.to) > 0
      ? root.coverage.to
      : requestedRange.to;
    if (compareIsoDates(from, to) > 0) {
      throw new CoreDataError(`Der Berechnungsbereich liegt ausserhalb der Gültigkeit von ${calendarId}.`);
    }
    const range = { from, to };
    const generated = generateCalendarFromRules(
      [...data.calendarRuleSets.values()],
      calendarId,
      range
    );
    return resolvedCalendar(generated.calendar, {
      releaseId: data.releaseId,
      calendarId,
      range,
      appliedRuleIds: generated.appliedRuleIds,
      appliedOverrideRuleIds: generated.appliedOverrideRuleIds,
      applications: generated.trace
    });
  }

  const holidays = new Map<string, Holiday[]>();
  const holidayIds = new Set<string>();
  const suspensionSets = new Map<string, SuspensionSet>();
  let coverageFrom = root.coverage.from;
  let coverageTo = root.coverage.to;

  const merge = (currentId: string, ancestry: ReadonlySet<string>): void => {
    if (ancestry.has(currentId)) {
      throw new CoreDataError(`Zyklische Kalendervererbung bei ${currentId}.`);
    }
    const current = data.calendars.get(currentId);
    if (!current) {
      throw new CoreDataError(`Unbekannte Kalenderreferenz: ${currentId}`);
    }
    coverageFrom = compareIsoDates(current.coverage.from, coverageFrom) > 0 ? current.coverage.from : coverageFrom;
    coverageTo = compareIsoDates(current.coverage.to, coverageTo) < 0 ? current.coverage.to : coverageTo;

    const nextAncestry = new Set(ancestry).add(currentId);
    current.inherits.forEach(parentId => merge(parentId, nextAncestry));
    current.holidays.forEach(holiday => {
      if (holidayIds.has(holiday.holidayId)) {
        return;
      }
      holidayIds.add(holiday.holidayId);
      const entries = holidays.get(holiday.date) ?? [];
      entries.push(holiday);
      holidays.set(holiday.date, entries);
    });
    current.suspensionSets.forEach(set => {
      const existing = suspensionSets.get(set.suspensionSetId);
      if (existing && existing !== set) {
        throw new CoreDataError(`Doppelter Stillstandssatz: ${set.suspensionSetId}`);
      }
      suspensionSets.set(set.suspensionSetId, set);
    });
  };

  merge(calendarId, new Set());
  if (compareIsoDates(coverageFrom, coverageTo) > 0) {
    throw new CoreDataError(`Die Kalenderabdeckungen für ${calendarId} überschneiden sich nicht.`);
  }

  holidays.forEach(entries => entries.sort((left, right) => left.holidayId.localeCompare(right.holidayId)));
  return {
    calendarId,
    jurisdictionCode: root.jurisdiction.code,
    coverage: { from: coverageFrom, to: coverageTo },
    holidaysByDate: holidays,
    suspensionSets
  };
}
