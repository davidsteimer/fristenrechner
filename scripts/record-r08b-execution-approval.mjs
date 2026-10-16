// SPDX-License-Identifier: AGPL-3.0-only
// Records the separately authorized LOCAL R08-B execution. Never promotes or builds.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, prefix, hash, encode } from './consolidate-mvp08-sources.mjs';
import { readRegular, writeExclusive } from './record-mvp08-source-approval.mjs';
import { prepareProposal, proposalPath, documentPath, baseHead } from './prepare-r08b-proposal.mjs';

export const executionApprovalPath = `${prefix}/r08b-execution-approval.json`;
export const executionDecisionPath = 'docs/betrieb/freigabe-r08-b.md';
export const declaration = 'Ich gebe R08-B gemäss der vorgelegten Fassung frei, einschliesslich des begrenzten lokalen Datencommits und des lokalen Recovery-Baus. Installation, Uploads, zusätzliche Commits, GitHub-Push und Betriebsfreigaben bleiben ausgeschlossen.';
export const executionPermissions = Object.freeze({ localDataPromotionAuthorized: true, definitiveLocalBuildAuthorized: true,
  localRuntimeDataCommitAuthorized: true, localRecoveryBuildAuthorized: true, installationAuthorized: false,
  uploadAuthorized: false, additionalCommitsAuthorized: false, publicationAuthorized: false,
  recoveryExecutionAuthorized: false, operatingApproval: false, outlookImportsAuthorized: false,
  m365PermissionChangesAuthorized: false, hostingChangesAuthorized: false });
const expectedProposal = 'c49dfa88522dc75f97d70d141a757dfd0430352bc6a90a3891ebfe61094fed1f';
const expectedDocument = '3c4aef7378230118012826f75804f95967c95854261591adaf9f2b221211ac7d';
const bind = async path => { const bytes = await readRegular(root, path); return { path, byteLength: bytes.length, sha256: hash(bytes) }; };
export async function requireR08BApproval() {
  const bytes = await readRegular(root, executionApprovalPath);
  const record = JSON.parse(bytes);
  assert.equal(record.declaration, declaration);
  assert.equal(record.approvedBy, 'David Steimer');
  assert.equal(record.status, 'approved-local-execution-only');
  assert.deepEqual(record.permissions, executionPermissions);
  assert.equal(record.sourceApproval.sha256, '53a7f9e8b304c2552e89dc6fa4787b178170bde31aaf55100f5aed55cd995026');
  for (const entry of [record.proposal, record.document, record.decision, record.sourceApproval]) assert.deepEqual(await bind(entry.path), entry);
  assert.equal(record.proposal.sha256, expectedProposal);
  assert.equal(record.document.sha256, expectedDocument);
  assert.ok((await readRegular(root, executionDecisionPath)).toString().includes(`> ${declaration}`));
  const proposal = JSON.parse(await readRegular(root, proposalPath));
  assert.deepEqual(record.singleLocalDataCommit, proposal.plannedSingleLocalDataCommit);
  assert.equal(record.singleLocalDataCommit.baseHead, baseHead);
  assert.equal(record.singleLocalDataCommit.onlyPaths.length, 42);
  for (const item of record.beforeInputs) {
    const original = await readRegular(root, item.archivedAt);
    assert.equal(hash(original), item.sha256, item.path);
    assert.equal(original.length, item.byteLength);
  }
  return { path: executionApprovalPath, sha256: hash(bytes), record };
}
async function recordApproval() {
  if (await readRegular(root, executionApprovalPath, true)) return requireR08BApproval();
  await prepareProposal(false);
  const proposal = JSON.parse(await readRegular(root, proposalPath));
  const paths = new Map([...proposal.protectedInputs, ...proposal.currentInputs].map(item => [item.path, item]));
  const beforeInputs = [];
  for (const item of [...paths.values()].sort((a,b) => a.path.localeCompare(b.path, 'en'))) {
    const original = await readRegular(root, item.path);
    assert.equal(hash(original), item.sha256);
    const archivedAt = `${prefix}/r08b-before-inputs/${item.path}`;
    await writeExclusive(root, archivedAt, original);
    beforeInputs.push({ ...item, archivedAt });
  }
  const record = { approvalId: 'R08-B-EXECUTION-20261015', approvedOn: '2026-10-15', approvedBy: 'David Steimer',
    status: 'approved-local-execution-only', declaration, permissions: executionPermissions,
    proposal: await bind(proposalPath), document: await bind(documentPath), decision: await bind(executionDecisionPath),
    sourceApproval: await bind(`${prefix}/source-approval.json`), singleLocalDataCommit: proposal.plannedSingleLocalDataCommit,
    versions: proposal.proposedVersions, beforeInputs };
  await writeExclusive(root, executionApprovalPath, encode(record));
  return requireR08BApproval();
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--write'));
  const result = await (process.argv[2] === '--write' ? recordApproval() : requireR08BApproval());
  console.log(JSON.stringify({ path: result.path, sha256: result.sha256, permissions: result.record.permissions, beforeInputs: result.record.beforeInputs.length }, null, 2));
}
