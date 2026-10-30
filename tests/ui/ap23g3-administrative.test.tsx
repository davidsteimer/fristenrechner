// SPDX-License-Identifier: AGPL-3.0-only
// Actual native Format-11 candidate and shared module identities, no result substitution.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { buildSync } from 'esbuild';
import type * as Helpers from '../../src/ui/administrativeUi';
import type * as Export from '../../src/ui/administrativeExport';
import type * as Defaults from '../../src/ui/administrativeDefaults';
import type { ParsedFormat11Data } from '../../src/core/releaseFormat11';
import type { AdministrativeDeadlineInput } from '../../src/core/administrativeDeadline';
import type { AdministrativeCaseQualificationV4 } from '../../src/core/administrativeTypesV4';
import { administrativeMessages } from '../../src/ui/administrativeMessages';

const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const bundled = buildSync({ stdin: { contents: `
  import React from 'react';
  import {renderToStaticMarkup} from 'react-dom/server';
  import {setIconOptions} from '@fluentui/react/lib/Styling';
  import {AdministrativeProcedureFields,AdministrativeResultView,AdministrativeAutomaticParameters} from './src/ui/administrativeUi';
  export * from './src/ui/administrativeUi';
  export * from './src/ui/administrativeExport';
  export * from './src/ui/administrativeDefaults';
  export {ap23g3CandidateRuntime as runtime} from './src/release/ap23g3CandidateData';
  setIconOptions({disableWarnings:true});
  export const fields=props=>renderToStaticMarkup(React.createElement('div',{className:'fr-form__grid'},React.createElement(AdministrativeProcedureFields,props)));
  export const result=props=>renderToStaticMarkup(React.createElement(AdministrativeResultView,props));
  export const automatic=props=>renderToStaticMarkup(React.createElement(AdministrativeAutomaticParameters,props));
`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, platform: 'node', format: 'cjs', write: false,
external: ['react', 'react-dom/server'], logLevel: 'silent' });
const module = { exports: {} };
new Function('require', 'module', 'exports', bundled.outputFiles[0]!.text)(require, module, module.exports);
const ui = module.exports as typeof Helpers & typeof Export & typeof Defaults & {
  runtime: { administrativeContext: ParsedFormat11Data; data: Defaults.AdministrativeDefaultsContext['legacyData'] };
  fields(props: Helpers.AdministrativeProcedureFieldsProps): string;
  result(props: Helpers.AdministrativeResultViewProps): string;
  automatic(props: {catalog: Helpers.AdministrativeUiCatalog; lawId: string; state: Helpers.AdministrativeUiState; locale: 'de' | 'fr'}): string;
};
const context = ui.runtime.administrativeContext, catalog = context.administrativeCatalog;
const added = catalog.paths.filter(p => ['vrpv-ur', 'vrg-so', 'vrg-sh'].includes(p.lawId));
const facts = (input: AdministrativeDeadlineInput): AdministrativeCaseQualificationV4 => input.caseQualification as AdministrativeCaseQualificationV4;
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

test('G3 labels cover all 58 native paths and remain exactly bilingual',()=>{
  assert.equal(catalog.paths.length,58);assert.equal(added.length,16);
  assert.deepEqual(Object.keys(administrativeMessages.de).sort(),Object.keys(administrativeMessages.fr).sort());
  for(const p of catalog.paths)for(const locale of ['de','fr'] as const){
    const messages=administrativeMessages[locale] as Record<string,string>;
    assert.ok(messages[`law.${p.lawId}`]);assert.doesNotMatch(ui.administrativeActionLabel(p,locale),/^(?:action|path)\./);
    const view=ui.administrativeQualificationPresentation(catalog,p);
    assert.ok(messages[view.choiceKey],view.choiceKey);assert.ok(messages[view.scopeKey],view.scopeKey);
  }
});
test('G3 grouped qualification is required on all sixteen new routes and supplies no facts while pending',()=>{
  for(const p of added)for(const key of ['','unknown','specialOrDeviating'] as const){
    const q=qualify(p.pathId,'2026-10-02',key);assert.equal(q.input,undefined,p.pathId);assert.ok(q.errors.qualification);
  }
  for(const p of added){const output=render(p.pathId);assert.equal(output.result.outcome,'calculated',p.pathId);
    assert.equal(ui.administrativeExportAvailable(output.input,context,output.result),false);}
});
test('G3 six opening chains use two explicit positive cases in the existing field and no extra input',()=>{
  let count=0;
  for(const p of added){const policy=catalog.qualificationPolicies.find(q=>q.pathId===p.pathId)!;
    assert.equal(policy.mode,'qualifiedDayProcedureV4');if(policy.mode!=='qualifiedDayProcedureV4')continue;
    const html=ui.fields({catalog,lawId:p.lawId,locale:'de',value:state(p.pathId),onChange(){}});
    assert.doesNotMatch(html,/type="checkbox"|Fristauslösendes Dokument|Zielorgan|Massgeblicher Feiertagskanton|label[^>]*>Eröffnungsherkunft/);
    if(policy.requirements.openingChainPolicy==='requireOriginalOrTimelyRequestedReasons'){
      count++;const first=qualify(p.pathId).input!,second=qualify(p.pathId,'2026-10-02','reasonedFollowingTimelyRequest').input!;
      assert.equal(facts(first).openingOrigin,'originalReasoned');assert.equal(Object.hasOwn(first.caseQualification!,'priorReasonsRequest'),false);
      assert.equal(facts(second).openingOrigin,'reasonedFollowingRequest');assert.equal(facts(second).priorReasonsRequest,'timelyEstablished');
      assert.equal(ui.calculateAdministrativeUiDeadline(second,context).outcome,'calculated');
    }else assert.equal(qualify(p.pathId,'2026-10-02','reasonedFollowingTimelyRequest').input,undefined,p.pathId);
  }assert.equal(count,6);
});
test('G3 four reasons actions are distinct and same-court and express-offer facts are not replaced by a generic appeal',()=>{
  for(const[id,opening]of[
    ['ur-admin-reasons-10','lawfullyUnreasonedAdministrativeDecision'],
    ['so-admin-reasons-10','lawfullyUnreasonedAdministrativeDecisionWithExpressReasonsOffer'],
    ['sh-admin-reasons-10','lawfullyUnreasonedAdministrativeDecisionWithExpressReasonsOffer'],
    ['sh-court-reasons-30','legallyQualifiedCourtDispositiveOrOralOpening']
  ] as const){const q=qualify(id).input!;assert.equal(facts(q).opening,opening);
    assert.equal(Object.hasOwn(q.caseQualification!,'openingOrigin'),false);
    if(id==='sh-court-reasons-30'){assert.equal(q.deadlineDays,30);assert.equal(facts(q).sameIssuingCourt,true);assert.equal(facts(q).targetCourt,'SH-Obergericht');}
    else assert.equal(q.deadlineDays,10);
  }
});
test('G3 defaults round-trip stable paths only, never any new opening, local or coordination fact',()=>{
  const defaultsContext={legacyData:ui.runtime.data,administrativeData:context};
  for(const p of added){const input=qualify(p.pathId).input!;
    const clean=ui.sanitizeAdministrativePreferences(defaultsContext,{...ui.emptyAdministrativePreferences(),authorityCode:input.authoritySeat.canton,
      deadlineDays:input.deadlineDays,deliveryMethod:'otherLegallyRelevantDate',procedureSelection:input.selection,
      inputDate:'2026-10-02',qualification:'reasonedFollowingTimelyRequest',caseQualification:input.caseQualification,
      openingOrigin:'reasonedFollowingRequest',priorReasonsRequest:'timelyEstablished',coordinatedDecision:false,localHolidayEffect:'noAdditionalRelevantLocalHoliday'});
    const values=new Map<string,string>(),storage={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);}};
    assert.equal(ui.saveAdministrativeDefaults(defaultsContext,storage,clean).persistence,'stored');
    assert.deepEqual(ui.initializeAdministrativeDefaults(defaultsContext,storage).preferences.procedureSelection,input.selection);
    assert.doesNotMatch(values.get(ui.ADMINISTRATIVE_DEFAULTS_STORAGE_KEY)!,/inputDate|qualification|openingOrigin|priorReasonsRequest|coordinatedDecision|localHolidayEffect|sameIssuingCourt|2026-10-02/);
  }
});
test('G3 path and stage changes clear both kinds of positive opening qualification',()=>{
  for(const key of ['generalActualReceipt','reasonedFollowingTimelyRequest'] as const){
    for(const changed of [ui.changeAdministrativeSelection(catalog,'vrpv-ur',state('ur-admin-20',key),'pathId','ur-admin-reasons-10'),
      ui.changeAdministrativeSelection(catalog,'vrpv-ur',state('ur-admin-20',key),'stage','court')])assert.equal(changed.qualification,'');
  }
});
test('G3 Urner opening notice is visible and linked but has no arithmetic effect or extra pause',()=>{
  for(const locale of ['de','fr'] as const){const output=render('ur-admin-20','2026-12-23',locale);
    assert.equal(output.result.outcome,'calculated');if(output.result.outcome!=='calculated')continue;
    assert.equal(output.result.finalEnd,'2027-01-12');assert.equal(output.result.skippedCalendarDays,0);
    assert.deepEqual(output.result.warningKeys,['administrative.urArt22OpeningRestriction']);
    const warning=output.document.querySelector('.ms-MessageBar--warning')!;
    assert.match(warning.textContent,/Art\. 22|art\. 22/);assert.doesNotMatch(warning.textContent,/administrative\.urArt22OpeningRestriction/);
    const trace=output.document.querySelector('[data-testid="administrative-readable-trace"]')!;
    assert.ok(Array.from(trace.querySelectorAll('a')).some((a:any)=>/Art\. 22/.test(a.textContent)));
  }
  const ordinary=render('ur-admin-20');assert.equal(ordinary.result.warningKeys?.length??0,0);
  const reasons=render('ur-admin-reasons-10','2026-12-23');assert.equal(reasons.result.warningKeys?.length??0,0);
});
test('G3 Schaffhausen administrative holiday trace links its own BGer practice, not judicial physical provenance',()=>{
  for(const locale of ['de','fr'] as const){const output=render('sh-admin-ordered','2026-12-31',locale,'generalActualReceipt',1);
    assert.equal(output.result.outcome,'calculated');if(output.result.outcome==='calculated')assert.equal(output.result.finalEnd,'2027-01-04');
    const trace=output.document.querySelector('[data-testid="administrative-readable-trace"]')!;
    assert.match(trace.textContent,locale==='de'?/Bundesgericht zur Verwaltungspraxis SH am 2\. Januar/:/Tribunal fédéral sur la pratique administrative SH du 2 janvier/);
    assert.doesNotMatch(trace.textContent,/OGE|2018|SRC-|JUD-|SH-ZPO-ADDITIONAL|ap22/);
    assert.ok(trace.querySelector('a[href*="2C_483"]'));
    const judicial=render('sh-court-20','2026-10-02',locale).document.querySelector('[data-testid="administrative-readable-trace"]')!;
    assert.match(judicial.textContent,locale==='de'?/Obergericht SH zur gerichtlichen Feiertagspraxis/:/Tribunal supérieur SH sur la pratique judiciaire/);
    assert.doesNotMatch(judicial.textContent,/Verwaltungspraxis SH am 2\. Januar/);
  }
});
test('G3 automatic holiday roles are derived and never offered as a free canton selector',()=>{
  for(const[id,expected]of[['ur-admin-reasons-10',/Sitz der eröffnenden Stelle/],['ur-admin-20',/Sitz der zuständigen Zielstelle/],['sh-court-20',/Sitz des zuständigen Gerichts/]] as const){
    const p=catalog.paths.find(p=>p.pathId===id)!;const html=ui.automatic({catalog,lawId:p.lawId,state:state(id),locale:'de'});
    assert.match(html,expected);assert.doesNotMatch(html,/role="combobox"|Massgeblicher Feiertagskanton/);
  }
});
test('G3 all seven limited end-shift collisions use a generic explained block with no Tessin label or export',()=>{
  for(const[id,received,days]of[['ur-court-20','2027-02-28',20],['ur-court-ordered','2027-03-01',19],
    ['so-court-10','2027-03-10',10],['so-court-ordered','2027-03-10',10],['sh-court-20','2027-02-28',20],
    ['sh-court-ordered','2027-03-10',10],['sh-court-reasons-30','2027-02-18',30]] as const)for(const locale of ['de','fr'] as const){
      const output=render(id,received,locale,'generalActualReceipt',days);assert.equal(output.result.outcome,'blocked');
      assert.match(output.html,locale==='de'?/Endverschiebung.*Friststillstand/:/report.*suspension/);
      assert.doesNotMatch(output.html,/Tessiner Grenzfall|cas limite tessinois/);assert.equal(output.document.querySelector('.fr-result__hero'),null);
      assert.equal(output.document.querySelector('.fr-calendar-export'),null);
    }
});
test('G3 all new native diagnostics have symmetric human-readable translations and export remains identity-bound',()=>{
  const base=render('ur-admin-20');
  if(base.result.outcome!=='calculated')throw new Error('Positive native reference required');
  for(const[field,value,key]of[
    ['openingOrigin','unknown','administrative.openingOriginNotQualified'],
    ['localHolidayEffect','concretePotentialEndChangeUnresolved','administrative.urLocalHolidayEffectUnresolved'],
    ['coordinatedDecision',true,'administrative.urCoordinatedPeriodUnresolved']
  ] as const){const input={...base.input,caseQualification:{...base.input.caseQualification!,[field]:value}} as AdministrativeDeadlineInput;
    const result=ui.calculateAdministrativeUiDeadline(input,context);assert.equal(result.outcome,'blocked');
    if(result.outcome==='blocked')assert.ok(result.blockReasonKeys.includes(key),result.blockReasonKeys.join(','));
    for(const locale of ['de','fr'] as const)assert.ok((administrativeMessages[locale] as Record<string,string>)[key]);
    assert.equal(ui.administrativeExportAvailable(input,context,base.result),false);
  }
  const forged={...base.result,referenceOnly:false,calendarExportAllowed:true};
  assert.equal(ui.administrativeExportAvailable(base.input,context,forged),false);
  assert.throws(()=>ui.createAdministrativeCalendarEntry({input:base.input,context,result:forged,locale:'de'}),/calendarExportNotBound/);
});
