// SPDX-License-Identifier: AGPL-3.0-only
// Records the separately authorized LOCAL R09-B execution. Never promotes or builds.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, prefix, hash, encode } from './consolidate-mvp09-sources.mjs';
import { readRegular, writeExclusive } from './record-mvp09-source-approval.mjs';
import { prepareProposal, proposalPath, documentPath, baseHead } from './prepare-r09b-proposal.mjs';

export const executionApprovalPath = `${prefix}/r09b-execution-approval.json`;
export const executionDecisionPath = 'docs/betrieb/freigabe-r09-b.md';
export const declaration = 'Ich gebe R09-B gemäss der vorgelegten Fassung frei, einschliesslich des begrenzten lokalen Datencommits und des Recovery-Baus. Bitte starte die Umsetzung. Installation, Uploads und GitHub-Push bleiben ausgeschlossen.';
export const executionPermissions = Object.freeze({ localDataPromotionAuthorized: true, definitiveLocalBuildAuthorized: true,
  localRuntimeDataCommitAuthorized: true, localRecoveryBuildAuthorized: true, installationAuthorized: false,
  uploadAuthorized: false, additionalCommitsAuthorized: false, publicationAuthorized: false,
  recoveryExecutionAuthorized: false, operatingApproval: false, outlookImportsAuthorized: false,
  m365PermissionChangesAuthorized: false, hostingChangesAuthorized: false });
const expectedProposal = 'e33af4e76868320a745b4c92d9ca2e8ddd62c0540159288351aabaad7febf4d0';
const expectedDocument = 'ae07aad03175495631c2b5d600af0543695fa2ab26b642583874d17d72a51efa';
const bind = async path => { const bytes = await readRegular(root, path); return { path, byteLength: bytes.length, sha256: hash(bytes) }; };
export async function requireR09BApproval() {
  const bytes = await readRegular(root, executionApprovalPath);
  const record = JSON.parse(bytes);
  assert.equal(record.declaration, declaration);
  assert.equal(record.approvedBy, 'David Steimer');
  assert.equal(record.status, 'approved-local-execution-only');
  assert.deepEqual(record.permissions, executionPermissions);
  assert.equal(record.sourceApproval.sha256, '4a05e80c0324573f83c88463ba78d20970d0d2152b76f15766bd848bc13a9c68');
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
  if (await readRegular(root, executionApprovalPath, true)) return requireR09BApproval();
  await prepareProposal(false);
  const proposal = JSON.parse(await readRegular(root, proposalPath));
  const paths = new Map([...proposal.protectedInputs, ...proposal.currentInputs].map(item => [item.path, item]));
  const beforeInputs = [];
  for (const item of [...paths.values()].sort((a,b) => a.path.localeCompare(b.path, 'en'))) {
    const original = await readRegular(root, item.path);
    assert.equal(hash(original), item.sha256);
    const archivedAt = `${prefix}/r09b-before-inputs/${item.path}`;
    await writeExclusive(root, archivedAt, original);
    beforeInputs.push({ ...item, archivedAt });
  }
  const record = { approvalId: 'R09-B-EXECUTION-20261018', approvedOn: '2026-10-18', approvedBy: 'David Steimer',
    status: 'approved-local-execution-only', declaration, permissions: executionPermissions,
    proposal: await bind(proposalPath), document: await bind(documentPath), decision: await bind(executionDecisionPath),
    sourceApproval: await bind(`${prefix}/source-approval.json`), singleLocalDataCommit: proposal.plannedSingleLocalDataCommit,
    versions: proposal.proposedVersions, beforeInputs };
  await writeExclusive(root, executionApprovalPath, encode(record));
  return requireR09BApproval();
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--write'));
  const result = await (process.argv[2] === '--write' ? recordApproval() : requireR09BApproval());
  console.log(JSON.stringify({ path: result.path, sha256: result.sha256, permissions: result.record.permissions, beforeInputs: result.record.beforeInputs.length }, null, 2));
}
