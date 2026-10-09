// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { after, afterEach, test } from 'node:test';
import { buildSync } from 'esbuild';
import type * as ReactType from 'react';
import type * as TestUtilsType from 'react-dom/test-utils';
import type { CalculatorFormState } from '../../src/ui/model';
import type { StorageLike } from '../../src/ui/defaults';

// A pinned development-only DOM dependency. No browser, network requests,
// synthetic calculation result or React-hook replacement is used.
const rootRequire = createRequire(import.meta.url);
const { JSDOM } = rootRequire('jsdom') as {
  JSDOM: new (html: string, options: object) => { window: Window & typeof globalThis & { close(): void } }
};
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'https://ap21-tests.invalid/', pretendToBeVisual: true
});
const oldGlobals = new Map<string, PropertyDescriptor | undefined>();
for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'Event', 'MouseEvent',
  'MutationObserver', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'MessageChannel']) {
  oldGlobals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
  const candidate = Reflect.get(dom.window, name);
  Object.defineProperty(globalThis, name, { configurable: true, writable: true,
    value: ['getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame'].includes(name)
      ? candidate.bind(dom.window) : candidate });
}
Object.defineProperty(dom.window, 'matchMedia', { configurable: true, value: (query: string) => ({
  matches: false, media: query, onchange: null, addListener() {}, removeListener() {},
  addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false
}) });
const React = rootRequire('react') as typeof ReactType;
const ReactDOM = rootRequire('react-dom') as {
  render(element: ReactType.ReactElement, target: Element): unknown;
  unmountComponentAtNode(target: Element): boolean;
};
const { act, Simulate } = rootRequire('react-dom/test-utils') as typeof TestUtilsType;

