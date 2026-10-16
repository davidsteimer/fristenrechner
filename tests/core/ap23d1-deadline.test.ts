// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic approvals are confined to this in-memory test transport.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateAdministrativeDeadline } from '../../src/core/administrativeDeadline';
import type { AdministrativeDeadlineInput, AdministrativeDeadlineResult } from '../../src/core/administrativeDeadline';
import { parseFormat8LocalReferenceData } from '../../src/core/releaseFormat8';
import { socialObjectSha256 } from '../../src/core/socialCatalog';
import { buildSyntheticFormat8, changeSyntheticFormat8, createSyntheticFormat8Context, encodeSyntheticFormat8, SYNTHETIC_ADMIN_PATH } from './ap23d1Fixtures';

const reference = createSyntheticFormat8Context('localReference');
const research = JSON.parse(readFileSync('tests/golden/candidates/ap23b-administrative.json', 'utf8'));
function input(pathId = 'ti-80-30', date = '2026-10-02', days?: number, stage?: string): AdministrativeDeadlineInput {
  const gr = pathId.startsWith('gr-');
  const selectedStage = stage ?? (pathId === 'gr-admin-ordered' ? 'administration'
    : ['ti-80-30', 'gr-32-30', 'gr-32-10'].includes(pathId) ? 'administrativeAppeal' : 'court');
  return {selection: {kind: 'cantonalAdministrative', lawId: gr ? 'vrg-gr' : 'lpamm-ti', pathId, revision: 1, stage: selectedStage},
    authoritySeat: {canton: gr ? 'GR' : 'TI', level: 'cantonal', qualification: 'competentAuthorityForCurrentAction'},
    inputDate: date, ...(days === undefined ? {} : {deadlineDays: days}),
    qualification: {delivery: 'qualifiedActualDelivery', generalRoute: 'qualified', specialLaw: 'excluded',
      explicitHolidayException: 'none', fixedEndDate: false, deviatingStart: false, evidenceAdvance: false}, urgency: 'none'};
}
function calculated(result: AdministrativeDeadlineResult): Extract<AdministrativeDeadlineResult, {outcome: 'calculated'}> {
  assert.equal(result.outcome, 'calculated', JSON.stringify(result));
  if (result.outcome !== 'calculated') throw new Error('Expected calculation');
  return result;
}
function blocked(result: AdministrativeDeadlineResult, reason: string): void {
  assert.equal(result.outcome, 'blocked', JSON.stringify(result));
  if (result.outcome !== 'blocked') throw new Error('Expected block');
  assert.ok(result.blockReasonKeys.includes(reason), JSON.stringify(result));
  assert.equal(result.calendarExportAllowed, false);
  assert.equal('finalEnd' in result, false);
}

for (const referenceCase of research.cases.filter((item: any) => /^(TI|GR)/.test(item.id) && item.input.trigger >= '2026-08-29')) {
  test(`AP23D1 ${referenceCase.id} runs the AP23B reference through the qualified shared product counter`, () => {
    const value = input(referenceCase.input.path.toLowerCase(), referenceCase.input.trigger, referenceCase.input.days, referenceCase.input.stage);
    const result = calculateAdministrativeDeadline(value, reference);
    if (referenceCase.expected.outcome === 'blocked') {
      blocked(result, referenceCase.expected.reason);
      assert.ok('provisionalEnd' in result);
      assert.ok('periodIds' in result && result.periodIds?.some(id => id.startsWith('ti-easter')));
    } else {
      const actual = calculated(result);
      assert.equal(actual.finalEnd, referenceCase.expected.end);
      if (referenceCase.expected.nominalEnd) assert.equal(actual.provisionalEnd, referenceCase.expected.nominalEnd);
      if (referenceCase.expected.firstCountedDay) assert.equal(actual.deadlineStart, referenceCase.expected.firstCountedDay);
      if (referenceCase.expected.skippedDays !== undefined) assert.equal(actual.skippedCalendarDays, referenceCase.expected.skippedDays);
      assert.equal(actual.calendarExportAllowed, false);
      assert.equal(actual.referenceOnly, true);
      assert.equal(actual.provenance.pathId, referenceCase.input.path.toLowerCase());
    }
  });
}

