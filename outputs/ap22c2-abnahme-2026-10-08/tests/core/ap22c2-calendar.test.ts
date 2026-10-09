// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { projectActivatedCalendars } from '../../src/core/holidayActivation';
import { resolveBoundCalendar } from '../../src/core/calendarResolution';
import { calculateCalendarBoundDeadline } from '../../src/core/calculateCalendarBoundDeadline';
import { calculateDeadline } from '../../src/core/calculateDeadline';
import { addCalendarDays } from '../../src/core/date';
import { mvp06CalculationData as data } from '../../src/release/mvp06ReleaseData';
import type { BoundCalendarRuntime, CalendarContext } from '../../src/core/calendarResolution';
import type { CalculationData, CalculationInput } from '../../src/core/types';
import type { HolidayCatalogV2 } from '../../src/core/holidayActivationTypes';

const original = JSON.parse(readFileSync('tests/golden/candidates/ap22b-holiday-contract.json', 'utf8')) as HolidayCatalogV2;
function buildRuntime(mutate?: (catalog: any) => void): BoundCalendarRuntime {
  const catalog: any = structuredClone(original);
  catalog.activation.contractDecision = { id: 'DEC-2026-030', status: 'approved', on: '2026-10-08' };
  mutate?.(catalog);
  const catalogSha256 = createHash('sha256').update(JSON.stringify(catalog)).digest('hex');
  return { catalog, catalogSha256, calendars: projectActivatedCalendars(catalog, catalogSha256, [...data.calendarRuleSets.values()]),
    releaseId: '2026-10-08-ap22c2-candidate.1', referenceOnly: true };
}
const runtime = buildRuntime();
const cantons = 'ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' ');
const profiles = ['stpo', 'zpo', 'bgg', 'vwvg'];
function context(profile = 'stpo', canton = 'BE', areaFacts: CalendarContext['areaFacts'] = {}): CalendarContext {
  return { role: profile === 'zpo' ? 'court' : 'partyWithoutRepresentative', canton, areaFacts };
}
function input(profile = 'stpo', inputDate = '2026-09-18', deadlineDays = 3): CalculationInput {
  return { profileId: profile, inputDate, inputDateSemantics: 'legallyRelevantDeliveryOrEventDate', deadlineDays,
    calendarId: 'be-public-holidays', holidayAnchorCandidates: ['BE'], confirmations: {},
    selectors: profile === 'zpo' ? { procedureVariant: 'summary' }
      : ['bgg', 'vwvg'].includes(profile) ? { subjectMatter: 'interimMeasures' } : {} };
}
const calculate = (value = input(), place = context(), set = runtime, source = data) => calculateCalendarBoundDeadline(value, place, source, set);

test('AP22C2 resolves all 104 bindings uniquely without inventing regional facts', () => {
  for (const canton of cantons) for (const profile of profiles) {
    const facts = canton === 'AI' ? { 'AI-RTG-INNER-ADDITIONAL': false }
      : canton === 'NE' ? { 'NE-LANDERON-ADDITIONAL': false } : {};
    const resolved = resolveBoundCalendar(profile, context(profile, canton, facts), runtime);
    assert.notEqual(resolved.status, 'clarificationRequired', `${profile}/${canton}: ${resolved.reasonKeys}`);
    assert.equal(resolved.binding?.id, `AP22-BIND-${canton}-${profile.toUpperCase()}`);
    assert.equal(resolved.projection?.jurisdiction, `CH-${canton}`);
  }
});

test('AP22C2 missing canton, Bund, role uncertainty and cross-profile roles never fall back', () => {
  for (const canton of ['', 'CH', 'XX', 'be']) assert.equal(resolveBoundCalendar('stpo', context('stpo', canton), runtime).status, 'clarificationRequired');
  for (const role of ['', 'court', 'missingParty', 'unqualifiedRepresentation', 'nonProfessionalDifferentPlaces', 'mandateChange', 'personalActUnqualified', 'unresolvedMultiplePlaces'] as const) {
    assert.equal(resolveBoundCalendar('stpo', { ...context(), role }, runtime).status, 'clarificationRequired');
  }
  assert.equal(resolveBoundCalendar('zpo', context(), runtime).status, 'clarificationRequired');
  assert.equal(resolveBoundCalendar('bgg', { ...context('bgg', 'GE'), role: 'qualifiedServiceRepresentative' }, runtime).status, 'resolved');
  for (const profile of ['vrpg-be', 'vrp-sg', 'social', 'atsg']) assert.equal(resolveBoundCalendar(profile, context(), runtime).status, 'clarificationRequired');
});

