// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import { calculateSocialDeadline, calculateSpecialDeadline, socialObjectSha256, validateSocialCatalogReferences } from '../../src/core';
import type { CalculationData, SocialDeadlineInput, SocialProcedureCatalog } from '../../src/core';
import { ap20c2CandidateCalculationData as candidate } from '../../src/release/ap20c2CandidateData';
import { ap20c1CandidateCalculationData as preceding } from '../../src/release/ap20c1CandidateData';
import { prepareAP20C2Candidate, persistAP20C2Candidate } from '../../scripts/build-ap20c2-candidate.mjs';
import contract from '../golden/candidates/ap20b-social-contract.json';
import references from '../golden/candidates/ap20b-social-dates.json';

type Mutable<T> = T extends readonly (infer U)[] ? Mutable<U>[] : T extends object ? {-readonly [P in keyof T]: Mutable<T[P]>} : T;
const catalog = candidate.socialProcedureCatalogs!.get('ch-social-procedures')!;
const oldCatalog = preceding.socialProcedureCatalogs!.get('ch-social-procedures')!;
const bindings = catalog.cantonalBindings.filter(binding => /^CH-SOC-(FAMZG|FLG)-/.test(binding.ruleId));
const window = { from: '2026-01-01', to: '2027-12-31' };

function rehash(value: Mutable<SocialProcedureCatalog>): void {
  for (const entry of value.releaseEligibility) {
    entry.ruleRef.sha256 = socialObjectSha256(value.federalRules.find(rule => rule.ruleId === entry.ruleRef.ruleId));
    entry.bindingRef.sha256 = socialObjectSha256(value.cantonalBindings.find(binding => binding.bindingId === entry.bindingRef.bindingId));
  }
}
// Positive and negative integration checks use explicit synthetic approval in
// memory only. Never mutate release data or let candidate status mask a gate.
function syntheticCatalog(base = catalog): Mutable<SocialProcedureCatalog> {
  const value = structuredClone(base) as Mutable<SocialProcedureCatalog>;
  value.federalRules.forEach(rule => { rule.status = 'reviewed'; });
  value.cantonalBindings.forEach(binding => { binding.status = 'reviewed'; });
  value.releaseEligibility.forEach(entry => {
    entry.status = 'approved';
    entry.approval = { approvedBy: 'SYNTHETIC TEST ONLY', approvedOn: '2026-10-01', decisionRef: 'TEST-NOT-A-RELEASE' };
  });
  rehash(value);
  return value;
}
const withCatalog = (value: SocialProcedureCatalog, base = candidate): CalculationData => ({ ...base, socialProcedureCatalogs: new Map([[value.catalogId, value]]) });
const synthetic = withCatalog(syntheticCatalog());
const syntheticOld = withCatalog(syntheticCatalog(oldCatalog), preceding);

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
  assert.equal(result.provisionalDeadline, undefined);
  assert.deepEqual(result.blockReasonKeys, [reason]);
}

test('AP20C2 adds exactly the accepted eight FamZG/FLG rules and eight Berner bindings without another format change', () => {
  validateSocialCatalogReferences(catalog, candidate);
  assert.equal(candidate.formatVersion, '6.0.0');
  assert.equal(catalog.formatVersion, '2.0.0');
  assert.equal(catalog.federalRules.length, 36);
  assert.equal(catalog.cantonalBindings.length, 42);
  assert.equal(bindings.length, 8);
  for (const law of ['FAMZG', 'FLG']) {
    assert.deepEqual(catalog.federalRules.filter(rule => rule.law === law.toLowerCase()).map(rule => rule.ruleId), ['OBJ', 'APP', 'ADM', 'CORRECTION'].map(suffix => `CH-SOC-${law}-${suffix}`));
    const origin = contract.laws.find(item => item.law === law)!.origin;
    for (const definition of contract.routes.filter(route => route.law === law)) for (const suffix of definition.actions) {
      const binding = bindings.find(item => item.bindingId === `BE-SOC-${definition.id}-${suffix}`)!;
      assert.ok(binding);
      assert.deepEqual(binding.caseCoverage, window);
      assert.deepEqual(binding.sourceCoverage, window);
      assert.equal(binding.contextRoutes.length, 1);
      assert.equal(binding.contextRoutes[0]!.kind, definition.kind);
      assert.equal(binding.contextRoutes[0]!.contextRouteId, `be-soc-${definition.id.toLowerCase()}`);
      assert.deepEqual(inputFor(binding.bindingId).caseFacts, { competentBodyQualified: true, decisionOrigin: origin, ...definition.facts, jurisdictionSpecialCase: 'ordinary' });
    }
  }
  assert.ok(!catalog.federalRules.some(rule => ['mvg', 'uelg'].includes(rule.law)));
});

