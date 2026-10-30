// SPDX-License-Identifier: AGPL-3.0-only
// Real approved native17, never a synthetic approval of candidate data.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import test from 'node:test';
import {buildSync} from 'esbuild';
import type {Format17CalculatorRuntime} from '../../src/core/format17CalculationData';
import type * as Administrative from '../../src/ui/administrativeUi';
const require=createRequire(import.meta.url);
const bundle=buildSync({stdin:{contents:`
 import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';
 import {setIconOptions} from '@fluentui/react/lib/Styling';
 import {FristenrechnerApp} from './src/ui/FristenrechnerApp';
 import {mvp10Runtime} from './src/release/mvp10ReleaseData';
 import {ap23m3CandidateRuntime} from './src/release/ap23m3CandidateData';
 export {mvp10Runtime,mvp10ManifestText,mvp10Files} from './src/release/mvp10ReleaseData';
 export {ap23m3CandidateRuntime} from './src/release/ap23m3CandidateData';
 export * from './src/ui/administrativeUi';export * from './src/ui/administrativeExport';export {hasSocialUi} from './src/ui/socialUi';
 setIconOptions({disableWarnings:true});
 export const render=(locale='de')=>{const raw=JSON.stringify({version:5,state:'preferences',preferences:{locale,authorityCode:'',deadlineDays:10,deliveryMethod:'',procedureSelection:null,legacySelectors:{},vrpgSelection:{area:'',law:'',action:'',stage:''},calendarPreference:{role:'',canton:''}}});return renderToStaticMarkup(React.createElement(FristenrechnerApp,{...mvp10Runtime,storage:{getItem:key=>key==='fristenrechner.defaults.v5'?raw:null,setItem(){},removeItem(){}}}));};
`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,platform:'node',format:'cjs',write:false,external:['react','react-dom/server'],logLevel:'silent'});
const module={exports:{}};new Function('require','module','exports',bundle.outputFiles[0]!.text)(require,module,module.exports);
const ui=module.exports as typeof Administrative & typeof import('../../src/ui/administrativeExport') & {mvp10Runtime:Format17CalculatorRuntime;ap23m3CandidateRuntime:Format17CalculatorRuntime;mvp10ManifestText:string;mvp10Files:ReadonlyMap<string,string>;hasSocialUi(data:Format17CalculatorRuntime['data']):boolean;render(locale:'de'|'fr'):string};
const runtime=ui.mvp10Runtime,context=runtime.administrativeContext,catalog=context.administrativeCatalog;
test('MVP10 genuine approved native17 embeds exactly the 45 approved runtime files',()=>{const manifest=JSON.parse(ui.mvp10ManifestText);assert.equal(manifest.releaseId,'2026-10-28-mvp-010-approved.1');assert.equal(manifest.releaseStatus,'approved');assert.equal(manifest.formatVersion,'17.0.0');assert.equal(manifest.artifacts.length,44);assert.equal(ui.mvp10Files.size,44);assert.equal(context.mode,'approved');assert.equal(runtime.calendarRuntime.referenceOnly,false);assert.equal(catalog.paths.length,245);assert.equal(catalog.qualificationPolicies.length,245);assert.equal(runtime.data.calendarRuleSets!.size,35);for(const d of manifest.artifacts){const b=readFileSync('data/releases/'+manifest.releaseId+'/'+d.path);assert.equal(b.length,d.byteLength);assert.equal(createHash('sha256').update(b).digest('hex'),d.sha256);assert.equal(ui.mvp10Files.get(d.path),b.toString('utf8'));}});
test('MVP10 retains all 44 social rules and 50 Bern bindings and the U1 social gate',()=>{const c=runtime.data.socialProcedureCatalogs!.get('ch-social-procedures')!;assert.equal(c.federalRules.length,44);assert.equal(c.cantonalBindings.length,50);assert.ok(c.cantonalBindings.every(b=>b.procedureContextCanton==='BE'));assert.ok(c.releaseEligibility.every(e=>e.status==='approved'));assert.equal(ui.hasSocialUi(runtime.data),true);});
test('MVP10 normal public entry uses the real approved runtime, not a candidate alias',()=>{const text=readFileSync('src/public-app/main.tsx','utf8');assert.match(text,/import \{ mvp10Runtime \} from '\.\.\/release\/mvp10ReleaseData'/);assert.match(text,/<FristenrechnerApp \{\.\.\.mvp10Runtime\} \/>/);assert.doesNotMatch(text,/ap23m3CandidateRuntime|r10u1|qaPreset|initialState/);});
function qualify(ctx:Format17CalculatorRuntime['administrativeContext']){const c=ctx.administrativeCatalog;return ui.qualifyAdministrativeUiInput({catalog:c,lawId:'vs-general-administrative',authorityCanton:'VS',inputDate:'2026-10-02',deadlineDays:10,state:{stage:'court',pathId:'vs-court-ordered',qualification:'generalActualReceipt',urgency:'none',currentValues:{}}});}
test('MVP10 actual VS new path is approved and exportable while the identical candidate remains export-blocked',()=>{const q=qualify(context);assert.deepEqual(q.errors,{});assert.ok(q.input);const result=ui.calculateAdministrativeUiDeadline(q.input,context);assert.equal(result.outcome,'calculated');if(result.outcome!=='calculated')throw Error('Calculated');assert.equal(result.finalEnd,'2026-10-12');assert.equal(result.referenceOnly,false);assert.equal(ui.administrativeExportAvailable(q.input,context,result),true);const candidate=ui.ap23m3CandidateRuntime.administrativeContext,cq=qualify(candidate);assert.ok(cq.input);const cr=ui.calculateAdministrativeUiDeadline(cq.input,candidate);assert.equal(cr.outcome,'calculated');assert.equal(ui.administrativeExportAvailable(cq.input,candidate,cr),false);});
test('MVP10 never derives current facts from a remembered path and keeps DE/FR text-date controls',()=>{const q=ui.qualifyAdministrativeUiInput({catalog,lawId:'vs-general-administrative',authorityCanton:'VS',inputDate:'2026-10-02',deadlineDays:10,state:{stage:'court',pathId:'vs-court-ordered',qualification:'',urgency:'none',currentValues:{}}});assert.equal(q.input,undefined);for(const locale of['de','fr']as const){const html=ui.render(locale);assert.match(html,locale==='de'?/placeholder="TT.MM.JJJJ"/:/placeholder="JJ.MM.AAAA"/);assert.doesNotMatch(html,/<input[^>]*name="inputDate"[^>]*value="2026-/);assert.match(html,/fr-form__grid/);}});
