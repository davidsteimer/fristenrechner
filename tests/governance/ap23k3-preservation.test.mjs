// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,writeFile,readFile,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {checkPreservation,GENERATED_SCHEMA_COPIES} from '../../scripts/check-ap23k3-preservation.mjs';
import {preparationConfig,isAllowedNew,sha256} from '../../scripts/prepare-ap23k3.mjs';

async function fixture(t,change=()=>{}){
  const root=await mkdtemp(join(tmpdir(),'ap23k3-preservation-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const put=async(path,value)=>{const bytes=Buffer.from(typeof value==='string'?value:JSON.stringify(value));await mkdir(dirname(join(root,path)),{recursive:true});
    await writeFile(join(root,path),bytes);return sha256(bytes);};
  const old=await put('src/core/legacy.ts','old version'),dispatcher=await put('src/core/dispatcher.ts','old dispatcher');
  const user=await put('private/user.docx','user changes'),living=await put('docs/README.md','current entry');
  await mkdir(join(root,'spfx/src'),{recursive:true});
  const config={guardPath:'proof/protected-inputs.json',protectedCount:2,mutableCount:1,head:'a'.repeat(40),
    livingPaths:['docs/README.md'],treePaths:['src','spfx/src'],
    allowedNew:{files:['src/core/format15Runtime.ts',...GENERATED_SCHEMA_COPIES.map(row=>row.path)],prefixes:['src/candidate/'],
      patterns:['^src/ui/ap23k3[^/]+$'],generatedPrefix:'spfx/src/product/'},
    mutableAllowed:['src/core/dispatcher.ts'],generatedPrefix:'spfx/src/product/',generatedDerived:{},archiveFiles:131,archiveSha256:'b'.repeat(64),
    previousGuard:{path:'old/guard.json',sha256:'c'.repeat(64),protectedCount:6612},previousProof:{path:'old/proof.json',sha256:'d'.repeat(64)},
    userDocument:{path:'private/user.docx',sha256:user}};
  const archive={verified:true,mode:'archive-reverified',files:131,receiptSha256:config.archiveSha256};
  const guard={workPackage:'AP23K3',capturedBeforeIntegration:true,capturedBeforeLivingUpdates:true,head:config.head,
    k2TechnicallyAccepted:true,acceptedBy:'David Steimer',userStatement:preparationConfig.statement,
    contractDecision:{id:'DEC-2026-040',status:'approved',on:'2026-10-27'},acceptedK2Archive:archive,
    previousGuard:config.previousGuard,previousProof:config.previousProof,userDocument:config.userDocument,
    files:{'src/core/legacy.ts':old,'private/user.docx':user},mutableBefore:{'src/core/dispatcher.ts':dispatcher},
    livingAtStart:{'docs/README.md':living},treeFiles:{src:['src/core/dispatcher.ts','src/core/legacy.ts'],'spfx/src':[]},
    allowedNew:config.allowedNew,mutableAllowed:config.mutableAllowed,generatedMutablePrefix:config.generatedPrefix,generatedDerived:config.generatedDerived,
    sourceReleaseApproved:false,operatingChangesAuthorized:false,commitPermission:false,sourcePushPermission:false};
  change(guard);config.guardSha256=await put(config.guardPath,guard);
  return{root,config,put,guard,verifyArchive:async()=>archive,readHead:()=>config.head};
}
test('exact original integration baseline is preserved',async t=>{const f=await fixture(t),q=await checkPreservation(f);assert.equal(q.protectedFilesVerified,2);assert.equal(q.intendedMutableInputs[0].changed,false);});
test('enumerated dispatcher can change while immutable native versions remain protected',async t=>{const f=await fixture(t);await f.put('src/core/dispatcher.ts','new dispatch');assert.equal((await checkPreservation(f)).intendedMutableInputs[0].changed,true);});
test('seven living status exceptions are separate from calculation inputs',async t=>{const f=await fixture(t);await f.put('docs/README.md','new status');assert.equal((await checkPreservation(f)).livingStatus[0].changed,true);assert.equal(preparationConfig.living.length,7);});
test('new explicitly allowed Format15 module is separate',async t=>{const f=await fixture(t);await f.put('src/core/format15Runtime.ts','new format');assert.deepEqual((await checkPreservation(f)).newIntegrationFiles,['src/core/format15Runtime.ts']);});
test('new K3 UI helper is separate',async t=>{const f=await fixture(t);await f.put('src/ui/ap23k3Messages.ts','new labels');assert.deepEqual((await checkPreservation(f)).newIntegrationFiles,['src/ui/ap23k3Messages.ts']);});
test('unknown new native module is not authorised by a broad source prefix',async t=>{const f=await fixture(t);await f.put('src/core/other.ts','unknown');await assert.rejects(checkPreservation(f),/Unapproved integration addition/);});
for(const mode of ['change','remove'])test('old native version '+mode+' blocked',async t=>{const f=await fixture(t);if(mode==='change')await f.put('src/core/legacy.ts','changed');else await rm(join(f.root,'src/core/legacy.ts'));await assert.rejects(checkPreservation(f));});
test('mutable file deletion is not permitted',async t=>{const f=await fixture(t);await rm(join(f.root,'src/core/dispatcher.ts'));await assert.rejects(checkPreservation(f),{code:'ENOENT'});});
test('foreign user document remains protected',async t=>{const f=await fixture(t);await f.put('private/user.docx','lost changes');await assert.rejects(checkPreservation(f),/Protected bytes changed/);});
test('frozen guard cannot be refreshed',async t=>{const f=await fixture(t);await f.put(f.config.guardPath,{...f.guard,head:'f'.repeat(40)});await assert.rejects(checkPreservation(f),/Protected bytes changed/);});
test('HEAD cannot move',async t=>{const f=await fixture(t);await assert.rejects(checkPreservation({...f,readHead:()=> 'f'.repeat(40)}),/Git HEAD changed/);});
for(const edit of [archive=>({...archive,verified:false}),archive=>({...archive,mode:'source-preflight-only'}),
  archive=>({...archive,files:130}),archive=>({...archive,receiptSha256:'f'.repeat(64)})])test('autonomous accepted archive identity is mandatory '+String(edit),async t=>{
    const f=await fixture(t),archive=await f.verifyArchive();await assert.rejects(checkPreservation({...f,verifyArchive:async()=>edit(archive)}));
  });
for(const kind of ['old','new'])test('source '+kind+' symlinks are rejected',async t=>{
  const f=await fixture(t);await f.put('elsewhere.ts','old version');
  const path=kind==='old'?'src/core/legacy.ts':'src/core/format15Runtime.ts';
  if(kind==='old')await rm(join(f.root,path));await symlink('../../elsewhere.ts',join(f.root,path));await assert.rejects(checkPreservation(f),/Symlink/);
});
for(const key of ['capturedBeforeIntegration','capturedBeforeLivingUpdates','k2TechnicallyAccepted'])test('true boundary '+key,async t=>{const f=await fixture(t,p=>p[key]=false);await assert.rejects(checkPreservation(f));});
for(const key of ['sourceReleaseApproved','operatingChangesAuthorized','commitPermission','sourcePushPermission'])test('false boundary '+key,async t=>{const f=await fixture(t,p=>p[key]=true);await assert.rejects(checkPreservation(f));});
for(const [key,value] of [['workPackage','AP23K2'],['acceptedBy','AI'],['userStatement','other'],
  ['contractDecision',{id:'DEC-2026-040',status:'proposed',on:null}],['previousGuard',{}],['previousProof',{}],['userDocument',{}],
  ['allowedNew',{}],['mutableAllowed',['src/core/legacy.ts']],['generatedMutablePrefix','src/'],['generatedDerived',{unapproved:{source:'other'}}]])
  test('guard metadata is exact '+key,async t=>{const f=await fixture(t,p=>p[key]=value);await assert.rejects(checkPreservation(f));});
test('immutable and mutable sets cannot overlap',async t=>{const f=await fixture(t,p=>{p.mutableBefore['src/core/legacy.ts']=p.files['src/core/legacy.ts'];});f.config.mutableCount=2;await assert.rejects(checkPreservation(f),/Both immutable and mutable/);});
test('living and mutable sets cannot overlap',async t=>{const f=await fixture(t,p=>{p.mutableBefore['docs/README.md']=p.livingAtStart['docs/README.md'];p.mutableAllowed.push('docs/README.md');});f.config.mutableCount=2;await assert.rejects(checkPreservation(f),/Living input cannot be product mutable/);});
test('living exception inventory is exact',async t=>{const f=await fixture(t,p=>p.livingAtStart.extra='e'.repeat(64));await assert.rejects(checkPreservation(f));});
test('tree inventory cannot duplicate an input',async t=>{const f=await fixture(t,p=>p.treeFiles.src.push(p.treeFiles.src[0]));await assert.rejects(checkPreservation(f));});
test('tree inventory cannot introduce an unbound old input',async t=>{const f=await fixture(t,p=>p.treeFiles.src.push('src/unbound.ts'));await assert.rejects(checkPreservation(f),/Unbound original tree input/);});
test('new file policy admits only agreed version names and K3 namespaces',()=>{
  for(const path of ['src/core/administrativeTypesV8.ts','src/core/administrativeCatalogV8.ts','src/core/administrativeDeadlineV8.ts',
    'src/core/format15Runtime.ts','src/core/holidayActivationV15.ts','src/core/releaseFormat15.ts','src/release/ap23k3CandidateData.ts',
    'src/ui/ap23k3Messages.ts','schemas/administrative-input-v8.schema.json','schemas/release-manifest-v15.schema.json',
    'data/candidates/2026-10-27-ap23k3/manifest.json','tests/core/ap23k3-native.test.ts','tests/data/test_ap23k3_contract.py',
    'spfx/test/ap23k3-host.test.ts','spfx/src/product/core/format15Runtime.ts'])assert.equal(isAllowedNew(path),true,path);
  for(const path of ['src/core/administrativeCatalogV7.ts','src/core/format14Runtime.ts','src/core/unknown.ts','schemas/release-manifest-v14.schema.json',
    'data/releases/new/file.json','data/candidates/2026-10-27-ap23j3/other.json','tests/core/old.test.ts'])assert.equal(isAllowedNew(path),false,path);
});
test('read-only verification cannot rewrite the guard',async t=>{const f=await fixture(t),before=await readFile(join(f.root,f.config.guardPath));await checkPreservation(f);assert.deepEqual(await readFile(join(f.root,f.config.guardPath)),before);});

test('generated new product module must equal its approved new source',async t=>{
  const f=await fixture(t);await f.put('src/core/format15Runtime.ts','new format');await f.put('spfx/src/product/core/format15Runtime.ts','new format');
  assert.equal((await checkPreservation(f)).generatedProductCopiesVerified.length,1);
  await f.put('spfx/src/product/core/format15Runtime.ts','different');await assert.rejects(checkPreservation(f),/Generated product copy differs/);
});
test('generated old-version addition is allowed only as exact protected native bytes',async t=>{
  const f=await fixture(t);await f.put('spfx/src/product/core/legacy.ts','old version');
  assert.equal((await checkPreservation(f)).generatedProductCopiesVerified.length,1);
  await f.put('spfx/src/product/core/legacy.ts','rewritten legacy');await assert.rejects(checkPreservation(f),/Generated product copy differs/);
});
test('generated foreign product module is rejected even if an unapproved native file exists',async t=>{
  const f=await fixture(t);await f.put('src/core/other.ts','unknown');await f.put('spfx/src/product/core/other.ts','unknown');
  await assert.rejects(checkPreservation(f),/Unapproved integration addition/);
});
test('all seven generated schema copies are explicitly declared and exact',async t=>{
  const f=await fixture(t);assert.equal(GENERATED_SCHEMA_COPIES.length,7);
  for(const copy of GENERATED_SCHEMA_COPIES){await f.put(copy.source,'schema '+copy.source);await f.put(copy.path,'schema '+copy.source);}
  assert.equal((await checkPreservation(f)).generatedSchemaCopiesVerified.length,7);
  await f.put(GENERATED_SCHEMA_COPIES[0].path,'altered');await assert.rejects(checkPreservation(f),/Generated schema differs/);
});
test('an eighth undeclared generated schema is rejected',async t=>{const f=await fixture(t);await f.put('spfx/src/core/schemas/foreign.json','{}');await assert.rejects(checkPreservation(f),/Unapproved integration addition/);});
test('generated styles wrapper has no independent CSS editing authority',async t=>{
  const f=await fixture(t),path='spfx/src/product/ui/styles.module.scss',source='src/ui/styles.css';
  const style=await f.put(source,'unchanged css'),derived={source,prefix:':global {\n',suffix:'\n}\n'};
  f.guard.files[source]=style;f.config.protectedCount++;f.guard.treeFiles.src.push(source);f.guard.treeFiles.src.sort();
  f.config.generatedDerived[path]=derived;
  const before=await f.put(path,derived.prefix+'unchanged css'+derived.suffix);
  f.guard.mutableBefore[path]=before;f.config.mutableCount++;f.guard.treeFiles['spfx/src'].push(path);
  f.config.guardSha256=await f.put(f.config.guardPath,f.guard);
  assert.equal((await checkPreservation(f)).generatedProductCopiesVerified[0].derived,true);
  await f.put(path,derived.prefix+'changed css'+derived.suffix);await assert.rejects(checkPreservation(f),/Generated product copy differs/);
});
