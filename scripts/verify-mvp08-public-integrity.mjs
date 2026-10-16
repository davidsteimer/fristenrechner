// SPDX-License-Identifier: AGPL-3.0-only
// Public-only byte integrity. No private evidence, Git, dependencies, network,
// adoption or fallback to a lesser audit mode. This is not a source/legal audit.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, lstat, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const releaseId = '2026-10-15-mvp-08-approved.1';
export const releasePath = `data/releases/${releaseId}`;
export const manifestPath = `${releasePath}/manifest.json`;
export const manifestSha256 = '2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4';
export const recordedDataCommit = '10a99419eaabb3e96d2acccf0c7a93e2fe6472cb';
export const sourceApprovalSha256 = '53a7f9e8b304c2552e89dc6fa4787b178170bde31aaf55100f5aed55cd995026';
export const schemaBindings = Object.freeze({
  'schemas/release-manifest-v8.schema.json': '65a8f8e63a013209b57d8802a4c1dc34760c861b8a5cd78b8fb0264aca13fd8a',
  'schemas/administrative-procedure-catalog.schema.json': 'c89cf5739b1ec4ca238f15b2d1b0a696e7b3b6c81824b0b4075fdeb43a2f7010',
  'schemas/legal-profile.schema.json': 'e1b87a82247f3f09c52aae1629e5a0d4db4de2dd6a493524746427073e2e6145',
  'schemas/calendar-rules-v3.schema.json': '86ec46d639e703cc30dfb1b51fc9cbdb573c911e11920acf503babebec85ca57',
  'schemas/holiday-catalog-v2.schema.json': 'b1ef62006968380731209bdf31a952222ea2779811264cc492727bcca3122069',
  'schemas/special-regime-catalog-v3.schema.json': '50f8cb02b8e5b5bebffdb97594b9f3c51b89bb58b2ec26c487baea92f3a1854e',
  'schemas/social-procedure-catalog-v2.schema.json': '16bf46bfe0eeb88fe4015800e903c9b749eb8bb69b74a4e4474f9f5aa0186203'
});
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const privatePath = /(?:^|\/)(?:\.work|\.git|\.venv|node_modules|Userinput|private|arbeitskopien)(?:\/|$)|\.private\./;
export function assertPublicMvp08Path(path) {
  assert.ok(typeof path === 'string' && path.length && !path.startsWith('/') && !/[\\\x00-\x1f\x7f]/.test(path)
    && path.split('/').every(part => part && part !== '.' && part !== '..') && !privatePath.test(path),
  'Unsafe or private integrity path');
}
async function readPublic(repository, path) {
  assertPublicMvp08Path(path);
  const base = await lstat(repository);
  assert.ok(base.isDirectory() && !base.isSymbolicLink(), 'Unsafe public repository root');
  const parts = path.split('/');
  for (let index = 1; index <= parts.length; index++) {
    const stat = await lstat(resolve(repository, ...parts.slice(0, index)));
    assert.ok(!stat.isSymbolicLink() && (index === parts.length ? stat.isFile() : stat.isDirectory()),
      `Not regular public input: ${path}`);
  }
  return readFile(resolve(repository, path));
}
function verifyBytes(files, path, sha256, byteLength) {
  assertPublicMvp08Path(path);
  const bytes = files.get(path);
  assert.ok(Buffer.isBuffer(bytes), `Missing public input: ${path}`);
  assert.match(sha256, /^[a-f0-9]{64}$/);
  assert.equal(hash(bytes), sha256, `Changed public input: ${path}`);
  if (byteLength !== undefined) {
    assert.ok(Number.isSafeInteger(byteLength) && byteLength > 0);
    assert.equal(bytes.length, byteLength, `Changed public input length: ${path}`);
  }
  return JSON.parse(bytes);
}
export function validateMvp08PublicIntegrity(files) {
  // Verify the fixed root before following any descriptor, including schemas.
  const manifest = verifyBytes(files, manifestPath, manifestSha256);
  assert.equal(manifest.releaseId, releaseId);
  assert.equal(manifest.releaseStatus, 'approved');
  assert.equal(manifest.formatVersion, '8.0.0');
  assert.equal(manifest.compatibility.minimumConsumerFormatVersion, '8.0.0');
  assert.equal(manifest.artifacts.length, 41);
  assert.equal(new Set(manifest.artifacts.map(item => item.path)).size, 41);
  assert.equal(manifest.sourceSummary.sourceIds.length, 120);
  assert.deepEqual(manifest.extensions['steimer.approval'].sourceReviewRef,
    { reviewId: 'MVP08-SOURCE-APPROVAL-20261015', sha256: sourceApprovalSha256 });
  const preparation = manifest.extensions['steimer.release-preparation'];
  for (const key of ['publicationApproved', 'deploymentApproved', 'productionActivation']) assert.equal(preparation[key], false);
  assert.equal(preparation.operatingApproval, 'requiresSeparateDecision');
  const docs = new Map(), roles = {};
  for (const [path, sha256] of Object.entries(schemaBindings)) verifyBytes(files, path, sha256);
  for (const item of manifest.artifacts) {
    assertPublicMvp08Path(item.path);
    const value = verifyBytes(files, `${releasePath}/${item.path}`, item.sha256, item.byteLength);
    assert.equal(value.dataKind, item.role);
    assert.equal(value.$schema, item.schemaId);
    const schemaName = `schemas/${item.schemaId.split('/').at(-1)}`;
    assert.ok(Object.hasOwn(schemaBindings, schemaName), 'Unbound runtime schema');
    const identityKey = item.role === 'calendar' ? 'calendarId' : item.role === 'legalProfile' ? 'profileId' : 'catalogId';
    assert.equal(value[identityKey], item.contentId);
    assert.ok(!docs.has(item.contentId), 'Duplicate runtime component');
    docs.set(item.contentId, value);
    roles[item.role] = (roles[item.role] ?? 0) + 1;
  }
  assert.deepEqual(roles, { legalProfile: 5, specialRegimeCatalog: 1, holidayCatalog: 1,
    calendar: 32, socialProcedureCatalog: 1, administrativeProcedureCatalog: 1 });
  const social = docs.get('ch-social-procedures');
  assert.equal(social.federalRules.length, 44);
  assert.equal(social.cantonalBindings.length, 50);
  assert.ok(social.cantonalBindings.every(row => row.procedureContextCanton === 'BE'));
  const administrative = docs.get('ch-cantonal-administrative-procedures');
  assert.equal(administrative.runtimeActive, false);
  assert.equal(administrative.paths.length, 12);
  assert.equal(administrative.paths.filter(row => row.pathId.startsWith('ti-')).length, 5);
  assert.equal(administrative.paths.filter(row => row.pathId.startsWith('gr-')).length, 7);
  const expectedPaths = [manifestPath, ...manifest.artifacts.map(row => `${releasePath}/${row.path}`), ...Object.keys(schemaBindings)];
  assert.deepEqual([...files.keys()].sort(), expectedPaths.sort(), 'Unexpected public input closure');
  return { status: 'passed', verificationScope: 'public-pinned-runtime-and-schema-integrity', releaseId,
    manifestSha256, recordedDataCommit, runtimeFilesVerified: 42, schemaFilesVerified: 7,
    uniquePublicFilesVerified: 49, boundSourceApprovalSha256: sourceApprovalSha256,
    privateEvidenceRequired: false, privateRawEvidenceRechecked: false, sourceApprovalEvidenceReopened: false,
    completeSourceAuditReproduced: false, semanticProjectionAuditReproduced: false, gitHistoryChecked: false,
    schemaValidationPerformed: false, schemaByteIntegrityVerified: true,
    newApprovalGranted: false, promotionPerformed: false, installationAuthorized: false,
    publicationAuthorized: false, operatingApproval: false };
}
export async function loadMvp08PublicIntegrityInputs(repository = root) {
  const files = new Map([[manifestPath, await readPublic(repository, manifestPath)]]);
  const manifest = verifyBytes(files, manifestPath, manifestSha256);
  for (const item of manifest.artifacts) {
    assertPublicMvp08Path(item.path);
    const path = `${releasePath}/${item.path}`;
    files.set(path, await readPublic(repository, path));
  }
  for (const path of Object.keys(schemaBindings)) files.set(path, await readPublic(repository, path));
  async function runtimeTree(path) {
    const names = [];
    for (const entry of await readdir(resolve(repository, path), { withFileTypes: true })) {
      assert.ok(!entry.isSymbolicLink(), 'Symlink in runtime inventory');
      const child = `${path}/${entry.name}`;
      assertPublicMvp08Path(child);
      if (entry.isDirectory()) names.push(...await runtimeTree(child));
      else { assert.ok(entry.isFile(), 'Non-file in runtime inventory'); names.push(child); }
    }
    return names;
  }
  assert.deepEqual((await runtimeTree(releasePath)).sort(),
    [manifestPath, ...manifest.artifacts.map(row => `${releasePath}/${row.path}`)].sort(),
    'Missing or extra runtime file');
  validateMvp08PublicIntegrity(files);
  return files;
}
export async function verifyMvp08PublicIntegrity(repository = root) {
  return validateMvp08PublicIntegrity(await loadMvp08PublicIntegrityInputs(repository));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 2, 'This verifier has no mutation, private-audit or automatic-fallback mode');
  console.log(JSON.stringify(await verifyMvp08PublicIntegrity(), null, 2));
}
