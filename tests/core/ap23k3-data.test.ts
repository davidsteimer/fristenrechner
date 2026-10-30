// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildAP23K3Candidate} from '../../scripts/build-ap23k3-candidate';
import {createFormat15CalculationData} from '../../src/core/format15CalculationData';
import {parseFormat14LocalReferenceData,parseFormat14Data} from '../../src/core/releaseFormat14';
import {socialObjectSha256} from '../../src/core/socialCatalog';
import {assertAdministrativeProcedureCatalogV8} from '../../src/core/administrativeCatalogV8';
import {AP23K3_ADMIN,AP23K3_BASE,buildSyntheticFormat15,changeSyntheticFormat15,resealSyntheticFormat15,encode15,sha15} from './ap23k3Fixtures';
const read=(path:string):string=>readFileSync(new URL('../../'+path,import.meta.url),'utf8');
const baseline=buildSyntheticFormat15(),catalog=JSON.parse(baseline.files.get(AP23K3_ADMIN)!);
const create=(f=baseline)=>createFormat15CalculationData(encode15(f.manifest),f.files,{mode:'localReference'});
const p=(c:any,id:string)=>c.paths.find((p:any)=>p.pathId===id),q=(c:any,id:string)=>c.qualificationPolicies.find((q:any)=>q.pathId===id),b=(c:any,id:string)=>c.holidayBindings.find((b:any)=>b.holidayBindingId===id);
test('AP23K3 generated45files baseline and module rebuild exactly',async()=>{const result=await buildAP23K3Candidate();assert.equal(result.files.size,44);assert.equal(result.manifestText,read(AP23K3_BASE+'manifest.json'));for(const[path,text]of result.files)assert.equal(text,baseline.files.get(path));assert.equal(result.generatedModule,read('src/release/ap23k3CandidateData.ts'));assert.equal(result.administrativeBaselineModule,read('src/core/administrativeV8Baseline.ts'));assert.equal(result.integrity,read('outputs/ap23k3-2026-10-27/bundle-integrity.json'));});
test('AP23K3 preserves all165 accepted meanings including149 oldpaths',()=>{const accepted=JSON.parse(read('outputs/ap23k2-candidate-2026-10-27/bundle/'+AP23K3_ADMIN)),old=JSON.parse(read('data/candidates/2026-10-27-ap23j3/'+AP23K3_ADMIN));for(const key of['paths','qualificationPolicies','laws','sources','suspensionProfiles','excludedPaths','preserved'])assert.deepEqual(catalog[key],accepted[key]);assert.equal(catalog.paths.length,165);for(const key of['paths','qualificationPolicies'])for(const row of old[key])assert.deepEqual(catalog[key].find((r:any)=>r.pathId===row.pathId),row);});
test('AP23K3 all42nonsocial nonadministrative artifacts and35calendars remain raw identical',()=>{let preserved=0;for(const a of baseline.manifest.artifacts)if(a.role!=='socialProcedureCatalog'&&a.role!=='administrativeProcedureCatalog'){assert.equal(baseline.files.get(a.path),read('data/candidates/2026-10-27-ap23j3/'+a.path));preserved++;}assert.equal(preserved,42);const h=JSON.parse(baseline.files.get('holiday-catalogs/ch-holiday-catalog.json')!);assert.equal(h.data.rules.length+h.activation.supplementalRules.length,499);});
test('AP23K3 thirty legalbindings have real target bytes and no procedural inheritance',()=>{assert.equal(catalog.holidayBindings.length,30);for(const h of catalog.holidayBindings){const physical=h.physicalSource??h.physicalBaseline;assert.equal(physical.releaseId,baseline.manifest.releaseId);for(const r of physical.references)assert.ok(baseline.manifest.artifacts.some((a:any)=>a.contentId===r.contentId&&a.role===r.role&&a.sha256===r.sha256&&a.path===r.path));}const selection=b(catalog,'bs-party-representative').calendarSelection;assert.equal(selection.terminals.length,26);assert.equal(selection.terminals.reduce((n:number,t:any)=>n+t.variants.length,0),28);assert.equal(b(catalog,'bs-party-representative').physicalSource.references.length,31);});
test('AP23K3 candidate is reference-only and oldreaders reject15 despite forgedapproval',()=>{assert.equal(create().data.formatVersion,'15.0.0');assert.throws(()=>createFormat15CalculationData(encode15(baseline.manifest),baseline.files));for(const parse of[parseFormat14LocalReferenceData,parseFormat14Data]){assert.throws(()=>parse(encode15(baseline.manifest),baseline.files));const forged=structuredClone(baseline.manifest);forged.releaseStatus='approved';forged.extensions['steimer.local-reference'].calendarExportEnabled=true;forged.extensions['steimer.local-reference'].sourceReleaseApproved=true;assert.throws(()=>parse(encode15(forged),baseline.files));}});
test('AP23K3 actual accepted future approval shape is supported separately',()=>{const f=buildSyntheticFormat15('approved');assert.equal(f.manifest.extensions['steimer.synthetic-test'].humanApproval,false);assert.equal(createFormat15CalculationData(encode15(f.manifest),f.files).data.formatVersion,'15.0.0');assert.throws(()=>createFormat15CalculationData(encode15(f.manifest),f.files,{mode:'localReference'}));});
for(const[name,edit]of[
 ['closure-date',(c:any)=>b(c,'bl-authority-seat').annualEndShiftPolicy.years[0].dates[0]='2026-12-23'],
 ['closure-effect',(c:any)=>b(c,'bl-authority-seat').annualEndShiftPolicy.effect='countingSuspension'],
 ['closure-year',(c:any)=>b(c,'bl-authority-seat').annualEndShiftPolicy.years[1].year=2028],
 ['closure-source',(c:any)=>b(c,'bl-authority-seat').annualEndShiftPolicy.years[1].sourceRefs.pop()],
 ['closure-extrapolation',(c:any)=>b(c,'bl-authority-seat').annualEndShiftPolicy.coverage.to='2028-12-31'],
 ['uncertainty-resolved',(c:any)=>b(c,'bl-authority-seat').annualEndShiftPolicy.uncertainty.onDifference='sameResult'],
 ['uncertainty-date',(c:any)=>b(c,'bl-authority-seat').annualEndShiftPolicy.uncertainty.dates=['2027-02-10']],
 ['input-override',(c:any)=>b(c,'bl-authority-seat').annualEndShiftPolicy.uncertainty.inputOverride='allowed'],
 ['bs-closure-leakage',(c:any)=>b(c,'bs-party-representative').annualEndShiftPolicy=b(c,'bl-authority-seat').annualEndShiftPolicy],
 ['terminal-missing',(c:any)=>b(c,'bs-party-representative').calendarSelection.terminals.pop()],
 ['terminal-canton',(c:any)=>b(c,'bs-party-representative').calendarSelection.terminals[0].canton='BS'],
 ['terminal-hash',(c:any)=>b(c,'bs-party-representative').calendarSelection.terminals[0].bindingSha256='0'.repeat(64)],
 ['terminal-projection',(c:any)=>b(c,'bs-party-representative').calendarSelection.terminals[0].variants[0].projectionSha256='0'.repeat(64)],
 ['current-area-removed',(c:any)=>b(c,'bs-party-representative').calendarSelection.terminals.find((t:any)=>t.canton==='AI').requiredAreaScopeIds=[]],
 ['party-role-invented',(c:any)=>b(c,'bs-party-representative').calendarSelection.role='partyWithoutRepresentative'],
 ['free-union',(c:any)=>b(c,'bs-party-representative').legalBinding.roleUnion=true],
 ['sitting-fallback',(c:any)=>b(c,'bs-party-representative').calendarSelection.otherwise='authoritySeat'],
 ['jan-unbound-rule',(c:any)=>b(c,'bs-party-representative').calendarSelection.terminals.find((t:any)=>t.canton==='SG').ambiguity.catalogRuleIds.push('ZH-ZPO-BERCHTOLD')],
 ['opening-transformation',(c:any)=>p(c,'bs-court-register-10').openingPolicy.transformation='nextWorkingDay'],
 ['bs-general-recess',(c:any)=>c.suspensionProfiles.find((s:any)=>s.suspensionProfileId==='bs-none').periods=c.suspensionProfiles.find((s:any)=>s.periods.length).periods],
 ['qualification-removed',(c:any)=>q(c,'bs-court-register-10').requirements.pop()],
 ['statutory-ten-changed',(c:any)=>p(c,'bs-court-register-10').duration.value=11],
 ['window-widened',(c:any)=>p(c,'bs-court-register-10').temporalBinding.calculationCoverage.to='2028-12-31'],
 ['norm-version',(c:any)=>p(c,'bs-court-register-10').normTimeline[0].sourceRefs=p(c,'bs-court-register-10').normTimeline[1].sourceRefs],
 ['source-url',(c:any)=>c.sources.find((s:any)=>s.sourceId==='SRC-K1-BS-OG-20210101').url='https://example.invalid/forged'],
 ['old-path',(c:any)=>p(c,'ge-recours-30').duration.value=31],
 ['old-policy',(c:any)=>q(c,'fr-nontc-recours-30').requirements.pop()]
]as const)test('AP23K3 fully resealed semantic mutation '+name+' rejected',()=>{const f=buildSyntheticFormat15();changeSyntheticFormat15(f,AP23K3_ADMIN,edit);resealSyntheticFormat15(f);for(const d of f.manifest.artifacts)assert.equal(sha15(f.files.get(d.path)!),d.sha256);assert.throws(()=>create(f),error=>!String(error).includes('Artifact integrity'));});
for(const[name,edit]of[
 ['calendar-selection-hash',(e:any)=>e.calendarSelectionSha256='0'.repeat(64)],
 ['annual-policy-hash',(e:any)=>e.annualEndShiftPolicySha256='0'.repeat(64)],
 ['opening-hash',(e:any)=>e.openingPolicySha256='0'.repeat(64)],
 ['profile-missing',(e:any)=>e.suspensionProfiles.pop()],
 ['profile-hash',(e:any)=>e.suspensionProfiles[0].sha256='0'.repeat(64)]
]as const)test('AP23K3 byte-resealed eligibility '+name+' rejected',()=>{const f=buildSyntheticFormat15();changeSyntheticFormat15(f,AP23K3_ADMIN,(c:any)=>edit(c.releaseBinding.pathEligibility.find((e:any)=>e.pathId==='bs-court-register-10')));assert.throws(()=>create(f));});
test('AP23K3 dynamic dependency cannot be dropped and rehashed',()=>{const f=buildSyntheticFormat15();changeSyntheticFormat15(f,AP23K3_ADMIN,(c:any)=>b(c,'bs-party-representative').physicalSource.references.pop());resealSyntheticFormat15(f);assert.throws(()=>create(f));});
test('AP23K3 forged physical calendar with fresh descriptor and administrative binding hashes is rejected',()=>{const f=buildSyntheticFormat15(),path='calendars/ap22-bl-72f1a7e0fcf8.json';changeSyntheticFormat15(f,path,(c:any)=>c.rules.pop());changeSyntheticFormat15(f,AP23K3_ADMIN,(c:any)=>{for(const binding of c.holidayBindings)for(const ref of(binding.physicalSource??binding.physicalBaseline).references)if(ref.path===path)ref.sha256=sha15(f.files.get(path)!);});resealSyntheticFormat15(f);assert.throws(()=>create(f),error=>!String(error).includes('Artifact integrity'));});
test('AP23K3 source metadata cannot accidentally edit the accepted source identity',()=>{const f=buildSyntheticFormat15();changeSyntheticFormat15(f,AP23K3_ADMIN,(c:any)=>{c.sources[0].reviewedOn='2026-10-27';c.sources[0].reviewBasis+=' Separate synthetic metadata check.';});assert.equal(create(f).data.formatVersion,'15.0.0');});
test('AP23K3 public catalog validation rejects hostile objects without invoking accessors',()=>{let invoked=false;const c=structuredClone(catalog);Object.defineProperty(c,'paths',{enumerable:true,get(){invoked=true;return catalog.paths;}});assert.throws(()=>assertAdministrativeProcedureCatalogV8(c));assert.equal(invoked,false);assert.throws(()=>assertAdministrativeProcedureCatalogV8(Object.create(catalog)));const cycle:any={};cycle.self=cycle;assert.throws(()=>assertAdministrativeProcedureCatalogV8(cycle));});
