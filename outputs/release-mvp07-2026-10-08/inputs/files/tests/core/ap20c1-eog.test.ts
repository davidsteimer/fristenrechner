// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { calculateSocialDeadline, socialObjectSha256, validateSocialCatalogReferences } from '../../src/core';
import type { CalculationData, SocialDeadlineInput, SocialProcedureCatalog } from '../../src/core';
import { ap20c1CandidateCalculationData as candidate } from '../../src/release/ap20c1CandidateData';
import { mvp05CalculationData as approved } from '../../src/release/mvp05ReleaseData';
import { prepareAP20C1Candidate } from '../../scripts/build-ap20c1-candidate.mjs';
import contract from '../golden/candidates/ap20b-social-contract.json';
import references from '../golden/candidates/ap20b-social-dates.json';

type Mutable<T> = T extends readonly (infer U)[] ? Mutable<U>[] : T extends object ? {-readonly [P in keyof T]: Mutable<T[P]>} : T;
const catalog = candidate.socialProcedureCatalogs!.get('ch-social-procedures')!;
const oldCatalog = approved.socialProcedureCatalogs!.get('ch-social-procedures')!;
const eogBindings = catalog.cantonalBindings.filter(binding => binding.ruleId.startsWith('CH-SOC-EOG-'));
const window = { from: '2026-01-01', to: '2027-12-31' };

function rehash(value: Mutable<SocialProcedureCatalog>): void {
  for (const entry of value.releaseEligibility) {
    entry.ruleRef.sha256 = socialObjectSha256(value.federalRules.find(rule => rule.ruleId === entry.ruleRef.ruleId));
    entry.bindingRef.sha256 = socialObjectSha256(value.cantonalBindings.find(binding => binding.bindingId === entry.bindingRef.bindingId));
  }
}
// Explicit in-memory test approval, never persisted or imported by app code.
// Negative probes use it too so candidate status cannot hide a permissive gate.
function syntheticCatalog(): Mutable<SocialProcedureCatalog> {
  const value = structuredClone(catalog) as Mutable<SocialProcedureCatalog>;
  value.federalRules.forEach(rule => { rule.status = 'reviewed'; });
  value.cantonalBindings.forEach(binding => { binding.status = 'reviewed'; });
  value.releaseEligibility.forEach(entry => {
    entry.status = 'approved';
    entry.approval = { approvedBy: 'SYNTHETIC TEST ONLY', approvedOn: '2026-09-30', decisionRef: 'TEST-NOT-A-RELEASE' };
  });
  rehash(value);
  return value;
}
const withCatalog = (value: SocialProcedureCatalog): CalculationData => ({ ...candidate, socialProcedureCatalogs: new Map([[value.catalogId, value]]) });
const synthetic = withCatalog(syntheticCatalog());

function inputFor(bindingId: string, date = '2026-09-16', days = 10, data = candidate): SocialDeadlineInput {
  const current = data.socialProcedureCatalogs!.get('ch-social-procedures')!;
  const binding = current.cantonalBindings.find(item => item.bindingId === bindingId)!;
  const rule = current.federalRules.find(item => item.ruleId === binding.ruleId)!;
  const route = binding.contextRoutes[0]!;
  const selectors = new Set([...rule.normBindings, ...binding.normBindings].map(norm => norm.temporalSelector));
  return {
    ruleId: rule.ruleId, bindingId, contextRouteId: route.contextRouteId,
    procedureContextCanton: 'BE', caseFacts: Object.fromEntries(route.requiredFacts.map(fact => [fact.factKey, fact.allowedValues[0]])),
    qualificationBasis: 'confirmed-case-facts', matter: rule.matter, triggerKind: rule.triggerKind,
    notificationChannel: 'individual-service', notificationConfirmed: true, legalTriggerDate: date,
    ...(selectors.has('jurisdictionReferenceDate') ? { jurisdictionReferenceDate: date } : {}),
    ...(selectors.has('procedureStartDate') ? { procedureStartDate: date } : {}),
    holidayResolution: { status: 'resolved', calendarBindingId: 'be-party', anchors: [{ role: 'party', canton: 'BE', spatialScopeId: 'BE' }] },
    ...(rule.calculation.durationInputId ? { days } : {})
  };
}
function blocked(input: SocialDeadlineInput, reason: string, data = synthetic): void {
  const result = calculateSocialDeadline(input, data);
  assert.equal(result.outcome, 'blocked');
  assert.equal(result.finalDeadline, undefined);
  assert.deepEqual(result.blockReasonKeys, [reason]);
}

