// SPDX-License-Identifier: AGPL-3.0-only
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const proofs = [
  ['outputs/ap22c2-2026-10-08/QA-AP22C2.json', '18ad037b4cb4724941046d91d8ee2dc9f5606c3bf63ac275fb61f2ee9ff49e52'],
  ['outputs/ap22c2-2026-10-08/browser-qa-integrity.json', 'ef916f361e047e983df77eb5dd0090b9a3f490696fa286e69de5930fdbc557d4']
];
const entries = new Map();
for (const [path, expected] of proofs) {
  const bytes = await readFile(path);
  assert.equal(sha(bytes), expected, path);
  for (const entry of [...JSON.parse(bytes).artifacts, { path, sha256: expected, byteLength: bytes.length }]) {
    if (entries.has(entry.path)) assert.deepEqual(entries.get(entry.path), entry);
    entries.set(entry.path, entry);
  }
}
const target = 'outputs/ap22c2-abnahme-2026-10-08';
for (const entry of entries.values()) {
  const destination = resolve(target, entry.path);
  let bytes;
  try { bytes = await readFile(destination); }
  catch (error) { if (error.code !== 'ENOENT') throw error; bytes = await readFile(entry.path); }
  assert.equal(sha(bytes), entry.sha256, entry.path);
  assert.equal(bytes.length, entry.byteLength, entry.path);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
}
const receipt = { kind: 'acceptedAP22C2SourceSnapshot', acceptedOn: '2026-10-08', acceptedBy: 'David Steimer', artifacts: [...entries.values()] };
await writeFile(resolve(target, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ target, files: entries.size, verified: true }));
