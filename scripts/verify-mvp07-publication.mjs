// SPDX-License-Identifier: AGPL-3.0-only
// Read-only publication inventory. No Git dependency, staging, commit or upload.
// A valid inventory binds selected bytes, not the user's external permission.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, lstat, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const publicationPath = 'outputs/publication-mvp07-2026-10-09/publication-package.json';
export const releaseId = '2026-10-08-mvp-07-approved.1';
export const releasePath = `data/releases/${releaseId}`;
export const manifestPath = `${releasePath}/manifest.json`;
export const anchors = Object.freeze({
  [manifestPath]: 'fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597',
  'outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/artifacts/fristenrechner-schweiz-0.7.0.2.sppkg':
    '8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db',
  'outputs/release-mvp07-web-corrected-0702-2026-10-09/artifacts/fristenrechner-mvp07-steimer-web-corrected-0702.zip':
    '9f986c7d8f8d6366914f9605f46b2fd87987fcbdaf17875ce9d2c4d044b07228',
  'outputs/release-mvp07-2026-10-08/source-approval.json':
    '478ca3d20ea1d643bb05379f8acc042560fa9547575d62e5d7afd4c8c1213810'
});
const fields = ['kind', 'releaseId', 'packageVersion', 'dataCommit', 'publicationAuthorized',
  'productionAuthorized', 'files', 'fileCount', 'totalBytes', 'inventorySha256', 'excludedPaths', 'dataCommitFiles'];
const privatePath = /(?:^|\/)(?:\.work|\.git|\.venv|node_modules|Userinput|arbeitskopien|private|\.ssh|\.aws|\.codex|\.agents)(?:\/|$)|\.private\./i;
export const hashPublicationBytes = bytes => createHash('sha256').update(bytes).digest('hex');
function exactFields(value, expected, label) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), `${label} must be an object`);
  assert.deepEqual(Object.keys(value).sort(), [...expected].sort(), `Unexpected ${label} fields`);
}
export function assertPublicationPath(path, { excluded = false } = {}) {
  assert.ok(typeof path === 'string' && path.length && !path.startsWith('/') && !/[\\:\x00-\x1f\x7f]/.test(path)
    && path.split('/').every(part => part && part !== '.' && part !== '..'), 'Unsafe publication path');
  assert.ok(excluded || !privatePath.test(path), 'Private publication path');
}
export function publicationInventoryDigest(files) {
  return hashPublicationBytes([...files].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0)
    .map(entry => `${entry.sha256}  ${entry.byteLength}  ${entry.path}\n`).join(''));
}
function checkContract(snapshot) {
  exactFields(snapshot, fields, 'publication package');
  assert.equal(snapshot.kind, 'mvp07PublicationPackage');
  assert.equal(snapshot.releaseId, releaseId, 'Unexpected release identity');
  assert.equal(snapshot.packageVersion, '0.7.0.2', 'Unexpected package version');
  assert.equal(snapshot.dataCommit, '331ef3e19d43a6b51d91a502acd6b5443071599f', 'Unexpected data commit');
  assert.equal(snapshot.publicationAuthorized, false, 'Unexpected publication authority');
  assert.equal(snapshot.productionAuthorized, false, 'Unexpected production authority');
  assert.ok(Array.isArray(snapshot.files) && snapshot.files.length > 0, 'Empty publication inventory');
  assert.ok(Array.isArray(snapshot.excludedPaths), 'Missing explicit exclusions');
  assert.ok(Array.isArray(snapshot.dataCommitFiles), 'Missing data selection');
  const excluded = new Set();
  for (const path of snapshot.excludedPaths) {
    assertPublicationPath(path, { excluded: true });
    assert.ok(path !== publicationPath && !excluded.has(path), 'Duplicate or self exclusion');
    excluded.add(path);
  }
  const seen = new Map();
  let total = 0;
  for (const entry of snapshot.files) {
    exactFields(entry, ['path', 'byteLength', 'sha256'], 'file record');
    assertPublicationPath(entry.path);
    assert.ok(entry.path !== publicationPath && !seen.has(entry.path), 'Duplicate or self-bound inventory path');
    assert.ok(![...excluded].some(path => entry.path === path || entry.path.startsWith(`${path}/`)),
      'Excluded path in publication inventory');
    assert.ok(Number.isSafeInteger(entry.byteLength) && entry.byteLength >= 0, 'Invalid byte count');
    assert.ok(typeof entry.sha256 === 'string' && /^[a-f0-9]{64}$/.test(entry.sha256), 'Invalid SHA-256');
    total += entry.byteLength;
    assert.ok(Number.isSafeInteger(total), 'Unsafe total byte count');
    seen.set(entry.path, entry);
  }
  assert.equal(snapshot.fileCount, seen.size, 'Inventory file count mismatch');
  assert.equal(snapshot.totalBytes, total, 'Inventory total bytes mismatch');
  assert.equal(snapshot.inventorySha256, publicationInventoryDigest(snapshot.files), 'Inventory digest mismatch');
  for (const [path, sha256] of Object.entries(anchors))
    assert.equal(seen.get(path)?.sha256, sha256, `Missing exact release anchor: ${path}`);
  for (const path of snapshot.dataCommitFiles) {
    assertPublicationPath(path);
    assert.ok(path.startsWith(`${releasePath}/`) && seen.has(path), 'Unbound data commit file');
  }
  assert.equal(snapshot.dataCommitFiles.length, 41, 'Exactly 41 data commit files required');
  assert.equal(new Set(snapshot.dataCommitFiles).size, 41, 'Duplicate data commit file');
  return seen;
}

