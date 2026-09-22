// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateDeadline, calculateSpecialDeadline } from '../../src/core';
import { ap17cCandidateCalculationData as data } from '../../src/release/ap17cCandidateData';
import { approvedMvp03CalculationData as approved } from '../../src/release/approvedMvp03Data';
import { createCalculationInput, createSpecialCalculationInput, type CalculatorFormState } from '../../src/ui/model';
import { initialDefaults, sanitizeDefaults, saveDefaults, type StorageLike } from '../../src/ui/defaults';
import { resolveVrpgSelection, type VrpgSelectionState } from '../../src/ui/vrpgSelection';
import {
  EMPTY_VRPG_CONTEXT, qualifiedInputFromForm, vrpgMatterOptions, vrpgTriggerOptions,
  vrpgNotificationOptions, vrpgHolidayOptions, vrpgModelScope, type VrpgContextState
} from '../../src/ui/vrpgQualification';
import { qualifiedMessages } from '../../src/ui/qualifiedMessages';
import { translate, translateBlockReason } from '../../src/ui/i18n';
import corpus from '../golden/candidates/ap17b-anwendbarkeit.json';

const positives = corpus.referenceCases.filter(item => item.expected.status !== 'blocked');
function formFor(reference: typeof positives[number]): CalculatorFormState {
  const mapping = corpus.mappings.find(item => item.id === reference.mappingId)!;
  const selection = mapping.selection as VrpgSelectionState;
  const resolved = resolveVrpgSelection(data, selection);
  const input = reference.input;
  return {
    authorityCode: input.authorityCode,
    profileId: 'vrpg-be',
    inputDate: '', deadlineDays: '999',
    selectors: { deliveryMethod: 'otherLegallyRelevantDate', specialLawStatus: 'noKnownOverride' },
    calendarId: 'be-public-holidays', calendarOverrideReason: '', additionalHolidayAnchor: '',
    holidayAnchorConfirmed: false, deliveryFictionConfirmed: false, specialLawChecked: false,
    specialRegimeId: resolved.regimeId, specialDefinitionId: resolved.definitionId,
    specialDateValues: { legalTriggerDate: input.legalTriggerDate ?? '' },
    specialIntegerValues: 'days' in input ? { deadlineDays: String(input.days) } : {},
    specialLocalTimeValues: {}, specialOverrideConfirmations: [], vrpgSelection: selection,
    vrpgContext: {
      notificationChannel: selection.area === 'social' ? ''
        : 'notificationChannel' in input ? input.notificationChannel! : 'individual-service',
      holidayConnections: selection.area === 'social' ? 'partyAndRepresentativeBE' : '',
      procedureStartDate: 'procedureStartDate' in input ? input.procedureStartDate! : ''
    }
  };
}

for (const reference of positives) {
  test(`${reference.id} passes through the UI adapter with displayed scope and explicit case facts`, () => {
    const form = formFor(reference);
    assert.equal(resolveVrpgSelection(data, form.vrpgSelection!).kind, 'special');
    assert.equal(resolveVrpgSelection(approved, form.vrpgSelection!).kind, 'unavailable');
    const input = createSpecialCalculationInput(data, form);
    assert.ok(input?.applicabilityContext);
    assert.equal(input.applicabilityContext.qualificationBasis, 'displayed-model-scope');
    assert.equal(input.applicabilityContext.matter, reference.input.matter);
    assert.equal(input.applicabilityContext.triggerKind, reference.input.triggerKind);
    assert.equal(input.applicabilityContext.notificationConfirmed, form.vrpgSelection!.area === 'procurement');
    if (form.vrpgSelection!.area === 'social') {
      assert.equal(form.vrpgContext!.notificationChannel, '');
      assert.equal(input.applicabilityContext.notificationChannel, 'individual-service');
    }
    const result = calculateSpecialDeadline(input, data);
    assert.equal(result.outcome, 'calculated');
    assert.equal(result.finalDeadline?.date, reference.expected.finalEnd);
    assert.equal(result.provisionalDeadline?.date, reference.expected.rawEnd);
    assert.equal(result.qualifiedCalculation?.firstCountedDay, reference.expected.firstCountedDay);
    assert.equal(result.qualifiedCalculation?.suspensionDays, reference.expected.suspensionDays);
    assert.equal(calculateDeadline(createCalculationInput(data, form), data).outcome, 'blocked');
  });
}

