// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic qualified facts and approval shapes. Never a human release approval.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {projectActivatedCalendarsV16} from '../../src/core/holidayActivationV16';
import {FORMAT7_LEGACY_CALENDAR_BASELINE} from '../../src/core/format7Baseline';
import {rebindSocialCalendarCandidate} from '../../src/core/calendarMigration';
import {socialObjectSha256} from '../../src/core/socialCatalog';
import {administrativeInput15} from './ap23k3Fixtures';
import type {AdministrativeDeadlineInput} from '../../src/core/administrativeDeadline';
import type {ReleaseArtifactReference} from '../../src/core/socialTypes';
export const AP23L3_ADMIN='administrative-procedures/ch-cantonal-administrative-procedures.json';
export const AP23L3_BASE='data/candidates/2026-10-27-ap23l3/';
export const encode16=(v:unknown):string=>JSON.stringify(v,null,2)+'\n';
export const sha16=(v:string):string=>createHash('sha256').update(v).digest('hex');
const read=(path:string):string=>readFileSync(new URL('../../'+path,import.meta.url),'utf8');
export const acceptedL2=JSON.parse(read('outputs/ap23l2-candidate-2026-10-27/QA-AP23L2.json'));
export interface SyntheticFormat16 {manifest:any;files:Map<string,string>}
/** Explicit test inputs only. No application default derives facts here. */
export function administrativeInput16(catalog:any,id='ai-admin-ordered',date='2026-10-02',days?:number,stage?:string,factsOverride?:Record<string,unknown>):AdministrativeDeadlineInput{
 const p=catalog.paths.find((r:any)=>r.pathId===id),q=catalog.qualificationPolicies.find((r:any)=>r.pathId===id);
 if(q.mode!=='qualifiedDayProcedureV9')return administrativeInput15(catalog,id,date,days,stage,factsOverride);
 const reference=acceptedL2.results.find((r:any)=>r.input.path===id&&r.actual.outcome==='datedResearchValue');
 if(!reference)throw Error('No accepted L2 positive case '+id);
 return{selection:{kind:'cantonalAdministrative',lawId:p.lawId,pathId:id,revision:p.revision,stage:stage??p.stages[0]},authoritySeat:{canton:catalog.laws.find((l:any)=>l.lawId===p.lawId).canton,level:'cantonal',qualification:'competentAuthorityForCurrentAction'},inputDate:date,
  ...(days===undefined?{}:{deadlineDays:days}),qualification:{delivery:'qualifiedTriggerAccordingToOpeningPolicy',generalRoute:'qualified',specialLaw:'excluded',explicitHolidayException:'none',fixedEndDate:false,deviatingStart:false,evidenceAdvance:false},urgency:'none',
  caseQualification:{...structuredClone(reference.input.facts),...factsOverride}};
}
export function administrativeReferenceInput16(catalog:any,accepted:any):AdministrativeDeadlineInput{
 const p=catalog.paths.find((p:any)=>p.pathId===accepted.path),fallback=catalog.paths.find((p:any)=>p.contractFamily==='qualifiedDayProcedureV9');
 const base=administrativeInput16(catalog,p?.pathId??fallback.pathId,accepted.trigger,accepted.days,p?.stages[0]);
 const unknown=Object.fromEntries(Object.entries(accepted).filter(([key])=>!['path','pathRevision','authoritySeatCanton','trigger','days','facts','areaFacts'].includes(key)));
 return{...base,selection:{...base.selection,pathId:accepted.path,revision:accepted.pathRevision},authoritySeat:{...base.authoritySeat,canton:accepted.authoritySeatCanton},caseQualification:structuredClone(accepted.facts),...(Object.hasOwn(accepted,'areaFacts')?{areaFacts:structuredClone(accepted.areaFacts)}:{}),...unknown};
}
export function resealSyntheticFormat16(f:SyntheticFormat16):void{
 const c=JSON.parse(f.files.get(AP23L3_ADMIN)!);
 for(const p of c.paths){const q=c.qualificationPolicies.find((q:any)=>q.pathId===p.pathId),e=c.releaseBinding.pathEligibility.find((e:any)=>e.pathId===p.pathId),b=c.holidayBindings.find((b:any)=>b.holidayBindingId===p.holidayBindingId);
  q.pathSha256=socialObjectSha256(p);Object.assign(e,{pathSha256:socialObjectSha256(p),qualificationPolicySha256:socialObjectSha256(q),holidayBindingSha256:socialObjectSha256(b)});
  if(p.suspensionSelection){e.suspensionSelectionSha256=socialObjectSha256(p.suspensionSelection);const ids=p.suspensionSelection.kind==='fixed'?[p.suspensionSelection.suspensionProfileId]:p.suspensionSelection.cases.map((r:any)=>r.suspensionProfileId);
   e.suspensionProfiles=[...new Set<string>(ids)].sort().map(id=>({suspensionProfileId:id,sha256:socialObjectSha256(c.suspensionProfiles.find((s:any)=>s.suspensionProfileId===id))}));}
  else e.suspensionProfileSha256=socialObjectSha256(c.suspensionProfiles.find((s:any)=>s.suspensionProfileId===p.suspensionProfileId));
  if(p.openingPolicy)e.openingPolicySha256=socialObjectSha256(p.openingPolicy);if(p.contractFamily==='qualifiedDayProcedureV9'){e.calendarSelectionSha256=socialObjectSha256(b.calendarSelection);e.proceduralCalendarSupplementSha256=socialObjectSha256(b.proceduralCalendarSupplement);e.durationPolicySha256=socialObjectSha256(p.duration);}
  else if(p.contractFamily==='qualifiedDayProcedureV8'){e.calendarSelectionSha256=socialObjectSha256(b.calendarSelection);e.annualEndShiftPolicySha256=socialObjectSha256(b.annualEndShiftPolicy);}
 }
 f.files.set(AP23L3_ADMIN,encode16(c));for(const d of f.manifest.artifacts){d.byteLength=Buffer.byteLength(f.files.get(d.path)!);d.sha256=sha16(f.files.get(d.path)!);}
}
export function changeSyntheticFormat16(f:SyntheticFormat16,path:string,edit:(v:any)=>void):void{
 const v=JSON.parse(f.files.get(path)!);edit(v);const text=encode16(v);f.files.set(path,text);const d=f.manifest.artifacts.find((d:any)=>d.path===path);d.byteLength=Buffer.byteLength(text);d.sha256=sha16(text);
}
export function buildSyntheticFormat16(mode:'approved'|'localReference'='localReference'):SyntheticFormat16{
 const manifest=JSON.parse(read(AP23L3_BASE+'manifest.json')),files=new Map<string,string>(manifest.artifacts.map((d:any)=>[d.path,read(AP23L3_BASE+d.path)]));if(mode==='localReference')return{manifest,files};
 const prefix='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
 manifest.$schema=prefix+'release-manifest-v16.schema.json';manifest.releaseId='2026-10-27-ap23l3-synthetic-approved-shape.1';manifest.releaseStatus='approved';
 manifest.sourceSummary.legalBasisReviewStatus='verified';manifest.sourceSummary.technicalValidationStatus='passed';manifest.extensions={'steimer.synthetic-test':{humanApproval:false,deployable:false}};
 const holiday=JSON.parse(files.get('holiday-catalogs/ch-holiday-catalog.json')!);holiday.activation.releaseEligibility={status:'approved',releaseId:manifest.releaseId,approval:{on:'2026-10-27',by:'SYNTHETIC TEST, NOT HUMAN APPROVAL',evidence:'SYNTHETIC TEST ONLY'}};
 const htext=encode16(holiday);files.set('holiday-catalogs/ch-holiday-catalog.json',htext);
 for(const c of projectActivatedCalendarsV16(holiday,sha16(htext),FORMAT7_LEGACY_CALENDAR_BASELINE))files.set('calendars/'+c.calendarId+'.json',encode16(c));
 const component=(id:string):ReleaseArtifactReference=>{const role=id==='ch-holiday-catalog'?'holidayCatalog':'calendar',path=(role==='calendar'?'calendars/':'holiday-catalogs/')+id+'.json';return{role,contentId:id,sha256:sha16(files.get(path)!)};};
 const approval={approvedBy:'SYNTHETIC TEST, NOT HUMAN APPROVAL',approvedOn:'2026-10-27',decisionRef:'SYNTHETIC TEST ONLY'},review={id:'synthetic-l3-review',sha256:sha16('synthetic source review, not a human approval')},suite={id:'synthetic-l3-suite',sha256:sha16('synthetic suite, not a release')};
 const social:any=rebindSocialCalendarCandidate(JSON.parse(files.get('social-procedures/ch-social-procedures.json')!),manifest.releaseId,['ch-federal-calendar','be-public-holidays','ch-holiday-catalog'].map(component));
 for(const e of social.releaseEligibility)Object.assign(e,{status:'approved',approval,sourceReviewRef:{reviewId:'SYNTHETIC-L3-REVIEW',sha256:review.sha256},referenceSuiteRef:{suiteId:'SYNTHETIC-L3-SUITE',sha256:suite.sha256}});
 files.set('social-procedures/ch-social-procedures.json',encode16(social));
 const admin=JSON.parse(files.get(AP23L3_ADMIN)!);for(const b of admin.holidayBindings){const physical=b.physicalSource??b.physicalBaseline;physical.releaseId=manifest.releaseId;physical.references=physical.references.map((r:any)=>({...r,...component(r.contentId)}));}
 const ids=[...new Set<string>(admin.holidayBindings.flatMap((b:any)=>(b.physicalSource??b.physicalBaseline).references.map((r:any)=>r.contentId)))];
 Object.assign(admin.releaseBinding,{status:'approved',releaseId:manifest.releaseId,approval,sourceReviewRef:review,referenceSuiteRef:suite,targetComponentRefs:ids.map(component)});
 for(const e of admin.releaseBinding.pathEligibility){const b=admin.holidayBindings.find((b:any)=>b.holidayBindingId===e.holidayBindingId);Object.assign(e,{status:'approved',sourceReviewRef:review,referenceSuiteRef:suite,targetComponentRefs:(b.physicalSource??b.physicalBaseline).references.map((r:any)=>component(r.contentId))});}
 files.set(AP23L3_ADMIN,encode16(admin));const result={manifest,files};resealSyntheticFormat16(result);return result;
}
