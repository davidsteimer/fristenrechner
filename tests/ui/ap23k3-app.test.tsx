// SPDX-License-Identifier: AGPL-3.0-only
// Real React interactions with the authenticated local Format15 candidate.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {after,afterEach,test} from 'node:test';
import {buildSync} from 'esbuild';
import type * as ReactType from 'react';
import type * as TestUtilsType from 'react-dom/test-utils';
const require=createRequire(import.meta.url),{JSDOM}=require('jsdom');
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://ap23k3.invalid',pretendToBeVisual:true});
const savedGlobals=new Map<string,PropertyDescriptor|undefined>();
for(const key of['window','document','navigator','HTMLElement','Element','Node','Event','MouseEvent','MutationObserver','getComputedStyle','requestAnimationFrame','cancelAnimationFrame','MessageChannel']){
 savedGlobals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));const value=dom.window[key];
 Object.defineProperty(globalThis,key,{configurable:true,writable:true,value:['getComputedStyle','requestAnimationFrame','cancelAnimationFrame'].includes(key)?value.bind(dom.window):value});
}
dom.window.matchMedia=(query:string)=>({matches:false,media:query,onchange:null,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){},dispatchEvent:()=>false});
const ReactDOM=require('react-dom'),{act,Simulate}=require('react-dom/test-utils')as typeof TestUtilsType;
const bundle=buildSync({stdin:{contents:`
 import React from 'react';
 import {setIconOptions} from '@fluentui/react/lib/Styling';
 import {FristenrechnerApp} from './src/ui/FristenrechnerApp';
 import {createFormat15CalculationData} from './src/core/format15CalculationData';
 import {ap23k3ManifestText,ap23k3Files,ap23k3CandidateRuntime as runtime} from './src/release/ap23k3CandidateData';
 import {ap23j3CandidateRuntime as historical} from './src/release/ap23j3CandidateData';
 setIconOptions({disableWarnings:true});
 export const element=storage=>React.createElement(FristenrechnerApp,{...runtime,storage,localReviewLabel:'AP23K3 reference test'});
 export const historicalElement=storage=>React.createElement(FristenrechnerApp,{...historical,storage});
 export function mismatchedElement(storage){const other=createFormat15CalculationData(ap23k3ManifestText,ap23k3Files,{mode:'localReference'});
  return React.createElement(FristenrechnerApp,{...runtime,administrativeContext:other.administrativeContext,storage});}
`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,platform:'node',format:'cjs',write:false,external:['react','react-dom'],logLevel:'silent'});
const module={exports:{}};new Function('require','module','exports',bundle.outputFiles[0]!.text)(require,module,module.exports);
const app=module.exports as Record<'element'|'mismatchedElement'|'historicalElement',(storage:unknown)=>ReactType.ReactElement>;
let root:HTMLDivElement|undefined,values=new Map<string,string>();
function mount(seed=new Map<string,string>(),kind:'element'|'historicalElement'|'mismatchedElement'='element'){
 values=seed;const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);},removeItem:(key:string)=>{values.delete(key);}};
 root=document.createElement('div');document.body.append(root);act(()=>{ReactDOM.render(app[kind](storage),root);});
}
function unmount(){if(root){act(()=>{ReactDOM.unmountComponentAtNode(root!);});root.remove();root=undefined;}}
function name(e:Element){return e.getAttribute('aria-label')||(e.getAttribute('aria-labelledby')??'').split(' ').map(id=>document.getElementById(id)?.textContent??'').join(' ');}
function control(label:RegExp){return Array.from(root!.querySelectorAll('[role="combobox"]')).find(e=>label.test(name(e)));}
function choose(label:RegExp,option:RegExp){const select=control(label);assert.ok(select,`Missing control ${label}`);act(()=>Simulate.click(select));
 const options=Array.from(document.querySelectorAll('[role="option"]')),selected=options.find(e=>option.test(e.textContent??''));
 assert.ok(selected,`Missing option ${option}: ${options.map(e=>e.textContent).join('|')}`);act(()=>Simulate.click(selected));}
