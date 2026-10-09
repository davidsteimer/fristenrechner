// SPDX-License-Identifier: AGPL-3.0-only
// Local recovery re-versioning only. No deployment, publication or live source writes.
import assert from 'node:assert/strict';
import { lstat, mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const VERSION = '0.7.0.3';
export const ORIGINAL = 'outputs/recovery-mvp07-0.7.0.1-2026-10-08';
export const CORRECTION = 'outputs/release-mvp07-spfx-0.7.0.2-2026-10-09';
export const OUTPUT = 'outputs/recovery-mvp07-0.7.0.3-2026-10-09';
export const PACKAGE_NAME = `fristenrechner-schweiz-recovery-${VERSION}.sppkg`;
const SELF = 'scripts/build-mvp07-recovery-0703.mjs';
const TEST = 'tests/governance/mvp07-recovery-0703.test.mjs';
const FIXTURES = 'spfx/recovery-mvp07-0703';
const AUTHORITY = 'docs/betrieb/freigabe-wiederherstellung-mvp07-0703-lokal.md';
const NODE = '.work/toolchains/node-v22.23.2-darwin-arm64/bin/node';
const SOLUTION = '13090feb-a6bf-40fa-9d3c-ec8d90516a60';
const FEATURE = '3edf1509-41e9-4a2f-8005-df510eec43b6';
const WEBPART = '596c7f1c-4d3e-4da8-a7be-27a96024f37c';
const CONFIG = 'spfx/config/package-solution.json';
const HOST = 'spfx/src/webparts/fristenrechner/components/Fristenrechner.tsx';
const HARNESS = `${ORIGINAL}/implementation/spfx/test-build/package-harness.cjs`;
const OLD_PACKAGE = `${ORIGINAL}/artifacts/fristenrechner-schweiz-recovery-0.7.0.1.sppkg`;
const PREDECESSOR_PACKAGE = `${CORRECTION}/artifacts/fristenrechner-schweiz-0.7.0.2.sppkg`;
const FROZEN_ROOTS = [ORIGINAL, CORRECTION, 'outputs/release-mvp07-2026-10-08',
  'outputs/release-mvp06-2026-10-01', 'outputs/release-mvp06-spfx-0.6.0.1-2026-10-01',
  'src', 'spfx/src', 'spfx/config', 'data/releases'];
const ANCHORS = {
  [`${ORIGINAL}/artifact-verification.json`]: '93c7b0162d63a03b89ef832a8bb7b1396922de5548c40ef65dc461179023263e',
  [OLD_PACKAGE]: '9e028245f3df72a6c13056e45624971389c573fc89da0e9d76cf9f2188fcc7d9',
  [PREDECESSOR_PACKAGE]: '8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db',
  [`${CORRECTION}/artifact-verification.json`]: 'c42c0c75d2352004e640dd0de3d18a37e4147290d4cd2c12f1e9a705d0376702',
  'outputs/release-mvp07-2026-10-08/artifact-verification.json': '17076eb9d4d5ceb4de8e4aeff5f23d514c0c3db19708d7e9487c42a7cfdcc4cb',
  'outputs/release-mvp07-2026-10-08/artifacts/fristenrechner-schweiz-0.7.0.0.sppkg': 'bc8abe70c791f58d2cea9fb66ea568f604bcacae35fec9ae29aadeca5e0c6e09',
  'outputs/release-mvp06-spfx-0.6.0.1-2026-10-01/artifacts/fristenrechner-schweiz-0.6.0.1.sppkg': '60f84213507f99ec58463c84c514037d9c00bd63fdc8f02d85e52097bcf3c587',
  'spfx/sharepoint/solution/fristenrechner-schweiz.sppkg': '9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346',
  [HARNESS]: '2b64616aca108bc8d77d444d79ffa37249d73b0fceb7c83787bb6990314ffa30'
};
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => readFile(resolve(ROOT, path));
const json = value => `${JSON.stringify(value, null, 2)}\n`;
async function assertAbsent(path) {
  try { await lstat(path); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
  assert.fail(`Existing output must not be overwritten: ${path}`);
}
async function tree(directory) {
  const paths = [];
  for (const entry of await readdir(resolve(ROOT, directory), { withFileTypes: true })) {
    if (entry.name === '.DS_Store' || entry.name === '__pycache__' || entry.name.endsWith('.pyc')) continue;
    const path = `${directory}/${entry.name}`;
    assert.ok(!entry.isSymbolicLink(), `Unexpected source symlink: ${path}`);
    if (entry.isDirectory()) paths.push(...await tree(path));
    else if (entry.isFile()) paths.push(path);
  }
  return paths.sort();
}
async function inventory(paths) {
  return Promise.all([...new Set(paths)].sort().map(async path => {
    const bytes = await read(path); return { path, byteLength: bytes.length, sha256: hash(bytes) };
  }));
}
async function frozenEvidence() {
  for (const [path, expected] of Object.entries(ANCHORS)) assert.equal(hash(await read(path)), expected, `Frozen anchor changed: ${path}`);
  return inventory([...Object.keys(ANCHORS), 'package.json', 'package-lock.json', 'spfx/package.json', 'spfx/package-lock.json',
    ...(await Promise.all(FROZEN_ROOTS.map(tree))).flat()]);
}
export function replaceExactlyOnce(text, from, to) {
  assert.equal(text.split(from).length, 2, `Expected exactly one bound literal: ${from}`);
  return text.replace(from, to);
}
export function deriveInput(path, bytes) {
  const text = bytes.toString();
  if (path === CONFIG) {
    const value = JSON.parse(text);
    assert.equal(value.solution.version, '0.7.0.1');
    assert.equal(value.solution.features.length, 1);
    assert.equal(value.solution.features[0].version, '0.7.0.1');
    assert.equal(value.solution.id, SOLUTION); assert.equal(value.solution.features[0].id, FEATURE);
    assert.equal(value.solution.includeClientSideAssets, true); assert.equal(value.solution.isDomainIsolated, false);
    assert.ok(!value.solution.webApiPermissionRequests?.length && !value.webApiPermissionRequests?.length);
    assert.equal(text.split('"version": "0.7.0.1"').length, 3, 'Exactly solution and feature versions');
    const result = Buffer.from(text.replaceAll('"version": "0.7.0.1"', `"version": "${VERSION}"`));
    const normalized = JSON.parse(result);
    normalized.solution.version = '0.7.0.1'; normalized.solution.features[0].version = '0.7.0.1';
    assert.deepEqual(normalized, value, 'Only the two bound package versions may change');
    return result;
  }
  if (path === HOST) return Buffer.from(replaceExactlyOnce(text,
    'data-recovery-version="0.7.0.1"', `data-recovery-version="${VERSION}"`));
  return bytes;
}
export function normalizeGeneratedPartConfig(name, xml) {
  if (![ `feature_${FEATURE}.xml.config.xml`, 'ClientSideAssets.xml.config.xml' ].includes(name)) return xml;
  assert.match(xml, /^<\?xml version="1\.0" encoding="utf-8"\?><AppPartConfig xmlns="http:\/\/schemas\.microsoft\.com\/sharepoint\/2012\/app\/partconfiguration"><Id>[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}<\/Id><\/AppPartConfig>$/);
  return xml.replace(/<Id>[a-f0-9-]{36}<\/Id>/, '<Id>GENERATED-PART-CONFIG</Id>');
}
export function normalizeGeneratedAssetFeature(name, xml) {
  if (name !== 'ClientSideAssets.xml') return xml;
  const pattern = / Id="[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}"/g;
  assert.equal([...xml.matchAll(pattern)].length, 1, 'Exactly one generated asset-feature UUID v4');
  assert.match(xml, /^<\?xml version="1\.0" encoding="utf-8"\?><Feature xmlns="http:\/\/schemas\.microsoft\.com\/sharepoint\/" Title="Client Side Assets" Description="A feature that help deploy client side component assets to SharePoint Online\." Id="[a-f0-9-]{36}" Version="1\.0\.0\.0" Scope="Web" Hidden="FALSE"><\/Feature>$/);
  return xml.replace(pattern, ' Id="GENERATED-ASSET-FEATURE"');
}
function componentManifest(xml) {
  const matches = [...xml.matchAll(/\bComponentManifest="([^"]*)"/g)]; assert.equal(matches.length, 1);
  const entities = { quot: '"', apos: "'", amp: '&', lt: '<', gt: '>' };
  return JSON.parse(matches[0][1].replace(/&(quot|apos|amp|lt|gt);/g, (_, name) => entities[name]));
}
export function normalizeHostClassNames(current, baseline) {
  // SPFx scopes this single unchanged SCSS module by its absolute staging path.
  // Bind the five actual inline class references and their exact occurrence counts.
  // No other hexadecimal token or generated product code may be normalised.
  const counts = { host: 2, startup: 5, badge: 2, runtimeMessage: 3, runtimeStatus: 5 };
  const mappings = []; let normalized = current;
  const currentSuffixes = new Set(), priorSuffixes = new Set();
  for (const [name, count] of Object.entries(counts)) {
    const pattern = new RegExp(`\\b${name}_([a-f0-9]{8})\\b`, 'g');
    const actual = [...current.matchAll(pattern)], prior = [...baseline.matchAll(pattern)];
    assert.equal(actual.length, count, `Current scoped class occurrence count: ${name}`);
    assert.equal(prior.length, count, `Baseline scoped class occurrence count: ${name}`);
    assert.equal(new Set(actual.map(match => match[0])).size, 1); assert.equal(new Set(prior.map(match => match[0])).size, 1);
    currentSuffixes.add(actual[0][1]); priorSuffixes.add(prior[0][1]);
    const reference = value => name === 'runtimeMessage'
      ? new RegExp(`\\bconst [A-Za-z_$][\\w$]*="${value}";`)
      : new RegExp(`\\bclassName:"${value}"`);
    assert.match(current, reference(actual[0][0]), `Current inline SCSS reference: ${name}`);
    assert.match(baseline, reference(prior[0][0]), `Baseline inline SCSS reference: ${name}`);
    normalized = normalized.replace(pattern, prior[0][0]);
    mappings.push({ name, current: actual[0][0], baseline: prior[0][0], occurrences: count });
  }
  assert.equal(currentSuffixes.size, 1); assert.equal(priorSuffixes.size, 1);
  return { normalized, mappings };
}
export function auditPackage(current, baseline) {
  assert.equal(baseline.provenance.packageSha256, ANCHORS[OLD_PACKAGE]);
  const newName = basename(current.bundlePath), oldName = basename(baseline.bundlePath);
  assert.notEqual(newName, oldName, 'Visible recovery version must be rebuilt');
  const normalizeBundleName = text => text.replaceAll(newName, oldName);
  const scopedClasses = normalizeHostClassNames(normalizeBundleName(current.bundle.toString()), baseline.bundle.toString());
  const normalizedBundle = replaceExactlyOnce(scopedClasses.normalized,
    `"data-recovery-version":"${VERSION}"`, '"data-recovery-version":"0.7.0.1"');
  assert.equal(normalizedBundle, baseline.bundle.toString(), 'Recovery bundle changed beyond visible version and its license filename');
  const featurePath = `feature_${FEATURE}.xml`;
  const componentPath = `${FEATURE}/WebPart_${WEBPART}.xml`;
  const manifest = componentManifest(current.files.get(componentPath).toString());
  assert.equal(manifest.id, WEBPART); assert.equal(manifest.version, '0.7.1');
  assert.deepEqual(manifest.supportedHosts, ['SharePointWebPart', 'TeamsTab']);
  assert.equal(`ClientSideAssets/${manifest.loaderConfig.scriptResources['fristenrechner-web-part'].path}`, current.bundlePath);
  assert.match(manifest.preconfiguredEntries[0].properties.githubBaseUrl, /\/19b37336974f3ba7c72333763e1272425239b8cd\/data\/releases\/2026-10-01-mvp-06-approved\.1$/);
  assert.deepEqual([...current.files.keys()].map(name => name.replace(newName, oldName)).sort(), [...baseline.files.keys()].sort());
  for (const [name, bytes] of current.files) {
    assert.ok(!name.startsWith('/') && !name.split('/').includes('..') && !/\.(?:map|ts|tsx|pem|key)$/.test(name));
    if (name === current.bundlePath) continue;
    const priorName = name.replace(newName, oldName), prior = baseline.files.get(priorName);
    assert.ok(prior, `Unexpected archive entry ${name}`);
    if (!/\.(?:xml|rels)$/.test(name)) { assert.ok(bytes.equals(prior), `Unrelated asset changed: ${name}`); continue; }
    assert.doesNotMatch(bytes.toString(), /<\/?(?:[\w-]+:)?[\w-]*Permission[\w-]*\b/i);
    assert.doesNotMatch(bytes.toString(), /TargetMode="External"/i);
    let text = normalizeBundleName(bytes.toString());
    let oldText = prior.toString();
    if (['AppManifest.xml', featurePath].includes(name)) text = replaceExactlyOnce(text, `Version="${VERSION}"`, 'Version="0.7.0.1"');
    text = normalizeGeneratedAssetFeature(name, normalizeGeneratedPartConfig(name, text));
    oldText = normalizeGeneratedAssetFeature(priorName, normalizeGeneratedPartConfig(priorName, oldText));
    assert.equal(text, oldText, `Unexpected package contract delta: ${name}`);
  }
  return { packageVersion: VERSION, componentVersion: '0.7.1', solutionId: SOLUTION, featureId: FEATURE,
    webpartId: WEBPART, additionalApiPermissions: [], bundlePath: current.bundlePath, bundleSha256: hash(current.bundle),
    normalizedBundleByteIdentical: true, scopedHostClasses: scopedClasses.mappings,
    normalization: ['visible data-recovery-version literal once', 'bundle/own-license filenames', 'five bound SCSS module class names with exact occurrence counts',
      'solution and feature version', 'two AppPartConfig UUID v4', 'generated ClientSideAssets feature UUID v4'],
    entries: [...current.files].map(([path, bytes]) => ({ path, byteLength: bytes.length, sha256: hash(bytes) })) };
}
async function verifyOriginalArchive() {
  const proof = JSON.parse(await read(`${ORIGINAL}/artifact-verification.json`));
  assert.equal(hash(await read(`${ORIGINAL}/artifact-verification.json`)), ANCHORS[`${ORIGINAL}/artifact-verification.json`]);
  assert.equal(proof.packageVersion, '0.7.0.1');
  for (const row of proof.files) {
    assert.ok(row.path && !row.path.startsWith('/') && !row.path.split('/').includes('..'));
    const bytes = await read(`${ORIGINAL}/${row.path}`);
    assert.equal(bytes.length, row.byteLength, row.path); assert.equal(hash(bytes), row.sha256, row.path);
  }
  return proof;
}
async function writeNew(path, bytes) {
  await mkdir(dirname(resolve(ROOT, path)), { recursive: true });
  await writeFile(resolve(ROOT, path), bytes, { flag: 'wx' });
  assert.equal(hash(await read(path)), hash(bytes), path);
}
export function assertPassingTestLog(text, count) {
  for (const [key, value] of [['tests', count], ['pass', count], ['fail', 0], ['cancelled', 0], ['skipped', 0], ['todo', 0]]) {
    assert.match(text, new RegExp(`^# ${key} ${value}$`, 'm'), `Unexpected ${key} count`);
  }
}
export async function verifyArchive() {
  const report = JSON.parse(await read(`${OUTPUT}/artifact-verification.json`));
  assert.equal(report.kind, 'mvp07Recovery0703Build'); assert.equal(report.passed, true); assert.equal(report.packageVersion, VERSION);
  for (const flag of ['installationAuthorized', 'deploymentPerformed', 'publicationAuthorized', 'liveHostVerified', 'browserResetAuthorized']) assert.equal(report[flag], false);
  assert.equal(report.predecessor.packageSha256, ANCHORS[PREDECESSOR_PACKAGE]);
  assert.equal(report.basis.recoveryReportSha256, ANCHORS[`${ORIGINAL}/artifact-verification.json`]);
  const originalProofBytes = await read(`${OUTPUT}/basis/recovery-0701-artifact-verification.json`);
  assert.equal(hash(originalProofBytes), ANCHORS[`${ORIGINAL}/artifact-verification.json`]);
  const originalInputs = JSON.parse(originalProofBytes).files.filter(row => row.path.startsWith('build-inputs/'));
  assert.deepEqual(report.inputDerivation.map(row => row.path).sort(),
    originalInputs.map(row => row.path.slice('build-inputs/'.length)).sort(), 'Archived input inventory must exactly match the sealed predecessor');
  const listed = report.archivedFiles.map(row => row.path).sort();
  const actual = (await tree(OUTPUT)).filter(path => path !== `${OUTPUT}/artifact-verification.json`).sort();
  assert.deepEqual(actual, listed, 'Archive inventory must be exhaustive');
  for (const row of report.archivedFiles) {
    assert.ok(row.path.startsWith(`${OUTPUT}/`) && !row.path.split('/').includes('..'));
    const bytes = await read(row.path); assert.equal(bytes.length, row.byteLength); assert.equal(hash(bytes), row.sha256);
  }
  const require = createRequire(resolve(ROOT, `${OUTPUT}/implementation/package-harness.cjs`));
  const { readPackage } = require(resolve(ROOT, `${OUTPUT}/implementation/package-harness.cjs`));
  const candidate = readPackage(resolve(ROOT, `${OUTPUT}/artifacts/${PACKAGE_NAME}`));
  assert.equal(candidate.provenance.packageSha256, report.packageSha256);
  const baseline = readPackage(resolve(ROOT, `${OUTPUT}/basis/fristenrechner-schweiz-recovery-0.7.0.1.sppkg`));
  const predecessor = readPackage(resolve(ROOT, `${OUTPUT}/basis/fristenrechner-schweiz-0.7.0.2.sppkg`));
  assert.equal(predecessor.provenance.packageSha256, ANCHORS[PREDECESSOR_PACKAGE]);
  assert.deepEqual(auditPackage(candidate, baseline), report.packageAudit);
  for (const row of report.inputDerivation) {
    const before = await read(`${OUTPUT}/baseline-inputs/${row.path}`), after = await read(`${OUTPUT}/build-inputs/${row.path}`);
    const sealed = originalInputs.find(item => item.path === `build-inputs/${row.path}`);
    assert.equal(hash(before), sealed.sha256); assert.equal(before.length, sealed.byteLength);
    assert.equal(hash(before), row.beforeSha256); assert.equal(hash(after), row.afterSha256);
    assert.ok(deriveInput(row.path, before).equals(after), `Unbounded archived derivation: ${row.path}`);
  }
  assert.deepEqual(report.inputDerivation.filter(row => row.changed).map(row => row.path).sort(), [CONFIG, HOST].sort());
  assert.equal(report.steps.length, 5); assert.ok(report.steps.every(step => step.exitCode === 0));
  for (const [id, count] of [['source-tests', 32], ['package-tests', 11]]) {
    const step = report.steps.find(step => step.id === id); assert.ok(step);
    assertPassingTestLog((await read(step.archivedLog)).toString(), count);
  }
  return { passed: true, packageVersion: VERSION, packageSha256: report.packageSha256, archiveIndependentOfScratch: true,
    sourceTests: 32, packageTests: 11, predecessorPackageVersion: '0.7.0.2', liveHostVerified: false, installationAuthorized: false };
}
export async function main() {
  assert.equal(process.argv.length, 3); assert.equal(process.argv[2], '--build');
  assert.equal(resolve(process.execPath), resolve(ROOT, NODE)); assert.equal(process.version, 'v22.23.2');
  for (const key of ['FRISTENRECHNER_TEST_SPPKG', 'FRISTENRECHNER_DATA_CANDIDATE', 'FRISTENRECHNER_RECOVERY_SPPKG', 'FRISTENRECHNER_RECOVERY_STAGE']) assert.ok(!process.env[key], `No override ${key}`);
  await assertAbsent(resolve(ROOT, OUTPUT));
  const frozen = await frozenEvidence(), original = await verifyOriginalArchive();
  const authority = await read(AUTHORITY);
  for (const phrase of ['Ja, bitte tue das.', '0.7.0.3', 'Umfasst sind der isolierte lokale Bau',
    'Dieser Auftrag erlaubt noch keinen Austausch im Tenant-App-Katalog']) assert.ok(authority.toString().includes(phrase), `Local authority missing: ${phrase}`);
  const implementationPaths = [SELF, TEST, AUTHORITY, ...await tree(FIXTURES), 'spfx/recovery-mvp07/package-harness.cjs', 'spfx/test-build/package-harness.cjs'];
  const implementation = await inventory(implementationPaths);
  const stage = await mkdtemp(resolve(ROOT, '.work/mvp07-recovery-0703-'));
  const target = resolve(stage, 'spfx'), stageRelative = relative(ROOT, stage);
  const inputDerivation = [];
  for (const row of original.files.filter(row => row.path.startsWith('build-inputs/'))) {
    const path = row.path.slice('build-inputs/'.length), before = await read(`${ORIGINAL}/${row.path}`), after = deriveInput(path, before);
    await writeNew(`${stageRelative}/${path}`, after);
    inputDerivation.push({ path, beforeSha256: hash(before), afterSha256: hash(after), byteLength: after.length, changed: !before.equals(after) });
  }
  assert.deepEqual(inputDerivation.filter(row => row.changed).map(row => row.path).sort(), [CONFIG, HOST].sort());
  await symlink(resolve(ROOT, 'spfx/node_modules'), resolve(target, 'node_modules'), 'dir');
  const packagePath = resolve(target, 'sharepoint/solution/fristenrechner-schweiz.sppkg');
  const report = { kind: 'mvp07Recovery0703Build', startedAt: new Date().toISOString(), packageVersion: VERSION, componentVersion: '0.7.1',
    functionalBaseline: 'MVP 0.6 / package 0.6.0.1', localOnly: true, stage: stageRelative,
    basis: { recoveryVersion: '0.7.0.1', recoveryPackageSha256: ANCHORS[OLD_PACKAGE], recoveryReportSha256: ANCHORS[`${ORIGINAL}/artifact-verification.json`] },
    predecessor: { packageVersion: '0.7.0.2', packageSha256: ANCHORS[PREDECESSOR_PACKAGE] },
    authority: { path: AUTHORITY, sha256: hash(authority), declaration: 'Ja, bitte tue das.', approvedBy: 'David Steimer', date: '2026-10-09' },
    installationAuthorized: false, deploymentPerformed: false, publicationAuthorized: false, liveHostVerified: false, browserResetAuthorized: false,
    inputDerivation, implementation, frozenEvidence: frozen, node: process.version, sourceTests: 32, packageTests: 11,
    limitations: ['Synthetic local source and real-package tests, not browser/SharePoint/Teams acceptance.',
      'Separate operational gate R07C-H02 and installation authority remain open.',
      'The unchanged recovery implementation returns to the MVP06 functional baseline, not the MVP07 display correction.'], steps: [] };
  const env = { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}`,
    npm_config_update_notifier: 'false', npm_config_audit: 'false', npm_config_fund: 'false',
    FRISTENRECHNER_RECOVERY_STAGE: stage, FRISTENRECHNER_RECOVERY_SPPKG: packagePath };
  const commands = [
    { id: 'source-tests', cwd: resolve(ROOT, 'spfx'), command: process.execPath,
      args: ['--import', 'tsx', '--test', '--test-timeout=60000', 'recovery-mvp07-0703/recovery-storage.test.ts', 'recovery-mvp07-0703/recovery-lifecycle.test.ts'], tests: 32 },
    { id: 'compile', cwd: target, command: resolve(target, 'node_modules/.bin/heft'), args: ['test', '--clean', '--production'] },
    { id: 'css-audit', cwd: target, command: process.execPath, args: ['scripts/audit-product-css.mjs'] },
    { id: 'package', cwd: target, command: resolve(target, 'node_modules/.bin/heft'), args: ['package-solution', '--production'] },
    { id: 'package-tests', cwd: resolve(ROOT, 'spfx'), command: process.execPath,
      args: ['--test', '--test-timeout=180000', 'recovery-mvp07-0703/recovery-package.test.cjs'], tests: 11 }
  ];
  let passed = false, packageBytes;
  try {
    for (const step of commands) {
      const result = spawnSync(step.command, step.args, { cwd: step.cwd, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      const bytes = Buffer.from(`${result.stdout ?? ''}${result.stderr ?? ''}${result.error ?? ''}`);
      const log = `${stageRelative}/step-${report.steps.length + 1}.log`; await writeNew(log, bytes);
      const record = { id: step.id, exitCode: result.status, signal: result.signal, cwd: relative(ROOT, step.cwd), args: step.args, log, rawLogSha256: hash(bytes) };
      report.steps.push(record); console.log(JSON.stringify(record));
      assert.equal(result.status, 0, `Build step failed: ${step.id}`);
      if (step.tests) assertPassingTestLog(result.stdout ?? '', step.tests);
    }
    const require = createRequire(resolve(ROOT, HARNESS)), { readPackage } = require(resolve(ROOT, HARNESS));
    report.packageAudit = auditPackage(readPackage(packagePath), readPackage(resolve(ROOT, OLD_PACKAGE)));
    packageBytes = await readFile(packagePath); report.packageSha256 = hash(packageBytes); report.packageByteLength = packageBytes.length;
    for (const row of inputDerivation) assert.equal(hash(await read(`${stageRelative}/${row.path}`)), row.afterSha256, `Build modified input ${row.path}`);
    passed = true;
  } catch (error) { report.error = String(error?.stack ?? error); }
  try {
    assert.deepEqual(await frozenEvidence(), frozen, 'Historical archives or live product/data changed');
    assert.deepEqual(await inventory(implementationPaths), implementation, 'Builder, fixtures or authority changed during build');
    report.frozenEvidenceUnchanged = true;
  } catch (error) { report.preservationError = String(error); passed = false; }
  report.passed = passed; report.finishedAt = new Date().toISOString();
  await writeNew(`${stageRelative}/verification.json`, Buffer.from(json(report)));
  if (!passed) { console.log(JSON.stringify({ passed, stage: stageRelative, error: report.error, preservationError: report.preservationError })); process.exitCode = 1; return; }
  await assertAbsent(resolve(ROOT, OUTPUT)); await mkdir(resolve(ROOT, OUTPUT));
  report.archivedFiles = [];
  async function archive(path, bytes) {
    const destination = `${OUTPUT}/${path}`; await writeNew(destination, bytes);
    report.archivedFiles.push({ path: destination, byteLength: bytes.length, sha256: hash(bytes) });
  }
  await archive(`artifacts/${PACKAGE_NAME}`, packageBytes);
  await archive('basis/fristenrechner-schweiz-recovery-0.7.0.1.sppkg', await read(OLD_PACKAGE));
  await archive('basis/fristenrechner-schweiz-0.7.0.2.sppkg', await read(PREDECESSOR_PACKAGE));
  await archive('basis/recovery-0701-artifact-verification.json', await read(`${ORIGINAL}/artifact-verification.json`));
  await archive('basis/correction-0702-artifact-verification.json', await read(`${CORRECTION}/artifact-verification.json`));
  await archive('implementation/package-harness.cjs', await read(HARNESS));
  for (const row of inputDerivation) {
    await archive(`baseline-inputs/${row.path}`, await read(`${ORIGINAL}/build-inputs/${row.path}`));
    await archive(`build-inputs/${row.path}`, await read(`${stageRelative}/${row.path}`));
  }
  for (const row of implementation) {
    const bytes = await read(row.path); assert.equal(hash(bytes), row.sha256); await archive(`implementation/${row.path}`, bytes);
  }
  for (const step of report.steps) {
    const bytes = await read(step.log); assert.equal(hash(bytes), step.rawLogSha256);
    const sanitized = Buffer.from(bytes.toString().replaceAll(ROOT, '<repository>/').replace(/\/Users\/[^/\s]+/g, '/Users/<user>'));
    step.archivedLog = `${OUTPUT}/build-evidence/${step.id}.log`;
    await archive(`build-evidence/${step.id}.log`, sanitized);
  }
  assert.deepEqual(await frozenEvidence(), frozen);
  assert.deepEqual(await inventory(implementationPaths), implementation);
  await writeNew(`${OUTPUT}/artifact-verification.json`, Buffer.from(json(report)));
  console.log(JSON.stringify(await verifyArchive()));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length === 3 && process.argv[2] === '--verify') console.log(JSON.stringify(await verifyArchive()));
  else await main();
}
