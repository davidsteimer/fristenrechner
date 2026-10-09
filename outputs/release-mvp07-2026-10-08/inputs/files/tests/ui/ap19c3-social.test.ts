// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { calculateSocialDeadline, socialObjectSha256 } from '../../src/core';
import type { CalculationData, SocialProcedureCatalog } from '../../src/core';
import { ap19c3CandidateCalculationData as data } from '../../src/release/ap19c3CandidateData';
import { ap19c2CandidateCalculationData as c2 } from '../../src/release/ap19c2CandidateData';
import { ap19cCandidateCalculationData as c1 } from '../../src/release/ap19cCandidateData';
import { mvp04CalculationData as released } from '../../src/release/mvp04ReleaseData';
import {
  EMPTY_SOCIAL_CONTEXT, socialInputFromUi, socialNeedsJurisdictionDate, socialNeedsPartyDomicile,
  socialUsesDomicileScope, socialJurisdictionDateLabel, socialJurisdictionLabel, socialUiPath, socialUiSelection,
  type SocialUiContext
} from '../../src/ui/socialUi';
import { changeVrpgSelection, resolveVrpgSelection, sanitizeVrpgSelection, vrpgActionOptions, vrpgLawOptions, type VrpgSelectionState } from '../../src/ui/vrpgSelection';
import { initialDefaults, sanitizeDefaults, saveDefaults, type StorageLike } from '../../src/ui/defaults';
import { primaryDateField, reconcilePrimaryDate } from '../../src/ui/dateTransition';
import type { CalculatorFormState } from '../../src/ui/model';
import { socialMessages } from '../../src/ui/socialMessages';
import { translate } from '../../src/ui/i18n';
import { createDeadlineCalendarEntry } from '../../src/ui/calendarExport';

type Mutable<T> = T extends readonly (infer U)[] ? Mutable<U>[] : T extends object ? {-readonly [P in keyof T]: Mutable<T[P]>} : T;
const state = (action = 'objection', stage = ''): VrpgSelectionState => ({area: 'social', law: 'kvg', action, stage});
const actions = [['objection', '', 'OBJ'], ['appeal', '', 'APP'], ['ongoing', 'administration', 'ADM'], ['complaint-correction', '', 'CORRECTION']] as const;
function context(court: boolean): SocialUiContext {
  return {...EMPTY_SOCIAL_CONTEXT, jurisdictionCanton: court ? 'BE' : '', partyDomicileCanton: 'BE', holidayConnections: 'partyBE', jurisdictionReferenceDate: court ? '2026-09-16' : ''};
}
function syntheticData(): CalculationData {
  const value = JSON.parse(JSON.stringify(data.socialProcedureCatalogs!.get('ch-social-procedures'))) as Mutable<SocialProcedureCatalog>;
  value.federalRules.forEach(rule => { rule.status = 'reviewed'; });
  value.cantonalBindings.forEach(binding => { binding.status = 'reviewed'; binding.legalValidity = {from: '2026-01-01', to: '2027-12-31'}; });
  value.releaseEligibility.forEach(entry => {
    // Test-only approval, never written to a candidate, preview or host.
    entry.status = 'approved';
    entry.approval = {approvedBy: 'SYNTHETIC UI TEST ONLY', approvedOn: '2026-09-28', decisionRef: 'TEST-NOT-PRODUCTION'};
    entry.ruleRef.sha256 = socialObjectSha256(value.federalRules.find(rule => rule.ruleId === entry.ruleRef.ruleId));
    entry.bindingRef.sha256 = socialObjectSha256(value.cantonalBindings.find(binding => binding.bindingId === entry.bindingRef.bindingId));
  });
  return {...data, socialProcedureCatalogs: new Map([[value.catalogId, value]])};
}
const synthetic = syntheticData();

