// SPDX-License-Identifier: AGPL-3.0-only
// In-memory synthetic approval shapes are not a human release approval.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateAdministrativeDeadline } from '../../src/core/administrativeDeadline';
import type { AdministrativeDeadlineInput } from '../../src/core/administrativeDeadline';
import { getVerifiedAdministrativeDataV2, parseFormat9Data, parseFormat9LocalReferenceData, assertTrustedFormat9Data } from '../../src/core/releaseFormat9';
import { getVerifiedAdministrativeData, parseFormat8Data, parseFormat8LocalReferenceData } from '../../src/core/releaseFormat8';
import { createFormat9CalculationData } from '../../src/core/format9CalculationData';
import { hasMatchingFormat9Runtime, trustedFormat9Runtime } from '../../src/core/format9Runtime';
import { hasMatchingFormat8Runtime, trustedFormat8Runtime } from '../../src/core/format8Runtime';
import { assertAdministrativeProcedureCatalogV2 } from '../../src/core/administrativeCatalogV2';
import { socialObjectSha256 } from '../../src/core/socialCatalog';
import { buildSyntheticFormat9, changeSyntheticFormat9, encode9, AP23E3_ADMIN } from './ap23e3Fixtures';

const fixture = buildSyntheticFormat9();
const context = parseFormat9LocalReferenceData(encode9(fixture.manifest), fixture.files);
const research = JSON.parse(readFileSync('tests/golden/candidates/ap23e1-administrative.json', 'utf8'));
function input(id = 'lu-admin-30', date = '2026-10-16', days?: number, stage?: string): AdministrativeDeadlineInput {
  const path = context.administrativeCatalog.paths.find(p => p.pathId === id)!;
  const law = context.administrativeCatalog.laws.find(l => l.lawId === path.lawId)!;
  const policy = context.administrativeCatalog.qualificationPolicies.find(p => p.pathId === id)!;
  const result: AdministrativeDeadlineInput = {
    selection: { kind: 'cantonalAdministrative', lawId: path.lawId, pathId: id, revision: path.revision, stage: stage ?? path.stages[0]! },
    authoritySeat: { canton: law.canton, level: 'cantonal', qualification: 'competentAuthorityForCurrentAction' },
    inputDate: date, ...(days === undefined ? {} : { deadlineDays: days }),
    qualification: { delivery: 'qualifiedActualDelivery', generalRoute: 'qualified', specialLaw: 'excluded',
      explicitHolidayException: 'none', fixedEndDate: false, deviatingStart: false, evidenceAdvance: false },
    urgency: 'none',
    ...(policy.mode === 'qualifiedDayProcedure' ? { caseQualification: {
      action: policy.requirements.action, decisionKind: policy.requirements.decisionKind,
      unit: 'day', direction: 'forward', opening: 'qualifiedCompleteActualDelivery', notice: 'uncontested', termChange: 'none'
    } } : {})
  };
  return result;
}
function block(value: AdministrativeDeadlineInput, reason?: string): void {
  const result = calculateAdministrativeDeadline(value, context);
  assert.equal(result.outcome, 'blocked', JSON.stringify(result));
  assert.equal(result.calendarExportAllowed, false);
  assert.equal('finalEnd' in result, false);
  if (reason && result.outcome === 'blocked') assert.ok(result.blockReasonKeys.includes(reason), JSON.stringify(result));
}