test('AP20C1 implements exactly the four accepted national EOG identities and six routes, not the later laws', () => {
  validateSocialCatalogReferences(catalog, candidate);
  assert.equal(candidate.formatVersion, '6.0.0');
  assert.equal(catalog.formatVersion, '2.0.0');
  assert.equal(catalog.federalRules.length, 28);
  assert.equal(catalog.cantonalBindings.length, 34);
  assert.equal(eogBindings.length, 6);
  assert.deepEqual(catalog.federalRules.filter(rule => rule.law === 'eog').map(rule => rule.ruleId), ['CH-SOC-EOG-OBJ', 'CH-SOC-EOG-APP', 'CH-SOC-EOG-ADM', 'CH-SOC-EOG-CORRECTION']);
  assert.ok(!catalog.federalRules.some(rule => ['famzg', 'flg', 'mvg', 'uelg'].includes(rule.law)));
  for (const definition of contract.routes.filter(route => route.law === 'EOG')) for (const suffix of definition.actions) {
    const binding = eogBindings.find(item => item.bindingId === `BE-SOC-${definition.id}-${suffix}`)!;
    assert.ok(binding);
    assert.deepEqual(binding.caseCoverage, window);
    assert.deepEqual(binding.sourceCoverage, window);
    assert.equal(binding.contextRoutes.length, 1);
    assert.equal(binding.contextRoutes[0]!.kind, definition.kind);
    assert.equal(binding.contextRoutes[0]!.contextRouteId, `be-soc-${definition.id.toLowerCase()}`);
    const expectedFacts = { competentBodyQualified: true, decisionOrigin: 'compensationOffice', ...definition.facts, jurisdictionSpecialCase: 'ordinary' };
    assert.deepEqual(inputFor(binding.bindingId).caseFacts, expectedFacts);
  }
});

for (const binding of eogBindings) for (const vector of references.vectors) {
  test(`${binding.bindingId} ${vector.id}: product arithmetic reproduces unchanged AP20B date vector`, () => {
    const input = inputFor(binding.bindingId, vector.trigger, vector.orderedDays);
    const rule = catalog.federalRules.find(rule => rule.ruleId === binding.ruleId)!;
    const expected = rule.calculation.duration ? vector.fixed : vector.ordered;
    const result = calculateSocialDeadline(input, synthetic);
    assert.equal(result.outcome, 'calculated', JSON.stringify(result.blockReasonKeys));
    assert.equal(result.provisionalDeadline?.date, expected[2]);
    assert.equal(result.finalDeadline?.date, expected[3]);
    const suspension = result.trace.find(step => step.operation === 'applySuspension');
    assert.ok(suspension?.reasonKeys.includes(expected[4] ? `skipped${expected[4]}CalendarDays` : 'noSuspensionPeriodEncountered'));
    const shift = result.trace.find(step => step.operation === 'shiftDeadlineEnd');
    assert.equal(shift?.outputDate, expected[5] ? expected[3] : undefined);
    assert.equal(result.socialEvidence?.ruleId, rule.ruleId);
    assert.equal(result.socialEvidence?.bindingId, binding.bindingId);
    assert.equal(result.socialEvidence?.contextRouteId, binding.contextRoutes[0]!.contextRouteId);
    assert.equal(result.socialEvidence?.calendarId, 'be-public-holidays');
    blocked(input, 'not-released', candidate);
  });
}

for (const binding of eogBindings) {
  test(`${binding.bindingId}: missing, wrong or surplus facts never select another route`, () => {
    const input = inputFor(binding.bindingId);
    for (const key of Object.keys(input.caseFacts)) {
      const caseFacts = { ...input.caseFacts };
      delete caseFacts[key as keyof typeof caseFacts];
      blocked({ ...input, caseFacts }, 'context-unresolved');
    }
    blocked({ ...input, caseFacts: { ...input.caseFacts, competentBodyQualified: false } }, 'context-unresolved');
    blocked({ ...input, caseFacts: { ...input.caseFacts, decisionOrigin: 'healthInsurer' } }, 'context-unresolved');
    for (const jurisdictionSpecialCase of ['abroad', 'thirdParty', 'unclear']) blocked({ ...input, caseFacts: { ...input.caseFacts, jurisdictionSpecialCase } }, 'context-unresolved');
    blocked({ ...input, caseFacts: { ...input.caseFacts, familyAllowanceOrderCanton: 'BE' } }, 'context-unresolved');
    blocked({ ...input, caseFacts: { ...input.caseFacts, inventedFact: 'BE' } } as SocialDeadlineInput, 'input-contract-invalid');
    blocked({ ...input, procedureContextCanton: 'ZH' }, 'context-unresolved');
    blocked({ ...input, contextRouteId: 'another-route' }, 'context-unresolved');
  });
  test(`${binding.bindingId}: holiday qualification is independent from office, domicile and court`, () => {
    const input = inputFor(binding.bindingId);
    for (const status of ['unknown', 'conflict'] as const) blocked({ ...input, holidayResolution: { ...input.holidayResolution, status } }, 'holiday-unresolved');
    blocked({ ...input, holidayResolution: { ...input.holidayResolution, anchors: [] } }, 'holiday-unresolved');
    blocked({ ...input, holidayResolution: { ...input.holidayResolution, anchors: [{ role: 'party', canton: 'ZH', spatialScopeId: 'ZH' }] } }, 'holiday-unresolved');
    blocked({ ...input, holidayResolution: { ...input.holidayResolution, calendarBindingId: 'zh-unreleased' } }, 'calendar-not-released');
    const representative: SocialDeadlineInput = { ...input, holidayResolution: { status: 'resolved', calendarBindingId: 'be-representative', anchors: [{ role: 'representative', canton: 'BE', spatialScopeId: 'BE' }] } };
    assert.equal(calculateSocialDeadline(representative, synthetic).outcome, 'calculated');
  });
  test(`${binding.bindingId}: optional seat is not a jurisdiction or calendar proxy`, () => {
    const input = inputFor(binding.bindingId);
    const result = calculateSocialDeadline(input, synthetic);
    for (const canton of ['BE', 'ZH', 'GE', 'TI', 'GR']) assert.deepEqual(calculateSocialDeadline({ ...input, authoritySeat: { country: 'CH', canton } }, synthetic), result);
  });
}

