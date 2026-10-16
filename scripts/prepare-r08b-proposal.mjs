// SPDX-License-Identifier: AGPL-3.0-only
// Proposal evidence only. No promotion, build, Git mutation or external access.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, prefix, candidatePath, hash, encode } from './consolidate-mvp08-sources.mjs';
import { approvalPath, readRegular, writeExclusive, verifySourceApproval } from './record-mvp08-source-approval.mjs';

export const proposalPath = `${prefix}/r08b-proposal.json`;
export const documentPath = 'docs/betrieb/uebernahme-und-buildvorlage-mvp08.md';
export const releaseId = '2026-10-15-mvp-08-approved.1';
const recoveryRoot = 'outputs/release-mvp07-spfx-0.7.0.2-2026-10-09';
const recoveryReport = `${recoveryRoot}/artifact-verification.json`;
export const baseHead = 'a1aca59aa7cb333cac085278db93b18ce3038eec';
export const proposedPermissions = Object.freeze({ localDataPromotionAuthorized: false, definitiveLocalBuildAuthorized: false,
  localDataCommitAuthorized: false, installationAuthorized: false, publicationAuthorized: false,
  recoveryExecutionAuthorized: false, operatingApproval: false });
async function binding(path, expected) {
  const bytes = await readRegular(root, path);
  const result = { path, byteLength: bytes.length, sha256: hash(bytes) };
  if (expected) assert.equal(result.sha256, expected, path);
  return result;
}
export async function makeProposal() {
  const sourceApproval = await verifySourceApproval();
  assert.equal(sourceApproval.approvalSha256, '53a7f9e8b304c2552e89dc6fa4787b178170bde31aaf55100f5aed55cd995026');
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(git('rev-parse', 'HEAD'), baseHead, 'Changed initial HEAD');
  assert.equal(git('diff', '--cached', '--name-only'), '', 'Index must remain empty');
  const candidate = await binding(candidatePath, 'ccb67c22e55737af064f8c9ef7b122db8c5dfe1f4a1f142eb77cd05fd5ac646d');
  const manifest = JSON.parse(await readRegular(root, candidatePath));
  assert.equal(manifest.artifacts.length, 41);
  const candidateFiles = [candidate];
  for (const item of manifest.artifacts) candidateFiles.push(await binding(`outputs/ap23d2-candidate-2026-10-15/bundle/${item.path}`, item.sha256));
  const recoveryProof = await binding(recoveryReport, 'c42c0c75d2352004e640dd0de3d18a37e4147290d4cd2c12f1e9a705d0376702');
  const recovery = JSON.parse(await readRegular(root, recoveryReport));
  const recoveryArchive = recovery.archivedFiles;
  assert.equal(recoveryArchive.length, 230);
  assert.equal(recovery.productInputFiles.length, 181);
  for (const item of recoveryArchive) assert.deepEqual(await binding(item.path, item.sha256), item);
  const originalPackage = await binding(`${recoveryRoot}/artifacts/fristenrechner-schweiz-0.7.0.2.sppkg`, '8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db');
  const protection = JSON.parse(await readRegular(root, `${prefix}/preflight.json`)).protectedAfter;
  const living = new Set(['README.md', 'docs/fachrecht/README.md', 'docs/architektur/README.md']);
  const protectedInputs = protection.filter(item => !living.has(item.path));
  assert.equal(protectedInputs.length, 559);
  for (const item of protectedInputs) assert.deepEqual(await binding(item.path, item.sha256), item);
  const mutablePaths = [documentPath, 'scripts/prepare-r08b-proposal.mjs', 'scripts/record-mvp08-source-approval.mjs',
    'tests/governance/mvp08-source-approval.test.mjs', 'package.json', 'package-lock.json', 'spfx/package.json', 'spfx/package-lock.json',
    'spfx/config/package-solution.json', 'spfx/src/core/config.ts', 'spfx/src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json',
    'src/public-app/main.tsx', 'data/source-reviews/source-register.json', 'data/source-reviews/index.json',
    'schemas/implementation/ap23d1/release-manifest-v8.schema.json', 'schemas/implementation/ap23d1/administrative-procedure-catalog.schema.json'];
  const bindings = await Promise.all(mutablePaths.map(path => binding(path)));
  const targetFiles = ['manifest.json', ...manifest.artifacts.map(item => item.path)].map(path => `data/releases/${releaseId}/${path}`).sort();
  assert.equal(new Set(targetFiles).size, 42);
  for (const path of targetFiles) assert.equal(await readRegular(root, path, true), undefined, `Target already exists: ${path}`);
  return { proposalId: 'R08-B-MVP08-20261015', preparedOn: '2026-10-15', status: 'proposed-awaiting-execution-authorization',
    sourceApproval: { ...await binding(approvalPath), approved: true }, permissions: proposedPermissions,
    proposedVersions: { application: '0.8.0', spfxPackage: '0.8.0.0', recoveryPackage: '0.8.0.1', recoveryFunctionality: 'MVP 0.7',
      releaseId, manifest: '8.0.0', minimumConsumer: '8.0.0', administrativeCatalog: '1.0.0' },
    proposedArtifacts: ['fristenrechner-schweiz-0.8.0.0.sppkg', 'fristenrechner-mvp08-sharepoint-mirror.zip',
      'fristenrechner-mvp08-steimer-web.zip', 'fristenrechner-schweiz-recovery-0.8.0.1.sppkg'].map(name => ({ path: `${prefix}/${name}`, sha256: null, built: false })),
    plannedSingleLocalDataCommit: { baseHead, emptyIndexConfirmed: true, count: 1, onlyPaths: targetFiles,
      commitSha: null, remotePushAuthorized: false },
    candidateFiles, recoveryProof, originalRecoveryBasePackage: originalPackage, recoveryArchive,
    protectedInputs, currentInputs: bindings,
    proposalChecks: { sourceApprovalEvidenceFiles: 559, candidateFiles: 42, recoveryArchiveFiles: 230, recoveryProductInputs: 181,
      protectedFilesUnchanged: 559, indexEmpty: true, originalHeadUnchanged: true },
    executionStatus: { dataPromoted: false, productVersionsChanged: false, pinsChanged: false, definitiveBuildPerformed: false,
      recoveryBuilt: false, gitCommitCreated: false, deploymentPerformed: false },
    limits: ['This is a proposal binding, not an execution approval or a successful definitive product test.',
      'Existing dirty working-tree changes remain untouched. Historical source approvals and evidence are not rewritten.',
      'Installation, uploads, GitHub publication, Outlook imports, M365 and hosting changes need separate authority.'] };
}
export async function prepareProposal(write = false) {
  const proposal = await makeProposal();
  const doc = (await readRegular(root, documentPath)).toString();
  assert.ok(!doc.includes(';'), 'No prose semicolons');
  const links = [...doc.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]).filter(link => !/^https?:|^#/.test(link));
  for (const link of links) {
    const path = relative(root, resolve(root, dirname(documentPath), link.split('#')[0]));
    if (path !== proposalPath) await readRegular(root, path);
  }
  if (write) await writeExclusive(root, proposalPath, encode(proposal));
  const bytes = await readRegular(root, proposalPath);
  assert.deepEqual(JSON.parse(bytes), proposal, 'Changed proposal or inputs');
  const logPath = `${prefix}/r08b-proposal-tests.txt`;
  const qaPath = `${prefix}/r08b-proposal-verification.json`;
  if (write && !await readRegular(root, qaPath, true)) {
    const run = spawnSync(process.execPath, ['--test', 'tests/governance/mvp08-source-approval.test.mjs'],
      { cwd: root, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    assert.equal(run.status, 0, run.stdout + run.stderr);
    assert.match(run.stdout, /# tests 11\n/);
    assert.match(run.stdout, /# pass 11\n/);
    assert.match(run.stdout, /# fail 0\n/);
    assert.equal(run.stderr, '');
    await writeExclusive(root, logPath, Buffer.from(run.stdout));
    await writeExclusive(root, qaPath, encode({ verificationId: 'R08-B-PROPOSAL-VERIFICATION-20261015',
      checkedOn: '2026-10-15', proposal: await binding(proposalPath), document: await binding(documentPath),
      tests: { passed: 11, failed: 0, node: process.version, log: await binding(logPath) },
      localLinksChecked: links.length, checks: proposal.proposalChecks, executionStatus: proposal.executionStatus,
      limitation: 'Validates the proposal and acceptance evidence only. Not execution authorization or definitive build verification.' }));
  }
  const qa = JSON.parse(await readRegular(root, qaPath));
  assert.deepEqual(await binding(proposalPath), qa.proposal);
  assert.deepEqual(await binding(documentPath), qa.document);
  assert.deepEqual(await binding(logPath), qa.tests.log);
  return { proposalPath, sha256: hash(bytes), document: proposal.currentInputs.find(item => item.path === documentPath),
    checks: proposal.proposalChecks, permissions: proposal.permissions, executionStatus: proposal.executionStatus,
    verification: await binding(qaPath), tests: qa.tests.passed, localLinksChecked: links.length };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--write'));
  console.log(JSON.stringify(await prepareProposal(process.argv[2] === '--write'), null, 2));
}
