// SPDX-License-Identifier: AGPL-3.0-only
// These tests use the actual human-approved disk release, never invented approvals.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { calculateDeadline, calculateSocialDeadline, calculateQualifiedSpecialDeadline, calculateSpecialDeadline, createCalculationData, socialObjectSha256 } from '../../src/core';
import type { SocialDeadlineInput, ValidatedReleaseLike, QualifiedDeadlineInput } from '../../src/core';
import { ap19c3CandidateCalculationData as candidate } from '../../src/release/ap19c3CandidateData';
import references from '../golden/candidates/ap19b-social-deadlines.json';
import oldCorpus from '../golden/candidates/ap17b-anwendbarkeit.json';
import migration from '../golden/candidates/ap19b-migration-plan.json';
import { calculationInput, loadGoldenSuite } from './fixtures';
import { specialGoldenSuite } from './specialFixtures';

const directory = resolve('data/releases/2026-09-28-mvp-05-approved.1');
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

test('MVP05 loads actual approved format-5 bytes and all 28 real human decisions', () => {
  assert.equal(manifest.releaseStatus, 'approved');
  assert.equal(approved.formatVersion, '5.0.0');
  assert.equal(catalog.federalRules.length, 24);
  assert.equal(catalog.cantonalBindings.length, 28);
  assert.equal(catalog.releaseEligibility.length, 28);
  for (const entry of catalog.releaseEligibility) {
    assert.equal(entry.releaseId, approved.releaseId);
    assert.equal(entry.status, 'approved');
    assert.deepEqual(entry.approval, {approvedBy: 'David Steimer', approvedOn: '2026-09-28', decisionRef: 'docs/fachrecht/abnahme-quellenpruefung-mvp05.md'});
    assert.equal(entry.sourceReviewRef.reviewId, 'MVP05-SOURCE-APPROVAL-20260928');
    assert.equal(entry.ruleRef.sha256, socialObjectSha256(catalog.federalRules.find(rule => rule.ruleId === entry.ruleRef.ruleId)));
    assert.equal(entry.bindingRef.sha256, socialObjectSha256(catalog.cantonalBindings.find(binding => binding.bindingId === entry.bindingRef.bindingId)));
  }
});

test('MVP05 executes the unchanged complete AP19B corpus, 25 positive and 52 negative cases', () => {
  assert.equal(references.cases.length, 77);
  assert.equal(references.cases.filter(item => item.expected.qualification === 'qualified-reference').length, 25);
  assert.equal(references.cases.filter(item => item.expected.qualification === 'blocked').length, 52);
});

for (const item of references.cases.filter(item => item.expected.qualification === 'qualified-reference')) {
  const path = references.paths.find(path => path.pathId === item.pathId)!;
  const values = {...path.input, ...item.overrides};
  for (const base of inputsFor(item.pathId, values.legalTriggerDate, values.days ?? undefined)) {
    test(`MVP05 ${item.id} / ${base.bindingId}: actual approved data matches accepted AP19B arithmetic`, () => {
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
    test(`MVP05 ${item.id} / ${base.bindingId}: accepted negative case remains blocked after real activation`, () => {
      const result = calculateSocialDeadline(negativeInput(base, item.overrides), approved);
      assert.equal(result.outcome, 'blocked', item.label);
      assert.equal(result.finalDeadline, undefined);
      assert.ok(!result.blockReasonKeys.includes('not-released'));
      assert.ok(!result.blockReasonKeys.includes('data-contract-invalid'));
    });
  }
}

for (const item of oldCorpus.referenceCases.filter(item => item.mappingId.startsWith('SOC-') && item.expected.status === 'calculateAfterApproval')) {
  test(`MVP05 ${item.id}: actual release preserves migrated AP17 social deadline`, () => {
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

test('MVP05 preserves all ordinary, non-social special and qualified AP17 results and traces', () => {
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

test('MVP05 activation never grants missing facts, another canton or dates outside the approved horizon', () => {
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
