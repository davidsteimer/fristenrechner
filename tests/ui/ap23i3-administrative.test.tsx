// SPDX-License-Identifier: AGPL-3.0-only
// Genuine Format-13 contexts, native calculations and shared rendered DE/FR UI.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {test} from 'node:test';
import {buildSync} from 'esbuild';
import type * as Helpers from '../../src/ui/administrativeUi';
import type * as Export from '../../src/ui/administrativeExport';
import type * as Defaults from '../../src/ui/administrativeDefaults';
import type {ParsedFormat13Data} from '../../src/core/releaseFormat13';
import type {AdministrativeDeadlineInput} from '../../src/core/administrativeDeadline';
import {administrativeMessages} from '../../src/ui/administrativeMessages';
const require=createRequire(import.meta.url),{JSDOM}=require('jsdom');
const bundle=buildSync({stdin:{contents:`
 import React from 'react';
 import {renderToStaticMarkup} from 'react-dom/server';
 import {setIconOptions} from '@fluentui/react/lib/Styling';
 import {AdministrativeProcedureFields,AdministrativeResultView,AdministrativeAutomaticParameters} from './src/ui/administrativeUi';
 export * from './src/ui/administrativeUi';
 export * from './src/ui/administrativeExport';
 export * from './src/ui/administrativeDefaults';
 export * from './src/ui/socialUi';
 export {ap23i3CandidateRuntime as runtime} from './src/release/ap23i3CandidateData';
 export {ap23h3CandidateRuntime as historicalRuntime} from './src/release/ap23h3CandidateData';
 setIconOptions({disableWarnings:true});
 export const fields=p=>renderToStaticMarkup(React.createElement('div',{className:'fr-form__grid'},React.createElement(AdministrativeProcedureFields,p)));
 export const result=p=>renderToStaticMarkup(React.createElement(AdministrativeResultView,p));
 export const automatic=p=>renderToStaticMarkup(React.createElement(AdministrativeAutomaticParameters,p));
`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,platform:'node',format:'cjs',write:false,external:['react','react-dom/server'],logLevel:'silent'});
const module={exports:{}};new Function('require','module','exports',bundle.outputFiles[0]!.text)(require,module,module.exports);
const ui=module.exports as typeof Helpers & typeof Export & typeof Defaults & typeof import('../../src/ui/socialUi') & {
 runtime:{administrativeContext:ParsedFormat13Data;data:Defaults.AdministrativeDefaultsContext['legacyData']};
 historicalRuntime:Defaults.AdministrativeDefaultsContext & {administrativeContext:unknown;data:Defaults.AdministrativeDefaultsContext['legacyData']};
 fields(props:Helpers.AdministrativeProcedureFieldsProps):string;
 result(props:Helpers.AdministrativeResultViewProps):string;
 automatic(props:{catalog:Helpers.AdministrativeUiCatalog;lawId:string;state:Helpers.AdministrativeUiState;locale:'de'|'fr';context?:unknown}):string;
};
const context=ui.runtime.administrativeContext,catalog=context.administrativeCatalog;
const added=catalog.paths.filter(p=>'contractFamily'in p&&p.contractFamily==='qualifiedDayProcedureV6');
const facts=(value:unknown)=>value as Record<string,string|number|boolean>;
function state(pathId:string,qualified=true,alternatives=true):Helpers.AdministrativeUiState{
 const p=catalog.paths.find(p=>p.pathId===pathId)!;
 const policy=catalog.qualificationPolicies.find(q=>q.pathId===pathId);
 return{stage:p.stages[0]!,pathId,qualification:qualified?'generalActualReceipt':'',urgency:'none',
  ...(policy?.mode==='qualifiedDayProcedureV6'&&alternatives?{currentValues:Object.fromEntries(policy.requirements.flatMap(r=>r.oneOf?[[r.key,String(r.oneOf[0])]]:[]))}: {})};
}
function qualify(pathId:string,received='2026-10-02',days=7,current=state(pathId)){
 const p=catalog.paths.find(p=>p.pathId===pathId)!;
 return ui.qualifyAdministrativeUiInput({catalog,lawId:p.lawId,authorityCanton:catalog.laws.find(l=>l.lawId===p.lawId)!.canton,
  inputDate:received,deadlineDays:p.duration.kind==='statutoryDays'?p.duration.value:days,state:current});
}
function render(pathId:string,received='2026-10-02',locale:'de'|'fr'='de',days=7,current=state(pathId)){
 const q=qualify(pathId,received,days,current);assert.deepEqual(q.errors,{});assert.ok(q.input);
 const result=ui.calculateAdministrativeUiDeadline(q.input,context);
 const html=ui.result({catalog,context,result,input:q.input,locale,calendarReference:'',onCalendarReferenceChange(){}});
 return{input:q.input,result,html,document:new JSDOM(html).window.document};
}

test('I3 all 113 path labels and V6 current qualification texts and diagnostics are readable in DE FR',()=>{
 assert.equal(catalog.paths.length,113);assert.equal(added.length,34);
 assert.deepEqual(Object.keys(administrativeMessages.de).sort(),Object.keys(administrativeMessages.fr).sort());
 for(const p of catalog.paths)for(const locale of ['de','fr']as const){
  const messages=administrativeMessages[locale]as Record<string,string>;
  assert.ok(messages[`law.${p.lawId}`]);assert.doesNotMatch(ui.administrativeActionLabel(p,locale),/^(action|path)\./);
  const presentation=ui.administrativeQualificationPresentation(catalog,p);
  assert.ok(messages[presentation.choiceKey]);assert.ok(messages[presentation.scopeKey]);
 }
 for(const policy of catalog.qualificationPolicies)if(policy.mode==='qualifiedDayProcedureV6')for(const r of policy.requirements)
  for(const locale of ['de','fr']as const)assert.ok((administrativeMessages[locale]as Record<string,string>)[`administrative.${r.reason}`],r.reason);
});

test('I3 all 34 paths require a current positive grouped qualification and exact current alternative values',()=>{
 for(const p of added){
  assert.equal(qualify(p.pathId,'2026-10-02',7,state(p.pathId,false)).input,undefined,p.pathId);
  const policy=catalog.qualificationPolicies.find(q=>q.pathId===p.pathId)!;assert.equal(policy.mode,'qualifiedDayProcedureV6');
  if(policy.mode!=='qualifiedDayProcedureV6')continue;
  if(policy.requirements.some(r=>r.oneOf))assert.equal(qualify(p.pathId,'2026-10-02',7,state(p.pathId,true,false)).input,undefined,p.pathId);
  const q=qualify(p.pathId);assert.deepEqual(q.errors,{});assert.ok(q.input,p.pathId);
  for(const r of policy.requirements)assert.equal(facts(q.input.caseQualification)[r.key],r.oneOf?r.oneOf[0]:r.value,`${p.pathId}:${r.key}`);
  const result=ui.calculateAdministrativeUiDeadline(q.input,context);assert.equal(result.outcome,'calculated',p.pathId);
  assert.equal(ui.administrativeExportAvailable(q.input,context,result),false);
 }
});

test('I3 old 79 UI paths still emit their original current facts and calculate through the authentic new context',()=>{
 for(const p of catalog.paths.slice(0,79)){
  const q=qualify(p.pathId,'2026-10-02',10);assert.ok(q.input,p.pathId);
  assert.equal(ui.calculateAdministrativeUiDeadline(q.input,context).outcome,'calculated',p.pathId);
 }
});

test('I3 oneOf values are selected separately and no irrelevant or malformed current values qualify',()=>{
 for(const id of ['tg-rr-30','tg-rekurs-shortened','tg-vg-execution-5']){
  const p=catalog.paths.find(p=>p.pathId===id)!,policy=catalog.qualificationPolicies.find(q=>q.pathId===id)!;
  if(policy.mode!=='qualifiedDayProcedureV6')throw Error('V6');
  for(const r of policy.requirements)if(r.oneOf)for(const value of r.oneOf){
   const s=state(id);const q=qualify(id,'2026-10-02',7,{...s,currentValues:{...s.currentValues,[r.key]:String(value)}});assert.ok(q.input,`${id}:${value}`);
  }
  const html=ui.fields({catalog,lawId:p.lawId,locale:'de',value:state(id,false,false),onChange(){}}),document=new JSDOM(html).window.document;
  assert.equal(document.querySelectorAll('.fr-form__grid').length,1);assert.equal(document.querySelector('input[type="checkbox"]'),null);
  assert.doesNotMatch(html,/Fristauslösendes Dokument|Massgeblicher Feiertagskanton|Zielgericht wählen|Gemeinde wählen/);
 }
 for(const values of [{exceptionNotice:'incomplete'},{regierungsratCompetenceBasis:'vrg55Abs1Nr8Qualified'},Object.create({exceptionNotice:'given'})]){
  assert.equal(qualify('gl-admin-30','2026-10-02',30,{...state('gl-admin-30'),currentValues:values}).input,undefined);
 }
 let invoked=false;const values:Record<string,string>={};Object.defineProperty(values,'exceptionNotice',{enumerable:true,get(){invoked=true;return'given';}});
 assert.equal(qualify('tg-vg-execution-5','2026-10-02',5,{...state('tg-vg-execution-5'),currentValues:values}).input,undefined);assert.equal(invoked,false);
});

test('I3 concrete statutory ranges reject missing NaN null fraction and out-of-range input without a default',()=>{
 for(const[id,min,max]of[['gl-admin-shortened-end',2,29],['gl-court-shortened-interim',2,9],['tg-rekurs-shortened',5,29]]as const){
  const p=catalog.paths.find(p=>p.pathId===id)!;
  for(const value of [undefined,NaN,null,0,1.5,min-1,max+1]){
   const q=ui.qualifyAdministrativeUiInput({catalog,lawId:p.lawId,authorityCanton:id.startsWith('gl')?'GL':'TG',inputDate:'2026-10-02',deadlineDays:value as number,state:state(id)});
   assert.equal(q.input,undefined,`${id}:${value}`);assert.ok(q.errors.deadlineDays);
  }
  for(const value of [min,max])assert.ok(qualify(id,'2026-10-02',value).input);
 }
 const fixed=qualify('tg-vg-execution-5').input!;assert.equal(fixed.deadlineDays,5);
});

test('I3 stage and path transitions clear current alternatives and positive qualification',()=>{
 const current=state('tg-vg-execution-5');assert.equal(current.currentValues?.exceptionNotice,'given');
 for(const[field,value]of[['pathId','tg-vg-provisional-30'],['stage','administrativeAppeal']]as const){
  const changed=ui.changeAdministrativeSelection(catalog,'vrg-tg',current,field,value);
  assert.equal(changed.currentValues,undefined);assert.equal(changed.qualification,'');
 }
});

test('I3 TG notice alternatives change actual native profiles and readable trace, never a fake fixed profile',()=>{
 for(const locale of ['de','fr']as const){
  const given=render('tg-vg-execution-5','2026-12-14',locale),s=state('tg-vg-execution-5');
  const absent=render('tg-vg-execution-5','2026-12-14',locale,5,{...s,currentValues:{exceptionNotice:'absent'}});
  assert.equal(given.result.outcome,'calculated');assert.equal(absent.result.outcome,'calculated');
  if(given.result.outcome!=='calculated'||absent.result.outcome!=='calculated')throw Error('dated');
  assert.equal(given.result.finalEnd,'2026-12-21');assert.equal(absent.result.finalEnd,'2027-01-04');
  assert.equal(given.result.provenance.suspensionProfileId,'tg-none');assert.equal(absent.result.provenance.suspensionProfileId,'tg-three');
  assert.notEqual(given.result.provenance.suspensionProfileSha256,absent.result.provenance.suspensionProfileSha256);
  for(const v of [given,absent]){const trace=v.document.querySelector('[data-testid="administrative-readable-trace"]')!;
   assert.doesNotMatch(trace.textContent!,/SRC-|JUD-|CH-CAL-|case\.|scope\.|tg-three|tg-none/);
   assert.ok(trace.querySelectorAll('a[href^="https://"]').length>0);assert.match(trace.textContent!,/86/);
   assert.equal(v.document.querySelector('.fr-calendar-export'),null);
  }
  assert.match(given.document.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!,locale==='de'?/eindeutig vorhanden/:/clairement présente/);
  assert.match(absent.document.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!,locale==='de'?/vollständig fehlend/:/entièrement absente/);
 }
});

test('I3 automatic parameters resolve only explicit notice alternatives and retain authority-seat holiday binding',()=>{
 const id='tg-vg-execution-5',s=state(id),p=catalog.paths.find(p=>p.pathId===id)!;
 for(const[value,expected]of[['given',/Kein Friststillstand/],['absent',/Ostern/],['unknown',/Noch nicht/],['',/Noch nicht/]]as const){
  const html=ui.automatic({catalog,lawId:p.lawId,context,locale:'de',state:{...s,currentValues:{exceptionNotice:value}}});
  const doc=new JSDOM(html).window.document;assert.match(doc.querySelector('dl')!.textContent!,expected);
  assert.equal(doc.querySelector('[role="combobox"]'),null);
 }
});

test('I3 V5 preferences never retain concrete shortened days or any current case facts',()=>{
 const defaultsContext={legacyData:ui.runtime.data,administrativeData:context};
 const input=qualify('tg-rekurs-shortened','2026-10-02',7).input!;
 const clean=ui.sanitizeAdministrativePreferences(defaultsContext,{...ui.emptyAdministrativePreferences(),authorityCode:'TG',deadlineDays:7,
  deliveryMethod:'otherLegallyRelevantDate',procedureSelection:input.selection,inputDate:'2026-10-02',caseQualification:input.caseQualification,
  currentValues:{shorteningGround:'provisionalMeasure'},calendarReference:'SYNTHETIC-CURRENT'});
 assert.equal(clean.deadlineDays,ui.emptyAdministrativePreferences().deadlineDays);assert.notEqual(clean.deadlineDays,7);
 const values=new Map<string,string>(),storage={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);}};
 assert.equal(ui.saveAdministrativeDefaults(defaultsContext,storage,clean).persistence,'stored');
 assert.deepEqual(ui.initializeAdministrativeDefaults(defaultsContext,storage).preferences.procedureSelection,input.selection);
 assert.doesNotMatch(values.get(ui.ADMINISTRATIVE_DEFAULTS_STORAGE_KEY)!,/currentValues|caseQualification|inputDate|exceptionNotice|shorteningGround|SYNTHETIC|2026-10-02/);
 const before=values.get(ui.ADMINISTRATIVE_DEFAULTS_STORAGE_KEY);
 const historical={legacyData:ui.historicalRuntime.data,administrativeData:ui.historicalRuntime.administrativeContext as Defaults.AdministrativeDefaultsContext['administrativeData']};
 assert.equal(ui.initializeAdministrativeDefaults(historical,storage).persistence,'protected');assert.equal(values.get(ui.ADMINISTRATIVE_DEFAULTS_STORAGE_KEY),before);
});

