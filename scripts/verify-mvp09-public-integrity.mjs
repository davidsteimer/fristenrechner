// SPDX-License-Identifier: AGPL-3.0-only
// Public-only byte integrity. No private evidence, Git, dependencies, network,
// adoption or fallback to a lesser audit mode. This is not a source/legal audit.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, lstat, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const releaseId = '2026-10-18-mvp-09-approved.1';
export const releasePath = `data/releases/${releaseId}`;
export const manifestPath = `${releasePath}/manifest.json`;
export const manifestSha256 = '3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265';
export const recordedDataCommit = '0ccc4b9178503ede051964149a4b17efab8d0cf9';
export const sourceApprovalSha256 = '4a05e80c0324573f83c88463ba78d20970d0d2152b76f15766bd848bc13a9c68';
export const schemaBindings = Object.freeze({
  'schemas/release-manifest-v9.schema.json': '1b489a9cc4efad7751586c5f9bdfa198a0ea6396f4737db9c363e98089c12333',
  'schemas/administrative-procedure-catalog-v2.schema.json': 'cbedc3757fd1e5919b1c8c2a4969597e697df56bcf147c14fa6b81e30cd161e0',
  'schemas/legal-profile.schema.json': 'e1b87a82247f3f09c52aae1629e5a0d4db4de2dd6a493524746427073e2e6145',
  'schemas/calendar-rules-v3.schema.json': '86ec46d639e703cc30dfb1b51fc9cbdb573c911e11920acf503babebec85ca57',
  'schemas/holiday-catalog-v2.schema.json': 'b1ef62006968380731209bdf31a952222ea2779811264cc492727bcca3122069',
  'schemas/special-regime-catalog-v3.schema.json': '50f8cb02b8e5b5bebffdb97594b9f3c51b89bb58b2ec26c487baea92f3a1854e',
  'schemas/social-procedure-catalog-v2.schema.json': '16bf46bfe0eeb88fe4015800e903c9b749eb8bb69b74a4e4474f9f5aa0186203'
});
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const privatePath = /(?:^|\/)(?:\.work|\.git|\.venv|node_modules|Userinput|private|arbeitskopien)(?:\/|$)|\.private\./;
export function assertPublicMvp09Path(path) {
  assert.ok(typeof path === 'string' && path.length && !path.startsWith('/') && !/[\\\x00-\x1f\x7f]/.test(path)
    && path.split('/').every(part => part && part !== '.' && part !== '..') && !privatePath.test(path),
  'Unsafe or private integrity path');
}
async function readPublic(repository, path) {
  assertPublicMvp09Path(path);
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
  assertPublicMvp09Path(path);
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
export function validateMvp09PublicIntegrity(files) {
  // Verify the fixed root before following any descriptor, including schemas.
  const manifest = verifyBytes(files, manifestPath, manifestSha256);
  assert.equal(manifest.releaseId, releaseId);
  assert.equal(manifest.releaseStatus, 'approved');
  assert.equal(manifest.formatVersion, '9.0.0');
  assert.equal(manifest.compatibility.minimumConsumerFormatVersion, '9.0.0');
  assert.equal(manifest.artifacts.length, 41);
  assert.equal(new Set(manifest.artifacts.map(item => item.path)).size, 41);
  assert.equal(manifest.sourceSummary.sourceIds.length, 128);
  assert.deepEqual(manifest.extensions['steimer.approval'].sourceReviewRef,
    { reviewId: 'MVP09-SOURCE-APPROVAL-20261018', sha256: sourceApprovalSha256 });
  const preparation = manifest.extensions['steimer.release-preparation'];
  for (const key of ['publicationApproved', 'deploymentApproved', 'productionActivation']) assert.equal(preparation[key], false);
  assert.equal(preparation.operatingApproval, 'requiresSeparateDecision');
  const docs = new Map(), roles = {};
  for (const [path, sha256] of Object.entries(schemaBindings)) verifyBytes(files, path, sha256);
  for (const item of manifest.artifacts) {
    assertPublicMvp09Path(item.path);
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
  assert.equal(administrative.paths.length, 25);
  assert.equal(administrative.paths.filter(row => row.pathId.startsWith('ti-')).length, 5);
  assert.equal(administrative.paths.filter(row => row.pathId.startsWith('gr-')).length, 7);
  for (const [canton, count] of [['lu', 4], ['zg', 4], ['ar', 5]])
    assert.equal(administrative.paths.filter(row => row.pathId.startsWith(canton + '-')).length, count);
  assert.equal(administrative.qualificationPolicies.length, 25);
  assert.equal(administrative.holidayBindings.length, 5);
  assert.equal(administrative.releaseBinding.pathEligibility.length, 25);
  assert.ok(administrative.holidayBindings.every(row => row.physicalBaseline.releaseId === releaseId));
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
export async function loadMvp09PublicIntegrityInputs(repository = root) {
  const files = new Map([[manifestPath, await readPublic(repository, manifestPath)]]);
  const manifest = verifyBytes(files, manifestPath, manifestSha256);
  for (const item of manifest.artifacts) {
    assertPublicMvp09Path(item.path);
    const path = `${releasePath}/${item.path}`;
    files.set(path, await readPublic(repository, path));
  }
  for (const path of Object.keys(schemaBindings)) files.set(path, await readPublic(repository, path));
  async function runtimeTree(path) {
    const names = [];
    for (const entry of await readdir(resolve(repository, path), { withFileTypes: true })) {
      assert.ok(!entry.isSymbolicLink(), 'Symlink in runtime inventory');
      const child = `${path}/${entry.name}`;
      assertPublicMvp09Path(child);
      if (entry.isDirectory()) names.push(...await runtimeTree(child));
      else { assert.ok(entry.isFile(), 'Non-file in runtime inventory'); names.push(child); }
    }
    return names;
  }
  assert.deepEqual((await runtimeTree(releasePath)).sort(),
    [manifestPath, ...manifest.artifacts.map(row => `${releasePath}/${row.path}`)].sort(),
    'Missing or extra runtime file');
  validateMvp09PublicIntegrity(files);
  return files;
}
export async function verifyMvp09PublicIntegrity(repository = root) {
  return validateMvp09PublicIntegrity(await loadMvp09PublicIntegrityInputs(repository));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 2, 'This verifier has no mutation, private-audit or automatic-fallback mode');
  console.log(JSON.stringify(await verifyMvp09PublicIntegrity(), null, 2));
}
