// SPDX-License-Identifier: AGPL-3.0-only
// AP22C1 data reader. Deliberately NOT a CalculationData factory or provider.
import manifestSchema from '../../schemas/implementation/ap22c1/release-manifest-v7.schema.json';
import calendarSchema from '../../schemas/implementation/ap22c1/calendar-rules-v3.schema.json';
import catalogSchema from '../../schemas/implementation/ap22c1/holiday-catalog-v2.schema.json';
import common from '../../schemas/common.schema.json';
import profileSchema from '../../schemas/legal-profile.schema.json';
import specialSchema from '../../schemas/special-regime-catalog-v3.schema.json';
import specialV2 from '../../schemas/special-regime-catalog-v2.schema.json';
import socialSchema from '../../schemas/social-procedure-catalog-v2.schema.json';
import oldManifest from '../../schemas/release-manifest.schema.json';
import deadline from '../../schemas/deadline-definition.schema.json';
import filing from '../../schemas/filing-profile.schema.json';
import { assertSchema } from './schemaContract';
import { assertHolidayCatalogV2, assertActivatedCalendarProjection } from './holidayActivation';
import { assertSocialProcedureCatalog, rawSha256Text } from './socialCatalog';
import type { CalendarRuleSet } from './calendarRuleTypes';
import type { HolidayCatalogV2 } from './holidayActivationTypes';
import type { SocialProcedureCatalog } from './socialTypes';

export const FORMAT7_SCHEMAS: ReadonlyMap<string, unknown> = new Map(
  [manifestSchema, calendarSchema, catalogSchema, common, profileSchema, specialSchema, specialV2,
    socialSchema, oldManifest, deadline, filing].map(schema => [schema.$id, schema])
);
type Role = 'legalProfile' | 'calendar' | 'specialRegimeCatalog' | 'holidayCatalog' | 'socialProcedureCatalog';
export interface Format7Artifact {
  readonly path: string;
  readonly role: Role;
  readonly contentId: string;
  readonly mediaType: 'application/json';
  readonly schemaId: string;
  readonly byteLength: number;
  readonly sha256: string;
}
export interface Format7Manifest {
  readonly formatVersion: '7.0.0';
  readonly releaseId: string;
  readonly releaseStatus: 'draft' | 'candidate' | 'approved' | 'withdrawn';
  readonly coverage: { readonly from: string; readonly to: null };
  readonly profileIds: readonly string[];
  readonly calendarIds: readonly string[];
  readonly specialRegimeCatalogIds: readonly string[];
  readonly holidayCatalogIds: readonly string[];
  readonly socialProcedureCatalogIds: readonly string[];
  readonly sourceSummary: { readonly sourceIds: readonly string[] };
  readonly artifacts: readonly Format7Artifact[];
}
export interface ParsedFormat7Data {
  readonly manifest: Format7Manifest;
  readonly catalog: HolidayCatalogV2;
  readonly calendars: readonly CalendarRuleSet[];
  readonly socialCatalog: SocialProcedureCatalog;
  readonly artifacts: ReadonlyMap<string, unknown>;
  readonly runtimeReady: false;
}
export class Format7DataError extends Error {
  constructor(message: string) { super(message); this.name = 'Format7DataError'; Object.setPrototypeOf(this, Format7DataError.prototype); }
}
const fail = (message: string): never => { throw new Format7DataError(message); };
const identicalIds = (a: readonly string[], b: readonly string[], label: string): void => {
  if (new Set(a).size !== a.length || new Set(b).size !== b.length
    || JSON.stringify([...a].sort()) !== JSON.stringify([...b].sort())) fail(`Inventory mismatch: ${label}`);
};
const roleSchemas = { legalProfile: profileSchema, calendar: calendarSchema, specialRegimeCatalog: specialSchema,
  holidayCatalog: catalogSchema, socialProcedureCatalog: socialSchema };

export function parseCalendarRuleSetV3(value: unknown): CalendarRuleSet {
  assertSchema(value, calendarSchema, FORMAT7_SCHEMAS);
  const calendar = value as CalendarRuleSet;
  if (calendar.validity.to !== null && calendar.validity.from > calendar.validity.to) fail('Reversed calendar validity');
  const ids = new Set<string>();
  for (const rule of calendar.rules) {
    if (ids.has(rule.ruleId) || rule.calendarId !== calendar.calendarId) fail('Duplicate or foreign rule');
    ids.add(rule.ruleId);
    if (rule.validity.to !== null && rule.validity.from > rule.validity.to) fail('Reversed rule validity');
    if (rule.sourceRefs.some(ref => !calendar.sources.some(source => source.sourceId === ref.sourceId))) fail('Unbound rule source');
  }
  return calendar;
}

