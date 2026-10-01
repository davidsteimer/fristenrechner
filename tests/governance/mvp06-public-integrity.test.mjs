// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, lstat, readFile, symlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { approvalPath, validateMvp06SourceApproval } from '../../scripts/verify-mvp06-source-approval.mjs';
import { isPrivateEvidence, manifestPath, loadMvp06PublicIntegrityInputs,
  validateMvp06PublicIntegrity, verifyMvp06PublicIntegrity } from '../../scripts/verify-mvp06-public-integrity.mjs';
import { privateMvp06Suites, selectStandardSuites } from '../../scripts/run-standard-tests.mjs';

const original = await loadMvp06PublicIntegrityInputs();
const approval = JSON.parse(original.approvalBytes);
const fixture = () => ({ ...original, files: new Map(original.files) });
const check = value => validateMvp06PublicIntegrity(value.approvalBytes, value.files, value.manifestBytes);
async function portable(action) {
  const directory = await mkdtemp(join(tmpdir(), 'mvp06-public-integrity-'));
  try {
    const entries = [[approvalPath, original.approvalBytes], [manifestPath, original.manifestBytes],
      ...approval.evidence.filter(item => !isPrivateEvidence(item)).map(item =>
        [item.resolvedPath ?? item.path, original.files.get(item.path)])];
    for (const [path, bytes] of entries) {
      await mkdir(dirname(join(directory, path)), { recursive: true });
      await writeFile(join(directory, path), bytes);
    }
    return await action(directory);
  } finally { await rm(directory, { recursive: true, force: true }); }
}

test('MVP06 public integrity verifies 63 exact files and explicitly does not repeat 107 private originals', async () => {
  const result = await verifyMvp06PublicIntegrity();
  assert.equal(result.verificationScope, 'public-integrity');
  assert.equal(result.publicEvidenceFilesVerified, 63);
  assert.equal(result.privateEvidenceFilesBoundButNotRechecked, 107);
  for (const key of ['privateRawEvidenceRechecked', 'completeSourceAuditReproduced', 'newApprovalGranted',
    'promotionPerformed', 'installationAuthorized', 'publicationAuthorized', 'operatingApproval']) assert.equal(result[key], false);
});
test('the public check succeeds without private scratch, Git or installed dependencies in the evidence repository', () => portable(async directory => {
  for (const absent of ['.work', '.git', 'node_modules']) await assert.rejects(lstat(join(directory, absent)), { code: 'ENOENT' });
  assert.deepEqual(await verifyMvp06PublicIntegrity(directory), check(original));
}));
test('strict approval validation still rejects a public-only evidence set', () => {
  assert.throws(() => validateMvp06SourceApproval(approval, original.files), /Missing approval evidence/);
});
test('changed, reformatted or permission-expanded approval and manifest bytes are rejected before loading paths', () => {
  for (const key of ['approvalBytes', 'manifestBytes']) {
    const f = fixture(); f[key] = Buffer.concat([f[key], Buffer.from('\n')]); assert.throws(() => check(f), /Changed exact/);
  }
  const f = fixture(), changed = structuredClone(approval);
  changed.permissions.publicationAuthorized = true;
  changed.evidence[0].path = '.work/invented-private-bypass';
  f.approvalBytes = Buffer.from(JSON.stringify(changed));
  assert.throws(() => check(f), /Changed exact human approval/);
});
test('all 63 public files are mandatory, exact and cannot be replaced by unrequested evidence', () => {
  for (const path of original.files.keys()) {
    const f = fixture(); f.files.delete(path); assert.throws(() => check(f), /exact non-private/);
    const g = fixture(); g.files.set(path, Buffer.concat([g.files.get(path), Buffer.from('\n')]));
    assert.throws(() => check(g), /Changed public evidence/);
  }
  const f = fixture(); f.files.set('docs/extra.md', Buffer.from('extra'));
  assert.throws(() => check(f), /exact non-private/);
});
test('the portable loader does not fall back to another copy if a public file is missing', () => portable(async directory => {
  const selected = approval.evidence.find(item => !isPrivateEvidence(item) && item.resolvedPath);
  await rm(join(directory, selected.resolvedPath));
  await mkdir(dirname(join(directory, selected.path)), { recursive: true });
  await writeFile(join(directory, selected.path), original.files.get(selected.path));
  await assert.rejects(verifyMvp06PublicIntegrity(directory), { code: 'ENOENT' });
}));
test('the portable loader rejects symlinks even when the redirected bytes match', () => portable(async directory => {
  const selected = approval.evidence.find(item => !isPrivateEvidence(item) && item.path.startsWith('docs/'));
  const path = join(directory, selected.path), bytes = await readFile(path);
  await rm(path); await writeFile(join(directory, 'redirect'), bytes);
  await symlink(join(directory, 'redirect'), path);
  await assert.rejects(verifyMvp06PublicIntegrity(directory), /Not regular public evidence/);
}));
test('explicit suite separation excludes exactly the named private audit, never unknown or missing tests', () => {
  assert.equal(privateMvp06Suites.length, 5);
  const publicPaths = ['tests/core/mvp06-release.test.ts', 'tests/governance/mvp06-public-integrity.test.mjs',
    'tests/governance/future-new-test.test.mjs'];
  assert.deepEqual(selectStandardSuites([...privateMvp06Suites, ...publicPaths]), publicPaths);
  assert.ok(isPrivateEvidence({ path: 'outputs/archive/.work/raw.txt' }));
  assert.ok(isPrivateEvidence({ path: 'outputs/public.json', resolvedPath: '.work/raw.json' }));
});
