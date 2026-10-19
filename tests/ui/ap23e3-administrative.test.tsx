// SPDX-License-Identifier: AGPL-3.0-only
// Actual candidate reader, UI qualification, calculation and export registry share one module identity.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { buildSync } from 'esbuild';
import type * as Helpers from '../../src/ui/administrativeUi';
import type * as Export from '../../src/ui/administrativeExport';
import type { ParsedFormat9Data } from '../../src/core/releaseFormat9';
import type { AdministrativeDeadlineInput } from '../../src/core/administrativeDeadline';
import { administrativeMessages } from '../../src/ui/administrativeMessages';

const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const bundle = buildSync({ stdin: { contents: `
  import * as React from 'react';
  import {renderToStaticMarkup} from 'react-dom/server';
  import {setIconOptions} from '@fluentui/react/lib/Styling';
  import {AdministrativeProcedureFields,AdministrativeResultView} from './src/ui/administrativeUi';
  import {createFormat9CalculationData} from './src/core/format9CalculationData';
  import {ap23e3ManifestText,ap23e3Files} from './src/release/ap23e3CandidateData';
  export * from './src/ui/administrativeUi';
  export * from './src/ui/administrativeExport';
  setIconOptions({disableWarnings:true});
  export const runtime=createFormat9CalculationData(ap23e3ManifestText,ap23e3Files,{mode:'localReference'});
  export const fields=props=>renderToStaticMarkup(React.createElement('div',{className:'fr-form__grid'},React.createElement(AdministrativeProcedureFields,props)));
  export const result=props=>renderToStaticMarkup(React.createElement(AdministrativeResultView,props));
`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, platform: 'node', format: 'cjs', write: false,
  external: ['react', 'react-dom/server'], logLevel: 'silent' });
const module = { exports: {} };
new Function('require', 'module', 'exports', bundle.outputFiles[0]!.text)(require, module, module.exports);
const ui = module.exports as typeof Helpers & typeof Export & {
  runtime: { administrativeContext: ParsedFormat9Data };
  fields(props: Helpers.AdministrativeProcedureFieldsProps): string;
  result(props: Helpers.AdministrativeResultViewProps): string;
};
const context = ui.runtime.administrativeContext;
const catalog = context.administrativeCatalog;
function selection(pathId: string, qualification: Helpers.AdministrativeUiState['qualification'] = 'generalActualReceipt'): Helpers.AdministrativeUiState {
  const path = catalog.paths.find(value => value.pathId === pathId)!;
  return { pathId, stage: path.stages[0]!, qualification, urgency: 'none' };
}
function qualify(pathId: string, inputDate = '2026-10-02', qualification: Helpers.AdministrativeUiState['qualification'] = 'generalActualReceipt') {
  const path = catalog.paths.find(value => value.pathId === pathId)!;
  const law = catalog.laws.find(value => value.lawId === path.lawId)!;
  return ui.qualifyAdministrativeUiInput({ catalog, lawId: path.lawId, authorityCanton: law.canton,
    inputDate, deadlineDays: path.duration.kind === 'statutoryDays' ? path.duration.value : 10,
    state: selection(pathId, qualification) });
}
function render(pathId: string, inputDate: string, locale: 'de' | 'fr' = 'de') {
  const actual = qualify(pathId, inputDate); assert.deepEqual(actual.errors, {}); assert.ok(actual.input);
  const result = ui.calculateAdministrativeUiDeadline(actual.input, context);
  const html = ui.result({ catalog, context, result, input: actual.input, locale, calendarReference: '', onCalendarReferenceChange() {} });
  return { result, html, document: new JSDOM(html).window.document, input: actual.input };
}

test('AP23E3 all 25 paths and new actions have complete, symmetric DE/FR names', () => {
  assert.equal(catalog.paths.length, 25);
  assert.deepEqual(Object.keys(administrativeMessages.de).sort(), Object.keys(administrativeMessages.fr).sort());
  for (const path of catalog.paths) for (const locale of ['de', 'fr'] as const) {
    const messages = administrativeMessages[locale] as Record<string, string>;
    assert.ok(messages[`action.${path.action}`], path.action);
    assert.ok(messages[`law.${path.lawId}`], path.lawId);
    const presentation = ui.administrativeQualificationPresentation(catalog, path);
    assert.ok(messages[presentation.choiceKey]); assert.ok(messages[presentation.scopeKey]);
  }
});

test('AP23E3 positive current choices yield exact case facts for all 13 new paths only', () => {
  for (const policy of catalog.qualificationPolicies) {
    const result = qualify(policy.pathId); assert.deepEqual(result.errors, {}); assert.ok(result.input);
    if (policy.mode === 'legacyV1') {
      assert.equal(result.input.caseQualification, undefined, policy.pathId);
    } else {
      const { urgency: _urgency, ...requirements } = policy.requirements;
      assert.deepEqual(result.input.caseQualification, { ...requirements, direction: 'forward' }, policy.pathId);
      assert.equal(result.input.urgency, 'none');
    }
  }
});

test('AP23E3 no new path infers qualification from pending, unknown or special cases', () => {
  for (const policy of catalog.qualificationPolicies.filter(value => value.mode === 'qualifiedDayProcedure')) {
    for (const qualification of ['', 'unknown', 'specialOrDeviating'] as const) {
      const result = qualify(policy.pathId, '2026-10-02', qualification);
      assert.equal(result.input, undefined); assert.ok(result.errors.qualification);
    }
  }
});

test('AP23E3 path and stage changes discard all current qualification without creating new controls', () => {
  const initial = selection('ar-admin-20');
  const execution = ui.changeAdministrativeSelection(catalog, 'vrpg-ar', initial, 'pathId', 'ar-execution-5');
  assert.equal(execution.qualification, ''); assert.equal(execution.urgency, '');
  const court = ui.changeAdministrativeSelection(catalog, 'vrpg-ar', initial, 'stage', 'court');
  assert.equal(court.pathId, ''); assert.equal(court.qualification, '');
  const html = ui.fields({ catalog, lawId: 'vrg-lu', locale: 'de', value: selection('lu-admin-ordered'), onChange() {} });
  assert.match(html, /<output[^>]+aria-label="Verfahrenshandlung"/);
  assert.match(html, /prozessuale Eingabe \(keine Zahlung\)/);
  assert.doesNotMatch(html, /type="checkbox"|Fristauslösendes Dokument|Ich bestätige|Gerichtliche Dringlichkeitsverfügung/);
  assert.match(html, /fr-form__grid/);
});

test('AP23E3 ordinary, submission and non-money execution choices state the path-specific requirements', () => {
  for (const [pathId, pattern] of [
    ['lu-admin-30', /Endentscheid, vollständiger Empfang, unbestrittene Belehrung/],
    ['zg-admin-ordered', /Prozessuale Eingabe, vollständiger Empfang, unbestrittene Anordnung/],
    ['ar-execution-5', /Nichtgeldvollstreckung nach Art\. 63 VRPG/]
  ] as const) {
    const path = catalog.paths.find(value => value.pathId === pathId)!;
    const html = ui.fields({ catalog, lawId: path.lawId, locale: 'de', value: selection(pathId), onChange() {} });
    const presentation = ui.administrativeQualificationPresentation(catalog, path);
    assert.match((administrativeMessages.de as Record<string, string>)[presentation.choiceKey]!, pattern);
    // Fluent UI SSR omits selected text until mount, but the complete scope is already accessible.
    assert.match(html, /title="[^"]*(?:unbestritten|Fünftagesfrist)/);
  }
});

