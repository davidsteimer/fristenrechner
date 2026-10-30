// SPDX-License-Identifier: AGPL-3.0-only
// Mutations in these preservation tests are confined to disposable synthetic fixtures.
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,rm,symlink,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {checkPreservation,preservationConfig} from '../../scripts/check-ap23j1-preservation.mjs';
import {prepareProtection,researchConfig,safeRelative,sha256} from '../../scripts/prepare-ap23j1.mjs';

async function fixture(t){
  const root=await mkdtemp(join(tmpdir(),'ap23j1-preservation-test-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const files={},treeFiles={},head='1'.repeat(40);
  async function file(path,content,protect=false){
    const bytes=Buffer.from(typeof content==='string'?content:JSON.stringify(content));
    await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),bytes);
    if(protect)files[path]=sha256(bytes);return{path,sha256:sha256(bytes)};
  }
  const entries={src:'src/core/main.ts',schemas:'schemas/calendar.json','data/releases':'data/releases/approved.json',
    'data/candidates':'data/candidates/i3.json','spfx/src':'spfx/src/Host.ts',tests:'tests/core/old.test.mjs'};
  for(const[directory,path]of Object.entries(entries)){await file(path,'unchanged '+path,true);treeFiles[directory]=[path];}
  await file('package.json',{version:'0.9.0'},true);
  const proposal=await file('docs/planung/proposal.md','immutable accepted proposal',true);
  const preparation=await file('outputs/preparation/verification.json',{j1Started:false,status:'passed'},true);
  const userDocument=await file('outputs/user-modified.docx','user document',true);
  await file('outputs/i3/local-completion.json',{professionalTechnicalAcceptance:false},true);
  const receipt=await file('archive/receipt.json',{professionalTechnicalAcceptance:true,sourceReleaseApproved:false},true);
  const living=await file('docs/living.md','living status at start');
  const archive={verified:true,target:'archive',mode:'archive-reverified',files:822,receiptSha256:receipt.sha256};
  const composition={historicalProtected:1,currentAcceptedI3:1,archivedI3Payload:0,archivedI3Receipt:1,originalPreparation:2,existingTreeFiles:6};
  const guard={workPackage:'AP23J1',capturedBeforeResearch:true,capturedBeforeLivingUpdates:true,scopeConfirmedBy:'David Steimer',
    userStartStatement:researchConfig.userStartStatement,head,files,livingAtStart:{[living.path]:living.sha256},treeFiles,
    allowedNewResearchTests:[...researchConfig.allowedNewResearchTests],acceptedI3Archive:archive,composition,
    originalPreparation:{path:preparation.path,sha256:preparation.sha256,proposal:proposal.path,proposalSha256:proposal.sha256},
    userDocument,productCodeChangePermission:false,sourceReleaseApproved:false,operatingChanges:false};
  const guardPath='outputs/j1/protected-inputs.json',descriptor=await file(guardPath,guard);
  const config={...preservationConfig,guardPath,guardSha256:descriptor.sha256,protectedCount:Object.keys(files).length,head,
    livingPaths:[living.path],treePaths:Object.keys(entries),researchTests:[...researchConfig.allowedNewResearchTests],
    archiveSha256:receipt.sha256,preparation:preparation.path,preparationSha256:preparation.sha256,
    proposal:proposal.path,proposalSha256:proposal.sha256,userDocument:userDocument.path,userDocumentSha256:userDocument.sha256,composition};
  const options={root,config,verifyArchive:async()=>({...archive}),readHead:()=>head};
  async function changeGuard(change,{rebind=false}={}){
    const current=JSON.parse(await readFile(join(root,guardPath)));change(current);const d=await file(guardPath,current);
    if(rebind)config.guardSha256=d.sha256;
  }
  return{root,config,options,file,changeGuard,guardPath,proposal,preparation,userDocument,receipt,living};
}