function date(value:string){const field=root!.querySelector<HTMLInputElement>('input[name="inputDate"]')!;assert.ok(field);assert.equal(field.disabled,false);
 act(()=>{field.value=value;Simulate.change(field);});}
function days(value:string){const field=root!.querySelector<HTMLInputElement>('input[type="number"]')!;assert.ok(field);act(()=>{field.value=value;Simulate.change(field);});}
function submit(){act(()=>Simulate.submit(root!.querySelector('form')!));}
function click(label:RegExp){const button=Array.from(root!.querySelectorAll('button')).find(e=>label.test(e.textContent??''));assert.ok(button,String(label));act(()=>Simulate.click(button));}
function law(canton:'BS'|'BL',stage:RegExp,action:RegExp){
 choose(/Sitz der zuständigen Stelle/,canton==='BS'?/^Basel-Stadt/:/^Basel-Landschaft/);
 choose(/Verfahrensrecht/,canton==='BS'?/^OG \/ VRPG BS/:/^VwVG \/ VPO BL/);
 if(control(/Verfahrensstadium/))choose(/Verfahrensstadium/,stage);
 if(control(/Verfahrenshandlung/))choose(/Verfahrenshandlung/,action);
}
const pause=()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,500));});
afterEach(async()=>{await pause();await pause();unmount();});
after(()=>{dom.window.close();for(const[key,value]of savedGlobals)value?Object.defineProperty(globalThis,key,value):Reflect.deleteProperty(globalThis,key);});

