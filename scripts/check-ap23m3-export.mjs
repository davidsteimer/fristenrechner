// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic approved inputs exist only in memory. No ICS file or Outlook operation.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createFormat17CalculationData} from '../src/core/format17CalculationData.ts';
import {calculateAdministrativeDeadline} from '../src/core/administrativeDeadline.ts';
import {calculateAdministrativeUiDeadline,administrativeExportAvailable,createAdministrativeCalendarEntry} from '../src/ui/administrativeExport.ts';
import {buildSyntheticFormat17,encode17,administrativeReferenceInput17,acceptedM2} from '../tests/core/ap23m3Fixtures.ts';
const out='outputs/ap23m3-2026-10-28',hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const bind=async path=>{const bytes=await readFile(path);return{path,byteLength:bytes.length,sha256:hash(bytes)};};
const approved=buildSyntheticFormat17('approved'),local=buildSyntheticFormat17('localReference');
const runtime=createFormat17CalculationData(encode17(approved.manifest),approved.files),reference=createFormat17CalculationData(encode17(local.manifest),local.files,{mode:'localReference'});
const context=runtime.administrativeContext,catalog=context.administrativeCatalog,cases=[],blockedCases=[];
let strings=0,changedFactsDenied=0,changedDurationsDenied=0,resultClonesDenied=0,contextClonesDenied=0,changedDatesDenied=0,directCoreResultsDenied=0;
for(const row of acceptedM2.results){
 const input=administrativeReferenceInput17(catalog,row.input),result=calculateAdministrativeUiDeadline(input,context);
 if(row.expected.outcome!=='datedResearchValue'){
  assert.equal(result.outcome,'blocked',row.id);assert.equal('finalEnd'in result,false);assert.equal(administrativeExportAvailable(input,context,result),false);
  assert.throws(()=>createAdministrativeCalendarEntry({input,context,result,locale:'de'}));blockedCases.push({id:row.id,reasonKeys:result.blockReasonKeys});continue;
 }
 assert.equal(result.outcome,'calculated',row.id);assert.equal(result.finalEnd,row.expected.end,row.id);assert.equal(result.referenceOnly,false);
 assert.equal(administrativeExportAvailable(input,context,result),true,row.id);
 assert.match(result.provenance.durationPolicySha256,/^[a-f0-9]{64}$/u);assert.ok(result.provenance.openingResolution);assert.ok(result.provenance.proceduralCalendarSupplementResolution);
 for(const locale of['de','fr']){
  const artifact=createAdministrativeCalendarEntry({input,context,result,locale,reference:'SYNTHETIC-M3-EXPORT-NO-FILE',
   uid:row.id+'-'+locale+'@synthetic.invalid',createdAt:new Date('2026-10-28T12:00:00Z')});
  const text=artifact.content.replace(/\r\n[ \t]/gu,'');assert.match(text,/BEGIN:VCALENDAR\r\n/u);
  assert.match(text,new RegExp('DTSTART;VALUE=DATE:'+result.finalEnd.replaceAll('-','')));assert.match(text,/TRANSP:TRANSPARENT/u);
  assert.match(text,/TRIGGER:-PT112H/u);assert.match(text,/CATEGORIES:Fristablauf/u);assert.match(text,/openingResolution:/u);
  assert.match(text,/durationPolicySha256:/u);assert.match(text,/proceduralCalendarSupplementResolution:/u);
  if(result.provenance.durationResolution)assert.match(text,/actualInstructionDays/u);strings++;
 }
 for(const clone of[{...result},JSON.parse(JSON.stringify(result)),Object.create(result)]){assert.equal(administrativeExportAvailable(input,context,clone),false);resultClonesDenied++;}
 assert.equal(administrativeExportAvailable(input,{...context},result),false);contextClonesDenied++;
 const differentDate=input.inputDate==='2026-10-03'?'2026-10-04':'2026-10-03';
 assert.notEqual(differentDate,input.inputDate);
 assert.equal(administrativeExportAvailable({...input,inputDate:differentDate},context,result),false);changedDatesDenied++;
 assert.equal(administrativeExportAvailable({...input,deadlineDays:input.deadlineDays+1},context,result),false);changedDurationsDenied++;
 for(const key of Object.keys(input.caseQualification??{})){
  const changed={...input,caseQualification:{...input.caseQualification,[key]:'notCurrentlyQualified'}};
  assert.equal(administrativeExportAvailable(changed,context,result),false);changedFactsDenied++;
 }
 const core=calculateAdministrativeDeadline(input,context);assert.equal(core.outcome,'calculated');assert.equal(administrativeExportAvailable(input,context,core),false);directCoreResultsDenied++;
 const localResult=calculateAdministrativeUiDeadline(input,reference.administrativeContext);assert.equal(localResult.outcome,'calculated');
 assert.equal(administrativeExportAvailable(input,reference.administrativeContext,localResult),false);
 assert.throws(()=>createAdministrativeCalendarEntry({input,context:reference.administrativeContext,result:localResult,locale:'de'}));
 cases.push({id:row.id,pathId:input.selection.pathId,input,finalEnd:result.finalEnd,openingResolution:result.provenance.openingResolution,
  durationPolicySha256:result.provenance.durationPolicySha256,durationResolution:result.provenance.durationResolution,
  proceduralCalendarSupplementResolution:result.provenance.proceduralCalendarSupplementResolution});
}
assert.equal(cases.length,73);assert.equal(new Set(cases.map(row=>row.pathId)).size,49);assert.equal(blockedCases.length,36);assert.equal(strings,146);
const bindings=await Promise.all(['scripts/check-ap23m3-export.mjs','src/ui/administrativeExport.ts','src/ui/calendarExport.ts',
 'src/core/administrativeDeadline.ts','src/core/administrativeDeadlineV10.ts','src/core/releaseFormat17.ts','src/core/format17CalculationData.ts',
 'tests/core/ap23m3Fixtures.ts'].map(bind));
const report={workPackage:'AP23M3',status:'passed',kind:'supplemental-in-memory-export-verification',qualifiedPaths:49,qualifiedCases:73,
 languages:['de','fr'],syntheticInMemoryArtifacts:strings,referenceExportsDenied:73,blockedCasesDenied:36,changedFactsDenied,changedDurationsDenied,
 resultClonesDenied,contextClonesDenied,changedDatesDenied,directCoreResultsDenied,actualIcsFilesSaved:0,outlookImports:0,
 humanReleaseApproval:false,sourceReleaseApproved:false,operatingChanges:false,cases,blockedCases,bindings};
await writeFile(out+'/calendar-export-verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,cases:cases.length,blockedCases:blockedCases.length,bindings:bindings.length}));
