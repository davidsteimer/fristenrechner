// SPDX-License-Identifier: AGPL-3.0-only
// Explicit local candidate build. The normal public entry remains MVP 0.7.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const bind = async path => {
  const bytes = await readFile(resolve(root, path));
  return { path, byteLength: bytes.length, sha256: sha(bytes) };
};
const preserved = ['src/public-app/main.tsx', 'spfx/src/core/config.ts', 'spfx/config/package-solution.json',
  'outputs/ap23d2-candidate-2026-10-15/bundle/manifest.json'];
const protectedBefore = await Promise.all(preserved.map(bind));
process.env.FRISTENRECHNER_DATA_CANDIDATE = 'ap23d3';
const { buildPublicApp } = await import('./build-public-app.mjs');
const result = await buildPublicApp();
const protectedAfter = await Promise.all(preserved.map(bind));
assert.deepEqual(protectedAfter, protectedBefore, 'Approved source, normal entry or pin changed during build');
const files = [];
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = resolve(directory, entry.name);
    if (entry.isDirectory()) await collect(full);
    else files.push(await bind(relative(root, full)));
  }
}
await collect(result.outputDirectory);
files.sort((a, b) => a.path.localeCompare(b.path));
const output = resolve(root, 'outputs/ap23d3-2026-10-15');
await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'web-build.json'), JSON.stringify({
  workPackage: 'AP23D3', status: 'passed', localOnly: true, deployable: false,
  purpose: 'Explicit static Format-8 reference integration candidate. No release or hosting authority.',
  outputDirectory: relative(root, result.outputDirectory),
  dataReleaseId: '2026-10-15-ap23d2-reference.1', sourceReleaseApproved: false,
  protectedBefore, protectedAfter, artifacts: files
}, null, 2) + '\n');
