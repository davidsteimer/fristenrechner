// SPDX-License-Identifier: AGPL-3.0-only
// These tests use the actual human-approved disk release, never invented approvals.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { calculateDeadline, calculateSocialDeadline, calculateQualifiedSpecialDeadline, calculateSpecialDeadline, createCalculationData, socialObjectSha256 } from '../../src/core';
import type { SocialDeadlineInput, ValidatedReleaseLike, QualifiedDeadlineInput } from '../../src/core';
import { ap20c3CandidateCalculationData as candidate } from '../../src/release/ap20c3CandidateData';
import references from '../golden/candidates/ap19b-social-deadlines.json';
import ap20Dates from '../golden/candidates/ap20b-social-dates.json';
import ap20Contract from '../golden/candidates/ap20b-social-contract.json';
import oldCorpus from '../golden/candidates/ap17b-anwendbarkeit.json';
import migration from '../golden/candidates/ap19b-migration-plan.json';
import { calculationInput, loadGoldenSuite } from './fixtures';
import { specialGoldenSuite } from './specialFixtures';

const directory = resolve('data/releases/2026-10-01-mvp-06-approved.1');
const manifest = JSON.parse(readFileSync(resolve(directory, 'manifest.json'), 'utf8'));
const release = {
  releaseId: manifest.releaseId, formatVersion: manifest.formatVersion,
  coverageFrom: manifest.coverage.from, coverageTo: manifest.coverage.to,
  profileIds: manifest.profileIds, calendarIds: manifest.calendarIds,
  specialRegimeCatalogIds: manifest.specialRegimeCatalogIds,
  holidayCatalogIds: manifest.holidayCatalogIds,
  socialProcedureCatalogIds: manifest.socialProcedureCatalogIds,
  artifacts: manifest.artifacts.map((descriptor: {path: string}) => ({ descriptor, parsed: JSON.parse(readFileSync(resolve(directory, descriptor.path), 'utf8')) }))
} as ValidatedReleaseLike;
const approved = createCalculationData(release);
const catalog = approved.socialProcedureCatalogs!.get('ch-social-procedures')!;
const neutral = (value: unknown): unknown => JSON.parse(JSON.stringify(value, (key, item: unknown) => key === 'releaseId' ? '<release>' : item));

function inputsFor(ruleId: string, date = '2026-09-16', days?: number): SocialDeadlineInput[] {
  const rule = catalog.federalRules.find(item => item.ruleId === ruleId)!;
  return catalog.cantonalBindings.filter(binding => binding.ruleId === ruleId).map(binding => {
    const route = binding.contextRoutes[0]!;
    const dated = [...rule.normBindings, ...binding.normBindings].some(norm => norm.temporalSelector === 'jurisdictionReferenceDate');
    const origin = route.requiredFacts.find(fact => fact.factKey === 'decisionOrigin')?.allowedValues[0];
    // Explicit fictional case facts, not runtime defaults. Fund appeals need
    // the date of the previous disposition. Court findings are dated today.
    const dateFinding = origin === 'unemploymentFund' && rule.action !== 'ordered-administrative-days'
      ? new Date(Date.parse(`${date}T00:00:00Z`) - 86400000).toISOString().slice(0, 10) : date;
    return { ruleId, bindingId: binding.bindingId, contextRouteId: route.contextRouteId,
      procedureContextCanton: 'BE', caseFacts: Object.fromEntries(route.requiredFacts.map(fact => [fact.factKey, fact.allowedValues[0]])),
      qualificationBasis: 'confirmed-case-facts', matter: rule.matter, triggerKind: rule.triggerKind,
      notificationChannel: 'individual-service', notificationConfirmed: true, legalTriggerDate: date,
      ...(dated ? {jurisdictionReferenceDate: dateFinding} : {}),
      holidayResolution: {status: 'resolved', calendarBindingId: 'be-party', anchors: [{role: 'party', canton: 'BE', spatialScopeId: 'BE'}]},
      ...(rule.calculation.durationInputId ? {days: days ?? 10} : {})
    };
  });
}

