// SPDX-License-Identifier: AGPL-3.0-only
// Compose the accepted D2 state with its later UX addendum, without rewriting either proof.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
const sha = b => createHash('sha256').update(b).digest('hex');
const target = 'outputs/ap23d2-abnahme-2026-10-15';
const proofs = [
  ['outputs/ap23d2-2026-10-15/QA-AP23D2.json','6e6a7650e0f24f0567cb3dd90d1e81c7958ebc15dbd7d01b582045bff60923f9'],
  ['outputs/ap23d2-ux-2026-10-15/QA-AP23D2-UX.json','1c4108a94300cd7289e180ebce2f12acbde641d5a488ca23dc6730a1296fa180']
];
const entries = new Map();
const superseded = [];
async function bytes(path) {
  try { return await readFile(resolve(target,path)); }
  catch(e) { if(e.code!=='ENOENT') throw e; return readFile(path); }
}
for(const [path,hash] of proofs) {
  const b=await bytes(path); assert.equal(sha(b),hash,path);
  const report=JSON.parse(b);
  for(const item of report.artifacts) {
    assert.ok(!item.path.startsWith('/') && !item.path.split('/').includes('..'));
    const prior=entries.get(item.path);
    if(prior && prior.sha256!==item.sha256) superseded.push({path:item.path,priorSha256:prior.sha256,acceptedSha256:item.sha256});
    entries.set(item.path,item);
  }
  entries.set(path,{path,sha256:hash,byteLength:b.length});
  for(const run of Object.values(report.runs)) {
    const log=await bytes(run.outputPath); assert.equal(sha(log),run.outputSha256,run.outputPath);
    entries.set(run.outputPath,{path:run.outputPath,sha256:run.outputSha256,byteLength:log.length});
  }
}
const verified=[];
for(const item of [...entries.values()].sort((a,b)=>a.path.localeCompare(b.path))) {
  const b=await bytes(item.path);
  assert.equal(sha(b),item.sha256,item.path); assert.equal(b.length,item.byteLength,item.path);
  verified.push({item,b});
}
for(const {item,b} of verified) {
  const path=resolve(target,item.path); await mkdir(dirname(path),{recursive:true});
  try { await writeFile(path,b,{flag:'wx'}); } catch(e) { if(e.code!=='EEXIST') throw e; }
  assert.equal(sha(await readFile(path)),item.sha256,path);
}
const receipt={kind:'acceptedAP23D2WithUxSnapshot',acceptedOn:'2026-10-15',acceptedBy:'David Steimer',
  userStatement:'AP23D2 inklusive UX-Nachtrag ist abgenommen. Bitte starte AP23D3.',
  sourceReleaseApproved:false,deployed:false,published:false,
  proofs:proofs.map(([path,sha256])=>({path,sha256})),
  composition:'D2 source set with exactly the byte-bound UX replacements. Earlier report remains historical, not rewritten.',
  superseded,artifacts:verified.map(({item})=>item)};
const payload=Buffer.from(JSON.stringify(receipt,null,2)+'\n'); const receiptPath=resolve(target,'receipt.json');
try { await writeFile(receiptPath,payload,{flag:'wx'}); } catch(e) { if(e.code!=='EEXIST') throw e; }
assert.equal(sha(await readFile(receiptPath)),sha(payload));
console.log(JSON.stringify({target,files:verified.length,verified:true,receiptSha256:sha(payload)},null,2));
