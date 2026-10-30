// SPDX-License-Identifier: AGPL-3.0-only
// Check immutable history and the explicitly bounded native integration surface.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance} from './archive-ap23j2-acceptance.mjs';
import {checkedPath,exact,walk,sha256,preparationConfig,isAllowedNew} from './prepare-ap23j3.mjs';
export const preservationConfig=Object.freeze({guardPath:preparationConfig.output+'/protected-inputs.json',
  guardSha256:'8b431957fa6228e53f271c6bab994486919247d1a84b20684f116e8578424f31',protectedCount:4466,mutableCount:127,
  head:preparationConfig.head,livingPaths:preparationConfig.living,treePaths:preparationConfig.trees,
  allowedNew:preparationConfig.allowedNew,mutableAllowed:preparationConfig.mutableExisting,generatedPrefix:preparationConfig.generatedMutablePrefix,
  archiveFiles:preparationConfig.archiveFiles,archiveSha256:preparationConfig.receiptSha256,
  previousGuard:{path:preparationConfig.previousGuard,sha256:preparationConfig.previousGuardSha256,protectedCount:preparationConfig.previousProtectedCount},
  previousProof:{path:preparationConfig.proof,sha256:preparationConfig.proofSha256},
  userDocument:{path:preparationConfig.userDocument,sha256:preparationConfig.userDocumentSha256},
  generatedSchemaSupplement:null,
  newFileSupplement:{path:'outputs/ap23j3-2026-10-27/native-opening-integration-supplement.json',sha256:'ba503835be104dc7089af2e926c5e6ae21ce839f90c5e2887d815b7e9c83c6de'}});
