// SPDX-License-Identifier: AGPL-3.0-only
// Genuine component, reader and core in one bundle. No hook/result substitution.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { after, afterEach, test } from 'node:test';
import { buildSync } from 'esbuild';
import type * as ReactType from 'react';
import type * as TestUtilsType from 'react-dom/test-utils';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://ap23d3.invalid', pretendToBeVisual: true });
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
  import {createFormat8CalculationData} from './src/core/calculatorRuntime';
  import {ap23d2ManifestText,ap23d2Files} from './src/release/ap23d2CandidateData';

  setIconOptions({disableWarnings:true});
  let runtime = createFormat8CalculationData(ap23d2ManifestText,ap23d2Files,{mode:'localReference'});
  export function freshContext(){runtime=createFormat8CalculationData(ap23d2ManifestText,ap23d2Files,{mode:'localReference'});}
  export function mismatchedElement(storage){
    const other=createFormat8CalculationData(ap23d2ManifestText,ap23d2Files,{mode:'localReference'});
    return React.createElement(FristenrechnerApp,{...runtime,administrativeContext:other.administrativeContext,storage});
  }
  export function element(storage){return React.createElement(FristenrechnerApp,{
    ...runtime, storage,
    localReviewLabel:'AP23D3 reference test'
  });}
`, loader: 'tsx', resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false,
  external: ['react', 'react-dom'], logLevel: 'silent' });
const module = { exports: {} };
new Function('require', 'module', 'exports', bundle.outputFiles[0]!.text)(require, module, module.exports);
const app = module.exports as { element(storage: unknown): ReactType.ReactElement; freshContext(): void;
  mismatchedElement(storage: unknown): ReactType.ReactElement };
const OLD = 'fristenrechner.defaults.v1', NEW = 'fristenrechner.defaults.v5';
let root: HTMLDivElement | undefined;
let values = new Map<string, string>();
let storage: { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void };
function mount(seed = new Map<string, string>()): void {
  values = seed;
  storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: key => { values.delete(key); } };
  root = document.createElement('div'); document.body.append(root);
  act(() => { ReactDOM.render(app.element(storage), root); });
}
function unmount(): void { if (root) { act(() => { ReactDOM.unmountComponentAtNode(root); }); root.remove(); root = undefined; } }
function name(el: Element): string { return el.getAttribute('aria-label') || (el.getAttribute('aria-labelledby') ?? '').split(' ').map(id => document.getElementById(id)?.textContent ?? '').join(' '); }
function choose(label: RegExp, option: RegExp): void {
  const select = Array.from(root!.querySelectorAll('[role="combobox"]')).find(el => label.test(name(el)));
  assert.ok(select, `Missing dropdown ${label}: ${Array.from(root!.querySelectorAll('[role="combobox"]')).map(name)}`);
  act(() => { Simulate.click(select); });
  const opts = Array.from(document.querySelectorAll('[role="option"]'));
  const selected = opts.find(el => option.test(el.textContent ?? ''));
  assert.ok(selected, `Missing option ${option}: ${opts.map(el => el.textContent)}`);
  act(() => { Simulate.click(selected); });
}
function date(value: string): void {
  const field = root!.querySelector<HTMLInputElement>('input[name="inputDate"]'); assert.ok(field);
  assert.equal(field.disabled, false);
  act(() => { field.value = value; Simulate.change(field); });
}
function submit(): void { act(() => { Simulate.submit(root!.querySelector('form')!); }); }
function click(label: RegExp): void {
  const button = Array.from(root!.querySelectorAll('button')).find(el => label.test(el.textContent ?? '')); assert.ok(button, String(label));
  act(() => { Simulate.click(button); });
}
function ti(): void {
  choose(/Sitz der zuständigen Stelle/, /^Tessin/); choose(/Verfahrensrecht/, /^LPAmm/);
  choose(/Verfahrensstadium/, /^Verwaltungsbeschwerde/); choose(/Verfahrenshandlung/, /^Ordentliche Verwaltungsbeschwerde/);
  choose(/Fallkonstellation/, /^Allgemeines kantonales/);
}
function gr(): void {
  choose(/Sitz der zuständigen Stelle/, /^Graubünden/); choose(/Verfahrensrecht/, /^VRG/);
  choose(/Verfahrensstadium/, /^Gerichtsverfahren/); choose(/Verfahrenshandlung/, /^Ordentliche Beschwerde an das Gericht/);
  choose(/Fallkonstellation/, /^Allgemeines kantonales/);
  choose(/Gerichtliche Dringlichkeitsverfügung/, /^Keine ausdrückliche/);
}
afterEach(unmount);
after(() => { dom.window.close(); for (const [key, descriptor] of savedGlobals) descriptor ? Object.defineProperty(globalThis, key, descriptor) : Reflect.deleteProperty(globalThis, key); });

test('AP23D3 enters date before selecting a law and computes TI through the actual candidate', () => {
  mount(); date('02.10.2026'); ti(); submit();
  assert.match(root!.querySelector('.fr-result-region')!.textContent!, /02\.11\.2026/);
  assert.match(root!.textContent!, /Lokale Prüfrechnung/);
  assert.equal(Array.from(root!.querySelectorAll('button')).some(el => /Kalendereintrag erstellen/.test(el.textContent ?? '')), false);
  assert.match(root!.querySelector('.fr-data-status')!.textContent!, /2026-10-15-ap23d2-reference\.1/);
  assert.ok(root!.querySelector('.fr-trace a[href^="https://"]'));
  assert.equal(root!.querySelectorAll('.fr-form__grid').length, 1);
});
test('AP23D3 TI12 remains blocked with diagnostic trace and no export', () => {
  mount(); ti(); date('17.02.2027'); submit();
  const result = root!.querySelector('.fr-result-region')!.textContent!;
  assert.match(result, /Tessiner Grenzfall ist gesperrt/);
  assert.match(result, /19\.03\.2027/);
  assert.equal(root!.querySelector('.fr-result__hero'), null);
  assert.equal(root!.querySelector('.fr-calendar-export'), null);
});
test('AP23D3 current GR urgency changes calculation and always invalidates old result', () => {
  mount(); gr(); date('10.07.2027'); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /10\.09\.2027/);
  choose(/Gerichtliche Dringlichkeitsverfügung/, /^Ausdrücklich gerichtlich/);
  assert.equal(root!.querySelector('.fr-result'), null);
  submit(); assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /09\.08\.2027/);
  choose(/Verfahrensstadium/, /^Verwaltungsverfahren/);
  assert.equal(root!.querySelector('.fr-result'), null);
  // One real action is fixed, not a dropdown. Scope must be selected anew.
  assert.equal(Array.from(root!.querySelectorAll('[role="combobox"]')).some(el => /Verfahrenshandlung/.test(name(el))), false);
  submit(); assert.match(root!.querySelector('.fr-result-region')!.textContent!, /aktuelle Fallkonstellation/);
});
test('AP23D3 v5 saves stable procedure only, reload requires fresh case facts and reset preserves old key', () => {
  const original = JSON.stringify({ version:4,locale:'de',authorityCode:'BE',profileId:'stpo',deadlineDays:10,selectors:{deliveryMethod:'otherLegallyRelevantDate'} });
  mount(new Map([[OLD, original]])); gr(); date('10.07.2027'); click(/^Als Standard speichern$/);
  assert.equal(values.get(OLD), original);
  const saved = JSON.parse(values.get(NEW)!);
  assert.equal(saved.preferences.procedureSelection.lawId, 'vrg-gr');
  assert.equal(saved.preferences.deadlineDays, 30);
  assert.doesNotMatch(values.get(NEW)!, /inputDate|qualification|urgency|specialLawStatus|2027-07-10/);
  const same = values; unmount(); mount(same);
  assert.match(root!.textContent!, /VRG \(GR\)/); date('10.07.2027'); submit();
  assert.match(root!.querySelector('.fr-result-region')!.textContent!, /aktuelle Fallkonstellation/);
  assert.equal(root!.querySelector('.fr-result__hero'), null);
  click(/^Standards zurücksetzen$/); assert.deepEqual(JSON.parse(values.get(NEW)!), {version:5,state:'reset'});
  assert.equal(values.get(OLD), original);
  unmount(); mount(same);
  assert.equal(root!.querySelector<HTMLInputElement>('input[name="inputDate"]')!.value, '');
  assert.equal(JSON.parse(values.get(NEW)!).state, 'reset');
  assert.equal(Array.from(root!.querySelectorAll('[role="combobox"]')).find(el => /Verfahrensrecht/.test(name(el)))!.getAttribute('aria-disabled'), 'true');
});
test('AP23D3 canton/law switch and fresh reader identity discard old calculation', () => {
  mount(); ti(); date('02.10.2026'); submit(); assert.ok(root!.querySelector('.fr-result__hero'));
  choose(/Sitz der zuständigen Stelle/, /^Bern/); assert.equal(root!.querySelector('.fr-result'), null);
  assert.equal(Array.from(root!.querySelectorAll('[role="combobox"]')).some(el => /Fallkonstellation/.test(name(el))), false);
  ti(); submit(); assert.ok(root!.querySelector('.fr-result__hero'));
  app.freshContext(); act(() => { ReactDOM.render(app.element(storage), root); });
  assert.equal(root!.querySelector('.fr-result'), null);
  assert.equal(root!.querySelector<HTMLInputElement>('input[name="inputDate"]')!.value, '');
});
test('AP23D3 French rendering and law filtering retain honest local candidate scope', () => {
  mount(); choose(/Sprache/, /^Français/);
  choose(/Siège/, /^Tessin/); choose(/droit de procédure/i, /^LPAmm/);
  choose(/Stade de la procédure/, /^Recours administratif/); choose(/Acte de procédure/, /^Recours administratif ordinaire/);
  choose(/Situation du cas/, /^Procédure cantonale générale/); date('02.10.2026'); submit();
  assert.match(root!.textContent!, /Calcul de référence local/);
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!, /02\.11\.2026/);
  assert.doesNotMatch(root!.querySelector('.fr-result-region')!.textContent!, /validation\.|action\.|administrative\./);
});

test('AP23D3 shared reference host keeps ZPO and TI on one real format-8 release and blocks all exports without host flag', () => {
  mount(); ti(); date('02.10.2026'); submit();
  const status=root!.querySelector('.fr-data-status')!.textContent!;
  choose(/Verfahrensrecht/, /^Zivilprozessordnung/);
  choose(/Verfahrensart/, /^Ordentlich/); date('07.12.2026');
  const field=root!.querySelector<HTMLInputElement>('input[type="number"]')!;
  act(()=>{field.value='1';Simulate.change(field);}); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/09\.12\.2026/);
  assert.match(root!.querySelector('.fr-data-status')!.textContent!,/2026-10-15-ap23d2-reference\.1/);
  assert.match(status,/2026-10-15-ap23d2-reference\.1/);
  assert.doesNotMatch(root!.textContent!,/getrennten MVP-0.7/);
  assert.equal(root!.querySelector('.fr-calendar-export'),null);
});

test('AP23D3 shared reference host calculates actual AHVG from the same release and never offers export', () => {
  mount(); choose(/Sitz der zuständigen Stelle/,/^Bern/); choose(/Verfahrensrecht/,/^VRPG Bern/);
  choose(/Bereich/,/^Sozialversicherungsrecht/);
  choose(/Spezialerlass/,/AHVG/);
  choose(/Verfahrenshandlung/,/^Einsprache/);
  choose(/Kanton der für diesen Fall zuständigen kantonalen Ausgleichskasse/,/^BE$/);
  choose(/Wohnsitz.*Sitz von Partei und Vertretung/,/^Partei im Kanton Bern, ohne Vertretung$/);
  date('17.12.2026'); submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/01\.02\.2027/);
  assert.match(root!.querySelector('.fr-data-status')!.textContent!,/2026-10-15-ap23d2-reference\.1/);
  assert.equal(root!.querySelector('.fr-calendar-export'),null);
});

test('AP23D3 shared host exposes all eleven preserved social laws', () => {
  mount(); choose(/Sitz der zuständigen Stelle/,/^Bern/); choose(/Verfahrensrecht/,/^VRPG Bern/);
  choose(/Bereich/,/^Sozialversicherungsrecht/);
  const select=Array.from(root!.querySelectorAll('[role="combobox"]')).find(el=>/Spezialerlass/.test(name(el)))!;
  act(()=>{Simulate.click(select);});
  const options=Array.from(document.querySelectorAll('[role="option"]')).map(el=>el.textContent??'');
  for(const law of ['AHVG','IVG','UVG','ELG','AVIG','KVG','EOG','FamZG','FLG','MVG','ÜLG']) {
    assert.ok(options.some(text=>text.includes(law)),law+': '+options.join(', '));
  }
});

test('AP23D3 mismatched issued contexts immediately hide the old calculation and inputs', () => {
  mount(); ti(); date('02.10.2026'); submit(); assert.ok(root!.querySelector('.fr-result__hero'));
  act(()=>{ReactDOM.render(app.mismatchedElement(storage),root);});
  assert.equal(root!.querySelector('form'),null);
  assert.equal(root!.querySelector('.fr-result__hero'),null);
  assert.equal(root!.querySelector('.fr-calendar-export'),null);
  assert.match(root!.textContent!,/Keine Berechnung möglich/);
});

