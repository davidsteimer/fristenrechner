// SPDX-License-Identifier: AGPL-3.0-only
// Archive existing local UI/visual evidence without modifying the sealed build.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { ROOT, OUTPUT, hash, verifyArchive, assertAbsent } from './build-mvp07-spfx-0702.mjs';

assert.equal(process.argv.length, 2);
const target = `${OUTPUT}/local-checks`;
await assertAbsent(resolve(ROOT, target));
const buildBytes = await readFile(resolve(ROOT, OUTPUT, 'artifact-verification.json'));
const build = JSON.parse(buildBytes);
await verifyArchive();
// Format-7 validation also compiles these two historical normative references.
// Bind them to the original build, not just the current test-fixture inventory.
const priorBuildBytes = await readFile(resolve(ROOT, 'outputs/release-mvp07-2026-10-08/build-evidence/spfx-verification.json'));
const priorBuild = JSON.parse(priorBuildBytes);
const baselineInputs = [];
for (const [name, sha256] of Object.entries({
  'ch-federal-calendar.json': 'c851d4839e06ad714aba988b6c92e9ae81c27a507cc004bf0f89046650a3c5c7',
  'be-public-holidays.json': '6051094d6179f99276cb55cad0f88e562da02c2396dffcf213d0ac165807d121'
})) {
  const path = `data/releases/2026-10-01-mvp-06-approved.1/calendars/${name}`;
  assert.equal(hash(await readFile(resolve(ROOT, path))), sha256);
  assert.equal(priorBuild.fixtureInputFiles.find(row => row.path === path)?.sha256, sha256);
  assert.equal(build.fixtureInputs.find(row => row.path === path)?.sha256, sha256);
  baselineInputs.push({ path, sha256, matchesOriginalAndCorrectionBuild: true });
}
const uiDirectory = '.work/r07c-b01-ui-verification/2026-10-09T06-16-33.608Z';
const uiBytes = await readFile(resolve(ROOT, uiDirectory, 'verification-report.json'));
assert.equal(hash(uiBytes), '65e5e93fde3af8c5ce76df41a0e541aa5361b1a629790abc3f0f08649c3fa4a5');
const ui = JSON.parse(uiBytes);
assert.equal(ui.passed, true);
assert.equal(ui.tests.exitCode, 0);
assert.equal(ui.typecheck.exitCode, 0);
assert.ok(ui.tests.summary.includes('# pass 528'));
assert.ok(ui.ast.every(row => row.identicalExceptStylesAndImports));
for (const row of ui.inputs) {
  assert.equal(hash(await readFile(resolve(ROOT, row.path))), row.sha256);
  const built = build.productInputFiles.find(input => input.path === row.path);
  if (row.path.startsWith('src/')) assert.equal(built?.sha256, row.sha256);
}
for (const row of ui.artifacts) assert.equal(hash(await readFile(resolve(ROOT, row.path))), row.sha256);
const browser = JSON.parse(await readFile(resolve(ROOT, '.work/r07c-b01-browser/observations.json')));
assert.equal(browser.actualSpfxHost, false);
assert.equal(browser.actualBrowserZoom200, false);
assert.equal(browser.cases.length, 5);
for (const entry of browser.cases) for (const option of entry.options ?? []) assert.ok(option.scrollWidth <= option.clientWidth);
const governance = spawnSync(process.execPath, ['--test', 'tests/governance/mvp07-spfx-correction.test.mjs'], {
  cwd: ROOT, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024
});
assert.equal(governance.status, 0);
const firstAttemptPath = '.work/mvp07-spfx-0702-KmC0L0/verification.json';
const firstAttemptBytes = await readFile(resolve(ROOT, firstAttemptPath));
assert.equal(hash(firstAttemptBytes), 'b6715aa24ed75be64ee62c0a6992e9fd0338ea5880c0ee9d464cae5e8230e6ef');
const firstAttempt = JSON.parse(firstAttemptBytes);
assert.equal(firstAttempt.passed, false);
assert.equal(firstAttempt.steps.length, 6);
assert.ok(firstAttempt.steps.every(step => step.exitCode === 0));
assert.match(firstAttempt.error, /Unrelated package content changed: feature_3edf1509-41e9-4a2f-8005-df510eec43b6\.xml\.config\.xml/);
const artifacts = [];
async function archive(name, bytes) {
  const path = `${target}/${name}`;
  await mkdir(dirname(resolve(ROOT, path)), { recursive: true });
  await writeFile(resolve(ROOT, path), bytes, { flag: 'wx' });
  assert.equal(hash(await readFile(resolve(ROOT, path))), hash(bytes));
  artifacts.push({ path, byteLength: bytes.length, sha256: hash(bytes) });
}
for (const name of await readdir(resolve(ROOT, uiDirectory))) {
  let bytes = await readFile(resolve(ROOT, uiDirectory, name));
  // Local absolute paths are not needed in the public-ready evidence copy.
  if (/\.(?:json|log)$/.test(name)) bytes = Buffer.from(bytes.toString().replaceAll(ROOT, '<repository>/'));
  await archive(`ui/${name}`, bytes);
}
for (const name of await readdir(resolve(ROOT, '.work/r07c-b01-browser'))) {
  assert.match(name, /^(?:observations\.json|(?:de|fr)-(?:panel-390|callout-720|wide-1280)\.jpg)$/);
  await archive(`browser/${name}`, await readFile(resolve(ROOT, '.work/r07c-b01-browser', name)));
}
for (const path of ['tests/ui/dropdown-wrapping.test.tsx', 'tests/ui/holiday-connection-dropdown.test.ts',
  'scripts/record-mvp07-0702-local-checks.mjs', '.work/r07c-b01-ui-verification/verify.mjs']) {
  await archive(`inputs/${path}`, await readFile(resolve(ROOT, path)));
}
for (const row of baselineInputs) await archive(`inputs/${row.path}`, await readFile(resolve(ROOT, row.path)));
await archive('governance-tests.txt', Buffer.from(`${governance.stdout}${governance.stderr}`));
await archive('first-attempt.json', Buffer.from(firstAttemptBytes.toString().replaceAll(ROOT, '<repository>/')
  .replaceAll(encodeURI(ROOT).replaceAll('#', '%23'), '<repository>/')));
