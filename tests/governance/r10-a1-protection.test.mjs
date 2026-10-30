// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic filesystem fixtures only. Never modify accepted evidence or product files.
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,writeFile,rm,symlink,lstat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {archiveConfig,receiptMetadata,archiveAcceptance,safe,exact,hash,walk} from '../../scripts/archive-r10-u1-acceptance.mjs';
import {preparationConfig,allowedNew} from '../../scripts/prepare-r10-a1.mjs';
import {preservationConfig,validateGuard,checkPreservation} from '../../scripts/check-r10-a1-preservation.mjs';

function proofFixture(){return {workPackage:'R10-U1',status:'local-follow-up-verified-awaiting-human-acceptance',head:archiveConfig.head,
 humanAcceptance:false,bindings:Array.from({length:787},(_,n)=>({path:'fixture/'+n+'.txt',byteLength:0,sha256:hash(Buffer.alloc(0))})),
 sourceReleaseApproved:false,dataPromoted:false,commitCreated:false,sourcePushPerformed:false,installationPerformed:false,operatingChanges:false,realM365Validation:false,
 scope:['R10-H01','T06-H01','B11-H01'],localCorrectionVerified:{'R10-H01':true,'T06-H01':true,'B11-H01':true},
 qaCounts:{'product-regression':4006,'host-lifecycle':90,'actual-web-bundle':11,governance:117},hostCounts:{source:293,historicalPackage:170,actualPackage:36}};}
const proofDescriptor={path:archiveConfig.proof,byteLength:156976,sha256:archiveConfig.sha256};
async function directory(t,prefix='r10-a1-protection-'){
 const root=await mkdtemp(join(tmpdir(),prefix));t.after(()=>rm(root,{recursive:true,force:true}));return root;
}
async function fixture(t){
 const root=await directory(t),head='a'.repeat(40),receiptSha256='c'.repeat(64);
 const file=async(path,value)=>{const bytes=Buffer.isBuffer(value)?value:Buffer.from(typeof value==='string'?value:JSON.stringify(value));await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),bytes);return {path,byteLength:bytes.length,sha256:hash(bytes)};};
 const originals=['src/core/frozen.ts','schemas/frozen.json','data/releases/old/manifest.json','spfx/src/core/frozen.ts',
  'tests/ui/old.test.ts','docs/frozen.md','outputs/historical/report.json','outputs/r10-u1-abnahme-2026-10-28/payload.txt'];
 const files=[];for(const path of originals)files.push(await file(path,'immutable '+path));
 const livingAtStart=[];for(const path of preparationConfig.living)livingAtStart.push(await file(path,'old living '+path));
 const treeFiles={};for(const dir of preparationConfig.trees){await mkdir(join(root,dir),{recursive:true});treeFiles[dir]=await walk(root,dir);}
 const archive={status:'archive-reverified',receiptSha256,humanAcceptance:true,r10A1Authorized:true,sourceReleaseApproved:false,operatingChanges:false};
 const guard={workPackage:'R10-A1',createdOn:'2026-10-28',head,capturedBeforeA1OutputsAndLivingChanges:true,
  userStatement:archiveConfig.statement,u1HumanAcceptance:true,r10A1Authorized:true,r10A1HumanAcceptance:false,r10A2Authorized:false,
  sourceReleaseApproved:false,dataPromoted:false,definitiveBuild:false,commitCreated:false,sourcePushPerformed:false,installationPerformed:false,operatingChanges:false,
  scope:preparationConfig.scope,acceptedU1:archive,trees:preparationConfig.trees,allowedNew:preparationConfig.allowedNew,treeFiles,files,livingAtStart};
 const saved=await file(preservationConfig.guard,guard),config={...preservationConfig,head,guardSha256:saved.sha256,protectedCount:files.length,receiptSha256};
 const verifyArchive=async()=>structuredClone(archive),readHead=()=>head;
 const check=options=>checkPreservation({root,config,verifyArchive,readHead,...options});
 const mutateGuard=async edit=>{const changed=structuredClone(guard);edit(changed);const row=await file(config.guard,changed);return {guard:changed,config:{...config,guardSha256:row.sha256}};};
 return {root,file,guard,config,archive,verifyArchive,readHead,check,mutateGuard,originals};
}

