// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateSocialDeadline, socialObjectSha256 } from '../../src/core';
import type { CalculationData, SocialProcedureCatalog } from '../../src/core';
import { ap19c2CandidateCalculationData as data } from '../../src/release/ap19c2CandidateData';
import { ap19cCandidateCalculationData as c1 } from '../../src/release/ap19cCandidateData';
import { mvp04CalculationData as released } from '../../src/release/mvp04ReleaseData';
import {
  EMPTY_SOCIAL_CONTEXT, socialInputFromUi, socialNeedsJurisdictionDate, socialNeedsPartyDomicile,
  socialUiPath, socialUiSelection, type SocialUiContext
} from '../../src/ui/socialUi';
import { changeVrpgSelection, resolveVrpgSelection, sanitizeVrpgSelection, vrpgActionOptions, vrpgLawOptions, type VrpgSelectionState } from '../../src/ui/vrpgSelection';
import { initialDefaults, sanitizeDefaults, saveDefaults, type StorageLike } from '../../src/ui/defaults';
import { primaryDateField, reconcilePrimaryDate } from '../../src/ui/dateTransition';
import type { CalculatorFormState } from '../../src/ui/model';
import { socialMessages } from '../../src/ui/socialMessages';
import { translate } from '../../src/ui/i18n';

type Mutable<T> = T extends readonly (infer U)[] ? Mutable<U>[] : T extends object ? {-readonly [P in keyof T]: Mutable<T[P]>} : T;
type Origin = 'unemploymentFund' | 'cantonalEmploymentOffice';
const origins: readonly Origin[] = ['unemploymentFund', 'cantonalEmploymentOffice'];
const state = (action = 'objection', stage = ''): VrpgSelectionState => ({area: 'social', law: 'avig', action, stage});
const actions = [['objection', ''], ['appeal', ''], ['ongoing', 'administration'], ['complaint-correction', '']] as const;
function context(origin: Origin): SocialUiContext {
  return {jurisdictionCanton: 'BE', partyDomicileCanton: '', holidayConnections: 'partyBE', jurisdictionReferenceDate: '2026-09-15', decisionOrigin: origin, avigJurisdictionCanton: 'BE'};
}
function syntheticData(): CalculationData {
  const value = JSON.parse(JSON.stringify(data.socialProcedureCatalogs!.get('ch-social-procedures'))) as Mutable<SocialProcedureCatalog>;
  value.federalRules.forEach(rule => { rule.status = 'reviewed'; });
  value.cantonalBindings.forEach(binding => { binding.status = 'reviewed'; binding.legalValidity = {from: '2026-01-01', to: '2027-12-31'}; });
  value.releaseEligibility.forEach(entry => {
    // Fictional in-memory approvals only, never written to a candidate or host.
    entry.status = 'approved';
    entry.approval = {approvedBy: 'SYNTHETIC UI TEST ONLY', approvedOn: '2026-09-28', decisionRef: 'TEST-NOT-PRODUCTION'};
    entry.ruleRef.sha256 = socialObjectSha256(value.federalRules.find(rule => rule.ruleId === entry.ruleRef.ruleId));
    entry.bindingRef.sha256 = socialObjectSha256(value.cantonalBindings.find(binding => binding.bindingId === entry.bindingRef.bindingId));
  });
  return {...data, socialProcedureCatalogs: new Map([[value.catalogId, value]])};
}
const synthetic = syntheticData();

test('C2 offers AVIG only with its actual candidate rules, never from a static law list or on older data', () => {
  assert.deepEqual(vrpgLawOptions(state(), data).map(option => option.key), ['', 'ivg', 'ahvg', 'uvg', 'elg', 'avig']);
  for (const older of [c1, released]) {
    assert.equal(vrpgLawOptions(state(), older).some(option => option.key === 'avig'), false);
    assert.equal(socialUiPath(older, state()), undefined);
    assert.equal(socialUiSelection(older, state(), 'unemploymentFund'), undefined);
    assert.equal(resolveVrpgSelection(older, state()).kind, 'unavailable');
  }
  assert.equal(vrpgLawOptions(state(), data).some(option => option.key === 'kvg'), false);
});

