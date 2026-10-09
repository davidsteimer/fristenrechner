// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateDeadline, calculateQualifiedSpecialDeadline, calculateSocialDeadline, calculateSpecialDeadline, socialObjectSha256 } from '../../src/core';
import type { CalculationData, QualifiedDeadlineInput, SocialDeadlineInput, SocialProcedureCatalog } from '../../src/core';
import { ap19cCandidateCalculationData as candidate } from '../../src/release/ap19cCandidateData';
import { mvp04CalculationData as previous } from '../../src/release/mvp04ReleaseData';
import migration from '../golden/candidates/ap19b-migration-plan.json';
import oldCorpus from '../golden/candidates/ap17b-anwendbarkeit.json';
import newCorpus from '../golden/candidates/ap19b-social-deadlines.json';
import { calculationInput, loadGoldenSuite } from './fixtures';
import { specialGoldenSuite } from './specialFixtures';

type Mutable<T> = T extends readonly (infer U)[] ? Mutable<U>[] : T extends object ? {-readonly [P in keyof T]: Mutable<T[P]>} : T;
const catalog = candidate.socialProcedureCatalogs!.get('ch-social-procedures')!;
// Invented test approvals only. Neither the JSON candidate nor preview data is modified.
const approved = JSON.parse(JSON.stringify(catalog)) as Mutable<SocialProcedureCatalog>;
approved.federalRules.forEach(rule => { rule.status = 'reviewed'; });
approved.cantonalBindings.forEach(binding => {
  binding.status = 'reviewed'; binding.legalValidity = {from: '2026-01-01', to: '2027-12-31'};
});
approved.releaseEligibility.forEach(entry => {
  entry.status = 'approved';
  entry.approval = {approvedBy: 'SYNTHETIC TEST ONLY', approvedOn: '2026-09-25', decisionRef: 'TEST-NOT-A-RELEASE'};
  entry.ruleRef.sha256 = socialObjectSha256(approved.federalRules.find(rule => rule.ruleId === entry.ruleRef.ruleId));
  entry.bindingRef.sha256 = socialObjectSha256(approved.cantonalBindings.find(binding => binding.bindingId === entry.bindingRef.bindingId));
});
const synthetic: CalculationData = {...candidate, socialProcedureCatalogs: new Map([[approved.catalogId, approved]])};

function inputFor(ruleId: string, date: string, days?: number): SocialDeadlineInput {
  const rule = catalog.federalRules.find(item => item.ruleId === ruleId)!;
  const binding = catalog.cantonalBindings.find(item => item.ruleId === ruleId)!;
  const route = binding.contextRoutes[0]!;
  const needsJurisdictionDate = [...rule.normBindings, ...binding.normBindings].some(n => n.temporalSelector === 'jurisdictionReferenceDate');
  return {
    ruleId, bindingId: binding.bindingId, contextRouteId: route.contextRouteId,
    procedureContextCanton: 'BE', caseFacts: Object.fromEntries(route.requiredFacts.map(f => [f.factKey, f.allowedValues[0]])),
    qualificationBasis: 'confirmed-case-facts', matter: rule.matter, triggerKind: rule.triggerKind,
    notificationChannel: 'individual-service', notificationConfirmed: true, legalTriggerDate: date,
    // Explicit fictional filing finding for this synthetic test case, never inferred in product code.
    ...(needsJurisdictionDate ? {jurisdictionReferenceDate: new Date(Date.parse(`${date}T00:00:00Z`) + (rule.action === 'complaint-correction' ? -1 : 1) * 86400000).toISOString().slice(0, 10)} : {}),
    holidayResolution: {status: 'resolved', calendarBindingId: 'be-party', anchors: [{role: 'party', canton: 'BE', spatialScopeId: 'BE'}]},
    ...(rule.calculation.durationInputId ? {days: days ?? 10} : {})
  };
}
function identityNeutral(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value, (key, item: unknown) => key === 'releaseId' || key === 'catalogId' ? '<identity>' : item));
}

for (const item of [...loadGoldenSuite('approved').cases, ...loadGoldenSuite('unresolved').cases]) {
  test(`${item.caseId}: format 5 preserves ordinary-core behaviour`, () => {
    assert.deepEqual(identityNeutral(calculateDeadline(calculationInput(item), candidate)), identityNeutral(calculateDeadline(calculationInput(item), previous)));
  });
}
for (const item of specialGoldenSuite.cases.filter(item => item.input.ruleId !== 'ATSG-SPEC-REL-060')) {
  test(`${item.caseId}: format 5 preserves non-social special-core behaviour`, () => {
    const input = {profileId: item.profileId, ...item.input};
    assert.deepEqual(identityNeutral(calculateSpecialDeadline(input, candidate)), identityNeutral(calculateSpecialDeadline(input, previous)));
  });
}
for (const item of oldCorpus.referenceCases.filter(item => !item.mappingId.startsWith('SOC-'))) {
  test(`${item.id}: procurement and other AP17 paths remain unchanged`, () => {
    const input = {mappingId: item.mappingId, ...item.input} as QualifiedDeadlineInput;
    assert.deepEqual(identityNeutral(calculateQualifiedSpecialDeadline(input, candidate)), identityNeutral(calculateQualifiedSpecialDeadline(input, previous)));
  });
}

