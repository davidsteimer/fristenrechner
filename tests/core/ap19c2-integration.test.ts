// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateSocialDeadline, socialObjectSha256, validateSocialCatalogReferences } from '../../src/core';
import type { CalculationData, SocialDeadlineInput, SocialProcedureCatalog } from '../../src/core';
import { ap19c2CandidateCalculationData as candidate } from '../../src/release/ap19c2CandidateData';
import { ap19cCandidateCalculationData as previous } from '../../src/release/ap19cCandidateData';
import references from '../golden/candidates/ap19b-social-deadlines.json';

type Mutable<T> = T extends readonly (infer U)[] ? Mutable<U>[] : T extends object ? {-readonly [P in keyof T]: Mutable<T[P]>} : T;
type Origin = 'unemploymentFund' | 'cantonalEmploymentOffice';
const origins: readonly Origin[] = ['unemploymentFund', 'cantonalEmploymentOffice'];
const catalog = candidate.socialProcedureCatalogs!.get('ch-social-procedures')!;
const avigRules = catalog.federalRules.filter(rule => rule.law === 'avig');
const avigCases = references.cases.filter(item => item.pathId.startsWith('CH-SOC-AVIG-ALE-'));
const avigBindings = catalog.cantonalBindings.filter(binding => binding.ruleId.startsWith('CH-SOC-AVIG-ALE-'));
const window = {from: '2026-01-01', to: '2027-12-31'};

function rehash(value: Mutable<SocialProcedureCatalog>): void {
  value.releaseEligibility.forEach(entry => {
    entry.ruleRef.sha256 = socialObjectSha256(value.federalRules.find(rule => rule.ruleId === entry.ruleRef.ruleId && rule.revision === entry.ruleRef.revision));
    entry.bindingRef.sha256 = socialObjectSha256(value.cantonalBindings.find(binding => binding.bindingId === entry.bindingRef.bindingId && binding.revision === entry.bindingRef.revision));
  });
}

// Deliberately invented, in-memory test approvals. No candidate file, preview or
// release is modified. Negative cases also use this data, never the release gate.
function syntheticCatalog(data: CalculationData = candidate): Mutable<SocialProcedureCatalog> {
  const value = JSON.parse(JSON.stringify(data.socialProcedureCatalogs!.get('ch-social-procedures'))) as Mutable<SocialProcedureCatalog>;
  value.federalRules.forEach(rule => { rule.status = 'reviewed'; });
  value.cantonalBindings.forEach(binding => { binding.status = 'reviewed'; binding.legalValidity = {...window}; });
  value.releaseEligibility.forEach(entry => {
    entry.status = 'approved';
    entry.approval = {approvedBy: 'SYNTHETIC TEST ONLY', approvedOn: '2026-09-28', decisionRef: 'TEST-NOT-A-RELEASE'};
  });
  rehash(value);
  return value;
}
function dataFor(value: SocialProcedureCatalog = syntheticCatalog(), data = candidate): CalculationData {
  return {...data, socialProcedureCatalogs: new Map([[value.catalogId, value]])};
}
const synthetic = dataFor();

