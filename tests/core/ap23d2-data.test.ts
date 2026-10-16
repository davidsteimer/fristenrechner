// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { buildAP23D2Candidate } from '../../scripts/build-ap23d2-candidate';
import { ap23d2AdministrativeContext, ap23d2Files, ap23d2ManifestText } from '../../src/release/ap23d2CandidateData';
import { calculateAdministrativeDeadline } from '../../src/core/administrativeDeadline';
import type { AdministrativeDeadlineInput } from '../../src/core/administrativeDeadline';
import { getVerifiedAdministrativeData, parseFormat8Data, parseFormat8LocalReferenceData } from '../../src/core/releaseFormat8';

const directory = 'outputs/ap23d2-candidate-2026-10-15';
const baseline = 'data/releases/2026-10-08-mvp-07-approved.1';
const sha = (text: string): string => createHash('sha256').update(text).digest('hex');
const read = (path: string): any => JSON.parse(readFileSync(path, 'utf8'));
const research = read('tests/golden/candidates/ap23b-administrative.json');
function input(pathId: string, inputDate = '2026-10-02', deadlineDays?: number, stage?: string): AdministrativeDeadlineInput {
  const gr = pathId.startsWith('gr-');
  const selectedStage = stage ?? (pathId === 'gr-admin-ordered' ? 'administration'
    : ['ti-80-30', 'gr-32-30', 'gr-32-10'].includes(pathId) ? 'administrativeAppeal' : 'court');
  return { selection: { kind: 'cantonalAdministrative', lawId: gr ? 'vrg-gr' : 'lpamm-ti', pathId, revision: 1, stage: selectedStage },
    authoritySeat: { canton: gr ? 'GR' : 'TI', level: 'cantonal', qualification: 'competentAuthorityForCurrentAction' },
    inputDate, ...(deadlineDays === undefined ? {} : { deadlineDays }),
    qualification: { delivery: 'qualifiedActualDelivery', generalRoute: 'qualified', specialLaw: 'excluded',
      explicitHolidayException: 'none', fixedEndDate: false, deviatingStart: false, evidenceAdvance: false }, urgency: 'none' };
}

test('AP23D2 candidate is a genuine parser-issued local context, never an approval', () => {
  assert.equal(ap23d2AdministrativeContext.mode, 'localReference');
  assert.equal(getVerifiedAdministrativeData(ap23d2AdministrativeContext)?.referenceOnly, true);
  assert.equal(ap23d2AdministrativeContext.manifest.releaseId, '2026-10-15-ap23d2-reference.1');
  assert.equal(ap23d2AdministrativeContext.manifest.releaseStatus, 'candidate');
  const manifest = JSON.parse(ap23d2ManifestText);
  assert.equal(manifest.sourceSummary.legalBasisReviewStatus, 'pending');
  assert.equal(manifest.sourceSummary.latestReviewedOn, '2026-10-12');
  assert.equal(manifest.extensions['steimer.local-reference'].sourceReleaseApproved, false);
  assert.equal(manifest.extensions['steimer.local-reference'].calendarExportEnabled, false);
  assert.throws(() => parseFormat8Data(ap23d2ManifestText, ap23d2Files));
});

test('AP23D2 complete raw bytes on disk, embedded preview and manifest are identical', () => {
  const manifest = JSON.parse(ap23d2ManifestText);
  assert.equal(manifest.artifacts.length, 41);
  assert.equal(ap23d2Files.size, 41);
  assert.equal(readFileSync(`${directory}/bundle/manifest.json`, 'utf8'), ap23d2ManifestText);
  for (const artifact of manifest.artifacts) {
    const text = readFileSync(`${directory}/bundle/${artifact.path}`, 'utf8');
    assert.equal(text, ap23d2Files.get(artifact.path), artifact.path);
    assert.equal(Buffer.byteLength(text), artifact.byteLength, artifact.path);
    assert.equal(sha(text), artifact.sha256, artifact.path);
  }
  const integrity = read(`${directory}/bundle-integrity.json`);
  for (const artifact of [integrity.manifest, ...integrity.artifacts, integrity.previewModule]) {
    const text = readFileSync(artifact.path, 'utf8');
    assert.equal(Buffer.byteLength(text), artifact.byteLength, artifact.path);
    assert.equal(sha(text), artifact.sha256, artifact.path);
  }
});

