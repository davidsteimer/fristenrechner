// SPDX-License-Identifier: AGPL-3.0-only
// Preserve the actual pre-integration bytes without refreshing historical baselines.
import assert from 'node:assert/strict';
import {readFile,writeFile,lstat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256,archiveAcceptance} from './archive-ap23h2-acceptance.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const out='outputs/ap23h3-2026-10-22';
const expected={
  'protected-inputs.json':'e5fbe27879725db1e23dd9b7be4dc285b7d153aa9e686ed0ad1eb72a0c62cda6',
  'mutable-inputs.json':'bf1d62b69a7b32af6dc21aef9ce9607609caf6d1c8974c34997fe849dd347b8b',
  'additional-mutable-inputs.json':'69d40579218ae664ded8d1758c1fc916c8d973e052bde78a64000954eeef591a'
};
async function read(path){
  const stat=await lstat(resolve(root,path));
  assert.ok(stat.isFile()&&!stat.isSymbolicLink(),'Not a regular input: '+path);
  return readFile(resolve(root,path));
}
const input={};
for(const[name,hash]of Object.entries(expected)){
  const bytes=await read(out+'/'+name);
  assert.equal(sha256(bytes),hash,'Do not refresh the frozen H3 inventory: '+name);
  input[name]=JSON.parse(bytes);
}
const guard=input['protected-inputs.json'];
const mutable=input['mutable-inputs.json'];
const additional=input['additional-mutable-inputs.json'];
assert.equal(guard.capturedBeforeIntegration,true);
assert.equal(mutable.capturedBeforeIntegration,true);
assert.equal(Object.keys(guard.files).length,1812);
assert.equal(Object.keys(mutable.existingFiles).length,107);
assert.deepEqual(Object.keys(additional.files).sort(),[
  'src/core/administrativeContext.ts','src/core/modernRuntime.ts'
]);
assert.equal(additional.productOperatingChanges,false);
const additionalStatus=[];
for(const[path,before]of Object.entries(additional.files)){
  assert.equal(guard.files[path],before.beforeSha256,'Exception did not match original input: '+path);
  assert.equal(mutable.existingFiles[path],undefined,'Exception duplicated original mutable inventory');
  const bytes=await read(path);
  additionalStatus.push({path,before:before.beforeSha256,current:sha256(bytes),
    changed:before.beforeSha256!==sha256(bytes),boundary:before.changeBoundary});
}
let protectedFilesVerified=0;
for(const[path,hash]of Object.entries(guard.files)){
  if(Object.hasOwn(additional.files,path))continue;
  assert.equal(sha256(await read(path)),hash,'Protected H3 input changed: '+path);
  protectedFilesVerified++;
}
assert.equal(protectedFilesVerified,1810);
const mutableStatus=[];
for(const[path,before]of Object.entries(mutable.existingFiles)){
  assert.equal(guard.files[path],undefined,'Input is both protected and mutable: '+path);
  const current=sha256(await read(path));
  mutableStatus.push({path,before,current,changed:before!==current});
}
const livingStatus=[];
for(const[path,before]of Object.entries(mutable.livingAtStart)){
  const current=sha256(await read(path));
  livingStatus.push({path,before,current,changed:before!==current});
}
assert.equal(livingStatus.length,7);
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
assert.equal(head,guard.head);
assert.equal(head,mutable.head);
const archive=await archiveAcceptance({root});
assert.equal(archive.mode,'archive-reverified');
assert.equal(archive.receiptSha256,'bb856623f83847202b2a7e387fbe3a974234abe250d0c2b4180f4fd52b303494');
const report={workPackage:'AP23H3',status:'protected-baselines-preserved',head,
  inventorySha256:expected,originalProtectedBindings:1812,protectedFilesVerified,
  additionalMutableInputs:additionalStatus,acceptedH2Archive:archive,
  intendedMutableInputs:mutableStatus,livingStatus,
  oldReaderAndArithmeticBytesPreserved:true,acceptedLegalDataChanged:false,existingTestsChanged:false,
  historicalResearchReportsChanged:false,userModifiedDocxChanged:false,
  commitCreated:false,sourcePushPerformed:false,operatingChanges:false,
  note:'The original immutable inventory is unchanged. Exactly two pre-bound registry dispatch files were explicitly separated for native format 12. New H3 source and schemas are not historical inputs.'};
assert.ok(process.argv.slice(2).every(a=>a==='--write'));
if(process.argv.includes('--write'))await writeFile(resolve(root,out,'preservation-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
