// SPDX-License-Identifier: AGPL-3.0-only
// Native semantic inventory. A recomputed hash does not amend accepted law.
import schema from '../../schemas/administrative-procedure-catalog-v9.schema.json';
import {assertSchema} from './schemaContract';
import {AdministrativeCatalogError,administrativeIntervalContains} from './administrativeCatalog';
import type {AdministrativeReleaseContext} from './administrativeCatalog';
import {canonicalSocialJson,socialObjectSha256} from './socialCatalog';
import {ADMINISTRATIVE_V9_BASELINE} from './administrativeV9Baseline';
import type {AdministrativePathV6,AdministrativeProfileReferenceV6,AdministrativePathEligibilityV6} from './administrativeTypesV6';
import type {AdministrativePathV7} from './administrativeTypesV7';
import type {AdministrativePathV9,AdministrativeProcedureCatalogV9} from './administrativeTypesV9';
import type {AdministrativePathV8} from './administrativeTypesV8';
const fail=(message:string):never=>{throw new AdministrativeCatalogError(message);};
const same=(a:unknown,b:unknown,message:string):void=>{if(canonicalSocialJson(a)!==canonicalSocialJson(b))fail(message);};
function jsonTree(value:unknown,seen=new Set<object>(),depth=0):boolean{
 if(value===null||typeof value==='string'||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value))return true;
 if(!value||typeof value!=='object'||depth>100||seen.has(value)||(!Array.isArray(value)&&![Object.prototype,null].includes(Object.getPrototypeOf(value))))return false;
 const next=new Set(seen);next.add(value);
 return Reflect.ownKeys(value).every(key=>typeof key==='string'&&'value'in Object.getOwnPropertyDescriptor(value,key)!
  &&(Array.isArray(value)&&key==='length'||jsonTree(Object.getOwnPropertyDescriptor(value,key)!.value,next,depth+1)));
}
function unique<T>(rows:readonly T[],id:(row:T)=>string,label:string):Map<string,T>{const values=new Map(rows.map(row=>[id(row),row]));if(values.size!==rows.length)fail('Duplicate '+label);return values;}
function definitions(rows:readonly unknown[],id:string,expected:Readonly<Record<string,string>>):void{
 const values=unique(rows,row=>String((row as Record<string,unknown>)[id]),id);
 same([...values.keys()].sort(),Object.keys(expected).sort(),'Unaccepted V9 '+id+' inventory');
 for(const[key,value]of values)if(socialObjectSha256(value)!==expected[key])fail('Changed accepted V9 definition '+key);
}
export function administrativeProfileClosureV9(path:AdministrativePathV6|AdministrativePathV7|AdministrativePathV8|AdministrativePathV9,c:AdministrativeProcedureCatalogV9):readonly AdministrativeProfileReferenceV6[]{
 const choice=path.suspensionSelection,ids=choice.kind==='fixed'?[choice.suspensionProfileId]:choice.cases.map(row=>row.suspensionProfileId);
 return[...new Set(ids)].sort().map(id=>{const p=c.suspensionProfiles.find(row=>row.suspensionProfileId===id);if(!p||p.lawId!==path.lawId)return fail('Foreign or unresolved V9 suspension');return{suspensionProfileId:id,sha256:socialObjectSha256(p)};});
}
/** Physical identity changes only after actual target-byte rebinding. */
export function administrativeBindingReferencesV9(binding:AdministrativeProcedureCatalogV9['holidayBindings'][number]){
 return'physicalSource'in binding?binding.physicalSource.references:binding.physicalBaseline.references;
}
export function assertAdministrativeProcedureCatalogV9(value:unknown):asserts value is AdministrativeProcedureCatalogV9{
 // Reject hostile object graphs without reading accessors. Cheap semantic pins also
 // reject resealed mutations before the larger structural schema traversal.
 if(!jsonTree(value)||!value||typeof value!=='object')fail('Administrative V9 is not plain JSON data');
 const c=value as AdministrativeProcedureCatalogV9;
 for(const field of['paths','qualificationPolicies','laws','suspensionProfiles','excludedPaths','sources','preserved','holidayBindings']as const)if(!Array.isArray(c[field]))fail('Missing V9 '+field);
 if(c.contractStatus!=='approved'||c.contractDecision.status!=='approved'||c.contractDecision.on!=='2026-10-27')fail('DEC-2026-041 is not confirmed');
 for(const[key,id]of[['paths','pathId'],['qualificationPolicies','pathId'],['laws','lawId'],['suspensionProfiles','suspensionProfileId'],['excludedPaths','exclusionId']]as const)definitions(c[key],id,ADMINISTRATIVE_V9_BASELINE[key]);
 definitions(c.sources.map(({reviewedOn:_date,reviewBasis:_basis,...identity})=>identity),'sourceId',ADMINISTRATIVE_V9_BASELINE.sources);
 definitions(c.preserved,'path',ADMINISTRATIVE_V9_BASELINE.preserved);
 definitions(c.holidayBindings.map(binding=>{
  if('physicalSource'in binding){const{physicalSource:_physical,...legal}=binding;return legal;}
  const{physicalBaseline,...legal}=binding;return{...legal,calendarId:physicalBaseline.calendarId,projectionId:physicalBaseline.projectionId};
 }),'holidayBindingId',ADMINISTRATIVE_V9_BASELINE.holidayBindings);
 try{assertSchema(value,schema);}catch(error){return fail('Administrative V9 schema: '+(error instanceof Error?error.message:String(error)));}
 if(!c.review.basis.trim()||!c.review.sourceReview.trim())fail('Blank V9 catalog evidence');
 for(const source of c.sources)if(!source.reviewBasis.trim()||source.reviewedOn>c.review.checkedOn)fail('Invalid V9 source review');
 const policies=unique(c.qualificationPolicies,row=>row.pathId,'V9 policy'),entries=unique(c.releaseBinding.pathEligibility,row=>row.pathId,'V9 eligibility');
 const bindings=unique(c.holidayBindings,row=>row.holidayBindingId,'V9 binding'),profiles=unique(c.suspensionProfiles,row=>row.suspensionProfileId,'V9 profile');
 same([...policies.keys()].sort(),c.paths.map(p=>p.pathId).sort(),'Complete V9 policies');same([...entries.keys()].sort(),c.paths.map(p=>p.pathId).sort(),'Complete V9 eligibility');
 const release=c.releaseBinding,targets=unique(release.targetComponentRefs,row=>row.contentId,'V9 targets');
 const physicalUnion=new Map<string,ReturnType<typeof administrativeBindingReferencesV9>[number]>();
 for(const binding of c.holidayBindings){
  const refs=unique(administrativeBindingReferencesV9(binding),row=>row.contentId,'V9 physical binding');
  let ids:string[];
  if('physicalSource'in binding){const choice=binding.calendarSelection;
   ids=choice.kind==='fixedAuthoritySeat'?[choice.calendarId]:choice.terminals.flatMap(t=>t.variants.map(v=>v.calendarId));
   // Derive alternative calendar identities from the accepted references, not a first-canton match.
   if(choice.kind==='qualifiedPartyOrRepresentativeCanton'){
    const expected=ADMINISTRATIVE_V9_BASELINE.holidayBindings[binding.holidayBindingId as keyof typeof ADMINISTRATIVE_V9_BASELINE.holidayBindings];if(!expected)fail('Unaccepted V9 dynamic binding');
    if(choice.terminals.length!==26||choice.terminals.reduce((n,t)=>n+t.variants.length,0)!==28)fail('Incomplete V9 terminal table');
    const names=new Set(choice.terminals.flatMap(t=>t.variants.flatMap(v=>[v.calendarId])));
    const remainder=[...refs.keys()].filter(id=>id!=='ch-federal-calendar'&&id!=='ch-holiday-catalog'&&!names.has(id));
    // The accepted SG alternative adds exactly Berchtold, independently of its base calendar.
    if(remainder.length!==1||remainder[0]!=='ap22-sg-f95068e3b162')fail('Incomplete V9 bound alternative calendar');
    ids=[...names,...remainder];
   }
  }else ids=[binding.physicalBaseline.calendarId,...('bindingVersion'in binding&&binding.bindingVersion==='5.0.0'?[binding.projectionEvidence.baselineCalendarId]:[])];
  same([...refs.keys()].sort(),[...new Set([...ids,'ch-federal-calendar','ch-holiday-catalog'])].sort(),'V9 exact physical dependencies');
  for(const ref of refs.values()){
   if(ref.role!==(ref.contentId==='ch-holiday-catalog'?'holidayCatalog':'calendar')||ref.path.startsWith('/')||ref.path.includes('\\')||ref.path.split('/').some(x=>!x||x==='.'||x==='..'))fail('V9 physical role/path mismatch');
   if(physicalUnion.has(ref.contentId))same(ref,physicalUnion.get(ref.contentId),'Conflicting V9 physical reference');else physicalUnion.set(ref.contentId,ref);
  }
 }
 if(release.status==='candidate'){
  if(release.releaseId!==null||release.approval!==null||targets.size||release.sourceReviewRef!==null||release.referenceSuiteRef!==null)fail('V9 candidate cannot claim release evidence');
 }else{
  if(release.status!=='approved'||!release.releaseId||!release.sourceReviewRef||!release.referenceSuiteRef)fail('V9 release evidence missing');
  same([...targets.keys()].sort(),[...physicalUnion.keys()].sort(),'V9 approved target inventory');
  if(!release.approval||release.approval.approvedOn<c.review.checkedOn||!release.approval.approvedBy.trim()||!release.approval.decisionRef.trim())fail('Unqualified V9 release approval');
  for(const ref of targets.values()){const p=physicalUnion.get(ref.contentId)!;same(ref,{role:p.role,contentId:p.contentId,sha256:p.sha256},'V9 actual target mismatch');}
 }
 for(const path of c.paths){const q=policies.get(path.pathId)!,e=entries.get(path.pathId)!,b=bindings.get(path.holidayBindingId)!;
  if(!b||b.lawId!==path.lawId||q.pathRevision!==path.revision||q.pathSha256!==socialObjectSha256(path))fail('V9 path relation mismatch');
  if(e.status!==release.status||e.pathRevision!==path.revision||e.pathSha256!==socialObjectSha256(path)||e.holidayBindingId!==b.holidayBindingId
   ||e.holidayBindingSha256!==socialObjectSha256(b)||e.qualificationPolicySha256!==socialObjectSha256(q))fail('V9 eligibility hash/relation mismatch');
  same(e.caseCoverage,path.temporalBinding.caseCoverage,'V9 case coverage mismatch');same(e.calculationCoverage,path.temporalBinding.calculationCoverage,'V9 calculation coverage mismatch');
  same(e.sourceReviewRef,release.sourceReviewRef,'V9 source review mismatch');same(e.referenceSuiteRef,release.referenceSuiteRef,'V9 reference suite mismatch');
  if('suspensionSelection'in path){
   const mode=path.contractFamily==='qualifiedDayProcedureV9'?'qualifiedDayProcedureV9':path.contractFamily==='qualifiedDayProcedureV8'?'qualifiedDayProcedureV8':'openingPolicy'in path?'qualifiedDayProcedureV7':'qualifiedDayProcedureV6';
   if(q.mode!==mode||!('suspensionProfiles'in e)||!('suspensionSelectionSha256'in e)||e.suspensionSelectionSha256!==socialObjectSha256(path.suspensionSelection))fail('V9 selection contract mismatch');
   same((e as AdministrativePathEligibilityV6).suspensionProfiles,administrativeProfileClosureV9(path,c),'V9 complete profile closure');
   if('openingPolicy'in path&&(!('openingPolicySha256'in e)||e.openingPolicySha256!==socialObjectSha256(path.openingPolicy)))fail('V9 opening hash mismatch');
   if(mode==='qualifiedDayProcedureV8'){
    if(!('physicalSource'in b)||b.bindingVersion!=='8.0.0'||!('calendarSelectionSha256'in e)||!('annualEndShiftPolicySha256'in e)
     ||e.calendarSelectionSha256!==socialObjectSha256(b.calendarSelection)||e.annualEndShiftPolicySha256!==socialObjectSha256(b.annualEndShiftPolicy))fail('V9 explicit end-calendar policy hash mismatch');
    const choice=path.suspensionSelection;if(choice.kind!=='fixed'||c.suspensionProfiles.find(p=>p.suspensionProfileId===choice.suspensionProfileId)?.periods.length!==0)fail('Inherited V8 unexpected recess');
   }
   if(mode==='qualifiedDayProcedureV9'){
    if(!('physicalSource'in b)||b.bindingVersion!=='9.0.0'||!('calendarSelectionSha256'in e)||!('proceduralCalendarSupplementSha256'in e)||!('durationPolicySha256'in e)
     ||e.calendarSelectionSha256!==socialObjectSha256(b.calendarSelection)||e.proceduralCalendarSupplementSha256!==socialObjectSha256(b.proceduralCalendarSupplement)
     ||e.durationPolicySha256!==socialObjectSha256(path.duration))fail('V9 explicit duration or procedural supplement hash mismatch');
   }
  }else{const p=profiles.get(path.suspensionProfileId);if(!p||p.lawId!==path.lawId||!('suspensionProfileId'in e)||!('suspensionProfileSha256'in e)||e.suspensionProfileId!==p.suspensionProfileId||e.suspensionProfileSha256!==socialObjectSha256(p))fail('Historical V9 profile mismatch');}
  const refs=unique(e.targetComponentRefs,row=>row.contentId,'V9 path target');
  if(release.status==='candidate'){if(refs.size)fail('V9 candidate path cannot claim approval');}
  else{same([...refs.keys()].sort(),administrativeBindingReferencesV9(b).map(r=>r.contentId).sort(),'V9 path target inventory');for(const ref of refs.values())same(ref,targets.get(ref.contentId),'V9 path target bytes');}
  if(!administrativeIntervalContains(path.temporalBinding.calculationCoverage,path.temporalBinding.caseCoverage.from)||!administrativeIntervalContains(path.temporalBinding.calculationCoverage,path.temporalBinding.caseCoverage.to))fail('V9 nonnested coverage');
 }
}
export function validateAdministrativeReleaseBindingsV9(c:AdministrativeProcedureCatalogV9,context:AdministrativeReleaseContext):void{
 assertAdministrativeProcedureCatalogV9(c);const actual=unique(context.componentRefs,row=>row.contentId,'V9 actual component');
 const expected=new Map(c.holidayBindings.flatMap(b=>administrativeBindingReferencesV9(b).map(r=>[r.contentId,r]as const)));
 same([...actual.keys()].sort(),[...expected.keys()].sort(),'V9 actual inventory');
 for(const[id,ref]of actual){const e=expected.get(id)!;if(ref.role!==e.role||ref.sha256!==e.sha256)fail('V9 actual component mismatch');}
 for(const b of c.holidayBindings)if(('physicalSource'in b?b.physicalSource:b.physicalBaseline).releaseId!==context.releaseId)fail('Stale V9 physical source release');
 if(context.mode==='localReference'){if(c.releaseBinding.status!=='candidate')fail('V9 local reference cannot claim approval');return;}
 if(context.mode!=='approved'||c.releaseBinding.status!=='approved'||c.releaseBinding.releaseId!==context.releaseId)fail('V9 release not approved');
 for(const ref of c.releaseBinding.targetComponentRefs)same(ref,actual.get(ref.contentId),'V9 released bytes mismatch');
}
