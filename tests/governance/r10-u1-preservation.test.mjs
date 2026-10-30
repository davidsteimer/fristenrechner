// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,writeFile,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {preparationConfig,prepareProtection,sha256,isAllowedNew,exact} from '../../scripts/prepare-r10-u1.mjs';
import {preservationConfig,checkPreservation} from '../../scripts/check-r10-u1-preservation.mjs';
const fakeArchive={verified:true,mode:'archive-reverified',files:3,receiptSha256:'',professionalTechnicalAcceptance:true};
async function fixture(t){
 const root=await mkdtemp(join(tmpdir(),'r10-u1-protection-'));t.after(()=>rm(root,{recursive:true,force:true}));
 async function file(path,value){const bytes=Buffer.isBuffer(value)?value:Buffer.from(typeof value==='string'?value:JSON.stringify(value));await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),bytes);return{path,byteLength:bytes.length,sha256:sha256(bytes)};}
 const head='a'.repeat(40),originals=['src/core/frozen.ts','schemas/frozen.json','data/releases/old/frozen.json','tests/ui/old.test.ts',
  'src/ui/styles.css','spfx/src/webparts/fristenrechner/components/Fristenrechner.tsx','docs/frozen.md'];
 const protectedRows=[];for(const path of originals)protectedRows.push(await file(path,'immutable '+path));
 const mutableRows=[];for(const path of preparationConfig.mutableExisting)mutableRows.push(await file(path,'mutable '+path));
 for(const copy of preparationConfig.generatedCopies)await file(copy.path,await readFile(join(root,copy.source)));
 for(const path of preparationConfig.living)await file(path,'living '+path);
 for(const path of preparationConfig.trees)await mkdir(join(root,path),{recursive:true});
 const previous=await file(preparationConfig.previousGuard,{workPackage:'AP23M3',head,files:Object.fromEntries(protectedRows.map(row=>[row.path,row.sha256])),
  mutableBefore:Object.fromEntries(mutableRows.map(row=>[row.path,row.sha256]))});
 const proof=await file(preparationConfig.proof,{workPackage:'AP23M3',status:'local-scoped-verification-passed-with-release-blocker',releaseReadiness:{ready:false},
  bindings:[protectedRows[0],{...mutableRows[0]}]});
 const artifacts=[...JSON.parse(await readFile(join(root,proof.path))).bindings,proof];
 for(const item of artifacts)await file(preparationConfig.archive+'/'+item.path,await readFile(join(root,item.path)));
 const receipt=await file(preparationConfig.archive+'/receipt.json',{professionalTechnicalAcceptance:true,acceptedCantons:26,operationalCantons:6,localOnlyAcceptedCantons:20,remainingCantons:[],
  postAcceptanceFinding:{humanAcceptanceOfFinding:false,fixAuthorized:false},sourceReleaseApproved:false,deployable:false,deployed:false,sourcePublished:false,additionalRiskDecision:false,artifacts});
 for(const path of['outputs/ap23m3-2026-10-28/spfx-build.json','outputs/ap23m3-2026-10-28/web-build.json'])await file(path,{protectedBefore:[protectedRows[0]]});
 const archive={...fakeArchive,receiptSha256:receipt.sha256};
 const config={...preparationConfig,output:'outputs/fixture-r10-u1',head,archiveFiles:artifacts.length,receiptSha256:receipt.sha256,
  proofSha256:proof.sha256,proofBindings:2,previousGuardSha256:previous.sha256,previousProtectedCount:protectedRows.length,additionalProtected:[]};
 const verifyArchive=async()=>archive,readHead=()=>head;
 const frozen=await prepareProtection({root,config,verifyArchive,readHead}),raw=await readFile(join(root,frozen.guardPath)),guard=JSON.parse(raw);
 const checkConfig={...preservationConfig,guardPath:frozen.guardPath,guardSha256:sha256(raw),protectedCount:Object.keys(guard.files).length,head,
  archiveFiles:artifacts.length,archiveSha256:receipt.sha256,previousGuard:guard.previousGuard,previousProof:guard.previousProof};
 async function mutateGuard(edit){const value=JSON.parse(await readFile(join(root,frozen.guardPath)));edit(value);const row=await file(frozen.guardPath,value);return{...checkConfig,guardSha256:row.sha256};}
 const check=extra=>checkPreservation({root,config:checkConfig,verifyArchive,readHead,...extra});
 return{root,file,config,checkConfig,verifyArchive,readHead,frozen,guard,check,mutateGuard,originals,archive};
}
test('production scope is exactly four product files, three byte copies and two build helpers',()=>{
 assert.equal(preparationConfig.mutableExisting.length,9);assert.deepEqual(preservationConfig.mutableAllowed,preparationConfig.mutableExisting);
 assert.equal(preparationConfig.generatedCopies.length,3);assert.equal(preparationConfig.living.length,8);
 for(const path of['src/ui/styles.css','src/core/administrativeDeadlineV10.ts','spfx/src/webparts/fristenrechner/components/Fristenrechner.tsx'])assert.equal(preparationConfig.mutableExisting.includes(path),false);
 assert.deepEqual(preparationConfig.allowedNew.files,['src/public-app/r10-u1-main.tsx']);assert.equal(preparationConfig.localPublicEntry.referenceOnly,true);
 assert.equal(preservationConfig.guardSha256,'a050db42c1357b330569adc690dabfaec15b98af85a116bb90084444b8a9c65c');
});
test('one-time preparation and fresh check preserve the closed snapshot',async t=>{const f=await fixture(t),r=await f.check();assert.equal(r.status,'narrow-follow-up-baseline-preserved');assert.equal(r.intendedMutableInputs.length,9);assert.equal(r.generatedUiCopiesVerified.length,3);assert.equal(r.livingStatus.length,8);assert.equal(r.sourceReleaseApproved,false);});
test('prepared baseline cannot be refreshed or replaced',async t=>{const f=await fixture(t);await assert.rejects(prepareProtection({root:f.root,config:f.config,verifyArchive:()=>{throw Error('Must not revisit archive');},readHead:f.readHead}),/already frozen/);});
test('guard byte tampering rejected before semantic use',async t=>{const f=await fixture(t);await f.file(f.frozen.guardPath,{});await assert.rejects(f.check(),/SHA-256 mismatch/);});
for(const path of['src/core/frozen.ts','schemas/frozen.json','data/releases/old/frozen.json','tests/ui/old.test.ts','src/ui/styles.css',
 'spfx/src/webparts/fristenrechner/components/Fristenrechner.tsx','docs/frozen.md'])
 test('immutable '+path+' rejects change',async t=>{const f=await fixture(t);await f.file(path,'changed');await assert.rejects(f.check(),/SHA-256 mismatch/);});
