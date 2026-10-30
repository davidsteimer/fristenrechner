// SPDX-License-Identifier: AGPL-3.0-only
// Separate human receipt. The original pre-acceptance A1 proof stays unchanged.
import assert from 'node:assert/strict';
import {lstat,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {exact,hash,safe,walk} from './archive-r10-u1-acceptance.mjs';
export const archiveConfig=Object.freeze({target:'outputs/r10-a1-abnahme-2026-10-28',proof:'outputs/r10-a1-2026-10-28/local-completion.json',sha256:'5621436afe1d31e256004f780685794b522fe235479b6871327288ee05e167ef',bindingCount:1406,head:'70ce67425e046a7a38a4fbe66acbd93c75ca5983',statement:'Ich bestätige den Bestandsbericht und Prüfplan. Starte R10-A2 mit dem gemeinsamen inhaltlichen Quellen- und Fassungsabgleich.'});
async function exists(path){try{await lstat(path);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
export async function assertRoot(root){const stat=await lstat(root);assert.ok(stat.isDirectory()&&!stat.isSymbolicLink(),'Archive root must be a real directory');}
export async function archiveAcceptance({root=process.cwd(),write=false}={}){
 root=resolve(root);await assertRoot(root);const target=resolve(root,archiveConfig.target),complete=await exists(target);
 if(complete){await assertRoot(target);assert.ok(await exists(resolve(target,'receipt.json')),'Incomplete A1 archive');}
 const input=complete?target:root,bytes=await exact(input,archiveConfig.proof,{sha256:archiveConfig.sha256}),proof=JSON.parse(bytes);
 assert.equal(proof.workPackage,'R10-A1');assert.equal(proof.status,'local-inventory-and-review-plan-verified');assert.equal(proof.head,archiveConfig.head);assert.equal(proof.humanAcceptance,false);assert.equal(proof.bindings.length,archiveConfig.bindingCount);
 for(const key of ['sourceReleaseApproved','dataPromoted','definitiveBuild','commitCreated','sourcePushPerformed','installationPerformed','operatingChanges','r10A2Performed'])assert.equal(proof[key],false,key);
 assert.deepEqual(proof.counts,{cantons:26,administrativePaths:245,newAdministrativePaths:220,sources:380,newSources:129,sourceUses:5045,newSourceUses:2909,existingEvidenceFiles:1223,reviewLots:12});
 const descriptor={path:archiveConfig.proof,byteLength:bytes.length,sha256:archiveConfig.sha256},rows=[...proof.bindings,descriptor].sort((a,b)=>a.path.localeCompare(b.path,'en'));
 assert.equal(new Set(rows.map(r=>r.path)).size,rows.length);const buffers=new Map();
 for(const row of rows){safe(row.path);assert.ok(!row.path.startsWith(archiveConfig.target+'/'));assert.match(row.sha256,/^[a-f0-9]{64}$/u);buffers.set(row.path,await exact(input,row.path,row));}
 const receipt={kind:'acceptedR10A1Snapshot',acceptedBy:'David Steimer',acceptedOn:'2026-10-28',userStatement:archiveConfig.statement,humanAcceptance:true,originalPreAcceptanceProofUnchanged:true,r10A2Authorized:true,r10A2HumanAcceptance:false,sourceReleaseApproved:false,dataPromotionPermission:false,buildPermission:false,commitPermission:false,sourcePushPermission:false,uploadPermission:false,installationPermission:false,operatingPermission:false,proof:descriptor,counts:proof.counts,originalBindingCount:proof.bindings.length,boundary:'Accepted A1 inventory and review plan. A2 source content/version review and bounded reuse only. No product, legal data, register, schema, window or operating changes.',artifacts:rows};
 const receiptBytes=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
 if(complete){assert.deepEqual(await exact(target,'receipt.json'),receiptBytes);assert.deepEqual(await walk(target,''),[...rows.map(r=>r.path),'receipt.json'].sort());}
 else if(write){await mkdir(dirname(target),{recursive:true});await mkdir(target);for(const row of rows){await mkdir(dirname(resolve(target,row.path)),{recursive:true});await writeFile(resolve(target,row.path),buffers.get(row.path),{flag:'wx'});await exact(target,row.path,row);}await writeFile(resolve(target,'receipt.json'),receiptBytes,{flag:'wx'});}
 return{status:complete?'archive-reverified':write?'archive-created':'archive-preflight',target:archiveConfig.target,files:rows.length,payloadBytes:rows.reduce((n,r)=>n+r.byteLength,0),receiptSha256:hash(receiptBytes),humanAcceptance:true,r10A2Authorized:true,sourceReleaseApproved:false,operatingChanges:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.equal(process.argv.length,3);assert.ok(['--write','--check'].includes(process.argv[2]));console.log(JSON.stringify(await archiveAcceptance({write:process.argv[2]==='--write'}),null,2));}
