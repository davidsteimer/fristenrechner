// SPDX-License-Identifier: AGPL-3.0-only
// R07-B: isolated local build only. No installation, publication or old archive writes.
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyMvp07SourceApproval } from './record-mvp07-source-approval.mjs';
import { requireLocalBuildApproval } from './record-mvp07-local-build-approval.mjs';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const OUTPUT = 'outputs/release-mvp07-2026-10-08';
export const RELEASE_ID = '2026-10-08-mvp-07-approved.1';
export const NODE = '.work/toolchains/node-v22.23.2-darwin-arm64/bin/node';
export const ROLLBACK = 'outputs/release-mvp06-spfx-0.6.0.1-2026-10-01/artifacts/fristenrechner-schweiz-0.6.0.1.sppkg';
export const ROLLBACK_SHA256 = '60f84213507f99ec58463c84c514037d9c00bd63fdc8f02d85e52097bcf3c587';
const HISTORICAL = 'spfx/sharepoint/solution/fristenrechner-schweiz.sppkg';
const HISTORICAL_SHA256 = '9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346';
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => readFile(resolve(ROOT, path));

async function tree(directory) {
  const paths = [];
  async function visit(path) {
    for (const item of await readdir(resolve(ROOT, path), { withFileTypes: true })) {
      if (item.name === '.DS_Store' || item.name === '__pycache__' || item.name.endsWith('.pyc')) continue;
      const child = `${path}/${item.name}`;
      assert.ok(!item.isSymbolicLink(), `Unexpected input symlink: ${child}`);
      if (item.isDirectory()) await visit(child);
      else if (item.isFile()) paths.push(child);
    }
  }
  await visit(directory);
  return paths.sort();
}

async function inventory(paths) {
  return Promise.all([...new Set(paths)].sort().map(async path => {
    const bytes = await read(path);
    return { path, byteLength: bytes.length, sha256: hash(bytes) };
  }));
}

export async function productInputPaths() {
  const paths = ['package.json', 'package-lock.json', 'spfx/package.json', 'spfx/package-lock.json',
    'src/release/mvp07ReleaseData.ts', 'scripts/build-public-app.mjs', 'scripts/browser-globals-plugin.mjs',
    'scripts/build-mvp07-spfx.mjs', 'scripts/prepare_mvp07_artifacts.py'];
  for (const directory of ['src/core', 'src/ui', 'src/public-app', 'schemas', 'spfx/src/core',
    'spfx/src/webparts', 'spfx/scripts', 'spfx/config', 'spfx/test', 'spfx/test-build', 'public-app']) {
    paths.push(...(await tree(directory)).filter(path => !path.startsWith('src/ui/preview/')));
  }
  return [...new Set(paths)].sort();
}

export async function approvedData() {
  const promotionBytes = await read(`${OUTPUT}/data-promotion.json`);
  const promotion = JSON.parse(promotionBytes);
  assert.equal(promotion.releaseId, RELEASE_ID);
  assert.equal(promotion.dataStatus, 'approved');
  assert.equal(promotion.publicationApproved, false);
  assert.equal(promotion.deploymentApproved, false);
  assert.equal(promotion.productionActivation, false);
  const manifestPath = `data/releases/${RELEASE_ID}/manifest.json`;
  const manifestBytes = await read(manifestPath);
  assert.equal(hash(manifestBytes), promotion.manifestSha256, 'Promotion does not bind actual manifest');
  const manifest = JSON.parse(manifestBytes);
  assert.equal(manifest.releaseId, RELEASE_ID);
  assert.equal(manifest.releaseStatus, 'approved');
  assert.equal(manifest.formatVersion, '7.0.0');
  assert.equal(manifest.artifacts.length, 40);
  const pinBytes = await read(`${OUTPUT}/local-data-pin.json`);
  const pin = JSON.parse(pinBytes);
  assert.equal(pin.releaseId, RELEASE_ID);
  assert.equal(pin.manifestSha256, hash(manifestBytes));
  assert.match(pin.commit, /^[a-f0-9]{40}$/);
  assert.equal(pin.localOnly, true);
  assert.equal(pin.publicationVerified, false);
  const baseUrl = `https://raw.githubusercontent.com/davidsteimer/fristenrechner/${pin.commit}/data/releases/${RELEASE_ID}`;
  const config = (await read('spfx/src/core/config.ts')).toString();
  assert.equal(config.split(baseUrl).length - 1, 1, 'Missing exact immutable data pin');
  const descriptors = [{ path: 'manifest.json', sha256: hash(manifestBytes), byteLength: manifestBytes.length }, ...manifest.artifacts];
  const files = [];
  const seen = new Set();
  for (const descriptor of descriptors) {
    assert.match(descriptor.path, /^[a-z0-9/-]+\.json$/);
    assert.ok(!descriptor.path.split('/').includes('..') && !seen.has(descriptor.path));
    seen.add(descriptor.path);
    const path = `data/releases/${RELEASE_ID}/${descriptor.path}`;
    const bytes = await read(path);
    assert.equal(hash(bytes), descriptor.sha256, `Data hash mismatch: ${path}`);
    assert.equal(bytes.length, descriptor.byteLength, `Data size mismatch: ${path}`);
    const blob = spawnSync('git', ['cat-file', 'blob', `${pin.commit}:${path}`], { cwd: ROOT, maxBuffer: 16 * 1024 * 1024 });
    assert.equal(blob.status, 0, `Missing local pinned blob: ${path}`);
    assert.ok(bytes.equals(blob.stdout), `Data differs from immutable local pin: ${path}`);
    files.push({ path, byteLength: bytes.length, sha256: hash(bytes) });
  }
  return { manifestSha256: hash(manifestBytes), dataPromotionSha256: hash(promotionBytes),
    localDataPinSha256: hash(pinBytes), pinCommit: pin.commit, baseUrl, files };
}

