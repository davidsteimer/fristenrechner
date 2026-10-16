// SPDX-License-Identifier: AGPL-3.0-only
import { createCalculationData, CoreDataError } from './data';
import { FORMAT7_LEGACY_CALENDAR_BASELINE } from './format7Baseline';
import { registerFormat7Runtime } from './format7Runtime';
import { parseFormat7Data, parseFormat7LocalReferenceData } from './releaseFormat7';
import { canonicalSocialJson, rawSha256Text, socialObjectSha256, validateSocialCatalogReferences } from './socialCatalog';
import type { BoundCalendarRuntime } from './calendarResolution';
import type { CalculationData, CalendarData, LegalProfile, ValidatedReleaseLike } from './types';
import type { SpecialRegimeCatalog } from './specialTypes';
import { createFormat8CalculationData } from './format8CalculationData';
import type { ParsedFormat8Data } from './releaseFormat8';
export { createFormat8CalculationData } from './format8CalculationData';
export type { Format8CalculatorRuntime, Format8RuntimeOptions } from './format8CalculationData';

export interface CalculatorRuntime {
  readonly data: CalculationData;
  readonly calendarRuntime?: BoundCalendarRuntime;
  readonly administrativeContext?: ParsedFormat8Data;
}
export interface Format7RuntimeOptions { readonly mode: 'approved' | 'localReference' }
export interface ByteBoundReleaseLike extends ValidatedReleaseLike {
  readonly manifestBytes?: Uint8Array;
  readonly manifestSha256?: string;
  readonly artifacts: readonly (ValidatedReleaseLike['artifacts'][number] & {
    readonly bytes?: Uint8Array;
    readonly descriptor: ValidatedReleaseLike['artifacts'][number]['descriptor'] & { readonly path?: string };
  })[];
}
const fail = (message: string): never => { throw new CoreDataError(message); };
// The approved C1 projection preserves two historical review paths for this
// same federal norm. Keep both original objects, without upgrading 'monitored'
// to 'verified'. This closed hash pair is not a general metadata merge policy.
const FEDERAL_SOURCE_PROVENANCE = new Set([
  '6d0730617db586d9cf2b635f297da787da4a9805dc3e5baf53c762684ddc1c4e',
  '048554e3a3b51cf34e421343f0aa0e2ef1546faeab8c4f20224e1c75faa92b7f'
]);
export function sameFormat7SourceIdentity(left: unknown, right: unknown): boolean {
  if (canonicalSocialJson(left) === canonicalSocialJson(right)) return true;
  const l = left as { sourceId?: unknown } | undefined, r = right as { sourceId?: unknown } | undefined;
  return l?.sourceId === 'SRC-BUNDESFEIERTAG-19940701' && r?.sourceId === l.sourceId
    && FEDERAL_SOURCE_PROVENANCE.has(socialObjectSha256(left))
    && FEDERAL_SOURCE_PROVENANCE.has(socialObjectSha256(right));
}
function freezeTree(value: unknown): void {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return;
  Object.values(value).forEach(freezeTree);
  Object.freeze(value);
}
function referencedStrings(value: unknown, key: string, found = new Set<string>()): Set<string> {
  if (Array.isArray(value)) value.forEach(item => referencedStrings(item, key, found));
  else if (value && typeof value === 'object') for (const [name, child] of Object.entries(value)) {
    if (name === key && typeof child === 'string') found.add(child);
    else referencedStrings(child, key, found);
  }
  return found;
}