test('A1 production contract freezes all product inputs with exactly eight separate living files',()=>{
 assert.equal(preservationConfig.protectedCount,15367);assert.equal(preservationConfig.livingCount,8);assert.equal(preparationConfig.living.length,8);
 assert.deepEqual(preservationConfig.living,preparationConfig.living);assert.ok(preparationConfig.trees.includes('src'));assert.ok(preparationConfig.trees.includes('data/source-reviews'));
 assert.equal(Object.hasOwn(preparationConfig,'mutableExisting'),false);assert.equal(preparationConfig.head,archiveConfig.head);
 assert.equal(archiveConfig.bindingCount,787);assert.equal(archiveConfig.statement,'Ja, R10-U1 abgenommen und R10-A1 starten');
});
test('U1 human receipt keeps the original pre-acceptance proof and authorises only A1 planning',()=>{
 const p=proofFixture(),before=JSON.stringify(p),receipt=receiptMetadata(p,proofDescriptor);assert.equal(JSON.stringify(p),before);
 assert.equal(receipt.humanAcceptance,true);assert.equal(receipt.r10A1Authorized,true);assert.equal(receipt.r10A1Accepted,false);assert.equal(receipt.r10A2Authorized,false);
 assert.equal(receipt.originalPreAcceptanceProofUnchanged,true);assert.equal(receipt.originalBindingCount,787);assert.deepEqual(receipt.proof,proofDescriptor);
 assert.equal(receipt.documentedLintWarnings,136);assert.match(receipt.actualHostFollowupPending,/100 and 300 percent/);
 for(const key of ['sourceReleaseApproved','dataPromoted','commitPermission','sourcePushPermission','installationPermission','operatingPermission'])assert.equal(receipt[key],false,key);
});
for(const key of ['sourceReleaseApproved','dataPromoted','commitCreated','sourcePushPerformed','installationPerformed','operatingChanges','realM365Validation','humanAcceptance'])
 test('original U1 proof cannot already raise '+key,()=>{const p=proofFixture();p[key]=true;assert.throws(()=>receiptMetadata(p,proofDescriptor));});
for(const [label,change]of[
 ['work package',p=>{p.workPackage='R10-A1';}],['pending status',p=>{p.status='released';}],['HEAD',p=>{p.head='b'.repeat(40);}],
 ['binding inventory',p=>{p.bindings.pop();}],['three corrections',p=>{p.scope.push('new rule');}],['verified correction',p=>{p.localCorrectionVerified['R10-H01']=false;}]
])test('receipt rejects changed U1 '+label,()=>{const p=proofFixture();change(p);assert.throws(()=>receiptMetadata(p,proofDescriptor));});
for(const path of ['../x','/x','a//b','a/./b','a/../b','C:/x','a\\b','a\nb','a\rb','a\0b','a\tb',''])
 test('closed relative path rejects '+JSON.stringify(path),()=>{assert.throws(()=>safe(path));assert.throws(()=>allowedNew(path));});
test('closed relative path accepts nested normal project paths',()=>{assert.equal(safe('docs/fachrecht/quellenpruefplan-r10-a2.md'),'docs/fachrecht/quellenpruefplan-r10-a2.md');});
for(const path of ['scripts/check-r10-a1-probe.mjs','scripts/inventory-r10-a1-sources.mjs','tests/governance/r10-a1-extra.test.mjs',
 'docs/betrieb/bestandsbericht-r10-a1.md','docs/fachrecht/quellenpruefplan-r10-a2.md','docs/ux/abnahme-r10-u1.md'])
 test('only scoped new A1 path is allowed '+path,()=>assert.equal(allowedNew(path),true));
for(const path of ['src/ui/new.tsx','src/core/r10-a1.ts','schemas/r10-a1.schema.json','data/releases/new/manifest.json','data/source-reviews/new.json',
 'tests/ui/r10-a1.test.tsx','docs/ux/r10-a1-extra.md','docs/betrieb/unknown.md','scripts/unrelated.mjs'])
 test('new product or out-of-scope path is not allowed '+path,()=>assert.equal(allowedNew(path),false));
