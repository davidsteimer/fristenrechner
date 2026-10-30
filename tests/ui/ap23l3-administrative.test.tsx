// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {buildSync} from 'esbuild';
import type * as Helpers from '../../src/ui/administrativeUi';
import type * as Export from '../../src/ui/administrativeExport';
import type * as Defaults from '../../src/ui/administrativeDefaults';
import {administrativeMessages} from '../../src/ui/administrativeMessages';
const require=createRequire(import.meta.url),{JSDOM}=require('jsdom');
const bundle=buildSync({stdin:{contents:`
 import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';
 import {setIconOptions} from '@fluentui/react/lib/Styling';
 import {AdministrativeProcedureFields,AdministrativeResultView,AdministrativeAutomaticParameters} from './src/ui/administrativeUi';
 export * from './src/ui/administrativeUi';export * from './src/ui/administrativeExport';export * from './src/ui/administrativeDefaults';
 export {ap23l3CandidateRuntime as runtime} from './src/release/ap23l3CandidateData';
 export {ap23k3CandidateRuntime as historicalRuntime} from './src/release/ap23k3CandidateData';
 setIconOptions({disableWarnings:true});
 export const fields=p=>renderToStaticMarkup(React.createElement('div',{className:'fr-form__grid'},React.createElement(AdministrativeProcedureFields,p)));
 export const result=p=>renderToStaticMarkup(React.createElement(AdministrativeResultView,p));
 export const automatic=p=>renderToStaticMarkup(React.createElement(AdministrativeAutomaticParameters,p));
`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,platform:'node',format:'cjs',write:false,external:['react','react-dom/server'],logLevel:'silent'});
const module={exports:{}};new Function('require','module','exports',bundle.outputFiles[0]!.text)(require,module,module.exports);
const ui=module.exports as typeof Helpers & typeof Export & typeof Defaults & {
 runtime:{administrativeContext:import('../../src/core/releaseFormat16').ParsedFormat16Data;data:Defaults.AdministrativeDefaultsContext['legacyData']};
 historicalRuntime:{administrativeContext:import('../../src/core/releaseFormat15').ParsedFormat15Data;data:Defaults.AdministrativeDefaultsContext['legacyData']};
 fields(props:Helpers.AdministrativeProcedureFieldsProps):string;result(props:Helpers.AdministrativeResultViewProps):string;
 automatic(props:{catalog:Helpers.AdministrativeUiCatalog;lawId:string;state:Helpers.AdministrativeUiState;locale:'de'|'fr';context?:unknown}):string;
};
const context=ui.runtime.administrativeContext,catalog=context.administrativeCatalog;
type Reference={id:string;path:string;trigger:string;days:number;facts:Record<string,unknown>;expected:{outcome:string;end?:string}};
const refs=JSON.parse(readFileSync('docs/fachrecht/ap23l1/referenzfaelle.json','utf8')).cases as Reference[];
const added=catalog.paths.filter(path=>'contractFamily'in path&&path.contractFamily==='qualifiedDayProcedureV9');
function state(pathId:string,qualified=true,facts?:Record<string,unknown>):Helpers.AdministrativeUiState{
 const path=catalog.paths.find(path=>path.pathId===pathId)!;const policy=catalog.qualificationPolicies.find(row=>row.pathId===pathId);
 const currentValues=policy&&'requirements'in policy&&Array.isArray(policy.requirements)?Object.fromEntries(policy.requirements.flatMap(row=>'oneOf'in row&&row.oneOf?[[row.key,String(facts?.[row.key]??row.oneOf[0])]]:[])):{};
 const dynamic=catalog.holidayBindings.some(binding=>binding.holidayBindingId===path.holidayBindingId&&'calendarSelection'in binding&&binding.calendarSelection.kind==='qualifiedPartyOrRepresentativeCanton');
 return{stage:path.stages[0]!,pathId,qualification:qualified?'generalActualReceipt':'',urgency:'none',currentValues,...(dynamic?{legalAnchorCanton:'BS',areaFacts:{}}:{})};
}
function qualify(pathId:string,received='2026-10-02',days=10,current=state(pathId)){
 const path=catalog.paths.find(path=>path.pathId===pathId)!;
 return ui.qualifyAdministrativeUiInput({catalog,lawId:path.lawId,authorityCanton:catalog.laws.find(row=>row.lawId===path.lawId)!.canton,
  inputDate:received,deadlineDays:path.duration.kind==='statutoryDays'?path.duration.value:days,state:current});
}
function render(pathId:string,received='2026-10-02',locale:'de'|'fr'='de',days=10,current=state(pathId)){
 const q=qualify(pathId,received,days,current);assert.deepEqual(q.errors,{});assert.ok(q.input,pathId);
 const result=ui.calculateAdministrativeUiDeadline(q.input,context),html=ui.result({catalog,context,result,input:q.input,locale,calendarReference:'',onCalendarReferenceChange(){}});
 return{input:q.input,result,html,document:new JSDOM(html).window.document};
}
test('L3 complete DE/FR labels and original current qualification reasons are readable',()=>{
 assert.equal(catalog.paths.length,196);assert.equal(added.length,31);assert.deepEqual(Object.keys(administrativeMessages.de).sort(),Object.keys(administrativeMessages.fr).sort());
 for(const path of catalog.paths)for(const locale of['de','fr']as const){const copy=administrativeMessages[locale]as Record<string,string>;
  const keys=ui.administrativeQualificationPresentation(catalog,path);assert.ok(copy[keys.choiceKey]);assert.ok(copy[keys.scopeKey]);
  assert.doesNotMatch(ui.administrativeActionLabel(path,locale),/^(?:action|path)\./);
 }
 for(const path of added){const policy=catalog.qualificationPolicies.find(row=>row.pathId===path.pathId)!;if(policy.mode!=='qualifiedDayProcedureV9')throw Error('V9');
  for(const row of policy.requirements)for(const locale of['de','fr']as const)assert.ok((administrativeMessages[locale]as Record<string,string>)['administrative.'+row.reason],row.reason);
 }
});
for(const ref of refs.filter(ref=>ref.expected.outcome==='datedResearchValue'))test('L3 UI current case '+ref.id+' matches accepted date',()=>{
 const path=added.find(path=>path.researchRef===ref.path)!;assert.ok(path);const current=state(path.pathId,true,ref.facts);
 const q=qualify(path.pathId,ref.trigger,ref.days,current);assert.deepEqual(q.errors,{});assert.ok(q.input);
 assert.equal(q.input.qualification.delivery,'qualifiedTriggerAccordingToOpeningPolicy');
 const result=ui.calculateAdministrativeUiDeadline(q.input,context);assert.equal(result.outcome,'calculated');
 if(result.outcome!=='calculated')throw Error('Calculated');assert.equal(result.finalEnd,ref.expected.end);assert.equal(result.referenceOnly,true);
 assert.equal(ui.administrativeExportAvailable(q.input,context,result),false);
});
test('L3 all31 paths require a new positive qualification and true alternatives',()=>{
 for(const path of added){const ref=refs.find(ref=>ref.path===path.researchRef&&ref.expected.outcome==='datedResearchValue')!;
  assert.equal(qualify(path.pathId,ref.trigger,ref.days,state(path.pathId,false,ref.facts)).input,undefined);
  const blank={...state(path.pathId,true),currentValues:{}};const policy=catalog.qualificationPolicies.find(row=>row.pathId===path.pathId)!;
  if(policy.mode!=='qualifiedDayProcedureV9')throw Error('V9');
  if(policy.requirements.some(row=>row.oneOf&&row.oneOf.length>1))assert.equal(qualify(path.pathId,ref.trigger,ref.days,blank).input,undefined);
 }
});
test('L3 singleton alternatives remain fixed values with no fake selection',()=>{
 for(const id of['sz-admin-provisional-opposition','sz-court-execution-10-exempt'])for(const locale of['de','fr']as const){
  const path=added.find(row=>row.pathId===id)!,s={...state(id,false),currentValues:{}};
  const doc=new JSDOM(ui.fields({catalog,lawId:path.lawId,locale,value:s,onChange(){}})).window.document;
  const fixed=Array.from(doc.querySelectorAll('output')).map((row:any)=>row.textContent).join(' ');
  assert.match(fixed,locale==='de'?/Massnahme|Bauvollstreckungsweiterzug/:/mesure|exécution/i);
  assert.equal(Array.from(doc.querySelectorAll('[role="combobox"]')).some((row:any)=>/Stillstandsausnahme|Exception applicable/.test(row.getAttribute('aria-label')??'')),false);
  assert.equal(doc.querySelector('input[type="checkbox"]'),null);
 }
});
test('L3 two columns and only relevant date semantics, no document or calendar picker',()=>{
 for(const path of added){const html=ui.fields({catalog,lawId:path.lawId,locale:'de',value:state(path.pathId,false),onChange(){}});
  assert.doesNotMatch(html,/Fristauslösendes Dokument|Massgeblicher Feiertagskanton|Zielgericht wählen|type="checkbox"|v9\.(?:fact|value)/);
  assert.match(html,/fr-form__grid/);
 }
});
test('L3 tracking is current, branch-specific and cannot be supplied through preferences',()=>{
 const current=state('ai-admin-ordered',true,{openingMode:'trackingPhysicalReceipt',noticeStatus:'regularNoDeviation'});
 const q=qualify('ai-admin-ordered','2026-09-19',10,current);assert.ok(q.input);
 const facts=q.input.caseQualification as Record<string,unknown>;assert.equal(facts.expectedService,true);assert.equal(facts.entryIntoSphere,'verified');assert.equal(facts.receiptHolidayRegime,'sameAsBoundAuthorityCalendar');
 const qualified=qualify('ai-admin-ordered','2026-09-19',10,state('ai-admin-ordered'));assert.ok(qualified.input);
 for(const key of['expectedService','entryIntoSphere','receiptHolidayRegime'])assert.equal(Object.hasOwn(qualified.input.caseQualification??{},key),false);
 const changed=ui.changeAdministrativeSelection(catalog,'ai-general-administrative',current,'pathId','ai-court-ordered');assert.equal(changed.qualification,'');assert.equal(changed.currentValues,undefined);
});
test('L3 explicit date meaning includes fixed qualified triggers and never invents a mode before choice',()=>{
 const trackingPath=added.find(path=>path.pathId==='ai-admin-ordered')!,oralPath=added.find(path=>path.pathId==='ai-admin-written-7')!;
 assert.equal(ui.administrativeDateMeaning(trackingPath,{...state(trackingPath.pathId),currentValues:{}}),undefined);
 assert.equal(ui.administrativeDateMeaning(trackingPath,state(trackingPath.pathId,true,{openingMode:'trackingPhysicalReceipt'})),'trackingPhysicalReceipt');
 assert.equal(ui.administrativeDateMeaning(oralPath,{...state(oralPath.pathId),currentValues:{}}),'qualifiedLegalOpening');
});
test('L3 longer notice and max10 use actual current number and ordinary base',()=>{
 const s=state('ai-internal-notice-long',true,{openingMode:'qualifiedLegalOpening',ordinaryStatutoryDays:10});
 const q=qualify('ai-internal-notice-long','2026-10-02',45,s);assert.ok(q.input);assert.equal((q.input.caseQualification as Record<string,unknown>).actualLongerInstructionDays,45);
 assert.equal((q.input.caseQualification as Record<string,unknown>).ordinaryStatutoryDays,10);
 for(const days of[0,15,30,366])assert.equal(qualify('ai-internal-notice-long','2026-10-02',days,s).input,undefined);
 for(const days of[0,11,365])assert.equal(qualify('sz-admin-provisional-opposition','2026-10-02',days).input,undefined);
 for(const days of[1,5,10])assert.ok(qualify('sz-admin-provisional-opposition','2026-10-02',days).input);
});
test('L3 readable AI tracking and long notice trace distinguish actual dates and avoid raw technical labels',()=>{
 for(const locale of['de','fr']as const){
  const r=render('ai-admin-ordered','2026-09-19',locale,10,state('ai-admin-ordered',true,{openingMode:'trackingPhysicalReceipt',noticeStatus:'regularNoDeviation'}));
  assert.equal(r.result.outcome,'calculated');const text=r.document.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!;
  assert.match(text,/19\.09\.2026/);assert.match(text,/21\.09\.2026/);assert.doesNotMatch(text,/SRC-|JUD-|CH-CAL-|Aktuelle Fachqualifikation|Primary enacted|qualifiedDayProcedure|v9\./);
  assert.match(text,locale==='de'?/Tag nach der rechtlich massgebenden Eröffnung/:/Jour suivant la notification juridiquement déterminante/);
  assert.doesNotMatch(text,/Tag nach dem Empfang|Jour suivant la réception/);
  assert.ok(r.document.querySelector('.fr-trace__opening'));assert.equal(r.document.querySelector('.fr-calendar-export'),null);
  const longer=render('ai-internal-notice-long','2026-10-02',locale,45,state('ai-internal-notice-long',true,{openingMode:'qualifiedLegalOpening',ordinaryStatutoryDays:10}));
  assert.match(longer.document.querySelector('[data-testid="administrative-current-notice-trace"]')!.textContent!,/10.*45/);
 }
});
test('L3 Martinstag is readable supplementary end shift, not a physical holiday or recess',()=>{
 for(const locale of['de','fr']as const){const r=render('sz-admin-ordered','2026-11-10',locale,1);
  assert.equal(r.result.outcome,'calculated');if(r.result.outcome!=='calculated')throw Error('Calculated');assert.equal(r.result.finalEnd,'2026-11-12');assert.equal(r.result.skippedCalendarDays,0);
  assert.deepEqual(r.result.provenance.proceduralCalendarSupplementResolution?.shiftedDates,['2026-11-11']);
  assert.match(r.document.querySelector('[data-testid="administrative-procedural-supplement-trace"]')!.textContent!,locale==='de'?/Martinstag/:/Saint-Martin/);
  assert.doesNotMatch(r.document.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!,/SRC-|JUD-|administrativeProceduralSupplement|v9\./);
 }
});
test('L3 all165 historical UI paths still qualify and calculate with genuine V16 context',()=>{
 for(const path of catalog.paths.slice(0,165)){const q=qualify(path.pathId,'2026-10-02',path.duration.kind==='concretisedStatutoryDays'?7:10);assert.ok(q.input,path.pathId);
  assert.equal(ui.calculateAdministrativeUiDeadline(q.input,context).outcome,'calculated',path.pathId);
 }
});
test('L3 preferences preserve stable choices, never actual order or longer notice facts and duration',()=>{
 const defaultsContext={legacyData:ui.runtime.data,administrativeData:context};
 for(const path of added.filter(path=>path.duration.kind!=='statutoryDays')){
  assert.equal(ui.requiresCurrentAdministrativeDuration(path),true);
  const raw={...ui.emptyAdministrativePreferences(),authorityCode:catalog.laws.find(row=>row.lawId===path.lawId)!.canton,deadlineDays:45,
   procedureSelection:{kind:'cantonalAdministrative',lawId:path.lawId,pathId:path.pathId,revision:1,stage:path.stages[0]},
   deliveryMethod:'otherLegallyRelevantDate',inputDate:'2026-10-02',currentValues:{ordinaryStatutoryDays:'10'},caseQualification:{expectedService:true},calendarReference:'QA-PRIVATE'};
  const clean=ui.sanitizeAdministrativePreferences(defaultsContext,raw);assert.equal(clean.deadlineDays,10);assert.equal(clean.procedureSelection?.kind,'cantonalAdministrative');
  assert.doesNotMatch(JSON.stringify(clean),/2026-10-02|currentValues|ordinaryStatutoryDays|expectedService|QA-PRIVATE/);
  const map=new Map<string,string>(),storage={getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>map.set(k,v)};
  const saved=ui.saveAdministrativeDefaults(defaultsContext,storage,raw);assert.equal(saved.persistence,'stored');
  const restored=ui.initializeAdministrativeDefaults(defaultsContext,storage);assert.equal(restored.persistence,'stored');assert.equal(restored.legalQualification,false);
  const old={legacyData:ui.historicalRuntime.data,administrativeData:ui.historicalRuntime.administrativeContext};
  const bytes=map.get('fristenrechner.defaults.v5');assert.equal(ui.initializeAdministrativeDefaults(old,storage).persistence,'protected');ui.resetAdministrativeDefaults(old,storage);assert.equal(map.get('fristenrechner.defaults.v5'),bytes);
 }
});
