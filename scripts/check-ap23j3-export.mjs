// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic memory-only calendar proof. Never writes an ICS or imports Outlook.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createFormat14CalculationData} from '../src/core/format14CalculationData.ts';
import {calculateAdministrativeUiDeadline,administrativeExportAvailable,createAdministrativeCalendarEntry} from '../src/ui/administrativeExport.ts';
import {buildSyntheticFormat14,encode14,administrativeInput14} from '../tests/core/ap23j3Fixtures.ts';
const out='outputs/ap23j3-2026-10-27';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const bind=async path=>{const bytes=await readFile(path);return{path,byteLength:bytes.length,sha256:hash(bytes)};};
const approved=buildSyntheticFormat14('approved'),local=buildSyntheticFormat14('localReference');
const runtime=createFormat14CalculationData(encode14(approved.manifest),approved.files);
const reference=createFormat14CalculationData(encode14(local.manifest),local.files,{mode:'localReference'});
const context=runtime.administrativeContext,catalog=context.administrativeCatalog;
const paths=catalog.paths.filter(path=>path.contractFamily==='qualifiedDayProcedureV7');assert.equal(paths.length,36);
const cases=[];let strings=0,changedFactsDenied=0;
for(const path of paths){
  const policy=catalog.qualificationPolicies.find(row=>row.pathId===path.pathId);
  const alternatives=policy.requirements.filter(row=>row.oneOf);
  let choices=[{}];for(const row of alternatives)choices=choices.flatMap(values=>row.oneOf.map(value=>({...values,[row.key]:value})));
  for(const facts of choices){
    const days=path.duration.kind==='statutoryDays'?path.duration.value:7;
    const input=administrativeInput14(catalog,path.pathId,'2026-10-02',days,undefined,facts);
    const result=calculateAdministrativeUiDeadline(input,context);assert.equal(result.outcome,'calculated',path.pathId);
    assert.equal(administrativeExportAvailable(input,context,result),true);
    const opening=result.provenance.openingResolution;assert.ok(opening);assert.match(opening.openingPolicySha256,/^[a-f0-9]{64}$/);
    assert.equal(opening.inputDate,'2026-10-02');assert.equal(opening.qualifiedOpeningDate,'2026-10-02');
    for(const locale of['de','fr']){
      const file=createAdministrativeCalendarEntry({input,context,result,locale,reference:'SYNTHETIC-J3-EXPORT-NO-FILE',
        uid:path.pathId+'-'+strings+'@synthetic.invalid',createdAt:new Date('2026-10-27T12:00:00Z')});
      const content=file.content.replace(/\r\n[ \t]/g,'');assert.match(content,/BEGIN:VCALENDAR\r\n/);
      assert.match(content,new RegExp('DTSTART;VALUE=DATE:'+result.finalEnd.replaceAll('-','')));
      assert.match(content,/TRANSP:TRANSPARENT/);assert.match(content,/TRIGGER:-PT112H/);assert.match(content,/CATEGORIES:Fristablauf/);
      assert.match(content,new RegExp('pathId: '+path.pathId));strings++;
    }
    assert.equal(administrativeExportAvailable(input,context,{...result}),false);
    assert.equal(administrativeExportAvailable(input,{...context},result),false);
    assert.equal(administrativeExportAvailable({...input,inputDate:'2026-10-03'},context,result),false);
    for(const row of alternatives){const other=row.oneOf.find(value=>value!==facts[row.key]);
      assert.equal(administrativeExportAvailable({...input,caseQualification:{...input.caseQualification,[row.key]:other}},context,result),false);changedFactsDenied++;}
    const localResult=calculateAdministrativeUiDeadline(input,reference.administrativeContext);assert.equal(localResult.outcome,'calculated');
    assert.equal(administrativeExportAvailable(input,reference.administrativeContext,localResult),false);
    assert.throws(()=>createAdministrativeCalendarEntry({input,context:reference.administrativeContext,result:localResult,locale:'de'}));
    cases.push({pathId:path.pathId,facts,days,finalEnd:result.finalEnd,openingResolution:opening});
  }
}
assert.ok(cases.length>36);assert.equal(strings,cases.length*2);
const bindings=await Promise.all(['scripts/check-ap23j3-export.mjs','src/ui/administrativeExport.ts','src/ui/calendarExport.ts',
 'src/core/administrativeDeadline.ts','src/core/administrativeDeadlineV7.ts','src/core/releaseFormat14.ts',
 'src/core/format14CalculationData.ts','tests/core/ap23j3Fixtures.ts'].map(bind));
const report={workPackage:'AP23J3',status:'passed',kind:'supplemental-in-memory-export-verification',qualifiedPaths:36,
 qualifiedCases:cases.length,languages:['de','fr'],syntheticInMemoryArtifacts:strings,referenceExportsDenied:cases.length,
 changedInputsDenied:cases.length,resultClonesDenied:cases.length,contextClonesDenied:cases.length,changedFactsDenied,
 actualIcsFilesSaved:0,outlookImports:0,humanReleaseApproval:false,sourceReleaseApproved:false,operatingChanges:false,cases,bindings};
await writeFile(out+'/export-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,cases:cases.length,bindings:bindings.length}));