for (const row of research.cases) test('AP23E3 native counter matches accepted E1 ' + row.id, () => {
  const r = row.input;
  const value: any = input(r.path.toLowerCase(), r.trigger, r.days, r.stage);
  const facts = { ...research.sharedFacts, ...r };
  if (facts.action === 'proceduralSubmission' && !Object.hasOwn(r, 'decisionKind')) facts.decisionKind = 'notApplicable';
  for (const key of ['action', 'decisionKind', 'unit', 'opening', 'notice', 'termChange']) value.caseQualification[key] = facts[key];
  if (r.direction) value.caseQualification.direction = r.direction;
  value.urgency = facts.urgency;
  value.qualification.specialLaw = facts.specialLaw;
  value.qualification.fixedEndDate = facts.fixedEndDate;
  value.qualification.deviatingStart = facts.deviatingStart;
  value.authoritySeat.level = facts.authorityLevel;
  if (facts.holidayAnchor !== 'qualifiedTargetAuthority') value.authoritySeat.qualification = facts.holidayAnchor;
  const result = calculateAdministrativeDeadline(value, context);
  assert.equal(result.calendarExportAllowed, false);
  if (row.expected.outcome === 'blocked') assert.equal(result.outcome, 'blocked', JSON.stringify(result));
  else {
    assert.equal(result.outcome, 'calculated', JSON.stringify(result));
    if (result.outcome !== 'calculated') return;
    assert.equal(result.finalEnd, row.expected.end);
    if (row.expected.nominalEnd) assert.equal(result.provisionalEnd, row.expected.nominalEnd);
    if (row.expected.skippedDays !== undefined) assert.equal(result.skippedCalendarDays, row.expected.skippedDays);
    if (row.expected.firstCountedDay) assert.equal(result.deadlineStart, row.expected.firstCountedDay);
    assert.equal(result.referenceOnly, true);
    assert.match(result.provenance.qualificationPolicySha256!, /^[a-f0-9]{64}$/);
  }
});

test('AP23E3 each new positive case requires all current qualifications, never stored defaults', () => {
  const full: any = input();
  const absent = structuredClone(full); delete absent.caseQualification;
  block(absent, 'administrative.caseQualificationRequired');
  for (const field of Object.keys(full.caseQualification)) {
    const altered = structuredClone(full); delete altered.caseQualification[field];
    block(altered, 'administrative.inputContractInvalid');
  }
  for (const [field, values] of Object.entries({
    action: ['payment', 'costAdvance', 'materialPerformance', 'unknown', true, 1],
    decisionKind: ['interimDecision', 'paymentReminder', 'unknown'],
    unit: ['month', 'hour', 'year', 'fixedDate', 'unknown'],
    direction: ['backward', 'unknown'],
    opening: ['fiction', 'publication', 'dispositiveOnly', 'oralAwaitingWrittenConfirmation', 'unknown'],
    notice: ['missing', 'incorrect', 'disputed', 'unknown'],
    termChange: ['extension', 'reinstatement', 'shortened', 'other', 'unknown']
  })) for (const value of values) {
    const altered = structuredClone(full); altered.caseQualification[field] = value; block(altered);
  }
  const extra = structuredClone(full); extra.caseQualification.approved = true; block(extra, 'administrative.inputContractInvalid');
  block({ ...full, urgency: 'explicitJudicialUrgencyOrder' }, 'administrative.unsupportedUrgency');
  block({ ...full, selection: { ...full.selection, revision: 2 } }, 'administrative.unknownPath');
  block({ ...full, selection: { ...full.selection, lawId: 'lpamm-ti' } }, 'administrative.unknownPath');
  block({ ...full, authoritySeat: { ...full.authoritySeat, canton: 'BE' } }, 'administrative.authoritySeatMismatch');
});

test('AP23E3 AR-O1 blocks before holiday shift enters court suspension, never an exportable provisional date', () => {
  const result = calculateAdministrativeDeadline(input('ar-court-30', '2027-02-18'), context);
  assert.equal(result.outcome, 'blocked');
  if (result.outcome === 'blocked') {
    assert.equal(result.blockedDate, '2027-03-21');
    assert.equal(result.provisionalEnd, '2027-03-20');
    assert.equal(result.calendarExportAllowed, false);
    assert.equal('finalEnd' in result, false);
  }
});

test('AP23E3 windows cover delivery, all count days and final shifts without extending social years', () => {
  block(input('lu-admin-30', '2026-09-26'), 'administrative.outsideCaseCoverage');
  block(input('zg-admin-20', '2026-08-28'), 'administrative.outsideCaseCoverage');
  block(input('ar-admin-20', '2026-08-28'), 'administrative.outsideCaseCoverage');
  block(input('zg-court-ordered', '2027-12-31', 1), 'dataCoverageExceeded');
  block(input('ar-court-30', '2027-11-24'), 'dataCoverageExceeded');
  assert.ok(context.socialCatalog.releaseEligibility.every(e => e.calculationCoverage.to! <= '2027-12-31'));
});