test('AP23D1 all twelve TI/GR groups retain distinct path, revision and stage identities', () => {
  for (const path of research.paths.filter((path: any) => path.purpose === 'pilot')) {
    for (const stage of path.stages) {
      const actual = calculated(calculateAdministrativeDeadline(input(path.id.toLowerCase(), '2026-10-02', path.days ?? 10, stage), reference));
      assert.equal(actual.provenance.kind, 'cantonalAdministrative');
      assert.equal(actual.provenance.pathId, path.id.toLowerCase());
      assert.equal(actual.provenance.revision, 1);
      assert.equal(actual.provenance.stage, stage);
      assert.equal('profileId' in actual.provenance, false);
      assert.equal(actual.provenance.holidayRole, 'authoritySeat');
      assert.equal(actual.provenance.authoritySeatCanton, path.canton);
    }
  }
});

test('AP23D1 historical pre-window GR references remain blocked, not silently promoted to product coverage', () => {
  for (const referenceCase of research.cases.filter((item: any) => /^GR/.test(item.id) && item.input.trigger < '2026-08-29')) {
    blocked(calculateAdministrativeDeadline(input(referenceCase.input.path.toLowerCase(), referenceCase.input.trigger,
      referenceCase.input.days, referenceCase.input.stage), reference), 'administrative.outsideCaseCoverage');
  }
});

test('AP23D1 GR court and administration retain distinct 2027 summer rules', () => {
  assert.equal(calculated(calculateAdministrativeDeadline(input('gr-52-30', '2027-07-10'), reference)).finalEnd, '2027-09-10');
  assert.equal(calculated(calculateAdministrativeDeadline(input('gr-32-30', '2027-07-10'), reference)).finalEnd, '2027-08-09');
  for (const path of ['gr-52-10', 'gr-42-10']) {
    const result = calculated(calculateAdministrativeDeadline(input(path, '2027-07-20'), reference));
    assert.equal(result.deadlineStart, '2027-08-16');
    assert.equal(result.finalEnd, '2027-08-25');
  }
  assert.equal(calculated(calculateAdministrativeDeadline(input('gr-32-10', '2027-07-20'), reference)).finalEnd, '2027-07-30');
});

test('AP23D1 only an explicit GR judicial urgency order disables court suspensions', () => {
  const value = input('gr-court-ordered', '2027-07-20', 10);
  const ordinary = calculated(calculateAdministrativeDeadline(value, reference));
  const urgent = calculated(calculateAdministrativeDeadline({...value, urgency: 'explicitJudicialUrgencyOrder'}, reference));
  assert.equal(ordinary.finalEnd, '2027-08-25');
  assert.equal(urgent.finalEnd, '2027-07-30');
  assert.equal(urgent.skippedCalendarDays, 0);
  assert.equal(urgent.provenance.urgencyApplied, true);
  blocked(calculateAdministrativeDeadline({...value, urgency: 'unknown'}, reference), 'administrative.urgencyUnresolved');
  for (const path of ['ti-84-30', 'ti-provisional-15', 'gr-32-30', 'gr-admin-ordered']) {
    blocked(calculateAdministrativeDeadline({...input(path, '2027-07-20', path === 'gr-admin-ordered' ? 10 : undefined),
      urgency: 'explicitJudicialUrgencyOrder'}, reference), 'administrative.unsupportedUrgency');
  }
});

test('AP23D1 own GR binding does not import federal GR-BASE-ONLY limitations or unrelated TI holidays', () => {
  const gr = calculated(calculateAdministrativeDeadline(input('gr-admin-ordered', '2027-03-18', 1), reference));
  const ti = calculated(calculateAdministrativeDeadline(input('ti-advance', '2027-03-18', 1), reference));
  assert.equal(gr.finalEnd, '2027-03-19');
  assert.equal(ti.finalEnd, '2027-03-22');
  assert.equal(JSON.stringify(gr).includes('GR-BASE-ONLY'), false);
  assert.equal(gr.provenance.holidayBindingId, 'gr-authority-seat');
});

