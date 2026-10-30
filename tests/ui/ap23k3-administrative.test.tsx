// SPDX-License-Identifier: AGPL-3.0-only
// Actual V8 UI adapters and authenticated Format15 context. Synthetic cases only.
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
 export * from './src/ui/administrativeUi'; export * from './src/ui/administrativeExport'; export * from './src/ui/administrativeDefaults';
 export {ap23k3CandidateRuntime as runtime} from './src/release/ap23k3CandidateData';
 export {ap23j3CandidateRuntime as historicalRuntime} from './src/release/ap23j3CandidateData';
 setIconOptions({disableWarnings:true});
 export const fields=p=>renderToStaticMarkup(React.createElement('div',{className:'fr-form__grid'},React.createElement(AdministrativeProcedureFields,p)));
 export const result=p=>renderToStaticMarkup(React.createElement(AdministrativeResultView,p));
 export const automatic=p=>renderToStaticMarkup(React.createElement(AdministrativeAutomaticParameters,p));
`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,platform:'node',format:'cjs',write:false,external:['react','react-dom/server'],logLevel:'silent'});
const module={exports:{}};new Function('require','module','exports',bundle.outputFiles[0]!.text)(require,module,module.exports);
const ui=module.exports as typeof Helpers & typeof Export & typeof Defaults & {
 runtime:{administrativeContext:import('../../src/core/releaseFormat15').ParsedFormat15Data;data:Defaults.AdministrativeDefaultsContext['legacyData']};
 historicalRuntime:{administrativeContext:unknown;data:Defaults.AdministrativeDefaultsContext['legacyData']};
 fields(props:Helpers.AdministrativeProcedureFieldsProps):string;
 result(props:Helpers.AdministrativeResultViewProps):string;
 automatic(props:{catalog:Helpers.AdministrativeUiCatalog;lawId:string;state:Helpers.AdministrativeUiState;locale:'de'|'fr';context?:unknown}):string;
};
const context=ui.runtime.administrativeContext,catalog=context.administrativeCatalog;
const added=catalog.paths.filter(p=>'contractFamily'in p&&p.contractFamily==='qualifiedDayProcedureV8');
/** Explicit synthetic positive facts, never a product or preferences default. */
function state(pathId:string,qualified=true,alternatives=true):Helpers.AdministrativeUiState {
 const p=catalog.paths.find(p=>p.pathId===pathId)!;
 const policy=catalog.qualificationPolicies.find(q=>q.pathId===pathId);
 const dynamic=catalog.holidayBindings.some(b=>b.holidayBindingId===p.holidayBindingId&&'calendarSelection'in b&&b.calendarSelection.kind==='qualifiedPartyOrRepresentativeCanton');
 return{stage:p.stages[0]!,pathId,qualification:qualified?'generalActualReceipt':'',urgency:'none',
  ...((policy?.mode==='qualifiedDayProcedureV6'||policy?.mode==='qualifiedDayProcedureV7'||policy?.mode==='qualifiedDayProcedureV8')&&alternatives?
   {currentValues:Object.fromEntries(policy.requirements.flatMap(r=>r.oneOf?[[r.key,String(r.oneOf[0])]]:[]))}:{}),
  ...(dynamic?{legalAnchorCanton:'BS',areaFacts:{}}:{})};
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
test('K3 165 paths and all16 new qualification requirements have equivalent readable DE/FR copy',()=>{
 assert.equal(catalog.paths.length,165);assert.equal(added.length,16);
 assert.deepEqual(Object.keys(administrativeMessages.de).sort(),Object.keys(administrativeMessages.fr).sort());
 for(const p of catalog.paths)for(const locale of['de','fr']as const){
  const messages=administrativeMessages[locale]as Record<string,string>;
  assert.ok(messages['law.'+p.lawId]);assert.doesNotMatch(ui.administrativeActionLabel(p,locale),/^(action|path)\./);
  const text=ui.administrativeQualificationPresentation(catalog,p);assert.ok(messages[text.choiceKey]);assert.ok(messages[text.scopeKey]);
 }
 for(const p of added){const policy=catalog.qualificationPolicies.find(q=>q.pathId===p.pathId)!;
  if(policy.mode!=='qualifiedDayProcedureV8')throw Error('V8');
  for(const r of policy.requirements)for(const locale of['de','fr']as const)
   assert.ok((administrativeMessages[locale]as Record<string,string>)['administrative.'+r.reason],r.reason);
 }
});
test('K3 every new path needs current positive qualification, computes natively and cannot export',()=>{
 for(const p of added){
  assert.equal(qualify(p.pathId,'2026-10-02',10,state(p.pathId,false)).input,undefined,p.pathId);
  const q=qualify(p.pathId);assert.deepEqual(q.errors,{});assert.ok(q.input,p.pathId);
  assert.equal(q.input.qualification.delivery,'qualifiedTriggerAccordingToOpeningPolicy');
  const result=ui.calculateAdministrativeUiDeadline(q.input,context);assert.equal(result.outcome,'calculated',p.pathId);
  assert.equal(ui.administrativeExportAvailable(q.input,context,result),false);
  assert.equal('role'in(q.input.caseQualification??{}),false);assert.equal('regionalOfficeMode'in(q.input.caseQualification??{}),false);
 }
});
test('K3 all149 old UI paths retain their input contracts and native calculation',()=>{
 for(const p of catalog.paths.slice(0,149)){
  const q=qualify(p.pathId,'2026-10-02',p.duration.kind==='concretisedStatutoryDays'?7:10);assert.ok(q.input,p.pathId);
  assert.equal(q.input.qualification.delivery,'contractFamily'in p&&p.contractFamily==='qualifiedDayProcedureV7'?'qualifiedTriggerAccordingToOpeningPolicy':'qualifiedActualDelivery',p.pathId);
  assert.equal(ui.calculateAdministrativeUiDeadline(q.input,context).outcome,'calculated',p.pathId);
 }
});
test('K3 adds only real current choices, never a regional-office override or inferred first choice',()=>{
 assert.equal(ui.administrativeQualificationPresentation(catalog).scopeKey,'scope.v8.unselected');
 for(const locale of['de','fr']as const){
  const message=(administrativeMessages[locale]as Record<string,string>)['scope.v8.unselected']!;
  assert.match(message,locale==='de'?/nicht modellierte abweichende Feiertagsanknüpfung/:/jours fériés non modélisé/);
 }
 for(const p of added){
  const s={...state(p.pathId,false,false),legalAnchorCanton:'',areaFacts:{}};
  const html=ui.fields({catalog,lawId:p.lawId,locale:'de',value:s,onChange(){}}),doc=new JSDOM(html).window.document;
  assert.equal(doc.querySelectorAll('.fr-form__grid').length,1);assert.equal(doc.querySelector('input[type="checkbox"]'),null);
  assert.doesNotMatch(html,/Fristauslösendes Dokument|Massgeblicher Feiertagskanton|regionalOfficeMode|Gerichtsferien wählen|Zielgericht wählen/);
  const dynamic=p.pathId.startsWith('bs-court-');assert.equal(html.includes('Wohnsitz / Sitz der Partei'),dynamic,p.pathId);
  assert.equal(html.includes('Gegenstand der Präsidialverfügung'),p.pathId==='bl-court-objection-5',p.pathId);
 }
 assert.equal(qualify('bl-court-objection-5','2026-10-02',5,state('bl-court-objection-5',true,false)).input,undefined);
 const policy=catalog.qualificationPolicies.find(q=>q.pathId==='bl-court-objection-5')!;
 if(policy.mode!=='qualifiedDayProcedureV8')throw Error('V8');
 const categories=policy.requirements.find(r=>r.key==='courtOrderCategory')!.oneOf!;assert.equal(categories.length,7);
 for(const category of categories)assert.ok(qualify('bl-court-objection-5','2026-10-02',5,{...state('bl-court-objection-5'),currentValues:{courtOrderCategory:String(category)}}).input);
 assert.equal(qualify('bl-court-objection-5','2026-10-02',5,{...state('bl-court-objection-5'),currentValues:{courtOrderCategory:'ordinaryScheduling'}}).input,undefined);
});
test('K3 BS court anchor never defaults to BS, never invents a role and requires exact AI/NE facts',()=>{
 const base=state('bs-court-register-10');
 for(const canton of['','CH','unknown','BS,TI'])assert.equal(qualify('bs-court-register-10','2026-10-02',10,{...base,legalAnchorCanton:canton}).input,undefined);
 for(const [canton,scope]of[['AI','AI-RTG-INNER-ADDITIONAL'],['NE','NE-LANDERON-ADDITIONAL']]as const){
  assert.equal(qualify('bs-court-register-10','2026-10-02',10,{...base,legalAnchorCanton:canton,areaFacts:{}}).input,undefined);
  for(const member of[false,true]){const q=qualify('bs-court-register-10','2026-10-02',10,{...base,legalAnchorCanton:canton,areaFacts:{[scope]:member}});
   assert.ok(q.input);assert.deepEqual(q.input.areaFacts,{[scope]:member});assert.equal((q.input.caseQualification as Readonly<Record<string,unknown>>).legalAnchorQualification,'establishedPartyOrRepresentative');
   assert.equal('role'in q.input,false);
  }
 }
 assert.equal(qualify('bs-court-register-10','2026-10-02',10,{...base,legalAnchorCanton:'TI',areaFacts:{'NE-LANDERON-ADDITIONAL':true}}).input,undefined);
 const changed=ui.changeAdministrativeSelection(catalog,'bs-general-administrative',{...base,legalAnchorCanton:'NE',areaFacts:{'NE-LANDERON-ADDITIONAL':true}},'pathId','bs-court-reasons-30');
 assert.equal(changed.qualification,'');assert.equal(changed.legalAnchorCanton,undefined);assert.equal(changed.areaFacts,undefined);
});
test('K3 BS origin-trigger dates and TI anchor have readable source-bound traces without raw IDs',()=>{
 for(const locale of['de','fr']as const){
  const bs=render('bs-court-register-10','2026-11-28',locale,10,{...state('bs-court-register-10'),legalAnchorCanton:'BS'});
  const ti=render('bs-court-register-10','2026-11-28',locale,10,{...state('bs-court-register-10'),legalAnchorCanton:'TI'});
  assert.equal(bs.result.outcome,'calculated');assert.equal(ti.result.outcome,'calculated');
  if(bs.result.outcome!=='calculated'||ti.result.outcome!=='calculated')throw Error('Calculated');
  assert.equal(bs.result.finalEnd,'2026-12-08');assert.equal(ti.result.finalEnd,'2026-12-09');
  const trace=ti.document.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!;
  assert.match(trace,/TI/);assert.match(trace,/Art\. 20/);assert.match(trace,/§§ 10, 16/);
  assert.doesNotMatch(trace,/SRC-|JUD-|CH-CAL-|Normative body|Complete current|qualifiedDayProcedure|case\.|scope\.|v8\./);
  assert.equal(ti.document.querySelector('[data-testid="administrative-office-closure-trace"]'),null);
  assert.equal(ti.document.querySelector('.fr-calendar-export'),null);
 }
 const a=render('bs-internal-register-10'),b=render('bs-internal-reasons-30');
 assert.equal(a.result.outcome,'calculated');assert.equal(b.result.outcome,'calculated');
 if(a.result.outcome!=='calculated'||b.result.outcome!=='calculated')throw Error('Calculated');
 assert.equal(a.result.ordinaryStart,'2026-10-03');assert.equal(b.result.ordinaryStart,'2026-10-03');
 assert.match(b.document.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!,/derselben ursprünglichen Eröffnung/);
});
test('K3 all26 BS court holiday cantons resolve only their own exact current anchor',()=>{
 const binding=catalog.holidayBindings.find(b=>b.holidayBindingId==='bs-party-representative')!;
 if(!('calendarSelection'in binding)||binding.calendarSelection.kind!=='qualifiedPartyOrRepresentativeCanton')throw Error('Dynamic binding');
 assert.equal(binding.calendarSelection.terminals.length,26);
 for(const terminal of binding.calendarSelection.terminals){
  const current={...state('bs-court-register-10'),legalAnchorCanton:terminal.canton,
   areaFacts:Object.fromEntries(terminal.requiredAreaScopeIds.map(scope=>[scope,false]))};
  const r=render('bs-court-register-10','2026-10-02','de',10,current);assert.equal(r.result.outcome,'calculated',terminal.canton);
  if(r.result.outcome!=='calculated')throw Error('Calculated');assert.equal(r.result.provenance.calendarResolution?.legalAnchorCanton,terminal.canton);
  assert.equal(Object.hasOwn(r.input,'areaFacts'),terminal.requiredAreaScopeIds.length>0);
 }
 const bs=render('bs-court-register-10','2026-12-14','de',10,{...state('bs-court-register-10'),legalAnchorCanton:'BL'});
 assert.equal(bs.result.outcome,'calculated');if(bs.result.outcome!=='calculated')throw Error('Calculated');
 assert.equal(bs.result.finalEnd,'2026-12-24');assert.equal(bs.result.provenance.annualEndShiftResolution?.kind,'none');
});
test('K3 only the bound SG January comparison appears and complete-window boundaries never export',()=>{
 for(const locale of['de','fr']as const){
  const sg=render('bs-court-register-10','2026-12-23',locale,10,{...state('bs-court-register-10'),legalAnchorCanton:'SG'});
  assert.equal(sg.result.outcome,'calculated');assert.ok(sg.document.querySelector('[data-testid="administrative-january-comparison"]'));
  const trace=sg.document.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!;
  assert.doesNotMatch(trace,/SG-ZPO|SRC-|JUD-|qualifiedDayProcedure/);
  const ti=render('bs-court-register-10','2026-12-23',locale,10,{...state('bs-court-register-10'),legalAnchorCanton:'TI'});
  assert.equal(ti.document.querySelector('[data-testid="administrative-january-comparison"]'),null);
 }
 for(const id of['bs-court-register-10','bl-admin-appeal-10'])for(const received of['2026-08-28','2027-12-24']){
  const r=render(id,received);assert.equal(r.result.outcome,'blocked');assert.equal(r.document.querySelector('.fr-result__hero'),null);
  assert.equal(r.document.querySelector('.fr-calendar-export'),null);assert.equal(ui.administrativeExportAvailable(r.input,context,r.result),false);
 }
});
test('K3 category input stays closed and never evaluates accessor facts or auto-selects an alternative',()=>{
 for(const values of[{}, {courtOrderCategory:'unknown'}, {courtOrderCategory:'competence',invented:'yes'},Object.create({courtOrderCategory:'competence'})]){
  assert.equal(qualify('bl-court-objection-5','2026-10-02',5,{...state('bl-court-objection-5'),currentValues:values}).input,undefined);
 }
 let invoked=false;const values:Record<string,string>={};Object.defineProperty(values,'courtOrderCategory',{enumerable:true,get(){invoked=true;return'competence';}});
 assert.equal(qualify('bl-court-objection-5','2026-10-02',5,{...state('bl-court-objection-5'),currentValues:values}).input,undefined);assert.equal(invoked,false);
});
test('K3 BL closures are end shifts only, separately named and blocked for a differing carnival comparison',()=>{
 for(const locale of['de','fr']as const){
  const shifted=render('bl-admin-appeal-10','2026-12-14',locale);
  assert.equal(shifted.result.outcome,'calculated');if(shifted.result.outcome!=='calculated')throw Error('Calculated');
  assert.equal(shifted.result.finalEnd,'2027-01-04');assert.equal(shifted.result.skippedCalendarDays,0);
  assert.equal(shifted.result.provenance.annualEndShiftResolution?.boundOfficeClosureDays.length,13);
  const trace=shifted.document.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!;
  assert.match(trace,/24\.12\.2026/);assert.match(trace,/28\.12\.2026/);assert.doesNotMatch(trace,/SRC-|JUD-|regionalOfficeMode|Vollständigerpublizierter|NettoTabelle/);
  assert.ok(shifted.document.querySelector('[data-testid="administrative-office-closure-trace"]'));
  const blocked=render('bl-admin-appeal-10','2027-01-30',locale);
  assert.equal(blocked.result.outcome,'blocked');assert.equal(blocked.document.querySelector('.fr-result__hero'),null);
  assert.equal(blocked.document.querySelector('.fr-calendar-export'),null);
  const comparison=blocked.document.querySelector('[data-testid="administrative-office-comparison"]')!.textContent!;
  assert.match(comparison,/09\.02\.2027/);assert.match(comparison,/10\.02\.2027/);
  assert.match(blocked.document.querySelector('.fr-trace__norm-segments')!.textContent!,/30\.01\.2027–10\.02\.2027/);
  assert.equal(ui.administrativeExportAvailable(blocked.input,context,blocked.result),false);
 }
 const inside=render('bl-admin-appeal-10','2027-02-05');assert.equal(inside.result.outcome,'calculated');
 if(inside.result.outcome!=='calculated')throw Error('Calculated');assert.equal(inside.result.skippedCalendarDays,0);
});
for(const locale of['de','fr']as const)test(`K3 ${locale} differing BL closure comparison never states a definitive absence of end shift`,()=>{
 const blocked=render('bl-admin-appeal-10','2027-01-30',locale),messages=administrativeMessages[locale]as Record<string,string>;
 assert.equal(blocked.result.outcome,'blocked');if(blocked.result.outcome!=='blocked')throw Error('Blocked comparison');
 assert.deepEqual(blocked.result.blockReasonKeys,['administrative.blOfficeClosureClarificationRequired']);
 const trace=blocked.document.querySelector('[data-testid="administrative-readable-trace"]')!;
 const rows=Array.from(trace.querySelectorAll(':scope > dl > div'))as Element[];
 const shifts=rows.find(row=>row.querySelector('dt')?.textContent===messages.shifts);
 assert.ok(shifts);assert.equal(shifts.querySelector('dd')?.textContent,messages['v8.unresolvedOfficeEndShift']);
 const annual=trace.querySelector('[data-testid="administrative-office-closure-trace"]')!;
 assert.equal(annual.querySelectorAll(':scope > p')[1]?.textContent,messages['v8.unresolvedOfficeEndShift']);
 assert.equal(annual.textContent!.includes(messages['v8.annualNoneEncountered']!),false);
 assert.match(annual.querySelector('[data-testid="administrative-office-comparison"]')!.textContent!,/09\.02\.2027.*10\.02\.2027/);
 assert.equal(blocked.document.querySelector('.fr-result__hero'),null);assert.equal(blocked.document.querySelector('.fr-calendar-export'),null);
 const normal=render('bl-admin-appeal-10','2026-10-02',locale);assert.equal(normal.result.outcome,'calculated');
 assert.match(normal.document.querySelector('[data-testid="administrative-office-closure-trace"]')!.textContent!,new RegExp(messages['v8.annualNoneEncountered']!.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
 assert.equal(normal.document.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!.includes(messages['v8.unresolvedOfficeEndShift']!),false);
});
test('K3 automatic parameters resolve one qualified anchor and never copy BL closures into BS court',()=>{
 const noAnchor={...state('bs-court-register-10',false),legalAnchorCanton:''};
 const html=ui.automatic({catalog,context,lawId:'bs-general-administrative',state:noAnchor,locale:'de'});
 assert.match(html,/Noch nicht eindeutig bestimmt|Nicht bestimmt|Noch zu klären|Noch nicht bestimmt|ungeklärt|Nicht geklärt/);
 const bs=ui.automatic({catalog,context,lawId:'bs-general-administrative',state:{...state('bs-court-register-10'),legalAnchorCanton:'BL'},locale:'de'});
 assert.match(bs,/Basel-Landschaft/);assert.doesNotMatch(bs,/Büroschliessungen automatisch/);
 const bl=ui.automatic({catalog,context,lawId:'bl-general-administrative',state:state('bl-admin-appeal-10'),locale:'de'});
 assert.match(bl,/Büroschliessungen automatisch/);
});
test('K3 V5 defaults save stable path only, old consumer protects unknown path and current facts never persist',()=>{
 const storageMap=new Map<string,string>(),storage={getItem:(key:string)=>storageMap.get(key)??null,setItem:(key:string,value:string)=>{storageMap.set(key,value);}};
 const defaults={legacyData:ui.runtime.data,administrativeData:context};
 const q=qualify('bs-court-register-10','2026-11-28',10,{...state('bs-court-register-10'),legalAnchorCanton:'AI',areaFacts:{'AI-RTG-INNER-ADDITIONAL':true}});assert.ok(q.input);
 const saved=ui.saveAdministrativeDefaults(defaults,storage,{...ui.emptyAdministrativePreferences(),authorityCode:'BS',deadlineDays:10,deliveryMethod:'otherLegallyRelevantDate',
  procedureSelection:q.input.selection,caseQualification:q.input.caseQualification,legalAnchorCanton:'AI',areaFacts:q.input.areaFacts,inputDate:q.input.inputDate,reference:'QA-K3'});
 assert.equal(saved.persistence,'stored');const bytes=storageMap.get('fristenrechner.defaults.v5')!;
 assert.doesNotMatch(bytes,/legalAnchor|areaFacts|caseQualification|currentValues|inputDate|2026-11-28|QA-K3/);
 assert.equal(ui.initializeAdministrativeDefaults(defaults,storage).preferences.procedureSelection?.kind,'cantonalAdministrative');
 const historical={legacyData:ui.historicalRuntime.data,administrativeData:ui.historicalRuntime.administrativeContext}as Defaults.AdministrativeDefaultsContext;
 assert.equal(ui.initializeAdministrativeDefaults(historical,storage).reason,'unsupportedSelection');
 ui.resetAdministrativeDefaults(historical,storage);assert.equal(storageMap.get('fristenrechner.defaults.v5'),bytes);
});
