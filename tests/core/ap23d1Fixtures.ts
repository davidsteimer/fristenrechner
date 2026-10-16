// SPDX-License-Identifier: AGPL-3.0-only
// SYNTHETIC TRANSPORT/EVIDENCE SHAPES ONLY. No human approval, release artifact,
// publication or production permission is created by these in-memory fixtures.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { projectActivatedCalendars } from '../../src/core/holidayActivation';
import { rebindSocialCalendarCandidate } from '../../src/core/calendarMigration';
import { parseFormat8Data, parseFormat8LocalReferenceData } from '../../src/core/releaseFormat8';
import { FORMAT7_LEGACY_CALENDAR_BASELINE } from '../../src/core/format7Baseline';
import type { ParsedFormat8Data } from '../../src/core/releaseFormat8';
import type { CalendarRuleSet } from '../../src/core/calendarRuleTypes';
import type { ReleaseArtifactReference } from '../../src/core/socialTypes';

export type SyntheticFormat8Mode = 'approved' | 'localReference';
export interface SyntheticFormat8Fixture { manifest: any; files: Map<string, string>; legacyCalendars: readonly CalendarRuleSet[] }
const base = 'data/releases/2026-10-08-mvp-07-approved.1/';
const prefix = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
const read = (path: string): any => JSON.parse(readFileSync(path, 'utf8'));
export const encodeSyntheticFormat8 = (value: unknown): string => JSON.stringify(value, null, 2) + '\n';
export const syntheticSha256 = (text: string): string => createHash('sha256').update(text).digest('hex');
const originals = new Map<SyntheticFormat8Mode, SyntheticFormat8Fixture>();
const adminPath = 'administrative-procedures/ch-cantonal-administrative-procedures.json';
export const SYNTHETIC_ADMIN_PATH = adminPath;

export function refreshSyntheticFormat8Manifest(fixture: SyntheticFormat8Fixture): void {
  const schemaNames: Record<string, string> = { legalProfile: 'legal-profile', calendar: 'calendar-rules-v3', holidayCatalog: 'holiday-catalog-v2',
    specialRegimeCatalog: 'special-regime-catalog-v3', socialProcedureCatalog: 'social-procedure-catalog-v2', administrativeProcedureCatalog: 'administrative-procedure-catalog' };
  fixture.manifest.artifacts = [...fixture.files].map(([path, text]) => {
    const document = JSON.parse(text), role = document.dataKind;
    return { path, role, contentId: role === 'calendar' ? document.calendarId : role === 'legalProfile' ? document.profileId : document.catalogId,
      mediaType: 'application/json', schemaId: prefix + schemaNames[role] + '.schema.json', byteLength: Buffer.byteLength(text), sha256: syntheticSha256(text) };
  });
  fixture.manifest.sourceSummary.sourceIds = [...new Set([...fixture.files.values()].flatMap(text => {
    const document = JSON.parse(text);
    return Array.isArray(document.sources) ? document.sources.map((source: any) => source.sourceId as string) : [];
  }))].sort();
}

