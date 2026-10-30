// SPDX-License-Identifier: AGPL-3.0-only
// Exclusive L2 technical start inventory. Do not refresh accepted evidence.
import assert from 'node:assert/strict';
import {lstat,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance,archiveConfig,acceptance,checkedPath,exact,safeRelative,sha256} from './archive-ap23l1-acceptance.mjs';
import {walk} from './prepare-ap23l1.mjs';
export {checkedPath,exact,safeRelative,sha256,walk};
export const preparationConfig=Object.freeze({
 output:'outputs/ap23l2-2026-10-27',head:'70ce67425e046a7a38a4fbe66acbd93c75ca5983',
 archive:archiveConfig.target,archiveFiles:66,receiptSha256:'028e05ee3a514a3465dc9c91e95d48fd1dad3d9a19d27423da57add33122de77',
 l1Guard:'outputs/ap23l1-2026-10-27/protected-inputs.json',l1GuardSha256:'7c2535ee44f73ea7cc519b51bcfe3635ef832079714ddc7bc7e9a8e84fa54a04',
 l1ProtectedCount:8649,l1Proof:archiveConfig.proofPath,l1ProofSha256:archiveConfig.proofSha256,
 living:['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
  'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md'],
 trees:['src','schemas','data/releases','data/candidates','spfx/src','tests','scripts'],
 additionalProtected:['scripts/archive-ap23l1-acceptance.mjs','scripts/prepare-ap23l2.mjs','tests/governance/ap23l1-acceptance.test.mjs',
  'docs/fachrecht/abnahme-ap23l1.md','package.json','spfx/package.json','scripts/build-public-app.mjs','spfx/scripts/sync-schemas.mjs'],
 allowedNew:{schemaPrefix:'schemas/candidates/ap23l2/',testPattern:'^tests/governance/ap23l2-[^/]+$',scriptPattern:'^scripts/[^/]*ap23l2[^/]*$'},
 acceptedDecisionPoints:acceptance.acceptedDecisionPoints,userStartStatement:acceptance.userStatement,
 userDocument:'outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.docx',
 userDocumentSha256:'46e7e3fc9e8eeeeca035c56dbb06eeb0c55f60c423a0bea5f4075bf61b4cac61'
});
export function isAllowedNew(path,allowed=preparationConfig.allowedNew){
 safeRelative(path);return path.startsWith(allowed.schemaPrefix)||new RegExp(allowed.testPattern,'u').test(path)||new RegExp(allowed.scriptPattern,'u').test(path);
}
export async function prepareProtection({root=process.cwd(),config=preparationConfig,verifyArchive=archiveAcceptance,
 readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
 root=resolve(root);const guardPath=config.output+'/protected-inputs.json';await checkedPath(root,guardPath,{missing:true});
 await assert.rejects(lstat(resolve(root,guardPath)),{code:'ENOENT'},'L2 start inventory already exists. Never refresh.');
 const archive=await verifyArchive({root});assert.equal(archive.mode,'archive-reverified');assert.equal(archive.verified,true);
 assert.equal(archive.files,config.archiveFiles);assert.equal(archive.receiptSha256,config.receiptSha256);
 const receipt=JSON.parse(await exact(root,config.archive+'/receipt.json',config.receiptSha256));
 assert.equal(receipt.professionalAcceptance,true);assert.equal(receipt.l2Started,true);assert.deepEqual(receipt.acceptedDecisionPoints,config.acceptedDecisionPoints);
 for(const flag of['formatDecision','implementationStarted','runtimeActivation','sourceReleaseApproved','releaseBuildPerformed','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(receipt[flag],false,flag);
 assert.equal(receipt.artifacts.length,config.archiveFiles);const accepted=new Map(receipt.artifacts.map(row=>[row.path,row]));
 assert.equal(accepted.get(config.l1Guard).sha256,config.l1GuardSha256);assert.equal(accepted.get(config.l1Proof).sha256,config.l1ProofSha256);
 const old=JSON.parse(await exact(root,config.l1Guard,config.l1GuardSha256));assert.equal(old.workPackage,'AP23L1');assert.equal(old.head,config.head);
 assert.equal(Object.keys(old.files).length,config.l1ProtectedCount);
 const living=new Set(config.living),files={},composition={previousProtected:0,currentAcceptedL1:0,archivedL1Payload:0,archivedL1Receipt:1,additionalGovernance:0,existingTreeFiles:0};
 async function protect(path,expected){safeRelative(path);assert.ok(!living.has(path),'Living status cannot be immutable');
  const bytes=await exact(root,path,expected),hash=sha256(bytes);if(Object.hasOwn(files,path))assert.equal(files[path],hash,'Conflicting protection');files[path]=hash;return bytes;}
 for(const[path,hash]of Object.entries(old.files)){await protect(path,hash);composition.previousProtected++;}
 for(const row of receipt.artifacts){if(!living.has(row.path)){await protect(row.path,row.sha256);composition.currentAcceptedL1++;}
  await protect(config.archive+'/'+row.path,row.sha256);composition.archivedL1Payload++;}
 await protect(config.archive+'/receipt.json',config.receiptSha256);
 for(const path of config.additionalProtected){await protect(path);composition.additionalGovernance++;}
 const treeFiles={},isolatedTechnicalFilesAtStart=[];
 for(const directory of config.trees){const all=await walk(root,directory),paths=all.filter(path=>!isAllowedNew(path,config.allowedNew));
  treeFiles[directory]=paths;isolatedTechnicalFilesAtStart.push(...all.filter(path=>isAllowedNew(path,config.allowedNew)));
  for(const path of paths){await protect(path);composition.existingTreeFiles++;}}
 await protect(config.userDocument,config.userDocumentSha256);
 const livingAtStart={};for(const path of config.living){const original=accepted.get(path);assert.ok(original,'Unbound living status');livingAtStart[path]=sha256(await exact(root,path,original.sha256));}
 const head=await readHead(root);assert.equal(head,config.head,'Git HEAD changed');
 const result={workPackage:'AP23L2',createdOn:'2026-10-27',capturedAtTechnicalPlanningStart:true,capturedBeforeLivingUpdates:true,
  l1ProfessionallyAccepted:true,acceptedBy:'David Steimer',acceptedDecisionPoints:config.acceptedDecisionPoints,userStartStatement:config.userStartStatement,
  technicalPlanningStarted:true,head,acceptedL1Archive:archive,originalL1:{proof:config.l1Proof,proofSha256:config.l1ProofSha256,
   guard:config.l1Guard,guardSha256:config.l1GuardSha256,protectedCount:config.l1ProtectedCount},
  userDocument:{path:config.userDocument,sha256:config.userDocumentSha256},composition,
  files:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b,'en'))),livingAtStart,treeFiles,
  isolatedTechnicalFilesAtStart:isolatedTechnicalFilesAtStart.sort(),additionalProtected:config.additionalProtected,allowedNew:config.allowedNew,
  formatDecision:false,productCodeChangePermission:false,runtimeActivation:false,sourceReleaseApproved:false,releaseBuildPerformed:false,
  commitCreated:false,sourcePushPerformed:false,operatingChanges:false,
  scope:'Local L2 technical planning and isolated candidate schemas/tests/scripts only. Native product sources, schemas, accepted legal data, K3/L1 evidence, archives, old tests, package metadata and build inputs stay unchanged. Only seven living status texts may change. No source release, product build, commit, push, upload, installation or operating permission.'};
 const bytes=Buffer.from(JSON.stringify(result,null,2)+'\n');await mkdir(resolve(root,config.output),{recursive:true});
 await checkedPath(root,guardPath,{missing:true});await writeFile(resolve(root,guardPath),bytes,{flag:'wx'});await exact(root,guardPath,sha256(bytes));
 return{status:'technical-planning-baseline-frozen',guardPath,guardSha256:sha256(bytes),guardByteLength:bytes.length,
  protectedFiles:Object.keys(files).length,livingStatusFiles:config.living.length,composition,head,isolatedTechnicalFilesAtStart};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,2);console.log(JSON.stringify(await prepareProtection(),null,2));
}