for (const suffix of ['APP', 'CORRECTION']) for (const group of ['CANTONAL', 'ORDINARY']) {
  test(`EOG ${group} ${suffix}: distinct source of jurisdiction and explicit dated court finding`, () => {
    const input = inputFor(`BE-SOC-EOG-${group}-${suffix}`);
    const { jurisdictionReferenceDate: _missing, ...missingDate } = input;
    blocked(missingDate, 'context-unresolved');
    blocked({ ...input, jurisdictionReferenceDate: '2025-12-31' }, 'source-gap');
    blocked({ ...input, jurisdictionReferenceDate: '2028-01-01' }, 'source-gap');
    blocked({ ...input, caseFacts: { ...input.caseFacts, eogOfficeType: group === 'CANTONAL' ? 'nonCantonal' : 'cantonal' } }, 'context-unresolved');
    blocked({ ...input, caseFacts: { ...input.caseFacts, courtCanton: 'ZH' } }, 'context-unresolved');
    if (group === 'CANTONAL') {
      assert.equal(input.caseFacts.partyDomicileCanton, undefined);
      blocked({ ...input, caseFacts: { ...input.caseFacts, compensationOfficeCanton: 'ZH' } }, 'context-unresolved');
      blocked({ ...input, caseFacts: { ...input.caseFacts, partyDomicileCanton: 'BE' } }, 'context-unresolved');
    } else {
      assert.equal(input.caseFacts.compensationOfficeCanton, undefined);
      blocked({ ...input, caseFacts: { ...input.caseFacts, partyDomicileCanton: 'ZH' } }, 'context-unresolved');
      blocked({ ...input, caseFacts: { ...input.caseFacts, compensationOfficeCanton: 'BE' } }, 'context-unresolved');
    }
    if (suffix === 'CORRECTION') blocked({ ...input, jurisdictionReferenceDate: '2026-09-17' }, 'context-unresolved');
    else assert.equal(calculateSocialDeadline({ ...input, jurisdictionReferenceDate: '2026-09-17' }, synthetic).outcome, 'calculated');
    // AP20B permits an optional valid, covered procedural date. It cannot be
    // after the order or outside the evidence window.
    assert.equal(calculateSocialDeadline({ ...input, procedureStartDate: '2026-01-01' }, synthetic).outcome, 'calculated');
    blocked({ ...input, procedureStartDate: '2025-12-31' }, 'source-gap');
    blocked({ ...input, procedureStartDate: '2026-09-17' }, 'context-unresolved');
  });
}

test('EOG administration uses the accepted BE domicile product boundary, not an invented Bern office requirement', () => {
  for (const suffix of ['OBJ', 'ADM']) {
    const input = inputFor(`BE-SOC-EOG-ADMIN-${suffix}`);
    assert.equal(input.caseFacts.partyDomicileCanton, 'BE');
    assert.equal(input.caseFacts.compensationOfficeCanton, undefined);
    assert.equal(input.caseFacts.eogOfficeType, undefined);
    assert.equal(input.jurisdictionReferenceDate, undefined);
    blocked({ ...input, caseFacts: { ...input.caseFacts, partyDomicileCanton: 'ZH' } }, 'context-unresolved');
    assert.equal(calculateSocialDeadline({ ...input, authoritySeat: { country: 'CH', canton: 'ZH' } }, synthetic).outcome, 'calculated');
  }
});

