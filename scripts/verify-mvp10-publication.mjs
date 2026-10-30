// SPDX-License-Identifier: AGPL-3.0-only
// Read-only selected publication bytes. No Git, private evidence, network or writes.
// A successful result is not publication authority and does not alter old releases.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, lstat, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const publicationPath = 'outputs/publication-mvp10-2026-10-30/publication-package.json';
export const releaseId = '2026-10-28-mvp-010-approved.1';
export const releasePath = `data/releases/${releaseId}`;
export const manifestPath = `${releasePath}/manifest.json`;
export const sourceHead = '01bbd96a296b0fc4d64cd554acc8cb122c3017a3';
const output = 'outputs/release-mvp10-2026-10-28';
export const anchors = Object.freeze({
  [manifestPath]: '7562597cee45ad1e4995989f7f31b2e8d0619baaf1f9618355ca870c8426a016',
  [`${output}/fristenrechner-schweiz-0.10.0.0.sppkg`]: '7b4af4f28426434a5c15c1055a6a5f029e34d6982d108a868fabf63a7e5278fd',
  [`${output}/fristenrechner-mvp10-sharepoint-mirror.zip`]: '77019f584ea4c0482a3001460f35f312889b910fc46e2aee4aee90bba4edfbf6',
  [`${output}/fristenrechner-mvp10-steimer-web.zip`]: 'a94740a78034e8cc41ae2c4907b917729c6f4743d7a307a60ee25834d550e1b3',
  [`${output}/fristenrechner-schweiz-recovery-0.10.0.1.sppkg`]: '0def9a2c4a126f6d7b30d22ebe600c1b471ccd10d6c81b7dfab9745a350d797b',
});
export const requiredExcludedPaths = Object.freeze([
  '.work', '.git', '.venv', 'node_modules', 'Userinput',
  'outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.docx'
]);
// Parent fills exactly these fields. The manifest itself is never listed in files:
// its independent hash is returned on readback, avoiding circular self-binding.
export const publicationFields = Object.freeze(['kind', 'releaseId', 'packageVersion', 'dataCommit', 'sourceHead',
  'publicationAuthorized', 'productionAuthorized', 'files', 'fileCount', 'totalBytes',
  'inventorySha256', 'excludedPaths', 'dataCommitFiles']);
const privatePath = /(?:^|\/)(?:\.work|\.git|\.venv|node_modules|Userinput|arbeitskopien|private|backups|website-backups|websitebackups|sicherungen|\.ssh|\.aws|\.codex|\.agents)(?:\/|$)|\.private\.|(?:^|\/)\.env(?:\.|$)|\.(?:pem|key|p12|pfx|har|bak|backup)(?:$|\.)/i;
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
  exactFields(snapshot, publicationFields, 'publication package');
  assert.equal(snapshot.kind, 'mvp10PublicationPackage');
  assert.equal(snapshot.releaseId, releaseId, 'Unexpected release identity');
  assert.equal(snapshot.packageVersion, '0.10.0.0', 'Unexpected package version');
  assert.equal(snapshot.dataCommit, sourceHead, 'Unexpected data commit');
  assert.equal(snapshot.sourceHead, sourceHead, 'Unexpected source preparation HEAD');
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
  for (const path of requiredExcludedPaths) assert.ok(excluded.has(path), `Missing mandatory exclusion: ${path}`);
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
  assert.equal(snapshot.dataCommitFiles.length, 45, 'Exactly 45 data commit files required');
  assert.equal(new Set(snapshot.dataCommitFiles).size, 45, 'Duplicate data commit file');
  return seen;
}

