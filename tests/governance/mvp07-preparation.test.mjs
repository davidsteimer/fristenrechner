// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { lstat, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import {
  acceptanceRegisters, archiveRoot, candidatePath, outputPath, assertAllowedEvidencePath,
  assertMvp07CandidateContract, assertSafeRelativePath, loadMvp07Archive,
  prepareMvp07Inputs, persistMvp07Inputs, validateMvp07Inputs
} from '../../scripts/prepare-mvp07-inputs.mjs';

const prepared = await prepareMvp07Inputs();
const cloneFiles = () => new Map(prepared.files);
async function temporary(action) {
  const directory = await mkdtemp(join(tmpdir(), 'mvp07-preparation-test-'));
  try { return await action(directory); }
  finally { await rm(directory, { recursive: true }); }
}

test('MVP07 binds accepted AP22C3, AP21, forty candidate artifacts and unchanged production versions', () => {
  const { snapshot } = prepared;
  assert.equal(snapshot.status, 'preparation-only');
  assert.equal(snapshot.deployable, false);
  assert.deepEqual(snapshot.acceptance.map(item => item.archiveFilesVerified), [204, 192]);
  assert.equal(snapshot.acceptanceArchiveBindings.length, 396);
  assert.equal(snapshot.candidate.artifacts, 40);
  assert.equal(snapshot.candidate.calendars, 32);
  assert.equal(snapshot.priorProduct.applicationVersion, '0.6.0');
  assert.equal(snapshot.priorProduct.packageVersion, '0.6.0.1');
  assert.equal(snapshot.priorProduct.liveEnvironmentVerified, false);
  assert.equal(snapshot.permissions.localPreparationAuthorized, true);
  assert.ok(Object.entries(snapshot.permissions).filter(([key]) => key !== 'localPreparationAuthorized').every(([, value]) => value === false));
  assert.equal(snapshot.scope.bernSocialBindings, 50);
  assert.equal(snapshot.scope.additionalSocialOrCantonalProcedures, false);
});

