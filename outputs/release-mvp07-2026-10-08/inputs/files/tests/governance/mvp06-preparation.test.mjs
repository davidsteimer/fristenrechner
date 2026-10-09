// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile, mkdir, symlink, lstat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import test from 'node:test';
import { candidatePath, outputPath, historicalRoot, assertSafeEvidencePath, prepareMvp06Inputs, validateMvp06Inputs, persistMvp06Inputs } from '../../scripts/prepare-mvp06-inputs.mjs';

const prepared = await prepareMvp06Inputs();
const cloneFiles = () => new Map([...prepared.files].map(([path, bytes]) => [path, Buffer.from(bytes)]));
async function temporary(action) {
  const directory = await mkdtemp(join(tmpdir(), 'mvp06-preparation-test-'));
  try { return await action(directory); }
  finally { await rm(directory, { recursive: true }); }
}
async function materialize(directory) {
  for (const [path, bytes] of prepared.files) {
    await mkdir(dirname(join(directory, path)), { recursive: true });
    await writeFile(join(directory, path), bytes, { flag: 'wx' });
  }
  await persistMvp06Inputs(prepared, directory);
}

test('MVP06 preparation binds accepted AP20C3 and only plans application/package versions', () => {
  const { snapshot } = prepared;
  assert.equal(snapshot.scope.federalRules, 44);
  assert.equal(snapshot.scope.cantonalBindings, 50);
  assert.equal(snapshot.scope.newAp20Rules, 20);
  assert.equal(snapshot.scope.newAp20Bindings, 22);
  assert.deepEqual(snapshot.scope.operativeCantonsPlanned, ['BE']);
  assert.deepEqual(snapshot.targetVersions, { application: '0.6.0', package: '0.6.0.0', status: 'planned-not-built' });
  assert.deepEqual(snapshot.formats, { socialProcedureCatalog: '2.0.0', manifest: '6.0.0', minimumConsumer: '6.0.0' });
  assert.equal(snapshot.permissions.localPreparationAuthorized, true);
  assert.ok(Object.entries(snapshot.permissions).filter(([key]) => key !== 'localPreparationAuthorized').every(([, value]) => value === false));
  assert.equal(snapshot.priorProduction.applicationVersion, '0.5.0');
  assert.equal(snapshot.priorProduction.packageVersion, '0.5.0.0');
  assert.equal(snapshot.priorProduction.liveTenantOrHostingStatusNotAsserted, true);
});

test('all fifty eligibility refs resolve narrowly through four exact proofs, including earlier AP19 evidence', () => {
  const { snapshot } = prepared;
  assert.equal(snapshot.integrationEvidence.sourceReviews.length, 4);
  assert.deepEqual(snapshot.integrationEvidence.sourceReviews.map(item => item.affectedBindings), [28, 6, 8, 8]);
  assert.equal(snapshot.integrationEvidence.sourceReviews[0].reviewId, 'MVP05-SOURCE-APPROVAL-20260928');
  assert.equal(snapshot.integrationEvidence.referenceSuites.length, 3);
  assert.equal(snapshot.integrationEvidence.earlierAp19SourceProofs.length, 3);
  for (const entry of snapshot.integrationEvidence.earlierAp19SourceProofs) assert.ok(snapshot.evidence.some(item => item.path === entry.path && item.sha256 === entry.sha256));
  assert.equal(snapshot.scope.unchangedNonSocialArtifacts, 9);
  const social = JSON.parse(prepared.files.get(`${candidatePath}/social-procedures/ch-social-procedures.json`));
  assert.ok(social.releaseEligibility.every(entry => entry.status === 'candidate' && entry.approval === null));
});