for (const binding of bindings) for (const vector of references.vectors) {
  test(`${binding.bindingId} ${vector.id}: exact immutable AP20B arithmetic including future consolidation boundary`, () => {
    const input = inputFor(binding.bindingId, vector.trigger, vector.orderedDays);
    const rule = catalog.federalRules.find(rule => rule.ruleId === binding.ruleId)!;
    const expected = rule.calculation.duration ? vector.fixed : vector.ordered;
    const result = calculateSocialDeadline(input, synthetic);
    assert.equal(result.outcome, 'calculated', JSON.stringify(result.blockReasonKeys));
    assert.equal(result.provisionalDeadline?.date, expected[2]);
    assert.equal(result.finalDeadline?.date, expected[3]);
    const suspension = result.trace.find(step => step.operation === 'applySuspension');
    assert.ok(suspension?.reasonKeys.includes(expected[4] ? `skipped${expected[4]}CalendarDays` : 'noSuspensionPeriodEncountered'));
    assert.equal(result.trace.find(step => step.operation === 'shiftDeadlineEnd')?.outputDate, expected[5] ? expected[3] : undefined);
    assert.equal(result.socialEvidence?.ruleId, rule.ruleId);
    assert.equal(result.socialEvidence?.bindingId, binding.bindingId);
    assert.equal(result.socialEvidence?.contextRouteId, binding.contextRoutes[0]!.contextRouteId);
    assert.equal(result.socialEvidence?.calendarId, 'be-public-holidays');
    blocked(input, 'not-released', candidate);
  });
}

