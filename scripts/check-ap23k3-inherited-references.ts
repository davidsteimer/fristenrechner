// SPDX-License-Identifier: AGPL-3.0-only
// Re-evaluate immutable earlier J1 cases in the real Format15 context.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {ap23k3CandidateRuntime as runtime} from '../src/release/ap23k3CandidateData';
import {calculateAdministrativeDeadline} from '../src/core/administrativeDeadline';
import {administrativeReferenceInput14} from '../tests/core/ap23j3Fixtures';
import {normalizeNativeJ3} from './check-ap23j3-references';
const sha=(raw:Buffer|string)=>createHash('sha256').update(raw).digest('hex');
const suite=JSON.parse(await readFile('docs/fachrecht/ap23j1/referenzfaelle.json','utf8'));
const accepted=JSON.parse(await readFile('outputs/ap23j3-2026-10-27/native-reference-verification.json','utf8'));
assert.equal(suite.cases.length,673);assert.equal(accepted.referenceCases,673);
const results=suite.cases.map((row:any)=>{
 const old=accepted.results.find((old:any)=>old.id===row.id);assert.ok(old,row.id);
 const input=administrativeReferenceInput14(runtime.administrativeContext.administrativeCatalog,row);
 assert.deepEqual(input,old.input,'Inherited authentic facts '+row.id);
 const native=calculateAdministrativeDeadline(input,runtime.administrativeContext),actual=normalizeNativeJ3(native);
 assert.deepEqual(actual,old.actual,'Unchanged old qualification and full mathematics '+row.id);
 assert.equal(native.calendarExportAllowed,false);return {id:row.id,input,actual,native};
});
const counts:Record<string,number>={};for(const row of results)counts[String(row.actual.outcome)]=(counts[String(row.actual.outcome)]??0)+1;
assert.deepEqual(counts,{datedResearchValue:93,qualificationBoundaryProposed:573,unresolvedBoundaryProposed:3,researchWindowBoundary:4});
const evidence=await Promise.all(['scripts/check-ap23k3-inherited-references.ts','scripts/check-ap23j3-references.ts',
 'outputs/ap23j3-2026-10-27/native-reference-verification.json','docs/fachrecht/ap23j1/referenzfaelle.json',
 'src/core/administrativeDeadline.ts','src/core/administrativeDeadlineV8.ts','src/core/releaseFormat15.ts'].map(async path=>{
 const bytes=await readFile(path);return {path,byteLength:bytes.length,sha256:sha(bytes)};
}));
const report={workPackage:'AP23K3',status:'passed-inherited-673-reference-cases',referenceCases:673,counts,
 sourceReleaseApproved:false,calendarExportEnabled:false,operatingChanges:false,results,evidence};
await writeFile('outputs/ap23k3-2026-10-27/inherited-reference-verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,results:results.length,evidence:evidence.length}));
