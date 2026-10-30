// SPDX-License-Identifier: AGPL-3.0-only
// Freeze the accepted inputs before I1 research or living-status edits. Never refresh.
import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {lstat,mkdir,open,readFile,readdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance,safeRelative,sha256} from './archive-ap23h3-acceptance.mjs';
export {safeRelative,sha256};
export const researchConfig=Object.freeze({
  output:'outputs/ap23i1-2026-10-22',head:'70ce67425e046a7a38a4fbe66acbd93c75ca5983',
  archive:'outputs/ap23h3-abnahme-2026-10-22',archiveFiles:417,
  receiptSha256:'49bc0fa9060a52d0301dd7b55c269cbc4834cd47170b592db8f7cdb1da4cb357',
  h3Guard:'outputs/ap23h3-2026-10-22/protected-inputs.json',
  h3Additional:'outputs/ap23h3-2026-10-22/additional-mutable-inputs.json',historicalCount:1810,additionalCount:2,
  preparationDirectory:'outputs/ap23i1-vorbereitung-2026-10-22',
  preparation:'outputs/ap23i1-vorbereitung-2026-10-22/verification.json',
  preparationSha256:'2b72c7be42e5ce4ae5e72a2c07d37ebf123387e28ef035c16d65cbbd571d66f0',
  proposal:'docs/planung/ap23i1-vorbereitung-gl-tg.md',proposalSha256:'5f09d27b1ac74e4967de02158b447812126ae8a2404a20b54229ae8d2870f4a3',
  userDocument:'outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.docx',
  userDocumentSha256:'46e7e3fc9e8eeeeca035c56dbb06eeb0c55f60c423a0bea5f4075bf61b4cac61',
  living:['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
    'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md'],
  trees:['src','schemas','data/releases','data/candidates','spfx/src','tests'],
  allowedNewResearchTests:['tests/governance/ap23i1-research.test.mjs','tests/governance/ap23i1-references.test.mjs'],
  userStartStatement:'Einverstanden. Bitte starte AP23I1 für Glarus und Thurgau im vorgeschlagenen Untersuchungsumfang.'
});
export async function checkedPath(root,path,{missing=false}={}){
  const base=await lstat(root);assert.ok(base.isDirectory()&&!base.isSymbolicLink(),'Invalid root');
  const parts=safeRelative(path).split('/');let current=root;
  for(const[index,part]of parts.entries()){
    current=resolve(current,part);let stat;
    try{stat=await lstat(current);}catch(error){if(missing&&error.code==='ENOENT')return;throw error;}
    assert.ok(!stat.isSymbolicLink(),'Symlink not allowed: '+path);
    assert.ok(index===parts.length-1||stat.isDirectory(),'Not a directory: '+path);
  }
}
export async function exact(root,path,expected){
  await checkedPath(root,path);const file=await open(resolve(root,path),constants.O_RDONLY|constants.O_NOFOLLOW);
  try{assert.ok((await file.stat()).isFile(),'Not a regular input: '+path);const bytes=await file.readFile();
    if(expected!==undefined)assert.equal(sha256(bytes),expected,'Protected bytes changed: '+path);return bytes;
  }finally{await file.close();}
}
export async function walk(root,directory){
  await checkedPath(root,directory);const result=[];
  for(const item of await readdir(resolve(root,directory),{withFileTypes:true})){
    const path=directory+'/'+item.name;assert.ok(!item.isSymbolicLink(),'Symlink not allowed: '+path);
    if(item.isDirectory())result.push(...await walk(root,path));else{assert.ok(item.isFile(),'Not a regular input: '+path);result.push(path);}
  }
  return result.sort();
}
export async function prepareProtection({root=process.cwd(),config=researchConfig,verifyArchive=archiveAcceptance}={}){
  root=resolve(root);const guardPath=config.output+'/protected-inputs.json';
  await checkedPath(root,guardPath,{missing:true});
  let exists=false;try{await lstat(resolve(root,guardPath));exists=true;}catch(error){if(error.code!=='ENOENT')throw error;}
  assert.equal(exists,false,'Research baseline already frozen. Never refresh it.');
  const archive=await verifyArchive({root});assert.equal(archive.mode,'archive-reverified');assert.equal(archive.verified,true);
  assert.equal(archive.files,config.archiveFiles);assert.equal(archive.receiptSha256,config.receiptSha256);
  const receiptBytes=await exact(root,config.archive+'/receipt.json',config.receiptSha256),receipt=JSON.parse(receiptBytes);
  assert.equal(receipt.professionalTechnicalAcceptance,true);assert.equal(receipt.artifacts.length,config.archiveFiles);
  for(const key of['sourceReleaseApproved','calendarExportEnabled','deployable','deployed','published','operatingPermission'])assert.equal(receipt[key],false,key);
  const accepted=new Map(receipt.artifacts.map(row=>[row.path,row]));assert.equal(accepted.size,receipt.artifacts.length);
  const h3Guard=JSON.parse(await exact(root,config.h3Guard,accepted.get(config.h3Guard)?.sha256));
  const additional=JSON.parse(await exact(root,config.h3Additional,accepted.get(config.h3Additional)?.sha256));
  assert.equal(Object.keys(additional.files).length,config.additionalCount);assert.equal(additional.productOperatingChanges,false);
  const files={},composition={historicalProtected:0,currentRegistry:0,currentAcceptedH3:0,archivedH3Payload:0,archivedH3Receipt:1,originalPreparation:0,existingTreeFiles:0};
  const living=new Set(config.living);
  async function protect(path,expected){
    safeRelative(path);assert.ok(!living.has(path),'Living input cannot be protected: '+path);
    const bytes=await exact(root,path,expected),actual=sha256(bytes);
    if(Object.hasOwn(files,path))assert.equal(files[path],actual,'Conflicting protected binding: '+path);
    files[path]=actual;return bytes;
  }
  for(const[path,hash]of Object.entries(h3Guard.files)){
    if(Object.hasOwn(additional.files,path))continue;assert.ok(!living.has(path));await protect(path,hash);composition.historicalProtected++;
  }
  assert.equal(composition.historicalProtected,config.historicalCount);
  for(const[path,item]of Object.entries(additional.files)){
    assert.equal(h3Guard.files[path],item.beforeSha256);assert.ok(accepted.has(path),'Registry is not in accepted H3 receipt');
    await protect(path,accepted.get(path).sha256);composition.currentRegistry++;
  }
  for(const item of receipt.artifacts){
    if(!living.has(item.path)){await protect(item.path,item.sha256);composition.currentAcceptedH3++;}
    await protect(config.archive+'/'+item.path,item.sha256);composition.archivedH3Payload++;
  }
  await protect(config.archive+'/receipt.json',config.receiptSha256);
  const prepBytes=await exact(root,config.preparation,config.preparationSha256),prep=JSON.parse(prepBytes);
  assert.equal(prep.status,'passed');assert.equal(prep.head,config.head);assert.equal(prep.h3HumanAcceptance,true);
  for(const key of['i1ScopeConfirmed','i1Started','i2Started','i3Started','sourceReleaseApproved','regularIntermediateRelease','commitCreated','sourcePushPerformed','githubStatusPublished','installationPerformed'])assert.equal(prep[key],false,'Original preparation flag '+key);
  assert.equal(prep.archive.receiptSha256,config.receiptSha256);assert.equal(prep.archive.files,config.archiveFiles);
  await exact(root,config.proposal,config.proposalSha256);
  for(const item of prep.files){
    await exact(root,item.path,item.sha256);
    if(!living.has(item.path)){await protect(item.path,item.sha256);composition.originalPreparation++;}
  }
  for(const path of await walk(root,config.preparationDirectory)){await protect(path,path===config.preparation?config.preparationSha256:undefined);composition.originalPreparation++;}
  const treeFiles={};
  for(const directory of config.trees){
    const paths=(await walk(root,directory)).filter(path=>!config.allowedNewResearchTests.includes(path));treeFiles[directory]=paths;
    for(const path of paths){await protect(path);composition.existingTreeFiles++;}
  }
  await protect(config.userDocument,config.userDocumentSha256);
  const livingAtStart={};
  for(const path of config.living){
    const acceptedPrep=prep.files.find(item=>item.path===path);assert.ok(acceptedPrep,'Living input missing from preparation');
    livingAtStart[path]=sha256(await exact(root,path,acceptedPrep.sha256));
  }
  const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();assert.equal(head,config.head);assert.equal(head,h3Guard.head);
  const sorted=Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b,'en')));
  const result={workPackage:'AP23I1',createdOn:'2026-10-22',capturedBeforeResearch:true,capturedBeforeLivingUpdates:true,
    scopeConfirmedBy:'David Steimer',userStartStatement:config.userStartStatement,head,acceptedH3Archive:archive,
    originalPreparation:{path:config.preparation,sha256:config.preparationSha256,proposal:config.proposal,proposalSha256:config.proposalSha256},
    userDocument:{path:config.userDocument,sha256:config.userDocumentSha256},composition,files:sorted,livingAtStart,treeFiles,
    allowedNewResearchTests:config.allowedNewResearchTests,
    productCodeChangePermission:false,sourceReleaseApproved:false,operatingChanges:false,
    scope:'GL/TG legal research only. Existing product code, packages, normative data, schemas, tests, historical proofs and the original I1 preparation remain immutable. Exactly seven living entry texts may track the authorised research start and results. New I1 research documents, source captures and governance evidence may be created without runtime integration.'};
  const bytes=Buffer.from(JSON.stringify(result,null,2)+'\n');
  await checkedPath(root,guardPath,{missing:true});await mkdir(resolve(root,config.output),{recursive:true});
  await checkedPath(root,guardPath,{missing:true});await writeFile(resolve(root,guardPath),bytes,{flag:'wx'});
  assert.deepEqual(await exact(root,guardPath,sha256(bytes)),bytes);
  return{status:'research-baseline-frozen',guardPath,guardSha256:sha256(bytes),guardByteLength:bytes.length,protectedFiles:Object.keys(files).length,livingStatusFiles:config.living.length,composition,head};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.equal(process.argv.length,2,'No baseline refresh or alternate CLI config is supported');
  console.log(JSON.stringify(await prepareProtection(),null,2));
}