for (const binding of bindings) {
  test(`${binding.bindingId}: every exact fact required, no residence/seat proxy, alien or stale facts rejected`, () => {
    const input = inputFor(binding.bindingId);
    for (const key of Object.keys(input.caseFacts)) {
      const caseFacts = { ...input.caseFacts };
      delete caseFacts[key as keyof typeof caseFacts];
      blocked({ ...input, caseFacts }, 'context-unresolved');
    }
    blocked({ ...input, caseFacts: { ...input.caseFacts, competentBodyQualified: false } }, 'context-unresolved');
    blocked({ ...input, caseFacts: { ...input.caseFacts, decisionOrigin: 'healthInsurer' } }, 'context-unresolved');
    blocked({ ...input, caseFacts: { ...input.caseFacts, decisionOrigin: input.caseFacts.decisionOrigin === 'compensationOffice' ? 'familyCompensationOffice' : 'compensationOffice' } }, 'context-unresolved');
    for (const jurisdictionSpecialCase of ['abroad', 'thirdParty', 'unclear']) blocked({ ...input, caseFacts: { ...input.caseFacts, jurisdictionSpecialCase } }, 'context-unresolved');
    for (const partyDomicileCanton of ['BE', 'ZH', 'GE', 'TI', 'GR']) blocked({ ...input, caseFacts: { ...input.caseFacts, partyDomicileCanton } }, 'context-unresolved');
    assert.equal(input.caseFacts.partyDomicileCanton, undefined);
    const expectedCantonKey = binding.ruleId.includes('FAMZG') ? 'familyAllowanceOrderCanton' : 'compensationOfficeCanton';
    const otherCantonKey = expectedCantonKey === 'familyAllowanceOrderCanton' ? 'compensationOfficeCanton' : 'familyAllowanceOrderCanton';
    blocked({ ...input, caseFacts: { ...input.caseFacts, [expectedCantonKey]: 'ZH' } }, 'context-unresolved');
    blocked({ ...input, caseFacts: { ...input.caseFacts, [otherCantonKey]: 'BE' } }, 'context-unresolved');
    blocked({ ...input, caseFacts: { ...input.caseFacts, eogOfficeType: 'cantonal' } }, 'context-unresolved');
    blocked({ ...input, caseFacts: { ...input.caseFacts, uelgAdministrativeCanton: 'BE' } }, 'context-unresolved');
    blocked({ ...input, caseFacts: { ...input.caseFacts, inventedFact: 'BE' } } as SocialDeadlineInput, 'input-contract-invalid');
    blocked({ ...input, procedureContextCanton: 'ZH' }, 'context-unresolved');
    blocked({ ...input, contextRouteId: 'another-route' }, 'context-unresolved');
    const withoutCanton = { ...input.caseFacts };
    delete withoutCanton[expectedCantonKey];
    blocked({ ...input, caseFacts: withoutCanton, authoritySeat: { country: 'CH', canton: 'BE' } }, 'context-unresolved');
  });
  test(`${binding.bindingId}: separate holiday qualification, never inferred from order, office, court or seat`, () => {
    const input = inputFor(binding.bindingId);
    for (const status of ['unknown', 'conflict'] as const) blocked({ ...input, holidayResolution: { ...input.holidayResolution, status } }, 'holiday-unresolved');
    blocked({ ...input, holidayResolution: { ...input.holidayResolution, anchors: [] } }, 'holiday-unresolved');
    blocked({ ...input, holidayResolution: { ...input.holidayResolution, anchors: [{ role: 'party', canton: 'ZH', spatialScopeId: 'ZH' }] } }, 'holiday-unresolved');
    blocked({ ...input, holidayResolution: { ...input.holidayResolution, calendarBindingId: 'zh-unreleased' } }, 'calendar-not-released');
    const representative: SocialDeadlineInput = { ...input, holidayResolution: { status: 'resolved', calendarBindingId: 'be-representative', anchors: [{ role: 'representative', canton: 'BE', spatialScopeId: 'BE' }] } };
    assert.equal(calculateSocialDeadline(representative, synthetic).outcome, 'calculated');
    const result = calculateSocialDeadline(input, synthetic);
    for (const canton of ['BE', 'ZH', 'GE', 'TI', 'GR']) assert.deepEqual(calculateSocialDeadline({ ...input, authoritySeat: { country: 'CH', canton } }, synthetic), result);
  });
  test(`${binding.bindingId}: formal trigger, duration, temporal envelope and notification remain fail closed`, () => {
    const input = inputFor(binding.bindingId);
    const rule = catalog.federalRules.find(rule => rule.ruleId === binding.ruleId)!;
    blocked({ ...input, triggerKind: 'informal-benefit-statement' }, 'wrong-trigger');
    blocked({ ...input, notificationConfirmed: false }, 'context-unresolved');
    blocked({ ...input, matter: 'unqualified-individual-benefit' }, 'wrong-matter');
    blocked({ ...input, legalTriggerDate: '2025-12-31' }, 'outside-case-coverage');
    blocked({ ...input, legalTriggerDate: '2028-01-01' }, 'outside-case-coverage');
    blocked({ ...input, legalTriggerDate: '2026-02-30' }, 'input-contract-invalid');
    blocked({ ...input, procedureStartDate: '2025-12-31' }, 'source-gap');
    blocked({ ...input, procedureStartDate: '2028-01-01' }, 'context-unresolved');
    blocked({ ...input, jurisdictionReferenceDate: '2028-01-01' }, 'source-gap');
    assert.equal(calculateSocialDeadline({ ...input, procedureStartDate: '2026-01-01' }, synthetic).outcome, 'calculated');
    if (rule.calculation.duration) {
      blocked({ ...input, days: 30 }, 'unsupported-procedure');
      blocked(inputFor(binding.bindingId, '2027-11-18'), 'outside-calculation-coverage');
    } else {
      const { days: _days, ...missingDays } = input;
      blocked(missingDays, 'unsupported-procedure');
      for (const days of [0, -1, 1.5, 366]) blocked({ ...input, days }, 'unsupported-procedure');
      blocked({ ...input, durationUnit: 'month' } as SocialDeadlineInput, 'input-contract-invalid');
      blocked(inputFor(binding.bindingId, '2027-12-17', 1), 'outside-calculation-coverage');
    }
  });
}

