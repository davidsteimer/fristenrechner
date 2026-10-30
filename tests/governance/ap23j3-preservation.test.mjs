// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,writeFile,rm,readFile,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {checkPreservation,GENERATED_SCHEMA_COPIES} from '../../scripts/check-ap23j3-preservation.mjs';
import {preparationConfig,isAllowedNew,sha256} from '../../scripts/prepare-ap23j3.mjs';
async function fixture(t,change=()=>{}){
  const root=await mkdtemp(join(tmpdir(),'ap23j3-preservation-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const put=async(path,value)=>{const bytes=Buffer.from(typeof value==='string'?value:JSON.stringify(value));await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),bytes);return sha256(bytes);};
  const old=await put('src/core/legacy.ts','old version');const dispatcher=await put('src/core/dispatcher.ts','old dispatcher');
  const user=await put('private/user.docx','user changes');const living=await put('docs/README.md','current entry');
  const config={guardPath:'proof/protected-inputs.json',protectedCount:2,mutableCount:1,head:'a'.repeat(40),livingPaths:['docs/README.md'],treePaths:['src'],
    allowedNew:{files:['src/core/format14Runtime.ts',...GENERATED_SCHEMA_COPIES.map(row=>row.path)],prefixes:['src/candidate/'],patterns:['^src/ui/ap23j3[^/]+$'],generatedPrefix:'spfx/src/product/'},
    mutableAllowed:['src/core/dispatcher.ts'],generatedPrefix:'spfx/src/product/',archiveFiles:92,archiveSha256:'b'.repeat(64),
    previousGuard:{path:'old/guard.json',sha256:'c'.repeat(64),protectedCount:2759},previousProof:{path:'old/proof.json',sha256:'d'.repeat(64)},
    userDocument:{path:'private/user.docx',sha256:user}};
  const archive={verified:true,mode:'archive-reverified',files:92,receiptSha256:config.archiveSha256};
  const guard={workPackage:'AP23J3',capturedBeforeIntegration:true,capturedBeforeLivingUpdates:true,head:config.head,
    j2TechnicallyAccepted:true,acceptedBy:'David Steimer',userStatement:preparationConfig.statement,
    contractDecision:{id:'DEC-2026-039',status:'approved',on:'2026-10-27'},acceptedJ2Archive:archive,
    previousGuard:config.previousGuard,previousProof:config.previousProof,userDocument:config.userDocument,
    files:{'src/core/legacy.ts':old,'private/user.docx':user},mutableBefore:{'src/core/dispatcher.ts':dispatcher},
    livingAtStart:{'docs/README.md':living},treeFiles:{src:['src/core/dispatcher.ts','src/core/legacy.ts']},
    allowedNew:config.allowedNew,mutableAllowed:config.mutableAllowed,generatedMutablePrefix:config.generatedPrefix,
    sourceReleaseApproved:false,operatingChangesAuthorized:false,commitPermission:false,sourcePushPermission:false};
  change(guard);config.guardSha256=await put(config.guardPath,guard);
  return{root,config,put,guard,verifyArchive:async()=>archive,readHead:()=>config.head};
}
test('exact original baseline is preserved',async t=>{const f=await fixture(t);const q=await checkPreservation(f);assert.equal(q.protectedFilesVerified,2);assert.equal(q.intendedMutableInputs[0].changed,false);});
test('enumerated existing dispatcher may change',async t=>{const f=await fixture(t);await f.put('src/core/dispatcher.ts','new dispatch');const q=await checkPreservation(f);assert.equal(q.intendedMutableInputs[0].changed,true);});
test('living documentation is separate',async t=>{const f=await fixture(t);await f.put('docs/README.md','new entry');const q=await checkPreservation(f);assert.equal(q.livingStatus[0].changed,true);});
test('new explicitly allowed format module is separate',async t=>{const f=await fixture(t);await f.put('src/core/format14Runtime.ts','new v13');assert.deepEqual((await checkPreservation(f)).newIntegrationFiles,['src/core/format14Runtime.ts']);});
test('new approved UI helper is separate',async t=>{const f=await fixture(t);await f.put('src/ui/ap23j3Messages.ts','new labels');assert.deepEqual((await checkPreservation(f)).newIntegrationFiles,['src/ui/ap23j3Messages.ts']);});
test('unknown new source file is blocked',async t=>{const f=await fixture(t);await f.put('src/core/other.ts','unknown');await assert.rejects(checkPreservation(f),/Unapproved integration addition/);});
test('legacy reader changes blocked',async t=>{const f=await fixture(t);await f.put('src/core/legacy.ts','changed');await assert.rejects(checkPreservation(f),/Protected bytes changed/);});
test('legacy reader removal blocked',async t=>{const f=await fixture(t);await rm(join(f.root,'src/core/legacy.ts'));await assert.rejects(checkPreservation(f),{code:'ENOENT'});});
test('enumerated mutable removal is not permitted',async t=>{const f=await fixture(t);await rm(join(f.root,'src/core/dispatcher.ts'));await assert.rejects(checkPreservation(f),{code:'ENOENT'});});
test('foreign user document bytes remain protected',async t=>{const f=await fixture(t);await f.put('private/user.docx','lost user changes');await assert.rejects(checkPreservation(f),/Protected bytes changed/);});
test('guard bytes cannot refresh',async t=>{const f=await fixture(t);await f.put(f.config.guardPath,{...f.guard,head:'f'.repeat(40)});await assert.rejects(checkPreservation(f),/Protected bytes changed/);});
test('HEAD cannot move',async t=>{const f=await fixture(t);await assert.rejects(checkPreservation({...f,readHead:()=> 'f'.repeat(40)}),/Git HEAD changed/);});
test('archive bytes must be independently reverified',async t=>{const f=await fixture(t);await assert.rejects(checkPreservation({...f,verifyArchive:async()=>({verified:false})}));});
test('archive receipt hash cannot drift',async t=>{const f=await fixture(t);await assert.rejects(checkPreservation({...f,verifyArchive:async()=>({verified:true,mode:'archive-reverified',files:92,receiptSha256:'f'.repeat(64)})}));});
test('archive payload count cannot drift',async t=>{const f=await fixture(t);await assert.rejects(checkPreservation({...f,verifyArchive:async()=>({verified:true,mode:'archive-reverified',files:91,receiptSha256:f.config.archiveSha256})}));});
test('archive preflight is not acceptance archive',async t=>{const f=await fixture(t);await assert.rejects(checkPreservation({...f,verifyArchive:async()=>({verified:true,mode:'source-preflight-only',files:92,receiptSha256:f.config.archiveSha256})}));});
test('protected source symlink blocked',async t=>{const f=await fixture(t);await f.put('elsewhere.ts','old version');await rm(join(f.root,'src/core/legacy.ts'));await symlink('../../elsewhere.ts',join(f.root,'src/core/legacy.ts'));await assert.rejects(checkPreservation(f),/Symlink/);});
test('new source symlink blocked',async t=>{const f=await fixture(t);await f.put('elsewhere.ts','new');await symlink('../../elsewhere.ts',join(f.root,'src/core/format14Runtime.ts'));await assert.rejects(checkPreservation(f),/Symlink/);});
for(const key of ['capturedBeforeIntegration','capturedBeforeLivingUpdates','j2TechnicallyAccepted'])test('required true boundary '+key,async t=>{const f=await fixture(t,p=>p[key]=false);await assert.rejects(checkPreservation(f));});
for(const key of ['sourceReleaseApproved','operatingChangesAuthorized','commitPermission','sourcePushPermission'])test('required false boundary '+key,async t=>{const f=await fixture(t,p=>p[key]=true);await assert.rejects(checkPreservation(f));});
for(const[key,value]of [['workPackage','AP23J2'],['acceptedBy','AI'],['userStatement','other'],['contractDecision',{id:'DEC-2026-039',status:'proposed',on:null}],
  ['previousGuard',{}],['previousProof',{}],['userDocument',{}],['allowedNew',{}],['mutableAllowed',['src/core/legacy.ts']],['generatedMutablePrefix','src/']])
  test('guard metadata exact '+key,async t=>{const f=await fixture(t,p=>p[key]=value);await assert.rejects(checkPreservation(f));});
test('immutable cannot also be mutable',async t=>{const f=await fixture(t,p=>{p.mutableBefore['src/core/legacy.ts']=p.files['src/core/legacy.ts'];});f.config.mutableCount=2;await assert.rejects(checkPreservation(f),/Both immutable and mutable/);});
test('living cannot also be mutable',async t=>{const f=await fixture(t,p=>{p.mutableBefore['docs/README.md']=p.livingAtStart['docs/README.md'];p.mutableAllowed.push('docs/README.md');});f.config.mutableCount=2;await assert.rejects(checkPreservation(f),/Living input cannot be product mutable/);});
test('living exception set is exact',async t=>{const f=await fixture(t,p=>{p.livingAtStart.extra='e'.repeat(64);});await assert.rejects(checkPreservation(f));});
test('original tree inventory cannot duplicate inputs',async t=>{const f=await fixture(t,p=>p.treeFiles.src.push(p.treeFiles.src[0]));await assert.rejects(checkPreservation(f));});
test('original tree entries must be bound',async t=>{const f=await fixture(t,p=>p.treeFiles.src.push('src/unbound.ts'));await assert.rejects(checkPreservation(f),/Unbound original tree input/);});
test('new path policy has closed native version names',()=>{
  for(const path of ['src/core/administrativeTypesV7.ts','src/core/administrativeDeadlineV7.ts','src/core/releaseFormat14.ts','src/ui/ap23j3Messages.ts',
    'schemas/release-manifest-v14.schema.json','schemas/implementation/ap23j3/local.json','data/candidates/2026-10-27-ap23j3/manifest.json',
    'tests/core/ap23j3Fixtures.ts','spfx/test/ap23j3-format14.test.ts','spfx/src/product/core/format14Runtime.ts'])assert.equal(isAllowedNew(path),true,path);
  for(const path of ['src/core/administrativeCatalogV5.ts','src/core/format12Runtime.ts','schemas/release-manifest-v12.schema.json',
    'data/releases/new/file.json','data/candidates/2026-10-27-ap23h3/other.json','tests/core/old.test.ts','spfx/src/product/core/unknown.ts'])assert.equal(isAllowedNew(path),false,path);
});
test('read-only check does not rewrite guard',async t=>{const f=await fixture(t),before=await readFile(join(f.root,f.config.guardPath));await checkPreservation(f);assert.deepEqual(await readFile(join(f.root,f.config.guardPath)),before);});

async function withSupplement(t,change=()=>{}){
  const f=await fixture(t);await mkdir(join(f.root,'spfx/src'),{recursive:true});
  f.config.treePaths.push('spfx/src');f.guard.treeFiles['spfx/src']=[];
  f.config.guardSha256=await f.put(f.config.guardPath,f.guard);
  const supplement={workPackage:'AP23J3',kind:'closedGeneratedSchemaCopySupplement',
    originalGuard:{path:f.config.guardPath,sha256:f.config.guardSha256},copies:structuredClone(GENERATED_SCHEMA_COPIES),
    technicalScopeConfirmedByRoot:true,newOperatingAuthority:false,existingSchemaChangesAllowed:false};
  change(supplement);const path='proof/generated-schema-supplement.json';f.config.generatedSchemaSupplement={path,sha256:await f.put(path,supplement)};
  for(const source of new Set(GENERATED_SCHEMA_COPIES.map(copy=>copy.source)))await f.put(source,'native '+source);
  return f;
}
test('five-copy supplement does not require unfinished generated files at preparation',async t=>{
  const f=await withSupplement(t);assert.deepEqual((await checkPreservation(f)).generatedSchemaCopiesVerified,[]);
});
test('generated schema copy must be byte-identical to its native contract',async t=>{
  const f=await withSupplement(t),copy=GENERATED_SCHEMA_COPIES[0];await f.put(copy.path,'native '+copy.source);
  assert.equal((await checkPreservation(f)).generatedSchemaCopiesVerified.length,1);
});
test('different generated schema bytes are blocked',async t=>{
  const f=await withSupplement(t);await f.put(GENERATED_SCHEMA_COPIES[0].path,'changed schema');await assert.rejects(checkPreservation(f),/Generated schema differs/);
});
test('unlisted sixth generated schema is blocked',async t=>{
  const f=await withSupplement(t);await f.put('spfx/src/core/schemas/other.json','extra');await assert.rejects(checkPreservation(f),/Unapproved integration addition/);
});
for(const[key,value]of[['newOperatingAuthority',true],['existingSchemaChangesAllowed',true],['technicalScopeConfirmedByRoot',false],
  ['originalGuard',{path:'other/guard.json',sha256:'f'.repeat(64)}]])test('supplement keeps exact boundary '+key,async t=>{
    const f=await withSupplement(t,p=>p[key]=value);await assert.rejects(checkPreservation(f));
  });
test('supplement cannot widen the five exact mappings',async t=>{
  const f=await withSupplement(t,p=>p.copies.push({path:'spfx/src/core/schemas/extra.json',source:'schemas/extra.json'}));await assert.rejects(checkPreservation(f));
});

async function withNativeFileSupplement(t,change=()=>{},existing){
  const f=await fixture(t),source='src/core/holidayActivationV14.ts';
  await mkdir(join(f.root,'spfx/src'),{recursive:true});
  f.config.treePaths.push('spfx/src');f.guard.treeFiles['spfx/src']=[];
  if(existing){
    const before=await f.put(source,'old protected facade');
    f.guard.treeFiles.src.push(source);f.guard.treeFiles.src.sort((a,b)=>a.localeCompare(b,'en'));
    if(existing==='immutable'){
      f.guard.files[source]=before;f.config.protectedCount++;
    }else{
      f.guard.mutableBefore[source]=before;f.config.mutableAllowed.push(source);f.config.mutableCount++;
    }
  }
  f.config.guardSha256=await f.put(f.config.guardPath,f.guard);
  const supplement={workPackage:'AP23J3',kind:'closedNewNativeIntegrationFileSupplement',
    originalGuard:{path:f.config.guardPath,sha256:f.config.guardSha256},additionalNewFiles:[source],
    technicalScopeConfirmedByRoot:true,existingFileChangesAllowed:false,newOperatingAuthority:false};
  change(supplement);
  const path='proof/native-opening-integration-supplement.json';
  f.config.newFileSupplement={path,sha256:await f.put(path,supplement)};
  return f;
}
test('native file supplement admits only the exact new facade and its derived product copy without rewriting guard',async t=>{
  const f=await withNativeFileSupplement(t),before=await readFile(join(f.root,f.config.guardPath));
  const source='src/core/holidayActivationV14.ts',copy='spfx/src/product/core/holidayActivationV14.ts';
  await f.put(source,'native V14 facade');await f.put(copy,'native V14 facade');
  const report=await checkPreservation(f);
  assert.deepEqual(report.newIntegrationFiles,[copy,source]);assert.deepEqual(report.newFileSupplement,f.config.newFileSupplement);
  assert.equal(report.sourceReleaseApproved,false);assert.equal(report.operatingChanges,false);assert.equal(report.sourcePushPerformed,false);
  assert.deepEqual(await readFile(join(f.root,source)),await readFile(join(f.root,copy)));
  assert.deepEqual(await readFile(join(f.root,f.config.guardPath)),before);
});
test('native file supplement does not permit another facade or its generated product copy',async t=>{
  for(const path of['src/core/holidayActivationV15.ts','spfx/src/product/core/holidayActivationV15.ts']){
    const f=await withNativeFileSupplement(t);await f.put(path,'unapproved facade');
    await assert.rejects(checkPreservation(f),/Unapproved integration addition/);
  }
});
for(const[key,value]of[
  ['workPackage','AP23J2'],['kind','openIntegrationFiles'],
  ['additionalNewFiles',['src/core/holidayActivationV15.ts']],
  ['additionalNewFiles',['src/core/holidayActivationV14.ts','src/core/another.ts']],
  ['originalGuard',{path:'other/guard.json',sha256:'f'.repeat(64)}],
  ['technicalScopeConfirmedByRoot',false],['existingFileChangesAllowed',true],['newOperatingAuthority',true]
])test('native file supplement keeps its exact boundary '+key+' '+JSON.stringify(value),async t=>{
  const f=await withNativeFileSupplement(t,p=>p[key]=value);await assert.rejects(checkPreservation(f));
});
test('native file supplement must bind the actual original guard hash',async t=>{
  const f=await withNativeFileSupplement(t,p=>p.originalGuard.sha256='e'.repeat(64));
  await assert.rejects(checkPreservation(f));
});
test('native file supplement bytes must match their separately bound hash',async t=>{
  const f=await withNativeFileSupplement(t);await f.put(f.config.newFileSupplement.path,'unbound replacement');
  await assert.rejects(checkPreservation(f),/Protected bytes changed/);
});
for(const existing of['immutable','mutable'])test('native file supplement cannot loosen an existing '+existing+' source',async t=>{
  const f=await withNativeFileSupplement(t,()=>{},existing);await assert.rejects(checkPreservation(f));
});

