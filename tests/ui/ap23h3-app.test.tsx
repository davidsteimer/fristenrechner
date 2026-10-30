// SPDX-License-Identifier: AGPL-3.0-only
// Genuine React interactions with the native Format-12 candidate, no hook replacements.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { after, afterEach, test } from 'node:test';
import { buildSync } from 'esbuild';
import type * as ReactType from 'react';
import type * as TestUtilsType from 'react-dom/test-utils';
const require=createRequire(import.meta.url),{JSDOM}=require('jsdom');
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://ap23h3.invalid',pretendToBeVisual:true});
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
  import {createFormat12CalculationData} from './src/core/format12CalculationData';
  import {ap23h3ManifestText,ap23h3Files,ap23h3CandidateRuntime as runtime} from './src/release/ap23h3CandidateData';
  import {ap23g3CandidateRuntime as historical} from './src/release/ap23g3CandidateData';
  setIconOptions({disableWarnings:true});
  export const element=storage=>React.createElement(FristenrechnerApp,{...runtime,storage,localReviewLabel:'AP23H3 reference test'});
  export function mismatchedElement(storage){const other=createFormat12CalculationData(ap23h3ManifestText,ap23h3Files,{mode:'localReference'});
    return React.createElement(FristenrechnerApp,{...runtime,administrativeContext:other.administrativeContext,storage});}
  export const historicalElement=storage=>React.createElement(FristenrechnerApp,{...historical,storage});
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
function days(value:string){const field=root!.querySelector<HTMLInputElement>('input[type="number"]')!;assert.ok(field);act(()=>{field.value=value;Simulate.change(field);});}
function submit(){act(()=>{Simulate.submit(root!.querySelector('form')!);});}
function click(label:RegExp){const button=Array.from(root!.querySelectorAll('button')).find(e=>label.test(e.textContent??''));assert.ok(button,String(label));act(()=>{Simulate.click(button);});}
function law(canton:'OW'|'NW',stage:RegExp=/^Verwaltungsverfahren$/,action=/^Ordentliche Verwaltungsbeschwerde/){
  choose(/Sitz der zuständigen Stelle/,canton==='OW'?/^Obwalden/:/^Nidwalden/);choose(/Verfahrensrecht/,canton==='OW'?/^StVG \/ VGV OW/:/^VRG NW/);
  choose(/Verfahrensstadium/,stage);choose(/Verfahrenshandlung/,action);
}
const pause=()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,250));});
afterEach(async()=>{await pause();unmount();});
after(()=>{dom.window.close();for(const[k,v]of savedGlobals)v?Object.defineProperty(globalThis,k,v):Reflect.deleteProperty(globalThis,k);});

