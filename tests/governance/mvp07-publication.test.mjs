// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, writeFile, rm, symlink, rename, lstat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { anchors, root, publicationPath, releaseId, releasePath, manifestPath,
  hashPublicationBytes as hash, publicationInventoryDigest, assertPublicationPath,
  validateMvp07Publication, verifyMvp07Publication } from '../../scripts/verify-mvp07-publication.mjs';

// Actual immutable release anchors, never configurable expected hashes or
// test-only anchor exceptions. The final publication inventory is not needed.
const manifest = JSON.parse(await readFile(join(root, manifestPath)));
const dataPaths = [manifestPath, ...manifest.artifacts.map(entry => `${releasePath}/${entry.path}`)].sort();
const bytes = new Map(await Promise.all([...new Set([...Object.keys(anchors), ...dataPaths])].sort()
  .map(async path => [path, await readFile(join(root, path))])));
function snapshot(files = bytes) {
  const inventory = [...files].map(([path, data]) => ({ path, byteLength: data.length, sha256: hash(data) }));
  return { kind: 'mvp07PublicationPackage', releaseId, packageVersion: '0.7.0.2',
    dataCommit: '331ef3e19d43a6b51d91a502acd6b5443071599f', publicationAuthorized: false,
    productionAuthorized: false, files: inventory, fileCount: inventory.length,
    totalBytes: inventory.reduce((sum, file) => sum + file.byteLength, 0),
    inventorySha256: publicationInventoryDigest(inventory),
    excludedPaths: ['.work/private-audit.json', 'outputs/example.private.tar.gz'], dataCommitFiles: [...dataPaths] };
}
function reseal(record) {
  record.fileCount = record.files.length;
  record.totalBytes = record.files.reduce((sum, file) => sum + file.byteLength, 0);
  record.inventorySha256 = publicationInventoryDigest(record.files);
  return record;
}
async function portable(action) {
  const directory = await mkdtemp(join(tmpdir(), 'mvp07-publication-'));
  try {
    for (const [path, data] of bytes) {
      await mkdir(dirname(join(directory, path)), { recursive: true });
      await writeFile(join(directory, path), data);
    }
    await mkdir(dirname(join(directory, publicationPath)), { recursive: true });
    await writeFile(join(directory, publicationPath), `${JSON.stringify(snapshot(), null, 2)}\n`);
    await action(directory);
  } finally { await rm(directory, { recursive: true, force: true }); }
}

