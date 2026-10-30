// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { buildAP23G3Candidate, AP23G3_ROOT, AP23G3_BASE, AP23G3_ACCEPTED, AP23G3_TARGET, AP23G3_RELEASE_ID, AP23G3_ADMIN_PATH, AP23G3_MODULE } from '../../scripts/build-ap23g3-candidate';
import { ADMINISTRATIVE_V4_BASELINE } from '../../src/core/administrativeV4Baseline';
import { FORMAT11_HOLIDAY_CONTENT_SHA256, FORMAT11_ADMINISTRATIVE_PROJECTION } from '../../src/core/format11Baseline';
import { socialObjectSha256 } from '../../src/core/socialCatalog';
import { assertSchema } from '../../src/core/schemaContract';
import { FORMAT7_SCHEMAS } from '../../src/core/releaseFormat7';
import catalogSchema from '../../schemas/administrative-procedure-catalog-v4.schema.json';
import manifestSchema from '../../schemas/release-manifest-v11.schema.json';
import localManifestSchema from '../../schemas/implementation/ap23g3/local-reference-manifest-v11.schema.json';
import { AP23G3_ADMIN, administrativeInput11, buildSyntheticFormat11 } from './ap23g3Fixtures';

const raw=(p:string):string=>readFileSync(resolve(AP23G3_ROOT,p),'utf8');
const read=(p:string):any=>JSON.parse(raw(p));
const sha=(p:string):string=>createHash('sha256').update(p).digest('hex');
const manifestText=raw(`${AP23G3_TARGET}/manifest.json`),manifest=JSON.parse(manifestText);
const files=new Map<string,string>(manifest.artifacts.map((a:any)=>[a.path,raw(`${AP23G3_TARGET}/${a.path}`)]));
const c=JSON.parse(files.get(AP23G3_ADMIN_PATH)!),accepted=read(`${AP23G3_ACCEPTED}/${AP23G3_ADMIN_PATH}`),old=read(`${AP23G3_BASE}/${AP23G3_ADMIN_PATH}`);
const holidayPath='holiday-catalogs/ch-holiday-catalog.json',holiday=JSON.parse(files.get(holidayPath)!);
const schemas=new Map<string,unknown>([...FORMAT7_SCHEMAS,[catalogSchema.$id,catalogSchema],[manifestSchema.$id,manifestSchema],[localManifestSchema.$id,localManifestSchema]]);

