// SPDX-License-Identifier: AGPL-3.0-only
// One exclusive NE/VD/VS research baseline. Never refresh existing evidence.
import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {lstat,mkdir,open,readdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance,archiveConfig,safeRelative,sha256} from './archive-ap23l3-acceptance.mjs';
export {safeRelative,sha256};
export const researchConfig=Object.freeze({
 output:'outputs/ap23m1-2026-10-27',startSnapshot:'outputs/ap23m1-start-2026-10-27',head:'70ce67425e046a7a38a4fbe66acbd93c75ca5983',
 archive:archiveConfig.target,archiveFiles:1427,receiptSha256:'f09d6c37f5a70afdb26dcd924df44bd9d01ed90764f94dcb884a631816fc0927',
 priorGuard:archiveConfig.guard.path,priorGuardSha256:archiveConfig.guard.sha256,priorGuardCount:9130,
 proof:archiveConfig.proofPath,proofSha256:archiveConfig.proofSha256,
 proposal:'docs/planung/ap23m1-vorbereitung-ne-vd-vs.md',
 living:['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
  'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md'],
 trees:['src','schemas','data/releases','data/candidates','spfx/src','tests','scripts','spfx/scripts','spfx/config','public-app'],
 allowedNewResearchTests:['tests/governance/ap23m1-research.test.mjs','tests/governance/ap23m1-references.test.mjs'],
 allowedNewResearchScripts:['scripts/prepare-ap23m1.mjs','scripts/check-ap23m1-preservation.mjs','scripts/check-ap23m1.mjs',
  'scripts/check_ap23m1_references.py','scripts/finalize-ap23m1.mjs'],
 additionalInputs:['package.json','package-lock.json','tsconfig.json','spfx/package.json','spfx/sharepoint/solution/fristenrechner-schweiz.sppkg',
  'docs/fachrecht/abnahme-ap23l3.md','scripts/archive-ap23l3-acceptance.mjs'],
 userDocument:'outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.docx',
 userDocumentSha256:'46e7e3fc9e8eeeeca035c56dbb06eeb0c55f60c423a0bea5f4075bf61b4cac61',
 userStartStatement:'Einverstanden. Bitte starte AP23M1 für Neuenburg, Waadt und Wallis im vorgeschlagenen Untersuchungsumfang.'
});
export async function checkedPath(root,path,{missing=false}={}){
 const base=await lstat(root);assert.ok(base.isDirectory()&&!base.isSymbolicLink(),'Invalid root');let current=root;const parts=safeRelative(path).split('/');
 for(const[index,part]of parts.entries()){current=resolve(current,part);let value;
  try{value=await lstat(current);}catch(error){if(missing&&error.code==='ENOENT')return;throw error;}
  assert.ok(!value.isSymbolicLink(),'Symlink not allowed '+path);assert.ok(index===parts.length-1||value.isDirectory(),'Not a directory '+path);}
}
export async function exact(root,path,expected){
 await checkedPath(root,path);const handle=await open(resolve(root,path),constants.O_RDONLY|constants.O_NOFOLLOW);
 try{assert.ok((await handle.stat()).isFile());const bytes=await handle.readFile();if(expected!==undefined)assert.equal(sha256(bytes),expected,'Protected bytes changed '+path);return bytes;}
 finally{await handle.close();}
}
export async function walk(root,directory){
 await checkedPath(root,directory);const result=[];for(const item of await readdir(resolve(root,directory),{withFileTypes:true})){
  const path=directory+'/'+item.name;assert.ok(!item.isSymbolicLink(),'Symlink not allowed '+path);
  if(item.isDirectory())result.push(...await walk(root,path));else{assert.ok(item.isFile());result.push(path);}
 }return result.sort();
}
export const isResearchAddition=(path,config=researchConfig)=>[...config.allowedNewResearchTests,...config.allowedNewResearchScripts].includes(path);
async function directoryInventory(root,directory){const paths=[];for(const item of await readdir(resolve(root,directory),{withFileTypes:true})){
 const path=directory+'/'+item.name;assert.ok(!item.isSymbolicLink(),'Symlink not allowed '+path);if(item.isDirectory()){paths.push(path,...await directoryInventory(root,path));}}
 return paths.sort();}
