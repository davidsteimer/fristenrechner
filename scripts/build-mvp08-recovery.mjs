// SPDX-License-Identifier: AGPL-3.0-only
// R08-B isolated recovery build. The functional baseline is MVP07, not MVP06.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { lstat, mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireR08BApproval } from './record-r08b-execution-approval.mjs';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const PREFIX = 'outputs/release-mvp08-2026-10-15';
export const OUTPUT = `${PREFIX}/recovery-0.8.0.1`;
export const VERSION = '0.8.0.1';
export const PACKAGE_NAME = `fristenrechner-schweiz-recovery-${VERSION}.sppkg`;
export const BASE = 'outputs/release-mvp07-spfx-0.7.0.2-2026-10-09';
export const COMMIT = '37e263156658498df350dd12989cd246f99cc219';
export const REPORT_SHA = 'c42c0c75d2352004e640dd0de3d18a37e4147290d4cd2c12f1e9a705d0376702';
export const OLD_PACKAGE_SHA = '8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db';
const PACKAGE = `${BASE}/artifacts/fristenrechner-schweiz-0.7.0.2.sppkg`;
const CONFIG = 'spfx/config/package-solution.json';
const VERSION_TEST = 'spfx/test/product-integration.test.ts';
const NODE = '.work/toolchains/node-v22.23.2-darwin-arm64/bin/node';
const SELF = 'scripts/build-mvp08-recovery.mjs';
const TEST = 'tests/governance/mvp08-recovery.test.mjs';
const FIXTURES = 'spfx/recovery-mvp08';
const FIRST_ATTEMPT = '.work/mvp08-recovery-XniRNu';
const SOLUTION = '13090feb-a6bf-40fa-9d3c-ec8d90516a60';
const FEATURE = '3edf1509-41e9-4a2f-8005-df510eec43b6';
const WEBPART = '596c7f1c-4d3e-4da8-a7be-27a96024f37c';
const BASE_URL = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/331ef3e19d43a6b51d91a502acd6b5443071599f/data/releases/2026-10-08-mvp-07-approved.1';
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const read = path => readFile(resolve(ROOT, path));
const git = args => execFileSync('git', args, { cwd: ROOT, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
const safe = path => assert.ok(path && !path.startsWith('/') && !path.split('/').some(p => !p || p === '..' || p === '.'), path);
async function tree(directory) {
  const paths = [];
  for (const item of await readdir(resolve(ROOT, directory), { withFileTypes: true })) {
    if (item.name === '.DS_Store') continue;
    assert.ok(!item.isSymbolicLink(), `Unexpected archive symlink: ${directory}/${item.name}`);
    const path = `${directory}/${item.name}`;
    if (item.isDirectory()) paths.push(...await tree(path));
    else if (item.isFile()) paths.push(path);
  }
  return paths.sort();
}
async function inventory(paths) {
  return Promise.all([...new Set(paths)].sort().map(async path => {
    const b = await read(path); return { path, byteLength: b.length, sha256: hash(b) };
  }));
}
async function absent(path) {
  try { await lstat(resolve(ROOT, path)); } catch (e) { if (e.code === 'ENOENT') return; throw e; }
  assert.fail(`Existing output must not be overwritten: ${path}`);
}
async function writeNew(path, bytes) {
  safe(path); await mkdir(dirname(resolve(ROOT, path)), { recursive: true });
  await writeFile(resolve(ROOT, path), bytes, { flag: 'wx' });
  assert.equal(hash(await read(path)), hash(bytes), path);
}
export function deriveInput(path, bytes) {
  if (path === CONFIG) {
    const before = JSON.parse(bytes), text = bytes.toString();
    assert.equal(before.solution.id, SOLUTION); assert.equal(before.solution.version, '0.7.0.2');
    assert.equal(before.solution.features.length, 1); assert.equal(before.solution.features[0].id, FEATURE);
    assert.equal(before.solution.features[0].version, '0.7.0.2');
    assert.equal(text.split('"version": "0.7.0.2"').length, 3);
    const result = Buffer.from(text.replaceAll('"version": "0.7.0.2"', `"version": "${VERSION}"`));
    const normalized = JSON.parse(result);
    normalized.solution.version = '0.7.0.2'; normalized.solution.features[0].version = '0.7.0.2';
    assert.deepEqual(normalized, before); return result;
  }
  if (path === VERSION_TEST) {
    let result = bytes.toString();
    for (const expression of ['packageSolution.solution.version', 'packageSolution.solution.features[0].version']) {
      const from = `assert.equal(${expression}, '0.7.0.2');`;
      assert.equal(result.split(from).length, 2);
      result = result.replace(from, `assert.equal(${expression}, '${VERSION}');`);
    }
    return Buffer.from(result);
  }
  return bytes;
}
async function baseline() {
  const bytes = await read(`${BASE}/artifact-verification.json`); assert.equal(hash(bytes), REPORT_SHA);
  const report = JSON.parse(bytes); assert.equal(report.passed, true); assert.equal(report.archivedFiles.length, 230);
  assert.equal(hash(await read(PACKAGE)), OLD_PACKAGE_SHA);
  for (const row of report.archivedFiles) {
    safe(row.path); const b = await read(row.path); assert.equal(b.length, row.byteLength, row.path); assert.equal(hash(b), row.sha256, row.path);
  }
  return report;
}
export function normalizeGeneratedXml(name, text) {
  if (name === `feature_${FEATURE}.xml.config.xml` || name === 'ClientSideAssets.xml.config.xml') {
    assert.match(text, /^<\?xml version="1\.0" encoding="utf-8"\?><AppPartConfig xmlns="http:\/\/schemas\.microsoft\.com\/sharepoint\/2012\/app\/partconfiguration"><Id>[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}<\/Id><\/AppPartConfig>$/);
    return text.replace(/<Id>[a-f0-9-]{36}<\/Id>/, '<Id>GENERATED-PART-CONFIG</Id>');
  }
  if (name === 'ClientSideAssets.xml') {
    assert.match(text, /^<\?xml version="1\.0" encoding="utf-8"\?><Feature xmlns="http:\/\/schemas\.microsoft\.com\/sharepoint\/" Title="Client Side Assets" Description="A feature that help deploy client side component assets to SharePoint Online\." Id="[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}" Version="1\.0\.0\.0" Scope="Web" Hidden="FALSE"><\/Feature>$/);
    return text.replace(/ Id="[a-f0-9-]{36}"/, ' Id="GENERATED-ASSET-FEATURE"');
  }
  return text;
}
export function auditPackage(current, old) {
  assert.equal(old.provenance.packageSha256, OLD_PACKAGE_SHA);
  const newName = current.bundlePath.split('/').at(-1), oldName = old.bundlePath.split('/').at(-1);
  let normalized = current.bundle.toString().replaceAll(newName, oldName);
  const mappings = [];
  for (const field of ['host', 'startup', 'badge', 'runtimeMessage', 'runtimeStatus']) {
    const pattern = new RegExp(`\\b${field}_[a-f0-9]{8}\\b`, 'g');
    const a = [...normalized.matchAll(pattern)].map(m => m[0]), b = [...old.bundle.toString().matchAll(pattern)].map(m => m[0]);
    assert.ok(a.length > 0 && a.length === b.length, `SCSS references: ${field}`);
    assert.equal(new Set(a).size, 1); assert.equal(new Set(b).size, 1);
    normalized = normalized.replace(pattern, b[0]); mappings.push({ field, before: b[0], after: a[0], count: a.length });
  }
  assert.equal(normalized, old.bundle.toString(), 'Recovery functional bundle differs beyond bound filenames and scoped host CSS');
  const normalizeName = n => n.replace(newName, oldName);
  assert.deepEqual([...current.files.keys()].map(normalizeName).sort(), [...old.files.keys()].sort());
  for (const [name, bytes] of current.files) {
    assert.ok(!name.startsWith('/') && !name.split('/').includes('..'));
    const original = old.files.get(normalizeName(name)); assert.ok(original);
    if (name === current.bundlePath) continue;
    if (!/\.(?:xml|rels)$/.test(name)) { assert.ok(bytes.equals(original), name); continue; }
    let actual = bytes.toString().replaceAll(newName, oldName);
    assert.doesNotMatch(actual, /AppPermissionRequest|WebApiPermission|webApiPermissionRequests|TargetMode="External"/i);
    if (name === 'AppManifest.xml' || name === `feature_${FEATURE}.xml`) {
      assert.equal(actual.split(`Version="${VERSION}"`).length, 2);
      actual = actual.replace(`Version="${VERSION}"`, 'Version="0.7.0.2"');
    }
    assert.equal(normalizeGeneratedXml(name, actual), normalizeGeneratedXml(name, original.toString()), name);
  }
  const xml = current.files.get(`${FEATURE}/WebPart_${WEBPART}.xml`).toString();
  const entities = { quot: '"', amp: '&', lt: '<', gt: '>', apos: "'" };
  const manifest = JSON.parse(xml.match(/ComponentManifest="([^"]+)"/)[1].replace(/&(quot|amp|lt|gt|apos);/g, (_, key) => entities[key]));
  assert.equal(manifest.id, WEBPART); assert.equal(manifest.version, '0.7.0');
  assert.deepEqual(manifest.supportedHosts, ['SharePointWebPart', 'TeamsTab']);
  assert.equal(manifest.preconfiguredEntries[0].properties.githubBaseUrl, BASE_URL);
  return { packageVersion: VERSION, componentVersion: '0.7.0', functionalBaseline: 'MVP 0.7',
    solutionId: SOLUTION, featureId: FEATURE, webPartId: WEBPART, additionalApiPermissions: [],
    defaultGithubBaseUrl: BASE_URL, normalizedBundleByteIdentical: true, scopedCssMappings: mappings,
    normalization: ['solution and feature versions only', 'bundle/own-license filenames', 'five host SCSS class suffixes with equal occurrence counts', 'two generated AppPartConfig UUIDs', 'generated ClientSideAssets feature UUID'],
    bundlePath: current.bundlePath, bundleSha256: hash(current.bundle) };
}
export function passing(text) {
  const count = Number(text.match(/^# tests (\d+)$/m)?.[1]); assert.ok(count > 0);
  for (const [key, value] of [['pass', count], ['fail', 0], ['cancelled', 0], ['skipped', 0], ['todo', 0]]) assert.match(text, new RegExp(`^# ${key} ${value}$`, 'm'));
  return count;
}
async function stageInputs(old, stage) {
  const items = new Map(), origins = new Map();
  const paths = git(['ls-tree', '-r', '--name-only', COMMIT, 'package.json', 'package-lock.json', 'tsconfig.json', 'spfx', 'src', 'schemas', 'data', 'tests']).toString().trim().split('\n')
    .filter(p => !p.startsWith('spfx/sharepoint/') && !p.startsWith('spfx/recovery-'));
  for (const path of paths) { safe(path); items.set(path, git(['show', `${COMMIT}:${path}`])); origins.set(path, { kind: 'immutableGit', commit: COMMIT }); }
  for (const row of old.fixtureInputs) {
    safe(row.path); let value = items.get(row.path);
    if (!value || hash(value) !== row.sha256) {
      value = undefined;
      for (const path of [`${old.stage}/${row.path}`, row.path]) {
        try { const b = await read(path); if (b.length === row.byteLength && hash(b) === row.sha256) { value = b; break; } } catch (e) { if (e.code !== 'ENOENT') throw e; }
      }
    }
    assert.ok(value && hash(value) === row.sha256 && value.length === row.byteLength, `Missing exact historical fixture: ${row.path}`);
    items.set(row.path, value); origins.set(row.path, { kind: 'sealedHistoricalFixture', reportSha256: REPORT_SHA });
  }
  const prefix = `${BASE}/build-evidence/inputs/`;
  for (const row of old.archivedFiles.filter(r => r.path.startsWith(prefix))) {
    const path = row.path.slice(prefix.length); items.set(path, await read(row.path)); origins.set(path, { kind: 'actualMvp07BuildInput', archivePath: row.path, sha256: row.sha256 });
  }
  const inputs = [];
  for (const [path, original] of [...items].sort(([a], [b]) => a.localeCompare(b))) {
    const bytes = deriveInput(path, original); await writeNew(`${stage}/${path}`, bytes);
    inputs.push({ path, origin: origins.get(path), beforeSha256: hash(original), afterSha256: hash(bytes), byteLength: bytes.length, changed: !bytes.equals(original) });
  }
  assert.deepEqual(inputs.filter(r => r.changed).map(r => r.path).sort(), [CONFIG, VERSION_TEST].sort());
  await symlink(resolve(ROOT, 'node_modules'), resolve(ROOT, stage, 'node_modules'), 'dir');
  await symlink(resolve(ROOT, 'spfx/node_modules'), resolve(ROOT, stage, 'spfx/node_modules'), 'dir');
  return inputs;
}
export async function verifyArchive() {
  const report = JSON.parse(await read(`${OUTPUT}/artifact-verification.json`));
  assert.equal(report.kind, 'mvp08LocalRecoveryBuild'); assert.equal(report.passed, true);
  assert.equal(report.packageVersion, VERSION); assert.equal(report.basis.reportSha256, REPORT_SHA);
  for (const key of ['installationAuthorized', 'deploymentPerformed', 'publicationAuthorized', 'liveHostVerified', 'browserResetAuthorized']) assert.equal(report[key], false);
  for (const row of report.archivedFiles) { const b = await read(row.path); assert.equal(hash(b), row.sha256, row.path); assert.equal(b.length, row.byteLength, row.path); }
  assert.deepEqual((await tree(OUTPUT)).filter(p => !p.endsWith('/artifact-verification.json')).sort(), report.archivedFiles.map(r => r.path).sort());
  const require = createRequire(resolve(ROOT, 'spfx/package.json'));
  const { readPackage } = require(resolve(ROOT, `${OUTPUT}/implementation/spfx/test-build/package-harness.cjs`));
  const actual = readPackage(resolve(ROOT, `${OUTPUT}/${PACKAGE_NAME}`)), old = readPackage(resolve(ROOT, `${OUTPUT}/basis/fristenrechner-schweiz-0.7.0.2.sppkg`));
  assert.equal(actual.provenance.packageSha256, report.packageSha256); assert.deepEqual(auditPackage(actual, old), report.packageAudit);
  assert.equal(hash(await read(`${PREFIX}/${PACKAGE_NAME}`)), report.packageSha256);
  return { passed: true, packageVersion: VERSION, packageSha256: report.packageSha256, archivedFiles: report.archivedFiles.length,
    installationAuthorized: false, liveHostVerified: false, roundTripMvp08Pending: report.roundTripMvp08Pending };
}
export async function main() {
  assert.equal(resolve(process.execPath), resolve(ROOT, NODE)); assert.equal(process.version, 'v22.23.2');
  const authority = await requireR08BApproval(); assert.equal(authority.record.permissions.localRecoveryBuildAuthorized, true);
  assert.equal(authority.record.versions.recoveryPackage, VERSION);
  await absent(OUTPUT); await absent(`${PREFIX}/${PACKAGE_NAME}`);
  const old = await baseline();
  const protectedFiles = await inventory([`${BASE}/artifact-verification.json`, ...old.archivedFiles.map(r => r.path)]);
  const implementationPaths = [SELF, TEST, 'scripts/record-r08b-execution-approval.mjs', ...await tree(FIXTURES),
    'spfx/recovery-mvp07/package-harness.cjs', 'spfx/test-build/package-harness.cjs'];
  const implementation = await inventory(implementationPaths);
  const stage = relative(ROOT, await mkdtemp(resolve(ROOT, '.work/mvp08-recovery-')));
  const inputs = await stageInputs(old, stage), target = resolve(ROOT, stage, 'spfx');
  const packagePath = resolve(target, 'sharepoint/solution/fristenrechner-schweiz.sppkg');
  const npmCli = resolve(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js');
  const report = { kind: 'mvp08LocalRecoveryBuild', startedAt: new Date().toISOString(), packageVersion: VERSION, applicationVersion: '0.7.0',
    functionalBaseline: 'MVP 0.7', stage, authority: { path: authority.path, sha256: authority.sha256 },
    basis: { reportSha256: REPORT_SHA, packageSha256: OLD_PACKAGE_SHA, gitCommit: COMMIT, productInputs: 181, archivedFiles: 230 },
    installationAuthorized: false, deploymentPerformed: false, publicationAuthorized: false, liveHostVerified: false, browserResetAuthorized: false,
    roundTripMvp08Pending: true, inputDerivation: inputs, implementation, protectedFiles, steps: [],
    limitations: ['Actual AMD package tests use synthetic browser and transport, not real SharePoint, Teams, device or guest checks.',
      'The completed MVP08 to Recovery to MVP08 test must additionally bind the definitive MVP08 package. This report does not assert that future package test.'] };
  const failedBytes = await read(`${FIRST_ATTEMPT}/verification.json`), failed = JSON.parse(failedBytes);
  assert.equal(failed.passed, false); assert.equal(failed.steps.at(-1).id, 'recovery-tests');
  assert.equal(failed.steps.at(-1).exitCode, 1);
  const failedLog = await read(failed.steps.at(-1).log);
  assert.equal(hash(failedLog), failed.steps.at(-1).sha256);
  assert.match(failedLog.toString(), /test timed out after 60000ms/);
  report.priorFailedAttempt = { path: `${FIRST_ATTEMPT}/verification.json`, sha256: hash(failedBytes),
    reason: 'Nine recovery checks exceeded the per-file 60-second bound. The same checks are now grouped into four independently bounded test files. No timeout increase and no product change.',
    sourceTestsPassed: 186, builtTestsPassed: 83, recoveryChecksPassedBeforeTimeout: 8, changedProductRules: false };
  const env = { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}`, npm_config_update_notifier: 'false', npm_config_audit: 'false', npm_config_fund: 'false',
    FRISTENRECHNER_RECOVERY_STAGE: resolve(ROOT, stage), FRISTENRECHNER_RECOVERY_SPPKG: packagePath };
  for (const key of ['FRISTENRECHNER_TEST_SPPKG', 'FRISTENRECHNER_DATA_CANDIDATE']) delete env[key];
  const commands = [
    { id: 'sync', cwd: target, command: process.execPath, args: [npmCli, 'run', 'sync'] },
    { id: 'source-tests', cwd: target, command: process.execPath, args: ['--import', 'tsx', '--test', '--test-concurrency=2', '--test-timeout=60000', ...old.sourceTestFiles], tests: true },
    { id: 'compile', cwd: target, command: resolve(target, 'node_modules/.bin/heft'), args: ['test', '--clean', '--production'] },
    { id: 'css-audit', cwd: target, command: process.execPath, args: ['scripts/audit-product-css.mjs'] },
    { id: 'package', cwd: target, command: resolve(target, 'node_modules/.bin/heft'), args: ['package-solution', '--production'] },
    { id: 'built-tests', cwd: target, command: process.execPath, args: ['--test', '--test-concurrency=2', '--test-timeout=60000', ...old.builtTestFiles], tests: true },
    { id: 'recovery-tests', cwd: resolve(ROOT, 'spfx'), command: process.execPath, args: ['--test', '--test-concurrency=1', '--test-timeout=60000',
      'recovery-mvp08/recovery-package.test.cjs', 'recovery-mvp08/recovery-defaults.test.cjs',
      'recovery-mvp08/recovery-cache.test.cjs', 'recovery-mvp08/recovery-equivalence.test.cjs'], tests: true }
  ];
  let passed = false;
  try {
    for (const step of commands) {
      const result = spawnSync(step.command, step.args, { cwd: step.cwd, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      const bytes = Buffer.from(`${result.stdout ?? ''}${result.stderr ?? ''}${result.error ?? ''}`), log = `${stage}/${step.id}.log`;
      await writeNew(log, bytes); const record = { id: step.id, command: step.command, args: step.args, cwd: relative(ROOT, step.cwd), exitCode: result.status, log, sha256: hash(bytes) };
      report.steps.push(record); console.log(JSON.stringify(record)); assert.equal(result.status, 0, `Build step failed: ${step.id}`);
      if (step.tests) record.tests = passing(result.stdout);
    }
    const require = createRequire(resolve(ROOT, 'spfx/package.json')), { readPackage } = require(resolve(ROOT, 'spfx/test-build/package-harness.cjs'));
    report.packageAudit = auditPackage(readPackage(packagePath), readPackage(resolve(ROOT, PACKAGE)));
    const bytes = await readFile(packagePath); report.packageSha256 = hash(bytes); report.packageByteLength = bytes.length;
    for (const row of inputs) assert.equal(hash(await read(`${stage}/${row.path}`)), row.afterSha256, `Build changed source input: ${row.path}`);
    assert.deepEqual(await inventory(protectedFiles.map(r => r.path)), protectedFiles);
    assert.deepEqual(await inventory(implementationPaths), implementation);
    passed = true;
  } catch (e) { report.error = String(e.stack ?? e); }
  report.passed = passed; report.finishedAt = new Date().toISOString();
  await writeNew(`${stage}/verification.json`, Buffer.from(json(report)));
  if (!passed) { console.log(JSON.stringify({ passed, stage, error: report.error })); process.exitCode = 1; return; }
  await absent(OUTPUT); report.archivedFiles = [];
  async function archive(path, bytes) { const destination = `${OUTPUT}/${path}`; await writeNew(destination, bytes); report.archivedFiles.push({ path: destination, byteLength: bytes.length, sha256: hash(bytes) }); }
  await archive(PACKAGE_NAME, await readFile(packagePath));
  await archive('basis/fristenrechner-schweiz-0.7.0.2.sppkg', await read(PACKAGE));
  await archive('basis/artifact-verification-mvp07.json', await read(`${BASE}/artifact-verification.json`));
  await archive('authority/r08b-execution-approval.json', await read(authority.path));
  await archive('attempts/first-failed/verification.json', failedBytes);
  for (const step of failed.steps) {
    const bytes = await read(step.log); assert.equal(hash(bytes), step.sha256);
    await archive(`attempts/first-failed/${step.id}.log`, bytes);
  }
  for (const row of inputs) await archive(`build-inputs/${row.path}`, await read(`${stage}/${row.path}`));
  for (const row of implementation) await archive(`implementation/${row.path}`, await read(row.path));
  for (const step of report.steps) {
    const bytes = await read(step.log); assert.equal(hash(bytes), step.sha256);
    await archive(`logs/${step.id}.log`, bytes); step.archivedLog = `${OUTPUT}/logs/${step.id}.log`;
  }
  await writeNew(`${PREFIX}/${PACKAGE_NAME}`, await readFile(packagePath));
  await writeNew(`${OUTPUT}/artifact-verification.json`, Buffer.from(json(report)));
  console.log(JSON.stringify(await verifyArchive()));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 3);
  if (process.argv[2] === '--build') await main();
  else if (process.argv[2] === '--verify') console.log(JSON.stringify(await verifyArchive()));
  else assert.fail('Use --build or --verify');
}
