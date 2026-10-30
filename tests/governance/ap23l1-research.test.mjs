// SPDX-License-Identifier: AGPL-3.0-only
// All destructive mutations are confined to disposable synthetic fixtures.
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,rm,symlink,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {checkPreservation,preservationConfig} from '../../scripts/check-ap23l1-preservation.mjs';
import {prepareProtection,researchConfig,safeRelative,sha256} from '../../scripts/prepare-ap23l1.mjs';
async function fixture(t){
 const root=await mkdtemp(join(tmpdir(),'ap23l1-preservation-test-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const files={},treeFiles={},head='1'.repeat(40);
 async function file(path,content,protect=false){
  const bytes=Buffer.from(typeof content==='string'?content:JSON.stringify(content));await mkdir(dirname(join(root,path)),{recursive:true});
  await writeFile(join(root,path),bytes);if(protect)files[path]=sha256(bytes);return{path,sha256:sha256(bytes)};
 }
 const entries={src:'src/core/main.ts',schemas:'schemas/calendar.json','data/releases':'data/releases/approved.json',
  'data/candidates':'data/candidates/k3.json','spfx/src':'spfx/src/Host.ts',tests:'tests/core/old.test.mjs'};
 for(const[directory,path]of Object.entries(entries)){await file(path,'unchanged '+path,true);treeFiles[directory]=[path];}
 await file('package.json',{version:'0.9.0'},true);
 const proposal=await file('docs/planung/proposal.md','original accepted scope',true);
 const preparation=await file('outputs/preparation/verification.json',{professionalStepStarted:false,status:'prepared-not-started'},true);
 const userDocument=await file('outputs/user.docx','user document',true);
 await file('outputs/k3/local-completion.json',{professionalTechnicalAcceptance:false},true);
 const receipt=await file('archive/receipt.json',{professionalTechnicalAcceptance:true,sourceReleaseApproved:false},true);
 const living=await file('docs/living.md','status at start');
 const archive={verified:true,target:'archive',mode:'archive-reverified',files:1324,receiptSha256:receipt.sha256};
 const composition={historicalProtected:1,currentAcceptedK3:1,archivedK3Payload:0,archivedK3Receipt:1,originalPreparation:2,existingTreeFiles:6};
 const guard={workPackage:'AP23L1',capturedAtResearchStart:true,capturedBeforeLivingUpdates:true,scopeConfirmedBy:'David Steimer',
  userStartStatement:researchConfig.userStartStatement,head,files,livingAtStart:{[living.path]:living.sha256},treeFiles,
  allowedNewResearchTests:[...researchConfig.allowedNewResearchTests],acceptedK3Archive:archive,composition,
  originalPreparation:{path:preparation.path,sha256:preparation.sha256,proposal:proposal.path,proposalSha256:proposal.sha256},
  userDocument,productCodeChangePermission:false,sourceReleaseApproved:false,operatingChanges:false};
 const guardPath='outputs/l1/protected-inputs.json',descriptor=await file(guardPath,guard);
 const config={...preservationConfig,guardPath,guardSha256:descriptor.sha256,protectedCount:Object.keys(files).length,head,
  livingPaths:[living.path],treePaths:Object.keys(entries),researchTests:[...researchConfig.allowedNewResearchTests],archiveSha256:receipt.sha256,composition};
 const options={root,config,verifyArchive:async()=>({...archive}),readHead:()=>head};
 async function changeGuard(change,{rebind=false}={}){const current=JSON.parse(await readFile(join(root,guardPath)));change(current);
  const d=await file(guardPath,current);if(rebind)config.guardSha256=d.sha256;}
 return{root,config,options,file,changeGuard,guardPath,proposal,preparation,userDocument,receipt,living};
}
test('synthetic start preserves all approval and operating boundaries',async t=>{
 const f=await fixture(t),r=await checkPreservation(f.options);assert.equal(r.status,'research-inputs-preserved');
 assert.equal(r.protectedFilesVerified,12);assert.deepEqual(r.researchTestAdditions,[]);assert.equal(r.livingStatus[0].changed,false);
 for(const flag of['productCodeChanged','acceptedLegalDataChanged','schemasChanged','existingTestsChanged','originalPreparationChanged',
  'k3HistoricalEvidenceChanged','userDocumentChanged','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(r[flag],false);
});
test('actual L1 start preserves 8649 files and autonomous accepted K3 archive',async()=>{
 const r=await checkPreservation();assert.equal(r.protectedFilesVerified,8649);assert.equal(r.acceptedK3Archive.files,1324);
 assert.equal(r.protectedInputSha256,'7c2535ee44f73ea7cc519b51bcfe3635ef832079714ddc7bc7e9a8e84fa54a04');assert.equal(r.livingStatus.length,7);
});
test('living status update does not refresh the start binding',async t=>{
 const f=await fixture(t),before=await readFile(join(f.root,f.guardPath));await f.file(f.living.path,'L1 started');
 assert.equal((await checkPreservation(f.options)).livingStatus[0].changed,true);assert.deepEqual(await readFile(join(f.root,f.guardPath)),before);
});
test('new legal research findings and captured sources remain allowed',async t=>{
 const f=await fixture(t);await f.file('docs/fachrecht/ap23l1/befund-ai.json','research');await f.file('outputs/ap23l1/sources/sz/file.pdf','source');
 assert.equal((await checkPreservation(f.options)).status,'research-inputs-preserved');
});
for(const path of researchConfig.allowedNewResearchTests)test('exact L1-only research test addition '+path,async t=>{
 const f=await fixture(t);await f.file(path,'research test');assert.deepEqual((await checkPreservation(f.options)).researchTestAdditions,[path]);
});
for(const path of['src/core/main.ts','schemas/calendar.json','data/releases/approved.json','data/candidates/k3.json','spfx/src/Host.ts',
 'tests/core/old.test.mjs','package.json','docs/planung/proposal.md','outputs/preparation/verification.json','outputs/user.docx',
 'outputs/k3/local-completion.json','archive/receipt.json'])test('protected mutation refused '+path,async t=>{
 const f=await fixture(t);await f.file(path,'changed');await assert.rejects(checkPreservation(f.options),/Protected bytes changed/);
});
for(const path of['src/new.ts','schemas/new.json','data/releases/new.json','data/candidates/new.json','spfx/src/New.ts',
 'tests/core/new.test.mjs','tests/governance/ap23l1-undeclared.test.mjs'])test('undeclared tree addition refused '+path,async t=>{
 const f=await fixture(t);await f.file(path,'outside scope');await assert.rejects(checkPreservation(f.options),/Unexpected product\/source\/test/);
});
test('protected deletion refused',async t=>{const f=await fixture(t);await rm(join(f.root,'tests/core/old.test.mjs'));await assert.rejects(checkPreservation(f.options),{code:'ENOENT'});});
test('guard mutation refused before trusting changed claims',async t=>{
 const f=await fixture(t);await f.changeGuard(g=>g.productCodeChangePermission=true);await assert.rejects(checkPreservation(f.options),/Protected bytes changed/);
});
for(const[key,value]of[['workPackage','AP23L2'],['capturedAtResearchStart',false],['capturedBeforeLivingUpdates',false],['scopeConfirmedBy','AI'],
 ['userStartStatement','invented'],['productCodeChangePermission',true],['sourceReleaseApproved',true],['operatingChanges',true]])test('authority relabelling refused '+key,async t=>{
 const f=await fixture(t);await f.changeGuard(g=>g[key]=value,{rebind:true});await assert.rejects(checkPreservation(f.options));
});
test('protected inventory cannot shrink',async t=>{const f=await fixture(t);await f.changeGuard(g=>delete g.files['package.json'],{rebind:true});await assert.rejects(checkPreservation(f.options));});
test('living exceptions cannot expand to historical proposal',async t=>{const f=await fixture(t);await f.changeGuard(g=>g.livingAtStart[f.proposal.path]='0'.repeat(64),{rebind:true});await assert.rejects(checkPreservation(f.options),/Living exceptions/);});
test('research test exceptions cannot expand',async t=>{const f=await fixture(t);await f.changeGuard(g=>g.allowedNewResearchTests.push('tests/core/old.test.mjs'),{rebind:true});await assert.rejects(checkPreservation(f.options),/Research test exceptions/);});
test('tree inventory cannot reference an out-of-tree file',async t=>{const f=await fixture(t);await f.changeGuard(g=>g.treeFiles.src=['package.json'],{rebind:true});await assert.rejects(checkPreservation(f.options));});
test('Git HEAD drift refused without mutating Git',async t=>{const f=await fixture(t);await assert.rejects(checkPreservation({...f.options,readHead:()=> '2'.repeat(40)}),/Git head changed/);});
for(const archive of[{mode:'preflight',verified:true},{mode:'archive-reverified',verified:true,files:1323},
 {mode:'archive-reverified',verified:true,files:1324,receiptSha256:'0'.repeat(64)}])test('incomplete or unbound archive refused '+JSON.stringify(archive),async t=>{
 const f=await fixture(t);await assert.rejects(checkPreservation({...f.options,verifyArchive:async()=>archive}));
});
for(const type of['file','directory','test'])test('symlink preservation bypass refused '+type,async t=>{
 const f=await fixture(t);
 if(type==='file'){await f.file('other.ts','unchanged src/core/main.ts');await rm(join(f.root,'src/core/main.ts'));await symlink('../../other.ts',join(f.root,'src/core/main.ts'));}
 else if(type==='directory'){await f.file('other/main.ts','unchanged src/core/main.ts');await rm(join(f.root,'src/core'),{recursive:true});await symlink('../other',join(f.root,'src/core'));}
 else{const path=researchConfig.allowedNewResearchTests[0];await mkdir(dirname(join(f.root,path)),{recursive:true});await f.file('other.mjs','test');await symlink('../../other.mjs',join(f.root,path));}
 await assert.rejects(checkPreservation(f.options),/Symlink not allowed/);
});
test('path policy refuses traversal and ambiguous forms',()=>{for(const path of['../secret','/absolute','a/../b','a//b','a\\b','C:/a','a\0b',''])assert.throws(()=>safeRelative(path));});
test('existing start inventory cannot refresh even before archive consultation',async t=>{
 const f=await fixture(t),before=await readFile(join(f.root,f.guardPath));let consulted=false;
 await assert.rejects(prepareProtection({root:f.root,config:{...researchConfig,output:'outputs/l1'},verifyArchive:async()=>{consulted=true;throw Error('unexpected');}}));
 assert.equal(consulted,false);assert.deepEqual(await readFile(join(f.root,f.guardPath)),before);
});
