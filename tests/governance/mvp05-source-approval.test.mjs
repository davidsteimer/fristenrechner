// SPDX-License-Identifier: AGPL-3.0-only
// Mutations are exclusively in memory, no invented decisions are persisted.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { root, approvalPath, completenessPath, hash, validateMvp05SourceApproval, verifyMvp05SourceApproval } from '../../scripts/verify-mvp05-source-approval.mjs';
import { prepareMvp05Inputs, outputPath } from '../../scripts/prepare-mvp05-inputs.mjs';
const original = JSON.parse(await readFile(resolve(root, approvalPath)));
const originalFiles = new Map(await Promise.all(original.evidence.map(async item => [item.path, await readFile(resolve(root, item.path))])));
const fixture = () => ({ approval: structuredClone(original), files: new Map(originalFiles) });
const check = ({ approval, files }) => validateMvp05SourceApproval(approval, files);

test('MVP05 verifies the exact human source and local-build decision without external authority', async () => {
  const result = await verifyMvp05SourceApproval();
  assert.equal(result.distinctSources, 135);
  assert.equal(result.verifiedEvidenceFiles, 15);
  assert.equal(result.sourceReviewApproved, true);
  assert.equal(result.localDataPromotionAuthorized, true);
  assert.equal(result.definitiveLocalBuildAuthorized, true);
  assert.equal(result.installationAuthorized, false);
  assert.equal(result.publicationAuthorized, false);
  assert.equal(result.operatingApproval, false);
});
for (const key of ['declaration', 'approvedBy', 'approvedOn', 'reviewId', 'releaseId', 'recordStatus', 'decisionRef']) {
  test(`MVP05 rejects changed human decision field ${key}`, () => {
    const f = fixture(); f.approval[key] = 'invalid-synthetic'; assert.throws(() => check(f));
  });
}
test('MVP05 rejects installation, publication, hosting and operating authority expansion', () => {
  for (const key of ['installationAuthorized', 'publicationAuthorized', 'hostingChangesAuthorized', 'operatingApproval']) {
    const f = fixture(); f.approval.permissions[key] = true; assert.throws(() => check(f));
  }
  const f = fixture(); f.approval.permissions.extraPermission = true; assert.throws(() => check(f));
});
test('MVP05 rejects broader canton scope and falsely independent four-eyes responsibility', () => {
  const f = fixture(); f.approval.scope.operativeCantons.push('ZH'); assert.throws(() => check(f));
  const g = fixture(); g.approval.responsibility.formalFourEyes = true; assert.throws(() => check(g));
});
test('MVP05 rejects missing, duplicate and modified evidence', () => {
  const f = fixture(); f.approval.evidence.shift(); assert.throws(() => check(f), /Missing required/);
  const g = fixture(); g.approval.evidence.push(g.approval.evidence[0]); assert.throws(() => check(g), /Duplicate/);
  const h = fixture(); h.files.set(completenessPath, Buffer.from('{}')); assert.throws(() => check(h), /Changed/);
});
test('MVP05 cannot erase retained limitations or manufacture resolution of AI', () => {
  const f = fixture(); f.approval.retainedLimits.pop(); assert.throws(() => check(f));
  const g = fixture(); g.approval.knownConflict.officialCorrectionClaimed = true; assert.throws(() => check(g));
});
test('historical preparation remains byte-reproducible after live register and version evolution', async () => {
  const { snapshot } = await prepareMvp05Inputs();
  assert.deepEqual(snapshot, JSON.parse(await readFile(resolve(root, outputPath))));
  assert.equal(snapshot.permissions.sourceReviewApproved, false, 'Historical snapshot stays historical');
  // This is an MVP05 assertion, not a cap on a later approved live register.
  const historicalBytes = await readFile(resolve(root, 'outputs/release-mvp06-2026-10-01/historical-baseline/data/source-reviews/source-register.json'));
  assert.equal(hash(historicalBytes), 'eb89b94c839fb01d92c4168dd99183d1c40818299b0a364247007b5bd933df7a');
  assert.equal(JSON.parse(historicalBytes).sources.length, 57);
});
