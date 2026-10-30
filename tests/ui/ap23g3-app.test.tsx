// SPDX-License-Identifier: AGPL-3.0-only
// Real application interactions with native Format-11 data, no substituted hooks.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { after, afterEach, test } from 'node:test';
import { buildSync } from 'esbuild';
import type * as ReactType from 'react';
import type * as TestUtilsType from 'react-dom/test-utils';
const require=createRequire(import.meta.url),{JSDOM}=require('jsdom');
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://ap23g3.invalid',pretendToBeVisual:true});
const savedGlobals=new Map<string,PropertyDescriptor|undefined>();
for(const key of['window','document','navigator','HTMLElement','Element','Node','Event','MouseEvent','MutationObserver','getComputedStyle','requestAnimationFrame','cancelAnimationFrame','MessageChannel']){
  savedGlobals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));const value=dom.window[key];
  Object.defineProperty(globalThis,key,{configurable:true,writable:true,value:['getComputedStyle','requestAnimationFrame','cancelAnimationFrame'].includes(key)?value.bind(dom.window):value});
}
dom.window.matchMedia=(query:string)=>({matches:false,media:query,onchange:null,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){},dispatchEvent:()=>false});
const ReactDOM=require('react-dom'),{act,Simulate}=require('react-dom/test-utils') as typeof TestUtilsType;
const bundle=buildSync({stdin:{contents:`
  import React from 'react';
  import {setIconOptions} from '@fluentui/react/lib/Styling';
  import {FristenrechnerApp} from './src/ui/FristenrechnerApp';
  import {createFormat11CalculationData} from './src/core/format11CalculationData';
  import {createFormat10CalculationData} from './src/core/format10CalculationData';
  import {ap23g3ManifestText,ap23g3Files,ap23g3CandidateRuntime as runtime} from './src/release/ap23g3CandidateData';
  import {ap23f3ManifestText,ap23f3Files} from './src/release/ap23f3CandidateData';
  setIconOptions({disableWarnings:true});
  export const element=storage=>React.createElement(FristenrechnerApp,{...runtime,storage,localReviewLabel:'AP23G3 reference test'});
  export function mismatchedElement(storage){const other=createFormat11CalculationData(ap23g3ManifestText,ap23g3Files,{mode:'localReference'});
    return React.createElement(FristenrechnerApp,{...runtime,administrativeContext:other.administrativeContext,storage});}
  export function historicalElement(storage){const old=createFormat10CalculationData(ap23f3ManifestText,ap23f3Files,{mode:'localReference'});
    return React.createElement(FristenrechnerApp,{...old,storage});}
`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,platform:'node',format:'cjs',write:false,external:['react','react-dom'],logLevel:'silent'});
const module={exports:{}};new Function('require','module','exports',bundle.outputFiles[0]!.text)(require,module,module.exports);
const app=module.exports as Record<'element'|'mismatchedElement'|'historicalElement',(storage:unknown)=>ReactType.ReactElement>;
let root:HTMLDivElement|undefined,values=new Map<string,string>();
function mount(seed=new Map<string,string>(),kind:'element'|'mismatchedElement'|'historicalElement'='element'){
  values=seed;const storage={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);},removeItem:(k:string)=>{values.delete(k);}};
  root=document.createElement('div');document.body.append(root);act(()=>{ReactDOM.render(app[kind](storage),root);});
}
function unmount(){if(root){act(()=>{ReactDOM.unmountComponentAtNode(root);});root.remove();root=undefined;}}
function accessibleName(e:Element){return e.getAttribute('aria-label')||(e.getAttribute('aria-labelledby')??'').split(' ').map(id=>document.getElementById(id)?.textContent??'').join(' ');}
function choose(label:RegExp,option:RegExp){const select=Array.from(root!.querySelectorAll('[role="combobox"]')).find(e=>label.test(accessibleName(e)));
  assert.ok(select,`Missing control ${label}`);act(()=>{Simulate.click(select);});const options=Array.from(document.querySelectorAll('[role="option"]'));
  const selected=options.find(e=>option.test(e.textContent??''));assert.ok(selected,`Missing option ${option}: ${options.map(e=>e.textContent).join('|')}`);act(()=>{Simulate.click(selected);});}
function date(value:string){const field=root!.querySelector<HTMLInputElement>('input[name="inputDate"]')!;assert.ok(field);assert.equal(field.disabled,false);
  act(()=>{field.value=value;Simulate.change(field);});}
function submit(){act(()=>{Simulate.submit(root!.querySelector('form')!);});}
function click(label:RegExp){const button=Array.from(root!.querySelectorAll('button')).find(e=>label.test(e.textContent??''));assert.ok(button,String(label));act(()=>{Simulate.click(button);});}
function ur(stage:RegExp=/^Verwaltungsverfahren$/,action=/^Ordentliche Verwaltungsbeschwerde$/){
  choose(/Sitz der zuständigen Stelle/,/^Uri/);choose(/Verfahrensrecht/,/^VRPV UR/);choose(/Verfahrensstadium/,stage);choose(/Verfahrenshandlung/,action);
}
const pause=()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,250));});
afterEach(async()=>{await pause();unmount();});
after(()=>{dom.window.close();for(const[k,v]of savedGlobals)v?Object.defineProperty(globalThis,k,v):Reflect.deleteProperty(globalThis,k);});

