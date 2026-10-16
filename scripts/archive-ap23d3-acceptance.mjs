// SPDX-License-Identifier: AGPL-3.0-only
// Preserve the exact accepted proof. Never rewrite the historical QA status.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { lstat, mkdir, open, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const archiveConfig = Object.freeze({
  target: 'outputs/ap23d3-abnahme-2026-10-15',
  proofPath: 'outputs/ap23d3-2026-10-15/QA-AP23D3.json',
  proofSha256: '0794e536ce757964eb1e00fb5d65a5fd4fdf39a2ddcb730e6061e93b3d06f38a',
  reportPaths: [
    'outputs/ap23d3-2026-10-15/spfx-build.json',
    'outputs/ap23d3-2026-10-15/web-build.json'
  ],
  candidateManifest: 'outputs/ap23d2-candidate-2026-10-15/bundle/manifest.json',
  acceptance: {
    kind: 'acceptedAP23D3Snapshot',
    acceptedOn: '2026-10-15',
    acceptedBy: 'David Steimer',
    userStatement: 'AP23D3 ist fachlich-technisch abgenommen. Bitte starte die Releasevorbereitung.',
    accepted: true,
    sourceReleaseApproved: false,
    deployable: false,
    deployed: false,
    published: false,
    composition: 'Exact bytes bound by the accepted AP23D3 proof, its explicit build reports and the complete bound reference candidate. Historical status fields remain unchanged.',
    boundaries: [
      'No new source approval, approved data release, definitive release package, installation or publication.',
      'The local SPFx test package retains the existing version and must not be installed.',
      'The D2 acceptance receipt is retained as an upstream reference. Its complete archive remains separate.',
      'Protected directory digests remain historical evidence. No recursive workspace or private-data capture is performed.'
    ]
  }
});

export function safeRelative(path) {
  assert.equal(typeof path, 'string', 'Path must be a string');
  assert.ok(path.length && !path.startsWith('/') && !/[\\\x00:]/u.test(path), `Unsafe path: ${path}`);
  assert.ok(path.split('/').every(part => part && part !== '.' && part !== '..'), `Unsafe path: ${path}`);
  return path;
}

