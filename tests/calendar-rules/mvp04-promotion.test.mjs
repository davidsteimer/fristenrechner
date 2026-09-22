// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm, mkdir, writeFile, cp, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import {
  MVP04_RELEASE_ID, MVP04_PROMOTION_REPORT, AP18C_CANDIDATE_ID,
  AP18C_CANDIDATE_MANIFEST_SHA256, MVP04_METADATA_PATHS,
  prepareMvp04Promotion, validateMvp04Promotion, writeMvp04Promotion
} from '../../scripts/promote-ap18c-release.mjs';
import { sha256 } from '../../scripts/ap18c-import.mjs';
import { createCalculationData, calculateDeadline, calculateSpecialDeadline,
  calculateQualifiedSpecialDeadline, resolveCalendar } from '../../src/core/index.ts';
import { ap18cCandidateCalculationData as candidateData } from '../../src/release/ap18cCandidateData.ts';
import { calculationInput, loadGoldenSuite } from '../core/fixtures.ts';
import { specialGoldenSuite } from '../core/specialFixtures.ts';
import corpus from '../golden/candidates/ap17b-anwendbarkeit.json' with { type: 'json' };

const root = fileURLToPath(new URL('../../', import.meta.url));
const candidateDirectory = path.join(root, 'data/releases', AP18C_CANDIDATE_ID);
const prepared = await prepareMvp04Promotion(root);
const validated = await validateMvp04Promotion(prepared, root);
const candidateManifest = JSON.parse(await readFile(path.join(candidateDirectory, 'manifest.json')));
const approvedData = createCalculationData({
  releaseId: prepared.manifest.releaseId, formatVersion: prepared.manifest.formatVersion,
  coverageFrom: prepared.manifest.coverage.from, coverageTo: prepared.manifest.coverage.to,
  profileIds: prepared.manifest.profileIds, calendarIds: prepared.manifest.calendarIds,
  specialRegimeCatalogIds: prepared.manifest.specialRegimeCatalogIds,
  holidayCatalogIds: prepared.manifest.holidayCatalogIds,
  artifacts: prepared.manifest.artifacts.map(descriptor => ({ descriptor, parsed: JSON.parse(prepared.files.get(descriptor.path)) }))
});
const normaliseIdentity = value => JSON.parse(JSON.stringify(value, (key, item) => key === 'releaseId' ? '<release-identity>' : item));
const temporaryTask = async body => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'fristenrechner-mvp04-test-'));
  try { return await body(directory); }
  finally { await rm(directory, { recursive: true, force: true }); }
};

test('MVP04 promotion is deterministic, input-pinned and identical to checked local outputs', async () => {
  assert.deepEqual(await prepareMvp04Promotion(root), prepared);
  assert.deepEqual(await validateMvp04Promotion(prepared, root), validated);
  assert.equal(sha256(await readFile(path.join(candidateDirectory, 'manifest.json'))), AP18C_CANDIDATE_MANIFEST_SHA256);
  for (const [name, bytes] of prepared.files) {
    assert.deepEqual(await readFile(path.join(root, 'data/releases', MVP04_RELEASE_ID, name)), bytes, name);
  }
  assert.deepEqual(JSON.parse(await readFile(path.join(root, MVP04_PROMOTION_REPORT))), validated.report);
});

test('MVP04 records human data acceptance but no publication, deployment or operating approval', () => {
  assert.equal(prepared.manifest.releaseStatus, 'approved');
  assert.equal(prepared.manifest.formatVersion, '4.0.0');
  assert.equal(prepared.manifest.compatibility.minimumConsumerFormatVersion, '4.0.0');
  const approval = prepared.manifest.extensions['steimer.approval'];
  assert.equal(approval.approvedBy, 'David Steimer');
  assert.equal(approval.approvedOn, '2026-09-22');
  assert.equal(approval.approvalScope, 'mvp04DataAndImplementation');
  assert.equal(approval.candidateManifestSha256, AP18C_CANDIDATE_MANIFEST_SHA256);
  const release = prepared.manifest.extensions['steimer.release-preparation'];
  assert.equal(release.appVersion, '0.4.0');
  assert.equal(release.sourceRefresh, 'separateReleaseGate');
  for (const key of ['publicationApproved', 'deploymentApproved', 'productionActivation']) assert.equal(release[key], false, key);
  assert.equal(release.operatingApproval, 'requiresSeparateDecision');
  assert.equal(prepared.manifest.extensions['steimer.candidate'].approvalRequired, false);
  assert.equal(prepared.manifest.extensions['steimer.candidate'].humanIntegrationApproval.approvedBy, 'David Steimer');
});

