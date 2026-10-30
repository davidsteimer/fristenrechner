// SPDX-License-Identifier: AGPL-3.0-only
// Repeat all previously recorded J3 and L3 adverse and positive inputs in native17.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {ap23m3CandidateRuntime as current} from '../src/release/ap23m3CandidateData';
import {ap23l3CandidateRuntime as previous} from '../src/release/ap23l3CandidateData';
import {calculateAdministrativeDeadline} from '../src/core/administrativeDeadline';
import {normalizeNativeL3} from './check-ap23l3-references';
import {normalizeNativeJ3} from './check-ap23j3-references';
const sha=(raw:Buffer|string)=>createHash('sha256').update(raw).digest('hex');
const oldL=JSON.parse(await readFile('outputs/ap23l3-2026-10-27/native-reference-verification.json','utf8'));
const oldJ=JSON.parse(await readFile('outputs/ap23l3-2026-10-27/inherited-reference-verification.json','utf8'));
const mathematicalFields=['outcome','ordinaryStart','deadlineStart','provisionalEnd','finalEnd','deadlineDays','countedDates',
 'skippedCalendarDays','encounteredPeriodIds','shiftReasonKeys','shiftedHolidayIds','startShiftApplied',
 'referenceOnly','calendarExportAllowed','blockedDate','ordinaryShiftEnd','blockReasonKeys','periodIds']as const;
const groups=[{id:'L3-original',rows:oldL.results,normalize:normalizeNativeL3,acceptedSection:'results',acceptedEvidence:'outputs/ap23l3-2026-10-27/native-reference-verification.json'},
 {id:'L3-synthetic',rows:oldL.syntheticResults,normalize:normalizeNativeL3,acceptedSection:'syntheticResults',acceptedEvidence:'outputs/ap23l3-2026-10-27/native-reference-verification.json'},
 {id:'J3-inherited',rows:oldJ.results,normalize:normalizeNativeJ3,acceptedSection:'results',acceptedEvidence:'outputs/ap23l3-2026-10-27/inherited-reference-verification.json'}];
const results=groups.flatMap(group=>group.rows.map((row:any)=>{
 const input=structuredClone(row.input),native=calculateAdministrativeDeadline(input,current.administrativeContext),
  prior=calculateAdministrativeDeadline(input,previous.administrativeContext),actual=group.normalize(native);
 assert.deepEqual(actual,row.actual,group.id+'/'+row.id+' recorded inherited semantics');
 for(const key of mathematicalFields)assert.deepEqual((native as any)[key],(prior as any)[key],group.id+'/'+row.id+'/'+key);
 assert.equal(native.calendarExportAllowed,false);
 return{group:group.id,id:row.id,input,actual,native,prior,mathematicalFieldsEqual:true,
  acceptedEvidence:group.acceptedEvidence,acceptedSection:group.acceptedSection,acceptedId:row.id};
}));
assert.equal(oldL.results.length,83);assert.equal(oldL.syntheticResults.length,20);assert.equal(oldJ.results.length,oldJ.referenceCases);
const evidence=await Promise.all(['scripts/check-ap23m3-inherited-references.ts','scripts/check-ap23l3-references.ts','scripts/check-ap23j3-references.ts',
 'outputs/ap23l3-2026-10-27/native-reference-verification.json','outputs/ap23l3-2026-10-27/inherited-reference-verification.json',
 'src/core/administrativeDeadline.ts','src/core/administrativeDeadlineV9InV10.ts','src/core/releaseFormat17.ts'].map(async path=>{
  const bytes=await readFile(path);return{path,byteLength:bytes.length,sha256:sha(bytes)};
 }));
const counts:Record<string,number>={};for(const row of results)counts[row.actual.outcome]=(counts[row.actual.outcome]??0)+1;
const report={workPackage:'AP23M3',status:'passed-inherited-reference-cases',referenceCases:results.length,
 groupCounts:Object.fromEntries(groups.map(g=>[g.id,g.rows.length])),counts,mathematicalFields,
 sourceReleaseApproved:false,calendarExportEnabled:false,operatingChanges:false,results,evidence};
await writeFile('outputs/ap23m3-2026-10-28/inherited-reference-verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,results:results.length,evidence:evidence.length}));
