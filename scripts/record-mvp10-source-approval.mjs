// SPDX-License-Identifier: AGPL-3.0-only
// A2 acceptance bookkeeping only. Execution authority remains a separate record.
import assert from 'node:assert/strict';
import {lstat,mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {requireR10BApproval} from './record-r10b-execution-approval.mjs';

export const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
export const prefix='outputs/release-mvp10-2026-10-28';
export const approvalPath=prefix+'/source-approval.json';
export const acceptanceRoot='outputs/r10-a2-abnahme-2026-10-28';
export const receiptPath=acceptanceRoot+'/receipt.json';
export const resultPath='outputs/r10-a2-2026-10-28/common-completion.json';
export const inventoryPath='outputs/r10-a1-2026-10-28/sources/source-inventory.json';
export const planPath='outputs/r10-b-vorbereitung-2026-10-28/source-adoption-plan.json';
export const decisionPath='docs/fachrecht/abnahme-r10-a2.md';
export const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export const encode=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
export const fixedBindings=Object.freeze([
 {path:receiptPath,byteLength:379141,sha256:'6687d720296645439b66beb6c654e79b776df7d44252751d870838749e49db52'},
 {path:resultPath,byteLength:1793597,sha256:'7a5a93d7e8147d0de9013e645343ef9a346ba3c77ee98085fb1db92b376ebbb1'},
 {path:inventoryPath,byteLength:11500489,sha256:'e9949adea7ef5c0192ed5015ed8bfac7594bdb73c1417f4e81f0df3dee837ec6'},
 {path:planPath,byteLength:194771,sha256:'29b57ec0ce7b13546012a686f5858e8b16c9d7289c150582d4e2a2f58de31a98'}
]);
function safe(path){assert.ok(typeof path==='string'&&path&&!path.startsWith('/')&&!/[\\:\x00-\x1f\x7f]/u.test(path)&&path.split('/').every(p=>p&&p!=='.'&&p!=='..'),'Unsafe relative path');}
export async function readRegular(repository,path,optional=false){safe(path);let full=resolve(repository);const base=full;for(const part of path.split('/')){full=resolve(full,part);assert.ok(full.startsWith(base+sep));let st;try{st=await lstat(full);}catch(e){if(optional&&e.code==='ENOENT')return undefined;throw e;}assert.equal(st.isSymbolicLink(),false,path);assert.ok(full===resolve(repository,path)?st.isFile():st.isDirectory(),path);}return readFile(full);}
export async function writeExclusive(repository,path,bytes){safe(path);const parts=path.split('/');for(let n=1;n<parts.length;n++){const p=resolve(repository,...parts.slice(0,n));try{await mkdir(p);}catch(e){if(e.code!=='EEXIST')throw e;}const st=await lstat(p);assert.ok(st.isDirectory()&&!st.isSymbolicLink(),path);}const old=await readRegular(repository,path,true);if(old!==undefined){assert.deepEqual(old,Buffer.from(bytes),'Refusing changed output '+path);return;}await writeFile(resolve(repository,path),bytes,{flag:'wx'});assert.deepEqual(await readRegular(repository,path),Buffer.from(bytes));}
async function exact(repository,binding,path=binding.path){const b=await readRegular(repository,path);assert.equal(b.length,binding.byteLength,path);assert.equal(hash(b),binding.sha256,path);return b;}
export async function loadApprovalInputs(repository=root){
 const files=new Map();for(const b of fixedBindings)files.set(b.path,await exact(repository,b));
 const receipt=JSON.parse(files.get(receiptPath));assert.equal(receipt.humanAcceptance,true);assert.equal(receipt.sourceReviewAccepted,true);assert.equal(receipt.r10BExecutionAuthorized,false);assert.equal(receipt.acceptedOn,'2026-10-28');assert.equal(receipt.artifacts.length,1886);
 const evidence=[];for(const row of receipt.artifacts){const bytes=await exact(repository,row,acceptanceRoot+'/'+row.path);evidence.push({...row,archivedAt:acceptanceRoot+'/'+row.path});if([resultPath,inventoryPath,decisionPath].includes(row.path))files.set(row.path,bytes);}
 for(const b of fixedBindings){const bytes=files.get(b.path);assert.equal(bytes.length,b.byteLength);assert.equal(hash(bytes),b.sha256);}
 const report=JSON.parse(files.get(resultPath)),inventory=JSON.parse(files.get(inventoryPath)),plan=JSON.parse(files.get(planPath));
 assert.equal(report.completeCommonReview,true);assert.equal(report.humanApproval,false);assert.equal(report.sourceReleaseApproved,false);assert.equal(report.counts.sourceIds,380);assert.equal(report.counts.actualUses,5045);assert.equal(report.counts.newUses,2909);assert.equal(inventory.rows.length,380);assert.equal(plan.rows.length,129);
 assert.deepEqual(report.sources.map(r=>r.sourceId).sort(),inventory.rows.map(r=>r.sourceId).sort());
 const unique=new Map([...evidence,...fixedBindings].map(row=>[row.path,row]));
 return{files,receipt,report,inventory,plan,evidence:[...unique.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'))};
}
export function makeSourceApproval(inputs){
 const{files,receipt,report,inventory,plan,evidence}=inputs;
 for(const row of fixedBindings){assert.ok(Buffer.isBuffer(files.get(row.path)));assert.equal(hash(files.get(row.path)),row.sha256);assert.equal(files.get(row.path).length,row.byteLength);}
 for(const[path,value]of[[receiptPath,receipt],[resultPath,report],[inventoryPath,inventory],[planPath,plan]])assert.deepEqual(value,JSON.parse(files.get(path)),'Detached input changed '+path);
 const expectedEvidence=new Map([...receipt.artifacts.map(row=>({...row,archivedAt:acceptanceRoot+'/'+row.path})),...fixedBindings].map(row=>[row.path,row]));
 assert.deepEqual(evidence,[...expectedEvidence.values()].sort((a,b)=>a.path.localeCompare(b.path,'en')),'Evidence binding changed');
 assert.equal(receipt.humanAcceptance,true);assert.equal(report.completeCommonReview,true);assert.equal(report.humanApproval,false);assert.equal(plan.counts.rows,129);assert.equal(plan.humanApproval,false);
 return{formatVersion:'1.0.0',dataKind:'sourceReviewApproval',approvalId:'2026-10-28-mvp-010-source-approval.1',approvedOn:receipt.acceptedOn,approvedBy:'David Steimer',recordStatus:'approved',humanSourceApproval:true,sourceReleaseApproved:false,dataPromotionApproved:false,buildApproved:false,commitApproved:false,publicationApproved:false,operatingApproval:false,
 declaration:receipt.userStatement,decisionRef:decisionPath,candidateReleaseId:inventory.candidateReleaseId,
 acceptanceRef:fixedBindings[0],commonReviewRef:fixedBindings[1],sourceInventoryRef:fixedBindings[2],sourceAdoptionPlanRef:fixedBindings[3],
 scope:{sourceIds:380,actualUses:5045,retainedUses:2136,newUses:2909,lots:12,administrativePaths:245,additionalCasesApproved:false,socialRules:44,socialBindings:50,socialOperativeCantons:['BE'],socialCoverage:{from:'2026-01-01',to:'2027-12-31'},allOriginalsFreshlyRead:false,unlimitedFutureStabilityProof:false},
 acceptedSourceIds:report.sources.map(r=>r.sourceId).sort(),
 explicitBoundedReuse:{AIcurrentCorrectionHistoricalStatusRetained:true,AIcurrentConflictClaim:false,FRmirrorPositiveApproval:false,FRundatedReformPreserved:true,NEgatePreserved:true,KVGmaterialEditionFindingRetained:true,originalDatesAndFlagsPreserved:true,januaryComparisonsUnchanged:true,GRandNEReservationsRetained:true,AVIVoptionBRetained:true,OF001Retained:true,nextOrdinarySourceReview:'2026-11-15',annualReviewCompleted:false},
 permissions:{sourceReviewApproved:true,localDataPromotionAuthorized:false,definitiveLocalBuildAuthorized:false,localCommitAuthorized:false,installationAuthorized:false,publicationAuthorized:false,operatingApproval:false},
 responsibility:{humanDecisionBy:'David Steimer',operatingModel:'personalUnion',formalFourEyes:false,documentedWith:'Codex'},evidence};
}
export function validateSourceApproval(value,inputs){assert.deepEqual(value,makeSourceApproval(inputs),'Changed source acceptance, identity, scope or evidence');return true;}
export async function verifySourceApproval(repository=root){const inputs=await loadApprovalInputs(repository),bytes=await readRegular(repository,approvalPath);validateSourceApproval(JSON.parse(bytes),inputs);return{path:approvalPath,approvalSha256:hash(bytes),approvalByteLength:bytes.length,acceptedSourceIds:380};}
export async function recordSourceApproval(repository=root){assert.equal(repository,root,'Execution belongs to the bound repository');await requireR10BApproval();const inputs=await loadApprovalInputs(repository);await writeExclusive(repository,approvalPath,encode(makeSourceApproval(inputs)));return verifySourceApproval(repository);}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.ok(process.argv.length===2||(process.argv.length===3&&['--write','--check'].includes(process.argv[2])));console.log(JSON.stringify(await(process.argv[2]==='--write'?recordSourceApproval():verifySourceApproval()),null,2));}
