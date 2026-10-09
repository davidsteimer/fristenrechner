// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, lstat, symlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { approvalPath, requiredBindings, verifyMvp07SourceApproval } from '../../scripts/record-mvp07-source-approval.mjs';
import { assertPublicMvp07Path, isPrivateMvp07Evidence, manifestPath, releasePath,
  loadMvp07PublicIntegrityInputs, validateMvp07PublicIntegrity, verifyMvp07PublicIntegrity } from '../../scripts/verify-mvp07-public-integrity.mjs';
import { privateMvp06Suites, privateMvp07Suites, selectStandardSuites } from '../../scripts/run-standard-tests.mjs';

const original = await loadMvp07PublicIntegrityInputs();
const approval = JSON.parse(original.get(approvalPath));
const fixture = () => new Map(original);
async function portable(action) {
  const directory = await mkdtemp(join(tmpdir(), 'mvp07-public-integrity-'));
  try {
    for (const [path, bytes] of original) {
      await mkdir(dirname(join(directory, path)), { recursive: true });
      await writeFile(join(directory, path), bytes);
    }
    return await action(directory);
  } finally { await rm(directory, { recursive: true, force: true }); }
}

test('MVP07 verifies the exact 42 public source files, 41 runtime files and bounded governance without inventing full audit', async () => {
  const result = await verifyMvp07PublicIntegrity();
  assert.equal(result.verificationScope, 'public-integrity');
  assert.equal(result.publicSourceEvidenceFilesVerified, 42);
  assert.equal(result.privateSourceEvidenceFilesBoundButNotRechecked, 541);
  assert.equal(result.runtimeFilesVerified, 41);
  assert.equal(result.governanceEvidenceFilesVerified, 14);
  assert.equal(result.uniquePublicFilesVerified, 98);
  assert.equal(result.aiTreatmentUnchanged, true);
  for (const key of ['historicalFrPracticePositiveCaseApproval', 'privateRawEvidenceRechecked', 'completeSourceAuditReproduced',
    'privateAcceptanceArchivesRechecked', 'newApprovalGranted', 'promotionPerformed', 'installationAuthorized',
    'publicationAuthorized', 'operatingApproval']) assert.equal(result[key], false);
});
test('real public-only copy succeeds without private scratch, Git, dependencies or acceptance TAR', () => portable(async directory => {
  for (const absent of ['.work', '.git', 'node_modules', 'outputs/ap21-abnahme-2026-10-08'])
    await assert.rejects(lstat(join(directory, absent)), { code: 'ENOENT' });
  assert.deepEqual(await verifyMvp07PublicIntegrity(directory), validateMvp07PublicIntegrity(original));
}));
test('the strict source audit still fails on the public-only repository, never downgrading to a public pass', () => portable(async directory => {
  // Supply strict aliases too, so the failure is specifically a missing private
  // original, not merely a missing live alias of archived public evidence.
  for (const path of Object.keys(requiredBindings)) {
    const entry = approval.evidence.find(item => item.path === path);
    await mkdir(dirname(join(directory, path)), { recursive: true });
    await writeFile(join(directory, path), original.get(entry.archivedAt ?? entry.path));
  }
  await assert.rejects(verifyMvp07SourceApproval(directory), error => error.code === 'ENOENT' && /\/\.work(?:\/|$)/.test(error.path));
}));
test('changed approval or manifest is rejected before classification or descriptor traversal', () => {
  for (const path of [approvalPath, manifestPath]) {
    const files = fixture(); files.set(path, Buffer.concat([files.get(path), Buffer.from('\n')]));
    assert.throws(() => validateMvp07PublicIntegrity(files), /Changed public evidence/);
  }
  const files = fixture(), changed = structuredClone(approval);
  changed.permissions.publicationAuthorized = true;
  changed.evidence[0].path = '.work/invented-exclusion';
  files.set(approvalPath, Buffer.from(JSON.stringify(changed)));
  assert.throws(() => validateMvp07PublicIntegrity(files), /Changed public evidence/);
});
test('every actual public input is mandatory, and an unrelated replacement cannot expand the closure', () => {
  for (const path of original.keys()) {
    const files = fixture(); files.delete(path);
    assert.throws(() => validateMvp07PublicIntegrity(files), /Missing public evidence/);
  }
  const files = fixture(); files.set('docs/unrelated.md', Buffer.from('extra'));
  assert.throws(() => validateMvp07PublicIntegrity(files), /exact bound closure/);
});
test('changed source, runtime, local decision and adopted governance bytes fail', () => {
  for (const path of [
    'docs/fachrecht/abnahme-quellen-mvp07.md', `${releasePath}/calendars/be-public-holidays.json`,
    'docs/betrieb/freigabe-r07-b.md', 'data/source-reviews/source-register.json',
    'outputs/release-mvp07-2026-10-08/source-version-bridges.json'
  ]) {
    const files = fixture(); files.set(path, Buffer.concat([files.get(path), Buffer.from('\n')]));
    assert.throws(() => validateMvp07PublicIntegrity(files), /Changed public evidence/);
  }
});
test('missing archived source is not replaced with an available current alias', () => portable(async directory => {
  const selected = approval.evidence.find(item => item.archivedAt && !isPrivateMvp07Evidence(item));
  await rm(join(directory, selected.archivedAt));
  await mkdir(dirname(join(directory, selected.path)), { recursive: true });
  await writeFile(join(directory, selected.path), original.get(selected.archivedAt));
  await assert.rejects(verifyMvp07PublicIntegrity(directory), { code: 'ENOENT' });
}));
test('symlinked public evidence is rejected even with matching bytes', () => portable(async directory => {
  const path = 'docs/fachrecht/abnahme-quellen-mvp07.md';
  await rm(join(directory, path));
  await writeFile(join(directory, 'redirect'), original.get(path));
  await symlink(join(directory, 'redirect'), join(directory, path));
  await assert.rejects(verifyMvp07PublicIntegrity(directory), /Not regular public evidence/);
}));
test('extra runtime files and symlink directories cannot hide outside the manifest', () => portable(async directory => {
  const extra = join(directory, releasePath, 'unbound.json');
  await writeFile(extra, '{}');
  await assert.rejects(verifyMvp07PublicIntegrity(directory), /Missing or extra public runtime file/);
  await rm(extra);
  await symlink(join(directory, releasePath, 'calendars'), join(directory, releasePath, 'redirect'));
  await assert.rejects(verifyMvp07PublicIntegrity(directory), /Symlink in public runtime inventory/);
}));
test('path protection includes nested scratch/private archives, traversal and symlinks are not followed', () => {
  for (const path of ['../escape', '/absolute', 'a/../b', 'a//b', 'a/./b', 'a\\b', 'a\nb',
    '.work/raw.json', 'outputs/archive/.work/raw.json', 'outputs/x/source.private.tar.gz', 'Userinput/source.json'])
    assert.throws(() => assertPublicMvp07Path(path), /Unsafe or private/);
  assert.ok(isPrivateMvp07Evidence({ path: 'outputs/public.json', archivedAt: 'outputs/archive/.work/raw.json' }));
});
test('only five named MVP07 private suites are excluded, future or ordinary tests remain public', () => {
  assert.deepEqual(privateMvp07Suites, [
    'tests/governance/mvp07-preparation.test.mjs', 'tests/governance/mvp07-source-coverage.test.mjs',
    'tests/governance/mvp07-source-approval.test.mjs', 'tests/governance/mvp07-source-adoption.test.mjs',
    'tests/governance/mvp07-promotion-safety.test.mjs'
  ]);
  const publicPaths = ['tests/core/mvp07-release.test.ts', 'tests/governance/mvp07-source-inventory.test.mjs',
    'tests/governance/mvp07-public-integrity.test.mjs', 'tests/governance/mvp07-spfx-correction.test.mjs',
    'tests/governance/mvp07-recovery-0703.test.mjs', 'tests/governance/unknown-future.test.mjs'];
  assert.deepEqual(selectStandardSuites([...privateMvp06Suites, ...privateMvp07Suites, ...publicPaths]), publicPaths);
});
