// SPDX-License-Identifier: AGPL-3.0-only
// Records the human R08-A2 decision only. No promotion, product build or Git writes.
import assert from 'node:assert/strict';
import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSafeRelativePath } from './prepare-mvp07-inputs.mjs';
import { root, prefix, resultPath, candidatePath, hash, encode } from './consolidate-mvp08-sources.mjs';

export const approvalPath = `${prefix}/source-approval.json`;
export const archivePrefix = `${prefix}/source-approval-inputs`;
const qaPath = `${prefix}/source-review-verification.json`;
const decisionPath = 'docs/fachrecht/abnahme-quellen-mvp08.md';
export const declaration = 'Ich nehme R08-A2 für MVP 0.8 einschliesslich der begründeten Wiederverwendung, der neuen Fassungsbefunde und der fortbestehenden Vorbehalte ab. Bitte bereite die konkrete Übernahme- und Buildvorlage R08-B vor.';
export const permissions = Object.freeze({ sourceReviewApproved: true, buildProposalPreparationAuthorized: true,
  localDataPromotionAuthorized: false, definitiveLocalBuildAuthorized: false, localCommitAuthorized: false,
  installationAuthorized: false, publicationAuthorized: false, hostingChangesAuthorized: false,
  operatingApproval: false, m365PermissionChangesAuthorized: false, testAppCleanupAuthorized: false });
