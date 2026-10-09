// SPDX-License-Identifier: AGPL-3.0-only
// Bounded local SPFx correction candidate. Never installs, uploads or builds web/mirror archives.
import assert from 'node:assert/strict';
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyMvp06SourceApproval } from './verify-mvp06-source-approval.mjs';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const RELEASE_ID = '2026-10-01-mvp-06-approved.1';
export const PIN_COMMIT = '19b37336974f3ba7c72333763e1272425239b8cd';
export const VERSION = '0.6.0.1';
export const OUTPUT = 'outputs/release-mvp06-spfx-0.6.0.1-2026-10-01';
const PRIOR_OUTPUT = 'outputs/release-mvp06-2026-10-01';
const MANIFEST_SHA256 = '637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724';
const PRIOR_PACKAGE = `${PRIOR_OUTPUT}/artifacts/fristenrechner-schweiz-0.6.0.0.sppkg`;
const PACKAGE_NAME = `fristenrechner-schweiz-${VERSION}.sppkg`;
const NODE = '.work/toolchains/node-v22.23.2-darwin-arm64/bin/node';
const SOLUTION_ID = '13090feb-a6bf-40fa-9d3c-ec8d90516a60';
const FEATURE_ID = '3edf1509-41e9-4a2f-8005-df510eec43b6';
const COMPONENT_ID = '596c7f1c-4d3e-4da8-a7be-27a96024f37c';
const BASE_URL = `https://raw.githubusercontent.com/davidsteimer/fristenrechner/${PIN_COMMIT}/data/releases/${RELEASE_ID}`;
const FROZEN = {
  'scripts/build-mvp06-spfx.mjs': '037d5cd6135b66c40b2966acfded6e0cf9be7db77173c499aae4a72af3cf2d90',
  [PRIOR_PACKAGE]: '85dd933ba08c9810e9f0cf4954b9cbc0d12ef4b8ad972f525d9a929023bbc681',
  [`${PRIOR_OUTPUT}/artifacts/fristenrechner-mvp06-sharepoint-mirror.zip`]: '1ebe748393d80206ea38d020e4e1a58ce432458a3b273e5972cfcbc8627153f3',
  [`${PRIOR_OUTPUT}/artifacts/fristenrechner-mvp06-steimer-web.zip`]: '3b54e098124649e18036303d38747f41b6374d913182766197fe65d34789d2ae',
  [`${PRIOR_OUTPUT}/artifact-verification.json`]: 'b1605744fe22e21aa012a78cb941ea5573fe4962fb1e11ad09b6331116f752ad',
  [`${PRIOR_OUTPUT}/build-evidence/spfx-verification.json`]: '8ab1c0a788484da0fbe5d04cdd8d9b9f732306dd79f026842844740f0a869bca',
  [`${PRIOR_OUTPUT}/data-promotion.json`]: '51f946fe36104e83e766ad7b958d2debf678781deee7f9b388c573b928088b91',
  [`${PRIOR_OUTPUT}/source-approval.json`]: '10f43005757c54a445f009d702b17a37f04e2dad530241201dbf6c4eebfc2cbb',
  'outputs/release-mvp05-2026-09-28/artifacts/fristenrechner-schweiz-0.5.0.0.sppkg': 'f46beaadbfd9e2a893b55853bb2d622cb6850e5d72b08b9443d367e0d6f6cf39',
  'spfx/sharepoint/solution/fristenrechner-schweiz.sppkg': '9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346'
};
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => readFile(resolve(ROOT, path));
const json = value => `${JSON.stringify(value, null, 2)}\n`;

export async function assertAbsent(path) {
  try { await lstat(path); } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  assert.fail(`Existing target must not be overwritten: ${path}`);
}

async function inventory(paths) {
  return Promise.all([...new Set(paths)].sort().map(async path => {
    const bytes = await read(path);
    return { path, byteLength: bytes.length, sha256: hash(bytes) };
  }));
}

