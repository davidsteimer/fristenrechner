// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildAP23I3Candidate,AP23I3_TARGET,AP23I3_ADMIN_PATH} from '../../scripts/build-ap23i3-candidate';
import {createFormat13CalculationData} from '../../src/core/format13CalculationData';
import {parseFormat12LocalReferenceData} from '../../src/core/releaseFormat12';
import {socialObjectSha256} from '../../src/core/socialCatalog';
import {buildSyntheticFormat13,changeSyntheticFormat13,encode13,sha13,AP23I3_ADMIN} from './ap23i3Fixtures';
const read=(path:string)=>readFileSync(new URL('../../'+path,import.meta.url),'utf8');
const baseline=buildSyntheticFormat13(),catalog=JSON.parse(baseline.files.get(AP23I3_ADMIN)!);
function reseal(f:any):void{
 const admin=JSON.parse(f.files.get(AP23I3_ADMIN)!);
 for(const p of admin.paths){
  const q=admin.qualificationPolicies.find((q:any)=>q.pathId===p.pathId),e=admin.releaseBinding.pathEligibility.find((e:any)=>e.pathId===p.pathId),h=admin.holidayBindings.find((h:any)=>h.holidayBindingId===p.holidayBindingId);
  if(!q||!e||!h)continue;q.pathSha256=socialObjectSha256(p);
  Object.assign(e,{pathSha256:socialObjectSha256(p),qualificationPolicySha256:socialObjectSha256(q),holidayBindingSha256:socialObjectSha256(h)});
  if(p.suspensionSelection){
   e.suspensionSelectionSha256=socialObjectSha256(p.suspensionSelection);
   const ids=p.suspensionSelection.kind==='fixed'?[p.suspensionSelection.suspensionProfileId]:p.suspensionSelection.cases.map((row:any)=>row.suspensionProfileId);
   e.suspensionProfiles=[...new Set<string>(ids)].sort().map(id=>({suspensionProfileId:id,sha256:socialObjectSha256(admin.suspensionProfiles.find((s:any)=>s.suspensionProfileId===id))}));
  }else e.suspensionProfileSha256=socialObjectSha256(admin.suspensionProfiles.find((s:any)=>s.suspensionProfileId===p.suspensionProfileId));
 }
 f.files.set(AP23I3_ADMIN,encode13(admin));for(const a of f.manifest.artifacts){a.sha256=sha13(f.files.get(a.path)!);a.byteLength=Buffer.byteLength(f.files.get(a.path)!);}
}
test('AP23I3 actual45 files and three generated native modules rebuild exactly',async()=>{
 const result=await buildAP23I3Candidate();assert.equal(result.files.size,44);assert.equal(result.manifestText,read(AP23I3_TARGET+'/manifest.json'));
 for(const[path,text]of result.files)assert.equal(text,baseline.files.get(path));
 assert.equal(result.generatedModule,read('src/release/ap23i3CandidateData.ts'));assert.equal(result.administrativeBaselineModule,read('src/core/administrativeV6Baseline.ts'));
 assert.equal(result.format13BaselineModule,read('src/core/format13Baseline.ts'));assert.equal(result.integrityText,read('outputs/ap23i3-2026-10-22/bundle-integrity.json'));
});
test('AP23I3 preserves all113 accepted meanings and all79 old definitions',()=>{
 const accepted=JSON.parse(read('outputs/ap23i2-candidate-2026-10-22/bundle/'+AP23I3_ADMIN_PATH)),old=JSON.parse(read('data/candidates/2026-10-22-ap23h3/'+AP23I3_ADMIN_PATH));
 for(const key of ['paths','qualificationPolicies','laws','sources','suspensionProfiles','excludedPaths'])assert.deepEqual(catalog[key],accepted[key]);
 assert.equal(catalog.paths.length,113);for(const key of ['paths','qualificationPolicies'])for(const row of old[key])assert.deepEqual(catalog[key].find((r:any)=>r.pathId===row.pathId),row);
});
test('AP23I3 all35 raw calendars and 499 holiday rules remain byteidentical',()=>{
 for(const a of baseline.manifest.artifacts)if(a.role==='calendar'||a.role==='holidayCatalog')assert.equal(baseline.files.get(a.path),read('data/candidates/2026-10-22-ap23h3/'+a.path));
 const h=JSON.parse(baseline.files.get('holiday-catalogs/ch-holiday-catalog.json')!);assert.equal(h.data.rules.length+h.activation.supplementalRules.length,499);
});
test('AP23I3 twenty-one legal uses bind actual full resource closures',()=>{
 assert.equal(catalog.holidayBindings.length,21);
 for(const h of catalog.holidayBindings){assert.equal(h.physicalBaseline.releaseId,baseline.manifest.releaseId);
  assert.equal(h.physicalBaseline.references.length,h.bindingVersion==='5.0.0'?4:3);
  for(const ref of h.physicalBaseline.references)assert.ok(baseline.manifest.artifacts.some((a:any)=>a.contentId===ref.contentId&&a.role===ref.role&&a.sha256===ref.sha256&&a.path===ref.path));
 }
});
test('AP23I3 candidate cannot pass approved reader and native12 rejects13',()=>{
 assert.throws(()=>createFormat13CalculationData(encode13(baseline.manifest),baseline.files));
 assert.throws(()=>parseFormat12LocalReferenceData(encode13(baseline.manifest),baseline.files));
 const synthetic=buildSyntheticFormat13('approved');assert.equal(createFormat13CalculationData(encode13(synthetic.manifest),synthetic.files).data.formatVersion,'13.0.0');
 assert.equal(buildSyntheticFormat13().manifest.releaseStatus,'candidate');
});
const p=(a:any,id:string)=>a.paths.find((p:any)=>p.pathId===id),q=(a:any,id:string)=>a.qualificationPolicies.find((q:any)=>q.pathId===id);
for(const[name,edit]of [
 ['fixed-two-invented',(a:any)=>p(a,'gl-admin-shortened-end').duration={kind:'statutoryDays',value:2,overridable:false}],
 ['fixed-five-invented',(a:any)=>p(a,'tg-rekurs-shortened').duration={kind:'statutoryDays',value:5,overridable:false}],
 ['shortened-as-ordered',(a:any)=>p(a,'gl-court-shortened-end').duration={kind:'authorityOrderedDays',minimum:1,maximum:365,boundMeaning:'technicalSafetyLimitNotLegalMaximum'}],
 ['range-expanded',(a:any)=>p(a,'tg-vg-shortened').duration.minimum=2],
 ['statutory-extendable',(a:any)=>p(a,'gl-court-shortened-end').duration.legalNature='authorityExtendable'],
 ['notice-fixed-free',(a:any)=>p(a,'tg-vg-execution-5').suspensionSelection={kind:'fixed',suspensionProfileId:'tg-none'}],
 ['notice-fixed-three',(a:any)=>p(a,'tg-vg-provisional-30').suspensionSelection={kind:'fixed',suspensionProfileId:'tg-three'}],
 ['notice-reversed',(a:any)=>p(a,'tg-vg-execution-5').suspensionSelection.cases.reverse()],
 ['oneof-first-only',(a:any)=>q(a,'tg-rr-30').requirements.find((r:any)=>r.key==='regierungsratCompetenceBasis').oneOf.pop()],
 ['new-law-fact-removed',(a:any)=>q(a,'gl-admin-30').requirements=q(a,'gl-admin-30').requirements.filter((r:any)=>r.key!=='newLawApplies')],
 ['wrong-period',(a:any)=>a.suspensionProfiles.find((s:any)=>s.suspensionProfileId==='tg-three').periods[2].start.day=19],
 ['wrong-source',(a:any)=>a.sources.find((s:any)=>s.sourceId==='SRC-AP23I1-TG-VRG-20240601').url='https://example.invalid/forged'],
 ['old-path',(a:any)=>p(a,'ow-admin-20').duration.value=21],
 ['old-policy',(a:any)=>q(a,'ow-admin-20').openingChainPolicy='notApplicable'],
 ['wrong-window',(a:any)=>p(a,'gl-admin-30').temporalBinding.calculationCoverage.to='2028-12-31'],
 ['wrong-norm',(a:any)=>p(a,'tg-vg-30').normTimeline[0].interval.to='2026-12-31'],
 ['wrong-pinpoint',(a:any)=>p(a,'gl-admin-30').sourceRefs[0].locator='Art. 999'],
 ['extra-path',(a:any)=>a.paths.push({...a.paths[a.paths.length-1],pathId:'invented'})]
]as const)test('AP23I3 fully resealed semantic mutation '+name+' is rejected',()=>{
 const f=buildSyntheticFormat13();changeSyntheticFormat13(f,AP23I3_ADMIN,edit);reseal(f);
 for(const d of f.manifest.artifacts)assert.equal(sha13(f.files.get(d.path)!),d.sha256);
 assert.throws(()=>createFormat13CalculationData(encode13(f.manifest),f.files,{mode:'localReference'}),error=>!String(error).includes('Artifact integrity'));
});
for(const[name,edit]of [
 ['selection-hash',(e:any)=>e.suspensionSelectionSha256='f'.repeat(64)],
 ['profile-hash',(e:any)=>e.suspensionProfiles[0].sha256='f'.repeat(64)],
 ['missing-profile',(e:any)=>e.suspensionProfiles.pop()],
 ['duplicate-profile',(e:any)=>e.suspensionProfiles.push({...e.suspensionProfiles[0]})]
]as const)test('AP23I3 rehashed eligibility closure '+name+' is rejected',()=>{
 const f=buildSyntheticFormat13();changeSyntheticFormat13(f,AP23I3_ADMIN,(a:any)=>edit(a.releaseBinding.pathEligibility.find((e:any)=>e.pathId==='tg-vg-execution-5')));
 assert.throws(()=>createFormat13CalculationData(encode13(f.manifest),f.files,{mode:'localReference'}));
});
test('AP23I3 actual parent resources cannot be swapped or dropped with fresh hashes',()=>{
 for(const edit of[(a:any)=>a.inherits=['ch-federal-calendar'],(a:any)=>a.projection.sourceHash='0'.repeat(64)]){
  const f=buildSyntheticFormat13();changeSyntheticFormat13(f,'calendars/ap23h2-ow-procedural-core.json',edit);
  assert.throws(()=>createFormat13CalculationData(encode13(f.manifest),f.files,{mode:'localReference'}));
 }
 const f=buildSyntheticFormat13();changeSyntheticFormat13(f,AP23I3_ADMIN,(a:any)=>a.holidayBindings.find((b:any)=>b.holidayBindingId==='tg-court-seat').physicalBaseline.references.pop());reseal(f);
 assert.throws(()=>createFormat13CalculationData(encode13(f.manifest),f.files,{mode:'localReference'}));
});
