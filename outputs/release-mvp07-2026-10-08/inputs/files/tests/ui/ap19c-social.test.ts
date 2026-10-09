// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import type { CalculationData } from '../../src/core';
import type { SocialProcedureCatalog } from '../../src/core/socialTypes';
import { calculateSocialDeadline } from '../../src/core/socialDeadline';
import { socialObjectSha256 } from '../../src/core/socialCatalog';
import { ap19cCandidateCalculationData as data } from '../../src/release/ap19cCandidateData';
import { mvp04CalculationData as previous } from '../../src/release/mvp04ReleaseData';
import {
  EMPTY_SOCIAL_CONTEXT, SOCIAL_CANTONS, hasSocialUi, socialInputFromUi, socialNeedsJurisdictionDate,
  socialNeedsPartyDomicile, socialJurisdictionLabel, socialUiSelection, type SocialUiContext
} from '../../src/ui/socialUi';
import { changeVrpgSelection, resolveVrpgSelection, sanitizeVrpgSelection, selectionFromLegacy, vrpgActionOptions, vrpgLawOptions, type VrpgSelectionState } from '../../src/ui/vrpgSelection';
import { initialDefaults, sanitizeDefaults, saveDefaults, type StorageLike } from '../../src/ui/defaults';
import { socialMessages } from '../../src/ui/socialMessages';
import { translate, translateBlockReason } from '../../src/ui/i18n';
import { createDeadlineCalendarEntry } from '../../src/ui/calendarExport';

type Mutable<T> = T extends readonly (infer U)[] ? Mutable<U>[] : T extends object ? {-readonly [P in keyof T]: Mutable<T[P]>} : T;
const state = (law = 'elg', action = 'objection', stage = ''): VrpgSelectionState => ({area: 'social', law, action, stage});
const context: SocialUiContext = {jurisdictionCanton: 'BE', partyDomicileCanton: 'BE', holidayConnections: 'partyBE', jurisdictionReferenceDate: '2026-09-21'};

/** Invented test-only approvals in memory. Never modifies candidate artifacts. */
function syntheticData(): CalculationData {
  const source = [...data.socialProcedureCatalogs!.values()][0]!;
  const catalog = JSON.parse(JSON.stringify(source)) as Mutable<SocialProcedureCatalog>;
  for (const rule of catalog.federalRules) rule.status = 'reviewed';
  for (const binding of catalog.cantonalBindings) {
    binding.status = 'reviewed';
    binding.legalValidity = {from: '2026-01-01', to: '2027-12-31'};
  }
  for (const eligibility of catalog.releaseEligibility) {
    eligibility.status = 'approved';
    eligibility.approval = {approvedBy: 'SYNTHETIC UI TEST ONLY', approvedOn: '2026-09-25', decisionRef: 'TEST-NOT-PRODUCTION'};
    eligibility.ruleRef.sha256 = socialObjectSha256(catalog.federalRules.find(rule => rule.ruleId === eligibility.ruleRef.ruleId));
    eligibility.bindingRef.sha256 = socialObjectSha256(catalog.cantonalBindings.find(binding => binding.bindingId === eligibility.bindingRef.bindingId));
  }
  return {...data, socialProcedureCatalogs: new Map([[catalog.catalogId, catalog]])};
}

test('C1 explicitly offers ELG only with format 5, never AVIG or KVG', () => {
  assert.equal(hasSocialUi(previous), false);
  assert.equal(hasSocialUi(data), true);
  assert.deepEqual(vrpgLawOptions(state(), data).map(choice => choice.key), ['', 'ivg', 'ahvg', 'uvg', 'elg']);
  assert.deepEqual(vrpgLawOptions(state(), previous).map(choice => choice.key), ['', 'ivg', 'ahvg', 'uvg']);
  assert.equal(resolveVrpgSelection(previous, state()).kind, 'unavailable');
  for (const law of ['avig', 'kvg', 'unknown']) assert.equal(resolveVrpgSelection(data, state(law)).kind, 'unavailable');
});

