// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {createCalculationData} from '../../src/core/data';
import {assertSocialProcedureCatalog, socialFactValid, socialObjectSha256, validateSocialCatalogReferences} from '../../src/core/socialCatalog';
import {calculateSocialDeadline} from '../../src/core/socialDeadline';
import type {SocialDeadlineInput, SocialProcedureCatalog} from '../../src/core/socialTypes';
import type {ValidatedReleaseLike} from '../../src/core/types';
import {mvp05CalculationData, mvp05Release} from '../../src/release/mvp05ReleaseData';

type Mutable<T> = T extends readonly (infer U)[] ? Mutable<U>[] : T extends object ? {-readonly [P in keyof T]: Mutable<T[P]>} : T;
const schemaBase = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
function v2(): Mutable<SocialProcedureCatalog> {
  const catalog = JSON.parse(JSON.stringify(mvp05CalculationData.socialProcedureCatalogs!.get('ch-social-procedures'))) as Mutable<SocialProcedureCatalog>;
  catalog.formatVersion = '2.0.0';
  catalog.$schema = `${schemaBase}social-procedure-catalog-v2.schema.json`;
  return catalog;
}
function releaseFor(catalog: SocialProcedureCatalog, formatVersion = '6.0.0'): ValidatedReleaseLike {
  return {...mvp05Release, formatVersion, artifacts: mvp05Release.artifacts.map(artifact => artifact.descriptor.role === 'socialProcedureCatalog'
    ? {...artifact, parsed: catalog, descriptor: {...artifact.descriptor, schemaId: catalog.$schema}} : artifact)};
}
function inputFor(catalog: SocialProcedureCatalog, bindingIndex: number): SocialDeadlineInput {
  const binding = catalog.cantonalBindings[bindingIndex]!;
  const rule = catalog.federalRules.find(r => r.ruleId === binding.ruleId)!;
  const route = binding.contextRoutes[0]!;
  return {
    ruleId: rule.ruleId, bindingId: binding.bindingId, contextRouteId: route.contextRouteId,
    procedureContextCanton: 'BE', caseFacts: Object.fromEntries(route.requiredFacts.map(f => [f.factKey, f.allowedValues[0]])),
    qualificationBasis: 'displayed-model-scope', matter: rule.matter, triggerKind: rule.triggerKind,
    notificationChannel: 'individual-service', notificationConfirmed: false, legalTriggerDate: '2026-09-16',
    ...([...rule.normBindings, ...binding.normBindings].some(n => n.temporalSelector === 'jurisdictionReferenceDate') ? {jurisdictionReferenceDate: '2026-09-16'} : {}),
    ...(rule.calculation.durationInputId ? {days: 10} : {}),
    holidayResolution: {status: 'resolved', calendarBindingId: 'be-party', anchors: [{role: 'party', canton: 'BE', spatialScopeId: 'BE'}]}
  };
}

test('component 2 has an explicit schema pair and retains exact existing objects', () => {
  const next = v2(), prior = mvp05CalculationData.socialProcedureCatalogs!.get('ch-social-procedures')!;
  assert.doesNotThrow(() => assertSocialProcedureCatalog(next));
  assert.deepEqual(next.federalRules.map(socialObjectSha256), prior.federalRules.map(socialObjectSha256));
  assert.deepEqual(next.cantonalBindings.map(socialObjectSha256), prior.cantonalBindings.map(socialObjectSha256));
  for (const [formatVersion, schema] of [['1.0.0', 'social-procedure-catalog-v2.schema.json'], ['2.0.0', 'social-procedure-catalog.schema.json'], ['2.1.0', 'social-procedure-catalog-v2.schema.json'], ['3.0.0', 'social-procedure-catalog-v2.schema.json']]) {
    assert.throws(() => assertSocialProcedureCatalog({...next, formatVersion, $schema: schemaBase + schema}));
  }
});

