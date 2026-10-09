// SPDX-License-Identifier: AGPL-3.0-only
// Negative mutations stay in memory. No test can persist an invented decision.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { root, approvalPath, completenessPath, decisionPath, hash,
  loadMvp06ApprovalInputs, validateMvp06SourceApproval, verifyMvp06SourceApproval } from '../../scripts/verify-mvp06-source-approval.mjs';
import { makeMvp06SourceApproval } from '../../scripts/record-mvp06-source-approval.mjs';
const originalBytes = await readFile(resolve(root, approvalPath));
const original = JSON.parse(originalBytes);
const { files: originalFiles } = await loadMvp06ApprovalInputs();
const fixture = () => ({ approval: structuredClone(original), files: new Map(originalFiles) });
const check = f => validateMvp06SourceApproval(f.approval, f.files);

test('MVP06 verifies the exact decision and reproduces its 170 evidence bindings', async () => {
  const result = await verifyMvp06SourceApproval();
  assert.equal(result.approvalSha256, hash(originalBytes));
  assert.equal(result.verifiedEvidenceFiles, 170);
  assert.equal(result.distinctSources, 159);
  assert.equal(result.localDataPromotionAuthorized, true);
  assert.equal(result.definitiveLocalBuildAuthorized, true);
  assert.equal(result.installationAuthorized, false);
  assert.equal(result.publicationAuthorized, false);
  assert.equal(result.hostingChangesAuthorized, false);
  assert.equal(result.operatingApproval, false);
  assert.deepEqual((await makeMvp06SourceApproval()).approval, original);
});
for (const key of ['declaration', 'approvedBy', 'approvedOn', 'reviewId', 'approvalId', 'releaseId', 'recordStatus', 'decisionRef']) {
  test(`MVP06 rejects altered decision ${key}`, () => {
    const f = fixture(); f.approval[key] = 'synthetic-invalid'; assert.throws(() => check(f));
  });
}
test('MVP06 rejects expanded external permissions and invented four-eyes review', () => {
  for (const key of ['installationAuthorized', 'publicationAuthorized', 'hostingChangesAuthorized', 'operatingApproval', 'extraPermission']) {
    const f = fixture(); f.approval.permissions[key] = true; assert.throws(() => check(f));
  }
  const f = fixture(); f.approval.responsibility.formalFourEyes = true; assert.throws(() => check(f));
  for (const key of ['productionApproval', 'runtimeActivation', 'dataPromotionAuthorized']) {
    const g = fixture(); g.approval[key] = true; assert.throws(() => check(g), /invented authority/);
  }
});
test('MVP06 rejects broader cantons, extra rules and changed time scope', () => {
  const f = fixture(); f.approval.scope.operativeCantons.push('ZH'); assert.throws(() => check(f));
  const g = fixture(); g.approval.scope.federalRules++; assert.throws(() => check(g));
  const h = fixture(); h.approval.scope.coverage.to = '2028-12-31'; assert.throws(() => check(h));
});
test('MVP06 rejects missing, duplicate, modified or extra evidence', () => {
  const f = fixture(); f.approval.evidence = f.approval.evidence.filter(item => item.path !== decisionPath); assert.throws(() => check(f));
  const g = fixture(); g.approval.evidence.push(g.approval.evidence[0]); assert.throws(() => check(g), /Duplicate/);
  const h = fixture(); h.files.set(decisionPath, Buffer.from('fabricated')); assert.throws(() => check(h), /Changed/);
  const j = fixture(); j.files.set('docs/unrequested.md', Buffer.from('unrequested'));
  j.approval.evidence.push({ path: 'docs/unrequested.md', sha256: hash(j.files.get('docs/unrequested.md')), byteLength: 11 });
  assert.throws(() => check(j), /exact accepted closure/);
});
test('MVP06 refuses historical evidence redirection even with identical hashes', () => {
  const f = fixture(); const item = f.approval.evidence.find(item => item.resolvedPath);
  assert.ok(item); item.resolvedPath = 'outputs/other/source-register.json'; assert.throws(() => check(f), /redirected/);
  const g = fixture(); g.approval.evidence.find(item => item.path === decisionPath).resolvedPath = 'outputs/other.md'; assert.throws(() => check(g), /redirection/);
});
test('MVP06 cannot rewrite the accepted candidate proof as approved', () => {
  const f = fixture(); const report = JSON.parse(f.files.get(completenessPath)); report.humanApproval = true;
  f.files.set(completenessPath, Buffer.from(JSON.stringify(report))); assert.throws(() => check(f));
});
test('MVP06 retains historical catalog dates, unclear AI, annual due date and all limits', () => {
  const f = fixture(); f.approval.catalogReuse.originalReviewedOn = '2026-10-01'; assert.throws(() => check(f));
  const g = fixture(); g.approval.catalogReuse.claimedFreshFullReview = true; assert.throws(() => check(g));
  const h = fixture(); h.approval.knownConflict.retainedOutcome = 'unchanged'; assert.throws(() => check(h));
  const j = fixture(); j.approval.nextAnnualReviewDue = '2028-11-15'; assert.throws(() => check(j));
  const k = fixture(); k.approval.retainedLimits.pop(); assert.throws(() => check(k));
});
