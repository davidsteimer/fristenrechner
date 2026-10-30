// SPDX-License-Identifier: AGPL-3.0-only
// One-time A1 read-only product boundary. No promotion, build or external access.
import assert from 'node:assert/strict';
import {readFile,lstat,readdir,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance,archiveConfig,exact,hash,safe,walk} from './archive-r10-u1-acceptance.mjs';
export {exact,hash,safe,walk};
export const preparationConfig=Object.freeze({
 out:'outputs/r10-a1-2026-10-28',guard:'outputs/r10-a1-2026-10-28/protected-inputs.json',head:archiveConfig.head,
 u1Receipt:archiveConfig.target+'/receipt.json',u1ReceiptSha256:'ba16dea199c65b9ed7cf7fa7b3ccdb26611f781b12485015816ad4f2819066c5',
 u1Proof:archiveConfig.proof,u1ProofSha256:archiveConfig.sha256,
 u1Guard:'outputs/r10-u1-2026-10-28/protected-inputs.json',u1GuardSha256:'a050db42c1357b330569adc690dabfaec15b98af85a116bb90084444b8a9c65c',
 living:['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md','docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md','docs/planung/gebuendelter-release-nach-ap23m3.md'],
 trees:['src','schemas','data/releases','data/candidates','data/source-reviews','spfx/src','spfx/test','spfx/test-build','tests','scripts','spfx/scripts','spfx/config','public-app','docs'],
 allowedNew:['^scripts/[^/]*r10-a1[^/]*\\.(?:mjs|ts|py)$','^tests/governance/r10-a1[^/]+\\.test\\.mjs$','^docs/(?:betrieb/bestandsbericht-r10-a1|fachrecht/quellenpruefplan-r10-a2|ux/abnahme-r10-u1)\\.md$'],
 scope:'A1 local coverage/source inventory and review plan only. No source content review, rule/data/schema/version/window/UI changes, release promotion, build, commit, push, upload, installation or E/Q/P/hosting/rights changes.'
});
export function allowedNew(path){safe(path);return preparationConfig.allowedNew.some(p=>new RegExp(p,'u').test(path));}
export async function bind(root,path){const bytes=await exact(root,path);return{path,byteLength:bytes.length,sha256:hash(bytes)};}
export async function prepare({root=process.cwd()}={}){
 root=resolve(root);await assert.rejects(lstat(resolve(root,preparationConfig.guard)),e=>e.code==='ENOENT','Never refresh A1 baseline');
 const accepted=await archiveAcceptance({root});assert.equal(accepted.status,'archive-reverified');assert.equal(accepted.receiptSha256,preparationConfig.u1ReceiptSha256);
 const prior=JSON.parse(await exact(root,preparationConfig.u1Guard,{sha256:preparationConfig.u1GuardSha256})),proof=JSON.parse(await exact(root,preparationConfig.u1Proof,{sha256:preparationConfig.u1ProofSha256})),receipt=JSON.parse(await exact(root,preparationConfig.u1Receipt,{sha256:preparationConfig.u1ReceiptSha256}));
 assert.equal(receipt.humanAcceptance,true);assert.equal(receipt.r10A1Authorized,true);assert.equal(receipt.r10A1Accepted,false);
 const living=new Set(preparationConfig.living),files=new Map(),livingAtStart=[];
 async function add(path,expected){const row=await bind(root,path);if(expected)assert.deepEqual(row,{path,byteLength:expected.byteLength??row.byteLength,sha256:expected.sha256},'Changed accepted input '+path);const target=living.has(path)?livingAtStart:files;if(target instanceof Map){if(files.has(path))assert.deepEqual(files.get(path),row);files.set(path,row);}else if(!target.some(r=>r.path===path))target.push(row);}
 for(const[path,sha256]of Object.entries(prior.files))await add(path,{sha256});
 for(const path of Object.keys(prior.mutableBefore))await add(path);
 for(const row of proof.bindings)await add(row.path,row);
 await add(preparationConfig.u1Guard,{sha256:preparationConfig.u1GuardSha256});await add(preparationConfig.u1Proof,{sha256:preparationConfig.u1ProofSha256});await add(preparationConfig.u1Receipt,{sha256:preparationConfig.u1ReceiptSha256});
 for(const row of receipt.artifacts)await add(archiveConfig.target+'/'+row.path,{...row,path:undefined});
 const treeFiles={};for(const dir of preparationConfig.trees){treeFiles[dir]=await walk(root,dir);for(const p of treeFiles[dir])await add(p);}
 for(const p of preparationConfig.living)await add(p);
 const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();assert.equal(head,preparationConfig.head);
 const report={workPackage:'R10-A1',createdOn:'2026-10-28',head,capturedBeforeA1OutputsAndLivingChanges:true,userStatement:archiveConfig.statement,
 u1HumanAcceptance:true,r10A1Authorized:true,r10A1HumanAcceptance:false,r10A2Authorized:false,sourceReleaseApproved:false,dataPromoted:false,definitiveBuild:false,commitCreated:false,sourcePushPerformed:false,installationPerformed:false,operatingChanges:false,
 scope:preparationConfig.scope,acceptedU1:accepted,trees:preparationConfig.trees,allowedNew:preparationConfig.allowedNew,treeFiles,
 files:[...files.values()].sort((a,b)=>a.path.localeCompare(b.path,'en')),livingAtStart:livingAtStart.sort((a,b)=>a.path.localeCompare(b.path,'en'))};
 await mkdir(resolve(root,preparationConfig.out),{recursive:true});const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n');await writeFile(resolve(root,preparationConfig.guard),bytes,{flag:'wx'});assert.deepEqual(await exact(root,preparationConfig.guard),bytes);
 return{status:'a1-baseline-frozen',path:preparationConfig.guard,sha256:hash(bytes),protectedFiles:report.files.length,living:livingAtStart.length,head};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.equal(process.argv.length,2);console.log(JSON.stringify(await prepare(),null,2));}

