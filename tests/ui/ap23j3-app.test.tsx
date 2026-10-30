// SPDX-License-Identifier: AGPL-3.0-only
// Real React interactions, current case state and authentic Format-14 identities.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {after,afterEach,test} from 'node:test';
import {buildSync} from 'esbuild';
import type * as ReactType from 'react';
import type * as TestUtilsType from 'react-dom/test-utils';
const require=createRequire(import.meta.url),{JSDOM}=require('jsdom');
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://ap23j3.invalid',pretendToBeVisual:true});
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
 import {createFormat14CalculationData} from './src/core/format14CalculationData';
 import {emptyAdministrativePreferences,sanitizeAdministrativePreferences} from './src/ui/administrativeDefaults';
 import {ap23j3ManifestText,ap23j3Files,ap23j3CandidateRuntime as runtime} from './src/release/ap23j3CandidateData';
 import {ap23i3CandidateRuntime as historical} from './src/release/ap23i3CandidateData';
 setIconOptions({disableWarnings:true});
 export const element=storage=>React.createElement(FristenrechnerApp,{...runtime,storage,localReviewLabel:'AP23J3 reference test'});
 export const historicalElement=storage=>React.createElement(FristenrechnerApp,{...historical,storage});
 export function mismatchedElement(storage){const other=createFormat14CalculationData(ap23j3ManifestText,ap23j3Files,{mode:'localReference'});
  return React.createElement(FristenrechnerApp,{...runtime,administrativeContext:other.administrativeContext,storage});}
 export function seed(days){return JSON.stringify({version:5,state:'preferences',preferences:sanitizeAdministrativePreferences(
  {legacyData:runtime.data,administrativeData:runtime.administrativeContext},
  {...emptyAdministrativePreferences(),authorityCode:'GL',deadlineDays:days,deliveryMethod:'direct',procedureSelection:{kind:'legacyProfile',profileId:'stpo'}})});}
