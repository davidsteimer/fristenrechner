// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { buildSync } from 'esbuild';
import { authorityOptions, profilesForAuthority, type CalculatorFormState } from '../../src/ui/model';
import { calendarMessages, calendarCantonLabel, calendarReason } from '../../src/ui/calendarMessages';
import { mvp06CalculationData as data } from '../../src/release/mvp06ReleaseData';
import { DEFAULTS_STORAGE_KEY, initialDefaults, type StorageLike } from '../../src/ui/defaults';
import { calculateCalendarBoundDeadline } from '../../src/core/calculateCalendarBoundDeadline';
import type { BoundCalendarRuntime, CalendarContext } from '../../src/core/calendarResolution';
import type { FristenrechnerAppProps } from '../../src/ui/FristenrechnerApp';
import type { Locale } from '../../src/ui/i18n';
import type { JanuaryComparison } from '../../src/core/calculateCalendarBoundDeadline';

// Fluent UI's browser modules need bundling. Exercise the actual React component
// through the same transform, then server-render it without a browser shim.
const bundled=buildSync({stdin:{contents:`import * as React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {setIconOptions} from '@fluentui/react/lib/Styling';
setIconOptions({disableWarnings:true});
import {FristenrechnerApp} from './src/ui/FristenrechnerApp';
import {JanuaryComparisonTrace} from './src/ui/calendarContextUi';
export {changeCalendarPlace,changeCalendarRole,contextForProfile,regionalScope} from './src/ui/calendarContextUi';
export const renderJanuary=(props)=>renderToStaticMarkup(React.createElement(JanuaryComparisonTrace,props));
export const render=(props)=>renderToStaticMarkup(React.createElement(FristenrechnerApp,props));`,resolveDir:process.cwd(),loader:'tsx'},
  bundle:true,platform:'node',format:'cjs',write:false,external:['react','react-dom/server'],logLevel:'silent'});
const module={exports:{}};
new Function('require','module','exports',bundled.outputFiles[0]!.text)(createRequire(import.meta.url),module,module.exports);
const ui=module.exports as {
  render:(props:FristenrechnerAppProps)=>string;
  changeCalendarPlace:(context:CalendarContext,canton:string)=>CalendarContext;
  changeCalendarRole:(context:CalendarContext,role:CalendarContext['role'])=>CalendarContext;
  contextForProfile:(profileId:string,value?:CalendarContext)=>CalendarContext;
  regionalScope:(canton:string)=>string|undefined;
  renderJanuary:(props:{comparison:JanuaryComparison;locale:Locale})=>string;
};
const base='outputs/ap22c1-2026-10-08';
const catalogBytes=readFileSync(`${base}/holiday-catalogs/ch-holiday-catalog.json`);
const runtime:BoundCalendarRuntime={catalog:JSON.parse(catalogBytes.toString()),
  calendars:readdirSync(`${base}/calendars`).filter(path=>path.endsWith('.json')).map(path=>JSON.parse(readFileSync(`${base}/calendars/${path}`,'utf8'))),
  catalogSha256:createHash('sha256').update(catalogBytes).digest('hex'),releaseId:'2026-10-08-ap22c2-reference.1',referenceOnly:true};
function render(initialState:Partial<CalculatorFormState>={},locale:Locale='de',candidate=true):string{
  const defaults={...initialDefaults(data,candidate),locale};
  const storage:StorageLike={getItem:key=>key===DEFAULTS_STORAGE_KEY?JSON.stringify(defaults):null,setItem:()=>{},removeItem:()=>{}};
  return ui.render({data,storage,initialState,...(candidate?{calendarRuntime:runtime}:{})});
}
function decoded(html:string):string{return html.replaceAll('&#x27;',"'").replaceAll('&quot;','"').replaceAll('&amp;','&');}

test('C2 offers Bund plus 26 authority cantons without opening cantonal procedures outside Bern',()=>{
  assert.equal(authorityOptions(data,true).length,27);
  assert.equal(authorityOptions(data).length,2);
  for(const authority of authorityOptions(data,true)){
    const profiles=profilesForAuthority(data,authority.code).map(profile=>profile.profileId);
    assert.deepEqual(profiles.filter(id=>id==='vrpg-be'),authority.code==='BE'?['vrpg-be']:[]);
    assert.equal(profiles.filter(id=>['stpo','zpo','bgg','vwvg'].includes(id)).length,4);
  }
});