test('AP23E3 preserves every legacy TI/GR path and exception without importing new final-decision/payment exclusions', () => {
  const base = 'data/releases/2026-10-15-mvp-08-approved.1/';
  const text = readFileSync(base + 'manifest.json', 'utf8'), m = JSON.parse(text);
  const old = parseFormat8Data(text, new Map(m.artifacts.map((d: any) => [d.path, readFileSync(base + d.path, 'utf8')])));
  const dates = ['2026-10-16', '2026-12-17', '2027-03-18', '2027-07-20'];
  for (const path of old.administrativeCatalog.paths) {
    assert.deepEqual(context.administrativeCatalog.paths.find(p => p.pathId === path.pathId), path);
    for (const date of dates) for (const stage of path.stages) {
      const value = input(path.pathId, date, path.duration.kind === 'authorityOrderedDays' ? 10 : undefined, stage);
      const a = calculateAdministrativeDeadline(value, context), b = calculateAdministrativeDeadline(value, old);
      assert.equal(a.outcome, b.outcome);
      const semantic = (r: any) => {
        const { provenance, referenceOnly, calendarExportAllowed, ...rest } = r; return rest;
      };
      assert.deepEqual(semantic(a), semantic(b), path.pathId + ':' + date + ':' + stage);
    }
  }
  const gr = input('gr-court-ordered', '2027-07-20', 10);
  const urgent = calculateAdministrativeDeadline({ ...gr, urgency: 'explicitJudicialUrgencyOrder' }, context);
  assert.equal(urgent.outcome, 'calculated');
  if (urgent.outcome === 'calculated') assert.equal(urgent.finalEnd, '2027-07-30');
  block({ ...input('ti-advance'), caseQualification: input().caseQualification! }, 'administrative.inputContractInvalid');
});

test('AP23E3 independent native capability cannot be copied, serialized, proxied or relabelled as Format8', () => {
  assertTrustedFormat9Data(context);
  assert.equal(getVerifiedAdministrativeData(context), undefined);
  for (const invalid of [undefined, null, {}, { ...context }, JSON.parse(JSON.stringify(context)), Object.create(context), new Proxy(context, {})]) {
    assert.equal(getVerifiedAdministrativeDataV2(invalid), undefined);
    assert.throws(() => assertTrustedFormat9Data(invalid));
    assert.equal(calculateAdministrativeDeadline(input(), invalid).outcome, 'blocked');
  }
  assert.throws(() => { (context.administrativeCatalog.qualificationPolicies as any).pop(); }, TypeError);
  assert.equal(typeof (context.artifacts as any).set, 'undefined');
  const runtime = createFormat9CalculationData(encode9(fixture.manifest), fixture.files, { mode: 'localReference' });
  assert.equal(trustedFormat9Runtime(runtime.data), runtime.calendarRuntime);
  assert.equal(trustedFormat8Runtime(runtime.data), undefined);
  assert.equal(hasMatchingFormat8Runtime(runtime.data, runtime.calendarRuntime, context), false);
  assert.equal(hasMatchingFormat9Runtime(runtime.data, runtime.calendarRuntime, runtime.administrativeContext), true);
  assert.equal(trustedFormat9Runtime({ ...runtime.data }), undefined);
  assert.equal(hasMatchingFormat9Runtime(runtime.data, runtime.calendarRuntime, { ...runtime.administrativeContext }), false);
});

test('AP23E3 approved and local readers are disjoint, old reader refuses real or resealed downgrade', () => {
  assert.throws(() => parseFormat9Data(encode9(fixture.manifest), fixture.files));
  const approved = buildSyntheticFormat9('approved');
  const verified = parseFormat9Data(encode9(approved.manifest), approved.files);
  assert.throws(() => parseFormat9LocalReferenceData(encode9(approved.manifest), approved.files));
  const result = calculateAdministrativeDeadline(input(), verified);
  assert.equal(result.outcome, 'calculated'); assert.equal(result.calendarExportAllowed, true);
  assert.throws(() => parseFormat8LocalReferenceData(encode9(fixture.manifest), fixture.files));
  const down = buildSyntheticFormat9();
  down.manifest.$schema = down.manifest.$schema.replace('v9', 'v8'); down.manifest.formatVersion = '8.0.0';
  down.manifest.compatibility.minimumConsumerFormatVersion = '8.0.0';
  const d = down.manifest.artifacts.find((a: any) => a.role === 'administrativeProcedureCatalog');
  d.schemaId = d.schemaId.replace('-v2.schema', '.schema');
  changeSyntheticFormat9(down, AP23E3_ADMIN, c => {
    c.$schema = d.schemaId; c.formatVersion = '1.0.0'; c.contractDecision.id = 'DEC-2026-032';
  });
  assert.throws(() => parseFormat8LocalReferenceData(encode9(down.manifest), down.files));
});

