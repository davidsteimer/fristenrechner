// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { buildSync } from 'esbuild';
import type * as Helpers from '../../src/ui/administrativeUi';
import type * as Export from '../../src/ui/administrativeExport';
import type { AdministrativeProcedureCatalog } from '../../src/core/administrativeTypes';
import type { ParsedFormat8Data } from '../../src/core/releaseFormat8';
import type { AdministrativeDeadlineInput, AdministrativeDeadlineResult } from '../../src/core/administrativeDeadline';
import { administrativeMessages } from '../../src/ui/administrativeMessages';

// Context issuer, UI calculation and export registry intentionally share one bundle.
const bundled = buildSync({ stdin: { contents: `
  import * as React from 'react';
  import {renderToStaticMarkup} from 'react-dom/server';
  import {setIconOptions} from '@fluentui/react/lib/Styling';
  import {AdministrativeProcedureFields,AdministrativeResultView,AdministrativeAutomaticParameters} from './src/ui/administrativeUi';
  export * from './src/ui/administrativeUi';
  export * from './src/ui/administrativeExport';
  export {createSyntheticFormat8Context as context} from './tests/core/ap23d1Fixtures';
  setIconOptions({disableWarnings:true});
  export const fields=(props)=>renderToStaticMarkup(React.createElement('div',{className:'fr-form__grid'},React.createElement(AdministrativeProcedureFields,props)));
  export const result=(props)=>renderToStaticMarkup(React.createElement(AdministrativeResultView,props));
  export const automatic=(props)=>renderToStaticMarkup(React.createElement(AdministrativeAutomaticParameters,props));
`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, platform: 'node', format: 'cjs', write: false,
  external: ['react', 'react-dom/server'], logLevel: 'silent' });
const module = { exports: {} };
new Function('require', 'module', 'exports', bundled.outputFiles[0]!.text)(createRequire(import.meta.url), module, module.exports);
const ui = module.exports as typeof Helpers & typeof Export & {
  context(mode?: 'approved' | 'localReference'): ParsedFormat8Data;
  fields(props: Helpers.AdministrativeProcedureFieldsProps): string;
  result(props: Helpers.AdministrativeResultViewProps): string;
  automatic(props: Parameters<typeof Helpers.AdministrativeAutomaticParameters>[0]): string;
};
const context = ui.context();
const catalog: AdministrativeProcedureCatalog = context.administrativeCatalog;
const approved = ui.context('approved');
const state = (stage = 'administrativeAppeal', pathId = 'ti-80-30'): Helpers.AdministrativeUiState => ({
  stage, pathId, qualification: 'generalActualReceipt', urgency: 'none'
});
function input(overrides: Partial<Helpers.QualifyAdministrativeUiOptions> = {}): AdministrativeDeadlineInput {
  const value = ui.qualifyAdministrativeUiInput({ catalog, lawId: 'lpamm-ti', authorityCanton: 'TI', inputDate: '2026-09-16', deadlineDays: 30,
    state: state(), ...overrides });
  assert.deepEqual(value.errors, {});
  assert.ok(value.input);
  return value.input;
}
function resultHtml(result: AdministrativeDeadlineResult, data = context, actualInput = input(), locale: 'de' | 'fr' = 'de'): string {
  return ui.result({ result, context: data, catalog: data.administrativeCatalog, input: actualInput, locale,
    calendarReference: '', onCalendarReferenceChange() {}, onExport() {} });
}

test('D2 all 12 catalogue paths have DE/FR action translations and exact catalogue stages', () => {
  assert.equal(catalog.paths.length, 12);
  assert.deepEqual(Object.keys(administrativeMessages.de).sort(), Object.keys(administrativeMessages.fr).sort());
  for (const path of catalog.paths) for (const stage of path.stages) {
    const choices = ui.administrativeChoices(catalog, path.lawId, state(stage, path.pathId));
    assert.equal(choices.path?.pathId, path.pathId);
    for (const locale of ['de', 'fr'] as const) {
      assert.ok((administrativeMessages[locale] as Record<string, string>)[`action.${path.action}`]);
      assert.ok((administrativeMessages[locale] as Record<string, string>)[`stage.${stage}`]);
    }
  }
});

test('D2 state changes discard current case qualification and urgency', () => {
  const initial = { ...state('court', 'gr-52-30'), urgency: 'explicitJudicialUrgencyOrder' as const };
  const changed = ui.changeAdministrativeSelection(catalog, 'vrg-gr', initial, 'stage', 'administration');
  assert.equal(changed.pathId, 'gr-admin-ordered');
  assert.equal(changed.qualification, '');
  assert.equal(changed.urgency, '');
  const actionChanged = ui.changeAdministrativeSelection(catalog, 'vrg-gr', initial, 'pathId', 'gr-52-10');
  assert.equal(actionChanged.qualification, '');
  assert.equal(actionChanged.urgency, '');
});

test('D2 the sole GR administration action is a static value, not a false dropdown', () => {
  const html = ui.fields({ catalog, lawId: 'vrg-gr', locale: 'de', value: { ...ui.EMPTY_ADMINISTRATIVE_UI_STATE, stage: 'administration' }, onChange() {} });
  assert.match(html, /<output[^>]+aria-label="Verfahrenshandlung"[^>]*>Behördlich angesetzte Tagesfrist/);
  assert.doesNotMatch(html, /Fristauslösendes Dokument|Ich bestätige/);
  assert.match(html, /fr-form__grid/);
  assert.doesNotMatch(html, /<details/);
});

test('D2 TI choices omit GR urgency, French fields translate the applicable choices', () => {
  const ti = ui.fields({ catalog, lawId: 'lpamm-ti', locale: 'de', value: state(), onChange() {} });
  assert.doesNotMatch(ti, /Gerichtliche Dringlichkeitsverfügung/);
  const gr = ui.fields({ catalog, lawId: 'vrg-gr', locale: 'fr', value: state('court', 'gr-52-30'), onChange() {} });
  assert.match(gr, /Stade de la procédure/);
  assert.match(gr, /Ordonnance judiciaire d’urgence/);
  assert.match(gr, /Situation du cas/);
  assert.doesNotMatch(gr, /Verfahrenshandlung|Fristauslösendes Dokument/);
});

test('D2 no pending, special or unknown qualification is silently converted into a general case', () => {
  for (const qualification of ['', 'unknown', 'specialOrDeviating'] as const) {
    const value = ui.qualifyAdministrativeUiInput({ catalog, lawId: 'lpamm-ti', authorityCanton: 'TI', inputDate: '2026-09-16', deadlineDays: 30,
      state: { ...state(), qualification } });
    assert.equal(value.input, undefined);
    assert.ok(value.errors.qualification);
  }
});

test('D2 the current general-case choice yields explicit qualified facts, not a pseudo BE profile', () => {
  const value = input();
  assert.equal(value.selection.lawId, 'lpamm-ti');
  assert.equal('profileId' in value, false);
  assert.deepEqual(value.qualification, { delivery: 'qualifiedActualDelivery', generalRoute: 'qualified', specialLaw: 'excluded',
    explicitHolidayException: 'none', fixedEndDate: false, deviatingStart: false, evidenceAdvance: false });
});

test('D2 validates mismatch, date, ordered duration and GR court urgency before calculating', () => {
  const invalid = ui.qualifyAdministrativeUiInput({ catalog, lawId: 'vrg-gr', authorityCanton: 'TI', inputDate: '2026-02-30', deadlineDays: 30,
    state: { ...state('court', 'gr-52-10'), urgency: '' } });
  assert.equal(invalid.input, undefined);
  assert.deepEqual(Object.keys(invalid.errors).sort(), ['authority', 'deadlineDays', 'inputDate', 'urgency']);
  for (const deadlineDays of [undefined, 0, 1.5, 366]) {
    const value = ui.qualifyAdministrativeUiInput({ catalog, lawId: 'vrg-gr', authorityCanton: 'GR', inputDate: '2026-09-16', deadlineDays,
      state: state('administration', 'gr-admin-ordered') });
    assert.equal(value.errors.deadlineDays, 'validation.deadlineDays');
  }
});

test('D2 automatic parameters remain unresolved while GR urgency is missing', () => {
  const html = ui.automatic({ catalog, lawId: 'vrg-gr', state: { ...state('court', 'gr-52-30'), urgency: '' }, locale: 'de' });
  assert.match(html, /Noch nicht bestimmt/);
  assert.doesNotMatch(html, /Ostern/);
  const urgent = ui.automatic({ catalog, lawId: 'vrg-gr', state: { ...state('court', 'gr-52-30'), urgency: 'explicitJudicialUrgencyOrder' }, locale: 'fr' });
  assert.match(urgent, /ordonnance expresse d’urgence/);
});

test('D2 candidate calculates genuine 30-day TI result and shows source links only in trace, with no export', () => {
  const result = ui.calculateAdministrativeUiDeadline(input(), context);
  assert.equal(result.outcome, 'calculated');
  if (result.outcome !== 'calculated') return;
  assert.equal(result.finalEnd, '2026-10-16');
  const html = resultHtml(result);
  assert.match(html, /Lokale Prüfrechnung/);
  assert.match(html, /16\.10\.2026/);
  assert.match(html, /Kein Kalenderexport/);
  assert.doesNotMatch(html, /<button[^>]*>.*Kalendereintrag erstellen/);
  assert.ok(html.indexOf('Rechts- und Datenherkunft') > html.indexOf('<details'));
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
  assert.throws(() => ui.createAdministrativeCalendarEntry({ input: input(), context, result, locale: 'de' }), /calendarExportNotBound/);
});

test('D2 TI-O2 blocked result has no definitive date tile, no export, and translated diagnostic', () => {
  // Exact accepted AP23B-TI12 contrast, now through the actual UI boundary.
  const blockedInput = input({ inputDate: '2027-02-17' });
  const result = ui.calculateAdministrativeUiDeadline(blockedInput, context);
  assert.equal(result.outcome, 'blocked');
  const html = resultHtml(result, context, blockedInput, 'fr');
  assert.doesNotMatch(html, /fr-result__hero|Créer une entrée de calendrier/);
  assert.match(html, /<details[^>]*open/);
  assert.match(html, /cas limite tessinois/);
});

test('D2 approved-shaped fixture exports through unchanged shared ICS format after recomputation', () => {
  const actualInput = input();
  const result = ui.calculateAdministrativeUiDeadline(actualInput, approved);
  assert.equal(ui.administrativeExportAvailable(actualInput, approved, result), true);
  const artifact = ui.createAdministrativeCalendarEntry({ input: actualInput, context: approved, result, locale: 'fr', reference: 'QA-D2',
    uid: 'ap23d2-test', createdAt: new Date('2026-10-15T08:00:00Z') });
  assert.match(artifact.content, /DTSTART;VALUE=DATE:20261016\r\n/);
  assert.match(artifact.content, /TRIGGER:-PT112H\r\n/);
  assert.match(artifact.content, /CATEGORIES:Fristablauf\r\n/);
  assert.match(artifact.content, /TRANSP:TRANSPARENT\r\n/);
  const unfolded = artifact.content.replace(/\r\n[ \t]/g, '');
  assert.match(unfolded, /Origine juridique et données/);
  assert.match(unfolded, /kind: cantonalAdministrative/);
  assert.match(unfolded, /lawId: lpamm-ti/);
  assert.match(unfolded, /pathId: ti-80-30/);
  assert.match(unfolded, /revision: 1/);
  assert.match(unfolded, /stage: administrativeAppeal/);
  assert.ok(unfolded.includes(`releaseId: ${approved.manifest.releaseId}`));
  if (result.outcome !== 'calculated') throw new Error('Expected actual calculation');
  assert.ok(unfolded.includes(`holidayBindingId: ${result.provenance.holidayBindingId}`));
  for (const ref of result.provenance.sourceRefs) {
    assert.ok(unfolded.includes(ref.sourceId));
    assert.ok(unfolded.includes(approved.administrativeCatalog.sources.find(source => source.sourceId === ref.sourceId)!.url));
  }
  assert.doesNotMatch(unfolded, /profileId|vrpg-be/);
  for (const line of artifact.content.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75);
});

test('D2 German GR export retains its own discriminator, path, urgency and source provenance', () => {
  const actualInput = input({ lawId: 'vrg-gr', authorityCanton: 'GR', inputDate: '2027-07-14',
    state: { ...state('court', 'gr-52-30'), urgency: 'explicitJudicialUrgencyOrder' } });
  const result = ui.calculateAdministrativeUiDeadline(actualInput, approved);
  const artifact = ui.createAdministrativeCalendarEntry({ input: actualInput, context: approved, result, locale: 'de',
    reference: 'Fall\r\nATTENDEE:bad@example.invalid', uid: 'ap23d2-gr-test', createdAt: new Date('2026-10-15T08:00:00Z') });
  const unfolded = artifact.content.replace(/\r\n[ \t]/g, '');
  assert.match(unfolded, /Rechts- und Datenherkunft/);
  assert.match(unfolded, /kind: cantonalAdministrative/);
  assert.match(unfolded, /lawId: vrg-gr/);
  assert.match(unfolded, /pathId: gr-52-30/);
  assert.match(unfolded, /stage: court \(Gerichtsverfahren\)/);
  assert.match(unfolded, /urgencyApplied: true/);
  assert.match(unfolded, /SRC-AP23B-GR-VRG/);
  assert.doesNotMatch(unfolded, /profileId|vrpg-be|\r\nATTENDEE:/);
});

test('D2 export rejects forged flags, copied results, different context identity and changed case facts', () => {
  const actualInput = input();
  const result = ui.calculateAdministrativeUiDeadline(actualInput, approved);
  for (const changed of [
    { input: actualInput, context: approved, result: { ...result } },
    { input: actualInput, context: ui.context('approved'), result },
    { input: { ...actualInput, inputDate: '2026-09-17' }, context: approved, result },
    { input: actualInput, context: { ...approved }, result }
  ]) assert.throws(() => ui.createAdministrativeCalendarEntry({ ...changed, locale: 'de' }), /calendarExportNotBound/);
  const referenceResult = ui.calculateAdministrativeUiDeadline(actualInput, context);
  assert.throws(() => ui.createAdministrativeCalendarEntry({ input: actualInput, context, result: { ...referenceResult, referenceOnly: false, calendarExportAllowed: true } as AdministrativeDeadlineResult,
    locale: 'de' }), /calendarExportNotBound/);
});
