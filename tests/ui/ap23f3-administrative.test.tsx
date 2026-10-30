// SPDX-License-Identifier: AGPL-3.0-only
// The native candidate, qualification helper, calculator and export registry share one module identity.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { buildSync } from 'esbuild';
import type * as Helpers from '../../src/ui/administrativeUi';
import type * as Export from '../../src/ui/administrativeExport';
import type * as Defaults from '../../src/ui/administrativeDefaults';
import type { ParsedFormat10Data } from '../../src/core/releaseFormat10';
import type { AdministrativeDeadlineInput } from '../../src/core/administrativeDeadline';
import { administrativeMessages } from '../../src/ui/administrativeMessages';

const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const bundle = buildSync({ stdin: { contents: `
  import React from 'react';
  import {renderToStaticMarkup} from 'react-dom/server';
  import {setIconOptions} from '@fluentui/react/lib/Styling';
  import {AdministrativeProcedureFields,AdministrativeResultView} from './src/ui/administrativeUi';
  export * from './src/ui/administrativeUi';
  export * from './src/ui/administrativeExport';
  export * from './src/ui/administrativeDefaults';
  export {ap23f3CandidateRuntime as runtime} from './src/release/ap23f3CandidateData';
  setIconOptions({disableWarnings:true});
  export const fields=props=>renderToStaticMarkup(React.createElement('div',{className:'fr-form__grid'},React.createElement(AdministrativeProcedureFields,props)));
  export const result=props=>renderToStaticMarkup(React.createElement(AdministrativeResultView,props));
`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, platform: 'node', format: 'cjs', write: false,
  external: ['react', 'react-dom/server'], logLevel: 'silent' });
const module = { exports: {} };
new Function('require', 'module', 'exports', bundle.outputFiles[0]!.text)(require, module, module.exports);
const ui = module.exports as typeof Helpers & typeof Export & typeof Defaults & {
  runtime: { administrativeContext: ParsedFormat10Data; data: Defaults.AdministrativeDefaultsContext['legacyData'] };
  fields(props: Helpers.AdministrativeProcedureFieldsProps): string;
  result(props: Helpers.AdministrativeResultViewProps): string;
};
const context = ui.runtime.administrativeContext, catalog = context.administrativeCatalog;
const newPaths = catalog.paths.filter(path => ['vrg-zh', 'vrpg-ag', 'vrp-sg'].includes(path.lawId));
function selection(pathId: string, qualification: Helpers.AdministrativeUiState['qualification'] = 'generalActualReceipt'): Helpers.AdministrativeUiState {
  const path = catalog.paths.find(value => value.pathId === pathId)!;
  return { pathId, stage: path.stages[0]!, qualification, urgency: 'none' };
}
function qualify(pathId: string, inputDate = '2026-10-02', qualification: Helpers.AdministrativeUiState['qualification'] = 'generalActualReceipt', days = 10) {
  const path = catalog.paths.find(value => value.pathId === pathId)!;
  return ui.qualifyAdministrativeUiInput({ catalog, lawId: path.lawId,
    authorityCanton: catalog.laws.find(value => value.lawId === path.lawId)!.canton, inputDate,
    deadlineDays: path.duration.kind === 'statutoryDays' ? path.duration.value : days, state: selection(pathId, qualification) });
}
function render(pathId: string, inputDate: string, locale: 'de' | 'fr' = 'de', days = 10) {
  const qualified = qualify(pathId, inputDate, 'generalActualReceipt', days);
  assert.deepEqual(qualified.errors, {}); assert.ok(qualified.input);
  const result = ui.calculateAdministrativeUiDeadline(qualified.input, context);
  const html = ui.result({ catalog, context, result, input: qualified.input, locale, calendarReference: '', onCalendarReferenceChange() {} });
  return { result, html, input: qualified.input, document: new JSDOM(html).window.document };
}

test('AP23F3 the 42-path native catalog has symmetric DE/FR labels for all old and new paths', () => {
  assert.equal(catalog.formatVersion, '3.0.0'); assert.equal(catalog.paths.length, 42); assert.equal(newPaths.length, 17);
  assert.deepEqual(Object.keys(administrativeMessages.de).sort(), Object.keys(administrativeMessages.fr).sort());
  for (const path of catalog.paths) for (const locale of ['de', 'fr'] as const) {
    const messages = administrativeMessages[locale] as Record<string, string>;
    assert.ok(messages[`law.${path.lawId}`], path.lawId);
    assert.doesNotMatch(ui.administrativeActionLabel(path, locale), /^(?:action|path)\./);
    const presentation = ui.administrativeQualificationPresentation(catalog, path);
    assert.ok(messages[presentation.choiceKey], presentation.choiceKey); assert.ok(messages[presentation.scopeKey], presentation.scopeKey);
  }
});

test('AP23F3 the explicit positive grouped qualifier alone supplies all eleven exact V3 facts', () => {
  for (const policy of catalog.qualificationPolicies) {
    const result = qualify(policy.pathId); assert.deepEqual(result.errors, {}); assert.ok(result.input);
    if (policy.mode === 'legacyV1') assert.equal(result.input.caseQualification, undefined, policy.pathId);
    else {
      const { urgency: _urgency, ...requirements } = policy.requirements;
      assert.deepEqual(result.input.caseQualification, { ...requirements, direction: 'forward' }, policy.pathId);
      assert.equal(result.input.urgency, 'none');
      if (policy.mode === 'qualifiedDayProcedureV3') assert.equal(Object.keys(result.input.caseQualification!).length, 11);
    }
  }
});

test('AP23F3 pending, unknown and deviating cases never infer current facts on any new path', () => {
  for (const path of newPaths) for (const choice of ['', 'unknown', 'specialOrDeviating'] as const) {
    const qualified = qualify(path.pathId, '2026-10-02', choice);
    assert.equal(qualified.input, undefined, path.pathId); assert.ok(qualified.errors.qualification);
  }
});

test('AP23F3 action labels distinguish SG VRK, VG and the two five-day measures without another control', () => {
  const expectations: Readonly<Record<string, RegExp>> = {
    'sg-vrk-14': /Dokumentenzugang.*Verwaltungsrekurskommission/,
    'sg-court-14': /Verwaltungsgericht/,
    'sg-admin-measures-5': /massnahme an die Verwaltung/,
    'sg-court-interim-5': /Verwaltungsgericht.*Art\. 60/
  };
  for (const [id, pattern] of Object.entries(expectations)) {
    const path = newPaths.find(value => value.pathId === id)!;
    assert.match(ui.administrativeActionLabel(path, 'de'), pattern);
    const html = ui.fields({ catalog, lawId: path.lawId, locale: 'de', value: selection(id), onChange() {} });
    assert.match(html, /fr-form__grid/);
    assert.doesNotMatch(html, /type="checkbox"|Fristauslösendes Dokument|Zielorgan|Massgeblicher Feiertagskanton/);
  }
});

test('AP23F3 grouped scope states the ZH channel limits, qualified AG execution and SG exception notice', () => {
  for (const [id, pattern] of [
    ['zh-rekurs-30', /Abruffiktion|Kanalstörung/],
    ['ag-execution-10', /§ 83/],
    ['sg-court-interim-5', /Ferienausnahme.*richtig und unbestritten belehrt/],
    ['sg-vrk-14', /Departementsverfügung.*Zugang zu amtlichen Dokumenten/]
  ] as const) {
    const path = newPaths.find(value => value.pathId === id)!;
    const presentation = ui.administrativeQualificationPresentation(catalog, path);
    assert.match((administrativeMessages.de as Record<string, string>)[presentation.scopeKey]!, pattern);
  }
});

test('AP23F3 changing action or stage discards the current positive qualifier', () => {
  const state = selection('sg-vrk-14');
  for (const changed of [ui.changeAdministrativeSelection(catalog, 'vrp-sg', state, 'pathId', 'sg-court-14'),
    ui.changeAdministrativeSelection(catalog, 'vrp-sg', state, 'stage', 'administrativeAppeal')]) {
    assert.equal(changed.qualification, ''); assert.equal(changed.urgency, '');
  }
});

test('AP23F3 all seventeen new V5 preferences round-trip without retaining injected current facts', () => {
  const defaultsContext = { legacyData: ui.runtime.data, administrativeData: context };
  for (const path of newPaths) {
    const input = qualify(path.pathId).input!;
    const clean = ui.sanitizeAdministrativePreferences(defaultsContext, {
      ...ui.emptyAdministrativePreferences(), locale: 'fr', authorityCode: input.authoritySeat.canton,
      deadlineDays: input.deadlineDays, deliveryMethod: 'otherLegallyRelevantDate', procedureSelection: input.selection,
      inputDate: '2026-10-02', calendarReference: 'SYNTHETIC-ONLY', qualification: 'generalActualReceipt',
      caseQualification: input.caseQualification, channelCase: 'ordinaryNoFictionNoOutage', exceptionNotice: 'correctExceptionNotice'
    });
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
    assert.equal(ui.saveAdministrativeDefaults(defaultsContext, storage, clean).persistence, 'stored', path.pathId);
    const reloaded = ui.initializeAdministrativeDefaults(defaultsContext, storage);
    assert.equal(reloaded.persistence, 'stored'); assert.deepEqual(reloaded.preferences.procedureSelection, input.selection);
    assert.doesNotMatch(values.get(ui.ADMINISTRATIVE_DEFAULTS_STORAGE_KEY)!, /inputDate|calendarReference|SYNTHETIC|caseQualification|channelCase|exceptionNotice|targetBody|procedureMatter|2026-10-02/);
  }
});

test('AP23F3 ZH/AG/SG actual native calculations remain local and cannot export by forged flags', () => {
  for (const [id, received, expected] of [
    ['zh-rekurs-30', '2026-10-02', '2026-11-02'],
    ['ag-execution-10', '2027-07-10', '2027-08-23'],
    ['sg-admin-measures-5', '2026-10-02', '2026-10-07'],
    ['sg-court-interim-5', '2027-07-10', '2027-07-15'],
    ['sg-vrk-14', '2027-07-10', '2027-08-25']
  ] as const) {
    const output = render(id, received); assert.equal(output.result.outcome, 'calculated', id);
    if (output.result.outcome !== 'calculated') continue;
    assert.equal(output.result.finalEnd, expected, id); assert.equal(output.result.referenceOnly, true);
    assert.equal(output.document.querySelector('.fr-calendar-export'), null);
    assert.equal(ui.administrativeExportAvailable(output.input, context, output.result), false);
    const forged = { ...output.result, referenceOnly: false, calendarExportAllowed: true };
    assert.equal(ui.administrativeExportAvailable(output.input, context, forged), false);
    assert.throws(() => ui.createAdministrativeCalendarEntry({ input: output.input, context, result: forged, locale: 'de' }), /calendarExportNotBound/);
  }
});

test('AP23F3 readable trace has actual norm segments across the ZH year boundary and no technical IDs', () => {
  for (const locale of ['de', 'fr'] as const) {
    const output = render('zh-court-30', '2026-12-03', locale);
    assert.equal(output.result.outcome, 'calculated');
    const trace = output.document.querySelector('[data-testid="administrative-readable-trace"]')!;
    assert.match(trace.textContent, /03\.12\.2026–31\.12\.2026/);
    assert.match(trace.textContent, /01\.01\.2027–18\.01\.2027/);
    assert.match(trace.textContent, locale === 'de' ? /Revision ab 2027/ : /Révision dès 2027/);
    assert.doesNotMatch(trace.textContent, /SRC-|ap23|zh-winter|normTimeline|historische Wiederverwendung/);
    assert.ok(trace.querySelector('a[href^="https://"]'));
  }
});

test('AP23F3 SG June 2027 norm change and AG holiday use readable linked names', () => {
  const sg = render('sg-court-14', '2027-05-25');
  const sgTrace = sg.document.querySelector('[data-testid="administrative-readable-trace"]')!;
  assert.match(sgTrace.textContent, /25\.05\.2027–31\.05\.2027/);
  assert.match(sgTrace.textContent, /01\.06\.2027/);
  assert.match(sgTrace.textContent, /Gerichtsgesetz SG ab Juni 2027/);
  const ag = render('ag-admin-ordered', '2027-05-26', 'fr', 1);
  assert.equal(ag.result.outcome, 'calculated');
  if (ag.result.outcome === 'calculated') assert.equal(ag.result.finalEnd, '2027-05-28');
  const trace = ag.document.querySelector('[data-testid="administrative-readable-trace"]')!;
  assert.match(trace.textContent, /Fête-Dieu|Corpus Domini/);
  assert.doesNotMatch(trace.textContent, /SRC-|ag-|ap23/);
});

test('AP23F3 F1-O1 is explicitly blocked in both languages with no definitive result or export', () => {
  for (const id of ['zh-court-30', 'ag-court-30']) for (const locale of ['de', 'fr'] as const) {
    const output = render(id, '2027-02-18', locale);
    assert.equal(output.result.outcome, 'blocked');
    assert.match(output.html, locale === 'de' ? /Endverschiebung.*Friststillstand/ : /report.*suspension/);
    assert.doesNotMatch(output.html, /Tessiner Grenzfall|cas limite tessinois|Appenzell Ausserrhoden ist gesperrt/);
    assert.equal(output.document.querySelector('.fr-result__hero'), null);
    assert.equal(output.document.querySelector('.fr-calendar-export'), null);
  }
});

test('AP23F3 malformed current V3 facts are rejected with named diagnostics and cannot reuse a result', () => {
  const cases = [
    ['sg-vrk-14', 'targetBody', 'administrativeCourt', 'administrative.targetBodyMismatch'],
    ['sg-vrk-14', 'procedureMatter', 'priorRequestForFormalDecisionOeffG17', 'administrative.matterNotQualified'],
    ['zh-rekurs-30', 'channelCase', 'channelOutageClaimed', 'administrative.channelCaseNotQualified'],
    ['sg-court-interim-5', 'exceptionNotice', 'missing', 'administrative.exceptionNoticeNotQualified']
  ] as const;
  for (const [id, field, value, reason] of cases) {
    const output = render(id, '2026-10-02');
    const input = { ...output.input, caseQualification: { ...output.input.caseQualification!, [field]: value } } as AdministrativeDeadlineInput;
    const rejected = ui.calculateAdministrativeUiDeadline(input, context);
    assert.equal(rejected.outcome, 'blocked');
    if (rejected.outcome === 'blocked') assert.ok(rejected.blockReasonKeys.includes(reason), rejected.blockReasonKeys.join(','));
    assert.equal(ui.administrativeExportAvailable(input, context, output.result), false);
  }
});
