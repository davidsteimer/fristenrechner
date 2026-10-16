// SPDX-License-Identifier: AGPL-3.0-only
// Exactly one expressly authorized local commit, containing only 42 runtime files.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, prefix, hash, encode } from './consolidate-mvp08-sources.mjs';
import { readRegular, writeExclusive } from './record-mvp08-source-approval.mjs';
import { requireR08BApproval } from './record-r08b-execution-approval.mjs';
const releaseId = '2026-10-15-mvp-08-approved.1';
const releasePath = `data/releases/${releaseId}`;
const pinPath = `${prefix}/local-data-pin.json`;
async function main() {
  assert.equal(process.argv.length, 2);
  const authority = await requireR08BApproval();
  assert.equal(authority.record.permissions.localRuntimeDataCommitAuthorized, true);
  assert.equal(await readRegular(root, pinPath, true), undefined, 'A local data pin already exists');
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim();
  const baseline = authority.record.singleLocalDataCommit;
  assert.equal(git('rev-parse', 'HEAD'), baseline.baseHead);
  assert.equal(git('diff', '--cached', '--name-only'), '');
  const independent = JSON.parse(execFileSync(resolve(root, '.venv/bin/python'),
    ['tests/data/validate_mvp08_release.py', releasePath], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }));
  assert.equal(independent.status, 'passed'); assert.equal(independent.runtimeFiles, 42);
  const manifestBytes = await readRegular(root, `${releasePath}/manifest.json`);
  const manifest = JSON.parse(manifestBytes);
  assert.equal(hash(manifestBytes), independent.manifestSha256);
  const paths = [`${releasePath}/manifest.json`, ...manifest.artifacts.map(item => `${releasePath}/${item.path}`)].sort();
  assert.deepEqual(paths, baseline.onlyPaths); assert.equal(paths.length, 42);
  for (const path of paths) assert.equal(git('ls-files', '--', path), '', 'Runtime target must be newly added');
  const before = await Promise.all(paths.map(async path => { const bytes = await readRegular(root, path); return { path, sha256: hash(bytes), byteLength: bytes.length }; }));
  await writeExclusive(root, `${prefix}/data-commit-preflight.json`, encode({ authority: { path: authority.path, sha256: authority.sha256 },
    baseHead: baseline.baseHead, independent, files: before, publicationAuthorized: false }));
  // These explicit paths are the complete authorized positive list. No add-all.
  git('add', '--', ...paths);
  assert.deepEqual(git('diff', '--cached', '--name-only').split('\n').sort(), paths);
  for (const file of before) assert.equal(hash(execFileSync('git', ['show', `:${file.path}`], { cwd: root, maxBuffer: 16 * 1024 * 1024 })), file.sha256);
  git('commit', '-m', 'data: add approved MVP 0.8 release');
  const commit = git('rev-parse', 'HEAD');
  assert.equal(git('rev-parse', 'HEAD^'), baseline.baseHead);
  assert.deepEqual(git('diff-tree', '--no-commit-id', '--name-only', '-r', commit).split('\n').sort(), paths);
  for (const file of before) {
    assert.equal(hash(execFileSync('git', ['cat-file', 'blob', `${commit}:${file.path}`], { cwd: root, maxBuffer: 16 * 1024 * 1024 })), file.sha256);
    assert.equal(hash(await readRegular(root, file.path)), file.sha256);
  }
  assert.equal(git('diff', '--cached', '--name-only'), '');
  const pin = { releaseId, commit, parent: baseline.baseHead, manifestSha256: hash(manifestBytes),
    localOnly: true, publicationVerified: false, installationAuthorized: false, files: before,
    independentDataValidation: independent, authority: { path: authority.path, sha256: authority.sha256 } };
  await writeExclusive(root, pinPath, encode(pin));
  console.log(JSON.stringify({ commit, parent: baseline.baseHead, files: before.length, manifestSha256: hash(manifestBytes), localOnly: true }));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
