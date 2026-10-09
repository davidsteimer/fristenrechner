// SPDX-License-Identifier: AGPL-3.0-only
// Only the 41 approved runtime files. No remote, credentials or product commit.
import assert from 'node:assert/strict';
import { readFile, writeFile, readdir, lstat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { requireLocalBuildApproval, root, prefix, hash } from './record-mvp07-local-build-approval.mjs';
const releaseId = '2026-10-08-mvp-07-approved.1';
const directory = `data/releases/${releaseId}`;
const output = `${prefix}/local-data-pin.json`;
const read = path => readFile(resolve(root, path));
const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 32 * 1024 * 1024 });
const lines = value => value.toString().trim().split('\n').filter(Boolean).sort();
await requireLocalBuildApproval();
const raw = await read(`${directory}/manifest.json`), manifest = JSON.parse(raw);
const proof = JSON.parse(await read(`${prefix}/data-promotion.json`));
assert.equal(manifest.releaseId, releaseId);
assert.equal(manifest.releaseStatus, 'approved');
assert.equal(manifest.formatVersion, '7.0.0');
assert.equal(proof.manifestSha256, hash(raw));
assert.equal(proof.validation.python, 'passed');
const descriptors = [{ path: 'manifest.json', sha256: hash(raw), byteLength: raw.length }, ...manifest.artifacts];
assert.equal(descriptors.length, 41);
const paths = descriptors.map(item => `${directory}/${item.path}`).sort();
assert.equal(new Set(paths).size, 41);
const actual = [];
for (const name of await readdir(resolve(root, directory), { recursive: true })) {
  const stat = await lstat(resolve(root, directory, name));
  assert.ok(!stat.isSymbolicLink());
  if (stat.isFile()) actual.push(`${directory}/${name}`);
}
assert.deepEqual(actual.sort(), paths);
for (const item of descriptors) {
  assert.ok(item.path.split('/').every(part => part && !['.', '..'].includes(part)));
  const bytes = await read(`${directory}/${item.path}`);
  assert.equal(hash(bytes), item.sha256);
  assert.equal(bytes.length, item.byteLength);
}
let previous;
try { previous = JSON.parse(await read(output)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
if (previous) {
  assert.equal(previous.releaseId, releaseId);
  assert.equal(previous.manifestSha256, hash(raw));
  assert.deepEqual(previous.paths, paths);
  for (const path of paths) assert.ok(git(['cat-file', 'blob', `${previous.commit}:${path}`]).equals(await read(path)));
  console.log(JSON.stringify({ ...previous, existingPinVerified: true }));
} else {
  assert.deepEqual(lines(git(['diff', '--cached', '--name-only'])), [], 'Existing staged user work must be preserved');
  assert.deepEqual(lines(git(['ls-files', '--', ...paths])), [], 'New release paths only');
  const parentCommit = git(['rev-parse', 'HEAD']).toString().trim();
  const branch = git(['symbolic-ref', '--short', 'HEAD']).toString().trim();
  assert.equal(branch, 'codex/ap20-sozialversicherungsrecht');
  git(['add', '--', ...paths]);
  assert.deepEqual(lines(git(['diff', '--cached', '--name-only'])), paths);
  git(['commit', '--only', '-m', 'data: bind approved MVP 0.7 calendar release locally', '--', ...paths]);
  const commit = git(['rev-parse', 'HEAD']).toString().trim();
  assert.equal(git(['rev-parse', `${commit}^`]).toString().trim(), parentCommit);
  assert.deepEqual(lines(git(['diff-tree', '--no-commit-id', '--name-only', '-r', commit])), paths);
  assert.deepEqual(lines(git(['diff', '--cached', '--name-only'])), []);
  for (const path of paths) assert.ok(git(['cat-file', 'blob', `${commit}:${path}`]).equals(await read(path)));
  const receipt = { kind: 'mvp07LocalDataPin', releaseId, manifestSha256: hash(raw), commit, parentCommit, branch, paths,
    localOnly: true, publicationVerified: false, productCommit: false, unrelatedStagedFiles: 0, noRemoteOperation: true };
  await writeFile(resolve(root, output), JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify(receipt));
}
