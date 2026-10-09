// SPDX-License-Identifier: AGPL-3.0-only
// Preserve the accepted proof and its byte-bound sources before editing living status documents.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const target = 'outputs/ap22c3-abnahme-2026-10-08';
const rootProof = 'outputs/ap22c3-2026-10-08/completion-integrity.json';
const rootHash = '597594edbc022940f4ef26a20fdc0f0c31614dc58d87df604e7fdbc3efaba5d5';
const entries = new Map();
const savedPath = path => path.startsWith('.work/') ? `build/${path.slice(6)}` : path;
async function sourceBytes(path) {
  try { return await readFile(resolve(target, savedPath(path))); }
  catch (error) { if (error.code !== 'ENOENT') throw error; return readFile(path); }
}
function add(entry) {
  assert.ok(!entry.path.startsWith('/') && !entry.path.split('/').includes('..'), entry.path);
  if (entries.has(entry.path)) assert.deepEqual(entries.get(entry.path), entry);
  entries.set(entry.path, entry);
}
function collect(value) {
  if (!value || typeof value !== 'object') return;
  if (typeof value.path === 'string' && typeof value.sha256 === 'string' && Number.isInteger(value.byteLength)) {
    add({ path: value.path, sha256: value.sha256, byteLength: value.byteLength });
  }
  for (const item of Object.values(value)) collect(item);
}
const rootBytes = await sourceBytes(rootProof);
assert.equal(sha(rootBytes), rootHash);
add({ path: rootProof, sha256: rootHash, byteLength: rootBytes.length });
collect(JSON.parse(rootBytes));
for (const name of ['QA-AP22C3.json', 'spfx-build.json', 'bundle-integrity.json']) {
  const path = `outputs/ap22c3-2026-10-08/${name}`;
  const bytes = await sourceBytes(path);
  assert.equal(sha(bytes), entries.get(path).sha256, path);
  collect(JSON.parse(bytes));
}
// Preserve the tested isolated package as evidence, not as an authorised installable release.
const packagePath = '.work/ap22c3-spfx-build-VKe9Jt/spfx/sharepoint/solution/fristenrechner-schweiz.sppkg';
const packageBytes = await sourceBytes(packagePath);
const packageProof = JSON.parse(await sourceBytes('outputs/ap22c3-2026-10-08/spfx-build.json'));
assert.equal(sha(packageBytes), packageProof.isolatedPackageSha256);
add({ path: packagePath, sha256: sha(packageBytes), byteLength: packageBytes.length });

// Check all inputs before creating the snapshot. Existing copies must match and are never replaced.
const verified = [];
for (const entry of [...entries.values()].sort((a, b) => a.path.localeCompare(b.path))) {
  const bytes = await sourceBytes(entry.path);
  assert.equal(sha(bytes), entry.sha256, entry.path);
  assert.equal(bytes.length, entry.byteLength, entry.path);
  verified.push({ entry, bytes });
}
for (const { entry, bytes } of verified) {
  const destination = resolve(target, savedPath(entry.path));
  await mkdir(dirname(destination), { recursive: true });
  try { await writeFile(destination, bytes, { flag: 'wx' }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  assert.equal(sha(await readFile(destination)), entry.sha256, destination);
}
const receipt = {
  kind: 'acceptedAP22C3SourceSnapshot', acceptedOn: '2026-10-08', acceptedBy: 'David Steimer',
  userStatement: 'AP22C3 ist abgenommen.', sourceReleaseApproved: false, deployed: false, published: false,
  rootProof, rootProofSha256: rootHash,
  artifacts: verified.map(({ entry }) => ({ ...entry, archivePath: savedPath(entry.path) }))
};
const receiptBytes = Buffer.from(JSON.stringify(receipt, null, 2) + '\n');
const receiptPath = resolve(target, 'receipt.json');
try { await writeFile(receiptPath, receiptBytes, { flag: 'wx' }); }
catch (error) { if (error.code !== 'EEXIST') throw error; }
assert.equal(sha(await readFile(receiptPath)), sha(receiptBytes));
console.log(JSON.stringify({ target, files: verified.length, verified: true, receiptSha256: sha(receiptBytes) }));
