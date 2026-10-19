// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { before, test } from 'node:test';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const output = resolve('.work/public-ap21');
const candidateManifest = 'outputs/ap22c3-2026-10-08/bundle/manifest.json';
const sha256 = (value: Uint8Array): string => createHash('sha256').update(value).digest('hex');
let manifestHashBefore: string;
before(async () => {
  manifestHashBefore = sha256(await readFile(candidateManifest));
  await exec(process.execPath, [resolve('scripts/build-public-app.mjs')], {
    cwd: process.cwd(), env: { ...process.env, FRISTENRECHNER_DATA_CANDIDATE: 'ap21' }
  });
});

test('AP21 is a separate non-deployable UI build on the unchanged accepted C3 reference bundle', async () => {
  const manifest = JSON.parse(await readFile(resolve(output, 'build-manifest.json'), 'utf8'));
  assert.equal(manifest.version, 'ap21-local-candidate');
  assert.equal(manifest.status, 'candidate');
  assert.equal(manifest.deployable, false);
  assert.equal(manifest.dataReleaseId, '2026-10-08-ap22c3-reference.1');
  assert.equal(sha256(await readFile(candidateManifest)), manifestHashBefore);
  const entry = await readFile('src/public-app/ap21-main.tsx', 'utf8');
  assert.match(entry, /ap22c3CandidateRuntime/);
  assert.match(entry, /referenceOnlyAllCalculations/);
  assert.match(entry, /localReviewLabel="AP21/);
  const appearance = await readFile('src/ui/browserAppearance.tsx', 'utf8');
  for (const iconName of ['Up', 'Down']) assert.match(appearance, new RegExp(`${iconName}: icon\\(`));
  const js = await readFile(resolve(output, manifest.assets.javascript), 'utf8');
  for (const token of ['AP21', '2026-10-08-ap22c3-reference.1', 'Europe/Zurich', 'TT.MM.JJJJ']) {
    assert.ok(js.includes(token), `Expected AP21 bundle token: ${token}`);
  }
  assert.ok(!/qaPresets|stpo-weekend|SYNTHETIC TEST|new XMLHttpRequest|new WebSocket/.test(js));
  assert.ok(!/\bfetch\s*\(/.test(js));
  assert.ok(!(await readdir(output, { recursive: true })).some(file => file.endsWith('.map')));
  assert.equal(await readFile(resolve(output, '.htaccess'), 'utf8'), await readFile('public-app/.htaccess', 'utf8'));
});

test('historical AP21 candidate remains separate from the approved local MVP09 entry and package', async () => {
  assert.match(await readFile('src/public-app/main.tsx', 'utf8'), /mvp09Runtime/);
  assert.match(await readFile('spfx/src/core/config.ts', 'utf8'), /[a-f0-9]{40}\/data\/releases\/2026-10-18-mvp-09-approved\.1/);
  const packageSolution = JSON.parse(await readFile('spfx/config/package-solution.json', 'utf8'));
  assert.equal(packageSolution.solution.version, '0.9.0.0');
});