test('AP22C2 AI/NE distinguish missing, explicit no and explicit yes', () => {
  for (const [canton, id] of [['AI', 'AI-RTG-INNER-ADDITIONAL'], ['NE', 'NE-LANDERON-ADDITIONAL']]) {
    assert.equal(resolveBoundCalendar('stpo', context('stpo', canton), runtime).status, 'clarificationRequired');
    assert.equal(resolveBoundCalendar('stpo', context('stpo', canton, { [id!]: undefined }), runtime).status, 'clarificationRequired');
    assert.equal(resolveBoundCalendar('stpo', context('stpo', canton, Object.create({ [id!]: false })), runtime).status, 'clarificationRequired');
    const yes = resolveBoundCalendar('stpo', context('stpo', canton, { [id!]: true }), runtime);
    const no = resolveBoundCalendar('stpo', context('stpo', canton, { [id!]: false }), runtime);
    assert.notEqual(yes.calendarId, no.calendarId);
    assert.equal(yes.projection?.scopeIds.includes(id!), true);
    assert.equal(no.projection?.scopeIds.includes(id!), false);
  }
});

test('AP22C2 candidate mode is explicit and never enables a calendar export', () => {
  const result = calculate();
  assert.equal(result.outcome, 'calculated');
  assert.equal(result.referenceOnly, true);
  assert.equal(result.calendarExportAllowed, false);
  const blocked = calculate(input(), context(), { ...runtime, referenceOnly: false });
  assert.equal(blocked.outcome, 'blocked');
  assert.ok(blocked.blockReasonKeys.includes('calendarBinding.releaseNotApproved'));
  const noDecision: any = structuredClone(runtime);
  noDecision.catalog.activation.contractDecision = { id: 'DEC-2026-030', status: 'proposed', on: null };
  assert.equal(calculate(input(), context(), noDecision).outcome, 'blocked');
});

test('AP22C2 terminal lists replace competing lists and keep GR/NE as calculable boundaries', () => {
  const ag = calculate(input('bgg', '2027-10-31', 1), context('bgg', 'AG'));
  assert.equal(ag.outcome === 'calculated' && ag.finalEnd, '2027-11-02');
  const fr = calculate(input('bgg', '2026-12-07', 1), context('bgg', 'FR'));
  assert.equal(fr.outcome === 'calculated' && fr.finalEnd, '2026-12-09');
  const gr = calculate(input(), context('stpo', 'GR'));
  assert.equal(gr.outcome, 'calculated'); assert.deepEqual(gr.calendarResolution.boundaryIds, ['GR-BASE-ONLY']);
  const be = calculate(); assert.deepEqual(be.calendarResolution.boundaryIds, []);
  const ne = calculate(input('bgg', '2026-12-07', 1), context('bgg', 'NE', { 'NE-LANDERON-ADDITIONAL': false }));
  assert.equal(ne.outcome === 'calculated' && ne.finalEnd, '2026-12-08');
  assert.deepEqual(ne.calendarResolution.boundaryIds, ['NE-YEAR-LOCAL-RESERVE']);
});

test('AP22C2 region facts affect the selected legal calendar, not merely its label', () => {
  for (const profile of profiles) {
    const day = input(profile, '2027-05-26', 1);
    const yes = calculate(day, context(profile, 'NE', { 'NE-LANDERON-ADDITIONAL': true }));
    const no = calculate(day, context(profile, 'NE', { 'NE-LANDERON-ADDITIONAL': false }));
    assert.equal(yes.outcome === 'calculated' && yes.finalEnd, '2027-05-28');
    assert.equal(no.outcome === 'calculated' && no.finalEnd, '2027-05-27');
  }
});

