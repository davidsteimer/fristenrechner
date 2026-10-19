// SPDX-License-Identifier: AGPL-3.0-only
// Human decision bookkeeping, not a new legal review or product authorization.
import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadApprovalInputs, makeSourceApproval, validateSourceApproval, recordSourceApproval,
  readRegular, writeExclusive, archivePrefix, declaration, resultPath } from '../../scripts/record-mvp09-source-approval.mjs';

const inputs = await loadApprovalInputs(undefined, false);
test('R09 source decision binds exactly 251 IDs, 803 files and 21 direct archive copies', () => {
  const a = makeSourceApproval(inputs);
  assert.equal(a.evidence.length, 803);
  assert.equal(a.evidence.filter(e => e.archivedAt).length, 21);
  assert.equal(new Set(a.acceptedSourceIds).size, 251);
  assert.equal(a.humanSourceApproval, true);
  assert.equal(a.declaration, declaration);
  assert.equal(a.approvedOn, '2026-10-18');
  assert.equal(a.scope.administrativePaths, 25);
  assert.deepEqual(a.scope.administrativeCoverage, [
    { cantons: ['LU'], from: '2026-09-27', to: '2027-12-31' },
    { cantons: ['TI', 'GR', 'ZG', 'AR'], from: '2026-08-29', to: '2027-12-31' }
  ]);
  assert.deepEqual(a.scope.socialOperativeCantons, ['BE']);
  assert.equal(a.scope.socialRules, 44);
  assert.equal(a.scope.socialBindings, 50);
  assert.equal(a.explicitBoundedReuse.currentIvvConsolidationsAvailable, true);
  assert.deepEqual(a.explicitBoundedReuse.stillUnavailableFederalConsolidations, ['EOG', 'EOV', 'ÜLG', 'ÜLV']);
  assert.equal(a.explicitBoundedReuse.aiConflictResolved, false);
  assert.equal(a.explicitBoundedReuse.frPracticePositiveApproval, false);
  assert.deepEqual(Object.entries(a.permissions).filter(([, value]) => value).map(([key]) => key),
    ['sourceReviewApproved', 'buildProposalPreparationAuthorized']);
});
for (const [name, mutate] of Object.entries({
  'promotion authority': a => { a.permissions.localDataPromotionAuthorized = true; },
  'commit authority': a => { a.permissions.localCommitAuthorized = true; },
  'build authority': a => { a.permissions.definitiveLocalBuildAuthorized = true; },
  'publication authority': a => { a.permissions.publicationAuthorized = true; },
  'operating authority': a => { a.operatingApproval = true; },
  'source release authority': a => { a.sourceReleaseApproved = true; },
  'changed human words': a => { a.declaration += ' Build approved.'; },
  'changed acceptance date': a => { a.approvedOn = '2026-10-19'; },
  'expanded case scope': a => { a.scope.additionalCasesApproved = true; },
  'wrong LU window': a => { a.scope.administrativeCoverage[0].from = '2026-08-29'; },
  'new social canton': a => { a.scope.socialOperativeCantons.push('LU'); },
  'lost uncertainty': a => { a.explicitBoundedReuse.frPracticePositiveApproval = true; },
  'lost IVV availability distinction': a => { a.explicitBoundedReuse.currentIvvConsolidationsAvailable = false; },
  'missing evidence': a => { a.evidence.pop(); },
  'changed evidence hash': a => { a.evidence[0].sha256 = '0'.repeat(64); },
  'missing archive binding': a => { delete a.evidence.find(e => e.archivedAt).archivedAt; }
})) test('reject ' + name, () => {
  const a = structuredClone(makeSourceApproval(inputs));
  mutate(a);
  assert.throws(() => validateSourceApproval(a, inputs));
});
test('reject changed source bytes, missing bytes and changed descriptor length before recording', () => {
  const changed = { files: new Map(inputs.files), bindings: inputs.bindings };
  changed.files.set(resultPath, Buffer.from('changed'));
  assert.throws(() => makeSourceApproval(changed));
  const missing = { files: new Map(inputs.files), bindings: inputs.bindings };
  missing.files.delete(inputs.bindings[0].path);
  assert.throws(() => makeSourceApproval(missing));
  const lengths = { files: inputs.files, bindings: structuredClone(inputs.bindings) };
  lengths.bindings[0].byteLength++;
  assert.throws(() => makeSourceApproval(lengths));
});
test('archive writer is idempotent, never overwrites changed or empty evidence', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'mvp09-approval-'));
  await writeExclusive(temp, 'proof/a.txt', Buffer.from('synthetic'));
  await writeExclusive(temp, 'proof/a.txt', Buffer.from('synthetic'));
  await assert.rejects(writeExclusive(temp, 'proof/a.txt', Buffer.from('changed')));
  await writeExclusive(temp, 'proof/empty.txt', Buffer.alloc(0));
  await assert.rejects(writeExclusive(temp, 'proof/empty.txt', Buffer.from('changed')));
  assert.deepEqual(await readRegular(temp, 'proof/a.txt'), Buffer.from('synthetic'));
});
test('archive access rejects traversal, invalid separators and symlink parents or final files', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'mvp09-approval-path-'));
  await mkdir(join(temp, 'actual'));
  await symlink(join(temp, 'actual'), join(temp, 'linked'));
  for (const path of ['../outside', '/tmp/outside', 'a//b', 'a/./b', 'a:bad'])
    await assert.rejects(writeExclusive(temp, path, Buffer.from('x')));
  await assert.rejects(writeExclusive(temp, 'linked/a.txt', Buffer.from('x')));
  await writeExclusive(temp, 'actual/a.txt', Buffer.from('x'));
  await symlink(join(temp, 'actual/a.txt'), join(temp, 'file.txt'));
  await assert.rejects(readRegular(temp, 'file.txt'));
});
test('partial source-approval archive stops before any attempted repair', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'mvp09-approval-partial-'));
  await mkdir(join(temp, archivePrefix), { recursive: true });
  await assert.rejects(recordSourceApproval(temp), /Partial archive exists/);
});

