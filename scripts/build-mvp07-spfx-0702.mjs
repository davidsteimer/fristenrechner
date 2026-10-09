// SPDX-License-Identifier: AGPL-3.0-only
// R07C-B01: bounded local SPFx correction only. No deployment, publication or web/mirror rebuild.
import assert from 'node:assert/strict';
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { approvedData, productInputPaths } from './build-mvp07-spfx.mjs';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const VERSION = '0.7.0.2';
export const OUTPUT = 'outputs/release-mvp07-spfx-0.7.0.2-2026-10-09';
export const ORIGINAL = 'outputs/release-mvp07-2026-10-08';
export const RECOVERY = 'outputs/recovery-mvp07-0.7.0.1-2026-10-08';
export const PACKAGE_NAME = `fristenrechner-schweiz-${VERSION}.sppkg`;
const SELF = 'scripts/build-mvp07-spfx-0702.mjs';
const TEST = 'tests/governance/mvp07-spfx-correction.test.mjs';
const AUTHORITY = 'docs/betrieb/freigabe-r07c-b01-lokal.md';
const NODE = '.work/toolchains/node-v22.23.2-darwin-arm64/bin/node';
const RELEASE_ID = '2026-10-08-mvp-07-approved.1';
const PIN = '331ef3e19d43a6b51d91a502acd6b5443071599f';
const MANIFEST_SHA = 'fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597';
const BASE_URL = `https://raw.githubusercontent.com/davidsteimer/fristenrechner/${PIN}/data/releases/${RELEASE_ID}`;
const SOLUTION = '13090feb-a6bf-40fa-9d3c-ec8d90516a60';
const FEATURE = '3edf1509-41e9-4a2f-8005-df510eec43b6';
const WEBPART = '596c7f1c-4d3e-4da8-a7be-27a96024f37c';
const HISTORICAL = 'spfx/sharepoint/solution/fristenrechner-schweiz.sppkg';
export const UI_CHANGES = new Set(['src/ui/FristenrechnerApp.tsx', 'src/ui/calendarContextUi.tsx',
  'src/ui/holidayConnectionDropdown.ts', 'src/ui/styles.css']);
export const UI_ADDITIONS = new Set(['src/ui/dropdownStyles.ts']);
const FROZEN_ROOTS = [ORIGINAL, RECOVERY, 'outputs/release-mvp06-2026-10-01',
  'outputs/release-mvp06-spfx-0.6.0.1-2026-10-01'];
const ANCHORS = {
  [`${ORIGINAL}/artifact-verification.json`]: '17076eb9d4d5ceb4de8e4aeff5f23d514c0c3db19708d7e9487c42a7cfdcc4cb',
  [`${ORIGINAL}/artifacts/fristenrechner-schweiz-0.7.0.0.sppkg`]: 'bc8abe70c791f58d2cea9fb66ea568f604bcacae35fec9ae29aadeca5e0c6e09',
  [`${ORIGINAL}/artifacts/fristenrechner-mvp07-sharepoint-mirror.zip`]: 'ed603938f86849aec55dd5cdc83c300a8ae6437e4bb8eb62f3d7b5fa7e6753ca',
  [`${ORIGINAL}/artifacts/fristenrechner-mvp07-steimer-web.zip`]: 'c7c20676154506694267e517791fe2fca73b7e403523e4968eea5ddb3fa0afcf',
  [`${RECOVERY}/artifact-verification.json`]: '93c7b0162d63a03b89ef832a8bb7b1396922de5548c40ef65dc461179023263e',
  [`${RECOVERY}/artifacts/fristenrechner-schweiz-recovery-0.7.0.1.sppkg`]: '9e028245f3df72a6c13056e45624971389c573fc89da0e9d76cf9f2188fcc7d9',
  [HISTORICAL]: '9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346',
  'scripts/build-mvp07-spfx.mjs': '13bfbff262f05d0058aacdcc6058327e82c50293c66bb25de503968205c21c74'
};
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => readFile(resolve(ROOT, path));
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const isRuntimeInput = path => ['src/core/', 'src/ui/', 'src/public-app/', 'schemas/', 'spfx/src/core/',
  'spfx/src/webparts/', 'spfx/scripts/', 'spfx/config/', 'public-app/'].some(prefix => path.startsWith(prefix))
  || ['package.json', 'package-lock.json', 'spfx/package.json', 'spfx/package-lock.json',
    'src/release/mvp07ReleaseData.ts', 'scripts/build-public-app.mjs', 'scripts/browser-globals-plugin.mjs'].includes(path);

