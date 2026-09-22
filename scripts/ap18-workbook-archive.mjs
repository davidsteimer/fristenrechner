// SPDX-License-Identifier: AGPL-3.0-only
// Byte-preserving archive. This never opens or saves an XLSX through Excel.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { readFile, writeFile, copyFile, mkdir, chmod, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ARCHIVE = 'outputs/archiv/ap18/2026-09-22';
export const WORKING_COPY = 'outputs/arbeitskopien/ap18/Feiertagsmatrix_Schweiz_Arbeitskopie_ab_V0.12.xlsx';
export const RECORDS = Object.freeze([
  {
    version: '0.9', disposition: 'confirmedObservedArchive',
    source: 'outputs/ap18b-03-vs-fr-so-ge-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-03_VS_FR_SO_GE_V0.9.xlsx',
    historicalSha256: 'a245080126586f1104b459ff5e225808e2d78578d24a2ce619d7d31d2d27ed12',
    archivedSha256: '7663aacdca75d66c565ca6c049c9958dafad792ec46ec0d0515b4cb1505e8453'
  },
  {
    version: '0.10', disposition: 'documentedObservedArchive',
    source: 'outputs/ap18b-04-restkantone-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-04_Restkantone_V0.10.xlsx',
    historicalSha256: 'bba15a8f6e7b6956662d00bb1b7efb51903ad19aa2b2d1dc29c42a7fd9361e4e',
    archivedSha256: '57b3c3c668bb00360cf94da159a29509116691f9282419ebc7a87cdf8b88b619'
  },
  {
    version: '0.11', disposition: 'byteIdenticalReference',
    source: 'outputs/ap18b-04-restkantone-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-04_Restkantone_V0.11.xlsx',
    historicalSha256: '37d33d4639cc839fc41c9850de8e6551d546167fe8b9ee7f10ea5f2c062d99fd',
    archivedSha256: '37d33d4639cc839fc41c9850de8e6551d546167fe8b9ee7f10ea5f2c062d99fd'
  },
  {
    version: '0.12', disposition: 'byteIdenticalAcceptedReference',
    source: 'outputs/ap18b-05-bedingte-feiertage-2026-09-22/2026-09-22_Feiertagsmatrix_Schweiz_AP18B-05_V0.12.xlsx',
    historicalSha256: 'd4fe89932b5d33f7f63516073668accf1a92b141a07388b559c3a6965c1aeb65',
    archivedSha256: 'd4fe89932b5d33f7f63516073668accf1a92b141a07388b559c3a6965c1aeb65'
  }
].map(record => Object.freeze({ ...record,
  archive: `${ARCHIVE}/${record.version === '0.9' || record.version === '0.10' ? 'beobachteter-bestand' : 'referenzen'}/${path.basename(record.source)}`,
  historicalByteIdentity: record.historicalSha256 === record.archivedSha256
})));
export const AP18C_REFERENCE = RECORDS.find(record => record.version === '0.12').archive;
export const ARCHIVE_MANIFEST_SHA256 = '4cd4153c1163ef193089d1ca30498a982c117030685cd6565c78edec68579226';
export const PUBLICATION_MANIFEST = `${ARCHIVE}/publication-manifest.json`;
export const PUBLICATION_MANIFEST_SHA256 = '9ff1bfff327b28e2f709d4b9be879ae8aadd49c0dc10d72ebe301dcd91741c01';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';

export function expectedManifest() {
  return {
    formatVersion: '1.0.0', kind: 'workbookArchiveInventory', recordedOn: '2026-09-22',
    confirmation: 'docs/fachrecht/archivbestaetigung-ap18.md',
    historicalOriginalsRecovered: false, productActivation: false,
    records: structuredClone(RECORDS),
    workingCopy: { path: WORKING_COPY, basedOn: AP18C_REFERENCE, mutable: true, runtimeInput: false }
  };
}

async function checkedBytes(root, relative, expectedSha256, label) {
  const file = path.join(root, relative);
  assert.ok((await lstat(file)).isFile(), `${label} must be a regular file`);
  const bytes = await readFile(file);
  assert.equal(digest(bytes), expectedSha256, `${label} checksum mismatch`);
  return bytes;
}

