// SPDX-License-Identifier: AGPL-3.0-only
// Bound implementation delta only. This verifier never edits files.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, prefix, hash } from './consolidate-mvp09-sources.mjs';
import { readRegular } from './record-mvp09-source-approval.mjs';
import { requireR09BApproval } from './record-r09b-execution-approval.mjs';
export async function verifyWiring() {
  const authority = await requireR09BApproval();
  const priors = new Map(authority.record.beforeInputs.map(item => [item.path, item]));
  const beforeBytes = path => readRegular(root, priors.get(path).archivedAt);
  const currentBytes = path => readRegular(root, path);
  const before = async path => JSON.parse(await beforeBytes(path));
  const current = async path => JSON.parse(await currentBytes(path));
  const pin = await current(prefix + '/local-data-pin.json');
  assert.match(pin.commit, /^[0-9a-f]{40}$/);
  assert.equal(pin.localOnly, true);
  assert.equal(pin.publicationVerified, false);
  const baseUrl = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/' + pin.commit
    + '/data/releases/2026-10-18-mvp-09-approved.1';
  for (const path of ['package.json', 'spfx/package.json']) {
    const old = await before(path), now = await current(path);
    assert.equal(old.version, '0.8.0'); assert.equal(now.version, '0.9.0');
    now.version = old.version;
    assert.deepEqual(now, old, 'Dependencies, scripts or other package metadata changed: ' + path);
  }
  for (const path of ['package-lock.json', 'spfx/package-lock.json']) {
    const old = await before(path), now = await current(path);
    assert.equal(now.version, '0.9.0'); assert.equal(now.packages[''].version, '0.9.0');
    now.version = old.version; now.packages[''].version = old.packages[''].version;
    assert.deepEqual(now, old, 'Dependency lock drift: ' + path);
  }
  const solutionPath = 'spfx/config/package-solution.json';
  const oldSolution = await before(solutionPath), solution = await current(solutionPath);
  assert.equal(solution.solution.version, '0.9.0.0');
  assert.equal(solution.solution.features[0].version, '0.9.0.0');
  solution.solution.version = oldSolution.solution.version;
  solution.solution.features[0].version = oldSolution.solution.features[0].version;
  assert.deepEqual(solution, oldSolution, 'Package scope or identity changed');
  const manifestPath = 'spfx/src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json';
  const oldManifest = await before(manifestPath), manifest = await current(manifestPath);
  assert.equal(manifest.preconfiguredEntries[0].properties.githubBaseUrl, baseUrl);
  manifest.preconfiguredEntries[0].properties.githubBaseUrl = oldManifest.preconfiguredEntries[0].properties.githubBaseUrl;
  assert.deepEqual(manifest, oldManifest, 'Webpart configuration changed beyond pin');
  const oldUrl = oldManifest.preconfiguredEntries[0].properties.githubBaseUrl;
  assert.equal((await currentBytes('spfx/src/core/config.ts')).toString(),
    (await beforeBytes('spfx/src/core/config.ts')).toString().replace(oldUrl, baseUrl));
  assert.equal((await currentBytes('src/public-app/main.tsx')).toString(),
    (await beforeBytes('src/public-app/main.tsx')).toString().replaceAll('mvp08', 'mvp09'));
  assert.equal((await currentBytes('scripts/build-public-app.mjs')).toString(),
    (await beforeBytes('scripts/build-public-app.mjs')).toString()
      .replace("'0.8.0'", "'0.9.0'").replace("'2026-10-15-mvp-08-approved.1'", "'2026-10-18-mvp-09-approved.1'"));
  const allowed = new Set(['data/source-reviews/index.json', 'data/source-reviews/source-register.json',
    'package.json', 'package-lock.json', 'spfx/package.json', 'spfx/package-lock.json',
    solutionPath, manifestPath, 'spfx/src/core/config.ts', 'src/public-app/main.tsx', 'scripts/build-public-app.mjs',
    'scripts/run-standard-tests.mjs', 'spfx/test/product-integration.test.ts',
    ...['mvp08-build','build','ap23e3-build','ap23d3-build','ap22c3-build','ap21-build','ap19c3-build']
      .map(name => 'tests/public-app/' + name + '.test.ts'),
    'tests/ui/ap22c2-candidate.test.ts', 'tests/ui/ap22c3-host-policy.test.tsx', 'tests/ui/mvp05-release.test.ts']);
  const changed = [], unchanged = [];
  for (const prior of authority.record.beforeInputs) {
    const bytes = await currentBytes(prior.path);
    const actual = {path: prior.path, byteLength: bytes.length, sha256: hash(bytes)};
    if (actual.sha256 === prior.sha256) unchanged.push(actual);
    else {
      assert.ok(allowed.has(prior.path), 'Unapproved accepted-input drift: ' + prior.path);
      changed.push({before: prior, after: actual});
    }
  }
  assert.ok(unchanged.some(item => item.path === 'src/ui/styles.css'));
  assert.ok(unchanged.some(item => item.path === 'src/core/administrativeDeadline.ts'));
  return {kind: 'mvp09-bounded-product-wiring', status: 'passed', authority: {path: authority.path, sha256: authority.sha256},
    baseUrl, dependenciesUnchanged: true, coreAndUiRulesUnchanged: true, ux50Preserved: true,
    checkedInputs: authority.record.beforeInputs.length, changed, unchanged,
    installationAuthorized: false, publicationAuthorized: false};
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  console.log(JSON.stringify(await verifyWiring(), null, 2));
