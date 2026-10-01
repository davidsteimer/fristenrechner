// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { calculateSocialDeadline, socialObjectSha256, type CalculationData, type SocialProcedureCatalog } from '../../src/core';
import { ap20c1CandidateCalculationData as data } from '../../src/release/ap20c1CandidateData';
import { mvp05CalculationData as released } from '../../src/release/mvp05ReleaseData';
import { EMPTY_SOCIAL_CONTEXT, socialInputFromUi, socialNeedsJurisdictionDate, socialNeedsPartyDomicile,
  socialScopeKey, socialUiPath, socialUiSelection, socialUsesDomicileScope, type SocialUiContext } from '../../src/ui/socialUi';
import { changeVrpgSelection, resolveVrpgSelection, vrpgLawOptions, type VrpgSelectionState } from '../../src/ui/vrpgSelection';
import { initialDefaults, saveDefaults, sanitizeDefaults, type StorageLike } from '../../src/ui/defaults';
import { primaryDateField, reconcilePrimaryDate } from '../../src/ui/dateTransition';
import type { CalculatorFormState } from '../../src/ui/model';
import { socialMessages } from '../../src/ui/socialMessages';
import { translate } from '../../src/ui/i18n';
import { qaPreset } from '../../src/ui/preview/qaPresets';

type Mutable<T> = T extends readonly (infer U)[] ? Mutable<U>[] : T extends object ? {-readonly [P in keyof T]: Mutable<T[P]>} : T;
const state = (action = 'objection', stage = ''): VrpgSelectionState => ({ area: 'social', law: 'eog', action, stage });
const actions = [['objection', '', 'OBJ'], ['appeal', '', 'APP'], ['ongoing', 'administration', 'ADM'], ['complaint-correction', '', 'CORRECTION']] as const;
function context(officeType = ''): SocialUiContext {
  return { ...EMPTY_SOCIAL_CONTEXT, jurisdictionCanton: officeType ? 'BE' : '', partyDomicileCanton: 'BE',
    eogOfficeType: officeType, compensationOfficeCanton: officeType === 'cantonal' ? 'BE' : '',
    holidayConnections: 'partyBE', jurisdictionReferenceDate: officeType ? '2026-09-16' : '' };
}
function testOnlyData(): CalculationData {
  const value = structuredClone([...data.socialProcedureCatalogs!.values()][0]) as Mutable<SocialProcedureCatalog>;
  for (const rule of value.federalRules) rule.status = 'reviewed';
  for (const binding of value.cantonalBindings) binding.status = 'reviewed';
  for (const eligibility of value.releaseEligibility) {
    eligibility.status = 'approved';
    eligibility.approval = { approvedBy: 'SYNTHETIC UI TEST ONLY', approvedOn: '2026-09-30', decisionRef: 'TEST-NOT-PRODUCTION' };
    eligibility.ruleRef.sha256 = socialObjectSha256(value.federalRules.find(rule => rule.ruleId === eligibility.ruleRef.ruleId));
    eligibility.bindingRef.sha256 = socialObjectSha256(value.cantonalBindings.find(binding => binding.bindingId === eligibility.bindingRef.bindingId));
  }
  return { ...data, socialProcedureCatalogs: new Map([[value.catalogId, value]]) };
}
const synthetic = testOnlyData();

test('AP20C1 offers EOG only from its explicit candidate, never other AP20 laws or the approved MVP05 pin', () => {
  assert.deepEqual(vrpgLawOptions(state(), data).map(choice => choice.key), ['', 'ivg', 'ahvg', 'uvg', 'elg', 'avig', 'kvg', 'eog']);
  assert.equal(vrpgLawOptions(state(), released).some(choice => choice.key === 'eog'), false);
  assert.equal(resolveVrpgSelection(released, state()).kind, 'unavailable');
  assert.equal(socialUiSelection(released, state()), undefined);
  for (const law of ['famzg', 'flg', 'mvg', 'uelg']) assert.equal(resolveVrpgSelection(data, { ...state(), law }).kind, 'unavailable');
});

