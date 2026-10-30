// SPDX-License-Identifier: AGPL-3.0-only
// A complete evidence index is not human acceptance, data promotion or a build.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {exact,hash} from './archive-r10-u1-acceptance.mjs';
import {config as baselineConfig,finalize as checkBaseline} from './finalize-r10-a2-baseline.mjs';
import {lotConfigs,normalize,finalize as checkLot} from './finalize-r10-a2-lot.mjs';
import {inventoryPath,inventorySha256,validateSourcePartition,verifyDescriptors,collectDescriptors,descriptor} from './r10-a2-review-contract.mjs';
import {checkPreservation} from './check-r10-a2-preservation.mjs';
export const commonConfig=Object.freeze({out:'outputs/r10-a2-2026-10-28/common-completion.json',testReport:'outputs/r10-a2-2026-10-28/governance-tests.tap',expectedGovernanceTests:117,expectedSources:380,expectedUses:5045,expectedNewUses:2909,expectedLots:12});
// This suite deliberately uses the flat Node TAP 13 form. Unknown/nested forms fail
// closed instead of trusting arbitrary summary comments as execution evidence.
export function validateGovernanceTap(text,expected=commonConfig.expectedGovernanceTests){
 assert.ok(Number.isSafeInteger(expected)&&expected>0);
 assert.match(text,/^TAP version 13\r?\n/u,'Missing TAP 13 header');
 assert.doesNotMatch(text,/^\s*(?:not ok\b|Bail out!)/gmu,'Failed or aborted TAP stream');
 assert.doesNotMatch(text,/^\s+(?:ok|not ok)\b/gmu,'Unexpected nested TAP points');
 const plans=[...text.matchAll(/^([0-9]+)\.\.([0-9]+)([^\r\n]*)$/gmu)];
 assert.equal(plans.length,1,'Missing or duplicated TAP plan');
 assert.equal(Number(plans[0][1]),1);assert.equal(Number(plans[0][2]),expected);
 assert.equal(plans[0][3].trim(),'','Unexpected TAP plan directive');
 const pointLines=[...text.matchAll(/^ok\b[^\r\n]*$/gmu)];assert.equal(pointLines.length,expected,'Missing or extra TAP points');
 for(const[index,point]of pointLines.entries()){
  const parsed=/^ok ([1-9][0-9]*) - (.+)$/u.exec(point[0]);assert.ok(parsed,'Malformed TAP test point');
  assert.equal(Number(parsed[1]),index+1,'Duplicated or out-of-order TAP point');
  assert.doesNotMatch(point[0],/\s+#\s*(?:SKIP|TODO)\b/iu,'Incomplete TAP point');
 }
 assert.ok(plans[0].index>pointLines.at(-1).index,'The flat Node TAP plan must follow its points');
 const result={};for(const key of ['tests','pass','fail','cancelled','skipped','todo']){const matches=[...text.matchAll(new RegExp('^# '+key+' ([0-9]+)$','gmu'))];assert.equal(matches.length,1,'Missing or duplicated TAP summary '+key);assert.ok(matches[0].index>plans[0].index,'TAP summary precedes plan');result[key]=Number(matches[0][1]);}
 assert.equal(result.tests,expected);assert.equal(result.pass,expected);for(const key of ['fail','cancelled','skipped','todo'])assert.equal(result[key],0,'Incomplete or failed governance tests '+key);return result;
}
export function validateCommonCounts(result,lots,config=commonConfig){
 assert.equal(result.sourceCount,config.expectedSources,'Incomplete common source set');
 assert.equal(result.referenceCount,config.expectedUses,'Incomplete actual use set');
 assert.equal(result.newReferenceCount,config.expectedNewUses,'Incomplete new use set');
 assert.deepEqual(result.pendingSourceIds,[],'Pending sources remain');
 assert.equal(lots.length,config.expectedLots,'Incomplete sequential lot set');
 assert.deepEqual(lots.map(l=>l.number),Array.from({length:config.expectedLots},(_,i)=>i+1),'Non-sequential lots');
 assert.equal(new Set(lots.map(l=>l.id)).size,config.expectedLots,'Duplicate lot ID');
 for(const lot of lots){assert.equal(lot.humanApproval,false);assert.equal(lot.sourceReleaseApproved,false);}
 return true;
}
export async function finalize({root=process.cwd(),write=false}={}){
 const inventory=JSON.parse(await exact(root,inventoryPath,{sha256:inventorySha256}));
 assert.equal(inventory.reviewLots.length,commonConfig.expectedLots);
 assert.equal(Object.keys(lotConfigs).length,commonConfig.expectedLots-1,'Do not finalize a partial review');
 const closed=[],reports=[],parts=[],resolvedCompanionSourceIds=[];
 const first=await checkBaseline({root});
 const firstValue=JSON.parse(await exact(root,first.path,{sha256:first.sha256}));
 resolvedCompanionSourceIds.push(...JSON.parse(await exact(root,firstValue.judgmentNormClosure.path,firstValue.judgmentNormClosure)).rows.map(r=>r.sourceId));
 closed.push({id:firstValue.lotId,number:1,humanApproval:firstValue.humanApproval,sourceReleaseApproved:firstValue.sourceReleaseApproved,sourceCount:first.sourceCount,actualUseCount:first.actualUseCount,newUseCount:first.newUseCount,binding:await descriptor(root,first.path)});
 for(const[path,sha256]of baselineConfig.parts){const binding=await descriptor(root,path);assert.equal(binding.sha256,sha256);parts.push(binding);reports.push(normalize(JSON.parse(await exact(root,path,binding))));}
 for(const lot of inventory.reviewLots.slice(1)){
  const result=await checkLot(lot.id,{root}),config=lotConfigs[lot.id],value=JSON.parse(await exact(root,result.path,{sha256:result.sha256}));
  if(value.judgmentNormClosure)resolvedCompanionSourceIds.push(...JSON.parse(await exact(root,value.judgmentNormClosure.path,value.judgmentNormClosure)).rows.map(r=>r.sourceId));
  closed.push({id:lot.id,number:config.number,humanApproval:value.humanApproval,sourceReleaseApproved:value.sourceReleaseApproved,sourceCount:result.sourceCount,actualUseCount:result.actualUseCount,newUseCount:result.newUseCount,binding:await descriptor(root,result.path)});
  for(const[relative,sha256]of config.parts){const path='outputs/r10-a2-2026-10-28/'+relative,binding=await descriptor(root,path);assert.equal(binding.sha256,sha256);parts.push(binding);reports.push(normalize(JSON.parse(await exact(root,path,binding))));}
 }
 const partition=validateSourcePartition(inventory,reports,{requiredLotIds:inventory.reviewLots.map(l=>l.id),complete:true,resolvedCompanionSourceIds});
 validateCommonCounts(partition,closed);
 const preservation=await checkPreservation({root});
 const testReport=await descriptor(root,commonConfig.testReport),governanceTests={...validateGovernanceTap((await exact(root,testReport.path,testReport)).toString('utf8')),report:testReport};
 const verificationCode=await Promise.all(preservation.newFiles.filter(p=>/^(?:scripts|tests)\//u.test(p)).map(p=>descriptor(root,p)));
 const documentation=await Promise.all(['docs/fachrecht/quellenabgleich-r10-a2.md','docs/betrieb/abnahme-r10-a1.md'].map(p=>descriptor(root,p)));
 const bindings=await verifyDescriptors(root,[await descriptor(root,inventoryPath),...parts,...closed.map(l=>l.binding),...reports.flatMap(collectDescriptors),...await Promise.all(closed.map(async l=>collectDescriptors(JSON.parse(await exact(root,l.binding.path,l.binding))))).then(xs=>xs.flat()),testReport,...verificationCode,...documentation]);
 const sourceRows=partition.rows.map(row=>{const reportIndex=reports.findIndex(report=>report.rows.some(r=>r.sourceId===row.sourceId));const rowIndex=reports[reportIndex].rows.findIndex(r=>r.sourceId===row.sourceId),nativeArray=reports[reportIndex].sourceRows?'sourceRows':'rows';return{...row,reviewBinding:{...parts[reportIndex],pointer:'/'+nativeArray+'/'+rowIndex,nativeArray}};});
 const sourceRoles={};for(const row of inventory.rows)sourceRoles[row.referenceUse]=(sourceRoles[row.referenceUse]??0)+1;
 const value={workPackage:'R10-A2',checkedOn:'2026-10-28',recordStatus:'common-source-content-and-version-review-complete-awaiting-human-acceptance',completeCommonReview:true,technicalEvidenceClosure:true,humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false,publicationApproved:false,productChanges:false,legalDataChanges:false,registerChanges:false,schemasChanged:false,windowsChanged:false,packageChanged:false,buildPerformed:false,commitCreated:false,sourcePushPerformed:false,installationPerformed:false,operatingChanges:false,counts:{sourceIds:partition.sourceCount,actualUses:partition.referenceCount,retainedOldUses:partition.referenceCount-partition.newReferenceCount,newUses:partition.newReferenceCount,lots:closed.length,evidenceFiles:bindings.length,pendingSourceIds:0,sourceRoles},methodBoundary:'Current content/version assessment and individually justified historical reuse. Integrity and coverage checks do not establish legal truth, an exhaustive new case-law search, operational release or a future-law guarantee.',lots:closed,sources:sourceRows,bindings,preservation,nextGate:'Explicit common human R10-A2 acceptance before preparing a separately authorized R10-B adoption/build step. No implementation or external deployment is authorized by this report.'};
 value.governanceTests=governanceTests;value.verificationCode=verificationCode;value.documentation=documentation;
 const bytes=Buffer.from(JSON.stringify(value,null,2)+'\n');
 if(write)await writeFile(resolve(root,commonConfig.out),bytes,{flag:'wx'});else assert.deepEqual(await exact(root,commonConfig.out),bytes);
 return{status:write?'common-source-review-evidence-closed':'common-source-review-evidence-reverified',path:commonConfig.out,byteLength:bytes.length,sha256:hash(bytes),counts:value.counts,protectedFilesVerified:preservation.protectedFilesVerified,humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.equal(process.argv.length,3);assert.ok(['--write','--check'].includes(process.argv[2]));console.log(JSON.stringify(await finalize({write:process.argv[2]==='--write'}),null,2));}
