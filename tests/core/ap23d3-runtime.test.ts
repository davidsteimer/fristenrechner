// SPDX-License-Identifier: AGPL-3.0-only
// Approved-shaped documents below are synthetic tests, not release permissions.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createCalculatorRuntime, createFormat8CalculationData } from '../../src/core/calculatorRuntime';
import { calculateDeadline, calculateRuntimeDeadline } from '../../src/core/calculateDeadline';
import { calculateCalendarBoundDeadline } from '../../src/core/calculateCalendarBoundDeadline';
import { calculateAdministrativeDeadline } from '../../src/core/administrativeDeadline';
import { calculateSocialDeadline } from '../../src/core/socialDeadline';
import { calculateSpecialDeadline } from '../../src/core/calculateSpecialDeadline';
import { hasMatchingFormat8Runtime, isFormat8ReferenceData } from '../../src/core/format8Runtime';
import { ap23d3CandidateRuntime as c } from '../../src/release/ap23d3CandidateData';
import { ap23d2Files, ap23d2ManifestText } from '../../src/release/ap23d2CandidateData';
import { mvp07CalculationData, mvp07Runtime } from '../../src/release/mvp07ReleaseData';
import { buildSyntheticFormat8, encodeSyntheticFormat8, syntheticSha256 } from './ap23d1Fixtures';
import type { CalculationData, CalculationInput } from '../../src/core/types';
import type { SocialDeadlineInput } from '../../src/core/socialTypes';
import type { AdministrativeDeadlineInput } from '../../src/core/administrativeDeadline';

const approved = buildSyntheticFormat8('approved');
const a = createFormat8CalculationData(encodeSyntheticFormat8(approved.manifest), approved.files);
const input = (profile = 'stpo', inputDate = '2026-09-16', deadlineDays = 10): CalculationInput => ({
  profileId: profile, inputDate, inputDateSemantics: 'legallyRelevantDeliveryOrEventDate', deadlineDays,
  calendarId: 'be-public-holidays', holidayAnchorCandidates: ['BE'], confirmations: profile === 'vrpg-be' ? { specialLawChecked: true } : {},
  selectors: profile === 'zpo' ? { procedureVariant: 'summary' }
    : ['bgg', 'vwvg'].includes(profile) ? { subjectMatter: 'interimMeasures' }
      : profile === 'vrpg-be' ? { specialLawStatus: 'noKnownOverride' } : {}
});
const context = (profile = 'stpo', canton = 'BE') => ({
  role: profile === 'zpo' ? 'court' as const : 'partyWithoutRepresentative' as const, canton,
  areaFacts: canton === 'AI' ? { 'AI-RTG-INNER-ADDITIONAL': false }
    : canton === 'NE' ? { 'NE-LANDERON-ADDITIONAL': false } : {}
});
const calculate = (runtime = c, value = input(), place = context()) =>
  calculateCalendarBoundDeadline(value, place, runtime.data, runtime.calendarRuntime);

test('AP23D3 shared runtime retains real Format8 and same candidate identity for all components', () => {
  assert.equal(c.data.formatVersion, '8.0.0');
  assert.equal(c.data.format7Runtime, undefined);
  assert.equal(c.data.releaseId, c.administrativeContext.manifest.releaseId);
  assert.equal(c.calendarRuntime.releaseId, c.data.releaseId);
  assert.equal(c.data.profiles.size, 5);
  assert.equal(c.data.calendars.size, 32);
  assert.equal(c.administrativeContext.administrativeCatalog.paths.length, 12);
  assert.equal(isFormat8ReferenceData(c.data), true);
  assert.equal(hasMatchingFormat8Runtime(c.data, c.calendarRuntime, c.administrativeContext), true);
  assert.equal(hasMatchingFormat8Runtime(c.data, a.calendarRuntime, c.administrativeContext), false);
  assert.equal(hasMatchingFormat8Runtime(c.data, c.calendarRuntime, a.administrativeContext), false);
  assert.equal(Object.isFrozen(c.data), true);
  assert.equal(typeof (c.data.profiles as any).set, 'undefined');
  assert.equal(typeof (c.data.calendarRuleSets as any).set, 'undefined');
  assert.throws(() => (c.data as any).formatVersion = '7.0.0');
});

