// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic approvals and calendar strings in memory only. Never saves an ICS.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createFormat13CalculationData} from '../src/core/format13CalculationData.ts';
import {calculateAdministrativeUiDeadline,administrativeExportAvailable,createAdministrativeCalendarEntry} from '../src/ui/administrativeExport.ts';
import {buildSyntheticFormat13,encode13,administrativeInput13} from '../tests/core/ap23i3Fixtures.ts';
const out='outputs/ap23i3-2026-10-22';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const bind=async path=>{const bytes=await readFile(path);return{path,byteLength:bytes.length,sha256:hash(bytes)};};
const approved=buildSyntheticFormat13('approved');
const runtime=createFormat13CalculationData(encode13(approved.manifest),approved.files);
const local=buildSyntheticFormat13('localReference');
const reference=createFormat13CalculationData(encode13(local.manifest),local.files,{mode:'localReference'});
const context=runtime.administrativeContext,catalog=context.administrativeCatalog;
const paths=catalog.paths.filter(path=>path.contractFamily==='qualifiedDayProcedureV6');
assert.equal(paths.length,34);
const cases=[];let strings=0;
for(const path of paths){
  const days=path.duration.kind==='statutoryDays'?undefined:path.duration.kind==='concretisedStatutoryDays'?
    Math.min(path.duration.maximum,Math.max(path.duration.minimum,7)):7;
  const choices=path.suspensionSelection.kind==='currentFact'?['given','absent']:[null];
  for(const choice of choices){
    const facts=choice?{exceptionNotice:choice}:undefined;
    const input=administrativeInput13(catalog,path.pathId,'2026-10-02',days,undefined,facts);
    const result=calculateAdministrativeUiDeadline(input,context);
    assert.equal(result.outcome,'calculated',path.pathId+' '+choice);
    assert.equal(administrativeExportAvailable(input,context,result),true);
    const provenance=result.provenance;
    assert.match(provenance.suspensionSelectionSha256,/^[a-f0-9]{64}$/);
    assert.match(provenance.suspensionProfileSha256,/^[a-f0-9]{64}$/);
    assert.ok(provenance.permittedSuspensionProfiles.some(row=>row.suspensionProfileId===provenance.suspensionProfileId
      &&row.sha256===provenance.suspensionProfileSha256));
    if(choice)assert.equal(provenance.suspensionProfileId,choice==='given'?'tg-none':'tg-three');
    for(const locale of['de','fr']){
      const file=createAdministrativeCalendarEntry({input,context,result,locale,reference:'SYNTHETIC-I3-EXPORT-NO-FILE',
        uid:path.pathId+'-'+(choice??'fixed')+'@synthetic.invalid',createdAt:new Date('2026-10-22T12:00:00Z')});
      const content=file.content.replace(/\r\n[ \t]/g,'');
      assert.match(content,/BEGIN:VCALENDAR\r\n/);
      assert.match(content,new RegExp('DTSTART;VALUE=DATE:'+result.finalEnd.replaceAll('-','')));
      assert.match(content,/TRANSP:TRANSPARENT/);assert.match(content,/TRIGGER:-PT112H/);
      assert.match(content,/CATEGORIES:Fristablauf/);assert.match(content,new RegExp('pathId: '+path.pathId));
      strings++;
    }
    assert.equal(administrativeExportAvailable(input,context,{...result}),false);
    assert.equal(administrativeExportAvailable(input,{...context},result),false);
    const changed={...input,inputDate:'2026-10-03'};
    assert.equal(administrativeExportAvailable(changed,context,result),false);
    assert.throws(()=>createAdministrativeCalendarEntry({input:changed,context,result,locale:'de'}));
    if(choice){
      const other={...input,caseQualification:{...input.caseQualification,exceptionNotice:choice==='given'?'absent':'given'}};
      assert.equal(administrativeExportAvailable(other,context,result),false);
    }
    const localResult=calculateAdministrativeUiDeadline(input,reference.administrativeContext);
    assert.equal(localResult.outcome,'calculated');
    assert.equal(administrativeExportAvailable(input,reference.administrativeContext,localResult),false);
    assert.throws(()=>createAdministrativeCalendarEntry({input,context:reference.administrativeContext,result:localResult,locale:'de'}));
    cases.push({pathId:path.pathId,choice,finalEnd:result.finalEnd,profileId:provenance.suspensionProfileId,
      profileSha256:provenance.suspensionProfileSha256,selectionSha256:provenance.suspensionSelectionSha256});
  }
}
assert.equal(cases.length,39);assert.equal(strings,78);
const bindings=await Promise.all(['scripts/check-ap23i3-export.mjs','src/ui/administrativeExport.ts','src/ui/calendarExport.ts',
  'src/core/administrativeDeadline.ts','src/core/administrativeDeadlineV6.ts','src/core/releaseFormat13.ts',
  'src/core/format13CalculationData.ts','tests/core/ap23i3Fixtures.ts'].map(bind));
const report={workPackage:'AP23I3',status:'passed',kind:'supplemental-in-memory-export-verification',qualifiedPaths:34,
  qualifiedCases:39,conditionalNoticeCases:10,languages:['de','fr'],syntheticInMemoryArtifacts:strings,
  referenceExportsDenied:39,changedInputsDenied:39,resultClonesDenied:39,contextClonesDenied:39,
  changedNoticeExportsDenied:10,actualIcsFilesSaved:0,outlookImports:0,humanReleaseApproval:false,
  sourceReleaseApproved:false,operatingChanges:false,cases,bindings};
await writeFile(out+'/export-verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,cases:cases.length,bindings:bindings.length},null,2));
