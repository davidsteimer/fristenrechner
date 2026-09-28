// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateSocialDeadline, socialObjectSha256, validateSocialCatalogReferences } from '../../src/core';
import type { CalculationData, SocialDeadlineInput, SocialProcedureCatalog } from '../../src/core';
import { ap19c3CandidateCalculationData as candidate } from '../../src/release/ap19c3CandidateData';
import { ap19c2CandidateCalculationData as previous } from '../../src/release/ap19c2CandidateData';
import references from '../golden/candidates/ap19b-social-deadlines.json';

type Mutable<T> = T extends readonly (infer U)[] ? Mutable<U>[] : T extends object ? {-readonly [P in keyof T]: Mutable<T[P]>} : T;
const catalog = candidate.socialProcedureCatalogs!.get('ch-social-procedures')!;
const kvgRules = catalog.federalRules.filter(rule => rule.law === 'kvg');
const kvgCases = references.cases.filter(item => item.pathId.startsWith('CH-SOC-KVG-OKP-'));
const window = {from: '2026-01-01', to: '2027-12-31'};

function rehash(value: Mutable<SocialProcedureCatalog>): void {
  value.releaseEligibility.forEach(entry => {
    entry.ruleRef.sha256 = socialObjectSha256(value.federalRules.find(rule => rule.ruleId === entry.ruleRef.ruleId && rule.revision === entry.ruleRef.revision));
    entry.bindingRef.sha256 = socialObjectSha256(value.cantonalBindings.find(binding => binding.bindingId === entry.bindingRef.bindingId && binding.revision === entry.bindingRef.revision));
  });
}
// Fictional, in-memory approval only. Negative qualification probes also use
// this copy so an unreleased candidate cannot conceal a permissive resolver.
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

function inputFor(ruleId: string, date = '2026-09-16', days = 10, data = candidate): SocialDeadlineInput {
  const current = data.socialProcedureCatalogs!.get('ch-social-procedures')!;
  const rule = current.federalRules.find(item => item.ruleId === ruleId)!;
  const binding = current.cantonalBindings.find(item => item.ruleId === ruleId)!;
  const route = binding.contextRoutes[0]!;
  const needsDate = [...rule.normBindings, ...binding.normBindings].some(norm => norm.temporalSelector === 'jurisdictionReferenceDate');
  return {
    ruleId, bindingId: binding.bindingId, contextRouteId: route.contextRouteId,
    procedureContextCanton: 'BE', caseFacts: Object.fromEntries(route.requiredFacts.map(fact => [fact.factKey, fact.allowedValues[0]])),
    qualificationBasis: 'confirmed-case-facts', matter: rule.matter, triggerKind: rule.triggerKind,
    notificationChannel: 'individual-service', notificationConfirmed: true, legalTriggerDate: date,
    ...(needsDate ? {jurisdictionReferenceDate: date} : {}),
    authoritySeat: {country: 'CH', canton: 'ZH'},
    holidayResolution: {status: 'resolved', calendarBindingId: 'be-party', anchors: [{role: 'party', canton: 'BE', spatialScopeId: 'BE'}]},
    ...(rule.calculation.durationInputId ? {days} : {})
  };
}
function expectBlocked(input: SocialDeadlineInput, reason: string, data = synthetic): void {
  const result = calculateSocialDeadline(input, data);
  assert.equal(result.outcome, 'blocked');
  assert.equal(result.finalDeadline, undefined);
  assert.deepEqual(result.blockReasonKeys, [reason]);
}

test('AP19C3 adds exactly four national OKP paths and four separate Bern bindings on the accepted format contract', () => {
  validateSocialCatalogReferences(catalog, candidate);
  assert.equal(candidate.formatVersion, '5.0.0');
  assert.equal(catalog.formatVersion, '1.0.0');
  assert.equal(kvgRules.length, 4);
  assert.equal(catalog.federalRules.length, 24);
  assert.equal(catalog.cantonalBindings.length, 28);
  for (const path of references.paths.filter(item => item.pathId.startsWith('CH-SOC-KVG-OKP-'))) {
    const rule = kvgRules.find(item => item.ruleId === path.pathId)!;
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
    const bindings = catalog.cantonalBindings.filter(binding => binding.ruleId === rule.ruleId);
    assert.equal(bindings.length, 1);
    assert.equal(bindings[0]!.contextRoutes.length, 1);
    assert.equal(bindings[0]!.contextRoutes[0]!.kind, rule.stage === 'administration' ? 'product-scope' : 'legal-jurisdiction');
  }
});