/** Full bytes, projections and joint approvals, independently of the old adapter. */
export function createFormat7CalculationData(
  manifestText: string,
  files: ReadonlyMap<string, string>,
  options: Format7RuntimeOptions = { mode: 'approved' }
): { readonly data: CalculationData; readonly calendarRuntime: BoundCalendarRuntime } {
  if (!['approved', 'localReference'].includes(options.mode)) fail('Unbekannter Format-7-Hostmodus.');
  const referenceOnly = options.mode === 'localReference';
  const parsed = (referenceOnly ? parseFormat7LocalReferenceData : parseFormat7Data)(manifestText, files, FORMAT7_LEGACY_CALENDAR_BASELINE);
  const { manifest, catalog, calendars, socialCatalog } = parsed;
  if (manifest.releaseStatus !== (referenceOnly ? 'candidate' : 'approved')) fail('Format-7-Release ist für diesen Hostmodus nicht freigegeben.');
  const profiles = new Map<string, LegalProfile>();
  const calendarData = new Map<string, CalendarData>();
  const specialRegimeCatalogs = new Map<string, SpecialRegimeCatalog>();
  const sources = new Map<string, unknown>();
  const referencedSources = new Set<string>();
  for (const descriptor of manifest.artifacts) {
    const document = parsed.artifacts.get(descriptor.contentId) as Record<string, unknown>;
    // All direct component sources are declared. Archive-only sourceEvidence
    // does not become an operational review obligation merely by being present.
    const localSourceIds = new Set<string>();
    if (Array.isArray(document.sources)) for (const source of document.sources as { sourceId: string }[]) {
      if (localSourceIds.has(source.sourceId)) fail(`Doppelte lokale Quellen-ID: ${source.sourceId}`);
      localSourceIds.add(source.sourceId);
      if (sources.has(source.sourceId) && !sameFormat7SourceIdentity(sources.get(source.sourceId), source)) fail(`Widersprüchliche Quellenmetadaten: ${source.sourceId}`);
      sources.set(source.sourceId, source);
    }
    if (descriptor.role !== 'holidayCatalog') referencedStrings(document, 'sourceId').forEach(id => referencedSources.add(id));
    if (descriptor.role === 'legalProfile') profiles.set(descriptor.contentId, document as unknown as LegalProfile);
    if (descriptor.role === 'specialRegimeCatalog') specialRegimeCatalogs.set(descriptor.contentId, document as unknown as SpecialRegimeCatalog);
  }
  if (canonicalSocialJson([...sources.keys()].sort()) !== canonicalSocialJson([...manifest.sourceSummary.sourceIds].sort())) fail('Manifestquellen entsprechen nicht genau der Komponentenmenge.');
  for (const id of referencedSources) if (!sources.has(id)) fail(`Nicht registrierte operative Quellenreferenz: ${id}`);
  // This integration changes release bindings, not any of the 44 rules, 50 BE
  // bindings, scope exclusions or their accompanying calculation profiles.
  const socialContentHash = socialObjectSha256({ federalRules: socialCatalog.federalRules,
    cantonalBindings: socialCatalog.cantonalBindings, suspensionProfiles: socialCatalog.suspensionProfiles,
    filingProfiles: socialCatalog.filingProfiles, excludedPaths: socialCatalog.excludedPaths });
  if (socialContentHash !== 'd26b04fd89c8e3ef13d4adfd6a7c7af5cb9d5ece2712ba31d79ede8f80847f3f') fail('Format-7-Integration verändert den bestätigten Sozialinhalt.');
  for (const calendar of calendars) calendarData.set(calendar.calendarId, {
    dataKind: 'calendar', formatVersion: calendar.formatVersion, calendarId: calendar.calendarId,
    jurisdiction: calendar.jurisdiction, coverage: { from: calendar.validity.from, to: calendar.validity.to ?? '9999-12-31' },
    inherits: calendar.inherits, holidays: [], suspensionSets: []
  });
  for (const special of specialRegimeCatalogs.values()) {
    if (!profiles.has(special.profileId) || special.formatVersion !== '3.0.0') fail('Ungültiger Format-7-Spezialkatalog.');
    if (special.deadlineDefinitions.some(definition => definition.deadlineOrigin === 'CALCULATED' && definition.applicability?.selection.area === 'social')
      || special.regimes.some(regime => regime.regimeId.startsWith('ap17c-soc-'))
      || special.blockedMappings?.some(mapping => mapping.mappingId.startsWith('SOC-'))) fail('Doppelte qualifizierte Sozialpfade.');
    const mappingIds = special.deadlineDefinitions.flatMap(definition => definition.deadlineOrigin === 'CALCULATED' && definition.applicability ? [definition.applicability.mappingId] : []);
    if (new Set(mappingIds).size !== mappingIds.length) fail('Doppelte Spezialzuordnung.');
    for (const definition of special.deadlineDefinitions) if (definition.deadlineOrigin === 'CALCULATED'
      && (!Object.hasOwn(definition, 'applicability') || (definition.deadlineDefinitionId.startsWith('AP17C-') && !definition.applicability))) fail('Fehlende Spezialanwendbarkeit.');
    for (const profile of special.calendarProfiles) if (profile.calendarId !== null && profile.calendarId !== 'be-public-holidays') fail('Zusätzliche kantonale Spezialfreigabe.');
  }
  const suspensionSets = new Set(calendars.flatMap(calendar => calendar.rules.flatMap(rule => rule.effect.type === 'suspensionPeriod' ? [rule.effect.suspensionSetId] : [])));
  for (const document of [...profiles.values(), ...specialRegimeCatalogs.values(), socialCatalog]) {
    for (const id of referencedStrings(document, 'calendarId')) if (!calendarData.has(id)) fail(`Unbekannte Kalenderreferenz: ${id}`);
    for (const key of ['profileId', 'entryProfileId']) for (const id of referencedStrings(document, key)) if (!profiles.has(id)) fail(`Unbekannte Profilreferenz: ${id}`);
    for (const id of referencedStrings(document, 'suspensionSetId')) if (!suspensionSets.has(id)) fail(`Unbekannter Stillstandssatz: ${id}`);
  }
  for (const calendar of calendars) for (const rule of calendar.rules) {
    if (rule.effect.type === 'suspensionPeriod') for (const id of rule.effect.applicableProfileIds) if (!profiles.has(id)) fail(`Unbekanntes Stillstandsprofil: ${id}`);
  }
  const calendarRuntime: BoundCalendarRuntime = { catalog, calendars,
    catalogSha256: manifest.artifacts.find(artifact => artifact.role === 'holidayCatalog')!.sha256,
    releaseId: manifest.releaseId, referenceOnly };
  const data: CalculationData = {
    releaseId: manifest.releaseId, formatVersion: '7.0.0', coverage: manifest.coverage,
    profiles, calendars: calendarData, calendarRuleSets: new Map(calendars.map(calendar => [calendar.calendarId, calendar])),
    specialRegimeCatalogs, holidayCatalogs: new Map([[catalog.catalogId, catalog]]),
    socialProcedureCatalogs: new Map([[socialCatalog.catalogId, socialCatalog]]),
    releaseArtifactRefs: manifest.artifacts.map(({ role, contentId, sha256 }) => ({ role, contentId, sha256 })),
    format7Runtime: calendarRuntime
  };
  validateSocialCatalogReferences(socialCatalog, data);
  parsed.artifacts.forEach(freezeTree);
  freezeTree(calendarRuntime);
  registerFormat7Runtime(calendarRuntime);
  return { data, calendarRuntime };
}

