// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  calculateQualifiedSpecialDeadline,
  calculateDeadline,
  calculateSpecialDeadline,
  createCalculationData,
  resolveQualifiedSpecialDeadline
} from '../../src/core';
import type { CalculationData, QualifiedDeadlineInput, SpecialDeadlineInput, SpecialRegimeCatalog, ValidatedReleaseLike } from '../../src/core';
import { ap17cCandidateCalculationData as data, ap17cCandidateRelease as release } from '../../src/release/ap17cCandidateData';
import { approvedMvp03CalculationData as approved } from '../../src/release/approvedMvp03Data';
import corpus from '../golden/candidates/ap17b-anwendbarkeit.json';
import manifest from '../../data/releases/2026-09-12-ap17c-candidate.1/manifest.json';
import catalog from '../../data/releases/2026-09-12-ap17c-candidate.1/special-regimes/vrpg-be.json';
import { calculationInput, loadGoldenSuite } from './fixtures';
import { specialGoldenSuite } from './specialFixtures';

function withoutReleaseIdentity(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value, (key, item: unknown) =>
    key === 'releaseId' || key === 'catalogId' ? '<release-identity>' : item));
}

for (const reference of [...loadGoldenSuite('approved').cases, ...loadGoldenSuite('unresolved').cases]) {
  test(`${reference.caseId}: candidate preserves the current approved ordinary-core behaviour`, () => {
    const input = calculationInput(reference);
    assert.deepEqual(withoutReleaseIdentity(calculateDeadline(input, data)), withoutReleaseIdentity(calculateDeadline(input, approved)));
  });
}

for (const reference of specialGoldenSuite.cases) {
  test(`${reference.caseId}: v3 candidate preserves the current approved special-core behaviour`, () => {
    const input = { profileId: reference.profileId, ...reference.input };
    assert.deepEqual(withoutReleaseIdentity(calculateSpecialDeadline(input, data)), withoutReleaseIdentity(calculateSpecialDeadline(input, approved)));
  });
}

for (const reference of corpus.referenceCases) {
  test(`${reference.id}: integrated core reproduces the approved AP17B contract`, () => {
    const input = { mappingId: reference.mappingId, ...reference.input } as QualifiedDeadlineInput;
    const result = calculateQualifiedSpecialDeadline(input, data);
    if (reference.expected.status === 'blocked') {
      assert.equal(result.outcome, 'blocked');
      assert.deepEqual(result.blockReasonKeys, [reference.expected.reason]);
      assert.equal(result.finalDeadline, undefined);
      return;
    }
    assert.equal(result.outcome, 'calculated');
    assert.equal(result.provisionalDeadline?.date, reference.expected.rawEnd);
    assert.equal(result.finalDeadline?.date, reference.expected.finalEnd);
    assert.equal(result.qualifiedCalculation?.calendarStart, reference.expected.calendarStart);
    assert.equal(result.qualifiedCalculation?.firstCountedDay, reference.expected.firstCountedDay);
    assert.equal(result.qualifiedCalculation?.suspensionDays, reference.expected.suspensionDays);
    assert.equal(result.qualifiedCalculation?.rollDays, reference.expected.rollDays);
    assert.equal(result.calculationContext?.releaseId, manifest.releaseId);
    assert.ok(result.qualifiedCalculation?.sourceRefs.length);
  });
}

const goodInput = { mappingId: 'SOC-IV-PRE', ...corpus.referenceCases[0]!.input } as QualifiedDeadlineInput;
const displayedModelInput: QualifiedDeadlineInput = {
  ...goodInput,
  qualificationBasis: 'displayed-model-scope',
  notificationChannel: 'individual-service',
  notificationConfirmed: false
};
function special(input = goodInput): SpecialDeadlineInput {
  const resolved = resolveQualifiedSpecialDeadline(input, data);
  assert.equal(resolved.outcome, 'resolved');
  if (resolved.outcome !== 'resolved') throw new Error('fixture resolution failed');
  return resolved.specialInput;
}