test('AP23D3 all104 federal bindings calculate in actual Format8 with unchanged legal results', () => {
  for (const canton of 'ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' ')) {
    for (const profile of ['stpo', 'zpo', 'bgg', 'vwvg']) {
      const value = input(profile), place = context(profile, canton);
      const result = calculate(c, value, place);
      const old = calculateCalendarBoundDeadline(value, place, mvp07CalculationData, mvp07Runtime.calendarRuntime);
      assert.equal(result.outcome, 'calculated', `${profile}/${canton}: ${result.blockReasonKeys}`);
      assert.equal(old.outcome, 'calculated');
      if (result.outcome !== 'calculated' || old.outcome !== 'calculated') continue;
      assert.equal(result.finalEnd, old.finalEnd);
      assert.equal(result.calendarExportAllowed, false);
      assert.equal(result.referenceOnly, true);
      assert.equal(calculate(a, value, place).calendarExportAllowed, true);
      assert.ok(result.trace.flatMap(step => step.calendarEvidence ?? []).every(item => item.releaseId === c.data.releaseId));
    }
  }
});

test('AP23D3 historical calculateDeadline API still rejects every Format8 profile, new API requires qualification', () => {
  for (const profile of ['stpo', 'zpo', 'bgg', 'vwvg', 'vrpg-be']) {
    assert.deepEqual(calculateDeadline(input(profile), c.data).blockReasonKeys, ['administrativeProcedure.qualifiedContextRequired']);
  }
  for (const profile of ['stpo', 'zpo', 'bgg', 'vwvg']) assert.equal(calculateRuntimeDeadline(input(profile), c.data).outcome, 'blocked');
  assert.equal(calculateRuntimeDeadline(input('vrpg-be'), c.data).outcome, 'calculated');
  assert.equal(calculateRuntimeDeadline({ ...input('vrpg-be'), calendarId: c.calendarRuntime.calendars.find(x => x.jurisdiction.code === 'TI')!.calendarId }, c.data).outcome, 'blocked');
  assert.deepEqual(calculateRuntimeDeadline(input('vrpg-be'), mvp07CalculationData), calculateDeadline(input('vrpg-be'), mvp07CalculationData));
});

test('AP23D3 copied, serialized and mixed runtime objects cannot calculate', () => {
  const copies = [{ ...c.data }, Object.create(c.data), new Proxy(c.data, {})] as CalculationData[];
  for (const copy of copies) {
    assert.equal(calculateRuntimeDeadline(input('vrpg-be'), copy).outcome, 'blocked');
    assert.equal(calculateCalendarBoundDeadline(input(), context(), copy, c.calendarRuntime).outcome, 'blocked');
    assert.equal(hasMatchingFormat8Runtime(copy, c.calendarRuntime, c.administrativeContext), false);
  }
  assert.equal(calculateCalendarBoundDeadline(input(), context(), c.data, { ...c.calendarRuntime }).outcome, 'blocked');
  assert.equal(calculateCalendarBoundDeadline(input(), context(), c.data, a.calendarRuntime).outcome, 'blocked');
});

test('AP23D3 January uncertainty and explicit region qualification remain fail-closed', () => {
  const january = calculate(c, input('stpo', '2029-01-01', 1), context('stpo', 'SG'));
  assert.equal(january.outcome, 'blocked');
  assert.equal(january.januaryComparison?.outcome, 'different');
  assert.equal(january.calendarExportAllowed, false);
  for (const canton of ['AI', 'NE']) assert.equal(calculate(c, input(), { ...context('stpo', canton), areaFacts: {} }).outcome, 'blocked');
});

function socialInput(data: CalculationData, bindingId: string, date = '2026-09-16'): SocialDeadlineInput {
  const catalog = data.socialProcedureCatalogs!.get('ch-social-procedures')!;
  const binding = catalog.cantonalBindings.find(b => b.bindingId === bindingId)!;
  const rule = catalog.federalRules.find(r => r.ruleId === binding.ruleId)!, route = binding.contextRoutes[0]!;
  const selectors = new Set([...rule.normBindings, ...binding.normBindings].map(n => n.temporalSelector));
  return { ruleId: rule.ruleId, bindingId, contextRouteId: route.contextRouteId, procedureContextCanton: 'BE',
    caseFacts: Object.fromEntries(route.requiredFacts.map(f => [f.factKey, f.allowedValues[0]])), qualificationBasis: 'confirmed-case-facts',
    matter: rule.matter, triggerKind: rule.triggerKind, notificationChannel: rule.notificationChannels[0]!, notificationConfirmed: true, legalTriggerDate: date,
    ...(selectors.has('jurisdictionReferenceDate') ? { jurisdictionReferenceDate: date } : {}),
    ...(selectors.has('procedureStartDate') ? { procedureStartDate: date } : {}),
    holidayResolution: { status: 'resolved', calendarBindingId: 'be-party', anchors: [{ role: 'party', canton: 'BE', spatialScopeId: 'BE' }] },
    ...(rule.calculation.durationInputId ? { days: 10 } : {}) };
}
test('AP23D3 all50 Bern social bindings use same Format8 release, preserve results and coverage', () => {
  assert.equal(new Set(c.administrativeContext.socialCatalog.cantonalBindings.map(binding => binding.ruleId)).size, 44);
  for (const binding of c.administrativeContext.socialCatalog.cantonalBindings) {
    const value = socialInput(c.data, binding.bindingId);
    for (const runtime of [c, a]) {
      const result = calculateSocialDeadline(value, runtime.data);
      assert.equal(result.outcome, 'calculated', `${binding.bindingId}: ${result.blockReasonKeys}`);
      assert.equal(result.finalDeadline?.date, calculateSocialDeadline(value, mvp07CalculationData).finalDeadline?.date);
      assert.equal(result.socialEvidence?.releaseId, runtime.data.releaseId);
      assert.equal(calculateSocialDeadline({ ...value, procedureContextCanton: 'ZH' }, runtime.data).outcome, 'blocked');
      assert.equal(calculateSocialDeadline(socialInput(runtime.data, binding.bindingId, '2028-01-02'), runtime.data).outcome, 'blocked');
      assert.equal(calculateSocialDeadline(value, { ...runtime.data }).outcome, 'blocked');
    }
  }
});