for (const law of ['FAMZG', 'FLG']) for (const suffix of ['APP', 'CORRECTION']) {
  test(`${law} ${suffix}: special court jurisdiction keeps its own dated finding and never substitutes domicile`, () => {
    const input = inputFor(`BE-SOC-${law}-COURT-${suffix}`);
    const { jurisdictionReferenceDate: _missing, ...missingDate } = input;
    blocked(missingDate, 'context-unresolved');
    blocked({ ...input, jurisdictionReferenceDate: '2025-12-31' }, 'source-gap');
    blocked({ ...input, caseFacts: { ...input.caseFacts, courtCanton: 'ZH' } }, 'context-unresolved');
    if (suffix === 'CORRECTION') {
      blocked({ ...input, jurisdictionReferenceDate: '2026-09-17' }, 'context-unresolved');
      for (const triggerKind of ['reply-order-days', 'court-general-day-order', 'cost-advance-order']) blocked({ ...input, triggerKind }, 'wrong-trigger');
    } else {
      assert.equal(calculateSocialDeadline({ ...input, jurisdictionReferenceDate: '2026-09-17' }, synthetic).outcome, 'calculated');
      blocked({ ...input, triggerKind: 'initial-benefit-disposition' }, 'wrong-trigger');
    }
  });
}

test('national FamZG scope and first Bern binding differ deliberately, exclusions keep their distinct reasons', () => {
  const rules = catalog.federalRules.filter(rule => rule.law === 'famzg');
  for (const rule of rules) {
    assert.ok(rule.sourceRefs.some(ref => ref.locator.includes('höherer Ansätze') && ref.locator.includes('Geburts- und Adoptionszulagen')));
    assert.ok(!rule.sourceRefs.some(ref => ref.sourceId.includes('KFAMZG')));
  }
  for (const binding of bindings.filter(binding => binding.ruleId.includes('FAMZG'))) assert.ok(binding.supplementaryLawRefs.some(ref => ref.sourceId === 'SRC-AP20C2-KFAMZG-BE-20201101' && ref.locator.includes('obligatorische')));
  const organisation = catalog.excludedPaths.find(item => item.exclusionId === 'FAMZG-ORGANISATION-GRANTS')!;
  const voluntary = catalog.excludedPaths.find(item => item.exclusionId === 'FAMZG-VOLUNTARY')!;
  const cantonalExtra = catalog.excludedPaths.find(item => item.exclusionId === 'FLG-CANTONAL-EXTRA')!;
  assert.equal(organisation.reasonKind, 'statutory-exclusion');
  assert.equal(voluntary.reasonKind, 'unresolved-qualification');
  assert.equal(cantonalExtra.reasonKind, 'product-scope');
  for (const exclusion of [organisation, voluntary, cantonalExtra]) {
    const input = inputFor(`BE-SOC-${exclusion.law.toUpperCase()}-ADMIN-OBJ`);
    blocked({ ...input, matter: exclusion.matter }, 'wrong-matter');
  }
});