test('AP23D2 generation is byte-reproducible from bound historical inputs', async () => {
  const rebuilt = await buildAP23D2Candidate();
  assert.equal(rebuilt.manifestText, ap23d2ManifestText);
  assert.deepEqual([...rebuilt.files], [...ap23d2Files]);
  assert.equal(rebuilt.generatedModule, readFileSync('src/release/ap23d2CandidateData.ts', 'utf8'));
  assert.equal(rebuilt.integrityText, readFileSync(`${directory}/bundle-integrity.json`, 'utf8'));
});

test('AP23D2 preserves five legacy profiles and special catalog byte-for-byte', () => {
  const old = read(`${baseline}/manifest.json`);
  for (const descriptor of old.artifacts.filter((a: any) => ['legalProfile', 'specialRegimeCatalog'].includes(a.role))) {
    assert.equal(ap23d2Files.get(descriptor.path), readFileSync(`${baseline}/${descriptor.path}`, 'utf8'), descriptor.path);
  }
});

test('AP23D2 preserves the 44 federal rules and 50 Bern social bindings without new approval', () => {
  const old = read(`${baseline}/social-procedures/ch-social-procedures.json`);
  const current = ap23d2AdministrativeContext.socialCatalog;
  assert.equal(current.federalRules.length, 44);
  assert.equal(current.cantonalBindings.length, 50);
  for (const key of ['federalRules', 'cantonalBindings', 'suspensionProfiles', 'filingProfiles', 'excludedPaths'] as const) {
    assert.deepEqual(current[key], old[key]);
  }
  for (const entry of current.releaseEligibility) {
    const previous = old.releaseEligibility.find((item: any) => item.bindingRef.bindingId === entry.bindingRef.bindingId);
    assert.equal(entry.status, 'candidate');
    assert.equal(entry.approval, null);
    assert.equal(entry.releaseId, ap23d2AdministrativeContext.manifest.releaseId);
    assert.deepEqual(entry.sourceReviewRef, previous.sourceReviewRef);
    assert.deepEqual(entry.referenceSuiteRef, previous.referenceSuiteRef);
    assert.equal(entry.caseCoverage.to, '2027-12-31');
    for (const component of entry.componentRefs) assert.ok(ap23d2AdministrativeContext.manifest.artifacts.some(
      a => a.contentId === component.contentId && a.role === component.role && a.sha256 === component.sha256));
  }
});

test('AP23D2 contract approval does not become path or source release approval', () => {
  const current = ap23d2AdministrativeContext.administrativeCatalog;
  const historical = read('tests/golden/candidates/ap23c-administrative-contract.json');
  assert.deepEqual(current.contractDecision, { id: 'DEC-2026-032', status: 'approved', on: '2026-10-14' });
  assert.equal(current.contractStatus, 'approved');
  assert.equal(current.releaseBinding.status, 'candidate');
  assert.equal(current.releaseBinding.approval, null);
  assert.equal(current.releaseBinding.sourceReviewRef, null);
  assert.equal(current.releaseBinding.referenceSuiteRef, null);
  assert.deepEqual(current.paths, historical.paths);
  assert.deepEqual(current.sources, historical.sources);
  assert.deepEqual(current.review, historical.review);
  assert.deepEqual(current.releaseBinding, historical.releaseBinding);
  assert.equal(current.runtimeActive, false);
});

test('AP23D2 altered or omitted artifact bytes are rejected', () => {
  const changed = new Map(ap23d2Files);
  const path = 'administrative-procedures/ch-cantonal-administrative-procedures.json';
  changed.set(path, changed.get(path)! + ' ');
  assert.throws(() => parseFormat8LocalReferenceData(ap23d2ManifestText, changed), /integrity/i);
  changed.delete(path);
  assert.throws(() => parseFormat8LocalReferenceData(ap23d2ManifestText, changed), /inventory/i);
});

for (const reference of research.cases.filter((item: any) => /^(TI|GR)/.test(item.id) && item.input.trigger >= '2026-08-29')) {
  test(`AP23D2 ${reference.id} runs the accepted reference against the actual candidate bundle`, () => {
    const result = calculateAdministrativeDeadline(input(reference.input.path.toLowerCase(), reference.input.trigger,
      reference.input.days, reference.input.stage), ap23d2AdministrativeContext);
    assert.equal(result.calendarExportAllowed, false);
    if (reference.expected.outcome === 'blocked') {
      assert.equal(result.outcome, 'blocked');
      if (result.outcome !== 'blocked') throw new Error('Expected block');
      assert.ok(result.blockReasonKeys.includes(reference.expected.reason));
      assert.equal('finalEnd' in result, false);
    } else {
      assert.equal(result.outcome, 'calculated', JSON.stringify(result));
      if (result.outcome !== 'calculated') throw new Error('Expected calculated result');
      assert.equal(result.referenceOnly, true);
      assert.equal(result.finalEnd, reference.expected.end);
      assert.equal(result.provenance.releaseId, ap23d2AdministrativeContext.manifest.releaseId);
      assert.equal(result.provenance.pathId, reference.input.path.toLowerCase());
      if (reference.expected.nominalEnd) assert.equal(result.provisionalEnd, reference.expected.nominalEnd);
      if (reference.expected.firstCountedDay) assert.equal(result.deadlineStart, reference.expected.firstCountedDay);
      if (reference.expected.skippedDays !== undefined) assert.equal(result.skippedCalendarDays, reference.expected.skippedDays);
    }
  });
}