export async function main() {
  assert.equal(process.argv.length, 2, 'No deployment, overwrite or package override arguments accepted');
  assert.equal(resolve(process.execPath), resolve(ROOT, NODE), 'Use the pinned Node toolchain');
  assert.equal(process.version, 'v22.23.2');
  assert.ok(!process.env.FRISTENRECHNER_TEST_SPPKG && !process.env.FRISTENRECHNER_DATA_CANDIDATE,
    'No test package or candidate override may affect the definitive build');
  await verifyMvp07SourceApproval(ROOT);
  await requireLocalBuildApproval(ROOT);
  const release = await approvedData();
  const frozenPaths = [...await tree('outputs/release-mvp06-2026-10-01'),
    ...await tree('outputs/release-mvp06-spfx-0.6.0.1-2026-10-01'), HISTORICAL];
  const frozen = await inventory(frozenPaths);
  assert.equal(hash(await read(ROLLBACK)), ROLLBACK_SHA256);
  assert.equal(hash(await read(HISTORICAL)), HISTORICAL_SHA256);
  const solution = JSON.parse(await read('spfx/config/package-solution.json')).solution;
  assert.equal(solution.id, '13090feb-a6bf-40fa-9d3c-ec8d90516a60');
  assert.equal(solution.version, '0.7.0.0');
  assert.equal(solution.features.length, 1);
  assert.equal(solution.features[0].id, '3edf1509-41e9-4a2f-8005-df510eec43b6');
  assert.equal(solution.features[0].version, '0.7.0.0');
  assert.equal(solution.includeClientSideAssets, true);
  assert.equal(solution.isDomainIsolated, false);
  assert.ok(!solution.webApiPermissionRequests?.length);
  for (const path of ['package.json', 'spfx/package.json']) assert.equal(JSON.parse(await read(path)).version, '0.7.0');
  const productInputs = await inventory(await productInputPaths());
  const fixturePaths = [...await tree('data'), ...await tree('tests'), ...await tree('outputs/ap22c3-2026-10-08/bundle')];
  const fixtureInputs = await inventory(fixturePaths);
  await mkdir(resolve(ROOT, '.work'), { recursive: true });
  const stage = await mkdtemp(resolve(ROOT, '.work/mvp07-spfx-build-'));
  const target = resolve(stage, 'spfx');
  await mkdir(target);
  const excluded = new Set(['node_modules', 'lib', 'lib-commonjs', 'dist', 'temp', 'release', 'sharepoint', '.heft']);
  for (const item of await readdir(resolve(ROOT, 'spfx'), { withFileTypes: true })) {
    if (excluded.has(item.name)) continue;
    assert.ok(!item.isSymbolicLink(), `Unexpected SPFx symlink: ${item.name}`);
    await cp(resolve(ROOT, 'spfx', item.name), resolve(target, item.name), { recursive: true, errorOnExist: true, force: false });
  }
  for (const directory of ['src', 'schemas', 'data', 'tests', 'outputs/ap22c3-2026-10-08/bundle']) {
    await cp(resolve(ROOT, directory), resolve(stage, directory), { recursive: true, errorOnExist: true, force: false });
  }
  await symlink(resolve(ROOT, 'spfx/node_modules'), resolve(target, 'node_modules'), 'dir');
  const npmCli = resolve(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js');
  const env = { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}`,
    npm_config_update_notifier: 'false', npm_config_audit: 'false', npm_config_fund: 'false' };
  const sourceTests = (await readdir(resolve(target, 'test'))).filter(name => name.endsWith('.test.ts')).sort().map(name => `test/${name}`);
  const builtTests = (await readdir(resolve(target, 'test-build'))).filter(name => name.endsWith('.test.cjs')).sort().map(name => `test-build/${name}`);
  assert.ok(sourceTests.length && builtTests.length);
  const commands = [
    { id: 'sync', command: process.execPath, args: [npmCli, 'run', 'sync'] },
    { id: 'source-tests', command: process.execPath, args: ['--import', 'tsx', '--test', '--test-concurrency=2', '--test-timeout=60000', ...sourceTests] },
    { id: 'compile', command: resolve(target, 'node_modules/.bin/heft'), args: ['test', '--clean', '--production'] },
    { id: 'css-audit', command: process.execPath, args: ['scripts/audit-product-css.mjs'] },
    { id: 'package', command: resolve(target, 'node_modules/.bin/heft'), args: ['package-solution', '--production'] },
    { id: 'built-tests', command: process.execPath, args: ['--test', '--test-concurrency=2', '--test-timeout=60000', ...builtTests] }
  ];
  const report = { kind: 'mvp07LocalSpfxBuild', startedAt: new Date().toISOString(), releaseId: RELEASE_ID,
    applicationVersion: '0.7.0', packageVersion: '0.7.0.0', manifestSha256: release.manifestSha256,
    dataPromotionSha256: release.dataPromotionSha256, localDataPinSha256: release.localDataPinSha256,
    pinCommit: release.pinCommit, stage: relative(ROOT, stage), toolchain: { node: NODE, nodeVersion: process.version },
    rollbackPackagePath: ROLLBACK, rollbackPackageSha256: ROLLBACK_SHA256,
    historicalPackagePath: HISTORICAL, historicalPackageSha256: HISTORICAL_SHA256,
    productInputFiles: productInputs, fixtureInputFiles: fixtureInputs, releaseFiles: release.files,
    sourceTestFiles: sourceTests, builtTestFiles: builtTests, frozenPriorEvidence: frozen,
    publicationVerified: false, installationAuthorized: false, productionActivation: false,
    remotePinPublicationVerified: false, runtimeHostValidationVerified: false, steps: [] };
  let passed = false;
  try {
    for (const step of commands) {
      const result = spawnSync(step.command, step.args, { cwd: target, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      const bytes = Buffer.from(`${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? String(result.error) : ''}`);
      const log = resolve(stage, `step-${report.steps.length + 1}.log`);
      await writeFile(log, bytes, { flag: 'wx' });
      const recorded = { id: step.id, command: relative(ROOT, step.command),
        args: step.args.map(arg => arg.startsWith(ROOT) ? relative(ROOT, arg) : arg),
        exitCode: result.status, signal: result.signal, log: relative(ROOT, log), rawLogSha256: hash(bytes) };
      report.steps.push(recorded);
      console.log(JSON.stringify(recorded));
      assert.equal(result.status, 0, `Build step failed: ${step.id}`);
    }
    assert.deepEqual(await inventory(await productInputPaths()), productInputs, 'Product inputs changed during build');
    assert.deepEqual(await inventory(fixturePaths), fixtureInputs, 'Test data changed during build');
    assert.deepEqual(await approvedData(), release, 'Approved release or local pin changed during build');
    report.packagePath = relative(ROOT, resolve(target, 'sharepoint/solution/fristenrechner-schweiz.sppkg'));
    report.packageSha256 = hash(await read(report.packagePath));
    passed = true;
  } catch (error) { report.error = String(error?.stack ?? error); }
  try {
    assert.deepEqual(await inventory(frozenPaths), frozen, 'Earlier release evidence changed');
    report.previousReleaseEvidenceUnchanged = true;
  } catch (error) { report.preservationError = String(error?.stack ?? error); passed = false; }
  report.passed = passed;
  report.finishedAt = new Date().toISOString();
  const evidence = relative(ROOT, resolve(stage, 'verification.json'));
  await writeFile(resolve(ROOT, evidence), `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
  console.log(JSON.stringify({ buildEvidence: evidence, passed, publicationVerified: false }));
  process.exitCode = passed ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
