// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { archiveAcceptance, safeRelative, sha256 } from '../../scripts/archive-ap23g1-acceptance.mjs';

async function fixture(t, { modifyProof = () => {}, modifyEvidence = () => {} } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'ap23g1-acceptance-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  async function file(path, value) {
    const bytes = Buffer.from(typeof value === 'string' ? value : JSON.stringify(value));
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), bytes);
    return { path, byteLength: bytes.length, sha256: sha256(bytes) };
  }
  const source = await file('docs/fach.md', 'accepted research document');
  const original = await file('proof/sources/canton/law.pdf', 'synthetic public legal source');
  const log = await file('proof/research-tests.txt', '36 tests passed, zero failed');
  const preservationObject = { status: 'accepted-baselines-preserved', productCodeChanged: false,
    productDataChanged: false, newCommitCreated: false, sourcePushPerformed: false, operatingChanges: false };
  const preservation = await file('proof/preservation.json', preservationObject);
  const reference = await file('proof/reference.json', { workPackage: 'AP23G1', status: 'passedResearchComparison',
    runtimeActive: false, legalApproval: false, discrepancies: [], paths: 1, referenceCases: 1 });
  const independent = await file('proof/independent.json', { workPackage: 'AP23G1', status: 'passedIndependentResearchComparison',
    runtimeActive: false, legalApproval: false, discrepancies: [], referenceComparisons: 1 });
  const evidenceObject = { status: 'research-evidence-and-calendar-comparison-passed', originalFilesInventoried: 1,
    fileInventory: [original], productCodeChanged: false, existingCalendarBytesChanged: false,
    legalApproval: false, operationalApproval: false };
  modifyEvidence(evidenceObject);
  const evidence = await file('proof/evidence.json', evidenceObject);
  const oldSource = await file('older/source.ts', 'accepted older source');
  const oldCandidate = await file('older/candidate.json', { old: true });
  const oldProof = await file('older/proof.json', { sourceBindings: [oldSource], evidence: [], candidateManifest: oldCandidate });
  const oldGuards = await file('older/guards.json', { files: { [oldSource.path]: oldSource.sha256 } });
  const oldExtra = await file('older/extra.json', {});
  await file(`older/archive/${oldSource.path}`, 'accepted older source');
  const oldReceipt = await file('older/archive/receipt.json', { artifacts: [oldSource] });
  const proofObject = { workPackage: 'AP23G1', status: 'research-completed-awaiting-human-acceptance',
    scopeConfirmedBy: 'David Steimer', referenceGroups: 1, referenceCases: 1,
    professionalAcceptance: false, formatDecision: false, runtimeActivation: false, productCodeChanged: false,
    acceptedLegalDataChanged: false, commitCreated: false, sourcePushPerformed: false,
    releaseBuildPerformed: false, operatingChanges: false, preservation: preservationObject,
    bindings: [source, preservation, reference, independent, evidence] };
  modifyProof(proofObject);
  const proof = await file('proof/completion.json', proofObject);
  return { root, file, source, original, log, preservation, reference, independent, evidence, proof, oldSource, oldCandidate,
    config: { target: 'archive/accepted', proofPath: proof.path, proofSha256: proof.sha256,
      bindingCount: proofObject.bindings.length, sourceCount: 1, groups: 1, cases: 1,
      evidencePath: evidence.path, referencePath: reference.path, independentPath: independent.path,
      preservationPath: preservation.path, sourcePrefix: 'proof/sources/', supplements: [log],
      upstream: { proof: oldProof, guards: [oldGuards, oldExtra], receipt: oldReceipt,
        bindings: 2, historical: 1, archivePayloads: 1 },
      acceptance: { kind: 'acceptedAP23G1Snapshot', accepted: true, professionalAcceptance: true,
        technicalContractApproved: false, runtimeActive: false, sourceReleaseApproved: false } } };
}

