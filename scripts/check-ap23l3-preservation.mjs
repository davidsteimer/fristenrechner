// SPDX-License-Identifier: AGPL-3.0-only
// Immutable L2 history and explicitly bounded native V9 / Format16 integration.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance} from './archive-ap23l2-acceptance.mjs';
import {checkedPath,exact,walk,sha256,preparationConfig,isAllowedNew} from './prepare-ap23l3.mjs';
export const GENERATED_SCHEMA_COPIES=[
 {path:'spfx/src/core/schemas/administrative-procedure-catalog-v9.schema.json',source:'schemas/administrative-procedure-catalog-v9.schema.json'},
 {path:'spfx/src/core/schemas/release-manifest-v16.schema.json',source:'schemas/release-manifest-v16.schema.json'},
 {path:'spfx/src/schemas/administrative-procedure-catalog-v9.schema.json',source:'schemas/administrative-procedure-catalog-v9.schema.json'},
 {path:'spfx/src/schemas/release-manifest-v16.schema.json',source:'schemas/release-manifest-v16.schema.json'},
 {path:'spfx/src/core/schemas/administrative-input-v9.schema.json',source:'schemas/administrative-input-v9.schema.json'},
 {path:'spfx/src/schemas/administrative-input-v9.schema.json',source:'schemas/administrative-input-v9.schema.json'},
 {path:'spfx/src/schemas/implementation/ap23l3/local-reference-manifest-v16.schema.json',source:'schemas/implementation/ap23l3/local-reference-manifest-v16.schema.json'}
];
export const preservationConfig=Object.freeze({
 guardPath:preparationConfig.output+'/protected-inputs.json',guardSha256:'365a023fed55f849a83d44ebd2c4899c0e436bb77abbe2a40d4c4bd5d2912375',
 protectedCount:9130,mutableCount:147,head:preparationConfig.head,livingPaths:preparationConfig.living,treePaths:preparationConfig.trees,
 allowedNew:preparationConfig.allowedNew,mutableAllowed:preparationConfig.mutableExisting,
 generatedPrefix:preparationConfig.generatedMutablePrefix,generatedDerived:preparationConfig.generatedDerived,
 archiveFiles:preparationConfig.archiveFiles,archiveSha256:preparationConfig.receiptSha256,
 previousGuard:{path:preparationConfig.previousGuard,sha256:preparationConfig.previousGuardSha256,protectedCount:preparationConfig.previousProtectedCount},
 previousProof:{path:preparationConfig.proof,sha256:preparationConfig.proofSha256},
 userDocument:{path:preparationConfig.userDocument,sha256:preparationConfig.userDocumentSha256}
});
export async function checkPreservation({root=process.cwd(),config=preservationConfig,verifyArchive=archiveAcceptance,
 readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
 root=resolve(root);const raw=await exact(root,config.guardPath,config.guardSha256),guard=JSON.parse(raw);
 assert.equal(guard.workPackage,'AP23L3');assert.equal(guard.capturedBeforeIntegration,true);assert.equal(guard.capturedBeforeLivingUpdates,true);
 assert.equal(guard.l2TechnicallyAccepted,true);assert.equal(guard.acceptedBy,'David Steimer');assert.equal(guard.userStatement,preparationConfig.statement);
 assert.deepEqual(guard.contractDecision,{id:'DEC-2026-041',status:'approved',on:'2026-10-27'});
 assert.equal(guard.head,config.head);assert.equal(Object.keys(guard.files).length,config.protectedCount);assert.equal(Object.keys(guard.mutableBefore).length,config.mutableCount);
 assert.deepEqual(guard.previousGuard,config.previousGuard);assert.deepEqual(guard.previousProof,config.previousProof);assert.deepEqual(guard.userDocument,config.userDocument);
 for(const key of['sourceReleaseApproved','operatingChangesAuthorized','commitPermission','sourcePushPermission'])assert.equal(guard[key],false,'L3 boundary '+key);
 assert.deepEqual(Object.keys(guard.livingAtStart).sort(),[...config.livingPaths].sort());assert.deepEqual(Object.keys(guard.treeFiles).sort(),[...config.treePaths].sort());
 assert.deepEqual(guard.allowedNew,config.allowedNew);assert.deepEqual(guard.mutableAllowed,config.mutableAllowed);
 assert.equal(guard.generatedMutablePrefix,config.generatedPrefix);assert.deepEqual(guard.generatedDerived,config.generatedDerived);
 const generatedCopies=new Map();
 for(const copy of GENERATED_SCHEMA_COPIES){assert.ok(config.allowedNew.files.includes(copy.path),'Generated schema copy must be predeclared');
  assert.equal(guard.files[copy.path],undefined,'New copy cannot loosen an existing schema');assert.equal(guard.mutableBefore[copy.path],undefined,'Schema copy must be new');generatedCopies.set(copy.path,copy.source);}
 for(const[path,hash]of Object.entries(guard.files)){assert.ok(!Object.hasOwn(guard.mutableBefore,path),'Both immutable and mutable '+path);
  assert.ok(!Object.hasOwn(guard.livingAtStart,path),'Living input cannot be immutable '+path);await exact(root,path,hash);}
 const generatedVerified=[];
 async function verifyProductCopy(path){assert.ok(path.startsWith(config.generatedPrefix),'Not a generated product copy');
  const derived=config.generatedDerived[path],source=derived?.source??'src/'+path.slice(config.generatedPrefix.length);
  assert.ok(Object.hasOwn(guard.files,source)||Object.hasOwn(guard.mutableBefore,source)||isAllowedNew(source,config.allowedNew),'Generated copy has no approved native counterpart '+path);
  const native=await exact(root,source),expected=derived?Buffer.from(derived.prefix+native.toString('utf8')+derived.suffix):native,current=await exact(root,path);
  assert.deepEqual(current,expected,'Generated product copy differs from native source '+path);generatedVerified.push({path,source,derived:Boolean(derived),byteLength:current.length,sha256:sha256(current)});
 }
 const mutableStatus=[];
 for(const[path,before]of Object.entries(guard.mutableBefore)){assert.ok(config.mutableAllowed.includes(path)||path.startsWith(config.generatedPrefix),'Unapproved mutable file '+path);
  assert.ok(!Object.hasOwn(guard.livingAtStart,path),'Living input cannot be product mutable '+path);const current=sha256(await exact(root,path));mutableStatus.push({path,before,current,changed:before!==current});
  if(path.startsWith(config.generatedPrefix))await verifyProductCopy(path);}
 const additions=[];
 for(const directory of config.treePaths){const original=guard.treeFiles[directory];assert.ok(Array.isArray(original));assert.equal(new Set(original).size,original.length);
  for(const path of original){assert.ok(path.startsWith(directory+'/'));assert.ok(Object.hasOwn(guard.files,path)||Object.hasOwn(guard.mutableBefore,path),'Unbound original tree input '+path);}
  const current=await walk(root,directory),fresh=current.filter(path=>!original.includes(path));
  for(const path of fresh){const generated=path.startsWith(config.generatedPrefix),source=generated?'src/'+path.slice(config.generatedPrefix.length):null;
   assert.ok(isAllowedNew(path,config.allowedNew)||generatedCopies.has(path)||generated&&(Object.hasOwn(guard.files,source)||Object.hasOwn(guard.mutableBefore,source)||isAllowedNew(source,config.allowedNew)),'Unapproved integration addition '+path);
   if(generated)await verifyProductCopy(path);}
  assert.deepEqual(current.filter(path=>!fresh.includes(path)),original,'Existing tree file removed');additions.push(...fresh);
 }
 const generatedSchemaCopiesVerified=[];
 for(const path of additions.filter(path=>generatedCopies.has(path))){const source=generatedCopies.get(path),copy=await exact(root,path),native=await exact(root,source);assert.deepEqual(copy,native,'Generated schema differs from native source '+path);generatedSchemaCopiesVerified.push({path,source,byteLength:copy.length,sha256:sha256(copy)});}
 const livingStatus=[];for(const[path,before]of Object.entries(guard.livingAtStart)){const current=sha256(await exact(root,path));livingStatus.push({path,before,current,changed:before!==current});}
 const head=await readHead(root);assert.equal(head,guard.head,'Git HEAD changed');const archive=await verifyArchive({root});assert.equal(archive.verified,true);assert.equal(archive.mode,'archive-reverified');
 assert.equal(archive.files,config.archiveFiles);assert.equal(archive.receiptSha256,config.archiveSha256);assert.equal(archive.receiptSha256,guard.acceptedL2Archive.receiptSha256);
 return{workPackage:'AP23L3',status:'protected-integration-baselines-preserved',head,inventorySha256:sha256(raw),protectedFilesVerified:Object.keys(guard.files).length,
  intendedMutableInputs:mutableStatus,livingStatus,newIntegrationFiles:additions.sort(),generatedProductCopiesVerified:generatedVerified,generatedSchemaCopiesVerified,
  acceptedL2Archive:archive,oldReaderAndArithmeticBytesPreserved:true,acceptedLegalDataChanged:false,existingTestsChanged:false,acceptedResearchChanged:false,
  historicalEvidenceChanged:false,userModifiedDocxChanged:false,stylesheetChanged:false,sourceReleaseApproved:false,commitCreated:false,sourcePushPerformed:false,operatingChanges:false,
  note:'Immutable pre-integration bytes are unchanged. Only enumerated dispatchers, UI, hosts and byte-checked generated copies may change locally. New native V9 / Format16 files and L3 tests remain separate. No source release or operating approval.'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.ok(process.argv.slice(2).every(arg=>arg==='--write'),'Only optional --write');const report=await checkPreservation();
 if(process.argv.includes('--write')){const path=preparationConfig.output+'/preservation-verification.json';await checkedPath(process.cwd(),path,{missing:true});await writeFile(path,JSON.stringify(report,null,2)+'\n');}
 console.log(JSON.stringify(report,null,2));
}
