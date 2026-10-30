// SPDX-License-Identifier: AGPL-3.0-only
// Complete synthetic current facts and approval shapes. Never written as a release.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { projectActivatedCalendarsV14 } from '../../src/core/holidayActivationV14';
import { rebindSocialCalendarCandidate } from '../../src/core/calendarMigration';
import { FORMAT7_LEGACY_CALENDAR_BASELINE } from '../../src/core/format7Baseline';
import { socialObjectSha256 } from '../../src/core/socialCatalog';
import type { ReleaseArtifactReference } from '../../src/core/socialTypes';
import type { AdministrativeDeadlineInput } from '../../src/core/administrativeDeadline';
import { administrativeInput13 } from './ap23i3Fixtures';

const root=fileURLToPath(new URL('../../',import.meta.url));
const base=resolve(root,'data/candidates/2026-10-27-ap23j3');
const prefix='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
const currentSuite=JSON.parse(readFileSync(resolve(root,'docs/fachrecht/ap23j1/referenzfaelle.json'),'utf8'));
const acceptedJ2Inputs=new Map<string,any>(JSON.parse(readFileSync(resolve(root,'outputs/ap23j2-candidate-2026-10-27/QA-AP23J2.json'),'utf8')).results.map((row:any)=>[row.id,row.input]));
export const AP23J3_ADMIN='administrative-procedures/ch-cantonal-administrative-procedures.json';
export const encode14=(v:unknown):string=>JSON.stringify(v,null,2)+'\n';
export const sha14=(v:string):string=>createHash('sha256').update(v).digest('hex');
export interface SyntheticFormat14{manifest:any;files:Map<string,string>}

/** Explicit synthetic test facts only. Never called by application defaults. */
export function administrativeInput14(catalog:any,id='fr-nontc-recours-30',date='2026-10-02',days?:number,stage?:string,factsOverride?:Record<string,unknown>):AdministrativeDeadlineInput{
 const p=catalog.paths.find((p:any)=>p.pathId===id),q=catalog.qualificationPolicies.find((q:any)=>q.pathId===id);
 if(q.mode!=='qualifiedDayProcedureV7')return administrativeInput13(catalog,id,date,days,stage,factsOverride);
 const law=catalog.laws.find((l:any)=>l.lawId===p.lawId);
 const suite=currentSuite;
 const research=suite.paths.find((row:any)=>row.id===p.researchRef),baseline={...suite.sharedSyntheticFacts,...research.syntheticFacts};
 const required=new Set(q.requirements.map((row:any)=>row.key));
 const facts={...Object.fromEntries(Object.entries(baseline).filter(([key])=>required.has(key))),...factsOverride};
 return{selection:{kind:'cantonalAdministrative',lawId:law.lawId,pathId:id,revision:p.revision,stage:stage??p.stages[0]},
  authoritySeat:{canton:law.canton,level:'cantonal',qualification:'competentAuthorityForCurrentAction'},inputDate:date,
  ...(days===undefined?{}:{deadlineDays:days}),qualification:{delivery:'qualifiedTriggerAccordingToOpeningPolicy',generalRoute:'qualified',specialLaw:'excluded',
  explicitHolidayException:'none',fixedEndDate:false,deviatingStart:false,evidenceAdvance:false},urgency:'none',caseQualification:facts as NonNullable<AdministrativeDeadlineInput['caseQualification']>};
}
export function administrativeReferenceInput14(catalog:any,row:any):AdministrativeDeadlineInput{
 const accepted=acceptedJ2Inputs.get(row.id);if(!accepted)throw Error('Unaccepted J2 reference '+row.id);
 const path=catalog.paths.find((p:any)=>p.pathId===accepted.path);
 const input=administrativeInput14(catalog,path?.pathId??catalog.paths.find((p:any)=>p.contractFamily==='qualifiedDayProcedureV7').pathId,accepted.trigger,accepted.days,path?.stages[0]);
 // Complete actual J2 formal facts, not permissive projection and not an expected result.
 return{...input,selection:{...input.selection,pathId:accepted.path,revision:accepted.pathRevision},
  authoritySeat:{...input.authoritySeat,canton:accepted.authoritySeatCanton},caseQualification:structuredClone(accepted.facts)};
}

export function changeSyntheticFormat14(fixture:SyntheticFormat14,path:string,edit:(v:any)=>void):void{
  const v=JSON.parse(fixture.files.get(path)!);edit(v);const text=encode14(v);fixture.files.set(path,text);
  const d=fixture.manifest.artifacts.find((d:any)=>d.path===path);d.byteLength=Buffer.byteLength(text);d.sha256=sha14(text);
}

