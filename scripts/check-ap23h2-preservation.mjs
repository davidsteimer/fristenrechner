// SPDX-License-Identifier: AGPL-3.0-only
// Read-only preservation of the frozen pre-H2 baseline. Only new report may be written.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256,archiveAcceptance} from './archive-ap23h1-acceptance.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out='outputs/ap23h2-2026-10-22';
const read=p=>readFile(resolve(root,p));
const raw=await read(out+'/protected-inputs.json');
assert.equal(sha256(raw),'4149bd30afa1d71885d065ade999149633bf7ab9c81249a49dc3389fe45afdf7','Never refresh H2 baseline');
const guard=JSON.parse(raw),files=Object.entries(guard.files);
assert.equal(files.length,1754);
for(const[path,expected]of files)assert.equal(sha256(await read(path)),expected,'Protected H2 input changed '+path);
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
assert.equal(head,guard.head);
const archive=await archiveAcceptance({root});
assert.equal(archive.mode,'archive-reverified');
assert.equal(archive.receiptSha256,'66ecb1c71dea0fd2f2c46e708931a6984ce3ec23c56b1658aff8ba10fdf64318');
const living=[];
for(const[path,expected]of Object.entries(guard.livingAtStart)){
  const current=sha256(await read(path));living.push({path,atStart:expected,current,changed:expected!==current});
}
assert.equal(living.length,7);
const report={workPackage:'AP23H2',status:'protected-baselines-preserved',head,
  protectedInventorySha256:sha256(raw),protectedFilesVerified:files.length,acceptedH1Archive:archive,livingStatus:living,
  productCodeChanged:false,nativeSchemasChanged:false,acceptedLegalDataChanged:false,existingTestsChanged:false,
  historicalResearchReportsChanged:false,userModifiedDocxChanged:false,commitCreated:false,sourcePushPerformed:false,operatingChanges:false,
  note:'Native and historical files are preserved. New H2 candidate schemas and candidate data are separate and not a runtime activation.'};
assert.ok(process.argv.slice(2).every(a=>a==='--write'));
if(process.argv.includes('--write'))await writeFile(resolve(root,out,'preservation-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
