// SPDX-License-Identifier: AGPL-3.0-only
// Actual form, calculation and defaults. No hook or result substitution.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { after, afterEach, test } from 'node:test';
import { buildSync } from 'esbuild';
import type * as ReactType from 'react';
import type * as TestUtilsType from 'react-dom/test-utils';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://ap23d2-ux.invalid', pretendToBeVisual: true });
const savedGlobals = new Map<string, PropertyDescriptor | undefined>();
for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'Event', 'MouseEvent',
  'MutationObserver', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'MessageChannel']) {
  savedGlobals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
  const candidate = dom.window[name];
  Object.defineProperty(globalThis, name, { configurable: true, writable: true,
    value: ['getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame'].includes(name) ? candidate.bind(dom.window) : candidate });
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
  import {ap23d2AdministrativeContext} from './src/release/ap23d2CandidateData';
  setIconOptions({disableWarnings:true});
  export function element(storage,initialState){return React.createElement(FristenrechnerApp,{
    ...mvp07Runtime, administrativeContext:ap23d2AdministrativeContext, storage, initialState,
    referenceOnlyAllCalculations:true, localReviewLabel:'AP23D2 UX reference test'
  });}
`, loader: 'tsx', resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false,
  external: ['react', 'react-dom'], logLevel: 'silent' });
const module = { exports: {} };
new Function('require', 'module', 'exports', bundle.outputFiles[0]!.text)(require, module, module.exports);
const app = module.exports as { element(storage: unknown, initialState?: unknown): ReactType.ReactElement };
const OLD = 'fristenrechner.defaults.v1', NEW = 'fristenrechner.defaults.v5';
let root: HTMLDivElement | undefined;
let values = new Map<string, string>();
function mount(initialState?: unknown, seed = new Map<string, string>()): void {
  values = seed;
  const storage = { getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
  root = document.createElement('div'); document.body.append(root);
  act(() => { ReactDOM.render(app.element(storage, initialState), root); });
}
function unmount(): void { if (root) { act(() => { ReactDOM.unmountComponentAtNode(root); }); root.remove(); root = undefined; } }
function name(el: Element): string { return el.getAttribute('aria-label') || (el.getAttribute('aria-labelledby') ?? '').split(' ').map(id => document.getElementById(id)?.textContent ?? '').join(' '); }
function dropdowns(): Element[] { return Array.from(root!.querySelectorAll('[role="combobox"]')); }
function choose(label: RegExp, option: RegExp): void {
  const select = dropdowns().find(el => label.test(name(el)));
  assert.ok(select, `Missing dropdown ${label}: ${dropdowns().map(name)}`);
  act(() => { Simulate.click(select); });
  const opts = Array.from(document.querySelectorAll('[role="option"]'));
  const selected = opts.find(el => option.test(el.textContent ?? ''));
  assert.ok(selected, `Missing option ${option}: ${opts.map(el => el.textContent)}`);
  act(() => { Simulate.click(selected); });
}
function date(value: string): void {
  const field = root!.querySelector<HTMLInputElement>('input[name="inputDate"]'); assert.ok(field);
  act(() => { field.value = value; Simulate.change(field); });
}
function submit(): void { act(() => { Simulate.submit(root!.querySelector('form')!); }); }
function click(label: RegExp): void {
  const button = Array.from(root!.querySelectorAll('button')).find(el => label.test(el.textContent ?? '')); assert.ok(button, String(label));
  act(() => { Simulate.click(button); });
}
function friendlyTrace(): HTMLElement {
  const clone = root!.querySelector<HTMLElement>('.fr-trace')!.cloneNode(true) as HTMLElement;
  // The outer trace can be opened by the user. Only nested technical disclosure
  // is excluded from its normal explanation.
  clone.querySelectorAll('details').forEach(el => el.remove());
  return clone;
}
const zpo = { authorityCode: 'BE', profileId: 'zpo', deadlineDays: '1',
  selectors: { deliveryMethod: 'otherLegallyRelevantDate', procedureVariant: 'ordinary' } };
afterEach(unmount);
after(() => { dom.window.close(); for (const [key, descriptor] of savedGlobals) descriptor ? Object.defineProperty(globalThis, key, descriptor) : Reflect.deleteProperty(globalThis, key); });

test('UX ZPO derives the actual seat, clears contradictory regional facts and has no duplicate input', () => {
  mount({ ...zpo, calendarContext: { role: 'court', canton: 'AI', areaFacts: { 'AI-RTG-INNER-ADDITIONAL': true } } });
  assert.equal(dropdowns().some(el => /Feiertagskanton|Sitz des Gerichts|Zustellkonstellation/.test(name(el))), false);
  date('24.12.2026'); submit();
  assert.ok(root!.querySelector('.fr-result__hero'));
  click(/^Als Standard speichern$/);
  assert.deepEqual(JSON.parse(values.get(NEW)!).preferences.calendarPreference, { role: 'court', canton: 'BE' });
  assert.doesNotMatch(values.get(NEW)!, /areaFacts|AI-RTG/);
  assert.equal(root!.querySelectorAll('.fr-form__grid').length, 1);
});

test('UX ZPO authority changes invalidate the result and require a real court canton for Bund', () => {
  mount(zpo); date('16.09.2026'); submit(); assert.ok(root!.querySelector('.fr-result__hero'));
  choose(/Sitz der zuständigen Stelle/, /^Bundesbehörde/);
  assert.equal(root!.querySelector('.fr-result'), null);
  assert.ok(dropdowns().some(el => /Sitz des Gerichts.*Kanton/.test(name(el))));
  choose(/Verfahrensart/, /^Ordentlich/);
  date('16.09.2026'); submit(); assert.equal(root!.querySelector('.fr-result__hero'), null);
  choose(/Sitz des Gerichts.*Kanton/, /^Bern/); submit();
  assert.ok(root!.querySelector('.fr-result__hero'), root!.querySelector('.fr-result-region')!.textContent!);
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /17\.09\.2026/);
  choose(/Sitz der zuständigen Stelle/, /^Appenzell Innerrhoden/);
  assert.equal(root!.querySelector('.fr-result'), null);
  assert.ok(dropdowns().some(el => /Gericht.*Inneren Land/.test(name(el))));
  submit(); assert.equal(root!.querySelector('.fr-result__hero'), null);
});

test('UX party and representative location are facts, not a free holiday calendar choice', () => {
  mount({ authorityCode:'BE', profileId:'stpo', deadlineDays:'10', selectors:{deliveryMethod:'otherLegallyRelevantDate'},
    calendarContext:{role:'partyWithoutRepresentative',canton:'BE',areaFacts:{}} });
  assert.ok(dropdowns().some(el => /Wohnsitz.*Sitz der Partei.*Kanton/.test(name(el))));
  date('16.09.2026'); submit(); assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /28\.09\.2026/);
  const role = dropdowns().find(el => /Partei ohne Vertretung/.test(el.textContent ?? ''))!;
  assert.ok(role); choose(new RegExp(name(role)), /^Eindeutig zustellungsberechtigte Vertretung/);
  assert.equal(root!.querySelector('.fr-result'), null);
  assert.ok(dropdowns().some(el => /Wohnsitz.*Sitz der Vertretung.*Kanton/.test(name(el))));
  submit(); assert.equal(root!.querySelector('.fr-result__hero'), null);
});

test('UX year-end trace presents the ZPO norm and real dates, full generator provenance is closed', () => {
  mount({ ...zpo, deadlineDays:'5' }); date('17.12.2026'); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /07\.01\.2027/);
  const friendly = friendlyTrace();
  assert.match(friendly.textContent!, /18\.12\.2026/);
  assert.match(friendly.textContent!, /02\.01\.2027/);
  assert.match(friendly.textContent!, /Art\. 145/);
  assert.doesNotMatch(friendly.textContent!, /CH-CAL-|SRC-|ZPO-SUSP-|Art\. 46 Abs\. 1|Art\. 22a Abs\. 1/);
  assert.ok(Array.from(friendly.querySelectorAll('a')).some(a => /2010\/262/.test(a.href)));
  const raw = root!.querySelector('.fr-trace')!;
  assert.match(raw.textContent!, /CH-CAL-SUSP-YEAR-END/);
  for (const detail of Array.from(raw.querySelectorAll('details'))) assert.equal(detail.hasAttribute('open'), false);
  assert.equal(root!.querySelector('.fr-calendar-export'), null);
  choose(/Sprache/, /^Français/);
  assert.match(friendlyTrace().textContent!, /18\.12\.2026/);
  assert.match(root!.querySelector('.fr-trace')!.textContent!, /Justificatifs techniques/);
});

test('UX old conflicting ZPO defaults are normalized only in the new key and reload consistently', () => {
  const original = JSON.stringify({version:4,locale:'de',authorityCode:'TI',profileId:'zpo',deadlineDays:1,
    selectors:zpo.selectors,calendarId:'be-public-holidays',specialRegimeId:'',specialDefinitionId:'',
    calendarContext:{role:'court',canton:'BE',areaFacts:{}}});
  mount(undefined,new Map([[OLD,original]]));
  date('07.12.2026'); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /09\.12\.2026/);
  click(/^Als Standard speichern$/);
  assert.equal(values.get(OLD),original);
  assert.deepEqual(JSON.parse(values.get(NEW)!).preferences.calendarPreference,{role:'court',canton:'TI'});
  const same=values; unmount(); mount(undefined,same);
  date('07.12.2026'); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /09\.12\.2026/);
  assert.equal(values.get(OLD),original);
});

test('UX actual AHVG form shows the ATSG suspension norm rather than shared calendar provenance', () => {
  mount({authorityCode:'BE',profileId:'vrpg-be',vrpgSelection:{area:'social',law:'ahvg',action:'objection',stage:''}});
  choose(/Kanton der für diesen Fall zuständigen kantonalen Ausgleichskasse/, /^BE$/);
  choose(/Wohnsitz.*Sitz von Partei und Vertretung/, /^Partei im Kanton Bern, ohne Vertretung$/);
  date('17.12.2026'); submit();
  assert.ok(root!.querySelector('.fr-result__hero'), root!.querySelector('.fr-result-region')!.textContent!);
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /01\.02\.2027/);
  const friendly=friendlyTrace();
  assert.match(friendly.textContent!, /Art\. 38 Abs\. 4/);
  assert.match(friendly.textContent!, /18\.12\.2026/);
  assert.match(friendly.textContent!, /02\.01\.2027/);
  assert.doesNotMatch(friendly.textContent!, /SRC-|CH-CAL-|skipped\d+CalendarDays|Art\. 145 Abs\. 1|Art\. 46 Abs\. 1|Art\. 22a Abs\. 1/);
  assert.match(root!.querySelector('.fr-trace')!.textContent!, /CH-CAL-SUSP-YEAR-END/);
});
