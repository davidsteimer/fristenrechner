// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import {loadApprovalInputs} from '../../scripts/record-mvp10-source-approval.mjs';
import {newRegisterSource,explicitSourceImpacts,componentKeys} from '../../scripts/prepare-mvp10-source-reviews.mjs';
const{inventory,plan,report}=await loadApprovalInputs(),count=(rows,key)=>rows.reduce((a,r)=>(a[r[key]]=(a[r[key]]??0)+1,a),{});
test('exact 380 canonical identities and 129 explicit additions do not collapse 131 physical records',()=>{
 assert.equal(inventory.rows.length,380);assert.equal(plan.rows.length,129);assert.equal(new Set(plan.rows.map(r=>r.sourceId)).size,129);assert.equal(plan.counts.sourceRecordOccurrences,131);
 assert.deepEqual(count(plan.rows,'inventoryKind'),{judgment:26,statute:93,officialMaterials:10});assert.deepEqual(count(plan.rows,'targetSourceType'),{caseLaw:26,statute:84,officialMaterials:10,ordinance:9});assert.deepEqual(count(plan.rows,'usageStatus'),{productive:109,supporting:20});
 assert.equal(plan.rows.find(r=>r.sourceId==='JUD-AP23G1-SH-BGER-2C4832025-20260312').jurisdiction,'CH');assert.equal(plan.rows.find(r=>r.sourceId==='JUD-AP23G1-SH-OGE-4020181K-20180824').jurisdiction,'SH');assert.equal(plan.rows.find(r=>r.sourceId==='SRC-K1-BS-TI-ANCHOR-COUNTERPROBE').jurisdiction,'TI');
});
test('5045 exact edges include 2909 qualified new uses and exclude historical provenance',()=>{
 assert.equal(inventory.referenceGraph.length,5045);assert.equal(inventory.addedReferenceGraph.length,2909);assert.equal(inventory.priorReferenceGraph.length,2136);assert.equal(inventory.historicalCatalogProvenanceGraph.length,713);assert.ok(inventory.historicalCatalogProvenanceGraph.every(r=>r.runtimeActivation===false));assert.equal(report.counts.pendingSourceIds,0);
 const impacts=explicitSourceImpacts(inventory);assert.ok(impacts.get('SRC-AP23B-TI-LPAMM').componentIds.includes('ti-80-30'));assert.ok(impacts.get('SRC-AP23B-TI-LPAMM').componentIds.includes('lpamm-ti'));assert.ok(!impacts.has('SRC-AP22-FR-PRAXIS'));
 for(const k of['pathId','lawId','holidayBindingId','suspensionProfileId','qualificationPolicyId'])assert.ok(componentKeys.includes(k));
});
test('unknown, missing and duplicated edges fail closed',()=>{
 for(const change of[x=>x.referenceGraph.pop(),x=>x.referenceGraph.push(x.referenceGraph[0]),x=>{x.referenceGraph[0].sourceId='UNKNOWN';}]){const value=structuredClone(inventory);change(value);assert.throws(()=>explicitSourceImpacts(value));}
});
test('a mirror cannot become productive, change class, URL or canonical identity in assembly',()=>{
 const p=plan.rows.find(r=>r.sourceId==='JUD-L1-SZ-VGE-III202118'),r=inventory.rows.find(r=>r.sourceId===p.sourceId),review={relevantProvisions:['§157 JG']};
 assert.equal(newRegisterSource(r,p,review).usageStatus,'supporting');
 for(const change of[x=>{x.usageStatus='productive';},x=>{x.sourceId='FOREIGN';},x=>{x.targetSourceType='statute';},x=>{x.nativeUrl+='?invented';},x=>{x.officialUrl='https://www.bger.ch/';},x=>{x.referenceCount=1;},x=>{x.stopRequired=true;}]){const value=structuredClone(p);change(value);assert.throws(()=>newRegisterSource(r,value,review));}
});
test('native HTTP history and actual bound HTTPS MCP retrieval remain separate',()=>{
 const p=plan.rows.find(r=>r.sourceId==='JUD-AP23J1-JU-BGER2D55-2010');assert.ok(p.nativeUrl.startsWith('http://'));assert.equal(p.retrievalUrl,'https://mcp.opencaselaw.ch/entscheid/bger_2D_55_2010');assert.equal(p.officialUrl,null);assert.equal(p.referenceCount,0);assert.equal(p.urlEvidencePointer.pointer,'/canonical_url');assert.equal(p.instrumentIdentity.currentBoundDecisionDate,'2011-03-01');
});
