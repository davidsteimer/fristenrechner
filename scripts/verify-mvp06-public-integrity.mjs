// SPDX-License-Identifier: AGPL-3.0-only
// Public, read-only integrity verification. This is NOT the private source audit
// and must never replace verifyMvp06SourceApproval in a promotion/write gate.
import assert from 'node:assert/strict';
import { readFile, lstat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, approvalPath, completenessPath, decisionPath, declaration, hash,
  permissions, scope, requiredBindings, releaseId } from './verify-mvp06-source-approval.mjs';
import { assertSafeEvidencePath } from './prepare-mvp06-inputs.mjs';

export const approvalSha256 = '10f43005757c54a445f009d702b17a37f04e2dad530241201dbf6c4eebfc2cbb';
export const manifestPath = `data/releases/${releaseId}/manifest.json`;
export const manifestSha256 = '637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724';
export const isPrivateEvidence = item => [item.path, item.resolvedPath].filter(Boolean)
  .some(path => path.split('/').includes('.work'));

async function readPublicFile(repositoryRoot, path) {
  assertSafeEvidencePath(path);
  assert.ok(!path.split('/').includes('.work'), 'Public verification cannot open private evidence');
  const parts = path.split('/');
  for (let index = 1; index <= parts.length; index++) {
    const stat = await lstat(resolve(repositoryRoot, ...parts.slice(0, index)));
    assert.ok(!stat.isSymbolicLink() && (index === parts.length ? stat.isFile() : stat.isDirectory()),
      `Not regular public evidence: ${path}`);
  }
  return readFile(resolve(repositoryRoot, path));
}

export function validateMvp06PublicIntegrity(approvalBytes, files, manifestBytes) {
  // Pin BEFORE trusting paths or deciding which evidence is private.
  assert.equal(hash(approvalBytes), approvalSha256, 'Changed exact human approval');
  assert.equal(hash(manifestBytes), manifestSha256, 'Changed exact approved manifest');
  const approval = JSON.parse(approvalBytes), manifest = JSON.parse(manifestBytes);
  assert.equal(approval.declaration, declaration);
  assert.equal(approval.decisionRef, decisionPath);
  assert.equal(approval.recordStatus, 'approved');
  assert.deepEqual(approval.permissions, permissions);
  assert.deepEqual(approval.scope, scope);
  assert.equal(manifest.releaseId, releaseId);
  assert.equal(manifest.releaseStatus, 'approved');
  assert.deepEqual(manifest.extensions['steimer.approval'].sourceReviewRef,
    { reviewId: approval.reviewId, sha256: approvalSha256 });
  const evidence = new Map(approval.evidence.map(item => [item.path, item]));
  assert.equal(evidence.size, 170);
  const publicEvidence = approval.evidence.filter(item => !isPrivateEvidence(item));
  assert.equal(publicEvidence.length, 63);
  assert.equal(approval.evidence.filter(isPrivateEvidence).length, 107);
  assert.deepEqual([...files.keys()].sort(), publicEvidence.map(item => item.path).sort(),
    'Public evidence must be the exact non-private approval closure');
  for (const item of publicEvidence) {
    assertSafeEvidencePath(item.path);
    assertSafeEvidencePath(item.resolvedPath ?? item.path);
    assert.equal(hash(files.get(item.path)), item.sha256, `Changed public evidence: ${item.path}`);
    assert.equal(files.get(item.path).length, item.byteLength, `Changed public evidence length: ${item.path}`);
  }
  for (const [path, sha256] of Object.entries(requiredBindings)) {
    assert.equal(evidence.get(path)?.sha256, sha256, `Missing required approval binding: ${path}`);
    assert.ok(files.has(path), `Required decision evidence is not public: ${path}`);
  }
  assert.ok(files.get(decisionPath).toString().includes(`> ${declaration}`));
  const report = JSON.parse(files.get(completenessPath));
  assert.equal(report.recordStatus, 'candidate');
  assert.equal(report.evidence.length, 166);
  for (const item of report.evidence) assert.deepEqual(evidence.get(item.path), item);
  assert.deepEqual(approval.retainedLimits, report.retainedLimits);
  for (const key of ['humanApproval', 'dataPromotionApproved', 'productionActivation']) assert.equal(report[key], false);
  return { status: 'passed', verificationScope: 'public-integrity', releaseId,
    approvalSha256, manifestSha256, recordedHumanApprovalIntact: true,
    publicEvidenceFilesVerified: 63, privateEvidenceFilesBoundButNotRechecked: 107,
    privateRawEvidenceRechecked: false, completeSourceAuditReproduced: false,
    newApprovalGranted: false, promotionPerformed: false, installationAuthorized: false,
    publicationAuthorized: false, operatingApproval: false };
}

export async function loadMvp06PublicIntegrityInputs(repositoryRoot = root) {
  const approvalBytes = await readPublicFile(repositoryRoot, approvalPath);
  assert.equal(hash(approvalBytes), approvalSha256, 'Changed exact human approval');
  const approval = JSON.parse(approvalBytes);
  const files = new Map();
  for (const item of approval.evidence.filter(item => !isPrivateEvidence(item)))
    files.set(item.path, await readPublicFile(repositoryRoot, item.resolvedPath ?? item.path));
  return { approvalBytes, files, manifestBytes: await readPublicFile(repositoryRoot, manifestPath) };
}

export async function verifyMvp06PublicIntegrity(repositoryRoot = root) {
  const { approvalBytes, files, manifestBytes } = await loadMvp06PublicIntegrityInputs(repositoryRoot);
  return validateMvp06PublicIntegrity(approvalBytes, files, manifestBytes);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 2, 'No promotion, publication or alternate-scope arguments accepted');
  console.log(JSON.stringify(await verifyMvp06PublicIntegrity(), null, 2));
}