function administrativeInput(pathId: string, date: string): AdministrativeDeadlineInput {
  const path = c.administrativeContext.administrativeCatalog.paths.find(value => value.pathId === pathId)!;
  return {
    selection: { kind: 'cantonalAdministrative', lawId: path.lawId, pathId, revision: path.revision, stage: path.stages[0]! },
    authoritySeat: { canton: path.lawId === 'lpamm-ti' ? 'TI' : 'GR', level: 'cantonal', qualification: 'competentAuthorityForCurrentAction' },
    inputDate: date, ...(path.duration.kind === 'authorityOrderedDays' ? { deadlineDays: 10 } : {}),
    qualification: { delivery: 'qualifiedActualDelivery', generalRoute: 'qualified', specialLaw: 'excluded', explicitHolidayException: 'none', fixedEndDate: false, deviatingStart: false, evidenceAdvance: false }, urgency: 'none'
  };
}
test('AP23D3 common runtime keeps TI-O2 blocked and administrative scope/date limits distinct from federal coverage', () => {
  for (const runtime of [c, a]) {
    const ti = calculateAdministrativeDeadline(administrativeInput('ti-80-30', '2027-02-17'), runtime.administrativeContext);
    assert.equal(ti.outcome, 'blocked');
    if (ti.outcome !== 'blocked') continue;
    assert.ok(ti.blockReasonKeys.includes('endShiftIntoSuspensionUnresolved'));
    assert.equal('finalEnd' in ti, false);
    assert.equal(ti.calendarExportAllowed, false);
    const beyond = calculateAdministrativeDeadline(administrativeInput('gr-52-30', '2027-12-20'), runtime.administrativeContext);
    assert.equal(beyond.outcome, 'blocked');
    assert.equal(beyond.calendarExportAllowed, false);
    const unresolved = calculateAdministrativeDeadline({ ...administrativeInput('ti-80-30', '2026-10-02'),
      qualification: { ...administrativeInput('ti-80-30', '2026-10-02').qualification, specialLaw: 'unknown' } }, runtime.administrativeContext);
    assert.equal(unresolved.outcome, 'blocked');
  }
});
test('AP23D3 GR administration, ordinary court and explicit urgency retain distinct summer arithmetic', () => {
  const court = administrativeInput('gr-court-ordered', '2027-07-20');
  const ordinary = calculateAdministrativeDeadline(court, c.administrativeContext);
  const urgent = calculateAdministrativeDeadline({ ...court, urgency: 'explicitJudicialUrgencyOrder' }, c.administrativeContext);
  const administration = calculateAdministrativeDeadline(administrativeInput('gr-admin-ordered', '2027-07-20'), c.administrativeContext);
  assert.equal(ordinary.outcome, 'calculated'); assert.equal(urgent.outcome, 'calculated'); assert.equal(administration.outcome, 'calculated');
  if (ordinary.outcome !== 'calculated' || urgent.outcome !== 'calculated' || administration.outcome !== 'calculated') return;
  assert.equal(ordinary.finalEnd, '2027-08-25'); assert.equal(urgent.finalEnd, '2027-07-30'); assert.equal(administration.finalEnd, '2027-07-30');
  assert.equal(ordinary.provenance.urgencyApplied, false); assert.equal(urgent.provenance.urgencyApplied, true);
  assert.ok([ordinary, urgent, administration].every(result => !result.calendarExportAllowed && result.referenceOnly));
});

