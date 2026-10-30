// SPDX-License-Identifier: AGPL-3.0-only
// Read-only accepted-input guard. Never refresh historical pre-acceptance proofs.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {exact,hash,safe,walk} from './archive-r10-u1-acceptance.mjs';
import {archiveAcceptance,archiveConfig} from './archive-r10-a1-acceptance.mjs';
import {preparationConfig} from './prepare-r10-a2.mjs';
export const preservationConfig=Object.freeze({guard:preparationConfig.guard,guardSha256:'1c07c86cb49f1bda4b68da069da2b908e2adefbe1bca71b8db914bd0b5f628ec',protectedCount:17637,livingCount:8,head:archiveConfig.head,receiptSha256:'80ceed3a9339c2839295983a1e5030c69837307fa7b98bbc819a9fd95297f64d'});
export function validateGuard(guard,config=preservationConfig){
 assert.equal(guard.workPackage,'R10-A2');assert.equal(guard.createdOn,'2026-10-28');assert.equal(guard.head,config.head);assert.equal(guard.userStatement,archiveConfig.statement);assert.equal(guard.capturedBeforeA2OutputsAndLivingChanges,true);
 for(const key of ['a1HumanAcceptance','r10A2Authorized'])assert.equal(guard[key],true,key);
 for(const key of ['r10A2HumanAcceptance','sourceReleaseApproved','dataPromoted','definitiveBuild','commitCreated','sourcePushPerformed','installationPerformed','operatingChanges'])assert.equal(guard[key],false,key);
 assert.equal(guard.files.length,config.protectedCount);assert.equal(guard.livingAtStart.length,config.livingCount);assert.deepEqual(guard.allowedNew,preparationConfig.allowedNew);
 assert.equal(new Set(guard.files.map(r=>r.path)).size,guard.files.length);assert.deepEqual(guard.livingAtStart.map(r=>r.path).sort(),[...preparationConfig.living].sort());
 for(const row of [...guard.files,...guard.livingAtStart]){safe(row.path);assert.match(row.sha256,/^[a-f0-9]{64}$/u);assert.ok(Number.isSafeInteger(row.byteLength)&&row.byteLength>=0);}
 assert.equal(guard.acceptedA1.receiptSha256,config.receiptSha256);return true;
}
export async function checkPreservation({root=process.cwd(),config=preservationConfig,verifyArchive=archiveAcceptance,readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
 root=resolve(root);const bytes=await exact(root,config.guard,{sha256:config.guardSha256}),guard=JSON.parse(bytes);validateGuard(guard,config);
 for(const row of guard.files)await exact(root,row.path,row);assert.equal(await readHead(root),config.head,'Git HEAD changed');
 const allowed=path=>guard.allowedNew.some(pattern=>new RegExp(pattern,'u').test(path)),newFiles=[];
 for(const dir of guard.trees){const previous=guard.treeFiles[dir],current=await walk(root,dir),previousSet=new Set(previous),added=current.filter(p=>!previousSet.has(p));for(const path of added)assert.ok(allowed(path),'Unapproved new A2 file '+path);assert.deepEqual(current.filter(p=>previousSet.has(p)),previous,'Protected file removed '+dir);newFiles.push(...added);}
 const archive=await verifyArchive({root});assert.equal(archive.status,'archive-reverified');assert.equal(archive.receiptSha256,config.receiptSha256);
 const livingStatus=[];for(const row of guard.livingAtStart){const current=await exact(root,row.path);livingStatus.push({path:row.path,before:row.sha256,current:hash(current),changed:row.sha256!==hash(current)});}
 return{workPackage:'R10-A2',status:'a2-accepted-inputs-preserved',guard:{path:config.guard,byteLength:bytes.length,sha256:hash(bytes)},head:guard.head,protectedFilesVerified:guard.files.length,livingStatus,newFiles:newFiles.sort(),acceptedA1:archive,productChanged:false,legalDataChanged:false,sourceRegisterChanged:false,schemasChanged:false,packageChanged:false,historicalEvidenceChanged:false,sourceReleaseApproved:false,dataPromoted:false,definitiveBuild:false,commitCreated:false,sourcePushPerformed:false,installationPerformed:false,operatingChanges:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.equal(process.argv.length,2);console.log(JSON.stringify(await checkPreservation(),null,2));}