for (const law of ['ivg', 'ahvg', 'uvg', 'elg']) {
  for (const [action, stage] of [[law === 'ivg' ? 'preliminary-objection' : 'objection', ''], ['appeal', ''], ['ongoing', 'administration'], ['complaint-correction', '']]) {
    test(`${law}/${action}: stable UI choice uses the national resolver and preserves the candidate block`, () => {
      const selection = state(law, action, stage);
      assert.equal(resolveVrpgSelection(data, selection).kind, 'social');
      const selected = socialUiSelection(data, selection)!;
      assert.ok(selected);
      const input = socialInputFromUi(selected, 'BE', '2026-09-16', '10', {
        ...context, jurisdictionReferenceDate: action === 'complaint-correction' ? '2026-09-01' : '2026-09-21'
      });
      assert.equal(input.qualificationBasis, 'displayed-model-scope');
      assert.equal(input.notificationConfirmed, false);
      const result = calculateSocialDeadline(input, data);
      assert.equal(result.outcome, 'blocked');
      assert.deepEqual(result.blockReasonKeys, ['not-released']);
      assert.equal(result.finalDeadline, undefined);
      assert.equal(resolveVrpgSelection(data, state(law, 'ongoing', 'court')).kind, 'unavailable');
    });
  }
}

test('missing or non-Bern case qualification cannot inherit the selected product context', () => {
  const approved = syntheticData();
  const selected = socialUiSelection(approved, state())!;
  assert.deepEqual(socialInputFromUi(selected, 'BE', '2026-09-16', '', EMPTY_SOCIAL_CONTEXT).caseFacts, {});
  assert.equal(SOCIAL_CANTONS.length, 26);
  for (const jurisdictionCanton of ['', 'ZH', 'XX']) {
    const input = socialInputFromUi(selected, 'BE', '2026-09-16', '', {...context, jurisdictionCanton});
    assert.equal(calculateSocialDeadline(input, approved).outcome, 'blocked');
  }
  for (const law of ['ivg', 'ahvg', 'uvg']) {
    const selectedOld = socialUiSelection(approved, state(law, law === 'ivg' ? 'preliminary-objection' : 'objection'))!;
    assert.equal(calculateSocialDeadline(socialInputFromUi(selectedOld, 'BE', '2026-09-16', '', {...context, jurisdictionCanton: 'ZH'}), approved).outcome, 'blocked');
  }
});

test('ELG court domicile and jurisdiction date are independent case facts, never copied from service', () => {
  const approved = syntheticData();
  const selected = socialUiSelection(approved, state('elg', 'appeal'))!;
  assert.equal(socialNeedsJurisdictionDate(selected), true);
  assert.equal(socialNeedsPartyDomicile(selected), true);
  const input = socialInputFromUi(selected, 'BE', '2026-09-16', '', context);
  assert.equal(input.jurisdictionReferenceDate, '2026-09-21');
  assert.equal(input.caseFacts.partyDomicileCanton, 'BE');
  assert.equal(calculateSocialDeadline(input, approved).outcome, 'calculated');
  for (const change of [{partyDomicileCanton: ''}, {partyDomicileCanton: 'ZH'}, {jurisdictionReferenceDate: ''}]) {
    assert.equal(calculateSocialDeadline(socialInputFromUi(selected, 'BE', '2026-09-16', '', {...context, ...change}), approved).outcome, 'blocked');
  }
});

test('all court paths ask for the actual competent court canton, not a former administrative body', () => {
  for (const law of ['ivg', 'ahvg', 'uvg', 'elg']) {
    for (const action of ['appeal', 'complaint-correction']) {
      assert.equal(socialJurisdictionLabel(socialUiSelection(data, state(law, action))!), 'social.jurisdiction.court');
    }
  }
});

test('explicit twelve-row legacy migration transfers selection only and rejects mismatched IDs', () => {
  for (const [law, prefix] of [['ivg', 'SOC-IV'], ['ahvg', 'SOC-AHV'], ['uvg', 'SOC-UV']]) {
    for (const [suffix, action, stage] of [[law === 'ivg' ? 'PRE' : 'OBJ', law === 'ivg' ? 'preliminary-objection' : 'objection', ''], ['APP', 'appeal', ''], ['ADM', 'ongoing', 'administration'], ['CORRECTION', 'complaint-correction', '']]) {
      const mappingId = `${prefix}-${suffix}`;
      const regimeId = `ap17c-${mappingId.toLowerCase()}`;
      const definitionId = `AP17C-${mappingId}-001`;
      assert.deepEqual(selectionFromLegacy(data, regimeId, definitionId), state(law, action, stage));
      const migrated = sanitizeDefaults(data, {...initialDefaults(data), version: 2, profileId: 'vrpg-be',
        specialRegimeId: regimeId, specialDefinitionId: definitionId, socialContext: context, holidayAnchorConfirmed: true});
      assert.deepEqual(migrated.vrpgSelection, state(law, action, stage));
      assert.equal('socialContext' in migrated, false);
      assert.equal('holidayAnchorConfirmed' in migrated, false);
      assert.equal(selectionFromLegacy(data, regimeId, 'AP17C-SOC-INVALID-001').area, '');
      assert.equal(selectionFromLegacy(data, regimeId, '').area, '');
    }
  }
  assert.equal(selectionFromLegacy(data, 'atsg-60-social-insurance-appeal', 'ATSG-SPEC-REL-060').area, '');
});