test('AP23D3 retained VRPG special path uses issued Format8 without generic ATSG bypass', () => {
  const regime = c.data.specialRegimeCatalogs.get('vrpg-be-special-regimes-rest')!.regimes.find(r => r.regimeId === 'vrpg-be-general')!;
  const value = { profileId: 'vrpg-be', regimeId: regime.regimeId, ruleId: 'VRPGBE-SPEC-REL-GENERAL-001',
    dateValues: { eventDate: '2026-09-04' }, localTimeValues: {}, integerValues: { deadlineDays: 10 },
    calendarProfileId: regime.calendarProfileId!, suspensionProfileId: regime.suspensionProfileId!, filingProfileId: regime.filingProfileId!, overrideConfirmations: [] };
  assert.equal(calculateSpecialDeadline(value, c.data).finalDeadline?.date, '2026-09-14');
  assert.equal(calculateSpecialDeadline(value, { ...c.data }).outcome, 'blocked');
  assert.deepEqual(calculateSpecialDeadline({ ...value, ruleId: 'ATSG-SPEC-REL-060' }, c.data).blockReasonKeys, ['socialResolverRequired']);
});

test('AP23D3 twelve administrative paths share the same bytes and never fabricate legacy profile IDs', () => {
  for (const path of c.administrativeContext.administrativeCatalog.paths) for (const stage of path.stages) {
    const value: AdministrativeDeadlineInput = {
      selection: { kind: 'cantonalAdministrative', lawId: path.lawId, pathId: path.pathId, revision: path.revision, stage },
      authoritySeat: { canton: path.lawId === 'lpamm-ti' ? 'TI' : 'GR', level: 'cantonal', qualification: 'competentAuthorityForCurrentAction' },
      inputDate: '2026-10-02', ...(path.duration.kind === 'authorityOrderedDays' ? { deadlineDays: 10 } : {}),
      qualification: { delivery: 'qualifiedActualDelivery', generalRoute: 'qualified', specialLaw: 'excluded', explicitHolidayException: 'none', fixedEndDate: false, deviatingStart: false, evidenceAdvance: false }, urgency: 'none'
    };
    const result = calculateAdministrativeDeadline(value, c.administrativeContext);
    assert.equal(result.outcome, 'calculated', `${path.pathId}/${stage}: ${JSON.stringify(result)}`);
    if (result.outcome !== 'calculated') continue;
    assert.equal(result.provenance.releaseId, c.data.releaseId);
    assert.equal('profileId' in result.provenance, false);
    assert.equal(result.calendarExportAllowed, false);
  }
});

test('AP23D3 factory preserves candidate/approved separation and rejects forged raw bytes', () => {
  assert.throws(() => createFormat8CalculationData(ap23d2ManifestText, ap23d2Files));
  assert.throws(() => createFormat8CalculationData(encodeSyntheticFormat8(approved.manifest), approved.files, { mode: 'localReference' }));
  const wrong = new Map(ap23d2Files), path = wrong.keys().next().value!;
  wrong.set(path, wrong.get(path)! + ' ');
  assert.throws(() => createFormat8CalculationData(ap23d2ManifestText, wrong, { mode: 'localReference' }));
});

test('AP23D3 host transport revalidates bytes and all inventories, never cached parsed objects', () => {
  const manifestBytes = Buffer.from(encodeSyntheticFormat8(approved.manifest));
  const release = { releaseId: approved.manifest.releaseId, formatVersion: '8.0.0',
    coverageFrom: approved.manifest.coverage.from, coverageTo: null,
    profileIds: approved.manifest.profileIds, calendarIds: approved.manifest.calendarIds,
    specialRegimeCatalogIds: approved.manifest.specialRegimeCatalogIds, holidayCatalogIds: approved.manifest.holidayCatalogIds,
    socialProcedureCatalogIds: approved.manifest.socialProcedureCatalogIds,
    administrativeProcedureCatalogIds: approved.manifest.administrativeProcedureCatalogIds,
    manifestBytes, manifestSha256: syntheticSha256(manifestBytes.toString()),
    artifacts: approved.manifest.artifacts.map((descriptor: any) => ({ descriptor, bytes: Buffer.from(approved.files.get(descriptor.path)!), parsed: { ignored: true } })) };
  const runtime = createCalculatorRuntime(release);
  assert.equal(runtime.data.formatVersion, '8.0.0');
  assert.equal(hasMatchingFormat8Runtime(runtime.data, runtime.calendarRuntime, runtime.administrativeContext), true);
  for (const patch of [{ manifestSha256: '0'.repeat(64) }, { administrativeProcedureCatalogIds: [] }, { calendarIds: [] }, { releaseId: 'wrong' }, { formatVersion: '7.0.0' }]) {
    assert.throws(() => createCalculatorRuntime({ ...release, ...patch }));
  }
  const artifacts = [...release.artifacts]; artifacts[0] = { ...artifacts[0], bytes: Buffer.from('{}') };
  assert.throws(() => createCalculatorRuntime({ ...release, artifacts }));
});