test('clean synthetic A1 guard validates and reads without workflow changes',async t=>{const f=await fixture(t);assert.equal(validateGuard(f.guard,f.config),true);const result=await f.check();
 assert.equal(result.status,'a1-baseline-preserved');assert.equal(result.protectedFilesVerified,8);assert.equal(result.livingStatus.length,8);assert.deepEqual(result.newFiles,[]);
 for(const key of ['productChanged','legalDataChanged','schemasChanged','packageChanged','historicalEvidenceChanged','sourceReleaseApproved','dataPromoted','definitiveBuild','commitCreated','sourcePushPerformed','installationPerformed','operatingChanges'])assert.equal(result[key],false,key);
});
test('guard itself cannot be replaced without matching its frozen bytes',async t=>{const f=await fixture(t);await f.file(f.config.guard,{});await assert.rejects(f.check());});
for(const path of ['src/core/frozen.ts','schemas/frozen.json','data/releases/old/manifest.json','spfx/src/core/frozen.ts','tests/ui/old.test.ts','docs/frozen.md','outputs/historical/report.json'])
 test('protected '+path+' cannot change',async t=>{const f=await fixture(t);await f.file(path,'changed');await assert.rejects(f.check());});
test('protected payload cannot disappear',async t=>{const f=await fixture(t);await rm(join(f.root,f.originals[0]));await assert.rejects(f.check(),{code:'ENOENT'});});
test('a protected source cannot be replaced by a symlink even to identical bytes',async t=>{const f=await fixture(t),path=f.originals[0];await f.file('same.txt',await readFile(join(f.root,path)));await rm(join(f.root,path));await symlink('../../same.txt',join(f.root,path));await assert.rejects(f.check());});
test('A1 rejects a symlinked accepted U1 archive target before the autonomous archive check',async t=>{
 const f=await fixture(t),base='outputs/r10-u1-abnahme-2026-10-28';await mkdir(join(f.root,'other-archive'));await writeFile(join(f.root,'other-archive/payload.txt'),await readFile(join(f.root,base,'payload.txt')));
 await rm(join(f.root,base),{recursive:true});await symlink('../other-archive',join(f.root,base));let called=false;
 await assert.rejects(f.check({verifyArchive:async()=>{called=true;return f.archive;}}));assert.equal(called,false);
});
test('all eight permitted living files may change without changing the frozen original hashes',async t=>{const f=await fixture(t),before=JSON.stringify(f.guard.livingAtStart);for(const path of preparationConfig.living)await f.file(path,'current planning '+path);const r=await f.check();assert.equal(r.livingStatus.filter(v=>v.changed).length,8);assert.equal(JSON.stringify(f.guard.livingAtStart),before);});
test('a living file must remain present',async t=>{const f=await fixture(t);await rm(join(f.root,preparationConfig.living[0]));await assert.rejects(f.check(),{code:'ENOENT'});});
test('new scoped A1 helper is reported but not treated as an old immutable input',async t=>{const f=await fixture(t),path='scripts/inventory-r10-a1-test.mjs';await f.file(path,'new helper');assert.deepEqual((await f.check()).newFiles,[path]);});
test('new source review event is rejected, even when it is only a JSON file',async t=>{const f=await fixture(t);await f.file('data/source-reviews/new.json','{}');await assert.rejects(f.check(),/Unapproved new A1 file/);});
test('new product code is rejected',async t=>{const f=await fixture(t);await f.file('src/ui/r10-a1-extra.tsx','new UI');await assert.rejects(f.check(),/Unapproved new A1 file/);});
test('new unrelated documentation is rejected',async t=>{const f=await fixture(t);await f.file('docs/unknown.md','new unrelated doc');await assert.rejects(f.check(),/Unapproved new A1 file/);});
test('HEAD cannot advance during A1',async t=>{const f=await fixture(t);await assert.rejects(f.check({readHead:()=> 'b'.repeat(40)}),/Git HEAD changed/);});
test('accepted U1 archive must be reverified, not newly recreated',async t=>{const f=await fixture(t);await assert.rejects(f.check({verifyArchive:async()=>({...f.archive,status:'archive-created'})}));});
test('accepted U1 archive receipt hash cannot change',async t=>{const f=await fixture(t);await assert.rejects(f.check({verifyArchive:async()=>({...f.archive,receiptSha256:'0'.repeat(64)})}));});
for(const key of ['r10A1HumanAcceptance','r10A2Authorized','sourceReleaseApproved','dataPromoted','definitiveBuild','commitCreated','sourcePushPerformed','installationPerformed','operatingChanges'])
 test('A1 guard cannot grant '+key,async t=>{const f=await fixture(t),changed=await f.mutateGuard(g=>{g[key]=true;});await assert.rejects(f.check({config:changed.config}));});
