// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, writeFile, rm, symlink, rename, lstat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { anchors, root, publicationPath, releaseId, releasePath, manifestPath, sourceHead, requiredExcludedPaths,
  hashPublicationBytes as hash, publicationInventoryDigest, assertPublicationPath,
  validateMvp09Publication, verifyMvp09Publication, verifyMvp09PublicationExport } from '../../scripts/verify-mvp09-publication.mjs';

// Synthetic selections use actual immutable release bytes. There is no test-only
// override for anchors and no dependency on a not-yet-generated final inventory.
// The real final manifest is separately checked by the CLI and isolated export.
const manifest = JSON.parse(await readFile(join(root, manifestPath)));
const dataPaths = [manifestPath, ...manifest.artifacts.map(entry => `${releasePath}/${entry.path}`)].sort();
const bytes = new Map(await Promise.all([...new Set([...Object.keys(anchors), ...dataPaths])].sort()
  .map(async path => [path, await readFile(join(root, path))])));
function snapshot(files = bytes) {
  const inventory = [...files].map(([path, data]) => ({ path, byteLength: data.length, sha256: hash(data) }));
  return { kind: 'mvp09PublicationPackage', releaseId, packageVersion: '0.9.0.0', dataCommit: sourceHead, sourceHead,
    publicationAuthorized: false, productionAuthorized: false, files: inventory, fileCount: inventory.length,
    totalBytes: inventory.reduce((sum, file) => sum + file.byteLength, 0), inventorySha256: publicationInventoryDigest(inventory),
    excludedPaths: [...requiredExcludedPaths, 'outputs/example.private.tar.gz'], dataCommitFiles: [...dataPaths] };
}
function reseal(record) {
  record.fileCount = record.files.length;
  record.totalBytes = record.files.reduce((sum, file) => sum + file.byteLength, 0);
  record.inventorySha256 = publicationInventoryDigest(record.files);
  return record;
}
async function portable(action) {
  const directory = await mkdtemp(join(tmpdir(), 'mvp09-publication-'));
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

test('binds six real anchors and all 42 data files, never authority or Git history', () => {
  const result = validateMvp09Publication(snapshot(), bytes);
  assert.equal(result.passed, true);
  assert.equal(result.fileCount, 47);
  assert.equal(result.verifiedReleaseAnchors, 6);
  assert.equal(result.verifiedDataFiles, 42);
  for (const key of ['dataCommitHistoryRechecked', 'currentGitHeadRechecked', 'privateEvidenceRechecked',
    'sourceLegalAuditReproduced', 'completeRepositoryInventoryClaimed', 'exactIsolatedExportInventoryVerified',
    'historicalPublicationSnapshotsRevalidated', 'newApprovalGranted', 'publicationAuthorized',
    'productionAuthorized', 'publicationPerformed', 'productionDeploymentPerformed']) assert.equal(result[key], false);
});
test('public-only readback and exact isolated export need neither private files nor Git', () => portable(async directory => {
  for (const absent of ['.git', '.work', 'node_modules']) await assert.rejects(lstat(join(directory, absent)), { code: 'ENOENT' });
  const result = await verifyMvp09Publication(directory);
  assert.equal(result.passed, true);
  assert.equal(result.publicationManifestSha256, hash(await readFile(join(directory, publicationPath))));
  assert.equal((await verifyMvp09PublicationExport(directory)).exactIsolatedExportInventoryVerified, true);
}));
test('inventory digest sorts exact paths and binds double spaces and newlines', () => {
  const rows = snapshot().files;
  const canonical = [...rows].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0)
    .map(file => `${file.sha256}  ${file.byteLength}  ${file.path}\n`).join('');
  assert.equal(publicationInventoryDigest([...rows].reverse()), hash(canonical));
  assert.notEqual(publicationInventoryDigest(rows), hash(canonical.replaceAll('  ', ' ')));
});
test('wrong identity, authority, extra fields and inconsistent counts fail closed', () => {
  for (const mutate of [v => { v.kind = 'other'; }, v => { v.releaseId = 'other'; },
    v => { v.packageVersion = '0.9.0.1'; }, v => { v.dataCommit = '0'.repeat(40); },
    v => { v.sourceHead = '0'.repeat(40); }, v => { v.publicationAuthorized = true; },
    v => { v.productionAuthorized = true; }, v => { v.overrideAnchors = anchors; },
    v => { delete v.excludedPaths; }, v => { v.fileCount++; }, v => { v.totalBytes++; },
    v => { v.inventorySha256 = '0'.repeat(64); }, v => { v.files[0].optional = true; },
    v => { v.files[0].byteLength = -1; }, v => { v.files[0].sha256 = 'invalid'; }]) {
    const record = snapshot(); mutate(record);
    assert.throws(() => validateMvp09Publication(record, bytes));
  }
});
test('every anchor rejects removal and consistently rehashed substitution', () => {
  for (const path of Object.keys(anchors)) {
    const removed = new Map(bytes); removed.delete(path);
    assert.throws(() => validateMvp09Publication(snapshot(removed), removed), /Missing exact release anchor/);
    const changed = new Map(bytes); changed.set(path, Buffer.concat([bytes.get(path), Buffer.from('\n')]));
    assert.throws(() => validateMvp09Publication(snapshot(changed), changed), /Missing exact release anchor/);
  }
});
test('missing, added, same-length changed and rehashed non-anchor bodies are rejected', () => {
  const path = dataPaths.find(item => item !== manifestPath);
  const removed = new Map(bytes); removed.delete(path);
  assert.throws(() => validateMvp09Publication(snapshot(), removed), /Missing or extra inventory bytes/);
  const changed = new Map(bytes), body = Buffer.from(bytes.get(path)); body[0] ^= 1; changed.set(path, body);
  assert.throws(() => validateMvp09Publication(snapshot(), changed), /File hash differs/);
  assert.throws(() => validateMvp09Publication(snapshot(changed), changed), /Manifest artifact hash differs/);
  const extra = new Map(bytes); extra.set('docs/unselected.md', Buffer.from('extra'));
  assert.throws(() => validateMvp09Publication(snapshot(), extra), /Missing or extra inventory bytes/);
});
test('private, credential, HAR, traversal and malformed paths never enter selection', () => {
  for (const path of ['.work/a.json', 'x/.work/a.json', 'a.private.json', 'x/private/a', 'Userinput/a.docx',
    'node_modules/a.js', 'x/.env', 'x/.env.local', 'secret.pem', 'secret.key', 'secret.pfx', 'trace.har', 'trace.har.json',
    'outputs/backups/site.zip', 'outputs/Website-Backups/site.zip', 'Sicherungen/site.zip', 'site.bak', 'site.backup.zip',
    '../escape', '/absolute', 'C:/absolute', 'a\\b', 'a//b', 'a/./b', 'a/../b', 'a\nb']) {
    assert.throws(() => assertPublicationPath(path), /Unsafe|Private/);
    const record = snapshot(); record.files.push({ path, byteLength: 0, sha256: hash('') });
    assert.throws(() => validateMvp09Publication(reseal(record), bytes), /Unsafe|Private/);
  }
});
test('self binding, duplicates and contradictory or missing mandatory exclusions fail closed', () => {
  for (const mutate of [v => { v.files.push({ ...v.files[0] }); },
    v => { v.files.push({ path: publicationPath, byteLength: 0, sha256: hash('') }); },
    v => { v.excludedPaths.push(v.files[0].path); }, v => { v.excludedPaths.push('data/releases'); },
    v => { v.excludedPaths.push(v.excludedPaths[0]); }, v => { v.excludedPaths.push('../private'); },
    v => { v.excludedPaths = v.excludedPaths.filter(p => p !== requiredExcludedPaths[0]); },
    v => { v.excludedPaths.push(publicationPath); }]) {
    const record = snapshot(); mutate(record);
    assert.throws(() => validateMvp09Publication(reseal(record), bytes));
  }
  const changed = new Map(bytes); changed.set(requiredExcludedPaths.at(-1), Buffer.from('personal'));
  assert.throws(() => validateMvp09Publication(snapshot(changed), changed), /Excluded path/);
});
test('exact 42-file data selection comes from the immutable manifest, not its prefix', () => {
  for (const mutate of [v => { v.dataCommitFiles.pop(); },
    v => { v.dataCommitFiles[0] = v.dataCommitFiles[1]; }, v => { v.dataCommitFiles[0] = 'docs/not-data.md'; }]) {
    const record = snapshot(); mutate(record);
    assert.throws(() => validateMvp09Publication(record, bytes));
  }
  const extra = new Map(bytes); extra.set(`${releasePath}/unmanifested.json`, Buffer.from('{}'));
  assert.throws(() => validateMvp09Publication(snapshot(extra), extra), /Additional release file/);
});
test('missing disk file has no fallback to the source repository', () => portable(async directory => {
  await rm(join(directory, dataPaths[0]));
  await assert.rejects(verifyMvp09Publication(directory), { code: 'ENOENT' });
}));
test('symlinked file, parent and manifest fail even with exact underlying bytes', () => portable(async directory => {
  const path = dataPaths[0];
  await rename(join(directory, path), join(directory, 'outside-file'));
  await symlink(join(directory, 'outside-file'), join(directory, path));
  await assert.rejects(verifyMvp09Publication(directory), /Not a regular publication file or parent/);
  await rm(join(directory, path)); await rename(join(directory, 'outside-file'), join(directory, path));
  const parent = 'outputs/release-mvp09-2026-10-18';
  await rename(join(directory, parent), join(directory, 'outside-parent'));
  await symlink(join(directory, 'outside-parent'), join(directory, parent));
  await assert.rejects(verifyMvp09Publication(directory), /Not a regular publication file or parent/);
  await rm(join(directory, parent)); await rename(join(directory, 'outside-parent'), join(directory, parent));
  await rename(join(directory, publicationPath), join(directory, 'outside-manifest'));
  await symlink(join(directory, 'outside-manifest'), join(directory, publicationPath));
  await assert.rejects(verifyMvp09Publication(directory), /Not a regular publication file or parent/);
}));
test('root symlinks, unlisted release files and release symlinks fail', () => portable(async directory => {
  const link = join(directory, 'root-link'); await symlink(directory, link);
  await assert.rejects(verifyMvp09Publication(link), /Not a regular publication root/); await rm(link);
  const extra = join(directory, releasePath, 'extra.json'); await writeFile(extra, '{}');
  await assert.rejects(verifyMvp09Publication(directory), /Missing or extra actual release file/); await rm(extra);
  await symlink(join(directory, releasePath, 'calendars'), join(directory, releasePath, 'redirect'));
  await assert.rejects(verifyMvp09Publication(directory), /Symlink in actual inventory/);
}));
test('exact isolated export rejects unlisted files and private directories outside the release', () => portable(async directory => {
  await mkdir(join(directory, 'docs')); await writeFile(join(directory, 'docs/unselected.md'), 'unselected');
  assert.equal((await verifyMvp09Publication(directory)).passed, true);
  await assert.rejects(verifyMvp09PublicationExport(directory), /Missing or extra isolated export file/);
  await rm(join(directory, 'docs'), { recursive: true });
  await mkdir(join(directory, '.work'));
  await assert.rejects(verifyMvp09PublicationExport(directory), /Private publication path/);
}));
test('CLI rejects alternate root, write and authority switches before reading a manifest', () => {
  for (const arg of ['--root=/tmp', '--write', '--authorize']) {
    const result = spawnSync(process.execPath, [join(root, 'scripts/verify-mvp09-publication.mjs'), arg], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    const output = JSON.parse(result.stderr);
    assert.match(output.error, /No write, alternate-root or authorization/);
    assert.equal(output.publicationPerformed, false);
  }
});
test('later selected living documents do not silently revalidate historical MVP07 snapshots', () => {
  const changed = new Map(bytes); changed.set('docs/current-status.md', Buffer.from('MVP08 Q accepted, no publication authority.\n'));
  assert.equal(validateMvp09Publication(snapshot(changed), changed).historicalPublicationSnapshotsRevalidated, false);
});