test('MVP07 copies scoped technical and source inputs without private archives, operating records or Git', () => {
  for (const path of ['src/core/calculatorRuntime.ts', 'src/ui/FristenrechnerApp.tsx', 'scripts/prepare-mvp07-inputs.mjs',
    'tests/governance/mvp07-preparation.test.mjs', 'spfx/config/package-solution.json', 'public-app/.htaccess',
    'data/source-reviews/source-register.json', 'data/source-reviews/index.json', 'docs/fachrecht/abnahme-ap21.md']) assert.ok(prepared.files.has(path));
  assert.ok([...prepared.files.keys()].every(path => !/(?:^|\/)\.git(?:\/|$)|\.private\.|tests\/private\//.test(path)));
  assert.deepEqual([...prepared.files.keys()].filter(path => path.startsWith('docs/betrieb/')),
    ['docs/betrieb/deployment-mvp-07.md', 'docs/betrieb/vorpruefung-mvp-07.md']);
  assert.equal(prepared.snapshot.sourceInventory.evidenceFiles, 59);
  assert.equal(prepared.snapshot.sourceInventory.freshLegalVerificationPerformed, false);
  assert.ok(prepared.snapshot.acceptanceArchiveBindings.some(item => item.path.endsWith('.private.tar.gz')));
  assert.ok(![...prepared.files.keys()].some(path => path.endsWith('.tar.gz')));
  for (const register of acceptanceRegisters) assert.ok(prepared.files.has(register.path));
});

for (const path of [
  `${candidatePath}/manifest.json`, `${candidatePath}/calendars/be-public-holidays.json`,
  `${candidatePath}/social-procedures/ch-social-procedures.json`,
  'outputs/ap21-abnahme-2026-10-08/receipt.json', 'docs/fachrecht/abnahme-ap22c3.md',
  'data/source-reviews/index.json', 'src/ui/FristenrechnerApp.tsx'
]) test(`MVP07 rejects missing or changed snapshot input ${path}`, () => {
  const missing = cloneFiles(); missing.delete(path);
  assert.throws(() => validateMvp07Inputs(missing, prepared.snapshot));
  const changed = cloneFiles(); changed.set(path, Buffer.concat([changed.get(path), Buffer.from('\n')]));
  assert.throws(() => validateMvp07Inputs(changed, prepared.snapshot));
});

test('MVP07 candidate gate rejects a wrong format, false source review or export activation independently of hash checks', () => {
  const original = JSON.parse(prepared.files.get(`${candidatePath}/manifest.json`));
  for (const mutate of [
    value => { value.formatVersion = '6.0.0'; },
    value => { value.compatibility.minimumConsumerFormatVersion = '6.0.0'; },
    value => { value.releaseStatus = 'approved'; },
    value => { value.sourceSummary.legalBasisReviewStatus = 'verified'; },
    value => { value.extensions['steimer.local-reference'].calendarExportEnabled = true; },
    value => { value.extensions['steimer.local-reference'].sourceReleaseApproved = true; }
  ]) {
    const candidate = structuredClone(original); mutate(candidate);
    assert.throws(() => assertMvp07CandidateContract(candidate));
  }
  const snapshot = structuredClone(prepared.snapshot); snapshot.permissions.dataPromotionApproved = true;
  assert.throws(() => validateMvp07Inputs(prepared.files, snapshot));
});

test('MVP07 rejects traversal and unrelated evidence paths', () => {
  for (const path of ['/etc/passwd', '../outside', 'src/../outside', 'src//file', 'src/./file', 'src\\file', 'src/file\nsecret']) assert.throws(() => assertSafeRelativePath(path));
  for (const path of ['.git/config', 'docs/betrieb/private.json', 'outputs/unrelated/record.json',
    'src/private/secret.json', 'tests/private/audit.py', 'src/credentials.json', '.work/user-input.json']) assert.throws(() => assertAllowedEvidencePath(path));
  const files = cloneFiles(); files.set('outputs/unrelated/record.json', Buffer.from('{}'));
  assert.throws(() => validateMvp07Inputs(files));
});

test('MVP07 persistence is deterministic, append-only and independently verifiable', async () => temporary(async directory => {
  await persistMvp07Inputs(prepared, directory);
  const before = await readFile(join(directory, outputPath));
  await persistMvp07Inputs(prepared, directory);
  assert.ok((await readFile(join(directory, outputPath))).equals(before));
  const loaded = await loadMvp07Archive(directory);
  assert.deepEqual(loaded.snapshot, prepared.snapshot);
  for (const [path, bytes] of prepared.files) assert.ok(loaded.files.get(path).equals(bytes));
  // No live source copy is required to verify the new archive.
  await assert.rejects(lstat(join(directory, 'src')), { code: 'ENOENT' });
}));

test('MVP07 preflights all destinations before writing and preserves a differing existing file', async () => temporary(async directory => {
  const entry = prepared.snapshot.evidence.at(-1);
  await mkdir(dirname(join(directory, entry.archivedAt)), { recursive: true });
  await writeFile(join(directory, entry.archivedAt), 'existing-user-file\n');
  await assert.rejects(persistMvp07Inputs(prepared, directory), /Existing preparation differs/);
  assert.equal(await readFile(join(directory, entry.archivedAt), 'utf8'), 'existing-user-file\n');
  await assert.rejects(lstat(join(directory, outputPath)), { code: 'ENOENT' });
  await assert.rejects(lstat(join(directory, prepared.snapshot.evidence[0].archivedAt)), { code: 'ENOENT' });
}));

test('MVP07 missing or modified archive does not fall back to a live file', async () => temporary(async directory => {
  await persistMvp07Inputs(prepared, directory);
  const entry = prepared.snapshot.evidence.find(item => item.path === 'src/public-app/main.tsx');
  await mkdir(dirname(join(directory, entry.path)), { recursive: true });
  await writeFile(join(directory, entry.path), prepared.files.get(entry.path));
  await rm(join(directory, entry.archivedAt));
  await assert.rejects(loadMvp07Archive(directory), { code: 'ENOENT' });
  await writeFile(join(directory, entry.archivedAt), 'modified\n');
  await assert.rejects(loadMvp07Archive(directory), /Changed byte length|Changed bound/);
}));

test('MVP07 rejects redirected archive mappings and symlink parents', async () => temporary(async directory => {
  await persistMvp07Inputs(prepared, directory);
  const entry = prepared.snapshot.evidence.find(item => item.path === 'src/public-app/main.tsx');
  await rm(join(directory, entry.archivedAt));
  await symlink(join(directory, outputPath), join(directory, entry.archivedAt));
  await assert.rejects(loadMvp07Archive(directory), /Not a regular file/);
  const snapshot = structuredClone(prepared.snapshot);
  snapshot.evidence[0].archivedAt = '../outside';
  await writeFile(join(directory, outputPath), `${JSON.stringify(snapshot)}\n`);
  await assert.rejects(loadMvp07Archive(directory), /Unexpected archive mapping/);
}));

test('MVP07 never follows a symlink while creating an archive', async () => temporary(async directory => {
  await mkdir(join(directory, 'redirect'));
  await mkdir(join(directory, archiveRoot), { recursive: true });
  await symlink(join(directory, 'redirect'), join(directory, archiveRoot, 'files'));
  await assert.rejects(persistMvp07Inputs(prepared, directory), /Not a regular directory/);
  await assert.rejects(lstat(join(directory, outputPath)), { code: 'ENOENT' });
}));
