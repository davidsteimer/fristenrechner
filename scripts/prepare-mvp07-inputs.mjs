// SPDX-License-Identifier: AGPL-3.0-only
// Local, read-only by default. --write creates only a new preparation archive.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
export const candidatePath = 'outputs/ap22c3-2026-10-08/bundle';
export const productionPath = 'data/releases/2026-10-01-mvp-06-approved.1';
export const ap5Path = 'data/releases/2026-08-29-ap5-approved.1';
export const archiveRoot = 'outputs/release-mvp07-2026-10-08/inputs';
export const outputPath = `${archiveRoot}/snapshot.json`;
const archiveFiles = `${archiveRoot}/files`;
const sourceInventoryPath = 'outputs/release-mvp07-2026-10-08/sources/source-inventory.json';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const json = (files, path) => JSON.parse(files.get(path));
export const acceptanceRegisters = Object.freeze([
  Object.freeze({ path: 'outputs/ap22c3-abnahme-2026-10-08/receipt.json', count: 204,
    sha256: '399186439f8a44a4d604042fc48191dcc3646d5d856568ff6e9b565dfb25ca31' }),
  Object.freeze({ path: 'outputs/ap21-abnahme-2026-10-08/receipt.json', count: 192,
    sha256: 'f5cfc02c2f7d9b8f4704619d8d8b1172fafd7ef428a2605fc2c35c2a01de090a' })
]);
const pinned = Object.freeze({
  [`${candidatePath}/manifest.json`]: 'b290ece2d105c606b3de8154edade57fcbaf2ff978e42b05b08561fb1c40a0f6',
  [`${productionPath}/manifest.json`]: '637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724',
  [`${ap5Path}/manifest.json`]: 'c84840ad56833cab6fca254b96dd8002dbb20f94f189a948587accd69aed3de6',
  'docs/fachrecht/abnahme-ap22c3.md': 'ded1f7250df81e4df06f86717632852c02532faf426326be582bc12c2a78b3c0',
  'docs/fachrecht/abnahme-ap21.md': '1a35f09f946e9b217f6e375b873810c8388e829c24bef0faa6d46dac106097bd',
  '.work/mvp07-preflight-2026-10-08/summary.json': '2efff98c989ffce7fa8c964cd2a3754fc169576631a0a4b4d8bebf398c1d1ad3',
  [sourceInventoryPath]: '4bb394c9b1cccdc50ccae896925a5b64b3a6274fba0fb0b81a35b0ddca7e9c82',
  ...Object.fromEntries(acceptanceRegisters.map(item => [item.path, item.sha256]))
});
const technicalDirectories = Object.freeze([
  'src', 'scripts', 'schemas', 'tests', 'spfx/config', 'spfx/src/core',
  'spfx/src/webparts', 'spfx/scripts', 'spfx/test', 'spfx/test-build', 'public-app'
]);
const technicalExtensions = /\.(?:[cm]?js|tsx?|json|py|css|scss|html|svg)$/;
const excludedSegment = /^(?:\.|node_modules$|__pycache__$|private$)/;
const fixedFiles = Object.freeze([...new Set([
  ...Object.keys(pinned), 'package.json', 'package-lock.json', 'tsconfig.json',
  'spfx/package.json', 'spfx/package-lock.json', 'spfx/tsconfig.json', 'public-app/.htaccess',
  'data/source-reviews/source-register.json', 'data/source-reviews/index.json',
  'data/source-reviews/events/2026-08-31-initial-consolidation.1.json',
  'data/source-reviews/events/2026-09-22-mvp-04-prerelease.1.json',
  'data/source-reviews/events/2026-09-28-mvp-05-prerelease.1.json',
  'data/source-reviews/events/2026-10-01-mvp-06-prerelease.1.json',
  '.work/mvp07-preflight-2026-10-08/product-tests.log', '.work/mvp07-preflight-2026-10-08/typecheck.log',
  '.work/mvp07-preflight-2026-10-08/accepted-snapshots.json', '.work/mvp07-preflight-2026-10-08/runtime-coverage.json',
  'docs/fachrecht/quellenpruefplan-mvp07.md', 'docs/betrieb/deployment-mvp-07.md',
  'docs/betrieb/vorpruefung-mvp-07.md',
  'outputs/ap22a-abnahme-2026-10-08/matrix-data-v10.json',
  'outputs/release-mvp06-2026-10-01/source-inventory.json',
  'outputs/release-mvp06-2026-10-01/source-review-completeness.json',
  'outputs/release-mvp06-2026-10-01/source-approval.json',
  'outputs/release-mvp06-2026-10-01/source-governance-adoption.json',
  'docs/planung/release-mvp07.md',
  'docs/entscheidungen/DEC-2026-027-schrittweiser-schweizausbau.md',
  'docs/entscheidungen/DEC-2026-028-operative-freigabe-kalenderzuordnungen.md',
  'docs/entscheidungen/DEC-2026-029-begrenzte-behandlung-zweiter-januar.md',
  'docs/entscheidungen/DEC-2026-030-kalenderaktivierung-formatvertrag.md',
  'docs/entscheidungen/DEC-2026-030-beschluss.md',
  'docs/fachrecht/abschluss-ap22a.md', 'docs/fachrecht/abnahme-ap22b.md',
  'docs/fachrecht/abnahme-ap22c1.md', 'docs/fachrecht/abnahme-ap22c2.md',
  'docs/fachrecht/ap22a-referenzfaelle.md', 'docs/fachrecht/ap22a-bundesanknuepfungen.md',
  'docs/fachrecht/ap22a-regionale-zuordnungen.md', 'docs/fachrecht/ap22a-weitere-prozesslisten.md',
  'docs/architektur/kalendervertrag-ap22b.md', 'docs/architektur/kalenderintegration-ap22c1.md',
  'docs/architektur/kalenderintegration-ap22c2.md', 'docs/architektur/kalenderintegration-ap22c3.md',
  'docs/architektur/datumseingabe-ap21.md'
])]);

