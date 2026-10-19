// SPDX-License-Identifier: AGPL-3.0-only
// Closed public-input copy for STANDARD tests, not a private source or publication audit.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { copyFile, lstat, mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { selectStandardSuites } from './run-standard-tests.mjs';
import { anchors as historicalMvp08Anchors } from './verify-mvp08-publication.mjs';
import { MANIFEST as historicalPublicManifest, OUTPUT as historicalPublicOutput, SPECS as historicalPublicSpecs } from './prepare-mvp08-public-evidence.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const prefix = 'outputs/release-mvp09-2026-10-18/portability-standard-no-private-20261018-05';
const priorPath = 'outputs/release-mvp08-2026-10-15/portability-standard-no-private-20261015-01/input-inventory.json';
const pointerPath = `${prefix}/workspace.json`;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const forbidden = /(?:^|\/)(?:\.git|\.work|\.venv|node_modules|Userinput|private|arbeitskopien|raw|\.ssh|\.aws)(?:\/|$)|\.private\.|backup|\.har(?:\.|$)|outputs\/(?:release|recovery)-mvp09/i;
const codeRoots = ['src', 'scripts', 'tests', 'schemas', 'data', 'public-app'];
const approvedOutputRoots = ['outputs/ap23e2-candidate-2026-10-18/bundle', 'outputs/ap23e3-candidate-2026-10-18/bundle'];
const extraPaths = ['src/release/mvp09ReleaseData.ts', 'outputs/ap23e3-candidate-2026-10-18/bundle-integrity.json',
  'outputs/ap23e2-2026-10-18/QA-AP23E2.json', 'outputs/ap23e2-abnahmepruefung-2026-10-18/QA-AP23E2-ABNAHMEPRUEFUNG.json',
  'docs/entscheidungen/DEC-2026-033-beschluss.md', 'docs/fachrecht/abnahme-ap23e2.md', historicalPublicManifest,
  ...historicalPublicSpecs.map(spec => `${historicalPublicOutput}/${spec.output}`), ...Object.keys(historicalMvp08Anchors)];
