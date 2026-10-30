// SPDX-License-Identifier: AGPL-3.0-only
// I1 research-start preservation only. All mutations stay inside synthetic fixtures.
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,rm,symlink,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {checkPreservation,preservationConfig} from '../../scripts/check-ap23i1-preservation.mjs';
import {prepareProtection,researchConfig,safeRelative,sha256} from '../../scripts/prepare-ap23i1.mjs';

async function fixture(t){
  const root=await mkdtemp(join(tmpdir(),'ap23i1-preservation-test-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const files={},treeFiles={},head='1'.repeat(40);
  async function file(path,content,protectedInput=false){
    const bytes=Buffer.from(typeof content==='string'?content:JSON.stringify(content));
    await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),bytes);
    if(protectedInput)files[path]=sha256(bytes);return{path,sha256:sha256(bytes)};
  }
  const treeEntries={src:'src/core/main.ts',schemas:'schemas/calendar.json','data/releases':'data/releases/approved.json',
    'data/candidates':'data/candidates/h3.json','spfx/src':'spfx/src/Host.ts',tests:'tests/core/old.test.mjs'};
  for(const[directory,path]of Object.entries(treeEntries)){await file(path,'unchanged '+path,true);treeFiles[directory]=[path];}
  const packagePath='package.json';await file(packagePath,{version:'0.9.0'},true);
  const proposal=await file('docs/planung/ap23i1-vorbereitung-gl-tg.md','immutable accepted proposal',true);
  const preparation=await file('outputs/preparation/verification.json',{i1Started:false,status:'passed'},true);
  const userDocument=await file('outputs/user-modified.docx','fixture user document',true);
  const oldProof=await file('outputs/h3/local-completion.json',{professionalTechnicalAcceptance:false},true);
  const receipt=await file('archive/receipt.json',{professionalTechnicalAcceptance:true,sourceReleaseApproved:false},true);
  const living=await file('docs/living.md','living status at start');
  const archive={verified:true,target:'archive',mode:'archive-reverified',files:417,receiptSha256:receipt.sha256};
  const composition={historicalProtected:1,currentRegistry:0,currentAcceptedH3:1,archivedH3Payload:0,archivedH3Receipt:1,originalPreparation:2,existingTreeFiles:6};
  const guard={workPackage:'AP23I1',capturedBeforeResearch:true,capturedBeforeLivingUpdates:true,scopeConfirmedBy:'David Steimer',userStartStatement:researchConfig.userStartStatement,
    head,files,livingAtStart:{[living.path]:living.sha256},treeFiles,allowedNewResearchTests:[...researchConfig.allowedNewResearchTests],
    acceptedH3Archive:archive,composition,originalPreparation:{path:preparation.path,sha256:preparation.sha256,proposal:proposal.path,proposalSha256:proposal.sha256},
    userDocument,productCodeChangePermission:false,sourceReleaseApproved:false,operatingChanges:false};
  const guardPath='outputs/i1/protected-inputs.json',descriptor=await file(guardPath,guard);
  const config={...preservationConfig,guardPath,guardSha256:descriptor.sha256,protectedCount:Object.keys(files).length,head,
    livingPaths:[living.path],treePaths:Object.keys(treeEntries),researchTests:[...researchConfig.allowedNewResearchTests],
    archiveSha256:receipt.sha256,preparation:preparation.path,preparationSha256:preparation.sha256,
    proposal:proposal.path,proposalSha256:proposal.sha256,userDocument:userDocument.path,userDocumentSha256:userDocument.sha256,composition};
  const options={root,config,verifyArchive:async()=>({...archive}),readHead:()=>head};
  async function changeGuard(change,{rebind=false}={}){
    const current=JSON.parse(await readFile(join(root,guardPath)));change(current);const d=await file(guardPath,current);
    if(rebind)config.guardSha256=d.sha256;
  }
  return{root,config,options,file,changeGuard,guardPath,treeEntries,packagePath,proposal,preparation,userDocument,oldProof,receipt,living};
}

