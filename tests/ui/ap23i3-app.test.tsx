// SPDX-License-Identifier: AGPL-3.0-only
// Real React interactions, current case state and authentic Format-13 identities.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {after,afterEach,test} from 'node:test';
import {buildSync} from 'esbuild';
import type * as ReactType from 'react';
import type * as TestUtilsType from 'react-dom/test-utils';
const require=createRequire(import.meta.url),{JSDOM}=require('jsdom');
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://ap23i3.invalid',pretendToBeVisual:true});
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
 import {createFormat13CalculationData} from './src/core/format13CalculationData';
 import {emptyAdministrativePreferences,sanitizeAdministrativePreferences} from './src/ui/administrativeDefaults';
 import {ap23i3ManifestText,ap23i3Files,ap23i3CandidateRuntime as runtime} from './src/release/ap23i3CandidateData';
 import {ap23h3CandidateRuntime as historical} from './src/release/ap23h3CandidateData';
 setIconOptions({disableWarnings:true});
 export const element=storage=>React.createElement(FristenrechnerApp,{...runtime,storage,localReviewLabel:'AP23I3 reference test'});
 export const historicalElement=storage=>React.createElement(FristenrechnerApp,{...historical,storage});
 export function mismatchedElement(storage){const other=createFormat13CalculationData(ap23i3ManifestText,ap23i3Files,{mode:'localReference'});
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
function unmount(){if(root){act(()=>ReactDOM.unmountComponentAtNode(root!));root.remove();root=undefined;}}
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
function law(canton:'GL'|'TG',stage:RegExp,action:RegExp){
 choose(/Sitz der zuständigen Stelle/,canton==='GL'?/^Glarus/:/^Thurgau/);choose(/Verfahrensrecht/,canton==='GL'?/^VRG GL$/:/^VRG TG$/);
 choose(/Verfahrensstadium/,stage);
 if(control(/Verfahrenshandlung/))choose(/Verfahrenshandlung/,action);
}
const pause=()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,200));});
afterEach(async()=>{await pause();unmount();});
after(()=>{dom.window.close();for(const[key,value]of savedGlobals)value?Object.defineProperty(globalThis,key,value):Reflect.deleteProperty(globalThis,key);});

test('I3 early date stays editable and GL concretised seven days are a fresh legal duration, not a persisted default',async()=>{
 mount();date('02.10.2026');law('GL',/^Verwaltungsbeschwerde$/, /^Endentscheid mit konkret verkürzter gesetzlicher Frist$/);
 const input=root!.querySelector<HTMLInputElement>('input[type="number"]')!;assert.ok(input);assert.equal(input.value,'');assert.equal(input.min,'2');assert.equal(input.max,'29');
 assert.match(root!.textContent!,/Konkret verkürzte gesetzliche Frist in Tagen/);assert.match(root!.textContent!,/2–29/);
 days('7');choose(/Fallkonstellation/,/^Qualifizierte schriftliche Eröffnung, neues Instanzrecht, konkrete gültige Verkürzung, keine Stillstandsausnahme$/);submit();
 assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/09\.10\.2026/);
 assert.equal(root!.querySelectorAll('.fr-form__grid').length,1);assert.equal(root!.querySelector('.fr-calendar-export'),null);
 assert.doesNotMatch(root!.textContent!,/Fristauslösendes Dokument|Massgeblicher Feiertagskanton|Zielgericht wählen/);
 click(/^Als Standard speichern$/);const saved=values.get('fristenrechner.defaults.v5')!,preferences=JSON.parse(saved).preferences;
 assert.equal(preferences.procedureSelection.pathId,'gl-admin-shortened-end');assert.notEqual(preferences.deadlineDays,7);
 assert.doesNotMatch(saved,/currentValues|caseQualification|newLawApplies|shorteningEstablished|inputDate|2026-10-02/);
 await pause();const seed=values;unmount();mount(seed);
 assert.equal(root!.querySelector<HTMLInputElement>('input[name="inputDate"]')!.value,'');
 assert.equal(root!.querySelector<HTMLInputElement>('input[type="number"]')!.value,'');
 assert.equal(root!.querySelector('.fr-result__hero'),null);
 date('02.10.2026');submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
 assert.match(root!.textContent!,/aktuell gültige verkürzte Tagesdauer/);
});

test('I3 neither a stored thirty-day nor five-day generic standard prepopulates a concrete statutory shortening',async()=>{
 for(const previous of[30,5]){
  mount(new Map([['fristenrechner.defaults.v5',app.seed(previous)]]));
  law('GL',/^Gerichtsverfahren$/, /^Zwischenentscheid an das Verwaltungsgericht, konkret verkürzte gesetzliche Frist$/);
  const field=root!.querySelector<HTMLInputElement>('input[type="number"]')!;assert.equal(field.value,'');assert.equal(field.min,'2');assert.equal(field.max,'9');
  days('7');choose(/Verfahrenshandlung/,/^Beschwerde gegen Endentscheid an das Verwaltungsgericht \(30 Tage\)$/);
  assert.equal(root!.querySelector('input[type="number"]'),null);
  choose(/Verfahrenshandlung/,/^Zwischenentscheid an das Verwaltungsgericht, konkret verkürzte gesetzliche Frist$/);
  assert.equal(root!.querySelector<HTMLInputElement>('input[type="number"]')!.value,'');
  await pause();unmount();
 }
});

