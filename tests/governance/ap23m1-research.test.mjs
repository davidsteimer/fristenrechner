// SPDX-License-Identifier: AGPL-3.0-only
// Mutations and removals occur only inside disposable synthetic fixtures.
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,rm,symlink,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {checkPreservation,preservationConfig} from '../../scripts/check-ap23m1-preservation.mjs';
import {prepareProtection,researchConfig,safeRelative,sha256} from '../../scripts/prepare-ap23m1.mjs';
async function fixture(t){
 const root=await mkdtemp(join(tmpdir(),'ap23m1-preservation-test-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const files={},treeFiles={},head='1'.repeat(40);
 async function file(path,content,protect=false){const bytes=Buffer.from(typeof content==='string'?content:JSON.stringify(content));
  await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),bytes);if(protect)files[path]=sha256(bytes);return{path,byteLength:bytes.length,sha256:sha256(bytes)};}
 const entries={src:'src/core/main.ts',schemas:'schemas/calendar.json','data/releases':'data/releases/approved.json','data/candidates':'data/candidates/l3.json',
  'spfx/src':'spfx/src/Host.ts',tests:'tests/core/old.test.mjs',scripts:'scripts/old-product-build.mjs','spfx/scripts':'spfx/scripts/old-sync.mjs',
  'spfx/config':'spfx/config/package-solution.json','public-app':'public-app/index.html'};
 for(const[directory,path]of Object.entries(entries)){await file(path,'unchanged '+path,true);treeFiles[directory]=[path];}
 await file('package.json',{version:'0.9.0'},true);
 const proposal=await file('docs/planung/proposal.md','AP23M1 prepared, not started. Historical original.',true),userDocument=await file('outputs/user.docx','user document',true);
 const proof=await file('outputs/l3/local-completion.json',{professionalTechnicalAcceptance:false,status:'local-technical-verification-passed-awaiting-human-acceptance'},true);
 const priorGuard=await file('outputs/l3/guard.json',{files:{'old.ts':'0'.repeat(64)}},true),receipt=await file('archive/receipt.json',{professionalTechnicalAcceptance:true,sourceReleaseApproved:false},true);
 const living=await file('docs/living.md','status at start'),snapshotPath='outputs/start';
 const snapshotArtifacts=[proposal,living];for(const item of snapshotArtifacts)await file(snapshotPath+'/'+item.path,await readFile(join(root,item.path),'utf8'),true);
 const snapshotReceipt=await file(snapshotPath+'/receipt.json',{workPackage:'AP23M1',kind:'explicit-research-start-snapshot',startedBy:'David Steimer',
  userStartStatement:researchConfig.userStartStatement,professionalStepStarted:true,originalProposalUnchanged:true,preexistingPreparationVerificationExpected:false,
  professionalAcceptance:false,m2Started:false,m3Started:false,productCodeChangePermission:false,sourceReleaseApproved:false,commitCreated:false,sourcePushPerformed:false,operatingChanges:false,
  artifacts:snapshotArtifacts},true);
 const startSnapshot={...snapshotReceipt,payloadFiles:2,artifacts:snapshotArtifacts};
 const archive={verified:true,target:'archive',mode:'archive-reverified',files:1427,receiptSha256:receipt.sha256};
 const composition={historicalProtected:1,currentAcceptedL3:1,archivedL3Payload:0,archivedL3Receipt:1,startPayload:2,startReceipt:1,originalProposal:1,existingTreeFiles:10,additionalInputs:1};
 const guard={workPackage:'AP23M1',capturedAtResearchStart:true,capturedBeforeLivingUpdates:true,scopeConfirmedBy:'David Steimer',
  userStartStatement:researchConfig.userStartStatement,head,files,livingAtStart:{[living.path]:living.sha256},treeFiles,
  allowedNewResearchTests:[...researchConfig.allowedNewResearchTests],allowedNewResearchScripts:[...researchConfig.allowedNewResearchScripts],acceptedL3Archive:archive,composition,
  originalPreparation:{proposal:proposal.path,proposalSha256:proposal.sha256,verificationExpected:false},startSnapshot,
  previousGuard:{path:priorGuard.path,sha256:priorGuard.sha256,protectedFiles:1},originalL3Proof:{path:proof.path,sha256:proof.sha256},
  userDocument:{path:userDocument.path,sha256:userDocument.sha256},productCodeChangePermission:false,sourceReleaseApproved:false,professionalAcceptance:false,m2Started:false,m3Started:false,operatingChanges:false};
 const guardPath='outputs/m1/protected-inputs.json',descriptor=await file(guardPath,guard);
 const config={...preservationConfig,guardPath,guardSha256:descriptor.sha256,protectedCount:Object.keys(files).length,head,snapshotPath,
  originalProofSha256:proof.sha256,priorGuardCount:1,livingPaths:[living.path],treePaths:Object.keys(entries),archiveSha256:receipt.sha256,composition};
 const options={root,config,verifyArchive:async()=>({...archive}),readHead:()=>head};
 async function changeGuard(change,{rebind=false}={}){const current=JSON.parse(await readFile(join(root,guardPath)));change(current);const d=await file(guardPath,current);if(rebind)config.guardSha256=d.sha256;}
 return{root,config,options,file,changeGuard,guardPath,proposal,userDocument,receipt,living,proof,priorGuard,snapshotPath,snapshotReceipt,protectedCount:Object.keys(files).length};
}
test('synthetic M1 start preserves scope, no product authority and historical original proposal',async t=>{
 const f=await fixture(t),r=await checkPreservation(f.options);assert.equal(r.status,'research-inputs-preserved');assert.equal(r.protectedFilesVerified,f.protectedCount);
 assert.deepEqual(r.researchAdditions,[]);assert.equal(r.livingStatus[0].changed,false);assert.equal(r.startSnapshot.payloadFiles,2);
 for(const flag of['productCodeChanged','acceptedLegalDataChanged','schemasChanged','existingTestsChanged','originalPreparationChanged','l3HistoricalEvidenceChanged',
  'userDocumentChanged','professionalAcceptance','m2Started','m3Started','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(r[flag],false);
});
test('actual M1 start binds11212 inputs and original proposal plus seven exact living copies',async()=>{
 const r=await checkPreservation();assert.equal(r.protectedFilesVerified,11212);assert.equal(r.acceptedL3Archive.files,1427);assert.equal(r.livingStatus.length,7);assert.equal(r.startSnapshot.payloadFiles,8);
 assert.equal(r.protectedInputSha256,'51ab033044ec8c0c6424b0d7f5eac17a85c7b01836d5febc3c8ae1770ce8e610');
 assert.equal(r.startSnapshot.sha256,'c65268016b2203073692116233e5eb3898104ef949b8349662c2b64cf03bfbf5');
});
test('living status update does not refresh protected baseline or original start copy',async t=>{
 const f=await fixture(t),before=await readFile(join(f.root,f.guardPath)),copy=await readFile(join(f.root,f.snapshotPath,f.living.path));await f.file(f.living.path,'M1 started');
 assert.equal((await checkPreservation(f.options)).livingStatus[0].changed,true);assert.deepEqual(await readFile(join(f.root,f.guardPath)),before);assert.deepEqual(await readFile(join(f.root,f.snapshotPath,f.living.path)),copy);
});
test('new legal research findings and private source captures remain allowed',async t=>{
 const f=await fixture(t);await f.file('docs/fachrecht/ap23m1/befund-ne.json','research');await f.file('.work/research/AP23M1/VD/current.pdf','captured source');await f.file('outputs/ap23m1/research.json','research');
 assert.equal((await checkPreservation(f.options)).status,'research-inputs-preserved');
});
for(const path of[...researchConfig.allowedNewResearchTests,...researchConfig.allowedNewResearchScripts])test('exact M1-only helper/test addition '+path,async t=>{
 const f=await fixture(t);await f.file(path,'research test or verifier');assert.deepEqual((await checkPreservation(f.options)).researchAdditions,[path]);
});
for(const path of['src/core/main.ts','schemas/calendar.json','data/releases/approved.json','data/candidates/l3.json','spfx/src/Host.ts','tests/core/old.test.mjs',
 'scripts/old-product-build.mjs','spfx/scripts/old-sync.mjs','spfx/config/package-solution.json','public-app/index.html','package.json','docs/planung/proposal.md',
 'outputs/user.docx','outputs/l3/local-completion.json','outputs/l3/guard.json','archive/receipt.json','outputs/start/docs/planung/proposal.md','outputs/start/docs/living.md','outputs/start/receipt.json'])
 test('protected mutation refused '+path,async t=>{const f=await fixture(t);await f.file(path,'changed');await assert.rejects(checkPreservation(f.options),/Protected bytes changed/);});
for(const path of['src/new.ts','schemas/new.json','data/releases/new.json','data/candidates/new.json','spfx/src/New.ts','tests/core/new.test.mjs',
 'tests/governance/ap23m1-undeclared.test.mjs','scripts/new-product-build.mjs','scripts/prepare-ap23m2.mjs','spfx/scripts/new-sync.mjs','spfx/config/new.json','public-app/new.html'])
 test('undeclared tree addition refused '+path,async t=>{const f=await fixture(t);await f.file(path,'outside scope');await assert.rejects(checkPreservation(f.options),/Unexpected product\/source\/test\/script/);});
test('protected deletion refused',async t=>{const f=await fixture(t);await rm(join(f.root,'tests/core/old.test.mjs'));await assert.rejects(checkPreservation(f.options),{code:'ENOENT'});});
test('guard mutation refused before trusting altered claims',async t=>{const f=await fixture(t);await f.changeGuard(g=>g.productCodeChangePermission=true);await assert.rejects(checkPreservation(f.options),/Protected bytes changed/);});
for(const[key,value]of[['workPackage','AP23M2'],['capturedAtResearchStart',false],['capturedBeforeLivingUpdates',false],['scopeConfirmedBy','Codex'],['userStartStatement','invented'],
 ['productCodeChangePermission',true],['sourceReleaseApproved',true],['professionalAcceptance',true],['m2Started',true],['m3Started',true],['operatingChanges',true]])
 test('authority relabelling refused '+key,async t=>{const f=await fixture(t);await f.changeGuard(g=>g[key]=value,{rebind:true});await assert.rejects(checkPreservation(f.options));});
test('no retroactive preparation verification may be invented',async t=>{const f=await fixture(t);await f.changeGuard(g=>g.originalPreparation.verificationExpected=true,{rebind:true});await assert.rejects(checkPreservation(f.options),/No earlier verification/);});
test('protected inventory cannot shrink',async t=>{const f=await fixture(t);await f.changeGuard(g=>delete g.files['package.json'],{rebind:true});await assert.rejects(checkPreservation(f.options));});
test('living exceptions cannot expand to original proposal',async t=>{const f=await fixture(t);await f.changeGuard(g=>g.livingAtStart[f.proposal.path]='0'.repeat(64),{rebind:true});await assert.rejects(checkPreservation(f.options),/Living exceptions/);});
test('research test exceptions cannot expand to old tests',async t=>{const f=await fixture(t);await f.changeGuard(g=>g.allowedNewResearchTests.push('tests/core/old.test.mjs'),{rebind:true});await assert.rejects(checkPreservation(f.options),/Research test exceptions/);});
test('research script exceptions cannot expand to old product builder',async t=>{const f=await fixture(t);await f.changeGuard(g=>g.allowedNewResearchScripts.push('scripts/old-product-build.mjs'),{rebind:true});await assert.rejects(checkPreservation(f.options),/Research script exceptions/);});
test('tree inventory cannot refer outside its tree',async t=>{const f=await fixture(t);await f.changeGuard(g=>g.treeFiles.src=['package.json'],{rebind:true});await assert.rejects(checkPreservation(f.options));});
test('start snapshot refuses an additional file',async t=>{const f=await fixture(t);await f.file(f.snapshotPath+'/extra.txt','unexpected');await assert.rejects(checkPreservation(f.options),/Closed start snapshot inventory/);});
test('start snapshot refuses an additional empty directory',async t=>{const f=await fixture(t);await mkdir(join(f.root,f.snapshotPath,'extra'));await assert.rejects(checkPreservation(f.options),/Closed start snapshot directory/);});
test('Git HEAD drift refused without mutating Git',async t=>{const f=await fixture(t);await assert.rejects(checkPreservation({...f.options,readHead:()=> '2'.repeat(40)}),/Git head changed/);});
for(const archive of[{mode:'preflight',verified:true},{mode:'archive-reverified',verified:true,files:1426},{mode:'archive-reverified',verified:true,files:1427,receiptSha256:'0'.repeat(64)}])
 test('incomplete or unbound L3 archive refused '+JSON.stringify(archive),async t=>{const f=await fixture(t);await assert.rejects(checkPreservation({...f.options,verifyArchive:async()=>archive}));});
for(const kind of['file','directory','test','snapshot'])test('symlink preservation bypass refused '+kind,async t=>{
 const f=await fixture(t);if(kind==='file'){await f.file('other.ts','unchanged src/core/main.ts');await rm(join(f.root,'src/core/main.ts'));await symlink('../../other.ts',join(f.root,'src/core/main.ts'));}
 else if(kind==='directory'){await f.file('other/main.ts','unchanged src/core/main.ts');await rm(join(f.root,'src/core'),{recursive:true});await symlink('../other',join(f.root,'src/core'));}
 else if(kind==='test'){const path=researchConfig.allowedNewResearchTests[0];await mkdir(dirname(join(f.root,path)),{recursive:true});await f.file('other.mjs','test');await symlink('../../other.mjs',join(f.root,path));}
 else{await f.file('other.md','status at start');await rm(join(f.root,f.snapshotPath,f.living.path));await symlink('../../../other.md',join(f.root,f.snapshotPath,f.living.path));}
 await assert.rejects(checkPreservation(f.options),/Symlink not allowed/);
});
test('path policy refuses traversal and ambiguous forms',()=>{for(const path of['../secret','/absolute','a/../b','a//b','a\\b','C:/a','a\0b',''])assert.throws(()=>safeRelative(path));});
test('existing M1 guard cannot refresh even before archive consultation',async t=>{
 const f=await fixture(t),before=await readFile(join(f.root,f.guardPath));let consulted=false;
 await assert.rejects(prepareProtection({root:f.root,config:{...researchConfig,output:'outputs/m1'},verifyArchive:async()=>{consulted=true;throw Error('unexpected');}}));
 assert.equal(consulted,false);assert.deepEqual(await readFile(join(f.root,f.guardPath)),before);
});
test('existing start snapshot cannot be replaced even without a guard',async t=>{
 const f=await fixture(t),before=await readFile(join(f.root,f.snapshotPath,'receipt.json'));let consulted=false;
 await assert.rejects(prepareProtection({root:f.root,config:{...researchConfig,output:'outputs/other',startSnapshot:f.snapshotPath},verifyArchive:async()=>{consulted=true;throw Error('unexpected');}}),/Never replace/);
 assert.equal(consulted,false);assert.deepEqual(await readFile(join(f.root,f.snapshotPath,'receipt.json')),before);
});