for (const [name, path] of [
  ['manifest', `${candidatePath}/manifest.json`],
  ['social data', `${candidatePath}/social-procedures/ch-social-procedures.json`],
  ['AP20C1 source control', 'outputs/ap20c1-2026-09-30/quellenkontrolle.json'],
  ['AP20C2 source control', 'outputs/ap20c2-2026-10-01/quellenkontrolle.json'],
  ['AP20C3 source control', 'outputs/ap20c3-2026-10-01/quellenkontrolle.json'],
  ['earlier AP19 source proof', 'outputs/ap19c2-2026-09-28/sources/source-review.json'],
  ['earlier MVP05 source approval', 'outputs/release-mvp05-2026-09-28/source-approval.json'],
  ['AP20 reference dates', 'tests/golden/candidates/ap20b-social-dates.json'],
  ['acceptance', 'docs/fachrecht/abnahme-ap20c3.md'],
  ['decision', 'docs/entscheidungen/DEC-2026-026-beschluss.md'],
  ['C3 protocol', 'outputs/ap20c3-2026-10-01/pruefprotokoll.json'],
  ['production data pin', 'spfx/src/core/config.ts'],
  ['public entry point', 'src/public-app/main.tsx'],
  ['SPFx version', 'spfx/config/package-solution.json'],
  ['source register', 'data/source-reviews/source-register.json'],
  ['source review index', 'data/source-reviews/index.json']
]) test(`MVP06 preparation rejects altered ${name} bytes`, () => {
  const files = cloneFiles();
  files.set(path, Buffer.concat([files.get(path), Buffer.from('\n')]));
  assert.throws(() => validateMvp06Inputs(files, prepared.snapshot));
});

test('MVP06 cannot invent acceptance, silently skip evidence or substitute a different source-review ID', () => {
  for (const path of ['docs/fachrecht/abnahme-ap20c1.md', 'docs/fachrecht/abnahme-ap20c2.md', 'docs/fachrecht/abnahme-ap20c3.md', 'outputs/ap19c1-2026-09-25/source-review.json']) {
    const files = cloneFiles(); files.delete(path);
    assert.throws(() => validateMvp06Inputs(files), /Missing preparation evidence/);
  }
  const path = `${candidatePath}/social-procedures/ch-social-procedures.json`;
  for (const change of [
    social => { social.releaseEligibility[0].sourceReviewRef.reviewId = 'MVP06-APPROVED'; },
    social => { social.releaseEligibility[0].releaseId = '2026-10-01-mvp-06-approved.1'; },
    social => { social.releaseEligibility[0].status = 'approved'; social.releaseEligibility[0].approval = { approvedBy: 'invented' }; }
  ]) {
    const files = cloneFiles(), social = JSON.parse(files.get(path)); change(social);
    files.set(path, Buffer.from(JSON.stringify(social)));
    assert.throws(() => validateMvp06Inputs(files));
  }
});

test('MVP06 validates all C3 checks and historical C1/C2 preimages without rewriting old evidence', () => {
  const { snapshot } = prepared;
  for (const version of ['ap20c1', 'ap20c2']) assert.ok(snapshot.evidence.some(entry => entry.path.includes(`${version}-baseline/`)));
  const proof = JSON.parse(prepared.files.get('outputs/ap20c3-2026-10-01/pruefprotokoll.json'));
  for (const check of proof.checks) assert.ok(snapshot.evidence.some(entry => entry.path === check.evidence.path && entry.sha256 === check.evidence.sha256));
  for (const path of ['package.json', 'src/public-app/main.tsx', 'spfx/src/core/config.ts', 'spfx/config/package-solution.json', 'data/source-reviews/source-register.json', 'data/source-reviews/index.json']) {
    const entry = snapshot.preservation.historicalArchives.find(item => item.path === path);
    assert.ok(entry);
    assert.equal(entry.archivedAt, `${historicalRoot}/${path}`);
  }
  assert.equal(snapshot.preservation.archiveFallbackAllowed, false);
});

test('MVP06 snapshot is deterministic, append-only and byte-identical after repeat persistence', async () => {
  const repeated = await prepareMvp06Inputs();
  assert.deepEqual(repeated.snapshot, prepared.snapshot);
  await temporary(async directory => {
    await persistMvp06Inputs(prepared, directory);
    const first = await readFile(join(directory, outputPath));
    await persistMvp06Inputs(repeated, directory);
    assert.ok((await readFile(join(directory, outputPath))).equals(first));
    assert.deepEqual(JSON.parse(first), prepared.snapshot);
    for (const entry of prepared.snapshot.preservation.historicalArchives) assert.ok((await readFile(join(directory, entry.archivedAt))).equals(prepared.files.get(entry.path)));
  });
});

