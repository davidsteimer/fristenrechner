// SPDX-License-Identifier: AGPL-3.0-only
// Exclusive local closure, never a build, commit, installation or publication.
// Every QA input is explicit. No newest-file lookup or failed-proof fallback.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { lstat, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { root, prefix, hash, encode } from './consolidate-mvp09-sources.mjs';
import { readRegular, writeExclusive } from './record-mvp09-source-approval.mjs';
import { requireR09BApproval } from './record-r09b-execution-approval.mjs';
import { verifyWiring } from './verify-mvp09-wiring.mjs';
import { verifyArchive } from './build-mvp09-recovery.mjs';
import { verifyMvp09PublicIntegrity } from './verify-mvp09-public-integrity.mjs';

const RELEASE = '2026-10-18-mvp-09-approved.1';
const COMMIT = '0ccc4b9178503ede051964149a4b17efab8d0cf9';
const PARENT = 'c37c11bc9fbf8241535d202d54c3499d2f4c3350';
const MANIFEST = '3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265';
const APPROVAL = '87d64bc998f2003cf21ea5fe4eb20abefa2b8eb056f46f5ca26f7733f8fadcd3';
const json = async path => JSON.parse(await readRegular(root, path));
const bind = async path => {const bytes = await readRegular(root, path); return {path, byteLength: bytes.length, sha256: hash(bytes)};};
const verify = async item => {
  assert.match(item.sha256, /^[a-f0-9]{64}$/);
  const actual = await bind(item.path);
  assert.equal(actual.sha256, item.sha256, `Changed evidence: ${item.path}`);
  if (item.byteLength !== undefined) assert.equal(actual.byteLength, item.byteLength, item.path);
  return actual;
};
const verifyAll = async items => {for (const item of items) await verify(item);};
const unique = (items, key = 'path') => assert.equal(new Set(items.map(item => item[key])).size, items.length, `Duplicate ${key}`);
const flagsFalse = (value, keys) => {for (const key of keys) assert.equal(value[key], false, key);};
const logText = async binding => {await verify(binding); return (await readRegular(root, binding.path)).toString();};
function requireTap(text, expected) {
  const counts = {};
  for (const key of ['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo']) {
    const matches = [...text.matchAll(new RegExp(`^# ${key} (\\d+)\\r?$`, 'gm'))];
    assert.equal(matches.length, 1, `Missing or ambiguous TAP ${key}`);
    counts[key] = Number(matches[0][1]);
  }
  assert.ok(Number.isSafeInteger(counts.tests) && counts.tests > 0);
  assert.equal(counts.pass, counts.tests);
  for (const key of ['fail', 'cancelled', 'skipped', 'todo']) assert.equal(counts[key], 0);
  if (expected !== undefined) assert.equal(counts.tests, expected);
  return counts;
}
function requireUnittest(text, expected) {
  const matches = [...text.matchAll(/^Ran (\d+) tests? in [\d.]+s\r?$/gm)];
  assert.equal(matches.length, 1, 'Missing or ambiguous Python total');
  const tests = Number(matches[0][1]); assert.ok(tests > 0);
  assert.match(text, /\nOK\s*$/);
  assert.doesNotMatch(text, /(?:^|\n)(?:FAILED|ERROR:|FAIL:)|\b(?:skipped|expected failure|unexpected success)\b/i);
  if (expected !== undefined) assert.equal(tests, expected);
  return {tests, pass: tests, fail: 0, cancelled: 0, skipped: 0, todo: 0};
}
function requireSourceSchema(text) {
  assert.match(text, /255 Quellen, davon 157 produktiv, 7 Ereignis\(sen\), 4 Ergebnisarten und 8 Negativtests/);
  return {sourceRegisterEntries: 255, productiveSourceEntries: 157, events: 7, resultKinds: 4, negativeTests: 8};
}
const git = args => {
  const result = spawnSync('git', args, {cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024});
  assert.equal(result.status, 0, result.stderr); assert.equal(result.signal, null);
  return result.stdout.trim();
};
async function tree(path) {
  const result = [];
  for (const entry of await readdir(resolve(root, path), {withFileTypes: true})) {
    assert.equal(entry.isSymbolicLink(), false, path);
    const child = `${path}/${entry.name}`;
    if (entry.isDirectory()) result.push(...await tree(child));
    else {assert.ok(entry.isFile(), child); result.push(child);}
  }
  return result.sort();
}