export function assertSafeRelativePath(path) {
  assert.ok(typeof path === 'string' && !isAbsolute(path) && !path.includes('\\')
    && !/[\u0000-\u001f\u007f]/.test(path)
    && !path.split('/').some(part => ['', '.', '..'].includes(part)), `Unsafe preparation path: ${path}`);
}
function technicalPath(path) {
  return technicalDirectories.some(directory => path.startsWith(`${directory}/`))
    && technicalExtensions.test(path)
    && !path.split('/').some(part => excludedSegment.test(part) || /(?:secret|credential|\.private\.)/i.test(part));
}
export function assertAllowedEvidencePath(path) {
  assertSafeRelativePath(path);
  assert.ok(fixedFiles.includes(path) || technicalPath(path)
    || [candidatePath, productionPath, ap5Path].some(directory => path.startsWith(`${directory}/`)
      && /^[a-z0-9/-]+\.json$/.test(path.slice(directory.length + 1))), `Out-of-scope preparation input: ${path}`);
}
async function readRegular(repositoryRoot, path, optional = false) {
  assertSafeRelativePath(path);
  const parts = path.split('/');
  for (let index = 0; index < parts.length; index++) {
    const selected = parts.slice(0, index + 1).join('/');
    let stat;
    try { stat = await lstat(resolve(repositoryRoot, selected)); }
    catch (error) { if (optional && error.code === 'ENOENT') return undefined; throw error; }
    assert.ok(!stat.isSymbolicLink() && (index === parts.length - 1 ? stat.isFile() : stat.isDirectory()),
      `Not a regular ${index === parts.length - 1 ? 'file' : 'directory'}: ${selected}`);
  }
  return readFile(resolve(repositoryRoot, path));
}
function descriptor(entry) {
  assertSafeRelativePath(entry.path);
  assert.match(entry.sha256, /^[a-f0-9]{64}$/);
  assert.ok(Number.isSafeInteger(entry.byteLength) && entry.byteLength >= 0, `Invalid byte length: ${entry.path}`);
}
function checkBytes(bytes, entry) {
  assert.ok(Buffer.isBuffer(bytes), `Missing preparation evidence: ${entry.path}`);
  assert.equal(bytes.length, entry.byteLength, `Changed byte length: ${entry.path}`);
  assert.equal(hash(bytes), entry.sha256, `Changed bound preparation input: ${entry.path}`);
}

