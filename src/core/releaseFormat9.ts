// SPDX-License-Identifier: AGPL-3.0-only
// AP23E3: native Format-9 byte-bound reader. No Format-8 downgrade or adapter.
import manifestSchema from '../../schemas/release-manifest-v9.schema.json';
import localSchema from '../../schemas/implementation/ap23e3/local-reference-manifest-v9.schema.json';
import administrativeSchema from '../../schemas/administrative-procedure-catalog-v2.schema.json';
import profileSchema from '../../schemas/legal-profile.schema.json';
import specialSchema from '../../schemas/special-regime-catalog-v3.schema.json';
import socialSchema from '../../schemas/social-procedure-catalog-v2.schema.json';
import calendarSchema from '../../schemas/implementation/ap22c1/calendar-rules-v3.schema.json';
import holidaySchema from '../../schemas/implementation/ap22c1/holiday-catalog-v2.schema.json';
import { FORMAT7_SCHEMAS, parseCalendarRuleSetV3 } from './releaseFormat7';
import { FORMAT7_LEGACY_CALENDAR_BASELINE } from './format7Baseline';
import { assertSchema } from './schemaContract';
import { assertHolidayCatalogV2, assertActivatedCalendarProjection } from './holidayActivation';
import { assertSocialProcedureCatalog, canonicalSocialJson, rawSha256Text, socialObjectSha256 } from './socialCatalog';
import { assertAdministrativeProcedureCatalogV2, validateAdministrativeReleaseBindingsV2 } from './administrativeCatalogV2';
import type { AdministrativeProcedureCatalogV2 } from './administrativeTypesV2';
import type { CalendarRuleSet } from './calendarRuleTypes';
import type { HolidayCatalogV2 } from './holidayActivationTypes';
import type { SocialProcedureCatalog } from './socialTypes';

