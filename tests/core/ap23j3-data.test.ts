// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildAP23J3Candidate,AP23J3_TARGET,AP23J3_ADMIN_PATH} from '../../scripts/build-ap23j3-candidate';
import {createFormat14CalculationData} from '../../src/core/format14CalculationData';
import {parseFormat13LocalReferenceData} from '../../src/core/releaseFormat13';
import {socialObjectSha256} from '../../src/core/socialCatalog';
import {buildSyntheticFormat14,changeSyntheticFormat14,encode14,sha14,AP23J3_ADMIN} from './ap23j3Fixtures';
const read=(path:string)=>readFileSync(new URL('../../'+path,import.meta.url),'utf8');
const baseline=buildSyntheticFormat14(),catalog=JSON.parse(baseline.files.get(AP23J3_ADMIN)!);
function reseal(f:any):void{
 const admin=JSON.parse(f.files.get(AP23J3_ADMIN)!);
 for(const p of admin.paths){
  const q=admin.qualificationPolicies.find((q:any)=>q.pathId===p.pathId),e=admin.releaseBinding.pathEligibility.find((e:any)=>e.pathId===p.pathId),h=admin.holidayBindings.find((h:any)=>h.holidayBindingId===p.holidayBindingId);
  if(!q||!e||!h)continue;q.pathSha256=socialObjectSha256(p);
  Object.assign(e,{pathSha256:socialObjectSha256(p),qualificationPolicySha256:socialObjectSha256(q),holidayBindingSha256:socialObjectSha256(h)});
  if(p.suspensionSelection){
   e.suspensionSelectionSha256=socialObjectSha256(p.suspensionSelection);
   const ids=p.suspensionSelection.kind==='fixed'?[p.suspensionSelection.suspensionProfileId]:p.suspensionSelection.cases.map((row:any)=>row.suspensionProfileId);
   e.suspensionProfiles=[...new Set<string>(ids)].sort().map(id=>({suspensionProfileId:id,sha256:socialObjectSha256(admin.suspensionProfiles.find((s:any)=>s.suspensionProfileId===id))}));
  }else e.suspensionProfileSha256=socialObjectSha256(admin.suspensionProfiles.find((s:any)=>s.suspensionProfileId===p.suspensionProfileId));
  if(p.openingPolicy)e.openingPolicySha256=socialObjectSha256(p.openingPolicy);
 }
 f.files.set(AP23J3_ADMIN,encode14(admin));for(const a of f.manifest.artifacts){a.sha256=sha14(f.files.get(a.path)!);a.byteLength=Buffer.byteLength(f.files.get(a.path)!);}
}
test('AP23J3 actual45 files and three generated native modules rebuild exactly',async()=>{
 const result=await buildAP23J3Candidate();assert.equal(result.files.size,44);assert.equal(result.manifestText,read(AP23J3_TARGET+'/manifest.json'));
 for(const[path,text]of result.files)assert.equal(text,baseline.files.get(path));
 assert.equal(result.generatedModule,read('src/release/ap23j3CandidateData.ts'));assert.equal(result.administrativeBaselineModule,read('src/core/administrativeV7Baseline.ts'));
 assert.equal(result.format14BaselineModule,read('src/core/format14Baseline.ts'));assert.equal(result.integrityText,read('outputs/ap23j3-2026-10-27/bundle-integrity.json'));
});
test('AP23J3 preserves all149 accepted meanings and all113 old definitions',()=>{
 const accepted=JSON.parse(read('outputs/ap23j2-candidate-2026-10-27/bundle/'+AP23J3_ADMIN_PATH)),old=JSON.parse(read('data/candidates/2026-10-22-ap23i3/'+AP23J3_ADMIN_PATH));
 for(const key of ['paths','qualificationPolicies','laws','sources','suspensionProfiles','excludedPaths'])assert.deepEqual(catalog[key],accepted[key]);
 assert.equal(catalog.paths.length,149);for(const key of ['paths','qualificationPolicies'])for(const row of old[key])assert.deepEqual(catalog[key].find((r:any)=>r.pathId===row.pathId),row);
});
test('AP23J3 all35 raw calendars and 499 holiday rules remain byteidentical',()=>{
 for(const a of baseline.manifest.artifacts)if(a.role==='calendar'||a.role==='holidayCatalog')assert.equal(baseline.files.get(a.path),read('data/candidates/2026-10-22-ap23i3/'+a.path));
 const h=JSON.parse(baseline.files.get('holiday-catalogs/ch-holiday-catalog.json')!);assert.equal(h.data.rules.length+h.activation.supplementalRules.length,499);
});
test('AP23J3 twenty-seven legal uses bind actual full resource closures',()=>{
 assert.equal(catalog.holidayBindings.length,27);
 for(const h of catalog.holidayBindings){assert.equal(h.physicalBaseline.releaseId,baseline.manifest.releaseId);
  assert.equal(h.physicalBaseline.references.length,h.bindingVersion==='5.0.0'?4:3);
  for(const ref of h.physicalBaseline.references)assert.ok(baseline.manifest.artifacts.some((a:any)=>a.contentId===ref.contentId&&a.role===ref.role&&a.sha256===ref.sha256&&a.path===ref.path));
 }
});
test('AP23J3 candidate cannot pass approved reader and native13 rejects14',()=>{
 assert.throws(()=>createFormat14CalculationData(encode14(baseline.manifest),baseline.files));
 assert.throws(()=>parseFormat13LocalReferenceData(encode14(baseline.manifest),baseline.files));
 const synthetic=buildSyntheticFormat14('approved');assert.equal(createFormat14CalculationData(encode14(synthetic.manifest),synthetic.files).data.formatVersion,'14.0.0');
 assert.equal(buildSyntheticFormat14().manifest.releaseStatus,'candidate');
});
const p=(a:any,id:string)=>a.paths.find((p:any)=>p.pathId===id),q=(a:any,id:string)=>a.qualificationPolicies.find((q:any)=>q.pathId===id);
for(const[name,edit]of [
 ['fr-three-as-ordered',(a:any)=>p(a,'fr-nontc-nachfrist-3').duration={kind:'authorityOrderedDays',minimum:1,maximum:365,boundMeaning:'technicalSafetyLimitNotLegalMaximum'}],
 ['fr-three-changed',(a:any)=>p(a,'fr-nontc-nachfrist-3').duration.value=4],
 ['ge-post-identity',(a:any)=>p(a,'ge-recours-30').openingPolicy.ordinaryPostTransformation='none'],
 ['ge-free-calendar',(a:any)=>p(a,'ge-recours-30').openingPolicy.holidayBinding='partyDomicile'],
 ['ge-default-mode',(a:any)=>p(a,'ge-recours-30').openingPolicy.otherwise='qualifiedLegalOpening'],
 ['ge-mode-order',(a:any)=>p(a,'ge-recours-30').openingPolicy.allowedModes.reverse()],
 ['ge-third-mode',(a:any)=>p(a,'ge-recours-30').openingPolicy.allowedModes.push('electronic')],
 ['ge-mode-requirement-removed',(a:any)=>q(a,'ge-recours-30').requirements=q(a,'ge-recours-30').requirements.filter((r:any)=>r.key!=='openingMode')],
 ['fr-ge-transformation',(a:any)=>p(a,'fr-nontc-recours-30').openingPolicy=p(a,'ge-recours-30').openingPolicy],
 ['ju-future-opening',(a:any)=>p(a,'ju-confirmation-request5-initial').openingPolicy.triggerKind='inventedFutureConfirmation'],
 ['ju-new-appeal',(a:any)=>p(a,'ju-motivation-request30-initial').openingPolicy.triggerKind='automaticAppealAfterReasons'],
 ['fr-refusal-not-current',(a:any)=>p(a,'fr-nontc-nachfrist-3').openingPolicy.triggerKind='qualifiedWrittenOpening'],
 ['fr-expired-condition-removed',(a:any)=>q(a,'fr-nontc-nachfrist-3').requirements.pop()],
 ['fr-overlapping-timeline',(a:any)=>p(a,'fr-nontc-recours-30').normTimeline[0].interval.to='2026-10-02'],
 ['fr-wrong-version',(a:any)=>p(a,'fr-nontc-recours-30').normTimeline[0].sourceRefs=p(a,'fr-nontc-recours-30').normTimeline[1].sourceRefs],
 ['wrong-period',(a:any)=>a.suspensionProfiles.find((s:any)=>s.suspensionProfileId==='ge-three').periods[2].start.day=19],
 ['wrong-source',(a:any)=>a.sources.find((s:any)=>s.sourceId==='SRC-J1-GE-LPA-20250601').url='https://example.invalid/forged'],
 ['old-path',(a:any)=>p(a,'ow-admin-20').duration.value=21],
 ['old-policy',(a:any)=>q(a,'ow-admin-20').openingChainPolicy='notApplicable'],
 ['wrong-window',(a:any)=>p(a,'ge-recours-30').temporalBinding.calculationCoverage.to='2028-12-31'],
 ['wrong-norm',(a:any)=>p(a,'ge-recours-30').normTimeline[0].interval.to='2026-12-31'],
 ['wrong-pinpoint',(a:any)=>p(a,'ge-recours-30').sourceRefs[0].locator='Art. 999'],
 ['extra-path',(a:any)=>a.paths.push({...a.paths[a.paths.length-1],pathId:'invented'})]
]as const)test('AP23J3 fully resealed semantic mutation '+name+' is rejected',()=>{
 const f=buildSyntheticFormat14();changeSyntheticFormat14(f,AP23J3_ADMIN,edit);reseal(f);
 for(const d of f.manifest.artifacts)assert.equal(sha14(f.files.get(d.path)!),d.sha256);
 assert.throws(()=>createFormat14CalculationData(encode14(f.manifest),f.files,{mode:'localReference'}),error=>!String(error).includes('Artifact integrity'));
});
for(const[name,edit]of [
 ['opening-hash',(e:any)=>e.openingPolicySha256='f'.repeat(64)],
 ['selection-hash',(e:any)=>e.suspensionSelectionSha256='f'.repeat(64)],
 ['profile-hash',(e:any)=>e.suspensionProfiles[0].sha256='f'.repeat(64)],
 ['missing-profile',(e:any)=>e.suspensionProfiles.pop()],
 ['duplicate-profile',(e:any)=>e.suspensionProfiles.push({...e.suspensionProfiles[0]})]
]as const)test('AP23J3 rehashed eligibility closure '+name+' is rejected',()=>{
 const f=buildSyntheticFormat14();changeSyntheticFormat14(f,AP23J3_ADMIN,(a:any)=>edit(a.releaseBinding.pathEligibility.find((e:any)=>e.pathId==='ge-recours-30')));
 assert.throws(()=>createFormat14CalculationData(encode14(f.manifest),f.files,{mode:'localReference'}));
});
test('AP23J3 actual parent resources cannot be swapped or dropped with fresh hashes',()=>{
 for(const edit of[(a:any)=>a.inherits=['ch-federal-calendar'],(a:any)=>a.projection.sourceHash='0'.repeat(64)]){
  const f=buildSyntheticFormat14();changeSyntheticFormat14(f,'calendars/ap23h2-ow-procedural-core.json',edit);
  assert.throws(()=>createFormat14CalculationData(encode14(f.manifest),f.files,{mode:'localReference'}));
 }
 const f=buildSyntheticFormat14();changeSyntheticFormat14(f,AP23J3_ADMIN,(a:any)=>a.holidayBindings.find((b:any)=>b.holidayBindingId==='ge-review-authority-seat').physicalBaseline.references.pop());reseal(f);
 assert.throws(()=>createFormat14CalculationData(encode14(f.manifest),f.files,{mode:'localReference'}));
});