/** Byte-bound, closed inventory. Its output cannot activate a user calculation. */
export function parseFormat7Data(
  manifestText: string,
  files: ReadonlyMap<string, string>,
  legacyCalendars: readonly CalendarRuleSet[]
): ParsedFormat7Data {
  const value: unknown = JSON.parse(manifestText);
  assertSchema(value, manifestSchema, FORMAT7_SCHEMAS);
  const manifest = value as Format7Manifest;
  if (manifest.coverage.from !== '2026-08-29') fail('Unexpected AP22 coverage start');
  identicalIds(manifest.artifacts.map(a => a.path), [...files.keys()], 'files');
  identicalIds(manifest.artifacts.map(a => a.contentId), manifest.artifacts.map(a => a.contentId), 'content IDs');
  if (new Set(manifest.artifacts.map(a => a.sha256)).size !== manifest.artifacts.length) fail('Duplicate artifact hash');
  const artifacts = new Map<string, any>();
  for (const descriptor of manifest.artifacts) {
    if (descriptor.path.split('/').some(part => !part || part === '.' || part === '..')) fail('Non-canonical artifact path');
    const text = files.get(descriptor.path)!;
    if (new TextEncoder().encode(text).byteLength !== descriptor.byteLength || rawSha256Text(text) !== descriptor.sha256) fail(`Artifact integrity: ${descriptor.path}`);
    const document = JSON.parse(text);
    if (descriptor.schemaId !== roleSchemas[descriptor.role].$id) fail('Role/schema mismatch');
    assertSchema(document, roleSchemas[descriptor.role], FORMAT7_SCHEMAS);
    const idKey = descriptor.role === 'legalProfile' ? 'profileId' : descriptor.role === 'calendar' ? 'calendarId' : 'catalogId';
    if (document[idKey] !== descriptor.contentId || document.dataKind !== descriptor.role) fail('Content/role mismatch');
    artifacts.set(descriptor.contentId, document);
  }
  for (const [role, ids] of [
    ['legalProfile', manifest.profileIds], ['calendar', manifest.calendarIds],
    ['specialRegimeCatalog', manifest.specialRegimeCatalogIds], ['holidayCatalog', manifest.holidayCatalogIds],
    ['socialProcedureCatalog', manifest.socialProcedureCatalogIds]
  ] as const) identicalIds(ids, manifest.artifacts.filter(a => a.role === role).map(a => a.contentId), role);
  const catalog = artifacts.get('ch-holiday-catalog');
  assertHolidayCatalogV2(catalog);
  const catalogHash = manifest.artifacts.find(a => a.role === 'holidayCatalog')!.sha256;
  const calendars = manifest.calendarIds.map(id => parseCalendarRuleSetV3(artifacts.get(id)));
  assertActivatedCalendarProjection(catalog, catalogHash, calendars, legacyCalendars);
  if (catalog.activation.contractDecision.status !== 'approved') fail('Unapproved data contract');
  const permission = catalog.activation.releaseEligibility;
  if (manifest.releaseStatus === 'approved'
    ? permission.status !== 'approved' || permission.releaseId !== manifest.releaseId
    : permission.status !== 'candidate') fail('Release/calendar approval mismatch');
  const socialCatalog = artifacts.get('ch-social-procedures');
  assertSocialProcedureCatalog(socialCatalog);
  if (socialCatalog.formatVersion !== '2.0.0') fail('Social component version');
  if (socialCatalog.federalRules.length !== 44 || socialCatalog.cantonalBindings.length !== 50
    || socialCatalog.releaseEligibility.length !== 50) fail('Incomplete 44/50 social inventory');
  identicalIds(socialCatalog.cantonalBindings.map(binding => binding.bindingId),
    socialCatalog.releaseEligibility.map(entry => entry.bindingRef.bindingId), 'social binding coverage');
  const componentIds = ['be-public-holidays', 'ch-federal-calendar', 'ch-holiday-catalog'];
  for (const eligibility of socialCatalog.releaseEligibility) {
    if (eligibility.releaseId !== manifest.releaseId) fail('Stale social release binding');
    if (manifest.releaseStatus === 'approved' ? eligibility.status !== 'approved' : eligibility.status !== 'candidate') fail('Social approval mismatch');
    identicalIds(componentIds, eligibility.componentRefs.map(ref => ref.contentId), 'social components');
    for (const ref of eligibility.componentRefs) {
      if (!manifest.artifacts.some(a => a.role === ref.role && a.contentId === ref.contentId && a.sha256 === ref.sha256)) fail('Stale social component hash');
    }
    if (eligibility.caseCoverage.from < '2026-01-01' || eligibility.caseCoverage.to === null || eligibility.caseCoverage.to > '2027-12-31') fail('Extended social coverage');
  }
  if (socialCatalog.cantonalBindings.some(binding => binding.procedureContextCanton !== 'BE')) fail('Non-Bern social binding');
  // Source summary remains a declared review status, not evidence of its truth.
  // C3/release preparation must bind actual review evidence before activation.
  return { manifest, catalog, calendars, socialCatalog, artifacts, runtimeReady: false };
}
