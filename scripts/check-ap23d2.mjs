// SPDX-License-Identifier: AGPL-3.0-only
// Local D2 proof only. No source promotion, SPFx/Web package or deployment.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { execFileSync, spawn } from 'node:child_process';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const outputPath = 'outputs/ap23d2-2026-10-15';
const output = resolve(root, outputPath);
const write = process.argv.includes('--write');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
assert.match(process.version, /^v22\./, 'Use the project Node 22 toolchain');
assert.ok(process.argv.slice(2).every(arg => arg === '--write'), 'Only --write is supported');

async function bytesAt(path) { return readFile(resolve(root, path)); }
async function descriptor(path) {
  const bytes = await bytesAt(path);
  return { path, byteLength: bytes.length, sha256: sha(bytes) };
}
async function assertDescriptor(item, prefix = '') {
  assert.equal(typeof item.path, 'string');
  const bytes = await bytesAt(prefix + item.path);
  assert.equal(bytes.length, item.byteLength, `Length changed: ${prefix}${item.path}`);
  assert.equal(sha(bytes), item.sha256, `Hash changed: ${prefix}${item.path}`);
}
async function listFiles(path) {
  const entries = await readdir(resolve(root, path), { withFileTypes: true });
  const lists = await Promise.all(entries.map(entry => {
    assert.ok(!entry.isSymbolicLink(), `Unexpected symlink: ${path}/${entry.name}`);
    return entry.isDirectory() ? listFiles(`${path}/${entry.name}`) : [`${path}/${entry.name}`];
  }));
  return lists.flat().sort();
}

const d1Path = 'outputs/ap23d1-2026-10-14/QA-AP23D1.json';
const d1Sha = 'f7a24dd9c88833dfab293e465ce4274b5417826062211294c194ee73f04aac6e';
const d1Archive = 'outputs/ap23d1-abnahme-2026-10-15/';
const cPath = 'outputs/ap23c-vertrag-2026-10-14/QA-AP23C.json';
const cSha = '3db2767c9c58a0adbf86828a1e0211ccd18d321b1d44b3e87d515cb4755b1328';
async function preservedEvidence() {
  const d1Bytes = await bytesAt(d1Path);
  assert.equal(sha(d1Bytes), d1Sha, 'Original AP23D1 QA changed');
  assert.equal(sha(await bytesAt(d1Archive + d1Path)), d1Sha, 'Archived AP23D1 QA changed');
  const d1 = JSON.parse(d1Bytes);
  assert.equal(d1.artifacts.length, 24, 'Unexpected AP23D1 historical inventory');
  for (const item of d1.artifacts) await assertDescriptor(item, d1Archive);
  const logNames = { types: 'typecheck', d1: 'd1-tests', legacyEquivalence: 'legacy-equivalence', product: 'product-regression' };
  for (const [key, name] of Object.entries(logNames)) {
    const path = `outputs/ap23d1-2026-10-14/${name}.txt`;
    assert.equal(sha(await bytesAt(path)), d1.runs[key].outputSha256, `Original D1 log changed: ${name}`);
    assert.equal(sha(await bytesAt(d1Archive + path)), d1.runs[key].outputSha256, `Archived D1 log changed: ${name}`);
  }
  const frozenImplementation = d1.artifacts.filter(item => /^(src\/core\/|schemas\/implementation\/ap23d1\/|tests\/core\/ap23d1|scripts\/check-ap23d1)/.test(item.path));
  for (const item of frozenImplementation) await assertDescriptor(item);
  assert.equal(frozenImplementation.filter(item => item.path.startsWith('src/core/')).length, 6);
  const archiveFiles = await listFiles(d1Archive.replace(/\/$/, ''));
  const expectedArchive = [...d1.artifacts.map(item => d1Archive + item.path), d1Archive + d1Path,
    ...Object.values(logNames).map(name => `${d1Archive}outputs/ap23d1-2026-10-14/${name}.txt`)].sort();
  assert.deepEqual(archiveFiles, expectedArchive, 'Unexpected D1 archive inventory');
  const cBytes = await bytesAt(cPath);
  assert.equal(sha(cBytes), cSha, 'AP23C QA changed');
  const c = JSON.parse(cBytes);
  for (const item of c.artifacts) await assertDescriptor(item);
  return { ap23d1: { reportPath: d1Path, reportSha256: d1Sha, archive: d1Archive, archivedArtifacts: d1.artifacts.length,
    archivedLogs: Object.keys(logNames).length, immutableCurrentImplementationFiles: frozenImplementation.length },
  ap23c: { reportPath: cPath, reportSha256: cSha, artifacts: c.artifacts.length } };
}