test('I3 specific collisions and forged exports remain blocked without a Tessin mislabel',()=>{
 for(const id of ['gl-admin-30','tg-vg-30'])for(const locale of ['de','fr']as const){
  const v=render(id,'2027-02-18',locale);assert.equal(v.result.outcome,'blocked');assert.equal(v.document.querySelector('.fr-calendar-export'),null);
  assert.doesNotMatch(v.html,/Tessiner Grenzfall|cas limite tessinois/);
 }
 const v=render('gl-admin-30');assert.equal(v.result.outcome,'calculated');if(v.result.outcome!=='calculated')return;
 const forged={...v.result,referenceOnly:false,calendarExportAllowed:true};
 assert.equal(ui.administrativeExportAvailable(v.input,context,forged),false);
 assert.throws(()=>ui.createAdministrativeCalendarEntry({input:v.input,context,result:forged,locale:'de'}),/calendarExportNotBound/);
});

test('I3 compatibility does not remove the existing eleven social laws or permit future formats',()=>{
 assert.equal(ui.hasSocialUi(ui.runtime.data),true);assert.equal(ui.hasSocialUi(ui.historicalRuntime.data),true);
 assert.equal(ui.SOCIAL_UI_LAWS.length,11);assert.equal(ui.hasSocialUi({...ui.runtime.data,formatVersion:'99.0.0'}),false);
});