test('preflight does not write, focused copy remains autonomously verifiable after sources change', async t => {
  const f = await fixture(t);
  const before = await archiveAcceptance(f);
  assert.equal(before.mode, 'source-preflight-only');
  await assert.rejects(readFile(join(f.root, f.config.target, 'receipt.json')), { code: 'ENOENT' });
  const created = await archiveAcceptance({ ...f, write: true });
  assert.equal(created.mode, 'archive-created');
  assert.equal(created.files, 8);
  assert.equal(created.sourceFiles, 1);
  assert.deepEqual(created.previousF3NotRecopied, { bindings: 2, historical: 1, archivePayloads: 1 });
  await assert.rejects(readFile(join(f.root, f.config.target, f.oldSource.path)), { code: 'ENOENT' });
  await writeFile(join(f.root, f.source.path), 'later living document');
  await writeFile(join(f.root, f.original.path), 'later original source');
  await writeFile(join(f.root, f.oldSource.path), 'later product source');
  const verified = await archiveAcceptance(f);
  assert.equal(verified.mode, 'archive-reverified');
  assert.equal(verified.receiptSha256, created.receiptSha256);
  assert.equal((await readFile(join(f.root, f.config.target, f.source.path))).toString(), 'accepted research document');
});
for (const key of ['source', 'original', 'log', 'reference', 'independent', 'evidence', 'proof', 'oldSource', 'oldCandidate']) {
  test(`reject changed ${key} before creating archive`, async t => {
    const f = await fixture(t);
    await writeFile(join(f.root, f[key].path), 'changed bytes');
    await assert.rejects(archiveAcceptance({ ...f, write: true }), /SHA-256 mismatch/);
    await assert.rejects(readFile(join(f.root, f.config.target, 'receipt.json')), { code: 'ENOENT' });
  });
}
test('reject missing bound source', async t => {
  const f = await fixture(t);
  await rm(join(f.root, f.source.path));
  await assert.rejects(archiveAcceptance({ ...f, write: true }), { code: 'ENOENT' });
});
test('reject conflicting descriptor hashes', async t => {
  const f = await fixture(t, { modifyProof: p => p.bindings.push({ ...p.bindings[0], sha256: '0'.repeat(64) }) });
  await assert.rejects(archiveAcceptance({ ...f, write: true }), /Conflicting descriptor/);
});
test('reject conflicting descriptor lengths', async t => {
  const f = await fixture(t, { modifyProof: p => p.bindings.push({ ...p.bindings[0], byteLength: 999 }) });
  await assert.rejects(archiveAcceptance({ ...f, write: true }), /Conflicting length/);
});
test('reject duplicate original inventory', async t => {
  const f = await fixture(t, { modifyEvidence: e => { e.fileInventory.push(e.fileInventory[0]); e.originalFilesInventoried = 2; } });
  f.config.sourceCount = 2;
  await assert.rejects(archiveAcceptance({ ...f, write: true }), /Duplicate source inventory/);
});
test('reject original outside scoped source folder', async t => {
  const f = await fixture(t, { modifyEvidence: e => e.fileInventory[0].path = 'private/other.pdf' });
  await assert.rejects(archiveAcceptance({ ...f, write: true }), /Source file outside scoped inventory/);
});
test('reject unexpected binding count', async t => {
  const f = await fixture(t); f.config.bindingCount++;
  await assert.rejects(archiveAcceptance({ ...f, write: true }), /Unexpected binding inventory/);
});
test('reject unexpected source count', async t => {
  const f = await fixture(t); f.config.sourceCount++;
  await assert.rejects(archiveAcceptance({ ...f, write: true }));
});
test('reject an unbound research report', async t => {
  const f = await fixture(t); f.config.referencePath = 'unbound.json';
  await assert.rejects(archiveAcceptance({ ...f, write: true }), /Report is not bound/);
});
test('reject path escapes and ambiguous separators', () => {
  for (const p of ['../a', '/a', 'a/../b', './a', 'a//b', 'a\\b', 'C:/a', '', 'a\0b']) assert.throws(() => safeRelative(p));
  assert.equal(safeRelative('docs/fach.md'), 'docs/fach.md');
});
for (const type of ['file', 'directory']) test(`reject ${type} symlink`, async t => {
  const f = await fixture(t);
  if (type === 'file') {
    await f.file('other.md', 'accepted research document');
    await rm(join(f.root, f.source.path));
    await symlink('../other.md', join(f.root, f.source.path));
  } else {
    await f.file('other/fach.md', 'accepted research document');
    await rm(join(f.root, 'docs'), { recursive: true });
    await symlink('other', join(f.root, 'docs'));
  }
  await assert.rejects(archiveAcceptance({ ...f, write: true }), /Symlink not allowed/);
});
test('partial archive halts without repair', async t => {
  const f = await fixture(t);
  await mkdir(join(f.root, f.config.target), { recursive: true });
  await assert.rejects(archiveAcceptance({ ...f, write: true }), /Partial archive/);
});
test('archive payload change rejected without replacing it', async t => {
  const f = await fixture(t); await archiveAcceptance({ ...f, write: true });
  await writeFile(join(f.root, f.config.target, f.original.path), 'tampered archive bytes');
  await assert.rejects(archiveAcceptance({ ...f, write: true }), /SHA-256 mismatch/);
});
test('receipt tampering rejected', async t => {
  const f = await fixture(t); await archiveAcceptance({ ...f, write: true });
  await writeFile(join(f.root, f.config.target, 'receipt.json'), '{}');
  await assert.rejects(archiveAcceptance(f), /exact derived acceptance record/);
});
test('unexpected archive file rejected', async t => {
  const f = await fixture(t); await archiveAcceptance({ ...f, write: true });
  await f.file(`${f.config.target}/unexpected.txt`, 'not accepted');
  await assert.rejects(archiveAcceptance(f), /Unexpected archive files/);
});
test('archive symlink rejected', async t => {
  const f = await fixture(t); await archiveAcceptance({ ...f, write: true });
  await rm(join(f.root, f.config.target, f.source.path));
  await symlink(join(f.root, f.source.path), join(f.root, f.config.target, f.source.path));
  await assert.rejects(archiveAcceptance(f), /Symlink not allowed/);
});
test('repeated write only re-verifies complete archive', async t => {
  const f = await fixture(t), first = await archiveAcceptance({ ...f, write: true });
  const again = await archiveAcceptance({ ...f, write: true });
  assert.equal(again.mode, 'archive-reverified');
  assert.equal(again.receiptSha256, first.receiptSha256);
});
for (const [key, value] of [['workPackage', 'AP23G2'], ['status', 'accepted'], ['professionalAcceptance', true],
  ['formatDecision', true], ['runtimeActivation', true], ['productCodeChanged', true], ['acceptedLegalDataChanged', true],
  ['commitCreated', true], ['sourcePushPerformed', true], ['releaseBuildPerformed', true], ['operatingChanges', true]]) {
  test(`do not rewrite original proof boundary ${key}`, async t => {
    const f = await fixture(t, { modifyProof: p => { p[key] = value; } });
    await assert.rejects(archiveAcceptance({ ...f, write: true }));
  });
}
test('reject an unaccepted research comparison', async t => {
  const f = await fixture(t, { modifyEvidence: e => { e.legalApproval = true; } });
  await assert.rejects(archiveAcceptance({ ...f, write: true }));
});
test('reject mismatched preservation evidence', async t => {
  const f = await fixture(t, { modifyProof: p => { p.preservation = { ...p.preservation, newCommitCreated: true }; } });
  await assert.rejects(archiveAcceptance({ ...f, write: true }), /Preservation proof differs/);
});
