// SPDX-License-Identifier: AGPL-3.0-only
import schema from '../../schemas/administrative-procedure-catalog-v6.schema.json';
import {assertSchema} from './schemaContract';
import {AdministrativeCatalogError,administrativeIntervalContains} from './administrativeCatalog';
import type {AdministrativeReleaseContext} from './administrativeCatalog';
import {canonicalSocialJson,socialObjectSha256} from './socialCatalog';
import {ADMINISTRATIVE_V6_BASELINE} from './administrativeV6Baseline';
import type {AdministrativeProcedureCatalogV6,AdministrativePathV6,AdministrativeProfileReferenceV6,AdministrativePathEligibilityV6,AdministrativeQualificationPolicyV6} from './administrativeTypesV6';
const fail=(message:string):never=>{throw new AdministrativeCatalogError(message);};
const same=(a:unknown,b:unknown,message:string):void=>{if(canonicalSocialJson(a)!==canonicalSocialJson(b))fail(message);};
function unique<T>(rows:readonly T[],id:(row:T)=>string,label:string):Map<string,T>{
 const values=new Map(rows.map(row=>[id(row),row]));if(values.size!==rows.length)fail('Duplicate '+label);return values;
}
function definitions(rows:readonly unknown[],id:string,expected:Readonly<Record<string,string>>):void{
 const values=unique(rows,row=>String((row as Record<string,unknown>)[id]),id);
 same([...values.keys()].sort(),Object.keys(expected).sort(),'Unaccepted V6 '+id+' inventory');
 for(const[key,value]of values)if(socialObjectSha256(value)!==expected[key])fail('Changed accepted V6 definition '+key);
}
export function administrativeProfileClosureV6(path:AdministrativePathV6,catalog:AdministrativeProcedureCatalogV6):readonly AdministrativeProfileReferenceV6[]{
 const selection=path.suspensionSelection,ids=selection.kind==='fixed'?[selection.suspensionProfileId]:selection.cases.map(row=>row.suspensionProfileId);
 return [...new Set(ids)].sort().map(id=>{const profile=catalog.suspensionProfiles.find(row=>row.suspensionProfileId===id);
  if(!profile||profile.lawId!==path.lawId)fail('Foreign or unresolved V6 suspension');
  return{suspensionProfileId:id,sha256:socialObjectSha256(profile)};});
}
/** Native V6 semantics, not a conversion to an older catalogue or permission. */
export function assertAdministrativeProcedureCatalogV6(value:unknown):asserts value is AdministrativeProcedureCatalogV6{
 try{assertSchema(value,schema);}catch(error){return fail('Administrative V6 schema: '+(error instanceof Error?error.message:String(error)));}
 const c=value as AdministrativeProcedureCatalogV6;
 if(c.contractStatus!=='approved'||c.contractDecision.status!=='approved'||c.contractDecision.on!=='2026-10-22')fail('DEC-2026-038 is not confirmed');
 for(const[key,id]of[['paths','pathId'],['qualificationPolicies','pathId'],['laws','lawId'],['suspensionProfiles','suspensionProfileId'],['excludedPaths','exclusionId']]as const)
  definitions(c[key],id,ADMINISTRATIVE_V6_BASELINE[key]);
 definitions(c.sources.map(({reviewedOn:_date,reviewBasis:_basis,...identity})=>identity),'sourceId',ADMINISTRATIVE_V6_BASELINE.sources);
 definitions(c.preserved,'path',ADMINISTRATIVE_V6_BASELINE.preserved);
 definitions(c.holidayBindings.map(({physicalBaseline,...legal})=>({...legal,calendarId:physicalBaseline.calendarId,projectionId:physicalBaseline.projectionId})),
  'holidayBindingId',ADMINISTRATIVE_V6_BASELINE.holidayBindings);
 if(!c.review.basis.trim()||!c.review.sourceReview.trim())fail('Blank V6 catalog evidence');
 for(const source of c.sources)if(!source.reviewBasis.trim()||source.reviewedOn>c.review.checkedOn)fail('Invalid V6 source review');
 const policies=unique(c.qualificationPolicies,row=>row.pathId,'V6 policy'),eligibility=unique(c.releaseBinding.pathEligibility,row=>row.pathId,'V6 eligibility');
 const bindings=unique(c.holidayBindings,row=>row.holidayBindingId,'V6 binding'),profiles=unique(c.suspensionProfiles,row=>row.suspensionProfileId,'V6 profile');
 same([...policies.keys()].sort(),c.paths.map(path=>path.pathId).sort(),'Complete V6 policies');
 same([...eligibility.keys()].sort(),c.paths.map(path=>path.pathId).sort(),'Complete V6 eligibility');
 const release=c.releaseBinding,target=unique(release.targetComponentRefs,row=>row.contentId,'V6 target');
 const allPhysical=unique([...new Map(c.holidayBindings.flatMap(b=>b.physicalBaseline.references.map(ref=>[ref.contentId,ref] as const))).values()],row=>row.contentId,'V6 physical union');
 for(const binding of c.holidayBindings){
  const physical=unique(binding.physicalBaseline.references,row=>row.contentId,'V6 physical binding');
  const expected=[binding.physicalBaseline.calendarId,...('bindingVersion'in binding&&binding.bindingVersion==='5.0.0'?[binding.projectionEvidence.baselineCalendarId]:[]),'ch-federal-calendar','ch-holiday-catalog'].sort();
  same([...physical.keys()].sort(),expected,'V6 physical dependency set');
  for(const ref of physical.values()){
   if(ref.role!==(ref.contentId==='ch-holiday-catalog'?'holidayCatalog':'calendar')||ref.path.startsWith('/')||ref.path.includes('\\')
    ||ref.path.split('/').some(part=>!part||part==='.'||part==='..'))fail('V6 physical role/path mismatch');
   same(ref,allPhysical.get(ref.contentId),'Conflicting V6 physical reference');
  }
 }
 if(release.status==='candidate'){
  if(release.releaseId!==null||release.approval!==null||target.size||release.sourceReviewRef!==null||release.referenceSuiteRef!==null)fail('V6 candidate cannot claim release evidence');
 }else{
  same([...target.keys()].sort(),[...allPhysical.keys()].sort(),'V6 approved target inventory');
  if(!release.approval||release.approval.approvedOn<c.review.checkedOn||!release.approval.approvedBy.trim()||!release.approval.decisionRef.trim())fail('Unqualified V6 release approval');
  for(const ref of target.values())same(ref,{role:allPhysical.get(ref.contentId)!.role,contentId:ref.contentId,sha256:allPhysical.get(ref.contentId)!.sha256},'V6 actual target mismatch');
 }
 for(const path of c.paths){
  const q=policies.get(path.pathId)!,entry=eligibility.get(path.pathId)!,binding=bindings.get(path.holidayBindingId)!;
  if(!binding||binding.lawId!==path.lawId||q.pathRevision!==path.revision||q.pathSha256!==socialObjectSha256(path))fail('V6 path relation mismatch');
  if(entry.status!==release.status||entry.pathRevision!==path.revision||entry.pathSha256!==socialObjectSha256(path)
   ||entry.holidayBindingId!==path.holidayBindingId||entry.holidayBindingSha256!==socialObjectSha256(binding)
   ||entry.qualificationPolicySha256!==socialObjectSha256(q))fail('V6 path eligibility hash/relation mismatch');
  same(entry.caseCoverage,path.temporalBinding.caseCoverage,'V6 case coverage mismatch');
  same(entry.calculationCoverage,path.temporalBinding.calculationCoverage,'V6 calculation coverage mismatch');
  same(entry.sourceReviewRef,release.sourceReviewRef,'V6 source review mismatch');same(entry.referenceSuiteRef,release.referenceSuiteRef,'V6 reference suite mismatch');
  if('suspensionSelection'in path){
   if(q.mode!=='qualifiedDayProcedureV6'||!('suspensionProfiles'in entry)||!('suspensionSelectionSha256'in entry))fail('V6 selection contract missing');
   const selectedEntry=entry as AdministrativePathEligibilityV6,selectedPolicy=q as AdministrativeQualificationPolicyV6;
   if(selectedEntry.suspensionSelectionSha256!==socialObjectSha256(path.suspensionSelection))fail('V6 selection hash mismatch');
   same(selectedEntry.suspensionProfiles,administrativeProfileClosureV6(path,c),'V6 complete unique profile closure');
   if(new Set(selectedPolicy.requirements.map(row=>row.key)).size!==selectedPolicy.requirements.length)fail('Duplicate V6 current fact');
  }else{
   const profile=profiles.get(path.suspensionProfileId);
   if(!profile||profile.lawId!==path.lawId||!('suspensionProfileId'in entry)||!('suspensionProfileSha256'in entry)
    ||entry.suspensionProfileId!==path.suspensionProfileId||entry.suspensionProfileSha256!==socialObjectSha256(profile))fail('Historical V6 profile binding mismatch');
  }
  const refs=unique(entry.targetComponentRefs,row=>row.contentId,'V6 path target');
  if(release.status==='candidate'){if(refs.size)fail('V6 candidate path cannot claim target approval');}
  else{same([...refs.keys()].sort(),binding.physicalBaseline.references.map(ref=>ref.contentId).sort(),'V6 path target inventory');
   for(const ref of refs.values())same(ref,target.get(ref.contentId),'V6 path target bytes mismatch');}
  if(!administrativeIntervalContains(path.temporalBinding.calculationCoverage,path.temporalBinding.caseCoverage.from)
   ||!administrativeIntervalContains(path.temporalBinding.calculationCoverage,path.temporalBinding.caseCoverage.to))fail('V6 nonnested path coverage');
 }
}
export function validateAdministrativeReleaseBindingsV6(c:AdministrativeProcedureCatalogV6,context:AdministrativeReleaseContext):void{
 assertAdministrativeProcedureCatalogV6(c);
 const actual=unique(context.componentRefs,row=>row.contentId,'V6 actual component'),expected=new Map(c.holidayBindings.flatMap(b=>b.physicalBaseline.references.map(ref=>[ref.contentId,ref]as const)));
 same([...actual.keys()].sort(),[...expected.keys()].sort(),'V6 actual component inventory');
 for(const[id,ref]of actual){const pinned=expected.get(id)!;if(ref.role!==pinned.role||ref.sha256!==pinned.sha256)fail('V6 actual component role/hash mismatch');}
 if(c.holidayBindings.some(binding=>binding.physicalBaseline.releaseId!==context.releaseId))fail('Stale V6 physical target release');
 if(context.mode==='localReference'){if(c.releaseBinding.status!=='candidate')fail('V6 local reference is not an approval');return;}
 if(context.mode!=='approved'||c.releaseBinding.status!=='approved'||c.releaseBinding.releaseId!==context.releaseId)fail('V6 release not approved');
 for(const ref of c.releaseBinding.targetComponentRefs)same(ref,actual.get(ref.contentId),'V6 released target bytes mismatch');
}
