// SPDX-License-Identifier: AGPL-3.0-only
// Autonomous human U1 acceptance. Preserve the original pre-acceptance proof.
import assert from 'node:assert/strict';
import {readFile,lstat,readdir,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
export const archiveConfig=Object.freeze({target:'outputs/r10-u1-abnahme-2026-10-28',proof:'outputs/r10-u1-2026-10-28/local-completion.json',sha256:'23e56233ecd51b0d6b45fac0ca26c3d58a7692872fac895dd44f31174a967809',bindingCount:787,
 head:'70ce67425e046a7a38a4fbe66acbd93c75ca5983',
 statement:'Ja, R10-U1 abgenommen und R10-A1 starten'});
export const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export function safe(path){assert.equal(typeof path,'string');assert.ok(path&&!path.startsWith('/')&&!/[:\\\x00-\x1f\x7f]/u.test(path)&&path.split('/').every(p=>p&&p!=='.'&&p!=='..'),'Unsafe relative path');return path;}
export async function exact(root,path,expected){safe(path);let absolute=root;for(const part of path.split('/')){absolute=resolve(absolute,part);const stat=await lstat(absolute);assert.equal(stat.isSymbolicLink(),false,path);}
 const bytes=await readFile(absolute);if(expected){assert.equal(hash(bytes),expected.sha256,path);if(expected.byteLength!==undefined)assert.equal(bytes.length,expected.byteLength,path);}return bytes;}
async function exists(path){try{await lstat(path);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
export async function walk(root,path){const out=[];for(const item of await readdir(resolve(root,path),{withFileTypes:true})){const p=path?path+'/'+item.name:item.name;assert.equal(item.isSymbolicLink(),false,p);if(item.isDirectory())out.push(...await walk(root,p));else{assert.ok(item.isFile());out.push(p);}}return out.sort();}
export function receiptMetadata(proof,descriptor){assert.equal(proof.workPackage,'R10-U1');assert.equal(proof.status,'local-follow-up-verified-awaiting-human-acceptance');assert.equal(proof.humanAcceptance,false);assert.equal(proof.head,archiveConfig.head);assert.equal(proof.bindings.length,archiveConfig.bindingCount);
 for(const key of ['sourceReleaseApproved','dataPromoted','commitCreated','sourcePushPerformed','installationPerformed','operatingChanges','realM365Validation'])assert.equal(proof[key],false,key);
 assert.deepEqual(proof.scope,['R10-H01','T06-H01','B11-H01']);assert.deepEqual(proof.localCorrectionVerified,{'R10-H01':true,'T06-H01':true,'B11-H01':true});
 return {kind:'acceptedR10U1Snapshot',acceptedBy:'David Steimer',acceptedOn:'2026-10-28',userStatement:archiveConfig.statement,humanAcceptance:true,
 originalPreAcceptanceProofUnchanged:true,sourceReleaseApproved:false,dataPromoted:false,commitPermission:false,sourcePushPermission:false,installationPermission:false,operatingPermission:false,
 r10A1Authorized:true,r10A1Accepted:false,r10A2Authorized:false,
 actualHostFollowupPending:'T06-H01 real SharePoint/Teams wrapper tests at 100 and 300 percent remain in later E/Q.',
 documentedLintWarnings:136,proof:descriptor,originalBindingCount:proof.bindings.length,qaCounts:proof.qaCounts,hostCounts:proof.hostCounts,
 boundary:'Human acceptance of the three local U1 corrections and start of A1 inventory/planning only. No legal rule/data/window/format changes, source approval, promotion, builds, commits, push, uploads or installations.'};}
export async function archiveAcceptance({root=process.cwd(),write=false}={}){
 root=resolve(root);const target=resolve(root,archiveConfig.target),complete=await exists(target);if(complete)assert.ok(await exists(resolve(target,'receipt.json')),'Incomplete archive');
 const input=complete?target:root,proofBytes=await exact(input,archiveConfig.proof,{sha256:archiveConfig.sha256}),proof=JSON.parse(proofBytes);
 const descriptor={path:archiveConfig.proof,byteLength:proofBytes.length,sha256:archiveConfig.sha256},base=receiptMetadata(proof,descriptor),rows=[...proof.bindings,descriptor].sort((a,b)=>a.path.localeCompare(b.path,'en'));
 assert.equal(new Set(rows.map(r=>r.path)).size,rows.length);const buffers=new Map();for(const row of rows){safe(row.path);assert.ok(!row.path.startsWith(archiveConfig.target+'/'));assert.match(row.sha256,/^[a-f0-9]{64}$/u);buffers.set(row.path,await exact(input,row.path,row));}
 const receipt={...base,artifacts:rows},receiptBytes=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
 if(complete){assert.deepEqual(await exact(target,'receipt.json',{sha256:hash(receiptBytes)}),receiptBytes);assert.deepEqual((await walk(target,'')).map(p=>p.replace(/^\//u,'')),[...rows.map(r=>r.path),'receipt.json'].sort());}
 else if(write){await mkdir(dirname(target),{recursive:true});await mkdir(target);for(const row of rows){await mkdir(dirname(resolve(target,row.path)),{recursive:true});await writeFile(resolve(target,row.path),buffers.get(row.path),{flag:'wx'});await exact(target,row.path,row);}await writeFile(resolve(target,'receipt.json'),receiptBytes,{flag:'wx'});}
 return{status:complete?'archive-reverified':write?'archive-created':'archive-preflight',target:archiveConfig.target,files:rows.length,payloadBytes:rows.reduce((n,r)=>n+r.byteLength,0),receiptSha256:hash(receiptBytes),humanAcceptance:true,r10A1Authorized:true,sourceReleaseApproved:false,operatingChanges:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.equal(process.argv.length,3);assert.ok(['--write','--check'].includes(process.argv[2]));console.log(JSON.stringify(await archiveAcceptance({write:process.argv[2]==='--write'}),null,2));}

