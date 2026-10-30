// SPDX-License-Identifier: AGPL-3.0-only
import schema from '../../schemas/administrative-procedure-catalog-v7.schema.json';
import {assertSchema} from './schemaContract';
import {AdministrativeCatalogError,administrativeIntervalContains} from './administrativeCatalog';
import type {AdministrativeReleaseContext} from './administrativeCatalog';
import {canonicalSocialJson,socialObjectSha256} from './socialCatalog';
import {ADMINISTRATIVE_V7_BASELINE} from './administrativeV7Baseline';
import type {AdministrativePathV6,AdministrativeProfileReferenceV6,AdministrativePathEligibilityV6,AdministrativeQualificationPolicyV6} from './administrativeTypesV6';
import type {AdministrativeProcedureCatalogV7,AdministrativePathV7,AdministrativePathEligibilityV7,AdministrativeQualificationPolicyV7} from './administrativeTypesV7';
const fail=(message:string):never=>{throw new AdministrativeCatalogError(message);};
const same=(a:unknown,b:unknown,message:string):void=>{if(canonicalSocialJson(a)!==canonicalSocialJson(b))fail(message);};
function unique<T>(rows:readonly T[],id:(row:T)=>string,label:string):Map<string,T>{
 const values=new Map(rows.map(row=>[id(row),row]));if(values.size!==rows.length)fail('Duplicate '+label);return values;
}
function definitions(rows:readonly unknown[],id:string,expected:Readonly<Record<string,string>>):void{
 const values=unique(rows,row=>String((row as Record<string,unknown>)[id]),id);
 same([...values.keys()].sort(),Object.keys(expected).sort(),'Unaccepted V7 '+id+' inventory');
 for(const[key,value]of values)if(socialObjectSha256(value)!==expected[key])fail('Changed accepted V7 definition '+key);
}
export function administrativeProfileClosureV7(path:AdministrativePathV6|AdministrativePathV7,catalog:AdministrativeProcedureCatalogV7):readonly AdministrativeProfileReferenceV6[]{
 const selection=path.suspensionSelection,ids=selection.kind==='fixed'?[selection.suspensionProfileId]:selection.cases.map(row=>row.suspensionProfileId);
 return [...new Set(ids)].sort().map(id=>{const profile=catalog.suspensionProfiles.find(row=>row.suspensionProfileId===id);
  if(!profile||profile.lawId!==path.lawId)fail('Foreign or unresolved V7 suspension');
  return{suspensionProfileId:id,sha256:socialObjectSha256(profile)};});
}
/** Native V7 semantics, not a conversion to an older catalogue or permission. */
export function assertAdministrativeProcedureCatalogV7(value:unknown):asserts value is AdministrativeProcedureCatalogV7{
 try{assertSchema(value,schema);}catch(error){return fail('Administrative V7 schema: '+(error instanceof Error?error.message:String(error)));}
 const c=value as AdministrativeProcedureCatalogV7;
 if(c.contractStatus!=='approved'||c.contractDecision.status!=='approved'||c.contractDecision.on!=='2026-10-27')fail('DEC-2026-039 is not confirmed');
 for(const[key,id]of[['paths','pathId'],['qualificationPolicies','pathId'],['laws','lawId'],['suspensionProfiles','suspensionProfileId'],['excludedPaths','exclusionId']]as const)
  definitions(c[key],id,ADMINISTRATIVE_V7_BASELINE[key]);
 definitions(c.sources.map(({reviewedOn:_date,reviewBasis:_basis,...identity})=>identity),'sourceId',ADMINISTRATIVE_V7_BASELINE.sources);
 definitions(c.preserved,'path',ADMINISTRATIVE_V7_BASELINE.preserved);
 definitions(c.holidayBindings.map(({physicalBaseline,...legal})=>({...legal,calendarId:physicalBaseline.calendarId,projectionId:physicalBaseline.projectionId})),
  'holidayBindingId',ADMINISTRATIVE_V7_BASELINE.holidayBindings);
 if(!c.review.basis.trim()||!c.review.sourceReview.trim())fail('Blank V7 catalog evidence');
 for(const source of c.sources)if(!source.reviewBasis.trim()||source.reviewedOn>c.review.checkedOn)fail('Invalid V7 source review');
 const policies=unique(c.qualificationPolicies,row=>row.pathId,'V7 policy'),eligibility=unique(c.releaseBinding.pathEligibility,row=>row.pathId,'V7 eligibility');
 const bindings=unique(c.holidayBindings,row=>row.holidayBindingId,'V7 binding'),profiles=unique(c.suspensionProfiles,row=>row.suspensionProfileId,'V7 profile');
 same([...policies.keys()].sort(),c.paths.map(path=>path.pathId).sort(),'Complete V7 policies');
 same([...eligibility.keys()].sort(),c.paths.map(path=>path.pathId).sort(),'Complete V7 eligibility');
 const release=c.releaseBinding,target=unique(release.targetComponentRefs,row=>row.contentId,'V7 target');
 const allPhysical=unique([...new Map(c.holidayBindings.flatMap(b=>b.physicalBaseline.references.map(ref=>[ref.contentId,ref] as const))).values()],row=>row.contentId,'V7 physical union');
 for(const binding of c.holidayBindings){
  const physical=unique(binding.physicalBaseline.references,row=>row.contentId,'V7 physical binding');
  const expected=[binding.physicalBaseline.calendarId,...('bindingVersion'in binding&&binding.bindingVersion==='5.0.0'?[binding.projectionEvidence.baselineCalendarId]:[]),'ch-federal-calendar','ch-holiday-catalog'].sort();
  same([...physical.keys()].sort(),expected,'V7 physical dependency set');
  for(const ref of physical.values()){
   if(ref.role!==(ref.contentId==='ch-holiday-catalog'?'holidayCatalog':'calendar')||ref.path.startsWith('/')||ref.path.includes('\\')
    ||ref.path.split('/').some(part=>!part||part==='.'||part==='..'))fail('V7 physical role/path mismatch');
   same(ref,allPhysical.get(ref.contentId),'Conflicting V7 physical reference');
  }
 }
 if(release.status==='candidate'){
  if(release.releaseId!==null||release.approval!==null||target.size||release.sourceReviewRef!==null||release.referenceSuiteRef!==null)fail('V7 candidate cannot claim release evidence');
 }else{
  same([...target.keys()].sort(),[...allPhysical.keys()].sort(),'V7 approved target inventory');
  if(!release.approval||release.approval.approvedOn<c.review.checkedOn||!release.approval.approvedBy.trim()||!release.approval.decisionRef.trim())fail('Unqualified V7 release approval');
  for(const ref of target.values())same(ref,{role:allPhysical.get(ref.contentId)!.role,contentId:ref.contentId,sha256:allPhysical.get(ref.contentId)!.sha256},'V7 actual target mismatch');
 }
 for(const path of c.paths){
  const q=policies.get(path.pathId)!,entry=eligibility.get(path.pathId)!,binding=bindings.get(path.holidayBindingId)!;
  if(!binding||binding.lawId!==path.lawId||q.pathRevision!==path.revision||q.pathSha256!==socialObjectSha256(path))fail('V7 path relation mismatch');
  if(entry.status!==release.status||entry.pathRevision!==path.revision||entry.pathSha256!==socialObjectSha256(path)
   ||entry.holidayBindingId!==path.holidayBindingId||entry.holidayBindingSha256!==socialObjectSha256(binding)
   ||entry.qualificationPolicySha256!==socialObjectSha256(q))fail('V7 path eligibility hash/relation mismatch');
  same(entry.caseCoverage,path.temporalBinding.caseCoverage,'V7 case coverage mismatch');
  same(entry.calculationCoverage,path.temporalBinding.calculationCoverage,'V7 calculation coverage mismatch');
  same(entry.sourceReviewRef,release.sourceReviewRef,'V7 source review mismatch');same(entry.referenceSuiteRef,release.referenceSuiteRef,'V7 reference suite mismatch');
  if('suspensionSelection'in path){
   if(q.mode!==('openingPolicy'in path?'qualifiedDayProcedureV7':'qualifiedDayProcedureV6')||!('suspensionProfiles'in entry)||!('suspensionSelectionSha256'in entry))fail('V7 selection contract missing');
   const selectedEntry=entry as AdministrativePathEligibilityV6,selectedPolicy=q as AdministrativeQualificationPolicyV6|AdministrativeQualificationPolicyV7;
   if('openingPolicy'in path&&(!('openingPolicySha256'in entry)||entry.openingPolicySha256!==socialObjectSha256(path.openingPolicy)))fail('V7 opening policy hash mismatch');
   if(selectedEntry.suspensionSelectionSha256!==socialObjectSha256(path.suspensionSelection))fail('V7 selection hash mismatch');
   same(selectedEntry.suspensionProfiles,administrativeProfileClosureV7(path,c),'V7 complete unique profile closure');
   if(new Set(selectedPolicy.requirements.map(row=>row.key)).size!==selectedPolicy.requirements.length)fail('Duplicate V7 current fact');
  }else{
   const profile=profiles.get(path.suspensionProfileId);
   if(!profile||profile.lawId!==path.lawId||!('suspensionProfileId'in entry)||!('suspensionProfileSha256'in entry)
    ||entry.suspensionProfileId!==path.suspensionProfileId||entry.suspensionProfileSha256!==socialObjectSha256(profile))fail('Historical V7 profile binding mismatch');
  }
  const refs=unique(entry.targetComponentRefs,row=>row.contentId,'V7 path target');
  if(release.status==='candidate'){if(refs.size)fail('V7 candidate path cannot claim target approval');}
  else{same([...refs.keys()].sort(),binding.physicalBaseline.references.map(ref=>ref.contentId).sort(),'V7 path target inventory');
   for(const ref of refs.values())same(ref,target.get(ref.contentId),'V7 path target bytes mismatch');}
  if(!administrativeIntervalContains(path.temporalBinding.calculationCoverage,path.temporalBinding.caseCoverage.from)
   ||!administrativeIntervalContains(path.temporalBinding.calculationCoverage,path.temporalBinding.caseCoverage.to))fail('V7 nonnested path coverage');
 }
}
export function validateAdministrativeReleaseBindingsV7(c:AdministrativeProcedureCatalogV7,context:AdministrativeReleaseContext):void{
 assertAdministrativeProcedureCatalogV7(c);
 const actual=unique(context.componentRefs,row=>row.contentId,'V7 actual component'),expected=new Map(c.holidayBindings.flatMap(b=>b.physicalBaseline.references.map(ref=>[ref.contentId,ref]as const)));
 same([...actual.keys()].sort(),[...expected.keys()].sort(),'V7 actual component inventory');
 for(const[id,ref]of actual){const pinned=expected.get(id)!;if(ref.role!==pinned.role||ref.sha256!==pinned.sha256)fail('V7 actual component role/hash mismatch');}
 if(c.holidayBindings.some(binding=>binding.physicalBaseline.releaseId!==context.releaseId))fail('Stale V7 physical target release');
 if(context.mode==='localReference'){if(c.releaseBinding.status!=='candidate')fail('V7 local reference is not an approval');return;}
 if(context.mode!=='approved'||c.releaseBinding.status!=='approved'||c.releaseBinding.releaseId!==context.releaseId)fail('V7 release not approved');
 for(const ref of c.releaseBinding.targetComponentRefs)same(ref,actual.get(ref.contentId),'V7 released target bytes mismatch');
}