test('all 28 prior rules and 34 bindings retain exact identities, status, coverage, sources and hashes', () => {
  assert.deepEqual(catalog.federalRules.slice(0, 28), oldCatalog.federalRules);
  assert.deepEqual(catalog.cantonalBindings.slice(0, 34), oldCatalog.cantonalBindings);
  assert.deepEqual(catalog.sources.slice(0, oldCatalog.sources.length), oldCatalog.sources);
  assert.deepEqual(catalog.excludedPaths.slice(0, oldCatalog.excludedPaths.length), oldCatalog.excludedPaths);
  for (const rule of oldCatalog.federalRules) assert.equal(socialObjectSha256(catalog.federalRules.find(item => item.ruleId === rule.ruleId)), socialObjectSha256(rule));
  for (const binding of oldCatalog.cantonalBindings) assert.equal(socialObjectSha256(catalog.cantonalBindings.find(item => item.bindingId === binding.bindingId)), socialObjectSha256(binding));
  assert.equal(catalog.releaseEligibility.length, 42);
  assert.ok(catalog.releaseEligibility.every(entry => entry.status === 'candidate' && entry.approval === null && entry.releaseId === candidate.releaseId));
  assert.ok(!catalog.releaseEligibility.some(entry => oldCatalog.releaseEligibility.some(old => old.eligibilityId === entry.eligibilityId)));
});

for (const binding of oldCatalog.cantonalBindings) {
  test(`${binding.bindingId}: C2 preserves the complete prior C1 calculation and trace`, () => {
    const input = inputFor(binding.bindingId, '2026-09-16', 10, preceding);
    const oldResult = calculateSocialDeadline(input, syntheticOld);
    const newResult = calculateSocialDeadline(input, synthetic);
    assert.equal(oldResult.outcome, 'calculated');
    assert.equal(newResult.outcome, 'calculated');
    assert.deepEqual(newResult.provisionalDeadline, oldResult.provisionalDeadline);
    assert.deepEqual(newResult.finalDeadline, oldResult.finalDeadline);
    assert.deepEqual(newResult.trace, oldResult.trace);
    assert.deepEqual(newResult.filingRequirement, oldResult.filingRequirement);
    assert.deepEqual(newResult.socialEvidence?.sourceRefs, oldResult.socialEvidence?.sourceRefs);
    blocked(input, 'not-released', candidate);
  });
}

test('unreleased later laws, generic ATSG and mismatched law/binding identity do not fall back', () => {
  const input = inputFor('BE-SOC-FAMZG-ADMIN-OBJ');
  for (const law of ['MVG', 'UELG']) blocked({ ...input, ruleId: `CH-SOC-${law}-OBJ` }, 'unknown-rule');
  blocked({ ...input, bindingId: 'BE-SOC-FLG-ADMIN-OBJ' }, 'context-unresolved');
  blocked({ ...input, ruleId: 'CH-SOC-FLG-OBJ' }, 'wrong-matter');
  assert.deepEqual(calculateSpecialDeadline({ profileId: 'vrpg-be', regimeId: 'atsg-social-insurance', ruleId: 'ATSG-SPEC-REL-060', dateValues: { legalTriggerDate: '2026-09-16' }, localTimeValues: {}, integerValues: {}, calendarProfileId: 'CP_ATSG', suspensionProfileId: 'S_ATSG', filingProfileId: 'F7_ATSG_DISPATCH', overrideConfirmations: [] }, candidate).blockReasonKeys, ['socialResolverRequired']);
});