for (const mapping of corpus.mappings.filter(item => item.disposition === 'candidate')) {
  test(`${mapping.id}: displayed model scope preserves the reference result without inventing a notification confirmation`, () => {
    const reference = corpus.referenceCases.find(item => item.mappingId === mapping.id && item.expected.status !== 'blocked');
    assert.ok(reference, mapping.id);
    const input: QualifiedDeadlineInput = {
      mappingId: mapping.id,
      ...reference.input,
      qualificationBasis: 'displayed-model-scope',
      notificationChannel: 'individual-service',
      notificationConfirmed: mapping.id.startsWith('PROC-')
    } as QualifiedDeadlineInput;
    const resolved = resolveQualifiedSpecialDeadline(input, data);
    assert.equal(resolved.outcome, 'resolved');
    if (resolved.outcome !== 'resolved') throw new Error('fixture resolution failed');
    assert.equal(resolved.specialInput.applicabilityContext?.qualificationBasis, 'displayed-model-scope');
    assert.equal(resolved.specialInput.applicabilityContext?.notificationConfirmed, input.notificationConfirmed);
    const result = calculateSpecialDeadline(resolved.specialInput, data);
    assert.equal(result.outcome, 'calculated');
    assert.equal(result.finalDeadline?.date, reference.expected.finalEnd);
  });
}

test('explicit confirmed-case-facts mode preserves the original confirmation requirement', () => {
  assert.equal(calculateQualifiedSpecialDeadline({ ...goodInput, qualificationBasis: 'confirmed-case-facts' }, data).outcome, 'calculated');
  for (const qualificationBasis of [undefined, 'confirmed-case-facts'] as const) {
    assert.deepEqual(calculateQualifiedSpecialDeadline({
      ...displayedModelInput, qualificationBasis
    } as unknown as QualifiedDeadlineInput, data).blockReasonKeys, ['notificationUnconfirmed']);
  }
});

test('displayed model scope requires the exact explicit supported channel, even when confirmed', () => {
  for (const notificationChannel of [undefined, '', 'unresolved', 'deliveryFiction', 'official-publication']) {
    for (const notificationConfirmed of [true, false]) {
      const result = calculateQualifiedSpecialDeadline({
        ...displayedModelInput, notificationChannel, notificationConfirmed
      } as unknown as QualifiedDeadlineInput, data);
      assert.equal(result.outcome, 'blocked', `${String(notificationChannel)} / ${notificationConfirmed}`);
      assert.equal(result.finalDeadline, undefined);
    }
  }
  for (const notificationConfirmed of [undefined, null, 'false']) {
    assert.deepEqual(calculateQualifiedSpecialDeadline({
      ...displayedModelInput, notificationConfirmed
    } as unknown as QualifiedDeadlineInput, data).blockReasonKeys, ['notificationUnconfirmed']);
  }
});

test('multiple procurement notification channels still require an explicit user choice', () => {
  for (const reference of corpus.referenceCases.filter(item => item.mappingId.startsWith('PROC-') && item.expected.status !== 'blocked')) {
    const input = {
      mappingId: reference.mappingId,
      ...reference.input,
      qualificationBasis: 'displayed-model-scope'
    } as QualifiedDeadlineInput;
    for (const notificationChannel of ['individual-service', 'official-publication']) {
      assert.deepEqual(calculateQualifiedSpecialDeadline({ ...input, notificationChannel, notificationConfirmed: false }, data).blockReasonKeys, ['notificationUnconfirmed']);
      assert.equal(calculateQualifiedSpecialDeadline({ ...input, notificationChannel, notificationConfirmed: true }, data).outcome, 'calculated');
    }
    assert.deepEqual(calculateQualifiedSpecialDeadline({
      ...input, notificationChannel: undefined, notificationConfirmed: true
    } as unknown as QualifiedDeadlineInput, data).blockReasonKeys, ['unsupportedNotificationChannel']);
  }
});

test('unknown runtime qualification bases cannot weaken direct or resolved core guards', () => {
  const original = special(displayedModelInput);
  for (const qualificationBasis of ['', 'automatic', null, false]) {
    const altered = { ...displayedModelInput, qualificationBasis } as unknown as QualifiedDeadlineInput;
    assert.deepEqual(calculateQualifiedSpecialDeadline(altered, data).blockReasonKeys, ['qualificationBasisInvalid']);
    assert.deepEqual(calculateSpecialDeadline({ ...original, applicabilityContext: altered }, data).blockReasonKeys, ['qualificationBasisInvalid']);
  }
});