// The factory, component and C3 bytes share one bundle and therefore the real
// issued-runtime WeakSet. Passing a structurally similar counterfeit is not a test.
const bundle = buildSync({ stdin: { contents: `
  import React from 'react';
  import {setIconOptions} from '@fluentui/react/lib/Styling';
  import {FristenrechnerApp} from './src/ui/FristenrechnerApp';
  import {ap22c3CandidateRuntime} from './src/release/ap22c3CandidateData';
  import {mvp06CalculationData} from './src/release/mvp06ReleaseData';
  import {mvp07Runtime} from './src/release/mvp07ReleaseData';
  setIconOptions({disableWarnings:true});
  export function element(initialState, storage, legacy) {
    return React.createElement(FristenrechnerApp, {
      ...(legacy === 'approved' ? mvp07Runtime : legacy ? {data:mvp06CalculationData} : ap22c3CandidateRuntime),
      initialState, storage
    });
  }
`, loader: 'tsx', resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false,
  external: ['react', 'react-dom'], logLevel: 'silent' });
const module = { exports: {} };
new Function('require', 'module', 'exports', bundle.outputFiles[0]!.text)(rootRequire, module, module.exports);
const app = module.exports as {
  element(initialState: Partial<CalculatorFormState>, storage: StorageLike, legacy: boolean | 'approved'): ReactType.ReactElement
};
let container: HTMLDivElement | undefined;
let stored = new Map<string, string>();
function mount(initialState: Partial<CalculatorFormState> = {}, legacy: boolean | 'approved' = false): HTMLDivElement {
  stored = new Map();
  const storage: StorageLike = {
    getItem: key => stored.get(key) ?? null,
    setItem: (key, value) => { stored.set(key, value); },
    removeItem: key => { stored.delete(key); }
  };
  container = document.createElement('div');
  document.body.append(container);
  act(() => { ReactDOM.render(app.element(initialState, storage, legacy), container!); });
  return container;
}
function field(name = 'inputDate'): HTMLInputElement {
  const input = Array.from(container!.querySelectorAll<HTMLInputElement>('input[name]')).find(item => item.name === name);
  assert.ok(input, `Missing field ${name}`);
  return input;
}
function draft(name: string, value: string): void {
  const input = field(name);
  act(() => {
    input.value = value;
    Simulate.change(input);
  });
}
function submit(): void { act(() => { Simulate.submit(container!.querySelector('form')!); }); }
function click(text: string): void {
  const button = Array.from(container!.querySelectorAll('button')).find(item => item.textContent?.trim() === text);
  assert.ok(button, `Missing button ${text}`);
  act(() => { Simulate.click(button); });
}
function accessibleName(element: Element): string {
  return element.getAttribute('aria-label') || (element.getAttribute('aria-labelledby') ?? '').split(' ')
    .map(id => document.getElementById(id)?.textContent ?? '').join(' ');
}
function choose(label: RegExp, option: RegExp | string): void {
  const dropdown = Array.from(container!.querySelectorAll('[role="combobox"]'))
    .find(element => label.test(accessibleName(element)));
  assert.ok(dropdown, `Missing dropdown ${label}, available: ${Array.from(container!.querySelectorAll('[role="combobox"]')).map(accessibleName).join(' | ')}`);
  act(() => { Simulate.click(dropdown); });
  const available = Array.from(document.querySelectorAll('[role="option"]'));
  const selected = available.find(element => typeof option === 'string'
    ? element.textContent?.trim() === option : option.test(element.textContent ?? ''));
  assert.ok(selected, `Missing option ${option}: ${available.map(item => item.textContent).join(' | ')}`);
  act(() => { Simulate.click(selected); });
}
const federal: Partial<CalculatorFormState> = {
  inputDate: '2026-09-01', deadlineDays: '10', holidayAnchorConfirmed: true,
  calendarContext: { role: 'partyWithoutRepresentative', canton: 'BE', areaFacts: {} }
};
const finalDate = (): string | undefined => container!.querySelector('.fr-result__hero dd')?.textContent ?? undefined;

afterEach(() => {
  if (container) act(() => { ReactDOM.unmountComponentAtNode(container!); });
  container?.remove();
  container = undefined;
  document.body.replaceChildren();
});
after(() => {
  dom.window.close();
  for (const [name, descriptor] of oldGlobals) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
});

test('AP21 actual C3 app submits the current text draft without blur, not the previous committed ISO value', () => {
  mount(federal);
  assert.equal(field().value, '01.09.2026');
  draft('inputDate', '16.9.2026');
  submit();
  assert.equal(field().value, '16.09.2026');
  assert.equal(finalDate(), '28.09.2026');
  assert.match(container!.textContent!, /Prüfergebnis/);
});

test('AP21 editing immediately removes a genuine previous result and its export, then invalid submit preserves the draft', () => {
  mount({ ...federal, inputDate: '2026-09-16' }, true);
  submit();
  assert.equal(finalDate(), '28.09.2026');
  assert.ok(container!.querySelector('.fr-calendar-export'));
  draft('inputDate', '31.2.2026');
  assert.equal(finalDate(), undefined);
  assert.equal(container!.querySelector('.fr-calendar-export'), null);
  submit();
  assert.equal(field().value, '31.2.2026');
  assert.equal(field().getAttribute('aria-invalid'), 'true');
  assert.match(container!.textContent!, /Dieses Datum gibt es nicht/);
  assert.equal(finalDate(), undefined);
  assert.equal(container!.querySelector('.fr-calendar-export'), null);
  draft('inputDate', '17.9.2026');
  submit();
  assert.equal(field().value, '17.09.2026');
  assert.equal(finalDate(), '28.09.2026');
});

test('MVP07 approved real runtime preserves AP21 Enter/blur commits and removes stale results and export on editing', () => {
  mount(federal, 'approved');
  draft('inputDate', '16.9.2026');
  act(() => { Simulate.keyDown(field(), { key: 'Enter', nativeEvent: { isComposing: false } as KeyboardEvent }); });
  assert.equal(field().value, '16.09.2026');
  assert.equal(finalDate(), undefined);
  submit();
  assert.equal(finalDate(), '28.09.2026');
  assert.ok(container!.querySelector('.fr-calendar-export'));
  assert.doesNotMatch(container!.textContent!, /Lokaler Prüfkandidat|Prüfergebnis/);
  draft('inputDate', '31.2.2026');
  assert.equal(finalDate(), undefined);
  assert.equal(container!.querySelector('.fr-calendar-export'), null);
  submit();
  assert.equal(field().getAttribute('aria-invalid'), 'true');
  assert.equal(container!.querySelector('.fr-calendar-export'), null);
  draft('inputDate', '17.9.2026');
  act(() => { Simulate.blur(field()); });
  assert.equal(field().value, '17.09.2026');
  submit();
  assert.equal(finalDate(), '28.09.2026');
  assert.ok(container!.querySelector('.fr-calendar-export'));
});

test('MVP07 actual app exposes no definitive result or ICS for a January-divergent SG case', () => {
  mount({ ...federal, inputDate: '2029-01-01', deadlineDays: '1',
    calendarContext: { role: 'partyWithoutRepresentative', canton: 'SG', areaFacts: {} } }, 'approved');
  submit();
  assert.equal(finalDate(), undefined);
  assert.equal(container!.querySelector('.fr-calendar-export'), null);
  assert.match(container!.textContent!, /2\. Januar/);
});

test('AP21 Enter resolves the date without calculating or submitting the form', () => {
  mount(federal);
  draft('inputDate', '16.9.2026');
  act(() => { Simulate.keyDown(field(), { key: 'Enter', nativeEvent: { isComposing: false } as KeyboardEvent }); });
  assert.equal(field().value, '16.09.2026');
  assert.equal(finalDate(), undefined);
  submit();
  assert.equal(finalDate(), '28.09.2026');
});

test('AP21 same-role profile change retains the current draft, different delivery role clears it permanently', () => {
  mount(federal);
  draft('inputDate', '17.9.2026');
  choose(/Verfahrensrecht/, /Zivilprozessordnung/);
  assert.equal(field().value, '17.9.2026');
  choose(/Verfahrensrecht/, /Strafprozessordnung/);
  assert.equal(field().value, '17.9.2026');
  choose(/Art der Zustellung/, /Unabgeholte/);
  assert.equal(field().value, '');
  choose(/Art der Zustellung/, /Direkte Zustellung/);
  assert.equal(field().value, '');
});

test('AP21 saving defaults excludes committed and pending dates, reset cannot resurrect a pending draft', () => {
  mount(federal);
  draft('inputDate', '17.9.2026');
  click('Als Standard speichern');
  assert.equal(stored.size, 1);
  const serialized = [...stored.values()][0]!;
  assert.doesNotMatch(serialized, /inputDate|specialDateValues|procedureStartDate|jurisdictionReferenceDate|2026-09|17\.9/);
  click('Standards zurücksetzen');
  assert.equal(field().value, '');
  assert.equal(stored.size, 0);
  submit();
  assert.equal(field().value, '');
  assert.equal(finalDate(), undefined);
});

test('AP21 procurement submission commits trigger and procedure start together before legal validation', () => {
  mount({ profileId: 'vrpg-be', vrpgSelection: { area: 'procurement', law: 'ivob', action: 'appeal', stage: '' },
    specialDateValues: { legalTriggerDate: '2026-09-01' },
    vrpgContext: { procedureStartDate: '2021-01-01', notificationChannel: 'individual-service', holidayConnections: '' } });
  draft('special.legalTriggerDate', '16.9.2026');
  draft('context.procedureStartDate', '1.1.2026');
  submit();
  assert.equal(field('special.legalTriggerDate').value, '16.09.2026');
  assert.equal(field('context.procedureStartDate').value, '01.01.2026');
  assert.equal(finalDate(), '06.10.2026');
});

test('AP21 a secondary political date draft participates in the same actual submit as the primary date', () => {
  mount({ profileId: 'vrpg-be', specialRegimeId: 'prg-be-165-political-rights-complaint', specialDefinitionId: 'PRGBE-SPEC-DUAL-165',
    specialDateValues: { discoveryDate: '2026-09-01', publicationDate: '2026-09-01', pollDate: '2026-09-01' } });
  draft('special.discoveryDate', '16.9.2026');
  draft('special.publicationDate', '17.9.2026');
  draft('special.pollDate', '20.9.2026');
  submit();
  assert.equal(field('special.discoveryDate').value, '16.09.2026');
  assert.equal(field('special.publicationDate').value, '17.09.2026');
  assert.equal(field('special.pollDate').value, '20.09.2026');
  assert.ok(finalDate(), container!.querySelector('.fr-result-region')?.textContent ?? 'No result');
  draft('special.publicationDate', '31.2.2026');
  submit();
  assert.equal(field('special.publicationDate').value, '31.2.2026');
  assert.equal(field('special.publicationDate').getAttribute('aria-invalid'), 'true');
  assert.equal(finalDate(), undefined);
});

test('AP21 social jurisdiction reference and receipt are committed together with explicit case facts', () => {
  mount({ profileId: 'vrpg-be', vrpgSelection: { area: 'social', law: 'elg', action: 'appeal', stage: '' }, inputDate: '2026-09-01' });
  choose(/Zuständigkeit|Versicherungsgericht/, 'BE');
  choose(/Wohnsitz \/ Sitz von Partei/, 'Partei im Kanton Bern, ohne Vertretung');
  choose(/Wohnsitzkanton/, 'BE');
  draft('inputDate', '16.9.2026');
  draft('social.jurisdictionDate', '18.9.2026');
  submit();
  assert.equal(field().value, '16.09.2026');
  assert.equal(field('social.jurisdictionDate').value, '18.09.2026');
  assert.equal(finalDate(), '16.10.2026', container!.querySelector('.fr-result-region')?.textContent ?? 'No result');
  draft('social.jurisdictionDate', '31.2.2026');
  submit();
  assert.equal(field('social.jurisdictionDate').value, '31.2.2026');
  assert.equal(finalDate(), undefined);
  choose(/Örtlich zuständiges Versicherungsgericht/, 'ZH');
  assert.equal(field('social.jurisdictionDate').value, '');
  choose(/Örtlich zuständiges Versicherungsgericht/, 'BE');
  assert.equal(field('social.jurisdictionDate').value, '');
  assert.equal(field().value, '16.09.2026');
});
