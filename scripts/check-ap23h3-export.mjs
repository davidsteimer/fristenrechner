// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic approval only in memory. No ICS download, saved event file or Outlook import.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createFormat12CalculationData} from '../src/core/format12CalculationData.ts';
import {calculateAdministrativeUiDeadline,administrativeExportAvailable,createAdministrativeCalendarEntry} from '../src/ui/administrativeExport.ts';
import {buildSyntheticFormat12,encode12,administrativeInput12} from '../tests/core/ap23h3Fixtures.ts';
const out='outputs/ap23h3-2026-10-22',hash=b=>createHash('sha256').update(b).digest('hex');
const bind=async path=>{const b=await readFile(path);return{path,byteLength:b.length,sha256:hash(b)};};
const f=buildSyntheticFormat12('approved'),runtime=createFormat12CalculationData(encode12(f.manifest),f.files);
const local=buildSyntheticFormat12(),reference=createFormat12CalculationData(encode12(local.manifest),local.files,{mode:'localReference'});
const catalog=runtime.administrativeContext.administrativeCatalog;
const paths=catalog.paths.filter(p=>p.pathId.startsWith('ow-')||p.pathId.startsWith('nw-'));
assert.equal(paths.length,21);
let inMemoryArtifacts=0;
for(const p of paths){
  const input=administrativeInput12(catalog,p.pathId,'2026-10-02',p.duration.kind==='authorityOrderedDays'?10:undefined);
  const result=calculateAdministrativeUiDeadline(input,runtime.administrativeContext);
  assert.equal(result.outcome,'calculated',p.pathId);
  assert.equal(administrativeExportAvailable(input,runtime.administrativeContext,result),true);
  for(const locale of ['de','fr']){
    const file=createAdministrativeCalendarEntry({input,context:runtime.administrativeContext,result,locale,
      reference:'SYNTHETIC-H3-EXPORT-NO-FILE',uid:p.pathId+'@synthetic.invalid',createdAt:new Date('2026-10-22T12:00:00Z')});
    const content=file.content.replace(/\r\n[ \t]/g,'');
    assert.match(content,/BEGIN:VCALENDAR\r\n/);
    assert.match(content,new RegExp('DTSTART;VALUE=DATE:'+result.finalEnd.replaceAll('-','')));
    assert.match(content,/TRANSP:TRANSPARENT/);
    assert.match(content,/TRIGGER:-PT112H/);
    assert.match(content,new RegExp('pathId: '+p.pathId));
    assert.match(content,/CATEGORIES:Fristablauf/);
    inMemoryArtifacts++;
  }
  assert.equal(administrativeExportAvailable(input,runtime.administrativeContext,{...result}),false);
  assert.equal(administrativeExportAvailable(input,{...runtime.administrativeContext},result),false);
  const changed={...input,inputDate:'2026-10-03'};
  assert.equal(administrativeExportAvailable(changed,runtime.administrativeContext,result),false);
  assert.throws(()=>createAdministrativeCalendarEntry({input:changed,context:runtime.administrativeContext,result,locale:'de'}));
  const localResult=calculateAdministrativeUiDeadline(input,reference.administrativeContext);
  assert.equal(localResult.outcome,'calculated');
  assert.equal(administrativeExportAvailable(input,reference.administrativeContext,localResult),false);
  assert.throws(()=>createAdministrativeCalendarEntry({input,context:reference.administrativeContext,result:localResult,locale:'de'}));
}
const bindings=await Promise.all(['scripts/check-ap23h3-export.mjs','src/ui/administrativeExport.ts','src/ui/calendarExport.ts',
  'src/core/administrativeDeadline.ts','src/core/releaseFormat12.ts','tests/core/ap23h3Fixtures.ts'].map(bind));
const report={workPackage:'AP23H3',status:'passed',kind:'supplemental-in-memory-export-verification',
  qualifiedPaths:paths.length,languages:['de','fr'],syntheticInMemoryArtifacts:inMemoryArtifacts,
  referenceExportsDenied:21,changedInputsDenied:21,resultClonesDenied:21,contextClonesDenied:21,
  actualIcsFilesSaved:0,outlookImports:0,humanReleaseApproval:false,sourceReleaseApproved:false,operatingChanges:false,bindings};
await writeFile(out+'/export-verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