const januaryBindings = [['SH', 'stpo'], ['SG', 'stpo'], ['SG', 'bgg'], ['SG', 'vwvg']] as const;
for (const [canton, profile] of januaryBindings) {
  test(`AP22C2 ${canton}/${profile} compares both complete January paths, including an indirectly reached Jan 2`, () => {
    for (const nominal of ['2029-01-01', '2029-01-02']) {
      const result = calculate(input(profile, addCalendarDays(nominal, -1), 1), context(profile, canton));
      assert.equal(result.outcome, 'blocked');
      assert.equal(result.januaryComparison?.outcome, 'different');
      assert.equal(result.januaryComparison?.withoutJanuary2?.finalEnd, '2029-01-02');
      assert.equal(result.januaryComparison?.withJanuary2?.finalEnd, '2029-01-03');
      assert.equal(result.calendarExportAllowed, false);
      assert.equal('finalEnd' in result, false);
      assert.deepEqual(result.januaryComparison?.variedCatalogRuleIds, [`${canton}-ZPO-ADDITIONAL-DAY-BERCHTOLD`]);
    }
    const weekend = calculate(input(profile, '2027-01-01', 1), context(profile, canton));
    assert.equal(weekend.outcome === 'calculated' && weekend.finalEnd, '2027-01-04');
    assert.equal(weekend.januaryComparison?.outcome, 'same');
    const ordinary = calculate(input(profile, '2027-02-02', 1), context(profile, canton));
    assert.equal(ordinary.outcome === 'calculated' && ordinary.finalEnd, '2027-02-03');
    assert.equal(ordinary.januaryComparison?.outcome, 'same');
  });
}

test('AP22C2 ZPO January remains determined and existing recess exceptions are unchanged', () => {
  const zpo = calculate(input('zpo', '2029-01-01', 1), context('zpo', 'SG'));
  assert.equal(zpo.outcome === 'calculated' && zpo.finalEnd, '2029-01-03');
  assert.equal(zpo.januaryComparison, undefined);
  const winter = calculate({ ...input('bgg', '2028-12-31', 2), selectors: { subjectMatter: 'general' } }, context('bgg', 'SG'));
  assert.equal(winter.outcome, 'calculated');
  assert.equal(winter.januaryComparison?.outcome, 'same');
  assert.equal(winter.suspension.enabled, true);
  assert.equal(calculate(input(), context()).suspension.enabled, false);
});

test('AP22C2 ZPO ordinary-mail delivery uses the same selected calendar', () => {
  const ordinary = { ...input('zpo', '2026-09-21', 1), inputDateSemantics: 'observedOrdinaryMailDeliveryDate' as const,
    selectors: { procedureVariant: 'summary', deliveryMethod: 'ordinaryMailWeekendOrHoliday' },
    confirmations: { deliveryFictionApplicabilityConfirmed: true } };
  const result = calculate(ordinary, context('zpo', 'VD'));
  assert.equal(result.outcome === 'calculated' && result.legallyRelevantDate, '2026-09-22');
  assert.equal(result.outcome === 'calculated' && result.deadlineStart, '2026-09-23');
  assert.equal(result.outcome === 'calculated' && result.finalEnd, '2026-09-23');
});

test('AP22C2 old override fields cannot bypass role, region or January qualification', () => {
  const attempted = { ...input('stpo', '2029-01-01', 1), calendarId: 'ch-federal-calendar',
    holidayAnchorCandidates: ['CH', 'BE'], confirmations: { holidayAnchorConfirmed: true } };
  assert.equal(calculate(attempted, { ...context('stpo', 'SG'), role: '' }).outcome, 'blocked');
  assert.equal(calculate(attempted, context('stpo', 'NE')).outcome, 'blocked');
  assert.equal(calculate(attempted, context('stpo', 'SG')).januaryComparison?.outcome, 'different');
});

test('AP22C2 release, profile and used rule boundaries constrain the whole calculation path', () => {
  assert.equal(calculate(input('stpo', '2026-08-28', 1)).outcome, 'blocked');
  const closedRelease = { ...data, coverage: { from: '2026-08-29', to: '2026-09-20' } };
  assert.equal(calculate(input(), context(), runtime, closedRelease).outcome, 'blocked');
  const profile = data.profiles.get('stpo')!;
  const expiredProfile: CalculationData = { ...data, profiles: new Map(data.profiles).set('stpo', {
    ...profile, validity: { ...profile.validity, dataValidTo: '2026-09-20' }
  }) };
  assert.equal(calculate(input(), context(), runtime, expiredProfile).outcome, 'blocked');
  const expiredRule: CalculationData = { ...data, profiles: new Map(data.profiles).set('stpo', {
    ...profile, rules: profile.rules.map(rule => rule.effect.type === 'counting'
      ? { ...rule, validity: { ...rule.validity, dataValidTo: '2026-09-20' } } : rule)
  }) };
  const expired = calculate(input(), context(), runtime, expiredRule);
  assert.equal(expired.outcome, 'blocked');
  assert.ok(expired.blockReasonKeys.includes('calendarBinding.profileRuleOutsideCoverage'));
});