function inputFor(ruleId: string, origin: Origin, date = '2026-09-16', days = 10): SocialDeadlineInput {
  const rule = catalog.federalRules.find(item => item.ruleId === ruleId)!;
  const bindings = catalog.cantonalBindings.filter(item => item.ruleId === ruleId && item.contextRoutes.some(route => route.requiredFacts.some(fact => fact.factKey === 'decisionOrigin' && fact.allowedValues.includes(origin))));
  assert.equal(bindings.length, 1, `${ruleId}: exact ${origin} binding`);
  const binding = bindings[0]!;
  const route = binding.contextRoutes.find(item => item.requiredFacts.some(fact => fact.factKey === 'decisionOrigin' && fact.allowedValues.includes(origin)))!;
  const needsDate = [...rule.normBindings, ...binding.normBindings].some(norm => norm.temporalSelector === 'jurisdictionReferenceDate');
  // Fictional case findings supplied explicitly by the test: the disposition
  // existed on the previous day, or current competence was qualified today for
  // an administrative day order. Product code must never invent either date.
  const dateFinding = rule.action === 'ordered-administrative-days' ? date
    : new Date(Date.parse(`${date}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
  return {
    ruleId, bindingId: binding.bindingId, contextRouteId: route.contextRouteId,
    procedureContextCanton: 'BE', caseFacts: Object.fromEntries(route.requiredFacts.map(fact => [fact.factKey, fact.allowedValues[0]])),
    qualificationBasis: 'confirmed-case-facts', matter: rule.matter, triggerKind: rule.triggerKind,
    notificationChannel: 'individual-service', notificationConfirmed: true, legalTriggerDate: date,
    ...(needsDate ? {jurisdictionReferenceDate: dateFinding} : {}),
    holidayResolution: {status: 'resolved', calendarBindingId: 'be-party', anchors: [{role: 'party', canton: 'BE', spatialScopeId: 'BE'}]},
    ...(rule.calculation.durationInputId ? {days} : {})
  };
}
function expectBlocked(input: SocialDeadlineInput, expectedReason: string, data = synthetic): void {
  const result = calculateSocialDeadline(input, data);
  assert.equal(result.outcome, 'blocked');
  assert.equal(result.finalDeadline, undefined);
  assert.deepEqual(result.blockReasonKeys, [expectedReason]);
}

test('AP19C2 loads four national AVIG paths with two distinct Bern bindings each, without changing the contract version', () => {
  validateSocialCatalogReferences(catalog, candidate);
  assert.equal(candidate.formatVersion, '5.0.0');
  assert.equal(catalog.formatVersion, '1.0.0');
  assert.equal(avigRules.length, 4);
  assert.equal(avigBindings.length, 8);
  assert.equal(catalog.federalRules.length, 20);
  assert.equal(catalog.federalRules.filter(rule => rule.law === 'kvg').length, 0);
  for (const path of references.paths.filter(item => item.pathId.startsWith('CH-SOC-AVIG-ALE-'))) {
    const rule = avigRules.find(item => item.ruleId === path.pathId)!;
    assert.ok(rule);
    assert.equal(rule.matter, path.input.subject);
    assert.equal(rule.triggerKind, path.input.document);
    assert.equal(rule.stage, path.input.stage);
    const actionMap: Readonly<Record<string, string>> = {'ordered-administrative-period': 'ordered-administrative-days', 'formal-complaint-correction': 'complaint-correction'};
    assert.equal(rule.action, actionMap[path.input.action] ?? path.input.action);
    assert.equal(rule.suspensionProfileId, 'S_ATSG');
    assert.equal(rule.holidayPolicy, 'partyOrRepresentative');
    assert.equal(rule.endShiftPolicy, 'nextWorkingDay');
    assert.deepEqual(rule.caseCoverage, window);
    assert.deepEqual(rule.sourceCoverage, window);
  }
});

test('all accepted AVIG reference cases are covered, including the Option B boundary examples', () => {
  assert.equal(avigCases.filter(item => item.expected.qualification === 'qualified-reference').length, 9);
  assert.equal(avigCases.filter(item => item.expected.qualification === 'blocked').length, 15);
  for (const id of ['R23', 'R24', 'R25']) assert.ok(avigCases.some(item => item.id === id));
});

for (const item of avigCases.filter(item => item.expected.qualification === 'qualified-reference')) {
  for (const origin of origins) {
    test(`${item.id} / ${origin}: real AVIG engine reproduces accepted AP19B deadline and suspension`, () => {
      const path = references.paths.find(path => path.pathId === item.pathId)!;
      const values = {...path.input, ...item.overrides};
      const input = inputFor(item.pathId, origin, values.legalTriggerDate, values.days ?? undefined);
      const result = calculateSocialDeadline(input, synthetic);
      assert.equal(result.outcome, 'calculated', JSON.stringify(result.blockReasonKeys));
      assert.equal(result.provisionalDeadline?.date, item.expected.arithmetic?.nominalEndDate);
      assert.equal(result.finalDeadline?.date, item.expected.arithmetic?.deadline);
      const suspension = result.trace.find(step => step.operation === 'applySuspension');
      assert.ok(suspension?.reasonKeys.includes(item.expected.arithmetic?.suspensionDays ? `skipped${item.expected.arithmetic.suspensionDays}CalendarDays` : 'noSuspensionPeriodEncountered'));
      const shift = result.trace.find(step => step.operation === 'shiftDeadlineEnd');
      if (item.expected.arithmetic?.extensionDays) {
        assert.deepEqual(shift?.inputDates, [item.expected.arithmetic.nominalEndDate]);
        assert.equal(shift?.outputDate, item.expected.arithmetic.deadline);
      } else assert.equal(shift, undefined);
      assert.equal(result.socialEvidence?.ruleId, item.pathId);
      assert.equal(result.socialEvidence?.bindingId, input.bindingId);
      assert.equal(result.socialEvidence?.contextRouteId, input.contextRouteId);
      assert.equal(result.socialEvidence?.releaseId, candidate.releaseId);
      assert.equal(result.socialEvidence?.calendarId, 'be-public-holidays');
      assert.ok(result.socialEvidence?.sourceRefs.some(ref => ref.locator.includes('119') || ref.locator.includes('128') || ref.locator.includes('35')));
      expectBlocked(input, 'not-released', candidate);
    });
  }
}

// Stage/action/duration-unit are fixed by the chosen national path and are not
// user-editable SocialDeadlineInput fields. Supplying an incompatible override
// must fail the closed input contract, not be silently ignored by the resolver.
function negativeInput(item: typeof avigCases[number], origin: Origin): {input: SocialDeadlineInput; reason: string} {
  const base = inputFor(item.pathId, origin);
  const values: Record<string, unknown> = item.overrides;
  if (typeof values.subject === 'string') return {input: {...base, matter: values.subject}, reason: 'wrong-matter'};
  if (typeof values.document === 'string') return {input: {...base, triggerKind: values.document}, reason: 'wrong-trigger'};
  for (const key of ['stage', 'action', 'durationUnit']) if (key in values) {
    return {input: {...base, [key]: values[key]} as SocialDeadlineInput, reason: 'input-contract-invalid'};
  }
  if (typeof values.days === 'number') return {input: {...base, days: values.days}, reason: 'unsupported-procedure'};
  if (values.proceduralCanton === null) {
    const {courtCanton: _missing, ...caseFacts} = base.caseFacts;
    return {input: {...base, caseFacts}, reason: 'context-unresolved'};
  }
  if (typeof values.holidayCanton === 'string') return {input: {...base, holidayResolution: {...base.holidayResolution, anchors: [{role: 'party', canton: values.holidayCanton, spatialScopeId: values.holidayCanton}]}}, reason: 'holiday-unresolved'};
  if (typeof values.regionalAreaId === 'string') return {input: {...base, holidayResolution: {...base.holidayResolution, anchors: [{role: 'party', canton: 'BE', spatialScopeId: values.regionalAreaId}]}}, reason: 'holiday-unresolved'};
  throw new Error(`Unmapped accepted rejection ${item.id}`);
}

for (const item of avigCases.filter(item => item.expected.qualification === 'blocked')) {
  for (const origin of origins) {
    test(`${item.id} / ${origin}: accepted AVIG rejection is enforced without the candidate gate`, () => {
      const {input, reason} = negativeInput(item, origin);
      expectBlocked(input, reason);
    });
  }
}

for (const rule of avigRules) {
  for (const origin of origins) {
    test(`${rule.ruleId} / ${origin}: each actual jurisdiction fact is necessary, not inferred from office seat`, () => {
      const base = inputFor(rule.ruleId, origin);
      for (const fact of Object.keys(base.caseFacts)) {
        const caseFacts = {...base.caseFacts};
        delete caseFacts[fact as keyof typeof caseFacts];
        expectBlocked({...base, caseFacts, authoritySeat: {country: 'CH', canton: 'BE'}}, 'context-unresolved');
      }
      const wrongCantonKey = origin === 'unemploymentFund' ? 'avigControlCanton' : 'avigOfficeCanton';
      expectBlocked({...base, caseFacts: {...base.caseFacts, [wrongCantonKey]: 'ZH'}, authoritySeat: {country: 'CH', canton: 'BE'}}, 'context-unresolved');
      expectBlocked({...base, procedureContextCanton: 'ZH'}, 'context-unresolved');
      expectBlocked({...base, caseFacts: {...base.caseFacts, jurisdictionSpecialCase: 'abroad'}}, 'context-unresolved');
      expectBlocked({...base, caseFacts: {...base.caseFacts, partyDomicileCanton: 'BE'}}, 'context-unresolved');
      assert.equal(calculateSocialDeadline({...base, authoritySeat: {country: 'CH', canton: 'ZH'}}, synthetic).outcome, 'calculated');
    });
  }

  test(`${rule.ruleId}: fund and office bindings cannot be mixed or selected by route ID alone`, () => {
    const fund = inputFor(rule.ruleId, 'unemploymentFund');
    const office = inputFor(rule.ruleId, 'cantonalEmploymentOffice');
    expectBlocked({...fund, bindingId: office.bindingId}, 'context-unresolved');
    expectBlocked({...office, contextRouteId: fund.contextRouteId}, 'context-unresolved');
    expectBlocked({...fund, caseFacts: {...fund.caseFacts, decisionOrigin: 'cantonalEmploymentOffice'}}, 'context-unresolved');
    expectBlocked({...office, caseFacts: {...office.caseFacts, avigControlCanton: 'BE'}}, 'context-unresolved');
  });

  test(`${rule.ruleId}: fund jurisdiction reference is an explicit dated fact and cannot postdate service`, () => {
    const fund = inputFor(rule.ruleId, 'unemploymentFund');
    assert.ok(fund.jurisdictionReferenceDate);
    const {jurisdictionReferenceDate: _missing, ...withoutDate} = fund;
    expectBlocked(withoutDate, 'context-unresolved');
    expectBlocked({...fund, jurisdictionReferenceDate: '2026-09-17'}, 'context-unresolved');
    expectBlocked({...fund, jurisdictionReferenceDate: '2025-12-31'}, 'source-gap');
    const office = inputFor(rule.ruleId, 'cantonalEmploymentOffice');
    assert.equal(office.jurisdictionReferenceDate, undefined);
    expectBlocked({...office, jurisdictionReferenceDate: '2026-09-15'}, 'context-unresolved');
  });
}

test('Option B does not bypass release, norm verification, source coverage or final-date coverage', () => {
  const input = inputFor('CH-SOC-AVIG-ALE-ADM', 'unemploymentFund', '2027-01-30', 1);
  assert.equal(calculateSocialDeadline(input, synthetic).finalDeadline?.date, '2027-02-01');
  const narrow = syntheticCatalog();
  const approval = narrow.releaseEligibility.find(entry => entry.bindingRef.bindingId === input.bindingId)!;
  approval.caseCoverage = {from: '2026-01-01', to: '2027-01-31'};
  approval.calculationCoverage = {from: '2026-01-01', to: '2027-01-31'};
  expectBlocked(input, 'outside-calculation-coverage', dataFor(narrow));
  const outOfSource = inputFor('CH-SOC-AVIG-ALE-ADM', 'cantonalEmploymentOffice', '2027-12-17', 20);
  expectBlocked(outOfSource, 'outside-calculation-coverage');
  expectBlocked({...input, legalTriggerDate: '2028-01-01'}, 'outside-case-coverage');
  const tampered = syntheticCatalog();
  tampered.cantonalBindings.find(binding => binding.bindingId === input.bindingId)!.normBindings[0]!.verification = 'open';
  rehash(tampered);
  expectBlocked(input, 'data-contract-invalid', dataFor(tampered));
});

test('AVIG legal jurisdiction is national, Bern availability requires its own exact binding and approval', () => {
  const value = syntheticCatalog();
  const input = inputFor('CH-SOC-AVIG-ALE-APP', 'unemploymentFund');
  const nationalHash = socialObjectSha256(value.federalRules.find(rule => rule.ruleId === input.ruleId));
  const binding = value.cantonalBindings.find(item => item.bindingId === input.bindingId)!;
  const oldBindingId = binding.bindingId;
  binding.bindingId = 'ZH-SOC-AVIG-ALE-APP-FUND-SYNTHETIC';
  binding.procedureContextCanton = 'ZH';
  binding.entryProfileId = 'vrpg-zh-synthetic';
  binding.contextRoutes.forEach(route => {
    route.contextRouteId = 'zh-avig-fund-synthetic';
    route.requiredFacts.forEach(fact => { if (fact.factKey === 'avigControlCanton' || fact.factKey === 'courtCanton') fact.allowedValues = ['ZH']; });
  });
  const approval = value.releaseEligibility.find(entry => entry.bindingRef.bindingId === oldBindingId)!;
  approval.bindingRef.bindingId = binding.bindingId;
  approval.contextRouteIds = ['zh-avig-fund-synthetic'];
  rehash(value);
  const profiles = new Map(candidate.profiles);
  profiles.set('vrpg-zh-synthetic', {...profiles.get('vrpg-be')!, profileId: 'vrpg-zh-synthetic', jurisdiction: {level: 'cantonal', code: 'ZH'}});
  const data = {...dataFor(value), profiles};
  const testInput: SocialDeadlineInput = {...input, bindingId: binding.bindingId, contextRouteId: 'zh-avig-fund-synthetic', procedureContextCanton: 'ZH', caseFacts: {...input.caseFacts, avigControlCanton: 'ZH', courtCanton: 'ZH'}};
  assert.equal(calculateSocialDeadline(testInput, data).outcome, 'calculated');
  assert.equal(socialObjectSha256(value.federalRules.find(rule => rule.ruleId === input.ruleId)), nationalHash);
  approval.status = 'candidate'; approval.approval = null;
  expectBlocked(testInput, 'not-released', {...dataFor(value), profiles});
});

test('all sixteen accepted C1 social rules and binding objects stay identical in C2', () => {
  const previousCatalog = previous.socialProcedureCatalogs!.get('ch-social-procedures')!;
  for (const oldRule of previousCatalog.federalRules) assert.deepEqual(catalog.federalRules.find(rule => rule.ruleId === oldRule.ruleId), oldRule);
  for (const oldBinding of previousCatalog.cantonalBindings) assert.deepEqual(catalog.cantonalBindings.find(binding => binding.bindingId === oldBinding.bindingId), oldBinding);
});

const previousCatalog = previous.socialProcedureCatalogs!.get('ch-social-procedures')!;
const previousSynthetic = dataFor(syntheticCatalog(previous), previous);
for (const rule of previousCatalog.federalRules) {
  test(`${rule.ruleId}: C2 preserves the real C1 social calculation and trace`, () => {
    const binding = previousCatalog.cantonalBindings.find(item => item.ruleId === rule.ruleId)!;
    const route = binding.contextRoutes[0]!;
    const needsDate = [...rule.normBindings, ...binding.normBindings].some(norm => norm.temporalSelector === 'jurisdictionReferenceDate');
    const input: SocialDeadlineInput = {
      ruleId: rule.ruleId, bindingId: binding.bindingId, contextRouteId: route.contextRouteId,
      procedureContextCanton: 'BE', caseFacts: Object.fromEntries(route.requiredFacts.map(fact => [fact.factKey, fact.allowedValues[0]])),
      qualificationBasis: 'confirmed-case-facts', matter: rule.matter, triggerKind: rule.triggerKind,
      notificationChannel: 'individual-service', notificationConfirmed: true, legalTriggerDate: '2026-09-16',
      ...(needsDate ? {jurisdictionReferenceDate: rule.action === 'complaint-correction' ? '2026-09-15' : '2026-09-17'} : {}),
      holidayResolution: {status: 'resolved', calendarBindingId: 'be-party', anchors: [{role: 'party', canton: 'BE', spatialScopeId: 'BE'}]},
      ...(rule.calculation.durationInputId ? {days: 10} : {})
    };
    const oldResult = calculateSocialDeadline(input, previousSynthetic);
    const newResult = calculateSocialDeadline(input, synthetic);
    assert.equal(oldResult.outcome, 'calculated');
    assert.equal(newResult.outcome, 'calculated');
    assert.deepEqual(newResult.provisionalDeadline, oldResult.provisionalDeadline);
    assert.deepEqual(newResult.finalDeadline, oldResult.finalDeadline);
    assert.deepEqual(newResult.trace, oldResult.trace);
    assert.deepEqual(newResult.filingRequirement, oldResult.filingRequirement);
    expectBlocked(input, 'not-released', candidate);
  });
}
