// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { candidatePath, prepareMvp05Inputs, validateMvp05Inputs, persistMvp05Inputs } from '../../scripts/prepare-mvp05-inputs.mjs';

test('MVP05 preparation binds the accepted candidate without granting release permissions', async () => {
  const { snapshot } = await prepareMvp05Inputs();
  assert.equal(snapshot.scope.federalRules, 24);
  assert.equal(snapshot.scope.cantonalBindings, 28);
  assert.deepEqual(snapshot.scope.operativeCantonsPlanned, ['BE']);
  assert.equal(snapshot.permissions.localPreparationAuthorized, true);
  assert.ok(Object.entries(snapshot.permissions).filter(([key]) => key !== 'localPreparationAuthorized').every(([, value]) => value === false));
  assert.equal(snapshot.integrationEvidence.sourceReviews.length, 3);
  assert.equal(snapshot.integrationEvidence.referenceSuites.length, 2);
});

for (const [name, path] of [
  ['manifest', `${candidatePath}/manifest.json`],
  ['social data', `${candidatePath}/social-procedures/ch-social-procedures.json`],
  ['source proof', 'outputs/ap19c3-2026-09-28/sources/source-review.json'],
  ['reference suite', 'tests/golden/candidates/ap19b-social-deadlines.json']
]) test(`MVP05 preparation rejects altered ${name} bytes`, async () => {
  const { files } = await prepareMvp05Inputs();
  files.set(path, Buffer.concat([files.get(path), Buffer.from('\n')]));
  assert.throws(() => validateMvp05Inputs(files));
});

test('MVP05 preparation requires all three actual acceptance documents', async () => {
  const { files } = await prepareMvp05Inputs();
  files.delete('docs/fachrecht/abnahme-ap19c2.md');
  assert.throws(() => validateMvp05Inputs(files), /Missing preparation evidence/);
});

test('MVP05 snapshot is deterministic and never replaces a differing existing output', async () => {
  const first = await prepareMvp05Inputs();
  const second = await prepareMvp05Inputs();
  assert.deepEqual(first.snapshot, second.snapshot);
  const directory = await mkdtemp(join(tmpdir(), 'mvp05-preparation-test-'));
  try {
    const target = join(directory, 'snapshot.json');
    await persistMvp05Inputs(first.snapshot, target);
    await persistMvp05Inputs(second.snapshot, target);
    assert.deepEqual(JSON.parse(await readFile(target)), first.snapshot);
    await writeFile(target, 'user-owned-file\n');
    await assert.rejects(persistMvp05Inputs(first.snapshot, target), /Existing preparation differs/);
    assert.equal(await readFile(target, 'utf8'), 'user-owned-file\n');
  } finally { await rm(directory, { recursive: true }); }
});
