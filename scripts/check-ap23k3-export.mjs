// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic approved shapes exist only in memory. No ICS or Outlook operation.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createFormat15CalculationData} from '../src/core/format15CalculationData.ts';
import {calculateAdministrativeDeadline} from '../src/core/administrativeDeadline.ts';
import {calculateAdministrativeUiDeadline,administrativeExportAvailable,createAdministrativeCalendarEntry} from '../src/ui/administrativeExport.ts';
import {buildSyntheticFormat15,encode15,administrativeInput15,administrativeReferenceInput15,acceptedK2} from '../tests/core/ap23k3Fixtures.ts';
const out='outputs/ap23k3-2026-10-27';
const hash=b=>createHash('sha256').update(b).digest('hex');
const bind=async path=>{const b=await readFile(path);return{path,byteLength:b.length,sha256:hash(b)};};
const approved=buildSyntheticFormat15('approved'),local=buildSyntheticFormat15('localReference');
const runtime=createFormat15CalculationData(encode15(approved.manifest),approved.files),reference=createFormat15CalculationData(encode15(local.manifest),local.files,{mode:'localReference'});
const context=runtime.administrativeContext,catalog=context.administrativeCatalog,paths=catalog.paths.filter(p=>p.contractFamily==='qualifiedDayProcedureV8');assert.equal(paths.length,16);
const inputs=[];
for(const path of paths){const q=catalog.qualificationPolicies.find(q=>q.pathId===path.pathId),alternatives=q.requirements.filter(r=>r.oneOf);let choices=[{}];for(const r of alternatives)choices=choices.flatMap(f=>r.oneOf.map(value=>({...f,[r.key]:value})));
 for(const facts of choices)inputs.push({id:'path-'+path.pathId+'-'+inputs.length,pathId:path.pathId,kind:'newPathAndClosedCategory',input:administrativeInput15(catalog,path.pathId,'2026-10-02',path.duration.kind==='statutoryDays'?path.duration.value:10,undefined,facts)});
}
const dynamic=catalog.holidayBindings.find(b=>b.holidayBindingId==='bs-party-representative').calendarSelection;assert.equal(dynamic.terminals.length,26);
for(const terminal of dynamic.terminals){const base=administrativeInput15(catalog,'bs-court-register-10','2026-10-02',10,undefined,{legalAnchorCanton:terminal.canton});
 for(const variant of terminal.variants){const input={...base,...variant.areaFacts.length?{areaFacts:Object.fromEntries(variant.areaFacts.map(f=>[f.scopeId,f.member]))}:{}};inputs.push({id:'qualified-anchor-'+terminal.canton+'-'+variant.projectionId,pathId:'bs-court-register-10',kind:'nationalAnchorVariant',input});}
}
assert.equal(inputs.filter(r=>r.kind==='newPathAndClosedCategory').length,22);assert.equal(inputs.filter(r=>r.kind==='nationalAnchorVariant').length,28);
const cases=[];let strings=0,changedFactsDenied=0,changedAreaFactsDenied=0,changedAnchorDenied=0,changedAnchorQualificationDenied=0,unexpectedRoleDenied=0,directCoreResultsDenied=0;
for(const row of inputs){const{input,pathId}=row,result=calculateAdministrativeUiDeadline(input,context);assert.equal(result.outcome,'calculated',row.id);assert.equal(administrativeExportAvailable(input,context,result),true,row.id);
 assert.equal(result.referenceOnly,false);assert.ok(result.provenance.calendarResolution);assert.ok(result.provenance.annualEndShiftResolution);
 assert.match(result.provenance.calendarResolution.calendarSelectionSha256,/^[a-f0-9]{64}$/);assert.match(result.provenance.annualEndShiftResolution.annualEndShiftPolicySha256,/^[a-f0-9]{64}$/);
 for(const locale of['de','fr']){const artifact=createAdministrativeCalendarEntry({input,context,result,locale,reference:'SYNTHETIC-K3-EXPORT-NO-FILE',uid:row.id+'-'+locale+'@synthetic.invalid',createdAt:new Date('2026-10-27T12:00:00Z')});
  const text=artifact.content.replace(/\r\n[ \t]/g,'');assert.match(text,/BEGIN:VCALENDAR\r\n/);assert.match(text,new RegExp('DTSTART;VALUE=DATE:'+result.finalEnd.replaceAll('-','')));assert.match(text,/TRANSP:TRANSPARENT/);assert.match(text,/TRIGGER:-PT112H/);assert.match(text,/CATEGORIES:Fristablauf/);
  assert.match(text,new RegExp('pathId: '+pathId));assert.match(text,/calendarResolution:/);assert.match(text,/annualEndShiftResolution:/);strings++;
 }
 for(const clone of[{...result},JSON.parse(JSON.stringify(result)),Object.create(result)])assert.equal(administrativeExportAvailable(input,context,clone),false);
 assert.equal(administrativeExportAvailable(input,{...context},result),false);assert.equal(administrativeExportAvailable({...input,inputDate:'2026-10-03'},context,result),false);
 assert.equal(administrativeExportAvailable({...input,role:'partyWithoutRepresentative'},context,result),false);unexpectedRoleDenied++;
 assert.equal(administrativeExportAvailable({...input,caseQualification:{...input.caseQualification,applicability:'unknown'}},context,result),false);changedFactsDenied++;
 if(input.caseQualification.legalAnchorCanton){const changed={...input,caseQualification:{...input.caseQualification,legalAnchorCanton:input.caseQualification.legalAnchorCanton==='BS'?'TI':'BS'}};assert.equal(administrativeExportAvailable(changed,context,result),false);changedAnchorDenied++;
  assert.equal(administrativeExportAvailable({...input,caseQualification:{...input.caseQualification,legalAnchorQualification:'unqualifiedRepresentation'}},context,result),false);changedAnchorQualificationDenied++;}
 for(const[key,value]of Object.entries(input.areaFacts??{})){assert.equal(administrativeExportAvailable({...input,areaFacts:{...input.areaFacts,[key]:!value}},context,result),false);changedAreaFactsDenied++;}
 const q=catalog.qualificationPolicies.find(q=>q.pathId===pathId);for(const req of q.requirements.filter(r=>r.oneOf)){const other=req.oneOf.find(v=>v!==input.caseQualification[req.key]);assert.equal(administrativeExportAvailable({...input,caseQualification:{...input.caseQualification,[req.key]:other}},context,result),false);changedFactsDenied++;}
 const coreOnly=calculateAdministrativeDeadline(input,context);assert.equal(coreOnly.outcome,'calculated');assert.equal(administrativeExportAvailable(input,context,coreOnly),false);directCoreResultsDenied++;
 const localResult=calculateAdministrativeUiDeadline(input,reference.administrativeContext);assert.equal(localResult.outcome,'calculated',row.id);assert.equal(administrativeExportAvailable(input,reference.administrativeContext,localResult),false);assert.throws(()=>createAdministrativeCalendarEntry({input,context:reference.administrativeContext,result:localResult,locale:'de'}));
 cases.push({id:row.id,pathId,kind:row.kind,input,finalEnd:result.finalEnd,openingResolution:result.provenance.openingResolution,calendarResolution:result.provenance.calendarResolution,annualEndShiftResolution:result.provenance.annualEndShiftResolution});
}
const blockedCases=[];for(const row of acceptedK2.results.filter(r=>r.expected.outcome!=='datedResearchValue')){const input=administrativeReferenceInput15(catalog,row.input),result=calculateAdministrativeUiDeadline(input,context);assert.equal(result.outcome,'blocked',row.id);assert.equal('finalEnd'in result,false);assert.equal(administrativeExportAvailable(input,context,result),false);assert.throws(()=>createAdministrativeCalendarEntry({input,context,result,locale:'de'}));blockedCases.push({id:row.id,reasonKeys:result.blockReasonKeys});}
assert.equal(blockedCases.length,25);assert.equal(strings,100);assert.equal(cases.length,50);
const bindings=await Promise.all(['scripts/check-ap23k3-export.mjs','src/ui/administrativeExport.ts','src/ui/calendarExport.ts','src/core/administrativeDeadline.ts','src/core/administrativeDeadlineV8.ts','src/core/releaseFormat15.ts','src/core/format15CalculationData.ts','tests/core/ap23k3Fixtures.ts'].map(bind));
const report={workPackage:'AP23K3',status:'passed',kind:'supplemental-in-memory-export-verification',qualifiedPaths:16,closedBlCategories:7,qualifiedCantons:26,nationalAnchorVariants:28,qualifiedCases:50,languages:['de','fr'],syntheticInMemoryArtifacts:strings,
 referenceExportsDenied:50,changedInputsDenied:50,resultClonesDenied:150,contextClonesDenied:50,changedFactsDenied,changedAreaFactsDenied,changedAnchorDenied,changedAnchorQualificationDenied,unexpectedRoleDenied,directCoreResultsDenied,blockedCasesDenied:blockedCases.length,
 actualIcsFilesSaved:0,outlookImports:0,humanReleaseApproval:false,sourceReleaseApproved:false,operatingChanges:false,cases,blockedCases,bindings};
await writeFile(out+'/export-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,cases:cases.length,blockedCases:blockedCases.length,bindings:bindings.length}));