for (const [action, stage, suffix] of actions) {
  const court = action === 'appeal' || action === 'complaint-correction';
  for (const officeType of court ? ['cantonal', 'nonCantonal'] : ['']) {
    test(`EOG ${suffix}/${officeType || 'administration'}: exact route, explicit facts, fixed document, no operative candidate result`, () => {
      const selection = socialUiSelection(data, state(action, stage), '', officeType)!;
      assert.equal(selection.rule.ruleId, `CH-SOC-EOG-${suffix}`);
      assert.equal(selection.binding.bindingId, `BE-SOC-EOG-${court ? officeType === 'cantonal' ? 'CANTONAL' : 'ORDINARY' : 'ADMIN'}-${suffix}`);
      assert.equal(socialUiPath(data, state(action, stage))!.selections.length, court ? 2 : 1);
      assert.equal(resolveVrpgSelection(data, state(action, stage)).kind, 'social');
      assert.equal(socialNeedsPartyDomicile(selection), officeType !== 'cantonal');
      assert.equal(socialUsesDomicileScope(selection), !court);
      assert.equal(socialNeedsJurisdictionDate(selection), court);
      const input = socialInputFromUi(selection, 'BE', '2026-09-16', '10', context(officeType));
      assert.deepEqual(Object.keys(input.caseFacts).sort(), selection.route.requiredFacts.map(fact => fact.factKey).sort());
      assert.equal(input.caseFacts.decisionOrigin, 'compensationOffice');
      assert.equal(input.qualificationBasis, 'displayed-model-scope');
      assert.equal(input.notificationConfirmed, false);
      assert.equal(input.triggerKind, selection.rule.triggerKind);
      assert.equal(input.caseFacts.compensationOfficeCanton, officeType === 'cantonal' ? 'BE' : undefined);
      assert.equal(input.caseFacts.partyDomicileCanton, officeType === 'cantonal' ? undefined : 'BE');
      const result = calculateSocialDeadline(input, synthetic);
      assert.equal(result.outcome, 'calculated', JSON.stringify(result.blockReasonKeys));
      assert.equal(result.finalDeadline?.date, ['OBJ', 'APP'].includes(suffix) ? '2026-10-16' : '2026-09-28');
      assert.deepEqual(calculateSocialDeadline(input, data).blockReasonKeys, ['not-released']);
      assert.equal(calculateSocialDeadline(input, data).finalDeadline, undefined);
      assert.equal(calculateSocialDeadline(socialInputFromUi(selection, 'BE', '2026-09-16', '10', EMPTY_SOCIAL_CONTEXT), synthetic).outcome, 'blocked');
      for (const holidayConnections of ['', 'otherOrUnclear']) {
        assert.equal(calculateSocialDeadline(socialInputFromUi(selection, 'BE', '2026-09-16', '10', { ...context(officeType), holidayConnections }), synthetic).outcome, 'blocked');
      }
    });
  }
}

for (const action of ['appeal', 'complaint-correction']) {
  test(`EOG ${action}: route choice never inferred and wrong office/court cannot fall back to ordinary jurisdiction`, () => {
    for (const officeType of ['', 'unknown', 'cantonalOffice']) assert.equal(socialUiSelection(data, state(action), '', officeType), undefined);
    const cantonal = socialUiSelection(data, state(action), '', 'cantonal')!;
    const ordinary = socialUiSelection(data, state(action), '', 'nonCantonal')!;
    for (const change of [{ compensationOfficeCanton: '' }, { compensationOfficeCanton: 'ZH' }, { jurisdictionCanton: '' }, { jurisdictionCanton: 'ZH' }, { jurisdictionReferenceDate: '' }, { eogOfficeType: 'nonCantonal' }]) {
      assert.equal(calculateSocialDeadline(socialInputFromUi(cantonal, 'BE', '2026-09-16', '10', { ...context('cantonal'), ...change }), synthetic).outcome, 'blocked');
    }
    // Cantonal Art. 24 route has no invented BE domicile condition.
    for (const partyDomicileCanton of ['', 'BE', 'ZH']) {
      const input = socialInputFromUi(cantonal, 'BE', '2026-09-16', '10', { ...context('cantonal'), partyDomicileCanton });
      assert.equal(input.caseFacts.partyDomicileCanton, undefined);
      assert.equal(calculateSocialDeadline(input, synthetic).outcome, 'calculated');
    }
    for (const change of [{ partyDomicileCanton: '' }, { partyDomicileCanton: 'ZH' }, { jurisdictionCanton: 'ZH' }, { jurisdictionReferenceDate: '' }, { eogOfficeType: 'cantonal' }]) {
      assert.equal(calculateSocialDeadline(socialInputFromUi(ordinary, 'BE', '2026-09-16', '10', { ...context('nonCantonal'), ...change }), synthetic).outcome, 'blocked');
    }
    const ordinaryInput = socialInputFromUi(ordinary, 'BE', '2026-09-16', '10', { ...context('nonCantonal'), compensationOfficeCanton: 'ZH' });
    assert.equal(ordinaryInput.caseFacts.compensationOfficeCanton, undefined);
    assert.equal(calculateSocialDeadline(ordinaryInput, synthetic).outcome, 'calculated');
    assert.equal(socialScopeKey(cantonal), 'social.scope.eog.court.cantonal');
    assert.equal(socialScopeKey(ordinary), 'social.scope.eog.court.nonCantonal');
  });
}