export function assertMvp07CandidateContract(manifest) {
  assert.equal(manifest.releaseId, '2026-10-08-ap22c3-reference.1');
  assert.equal(manifest.formatVersion, '7.0.0');
  assert.equal(manifest.compatibility.minimumConsumerFormatVersion, '7.0.0');
  assert.equal(manifest.releaseStatus, 'candidate');
  assert.equal(manifest.sourceSummary.legalBasisReviewStatus, 'pending');
  assert.equal(manifest.sourceSummary.latestReviewedOn, null);
  assert.equal(manifest.artifacts.length, 40);
  assert.equal(manifest.calendarIds.length, 32);
  assert.equal(manifest.profileIds.length, 5);
  assert.deepEqual(manifest.coverage, { from: '2026-08-29', to: null });
  const local = manifest.extensions['steimer.local-reference'];
  for (const flag of ['productionActivation', 'sourceReleaseApproved', 'calendarExportEnabled']) assert.equal(local[flag], false);
}
function releaseEdges(files) {
  const result = [];
  for (const directory of [candidatePath, productionPath, ap5Path]) {
    const manifest = json(files, `${directory}/manifest.json`);
    const paths = new Set();
    for (const artifact of manifest.artifacts) {
      descriptor(artifact);
      assert.ok(/^[a-z0-9/-]+\.json$/.test(artifact.path), 'Only manifest-bound JSON artifacts');
      assert.ok(!paths.has(artifact.path), `Duplicate release artifact: ${artifact.path}`);
      paths.add(artifact.path);
      result.push({ path: `${directory}/${artifact.path}`, sha256: artifact.sha256, byteLength: artifact.byteLength });
    }
  }
  return result;
}
function acceptanceEdges(files) {
  const edges = [];
  for (const register of acceptanceRegisters) {
    const bytes = files.get(register.path);
    assert.equal(hash(bytes), register.sha256, `Changed acceptance register: ${register.path}`);
    const receipt = JSON.parse(bytes);
    assert.equal(receipt.artifacts.length, register.count);
    for (const key of ['sourceReleaseApproved', 'newSourceReleaseApproved', 'newDeploymentApproved',
      'newPublicationApproved', 'testAppCleanupApproved', 'deployed', 'published']) {
      if (Object.hasOwn(receipt, key)) assert.equal(receipt[key], false);
    }
    const directory = register.path.slice(0, -'/receipt.json'.length);
    const paths = new Set();
    for (const item of receipt.artifacts) {
      descriptor(item);
      assertSafeRelativePath(item.archivePath);
      const path = `${directory}/${item.archivePath}`;
      assert.ok(!paths.has(path), `Duplicate acceptance archive entry: ${path}`);
      paths.add(path);
      edges.push({ path, sha256: item.sha256, byteLength: item.byteLength, register: register.path });
    }
  }
  return edges;
}
async function verifyAcceptanceArchives(files, repositoryRoot) {
  // Exactly two pinned, one-level inventories. Never follow their nested proof links.
  for (const entry of acceptanceEdges(files)) checkBytes(await readRegular(repositoryRoot, entry.path), entry);
}

