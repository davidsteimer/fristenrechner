// SPDX-License-Identifier: AGPL-3.0-only
// Proposal evidence only. Never promotes data, builds products or changes Git.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { lstat } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, prefix, candidatePath, candidateHash, hash, encode, consolidate } from './consolidate-mvp09-sources.mjs';
import { approvalPath, readRegular, writeExclusive, verifySourceApproval } from './record-mvp09-source-approval.mjs';

export const proposalPath = `${prefix}/r09b-proposal.json`;
export const documentPath = 'docs/betrieb/uebernahme-und-buildvorlage-mvp09.md';
export const releaseId = '2026-10-18-mvp-09-approved.1';
export const baseHead = 'c37c11bc9fbf8241535d202d54c3499d2f4c3350';
const recoveryRoot = 'outputs/release-mvp08-2026-10-15';
const recoveryProofPath = `${recoveryRoot}/artifact-verification.json`;
const recoveryBuildPath = `${recoveryRoot}/product-build.json`;
const recoveryPackagePath = `${recoveryRoot}/fristenrechner-schweiz-0.8.0.0.sppkg`;
const recoveryPackageHash = 'd3d06adcd78176db66f8227d884fd66ca2fbcee0bffab66755789dd0cc29dc1a';
const proposalTestPath = 'tests/governance/r09b-proposal.test.mjs';
const selfPath = 'scripts/prepare-r09b-proposal.mjs';
const qaPath = `${prefix}/r09b-proposal-verification.json`;
const logPath = `${prefix}/r09b-proposal-tests.txt`;
export const permissions = Object.freeze({ localDataPromotionAuthorized: false, definitiveLocalBuildAuthorized: false,
  localDataCommitAuthorized: false, installationAuthorized: false, uploadAuthorized: false,
  publicationAuthorized: false, recoveryExecutionAuthorized: false, operatingApproval: false });
export const versions = Object.freeze({ application: '0.9.0', spfxPackage: '0.9.0.0',
  recoveryPackage: '0.9.0.1', recoveryFunctionality: 'MVP 0.8', recoveryApplication: '0.8.0',
  recoveryReleaseId: '2026-10-15-mvp-08-approved.1', recoveryDataPin: '10a99419eaabb3e96d2acccf0c7a93e2fe6472cb',
  releaseId, manifest: '9.0.0', minimumConsumer: '9.0.0', administrativeCatalog: '2.0.0', defaults: 5 });
export const identities = Object.freeze({ solutionId: '13090feb-a6bf-40fa-9d3c-ec8d90516a60',
  featureId: '3edf1509-41e9-4a2f-8005-df510eec43b6', webpartId: '596c7f1c-4d3e-4da8-a7be-27a96024f37c' });
export const artifactPaths = ['fristenrechner-schweiz-0.9.0.0.sppkg', 'fristenrechner-mvp09-sharepoint-mirror.zip',
  'fristenrechner-mvp09-steimer-web.zip', 'fristenrechner-schweiz-recovery-0.9.0.1.sppkg'].map(name => `${prefix}/${name}`);
const noExecution = Object.freeze({ dataPromoted: false, productVersionsChanged: false, pinsChanged: false,
  definitiveBuildPerformed: false, recoveryBuilt: false, gitCommitCreated: false, deploymentPerformed: false });