test('MVP06 preflight refuses a differing existing target before writing any other archive or snapshot', async () => temporary(async directory => {
  const entry = prepared.snapshot.preservation.historicalArchives.at(-1);
  const destination = join(directory, entry.archivedAt);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, 'user-owned-file\n');
  await assert.rejects(persistMvp06Inputs(prepared, directory), /Existing preparation differs/);
  assert.equal(await readFile(destination, 'utf8'), 'user-owned-file\n');
  await assert.rejects(lstat(join(directory, outputPath)), { code: 'ENOENT' });
  await assert.rejects(lstat(join(directory, prepared.snapshot.preservation.historicalArchives[0].archivedAt)), { code: 'ENOENT' });
}));

test('MVP06 remains independently verifiable after all archived live files change or are removed', async () => temporary(async directory => {
  await materialize(directory);
  // Simulated future promotion happens only inside this owned temporary fixture.
  for (const entry of prepared.snapshot.preservation.historicalArchives) await rm(join(directory, entry.path));
  for (const [path, replacement] of [
    ['package.json', '{"version":"0.6.0"}'],
    ['spfx/config/package-solution.json', '{"solution":{"version":"0.6.0.0"}}'],
    ['src/public-app/main.tsx', 'new MVP06 public entry point\n'],
    ['data/source-reviews/index.json', '{"generatedOn":"2026-10-02"}']
  ]) await writeFile(join(directory, path), replacement);
  const restored = await prepareMvp06Inputs(directory);
  assert.deepEqual(restored.snapshot, prepared.snapshot);
  assert.equal(JSON.parse(await readFile(join(directory, 'package.json'))).version, '0.6.0');
  assert.equal(restored.snapshot.priorProduction.applicationVersion, '0.5.0');
}));

test('MVP06 missing or altered historical archive never falls back to an otherwise matching live file', async () => temporary(async directory => {
  await materialize(directory);
  const entry = prepared.snapshot.preservation.historicalArchives.find(item => item.path === 'src/public-app/main.tsx');
  await rm(join(directory, entry.archivedAt));
  await assert.rejects(prepareMvp06Inputs(directory), { code: 'ENOENT' });
  await writeFile(join(directory, entry.archivedAt), 'modified archive\n');
  await assert.rejects(prepareMvp06Inputs(directory), /Historical preparation archive changed/);
  assert.ok((await readFile(join(directory, entry.path))).equals(prepared.files.get(entry.path)));
}));

test('MVP06 rejects path traversal, unrelated paths, symlink files and symlink parents', async () => {
  for (const path of ['/etc/passwd', '../outside', 'outputs/../outside', 'outputs//file', 'outputs/./file', 'outputs\\file', 'outputs/file\nsecret', '.git/config', 'private/secret']) assert.throws(() => assertSafeEvidencePath(path));
  await temporary(async directory => {
    await materialize(directory);
    const entry = prepared.snapshot.preservation.historicalArchives.find(item => item.path === 'src/public-app/main.tsx');
    await rm(join(directory, entry.archivedAt));
    await symlink(join(directory, entry.path), join(directory, entry.archivedAt));
    await assert.rejects(prepareMvp06Inputs(directory), /Not a regular file/);
  });
  await temporary(async directory => {
    const redirect = join(directory, 'redirect');
    await mkdir(redirect);
    await mkdir(join(directory, historicalRoot), { recursive: true });
    await symlink(redirect, join(directory, historicalRoot, 'src'));
    await assert.rejects(persistMvp06Inputs(prepared, directory), /Not a regular directory/);
    await assert.rejects(lstat(join(directory, outputPath)), { code: 'ENOENT' });
  });
});
