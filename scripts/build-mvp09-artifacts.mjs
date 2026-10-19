// SPDX-License-Identifier: AGPL-3.0-only
// R09-B local build in an isolated directory. No deployment or Git writes.
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readdir, symlink } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, prefix, hash, encode } from './consolidate-mvp09-sources.mjs';
import { readRegular, writeExclusive } from './record-mvp09-source-approval.mjs';
import { requireR09BApproval } from './record-r09b-execution-approval.mjs';

export const releaseId = '2026-10-18-mvp-09-approved.1';
const releaseRoot = `data/releases/${releaseId}`;
const read = path => readRegular(root, path);
const json = async path => JSON.parse(await read(path));
const bind = async path => { const bytes = await read(path); return { path, byteLength: bytes.length, sha256: hash(bytes) }; };
async function tree(path) {
  const files = [];
  for (const item of await readdir(resolve(root, path), { withFileTypes: true })) {
    if (item.name === '.DS_Store' || item.name === '__pycache__' || item.name.endsWith('.pyc')) continue;
    assert.ok(!item.isSymbolicLink(), `Symlink not allowed: ${path}/${item.name}`);
    if (item.isDirectory()) files.push(...await tree(`${path}/${item.name}`));
    else if (item.isFile()) files.push(`${path}/${item.name}`);
  }
  return files.sort();
}
export async function verifyPinnedData() {
  const authority = await requireR09BApproval();
  const pin = await json(`${prefix}/local-data-pin.json`);
  assert.equal(pin.releaseId, releaseId);
  assert.match(pin.commit, /^[a-f0-9]{40}$/);
  assert.equal(pin.localOnly, true);
  assert.equal(pin.publicationVerified, false);
  const manifest = await json(`${releaseRoot}/manifest.json`);
  assert.equal(manifest.releaseId, releaseId);
  assert.equal(manifest.formatVersion, '9.0.0');
  assert.equal(manifest.releaseStatus, 'approved');
  assert.equal(manifest.artifacts.length, 41);
  const manifestBinding = await bind(`${releaseRoot}/manifest.json`);
  assert.equal(manifestBinding.sha256, pin.manifestSha256);
  const files = [manifestBinding];
  for (const item of manifest.artifacts) {
    const actual = await bind(`${releaseRoot}/${item.path}`);
    assert.equal(actual.sha256, item.sha256); assert.equal(actual.byteLength, item.byteLength);
    files.push(actual);
  }
  assert.deepEqual((await tree(releaseRoot)).sort(), files.map(item => item.path).sort());
  for (const file of files) {
    const result = spawnSync('git', ['cat-file', 'blob', `${pin.commit}:${file.path}`], { cwd: root, maxBuffer: 16 * 1024 * 1024 });
    assert.equal(result.status, 0); assert.equal(hash(result.stdout), file.sha256);
  }
  const baseUrl = `https://raw.githubusercontent.com/davidsteimer/fristenrechner/${pin.commit}/${releaseRoot}`;
  assert.ok((await read('spfx/src/core/config.ts')).toString().includes(baseUrl));
  assert.equal((await json('spfx/src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json')).preconfiguredEntries[0].properties.githubBaseUrl, baseUrl);
  return { authority: { path: authority.path, sha256: authority.sha256 }, pin, files, manifestBinding, baseUrl };
}
export async function generateEmbeddedRelease() {
  const release = await verifyPinnedData();
  const manifestText = (await read(`${releaseRoot}/manifest.json`)).toString();
  const manifest = JSON.parse(manifestText);
  const entries = await Promise.all(manifest.artifacts.map(async item => [item.path, (await read(`${releaseRoot}/${item.path}`)).toString()]));
  const module = `// SPDX-License-Identifier: AGPL-3.0-only\n// Generated from the approved MVP09 original bytes. No alternate reference activation.\nimport { createFormat9CalculationData } from '../core/format9CalculationData';\nexport const mvp09ManifestText = ${JSON.stringify(manifestText)};\nexport const mvp09Files: ReadonlyMap<string, string> = new Map(${JSON.stringify(entries)});\nexport const mvp09Runtime = createFormat9CalculationData(mvp09ManifestText, mvp09Files, { mode: 'approved' });\nexport const mvp09CalculationData = mvp09Runtime.data;\n`;
  await writeExclusive(root, 'src/release/mvp09ReleaseData.ts', Buffer.from(module));
  return { release, embedded: await bind('src/release/mvp09ReleaseData.ts') };
}
export async function buildLocalArtifacts() {
  assert.equal(process.version, 'v22.23.2');
  assert.ok(!process.env.FRISTENRECHNER_DATA_CANDIDATE && !process.env.FRISTENRECHNER_TEST_SPPKG);
  const { release, embedded } = await generateEmbeddedRelease();
  const reportPath = `${prefix}/product-build.json`;
  assert.equal(await readRegular(root, reportPath, true), undefined, 'A completed build already exists');
  const solution = (await json('spfx/config/package-solution.json')).solution;
  assert.equal(solution.version, '0.9.0.0'); assert.equal(solution.features[0].version, '0.9.0.0');
  assert.equal(solution.id, '13090feb-a6bf-40fa-9d3c-ec8d90516a60');
  assert.equal(solution.features[0].id, '3edf1509-41e9-4a2f-8005-df510eec43b6');
  assert.equal(solution.isDomainIsolated, false); assert.ok(!solution.webApiPermissionRequests?.length);
  for (const path of ['package.json', 'spfx/package.json']) assert.equal((await json(path)).version, '0.9.0');
  const productPaths = ['package.json', 'package-lock.json', 'spfx/package.json', 'spfx/package-lock.json', 'spfx/tsconfig.json',
    'src/release/mvp09ReleaseData.ts', 'scripts/build-public-app.mjs', 'scripts/browser-globals-plugin.mjs',
    'scripts/build-mvp09-artifacts.mjs'];
  for (const folder of ['src/core', 'src/ui', 'src/public-app', 'schemas', 'spfx/config', 'spfx/src/core',
    'spfx/src/webparts', 'spfx/scripts', 'spfx/test', 'spfx/test-build', 'public-app']) productPaths.push(...await tree(folder));
  const inputs = await Promise.all([...new Set(productPaths)].filter(path => !path.startsWith('src/ui/preview/')).sort().map(bind));
  const fixturePaths = [];
  for (const folder of ['data', 'tests', 'outputs/ap22c3-2026-10-08/bundle', 'outputs/ap23d2-candidate-2026-10-15/bundle', 'outputs/ap23e3-candidate-2026-10-18/bundle'])
    fixturePaths.push(...await tree(folder));
  const fixtures = await Promise.all([...new Set(fixturePaths)].sort().map(bind));
  const oldPackage = await bind('spfx/sharepoint/solution/fristenrechner-schweiz.sppkg');
  const stage = await mkdtemp(resolve(root, '.work/mvp09-product-build-'));
  const target = resolve(stage, 'spfx');
  await mkdir(target);
  const excluded = new Set(['node_modules', 'lib', 'lib-commonjs', 'dist', 'temp', 'release', 'sharepoint', '.heft']);
  for (const item of await readdir(resolve(root, 'spfx'), { withFileTypes: true })) if (!excluded.has(item.name)) {
    assert.ok(!item.isSymbolicLink());
    await cp(resolve(root, 'spfx', item.name), resolve(target, item.name), { recursive: true, errorOnExist: true, force: false });
  }
  for (const folder of ['src', 'schemas', 'data', 'tests', 'public-app', 'outputs/ap22c3-2026-10-08/bundle',
    'outputs/ap23d2-candidate-2026-10-15/bundle', 'outputs/ap23e3-candidate-2026-10-18/bundle']) await cp(resolve(root, folder), resolve(stage, folder), { recursive: true, errorOnExist: true, force: false });
  await mkdir(resolve(stage, 'scripts'));
  for (const path of ['scripts/build-public-app.mjs', 'scripts/browser-globals-plugin.mjs']) await cp(resolve(root, path), resolve(stage, path));
  await symlink(resolve(root, 'node_modules'), resolve(stage, 'node_modules'), 'dir');
  await symlink(resolve(root, 'spfx/node_modules'), resolve(target, 'node_modules'), 'dir');
  const env = { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}`, npm_config_update_notifier: 'false' };
  const sourceTests = (await readdir(resolve(target, 'test'))).filter(name => name.endsWith('.test.ts')).sort().map(name => `test/${name}`);
  const builtTests = (await readdir(resolve(target, 'test-build'))).filter(name => name.endsWith('.test.cjs')).sort().map(name => `test-build/${name}`);
  const npm = resolve(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js');
  const steps = [
    ['sync', process.execPath, [npm, 'run', 'sync'], target],
    ['source-tests', process.execPath, ['--import', 'tsx', '--test', '--test-concurrency=2', '--test-timeout=60000', ...sourceTests], target],
    ['compile', resolve(target, 'node_modules/.bin/heft'), ['test', '--clean', '--production'], target],
    ['css-audit', process.execPath, ['scripts/audit-product-css.mjs'], target],
    ['package', resolve(target, 'node_modules/.bin/heft'), ['package-solution', '--production'], target],
    ['built-tests', process.execPath, ['--test', '--test-concurrency=1', '--test-timeout=60000', ...builtTests], target],
    ['web-build', process.execPath, ['scripts/build-public-app.mjs'], stage]
  ];
  const report = { kind: 'mvp09-local-product-build', startedAt: new Date().toISOString(), status: 'running',
    authority: release.authority, releaseId, manifest: release.manifestBinding, localDataPin: release.pin,
    embedded, applicationVersion: '0.9.0', packageVersion: '0.9.0.0', stage: relative(root, stage),
    inputs, fixtures, runtimeFiles: release.files, oldPackage, steps: [], installationAuthorized: false, publicationAuthorized: false,
    actualM365TestsPerformed: false, remotePinPublicationVerified: false };
  try {
    for (const [id, command, args, cwd] of steps) {
      const result = spawnSync(command, args, { cwd, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      const logPath = `${relative(root, stage)}/${id}.log`;
      await writeExclusive(root, logPath, Buffer.from(`${result.stdout ?? ''}${result.stderr ?? ''}${result.error ?? ''}`));
      const archivedLog = `${prefix}/build-evidence/logs/${relative(root, stage).split('/').at(-1)}-${id}.log`;
      await writeExclusive(root, archivedLog, await read(logPath));
      report.steps.push({ id, exitCode: result.status, signal: result.signal, log: await bind(archivedLog), scratchLog: logPath });
      console.log(JSON.stringify(report.steps.at(-1)));
      assert.equal(result.status, 0, `Build failed: ${id}. See ${logPath}`);
    }
    for (const item of inputs) assert.deepEqual(await bind(item.path), item);
    for (const item of fixtures) assert.deepEqual(await bind(item.path), item);
    assert.deepEqual(await bind(oldPackage.path), oldPackage);
    assert.deepEqual(await verifyPinnedData(), release);
    const packagePath = `${prefix}/fristenrechner-schweiz-0.9.0.0.sppkg`;
    await writeExclusive(root, packagePath, await read(`${relative(root, stage)}/spfx/sharepoint/solution/fristenrechner-schweiz.sppkg`));
    report.package = await bind(packagePath);
    report.webFiles = [];
    const webPrefix = `${relative(root, stage)}/.work/public-app`;
    for (const path of await tree(webPrefix)) {
      const output = `${prefix}/web-build/${path.slice(webPrefix.length + 1)}`;
      await writeExclusive(root, output, await read(path));
      report.webFiles.push(await bind(output));
    }
    report.archivedInputs = [];
    for (const item of inputs) {
      const archivedAt = `${prefix}/build-evidence/inputs/${item.path}`;
      await writeExclusive(root, archivedAt, await read(item.path));
      report.archivedInputs.push({ ...item, archivedAt });
    }
    report.archivedFixtures = [];
    for (const item of fixtures) {
      const archivedAt = `${prefix}/build-evidence/fixtures/${item.path}`;
      await writeExclusive(root, archivedAt, await read(item.path));
      report.archivedFixtures.push({ ...item, archivedAt });
    }
    report.status = 'passed';
  } catch (error) { report.status = 'failed'; report.error = String(error.stack ?? error); }
  report.finishedAt = new Date().toISOString();
  await writeExclusive(root, `${relative(root, stage)}/verification.json`, encode(report));
  await writeExclusive(root, `${prefix}/build-evidence/attempts/${relative(root, stage).split('/').at(-1)}.json`, encode(report));
  if (report.status === 'passed') await writeExclusive(root, reportPath, encode(report));
  console.log(JSON.stringify({ status: report.status, stage: relative(root, stage), reportPath, package: report.package, error: report.error }));
  assert.equal(report.status, 'passed', report.error);
  return report;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--embed-only'));
  if (process.argv[2] === '--embed-only') console.log(JSON.stringify((await generateEmbeddedRelease()).embedded));
  else await buildLocalArtifacts();
}