const required = {
  [resultPath]: 'e0c1012036fe1ddda95ab660d1153b203de19e8a75d9d6245da78d60e4796c66',
  [qaPath]: '487744ce4462f247efbb53079b1a605c02628daebae768123bcb16860ccd768f',
  [candidatePath]: 'ccb67c22e55737af064f8c9ef7b122db8c5dfe1f4a1f142eb77cd05fd5ac646d',
  'docs/fachrecht/quellenabgleich-mvp08.md': 'edc5e050df1fc81d1160a7e3d1a2e615690dc0bf5a6d97c12311070b8b71be0e',
  [decisionPath]: 'dee8557877548c396c1b51767e46521c17d5f4a74a8df77bd31f35e0462dad73'
};
export async function readRegular(repositoryRoot, path, optional = false) {
  assertSafeRelativePath(path);
  const parts = path.split('/');
  for (let i = 1; i <= parts.length; i++) {
    let stat;
    try { stat = await lstat(resolve(repositoryRoot, parts.slice(0, i).join('/'))); }
    catch (error) { if (optional && error.code === 'ENOENT') return undefined; throw error; }
    assert.ok(!stat.isSymbolicLink() && (i === parts.length ? stat.isFile() : stat.isDirectory()), path);
  }
  return readFile(resolve(repositoryRoot, path));
}
export async function writeExclusive(repositoryRoot, path, bytes) {
  assertSafeRelativePath(path);
  const parts = path.split('/');
  for (let i = 1; i < parts.length; i++) {
    const parent = resolve(repositoryRoot, parts.slice(0, i).join('/'));
    try { await mkdir(parent); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = await lstat(parent);
    assert.ok(stat.isDirectory() && !stat.isSymbolicLink());
  }
  const old = await readRegular(repositoryRoot, path, true);
  if (old) { assert.deepEqual(old, bytes, `Refusing overwrite: ${path}`); return; }
  await writeFile(resolve(repositoryRoot, path), bytes, { flag: 'wx' });
  assert.deepEqual(await readRegular(repositoryRoot, path), bytes);
}
export async function loadApprovalInputs(repositoryRoot = root, useArchive = true) {
  const files = new Map();
  for (const [path, sha256] of Object.entries(required)) {
    const bytes = await readRegular(repositoryRoot, path);
    assert.equal(hash(bytes), sha256, `Changed accepted input: ${path}`);
    files.set(path, bytes);
  }
  const report = JSON.parse(files.get(resultPath)), qa = JSON.parse(files.get(qaPath));
  assert.equal(report.humanApproval, false);
  assert.equal(report.counts.sourceIds, 243);
  assert.equal(qa.tests.passed, 44);
  assert.ok(files.get(decisionPath).toString().includes(`> ${declaration}`));
  const archived = new Set([...qa.bindings.map(item => item.path), qaPath]);
  const unique = new Map();
  for (const item of [...report.evidence, ...qa.bindings,
    ...Object.entries(required).map(([path, sha256]) => ({ path, sha256 }))]) {
    assertSafeRelativePath(item.path);
    if (unique.has(item.path)) assert.equal(unique.get(item.path).sha256, item.sha256);
    unique.set(item.path, { path: item.path, sha256: item.sha256 });
  }
  const bindings = [...unique.values()].sort((a, b) => a.path.localeCompare(b.path, 'en'));
  for (const item of bindings) {
    if (archived.has(item.path)) item.archivedAt = `${archivePrefix}/${item.path}`;
    const bytes = await readRegular(repositoryRoot, useArchive && item.archivedAt ? item.archivedAt : item.path);
    assert.equal(hash(bytes), item.sha256, `Changed evidence: ${item.path}`);
    item.byteLength = bytes.length;
    files.set(item.path, bytes);
  }
  return { files, bindings };
}
export function makeSourceApproval({ files, bindings }) {
  const report = JSON.parse(files.get(resultPath));
  for (const item of bindings) assert.equal(hash(files.get(item.path)), item.sha256);
  return { formatVersion: '1.0.0', dataKind: 'sourceReviewApproval',
    approvalId: '2026-10-15-mvp-08-source-approval.1', approvedOn: '2026-10-15', approvedBy: 'David Steimer',
    recordStatus: 'approved', declaration, decisionRef: decisionPath, candidateReleaseId: report.candidateReleaseId,
    permissions, scope: { ...report.counts, ...report.normChangeCounts, allOriginalsFreshlyRead: false,
      additionalCasesApproved: false, administrativePaths: 12, administrativeCoverage: { from: '2026-08-29', to: '2027-12-31' },
      socialRules: 44, socialBindings: 50, socialOperativeCantons: ['BE'], socialCoverage: { from: '2026-01-01', to: '2027-12-31' } },
    acceptedNormBridges: report.newNormBridges, retainedVersionBridges: report.retainedVersionBridges,
    retainedLimits: report.limits, acceptedSourceIds: report.coverage.map(row => row.sourceId),
    explicitBoundedReuse: { vaudConsolidatedNormEvidenceDate: '2026-10-08', aiTreatmentUnchanged: true,
      frPracticeSupportingMirrorOnly: true, frPracticePositiveApproval: false,
      newFederalConsolidationsNotClaimedAvailable: true, glGovernmentNoticeFreshRetrievalFailed: true },
    responsibility: { humanDecisionBy: 'David Steimer', operatingModel: 'personalUnion', formalFourEyes: false, documentedWith: 'Codex' },
    nextGate: 'Separate authorization for controlled local data promotion, bounded local data commit and definitive local builds.',
    evidence: bindings };
}
export function validateSourceApproval(approval, inputs) {
  assert.deepEqual(approval, makeSourceApproval(inputs), 'Changed decision, scope, authority or evidence');
  return { approvalId: approval.approvalId, evidenceFiles: approval.evidence.length,
    archivedInputs: approval.evidence.filter(item => item.archivedAt).length, permissions };
}
export async function verifySourceApproval(repositoryRoot = root) {
  const bytes = await readRegular(repositoryRoot, approvalPath);
  const inputs = await loadApprovalInputs(repositoryRoot, true);
  return { ...validateSourceApproval(JSON.parse(bytes), inputs), approvalSha256: hash(bytes) };
}
export async function recordSourceApproval(repositoryRoot = root) {
  if (await readRegular(repositoryRoot, approvalPath, true)) return verifySourceApproval(repositoryRoot);
  const inputs = await loadApprovalInputs(repositoryRoot, false);
  const approval = makeSourceApproval(inputs);
  for (const item of approval.evidence.filter(item => item.archivedAt)) {
    await writeExclusive(repositoryRoot, item.archivedAt, inputs.files.get(item.path));
  }
  await writeExclusive(repositoryRoot, approvalPath, encode(approval));
  return verifySourceApproval(repositoryRoot);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--write'));
  console.log(JSON.stringify(await (process.argv[2] === '--write' ? recordSourceApproval() : verifySourceApproval()), null, 2));
}