const allowedSourceExtension = /\.(?:json|mjs|cjs|js|ts|tsx|mts|py|md|css|scss|html|txt|svg|png|woff2?)$/;
async function regular(base, path) {
  assert.ok(path && !path.startsWith('/') && !/[\\:\x00-\x1f]/.test(path) && path.split('/').every(part => part && part !== '.' && part !== '..'), path);
  const pieces = path.split('/');
  let target = base;
  for (const part of pieces) { target = resolve(target, part); assert.equal((await lstat(target)).isSymbolicLink(), false, path); }
  assert.ok((await lstat(target)).isFile(), path);
  return readFile(target);
}
async function walk(base, path) {
  const stat = await lstat(resolve(base, path));
  assert.equal(stat.isSymbolicLink(), false, path);
  if (stat.isFile()) return [path];
  const found = [];
  for (const name of (await readdir(resolve(base, path))).sort()) {
    const child = `${path}/${name}`;
    if (/\/(?:__pycache__|\.DS_Store)$/.test(child) || forbidden.test(child)) continue;
    found.push(...await walk(base, child));
  }
  return found;
}
async function save(path, value) {
  const bytes = Buffer.isBuffer(value) ? value : encode(value);
  await mkdir(dirname(resolve(root, path)), { recursive: true });
  await writeFile(resolve(root, path), bytes, { flag: 'wx' });
  return { path, sha256: hash(bytes), byteLength: bytes.length };
}
async function prepare() {
  const priorBytes = await regular(root, priorPath), prior = JSON.parse(priorBytes);
  assert.equal(prior.files.length, 2530);
  const excludedOriginals = new Set(prior.excludedHistoricalOriginalPaths);
  assert.equal(excludedOriginals.size, 34);
  const paths = new Set(prior.files.map(row => row.path));
  for (const directory of [...codeRoots, ...approvedOutputRoots]) for (const path of await walk(root, directory)) {
    if (allowedSourceExtension.test(path)) paths.add(path);
  }
  for (const path of extraPaths) paths.add(path);
  const accepted = JSON.parse(await regular(root, 'outputs/ap23e2-abnahmepruefung-2026-10-18/QA-AP23E2-ABNAHMEPRUEFUNG.json'));
  for (const item of accepted.preservedArtefacts) {
    assert.ok(!forbidden.test(item.path));
    const raw = await regular(root, item.path); assert.equal(hash(raw), item.sha256); assert.equal(raw.length, item.byteLength);
    paths.add(item.path);
  }
  for (const path of paths) {
    assert.ok(!forbidden.test(path), `Forbidden input: ${path}`);
    assert.ok(!excludedOriginals.has(path), `Private historical source: ${path}`);
  }
  const stage = await mkdtemp(resolve(root, '.work/mvp09-standard-no-private-'));
  const files = [];
  for (const path of [...paths].sort()) {
    const bytes = await regular(root, path);
    await mkdir(dirname(resolve(stage, path)), { recursive: true });
    await copyFile(resolve(root, path), resolve(stage, path));
    assert.equal(hash(await regular(stage, path)), hash(bytes));
    files.push({ path, sha256: hash(bytes), byteLength: bytes.length });
  }
  await symlink(resolve(root, 'node_modules'), resolve(stage, 'node_modules'), 'dir');
  const suites = {};
  for (const scope of ['product', 'governance']) {
    const paths = [];
    for (const directory of scope === 'product' ? ['tests/core', 'tests/ui'] : ['tests/governance'])
      for (const name of (await readdir(resolve(stage, directory))).sort()) if (/\.test\.(?:tsx?|mjs)$/.test(name)) paths.push(`${directory}/${name}`);
    suites[scope] = selectStandardSuites(paths);
  }
  const record = { kind: 'mvp09ClosedStandardPortabilityInputs', preparedAt: new Date().toISOString(), stage: relative(root, stage),
    priorRoutingInventory: { path: priorPath, sha256: hash(priorBytes) },
    codeRoots, approvedOutputRoots, extraPaths, files, suites,
    excludedHistoricalOriginalPaths: [...excludedOriginals].sort(),
    retainedHistoricalPublicFullTextFixture: prior.historicalPublicFullTextFixture,
    noOfficialFullTextsClaimed: false, publicationReviewPerformed: false,
    privateRawEvidenceIncluded: false, currentR09ArchivesIncluded: false, gitIncluded: false, hostingBackupsIncluded: false,
    runtimeDependencies: 'Existing node_modules symlink and Python interpreter only, no repository/private-data symlink',
    operationalPermissions: { installation: false, upload: false, githubPush: false } };
  await save(`${prefix}/input-inventory.json`, record);
  await save(pointerPath, { stage: record.stage, inventoryPath: `${prefix}/input-inventory.json`, inventorySha256: hash(encode(record)) });
  console.log(JSON.stringify({ prepared: true, stage: record.stage, inputFiles: files.length,
    suites: Object.fromEntries(Object.entries(suites).map(([id, paths]) => [id, paths.length])) }));
}
async function inputs() {
  const pointer = JSON.parse(await regular(root, pointerPath));
  assert.match(pointer.stage, /^\.work\/mvp09-standard-no-private-[A-Za-z0-9]+$/);
  const bytes = await regular(root, pointer.inventoryPath); assert.equal(hash(bytes), pointer.inventorySha256);
  const record = JSON.parse(bytes); assert.equal(record.stage, pointer.stage);
  return record;
}
async function unchanged(record) {
  const stage = resolve(root, record.stage);
  for (const item of record.files) { const bytes = await regular(stage, item.path); assert.equal(hash(bytes), item.sha256, item.path); assert.equal(bytes.length, item.byteLength); }
  const absent = ['.git', 'Userinput', 'private', 'tests/private', 'outputs/release-mvp09-2026-10-18',
    ...record.excludedHistoricalOriginalPaths];
  for (const path of absent) await assert.rejects(lstat(resolve(stage, path)), { code: 'ENOENT' });
  assert.equal(hash(await regular(stage, record.retainedHistoricalPublicFullTextFixture.path)), record.retainedHistoricalPublicFullTextFixture.sha256);
  assert.ok((await lstat(resolve(stage, 'node_modules'))).isSymbolicLink());
  return absent;
}
async function run(scope) {
  const record = await inputs(), beforeAbsent = await unchanged(record), stage = resolve(root, record.stage);
  const commands = scope === 'governance' ? [
    ['governance-node', process.execPath, ['--import', 'tsx', '--test', '--test-concurrency=2', ...record.suites.governance], 'tap'],
    ['governance-schema', resolve(root, '.venv/bin/python'), ['tests/governance/validate_source_reviews.py', '--self-test'], 'schema'],
    ['governance-python', resolve(root, '.venv/bin/python'), ['-m', 'unittest', 'discover', '-s', 'tests/governance', '-p', 'test_*.py'], 'unittest']
  ] : [['product', process.execPath, ['--import', 'tsx', '--test', '--test-concurrency=2', ...record.suites.product], 'tap']];
  const steps = [];
  for (const [id, executable, args, mode] of commands) {
    const chunks = [], startedAt = new Date().toISOString();
    const child = spawn(executable, args, { cwd: stage, env: { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}`, FORCE_COLOR: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', chunk => chunks.push(chunk)); child.stderr.on('data', chunk => chunks.push(chunk));
    const exitCode = await new Promise((done, reject) => { child.on('error', reject); child.on('close', done); });
    const bytes = Buffer.concat(chunks), text = bytes.toString(), log = await save(`${prefix}/${id}.log`, bytes);
    const row = { id, command: [executable, ...args], startedAt, finishedAt: new Date().toISOString(), exitCode, log, passed: exitCode === 0 };
    if (mode === 'tap') {
      row.counts = Object.fromEntries(['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo'].map(key => {
        const matches = [...text.matchAll(new RegExp(`^# ${key} (\\d+)\\r?$`, 'gm'))];
        return [key, matches.length === 1 ? Number(matches[0][1]) : null];
      }));
      row.passed &&= row.counts.tests > 0 && row.counts.pass === row.counts.tests && ['fail','cancelled','skipped','todo'].every(key => row.counts[key] === 0);
    } else if (mode === 'unittest') {
      row.tests = Number(text.match(/^Ran (\d+) tests? in /m)?.[1] ?? 0);
      row.passed &&= row.tests > 0 && /^OK\s*$/m.test(text) && !/\b(?:skipped|expected failure|unexpected success)\b/i.test(text);
    } else row.passed &&= /255 Quellen.*157 produktiv.*7 Ereignis.*8 Negativtests/s.test(text);
    steps.push(row); console.log(JSON.stringify(row));
    if (!row.passed) break;
  }
  await unchanged(record);
  const report = { kind: 'mvp09StandardPortabilityExecution', scope, stage: record.stage,
    passed: steps.length === commands.length && steps.every(row => row.passed),
    inputsVerifiedBeforeAndAfter: true, inputCount: record.files.length, absentBeforeAndAfter: beforeAbsent,
    privateSourceAuditClaimed: false, operationalAcceptanceClaimed: false, steps };
  await save(`${prefix}/${scope}-execution.json`, report);
  process.exitCode = report.passed ? 0 : 1;
}
async function verify() {
  const record = await inputs(), absent = await unchanged(record);
  const executions = [];
  for (const scope of ['governance', 'product']) {
    const bytes = await regular(root, `${prefix}/${scope}-execution.json`), execution = JSON.parse(bytes);
    assert.equal(execution.passed, true); assert.equal(execution.stage, record.stage);
    for (const step of execution.steps) assert.equal(hash(await regular(root, step.log.path)), step.log.sha256);
    executions.push({ path: `${prefix}/${scope}-execution.json`, sha256: hash(bytes), byteLength: bytes.length, result: execution });
  }
  const report = { kind: 'mvp09StandardTestPortabilityProof', passed: true, scope: ['product', 'governance', 'source-schema', 'python-governance'],
    inputInventory: { path: `${prefix}/input-inventory.json`, sha256: hash(await regular(root, `${prefix}/input-inventory.json`)) },
    inputCount: record.files.length, suites: Object.fromEntries(Object.entries(record.suites).map(([key, rows]) => [key, rows.length])),
    isolatedInputBytesVerifiedBeforeAndAfter: true, absentAfterExecution: absent,
    currentR09ArchivesPresent: false, privateRawSourceOriginalsPresent: false, gitPresent: false, hostingBackupsPresent: false,
    noOfficialFullTextsClaimed: false, retainedHistoricalPublicFullTextFixture: record.retainedHistoricalPublicFullTextFixture,
    noTestsSkipped: true, standardSuiteSelectionUnchanged: true, executions,
    testGeneratedScratch: 'Public tests may create their own .work/ui-preview in the isolated copy. No private archive was supplied.',
    limits: ['Not a complete private source audit', 'Not publication approval', 'Not browser, real tenant, guest or device acceptance', 'Existing dependency runtimes reused'],
    installationPerformed: false, uploaded: false, published: false };
  const result = await save(`${prefix}/report.json`, report);
  console.log(JSON.stringify({ ...result, passed: true, counts: executions.flatMap(row => row.result.steps).map(row => ({ id: row.id, counts: row.counts ?? row.tests ?? 'schema8' })) }));
}
assert.equal(process.argv.length, 3);
const mode = process.argv[2];
assert.ok(['prepare', 'governance', 'product', 'verify'].includes(mode));
await (mode === 'prepare' ? prepare() : mode === 'verify' ? verify() : run(mode));
