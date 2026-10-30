// SPDX-License-Identifier: AGPL-3.0-only
// First lot only. Never describe 77 reviewed IDs as the full 380-source review.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {exact,hash} from './archive-r10-u1-acceptance.mjs';
import {inventoryPath,inventorySha256,validateSourcePartition,verifyDescriptors,collectDescriptors,descriptor} from './r10-a2-review-contract.mjs';
export const config={out:'outputs/r10-a2-2026-10-28/baseline-completion.json',parts:[
 ['outputs/r10-a2-2026-10-28/baseline-federal/review.json','fc9a4f67a9042b09ce6f6920b6bf9d9142e73baca2b5eecc2d0dc14606d47f7c'],
 ['outputs/r10-a2-2026-10-28/baseline-bern/review.json','8c849d66aae69c3b7a325600bca281336d21d3dcaebac327e2ca13bdcdfc1ab3'],
 ['outputs/r10-a2-2026-10-28/baseline-judgments/review.json','8e206fff7ea1510ece10e5608fa717852cf8eebaf2b6b363ace55f3880b9c7aa']],
 closure:['outputs/r10-a2-2026-10-28/baseline-judgments/companion-norm-closure.json','1098b5629a32b758280ca2b925f636194e9ef8a20d084f985dd68ef98aa4cbcf']};
export async function finalize({root=process.cwd(),write=false}={}){
 const inventory=JSON.parse(await exact(root,inventoryPath,{sha256:inventorySha256})),parts=[],reports=[];
 for(const[path,sha256]of config.parts){const bytes=await exact(root,path,{sha256}),native=JSON.parse(bytes);parts.push({path,byteLength:bytes.length,sha256});reports.push({...native,rows:(native.rows??native.sourceRows).map(row=>({...row,method:row.method??native.method,relevantProvisions:row.relevantProvisions??row.actualStatements?.relevantProvisions??row.usedAssertions}))});}
 const closureBytes=await exact(root,config.closure[0],{sha256:config.closure[1]}),closure=JSON.parse(closureBytes);assert.equal(closure.counts.pendingCompanionDependencies,0);assert.equal(closure.rows.length,10);
 const judgment=reports[2];assert.deepEqual(closure.rows.map(r=>r.sourceId).sort(),judgment.rows.map(r=>r.sourceId).sort());
 for(const row of closure.rows){assert.equal(row.normCompanionStatus,'closed-for-the-exact-existing-uses');assert.deepEqual(row.referenceLocations,judgment.rows.find(r=>r.sourceId===row.sourceId).referenceLocations);assert.ok(row.normAssessments.length);assert.deepEqual(row.normAssessments.map(r=>r.sourceId).sort(),[...row.requiredNormIds].sort());for(const norm of row.normAssessments){const report=reports.find(r=>(r.rows??[]).some(s=>s.sourceId===norm.sourceId));assert.ok(report,'Missing norm source '+norm.sourceId);assert.ok(norm.reportBinding.pointer);}}
 const partition=validateSourcePartition(inventory,reports,{requiredLotIds:['R10-A2-BASELINE'],resolvedCompanionSourceIds:closure.rows.map(r=>r.sourceId)});assert.equal(partition.sourceCount,77);assert.equal(partition.referenceCount,1275);assert.equal(partition.newReferenceCount,1);assert.equal(partition.pendingSourceIds.length,303);
 const bindings=await verifyDescriptors(root,[...parts,{path:config.closure[0],byteLength:closureBytes.length,sha256:config.closure[1]},await descriptor(root,inventoryPath),...reports.flatMap(collectDescriptors),...collectDescriptors(closure)]);
 const value={workPackage:'R10-A2',lotId:'R10-A2-BASELINE',checkedOn:'2026-10-28',status:'first-source-lot-reviewed-common-review-incomplete',sourceCount:77,actualUseCount:1275,newUseCount:1,remainingSources:303,completeCommonReview:false,nextLotId:'R10-A2-CALENDAR-ACTIVATION',humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false,productChanges:false,registerChanges:false,operatingChanges:false,parts,judgmentNormClosure:{path:config.closure[0],byteLength:closureBytes.length,sha256:config.closure[1]},findings:reports[0].findings,retainedLimits:reports[0].retainedLimits,reviewedSources:partition.rows,pendingSourceIds:partition.pendingSourceIds,bindings};
 const encoded=Buffer.from(JSON.stringify(value,null,2)+'\n');if(write)await writeFile(resolve(root,config.out),encoded,{flag:'wx'});else assert.deepEqual(await exact(root,config.out),encoded);return{status:write?'baseline-lot-closed':'baseline-lot-reverified',path:config.out,sha256:hash(encoded),byteLength:encoded.length,sourceCount:77,actualUseCount:1275,newUseCount:1,remainingSources:303,evidenceFiles:bindings.length,completeCommonReview:false,sourceReleaseApproved:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.equal(process.argv.length,3);assert.ok(['--write','--check'].includes(process.argv[2]));console.log(JSON.stringify(await finalize({write:process.argv[2]==='--write'}),null,2));}
