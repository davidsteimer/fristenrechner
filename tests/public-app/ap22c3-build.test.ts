// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { before, test } from 'node:test';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const output = resolve('.work/public-ap22c3');
before(async () => {
  await exec(process.execPath, [resolve('scripts/build-public-app.mjs')], {
    cwd: process.cwd(), env: { ...process.env, FRISTENRECHNER_DATA_CANDIDATE: 'ap22c3' }
  });
});
test('C3 builds as a separate non-deployable static reference bundle with 32-calendar runtime', async () => {
  const manifest = JSON.parse(await readFile(resolve(output, 'build-manifest.json'), 'utf8'));
  assert.equal(manifest.version, 'ap22c3-local-candidate'); assert.equal(manifest.status, 'candidate');
  assert.equal(manifest.deployable, false); assert.equal(manifest.dataReleaseId, '2026-10-08-ap22c3-reference.1');
  const js = await readFile(resolve(output, manifest.assets.javascript), 'utf8');
  for (const token of ['AP22C3', '2026-10-08-ap22c3-reference.1', 'ap22-ag-', 'TI-', 'GR-', 'Berechnungen']) {
    assert.ok(js.includes(token), `Expected candidate bundle token: ${token}`);
  }
  assert.ok(!/qaPresets|stpo-weekend|SYNTHETIC TEST|new XMLHttpRequest|new WebSocket/.test(js));
  assert.ok(!/\bfetch\s*\(/.test(js));
  assert.ok(!(await readdir(output, { recursive: true })).some(file => file.endsWith('.map')));
  assert.equal(await readFile(resolve(output, '.htaccess'), 'utf8'), await readFile('public-app/.htaccess', 'utf8'));
});
test('historical C3 candidate stays separate from the approved local MVP08 entry, pin and package', async () => {
  assert.match(await readFile('src/public-app/main.tsx', 'utf8'), /mvp08Runtime/);
  assert.match(await readFile('spfx/src/core/config.ts', 'utf8'), /[a-f0-9]{40}\/data\/releases\/2026-10-15-mvp-08-approved\.1/);
  const packageSolution = JSON.parse(await readFile('spfx/config/package-solution.json', 'utf8'));
  assert.equal(packageSolution.solution.version, '0.8.0.0');
});
