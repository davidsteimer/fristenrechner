// SPDX-License-Identifier: AGPL-3.0-only
// Verify the immutable I2 start inventory, never refresh it.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance} from './archive-ap23i1-acceptance.mjs';
import {checkedPath,exact,walk,sha256,preparationConfig,isAllowedNew} from './prepare-ap23i2.mjs';
export const preservationConfig=Object.freeze({
  guardPath:preparationConfig.output+'/protected-inputs.json',guardSha256:'505dc81ed8da0e3ca3e03da7570154b90249ba5d0a9ea94b3342496d2ccb6427',
  protectedCount:2759,head:preparationConfig.head,livingPaths:preparationConfig.living,treePaths:preparationConfig.trees,
  allowedNew:preparationConfig.allowedNew,additionalProtected:preparationConfig.additionalProtected,
  archiveFiles:preparationConfig.archiveFiles,archiveSha256:preparationConfig.receiptSha256,
  originalI1:{proof:preparationConfig.i1Proof,proofSha256:preparationConfig.i1ProofSha256,guard:preparationConfig.i1Guard,guardSha256:preparationConfig.i1GuardSha256,protectedCount:preparationConfig.i1ProtectedCount},
  userDocument:{path:preparationConfig.userDocument,sha256:preparationConfig.userDocumentSha256},
  composition:{previousProtected:2496,currentAcceptedI1:126,archivedI1Payload:133,archivedI1Receipt:1,additionalGovernance:3,existingTreeFiles:1167}
});
export async function checkPreservation({root=process.cwd(),config=preservationConfig,verifyArchive=archiveAcceptance,
  readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
  root=resolve(root);const raw=await exact(root,config.guardPath,config.guardSha256),guard=JSON.parse(raw);
  assert.equal(guard.workPackage,'AP23I2');assert.equal(guard.capturedBeforeTechnicalPlanning,true);assert.equal(guard.capturedBeforeLivingUpdates,true);
  assert.equal(guard.i1ProfessionallyAccepted,true);assert.equal(guard.acceptedBy,'David Steimer');assert.equal(guard.technicalPlanningStarted,true);
  assert.deepEqual(guard.acceptedDecisionPoints,preparationConfig.acceptedDecisionPoints);assert.equal(guard.userStartStatement,preparationConfig.userStartStatement);
  for(const key of['formatDecision','productCodeChangePermission','runtimeActivation','sourceReleaseApproved','releaseBuildPerformed','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(guard[key],false,'I2 boundary '+key);
  assert.equal(guard.head,config.head);assert.equal(Object.keys(guard.files).length,config.protectedCount);assert.deepEqual(guard.composition,config.composition);
  assert.deepEqual(guard.originalI1,config.originalI1);assert.deepEqual(guard.userDocument,config.userDocument);
  for(const[path,hash]of[[config.originalI1.proof,config.originalI1.proofSha256],[config.originalI1.guard,config.originalI1.guardSha256],[config.userDocument.path,config.userDocument.sha256]])assert.equal(guard.files[path],hash,'Original binding changed');
  assert.deepEqual(Object.keys(guard.livingAtStart).sort(),[...config.livingPaths].sort(),'Living exception set changed');
  assert.deepEqual(Object.keys(guard.treeFiles).sort(),[...config.treePaths].sort(),'Protected tree set changed');
  assert.deepEqual(guard.allowedNew,config.allowedNew,'Isolated addition scope changed');assert.deepEqual(guard.additionalProtected,config.additionalProtected,'Governance protection changed');
  for(const path of config.livingPaths)assert.equal(guard.files[path],undefined,'Living input cannot also be immutable');
  for(const path of config.additionalProtected)assert.ok(Object.hasOwn(guard.files,path),'Governance file not protected');
  for(const[path,hash]of Object.entries(guard.files)){assert.match(hash,/^[a-f0-9]{64}$/u);await exact(root,path,hash);}
  const additions=[];let treeCount=0;
  for(const directory of config.treePaths){
    const original=guard.treeFiles[directory];assert.ok(Array.isArray(original));assert.equal(new Set(original).size,original.length);
    for(const path of original){assert.ok(path.startsWith(directory+'/'));assert.ok(Object.hasOwn(guard.files,path),'Tree file absent from immutable inventory');}
    const current=await walk(root,directory),fresh=current.filter(path=>!original.includes(path));
    for(const path of fresh)assert.ok(isAllowedNew(path,config.allowedNew),'Unapproved source/schema/data/test addition: '+path);
    assert.deepEqual(current.filter(path=>!fresh.includes(path)),original,'Existing source/schema/data/test file removed');
    additions.push(...fresh);treeCount+=original.length;
  }
  assert.equal(treeCount,guard.composition.existingTreeFiles);
  const head=await readHead(root);assert.equal(head,guard.head,'Git head changed');
  const archive=await verifyArchive({root});assert.equal(archive.verified,true);assert.equal(archive.mode,'archive-reverified');assert.equal(archive.files,config.archiveFiles);
  assert.equal(archive.receiptSha256,config.archiveSha256);assert.equal(archive.receiptSha256,guard.acceptedI1Archive.receiptSha256);
  const livingStatus=[];for(const[path,atStart]of Object.entries(guard.livingAtStart)){const current=sha256(await exact(root,path));livingStatus.push({path,atStart,current,changed:current!==atStart});}
  return{workPackage:'AP23I2',status:'technical-planning-inputs-preserved',gitHead:head,protectedInputSha256:sha256(raw),
    protectedFilesVerified:Object.keys(guard.files).length,composition:guard.composition,acceptedI1Archive:archive,livingStatus,
    isolatedSchemaCandidateAdditions:additions.filter(path=>path.startsWith(config.allowedNew.schemaPrefix)).sort(),
    isolatedGovernanceTestAdditions:additions.filter(path=>!path.startsWith(config.allowedNew.schemaPrefix)).sort(),
    productCodeChanged:false,nativeSchemasChanged:false,acceptedLegalDataChanged:false,existingTestsChanged:false,
    acceptedI1ResearchChanged:false,historicalEvidenceChanged:false,userDocumentChanged:false,formatDecision:false,
    sourceReleaseApproved:false,runtimeActivation:false,releaseBuildPerformed:false,commitCreated:false,sourcePushPerformed:false,operatingChanges:false,
    note:'All original I2 start bindings remain immutable. Seven living status texts are separate. Only newly created isolated I2 schema candidates and I2 governance-test files are allowed in otherwise protected source trees. No runtime schema, product integration, release or operating permission follows.'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(arg=>arg==='--write'),'Only the optional --write report flag is supported');
  const report=await checkPreservation();if(process.argv.includes('--write')){const path=preparationConfig.output+'/preservation-verification.json';await checkedPath(process.cwd(),path,{missing:true});await writeFile(path,JSON.stringify(report,null,2)+'\n');}
  console.log(JSON.stringify(report,null,2));
}