export async function assertAbsent(path) {
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
  return inventory([HISTORICAL, ...Object.keys(ANCHORS), ...(await Promise.all(FROZEN_ROOTS.map(tree))).flat()]);
}
export function assertCorrectionConfig(current, baseline) {
  assert.equal(current.solution.version, VERSION);
  assert.equal(current.solution.features.length, 1);
  assert.equal(current.solution.features[0].version, VERSION);
  const normalized = structuredClone(current);
  normalized.solution.version = '0.7.0.0'; normalized.solution.features[0].version = '0.7.0.0';
  assert.deepEqual(normalized, baseline, 'Only package and feature versions may differ');
  assert.equal(current.solution.id, SOLUTION); assert.equal(current.solution.features[0].id, FEATURE);
  assert.equal(current.solution.includeClientSideAssets, true); assert.equal(current.solution.isDomainIsolated, false);
  assert.ok(!current.solution.webApiPermissionRequests?.length && !current.webApiPermissionRequests?.length);
}
export function assertBoundedSourceDelta(current, baseline) {
  const currentMap = new Map(current.filter(row => isRuntimeInput(row.path)).map(row => [row.path, row]));
  const oldMap = new Map(baseline.filter(row => isRuntimeInput(row.path)).map(row => [row.path, row]));
  const changes = [];
  for (const [path, old] of oldMap) {
    assert.ok(currentMap.has(path), `Removed runtime input: ${path}`);
    const item = currentMap.get(path);
    if (item.sha256 !== old.sha256) {
      assert.ok(UI_CHANGES.has(path) || path === 'spfx/config/package-solution.json', `Unbounded runtime change: ${path}`);
      changes.push({ path, beforeSha256: old.sha256, afterSha256: item.sha256 });
    }
  }
  for (const [path, item] of currentMap) if (!oldMap.has(path)) {
    assert.ok(UI_ADDITIONS.has(path), `Unbounded new runtime input: ${path}`);
    changes.push({ path, beforeSha256: null, afterSha256: item.sha256 });
  }
  assert.ok(changes.some(row => UI_CHANGES.has(row.path)), 'The bounded UI correction is missing');
  assert.ok(currentMap.has('src/ui/dropdownStyles.ts'), 'Shared dropdown styles missing');
  return changes.sort((a, b) => a.path.localeCompare(b.path));
}
function componentManifest(xml) {
  const matches = [...xml.matchAll(/\bComponentManifest="([^"]*)"/g)];
  assert.equal(matches.length, 1);
  const entities = { quot: '"', apos: "'", amp: '&', lt: '<', gt: '>' };
  return JSON.parse(matches[0][1].replace(/&(quot|apos|amp|lt|gt);/g, (_, name) => entities[name]));
}
export function auditDropdownBundle(bundle) {
  const text = bundle.toString();
  for (const slot of ['title', 'dropdownOptionText']) {
    const matches = [...text.matchAll(new RegExp(`\\b${slot}:\\{([^}]+)\\}`, 'g'))];
    assert.ok(matches.some(match => ['whiteSpace:"normal"', 'overflow:"visible"', 'textOverflow:"clip"',
      'overflowWrap:"anywhere"'].every(marker => match[1].includes(marker))), `Packaged wrapping style missing: ${slot}`);
  }
  assert.ok(text.includes('height:"auto",minHeight:32,paddingTop:5,paddingBottom:5,lineHeight:20'), 'Packaged title dimensions missing');
  assert.ok(text.includes('height:"auto",minHeight:36,paddingTop:7,paddingBottom:7'), 'Packaged option dimensions missing');
  for (const slot of ['dropdownItem', 'dropdownItemSelected', 'dropdownItemDisabled', 'dropdownItemSelectedAndDisabled']) {
    assert.match(text, new RegExp(`\\b${slot}:`));
  }
  assert.doesNotMatch(text, /\.fr-form__grid\s+\.ms-Dropdown-title\{[^}]*text-overflow:ellipsis/);
  return { actualBundleInspected: true, titleWrapping: true, optionWrapping: true, allOptionStates: true,
    hostVisualAcceptanceClaimed: false };
}
export function normalizeGeneratedPartConfig(name, xml) {
  if (![ `feature_${FEATURE}.xml.config.xml`, 'ClientSideAssets.xml.config.xml' ].includes(name)) return xml;
  // SPFx createFeatureXml.js emits uuid.v4() here, independently of product IDs.
  assert.match(xml, /^<\?xml version="1\.0" encoding="utf-8"\?><AppPartConfig xmlns="http:\/\/schemas\.microsoft\.com\/sharepoint\/2012\/app\/partconfiguration"><Id>[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}<\/Id><\/AppPartConfig>$/);
  return xml.replace(/<Id>[a-f0-9-]{36}<\/Id>/, '<Id>GENERATED-PART-CONFIG</Id>');
}
export function auditPackage(current, baseline) {
  const app = current.files.get('AppManifest.xml')?.toString();
  assert.equal(app, baseline.files.get('AppManifest.xml').toString().replace('Version="0.7.0.0"', `Version="${VERSION}"`), 'App XML changed beyond version');
  const featurePath = `feature_${FEATURE}.xml`;
  assert.equal(current.files.get(featurePath)?.toString(), baseline.files.get(featurePath).toString().replace('Version="0.7.0.0"', `Version="${VERSION}"`), 'Feature XML changed beyond version');
  const componentPath = `${FEATURE}/WebPart_${WEBPART}.xml`;
  const manifest = componentManifest(current.files.get(componentPath).toString());
  const old = componentManifest(baseline.files.get(componentPath).toString());
  assert.equal(manifest.id, WEBPART); assert.equal(manifest.version, '0.7.0');
  assert.deepEqual(manifest.supportedHosts, ['SharePointWebPart', 'TeamsTab']);
  assert.deepEqual(manifest.preconfiguredEntries[0].properties,
    { providerKind: 'github', githubBaseUrl: BASE_URL, sharePointMirrorPath: '' });
  assert.equal(`ClientSideAssets/${manifest.loaderConfig.scriptResources['fristenrechner-web-part'].path}`, current.bundlePath);
  const normalized = structuredClone(manifest);
  normalized.loaderConfig.scriptResources['fristenrechner-web-part'].path = old.loaderConfig.scriptResources['fristenrechner-web-part'].path;
  assert.deepEqual(normalized, old, 'Component contract changed beyond bundle path');
  const newName = basename(current.bundlePath), oldName = basename(baseline.bundlePath);
  assert.equal(current.files.get(componentPath).toString().replaceAll(newName, oldName),
    baseline.files.get(componentPath).toString(), 'Component XML changed beyond bundle path');
  const normalizedNames = [...current.files.keys()].map(name => name.replace(newName, oldName)).sort();
  assert.deepEqual(normalizedNames, [...baseline.files.keys()].sort(), 'Unexpected package file inventory');
  for (const [name, bytes] of current.files) {
    assert.ok(!name.startsWith('/') && !name.split('/').includes('..') && !/\.(?:map|ts|tsx|pem|key)$/.test(name));
    if (/\.(?:xml|rels)$/.test(name)) {
      assert.doesNotMatch(bytes.toString(), /<\/?(?:[\w-]+:)?[\w-]*Permission[\w-]*\b/i);
      assert.doesNotMatch(bytes.toString(), /TargetMode="External"/i);
    }
    if ([current.bundlePath, 'AppManifest.xml', featurePath, componentPath].includes(name)) continue;
    const priorName = name.replace(newName, oldName);
    if (!/\.(?:xml|rels)$/.test(name)) {
      assert.ok(bytes.equals(baseline.files.get(priorName)), `Unrelated binary or text asset changed: ${name}`);
      continue;
    }
    let text = bytes.toString().replaceAll(newName, oldName);
    let oldText = baseline.files.get(priorName).toString();
    text = normalizeGeneratedPartConfig(name, text);
    oldText = normalizeGeneratedPartConfig(priorName, oldText);
    if (name === 'ClientSideAssets.xml') {
      // The packaging tool generates a fresh asset-feature GUID on each build.
      const pattern = /\bId="[a-f0-9-]{36}"/;
      assert.match(text, pattern); assert.match(oldText, pattern);
      text = text.replace(pattern, 'Id="GENERATED-ASSET-FEATURE"');
      oldText = oldText.replace(pattern, 'Id="GENERATED-ASSET-FEATURE"');
    }
    assert.equal(text, oldText, `Unrelated package content changed: ${name}`);
  }
  for (const marker of [BASE_URL, RELEASE_ID, '"7.0.0"', '"3.0.0"', '"2.0.0"', 'ch-holiday-catalog', 'ch-social-procedures']) {
    assert.ok(current.bundle.toString().includes(marker), `Missing consumer marker: ${marker}`);
  }
  return { solutionVersion: VERSION, featureVersion: VERSION, componentVersion: '0.7.0', solutionId: SOLUTION,
    featureId: FEATURE, webpartId: WEBPART, supportedHosts: manifest.supportedHosts, additionalApiPermissions: [],
    defaultGithubBaseUrl: BASE_URL, bundlePath: current.bundlePath, bundleSha256: hash(current.bundle),
    correction: auditDropdownBundle(current.bundle), entries: [...current.files].map(([path, bytes]) => ({ path, byteLength: bytes.length, sha256: hash(bytes) })) };
}
async function writeNew(path, bytes) {
  await mkdir(dirname(resolve(ROOT, path)), { recursive: true });
  await writeFile(resolve(ROOT, path), bytes, { flag: 'wx' });
  assert.equal(hash(await read(path)), hash(bytes), `Archive readback differs: ${path}`);
}
export async function verifyArchive() {
  const report = JSON.parse(await read(`${OUTPUT}/artifact-verification.json`));
  assert.equal(report.kind, 'mvp07LocalSpfxCorrectionBuild'); assert.equal(report.passed, true);
  assert.equal(report.packageVersion, VERSION); assert.equal(report.manifestSha256, MANIFEST_SHA);
  for (const flag of ['installationAuthorized', 'publicationVerified', 'deploymentPerformed', 'productionActivation',
    'webPrepared', 'mirrorRepacked', 'runtimeHostValidationVerified', 'remotePinPublicationVerified']) assert.equal(report[flag], false);
  for (const row of report.archivedFiles) {
    assert.ok(row.path.startsWith(OUTPUT + '/') && !row.path.split('/').includes('..'));
    const bytes = await read(row.path); assert.equal(bytes.length, row.byteLength); assert.equal(hash(bytes), row.sha256);
  }
  const required = createRequire(resolve(ROOT, `${OUTPUT}/build-evidence/inputs/spfx/test-build/package-harness.cjs`));
  const { readPackage } = required(resolve(ROOT, `${OUTPUT}/build-evidence/inputs/spfx/test-build/package-harness.cjs`));
  const current = readPackage(resolve(ROOT, `${OUTPUT}/artifacts/${PACKAGE_NAME}`));
  const baseline = readPackage(resolve(ROOT, `${OUTPUT}/basis/fristenrechner-schweiz-0.7.0.0.sppkg`));
  assert.equal(baseline.provenance.packageSha256, ANCHORS[`${ORIGINAL}/artifacts/fristenrechner-schweiz-0.7.0.0.sppkg`]);
  assert.equal(current.provenance.packageSha256, report.packageSha256);
  assert.deepEqual(auditPackage(current, baseline), report.packageAudit);
  assert.equal(report.steps.length, 6); assert.ok(report.steps.every(step => step.exitCode === 0));
  return { passed: true, packageVersion: VERSION, packageSha256: report.packageSha256,
    archiveIndependentOfScratch: true, installationAuthorized: false };
}
export async function main() {
  assert.equal(process.argv.length, 2, 'Only a fresh local correction build is supported');
  assert.equal(resolve(process.execPath), resolve(ROOT, NODE)); assert.equal(process.version, 'v22.23.2');
  for (const key of ['FRISTENRECHNER_TEST_SPPKG', 'FRISTENRECHNER_DATA_CANDIDATE', 'FRISTENRECHNER_RECOVERY_SPPKG']) assert.ok(!process.env[key], `Unexpected override: ${key}`);
  await assertAbsent(resolve(ROOT, OUTPUT));
  const frozen = await frozenEvidence(); const release = await approvedData();
  const authorityBytes = await read(AUTHORITY);
  assert.ok(authorityBytes.toString().includes('Bittte bereite die begrenzte Darstellungskorrektur samt neuem Paketkandidaten vor.'));
  assert.ok(authorityBytes.toString().includes('ausschliesslich die lokale Korrektur'));
  assert.equal(release.manifestSha256, MANIFEST_SHA); assert.equal(release.pinCommit, PIN);
  const oldProof = JSON.parse(await read(`${ORIGINAL}/artifact-verification.json`));
  for (const row of oldProof.buildInputSnapshots) assert.equal(hash(await read(row.archivePath)), row.sha256, `Archived input changed: ${row.path}`);
  const inputPaths = [...await productInputPaths(), SELF, TEST, AUTHORITY];
  const inputs = await inventory(inputPaths);
  const sourceDelta = assertBoundedSourceDelta(inputs, oldProof.buildInputSnapshots);
  assertCorrectionConfig(JSON.parse(await read('spfx/config/package-solution.json')),
    JSON.parse(await read(`${ORIGINAL}/build-evidence/inputs/spfx/config/package-solution.json`)));
  for (const file of ['package.json', 'package-lock.json', 'spfx/package.json', 'spfx/package-lock.json']) assert.equal(JSON.parse(await read(file)).version, '0.7.0');
  const fixturePaths = [...await tree('data'), ...await tree('tests'), ...await tree('outputs/ap22c3-2026-10-08/bundle')];
  const fixtureInputs = await inventory(fixturePaths);
  const originalBuild = JSON.parse(await read(`${ORIGINAL}/build-evidence/spfx-verification.json`));
  for (const name of ['ch-federal-calendar.json', 'be-public-holidays.json']) {
    const path = `data/releases/2026-10-01-mvp-06-approved.1/calendars/${name}`;
    const original = originalBuild.fixtureInputFiles.find(row => row.path === path);
    assert.ok(original, `Historical normative input not bound: ${path}`);
    assert.deepEqual(fixtureInputs.find(row => row.path === path), original, `Historical normative input changed: ${path}`);
  }
  const stage = await mkdtemp(resolve(ROOT, '.work/mvp07-spfx-0702-'));
  const target = resolve(stage, 'spfx'); await mkdir(target);
  const excluded = new Set(['node_modules', 'lib', 'lib-commonjs', 'dist', 'temp', 'release', 'sharepoint', '.heft']);
  for (const item of await readdir(resolve(ROOT, 'spfx'), { withFileTypes: true })) if (!excluded.has(item.name)) {
    assert.ok(!item.isSymbolicLink());
    await cp(resolve(ROOT, 'spfx', item.name), resolve(target, item.name), { recursive: true, errorOnExist: true, force: false });
  }
  for (const directory of ['src', 'schemas', 'data', 'tests', 'outputs/ap22c3-2026-10-08/bundle']) {
    await cp(resolve(ROOT, directory), resolve(stage, directory), { recursive: true, errorOnExist: true, force: false });
  }
  await symlink(resolve(ROOT, 'spfx/node_modules'), resolve(target, 'node_modules'), 'dir');
  const npmCli = resolve(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js');
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
  const report = { kind: 'mvp07LocalSpfxCorrectionBuild', startedAt: new Date().toISOString(),
    candidateStatus: 'localCorrectionCandidate', applicationVersion: '0.7.0', packageVersion: VERSION,
    replacesPackageVersion: '0.7.0.0', releaseId: RELEASE_ID, manifestSha256: MANIFEST_SHA, pinCommit: PIN,
    stage: relative(ROOT, stage), output: OUTPUT, toolchain: { node: NODE, nodeVersion: process.version },
    authority: { approvedBy: 'David Steimer', approvedOn: '2026-10-09',
      path: AUTHORITY, sha256: hash(authorityBytes),
      declaration: 'Bittte bereite die begrenzte Darstellungskorrektur samt neuem Paketkandidaten vor.',
      scope: 'R07C-B01 local display correction and package preparation only', installationAuthorized: false },
    sourceDelta, productInputFiles: inputs, fixtureInputs, releaseFiles: release.files,
    sourceTestFiles: sourceTests, builtTestFiles: builtTests, frozenEvidence: frozen,
    installationAuthorized: false, publicationVerified: false, deploymentPerformed: false, productionActivation: false,
    webPrepared: false, mirrorRepacked: false, runtimeHostValidationVerified: false, remotePinPublicationVerified: false,
    recovery: { originalVersion: '0.7.0.1', originalSha256: ANCHORS[`${RECOVERY}/artifacts/fristenrechner-schweiz-recovery-0.7.0.1.sppkg`],
      preservedUnchanged: true, usableAsHigherVersionAfterCandidate: false, newRecoveryGateRequiredBeforeInstallation: true },
    limitations: ['No installation, host acceptance, GitHub publication or P activation.',
      'Original web and mirror archives unchanged, not rebuilt.',
      'Recovery 0.7.0.1 is lower than this candidate. A newly suitable authorised recovery path is required before installation.'], steps: [] };
  const env = { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}`,
    npm_config_update_notifier: 'false', npm_config_audit: 'false', npm_config_fund: 'false' };
  let packageBytes;
  let passed = false;
  try {
    for (const step of commands) {
      const result = spawnSync(step.command, step.args, { cwd: target, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      const bytes = Buffer.from(`${result.stdout ?? ''}${result.stderr ?? ''}${result.error ?? ''}`);
      const log = relative(ROOT, resolve(stage, `step-${report.steps.length + 1}.log`));
      await writeFile(resolve(ROOT, log), bytes, { flag: 'wx' });
      const recorded = { id: step.id, command: relative(ROOT, step.command), args: step.args.map(arg => arg.startsWith(ROOT) ? relative(ROOT, arg) : arg),
        exitCode: result.status, signal: result.signal, log, rawLogSha256: hash(bytes) };
      report.steps.push(recorded); console.log(JSON.stringify(recorded));
      assert.equal(result.status, 0, `Build step failed: ${step.id}`);
    }
    assert.deepEqual(await inventory(inputPaths), inputs, 'Inputs changed during build');
    assert.deepEqual(await inventory(fixturePaths), fixtureInputs, 'Fixtures changed during build');
    assert.deepEqual(await approvedData(), release, 'Release data or pin changed');
    const required = createRequire(resolve(target, 'package.json'));
    const { readPackage } = required(resolve(target, 'test-build/package-harness.cjs'));
    const emitted = required(resolve(target, 'lib-commonjs/product/ui/dropdownStyles.js')).calculatorDropdownStyles;
    assert.deepEqual(emitted.title, { height: 'auto', minHeight: 32, paddingTop: 5, paddingBottom: 5, lineHeight: 20,
      whiteSpace: 'normal', overflow: 'visible', textOverflow: 'clip', overflowWrap: 'anywhere' });
    assert.deepEqual(emitted.dropdownOptionText, { whiteSpace: 'normal', overflow: 'visible', textOverflow: 'clip', overflowWrap: 'anywhere', minWidth: 0 });
    for (const slot of ['dropdownItem', 'dropdownItemSelected', 'dropdownItemDisabled', 'dropdownItemSelectedAndDisabled']) {
      assert.deepEqual(emitted[slot], { height: 'auto', minHeight: 36, paddingTop: 7, paddingBottom: 7 });
    }
    report.emittedStylesVerified = true;
    const packagePath = resolve(target, 'sharepoint/solution/fristenrechner-schweiz.sppkg');
    report.packageAudit = auditPackage(readPackage(packagePath), readPackage(resolve(ROOT, `${ORIGINAL}/artifacts/fristenrechner-schweiz-0.7.0.0.sppkg`)));
    packageBytes = await readFile(packagePath); report.packageSha256 = hash(packageBytes); report.packageByteLength = packageBytes.length;
    passed = true;
  } catch (error) { report.error = String(error?.stack ?? error); }
  try { assert.deepEqual(await frozenEvidence(), frozen, 'Historical release evidence changed'); report.frozenEvidenceUnchanged = true; }
  catch (error) { report.preservationError = String(error); passed = false; }
  report.passed = passed; report.finishedAt = new Date().toISOString();
  await writeFile(resolve(stage, 'verification.json'), json(report), { flag: 'wx' });
  if (!passed) { console.log(JSON.stringify({ passed, evidence: relative(ROOT, resolve(stage, 'verification.json')), error: report.error })); process.exitCode = 1; return; }
  await assertAbsent(resolve(ROOT, OUTPUT));
  report.archivedFiles = [];
  async function archive(relativePath, bytes) {
    const path = `${OUTPUT}/${relativePath}`; await writeNew(path, bytes);
    report.archivedFiles.push({ path, byteLength: bytes.length, sha256: hash(bytes) });
  }
  await archive(`artifacts/${PACKAGE_NAME}`, packageBytes);
  await archive('basis/fristenrechner-schweiz-0.7.0.0.sppkg', await read(`${ORIGINAL}/artifacts/fristenrechner-schweiz-0.7.0.0.sppkg`));
  for (const row of inputs) { const bytes = await read(row.path); assert.equal(hash(bytes), row.sha256); await archive(`build-evidence/inputs/${row.path}`, bytes); }
  for (const row of release.files) await archive(`build-evidence/inputs/${row.path}`, await read(row.path));
  for (const [index, step] of report.steps.entries()) {
    const bytes = await read(step.log); assert.equal(hash(bytes), step.rawLogSha256);
    const sanitized = Buffer.from(bytes.toString().replaceAll(ROOT, '<repository>/').replace(/\/Users\/[^/\s]+/g, '/Users/<user>'));
    await archive(`build-evidence/logs/step-${index + 1}.txt`, sanitized);
    step.archivedLog = `${OUTPUT}/build-evidence/logs/step-${index + 1}.txt`; step.archivedLogSha256 = hash(sanitized);
  }
  assert.deepEqual(await frozenEvidence(), frozen);
  assert.deepEqual(await inventory(inputPaths), inputs);
  await writeNew(`${OUTPUT}/artifact-verification.json`, Buffer.from(json(report)));
  console.log(JSON.stringify(await verifyArchive()));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length === 3 && process.argv[2] === '--verify') console.log(JSON.stringify(await verifyArchive()));
  else await main();
}