test('MVP04 changes exactly special-catalog review and scope, not any legal/source content', async () => {
  const changed = [];
  for (const artifact of candidateManifest.artifacts) {
    const before = await readFile(path.join(candidateDirectory, artifact.path));
    const after = prepared.files.get(artifact.path);
    if (!before.equals(after)) changed.push(artifact.path);
    if (artifact.path === 'special-regimes/vrpg-be.json') {
      const beforeDoc = JSON.parse(before);
      const afterDoc = JSON.parse(after);
      assert.deepEqual(Object.keys(beforeDoc), Object.keys(afterDoc));
      const fields = Object.keys(beforeDoc).filter(key => JSON.stringify(beforeDoc[key]) !== JSON.stringify(afterDoc[key]));
      assert.deepEqual(fields, MVP04_METADATA_PATHS);
      assert.equal(afterDoc.review.status, 'verified');
      assert.equal(afterDoc.review.reviewedOn, '2026-09-22');
      assert.match(afterDoc.review.basis, /keine erneute juristische Quellenprüfung/);
      assert.deepEqual(afterDoc.sources, beforeDoc.sources);
    }
  }
  assert.deepEqual(changed, ['special-regimes/vrpg-be.json']);
  assert.equal(validated.report.unchangedArtifacts.length, 8);
});

test('MVP04 keeps full historical holiday catalog and source summary without blanket review', async () => {
  const catalogPath = 'holiday-catalogs/ch-holiday-catalog.json';
  assert.deepEqual(prepared.files.get(catalogPath), await readFile(path.join(candidateDirectory, catalogPath)));
  const catalog = JSON.parse(prepared.files.get(catalogPath));
  assert.equal(catalog.data.rules.length, 479);
  assert.equal(catalog.acceptance.runtimeEnabled, false, 'Historical workbook acceptance is not rewritten');
  assert.deepEqual(prepared.manifest.sourceSummary, candidateManifest.sourceSummary);
  assert.equal(prepared.manifest.sourceSummary.latestReviewedOn, '2026-09-12');
  assert.deepEqual(prepared.manifest.extensions['steimer.candidate'].futureSourceComparison,
    candidateManifest.extensions['steimer.candidate'].futureSourceComparison);
  assert.deepEqual(prepared.manifest.profileIds, candidateManifest.profileIds);
  assert.deepEqual(prepared.manifest.calendarIds, candidateManifest.calendarIds);
  assert.deepEqual(prepared.manifest.specialRegimeCatalogIds, candidateManifest.specialRegimeCatalogIds);
});

test('MVP04 keeps all ordinary calculation results and complete traces', () => {
  for (const reference of [...loadGoldenSuite('approved').cases, ...loadGoldenSuite('unresolved').cases]) {
    const input = calculationInput(reference);
    assert.deepEqual(normaliseIdentity(calculateDeadline(input, approvedData)),
      normaliseIdentity(calculateDeadline(input, candidateData)), reference.caseId);
  }
});

test('MVP04 keeps all golden special-regime results and complete traces', () => {
  for (const reference of specialGoldenSuite.cases) {
    const input = { profileId: reference.profileId, ...reference.input };
    assert.deepEqual(normaliseIdentity(calculateSpecialDeadline(input, approvedData)),
      normaliseIdentity(calculateSpecialDeadline(input, candidateData)), reference.caseId);
  }
});

test('MVP04 keeps all 60 AP17 qualification cases including negative boundaries', () => {
  assert.equal(corpus.referenceCases.length, 60);
  for (const reference of corpus.referenceCases) {
    const input = { mappingId: reference.mappingId, ...reference.input };
    assert.deepEqual(normaliseIdentity(calculateQualifiedSpecialDeadline(input, approvedData)),
      normaliseIdentity(calculateQualifiedSpecialDeadline(input, candidateData)), reference.id);
  }
});

test('MVP04 preserves operative calendars and suspension evidence from 2026 to distant leap years', () => {
  for (const year of [2026, 2027, 2028, 2100, 2400]) {
    const range = { from: `${year}-01-01`, to: `${year}-12-31` };
    for (const id of ['ch-federal-calendar', 'be-public-holidays']) {
      const before = resolveCalendar(candidateData, id, range);
      const after = resolveCalendar(approvedData, id, range);
      assert.ok(before && after);
      assert.deepEqual(after.holidaysByDate, before.holidaysByDate);
      assert.deepEqual(after.suspensionSets, before.suspensionSets);
      assert.deepEqual(normaliseIdentity(after.generation), normaliseIdentity(before.generation));
    }
  }
});