export function buildSyntheticFormat14(mode:'approved'|'localReference'='localReference'):SyntheticFormat14{
  const manifest=JSON.parse(readFileSync(resolve(base,'manifest.json'),'utf8'));
  const files=new Map<string,string>(manifest.artifacts.map((d:any)=>[d.path,readFileSync(resolve(base,d.path),'utf8')]));
  if(mode==='localReference')return{manifest,files};
  manifest.$schema=prefix+'release-manifest-v14.schema.json';manifest.releaseId='2026-10-27-ap23j3-synthetic-approved-shape.1';
  manifest.releaseStatus='approved';manifest.sourceSummary.legalBasisReviewStatus='verified';manifest.sourceSummary.technicalValidationStatus='passed';
  manifest.extensions={'steimer.synthetic-test':{humanApproval:false,deployable:false}};
  const holiday=JSON.parse(files.get('holiday-catalogs/ch-holiday-catalog.json')!);
  holiday.activation.releaseEligibility={status:'approved',releaseId:manifest.releaseId,
    approval:{on:'2026-10-27',by:'SYNTHETIC TEST, NOT HUMAN APPROVAL',evidence:'SYNTHETIC TEST ONLY'}};
  const holidayText=encode14(holiday);files.set('holiday-catalogs/ch-holiday-catalog.json',holidayText);
  // Shared physical generator only. This grants no procedure permission.
  for(const c of projectActivatedCalendarsV14(holiday,sha14(holidayText),FORMAT7_LEGACY_CALENDAR_BASELINE))files.set(`calendars/${c.calendarId}.json`,encode14(c));
  const componentRef=(id:string):ReleaseArtifactReference=>{
    const role=id==='ch-holiday-catalog'?'holidayCatalog':'calendar',path=`${role==='calendar'?'calendars':'holiday-catalogs'}/${id}.json`;
    return{role,contentId:id,sha256:sha14(files.get(path)!)};
  };
  const approval={approvedBy:'SYNTHETIC TEST, NOT HUMAN APPROVAL',approvedOn:'2026-10-27',decisionRef:'SYNTHETIC TEST ONLY'};
  const review={id:'synthetic-test-review',sha256:sha14('synthetic review, not a source approval')};
  const suite={id:'synthetic-test-suite',sha256:sha14('synthetic suite, not a release')};
  const social:any=rebindSocialCalendarCandidate(JSON.parse(files.get('social-procedures/ch-social-procedures.json')!),manifest.releaseId,
    ['ch-federal-calendar','be-public-holidays','ch-holiday-catalog'].map(componentRef));
  for(const e of social.releaseEligibility)Object.assign(e,{status:'approved',approval,
    sourceReviewRef:{reviewId:'SYNTHETIC-TEST-REVIEW',sha256:review.sha256},referenceSuiteRef:{suiteId:'SYNTHETIC-TEST-SUITE',sha256:suite.sha256}});
  files.set('social-procedures/ch-social-procedures.json',encode14(social));
  const admin=JSON.parse(files.get(AP23J3_ADMIN)!);
  for(const b of admin.holidayBindings){b.physicalBaseline.releaseId=manifest.releaseId;
    b.physicalBaseline.references=b.physicalBaseline.references.map((r:any)=>({...r,...componentRef(r.contentId)}));}
  const ids=[...new Set<string>(admin.holidayBindings.flatMap((b:any)=>b.physicalBaseline.references.map((r:any)=>r.contentId)))];
  Object.assign(admin.releaseBinding,{status:'approved',releaseId:manifest.releaseId,approval,sourceReviewRef:review,referenceSuiteRef:suite,targetComponentRefs:ids.map(componentRef)});
  for(const e of admin.releaseBinding.pathEligibility){const b=admin.holidayBindings.find((b:any)=>b.holidayBindingId===e.holidayBindingId);
    Object.assign(e,{status:'approved',sourceReviewRef:review,referenceSuiteRef:suite,holidayBindingSha256:socialObjectSha256(b),
      targetComponentRefs:b.physicalBaseline.references.map((r:any)=>componentRef(r.contentId))});}
  files.set(AP23J3_ADMIN,encode14(admin));
  for(const d of manifest.artifacts){const raw=files.get(d.path)!;d.sha256=sha14(raw);d.byteLength=Buffer.byteLength(raw);}
  return{manifest,files};
}