export function validateMvp07Publication(snapshot, files) {
  const entries = checkContract(snapshot);
  assert.ok(files instanceof Map, 'Expected exact byte map');
  assert.deepEqual([...files.keys()].sort(), [...entries.keys()].sort(), 'Missing or extra inventory bytes');
  for (const [path, entry] of entries) {
    const bytes = files.get(path);
    assert.ok(Buffer.isBuffer(bytes), `Missing file bytes: ${path}`);
    assert.equal(bytes.length, entry.byteLength, `Byte count differs: ${path}`);
    assert.equal(hashPublicationBytes(bytes), entry.sha256, `File hash differs: ${path}`);
  }
  // The pinned manifest, not a directory prefix or caller-supplied fixture,
  // defines exactly which 41 files the pre-existing data commit contributes.
  const manifest = JSON.parse(files.get(manifestPath));
  const expected = [manifestPath, ...manifest.artifacts.map(entry => `${releasePath}/${entry.path}`)].sort();
  assert.equal(manifest.releaseId, releaseId);
  assert.equal(expected.length, 41);
  assert.deepEqual([...snapshot.dataCommitFiles].sort(), expected, 'Data commit selection differs from pinned manifest');
  assert.deepEqual([...entries.keys()].filter(path => path.startsWith(`${releasePath}/`)).sort(), expected,
    'Additional release file outside the pinned manifest');
  for (const artifact of manifest.artifacts) {
    const entry = entries.get(`${releasePath}/${artifact.path}`);
    assert.equal(entry.sha256, artifact.sha256, `Manifest artifact hash differs: ${entry.path}`);
    assert.equal(entry.byteLength, artifact.byteLength, `Manifest artifact length differs: ${entry.path}`);
  }
  return { kind: 'mvp07PublicationSnapshotReadback', passed: true, releaseId, packageVersion: '0.7.0.2',
    fileCount: entries.size, totalBytes: snapshot.totalBytes, inventorySha256: snapshot.inventorySha256,
    verifiedReleaseAnchors: 4, verifiedDataFiles: 41, dataCommitHistoryRechecked: false,
    privateEvidenceRechecked: false, completeRepositoryInventoryClaimed: false,
    newApprovalGranted: false, publicationAuthorized: false, productionAuthorized: false,
    publicationPerformed: false, productionDeploymentPerformed: false };
}

async function readRegular(repository, path) {
  assertPublicationPath(path);
  const base = await lstat(repository);
  assert.ok(base.isDirectory() && !base.isSymbolicLink(), 'Not a regular publication root');
  const parts = path.split('/');
  for (let index = 1; index <= parts.length; index++) {
    const stat = await lstat(resolve(repository, ...parts.slice(0, index)));
    assert.ok(!stat.isSymbolicLink() && (index === parts.length ? stat.isFile() : stat.isDirectory()),
      `Not a regular publication file or parent: ${path}`);
  }
  return readFile(resolve(repository, path));
}
export async function verifyMvp07Publication(repository = root) {
  const raw = await readRegular(repository, publicationPath);
  const snapshot = JSON.parse(raw);
  const entries = checkContract(snapshot);
  const files = new Map();
  for (const path of entries.keys()) files.set(path, await readRegular(repository, path));
  async function inventory(path) {
    const names = [];
    for (const entry of await readdir(resolve(repository, path), { withFileTypes: true })) {
      assert.ok(!entry.isSymbolicLink(), 'Symlink in release inventory');
      const child = `${path}/${entry.name}`;
      if (entry.isDirectory()) names.push(...await inventory(child));
      else { assert.ok(entry.isFile(), 'Non-file in release inventory'); names.push(child); }
    }
    return names;
  }
  assert.deepEqual((await inventory(releasePath)).sort(), [...snapshot.dataCommitFiles].sort(),
    'Missing or extra actual release file');
  return { ...validateMvp07Publication(snapshot, files), publicationManifestSha256: hashPublicationBytes(raw) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    assert.equal(process.argv.length, 2, 'No write, alternate-root or authorization arguments accepted');
    console.log(JSON.stringify(await verifyMvp07Publication(), null, 2));
  } catch (error) {
    console.error(JSON.stringify({ kind: 'mvp07PublicationSnapshotReadback', passed: false,
      publicationPerformed: false, productionDeploymentPerformed: false, error: error.message }, null, 2));
    process.exitCode = 1;
  }
}
