// SPDX-License-Identifier: AGPL-3.0-only
// Preserve accepted evidence before any AP23E3 product edits. No release promotion.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const target = 'outputs/ap23e2-abnahme-2026-10-18';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const proofPath = 'outputs/ap23e2-abnahmepruefung-2026-10-18/QA-AP23E2-ABNAHMEPRUEFUNG.json';
const proofBytes = await readFile(resolve(root, proofPath));
assert.equal(hash(proofBytes), '9872982c93adb19b839827d0bb93ef1220457f2dfdd18263c99da02bf488e566');
const proof = JSON.parse(proofBytes);
async function files(path) {
  const result=[];
  for (const e of await readdir(resolve(root,path),{withFileTypes:true})) {
    assert.equal(e.isSymbolicLink(),false);
    result.push(...(e.isDirectory()?await files(path+'/'+e.name):[path+'/'+e.name]));
  }
  return result.sort();
}
const paths=new Set([proofPath,proof.governance.decisionEvidence.path,proof.checker.path,
  'docs/architektur/technische-abnahmepruefung-ap23e2.md',...proof.preservedArtefacts.map(a=>a.path),
  ...proof.preservedSchemaBaselines.map(a=>a.path),
  ...await files('outputs/ap23e2-candidate-2026-10-18'),
  ...await files('schemas/candidates/ap23e2')]);
for (const tree of proof.preservedTrees) {
  const entries=await files(tree.path);
  const body=(await Promise.all(entries.map(async p=>p+'\0'+hash(await readFile(resolve(root,p)))+'\n'))).join('');
  assert.equal(entries.length,tree.files);assert.equal(hash(body),tree.sha256);
  entries.forEach(p=>paths.add(p));
}
for (const ref of [...proof.preservedArtefacts,proof.governance.decisionEvidence,proof.checker]) {
  const b=await readFile(resolve(root,ref.path));assert.equal(b.length,ref.byteLength);assert.equal(hash(b),ref.sha256);
}
const artifacts=[];
for (const path of [...paths].sort()) {
  const bytes=await readFile(resolve(root,path));
  const dest=resolve(root,target,path);await mkdir(dirname(dest),{recursive:true});
  try {assert.deepEqual(await readFile(dest),bytes,path);} catch(error) {
    if(error.code!=='ENOENT')throw error;
    await copyFile(resolve(root,path),dest);
  }
  assert.deepEqual(await readFile(dest),bytes,path);
  artifacts.push({path,byteLength:bytes.length,sha256:hash(bytes)});
}
const receipt={kind:'ap23e2-accepted-evidence',date:'2026-10-18',acceptedBy:'David Steimer',
  declaration:'AP23E2 ist technisch abgenommen. Bitte starte AP23E3.',
  scope:'Technical contract acceptance only, not a source release or deployment',
  standaloneTestEnvironment:false,proof:{path:proofPath,sha256:hash(proofBytes)},artifacts};
const encoded=JSON.stringify(receipt,null,2)+'\n';
await writeFile(resolve(root,target,'receipt.json'),encoded,{flag:'wx'});
console.log(JSON.stringify({status:'archived',target,artifacts:artifacts.length,receiptSha256:hash(encoded)}));