test('MVP06 loads actual approved format-6 bytes and all 50 real human decision bindings', () => {
  assert.equal(manifest.releaseStatus, 'approved');
  assert.equal(approved.formatVersion, '6.0.0');
  assert.equal(catalog.formatVersion, '2.0.0');
  assert.equal(catalog.federalRules.length, 44);
  assert.equal(catalog.cantonalBindings.length, 50);
  assert.equal(catalog.releaseEligibility.length, 50);
  for (const entry of catalog.releaseEligibility) {
    assert.equal(entry.releaseId, approved.releaseId);
    assert.equal(entry.status, 'approved');
    assert.deepEqual(entry.approval, {approvedBy: 'David Steimer', approvedOn: '2026-10-01', decisionRef: 'docs/fachrecht/abnahme-quellen-mvp06.md'});
    assert.equal(entry.sourceReviewRef.reviewId, 'MVP06-SOURCE-APPROVAL-20261001');
    assert.equal(entry.ruleRef.sha256, socialObjectSha256(catalog.federalRules.find(rule => rule.ruleId === entry.ruleRef.ruleId)));
    assert.equal(entry.bindingRef.sha256, socialObjectSha256(catalog.cantonalBindings.find(binding => binding.bindingId === entry.bindingRef.bindingId)));
  }
});

const newBindings = catalog.cantonalBindings.filter(binding => /^CH-SOC-(EOG|FAMZG|FLG|MVG|UELG)-/.test(binding.ruleId));
test('MVP06 includes exactly AP20B twenty national rules and twenty-two qualified Bern bindings', () => {
  assert.equal(newBindings.length, 22);
  for (const definition of ap20Contract.routes) for (const suffix of definition.actions) {
    const binding = newBindings.find(item => item.bindingId === `BE-SOC-${definition.id}-${suffix}`)!;
    assert.ok(binding);
    assert.equal(binding.contextRoutes.length, 1);
    assert.equal(binding.contextRoutes[0]!.kind, definition.kind);
    const input = inputsFor(binding.ruleId).find(item => item.bindingId === binding.bindingId)!;
    assert.deepEqual(input.caseFacts, {competentBodyQualified: true,
      decisionOrigin: ap20Contract.laws.find(law => law.law === definition.law)!.origin,
      ...definition.facts, jurisdictionSpecialCase: 'ordinary'});
  }
});

for (const binding of newBindings) for (const vector of ap20Dates.vectors) {
  test(`MVP06 ${binding.bindingId} ${vector.id}: actual approved AP20B literal arithmetic`, () => {
    const input = inputsFor(binding.ruleId, vector.trigger, vector.orderedDays).find(item => item.bindingId === binding.bindingId)!;
    const rule = catalog.federalRules.find(item => item.ruleId === binding.ruleId)!;
    const expected = rule.calculation.duration ? vector.fixed : vector.ordered;
    const result = calculateSocialDeadline(input, approved);
    assert.equal(result.outcome, 'calculated', JSON.stringify(result.blockReasonKeys));
    assert.equal(result.provisionalDeadline?.date, expected[2]);
    assert.equal(result.finalDeadline?.date, expected[3]);
    assert.ok(result.trace.find(step => step.operation === 'applySuspension')?.reasonKeys.includes(expected[4] ? `skipped${expected[4]}CalendarDays` : 'noSuspensionPeriodEncountered'));
    assert.equal(result.trace.find(step => step.operation === 'shiftDeadlineEnd')?.outputDate, expected[5] ? expected[3] : undefined);
    assert.equal(result.socialEvidence?.bindingId, binding.bindingId);
    assert.equal(result.socialEvidence?.releaseId, approved.releaseId);
    assert.deepEqual(calculateSocialDeadline(input, candidate).blockReasonKeys, ['not-released']);
  });
}

test('MVP06 preserves all prior 24 reviewed rules and 28 reviewed bindings including canonical object hashes', () => {
  const previous = JSON.parse(readFileSync('data/releases/2026-09-28-mvp-05-approved.1/social-procedures/ch-social-procedures.json', 'utf8'));
  assert.deepEqual(catalog.federalRules.slice(0, 24), previous.federalRules);
  assert.deepEqual(catalog.cantonalBindings.slice(0, 28), previous.cantonalBindings);
  for (const rule of catalog.federalRules.slice(0, 24)) assert.equal(socialObjectSha256(rule), socialObjectSha256(previous.federalRules.find((item: {ruleId: string}) => item.ruleId === rule.ruleId)));
  for (const binding of catalog.cantonalBindings.slice(0, 28)) assert.equal(socialObjectSha256(binding), socialObjectSha256(previous.cantonalBindings.find((item: {bindingId: string}) => item.bindingId === binding.bindingId)));
});

