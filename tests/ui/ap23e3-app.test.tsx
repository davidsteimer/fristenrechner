// SPDX-License-Identifier: AGPL-3.0-only
// Interaction regression against the real local Format-9 bundle, without replacing hooks or calculation results.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { after, afterEach, test } from 'node:test';
import { buildSync } from 'esbuild';
import type * as ReactType from 'react';
import type * as TestUtilsType from 'react-dom/test-utils';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://ap23e3.invalid', pretendToBeVisual: true });
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
  import {createFormat9CalculationData} from './src/core/format9CalculationData';
  import {ap23e3ManifestText,ap23e3Files} from './src/release/ap23e3CandidateData';
  setIconOptions({disableWarnings:true});
  const runtime=createFormat9CalculationData(ap23e3ManifestText,ap23e3Files,{mode:'localReference'});
  export const element=storage=>React.createElement(FristenrechnerApp,{...runtime,storage,localReviewLabel:'AP23E3 reference test'});
  export function mismatchedElement(storage){
    const other=createFormat9CalculationData(ap23e3ManifestText,ap23e3Files,{mode:'localReference'});
    return React.createElement(FristenrechnerApp,{...runtime,administrativeContext:other.administrativeContext,storage});
  }
`, loader: 'tsx', resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false,
  external: ['react', 'react-dom'], logLevel: 'silent' });
const module = { exports: {} };
new Function('require', 'module', 'exports', bundle.outputFiles[0]!.text)(require, module, module.exports);
const app = module.exports as { element(storage: unknown): ReactType.ReactElement; mismatchedElement(storage: unknown): ReactType.ReactElement };
const OLD = 'fristenrechner.defaults.v1', NEW = 'fristenrechner.defaults.v5';
let root: HTMLDivElement | undefined;
let values = new Map<string, string>();
let storage: { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void };
function mount(seed = new Map<string, string>(), mismatched = false): void {
  values = seed;
  storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: key => { values.delete(key); } };
  root = document.createElement('div'); document.body.append(root);
  act(() => { ReactDOM.render(mismatched ? app.mismatchedElement(storage) : app.element(storage), root); });
}
function unmount(): void { if (root) { act(() => { ReactDOM.unmountComponentAtNode(root); }); root.remove(); root = undefined; } }
function name(el: Element): string { return el.getAttribute('aria-label') || (el.getAttribute('aria-labelledby') ?? '').split(' ').map(id => document.getElementById(id)?.textContent ?? '').join(' '); }
function choose(label: RegExp, option: RegExp): void {
  const select = Array.from(root!.querySelectorAll('[role="combobox"]')).find(el => label.test(name(el)));
  assert.ok(select, `Missing dropdown ${label}`);
  act(() => { Simulate.click(select); });
  const options = Array.from(document.querySelectorAll('[role="option"]'));
  const selected = options.find(el => option.test(el.textContent ?? ''));
  assert.ok(selected, `Missing option ${option}: ${options.map(el => el.textContent)}`);
  act(() => { Simulate.click(selected); });
}
function date(value: string): void {
  const field = root!.querySelector<HTMLInputElement>('input[name="inputDate"]'); assert.ok(field); assert.equal(field.disabled, false);
  act(() => { field.value = value; Simulate.change(field); });
}
function submit(): void { act(() => { Simulate.submit(root!.querySelector('form')!); }); }
function click(label: RegExp): void {
  const button = Array.from(root!.querySelectorAll('button')).find(el => label.test(el.textContent ?? '')); assert.ok(button, String(label));
  act(() => { Simulate.click(button); });
}
function arExecution(): void {
  choose(/Sitz der zuständigen Stelle/, /^Appenzell Ausserrhoden/); choose(/Verfahrensrecht/, /^VRPG AR/);
  choose(/Verfahrensstadium/, /^Verwaltungsbeschwerde/); choose(/Verfahrenshandlung/, /^Rekurs gegen eine Vollstreckungsverfügung/);
  choose(/Fallkonstellation/, /^Nichtgeldvollstreckung/);
}
afterEach(unmount);
after(() => { dom.window.close(); for (const [key, descriptor] of savedGlobals) descriptor ? Object.defineProperty(globalThis, key, descriptor) : Reflect.deleteProperty(globalThis, key); });

test('AP23E3 date remains usable before choices, LU result is local and the two-column grid remains single', async () => {
  mount(); date('02.10.2026');
  choose(/Sitz der zuständigen Stelle/, /^Luzern/); choose(/Verfahrensrecht/, /^VRG LU/);
  choose(/Verfahrensstadium/, /^Verwaltungsbeschwerde/); choose(/Verfahrenshandlung/, /^Ordentliche Verwaltungsbeschwerde/);
  choose(/Fallkonstellation/, /^Endentscheid/); submit();
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 300)); });
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /02\.11\.2026/);
  assert.match(root!.textContent!, /AP23E3: lokale Integrationsprüfung/);
  assert.match(root!.textContent!, /Sämtliche Kalenderexporte sind gesperrt/);
  assert.equal(root!.querySelectorAll('.fr-form__grid').length, 1);
  assert.equal(root!.querySelector('.fr-calendar-export'), null);
  assert.doesNotMatch(root!.textContent!, /Fristauslösendes Dokument|Massgeblicher Feiertagskanton/);
});

test('AP23E3 every change of action, stage or law requires fresh case qualification', () => {
  mount(); arExecution(); date('16.09.2026'); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /21\.09\.2026/);
  choose(/Verfahrenshandlung/, /^Ordentliche Verwaltungsbeschwerde/);
  assert.equal(root!.querySelector('.fr-result'), null); submit();
  assert.match(root!.querySelector('.fr-result-region')!.textContent!, /aktuelle Fallkonstellation/);
  choose(/Fallkonstellation/, /^Endentscheid/);
  choose(/Verfahrensstadium/, /^Gerichtsverfahren/); choose(/Verfahrenshandlung/, /^Ordentliche Beschwerde an das Gericht/); submit();
  assert.match(root!.querySelector('.fr-result-region')!.textContent!, /aktuelle Fallkonstellation/);
  choose(/Fallkonstellation/, /^Endentscheid/);
  choose(/Verfahrensrecht/, /^Zivilprozessordnung/); choose(/Verfahrensrecht/, /^VRPG AR/);
  choose(/Verfahrensstadium/, /^Gerichtsverfahren/); choose(/Verfahrenshandlung/, /^Ordentliche Beschwerde an das Gericht/); submit();
  assert.match(root!.querySelector('.fr-result-region')!.textContent!, /aktuelle Fallkonstellation/);
  assert.equal(root!.querySelector('.fr-result__hero'), null);
});

test('AP23E3 defaults v5 store the AR stable path but never case facts or date, including reload', () => {
  const historic = JSON.stringify({ version:4,locale:'de',authorityCode:'BE',profileId:'stpo',deadlineDays:10,selectors:{deliveryMethod:'otherLegallyRelevantDate'} });
  mount(new Map([[OLD, historic]])); arExecution(); date('16.09.2026'); click(/^Als Standard speichern$/);
  const saved = JSON.parse(values.get(NEW)!);
  assert.equal(saved.version, 5); assert.equal(saved.preferences.procedureSelection.pathId, 'ar-execution-5');
  assert.equal(saved.preferences.deadlineDays, 5); assert.equal(values.get(OLD), historic);
  assert.doesNotMatch(values.get(NEW)!, /inputDate|caseQualification|qualification|notice|termChange|decisionKind|2026-09-16/);
  const same = values; unmount(); mount(same); date('16.09.2026'); submit();
  assert.match(root!.querySelector('.fr-result-region')!.textContent!, /aktuelle Fallkonstellation/);
  assert.equal(root!.querySelector('.fr-result__hero'), null);
  choose(/Fallkonstellation/, /^Nichtgeldvollstreckung/); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /21\.09\.2026/);
});

test('AP23E3 special and unknown cases remain blocked and single real action stays fixed', () => {
  mount(); date('02.10.2026');
  choose(/Sitz der zuständigen Stelle/, /^Zug/); choose(/Verfahrensrecht/, /^VRG ZG/);
  choose(/Verfahrensstadium/, /^Verwaltungsverfahren$/);
  assert.equal(Array.from(root!.querySelectorAll('[role="combobox"]')).some(el => /Verfahrenshandlung/.test(name(el))), false);
  assert.match(root!.textContent!, /prozessuale Eingabe \(keine Zahlung\)/);
  for (const choice of [/^Spezialrecht/, /^Nicht geklärt/]) {
    choose(/Fallkonstellation/, choice); submit(); assert.equal(root!.querySelector('.fr-result__hero'), null);
  }
});

test('AP23E3 French law filtering and case qualifiers have no raw translation keys', () => {
  mount(); choose(/Sprache/, /^Français/); date('02.10.2026');
  choose(/Siège/, /^Zoug/); choose(/droit de procédure/i, /^VRG ZG/);
  choose(/Stade de la procédure/, /^Recours administratif/); choose(/Acte de procédure/, /^Recours administratif ordinaire/);
  choose(/Situation du cas/, /^Décision finale/); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /22\.10\.2026/);
  assert.match(root!.textContent!, /Calcul de référence local/);
  assert.doesNotMatch(root!.querySelector('.fr-result-region')!.textContent!, /case\.|scope\.|law\.|action\.|administrative\./);
});

test('AP23E3 mismatched context identities are rejected before rendering a form', () => {
  mount(new Map(), true);
  assert.match(root!.textContent!, /nicht zu demselben geprüften Release/);
  assert.equal(root!.querySelector('form'), null);
});

test('AP23E3 existing TI and ZPO share the real Format-9 release without reference exports', () => {
  mount(); date('02.10.2026');
  choose(/Sitz der zuständigen Stelle/, /^Tessin/); choose(/Verfahrensrecht/, /^LPAmm/);
  choose(/Verfahrensstadium/, /^Verwaltungsbeschwerde/); choose(/Verfahrenshandlung/, /^Ordentliche Verwaltungsbeschwerde/);
  choose(/Fallkonstellation/, /^Allgemeines kantonales/); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /02\.11\.2026/);
  choose(/Verfahrensrecht/, /^Zivilprozessordnung/); choose(/Verfahrensart/, /^Ordentlich/); date('07.12.2026');
  const field = root!.querySelector<HTMLInputElement>('input[type="number"]')!;
  act(() => { field.value = '1'; Simulate.change(field); }); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /09\.12\.2026/);
  assert.match(root!.querySelector('.fr-data-status')!.textContent!, /2026-10-18-ap23e3-reference\.1/);
  assert.equal(root!.querySelector('.fr-calendar-export'), null);
});

test('AP23E3 retains all eleven social laws and computes the existing AHVG case on the same release', () => {
  mount(); choose(/Sitz der zuständigen Stelle/, /^Bern/); choose(/Verfahrensrecht/, /^VRPG Bern/);
  choose(/Bereich/, /^Sozialversicherungsrecht/);
  const select = Array.from(root!.querySelectorAll('[role="combobox"]')).find(el => /Spezialerlass/.test(name(el)))!;
  act(() => { Simulate.click(select); });
  const options = Array.from(document.querySelectorAll('[role="option"]'));
  for (const law of ['AHVG', 'IVG', 'UVG', 'ELG', 'AVIG', 'KVG', 'EOG', 'FamZG', 'FLG', 'MVG', 'ÜLG']) {
    assert.ok(options.some(option => option.textContent?.includes(law)), law);
  }
  act(() => { Simulate.click(options.find(option => option.textContent?.includes('AHVG'))!); });
  choose(/Verfahrenshandlung/, /^Einsprache/);
  choose(/Kanton der für diesen Fall zuständigen kantonalen Ausgleichskasse/, /^BE$/);
  choose(/Wohnsitz.*Sitz von Partei und Vertretung/, /^Partei im Kanton Bern, ohne Vertretung$/);
  date('17.12.2026'); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /01\.02\.2027/);
  assert.match(root!.querySelector('.fr-data-status')!.textContent!, /2026-10-18-ap23e3-reference\.1/);
  assert.equal(root!.querySelector('.fr-calendar-export'), null);
});