export function validateMvp07Inputs(files, expectedSnapshot) {
  for (const path of files.keys()) assertAllowedEvidencePath(path);
  for (const path of fixedFiles) assert.ok(files.has(path), `Missing preparation evidence: ${path}`);
  for (const [path, sha256] of Object.entries(pinned)) assert.equal(hash(files.get(path)), sha256, `Changed pinned preparation input: ${path}`);
  const candidate = json(files, `${candidatePath}/manifest.json`);
  assertMvp07CandidateContract(candidate);
  for (const entry of releaseEdges(files)) checkBytes(files.get(entry.path), entry);
  const baseline = json(files, `${productionPath}/manifest.json`);
  assert.equal(baseline.releaseStatus, 'approved');
  assert.equal(baseline.formatVersion, '6.0.0');
  assert.equal(baseline.artifacts.length, 10);
  assert.equal(json(files, `${ap5Path}/manifest.json`).formatVersion, '1.0.0');
  const social = json(files, `${candidatePath}/social-procedures/ch-social-procedures.json`);
  assert.equal(social.federalRules.length, 44);
  assert.equal(social.cantonalBindings.length, 50);
  assert.equal(social.releaseEligibility.length, 50);
  assert.ok(social.cantonalBindings.every(item => item.procedureContextCanton === 'BE'));
  for (const item of social.releaseEligibility) {
    assert.equal(item.status, 'candidate'); assert.equal(item.approval, null);
    assert.equal(item.releaseId, candidate.releaseId);
    assert.deepEqual(item.calculationCoverage, { from: '2026-01-01', to: '2027-12-31' });
  }
  for (const path of ['package.json', 'spfx/package.json']) assert.equal(json(files, path).version, '0.6.0');
  const solution = json(files, 'spfx/config/package-solution.json').solution;
  assert.equal(solution.version, '0.6.0.1');
  assert.ok(solution.features.every(feature => feature.version === '0.6.0.1'));
  assert.ok(!solution.webApiPermissionRequests?.length);
  assert.match(files.get('src/public-app/main.tsx').toString(), /mvp06CalculationData/);
  const pin = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/19b37336974f3ba7c72333763e1272425239b8cd/data/releases/2026-10-01-mvp-06-approved.1';
  assert.ok(files.get('spfx/src/core/config.ts').toString().includes(pin));
  assert.equal(json(files, 'spfx/src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json').preconfiguredEntries[0].properties.githubBaseUrl, pin);
  assert.equal(json(files, 'data/source-reviews/source-register.json').dataKind, 'sourceRegister');
  assert.equal(json(files, 'data/source-reviews/index.json').dataKind, 'sourceReviewIndex');
  const checks = json(files, '.work/mvp07-preflight-2026-10-08/summary.json');
  assert.deepEqual(checks.runs.map(run => [run.name, run.code]), [['typecheck', 0], ['product-tests', 0]]);
  assert.deepEqual(checks.protectedChanges, []);
  const sourceInventory = json(files, sourceInventoryPath);
  assert.equal(sourceInventory.recordStatus, 'candidate');
  for (const key of ['humanApproval', 'dataPromotionApproved', 'publicationApproved',
    'freshLegalVerificationPerformed', 'completeReleaseReview']) assert.equal(sourceInventory[key], false);
  // A single explicit input inventory, no recursive traversal of older records.
  assert.equal(sourceInventory.evidenceBindings.length, 59);
  assert.equal(new Set(sourceInventory.evidenceBindings.map(entry => entry.path)).size, 59);
  for (const entry of sourceInventory.evidenceBindings) {
    descriptor(entry); assertAllowedEvidencePath(entry.path); checkBytes(files.get(entry.path), entry);
  }
  const evidence = [...files].sort(([left], [right]) => left.localeCompare(right, 'en')).map(([path, bytes]) => ({
    path, sha256: hash(bytes), byteLength: bytes.length, archivedAt: `${archiveFiles}/${path}`
  }));
  const snapshot = {
    formatVersion: '1.0.0', dataKind: 'releasePreparationInputs', preparationId: 'mvp07-ap22-ap21-preparation.1',
    preparedOn: '2026-10-08', status: 'preparation-only', deployable: false,
    candidate: { path: candidatePath, releaseId: candidate.releaseId, manifestSha256: pinned[`${candidatePath}/manifest.json`], artifacts: 40, calendars: 32 },
    formats: { manifest: '7.0.0', minimumConsumer: '7.0.0', calendar: '3.0.0', holidayCatalog: '2.0.0', socialProcedureCatalog: '2.0.0', specialRegimeCatalog: '3.0.0' },
    scope: { federalProfiles: ['stpo', 'zpo', 'bgg', 'vwvg'], preservedProfile: 'vrpg-be', socialRules: 44, bernSocialBindings: 50,
      socialCoverage: { from: '2026-01-01', to: '2027-12-31' }, additionalSocialOrCantonalProcedures: false },
    priorProduct: { releaseId: baseline.releaseId, formatVersion: '6.0.0', applicationVersion: '0.6.0', packageVersion: '0.6.0.1',
      manifestSha256: pinned[`${productionPath}/manifest.json`], githubPin: pin, liveEnvironmentVerified: false },
    permissions: { localPreparationAuthorized: true, sourceReleaseApproved: false, dataPromotionApproved: false,
      definitiveBuildAuthorized: false, installationAuthorized: false, publicationAuthorized: false,
      productionActivation: false, operatingApproval: false, permissionsChangeAuthorized: false, testAppCleanupAuthorized: false },
    gates: ['consolidated-source-review-and-human-approval', 'controlled-promotion-and-definitive-artifacts',
      'separate-eq-installation-approval', 'real-devices-teams-accessibility-and-export-evidence',
      'manual-q-acceptance', 'separate-publication-and-production-approval', 'fresh-header-cache-evidence-and-risk-treatment'],
    acceptance: acceptanceRegisters.map(item => ({ ...item, archiveFilesVerified: item.count })),
    sourceInventory: { path: sourceInventoryPath, sha256: pinned[sourceInventoryPath], evidenceFiles: 59,
      freshLegalVerificationPerformed: false, humanApproval: false },
    acceptanceArchiveBindings: acceptanceEdges(files),
    preservation: { appendOnly: true, regularFilesOnly: true, archiveFallbackAllowed: false,
      scope: 'Selected technical inputs, exact legal decisions and the explicit MVP07 preparation plan only. Existing acceptance archives remain at their hash-bound locations. No recursive proof discovery, private archives, raw user input, Git metadata, credentials or prior operating records are copied.',
      historicalArchivesRemainRequired: true, liveInputsMayEvolveAfterSnapshot: true },
    evidence
  };
  if (expectedSnapshot) assert.deepEqual(snapshot, expectedSnapshot, 'Recorded preparation inputs changed, create a new revision');
  return snapshot;
}