test('I3 TG execution is fixed five days while only an explicit current notice selects none or three periods',async()=>{
 mount();date('14.12.2026');law('TG',/^Gerichtsverfahren$/, /^Beschwerde gegen eine Nichtgeld-Vollstreckungsverfügung \(5 Tage\)$/);
 assert.equal(root!.querySelector('input[type="number"]'),null);
 choose(/Fallkonstellation/,/^Echte Nichtgeld-Vollstreckungsverfügung/);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);await pause();
 choose(/Massgebender Hinweis/,/^Hinweis auf die Ferienausnahme eindeutig vorhanden$/);submit();
 assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/21\.12\.2026/);assert.match(root!.querySelector('.fr-automatic__grid')!.textContent!,/Kein Friststillstand/);await pause();
 choose(/Massgebender Hinweis/,/^Hinweis in der massgebenden Belehrung vollständig fehlend$/);assert.equal(root!.querySelector('.fr-result__hero'),null);submit();
 assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/04\.01\.2027/);assert.match(root!.querySelector('.fr-automatic__grid')!.textContent!,/Ostern/);
 assert.match(root!.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!,/vollständig fehlend/);await pause();
 choose(/Massgebender Hinweis/,/^Unklar, unvollständig oder bestritten$/);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);await pause();
 choose(/Verfahrenshandlung/,/^Vorsorglicher Rechtsschutz vor dem Verwaltungsgericht \(30 Tage\)$/);submit();
 assert.equal(root!.querySelector('.fr-result__hero'),null);assert.equal(root!.querySelector('.fr-calendar-export'),null);
 assert.match(root!.textContent!,/AP23I3: lokale Integrationsprüfung/);
});

test('I3 current RR competence and shortening grounds have real alternatives and no first-value default',async()=>{
 mount();date('02.10.2026');law('TG',/^Verwaltungsbeschwerde$/, /^Beschwerde an den Regierungsrat mit konkret verkürzter gesetzlicher Frist$/);
 days('7');choose(/Fallkonstellation/,/^Aktuelles Verfahrensrecht, zulässiges Rechtsmittel und konkrete gültige Verkürzung/);submit();
 assert.equal(root!.querySelector('.fr-result__hero'),null);await pause();
 choose(/Zuständigkeit des Regierungsrats/,/^Öffentliche Sicherheit und Ordnung/);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);await pause();
 choose(/Grund der konkreten Verkürzung/,/^Anderer qualifizierter dringlicher Fall$/);submit();
 assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/09\.10\.2026/);
 assert.doesNotMatch(root!.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!,/SRC-|JUD-|case\.|scope\.|qualifiedDayProcedure/);
 click(/^Als Standard speichern$/);assert.doesNotMatch(values.get('fristenrechner.defaults.v5')!,/regierungsratCompetenceBasis|shorteningGround|currentValues/);
});

test('I3 a true singleton action is fixed and French TG notice and legal links stay readable',async()=>{
 mount();law('GL',/^Verwaltungsverfahren$/, /^Angeordnete erstinstanzliche Eingabe/);
 assert.equal(control(/Verfahrenshandlung/),undefined);assert.match(root!.querySelector('output[aria-label="Verfahrenshandlung"]')!.textContent!,/Angeordnete erstinstanzliche Eingabe/);
 await pause();unmount();mount();choose(/Sprache/,/^Français$/);date('14.12.2026');
 choose(/Siège de l’instance compétente/,/^Thurgovie/);choose(/droit de procédure/i,/^VRG TG$/);choose(/Stade de la procédure/,/^Procédure judiciaire$/);
 choose(/Acte de procédure/,/^Recours contre une décision d’exécution non pécuniaire \(5 jours\)$/);
 choose(/Situation du cas/,/^Véritable décision d’exécution non pécuniaire/);
 choose(/Information déterminante/,/^Information entièrement absente de l’indication déterminante$/);submit();
 assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/04\.01\.2027/);const trace=root!.querySelector('[data-testid="administrative-readable-trace"]')!;
 assert.match(trace.textContent!,/entièrement absente/);assert.match(trace.textContent!,/86/);assert.ok(trace.querySelectorAll('a[href^="https://"]').length>0);
 assert.equal(root!.querySelector('.fr-calendar-export'),null);
});

test('I3 old H3 preference readers protect new paths and mixed authentic runtime identities are rejected',async()=>{
 mount();law('TG',/^Gerichtsverfahren$/, /^Beschwerde gegen eine Nichtgeld-Vollstreckungsverfügung \(5 Tage\)$/);click(/^Als Standard speichern$/);
 await pause();const seed=values,before=values.get('fristenrechner.defaults.v5');unmount();mount(seed,'historicalElement');await pause();
 assert.match(root!.textContent!,/gespeicherten Standards.*nicht verwendbar/);assert.equal(values.get('fristenrechner.defaults.v5'),before);
 click(/^Als Standard speichern$/);assert.equal(values.get('fristenrechner.defaults.v5'),before);
 await pause();unmount();mount(new Map(),'mismatchedElement');assert.equal(root!.querySelector('form'),null);
 assert.match(root!.textContent!,/Datenkontexte gehören nicht zu demselben geprüften Release/);
});
