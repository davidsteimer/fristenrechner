// SPDX-License-Identifier: AGPL-3.0-only
// Real minified candidate, in-memory browser DOM. No hosting or calendar file export.
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {before,after,test,describe} from 'node:test';
import {promisify} from 'node:util';
describe('R10-U1 actual static artifact',{timeout:900000},()=>{
 const {JSDOM}=createRequire(import.meta.url)('jsdom'),exec=promisify(execFile),output=resolve('.work/public-r10-u1');
 const candidate='data/candidates/2026-10-28-ap23m3/manifest.json',hash=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
 let manifest:any,javascript:string,candidateSha:string;const sessions:any[]=[];
 before(async()=>{candidateSha=hash(await readFile(candidate));await exec(process.execPath,[resolve('scripts/build-public-app.mjs')],{cwd:process.cwd(),env:{...process.env,FRISTENRECHNER_DATA_CANDIDATE:'r10-u1'},timeout:900000,maxBuffer:8*1024*1024});
  manifest=JSON.parse(await readFile(resolve(output,'build-manifest.json'),'utf8'));javascript=await readFile(resolve(output,manifest.assets.javascript),'utf8');},{timeout:900000});
 after(()=>sessions.forEach(dom=>dom.window.close()));
 async function page(saved?:string):Promise<any>{const dom=new JSDOM(await readFile(resolve(output,'index.html'),'utf8'),{url:'https://r10-u1.invalid/fristenrechner/?mode=approved',pretendToBeVisual:true,runScripts:'outside-only'}),{window}=dom;sessions.push(dom);
  if(saved)window.localStorage.setItem('fristenrechner.defaults.v5',saved);window.TextEncoder=TextEncoder;window.TextDecoder=TextDecoder;
  window.matchMedia=(query:string)=>({matches:false,media:query,onchange:null,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){},dispatchEvent:()=>false});
  for(const asset of[manifest.assets.vendors.react,manifest.assets.vendors.reactDom,manifest.assets.vendors.fluentUiReact])window.eval(await readFile(resolve(output,asset),'utf8'));window.eval(javascript);return dom;}
 function name(document:Document,element:Element):string{return element.getAttribute('aria-label')||(element.getAttribute('aria-labelledby')??'').split(' ').map(id=>document.getElementById(id)?.textContent??'').join(' ');}
 function field(window:any,label:RegExp):Element|undefined{return Array.from((window.document as Document).querySelectorAll('[role="combobox"]')).find(el=>label.test(name(window.document,el)));}
 async function choose(window:any,label:RegExp,option:RegExp):Promise<void>{const f=field(window,label);assert.ok(f,'Missing dropdown '+label);f.dispatchEvent(new window.MouseEvent('click',{bubbles:true}));await new Promise(done=>window.setTimeout(done,25));
  const options=Array.from((window.document as Document).querySelectorAll('[role="option"]')),selected=options.find(el=>option.test(el.textContent??''));assert.ok(selected,`Missing ${option}: ${options.map(el=>el.textContent)}`);selected.dispatchEvent(new window.MouseEvent('click',{bubbles:true}));await new Promise(done=>window.setTimeout(done,25));}
 function input(window:any,key:string,value:string):void{const f=window.document.querySelector(key==='days'?'input[type="number"]':`input[name="${key}"]`);assert.ok(f,key);Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value')!.set!.call(f,value);f.dispatchEvent(new window.Event('input',{bubbles:true}));f.dispatchEvent(new window.Event('change',{bubbles:true}));}
 function submit(window:any):void{window.document.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));}
 function result(window:any,end:RegExp):void{assert.match(window.document.querySelector('.fr-result__hero')?.textContent??'',end);assert.equal(window.document.querySelector('.fr-calendar-export'),null);}
 async function route(window:any,canton:RegExp,law:RegExp,action:RegExp,stage=/^Verwaltungsverfahren$/):Promise<void>{await choose(window,/Sitz der zuständigen Stelle/,canton);await choose(window,/Verfahrensrecht/,law);await choose(window,/Verfahrensstadium/,stage);await choose(window,/Verfahrenshandlung/,action);}
 async function qualify(window:any,positive:RegExp=/^(?:Zulässiger aktueller Weg|Gültige aktuelle Tagesanordnung)/):Promise<void>{await choose(window,/Fallkonstellation/,positive);}

 test('R10-U1 output is explicit native17 candidate and not promoted through URL flags',async()=>{
  assert.equal(manifest.version,'r10-u1-local-candidate');assert.equal(manifest.dataReleaseId,'2026-10-28-ap23m3-candidate.1');assert.equal(manifest.status,'candidate');assert.equal(manifest.deployable,false);assert.equal(hash(await readFile(candidate)),candidateSha);
  for(const token of['R10-U1','Format 17','2026-10-28-ap23m3-candidate.1','ne-admin-ordered','vd-admin-ordered','vs-admin-ordered'])assert.ok(javascript.includes(token),token);
  assert.doesNotMatch(javascript,/qaPresets|SYNTHETIC TEST|\bfetch\s*\(|new XMLHttpRequest|new WebSocket/);assert.ok(!(await readdir(output,{recursive:true})).some(p=>p.endsWith('.map')));assert.equal(await readFile(resolve(output,'.htaccess'),'utf8'),await readFile('public-app/.htaccess','utf8'));
 });
 test('R10-U1 preserves early date entry static seat label and the two-column grid',async()=>{const{window}=await page(),f=window.document.querySelector('input[name="inputDate"]');assert.ok(f);assert.equal(f.disabled,false);input(window,'inputDate','02.10.2026');assert.equal(window.document.querySelectorAll('.fr-form__grid').length,1);assert.ok(field(window,/Sitz der zuständigen Stelle/));assert.ok(window.document.body.textContent.includes('R10-U1 · Format 17 · DE / FR'));assert.doesNotMatch(window.document.body.textContent,/Unterstützter Verfahrenskontext/);});
 test('R10-U1 actual browser requires NE current seat region and selects exactly its bound calendar',async()=>{
  const{window}=await page();await route(window,/^Neuenburg/,/^LPA NE/,/^Angeordnete Eingabe an die Verwaltung$/);
  input(window,'inputDate','26.05.2027');input(window,'days','1');submit(window);assert.equal(window.document.querySelector('.fr-result__hero'),null);
  await choose(window,/Aktueller Sitz der zuständigen Stelle in Neuenburg/,/^Kanton Neuenburg ausser Le Landeron$/);await qualify(window);input(window,'inputDate','26.05.2027');input(window,'days','1');submit(window);result(window,/27\.05\.2027/);
  await choose(window,/Aktueller Sitz der zuständigen Stelle in Neuenburg/,/^Le Landeron$/);assert.equal(window.document.querySelector('.fr-result__hero'),null);await qualify(window);input(window,'inputDate','26.05.2027');input(window,'days','1');submit(window);result(window,/28\.05\.2027/);
 });
 test('R10-U1 actual NE court is fixed Neuchatel without a redundant region dropdown',async()=>{
  const{window}=await page();await route(window,/^Neuenburg/,/^LPA NE/,/^Gerichtlich angeordnete Eingabe$/,/^Gerichtsverfahren$/);assert.equal(field(window,/Aktueller Sitz der zuständigen Stelle in Neuenburg/),undefined);await qualify(window);input(window,'inputDate','26.05.2027');input(window,'days','1');submit(window);result(window,/27\.05\.2027/);
 });
 test('R10-U1 actual VD unsigned receipt is qualified before counting without AI extra requirements',async()=>{
  const{window}=await page();await route(window,/^Waadt/,/^LPA-VD/,/^Angeordnete Eingabe im Erstverfahren$/);
  await choose(window,/Grundlage des eingegebenen Datums/,/^Physischer Eingang einer einfachen Postzustellung ohne Unterschrift$/);await qualify(window,/^Neue Tagesfrist ab Eröffnung/);input(window,'inputDate','19.09.2026');input(window,'days','3');submit(window);result(window,/25\.09\.2026/);
  const trace=window.document.querySelector('[data-testid="administrative-readable-trace"]');assert.ok(trace);assert.match(trace.textContent,/22\.09\.2026/);assert.match(trace.textContent,/23\.09\.2026/);assert.doesNotMatch(window.document.body.textContent,/erwartbare Zustellung|expectedService|receiptHolidayRegime/);
 });
 test('R10-U1 changing the VD date meaning clears old date and current qualification',async()=>{
  const{window}=await page();await route(window,/^Waadt/,/^LPA-VD/,/^Angeordnete Eingabe im Erstverfahren$/);await choose(window,/Grundlage des eingegebenen Datums/,/^Physischer Eingang/);await qualify(window,/^Neue Tagesfrist/);input(window,'inputDate','19.09.2026');input(window,'days','3');submit(window);result(window,/25\.09\.2026/);
  await choose(window,/Grundlage des eingegebenen Datums/,/^Rechtlich massgebender Tag bereits bestimmt$/);assert.equal(window.document.querySelector('.fr-result__hero'),null);assert.equal(window.document.querySelector('input[name="inputDate"]').value,'');await qualify(window,/^Neue Tagesfrist/);input(window,'inputDate','19.09.2026');input(window,'days','3');submit(window);result(window,/22\.09\.2026/);
 });
 test('R10-U1 VS longer notice permits15above10 and needs a current ordinary basis',async()=>{
  const{window}=await page();await route(window,/^Wallis/,/^VVRG \/ LPJA VS/,/^Verwaltungsbeschwerde mit wirksamer längerer Tagesbelehrung$/,/^Verwaltungsbeschwerde$/);
  input(window,'inputDate','02.10.2026');input(window,'days','15');submit(window);assert.equal(window.document.querySelector('.fr-result__hero'),null);
  await choose(window,/Ordentliche gesetzliche Frist im aktuellen Fall/,/^10 Tage$/);await qualify(window,/^Längere Tagesbelehrung/);input(window,'inputDate','02.10.2026');input(window,'days','15');submit(window);result(window,/19\.10\.2026/);
 });
 test('R10-U1 VS winter lasts through January5 and remains readable in French',async()=>{
  const{window}=await page();await route(window,/^Wallis/,/^VVRG \/ LPJA VS/,/^Gerichtlich angeordnete Eingabe$/,/^Gerichtsverfahren$/);await qualify(window);input(window,'inputDate','17.12.2026');input(window,'days','1');submit(window);result(window,/06\.01\.2027/);
  await choose(window,/Sprache/,/^Français$/);const trace=window.document.querySelector('[data-testid="administrative-readable-trace"]');assert.ok(trace);assert.match(window.document.body.textContent,/5 janvier/);assert.doesNotMatch(trace.textContent,/SRC-M1-|M1-END-SUSPENSION|vs-three|qualifiedVs/);assert.equal(window.document.querySelector('.fr-calendar-export'),null);
 });
 test('R10-U1 defaults preserve selected path but never current NE region or date',async()=>{
  const{window}=await page();await route(window,/^Neuenburg/,/^LPA NE/,/^Angeordnete Eingabe an die Verwaltung$/);await choose(window,/Aktueller Sitz der zuständigen Stelle in Neuenburg/,/^Le Landeron$/);await qualify(window);input(window,'inputDate','26.05.2027');input(window,'days','1');submit(window);result(window,/28\.05\.2027/);
  const save=Array.from(window.document.querySelectorAll('button')).find((b:any)=>b.textContent==='Als Standard speichern')as any;assert.ok(save);save.click();const saved=window.localStorage.getItem('fristenrechner.defaults.v5');assert.ok(saved);assert.doesNotMatch(saved,/authorityHolidayRegion|openingMode|caseQualification|currentValues/);
  const restored=(await page(saved)).window;assert.equal(restored.document.querySelector('input[name="inputDate"]').value,'');assert.equal(restored.document.querySelector('.fr-result__hero'),null);submit(restored);assert.equal(restored.document.querySelector('.fr-result__hero'),null);
 });
 test('R10-U1 actual minified B11 early GR stop and positive neighbour stay distinct in DE/FR',async()=>{
  for(const locale of['de','fr']as const){const{window}=await page();
   await choose(window,/Sitz der zuständigen Stelle/,/^Graubünden/);await choose(window,/Verfahrensrecht/,/^VRG \(GR\)$/);await choose(window,/Verfahrensstadium/,/^Verwaltungsverfahren$/);
   assert.match(window.document.querySelector('output[aria-label="Verfahrenshandlung"]')?.textContent??'',/Behördlich angesetzte Tagesfrist/);
   await qualify(window,/^Allgemeines kantonales Verfahren/);if(locale==='fr')await choose(window,/Sprache/,/^Français$/);
   input(window,'inputDate','28.08.2026');input(window,'days','1');submit(window);
   assert.equal(window.document.querySelector('.fr-result__hero'),null);assert.equal(window.document.querySelector('.fr-calendar-export'),null);
   assert.match(window.document.querySelector('.fr-result__messages')?.textContent??'',locale==='de'?/ausserhalb des gedeckten Fallzeitraums/:/hors de la période couverte/);
   const early=window.document.querySelector('[data-testid="administrative-readable-trace"]');assert.ok(early);
   assert.match(early.querySelector('[data-testid="administrative-trace-before-provenance"]')?.textContent??'',locale==='de'?/Ergebnisherkunft wurde noch nicht aufgebaut/:/avant l’établissement de l’origine du résultat/);
   assert.doesNotMatch(early.textContent,/Bezeichnungen können nicht|Certains libellés|vollständigen Angaben|données complètes/);
   assert.equal(early.querySelector('a'),null);assert.equal(window.document.querySelector('[data-testid="administrative-technical-evidence"]'),null);
   input(window,'inputDate','29.08.2026');submit(window);result(window,/31\.08\.2026/);
   assert.equal(window.document.querySelector('[data-testid="administrative-trace-before-provenance"]'),null);
   const readable=window.document.querySelector('[data-testid="administrative-readable-trace"]'),technical=window.document.querySelector('[data-testid="administrative-technical-evidence"]');assert.ok(readable);assert.ok(technical);
   assert.ok(readable.querySelectorAll('a').length>0);assert.doesNotMatch(readable.textContent,/Bezeichnungen können nicht|Certains libellés/);
   const evidence=JSON.parse(technical.querySelector('pre')!.textContent!);assert.equal(evidence.result.outcome,'calculated');assert.equal(evidence.result.finalEnd,'2026-08-31');
   assert.equal(evidence.result.provenance.pathId,'gr-admin-ordered');assert.equal(evidence.result.provenance.releaseId,manifest.dataReleaseId);assert.ok(evidence.result.provenance.sourceRefs.length>0);
  }
 });
 test('R10-U1 actual minified B11 late GR stop retains real provenance rather than an early-stop hint in DE/FR',async()=>{
  for(const locale of['de','fr']as const){const{window}=await page();
   await choose(window,/Sitz der zuständigen Stelle/,/^Graubünden/);await choose(window,/Verfahrensrecht/,/^VRG \(GR\)$/);await choose(window,/Verfahrensstadium/,/^Verwaltungsverfahren$/);
   await qualify(window,/^Allgemeines kantonales Verfahren/);if(locale==='fr')await choose(window,/Sprache/,/^Français$/);
   input(window,'inputDate','31.12.2027');input(window,'days','1');submit(window);
   assert.equal(window.document.querySelector('.fr-result__hero'),null);assert.equal(window.document.querySelector('.fr-calendar-export'),null);assert.equal(window.document.querySelector('[data-testid="administrative-trace-before-provenance"]'),null);
   const readable=window.document.querySelector('[data-testid="administrative-readable-trace"]'),technical=window.document.querySelector('[data-testid="administrative-technical-evidence"]');assert.ok(readable);assert.ok(technical);
   assert.match(readable.textContent,/01\.01\.2028/);assert.doesNotMatch(readable.textContent,/Bezeichnungen können nicht|Certains libellés|vollständigen Angaben|données complètes/);assert.ok(readable.querySelectorAll('a').length>0);
   const evidence=JSON.parse(technical.querySelector('pre')!.textContent!);assert.equal(evidence.result.outcome,'blocked');assert.deepEqual(evidence.result.blockReasonKeys,['dataCoverageExceeded']);assert.equal(evidence.result.blockedDate,'2028-01-01');
   assert.equal(Object.hasOwn(evidence.result,'finalEnd'),false);assert.equal(evidence.result.calendarExportAllowed,false);assert.equal(evidence.result.provenance.pathId,'gr-admin-ordered');assert.equal(evidence.result.provenance.releaseId,manifest.dataReleaseId);assert.ok(evidence.result.provenance.sourceRefs.length>0);
  }
 });
});