test('C2 uses static authority label and separate qualified role/place fields',()=>{
  const html=render({profileId:'stpo'});
  for(const label of ['Sitz der zuständigen Stelle','Massgebende Zustellkonstellation','Massgebender Feiertagskanton'])assert.ok(html.includes(label),label);
  assert.ok(html.includes('lokale Prüfrechnung'));
  assert.doesNotMatch(html,/Kalender übersteuern|Weiterer Feiertagsort/);
  assert.match(html,/fr-form__grid/);
});

test('C2 leaves the initial receipt date usable while calendar context is unresolved',()=>{
  const html=render({profileId:'stpo',inputDate:'2026-10-08'});
  const date=html.match(/<input[^>]*type="date"[^>]*>/)?.[0];
  assert.ok(date);
  assert.match(date,/value="2026-10-08"/);
  assert.doesNotMatch(date,/disabled|aria-disabled="true"/);
  assert.match(html,/Feiertagsanknüpfung bitte vervollständigen/);
});

test('ZPO fixes the court role without presenting a pointless role dropdown',()=>{
  const html=render({profileId:'zpo',selectors:{deliveryMethod:'otherLegallyRelevantDate',procedureVariant:'ordinary'}});
  assert.match(html,/value="Sitz des Gerichts"/);
  assert.match(html,/read[oO]nly/);
  assert.doesNotMatch(html,/Partei ohne Vertretung|Eindeutig bestimmte qualifizierte/);
  assert.deepEqual(ui.contextForProfile('zpo'),{role:'court',canton:'',areaFacts:{}});
});

for(const canton of ['AI','NE'])test(`${canton} has an explicit regional yes/no field, never an implicit no`,()=>{
  const scope=ui.regionalScope(canton)!;
  const context:CalendarContext={role:'partyWithoutRepresentative',canton,areaFacts:{}};
  const html=render({profileId:'stpo',calendarContext:context});
  assert.match(html,canton==='AI'?/Inneren Land/:/Le Landeron/);
  assert.equal(context.areaFacts[scope],undefined);
  assert.deepEqual(ui.changeCalendarPlace({...context,areaFacts:{[scope]:false}},'BE').areaFacts,{});
});

test('changing a role discards the old place and regional case assumptions',()=>{
  assert.deepEqual(ui.changeCalendarRole({role:'partyWithoutRepresentative',canton:'AI',areaFacts:{'AI-RTG-INNER-ADDITIONAL':true}},'qualifiedServiceRepresentative'),
    {role:'qualifiedServiceRepresentative',canton:'',areaFacts:{}});
});

test('GR boundary follows the used holiday canton, not the authority seat',()=>{
  const context:CalendarContext={role:'partyWithoutRepresentative',canton:'GR',areaFacts:{}};
  assert.match(render({authorityCode:'BE',profileId:'stpo',calendarContext:context}),/Graubünden: bestätigter Grundkatalog/);
  assert.doesNotMatch(render({authorityCode:'GR',profileId:'stpo',calendarContext:{...context,canton:'BE'}}),/Graubünden: bestätigter Grundkatalog/);
});

test('bound local reference calculations cannot export a calendar entry',()=>{
  const result=calculateCalendarBoundDeadline({profileId:'stpo',inputDate:'2026-09-16',inputDateSemantics:'legallyRelevantDeliveryOrEventDate',deadlineDays:10,calendarId:'be-public-holidays',holidayAnchorCandidates:['BE'],selectors:{deliveryMethod:'otherLegallyRelevantDate'},confirmations:{holidayAnchorConfirmed:true,deliveryFictionApplicabilityConfirmed:false,specialLawChecked:false}},
    {role:'partyWithoutRepresentative',canton:'BE',areaFacts:{}},data,runtime);
  assert.equal(result.outcome,'calculated');
  assert.equal(result.referenceOnly,true);
  assert.equal(result.calendarExportAllowed,false);
});