for (const item of oldCorpus.referenceCases.filter(item => item.mappingId.startsWith('SOC-') && item.expected.status === 'calculateAfterApproval')) {
  test(`${item.id}: migrated social path preserves the accepted AP17 result`, () => {
    const mapping = migration.migrations.find(m => m.oldMappingId === item.mappingId)!;
    assert.ok(mapping);
    const input = inputFor(mapping.ruleId, item.input.legalTriggerDate, 'days' in item.input ? item.input.days : undefined);
    const result = calculateSocialDeadline(input, synthetic);
    assert.equal(result.outcome, 'calculated', JSON.stringify(result.blockReasonKeys));
    assert.equal(result.provisionalDeadline?.date, item.expected.rawEnd);
    assert.equal(result.finalDeadline?.date, item.expected.finalEnd);
    const suspension = result.trace.find(step => step.operation === 'applySuspension');
    assert.ok(suspension?.reasonKeys.includes(item.expected.suspensionDays ? `skipped${item.expected.suspensionDays}CalendarDays` : 'noSuspensionPeriodEncountered'));
    assert.equal(result.socialEvidence?.ruleId, mapping.ruleId);
    assert.equal(calculateSocialDeadline(input, candidate).outcome, 'blocked');
    assert.equal(calculateQualifiedSpecialDeadline({mappingId: item.mappingId, ...item.input} as QualifiedDeadlineInput, candidate).outcome, 'blocked');
  });
}

for (const item of newCorpus.cases.filter(item => item.pathId.startsWith('CH-SOC-ELG-') && item.expected.qualification === 'qualified-reference')) {
  test(`${item.id}: real ELG engine reproduces accepted AP19B arithmetic`, () => {
    const path = newCorpus.paths.find(path => path.pathId === item.pathId)!;
    const values = {...path.input, ...item.overrides};
    const input = inputFor(item.pathId, values.legalTriggerDate, values.days ?? undefined);
    const result = calculateSocialDeadline(input, synthetic);
    assert.equal(result.outcome, 'calculated', JSON.stringify(result.blockReasonKeys));
    assert.equal(result.provisionalDeadline?.date, item.expected.arithmetic?.nominalEndDate);
    assert.equal(result.finalDeadline?.date, item.expected.arithmetic?.deadline);
    const suspension = result.trace.find(step => step.operation === 'applySuspension');
    assert.ok(suspension?.reasonKeys.includes(item.expected.arithmetic?.suspensionDays ? `skipped${item.expected.arithmetic.suspensionDays}CalendarDays` : 'noSuspensionPeriodEncountered'));
    assert.equal(calculateSocialDeadline(input, candidate).outcome, 'blocked');
  });
}

test('format 5 closes the old generic ATSG fallback as well as migrated mapping IDs', () => {
  assert.deepEqual(calculateSpecialDeadline({profileId: 'vrpg-be', regimeId: 'atsg-social-insurance', ruleId: 'ATSG-SPEC-REL-060', dateValues: {legalTriggerDate: '2026-09-16'}, localTimeValues: {}, integerValues: {}, calendarProfileId: 'CP_ATSG', suspensionProfileId: 'S_ATSG', filingProfileId: 'F7_ATSG_DISPATCH', overrideConfirmations: []}, candidate).blockReasonKeys, ['socialResolverRequired']);
});

for (const item of newCorpus.cases.filter(item => item.pathId.startsWith('CH-SOC-ELG-') && item.expected.qualification === 'blocked')) {
  test(`${item.id}: accepted ELG rejection reaches the real resolver without relying on candidate status`, () => {
    const base = inputFor(item.pathId, '2026-09-16');
    const values: Record<string, unknown> = item.overrides;
    let input: SocialDeadlineInput = {...base,
      ...(typeof values.subject === 'string' ? {matter: values.subject} : {}),
      ...(typeof values.document === 'string' ? {triggerKind: values.document} : {}),
      ...(typeof values.legalTriggerDate === 'string' ? {legalTriggerDate: values.legalTriggerDate} : {})
    };
    if ('days' in values) {
      const {days: _days, ...withoutDays} = input;
      input = typeof values.days === 'number' ? {...withoutDays, days: values.days} : withoutDays;
    }
    if (values.jurisdictionStatus === 'unknown') input = {...input, caseFacts: {}};
    if (values.holidayCanton === null) input = {...input, holidayResolution: {...input.holidayResolution, status: 'unknown', anchors: []}};
    if (values.holidayStatus === 'conflict') input = {...input, holidayResolution: {...input.holidayResolution, status: 'conflict'}};
    const result = calculateSocialDeadline(input, synthetic);
    assert.equal(result.outcome, 'blocked', item.label);
    assert.equal(result.finalDeadline, undefined);
    assert.ok(!result.blockReasonKeys.includes('not-released'), item.label);
    assert.ok(!result.blockReasonKeys.includes('data-contract-invalid'), item.label);
  });
}

test('ELG court jurisdiction cannot be inferred from administrative canton or office seat', () => {
  for (const ruleId of ['CH-SOC-ELG-APP', 'CH-SOC-ELG-CORRECTION']) {
    const input = inputFor(ruleId, '2026-09-16');
    for (const caseFacts of [{...input.caseFacts, courtCanton: 'ZH'}, {...input.caseFacts, partyDomicileCanton: 'ZH'}, {...input.caseFacts, jurisdictionSpecialCase: 'abroad'}]) {
      assert.equal(calculateSocialDeadline({...input, authoritySeat: {country: 'CH', canton: 'BE'}, caseFacts}, synthetic).outcome, 'blocked');
    }
    const {jurisdictionReferenceDate: _date, ...missingDate} = input;
    assert.equal(calculateSocialDeadline(missingDate, synthetic).outcome, 'blocked');
  }
});
