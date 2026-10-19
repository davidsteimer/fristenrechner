// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { lstat, mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { manifestPath, releasePath, schemaBindings, assertPublicMvp09Path,
  loadMvp09PublicIntegrityInputs, validateMvp09PublicIntegrity,
  verifyMvp09PublicIntegrity } from '../../scripts/verify-mvp09-public-integrity.mjs';

const original = await loadMvp09PublicIntegrityInputs();
async function portable(action) {
  const directory = await mkdtemp(join(tmpdir(), 'mvp09-public-integrity-'));
  try {
    for (const [path, bytes] of original) {
      await mkdir(dirname(join(directory, path)), { recursive: true });
      await writeFile(join(directory, path), bytes);
    }
    return await action(directory);
  } finally { await rm(directory, { recursive: true, force: true }); }
}

test('public check verifies exact 42 runtime files and seven schema byte identities, never pretending source/legal audit', async () => {
  const result = await verifyMvp09PublicIntegrity();
  assert.equal(result.verificationScope, 'public-pinned-runtime-and-schema-integrity');
  assert.equal(result.runtimeFilesVerified, 42);
  assert.equal(result.schemaFilesVerified, 7);
  assert.equal(result.uniquePublicFilesVerified, 49);
  assert.equal(result.schemaByteIntegrityVerified, true);
  for (const flag of ['privateEvidenceRequired', 'privateRawEvidenceRechecked', 'sourceApprovalEvidenceReopened',
    'completeSourceAuditReproduced', 'semanticProjectionAuditReproduced', 'schemaValidationPerformed', 'gitHistoryChecked',
    'newApprovalGranted', 'promotionPerformed', 'installationAuthorized', 'publicationAuthorized', 'operatingApproval'])
    assert.equal(result[flag], false, flag);
});
test('real minimal copy passes without Git, dependencies, outputs, human decision archives or private raw evidence', () => portable(async directory => {
  for (const absent of ['.git', '.work', '.venv', 'node_modules', 'outputs', 'Userinput', 'docs'])
    await assert.rejects(lstat(join(directory, absent)), { code: 'ENOENT' });
  assert.deepEqual(await verifyMvp09PublicIntegrity(directory), validateMvp09PublicIntegrity(original));
}));
test('no one of the exact 49 public inputs is optional', () => {
  for (const path of original.keys()) {
    const changed = new Map(original);
    changed.delete(path);
    assert.throws(() => validateMvp09PublicIntegrity(changed), /Missing public input/);
  }
});
test('all component bytes and schema bytes are independently hash-bound', () => {
  for (const path of original.keys()) {
    const changed = new Map(original);
    changed.set(path, Buffer.concat([changed.get(path), Buffer.from('\n')]));
    assert.throws(() => validateMvp09PublicIntegrity(changed), /Changed public input/);
  }
});
test('forged manifest is rejected before following private or traversal descriptors', () => {
  for (const path of ['../../Userinput/private.json', '.work/raw.json', '/absolute']) {
    const changed = new Map(original), manifest = JSON.parse(changed.get(manifestPath));
    manifest.artifacts[0].path = path;
    manifest.extensions['steimer.release-preparation'].publicationApproved = true;
    changed.set(manifestPath, Buffer.from(JSON.stringify(manifest)));
    assert.throws(() => validateMvp09PublicIntegrity(changed), /Changed public input/);
  }
});
test('unrelated inputs cannot be interpreted as a larger audit closure', () => {
  const changed = new Map(original);
  changed.set('outputs/private-approval.json', Buffer.from('{}'));
  assert.throws(() => validateMvp09PublicIntegrity(changed), /Unexpected public input closure/);
});
test('runtime extras are rejected even if all manifest-bound files still match', () => portable(async directory => {
  await writeFile(join(directory, releasePath, 'extra.json'), '{}');
  await assert.rejects(verifyMvp09PublicIntegrity(directory), /Missing or extra runtime file/);
}));
test('symlinked file with identical bytes is not a valid source copy', () => portable(async directory => {
  const path = Object.keys(schemaBindings)[0];
  await rm(join(directory, path));
  await writeFile(join(directory, 'redirect'), original.get(path));
  await symlink(join(directory, 'redirect'), join(directory, path));
  await assert.rejects(verifyMvp09PublicIntegrity(directory), /Not regular public input/);
}));
test('unreferenced runtime directory symlink is rejected', () => portable(async directory => {
  await symlink(join(directory, releasePath, 'calendars'), join(directory, releasePath, 'redirect'));
  await assert.rejects(verifyMvp09PublicIntegrity(directory), /Symlink in runtime inventory/);
}));
test('public path guard rejects private roots, traversal and ambiguous encodings', () => {
  for (const path of ['../escape', '/absolute', 'a/../b', 'a/./b', 'a//b', 'a\\b', 'a\nb',
    '.work/raw.json', '.git/config', 'Userinput/a.json', 'a/private/b', 'outputs/a.private.tar.gz'])
    assert.throws(() => assertPublicMvp09Path(path), /Unsafe or private integrity path/);
});