export const GENERATED_SCHEMA_COPIES=[
  {path:'spfx/src/core/schemas/administrative-procedure-catalog-v7.schema.json',source:'schemas/administrative-procedure-catalog-v7.schema.json'},
  {path:'spfx/src/core/schemas/release-manifest-v14.schema.json',source:'schemas/release-manifest-v14.schema.json'},
  {path:'spfx/src/schemas/administrative-procedure-catalog-v7.schema.json',source:'schemas/administrative-procedure-catalog-v7.schema.json'},
  {path:'spfx/src/schemas/release-manifest-v14.schema.json',source:'schemas/release-manifest-v14.schema.json'},
  {path:'spfx/src/schemas/implementation/ap23j3/local-reference-manifest-v14.schema.json',source:'schemas/implementation/ap23j3/local-reference-manifest-v14.schema.json'}
];
export async function checkPreservation({root=process.cwd(),config=preservationConfig,verifyArchive=archiveAcceptance,
  readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
  root=resolve(root);const raw=await exact(root,config.guardPath,config.guardSha256),guard=JSON.parse(raw);
  assert.equal(guard.workPackage,'AP23J3');assert.equal(guard.capturedBeforeIntegration,true);assert.equal(guard.capturedBeforeLivingUpdates,true);
  assert.equal(guard.j2TechnicallyAccepted,true);assert.equal(guard.acceptedBy,'David Steimer');assert.equal(guard.userStatement,preparationConfig.statement);
  assert.deepEqual(guard.contractDecision,{id:'DEC-2026-039',status:'approved',on:'2026-10-27'});
  assert.equal(guard.head,config.head);assert.equal(Object.keys(guard.files).length,config.protectedCount);assert.equal(Object.keys(guard.mutableBefore).length,config.mutableCount);
  assert.deepEqual(guard.previousGuard,config.previousGuard);assert.deepEqual(guard.previousProof,config.previousProof);assert.deepEqual(guard.userDocument,config.userDocument);
  for(const key of['sourceReleaseApproved','operatingChangesAuthorized','commitPermission','sourcePushPermission'])assert.equal(guard[key],false,'J3 boundary '+key);
  assert.deepEqual(Object.keys(guard.livingAtStart).sort(),[...config.livingPaths].sort());
  assert.deepEqual(Object.keys(guard.treeFiles).sort(),[...config.treePaths].sort());
  assert.deepEqual(guard.allowedNew,config.allowedNew);assert.deepEqual(guard.mutableAllowed,config.mutableAllowed);assert.equal(guard.generatedMutablePrefix,config.generatedPrefix);
  const generatedCopies=new Map();
  if(!config.generatedSchemaSupplement)for(const copy of GENERATED_SCHEMA_COPIES){
    assert.ok(config.allowedNew.files.includes(copy.path),'Generated copy must be predeclared');
    assert.equal(guard.files[copy.path],undefined,'New generated source cannot loosen old bytes');
    generatedCopies.set(copy.path,copy.source);
  }
  if(config.generatedSchemaSupplement){
    const supplement=JSON.parse(await exact(root,config.generatedSchemaSupplement.path,config.generatedSchemaSupplement.sha256));
    assert.equal(supplement.workPackage,'AP23J3');assert.equal(supplement.kind,'closedGeneratedSchemaCopySupplement');
    assert.deepEqual(supplement.originalGuard,{path:config.guardPath,sha256:config.guardSha256});assert.deepEqual(supplement.copies,GENERATED_SCHEMA_COPIES);
    assert.equal(supplement.technicalScopeConfirmedByRoot,true);assert.equal(supplement.newOperatingAuthority,false);assert.equal(supplement.existingSchemaChangesAllowed,false);
    for(const copy of supplement.copies){assert.equal(guard.files[copy.path],undefined,'Supplement must not loosen an existing schema');
      assert.equal(guard.mutableBefore[copy.path],undefined,'Supplement is new copy only');generatedCopies.set(copy.path,copy.source);}
  }
  for(const[path,hash]of Object.entries(guard.files)){
    assert.ok(!Object.hasOwn(guard.mutableBefore,path),'Both immutable and mutable '+path);
    assert.ok(!Object.hasOwn(guard.livingAtStart,path),'Living input cannot be immutable '+path);await exact(root,path,hash);
  }
  const mutableStatus=[];
  for(const[path,before]of Object.entries(guard.mutableBefore)){
    assert.ok(config.mutableAllowed.includes(path)||path.startsWith(config.generatedPrefix),'Unapproved mutable file '+path);
    assert.ok(!Object.hasOwn(guard.livingAtStart,path),'Living input cannot be product mutable '+path);
    const current=sha256(await exact(root,path));mutableStatus.push({path,before,current,changed:before!==current});
  }
  const extraFiles=new Set();
  if(config.newFileSupplement){
    const extra=JSON.parse(await exact(root,config.newFileSupplement.path,config.newFileSupplement.sha256));
    assert.equal(extra.workPackage,'AP23J3');assert.equal(extra.kind,'closedNewNativeIntegrationFileSupplement');
    assert.deepEqual(extra.originalGuard,{path:config.guardPath,sha256:config.guardSha256});
    assert.deepEqual(extra.additionalNewFiles,['src/core/holidayActivationV14.ts']);
    assert.equal(extra.technicalScopeConfirmedByRoot,true);assert.equal(extra.existingFileChangesAllowed,false);assert.equal(extra.newOperatingAuthority,false);
    for(const path of extra.additionalNewFiles){assert.equal(guard.files[path],undefined);assert.equal(guard.mutableBefore[path],undefined);extraFiles.add(path);}
  }
  const additions=[];
  for(const directory of config.treePaths){
    const original=guard.treeFiles[directory];assert.ok(Array.isArray(original));assert.equal(new Set(original).size,original.length);
    for(const path of original){assert.ok(path.startsWith(directory+'/'));assert.ok(Object.hasOwn(guard.files,path)||Object.hasOwn(guard.mutableBefore,path),'Unbound original tree input '+path);}
    const current=await walk(root,directory),fresh=current.filter(path=>!original.includes(path));
    for(const path of fresh)assert.ok(isAllowedNew(path,config.allowedNew)||generatedCopies.has(path)||extraFiles.has(path)
      ||path.startsWith(config.generatedPrefix)&&extraFiles.has('src/'+path.slice(config.generatedPrefix.length)),'Unapproved integration addition '+path);
    assert.deepEqual(current.filter(path=>!fresh.includes(path)),original,'Existing tree file removed');additions.push(...fresh);
  }
  const generatedSchemaCopiesVerified=[];
  for(const path of additions.filter(path=>generatedCopies.has(path))){const source=generatedCopies.get(path),copy=await exact(root,path),original=await exact(root,source);
    assert.deepEqual(copy,original,'Generated schema differs from native source '+path);
    generatedSchemaCopiesVerified.push({path,source,byteLength:copy.length,sha256:sha256(copy)});}
  const livingStatus=[];for(const[path,before]of Object.entries(guard.livingAtStart)){const current=sha256(await exact(root,path));livingStatus.push({path,before,current,changed:before!==current});}
  const head=await readHead(root);assert.equal(head,guard.head,'Git HEAD changed');
  const archive=await verifyArchive({root});assert.equal(archive.verified,true);assert.equal(archive.mode,'archive-reverified');assert.equal(archive.files,config.archiveFiles);
  assert.equal(archive.receiptSha256,config.archiveSha256);assert.equal(archive.receiptSha256,guard.acceptedJ2Archive.receiptSha256);
  return{workPackage:'AP23J3',status:'protected-integration-baselines-preserved',head,inventorySha256:sha256(raw),
    protectedFilesVerified:Object.keys(guard.files).length,intendedMutableInputs:mutableStatus,livingStatus,newIntegrationFiles:additions.sort(),
    generatedSchemaSupplement:config.generatedSchemaSupplement??null,newFileSupplement:config.newFileSupplement??null,generatedSchemaCopiesVerified,
    acceptedJ2Archive:archive,oldReaderAndArithmeticBytesPreserved:true,acceptedLegalDataChanged:false,existingTestsChanged:false,
    acceptedResearchChanged:false,historicalEvidenceChanged:false,userModifiedDocxChanged:false,
    sourceReleaseApproved:false,commitCreated:false,sourcePushPerformed:false,operatingChanges:false,
    note:'Immutable pre-integration bytes are unchanged. Enumerated dispatcher/UI/host files and generated SPFx copies may change locally. Native V7/format14 additions and J3 tests are separate. Old reader modules, arithmetic, accepted data and historical evidence remain immutable.'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(arg=>arg==='--write'),'Only optional --write');
  const report=await checkPreservation();if(process.argv.includes('--write')){
    const path=preparationConfig.output+'/preservation-verification.json';await checkedPath(process.cwd(),path,{missing:true});await writeFile(path,JSON.stringify(report,null,2)+'\n');}
  console.log(JSON.stringify(report,null,2));
}