test('G3 real app keeps early date and two-column controls, and presents an Urner Art22 notice without changing the result',async()=>{
  mount();date('23.12.2026');ur();choose(/Fallkonstellation/,/^Ursprünglich begründeter Entscheid/);submit();
  await pause();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/12\.01\.2027/);
  assert.match(root!.textContent!,/AP23G3: lokale Integrationsprüfung/);assert.match(root!.textContent!,/Art\. 22 VRPV UR/);
  assert.equal(root!.querySelectorAll('.fr-form__grid').length,1);assert.equal(root!.querySelector('.fr-calendar-export'),null);
  assert.doesNotMatch(root!.textContent!,/Fristauslösendes Dokument|Massgeblicher Feiertagskanton|Eröffnungsherkunft/);
});
test('G3 one current-case selector distinguishes original and timely-requested later reasons without extra document controls',async()=>{
  mount();date('02.10.2026');ur();submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
  await pause();
  choose(/Fallkonstellation/,/^Vollständige spätere Begründung nach nachweislich rechtzeitigem Verlangen/);submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/22\.10\.2026/);
  await pause();
  const before=root!.querySelectorAll('[role="combobox"]').length;
  choose(/Fallkonstellation/,/^Ursprünglich begründeter Entscheid/);assert.equal(root!.querySelector('.fr-result__hero'),null);submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/22\.10\.2026/);assert.equal(root!.querySelectorAll('[role="combobox"]').length,before);
});
test('G3 switching from a full appeal to a reasons request clears current facts and uses its own statutory duration',async()=>{
  mount();date('02.10.2026');ur();choose(/Fallkonstellation/,/^Vollständige spätere Begründung/);submit();
  await pause();
  choose(/Verfahrenshandlung/,/^Begründung einer Verwaltungsverfügung verlangen/);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
  await pause();
  choose(/Fallkonstellation/,/^Zulässig unbegründete Verfügung/);submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/12\.10\.2026/);assert.match(root!.textContent!,/10/);
  assert.equal(root!.querySelector('input[type="number"]'),null);assert.equal(root!.querySelector('.fr-calendar-export'),null);
});
test('G3 Schaffhausen court reasons request clearly names the same Obergericht and thirty days',()=>{
  mount();date('02.10.2026');choose(/Sitz der zuständigen Stelle/,/^Schaffhausen/);choose(/Verfahrensrecht/,/^VRG SH/);
  choose(/Verfahrensstadium/,/^Gerichtsverfahren/);choose(/Verfahrenshandlung/,/^Begründung beim selben Obergericht verlangen/);
  choose(/Fallkonstellation/,/^Dispositiv oder massgebende mündliche Eröffnung/);submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/02\.11\.2026/);assert.match(root!.textContent!,/30 Tage/);
  assert.doesNotMatch(root!.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!,/case\.v4|scope\.v4|SRC-|JUD-/);
});
test('G3 V5 reload keeps only stable new path preferences and requires a new explicit current-case choice',async()=>{
  mount();date('02.10.2026');ur();choose(/Fallkonstellation/,/^Vollständige spätere Begründung/);submit();click(/^Als Standard speichern$/);
  const text=values.get('fristenrechner.defaults.v5')!;assert.equal(JSON.parse(text).preferences.procedureSelection.pathId,'ur-admin-20');
  assert.doesNotMatch(text,/openingOrigin|priorReasonsRequest|qualification|coordinatedDecision|localHolidayEffect|2026-10-02/);
  await pause();const seed=values;unmount();mount(seed);assert.equal(root!.querySelector<HTMLInputElement>('input[name="inputDate"]')!.value,'');
  assert.equal(root!.querySelector('.fr-result__hero'),null);date('02.10.2026');submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
  await pause();
  choose(/Fallkonstellation/,/^Ursprünglich begründeter Entscheid/);submit();assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/22\.10\.2026/);
});
test('G3 new preferences are protected on native Format10 rollback and never silently assigned another path',async()=>{
  mount();ur();click(/^Als Standard speichern$/);await pause();const seed=values,original=seed.get('fristenrechner.defaults.v5');
  unmount();mount(seed,'historicalElement');await pause();assert.match(root!.textContent!,/gespeicherten Standards.*nicht verwendbar/);
  assert.equal(values.get('fristenrechner.defaults.v5'),original);assert.equal(root!.querySelector('.fr-result__hero'),null);
});
test('G3 French new laws, action and current reasons wording contain no raw translation keys',()=>{
  mount();choose(/Sprache/,/^Français$/);date('02.10.2026');choose(/Siège de l’instance compétente/,/^Soleure/);
  choose(/droit de procédure/i,/^VRG SO/);choose(/Stade de la procédure/,/^Procédure administrative/);
  choose(/Acte de procédure/,/^Demander la motivation proposée/);choose(/Situation du cas/,/^Décision non motivée offrant expressément/);submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/12\.10\.2026/);
  assert.doesNotMatch(root!.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!,/scope\.|case\.|action\.|SRC-|JUD-/);
  assert.match(root!.textContent!,/AP23G3/);assert.equal(root!.querySelector('.fr-calendar-export'),null);
});
test('G3 mismatched Format11 identities reject before rendering any interactive form',()=>{
  mount(new Map(),'mismatchedElement');assert.equal(root!.querySelector('form'),null);
  assert.match(root!.textContent!,/Datenkontexte gehören nicht zu demselben geprüften Release/);
});