test('MVP06 executes the unchanged complete AP19B corpus, 25 positive and 52 negative cases', () => {
  assert.equal(references.cases.length, 77);
  assert.equal(references.cases.filter(item => item.expected.qualification === 'qualified-reference').length, 25);
  assert.equal(references.cases.filter(item => item.expected.qualification === 'blocked').length, 52);
});

for (const item of references.cases.filter(item => item.expected.qualification === 'qualified-reference')) {
  const path = references.paths.find(path => path.pathId === item.pathId)!;
  const values = {...path.input, ...item.overrides};
  for (const base of inputsFor(item.pathId, values.legalTriggerDate, values.days ?? undefined)) {
    test(`MVP06 ${item.id} / ${base.bindingId}: actual approved data matches accepted AP19B arithmetic`, () => {
      const role = values.holidayAnchor === 'representative' ? 'representative' : 'party';
      const input: SocialDeadlineInput = {...base,
        authoritySeat: {country: 'CH', canton: values.institutionSeatCanton},
        holidayResolution: {status: 'resolved', calendarBindingId: `be-${role}`, anchors: [{role, canton: 'BE', spatialScopeId: 'BE'}]}
      };
      const result = calculateSocialDeadline(input, approved);
      assert.equal(result.outcome, 'calculated', JSON.stringify(result.blockReasonKeys));
      assert.equal(result.provisionalDeadline?.date, item.expected.arithmetic?.nominalEndDate);
      assert.equal(result.finalDeadline?.date, item.expected.arithmetic?.deadline);
      assert.equal(result.socialEvidence?.releaseId, approved.releaseId);
      assert.equal(result.socialEvidence?.bindingId, input.bindingId);
      const suspension = result.trace.find(step => step.operation === 'applySuspension');
      assert.ok(suspension?.reasonKeys.includes(item.expected.arithmetic?.suspensionDays ? `skipped${item.expected.arithmetic.suspensionDays}CalendarDays` : 'noSuspensionPeriodEncountered'));
      assert.deepEqual(calculateSocialDeadline(input, candidate).blockReasonKeys, ['not-released']);
    });
  }
}

function negativeInput(base: SocialDeadlineInput, overrides: Record<string, unknown>): SocialDeadlineInput {
  let input: SocialDeadlineInput = {...base};
  if (typeof overrides.subject === 'string') input = {...input, matter: overrides.subject};
  if (typeof overrides.document === 'string') input = {...input, triggerKind: overrides.document};
  if (typeof overrides.legalTriggerDate === 'string') input = {...input, legalTriggerDate: overrides.legalTriggerDate};
  if ('days' in overrides) {
    const {days: _ignored, ...withoutDays} = input;
    input = typeof overrides.days === 'number' ? {...withoutDays, days: overrides.days} : withoutDays;
  }
  for (const key of ['stage', 'action', 'durationUnit']) if (key in overrides) input = {...input, [key]: overrides[key]} as SocialDeadlineInput;
  if (overrides.triggerStatus === 'unknown') input = {...input, notificationConfirmed: false};
  if (overrides.jurisdictionStatus === 'unknown') input = {...input, caseFacts: {}};
  if (overrides.proceduralCanton === null) {
    const {courtCanton: _missing, ...caseFacts} = input.caseFacts;
    input = {...input, caseFacts};
  }
  if (typeof overrides.proceduralCanton === 'string') input = {...input, procedureContextCanton: overrides.proceduralCanton, caseFacts: {...input.caseFacts, courtCanton: overrides.proceduralCanton}};
  if (overrides.holidayCanton === null) input = {...input, holidayResolution: {...input.holidayResolution, status: 'unknown', anchors: []}};
  if (overrides.holidayStatus === 'conflict') input = {...input, holidayResolution: {...input.holidayResolution, status: 'conflict'}};
  if (typeof overrides.holidayCanton === 'string') input = {...input, holidayResolution: {...input.holidayResolution, anchors: [{role: 'party', canton: overrides.holidayCanton, spatialScopeId: overrides.holidayCanton}]}};
  if (typeof overrides.regionalAreaId === 'string') input = {...input, holidayResolution: {...input.holidayResolution, anchors: [{role: 'party', canton: 'BE', spatialScopeId: overrides.regionalAreaId}]}};
  if (overrides.holidayAnchor === 'authority') input = {...input, holidayResolution: {...input.holidayResolution, anchors: [{role: 'authority', canton: 'BE', spatialScopeId: 'BE'}]}} as unknown as SocialDeadlineInput;
  if (typeof overrides.institutionSeatCanton === 'string') input = {...input, authoritySeat: {country: 'CH', canton: overrides.institutionSeatCanton}};
  return input;
}

