// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { CalculationData } from '../../src/core';
import { ap19cCandidateCalculationData as candidate } from '../../src/release/ap19cCandidateData';
import { mvp04CalculationData as released } from '../../src/release/mvp04ReleaseData';
import { primaryDateField, reconcilePrimaryDate } from '../../src/ui/dateTransition';
import { initialDefaults, loadDefaults, saveDefaults, type StorageLike } from '../../src/ui/defaults';
import type { CalculatorFormState } from '../../src/ui/model';
import { EMPTY_VRPG_CONTEXT, qualifiedInputFromForm } from '../../src/ui/vrpgQualification';
import { EMPTY_VRPG_SELECTION, resolveVrpgSelection, type VrpgSelectionState } from '../../src/ui/vrpgSelection';

const DATE = '2026-09-16';
const HIDDEN_DATE = '2025-04-03';

function form(overrides: Partial<CalculatorFormState> = {}): CalculatorFormState {
  return {
    authorityCode: 'BE', profileId: 'stpo', inputDate: '', deadlineDays: '10',
    selectors: { deliveryMethod: 'otherLegallyRelevantDate' }, calendarId: 'be-public-holidays',
    calendarOverrideReason: '', additionalHolidayAnchor: '', holidayAnchorConfirmed: false,
    deliveryFictionConfirmed: false, specialLawChecked: false, specialRegimeId: '', specialDefinitionId: '',
    specialDateValues: {}, specialLocalTimeValues: {}, specialIntegerValues: {}, specialOverrideConfirmations: [],
    ...overrides
  };
}

function selected(data: CalculationData, selection: VrpgSelectionState, overrides: Partial<CalculatorFormState> = {}): CalculatorFormState {
  const resolved = resolveVrpgSelection(data, selection);
  return form({ profileId: 'vrpg-be', vrpgSelection: selection, vrpgContext: EMPTY_VRPG_CONTEXT,
    specialRegimeId: resolved.regimeId, specialDefinitionId: resolved.definitionId, ...overrides });
}

const social = (law: string, action: string, stage = ''): VrpgSelectionState => ({ area: 'social', law, action, stage });
const political = (law: string, regime: string, definition: string): VrpgSelectionState => ({
  area: 'political', law, action: `${regime}::${definition}`, stage: ''
});
const procurement: VrpgSelectionState = { area: 'procurement', law: 'ivob', action: 'appeal', stage: '' };
const general: VrpgSelectionState = { area: 'general', law: '', action: '', stage: '' };

function withDate(data: CalculationData, state: CalculatorFormState, value = DATE): CalculatorFormState {
  const field = primaryDateField(data, state);
  return field.inputId ? { ...state, specialDateValues: { ...state.specialDateValues, [field.inputId]: value } }
    : { ...state, inputDate: value };
}

function changed(data: CalculationData, before: CalculatorFormState, next: CalculatorFormState): CalculatorFormState {
  return { ...next, ...reconcilePrimaryDate(data, before, next) };
}

