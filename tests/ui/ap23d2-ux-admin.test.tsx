// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { buildSync } from 'esbuild';
import type { AdministrativeDeadlineInput, AdministrativeDeadlineResult } from '../../src/core/administrativeDeadline';
import type { ParsedFormat8Data } from '../../src/core/releaseFormat8';
import type { AdministrativeResultViewProps } from '../../src/ui/administrativeUi';

const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const bundled = buildSync({ stdin: { contents: `
  import * as React from 'react';
  import {renderToStaticMarkup} from 'react-dom/server';
  import {setIconOptions} from '@fluentui/react/lib/Styling';
  import {AdministrativeResultView} from './src/ui/administrativeUi';
  export {calculateAdministrativeUiDeadline as calculate} from './src/ui/administrativeExport';
  export {createSyntheticFormat8Context as context} from './tests/core/ap23d1Fixtures';
  setIconOptions({disableWarnings:true});
  export const render=(props)=>renderToStaticMarkup(React.createElement(AdministrativeResultView,props));
`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, platform: 'node', format: 'cjs', write: false,
  external: ['react', 'react-dom/server'], logLevel: 'silent' });
const module = { exports: {} };
new Function('require', 'module', 'exports', bundled.outputFiles[0]!.text)(require, module, module.exports);
const ui = module.exports as {
  context(): ParsedFormat8Data;
  calculate(input: AdministrativeDeadlineInput, context: unknown): AdministrativeDeadlineResult;
  render(props: AdministrativeResultViewProps): string;
};
const context = ui.context();
const catalog = context.administrativeCatalog;
function makeInput(pathId: string, inputDate: string, days?: number, urgent = false): AdministrativeDeadlineInput {
  const path = catalog.paths.find(value => value.pathId === pathId)!;
  const law = catalog.laws.find(value => value.lawId === path.lawId)!;
  return {
    selection: { kind: 'cantonalAdministrative', lawId: path.lawId, pathId, revision: path.revision, stage: path.stages[0]! },
    authoritySeat: { canton: law.canton, level: 'cantonal', qualification: 'competentAuthorityForCurrentAction' },
    inputDate, ...(path.duration.kind === 'statutoryDays' ? { deadlineDays: path.duration.value } : days === undefined ? {} : { deadlineDays: days }),
    qualification: { delivery: 'qualifiedActualDelivery', generalRoute: 'qualified', specialLaw: 'excluded', explicitHolidayException: 'none',
      fixedEndDate: false, deviatingStart: false, evidenceAdvance: false },
    urgency: urgent ? 'explicitJudicialUrgencyOrder' : 'none'
  };
}
function view(input: AdministrativeDeadlineInput, locale: 'de' | 'fr' = 'de') {
  const result = ui.calculate(input, context);
  const before = JSON.stringify(result);
  const html = ui.render({ input, result, catalog, context, locale, calendarReference: '', onCalendarReferenceChange() {} });
  assert.equal(JSON.stringify(result), before, 'Presentation must not mutate any calculation result');
  const document = new JSDOM(html).window.document;
  return { result, document, html, readable: document.querySelector('[data-testid="administrative-readable-trace"]')!,
    technical: document.querySelector('[data-testid="administrative-technical-evidence"] details')! };
}

test('D2 UX TI readable trace shows dates and exact TI sources, no internal identifiers or unrelated federal norms', () => {
  const output = view(makeInput('ti-80-30', '2026-09-16'));
  assert.equal(output.result.outcome, 'calculated');
  if (output.result.outcome !== 'calculated') return;
  assert.equal(output.result.finalEnd, '2026-10-16');
  assert.match(output.readable.textContent, /16\.09\.2026/);
  assert.match(output.readable.textContent, /17\.09\.2026 · Tag nach dem Empfang/);
  assert.match(output.readable.textContent, /LPAmm TI – Verwaltungsverfahren: Art\. 13, 16, 68 Abs\. 1, 80/);
  assert.doesNotMatch(output.readable.textContent, /SRC-|ti-80-30|ti-authority-seat|gr-|ZPO|BGG|VwVG|sha256/);
  assert.ok(output.readable.querySelector('a[href="https://m3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/pdfatto/atto/11221"]'));
});

test('D2 UX technical evidence is closed and retains complete result provenance and component hashes', () => {
  const output = view(makeInput('ti-80-30', '2026-09-16'));
  assert.equal(output.technical.hasAttribute('open'), false);
  assert.match(output.technical.textContent, /Technische Nachweise/);
  assert.match(output.technical.textContent, /SRC-AP23B-TI-LPAMM/);
  assert.match(output.technical.textContent, /ti-80-30/);
  assert.match(output.technical.textContent, /ti-authority-seat/);
  assert.match(output.technical.textContent, /pathSha256/);
  assert.match(output.technical.textContent, /projectionId/);
  assert.match(output.technical.textContent, /Rechts- und Datenherkunft/);
});

test('D2 UX GR summer suspension has a human name, exact dates and its own Art. 39 source', () => {
  const output = view(makeInput('gr-52-30', '2027-07-10'));
  assert.equal(output.result.outcome, 'calculated');
  assert.match(output.readable.textContent, /Friststillstand im Sommer: 15\.07\.2027–15\.08\.2027/);
  assert.match(output.readable.textContent, /VRG GR – Verwaltungsrechtspflege: Art\. 39 Abs\. 1/);
  assert.match(output.readable.textContent, /Nicht mitgezählte Tage: 32/);
  assert.doesNotMatch(output.readable.textContent, /gr-summer-2027|LPAmm|ZPO|BGG|VwVG/);
  assert.match(output.technical.textContent, /gr-summer-2027/);
});

test('D2 UX cross-year suspension shows both full dates instead of its period ID', () => {
  const output = view(makeInput('ti-80-30', '2026-12-01'));
  assert.equal(output.result.outcome, 'calculated');
  assert.match(output.readable.textContent, /Friststillstand über den Jahreswechsel: 18\.12\.2026–02\.01\.2027/);
  assert.doesNotMatch(output.readable.textContent, /ti-winter-2026/);
  assert.match(output.technical.textContent, /ti-winter-2026/);
});

test('D2 UX GR express urgency does not display an applied summer period or Art. 39 Abs. 1 as urgency authority', () => {
  const output = view(makeInput('gr-52-30', '2027-07-10', undefined, true));
  assert.equal(output.result.outcome, 'calculated');
  if (output.result.outcome !== 'calculated') return;
  assert.equal(output.result.finalEnd, '2027-08-09');
  assert.match(output.readable.textContent, /Kein Friststillstand wegen ausdrücklicher Dringlichkeitsverfügung/);
  assert.doesNotMatch(output.readable.textContent, /Friststillstand im Sommer|Art\. 39 Abs\. 1/);
});

test('D2 UX TI no-suspension route does not inherit the ordinary TI summer period', () => {
  const output = view(makeInput('ti-provisional-15', '2027-07-10'));
  assert.equal(output.result.outcome, 'calculated');
  assert.match(output.readable.textContent, /Kein Friststillstand/);
  assert.match(output.readable.textContent, /Art\. 13, 16 Abs\. 3, 68 Abs\. 2/);
  assert.doesNotMatch(output.readable.textContent, /Friststillstand im Sommer|15\.08\.2027|47 Abs/);
});

test('D2 UX holiday end shift uses the exact generated holiday name and both dates', () => {
  const output = view(makeInput('ti-reply', '2026-12-07', 1));
  assert.equal(output.result.outcome, 'calculated');
  if (output.result.outcome !== 'calculated') return;
  assert.equal(output.result.finalEnd, '2026-12-09');
  assert.match(output.readable.textContent, /08\.12\.2026 → 09\.12\.2026 · Feiertag/);
  assert.match(output.readable.textContent, /Mariä Empfängnis: 08\.12\.2026/);
  assert.doesNotMatch(output.readable.textContent, /IMMACULATE-CONCEPTION|Bezeichnungen können nicht/);
  assert.match(output.technical.textContent, /IMMACULATE-CONCEPTION/);
});

test('D2 UX French trace translates reasons, period names, source labels and technical heading', () => {
  const summer = view(makeInput('gr-52-30', '2027-07-10'), 'fr');
  assert.match(summer.readable.textContent, /Suspension en été: 15\.07\.2027–15\.08\.2027/);
  assert.match(summer.readable.textContent, /VRG GR – Juridiction administrative/);
  assert.doesNotMatch(summer.readable.textContent, /Friststillstand|Rechtsgrundlage|Feiertag|gr-summer/);
  assert.match(summer.technical.textContent, /Justificatifs techniques/);
  const holiday = view(makeInput('ti-reply', '2026-12-07', 1), 'fr');
  assert.match(holiday.readable.textContent, /Immaculée Conception: 08\.12\.2026/);
});

test('D2 UX TI end-shift boundary remains visibly blocked with a readable affected Easter period', () => {
  const output = view(makeInput('ti-80-30', '2027-02-17'));
  assert.equal(output.result.outcome, 'blocked');
  assert.match(output.document.querySelector('.fr-result__messages')!.textContent, /Tessiner Grenzfall ist gesperrt/);
  assert.equal(output.document.querySelector('.fr-result__hero'), null);
  assert.match(output.readable.textContent, /Friststillstand über Ostern: 21\.03\.2027–04\.04\.2027/);
  assert.equal(output.document.querySelector('details.fr-trace')!.hasAttribute('open'), true);
  assert.equal(output.technical.hasAttribute('open'), false);
});

test('D2 UX all 12 paths retain their own procedural source in DE and FR', () => {
  for (const path of catalog.paths) for (const locale of ['de', 'fr'] as const) {
    const output = view(makeInput(path.pathId, '2026-09-16', 7), locale);
    assert.equal(output.result.outcome, 'calculated', path.pathId);
    const text = output.readable.textContent;
    assert.match(text, path.lawId === 'lpamm-ti' ? /LPAmm TI/ : /VRG GR/);
    assert.doesNotMatch(text, path.lawId === 'lpamm-ti' ? /VRG GR/ : /LPAmm TI/);
    assert.doesNotMatch(text, /SRC-|JUD-|projection-|sha256|Bezeichnungen können nicht|Certains libellés/);
  }
});

test('D2 UX copied catalogue cannot fabricate readable legal bindings for an existing result', () => {
  const input = makeInput('ti-80-30', '2026-09-16');
  const result = ui.calculate(input, context);
  const html = ui.render({ input, result, context, catalog: structuredClone(catalog), locale: 'de', calendarReference: '', onCalendarReferenceChange() {} });
  const document = new JSDOM(html).window.document;
  const readable = document.querySelector('[data-testid="administrative-readable-trace"]')!;
  assert.match(readable.textContent, /Bezeichnungen können nicht sicher aufgelöst/);
  assert.equal(readable.querySelector('a'), null);
  assert.match(document.querySelector('[data-testid="administrative-technical-evidence"]')!.textContent, /ti-80-30/);
});

test('D2 UX unknown or out-of-case period IDs are not interpreted as dates', () => {
  const input = makeInput('ti-80-30', '2026-12-01');
  const original = ui.calculate(input, context);
  assert.equal(original.outcome, 'calculated');
  if (original.outcome !== 'calculated') return;
  for (const id of ['unknown-period-2026', 'ti-winter-2099', 'ti-summer-2026']) {
    const result = { ...original, encounteredPeriodIds: [id] };
    const html = ui.render({ input, result, context, catalog, locale: 'de', calendarReference: '', onCalendarReferenceChange() {} });
    const document = new JSDOM(html).window.document;
    const readable = document.querySelector('[data-testid="administrative-readable-trace"]')!;
    assert.match(readable.textContent, /Bezeichnungen können nicht sicher aufgelöst/);
    assert.doesNotMatch(readable.textContent, /2099|15\.07\.2026|15\.08\.2026|Kein Friststillstand im berechneten Zeitraum/);
    assert.ok(!readable.textContent.includes(id));
    assert.ok(document.querySelector('[data-testid="administrative-technical-evidence"]')!.textContent.includes(id));
  }
});

test('D2 UX January case resolves the previous-year winter period from its bound calendar expression', () => {
  const output = view(makeInput('ti-reply', '2027-01-01', 2));
  assert.equal(output.result.outcome, 'calculated');
  assert.match(output.readable.textContent, /Friststillstand über den Jahreswechsel: 18\.12\.2026–02\.01\.2027/);
  assert.match(output.readable.textContent, /03\.01\.2027 · Zählung beginnt nach dem Friststillstand/);
  assert.doesNotMatch(output.readable.textContent, /Bezeichnungen können nicht/);
});