test('EOG administration has no office-seat filter and never carries court facts from a previous case', () => {
  const selected = socialUiSelection(data, state())!;
  for (const jurisdictionCanton of ['', 'BE', 'ZH']) for (const eogOfficeType of ['', 'cantonal', 'nonCantonal']) {
    const input = socialInputFromUi(selected, 'BE', '2026-09-16', '999', { ...context(), jurisdictionCanton, eogOfficeType, compensationOfficeCanton: 'ZH', jurisdictionReferenceDate: '2025-12-31' });
    assert.equal(input.caseFacts.eogOfficeType, undefined);
    assert.equal(input.caseFacts.compensationOfficeCanton, undefined);
    assert.equal(input.caseFacts.courtCanton, undefined);
    assert.equal(input.jurisdictionReferenceDate, undefined);
    assert.equal('days' in input, false);
    assert.equal(calculateSocialDeadline(input, synthetic).outcome, 'calculated');
  }
  for (const partyDomicileCanton of ['', 'ZH']) assert.equal(calculateSocialDeadline(socialInputFromUi(selected, 'BE', '2026-09-16', '30', { ...context(), partyDomicileCanton }), synthetic).outcome, 'blocked');
});

test('EOG defaults store only stable selections, never office type, canton, facts or dates', () => {
  let raw = '';
  const storage: StorageLike = { getItem: () => raw, setItem: (_key, value) => { raw = value; }, removeItem: () => { raw = ''; } };
  assert.equal(saveDefaults(storage, { ...initialDefaults(data), profileId: 'vrpg-be', vrpgSelection: state('appeal'), socialContext: context('cantonal') } as ReturnType<typeof initialDefaults>), true);
  assert.doesNotMatch(raw, /socialContext|eogOfficeType|compensationOfficeCanton|jurisdictionReferenceDate|partyDomicileCanton|2026-09/);
  assert.deepEqual(sanitizeDefaults(data, JSON.parse(raw)).vrpgSelection, state('appeal'));
  assert.equal(sanitizeDefaults(released, JSON.parse(raw)).vrpgSelection.law, '');
  assert.equal(changeVrpgSelection(data, state('appeal'), 'law', 'ahvg').action, '');
});

test('EOG keeps early date entry and does not seed the separate jurisdiction date or a date on reload', () => {
  const form = (selection: VrpgSelectionState): CalculatorFormState => ({ authorityCode: 'BE', profileId: 'vrpg-be', inputDate: '', deadlineDays: '10', selectors: {}, calendarId: 'be-public-holidays', calendarOverrideReason: '', additionalHolidayAnchor: '', holidayAnchorConfirmed: false, deliveryFictionConfirmed: false, specialLawChecked: false, specialRegimeId: '', specialDefinitionId: '', specialDateValues: {}, specialLocalTimeValues: {}, specialIntegerValues: {}, specialOverrideConfirmations: [], vrpgSelection: selection });
  let current = { ...form(state('')), inputDate: '2026-09-16' };
  for (const [action, stage] of actions) {
    const next = form(state(action, stage));
    assert.equal(primaryDateField(data, next).role, 'service');
    const transition = reconcilePrimaryDate(data, current, next);
    assert.equal(transition.inputDate, '2026-09-16');
    assert.equal(transition.cleared, false);
    current = { ...next, ...transition };
  }
  assert.equal(EMPTY_SOCIAL_CONTEXT.jurisdictionReferenceDate, '');
  assert.equal(qaPreset('?qa=ap20c1-eog')?.inputDate, undefined);
});

test('EOG labels exist in DE/FR and UI keeps two-column scope, actual choices and candidate isolation', () => {
  for (const key of Object.keys(socialMessages).filter(key => key.includes('eog'))) {
    for (const locale of ['de', 'fr'] as const) assert.notEqual(translate(locale, key), key);
  }
  const app = readFileSync('src/ui/FristenrechnerApp.tsx', 'utf8');
  const form = app.slice(app.indexOf('<form className="fr-form"'), app.indexOf('</form>'));
  assert.match(form, /fr-form__grid/);
  assert.match(form, /eogCourt &&/);
  assert.match(form, /social\.eog\.officeType/);
  assert.doesNotMatch(form, /social\.eog\.limits|social\.scopeLabel|renderFixedValue\('vrpg.context.triggerKind'/);
  assert.match(app, /translate\(locale, 'social.eog.limits'\)/);
  assert.doesNotMatch(app, /status: 'approved'|SYNTHETIC UI TEST/);
  const preview = readFileSync('src/ui/preview/main.tsx', 'utf8');
  assert.match(preview, /candidate === 'ap20c1' \? ap20c1CandidateCalculationData/);
  assert.match(preview, /: mvp05CalculationData;/);
  for (const path of ['src/public-app/main.tsx', 'spfx/src/webparts/fristenrechner/FristenrechnerWebPart.ts']) {
    assert.doesNotMatch(readFileSync(path, 'utf8'), /ap20c1Candidate/);
  }
});