export async function verifyStartSnapshot({root=process.cwd(),snapshot,expectedSha256,config=researchConfig}={}){
 root=resolve(root);const receiptPath=snapshot+'/receipt.json',receiptRaw=await exact(root,receiptPath,expectedSha256),receipt=JSON.parse(receiptRaw);
 assert.equal(receipt.workPackage,'AP23M1');assert.equal(receipt.kind,'explicit-research-start-snapshot');assert.equal(receipt.startedBy,'David Steimer');
 assert.equal(receipt.userStartStatement,config.userStartStatement);assert.equal(receipt.professionalStepStarted,true);assert.equal(receipt.originalProposalUnchanged,true);
 assert.equal(receipt.preexistingPreparationVerificationExpected,false);
 for(const flag of['professionalAcceptance','m2Started','m3Started','productCodeChangePermission','sourceReleaseApproved','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(receipt[flag],false,flag);
 const paths=[config.proposal,...config.living];assert.deepEqual(receipt.artifacts.map(row=>row.path),paths);assert.equal(new Set(paths).size,paths.length);
 for(const item of receipt.artifacts){safeRelative(item.path);assert.deepEqual(Object.keys(item).sort(),['byteLength','path','sha256']);const raw=await exact(root,snapshot+'/'+item.path,item.sha256);assert.equal(raw.length,item.byteLength);}
 const expectedFiles=[receiptPath,...paths.map(path=>snapshot+'/'+path)].sort(),actual=await walk(root,snapshot);assert.deepEqual(actual,expectedFiles,'Closed start snapshot inventory');
 const expectedDirectories=new Set();for(const path of expectedFiles){let parent=dirname(path);while(parent!==snapshot&&parent!=='.'){expectedDirectories.add(parent);parent=dirname(parent);}}
 assert.deepEqual(await directoryInventory(root,snapshot),[...expectedDirectories].sort(),'Closed start snapshot directory inventory');
 return{path:receiptPath,sha256:sha256(receiptRaw),byteLength:receiptRaw.length,payloadFiles:paths.length,artifacts:receipt.artifacts};
}
export async function prepareProtection({root=process.cwd(),config=researchConfig,verifyArchive=archiveAcceptance,
 readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
 root=resolve(root);const guardPath=config.output+'/protected-inputs.json';await checkedPath(root,guardPath,{missing:true});
 await assert.rejects(lstat(resolve(root,guardPath)),{code:'ENOENT'},'M1 start inventory already exists. Never refresh.');
 await checkedPath(root,config.startSnapshot,{missing:true});await assert.rejects(lstat(resolve(root,config.startSnapshot)),{code:'ENOENT'},'M1 start snapshot already exists. Never replace.');
 const archive=await verifyArchive({root});assert.equal(archive.mode,'archive-reverified');assert.equal(archive.verified,true);
 assert.equal(archive.files,config.archiveFiles);assert.equal(archive.receiptSha256,config.receiptSha256);
 const receipt=JSON.parse(await exact(root,config.archive+'/receipt.json',config.receiptSha256));assert.equal(receipt.professionalTechnicalAcceptance,true);assert.equal(receipt.artifacts.length,config.archiveFiles);
 for(const flag of['sourceReleaseApproved','calendarExportEnabled','deployable','deployed','sourcePublished','operatingPermission','commitPermission','sourcePushPermission'])assert.equal(receipt[flag],false,flag);
 const living=new Set(config.living),files={},composition={historicalProtected:0,currentAcceptedL3:0,archivedL3Payload:0,archivedL3Receipt:1,startPayload:8,startReceipt:1,originalProposal:1,existingTreeFiles:0,additionalInputs:0};
 async function protect(path,expected){safeRelative(path);assert.ok(!living.has(path),'Living status is not immutable '+path);const bytes=await exact(root,path,expected),actual=sha256(bytes);
  if(Object.hasOwn(files,path))assert.equal(files[path],actual,'Conflicting protected binding '+path);files[path]=actual;return bytes;}
 const prior=JSON.parse(await protect(config.priorGuard,config.priorGuardSha256));assert.equal(Object.keys(prior.files).length,config.priorGuardCount);
 for(const[path,hash]of Object.entries(prior.files)){await protect(path,hash);composition.historicalProtected++;}
 for(const item of receipt.artifacts){if(!living.has(item.path)){await protect(item.path,item.sha256);composition.currentAcceptedL3++;}
  await protect(config.archive+'/'+item.path,item.sha256);composition.archivedL3Payload++;}
 await protect(config.archive+'/receipt.json',config.receiptSha256);
 const proofRaw=await protect(config.proof,config.proofSha256),proof=JSON.parse(proofRaw);assert.equal(proof.professionalTechnicalAcceptance,false);assert.equal(proof.status,'local-technical-verification-passed-awaiting-human-acceptance');
 const proposalRaw=await protect(config.proposal);const snapshotRaw=new Map([[config.proposal,proposalRaw]]),livingAtStart={};
 for(const path of config.living){const raw=await exact(root,path);snapshotRaw.set(path,raw);livingAtStart[path]=sha256(raw);}
 assert.equal(snapshotRaw.size,8,'Original proposal plus exactly seven living texts');
 const treeFiles={};for(const directory of config.trees){const paths=(await walk(root,directory)).filter(path=>!isResearchAddition(path,config));treeFiles[directory]=paths;
  for(const path of paths){await protect(path);composition.existingTreeFiles++;}}
 for(const path of config.additionalInputs){await protect(path);composition.additionalInputs++;}
 await protect(config.userDocument,config.userDocumentSha256);const head=await readHead(root);assert.equal(head,config.head);assert.equal(head,prior.head);
 const startReceipt={workPackage:'AP23M1',kind:'explicit-research-start-snapshot',asOf:'2026-10-27',startedBy:'David Steimer',userStartStatement:config.userStartStatement,
  professionalStepStarted:true,professionalAcceptance:false,m2Started:false,m3Started:false,originalProposalUnchanged:true,preexistingPreparationVerificationExpected:false,
  productCodeChangePermission:false,sourceReleaseApproved:false,commitCreated:false,sourcePushPerformed:false,operatingChanges:false,
  artifacts:[...snapshotRaw].map(([path,raw])=>({path,byteLength:raw.length,sha256:sha256(raw)})),
  boundary:'Exact human M1 research start. The original native Markdown proposal and its pending wording remain unchanged. No earlier machine verification is invented. No M1 acceptance, M2/M3 start or product/operating authority.'};
 const startRaw=Buffer.from(JSON.stringify(startReceipt,null,2)+'\n');await mkdir(dirname(resolve(root,config.startSnapshot)),{recursive:true});await mkdir(resolve(root,config.startSnapshot));
 for(const[path,raw]of snapshotRaw){const target=config.startSnapshot+'/'+path;await checkedPath(root,target,{missing:true});await mkdir(dirname(resolve(root,target)),{recursive:true});await writeFile(resolve(root,target),raw,{flag:'wx'});files[target]=sha256(raw);await exact(root,target,files[target]);}
 const startReceiptPath=config.startSnapshot+'/receipt.json';await writeFile(resolve(root,startReceiptPath),startRaw,{flag:'wx'});files[startReceiptPath]=sha256(startRaw);
 const snapshot=await verifyStartSnapshot({root,snapshot:config.startSnapshot,expectedSha256:sha256(startRaw),config});
 const result={workPackage:'AP23M1',createdOn:'2026-10-27',capturedAtResearchStart:true,capturedBeforeLivingUpdates:true,
  scopeConfirmedBy:'David Steimer',userStartStatement:config.userStartStatement,head,acceptedL3Archive:archive,
  originalPreparation:{proposal:config.proposal,proposalSha256:sha256(proposalRaw),verificationExpected:false},startSnapshot:snapshot,
  previousGuard:{path:config.priorGuard,sha256:config.priorGuardSha256,protectedFiles:config.priorGuardCount},
  originalL3Proof:{path:config.proof,sha256:config.proofSha256},userDocument:{path:config.userDocument,sha256:config.userDocumentSha256},composition,
  files:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b,'en'))),livingAtStart,treeFiles,
  allowedNewResearchTests:config.allowedNewResearchTests,allowedNewResearchScripts:config.allowedNewResearchScripts,
  productCodeChangePermission:false,sourceReleaseApproved:false,professionalAcceptance:false,m2Started:false,m3Started:false,operatingChanges:false,
  scope:'NE/VD/VS professional research started by David. Existing product, schemas, releases, candidates, tests, scripts, SPFx sources/configuration, L3 evidence/archive, original proposal and user document remain immutable. Seven living texts and exact new M1 research helpers/tests are separated. New research findings belong only under docs/fachrecht/ap23m1, private captures under .work/research/AP23M1 and M1 outputs. No build, format change, commit, push, upload or operating change.'};
 const bytes=Buffer.from(JSON.stringify(result,null,2)+'\n');await mkdir(resolve(root,config.output),{recursive:true});await checkedPath(root,guardPath,{missing:true});await writeFile(resolve(root,guardPath),bytes,{flag:'wx'});assert.deepEqual(await exact(root,guardPath,sha256(bytes)),bytes);
 return{status:'research-baseline-frozen',guardPath,guardSha256:sha256(bytes),guardByteLength:bytes.length,protectedFiles:Object.keys(files).length,
  livingStatusFiles:config.living.length,startSnapshot:snapshot,composition,head};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.equal(process.argv.length,2);console.log(JSON.stringify(await prepareProtection(),null,2));}
