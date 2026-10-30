// SPDX-License-Identifier: AGPL-3.0-only
// Freeze the confirmed K1 inputs before research and living-status updates. Never refresh.
import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {lstat,mkdir,open,readdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance,safeRelative,sha256} from './archive-ap23j3-acceptance.mjs';
export {safeRelative,sha256};
export const researchConfig=Object.freeze({
  output:'outputs/ap23k1-2026-10-27',head:'70ce67425e046a7a38a4fbe66acbd93c75ca5983',
  archive:'outputs/ap23j3-abnahme-2026-10-27',archiveFiles:1284,
  receiptSha256:'2dc1ad03491435959c2985934436be99bf7dcf924eb65fe71a4c6187ea505b1a',
  j3Guard:'outputs/ap23j3-2026-10-27/protected-inputs.json',historicalCount:4466,
  preparation:'outputs/ap23k1-vorbereitung-2026-10-27/verification.json',
  proposal:'docs/planung/ap23k1-vorbereitung-bs-bl.md',
  userDocument:'outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.docx',
  userDocumentSha256:'46e7e3fc9e8eeeeca035c56dbb06eeb0c55f60c423a0bea5f4075bf61b4cac61',
  living:['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
    'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md'],
  trees:['src','schemas','data/releases','data/candidates','spfx/src','tests'],
  allowedNewResearchTests:['tests/governance/ap23k1-research.test.mjs','tests/governance/ap23k1-references.test.mjs'],
  userStartStatement:'Einverstanden. Bitte starte AP23K1 für Basel-Stadt und Basel-Landschaft im vorgeschlagenen Untersuchungsumfang.'
});
export async function checkedPath(root,path,{missing=false}={}){
  const base=await lstat(root);assert.ok(base.isDirectory()&&!base.isSymbolicLink(),'Invalid root');
  const parts=safeRelative(path).split('/');let current=root;
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
export async function prepareProtection({root=process.cwd(),config=researchConfig,verifyArchive=archiveAcceptance}={}){
  root=resolve(root);const guardPath=config.output+'/protected-inputs.json';
  await checkedPath(root,guardPath,{missing:true});
  await assert.rejects(lstat(resolve(root,guardPath)),{code:'ENOENT'},'K1 baseline already exists. Never refresh.');
  const archive=await verifyArchive({root});assert.equal(archive.mode,'archive-reverified');assert.equal(archive.verified,true);
  assert.equal(archive.files,config.archiveFiles);assert.equal(archive.receiptSha256,config.receiptSha256);
  const receipt=JSON.parse(await exact(root,config.archive+'/receipt.json',config.receiptSha256));
  assert.equal(receipt.professionalTechnicalAcceptance,true);assert.equal(receipt.artifacts.length,config.archiveFiles);
  for(const key of['sourceReleaseApproved','calendarExportEnabled','deployable','deployed','sourcePublished','operatingPermission','commitPermission','sourcePushPermission'])assert.equal(receipt[key],false,key);
  const living=new Set(config.living),files={},composition={historicalProtected:0,currentAcceptedJ3:0,archivedJ3Payload:0,
    archivedJ3Receipt:1,originalPreparation:0,existingTreeFiles:0};
  async function protect(path,expected){
    safeRelative(path);assert.ok(!living.has(path),'Living status is not immutable '+path);
    const bytes=await exact(root,path,expected),actual=sha256(bytes);
    if(Object.hasOwn(files,path))assert.equal(files[path],actual,'Conflicting protected binding '+path);
    files[path]=actual;return bytes;
  }
  const oldGuard=JSON.parse(await exact(root,config.j3Guard,receipt.artifacts.find(row=>row.path===config.j3Guard)?.sha256));
  for(const[path,hash]of Object.entries(oldGuard.files)){await protect(path,hash);composition.historicalProtected++;}
  assert.equal(composition.historicalProtected,config.historicalCount);
  for(const row of receipt.artifacts){
    if(!living.has(row.path)){await protect(row.path,row.sha256);composition.currentAcceptedJ3++;}
    await protect(config.archive+'/'+row.path,row.sha256);composition.archivedJ3Payload++;
  }
  await protect(config.archive+'/receipt.json',config.receiptSha256);
  const prepBytes=await exact(root,config.preparation),prep=JSON.parse(prepBytes);
  assert.equal(prep.status,'passed');assert.equal(prep.head,config.head);assert.equal(prep.j3HumanAcceptance,true);
  for(const key of['k1ScopeConfirmed','k1Started','k2Started','k3Started','sourceReleaseApproved','regularIntermediateRelease',
    'commitCreated','sourcePushPerformed','githubStatusPublished','installationPerformed','operatingChanges'])assert.equal(prep[key],false,key);
  assert.equal(prep.archive.receiptSha256,config.receiptSha256);assert.equal(prep.archive.files,config.archiveFiles);
  const proposalBytes=await exact(root,config.proposal,prep.proposalSha256);
  for(const row of prep.files){await exact(root,row.path,row.sha256);
    if(!living.has(row.path)){await protect(row.path,row.sha256);composition.originalPreparation++;}}
  await protect(config.preparation,sha256(prepBytes));
  const treeFiles={};
  for(const directory of config.trees){
    const paths=(await walk(root,directory)).filter(path=>!config.allowedNewResearchTests.includes(path));treeFiles[directory]=paths;
    for(const path of paths){await protect(path);composition.existingTreeFiles++;}
  }
  await protect(config.userDocument,config.userDocumentSha256);
  const livingAtStart={};
  for(const path of config.living){const previous=prep.files.find(row=>row.path===path);assert.ok(previous);
    livingAtStart[path]=sha256(await exact(root,path,previous.sha256));}
  const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();assert.equal(head,config.head);assert.equal(head,oldGuard.head);
  const result={workPackage:'AP23K1',createdOn:'2026-10-27',capturedBeforeResearch:true,capturedBeforeLivingUpdates:true,
    scopeConfirmedBy:'David Steimer',userStartStatement:config.userStartStatement,head,acceptedJ3Archive:archive,
    originalPreparation:{path:config.preparation,sha256:sha256(prepBytes),proposal:config.proposal,proposalSha256:sha256(proposalBytes)},
    userDocument:{path:config.userDocument,sha256:config.userDocumentSha256},composition,
    files:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b,'en'))),livingAtStart,treeFiles,
    allowedNewResearchTests:config.allowedNewResearchTests,productCodeChangePermission:false,sourceReleaseApproved:false,operatingChanges:false,
    scope:'BS/BL legal research only. Product code, schemas, accepted data and candidates, old tests, original J3 evidence, archive and approved K1 preparation stay immutable. Exactly seven living entry texts and two new K1-only research tests are separate. No runtime, release, commit, upload or operating changes.'};
  const bytes=Buffer.from(JSON.stringify(result,null,2)+'\n');await mkdir(resolve(root,config.output),{recursive:true});
  await checkedPath(root,guardPath,{missing:true});await writeFile(resolve(root,guardPath),bytes,{flag:'wx'});
  assert.deepEqual(await exact(root,guardPath,sha256(bytes)),bytes);
  return{status:'research-baseline-frozen',guardPath,guardSha256:sha256(bytes),guardByteLength:bytes.length,
    protectedFiles:Object.keys(files).length,livingStatusFiles:config.living.length,composition,head};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.equal(process.argv.length,2);console.log(JSON.stringify(await prepareProtection(),null,2));
}

