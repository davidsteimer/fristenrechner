// SPDX-License-Identifier: AGPL-3.0-only
// Private execution evidence. Not part of archive-free standard product tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {root,prefix,releaseId,hash,readRegular,requireR10BApproval,verifyExecutionPreservation} from '../../scripts/record-r10b-execution-approval.mjs';
const json=async path=>JSON.parse(await readRegular(root,path));
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();

test('actual R10-B authority grants local execution only, no operational side effects',async()=>{
  const {record}=await requireR10BApproval();
  assert.equal(record.status,'approved-local-execution-only');
  assert.equal(record.permissions.localRuntimeDataCommitAuthorized,true);
  assert.equal(record.permissions.localRecoveryBuildAuthorized,true);
  for(const key of ['installationAuthorized','uploadAuthorized','additionalCommitsAuthorized','publicationAuthorized','recoveryExecutionAuthorized','operatingApproval','outlookImportsAuthorized','m365PermissionChangesAuthorized','hostingChangesAuthorized'])assert.equal(record.permissions[key],false,key);
});
test('exact local data commit contains only the 45 approved runtime paths',async()=>{
  const {record}=await requireR10BApproval(),pin=await json(prefix+'/local-data-pin.json');
  assert.equal(pin.commit,'01bbd96a296b0fc4d64cd554acc8cb122c3017a3');
  assert.equal(git(['rev-parse','HEAD']),pin.commit);
  assert.equal(git(['rev-parse',pin.commit+'^']),record.singleLocalDataCommit.head);
  assert.deepEqual(git(['diff-tree','--no-commit-id','--name-only','-r',pin.commit]).split('\n').sort(),record.singleLocalDataCommit.paths.slice().sort());
  assert.equal(record.singleLocalDataCommit.paths.length,45);
  assert.equal(pin.localOnly,true);assert.equal(pin.publicationVerified,false);
  for(const path of record.singleLocalDataCommit.paths){assert.ok(path.startsWith('data/releases/'+releaseId+'/'));assert.equal(hash(execFileSync('git',['cat-file','blob',pin.commit+':'+path],{cwd:root,maxBuffer:16*1024*1024})),hash(await readRegular(root,path)));}
  assert.equal(git(['diff','--cached','--name-only']),'');
});
test('actual runtime manifest and current sources retain bounded approval provenance',async()=>{
  const manifest=await json('data/releases/'+releaseId+'/manifest.json');
  assert.equal(manifest.formatVersion,'17.0.0');assert.equal(manifest.releaseStatus,'approved');
  assert.equal(manifest.artifacts.length,44);
  assert.equal(hash(await readRegular(root,'data/releases/'+releaseId+'/manifest.json')),'7562597cee45ad1e4995989f7f31b2e8d0619baaf1f9618355ca870c8426a016');
  const a2=await json('outputs/r10-a2-abnahme-2026-10-28/receipt.json');
  assert.equal(a2.humanAcceptance,true);
});
test('all non-authorized original bytes and before-input snapshots remain intact',async()=>{
  const proof=await verifyExecutionPreservation();
  assert.equal(proof.status,'passed');assert.equal(proof.indexEmpty,true);
  assert.equal(proof.protectedFilesVerified,21505);assert.equal(proof.mutableInputSnapshotsVerified,244);
});