async function tree(directory) {
  const paths = [];
  async function visit(path) {
    for (const item of await readdir(resolve(ROOT, path), { withFileTypes: true })) {
      if (item.name === '__pycache__' || item.name === '.DS_Store' || item.name.endsWith('.pyc')) continue;
      const child = `${path}/${item.name}`;
      assert.ok(!item.isSymbolicLink(), `Unexpected symlink in bounded inputs: ${child}`);
      if (item.isDirectory()) await visit(child);
      else if (item.isFile()) paths.push(child);
    }
  }
  await visit(directory);
  return paths;
}

async function frozenEvidence() {
  const entries = await inventory(Object.keys(FROZEN));
  for (const entry of entries) assert.equal(entry.sha256, FROZEN[entry.path], `Frozen evidence changed: ${entry.path}`);
  return entries;
}

export function assertCorrectionConfig(config, baseline) {
  assert.equal(config.solution.version, VERSION);
  assert.equal(config.solution.features.length, 1);
  assert.equal(config.solution.features[0].version, VERSION);
  const normalized = structuredClone(config);
  normalized.solution.version = '0.6.0.0';
  normalized.solution.features[0].version = '0.6.0.0';
  assert.deepEqual(normalized, baseline, 'Only solution and feature versions may differ from the approved package configuration');
  assert.equal(config.solution.id, SOLUTION_ID);
  assert.equal(config.solution.features[0].id, FEATURE_ID);
  assert.equal(config.solution.includeClientSideAssets, true);
  assert.equal(config.solution.isDomainIsolated, false);
  assert.ok(!config.solution.webApiPermissionRequests?.length && !config.webApiPermissionRequests?.length);
}

async function approvedData() {
  const manifestPath = `data/releases/${RELEASE_ID}/manifest.json`;
  const manifestBytes = await read(manifestPath);
  assert.equal(hash(manifestBytes), MANIFEST_SHA256);
  const manifest = JSON.parse(manifestBytes);
  assert.equal(manifest.releaseId, RELEASE_ID);
  assert.equal(manifest.releaseStatus, 'approved');
  assert.equal(manifest.formatVersion, '6.0.0');
  assert.equal(manifest.artifacts.length, 10);
  const entries = [];
  for (const descriptor of [{ path: 'manifest.json', sha256: MANIFEST_SHA256, byteLength: manifestBytes.length }, ...manifest.artifacts]) {
    assert.match(descriptor.path, /^[a-z0-9/-]+\.json$/);
    assert.ok(!descriptor.path.split('/').includes('..'));
    const path = `data/releases/${RELEASE_ID}/${descriptor.path}`;
    const bytes = await read(path);
    assert.equal(hash(bytes), descriptor.sha256, `Approved data changed: ${path}`);
    assert.equal(bytes.length, descriptor.byteLength);
    const blob = spawnSync('git', ['cat-file', 'blob', `${PIN_COMMIT}:${path}`], { cwd: ROOT, maxBuffer: 8 * 1024 * 1024 });
    assert.equal(blob.status, 0, `Missing immutable data blob: ${path}`);
    assert.ok(bytes.equals(blob.stdout), `Pinned data differs: ${path}`);
    entries.push({ path, byteLength: bytes.length, sha256: hash(bytes) });
  }
  assert.equal(new Set(entries.map(entry => entry.path)).size, 11);
  const config = (await read('spfx/src/core/config.ts')).toString();
  const matches = config.match(/https:\/\/raw\.githubusercontent\.com\/davidsteimer\/fristenrechner\/[a-f0-9]{40}\/data\/releases\/2026-10-01-mvp-06-approved\.1/g);
  assert.deepEqual(matches, [BASE_URL], 'The unchanged immutable data pin is required');
  return entries;
}

export function componentManifest(xml) {
  const matches = [...xml.matchAll(/\bComponentManifest="([^"]*)"/g)];
  assert.equal(matches.length, 1, 'Exactly one component manifest required');
  const entities = { quot: '"', apos: "'", amp: '&', lt: '<', gt: '>' };
  return JSON.parse(matches[0][1].replace(/&(quot|apos|amp|lt|gt);/g, (_, entity) => entities[entity]));
}

