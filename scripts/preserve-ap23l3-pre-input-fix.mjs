// SPDX-License-Identifier: AGPL-3.0-only
// Preserve completed partial steps from the interrupted pre-validation-fix run.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
const root=process.cwd(),base='outputs/ap23l3-2026-10-27',target=base+'/pre-input-fix';
const hash=raw=>createHash('sha256').update(raw).digest('hex');
await assert.rejects(lstat(resolve(root,target)),{code:'ENOENT'},'Partial evidence already preserved');
const paths=['preservation-before.txt','typecheck.txt','native-schemas.txt','candidate.txt','native-references.txt','inherited-references.txt','product-regression.txt','host-lifecycle.txt',
 'native-reference-verification.json','inherited-reference-verification.json','independent-verification.json'];
const artifacts=[];await mkdir(resolve(root,target));
for(const name of paths){const source=base+'/'+name,path=target+'/'+name,bytes=await readFile(resolve(root,source));await mkdir(dirname(resolve(root,path)),{recursive:true});await writeFile(resolve(root,path),bytes,{flag:'wx'});artifacts.push({source,path,byteLength:bytes.length,sha256:hash(bytes)});}
const receipt={workPackage:'AP23L3',kind:'interrupted-pre-input-validation-fix-partial-evidence',status:'not-final-not-accepted',
 reason:'Optional irrelevant AI tracking facts with invalid value types were accepted by the native input boundary. No wrong date was observed. The run was stopped before completion for a native validation correction.',
 originalCompletedProductTests:3582,originalCompletedHostLifecycleTests:80,interruptedDuring:'actual-web-bundle',
 standaloneIndependentReport:true,sourceReleaseApproved:false,humanAcceptance:false,operatingChanges:false,artifacts};
await writeFile(resolve(root,target,'receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:receipt.status,artifacts:artifacts.length,receiptSha256:hash(await readFile(resolve(root,target,'receipt.json')))}));
