// SPDX-License-Identifier: AGPL-3.0-only
// Records only the actual human source decision. No promotion, builds or live register writes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, lstat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSafeRelativePath } from './prepare-mvp07-inputs.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const prefix = 'outputs/release-mvp07-2026-10-08';
export const approvalPath = `${prefix}/source-approval.json`;
export const archivePrefix = `${prefix}/source-approval-inputs`;
export const reportPath = `${prefix}/source-review-completeness.json`;
export const qaPath = `${prefix}/source-review-qa.json`;
export const decisionPath = 'docs/fachrecht/abnahme-quellen-mvp07.md';
export const declaration = 'Ich nehme die zusammengeführte Quellenprüfung für MVP 0.7 einschliesslich der dokumentierten Wiederverwendung, der beiden Fassungsänderungen ohne Änderung der verwendeten Rechenregeln und der fortbestehenden Vorbehalte ab. Die beschlossene AI-Behandlung bleibt unverändert. Der historische Freiburger Praxisbeleg bleibt ein gekennzeichneter ergänzender Spiegel, ohne eigenständige positive Fallfreigabe. Die aktuelle Freiburger Normgrundlage ist davon getrennt bestätigt.';
export const permissions = Object.freeze({ sourceReviewApproved: true, localDataPromotionAuthorized: false,
  definitiveLocalBuildAuthorized: false, installationAuthorized: false, publicationAuthorized: false,
  hostingChangesAuthorized: false, operatingApproval: false, m365PermissionChangesAuthorized: false,
  testAppCleanupAuthorized: false });
export const requiredBindings = Object.freeze({
  [reportPath]: 'ce9122d5e6a5c3bf8c0fb8061e51e6e1613fbb04f34d65825eeea7a59796f587',
  [qaPath]: 'b2ddd4574658bef7463546578c27ee2aadee1261e71bde533abe4cc85392e894',
  [decisionPath]: 'c4c86402584685e9321a5974a1c9b37b3cf87901b2bac48a24e1319aa42ab18d',
  'docs/fachrecht/quellenabgleich-mvp07.md': '258a5d2b93492d92215671955056aaeab1f7fb583eaafb682df713f4a4707b93',
  'outputs/ap22c3-2026-10-08/bundle/manifest.json': 'b290ece2d105c606b3de8154edade57fcbaf2ff978e42b05b08561fb1c40a0f6'
});
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);

async function readRegular(repositoryRoot, path, optional = false) {
  assertSafeRelativePath(path);
  const parts = path.split('/');
  for (let index = 0; index < parts.length; index++) {
    let info;
    try { info = await lstat(resolve(repositoryRoot, parts.slice(0, index + 1).join('/'))); }
    catch (error) { if (optional && error.code === 'ENOENT') return undefined; throw error; }
    assert.ok(!info.isSymbolicLink() && (index === parts.length - 1 ? info.isFile() : info.isDirectory()), `Not regular: ${path}`);
  }
  return readFile(resolve(repositoryRoot, path));
}

function inputBindings(files) {
  for (const [path, expected] of Object.entries(requiredBindings)) assert.equal(hash(files.get(path)), expected, `Changed accepted input: ${path}`);
  const report = JSON.parse(files.get(reportPath)), qa = JSON.parse(files.get(qaPath));
  assert.equal(report.recordStatus, 'candidate');
  for (const flag of ['humanApproval', 'sourceReleaseApproved', 'dataPromotionApproved', 'productionActivation']) assert.equal(report[flag], false);
  assert.equal(report.counts.sourceIds, 232);
  assert.deepEqual(qa.tests.total, 63);
  assert.equal(qa.humanApproval, false);
  assert.ok(files.get(decisionPath).toString().includes(`> ${declaration}`));
  const candidate = JSON.parse(files.get('outputs/ap22c3-2026-10-08/bundle/manifest.json'));
  assert.equal(candidate.releaseId, '2026-10-08-ap22c3-reference.1');
  assert.equal(candidate.releaseStatus, 'candidate');
  const bindings = new Map();
  for (const item of [...report.evidence, ...qa.evidence, qa.tests.log]) {
    assertSafeRelativePath(item.path); assert.match(item.sha256, /^[a-f0-9]{64}$/);
    if (bindings.has(item.path)) assert.equal(bindings.get(item.path).sha256, item.sha256);
    bindings.set(item.path, { path: item.path, sha256: item.sha256 });
  }
  for (const [path, sha256] of Object.entries(requiredBindings)) bindings.set(path, { path, sha256 });
  const archived = new Set(qa.evidence.map(item => item.path));
  return [...bindings.values()].sort((a, b) => a.path.localeCompare(b.path, 'en')).map(item => ({ ...item,
    ...(archived.has(item.path) ? { archivedAt: `${archivePrefix}/${item.path}` } : {}) }));
}