`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,platform:'node',format:'cjs',write:false,external:['react','react-dom'],logLevel:'silent'});
const module={exports:{}};new Function('require','module','exports',bundle.outputFiles[0]!.text)(require,module,module.exports);
const app=module.exports as Record<'element'|'mismatchedElement'|'historicalElement',(storage:unknown)=>ReactType.ReactElement>&{seed(days:number):string};
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
function law(canton:'FR'|'GE'|'JU',stage:RegExp,action:RegExp){
 const names={FR:/^Freiburg/,GE:/^Genf/,JU:/^Jura/},laws={FR:/^CPJA FR/,GE:/^LPA GE/,JU:/^CPA JU/};
 choose(/Sitz der zuständigen Stelle/,names[canton]);choose(/Verfahrensrecht/,laws[canton]);
 if(control(/Verfahrensstadium/))choose(/Verfahrensstadium/,stage);
 if(control(/Verfahrenshandlung/))choose(/Verfahrenshandlung/,action);
}
const pause=()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,500));});
afterEach(async()=>{await pause();unmount();});
after(()=>{dom.window.close();for(const[key,value]of savedGlobals)value?Object.defineProperty(globalThis,key,value):Reflect.deleteProperty(globalThis,key);});

test('J3 early date is editable before law and GE opening choice is mandatory without a default',async()=>{
 mount();date('05.09.2026');law('GE',/^Verwaltungsbeschwerde$/,/^Beschwerde gegen End- oder Zuständigkeitsentscheid/);
 assert.equal(root!.querySelector<HTMLInputElement>('input[name="inputDate"]')!.value,'05.09.2026');
 choose(/Fallkonstellation/,/^Zulässiger allgemeiner Verfahrensweg/);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
 choose(/Eröffnung und Empfang/,/^Rechtlich massgebender Eröffnungstag steht fest$/);submit();
 assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/05\.10\.2026/);
 choose(/Eröffnung und Empfang/,/^Tatsächlicher Empfang gewöhnlicher Post$/);assert.equal(root!.querySelector('.fr-result__hero'),null);submit();
 assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/07\.10\.2026/);
 assert.match(root!.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!,/07\.09\.2026/);
 assert.equal(root!.querySelectorAll('.fr-form__grid').length,1);assert.equal(root!.querySelector('.fr-calendar-export'),null);
 assert.doesNotMatch(root!.textContent!,/Fristauslösendes Dokument|Massgeblicher Feiertagskanton|Zielgericht wählen|v7\./);
 choose(/Eröffnung und Empfang/,/^Unklar oder abweichend$/);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
 await pause();
 assert.match(root!.textContent!,/AP23J3: lokale Integrationsprüfung/);
});
test('J3 changing GE path or stage clears current opening facts and existing results',async()=>{
 mount();law('GE',/^Verwaltungsbeschwerde$/,/^Beschwerde gegen End- oder Zuständigkeitsentscheid/);
 date('05.09.2026');choose(/Fallkonstellation/,/^Zulässiger allgemeiner Verfahrensweg/);
 choose(/Eröffnung und Empfang/,/^Tatsächlicher Empfang gewöhnlicher Post$/);submit();assert.ok(root!.querySelector('.fr-result__hero'));
 choose(/Verfahrenshandlung/,/^Beschwerde gegen anderen selbstständig anfechtbaren Entscheid/);submit();
 assert.equal(root!.querySelector('.fr-result__hero'),null);assert.ok(control(/Eröffnung und Empfang/));
 choose(/Fallkonstellation/,/^Zulässiger allgemeiner Verfahrensweg/);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
 choose(/Eröffnung und Empfang/,/^Rechtlich massgebender Eröffnungstag steht fest$/);submit();assert.ok(root!.querySelector('.fr-result__hero'));
 choose(/Verfahrensstadium/,/^Verwaltungsverfahren$/);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
});
test('J3 GE standards restore stable path only and old13 protects the same preference slot',async()=>{
 mount();law('GE',/^Verwaltungsbeschwerde$/,/^Beschwerde gegen End- oder Zuständigkeitsentscheid/);
 date('05.09.2026');choose(/Fallkonstellation/,/^Zulässiger allgemeiner Verfahrensweg/);choose(/Eröffnung und Empfang/,/^Tatsächlicher Empfang gewöhnlicher Post$/);submit();
 click(/^Als Standard speichern$/);const saved=values.get('fristenrechner.defaults.v5')!;
 assert.doesNotMatch(saved,/openingMode|ordinaryPostPhysicalReceipt|currentValues|caseQualification|inputDate|2026-09-05/);
 assert.equal(JSON.parse(saved).preferences.procedureSelection.pathId,'ge-recours-30');
 await pause();const seed=values;unmount();mount(seed);
 assert.equal(root!.querySelector<HTMLInputElement>('input[name="inputDate"]')!.value,'');assert.equal(root!.querySelector('.fr-result__hero'),null);
 assert.ok(control(/Eröffnung und Empfang/));date('05.09.2026');submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
 choose(/Fallkonstellation/,/^Zulässiger allgemeiner Verfahrensweg/);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
 await pause();unmount();mount(seed,'historicalElement');await pause();assert.match(root!.textContent!,/bleiben unverändert geschützt/);
 assert.equal(values.get('fristenrechner.defaults.v5'),saved);
});
test('J3 FR real reclamation basis is the only extra choice and TC summer pause is automatic',async()=>{
 mount();date('14.07.2027');law('FR',/^Gerichtsverfahren$/,/^Angeordnete Eingabe an das Kantonsgericht$/);
 days('1');choose(/Fallkonstellation/,/^Aktuelle Tagesanordnung/);submit();assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/16\.08\.2027/);
 assert.equal(control(/Grundlage der Reklamation/),undefined);assert.equal(control(/Eröffnung und Empfang/),undefined);
 choose(/Verfahrensstadium/,/^Verwaltungsbeschwerde$/);choose(/Verfahrenshandlung/,/^Gesetzlich eröffnete Reklamation/);date('02.10.2026');
 choose(/Fallkonstellation/,/^Gesetzlich eröffnete Reklamation/);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
 choose(/Grundlage der Reklamation/,/^Nur Kosten nach Art\. 148 CPJA$/);submit();assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/02\.11\.2026/);
});
test('J3 JU oral own request has fixed duration and no invented later event or export',async()=>{
 mount();date('17.12.2026');law('JU',/^Verwaltungsverfahren$/,/^Schriftliche Bestätigung mündlicher Eröffnung verlangen/);
 assert.equal(root!.querySelector('input[type="number"]'),null);
 choose(/Fallkonstellation/,/^Tatsächliche zulässige mündliche Eröffnung/);submit();assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/22\.12\.2026/);
 assert.match(root!.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!,/Berechnet wird nur dieses Verlangen/);
 assert.equal(root!.querySelector('.fr-calendar-export'),null);assert.equal(control(/Eröffnung und Empfang/),undefined);
});
test('J3 mismatched authentic Format14 contexts block the entire page and exports',()=>{
 mount(new Map(),'mismatchedElement');assert.equal(root!.querySelector('form'),null);
 assert.match(root!.textContent!,/Datenkontexte gehören nicht/);assert.equal(root!.querySelector('.fr-calendar-export'),null);
});

