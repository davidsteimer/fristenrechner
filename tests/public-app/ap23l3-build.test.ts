// SPDX-License-Identifier: AGPL-3.0-only
// Exercises the actual minified local bundle. No network, hosting or file export.
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {before,after,test,describe} from 'node:test';
import {promisify} from 'node:util';

describe('AP23L3 actual static artifact',{timeout:900000},()=>{
 const {JSDOM}=createRequire(import.meta.url)('jsdom');
 const exec=promisify(execFile),output=resolve('.work/public-ap23l3');
 const candidate='data/candidates/2026-10-27-ap23l3/manifest.json';
 const hash=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
 let manifest:any,javascript:string,candidateSha:string;
 const sessions:any[]=[];
 before(async()=>{
  candidateSha=hash(await readFile(candidate));
  await exec(process.execPath,[resolve('scripts/build-public-app.mjs')],{cwd:process.cwd(),
   env:{...process.env,FRISTENRECHNER_DATA_CANDIDATE:'ap23l3'},timeout:900000,maxBuffer:8*1024*1024});
  manifest=JSON.parse(await readFile(resolve(output,'build-manifest.json'),'utf8'));
  javascript=await readFile(resolve(output,manifest.assets.javascript),'utf8');
 },{timeout:900000});
 after(()=>sessions.forEach(dom=>dom.window.close()));
 async function page(savedDefaults?:string):Promise<any>{
  const dom=new JSDOM(await readFile(resolve(output,'index.html'),'utf8'),{
   url:'https://ap23l3.invalid/fristenrechner/?candidate=untrusted&mode=approved',pretendToBeVisual:true,runScripts:'outside-only'});
  const {window}=dom;sessions.push(dom);
  if(savedDefaults)window.localStorage.setItem('fristenrechner.defaults.v5',savedDefaults);
  window.TextEncoder=TextEncoder;window.TextDecoder=TextDecoder;
  window.matchMedia=(query:string)=>({matches:false,media:query,onchange:null,
   addListener(){},removeListener(){},addEventListener(){},removeEventListener(){},dispatchEvent:()=>false});
  for(const asset of[manifest.assets.vendors.react,manifest.assets.vendors.reactDom,manifest.assets.vendors.fluentUiReact])
   window.eval(await readFile(resolve(output,asset),'utf8'));
  window.eval(javascript);return dom;
 }
 function name(document:Document,element:Element):string{
  return element.getAttribute('aria-label')||(element.getAttribute('aria-labelledby')??'').split(' ')
   .map(id=>document.getElementById(id)?.textContent??'').join(' ');
 }
 async function choose(window:any,label:RegExp,option:RegExp):Promise<void>{
  const document=window.document as Document;
  const field=Array.from(document.querySelectorAll('[role="combobox"]')).find(el=>label.test(name(document,el)));
  assert.ok(field,'Missing dropdown '+label);field.dispatchEvent(new window.MouseEvent('click',{bubbles:true}));
  await new Promise(done=>window.setTimeout(done,25));
  const options=Array.from(document.querySelectorAll('[role="option"]')),selected=options.find(el=>option.test(el.textContent??''));
  assert.ok(selected,`Missing ${option}: ${options.map(el=>el.textContent)}`);
  selected.dispatchEvent(new window.MouseEvent('click',{bubbles:true}));await new Promise(done=>window.setTimeout(done,25));
 }
 function input(window:any,key:string,value:string):void{
  const field=window.document.querySelector(key==='days'?'input[type="number"]':`input[name="${key}"]`);assert.ok(field,key);
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value')!.set!.call(field,value);
  field.dispatchEvent(new window.Event('input',{bubbles:true}));field.dispatchEvent(new window.Event('change',{bubbles:true}));
 }
 function submit(window:any):void{window.document.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));}
 function noExport(window:any):void{assert.equal(window.document.querySelector('.fr-calendar-export'),null);}
 async function ai(window:any,action:RegExp,stage=/^Verwaltungsverfahren$/):Promise<void>{
  await choose(window,/Sitz der zuständigen Stelle/,/^Appenzell Innerrhoden/);
  await choose(window,/Verfahrensrecht/,/^VerwVG \/ VerwGG AI/);
  await choose(window,/Verfahrensstadium/,stage);await choose(window,/Verfahrenshandlung/,action);
 }
 async function qualifyAi(window:any,opening=/^Rechtlich massgebender Tag bereits bestimmt$/):Promise<void>{
  await choose(window,/Grundlage des eingegebenen Datums/,opening);
  await choose(window,/Fristbelehrung im aktuellen Fall/,/^Reguläre/);
  await choose(window,/Fallkonstellation/,/^Zulässiger aktueller Weg/);
 }

 test('AP23L3 static output is explicit format16 candidate, separately built and nondeployable',async()=>{
  assert.equal(manifest.version,'ap23l3-local-candidate');assert.equal(manifest.dataReleaseId,'2026-10-27-ap23l3-candidate.1');
  assert.equal(manifest.status,'candidate');assert.equal(manifest.deployable,false);assert.equal(hash(await readFile(candidate)),candidateSha);
  for(const token of['AP23L3','2026-10-27-ap23l3-candidate.1','ai-admin-ordered','sz-court-execution-10'])assert.ok(javascript.includes(token),token);
  assert.doesNotMatch(javascript,/qaPresets|SYNTHETIC TEST|\bfetch\s*\(|new XMLHttpRequest|new WebSocket/);
  assert.ok(!(await readdir(output,{recursive:true})).some(path=>path.endsWith('.map')));
  assert.equal(await readFile(resolve(output,'.htaccess'),'utf8'),await readFile('public-app/.htaccess','utf8'));
 });

 test('AP23L3 browser keeps early date entry, the two-column grid and local export boundary',async()=>{
  const {window}=await page(),field=window.document.querySelector('input[name="inputDate"]');
  assert.ok(field);assert.equal(field.disabled,false);input(window,'inputDate','02.10.2026');
  assert.equal(window.document.querySelectorAll('.fr-form__grid').length,1);
  assert.match(window.document.body.textContent,/AP23L3/);noExport(window);
 });

 test('AP23L3 actual browser qualifies tracking before counting and never rebases an already qualified date',async()=>{
  const {window}=await page();await ai(window,/^Angeordnete Eingabe im Verwaltungsverfahren$/);
  await qualifyAi(window,/^Physischer Eingang/);input(window,'inputDate','19.09.2026');input(window,'days','10');submit(window);
  assert.match(window.document.querySelector('.fr-result__hero')!.textContent,/01\.10\.2026/);noExport(window);
  const trace=window.document.querySelector('[data-testid="administrative-readable-trace"]');assert.ok(trace);
  assert.match(trace.textContent,/22\.09\.2026/);assert.match(trace.textContent,/Tag nach der rechtlich massgebenden Eröffnung/);
  assert.doesNotMatch(trace.textContent,/Tag nach dem Empfang/);
  await choose(window,/Grundlage des eingegebenen Datums/,/^Rechtlich massgebender Tag bereits bestimmt$/);
  assert.equal(window.document.querySelector('.fr-result__hero'),null);
  assert.equal(window.document.querySelector('input[name="inputDate"]').value,'');
  await choose(window,/Fallkonstellation/,/^Zulässiger aktueller Weg/);input(window,'inputDate','19.09.2026');input(window,'days','10');submit(window);
  assert.match(window.document.querySelector('.fr-result__hero')!.textContent,/29\.09\.2026/);noExport(window);
 });

 test('AP23L3 actual browser cannot compute AI without the current group qualification',async()=>{
  const {window}=await page();await ai(window,/^Angeordnete Eingabe im Verwaltungsverfahren$/);
  await choose(window,/Grundlage des eingegebenen Datums/,/^Rechtlich massgebender Tag bereits bestimmt$/);
  await choose(window,/Fristbelehrung im aktuellen Fall/,/^Reguläre/);input(window,'inputDate','02.10.2026');input(window,'days','10');submit(window);
  assert.equal(window.document.querySelector('.fr-result__hero'),null);noExport(window);
  assert.match(window.document.querySelector('.fr-result-region')!.textContent,/aktuelle Fallkonstellation/);
 });

 test('AP23L3 actual browser saves the long-notice path but never its current duration or qualification facts',async()=>{
  const {window}=await page();await ai(window,/^Rekurs mit wirksamer längerer Tagesbelehrung$/,/^Verwaltungsbeschwerde$/);
  await choose(window,/Grundlage des eingegebenen Datums/,/^Rechtlich massgebender Tag bereits bestimmt$/);
  await choose(window,/Ordentliche gesetzliche Frist im aktuellen Fall/,/^30 Tage$/);
  await choose(window,/Fallkonstellation/,/^Wirksame längere Belehrung/);input(window,'inputDate','02.10.2026');input(window,'days','45');submit(window);
  assert.match(window.document.querySelector('.fr-result__hero')!.textContent,/16\.11\.2026/);noExport(window);
  const save=Array.from(window.document.querySelectorAll('button')).find((button:any)=>button.textContent==='Als Standard speichern')as any;assert.ok(save);save.click();
  const saved=window.localStorage.getItem('fristenrechner.defaults.v5');assert.ok(saved);
  assert.doesNotMatch(saved,/actualLongerInstructionDays|ordinaryStatutoryDays|openingMode|expectedService|caseQualification|currentValues/);
  const restored=(await page(saved)).window;
  assert.equal(restored.document.querySelector('input[name="inputDate"]').value,'');
  assert.equal(restored.document.querySelector('input[type="number"]').value,'');
  assert.equal(restored.document.querySelector('.fr-result__hero'),null);noExport(restored);
 });

 test('AP23L3 actual browser counts Schwyz winter through January7 and fixed single-choice exception adds no dropdown',async()=>{
  const {window}=await page();await choose(window,/Sitz der zuständigen Stelle/,/^Schwyz/);
  await choose(window,/Verfahrensrecht/,/^VRP SZ/);await choose(window,/Verfahrensstadium/,/^Verwaltungsverfahren$/);
  await choose(window,/Verfahrenshandlung/,/^Angeordnete Eingabe im Erstverfahren$/);
  await choose(window,/Fallkonstellation/,/^Zulässiger aktueller Weg/);input(window,'inputDate','23.12.2026');input(window,'days','1');submit(window);
  assert.match(window.document.querySelector('.fr-result__hero')!.textContent,/08\.01\.2027/);noExport(window);
  await choose(window,/Verfahrensstadium/,/^Verwaltungsbeschwerde$/);
  await choose(window,/Verfahrenshandlung/,/^Konkret angesetzte Einsprache/);
  const exception=Array.from(window.document.querySelectorAll('[role="combobox"]')).find((el:any)=>/Anwendbare Stillstandsausnahme/.test(name(window.document,el)));
  assert.equal(exception,undefined,'Single supported exception is a fixed display, not a dropdown');
  await choose(window,/Fallkonstellation/,/^Zulässiger aktueller Weg/);input(window,'inputDate','23.12.2026');input(window,'days','5');submit(window);
  assert.match(window.document.querySelector('.fr-result__hero')!.textContent,/28\.12\.2026/);noExport(window);
 });

 test('AP23L3 actual French browser exposes readable Martinstag provenance without permitting local export',async()=>{
  const {window}=await page();await choose(window,/Sprache/,/^Français$/);
  await choose(window,/Siège de l’instance compétente/,/^Schwytz/);await choose(window,/droit de procédure/i,/^VRP SZ/);
  await choose(window,/Stade de la procédure/,/^Procédure judiciaire$/);
  await choose(window,/Acte de procédure/,/^Mesure d’exécution susceptible d’un recours indépendant \(10 jours\)$/);
  await choose(window,/Situation du cas/,/^Parcours actuel recevable/);input(window,'inputDate','01.11.2026');submit(window);
  assert.match(window.document.querySelector('.fr-result__hero')!.textContent,/12\.11\.2026/);noExport(window);
  const trace=window.document.querySelector('[data-testid="administrative-procedural-supplement-trace"]');assert.ok(trace);
  assert.match(trace.textContent,/Saint-Martin/);assert.doesNotMatch(trace.textContent,/proceduralCalendarSupplement|SRC-L1|sz-qualified-authority-seat/);
 });

 test('AP23L3 actual browser clears physical dates across a blank opening choice, a new action and uncommitted drafts',async()=>{
  const {window}=await page();await ai(window,/^Angeordnete Eingabe im Verwaltungsverfahren$/);
  await qualifyAi(window,/^Physischer Eingang/);input(window,'inputDate','19.09.2026');input(window,'days','10');submit(window);
  assert.match(window.document.querySelector('.fr-result__hero')!.textContent,/01\.10\.2026/);
  await choose(window,/Grundlage des eingegebenen Datums/,/^Bitte wählen$/);
  assert.equal(window.document.querySelector('input[name="inputDate"]').value,'');
  assert.equal(window.document.querySelector('.fr-result__hero'),null);
  await choose(window,/Grundlage des eingegebenen Datums/,/^Rechtlich massgebender Tag bereits bestimmt$/);
  assert.equal(window.document.querySelector('input[name="inputDate"]').value,'');
  input(window,'inputDate','19');
  assert.equal(window.document.querySelector('input[name="inputDate"]').value,'19','A short uncommitted draft is genuinely visible');
  await choose(window,/Grundlage des eingegebenen Datums/,/^Physischer Eingang/);
  assert.equal(window.document.querySelector('input[name="inputDate"]').value,'','Changing meaning also drops the DateInput draft');
  await choose(window,/Fallkonstellation/,/^Zulässiger aktueller Weg/);
  input(window,'inputDate','19');
  await choose(window,/Verfahrenshandlung/,/^Schriftliche Eröffnung nach mündlichem Entscheid verlangen/);
  assert.equal(window.document.querySelector('input[name="inputDate"]').value,'','A different action cannot reinterpret the tracking draft');
  assert.equal(window.document.querySelector('.fr-result__hero'),null);noExport(window);
 });

 test('AP23L3 actual browser preserves early date entry but clears a known physical meaning on authority and law changes',async()=>{
  const {window}=await page();input(window,'inputDate','19.09.2026');
  await ai(window,/^Angeordnete Eingabe im Verwaltungsverfahren$/);await qualifyAi(window,/^Physischer Eingang/);
  assert.equal(window.document.querySelector('input[name="inputDate"]').value,'19.09.2026','The first context selection preserves genuinely early date entry');
  input(window,'days','10');submit(window);assert.match(window.document.querySelector('.fr-result__hero')!.textContent,/01\.10\.2026/);
  await choose(window,/Sitz der zuständigen Stelle/,/^Bern/);
  assert.equal(window.document.querySelector('input[name="inputDate"]').value,'');assert.equal(window.document.querySelector('.fr-result__hero'),null);
  await ai(window,/^Angeordnete Eingabe im Verwaltungsverfahren$/);await qualifyAi(window,/^Physischer Eingang/);
  input(window,'inputDate','19');assert.equal(window.document.querySelector('input[name="inputDate"]').value,'19');
  await choose(window,/Verfahrensrecht/,/^Strafprozessordnung/);
  assert.equal(window.document.querySelector('input[name="inputDate"]').value,'','A different law cannot consume the tracking draft');
  assert.equal(window.document.querySelector('.fr-result__hero'),null);noExport(window);
 });
});
