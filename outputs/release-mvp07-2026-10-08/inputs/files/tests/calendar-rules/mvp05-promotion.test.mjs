// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm, mkdir, cp, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { AP19C3_CANDIDATE_PATH, AP19C3_CANDIDATE_MANIFEST_SHA256, MVP05_RELEASE_ID, MVP05_PROMOTION_REPORT, mvp05Sha256, prepareMvp05Promotion, validateMvp05Promotion, writeMvp05Promotion } from '../../scripts/promote-ap19-release.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const prepared = await prepareMvp05Promotion();
const validated = await validateMvp05Promotion(prepared);
const temporary = async body => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'fristenrechner-mvp05-test-'));
  try { return await body(directory); }
  finally { await rm(directory, {recursive: true, force: true}); }
};

test('MVP05 deterministic derivation, independent validation and written readback agree', async () => {
  assert.deepEqual(await prepareMvp05Promotion(), prepared);
  assert.deepEqual(await validateMvp05Promotion(prepared), validated);
  for (const [name, bytes] of prepared.files) assert.deepEqual(await readFile(path.join(root, 'data/releases', MVP05_RELEASE_ID, name)), bytes, name);
  assert.deepEqual(JSON.parse(await readFile(path.join(root, MVP05_PROMOTION_REPORT))), validated.report);
});

test('MVP05 data approval records no publication, installation or operating permission', () => {
  assert.equal(prepared.manifest.releaseStatus, 'approved');
  assert.equal(prepared.manifest.extensions['steimer.approval'].approvedBy, 'David Steimer');
  for (const key of ['publicationApproved', 'deploymentApproved', 'productionActivation']) assert.equal(prepared.report[key], false);
  assert.equal(prepared.manifest.extensions['steimer.release-preparation'].operatingApproval, 'requiresSeparateDecision');
});

test('MVP05 changes only social approval metadata and preserves all eleven candidate files', async () => {
  const manifestBytes = await readFile(path.join(root, AP19C3_CANDIDATE_PATH, 'manifest.json'));
  assert.equal(mvp05Sha256(manifestBytes), AP19C3_CANDIDATE_MANIFEST_SHA256);
  const candidate = JSON.parse(manifestBytes);
  const changed = [];
  for (const descriptor of candidate.artifacts) {
    const bytes = await readFile(path.join(root, AP19C3_CANDIDATE_PATH, descriptor.path));
    assert.equal(mvp05Sha256(bytes), descriptor.sha256);
    if (!bytes.equals(prepared.files.get(descriptor.path))) changed.push(descriptor.path);
  }
  assert.deepEqual(changed, ['social-procedures/ch-social-procedures.json']);
  assert.equal(prepared.report.unchangedArtifacts.length, 9);
  assert.deepEqual(prepared.manifest.sourceSummary, candidate.sourceSummary);
  assert.deepEqual(prepared.manifest.extensions['steimer.candidate'], candidate.extensions['steimer.candidate']);
});

test('MVP05 refuses a changed candidate manifest before any output', async () => temporary(async directory => {
  const target = path.join(directory, AP19C3_CANDIDATE_PATH);
  await cp(path.join(root, AP19C3_CANDIDATE_PATH), target, {recursive: true});
  await writeFile(path.join(target, 'manifest.json'), '{}\n');
  await assert.rejects(prepareMvp05Promotion(directory), /Changed pinned AP19C3 manifest/);
  await assert.rejects(readFile(path.join(directory, 'data/releases', MVP05_RELEASE_ID, 'manifest.json')), {code: 'ENOENT'});
}));

test('MVP05 refuses changed candidate artifact bytes before any output', async () => temporary(async directory => {
  const target = path.join(directory, AP19C3_CANDIDATE_PATH);
  await cp(path.join(root, AP19C3_CANDIDATE_PATH), target, {recursive: true});
  await writeFile(path.join(target, 'profiles/stpo.json'), '{}\n');
  await assert.rejects(prepareMvp05Promotion(directory), /Changed pinned artifact: profiles\/stpo.json/);
}));

test('MVP05 refuses an independent-validation bypass or bytes changed afterwards', async () => temporary(async directory => {
  await assert.rejects(writeMvp05Promotion(prepared, directory), /Independent Python validation/);
  const tampered = {...validated, files: new Map(validated.files)};
  tampered.files.set('profiles/stpo.json', Buffer.from('{}\n'));
  await assert.rejects(writeMvp05Promotion(tampered, directory), /Prepared artifact changed/);
  const forged = {...validated, report: {...validated.report, publicationApproved: true}};
  await assert.rejects(writeMvp05Promotion(forged, directory), /Prepared proof differs/);
}));

test('MVP05 append-only writer is idempotent and refuses changed prior outputs', async () => temporary(async directory => {
  await writeMvp05Promotion(validated, directory);
  await writeMvp05Promotion(validated, directory);
  const target = path.join(directory, 'data/releases', MVP05_RELEASE_ID, 'manifest.json');
  await writeFile(target, '{}\n');
  await assert.rejects(writeMvp05Promotion(validated, directory), /Existing MVP05 release differs/);
  assert.equal(await readFile(target, 'utf8'), '{}\n');
}));

test('MVP05 refuses a symbolic-link output instead of following it', async () => temporary(async directory => {
  const target = path.join(directory, 'data/releases', MVP05_RELEASE_ID);
  await mkdir(target, {recursive: true});
  const other = path.join(directory, 'owned-sentinel.json');
  await writeFile(other, prepared.files.get('manifest.json'));
  await symlink(other, path.join(target, 'manifest.json'));
  await assert.rejects(writeMvp05Promotion(validated, directory), /Not a regular release output/);
  assert.deepEqual(await readFile(other), prepared.files.get('manifest.json'));
}));