for (const [name, data] of [['candidate', candidate], ['MVP 0.4', released]] as const) {
  test(`${name}: incomplete and unavailable selections accept a provisional service date without becoming calculable`, () => {
    for (const selection of [EMPTY_VRPG_SELECTION, social('', ''), social('ivg', ''),
      social('ivg', 'ongoing'), social('ivg', 'ongoing', 'court'), social('avig', 'appeal')]) {
      const next = selected(data, selection);
      assert.ok(['incomplete', 'unavailable'].includes(resolveVrpgSelection(data, selection).kind));
      assert.deepEqual(primaryDateField(data, next), { role: 'service', labelKey: 'form.inputDate.direct' });
      const result = reconcilePrimaryDate(data, form({ inputDate: DATE }), next);
      assert.equal(result.inputDate, DATE);
      assert.equal(result.cleared, false);
      assert.equal(result.field.inputId, undefined);
    }
  });

  test(`${name}: profile, general VRPG and non-date selector changes preserve service meaning`, () => {
    let current = form({ inputDate: DATE });
    for (const next of [form({ profileId: 'zpo', selectors: { procedureVariant: 'ordinary' } }),
      form({ profileId: 'bgg', authorityCode: 'CH', selectors: { subjectMatter: 'publicProcurement' } }),
      selected(data, general), form({ profileId: 'vwvg' }), form()]) {
      const result = reconcilePrimaryDate(data, current, next);
      assert.equal(result.inputDate, DATE);
      assert.equal(result.cleared, false);
      current = { ...next, ...result };
    }
  });

  test(`${name}: direct, failed registered delivery and observed ordinary mail remain distinct date roles`, () => {
    const methods = ['otherLegallyRelevantDate', 'registeredMailUncollected', 'ordinaryMailWeekendOrHoliday'];
    const roles = ['service', 'failedDeliveryAttemptDate', 'observedOrdinaryMailDeliveryDate'];
    for (const [beforeIndex, beforeMethod] of methods.entries()) {
      const before = form({ inputDate: DATE, selectors: { deliveryMethod: beforeMethod } });
      assert.equal(primaryDateField(data, before).role, roles[beforeIndex]);
      for (const [afterIndex, afterMethod] of methods.entries()) {
        const result = reconcilePrimaryDate(data, before, form({ selectors: { deliveryMethod: afterMethod } }));
        assert.equal(result.inputDate, beforeIndex === afterIndex ? DATE : '');
        assert.equal(result.cleared, beforeIndex !== afterIndex);
      }
    }
  });

  test(`${name}: political decision notice aliases service and transfers between input storage locations`, () => {
    const appeal = selected(data, political('communal', 'vrpg-be-81-2-municipal-appeal', 'VRPGBE-SPEC-REL-081'));
    assert.deepEqual(primaryDateField(data, appeal).inputId, 'decisionNoticeDate');
    assert.equal(primaryDateField(data, appeal).role, 'service');
    const inside = changed(data, form({ inputDate: DATE }), appeal);
    assert.equal(inside.inputDate, '');
    assert.deepEqual(inside.specialDateValues, { decisionNoticeDate: DATE });
    const outside = reconcilePrimaryDate(data, inside, form());
    assert.equal(outside.inputDate, DATE);
    assert.deepEqual(outside.specialDateValues, {});
    assert.equal(outside.cleared, false);
  });

  test(`${name}: same political poll anchor survives action change, but first-ballot anchor does not`, () => {
    const poll = selected(data, political('cantonal', 'prg-be-68-grand-council-nomination', 'PRGBE-SPEC-OFFSET-068'));
    const correction = selected(data, political('cantonal', 'prg-be-75-list-correction', 'PRGBE-SPEC-OFFSET-075'));
    const firstBallot = selected(data, political('cantonal', 'prg-be-110-second-ballot-withdrawal', 'PRGBE-SPEC-WEEKDAY-110'));
    const same = reconcilePrimaryDate(data, withDate(data, poll), correction);
    assert.equal(same.field.role, 'anchor:pollDate');
    assert.equal(same.specialDateValues.pollDate, DATE);
    assert.equal(same.cleared, false);
    const different = reconcilePrimaryDate(data, withDate(data, poll), firstBallot);
    assert.equal(different.field.role, 'anchor:firstBallotDate');
    assert.deepEqual(different.specialDateValues, { firstBallotDate: '' });
    assert.equal(different.cleared, true);
  });

  test(`${name}: preparatory-act knowledge is not individual service`, () => {
    const preparation = selected(data, political('communal', 'vrpg-be-67a-3-preparatory-act', 'VRPGBE-SPEC-REL-673'));
    assert.equal(primaryDateField(data, preparation).role, 'anchor:preparatoryActNoticeDate');
    assert.equal(reconcilePrimaryDate(data, form({ inputDate: DATE }), preparation).cleared, true);
    assert.equal(reconcilePrimaryDate(data, withDate(data, preparation), form()).inputDate, '');
    assert.equal(reconcilePrimaryDate(data, withDate(data, preparation), form()).cleared, true);
  });

  test(`${name}: procurement publication changes the role, not qualification or confirmation`, () => {
    const base = selected(data, procurement);
    const publication = { ...base, vrpgContext: { ...EMPTY_VRPG_CONTEXT, notificationChannel: 'official-publication' } };
    assert.equal(primaryDateField(data, publication).role, 'publication');
    assert.equal(reconcilePrimaryDate(data, form({ inputDate: DATE }), publication).cleared, true);
    for (const notificationChannel of ['', 'unresolved', 'individual-service']) {
      const next = { ...base, vrpgContext: { ...EMPTY_VRPG_CONTEXT, notificationChannel } };
      const service = reconcilePrimaryDate(data, form({ inputDate: DATE }), next);
      assert.equal(service.field.role, 'service');
      assert.equal(service.specialDateValues.legalTriggerDate, DATE);
      assert.equal(service.cleared, false);
      assert.equal(reconcilePrimaryDate(data, withDate(data, publication), next).cleared, true);
      const qualified = qualifiedInputFromForm(procurement, next.vrpgContext, 'BE', DATE)!;
      assert.equal(qualified.notificationConfirmed, notificationChannel === 'individual-service');
      assert.equal(qualified.notificationChannel, notificationChannel);
    }
    const same = reconcilePrimaryDate(data, withDate(data, publication), publication);
    assert.equal(same.specialDateValues.legalTriggerDate, DATE);
    assert.equal(same.cleared, false);
  });

  test(`${name}: selection handlers clear secondary anchors and old hidden values cannot revive`, () => {
    const dual = selected(data, political('cantonal', 'prg-be-165-political-rights-complaint', 'PRGBE-SPEC-DUAL-165'), {
      inputDate: HIDDEN_DATE,
      specialDateValues: { discoveryDate: DATE, publicationDate: '2026-09-18', pollDate: '2026-09-27' }
    });
    assert.equal(primaryDateField(data, dual).inputId, 'discoveryDate');
    const same = reconcilePrimaryDate(data, dual, { ...dual, specialDateValues: {} });
    assert.deepEqual(same.specialDateValues, { discoveryDate: DATE });
    assert.equal(same.inputDate, '');
    const generalState = changed(data, dual, form({ specialDateValues: {} }));
    assert.equal(generalState.inputDate, '');
    assert.deepEqual(generalState.specialDateValues, {});
    const returned = reconcilePrimaryDate(data, generalState, { ...dual, specialDateValues: {} });
    assert.deepEqual(returned.specialDateValues, { discoveryDate: '' });
    assert.equal(returned.inputDate, '');
    assert.equal(returned.cleared, false);
  });

  test(`${name}: an unchanged minor selector preserves the currently supplied secondary dates`, () => {
    const dual = selected(data, political('cantonal', 'prg-be-165-political-rights-complaint', 'PRGBE-SPEC-DUAL-165'), {
      specialDateValues: { discoveryDate: DATE, publicationDate: '2026-09-18', pollDate: '2026-09-27' }
    });
    const result = reconcilePrimaryDate(data, dual, { ...dual, calendarId: 'alternative-test-calendar' });
    assert.deepEqual(result.specialDateValues, dual.specialDateValues);
    assert.equal(result.cleared, false);
  });

  test(`${name}: empty visible primary does not borrow hidden primary or secondary dates`, () => {
    const poll = selected(data, political('cantonal', 'prg-be-68-grand-council-nomination', 'PRGBE-SPEC-OFFSET-068'), {
      inputDate: HIDDEN_DATE, specialDateValues: { pollDate: '', publicationDate: DATE }
    });
    const result = reconcilePrimaryDate(data, poll, form({ specialDateValues: {} }));
    assert.equal(result.inputDate, '');
    assert.equal(result.cleared, false);
    assert.deepEqual(result.specialDateValues, {});
  });
}