test('AP23D1 TI authority seat alone binds holidays, no party/representative TI confirmation is required', () => {
  // The caller can be outside TI. Such an irrelevant place is not an input fact
  // in this general-law branch and cannot select an additional holiday calendar.
  const result = calculated(calculateAdministrativeDeadline(input('ti-reply', '2026-11-23', 15), reference));
  assert.equal(result.finalEnd, '2026-12-09');
  assert.equal(result.provenance.authoritySeatCanton, 'TI');
  assert.ok(result.shiftedHolidayIds.length > 0);
  assert.equal(JSON.stringify(result).includes('allRelevantLocationsTI'), false);
});

test('AP23D1 statutory duration cannot be overridden and authority-ordered duration is required', () => {
  assert.equal(calculated(calculateAdministrativeDeadline(input(), reference)).deadlineDays, 30);
  blocked(calculateAdministrativeDeadline(input('ti-80-30', '2026-10-02', 20), reference), 'administrative.durationMismatch');
  blocked(calculateAdministrativeDeadline(input('gr-court-ordered'), reference), 'administrative.durationMismatch');
  for (const value of [0, 366, 1.5, NaN, Infinity, '30']) {
    blocked(calculateAdministrativeDeadline({...input('gr-admin-ordered'), deadlineDays: value} as AdministrativeDeadlineInput, reference), 'administrative.inputContractInvalid');
  }
  assert.equal(calculated(calculateAdministrativeDeadline(input('gr-admin-ordered', '2026-09-01', 365), reference)).finalEnd, '2027-09-01');
});

test('AP23D1 federal specials and explicit cantonal holiday exceptions never fall back to the seat rule', () => {
  const value = input();
  blocked(calculateAdministrativeDeadline({...value, qualification: {...value.qualification, specialLaw: 'applicableFederalSpecialLaw'}}, reference), 'administrative.separatelyQualifiedFederalPathRequired');
  blocked(calculateAdministrativeDeadline({...value, qualification: {...value.qualification, specialLaw: 'unknown'}}, reference), 'administrative.specialLawUnresolved');
  for (const explicitHolidayException of ['present', 'unknown'] as const) {
    blocked(calculateAdministrativeDeadline({...value, qualification: {...value.qualification, explicitHolidayException}}, reference), 'administrative.explicitHolidayExceptionUnresolved');
  }
});

test('AP23D1 fixed dates, evidence advances and deviating starts cannot masquerade as general day deadlines', () => {
  const value = input();
  for (const key of ['fixedEndDate', 'evidenceAdvance', 'deviatingStart'] as const) {
    blocked(calculateAdministrativeDeadline({...value, qualification: {...value.qualification, [key]: true}}, reference), 'administrative.unsupportedProcedure');
  }
});

test('AP23D1 date and new-path coverage is checked during delivery, counting, suspensions and final shifts', () => {
  blocked(calculateAdministrativeDeadline(input('gr-admin-ordered', '2026-08-28', 1), reference), 'administrative.outsideCaseCoverage');
  assert.equal(calculated(calculateAdministrativeDeadline(input('gr-admin-ordered', '2026-08-29', 1), reference)).finalEnd, '2026-08-31');
  assert.equal(calculated(calculateAdministrativeDeadline(input('gr-admin-ordered', '2027-12-30', 1), reference)).finalEnd, '2027-12-31');
  blocked(calculateAdministrativeDeadline(input('gr-admin-ordered', '2027-12-31', 1), reference), 'dataCoverageExceeded');
  blocked(calculateAdministrativeDeadline(input('ti-80-30', '2027-12-17'), reference), 'dataCoverageExceeded');
  blocked(calculateAdministrativeDeadline(input('gr-admin-ordered', '2028-01-01', 1), reference), 'administrative.outsideCaseCoverage');
  for (const date of ['2027-02-29', '14.10.2026', '', '2026-10-02T00:00:00Z']) {
    blocked(calculateAdministrativeDeadline(input('gr-admin-ordered', date, 1), reference), 'administrative.inputContractInvalid');
  }
});

