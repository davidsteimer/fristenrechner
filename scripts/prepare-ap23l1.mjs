// SPDX-License-Identifier: AGPL-3.0-only
// Exclusive start inventory for AI/SZ legal research. Existing evidence is never refreshed.
import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {lstat,mkdir,open,readdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance,archiveConfig,safeRelative,sha256} from './archive-ap23k3-acceptance.mjs';
export {safeRelative,sha256};
export const researchConfig=Object.freeze({
 output:'outputs/ap23l1-2026-10-27',head:'70ce67425e046a7a38a4fbe66acbd93c75ca5983',
 archive:archiveConfig.target,archiveFiles:1324,receiptSha256:'8609424600cfb276fa92338e7f4ef915034894f03c0e98ccb80f48c9002a0dd8',
 priorGuard:archiveConfig.guard.path,priorGuardSha256:archiveConfig.guard.sha256,priorGuardCount:6696,
 proof:archiveConfig.proofPath,proofSha256:archiveConfig.proofSha256,
 preparation:'outputs/ap23l1-vorbereitung-2026-10-27/verification.json',proposal:'docs/planung/ap23l1-vorbereitung-ai-sz.md',
 living:['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
  'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md'],
 trees:['src','schemas','data/releases','data/candidates','spfx/src','tests'],
 allowedNewResearchTests:['tests/governance/ap23l1-research.test.mjs','tests/governance/ap23l1-references.test.mjs'],
 userDocument:'outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.docx',
 userDocumentSha256:'46e7e3fc9e8eeeeca035c56dbb06eeb0c55f60c423a0bea5f4075bf61b4cac61',
 userStartStatement:'Einverstanden. Bitte starte AP23L1 für Appenzell Innerrhoden und Schwyz im vorgeschlagenen Untersuchungsumfang.'
});
export async function checkedPath(root,path,{missing=false}={}){
 const base=await lstat(root);assert.ok(base.isDirectory()&&!base.isSymbolicLink(),'Invalid root');
 let current=root;const parts=safeRelative(path).split('/');
 for(const[index,part]of parts.entries()){
  current=resolve(current,part);let value;
  try{value=await lstat(current);}catch(error){if(missing&&error.code==='ENOENT')return;throw error;}
  assert.ok(!value.isSymbolicLink(),'Symlink not allowed '+path);
  assert.ok(index===parts.length-1||value.isDirectory(),'Not a directory '+path);
 }
}
export async function exact(root,path,expected){
 await checkedPath(root,path);const handle=await open(resolve(root,path),constants.O_RDONLY|constants.O_NOFOLLOW);
 try{assert.ok((await handle.stat()).isFile());const bytes=await handle.readFile();
  if(expected!==undefined)assert.equal(sha256(bytes),expected,'Protected bytes changed '+path);return bytes;
 }finally{await handle.close();}
}
export async function walk(root,directory){
 await checkedPath(root,directory);const result=[];
 for(const item of await readdir(resolve(root,directory),{withFileTypes:true})){
  const path=directory+'/'+item.name;assert.ok(!item.isSymbolicLink(),'Symlink not allowed '+path);
  if(item.isDirectory())result.push(...await walk(root,path));else{assert.ok(item.isFile());result.push(path);}
 }return result.sort();
}
export async function prepareProtection({root=process.cwd(),config=researchConfig,verifyArchive=archiveAcceptance,
 readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
 root=resolve(root);const guardPath=config.output+'/protected-inputs.json';
 await checkedPath(root,guardPath,{missing:true});
 await assert.rejects(lstat(resolve(root,guardPath)),{code:'ENOENT'},'L1 start inventory already exists. Never refresh.');
 const archive=await verifyArchive({root});assert.equal(archive.mode,'archive-reverified');assert.equal(archive.verified,true);
 assert.equal(archive.files,config.archiveFiles);assert.equal(archive.receiptSha256,config.receiptSha256);
 const receipt=JSON.parse(await exact(root,config.archive+'/receipt.json',config.receiptSha256));
 assert.equal(receipt.professionalTechnicalAcceptance,true);assert.equal(receipt.artifacts.length,config.archiveFiles);
 for(const flag of['sourceReleaseApproved','calendarExportEnabled','deployable','deployed','sourcePublished','operatingPermission','commitPermission','sourcePushPermission'])assert.equal(receipt[flag],false,flag);
 const living=new Set(config.living),files={},composition={historicalProtected:0,currentAcceptedK3:0,archivedK3Payload:0,archivedK3Receipt:1,originalPreparation:0,existingTreeFiles:0};
 async function protect(path,expected){
  safeRelative(path);assert.ok(!living.has(path),'Living status is not immutable '+path);
  const bytes=await exact(root,path,expected),actual=sha256(bytes);
  if(Object.hasOwn(files,path))assert.equal(files[path],actual,'Conflicting protected binding '+path);
  files[path]=actual;return bytes;
 }
 const prior=JSON.parse(await protect(config.priorGuard,config.priorGuardSha256));
 assert.equal(Object.keys(prior.files).length,config.priorGuardCount);
 for(const[path,hash]of Object.entries(prior.files)){await protect(path,hash);composition.historicalProtected++;}
 for(const row of receipt.artifacts){
  if(!living.has(row.path)){await protect(row.path,row.sha256);composition.currentAcceptedK3++;}
  await protect(config.archive+'/'+row.path,row.sha256);composition.archivedK3Payload++;
 }
 await protect(config.archive+'/receipt.json',config.receiptSha256);
 const prepBytes=await protect(config.preparation),prep=JSON.parse(prepBytes);
 assert.equal(prep.status,'prepared-not-started');assert.equal(prep.head,config.head);
 for(const flag of['professionalStepStarted','professionalAcceptance','sourceReleaseApproved','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(prep[flag],false,flag);
 assert.equal(prep.acceptedCantons,21);assert.equal(prep.operationalCantons,6);assert.equal(prep.localOnlyAcceptedCantons,15);
 for(const row of prep.inputs){
  const bytes=await exact(root,row.path,row.sha256);assert.equal(bytes.length,row.byteLength);
  if(!living.has(row.path)){await protect(row.path,row.sha256);composition.originalPreparation++;}
 }
 const proposalBytes=await exact(root,config.proposal);
 assert.ok(prep.inputs.some(row=>row.path===config.proposal&&row.sha256===sha256(proposalBytes)));
 const treeFiles={};
 for(const directory of config.trees){
  const paths=(await walk(root,directory)).filter(path=>!config.allowedNewResearchTests.includes(path));treeFiles[directory]=paths;
  for(const path of paths){await protect(path);composition.existingTreeFiles++;}
 }
 await protect(config.userDocument,config.userDocumentSha256);
 const livingAtStart={};for(const path of config.living){const expected=prep.inputs.find(row=>row.path===path);assert.ok(expected);
  livingAtStart[path]=sha256(await exact(root,path,expected.sha256));}
 const head=await readHead(root);assert.equal(head,config.head);assert.equal(head,prior.head);
 const result={workPackage:'AP23L1',createdOn:'2026-10-27',capturedAtResearchStart:true,capturedBeforeLivingUpdates:true,
  scopeConfirmedBy:'David Steimer',userStartStatement:config.userStartStatement,head,acceptedK3Archive:archive,
  originalPreparation:{path:config.preparation,sha256:sha256(prepBytes),proposal:config.proposal,proposalSha256:sha256(proposalBytes)},
  userDocument:{path:config.userDocument,sha256:config.userDocumentSha256},composition,
  files:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b,'en'))),livingAtStart,treeFiles,
  allowedNewResearchTests:config.allowedNewResearchTests,productCodeChangePermission:false,sourceReleaseApproved:false,operatingChanges:false,
  scope:'AI/SZ professional research started by David. Existing product, schemas, data, candidates, tests, K3 evidence/archive and original L1 preparation remain immutable. Exactly seven living status files and two new L1-only research tests are separated. No build, commit, push, upload or operating change.'};
 const bytes=Buffer.from(JSON.stringify(result,null,2)+'\n');await mkdir(resolve(root,config.output),{recursive:true});
 await checkedPath(root,guardPath,{missing:true});await writeFile(resolve(root,guardPath),bytes,{flag:'wx'});
 assert.deepEqual(await exact(root,guardPath,sha256(bytes)),bytes);
 return{status:'research-baseline-frozen',guardPath,guardSha256:sha256(bytes),guardByteLength:bytes.length,
  protectedFiles:Object.keys(files).length,livingStatusFiles:config.living.length,composition,head};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,2);console.log(JSON.stringify(await prepareProtection(),null,2));
}
