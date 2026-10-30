// SPDX-License-Identifier: AGPL-3.0-only
// Actual native J3 results versus the immutable, fully qualified J2 inputs.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ap23j3CandidateRuntime as runtime} from '../src/release/ap23j3CandidateData';
import {calculateAdministrativeDeadline} from '../src/core/administrativeDeadline';
import type {AdministrativeDeadlineResult} from '../src/core/administrativeDeadline';
import {administrativeReferenceInput14} from '../tests/core/ap23j3Fixtures';
export const ROOT=fileURLToPath(new URL('../',import.meta.url));
const OUT='outputs/ap23j3-2026-10-27/native-reference-verification.json';
const read=(path:string)=>readFile(resolve(ROOT,path),'utf8');
function opening(actual:AdministrativeDeadlineResult):Record<string,unknown>|undefined{
 const value=actual.provenance?.openingResolution;
 return value?{...value,exportAllowed:false}:undefined;
}
/** Semantic field names only. The native kernel supplies every date and decision. */
export function normalizeNativeJ3(actual:AdministrativeDeadlineResult):Record<string,unknown>{
 const resolution=opening(actual);
 if(actual.outcome==='calculated'){
  assert.ok(resolution,'Native V7 result needs current opening provenance');
  const legal=resolution.qualifiedOpeningDate as string,input=resolution.inputDate as string,profile=actual.provenance.suspensionProfileId;
  return{outcome:'datedResearchValue',legalOpening:legal,ordinaryStart:actual.ordinaryStart,firstCountedDay:actual.countedDates[0],
   nominalEnd:actual.provisionalEnd,end:actual.finalEnd,openingShiftDays:(Date.parse(legal)-Date.parse(input))/86400000,
   skippedDays:actual.skippedCalendarDays,endShiftDays:(Date.parse(actual.finalEnd)-Date.parse(actual.provisionalEnd))/86400000,
   suspension:profile.endsWith('-three')?'three':profile.endsWith('-two')?'two':'none',
   temporalBindings:actual.provenance.evaluatedNormSegments?.map(segment=>(segment as {researchBindingId?:string}).researchBindingId),
   openingResolution:resolution,exportAllowed:false};
 }
 const reason=actual.blockReasonKeys[0]!;
 if(reason==='endShiftIntoSuspensionUnresolved')return{outcome:'unresolvedBoundaryProposed',reason:'J1-END-SUSPENSION',
  legalOpening:resolution?.qualifiedOpeningDate,nominalEnd:actual.provisionalEnd,ordinaryShiftEnd:actual.ordinaryShiftEnd,
  firstSuspendedShiftDate:actual.blockedDate,openingResolution:resolution,exportAllowed:false};
 if(reason==='administrative.outsideCaseCoverage'||reason==='dataCoverageExceeded')return{outcome:'researchWindowBoundary',reason:'outsideReferenceWindow',exportAllowed:false};
 return{outcome:'qualificationBoundaryProposed',reason:reason.replace(/^administrative\./,''),exportAllowed:false};
}
export async function checkJ3References(){
 const suite=JSON.parse(await read('docs/fachrecht/ap23j1/referenzfaelle.json'));
 const peer=JSON.parse(await read('outputs/ap23j2-candidate-2026-10-27/QA-AP23J2.json'));
 assert.equal(suite.cases.length,673);assert.equal(peer.referenceCases,673);const counts:Record<string,number>={};
 const results=suite.cases.map((item:any)=>{
  const prior=peer.results.find((row:any)=>row.id===item.id);assert.ok(prior,item.id);
  const input=administrativeReferenceInput14(runtime.administrativeContext.administrativeCatalog,item);
  assert.deepEqual(input.caseQualification,prior.input.facts,'No missing facts may be filled '+item.id);
  assert.equal(input.inputDate,prior.input.trigger);assert.equal(input.deadlineDays,prior.input.days);
  assert.equal(input.selection.pathId,prior.input.path);assert.equal(input.selection.revision,prior.input.pathRevision);
  assert.equal(input.authoritySeat.canton,prior.input.authoritySeatCanton);
  const native=calculateAdministrativeDeadline(input,runtime.administrativeContext),actual=normalizeNativeJ3(native);
  assert.deepEqual(actual,prior.actual,'Full accepted J2 equivalence '+item.id);
  for(const[key,value]of Object.entries(item.expected))assert.deepEqual(actual[key],value,item.id+' '+key);
  assert.equal(native.calendarExportAllowed,false);counts[String(actual.outcome)]=(counts[String(actual.outcome)]??0)+1;
  return{id:item.id,input,native,actual,provenance:prior.provenance};
 });
 assert.deepEqual(counts,{datedResearchValue:93,qualificationBoundaryProposed:573,unresolvedBoundaryProposed:3,researchWindowBoundary:4});
 const paths=['scripts/check-ap23j3-references.ts','src/core/administrativeDeadline.ts','src/core/administrativeDeadlineV7.ts',
  'src/core/administrativeCatalogV7.ts','src/core/releaseFormat14.ts','src/core/format14Runtime.ts','tests/core/ap23j3Fixtures.ts',
  'data/candidates/2026-10-27-ap23j3/manifest.json','data/candidates/2026-10-27-ap23j3/administrative-procedures/ch-cantonal-administrative-procedures.json',
  'docs/fachrecht/ap23j1/referenzfaelle.json','outputs/ap23j2-candidate-2026-10-27/QA-AP23J2.json'];
 const inputs=await Promise.all(paths.map(async path=>{const bytes=await readFile(resolve(ROOT,path));return{path,byteLength:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};}));
 return{workPackage:'AP23J3',status:'passedNativeFullReferenceComparison',referenceCases:results.length,counts,
  native:true,productCoreUsed:true,localReference:true,sourceReleaseApproved:false,calendarExportEnabled:false,results,inputs};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const report=await checkJ3References();if(process.argv.includes('--write')){await mkdir(resolve(ROOT,'outputs/ap23j3-2026-10-27'),{recursive:true});await writeFile(resolve(ROOT,OUT),JSON.stringify(report,null,2)+'\n');}
 console.log(JSON.stringify({...report,results:report.results.length,inputs:report.inputs.length},null,2));
}