test('candidate selection contains exactly 16 supported mappings and 4 blocked collection paths', () => {
  assert.equal(corpus.mappings.filter(mapping => resolveVrpgSelection(data, mapping.selection as VrpgSelectionState).kind === 'special').length, 16);
  for (const mapping of corpus.mappings.filter(item => item.disposition === 'blocked')) {
    assert.equal(resolveVrpgSelection(data, mapping.selection as VrpgSelectionState).kind, 'unavailable');
  }
});

test('fixed model scope exists only for exact supported mappings and does not hide a real notification choice', () => {
  for (const mapping of corpus.mappings) {
    const selection = mapping.selection as VrpgSelectionState;
    const scope = vrpgModelScope(selection);
    if (mapping.disposition !== 'candidate') {
      assert.equal(scope, undefined);
      continue;
    }
    assert.ok(scope);
    assert.equal(scope.matter.key, mapping.requiredContext?.matter);
    assert.equal(scope.triggerKind.key, mapping.requiredContext?.triggerKind);
    assert.equal(scope.notification?.key, selection.area === 'social' ? 'individual-service' : undefined);
  }
});

test('missing, incompatible or unconfirmed case facts cannot inherit old approvals', () => {
  const base = formFor(positives[0]!);
  const contexts: VrpgContextState[] = [EMPTY_VRPG_CONTEXT,
    ...['', 'otherOrUnclear'].map(holidayConnections => ({ ...base.vrpgContext!, holidayConnections })),
    ...['otherOrUnclear', 'unresolved', 'official-publication']
      .map(notificationChannel => ({ ...base.vrpgContext!, notificationChannel }))];
  for (const vrpgContext of contexts) {
    const form = { ...base, vrpgContext, holidayAnchorConfirmed: true, deliveryFictionConfirmed: true, specialLawChecked: true };
    const input = createSpecialCalculationInput(data, form);
    assert.ok(input);
    const result = calculateSpecialDeadline(input, data);
    assert.equal(result.outcome, 'blocked');
    assert.equal(result.finalDeadline, undefined);
    for (const locale of ['de', 'fr'] as const) {
      result.blockReasonKeys.forEach(reason => assert.notEqual(translateBlockReason(locale, reason), reason));
    }
  }
});

test('fixed social scope is displayed without fabricating a user notification confirmation', () => {
  const base = formFor(positives[0]!);
  const input = createSpecialCalculationInput(data, base);
  assert.ok(input?.applicabilityContext);
  assert.equal(input.applicabilityContext.qualificationBasis, 'displayed-model-scope');
  assert.equal(input.applicabilityContext.notificationChannel, 'individual-service');
  assert.equal(input.applicabilityContext.notificationConfirmed, false);
  assert.equal(calculateSpecialDeadline(input, data).outcome, 'calculated');
});

test('legacy or injected matter and trigger values cannot replace the displayed model scope', () => {
  const base = formFor(positives[0]!);
  const expected = createSpecialCalculationInput(data, base);
  const staleContext = { ...base.vrpgContext!, matter: 'otherOrUnclear', triggerKind: 'foreign-document' };
  const actual = createSpecialCalculationInput(data, { ...base, vrpgContext: staleContext });
  assert.deepEqual(actual, expected);
  assert.ok(actual);
  assert.equal(calculateSpecialDeadline(actual, data).outcome, 'calculated');
});

test('injected notification publication is not accepted for fixed social insurance scope', () => {
  const base = formFor(positives[0]!);
  const input = createSpecialCalculationInput(data, { ...base, vrpgContext: { ...base.vrpgContext!, notificationChannel: 'official-publication' } });
  assert.ok(input);
  assert.equal(input.applicabilityContext?.notificationConfirmed, false);
  assert.equal(calculateSpecialDeadline(input, data).outcome, 'blocked');
});