test('all accepted KVG reference cases are represented without changing the AP19B oracle', () => {
  assert.equal(kvgCases.filter(item => item.expected.qualification === 'qualified-reference').length, 8);
  assert.equal(kvgCases.filter(item => item.expected.qualification === 'blocked').length, 24);
});

for (const item of kvgCases.filter(item => item.expected.qualification === 'qualified-reference')) {
  test(`${item.id}: real OKP engine reproduces the accepted AP19B arithmetic and qualified holiday anchor`, () => {
    const path = references.paths.find(path => path.pathId === item.pathId)!;
    const values = {...path.input, ...item.overrides};
    const base = inputFor(item.pathId, values.legalTriggerDate, values.days ?? undefined);
    const role = values.holidayAnchor === 'representative' ? 'representative' : 'party';
    const input: SocialDeadlineInput = {...base,
      authoritySeat: {country: 'CH', canton: values.institutionSeatCanton},
      holidayResolution: {status: 'resolved', calendarBindingId: `be-${role}`, anchors: [{role, canton: 'BE', spatialScopeId: 'BE'}]}
    };
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
    assert.equal(result.socialEvidence?.releaseId, candidate.releaseId);
    assert.equal(result.socialEvidence?.calendarId, 'be-public-holidays');
    assert.ok(result.socialEvidence?.sourceRefs.some(ref => ref.sourceId.includes('KVG')));
    expectBlocked(input, 'not-released', candidate);
  });
}

function negativeInput(item: typeof kvgCases[number]): {input: SocialDeadlineInput; reason: string} {
  const base = inputFor(item.pathId);
  const values: Record<string, unknown> = item.overrides;
  if (typeof values.subject === 'string') return {input: {...base, matter: values.subject}, reason: 'wrong-matter'};
  if (typeof values.document === 'string') return {input: {...base, triggerKind: values.document}, reason: 'wrong-trigger'};
  // Stage, action and duration unit are immutable parts of the selected path.
  // They are rejected as unknown input fields, never silently ignored.
  for (const key of ['stage', 'action', 'durationUnit']) if (key in values) return {input: {...base, [key]: values[key]} as SocialDeadlineInput, reason: 'input-contract-invalid'};
  if (typeof values.legalTriggerDate === 'string') return {
    input: {...base, legalTriggerDate: values.legalTriggerDate, ...(typeof values.days === 'number' ? {days: values.days} : {})},
    reason: item.expected.reason === 'date-invalid' ? 'input-contract-invalid' : 'outside-calculation-coverage'
  };
  if (typeof values.days === 'number') return {input: {...base, days: values.days}, reason: 'unsupported-procedure'};
  if (values.triggerStatus === 'unknown') return {input: {...base, notificationConfirmed: false}, reason: 'context-unresolved'};
  if (typeof values.proceduralCanton === 'string') return {input: {...base, procedureContextCanton: values.proceduralCanton, caseFacts: {...base.caseFacts, courtCanton: values.proceduralCanton}}, reason: 'context-unresolved'};
  if (values.holidayAnchor === 'authority') return {input: {...base, holidayResolution: {...base.holidayResolution, anchors: [{role: 'authority', canton: 'BE', spatialScopeId: 'BE'}]}} as unknown as SocialDeadlineInput, reason: 'input-contract-invalid'};
  if (typeof values.institutionSeatCanton === 'string') return {input: {...base, authoritySeat: {country: 'CH', canton: values.institutionSeatCanton}}, reason: 'input-contract-invalid'};
  throw new Error(`Unmapped accepted KVG rejection ${item.id}`);
}