export async function loadMvp07ApprovalInputs(repositoryRoot = root, useArchive = true) {
  const files = new Map();
  for (const path of Object.keys(requiredBindings)) files.set(path, await readRegular(repositoryRoot, path));
  const bindings = inputBindings(files);
  for (const item of bindings) {
    const bytes = await readRegular(repositoryRoot, useArchive && item.archivedAt ? item.archivedAt : item.path);
    assert.equal(hash(bytes), item.sha256, `Changed bound evidence: ${item.path}`);
    files.set(item.path, bytes);
  }
  return { files, bindings };
}

export function makeMvp07SourceApproval(files) {
  const bindings = inputBindings(files);
  for (const item of bindings) assert.equal(hash(files.get(item.path)), item.sha256, `Changed bound evidence: ${item.path}`);
  const report = JSON.parse(files.get(reportPath));
  return { formatVersion: '1.0.0', dataKind: 'sourceReviewApproval',
    approvalId: '2026-10-08-mvp-07-source-approval.1', approvedOn: '2026-10-08', approvedBy: 'David Steimer',
    recordStatus: 'approved', declaration, decisionRef: decisionPath,
    candidateReleaseId: '2026-10-08-ap22c3-reference.1', permissions,
    scope: { sources: 232, withFreshEvidence: 204, reusedWithoutFreshEvidence: 28,
      uniqueVersionChanges: 2, newCalculationRules: 0, allOriginalsFreshlyRead: false,
      socialRules: 44, socialBindings: 50, socialOperativeCantons: ['BE'],
      socialCoverage: { from: '2026-01-01', to: '2027-12-31' }, additionalCasesApproved: false },
    knownConflict: { sourceId: 'SRC-AI-RUHETAGE-LISTE-2026', retainedOutcome: 'unclear',
      treatmentUnchanged: true, officialCorrectionClaimed: false },
    historicalFrPractice: { sourceId: 'SRC-AP22-FR-PRAXIS', retainedOutcome: 'unclear',
      supportingMirrorOnly: true, officialOriginalConfirmed: false, positiveCaseApproval: false,
      currentNormSeparatelyConfirmed: true },
    responsibility: { humanDecisionBy: 'David Steimer', operatingModel: 'personalUnion',
      documentedWith: 'Codex', formalFourEyes: false },
    acceptedVersionEvents: report.legalChangeEvents, retainedLimits: report.limits,
    nextGate: 'Separate authorization for controlled local data promotion and definitive local builds.',
    evidence: bindings.map(item => ({ ...item, byteLength: files.get(item.path).length })) };
}

export function validateMvp07SourceApproval(approval, files) {
  assert.deepEqual(approval, makeMvp07SourceApproval(files), 'Altered decision, evidence, scope or invented authority');
  return { approvalId: approval.approvalId, verifiedEvidenceFiles: approval.evidence.length,
    archivedQaInputs: approval.evidence.filter(item => item.archivedAt).length, ...permissions };
}

export async function verifyMvp07SourceApproval(repositoryRoot = root) {
  const bytes = await readRegular(repositoryRoot, approvalPath);
  const { files } = await loadMvp07ApprovalInputs(repositoryRoot, true);
  return { ...validateMvp07SourceApproval(JSON.parse(bytes), files), approvalSha256: hash(bytes) };
}

export async function recordMvp07SourceApproval(repositoryRoot = root) {
  if (await readRegular(repositoryRoot, approvalPath, true)) return verifyMvp07SourceApproval(repositoryRoot);
  const { files } = await loadMvp07ApprovalInputs(repositoryRoot, false);
  const approval = makeMvp07SourceApproval(files);
  const writes = approval.evidence.filter(item => item.archivedAt).map(item => ({ path: item.archivedAt, bytes: files.get(item.path) }));
  writes.push({ path: approvalPath, bytes: encode(approval) });
  for (const item of writes) {
    const old = await readRegular(repositoryRoot, item.path, true);
    if (old) assert.ok(old.equals(item.bytes), `Existing immutable evidence differs: ${item.path}`);
  }
  for (const item of writes) {
    const parts = item.path.split('/').slice(0, -1);
    for (let index = 0; index < parts.length; index++) {
      const path = resolve(repositoryRoot, parts.slice(0, index + 1).join('/'));
      try { await mkdir(path); } catch (error) { if (error.code !== 'EEXIST') throw error; }
      const info = await lstat(path); assert.ok(info.isDirectory() && !info.isSymbolicLink());
    }
    try { await writeFile(resolve(repositoryRoot, item.path), item.bytes, { flag: 'wx' }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    assert.ok((await readRegular(repositoryRoot, item.path)).equals(item.bytes));
  }
  return verifyMvp07SourceApproval(repositoryRoot);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--write'));
  console.log(JSON.stringify(await (process.argv[2] === '--write' ? recordMvp07SourceApproval() : verifyMvp07SourceApproval()), null, 2));
}