const protectedDirectories = ['data/releases', 'src/providers', 'spfx', 'public-app', 'src/public-app'];
const protectedTracked = [...protectedDirectories, 'schemas'];
function protectedPaths() {
  const changed = execFileSync('git', ['diff', '--name-only', 'HEAD', '--', ...protectedTracked], { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(changed, '', `Out-of-scope tracked files changed: ${changed}`);
  const added = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', ...protectedDirectories], { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(added, '', `Out-of-scope untracked files created: ${added}`);
  execFileSync('git', ['diff', '--check'], { cwd: root, encoding: 'utf8' });
}

const browserPath = `${outputPath}/browser-evidence.json`;
async function browserEvidence() {
  const evidence = JSON.parse(await bytesAt(browserPath));
  assert.equal(evidence.kind, 'ap23d2-browser-evidence');
  assert.equal(evidence.date, '2026-10-15');
  assert.equal(evidence.scope, 'local-preview');
  assert.equal(evidence.status, 'passed', 'Actual local browser proof must have passed');
  assert.ok(Array.isArray(evidence.checks) && evidence.checks.length > 0, 'Missing browser observations');
  assert.equal(new Set(evidence.checks.map(check => check.id)).size, evidence.checks.length, 'Duplicate browser check IDs');
  for (const check of evidence.checks) {
    assert.ok(typeof check.id === 'string' && check.id.trim());
    assert.equal(check.passed, true, `Browser check not passed: ${check.id}`);
    assert.ok(typeof check.evidence === 'string' && check.evidence.trim(), `Missing observation: ${check.id}`);
  }
  assert.ok(Array.isArray(evidence.limitations) && evidence.limitations.length > 0, 'State browser-proof limitations explicitly');
  assert.ok(evidence.limitations.every(value => typeof value === 'string' && value.trim()));
  assert.ok(Array.isArray(evidence.artifacts) && evidence.artifacts.length > 0, 'Missing actual browser artifacts');
  for (const item of evidence.artifacts) {
    assert.equal(typeof item.path, 'string');
    assert.ok(item.path.startsWith(`${outputPath}/`) && !item.path.split('/').includes('..'), 'Browser evidence must stay in the local QA folder');
    assert.ok(/^[a-f0-9]{64}$/.test(item.sha256));
    assert.ok(Number.isInteger(item.byteLength) && item.byteLength > 0);
    await assertDescriptor(item);
  }
  return evidence;
}

async function run(name, args, countTests = false) {
  const chunks = [];
  const child = spawn(process.execPath, args, { cwd: root, env: { ...process.env, FORCE_COLOR: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', chunk => chunks.push(chunk));
  child.stderr.on('data', chunk => chunks.push(chunk));
  const code = await new Promise((done, reject) => { child.on('error', reject); child.on('close', done); });
  const text = Buffer.concat(chunks).toString('utf8');
  if (write) { await mkdir(output, { recursive: true }); await writeFile(resolve(output, `${name}.txt`), text); }
  if (code !== 0) { console.error(text.split('\n').slice(-20).join('\n')); throw new Error(`${name} failed (${code}), see ${outputPath}/${name}.txt`); }
  let counts;
  if (countTests) {
    const readCount = label => {
      const matches = [...text.matchAll(new RegExp(`^# ${label} (\\d+)\\r?$`, 'gm'))];
      assert.equal(matches.length, 1, `Missing or ambiguous ${label} count in ${name}`);
      return Number(matches[0][1]);
    };
    counts = { tests: readCount('tests'), passed: readCount('pass'), failed: readCount('fail'),
      cancelled: readCount('cancelled'), skipped: readCount('skipped'), todo: readCount('todo') };
    assert.ok(counts.tests > 0, `Empty suite ${name}`);
    assert.equal(counts.passed, counts.tests, `Not all tests passed in ${name}`);
    for (const key of ['failed', 'cancelled', 'skipped', 'todo']) assert.equal(counts[key], 0, `${key} tests in ${name}`);
  }
  console.log(`${name}: passed${counts ? ` (${counts.tests} tests)` : ''}`);
  return { summary: { command: ['node', ...args], passed: true, ...(counts ? { counts } : {}),
    outputPath: `${outputPath}/${name}.txt`, outputSha256: sha(text) }, text };
}

const frozen = await preservedEvidence();
protectedPaths();
const browser = await browserEvidence();
async function d2TestFiles() {
  return (await Promise.all(['tests/core', 'tests/ui'].map(async directory =>
    (await readdir(resolve(root, directory))).filter(name => /^ap23d2-.*\.test\.tsx?$/.test(name)).sort().map(name => `${directory}/${name}`)))).flat().sort();
}
const testFiles = await d2TestFiles();
assert.ok(testFiles.some(path => path.startsWith('tests/core/')) && testFiles.some(path => path.startsWith('tests/ui/')), 'Missing D2 core/UI test inventory');
const documents = ['docs/fachrecht/abnahme-ap23d1.md', 'docs/architektur/verwaltungsintegration-ap23d2.md'];
const indexes = ['README.md', 'docs/architektur/README.md', 'docs/fachrecht/README.md', 'docs/entscheidungen/README.md'];
const integrityPath = 'outputs/ap23d2-candidate-2026-10-15/bundle-integrity.json';
const integrity = JSON.parse(await bytesAt(integrityPath));
assert.equal(integrity.kind, 'ap23d2-local-reference-bundle');
assert.equal(integrity.releaseStatus, 'candidate');
assert.equal(integrity.sourceReview, 'pending');
assert.equal(integrity.sourceReleaseApproved, false);
assert.equal(integrity.referenceOnly, true);
assert.equal(integrity.calendarExportEnabled, false);
assert.equal(integrity.artifacts.length, 41);
const bundleDescriptors = [integrity.manifest, ...integrity.artifacts, integrity.previewModule];
for (const item of bundleDescriptors) await assertDescriptor(item);
assert.deepEqual(await listFiles('outputs/ap23d2-candidate-2026-10-15/bundle'),
  [integrity.manifest.path, ...integrity.artifacts.map(item => item.path)].sort(), 'Candidate bundle inventory differs');
const paths = [...new Set([...documents, ...indexes, 'package.json',
  'src/ui/FristenrechnerApp.tsx', 'src/ui/preview/main.tsx', 'src/ui/administrativeDefaults.ts',
  'src/ui/administrativeUi.tsx', 'src/ui/administrativeMessages.ts', 'src/ui/administrativeExport.ts', 'src/ui/calendarExport.ts',
  'src/release/ap23d2CandidateData.ts', 'scripts/build-ap23d2-candidate.ts', 'scripts/check-ap23d2.mjs',
  ...testFiles, 'tests/ui/calendar-export.test.ts', 'tests/ui/ap22c3-host-policy.test.tsx',
  `${outputPath}/product-regression-initial-harness-failure.txt`, integrityPath, ...bundleDescriptors.map(item => item.path),
  browserPath, ...browser.artifacts.map(item => item.path)])].sort();
const artifacts = await Promise.all(paths.map(descriptor));
const runs = {};
runs.types = (await run('typecheck', ['node_modules/typescript/bin/tsc', '--noEmit'])).summary;
const builder = await run('candidate-reproduction', ['--import', 'tsx', 'scripts/build-ap23d2-candidate.ts', '--check']);
const reproduced = JSON.parse(builder.text);
assert.equal(reproduced.mode, 'check');
assert.equal(reproduced.artifacts, 41);
assert.equal(reproduced.manifestSha256, integrity.manifest.sha256);
runs.candidateReproduction = builder.summary;
runs.d2 = (await run('d2-tests', ['--import', 'tsx', '--test', ...testFiles], true)).summary;
const legacy = await run('legacy-equivalence', ['--import', 'tsx', 'scripts/check-ap23d1-legacy-equivalence.mjs']);
const legacyResult = JSON.parse(legacy.text);
assert.equal(legacyResult.status, 'passed');
assert.equal(legacyResult.comparisons, 1584);
runs.legacyEquivalence = { ...legacy.summary, comparisons: legacyResult.comparisons, baselineCommit: legacyResult.baselineCommit,
  baselineSourceSha256: legacyResult.baselineSourceSha256, scope: legacyResult.scope };
runs.product = (await run('product-regression', ['scripts/run-standard-tests.mjs', 'product'], true)).summary;
await preservedEvidence();
protectedPaths();
await browserEvidence();
let links = 0;
for (const path of documents) {
  const text = await readFile(resolve(root, path), 'utf8');
  assert.ok(!text.includes('ß'), path);
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].replace(/^<|>$/g, '').split('#')[0];
    if (!target || /^(https?:|mailto:)/.test(target)) continue;
    const destination = resolve(root, dirname(path), target);
    if (relative(root, destination) === `${outputPath}/QA-AP23D2.json`) continue;
    await stat(destination); links++;
  }
}
for (const item of artifacts) await assertDescriptor(item);
assert.deepEqual(await d2TestFiles(), testFiles, 'D2 test inventory changed during validation');
assert.deepEqual(await listFiles('outputs/ap23d2-candidate-2026-10-15/bundle'),
  [integrity.manifest.path, ...integrity.artifacts.map(item => item.path)].sort(), 'Candidate file inventory changed during validation');
const report = {
  kind: 'ap23d2-implementation-qa', date: '2026-10-15', status: 'ready-for-technical-acceptance', accepted: false,
  contractDecision: 'DEC-2026-032', contractApproved: true, ap23d1Accepted: true,
  localCandidateImplemented: true, localUiImplemented: true, hostIntegrated: false,
  sourceReleaseApproved: false, releaseBuilt: false, deployment: false, published: false,
  environment: { node: process.version, scope: 'Local candidate, genuine core/UI, browser preview and standard product regression. No SPFx/Web release package, E/Q/P, real-device or guest approval.' },
  preservedEvidence: frozen,
  candidate: { releaseId: integrity.releaseId, manifestSha256: integrity.manifest.sha256, artifacts: integrity.artifacts.length,
    referenceOnly: true, calendarExportEnabled: false, sourceReview: 'pending' },
  browser: { evidencePath: browserPath, evidenceSha256: artifacts.find(item => item.path === browserPath).sha256,
    checks: browser.checks.length, evidenceArtifacts: browser.artifacts.length, limitations: browser.limitations },
  testFiles, runs,
  intermediateRun: { outputPath: `${outputPath}/product-regression-initial-harness-failure.txt`,
    tests: 2465, passed: 2460, failed: 5,
    finding: 'The historical render-policy harness injected into the fifth React state hook. Two new administrative hooks moved that position. Its result region was empty. The test now targets the single explicit result-state declaration in its test-only bundle. Production code and all five policy assertions are unchanged by this repair.' },
  checks: { protectedTrackedPathsUnchanged: protectedTracked, noNewFilesInProtectedDirectories: protectedDirectories,
    localDocumentLinks: links, gitDiffCheckPassed: true, artifactsStableDuringTests: true }, artifacts
};
if (write) await writeFile(resolve(output, 'QA-AP23D2.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, d2Tests: runs.d2.counts.tests, productTests: runs.product.counts.tests,
  legacyEquivalenceCases: runs.legacyEquivalence.comparisons, browserChecks: report.browser.checks, artifacts: artifacts.length }, null, 2));
