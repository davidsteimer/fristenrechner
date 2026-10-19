// SPDX-License-Identifier: AGPL-3.0-only
// In-memory synthetic approvals only. Never a release, human decision or upload.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { projectActivatedCalendars } from '../../src/core/holidayActivation';
import { rebindSocialCalendarCandidate } from '../../src/core/calendarMigration';
import { FORMAT7_LEGACY_CALENDAR_BASELINE } from '../../src/core/format7Baseline';
import { socialObjectSha256 } from '../../src/core/socialCatalog';
import type { ReleaseArtifactReference } from '../../src/core/socialTypes';

const root = fileURLToPath(new URL('../../', import.meta.url));
const base = resolve(root, 'outputs/ap23e3-candidate-2026-10-18/bundle');
const prefix = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
export const AP23E3_ADMIN = 'administrative-procedures/ch-cantonal-administrative-procedures.json';
export const encode9 = (v: unknown): string => JSON.stringify(v, null, 2) + '\n';
export const sha9 = (v: string): string => createHash('sha256').update(v).digest('hex');
export interface SyntheticFormat9 { manifest: any; files: Map<string, string> }
export function changeSyntheticFormat9(fixture: SyntheticFormat9, path: string, edit: (v: any) => void): void {
  const v = JSON.parse(fixture.files.get(path)!); edit(v);
  const text = encode9(v); fixture.files.set(path, text);
  const entry = fixture.manifest.artifacts.find((a: any) => a.path === path);
  entry.byteLength = Buffer.byteLength(text); entry.sha256 = sha9(text);
}
export function buildSyntheticFormat9(mode: 'approved' | 'localReference' = 'localReference'): SyntheticFormat9 {
  const manifest = JSON.parse(readFileSync(resolve(base, 'manifest.json'), 'utf8'));
  const files = new Map<string, string>(manifest.artifacts.map((a: any) => [a.path, readFileSync(resolve(base, a.path), 'utf8')]));
  if (mode === 'localReference') return { manifest, files };
  manifest.$schema = prefix + 'release-manifest-v9.schema.json';
  manifest.releaseId = '2026-10-18-ap23e3-synthetic-approved-shape.1';
  manifest.releaseStatus = 'approved';
  manifest.sourceSummary.legalBasisReviewStatus = 'verified';
  manifest.sourceSummary.technicalValidationStatus = 'passed';
  manifest.extensions = { 'steimer.synthetic-test': { humanApproval: false, deployable: false } };
  const holiday = JSON.parse(files.get('holiday-catalogs/ch-holiday-catalog.json')!);
  holiday.activation.releaseEligibility = { status: 'approved', releaseId: manifest.releaseId,
    approval: { on: '2026-10-18', by: 'SYNTHETIC TEST, NOT HUMAN APPROVAL', evidence: 'SYNTHETIC TEST ONLY' } };
  const holidayText = encode9(holiday); files.set('holiday-catalogs/ch-holiday-catalog.json', holidayText);
  for (const c of projectActivatedCalendars(holiday, sha9(holidayText), FORMAT7_LEGACY_CALENDAR_BASELINE)) {
    files.set(`calendars/${c.calendarId}.json`, encode9(c));
  }
  const componentRef = (id: string): ReleaseArtifactReference => {
    const role = id === 'ch-holiday-catalog' ? 'holidayCatalog' : 'calendar';
    const path = `${role === 'calendar' ? 'calendars' : 'holiday-catalogs'}/${id}.json`;
    return { role, contentId: id, sha256: sha9(files.get(path)!) };
  };
  const approval = { approvedBy: 'SYNTHETIC TEST, NOT HUMAN APPROVAL', approvedOn: '2026-10-18', decisionRef: 'SYNTHETIC TEST ONLY' };
  const review = { id: 'synthetic-test-review', sha256: sha9('synthetic review, not a source approval') };
  const suite = { id: 'synthetic-test-suite', sha256: sha9('synthetic suite, not a release') };
  const social: any = rebindSocialCalendarCandidate(JSON.parse(files.get('social-procedures/ch-social-procedures.json')!),
    manifest.releaseId, ['ch-federal-calendar', 'be-public-holidays', 'ch-holiday-catalog'].map(componentRef));
  for (const e of social.releaseEligibility) {
    Object.assign(e, { status: 'approved', approval,
      sourceReviewRef: { reviewId: 'SYNTHETIC-TEST-REVIEW', sha256: review.sha256 },
      referenceSuiteRef: { suiteId: 'SYNTHETIC-TEST-SUITE', sha256: suite.sha256 } });
  }
  files.set('social-procedures/ch-social-procedures.json', encode9(social));
  const admin = JSON.parse(files.get(AP23E3_ADMIN)!);
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
  files.set(AP23E3_ADMIN, encode9(admin));
  for (const a of manifest.artifacts) {
    const text = files.get(a.path)!; a.byteLength = Buffer.byteLength(text); a.sha256 = sha9(text);
  }
  return { manifest, files };
}
