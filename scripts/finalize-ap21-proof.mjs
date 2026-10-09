// SPDX-License-Identifier: AGPL-3.0-only
// Binds local AP21 evidence without granting device, release or deployment approval.
import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = 'outputs/ap21-2026-10-08';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const readJson = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'));
async function verify(entry) {
  const bytes = await readFile(resolve(root, entry.path));
  assert.equal(digest(bytes), entry.sha256, `Changed evidence: ${entry.path}`);
  if (entry.byteLength !== undefined) assert.equal(bytes.length, entry.byteLength, entry.path);
}
const qa = await readJson(`${out}/QA-AP21.json`);
assert.equal(qa.status, 'local-tests-passed-device-validation-open');
assert.equal(qa.realDeviceTestsComplete, false);
assert.equal(qa.runs.ap21.tests, 50);
assert.equal(qa.runs.product.tests, 2248);
for (const run of Object.values(qa.runs)) { assert.equal(run.passed, true); await verify(run.log); }
for (const entry of qa.artifacts) await verify(entry);

const spfx = await readJson(`${out}/spfx-build.json`);
assert.equal(spfx.status, 'passed');
assert.equal(spfx.checks.sourceTests.pass, 186);
assert.equal(spfx.checks.actualPackageTests.pass, 80);
assert.equal(spfx.sourceComparison.allIdentical, true);
assert.equal(spfx.sourceComparison.comparedFiles, 63);
await verify(spfx.originalPackage);
await verify(spfx.isolatedTestPackage);
for (const entry of spfx.sourceComparison.files) {
  await verify(entry);
  await verify({ path: entry.stagePath, sha256: entry.stageSha256, byteLength: entry.byteLength });
}
const manifest = await readJson('.work/public-ap21/build-manifest.json');
assert.equal(manifest.deployable, false);
assert.equal(manifest.dataReleaseId, qa.dataReleaseId);
assert.equal(manifest.assets.javascript, './assets/app-C47NLQDG.js');

const paths = new Set(qa.artifacts.map(entry => entry.path));
for (const path of ['README.md', 'docs/README.md', 'docs/architektur/README.md', 'docs/fachrecht/README.md',
  'docs/planung/release-mvp07.md', 'src/ui/README.md', 'scripts/finalize-ap21-proof.mjs',
  spfx.originalPackage.path, spfx.isolatedTestPackage.path]) paths.add(path);
async function collect(dir) {
  for (const entry of await readdir(resolve(root, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) await collect(path);
    else if (entry.isFile() && path !== `${out}/completion-integrity.json`) paths.add(path);
  }
}
await collect(out);
await collect('.work/public-ap21');
for (const entry of spfx.sourceComparison.files) paths.add(entry.path);
const artifacts = [];
for (const path of [...paths].sort()) {
  const bytes = await readFile(resolve(root, path));
  artifacts.push({ path, sha256: digest(bytes), byteLength: bytes.length });
}
const receipt = {
  schemaVersion: '1.0.0', workPackage: 'AP21', createdAt: new Date().toISOString(),
  status: 'local-implementation-verified-real-device-validation-open',
  accepted: false, published: false, deployed: false, installationApproved: false,
  normativeDataChanged: false, dataReleaseId: qa.dataReleaseId,
  realDeviceTestsComplete: false, remainingGates: qa.remainingGates,
  tests: { ap21Subset: 50, productIncludingAp21: 2248, hostAdapters: 10, publicBuild: 16, spfxSource: 186, spfxBuilt: 80 },
  spfxStage: spfx.stage, artifacts
};
await writeFile(resolve(root, `${out}/completion-integrity.json`), JSON.stringify(receipt, null, 2) + '\n');
for (const entry of receipt.artifacts) await verify(entry);
console.log(JSON.stringify({ status: receipt.status, artifacts: receipt.artifacts.length, spfxStage: receipt.spfxStage }));
