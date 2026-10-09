// SPDX-License-Identifier: AGPL-3.0-only
// Read-only, explicitly public integrity. Never a substitute for the complete
// private source/acceptance audit in a promotion or other write gate.
import assert from 'node:assert/strict';
import { readFile, lstat, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, prefix, approvalPath, reportPath, decisionPath, declaration, hash,
  permissions, requiredBindings } from './record-mvp07-source-approval.mjs';

export { approvalPath };
export const releaseId = '2026-10-08-mvp-07-approved.1';
export const releasePath = `data/releases/${releaseId}`;
export const manifestPath = `${releasePath}/manifest.json`;
export const approvalSha256 = '478ca3d20ea1d643bb05379f8acc042560fa9547575d62e5d7afd4c8c1213810';
export const manifestSha256 = 'fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597';
const localPath = `${prefix}/local-build-approval.json`;
const adoptionPath = `${prefix}/source-governance-adoption.json`;
const bridgePath = `${prefix}/source-version-bridges.json`;
const localDecisionPath = 'docs/betrieb/freigabe-r07-b.md';
const forbidden = /(?:^|\/)(?:\.work|\.git|\.venv|node_modules|Userinput|arbeitskopien|private)(?:\/|$)|\.private\./;
export const isPrivateMvp07Evidence = item => [item.path, item.archivedAt].filter(Boolean).some(path => forbidden.test(path));

