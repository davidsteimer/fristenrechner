// SPDX-License-Identifier: AGPL-3.0-only
// Actual native Format17/9 UI helpers. Synthetic approvals exist only in memory.
import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateSocialDeadline } from '../../src/core/socialDeadline';
import type { CalculationData } from '../../src/core';
import { hasSocialUi, SOCIAL_UI_LAWS, EMPTY_SOCIAL_CONTEXT, socialInputFromUi, socialNeedsJurisdictionDate,
  socialUiPath, socialUiSelection } from '../../src/ui/socialUi';
import { changeVrpgSelection, resolveVrpgSelection, sanitizeVrpgSelection, vrpgActionOptions, vrpgLawOptions } from '../../src/ui/vrpgSelection';
import { emptyAdministrativePreferences, initializeAdministrativeDefaults, saveAdministrativeDefaults } from '../../src/ui/administrativeDefaults';
import { createDeadlineCalendarEntry } from '../../src/ui/calendarExport';
import { r10u1Actual17, r10u1Actual9, r10u1SyntheticApproved17, r10u1Catalog, r10u1State,
  r10u1Context, r10u1Selection } from './r10-u1-social-fixtures';

const actual = r10u1Actual17.data, prior = r10u1Actual9.data, approved = r10u1SyntheticApproved17.data;
const catalog = r10u1Catalog(actual), oldCatalog = r10u1Catalog(prior);

test('R10-U1: genuine Format17 and Format9 expose the same11 explicit laws,44 rules and50 BE bindings', () => {
  assert.equal(actual.formatVersion, '17.0.0'); assert.equal(prior.formatVersion, '9.0.0');
  assert.equal(hasSocialUi(actual), true); assert.equal(hasSocialUi(prior), true);
  assert.equal(catalog.federalRules.length, 44); assert.equal(catalog.cantonalBindings.length, 50);
  assert.deepEqual(catalog.federalRules, oldCatalog.federalRules, 'No legal rule was changed by the UI correction');
  assert.deepEqual(catalog.cantonalBindings, oldCatalog.cantonalBindings, 'No jurisdiction or calendar facts were changed');
  const state = { area: 'social', law: '', action: '', stage: '' } as const;
  assert.deepEqual(vrpgLawOptions(state, actual).map(option => option.key), ['', ...SOCIAL_UI_LAWS]);
  assert.deepEqual(vrpgLawOptions(state, actual), vrpgLawOptions(state, prior));
});

for (const rule of catalog.federalRules) test(`R10-U1 ${rule.ruleId}: actual17 choice and V5 defaults retain stable selection only`, () => {
  const state = r10u1State(rule), current = socialUiPath(actual, state), old = socialUiPath(prior, state);
  assert.ok(current); assert.ok(old); assert.equal(current.rule.ruleId, rule.ruleId);
  assert.equal(resolveVrpgSelection(actual, state).kind, 'social');
  assert.deepEqual(vrpgActionOptions(actual, state), vrpgActionOptions(prior, state));
  assert.deepEqual(current.selections.map(row => row.binding.bindingId), old.selections.map(row => row.binding.bindingId));
  assert.deepEqual(sanitizeVrpgSelection(actual, state), state);
  assert.equal(changeVrpgSelection(actual, state, 'law', state.law === 'ivg' ? 'ahvg' : 'ivg').action, '');
  const values = new Map<string,string>([['fristenrechner.defaults.v1', 'untouched-foreign-legacy-value']]);
  const storage = { getItem: (key:string) => values.get(key) ?? null, setItem: (key:string, value:string) => { values.set(key,value); } };
  const context = { legacyData: actual, administrativeData: r10u1Actual17.administrativeContext };
  const prefs = { ...emptyAdministrativePreferences(), authorityCode: 'BE',
    procedureSelection: { kind: 'legacyProfile', profileId: 'vrpg-be' } as const, vrpgSelection: state,
    inputDate: '2026-09-16', calendarReference: 'SYNTHETIC-DO-NOT-STORE',
    socialContext: r10u1Context(current.selections[0]!.binding), caseFacts: { competentBodyQualified: true } };
  assert.equal(saveAdministrativeDefaults(context, storage, prefs).persistence, 'stored');
  const raw = values.get('fristenrechner.defaults.v5')!;
  assert.doesNotMatch(raw, /inputDate|calendarReference|SYNTHETIC-DO-NOT-STORE|socialContext|caseFacts|jurisdictionCanton|partyDomicileCanton|jurisdictionReferenceDate|competentBodyQualified|2026-09-16/);
  const reloaded = initializeAdministrativeDefaults(context, storage);
  assert.deepEqual(reloaded.preferences.vrpgSelection, state); assert.equal(reloaded.legalQualification, false);
  assert.equal(values.get('fristenrechner.defaults.v1'), 'untouched-foreign-legacy-value');
  const compatible = initializeAdministrativeDefaults({ legacyData: prior, administrativeData: r10u1Actual9.administrativeContext }, storage);
  assert.deepEqual(compatible.preferences.vrpgSelection, state);
});

