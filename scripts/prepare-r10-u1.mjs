// SPDX-License-Identifier: AGPL-3.0-only
// Freeze the actual accepted M3 state before the narrow local R10-U1 follow-up.
import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {lstat,mkdir,open,readdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance,archiveConfig,sha256,safeRelative} from './archive-ap23m3-acceptance.mjs';
export {sha256,safeRelative};
export const GENERATED_COPIES=Object.freeze([
 {path:'spfx/src/product/ui/socialUi.ts',source:'src/ui/socialUi.ts'},
 {path:'spfx/src/product/ui/administrativeUi.tsx',source:'src/ui/administrativeUi.tsx'},
 {path:'spfx/src/product/ui/administrativeMessages.ts',source:'src/ui/administrativeMessages.ts'}
]);
export const preparationConfig=Object.freeze({
 output:'outputs/r10-u1-2026-10-28',head:'70ce67425e046a7a38a4fbe66acbd93c75ca5983',
 archive:archiveConfig.target,receiptSha256:'5756ca9c9fb05130287abf53004b66e61ffc7af5ae596fd1fb3e683575a1c014',archiveFiles:1538,
 proof:archiveConfig.proofPath,proofSha256:'6a86fb73400c1144cbed78035f648187843f313562d280e245fb41a3946a7a01',proofBindings:1537,
 previousGuard:'outputs/ap23m3-2026-10-28/protected-inputs.json',previousGuardSha256:'999058873565d1395f04767d040ca218ec8da04303b899f23d7f80cbcd7227f9',previousProtectedCount:11540,
 statement:'Bitte setze den Nachtrag als nächstes um.',
 living:['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
  'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md','docs/planung/gebuendelter-release-nach-ap23m3.md'],
 mutableExisting:['src/ui/socialUi.ts','src/ui/administrativeUi.tsx','src/ui/administrativeMessages.ts',
  'spfx/src/webparts/fristenrechner/components/Fristenrechner.module.scss',...GENERATED_COPIES.map(copy=>copy.path),'package.json','scripts/build-public-app.mjs'],
 generatedCopies:GENERATED_COPIES,
 trees:['src','schemas','data/releases','data/candidates','spfx/src','spfx/test','spfx/test-build','tests','scripts','spfx/scripts','spfx/config','public-app'],
 additionalProtected:['scripts/archive-ap23m3-acceptance.mjs','tests/governance/ap23m3-acceptance.test.mjs',
  'docs/fachrecht/abnahme-ap23m3.md','scripts/prepare-r10-u1.mjs','package-lock.json','tsconfig.json'],
 allowedNew:{files:['src/public-app/r10-u1-main.tsx'],prefixes:[],patterns:[
  '^scripts/[^/]*r10-u1[^/]*\\.(?:mjs|ts|py)$','^tests/(?:core|ui|hosts|public-app|governance)/r10-u1[^/]+$',
  '^spfx/(?:test|test-build)/r10-u1[^/]+$']},
 localPublicEntry:{path:'src/public-app/r10-u1-main.tsx',runtime:'unchanged native M3 runtime',referenceOnly:true,label:'R10-U1'},
 excluded:'No wrapper TSX, core arithmetic, native reader, schema, data, common CSS, existing test or historical evidence changes. No promotion, commit, push, upload, installation, mirror or E/Q/P changes.'
});
export async function checkedPath(root,path,{missing=false}={}){
 assert.ok((await lstat(root)).isDirectory());assert.equal((await lstat(root)).isSymbolicLink(),false);let current=root;
 const parts=safeRelative(path).split('/');for(const[index,part]of parts.entries()){current=resolve(current,part);let stat;try{stat=await lstat(current);}catch(error){if(missing&&error.code==='ENOENT')return;throw error;}
  assert.equal(stat.isSymbolicLink(),false,'Symlink not allowed '+path);assert.ok(index===parts.length-1||stat.isDirectory(),'Not a directory '+path);}
}
export async function exact(root,path,expected,byteLength){
 await checkedPath(root,path);const handle=await open(resolve(root,path),constants.O_RDONLY|constants.O_NOFOLLOW);
 try{assert.ok((await handle.stat()).isFile(),'Not a regular file '+path);const bytes=await handle.readFile();if(expected!==undefined)assert.equal(sha256(bytes),expected,'SHA-256 mismatch '+path);
  if(byteLength!==undefined)assert.equal(bytes.length,byteLength,'Byte length mismatch '+path);return bytes;}finally{await handle.close();}
}
export async function walk(root,path){await checkedPath(root,path);const files=[];for(const item of await readdir(resolve(root,path),{withFileTypes:true})){
 const next=path+'/'+item.name;assert.equal(item.isSymbolicLink(),false,'Symlink in tree '+next);if(item.isDirectory())files.push(...await walk(root,next));else{assert.ok(item.isFile(),'Not a regular tree file '+next);files.push(next);}}return files.sort();}