export function safePath(path) {
  assert.ok(typeof path === 'string' && path.length && !path.startsWith('/') && !/[\\:\x00-\x1f\x7f]/.test(path)
    && path.split('/').every(part => part && part !== '.' && part !== '..'), `Unsafe path: ${path}`);
  return path;
}
export function candidateTargets(manifest) {
  assert.equal(manifest.releaseId, '2026-10-18-ap23e3-reference.1');
  assert.equal(manifest.releaseStatus, 'candidate');
  assert.equal(manifest.formatVersion, '9.0.0');
  assert.equal(manifest.sourceSummary.sourceIds.length, 128);
  assert.equal(new Set(manifest.sourceSummary.sourceIds).size, 128);
  assert.equal(manifest.artifacts.length, 41);
  const paths = ['manifest.json', ...manifest.artifacts.map(item => safePath(item.path))];
  assert.equal(new Set(paths).size, 42);
  assert.equal(paths.filter(path => path.startsWith('calendars/')).length, 32);
  assert.equal(paths.filter(path => path.startsWith('profiles/')).length, 5);
  return paths.map(path => `data/releases/${releaseId}/${path}`).sort();
}
export function validateRecoveryProof(proof, build) {
  assert.equal(proof.kind, 'mvp08-local-artifact-sealing');
  assert.equal(proof.status, 'passed');
  assert.equal(build.kind, 'mvp08-local-product-build');
  assert.equal(build.status, 'passed');
  for (const value of [proof, build]) {
    assert.equal(value.releaseId, versions.recoveryReleaseId);
    assert.equal(value.applicationVersion, versions.recoveryApplication);
    assert.equal(value.packageVersion, '0.8.0.0');
  }
  for (const [key, value] of Object.entries(identities)) assert.equal(proof.packageAudit[key], value);
  assert.deepEqual(proof.packageAudit.additionalApiPermissions, []);
  assert.equal(proof.localDataCommit, versions.recoveryDataPin);
  assert.equal(build.localDataPin.commit, versions.recoveryDataPin);
  assert.equal(build.package.path, recoveryPackagePath);
  assert.equal(build.package.sha256, recoveryPackageHash);
  assert.equal(build.archivedInputs.length, 210);
  assert.equal(build.archivedFixtures.length, 599);
  assert.equal(build.runtimeFiles.length, 42);
  const archived = [...build.archivedInputs, ...build.archivedFixtures];
  assert.equal(new Set(archived.map(item => item.archivedAt)).size, 809);
  for (const item of archived) {
    safePath(item.path); safePath(item.archivedAt);
    assert.ok(item.archivedAt.startsWith(`${recoveryRoot}/build-evidence/`));
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.ok(Number.isSafeInteger(item.byteLength) && item.byteLength >= 0);
  }
  return archived.map(item => ({ path: item.archivedAt, originalPath: item.path,
    sha256: item.sha256, byteLength: item.byteLength }));
}
export function validateProposal(proposal, targetFiles) {
  assert.equal(proposal.proposalId, 'R09-B-MVP09-20261018');
  assert.equal(proposal.status, 'proposed-awaiting-execution-authorization');
  assert.deepEqual(proposal.permissions, permissions);
  assert.deepEqual(proposal.proposedVersions, versions);
  assert.deepEqual(proposal.unchangedIdentities, identities);
  assert.equal(proposal.plannedSingleLocalDataCommit.baseHead, baseHead);
  assert.equal(proposal.plannedSingleLocalDataCommit.count, 1);
  assert.equal(proposal.plannedSingleLocalDataCommit.emptyIndexConfirmed, true);
  assert.equal(proposal.plannedSingleLocalDataCommit.commitSha, null);
  assert.equal(proposal.plannedSingleLocalDataCommit.remotePushAuthorized, false);
  assert.deepEqual(proposal.plannedSingleLocalDataCommit.onlyPaths, targetFiles);
  assert.equal(targetFiles.length, 42);
  assert.equal(new Set(targetFiles).size, 42);
  for (const path of targetFiles) assert.ok(safePath(path).startsWith(`data/releases/${releaseId}/`));
  assert.equal(proposal.proposedArtifacts.length, 4);
  assert.deepEqual(proposal.proposedArtifacts.map(item => item.path), artifactPaths);
  for (const item of proposal.proposedArtifacts) { assert.equal(item.built, false); assert.equal(item.sha256, null); }
  assert.deepEqual(proposal.executionStatus, noExecution);
}
async function bind(path, expected) {
  const bytes = await readRegular(root, safePath(path));
  const item = { path, byteLength: bytes.length, sha256: hash(bytes) };
  if (expected) assert.equal(item.sha256, expected, `Changed bound input: ${path}`);
  return item;
}
async function requireAbsent(path) {
  safePath(path);
  try { await lstat(resolve(root, path)); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
  assert.fail(`Planned output already exists, do not overwrite: ${path}`);
}
export async function makeProposal() {
  const sourceApproval = await verifySourceApproval();
  assert.equal(sourceApproval.approvalSha256, '4a05e80c0324573f83c88463ba78d20970d0d2152b76f15766bd848bc13a9c68');
  const review = await consolidate();
  assert.equal(review.counts.protectedFilesUnchanged, 624);
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(git('rev-parse', 'HEAD'), baseHead, 'Changed initial HEAD');
  assert.equal(git('diff', '--cached', '--name-only'), '', 'Index must remain empty');
  const candidate = await bind(candidatePath, candidateHash);
  const manifest = JSON.parse(await readRegular(root, candidatePath));
  const targetFiles = candidateTargets(manifest);
  const candidateFiles = [candidate];
  for (const item of manifest.artifacts) candidateFiles.push(await bind(
    `outputs/ap23e3-candidate-2026-10-18/bundle/${safePath(item.path)}`, item.sha256));
  const recoveryProof = await bind(recoveryProofPath, '5307901a72a32537ffc8f05cefa250341c42a5d21fc387a64df04ea2c1e369c2');
  const recoveryBuild = await bind(recoveryBuildPath, '1638becba091b1fccc3924ad477476d6bfb8fb0fd5245d115923c6e4ebe98bd6');
  const proof = JSON.parse(await readRegular(root, recoveryProofPath));
  const build = JSON.parse(await readRegular(root, recoveryBuildPath));
  const recoveryArchive = validateRecoveryProof(proof, build);
  for (const item of recoveryArchive) {
    const bound = await bind(item.path, item.sha256);
    assert.equal(bound.byteLength, item.byteLength, item.path);
  }
  for (const item of build.runtimeFiles) assert.deepEqual(await bind(item.path, item.sha256), item);
  const recoveryBasePackage = await bind(recoveryPackagePath, recoveryPackageHash);
  const protection = JSON.parse(await readRegular(root, `${prefix}/preflight.json`)).protectedAfter;
  const living = new Set(['docs/architektur/README.md', 'docs/fachrecht/README.md', 'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md']);
  const protectedInputs = protection.filter(item => !living.has(item.path));
  assert.equal(protectedInputs.length, 624);
  for (const item of protectedInputs) assert.deepEqual(await bind(item.path, item.sha256), item);
  const currentPaths = [documentPath, selfPath, proposalTestPath, 'docs/fachrecht/abnahme-quellen-mvp09.md',
    'scripts/record-mvp09-source-approval.mjs', 'tests/governance/mvp09-source-approval.test.mjs',
    'package.json', 'package-lock.json', 'spfx/package.json', 'spfx/package-lock.json',
    'spfx/config/package-solution.json', 'spfx/src/core/config.ts',
    'spfx/src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json', 'src/public-app/main.tsx',
    'scripts/build-public-app.mjs', 'spfx/scripts/sync-schemas.mjs', 'data/source-reviews/source-register.json',
    'data/source-reviews/index.json', 'schemas/release-manifest-v9.schema.json',
    'schemas/administrative-procedure-catalog-v2.schema.json',
    'spfx/test/product-integration.test.ts', 'tests/public-app/mvp08-build.test.ts',
    'tests/public-app/build.test.ts', 'tests/public-app/ap23e3-build.test.ts',
    'tests/public-app/ap23d3-build.test.ts', 'tests/public-app/ap22c3-build.test.ts',
    'tests/public-app/ap21-build.test.ts', 'tests/public-app/ap19c3-build.test.ts',
    'tests/ui/ap22c2-candidate.test.ts', 'tests/ui/ap22c3-host-policy.test.tsx', 'tests/ui/mvp05-release.test.ts'];
  const currentInputs = await Promise.all(currentPaths.map(path => bind(path)));
  const packageConfig = JSON.parse(await readRegular(root, 'spfx/config/package-solution.json'));
  assert.equal(packageConfig.solution.version, '0.8.0.0');
  assert.equal(packageConfig.solution.id, identities.solutionId);
  assert.equal(packageConfig.solution.features.length, 1);
  assert.equal(packageConfig.solution.features[0].id, identities.featureId);
  assert.equal(packageConfig.solution.features[0].version, '0.8.0.0');
  const artifacts = artifactPaths.map(path => ({ path, built: false, sha256: null }));
  await requireAbsent(`data/releases/${releaseId}`);
  for (const item of artifacts) await requireAbsent(item.path);
  const proposal = {
    proposalId: 'R09-B-MVP09-20261018', preparedOn: '2026-10-18', status: 'proposed-awaiting-execution-authorization',
    sourceApproval: { ...await bind(approvalPath, sourceApproval.approvalSha256), approved: true },
    permissions, proposedVersions: versions, unchangedIdentities: identities, proposedArtifacts: artifacts,
    plannedSingleLocalDataCommit: { baseHead, emptyIndexConfirmed: true, count: 1,
      onlyPaths: targetFiles, commitSha: null, remotePushAuthorized: false },
    candidateFiles, recoveryProof, recoveryBuild, recoveryBasePackage, recoveryArchive,
    recoveryRuntimeFiles: build.runtimeFiles, protectedInputs, currentInputs,
    proposalChecks: { sourceApprovalEvidenceFiles: sourceApproval.evidenceFiles,
      sourceApprovalArchivedInputs: sourceApproval.archivedInputs, candidateFiles: 42,
      recoveryProductInputs: 210, recoveryFixtures: 599, recoveryArchiveFiles: 809,
      protectedFilesUnchanged: 624, indexEmpty: true, originalHeadUnchanged: true },
    plannedDataCounts: { runtimeFiles: 42, artifactDescriptors: 41, calendars: 32, manifestSourceIds: 128,
      reviewedSourceIds: 251, sourceRegisterEntries: 255, newRegisterEntries: 8,
      registerCategories: { productive: 157, supporting: 85, monitoring: 13 },
      sourceReviewEventNumber: 7, previousEventsRetained: 6, explicitReferenceEdges: 2136,
      historicalProvenanceEdgesNotActivating: 713, administrativePaths: 25, qualificationPolicies: 25,
      socialRules: 44, socialBernBindings: 50, federalCalendarBindings: 104 },
    executionStatus: noExecution,
    limits: ['This proposal is not execution authorization or a definitive build result.',
      'Exact metadata allowances and unchanged legal definitions are set out in the bound human-readable proposal.',
      'Recovery restores actual MVP08 functionality, not the old recovery package that restores MVP07.',
      'Recovery must preserve Format-5 preferences with unsupported LU/ZG/AR paths without deletion or overwrite.',
      'Existing working-tree changes and historical evidence remain untouched.',
      'No external write, installation, upload, Outlook import, additional commit, push or operational approval.']
  };
  validateProposal(proposal, targetFiles);
  return proposal;
}
export function passingTests(log) {
  const counts = {};
  for (const key of ['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo']) {
    const matches = [...log.matchAll(new RegExp(`^# ${key} (\\d+)\\r?$`, 'gm'))];
    assert.equal(matches.length, 1, key); counts[key] = Number(matches[0][1]);
  }
  assert.equal(counts.tests, 12); assert.equal(counts.pass, 12);
  for (const key of ['fail', 'cancelled', 'skipped', 'todo']) assert.equal(counts[key], 0);
  return counts;
}
export async function prepareProposal(write = false) {
  const proposal = await makeProposal();
  const doc = (await readRegular(root, documentPath)).toString();
  assert.ok(!doc.includes(';') && doc.includes('noch nicht ausgeführt'));
  const links = [...doc.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]).filter(link => !/^https?:|^#/.test(link));
  for (const link of links) {
    const path = safePath(relative(root, resolve(root, dirname(documentPath), link.split('#')[0])));
    if (![proposalPath, qaPath].includes(path)) await readRegular(root, path);
  }
  if (write) await writeExclusive(root, proposalPath, encode(proposal));
  assert.deepEqual(await readRegular(root, proposalPath), encode(proposal), 'Changed proposal or inputs');
  if (write && !await readRegular(root, qaPath, true)) {
    const run = spawnSync(process.execPath, ['--test', proposalTestPath], {
      cwd: root, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    assert.equal(run.status, 0, run.stdout + run.stderr); assert.equal(run.stderr, '');
    const counts = passingTests(run.stdout);
    assert.deepEqual(await makeProposal(), proposal, 'Inputs changed during proposal checks');
    await writeExclusive(root, logPath, Buffer.from(run.stdout));
    await writeExclusive(root, qaPath, encode({ verificationId: 'R09-B-PROPOSAL-VERIFICATION-20261018',
      checkedOn: '2026-10-18', proposal: await bind(proposalPath), document: await bind(documentPath),
      tools: [await bind(selfPath), await bind(proposalTestPath)],
      tests: { ...counts, node: process.version, log: await bind(logPath) },
      localLinksChecked: links.length, checks: proposal.proposalChecks, executionStatus: proposal.executionStatus,
      limitation: 'Proposal and acceptance evidence only, not execution authorization or definitive build verification.' }));
  }
  const qa = JSON.parse(await readRegular(root, qaPath));
  assert.equal(qa.verificationId, 'R09-B-PROPOSAL-VERIFICATION-20261018');
  assert.equal(qa.checkedOn, '2026-10-18');
  assert.deepEqual(qa.proposal, await bind(proposalPath));
  assert.deepEqual(qa.document, await bind(documentPath));
  assert.deepEqual(qa.tools, [await bind(selfPath), await bind(proposalTestPath)]);
  assert.deepEqual(qa.tests.log, await bind(logPath));
  for (const [key, value] of Object.entries(passingTests((await readRegular(root, logPath)).toString()))) assert.equal(qa.tests[key], value);
  assert.deepEqual(qa.checks, proposal.proposalChecks);
  assert.deepEqual(qa.executionStatus, proposal.executionStatus);
  assert.equal(qa.localLinksChecked, links.length);
  return { proposal: await bind(proposalPath), document: qa.document, verification: await bind(qaPath),
    checks: proposal.proposalChecks, permissions, executionStatus: proposal.executionStatus, tests: qa.tests.tests };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--write'));
  console.log(JSON.stringify(await prepareProposal(process.argv[2] === '--write'), null, 2));
}