export function validateMvp10Publication(snapshot, files) {
  const entries = checkContract(snapshot);
  assert.ok(files instanceof Map, 'Expected exact byte map');
  assert.deepEqual([...files.keys()].sort(), [...entries.keys()].sort(), 'Missing or extra inventory bytes');
  for (const [path, entry] of entries) {
    const bytes = files.get(path);
    assert.ok(Buffer.isBuffer(bytes), `Missing file bytes: ${path}`);
    assert.equal(bytes.length, entry.byteLength, `Byte count differs: ${path}`);
    assert.equal(hashPublicationBytes(bytes), entry.sha256, `File hash differs: ${path}`);
  }
  const manifest = JSON.parse(files.get(manifestPath));
  assert.equal(manifest.releaseId, releaseId);
  assert.equal(manifest.releaseStatus, 'approved');
  assert.equal(manifest.formatVersion, '17.0.0');
  assert.equal(manifest.compatibility.minimumConsumerFormatVersion, '17.0.0');
  assert.equal(manifest.artifacts.length, 44);
  for (const artifact of manifest.artifacts) assertPublicationPath(artifact.path);
  const expected = [manifestPath, ...manifest.artifacts.map(entry => `${releasePath}/${entry.path}`)].sort();
  assert.equal(new Set(expected).size, 45);
  assert.deepEqual([...snapshot.dataCommitFiles].sort(), expected, 'Data commit selection differs from pinned manifest');
  assert.deepEqual([...entries.keys()].filter(path => path.startsWith(`${releasePath}/`)).sort(), expected,
    'Additional release file outside the pinned manifest');
  for (const artifact of manifest.artifacts) {
    const entry = entries.get(`${releasePath}/${artifact.path}`);
    assert.equal(entry.sha256, artifact.sha256, `Manifest artifact hash differs: ${entry.path}`);
    assert.equal(entry.byteLength, artifact.byteLength, `Manifest artifact length differs: ${entry.path}`);
  }
  return { kind: 'mvp10PublicationSnapshotReadback', passed: true, releaseId, packageVersion: '0.10.0.0',
    sourcePreparationHead: sourceHead, fileCount: entries.size, totalBytes: snapshot.totalBytes,
    inventorySha256: snapshot.inventorySha256, verifiedReleaseAnchors: 5, verifiedDataFiles: 45,
    dataCommitHistoryRechecked: false, currentGitHeadRechecked: false, privateEvidenceRechecked: false,
    sourceLegalAuditReproduced: false, completeRepositoryInventoryClaimed: false,
    exactIsolatedExportInventoryVerified: false, historicalPublicationSnapshotsRevalidated: false,
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
async function inventory(repository, path) {
  const names = [];
  for (const entry of await readdir(resolve(repository, path), { withFileTypes: true })) {
    assert.ok(!entry.isSymbolicLink(), 'Symlink in actual inventory');
    const child = path ? `${path}/${entry.name}` : entry.name;
    assertPublicationPath(child);
    if (entry.isDirectory()) names.push(...await inventory(repository, child));
    else { assert.ok(entry.isFile(), 'Non-file in actual inventory'); names.push(child); }
  }
  return names;
}
export async function verifyMvp10Publication(repository = root) {
  const raw = await readRegular(repository, publicationPath);
  const snapshot = JSON.parse(raw);
  const entries = checkContract(snapshot);
  const files = new Map();
  for (const path of entries.keys()) files.set(path, await readRegular(repository, path));
  assert.deepEqual((await inventory(repository, releasePath)).sort(), [...snapshot.dataCommitFiles].sort(),
    'Missing or extra actual release file');
  return { ...validateMvp10Publication(snapshot, files), publicationManifestSha256: hashPublicationBytes(raw) };
}
// Imported explicit check for a separately prepared isolated export. Unlike the
// normal repository readback, this rejects every unlisted file anywhere in it.
// No original-repository fallback and no caller-supplied anchor overrides exist.
export async function verifyMvp10PublicationExport(repository) {
  assert.ok(typeof repository === 'string' && repository.length, 'Explicit isolated export root required');
  const result = await verifyMvp10Publication(repository);
  const raw = await readRegular(repository, publicationPath);
  assert.equal(hashPublicationBytes(raw), result.publicationManifestSha256, 'Publication manifest changed during export verification');
  const snapshot = JSON.parse(raw);
  assert.deepEqual((await inventory(repository, '')).sort(), [publicationPath, ...snapshot.files.map(x => x.path)].sort(),
    'Missing or extra isolated export file');
  return { ...result, exactIsolatedExportInventoryVerified: true };
}

// Historical MVP07 snapshots bind their own original bytes. This verifier does
// not re-evaluate them against later living-document changes or rewrite them.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    assert.equal(process.argv.length, 2, 'No write, alternate-root or authorization arguments accepted');
    console.log(JSON.stringify(await verifyMvp10Publication(), null, 2));
  } catch (error) {
    console.error(JSON.stringify({ kind: 'mvp10PublicationSnapshotReadback', passed: false,
      publicationPerformed: false, productionDeploymentPerformed: false, error: error.message }, null, 2));
    process.exitCode = 1;
  }
}
