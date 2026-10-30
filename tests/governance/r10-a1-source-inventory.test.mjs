// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {inventoryPaths,loadR10A1InventoryInputs,assembleR10A1SourceInventory,writeR10A1Inventory,checkR10A1Inventory,safeRelative} from '../../scripts/inventory-r10-a1-sources.mjs';
const inputs=loadR10A1InventoryInputs(),inventory=assembleR10A1SourceInventory(inputs);
const admin=i=>i.candidate.documents.find(r=>r.value.dataKind==='administrativeProcedureCatalog').value;
const catalog=i=>i.candidate.documents.find(r=>r.value.dataKind==='holidayCatalog').value;
const altered=mutate=>{const copy=structuredClone(inputs);mutate(copy,admin(copy),catalog(copy));return()=>assembleR10A1SourceInventory(copy);};
test('actual Format17 inventory contains all380 canonical IDs and distinguishes130 definitions from129 new IDs',()=>{
 assert.equal(inventory.counts.candidateManifest,258);assert.equal(inventory.counts.priorManifest,128);assert.equal(inventory.counts.allCanonicalSourceIds,380);assert.equal(inventory.counts.priorReviewedSources,251);
 assert.equal(inventory.counts.newCanonicalSourceIds,129);assert.equal(inventory.counts.newRuntimeSourceDefinitions,130);assert.equal(inventory.counts.historicalCatalog,84);assert.equal(inventory.counts.activationEvidence,159);assert.equal(inventory.counts.priorActivationEvidence,157);assert.equal(inventory.counts.newActivationEvidence,2);
 assert.equal(inventory.counts.existingCanonicalIdsNewlyDefinedAtRuntime,1);assert.deepEqual(inventory.groups.newRuntimeDefinitionsOfPreviouslyKnownSources,['SRC-ZH-RLG-8224-N045']);
 assert.deepEqual(inventory.counts.newCanonicalKinds,{judgment:26,statute:93,officialMaterials:10});
 assert.deepEqual(inventory.counts.referenceUses,{'positive-or-shared-reference':266,'exclusion-only':4,'supporting-or-monitoring-unreferenced':110});
 assert.equal(inventory.counts.governanceRegister,255);assert.equal(inventory.counts.missingFromRegister,129);assert.equal(inventory.counts.historicalRegisterOnly,4);
});
test('all2136 literal prior source edges are retained with exact pointers and2909 additions',()=>{
 assert.equal(inventory.referenceGraph.length,5045);assert.equal(inventory.priorReferenceGraph.length,2136);assert.equal(inventory.addedReferenceGraph.length,2909);assert.equal(inventory.counts.changedPriorEdges,0);assert.equal(inventory.counts.removedPriorEdges,0);
 const at=new Map(inventory.referenceGraph.map(r=>[r.documentPath+'#'+r.jsonPath,r]));for(const row of inventory.priorReferenceGraph)assert.deepEqual(at.get(row.documentPath+'#'+row.jsonPath),row);
 assert.deepEqual([...new Set(inventory.addedReferenceGraph.map(r=>r.documentPath))].sort(),['administrative-procedures/ch-cantonal-administrative-procedures.json','calendars/ap23f2-zh-rlg-nine.json','calendars/ap23h2-nw-procedural-core.json','calendars/ap23h2-ow-procedural-core.json','holiday-catalogs/ch-holiday-catalog.json']);
});
test('713 workbook provenance edges stay separate and never activate a runtime use',()=>{
 assert.equal(inventory.historicalCatalogProvenanceGraph.length,713);assert.ok(inventory.historicalCatalogProvenanceGraph.every(r=>r.runtimeActivation===false&&r.kind==='historicalCatalogProvenance'));
 for(const key of['scopes','rules','assignments','reviews'])assert.ok(inventory.historicalCatalogProvenanceGraph.some(r=>r.jsonPath.startsWith('/data/'+key+'/')));
});
test('two existing IDs with new uses are compulsory deltas, not hidden in prior approval',()=>{
 assert.deepEqual(inventory.groups.existingSourceIdsWithNewUses,['SRC-BUNDESFEIERTAG-19940701','SRC-ZH-RLG-8224-N045']);assert.equal(inventory.crossCuttingNewUseAssessments.length,2);
 for(const delta of inventory.crossCuttingNewUseAssessments){const row=inventory.rows.find(r=>r.sourceId===delta.sourceId);assert.ok(row.newReferenceLocations.length>0);assert.equal(row.origin,'priorMVP09');assert.equal(row.proposedReviewTreatment,'assessNewUseOfExistingSourceAndCurrentVersion');assert.equal(delta.requiresExplicitNewUseDecision,true);assert.equal(delta.notAnAdditionalOwnerLot,true);assert.equal(delta.ownerLotId,row.ownerLotId);}
});
test('all1223 original pool paths and431105954 bytes are hash checked and not called new legal checks',()=>{
 assert.equal(inventory.counts.boundHistoricalEvidenceFiles,1223);assert.equal(inventory.counts.boundHistoricalEvidenceBytes,431105954);
 assert.deepEqual(inventory.counts.boundHistoricalEvidenceByGroup,{MVP09:784,AP23F1:16,AP23G1:32,AP23H1:39,AP23I1:99,AP23J1:66,AP23K1:92,AP23L1:31,AP23M1:64});
 assert.equal(new Set(inventory.historicalEvidenceBindings.map(r=>r.path)).size,1223);assert.equal(inventory.newOnlineRetrievals,0);assert.equal(inventory.counts.freshOfficialChecks,0);assert.equal(inventory.freshLegalVerificationPerformed,false);
 for(const row of inventory.historicalEvidenceBindings)assert.deepEqual(inputs.bindings.find(r=>r.path===row.path),row);
});
test('all129 newly named sources retain originating tranche and bound historical URL associations',()=>{
 const newRows=inventory.rows.filter(r=>r.origin==='newTrancheSource');assert.equal(newRows.length,129);
 for(const row of newRows){assert.equal(row.historicalTrancheAssessments.length,1,row.sourceId);assert.ok(row.historicalUrlAssociatedEvidence.length>0,row.sourceId);assert.equal(row.freshEvidence.length,0);assert.equal(row.freshLegalReviewStatus,'pending');for(const occurrence of row.historicalUrlAssociatedEvidence){assert.ok(occurrence.evidence.length>0);assert.ok(occurrence.association.includes('historical'));}}
 assert.deepEqual(inventory.counts.newCanonicalByTranche,{AP23G1:11,AP23I1:11,AP23J1:19,AP23K1:27,AP23L1:17,AP23M1:19,AP23F1:15,AP23H1:10});
 const ne=newRows.find(r=>r.sourceId==='SRC-M1-NE-LPA');assert.deepEqual(ne.declaredProductReviewedOn,['2026-10-28']);assert.equal(ne.historicalTrancheAssessments[0].originalReportDate,'2026-10-27');
});
test('exact URL overlaps remain identity candidates without source-ID merging or legal equivalence',()=>{
 const row=inventory.rows.find(r=>r.sourceId==='SRC-M1-NE-LDJF');assert.ok(row.relatedPriorExactUrlCandidates.length>0);
 for(const candidate of row.relatedPriorExactUrlCandidates){assert.equal(candidate.identityConfirmed,false);assert.ok(candidate.exactMatchingUrls.length>0);assert.ok(inventory.rows.some(r=>r.sourceId===candidate.sourceId));}
 assert.equal(new Set(inventory.rows.map(r=>r.sourceId)).size,380);
});
test('twelve owner lots partition all380 IDs once with verified77/73/82/19 and tranche populations',()=>{
 assert.deepEqual(inventory.reviewLots.map(r=>r.count),[77,73,82,19,15,11,10,11,19,27,17,19]);assert.equal(inventory.reviewLots.length,12);
 const owned=inventory.reviewLots.flatMap(r=>r.sourceIds);assert.equal(owned.length,380);assert.equal(new Set(owned).size,380);assert.deepEqual(owned.slice().sort(),inventory.rows.map(r=>r.sourceId).sort());
 for(const lot of inventory.reviewLots){assert.equal(lot.status,'planned-not-reviewed');assert.equal(lot.parallelEssentialWorkPackages,1);assert.equal(lot.maySplitForFiveNetDayLimit,true);assert.equal(lot.netDurationPromise,null);assert.ok(lot.neededChecks.length>=5);for(const id of lot.sourceIds)assert.equal(inventory.rows.find(r=>r.sourceId===id).ownerLotId,lot.id);}
});
test('all245 source gates remain candidate and25 prior path definitions stay intact',()=>{
 assert.equal(inventory.counts.administrativePaths,245);assert.equal(inventory.counts.preservedAdministrativePaths,25);assert.equal(inventory.counts.newAdministrativePaths,220);
 assert.equal(inventory.administrativeSourceEligibility.runtimeActive,false);assert.equal(inventory.administrativeSourceEligibility.approval,null);assert.equal(inventory.administrativeSourceEligibility.sourceReviewRef,null);
 assert.ok(inventory.administrativeSourceEligibility.pathEligibility.every(r=>r.status==='candidate'&&r.sourceReviewRef===null));
 for(const row of inventory.rows){assert.equal(row.humanApproval,false);assert.equal(row.sourceReleaseApproved,false);assert.equal(row.reviewNeeds.currentVersionAndFutureChanges,'pending');}
});
test('old source metadata, source edges and path definitions cannot silently change',()=>{
 assert.throws(altered((i,a)=>{a.sources[0].locators='invented';}),/Prior source metadata changed/);
 assert.throws(altered((i,a)=>{a.paths[0].sourceRefs.pop();}),/Existing reference graph changed|Prior path definition changed/);
 assert.throws(altered(i=>{i.prior.documents[0].value.rules[0].sourceRefs.pop();}),/MVP09 actual graph differs/);
});
test('missing, duplicate, unknown sources or incomplete prior coverage fail closed',()=>{
 assert.throws(altered((i,a)=>{a.sources.pop();}),/Manifest source summary differs/);
 assert.throws(altered((i,a)=>{a.sources.push(a.sources[0]);}),/duplicate ID/);
 assert.throws(altered(i=>{i.priorReview.coverage.pop();}),/Prior coverage incomplete/);
 assert.throws(altered((i,a)=>{a.paths[0].sourceRefs[0].sourceId='UNKNOWN';}),/Unknown source reference/);
});
test('historical data and evidence mapping cannot be revised and old activation rows cannot be removed',()=>{
 assert.throws(altered((i,a,c)=>{c.data.rules[0].locator='invented';}),/Historical catalog changed/);
 assert.throws(altered((i,a,c)=>{c.activation.sourceEvidence.shift();}),/Historical activation evidence changed/);
 assert.throws(altered((i,a,c)=>{c.activation.sourceIdMap.shift();}),/Prior canonical mapping changed/);
 assert.throws(altered((i,a,c)=>{c.activation.sourceIdMap.at(-1).sourceId='invented';}),/Noncanonical mapping/);
});
test('unpromoted candidate, pending path gates and source roles remain mandatory',()=>{
 assert.throws(altered(i=>{i.candidate.manifest.releaseStatus='approved';}),/Only unpromoted candidate/);
 assert.throws(altered((i,a)=>{a.releaseBinding.sourceReviewRef={invented:true};}));
 assert.throws(altered((i,a)=>{a.releaseBinding.pathEligibility[0].status='approved';}));
 assert.throws(altered((i,a)=>{a.releaseBinding.pathEligibility.pop();}),/Incomplete path eligibility/);
});
test('unrecognised owner classification or missing tranche cannot silently leave a source unowned',()=>{
 assert.throws(altered(i=>{i.priorReview.coverage.find(r=>r.reviewGroup==='baseline').reviewGroup='invented';}),/Unknown prior review group/);
 assert.throws(altered(i=>{i.priorCalendarReview.rows.pop();}),/Calendar review ownership mismatch/);
 assert.throws(altered(i=>{i.priorCalendarReview.rows[0].reviewGroup='invented';}),/Unknown calendar subgroup/);
 assert.throws(altered(i=>{i.tranches.pop();}),/Missing tranche assessment/);
});
test('assembly is deterministic and leaves all input structures unchanged',()=>{
 const before=structuredClone(inputs);assert.deepEqual(assembleR10A1SourceInventory(inputs),inventory);assert.deepEqual(inputs,before);
});
test('unsafe, absolute, control-character and parent paths are rejected',()=>{
 for(const p of['../outside','/tmp/outside','safe/../outside','safe\\outside','safe//outside','safe/./file','C:/outside','safe\nfile','safe\0file'])assert.throws(()=>safeRelative(p),/Unsafe relative path/);
 for(const p of['docs/fachrecht/a.json','.work/sources/épreuve.pdf'])assert.equal(safeRelative(p),p);
});
test('exclusive writer cannot grant approval, ignore changed inputs or overwrite an existing inventory',()=>{
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'r10-a1-inventory-'));
 try{const bytes=Buffer.from('synthetic evidence\n');fs.writeFileSync(path.join(temporary,'evidence.json'),bytes,{flag:'wx'});const copy=structuredClone(inventory);copy.evidenceBindings=[{path:'evidence.json',byteLength:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}];
  const changed=structuredClone(copy);changed.evidenceBindings[0].sha256='0'.repeat(64);assert.throws(()=>writeR10A1Inventory(changed,temporary),/Input changed before write/);
  for(const flag of['humanApproval','sourceReleaseApproved','dataPromotionApproved','publicationApproved','freshLegalVerificationPerformed','completeReleaseReview']){const promoted=structuredClone(copy);promoted[flag]=true;assert.throws(()=>writeR10A1Inventory(promoted,temporary),/Preparation status/);}
  const promoted=structuredClone(copy);promoted.newOnlineRetrievals=1;assert.throws(()=>writeR10A1Inventory(promoted,temporary));
  const result=writeR10A1Inventory(copy,temporary);assert.equal(result.path,inventoryPaths.output);assert.deepEqual(checkR10A1Inventory(copy,temporary),result);const saved=fs.readFileSync(path.join(temporary,result.path));assert.throws(()=>writeR10A1Inventory(copy,temporary),{code:'EEXIST'});assert.deepEqual(fs.readFileSync(path.join(temporary,result.path)),saved);
  copy.counts.candidateManifest=999;assert.throws(()=>checkR10A1Inventory(copy,temporary),/Saved source inventory/);
 }finally{fs.rmSync(temporary,{recursive:true});}
});
