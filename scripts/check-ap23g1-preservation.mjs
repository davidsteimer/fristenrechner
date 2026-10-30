// SPDX-License-Identifier: AGPL-3.0-only
// Read-only comparison of accepted baselines. Writes a separate research audit only.
import assert from 'node:assert/strict';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const out = 'outputs/ap23g1-2026-10-22';
const sha = b => createHash('sha256').update(b).digest('hex');
const bytes = p => readFile(resolve(root, p));
const json = async p => JSON.parse(await bytes(p));
const bound = async (p, expected) => {
  const b = await bytes(p);
  assert.equal(sha(b), expected, `Protected bytes changed: ${p}`);
  return { path: p, byteLength: b.length, sha256: expected };
};
const completion = await json('outputs/ap23f3-2026-10-22/local-completion.json');
await bound('outputs/ap23f3-2026-10-22/local-completion.json', 'bbf8d3ac815b30224563f98c552e1ac9006e4c58e7b12e5370b0211b65a1541f');
const accepted = [...completion.sourceBindings, ...completion.evidence, completion.candidateManifest];
for (const row of accepted) await bound(row.path, row.sha256);
const historical = await json('outputs/ap23f3-2026-10-22/protected-inputs.json');
for (const [p, h] of Object.entries(historical.files)) await bound(p, h);
const f1 = await json('outputs/ap23f3-2026-10-22/additional-protected-inputs.json');
// Additional F1 bindings are also held by the immutable acceptance receipt below.
for (const [p, h] of Object.entries(f1)) await bound(p, h);
const receiptPath = 'outputs/ap23f3-abnahme-2026-10-22/receipt.json';
await bound(receiptPath, '518a76b33fb0666a36ada847d58ba50b8495daf921a4b10a4cabbc7ba4b8ddd6');
const receipt = await json(receiptPath);
for (const a of receipt.artifacts) {
  await bound(`outputs/ap23f3-abnahme-2026-10-22/${a.path}`, a.sha256);
}
await bound('docs/planung/ap23g1-vorbereitung-ur-so-sh.md', '75db7d1870be5240e96dbf22f14c80fcd6d3a52885a8d452c3e67fd72250fe51');
async function walk(p) {
  const r = [];
  for (const e of await readdir(resolve(root, p), { withFileTypes: true })) {
    const q = `${p}/${e.name}`;
    r.push(...(e.isDirectory() ? await walk(q) : [q]));
  }
  return r.sort();
}
const candidate = await walk('data/candidates/2026-10-22-ap23f3');
assert.equal(candidate.length, 43);
const archivedCandidate = receipt.artifacts.filter(a => a.path.startsWith('data/candidates/2026-10-22-ap23f3/'));
assert.equal(archivedCandidate.length, 43);
for (const row of archivedCandidate) await bound(row.path, row.sha256);
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
assert.equal(head, completion.head);
const report = {
  workPackage: 'AP23G1', status: 'accepted-baselines-preserved', asOf: '2026-10-22',
  acceptedF3BindingsVerified: accepted.length, historicalFilesVerified: Object.keys(historical.files).length,
  separatelyBoundF1FilesVerified: Object.keys(f1).length,
  acceptedArchivePayloadsVerified: receipt.artifacts.length, candidateFilesVerified: candidate.length,
  gitHead: head, productCodeChanged: false, productDataChanged: false,
  newCommitCreated: false, sourcePushPerformed: false, operatingChanges: false,
  note: 'Comparison against immutable pre-existing evidence, no baseline refreshed or copied'
};
if (process.argv.includes('--write')) {
  await mkdir(resolve(root, out), { recursive: true });
  await writeFile(resolve(root, out, 'preservation-verification.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify(report, null, 2));