test('EOG formal notice, exact day duration and full 2026–2027 arithmetic coverage are independently required', () => {
  const objection = inputFor('BE-SOC-EOG-ADMIN-OBJ');
  blocked({ ...objection, triggerKind: 'informal-benefit-statement' }, 'wrong-trigger');
  blocked({ ...objection, days: 30 }, 'unsupported-procedure');
  blocked({ ...objection, notificationConfirmed: false }, 'context-unresolved');
  for (const matter of ['eog-informal-statement', 'eog-cantonal-supplement', 'eog-organ-liability', 'eog-employer-dispute', 'eog-supervision', 'federal-instance']) blocked({ ...objection, matter }, 'wrong-matter');
  const appeal = inputFor('BE-SOC-EOG-CANTONAL-APP');
  blocked({ ...appeal, triggerKind: 'initial-benefit-disposition' }, 'wrong-trigger');
  const correction = inputFor('BE-SOC-EOG-CANTONAL-CORRECTION');
  for (const triggerKind of ['reply-order-days', 'court-general-day-order', 'cost-advance-order']) blocked({ ...correction, triggerKind }, 'wrong-trigger');
  const ordered = inputFor('BE-SOC-EOG-ADMIN-ADM');
  const { days: _days, ...missingDays } = ordered;
  blocked(missingDays, 'unsupported-procedure');
  for (const days of [0, -1, 1.5, 366]) blocked({ ...ordered, days }, 'unsupported-procedure');
  blocked({ ...ordered, durationUnit: 'month' } as SocialDeadlineInput, 'input-contract-invalid');
  blocked({ ...objection, legalTriggerDate: '2025-12-31' }, 'outside-case-coverage');
  blocked({ ...objection, legalTriggerDate: '2028-01-01' }, 'outside-case-coverage');
  blocked({ ...objection, legalTriggerDate: '2027-11-18' }, 'outside-calculation-coverage');
  blocked(inputFor('BE-SOC-EOG-ADMIN-ADM', '2027-12-17', 1), 'outside-calculation-coverage');
});

test('all 24 old rules and 28 bindings preserve exact identities, revisions, meanings, status and object hashes', () => {
  assert.deepEqual(catalog.federalRules.slice(0, 24), oldCatalog.federalRules);
  assert.deepEqual(catalog.cantonalBindings.slice(0, 28), oldCatalog.cantonalBindings);
  for (const rule of oldCatalog.federalRules) assert.equal(socialObjectSha256(catalog.federalRules.find(item => item.ruleId === rule.ruleId)), socialObjectSha256(rule));
  for (const binding of oldCatalog.cantonalBindings) assert.equal(socialObjectSha256(catalog.cantonalBindings.find(item => item.bindingId === binding.bindingId)), socialObjectSha256(binding));
  assert.equal(catalog.releaseEligibility.length, 34);
  assert.ok(catalog.releaseEligibility.every(entry => entry.status === 'candidate' && entry.approval === null && entry.releaseId === candidate.releaseId));
});

for (const binding of oldCatalog.cantonalBindings) {
  test(`${binding.bindingId}: new consumer/candidate preserves the approved MVP05 arithmetic and trace`, () => {
    const input = inputFor(binding.bindingId, '2026-09-16', 10, approved);
    const oldResult = calculateSocialDeadline(input, approved);
    const newResult = calculateSocialDeadline(input, synthetic);
    assert.equal(oldResult.outcome, 'calculated');
    assert.equal(newResult.outcome, 'calculated');
    assert.deepEqual(newResult.provisionalDeadline, oldResult.provisionalDeadline);
    assert.deepEqual(newResult.finalDeadline, oldResult.finalDeadline);
    assert.deepEqual(newResult.trace, oldResult.trace);
    assert.deepEqual(newResult.filingRequirement, oldResult.filingRequirement);
    blocked(input, 'not-released', candidate);
  });
}

test('candidate builder is reproducible, byte-preserves nine other artifacts and binds evidence without inherited approvals', () => {
  const prepared = prepareAP20C1Candidate();
  assert.equal(prepared.files.size, 11);
  for (const [path, bytes] of prepared.files) assert.ok(readFileSync(`data/candidates/2026-09-30-ap20c1/${path}`).equals(bytes));
  const manifest = JSON.parse(prepared.files.get('manifest.json')!.toString());
  assert.equal(manifest.releaseStatus, 'candidate');
  assert.equal(manifest.compatibility.minimumConsumerFormatVersion, '6.0.0');
  assert.equal(manifest.extensions['steimer.approval'], undefined);
  for (const artifact of manifest.artifacts) {
    const bytes = prepared.files.get(artifact.path)!;
    assert.equal(createHash('sha256').update(bytes).digest('hex'), artifact.sha256);
    assert.equal(bytes.length, artifact.byteLength);
    if (artifact.role !== 'socialProcedureCatalog') assert.ok(readFileSync(`data/releases/2026-09-28-mvp-05-approved.1/${artifact.path}`).equals(bytes));
  }
});