test('K3 early date, static seat label and two-column form survive BS qualified anchor changes',async()=>{
 mount();date('28.11.2026');law('BS',/^Gerichtsverfahren$/,/^Rekurs beim Verwaltungsgericht anmelden/);
 assert.equal(root!.querySelector<HTMLInputElement>('input[name="inputDate"]')!.value,'28.11.2026');
 assert.match(name(control(/Sitz der zuständigen Stelle/)! ),/^Sitz der zuständigen Stelle /);
 choose(/Fallkonstellation/,/^Zulässiger allgemeiner Rechtsmittelweg/);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
 choose(/Wohnsitz \/ Sitz der Partei oder/,/^Tessin/);submit();assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/09\.12\.2026/);
 assert.match(root!.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!,/TI/);
 choose(/Wohnsitz \/ Sitz der Partei oder/,/^Basel-Stadt/);assert.equal(root!.querySelector('.fr-result__hero'),null);submit();
 assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/08\.12\.2026/);
 assert.equal(root!.querySelectorAll('.fr-form__grid').length,1);assert.equal(root!.querySelector('.fr-calendar-export'),null);
 assert.doesNotMatch(root!.querySelector('form')!.textContent!,/Fristauslösendes Dokument|Massgeblicher Feiertagskanton|Zustellung an|regionalOfficeMode/);
 await pause();assert.match(root!.textContent!,/AP23K3: lokale Integrationsprüfung/);
});
test('K3 BS AI and NE need a real regional fact and switching canton or path clears stale choices',async()=>{
 mount();law('BS',/^Gerichtsverfahren$/,/^Rekurs beim Verwaltungsgericht anmelden/);date('02.10.2026');
 choose(/Fallkonstellation/,/^Zulässiger allgemeiner Rechtsmittelweg/);
 choose(/Wohnsitz \/ Sitz der Partei oder/,/^Appenzell Innerrhoden/);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
 choose(/Massgebender Wohnsitz \/ Sitz im Inneren Land/,/^Nein$/);submit();assert.ok(root!.querySelector('.fr-result__hero'));
 choose(/Wohnsitz \/ Sitz der Partei oder/,/^Neuenburg/);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
 assert.ok(control(/Gemeinde Le Landeron/));choose(/Gemeinde Le Landeron/,/^Ja$/);submit();assert.ok(root!.querySelector('.fr-result__hero'));
 choose(/Verfahrenshandlung/,/^Rekurs beim Verwaltungsgericht begründen/);assert.equal(root!.querySelector('.fr-result__hero'),null);submit();
 assert.equal(root!.querySelector('.fr-result__hero'),null);assert.equal(control(/Gemeinde Le Landeron/),undefined);
 assert.match(name(control(/Wohnsitz \/ Sitz der Partei oder/)! ),/Wohnsitz/);
});
test('K3 BL automatic closures block differing carnival branches without an override field',async()=>{
 mount();law('BL',/^Verwaltungsbeschwerde$/,/^Allgemeine Verwaltungsbeschwerde/);date('30.01.2027');
 choose(/Fallkonstellation/,/^Zulässiger allgemeiner Rechtsmittelweg/);submit();
 assert.equal(root!.querySelector('.fr-result__hero'),null);assert.equal(root!.querySelector('.fr-calendar-export'),null);
 assert.match(root!.querySelector('.fr-result__messages')!.textContent!,/Fasnachts-Schliesstag/);
 assert.match(root!.querySelector('[data-testid="administrative-office-comparison"]')!.textContent!,/09\.02\.2027.*10\.02\.2027/);
 assert.equal(control(/Wohnsitz/),undefined);assert.equal(control(/Büroschliess|Fasnacht/),undefined);
 date('14.12.2026');submit();assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/04\.01\.2027/);
 assert.match(root!.querySelector('[data-testid="administrative-office-closure-trace"]')!.textContent!,/24\.12\.2026/);
});
test('K3 BL five-day objection requires an explicit closed category',async()=>{
 mount();law('BL',/^Gerichtsverfahren$/,/^Einsprache gegen qualifizierte Präsidialverfügung/);date('02.10.2026');
 choose(/Fallkonstellation/,/^Einsprache nach § 7 Abs\. 2 VPO/);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
 choose(/Gegenstand der Präsidialverfügung/,/^Zuständigkeit$/);submit();assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/07\.10\.2026/);
 choose(/Gegenstand der Präsidialverfügung/,/^Unklar oder abweichend$/);assert.equal(root!.querySelector('.fr-result__hero'),null);submit();
 assert.equal(root!.querySelector('.fr-result__hero'),null);
});
test('K3 BL current granted reasons keeps stable selection but reloading never confirms a grant',async()=>{
 mount();law('BL',/^Verwaltungsbeschwerde$/,/^Tatsächlich gewährte nachträgliche/);date('02.10.2026');days('15');
 choose(/Fallkonstellation/,/^Nachträgliche Begründungsfrist tatsächlich gewährt/);submit();assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/19\.10\.2026/);
 click(/^Als Standard speichern$/);const saved=values.get('fristenrechner.defaults.v5')!;
 assert.match(saved,/bl-admin-reasons-granted/);assert.doesNotMatch(saved,/grantedReasonsOrder|inputDate|caseQualification|legalAnchor|areaFacts/);
 const seed=new Map(values);await pause();unmount();mount(seed);assert.equal(root!.querySelector<HTMLInputElement>('input[name="inputDate"]')!.value,'');
 assert.equal(root!.querySelector('.fr-result__hero'),null);assert.ok(control(/Fallkonstellation/));date('02.10.2026');submit();
 assert.equal(root!.querySelector('.fr-result__hero'),null);
});
test('K3 unknown new defaults are protected in historical Format14 and mismatched contexts fail closed',async()=>{
 mount();law('BS',/^Gerichtsverfahren$/,/^Rekurs beim Verwaltungsgericht anmelden/);date('02.10.2026');
 choose(/Fallkonstellation/,/^Zulässiger allgemeiner Rechtsmittelweg/);choose(/Wohnsitz \/ Sitz der Partei oder/,/^Tessin/);submit();click(/^Als Standard speichern$/);
 const seed=new Map(values),bytes=values.get('fristenrechner.defaults.v5');await pause();unmount();mount(seed,'historicalElement');await pause();
 assert.match(root!.textContent!,/unverändert geschützt/);click(/^Standards zurücksetzen$/);assert.equal(values.get('fristenrechner.defaults.v5'),bytes);
 await pause();unmount();mount(seed,'mismatchedElement');assert.match(root!.textContent!,/nicht zu demselben geprüften Release/);assert.equal(root!.querySelector('form'),null);
});
