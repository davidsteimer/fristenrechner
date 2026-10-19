// SPDX-License-Identifier: AGPL-3.0-only
// AP23D2: preferences are visible choices, never case facts or release authority.
import type { CalculationData } from '../core';
import type { AdministrativeDeadlineInput } from '../core/administrativeDeadline';
import { getVerifiedAdministrativeContext, type ParsedAdministrativeContext } from '../core/administrativeContext';
import { canonicalSocialJson } from '../core/socialCatalog';
import type { Locale } from './i18n';
import { DEFAULTS_STORAGE_KEY } from './defaults';
import { isProfileAllowed } from './model';
import { EMPTY_VRPG_SELECTION, sanitizeVrpgSelection, selectionFromLegacy, type VrpgSelectionState } from './vrpgSelection';

export const ADMINISTRATIVE_DEFAULTS_STORAGE_KEY = 'fristenrechner.defaults.v5';
export type AdministrativeProcedureSelection =
  | { readonly kind: 'legacyProfile'; readonly profileId: string }
  | AdministrativeDeadlineInput['selection'];
export interface AdministrativeDefaultsContext {
  readonly legacyData: CalculationData;
  readonly administrativeData?: ParsedAdministrativeContext | undefined;
}
export interface AdministrativePreferences {
  readonly locale: Locale;
  readonly authorityCode: string;
  readonly deadlineDays: number;
  readonly deliveryMethod: string;
  readonly procedureSelection: AdministrativeProcedureSelection | null;
  readonly legacySelectors: Readonly<Record<string, string>>;
  readonly vrpgSelection: VrpgSelectionState;
  readonly calendarPreference: {
    readonly role: '' | 'court' | 'partyWithoutRepresentative' | 'qualifiedServiceRepresentative';
    readonly canton: string;
  };
}
export interface AdministrativeDefaultsStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export type AdministrativeDefaultsReason = 'corruptV5' | 'futureVersion' | 'unsupportedSelection'
  | 'unsupportedDuration' | 'storageReadUnavailable' | 'storageWriteUnavailable' | 'storageWriteUnverified';
export interface AdministrativeDefaultsResult {
  readonly persistence: 'stored' | 'memoryOnly' | 'protected' | 'rejected';
  readonly state: 'uninitialized' | 'preferences' | 'reset';
  readonly preferences: AdministrativePreferences;
  readonly reason?: AdministrativeDefaultsReason;
  readonly legalQualification: false;
}
type Envelope = { readonly version: 5; readonly state: 'reset' }
  | { readonly version: 5; readonly state: 'preferences'; readonly preferences: AdministrativePreferences };
type Current = { readonly kind: 'absent' | 'unavailable' }
  | { readonly kind: 'protected'; readonly reason: AdministrativeDefaultsReason }
  | { readonly kind: 'preferences' | 'reset'; readonly preferences: AdministrativePreferences };
