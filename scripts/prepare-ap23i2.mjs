// SPDX-License-Identifier: AGPL-3.0-only
// Freeze accepted research and product baselines before isolated I2 planning. Never refresh.
import assert from 'node:assert/strict';
import {lstat,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance,archiveConfig,checkedPath,exact,safeRelative,sha256} from './archive-ap23i1-acceptance.mjs';
import {walk} from './prepare-ap23i1.mjs';
export {checkedPath,exact,walk,safeRelative,sha256};
export const preparationConfig=Object.freeze({
  output:'outputs/ap23i2-2026-10-22',head:'70ce67425e046a7a38a4fbe66acbd93c75ca5983',
  archive:archiveConfig.target,archiveFiles:133,receiptSha256:'36580dd3e7c8b02b482edccc7781fe51bfbebf2d2b0fcf4f7d37317ca5397af6',
  i1Guard:'outputs/ap23i1-2026-10-22/protected-inputs.json',i1GuardSha256:'63412fe5b7f012402f5cef555adebb6437a959bd915f3481541f4cb2e367d598',
  i1ProtectedCount:2496,i1Proof:archiveConfig.proofPath,i1ProofSha256:archiveConfig.proofSha256,
  userDocument:'outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.docx',
  userDocumentSha256:'46e7e3fc9e8eeeeca035c56dbb06eeb0c55f60c423a0bea5f4075bf61b4cac61',
  living:['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
    'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md'],
  trees:['src','schemas','data/releases','data/candidates','spfx/src','tests'],
  additionalProtected:['scripts/archive-ap23i1-acceptance.mjs','scripts/prepare-ap23i2.mjs','tests/governance/ap23i1-acceptance.test.mjs'],
  allowedNew:{schemaPrefix:'schemas/candidates/ap23i2/',testPattern:'^tests/governance/ap23i2-[^/]+$'},
  acceptedDecisionPoints:['I1-A','I1-B','I1-C','I1-D','I1-E','I1-F','I1-G'],
  userStartStatement:'AP23I1 ist einschliesslich der Punkte I1-A bis I1-G fachlich abgenommen. Bitte starte AP23I2.'
});
export function isAllowedNew(path,allowed=preparationConfig.allowedNew){
  safeRelative(path);return path.startsWith(allowed.schemaPrefix)||new RegExp(allowed.testPattern,'u').test(path);
}
export async function prepareProtection({root=process.cwd(),config=preparationConfig,verifyArchive=archiveAcceptance,
  readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
  root=resolve(root);const guardPath=config.output+'/protected-inputs.json';await checkedPath(root,guardPath,{missing:true});
  let exists=false;try{await lstat(resolve(root,guardPath));exists=true;}catch(error){if(error.code!=='ENOENT')throw error;}
  assert.equal(exists,false,'I2 baseline already frozen. Never refresh it.');
  const archive=await verifyArchive({root});assert.equal(archive.mode,'archive-reverified');assert.equal(archive.verified,true);
  assert.equal(archive.files,config.archiveFiles);assert.equal(archive.receiptSha256,config.receiptSha256);
  const receipt=JSON.parse(await exact(root,config.archive+'/receipt.json',config.receiptSha256));
  assert.equal(receipt.professionalAcceptance,true);assert.equal(receipt.i2Started,true);assert.deepEqual(receipt.acceptedDecisionPoints,config.acceptedDecisionPoints);
  assert.equal(receipt.artifacts.length,config.archiveFiles);
  for(const key of['formatDecision','implementationStarted','runtimeActivation','sourceReleaseApproved','releaseBuildPerformed','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(receipt[key],false,'Acceptance boundary '+key);
  const accepted=new Map(receipt.artifacts.map(item=>[item.path,item]));assert.equal(accepted.size,config.archiveFiles);
  assert.equal(accepted.get(config.i1Guard)?.sha256,config.i1GuardSha256);assert.equal(accepted.get(config.i1Proof)?.sha256,config.i1ProofSha256);
  const previous=JSON.parse(await exact(root,config.i1Guard,config.i1GuardSha256));
  assert.equal(previous.workPackage,'AP23I1');assert.equal(previous.capturedBeforeResearch,true);assert.equal(previous.capturedBeforeLivingUpdates,true);
  assert.equal(Object.keys(previous.files).length,config.i1ProtectedCount);assert.equal(previous.head,config.head);
  const files={},living=new Set(config.living),composition={previousProtected:0,currentAcceptedI1:0,archivedI1Payload:0,archivedI1Receipt:1,additionalGovernance:0,existingTreeFiles:0};
  async function protect(path,expected){
    safeRelative(path);assert.ok(!living.has(path),'Living input cannot be immutable');const bytes=await exact(root,path,expected),hash=sha256(bytes);
    if(Object.hasOwn(files,path))assert.equal(files[path],hash,'Conflicting protected input');files[path]=hash;return bytes;
  }
  for(const[path,hash]of Object.entries(previous.files)){await protect(path,hash);composition.previousProtected++;}
  for(const item of receipt.artifacts){
    if(!living.has(item.path)){await protect(item.path,item.sha256);composition.currentAcceptedI1++;}
    await protect(config.archive+'/'+item.path,item.sha256);composition.archivedI1Payload++;
  }
  await protect(config.archive+'/receipt.json',config.receiptSha256);
  for(const path of config.additionalProtected){await protect(path);composition.additionalGovernance++;}
  const treeFiles={};
  for(const directory of config.trees){treeFiles[directory]=await walk(root,directory);for(const path of treeFiles[directory]){await protect(path);composition.existingTreeFiles++;}}
  await protect(config.userDocument,config.userDocumentSha256);
  const livingAtStart={};for(const path of config.living){const item=accepted.get(path);assert.ok(item,'Living input missing from accepted I1 bindings');livingAtStart[path]=sha256(await exact(root,path,item.sha256));}
  const head=await readHead(root);assert.equal(head,config.head,'Git head changed');
  const result={workPackage:'AP23I2',createdOn:'2026-10-22',capturedBeforeTechnicalPlanning:true,capturedBeforeLivingUpdates:true,
    i1ProfessionallyAccepted:true,acceptedBy:'David Steimer',acceptedDecisionPoints:config.acceptedDecisionPoints,
    userStartStatement:config.userStartStatement,technicalPlanningStarted:true,head,acceptedI1Archive:archive,
    originalI1:{proof:config.i1Proof,proofSha256:config.i1ProofSha256,guard:config.i1Guard,guardSha256:config.i1GuardSha256,protectedCount:config.i1ProtectedCount},
    userDocument:{path:config.userDocument,sha256:config.userDocumentSha256},composition,
    files:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b,'en'))),livingAtStart,treeFiles,
    allowedNew:config.allowedNew,additionalProtected:config.additionalProtected,
    formatDecision:false,productCodeChangePermission:false,runtimeActivation:false,sourceReleaseApproved:false,
    releaseBuildPerformed:false,commitCreated:false,sourcePushPerformed:false,operatingChanges:false,
    scope:'Local I2 contract analysis only. All accepted I1 research bytes and historical product/data/schema/host/test inputs remain immutable. Only seven living entry texts may change. Newly created files under schemas/candidates/ap23i2/ and new tests/governance/ap23i2-* files are isolated proposals, never native runtime schemas or product changes.'};
  const bytes=Buffer.from(JSON.stringify(result,null,2)+'\n');await checkedPath(root,guardPath,{missing:true});await mkdir(resolve(root,config.output),{recursive:true});
  await checkedPath(root,guardPath,{missing:true});await writeFile(resolve(root,guardPath),bytes,{flag:'wx'});await exact(root,guardPath,sha256(bytes));
  return{status:'technical-planning-baseline-frozen',guardPath,guardSha256:sha256(bytes),guardByteLength:bytes.length,protectedFiles:Object.keys(files).length,livingStatusFiles:config.living.length,composition,head};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.equal(process.argv.length,2,'No baseline refresh or alternate CLI config is supported');console.log(JSON.stringify(await prepareProtection(),null,2));
}
