// SPDX-License-Identifier: AGPL-3.0-only
// Preserve actual local check receipts and logs. This is not deployment authority.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { requireLocalBuildApproval, root, prefix, hash } from './record-mvp07-local-build-approval.mjs';
import { verifyMvp07Governance } from './adopt-mvp07-source-governance.mjs';

const args = process.argv.slice(2);
assert.ok(args.length >= 2, 'Provide passed product and governance receipt paths, then any failed preliminary receipts');
await requireLocalBuildApproval();
await verifyMvp07Governance(root);
const output = `${prefix}/local-check-evidence`;
const binding = async path => {
  const bytes = await readFile(resolve(root, path));
  return { path, sha256: hash(bytes), byteLength: bytes.length };
};
async function seal(path, bytes) {
  const target = resolve(root, path);
  await mkdir(dirname(target), { recursive: true });
  try { await writeFile(target, bytes, { flag: 'wx' }); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    assert.deepEqual(await readFile(target), bytes, `Existing evidence differs: ${path}`);
  }
  return binding(path);
}
async function archiveRun(path, expectedScope, expectedPassed) {
  assert.match(path, /^\.work\/mvp07-(product|governance)-checks-[A-Za-z0-9]+\/verification\.json$/);
  const bytes = await readFile(resolve(root, path));
  const receipt = JSON.parse(bytes);
  assert.equal(receipt.scope, expectedScope);
  assert.equal(receipt.passed, expectedPassed);
  assert.equal(receipt.releaseId, '2026-10-08-mvp-07-approved.1');
  if (expectedPassed) {
    assert.equal(receipt.steps.length, expectedScope === 'product' ? 5 : 7);
    assert.ok(receipt.steps.every(step => step.exitCode === 0));
  }
  const destination = `${output}/${basename(dirname(path))}`;
  const logs = [];
  for (const step of receipt.steps) {
    assert.equal(dirname(step.log), dirname(path));
    const content = await readFile(resolve(root, step.log));
    assert.equal(hash(content), step.sha256);
    assert.equal(content.length, step.byteLength);
    logs.push({ step: step.id, exitCode: step.exitCode,
      ...(step.nodeCounts ? { nodeCounts: step.nodeCounts } : {}),
      ...(step.pythonTests ? { pythonTests: step.pythonTests } : {}),
      archive: await seal(`${destination}/${basename(step.log)}`, content) });
  }
  return { scope: receipt.scope, passed: receipt.passed, original: await binding(path),
    archivedReceipt: await seal(`${destination}/verification.json`, bytes), logs };
}
const product = await archiveRun(args[0], 'product', true);
const governance = await archiveRun(args[1], 'governance', true);
const preliminary = [];
for (const path of args.slice(2)) preliminary.push(await archiveRun(path, path.includes('-product-') ? 'product' : 'governance', false));
const artifactReport = JSON.parse(await readFile(resolve(root, `${prefix}/artifact-verification.json`)));
const correction = JSON.parse(await readFile(resolve(root, `${prefix}/artifact-verifier-correction.json`)));
assert.equal(artifactReport.status, 'passed');
assert.equal(correction.status, 'passed');
assert.equal((await binding(`${prefix}/artifact-verification.json`)).sha256, correction.originalArtifactReport.sha256);
for (const item of correction.artifacts) assert.deepEqual(await binding(item.path), item);
for (const item of [correction.correction.originalHelper, correction.correction.correctedHelper, correction.correction.unchangedHelperDependency]) {
  assert.equal((await binding(item.path)).sha256, item.sha256);
}
const verification = spawnSync(resolve(root, '.venv/bin/python'), ['scripts/prepare_mvp07_artifacts.py', '--verify'],
  { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
assert.equal(verification.status, 0, `${verification.stdout}\n${verification.stderr}`);
const portableLog = await seal(`${output}/final-artifact-verification.log`, Buffer.from(`${verification.stdout}${verification.stderr}`));
const paths = ['source-approval.json', 'local-build-approval.json', 'source-governance-adoption.json',
  'source-version-bridges.json', 'data-promotion.json', 'local-data-pin.json', 'artifact-verification.json',
  'artifact-verifier-correction.json', 'build-evidence/spfx-verification.json', 'browser-verification.md',
  'browser-evidence/web-ti-result.png', 'browser-evidence/web-ti-result-ax.txt'];
const report = {
  kind: 'mvp07LocalReleaseCompletion', completedOn: '2026-10-08', status: 'passed',
  releaseId: artifactReport.releaseId, applicationVersion: '0.7.0', spfxVersion: '0.7.0.0',
  manifestSha256: artifactReport.manifestSha256, localDataCommit: artifactReport.pinCommit,
  localDataOnlyCommit: true, fullProductCommit: null, remotePublicationVerified: false,
  product, governance, preliminaryAttempts: preliminary, finalArtifactVerification: portableLog,
  evidence: await Promise.all(paths.map(path => binding(`${prefix}/${path}`))), artifacts: correction.artifacts,
  actualHostTestsPerformed: false, savedBrowserIcsDownloadVerified: false,
  remainingGates: ['R07-C specific E/Q authority, host matrix, real devices and guest, manual Q acceptance',
    'R07-D public source preflight including private audit separation, GitHub authority, P authority and current hosting risk decision'],
  permissions: { installation: false, publication: false, hostingChanges: false, m365PermissionChanges: false,
    outlookChanges: false, testAppCleanup: false, operatingApproval: false },
  archivalNote: 'Receipts and logs are private local evidence, retained byte-identically. Public suitability is a separate gate. Earlier failed attempts are not counted as passed tests.'
};
console.log(JSON.stringify(await seal(`${prefix}/local-verification.json`, Buffer.from(JSON.stringify(report, null, 2) + '\n')), null, 2));
