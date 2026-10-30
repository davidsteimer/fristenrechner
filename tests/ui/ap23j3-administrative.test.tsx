// SPDX-License-Identifier: AGPL-3.0-only
// Real UI adapters and native Format14 context. No download or live source release.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import test from 'node:test';
import {buildSync} from 'esbuild';
import type * as Helpers from '../../src/ui/administrativeUi';
import type * as Export from '../../src/ui/administrativeExport';
import type * as Defaults from '../../src/ui/administrativeDefaults';
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
 export {ap23j3CandidateRuntime as runtime} from './src/release/ap23j3CandidateData';
 export {ap23i3CandidateRuntime as historicalRuntime} from './src/release/ap23i3CandidateData';
 setIconOptions({disableWarnings:true});
 export const fields=p=>renderToStaticMarkup(React.createElement('div',{className:'fr-form__grid'},React.createElement(AdministrativeProcedureFields,p)));
 export const result=p=>renderToStaticMarkup(React.createElement(AdministrativeResultView,p));
 export const automatic=p=>renderToStaticMarkup(React.createElement(AdministrativeAutomaticParameters,p));
`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,platform:'node',format:'cjs',write:false,external:['react','react-dom/server'],logLevel:'silent'});
const module={exports:{}};new Function('require','module','exports',bundle.outputFiles[0]!.text)(require,module,module.exports);
const ui=module.exports as typeof Helpers & typeof Export & typeof Defaults & typeof import('../../src/ui/socialUi') & {
 runtime:{administrativeContext:import('../../src/core/releaseFormat14').ParsedFormat14Data;data:Defaults.AdministrativeDefaultsContext['legacyData']};
 historicalRuntime:{administrativeContext:unknown;data:Defaults.AdministrativeDefaultsContext['legacyData']};
 fields(props:Helpers.AdministrativeProcedureFieldsProps):string;
 result(props:Helpers.AdministrativeResultViewProps):string;
 automatic(props:{catalog:Helpers.AdministrativeUiCatalog;lawId:string;state:Helpers.AdministrativeUiState;locale:'de'|'fr';context?:unknown}):string;
};
const context=ui.runtime.administrativeContext,catalog=context.administrativeCatalog;
const added=catalog.paths.filter(p=>'contractFamily'in p&&p.contractFamily==='qualifiedDayProcedureV7');
function state(pathId:string,qualified=true,alternatives=true):Helpers.AdministrativeUiState {
 const p=catalog.paths.find(p=>p.pathId===pathId)!;
 const policy=catalog.qualificationPolicies.find(q=>q.pathId===pathId);
 return{stage:p.stages[0]!,pathId,qualification:qualified?'generalActualReceipt':'',urgency:'none',
  ...((policy?.mode==='qualifiedDayProcedureV6'||policy?.mode==='qualifiedDayProcedureV7')&&alternatives?
   {currentValues:Object.fromEntries(policy.requirements.flatMap(r=>r.oneOf?[[r.key,String(r.oneOf[0])]]:[]))}: {})};
}
function qualify(pathId:string,received='2026-10-02',days=10,current=state(pathId)) {
 const p=catalog.paths.find(p=>p.pathId===pathId)!;
 return ui.qualifyAdministrativeUiInput({catalog,lawId:p.lawId,authorityCanton:catalog.laws.find(l=>l.lawId===p.lawId)!.canton,
  inputDate:received,deadlineDays:p.duration.kind==='statutoryDays'?p.duration.value:days,state:current});
}
function render(pathId:string,received='2026-10-02',locale:'de'|'fr'='de',days=10,current=state(pathId)) {
 const q=qualify(pathId,received,days,current);assert.deepEqual(q.errors,{});assert.ok(q.input);
 const result=ui.calculateAdministrativeUiDeadline(q.input,context);
 const html=ui.result({catalog,context,result,input:q.input,locale,calendarReference:'',onCalendarReferenceChange(){}});
 return{input:q.input,result,html,document:new JSDOM(html).window.document};
}
test('J3 all149 paths, all36 new qualifications and diagnostics have readable DE/FR copy',()=>{
 assert.equal(catalog.paths.length,149);assert.equal(added.length,36);
 assert.deepEqual(Object.keys(administrativeMessages.de).sort(),Object.keys(administrativeMessages.fr).sort());
 for(const p of catalog.paths)for(const locale of['de','fr']as const){
  const messages=administrativeMessages[locale] as Record<string,string>;
  assert.ok(messages['law.'+p.lawId]);assert.doesNotMatch(ui.administrativeActionLabel(p,locale),/^(action|path)\./);
  const presentation=ui.administrativeQualificationPresentation(catalog,p);
  assert.ok(messages[presentation.choiceKey]);assert.ok(messages[presentation.scopeKey]);
 }
 for(const q of catalog.qualificationPolicies)if(q.mode==='qualifiedDayProcedureV7')for(const r of q.requirements)
  for(const locale of['de','fr']as const)assert.ok((administrativeMessages[locale] as Record<string,string>)['administrative.'+r.reason],r.reason);
});
test('J3 every new path needs fresh grouped qualification and all explicit current alternatives',()=>{
 for(const p of added){
  assert.equal(qualify(p.pathId,'2026-10-02',10,state(p.pathId,false)).input,undefined,p.pathId);
  const policy=catalog.qualificationPolicies.find(q=>q.pathId===p.pathId)!;
  if(policy.mode!=='qualifiedDayProcedureV7')throw Error('V7');
  if(policy.requirements.some(r=>r.oneOf))assert.equal(qualify(p.pathId,'2026-10-02',10,state(p.pathId,true,false)).input,undefined,p.pathId);
  const q=qualify(p.pathId);assert.deepEqual(q.errors,{});assert.ok(q.input,p.pathId);
  assert.equal(q.input.qualification.delivery,'qualifiedTriggerAccordingToOpeningPolicy');
  for(const r of policy.requirements)assert.equal((q.input.caseQualification as Record<string,unknown>)[r.key],r.oneOf?r.oneOf[0]:r.value,p.pathId+':'+r.key);
  const result=ui.calculateAdministrativeUiDeadline(q.input,context);assert.equal(result.outcome,'calculated',p.pathId);
  assert.equal(ui.administrativeExportAvailable(q.input,context,result),false);
 }
});
test('J3 all113 old UI paths keep old delivery contract and calculate in authentic Format14',()=>{
 for(const p of catalog.paths.slice(0,113)){
  const q=qualify(p.pathId,'2026-10-02',p.duration.kind==='concretisedStatutoryDays'?7:10);assert.ok(q.input,p.pathId);
  assert.equal(q.input.qualification.delivery,'qualifiedActualDelivery',p.pathId);
  assert.equal(ui.calculateAdministrativeUiDeadline(q.input,context).outcome,'calculated',p.pathId);
 }
});
test('J3 exact current alternatives have no first-value default and no extra selector fields',()=>{
 for(const id of['ge-recours-30','fr-nontc-reclamation-30']){
  const p=catalog.paths.find(p=>p.pathId===id)!,policy=catalog.qualificationPolicies.find(q=>q.pathId===id)!;
  if(policy.mode!=='qualifiedDayProcedureV7')throw Error('V7');
  const html=ui.fields({catalog,lawId:p.lawId,locale:'de',value:state(id,false,false),onChange(){}}),doc=new JSDOM(html).window.document;
  assert.equal(doc.querySelectorAll('.fr-form__grid').length,1);assert.equal(doc.querySelector('input[type="checkbox"]'),null);
  assert.doesNotMatch(html,/Fristauslösendes Dokument|Massgeblicher Feiertagskanton|Zielgericht wählen|Gemeinde wählen/);
  for(const r of policy.requirements)if(r.oneOf)for(const value of r.oneOf)
   assert.ok(qualify(id,'2026-10-02',10,{...state(id),currentValues:{[r.key]:String(value)}}).input);
 }
 for(const value of[{}, {openingMode:'unknown'}, {openingMode:'ordinaryPostPhysicalReceipt',invented:'true'},Object.create({openingMode:'qualifiedLegalOpening'})]){
  assert.equal(qualify('ge-recours-30','2026-10-02',30,{...state('ge-recours-30'),currentValues:value}).input,undefined);
 }
 let invoked=false;const values:Record<string,string>={};Object.defineProperty(values,'openingMode',{enumerable:true,get(){invoked=true;return'qualifiedLegalOpening';}});
 assert.equal(qualify('ge-recours-30','2026-10-02',30,{...state('ge-recours-30'),currentValues:values}).input,undefined);assert.equal(invoked,false);
});
test('J3 FR reclamation copy excludes only divergent special procedure, not a qualified CPJA fallback',()=>{
 for(const locale of['de','fr']as const){
  const messages=administrativeMessages[locale] as Record<string,string>;
  const text=messages['case.v7.fr-nontc-reclamation-30'];
  assert.equal(typeof text,'string');
  if(text===undefined)throw Error('Missing FR reclamation copy');
  assert.match(text,locale==='de'?/kein abweichendes Spezialverfahren/:/sans procédure spéciale dérogatoire/);
  assert.doesNotMatch(text,locale==='de'?/kein Spezialverfahren$/:/sans procédure spéciale$/);
 }
});
test('J3 GE physical Saturday and qualified legal Saturday stay distinct in result and readable trace',()=>{
 for(const locale of['de','fr']as const)for(const mode of['qualifiedLegalOpening','ordinaryPostPhysicalReceipt']){
  const r=render('ge-recours-30','2026-09-05',locale,30,{...state('ge-recours-30'),currentValues:{openingMode:mode}});
  assert.equal(r.result.outcome,'calculated');if(r.result.outcome!=='calculated')throw Error('date');
  assert.equal(r.result.finalEnd,mode==='qualifiedLegalOpening'?'2026-10-05':'2026-10-07');
  assert.equal(r.result.provenance.openingResolution?.qualifiedOpeningDate,mode==='qualifiedLegalOpening'?'2026-09-05':'2026-09-07');
  const trace=r.document.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!;
  assert.doesNotMatch(trace,/SRC-|JUD-|qualifiedDayProcedure|case\.|scope\.|v7\./);
  assert.match(trace,/05\.09\.2026/);assert.match(trace,mode==='ordinaryPostPhysicalReceipt'?/07\.09\.2026/:/05\.09\.2026/);
  assert.equal(r.document.querySelector('.fr-calendar-export'),null);
 }
});
test('J3 FR two periods differ from TC three periods without adding fields or manual holiday choices',()=>{
 for(const[id,end]of[['fr-nontc-ordered','2027-07-15'],['fr-tc-ordered','2027-08-16']]as const){
  const r=render(id,'2027-07-14','de',1);assert.equal(r.result.outcome,'calculated');if(r.result.outcome!=='calculated')throw Error('date');
  assert.equal(r.result.finalEnd,end);
  const p=catalog.paths.find(p=>p.pathId===id)!;
  const html=ui.automatic({catalog,lawId:p.lawId,locale:'de',state:state(id),context});
  assert.match(html,id==='fr-nontc-ordered'?/kein Sommerstillstand/:/15\. Juli/);
  assert.doesNotMatch(html,/v7\.|SRC-/);
 }
});
test('J3 FR actual norm segment names do not display the inactive whole CPJA version',()=>{
 for(const[received,active,inactive]of[['2026-09-02','7947','8637'],['2026-10-02','8637','7947']]as const){
  const r=render('fr-nontc-ordered',received,'de',1),trace=r.document.querySelector('[data-testid="administrative-readable-trace"]')!;
  const links=[...trace.querySelectorAll('a')].map((e:HTMLAnchorElement)=>e.href);
  assert.ok(links.some((href:string)=>href.includes(active)));assert.ok(!links.some((href:string)=>href.includes(inactive)));
 }
});
test('J3 JU oral confirmation and motivation remain own requests with no invented followup',()=>{
 for(const[id,received,end]of[
  ['ju-confirmation-request5-initial','2026-12-17','2026-12-22'],
  ['ju-confirmation-request5-review','2026-12-17','2027-01-07'],
  ['ju-confirmation-request5-provisional','2026-12-17','2026-12-22'],
  ['ju-motivation-request30-initial','2026-10-02','2026-11-02']]as const){
  const r=render(id,received);assert.equal(r.result.outcome,'calculated');if(r.result.outcome!=='calculated')throw Error('date');
  assert.equal(r.result.finalEnd,end);
  const trace=r.document.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!;
  assert.match(trace,/Berechnet wird nur dieses Verlangen/);assert.equal(r.result.provenance.openingResolution?.inputDate,received);
  assert.equal(r.result.provenance.openingResolution?.qualifiedOpeningDate,received);
 }
});
test('J3 no export on source-window or end-shift collision boundaries and no ambiguous fallback trace',()=>{
 for(const[id,received]of[['ge-recours-10','2027-03-10'],['fr-nontc-ordered','2027-12-31']]as const){
  const r=render(id,received,'de',1);assert.notEqual(r.result.outcome,'calculated');assert.equal(r.document.querySelector('.fr-calendar-export'),null);
 }
});
test('J3 defaults5 keeps only stable GE path and never current mode date reference or qualification',()=>{
 const defaultContext={legacyData:ui.runtime.data,administrativeData:context},storageMap=new Map<string,string>();
 const storage={getItem:(k:string)=>storageMap.get(k)??null,setItem:(k:string,v:string)=>{storageMap.set(k,v);}};
 const raw={...ui.emptyAdministrativePreferences(),authorityCode:'GE',deadlineDays:30,deliveryMethod:'otherLegallyRelevantDate',
  procedureSelection:{kind:'cantonalAdministrative',lawId:'lpa-ge',pathId:'ge-recours-30',revision:1,stage:'administrativeAppeal'},
  currentValues:{openingMode:'ordinaryPostPhysicalReceipt'},caseQualification:{authorityScope:'cantonal'},inputDate:'2026-09-05',calendarReference:'QA-J3'};
 assert.equal(ui.saveAdministrativeDefaults(defaultContext,storage,raw).persistence,'stored');
 const saved=storageMap.get('fristenrechner.defaults.v5')!;assert.doesNotMatch(saved,/openingMode|ordinaryPostPhysicalReceipt|currentValues|caseQualification|inputDate|2026-09-05|QA-J3/);
 assert.equal(JSON.parse(saved).preferences.procedureSelection.pathId,'ge-recours-30');
 const historical={legacyData:ui.historicalRuntime.data,administrativeData:ui.historicalRuntime.administrativeContext} as Defaults.AdministrativeDefaultsContext;
 assert.equal(ui.initializeAdministrativeDefaults(historical,storage).reason,'unsupportedSelection');
 const before=storageMap.get('fristenrechner.defaults.v5');ui.resetAdministrativeDefaults(historical,storage);assert.equal(storageMap.get('fristenrechner.defaults.v5'),before);
});
test('J3 source-compatible social catalog remains visible but no new social canton or release is inferred',()=>{
 assert.equal(ui.hasSocialUi(ui.runtime.data),true);assert.equal(ui.runtime.data.formatVersion,'14.0.0');
});