test('H3 real app preserves early editable date and calm two-column selection with a genuine OW opening choice',async()=>{
  mount();date('02.10.2026');law('OW');submit();assert.equal(root!.querySelector('.fr-result__hero'),null);await pause();
  choose(/Fallkonstellation/,/^Vollständige spätere Begründung nach nachweislich rechtzeitigem Verlangen/);submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/22\.10\.2026/);await pause();
  const count=root!.querySelectorAll('[role="combobox"]').length;
  choose(/Fallkonstellation/,/^Ursprünglich vollständig begründeter Entscheid/);assert.equal(root!.querySelector('.fr-result__hero'),null);submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/22\.10\.2026/);assert.equal(root!.querySelectorAll('[role="combobox"]').length,count);
  assert.equal(root!.querySelectorAll('.fr-form__grid').length,1);assert.equal(root!.querySelector('.fr-calendar-export'),null);
  assert.doesNotMatch(root!.textContent!,/Fristauslösendes Dokument|Massgeblicher Feiertagskanton|Eröffnungsherkunft|Zielgericht wählen/);
  assert.match(root!.textContent!,/AP23H3: lokale Integrationsprüfung/);
});
test('H3 OW reasons request resets opening facts and names its same issuer rather than adding an issuer field',async()=>{
  mount();date('02.10.2026');law('OW');choose(/Fallkonstellation/,/^Ursprünglich vollständig begründeter Entscheid/);submit();await pause();
  choose(/Verfahrenshandlung/,/^Begründung bei derselben Verwaltungsbehörde verlangen/);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);await pause();
  choose(/Fallkonstellation/,/^Zulässig unbegründete Verfügung mit Begründungshinweis/);submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/02\.11\.2026/);assert.equal(root!.querySelector('input[type="number"]'),null);
  const trace=root!.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!;
  assert.match(trace,/systematischen Übertragung/);assert.match(trace,/112/);assert.doesNotMatch(trace,/SRC-|case\.|scope\./);
});
test('H3 OW presidential decision review is five days without vacation suspension, not a generic interim appeal',()=>{
  mount();date('23.12.2026');law('OW',/^Gerichtsverfahren$/, /^Präsidialentscheid zur aufschiebenden Wirkung/);
  choose(/Fallkonstellation/,/^Präsidialentscheid zur aufschiebenden Wirkung, Weiterzug an dasselbe Gesamtgericht/);submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/28\.12\.2026/);assert.equal(root!.querySelector('input[type="number"]'),null);
  assert.match(root!.querySelector('.fr-automatic__grid')!.textContent!,/Kein Friststillstand/);
  assert.equal(root!.querySelector('.fr-calendar-export'),null);
});
test('H3 NW ordered first instance and Einwendung select different genuine suspension models',async()=>{
  mount();date('10.12.2026');law('NW',/^Verwaltungsverfahren$/, /^Angeordnete Eingabe im erstinstanzlichen Verwaltungsverfahren/);
  days('20');choose(/Fallkonstellation/,/^Angeordnete erstinstanzliche Eingabe/);submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/30\.12\.2026/);await pause();
  choose(/Verfahrenshandlung/,/^Angeordnete Stellungnahme im Einwendungsverfahren/);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);await pause();
  choose(/Fallkonstellation/,/^Angeordnete Stellungnahme im Einwendungsverfahren/);submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/15\.01\.2027/);
  assert.match(root!.querySelector('.fr-automatic__grid')!.textContent!,/nur Winterstillstand/);
  assert.doesNotMatch(root!.querySelector('.fr-automatic__grid')!.textContent!,/Ostern/);
});
test('H3 NW Einsprache and statutory exchange are qualified distinct actions with fixed twenty days',async()=>{
  mount();date('10.07.2027');law('NW',/^Verwaltungsverfahren$/, /^Gesetzlich zulässige Einsprache/);
  choose(/Fallkonstellation/,/^Gesetzlich zulässige Einsprache gegen rechtmässig eröffneten Entscheid/);submit();
  assert.equal(root!.querySelector('input[type="number"]'),null);assert.equal(root!.querySelector('.fr-calendar-export'),null);await pause();
  choose(/Verfahrenshandlung/,/^Vernehmlassung im Verwaltungsbeschwerdeverfahren/);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);await pause();
  choose(/Fallkonstellation/,/^Beschwerde zur Vernehmlassung zugestellt/);submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/31\.08\.2027/);
  assert.match(root!.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!,/76/);
  await pause();
  choose(/Fallkonstellation/,/^Spezialrecht oder abweichende Fallkonstellation$/);submit();assert.equal(root!.querySelector('.fr-result__hero'),null);
});
test('H3 stable preferences survive reload without assuming admissibility agreement exceptions or opening facts',async()=>{
  mount();date('02.10.2026');law('NW',/^Verwaltungsverfahren$/, /^Gesetzlich zulässige Einsprache/);
  choose(/Fallkonstellation/,/^Gesetzlich zulässige Einsprache gegen rechtmässig eröffneten Entscheid/);submit();click(/^Als Standard speichern$/);
  const saved=values.get('fristenrechner.defaults.v5')!;assert.equal(JSON.parse(saved).preferences.procedureSelection.pathId,'nw-einsprache-20');
  assert.doesNotMatch(saved,/caseQualification|einspracheAdmissibility|deadlineAgreement|openingOrigin|qualification|2026-10-02/);
  await pause();const seed=values;unmount();mount(seed);assert.equal(root!.querySelector<HTMLInputElement>('input[name="inputDate"]')!.value,'');
  date('02.10.2026');submit();assert.equal(root!.querySelector('.fr-result__hero'),null);await pause();
  choose(/Fallkonstellation/,/^Gesetzlich zulässige Einsprache gegen rechtmässig eröffneten Entscheid/);submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/22\.10\.2026/);
});
test('H3 preferences unknown to historical G3 remain protected without silent old-path substitution or destructive reset',async()=>{
  mount();law('OW');click(/^Als Standard speichern$/);await pause();const seed=values,original=seed.get('fristenrechner.defaults.v5');
  unmount();mount(seed,'historicalElement');await pause();assert.match(root!.textContent!,/gespeicherten Standards.*nicht verwendbar/);
  assert.equal(values.get('fristenrechner.defaults.v5'),original);assert.equal(root!.querySelector('.fr-result__hero'),null);
  click(/^Als Standard speichern$/);assert.equal(values.get('fristenrechner.defaults.v5'),original);
});
test('H3 French current document and stage qualification is human readable and all preview exports remain blocked',()=>{
  mount();choose(/Sprache/,/^Français$/);date('02.10.2026');choose(/Siège de l’instance compétente/,/^Nidwald/);
  choose(/droit de procédure/i,/^VRG NW/);choose(/Stade de la procédure/,/^Procédure administrative/);
  choose(/Acte de procédure/,/^Réplique dans la procédure de recours administratif/);
  choose(/Situation du cas/,/^Observations notifiées pour réplique/);submit();
  assert.match(root!.querySelector('.fr-result__hero')!.textContent!,/22\.10\.2026/);
  assert.doesNotMatch(root!.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!,/scope\.|case\.|action\.|SRC-|JUD-/);
  assert.match(root!.textContent!,/AP23H3/);assert.equal(root!.querySelector('.fr-calendar-export'),null);
});
test('H3 mismatched native contexts reject before any interactive form is mounted',()=>{
  mount(new Map(),'mismatchedElement');assert.equal(root!.querySelector('form'),null);
  assert.match(root!.textContent!,/Datenkontexte gehören nicht zu demselben geprüften Release/);
});
