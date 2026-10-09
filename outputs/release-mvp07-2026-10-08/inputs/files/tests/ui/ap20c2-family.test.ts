// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { calculateSocialDeadline, socialObjectSha256, type CalculationData, type SocialProcedureCatalog } from '../../src/core';
import { ap20c2CandidateCalculationData as data } from '../../src/release/ap20c2CandidateData';
import { ap20c1CandidateCalculationData as prior } from '../../src/release/ap20c1CandidateData';
import { mvp05CalculationData as released } from '../../src/release/mvp05ReleaseData';
import { EMPTY_SOCIAL_CONTEXT, socialInputFromUi, socialNeedsJurisdictionDate, socialNeedsPartyDomicile,
  socialScopeKey, socialUiSelection, socialUsesDomicileScope, type SocialUiContext } from '../../src/ui/socialUi';
import { changeVrpgSelection, resolveVrpgSelection, vrpgLawOptions, type VrpgSelectionState } from '../../src/ui/vrpgSelection';
import { initialDefaults, saveDefaults, sanitizeDefaults, type StorageLike } from '../../src/ui/defaults';
import { primaryDateField, reconcilePrimaryDate } from '../../src/ui/dateTransition';
import type { CalculatorFormState } from '../../src/ui/model';
import { socialMessages } from '../../src/ui/socialMessages';
import { translate } from '../../src/ui/i18n';
import { qaPreset } from '../../src/ui/preview/qaPresets';

type Mutable<T> = T extends readonly (infer U)[] ? Mutable<U>[] : T extends object ? {-readonly [P in keyof T]: Mutable<T[P]>} : T;
const laws = ['famzg', 'flg'] as const;
const actions = [['objection', '', 'OBJ'], ['appeal', '', 'APP'], ['ongoing', 'administration', 'ADM'], ['complaint-correction', '', 'CORRECTION']] as const;
const state = (law: string, action = 'objection', stage = ''): VrpgSelectionState => ({ area: 'social', law, action, stage });
function context(law: string, court: boolean): SocialUiContext {
  return { ...EMPTY_SOCIAL_CONTEXT, jurisdictionCanton: court ? 'BE' : '',
    familyAllowanceOrderCanton: law === 'famzg' ? 'BE' : '', compensationOfficeCanton: law === 'flg' ? 'BE' : '',
    holidayConnections: 'partyBE', jurisdictionReferenceDate: court ? '2026-09-16' : '' };
}
function testOnlyData(): CalculationData {
  const catalog = structuredClone([...data.socialProcedureCatalogs!.values()][0]) as Mutable<SocialProcedureCatalog>;
  for (const rule of catalog.federalRules) rule.status = 'reviewed';
  for (const binding of catalog.cantonalBindings) binding.status = 'reviewed';
  for (const eligibility of catalog.releaseEligibility) {
    eligibility.status = 'approved';
    eligibility.approval = { approvedBy: 'SYNTHETIC UI TEST ONLY', approvedOn: '2026-10-01', decisionRef: 'TEST-NOT-PRODUCTION' };
    eligibility.ruleRef.sha256 = socialObjectSha256(catalog.federalRules.find(rule => rule.ruleId === eligibility.ruleRef.ruleId));
    eligibility.bindingRef.sha256 = socialObjectSha256(catalog.cantonalBindings.find(binding => binding.bindingId === eligibility.bindingRef.bindingId));
  }
  return { ...data, socialProcedureCatalogs: new Map([[catalog.catalogId, catalog]]) };
}
const synthetic = testOnlyData();

test('AP20C2 exposes FamZG and FLG only when explicitly integrated, never MVG or UELG', () => {
  assert.deepEqual(vrpgLawOptions(state('famzg'), data).map(x => x.key), ['', 'ivg', 'ahvg', 'uvg', 'elg', 'avig', 'kvg', 'eog', 'famzg', 'flg']);
  for (const law of laws) for (const old of [prior, released]) {
    assert.equal(vrpgLawOptions(state(law), old).some(x => x.key === law), false);
    assert.equal(resolveVrpgSelection(old, state(law)).kind, 'unavailable');
    assert.equal(socialUiSelection(old, state(law)), undefined);
  }
  for (const law of ['mvg','uelg']) assert.equal(resolveVrpgSelection(data, state(law)).kind, 'unavailable');
});