const qaPaths = process.argv.slice(2);
assert.ok(qaPaths.length >= 7, 'Provide explicit regression, browser, native-browser-zoom, roundtrip, artifact-negative, portability and validator-supplement reports');
assert.equal(new Set(qaPaths).size, qaPaths.length, 'Repeated QA argument');
assert.equal(await readRegular(root, `${prefix}/local-completion.json`, true), undefined, 'Never overwrite a completed closure');
const authority = await requireR09BApproval();
assert.equal(authority.sha256, APPROVAL);
assert.equal(authority.record.beforeInputs.length, 630);
const sourceApproval = await json(`${prefix}/source-approval.json`);
assert.equal((await bind(`${prefix}/source-approval.json`)).sha256, '4a05e80c0324573f83c88463ba78d20970d0d2152b76f15766bd848bc13a9c68');
assert.equal(sourceApproval.evidence.length, 803); await verifyAll(sourceApproval.evidence);
const wiring = await verifyWiring();
assert.equal(wiring.status, 'passed'); assert.equal(wiring.checkedInputs, 630);
assert.equal(wiring.coreAndUiRulesUnchanged, true); assert.equal(wiring.ux50Preserved, true);
const pin = await json(`${prefix}/local-data-pin.json`);
assert.equal(pin.releaseId, RELEASE); assert.equal(pin.commit, COMMIT); assert.equal(pin.parent, PARENT);
assert.equal(pin.manifestSha256, MANIFEST); assert.equal(pin.localOnly, true);
flagsFalse(pin, ['publicationVerified', 'installationAuthorized']);
assert.equal(git(['rev-parse', 'HEAD']), COMMIT);
assert.equal(git(['rev-parse', 'HEAD^']), PARENT);
assert.equal(git(['diff', '--cached', '--name-only']), '');
assert.equal(pin.files.length, 42); unique(pin.files);
assert.deepEqual(git(['diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD']).split('\n').sort(), pin.files.map(item => item.path).sort());
assert.deepEqual(await tree(`data/releases/${RELEASE}`), pin.files.map(item => item.path).sort());
for (const item of pin.files) {
  await verify(item);
  const blob = spawnSync('git', ['cat-file', 'blob', `${COMMIT}:${item.path}`], {cwd: root, maxBuffer: 32 * 1024 * 1024});
  assert.equal(blob.status, 0); assert.equal(blob.signal, null);
  assert.equal(hash(blob.stdout), item.sha256); assert.equal(blob.stdout.length, item.byteLength);
}
const publicIntegrity = await verifyMvp09PublicIntegrity();
const product = await json(`${prefix}/product-build.json`);
const artifacts = await json(`${prefix}/artifact-verification.json`);
const recovery = await json(`${prefix}/recovery-0.9.0.1/artifact-verification.json`);
assert.equal(product.kind, 'mvp09-local-product-build'); assert.equal(product.status, 'passed');
assert.equal(product.releaseId, RELEASE); assert.equal(product.applicationVersion, '0.9.0'); assert.equal(product.packageVersion, '0.9.0.0');
assert.equal(product.authority.sha256, APPROVAL); assert.equal(product.manifest.sha256, MANIFEST);
assert.deepEqual(product.localDataPin, pin); await verify(product.manifest); await verify(product.embedded); await verify(product.oldPackage);
flagsFalse(product, ['installationAuthorized', 'publicationAuthorized', 'actualM365TestsPerformed', 'remotePinPublicationVerified']);
for (const items of [product.inputs, product.fixtures, product.runtimeFiles, product.webFiles]) {unique(items); await verifyAll(items);}
assert.deepEqual([...product.runtimeFiles].sort((a, b) => a.path.localeCompare(b.path)), [...pin.files].sort((a, b) => a.path.localeCompare(b.path)));
for (const [liveKey, archivedKey, directory] of [['inputs', 'archivedInputs', 'inputs'], ['fixtures', 'archivedFixtures', 'fixtures']]) {
  const archived = product[archivedKey]; unique(archived); assert.equal(archived.length, product[liveKey].length);
  assert.deepEqual(archived.map(({archivedAt, ...item}) => item), product[liveKey]);
  for (const item of archived) {
    assert.equal(item.archivedAt, `${prefix}/build-evidence/${directory}/${item.path}`);
    await verify({...item, path: item.archivedAt});
  }
  assert.deepEqual(await tree(`${prefix}/build-evidence/${directory}`), archived.map(item => item.archivedAt).sort());
}
assert.equal(product.runtimeFiles.length, 42); assert.equal(product.webFiles.length, 12);
assert.deepEqual(await tree(`${prefix}/web-build`), product.webFiles.map(item => item.path).sort());
const requiredBuildSteps = ['sync', 'source-tests', 'compile', 'css-audit', 'package', 'built-tests', 'web-build'];
assert.deepEqual(product.steps.map(step => step.id), requiredBuildSteps);
const buildCounts = {};
for (const step of product.steps) {
  assert.equal(step.exitCode, 0); assert.equal(step.signal, null);
  const text = await logText(step.log);
  if (['source-tests', 'built-tests'].includes(step.id)) buildCounts[step.id] = requireTap(text);
  if (step.id === 'built-tests') {
    // This is an additional, named current-package gate, not an old total copied forward.
    assert.equal([...text.matchAll(/^# Subtest: MVP09 actual /gm)].length, 53);
    assert.equal([...text.matchAll(/^# Subtest: MVP09 actual packaged UI calculates released /gm)].length, 25);
    assert.equal([...text.matchAll(/^# Subtest: MVP09 actual AMD administrative export /gm)].length, 10);
  }
}
assert.equal(artifacts.kind, 'mvp09-local-artifact-sealing'); assert.equal(artifacts.status, 'passed');
assert.equal(artifacts.releaseId, RELEASE); assert.equal(artifacts.localDataCommit, COMMIT); assert.equal(artifacts.manifestSha256, MANIFEST);
assert.equal(artifacts.applicationVersion, '0.9.0'); assert.equal(artifacts.packageVersion, '0.9.0.0');
await verify(artifacts.authority); assert.equal(artifacts.authority.sha256, APPROVAL);
assert.deepEqual(artifacts.buildProof, await bind(`${prefix}/product-build.json`));
assert.deepEqual(artifacts.buildAudit.testCounts, buildCounts);
assert.equal(artifacts.buildAudit.productInputs, product.inputs.length); assert.equal(artifacts.buildAudit.fixtures, product.fixtures.length);
flagsFalse(artifacts, ['installationAuthorized', 'publicationAuthorized', 'operatingApproval', 'remotePinVerified', 'realM365TestsPerformed']);
const artifactBindings = await Promise.all(['fristenrechner-schweiz-0.9.0.0.sppkg', 'fristenrechner-mvp09-sharepoint-mirror.zip',
  'fristenrechner-mvp09-steimer-web.zip', 'fristenrechner-schweiz-recovery-0.9.0.1.sppkg'].map(name => bind(`${prefix}/${name}`)));
assert.deepEqual(artifactBindings.slice(0, 3), artifacts.artifacts); assert.deepEqual(product.package, artifactBindings[0]);
assert.equal((await verifyArchive()).passed, true);
assert.equal(recovery.kind, 'mvp09LocalRecoveryBuild'); assert.equal(recovery.passed, true);
assert.equal(recovery.packageVersion, '0.9.0.1'); assert.equal(recovery.applicationVersion, '0.8.0');
assert.equal(recovery.functionalBaseline, 'MVP 0.8'); assert.equal(recovery.authority.sha256, APPROVAL);
assert.equal(artifactBindings[3].sha256, recovery.packageSha256); assert.equal(artifactBindings[3].byteLength, recovery.packageByteLength);
for (const items of [recovery.archivedFiles, recovery.protectedFiles, recovery.implementation]) await verifyAll(items);
const recoveryCounts = {};
for (const step of recovery.steps) {
  assert.equal(step.exitCode, 0);
  const text = await logText({path: step.archivedLog, sha256: step.sha256});
  if (step.tests !== undefined) recoveryCounts[step.id] = requireTap(text, step.tests);
}

const kinds = new Map(), scopes = new Map(), qa = [];
const acceptedKinds = new Set(['mvp09-fresh-local-regression', 'mvp09-actual-static-browser', 'mvp09-actual-browser-settings-zoom',
  'mvp09-actual-package-recovery-roundtrip', 'mvp09-actual-artifact-and-negative-test-verification',
  'mvp09StandardTestPortabilityProof', 'r09bExactHostSupplementVerification']);
async function privateCounts(text) {
  const marker = '# Combined explicit R09 snapshot and current private checks';
  assert.equal(text.split(marker).length, 2);
  const [currentText, combinedText] = text.split(marker);
  const current = requireTap(currentText), combined = requireTap(combinedText);
  const snapshots = currentText.split('\n').filter(line => line.startsWith('{')).map(line => JSON.parse(line))
    .filter(item => item.proofPath && item.stage && item.counts);
  assert.equal(snapshots.length, 1);
  const record = snapshots[0], proof = await json(record.proofPath);
  assert.equal(proof.kind, 'mvp09-historical-source-tests'); assert.equal(proof.status, 'passed');
  assert.equal(proof.sourceReviewState, 'before-R09-B-adoption'); assert.equal(proof.currentRegistryNotSubstituted, true);
  assert.equal(proof.authority.sha256, APPROVAL); assert.equal(proof.exitCode, 0);
  flagsFalse(proof, ['liveFilesModified', 'historicalTestsModified']);
  const historical = requireTap(await logText(proof.log)); assert.deepEqual(historical, proof.counts);
  assert.deepEqual(record.counts, historical); assert.equal(proof.suites.length, 4);
  for (const item of proof.files) await verify({...item, path: `${proof.stage}/${item.path}`});
  for (const key of Object.keys(combined)) assert.equal(combined[key], historical[key] + current[key]);
  return {combined, current, historical, proof: await bind(record.proofPath)};
}
for (const path of qaPaths) {
  const value = await json(path);
  assert.ok(acceptedKinds.has(value.kind), `Unknown final proof kind: ${value.kind}`);
  assert.ok(value.status === 'passed' || value.passed === true, `Non-passing proof: ${path}`);
  if (value.kind !== 'mvp09-fresh-local-regression') assert.ok(!kinds.has(value.kind), `Repeated proof kind: ${value.kind}`);
  kinds.set(value.kind, path);
  const checked = {...await bind(path), kind: value.kind, counts: []};
  if (value.kind === 'mvp09-fresh-local-regression') {
    assert.ok(value.inputBindings.length > 0); unique(value.inputBindings); await verifyAll(value.inputBindings);
    flagsFalse(value, ['actualM365Testing', 'actualOutlookImport']);
    assert.ok(value.steps.length > 0); unique(value.steps, 'name');
    for (const step of value.steps) {
      assert.ok(!scopes.has(step.name), `Repeated final scope: ${step.name}`); assert.equal(step.exitCode, 0);
      const text = await logText(step.log); let counts;
      if (['product', 'hosts', 'public', 'governance', 'private05'].includes(step.name)) {
        counts = requireTap(text); assert.deepEqual(counts, step.counts);
      } else if (step.name === 'private') {
        const detail = await privateCounts(text); counts = detail.combined;
        assert.deepEqual(counts, step.counts); checked.historicalPrivateScope = detail;
      } else if (['sourceTests', 'dataTests'].includes(step.name)) counts = requireUnittest(text);
      else if (step.name === 'sources') counts = requireSourceSchema(text);
      else if (step.name === 'integrity') assert.deepEqual(JSON.parse(text), publicIntegrity);
      else assert.equal(step.name, 'typecheck', 'Unrecognised or historical-only scope');
      scopes.set(step.name, {counts, log: step.log}); checked.counts.push({scope: step.name, counts});
    }
  }
  if (value.kind === 'mvp09-actual-static-browser') {
    assert.deepEqual(value.webFiles, product.webFiles); await verifyAll([...value.webFiles, ...value.exports, ...value.screenshots]);
    flagsFalse(value, ['actualM365Testing', 'actualDeviceTesting', 'actualBrowserMenuZoomTesting', 'outlookImports']);
    assert.deepEqual(value.externalRequests, []); assert.deepEqual(value.pageErrors, []);
    assert.equal(value.exports.length, 2); assert.equal(value.screenshots.length, 4); assert.equal(value.checks.length, 4);
    const locales = value.checks.filter(item => item.locale); assert.deepEqual(locales.map(item => item.locale), ['de', 'fr']);
    for (const check of locales) {
      assert.equal(check.result, '2026-11-02');
      for (const key of ['download', 'staleExportRemoved', 'tiO2Blocked']) assert.equal(check[key], true);
      assert.equal(check.overflow, false); assert.equal(check.geometry.dateHeight, 32);
      assert.equal(check.geometry.dateFont, '14px'); assert.equal(check.geometry.dateAlign, 'left');
      assert.equal(check.layout.formColumns, check.locale === 'de' ? 2 : 1);
    }
    const touch = value.checks.find(item => item.kind === 'touch-emulation-not-real-device');
    assert.ok(touch); assert.equal(touch.coarse, true); assert.equal(touch.dateHeight, 44); assert.equal(touch.font, '16px'); assert.equal(touch.overflow, false);
    assert.equal(value.diagnostics.length, 1);
    const diagnostic = value.diagnostics[0];
    assert.equal(diagnostic.kind, 'author-css-zoom-not-browser-menu-zoom');
    assert.equal(diagnostic.acceptanceGate, false);
    assert.equal(diagnostic.before.cssZoom, '1'); assert.equal(diagnostic.after.cssZoom, '3');
    assert.equal(diagnostic.after.viewport.width, 1280); assert.equal(diagnostic.after.media640, false);
    // Diagnostic CSS overflow is retained, never represented as a passed zoom test.
    assert.equal(typeof diagnostic.after.overflow, 'boolean');
    const reflow = value.checks.find(item => item.kind === 'reflow-equivalent-not-browser-menu-zoom');
    assert.ok(reflow); assert.equal(reflow.cssZoom, '1'); assert.equal(reflow.overflow, false);
    assert.deepEqual(reflow.approximation.referenceViewport, {width: 1280, height: 960});
    assert.equal(reflow.approximation.targetMagnificationPercent, 300);
    assert.deepEqual(reflow.viewport, {width: 426, height: 320}); assert.equal(reflow.clientWidth, 426);
    assert.equal(reflow.devicePixelRatio, 3); assert.equal(reflow.visualViewport.scale, 1);
    assert.equal(reflow.media640, true); assert.equal(reflow.media850, true);
    assert.equal(reflow.columns, 1); assert.equal(reflow.footerColumns, 1);
    assert.ok(reflow.scrollWidth <= reflow.clientWidth + 1);
    assert.ok(reflow.bodyScrollWidth <= reflow.clientWidth + 1);
  }
  if (value.kind === 'mvp09-actual-browser-settings-zoom') {
    assert.deepEqual(value.webFiles, product.webFiles);
    assert.deepEqual(value.buildProof, await bind(`${prefix}/product-build.json`));
    assert.equal(value.script.path, 'scripts/check-mvp09-browser-zoom.mjs');
    await verifyAll([...value.webFiles, value.buildProof, value.script, ...value.screenshots]);
    const archivedScript = {...value.script, path: `${dirname(path)}/check-mvp09-browser-zoom.mjs`};
    await verify(archivedScript); checked.archivedScript = archivedScript;
    assert.equal(value.method, 'Native Chrome settings Page zoom selector, not CSS zoom, device emulation, CDP page scale or synthetic viewport resizing');
    assert.match(value.temporaryProfile, /^\.work\/mvp09-zoom-profile-[A-Za-z0-9]+$/);
    assert.equal(value.browserSettingsZoomExercised, true); assert.equal(value.temporaryProfileZoomRestored, true);
    flagsFalse(value, ['realM365Testing', 'realDeviceTesting', 'existingBrowserProfilesTouched',
      'installationPerformed', 'uploaded', 'published', 'outlookImports']);
    assert.deepEqual(value.externalRequests, []); assert.deepEqual(value.pageErrors, []);
    assert.deepEqual(value.originalSetting, {value: '1', text: '100%'});
    assert.deepEqual(value.appliedSetting, {value: '3', text: '300%'});
    for (const observed of [value.before, value.afterRestore]) {
      assert.equal(observed.viewport.width, 1280); assert.equal(observed.devicePixelRatio, 1);
      assert.equal(observed.cssZoom, '1'); assert.equal(observed.visualScale, 1);
      assert.equal(observed.media640, false); assert.equal(observed.columns, 2); assert.equal(observed.footerColumns, 3);
      assert.equal(observed.clientWidth, 1280);
      assert.ok(observed.scrollWidth <= observed.clientWidth + 1);
      assert.ok(observed.bodyScrollWidth <= observed.clientWidth + 1);
      assert.equal(observed.dateHeight, 32); assert.equal(observed.dateFont, '14px'); assert.equal(observed.dateAlign, 'left');
    }
    assert.deepEqual(value.afterRestore.viewport, value.before.viewport);
    assert.deepEqual(value.checks.map(item => item.locale), ['de', 'fr']);
    const screenshotPositions = ['de', 'fr'].flatMap(locale => ['top', 'form', 'result'].map(position => ({locale, position})));
    assert.deepEqual(value.screenshots.map(item => ({locale: item.locale, position: item.position})), screenshotPositions);
    assert.deepEqual(value.screenshots.map(item => item.path), screenshotPositions
      .map(({locale, position}) => `${dirname(path)}/${locale}-actual-browser-zoom-300-${position}.png`));
    for (const observed of value.checks) {
      assert.equal(observed.result, '2026-11-02');
      assert.ok(observed.viewport.width >= 426 && observed.viewport.width <= 427);
      assert.ok(observed.clientWidth >= 426 && observed.clientWidth <= 427);
      assert.ok(Math.abs(observed.viewport.height - value.before.viewport.height / 3) <= 1);
      assert.ok(Math.abs(observed.devicePixelRatio - 3) < 0.001);
      assert.equal(observed.cssZoom, '1'); assert.equal(observed.visualScale, 1);
      assert.equal(observed.media640, true); assert.equal(observed.columns, 1); assert.equal(observed.footerColumns, 1);
      assert.ok(observed.scrollWidth <= observed.clientWidth + 1);
      assert.ok(observed.bodyScrollWidth <= observed.clientWidth + 1);
      assert.equal(observed.dateHeight, 32); assert.equal(observed.dateFont, '14px'); assert.equal(observed.dateAlign, 'left');
    }
    for (const screenshot of value.screenshots) {
      const {locale, result, ...expectedViewport} = value.checks.find(item => item.locale === screenshot.locale);
      assert.deepEqual(screenshot.viewport, expectedViewport);
      assert.deepEqual(screenshot.pixels, {width: 1280, height: 873});
      const png = await readRegular(root, screenshot.path);
      assert.deepEqual(png.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      assert.equal(png.toString('ascii', 12, 16), 'IHDR');
      assert.deepEqual({width: png.readUInt32BE(16), height: png.readUInt32BE(20)}, screenshot.pixels);
    }
  }
  if (value.kind === 'mvp09-actual-package-recovery-roundtrip') {
    assert.deepEqual(value.normalPackage, artifactBindings[0]); assert.deepEqual(value.recoveryPackage, artifactBindings[3]);
    assert.equal(value.authority.sha256, APPROVAL); assert.equal(value.subsequentRealMvp09PackageMustExceed, '0.9.0.1');
    flagsFalse(value, ['installationAuthorized', 'actualDeploymentPerformed', 'publicationAuthorized', 'browserDataResetPerformed']);
    assert.deepEqual(value.cases, ['LU administrative V5', 'ZG administrative V5', 'AR five-day administrative V5',
      'corrupt V5 slot', 'future V5 slot', 'V5 reset marker', 'compatible federal V5']);
    await verifyAll([...value.inputs, ...value.archivedFiles]); assert.equal(value.steps.length, 1);
    const step = value.steps[0]; assert.equal(step.exitCode, 0); assert.equal(step.tests, 7);
    const log = value.archivedFiles.find(item => item.path === `${prefix}/recovery-roundtrip/inputs/${step.log}`);
    assert.ok(log); assert.equal(log.sha256, step.sha256); checked.counts.push({scope: 'roundtrip', counts: requireTap(await logText(log), 7)});
    for (const item of value.inputs) {
      const archived = value.archivedFiles.find(row => row.path === `${prefix}/recovery-roundtrip/inputs/${item.path}`);
      assert.ok(archived); assert.equal(archived.sha256, item.sha256); assert.equal(archived.byteLength, item.byteLength);
    }
  }
  if (value.kind === 'mvp09-actual-artifact-and-negative-test-verification') {
    assert.deepEqual(value.artifacts, artifactBindings.slice(0, 3)); await verifyAll(value.inputs);
    assert.equal(value.inputsUnchanged, true); assert.equal(value.exitCode, 0); assert.equal(value.tests, 33);
    for (const key of ['failures', 'errors', 'skipped']) assert.equal(value[key], 0);
    flagsFalse(value, ['installationPerformed', 'uploaded', 'published']);
    checked.counts.push({scope: 'actual-artifact-negative', counts: requireUnittest(await logText(value.log), 33)});
  }
  if (value.kind === 'mvp09StandardTestPortabilityProof') {
    await verify(value.inputInventory); const inventory = await json(value.inputInventory.path);
    assert.equal(inventory.kind, 'mvp09ClosedStandardPortabilityInputs');
    assert.match(inventory.stage, /^\.work\/mvp09-standard-no-private-[A-Za-z0-9]+$/);
    assert.equal(value.inputCount, inventory.files.length); unique(inventory.files);
    assert.deepEqual(value.scope, ['product', 'governance', 'source-schema', 'python-governance']);
    for (const key of ['isolatedInputBytesVerifiedBeforeAndAfter', 'noTestsSkipped', 'standardSuiteSelectionUnchanged']) assert.equal(value[key], true);
    flagsFalse(value, ['currentR09ArchivesPresent', 'privateRawSourceOriginalsPresent', 'gitPresent', 'hostingBackupsPresent',
      'noOfficialFullTextsClaimed', 'installationPerformed', 'uploaded', 'published']);
    flagsFalse(inventory, ['noOfficialFullTextsClaimed', 'publicationReviewPerformed', 'privateRawEvidenceIncluded',
      'currentR09ArchivesIncluded', 'gitIncluded', 'hostingBackupsIncluded']);
    assert.equal(inventory.excludedHistoricalOriginalPaths.length, 34);
    assert.deepEqual(value.retainedHistoricalPublicFullTextFixture, inventory.retainedHistoricalPublicFullTextFixture);
    for (const item of inventory.files) {
      assert.ok(!inventory.excludedHistoricalOriginalPaths.includes(item.path));
      assert.doesNotMatch(item.path, /(?:^|\/)(?:\.git|Userinput|private|arbeitskopien|raw|\.ssh|\.aws)(?:\/|$)|\.private\.|backup|\.har(?:\.|$)|outputs\/(?:release|recovery)-mvp09/i);
      await verify(item); await verify({...item, path: `${inventory.stage}/${item.path}`});
    }
    await verify(inventory.retainedHistoricalPublicFullTextFixture);
    const absent = ['.git', 'Userinput', 'private', 'tests/private', prefix, ...inventory.excludedHistoricalOriginalPaths];
    assert.deepEqual(value.absentAfterExecution, absent);
    for (const path of absent) await assert.rejects(lstat(resolve(root, inventory.stage, path)), {code: 'ENOENT'});
    assert.deepEqual(value.executions.map(item => item.result.scope), ['governance', 'product']);
    const portableSteps = [];
    for (const execution of value.executions) {
      await verify(execution); assert.deepEqual(await json(execution.path), execution.result);
      const run = execution.result; assert.equal(run.kind, 'mvp09StandardPortabilityExecution');
      assert.equal(run.passed, true); assert.equal(run.stage, inventory.stage); assert.equal(run.inputCount, inventory.files.length);
      assert.equal(run.inputsVerifiedBeforeAndAfter, true); flagsFalse(run, ['privateSourceAuditClaimed', 'operationalAcceptanceClaimed']);
      for (const step of run.steps) {
        assert.equal(step.exitCode, 0); assert.equal(step.passed, true); const text = await logText(step.log); let counts;
        if (['governance-node', 'product'].includes(step.id)) {counts = requireTap(text); assert.deepEqual(counts, step.counts);}
        else if (step.id === 'governance-python') {counts = requireUnittest(text); assert.equal(counts.tests, step.tests);}
        else {assert.equal(step.id, 'governance-schema'); counts = requireSourceSchema(text);}
        portableSteps.push(step.id); checked.counts.push({scope: step.id, counts});
      }
    }
    assert.deepEqual(portableSteps, ['governance-node', 'governance-schema', 'governance-python', 'product']);
  }
  if (value.kind === 'r09bExactHostSupplementVerification') {
    assert.equal(value.originalValidatorSha256, '9bab48baa0c91cf0d6732775dec1f2a49ce4a3ee992d565b12977e43a93b729c');
    const authorities = {'docs/betrieb/nachtrag-r09-b-quellenvalidator.md': '1c60d628d7ab3ce1340bbd7d633f23c3baae7d04e616a7ae53a699094b0703d0',
      'docs/betrieb/freigabe-r09-b-quellenvalidator.md': 'dcb688ccaaaf40046c7958484b44e65611928ac652945677fdf90f39d59c2057'};
    assert.deepEqual(Object.fromEntries(value.authority.map(item => [item.path, item.sha256])), authorities);
    await verifyAll([...value.authority, value.beforeInventory, value.validator, value.afterCopy, value.testsCopy, ...value.inputBindings]);
    assert.equal(value.validator.path, 'tests/governance/validate_source_reviews.py');
    const before = await json(value.beforeInventory.path); await verify(before.beforeCopy);
    assert.equal(before.beforeCopy.sha256, value.originalValidatorSha256); assert.deepEqual(before.authority, value.authority);
    const addition = '    # R09-B supplement: exact AR materials host checked in accepted R09-A2.\n    "ar.ch",\n';
    const current = (await readRegular(root, value.validator.path)).toString();
    assert.equal(current.split(addition).length, 2);
    assert.equal(current.replace(addition, ''), (await readRegular(root, before.beforeCopy.path)).toString());
    assert.equal(value.afterCopy.sha256, value.validator.sha256);
    assert.equal(value.testsCopy.sha256, (await bind('tests/governance/test_source_reviews_mvp09_host.py')).sha256);
    for (const item of before.inputs) if (item.path !== value.validator.path) await verify(item);
    assert.equal(value.protectedInputsUnchanged, before.inputs.length - 1);
    assert.deepEqual(value.authorisedDelta, {exactOfficialHostAdded: 'ar.ch', provenanceCommentAdded: true, urlParsingUnchanged: true,
      wildcardsAdded: false, subdomainsAdded: false, otherValidatorBytesUnchanged: true});
    flagsFalse(value, ['legalDataChanged', 'historicalEvidenceChanged', 'commitCreated', 'deploymentPerformed', 'uploadPerformed', 'githubPushPerformed']);
    assert.deepEqual(value.executions.map(step => step.id), ['exact-host-tests', 'source-semantic-schema', 'python-governance']);
    for (const step of value.executions) {
      assert.equal(step.exitCode, 0); assert.equal(step.signal, null); assert.equal(step.passed, true);
      const text = await logText(step.log), counts = step.id === 'source-semantic-schema' ? requireSourceSchema(text) : requireUnittest(text);
      if (step.count !== null) assert.equal(counts.tests, step.count);
      checked.counts.push({scope: step.id, counts});
    }
  }
  qa.push(checked);
}
const requiredScopes = ['typecheck', 'product', 'hosts', 'public', 'governance', 'private', 'private05', 'sources', 'sourceTests', 'dataTests', 'integrity'];
assert.deepEqual([...scopes.keys()].sort(), requiredScopes.sort());
for (const kind of acceptedKinds) assert.ok(kinds.has(kind), `Missing mandatory proof: ${kind}`);
const portable = qa.find(item => item.kind === 'mvp09StandardTestPortabilityProof');
for (const [portableScope, localScope] of [['product', 'product'], ['governance-node', 'governance'], ['governance-python', 'sourceTests']])
  assert.deepEqual(portable.counts.find(item => item.scope === portableScope).counts, scopes.get(localScope).counts);
const data = await json(`${prefix}/data-verification.json`);
assert.equal(data.kind, 'mvp09IndependentLocalDataVerification'); assert.equal(data.passed, true);
assert.equal(data.manifestSha256, MANIFEST); assert.equal(data.inputsUnchanged, true); await verifyAll(data.inputs);
for (const step of data.steps) {
  assert.equal(step.exitCode, 0); assert.equal(step.passed, true); const text = await logText(step.log);
  if (step.id === 'public-data-tests') assert.deepEqual(requireTap(text), step.counts);
  if (step.id === 'independent-negative-tests') requireUnittest(text, step.tests);
}
const evidenceNames = ['artifact-verification.json', 'product-build.json', 'data-verification.json', 'data-promotion.json',
  'source-governance-adoption.json', 'source-version-bridges.json', 'administrative-reference-suite.json',
  'local-data-pin.json', 'recovery-0.9.0.1/artifact-verification.json'];
// Final live recheck immediately before sealing. No post-build fixture exception.
await verifyAll([...product.inputs, ...product.fixtures, ...product.runtimeFiles, ...product.webFiles, ...artifactBindings]);
assert.deepEqual(await verifyWiring(), wiring); assert.equal(git(['rev-parse', 'HEAD']), COMMIT);
assert.equal(git(['diff', '--cached', '--name-only']), '');
const report = {kind: 'mvp09-r09b-local-completion', recordedAt: new Date().toISOString(), status: 'passed',
  authority: {path: authority.path, sha256: authority.sha256}, closureTool: await bind('scripts/finalize-mvp09-local.mjs'),
  releaseId: RELEASE, applicationVersion: '0.9.0', packageVersion: '0.9.0.0', recoveryPackageVersion: '0.9.0.1',
  recoveryFunctionality: 'MVP 0.8', dataCommit: COMMIT, parent: PARENT, additionalCommits: 0,
  dataManifest: await bind(`data/releases/${RELEASE}/manifest.json`), artifacts: artifactBindings,
  wiring, publicIntegrity, buildCounts, recoveryCounts, productInputs: product.inputs.length, fixtureInputs: product.fixtures.length,
  builtProductAndFixturesUnchanged: true, postBuildFixtureExceptions: [], finalChecks: qa,
  evidence: await Promise.all(evidenceNames.map(name => bind(`${prefix}/${name}`))),
  installationPerformed: false, uploadsPerformed: false, githubPushPerformed: false, outlookImportsPerformed: false,
  operationalApprovalGranted: false, realM365TestsPerformed: false, realDeviceTestsPerformed: false,
  localBrowserSettingsZoomPerformed: true,
  remoteDataPinPublicationVerified: false,
  remaining: ['R09-C concrete E/Q site, package, mirror and recovery approval', 'Actual E/Q tests and human acceptance',
    'Separate Outlook reuse decision or authorised new import', 'Public positive list and GitHub publication approval',
    'Separate production deployment and header/cache risk decision']};
await writeExclusive(root, `${prefix}/local-completion.json`, encode(report));
console.log(JSON.stringify({report: await bind(`${prefix}/local-completion.json`), artifacts: artifactBindings,
  dataCommit: COMMIT, protectedInputs: wiring.checkedInputs, postBuildFixtureExceptions: [], buildCounts}, null, 2));