async function exists(path) {
  try { await lstat(path); return true; }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

async function noSymlinks(root, relative, { missing = false } = {}) {
  let path = root;
  const rootStat = await lstat(path);
  assert.ok(rootStat.isDirectory() && !rootStat.isSymbolicLink(), `Invalid root: ${root}`);
  const parts = safeRelative(relative).split('/');
  for (const [index, part] of parts.entries()) {
    path = resolve(path, part);
    let stat;
    try { stat = await lstat(path); }
    catch (error) { if (missing && error.code === 'ENOENT') return; throw error; }
    assert.ok(!stat.isSymbolicLink(), `Symlink not allowed: ${path}`);
    assert.ok(index === parts.length - 1 || stat.isDirectory(), `Not a directory: ${path}`);
  }
}

async function readExact(root, item) {
  await noSymlinks(root, item.path);
  const handle = await open(resolve(root, item.path), constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    assert.ok((await handle.stat()).isFile(), `Not a file: ${item.path}`);
    const bytes = await handle.readFile();
    assert.equal(sha256(bytes), item.sha256, `SHA-256 mismatch: ${item.path}`);
    if (item.byteLength !== undefined) assert.equal(bytes.length, item.byteLength, `Byte length mismatch: ${item.path}`);
    return bytes;
  } finally { await handle.close(); }
}

export async function archiveAcceptance({ root = process.cwd(), write = false, config = archiveConfig } = {}) {
  root = resolve(root);
  safeRelative(config.target);
  safeRelative(config.proofPath);
  await noSymlinks(root, config.target, { missing: true });
  const archiveRoot = resolve(root, config.target);
  const archiveExists = await exists(archiveRoot);
  if (archiveExists) {
    assert.ok(await exists(resolve(archiveRoot, 'receipt.json')), 'Partial archive without receipt: halt without overwriting');
  }
  // A completed archive is checked independently of subsequently changed living files.
  const inputRoot = archiveExists ? archiveRoot : root;
  const descriptors = new Map();
  const buffers = new Map();
  function add(item) {
    safeRelative(item.path);
    assert.match(item.sha256, /^[a-f0-9]{64}$/u, `Invalid hash: ${item.path}`);
    if (item.byteLength !== undefined) assert.ok(Number.isSafeInteger(item.byteLength) && item.byteLength >= 0, `Invalid length: ${item.path}`);
    const normalized = { path: item.path, sha256: item.sha256, ...(item.byteLength === undefined ? {} : { byteLength: item.byteLength }) };
    const prior = descriptors.get(item.path);
    if (prior) {
      assert.equal(prior.sha256, normalized.sha256, `Conflicting descriptor: ${item.path}`);
      if (prior.byteLength !== undefined && normalized.byteLength !== undefined) {
        assert.equal(prior.byteLength, normalized.byteLength, `Conflicting descriptor length: ${item.path}`);
      }
      if (prior.byteLength === undefined && normalized.byteLength !== undefined) descriptors.set(item.path, normalized);
    } else descriptors.set(item.path, normalized);
  }
  function collect(value) {
    if (!value || typeof value !== 'object') return;
    if (!Array.isArray(value) && typeof value.path === 'string' && typeof value.sha256 === 'string') add(value);
    for (const child of Object.values(value)) collect(child);
  }
  async function verifiedJson(path) {
    const item = descriptors.get(path);
    assert.ok(item, `Report is not bound by the proof: ${path}`);
    const bytes = await readExact(inputRoot, item);
    buffers.set(path, bytes);
    return JSON.parse(bytes);
  }
  add({ path: config.proofPath, sha256: config.proofSha256 });
  const proof = await verifiedJson(config.proofPath);
  assert.equal(proof.kind, 'ap23d3-local-integration-qa');
  assert.equal(proof.status, 'ready-for-technical-acceptance');
  assert.equal(proof.accepted, false, 'Historical proof must remain pre-acceptance');
  assert.equal(proof.deployable, false);
  assert.equal(proof.sourceReleaseApproved, false);
  collect(proof);
  // Only these explicitly named proof-bound reports may introduce further descriptors.
  for (const path of config.reportPaths) collect(await verifiedJson(path));
  const manifest = await verifiedJson(config.candidateManifest);
  assert.equal(manifest.releaseStatus, 'candidate');
  assert.equal(manifest.formatVersion, '8.0.0');
  for (const artifact of manifest.artifacts) {
    safeRelative(artifact.path);
    add({ ...artifact, path: `${dirname(config.candidateManifest)}/${artifact.path}` });
  }
  const verified = [];
  for (const item of [...descriptors.values()].sort((a, b) => a.path.localeCompare(b.path, 'en'))) {
    const bytes = buffers.get(item.path) ?? await readExact(inputRoot, item);
    // Recheck cached bytes against later duplicate descriptors too.
    assert.equal(sha256(bytes), item.sha256, item.path);
    if (item.byteLength !== undefined) assert.equal(bytes.length, item.byteLength, item.path);
    const full = { path: item.path, byteLength: bytes.length, sha256: item.sha256 };
    verified.push({ item: full, bytes });
  }
  const receipt = {
    ...config.acceptance,
    proof: { path: config.proofPath, sha256: config.proofSha256 },
    candidate: { manifest: config.candidateManifest, artifactCount: manifest.artifacts.length + 1, releaseId: manifest.releaseId },
    artifacts: verified.map(({ item }) => item)
  };
  const payload = Buffer.from(`${JSON.stringify(receipt, null, 2)}\n`);
  if (archiveExists) {
    await noSymlinks(archiveRoot, 'receipt.json');
    assert.deepEqual(await readFile(resolve(archiveRoot, 'receipt.json')), payload, 'Receipt is not the exact derived acceptance record');
  } else if (write) {
    // Every source has passed before any archive directory or file is created.
    await noSymlinks(root, config.target, { missing: true });
    await mkdir(dirname(archiveRoot), { recursive: true });
    await mkdir(archiveRoot); // EEXIST is a hard stop, including concurrent attempts.
    for (const { item, bytes } of verified) {
      await noSymlinks(archiveRoot, item.path, { missing: true });
      await mkdir(dirname(resolve(archiveRoot, item.path)), { recursive: true });
      await noSymlinks(archiveRoot, item.path, { missing: true });
      await writeFile(resolve(archiveRoot, item.path), bytes, { flag: 'wx' });
      await readExact(archiveRoot, item);
    }
    await writeFile(resolve(archiveRoot, 'receipt.json'), payload, { flag: 'wx' });
  }
  return { target: config.target, mode: archiveExists ? 'archive-reverified' : write ? 'archive-created' : 'source-preflight-only',
    files: verified.length, candidateFiles: manifest.artifacts.length + 1, verified: true,
    receiptSha256: sha256(payload), receiptByteLength: payload.length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.slice(2).every(arg => arg === '--write' || arg === '--check'), 'Only --write or --check are supported');
  assert.ok(!(process.argv.includes('--write') && process.argv.includes('--check')), 'Choose write or read-only check');
  console.log(JSON.stringify(await archiveAcceptance({ write: process.argv.includes('--write') }), null, 2));
}
