// SPDX-License-Identifier: AGPL-3.0-only
// In-memory synthetic shapes only. Never a source review, human approval or release.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { projectActivatedCalendarsV10 } from '../../src/core/holidayActivationV10';
import { rebindSocialCalendarCandidate } from '../../src/core/calendarMigration';
import { FORMAT7_LEGACY_CALENDAR_BASELINE } from '../../src/core/format7Baseline';
import { socialObjectSha256 } from '../../src/core/socialCatalog';
import type { ReleaseArtifactReference } from '../../src/core/socialTypes';
import type { AdministrativeDeadlineInput } from '../../src/core/administrativeDeadline';

const root = fileURLToPath(new URL('../../', import.meta.url));
const base = resolve(root, 'data/candidates/2026-10-22-ap23f3');
const prefix = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
export const AP23F3_ADMIN = 'administrative-procedures/ch-cantonal-administrative-procedures.json';
export const encode10 = (v: unknown): string => JSON.stringify(v, null, 2) + '\n';
export const sha10 = (v: string): string => createHash('sha256').update(v).digest('hex');
export interface SyntheticFormat10 { manifest: any; files: Map<string, string> }
export function changeSyntheticFormat10(fixture: SyntheticFormat10, path: string, edit: (v: any) => void): void {
  const v = JSON.parse(fixture.files.get(path)!); edit(v);
  const text = encode10(v); fixture.files.set(path, text);
  const entry = fixture.manifest.artifacts.find((a: any) => a.path === path);
  entry.byteLength = Buffer.byteLength(text); entry.sha256 = sha10(text);
}
export function buildSyntheticFormat10(mode: 'approved' | 'localReference' = 'localReference'): SyntheticFormat10 {
  const manifest = JSON.parse(readFileSync(resolve(base, 'manifest.json'), 'utf8'));
  const files = new Map<string, string>(manifest.artifacts.map((a: any) => [a.path, readFileSync(resolve(base, a.path), 'utf8')]));
  if (mode === 'localReference') return { manifest, files };
  manifest.$schema = prefix + 'release-manifest-v10.schema.json';
  manifest.releaseId = '2026-10-22-ap23f3-synthetic-approved-shape.1';
  manifest.releaseStatus = 'approved';
  manifest.sourceSummary.legalBasisReviewStatus = 'verified';
  manifest.sourceSummary.technicalValidationStatus = 'passed';
  manifest.extensions = { 'steimer.synthetic-test': { humanApproval: false, deployable: false } };
  const holiday = JSON.parse(files.get('holiday-catalogs/ch-holiday-catalog.json')!);
  holiday.activation.releaseEligibility = { status: 'approved', releaseId: manifest.releaseId,
    approval: { on: '2026-10-22', by: 'SYNTHETIC TEST, NOT HUMAN APPROVAL', evidence: 'SYNTHETIC TEST ONLY' } };
  const holidayText = encode10(holiday); files.set('holiday-catalogs/ch-holiday-catalog.json', holidayText);
  for (const c of projectActivatedCalendarsV10(holiday, sha10(holidayText), FORMAT7_LEGACY_CALENDAR_BASELINE)) {
    files.set(`calendars/${c.calendarId}.json`, encode10(c));
  }
  const componentRef = (id: string): ReleaseArtifactReference => {
    const role = id === 'ch-holiday-catalog' ? 'holidayCatalog' : 'calendar';
    const path = `${role === 'calendar' ? 'calendars' : 'holiday-catalogs'}/${id}.json`;
    return { role, contentId: id, sha256: sha10(files.get(path)!) };
  };
  const approval = { approvedBy: 'SYNTHETIC TEST, NOT HUMAN APPROVAL', approvedOn: '2026-10-22', decisionRef: 'SYNTHETIC TEST ONLY' };
  const review = { id: 'synthetic-test-review', sha256: sha10('synthetic review, not a source approval') };
  const suite = { id: 'synthetic-test-suite', sha256: sha10('synthetic suite, not a release') };
  const social: any = rebindSocialCalendarCandidate(JSON.parse(files.get('social-procedures/ch-social-procedures.json')!),
    manifest.releaseId, ['ch-federal-calendar', 'be-public-holidays', 'ch-holiday-catalog'].map(componentRef));
  for (const e of social.releaseEligibility) Object.assign(e, { status: 'approved', approval,
    sourceReviewRef: { reviewId: 'SYNTHETIC-TEST-REVIEW', sha256: review.sha256 },
    referenceSuiteRef: { suiteId: 'SYNTHETIC-TEST-SUITE', sha256: suite.sha256 } });
  files.set('social-procedures/ch-social-procedures.json', encode10(social));
  const admin = JSON.parse(files.get(AP23F3_ADMIN)!);
  for (const b of admin.holidayBindings) {
    b.physicalBaseline.releaseId = manifest.releaseId;
    b.physicalBaseline.references = b.physicalBaseline.references.map((r: any) => ({ ...r, ...componentRef(r.contentId) }));
  }
  const ids = [...new Set<string>(admin.holidayBindings.flatMap((b: any) => b.physicalBaseline.references.map((r: any) => r.contentId)))];
  Object.assign(admin.releaseBinding, { status: 'approved', releaseId: manifest.releaseId, approval,
    sourceReviewRef: review, referenceSuiteRef: suite, targetComponentRefs: ids.map(componentRef) });
  for (const e of admin.releaseBinding.pathEligibility) {
    const b = admin.holidayBindings.find((v: any) => v.holidayBindingId === e.holidayBindingId);
    Object.assign(e, { status: 'approved', sourceReviewRef: review, referenceSuiteRef: suite,
      holidayBindingSha256: socialObjectSha256(b), targetComponentRefs: b.physicalBaseline.references.map((r: any) => componentRef(r.contentId)) });
  }
  files.set(AP23F3_ADMIN, encode10(admin));
  for (const a of manifest.artifacts) {
    const text = files.get(a.path)!; a.byteLength = Buffer.byteLength(text); a.sha256 = sha10(text);
  }
  return { manifest, files };
}

