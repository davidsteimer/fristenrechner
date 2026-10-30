// SPDX-License-Identifier: AGPL-3.0-only
// Existing native15 consumer only. Proposed AI/SZ mathematics is out of scope.
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {nativeConfig,verifyNativeBaseline,readNativeBundle,rejectProposedByNative15} from '../../scripts/check-ap23l2-native.mjs';
const result=verifyNativeBaseline();
test('actual native15 reader and calculator preserve all 165 accepted K3 positive cases',async()=>{
 const r=await result;assert.equal(r.status,'native-format15-baseline-preserved');assert.equal(r.nativeFormat,'15.0.0');assert.equal(r.catalogFormat,'8.0.0');
 assert.equal(r.baselinePaths,165);assert.equal(r.calculatedCases,165);assert.equal(r.prior149CasesPreserved,149);assert.equal(r.priorK3CasesPreserved,16);
 assert.equal(new Set(r.results.map(row=>row.pathId)).size,165);assert.equal(r.baselineCantonCount,20);
 assert.ok(r.results.every(row=>row.acceptedResultEqual&&row.native.outcome==='calculated'&&row.native.finalEnd===row.expectedFinalEnd));
});
test('each of the 165 native results remains reference-only and cannot authorise export',async()=>{
 const r=await result;assert.ok(r.results.every(row=>row.native.referenceOnly===true&&row.native.calendarExportAllowed===false));
 for(const flag of['calendarExportEnabled','formatDecision','sourceReleaseApproved','runtimeActivation','productBuildPerformed','operatingChanges'])assert.equal(r[flag],false);
 assert.equal(r.newAISZCalculations,0);
});
test('a copied native context cannot manufacture a trusted result',async()=>{
 const r=await result;assert.equal(r.copiedContextRejected.outcome,'blocked');assert.equal(r.copiedContextRejected.calendarExportAllowed,false);
 assert.deepEqual(r.copiedContextRejected.blockReasonKeys,['administrative.untrustedRelease']);
});
for(const reader of['approved','localReference'])for(const variant of[
 'exact-format16','format16-with-forged-approved-status','format15-local-header-with-catalog9',
 'format15-approved-header-with-catalog9','format15-local-header-and-rehashed-catalog8-label','format15-approved-header-and-rehashed-catalog8-label'
])test('unchanged '+reader+' native15 reader rejects '+variant,async()=>{
 const r=await result,row=r.rejections.find(row=>row.reader===reader&&row.variant===variant);
 assert.ok(row);assert.equal(row.rejected,true);assert.equal(row.sourceMutation,false);assert.equal(row.completeRawArtifactCount,44);
 assert.ok(['SchemaContractError','Format15DataError'].includes(row.errorName));assert.ok(row.message.length>0);
});
test('native regression is anchored to the immutable L2 start inventory and raw 44-artifact bundles',async()=>{
 const r=await result;assert.equal(r.inputProtection.protectedFilesVerified,9048);assert.equal(r.inputProtection.guardSha256,'6b8540b694a67a1fffd292486a7480728eca06f37f53f490f8df75fad2786bb1');
 assert.equal(r.evidence.filter(row=>row.path.startsWith(nativeConfig.baseline+'/')).length,45);
 assert.equal(r.evidence.filter(row=>row.path.startsWith(nativeConfig.candidate+'/')).length,45);
 for(const path of['src/core/releaseFormat15.ts','src/core/administrativeDeadline.ts','src/core/administrativeDeadlineV8.ts','tests/core/ap23k3Fixtures.ts',nativeConfig.accepted])assert.ok(r.evidence.some(row=>row.path===path));
 assert.ok(r.evidence.every(row=>row.byteLength>0&&/^[a-f0-9]{64}$/u.test(row.sha256)));
});
test('the report is exactly reproducible and does not mutate either bundle',async()=>{
 const r=await result,text=await readFile(new URL('../../'+nativeConfig.report,import.meta.url),'utf8');assert.equal(text,JSON.stringify(r,null,2)+'\n');
 const bundle=await readNativeBundle(nativeConfig.candidate),before=bundle.manifestText,artifact=bundle.files.get(nativeConfig.admin);
 assert.equal(rejectProposedByNative15(bundle).length,12);assert.equal(bundle.manifestText,before);assert.equal(bundle.files.get(nativeConfig.admin),artifact);
});