test('synthetic baseline preserves product and operational boundaries',async t=>{
  const f=await fixture(t),r=await checkPreservation(f.options);assert.equal(r.status,'research-inputs-preserved');
  assert.equal(r.protectedFilesVerified,12);assert.equal(r.livingStatus[0].changed,false);assert.deepEqual(r.researchTestAdditions,[]);
  for(const key of['productCodeChanged','acceptedLegalDataChanged','schemasChanged','existingTestsChanged','originalPreparationChanged',
    'i3HistoricalEvidenceChanged','userDocumentChanged','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(r[key],false);
});
test('living entry update is explicit and never refreshes frozen baseline',async t=>{
  const f=await fixture(t),before=await readFile(join(f.root,f.guardPath));await f.file(f.living.path,'J1 started');
  assert.equal((await checkPreservation(f.options)).livingStatus[0].changed,true);assert.deepEqual(await readFile(join(f.root,f.guardPath)),before);
});
test('new research documents and captured sources are permitted',async t=>{
  const f=await fixture(t);await f.file('docs/fachrecht/ap23j1/research.md','research');await f.file('outputs/ap23j1/sources/capture.txt','source');
  assert.equal((await checkPreservation(f.options)).status,'research-inputs-preserved');
});
for(const path of researchConfig.allowedNewResearchTests)test('declared J1-only test addition '+path,async t=>{
  const f=await fixture(t);await f.file(path,'research test');assert.deepEqual((await checkPreservation(f.options)).researchTestAdditions,[path]);
});
for(const path of['src/core/main.ts','schemas/calendar.json','data/releases/approved.json','data/candidates/i3.json',
  'spfx/src/Host.ts','tests/core/old.test.mjs','package.json','docs/planung/proposal.md','outputs/preparation/verification.json',
  'outputs/user-modified.docx','outputs/i3/local-completion.json','archive/receipt.json'])test('protected byte mutation refused '+path,async t=>{
  const f=await fixture(t);await f.file(path,'changed');await assert.rejects(checkPreservation(f.options),/Protected bytes changed/);
});
for(const path of['src/new.ts','schemas/new.json','data/releases/new.json','data/candidates/new.json','spfx/src/New.ts',
  'tests/core/new.test.mjs','tests/governance/ap23j1-undeclared.test.mjs'])test('undeclared tree addition refused '+path,async t=>{
  const f=await fixture(t);await f.file(path,'outside scope');await assert.rejects(checkPreservation(f.options),/Unexpected product\/source\/test/);
});
test('old test deletion refused',async t=>{const f=await fixture(t);await rm(join(f.root,'tests/core/old.test.mjs'));await assert.rejects(checkPreservation(f.options),{code:'ENOENT'});});
test('frozen guard byte change refused before trusting altered claims',async t=>{
  const f=await fixture(t);await f.changeGuard(g=>g.productCodeChangePermission=true);await assert.rejects(checkPreservation(f.options),/Protected bytes changed/);
});
for(const[key,value]of[['workPackage','AP23J2'],['capturedBeforeResearch',false],['capturedBeforeLivingUpdates',false],
  ['scopeConfirmedBy','AI'],['userStartStatement','invented'],['productCodeChangePermission',true],['sourceReleaseApproved',true],['operatingChanges',true]])
test('relabelled authority refused '+key,async t=>{
  const f=await fixture(t);await f.changeGuard(g=>g[key]=value,{rebind:true});await assert.rejects(checkPreservation(f.options));
});
test('protected count cannot shrink',async t=>{const f=await fixture(t);await f.changeGuard(g=>delete g.files['package.json'],{rebind:true});await assert.rejects(checkPreservation(f.options));});
test('seven living exceptions are not a blanket documentation permission',async t=>{
  const f=await fixture(t);await f.changeGuard(g=>g.livingAtStart[f.proposal.path]='0'.repeat(64),{rebind:true});await assert.rejects(checkPreservation(f.options),/Living exceptions/);
});
test('research test exception cannot expand',async t=>{
  const f=await fixture(t);await f.changeGuard(g=>g.allowedNewResearchTests.push('tests/core/old.test.mjs'),{rebind:true});await assert.rejects(checkPreservation(f.options),/Research test exceptions/);
});
test('tree inventory cannot reference an out-of-tree input',async t=>{
  const f=await fixture(t);await f.changeGuard(g=>g.treeFiles.src=['package.json'],{rebind:true});await assert.rejects(checkPreservation(f.options));
});
test('Git head drift refused without mutating Git',async t=>{
  const f=await fixture(t);await assert.rejects(checkPreservation({...f.options,readHead:()=> '2'.repeat(40)}),/Git head changed/);
});
for(const archive of[{mode:'preflight',verified:true},{mode:'archive-reverified',verified:true,files:821},
  {mode:'archive-reverified',verified:true,files:822,receiptSha256:'0'.repeat(64)}])test('partial or unbound I3 archive refused '+JSON.stringify(archive),async t=>{
  const f=await fixture(t);await assert.rejects(checkPreservation({...f.options,verifyArchive:async()=>archive}));
});
for(const type of['file','directory','test'])test('symlink cannot bypass preservation '+type,async t=>{
  const f=await fixture(t);
  if(type==='file'){await f.file('other.ts','unchanged src/core/main.ts');await rm(join(f.root,'src/core/main.ts'));await symlink('../../other.ts',join(f.root,'src/core/main.ts'));}
  else if(type==='directory'){await f.file('other/main.ts','unchanged src/core/main.ts');await rm(join(f.root,'src/core'),{recursive:true});await symlink('../other',join(f.root,'src/core'));}
  else{const path=researchConfig.allowedNewResearchTests[0];await mkdir(dirname(join(f.root,path)),{recursive:true});await f.file('other.mjs','new test');await symlink('../../other.mjs',join(f.root,path));}
  await assert.rejects(checkPreservation(f.options),/Symlink not allowed/);
});
test('path normalisation cannot hide traversal or absolute targets',()=>{
  for(const path of['../secret','/absolute','a/../b','a//b','a\\b','C:/a','a\0b',''])assert.throws(()=>safeRelative(path));
});
test('existing start inventory cannot be refreshed, even before archive consultation',async t=>{
  const f=await fixture(t),before=await readFile(join(f.root,f.guardPath));let consulted=false;
  await assert.rejects(prepareProtection({root:f.root,config:{...researchConfig,output:'outputs/j1'},verifyArchive:async()=>{consulted=true;throw Error('unexpected');}}));
  assert.equal(consulted,false);assert.deepEqual(await readFile(join(f.root,f.guardPath)),before);
});
