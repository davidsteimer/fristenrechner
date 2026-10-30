// SPDX-License-Identifier: AGPL-3.0-only
// UI-only B11-H01 regression. Synthetic approval shapes are never a human release approval.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildSync } from 'esbuild';
import type { AdministrativeDeadlineInput, AdministrativeDeadlineResult } from '../../src/core/administrativeDeadline';
import type { ParsedFormat9Data } from '../../src/core/releaseFormat9';
import type { ParsedFormat17Data } from '../../src/core/releaseFormat17';
import type { AdministrativeResultViewProps } from '../../src/ui/administrativeUi';
import type * as Export from '../../src/ui/administrativeExport';
import { administrativeText } from '../../src/ui/administrativeMessages';
import { buildSyntheticFormat17, encode17 } from '../core/ap23m3Fixtures';

const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const bundled = buildSync({ stdin: { contents: `
  import * as React from 'react';
  import {renderToStaticMarkup} from 'react-dom/server';
  import {setIconOptions} from '@fluentui/react/lib/Styling';
  import {AdministrativeResultView} from './src/ui/administrativeUi';
  export * from './src/ui/administrativeExport';
  export {createFormat17CalculationData as createNative} from './src/core/format17CalculationData';
  export {mvp09Runtime as legacy} from './src/release/mvp09ReleaseData';
  setIconOptions({disableWarnings:true});
  export const render=props=>renderToStaticMarkup(React.createElement(AdministrativeResultView,props));
`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, platform: 'node', format: 'cjs', write: false,
  external: ['react', 'react-dom/server'], logLevel: 'silent' });
const module = { exports: {} };
new Function('require', 'module', 'exports', bundled.outputFiles[0]!.text)(require, module, module.exports);
const ui = module.exports as typeof Export & {
  createNative: typeof import('../../src/core/format17CalculationData').createFormat17CalculationData;
  legacy: { administrativeContext: ParsedFormat9Data };
  render(props: AdministrativeResultViewProps): string;
};
const fixture = buildSyntheticFormat17('approved');
const native = ui.createNative(encode17(fixture.manifest), fixture.files, { mode: 'approved' });
const contexts = [
  { name: 'MVP09 real approved Format9', context: ui.legacy.administrativeContext },
  { name: 'native Format17 synthetic approved test only', context: native.administrativeContext }
] as const;
const originals = JSON.parse(readFileSync('outputs/ap23m2-2026-10-28/native-regression.json', 'utf8')).results as {
  pathId: string; input: AdministrativeDeadlineInput; expectedFinalEnd: string;
}[];
type Context = ParsedFormat9Data | ParsedFormat17Data;
type Locale = 'de' | 'fr';

function input(pathId: string, inputDate: string, deadlineDays: number): AdministrativeDeadlineInput {
  const accepted = originals.find(row => row.pathId === pathId);
  assert.ok(accepted, pathId);
  return { ...structuredClone(accepted.input), inputDate, deadlineDays };
}
function view(actualInput: AdministrativeDeadlineInput, context: Context, locale: Locale,
  result = ui.calculateAdministrativeUiDeadline(actualInput, context),
  catalog: AdministrativeResultViewProps['catalog'] = context.administrativeCatalog) {
  const originalInput = JSON.stringify(actualInput), originalResult = JSON.stringify(result);
  const html = ui.render({ input: actualInput, result, context, catalog, locale, calendarReference: '',
    onCalendarReferenceChange() {}, onExport() {} });
  assert.equal(JSON.stringify(actualInput), originalInput, 'Rendering must not change current case facts');
  assert.equal(JSON.stringify(result), originalResult, 'Rendering must not add or alter provenance');
  const document = new JSDOM(html).window.document;
  return { html, document, result, readable: document.querySelector('[data-testid="administrative-readable-trace"]')!,
    technical: document.querySelector('[data-testid="administrative-technical-evidence"]') };
}
function noDefinitiveEndOrExport(output: ReturnType<typeof view>, actualInput: AdministrativeDeadlineInput, context: Context) {
  assert.equal(output.result.outcome, 'blocked');
  assert.equal(output.result.calendarExportAllowed, false);
  assert.equal(Object.hasOwn(output.result, 'finalEnd'), false);
  assert.equal(output.document.querySelector('.fr-result__hero'), null);
  assert.equal(output.document.querySelector('.fr-calendar-export'), null);
  assert.equal(ui.administrativeExportAvailable(actualInput, context, output.result), false);
}
function beforeProvenance(output: ReturnType<typeof view>, locale: Locale) {
  assert.equal(output.result.provenance, undefined);
  assert.equal(output.document.querySelector('[data-testid="administrative-trace-before-provenance"]')!.textContent,
    administrativeText(locale, 'traceBeforeProvenance'));
  assert.doesNotMatch(output.readable.textContent, /Bezeichnungen können nicht|Certains libellés|vollständigen Angaben|données complètes/);
  assert.equal(output.readable.querySelector('a'), null, 'No legal links inferred without result provenance');
  assert.equal(output.technical, null, 'No empty applied-period/holiday lists presented as result evidence');
  assert.equal(output.document.querySelector('pre'), null);
  assert.equal(output.readable.textContent.includes(administrativeText(locale, 'scopeHeading')), false);
  assert.equal(output.readable.textContent.includes(administrativeText(locale, 'shifts')), false);
  assert.equal(output.document.querySelector('details.fr-trace')!.hasAttribute('open'), true);
}

const earlyCases = [
  ['gr-admin-ordered', '2026-08-28', 1],
  ['lu-admin-30', '2026-09-26', 30],
  ['zg-admin-20', '2026-08-28', 20],
  ['ar-admin-20', '2026-08-28', 20]
] as const;
for (const { name, context } of contexts) for (const [pathId, date, days] of earlyCases) {
  test(`B11-H01 ${name} ${pathId} early coverage stop has no fabricated result provenance in DE/FR`, () => {
    const actual = input(pathId, date, days);
    for (const locale of ['de', 'fr'] as const) {
      const output = view(actual, context, locale);
      assert.equal(output.result.outcome, 'blocked');
      if (output.result.outcome !== 'blocked') throw Error('Expected coverage stop');
      assert.deepEqual(output.result.blockReasonKeys, ['administrative.outsideCaseCoverage']);
      assert.equal(output.document.querySelector('.fr-result__messages li')!.textContent,
        administrativeText(locale, 'administrative.outsideCaseCoverage'));
      noDefinitiveEndOrExport(output, actual, context);
      beforeProvenance(output, locale);
    }
  });
}

const positiveCases = [
  ['gr-admin-ordered', '2026-08-29', 1, '2026-08-31'],
  ['lu-admin-30', '2026-09-27', 30, '2026-10-27'],
  ['zg-admin-20', '2026-08-29', 20, '2026-09-18'],
  ['ar-admin-20', '2026-08-29', 20, '2026-09-18'],
  ['lu-admin-30', '2026-10-02', 30, '2026-11-02'],
  ['zg-admin-20', '2026-10-02', 20, '2026-10-22'],
  ['ar-admin-20', '2026-10-02', 20, '2026-10-22']
] as const;
for (const { name, context } of contexts) for (const [pathId, date, days, expectedEnd] of positiveCases) {
  test(`B11-H01 ${name} ${pathId} positive control ${date} retains date, legal trace and export`, () => {
    const actual = input(pathId, date, days);
    for (const locale of ['de', 'fr'] as const) {
      const output = view(actual, context, locale);
      assert.equal(output.result.outcome, 'calculated');
      if (output.result.outcome !== 'calculated') throw Error('Expected positive control');
      assert.equal(output.result.finalEnd, expectedEnd);
      assert.ok(output.result.provenance);
      assert.equal(output.document.querySelector('[data-testid="administrative-trace-before-provenance"]'), null);
      assert.doesNotMatch(output.readable.textContent, /Bezeichnungen können nicht|Certains libellés|traceBeforeProvenance/);
      assert.ok(output.readable.querySelectorAll('a').length > 0);
      assert.ok(output.technical);
      assert.equal(ui.administrativeExportAvailable(actual, context, output.result), true);
      assert.ok(output.document.querySelector('.fr-calendar-export'));
    }
  });
}

for (const { name, context } of contexts) {
  test(`B11-H01 ${name} later coverage stop keeps its actual provenance and is not an early-stop label case`, () => {
    const actual = input('gr-admin-ordered', '2027-12-31', 1);
    for (const locale of ['de', 'fr'] as const) {
      const output = view(actual, context, locale);
      assert.equal(output.result.outcome, 'blocked');
      if (output.result.outcome !== 'blocked') throw Error('Expected late coverage stop');
      assert.deepEqual(output.result.blockReasonKeys, ['dataCoverageExceeded']);
      assert.equal(output.result.blockedDate, '2028-01-01');
      assert.ok(output.result.provenance);
      assert.equal(output.document.querySelector('[data-testid="administrative-trace-before-provenance"]'), null);
      assert.doesNotMatch(output.readable.textContent, /Bezeichnungen können nicht|Certains libellés/);
      assert.ok(output.technical);
      assert.match(output.technical.textContent, /gr-admin-ordered/);
      assert.ok(output.readable.querySelectorAll('a').length > 0);
      noDefinitiveEndOrExport(output, actual, context);
    }
  });
  test(`B11-H01 ${name} unrelated early special-law stop keeps its own reason without invented origin`, () => {
    const actual = input('lu-admin-30', '2026-10-02', 30);
    const qualified: AdministrativeDeadlineInput = { ...actual, qualification: { ...actual.qualification, specialLaw: 'unknown' } };
    for (const locale of ['de', 'fr'] as const) {
      const output = view(qualified, context, locale);
      assert.equal(output.result.outcome, 'blocked');
      if (output.result.outcome !== 'blocked') throw Error('Expected qualification stop');
      assert.deepEqual(output.result.blockReasonKeys, ['administrative.specialLawUnresolved']);
      assert.equal(output.document.querySelector('.fr-result__messages li')!.textContent,
        administrativeText(locale, 'administrative.specialLawUnresolved'));
      beforeProvenance(output, locale);
      noDefinitiveEndOrExport(output, qualified, context);
    }
  });
  test(`B11-H01 ${name} copied catalogue with real provenance retains the historical unresolved-label branch`, () => {
    const actual = input('lu-admin-30', '2026-10-02', 30);
    const result = ui.calculateAdministrativeUiDeadline(actual, context);
    assert.ok(result.provenance);
    for (const locale of ['de', 'fr'] as const) {
      const output = view(actual, context, locale, result, structuredClone(context.administrativeCatalog));
      assert.equal(output.document.querySelector('[data-testid="administrative-trace-before-provenance"]'), null);
      assert.ok(output.readable.textContent.includes(administrativeText(locale, 'traceDetailsUnavailable')));
      assert.match(output.readable.textContent, locale === 'de' ? /Bezeichnungen können nicht sicher aufgelöst/ : /Certains libellés/);
      assert.doesNotMatch(output.readable.textContent, /vollständigen Angaben|données complètes/);
      assert.equal(output.readable.querySelector('a'), null);
      assert.ok(output.technical);
      assert.match(output.technical.textContent, /lu-admin-30/);
    }
  });
  test(`B11-H01 ${name} unresolved period IDs remain technical-only instead of acquiring invented names or dates`, () => {
    const actual = input('ti-80-30', '2026-12-01', 30);
    const original = ui.calculateAdministrativeUiDeadline(actual, context);
    assert.equal(original.outcome, 'calculated');
    if (original.outcome !== 'calculated') throw Error('Expected source result');
    for (const id of ['unknown-period-2026', 'ti-winter-2099', 'ti-summer-2026']) for (const locale of ['de', 'fr'] as const) {
      // Deliberately altered display input, not a trusted calculation or an export capability.
      const unresolved: AdministrativeDeadlineResult = { ...original, encounteredPeriodIds: [id] };
      const output = view(actual, context, locale, unresolved);
      assert.equal(output.document.querySelector('[data-testid="administrative-trace-before-provenance"]'), null);
      assert.ok(output.readable.textContent.includes(administrativeText(locale, 'traceDetailsUnavailable')));
      assert.doesNotMatch(output.readable.textContent, /2099|15\.07\.2026|15\.08\.2026|vollständigen Angaben|données complètes/);
      assert.equal(output.readable.textContent.includes(id), false);
      assert.ok(output.technical.textContent.includes(id));
      assert.equal(ui.administrativeExportAvailable(actual, context, unresolved), false);
      assert.equal(output.document.querySelector('.fr-calendar-export'), null);
    }
  });
}
