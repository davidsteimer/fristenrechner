// SPDX-License-Identifier: AGPL-3.0-only
// Complete synthetic current facts and approval shapes. Never written as a release.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { projectActivatedCalendarsV10 } from '../../src/core/holidayActivationV10';
import { rebindSocialCalendarCandidate } from '../../src/core/calendarMigration';
import { FORMAT7_LEGACY_CALENDAR_BASELINE } from '../../src/core/format7Baseline';
import { socialObjectSha256 } from '../../src/core/socialCatalog';
import type { ReleaseArtifactReference } from '../../src/core/socialTypes';
import type { AdministrativeDeadlineInput } from '../../src/core/administrativeDeadline';
import { administrativeInput10 } from './ap23f3Fixtures';

const root=fileURLToPath(new URL('../../',import.meta.url));
const base=resolve(root,'data/candidates/2026-10-22-ap23g3');
const prefix='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
export const AP23G3_ADMIN='administrative-procedures/ch-cantonal-administrative-procedures.json';
export const encode11=(v:unknown):string=>JSON.stringify(v,null,2)+'\n';
export const sha11=(v:string):string=>createHash('sha256').update(v).digest('hex');
export interface SyntheticFormat11{manifest:any;files:Map<string,string>}

export function changeSyntheticFormat11(fixture:SyntheticFormat11,path:string,edit:(v:any)=>void):void{
  const v=JSON.parse(fixture.files.get(path)!);edit(v);const text=encode11(v);fixture.files.set(path,text);
  const d=fixture.manifest.artifacts.find((d:any)=>d.path===path);d.byteLength=Buffer.byteLength(text);d.sha256=sha11(text);
}

export function buildSyntheticFormat11(mode:'approved'|'localReference'='localReference'):SyntheticFormat11{
  const manifest=JSON.parse(readFileSync(resolve(base,'manifest.json'),'utf8'));
  const files=new Map<string,string>(manifest.artifacts.map((d:any)=>[d.path,readFileSync(resolve(base,d.path),'utf8')]));
  if(mode==='localReference')return{manifest,files};
  manifest.$schema=prefix+'release-manifest-v11.schema.json';manifest.releaseId='2026-10-22-ap23g3-synthetic-approved-shape.1';
  manifest.releaseStatus='approved';manifest.sourceSummary.legalBasisReviewStatus='verified';manifest.sourceSummary.technicalValidationStatus='passed';
  manifest.extensions={'steimer.synthetic-test':{humanApproval:false,deployable:false}};
  const holiday=JSON.parse(files.get('holiday-catalogs/ch-holiday-catalog.json')!);
  holiday.activation.releaseEligibility={status:'approved',releaseId:manifest.releaseId,
    approval:{on:'2026-10-22',by:'SYNTHETIC TEST, NOT HUMAN APPROVAL',evidence:'SYNTHETIC TEST ONLY'}};
  const holidayText=encode11(holiday);files.set('holiday-catalogs/ch-holiday-catalog.json',holidayText);
  // Shared physical generator only. This grants no procedure permission.
  for(const c of projectActivatedCalendarsV10(holiday,sha11(holidayText),FORMAT7_LEGACY_CALENDAR_BASELINE))files.set(`calendars/${c.calendarId}.json`,encode11(c));
  const componentRef=(id:string):ReleaseArtifactReference=>{
    const role=id==='ch-holiday-catalog'?'holidayCatalog':'calendar',path=`${role==='calendar'?'calendars':'holiday-catalogs'}/${id}.json`;
    return{role,contentId:id,sha256:sha11(files.get(path)!)};
  };
  const approval={approvedBy:'SYNTHETIC TEST, NOT HUMAN APPROVAL',approvedOn:'2026-10-22',decisionRef:'SYNTHETIC TEST ONLY'};
  const review={id:'synthetic-test-review',sha256:sha11('synthetic review, not a source approval')};
  const suite={id:'synthetic-test-suite',sha256:sha11('synthetic suite, not a release')};
  const social:any=rebindSocialCalendarCandidate(JSON.parse(files.get('social-procedures/ch-social-procedures.json')!),manifest.releaseId,
    ['ch-federal-calendar','be-public-holidays','ch-holiday-catalog'].map(componentRef));
  for(const e of social.releaseEligibility)Object.assign(e,{status:'approved',approval,
    sourceReviewRef:{reviewId:'SYNTHETIC-TEST-REVIEW',sha256:review.sha256},referenceSuiteRef:{suiteId:'SYNTHETIC-TEST-SUITE',sha256:suite.sha256}});
  files.set('social-procedures/ch-social-procedures.json',encode11(social));
  const admin=JSON.parse(files.get(AP23G3_ADMIN)!);
  for(const b of admin.holidayBindings){b.physicalBaseline.releaseId=manifest.releaseId;
    b.physicalBaseline.references=b.physicalBaseline.references.map((r:any)=>({...r,...componentRef(r.contentId)}));}
  const ids=[...new Set<string>(admin.holidayBindings.flatMap((b:any)=>b.physicalBaseline.references.map((r:any)=>r.contentId)))];
  Object.assign(admin.releaseBinding,{status:'approved',releaseId:manifest.releaseId,approval,sourceReviewRef:review,referenceSuiteRef:suite,targetComponentRefs:ids.map(componentRef)});
  for(const e of admin.releaseBinding.pathEligibility){const b=admin.holidayBindings.find((b:any)=>b.holidayBindingId===e.holidayBindingId);
    Object.assign(e,{status:'approved',sourceReviewRef:review,referenceSuiteRef:suite,holidayBindingSha256:socialObjectSha256(b),
      targetComponentRefs:b.physicalBaseline.references.map((r:any)=>componentRef(r.contentId))});}
  files.set(AP23G3_ADMIN,encode11(admin));
  for(const d of manifest.artifacts){const raw=files.get(d.path)!;d.sha256=sha11(raw);d.byteLength=Buffer.byteLength(raw);}
  return{manifest,files};
}

