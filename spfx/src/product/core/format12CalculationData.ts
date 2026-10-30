// SPDX-License-Identifier: AGPL-3.0-only
import { parseFormat12Data, parseFormat12LocalReferenceData } from './releaseFormat12';
import { registerFormat12Runtime } from './format12Runtime';
import { validateSocialCatalogReferences } from './socialCatalog';
import { CoreDataError } from './data';
import type { ParsedFormat12Data } from './releaseFormat12';
import type { CalculationData, CalendarData, LegalProfile } from './types';
import type { SpecialRegimeCatalog } from './specialTypes';
import type { BoundCalendarRuntime } from './calendarResolution';

export interface Format12CalculatorRuntime {
  readonly data: CalculationData;
  readonly calendarRuntime: BoundCalendarRuntime;
  readonly administrativeContext: ParsedFormat12Data;
}
export interface Format12RuntimeOptions { readonly mode: 'approved' | 'localReference' }
class ImmutableMap<K, V> implements ReadonlyMap<K, V> {
  readonly #values: Map<K, V>;
  constructor(values: Iterable<readonly [K, V]>) { this.#values = new Map(values); Object.freeze(this); }
  get size(): number { return this.#values.size; }
  get(key: K): V | undefined { return this.#values.get(key); }
  has(key: K): boolean { return this.#values.has(key); }
  entries(): MapIterator<[K, V]> { return this.#values.entries(); }
  keys(): MapIterator<K> { return this.#values.keys(); }
  values(): MapIterator<V> { return this.#values.values(); }
  [Symbol.iterator](): MapIterator<[K, V]> { return this.entries(); }
  forEach(callback: (value: V, key: K, map: ReadonlyMap<K, V>) => void, thisArg?: unknown): void {
    this.#values.forEach((value, key) => callback.call(thisArg, value, key, this));
  }
}
function references(value: unknown, key: string, found = new Set<string>()): Set<string> {
  if (Array.isArray(value)) value.forEach(item => references(item, key, found));
  else if (value && typeof value === 'object') for (const [name, child] of Object.entries(value)) {
    if (name === key && typeof child === 'string') found.add(child);
    else references(child, key, found);
  }
  return found;
}

/** Native Format-12 release for preserved profiles and 79 qualified cantonal paths. */
export function createFormat12CalculationData(manifestText: string, files: ReadonlyMap<string, string>,
  options: Format12RuntimeOptions = { mode: 'approved' }): Format12CalculatorRuntime {
  if (!['approved', 'localReference'].includes(options.mode)) throw new CoreDataError('Unbekannter Format-12-Hostmodus.');
  const parsed = (options.mode === 'localReference' ? parseFormat12LocalReferenceData : parseFormat12Data)(manifestText, files);
  const { manifest, calendars, catalog, socialCatalog } = parsed;
  const profiles = new ImmutableMap<string, LegalProfile>(manifest.profileIds.map(id => [id, parsed.artifacts.get(id) as LegalProfile]));
  const specials = new ImmutableMap<string, SpecialRegimeCatalog>(manifest.specialRegimeCatalogIds.map(id => [id, parsed.artifacts.get(id) as SpecialRegimeCatalog]));
  const calendarData = new ImmutableMap<string, CalendarData>(calendars.map(calendar => [calendar.calendarId, Object.freeze({
    dataKind: 'calendar', formatVersion: calendar.formatVersion, calendarId: calendar.calendarId,
    jurisdiction: calendar.jurisdiction, coverage: Object.freeze({ from: calendar.validity.from, to: calendar.validity.to ?? '9999-12-31' }),
    inherits: calendar.inherits, holidays: Object.freeze([]), suspensionSets: Object.freeze([])
  })]));
  const sets = new Set(calendars.flatMap(calendar => calendar.rules.flatMap(rule => rule.effect.type === 'suspensionPeriod' ? [rule.effect.suspensionSetId] : [])));
  for (const document of [...profiles.values(), ...specials.values(), socialCatalog]) {
    for (const id of references(document, 'calendarId')) if (!calendarData.has(id)) throw new CoreDataError(`Unbekannte Format-12-Kalenderreferenz: ${id}`);
    for (const key of ['profileId', 'entryProfileId']) for (const id of references(document, key)) if (!profiles.has(id)) throw new CoreDataError(`Unbekannte Format-12-Profilreferenz: ${id}`);
    for (const id of references(document, 'suspensionSetId')) if (!sets.has(id)) throw new CoreDataError(`Unbekannter Format-12-Stillstandssatz: ${id}`);
  }
  for (const calendar of calendars) for (const rule of calendar.rules) {
    if (rule.effect.type === 'suspensionPeriod') for (const id of rule.effect.applicableProfileIds) {
      if (!profiles.has(id)) throw new CoreDataError(`Unbekanntes Format-12-Stillstandsprofil: ${id}`);
    }
  }
  const calendarRuntime: BoundCalendarRuntime = Object.freeze({ catalog, calendars,
    catalogSha256: manifest.artifacts.find(artifact => artifact.role === 'holidayCatalog')!.sha256,
    releaseId: manifest.releaseId, referenceOnly: parsed.mode === 'localReference' });
  const data: CalculationData = Object.freeze({
    releaseId: manifest.releaseId, formatVersion: '12.0.0', coverage: manifest.coverage,
    profiles, calendars: calendarData, calendarRuleSets: new ImmutableMap(calendars.map(calendar => [calendar.calendarId, calendar])),
    specialRegimeCatalogs: specials, holidayCatalogs: new ImmutableMap([[catalog.catalogId, catalog]]),
    socialProcedureCatalogs: new ImmutableMap([[socialCatalog.catalogId, socialCatalog]]),
    releaseArtifactRefs: Object.freeze(manifest.artifacts.map(({ role, contentId, sha256 }) => Object.freeze({ role, contentId, sha256 })))
  });
  validateSocialCatalogReferences(socialCatalog, data);
  registerFormat12Runtime(data, calendarRuntime, parsed);
  return Object.freeze({ data, calendarRuntime, administrativeContext: parsed });
}
