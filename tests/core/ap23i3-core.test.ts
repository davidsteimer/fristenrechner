// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculateAdministrativeDeadline} from '../../src/core/administrativeDeadline';
import {resolveAdministrativeSuspensionV6} from '../../src/core/administrativeDeadlineV6';
import {ap23i3CandidateRuntime as runtime} from '../../src/release/ap23i3CandidateData';
import {administrativeInput13} from './ap23i3Fixtures';
import {checkI3References} from '../../scripts/check-ap23i3-references';
const research=JSON.parse(readFileSync(new URL('../../docs/fachrecht/ap23i1/referenzfaelle.json',import.meta.url),'utf8'));
const catalog=runtime.administrativeContext.administrativeCatalog;
test('AP23I3 all249 full accepted I1 references run through native Format13',async()=>{
 const report=await checkI3References();assert.equal(report.referenceCases,249);
 assert.deepEqual(report.counts,{datedResearchValue:110,unresolvedBoundaryProposed:16,qualificationBoundaryProposed:117,researchWindowBoundary:6});
});
test('AP23I3 all34 paths reject copied serialized and inherited contexts',()=>{
 const contexts=[{...runtime.administrativeContext},Object.create(runtime.administrativeContext),JSON.parse(JSON.stringify(runtime.administrativeContext)),{approved:true}];
 for(const p of research.paths){const row=research.cases.find((c:any)=>c.path===p.id&&c.expected.outcome==='datedResearchValue');
  const input=administrativeInput13(catalog,p.id.toLowerCase(),row.trigger,row.days,undefined,row.facts);
  assert.equal(calculateAdministrativeDeadline(input,runtime.administrativeContext).outcome,'calculated',p.id);
  for(const context of contexts){const result=calculateAdministrativeDeadline(input,context);assert.equal(result.outcome,'blocked');assert.equal(result.calendarExportAllowed,false);}
 }
});
test('AP23I3 every currently required fact is required and never supplied by defaults',()=>{
 let checks=0;
 for(const p of research.paths){const row=research.cases.find((c:any)=>c.path===p.id&&c.expected.outcome==='datedResearchValue');
  const policy=catalog.qualificationPolicies.find(q=>q.pathId===p.id.toLowerCase())!;
  assert.equal(policy.mode,'qualifiedDayProcedureV6');if(policy.mode!=='qualifiedDayProcedureV6')throw Error('Wrong policy');
  for(const fact of policy.requirements){const input:any=administrativeInput13(catalog,p.id.toLowerCase(),row.trigger,row.days,undefined,row.facts);
   delete input.caseQualification[fact.key];const result=calculateAdministrativeDeadline(input,runtime.administrativeContext);
   assert.equal(result.outcome,'blocked',p.id+'/'+fact.key);assert.equal(result.calendarExportAllowed,false);checks++;}
 }
 assert.equal(checks,687);
});
test('AP23I3 TG given and absent remain separate real profile selections and dates',()=>{
 const a=administrativeInput13(catalog,'tg-vg-execution-5','2026-12-14',5,undefined,{exceptionNotice:'given'});
 const b=administrativeInput13(catalog,'tg-vg-execution-5','2026-12-14',5,undefined,{exceptionNotice:'absent'});
 const x=calculateAdministrativeDeadline(a,runtime.administrativeContext),y=calculateAdministrativeDeadline(b,runtime.administrativeContext);
 assert.equal(x.outcome,'calculated');assert.equal(y.outcome,'calculated');if(x.outcome!=='calculated'||y.outcome!=='calculated')throw Error('Not calculated');
 assert.equal(x.finalEnd,'2026-12-21');assert.equal(y.finalEnd,'2027-01-04');assert.equal(x.provenance.suspensionProfileId,'tg-none');assert.equal(y.provenance.suspensionProfileId,'tg-three');
 assert.notEqual(x.provenance.suspensionProfileSha256,y.provenance.suspensionProfileSha256);
 assert.deepEqual(x.provenance.permittedSuspensionProfiles,y.provenance.permittedSuspensionProfiles);
 assert.equal(x.provenance.permittedSuspensionProfiles?.length,2);assert.equal(x.calendarExportAllowed,false);assert.equal(y.calendarExportAllowed,false);
});
test('AP23I3 descriptive parameters require authentic context and explicit notice, never a fallback',()=>{
 assert.equal(resolveAdministrativeSuspensionV6(runtime.administrativeContext,'gl-admin-30')?.suspensionProfileId,'gl-three');
 assert.equal(resolveAdministrativeSuspensionV6(runtime.administrativeContext,'tg-vg-execution-5'),undefined);
 assert.equal(resolveAdministrativeSuspensionV6(runtime.administrativeContext,'tg-vg-execution-5',{exceptionNotice:'given'})?.suspensionProfileId,'tg-none');
 assert.equal(resolveAdministrativeSuspensionV6(runtime.administrativeContext,'tg-vg-execution-5',{exceptionNotice:'absent'})?.suspensionProfileId,'tg-three');
 for(const value of ['unknown','incorrect','incomplete',null,true,['given']])assert.equal(resolveAdministrativeSuspensionV6(runtime.administrativeContext,'tg-vg-execution-5',{exceptionNotice:value}),undefined);
 assert.equal(resolveAdministrativeSuspensionV6({...runtime.administrativeContext},'gl-admin-30'),undefined);
 let invoked=false;const facts={};Object.defineProperty(facts,'exceptionNotice',{enumerable:true,get(){invoked=true;return'given';}});
 assert.equal(resolveAdministrativeSuspensionV6(runtime.administrativeContext,'tg-vg-execution-5',facts),undefined);assert.equal(invoked,false);
});
test('AP23I3 wrong contexts and foreign known facts are not positive current case facts',()=>{
 for(const id of ['tg-vg-30','gl-admin-30']){
  const input:any=administrativeInput13(catalog,id,'2026-10-02',30);
  input.caseQualification[id.startsWith('tg')?'shorteningEstablished':'exceptionNotice']='unknown';
  assert.equal(calculateAdministrativeDeadline(input,runtime.administrativeContext).outcome,'blocked');
 }
 const good:any=administrativeInput13(catalog,'tg-vg-30','2026-10-02',30);
 for(const edit of[(v:any)=>v.authoritySeat.canton='GL',(v:any)=>v.selection.revision=2,(v:any)=>v.selection.stage='administration']){
  const input=JSON.parse(JSON.stringify(good));edit(input);assert.equal(calculateAdministrativeDeadline(input,runtime.administrativeContext).outcome,'blocked');
 }
});
test('AP23I3 input getters inherited facts and nonprimitive confirmations are rejected without coercion',()=>{
 const input:any=administrativeInput13(catalog,'tg-vg-execution-5','2026-10-02',5);
 for(const value of [true,['given'],new String('given'),{toString(){throw Error('No coercion');}}]){
  const changed={...input,caseQualification:{...input.caseQualification,exceptionNotice:value}};
  assert.equal(calculateAdministrativeDeadline(changed,runtime.administrativeContext).outcome,'blocked');
 }
 let invoked=false;const facts={...input.caseQualification};Object.defineProperty(facts,'exceptionNotice',{enumerable:true,get(){invoked=true;return'given';}});
 assert.equal(calculateAdministrativeDeadline({...input,caseQualification:facts},runtime.administrativeContext).outcome,'blocked');assert.equal(invoked,false);
 assert.equal(calculateAdministrativeDeadline({...input,caseQualification:Object.create(input.caseQualification)},runtime.administrativeContext).outcome,'blocked');
});