test('historical protected input cannot disappear',async t=>{const f=await fixture(t);await rm(join(f.root,f.originals[0]));await assert.rejects(f.check(),{code:'ENOENT'});});
test('symlink cannot replace a protected source',async t=>{const f=await fixture(t);await f.file('other.ts','same');await rm(join(f.root,f.originals[0]));await symlink('../../other.ts',join(f.root,f.originals[0]));await assert.rejects(f.check(),/Symlink/);});
test('own native UI and exact generated copies may change together',async t=>{const f=await fixture(t),copy=preparationConfig.generatedCopies[0];await f.file(copy.source,'corrected UI');await f.file(copy.path,'corrected UI');const r=await f.check();assert.equal(r.intendedMutableInputs.filter(row=>row.changed).length,2);});
test('native UI cannot diverge from generated copy',async t=>{const f=await fixture(t);await f.file(preparationConfig.generatedCopies[0].source,'corrected source only');await assert.rejects(f.check(),/Generated UI differs/);});
test('generated copy cannot diverge from native UI',async t=>{const f=await fixture(t);await f.file(preparationConfig.generatedCopies[0].path,'modified generated code');await assert.rejects(f.check(),/Generated UI differs/);});
test('precisely declared SPFx row stylesheet may change',async t=>{const f=await fixture(t);await f.file('spfx/src/webparts/fristenrechner/components/Fristenrechner.module.scss','specific source row layout');assert.equal((await f.check()).intendedMutableInputs.find(row=>row.path.endsWith('.module.scss')).changed,true);});
for(const path of['package.json','scripts/build-public-app.mjs'])test('technical build helper '+path+' may change',async t=>{const f=await fixture(t);await f.file(path,'narrow local build helper');assert.equal((await f.check()).intendedMutableInputs.find(row=>row.path===path).changed,true);});
test('each living input is retained separately and may be updated',async t=>{const f=await fixture(t);for(const path of preparationConfig.living)await f.file(path,'new local status');assert.equal((await f.check()).livingStatus.filter(row=>row.changed).length,8);});
for(const path of['scripts/check-r10-u1-new.mjs','scripts/build-r10-u1-public.mjs','tests/ui/r10-u1-social.test.tsx','tests/governance/r10-u1-extra.test.mjs',
 'tests/hosts/r10-u1-host.test.ts','tests/public-app/r10-u1-build.test.ts','spfx/test/r10-u1-source.test.ts','spfx/test-build/r10-u1-package.test.cjs','src/public-app/r10-u1-main.tsx'])
 test('new scoped path allowed '+path,async t=>{assert.equal(isAllowedNew(path),true);const f=await fixture(t);await f.file(path,'new local test helper');assert.ok((await f.check()).newFollowUpFiles.includes(path));});