test('holiday facts remain separate from jurisdiction and only real choices resolve the calendar', () => {
  const approved = syntheticData();
  const selected = socialUiSelection(approved, state())!;
  for (const holidayConnections of ['', 'otherOrUnclear', 'foreign']) {
    const input = socialInputFromUi(selected, 'BE', '2026-09-16', '', {...context, holidayConnections});
    assert.equal(input.holidayResolution.status, 'unknown');
    assert.equal(calculateSocialDeadline(input, approved).outcome, 'blocked');
  }
  const input = socialInputFromUi(selected, 'BE', '2026-09-16', '', {...context, holidayConnections: 'partyAndRepresentativeBE'});
  assert.deepEqual(input.holidayResolution.anchors.map(anchor => anchor.role), ['party', 'representative']);
  assert.equal(calculateSocialDeadline(input, approved).outcome, 'calculated');
});

test('synthetic positive UI result carries unchanged ICS semantics and fixed duration cannot leak from free input', () => {
  const approved = syntheticData();
  const selected = socialUiSelection(approved, state())!;
  const input = socialInputFromUi(selected, 'BE', '2026-09-16', '999', context);
  assert.equal('days' in input, false);
  const result = calculateSocialDeadline(input, approved);
  assert.equal(result.outcome, 'calculated');
  assert.equal(result.finalDeadline?.date, '2026-10-16');
  const ics = createDeadlineCalendarEntry({deadlineDate: result.finalDeadline!.date, locale: 'de', reference: 'SYNTHETIC UI TEST'});
  assert.match(ics.content, /DTSTART;VALUE=DATE:20261016/);
  assert.match(ics.content, /TRIGGER:-PT112H/);
  assert.match(ics.content, /TRANSP:TRANSPARENT/);
  const ordered = socialUiSelection(approved, state('elg', 'ongoing', 'administration'))!;
  const resultOrdered = calculateSocialDeadline(socialInputFromUi(ordered, 'BE', '2026-09-16', '10', context), approved);
  assert.equal(resultOrdered.finalDeadline?.date, '2026-09-28');
  assert.equal(calculateSocialDeadline(socialInputFromUi(ordered, 'BE', '2026-09-16', '', context), approved).outcome, 'blocked');
});

test('stable selections survive defaults while case facts, dates and confirmations never persist', () => {
  let raw = '';
  const storage: StorageLike = {getItem: () => raw, setItem: (_key, value) => {raw = value;}, removeItem: () => {raw = '';}};
  const defaults = {...initialDefaults(data), profileId: 'vrpg-be', vrpgSelection: state('elg', 'appeal'), socialContext: context};
  assert.equal(saveDefaults(storage, defaults), true);
  assert.doesNotMatch(raw, /socialContext|jurisdictionCanton|partyDomicileCanton|jurisdictionReferenceDate|competentBodyQualified|2026-09/);
  assert.deepEqual(sanitizeDefaults(data, JSON.parse(raw)).vrpgSelection, state('elg', 'appeal'));
  assert.equal(sanitizeDefaults(previous, JSON.parse(raw)).vrpgSelection.law, '');
  for (const law of ['ivg', 'ahvg', 'uvg']) {
    const selection = state(law, 'complaint-correction');
    assert.deepEqual(sanitizeVrpgSelection(data, selection), selection);
  }
  assert.deepEqual(changeVrpgSelection(data, state('elg', 'appeal'), 'law', 'ivg'), state('ivg', '', ''));
});