export function assertPublicMvp07Path(path) {
  assert.ok(typeof path === 'string' && path.length && !path.startsWith('/') && !/[\\\x00-\x1f\x7f]/.test(path)
    && path.split('/').every(part => part && part !== '.' && part !== '..') && !forbidden.test(path),
  'Unsafe or private public-integrity path');
}
async function readPublic(repository, path) {
  assertPublicMvp07Path(path);
  const base = await lstat(repository);
  assert.ok(base.isDirectory() && !base.isSymbolicLink(), 'Not a regular evidence root');
  const parts = path.split('/');
  for (let i = 1; i <= parts.length; i++) {
    const stat = await lstat(resolve(repository, ...parts.slice(0, i)));
    assert.ok(!stat.isSymbolicLink() && (i === parts.length ? stat.isFile() : stat.isDirectory()),
      `Not regular public evidence: ${path}`);
  }
  return readFile(resolve(repository, path));
}
function bound(bytes, item) {
  assertPublicMvp07Path(item.path);
  assert.ok(Buffer.isBuffer(bytes), `Missing public evidence: ${item.path}`);
  assert.match(item.sha256, /^[a-f0-9]{64}$/);
  assert.equal(hash(bytes), item.sha256, `Changed public evidence: ${item.path}`);
  if (item.byteLength !== undefined) {
    assert.ok(Number.isSafeInteger(item.byteLength) && item.byteLength >= 0);
    assert.equal(bytes.length, item.byteLength, `Changed public evidence length: ${item.path}`);
  }
  return JSON.parse(bytes);
}
function publicSourceBindings(approval) {
  assert.equal(approval.evidence.length, 583);
  assert.equal(new Set(approval.evidence.map(item => item.path)).size, 583);
  const entries = approval.evidence.filter(item => !isPrivateMvp07Evidence(item));
  assert.equal(entries.length, 42);
  assert.equal(approval.evidence.filter(isPrivateMvp07Evidence).length, 541);
  return entries.map(item => ({ ...item, path: item.archivedAt ?? item.path, sourcePath: item.path }));
}
function roots(files) {
  // Pin both roots BEFORE following descriptors or classifying private inputs.
  const approval = bound(files.get(approvalPath), { path: approvalPath, sha256: approvalSha256 });
  const manifest = bound(files.get(manifestPath), { path: manifestPath, sha256: manifestSha256 });
  return { approval, manifest };
}
function envelopeBindings(manifest) {
  const entry = manifest.extensions['steimer.approval'];
  const bindings = [entry.localBuildApproval, entry.sourceGovernance, entry.sourceVersionBridges];
  assert.deepEqual(bindings.map(item => item.path), [localPath, adoptionPath, bridgePath]);
  return bindings;
}
export function validateMvp07PublicIntegrity(files) {
  const { approval, manifest } = roots(files);
  assert.equal(approval.declaration, declaration);
  assert.equal(approval.decisionRef, decisionPath);
  assert.equal(approval.recordStatus, 'approved');
  assert.deepEqual(approval.permissions, permissions);
  assert.deepEqual(approval.scope, { sources: 232, withFreshEvidence: 204, reusedWithoutFreshEvidence: 28,
    uniqueVersionChanges: 2, newCalculationRules: 0, allOriginalsFreshlyRead: false,
    socialRules: 44, socialBindings: 50, socialOperativeCantons: ['BE'],
    socialCoverage: { from: '2026-01-01', to: '2027-12-31' }, additionalCasesApproved: false });
  assert.equal(approval.knownConflict.retainedOutcome, 'unclear');
  assert.equal(approval.knownConflict.treatmentUnchanged, true);
  assert.equal(approval.historicalFrPractice.positiveCaseApproval, false);
  assert.equal(approval.historicalFrPractice.supportingMirrorOnly, true);
  assert.equal(approval.historicalFrPractice.currentNormSeparatelyConfirmed, true);
  const sources = publicSourceBindings(approval);
  // Some source files are JavaScript/Markdown. Verify raw bytes, not their format.
  const verify = item => {
    assertPublicMvp07Path(item.path);
    const bytes = files.get(item.path);
    assert.ok(Buffer.isBuffer(bytes), `Missing public evidence: ${item.path}`);
    assert.equal(hash(bytes), item.sha256, `Changed public evidence: ${item.path}`);
    if (item.byteLength !== undefined) assert.equal(bytes.length, item.byteLength, `Changed public evidence length: ${item.path}`);
    return bytes;
  };
  for (const item of sources) verify(item);
  const bySource = new Map(sources.map(item => [item.sourcePath, item]));
  for (const [path, sha256] of Object.entries(requiredBindings)) {
    assert.equal(bySource.get(path)?.sha256, sha256, `Missing required public anchor: ${path}`);
  }
  assert.ok(files.get(bySource.get(decisionPath).path).toString().includes(`> ${declaration}`));
  const report = JSON.parse(files.get(bySource.get(reportPath).path));
  assert.equal(report.recordStatus, 'candidate');
  assert.equal(report.evidence.length, 573);
  assert.equal(report.counts.sourceIds, 232);
  assert.deepEqual(approval.retainedLimits, report.limits);
  assert.deepEqual(approval.acceptedVersionEvents, report.legalChangeEvents);
  for (const flag of ['humanApproval', 'sourceReleaseApproved', 'dataPromotionApproved', 'productionActivation', 'publicationApproved']) assert.equal(report[flag], false);
  assert.equal(manifest.releaseId, releaseId);
  assert.equal(manifest.releaseStatus, 'approved');
  assert.equal(manifest.formatVersion, '7.0.0');
  assert.equal(manifest.compatibility.minimumConsumerFormatVersion, '7.0.0');
  assert.deepEqual(manifest.extensions['steimer.approval'].sourceReviewRef,
    { reviewId: 'MVP07-SOURCE-APPROVAL-20261008', sha256: approvalSha256 });
  assert.equal(manifest.artifacts.length, 40);
  assert.equal(new Set(manifest.artifacts.map(item => item.path)).size, 40);
  const runtime = manifest.artifacts.map(item => ({ ...item, path: `${releasePath}/${item.path}` }));
  for (const item of runtime) verify(item);
  const envelope = envelopeBindings(manifest);
  const [local, adoption, bridges] = envelope.map(item => bound(files.get(item.path), item));
  assert.equal(local.declaration, 'Ich gebe R07-B frei.');
  assert.equal(local.decision.path, localDecisionPath);
  assert.deepEqual(local.sourceApproval, { path: approvalPath, sha256: approvalSha256 });
  assert.equal(local.permissions.localDataPromotionAuthorized, true);
  assert.equal(local.permissions.definitiveLocalBuildAuthorized, true);
  for (const flag of ['installationAuthorized', 'publicationAuthorized', 'hostingChangesAuthorized', 'operatingApproval',
    'm365PermissionChangesAuthorized', 'outlookChangesAuthorized', 'testAppCleanupAuthorized']) assert.equal(local.permissions[flag], false);
  assert.ok(verify(local.decision).toString().includes('Ich gebe R07-B frei.'));
  assert.equal(adoption.releaseId, releaseId);
  assert.equal(adoption.evidence.length, 14);
  assert.equal(new Set(adoption.evidence.map(item => item.path)).size, 14);
  for (const item of adoption.evidence) verify(item);
  for (const flag of ['installationAuthorized', 'publicationAuthorized', 'hostingChangesAuthorized', 'operatingApproval']) assert.equal(adoption[flag], false);
  assert.equal(adoption.aiTreatmentUnchanged, true);
  assert.equal(adoption.historicalFrMirrorOnly, true);
  assert.equal(bridges.operationalRulesChanged, false);
  assert.equal(bridges.bridges.length, 2);
  const expected = new Set([approvalPath, manifestPath, ...sources.map(item => item.path), ...runtime.map(item => item.path),
    ...envelope.map(item => item.path), local.decision.path, ...adoption.evidence.map(item => item.path)]);
  assert.deepEqual([...files.keys()].sort(), [...expected].sort(), 'Public inputs must be the exact bound closure');
  return { status: 'passed', verificationScope: 'public-integrity', releaseId, approvalSha256, manifestSha256,
    publicSourceEvidenceFilesVerified: 42, privateSourceEvidenceFilesBoundButNotRechecked: 541,
    runtimeFilesVerified: 41, governanceEvidenceFilesVerified: 14, uniquePublicFilesVerified: files.size,
    recordedHumanApprovalIntact: true, aiTreatmentUnchanged: true, historicalFrPracticePositiveCaseApproval: false,
    privateRawEvidenceRechecked: false, completeSourceAuditReproduced: false, privateAcceptanceArchivesRechecked: false,
    newApprovalGranted: false, promotionPerformed: false, installationAuthorized: false,
    publicationAuthorized: false, operatingApproval: false };
}