async function publicationManifest(root) {
  const bytes = await checkedBytes(root, PUBLICATION_MANIFEST, PUBLICATION_MANIFEST_SHA256,
    'Publication manifest');
  const manifest = JSON.parse(bytes.toString('utf8'));
  assert.equal(manifest.formatVersion, '1.0.0');
  assert.equal(manifest.kind, 'workbookPublicationDerivations');
  assert.deepEqual(manifest.sourceArchiveManifest, {
    path: `${ARCHIVE}/manifest.json`, sha256: ARCHIVE_MANIFEST_SHA256
  });
  assert.equal(manifest.decision.selectedOption, 2);
  assert.deepEqual(manifest.records.map(record => record.version), ['0.9', '0.10']);
  for (const record of manifest.records) {
    const original = RECORDS.find(entry => entry.version === record.version);
    assert.equal(record.sourceSha256, original.archivedSha256,
      `Publication derivation must identify the observed archive: ${record.version}`);
    assert.equal(record.publication.path,
      `${ARCHIVE}/publikationskopien/${path.basename(original.source, '.xlsx')}_Publikationskopie.xlsx`);
    assert.match(record.publication.sha256, /^[0-9a-f]{64}$/);
    assert.ok(Number.isSafeInteger(record.publication.byteLength) && record.publication.byteLength > 0);
  }
  return manifest;
}

// The public check proves the pinned derivations and the unchanged V0.11/V0.12
// references. It explicitly does not prove possession of private V0.9/V0.10
// bytes. Only the opt-in private check reads those source and archive files.
export async function verifyArchive(root, { strictHistorical = false, privateOriginals = false } = {}) {
  const manifestBytes = await readFile(path.join(root, ARCHIVE, 'manifest.json'));
  const manifest = JSON.parse(manifestBytes.toString('utf8'));
  assert.deepEqual(manifest, expectedManifest(), 'Archive inventory changed');
  assert.equal(digest(manifestBytes), ARCHIVE_MANIFEST_SHA256, 'Archive inventory checksum mismatch');
  const publications = await publicationManifest(root);
  const entries = [];
  for (const record of RECORDS) {
    const publication = publications.records.find(entry => entry.version === record.version);
    if (publication) {
      const bytes = await checkedBytes(root, publication.publication.path, publication.publication.sha256,
        `Publication copy: ${record.version}`);
      assert.equal(bytes.byteLength, publication.publication.byteLength, `Publication size mismatch: ${record.version}`);
      if (privateOriginals) {
        await checkedBytes(root, record.archive, record.archivedSha256, `Private archive: ${record.version}`);
        await checkedBytes(root, record.source, record.archivedSha256, `Private source: ${record.version}`);
      }
      entries.push({ version: record.version, publicationBytesVerified: true,
        archivedBytesVerified: privateOriginals, privateOriginalBytesVerified: privateOriginals,
        historicalByteIdentity: record.historicalByteIdentity, disposition: record.disposition });
    } else {
      await checkedBytes(root, record.archive, record.archivedSha256, `Archive: ${record.version}`);
      entries.push({ version: record.version, publicationBytesVerified: false,
        archivedBytesVerified: true, privateOriginalBytesVerified: false,
        historicalByteIdentity: record.historicalByteIdentity, disposition: record.disposition });
    }
  }
  if (strictHistorical) assert.ok(entries.every(entry => entry.historicalByteIdentity),
    'Historical byte identity is NOT restored for V0.9 and V0.10');
  return {
    status: privateOriginals ? 'verifiedPrivateArchiveWithDocumentedHistoricalVariance'
      : 'verifiedPublicReferencesWithDocumentedPrivateOriginals',
    verificationScope: privateOriginals ? 'publicAndPrivate' : 'publicOnly',
    publicationManifestVerified: true,
    privateOriginalBytesVerified: privateOriginals,
    historicalByteIdentityRestored: false, entries,
    workingCopyChecked: false,
    note: privateOriginals
      ? 'Publication copies, private observed V0.9/V0.10 source and archive bytes, and V0.11/V0.12 references verified. Historical V0.9/V0.10 byte identity remains unavailable.'
      : 'Only pinned publication copies and unchanged V0.11/V0.12 references verified. Private V0.9/V0.10 originals were not read. Historical byte identity is not restored. Working copies are not release inputs.'
  };
}