test('AP23G3 rebuilds all 43 files and three generated modules reproducibly without changing G2',async()=>{
  const b=await buildAP23G3Candidate();assert.equal(b.manifestText,manifestText);assert.equal(b.files.size,42);
  for(const[p,t]of b.files)assert.equal(t,files.get(p),p);
  assert.equal(b.generatedModule,raw(AP23G3_MODULE));assert.equal(b.administrativeBaselineModule,raw('src/core/administrativeV4Baseline.ts'));
  assert.equal(b.format11BaselineModule,raw('src/core/format11Baseline.ts'));assert.equal(b.integrityText,raw('outputs/ap23g3-2026-10-22/bundle-integrity.json'));
  assert.equal(sha(raw(`${AP23G3_ACCEPTED}/manifest.json`)),'f7193786575ee9f58063859b3af2daca738b766d5a73bd9ddacf474310124187');
});
test('AP23G3 actual manifest descriptors bind exactly42 artifacts and33 calendars',()=>{
  assertSchema(manifest,localManifestSchema,schemas);assertSchema(c,catalogSchema,schemas);assert.throws(()=>assertSchema(manifest,manifestSchema,schemas));
  assert.equal(manifest.artifacts.length,42);assert.equal(manifest.calendarIds.length,33);assert.equal(manifest.formatVersion,'11.0.0');
  assert.equal(manifest.compatibility.minimumConsumerFormatVersion,'11.0.0');assert.equal(manifest.releaseId,AP23G3_RELEASE_ID);
  for(const d of manifest.artifacts){const text=files.get(d.path)!;assert.equal(sha(text),d.sha256,d.path);assert.equal(Buffer.byteLength(text),d.byteLength,d.path);assert.equal(JSON.parse(text).$schema,d.schemaId);}
});
test('AP23G3 forty raw artifacts including all33 calendars and holidaycatalog are exact F3 bytes',()=>{
  let equal=0;for(const d of manifest.artifacts){const changed=[AP23G3_ADMIN_PATH,'social-procedures/ch-social-procedures.json'].includes(d.path);
    if(!changed){assert.equal(files.get(d.path),raw(`${AP23G3_BASE}/${d.path}`),d.path);equal++;}else assert.notEqual(files.get(d.path),raw(`${AP23G3_BASE}/${d.path}`));}
  assert.equal(equal,40);assert.equal(sha(files.get(holidayPath)!),'a5500b47cd7f2aad03d56f0eb16c738d0e75c56d14f8bb2cb56c85abc4b7cd45');
});
test('AP23G3 preserves all58 accepted G2 path/policy definitions and all42 F3 definitions exactly',()=>{
  for(const field of['paths','qualificationPolicies','laws','sources','suspensionProfiles','excludedPaths'])assert.deepEqual(c[field],accepted[field],field);
  assert.equal(c.paths.length,58);assert.equal(c.qualificationPolicies.length,58);
  for(const[field,key]of[['paths','pathId'],['qualificationPolicies','pathId']]as const)for(const row of old[field])assert.deepEqual(c[field].find((x:any)=>x[key]===row[key]),row);
  assert.equal(c.laws.length,11);assert.equal(c.suspensionProfiles.length,20);assert.equal(c.holidayBindings.length,13);
});
test('AP23G3 native baseline hashes all accepted definition identities independently of release wrappers',()=>{
  for(const[field,key]of[['paths','pathId'],['qualificationPolicies','pathId'],['laws','lawId'],['suspensionProfiles','suspensionProfileId'],['excludedPaths','exclusionId']]as const)
    assert.deepEqual(Object.fromEntries(c[field].map((r:any)=>[r[key],socialObjectSha256(r)])),ADMINISTRATIVE_V4_BASELINE[field]);
  assert.deepEqual(Object.fromEntries(c.sources.map(({reviewedOn:_a,reviewBasis:_b,...identity}:any)=>[identity.sourceId,socialObjectSha256(identity)])),ADMINISTRATIVE_V4_BASELINE.sources);
  assert.deepEqual(Object.fromEntries(c.sources.map((s:any)=>[s.sourceId,socialObjectSha256(s)])),ADMINISTRATIVE_V4_BASELINE.sourceObjects);
  assert.deepEqual(Object.fromEntries(c.holidayBindings.map(({physicalBaseline,...legal}:any)=>[legal.holidayBindingId,
    socialObjectSha256({...legal,calendarId:physicalBaseline.calendarId,projectionId:physicalBaseline.projectionId})])),ADMINISTRATIVE_V4_BASELINE.holidayBindings);
});
test('AP23G3 actual component references rebind G3 while independent reuse preserves historical F3 provenance',()=>{
  for(const h of c.holidayBindings){assert.equal(h.physicalBaseline.releaseId,AP23G3_RELEASE_ID);
    for(const r of h.physicalBaseline.references){const d=manifest.artifacts.find((a:any)=>a.contentId===r.contentId);assert.deepEqual(r,{role:d.role,contentId:d.contentId,sha256:d.sha256,path:d.path});}
    const prior=accepted.holidayBindings.find((x:any)=>x.holidayBindingId===h.holidayBindingId);
    if(h.bindingVersion==='4.0.0'){assert.deepEqual(h.physicalReuse,prior.physicalReuse);assert.deepEqual(h.practiceAddition,prior.practiceAddition);
      assert.equal(h.physicalReuse.sourceReleaseId,'2026-10-22-ap23f3-candidate.1');assert.equal(h.physicalReuse.permissionInheritance,'none');}}
  for(const e of c.releaseBinding.pathEligibility){const h=c.holidayBindings.find((h:any)=>h.holidayBindingId===e.holidayBindingId);assert.equal(e.holidayBindingSha256,socialObjectSha256(h));}
});
test('AP23G3 holiday definitions, federal role permissions and all44/50 social semantics remain unchanged',()=>{
  const a=holiday.activation;assert.equal(holiday.data.rules.length,479);assert.equal(a.supplementalRules.length,12);assert.equal(a.matrixDecisions.length,198);assert.equal(a.procedureBindings.length,104);assert.equal(a.projections.length,33);
  const content={data:holiday.data,calendarProjections:holiday.calendarProjections,matrixDecisions:a.matrixDecisions,projections:a.projections,
    procedureBindings:a.procedureBindings,anchorPolicies:a.anchorPolicies,supplementalRules:a.supplementalRules,supplementalScopes:a.supplementalScopes};
  assert.equal(socialObjectSha256(content),FORMAT11_HOLIDAY_CONTENT_SHA256);assert.deepEqual(a.projections.at(-1),FORMAT11_ADMINISTRATIVE_PROJECTION);
  const path='social-procedures/ch-social-procedures.json',social=JSON.parse(files.get(path)!),prior=read(`${AP23G3_BASE}/${path}`);
  for(const k of['federalRules','cantonalBindings','suspensionProfiles','filingProfiles','excludedPaths'])assert.deepEqual(social[k],prior[k],k);
  assert.equal(social.federalRules.length,44);assert.equal(social.cantonalBindings.length,50);
  for(const e of social.releaseEligibility){assert.equal(e.releaseId,AP23G3_RELEASE_ID);assert.equal(e.status,'candidate');assert.equal(e.approval,null);assert.equal(e.calculationCoverage.to,'2027-12-31');
    for(const r of e.componentRefs)assert.ok(manifest.artifacts.some((a:any)=>a.contentId===r.contentId&&a.sha256===r.sha256));}
});
test('AP23G3 DEC036 approval is distinct from absent release/source/operating and export approval',()=>{
  assert.equal(c.contractStatus,'approved');assert.deepEqual(c.contractDecision,{id:'DEC-2026-036',status:'approved',on:'2026-10-22'});
  assert.equal(c.runtimeActive,false);assert.equal(c.releaseBinding.status,'candidate');assert.equal(c.releaseBinding.releaseId,null);assert.equal(c.releaseBinding.approval,null);
  assert.deepEqual(c.releaseBinding.targetComponentRefs,[]);assert.equal(c.releaseBinding.sourceReviewRef,null);assert.equal(c.releaseBinding.referenceSuiteRef,null);
  for(const e of c.releaseBinding.pathEligibility){assert.equal(e.status,'candidate');assert.deepEqual(e.targetComponentRefs,[]);assert.equal(e.sourceReviewRef,null);assert.equal(e.referenceSuiteRef,null);}
  for(const key of['productionActivation','sourceReleaseApproved','calendarExportEnabled'])assert.equal(manifest.extensions['steimer.local-reference'][key],false);
});
test('AP23G3 all synthetic approved shapes are generated only in memory and leave actual files unchanged',()=>{
  const before=sha(manifestText),f=buildSyntheticFormat11('approved'),synthetic=JSON.parse(f.files.get(AP23G3_ADMIN)!);
  assert.equal(f.manifest.releaseStatus,'approved');assert.notEqual(f.manifest.releaseId,AP23G3_RELEASE_ID);assert.equal(f.manifest.extensions['steimer.synthetic-test'].humanApproval,false);
  assert.equal(synthetic.releaseBinding.status,'approved');assert.equal(synthetic.holidayBindings.find((h:any)=>h.physicalReuse).physicalReuse.sourceReleaseId,'2026-10-22-ap23f3-candidate.1');
  assert.equal(sha(raw(`${AP23G3_TARGET}/manifest.json`)),before);assert.equal(buildSyntheticFormat11().manifest.releaseStatus,'candidate');
});
test('AP23G3 fixture facts keep relevant current conditions separate and delegate all42 older contracts',()=>{
  const ur:any=administrativeInput11(c),so:any=administrativeInput11(c,'so-admin-reasons-10'),sh:any=administrativeInput11(c,'sh-court-reasons-30');
  assert.equal(ur.caseQualification.openingOrigin,'originalReasoned');assert.equal(ur.caseQualification.priorReasonsRequest,undefined);assert.equal(ur.caseQualification.coordinatedDecision,false);
  assert.equal(so.caseQualification.opening,'lawfullyUnreasonedAdministrativeDecisionWithExpressReasonsOffer');assert.equal(so.caseQualification.openingOrigin,undefined);assert.equal(so.caseQualification.localHolidayEffect,undefined);
  assert.equal(sh.caseQualification.sameIssuingCourt,true);assert.equal(sh.caseQualification.targetCourt,'SH-Obergericht');assert.equal(sh.caseQualification.shortenedRekurs,false);
  for(const p of old.paths){const i=administrativeInput11(c,p.pathId);assert.equal(i.selection.pathId,p.pathId);}
});