test('displayed model scope leaves all archived negative applicability checks effective', () => {
  for (const reference of corpus.referenceCases.filter(item => item.expected.status === 'blocked')) {
    const altered = {
      mappingId: reference.mappingId,
      ...reference.input,
      qualificationBasis: 'displayed-model-scope',
      notificationChannel: 'notificationChannel' in reference.input ? reference.input.notificationChannel : 'individual-service'
    } as QualifiedDeadlineInput;
    // A sole supported notification channel is now a declared model constraint,
    // not a user-confirmed fact. This is the only intentionally changed guard.
    if (reference.expected.reason === 'notificationUnconfirmed' && !reference.mappingId.startsWith('PROC-')) continue;
    const result = calculateQualifiedSpecialDeadline(altered, data);
    assert.equal(result.outcome, 'blocked', reference.id);
    assert.deepEqual(result.blockReasonKeys, [reference.expected.reason], reference.id);
    assert.equal(result.finalDeadline, undefined, reference.id);
  }
});

test('displayed model scope cannot bypass technical coverage or direct special-call context checks', () => {
  const original = special(displayedModelInput);
  for (const legalTriggerDate of ['2025-12-31', '2028-01-01', '2027-12-10']) {
    assert.deepEqual(calculateQualifiedSpecialDeadline({ ...displayedModelInput, legalTriggerDate }, data).blockReasonKeys, ['applicabilityDateOutsideValidity']);
  }
  for (const patch of [
    { matter: 'unresolved' }, { triggerKind: 'unresolved' },
    { holidayAnchorConfirmed: false }, { holidayCanton: 'AG' },
    { qualificationBasis: 'confirmed-case-facts' as const }
  ]) {
    assert.equal(calculateSpecialDeadline({
      ...original, applicabilityContext: { ...displayedModelInput, ...patch }
    }, data).outcome, 'blocked');
  }
});

test('unknown or ambiguous mappings cannot use the displayed single-channel exception', () => {
  assert.deepEqual(calculateQualifiedSpecialDeadline({ ...displayedModelInput, mappingId: 'unknown' }, data).blockReasonKeys, ['unknownMapping']);
  const altered = withMutatedCatalog(copy => {
    const definitions = copy.deadlineDefinitions as Record<string, unknown>[];
    definitions.push({ ...definitions.find(item => item.deadlineDefinitionId === 'AP17C-SOC-IV-PRE-001')! });
  });
  assert.deepEqual(calculateQualifiedSpecialDeadline(displayedModelInput, altered).blockReasonKeys, ['unknownMapping']);
});

test('direct special calls cannot omit the qualified context', () => {
  const { applicabilityContext, ...without } = special();
  assert.ok(applicabilityContext);
  assert.deepEqual(calculateSpecialDeadline(without, data).blockReasonKeys, ['applicabilityContextMissing']);
});

test('direct special calls revalidate all negative qualified cases', () => {
  for (const reference of corpus.referenceCases.filter(item => item.expected.status === 'blocked')) {
    const positive = corpus.referenceCases.find(item => item.mappingId === reference.mappingId && item.expected.status !== 'blocked');
    if (!positive) continue;
    const original = special({ mappingId: positive.mappingId, ...positive.input } as QualifiedDeadlineInput);
    const altered = { ...original, applicabilityContext: { mappingId: reference.mappingId, ...reference.input } as QualifiedDeadlineInput };
    assert.equal(calculateSpecialDeadline(altered, data).outcome, 'blocked', reference.id);
  }
});

test('direct special calls cannot change the trigger date or inject duration', () => {
  const original = special();
  assert.deepEqual(calculateSpecialDeadline({ ...original, dateValues: { legalTriggerDate: '2026-10-01' } }, data).blockReasonKeys, ['applicabilityInputMismatch']);
  assert.deepEqual(calculateSpecialDeadline({ ...original, integerValues: { deadlineDays: 30 } }, data).blockReasonKeys, ['applicabilityInputMismatch']);
});