export function buildSyntheticFormat8(mode: SyntheticFormat8Mode = 'localReference'): SyntheticFormat8Fixture {
  if (!originals.has(mode)) {
    const manifest = read(base + 'manifest.json');
    const files = new Map<string, string>();
    for (const descriptor of manifest.artifacts) if (['legalProfile', 'specialRegimeCatalog'].includes(descriptor.role)) {
      files.set(descriptor.path, readFileSync(base + descriptor.path, 'utf8'));
    }
    const approved = mode === 'approved';
    manifest.$schema = prefix + (approved ? 'release-manifest-v8.schema.json' : 'local-reference-manifest-v8.schema.json');
    manifest.formatVersion = '8.0.0';
    manifest.compatibility.minimumConsumerFormatVersion = '8.0.0';
    manifest.releaseId = `2026-10-14-ap23d1-synthetic-${approved ? 'approved-shape' : 'reference'}.1`;
    manifest.createdOn = '2026-10-14';
    manifest.releaseStatus = approved ? 'approved' : 'candidate';
    manifest.administrativeProcedureCatalogIds = ['ch-cantonal-administrative-procedures'];
    manifest.sourceSummary.legalBasisReviewStatus = approved ? 'verified' : 'pending';
    manifest.sourceSummary.technicalValidationStatus = approved ? 'passed' : 'pending';
    manifest.sourceSummary.latestReviewedOn = '2026-10-14';
    const holiday = read(base + 'holiday-catalogs/ch-holiday-catalog.json');
    holiday.activation.releaseEligibility = approved
      ? { status: 'approved', releaseId: manifest.releaseId, approval: { on: '2026-10-14', by: 'SYNTHETIC TEST, NOT HUMAN APPROVAL', evidence: 'SYNTHETIC TEST ONLY' } }
      : { status: 'candidate', releaseId: null, approval: null };
    const holidayText = encodeSyntheticFormat8(holiday);
    files.set('holiday-catalogs/ch-holiday-catalog.json', holidayText);
    const calendars = projectActivatedCalendars(holiday, syntheticSha256(holidayText), FORMAT7_LEGACY_CALENDAR_BASELINE);
    calendars.forEach(calendar => files.set(`calendars/${calendar.calendarId}.json`, encodeSyntheticFormat8(calendar)));
    const componentRef = (id: string): ReleaseArtifactReference => {
      const role = id === 'ch-holiday-catalog' ? 'holidayCatalog' : 'calendar';
      const path = `${role === 'calendar' ? 'calendars' : 'holiday-catalogs'}/${id}.json`;
      return { role, contentId: id, sha256: syntheticSha256(files.get(path)!) };
    };
    const social: any = rebindSocialCalendarCandidate(read(base + 'social-procedures/ch-social-procedures.json'), manifest.releaseId,
      ['ch-federal-calendar', 'be-public-holidays', 'ch-holiday-catalog'].map(componentRef));
    for (const entry of social.releaseEligibility) {
      entry.sourceReviewRef = { reviewId: 'SYNTHETIC-TEST-REVIEW', sha256: syntheticSha256('synthetic review, no human approval') };
      entry.referenceSuiteRef = { suiteId: 'SYNTHETIC-TEST-SUITE', sha256: syntheticSha256('synthetic suite, no release') };
      if (approved) {
        entry.status = 'approved';
        entry.approval = { approvedBy: 'SYNTHETIC TEST, NOT HUMAN APPROVAL', approvedOn: '2026-10-14', decisionRef: 'SYNTHETIC TEST ONLY' };
      }
    }
    files.set('social-procedures/ch-social-procedures.json', encodeSyntheticFormat8(social));
    const admin = read('tests/golden/candidates/ap23c-administrative-contract.json');
    admin.contractStatus = 'approved';
    admin.contractDecision = { id: 'DEC-2026-032', status: 'approved', on: '2026-10-14' };
    if (approved) {
      const sourceReviewRef = { id: 'synthetic-test-review', sha256: syntheticSha256('synthetic administrative review, no human approval') };
      const referenceSuiteRef = { id: 'synthetic-test-suite', sha256: syntheticSha256('synthetic administrative suite, no release') };
      const componentIds = [...new Set<string>(admin.holidayBindings.flatMap((binding: any) => binding.physicalBaseline.references.map((ref: any) => ref.contentId)))];
      Object.assign(admin.releaseBinding, { status: 'approved', releaseId: manifest.releaseId,
        approval: { approvedBy: 'SYNTHETIC TEST, NOT HUMAN APPROVAL', approvedOn: '2026-10-14', decisionRef: 'SYNTHETIC TEST ONLY' },
        sourceReviewRef, referenceSuiteRef, targetComponentRefs: componentIds.map(componentRef) });
      for (const entry of admin.releaseBinding.pathEligibility) {
        const binding = admin.holidayBindings.find((item: any) => item.holidayBindingId === entry.holidayBindingId);
        Object.assign(entry, { status: 'approved', sourceReviewRef, referenceSuiteRef,
          targetComponentRefs: binding.physicalBaseline.references.map((ref: any) => componentRef(ref.contentId)) });
      }
    }
    files.set(adminPath, encodeSyntheticFormat8(admin));
    const fixture = { manifest, files, legacyCalendars: FORMAT7_LEGACY_CALENDAR_BASELINE };
    refreshSyntheticFormat8Manifest(fixture);
    originals.set(mode, fixture);
  }
  const value = originals.get(mode)!;
  return { manifest: structuredClone(value.manifest), files: new Map(value.files), legacyCalendars: value.legacyCalendars };
}
export function createSyntheticFormat8Context(mode: SyntheticFormat8Mode = 'localReference'): ParsedFormat8Data {
  const fixture = buildSyntheticFormat8(mode);
  return (mode === 'approved' ? parseFormat8Data : parseFormat8LocalReferenceData)(encodeSyntheticFormat8(fixture.manifest), fixture.files, fixture.legacyCalendars);
}
export function changeSyntheticFormat8(fixture: SyntheticFormat8Fixture, path: string, mutate: (value: any) => void): void {
  const value = JSON.parse(fixture.files.get(path)!);
  mutate(value);
  const text = encodeSyntheticFormat8(value);
  fixture.files.set(path, text);
  const descriptor = fixture.manifest.artifacts.find((item: any) => item.path === path)!;
  descriptor.byteLength = Buffer.byteLength(text);
  descriptor.sha256 = syntheticSha256(text);
}
