// SPDX-License-Identifier: AGPL-3.0-only
// Decision bookkeeping and preservation tests, not a fresh legal review.
import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadApprovalInputs, makeSourceApproval, validateSourceApproval, verifySourceApproval,
  readRegular, writeExclusive } from '../../scripts/record-mvp08-source-approval.mjs';

const inputs = await loadApprovalInputs();
test('accepted source decision has 243 IDs, 559 bound files and 18 archived inputs', async () => {
  const actual = await verifySourceApproval();
  assert.equal(actual.evidenceFiles, 559);
  assert.equal(actual.archivedInputs, 18);
  const approval = makeSourceApproval(inputs);
  assert.equal(new Set(approval.acceptedSourceIds).size, 243);
  assert.equal(approval.scope.administrativePaths, 12);
  assert.equal(approval.scope.socialRules, 44);
  assert.equal(Object.keys(approval.acceptedNormBridges).length, 8);
  assert.equal(approval.explicitBoundedReuse.frPracticePositiveApproval, false);
  assert.equal(approval.explicitBoundedReuse.aiTreatmentUnchanged, true);
  assert.deepEqual(Object.entries(approval.permissions).filter(([, value]) => value).map(([key]) => key),
    ['sourceReviewApproved', 'buildProposalPreparationAuthorized']);
});
for (const [name, mutate] of Object.entries({
  'promotion authority': a => { a.permissions.localDataPromotionAuthorized = true; },
  'commit authority': a => { a.permissions.localCommitAuthorized = true; },
  'build authority': a => { a.permissions.definitiveLocalBuildAuthorized = true; },
  'changed human words': a => { a.declaration += ' Build approved.'; },
  'extra case approval': a => { a.scope.additionalCasesApproved = true; },
  'lost uncertainty': a => { a.explicitBoundedReuse.frPracticePositiveApproval = true; },
  'missing evidence': a => { a.evidence.pop(); },
  'changed evidence hash': a => { a.evidence[0].sha256 = '0'.repeat(64); }
})) test(`rejects ${name}`, () => {
  const approval = structuredClone(makeSourceApproval(inputs));
  mutate(approval);
  assert.throws(() => validateSourceApproval(approval, inputs));
});
test('archive writer is idempotent but refuses different bytes', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'mvp08-approval-'));
  const original = Buffer.from('synthetic evidence');
  await writeExclusive(temp, 'proof/a.txt', original);
  await writeExclusive(temp, 'proof/a.txt', original);
  await assert.rejects(writeExclusive(temp, 'proof/a.txt', Buffer.from('changed')));
  assert.deepEqual(await readRegular(temp, 'proof/a.txt'), original);
});
test('archive access rejects traversal and symlinks', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'mvp08-approval-path-'));
  await mkdir(join(temp, 'actual'));
  await symlink(join(temp, 'actual'), join(temp, 'linked'));
  await assert.rejects(writeExclusive(temp, '../outside.txt', Buffer.from('x')));
  await assert.rejects(writeExclusive(temp, 'linked/file.txt', Buffer.from('x')));
});
