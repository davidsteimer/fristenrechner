// SPDX-License-Identifier: AGPL-3.0-only
// Freeze accepted inputs once, before any A2 review output or living-text changes.
import assert from 'node:assert/strict';
import {lstat,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {exact,hash,walk} from './archive-r10-u1-acceptance.mjs';
import {archiveAcceptance,archiveConfig,assertRoot} from './archive-r10-a1-acceptance.mjs';
export const preparationConfig=Object.freeze({out:'outputs/r10-a2-2026-10-28',guard:'outputs/r10-a2-2026-10-28/protected-inputs.json',a1Guard:'outputs/r10-a1-2026-10-28/protected-inputs.json',a1GuardSha256:'eace969a33e1f29f41654b6500882f4fb17dddc7ea742a96fa4ed3955cb719a2',living:['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md','docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md','docs/planung/gebuendelter-release-nach-ap23m3.md'],allowedNew:['^scripts/[^/]*r10-a2[^/]*\\.(?:mjs|ts|py)$','^tests/governance/r10-a2[^/]+\\.test\\.mjs$','^docs/(?:betrieb/abnahme-r10-a1|fachrecht/quellenabgleich-r10-a2)\\.md$']});
export async function prepare({root=process.cwd()}={}){
 root=resolve(root);await assertRoot(root);await assert.rejects(lstat(resolve(root,preparationConfig.guard)),e=>e.code==='ENOENT','Never refresh an A2 baseline');
 const accepted=await archiveAcceptance({root});assert.equal(accepted.status,'archive-reverified');
 const prior=JSON.parse(await exact(root,preparationConfig.a1Guard,{sha256:preparationConfig.a1GuardSha256}));
 const receiptPath=archiveConfig.target+'/receipt.json',receipt=JSON.parse(await exact(root,receiptPath,{sha256:accepted.receiptSha256}));
 const living=new Set(preparationConfig.living),files=new Map(),livingAtStart=[];
 async function add(path,expected){const bytes=await exact(root,path),row={path,byteLength:bytes.length,sha256:hash(bytes)};if(expected)assert.deepEqual(row,{path,byteLength:expected.byteLength,sha256:expected.sha256},'Changed protected input '+path);if(living.has(path)){if(!livingAtStart.some(r=>r.path===path))livingAtStart.push(row);}else{if(files.has(path))assert.deepEqual(files.get(path),row);files.set(path,row);}}
 for(const row of prior.files)await add(row.path,row);
 for(const row of prior.livingAtStart)await add(row.path);
 await add(preparationConfig.a1Guard);await add(archiveConfig.proof,{path:archiveConfig.proof,byteLength:290159,sha256:archiveConfig.sha256});await add(receiptPath);
 for(const row of receipt.artifacts){await add(row.path,row);await add(archiveConfig.target+'/'+row.path,row);}
 const trees=prior.trees,treeFiles={};for(const dir of trees){treeFiles[dir]=await walk(root,dir);for(const path of treeFiles[dir])await add(path);}
 const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();assert.equal(head,archiveConfig.head);
 const report={workPackage:'R10-A2',createdOn:'2026-10-28',head,capturedBeforeA2OutputsAndLivingChanges:true,userStatement:archiveConfig.statement,a1HumanAcceptance:true,r10A2Authorized:true,r10A2HumanAcceptance:false,sourceReleaseApproved:false,dataPromoted:false,definitiveBuild:false,commitCreated:false,sourcePushPerformed:false,installationPerformed:false,operatingChanges:false,scope:'Source content/version review and explicitly bounded reuse only. Preserve product, legal data, source register, schemas, windows, packages, historical evidence and E/Q/P.',acceptedA1:accepted,trees,allowedNew:preparationConfig.allowedNew,treeFiles,files:[...files.values()].sort((a,b)=>a.path.localeCompare(b.path,'en')),livingAtStart:livingAtStart.sort((a,b)=>a.path.localeCompare(b.path,'en'))};
 await mkdir(resolve(root,preparationConfig.out),{recursive:true});const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n');await writeFile(resolve(root,preparationConfig.guard),bytes,{flag:'wx'});
 return{status:'a2-baseline-frozen',path:preparationConfig.guard,sha256:hash(bytes),protectedFiles:files.size,living:livingAtStart.length,head,acceptedA1:accepted};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.equal(process.argv.length,2);console.log(JSON.stringify(await prepare(),null,2));}
