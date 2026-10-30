// SPDX-License-Identifier: AGPL-3.0-only
// Pure A1 boundary check. No product edits or historical proof refresh.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {preparationConfig,bind,exact,hash,safe,walk,allowedNew} from './prepare-r10-a1.mjs';
import {archiveAcceptance} from './archive-r10-u1-acceptance.mjs';
export const preservationConfig=Object.freeze({guard:preparationConfig.guard,guardSha256:'eace969a33e1f29f41654b6500882f4fb17dddc7ea742a96fa4ed3955cb719a2',
 protectedCount:15367,livingCount:8,head:preparationConfig.head,trees:preparationConfig.trees,living:preparationConfig.living,allowedNew:preparationConfig.allowedNew,receiptSha256:preparationConfig.u1ReceiptSha256});
export function validateGuard(guard,config=preservationConfig){
 assert.equal(guard.workPackage,'R10-A1');assert.equal(guard.createdOn,'2026-10-28');assert.equal(guard.head,config.head);
 assert.equal(guard.capturedBeforeA1OutputsAndLivingChanges,true);assert.equal(guard.userStatement,'Ja, R10-U1 abgenommen und R10-A1 starten');
 for(const key of['u1HumanAcceptance','r10A1Authorized'])assert.equal(guard[key],true,key);
 for(const key of['r10A1HumanAcceptance','r10A2Authorized','sourceReleaseApproved','dataPromoted','definitiveBuild','commitCreated','sourcePushPerformed','installationPerformed','operatingChanges'])assert.equal(guard[key],false,key);
 assert.equal(guard.scope,preparationConfig.scope);assert.deepEqual(guard.trees,config.trees);assert.deepEqual(guard.allowedNew,config.allowedNew);
 assert.equal(guard.files.length,config.protectedCount);assert.equal(guard.livingAtStart.length,config.livingCount);
 const files=guard.files.map(r=>r.path),living=guard.livingAtStart.map(r=>r.path);assert.equal(new Set(files).size,files.length);assert.equal(new Set(living).size,living.length);assert.deepEqual([...living].sort(),[...config.living].sort());
 assert.deepEqual(Object.keys(guard.treeFiles).sort(),[...config.trees].sort());for(const p of files){safe(p);assert.equal(living.includes(p),false);}
 for(const row of[...guard.files,...guard.livingAtStart]){assert.deepEqual(Object.keys(row).sort(),['byteLength','path','sha256']);assert.match(row.sha256,/^[a-f0-9]{64}$/u);assert.ok(Number.isSafeInteger(row.byteLength)&&row.byteLength>=0);}
 assert.equal(guard.acceptedU1.humanAcceptance,true);assert.equal(guard.acceptedU1.r10A1Authorized,true);assert.equal(guard.acceptedU1.sourceReleaseApproved,false);assert.equal(guard.acceptedU1.operatingChanges,false);assert.equal(guard.acceptedU1.receiptSha256,config.receiptSha256);return true;
}
export async function checkPreservation({root=process.cwd(),config=preservationConfig,verifyArchive=archiveAcceptance,
 readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
 root=resolve(root);const bytes=await exact(root,config.guard,{sha256:config.guardSha256}),guard=JSON.parse(bytes);validateGuard(guard,config);
 for(const row of guard.files)await exact(root,row.path,row);assert.equal(await readHead(root),config.head,'Git HEAD changed');
 const newFiles=[];for(const dir of config.trees){const previous=guard.treeFiles[dir],current=await walk(root,dir);assert.equal(new Set(previous).size,previous.length);const added=current.filter(p=>!previous.includes(p));for(const p of added)assert.ok(allowedNew(p),'Unapproved new A1 file '+p);
 assert.deepEqual(current.filter(p=>!added.includes(p)),previous,'Original file deleted '+dir);for(const p of previous)assert.ok(guard.files.some(r=>r.path===p)||config.living.includes(p),'Unbound original file '+p);newFiles.push(...added);}
 const archive=await verifyArchive({root});assert.equal(archive.status,'archive-reverified');assert.equal(archive.receiptSha256,config.receiptSha256);
 const livingStatus=[];for(const original of guard.livingAtStart){const current=await bind(root,original.path);livingStatus.push({path:original.path,before:original.sha256,current:current.sha256,changed:original.sha256!==current.sha256});}
 return{workPackage:'R10-A1',status:'a1-baseline-preserved',head:guard.head,guard:{path:config.guard,byteLength:bytes.length,sha256:hash(bytes)},protectedFilesVerified:guard.files.length,livingStatus,newFiles:newFiles.sort(),acceptedU1:archive,
 productChanged:false,legalDataChanged:false,schemasChanged:false,packageChanged:false,historicalEvidenceChanged:false,sourceReleaseApproved:false,dataPromoted:false,definitiveBuild:false,commitCreated:false,sourcePushPerformed:false,installationPerformed:false,operatingChanges:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.ok(process.argv.slice(2).every(p=>p==='--write'));const report=await checkPreservation();if(process.argv.includes('--write'))await writeFile(resolve(process.cwd(),preparationConfig.out+'/preservation.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));}