test('fixture baseline is preserved and does not grant product or operating permission',async t=>{
  const f=await fixture(t),r=await checkPreservation(f.options);
  assert.equal(r.status,'research-inputs-preserved');assert.equal(r.protectedFilesVerified,12);assert.equal(r.livingStatus.length,1);
  assert.equal(r.livingStatus[0].changed,false);assert.deepEqual(r.researchTestAdditions,[]);
  for(const key of['productCodeChanged','acceptedLegalDataChanged','schemasChanged','existingTestsChanged','originalPreparationChanged','h3HistoricalEvidenceChanged','userDocumentChanged','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(r[key],false);
});
test('living status changes are visible but allowed without refreshing the baseline',async t=>{
  const f=await fixture(t),original=await readFile(join(f.root,f.guardPath));await f.file(f.living.path,'research started');
  const r=await checkPreservation(f.options);assert.equal(r.livingStatus[0].changed,true);
  assert.deepEqual(await readFile(join(f.root,f.guardPath)),original);
});
test('new I1 research documents and source captures are not old immutable inputs',async t=>{
  const f=await fixture(t);await f.file('docs/fachrecht/ap23i1/new-research.md','new research');await f.file('outputs/ap23i1-sources/official.txt','new official-source capture');
  const r=await checkPreservation(f.options);assert.equal(r.status,'research-inputs-preserved');
});
for(const path of researchConfig.allowedNewResearchTests)test('explicit new research test is allowed: '+path,async t=>{
  const f=await fixture(t);await f.file(path,'new I1-only test');const r=await checkPreservation(f.options);
  assert.deepEqual(r.researchTestAdditions,[path]);
});
for(const[name,path]of Object.entries({product:'src/core/main.ts',schema:'schemas/calendar.json',approvedData:'data/releases/approved.json',candidate:'data/candidates/h3.json',
  host:'spfx/src/Host.ts',oldTest:'tests/core/old.test.mjs',package:'package.json',proposal:'docs/planung/ap23i1-vorbereitung-gl-tg.md',
  preparation:'outputs/preparation/verification.json',userDocument:'outputs/user-modified.docx',oldProof:'outputs/h3/local-completion.json',receipt:'archive/receipt.json'}))
test('changed protected '+name+' is refused',async t=>{
  const f=await fixture(t);await f.file(path,'changed');await assert.rejects(checkPreservation(f.options),/Protected bytes changed/);
});
test('deleted old test is refused',async t=>{const f=await fixture(t);await rm(join(f.root,'tests/core/old.test.mjs'));await assert.rejects(checkPreservation(f.options),{code:'ENOENT'});});
for(const path of['src/new-runtime.ts','schemas/new-native.json','data/releases/new-release.json','data/candidates/new-candidate.json','spfx/src/NewHost.ts','tests/core/new-product.test.mjs','tests/governance/ap23i1-unapproved.test.mjs'])
test('an undeclared source/schema/data/test addition is refused: '+path,async t=>{
  const f=await fixture(t);await f.file(path,'not research scope');await assert.rejects(checkPreservation(f.options),/Unexpected addition or removal/);
});
test('frozen guard tampering is refused before evaluating altered claims',async t=>{
  const f=await fixture(t);await f.changeGuard(g=>g.productCodeChangePermission=true);await assert.rejects(checkPreservation(f.options),/Protected bytes changed/);
});
for(const[key,value]of[['workPackage','AP23I2'],['capturedBeforeResearch',false],['capturedBeforeLivingUpdates',false],['scopeConfirmedBy','AI'],
  ['userStartStatement','invented approval'],['productCodeChangePermission',true],['sourceReleaseApproved',true],['operatingChanges',true]])
test('research boundary cannot be re-labelled: '+key,async t=>{
  const f=await fixture(t);await f.changeGuard(g=>g[key]=value,{rebind:true});await assert.rejects(checkPreservation(f.options));
});
test('protected-file count cannot be silently reduced',async t=>{
  const f=await fixture(t);await f.changeGuard(g=>delete g.files['package.json'],{rebind:true});await assert.rejects(checkPreservation(f.options));
});
test('living exception set is exact rather than a general documentation exception',async t=>{
  const f=await fixture(t);await f.changeGuard(g=>g.livingAtStart[f.proposal.path]='0'.repeat(64),{rebind:true});await assert.rejects(checkPreservation(f.options),/Living status exception/);
});
test('new research-test exceptions cannot be expanded to product tests',async t=>{
  const f=await fixture(t);await f.changeGuard(g=>g.allowedNewResearchTests.push('tests/core/old.test.mjs'),{rebind:true});await assert.rejects(checkPreservation(f.options),/Research test exception/);
});
test('tree inventory cannot introduce an out-of-tree path',async t=>{
  const f=await fixture(t);await f.changeGuard(g=>g.treeFiles.src=['package.json'],{rebind:true});await assert.rejects(checkPreservation(f.options));
});
test('Git head drift is refused without writing or resetting Git',async t=>{
  const f=await fixture(t);await assert.rejects(checkPreservation({...f.options,readHead:()=> '2'.repeat(40)}),/Git head changed/);
});
test('an unverified or partial H3 archive is refused',async t=>{
  const f=await fixture(t);await assert.rejects(checkPreservation({...f.options,verifyArchive:async()=>({mode:'source-preflight-only',verified:true})}));
});
test('a different H3 receipt hash is refused',async t=>{
  const f=await fixture(t);await assert.rejects(checkPreservation({...f.options,verifyArchive:async()=>({mode:'archive-reverified',verified:true,files:417,receiptSha256:'0'.repeat(64)})}));
});
for(const type of['protected file','source directory','allowed new research test'])test(type+' symlink cannot bypass preservation',async t=>{
  const f=await fixture(t);
  if(type==='protected file'){await f.file('other.ts','unchanged src/core/main.ts');await rm(join(f.root,'src/core/main.ts'));await symlink('../../other.ts',join(f.root,'src/core/main.ts'));}
  else if(type==='source directory'){await f.file('other/main.ts','unchanged src/core/main.ts');await rm(join(f.root,'src/core'),{recursive:true});await symlink('../other',join(f.root,'src/core'));}
  else{const path=researchConfig.allowedNewResearchTests[0];await mkdir(dirname(join(f.root,path)),{recursive:true});await f.file('other-test.mjs','new research');await symlink('../../other-test.mjs',join(f.root,path));}
  await assert.rejects(checkPreservation(f.options),/Symlink not allowed/);
});
test('guard paths do not permit traversal, absolute paths or ambiguous separators',()=>{
  for(const path of['../secret','/absolute','a/../b','a//b','a\\b','C:/a','a\0b',''])assert.throws(()=>safeRelative(path));
});
test('preparation refuses to refresh an existing baseline before consulting any live archive',async t=>{
  const f=await fixture(t),original=await readFile(join(f.root,f.guardPath));let consulted=false;
  await assert.rejects(prepareProtection({root:f.root,config:{...researchConfig,output:'outputs/i1'},verifyArchive:async()=>{consulted=true;throw Error('must not be called');}}),/already frozen/);
  assert.equal(consulted,false);assert.deepEqual(await readFile(join(f.root,f.guardPath)),original);
});
