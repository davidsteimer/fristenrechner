// SPDX-License-Identifier: AGPL-3.0-only
// Freeze accepted research and product baselines before isolated J2 planning. Never refresh.
import assert from 'node:assert/strict';
import {lstat,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance,archiveConfig,checkedPath,exact,safeRelative,sha256} from './archive-ap23j1-acceptance.mjs';
import {walk} from './prepare-ap23j1.mjs';
export {checkedPath,exact,walk,safeRelative,sha256};
export const preparationConfig=Object.freeze({
  output:'outputs/ap23j2-2026-10-27',head:'70ce67425e046a7a38a4fbe66acbd93c75ca5983',
  archive:archiveConfig.target,archiveFiles:101,receiptSha256:'4006caa0def152ac398a9a69bf5fa81f2c6b03cb7aa58f6545c13136675ac207',
  j1Guard:'outputs/ap23j1-2026-10-27/protected-inputs.json',j1GuardSha256:'da637412885f4fb3fc0a5655b81763f986e1c33c5ed71ab28be0c01db02b1bab',
  j1ProtectedCount:4214,j1Proof:archiveConfig.proofPath,j1ProofSha256:archiveConfig.proofSha256,
  userDocument:'outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.docx',
  userDocumentSha256:'46e7e3fc9e8eeeeca035c56dbb06eeb0c55f60c423a0bea5f4075bf61b4cac61',
  living:['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
    'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md'],
  trees:['src','schemas','data/releases','data/candidates','spfx/src','tests'],
  additionalProtected:['scripts/archive-ap23j1-acceptance.mjs','scripts/prepare-ap23j2.mjs','tests/governance/ap23j1-acceptance.test.mjs'],
  allowedNew:{schemaPrefix:'schemas/candidates/ap23j2/',testPattern:'^tests/governance/ap23j2-[^/]+$'},
  acceptedDecisionPoints:['J1-A','J1-B','J1-C','J1-D','J1-E','J1-F','J1-G'],
  userStartStatement:'AP23J1 ist einschliesslich der Punkte J1-A bis J1-G fachlich abgenommen. Bitte starte AP23J2.'
});
export function isAllowedNew(path,allowed=preparationConfig.allowedNew){
  safeRelative(path);return path.startsWith(allowed.schemaPrefix)||new RegExp(allowed.testPattern,'u').test(path);
}
export async function prepareProtection({root=process.cwd(),config=preparationConfig,verifyArchive=archiveAcceptance,
  readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
  root=resolve(root);const guardPath=config.output+'/protected-inputs.json';await checkedPath(root,guardPath,{missing:true});
  let exists=false;try{await lstat(resolve(root,guardPath));exists=true;}catch(error){if(error.code!=='ENOENT')throw error;}
  assert.equal(exists,false,'J2 baseline already frozen. Never refresh it.');
  const archive=await verifyArchive({root});assert.equal(archive.mode,'archive-reverified');assert.equal(archive.verified,true);
  assert.equal(archive.files,config.archiveFiles);assert.equal(archive.receiptSha256,config.receiptSha256);
  const receipt=JSON.parse(await exact(root,config.archive+'/receipt.json',config.receiptSha256));
  assert.equal(receipt.professionalAcceptance,true);assert.equal(receipt.j2Started,true);assert.deepEqual(receipt.acceptedDecisionPoints,config.acceptedDecisionPoints);
  assert.equal(receipt.artifacts.length,config.archiveFiles);
  for(const key of['formatDecision','implementationStarted','runtimeActivation','sourceReleaseApproved','releaseBuildPerformed','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(receipt[key],false,'Acceptance boundary '+key);
  const accepted=new Map(receipt.artifacts.map(item=>[item.path,item]));assert.equal(accepted.size,config.archiveFiles);
  assert.equal(accepted.get(config.j1Guard)?.sha256,config.j1GuardSha256);assert.equal(accepted.get(config.j1Proof)?.sha256,config.j1ProofSha256);
  const previous=JSON.parse(await exact(root,config.j1Guard,config.j1GuardSha256));
  assert.equal(previous.workPackage,'AP23J1');assert.equal(previous.capturedBeforeResearch,true);assert.equal(previous.capturedBeforeLivingUpdates,true);
  assert.equal(Object.keys(previous.files).length,config.j1ProtectedCount);assert.equal(previous.head,config.head);
  const files={},living=new Set(config.living),composition={previousProtected:0,currentAcceptedJ1:0,archivedJ1Payload:0,archivedJ1Receipt:1,additionalGovernance:0,existingTreeFiles:0};
  async function protect(path,expected){
    safeRelative(path);assert.ok(!living.has(path),'Living input cannot be immutable');const bytes=await exact(root,path,expected),hash=sha256(bytes);
    if(Object.hasOwn(files,path))assert.equal(files[path],hash,'Conflicting protected input');files[path]=hash;return bytes;
  }
  for(const[path,hash]of Object.entries(previous.files)){await protect(path,hash);composition.previousProtected++;}
  for(const item of receipt.artifacts){
    if(!living.has(item.path)){await protect(item.path,item.sha256);composition.currentAcceptedJ1++;}
    await protect(config.archive+'/'+item.path,item.sha256);composition.archivedJ1Payload++;
  }
  await protect(config.archive+'/receipt.json',config.receiptSha256);
  for(const path of config.additionalProtected){await protect(path);composition.additionalGovernance++;}
  const treeFiles={};
  for(const directory of config.trees){treeFiles[directory]=await walk(root,directory);for(const path of treeFiles[directory]){await protect(path);composition.existingTreeFiles++;}}
  await protect(config.userDocument,config.userDocumentSha256);
  const livingAtStart={};for(const path of config.living){const item=accepted.get(path);assert.ok(item,'Living input missing from accepted J1 bindings');livingAtStart[path]=sha256(await exact(root,path,item.sha256));}
  const head=await readHead(root);assert.equal(head,config.head,'Git head changed');
  const result={workPackage:'AP23J2',createdOn:'2026-10-27',capturedBeforeTechnicalPlanning:true,capturedBeforeLivingUpdates:true,
    j1ProfessionallyAccepted:true,acceptedBy:'David Steimer',acceptedDecisionPoints:config.acceptedDecisionPoints,
    userStartStatement:config.userStartStatement,technicalPlanningStarted:true,head,acceptedJ1Archive:archive,
    originalJ1:{proof:config.j1Proof,proofSha256:config.j1ProofSha256,guard:config.j1Guard,guardSha256:config.j1GuardSha256,protectedCount:config.j1ProtectedCount},
    userDocument:{path:config.userDocument,sha256:config.userDocumentSha256},composition,
    files:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b,'en'))),livingAtStart,treeFiles,
    allowedNew:config.allowedNew,additionalProtected:config.additionalProtected,
    formatDecision:false,productCodeChangePermission:false,runtimeActivation:false,sourceReleaseApproved:false,
    releaseBuildPerformed:false,commitCreated:false,sourcePushPerformed:false,operatingChanges:false,
    scope:'Local J2 contract analysis only. All accepted J1 research bytes and historical product/data/schema/host/test inputs remain immutable. Only seven living entry texts may change. Newly created files under schemas/candidates/ap23j2/ and new tests/governance/ap23j2-* files are isolated proposals, never native runtime schemas or product changes.'};
  const bytes=Buffer.from(JSON.stringify(result,null,2)+'\n');await checkedPath(root,guardPath,{missing:true});await mkdir(resolve(root,config.output),{recursive:true});
  await checkedPath(root,guardPath,{missing:true});await writeFile(resolve(root,guardPath),bytes,{flag:'wx'});await exact(root,guardPath,sha256(bytes));
  return{status:'technical-planning-baseline-frozen',guardPath,guardSha256:sha256(bytes),guardByteLength:bytes.length,protectedFiles:Object.keys(files).length,livingStatusFiles:config.living.length,composition,head};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.equal(process.argv.length,2,'No baseline refresh or alternate CLI config is supported');console.log(JSON.stringify(await prepareProtection(),null,2));
}