async function collectTechnical(repositoryRoot, directory, paths) {
  const stat = await lstat(resolve(repositoryRoot, directory));
  assert.ok(stat.isDirectory() && !stat.isSymbolicLink(), `Not a regular directory: ${directory}`);
  for (const item of (await readdir(resolve(repositoryRoot, directory), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    if (excludedSegment.test(item.name) || /(?:secret|credential|\.private\.)/i.test(item.name)) continue;
    const path = `${directory}/${item.name}`;
    assert.ok(!item.isSymbolicLink(), `Symlink in technical inputs: ${path}`);
    if (item.isDirectory()) await collectTechnical(repositoryRoot, path, paths);
    else if (item.isFile() && technicalPath(path)) paths.add(path);
  }
}

/** Verifies just the new archive without requiring evolving live source files. */
export async function loadMvp07Archive(repositoryRoot = root) {
  const recorded = JSON.parse(await readRegular(repositoryRoot, outputPath));
  assert.ok(Array.isArray(recorded.evidence) && recorded.evidence.length < 5000, 'Invalid archive inventory');
  const files = new Map();
  for (const entry of recorded.evidence) {
    descriptor(entry); assertAllowedEvidencePath(entry.path);
    assert.equal(entry.archivedAt, `${archiveFiles}/${entry.path}`, 'Unexpected archive mapping');
    assert.ok(!files.has(entry.path), `Duplicate snapshot evidence: ${entry.path}`);
    const bytes = await readRegular(repositoryRoot, entry.archivedAt);
    checkBytes(bytes, entry); files.set(entry.path, bytes);
  }
  return { snapshot: validateMvp07Inputs(files, recorded), files };
}

export async function prepareMvp07Inputs(repositoryRoot = root) {
  if (await readRegular(repositoryRoot, outputPath, true)) {
    const prepared = await loadMvp07Archive(repositoryRoot);
    await verifyAcceptanceArchives(prepared.files, repositoryRoot);
    return prepared;
  }
  const paths = new Set(fixedFiles);
  for (const directory of technicalDirectories) await collectTechnical(repositoryRoot, directory, paths);
  const files = new Map();
  for (const path of [...paths].sort()) { assertAllowedEvidencePath(path); files.set(path, await readRegular(repositoryRoot, path)); }
  // Verify trusted manifests before following their one-level artifact lists.
  for (const [path, sha256] of Object.entries(pinned)) assert.equal(hash(files.get(path)), sha256, `Changed pinned preparation input: ${path}`);
  for (const entry of releaseEdges(files)) files.set(entry.path, await readRegular(repositoryRoot, entry.path));
  await verifyAcceptanceArchives(files, repositoryRoot);
  return { snapshot: validateMvp07Inputs(files), files };
}

export async function persistMvp07Inputs(prepared, repositoryRoot = root) {
  assert.deepEqual(validateMvp07Inputs(prepared.files), prepared.snapshot, 'Snapshot differs from validated bytes');
  const writes = prepared.snapshot.evidence.map(entry => ({ path: entry.archivedAt, bytes: prepared.files.get(entry.path) }));
  writes.push({ path: outputPath, bytes: encode(prepared.snapshot) });
  // Check every target before the first write. Existing unequal files are never replaced.
  for (const entry of writes) {
    assert.ok(entry.path.startsWith(`${archiveRoot}/`));
    const existing = await readRegular(repositoryRoot, entry.path, true);
    if (existing) assert.ok(existing.equals(entry.bytes), `Existing preparation differs: ${entry.path}`);
  }
  for (const entry of writes) {
    const parents = entry.path.split('/').slice(0, -1);
    for (let index = 0; index < parents.length; index++) {
      const parent = resolve(repositoryRoot, parents.slice(0, index + 1).join('/'));
      try { await mkdir(parent); } catch (error) { if (error.code !== 'EEXIST') throw error; }
      const stat = await lstat(parent);
      assert.ok(stat.isDirectory() && !stat.isSymbolicLink(), 'Unsafe archive directory');
    }
    try { await writeFile(resolve(repositoryRoot, entry.path), entry.bytes, { flag: 'wx' }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    assert.ok((await readRegular(repositoryRoot, entry.path)).equals(entry.bytes), `Preparation readback mismatch: ${entry.path}`);
  }
  await loadMvp07Archive(repositoryRoot);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--write'), 'Only optional --write is supported');
  const prepared = await prepareMvp07Inputs();
  const write = process.argv[2] === '--write';
  if (write) await persistMvp07Inputs(prepared);
  console.log(JSON.stringify({ status: prepared.snapshot.status, written: write, outputPath,
    evidenceFiles: prepared.snapshot.evidence.length, acceptedArchiveFilesVerified: 396,
    snapshotSha256: hash(encode(prepared.snapshot)), deployable: false, productionActivation: false }));
}