for (const reference of research.cases.filter((item: any) => /^(TI|GR)/.test(item.id) && item.input.trigger < '2026-08-29')) {
  test(`AP23D2 ${reference.id} remains a historical reference outside the candidate case window`, () => {
    const value = input(reference.input.path.toLowerCase(), reference.input.trigger, reference.input.days, reference.input.stage);
    const result = calculateAdministrativeDeadline({ ...value,
      urgency: reference.input.urgency === 'urgentOrder' ? 'explicitJudicialUrgencyOrder' : 'none' }, ap23d2AdministrativeContext);
    assert.equal(result.outcome, 'blocked');
    if (result.outcome !== 'blocked') throw new Error('Expected case-window block');
    assert.ok(result.blockReasonKeys.includes('administrative.outsideCaseCoverage'));
    assert.equal('finalEnd' in result, false);
    assert.equal(result.calendarExportAllowed, false);
  });
}

test('AP23D2 current-window GR court, administration and explicit urgency stay distinct', () => {
  const cases = [
    { path: 'gr-52-30', date: '2027-07-10', days: 30, end: '2027-09-10' },
    { path: 'gr-32-30', date: '2027-07-10', days: 30, end: '2027-08-09' },
    { path: 'gr-52-10', date: '2027-07-20', days: 10, end: '2027-08-25' },
    { path: 'gr-32-10', date: '2027-07-20', days: 10, end: '2027-07-30' },
    { path: 'gr-42-10', date: '2027-07-20', days: 10, end: '2027-08-25' },
    { path: 'gr-court-ordered', date: '2027-07-20', days: 10, end: '2027-07-30', urgent: true }
  ];
  for (const reference of cases) {
    const result = calculateAdministrativeDeadline({ ...input(reference.path, reference.date, reference.days),
      urgency: reference.urgent ? 'explicitJudicialUrgencyOrder' : 'none' }, ap23d2AdministrativeContext);
    assert.equal(result.outcome, 'calculated', JSON.stringify(result));
    if (result.outcome !== 'calculated') throw new Error('Expected calculation');
    assert.equal(result.finalEnd, reference.end);
    assert.equal(result.calendarExportAllowed, false);
  }
});

test('AP23D2 TI-O1 uses the competent authority seat without requiring party or counsel locations', () => {
  const result = calculateAdministrativeDeadline(input('ti-reply', '2026-11-23', 15), ap23d2AdministrativeContext);
  assert.equal(result.outcome, 'calculated');
  if (result.outcome !== 'calculated') throw new Error('Expected calculation');
  assert.equal(result.finalEnd, '2026-12-09');
  assert.equal(result.provenance.authoritySeatCanton, 'TI');
  assert.equal(result.provenance.holidayRole, 'authoritySeat');
  assert.ok(result.shiftedHolidayIds.length > 0);
  assert.equal(JSON.stringify(result).includes('allRelevantLocationsTI'), false);
});

test('AP23D2 all twelve path groups and their permitted stages calculate without a fabricated legacy identity', () => {
  for (const path of ap23d2AdministrativeContext.administrativeCatalog.paths) for (const stage of path.stages) {
    const days = path.duration.kind === 'statutoryDays' ? path.duration.value : 10;
    const result = calculateAdministrativeDeadline(input(path.pathId, '2026-10-02', days, stage), ap23d2AdministrativeContext);
    assert.equal(result.outcome, 'calculated', JSON.stringify(result));
    if (result.outcome !== 'calculated') throw new Error('Expected calculation');
    assert.equal(result.provenance.pathId, path.pathId);
    assert.equal(result.provenance.stage, stage);
    assert.equal('profileId' in result.provenance, false);
    assert.equal(result.referenceOnly, true);
    assert.equal(result.calendarExportAllowed, false);
  }
});
