// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { archiveAcceptance, safeRelative, sha256 } from '../../scripts/archive-ap23e3-acceptance.mjs';

async function fixture(t, modifyProof = () => {}) {
  const root = await mkdtemp(join(tmpdir(), 'ap23e3-archive-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  async function file(path, bytes) {
    bytes = Buffer.from(bytes);
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), bytes);
    return { path, byteLength: bytes.length, sha256: sha256(bytes) };
  }
  const source = await file('src/a.ts', 'original source');
  const candidate = await file('candidate/data.json', '{"candidate":true}');
  const manifest = await file('candidate/manifest.json', JSON.stringify({ formatVersion: '9.0.0', releaseStatus: 'candidate', releaseId: 'reference.1', artifacts: [{ ...candidate, path: 'data.json' }] }));
  const log = await file('stage/initial.log', 'first run retained');
  const original = await file('stage/verification.json', '{"status":"failed"}');
  const report = await file('reports/build.json', JSON.stringify({ protectedBefore: [manifest], initialAttempt: { ...original, byteLength: undefined, logArtifact: log } }));
  const proof = { workPackage: 'AP23E3', status: 'passed', localOnly: true, humanAcceptance: 'pending', deployable: false, sourceReleaseApproved: false, inputs: [source], artifacts: [report] };
  modifyProof(proof);
  const proofDescriptor = await file('reports/qa.json', JSON.stringify(proof));
  return { root, file, source, config: { target: 'archive/accepted', proofPath: proofDescriptor.path, proofSha256: proofDescriptor.sha256, reportPaths: ['reports/build.json'], candidateManifest: manifest.path, acceptance: { accepted: true, sourceReleaseApproved: false } } };
}

test('read-only by default, full transitive copy, independent immutable re-verification', async t => {
  const f = await fixture(t);
  const preflight = await archiveAcceptance(f);
  assert.equal(preflight.mode, 'source-preflight-only');
  assert.equal(preflight.files, 7);
  assert.equal(preflight.candidateFiles, 2);
  await assert.rejects(readFile(join(f.root, f.config.target, 'receipt.json')), { code: 'ENOENT' });
  const created = await archiveAcceptance({ ...f, write: true });
  assert.equal(created.mode, 'archive-created');
  await writeFile(join(f.root, 'src/a.ts'), 'living source later changed');
  const checked = await archiveAcceptance(f);
  assert.equal(checked.mode, 'archive-reverified');
  assert.equal(checked.receiptSha256, created.receiptSha256);
  assert.equal((await readFile(join(f.root, f.config.target, 'src/a.ts'))).toString(), 'original source');
});

for (const fault of ['corruption', 'missing']) test(`reject source ${fault} before archive creation`, async t => {
  const f = await fixture(t);
  if (fault === 'corruption') await writeFile(join(f.root, f.source.path), 'changed');
  else await rm(join(f.root, f.source.path));
  await assert.rejects(archiveAcceptance({ ...f, write: true }));
  await assert.rejects(readFile(join(f.root, f.config.target, 'receipt.json')), { code: 'ENOENT' });
});

test('reject conflicting repeated descriptors', async t => {
  const f = await fixture(t, proof => proof.inputs.push({ ...proof.inputs[0], sha256: '0'.repeat(64) }));
  await assert.rejects(archiveAcceptance({ ...f, write: true }), /Conflicting descriptor/);
});

test('reject path escapes, absolute paths and platform separator ambiguity', () => {
  for (const path of ['../a', '/a', 'a/../b', './a', 'a//b', 'a\\b', 'C:/a', '', 'a\0b']) assert.throws(() => safeRelative(path));
  assert.equal(safeRelative('.work/stage/a.js'), '.work/stage/a.js');
});

for (const kind of ['file', 'directory']) test(`reject ${kind} symlink`, async t => {
  const f = await fixture(t);
  if (kind === 'file') {
    await f.file('other.ts', 'original source');
    await rm(join(f.root, 'src/a.ts'));
    await symlink('../other.ts', join(f.root, 'src/a.ts'));
  } else {
    await f.file('other/a.ts', 'original source');
    await rm(join(f.root, 'src'), { recursive: true });
    await symlink('other', join(f.root, 'src'));
  }
  await assert.rejects(archiveAcceptance({ ...f, write: true }), /Symlink not allowed/);
});

test('partial archive is a hard stop, never silently repaired', async t => {
  const f = await fixture(t);
  await mkdir(join(f.root, f.config.target), { recursive: true });
  await assert.rejects(archiveAcceptance({ ...f, write: true }), /Partial archive/);
});

test('archive corruption fails even when original source is intact', async t => {
  const f = await fixture(t);
  await archiveAcceptance({ ...f, write: true });
  await writeFile(join(f.root, f.config.target, f.source.path), 'tampered archive');
  await assert.rejects(archiveAcceptance(f), /SHA-256 mismatch/);
});

test('modified acceptance receipt is rejected', async t => {
  const f = await fixture(t);
  await archiveAcceptance({ ...f, write: true });
  await writeFile(join(f.root, f.config.target, 'receipt.json'), '{}');
  await assert.rejects(archiveAcceptance(f), /exact derived acceptance record/);
});

for (const [field, value] of [
  ['workPackage', 'AP23D3'],
  ['status', 'failed'],
  ['localOnly', false],
  ['humanAcceptance', 'accepted'],
  ['sourceReleaseApproved', true],
  ['deployable', true]
]) test(`reject changed historical proof boundary ${field}`, async t => {
  const f = await fixture(t, proof => { proof[field] = value; });
  await assert.rejects(archiveAcceptance({ ...f, write: true }));
  await assert.rejects(readFile(join(f.root, f.config.target, 'receipt.json')), { code: 'ENOENT' });
});

test('reject explicit build report that is not bound by the proof', async t => {
  const f = await fixture(t);
  f.config.reportPaths.push('unbound-report.json');
  await assert.rejects(archiveAcceptance(f), /Report is not bound/);
});

test('reject source inventory counts inconsistent with bound contract', async t => {
  const f = await fixture(t);
  f.config.proofInputCount = 2;
  await assert.rejects(archiveAcceptance(f), /Unexpected input inventory/);
});

test('reject candidate inventory counts inconsistent with bound contract', async t => {
  const f = await fixture(t);
  f.config.candidateArtifactCount = 3;
  await assert.rejects(archiveAcceptance(f), /Unexpected candidate inventory/);
});

test('completed archive verification rejects an archived symlink', async t => {
  const f = await fixture(t);
  await archiveAcceptance({ ...f, write: true });
  await rm(join(f.root, f.config.target, f.source.path));
  await symlink(join(f.root, f.source.path), join(f.root, f.config.target, f.source.path));
  await assert.rejects(archiveAcceptance(f), /Symlink not allowed/);
});

