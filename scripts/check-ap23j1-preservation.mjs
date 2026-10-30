// SPDX-License-Identifier: AGPL-3.0-only
// Check the immutable J1 starting point. Never recreate or refresh the inventory.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance} from './archive-ap23i3-acceptance.mjs';
import {checkedPath,exact,researchConfig,sha256,walk} from './prepare-ap23j1.mjs';
export const preservationConfig=Object.freeze({
  guardPath:researchConfig.output+'/protected-inputs.json',
  guardSha256:'da637412885f4fb3fc0a5655b81763f986e1c33c5ed71ab28be0c01db02b1bab',
  protectedCount:4214,head:researchConfig.head,livingPaths:researchConfig.living,treePaths:researchConfig.trees,
  researchTests:researchConfig.allowedNewResearchTests,archiveFiles:822,archiveSha256:researchConfig.receiptSha256,
  preparation:researchConfig.preparation,preparationSha256:'4d4628d767824a0073727f41146a5b0368f121ce7dc76ea9735745d0e10a728f',
  proposal:researchConfig.proposal,proposalSha256:'47a568d2ea9cafa7308b4630d22a5b2901cb6dbb575416aefb8521452b754662',
  userDocument:researchConfig.userDocument,userDocumentSha256:researchConfig.userDocumentSha256,
  composition:{historicalProtected:2839,currentAcceptedI3:815,archivedI3Payload:822,archivedI3Receipt:1,originalPreparation:8,existingTreeFiles:1263}
});
export async function checkPreservation({root=process.cwd(),config=preservationConfig,verifyArchive=archiveAcceptance,
  readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
  root=resolve(root);const raw=await exact(root,config.guardPath,config.guardSha256),guard=JSON.parse(raw);
  assert.equal(guard.workPackage,'AP23J1');assert.equal(guard.capturedBeforeResearch,true);assert.equal(guard.capturedBeforeLivingUpdates,true);
  assert.equal(guard.scopeConfirmedBy,'David Steimer');assert.equal(guard.userStartStatement,researchConfig.userStartStatement);
  for(const key of['productCodeChangePermission','sourceReleaseApproved','operatingChanges'])assert.equal(guard[key],false,key);
  assert.equal(guard.head,config.head);assert.equal(Object.keys(guard.files).length,config.protectedCount);
  assert.deepEqual(guard.composition,config.composition,'Protected composition changed');
  assert.deepEqual(Object.keys(guard.livingAtStart).sort(),[...config.livingPaths].sort(),'Living exceptions changed');
  assert.deepEqual(guard.allowedNewResearchTests,[...config.researchTests],'Research test exceptions changed');
  assert.deepEqual(Object.keys(guard.treeFiles).sort(),[...config.treePaths].sort(),'Protected tree set changed');
  for(const path of config.livingPaths)assert.equal(guard.files[path],undefined,'Living file marked immutable');
  assert.equal(guard.originalPreparation.path,config.preparation);assert.equal(guard.originalPreparation.sha256,config.preparationSha256);
  assert.equal(guard.originalPreparation.proposal,config.proposal);assert.equal(guard.originalPreparation.proposalSha256,config.proposalSha256);
  assert.equal(guard.files[config.preparation],config.preparationSha256);assert.equal(guard.files[config.proposal],config.proposalSha256);
  assert.deepEqual(guard.userDocument,{path:config.userDocument,sha256:config.userDocumentSha256});
  assert.equal(guard.files[config.userDocument],config.userDocumentSha256);
  for(const[path,expected]of Object.entries(guard.files)){assert.match(expected,/^[a-f0-9]{64}$/u);await exact(root,path,expected);}
  let treeCount=0;const researchTestAdditions=[];
  for(const directory of config.treePaths){
    const original=guard.treeFiles[directory];assert.ok(Array.isArray(original));assert.equal(new Set(original).size,original.length);
    for(const path of original){assert.ok(path.startsWith(directory+'/'));assert.ok(Object.hasOwn(guard.files,path));}
    const current=await walk(root,directory);
    researchTestAdditions.push(...current.filter(path=>config.researchTests.includes(path)&&!original.includes(path)));
    assert.deepEqual(current.filter(path=>!config.researchTests.includes(path)),original,'Unexpected product/source/test tree change '+directory);
    treeCount+=original.length;
  }
  assert.equal(treeCount,guard.composition.existingTreeFiles);
  const head=await readHead(root);assert.equal(head,guard.head,'Git head changed');
  const archive=await verifyArchive({root});assert.equal(archive.mode,'archive-reverified');assert.equal(archive.verified,true);
  assert.equal(archive.files,config.archiveFiles);assert.equal(archive.receiptSha256,config.archiveSha256);
  assert.equal(archive.receiptSha256,guard.acceptedI3Archive.receiptSha256);
  const livingStatus=[];
  for(const[path,atStart]of Object.entries(guard.livingAtStart)){
    const current=sha256(await exact(root,path));livingStatus.push({path,atStart,current,changed:atStart!==current});
  }
  return{workPackage:'AP23J1',status:'research-inputs-preserved',gitHead:head,protectedInputSha256:sha256(raw),
    protectedFilesVerified:Object.keys(guard.files).length,composition:guard.composition,acceptedI3Archive:archive,
    livingStatus,researchTestAdditions:[...new Set(researchTestAdditions)].sort(),productCodeChanged:false,
    acceptedLegalDataChanged:false,schemasChanged:false,existingTestsChanged:false,originalPreparationChanged:false,
    i3HistoricalEvidenceChanged:false,userDocumentChanged:false,commitCreated:false,sourcePushPerformed:false,operatingChanges:false,
    note:'The frozen J1 inventory, original preparation, I3 evidence, archive, accepted legal data and product trees are unchanged. Exactly seven living status texts and two J1-only research tests are separate.'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(value=>value==='--write'),'Only --write is supported');const report=await checkPreservation();
  if(process.argv.includes('--write')){const path=researchConfig.output+'/preservation-verification.json';
    await checkedPath(process.cwd(),path,{missing:true});await writeFile(path,JSON.stringify(report,null,2)+'\n');}
  console.log(JSON.stringify(report,null,2));
}
