// SPDX-License-Identifier: AGPL-3.0-only

import type { CalculationData } from '../core';
import type { CalendarContext } from '../core/calendarResolution';
import type { Locale } from './i18n';
import {
  EMPTY_VRPG_SELECTION,
  resolveVrpgSelection,
  sanitizeVrpgSelection,
  selectionFromLegacy,
  type VrpgSelectionState
} from './vrpgSelection';
import {
  automaticCalendarId,
  authorityOptions,
  isProfileAllowed,
  reconcileProfileId,
  reconcileSpecialSelection,
  reconcileSelectors
} from './model';

export const DEFAULTS_STORAGE_KEY = 'fristenrechner.defaults.v1';

export interface StoredDefaults {
  readonly version: 3 | 4;
  readonly locale: Locale;
  readonly authorityCode: string;
  readonly profileId: string;
  readonly deadlineDays: number;
  readonly selectors: Readonly<Record<string, string>>;
  readonly calendarId: string;
  readonly specialRegimeId: string;
  readonly specialDefinitionId: string;
  readonly vrpgSelection: VrpgSelectionState;
  readonly calendarContext?: CalendarContext;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Explicit role/place defaults are not legal qualification or case evidence.
 * Area membership, uncertain mandates and dates are deliberately never stored.
 */
function calendarContextDefault(value: unknown, profileId: string): CalendarContext {
  const empty: CalendarContext = { role: '', canton: '', areaFacts: {} };
  if (!isRecord(value) || !['stpo', 'zpo', 'bgg', 'vwvg'].includes(profileId)) return empty;
  const allowedRoles = profileId === 'zpo'
    ? ['court']
    : ['partyWithoutRepresentative', 'qualifiedServiceRepresentative'];
  const role = typeof value.role === 'string' && allowedRoles.includes(value.role)
    ? value.role as CalendarContext['role']
    : '';
  const canton = typeof value.canton === 'string'
    && 'ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' ').includes(value.canton)
    ? value.canton
    : '';
  return { role, canton, areaFacts: {} };
}

export function initialDefaults(data: CalculationData, calendarActivation = false): StoredDefaults {
  const authorityCode = authorityOptions(data).some(option => option.code === 'BE') ? 'BE' : 'CH';
  const profileId = reconcileProfileId(data, authorityCode, 'stpo');
  const profile = data.profiles.get(profileId);
  const special = reconcileSpecialSelection(
    data,
    profileId,
    '',
    ''
  );
  return {
    version: calendarActivation ? 4 : 3,
    locale: 'de',
    authorityCode,
    profileId,
    deadlineDays: 10,
    selectors: reconcileSelectors(profile, {}),
    calendarId: automaticCalendarId(data, profile),
    specialRegimeId: special.regimeId,
    specialDefinitionId: special.definitionId,
    vrpgSelection: EMPTY_VRPG_SELECTION,
    ...(calendarActivation ? { calendarContext: calendarContextDefault(undefined, profileId) } : {})
  };
}

export function sanitizeDefaults(data: CalculationData, value: unknown, calendarActivation = false): StoredDefaults {
  const fallback = initialDefaults(data, calendarActivation);
  if (!isRecord(value) || (value.version !== 1 && value.version !== 2 && value.version !== 3 && value.version !== 4)) {
    return fallback;
  }
  const authorityCode = typeof value.authorityCode === 'string'
    && authorityOptions(data, calendarActivation).some(option => option.code === value.authorityCode)
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
  const candidateCalendarId = !calendarActivation && typeof value.calendarId === 'string' && data.calendars.has(value.calendarId)
    ? value.calendarId
    : automaticCalendar;
  const calendarId = profile?.calendarPolicy.jurisdictionSelection === 'fixedBern'
    ? automaticCalendar
    : candidateCalendarId;
  const special = reconcileSpecialSelection(
    data,
    profileId,
    typeof value.specialRegimeId === 'string'
      ? value.specialRegimeId
      : '',
    typeof value.specialDefinitionId === 'string' ? value.specialDefinitionId : ''
  );
  const vrpgSelection = profileId !== 'vrpg-be'
    ? EMPTY_VRPG_SELECTION
    : value.version === 3 || value.version === 4
      ? sanitizeVrpgSelection(data, value.vrpgSelection)
      : selectionFromLegacy(data,
        typeof value.specialRegimeId === 'string' ? value.specialRegimeId : '',
        typeof value.specialDefinitionId === 'string' ? value.specialDefinitionId : '');
  const resolved = resolveVrpgSelection(data, vrpgSelection);
  return {
    version: calendarActivation ? 4 : 3,
    locale: value.locale === 'fr' ? 'fr' : 'de',
    authorityCode,
    profileId,
    deadlineDays,
    selectors: reconcileSelectors(profile, rawSelectors),
    calendarId,
    specialRegimeId: profileId === 'vrpg-be' ? resolved.regimeId : special.regimeId,
    specialDefinitionId: profileId === 'vrpg-be' ? resolved.definitionId : special.definitionId,
    vrpgSelection,
    ...(calendarActivation ? {
      calendarContext: calendarContextDefault(value.version === 4 ? value.calendarContext : undefined, profileId)
    } : {})
  };
}

export function loadDefaults(data: CalculationData, storage?: StorageLike, calendarActivation = false): StoredDefaults {
  if (!storage) {
    return initialDefaults(data, calendarActivation);
  }
  try {
    const raw = storage.getItem(DEFAULTS_STORAGE_KEY);
    return raw ? sanitizeDefaults(data, JSON.parse(raw) as unknown, calendarActivation) : initialDefaults(data, calendarActivation);
  } catch {
    return initialDefaults(data, calendarActivation);
  }
}

export function saveDefaults(storage: StorageLike | undefined, defaults: StoredDefaults): boolean {
  if (!storage) {
    return false;
  }
  try {
    storage.setItem(DEFAULTS_STORAGE_KEY, JSON.stringify({
      version: defaults.version === 4 ? 4 : 3,
      locale: defaults.locale,
      authorityCode: defaults.authorityCode,
      profileId: defaults.profileId,
      deadlineDays: defaults.deadlineDays,
      ...(defaults.version === 4
        ? { calendarContext: (() => {
          const context = calendarContextDefault(defaults.calendarContext, defaults.profileId);
          return { role: context.role, canton: context.canton };
        })() }
        : { calendarId: defaults.calendarId }),
      specialRegimeId: defaults.specialRegimeId,
      specialDefinitionId: defaults.specialDefinitionId,
      vrpgSelection: {
        area: defaults.vrpgSelection.area,
        law: defaults.vrpgSelection.law,
        action: defaults.vrpgSelection.action,
        stage: defaults.vrpgSelection.stage
      },
      selectors: Object.fromEntries(
        Object.entries(defaults.selectors).filter(([key, value]) => (
          ['deliveryMethod', 'subjectMatter', 'procedureVariant', 'specialLawStatus'].includes(key)
          && value !== '' && value !== 'unknown'
        ))
      )
    }));
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
