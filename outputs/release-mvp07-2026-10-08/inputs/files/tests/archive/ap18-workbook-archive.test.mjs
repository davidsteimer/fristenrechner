// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, copyFile, rm, chmod, lstat, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ARCHIVE, RECORDS, WORKING_COPY, AP18C_REFERENCE, PUBLICATION_MANIFEST, expectedManifest,
  verifyArchive, prepareArchive, prepareReferenceWorkingCopy, ensureExclusiveArchiveBytes,
  prepareOriginalArchiveInventory } from '../../scripts/ap18-workbook-archive.mjs';
import { createBatch04Model, V09_SHA256 } from '../../scripts/ap18b-04-cantons.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const publicationPath = record => `${ARCHIVE}/publikationskopien/${path.basename(record.source, '.xlsx')}_Publikationskopie.xlsx`;
async function temporaryDirectory(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'ap18-archive-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

async function fixture(t) {
  const directory = await temporaryDirectory(t);
  // No test fixture depends on the unpublished V0.9/V0.10 original bytes.
  const files = [`${ARCHIVE}/manifest.json`, PUBLICATION_MANIFEST,
    ...RECORDS.map(record => record.historicalByteIdentity ? record.archive : publicationPath(record))];
  for (const relative of files) {
    const target = path.join(directory, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(path.join(root, relative), target);
    await chmod(target, 0o644);
  }
  return directory;
}

test('public verification distinguishes derivatives, reference bytes and unread private originals', async () => {
  const result = await verifyArchive(root);
  assert.equal(result.status, 'verifiedPublicReferencesWithDocumentedPrivateOriginals');
  assert.equal(result.verificationScope, 'publicOnly');
  assert.equal(result.publicationManifestVerified, true);
  assert.equal(result.privateOriginalBytesVerified, false);
  assert.equal(result.historicalByteIdentityRestored, false);
  assert.deepEqual(result.entries.map(entry => entry.historicalByteIdentity), [false, false, true, true]);
  assert.deepEqual(result.entries.map(entry => entry.archivedBytesVerified), [false, false, true, true]);
  assert.deepEqual(result.entries.map(entry => entry.publicationBytesVerified), [true, true, false, false]);
  assert.ok(result.entries.every(entry => entry.privateOriginalBytesVerified === false));
  assert.equal(RECORDS[0].historicalSha256, V09_SHA256);
});

test('public verification succeeds with all four private original files absent', async t => {
  const directory = await fixture(t);
  for (const record of RECORDS.slice(0, 2)) {
    for (const relative of [record.source, record.archive]) {
      await assert.rejects(lstat(path.join(directory, relative)), { code: 'ENOENT' });
    }
  }
  assert.equal((await verifyArchive(directory)).privateOriginalBytesVerified, false);
});

test('strict historical proof still fails rather than accepting publication copies', async t => {
  await assert.rejects(verifyArchive(await fixture(t), { strictHistorical: true }), /NOT restored/);
});

test('original V0.9 authoring gate rejects synthetic wrong bytes without private originals', async t => {
  const directory = await temporaryDirectory(t);
  const file = path.join(directory, RECORDS[0].source);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, 'wrong bytes are not the historically accepted workbook');
  await assert.rejects(createBatch04Model(directory), { code: 'ERR_ASSERTION' });
});

test('V0.12 operational import path points only at the accepted reference copy', () => {
  assert.equal(AP18C_REFERENCE, RECORDS[3].archive);
  assert.notEqual(AP18C_REFERENCE, WORKING_COPY);
  assert.match(AP18C_REFERENCE, /\/referenzen\//);
});

for (const record of RECORDS.slice(0, 2)) {
  test(`modified publication V${record.version} fails verification`, async t => {
    const directory = await fixture(t);
    await writeFile(path.join(directory, publicationPath(record)), 'changed publication bytes');
    await assert.rejects(verifyArchive(directory), new RegExp(`Publication copy: ${record.version} checksum mismatch`));
  });

  test(`missing publication V${record.version} fails verification`, async t => {
    const directory = await fixture(t);
    await rm(path.join(directory, publicationPath(record)));
    await assert.rejects(verifyArchive(directory), { code: 'ENOENT' });
  });
}

test('missing publication manifest fails verification', async t => {
  const directory = await fixture(t);
  await rm(path.join(directory, PUBLICATION_MANIFEST));
  await assert.rejects(verifyArchive(directory), { code: 'ENOENT' });
});

test('publication manifest edits cannot silently bless substituted bytes', async t => {
  const directory = await fixture(t);
  const file = path.join(directory, PUBLICATION_MANIFEST);
  const manifest = JSON.parse(await readFile(file, 'utf8'));
  manifest.records[0].publication.sha256 = '0'.repeat(64);
  await writeFile(file, JSON.stringify(manifest));
  await assert.rejects(verifyArchive(directory), /Publication manifest checksum mismatch/);
});

test('publication manifest whitespace is also pinned byte-for-byte', async t => {
  const directory = await fixture(t);
  const file = path.join(directory, PUBLICATION_MANIFEST);
  await writeFile(file, (await readFile(file, 'utf8')) + '\n');
  await assert.rejects(verifyArchive(directory), /Publication manifest checksum mismatch/);
});

test('publication copies must be regular files, not symlinks', async t => {
  const directory = await fixture(t);
  const relative = publicationPath(RECORDS[0]);
  await rm(path.join(directory, relative));
  await symlink(path.join(root, relative), path.join(directory, relative));
  await assert.rejects(verifyArchive(directory), /must be a regular file/);
});

for (const record of RECORDS.slice(2)) {
  test(`modified V${record.version} reference bytes fail verification`, async t => {
    const directory = await fixture(t);
    await writeFile(path.join(directory, record.archive), 'changed reference bytes');
    await assert.rejects(verifyArchive(directory), new RegExp(`Archive: ${record.version} checksum mismatch`));
  });

  test(`missing V${record.version} reference bytes fail verification`, async t => {
    const directory = await fixture(t);
    await rm(path.join(directory, record.archive));
    await assert.rejects(verifyArchive(directory), { code: 'ENOENT' });
  });
}

test('silently rewriting the old inventory or historical acceptance is rejected', async t => {
  const directory = await fixture(t);
  const manifest = expectedManifest();
  manifest.records[0].historicalSha256 = manifest.records[0].archivedSha256;
  await writeFile(path.join(directory, ARCHIVE, 'manifest.json'), JSON.stringify(manifest));
  await assert.rejects(verifyArchive(directory), /Archive inventory changed/);
});

test('old inventory remains pinned byte-for-byte even if semantics are unchanged', async t => {
  const directory = await fixture(t);
  await writeFile(path.join(directory, ARCHIVE, 'manifest.json'), JSON.stringify(expectedManifest()));
  await assert.rejects(verifyArchive(directory), /Archive inventory checksum mismatch/);
});

test('private check fails on absent originals, never reports an implicit skip', async t => {
  const directory = await fixture(t);
  await assert.rejects(verifyArchive(directory, { privateOriginals: true }), { code: 'ENOENT' });
});

test('private check rejects a changed archive original', async t => {
  const directory = await fixture(t);
  const original = path.join(directory, RECORDS[0].archive);
  await mkdir(path.dirname(original), { recursive: true });
  await writeFile(original, 'changed private original');
  await assert.rejects(verifyArchive(directory, { privateOriginals: true }), /Private archive: 0.9 checksum mismatch/);
});

test('public check does not claim to inspect even present private files', async t => {
  const directory = await fixture(t);
  for (const record of RECORDS.slice(0, 2)) {
    for (const relative of [record.source, record.archive]) {
      const target = path.join(directory, relative);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, 'not inspected by public verification');
    }
  }
  const report = await verifyArchive(directory);
  assert.equal(report.privateOriginalBytesVerified, false);
  assert.ok(report.entries.slice(0, 2).every(entry => entry.archivedBytesVerified === false));
});

test('working and historical source copies do not affect public reference checks', async t => {
  const directory = await fixture(t);
  for (const relative of [WORKING_COPY, ...RECORDS.map(record => record.source)]) {
    const target = path.join(directory, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, 'a user-edited draft');
  }
  assert.equal((await verifyArchive(directory)).workingCopyChecked, false);
});

test('reference working-copy preparation preserves later user edits', async t => {
  const directory = await fixture(t);
  assert.equal(await prepareReferenceWorkingCopy(directory), 'createdByteIdentical');
  assert.deepEqual(await readFile(path.join(directory, WORKING_COPY)), await readFile(path.join(directory, AP18C_REFERENCE)));
  await writeFile(path.join(directory, WORKING_COPY), 'user-edited draft must survive');
  assert.equal(await prepareReferenceWorkingCopy(directory), 'existingPreservedWithoutContentCheck');
  assert.equal(await readFile(path.join(directory, WORKING_COPY), 'utf8'), 'user-edited draft must survive');
});

test('reference working-copy preparation cannot overwrite a changed reference or user copy', async t => {
  const directory = await fixture(t);
  await prepareReferenceWorkingCopy(directory);
  const target = path.join(directory, AP18C_REFERENCE);
  await writeFile(target, 'keep changed bytes for investigation');
  await writeFile(path.join(directory, WORKING_COPY), 'keep user work');
  await assert.rejects(prepareReferenceWorkingCopy(directory), /Working-copy reference checksum mismatch/);
  assert.equal(await readFile(target, 'utf8'), 'keep changed bytes for investigation');
  assert.equal(await readFile(path.join(directory, WORKING_COPY), 'utf8'), 'keep user work');
});

test('reference working-copy preparation refuses a symlink without following or replacing it', async t => {
  const directory = await fixture(t);
  const target = path.join(directory, WORKING_COPY);
  await mkdir(path.dirname(target), { recursive: true });
  await symlink(path.join(directory, AP18C_REFERENCE), target);
  await assert.rejects(prepareReferenceWorkingCopy(directory), /Working copy must be a regular file/);
  assert.ok((await lstat(target)).isSymbolicLink());
});

test('historical archive preparation cannot substitute a publication copy for an original', async t => {
  const directory = await fixture(t);
  const source = path.join(directory, RECORDS[0].source);
  await mkdir(path.dirname(source), { recursive: true });
  await copyFile(path.join(directory, publicationPath(RECORDS[0])), source);
  await assert.rejects(prepareArchive(directory), /Source changed before archive creation: 0.9/);
  await assert.rejects(lstat(path.join(directory, RECORDS[0].archive)), { code: 'ENOENT' });
});

test('historical archive preparation requires the private source originals', async t => {
  const directory = await fixture(t);
  await assert.rejects(prepareArchive(directory), { code: 'ENOENT' });
  await assert.rejects(lstat(path.join(directory, WORKING_COPY)), { code: 'ENOENT' });
});

test('exclusive archive writer creates once and accepts only identical existing bytes', async t => {
  const directory = await temporaryDirectory(t);
  const file = path.join(directory, 'synthetic-archive.xlsx');
  const bytes = Buffer.from('synthetic immutable archive fixture');
  await ensureExclusiveArchiveBytes(file, bytes);
  const first = await lstat(file);
  await ensureExclusiveArchiveBytes(file, bytes);
  assert.deepEqual(await readFile(file), bytes);
  assert.equal((await lstat(file)).mtimeMs, first.mtimeMs);
  assert.equal(first.mode & 0o222, 0);
});

test('exclusive archive writer preserves changed existing bytes for investigation', async t => {
  const directory = await temporaryDirectory(t);
  const file = path.join(directory, 'synthetic-archive.xlsx');
  await writeFile(file, 'keep these bytes for investigation');
  await assert.rejects(ensureExclusiveArchiveBytes(file, Buffer.from('different intended archive')), /refusing overwrite/);
  assert.equal(await readFile(file, 'utf8'), 'keep these bytes for investigation');
});

test('exclusive archive writer refuses symlinks even when their bytes match', async t => {
  const directory = await temporaryDirectory(t);
  const target = path.join(directory, 'synthetic-target.xlsx');
  const file = path.join(directory, 'synthetic-archive.xlsx');
  const bytes = Buffer.from('same bytes do not make a symlink an archive');
  await writeFile(target, bytes);
  await symlink(target, file);
  await assert.rejects(ensureExclusiveArchiveBytes(file, bytes), /Not a regular archive file/);
  assert.ok((await lstat(file)).isSymbolicLink());
  assert.deepEqual(await readFile(target), bytes);
});

async function syntheticPrivateInventory(t) {
  const directory = await temporaryDirectory(t);
  const bytes = Buffer.from('synthetic private original without local or personal information');
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const records = [{ version: 'synthetic', source: 'private-source.xlsx', archive: 'archive/original.xlsx',
    archivedSha256: sha256, historicalByteIdentity: false, disposition: 'syntheticObservedArchive' }];
  const inventoryBytes = Buffer.from(JSON.stringify({ records }));
  const inventory = { path: 'archive/manifest.json', bytes: inventoryBytes,
    sha256: createHash('sha256').update(inventoryBytes).digest('hex') };
  await writeFile(path.join(directory, records[0].source), bytes);
  return { directory, records, inventory, bytes };
}

test('private inventory preparation succeeds before any publication files exist without claiming publication proof', async t => {
  const { directory, records, inventory, bytes } = await syntheticPrivateInventory(t);
  const result = await prepareOriginalArchiveInventory(directory, records, inventory);
  assert.equal(result.status, 'privateOnlyPrepared');
  assert.equal(result.verificationScope, 'privateOnly');
  assert.equal(result.privateOriginalBytesVerified, true);
  assert.equal(result.publicationManifestVerified, false);
  assert.equal(result.publicPublicationVerified, false);
  assert.equal(result.historicalByteIdentityRestored, false);
  assert.equal(result.entries[0].publicationBytesVerified, false);
  assert.deepEqual(await readFile(path.join(directory, records[0].archive)), bytes);
  assert.deepEqual(await readFile(path.join(directory, inventory.path)), inventory.bytes);
  await assert.rejects(lstat(path.join(directory, PUBLICATION_MANIFEST)), { code: 'ENOENT' });
  assert.deepEqual(await prepareOriginalArchiveInventory(directory, records, inventory), result);
});

test('private-only preparation is not a fallback public verifier when publication data is malformed', async t => {
  const { directory, records, inventory } = await syntheticPrivateInventory(t);
  const manifestPath = path.join(directory, PUBLICATION_MANIFEST);
  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, 'deliberately malformed publication manifest');
  const report = await prepareOriginalArchiveInventory(directory, records, inventory);
  assert.equal(report.publicPublicationVerified, false);
  assert.equal(report.publicationManifestVerified, false);
  assert.equal(await readFile(manifestPath, 'utf8'), 'deliberately malformed publication manifest');
});

test('private preparation refuses an existing changed inventory and leaves it untouched', async t => {
  const { directory, records, inventory } = await syntheticPrivateInventory(t);
  await mkdir(path.dirname(path.join(directory, inventory.path)), { recursive: true });
  await writeFile(path.join(directory, inventory.path), 'preserve inconsistent private inventory');
  await assert.rejects(prepareOriginalArchiveInventory(directory, records, inventory), /refusing overwrite/);
  assert.equal(await readFile(path.join(directory, inventory.path), 'utf8'), 'preserve inconsistent private inventory');
});

test('private preparation rejects non-regular original sources before creating archives', async t => {
  const { directory, records, inventory } = await syntheticPrivateInventory(t);
  const source = path.join(directory, records[0].source);
  await copyFile(source, path.join(directory, 'target.xlsx'));
  await rm(source);
  await symlink(path.join(directory, 'target.xlsx'), source);
  await assert.rejects(prepareOriginalArchiveInventory(directory, records, inventory), /must be a regular file/);
  await assert.rejects(lstat(path.join(directory, records[0].archive)), { code: 'ENOENT' });
});