test('component changes and override confirmations do not bypass applicability', () => {
  const original = special();
  for (const patch of [{ calendarProfileId: 'C_BE' }, { suspensionProfileId: 'S0_NONE' }, { filingProfileId: 'F1_DISPATCH' }]) {
    assert.deepEqual(calculateSpecialDeadline({ ...original, ...patch }, data).blockReasonKeys, ['componentProfileMismatch']);
  }
  assert.deepEqual(calculateSpecialDeadline({ ...original, overrideConfirmations: ['bypass'] }, data).blockReasonKeys, ['unexpectedOverrideConfirmation']);
});

test('qualified context cannot be carried into an unrelated general regime', () => {
  const original = special();
  assert.equal(calculateSpecialDeadline({ ...original, regimeId: 'vrpg-be-general', ruleId: 'VRPGBE-SPEC-REL-GENERAL-001' }, data).outcome, 'blocked');
});

test('technical coverage rejects both triggers and final deadlines outside 2026–2027', () => {
  for (const legalTriggerDate of ['2025-12-31', '2028-01-01', '2027-12-10']) {
    const result = calculateQualifiedSpecialDeadline({ ...goodInput, legalTriggerDate }, data);
    assert.equal(result.outcome, 'blocked');
    assert.deepEqual(result.blockReasonKeys, ['applicabilityDateOutsideValidity']);
  }
});

test('qualified channel is explicit when supplied and fiction cannot be asserted as ordinary service', () => {
  for (const notificationChannel of ['', 'unresolved', 'deliveryFiction', 'official-publication']) {
    assert.equal(calculateQualifiedSpecialDeadline({ ...goodInput, notificationChannel }, data).outcome, 'blocked');
  }
  assert.equal(calculateQualifiedSpecialDeadline({ ...goodInput, notificationChannel: 'individual-service' }, data).outcome, 'calculated');
});

test('candidate definitions cannot be activated by the approved data release', () => {
  assert.equal(calculateQualifiedSpecialDeadline(goodInput, approved).outcome, 'blocked');
  assert.equal(manifest.releaseStatus, 'candidate');
  assert.equal(manifest.extensions['steimer.candidate'].productionActivation, false);
  assert.equal(manifest.extensions['steimer.candidate'].humanIntegrationApproval, null);
  assert.equal(Object.hasOwn(manifest.extensions, 'steimer.approval'), false);
});

test('candidate retains exactly 16 distinct mappings and four blocked paths', () => {
  const definitions = catalog.deadlineDefinitions.filter(item => item.deadlineOrigin === 'CALCULATED' && 'applicability' in item && item.applicability !== null);
  assert.equal(definitions.length, 16);
  assert.equal(catalog.blockedMappings.length, 4);
  assert.deepEqual([...new Set(definitions.map(item => 'applicability' in item ? item.applicability?.mappingId : null))].sort(), corpus.mappings.filter(item => item.disposition === 'candidate').map(item => item.id).sort());
});

test('candidate source references and announced future versions resolve', () => {
  const sourceIds = new Set(catalog.sources.map(source => source.sourceId));
  for (const definition of catalog.deadlineDefinitions) {
    for (const source of definition.sourceRefs) assert.ok(sourceIds.has(source.sourceId), source.sourceId);
  }
  for (const id of ['SRC-AP17C-IVG-20270101', 'SRC-AP17C-AHVG-20270101', 'SRC-AP17C-IVV-20270701']) assert.ok(sourceIds.has(id));
});

test('v3 construction and direct calls fail closed if a required guard is removed', () => {
  const copied = JSON.parse(JSON.stringify(release)) as ValidatedReleaseLike;
  const component = copied.artifacts.find(item => item.descriptor.role === 'specialRegimeCatalog')!.parsed as { deadlineDefinitions: { deadlineDefinitionId: string; applicability?: unknown }[] };
  delete component.deadlineDefinitions.find(item => item.deadlineDefinitionId === 'AP17C-SOC-IV-PRE-001')!.applicability;
  assert.throws(() => createCalculationData(copied), /Anwendbarkeitsvertrag/);
});

test('archival reference corpus remains byte-identical to David Steimer’s AP17B acceptance', () => {
  const bytes = readFileSync(new URL('../golden/candidates/ap17b-anwendbarkeit.json', import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), 'd180d6c7dd67f30bf8abe9b101878b22b1e455ad42bbd2ca633b1ee4487b5f47');
});

