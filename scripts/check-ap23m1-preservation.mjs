// SPDX-License-Identifier: AGPL-3.0-only
// Verify the exclusive M1 start baseline. Never refresh its hashes.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance} from './archive-ap23l3-acceptance.mjs';
import {checkedPath,exact,researchConfig,sha256,walk,verifyStartSnapshot} from './prepare-ap23m1.mjs';
export const preservationConfig=Object.freeze({
 guardPath:researchConfig.output+'/protected-inputs.json',guardSha256:'51ab033044ec8c0c6424b0d7f5eac17a85c7b01836d5febc3c8ae1770ce8e610',
 protectedCount:11212,head:researchConfig.head,livingPaths:researchConfig.living,treePaths:researchConfig.trees,
 snapshotPath:researchConfig.startSnapshot,originalProofSha256:researchConfig.proofSha256,priorGuardCount:researchConfig.priorGuardCount,
 researchTests:researchConfig.allowedNewResearchTests,researchScripts:researchConfig.allowedNewResearchScripts,
 archiveFiles:1427,archiveSha256:researchConfig.receiptSha256,
 composition:{historicalProtected:9130,currentAcceptedL3:1420,archivedL3Payload:1427,archivedL3Receipt:1,
  startPayload:8,startReceipt:1,originalProposal:1,existingTreeFiles:2035,additionalInputs:7}
});
export async function checkPreservation({root=process.cwd(),config=preservationConfig,verifyArchive=archiveAcceptance,
 readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
 root=resolve(root);const raw=await exact(root,config.guardPath,config.guardSha256),guard=JSON.parse(raw);
 assert.equal(guard.workPackage,'AP23M1');assert.equal(guard.capturedAtResearchStart,true);assert.equal(guard.capturedBeforeLivingUpdates,true);
 assert.equal(guard.scopeConfirmedBy,'David Steimer');assert.equal(guard.userStartStatement,researchConfig.userStartStatement);
 for(const flag of['productCodeChangePermission','sourceReleaseApproved','professionalAcceptance','m2Started','m3Started','operatingChanges'])assert.equal(guard[flag],false,flag);
 assert.equal(guard.head,config.head);assert.equal(Object.keys(guard.files).length,config.protectedCount);assert.deepEqual(guard.composition,config.composition,'Protected composition changed');
 assert.deepEqual(Object.keys(guard.livingAtStart).sort(),[...config.livingPaths].sort(),'Living exceptions changed');
 assert.deepEqual(guard.allowedNewResearchTests,[...config.researchTests],'Research test exceptions changed');
 assert.deepEqual(guard.allowedNewResearchScripts,[...config.researchScripts],'Research script exceptions changed');
 assert.deepEqual(Object.keys(guard.treeFiles).sort(),[...config.treePaths].sort(),'Protected tree set changed');
 assert.equal(guard.originalPreparation.verificationExpected,false,'No earlier verification may be invented');
 for(const path of config.livingPaths)assert.equal(guard.files[path],undefined,'Living file marked immutable');
 for(const item of[{path:guard.originalPreparation.proposal,sha256:guard.originalPreparation.proposalSha256},guard.userDocument,guard.originalL3Proof,guard.previousGuard]){
  assert.ok(item.path&&item.sha256);assert.equal(guard.files[item.path],item.sha256,'Unbound start metadata '+item.path);}
 assert.equal(guard.originalL3Proof.sha256,config.originalProofSha256);assert.equal(guard.previousGuard.protectedFiles,config.priorGuardCount);
 const additions=[...config.researchTests,...config.researchScripts];
 for(const[path,expected]of Object.entries(guard.files)){assert.match(expected,/^[a-f0-9]{64}$/u);await exact(root,path,expected);}
 let treeCount=0;const researchAdditions=[];
 for(const directory of config.treePaths){
  const original=guard.treeFiles[directory];assert.ok(Array.isArray(original));assert.equal(new Set(original).size,original.length);
  for(const path of original){assert.ok(path.startsWith(directory+'/'));assert.ok(Object.hasOwn(guard.files,path));assert.ok(!additions.includes(path));}
  const current=await walk(root,directory);researchAdditions.push(...current.filter(path=>additions.includes(path)&&!original.includes(path)));
  assert.deepEqual(current.filter(path=>!additions.includes(path)),original,'Unexpected product/source/test/script tree change '+directory);treeCount+=original.length;
 }
 assert.equal(treeCount,guard.composition.existingTreeFiles);const head=await readHead(root);assert.equal(head,guard.head,'Git head changed');
 const archive=await verifyArchive({root});assert.equal(archive.mode,'archive-reverified');assert.equal(archive.verified,true);assert.equal(archive.files,config.archiveFiles);
 assert.equal(archive.receiptSha256,config.archiveSha256);assert.equal(archive.receiptSha256,guard.acceptedL3Archive.receiptSha256);
 const snapshot=await verifyStartSnapshot({root,snapshot:config.snapshotPath,expectedSha256:guard.startSnapshot.sha256,
  config:{...researchConfig,proposal:guard.originalPreparation.proposal,living:config.livingPaths}});
 assert.deepEqual(snapshot,guard.startSnapshot,'Original start snapshot changed');
 assert.equal(guard.files[snapshot.path],snapshot.sha256);for(const item of snapshot.artifacts)assert.equal(guard.files[config.snapshotPath+'/'+item.path],item.sha256);
 const livingStatus=[];for(const[path,atStart]of Object.entries(guard.livingAtStart)){const current=sha256(await exact(root,path));livingStatus.push({path,atStart,current,changed:atStart!==current});}
 return{workPackage:'AP23M1',status:'research-inputs-preserved',gitHead:head,protectedInputSha256:sha256(raw),protectedFilesVerified:Object.keys(guard.files).length,
  composition:guard.composition,acceptedL3Archive:archive,startSnapshot:snapshot,livingStatus,researchAdditions:[...new Set(researchAdditions)].sort(),
  productCodeChanged:false,acceptedLegalDataChanged:false,schemasChanged:false,existingTestsChanged:false,originalPreparationChanged:false,
  l3HistoricalEvidenceChanged:false,userDocumentChanged:false,professionalAcceptance:false,m2Started:false,m3Started:false,
  commitCreated:false,sourcePushPerformed:false,operatingChanges:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.ok(process.argv.slice(2).every(value=>value==='--write'),'Only --write is supported');const report=await checkPreservation();
 if(process.argv.includes('--write')){const path=researchConfig.output+'/preservation-verification.json';await checkedPath(process.cwd(),path,{missing:true});await writeFile(path,JSON.stringify(report,null,2)+'\n');}
 console.log(JSON.stringify(report,null,2));
}