test('C3 offers KVG only with its actual candidate path, never on historical C1, C2 or released data', () => {
  assert.deepEqual(vrpgLawOptions(state(), data).map(option => option.key), ['', 'ivg', 'ahvg', 'uvg', 'elg', 'avig', 'kvg']);
  for (const older of [c1, c2, released]) {
    assert.equal(vrpgLawOptions(state(), older).some(option => option.key === 'kvg'), false);
    assert.equal(socialUiPath(older, state()), undefined);
    assert.equal(socialUiSelection(older, state()), undefined);
    assert.equal(resolveVrpgSelection(older, state()).kind, 'unavailable');
  }
});

for (const [action, stage, suffix] of actions) {
  test(`KVG ${action}: one explicit action selects its single document and route without another dropdown`, () => {
    const selection = state(action, stage);
    const path = socialUiPath(data, selection)!;
    const selected = socialUiSelection(data, selection)!;
    assert.equal(path.selections.length, 1);
    assert.equal(path.rule.ruleId, `CH-SOC-KVG-OKP-${suffix}`);
    assert.equal(selected.binding.bindingId, `BE-SOC-KVG-OKP-${suffix}`);
    assert.equal(resolveVrpgSelection(data, selection).kind, 'social');
    const court = selected.rule.stage === 'cantonal-insurance-court';
    const input = socialInputFromUi(selected, 'BE', '2026-09-16', '10', context(court));
    assert.equal(input.caseFacts.decisionOrigin, 'healthInsurer');
    assert.equal(input.caseFacts.partyDomicileCanton, 'BE');
    assert.equal(input.qualificationBasis, 'displayed-model-scope');
    assert.equal(input.notificationConfirmed, false);
    assert.equal(input.triggerKind, selected.rule.triggerKind);
    assert.equal(socialUsesDomicileScope(selected), !court);
    assert.equal(socialNeedsJurisdictionDate(selected), court);
    assert.equal(socialNeedsPartyDomicile(selected), true);
    assert.equal(input.jurisdictionReferenceDate, court ? '2026-09-16' : undefined);
    assert.equal('authoritySeat' in input, false);
    const result = calculateSocialDeadline(input, synthetic);
    assert.equal(result.outcome, 'calculated', JSON.stringify(result.blockReasonKeys));
    assert.equal(result.finalDeadline?.date, action === 'ongoing' || action === 'complaint-correction' ? '2026-09-28' : '2026-10-16');
    assert.deepEqual(calculateSocialDeadline(input, data).blockReasonKeys, ['not-released']);
  });

  test(`KVG ${action}: no case domicile or holiday anchor is silently inferred from the Bern profile`, () => {
    const selected = socialUiSelection(data, state(action, stage))!;
    const court = selected.rule.stage === 'cantonal-insurance-court';
    for (const partyDomicileCanton of ['', 'ZH', 'XX']) {
      const input = socialInputFromUi(selected, 'BE', '2026-09-16', '10', {...context(court), partyDomicileCanton});
      assert.notEqual(input.caseFacts.partyDomicileCanton, 'BE');
      assert.equal(calculateSocialDeadline(input, synthetic).outcome, 'blocked');
    }
    for (const holidayConnections of ['', 'otherOrUnclear']) {
      const input = socialInputFromUi(selected, 'BE', '2026-09-16', '10', {...context(court), holidayConnections});
      assert.equal(input.holidayResolution.status, 'unknown');
      assert.equal(calculateSocialDeadline(input, synthetic).outcome, 'blocked');
    }
    assert.equal(calculateSocialDeadline(socialInputFromUi(selected, 'BE', '2026-09-16', '10', EMPTY_SOCIAL_CONTEXT), synthetic).outcome, 'blocked');
    const both = socialInputFromUi(selected, 'BE', '2026-09-16', '10', {...context(court), holidayConnections: 'partyAndRepresentativeBE'});
    assert.deepEqual(both.holidayResolution.anchors.map(anchor => anchor.role), ['party', 'representative']);
    assert.equal(calculateSocialDeadline(both, synthetic).outcome, 'calculated');
  });
}