test('procurement still requires an actual supported choice of notification channel', () => {
  const base = formFor(positives.find(item => item.mappingId === 'PROC-APPEAL')!);
  for (const notificationChannel of ['', 'unresolved', 'otherOrUnclear', 'foreign-channel']) {
    const input = createSpecialCalculationInput(data, { ...base, vrpgContext: { ...base.vrpgContext!, notificationChannel } });
    assert.ok(input?.applicabilityContext);
    assert.equal(input.applicabilityContext.notificationConfirmed, false);
    assert.equal(calculateSpecialDeadline(input, data).outcome, 'blocked');
  }
  for (const notificationChannel of ['individual-service', 'official-publication']) {
    const input = createSpecialCalculationInput(data, { ...base, vrpgContext: { ...base.vrpgContext!, notificationChannel } });
    assert.ok(input?.applicabilityContext);
    assert.equal(input.applicabilityContext.notificationConfirmed, true);
    assert.equal(calculateSpecialDeadline(input, data).outcome, 'calculated');
  }
});

test('procurement cannot derive a new-law start from receipt or from personal defaults', () => {
  const base = formFor(positives.find(item => item.mappingId === 'PROC-APPEAL')!);
  for (const procedureStartDate of ['', '2022-01-31', 'bad', '2027-01-01']) {
    const input = createSpecialCalculationInput(data, { ...base, vrpgContext: { ...base.vrpgContext!, procedureStartDate } });
    assert.ok(input);
    assert.equal(calculateSpecialDeadline(input, data).outcome, 'blocked');
  }
});

test('persists stable selections only and never silently migrates broad court to correction', () => {
  const base = formFor(positives[0]!);
  let saved = '';
  const storage: StorageLike = { getItem: () => saved, setItem: (_key, value) => { saved = value; }, removeItem: () => { saved = ''; } };
  const defaults = { ...initialDefaults(data), ...base, deadlineDays: 10, vrpgSelection: base.vrpgSelection! };
  assert.equal(saveDefaults(storage, defaults), true);
  assert.doesNotMatch(saved, /vrpgContext|notificationChannel|holidayConnections|procedureStartDate|2026-09-16|triggerKind|matter/);
  const loaded = sanitizeDefaults(data, JSON.parse(saved));
  assert.deepEqual(loaded.vrpgSelection, base.vrpgSelection);
  assert.equal('vrpgContext' in loaded, false);
  const broad = sanitizeDefaults(data, { ...defaults, vrpgSelection: { area: 'social', law: 'ivg', action: 'ongoing', stage: 'court' } });
  assert.equal(broad.vrpgSelection.action, 'ongoing');
  assert.equal(broad.specialDefinitionId, '');
  assert.equal(qualifiedInputFromForm(broad.vrpgSelection, EMPTY_VRPG_CONTEXT, 'BE', ''), undefined);
  const displayedOnly = qualifiedInputFromForm(loaded.vrpgSelection, EMPTY_VRPG_CONTEXT, 'BE', '2026-09-16');
  assert.ok(displayedOnly);
  assert.equal(displayedOnly.matter, positives[0]!.input.matter);
  assert.equal(displayedOnly.triggerKind, positives[0]!.input.triggerKind);
  assert.equal(displayedOnly.qualificationBasis, 'displayed-model-scope');
  assert.equal(displayedOnly.notificationConfirmed, false);
  assert.equal(displayedOnly.holidayAnchorConfirmed, false);
});

test('all qualified choices and messages have German and French labels', () => {
  for (const mapping of corpus.mappings.filter(item => item.disposition === 'candidate')) {
    const selection = mapping.selection as VrpgSelectionState;
    for (const choices of [vrpgMatterOptions(selection), vrpgTriggerOptions(selection), vrpgNotificationOptions(selection), vrpgHolidayOptions()]) {
      assert.equal(choices[0]?.key, '');
      choices.forEach(choice => { assert.ok(choice.labels.de); assert.ok(choice.labels.fr); });
    }
  }
  for (const key of Object.keys(qualifiedMessages)) {
    for (const locale of ['de', 'fr'] as const) assert.notEqual(translate(locale, key), key);
  }
});