/** Complete positive synthetic case facts, never stored UI defaults. */
export function administrativeInput10(catalog: any, id = 'zh-rekurs-30', date = '2026-10-16', days?: number, stage?: string): AdministrativeDeadlineInput {
  const path = catalog.paths.find((p: any) => p.pathId === id)!;
  const law = catalog.laws.find((l: any) => l.lawId === path.lawId)!;
  const policy = catalog.qualificationPolicies.find((p: any) => p.pathId === id)!;
  const r = policy.requirements;
  return { selection: { kind: 'cantonalAdministrative', lawId: path.lawId, pathId: id, revision: path.revision, stage: stage ?? path.stages[0] },
    authoritySeat: { canton: law.canton, level: 'cantonal', qualification: 'competentAuthorityForCurrentAction' },
    inputDate: date, ...(days === undefined ? {} : {deadlineDays: days}),
    qualification: { delivery: 'qualifiedActualDelivery', generalRoute: 'qualified', specialLaw: 'excluded',
      explicitHolidayException: 'none', fixedEndDate: false, deviatingStart: false, evidenceAdvance: false }, urgency: 'none',
    ...(policy.mode === 'legacyV1' ? {} : {caseQualification: {
      action: r.action, decisionKind: r.decisionKind, unit: r.unit, direction: 'forward', opening: r.opening, notice: r.notice, termChange: r.termChange,
      ...(policy.mode === 'qualifiedDayProcedureV3' ? {targetBody: r.targetBody, procedureMatter: r.procedureMatter,
        channelCase: r.channelCase, exceptionNotice: r.exceptionNotice} : {})
    }}) };
}

/** Reseal every identity so tests challenge semantic validation, not a stale checksum. */
export function resealAdministrative10(c: any): void {
  for (const p of c.paths) {
    const q = c.qualificationPolicies.find((q: any) => q.pathId === p.pathId);
    const e = c.releaseBinding.pathEligibility.find((e: any) => e.pathId === p.pathId);
    const b = c.holidayBindings.find((b: any) => b.holidayBindingId === p.holidayBindingId);
    const s = c.suspensionProfiles.find((s: any) => s.suspensionProfileId === p.suspensionProfileId);
    if (q) q.pathSha256 = socialObjectSha256(p);
    if (e && q && b && s) Object.assign(e, {pathSha256: socialObjectSha256(p), qualificationPolicySha256: socialObjectSha256(q),
      holidayBindingId: b.holidayBindingId, holidayBindingSha256: socialObjectSha256(b), suspensionProfileId: s.suspensionProfileId,
      suspensionProfileSha256: socialObjectSha256(s), caseCoverage: structuredClone(p.temporalBinding.caseCoverage),
      calculationCoverage: structuredClone(p.temporalBinding.calculationCoverage)});
  }
}
