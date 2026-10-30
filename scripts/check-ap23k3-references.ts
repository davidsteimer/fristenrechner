// SPDX-License-Identifier: AGPL-3.0-only
// Genuine native15 results. Independent Python owns the external date oracle.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {ap23k3CandidateRuntime as current} from '../src/release/ap23k3CandidateData';
import {ap23j3CandidateRuntime as previous} from '../src/release/ap23j3CandidateData';
import {calculateAdministrativeDeadline} from '../src/core/administrativeDeadline';
import {administrativeInput14} from '../tests/core/ap23j3Fixtures';
import {acceptedK2,administrativeReferenceInput15} from '../tests/core/ap23k3Fixtures';
const root=fileURLToPath(new URL('../',import.meta.url));
const target='outputs/ap23k3-2026-10-27/native-reference-verification.json';
const sha=(text:string):string=>createHash('sha256').update(text).digest('hex');
const encode=(value:unknown):string=>JSON.stringify(value,null,2)+'\n';
export async function verifyAP23K3References(){
 const c=current.administrativeContext.administrativeCatalog;
 function row(original:any){const input=administrativeReferenceInput15(c,original.input),native=calculateAdministrativeDeadline(input,current.administrativeContext),expected=original.expected;
  assert.equal(native.outcome,expected.outcome==='datedResearchValue'?'calculated':'blocked',original.id);
  if(native.outcome==='calculated')assert.equal(native.finalEnd,expected.end,original.id);else assert.equal('finalEnd'in native,false,original.id);
  assert.equal(native.calendarExportAllowed,false);return{id:original.id,input,originalInput:structuredClone(original.input),expected:structuredClone(expected),native};
 }
 const results=acceptedK2.results.map(row),syntheticResults=acceptedK2.syntheticProbeResults.map(row);
 assert.equal(results.length,65);assert.equal(syntheticResults.length,46);
 const branchOverrideRejections=acceptedK2.branchOracleResults.map((original:any)=>{
  const input:any=administrativeReferenceInput15(c,original.input);input.caseQualification.regionalOfficeMode=original.world==='withOptionalClosure'?'confirmedFullClosure':'noOptionalFullClosure';
  const native=calculateAdministrativeDeadline(input,current.administrativeContext);assert.equal(native.outcome,'blocked');assert.equal(native.calendarExportAllowed,false);assert.equal('finalEnd'in native,false);
  return{id:original.id,input,originalInput:original.input,originalExpected:original.expected,consumerExpected:'blocked',diagnosticWorldOnly:true,native};
 });
 const mathematicalFields=['ordinaryStart','deadlineStart','provisionalEnd','finalEnd','countedDates','skippedCalendarDays','encounteredPeriodIds','shiftReasonKeys','shiftedHolidayIds','startShiftApplied']as const;
 const oldResults=previous.administrativeContext.administrativeCatalog.paths.map(path=>{
  const policy:any=c.qualificationPolicies.find(q=>q.pathId===path.pathId),days=path.duration.kind==='statutoryDays'?path.duration.value:Math.max(7,path.duration.minimum);
  const overrides=policy.mode==='qualifiedDayProcedureV7'?Object.fromEntries(policy.requirements.map((r:any)=>[r.key,r.oneOf?r.oneOf[0]:r.value])):undefined;
  const input=administrativeInput14(c,path.pathId,'2026-10-02',days,path.stages[0],overrides),native=calculateAdministrativeDeadline(input,current.administrativeContext),prior=calculateAdministrativeDeadline(input,previous.administrativeContext);
  assert.equal(native.outcome,'calculated',path.pathId);assert.equal(prior.outcome,'calculated',path.pathId);if(native.outcome!=='calculated'||prior.outcome!=='calculated')throw Error(path.pathId);
  for(const key of mathematicalFields)assert.deepEqual(native[key],prior[key],path.pathId+'/'+key);assert.equal(native.calendarExportAllowed,false);
  return{pathId:path.pathId,input,native,prior,mathematicalFieldsEqual:true};
 });
 assert.equal(oldResults.length,149);
 const evidence=await Promise.all(['scripts/check-ap23k3-references.ts','src/core/administrativeTypesV8.ts','src/core/administrativeCatalogV8.ts','src/core/administrativeDeadlineV8.ts','src/core/administrativeV8Baseline.ts',
  'src/core/releaseFormat15.ts','src/core/format15CalculationData.ts','src/core/administrativeDeadline.ts','tests/core/ap23k3Fixtures.ts','outputs/ap23k2-candidate-2026-10-27/QA-AP23K2.json',
  'data/candidates/2026-10-27-ap23k3/manifest.json','data/candidates/2026-10-27-ap23k3/administrative-procedures/ch-cantonal-administrative-procedures.json'].map(async path=>{const bytes=await readFile(resolve(root,path));return{path,byteLength:bytes.length,sha256:sha(bytes.toString('utf8'))};}));
 return{workPackage:'AP23K3',status:'passed-native-reference-only',nativeFormat:'15.0.0',catalogFormat:'8.0.0',sourceReleaseApproved:false,operatingApproval:false,referenceOnly:true,calendarExportEnabled:false,
  acceptedOriginalCases:67,consumerCases:65,diagnosticWorldCases:2,syntheticCases:46,oldNativeCases:149,mathematicalFields,
  consumerOutcomes:{calculated:results.filter((r:any)=>r.native.outcome==='calculated').length,blocked:results.filter((r:any)=>r.native.outcome==='blocked').length},
  originalK1FactsPreserved:true,adaptation:structuredClone(acceptedK2.adaptation),results,syntheticResults,branchOverrideRejections,oldResults,evidence};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const flag=process.argv[2];assert.ok(flag==='--write'||flag==='--check');const report=await verifyAP23K3References(),text=encode(report);
 if(flag==='--write'){await mkdir(resolve(root,'outputs/ap23k3-2026-10-27'),{recursive:true});await writeFile(resolve(root,target),text);}
 else assert.equal(await readFile(resolve(root,target),'utf8'),text,'Native reference proof changed');
 console.log(JSON.stringify({mode:flag,status:report.status,consumerCases:65,syntheticCases:46,oldNativeCases:149,diagnosticOverrideRejections:2,sha256:sha(text)},null,2));
}
