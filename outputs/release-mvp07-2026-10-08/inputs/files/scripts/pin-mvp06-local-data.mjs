// SPDX-License-Identifier: AGPL-3.0-only
// Creates only the local immutable data reference required by the authorised build.
// Never pushes, changes a remote, or stages unrelated work.
import assert from 'node:assert/strict';
import { readFile, writeFile, readdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyMvp06SourceApproval } from './verify-mvp06-source-approval.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const releaseId = '2026-10-01-mvp-06-approved.1';
const directory = `data/releases/${releaseId}`;
const output = 'outputs/release-mvp06-2026-10-01/local-data-pin.json';
const read = path => readFile(resolve(root, path));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 16 * 1024 * 1024 });
const lines = bytes => bytes.toString().trim().split('\n').filter(Boolean).sort();

await verifyMvp06SourceApproval(root);
const manifestBytes = await read(`${directory}/manifest.json`);
assert.equal(sha256(manifestBytes), '637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724',
  'Only the exact independently validated promotion can be pinned');
const manifest = JSON.parse(manifestBytes);
const promotionBytes = await read('outputs/release-mvp06-2026-10-01/data-promotion.json');
assert.equal(sha256(promotionBytes), '51f946fe36104e83e766ad7b958d2debf678781deee7f9b388c573b928088b91');
const promotion = JSON.parse(promotionBytes);
assert.equal(manifest.releaseId, releaseId);
assert.equal(manifest.releaseStatus, 'approved');
assert.equal(manifest.formatVersion, '6.0.0');
assert.equal(promotion.manifestSha256, sha256(manifestBytes));
assert.equal(promotion.dataStatus, 'approved');
assert.equal(promotion.publicationApproved, false);
const descriptors = [{ path: 'manifest.json', sha256: sha256(manifestBytes) }, ...manifest.artifacts];
const paths = descriptors.map(item => `${directory}/${item.path}`).sort();
assert.equal(paths.length, 11);
assert.equal(new Set(paths).size, 11);
const entries = await readdir(resolve(root, directory), { recursive: true, withFileTypes: true });
assert.ok(entries.every(entry => !entry.isSymbolicLink()), 'No symlinks in release');
const actual = [];
for (const path of await readdir(resolve(root, directory), { recursive: true })) {
  const stat = await lstat(resolve(root, directory, path));
  if (stat.isFile()) actual.push(`${directory}/${path}`);
}
assert.deepEqual(actual.filter(path => path !== `${directory}/README.md`).sort(), paths,
  'Only eleven runtime files and optional release documentation may exist');
for (const descriptor of descriptors) {
  assert.ok(!descriptor.path.includes('..') && !descriptor.path.startsWith('/'));
  assert.equal(sha256(await read(`${directory}/${descriptor.path}`)), descriptor.sha256);
}

let prior;
try { prior = JSON.parse(await read(output)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
if (prior) {
  assert.equal(prior.releaseId, releaseId);
  assert.equal(prior.manifestSha256, sha256(manifestBytes));
  assert.deepEqual(prior.paths, paths);
  for (const path of paths) assert.ok(git(['cat-file', 'blob', `${prior.commit}:${path}`]).equals(await read(path)));
  console.log(JSON.stringify({ ...prior, existingPinVerified: true }));
} else {
  assert.deepEqual(lines(git(['diff', '--cached', '--name-only'])), [], 'Preserve existing staged user work');
  const parentCommit = git(['rev-parse', 'HEAD']).toString().trim();
  const branch = git(['symbolic-ref', '--short', 'HEAD']).toString().trim();
  assert.equal(branch, 'codex/ap20-sozialversicherungsrecht');
  assert.deepEqual(lines(git(['ls-files', '--', ...paths])), [], 'Only a new release is accepted');
  git(['add', '--', ...paths]);
  assert.deepEqual(lines(git(['diff', '--cached', '--name-only'])), paths);
  git(['commit', '--only', '-m', 'data: approve MVP 0.6 AP20 social procedures', '--', ...paths]);
  const commit = git(['rev-parse', 'HEAD']).toString().trim();
  assert.equal(git(['rev-parse', `${commit}^`]).toString().trim(), parentCommit);
  assert.deepEqual(lines(git(['diff-tree', '--no-commit-id', '--name-only', '-r', commit])), paths);
  assert.deepEqual(lines(git(['diff', '--cached', '--name-only'])), []);
  for (const path of paths) assert.ok(git(['cat-file', 'blob', `${commit}:${path}`]).equals(await read(path)));
  const receipt = { kind: 'mvp06LocalDataPin', releaseId, manifestSha256: sha256(manifestBytes),
    commit, parentCommit, branch, paths, localOnly: true, publicationVerified: false,
    productCommit: false, unrelatedStagedFiles: 0, noRemoteOperation: true };
  const bytes = Buffer.from(JSON.stringify(receipt, null, 2) + '\n');
  await writeFile(resolve(root, output), bytes, { flag: 'wx' });
  assert.ok((await read(output)).equals(bytes));
  console.log(JSON.stringify(receipt));
}