test('binds four real anchors and all 41 data files without any publication or Git-history claim', () => {
  const result = validateMvp07Publication(snapshot(), bytes);
  assert.equal(result.passed, true);
  assert.equal(result.fileCount, 44);
  assert.equal(result.verifiedReleaseAnchors, 4);
  assert.equal(result.verifiedDataFiles, 41);
  for (const key of ['dataCommitHistoryRechecked', 'privateEvidenceRechecked', 'completeRepositoryInventoryClaimed',
    'newApprovalGranted', 'publicationAuthorized', 'productionAuthorized', 'publicationPerformed',
    'productionDeploymentPerformed']) assert.equal(result[key], false);
});
test('actual public-only readback requires no .work, Git or final publication manifest in the real repository', () => portable(async directory => {
  for (const absent of ['.git', '.work', 'node_modules']) await assert.rejects(lstat(join(directory, absent)), { code: 'ENOENT' });
  const result = await verifyMvp07Publication(directory);
  assert.equal(result.passed, true);
  assert.equal(result.publicationManifestSha256, hash(await readFile(join(directory, publicationPath))));
}));
test('inventory digest uses sorted paths and exact double-space/newline representation', () => {
  const rows = snapshot().files;
  const canonical = [...rows].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0)
    .map(file => `${file.sha256}  ${file.byteLength}  ${file.path}\n`).join('');
  assert.equal(publicationInventoryDigest([...rows].reverse()), hash(canonical));
  assert.notEqual(publicationInventoryDigest(rows), hash(canonical.replaceAll('  ', ' ')));
});
test('wrong identity, authority, unexpected fields and inconsistent inventory counts fail closed', () => {
  for (const mutate of [value => { value.kind = 'other'; }, value => { value.releaseId = 'other'; },
    value => { value.packageVersion = '0.7.0.0'; }, value => { value.dataCommit = '0'.repeat(40); },
    value => { value.publicationAuthorized = true; }, value => { value.productionAuthorized = true; },
    value => { value.extraAuthority = false; }, value => { delete value.excludedPaths; },
    value => { value.fileCount++; }, value => { value.totalBytes++; },
    value => { value.inventorySha256 = '0'.repeat(64); }, value => { value.files[0].optional = true; },
    value => { value.files[0].byteLength = -1; }, value => { value.files[0].sha256 = 'invalid'; }]) {
    const record = snapshot(); mutate(record);
    assert.throws(() => validateMvp07Publication(record, bytes));
  }
});
test('every pinned anchor rejects a removed or even consistently rehashed replacement', () => {
  for (const path of Object.keys(anchors)) {
    const removed = new Map(bytes); removed.delete(path);
    assert.throws(() => validateMvp07Publication(snapshot(removed), removed), /Missing exact release anchor/);
    const replaced = new Map(bytes); replaced.set(path, Buffer.concat([bytes.get(path), Buffer.from('\n')]));
    assert.throws(() => validateMvp07Publication(snapshot(replaced), replaced), /Missing exact release anchor/);
  }
});
test('exact inventory bytes are mandatory, including unchanged non-anchor runtime bindings', () => {
  const path = dataPaths.find(item => item !== manifestPath);
  const removed = new Map(bytes); removed.delete(path);
  assert.throws(() => validateMvp07Publication(snapshot(), removed), /Missing or extra inventory bytes/);
  const changed = new Map(bytes); changed.set(path, Buffer.concat([bytes.get(path), Buffer.from('\n')]));
  assert.throws(() => validateMvp07Publication(snapshot(), changed), /Byte count differs/);
  assert.throws(() => validateMvp07Publication(snapshot(changed), changed), /Manifest artifact hash differs/);
  const extra = new Map(bytes); extra.set('docs/unselected.md', Buffer.from('extra'));
  assert.throws(() => validateMvp07Publication(snapshot(), extra), /Missing or extra inventory bytes/);
});
test('private paths, traversal, self-binding, duplicate records and exclusions cannot enter the inventory', () => {
  for (const path of ['.work/a.json', 'x/.work/a.json', 'a.private.json', 'x/private/a', 'Userinput/a.docx',
    'node_modules/a.js', '../escape', '/absolute', 'C:/absolute', 'a\\b', 'a//b', 'a/./b', 'a/../b', 'a\nb']) {
    assert.throws(() => assertPublicationPath(path), /Unsafe|Private/);
    const record = snapshot(); record.files.push({ path, byteLength: 0, sha256: hash('') });
    assert.throws(() => validateMvp07Publication(reseal(record), bytes), /Unsafe|Private/);
  }
  for (const mutate of [value => { value.files.push({ ...value.files[0] }); },
    value => { value.files.push({ path: publicationPath, byteLength: 0, sha256: hash('') }); },
    value => { value.excludedPaths.push(value.files[0].path); },
    value => { value.excludedPaths.push('data/releases'); },
    value => { value.excludedPaths.push(value.excludedPaths[0]); },
    value => { value.excludedPaths.push('../private'); }]) {
    const record = snapshot(); mutate(record);
    assert.throws(() => validateMvp07Publication(reseal(record), bytes));
  }
});
test('data commit selection is the exact pinned manifest, not any 41 files under the release prefix', () => {
  for (const mutate of [value => { value.dataCommitFiles.pop(); },
    value => { value.dataCommitFiles[0] = value.dataCommitFiles[1]; },
    value => { value.dataCommitFiles[0] = 'docs/not-data.md'; }]) {
    const record = snapshot(); mutate(record);
    assert.throws(() => validateMvp07Publication(record, bytes));
  }
  const additional = new Map(bytes); additional.set(`${releasePath}/unmanifested.json`, Buffer.from('{}'));
  assert.throws(() => validateMvp07Publication(snapshot(additional), additional), /Additional release file/);
});
test('missing actual file has no fallback to the original repository', () => portable(async directory => {
  await rm(join(directory, dataPaths[0]));
  await assert.rejects(verifyMvp07Publication(directory), { code: 'ENOENT' });
}));
test('symlinked files, parents and publication manifest are rejected even when their bytes match', () => portable(async directory => {
  const path = dataPaths[0];
  await rename(join(directory, path), join(directory, 'outside-file'));
  await symlink(join(directory, 'outside-file'), join(directory, path));
  await assert.rejects(verifyMvp07Publication(directory), /Not a regular publication file or parent/);
  await rm(join(directory, path));
  await rename(join(directory, 'outside-file'), join(directory, path));
  const sourceParent = 'outputs/release-mvp07-2026-10-08';
  await rename(join(directory, sourceParent), join(directory, 'outside-parent'));
  await symlink(join(directory, 'outside-parent'), join(directory, sourceParent));
  await assert.rejects(verifyMvp07Publication(directory), /Not a regular publication file or parent/);
  await rm(join(directory, sourceParent));
  await rename(join(directory, 'outside-parent'), join(directory, sourceParent));
  await rename(join(directory, publicationPath), join(directory, 'outside-manifest'));
  await symlink(join(directory, 'outside-manifest'), join(directory, publicationPath));
  await assert.rejects(verifyMvp07Publication(directory), /Not a regular publication file or parent/);
}));
test('symlinked root and unmanifested actual release entries cannot be hidden', () => portable(async directory => {
  const link = join(directory, 'root-link');
  await symlink(directory, link);
  await assert.rejects(verifyMvp07Publication(link), /Not a regular publication root/);
  await rm(link);
  const extra = join(directory, releasePath, 'extra.json');
  await writeFile(extra, '{}');
  await assert.rejects(verifyMvp07Publication(directory), /Missing or extra actual release file/);
  await rm(extra);
  await symlink(join(directory, releasePath, 'calendars'), join(directory, releasePath, 'redirect'));
  await assert.rejects(verifyMvp07Publication(directory), /Symlink in release inventory/);
}));
