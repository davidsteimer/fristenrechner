// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {buildSync} from 'esbuild';
import type * as Helpers from '../../src/ui/administrativeUi';
import type * as Export from '../../src/ui/administrativeExport';
import type * as Defaults from '../../src/ui/administrativeDefaults';
import {administrativeMessages,administrativeText} from '../../src/ui/administrativeMessages';
import {ap23m3NormLocator} from '../../src/ui/ap23m3Messages';
const require=createRequire(import.meta.url),{JSDOM}=require('jsdom');
const bundle=buildSync({stdin:{contents:`
 import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';
 import {setIconOptions} from '@fluentui/react/lib/Styling';
 import {AdministrativeProcedureFields,AdministrativeResultView,AdministrativeAutomaticParameters} from './src/ui/administrativeUi';
 import {FristenrechnerApp} from './src/ui/FristenrechnerApp';
 export * from './src/ui/administrativeUi';export * from './src/ui/administrativeExport';export * from './src/ui/administrativeDefaults';
 export {ap23m3CandidateRuntime as runtime} from './src/release/ap23m3CandidateData';
 export {ap23l3CandidateRuntime as historicalRuntime} from './src/release/ap23l3CandidateData';
 import {ap23m3CandidateRuntime as runtime,ap23m3ManifestText,ap23m3Files} from './src/release/ap23m3CandidateData';
 import {createFormat17CalculationData} from './src/core/format17CalculationData';
 setIconOptions({disableWarnings:true});
 export const fields=p=>renderToStaticMarkup(React.createElement('div',{className:'fr-form__grid'},React.createElement(AdministrativeProcedureFields,p)));
 export const result=p=>renderToStaticMarkup(React.createElement(AdministrativeResultView,p));
 export const automatic=p=>renderToStaticMarkup(React.createElement(AdministrativeAutomaticParameters,p));
 export const app=(storage,mismatch=false)=>renderToStaticMarkup(React.createElement(FristenrechnerApp,{...runtime,storage,
  ...(mismatch?{administrativeContext:createFormat17CalculationData(ap23m3ManifestText,ap23m3Files,{mode:'localReference'}).administrativeContext}:{})}));
`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,platform:'node',format:'cjs',write:false,external:['react','react-dom/server'],logLevel:'silent'});
const module={exports:{}};new Function('require','module','exports',bundle.outputFiles[0]!.text)(require,module,module.exports);
const ui=module.exports as typeof Helpers & typeof Export & typeof Defaults & {
 runtime:{administrativeContext:import('../../src/core/releaseFormat17').ParsedFormat17Data;data:Defaults.AdministrativeDefaultsContext['legacyData']};
 historicalRuntime:{administrativeContext:import('../../src/core/releaseFormat16').ParsedFormat16Data;data:Defaults.AdministrativeDefaultsContext['legacyData']};
 fields(props:Helpers.AdministrativeProcedureFieldsProps):string;result(props:Helpers.AdministrativeResultViewProps):string;
 automatic(props:{catalog:Helpers.AdministrativeUiCatalog;lawId:string;state:Helpers.AdministrativeUiState;locale:'de'|'fr';context?:unknown}):string;
 app(storage:Defaults.AdministrativeDefaultsStorage,mismatch?:boolean):string;
};
const context=ui.runtime.administrativeContext,catalog=context.administrativeCatalog;
type Reference={id:string;path:string;trigger:string;days:number;facts:Record<string,unknown>;expected:{outcome:string;end?:string}};
const refs=JSON.parse(readFileSync('docs/fachrecht/ap23m1/referenzfaelle.json','utf8')).cases as Reference[];
const added=catalog.paths.filter(path=>'contractFamily'in path&&path.contractFamily==='qualifiedDayProcedureV10');
function reference(pathId:string){const path=added.find(row=>row.pathId===pathId)!;return refs.find(ref=>ref.path===path.researchRef&&ref.expected.outcome==='datedResearchValue')!;}
function state(pathId:string,qualified=true,facts:Record<string,unknown>=reference(pathId).facts):Helpers.AdministrativeUiState{
 const path=catalog.paths.find(row=>row.pathId===pathId)!,policy=catalog.qualificationPolicies.find(row=>row.pathId===pathId)!;
 if(policy.mode!=='qualifiedDayProcedureV10')throw Error('V10');
 const currentValues=Object.fromEntries(policy.requirements.flatMap(row=>row.oneOf&&Object.hasOwn(facts,row.key)?[[row.key,String(facts[row.key])]]:[]));
 const binding=catalog.holidayBindings.find(row=>row.holidayBindingId===path.holidayBindingId)!;
 if('calendarSelection'in binding&&binding.calendarSelection.kind==='qualifiedAuthoritySeatRegion'&&Object.hasOwn(facts,'authorityHolidayRegion'))currentValues.authorityHolidayRegion=String(facts.authorityHolidayRegion);
 return{stage:path.stages[0]!,pathId,qualification:qualified?'generalActualReceipt':'',urgency:'none',currentValues};
}
function qualify(pathId:string,received=reference(pathId).trigger,days=reference(pathId).days,current=state(pathId)){
 const path=catalog.paths.find(row=>row.pathId===pathId)!;
 return ui.qualifyAdministrativeUiInput({catalog,lawId:path.lawId,authorityCanton:catalog.laws.find(row=>row.lawId===path.lawId)!.canton,
  inputDate:received,deadlineDays:path.duration.kind==='statutoryDays'?path.duration.value:days,state:current});
}
function render(pathId:string,received=reference(pathId).trigger,locale:'de'|'fr'='de',days=reference(pathId).days,current=state(pathId)){
 const q=qualify(pathId,received,days,current);assert.deepEqual(q.errors,{});assert.ok(q.input,pathId);
 const result=ui.calculateAdministrativeUiDeadline(q.input,context),html=ui.result({catalog,context,result,input:q.input,locale,calendarReference:'',onCalendarReferenceChange(){},onExport(){}});
 return{input:q.input,result,html,document:new JSDOM(html).window.document};
}
test('M3 complete245 paths have DE/FR display labels,49new groups, no raw qualification reasons',()=>{
 assert.equal(catalog.paths.length,245);assert.equal(added.length,49);assert.deepEqual(Object.keys(administrativeMessages.de).sort(),Object.keys(administrativeMessages.fr).sort());
 for(const path of catalog.paths)for(const locale of['de','fr']as const){
  const copy=administrativeMessages[locale]as Record<string,string>,keys=ui.administrativeQualificationPresentation(catalog,path);
  assert.ok(copy[keys.choiceKey],keys.choiceKey);assert.ok(copy[keys.scopeKey],keys.scopeKey);assert.doesNotMatch(ui.administrativeActionLabel(path,locale),/^(?:action|path)\./);
 }
 for(const path of added){const policy=catalog.qualificationPolicies.find(row=>row.pathId===path.pathId)!;if(policy.mode!=='qualifiedDayProcedureV10')throw Error('V10');
  for(const row of policy.requirements)for(const locale of['de','fr']as const)assert.ok((administrativeMessages[locale]as Record<string,string>)['administrative.'+row.reason],row.reason);
 }
});
for(const ref of refs.filter(ref=>ref.expected.outcome==='datedResearchValue'))test('M3 native UI current case '+ref.id+' matches static accepted date',()=>{
 const path=added.find(path=>path.researchRef===ref.path)!;assert.ok(path);
 const q=qualify(path.pathId,ref.trigger,ref.days,state(path.pathId,true,ref.facts));assert.deepEqual(q.errors,{});assert.ok(q.input);
 const result=ui.calculateAdministrativeUiDeadline(q.input,context);assert.equal(result.outcome,'calculated',JSON.stringify(result));
 if(result.outcome!=='calculated')throw Error('Calculated');assert.equal(result.finalEnd,ref.expected.end);assert.equal(result.referenceOnly,true);
 assert.equal(ui.administrativeExportAvailable(q.input,context,result),false);
});
test('M3 all49 groups need a fresh positive case qualification, no checkbox or extra document fields',()=>{
 for(const path of added){
  assert.equal(qualify(path.pathId,undefined,undefined,state(path.pathId,false)).input,undefined);
  for(const locale of['de','fr']as const){const doc=new JSDOM(ui.fields({catalog,lawId:path.lawId,locale,value:state(path.pathId,false),onChange(){}})).window.document;
   assert.equal(doc.querySelectorAll('.fr-form__grid').length,1);assert.equal(doc.querySelector('input[type="checkbox"]'),null);
   assert.doesNotMatch(doc.body.textContent!,/Fristauslösendes Dokument|Massgeblicher Feiertagskanton|Document déclencheur|qualifiedDayProcedure|v10\.(?:fact|value)/);
   assert.ok(doc.querySelectorAll('[role="combobox"]').length<=5,path.pathId);
  }
 }
});
test('M3 NE admin requires the current authority region, court stays fixed and raw NE post is never inferred',()=>{
 const ref=reference('ne-admin-ordered'),current=state('ne-admin-ordered');
 assert.equal(qualify('ne-admin-ordered',ref.trigger,ref.days,{...current,currentValues:{}}).input,undefined);
 for(const region of['unknown','BE','CH','neuchatel'])assert.equal(qualify('ne-admin-ordered',ref.trigger,ref.days,{...current,currentValues:{authorityHolidayRegion:region}}).input,undefined);
 for(const region of['neWithoutLeLanderon','leLanderon']){const q=qualify('ne-admin-ordered','2027-05-26',1,{...current,currentValues:{authorityHolidayRegion:region}});assert.ok(q.input);
  assert.equal((q.input.caseQualification as Record<string,unknown>).authorityHolidayRegion,region);const result=ui.calculateAdministrativeUiDeadline(q.input,context);
  assert.equal(result.outcome,'calculated');if(result.outcome!=='calculated')throw Error('Calculated');assert.equal(result.finalEnd,region==='leLanderon'?'2027-05-28':'2027-05-27');
 }
 const court=state('ne-court-ordered');assert.equal(qualify('ne-court-ordered',undefined,undefined,{...court,currentValues:{authorityHolidayRegion:'leLanderon'}}).input,undefined);
 assert.equal(qualify('ne-court-ordered',undefined,undefined,{...court,currentValues:{openingMode:'vdUnsignedPostalReceipt'}}).input,undefined);
 for(const locale of['de','fr']as const){const p=added.find(row=>row.pathId==='ne-court-ordered')!;
  const fields=ui.fields({catalog,lawId:p.lawId,locale,value:court,onChange(){}});assert.doesNotMatch(fields,/role="option"[^>]*>Le Landeron/);
  assert.match(ui.automatic({catalog,lawId:p.lawId,locale,state:court,context}),/Cour de droit public, Neuchâtel/);
 }
});
test('M3 VD raw post confirms exactly2current facts, no AI assumptions and qualification text is explicit',()=>{
 const raw=state('vd-admin-ordered',true,{openingMode:'vdUnsignedPostalReceipt'}),q=qualify('vd-admin-ordered','2026-09-19',10,raw);assert.ok(q.input);
 const rawFacts=q.input.caseQualification as Record<string,unknown>;
 assert.equal(rawFacts.unsignedPostalService,'lawfullyPermittedAndNoSignatureRequired');assert.equal(rawFacts.entryIntoRecipientSphere,'verified');
 for(const key of['expectedService','entryIntoSphere','receiptHolidayRegime'])assert.equal(Object.hasOwn(q.input.caseQualification??{},key),false);
 const qualified=qualify('vd-admin-ordered','2026-09-19',10,state('vd-admin-ordered',true,{openingMode:'qualifiedLegalOpening'}));assert.ok(qualified.input);
 for(const key of['unsignedPostalService','entryIntoRecipientSphere'])assert.equal(Object.hasOwn(qualified.input.caseQualification??{},key),false);
 assert.equal(qualify('vd-admin-ordered','2026-09-19',10,{...raw,currentValues:{}}).input,undefined);
 const copy=ui.administrativeQualificationPresentation(catalog,added.find(p=>p.pathId==='vd-admin-ordered'),raw);
 for(const locale of['de','fr']as const)assert.match(administrativeText(locale,copy.choiceKey),locale==='de'?/ohne Unterschrift zulässig.*verifiziert/:/sans signature admissible.*vérifiée/);
 assert.equal(ui.administrativeDateMeaning(added.find(p=>p.pathId==='vd-admin-ordered'),raw),'vdUnsignedPostalReceipt');
 assert.equal(ui.administrativeDateMeaning(added.find(p=>p.pathId==='vd-admin-ordered'),{...raw,currentValues:{}}),undefined);
 assert.equal(ui.administrativeDateMeaning(added.find(p=>p.pathId==='vd-admin-ordered'),{...raw,currentValues:{openingMode:'trackingPhysicalReceipt'}}),undefined);
});
test('M3 selected path changes clear actual region, opening, ordinary base and prior case confirmation',()=>{
 for(const id of['ne-admin-ordered','vd-admin-ordered','vs-admin-notice-long']){const p=added.find(row=>row.pathId===id)!;
  const changed=ui.changeAdministrativeSelection(catalog,p.lawId,state(id),'pathId',id);assert.equal(changed.qualification,'');assert.equal(changed.currentValues,undefined);
 }
});
test('M3 all196 inherited UI paths still qualify and calculate inside the genuine native17 context',()=>{
 const saved=JSON.parse(readFileSync('outputs/ap23m2-2026-10-28/native-regression.json','utf8')).results as {pathId:string;input:import('../../src/core/administrativeDeadline').AdministrativeDeadlineInput;expectedFinalEnd:string}[];
 assert.equal(saved.length,196);
 for(const row of saved){const p=catalog.paths.find(path=>path.pathId===row.pathId)!,policy=catalog.qualificationPolicies.find(value=>value.pathId===row.pathId);
  const facts=(row.input.caseQualification??{})as Record<string,unknown>;
  const currentValues=policy&&'requirements'in policy&&Array.isArray(policy.requirements)?Object.fromEntries(policy.requirements.flatMap(r=>'oneOf'in r&&r.oneOf&&Object.hasOwn(facts,r.key)?[[r.key,String(facts[r.key])]]:[])):{};
  const s:Helpers.AdministrativeUiState={stage:row.input.selection.stage,pathId:row.pathId,qualification:'generalActualReceipt',urgency:row.input.urgency,currentValues,
   ...(typeof facts.legalAnchorCanton==='string'?{legalAnchorCanton:facts.legalAnchorCanton}:{}),...(row.input.areaFacts?{areaFacts:row.input.areaFacts}:{})};
  const q=ui.qualifyAdministrativeUiInput({catalog,lawId:p.lawId,authorityCanton:row.input.authoritySeat.canton,inputDate:row.input.inputDate,deadlineDays:row.input.deadlineDays,state:s});
  assert.deepEqual(q.errors,{},row.pathId);assert.ok(q.input,row.pathId);const result=ui.calculateAdministrativeUiDeadline(q.input,context);
  assert.equal(result.outcome,'calculated',row.pathId);if(result.outcome!=='calculated')throw Error(row.pathId);assert.equal(result.finalEnd,row.expectedFinalEnd,row.pathId);
 }
});
test('M3 VS15days above ordinary10 is valid, but base30 or missingbase blocks, no AI31floor',()=>{
 const current=state('vs-admin-notice-long',true,{ordinaryDays:10}),q=qualify('vs-admin-notice-long','2026-10-02',15,current);assert.ok(q.input);
 const currentFacts=q.input.caseQualification as Record<string,unknown>;
 assert.equal(currentFacts.ordinaryDays,10);assert.equal(currentFacts.actualInstructionDays,15);
 assert.equal(qualify('vs-admin-notice-long','2026-10-02',15,{...current,currentValues:{ordinaryDays:'30'}}).input,undefined);
 assert.equal(qualify('vs-admin-notice-long','2026-10-02',15,{...current,currentValues:{}}).input,undefined);
 for(const days of[0,10,366,NaN])assert.equal(qualify('vs-admin-notice-long','2026-10-02',days,current).input,undefined);
 for(const key of['actualLongerInstructionDays','ordinaryStatutoryDays','longerInstructionQualification'])assert.equal(Object.hasOwn(q.input.caseQualification??{},key),false);
});
test('M3 VD Art81 is current legal qualification, not numerical legality inferred from40',()=>{
 const q=qualify('vd-court-ordered','2026-10-02',40);assert.ok(q.input);
 assert.equal((q.input.caseQualification as Record<string,unknown>).orderLegalScope,'otherValidLpaInputOrArticle81Within30OrGrantedExtension');
 const copy=ui.administrativeQualificationPresentation(catalog,added.find(p=>p.pathId==='vd-court-ordered'));
 assert.match(administrativeText('de',copy.choiceKey),/Art.-81-Erstansetzung bis 30 Tage.*Verlängerung/);
 assert.match(administrativeText('de',copy.scopeKey),/nicht automatisch numerisch.*Erstansetzung über 30/);
 assert.match(administrativeText('de',copy.scopeKey),/keine Verlängerung ab dem alten Fristende/i);
 assert.equal(qualify('vd-court-ordered','2026-10-02',40,state('vd-court-ordered',false)).input,undefined);
});
test('M3 DE/FR readable trace separates VD postal dates, actual VS duration and NE reserve without rawIDs',()=>{
 for(const locale of['de','fr']as const){
  const raw=render('vd-admin-ordered','2026-09-19',locale,10,state('vd-admin-ordered',true,{openingMode:'vdUnsignedPostalReceipt'}));
  const trace=raw.document.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!;
  assert.match(trace,/19\.09\.2026/);assert.match(trace,/22\.09\.2026/);assert.doesNotMatch(trace,/SRC-|JUD-|CH-CAL-|Aktuelle Fachqualifikation|v10\.|Normtext, Änderungstabellen/);
  assert.match(trace,locale==='de'?/Tag nach der rechtlich massgebenden Eröffnung/:/Jour suivant la notification juridiquement déterminante/);
  assert.doesNotMatch(trace,/Trackingsendung|envoi suivi|expectedService/);assert.equal(raw.document.querySelector('.fr-calendar-export'),null);
  const longer=render('vs-admin-notice-long','2026-10-02',locale,15,state('vs-admin-notice-long',true,{ordinaryDays:10}));
  assert.match(longer.document.querySelector('[data-testid="administrative-current-notice-trace"]')!.textContent!,/10.*15/);
  const ne=render('ne-admin-ordered','2026-10-02',locale,10,state('ne-admin-ordered',true,{authorityHolidayRegion:'leLanderon'}));
  assert.match(ne.document.body.textContent!,locale==='de'?/Schliessanordnungen/:/fermetures annuelles/);
  assert.match(ne.document.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!,/Le Landeron/);
 }
});
test('M3 winter endpoints and actual five-/thirty-day triggers remain readable and independently selected',()=>{
 for(const locale of['de','fr']as const){const vs=render('vs-court-ordered','2026-12-17',locale,1);
  assert.equal(vs.result.outcome,'calculated');if(vs.result.outcome!=='calculated')throw Error('Calculated');assert.equal(vs.result.finalEnd,'2027-01-06');
  assert.match(vs.document.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!,/05\.01\.2027/);
  const ne=render('ne-court-ordered','2026-12-17',locale,1);assert.equal(ne.result.outcome,'calculated');if(ne.result.outcome!=='calculated')throw Error('Calculated');assert.equal(ne.result.finalEnd,'2027-01-04');
  for(const id of['vs-admin-written-5','vs-court-written-5','vs-admin-full-30','vs-court-full-30']){
   const r=render(id,undefined,locale);assert.match(r.document.querySelector('[data-testid="administrative-readable-trace"]')!.textContent!,locale==='de'?/keine Folgezustellung erfunden/:/Aucune notification future/);
  }
 }
});
test('M3 exact collision cases remain blocked, readable and without export rather than stopping an entire canton',()=>{
 const collisions=refs.filter(ref=>ref.expected.outcome==='unresolvedBoundaryProposed');assert.equal(collisions.length,3);
 for(const ref of collisions){const p=added.find(path=>path.researchRef===ref.path)!;
  const q=qualify(p.pathId,ref.trigger,ref.days,state(p.pathId,true,ref.facts));assert.ok(q.input);const result=ui.calculateAdministrativeUiDeadline(q.input,context);
  assert.equal(result.outcome,'blocked');assert.equal(result.calendarExportAllowed,false);
  for(const locale of['de','fr']as const){const doc:Document=new JSDOM(ui.result({catalog,context,input:q.input,result,locale,calendarReference:'',onCalendarReferenceChange(){},onExport(){}})).window.document;
   assert.equal(doc.querySelector('.fr-result__hero'),null);assert.equal(doc.querySelector('.fr-calendar-export'),null);
   assert.match(doc.querySelector('.fr-result__messages')!.textContent!,locale==='de'?/neu beginnenden Stillstand/:/nouvelle période de suspension/);
  }
 }
});
test('M3 readable norm labels do not import court-only recess into an administrative source label',()=>{
 assert.doesNotMatch(ap23m3NormLocator('SRC-M1-VS-LPJA-FR-API','vs-admin-ordered')!,/79a|80/);
 assert.doesNotMatch(ap23m3NormLocator('SRC-M1-VS-LPJA-FR-API','vs-admin-written-5')!,/79a|80/);
 assert.match(ap23m3NormLocator('SRC-M1-VS-LPJA-FR-API','vs-court-ordered')!,/79a/);
 assert.doesNotMatch(ap23m3NormLocator('SRC-M1-VD-LPA','vd-admin-grace-3')!,/96/);
 assert.match(ap23m3NormLocator('SRC-M1-VD-LPA','vd-court-instructing-provisional-10')!,/94 Abs. 2.*96 Abs. 2/);
 assert.equal(ap23m3NormLocator('SRC-M1-VD-LPA-REFORM','vd-admin-ordered'),undefined);
});
test('M3 V5 saves stable selections but no actual duration, region, legal facts, reference or date',()=>{
 const d={legacyData:ui.runtime.data,administrativeData:context},old={legacyData:ui.historicalRuntime.data,administrativeData:ui.historicalRuntime.administrativeContext};
 for(const p of added){const raw={...ui.emptyAdministrativePreferences(),authorityCode:catalog.laws.find(row=>row.lawId===p.lawId)!.canton,
  deadlineDays:p.duration.kind==='statutoryDays'?p.duration.value:45,deliveryMethod:'otherLegallyRelevantDate',
  procedureSelection:{kind:'cantonalAdministrative',lawId:p.lawId,pathId:p.pathId,revision:1,stage:p.stages[0]},
  currentValues:{openingMode:'vdUnsignedPostalReceipt',authorityHolidayRegion:'leLanderon',ordinaryDays:'10'},caseQualification:{actualInstructionDays:45},inputDate:'2026-10-02',calendarReference:'QA-PRIVATE-M3'};
  const values=new Map<string,string>([['fristenrechner.defaults.v1','legacy-unchanged']]),storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value)};
  const saved=ui.saveAdministrativeDefaults(d,storage,raw);assert.equal(saved.persistence,'stored',p.pathId);const bytes=values.get('fristenrechner.defaults.v5')!;
  assert.doesNotMatch(bytes,/currentValues|ordinaryDays|actualInstructionDays|authorityHolidayRegion|openingMode|2026-10-02|QA-PRIVATE-M3/);
  if(p.duration.kind!=='statutoryDays'){assert.equal(ui.requiresCurrentAdministrativeDuration(p),true);assert.equal(saved.preferences.deadlineDays,10);}
  assert.equal(ui.initializeAdministrativeDefaults(d,storage).legalQualification,false);
  assert.equal(ui.initializeAdministrativeDefaults(old,storage).persistence,'protected');ui.resetAdministrativeDefaults(old,storage);assert.equal(values.get('fristenrechner.defaults.v5'),bytes);
  assert.equal(values.get('fristenrechner.defaults.v1'),'legacy-unchanged');
 }
});
test('M3 full app keeps early date enabled, static seat label, two columns and blank current facts after defaults',()=>{
 const p=added.find(row=>row.pathId==='ne-admin-ordered')!,values=new Map<string,string>(),storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value)};
 let doc=new JSDOM(ui.app(storage)).window.document;
 assert.equal(doc.querySelector('input[name="inputDate"]')?.hasAttribute('disabled'),false);assert.match(doc.body.textContent!,/Sitz der zuständigen Stelle/);
 assert.equal(doc.querySelectorAll('.fr-form__grid').length,1);
 ui.saveAdministrativeDefaults({legacyData:ui.runtime.data,administrativeData:context},storage,{...ui.emptyAdministrativePreferences(),authorityCode:'NE',deadlineDays:35,
  deliveryMethod:'otherLegallyRelevantDate',procedureSelection:{kind:'cantonalAdministrative',lawId:p.lawId,pathId:p.pathId,revision:1,stage:p.stages[0]}});
 doc=new JSDOM(ui.app(storage)).window.document;
 assert.equal(doc.querySelector('input[name="inputDate"]')?.getAttribute('value'),'');assert.equal(doc.querySelector('input[type="number"]')?.getAttribute('value'),'');
 assert.equal(doc.querySelector('.fr-result__hero'),null);assert.match(doc.body.textContent!,/Aktueller Sitz der zuständigen Stelle in Neuenburg/);
 assert.equal(doc.querySelectorAll('.fr-form__grid').length,1);assert.doesNotMatch(doc.body.textContent!,/Unterstützter Verfahrenskontext/);
 assert.match(ui.app(storage,true),/nicht zu demselben geprüften Release/);
});
test('M3 forged, copied or local native results never enable calendar export',()=>{
 const r=render('vs-admin-notice-long','2026-10-02','de',15,state('vs-admin-notice-long',true,{ordinaryDays:10}));
 if(r.result.outcome!=='calculated')throw Error('Calculated');
 const forged={...r.result,referenceOnly:false,calendarExportAllowed:true};assert.equal(ui.administrativeExportAvailable(r.input,context,forged),false);
 assert.throws(()=>ui.createAdministrativeCalendarEntry({input:r.input,context,result:forged,locale:'de',reference:'QA-M3'}));
 assert.equal(ui.administrativeExportAvailable({...r.input,inputDate:'2026-10-03'},context,r.result),false);
 assert.equal(ui.administrativeExportAvailable(r.input,JSON.parse(JSON.stringify(context)),r.result),false);
});