/** Positives are explicit current test facts, never read from application defaults. */
export function administrativeInput11(catalog:any,id='ur-admin-20',date='2026-10-02',days?:number,stage?:string):AdministrativeDeadlineInput{
  const path=catalog.paths.find((p:any)=>p.pathId===id),policy=catalog.qualificationPolicies.find((p:any)=>p.pathId===id);
  if(policy.mode!=='qualifiedDayProcedureV4')return administrativeInput10(catalog,id,date,days,stage);
  const law=catalog.laws.find((l:any)=>l.lawId===path.lawId),r=policy.requirements;
  const facts:any={action:r.action,opening:r.opening,holidayAnchor:r.holidayAnchor,materialPerformance:false,unit:'day',direction:'forward',
    notice:'uncontested',termChange:'none',suspensionContext:'ordinaryNoException',serviceContext:'effectiveLegalTriggerKnown'};
  if(r.requiredTargetCourt!=='notApplicable')facts.targetCourt=r.requiredTargetCourt;
  if(r.requiredSameIssuingCourt)facts.sameIssuingCourt=true;
  if(r.openingChainPolicy==='requireOriginalOrTimelyRequestedReasons')facts.openingOrigin='originalReasoned';
  if(r.coordinationPolicy==='excludeCoordinatedAppeal')facts.coordinatedDecision=false;
  if(r.localHolidayPolicy==='blockConcreteUnresolvedAdditionalEndEffect')facts.localHolidayEffect='noAdditionalRelevantLocalHoliday';
  if(r.specialOpeningPolicy==='ordinaryEffectiveUROpening')facts.urOpeningConsequence='ordinaryEffectiveOpening';
  if(r.shorteningPolicy==='noShortenedSHRekurs')facts.shortenedRekurs=false;
  return{selection:{kind:'cantonalAdministrative',lawId:law.lawId,pathId:id,revision:path.revision,stage:stage??path.stages[0]},
    authoritySeat:{canton:law.canton,level:'cantonal',qualification:'competentAuthorityForCurrentAction'},inputDate:date,
    ...(days===undefined?{}:{deadlineDays:days}),qualification:{delivery:'qualifiedActualDelivery',generalRoute:'qualified',specialLaw:'excluded',
      explicitHolidayException:'none',fixedEndDate:false,deviatingStart:false,evidenceAdvance:false},urgency:'none',caseQualification:facts};
}

/** Reseal identities so a negative challenges semantics rather than stale bytes. */
export function resealAdministrative11(c:any):void{
  for(const p of c.paths){const q=c.qualificationPolicies.find((q:any)=>q.pathId===p.pathId),e=c.releaseBinding.pathEligibility.find((e:any)=>e.pathId===p.pathId),
    b=c.holidayBindings.find((b:any)=>b.holidayBindingId===p.holidayBindingId),s=c.suspensionProfiles.find((s:any)=>s.suspensionProfileId===p.suspensionProfileId);
    if(q)q.pathSha256=socialObjectSha256(p);
    if(e&&q&&b&&s)Object.assign(e,{pathSha256:socialObjectSha256(p),qualificationPolicySha256:socialObjectSha256(q),holidayBindingId:b.holidayBindingId,
      holidayBindingSha256:socialObjectSha256(b),suspensionProfileId:s.suspensionProfileId,suspensionProfileSha256:socialObjectSha256(s),
      caseCoverage:structuredClone(p.temporalBinding.caseCoverage),calculationCoverage:structuredClone(p.temporalBinding.calculationCoverage)});
  }
}
