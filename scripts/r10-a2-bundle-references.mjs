// SPDX-License-Identifier: AGPL-3.0-only
// A manifest tuple is not a filesystem descriptor. Resolve it, never ignore it.
import assert from 'node:assert/strict';
import {exact} from './archive-r10-u1-acceptance.mjs';
import {isLogicalBundleReference,descriptor,verifyDescriptors} from './r10-a2-review-contract.mjs';
export const candidateBinding=Object.freeze({root:'data/candidates/2026-10-28-ap23m3',releaseId:'2026-10-28-ap23m3-candidate.1',manifestSha256:'4519b40136fd533600b7cda85d941c87dfc14826325a5e542534e5257cedddad'});
export function findLogicalReferences(value,{pointer='',releaseId=null}={}){
 if(!value||typeof value!=='object')return[];
 const currentReleaseId=typeof value.releaseId==='string'?value.releaseId:releaseId;
 const own=isLogicalBundleReference(value)?[{pointer,releaseId:currentReleaseId,reference:value}]:[];
 return[...own,...Object.entries(value).flatMap(([key,item])=>findLogicalReferences(item,{pointer:pointer+'/'+key.replaceAll('~','~0').replaceAll('/','~1'),releaseId:currentReleaseId}))];
}
export function matchManifestReference(entry,manifest,config=candidateBinding){
 assert.equal(entry.releaseId,config.releaseId,'Unbound logical reference release');assert.equal(manifest.releaseId,config.releaseId);
 assert.ok(isLogicalBundleReference(entry.reference),'Not a typed manifest reference');
 const matches=manifest.artifacts.filter(a=>a.path===entry.reference.path);assert.equal(matches.length,1,'Unknown or duplicate manifest path');
 const artifact=matches[0];for(const key of ['role','contentId','path','sha256'])assert.equal(artifact[key],entry.reference[key],'Logical reference mismatch '+key);
 assert.ok(Number.isSafeInteger(artifact.byteLength)&&artifact.byteLength>=0);
 return{path:config.root+'/'+artifact.path,byteLength:artifact.byteLength,sha256:artifact.sha256};
}
export async function resolveBundleReferences(root,nativeReports,parts){
 const requested=nativeReports.flatMap((r,index)=>findLogicalReferences(r).map(entry=>({...entry,report:parts[index]})));
 if(!requested.length)return{rows:[],bindings:[]};
 const manifestPath=candidateBinding.root+'/manifest.json',manifest=JSON.parse(await exact(root,manifestPath,{sha256:candidateBinding.manifestSha256})),manifestBinding=await descriptor(root,manifestPath),rows=[];
 for(const entry of requested){const physicalFile=matchManifestReference(entry,manifest);await exact(root,physicalFile.path,physicalFile);rows.push({reportBinding:{...entry.report,pointer:entry.pointer},releaseId:entry.releaseId,logicalReference:entry.reference,manifest:manifestBinding,physicalFile,status:'logical-tuple-resolved-and-raw-bytes-verified',humanApproval:false,sourceReleaseApproved:false});}
 return{rows,bindings:await verifyDescriptors(root,[manifestBinding,...rows.map(r=>r.physicalFile)])};
}