test('component 2 extends only the closed laws, fact domains and origin values from DEC-2026-026', () => {
  for (const law of ['eog','famzg','flg','mvg','uelg'] as const) {
    const next = v2(); next.releaseEligibility = []; next.federalRules[0]!.law = law;
    assert.doesNotThrow(() => assertSocialProcedureCatalog(next));
    assert.throws(() => assertSocialProcedureCatalog({...next, formatVersion: '1.0.0', $schema: schemaBase + 'social-procedure-catalog.schema.json'}));
  }
  for (const [key, good, bad] of [
    ['eogOfficeType','cantonal','BE'], ['eogOfficeType','nonCantonal','unknown'],
    ['compensationOfficeCanton','BE','CH'], ['familyAllowanceOrderCanton','TI',''], ['uelgAdministrativeCanton','GR','unknown'],
    ['decisionOrigin','familyCompensationOffice','familyOffice'], ['decisionOrigin','militaryInsurer','militaryOffice']
  ]) {
    assert.equal(socialFactValid(key!, good, '2.0.0'), true, key!);
    assert.equal(socialFactValid(key!, good, '1.0.0'), false, key!);
    assert.equal(socialFactValid(key!, bad, '2.0.0'), false, key!);
    assert.equal(socialFactValid(key!, true, '2.0.0'), false, key!);
  }
  assert.equal(socialFactValid('not-a-fact', 'BE', '2.0.0'), false);
  const bad = v2(); bad.releaseEligibility = []; (bad.federalRules[0] as unknown as {law:string}).law = 'bvg';
  assert.throws(() => assertSocialProcedureCatalog(bad));
});

test('manifest 6 and social component 2 are inseparable at the product boundary', () => {
  const next = v2();
  assert.doesNotThrow(() => createCalculationData(releaseFor(next)));
  assert.throws(() => createCalculationData(releaseFor(next, '5.0.0')), /version mismatch/);
  assert.throws(() => createCalculationData({...mvp05Release, formatVersion: '6.0.0'}), /version mismatch/);
  for (const formatVersion of ['6.0.1','6.1.0','7.0.0']) assert.throws(() => createCalculationData(releaseFor(next, formatVersion)));
  assert.throws(() => validateSocialCatalogReferences(next, mvp05CalculationData), /version mismatch/);
});

test('all 28 unchanged approved old bindings produce byte-equivalent results under the new consumer', () => {
  // Synthetic envelope only. No new release or copied approval is written to disk.
  const prior = mvp05CalculationData.socialProcedureCatalogs!.get('ch-social-procedures')!;
  const upgraded = createCalculationData(releaseFor(v2()));
  assert.equal(prior.cantonalBindings.length, 28);
  for (let i = 0; i < prior.cantonalBindings.length; i++) {
    const input = inputFor(prior, i);
    const expected = calculateSocialDeadline(input, mvp05CalculationData);
    assert.equal(expected.outcome, 'calculated', input.bindingId);
    assert.deepEqual(calculateSocialDeadline(input, upgraded), expected, input.bindingId);
    // New v2 facts never become implicitly applicable to old routes.
    assert.equal(calculateSocialDeadline({...input, caseFacts: {...input.caseFacts, eogOfficeType: 'cantonal'}}, upgraded).outcome, 'blocked');
  }
});

const oldReleases = [
  ['2026-08-29-ap5-approved.1','1.0.0'], ['2026-08-31-mvp-02-approved.1','2.0.0'],
  ['2026-08-31-mvp-03-approved.1','3.0.0'], ['2026-09-22-mvp-04-approved.1','4.0.0'],
  ['2026-09-28-mvp-05-approved.1','5.0.0']
];
for (const [id, format] of oldReleases) test(`consumer 6 preserves frozen release ${format} / ${id}`, () => {
  const directory = `data/releases/${id}`;
  const manifest = JSON.parse(readFileSync(`${directory}/manifest.json`,'utf8'));
  const envelope: ValidatedReleaseLike = {
    releaseId: manifest.releaseId, formatVersion: manifest.formatVersion, coverageFrom: manifest.coverage.from, coverageTo: manifest.coverage.to,
    profileIds: manifest.profileIds, calendarIds: manifest.calendarIds,
    ...(manifest.specialRegimeCatalogIds ? {specialRegimeCatalogIds: manifest.specialRegimeCatalogIds} : {}),
    ...(manifest.holidayCatalogIds ? {holidayCatalogIds: manifest.holidayCatalogIds} : {}),
    ...(manifest.socialProcedureCatalogIds ? {socialProcedureCatalogIds: manifest.socialProcedureCatalogIds} : {}),
    artifacts: manifest.artifacts.map((descriptor: {path: string}) => ({descriptor, parsed: JSON.parse(readFileSync(`${directory}/${descriptor.path}`,'utf8'))}))
  };
  const result = createCalculationData(envelope);
  assert.equal(result.releaseId, id); assert.equal(result.formatVersion, format); assert.equal(result.profiles.size, 5);
});
