// SPDX-License-Identifier: AGPL-3.0-only
// Real React interactions, actual native17/9 data and no hook/result replacement.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { after, afterEach, test } from 'node:test';
import { buildSync } from 'esbuild';
import type * as ReactType from 'react';
import type * as TestUtilsType from 'react-dom/test-utils';
const require = createRequire(import.meta.url), { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://r10-u1-social.invalid', pretendToBeVisual: true });
const globals = new Map<string,PropertyDescriptor|undefined>();
for (const key of ['window','document','navigator','HTMLElement','Element','Node','Event','MouseEvent','MutationObserver','getComputedStyle','requestAnimationFrame','cancelAnimationFrame','MessageChannel']) {
  globals.set(key,Object.getOwnPropertyDescriptor(globalThis,key)); const value = dom.window[key];
  Object.defineProperty(globalThis,key,{ configurable:true,writable:true,value:['getComputedStyle','requestAnimationFrame','cancelAnimationFrame'].includes(key) ? value.bind(dom.window) : value });
}
dom.window.matchMedia = (query:string) => ({ matches:false,media:query,onchange:null,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){},dispatchEvent:()=>false });
const ReactDOM = require('react-dom'), { act, Simulate } = require('react-dom/test-utils') as typeof TestUtilsType;
const bundle = buildSync({ stdin: { contents: `
  import React from 'react';
  import {setIconOptions} from '@fluentui/react/lib/Styling';
  import {FristenrechnerApp} from './src/ui/FristenrechnerApp';
  import {ap23m3CandidateRuntime} from './src/release/ap23m3CandidateData';
  import {mvp09Runtime} from './src/release/mvp09ReleaseData';
  setIconOptions({disableWarnings:true});
  export const element=(storage,kind,initialState)=>React.createElement(FristenrechnerApp,{
    ...(kind==='prior'?mvp09Runtime:ap23m3CandidateRuntime),storage,initialState
  });`, resolveDir:process.cwd(),loader:'tsx' }, bundle:true,platform:'node',format:'cjs',write:false,
  external:['react','react-dom'],logLevel:'silent' });
const module = { exports:{} }; new Function('require','module','exports',bundle.outputFiles[0]!.text)(require,module,module.exports);
const app = module.exports as { element(storage:unknown,kind:string,initialState?:unknown):ReactType.ReactElement };
let root:HTMLDivElement|undefined, values = new Map<string,string>();
function mount(seed = new Map<string,string>(),kind='actual',initialize=true) {
  values=seed; const storage = { getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);},removeItem:(key:string)=>{values.delete(key);} };
  root=document.createElement('div');document.body.append(root);
  act(()=>{ReactDOM.render(app.element(storage,kind,initialize?{authorityCode:'BE',profileId:'vrpg-be',
    vrpgSelection:{area:'social',law:'elg',action:'objection',stage:''}}:undefined),root);});
}
function unmount() { if(root){act(()=>{ReactDOM.unmountComponentAtNode(root!);});root.remove();root=undefined;} }
function accessibleName(element:Element) { return element.getAttribute('aria-label') || (element.getAttribute('aria-labelledby')??'').split(' ').map(id=>document.getElementById(id)?.textContent??'').join(' '); }
function control(label:RegExp) { return Array.from(root!.querySelectorAll('[role="combobox"]')).find(element=>label.test(accessibleName(element))); }
function choose(label:RegExp,option:RegExp) {
  const field=control(label);assert.ok(field,`Missing real control ${label}`);act(()=>{Simulate.click(field);});
  const options=Array.from(document.querySelectorAll('[role="option"]')), selected=options.find(element=>option.test(element.textContent??''));
  assert.ok(selected,`Missing real option ${option}: ${options.map(element=>element.textContent).join('|')}`);act(()=>{Simulate.click(selected);});
}
function date(value:string) { const field=root!.querySelector<HTMLInputElement>('input[name="inputDate"]')!;assert.ok(field);assert.equal(field.disabled,false);
  act(()=>{field.value=value;Simulate.change(field);Simulate.blur(field);}); }
function submit() { act(()=>{Simulate.submit(root!.querySelector('form')!);}); }
function click(label:RegExp) { const button=Array.from(root!.querySelectorAll('button')).find(element=>label.test(element.textContent??''));assert.ok(button,String(label));act(()=>{Simulate.click(button);}); }
function positive() { choose(/^Für diesen Verwaltungsfall zuständiger Kanton/,/^BE$/);choose(/Wohnsitz \/ Sitz von Partei und Vertretung/,/^(?:Partei|Nur Partei).*Bern/);date('16.09.2026');submit(); }
const pause=()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,500));});
afterEach(async()=>{await pause();unmount();});
after(()=>{dom.window.close();for(const[key,descriptor]of globals)descriptor?Object.defineProperty(globalThis,key,descriptor):Reflect.deleteProperty(globalThis,key);});

test('R10-U1 real native17 ELG requires current facts and suppresses export of its reference calculation', () => {
  mount();date('16.09.2026');submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
  assert.equal(control(/^Für diesen Verwaltungsfall zuständiger Kanton/)?.textContent?.includes('Bitte wählen'),true);
  positive();assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/16\.10\.2026/);
  assert.equal(root!.querySelector('.fr-calendar-export'),null,'Local-reference host cannot export even existing approved social rules');
  choose(/^Für diesen Verwaltungsfall zuständiger Kanton/,/^ZH$/);assert.equal(root!.querySelector('.fr-result__hero'),null);
  submit();assert.equal(root!.querySelector('.fr-result__hero'),null);assert.equal(root!.querySelector('.fr-calendar-export'),null);
});
test('R10-U1 real native17 V5 save and reload keeps ELG selection, never receipt, reference or current qualification', async () => {
  mount();positive();assert.ok(root!.querySelector('.fr-result__hero'));click(/^Als Standard speichern$/);
  const raw=values.get('fristenrechner.defaults.v5')!;assert.match(raw,/"law":"elg"/);
  assert.doesNotMatch(raw,/inputDate|socialContext|jurisdictionCanton|holidayConnections|jurisdictionReferenceDate|2026-09-16/);
  const saved=new Map(values);await pause();unmount();mount(saved,'actual',false);
  assert.equal(root!.querySelector<HTMLInputElement>('input[name="inputDate"]')!.value,'');
  assert.match(control(/^Spezialerlass/)!.textContent!,/Ergänzungsleistungen/);
  assert.match(control(/^Für diesen Verwaltungsfall zuständiger Kanton/)!.textContent!,/Bitte wählen/);
  assert.equal(root!.querySelector('.fr-result__hero'),null);assert.equal(root!.querySelector('.fr-calendar-export'),null);
  date('16.09.2026');submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
});
test('R10-U1 real approved Format9 ELG stays exportable and changing holidays immediately removes result and export', () => {
  mount(new Map(),'prior');positive();assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/16\.10\.2026/);
  assert.ok(root!.querySelector('.fr-calendar-export'));
  choose(/Wohnsitz \/ Sitz von Partei und Vertretung/,/^Bitte wählen$/);assert.equal(root!.querySelector('.fr-result__hero'),null);
  assert.equal(root!.querySelector('.fr-calendar-export'),null);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
});