export async function loadMvp07PublicIntegrityInputs(repository = root) {
  const files = new Map();
  async function load(item, json = false) {
    assertPublicMvp07Path(item.path);
    const bytes = await readPublic(repository, item.path);
    assert.equal(hash(bytes), item.sha256, `Changed public evidence: ${item.path}`);
    if (item.byteLength !== undefined) assert.equal(bytes.length, item.byteLength, `Changed public evidence length: ${item.path}`);
    if (files.has(item.path)) assert.ok(files.get(item.path).equals(bytes), 'Conflicting public binding');
    files.set(item.path, bytes);
    return json ? JSON.parse(bytes) : undefined;
  }
  await load({ path: approvalPath, sha256: approvalSha256 });
  await load({ path: manifestPath, sha256: manifestSha256 });
  const { approval, manifest } = roots(files);
  for (const item of publicSourceBindings(approval)) await load(item);
  for (const item of manifest.artifacts) await load({ ...item, path: `${releasePath}/${item.path}` });
  const [local, adoption] = await Promise.all(envelopeBindings(manifest).map(item => load(item, true)));
  assert.equal(local.decision.path, localDecisionPath);
  await load(local.decision);
  for (const item of adoption.evidence) await load(item);
  // Reject unmanifested files and symlinks in the actual release directory.
  async function tree(path) {
    const names = [];
    for (const entry of await readdir(resolve(repository, path), { withFileTypes: true })) {
      assert.ok(!entry.isSymbolicLink(), 'Symlink in public runtime inventory');
      const child = `${path}/${entry.name}`;
      if (entry.isDirectory()) names.push(...await tree(child));
      else { assert.ok(entry.isFile(), 'Non-file in public runtime inventory'); names.push(child); }
    }
    return names;
  }
  assert.deepEqual((await tree(releasePath)).sort(), [manifestPath, ...manifest.artifacts.map(item => `${releasePath}/${item.path}`)].sort(),
    'Missing or extra public runtime file');
  validateMvp07PublicIntegrity(files);
  return files;
}
export async function verifyMvp07PublicIntegrity(repository = root) {
  return validateMvp07PublicIntegrity(await loadMvp07PublicIntegrityInputs(repository));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 2, 'No promotion, publication or alternate-scope arguments accepted');
  console.log(JSON.stringify(await verifyMvp07PublicIntegrity(), null, 2));
}
