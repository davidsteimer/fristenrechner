// Separate read-only VD tests. Root's 117 governance tests remain unchanged.
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import{fileURLToPath}from'node:url';
import{validateSourcePartition,verifyDescriptors,collectDescriptors}from'./r10-a2-review-contract.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
export async function runVdReviewTests(report,inventory){
 const expected=inventory.rows.filter(s=>s.ownerLotId==='R10-A2-AP23M1'&&s.sourceId.startsWith('SRC-M1-VD-')).map(s=>s.sourceId).sort();
 const validate=r=>{validateSourcePartition(inventory,[r]);assert.deepEqual(r.rows.map(s=>s.sourceId).sort(),expected);assert.equal(r.rows.reduce((n,s)=>n+s.newReferenceLocations.length,0),255);assert.ok(r.rows.every(s=>s.originalCheckedOn==='2026-10-27'));assert.equal(r.reformAssessment.amendmentEffectiveFrom,'2025-09-01');assert.equal(r.reformAssessment.enactmentDecreeOwnEffectiveFrom,'2025-09-16');assert.equal(r.pathUseAssessments.length,19)};
 validate(report);const outcomes=[];
 for(const[name,mutate]of[
  ['missing native ID',r=>r.rows.pop()],['wrong owner lot',r=>r.rows[0].ownerLotId='R10-A2-AP23L1'],['fabricated human approval',r=>r.rows[0].humanApproval=true],['fabricated source release',r=>r.sourceReleaseApproved=true],['changed current review date',r=>r.rows[0].checkedOn='2026-10-27'],['missing exact new uses',r=>r.rows[0].newReferenceLocations=[]],['changed actual graph use',r=>r.rows[0].referenceLocations=['invented#/reference']],['missing actual provision',r=>r.rows[0].relevantProvisions=[]],['missing method',r=>r.rows[0].method=''],['unresolved terminal source outcome',r=>r.rows[0].outcome='pending-review'],['duplicate native source',r=>r.rows.push(structuredClone(r.rows[0]))],['original review date silently changed',r=>r.rows[0].originalCheckedOn='2026-10-28'],['commencement decree confused with amendment effect',r=>r.reformAssessment.amendmentEffectiveFrom='2025-09-16'],['missing actual positive procedure',r=>r.pathUseAssessments.pop()]
 ]){const r=structuredClone(report);mutate(r);assert.throws(()=>validate(r),undefined,name);outcomes.push({test:name,rejected:true})}
 const d=collectDescriptors(report)[0];assert.ok(d);
 await assert.rejects(()=>verifyDescriptors(root,[d,{...d,byteLength:d.byteLength+1}]));outcomes.push({test:'conflicting evidence byte length',rejected:true});
 await assert.rejects(()=>verifyDescriptors(root,[{...d,sha256:'0'.repeat(64)}]));outcomes.push({test:'changed evidence bytes/hash',rejected:true});
 return{positivePartitionChecks:1,negativeTests:outcomes.length,allPassed:true,readOnly:true,rootGovernanceTestsUnchanged:true,outcomes};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const r=JSON.parse(await fs.readFile(path.join(root,'outputs/r10-a2-2026-10-28/ap23m1-vd/review.json'))),i=JSON.parse(await fs.readFile(path.join(root,'outputs/r10-a1-2026-10-28/sources/source-inventory.json')));console.log(JSON.stringify(await runVdReviewTests(r,i),null,2))}