test('AP22C2 expiry in only the January alternative never promotes the surviving path', () => {
  const bounded = buildRuntime(catalog => {
    catalog.data.rules.find((rule: any) => rule.id === 'SG-ZPO-ADDITIONAL-DAY-BERCHTOLD').to = '2028-12-31';
  });
  const result = calculate(input('stpo', '2028-12-31', 2), context('stpo', 'SG'), bounded);
  assert.equal(result.outcome, 'blocked'); assert.equal(result.januaryComparison?.outcome, 'blocked');
  assert.ok(result.januaryComparison?.withoutJanuary2);
  assert.equal(result.januaryComparison?.withJanuary2, undefined);
  assert.equal(result.calendarExportAllowed, false);
});

test('AP22C2 expired regional definition invalidates both positive and negative membership', () => {
  const bounded = buildRuntime(catalog => {
    catalog.data.assignments.find((row: any) => row.scopeId === 'NE-LANDERON-ADDITIONAL').to = '2026-09-20';
  });
  for (const member of [true, false]) {
    assert.equal(calculate(input(), context('stpo', 'NE', { 'NE-LANDERON-ADDITIONAL': member }), bounded).outcome, 'blocked');
  }
});

test('AP22C2 historical reference cases never extend the new product window', () => {
  const refs = JSON.parse(readFileSync('tests/golden/candidates/ap22b-calendar-references.json', 'utf8'));
  assert.equal(refs.referenceGroups.length, 25); assert.equal(refs.januaryCounterfactuals.length, 4);
  for (const group of refs.referenceGroups.filter((row: any) => row.kind === 'historicalFullCase')) {
    const scenario = group.scenarios.find((row: any) => row.input.serviceDate);
    const profile = scenario.input.profile.toLowerCase();
    const result = calculate(input(profile, scenario.input.serviceDate, scenario.input.days), context(profile, 'BE'));
    assert.equal(result.outcome, 'blocked', group.id);
    assert.equal(result.calendarExportAllowed, false);
  }
  for (const probe of refs.januaryCounterfactuals) for (const scenario of probe.scenarios) {
    if (scenario.input.nominalDate < '2026-08-29') {
      assert.equal(calculate(input('stpo', addCalendarDays(scenario.input.nominalDate, -1), 1), context('stpo', 'SG')).outcome, 'blocked');
    }
  }
});

test('AP22C2 all 25 reference groups stay classified as current cases or explicitly blocked historical scope', () => {
  const refs = JSON.parse(readFileSync('tests/golden/candidates/ap22b-calendar-references.json', 'utf8'));
  const visited = new Set<string>();
  for (const group of refs.referenceGroups) {
    visited.add(group.id);
    if (group.kind === 'historicalFullCase') continue; // Covered separately above.
    for (const scenario of group.scenarios) {
      const nominal = scenario.input.nominalDate;
      const canton = /(?:^|\s)([A-Z]{2})$/.exec(scenario.input.place ?? '')?.[1];
      assert.ok(nominal && canton, group.id);
      for (const name of scenario.input.profiles ?? [scenario.input.profile]) {
        const profile = name.toLowerCase();
        const facts = canton === 'NE' ? { 'NE-LANDERON-ADDITIONAL': scenario.input.place === 'Le Landeron NE' } : {};
        const result = calculate(input(profile, addCalendarDays(nominal, -1), 1), context(profile, canton, facts));
        if (nominal <= '2026-08-29' || !profiles.includes(profile)) {
          assert.equal(result.outcome, 'blocked', `${group.id}/${profile} must not create historical permission`);
        } else {
          assert.equal(result.outcome, 'calculated', `${group.id}/${profile}: ${result.blockReasonKeys}`);
          assert.equal(result.outcome === 'calculated' && result.finalEnd, scenario.expected.finalDate, `${group.id}/${profile}`);
        }
      }
    }
  }
  assert.equal(visited.size, 25);
});

test('AP22C2 leaves original calculation data and all BE/VRPG/social routes untouched', () => {
  const result = calculate();
  const legacy = calculateDeadline(input(), data);
  assert.equal(result.outcome === 'calculated' && result.finalEnd, legacy.outcome === 'calculated' && legacy.finalEnd);
  assert.equal(data.calendarRuleSets.size, 2); assert.equal(data.formatVersion, '6.0.0');
  assert.equal(data.socialProcedureCatalogs?.get('ch-social-procedures')?.cantonalBindings.length, 50);
  assert.ok([...data.calendarRuleSets.values()].every(calendar => calendar.formatVersion === '2.0.0'));
});