for (const law of laws) for (const [action, stage, suffix] of actions) {
  const court = action === 'appeal' || action === 'complaint-correction';
  const fact = law === 'famzg' ? 'familyAllowanceOrderCanton' : 'compensationOfficeCanton';
  test(`${law} ${suffix}: exact facts, no domicile filter, fixed document and candidate safety`, () => {
    const selection = socialUiSelection(data, state(law, action, stage))!;
    assert.equal(selection.rule.ruleId, `CH-SOC-${law.toUpperCase()}-${suffix}`);
    assert.equal(selection.binding.bindingId, `BE-SOC-${law.toUpperCase()}-${court ? 'COURT' : 'ADMIN'}-${suffix}`);
    assert.equal(resolveVrpgSelection(data, state(law, action, stage)).kind, 'social');
    assert.equal(socialNeedsJurisdictionDate(selection), court);
    assert.equal(socialNeedsPartyDomicile(selection), false);
    assert.equal(socialUsesDomicileScope(selection), false);
    assert.equal(socialScopeKey(selection), `social.scope.${law}.${court ? 'court' : 'administration'}`);
    const input = socialInputFromUi(selection, 'BE', '2026-09-16', '10', context(law, court));
    assert.deepEqual(Object.keys(input.caseFacts).sort(), selection.route.requiredFacts.map(x => x.factKey).sort());
    assert.equal(input.caseFacts.decisionOrigin, law === 'famzg' ? 'familyCompensationOffice' : 'compensationOffice');
    assert.equal(input.caseFacts[fact], 'BE');
    assert.equal(input.caseFacts.partyDomicileCanton, undefined);
    assert.equal(input.caseFacts.eogOfficeType, undefined);
    assert.equal(input.caseFacts.courtCanton, court ? 'BE' : undefined);
    assert.equal(input.qualificationBasis, 'displayed-model-scope');
    assert.equal(input.notificationConfirmed, false);
    assert.equal(input.triggerKind, selection.rule.triggerKind);
    const result = calculateSocialDeadline(input, synthetic);
    assert.equal(result.outcome, 'calculated', JSON.stringify(result.blockReasonKeys));
    assert.equal(result.finalDeadline?.date, ['OBJ','APP'].includes(suffix) ? '2026-10-16' : '2026-09-28');
    assert.deepEqual(calculateSocialDeadline(input, data).blockReasonKeys, ['not-released']);
    assert.equal(calculateSocialDeadline(input, data).finalDeadline, undefined);
    for (const partyDomicileCanton of ['', 'BE', 'ZH']) {
      const withDomicile = socialInputFromUi(selection, 'BE', '2026-09-16', '10', { ...context(law, court), partyDomicileCanton });
      assert.equal(withDomicile.caseFacts.partyDomicileCanton, undefined);
      assert.equal(calculateSocialDeadline(withDomicile, synthetic).outcome, 'calculated');
    }
    for (const value of ['', 'ZH', 'unknown']) {
      const missing = socialInputFromUi(selection, 'BE', '2026-09-16', '10', { ...context(law, court), [fact]: value });
      assert.equal(calculateSocialDeadline(missing, synthetic).outcome, 'blocked');
    }
    for (const holidayConnections of ['', 'otherOrUnclear']) {
      assert.equal(calculateSocialDeadline(socialInputFromUi(selection, 'BE', '2026-09-16', '10', { ...context(law, court), holidayConnections }), synthetic).outcome, 'blocked');
    }
    if (court) for (const change of [{ jurisdictionCanton: '' }, { jurisdictionCanton: 'ZH' }, { jurisdictionReferenceDate: '' }, { jurisdictionReferenceDate: '2028-01-02' }]) {
      assert.equal(calculateSocialDeadline(socialInputFromUi(selection, 'BE', '2026-09-16', '10', { ...context(law, court), ...change }), synthetic).outcome, 'blocked');
    }
    if (!court) for (const jurisdictionCanton of ['', 'BE', 'ZH']) {
      const adm = socialInputFromUi(selection, 'BE', '2026-09-16', '10', { ...context(law, false), jurisdictionCanton, jurisdictionReferenceDate: '2028-01-01' });
      assert.equal(adm.jurisdictionReferenceDate, undefined);
      assert.equal(calculateSocialDeadline(adm, synthetic).outcome, 'calculated');
    }
  });
}

