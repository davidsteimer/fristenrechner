// SPDX-License-Identifier: AGPL-3.0-only
// J2 preservation fixtures only. No accepted workspace file is mutated.
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,rm,symlink,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {checkPreservation,preservationConfig} from '../../scripts/check-ap23j2-preservation.mjs';
import {prepareProtection,preparationConfig,isAllowedNew,safeRelative,sha256} from '../../scripts/prepare-ap23j2.mjs';
async function fixture(t){
  const root=await mkdtemp(join(tmpdir(),'ap23j2-preservation-'));t.after(()=>rm(root,{recursive:true,force:true}));const files={},treeFiles={},head='1'.repeat(40);
  async function file(path,value,protect=false){const bytes=Buffer.from(typeof value==='string'?value:JSON.stringify(value));await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),bytes);const row={path,sha256:sha256(bytes)};if(protect)files[path]=row.sha256;return row;}
  const treeEntries={src:['src/core/main.ts'],schemas:['schemas/native.json','schemas/candidates/ap23j2/existing.json'],
    'data/releases':['data/releases/approved.json'],'data/candidates':['data/candidates/h3.json'],'spfx/src':['spfx/src/Host.ts'],tests:['tests/core/old.test.mjs']};
  for(const[directory,paths]of Object.entries(treeEntries)){for(const path of paths)await file(path,'original '+path,true);treeFiles[directory]=paths.sort();}
  const originalGuard=await file('proof/j1-guard.json',{workPackage:'AP23J1',professionalAcceptance:false},true);
  const originalProof=await file('proof/j1-completion.json',{professionalAcceptance:false,formatDecision:false},true);
  const userDocument=await file('outputs/user-modified.docx','user-owned document',true);
  const receipt=await file('archive/receipt.json',{professionalAcceptance:true,formatDecision:false},true);
  const archiveHelper=await file('scripts/archive-ap23j1-acceptance.mjs','frozen archive helper',true);
  await file('package.json',{version:'0.9.0'},true);
  const living=await file('docs/living.md','J1 accepted, J2 not yet tracked');
  const archive={verified:true,target:'archive',mode:'archive-reverified',files:101,receiptSha256:receipt.sha256};
  const originalJ1={proof:originalProof.path,proofSha256:originalProof.sha256,guard:originalGuard.path,guardSha256:originalGuard.sha256,protectedCount:1};
  const composition={previousProtected:1,currentAcceptedJ1:2,archivedJ1Payload:0,archivedJ1Receipt:1,additionalGovernance:1,existingTreeFiles:7};
  const guard={workPackage:'AP23J2',capturedBeforeTechnicalPlanning:true,capturedBeforeLivingUpdates:true,j1ProfessionallyAccepted:true,
    acceptedBy:'David Steimer',acceptedDecisionPoints:preparationConfig.acceptedDecisionPoints,userStartStatement:preparationConfig.userStartStatement,technicalPlanningStarted:true,
    head,acceptedJ1Archive:archive,originalJ1,userDocument,composition,files,livingAtStart:{[living.path]:living.sha256},treeFiles,
    allowedNew:preparationConfig.allowedNew,additionalProtected:[archiveHelper.path]};
  for(const key of['formatDecision','productCodeChangePermission','runtimeActivation','sourceReleaseApproved','releaseBuildPerformed','commitCreated','sourcePushPerformed','operatingChanges'])guard[key]=false;
  const guardPath='outputs/j2/protected-inputs.json',descriptor=await file(guardPath,guard);
  const config={...preservationConfig,guardPath,guardSha256:descriptor.sha256,protectedCount:Object.keys(files).length,head,
    livingPaths:[living.path],treePaths:Object.keys(treeEntries),additionalProtected:[archiveHelper.path],archiveSha256:receipt.sha256,originalJ1,userDocument,composition};
  const options={root,config,verifyArchive:async()=>({...archive}),readHead:()=>head};
  async function changeGuard(change,rebind=false){const value=JSON.parse(await readFile(join(root,guardPath)));change(value);const d=await file(guardPath,value);if(rebind)config.guardSha256=d.sha256;}
  return{root,config,options,file,changeGuard,guardPath,treeEntries,originalGuard,originalProof,userDocument,receipt,archiveHelper,living};
}
test('baseline preserves original J1 and product bytes without granting a format or runtime decision',async t=>{
  const f=await fixture(t),r=await checkPreservation(f.options);assert.equal(r.status,'technical-planning-inputs-preserved');assert.equal(r.protectedFilesVerified,f.config.protectedCount);assert.deepEqual(r.isolatedSchemaCandidateAdditions,[]);assert.deepEqual(r.isolatedGovernanceTestAdditions,[]);assert.equal(r.livingStatus[0].changed,false);
  for(const key of['productCodeChanged','nativeSchemasChanged','acceptedLegalDataChanged','existingTestsChanged','acceptedJ1ResearchChanged','historicalEvidenceChanged','userDocumentChanged','formatDecision','sourceReleaseApproved','runtimeActivation','releaseBuildPerformed','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(r[key],false);
});
test('seven-style living exception is separate and never refreshes the guard',async t=>{const f=await fixture(t),before=await readFile(join(f.root,f.guardPath));await f.file(f.living.path,'J2 started');assert.equal((await checkPreservation(f.options)).livingStatus[0].changed,true);assert.deepEqual(await readFile(join(f.root,f.guardPath)),before);});
for(const path of['schemas/candidates/ap23j2/catalog-v6.json','schemas/candidates/ap23j2/nested/contract.json','tests/governance/ap23j2-new-contract.test.mjs'])test('new isolated J2 addition allowed: '+path,async t=>{
  const f=await fixture(t);await f.file(path,'isolated J2 proposal');const r=await checkPreservation(f.options);assert.deepEqual([...r.isolatedSchemaCandidateAdditions,...r.isolatedGovernanceTestAdditions],[path]);assert.equal(r.nativeSchemasChanged,false);
});
test('new J2 research documents and reports outside runtime trees are not pre-existing product inputs',async t=>{const f=await fixture(t);await f.file('docs/architektur/ap23j2-analysis.md','new analysis');await f.file('outputs/ap23j2/fresh-proof.json',{});assert.equal((await checkPreservation(f.options)).status,'technical-planning-inputs-preserved');});
for(const path of['src/core/main.ts','schemas/native.json','schemas/candidates/ap23j2/existing.json','data/releases/approved.json','data/candidates/h3.json','spfx/src/Host.ts','tests/core/old.test.mjs','package.json','proof/j1-guard.json','proof/j1-completion.json','outputs/user-modified.docx','archive/receipt.json','scripts/archive-ap23j1-acceptance.mjs'])test('existing input cannot change, even in an allowed-new directory: '+path,async t=>{const f=await fixture(t);await f.file(path,'changed');await assert.rejects(checkPreservation(f.options),/Protected bytes changed/);});
test('deleted old test is refused',async t=>{const f=await fixture(t);await rm(join(f.root,'tests/core/old.test.mjs'));await assert.rejects(checkPreservation(f.options),{code:'ENOENT'});});
for(const path of['src/core/new.ts','schemas/native-new.json','schemas/candidates/ap23j20/new.json','schemas/candidates/ap23i3/new.json','data/releases/new.json','data/candidates/ap23j2/new.json','spfx/src/New.ts','tests/core/ap23j2-new.test.ts','tests/governance/ap23j1-new.test.mjs','tests/governance/ap23j2/nested.test.mjs'])test('undeclared source/schema/data/test addition is refused: '+path,async t=>{const f=await fixture(t);await f.file(path,'not authorised');await assert.rejects(checkPreservation(f.options),/Unapproved source/);});
test('guard mutation fails hash verification before reading new permission claims',async t=>{const f=await fixture(t);await f.changeGuard(g=>g.productCodeChangePermission=true);await assert.rejects(checkPreservation(f.options),/Protected bytes changed/);});
for(const[key,value]of[['workPackage','AP23J3'],['capturedBeforeTechnicalPlanning',false],['capturedBeforeLivingUpdates',false],['j1ProfessionallyAccepted',false],['acceptedBy','Codex'],['technicalPlanningStarted',false],['userStartStatement','invented statement'],['formatDecision',true],['productCodeChangePermission',true],['runtimeActivation',true],['sourceReleaseApproved',true],['releaseBuildPerformed',true],['commitCreated',true],['sourcePushPerformed',true],['operatingChanges',true]])test('J2 boundary cannot be relabelled: '+key,async t=>{const f=await fixture(t);await f.changeGuard(g=>g[key]=value,true);await assert.rejects(checkPreservation(f.options));});
test('J1 accepted point set cannot silently grow',async t=>{const f=await fixture(t);await f.changeGuard(g=>g.acceptedDecisionPoints.push('J1-H'),true);await assert.rejects(checkPreservation(f.options));});
test('protected count cannot shrink',async t=>{const f=await fixture(t);await f.changeGuard(g=>delete g.files['package.json'],true);await assert.rejects(checkPreservation(f.options));});
test('allowed schema prefix cannot expand to native schemas',async t=>{const f=await fixture(t);await f.changeGuard(g=>g.allowedNew={...g.allowedNew,schemaPrefix:'schemas/'},true);await assert.rejects(checkPreservation(f.options),/Isolated addition scope/);});
test('allowed test prefix cannot expand to product tests',async t=>{const f=await fixture(t);await f.changeGuard(g=>g.allowedNew={...g.allowedNew,testPattern:'.*'},true);await assert.rejects(checkPreservation(f.options),/Isolated addition scope/);});
test('living exception cannot include a source or accepted J1 proof',async t=>{const f=await fixture(t);await f.changeGuard(g=>g.livingAtStart[f.originalProof.path]=f.originalProof.sha256,true);await assert.rejects(checkPreservation(f.options),/Living exception set/);});
test('original J1 guard binding cannot be swapped',async t=>{const f=await fixture(t);await f.changeGuard(g=>g.originalJ1.guardSha256='0'.repeat(64),true);await assert.rejects(checkPreservation(f.options));});
test('tree cannot smuggle an out-of-tree original input',async t=>{const f=await fixture(t);await f.changeGuard(g=>g.treeFiles.src=['package.json'],true);await assert.rejects(checkPreservation(f.options));});
test('Git head drift is refused without Git mutation',async t=>{const f=await fixture(t);await assert.rejects(checkPreservation({...f.options,readHead:()=> '2'.repeat(40)}),/Git head changed/);});
test('partial archive cannot substitute for autonomous J1 re-verification',async t=>{const f=await fixture(t);await assert.rejects(checkPreservation({...f.options,verifyArchive:async()=>({verified:true,mode:'source-preflight-only'})}));});
test('different accepted J1 receipt is refused',async t=>{const f=await fixture(t);await assert.rejects(checkPreservation({...f.options,verifyArchive:async()=>({verified:true,mode:'archive-reverified',files:101,receiptSha256:'0'.repeat(64)})}));});
for(const kind of['protected file','allowed schema candidate','allowed J2 test','source directory'])test('symlink cannot bypass input or isolated-addition checks: '+kind,async t=>{
  const f=await fixture(t);await f.file('other.txt','original src/core/main.ts');
  if(kind==='protected file'){await rm(join(f.root,'src/core/main.ts'));await symlink('../../other.txt',join(f.root,'src/core/main.ts'));}
  else if(kind==='source directory'){await rm(join(f.root,'src/core'),{recursive:true});await mkdir(join(f.root,'other'));await symlink('../other',join(f.root,'src/core'));}
  else{const path=kind==='allowed schema candidate'?'schemas/candidates/ap23j2/new.json':'tests/governance/ap23j2-new.test.mjs';await mkdir(dirname(join(f.root,path)),{recursive:true});await symlink(join(f.root,'other.txt'),join(f.root,path));}
  await assert.rejects(checkPreservation(f.options),/Symlink/);
});
test('relative paths are closed before prefix matching',()=>{for(const path of['../a','/a','a/../b','schemas/candidates/ap23j2/../escape','a//b','a\\b','C:/a','a\0b','']){assert.throws(()=>safeRelative(path));assert.throws(()=>isAllowedNew(path));}assert.equal(isAllowedNew('schemas/candidates/ap23j20/x'),false);assert.equal(isAllowedNew('tests/governance/ap23j2/nested'),false);});
test('preparation refuses to refresh an existing baseline before any archive consultation',async t=>{const f=await fixture(t),before=await readFile(join(f.root,f.guardPath));let consulted=false;await assert.rejects(prepareProtection({root:f.root,config:{...preparationConfig,output:'outputs/j2'},verifyArchive:async()=>{consulted=true;throw Error('must not run');}}),/already frozen/);assert.equal(consulted,false);assert.deepEqual(await readFile(join(f.root,f.guardPath)),before);});

