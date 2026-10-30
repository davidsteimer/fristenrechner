// SPDX-License-Identifier: AGPL-3.0-only
// Research preservation proof. Never updates the frozen input inventory.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {archiveAcceptance} from './archive-ap23g3-acceptance.mjs';
const out='outputs/ap23h1-2026-10-22';
const hash=b=>createHash('sha256').update(b).digest('hex');
const guardPath=out+'/protected-inputs.json',raw=await readFile(guardPath);
assert.equal(hash(raw),'e4edd554265322cb4bb782feaa0cbe32ce685eac7dde6f0bc5a788ba5a1f160e','Do not refresh the research baseline');
const guard=JSON.parse(raw);
assert.equal(Object.keys(guard.files).length,1614);
for(const[path,expected]of Object.entries(guard.files))assert.equal(hash(await readFile(path)),expected,'Protected bytes changed '+path);
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();assert.equal(head,guard.head);
const archive=await archiveAcceptance();assert.equal(archive.mode,'archive-reverified');
assert.equal(archive.receiptSha256,guard.acceptedG3Archive.receiptSha256);
const live=[];for(const[path,sha256]of Object.entries(guard.livingAtStart)){
  const now=hash(await readFile(path));live.push({path,atStart:sha256,current:now,changed:now!==sha256});
}
const report={workPackage:'AP23H1',status:'research-inputs-preserved',gitHead:head,
  protectedInputSha256:hash(raw),protectedFilesVerified:1614,acceptedG3Archive:archive,livingStatus:live,
  productCodeChanged:false,acceptedLegalDataChanged:false,schemasChanged:false,existingTestsChanged:false,
  originalPreparationChanged:false,commitCreated:false,sourcePushPerformed:false,operatingChanges:false,
  note:'The frozen original inventory is compared. Only separately listed living status texts may change.'};
assert.ok(process.argv.slice(2).every(x=>x==='--write'));
if(process.argv.includes('--write'))await writeFile(out+'/preservation-verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