for (const [name, edit] of [
  ['missing policy', (c: any) => c.qualificationPolicies.pop()],
  ['duplicate policy', (c: any) => c.qualificationPolicies.push(c.qualificationPolicies[0])],
  ['changed legacy revision', (c: any) => { c.paths[0].revision++; }],
  ['policy hash changed', (c: any) => { c.releaseBinding.pathEligibility[0].qualificationPolicySha256 = '0'.repeat(64); }],
  ['resealed new legacy bypass', (c: any) => {
    const p = c.qualificationPolicies.find((p: any) => p.mode === 'qualifiedDayProcedure');
    delete p.requirements; p.mode = 'legacyV1'; p.baseline = c.qualificationPolicies[0].baseline;
    c.releaseBinding.pathEligibility.find((e: any) => e.pathId === p.pathId).qualificationPolicySha256 = socialObjectSha256(p);
  }],
  ['resealed payment route', (c: any) => {
    const p = c.qualificationPolicies.find((p: any) => p.mode === 'qualifiedDayProcedure');
    p.requirements.action = 'proceduralSubmission'; p.requirements.decisionKind = 'notApplicable';
    c.releaseBinding.pathEligibility.find((e: any) => e.pathId === p.pathId).qualificationPolicySha256 = socialObjectSha256(p);
  }],
  ['resealed AR guard removed', (c: any) => {
    const p = c.paths.find((p: any) => p.pathId === 'ar-court-30'); p.endShiftGuard = 'none';
    const q = c.qualificationPolicies.find((q: any) => q.pathId === p.pathId), e = c.releaseBinding.pathEligibility.find((e: any) => e.pathId === p.pathId);
    q.pathSha256 = socialObjectSha256(p); e.pathSha256 = q.pathSha256; e.qualificationPolicySha256 = socialObjectSha256(q);
  }],
  ['wrong physical target hash', (c: any) => {
    const b = c.holidayBindings.find((b: any) => b.authoritySeatCanton === 'LU');
    b.physicalBaseline.references[0].sha256 = '0'.repeat(64);
    c.releaseBinding.pathEligibility.filter((e: any) => e.holidayBindingId === b.holidayBindingId).forEach((e: any) => e.holidayBindingSha256 = socialObjectSha256(b));
  }],
  ['wrong physical target release', (c: any) => {
    const b = c.holidayBindings[0]; b.physicalBaseline.releaseId = '2026-10-15-mvp-08-approved.1';
    c.releaseBinding.pathEligibility.filter((e: any) => e.holidayBindingId === b.holidayBindingId).forEach((e: any) => e.holidayBindingSha256 = socialObjectSha256(b));
  }],
  ['manufactured runtime authority', (c: any) => { c.runtimeActive = true; }]
] as const) test('AP23E3 strict reader rejects ' + name, () => {
  const changed = buildSyntheticFormat9();
  changeSyntheticFormat9(changed, AP23E3_ADMIN, edit);
  assert.throws(() => parseFormat9LocalReferenceData(encode9(changed.manifest), changed.files));
});

test('AP23E3 schema accepts exactly native v2 and candidate files carry no synthetic source approval', () => {
  assertAdministrativeProcedureCatalogV2(context.administrativeCatalog);
  const r = context.administrativeCatalog.releaseBinding;
  assert.equal(r.status, 'candidate'); assert.equal(r.releaseId, null); assert.equal(r.approval, null);
  assert.equal(r.sourceReviewRef, null); assert.equal(r.referenceSuiteRef, null);
  assert.equal(r.targetComponentRefs.length, 0);
});