for (const [action, stage] of [['objection', ''], ['ongoing', 'administration']]) {
  test(`KVG ${action}: administration needs only the real insured domicile and separate holiday choice, no fictitious insurer canton`, () => {
    const selected = socialUiSelection(data, state(action, stage))!;
    const reference = socialInputFromUi(selected, 'BE', '2026-09-16', '10', context(false));
    assert.equal(reference.caseFacts.courtCanton, undefined);
    assert.equal(reference.caseFacts.elgAdministrativeCanton, undefined);
    assert.equal(reference.jurisdictionReferenceDate, undefined);
    for (const jurisdictionCanton of ['', 'BE', 'ZH', 'XX']) {
      const input = socialInputFromUi(selected, 'BE', '2026-09-16', '10', {...context(false), jurisdictionCanton});
      assert.deepEqual(input, reference);
      assert.equal(calculateSocialDeadline(input, synthetic).outcome, 'calculated');
    }
    const stale = socialInputFromUi(selected, 'BE', '2026-09-16', '10', {...context(false), jurisdictionReferenceDate: '2026-09-01'});
    assert.equal('jurisdictionReferenceDate' in stale, false);
  });
}

for (const action of ['appeal', 'complaint-correction']) {
  test(`KVG ${action}: court, party domicile and jurisdiction time remain separate explicit case facts`, () => {
    const selected = socialUiSelection(data, state(action))!;
    assert.equal(socialUsesDomicileScope(selected), false);
    assert.equal(socialJurisdictionLabel(selected), 'social.jurisdiction.court');
    assert.equal(socialJurisdictionDateLabel(selected), 'social.jurisdictionDate');
    for (const change of [{jurisdictionCanton: ''}, {jurisdictionCanton: 'ZH'}, {partyDomicileCanton: ''}, {partyDomicileCanton: 'ZH'}, {jurisdictionReferenceDate: ''}]) {
      const input = socialInputFromUi(selected, 'BE', '2026-09-16', '10', {...context(true), ...change});
      assert.equal(calculateSocialDeadline(input, synthetic).outcome, 'blocked');
    }
    const missingDate = socialInputFromUi(selected, 'BE', '2026-09-16', '10', {...context(true), jurisdictionReferenceDate: ''});
    assert.equal(missingDate.jurisdictionReferenceDate, '');
    assert.notEqual(missingDate.jurisdictionReferenceDate, missingDate.legalTriggerDate);
  });
}

test('KVG law and action are stable defaults, while real domicile, court, dates and holiday facts never persist', () => {
  let raw = '';
  const storage: StorageLike = {getItem: () => raw, setItem: (_key, value) => {raw = value;}, removeItem: () => {raw = '';}};
  const defaults = {...initialDefaults(data), profileId: 'vrpg-be', vrpgSelection: state('appeal'), socialContext: context(true)};
  assert.equal(saveDefaults(storage, defaults), true);
  assert.doesNotMatch(raw, /socialContext|partyDomicileCanton|jurisdictionCanton|jurisdictionReferenceDate|holidayConnections|2026-09/);
  assert.deepEqual(sanitizeDefaults(data, JSON.parse(raw)).vrpgSelection, state('appeal'));
  for (const older of [c1, c2, released]) assert.equal(sanitizeDefaults(older, JSON.parse(raw)).vrpgSelection.law, '');
  assert.deepEqual(sanitizeVrpgSelection(data, state('ongoing', 'administration')), state('ongoing', 'administration'));
  assert.deepEqual(changeVrpgSelection(data, state('appeal'), 'law', 'elg'), {area: 'social', law: 'elg', action: '', stage: ''});
  assert.deepEqual(changeVrpgSelection(data, {area: 'social', law: 'elg', action: 'appeal', stage: ''}, 'law', 'kvg'), state('', ''));
});

function form(selection: VrpgSelectionState, inputDate = ''): CalculatorFormState {
  return {authorityCode: 'BE', profileId: 'vrpg-be', inputDate, deadlineDays: '10',
    selectors: {deliveryMethod: 'otherLegallyRelevantDate'}, calendarId: 'be-public-holidays', calendarOverrideReason: '', additionalHolidayAnchor: '',
    holidayAnchorConfirmed: false, deliveryFictionConfirmed: false, specialLawChecked: false, specialRegimeId: '', specialDefinitionId: '',
    specialDateValues: {}, specialLocalTimeValues: {}, specialIntegerValues: {}, specialOverrideConfirmations: [], vrpgSelection: selection};
}