for (const item of references.cases.filter(item => item.expected.qualification === 'blocked')) {
  for (const base of inputsFor(item.pathId)) {
    test(`MVP06 ${item.id} / ${base.bindingId}: accepted negative case remains blocked after real activation`, () => {
      const result = calculateSocialDeadline(negativeInput(base, item.overrides), approved);
      assert.equal(result.outcome, 'blocked', item.label);
      assert.equal(result.finalDeadline, undefined);
      assert.ok(!result.blockReasonKeys.includes('not-released'));
      assert.ok(!result.blockReasonKeys.includes('data-contract-invalid'));
    });
  }
}

for (const item of oldCorpus.referenceCases.filter(item => item.mappingId.startsWith('SOC-') && item.expected.status === 'calculateAfterApproval')) {
  test(`MVP06 ${item.id}: actual release preserves migrated AP17 social deadline`, () => {
    const mapping = migration.migrations.find(mapping => mapping.oldMappingId === item.mappingId)!;
    for (const input of inputsFor(mapping.ruleId, item.input.legalTriggerDate, 'days' in item.input ? item.input.days : undefined)) {
      const result = calculateSocialDeadline(input, approved);
      assert.equal(result.outcome, 'calculated', JSON.stringify(result.blockReasonKeys));
      assert.equal(result.provisionalDeadline?.date, item.expected.rawEnd);
      assert.equal(result.finalDeadline?.date, item.expected.finalEnd);
      assert.equal(calculateQualifiedSpecialDeadline({mappingId: item.mappingId, ...item.input} as QualifiedDeadlineInput, approved).outcome, 'blocked');
    }
  });
}

test('MVP06 preserves all ordinary, non-social special and qualified AP17 results and traces', () => {
  for (const item of [...loadGoldenSuite('approved').cases, ...loadGoldenSuite('unresolved').cases]) {
    assert.deepEqual(neutral(calculateDeadline(calculationInput(item), approved)), neutral(calculateDeadline(calculationInput(item), candidate)));
  }
  for (const item of specialGoldenSuite.cases) {
    const input = {profileId: item.profileId, ...item.input};
    assert.deepEqual(neutral(calculateSpecialDeadline(input, approved)), neutral(calculateSpecialDeadline(input, candidate)));
  }
  for (const item of oldCorpus.referenceCases.filter(item => !item.mappingId.startsWith('SOC-'))) {
    const input = {mappingId: item.mappingId, ...item.input} as QualifiedDeadlineInput;
    assert.deepEqual(neutral(calculateQualifiedSpecialDeadline(input, approved)), neutral(calculateQualifiedSpecialDeadline(input, candidate)));
  }
});

test('MVP06 activation never grants missing facts, another canton or dates outside the approved horizon', () => {
  for (const rule of catalog.federalRules) for (const input of inputsFor(rule.ruleId)) {
    assert.equal(calculateSocialDeadline(input, approved).outcome, 'calculated');
    for (const invalid of [
      {...input, procedureContextCanton: 'ZH'},
      {...input, caseFacts: {}},
      {...input, notificationConfirmed: false},
      {...input, legalTriggerDate: '2028-01-01'},
      {...input, holidayResolution: {...input.holidayResolution, status: 'unknown' as const}}
    ]) {
      const result = calculateSocialDeadline(invalid, approved);
      assert.equal(result.outcome, 'blocked');
      assert.equal(result.finalDeadline, undefined);
    }
  }
});