for(const path of['src/ui/r10-u1-extra.ts','src/core/r10-u1-extra.ts','src/public-app/r10-u1-other.tsx','schemas/r10-u1.schema.json','data/candidates/new/manifest.json',
 'spfx/src/core/r10-u1.ts','tests/ui/unapproved.test.tsx','scripts/build-unapproved.mjs'])
 test('new out-of-scope path rejected '+path,async t=>{assert.equal(isAllowedNew(path),false);const f=await fixture(t);await f.file(path,'unapproved');await assert.rejects(f.check(),/Unapproved new follow-up file/);});
for(const key of['sourceReleaseApproved','operatingChangesAuthorized','commitPermission','sourcePushPermission','coreRulesChanged','dataPromotionAuthorized','contractVersionChangeAuthorized'])
 test('guard cannot raise '+key,async t=>{const f=await fixture(t),config=await f.mutateGuard(g=>{g[key]=true;});await assert.rejects(f.check({config}),/Follow-up boundary/);});
for(const [label,edit]of[
 ['mutable scope',g=>{g.mutableAllowed.push('src/core/new.ts');}],
 ['generated copy scope',g=>{g.generatedCopies.push({path:'extra.ts',source:'src/core/frozen.ts'});}],
 ['new src entry scope',g=>{g.allowedNew.files.push('src/ui/new.ts');}],
 ['current proof binding',g=>{g.previousProof.sha256='0'.repeat(64);}],
 ['human statement',g=>{g.userStatement='Publish everything';}],
 ['immutable/mutable overlap',g=>{g.files['package.json']=g.mutableBefore['package.json'];}],
 ['root scope text',g=>{g.scope='Anything is allowed';}]
 ])test('semantic guard mutation rejected: '+label,async t=>{const f=await fixture(t),config=await f.mutateGuard(edit);await assert.rejects(f.check({config}));});
test('HEAD change rejected',async t=>{const f=await fixture(t);await assert.rejects(f.check({readHead:()=> 'b'.repeat(40)}),/Git HEAD changed/);});
test('wrong M3 archive receipt rejected',async t=>{const f=await fixture(t);await assert.rejects(f.check({verifyArchive:async()=>({...f.archive,receiptSha256:'0'.repeat(64)})}));});
test('M3 archive must be autonomously reverified, not newly recreated',async t=>{const f=await fixture(t);await assert.rejects(f.check({verifyArchive:async()=>({...f.archive,mode:'archive-created'})}));});
test('all pre-existing tree entries remain bound',async t=>{const f=await fixture(t),config=await f.mutateGuard(g=>{delete g.files['src/core/frozen.ts'];});config.protectedCount--;await assert.rejects(f.check({config}),/Unbound original input/);});
test('unsafe new paths never pass scope matching',()=>{for(const path of['../x','/x','a//b','a\\b','a/../b','C:/x',''])assert.throws(()=>isAllowedNew(path));});
test('exact reader checks byte lengths as well as hashes',async t=>{const f=await fixture(t),path=f.originals[0],bytes=await readFile(join(f.root,path));await assert.rejects(exact(f.root,path,sha256(bytes),bytes.length+1),/Byte length mismatch/);});

