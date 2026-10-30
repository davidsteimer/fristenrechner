// SPDX-License-Identifier: AGPL-3.0-only
// Real Format-12 identities, native arithmetic and rendered shared UI.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { buildSync } from 'esbuild';
import type * as Helpers from '../../src/ui/administrativeUi';
import type * as Export from '../../src/ui/administrativeExport';
import type * as Defaults from '../../src/ui/administrativeDefaults';
import type { ParsedFormat12Data } from '../../src/core/releaseFormat12';
import type { AdministrativeDeadlineInput } from '../../src/core/administrativeDeadline';
import { administrativeMessages } from '../../src/ui/administrativeMessages';

const require = createRequire(import.meta.url), { JSDOM } = require('jsdom');
const bundled = buildSync({ stdin: { contents: `
  import React from 'react';
  import {renderToStaticMarkup} from 'react-dom/server';
  import {setIconOptions} from '@fluentui/react/lib/Styling';
  import {AdministrativeProcedureFields,AdministrativeResultView,AdministrativeAutomaticParameters} from './src/ui/administrativeUi';
  export * from './src/ui/administrativeUi';
  export * from './src/ui/administrativeExport';
  export * from './src/ui/administrativeDefaults';
  export * from './src/ui/socialUi';
  export {ap23h3CandidateRuntime as runtime} from './src/release/ap23h3CandidateData';
  export {ap23g3CandidateRuntime as historicalRuntime} from './src/release/ap23g3CandidateData';
  setIconOptions({disableWarnings:true});
  export const fields=props=>renderToStaticMarkup(React.createElement('div',{className:'fr-form__grid'},React.createElement(AdministrativeProcedureFields,props)));
  export const result=props=>renderToStaticMarkup(React.createElement(AdministrativeResultView,props));
  export const automatic=props=>renderToStaticMarkup(React.createElement(AdministrativeAutomaticParameters,props));
`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, platform: 'node', format: 'cjs', write: false,
external: ['react', 'react-dom/server'], logLevel: 'silent' });
const module = { exports: {} };
new Function('require', 'module', 'exports', bundled.outputFiles[0]!.text)(require, module, module.exports);
const ui = module.exports as typeof Helpers & typeof Export & typeof Defaults & typeof import('../../src/ui/socialUi') & {
  runtime: { administrativeContext: ParsedFormat12Data; data: Defaults.AdministrativeDefaultsContext['legacyData'] };
  historicalRuntime: { data: Defaults.AdministrativeDefaultsContext['legacyData'] };
  fields(props: Helpers.AdministrativeProcedureFieldsProps): string;
  result(props: Helpers.AdministrativeResultViewProps): string;
  automatic(props: {catalog: Helpers.AdministrativeUiCatalog; lawId: string; state: Helpers.AdministrativeUiState; locale: 'de' | 'fr'}): string;
};
const context = ui.runtime.administrativeContext, catalog = context.administrativeCatalog;
const added = catalog.paths.filter(p => ['stvg-vgv-ow', 'vrg-nw'].includes(p.lawId));
function state(pathId: string, qualification: Helpers.AdministrativeUiState['qualification'] = 'generalActualReceipt'): Helpers.AdministrativeUiState {
  const p = catalog.paths.find(p => p.pathId === pathId)!;
  return {stage: p.stages[0]!, pathId, qualification, urgency: 'none'};
}
function qualify(pathId: string, inputDate='2026-10-02', qualification: Helpers.AdministrativeUiState['qualification']='generalActualReceipt', days=10) {
  const p = catalog.paths.find(p => p.pathId === pathId)!;
  return ui.qualifyAdministrativeUiInput({catalog,lawId:p.lawId,authorityCanton:catalog.laws.find(l=>l.lawId===p.lawId)!.canton,
    inputDate,deadlineDays:p.duration.kind==='statutoryDays'?p.duration.value:days,state:state(pathId,qualification)});
}
function render(pathId: string, inputDate='2026-10-02', locale:'de'|'fr'='de', qualification: Helpers.AdministrativeUiState['qualification']='generalActualReceipt', days=10) {
  const q=qualify(pathId,inputDate,qualification,days);assert.deepEqual(q.errors,{});assert.ok(q.input);
  const result=ui.calculateAdministrativeUiDeadline(q.input,context);
  const html=ui.result({catalog,context,result,input:q.input,locale,calendarReference:'',onCalendarReferenceChange(){}});
  return{input:q.input,result,html,document:new JSDOM(html).window.document};
}

test('H3 labels cover all 79 native paths and every current-case and scope text in DE and FR',()=>{
  assert.equal(catalog.paths.length,79);assert.equal(added.length,21);
  assert.deepEqual(Object.keys(administrativeMessages.de).sort(),Object.keys(administrativeMessages.fr).sort());
  for(const p of catalog.paths)for(const locale of ['de','fr'] as const){
    const messages=administrativeMessages[locale] as Record<string,string>;
    assert.ok(messages[`law.${p.lawId}`]);assert.doesNotMatch(ui.administrativeActionLabel(p,locale),/^(?:action|path)\./);
    const view=ui.administrativeQualificationPresentation(catalog,p);
    assert.ok(messages[view.choiceKey],view.choiceKey);assert.ok(messages[view.scopeKey],view.scopeKey);
  }
});
test('H3 every new path requires current positive qualification and supplies its exact reviewed facts only then',()=>{
  for(const p of added){
    for(const key of ['','unknown','specialOrDeviating'] as const){const q=qualify(p.pathId,'2026-10-02',key);assert.equal(q.input,undefined,p.pathId);assert.ok(q.errors.qualification);}
    const q=qualify(p.pathId);assert.ok(q.input);const policy=catalog.qualificationPolicies.find(q=>q.pathId===p.pathId)!;
    assert.equal(policy.mode,'qualifiedDayProcedureV5');if(policy.mode!=='qualifiedDayProcedureV5')continue;
    const facts=q.input.caseQualification as unknown as Record<string,string|boolean>;
    for(const requirement of policy.requirements)assert.equal(facts[requirement.key],requirement.value,`${p.pathId}:${requirement.key}`);
    const result=ui.calculateAdministrativeUiDeadline(q.input,context);assert.equal(result.outcome,'calculated',p.pathId);
    assert.equal(ui.administrativeExportAvailable(q.input,context,result),false,p.pathId);
    const html=ui.fields({catalog,lawId:p.lawId,locale:'de',value:state(p.pathId),onChange(){}});
    const document=new JSDOM(html).window.document;
    assert.equal(document.querySelectorAll('.fr-form__grid').length,1);
    assert.equal(document.querySelectorAll('input[type="checkbox"]').length,0);
    assert.doesNotMatch(html,/Fristauslösendes Dokument|Massgeblicher Feiertagskanton|Zielgericht|Eröffnungsherkunft|Gemeinde wählen/);
  }
});
test('H3 OW original and timely-requested full reasons are two genuine options of the existing field',()=>{
  for(const id of ['ow-admin-20','ow-court-30']){
    const first=qualify(id).input!,second=qualify(id,'2026-10-02','reasonedFollowingTimelyRequest').input!;
    assert.equal((first.caseQualification as any).openingOrigin,'originalReasoned');
    assert.equal(Object.hasOwn(first.caseQualification!,'priorReasonsRequest'),false);
    assert.equal((second.caseQualification as any).openingOrigin,'reasonedFollowingTimelyRequest');
    assert.equal((second.caseQualification as any).priorReasonsRequest,'timelyEstablished');
    assert.equal(ui.calculateAdministrativeUiDeadline(second,context).outcome,'calculated');
    const changed=ui.changeAdministrativeSelection(catalog,'stvg-vgv-ow',state(id,'reasonedFollowingTimelyRequest'),'pathId',id.startsWith('ow-admin')?'ow-admin-reasons-30':'ow-court-reasons-30');
    assert.equal(changed.qualification,'');
  }
  for(const p of added.filter(p=>!['ow-admin-20','ow-court-30'].includes(p.pathId)))assert.equal(qualify(p.pathId,'2026-10-02','reasonedFollowingTimelyRequest').input,undefined,p.pathId);
});
test('H3 same issuer, special five-day review, admissible Einsprache and matching exchange document remain different facts',()=>{
  const expected=[
    ['ow-admin-reasons-30','sameIssuingAuthority',true],['ow-court-reasons-30','sameIssuingCourt',true],
    ['ow-court-suspensive-5','suspensiveReviewContext','sameOverallCourt'],
    ['nw-einsprache-20','einspracheAdmissibility','establishedNoDeviatingSpecialRule'],
    ['nw-admin-vernehmlassung-20','opening','appealServedForComments'],
    ['nw-admin-replik-20','opening','vernehmlassungServedForReply'],['nw-admin-duplik-20','opening','replikServedForDuplik']
  ] as const;
  for(const[id,key,value]of expected){const input=qualify(id).input!;assert.equal((input.caseQualification as any)[key],value);
    const bad={...input,caseQualification:{...input.caseQualification,[key]:typeof value==='boolean'?false:'unknown'}} as AdministrativeDeadlineInput;
    assert.notEqual(ui.calculateAdministrativeUiDeadline(bad,context).outcome,'calculated',id);
  }
  for(const p of added){const input=qualify(p.pathId).input!;
    const bad={...input,caseQualification:{...input.caseQualification,localHolidayEffect:'concretePotentialEndChangeUnresolved'}} as AdministrativeDeadlineInput;
    assert.notEqual(ui.calculateAdministrativeUiDeadline(bad,context).outcome,'calculated',p.pathId);
    if(p.lawId==='vrg-nw')for(const[key,value]of [['deadlineAgreement','byAgreement'],['suspensionException','unknown']] as const){
      const changed={...input,caseQualification:{...input.caseQualification,[key]:value}} as AdministrativeDeadlineInput;
      assert.notEqual(ui.calculateAdministrativeUiDeadline(changed,context).outcome,'calculated',`${p.pathId}:${key}`);
    }
  }
});
test('H3 legal duration cannot become an editable order and all six statutory exchanges stay twenty days',()=>{
  const exchange=added.filter(p=>p.action.startsWith('statutory'));assert.equal(exchange.length,6);
  for(const p of added){const options={catalog,lawId:p.lawId,authorityCanton:p.lawId==='vrg-nw'?'NW':'OW',inputDate:'2026-10-02',state:state(p.pathId)};
    if(p.duration.kind==='statutoryDays')assert.equal(ui.qualifyAdministrativeUiInput({...options,deadlineDays:p.duration.value+1}).input,undefined,p.pathId);
    else {assert.ok(ui.qualifyAdministrativeUiInput({...options,deadlineDays:7}).input);assert.equal(ui.qualifyAdministrativeUiInput({...options,deadlineDays:0}).input,undefined);}
  }
  for(const p of exchange)assert.equal(qualify(p.pathId).input!.deadlineDays,20);
});
test('H3 automatic suspension distinguishes none winter-only and three periods without a redundant canton field',()=>{
  for(const[id,expected,excluded]of[
    ['nw-admin-ordered','Kein Friststillstand','Ostern'],['nw-einwendung-ordered','nur Winterstillstand','Ostern'],
    ['nw-einsprache-20','Ostern','nur Winterstillstand'],['ow-court-suspensive-5','Kein Friststillstand','Ostern']
  ]){const p=catalog.paths.find(p=>p.pathId===id)!;const html=ui.automatic({catalog,lawId:p.lawId,state:state(id!),locale:'de'});
    const text=new JSDOM(html).window.document.querySelector('dl')!.textContent!;assert.match(text,new RegExp(expected!));assert.doesNotMatch(text,new RegExp(excluded!));
    assert.equal(new JSDOM(html).window.document.querySelector('[role="combobox"]'),null);
  }
});
test('H3 actual arithmetic retains NW relative suspension and qualified OW vacation freedom in rendered results',()=>{
  for(const[id,received,days,end]of[
    ['nw-admin-ordered','2026-12-10',20,'2026-12-30'],['nw-einwendung-ordered','2026-12-10',20,'2027-01-15'],
    ['nw-einwendung-ordered','2027-07-10',20,'2027-07-30'],['nw-admin-vernehmlassung-20','2027-07-10',20,'2027-08-31'],
    ['ow-court-suspensive-5','2026-12-23',5,'2026-12-28']
  ] as const){const output=render(id,received,'de','generalActualReceipt',days);assert.equal(output.result.outcome,'calculated');
    if(output.result.outcome==='calculated')assert.equal(output.result.finalEnd,end);
  }
});
test('H3 DE FR traces show linked norms and honest OW administrative versus judicial holiday roles without raw identifiers',()=>{
  for(const locale of ['de','fr'] as const)for(const id of ['ow-admin-reasons-30','ow-court-reasons-30','ow-court-suspensive-5','nw-admin-replik-20']){
    const view=render(id,'2026-12-10',locale),trace=view.document.querySelector('[data-testid="administrative-readable-trace"]')!;
    assert.doesNotMatch(trace.textContent!,/SRC-|JUD-|CH-CAL-|scope\.|case\.|qualifiedDayProcedure|H1-C|normTimeline/);
    assert.ok(trace.querySelectorAll('a[href^="https://"]').length>0);
    if(id==='ow-admin-reasons-30')assert.match(trace.textContent!,locale==='de'?/systematischen Übertragung/:/transfert systématique/);
    if(id==='ow-court-reasons-30')assert.match(trace.textContent!,locale==='de'?/gerichtlich unmittelbar/:/directement en justice/);
    if(id.includes('reasons'))assert.match(trace.textContent!,/112/);
    if(id==='nw-admin-replik-20')assert.match(trace.textContent!,/77/);
  }
});
test('H3 all new diagnostics are human readable and collision blocks never inherit the Tessin label or an export',()=>{
  for(const policy of catalog.qualificationPolicies)if(policy.mode==='qualifiedDayProcedureV5')for(const requirement of policy.requirements){
    for(const locale of ['de','fr'] as const)assert.ok((administrativeMessages[locale] as Record<string,string>)[`administrative.${requirement.reason}`],requirement.reason);
  }
  for(const id of ['nw-einsprache-20','nw-admin-vernehmlassung-20','ow-admin-20'])for(const locale of ['de','fr'] as const){
    const view=render(id,'2027-02-28',locale);assert.equal(view.result.outcome,'blocked');
    assert.doesNotMatch(view.html,/Tessiner Grenzfall|cas limite tessinois/);
    assert.match(view.html,locale==='de'?/Endverschiebung.*Friststillstand/:/report.*suspension/);
    assert.equal(view.document.querySelector('.fr-calendar-export'),null);
  }
  const view=render('ow-admin-20');assert.equal(view.result.outcome,'calculated');
  if(view.result.outcome!=='calculated')return;
  const forged={...view.result,referenceOnly:false,calendarExportAllowed:true};
  assert.equal(ui.administrativeExportAvailable(view.input,context,forged),false);
  assert.throws(()=>ui.createAdministrativeCalendarEntry({input:view.input,context,result:forged,locale:'de'}),/calendarExportNotBound/);
});
test('H3 V5 preferences retain stable selections only and never accept current facts or resurrect an old result',()=>{
  const defaultsContext={legacyData:ui.runtime.data,administrativeData:context};
  for(const p of added){const input=qualify(p.pathId).input!;
    const clean=ui.sanitizeAdministrativePreferences(defaultsContext,{...ui.emptyAdministrativePreferences(),authorityCode:input.authoritySeat.canton,
      deadlineDays:input.deadlineDays,deliveryMethod:'otherLegallyRelevantDate',procedureSelection:input.selection,
      inputDate:'2026-10-02',calendarReference:'SYNTHETIC-NOT-A-DEFAULT',caseQualification:input.caseQualification,
      deadlineAgreement:'notByAgreement',sameIssuingAuthority:true,einspracheAdmissibility:'establishedNoDeviatingSpecialRule'});
    const values=new Map<string,string>(),storage={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);}};
    assert.equal(ui.saveAdministrativeDefaults(defaultsContext,storage,clean).persistence,'stored');
    assert.deepEqual(ui.initializeAdministrativeDefaults(defaultsContext,storage).preferences.procedureSelection,input.selection);
    assert.doesNotMatch(values.get(ui.ADMINISTRATIVE_DEFAULTS_STORAGE_KEY)!,/inputDate|caseQualification|deadlineAgreement|sameIssuing|einspracheAdmissibility|openingOrigin|SYNTHETIC|2026-10-02/);
  }
});
test('H3 and historical G3 keep the eleven social-law UI choices but reject unsupported format or missing catalog',()=>{
  assert.equal(ui.hasSocialUi(ui.runtime.data),true);assert.equal(ui.hasSocialUi(ui.historicalRuntime.data),true);
  assert.equal(ui.hasSocialUi({...ui.runtime.data,formatVersion:'99.0.0'}),false);
  assert.equal(ui.hasSocialUi({...ui.runtime.data,socialProcedureCatalogs:new Map()}),false);
  assert.equal(ui.SOCIAL_UI_LAWS.length,11);
  for(const runtime of [ui.runtime,ui.historicalRuntime]){
    const bindingIds=new Set<string>(),ruleIds=new Set<string>();
    for(const law of ui.SOCIAL_UI_LAWS)for(const action of [law==='ivg'?'preliminary-objection':'objection','appeal','ongoing','complaint-correction']){
      const path=ui.socialUiPath(runtime.data,{area:'social',law,action,stage:action==='ongoing'?'administration':''});
      assert.ok(path,`${runtime.data.formatVersion}:${law}:${action}`);ruleIds.add(path.rule.ruleId);
      for(const selection of path.selections){assert.equal(selection.binding.procedureContextCanton,'BE');bindingIds.add(selection.binding.bindingId);}
    }
    assert.equal(ruleIds.size,44);assert.equal(bindingIds.size,50);
  }
});
