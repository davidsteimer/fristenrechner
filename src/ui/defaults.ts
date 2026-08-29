// SPDX-License-Identifier: AGPL-3.0-only

import type { CalculationData } from '../core';
import type { Locale } from './i18n';
import {
  automaticCalendarId,
  authorityOptions,
  isProfileAllowed,
  reconcileProfileId,
  reconcileSelectors
} from './model';

export const DEFAULTS_STORAGE_KEY = 'fristenrechner.defaults.v1';

export interface StoredDefaults {
  readonly version: 1;
  readonly locale: Locale;
  readonly authorityCode: string;
  readonly profileId: string;
  readonly deadlineDays: number;
  readonly selectors: Readonly<Record<string, string>>;
  readonly calendarId: string;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function initialDefaults(data: CalculationData): StoredDefaults {
  const authorityCode = authorityOptions(data).some(option => option.code === 'BE') ? 'BE' : 'CH';
  const profileId = reconcileProfileId(data, authorityCode, 'stpo');
  const profile = data.profiles.get(profileId);
  return {
    version: 1,
    locale: 'de',
    authorityCode,
    profileId,
    deadlineDays: 10,
    selectors: reconcileSelectors(profile, {}),
    calendarId: automaticCalendarId(data, profile)
  };
}

export function sanitizeDefaults(data: CalculationData, value: unknown): StoredDefaults {
  const fallback = initialDefaults(data);
  if (!isRecord(value) || value.version !== 1) {
    return fallback;
  }
  const authorityCode = typeof value.authorityCode === 'string'
    && authorityOptions(data).some(option => option.code === value.authorityCode)
    ? value.authorityCode
    : fallback.authorityCode;
  const candidateProfileId = typeof value.profileId === 'string' ? value.profileId : '';
  const profileId = isProfileAllowed(data, authorityCode, candidateProfileId)
    ? candidateProfileId
    : reconcileProfileId(data, authorityCode, '', fallback.profileId);
  const profile = data.profiles.get(profileId);
  const rawSelectors = isRecord(value.selectors)
    ? Object.fromEntries(Object.entries(value.selectors).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
    : {};
  const deadlineDays = typeof value.deadlineDays === 'number'
    && Number.isInteger(value.deadlineDays)
    && value.deadlineDays >= 1
    && value.deadlineDays <= 365
    ? value.deadlineDays
    : fallback.deadlineDays;
  const automaticCalendar = automaticCalendarId(data, profile);
  const candidateCalendarId = typeof value.calendarId === 'string' && data.calendars.has(value.calendarId)
    ? value.calendarId
    : automaticCalendar;
  const calendarId = profile?.calendarPolicy.jurisdictionSelection === 'fixedBern'
    ? automaticCalendar
    : candidateCalendarId;
  return {
    version: 1,
    locale: value.locale === 'fr' ? 'fr' : 'de',
    authorityCode,
    profileId,
    deadlineDays,
    selectors: reconcileSelectors(profile, rawSelectors),
    calendarId
  };
}

export function loadDefaults(data: CalculationData, storage?: StorageLike): StoredDefaults {
  if (!storage) {
    return initialDefaults(data);
  }
  try {
    const raw = storage.getItem(DEFAULTS_STORAGE_KEY);
    return raw ? sanitizeDefaults(data, JSON.parse(raw) as unknown) : initialDefaults(data);
  } catch {
    return initialDefaults(data);
  }
}

export function saveDefaults(storage: StorageLike | undefined, defaults: StoredDefaults): boolean {
  if (!storage) {
    return false;
  }
  try {
    storage.setItem(DEFAULTS_STORAGE_KEY, JSON.stringify(defaults));
    return true;
  } catch {
    return false;
  }
}

export function clearDefaults(storage?: StorageLike): boolean {
  if (!storage) {
    return false;
  }
  try {
    storage.removeItem(DEFAULTS_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