for (const item of kvgCases.filter(item => item.expected.qualification === 'blocked')) {
  test(`${item.id}: accepted KVG rejection is enforced independently of candidate status`, () => {
    const {input, reason} = negativeInput(item);
    expectBlocked(input, reason);
    if (typeof item.overrides.subject === 'string') {
      const exclusions = catalog.excludedPaths.filter(path => path.law === 'kvg' && path.matter === item.overrides.subject);
      assert.ok(exclusions.length > 0, `Missing structured exclusion ${item.overrides.subject}`);
      assert.ok(exclusions.every(path => path.reasonKind === item.expected.reason), `${item.id}: legal exclusion must not be conflated with product scope`);
    }
  });
}

for (const rule of kvgRules) {
  test(`${rule.ruleId}: every real case fact is required, never inferred from Bern product context or insurer seat`, () => {
    const base = inputFor(rule.ruleId);
    assert.equal(base.caseFacts.partyDomicileCanton, 'BE');
    for (const key of Object.keys(base.caseFacts)) {
      const caseFacts = {...base.caseFacts};
      delete caseFacts[key as keyof typeof caseFacts];
      expectBlocked({...base, caseFacts, authoritySeat: {country: 'CH', canton: 'BE'}}, 'context-unresolved');
    }
    expectBlocked({...base, caseFacts: {...base.caseFacts, partyDomicileCanton: 'ZH'}, authoritySeat: {country: 'CH', canton: 'BE'}}, 'context-unresolved');
    expectBlocked({...base, procedureContextCanton: 'ZH'}, 'context-unresolved');
    expectBlocked({...base, caseFacts: {...base.caseFacts, decisionOrigin: 'compensationOffice'}}, 'context-unresolved');
    expectBlocked({...base, caseFacts: {...base.caseFacts, jurisdictionSpecialCase: 'abroad'}}, 'context-unresolved');
    expectBlocked({...base, caseFacts: {...base.caseFacts, elgAdministrativeCanton: 'BE'}}, 'context-unresolved');
  });

  test(`${rule.ruleId}: insurer seat is optional and has no arithmetic, calendar or jurisdiction effect`, () => {
    const base = inputFor(rule.ruleId);
    const {authoritySeat: _unused, ...withoutSeat} = base;
    const reference = calculateSocialDeadline(withoutSeat, synthetic);
    assert.equal(reference.outcome, 'calculated');
    for (const canton of ['BE', 'ZH', 'GE', 'TI', 'GR']) {
      const result = calculateSocialDeadline({...base, authoritySeat: {country: 'CH', canton}}, synthetic);
      assert.deepEqual(result, reference);
    }
  });

  test(`${rule.ruleId}: holiday facts remain independent even for a party resident in Bern`, () => {
    const base = inputFor(rule.ruleId);
    for (const status of ['unknown', 'conflict'] as const) expectBlocked({...base, holidayResolution: {...base.holidayResolution, status}}, 'holiday-unresolved');
    expectBlocked({...base, holidayResolution: {...base.holidayResolution, anchors: []}}, 'holiday-unresolved');
    expectBlocked({...base, holidayResolution: {...base.holidayResolution, calendarBindingId: 'zh-not-released'}}, 'calendar-not-released');
    expectBlocked({...base, holidayResolution: {...base.holidayResolution, anchors: [{role: 'party', canton: 'AG', spatialScopeId: 'AG-ARG-RHEINFELDEN-E1'}]}}, 'holiday-unresolved');
    expectBlocked({...base, holidayResolution: {...base.holidayResolution, anchors: [...base.holidayResolution.anchors, {role: 'representative', canton: 'ZH', spatialScopeId: 'ZH'}]}}, 'holiday-unresolved');
  });
}