const CANTONS = new Set('ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' '));
const LEGACY_PROFILES = new Set(['stpo', 'zpo', 'bgg', 'vwvg', 'vrpg-be']);
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function same(left: unknown, right: unknown): boolean { return canonicalSocialJson(left) === canonicalSocialJson(right); }

export function emptyAdministrativePreferences(): AdministrativePreferences {
  return { locale: 'de', authorityCode: '', deadlineDays: 10, deliveryMethod: '', procedureSelection: null,
    legacySelectors: {}, vrpgSelection: { ...EMPTY_VRPG_SELECTION }, calendarPreference: { role: '', canton: '' } };
}

function selection(context: AdministrativeDefaultsContext, value: unknown, authority: string): AdministrativeProcedureSelection | null {
  if (!record(value) || (!CANTONS.has(authority) && authority !== 'CH')) return null;
  if (value.kind === 'legacyProfile' && typeof value.profileId === 'string'
    && Object.keys(value).every(key => ['kind', 'profileId'].includes(key))
    && LEGACY_PROFILES.has(value.profileId) && isProfileAllowed(context.legacyData, authority, value.profileId)) {
    return { kind: 'legacyProfile', profileId: value.profileId };
  }
  if (value.kind !== 'cantonalAdministrative'
    || !Object.keys(value).every(key => ['kind', 'lawId', 'pathId', 'revision', 'stage'].includes(key))) return null;
  // Serializing a context or catalog does not create an issued reader capability.
  const verified = getVerifiedAdministrativeContext(context.administrativeData);
  const law = verified?.catalog.laws.find(item => item.lawId === value.lawId && item.canton === authority);
  const path = verified?.catalog.paths.find(item => item.lawId === law?.lawId && item.pathId === value.pathId
    && item.revision === value.revision && item.stages.some(stage => stage === value.stage));
  const eligibility = verified?.catalog.releaseBinding.pathEligibility.find(item => item.pathId === path?.pathId
    && item.pathRevision === path?.revision);
  if (!law || !path || !eligibility || eligibility.status === 'withdrawn'
    || (verified?.referenceOnly === false && eligibility.status !== 'approved')) return null;
  return { kind: 'cantonalAdministrative', lawId: law.lawId, pathId: path.pathId,
    revision: path.revision, stage: value.stage as string };
}

/** Closed allow-list. Unknown fields, dates and legal confirmations never survive. */
export function sanitizeAdministrativePreferences(context: AdministrativeDefaultsContext, value: unknown): AdministrativePreferences {
  const raw = record(value) ? value : {};
  const authorityCode = typeof raw.authorityCode === 'string' && (CANTONS.has(raw.authorityCode) || raw.authorityCode === 'CH')
    ? raw.authorityCode : '';
  const procedureSelection = selection(context, raw.procedureSelection, authorityCode);
  const profileId = procedureSelection?.kind === 'legacyProfile' ? procedureSelection.profileId : '';
  const profile = context.legacyData.profiles.get(profileId);
  const rawSelectors = record(raw.legacySelectors) ? raw.legacySelectors : {};
  const legacySelectors: Record<string, string> = {};
  for (const key of ['subjectMatter', 'procedureVariant']) {
    const candidate = rawSelectors[key];
    if (typeof candidate === 'string' && candidate !== '' && candidate !== 'unknown'
      && profile?.selectors.some(definition => definition.selectorId === key
        && definition.options.some(option => option.value === candidate))) legacySelectors[key] = candidate;
  }
  const deliveryMethod = typeof raw.deliveryMethod === 'string' && raw.deliveryMethod !== 'unknown'
    && (procedureSelection?.kind === 'cantonalAdministrative'
      ? raw.deliveryMethod === 'otherLegallyRelevantDate'
      : (profile ? [profile] : [...context.legacyData.profiles.values()]).some(item =>
        item.selectors.some(definition => definition.selectorId === 'deliveryMethod'
          && definition.options.some(option => option.value === raw.deliveryMethod))))
    ? raw.deliveryMethod : '';
  const calendar = record(raw.calendarPreference) ? raw.calendarPreference : {};
  const calendarEnabled = ['stpo', 'zpo', 'bgg', 'vwvg'].includes(profileId);
  const allowedRoles = profileId === 'zpo' ? ['court'] : ['partyWithoutRepresentative', 'qualifiedServiceRepresentative'];
  const role = calendarEnabled && typeof calendar.role === 'string' && allowedRoles.includes(calendar.role)
    ? calendar.role as AdministrativePreferences['calendarPreference']['role'] : '';
  const canton = calendarEnabled && typeof calendar.canton === 'string' && CANTONS.has(calendar.canton) ? calendar.canton : '';
  return {
    locale: raw.locale === 'fr' ? 'fr' : 'de', authorityCode,
    deadlineDays: typeof raw.deadlineDays === 'number' && Number.isInteger(raw.deadlineDays)
      && raw.deadlineDays >= 1 && raw.deadlineDays <= 365 ? raw.deadlineDays : 10,
    deliveryMethod, procedureSelection, legacySelectors,
    vrpgSelection: profileId === 'vrpg-be' ? sanitizeVrpgSelection(context.legacyData, raw.vrpgSelection) : { ...EMPTY_VRPG_SELECTION },
    calendarPreference: { role, canton }
  };
}

function invalidSelection(context: AdministrativeDefaultsContext, raw: unknown, clean: AdministrativePreferences): AdministrativeDefaultsReason | undefined {
  if (record(raw) && raw.procedureSelection !== null && raw.procedureSelection !== undefined && clean.procedureSelection === null) {
    return 'unsupportedSelection';
  }
  if (clean.procedureSelection?.kind === 'cantonalAdministrative') {
    const selected = clean.procedureSelection;
    const duration = getVerifiedAdministrativeContext(context.administrativeData)?.catalog.paths.find(path => path.pathId === selected.pathId)?.duration;
    if (duration?.kind === 'statutoryDays' && clean.deadlineDays !== duration.value) return 'unsupportedDuration';
  }
  return undefined;
}

function legacyPreferences(context: AdministrativeDefaultsContext, text: string | null): AdministrativePreferences {
  let raw: unknown;
  try { raw = text === null ? null : JSON.parse(text); } catch { return emptyAdministrativePreferences(); }
  if (!record(raw) || ![1, 2, 3, 4].includes(raw.version as number)) return emptyAdministrativePreferences();
  const selectors = record(raw.selectors) ? raw.selectors : {};
  const vrpgSelection = raw.version === 3 || raw.version === 4 ? raw.vrpgSelection
    : selectionFromLegacy(context.legacyData, typeof raw.specialRegimeId === 'string' ? raw.specialRegimeId : '',
      typeof raw.specialDefinitionId === 'string' ? raw.specialDefinitionId : '');
  return sanitizeAdministrativePreferences(context, { locale: raw.locale, authorityCode: raw.authorityCode,
    deadlineDays: raw.deadlineDays, deliveryMethod: selectors.deliveryMethod,
    procedureSelection: { kind: 'legacyProfile', profileId: raw.profileId }, legacySelectors: selectors,
    vrpgSelection, calendarPreference: raw.version === 4 ? raw.calendarContext : undefined });
}

function decode(context: AdministrativeDefaultsContext, text: string): Current {
  let value: unknown;
  try { value = JSON.parse(text); } catch { return { kind: 'protected', reason: 'corruptV5' }; }
  if (record(value) && typeof value.version === 'number' && Number.isInteger(value.version) && value.version > 5) {
    return { kind: 'protected', reason: 'futureVersion' };
  }
  if (same(value, { version: 5, state: 'reset' })) return { kind: 'reset', preferences: emptyAdministrativePreferences() };
  if (record(value) && value.version === 5 && value.state === 'preferences') {
    const preferences = sanitizeAdministrativePreferences(context, value.preferences);
    const invalid = invalidSelection(context, value.preferences, preferences);
    if (invalid) return { kind: 'protected', reason: invalid };
    if (same(value, { version: 5, state: 'preferences', preferences })) return { kind: 'preferences', preferences };
  }
  return { kind: 'protected', reason: 'corruptV5' };
}

function current(context: AdministrativeDefaultsContext, storage?: AdministrativeDefaultsStorage): Current {
  try {
    if (!storage) return { kind: 'unavailable' };
    const text = storage.getItem(ADMINISTRATIVE_DEFAULTS_STORAGE_KEY);
    return text === null ? { kind: 'absent' } : decode(context, text);
  } catch { return { kind: 'unavailable' }; }
}
function result(persistence: AdministrativeDefaultsResult['persistence'], preferences: AdministrativePreferences,
  state: AdministrativeDefaultsResult['state'], reason?: AdministrativeDefaultsReason): AdministrativeDefaultsResult {
  return { persistence, preferences, state, ...(reason ? { reason } : {}), legalQualification: false };
}
function protectedResult(state: Extract<Current, { kind: 'protected' }>): AdministrativeDefaultsResult {
  return result('protected', emptyAdministrativePreferences(), 'uninitialized', state.reason);
}
function persist(storage: AdministrativeDefaultsStorage, envelope: Envelope, preferences: AdministrativePreferences): AdministrativeDefaultsResult {
  const text = JSON.stringify(envelope);
  try { storage.setItem(ADMINISTRATIVE_DEFAULTS_STORAGE_KEY, text); }
  catch { return result('memoryOnly', preferences, envelope.state, 'storageWriteUnavailable'); }
  try {
    if (storage.getItem(ADMINISTRATIVE_DEFAULTS_STORAGE_KEY) === text) return result('stored', preferences, envelope.state);
  } catch { /* A completed setter alone cannot prove durable storage. */ }
  return result('memoryOnly', preferences, envelope.state, 'storageWriteUnverified');
}

/** Only a missing v5 slot permits one read-only migration of v1–v4. */
export function initializeAdministrativeDefaults(context: AdministrativeDefaultsContext, storage?: AdministrativeDefaultsStorage): AdministrativeDefaultsResult {
  const state = current(context, storage);
  if (state.kind === 'unavailable') return result('memoryOnly', emptyAdministrativePreferences(), 'uninitialized', 'storageReadUnavailable');
  if (state.kind === 'protected') return protectedResult(state);
  if (state.kind === 'preferences' || state.kind === 'reset') return result('stored', state.preferences, state.kind);
  let preferences: AdministrativePreferences;
  try { preferences = legacyPreferences(context, storage!.getItem(DEFAULTS_STORAGE_KEY)); }
  catch { return result('memoryOnly', emptyAdministrativePreferences(), 'uninitialized', 'storageReadUnavailable'); }
  return persist(storage!, { version: 5, state: 'preferences', preferences }, preferences);
}

/** Recheck the current slot on every write, including after another host/tab ran. */
export function saveAdministrativeDefaults(context: AdministrativeDefaultsContext, storage: AdministrativeDefaultsStorage | undefined,
  input: unknown): AdministrativeDefaultsResult {
  const state = current(context, storage);
  if (state.kind === 'protected') return protectedResult(state);
  const preferences = sanitizeAdministrativePreferences(context, input);
  const invalid = invalidSelection(context, input, preferences);
  if (invalid) return result('rejected', state.kind === 'preferences' || state.kind === 'reset' ? state.preferences : emptyAdministrativePreferences(),
    state.kind === 'preferences' || state.kind === 'reset' ? state.kind : 'uninitialized', invalid);
  if (state.kind === 'unavailable') return result('memoryOnly', preferences, 'preferences', 'storageReadUnavailable');
  return persist(storage!, { version: 5, state: 'preferences', preferences }, preferences);
}

/** Retain a reset marker so legacy values cannot reappear on the next load. */
export function resetAdministrativeDefaults(context: AdministrativeDefaultsContext, storage?: AdministrativeDefaultsStorage): AdministrativeDefaultsResult {
  const state = current(context, storage);
  if (state.kind === 'protected') return protectedResult(state);
  const preferences = emptyAdministrativePreferences();
  if (state.kind === 'unavailable') return result('memoryOnly', preferences, 'reset', 'storageReadUnavailable');
  return persist(storage!, { version: 5, state: 'reset' }, preferences);
}
