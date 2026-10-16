// SPDX-License-Identifier: AGPL-3.0-only
// Approved-shaped evidence exists only inside this test. No data approval is made.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { after, afterEach, test } from 'node:test';
import { buildSync } from 'esbuild';
import type * as ReactType from 'react';
import type * as TestUtilsType from 'react-dom/test-utils';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://ap23d2-policy.invalid', pretendToBeVisual: true });
const globals = new Map<string, PropertyDescriptor | undefined>();
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'Event', 'MouseEvent',
  'MutationObserver', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'MessageChannel']) {
  globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
  const value = dom.window[key];
  Object.defineProperty(globalThis, key, { configurable: true, writable: true,
    value: ['getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame'].includes(key) ? value.bind(dom.window) : value });
}
dom.window.matchMedia = (query: string) => ({ matches: false, media: query, onchange: null,
  addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false });
const ReactDOM = require('react-dom');
const { act, Simulate } = require('react-dom/test-utils') as typeof TestUtilsType;
const bundle = buildSync({ stdin: { contents: `
  import React from 'react';
  import {setIconOptions} from '@fluentui/react/lib/Styling';
  import {FristenrechnerApp} from './src/ui/FristenrechnerApp';
  import {mvp07Runtime} from './src/release/mvp07ReleaseData';
  import {createSyntheticFormat8Context} from './tests/core/ap23d1Fixtures';
  import {emptyAdministrativePreferences} from './src/ui/administrativeDefaults';
  setIconOptions({disableWarnings:true});
  const context = createSyntheticFormat8Context('approved');
  export function element(referenceOnlyAllCalculations){
    const values = new Map([['fristenrechner.defaults.v5',JSON.stringify({version:5,state:'preferences',preferences:{
      ...emptyAdministrativePreferences(),authorityCode:'TI',deadlineDays:30,deliveryMethod:'otherLegallyRelevantDate',
      procedureSelection:{kind:'cantonalAdministrative',lawId:'lpamm-ti',pathId:'ti-80-30',revision:1,stage:'administrativeAppeal'}
    }})]]);
    return React.createElement(FristenrechnerApp,{
      ...mvp07Runtime, administrativeContext:context, referenceOnlyAllCalculations,
      storage:{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)}
    });
  }
`, loader: 'tsx', resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false,
  external: ['react', 'react-dom'], logLevel: 'silent' });
const module = { exports: {} };
new Function('require', 'module', 'exports', bundle.outputFiles[0]!.text)(require, module, module.exports);
const app = module.exports as { element(referenceOnly: boolean): ReactType.ReactElement };
let root: HTMLDivElement | undefined;
function label(el: Element): string {
  return el.getAttribute('aria-label') || (el.getAttribute('aria-labelledby') ?? '').split(' ')
    .map(id => document.getElementById(id)?.textContent ?? '').join(' ');
}
function calculate(referenceOnly: boolean): void {
  root = document.createElement('div'); document.body.append(root);
  act(() => { ReactDOM.render(app.element(referenceOnly), root); });
  const qualification = Array.from(root.querySelectorAll('[role="combobox"]')).find(el => /Fallkonstellation/.test(label(el)));
  assert.ok(qualification, Array.from(root.querySelectorAll('[role="combobox"]')).map(label).join(' | '));
  act(() => { Simulate.click(qualification); });
  const option = Array.from(document.querySelectorAll('[role="option"]')).find(el => /^Allgemeines kantonales/.test(el.textContent ?? ''));
  assert.ok(option);
  act(() => { Simulate.click(option); });
  const date = root.querySelector<HTMLInputElement>('input[name="inputDate"]');
  assert.ok(date);
  act(() => { date.value = '02.10.2026'; Simulate.change(date); });
  act(() => { Simulate.submit(root!.querySelector('form')!); });
  assert.match(root.querySelector('.fr-result__hero')!.textContent!, /02\.11\.2026/);
}
afterEach(() => { if (root) { act(() => { ReactDOM.unmountComponentAtNode(root); }); root.remove(); root = undefined; } });
after(() => { dom.window.close(); for (const [key, descriptor] of globals) descriptor
  ? Object.defineProperty(globalThis, key, descriptor) : Reflect.deleteProperty(globalThis, key); });

test('AP23D2 global reference-only UI policy suppresses administrative export even with an approved-shaped context', () => {
  calculate(true);
  assert.equal(root!.querySelector('.fr-calendar-export'), null);
  assert.equal(Array.from(root!.querySelectorAll('button')).some(el => /Kalendereintrag erstellen/.test(el.textContent ?? '')), false);
});

test('AP23D2 normal UI policy exposes the verified administrative export without executing a download', () => {
  calculate(false);
  assert.ok(root!.querySelector('.fr-calendar-export button'));
});