test('social result and block messages, labels and preview boundary are explicit in DE and FR', () => {
  for (const key of Object.keys(socialMessages)) for (const locale of ['de', 'fr'] as const) assert.notEqual(translate(locale, key), key);
  for (const locale of ['de', 'fr'] as const) assert.notEqual(translateBlockReason(locale, 'not-released'), 'not-released');
  assert.equal(translate('de', 'form.authority'), 'Verfahrenskontext');
  assert.equal(translate('fr', 'form.authority'), 'Contexte de la procédure');
  const main = readFileSync('src/ui/preview/main.tsx', 'utf8');
  assert.match(main, /candidate === 'ap19c1' \? ap19cCandidateCalculationData/);
  assert.doesNotMatch(main, /: ap19cCandidateCalculationData;/);
  const app = readFileSync('src/ui/FristenrechnerApp.tsx', 'utf8');
  assert.match(app, /calculateSocialDeadline\(input, data\)/);
  assert.match(app, /socialNeedsJurisdictionDate\(socialSelection\)/);
  // The date belongs to the national path, before an AVIG origin selects a binding.
  assert.match(app, /socialPath \? \(\s*<DateInput/);
  assert.doesNotMatch(app, /status: 'approved'|SYNTHETIC UI TEST/);
});

test('each of the sixteen C1 selections determines one document without an extra document input', () => {
  const catalog = [...data.socialProcedureCatalogs!.values()][0]!;
  const keys = catalog.federalRules.map(rule => `${rule.law}/${rule.action}/${rule.stage}`);
  assert.equal(keys.length, 16);
  assert.equal(new Set(keys).size, 16);
  for (const rule of catalog.federalRules) {
    const selected = socialUiSelection(data, state(rule.law,
      rule.action === 'ordered-administrative-days' ? 'ongoing' : rule.action,
      rule.action === 'ordered-administrative-days' ? 'administration' : ''))!;
    assert.equal(selected.rule.triggerKind, rule.triggerKind);
    assert.equal(socialInputFromUi(selected, 'BE', '2026-09-16', '10', context).triggerKind, rule.triggerKind);
  }
});

test('C1 appeal choices name the actual decision type in DE and FR, without changing legacy labels or IDs', () => {
  for (const law of ['ivg', 'ahvg', 'uvg', 'elg']) {
    const options = vrpgActionOptions(data, state(law));
    assert.deepEqual(options.find(option => option.key === 'appeal')?.labels, law === 'ivg'
      ? {de: 'Beschwerde gegen Verfügung', fr: 'Recours contre une décision'}
      : {de: 'Beschwerde gegen Einspracheentscheid', fr: 'Recours contre une décision sur opposition'});
  }
  assert.equal(vrpgActionOptions(previous, state('ivg')).find(option => option.key === 'appeal')?.labels.de, 'Beschwerde ans Versicherungsgericht');
});

test('C1 explanatory fields and source evidence live only inside the initially closed social trace', () => {
  const app = readFileSync('src/ui/FristenrechnerApp.tsx', 'utf8');
  const form = app.slice(app.indexOf('<form className="fr-form"'), app.indexOf('</form>'));
  assert.doesNotMatch(form, /renderFixedValue\('vrpg.context.triggerKind'|social.scopeLabel|social.contextNotice/);
  // Real case inputs and visible matter / notification boundaries remain in place.
  assert.match(form, /socialJurisdictionLabel\(socialPath, socialContext.decisionOrigin\)/);
  assert.match(form, /socialNeedsPartyDomicile\(socialSelection\)/);
  assert.match(form, /socialNeedsJurisdictionDate\(socialSelection\)/);
  assert.match(form, /renderFixedValue\('vrpg.context.matter'/);
  assert.match(form, /renderFixedValue\('vrpg.context.notificationChannel'/);
  const panel = app.slice(app.indexOf('function SpecialResultPanel'), app.indexOf('function ValidationResultPanel'));
  const traceStart = panel.indexOf('<details className="fr-trace"');
  const trace = panel.slice(traceStart, panel.indexOf('</details>', traceStart));
  assert.match(trace, /open=\{!socialSelection && result.outcome === 'blocked'\}/);
  for (const key of ['social.scopeLabel', 'social.contextNotice', 'social.evidence', 'vrpg.context.triggerKind']) {
    assert.ok(trace.includes(key), key);
    assert.ok(!panel.slice(0, traceStart).includes(key), key);
  }
  assert.match(trace, /href=\{source.url\}/);
});