for (const suffix of ['OBJ', 'ADM']) {
  test(`KVG ${suffix}: administration is an explicit domicile-based product boundary, not insurer jurisdiction`, () => {
    const input = inputFor(`CH-SOC-KVG-OKP-${suffix}`);
    const binding = catalog.cantonalBindings.find(item => item.bindingId === input.bindingId)!;
    assert.equal(binding.contextRoutes[0]!.contextRouteId, 'be-kvg-okp-product-scope');
    assert.equal(binding.contextRoutes[0]!.kind, 'product-scope');
    assert.equal(input.caseFacts.courtCanton, undefined);
    assert.equal(input.jurisdictionReferenceDate, undefined);
    expectBlocked({...input, jurisdictionReferenceDate: '2026-09-16'}, 'context-unresolved');
  });
}
for (const suffix of ['APP', 'CORRECTION']) {
  test(`KVG ${suffix}: court and domicile qualification require their own explicit time finding`, () => {
    const input = inputFor(`CH-SOC-KVG-OKP-${suffix}`);
    assert.equal(input.caseFacts.courtCanton, 'BE');
    assert.equal(input.caseFacts.partyDomicileCanton, 'BE');
    assert.ok(input.jurisdictionReferenceDate);
    const {jurisdictionReferenceDate: _missing, ...missingDate} = input;
    expectBlocked(missingDate, 'context-unresolved');
    expectBlocked({...input, caseFacts: {...input.caseFacts, courtCanton: 'ZH'}}, 'context-unresolved');
    expectBlocked({...input, jurisdictionReferenceDate: '2025-12-31'}, 'source-gap');
    expectBlocked({...input, jurisdictionReferenceDate: '2028-01-01'}, 'source-gap');
    if (suffix === 'CORRECTION') expectBlocked({...input, jurisdictionReferenceDate: '2026-09-17'}, 'context-unresolved');
    else {
      const future = calculateSocialDeadline({...input, jurisdictionReferenceDate: '2026-09-17'}, synthetic);
      assert.equal(future.outcome, 'calculated');
      assert.deepEqual(future.finalDeadline, calculateSocialDeadline(input, synthetic).finalDeadline);
    }
  });
}

test('KVG July consolidation does not invent a procedural interruption, while 2028 remains outside reviewed coverage', () => {
  for (const suffix of ['OBJ', 'APP']) {
    const input = inputFor(`CH-SOC-KVG-OKP-${suffix}`, '2026-06-16');
    assert.equal(calculateSocialDeadline(input, synthetic).finalDeadline?.date, '2026-08-17');
    expectBlocked({...input, legalTriggerDate: '2028-01-01'}, 'outside-case-coverage');
  }
  expectBlocked(inputFor('CH-SOC-KVG-OKP-ADM', '2027-12-17', 1), 'outside-calculation-coverage');
  const catalogWithGap = syntheticCatalog();
  catalogWithGap.federalRules.find(rule => rule.ruleId === 'CH-SOC-KVG-OKP-OBJ')!.normBindings[0]!.verification = 'open';
  rehash(catalogWithGap);
  expectBlocked(inputFor('CH-SOC-KVG-OKP-OBJ'), 'data-contract-invalid', dataFor(catalogWithGap));
});

test('ordinary first disposition, interlocutory decision and general court orders cannot become the selected KVG appeal path', () => {
  const appeal = inputFor('CH-SOC-KVG-OKP-APP');
  for (const triggerKind of ['initial-benefit-disposition', 'informal-benefit-statement', 'interlocutory-disposition', 'no-decision']) expectBlocked({...appeal, triggerKind}, 'wrong-trigger');
  const correction = inputFor('CH-SOC-KVG-OKP-CORRECTION');
  for (const triggerKind of ['reply-order-days', 'cost-advance-order', 'court-general-day-order']) expectBlocked({...correction, triggerKind}, 'wrong-trigger');
  const ordered = inputFor('CH-SOC-KVG-OKP-ADM');
  const {days: _missing, ...missingDays} = ordered;
  expectBlocked(missingDays, 'unsupported-procedure');
  expectBlocked({...ordered, durationUnit: 'fixed-end-date'} as SocialDeadlineInput, 'input-contract-invalid');
  expectBlocked({...appeal, days: 30}, 'unsupported-procedure');
  for (const stage of ['federal-supreme-court', 'federal-administrative-court']) expectBlocked({...appeal, stage} as SocialDeadlineInput, 'input-contract-invalid');
});