for (const law of laws) {
  test(`${law}: defaults retain law/action but never case facts or dates`, () => {
    let raw = '';
    const storage: StorageLike = { getItem: () => raw, setItem: (_key, value) => { raw = value; }, removeItem: () => { raw = ''; } };
    assert.equal(saveDefaults(storage, { ...initialDefaults(data), profileId: 'vrpg-be', vrpgSelection: state(law, 'appeal'), socialContext: context(law, true) } as ReturnType<typeof initialDefaults>), true);
    assert.doesNotMatch(raw, /socialContext|familyAllowanceOrderCanton|compensationOfficeCanton|jurisdictionReferenceDate|2026-09/);
    assert.deepEqual(sanitizeDefaults(data, JSON.parse(raw)).vrpgSelection, state(law, 'appeal'));
    assert.equal(sanitizeDefaults(prior, JSON.parse(raw)).vrpgSelection.law, '');
    assert.equal(changeVrpgSelection(data, state(law, 'appeal'), 'law', 'ahvg').action, '');
  });
  test(`${law}: early date entry, same meaning on action change, blank QA dates`, () => {
    const form = (s: VrpgSelectionState): CalculatorFormState => ({ authorityCode: 'BE', profileId: 'vrpg-be', inputDate: '', deadlineDays: '10', selectors: {}, calendarId: 'be-public-holidays', calendarOverrideReason: '', additionalHolidayAnchor: '', holidayAnchorConfirmed: false, deliveryFictionConfirmed: false, specialLawChecked: false, specialRegimeId: '', specialDefinitionId: '', specialDateValues: {}, specialLocalTimeValues: {}, specialIntegerValues: {}, specialOverrideConfirmations: [], vrpgSelection: s });
    let current = { ...form(state(law, '')), inputDate: '2026-09-16' };
    for (const [action, stage] of actions) {
      const next = form(state(law, action, stage));
      assert.equal(primaryDateField(data, next).role, 'service');
      const transition = reconcilePrimaryDate(data, current, next);
      assert.equal(transition.inputDate, '2026-09-16');
      assert.equal(transition.cleared, false);
      current = { ...next, ...transition };
    }
    assert.equal(qaPreset(`?qa=ap20c2-${law}`)?.inputDate, undefined);
  });
}

test('Family UI keeps real facts independent, reduced two-column form, trace-only explanations and blank case state', () => {
  for (const key of Object.keys(socialMessages).filter(key => /famzg|flg|candidate.family/.test(key))) {
    for (const locale of ['de','fr'] as const) assert.notEqual(translate(locale, key), key);
  }
  const app = readFileSync('src/ui/FristenrechnerApp.tsx', 'utf8');
  const form = app.slice(app.indexOf('<form className="fr-form"'), app.indexOf('</form>'));
  assert.match(form, /fr-form__grid/);
  assert.match(form, /familyAdministration \? renderSocialFamilyCanton/);
  assert.match(form, /familyLaw && !familyAdministration && renderSocialFamilyCanton/);
  assert.doesNotMatch(form, /social\.famzg\.limits|social\.flg\.limits|social\.scopeLabel|renderFixedValue\('vrpg.context.triggerKind'/);
  assert.match(app, /translate\(locale, 'social.famzg.limits'\)/);
  assert.match(app, /translate\(locale, 'social.flg.limits'\)/);
  assert.equal(EMPTY_SOCIAL_CONTEXT.familyAllowanceOrderCanton, '');
  assert.equal(EMPTY_SOCIAL_CONTEXT.compensationOfficeCanton, '');
  assert.doesNotMatch(app, /status: 'approved'|SYNTHETIC UI TEST/);
  assert.match(readFileSync('src/ui/preview/main.tsx', 'utf8'), /candidate === 'ap20c2' \? ap20c2CandidateCalculationData/);
  for (const path of ['src/public-app/main.tsx', 'spfx/src/webparts/fristenrechner/FristenrechnerWebPart.ts']) {
    assert.doesNotMatch(readFileSync(path, 'utf8'), /ap20c2Candidate/);
  }
});
