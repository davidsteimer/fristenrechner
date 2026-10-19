// SPDX-License-Identifier: AGPL-3.0-only
// R09-B local recovery. Archived ACTUAL MVP08 build inputs have priority over Git.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { lstat, mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireR09BApproval } from './record-r09b-execution-approval.mjs';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const PREFIX = 'outputs/release-mvp09-2026-10-18';
export const OUTPUT = `${PREFIX}/recovery-0.9.0.1`;
export const BASE = 'outputs/release-mvp08-2026-10-15';
export const VERSION = '0.9.0.1';
export const PACKAGE_NAME = `fristenrechner-schweiz-recovery-${VERSION}.sppkg`;
export const COMMIT = 'a3b47ab3c9c6e36831ce60b4164b45ae4b01eb60';
export const REPORT_SHA = '1638becba091b1fccc3924ad477476d6bfb8fb0fd5245d115923c6e4ebe98bd6';
export const OLD_PACKAGE_SHA = 'd3d06adcd78176db66f8227d884fd66ca2fbcee0bffab66755789dd0cc29dc1a';
const OLD_PACKAGE = `${BASE}/fristenrechner-schweiz-0.8.0.0.sppkg`;
const CONFIG = 'spfx/config/package-solution.json';
const VERSION_TEST = 'spfx/test/product-integration.test.ts';
const SELF = 'scripts/build-mvp09-recovery.mjs';
const TEST = 'tests/governance/mvp09-recovery.test.mjs';
const NODE = '.work/toolchains/node-v22.23.2-darwin-arm64/bin/node';
const SOLUTION = '13090feb-a6bf-40fa-9d3c-ec8d90516a60';
const FEATURE = '3edf1509-41e9-4a2f-8005-df510eec43b6';
const WEBPART = '596c7f1c-4d3e-4da8-a7be-27a96024f37c';
const BASE_URL = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/10a99419eaabb3e96d2acccf0c7a93e2fe6472cb/data/releases/2026-10-15-mvp-08-approved.1';
const HELPERS = ['tsconfig.json', 'spfx/eslint.config.js', 'spfx/src/declarations.d.ts',
  `spfx/teams/${WEBPART}_color.png`, `spfx/teams/${WEBPART}_outline.png`];
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
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
    else { assert.ok(item.isFile(), path); paths.push(path); }
  }
  return paths.sort();
}
async function inventory(paths) {
  return Promise.all([...new Set(paths)].sort().map(async path => {
    const info = await lstat(resolve(ROOT, path)); assert.ok(info.isFile() && !info.isSymbolicLink(), path);
    const bytes = await read(path); return { path, byteLength: bytes.length, sha256: hash(bytes) };
  }));
}
async function absent(path) {
  try { await lstat(resolve(ROOT, path)); } catch (e) { if (e.code === 'ENOENT') return; throw e; }
  assert.fail(`Existing output must not be overwritten: ${path}`);
}
async function writeNew(path, bytes) {
  safe(path); await mkdir(dirname(resolve(ROOT, path)), { recursive: true });
  await writeFile(resolve(ROOT, path), bytes, { flag: 'wx' }); assert.equal(hash(await read(path)), hash(bytes), path);
}
export function deriveInput(path, bytes) {
  if (path === CONFIG) {
    const before = JSON.parse(bytes), text = bytes.toString();
    assert.equal(before.solution.id, SOLUTION); assert.equal(before.solution.version, '0.8.0.0');
    assert.equal(before.solution.features.length, 1); assert.equal(before.solution.features[0].id, FEATURE);
    assert.equal(before.solution.features[0].version, '0.8.0.0');
    assert.equal(text.split('"version": "0.8.0.0"').length, 3);
    const bytesAfter = Buffer.from(text.replaceAll('"version": "0.8.0.0"', `"version": "${VERSION}"`));
    const normalized = JSON.parse(bytesAfter);
    normalized.solution.version = '0.8.0.0'; normalized.solution.features[0].version = '0.8.0.0';
    assert.deepEqual(normalized, before); return bytesAfter;
  }
  if (path === VERSION_TEST) {
    let after = bytes.toString();
    for (const expression of ['packageSolution.solution.version', 'packageSolution.solution.features[0].version']) {
      const before = `assert.equal(${expression}, '0.8.0.0');`; assert.equal(after.split(before).length, 2);
      after = after.replace(before, `assert.equal(${expression}, '${VERSION}');`);
    }
    return Buffer.from(after);
  }
  return bytes;
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
  assert.equal(normalized, old.bundle.toString(), 'Functional bundle differs beyond bound filenames and five scoped host CSS suffixes');
  const normalizeName = name => name.replace(newName, oldName);
  assert.deepEqual([...current.files.keys()].map(normalizeName).sort(), [...old.files.keys()].sort());
  for (const [name, bytes] of current.files) {
    safe(name.replace(/\/$/, '')); const original = old.files.get(normalizeName(name)); assert.ok(original);
    if (name === current.bundlePath) continue;
    if (!/\.(?:xml|rels)$/.test(name)) { assert.ok(bytes.equals(original), name); continue; }
    let actual = bytes.toString().replaceAll(newName, oldName);
    assert.doesNotMatch(actual, /AppPermissionRequest|WebApiPermission|webApiPermissionRequests|TargetMode="External"/i);
    if (name === 'AppManifest.xml' || name === `feature_${FEATURE}.xml`) {
      assert.equal(actual.split(`Version="${VERSION}"`).length, 2); actual = actual.replace(`Version="${VERSION}"`, 'Version="0.8.0.0"');
    }
    assert.equal(normalizeGeneratedXml(name, actual), normalizeGeneratedXml(name, original.toString()), name);
  }
  const xml = current.files.get(`${FEATURE}/WebPart_${WEBPART}.xml`).toString();
  const entities = { quot: '"', amp: '&', lt: '<', gt: '>', apos: "'" };
  const manifest = JSON.parse(xml.match(/ComponentManifest="([^"]+)"/)[1].replace(/&(quot|amp|lt|gt|apos);/g, (_, key) => entities[key]));
  assert.equal(manifest.id, WEBPART); assert.equal(manifest.version, '0.8.0');
  assert.deepEqual(manifest.supportedHosts, ['SharePointWebPart', 'TeamsTab']);
  assert.equal(manifest.preconfiguredEntries[0].properties.githubBaseUrl, BASE_URL);
  return { packageVersion: VERSION, componentVersion: '0.8.0', functionalBaseline: 'MVP 0.8', solutionId: SOLUTION,
    featureId: FEATURE, webPartId: WEBPART, additionalApiPermissions: [], defaultGithubBaseUrl: BASE_URL,
    normalizedBundleByteIdentical: true, scopedCssMappings: mappings,
    normalization: ['solution and feature versions only', 'bundle/own-license filenames', 'five host SCSS suffixes with equal occurrences',
      'two generated AppPartConfig UUIDs', 'generated ClientSideAssets feature UUID'],
    bundlePath: current.bundlePath, bundleSha256: hash(current.bundle) };
}
export function passing(text) {
  const count = Number(text.match(/^# tests (\d+)$/m)?.[1]); assert.ok(count > 0);
  for (const [key, value] of [['pass', count], ['fail', 0], ['cancelled', 0], ['skipped', 0], ['todo', 0]]) assert.match(text, new RegExp(`^# ${key} ${value}$`, 'm'));
  return count;
}
async function baseline() {
  const raw = await read(`${BASE}/product-build.json`); assert.equal(hash(raw), REPORT_SHA);
  const report = JSON.parse(raw); assert.equal(report.status, 'passed');
  assert.equal(report.archivedInputs.length, 210); assert.equal(report.archivedFixtures.length, 599);
  assert.equal(hash(await read(OLD_PACKAGE)), OLD_PACKAGE_SHA);
  for (const [rows, original] of [[report.archivedInputs, report.inputs], [report.archivedFixtures, report.fixtures]]) {
    assert.deepEqual(rows.map(({ archivedAt, ...rest }) => rest), original);
    for (const row of rows) {
      safe(row.path); safe(row.archivedAt);
      assert.ok((await lstat(resolve(ROOT, row.archivedAt))).isFile());
      const bytes = await read(row.archivedAt); assert.equal(bytes.length, row.byteLength, row.path); assert.equal(hash(bytes), row.sha256, row.path);
    }
  }
  return report;
}
async function stageInputs(old, stage) {
  const items = new Map(), origins = new Map();
  for (const path of HELPERS) { safe(path); items.set(path, git(['show', `${COMMIT}:${path}`])); origins.set(path, { kind: 'immutableGitHelper', commit: COMMIT }); }
  for (const [kind, rows] of [['actualMvp08Fixture', old.archivedFixtures], ['actualMvp08BuildInput', old.archivedInputs]]) {
    for (const row of rows) {
      const bytes = await read(row.archivedAt);
      if (items.has(row.path)) assert.equal(hash(items.get(row.path)), row.sha256, 'Conflicting archived inputs');
      items.set(row.path, bytes); origins.set(row.path, { kind, archivedAt: row.archivedAt, sha256: row.sha256 });
    }
  }
  const inputs = [];
  for (const [path, original] of [...items].sort(([a], [b]) => a.localeCompare(b, 'en'))) {
    const bytes = deriveInput(path, original); await writeNew(`${stage}/${path}`, bytes);
    inputs.push({ path, origin: origins.get(path), beforeSha256: hash(original), afterSha256: hash(bytes), byteLength: bytes.length, changed: !bytes.equals(original) });
  }
  assert.deepEqual(inputs.filter(row => row.changed).map(row => row.path).sort(), [CONFIG, VERSION_TEST].sort());
  await symlink(resolve(ROOT, 'node_modules'), resolve(ROOT, stage, 'node_modules'), 'dir');
  await symlink(resolve(ROOT, 'spfx/node_modules'), resolve(ROOT, stage, 'spfx/node_modules'), 'dir');
  return inputs;
}
export async function verifyArchive() {
  const report = JSON.parse(await read(`${OUTPUT}/artifact-verification.json`));
  assert.equal(report.kind, 'mvp09LocalRecoveryBuild'); assert.equal(report.passed, true);
  assert.equal(report.packageVersion, VERSION); assert.equal(report.basis.reportSha256, REPORT_SHA);
  for (const key of ['installationAuthorized', 'deploymentPerformed', 'publicationAuthorized', 'liveHostVerified', 'browserResetAuthorized']) assert.equal(report[key], false);
  for (const row of report.archivedFiles) { const bytes = await read(row.path); assert.equal(hash(bytes), row.sha256, row.path); assert.equal(bytes.length, row.byteLength); }
  assert.deepEqual((await tree(OUTPUT)).filter(path => !path.endsWith('/artifact-verification.json')).sort(), report.archivedFiles.map(row => row.path).sort());
  const require = createRequire(resolve(ROOT, 'spfx/package.json'));
  const { readPackage } = require(resolve(ROOT, `${OUTPUT}/implementation/spfx/test-build/package-harness.cjs`));
  const actual = readPackage(resolve(ROOT, `${OUTPUT}/${PACKAGE_NAME}`)), old = readPackage(resolve(ROOT, `${OUTPUT}/basis/fristenrechner-schweiz-0.8.0.0.sppkg`));
  assert.equal(actual.provenance.packageSha256, report.packageSha256); assert.deepEqual(auditPackage(actual, old), report.packageAudit);
  assert.equal(hash(await read(`${PREFIX}/${PACKAGE_NAME}`)), report.packageSha256);
  return { passed: true, packageVersion: VERSION, packageSha256: report.packageSha256, archivedFiles: report.archivedFiles.length,
    installationAuthorized: false, liveHostVerified: false, roundTripMvp09Pending: report.roundTripMvp09Pending };
}
export async function main() {
  assert.equal(resolve(process.execPath), resolve(ROOT, NODE)); assert.equal(process.version, 'v22.23.2');
  const authority = await requireR09BApproval(); assert.equal(authority.record.permissions.localRecoveryBuildAuthorized, true);
  assert.equal(authority.record.versions.recoveryPackage, VERSION);
  await absent(OUTPUT); await absent(`${PREFIX}/${PACKAGE_NAME}`);
  const old = await baseline();
  const protectedFiles = await inventory([`${BASE}/product-build.json`, OLD_PACKAGE, ...old.archivedInputs.map(row => row.archivedAt), ...old.archivedFixtures.map(row => row.archivedAt)]);
  const implementationPaths = [SELF, TEST, 'scripts/record-r09b-execution-approval.mjs', ...await tree('spfx/recovery-mvp09'),
    'spfx/recovery-mvp07/package-harness.cjs', 'spfx/test-build/package-harness.cjs'];
  const implementation = await inventory(implementationPaths);
  const stage = relative(ROOT, await mkdtemp(resolve(ROOT, '.work/mvp09-recovery-')));
  const inputs = await stageInputs(old, stage), target = resolve(ROOT, stage, 'spfx');
  const packagePath = resolve(target, 'sharepoint/solution/fristenrechner-schweiz.sppkg');
  const sourceTests = inputs.filter(row => /^spfx\/test\/.*\.test\.ts$/.test(row.path)).map(row => row.path.slice(5));
  const builtTests = inputs.filter(row => /^spfx\/test-build\/.*\.test\.cjs$/.test(row.path)).map(row => row.path.slice(5));
  assert.equal(sourceTests.length, 16); assert.equal(builtTests.length, 19);
  const npmCli = resolve(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js');
  const report = { kind: 'mvp09LocalRecoveryBuild', startedAt: new Date().toISOString(), packageVersion: VERSION, applicationVersion: '0.8.0',
    functionalBaseline: 'MVP 0.8', stage, authority: { path: authority.path, sha256: authority.sha256 },
    basis: { reportSha256: REPORT_SHA, packageSha256: OLD_PACKAGE_SHA, gitCommit: COMMIT, productInputs: 210, fixtureInputs: 599, helperInputs: HELPERS.length },
    installationAuthorized: false, deploymentPerformed: false, publicationAuthorized: false, liveHostVerified: false, browserResetAuthorized: false,
    roundTripMvp09Pending: true, inputDerivation: inputs, implementation, protectedFiles, steps: [],
    limitations: ['Real AMD package tests use simulated browser hooks, local storage, IndexedDB and transport, not real M365/devices.',
      'MVP09 to Recovery to MVP09 requires a separate supplemental proof bound to the definitive MVP09 package.',
      'Recovery removes LU/ZG/AR administrative paths and the UX field-height correction. No selective newer functionality included.'] };
  const firstAttemptPath = '.work/mvp09-recovery-nZlVPA/verification.json';
  const firstAttemptBytes = await read(firstAttemptPath), firstAttempt = JSON.parse(firstAttemptBytes);
  assert.equal(firstAttempt.passed, false); assert.equal(firstAttempt.steps.at(-1).id, 'recovery-tests');
  assert.equal(firstAttempt.steps.at(-1).exitCode, 1);
  const firstLog = await read(firstAttempt.steps.at(-1).log); assert.equal(hash(firstLog), firstAttempt.steps.at(-1).sha256);
  assert.match(firstLog.toString(), /^# tests 10$/m); assert.match(firstLog.toString(), /^# pass 5$/m); assert.match(firstLog.toString(), /^# fail 5$/m);
  assert.match(firstLog.toString(), /assert\.ok\(protectedState\)/);
  report.priorFailedAttempt = { path: firstAttemptPath, sha256: hash(firstAttemptBytes),
    reason: 'The new test incorrectly looked for a useMemo result among useState slots. It now checks the actual visible guard and form and exercises save/reset. The new ZIP auditor now validates directory entry names with their trailing slash removed. No product source, normative input or test timeout changed.',
    sourceTestsPassed: 204, builtTestsPassed: 107, recoveryTestsPassed: 5, recoveryHarnessFailures: 5, productChanged: false };
  const env = { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}`, npm_config_update_notifier: 'false', npm_config_audit: 'false', npm_config_fund: 'false',
    FRISTENRECHNER_RECOVERY_STAGE: resolve(ROOT, stage), FRISTENRECHNER_RECOVERY_SPPKG: packagePath };
  for (const key of ['FRISTENRECHNER_TEST_SPPKG', 'FRISTENRECHNER_DATA_CANDIDATE']) delete env[key];
  const commands = [
    { id: 'tool-tests', cwd: ROOT, command: process.execPath, args: ['--test', TEST], tests: true },
    { id: 'sync', cwd: target, command: process.execPath, args: [npmCli, 'run', 'sync'] },
    { id: 'source-tests', cwd: target, command: process.execPath, args: ['--import', 'tsx', '--test', '--test-concurrency=2', '--test-timeout=60000', ...sourceTests], tests: true },
    { id: 'compile', cwd: target, command: resolve(target, 'node_modules/.bin/heft'), args: ['test', '--clean', '--production'] },
    { id: 'css-audit', cwd: target, command: process.execPath, args: ['scripts/audit-product-css.mjs'] },
    { id: 'package', cwd: target, command: resolve(target, 'node_modules/.bin/heft'), args: ['package-solution', '--production'] },
    { id: 'built-tests', cwd: target, command: process.execPath, args: ['--test', '--test-concurrency=2', '--test-timeout=60000', ...builtTests], tests: true },
    { id: 'recovery-tests', cwd: resolve(ROOT, 'spfx'), command: process.execPath, args: ['--test', '--test-concurrency=1', '--test-timeout=60000',
      'recovery-mvp09/recovery-package.test.cjs', 'recovery-mvp09/recovery-defaults.test.cjs', 'recovery-mvp09/recovery-cache.test.cjs', 'recovery-mvp09/recovery-equivalence.test.cjs'], tests: true }
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
    report.packageAudit = auditPackage(readPackage(packagePath), readPackage(resolve(ROOT, OLD_PACKAGE)));
    const bytes = await readFile(packagePath); report.packageSha256 = hash(bytes); report.packageByteLength = bytes.length;
    for (const row of inputs) assert.equal(hash(await read(`${stage}/${row.path}`)), row.afterSha256, `Build changed source input: ${row.path}`);
    assert.deepEqual(await inventory(protectedFiles.map(row => row.path)), protectedFiles);
    assert.deepEqual(await inventory(implementationPaths), implementation);
    passed = true;
  } catch (error) { report.error = String(error.stack ?? error); }
  report.passed = passed; report.finishedAt = new Date().toISOString();
  await writeNew(`${stage}/verification.json`, encode(report));
  if (!passed) { console.log(JSON.stringify({ passed, stage, error: report.error })); process.exitCode = 1; return; }
  await absent(OUTPUT); report.archivedFiles = [];
  async function archive(path, bytes) { const destination = `${OUTPUT}/${path}`; await writeNew(destination, bytes); report.archivedFiles.push({ path: destination, byteLength: bytes.length, sha256: hash(bytes) }); }
  await archive(PACKAGE_NAME, await readFile(packagePath));
  await archive('basis/fristenrechner-schweiz-0.8.0.0.sppkg', await read(OLD_PACKAGE));
  await archive('basis/product-build-mvp08.json', await read(`${BASE}/product-build.json`));
  await archive('authority/r09b-execution-approval.json', await read(authority.path));
  await archive('attempts/first-failed/verification.json', firstAttemptBytes);
  for (const step of firstAttempt.steps) { const bytes = await read(step.log); assert.equal(hash(bytes), step.sha256); await archive(`attempts/first-failed/${step.id}.log`, bytes); }
  for (const row of inputs) await archive(`build-inputs/${row.path}`, await read(`${stage}/${row.path}`));
  for (const row of implementation) await archive(`implementation/${row.path}`, await read(row.path));
  for (const step of report.steps) {
    const bytes = await read(step.log); assert.equal(hash(bytes), step.sha256);
    await archive(`logs/${step.id}.log`, bytes); step.archivedLog = `${OUTPUT}/logs/${step.id}.log`;
  }
  await writeNew(`${PREFIX}/${PACKAGE_NAME}`, await readFile(packagePath));
  await writeNew(`${OUTPUT}/artifact-verification.json`, encode(report));
  console.log(JSON.stringify(await verifyArchive()));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 3);
  if (process.argv[2] === '--build') await main();
  else if (process.argv[2] === '--verify') console.log(JSON.stringify(await verifyArchive()));
  else assert.fail('Use --build or --verify');
}
