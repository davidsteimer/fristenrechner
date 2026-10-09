// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { calculateSocialDeadline, socialObjectSha256, type CalculationData, type SocialProcedureCatalog } from '../../src/core';
import { ap20c3CandidateCalculationData as data } from '../../src/release/ap20c3CandidateData';
import { ap20c2CandidateCalculationData as prior } from '../../src/release/ap20c2CandidateData';
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
const laws = ['mvg', 'uelg'] as const;
const actions = [['objection', '', 'OBJ'], ['appeal', '', 'APP'], ['ongoing', 'administration', 'ADM'], ['complaint-correction', '', 'CORRECTION']] as const;
const state = (law: string, action = 'objection', stage = ''): VrpgSelectionState => ({ area: 'social', law, action, stage });
function context(law: string, court: boolean): SocialUiContext {
  return { ...EMPTY_SOCIAL_CONTEXT, jurisdictionCanton: court ? 'BE' : '',
    partyDomicileCanton: court || law === 'mvg' ? 'BE' : '',
    uelgAdministrativeCanton: law === 'uelg' && !court ? 'BE' : '',
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

test('AP20C3 exposes MVG/UELG only with actual integrated models, not on C2 or MVP05', () => {
  assert.deepEqual(vrpgLawOptions(state('mvg'), data).map(x => x.key), ['', 'ivg', 'ahvg', 'uvg', 'elg', 'avig', 'kvg', 'eog', 'famzg', 'flg', 'mvg', 'uelg']);
  for (const law of laws) for (const old of [prior, released]) {
    assert.equal(vrpgLawOptions(state(law), old).some(x => x.key === law), false);
    assert.equal(resolveVrpgSelection(old, state(law)).kind, 'unavailable');
    assert.equal(socialUiSelection(old, state(law)), undefined);
  }
});

for (const law of laws) for (const [action, stage, suffix] of actions) {
  const court = action === 'appeal' || action === 'complaint-correction';
  test(`${law} ${suffix}: exact explicit case facts, scope and candidate gate`, () => {
    const selection = socialUiSelection(data, state(law, action, stage))!;
    assert.equal(selection.rule.ruleId, `CH-SOC-${law.toUpperCase()}-${suffix}`);
    assert.equal(selection.binding.bindingId, `BE-SOC-${law.toUpperCase()}-${court ? 'COURT' : 'ADMIN'}-${suffix}`);
    assert.equal(resolveVrpgSelection(data, state(law, action, stage)).kind, 'social');
    assert.equal(socialNeedsJurisdictionDate(selection), court);
    assert.equal(socialNeedsPartyDomicile(selection), court || law === 'mvg');
    assert.equal(socialUsesDomicileScope(selection), !court && law === 'mvg');
    assert.equal(socialScopeKey(selection), `social.scope.${law}.${court ? 'court' : 'administration'}`);
    const input = socialInputFromUi(selection, 'BE', '2026-09-16', '10', context(law, court));
    assert.deepEqual(Object.keys(input.caseFacts).sort(), selection.route.requiredFacts.map(x => x.factKey).sort());
    assert.equal(input.caseFacts.decisionOrigin, law === 'mvg' ? 'militaryInsurer' : 'compensationOffice');
    assert.equal(input.caseFacts.partyDomicileCanton, court || law === 'mvg' ? 'BE' : undefined);
    assert.equal(input.caseFacts.uelgAdministrativeCanton, !court && law === 'uelg' ? 'BE' : undefined);
    assert.equal(input.caseFacts.courtCanton, court ? 'BE' : undefined);
    assert.equal(input.caseFacts.compensationOfficeCanton, undefined);
    assert.equal(input.qualificationBasis, 'displayed-model-scope');
    assert.equal(input.notificationConfirmed, false);
    assert.equal(input.triggerKind, selection.rule.triggerKind);
    const result = calculateSocialDeadline(input, synthetic);
    assert.equal(result.outcome, 'calculated', JSON.stringify(result.blockReasonKeys));
    assert.equal(result.finalDeadline?.date, ['OBJ','APP'].includes(suffix) ? '2026-10-16' : '2026-09-28');
    assert.deepEqual(calculateSocialDeadline(input, data).blockReasonKeys, ['not-released']);
    assert.equal(calculateSocialDeadline(input, data).finalDeadline, undefined);
    const requiredCanton = court ? 'jurisdictionCanton' : law === 'mvg' ? 'partyDomicileCanton' : 'uelgAdministrativeCanton';
    for (const value of ['', 'ZH', 'unknown']) {
      assert.equal(calculateSocialDeadline(socialInputFromUi(selection, 'BE', '2026-09-16', '10', { ...context(law, court), [requiredCanton]: value }), synthetic).outcome, 'blocked');
    }
    for (const holidayConnections of ['', 'otherOrUnclear']) {
      assert.equal(calculateSocialDeadline(socialInputFromUi(selection, 'BE', '2026-09-16', '10', { ...context(law, court), holidayConnections }), synthetic).outcome, 'blocked');
    }
    if (court) for (const change of [{ partyDomicileCanton: '' }, { partyDomicileCanton: 'ZH' }, { jurisdictionReferenceDate: '' }, { jurisdictionReferenceDate: '2028-01-02' }]) {
      assert.equal(calculateSocialDeadline(socialInputFromUi(selection, 'BE', '2026-09-16', '10', { ...context(law, true), ...change }), synthetic).outcome, 'blocked');
    }
    if (!court) for (const jurisdictionCanton of ['', 'BE', 'ZH']) {
      const adm = socialInputFromUi(selection, 'BE', '2026-09-16', '10', { ...context(law, false), jurisdictionCanton, jurisdictionReferenceDate: '2028-01-01' });
      assert.equal(adm.jurisdictionReferenceDate, undefined);
      assert.equal(calculateSocialDeadline(adm, synthetic).outcome, 'calculated');
    }
  });
}

test('UELG administrative jurisdiction is neither inferred from domicile/court/office nor reused as court jurisdiction', () => {
  const adm = socialUiSelection(data, state('uelg'))!;
  const missing = socialInputFromUi(adm, 'BE', '2026-09-16', '', { ...context('uelg', false),
    uelgAdministrativeCanton: '', jurisdictionCanton: 'BE', partyDomicileCanton: 'BE', compensationOfficeCanton: 'BE' });
  assert.equal(missing.caseFacts.uelgAdministrativeCanton, undefined);
  assert.equal(calculateSocialDeadline(missing, synthetic).outcome, 'blocked');
  for (const partyDomicileCanton of ['', 'BE', 'ZH']) {
    const input = socialInputFromUi(adm, 'BE', '2026-09-16', '', { ...context('uelg', false), partyDomicileCanton });
    assert.equal(input.caseFacts.partyDomicileCanton, undefined);
    assert.equal(calculateSocialDeadline(input, synthetic).outcome, 'calculated');
  }
  const court = socialUiSelection(data, state('uelg', 'appeal'))!;
  for (const uelgAdministrativeCanton of ['', 'BE', 'ZH']) {
    const input = socialInputFromUi(court, 'BE', '2026-09-16', '', { ...context('uelg', true), uelgAdministrativeCanton });
    assert.equal(input.caseFacts.uelgAdministrativeCanton, undefined);
    assert.equal(calculateSocialDeadline(input, synthetic).outcome, 'calculated');
  }
});

test('MVG administration does not invent a cantonal insurer seat or substitute it for domicile', () => {
  const adm = socialUiSelection(data, state('mvg'))!;
  for (const jurisdictionCanton of ['', 'BE', 'ZH']) {
    const input = socialInputFromUi(adm, 'BE', '2026-09-16', '', { ...context('mvg', false), jurisdictionCanton });
    assert.deepEqual(Object.keys(input.caseFacts).sort(), ['competentBodyQualified','decisionOrigin','jurisdictionSpecialCase','partyDomicileCanton']);
    assert.equal(calculateSocialDeadline(input, synthetic).outcome, 'calculated');
  }
  const missing = socialInputFromUi(adm, 'BE', '2026-09-16', '', { ...context('mvg', false), partyDomicileCanton: '', jurisdictionCanton: 'BE' });
  assert.equal(calculateSocialDeadline(missing, synthetic).outcome, 'blocked');
});

for (const law of laws) {
  test(`${law}: defaults retain law/action only, no case facts or dates`, () => {
    let raw = '';
    const storage: StorageLike = { getItem: () => raw, setItem: (_key, value) => { raw = value; }, removeItem: () => { raw = ''; } };
    assert.equal(saveDefaults(storage, { ...initialDefaults(data), profileId: 'vrpg-be', vrpgSelection: state(law, 'appeal'), socialContext: context(law, true) } as ReturnType<typeof initialDefaults>), true);
    assert.doesNotMatch(raw, /socialContext|uelgAdministrativeCanton|partyDomicileCanton|jurisdictionReferenceDate|2026-09/);
    assert.deepEqual(sanitizeDefaults(data, JSON.parse(raw)).vrpgSelection, state(law, 'appeal'));
    assert.equal(sanitizeDefaults(prior, JSON.parse(raw)).vrpgSelection.law, '');
    assert.equal(changeVrpgSelection(data, state(law, 'appeal'), 'law', 'ahvg').action, '');
  });
  test(`${law}: early service date retained on same-meaning action transitions, no preset date`, () => {
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
    assert.equal(qaPreset(`?qa=ap20c3-${law}`)?.inputDate, undefined);
  });
}

test('C3 UI preserves reduced two-column form, independent facts and trace-only context', () => {
  for (const key of Object.keys(socialMessages).filter(key => /mvg|uelg|mvgUelg/.test(key))) {
    for (const locale of ['de','fr'] as const) assert.notEqual(translate(locale, key), key);
  }
  const app = readFileSync('src/ui/FristenrechnerApp.tsx', 'utf8');
  const form = app.slice(app.indexOf('<form className="fr-form"'), app.indexOf('</form>'));
  assert.match(form, /fr-form__grid/);
  assert.match(form, /uelgAdministration \? <Dropdown required/);
  assert.match(form, /mvgAdministration \? renderSocialDomicile\('social.mvg.partyDomicile'\)/);
  assert.doesNotMatch(form, /social\.mvg\.limits|social\.uelg\.limits|social\.scopeLabel|renderFixedValue\('vrpg.context.triggerKind'/);
  assert.match(app, /translate\(locale, 'social.mvg.limits'\)/);
  assert.match(app, /translate\(locale, 'social.uelg.limits'\)/);
  assert.match(app, /setSocialContext\(EMPTY_SOCIAL_CONTEXT\)/);
  assert.equal(EMPTY_SOCIAL_CONTEXT.uelgAdministrativeCanton, '');
  assert.doesNotMatch(app, /status: 'approved'|SYNTHETIC UI TEST/);
  assert.match(readFileSync('src/ui/preview/main.tsx', 'utf8'), /candidate === 'ap20c3' \? ap20c3CandidateCalculationData/);
  for (const path of ['src/public-app/main.tsx', 'spfx/src/webparts/fristenrechner/FristenrechnerWebPart.ts']) {
    assert.doesNotMatch(readFileSync(path, 'utf8'), /ap20c3Candidate/);
  }
});