test('MVP04 promotion refuses a modified candidate manifest before output', async () => temporaryTask(async directory => {
  const destination = path.join(directory, 'data/releases', AP18C_CANDIDATE_ID);
  await cp(candidateDirectory, destination, { recursive: true });
  await writeFile(path.join(destination, 'manifest.json'), '{}\n');
  await assert.rejects(prepareMvp04Promotion(directory), /Changed pinned AP18C manifest/);
  await assert.rejects(readFile(path.join(directory, 'data/releases', MVP04_RELEASE_ID, 'manifest.json')), { code: 'ENOENT' });
}));

test('MVP04 promotion refuses a modified pinned artifact before output', async () => temporaryTask(async directory => {
  const destination = path.join(directory, 'data/releases', AP18C_CANDIDATE_ID);
  await cp(candidateDirectory, destination, { recursive: true });
  await writeFile(path.join(destination, 'profiles/stpo.json'), '{}\n');
  await assert.rejects(prepareMvp04Promotion(directory), /Changed pinned artifact: profiles\/stpo.json/);
}));

test('MVP04 refuses independent-validation bypass and bytes changed after validation', async () => temporaryTask(async directory => {
  await assert.rejects(writeMvp04Promotion(prepared, directory), /Independent Python validation must pass/);
  const mutated = { ...validated, files: new Map(validated.files) };
  mutated.files.set('profiles/stpo.json', Buffer.from('{}\n'));
  await assert.rejects(writeMvp04Promotion(mutated, directory), /Prepared artifact changed after validation/);
  await assert.rejects(readFile(path.join(directory, 'data/releases', MVP04_RELEASE_ID, 'manifest.json')), { code: 'ENOENT' });
}));

test('MVP04 independent candidate check rejects undeclared JSON before promotion', async () => temporaryTask(async directory => {
  const destination = path.join(directory, 'data/releases', AP18C_CANDIDATE_ID);
  await cp(candidateDirectory, destination, { recursive: true });
  await writeFile(path.join(destination, 'undeclared.json'), '{}\n');
  const otherwisePrepared = await prepareMvp04Promotion(directory);
  await assert.rejects(validateMvp04Promotion(otherwisePrepared, directory), /Independent release validation failed/);
}));

test('MVP04 writes are idempotent and refuse differing output without any overwrites', async () => temporaryTask(async directory => {
  await writeMvp04Promotion(validated, directory);
  await writeMvp04Promotion(validated, directory);
  const manifestFile = path.join(directory, 'data/releases', MVP04_RELEASE_ID, 'manifest.json');
  await writeFile(manifestFile, 'deliberately modified test output\n');
  await assert.rejects(writeMvp04Promotion(validated, directory), /Existing MVP04 release differs/);
  assert.equal(await readFile(manifestFile, 'utf8'), 'deliberately modified test output\n');
}));

test('MVP04 preflight checks late conflicting files before creating earlier outputs', async () => temporaryTask(async directory => {
  const releaseDirectory = path.join(directory, 'data/releases', MVP04_RELEASE_ID);
  await mkdir(releaseDirectory, { recursive: true });
  await writeFile(path.join(releaseDirectory, 'README.md'), 'existing user note\n');
  await assert.rejects(writeMvp04Promotion(validated, directory), /Existing MVP04 release differs: README/);
  await assert.rejects(readFile(path.join(releaseDirectory, 'profiles/stpo.json')), { code: 'ENOENT' });
  assert.equal(await readFile(path.join(releaseDirectory, 'README.md'), 'utf8'), 'existing user note\n');
}));

test('MVP04 refuses to replace symlink outputs', async () => temporaryTask(async directory => {
  const releaseDirectory = path.join(directory, 'data/releases', MVP04_RELEASE_ID);
  await mkdir(releaseDirectory, { recursive: true });
  const reference = path.join(directory, 'reference.json');
  await writeFile(reference, validated.files.get('manifest.json'));
  await symlink(reference, path.join(releaseDirectory, 'manifest.json'));
  await assert.rejects(writeMvp04Promotion(validated, directory), /Not a regular release output/);
  assert.deepEqual(await readFile(reference), validated.files.get('manifest.json'));
}));
