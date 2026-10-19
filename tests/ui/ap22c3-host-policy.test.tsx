// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { test } from 'node:test';
import { build } from 'esbuild';
import { calculateDeadline, calculateSpecialDeadline, createCalculatorRuntime } from '../../src/core';
import type { ValidatedReleaseLike } from '../../src/core';
import { mvp06CalculationData } from '../../src/release/mvp06ReleaseData';
import { ap22c3CandidateRuntime } from '../../src/release/ap22c3CandidateData';
import { initialDefaults, DEFAULTS_STORAGE_KEY } from '../../src/ui/defaults';
import type { FristenrechnerAppProps } from '../../src/ui/FristenrechnerApp';
import { hasSocialUi, socialUiPath, SOCIAL_UI_LAWS } from '../../src/ui/socialUi';
import { EMPTY_VRPG_SELECTION } from '../../src/ui/vrpgSelection';

// Isolated render-branch policy tests, not an end-to-end calculation test.
// The former global "fifth useState" injection silently targeted a different
// state after AP23D2 added administrative selection hooks. Bind to the unique
// named result declaration in this test-only bundle instead. No production
// source, React hook or result-branch policy is changed. Actual user flows are
// covered separately by the AP21/AP23D2 DOM interaction suites.
const resultInitializer = 'const [result, setResult] = React.useState<UiResult>();';
let injectedResultDeclarations = 0;
const bundle = await build({ stdin: { contents: `
  import React from 'react';
  import {renderToStaticMarkup} from 'react-dom/server';
  import {setIconOptions} from '@fluentui/react/lib/Styling';
  import {FristenrechnerApp} from './src/ui/FristenrechnerApp';
  import {testResultState} from 'ap22c3-test-result-state';
  setIconOptions({disableWarnings:true});
  export const render = props => renderToStaticMarkup(React.createElement(FristenrechnerApp, props));
  // Supply the existing computed fixture to the isolated rendering branch.
  export function renderWithResult(props, result) {
    testResultState.current = result;
    try { return render(props); } finally { testResultState.current = undefined; }
  }
`, loader: 'tsx', resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false,
external: ['react', 'react-dom/server'], logLevel: 'silent', plugins: [{ name: 'isolated-result-rendering', setup(builder) {
  builder.onResolve({ filter: /^ap22c3-test-result-state$/ }, () => ({ path: 'state', namespace: 'ap22c3-test-only' }));
  builder.onLoad({ filter: /^state$/, namespace: 'ap22c3-test-only' }, () => ({
    contents: 'export const testResultState = {current: undefined};', loader: 'js'
  }));
  builder.onLoad({ filter: /\/src\/ui\/FristenrechnerApp\.tsx$/ }, args => {
    const source = readFileSync(args.path, 'utf8');
    const count = source.split(resultInitializer).length - 1;
    assert.equal(count, 1, 'The isolated branch test requires exactly one named UiResult initializer');
    injectedResultDeclarations += count;
    return { contents: `import {testResultState} from 'ap22c3-test-result-state';\n${source.replace(resultInitializer,
      'const [result, setResult] = React.useState<UiResult>(() => testResultState.current);')}`,
    loader: 'tsx', resolveDir: dirname(args.path) };
  });
} }] });
assert.equal(injectedResultDeclarations, 1, 'The result injection must only affect the intended app module');
const module = { exports: {} };
new Function('require', 'module', 'exports', bundle.outputFiles[0]!.text)(createRequire(import.meta.url), module, module.exports);
const ui = module.exports as { render: (props: FristenrechnerAppProps) => string; renderWithResult: (props: FristenrechnerAppProps, result: unknown) => string };
function props(locale: 'de' | 'fr' = 'de', reference = true): FristenrechnerAppProps {
  const defaults = { ...initialDefaults(ap22c3CandidateRuntime.data, true), locale };
  return { ...ap22c3CandidateRuntime, referenceOnlyAllCalculations: reference,
    storage: { getItem: key => key === DEFAULTS_STORAGE_KEY ? JSON.stringify(defaults) : null, setItem: () => {}, removeItem: () => {} } };
}
const general = calculateDeadline({ profileId: 'stpo', inputDate: '2026-09-16', inputDateSemantics: 'legallyRelevantDeliveryOrEventDate',
  deadlineDays: 10, calendarId: 'be-public-holidays', selectors: { deliveryMethod: 'otherLegallyRelevantDate' },
  confirmations: { holidayAnchorConfirmed: true, deliveryFictionApplicabilityConfirmed: false, specialLawChecked: false }, holidayAnchorCandidates: ['BE'] }, mvp06CalculationData);
const special = calculateSpecialDeadline({ profileId: 'vrpg-be', regimeId: 'vrpg-be-general', ruleId: 'VRPGBE-SPEC-REL-GENERAL-001',
  dateValues: { eventDate: '2026-09-04' }, localTimeValues: {}, integerValues: { deadlineDays: 10 }, calendarProfileId: 'C_BE',
  suspensionProfileId: 'S0_NONE', filingProfileId: 'F1_DISPATCH', overrideConfirmations: [] }, mvp06CalculationData);

for (const locale of ['de', 'fr'] as const) test(`C3 host policy clearly marks the entire candidate in ${locale}`, () => {
  const html = ui.render(props(locale));
  assert.match(html, /AP22C3/);
  assert.match(html, locale === 'de' ? /Sämtliche Berechnungen/ : /Tous les calculs/);
  assert.doesNotMatch(html, /bisherigen Berner VRPG-Funktionen bleiben unverändert|fonctions bernoises LPJA existantes restent inchangées/);
  assert.match(html, /2026-10-08-ap22c3-reference.1/);
});

test('the actual Format7 data keeps all eleven approved-scope social laws selectable', () => {
  const data = ap22c3CandidateRuntime.data;
  assert.equal(hasSocialUi(data), true);
  for (const law of SOCIAL_UI_LAWS) {
    const path = socialUiPath(data, { ...EMPTY_VRPG_SELECTION, area: 'social', law,
      action: law === 'ivg' ? 'preliminary-objection' : 'objection' });
    assert.ok(path, `Missing Format7 UI path: ${law}`);
    assert.ok(path.selections.every(selection => selection.binding.procedureContextCanton === 'BE'));
  }
});

for (const kind of ['general', 'special', 'social', 'boundCalendar'] as const) test(`C3 suppresses export through the actual ${kind} result branch`, () => {
  assert.equal(general.outcome, 'calculated'); assert.equal(special.outcome, 'calculated');
  const value = kind === 'general' ? general : kind === 'boundCalendar'
    ? { ...general, calendarExportAllowed: true, referenceOnly: false }
    : special;
  const html = ui.renderWithResult(props(), { kind, value });
  assert.match(html, /Prüfergebnis/);
  assert.match(html, /Kalenderexport erst nach Releasefreigabe/);
  assert.doesNotMatch(html, /Kalendereintrag erstellen|\.ics|Referenz für Kalendereintrag/);
  assert.ok(!html.includes('fr-calendar-export'));
});

test('legacy host without candidate policy retains its existing export', () => {
  const html = ui.renderWithResult({ data: mvp06CalculationData }, { kind: 'general', value: general });
  assert.match(html, /fr-calendar-export/);
  assert.doesNotMatch(html, /AP22C3|Prüfergebnis/);
});

test('actual AP5 bytes keep their historical data status, finite coverage and old UI after the host adapter', () => {
  const root = 'data/releases/2026-08-29-ap5-approved.1';
  const manifest = JSON.parse(readFileSync(`${root}/manifest.json`, 'utf8'));
  const legacy: ValidatedReleaseLike = { releaseId: manifest.releaseId, formatVersion: manifest.formatVersion,
    coverageFrom: manifest.coverage.from, coverageTo: manifest.coverage.to,
    profileIds: manifest.profileIds, calendarIds: manifest.calendarIds,
    artifacts: manifest.artifacts.map((descriptor: ValidatedReleaseLike['artifacts'][number]['descriptor'] & { path: string }) => ({
      descriptor, parsed: JSON.parse(readFileSync(`${root}/${descriptor.path}`, 'utf8'))
    })) };
  const adapted = createCalculatorRuntime(legacy);
  assert.equal(adapted.calendarRuntime, undefined);
  assert.equal(adapted.data.releaseId, manifest.releaseId);
  assert.deepEqual(adapted.data.coverage, manifest.coverage);
  const html = ui.render({ data: adapted.data });
  assert.ok(html.includes('2026-08-29-ap5-approved.1'));
  assert.ok(html.includes(manifest.coverage.to.split('-').reverse().join('.')));
  assert.doesNotMatch(html, /AP22C3|Feiertagskanton|Zustellkonstellation|Prüfergebnis|Kalender-Prüfstand/);
});

test('changing the trusted global export policy resets the calculator session', () => {
  const source = readFileSync('src/ui/FristenrechnerApp.tsx', 'utf8');
  assert.match(source, /key=\{`[^`]*props\.referenceOnlyAllCalculations/);
});

test('only the local preview has a query candidate selector, public entries remain explicit build choices', () => {
  const entry = readFileSync('src/public-app/ap22c3-main.tsx', 'utf8');
  const normal = readFileSync('src/public-app/main.tsx', 'utf8');
  assert.match(entry, /ap22c3CandidateRuntime/); assert.match(entry, /referenceOnlyAllCalculations/);
  assert.doesNotMatch(entry, /URLSearchParams|location\.search|initialState|qaPreset/);
  assert.match(normal, /mvp09Runtime/); assert.doesNotMatch(normal, /ap22c3|referenceOnlyAllCalculations/);
});