type Role = 'legalProfile' | 'calendar' | 'specialRegimeCatalog' | 'holidayCatalog' | 'socialProcedureCatalog' | 'administrativeProcedureCatalog';
export interface Format9Artifact {
  readonly path: string;
  readonly role: Role;
  readonly contentId: string;
  readonly mediaType: 'application/json';
  readonly schemaId: string;
  readonly byteLength: number;
  readonly sha256: string;
}
export interface Format9Manifest {
  readonly formatVersion: '9.0.0';
  readonly releaseId: string;
  readonly releaseStatus: 'candidate' | 'approved';
  readonly coverage: { readonly from: string; readonly to: string | null };
  readonly profileIds: readonly string[];
  readonly calendarIds: readonly string[];
  readonly specialRegimeCatalogIds: readonly string[];
  readonly holidayCatalogIds: readonly string[];
  readonly socialProcedureCatalogIds: readonly string[];
  readonly administrativeProcedureCatalogIds: readonly string[];
  readonly sourceSummary: { readonly sourceIds: readonly string[] };
  readonly artifacts: readonly Format9Artifact[];
}
const format9Brand: unique symbol = Symbol('verified Format-9 parser result');
export interface ParsedFormat9Data {
  readonly [format9Brand]: true;
  readonly mode: 'approved' | 'localReference';
  readonly manifest: Format9Manifest;
  readonly catalog: HolidayCatalogV2;
  readonly calendars: readonly CalendarRuleSet[];
  readonly socialCatalog: SocialProcedureCatalog;
  readonly administrativeCatalog: AdministrativeProcedureCatalogV2;
  readonly artifacts: ReadonlyMap<string, unknown>;
}
export interface VerifiedAdministrativeDataV2 {
  readonly catalog: AdministrativeProcedureCatalogV2;
  readonly calendars: readonly CalendarRuleSet[];
  readonly holidayCatalog: HolidayCatalogV2;
  readonly releaseId: string;
  readonly coverage: { readonly from: string; readonly to: string | null };
  readonly referenceOnly: boolean;
}
export class Format9DataError extends Error {
  constructor(message: string) { super(message); this.name = 'Format9DataError'; Object.setPrototypeOf(this, Format9DataError.prototype); }
}
const fail = (message: string): never => { throw new Format9DataError(message); };
const trusted = new WeakMap<object, VerifiedAdministrativeDataV2>();
/** A copied object, serialized flag or prototype cannot create a capability. */
export function getVerifiedAdministrativeDataV2(context: unknown): VerifiedAdministrativeDataV2 | undefined {
  return typeof context === 'object' && context !== null ? trusted.get(context) : undefined;
}
export function assertTrustedFormat9Data(context: unknown): asserts context is ParsedFormat9Data {
  if (!getVerifiedAdministrativeDataV2(context)) fail('Unverified Format-9 context');
}
function freezeTree(value: unknown): void {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return;
  Object.values(value).forEach(freezeTree);
  Object.freeze(value);
}
/** Not Object.freeze(Map): callers never receive the mutable backing map. */
class ImmutableArtifacts implements ReadonlyMap<string, unknown> {
  readonly #values: Map<string, unknown>;
  constructor(values: ReadonlyMap<string, unknown>) { this.#values = new Map(values); Object.freeze(this); }
  get size(): number { return this.#values.size; }
  get(key: string): unknown { return this.#values.get(key); }
  has(key: string): boolean { return this.#values.has(key); }
  entries(): MapIterator<[string, unknown]> { return this.#values.entries(); }
  keys(): MapIterator<string> { return this.#values.keys(); }
  values(): MapIterator<unknown> { return this.#values.values(); }
  [Symbol.iterator](): MapIterator<[string, unknown]> { return this.entries(); }
  forEach(callback: (value: unknown, key: string, map: ReadonlyMap<string, unknown>) => void, thisArg?: unknown): void {
    this.#values.forEach((value, key) => callback.call(thisArg, value, key, this));
  }
}
const schemas = new Map<string, unknown>([...FORMAT7_SCHEMAS,
  [manifestSchema.$id, manifestSchema], [localSchema.$id, localSchema], [administrativeSchema.$id, administrativeSchema]]);
const roleSchemas = { legalProfile: profileSchema, calendar: calendarSchema, specialRegimeCatalog: specialSchema,
  holidayCatalog: holidaySchema, socialProcedureCatalog: socialSchema, administrativeProcedureCatalog: administrativeSchema };
const sameIds = (left: readonly string[], right: readonly string[], label: string): void => {
  if (new Set(left).size !== left.length || new Set(right).size !== right.length
    || canonicalSocialJson([...left].sort()) !== canonicalSocialJson([...right].sort())) fail(`Inventory mismatch: ${label}`);
};
function references(value: unknown, key: string, found = new Set<string>()): Set<string> {
  if (Array.isArray(value)) value.forEach(item => references(item, key, found));
  else if (value && typeof value === 'object') for (const [name, child] of Object.entries(value)) {
    if (name === key && typeof child === 'string') found.add(child);
    else references(child, key, found);
  }
  return found;
}
// Two accepted metadata provenances of the same federal norm. This is not a
// general metadata merge rule and does not upgrade monitored evidence.
const FEDERAL_SOURCE_PROVENANCE = new Set(['6d0730617db586d9cf2b635f297da787da4a9805dc3e5baf53c762684ddc1c4e', '048554e3a3b51cf34e421343f0aa0e2ef1546faeab8c4f20224e1c75faa92b7f']);
function sameSource(left: any, right: any): boolean {
  return canonicalSocialJson(left) === canonicalSocialJson(right)
    || (left.sourceId === 'SRC-BUNDESFEIERTAG-19940701' && right.sourceId === left.sourceId
      && FEDERAL_SOURCE_PROVENANCE.has(socialObjectSha256(left)) && FEDERAL_SOURCE_PROVENANCE.has(socialObjectSha256(right)));
}
// AP23E3 is an integration, not authority to revise existing substantive rules.
// Review/source metadata and new release permissions are deliberately separate.
const PRESERVED_CONTENT: Readonly<Record<string, string>> = {
  bgg: '63b857f72a15c933258a4aec41561b275d5dec4e5c34aeb4fffbd10afd5f1d9f',
  stpo: '8790f76c8ca9dce259cd432ae3e379ed70356cfeb3d8aaa4535c2ef72d500212',
  'vrpg-be': '2b062fc203116a56f1ee07fc6183a04002eaba31feb5d5bb24332c0619d2cef7',
  vwvg: 'c33588df41aafd02ffb124edef4a5a518785b8efacbad4292d388215007daf41',
  zpo: '7820cc7fb3f8dc05353ff03c134ed0ee1d24dda89e033a98ee0fc83dc4f6442a',
  'vrpg-be-special-regimes-rest': '138113bcfbb2b5eb64f0ba3f4a5081f0616c4e8d13e85841faa7282a995baaf3'
};

/** Approved documents only. This entry point does not accept candidates. */
export function parseFormat9Data(manifestText: string, files: ReadonlyMap<string, string>, legacyCalendars: readonly CalendarRuleSet[] = FORMAT7_LEGACY_CALENDAR_BASELINE): ParsedFormat9Data {
  return parseDocuments(manifestText, files, legacyCalendars, 'approved');
}
/** Isolated local calculations remain reference-only and cannot authorize export. */
export function parseFormat9LocalReferenceData(manifestText: string, files: ReadonlyMap<string, string>, legacyCalendars: readonly CalendarRuleSet[] = FORMAT7_LEGACY_CALENDAR_BASELINE): ParsedFormat9Data {
  return parseDocuments(manifestText, files, legacyCalendars, 'localReference');
}
function parseDocuments(manifestText: string, files: ReadonlyMap<string, string>, legacyCalendars: readonly CalendarRuleSet[], mode: 'approved' | 'localReference'): ParsedFormat9Data {
  const value: unknown = JSON.parse(manifestText);
  assertSchema(value, mode === 'approved' ? manifestSchema : localSchema, schemas);
  const manifest = value as Format9Manifest;
  if (manifest.coverage.from !== '2026-08-29' || manifest.coverage.to !== null) fail('Unexpected release coverage');
  sameIds(manifest.artifacts.map(a => a.path), [...files.keys()], 'actual files');
  sameIds(manifest.artifacts.map(a => a.contentId), manifest.artifacts.map(a => a.contentId), 'unique content IDs');
  if (new Set(manifest.artifacts.map(a => a.sha256)).size !== 41) fail('Duplicate artifact hash');
  const artifacts = new Map<string, any>();
  for (const descriptor of manifest.artifacts) {
    if (descriptor.path.split('/').some(part => !part || part === '.' || part === '..')) fail('Non-canonical artifact path');
    const text = files.get(descriptor.path)!;
    if (new TextEncoder().encode(text).byteLength !== descriptor.byteLength || rawSha256Text(text) !== descriptor.sha256) fail(`Artifact integrity: ${descriptor.path}`);
    const document: any = JSON.parse(text);
    if (descriptor.schemaId !== roleSchemas[descriptor.role].$id) fail('Role/schema mismatch');
    assertSchema(document, roleSchemas[descriptor.role], schemas);
    const idKey = descriptor.role === 'legalProfile' ? 'profileId' : descriptor.role === 'calendar' ? 'calendarId' : 'catalogId';
    if (document[idKey] !== descriptor.contentId || document.dataKind !== descriptor.role) fail('Content/role mismatch');
    artifacts.set(descriptor.contentId, document);
  }
  for (const [role, ids] of [['legalProfile', manifest.profileIds], ['calendar', manifest.calendarIds],
    ['specialRegimeCatalog', manifest.specialRegimeCatalogIds], ['holidayCatalog', manifest.holidayCatalogIds],
    ['socialProcedureCatalog', manifest.socialProcedureCatalogIds], ['administrativeProcedureCatalog', manifest.administrativeProcedureCatalogIds]] as const) {
    sameIds(ids, manifest.artifacts.filter(a => a.role === role).map(a => a.contentId), role);
  }
  const catalog = artifacts.get('ch-holiday-catalog');
  assertHolidayCatalogV2(catalog);
  const catalogHash = manifest.artifacts.find(a => a.role === 'holidayCatalog')!.sha256;
  const calendars = manifest.calendarIds.map(id => parseCalendarRuleSetV3(artifacts.get(id)));
  assertActivatedCalendarProjection(catalog, catalogHash, calendars, legacyCalendars);
  const permission = catalog.activation.releaseEligibility;
  if (catalog.activation.contractDecision.status !== 'approved' || permission.status !== (mode === 'approved' ? 'approved' : 'candidate')
    || (mode === 'approved' ? permission.releaseId !== manifest.releaseId || permission.approval === null : permission.approval !== null || permission.releaseId !== null)) fail('Holiday approval mismatch');
  const a = catalog.activation;
  if (socialObjectSha256({ data: catalog.data, calendarProjections: catalog.calendarProjections, matrixDecisions: a.matrixDecisions,
    projections: a.projections, procedureBindings: a.procedureBindings, anchorPolicies: a.anchorPolicies,
    supplementalRules: a.supplementalRules, supplementalScopes: a.supplementalScopes }) !== '57f0058eb918ff571853e58ea1a1f38de00500dfb4b3b2aee01ccf8c64979e7f') fail('Changed preserved holiday content');
  const sources = new Map<string, unknown>();
  const referencedSources = new Set<string>();
  for (const descriptor of manifest.artifacts) {
    const document = artifacts.get(descriptor.contentId);
    if (PRESERVED_CONTENT[descriptor.contentId]) {
      const { review: _review, sources: _sources, ...content } = document;
      if (socialObjectSha256(content) !== PRESERVED_CONTENT[descriptor.contentId]) fail('Changed preserved profile/special content');
    }
    const own = new Set<string>();
    if (Array.isArray(document.sources)) for (const source of document.sources) {
      if (own.has(source.sourceId)) fail('Duplicate local source');
      own.add(source.sourceId);
      if (sources.has(source.sourceId) && !sameSource(sources.get(source.sourceId), source)) fail(`Conflicting source identity: ${source.sourceId}`);
      sources.set(source.sourceId, source);
    }
    if (descriptor.role !== 'holidayCatalog') references(document, 'sourceId').forEach(id => referencedSources.add(id));
  }
  sameIds([...sources.keys()], manifest.sourceSummary.sourceIds, 'source union');
  for (const id of referencedSources) if (!sources.has(id)) fail(`Unregistered source: ${id}`);
  const socialCatalog = artifacts.get('ch-social-procedures');
  assertSocialProcedureCatalog(socialCatalog);
  if (socialCatalog.formatVersion !== '2.0.0' || socialCatalog.federalRules.length !== 44 || socialCatalog.cantonalBindings.length !== 50 || socialCatalog.releaseEligibility.length !== 50) fail('Incomplete social 44/50 inventory');
  if (socialObjectSha256({ federalRules: socialCatalog.federalRules, cantonalBindings: socialCatalog.cantonalBindings,
    suspensionProfiles: socialCatalog.suspensionProfiles, filingProfiles: socialCatalog.filingProfiles,
    excludedPaths: socialCatalog.excludedPaths }) !== 'd26b04fd89c8e3ef13d4adfd6a7c7af5cb9d5ece2712ba31d79ede8f80847f3f') fail('Changed preserved social content');
  sameIds(socialCatalog.cantonalBindings.map(b => b.bindingId), socialCatalog.releaseEligibility.map(e => e.bindingRef.bindingId), 'social eligibility');
  for (const binding of socialCatalog.cantonalBindings) {
    if (binding.procedureContextCanton !== 'BE' || !manifest.profileIds.includes(binding.entryProfileId)) fail('Unqualified social binding');
    for (const bound of binding.calendarBindings) {
      const calendar = calendars.find(c => c.calendarId === bound.calendarId);
      if (!calendar || calendar.jurisdiction.code !== bound.holidayCanton || calendar.jurisdiction.code !== bound.spatialScopeId) fail('Social calendar jurisdiction mismatch');
    }
  }
  for (const entry of socialCatalog.releaseEligibility) {
    if (entry.releaseId !== manifest.releaseId || entry.status !== (mode === 'approved' ? 'approved' : 'candidate')) fail('Social release approval mismatch');
    sameIds(entry.componentRefs.map(ref => `${ref.role}:${ref.contentId}`), ['calendar:be-public-holidays', 'calendar:ch-federal-calendar', 'holidayCatalog:ch-holiday-catalog'], 'social dependencies');
    for (const ref of entry.componentRefs) if (!manifest.artifacts.some(d => d.contentId === ref.contentId && d.role === ref.role && d.sha256 === ref.sha256)) fail('Stale social component hash');
    const binding = socialCatalog.cantonalBindings.find(b => b.bindingId === entry.bindingRef.bindingId)!;
    sameIds(entry.contextRouteIds, binding.contextRoutes.map(route => route.contextRouteId), 'social routes');
    sameIds(entry.calendarBindingIds, binding.calendarBindings.map(c => c.calendarBindingId), 'social calendar permissions');
    for (const interval of [entry.caseCoverage, entry.calculationCoverage]) if (interval.from < '2026-01-01' || interval.to === null || interval.to > '2027-12-31') fail('Extended social coverage');
  }
  const administrativeCatalog = artifacts.get('ch-cantonal-administrative-procedures');
  assertAdministrativeProcedureCatalogV2(administrativeCatalog);
  const components = new Map<string, { role: 'calendar' | 'holidayCatalog'; contentId: string; sha256: string }>();
  for (const binding of administrativeCatalog.holidayBindings) {
    const baseline = binding.physicalBaseline;
    const calendar = calendars.find(c => c.calendarId === baseline.calendarId);
    const projection = catalog.activation.projections.find(p => p.id === baseline.projectionId);
    if (!calendar || !projection || calendar.projection?.projectionId !== baseline.projectionId || projection.calendarId !== calendar.calendarId
      || calendar.jurisdiction.code !== binding.authoritySeatCanton || projection.jurisdiction !== `CH-${binding.authoritySeatCanton}`) fail('Administrative calendar/projection mismatch');
    const scopeDefinition = (id: string) => {
      const ordinary = catalog.data.scopes.find(scope => scope.id === id);
      if (ordinary) return { jurisdiction: ordinary.jurisdiction, whole: ordinary.type === 'Kanton' || (ordinary.id === 'CH-ALL' && ordinary.type === 'National'), from: ordinary.from, to: ordinary.to };
      const supplemental = catalog.activation.supplementalScopes.find(scope => scope.id === id);
      if (supplemental) return { jurisdiction: supplemental.jurisdiction, whole: supplemental.scopeType === 'canton', ...supplemental.legalValidity };
      return undefined;
    };
    // The current path contract has no area-fact input. A regional variant is
    // neither an implicit yes nor an implicit no. New regional semantics need
    // an explicit reviewed contract before even a base variant can be used.
    for (const alternative of catalog.activation.projections.filter(item => item.jurisdiction === projection!.jurisdiction)) {
      for (const id of alternative.scopeIds) if (!scopeDefinition(id)?.whole) fail('Administrative regional qualification is not modelled');
    }
    for (const id of projection!.scopeIds) {
      const scope = scopeDefinition(id);
      if (!scope || !['CH', projection!.jurisdiction].includes(scope.jurisdiction)) fail('Administrative scope jurisdiction mismatch');
      for (const path of administrativeCatalog.paths.filter(path => path.holidayBindingId === binding.holidayBindingId)) {
        const coverage = path.temporalBinding.calculationCoverage;
        if (coverage.from < scope!.from || (scope!.to !== null && coverage.to > scope!.to)) fail('Administrative calculation exceeds geographic coverage');
      }
    }
    sameIds(baseline.references.map(ref => `${ref.role}:${ref.contentId}`), [`calendar:${calendar!.calendarId}`, ...calendar!.inherits.map(id => `calendar:${id}`), 'holidayCatalog:ch-holiday-catalog'], 'administrative dependency closure');
    for (const ref of baseline.references) {
      const descriptor = manifest.artifacts.find(d => d.contentId === ref.contentId && d.role === ref.role);
      if (!descriptor || descriptor.path !== ref.path) fail('Missing administrative physical dependency');
      if (mode === 'localReference' && (baseline.releaseId !== manifest.releaseId || descriptor!.sha256 !== ref.sha256)) fail('Stale administrative reference bytes');
      components.set(`${ref.role}:${ref.contentId}`, { role: ref.role, contentId: ref.contentId, sha256: descriptor!.sha256 });
    }
  }
  validateAdministrativeReleaseBindingsV2(administrativeCatalog, { releaseId: manifest.releaseId, componentRefs: [...components.values()], mode });
  for (const document of artifacts.values()) freezeTree(document);
  freezeTree(manifest); freezeTree(calendars);
  const parsed: ParsedFormat9Data = Object.freeze({ [format9Brand]: true as const, mode, manifest, catalog, calendars, socialCatalog, administrativeCatalog, artifacts: new ImmutableArtifacts(artifacts) });
  const verified: VerifiedAdministrativeDataV2 = Object.freeze({ catalog: administrativeCatalog, calendars, holidayCatalog: catalog,
    releaseId: manifest.releaseId, coverage: manifest.coverage, referenceOnly: mode === 'localReference' });
  trusted.set(parsed, verified);
  return parsed;
}
