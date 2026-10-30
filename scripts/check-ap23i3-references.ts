// SPDX-License-Identifier: AGPL-3.0-only
// Actual native results, separately normalized to the immutable I1 contract.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ap23i3CandidateRuntime as runtime} from '../src/release/ap23i3CandidateData';
import {calculateAdministrativeDeadline} from '../src/core/administrativeDeadline';
import type {AdministrativeDeadlineResult} from '../src/core/administrativeDeadline';
import {administrativeInput13} from '../tests/core/ap23i3Fixtures';
export const ROOT=fileURLToPath(new URL('../',import.meta.url));
const OUT='outputs/ap23i3-2026-10-22/native-reference-verification.json';
const read=(path:string)=>readFile(resolve(ROOT,path),'utf8');
export function normalizeNativeI3(actual:AdministrativeDeadlineResult):Record<string,unknown>{
 if(actual.outcome==='calculated')return{outcome:'datedResearchValue',ordinaryStart:actual.ordinaryStart,firstCountedDay:actual.countedDates[0],
  nominalEnd:actual.provisionalEnd,end:actual.finalEnd,skippedDays:actual.skippedCalendarDays,
  endShiftDays:(Date.parse(actual.finalEnd)-Date.parse(actual.provisionalEnd))/86400000,suspension:actual.provenance.suspensionProfileId.endsWith('-three')?'three':'none',
  temporalBindings:actual.provenance.evaluatedNormSegments?.map(segment=>(segment as {researchBindingId?:string}).researchBindingId),exportAllowed:false};
 const reason=actual.blockReasonKeys[0]!;
 if(reason==='endShiftIntoSuspensionUnresolved')return{outcome:'unresolvedBoundaryProposed',reason:'I1-END-SUSPENSION',nominalEnd:actual.provisionalEnd,
  ordinaryShiftEnd:actual.ordinaryShiftEnd,firstSuspendedShiftDate:actual.blockedDate,exportAllowed:false};
 if(reason==='administrative.outsideCaseCoverage'||reason==='dataCoverageExceeded')return{outcome:'researchWindowBoundary',reason:'outsideReferenceWindow',exportAllowed:false};
 return{outcome:'qualificationBoundaryProposed',reason:reason.replace(/^administrative\./,''),exportAllowed:false};
}
export async function checkI3References(){
 const suite=JSON.parse(await read('docs/fachrecht/ap23i1/referenzfaelle.json'));
 const peer=JSON.parse(await read('outputs/ap23i2-candidate-2026-10-22/QA-AP23I2.json'));
 assert.equal(suite.cases.length,249);const counts:Record<string,number>={};
 const results=suite.cases.map((item:any)=>{
  const input=administrativeInput13(runtime.administrativeContext.administrativeCatalog,item.path.toLowerCase(),item.trigger,item.days,undefined,item.facts);
  const native=calculateAdministrativeDeadline(input,runtime.administrativeContext),actual=normalizeNativeI3(native);
  assert.deepEqual(actual,peer.results.find((row:any)=>row.id===item.id).actual,'Full accepted I2 equivalence '+item.id);
  for(const[key,value]of Object.entries(item.expected))assert.deepEqual(actual[key],value,item.id+' '+key);
  assert.equal(native.calendarExportAllowed,false);counts[String(actual.outcome)]=(counts[String(actual.outcome)]??0)+1;
  return{id:item.id,input,native,actual};
 });
 const paths=['scripts/check-ap23i3-references.ts','src/core/administrativeDeadline.ts','src/core/administrativeDeadlineV6.ts',
  'src/core/administrativeCatalogV6.ts','src/core/releaseFormat13.ts','src/core/format13Runtime.ts',
  'data/candidates/2026-10-22-ap23i3/manifest.json','data/candidates/2026-10-22-ap23i3/administrative-procedures/ch-cantonal-administrative-procedures.json',
  'docs/fachrecht/ap23i1/referenzfaelle.json','outputs/ap23i2-candidate-2026-10-22/QA-AP23I2.json'];
 const inputs=await Promise.all(paths.map(async path=>{const bytes=await readFile(resolve(ROOT,path));return{path,byteLength:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};}));
 return{workPackage:'AP23I3',status:'passedNativeFullReferenceComparison',referenceCases:results.length,counts,
  native:true,productCoreUsed:true,localReference:true,sourceReleaseApproved:false,calendarExportEnabled:false,results,inputs};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const report=await checkI3References();if(process.argv.includes('--write')){await mkdir(resolve(ROOT,'outputs/ap23i3-2026-10-22'),{recursive:true});await writeFile(resolve(ROOT,OUT),JSON.stringify(report,null,2)+'\n');}
 console.log(JSON.stringify({...report,results:report.results.length,inputs:report.inputs.length},null,2));
}
