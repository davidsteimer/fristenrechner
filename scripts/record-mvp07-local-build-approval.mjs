// SPDX-License-Identifier: AGPL-3.0-only
// Append-only record of the additional human R07-B authority, never a deployment.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyMvp07SourceApproval } from './record-mvp07-source-approval.mjs';
export const root = fileURLToPath(new URL('../', import.meta.url));
export const prefix = 'outputs/release-mvp07-2026-10-08';
export const approvalPath = `${prefix}/local-build-approval.json`;
export const decisionPath = 'docs/betrieb/freigabe-r07-b.md';
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export async function verifyLocalBuildAuthority(repository = root) {
  await verifyMvp07SourceApproval(repository);
  const source = await readFile(resolve(repository, `${prefix}/source-approval.json`));
  assert.equal(hash(source), '478ca3d20ea1d643bb05379f8acc042560fa9547575d62e5d7afd4c8c1213810');
  const decision = await readFile(resolve(repository, decisionPath));
  assert.ok(decision.toString().includes('«Ich gebe R07-B frei.»'));
  const expected = { kind: 'mvp07LocalBuildApproval', approvalId: '2026-10-08-mvp-07-local-build-approval.1',
    approvedBy: 'David Steimer', approvedOn: '2026-10-08', declaration: 'Ich gebe R07-B frei.',
    sourceApproval: { path: `${prefix}/source-approval.json`, sha256: hash(source) },
    decision: { path: decisionPath, sha256: hash(decision) },
    candidateManifestSha256: 'b290ece2d105c606b3de8154edade57fcbaf2ff978e42b05b08561fb1c40a0f6',
    permissions: { localDataPromotionAuthorized: true, definitiveLocalBuildAuthorized: true,
      localRuntimeDataCommitAuthorized: true, installationAuthorized: false, publicationAuthorized: false,
      hostingChangesAuthorized: false, operatingApproval: false, m365PermissionChangesAuthorized: false,
      outlookChangesAuthorized: false, testAppCleanupAuthorized: false } };
  return expected;
}
export async function requireLocalBuildApproval(repository = root) {
  const expected = await verifyLocalBuildAuthority(repository);
  const bytes = await readFile(resolve(repository, approvalPath));
  assert.deepEqual(JSON.parse(bytes), expected, 'R07-B receipt differs from the bounded human authority');
  return { approval: expected, sha256: hash(bytes) };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--write'));
  if (process.argv[2] === '--write') {
    const bytes = Buffer.from(JSON.stringify(await verifyLocalBuildAuthority(), null, 2) + '\n');
    try { await writeFile(resolve(root, approvalPath), bytes, { flag: 'wx' }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
  console.log(JSON.stringify(await requireLocalBuildApproval()));
}