test('AP23D1 final holiday/weekend shifting cannot escape a narrower bound path window', () => {
  const fixture = buildSyntheticFormat8();
  changeSyntheticFormat8(fixture, SYNTHETIC_ADMIN_PATH, catalog => {
    const path = catalog.paths.find((entry: any) => entry.pathId === 'ti-80-30');
    const eligibility = catalog.releaseBinding.pathEligibility.find((entry: any) => entry.pathId === path.pathId);
    path.temporalBinding.caseCoverage.to = '2026-11-01';
    path.temporalBinding.calculationCoverage.to = '2026-11-01';
    eligibility.caseCoverage = {...path.temporalBinding.caseCoverage};
    eligibility.calculationCoverage = {...path.temporalBinding.calculationCoverage};
    eligibility.pathSha256 = socialObjectSha256(path);
  });
  const context = parseFormat8LocalReferenceData(encodeSyntheticFormat8(fixture.manifest), fixture.files, fixture.legacyCalendars);
  const result = calculateAdministrativeDeadline(input(), context);
  blocked(result, 'dataCoverageExceeded');
  if (result.outcome === 'blocked') {
    assert.equal(result.provisionalEnd, '2026-11-01');
    assert.equal(result.blockedDate, '2026-11-02');
  }
});

test('AP23D1 law, revision, stage and competent seat are exact, NW is not activated', () => {
  const value = input();
  for (const patch of [{lawId: 'vrpg-be'}, {pathId: 'nw-appeal-20'}, {revision: 2}]) {
    blocked(calculateAdministrativeDeadline({...value, selection: {...value.selection, ...patch}}, reference), 'administrative.unknownPath');
  }
  blocked(calculateAdministrativeDeadline({...value, selection: {...value.selection, stage: 'court'}}, reference), 'administrative.stageMismatch');
  blocked(calculateAdministrativeDeadline({...value, authoritySeat: {...value.authoritySeat, canton: 'BE'}}, reference), 'administrative.authoritySeatMismatch');
  blocked(calculateAdministrativeDeadline({...value, authoritySeat: {...value.authoritySeat, level: 'municipal'}} as unknown as AdministrativeDeadlineInput, reference), 'administrative.inputContractInvalid');
});

test('AP23D1 raw catalogues, maps, copied or serialized reader contexts cannot grant calculation permission', () => {
  for (const context of [undefined, null, {}, {runtimeActive: true}, {...reference}, JSON.parse(JSON.stringify(reference)), new Map()]) {
    blocked(calculateAdministrativeDeadline(input(), context), 'administrative.untrustedRelease');
  }
  assert.equal(Object.isFrozen(reference), true);
  const value = {...input(), calendarId: 'be-public-holidays'};
  blocked(calculateAdministrativeDeadline(value, reference), 'administrative.inputContractInvalid');
});

test('AP23D1 results are immutable and approved-versus-reference export eligibility is preserved', () => {
  const approved = createSyntheticFormat8Context('approved');
  const local = calculated(calculateAdministrativeDeadline(input(), reference));
  const result = calculated(calculateAdministrativeDeadline(input(), approved));
  assert.equal(local.referenceOnly, true);
  assert.equal(local.calendarExportAllowed, false);
  assert.equal(result.referenceOnly, false);
  assert.equal(result.calendarExportAllowed, true);
  assert.ok(Object.isFrozen(result));
  assert.ok(Object.isFrozen(result.provenance));
  assert.ok(Object.isFrozen(result.countedDates));
  assert.throws(() => { (result.provenance as any).pathId = 'vrpg-be'; }, TypeError);
  assert.equal('profileId' in result, false);
});