const report = {
  kind: 'r07cB01SupplementaryLocalChecks', recordedAt: new Date().toISOString(),
  packageVersion: build.packageVersion, packageSha256: build.packageSha256,
  buildReportSha256: hash(buildBytes), uiSourceMatchesPackageInputs: true,
  historicalNormativeInputs: baselineInputs, originalBuildReportSha256: hash(priorBuildBytes),
  priorAttempt: { path: firstAttemptPath, rawSha256: hash(firstAttemptBytes),
    productTestsPassed: true, failedOnlyPackageComparison: true, error: 'Generated PartConfig GUID not initially normalised',
    preserved: true, finalCandidateRebuilt: true },
  uiTests: 528, uiTestsPassed: 528, targetedTestsIncluded: 9, typecheck: 'passed',
  governanceTests: 5, normalizedUiAstUnchanged: true, localVisualCases: 5,
  actualSpfxHostVerified: false, nativeBrowserZoom200Verified: false,
  actualDeviceVerified: false, installationAuthorized: false, deploymentPerformed: false,
  note: 'Local preview visuals and packaged-consumer tests are separate evidence. Repeat native T07 on actual E SharePoint/Teams after separately approved installation.',
  artifacts
};
await archive('verification.json', Buffer.from(`${JSON.stringify(report, null, 2)}\n`));
assert.equal(hash(await readFile(resolve(ROOT, OUTPUT, 'artifact-verification.json'))), hash(buildBytes));
console.log(JSON.stringify({ passed: true, report: `${target}/verification.json`, packageSha256: build.packageSha256 }));