test('the unchanged national KVG rule supports a synthetic non-Bern binding only with its own exact release eligibility', () => {
  const value = syntheticCatalog();
  const input = inputFor('CH-SOC-KVG-OKP-APP');
  const nationalHash = socialObjectSha256(value.federalRules.find(rule => rule.ruleId === input.ruleId));
  const binding = value.cantonalBindings.find(item => item.bindingId === input.bindingId)!;
  const oldBindingId = binding.bindingId;
  binding.bindingId = 'ZH-SOC-KVG-OKP-APP-SYNTHETIC';
  binding.procedureContextCanton = 'ZH';
  binding.entryProfileId = 'vrpg-zh-synthetic';
  binding.contextRoutes[0]!.contextRouteId = 'zh-atsg58-court-synthetic';
  binding.contextRoutes[0]!.requiredFacts.forEach(fact => { if (fact.factKey === 'partyDomicileCanton' || fact.factKey === 'courtCanton') fact.allowedValues = ['ZH']; });
  const eligibility = value.releaseEligibility.find(entry => entry.bindingRef.bindingId === oldBindingId)!;
  eligibility.bindingRef.bindingId = binding.bindingId;
  eligibility.contextRouteIds = ['zh-atsg58-court-synthetic'];
  rehash(value);
  const profiles = new Map(candidate.profiles);
  profiles.set('vrpg-zh-synthetic', {...profiles.get('vrpg-be')!, profileId: 'vrpg-zh-synthetic', jurisdiction: {level: 'cantonal', code: 'ZH'}});
  const outside: SocialDeadlineInput = {...input, bindingId: binding.bindingId, contextRouteId: 'zh-atsg58-court-synthetic', procedureContextCanton: 'ZH',
    caseFacts: {...input.caseFacts, partyDomicileCanton: 'ZH', courtCanton: 'ZH'},
    holidayResolution: {status: 'resolved', calendarBindingId: 'be-representative', anchors: [{role: 'representative', canton: 'BE', spatialScopeId: 'BE'}]}
  };
  assert.equal(calculateSocialDeadline(outside, {...dataFor(value), profiles}).outcome, 'calculated');
  assert.equal(socialObjectSha256(value.federalRules.find(rule => rule.ruleId === input.ruleId)), nationalHash);
  eligibility.status = 'candidate'; eligibility.approval = null;
  expectBlocked(outside, 'not-released', {...dataFor(value), profiles});
});

test('all twenty accepted C2 rule objects and twenty-four bindings stay identical in C3', () => {
  const oldCatalog = previous.socialProcedureCatalogs!.get('ch-social-procedures')!;
  for (const rule of oldCatalog.federalRules) assert.deepEqual(catalog.federalRules.find(item => item.ruleId === rule.ruleId), rule);
  for (const binding of oldCatalog.cantonalBindings) assert.deepEqual(catalog.cantonalBindings.find(item => item.bindingId === binding.bindingId), binding);
});

const previousSynthetic = dataFor(syntheticCatalog(previous), previous);
for (const binding of previous.socialProcedureCatalogs!.get('ch-social-procedures')!.cantonalBindings) {
  test(`${binding.bindingId}: C3 preserves the actual C2 calculation and trace, not only its object shape`, () => {
    const base = inputFor(binding.ruleId, '2026-09-16', 10, previous);
    const route = binding.contextRoutes[0]!;
    const needsDate = binding.normBindings.some(norm => norm.temporalSelector === 'jurisdictionReferenceDate');
    const {jurisdictionReferenceDate: _oldDate, ...withoutDate} = base;
    const input: SocialDeadlineInput = {...withoutDate, bindingId: binding.bindingId, contextRouteId: route.contextRouteId,
      caseFacts: Object.fromEntries(route.requiredFacts.map(fact => [fact.factKey, fact.allowedValues[0]])),
      ...(needsDate ? {jurisdictionReferenceDate: '2026-09-16'} : {})};
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