for (const law of ['ivg', 'ahvg', 'uvg', 'elg']) {
  for (const [action, stage] of [[law === 'ivg' ? 'preliminary-objection' : 'objection', ''],
    ['appeal', ''], ['ongoing', 'administration'], ['complaint-correction', '']]) {
    test(`candidate ${law}/${action}: service date survives provisional, social and general transitions`, () => {
      const complete = selected(candidate, social(law, action!, stage));
      assert.equal(resolveVrpgSelection(candidate, complete.vrpgSelection!).kind, 'social');
      assert.equal(primaryDateField(candidate, complete).role, 'service');
      assert.equal(primaryDateField(candidate, complete).inputId, undefined);
      const provisional = selected(candidate, social(law, ''), { inputDate: DATE });
      const result = reconcilePrimaryDate(candidate, provisional, complete);
      assert.equal(result.inputDate, DATE);
      assert.equal(result.cleared, false);
      assert.equal(reconcilePrimaryDate(candidate, { ...complete, ...result }, selected(candidate, general)).inputDate, DATE);
    });
  }
}

test('MVP 0.4 qualified social paths transfer the date between general input and legalTriggerDate', () => {
  for (const law of ['ivg', 'ahvg', 'uvg']) {
    for (const [action, stage] of [[law === 'ivg' ? 'preliminary-objection' : 'objection', ''],
      ['appeal', ''], ['ongoing', 'administration'], ['complaint-correction', '']]) {
      const next = selected(released, social(law, action!, stage));
      assert.equal(resolveVrpgSelection(released, next.vrpgSelection!).kind, 'special');
      assert.equal(primaryDateField(released, next).inputId, 'legalTriggerDate');
      const entered = changed(released, form({ inputDate: DATE }), next);
      assert.equal(entered.specialDateValues.legalTriggerDate, DATE);
      assert.equal(entered.inputDate, '');
      const generalAgain = reconcilePrimaryDate(released, entered, selected(released, general));
      assert.equal(generalAgain.inputDate, DATE);
      assert.deepEqual(generalAgain.specialDateValues, {});
      assert.equal(generalAgain.cleared, false);
    }
  }
});