test('AP23E3 all three cantons calculate local results with export blocked, including AR five-day appeal', () => {
  for (const [pathId, inputDate, expected] of [
    ['lu-admin-30', '2026-10-02', '2026-11-02'],
    ['zg-admin-20', '2026-10-02', '2026-10-22'],
    ['ar-execution-5', '2026-09-16', '2026-09-21']
  ]) {
    const output = render(pathId!, inputDate!);
    assert.equal(output.result.outcome, 'calculated');
    if (output.result.outcome !== 'calculated') continue;
    assert.equal(output.result.finalEnd, expected); assert.equal(output.result.referenceOnly, true);
    assert.match(output.html, /Lokale Prüfrechnung/); assert.match(output.html, /Kein Kalenderexport/);
    assert.equal(output.document.querySelector('.fr-calendar-export'), null);
    const readable = output.document.querySelector('[data-testid="administrative-readable-trace"]')!;
    assert.doesNotMatch(readable.textContent, /historische Wiederverwendung|Quellenfreigabe/);
    assert.match(output.document.querySelector('[data-testid="administrative-technical-evidence"]')!.textContent, /historische Wiederverwendung/);
    assert.throws(() => ui.createAdministrativeCalendarEntry({ input: output.input, context, result: output.result, locale: 'de' }), /calendarExportNotBound/);
  }
});

test('AP23E3 AR suspension trace uses human names, exact AR law and dates, not technical IDs', () => {
  const output = render('ar-court-30', '2027-07-10');
  const readable = output.document.querySelector('[data-testid="administrative-readable-trace"]')!;
  assert.match(readable.textContent, /Friststillstand im Sommer: 15\.07\.2027–15\.08\.2027/);
  assert.match(readable.textContent, /VRPG AR – Verwaltungsrechtspflege: Art\. 7/);
  assert.doesNotMatch(readable.textContent, /SRC-|ar-summer|ti-|gr-|ZPO|BGG|VwVG/);
  assert.ok(readable.querySelector('a[href="https://ar.clex.ch/api/de/versions/1285/pdf_file"]'));
});

test('AP23E3 AR-O1 has its own DE/FR diagnostic, no definitive result and no export', () => {
  for (const locale of ['de', 'fr'] as const) {
    const output = render('ar-court-30', '2027-02-18', locale);
    assert.equal(output.result.outcome, 'blocked');
    assert.match(output.html, locale === 'de' ? /Appenzell Ausserrhoden ist gesperrt/ : /Appenzell Rhodes-Extérieures est bloqué/);
    assert.doesNotMatch(output.html, /Tessiner Grenzfall|cas limite tessinois/);
    assert.equal(output.document.querySelector('.fr-result__hero'), null);
    assert.equal(output.document.querySelector('.fr-calendar-export'), null);
  }
});

test('AP23E3 altered current facts cannot reuse a former calculation or export capability', () => {
  const output = render('ar-execution-5', '2026-09-16');
  const input = { ...output.input, caseQualification: { ...output.input.caseQualification!, decisionKind: 'unknown' } } as AdministrativeDeadlineInput;
  const rejected = ui.calculateAdministrativeUiDeadline(input, context);
  assert.equal(rejected.outcome, 'blocked');
  assert.equal(ui.administrativeExportAvailable(input, context, output.result), false);
});