test('early service date survives the KVG workflow but never supplies the separate court-jurisdiction date', () => {
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
});

test('KVG fixed duration ignores a stale free input while ordered duration is always explicit', () => {
  for (const action of ['objection', 'appeal']) {
    const selected = socialUiSelection(data, state(action))!;
    const input = socialInputFromUi(selected, 'BE', '2026-09-16', '999', context(action === 'appeal'));
    assert.equal('days' in input, false);
    const result = calculateSocialDeadline(input, synthetic);
    assert.equal(result.finalDeadline?.date, '2026-10-16');
    const calendar = createDeadlineCalendarEntry({deadlineDate: result.finalDeadline!.date, locale: 'de', reference: 'SYNTHETIC OKP TEST'});
    assert.match(calendar.content, /DTSTART;VALUE=DATE:20261016/);
    assert.match(calendar.content, /TRIGGER:-PT112H/);
    assert.match(calendar.content, /TRANSP:TRANSPARENT/);
  }
  for (const [action, stage] of [['ongoing', 'administration'], ['complaint-correction', '']]) {
    const selected = socialUiSelection(data, state(action, stage))!;
    for (const days of ['', '0', '366', '1.5', 'unknown']) assert.equal(calculateSocialDeadline(socialInputFromUi(selected, 'BE', '2026-09-16', days, context(action === 'complaint-correction')), synthetic).outcome, 'blocked');
  }
});

test('KVG appeal and scope labels are complete in DE/FR and distinguish product limits from statutory ATSG exceptions', () => {
  assert.deepEqual(vrpgActionOptions(data, state()).find(option => option.key === 'appeal')?.labels,
    {de: 'Beschwerde gegen Einspracheentscheid', fr: 'Recours contre une décision sur opposition'});
  const keys = Object.keys(socialMessages).filter(key => key.toLowerCase().includes('kvg'));
  assert.ok(keys.length >= 6);
  for (const key of keys) for (const locale of ['de', 'fr'] as const) assert.notEqual(translate(locale, key), key);
  assert.equal(translate('de', 'social.kvg.productScope'), 'Individuelle OKP-Leistung · versicherte Person mit Wohnsitz im Kanton Bern');
  assert.match(translate('de', 'social.kvg.limits'), /Nichtunterstützung.*nicht.*gesetzlichen ATSG-Ausschluss/);
});

test('KVG form keeps the lean two-column contract, its actual domicile input and explanatory trace boundaries', () => {
  const app = readFileSync('src/ui/FristenrechnerApp.tsx', 'utf8');
  const formSource = app.slice(app.indexOf('<form className="fr-form"'), app.indexOf('</form>'));
  assert.match(formSource, /domicileScope \? renderSocialDomicile\('social.kvg.partyDomicile'\)/);
  assert.match(formSource, /!domicileScope && socialSelection && socialNeedsPartyDomicile/);
  assert.match(formSource, /social.kvg.productScope/);
  assert.doesNotMatch(formSource, /renderFixedValue\('vrpg.context.triggerKind'|social.scopeLabel|social.kvg.limits/);
  assert.match(app, /translate\(locale, 'social.kvg.limits'\)/);
  assert.match(app, /socialNeedsJurisdictionDate\(socialSelection\)/);
  assert.match(app, /socialPath \? \(\s*<DateInput/);
  assert.doesNotMatch(app, /status: 'approved'|SYNTHETIC UI TEST/);
  const main = readFileSync('src/ui/preview/main.tsx', 'utf8');
  assert.match(main, /candidate === 'ap19c3' \? ap19c3CandidateCalculationData/);
  assert.doesNotMatch(main, /: ap19c3CandidateCalculationData;/);
});
