// SPDX-License-Identifier: AGPL-3.0-only
// Negative variants stay in memory, never as purported human decisions on disk.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { root, approvalPath, decisionPath, reportPath, loadMvp07ApprovalInputs, makeMvp07SourceApproval,
  validateMvp07SourceApproval, verifyMvp07SourceApproval, permissions } from '../../scripts/record-mvp07-source-approval.mjs';
import { verifyHistoricalMvp07SourceProof } from './mvp07HistoricalSourceProof.mjs';

const { files } = await loadMvp07ApprovalInputs();
const original = JSON.parse(await readFile(`${root}/${approvalPath}`));
const check = approval => validateMvp07SourceApproval(approval, files);

test('MVP07 records the exact source approval and preserves the separate promotion/build gates', async () => {
  const result = await verifyMvp07SourceApproval();
  assert.equal(result.verifiedEvidenceFiles, 583);
  assert.equal(result.archivedQaInputs, 10);
  assert.equal(result.sourceReviewApproved, true);
  assert.equal(result.localDataPromotionAuthorized, false);
  assert.equal(result.definitiveLocalBuildAuthorized, false);
  assert.deepEqual(makeMvp07SourceApproval(files), original);
});

for (const key of ['declaration', 'approvedBy', 'approvedOn', 'candidateReleaseId', 'recordStatus']) {
  test(`MVP07 rejects altered acceptance ${key}`, () => {
    const altered = structuredClone(original); altered[key] = 'synthetic-invalid';
    assert.throws(() => check(altered));
  });
}

test('MVP07 rejects all new authority including promotion, builds, deployment and four-eyes claims', () => {
  for (const key of Object.keys(permissions).filter(key => key !== 'sourceReviewApproved')) {
    const altered = structuredClone(original); altered.permissions[key] = true;
    assert.throws(() => check(altered));
  }
  const altered = structuredClone(original); altered.productionActivation = true;
  assert.throws(() => check(altered));
  const fourEyes = structuredClone(original); fourEyes.responsibility.formalFourEyes = true;
  assert.throws(() => check(fourEyes));
});

test('MVP07 rejects enlarged source, social or temporal scope', () => {
  for (const mutate of [a => a.scope.sources++, a => a.scope.socialOperativeCantons.push('ZH'),
    a => a.scope.socialCoverage.to = '2028-12-31', a => a.scope.allOriginalsFreshlyRead = true]) {
    const altered = structuredClone(original); mutate(altered); assert.throws(() => check(altered));
  }
});

test('MVP07 retains AI treatment and the limited FR mirror role', () => {
  for (const mutate of [a => a.knownConflict.officialCorrectionClaimed = true,
    a => a.knownConflict.retainedOutcome = 'unchanged', a => a.historicalFrPractice.officialOriginalConfirmed = true,
    a => a.historicalFrPractice.positiveCaseApproval = true, a => a.historicalFrPractice.currentNormSeparatelyConfirmed = false]) {
    const altered = structuredClone(original); mutate(altered); assert.throws(() => check(altered));
  }
});

test('MVP07 retains the two unique version events and original limitations', () => {
  const altered = structuredClone(original); altered.acceptedVersionEvents.pop();
  assert.throws(() => check(altered));
  const withoutLimits = structuredClone(original); withoutLimits.retainedLimits.pop();
  assert.throws(() => check(withoutLimits));
});

test('MVP07 rejects missing, duplicate, altered or redirected evidence', () => {
  const missing = structuredClone(original); missing.evidence.pop(); assert.throws(() => check(missing));
  const duplicate = structuredClone(original); duplicate.evidence.push(duplicate.evidence[0]); assert.throws(() => check(duplicate));
  const redirected = structuredClone(original); redirected.evidence.find(item => item.archivedAt).archivedAt = 'outputs/unrelated/file';
  assert.throws(() => check(redirected));
  for (const path of [decisionPath, reportPath, original.evidence.find(item => item.path.startsWith('.work/')).path]) {
    const changed = new Map(files); changed.set(path, Buffer.from('synthetic changed bytes'));
    assert.throws(() => validateMvp07SourceApproval(original, changed));
  }
});

test('MVP07 preserves the original candidate proof and archived protected inputs after promotion', async () => {
  const report = await verifyHistoricalMvp07SourceProof();
  assert.deepEqual(report, JSON.parse(files.get(reportPath)));
  assert.equal(report.humanApproval, false);
  assert.equal(report.dataPromotionApproved, false);
  assert.equal(report.counts.protectedFilesUnchanged, 185);
});