test('candidate transfers legacy qualified storage to social input and back without hidden-value preference', () => {
  const legacy = selected(candidate, procurement, {
    inputDate: HIDDEN_DATE, specialDateValues: { legalTriggerDate: DATE },
    vrpgContext: { ...EMPTY_VRPG_CONTEXT, notificationChannel: 'individual-service' }
  });
  const newSocial = selected(candidate, social('elg', 'appeal'));
  const entered = changed(candidate, legacy, newSocial);
  assert.equal(entered.inputDate, DATE);
  assert.deepEqual(entered.specialDateValues, {});
  const returned = reconcilePrimaryDate(candidate, entered, { ...legacy, specialDateValues: {} });
  assert.equal(returned.inputDate, '');
  assert.deepEqual(returned.specialDateValues, { legalTriggerDate: DATE });
  assert.equal(returned.cleared, false);
});

test('an unknown future anchor receives a distinct role and is never silently treated as service', () => {
  const future: CalculationData = { ...released, specialRegimeCatalogs: new Map([...released.specialRegimeCatalogs].map(([id, catalog]) => [id, {
    ...catalog, deadlineDefinitions: catalog.deadlineDefinitions.map(definition => definition.deadlineDefinitionId === 'PRGBE-SPEC-OFFSET-068'
      && definition.deadlineOrigin === 'CALCULATED'
      ? { ...definition, anchors: definition.anchors.map(anchor => ({ ...anchor, inputId: 'futureUnknownAnchor' })) }
      : definition)
  }])) };
  const target = selected(future, political('cantonal', 'prg-be-68-grand-council-nomination', 'PRGBE-SPEC-OFFSET-068'));
  assert.equal(primaryDateField(future, target).role, 'anchor:futureUnknownAnchor');
  const result = reconcilePrimaryDate(future, form({ inputDate: DATE }), target);
  assert.equal(result.cleared, true);
  assert.deepEqual(result.specialDateValues, { futureUnknownAnchor: '' });
  assert.equal(reconcilePrimaryDate(future, withDate(future, target), target).specialDateValues.futureUnknownAnchor, DATE);
});

test('date reconciliation never changes source states, legal choices or confirmations', () => {
  const previous = selected(candidate, procurement, { specialDateValues: { legalTriggerDate: DATE },
    vrpgContext: { ...EMPTY_VRPG_CONTEXT, notificationChannel: 'official-publication' } });
  const next = selected(candidate, social('elg', 'appeal'));
  const originals = JSON.stringify([previous, next]);
  const result = reconcilePrimaryDate(candidate, previous, next);
  assert.deepEqual(Object.keys(result).sort(), ['cleared', 'field', 'inputDate', 'specialDateValues']);
  assert.equal(JSON.stringify([previous, next]), originals);
  assert.equal(next.holidayAnchorConfirmed, false);
  assert.equal(next.deliveryFictionConfirmed, false);
});

test('dates and transition metadata are never saved in defaults or resurrected by loading defaults', () => {
  let raw = '';
  const storage: StorageLike = { getItem: () => raw, setItem: (_key, value) => { raw = value; }, removeItem: () => { raw = ''; } };
  const selection = social('elg', 'appeal');
  const state = selected(candidate, selection, { inputDate: DATE, specialDateValues: { legalTriggerDate: HIDDEN_DATE } });
  const defaults = { ...initialDefaults(candidate), ...state, deadlineDays: 10, vrpgSelection: selection,
    cleared: true, field: primaryDateField(candidate, state) };
  assert.equal(saveDefaults(storage, defaults), true);
  assert.doesNotMatch(raw, /inputDate|specialDateValues|2026-09-16|2025-04-03|cleared|labelKey|legalTriggerDate/);
  const loaded = loadDefaults(candidate, storage);
  assert.deepEqual(loaded.vrpgSelection, selection);
  assert.equal('inputDate' in loaded, false);
  assert.equal('specialDateValues' in loaded, false);
  assert.equal(selected(candidate, loaded.vrpgSelection).inputDate, '');
});
