// SPDX-License-Identifier: AGPL-3.0-only

import { compareIsoDates, parseIsoDate } from './date';
import type {
  CalculationData,
  CalendarData,
  Holiday,
  LegalProfile,
  ResolvedCalendar,
  SuspensionSet,
  ValidatedReleaseLike
} from './types';

type JsonObject = Record<string, unknown>;

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

function assertDocument(value: unknown, kind: 'legalProfile' | 'calendar', id: string): JsonObject {
  if (!isObject(value) || value.dataKind !== kind) {
    throw new CoreDataError(`Das validierte Artefakt ${id} ist kein ${kind}.`);
  }
  const idProperty = kind === 'legalProfile' ? 'profileId' : 'calendarId';
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
  if (majorVersion !== 1) {
    throw new CoreDataError(`Nicht unterstützte Hauptversion des Datenformats: ${release.formatVersion}`);
  }
  assertIsoDate(release.coverageFrom, 'Releaseabdeckung');
  assertIsoDate(release.coverageTo, 'Releaseabdeckung');
  if (compareIsoDates(release.coverageFrom, release.coverageTo) > 0) {
    throw new CoreDataError('Die Releaseabdeckung ist umgekehrt.');
  }

  const profiles = new Map<string, LegalProfile>();
  const calendars = new Map<string, CalendarData>();
  release.artifacts.forEach(artifact => {
    const document = assertDocument(artifact.parsed, artifact.descriptor.role, artifact.descriptor.contentId);
    if (artifact.descriptor.role === 'legalProfile') {
      if (profiles.has(artifact.descriptor.contentId)) {
        throw new CoreDataError(`Doppeltes Rechtsprofil: ${artifact.descriptor.contentId}`);
      }
      profiles.set(artifact.descriptor.contentId, document as unknown as LegalProfile);
      return;
    }
    if (calendars.has(artifact.descriptor.contentId)) {
      throw new CoreDataError(`Doppelter Kalender: ${artifact.descriptor.contentId}`);
    }
    calendars.set(artifact.descriptor.contentId, document as unknown as CalendarData);
  });

  assertSameIds('Profil-IDs', release.profileIds, [...profiles.keys()]);
  assertSameIds('Kalender-IDs', release.calendarIds, [...calendars.keys()]);
  assertCalendarReferences(calendars);

  return {
    releaseId: release.releaseId,
    formatVersion: release.formatVersion,
    coverage: { from: release.coverageFrom, to: release.coverageTo },
    profiles,
    calendars
  };
}

export function resolveCalendar(data: CalculationData, calendarId: string): ResolvedCalendar | undefined {
  const root = data.calendars.get(calendarId);
  if (!root) {
    return undefined;
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