/** Provider caches are transport, not a validation capability. Recheck bytes. */
export function createCalculatorRuntime(release: ByteBoundReleaseLike, options?: Format7RuntimeOptions): CalculatorRuntime {
  if (!['7.0.0', '8.0.0'].includes(release.formatVersion)) return { data: createCalculationData(release) };
  const format = release.formatVersion === '8.0.0' ? 'Format 8' : 'Format 7';
  if (!release.manifestBytes) fail(`${format} benötigt die vollständigen Manifestbytes.`);
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const manifestText = decoder.decode(release.manifestBytes);
  if (!release.manifestSha256 || rawSha256Text(manifestText) !== release.manifestSha256) fail(`${format}-Manifestprüfsumme stimmt nicht.`);
  const files = new Map<string, string>();
  for (const artifact of release.artifacts) {
    if (!artifact.bytes || !artifact.descriptor.path || files.has(artifact.descriptor.path)) fail(`${format} benötigt eindeutige vollständige Artefaktbytes.`);
    files.set(artifact.descriptor.path!, decoder.decode(artifact.bytes));
  }
  const runtime: CalculatorRuntime = release.formatVersion === '8.0.0'
    ? createFormat8CalculationData(manifestText, files, options) : createFormat7CalculationData(manifestText, files, options);
  if (runtime.data.releaseId !== release.releaseId || runtime.data.coverage.from !== release.coverageFrom
    || runtime.data.coverage.to !== release.coverageTo || runtime.data.formatVersion !== release.formatVersion) fail(`${format}-Transportmetadaten stimmen nicht mit dem Manifest überein.`);
  for (const [claimed, actual] of [
    [release.profileIds, [...runtime.data.profiles.keys()]], [release.calendarIds, [...runtime.data.calendars.keys()]],
    [release.specialRegimeCatalogIds ?? [], [...runtime.data.specialRegimeCatalogs.keys()]],
    [release.holidayCatalogIds ?? [], [...runtime.data.holidayCatalogs.keys()]],
    [release.socialProcedureCatalogIds ?? [], [...(runtime.data.socialProcedureCatalogs?.keys() ?? [])]],
    [release.administrativeProcedureCatalogIds ?? [], runtime.administrativeContext?.manifest.administrativeProcedureCatalogIds ?? []]
  ] as const) if (canonicalSocialJson([...claimed].sort()) !== canonicalSocialJson([...actual].sort())) fail(`${format}-Transportinventar stimmt nicht mit dem Manifest überein.`);
  return runtime;
}
