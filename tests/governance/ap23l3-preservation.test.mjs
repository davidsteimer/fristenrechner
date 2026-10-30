// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic protection fixtures only. Accepted workspace inputs are not mutated.
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,writeFile,readFile,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {checkPreservation,GENERATED_SCHEMA_COPIES,preservationConfig} from '../../scripts/check-ap23l3-preservation.mjs';
import {preparationConfig,isAllowedNew,sha256,prepareProtection} from '../../scripts/prepare-ap23l3.mjs';
async function fixture(t,change=()=>{}){
 const root=await mkdtemp(join(tmpdir(),'ap23l3-preservation-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const put=async(path,value)=>{const bytes=Buffer.from(typeof value==='string'?value:JSON.stringify(value));await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),bytes);return sha256(bytes);};
 const old=await put('src/core/legacy.ts','old version'),dispatcher=await put('src/core/dispatcher.ts','old dispatcher'),user=await put('private/user.docx','user changes'),living=await put('docs/README.md','entry');
 await mkdir(join(root,'spfx/src'),{recursive:true});await mkdir(join(root,'scripts'),{recursive:true});
 const config={guardPath:'proof/protected-inputs.json',protectedCount:2,mutableCount:1,head:'a'.repeat(40),livingPaths:['docs/README.md'],treePaths:['src','spfx/src','scripts'],
  allowedNew:{files:['src/core/format16Runtime.ts',...GENERATED_SCHEMA_COPIES.map(row=>row.path)],prefixes:['src/candidate/'],patterns:['^src/ui/ap23l3[^/]+$','^scripts/[^/]*ap23l3[^/]*$'],generatedPrefix:'spfx/src/product/'},
  mutableAllowed:['src/core/dispatcher.ts'],generatedPrefix:'spfx/src/product/',generatedDerived:{},archiveFiles:137,archiveSha256:'b'.repeat(64),
  previousGuard:{path:'old/guard.json',sha256:'c'.repeat(64),protectedCount:9048},previousProof:{path:'old/proof.json',sha256:'d'.repeat(64)},userDocument:{path:'private/user.docx',sha256:user}};
 const archive={verified:true,mode:'archive-reverified',files:137,receiptSha256:config.archiveSha256};
 const guard={workPackage:'AP23L3',capturedBeforeIntegration:true,capturedBeforeLivingUpdates:true,head:config.head,l2TechnicallyAccepted:true,acceptedBy:'David Steimer',userStatement:preparationConfig.statement,
  contractDecision:{id:'DEC-2026-041',status:'approved',on:'2026-10-27'},acceptedL2Archive:archive,previousGuard:config.previousGuard,previousProof:config.previousProof,userDocument:config.userDocument,
  files:{'src/core/legacy.ts':old,'private/user.docx':user},mutableBefore:{'src/core/dispatcher.ts':dispatcher},livingAtStart:{'docs/README.md':living},
  treeFiles:{src:['src/core/dispatcher.ts','src/core/legacy.ts'],'spfx/src':[],scripts:[]},allowedNew:config.allowedNew,mutableAllowed:config.mutableAllowed,
  generatedMutablePrefix:config.generatedPrefix,generatedDerived:config.generatedDerived,sourceReleaseApproved:false,operatingChangesAuthorized:false,commitPermission:false,sourcePushPermission:false};
 change(guard);config.guardSha256=await put(config.guardPath,guard);return{root,config,put,guard,verifyArchive:async()=>archive,readHead:()=>config.head};
}
test('exact original L3 integration baseline stays protected',async t=>{const f=await fixture(t),r=await checkPreservation(f);assert.equal(r.protectedFilesVerified,2);assert.equal(r.intendedMutableInputs[0].changed,false);});
test('enumerated dispatcher may change without changing old native versions',async t=>{const f=await fixture(t);await f.put('src/core/dispatcher.ts','new dispatch');assert.equal((await checkPreservation(f)).intendedMutableInputs[0].changed,true);});
test('seven living status exceptions remain separate from mathematical inputs',async t=>{const f=await fixture(t);await f.put('docs/README.md','new status');assert.equal((await checkPreservation(f)).livingStatus[0].changed,true);assert.equal(preparationConfig.living.length,7);});
for(const path of['src/core/format16Runtime.ts','src/ui/ap23l3Messages.ts','scripts/check-ap23l3-new.mjs'])test('new declared L3 file allowed: '+path,async t=>{const f=await fixture(t);await f.put(path,'new local integration');assert.deepEqual((await checkPreservation(f)).newIntegrationFiles,[path]);});
for(const path of['src/core/other.ts','scripts/other.mjs','scripts/check-ap23k3-references.ts','spfx/src/core/schemas/foreign.json'])test('undeclared integration addition rejected: '+path,async t=>{const f=await fixture(t);await f.put(path,'unknown');await assert.rejects(checkPreservation(f),/Unapproved integration addition/);});
for(const mode of['change','remove'])test('old native version '+mode+' rejected',async t=>{const f=await fixture(t);if(mode==='change')await f.put('src/core/legacy.ts','changed');else await rm(join(f.root,'src/core/legacy.ts'));await assert.rejects(checkPreservation(f));});
test('mutable file cannot be deleted',async t=>{const f=await fixture(t);await rm(join(f.root,'src/core/dispatcher.ts'));await assert.rejects(checkPreservation(f),{code:'ENOENT'});});
test('user-owned document is immutable',async t=>{const f=await fixture(t);await f.put('private/user.docx','changed');await assert.rejects(checkPreservation(f),/Protected bytes changed/);});
test('guard cannot be rewritten after capture',async t=>{const f=await fixture(t);await f.put(f.config.guardPath,{...f.guard,head:'f'.repeat(40)});await assert.rejects(checkPreservation(f),/Protected bytes changed/);});
test('Git HEAD remains fixed without Git mutation',async t=>{const f=await fixture(t);await assert.rejects(checkPreservation({...f,readHead:()=> 'f'.repeat(40)}),/Git HEAD changed/);});
for(const[key,value]of[['verified',false],['mode','source-preflight-only'],['files',136],['receiptSha256','f'.repeat(64)]])test('autonomous L2 archive identity is mandatory: '+key,async t=>{const f=await fixture(t),archive=await f.verifyArchive();await assert.rejects(checkPreservation({...f,verifyArchive:async()=>({...archive,[key]:value})}));});
for(const kind of['old','new'])test('native '+kind+' symlink rejected',async t=>{const f=await fixture(t);await f.put('elsewhere.ts','old version');const path=kind==='old'?'src/core/legacy.ts':'src/core/format16Runtime.ts';if(kind==='old')await rm(join(f.root,path));await symlink('../../elsewhere.ts',join(f.root,path));await assert.rejects(checkPreservation(f),/Symlink/);});
for(const key of['capturedBeforeIntegration','capturedBeforeLivingUpdates','l2TechnicallyAccepted'])test('required start boundary '+key,async t=>{const f=await fixture(t,g=>{g[key]=false;});await assert.rejects(checkPreservation(f));});
for(const key of['sourceReleaseApproved','operatingChangesAuthorized','commitPermission','sourcePushPermission'])test('closed authority boundary '+key,async t=>{const f=await fixture(t,g=>{g[key]=true;});await assert.rejects(checkPreservation(f));});
for(const[key,value]of[['workPackage','AP23L2'],['acceptedBy','AI'],['userStatement','other'],['contractDecision',{id:'DEC-2026-041',status:'proposed',on:null}],
 ['previousGuard',{}],['previousProof',{}],['userDocument',{}],['allowedNew',{}],['mutableAllowed',['src/core/legacy.ts']],['generatedMutablePrefix','src/'],['generatedDerived',{other:{source:'other'}}]])test('exact guard metadata '+key,async t=>{const f=await fixture(t,g=>{g[key]=value;});await assert.rejects(checkPreservation(f));});
test('immutable and mutable sets cannot overlap',async t=>{const f=await fixture(t,g=>{g.mutableBefore['src/core/legacy.ts']=g.files['src/core/legacy.ts'];});f.config.mutableCount++;await assert.rejects(checkPreservation(f),/Both immutable and mutable/);});
test('living and mutable sets cannot overlap',async t=>{const f=await fixture(t,g=>{g.mutableBefore['docs/README.md']=g.livingAtStart['docs/README.md'];g.mutableAllowed.push('docs/README.md');});f.config.mutableCount++;await assert.rejects(checkPreservation(f),/Living input cannot be product mutable/);});
test('living exception inventory cannot expand',async t=>{const f=await fixture(t,g=>{g.livingAtStart.extra='e'.repeat(64);});await assert.rejects(checkPreservation(f));});
test('tree inventory cannot duplicate an old input',async t=>{const f=await fixture(t,g=>{g.treeFiles.src.push(g.treeFiles.src[0]);});await assert.rejects(checkPreservation(f));});
test('tree inventory cannot invent an unbound original',async t=>{const f=await fixture(t,g=>{g.treeFiles.src.push('src/unbound.ts');});await assert.rejects(checkPreservation(f),/Unbound original tree input/);});
test('new-file policy is restricted to V9, Format16 and L3 namespaces',()=>{
 for(const path of['src/core/administrativeTypesV9.ts','src/core/administrativeCatalogV9.ts','src/core/administrativeDeadlineV9.ts','src/core/format16Runtime.ts','src/core/releaseFormat16.ts',
  'src/release/ap23l3CandidateData.ts','src/ui/ap23l3Messages.ts','schemas/administrative-input-v9.schema.json','schemas/release-manifest-v16.schema.json',
  'data/candidates/2026-10-27-ap23l3/manifest.json','tests/core/ap23l3-native.test.ts','tests/data/test_ap23l3_contract.py','spfx/test/ap23l3-host.test.ts',
  'scripts/check-ap23l3-references.ts','spfx/src/product/core/format16Runtime.ts'])assert.equal(isAllowedNew(path),true,path);
 for(const path of['src/core/administrativeCatalogV8.ts','src/core/releaseFormat15.ts','src/core/unknown.ts','src/ui/styles.css','schemas/release-manifest-v15.schema.json',
  'data/releases/new/file.json','data/candidates/2026-10-27-ap23k3/other.json','tests/core/old.test.ts','scripts/build-public-app.mjs'])assert.equal(isAllowedNew(path),false,path);
 assert.equal(preparationConfig.mutableExisting.includes('src/ui/styles.css'),false);
});
test('read-only verification cannot update the start guard',async t=>{const f=await fixture(t),before=await readFile(join(f.root,f.config.guardPath));await checkPreservation(f);assert.deepEqual(await readFile(join(f.root,f.config.guardPath)),before);});
test('new generated product module must equal its approved native source',async t=>{const f=await fixture(t);await f.put('src/core/format16Runtime.ts','new format');await f.put('spfx/src/product/core/format16Runtime.ts','new format');assert.equal((await checkPreservation(f)).generatedProductCopiesVerified.length,1);await f.put('spfx/src/product/core/format16Runtime.ts','different');await assert.rejects(checkPreservation(f),/Generated product copy differs/);});
test('old-version generated additions must equal immutable native bytes',async t=>{const f=await fixture(t);await f.put('spfx/src/product/core/legacy.ts','old version');assert.equal((await checkPreservation(f)).generatedProductCopiesVerified.length,1);await f.put('spfx/src/product/core/legacy.ts','changed');await assert.rejects(checkPreservation(f),/Generated product copy differs/);});
test('foreign generated modules do not acquire native authority',async t=>{const f=await fixture(t);await f.put('src/core/other.ts','unknown');await f.put('spfx/src/product/core/other.ts','unknown');await assert.rejects(checkPreservation(f),/Unapproved integration addition/);});
test('all seven new generated schema copies must be exact',async t=>{const f=await fixture(t);assert.equal(GENERATED_SCHEMA_COPIES.length,7);for(const copy of GENERATED_SCHEMA_COPIES){await f.put(copy.source,'schema '+copy.source);await f.put(copy.path,'schema '+copy.source);}assert.equal((await checkPreservation(f)).generatedSchemaCopiesVerified.length,7);await f.put(GENERATED_SCHEMA_COPIES[0].path,'changed');await assert.rejects(checkPreservation(f),/Generated schema differs/);});
test('derived SCSS wrapper has no independent stylesheet editing authority',async t=>{const f=await fixture(t),path='spfx/src/product/ui/styles.module.scss',source='src/ui/styles.css',style=await f.put(source,'unchanged css'),derived={source,prefix:':global {\n',suffix:'\n}\n'};
 f.guard.files[source]=style;f.config.protectedCount++;f.guard.treeFiles.src.push(source);f.guard.treeFiles.src.sort();f.config.generatedDerived[path]=derived;
 f.guard.mutableBefore[path]=await f.put(path,derived.prefix+'unchanged css'+derived.suffix);f.config.mutableCount++;f.guard.treeFiles['spfx/src'].push(path);f.config.guardSha256=await f.put(f.config.guardPath,f.guard);
 assert.equal((await checkPreservation(f)).generatedProductCopiesVerified[0].derived,true);await f.put(path,derived.prefix+'changed css'+derived.suffix);await assert.rejects(checkPreservation(f),/Generated product copy differs/);
});
test('an existing L3 guard cannot be refreshed even by the preparation script',async t=>{const f=await fixture(t),before=await readFile(join(f.root,f.config.guardPath));let consulted=false;await assert.rejects(prepareProtection({root:f.root,config:{...preparationConfig,output:'proof'},verifyArchive:async()=>{consulted=true;throw Error('must not run');}}),/already frozen/);assert.equal(consulted,false);assert.deepEqual(await readFile(join(f.root,f.config.guardPath)),before);});
test('the actual integration guard has the fixed 9130/147 split and immutable stylesheet',async()=>{
 assert.equal(preservationConfig.protectedCount,9130);assert.equal(preservationConfig.mutableCount,147);assert.equal(preservationConfig.guardSha256,'365a023fed55f849a83d44ebd2c4899c0e436bb77abbe2a40d4c4bd5d2912375');
 assert.equal(preservationConfig.mutableAllowed.includes('src/ui/styles.css'),false);assert.equal(preservationConfig.previousGuard.protectedCount,9048);
});