for (const binding of catalog.cantonalBindings) test(`R10-U1 ${binding.bindingId}: actual17 UI routes exact current facts, reference host gate, synthetic approval and missing-fact gates`, () => {
  const current = r10u1Selection(actual, binding), synthetic = r10u1Selection(approved, binding), old = r10u1Selection(prior, binding);
  const context = r10u1Context(binding);
  const currentInput = socialInputFromUi(current, 'BE', '2026-09-16', '10', context);
  assert.deepEqual(Object.keys(currentInput.caseFacts).sort(), current.route.requiredFacts.map(fact => fact.factKey).sort());
  assert.equal(currentInput.bindingId, binding.bindingId);
  assert.equal(socialNeedsJurisdictionDate(current), Object.hasOwn(currentInput, 'jurisdictionReferenceDate'));
  const localResult = calculateSocialDeadline(currentInput, actual);
  assert.equal(localResult.outcome, 'calculated', 'Existing approved social rules remain usable for local reference calculations');
  assert.equal(r10u1Actual17.calendarRuntime.referenceOnly, true, 'The local host must independently suppress export');
  const input = socialInputFromUi(synthetic, 'BE', '2026-09-16', '10', context);
  const result = calculateSocialDeadline(input, approved);
  assert.equal(result.outcome, 'calculated', JSON.stringify(result.blockReasonKeys));
  const expected = synthetic.rule.calculation.durationInputId ? '2026-09-28' : '2026-10-16';
  assert.equal(localResult.finalDeadline?.date, expected);
  assert.equal(result.finalDeadline?.date, expected);
  const oldResult = calculateSocialDeadline(socialInputFromUi(old, 'BE', '2026-09-16', '10', context), prior);
  assert.equal(oldResult.finalDeadline?.date, expected, 'Actual approved Format9 remains compatible');
  for (const fact of synthetic.route.requiredFacts) {
    const missing = { ...input, caseFacts: { ...input.caseFacts } }; delete missing.caseFacts[fact.factKey];
    assert.equal(calculateSocialDeadline(missing, approved).outcome, 'blocked', `${binding.bindingId}: missing ${fact.factKey}`);
  }
  for (const invalid of [socialInputFromUi(synthetic, 'BE', '2026-09-16', '10', EMPTY_SOCIAL_CONTEXT),
    socialInputFromUi(synthetic, 'ZH', '2026-09-16', '10', context),
    socialInputFromUi(synthetic, 'BE', '', '10', context),
    socialInputFromUi(synthetic, 'BE', '2028-01-02', '10', context),
    socialInputFromUi(synthetic, 'BE', '2026-09-16', '10', { ...context, holidayConnections: '' })]) {
    const blocked = calculateSocialDeadline(invalid, approved); assert.equal(blocked.outcome, 'blocked'); assert.equal(blocked.finalDeadline, undefined);
  }
  if (synthetic.rule.calculation.durationInputId) {
    for (const days of ['', '0', '366', '1.5']) assert.equal(calculateSocialDeadline(socialInputFromUi(synthetic, 'BE', '2026-09-16', days, context), approved).outcome, 'blocked');
  } else {
    assert.equal(Object.hasOwn(input, 'days'), false);
    assert.equal(calculateSocialDeadline(socialInputFromUi(synthetic, 'BE', '2026-09-16', '999', context), approved).finalDeadline?.date, expected);
  }
  // In-memory strings only. This does not bypass the app's separate local-reference export gate.
  for (const locale of ['de','fr'] as const) {
    const entry = createDeadlineCalendarEntry({ deadlineDate: result.finalDeadline!.date, locale,
      reference: `SYNTHETIC-R10-U1-${binding.bindingId}`, uid: `r10-u1-${binding.bindingId}-${locale}`, createdAt: new Date('2026-10-28T12:00:00Z') });
    assert.match(entry.content, new RegExp('DTSTART;VALUE=DATE:' + expected.replace(/-/g,'')));
    assert.match(entry.content, /TRIGGER:-PT112H/); assert.match(entry.content, /CATEGORIES:Fristablauf/);
  }
});

test('R10-U1 unknown formats and absent/multiple catalogs do not open the integrated social UI', () => {
  for (const data of [{ ...actual, formatVersion: '99.0.0' }, { ...actual, socialProcedureCatalogs: undefined },
    { ...actual, socialProcedureCatalogs: new Map() }, { ...actual, socialProcedureCatalogs: new Map([[catalog.catalogId,catalog],['foreign',catalog]]) }] as CalculationData[]) {
    assert.equal(hasSocialUi(data), false);
    for (const rule of catalog.federalRules) assert.equal(socialUiPath(data, r10u1State(rule)), undefined);
  }
});

test('R10-U1 substituted foreign catalog or copied runtime data cannot authorize a social calculation', () => {
  const binding = catalog.cantonalBindings[0]!, selection = r10u1Selection(approved,binding);
  const input = socialInputFromUi(selection,'BE','2026-09-16','10',r10u1Context(binding));
  for (const data of [{ ...approved, socialProcedureCatalogs: new Map([[oldCatalog.catalogId,oldCatalog]]) },
    { ...actual, socialProcedureCatalogs: new Map([[catalog.catalogId,structuredClone(catalog)]]) },
    { ...approved, formatVersion: '99.0.0' }] as CalculationData[]) {
    const result = calculateSocialDeadline(input,data); assert.equal(result.outcome,'blocked'); assert.equal(result.finalDeadline,undefined);
  }
  assert.equal(socialUiSelection(actual,{ area:'social',law:'foreign',action:'objection',stage:'' }),undefined);
  for (const rule of catalog.federalRules) {
    assert.equal(socialUiPath(actual,{ ...r10u1State(rule),action:'not-modeled' }),undefined);
    assert.equal(socialUiPath(actual,{ ...r10u1State(rule),stage:'foreign-court' }),undefined);
  }
});