export async function ensureExclusiveArchiveBytes(file, bytes) {
  try {
    await writeFile(file, bytes, { flag: 'wx', mode: 0o444 });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    assert.ok((await lstat(file)).isFile(), `Not a regular archive file: ${file}`);
    assert.ok((await readFile(file)).equals(bytes), `Existing archive differs, refusing overwrite: ${file}`);
  }
}

// Low-level, caller-pinned private archive preparation. It never reads or claims
// to verify a publication manifest. The AP18 entry point below supplies only the
// fixed RECORDS and byte-pinned historical inventory, never caller overrides.
export async function prepareOriginalArchiveInventory(root, records, inventory) {
  assert.ok(records.length > 0, 'Private archive preparation requires original records');
  assert.equal(digest(inventory.bytes), inventory.sha256, 'Private inventory input checksum mismatch');
  // Validate every source before creating any copy. Old sources are never modified.
  for (const record of records) {
    await checkedBytes(root, record.source, record.archivedSha256,
      `Source changed before archive creation: ${record.version}`);
  }
  const entries = [];
  for (const record of records) {
    const source = path.join(root, record.source);
    const destination = path.join(root, record.archive);
    await mkdir(path.dirname(destination), { recursive: true });
    const bytes = await checkedBytes(root, record.source, record.archivedSha256,
      `Source changed during archive creation: ${record.version}`);
    await ensureExclusiveArchiveBytes(destination, bytes);
    await checkedBytes(root, record.archive, record.archivedSha256, `Private archive: ${record.version}`);
    assert.ok((await readFile(source)).equals(bytes), 'Source changed after archive creation');
    entries.push({ version: record.version, archivedBytesVerified: true,
      privateOriginalBytesVerified: true, publicationBytesVerified: false,
      historicalByteIdentity: record.historicalByteIdentity, disposition: record.disposition });
  }
  await mkdir(path.dirname(path.join(root, inventory.path)), { recursive: true });
  await ensureExclusiveArchiveBytes(path.join(root, inventory.path), inventory.bytes);
  await checkedBytes(root, inventory.path, inventory.sha256, 'Private archive inventory');
  return {
    status: 'privateOnlyPrepared', verificationScope: 'privateOnly',
    publicationManifestVerified: false, publicPublicationVerified: false,
    privateOriginalBytesVerified: true,
    historicalByteIdentityRestored: entries.every(entry => entry.historicalByteIdentity),
    entries, workingCopyChecked: false,
    note: 'Only pinned private source and archive bytes and their inventory were prepared and verified. Publication files were not read or verified. Run the separate public check after publication derivation preparation.'
  };
}

export async function prepareArchive(root) {
  // Original preparation must precede publication derivation preparation, so
  // it always remains private-only. This is not a fallback for a failed public
  // check. Even an existing publication manifest is outside this command.
  const report = await prepareOriginalArchiveInventory(root, RECORDS, {
    path: `${ARCHIVE}/manifest.json`, bytes: Buffer.from(json(expectedManifest())),
    sha256: ARCHIVE_MANIFEST_SHA256
  });
  report.workingCopy = await prepareReferenceWorkingCopy(root);
  return report;
}

export async function prepareReferenceWorkingCopy(root) {
  await checkedBytes(root, AP18C_REFERENCE, RECORDS.at(-1).archivedSha256, 'Working-copy reference');
  const workingFile = path.join(root, WORKING_COPY);
  await mkdir(path.dirname(workingFile), { recursive: true });
  try {
    await copyFile(path.join(root, AP18C_REFERENCE), workingFile, constants.COPYFILE_EXCL);
    await chmod(workingFile, 0o644);
    assert.equal(digest(await readFile(workingFile)), RECORDS.at(-1).archivedSha256, 'Working-copy readback mismatch');
    return 'createdByteIdentical';
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    // A user may have legitimately edited it. Never restore or overwrite it.
    assert.ok((await lstat(workingFile)).isFile(), 'Working copy must be a regular file');
    return 'existingPreservedWithoutContentCheck';
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const mode = process.argv[2] ?? '--check';
  assert.ok(process.argv.length <= 3 && ['--prepare', '--check', '--check-private', '--strict-historical'].includes(mode), 'Unknown archive command');
  console.log(json(await (mode === '--prepare' ? prepareArchive(root)
    : verifyArchive(root, { strictHistorical: mode === '--strict-historical', privateOriginals: mode === '--check-private' }))));
}
