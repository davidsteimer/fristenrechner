// SPDX-License-Identifier: AGPL-3.0-only
// Human source acceptance only. No data promotion, builds, commits or publication.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const prefix = 'outputs/release-mvp09-2026-10-18';
export const approvalPath = prefix + '/source-approval.json';
export const archivePrefix = prefix + '/source-approval-inputs';
export const qaPath = prefix + '/source-review-verification.json';
export const resultPath = prefix + '/source-review-completeness.json';
export const decisionPath = 'docs/fachrecht/abnahme-quellen-mvp09.md';
export const declaration = 'Ich nehme R09-A2 für MVP 0.9 einschliesslich der begründeten Wiederverwendung und der fortbestehenden Vorbehalte ab. Bitte bereite die konkrete Übernahme- und Buildvorlage R09-B vor.';
export const permissions = Object.freeze({
  sourceReviewApproved: true, buildProposalPreparationAuthorized: true,
  localDataPromotionAuthorized: false, definitiveLocalBuildAuthorized: false, localCommitAuthorized: false,
  installationAuthorized: false, publicationAuthorized: false, hostingChangesAuthorized: false,
  operatingApproval: false, m365PermissionChangesAuthorized: false, testAppCleanupAuthorized: false
});
export const required = Object.freeze({
  [resultPath]: '9f7b578725b3c695e3938e18354de83f47e83556d05a4fbdc653d73043c7482c',
  [qaPath]: '3120eced83895a732a41f7eec32bb4b2486873d108a5a0ab1ce3adee94b579c7',
  'docs/fachrecht/quellenabgleich-mvp09.md': 'd8bd45e79ca29e65cb8e83dce5d1fef59900865bbe15ce37565c3e917103d5ec',
  'outputs/ap23e3-candidate-2026-10-18/bundle/manifest.json': '4c9f6025b7e29f577f760d2c9381066a176486983e0bae6997ac8738661ffa31',
  [decisionPath]: 'be6009c6c42a33ed4bec3786081fa80d7451fdc83fff8d98a4022de463ce4c18'
});
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
function safePath(path) {
  assert.ok(typeof path === 'string' && path.length && !path.startsWith('/')
    && !/[\\:\x00-\x1f\x7f]/.test(path)
    && path.split('/').every(part => part && part !== '.' && part !== '..'), 'Unsafe path');
}
export async function readRegular(repositoryRoot, path, optional = false) {
  safePath(path);
  const parts = path.split('/');
  for (let i = 1; i <= parts.length; i++) {
    let st;
    try { st = await lstat(resolve(repositoryRoot, parts.slice(0, i).join('/'))); }
    catch (error) { if (optional && error.code === 'ENOENT') return undefined; throw error; }
    assert.ok(!st.isSymbolicLink() && (i === parts.length ? st.isFile() : st.isDirectory()), path);
  }
  return readFile(resolve(repositoryRoot, path));
}
export async function writeExclusive(repositoryRoot, path, bytes) {
  safePath(path);
  const parts = path.split('/');
  for (let i = 1; i < parts.length; i++) {
    const parent = resolve(repositoryRoot, parts.slice(0, i).join('/'));
    try { await mkdir(parent); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const st = await lstat(parent);
    assert.ok(st.isDirectory() && !st.isSymbolicLink(), parent);
  }
  const old = await readRegular(repositoryRoot, path, true);
  if (old !== undefined) { assert.deepEqual(old, bytes, 'Refusing overwrite: ' + path); return; }
  await writeFile(resolve(repositoryRoot, path), bytes, { flag: 'wx' });
  assert.deepEqual(await readRegular(repositoryRoot, path), bytes);
}
function expectedBindings(files) {
  for (const [path, sha256] of Object.entries(required)) {
    assert.ok(Buffer.isBuffer(files.get(path)), 'Missing required input: ' + path);
    assert.equal(hash(files.get(path)), sha256, 'Changed accepted input: ' + path);
  }
  const report = JSON.parse(files.get(resultPath)), qa = JSON.parse(files.get(qaPath));
  assert.equal(report.recordStatus, 'candidate');
  assert.equal(report.humanApproval, false);
  assert.equal(report.allSourcesSubstantivelyConfirmed, false);
  assert.equal(report.counts.sourceIds, 251);
  assert.equal(report.counts.uniqueBoundEvidenceFiles, 784);
  assert.equal(qa.tests.tests, 68);
  assert.equal(qa.tests.pass, 68);
  assert.equal(qa.technicalValidationPassed, true);
  assert.ok(files.get(decisionPath).toString().includes('> ' + declaration));
  const archived = new Set([...qa.bindings.map(item => item.path), qaPath, decisionPath]);
  const unique = new Map();
  for (const item of [...report.evidence, ...qa.bindings,
    ...Object.entries(required).map(([path, sha256]) => ({ path, sha256 }))]) {
    safePath(item.path);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    if (unique.has(item.path)) assert.equal(unique.get(item.path).sha256, item.sha256, 'Conflicting evidence');
    unique.set(item.path, { path: item.path, sha256: item.sha256,
      ...(item.byteLength === undefined ? {} : { byteLength: item.byteLength }) });
  }
  return [...unique.values()].sort((a, b) => a.path.localeCompare(b.path, 'en')).map(item => ({
    ...item, ...(archived.has(item.path) ? { archivedAt: archivePrefix + '/' + item.path } : {})
  }));
}
export async function loadApprovalInputs(repositoryRoot = root, useArchive = true) {
  const files = new Map();
  for (const [path, sha256] of Object.entries(required)) {
    const bytes = await readRegular(repositoryRoot, useArchive ? archivePrefix + '/' + path : path);
    assert.equal(hash(bytes), sha256, 'Changed accepted input: ' + path);
    files.set(path, bytes);
  }
  const bindings = expectedBindings(files);
  for (const item of bindings) {
    const bytes = await readRegular(repositoryRoot, useArchive && item.archivedAt ? item.archivedAt : item.path);
    assert.equal(hash(bytes), item.sha256, 'Changed evidence: ' + item.path);
    if (item.byteLength !== undefined) assert.equal(bytes.length, item.byteLength, item.path);
    item.byteLength = bytes.length;
    files.set(item.path, bytes);
  }
  return { files, bindings };
}
export function makeSourceApproval({ files, bindings }) {
  const expected = expectedBindings(files).map(item => {
    const bytes = files.get(item.path);
    assert.ok(Buffer.isBuffer(bytes), 'Missing evidence: ' + item.path);
    assert.equal(hash(bytes), item.sha256, 'Changed evidence: ' + item.path);
    if (item.byteLength !== undefined) assert.equal(bytes.length, item.byteLength, item.path);
    return { ...item, byteLength: bytes.length };
  });
  assert.deepEqual(bindings, expected, 'Changed binding scope or length');
  const report = JSON.parse(files.get(resultPath));
  return {
    formatVersion: '1.0.0', dataKind: 'sourceReviewApproval',
    approvalId: '2026-10-18-mvp-09-source-approval.1', approvedOn: '2026-10-18', approvedBy: 'David Steimer',
    recordStatus: 'approved', humanSourceApproval: true, sourceReleaseApproved: false,
    dataPromotionApproved: false, buildApproved: false, commitApproved: false,
    publicationApproved: false, operatingApproval: false,
    declaration, decisionRef: decisionPath, candidateReleaseId: report.candidateReleaseId, permissions,
    scope: { ...report.counts, allOriginalsFreshlyRead: false, allSourcesSubstantivelyConfirmed: false,
      additionalCasesApproved: false, administrativePaths: 25,
      administrativeCoverage: [
        { cantons: ['LU'], from: '2026-09-27', to: '2027-12-31' },
        { cantons: ['TI', 'GR', 'ZG', 'AR'], from: '2026-08-29', to: '2027-12-31' }
      ],
      socialRules: 44, socialBindings: 50, socialOperativeCantons: ['BE'],
      socialCoverage: { from: '2026-01-01', to: '2027-12-31' }
    },
    acceptedPriorNormBridges: report.retainedMvp08NormBridges,
    retainedVersionBridges: report.retainedVersionBridges,
    currentNormAssessments: report.currentNormAssessments,
    retainedLimits: report.limits, acceptedSourceIds: report.coverage.map(row => row.sourceId),
    explicitBoundedReuse: {
      aiTreatmentUnchanged: true, aiConflictResolved: false,
      frPracticeSupportingMirrorOnly: true, frPracticePositiveApproval: false,
      vaudConsolidatedNormEvidenceDate: '2026-10-08', glGovernmentNoticeFreshRetrievalFailed: true,
      currentIvvConsolidationsAvailable: true, ivvUsedArticlesUnchanged: ['73bis', '73ter'],
      ivvHistoricalUnavailabilityDate: '2026-10-15', historicalAvailabilityFindingPreserved: true,
      stillUnavailableFederalConsolidations: ['EOG', 'EOV', 'ÜLG', 'ÜLV'],
      arO1Unchanged: true, tiO2Unchanged: true, januaryComparisonsUnchanged: true,
      nextOrdinarySourceReview: '2026-11-15'
    },
    responsibility: { humanDecisionBy: 'David Steimer', operatingModel: 'personalUnion',
      formalFourEyes: false, documentedWith: 'Codex' },
    nextGate: 'Separate authorization for controlled local data promotion, bounded local data commit and definitive local builds.',
    evidence: bindings
  };
}
export function validateSourceApproval(approval, inputs) {
  assert.deepEqual(approval, makeSourceApproval(inputs), 'Changed decision, scope, authority or evidence');
  return { approvalId: approval.approvalId, evidenceFiles: approval.evidence.length,
    archivedInputs: approval.evidence.filter(item => item.archivedAt).length, permissions };
}
async function archiveFileList(repositoryRoot, directory = archivePrefix) {
  const st = await lstat(resolve(repositoryRoot, directory));
  assert.ok(st.isDirectory() && !st.isSymbolicLink(), directory);
  const paths = [];
  for (const item of await readdir(resolve(repositoryRoot, directory), { withFileTypes: true })) {
    const path = directory + '/' + item.name;
    assert.ok(!item.isSymbolicLink(), path);
    if (item.isDirectory()) paths.push(...await archiveFileList(repositoryRoot, path));
    else { assert.ok(item.isFile(), path); paths.push(path); }
  }
  return paths.sort();
}
export async function verifySourceApproval(repositoryRoot = root) {
  const bytes = await readRegular(repositoryRoot, approvalPath);
  const inputs = await loadApprovalInputs(repositoryRoot, true);
  const result = validateSourceApproval(JSON.parse(bytes), inputs);
  assert.deepEqual(await archiveFileList(repositoryRoot),
    inputs.bindings.filter(item => item.archivedAt).map(item => item.archivedAt).sort(),
    'Incomplete or unexpected archive content');
  return { ...result, approvalSha256: hash(bytes), approvalByteLength: bytes.length };
}
export async function recordSourceApproval(repositoryRoot = root) {
  if (await readRegular(repositoryRoot, approvalPath, true)) return verifySourceApproval(repositoryRoot);
  try { await lstat(resolve(repositoryRoot, archivePrefix)); assert.fail('Partial archive exists, stop without repair'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const inputs = await loadApprovalInputs(repositoryRoot, false);
  const approval = makeSourceApproval(inputs);
  for (const item of approval.evidence.filter(item => item.archivedAt))
    await writeExclusive(repositoryRoot, item.archivedAt, inputs.files.get(item.path));
  // No source changed during archival. Keep direct originals intact and byte-equal at the acceptance instant.
  const fresh = await loadApprovalInputs(repositoryRoot, false);
  assert.deepEqual(fresh.bindings, inputs.bindings, 'Evidence changed while archiving');
  await writeExclusive(repositoryRoot, approvalPath, encode(approval));
  return verifySourceApproval(repositoryRoot);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && ['--write', '--check'].includes(process.argv[2])));
  console.log(JSON.stringify(await (process.argv[2] === '--write' ? recordSourceApproval() : verifySourceApproval()), null, 2));
}