test('orphan bindings, missing coverage and stale object/release hashes cannot produce an end date', () => {
  const input = inputFor('BE-SOC-FAMZG-ADMIN-OBJ');
  for (const mutate of [
    (value: Mutable<SocialProcedureCatalog>) => { value.federalRules = value.federalRules.filter(rule => rule.ruleId !== input.ruleId); },
    (value: Mutable<SocialProcedureCatalog>) => { value.cantonalBindings = value.cantonalBindings.filter(binding => binding.bindingId !== input.bindingId); },
    (value: Mutable<SocialProcedureCatalog>) => { value.releaseEligibility.find(entry => entry.bindingRef.bindingId === input.bindingId)!.releaseId = preceding.releaseId; },
    (value: Mutable<SocialProcedureCatalog>) => { value.releaseEligibility.find(entry => entry.bindingRef.bindingId === input.bindingId)!.ruleRef.sha256 = '0'.repeat(64); },
    (value: Mutable<SocialProcedureCatalog>) => { value.releaseEligibility.find(entry => entry.bindingRef.bindingId === input.bindingId)!.bindingRef.sha256 = '0'.repeat(64); }
  ]) {
    const value = syntheticCatalog(); mutate(value);
    blocked(input, 'data-contract-invalid', withCatalog(value));
  }
  const missingApproval = syntheticCatalog();
  missingApproval.releaseEligibility = missingApproval.releaseEligibility.filter(entry => entry.bindingRef.bindingId !== input.bindingId);
  blocked(input, 'not-released', withCatalog(missingApproval));
  const sourceGap = syntheticCatalog();
  sourceGap.federalRules.find(rule => rule.ruleId === input.ruleId)!.sourceCoverage.to = '2026-09-15';
  for (const entry of sourceGap.releaseEligibility.filter(entry => entry.ruleRef.ruleId === input.ruleId)) {
    entry.caseCoverage.to = '2026-09-15';
    entry.calculationCoverage.to = '2026-09-15';
  }
  rehash(sourceGap);
  blocked(input, 'source-gap', withCatalog(sourceGap));
});

test('candidate builder reproduces eleven files, preserves all nine non-social artifacts and binds source refresh plus C1 acceptance', () => {
  const prepared = prepareAP20C2Candidate();
  assert.equal(prepared.files.size, 11);
  for (const [path, bytes] of prepared.files) assert.ok(readFileSync(`data/candidates/2026-10-01-ap20c2/${path}`).equals(bytes));
  const manifest = JSON.parse(prepared.files.get('manifest.json')!.toString());
  assert.equal(manifest.releaseStatus, 'candidate');
  assert.equal(manifest.formatVersion, '6.0.0');
  assert.equal(manifest.compatibility.minimumConsumerFormatVersion, '6.0.0');
  assert.equal(manifest.extensions['steimer.approval'], undefined);
  const extension = manifest.extensions['steimer.candidate'];
  assert.equal(extension.productionActivation, false);
  assert.equal(extension.approvalRequired, true);
  assert.equal(extension.baseReleaseId, preceding.releaseId);
  for (const evidence of [...extension.sourceEvidence, extension.acceptanceEvidence, extension.decisionEvidence]) assert.equal(createHash('sha256').update(readFileSync(evidence.path)).digest('hex'), evidence.sha256);
  for (const artifact of manifest.artifacts) {
    const bytes = prepared.files.get(artifact.path)!;
    assert.equal(createHash('sha256').update(bytes).digest('hex'), artifact.sha256);
    assert.equal(bytes.length, artifact.byteLength);
    if (artifact.role !== 'socialProcedureCatalog') {
      assert.ok(readFileSync(`data/candidates/2026-09-30-ap20c1/${artifact.path}`).equals(bytes));
      assert.ok(readFileSync(`data/releases/2026-09-28-mvp-05-approved.1/${artifact.path}`).equals(bytes));
    }
  }
});

test('candidate persistence is append-only, idempotent and refuses differing data before any writes', () => {
  const prepared = prepareAP20C2Candidate();
  const scratch = mkdtempSync(join(tmpdir(), 'ap20c2-append-only-'));
  const target = join(scratch, 'candidate'), evidenceTarget = join(scratch, 'build-verification.json');
  persistAP20C2Candidate(prepared, target, evidenceTarget);
  persistAP20C2Candidate(prepared, target, evidenceTarget);
  const files = new Map(prepared.files);
  files.set('manifest.json', Buffer.from('different candidate'));
  assert.throws(() => persistAP20C2Candidate({ ...prepared, files }, target, evidenceTarget), /Refusing to overwrite differing candidate/);
  assert.ok(readFileSync(join(target, 'manifest.json')).equals(prepared.files.get('manifest.json')!));
});
