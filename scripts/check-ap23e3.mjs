// SPDX-License-Identifier: AGPL-3.0-only
// Local evidence aggregation. Never rewrites historical proof or release data.
import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = 'outputs/ap23e3-2026-10-18';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => readFile(resolve(root, path));
const json = async path => JSON.parse(await read(path));
async function bind(path) {
  const bytes = await read(path);
  return { path, byteLength: bytes.length, sha256: sha(bytes) };
}
async function matches(ref, prefix = '') {
  const actual = await bind(prefix + ref.path);
  assert.equal(actual.sha256, ref.sha256, prefix + ref.path);
  if (ref.byteLength !== undefined) assert.equal(actual.byteLength, ref.byteLength);
  return actual;
}
async function tree(dir) {
  const paths = [];
  for (const e of await readdir(resolve(root, dir), {withFileTypes: true})) {
    if (e.isDirectory()) paths.push(...await tree(dir + '/' + e.name));
    else if (e.isFile()) paths.push(dir + '/' + e.name);
  }
  return paths.sort();
}
function tap(text) {
  const result = {};
  for (const key of ['tests', 'pass', 'fail', 'skipped', 'todo']) {
    const match = new RegExp('^# ' + key + ' (\\d+)$', 'm').exec(text);
    assert.ok(match, 'Missing TAP ' + key);
    result[key] = Number(match[1]);
  }
  assert.equal(result.fail, 0);
  assert.equal(result.skipped, 0);
  assert.equal(result.todo, 0);
  assert.equal(result.tests, result.pass);
  return result;
}
async function run(name, args, isTap = false) {
  const result = spawnSync(process.execPath, args, {cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
  const path = output + '/' + name + '.txt';
  const text = (result.stdout ?? '') + (result.stderr ?? '');
  await writeFile(resolve(root, path), text);
  assert.equal(result.status, 0, name + ': ' + text.slice(-4000));
  return {name, command: args, exitCode: result.status, log: await bind(path), ...(isTap ? tap(text) : {})};
}

const receiptPath = 'outputs/ap23e2-abnahme-2026-10-18/receipt.json';
assert.equal(sha(await read(receiptPath)), '6f689865002918aeecbd5f57c4d79fb07b595eea937aeb88a72081938b7798e3');
const receipt = await json(receiptPath);
for (const ref of receipt.artifacts) await matches(ref, 'outputs/ap23e2-abnahme-2026-10-18/');
const preserved = receipt.artifacts.filter(ref => !ref.path.startsWith('src/'));
for (const ref of preserved) await matches(ref);
for (const path of ['src/ui/styles.css', 'src/core/dayDeadlineArithmetic.ts', 'src/public-app/main.tsx']) {
  const ref = receipt.artifacts.find(item => item.path === path);
  assert.ok(ref, path); await matches(ref);
}

const core = await json(output + '/core-sweep-1-report.json');
assert.equal(core.allCommandsPassed, true);
assert.deepEqual(core.changedDuringRun, []);
for (const ref of core.afterFiles) await matches(ref);
for (const run of core.runs) await matches({path: output + '/' + run.log, sha256: run.sha256});
const publicLog = output + '/public-app-regression-r2.log';
const publicTests = tap((await read(publicLog)).toString());

const spfx = await json(output + '/spfx-build.json');
assert.equal(spfx.status, 'passed');
assert.equal(spfx.deployable, false);
assert.equal(spfx.operatingPackagePreserved, true);
assert.deepEqual(spfx.protectedBefore, spfx.protectedAfter);
for (const ref of spfx.protectedAfter) await matches(ref);
await matches(spfx.testPackage);
const spfxSteps = [];
for (const step of spfx.steps) {
  assert.equal(step.exitCode, 0);
  const text = (await read(step.log)).toString();
  spfxSteps.push({...step, logBinding: await bind(step.log), ...(text.includes('# tests ') ? tap(text) : {})});
}
// Check the copied host and test files against this checkout. Generated product
// sources and schemas have their own byte-level synchronisation tests.
const spfxPaths = [...await tree('spfx/src/core'), ...await tree('spfx/src/webparts'),
  ...await tree('spfx/test'), ...await tree('spfx/test-build')]
  .filter(path => !path.startsWith('spfx/src/core/schemas/'));
for (const path of spfxPaths) {
  assert.deepEqual(await read(path), await read(spfx.stage + '/' + path), 'Build copy mismatch: ' + path);
}

const web = await json(output + '/web-build.json');
assert.equal(web.status, 'passed'); assert.equal(web.deployable, false);
for (const ref of [...web.protectedAfter, ...web.artifacts]) await matches(ref);
const browser = await json(output + '/browser-evidence.json');
assert.deepEqual(browser.browserErrors, []);
assert.equal(browser.narrowMetrics.viewport, 390);
assert.equal(browser.narrowMetrics.scrollWidth, 390);
assert.equal(browser.wideMetrics.viewport, browser.wideMetrics.scrollWidth);

const additionalRuns = [
  await run('candidate-check', ['--import', 'tsx', 'scripts/build-ap23e3-candidate.ts', '--check']),
  await run('host-tests', ['--import', 'tsx', '--test', ...await tree('tests/hosts')], true),
  await run('final-typecheck', ['node_modules/typescript/bin/tsc', '--noEmit'])
];
const inputPaths = [...new Set([...core.afterFiles.map(ref => ref.path), ...spfxPaths,
  ...await tree('tests/hosts'), ...await tree('tests/public-app'),
  'scripts/check-ap23e3.mjs', 'scripts/build-ap23e3-public.mjs', 'scripts/build-ap23e3-spfx.mjs',
  'scripts/build-ap23e3-candidate.ts', 'scripts/build-public-app.mjs', 'spfx/scripts/sync-schemas.mjs',
  'spfx/package.json', 'spfx/tsconfig.json', 'spfx/config/package-solution.json',
  'docs/architektur/verwaltungsintegration-ap23e3.md', 'docs/fachrecht/abnahme-ap23e2.md',
  'docs/architektur/README.md', 'docs/fachrecht/README.md', 'docs/entscheidungen/README.md',
  'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md'])].sort();
const inputs = await Promise.all(inputPaths.map(bind));
const evidencePaths = [...await tree(output), ...await tree('outputs/ap23e3-candidate-2026-10-18')]
  .filter(path => path !== output + '/QA-AP23E3.json');
const report = {
  workPackage: 'AP23E3', checkedOn: '2026-10-18', status: 'passed', localOnly: true,
  humanAcceptance: 'pending', sourceReleaseApproved: false, deployable: false,
  productCommit: spawnSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).stdout.trim(),
  protectedE2Snapshot: {receipt: await bind(receiptPath), files: receipt.artifacts.length,
    currentHistoricalFilesUnchanged: preserved.length},
  core: {report: await bind(output + '/core-sweep-1-report.json'), runs: core.runs},
  publicTests: {...publicTests, log: await bind(publicLog)}, spfxSteps,
  localTestPackage: spfx.testPackage, additionalRuns,
  browserEvidence: await bind(output + '/browser-evidence.json'),
  qualification: {newPaths:13, preservedPaths:12, federalBindings:104, bernSocialBindings:50,
    socialRules:44, referenceCases:51},
  inputs, inputTreeSha256: sha(inputs.map(ref => ref.path + '\0' + ref.sha256 + '\n').join('')),
  evidence: await Promise.all(evidencePaths.map(bind)),
  exclusions: ['No live M365 test', 'No real device test', 'No release promotion', 'No upload', 'No commit', 'No GitHub push', 'No deployment']
};
await writeFile(resolve(root, output, 'QA-AP23E3.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({status:report.status, productTests:core.runs[0].tests, publicTests:publicTests.tests,
  inputs:inputs.length, evidence:report.evidence.length, file:output+'/QA-AP23E3.json'}));