for (const [action, stage] of actions) {
  test(`AVIG ${action}: national path can be displayed before origin, but no route is inferred`, () => {
    const selection = state(action, stage);
    const path = socialUiPath(data, selection)!;
    assert.ok(path);
    assert.equal(path.rule.law, 'avig');
    assert.equal(path.selections.length, 2);
    assert.equal(resolveVrpgSelection(data, selection).kind, 'social');
    for (const origin of ['', 'insuranceCourt', 'healthInsurer', 'unknown']) assert.equal(socialUiSelection(data, selection, origin), undefined);
    for (const origin of origins) assert.ok(socialUiSelection(data, selection, origin));
  });

  for (const origin of origins) {
    test(`AVIG ${action} / ${origin}: explicit route and case facts reach the real resolver`, () => {
      const selected = socialUiSelection(data, state(action, stage), origin)!;
      const input = socialInputFromUi(selected, 'BE', '2026-09-16', '10', context(origin));
      assert.equal(input.caseFacts.decisionOrigin, origin);
      assert.equal(input.qualificationBasis, 'displayed-model-scope');
      assert.equal(input.notificationConfirmed, false);
      assert.equal(socialNeedsPartyDomicile(selected), false);
      assert.equal(socialNeedsJurisdictionDate(selected), origin === 'unemploymentFund');
      assert.equal(input.jurisdictionReferenceDate, origin === 'unemploymentFund' ? '2026-09-15' : undefined);
      const result = calculateSocialDeadline(input, synthetic);
      assert.equal(result.outcome, 'calculated', JSON.stringify(result.blockReasonKeys));
      assert.equal(result.finalDeadline?.date, action === 'ongoing' || action === 'complaint-correction' ? '2026-09-28' : '2026-10-16');
      assert.deepEqual(calculateSocialDeadline(input, data).blockReasonKeys, ['not-released']);
    });

    test(`AVIG ${action} / ${origin}: an empty, wrong or switched origin cannot be filled from selected route metadata`, () => {
      const selected = socialUiSelection(synthetic, state(action, stage), origin)!;
      for (const decisionOrigin of ['', 'unknown', origin === 'unemploymentFund' ? 'cantonalEmploymentOffice' : 'unemploymentFund']) {
        const input = socialInputFromUi(selected, 'BE', '2026-09-16', '10', {...context(origin), decisionOrigin});
        assert.notEqual(input.caseFacts.decisionOrigin, origin);
        assert.equal(calculateSocialDeadline(input, synthetic).outcome, 'blocked');
      }
      const empty = socialInputFromUi(selected, 'BE', '2026-09-16', '10', EMPTY_SOCIAL_CONTEXT);
      assert.equal(calculateSocialDeadline(empty, synthetic).outcome, 'blocked');
    });
  }
}

for (const action of ['appeal', 'complaint-correction']) {
  for (const origin of origins) {
    test(`AVIG ${action} / ${origin}: court canton is independent of control or office canton`, () => {
      const selected = socialUiSelection(synthetic, state(action), origin)!;
      const factKey = origin === 'unemploymentFund' ? 'avigControlCanton' : 'avigOfficeCanton';
      const input = socialInputFromUi(selected, 'BE', '2026-09-16', '10', context(origin));
      assert.equal(input.caseFacts.courtCanton, 'BE');
      assert.equal(input.caseFacts[factKey], 'BE');
      assert.equal(input.caseFacts.partyDomicileCanton, undefined);
      for (const avigJurisdictionCanton of ['', 'ZH', 'XX']) {
        const changed = socialInputFromUi(selected, 'BE', '2026-09-16', '10', {...context(origin), avigJurisdictionCanton});
        assert.notEqual(changed.caseFacts[factKey], 'BE');
        assert.equal(calculateSocialDeadline(changed, synthetic).outcome, 'blocked');
      }
      const missingCourt = socialInputFromUi(selected, 'BE', '2026-09-16', '10', {...context(origin), jurisdictionCanton: ''});
      assert.equal(calculateSocialDeadline(missingCourt, synthetic).outcome, 'blocked');
    });
  }
}