test('legacy UI without runtime keeps its prior label and no new context fields',()=>{
  const html=render({profileId:'stpo'},'de',false);
  assert.doesNotMatch(html,/Massgebende Zustellkonstellation|Massgebender Feiertagskanton|lokale Prüfrechnung/);
  assert.match(html,/Verfahrenskontext/);
});

test('Bern VRPG is not routed through the new federal calendar fields',()=>{
  const html=render({authorityCode:'BE',profileId:'vrpg-be'});
  assert.doesNotMatch(html,/Massgebende Zustellkonstellation|Massgebender Feiertagskanton/);
  assert.match(html,/Bereich/);
  assert.match(html,/Abdeckung: 01.01.2026/);
});

test('the federal calendar preview states its qualified product window, not the legacy base start',()=>{
  const html=render({profileId:'stpo'});
  assert.match(html,/Produktfenster Kalenderprüfung: 29.08.2026/);
  assert.doesNotMatch(html,/Produktfenster Kalenderprüfung: 01.01.2026/);
  assert.match(html,/Bundesverfahren schweizweit als Prüfrechnung/);
  assert.match(html,/Spezialrecht für Bern im bisherigen freigegebenen Umfang/);
});

test('French UI and complete DE/FR calendar text keys remain aligned',()=>{
  assert.deepEqual(Object.keys(calendarMessages.de).sort(),Object.keys(calendarMessages.fr).sort());
  const html=decoded(render({profileId:'stpo'},'fr'));
  assert.match(html,/Siège de l’instance compétente/);
  assert.match(html,/Canton déterminant pour les jours fériés/);
  assert.match(html,/calcul de contrôle local/);
  assert.equal(calendarCantonLabel('GR','fr'),'Grisons (GR)');
  assert.match(calendarReason('fr','calendarBinding.januaryClarificationRequired')!,/2 janvier/);
});

test('context, profile and override edits share the invalidation path, export is gated by bound result',()=>{
  const source=readFileSync('src/ui/FristenrechnerApp.tsx','utf8');
  const mutate=source.slice(source.indexOf('const mutateForm ='),source.indexOf('const mutateSelection ='));
  assert.match(mutate,/setResult\(undefined\)/);
  assert.match(mutate,/setCalendarReference\(''\)/);
  assert.match(source,/onChange=\{next=>mutateForm\(\{calendarContext:next/);
  assert.match(source,/allowCalendarExport=\{result\.value\.calendarExportAllowed\}/);
  assert.match(source,/generalMode && !fixedCalendar && !boundMode/);
  assert.match(source,/visibleSelectors\.length % 2 === 1/);
});

test('January comparison exposes both complete paths only as trace variants, never as a definitive result or export',()=>{
  const comparison:JanuaryComparison={outcome:'different',variedCatalogRuleIds:['SG-ZPO-ADDITIONAL-DAY-BERCHTOLD'],
    withoutJanuary2:{legallyRelevantDate:'2029-01-01',deadlineStart:'2029-01-02',provisionalEnd:'2029-01-02',finalEnd:'2029-01-02'},
    withJanuary2:{legallyRelevantDate:'2029-01-01',deadlineStart:'2029-01-02',provisionalEnd:'2029-01-02',finalEnd:'2029-01-03'}};
  for(const locale of ['de','fr'] as const){
    const html=ui.renderJanuary({comparison,locale});
    assert.match(html,/<table/);
    assert.ok(html.includes(calendarMessages[locale].withoutJanuary));
    assert.ok(html.includes(calendarMessages[locale].withJanuary));
    assert.ok(html.includes(calendarMessages[locale].comparisonNotDefinitive));
    assert.match(html,/02.01.2029/);
    assert.match(html,/03.01.2029/);
    assert.doesNotMatch(html,/fr-result__hero|<button|fr-calendar-export/);
    const {withJanuary2:_withJanuary,...withoutJanuaryPath}=comparison;
    const blocked=ui.renderJanuary({comparison:{...withoutJanuaryPath,outcome:'blocked'},locale});
    assert.ok(blocked.includes(calendarMessages[locale].notCovered));
  }
});