export function isAllowedNew(path,allowed=preparationConfig.allowedNew){safeRelative(path);return allowed.files.includes(path)||allowed.prefixes.some(prefix=>path.startsWith(prefix))||allowed.patterns.some(pattern=>new RegExp(pattern,'u').test(path));}
export async function prepareProtection({root=process.cwd(),config=preparationConfig,verifyArchive=archiveAcceptance,
 readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
 root=resolve(root);const guardPath=config.output+'/protected-inputs.json';await checkedPath(root,guardPath,{missing:true});
 let exists=false;try{await lstat(resolve(root,guardPath));exists=true;}catch(error){if(error.code!=='ENOENT')throw error;}assert.equal(exists,false,'R10-U1 baseline already frozen. Never refresh it.');
 const archive=await verifyArchive({root});assert.equal(archive.mode,'archive-reverified');assert.equal(archive.files,config.archiveFiles);assert.equal(archive.receiptSha256,config.receiptSha256);
 const receipt=JSON.parse(await exact(root,config.archive+'/receipt.json',config.receiptSha256));
 assert.equal(receipt.professionalTechnicalAcceptance,true);assert.equal(receipt.acceptedCantons,26);assert.equal(receipt.operationalCantons,6);assert.equal(receipt.localOnlyAcceptedCantons,20);assert.deepEqual(receipt.remainingCantons,[]);
 assert.equal(receipt.postAcceptanceFinding.humanAcceptanceOfFinding,false);assert.equal(receipt.postAcceptanceFinding.fixAuthorized,false);
 for(const key of['sourceReleaseApproved','deployable','deployed','sourcePublished','additionalRiskDecision'])assert.equal(receipt[key],false,'M3 acceptance boundary '+key);
 const previous=JSON.parse(await exact(root,config.previousGuard,config.previousGuardSha256));assert.equal(previous.workPackage,'AP23M3');assert.equal(previous.head,config.head);assert.equal(Object.keys(previous.files).length,config.previousProtectedCount);
 const proof=JSON.parse(await exact(root,config.proof,config.proofSha256));assert.equal(proof.workPackage,'AP23M3');assert.equal(proof.bindings.length,config.proofBindings);
 assert.equal(proof.status,'local-scoped-verification-passed-with-release-blocker');assert.equal(proof.releaseReadiness.ready,false);
 const files={},mutableBefore={},livingAtStart={},living=new Set(config.living),mutable=new Set(config.mutableExisting);
 assert.equal(mutable.size,config.mutableExisting.length,'Unique mutable list');assert.equal(living.size,config.living.length,'Unique living list');
 assert.equal(mutable.has('src/ui/styles.css'),false);assert.equal(mutable.has('spfx/src/webparts/fristenrechner/components/Fristenrechner.tsx'),false);
 async function add(path,expected,length){safeRelative(path);const bytes=await exact(root,path,living.has(path)?undefined:expected,living.has(path)?undefined:length),hash=sha256(bytes);
  const target=living.has(path)?livingAtStart:mutable.has(path)?mutableBefore:files;if(Object.hasOwn(target,path))assert.equal(target[path],hash,'Conflicting current input '+path);target[path]=hash;}
 for(const[path,hash]of Object.entries(previous.files))await add(path,hash);
 for(const path of Object.keys(previous.mutableBefore))await add(path);
 await add(config.previousGuard,config.previousGuardSha256);
 for(const item of proof.bindings)await add(item.path,item.sha256,item.byteLength);await add(config.proof,config.proofSha256);
 for(const item of receipt.artifacts)await add(config.archive+'/'+item.path,item.sha256,item.byteLength);await add(config.archive+'/receipt.json',config.receiptSha256);
 for(const path of config.additionalProtected)await add(path);
 for(const reportPath of['outputs/ap23m3-2026-10-28/spfx-build.json','outputs/ap23m3-2026-10-28/web-build.json']){
  const report=JSON.parse(await exact(root,reportPath));for(const item of report.protectedBefore)await add(item.path,item.sha256,item.byteLength);}
 const treeFiles={};for(const directory of config.trees){treeFiles[directory]=await walk(root,directory);for(const path of treeFiles[directory])await add(path);}
 for(const path of config.mutableExisting)await add(path);for(const path of config.living)await add(path);
 for(const copy of config.generatedCopies)assert.deepEqual(await exact(root,copy.path),await exact(root,copy.source),'Initial generated copy '+copy.path);
 const head=await readHead(root);assert.equal(head,config.head,'Git HEAD changed');
 const record={workPackage:'R10-U1',createdOn:'2026-10-28',capturedBeforeProductChanges:true,capturedBeforeLivingUpdates:true,head,
  userStatement:config.statement,m3HumanAcceptanceRecordedSeparately:true,acceptedM3Archive:archive,
  previousGuard:{path:config.previousGuard,sha256:config.previousGuardSha256,protectedCount:config.previousProtectedCount},
  previousProof:{path:config.proof,sha256:config.proofSha256,bindingCount:config.proofBindings},
  files:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b,'en'))),
  mutableBefore:Object.fromEntries(Object.entries(mutableBefore).sort(([a],[b])=>a.localeCompare(b,'en'))),livingAtStart,treeFiles,
  mutableAllowed:config.mutableExisting,generatedCopies:config.generatedCopies,allowedNew:config.allowedNew,localPublicEntry:config.localPublicEntry,
  authorisedLocalChanges:['R10-H01 Format-17 social UI connection','T06-H01 own SPFx source row layout','B11-H01 provenance boundary wording'],
  sourceReleaseApproved:false,operatingChangesAuthorized:false,commitPermission:false,sourcePushPermission:false,
  coreRulesChanged:false,dataPromotionAuthorized:false,contractVersionChangeAuthorized:false,
  scope:config.excluded};
 const bytes=Buffer.from(JSON.stringify(record,null,2)+'\n');await checkedPath(root,guardPath,{missing:true});await mkdir(resolve(root,config.output),{recursive:true});await writeFile(resolve(root,guardPath),bytes,{flag:'wx'});
 await exact(root,guardPath,sha256(bytes));return{status:'narrow-local-follow-up-baseline-frozen',guardPath,guardSha256:sha256(bytes),guardByteLength:bytes.length,
  protectedFiles:Object.keys(files).length,mutableExistingFiles:Object.keys(mutableBefore).length,livingStatusFiles:Object.keys(livingAtStart).length,head,archive};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.equal(process.argv.length,2,'No refresh or alternate config');console.log(JSON.stringify(await prepareProtection(),null,2));}

