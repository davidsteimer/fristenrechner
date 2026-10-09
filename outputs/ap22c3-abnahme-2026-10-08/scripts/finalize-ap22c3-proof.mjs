// SPDX-License-Identifier: AGPL-3.0-only
// Binds already completed local checks. It cannot turn a failed run into a pass.
import { readFile, writeFile, readdir, copyFile, mkdir } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'outputs/ap22c3-2026-10-08');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const load = async path => JSON.parse(await readFile(path, 'utf8'));
const evidence = async path => {
  const bytes = await readFile(resolve(root, path));
  return { path, sha256: sha(bytes), byteLength: bytes.length };
};
const stage = resolve(root, process.argv[2] ?? '');
const builtLog = resolve(root, process.argv[3] ?? '');
assert.ok(stage.startsWith(resolve(root, '.work/ap22c3-spfx-build-')));
assert.equal(dirname(builtLog), stage);
const prior = await load(resolve(stage, 'verification.json'));
assert.equal(prior.stage, stage);
assert.equal(prior.steps.length, 5);
assert.ok(prior.steps.slice(0, 4).every(step => step.exitCode === 0));
const log = await readFile(builtLog, 'utf8');
assert.match(log, /# fail 0(?:\r?\n|$)/);
assert.match(log, /# cancelled 0(?:\r?\n|$)/);
assert.match(log, /# skipped 0(?:\r?\n|$)/);
const builtTests = Number(/# tests (\d+)/.exec(log)?.[1]);
assert.ok(builtTests >= 68, 'Missing full packaged regression');
const qa = await load(resolve(output, 'QA-AP22C3.json'));
assert.ok(Object.values(qa.runs).every(run => run.passed));
for (const artifact of qa.artifacts) assert.deepEqual(await evidence(artifact.path), artifact);
const packagePath = resolve(stage, 'spfx/sharepoint/solution/fristenrechner-schweiz.sppkg');
const originalPackage = resolve(root, 'spfx/sharepoint/solution/fristenrechner-schweiz.sppkg');
assert.equal(sha(await readFile(originalPackage)), prior.originalHash);

async function list(folder, predicate) {
  const paths = [];
  for (const item of await readdir(resolve(root, folder), { withFileTypes: true })) {
    const path = `${folder}/${item.name}`;
    if (item.isDirectory()) paths.push(...await list(path, predicate));
    else if (predicate(path)) paths.push(path);
  }
  return paths.sort();
}
// Verify that the tested package was compiled from this exact product source.
const sourceBindings = [];
for (const path of await list('src/core', p => /\.ts$/.test(p))) {
  const target = resolve(stage, 'spfx/src/product/core', relative('src/core', path));
  assert.equal(sha(await readFile(target)), (await evidence(path)).sha256, path);
  sourceBindings.push(await evidence(path));
}
for (const path of await list('src/ui', p => !p.includes('/preview/') && /\.(?:tsx?|css)$/.test(p))) {
  const target = resolve(stage, 'spfx/src/product/ui', relative('src/ui', path));
  assert.equal(sha(await readFile(target)), (await evidence(path)).sha256, path);
  sourceBindings.push(await evidence(path));
}
for (const folder of ['spfx/src/core', 'spfx/src/webparts', 'spfx/test-build']) {
  for (const path of await list(folder, p => /\.(?:tsx?|scss|json|cjs|md)$/.test(p))) {
    assert.equal(sha(await readFile(resolve(stage, path))), (await evidence(path)).sha256, path);
    sourceBindings.push(await evidence(path));
  }
}
await mkdir(resolve(output, 'spfx-logs'), { recursive: true });
const steps = [];
for (const [index, step] of prior.steps.entries()) {
  const target = resolve(output, 'spfx-logs', `initial-step-${index + 1}.txt`);
  await copyFile(step.log, target);
  steps.push({ command: step.command, args: step.args, exitCode: step.exitCode,
    log: await evidence(relative(root, target)) });
}
await copyFile(builtLog, resolve(output, 'spfx-logs/built-regression-final.txt'));
const packaged = {
  kind: 'ap22c3-isolated-spfx-build', date: '2026-10-08', passed: true,
  deployed: false, installableReleaseApproved: false,
  sourceTests: Number(/# tests (\d+)/.exec(await readFile(prior.steps[0].log, 'utf8'))?.[1]), builtTests,
  originalPackageSha256: prior.originalHash, originalPackageUnchanged: true,
  isolatedPackageSha256: sha(await readFile(packagePath)),
  initialSteps: steps,
  finalBuiltRegression: await evidence('outputs/ap22c3-2026-10-08/spfx-logs/built-regression-final.txt'),
  correction: 'The legacy harness expected a persistent host.releaseService field. The unchanged AMD now creates the real service per load. Only the harness was adapted. The final packaged regression includes new format-7 checks.',
  sourceBindings
};
await writeFile(resolve(output, 'spfx-build.json'), JSON.stringify(packaged, null, 2) + '\n');
const publicFiles = await list('.work/public-ap22c3', () => true);
const publicManifest = await load(resolve(root, '.work/public-ap22c3/build-manifest.json'));
assert.equal(publicManifest.deployable, false);
assert.equal(publicManifest.dataReleaseId, '2026-10-08-ap22c3-reference.1');
const paths = ['outputs/ap22c3-2026-10-08/QA-AP22C3.json', 'outputs/ap22c3-2026-10-08/spfx-build.json',
  'outputs/ap22c3-2026-10-08/browser-qa.md', 'outputs/ap22c3-2026-10-08/bundle-integrity.json',
  'outputs/ap22c3-2026-10-08/oberflaeche-de.png', 'outputs/ap22c3-2026-10-08/tessin-pruefergebnis-de.png',
  'outputs/ap22c3-2026-10-08/januarvergleich-de.png', 'outputs/ap22c3-2026-10-08/sozial-fr-schmal.png',
  'README.md', 'docs/README.md', 'docs/architektur/README.md', 'docs/fachrecht/README.md', 'docs/planung/release-mvp07.md',
  'src/core/README.md', 'spfx/README.md', 'scripts/finalize-ap22c3-proof.mjs'];
const report = { kind: 'ap22c3-completion-integrity', date: '2026-10-08', status: 'ready-for-review', accepted: false,
  sourceReleaseApproved: false, deployed: false, published: false,
  artifacts: await Promise.all(paths.map(evidence)), publicBuild: await Promise.all(publicFiles.map(evidence)) };
await writeFile(resolve(output, 'completion-integrity.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ passed: true, sourceTests: packaged.sourceTests, builtTests, boundSourceFiles: sourceBindings.length,
  completionSha256: sha(await readFile(resolve(output, 'completion-integrity.json'))) }));
