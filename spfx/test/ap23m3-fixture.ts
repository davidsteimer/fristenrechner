// SPDX-License-Identifier: AGPL-3.0-only
// Test-only in-memory approval shapes. Never an approved source release.
import {resolve} from 'node:path';
import {ReleaseValidator} from '../src/core/ReleaseValidator';
import type {IReleaseProvider} from '../src/core/types';
import {buildSyntheticFormat17,encode17} from '../../tests/core/ap23m3Fixtures';
export const candidateRoot=resolve(process.cwd(),'../data/candidates/2026-10-28-ap23m3');
export const approved=buildSyntheticFormat17('approved');
export const validator=new ReleaseValidator();
export function provider(value=approved,kind:'github'|'sharepointMirror'='github',missing?:string):IReleaseProvider{
 return{id:'same-friendly-provider-label',kind,cacheConfiguration:kind==='github'
  ?{kind,baseUrl:'https://raw.githubusercontent.com/example/project/'+'1'.repeat(40)+'/format17'}
  :{kind,siteAbsoluteUrl:'https://tenant.example/sites/E',mirrorPath:'/sites/E/Shared Documents/format17'},
  async fetchBytes(path){if(path===missing)throw Error('Missing synthetic artifact: '+path);
   const text=path==='manifest.json'?encode17(value.manifest):value.files.get(path);if(text===undefined)throw Error('Unexpected path: '+path);
   return new TextEncoder().encode(text);}};
}
export function referenceInput(catalog:any,row:any):any{
 const path=catalog.paths.find((p:any)=>p.researchRef===row.path&&p.contractFamily==='qualifiedDayProcedureV10');
 if(!path)throw Error('Missing native M3 path '+row.path);
 return{selection:{kind:'cantonalAdministrative',lawId:path.lawId,pathId:path.pathId,revision:path.revision,stage:path.stages[0]},
  authoritySeat:{canton:catalog.laws.find((law:any)=>law.lawId===path.lawId).canton,level:'cantonal',qualification:'competentAuthorityForCurrentAction'},
  inputDate:row.trigger,deadlineDays:row.days,qualification:{delivery:'qualifiedTriggerAccordingToOpeningPolicy',generalRoute:'qualified',specialLaw:'excluded',explicitHolidayException:'none',
   fixedEndDate:false,deviatingStart:false,evidenceAdvance:false},urgency:'none',caseQualification:structuredClone(row.facts)};
}
