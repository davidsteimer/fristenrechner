// SPDX-License-Identifier: AGPL-3.0-only
// Native semantic inventory. A recomputed hash does not amend accepted law.
import schema from '../../schemas/administrative-procedure-catalog-v10.schema.json';
import {assertSchema} from './schemaContract';
import {AdministrativeCatalogError,administrativeIntervalContains} from './administrativeCatalog';
import type {AdministrativeReleaseContext} from './administrativeCatalog';
import {canonicalSocialJson,socialObjectSha256} from './socialCatalog';
import {ADMINISTRATIVE_V10_BASELINE} from './administrativeV10Baseline';
import type {AdministrativePathV6,AdministrativeProfileReferenceV6,AdministrativePathEligibilityV6} from './administrativeTypesV6';
import type {AdministrativePathV7} from './administrativeTypesV7';
import type {AdministrativePathV10,AdministrativeProcedureCatalogV10} from './administrativeTypesV10';
import type {AdministrativePathV9} from './administrativeTypesV9';
import type {AdministrativePathV8} from './administrativeTypesV8';
const fail=(message:string):never=>{throw new AdministrativeCatalogError(message);};
const same=(a:unknown,b:unknown,message:string):void=>{if(canonicalSocialJson(a)!==canonicalSocialJson(b))fail(message);};
function jsonTree(value:unknown,seen=new Set<object>(),depth=0):boolean{
 if(value===null||typeof value==='string'||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value))return true;
 if(!value||typeof value!=='object'||depth>100||seen.has(value)||(!Array.isArray(value)&&![Object.prototype,null].includes(Object.getPrototypeOf(value))))return false;
 const next=new Set(seen);next.add(value);const keys=Reflect.ownKeys(value);
 if(Array.isArray(value)){
  if(Object.getPrototypeOf(value)!==Array.prototype||keys.length!==value.length+1)return false;
  for(let i=0;i<value.length;i++){const d=Object.getOwnPropertyDescriptor(value,String(i));if(!d||!d.enumerable||!('value'in d)||!jsonTree(d.value,next,depth+1))return false;}
  return keys.every(key=>key==='length'||typeof key==='string'&&/^(0|[1-9][0-9]*)$/u.test(key)&&Number(key)<value.length);
 }
 return keys.every(key=>typeof key==='string'&&Object.getOwnPropertyDescriptor(value,key)!.enumerable&&'value'in Object.getOwnPropertyDescriptor(value,key)!
  &&jsonTree(Object.getOwnPropertyDescriptor(value,key)!.value,next,depth+1));
}
function unique<T>(rows:readonly T[],id:(row:T)=>string,label:string):Map<string,T>{const values=new Map(rows.map(row=>[id(row),row]));if(values.size!==rows.length)fail('Duplicate '+label);return values;}
function definitions(rows:readonly unknown[],id:string,expected:Readonly<Record<string,string>>):void{
 const values=unique(rows,row=>String((row as Record<string,unknown>)[id]),id);
 same([...values.keys()].sort(),Object.keys(expected).sort(),'Unaccepted V10 '+id+' inventory');
 for(const[key,value]of values)if(socialObjectSha256(value)!==expected[key])fail('Changed accepted V10 definition '+key);
}
export function administrativeProfileClosureV10(path:AdministrativePathV6|AdministrativePathV7|AdministrativePathV8|AdministrativePathV9|AdministrativePathV10,c:AdministrativeProcedureCatalogV10):readonly AdministrativeProfileReferenceV6[]{
 const choice=path.suspensionSelection,ids=choice.kind==='fixed'?[choice.suspensionProfileId]:choice.cases.map(row=>row.suspensionProfileId);
 return[...new Set(ids)].sort().map(id=>{const p=c.suspensionProfiles.find(row=>row.suspensionProfileId===id);if(!p||p.lawId!==path.lawId)return fail('Foreign or unresolved V10 suspension');return{suspensionProfileId:id,sha256:socialObjectSha256(p)};});
}
/** Physical identity changes only after actual target-byte rebinding. */
export function administrativeBindingReferencesV10(binding:AdministrativeProcedureCatalogV10['holidayBindings'][number]){
 return'physicalSource'in binding?binding.physicalSource.references:binding.physicalBaseline.references;
}
export function assertAdministrativeProcedureCatalogV10(value:unknown):asserts value is AdministrativeProcedureCatalogV10{
 // Reject hostile object graphs without reading accessors. Cheap semantic pins also
 // reject resealed mutations before the larger structural schema traversal.
 if(!jsonTree(value)||!value||typeof value!=='object')fail('Administrative V10 is not plain JSON data');
 const c=value as AdministrativeProcedureCatalogV10;
 for(const field of['paths','qualificationPolicies','laws','suspensionProfiles','excludedPaths','sources','preserved','holidayBindings']as const)if(!Array.isArray(c[field]))fail('Missing V10 '+field);
 if(c.contractStatus!=='approved'||c.contractDecision.status!=='approved'||c.contractDecision.on!=='2026-10-28')fail('DEC-2026-042 is not confirmed');
 for(const[key,id]of[['paths','pathId'],['qualificationPolicies','pathId'],['laws','lawId'],['suspensionProfiles','suspensionProfileId'],['excludedPaths','exclusionId']]as const)definitions(c[key],id,ADMINISTRATIVE_V10_BASELINE[key]);
 definitions(c.sources.map(({reviewedOn:_date,reviewBasis:_basis,...identity})=>identity),'sourceId',ADMINISTRATIVE_V10_BASELINE.sources);
 definitions(c.preserved,'path',ADMINISTRATIVE_V10_BASELINE.preserved);
 definitions(c.holidayBindings.map(binding=>{
  if('physicalSource'in binding){const{physicalSource:_physical,...legal}=binding;return legal;}
  const{physicalBaseline,...legal}=binding;return{...legal,calendarId:physicalBaseline.calendarId,projectionId:physicalBaseline.projectionId};
 }),'holidayBindingId',ADMINISTRATIVE_V10_BASELINE.holidayBindings);
 try{assertSchema(value,schema);}catch(error){return fail('Administrative V10 schema: '+(error instanceof Error?error.message:String(error)));}
 if(!c.review.basis.trim()||!c.review.sourceReview.trim())fail('Blank V10 catalog evidence');
 for(const source of c.sources)if(!source.reviewBasis.trim()||source.reviewedOn>c.review.checkedOn)fail('Invalid V10 source review');
 const policies=unique(c.qualificationPolicies,row=>row.pathId,'V10 policy'),entries=unique(c.releaseBinding.pathEligibility,row=>row.pathId,'V10 eligibility');
 const bindings=unique(c.holidayBindings,row=>row.holidayBindingId,'V10 binding'),profiles=unique(c.suspensionProfiles,row=>row.suspensionProfileId,'V10 profile');
 same([...policies.keys()].sort(),c.paths.map(p=>p.pathId).sort(),'Complete V10 policies');same([...entries.keys()].sort(),c.paths.map(p=>p.pathId).sort(),'Complete V10 eligibility');
 const release=c.releaseBinding,targets=unique(release.targetComponentRefs,row=>row.contentId,'V10 targets');
 const physicalUnion=new Map<string,ReturnType<typeof administrativeBindingReferencesV10>[number]>();
 for(const binding of c.holidayBindings){
  const refs=unique(administrativeBindingReferencesV10(binding),row=>row.contentId,'V10 physical binding');
  let ids:string[];
  if('physicalSource'in binding){const choice=binding.calendarSelection;
   ids=choice.kind==='fixedAuthoritySeat'?[choice.calendarId]:choice.kind==='qualifiedAuthoritySeatRegion'?choice.cases.map(row=>row.calendarId):choice.terminals.flatMap(t=>t.variants.map(v=>v.calendarId));
   // Derive alternative calendar identities from the accepted references, not a first-canton match.
   if(choice.kind==='qualifiedPartyOrRepresentativeCanton'){
    const expected=ADMINISTRATIVE_V10_BASELINE.holidayBindings[binding.holidayBindingId as keyof typeof ADMINISTRATIVE_V10_BASELINE.holidayBindings];if(!expected)fail('Unaccepted V10 dynamic binding');
    if(choice.terminals.length!==26||choice.terminals.reduce((n,t)=>n+t.variants.length,0)!==28)fail('Incomplete V10 terminal table');
    const names=new Set(choice.terminals.flatMap(t=>t.variants.flatMap(v=>[v.calendarId])));
    const remainder=[...refs.keys()].filter(id=>id!=='ch-federal-calendar'&&id!=='ch-holiday-catalog'&&!names.has(id));
    // The accepted SG alternative adds exactly Berchtold, independently of its base calendar.
    if(remainder.length!==1||remainder[0]!=='ap22-sg-f95068e3b162')fail('Incomplete V10 bound alternative calendar');
    ids=[...names,...remainder];
   }
  }else ids=[binding.physicalBaseline.calendarId,...('bindingVersion'in binding&&binding.bindingVersion==='5.0.0'?[binding.projectionEvidence.baselineCalendarId]:[])];
  same([...refs.keys()].sort(),[...new Set([...ids,'ch-federal-calendar','ch-holiday-catalog'])].sort(),'V10 exact physical dependencies');
  for(const ref of refs.values()){
   if(ref.role!==(ref.contentId==='ch-holiday-catalog'?'holidayCatalog':'calendar')||ref.path.startsWith('/')||ref.path.includes('\\')||ref.path.split('/').some(x=>!x||x==='.'||x==='..'))fail('V10 physical role/path mismatch');
   if(physicalUnion.has(ref.contentId))same(ref,physicalUnion.get(ref.contentId),'Conflicting V10 physical reference');else physicalUnion.set(ref.contentId,ref);
  }
 }
 if(release.status==='candidate'){
  if(release.releaseId!==null||release.approval!==null||targets.size||release.sourceReviewRef!==null||release.referenceSuiteRef!==null)fail('V10 candidate cannot claim release evidence');
 }else{
  if(release.status!=='approved'||!release.releaseId||!release.sourceReviewRef||!release.referenceSuiteRef)fail('V10 release evidence missing');
  same([...targets.keys()].sort(),[...physicalUnion.keys()].sort(),'V10 approved target inventory');
  if(!release.approval||release.approval.approvedOn<c.review.checkedOn||!release.approval.approvedBy.trim()||!release.approval.decisionRef.trim())fail('Unqualified V10 release approval');
  for(const ref of targets.values()){const p=physicalUnion.get(ref.contentId)!;same(ref,{role:p.role,contentId:p.contentId,sha256:p.sha256},'V10 actual target mismatch');}
 }
 for(const path of c.paths){const q=policies.get(path.pathId)!,e=entries.get(path.pathId)!,b=bindings.get(path.holidayBindingId)!;
  if(!b||b.lawId!==path.lawId||q.pathRevision!==path.revision||q.pathSha256!==socialObjectSha256(path))fail('V10 path relation mismatch');
  if(e.status!==release.status||e.pathRevision!==path.revision||e.pathSha256!==socialObjectSha256(path)||e.holidayBindingId!==b.holidayBindingId
   ||e.holidayBindingSha256!==socialObjectSha256(b)||e.qualificationPolicySha256!==socialObjectSha256(q))fail('V10 eligibility hash/relation mismatch');
  same(e.caseCoverage,path.temporalBinding.caseCoverage,'V10 case coverage mismatch');same(e.calculationCoverage,path.temporalBinding.calculationCoverage,'V10 calculation coverage mismatch');
  same(e.sourceReviewRef,release.sourceReviewRef,'V10 source review mismatch');same(e.referenceSuiteRef,release.referenceSuiteRef,'V10 reference suite mismatch');
  if('suspensionSelection'in path){
   const mode=path.contractFamily==='qualifiedDayProcedureV10'?'qualifiedDayProcedureV10':path.contractFamily==='qualifiedDayProcedureV9'?'qualifiedDayProcedureV9':path.contractFamily==='qualifiedDayProcedureV8'?'qualifiedDayProcedureV8':'openingPolicy'in path?'qualifiedDayProcedureV7':'qualifiedDayProcedureV6';
   if(q.mode!==mode||!('suspensionProfiles'in e)||!('suspensionSelectionSha256'in e)||e.suspensionSelectionSha256!==socialObjectSha256(path.suspensionSelection))fail('V10 selection contract mismatch');
   same((e as AdministrativePathEligibilityV6).suspensionProfiles,administrativeProfileClosureV10(path,c),'V10 complete profile closure');
   if('openingPolicy'in path&&(!('openingPolicySha256'in e)||e.openingPolicySha256!==socialObjectSha256(path.openingPolicy)))fail('V10 opening hash mismatch');
   if(mode==='qualifiedDayProcedureV8'){
    if(!('physicalSource'in b)||b.bindingVersion!=='8.0.0'||!('calendarSelectionSha256'in e)||!('annualEndShiftPolicySha256'in e)
     ||e.calendarSelectionSha256!==socialObjectSha256(b.calendarSelection)||e.annualEndShiftPolicySha256!==socialObjectSha256(b.annualEndShiftPolicy))fail('V10 explicit end-calendar policy hash mismatch');
    const choice=path.suspensionSelection;if(choice.kind!=='fixed'||c.suspensionProfiles.find(p=>p.suspensionProfileId===choice.suspensionProfileId)?.periods.length!==0)fail('Inherited V8 unexpected recess');
   }
   if(mode==='qualifiedDayProcedureV10'||mode==='qualifiedDayProcedureV9'){
    if(!('physicalSource'in b)||b.bindingVersion!==(mode==='qualifiedDayProcedureV10'?'10.0.0':'9.0.0')||!('calendarSelectionSha256'in e)||!('proceduralCalendarSupplementSha256'in e)||!('durationPolicySha256'in e)
     ||e.calendarSelectionSha256!==socialObjectSha256(b.calendarSelection)||e.proceduralCalendarSupplementSha256!==socialObjectSha256(b.proceduralCalendarSupplement)
     ||e.durationPolicySha256!==socialObjectSha256(path.duration))fail('V10 explicit duration or procedural supplement hash mismatch');
   }
  }else{const p=profiles.get(path.suspensionProfileId);if(!p||p.lawId!==path.lawId||!('suspensionProfileId'in e)||!('suspensionProfileSha256'in e)||e.suspensionProfileId!==p.suspensionProfileId||e.suspensionProfileSha256!==socialObjectSha256(p))fail('Historical V10 profile mismatch');}
  const refs=unique(e.targetComponentRefs,row=>row.contentId,'V10 path target');
  if(release.status==='candidate'){if(refs.size)fail('V10 candidate path cannot claim approval');}
  else{same([...refs.keys()].sort(),administrativeBindingReferencesV10(b).map(r=>r.contentId).sort(),'V10 path target inventory');for(const ref of refs.values())same(ref,targets.get(ref.contentId),'V10 path target bytes');}
  if(!administrativeIntervalContains(path.temporalBinding.calculationCoverage,path.temporalBinding.caseCoverage.from)||!administrativeIntervalContains(path.temporalBinding.calculationCoverage,path.temporalBinding.caseCoverage.to))fail('V10 nonnested coverage');
 }
}
export function validateAdministrativeReleaseBindingsV10(c:AdministrativeProcedureCatalogV10,context:AdministrativeReleaseContext):void{
 assertAdministrativeProcedureCatalogV10(c);const actual=unique(context.componentRefs,row=>row.contentId,'V10 actual component');
 const expected=new Map(c.holidayBindings.flatMap(b=>administrativeBindingReferencesV10(b).map(r=>[r.contentId,r]as const)));
 same([...actual.keys()].sort(),[...expected.keys()].sort(),'V10 actual inventory');
 for(const[id,ref]of actual){const e=expected.get(id)!;if(ref.role!==e.role||ref.sha256!==e.sha256)fail('V10 actual component mismatch');}
 for(const b of c.holidayBindings)if(('physicalSource'in b?b.physicalSource:b.physicalBaseline).releaseId!==context.releaseId)fail('Stale V10 physical source release');
 if(context.mode==='localReference'){if(c.releaseBinding.status!=='candidate')fail('V10 local reference cannot claim approval');return;}
 if(context.mode!=='approved'||c.releaseBinding.status!=='approved'||c.releaseBinding.releaseId!==context.releaseId)fail('V10 release not approved');
 for(const ref of c.releaseBinding.targetComponentRefs)same(ref,actual.get(ref.contentId),'V10 released bytes mismatch');
}

