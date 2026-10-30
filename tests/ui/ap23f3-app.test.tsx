// SPDX-License-Identifier: AGPL-3.0-only
// Real Format-10 candidate app interactions, no substituted hooks, policy or calculation result.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { after, afterEach, test } from 'node:test';
import { buildSync } from 'esbuild';
import type * as ReactType from 'react';
import type * as TestUtilsType from 'react-dom/test-utils';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://ap23f3.invalid', pretendToBeVisual: true });
const savedGlobals = new Map<string, PropertyDescriptor | undefined>();
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'Event', 'MouseEvent',
  'MutationObserver', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'MessageChannel']) {
  savedGlobals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
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
  import {createFormat10CalculationData} from './src/core/format10CalculationData';
  import {createFormat9CalculationData} from './src/core/format9CalculationData';
  import {ap23f3ManifestText,ap23f3Files,ap23f3CandidateRuntime as runtime} from './src/release/ap23f3CandidateData';
  import {ap23e3ManifestText,ap23e3Files} from './src/release/ap23e3CandidateData';
  setIconOptions({disableWarnings:true});
  export const element=storage=>React.createElement(FristenrechnerApp,{...runtime,storage,localReviewLabel:'AP23F3 reference test'});
  export function mismatchedElement(storage){
    const other=createFormat10CalculationData(ap23f3ManifestText,ap23f3Files,{mode:'localReference'});
    return React.createElement(FristenrechnerApp,{...runtime,administrativeContext:other.administrativeContext,storage});
  }
  export function historicalElement(storage){
    const old=createFormat9CalculationData(ap23e3ManifestText,ap23e3Files,{mode:'localReference'});
    return React.createElement(FristenrechnerApp,{...old,storage});
  }
`, loader: 'tsx', resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false,
  external: ['react', 'react-dom'], logLevel: 'silent' });
const module = { exports: {} };
new Function('require', 'module', 'exports', bundle.outputFiles[0]!.text)(require, module, module.exports);
const app = module.exports as Record<'element' | 'mismatchedElement' | 'historicalElement', (storage: unknown) => ReactType.ReactElement>;
const NEW = 'fristenrechner.defaults.v5';
let root: HTMLDivElement | undefined, values = new Map<string, string>();
function mount(seed = new Map<string, string>(), kind: 'element' | 'mismatchedElement' | 'historicalElement' = 'element'): void {
  values = seed;
  const storage = { getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
  root = document.createElement('div'); document.body.append(root);
  act(() => { ReactDOM.render(app[kind](storage), root); });
}
function unmount(): void { if (root) { act(() => { ReactDOM.unmountComponentAtNode(root); }); root.remove(); root = undefined; } }
function name(element: Element): string { return element.getAttribute('aria-label') || (element.getAttribute('aria-labelledby') ?? '').split(' ').map(id => document.getElementById(id)?.textContent ?? '').join(' '); }
function choose(label: RegExp, option: RegExp): void {
  const select = Array.from(root!.querySelectorAll('[role="combobox"]')).find(element => label.test(name(element)));
  assert.ok(select, `Missing dropdown ${label}`); act(() => { Simulate.click(select); });
  const options = Array.from(document.querySelectorAll('[role="option"]'));
  const selected = options.find(element => option.test(element.textContent ?? ''));
  assert.ok(selected, `Missing option ${option}: ${options.map(element => element.textContent)}`);
  act(() => { Simulate.click(selected); });
}
function date(value: string): void {
  const field = root!.querySelector<HTMLInputElement>('input[name="inputDate"]'); assert.ok(field); assert.equal(field.disabled, false);
  act(() => { field.value = value; Simulate.change(field); });
}
function submit(): void { act(() => { Simulate.submit(root!.querySelector('form')!); }); }
function click(label: RegExp): void {
  const button = Array.from(root!.querySelectorAll('button')).find(element => label.test(element.textContent ?? ''));
  assert.ok(button, String(label)); act(() => { Simulate.click(button); });
}
function agExecution(): void {
  choose(/Sitz der zuständigen Stelle/, /^Aargau/); choose(/Verfahrensrecht/, /^VRPG AG/);
  choose(/Verfahrensstadium/, /^Gerichtsverfahren/); choose(/Verfahrenshandlung/, /^Beschwerde gegen den Vollstreckungsteil/);
  choose(/Fallkonstellation/, /^Vollstreckungsteil/);
}
afterEach(async () => { await act(async () => { await new Promise(resolve => setTimeout(resolve, 250)); }); unmount(); });
after(() => { dom.window.close(); for (const [key, descriptor] of savedGlobals) descriptor
  ? Object.defineProperty(globalThis, key, descriptor) : Reflect.deleteProperty(globalThis, key); });

test('AP23F3 date stays early and the native ZH case uses the single two-column form with no export', async () => {
  mount(); date('02.10.2026');
  choose(/Sitz der zuständigen Stelle/, /^Zürich/); choose(/Verfahrensrecht/, /^VRG ZH/);
  choose(/Verfahrensstadium/, /^Verwaltungsbeschwerde/); choose(/Verfahrenshandlung/, /^Ordentlicher Rekurs$/);
  choose(/Fallkonstellation/, /^Endentscheid/); submit();
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 300)); });
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /02\.11\.2026/);
  assert.match(root!.textContent!, /AP23F3: lokale Integrationsprüfung/);
  assert.match(root!.textContent!, /Sämtliche Kalenderexporte sind gesperrt/);
  assert.equal(root!.querySelectorAll('.fr-form__grid').length, 1);
  assert.equal(root!.querySelector('.fr-calendar-export'), null);
  assert.doesNotMatch(root!.textContent!, /Fristauslösendes Dokument|Massgeblicher Feiertagskanton|Zielorgan/);
});

test('AP23F3 SG has distinct VRK/VG and five-day action labels with path-specific grouped qualifiers', () => {
  mount(); date('10.07.2027');
  choose(/Sitz der zuständigen Stelle/, /^St\. Gallen/); choose(/Verfahrensrecht/, /^VRP SG/);
  choose(/Verfahrensstadium/, /^Gerichtsverfahren/);
  choose(/Verfahrenshandlung/, /^Rekurs über Dokumentenzugang/); choose(/Fallkonstellation/, /^Formelle Departementsverfügung/); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /25\.08\.2027/);
  choose(/Verfahrenshandlung/, /^Beschwerde gegen vorsorgliche Massnahme/); submit();
  assert.equal(root!.querySelector('.fr-result__hero'), null);
  choose(/Fallkonstellation/, /^Vorsorgliche Massnahme nach Art\. 60/); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /15\.07\.2027/);
  assert.equal(root!.querySelector('input[type="number"]'), null);
  assert.match(root!.textContent!, /Fristdauer/);
});

test('AP23F3 V5 stores only stable AG preferences and reload requires fresh current qualification', async () => {
  const oldKey = 'fristenrechner.defaults.v1', old = JSON.stringify({ version: 4, locale: 'de', authorityCode: 'BE', profileId: 'stpo', deadlineDays: 10 });
  mount(new Map([[oldKey, old]])); agExecution(); date('10.07.2027'); submit(); click(/^Als Standard speichern$/);
  const text = values.get(NEW)!, saved = JSON.parse(text);
  assert.equal(saved.version, 5); assert.equal(saved.preferences.deadlineDays, 10);
  assert.deepEqual(saved.preferences.procedureSelection, { kind: 'cantonalAdministrative', lawId: 'vrpg-ag', pathId: 'ag-execution-10', revision: 1, stage: 'court' });
  assert.equal(values.get(oldKey), old);
  assert.doesNotMatch(text, /inputDate|caseQualification|qualification|notice|channelCase|exceptionNotice|targetBody|procedureMatter|2027-07-10|calendarReference/);
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 250)); });
  const seed = values; unmount(); mount(seed);
  assert.equal(root!.querySelector<HTMLInputElement>('input[name="inputDate"]')!.value, '');
  assert.equal(root!.querySelector('.fr-result__hero'), null);
  date('10.07.2027'); submit(); assert.match(root!.querySelector('.fr-result-region')!.textContent!, /aktuelle Fallkonstellation/);
  choose(/Fallkonstellation/, /^Vollstreckungsteil/); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /23\.08\.2027/);
});

test('AP23F3 route, stage and canton changes always clear current qualifier and result', () => {
  mount(); agExecution(); date('02.10.2026'); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /12\.10\.2026/);
  choose(/Verfahrenshandlung/, /^Ordentliche Beschwerde an das Gericht/); submit();
  assert.equal(root!.querySelector('.fr-result__hero'), null);
  choose(/Fallkonstellation/, /^Endentscheid/); choose(/Verfahrensstadium/, /^Verwaltungsverfahren$/);
  choose(/Verfahrenshandlung/, /^Ordentliche Verwaltungsbeschwerde/); submit();
  assert.match(root!.querySelector('.fr-result-region')!.textContent!, /aktuelle Fallkonstellation/);
  choose(/Sitz der zuständigen Stelle/, /^Zürich/); choose(/Verfahrensrecht/, /^VRG ZH/);
  choose(/Verfahrensstadium/, /^Verwaltungsbeschwerde/); choose(/Verfahrenshandlung/, /^Ordentlicher Rekurs$/); submit();
  assert.match(root!.querySelector('.fr-result-region')!.textContent!, /aktuelle Fallkonstellation/);
});

test('AP23F3 a new V5 path is protected on rollback to Format9 and cannot silently become an old route', async () => {
  mount(); agExecution(); click(/^Als Standard speichern$/);
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 250)); });
  const seed = values, bytes = values.get(NEW); unmount(); mount(seed, 'historicalElement');
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 300)); });
  assert.match(root!.textContent!, /nicht verwendbar.*unverändert geschützt/);
  assert.equal(root!.querySelector('.fr-result__hero'), null); assert.equal(values.get(NEW), bytes);
});

test('AP23F3 French ZH/AG/SG labels and legal trace contain no raw translation keys', () => {
  mount(); choose(/Sprache/, /^Français/); date('02.10.2026');
  choose(/Siège/, /^Saint-Gall/); choose(/droit de procédure/i, /^VRP SG/);
  choose(/Stade de la procédure/, /^Procédure judiciaire/);
  choose(/Acte de procédure/, /^Recours d’accès.*Commission/);
  choose(/Situation du cas/, /^Décision formelle/); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /16\.10\.2026/);
  assert.match(root!.textContent!, /Calcul de référence local/);
  assert.doesNotMatch(root!.querySelector('.fr-result-region')!.textContent!, /case\.|scope\.|law\.|action\.|administrative\./);
});

test('AP23F3 mismatched native Format10 identities fail before rendering the form', () => {
  mount(new Map(), 'mismatchedElement'); assert.match(root!.textContent!, /nicht zu demselben geprüften Release/);
  assert.equal(root!.querySelector('form'), null);
});

test('AP23F3 existing TI, ZPO and all eleven social laws remain available in the same native bundle', () => {
  mount(); date('02.10.2026');
  choose(/Sitz der zuständigen Stelle/, /^Tessin/); choose(/Verfahrensrecht/, /^LPAmm/);
  choose(/Verfahrensstadium/, /^Verwaltungsbeschwerde/); choose(/Verfahrenshandlung/, /^Ordentliche Verwaltungsbeschwerde/);
  choose(/Fallkonstellation/, /^Allgemeines kantonales/); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /02\.11\.2026/);
  choose(/Verfahrensrecht/, /^Zivilprozessordnung/); choose(/Verfahrensart/, /^Ordentlich/); date('07.12.2026');
  const field = root!.querySelector<HTMLInputElement>('input[type="number"]')!;
  act(() => { field.value = '1'; Simulate.change(field); }); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /09\.12\.2026/);
  assert.equal(root!.querySelector('.fr-calendar-export'), null);
  choose(/Sitz der zuständigen Stelle/, /^Bern/); choose(/Verfahrensrecht/, /^VRPG Bern/); choose(/Bereich/, /^Sozialversicherungsrecht/);
  const select = Array.from(root!.querySelectorAll('[role="combobox"]')).find(element => /Spezialerlass/.test(name(element)))!;
  act(() => { Simulate.click(select); });
  const options = Array.from(document.querySelectorAll('[role="option"]'));
  for (const law of ['AHVG', 'IVG', 'UVG', 'ELG', 'AVIG', 'KVG', 'EOG', 'FamZG', 'FLG', 'MVG', 'ÜLG']) assert.ok(options.some(option => option.textContent?.includes(law)), law);
  act(() => { Simulate.click(options.find(option => option.textContent?.includes('AHVG'))!); });
  choose(/Verfahrenshandlung/, /^Einsprache/); choose(/Kanton der für diesen Fall zuständigen kantonalen Ausgleichskasse/, /^BE$/);
  choose(/Wohnsitz.*Sitz von Partei und Vertretung/, /^Partei im Kanton Bern, ohne Vertretung$/); date('17.12.2026'); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /01\.02\.2027/);
  assert.match(root!.querySelector('.fr-data-status')!.textContent!, /2026-10-22-ap23f3-candidate\.1/);
  assert.equal(root!.querySelector('.fr-calendar-export'), null);
});
