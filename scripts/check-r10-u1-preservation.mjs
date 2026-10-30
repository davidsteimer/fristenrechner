// SPDX-License-Identifier: AGPL-3.0-only
// Read-only check of the one-time R10-U1 boundary. Never refresh historical proofs.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance} from './archive-ap23m3-acceptance.mjs';
import {preparationConfig,exact,walk,checkedPath,sha256,isAllowedNew} from './prepare-r10-u1.mjs';
export const preservationConfig=Object.freeze({
 guardPath:preparationConfig.output+'/protected-inputs.json',guardSha256:'a050db42c1357b330569adc690dabfaec15b98af85a116bb90084444b8a9c65c',
 protectedCount:13743,mutableCount:9,livingCount:8,head:preparationConfig.head,
 livingPaths:preparationConfig.living,treePaths:preparationConfig.trees,mutableAllowed:preparationConfig.mutableExisting,
 generatedCopies:preparationConfig.generatedCopies,allowedNew:preparationConfig.allowedNew,localPublicEntry:preparationConfig.localPublicEntry,
 archiveFiles:1538,archiveSha256:preparationConfig.receiptSha256,
 previousGuard:{path:preparationConfig.previousGuard,sha256:preparationConfig.previousGuardSha256,protectedCount:11540},
 previousProof:{path:preparationConfig.proof,sha256:preparationConfig.proofSha256,bindingCount:1537}
});
export async function checkPreservation({root=process.cwd(),config=preservationConfig,verifyArchive=archiveAcceptance,
 readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
 root=resolve(root);const raw=await exact(root,config.guardPath,config.guardSha256),guard=JSON.parse(raw);
 assert.equal(guard.workPackage,'R10-U1');assert.equal(guard.createdOn,'2026-10-28');assert.equal(guard.capturedBeforeProductChanges,true);assert.equal(guard.capturedBeforeLivingUpdates,true);
 assert.equal(guard.userStatement,preparationConfig.statement);assert.equal(guard.m3HumanAcceptanceRecordedSeparately,true);assert.equal(guard.head,config.head);
 assert.equal(Object.keys(guard.files).length,config.protectedCount);assert.equal(Object.keys(guard.mutableBefore).length,config.mutableCount);assert.equal(Object.keys(guard.livingAtStart).length,config.livingCount);
 assert.deepEqual(Object.keys(guard.mutableBefore).sort(),[...config.mutableAllowed].sort());assert.deepEqual(Object.keys(guard.livingAtStart).sort(),[...config.livingPaths].sort());
 assert.deepEqual(Object.keys(guard.treeFiles).sort(),[...config.treePaths].sort());assert.deepEqual(guard.mutableAllowed,config.mutableAllowed);assert.deepEqual(guard.generatedCopies,config.generatedCopies);
 assert.deepEqual(guard.allowedNew,config.allowedNew);assert.deepEqual(guard.localPublicEntry,config.localPublicEntry);assert.deepEqual(guard.previousGuard,config.previousGuard);assert.deepEqual(guard.previousProof,config.previousProof);
 for(const key of['sourceReleaseApproved','operatingChangesAuthorized','commitPermission','sourcePushPermission','coreRulesChanged','dataPromotionAuthorized','contractVersionChangeAuthorized'])assert.equal(guard[key],false,'Follow-up boundary '+key);
 assert.equal(guard.scope,preparationConfig.excluded);
 assert.deepEqual(guard.authorisedLocalChanges,['R10-H01 Format-17 social UI connection','T06-H01 own SPFx source row layout','B11-H01 provenance boundary wording']);
 for(const[path,hash]of Object.entries(guard.files)){assert.equal(Object.hasOwn(guard.mutableBefore,path),false,'Immutable/mutable overlap');assert.equal(Object.hasOwn(guard.livingAtStart,path),false,'Immutable/living overlap');await exact(root,path,hash);}
 const mutableStatus=[];for(const[path,before]of Object.entries(guard.mutableBefore)){assert.equal(Object.hasOwn(guard.livingAtStart,path),false,'Mutable/living overlap');const current=sha256(await exact(root,path));mutableStatus.push({path,before,current,changed:before!==current});}
 const copies=[];for(const copy of config.generatedCopies){assert.ok(Object.hasOwn(guard.mutableBefore,copy.path)&&Object.hasOwn(guard.mutableBefore,copy.source),'Only declared mutable UI copies');
  const actual=await exact(root,copy.path),source=await exact(root,copy.source);assert.deepEqual(actual,source,'Generated UI differs from exact source '+copy.path);copies.push({...copy,byteLength:actual.length,sha256:sha256(actual)});}
 const additions=[];for(const directory of config.treePaths){const old=guard.treeFiles[directory];assert.equal(new Set(old).size,old.length,'Unique original tree');
  for(const path of old){assert.ok(path.startsWith(directory+'/'));assert.ok(Object.hasOwn(guard.files,path)||Object.hasOwn(guard.mutableBefore,path),'Unbound original input '+path);}
  const current=await walk(root,directory),fresh=current.filter(path=>!old.includes(path));for(const path of fresh)assert.ok(isAllowedNew(path,config.allowedNew),'Unapproved new follow-up file '+path);
  assert.deepEqual(current.filter(path=>!fresh.includes(path)),old,'Original tree file removed');additions.push(...fresh);}
 const livingStatus=[];for(const[path,before]of Object.entries(guard.livingAtStart)){const current=sha256(await exact(root,path));livingStatus.push({path,before,current,changed:before!==current});}
 assert.equal(await readHead(root),guard.head,'Git HEAD changed');
 const archive=await verifyArchive({root});assert.equal(archive.mode,'archive-reverified');assert.equal(archive.files,config.archiveFiles);assert.equal(archive.receiptSha256,config.archiveSha256);assert.equal(archive.receiptSha256,guard.acceptedM3Archive.receiptSha256);
 return{workPackage:'R10-U1',status:'narrow-follow-up-baseline-preserved',head:guard.head,inventorySha256:sha256(raw),protectedFilesVerified:config.protectedCount,
  intendedMutableInputs:mutableStatus,livingStatus,newFollowUpFiles:additions.sort(),generatedUiCopiesVerified:copies,acceptedM3Archive:archive,
  nativeReadersPreserved:true,calculationRulesPreserved:true,schemasPreserved:true,legalDataPreserved:true,historicalTestsPreserved:true,historicalEvidencePreserved:true,
  commonStylesheetPreserved:true,sourceReleaseApproved:false,commitCreated:false,sourcePushPerformed:false,installationPerformed:false,operatingChanges:false,
  note:'Only the four named UI/SCSS sources, three exact generated UI copies and two technical build helpers may change. The one new public entry is local/reference-only by its separate tests. All prior M3 proof and autonomous archive bytes remain immutable.'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.ok(process.argv.slice(2).every(arg=>arg==='--write'),'Only optional --write');const report=await checkPreservation();
 if(process.argv.includes('--write')){const path=preparationConfig.output+'/preservation-verification.json';await checkedPath(process.cwd(),path,{missing:true});await writeFile(path,JSON.stringify(report,null,2)+'\n');}
 console.log(JSON.stringify(report,null,2));
}