for(const [label,change]of[
 ['U1 acceptance',g=>{g.u1HumanAcceptance=false;}],['A1 start',g=>{g.r10A1Authorized=false;}],['human statement',g=>{g.userStatement='release everything';}],
 ['scope text',g=>{g.scope='new rules permitted';}],['new-file whitelist',g=>{g.allowedNew.push('.*');}],['tree scope',g=>{g.trees.pop();}],
 ['living scope',g=>{g.livingAtStart.pop();}],['duplicate protected row',g=>{g.files[1]=g.files[0];}],['protected/living overlap',g=>{g.files[0]=g.livingAtStart[0];}],
 ['invalid byte length',g=>{g.files[0].byteLength=-1;}],['invalid hash',g=>{g.files[0].sha256='invalid';}],['extra descriptor data',g=>{g.files[0].mutable=true;}],
 ['archive operating permission',g=>{g.acceptedU1.operatingChanges=true;}],['archive source approval',g=>{g.acceptedU1.sourceReleaseApproved=true;}]
])test('semantic guard mutation rejected: '+label,async t=>{const f=await fixture(t),changed=await f.mutateGuard(change);await assert.rejects(f.check({config:changed.config}));});
test('every previous tree entry must be explicitly protected',async t=>{const f=await fixture(t),changed=await f.mutateGuard(g=>{g.files=g.files.filter(r=>r.path!=='src/core/frozen.ts');});changed.config.protectedCount--;await assert.rejects(f.check({config:changed.config}),/Unbound original file/);});
test('exact reader verifies both size and hash',async t=>{const f=await fixture(t),path=f.originals[0],bytes=await readFile(join(f.root,path));assert.deepEqual(await exact(f.root,path,{sha256:hash(bytes),byteLength:bytes.length}),bytes);await assert.rejects(exact(f.root,path,{sha256:hash(bytes),byteLength:bytes.length+1}));await assert.rejects(exact(f.root,path,{sha256:'0'.repeat(64),byteLength:bytes.length}));});
test('walk handles an empty ordinary directory without inventing files',async t=>{const root=await directory(t);assert.deepEqual(await walk(root,''),[]);});
test('walk rejects nested symlinks instead of following their targets',async t=>{const root=await directory(t);await mkdir(join(root,'actual'));await symlink('actual',join(root,'alias'));await assert.rejects(walk(root,''));});
test('autonomous archive preflight rejects an empty root without creating its target',async t=>{const root=await directory(t);await assert.rejects(archiveAcceptance({root}));await assert.rejects(lstat(join(root,archiveConfig.target)),{code:'ENOENT'});});
test('autonomous archive rejects an incomplete existing archive before reading proof',async t=>{const root=await directory(t);await mkdir(join(root,archiveConfig.target),{recursive:true});await assert.rejects(archiveAcceptance({root}),/Incomplete archive/);});
test('autonomous archive cannot relabel an unbound synthetic proof as the real U1 proof',async t=>{const root=await directory(t);await mkdir(dirname(join(root,archiveConfig.proof)),{recursive:true});await writeFile(join(root,archiveConfig.proof),JSON.stringify(proofFixture()));await assert.rejects(archiveAcceptance({root}));await assert.rejects(lstat(join(root,archiveConfig.target)),{code:'ENOENT'});});