test('candidate artifact bytes match their manifest descriptors', () => {
  for (const descriptor of manifest.artifacts) {
    const bytes = readFileSync(new URL(`../../data/releases/${manifest.releaseId}/${descriptor.path}`, import.meta.url));
    assert.equal(bytes.length, descriptor.byteLength);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), descriptor.sha256);
  }
});

test('the five ordinary legal profiles and both calendars are byte-identical to the approved base', () => {
  for (const descriptor of manifest.artifacts.filter(item => item.role !== 'specialRegimeCatalog')) {
    const candidate = readFileSync(new URL(`../../data/releases/${manifest.releaseId}/${descriptor.path}`, import.meta.url));
    const base = readFileSync(new URL(`../../data/releases/2026-08-31-mvp-03-approved.1/${descriptor.path}`, import.meta.url));
    assert.deepEqual(candidate, base);
  }
});

test('future comparison sources are not presented as additionally applied legal norms', () => {
  const futureIds = new Set(manifest.extensions['steimer.candidate'].futureSourceComparison.sourceIds);
  const result = calculateQualifiedSpecialDeadline(goodInput, data);
  assert.ok(result.qualifiedCalculation?.sourceRefs.every(source => !futureIds.has(source.sourceId)));
});

function withMutatedCatalog(mutate: (copy: Record<string, unknown>) => void): CalculationData {
  const copy = JSON.parse(JSON.stringify(catalog)) as Record<string, unknown>;
  mutate(copy);
  return { ...data, specialRegimeCatalogs: new Map([[catalog.catalogId, copy as unknown as SpecialRegimeCatalog]]) };
}

test('downgrading qualified identities to v2 cannot remove their mandatory guard', () => {
  const altered = withMutatedCatalog(copy => {
    copy.formatVersion = '2.0.0';
    const definition = (copy.deadlineDefinitions as Record<string, unknown>[])
      .find(item => item.deadlineDefinitionId === 'AP17C-SOC-IV-PRE-001')!;
    delete definition.applicability;
  });
  const { applicabilityContext, ...without } = special();
  assert.ok(applicabilityContext);
  assert.deepEqual(calculateSpecialDeadline(without, altered).blockReasonKeys, ['qualifiedCatalogVersionUnsupported']);
  const releaseCopy: ValidatedReleaseLike = {
    ...release,
    artifacts: release.artifacts.map(artifact => artifact.descriptor.role === 'specialRegimeCatalog'
      ? { ...artifact, parsed: [...altered.specialRegimeCatalogs.values()][0] }
      : artifact)
  };
  assert.throws(() => createCalculationData(releaseCopy), /Spezialkatalogformat 3/);
});

for (const [group, field, value] of [
  ['validity', 'dataValidFrom', ''],
  ['validity', 'dataValidFrom', null],
  ['validity', 'dataValidTo', ''],
  ['validity', 'dataValidTo', '2026-02-30'],
  ['validity', 'dataValidTo', '2025-12-31'],
  ['validity', 'legalEffectiveFrom', ''],
  ['applicability', 'procedureStartOnOrAfter', ''],
  ['applicability', 'procedureStartOnOrAfter', '2022-02-30'],
  ['applicability', 'caseCoverageFrom', ''],
  ['applicability', 'caseCoverageTo', ''],
  ['applicability', 'caseCoverageTo', '2025-12-31'],
  ['applicability', 'notificationChannels', null],
  ['applicability', 'holidayPolicy', 'unsupported']
] as const) {
  test(`malformed contract ${group}.${field}=${JSON.stringify(value)} blocks without throwing`, () => {
    const altered = withMutatedCatalog(copy => {
      const definition = (copy.deadlineDefinitions as Record<string, unknown>[])
        .find(item => item.deadlineDefinitionId === 'AP17C-SOC-IV-PRE-001')!;
      (definition[group] as Record<string, unknown>)[field] = value;
    });
    assert.deepEqual(calculateQualifiedSpecialDeadline(goodInput, altered).blockReasonKeys, ['applicabilityContractInvalid']);
    assert.deepEqual(calculateSpecialDeadline(special(), altered).blockReasonKeys, ['applicabilityContractInvalid']);
  });
}