export function auditHolidayConnectionBundle(bundle) {
  const script = bundle.toString();
  const selectedRule = script.match(/\.fr-form__grid\s+\.fr-holiday-connections\s+\.ms-Dropdown-title\{([^}]+)\}/);
  assert.ok(selectedRule, 'The actual package lacks the bounded holiday-choice title selector');
  for (const declaration of ['height:auto', 'white-space:normal', 'overflow:visible', 'text-overflow:clip', 'overflow-wrap:anywhere']) {
    assert.ok(selectedRule[1].split(';').map(value => value.trim()).includes(declaration), `Missing packaged title rule: ${declaration}`);
  }
  assert.ok(script.includes('fr-procedure-choice fr-holiday-connections'), 'Missing general VRPG dropdown hook');
  assert.match(script, /className\s*:\s*["']fr-holiday-connections["']/);
  const optionText = script.match(/dropdownOptionText\s*:\s*\{([^}]+)\}/);
  assert.ok(optionText, 'Missing packaged Fluent UI option-text style slot');
  for (const [property, value] of [['whiteSpace', 'normal'], ['overflow', 'visible'], ['textOverflow', 'clip'], ['overflowWrap', 'anywhere']]) {
    assert.match(optionText[1], new RegExp(`${property}\\s*:\\s*["']${value}["']`));
  }
  assert.match(script, /\{\s*height\s*:\s*["']auto["']\s*,\s*minHeight\s*:\s*36\s*,\s*paddingTop\s*:\s*7\s*,\s*paddingBottom\s*:\s*7\s*\}/);
  for (const slot of ['dropdownItem', 'dropdownItemSelected', 'dropdownItemDisabled', 'dropdownItemSelectedAndDisabled']) {
    assert.match(script, new RegExp(`\\b${slot}\\s*:`));
  }
  return { actualPackageBundleInspected: true, generalAndSocialUiHooksPresent: true,
    titleAutoHeightAndWrappingPresent: true, optionTextWrappingPresent: true,
    optionAutoHeightAndAllFourSlotsPresent: true, hostVisualAcceptanceClaimed: false };
}

export function auditPackage(current, baseline) {
  const app = current.files.get('AppManifest.xml')?.toString();
  const oldApp = baseline.files.get('AppManifest.xml')?.toString();
  assert.equal(app, oldApp.replace('Version="0.6.0.0"', `Version="${VERSION}"`), 'App manifest changed beyond the package version');
  const featurePath = `feature_${FEATURE_ID}.xml`;
  assert.equal(current.files.get(featurePath)?.toString(), baseline.files.get(featurePath)?.toString().replace('Version="0.6.0.0"', `Version="${VERSION}"`), 'Feature changed beyond its version');
  const componentPath = `${FEATURE_ID}/WebPart_${COMPONENT_ID}.xml`;
  const manifest = componentManifest(current.files.get(componentPath).toString());
  const prior = componentManifest(baseline.files.get(componentPath).toString());
  assert.equal(manifest.id, COMPONENT_ID);
  assert.equal(manifest.version, '0.6.0');
  assert.deepEqual(manifest.supportedHosts, ['SharePointWebPart', 'TeamsTab']);
  assert.deepEqual(manifest.preconfiguredEntries[0].properties, { providerKind: 'github', githubBaseUrl: BASE_URL, sharePointMirrorPath: '' });
  assert.equal(`ClientSideAssets/${manifest.loaderConfig.scriptResources['fristenrechner-web-part'].path}`, current.bundlePath);
  const normalized = structuredClone(manifest);
  normalized.loaderConfig.scriptResources['fristenrechner-web-part'].path = prior.loaderConfig.scriptResources['fristenrechner-web-part'].path;
  assert.deepEqual(normalized, prior, 'WebPart contract or dependency manifest changed beyond the new bundle path');
  for (const [name, bytes] of current.files) {
    assert.ok(!name.startsWith('/') && !name.split('/').includes('..'), `Unsafe package entry: ${name}`);
    assert.ok(!/\.(?:map|ts|tsx|pem|key)$/.test(name), `Unexpected development/private package entry: ${name}`);
    if (/\.(?:xml|rels)$/.test(name)) {
      assert.doesNotMatch(bytes.toString(), /<\/?(?:[\w-]+:)?[\w-]*Permission[\w-]*\b/i);
      assert.doesNotMatch(bytes.toString(), /TargetMode="External"/i);
    }
  }
  assert.ok(current.files.has(`${current.bundlePath}.LICENSE.txt`));
  for (const marker of [BASE_URL, RELEASE_ID, '"6.0.0"', '"2.0.0"', 'ch-holiday-catalog', 'ch-social-procedures']) {
    assert.ok(current.bundle.toString().includes(marker), `Missing built marker: ${marker}`);
  }
  return { solutionVersion: VERSION, featureVersion: VERSION, webpartVersion: '0.6.0',
    solutionId: SOLUTION_ID, featureId: FEATURE_ID, webpartId: COMPONENT_ID,
    additionalApiPermissions: [], supportedHosts: manifest.supportedHosts, defaultGithubBaseUrl: BASE_URL,
    bundlePath: current.bundlePath, bundleByteLength: current.bundle.length, bundleSha256: hash(current.bundle),
    uiCorrection: auditHolidayConnectionBundle(current.bundle),
    entries: [...current.files].map(([path, bytes]) => ({ path, byteLength: bytes.length, sha256: hash(bytes) })) };
}

async function inputPaths() {
  const paths = ['package.json', 'package-lock.json', 'spfx/package.json', 'spfx/package-lock.json',
    'scripts/build-mvp06-spfx-0601.mjs', 'scripts/verify-mvp06-source-approval.mjs'];
  for (const dir of ['src/core', 'src/ui', 'src/release', 'schemas', 'spfx/src/core', 'spfx/src/webparts',
    'spfx/scripts', 'spfx/config', 'spfx/test', 'spfx/test-build', 'tests/golden']) {
    paths.push(...(await tree(dir)).filter(path => !path.startsWith('src/ui/preview/')));
  }
  return [...new Set(paths)].sort();
}

export async function main() {
  assert.equal(process.argv.length, 2, 'No overwrite, deployment or publication arguments accepted');
  assert.equal(resolve(process.execPath), resolve(ROOT, NODE), 'Use the existing pinned Node 22.23.2 toolchain');
  assert.equal(process.version, 'v22.23.2');
  assert.ok(!process.env.FRISTENRECHNER_TEST_SPPKG, 'An alternate package override would invalidate built tests');
  await assertAbsent(resolve(ROOT, OUTPUT));
  const frozenBefore = await frozenEvidence();
  const oldReleaseTree = await inventory(await tree(PRIOR_OUTPUT));
  const approval = await verifyMvp06SourceApproval(ROOT);
  const releaseFiles = await approvedData();
  const config = JSON.parse(await read('spfx/config/package-solution.json'));
  const baselineConfig = JSON.parse(await read(`${PRIOR_OUTPUT}/build-evidence/inputs/spfx/config/package-solution.json`));
  assertCorrectionConfig(config, baselineConfig);
  for (const path of ['package.json', 'spfx/package.json']) assert.equal(JSON.parse(await read(path)).version, '0.6.0');
  const npmScripts = JSON.parse(await read('spfx/package.json')).scripts;
  assert.equal(npmScripts.pretest, 'npm run sync');
  assert.equal(npmScripts.test, 'node --import tsx --test --test-timeout=30000 test/*.test.ts');
  assert.equal(npmScripts['test:built'], 'node --test --test-timeout=60000 test-build/*.test.cjs');
  const productPaths = await inputPaths();
  const inputsBefore = await inventory(productPaths);
  await mkdir(resolve(ROOT, '.work'), { recursive: true });
  const stage = await mkdtemp(resolve(ROOT, '.work/mvp06-spfx-0601-build-'));
  const target = resolve(stage, 'spfx');
  await mkdir(target);
  const excluded = new Set(['node_modules', 'lib', 'lib-commonjs', 'dist', 'temp', 'release', 'sharepoint', '.heft']);
  for (const item of await readdir(resolve(ROOT, 'spfx'), { withFileTypes: true })) {
    if (!excluded.has(item.name)) {
      assert.ok(!item.isSymbolicLink(), `Unexpected SPFx input symlink: ${item.name}`);
      await cp(resolve(ROOT, 'spfx', item.name), resolve(target, item.name), { recursive: true, errorOnExist: true, force: false });
    }
  }
  // Real copies isolate synchronisation and test fixtures from all old source/artefact trees.
  for (const name of ['src', 'schemas', 'data', 'tests']) await cp(resolve(ROOT, name), resolve(stage, name), { recursive: true, errorOnExist: true, force: false });
  await symlink(resolve(ROOT, 'spfx/node_modules'), resolve(target, 'node_modules'), 'dir');
  const npmCli = resolve(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js');
  const env = { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}`,
    npm_config_update_notifier: 'false', npm_config_audit: 'false', npm_config_fund: 'false' };
  const sourceTests = (await readdir(resolve(target, 'test'))).filter(name => name.endsWith('.test.ts')).sort().map(name => `test/${name}`);
  const builtTests = (await readdir(resolve(target, 'test-build'))).filter(name => name.endsWith('.test.cjs')).sort().map(name => `test-build/${name}`);
  assert.ok(sourceTests.length && builtTests.length, 'Both complete Node test suites are required');
  const commands = [
    { label: 'Unchanged npm pretest synchronisation', command: process.execPath, args: [npmCli, 'run', 'sync'] },
    { label: 'All SPFx source and provider tests, concurrency 2', command: process.execPath, args: ['--import', 'tsx', '--test', '--test-concurrency=2', '--test-timeout=30000', ...sourceTests] },
    { label: 'Clean production compile and Heft tests', command: resolve(target, 'node_modules/.bin/heft'), args: ['test', '--clean', '--production'] },
    { label: 'Actual bundle CSS audit', command: process.execPath, args: ['scripts/audit-product-css.mjs'] },
    { label: 'Production SPPKG packaging', command: resolve(target, 'node_modules/.bin/heft'), args: ['package-solution', '--production'] },
    { label: 'All emitted ES5 and actual packaged consumer tests, concurrency 2', command: process.execPath, args: ['--test', '--test-concurrency=2', '--test-timeout=60000', ...builtTests] }
  ];
  const priorAttemptPath = '.work/mvp06-spfx-0601-build-jCwshY/verification.json';
  const priorAttemptBytes = await read(priorAttemptPath);
  const priorAttempt = JSON.parse(priorAttemptBytes);
  const priorLogBytes = await read(priorAttempt.steps[0].log);
  assert.equal(priorAttempt.passed, false);
  assert.equal(priorAttempt.originalReleaseTreeUnchanged, true);
  assert.equal(hash(priorLogBytes), 'e90170be620a23ad0b43e66dcc215f34e24bc6fc5c4a7aef35ddd2aa35c9713c');
  assert.match(priorLogBytes.toString(), /test\/holiday-release-contract\.test\.ts/);
  assert.match(priorLogBytes.toString(), /test timed out after 30000ms/);
  const report = { kind: 'mvp06LocalSpfxCorrectionBuild', startedAt: new Date().toISOString(),
    candidateStatus: 'localCorrectionCandidate', applicationVersion: '0.6.0', packageVersion: VERSION,
    replacesPackageVersion: '0.6.0.0', releaseId: RELEASE_ID, manifestSha256: MANIFEST_SHA256, pinCommit: PIN_COMMIT,
    sourceApprovalSha256: approval.approvalSha256, stage: relative(ROOT, stage), output: OUTPUT,
    toolchain: { node: NODE, nodeVersion: process.version },
    testOrchestration: { nodeTestConcurrency: 2, sourceTimeoutMs: 30000, builtTimeoutMs: 60000,
      allSourceTestFiles: sourceTests, allBuiltTestFiles: builtTests, productNpmScriptsUnchanged: true,
      reason: 'Bounded parallelism avoids contention between schema-heavy test files. No timeout or assertion was weakened. The original npm pretest hook is run explicitly before the complete unchanged test file sets.' },
    priorAttempt: { path: priorAttemptPath, sha256: hash(priorAttemptBytes), passed: false,
      log: priorAttempt.steps[0].log, rawLogSha256: hash(priorLogBytes),
      sourceTestsPassed: 143, failedAssertions: 0, cancelledFileSuites: 1, timeoutMs: 30000,
      isolatedDiagnostic: { command: 'node --import tsx --test --test-timeout=30000 test/holiday-release-contract.test.ts',
        stage: '.work/mvp06-spfx-0601-build-jCwshY/spfx', tests: 23, passed: 23, failed: 0, cancelled: 0,
        durationMs: 12044.022083, rawLogArchived: false,
        evidenceBasis: 'Actual completed exec tool output in the working conversation. Diagnostic only, not a replacement for the complete repeated build.' } },
    frozenReleaseEvidence: frozenBefore, frozenOriginalReleaseTree: oldReleaseTree,
    productInputFiles: inputsBefore, releaseFiles, steps: [],
    sourceApprovalIsNotNewInstallationApproval: true, installationAuthorized: false, publicationVerified: false,
    deploymentPerformed: false, productionActivation: false, webPrepared: false, mirrorRepacked: false,
    runtimeHostValidationVerified: false, remotePinPublicationVerified: false,
    limitations: ['Local build and packaged-consumer tests only, no E/Q host acceptance or publication.',
      'The old web archive is preserved, not rebuilt from corrected UI sources.',
      'SPFx rebuilds may differ bytewise. Only the exact archived candidate can receive a later installation approval.'] };
  let passed = false;
  let packageBytes;
  try {
    for (const step of commands) {
      const result = spawnSync(step.command, step.args, { cwd: target, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      const bytes = Buffer.from(`${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? String(result.error) : ''}`);
      const logPath = resolve(stage, `step-${report.steps.length + 1}.log`);
      await writeFile(logPath, bytes, { flag: 'wx' });
      const item = { label: step.label, command: relative(ROOT, step.command), args: step.args.map(arg => arg.startsWith(ROOT) ? relative(ROOT, arg) : arg),
        exitCode: result.status, signal: result.signal, log: relative(ROOT, logPath), rawLogSha256: hash(bytes) };
      report.steps.push(item);
      console.log(JSON.stringify(item));
      assert.equal(result.status, 0, `Failed build step: ${step.label}`);
    }
    assert.deepEqual(await inventory(await inputPaths()), inputsBefore, 'Product inputs changed during build');
    assert.deepEqual(await approvedData(), releaseFiles, 'Approved data or pin changed during build');
    const require = createRequire(resolve(target, 'package.json'));
    const { readPackage } = require(resolve(target, 'test-build/package-harness.cjs'));
    const emittedStyles = require(resolve(target, 'lib-commonjs/product/ui/holidayConnectionDropdown.js')).holidayConnectionDropdownStyles;
    assert.deepEqual(emittedStyles.dropdownOptionText, {
      whiteSpace: 'normal', overflow: 'visible', textOverflow: 'clip', overflowWrap: 'anywhere', minWidth: 0
    });
    for (const slot of ['dropdownItem', 'dropdownItemSelected', 'dropdownItemDisabled', 'dropdownItemSelectedAndDisabled']) {
      assert.deepEqual(emittedStyles[slot], { height: 'auto', minHeight: 36, paddingTop: 7, paddingBottom: 7 });
    }
    report.emittedHolidayDropdownStylesVerified = true;
    const builtPath = resolve(target, 'sharepoint/solution/fristenrechner-schweiz.sppkg');
    report.package = auditPackage(readPackage(builtPath), readPackage(resolve(ROOT, PRIOR_PACKAGE)));
    packageBytes = await readFile(builtPath);
    report.artifacts = [{ path: `artifacts/${PACKAGE_NAME}`, byteLength: packageBytes.length, sha256: hash(packageBytes) }];
    passed = true;
  } catch (error) {
    report.error = String(error?.stack ?? error);
  }
  // Always recheck frozen data, including after a failing compiler/test command.
  try {
    assert.deepEqual(await frozenEvidence(), frozenBefore);
    assert.deepEqual(await inventory(await tree(PRIOR_OUTPUT)), oldReleaseTree, 'Original 0.6.0.0 release tree changed');
    report.originalReleaseTreeUnchanged = true;
  } catch (error) { report.preservationError = String(error?.stack ?? error); passed = false; }
  report.passed = passed;
  report.finishedAt = new Date().toISOString();
  await writeFile(resolve(stage, 'verification.json'), json(report), { flag: 'wx' });
  if (!passed) {
    console.log(JSON.stringify({ passed: false, privateEvidence: relative(ROOT, resolve(stage, 'verification.json')), outputCreated: false }));
    process.exitCode = 1;
    return;
  }
  // No overwrite path: even an empty existing candidate directory is a stop condition.
  await assertAbsent(resolve(ROOT, OUTPUT));
  await mkdir(resolve(ROOT, OUTPUT));
  await mkdir(resolve(ROOT, OUTPUT, 'artifacts'));
  await writeFile(resolve(ROOT, OUTPUT, 'artifacts', PACKAGE_NAME), packageBytes, { flag: 'wx' });
  assert.ok(packageBytes.equals(await readFile(resolve(ROOT, OUTPUT, 'artifacts', PACKAGE_NAME))));
  report.archivedInputSnapshots = [];
  for (const input of inputsBefore) {
    const bytes = await read(input.path);
    assert.equal(hash(bytes), input.sha256, `Input changed before archival: ${input.path}`);
    const path = `${OUTPUT}/build-evidence/inputs/${input.path}`;
    await mkdir(dirname(resolve(ROOT, path)), { recursive: true });
    await writeFile(resolve(ROOT, path), bytes, { flag: 'wx' });
    assert.equal(hash(await read(path)), input.sha256);
    report.archivedInputSnapshots.push({ ...input, archivedPath: path });
  }
  report.archivedLogs = [];
  for (const [index, step] of report.steps.entries()) {
    const raw = await read(step.log);
    assert.equal(hash(raw), step.rawLogSha256);
    const sanitized = Buffer.from(raw.toString().replaceAll(ROOT, '<repository>/'));
    const path = `${OUTPUT}/build-evidence/step-${index + 1}.log`;
    await mkdir(dirname(resolve(ROOT, path)), { recursive: true });
    await writeFile(resolve(ROOT, path), sanitized, { flag: 'wx' });
    assert.equal(hash(await read(path)), hash(sanitized));
    report.archivedLogs.push({ path, byteLength: sanitized.length, sha256: hash(sanitized), rawLogSha256: step.rawLogSha256, sanitized: true });
  }
  assert.deepEqual(await frozenEvidence(), frozenBefore);
  assert.deepEqual(await inventory(await tree(PRIOR_OUTPUT)), oldReleaseTree);
  assert.deepEqual(await inventory(await inputPaths()), inputsBefore);
  await writeFile(resolve(ROOT, OUTPUT, 'artifact-verification.json'), json(report), { flag: 'wx' });
  const stored = JSON.parse(await read(`${OUTPUT}/artifact-verification.json`));
  assert.deepEqual(stored, report);
  console.log(JSON.stringify({ passed: true, candidate: `${OUTPUT}/artifacts/${PACKAGE_NAME}`,
    sha256: report.artifacts[0].sha256, evidence: `${OUTPUT}/artifact-verification.json`,
    installationAuthorized: false, originalReleaseTreeUnchanged: true }));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
