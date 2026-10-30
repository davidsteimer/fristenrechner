// SPDX-License-Identifier: AGPL-3.0-only
// Genuine native16 outcomes. This adapter only names semantic comparison fields.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ap23m3CandidateRuntime as current} from '../src/release/ap23m3CandidateData';
import {ap23l3CandidateRuntime as previous} from '../src/release/ap23l3CandidateData';
import {calculateAdministrativeDeadline} from '../src/core/administrativeDeadline';
import type {AdministrativeDeadlineResult} from '../src/core/administrativeDeadline';
import {administrativeReferenceInput17,acceptedM2} from '../tests/core/ap23m3Fixtures';
const root=fileURLToPath(new URL('../',import.meta.url)),target='outputs/ap23m3-2026-10-28/native-reference-verification.json';
const sha=(raw:string|Buffer)=>createHash('sha256').update(raw).digest('hex');
const encode=(value:unknown)=>JSON.stringify(value,null,2)+'\n';
export function normalizeNativeM3(native:AdministrativeDeadlineResult):Record<string,unknown>{
 const opening=native.provenance?.openingResolution;
 if(native.outcome==='calculated'){
  assert.ok(opening,'Current native V10 opening provenance');
  return{outcome:'datedResearchValue',legalOpening:opening.qualifiedOpeningDate,ordinaryStart:native.ordinaryStart,
   firstCountedDay:native.countedDates[0],nominalEnd:native.provisionalEnd,end:native.finalEnd,
   skippedDays:native.skippedCalendarDays,endShiftDays:(Date.parse(native.finalEnd)-Date.parse(native.provisionalEnd))/86400000,
   calendar:native.provenance.calendarId,temporalBindings:native.provenance.evaluatedNormSegments?.map((row:any)=>row.researchBindingId),exportAllowed:false};
 }
 const reason=native.blockReasonKeys[0]!;
 if(reason==='endShiftIntoSuspensionUnresolved')return{outcome:'unresolvedBoundaryProposed',reason:'M1-END-SUSPENSION',
  nominalEnd:native.provisionalEnd,ordinaryShiftEnd:native.ordinaryShiftEnd,firstSuspendedShiftDate:native.blockedDate,exportAllowed:false};
 if(reason==='administrative.outsideCaseCoverage'||reason==='dataCoverageExceeded')return{outcome:'researchWindowBoundary',reason:'outsideReferenceWindow',exportAllowed:false};
 return{outcome:'qualificationBoundaryProposed',reason:reason.replace(/^administrative\./u,''),exportAllowed:false};
}
export async function verifyNativeM3References(){
 const catalog=current.administrativeContext.administrativeCatalog;
 const suite=JSON.parse(await readFile(resolve(root,'docs/fachrecht/ap23m1/referenzfaelle.json'),'utf8'));
 const oldEvidence=JSON.parse(await readFile(resolve(root,'outputs/ap23m2-2026-10-28/native-regression.json'),'utf8'));
 function compare(original:any){
  const input=administrativeReferenceInput17(catalog,original.input);
  assert.deepEqual(input.caseQualification,original.input.facts,'Current facts remain explicit '+original.id);
  assert.equal(input.inputDate,original.input.trigger);assert.equal(input.deadlineDays,original.input.days);
  const native=calculateAdministrativeDeadline(input,current.administrativeContext),actual=normalizeNativeM3(native);
  if(native.outcome==='calculated'){
   for(const key of['legalOpening','ordinaryStart','firstCountedDay','nominalEnd','end','skippedDays','endShiftDays'])assert.deepEqual(actual[key],original.actual[key],original.id+' full mathematical '+key);
   assert.equal(native.provenance.calendarId,original.actual.calendar);
   assert.deepEqual(native.provenance.evaluatedNormSegments,original.actual.provenance.evaluatedNormSegments);
   assert.deepEqual(native.provenance.openingResolution?.openingShiftDates,original.actual.provenance.openingShiftDates);
  }
  for(const[key,value]of Object.entries(original.expected))assert.deepEqual(actual[key],value,original.id+' '+key);
  assert.equal(native.calendarExportAllowed,false);if(native.outcome==='calculated')assert.equal(native.referenceOnly,true);
  else assert.equal('finalEnd'in native,false);
  return{id:original.id,input,originalInput:structuredClone(original.input),expected:structuredClone(original.expected),native,actual};
 }
 const results=acceptedM2.results.map(compare),syntheticResults=acceptedM2.syntheticProbeResults.map(compare);
 assert.equal(results.length,suite.cases.length);assert.equal(results.length,109);
 for(const row of results){const original=suite.cases.find((item:any)=>item.id===row.id);assert.ok(original);assert.deepEqual(row.originalInput.facts,original.facts);assert.deepEqual(row.expected,original.expected);}
 const mathematicalFields=['outcome','ordinaryStart','deadlineStart','provisionalEnd','finalEnd','deadlineDays','countedDates','skippedCalendarDays',
  'encounteredPeriodIds','shiftReasonKeys','shiftedHolidayIds','startShiftApplied','referenceOnly','calendarExportAllowed']as const;
 const oldResults=oldEvidence.results.map((row:any)=>{
  const input=structuredClone(row.input),native=calculateAdministrativeDeadline(input,current.administrativeContext),prior=calculateAdministrativeDeadline(input,previous.administrativeContext);
  assert.equal(native.outcome,'calculated',row.pathId);assert.equal(prior.outcome,'calculated',row.pathId);
  for(const key of mathematicalFields)assert.deepEqual((native as any)[key],(prior as any)[key],row.pathId+'/'+key);
  assert.equal(native.calendarExportAllowed,false);return{pathId:row.pathId,input,native,prior,mathematicalFieldsEqual:true};
 });
 assert.equal(oldResults.length,196);assert.equal(new Set(oldResults.map((row:any)=>row.pathId)).size,196);
 const counts:Record<string,number>={};for(const row of results)counts[String(row.actual.outcome)]=(counts[String(row.actual.outcome)]??0)+1;
 const evidence=await Promise.all(['scripts/check-ap23m3-references.ts','src/core/administrativeTypesV10.ts','src/core/administrativeCatalogV10.ts','src/core/administrativeDeadlineV10.ts','src/core/administrativeDeadlineV9InV10.ts',
  'src/core/administrativeV10Baseline.ts','src/core/releaseFormat17.ts','src/core/format17CalculationData.ts','src/core/administrativeDeadline.ts','tests/core/ap23m3Fixtures.ts',
  'outputs/ap23m2-candidate-2026-10-28/QA-AP23M2.json','outputs/ap23m2-2026-10-28/native-regression.json','docs/fachrecht/ap23m1/referenzfaelle.json',
  'data/candidates/2026-10-28-ap23m3/manifest.json','data/candidates/2026-10-28-ap23m3/administrative-procedures/ch-cantonal-administrative-procedures.json'].map(async path=>{
   const bytes=await readFile(resolve(root,path));return{path,byteLength:bytes.length,sha256:sha(bytes)};
  }));
 return{workPackage:'AP23M3',status:'passed-native-reference-only',nativeFormat:'17.0.0',catalogFormat:'10.0.0',consumerCases:results.length,
  syntheticCases:syntheticResults.length,oldNativeCases:oldResults.length,consumerOutcomes:counts,mathematicalFields,
  originalFactsPreserved:true,sourceReleaseApproved:false,operatingApproval:false,referenceOnly:true,calendarExportEnabled:false,
  results,syntheticResults,oldResults,evidence};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const flag=process.argv[2];assert.ok(flag==='--write'||flag==='--check');const report=await verifyNativeM3References(),text=encode(report);
 if(flag==='--write'){await mkdir(resolve(root,'outputs/ap23m3-2026-10-28'),{recursive:true});await writeFile(resolve(root,target),text);}
 else assert.equal(await readFile(resolve(root,target),'utf8'),text,'Native M3 proof changed');
 console.log(JSON.stringify({mode:flag,status:report.status,consumerCases:report.consumerCases,syntheticCases:report.syntheticCases,oldNativeCases:report.oldNativeCases,sha256:sha(text)},null,2));
}