test('AVIG administration uses its explicit control or office canton and does not require a duplicated court fact', () => {
  for (const origin of origins) for (const [action, stage] of [['objection', ''], ['ongoing', 'administration']]) {
    const selected = socialUiSelection(synthetic, state(action, stage), origin)!;
    const input = socialInputFromUi(selected, 'BE', '2026-09-16', '10', {...context(origin), avigJurisdictionCanton: ''});
    assert.equal(input.caseFacts[origin === 'unemploymentFund' ? 'avigControlCanton' : 'avigOfficeCanton'], 'BE');
    assert.equal(input.caseFacts.courtCanton, undefined);
    assert.equal(calculateSocialDeadline(input, synthetic).outcome, 'calculated');
  }
});

test('AVIG selection persists, but origin, jurisdiction facts and dates never become personal defaults', () => {
  let raw = '';
  const storage: StorageLike = {getItem: () => raw, setItem: (_key, value) => {raw = value;}, removeItem: () => {raw = '';}};
  const defaults = {...initialDefaults(data), profileId: 'vrpg-be', vrpgSelection: state('appeal'), socialContext: context('unemploymentFund')};
  assert.equal(saveDefaults(storage, defaults), true);
  assert.doesNotMatch(raw, /socialContext|decisionOrigin|avigJurisdictionCanton|avigControlCanton|jurisdictionReferenceDate|2026-09/);
  assert.deepEqual(sanitizeDefaults(data, JSON.parse(raw)).vrpgSelection, state('appeal'));
  assert.equal(sanitizeDefaults(c1, JSON.parse(raw)).vrpgSelection.law, '');
  assert.deepEqual(sanitizeVrpgSelection(data, state('ongoing', 'administration')), state('ongoing', 'administration'));
  assert.deepEqual(changeVrpgSelection(data, state('appeal'), 'law', 'elg'), {area: 'social', law: 'elg', action: '', stage: ''});
});

function form(selection: VrpgSelectionState, inputDate = ''): CalculatorFormState {
  return {
    authorityCode: 'BE', profileId: 'vrpg-be', inputDate, deadlineDays: '10',
    selectors: {deliveryMethod: 'otherLegallyRelevantDate'}, calendarId: 'be-public-holidays',
    calendarOverrideReason: '', additionalHolidayAnchor: '', holidayAnchorConfirmed: false,
    deliveryFictionConfirmed: false, specialLawChecked: false, specialRegimeId: '', specialDefinitionId: '',
    specialDateValues: {}, specialLocalTimeValues: {}, specialIntegerValues: {}, specialOverrideConfirmations: [],
    vrpgSelection: selection
  };
}

test('early service date survives all AVIG selection steps and is never copied to the jurisdiction reference date', () => {
  let current = form({area: 'social', law: '', action: '', stage: ''}, '2026-09-16');
  for (const selection of [state('', ''), state('objection'), state('appeal'), state('ongoing'), state('ongoing', 'administration'), state('complaint-correction')]) {
    const next = form(selection);
    assert.equal(primaryDateField(data, next).role, 'service');
    const reconciled = reconcilePrimaryDate(data, current, next);
    assert.equal(reconciled.inputDate, '2026-09-16');
    assert.equal(reconciled.cleared, false);
    assert.equal(EMPTY_SOCIAL_CONTEXT.jurisdictionReferenceDate, '');
    current = {...next, ...reconciled};
  }
  const fund = socialUiSelection(data, state('appeal'), 'unemploymentFund')!;
  const input = socialInputFromUi(fund, 'BE', '2026-09-16', '', {...context('unemploymentFund'), jurisdictionReferenceDate: ''});
  assert.equal(input.jurisdictionReferenceDate, '');
  assert.equal(calculateSocialDeadline(input, synthetic).outcome, 'blocked');
});

test('AVIG appeal and supplemental labels are translated in DE and FR', () => {
  assert.deepEqual(vrpgActionOptions(data, state()).find(option => option.key === 'appeal')?.labels,
    {de: 'Beschwerde gegen Einspracheentscheid', fr: 'Recours contre une décision sur opposition'});
  const keys = Object.keys(socialMessages).filter(key => key.toLowerCase().includes('avig'));
  assert.ok(keys.length > 0);
  for (const key of keys) for (const locale of ['de', 'fr'] as const) assert.notEqual(translate(locale, key), key);
});
