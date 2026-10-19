// SPDX-License-Identifier: AGPL-3.0-only
// Proposal guards only. No approved data or executable release artifacts are created.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { candidateTargets, validateRecoveryProof, validateProposal, passingTests, safePath,
  permissions, versions, identities, artifactPaths, baseHead } from '../../scripts/prepare-r09b-proposal.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const json = path => JSON.parse(readFileSync(resolve(root, path)));
const manifest = json('outputs/ap23e3-candidate-2026-10-18/bundle/manifest.json');
const recovery = json('outputs/release-mvp08-2026-10-15/artifact-verification.json');
const build = json('outputs/release-mvp08-2026-10-15/product-build.json');
const targets = candidateTargets(manifest);
function proposal() {
  return { proposalId: 'R09-B-MVP09-20261018', status: 'proposed-awaiting-execution-authorization',
    permissions: structuredClone(permissions), proposedVersions: structuredClone(versions),
    unchangedIdentities: structuredClone(identities),
    plannedSingleLocalDataCommit: { baseHead, count: 1, emptyIndexConfirmed: true,
      onlyPaths: [...targets], commitSha: null, remotePushAuthorized: false },
    proposedArtifacts: artifactPaths.map(path => ({ path, built: false, sha256: null })),
    executionStatus: { dataPromoted: false, productVersionsChanged: false, pinsChanged: false,
      definitiveBuildPerformed: false, recoveryBuilt: false, gitCommitCreated: false, deploymentPerformed: false } };
}
test('candidate yields exactly 42 new targets without promotion', () => {
  const before = JSON.stringify(manifest);
  assert.equal(targets.length, 42);
  assert.equal(targets.filter(path => path.includes('/calendars/')).length, 32);
  assert.equal(JSON.stringify(manifest), before);
});
test('reject wrong candidate identity, approval, format or source inventory', () => {
  for (const mutate of [m => { m.releaseId = 'other'; }, m => { m.releaseStatus = 'approved'; },
    m => { m.formatVersion = '8.0.0'; }, m => { m.sourceSummary.sourceIds.pop(); }]) {
    const m = structuredClone(manifest); mutate(m); assert.throws(() => candidateTargets(m));
  }
});
test('reject duplicate targets, unsafe paths and out-of-scope calendar counts', () => {
  for (const path of ['../escape', '/absolute', 'data\\escape', 'x\nfile', './same']) assert.throws(() => safePath(path));
  for (const mutate of [m => { m.artifacts[0].path = m.artifacts[1].path; },
    m => { m.artifacts[0].path = '../escape'; },
    m => { m.artifacts.find(x => x.path.startsWith('calendars/')).path = 'other/file.json'; }]) {
    const m = structuredClone(manifest); mutate(m); assert.throws(() => candidateTargets(m));
  }
});
test('actual MVP08 recovery contract binds 210 inputs and 599 fixtures', () => {
  assert.equal(validateRecoveryProof(recovery, build).length, 809);
});
test('reject MVP07 recovery masquerading as MVP08 or incomplete archives', () => {
  for (const mutate of [b => { b.applicationVersion = '0.7.0'; }, b => { b.packageVersion = '0.8.0.1'; },
    b => { b.localDataPin.commit = '0'.repeat(40); }, b => { b.archivedInputs.pop(); }]) {
    const b = structuredClone(build); mutate(b); assert.throws(() => validateRecoveryProof(recovery, b));
  }
});
test('reject altered recovery identities, permissions, hashes and archive paths', () => {
  const r = structuredClone(recovery); r.packageAudit.additionalApiPermissions.push('new');
  assert.throws(() => validateRecoveryProof(r, build));
  const r2 = structuredClone(recovery); r2.packageAudit.webpartId = 'other';
  assert.throws(() => validateRecoveryProof(r2, build));
  for (const mutate of [b => { b.package.sha256 = '0'.repeat(64); },
    b => { b.archivedInputs[0].archivedAt = '../elsewhere'; },
    b => { b.archivedInputs[0].sha256 = 'bad'; }]) {
    const b = structuredClone(build); mutate(b); assert.throws(() => validateRecoveryProof(recovery, b));
  }
});
test('valid proposal grants no execution authority and has no built outputs', () => {
  validateProposal(proposal(), targets);
});
test('reject fabricated execution permissions', () => {
  for (const key of Object.keys(permissions)) {
    const p = proposal(); p.permissions[key] = true; assert.throws(() => validateProposal(p, targets));
  }
});
test('reject wrong target versions or new technical identities', () => {
  for (const mutate of [p => { p.proposedVersions.recoveryFunctionality = 'MVP 0.7'; },
    p => { p.proposedVersions.defaults = 6; }, p => { p.unchangedIdentities.solutionId = 'new'; }]) {
    const p = proposal(); mutate(p); assert.throws(() => validateProposal(p, targets));
  }
});
test('reject broader commit scope, changed HEAD, existing commit or push authority', () => {
  for (const mutate of [p => { p.plannedSingleLocalDataCommit.onlyPaths.push('README.md'); },
    p => { p.plannedSingleLocalDataCommit.baseHead = '0'.repeat(40); },
    p => { p.plannedSingleLocalDataCommit.count = 2; },
    p => { p.plannedSingleLocalDataCommit.commitSha = '1'.repeat(40); },
    p => { p.plannedSingleLocalDataCommit.remotePushAuthorized = true; }]) {
    const p = proposal(); mutate(p); assert.throws(() => validateProposal(p, targets));
  }
});
test('reject invented output hashes, names or executed steps', () => {
  for (const mutate of [p => { p.proposedArtifacts[0].sha256 = '0'.repeat(64); },
    p => { p.proposedArtifacts[0].built = true; }, p => { p.proposedArtifacts[0].path = 'another.zip'; },
    p => { p.executionStatus.dataPromoted = true; }, p => { p.executionStatus = {}; }]) {
    const p = proposal(); mutate(p); assert.throws(() => validateProposal(p, targets));
  }
});
test('test log must be complete with no failure, skip, cancellation or todo', () => {
  const log = '# tests 12\n# pass 12\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n';
  assert.equal(passingTests(log).tests, 12);
  for (const key of ['fail', 'cancelled', 'skipped', 'todo']) assert.throws(() => passingTests(log.replace(`# ${key} 0`, `# ${key} 1`)));
  assert.throws(() => passingTests(log.replace('# tests 12', '# tests 11')));
  assert.throws(() => passingTests(''));
});
