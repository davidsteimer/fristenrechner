// SPDX-License-Identifier: AGPL-3.0-only
// Historical A1/A2 tests run against the exact pre-adoption snapshot, never an
// altered 255-source expectation. No changes to the live tree or old reports.
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve, dirname, relative } from 'node:path';
import { root, prefix, hash, encode } from './consolidate-mvp09-sources.mjs';
import { requireR09BApproval } from './record-r09b-execution-approval.mjs';
import { readRegular, writeExclusive } from './record-mvp09-source-approval.mjs';
const authority = await requireR09BApproval();
const source = JSON.parse(await readRegular(root, prefix + '/source-approval.json'));
const stage = await mkdtemp(resolve(root, '.work/r09b-historical-sources-'));
const copied = new Map();
async function add(path, bytes, provenance) {
  assert.ok(path && !path.startsWith('/') && !path.split('/').some(x => !x || x === '..' || x === '.'));
  await mkdir(dirname(resolve(stage, path)), {recursive: true});
  await writeFile(resolve(stage, path), bytes);
  copied.set(path, {path, byteLength: bytes.length, sha256: hash(bytes), provenance});
}
// Supporting executable test tools are current, the sealed inputs below take
// precedence wherever the original source review bound a particular version.
for (const folder of ['scripts', 'tests/governance']) {
  for (const name of (await readdir(resolve(root, folder))).sort()) {
    if (!/\.(?:mjs|mts|py)$/.test(name)) continue;
    const path = folder + '/' + name;
    await add(path, await readRegular(root, path), 'test-support');
  }
}
for (const item of source.evidence) {
  const bytes = await readRegular(root, item.path);
  assert.equal(hash(bytes), item.sha256, item.path);
  await add(item.path, bytes, 'accepted-source-evidence');
}
const inventory = JSON.parse(await readRegular(root, prefix + '/sources/source-inventory.json'));
const beforeByPath = new Map(authority.record.beforeInputs.map(item => [item.path, item]));
for (const item of inventory.evidenceBindings) {
  const before = beforeByPath.get(item.path);
  const bytes = await readRegular(root, before ? before.archivedAt : item.path);
  assert.equal(hash(bytes), item.sha256, 'Historical inventory input: ' + item.path);
  await add(item.path, bytes, 'sealed-A1-inventory-binding');
}
for (const item of authority.record.beforeInputs) {
  const bytes = await readRegular(root, item.archivedAt);
  assert.equal(hash(bytes), item.sha256);
  await add(item.path, bytes, 'sealed-before-adoption');
}
for (const name of ['source-approval.json', 'r09b-proposal.json', 'r09b-proposal-verification.json',
  'source-review-verification.json', 'source-review-completeness.json', 'preflight.json',
  'source-inventory.json']) {
  const path = prefix + '/' + name;
  const bytes = await readRegular(root, path, true);
  if (bytes) await add(path, bytes, 'historical-record');
}
await cp(resolve(root, prefix, 'source-approval-inputs'), resolve(stage, prefix, 'source-approval-inputs'), {recursive: true});
for (const path of ['outputs/release-mvp08-2026-10-15/product-build.json',
  'outputs/release-mvp08-2026-10-15/artifact-verification.json']) {
  await add(path, await readRegular(root, path), 'actual-mvp08-build-record');
}
await symlink(resolve(root, 'node_modules'), resolve(stage, 'node_modules'), 'dir');
const suites = ['mvp09-source-inventory', 'mvp09-source-coverage', 'mvp09-source-approval', 'r09b-proposal']
  .map(name => 'tests/governance/' + name + '.test.mjs');
const result = spawnSync(process.execPath, ['--test', '--test-concurrency=2', ...suites], {
  cwd: stage, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  env: {...process.env, PATH: dirname(process.execPath) + ':' + (process.env.PATH ?? '')}
});
const log = Buffer.from((result.stdout ?? '') + (result.stderr ?? '') + (result.error ?? ''));
const run = relative(root, stage).split('/').at(-1);
const logPath = prefix + '/historical-source-tests/' + run + '.log';
await writeExclusive(root, logPath, log);
const counts = Object.fromEntries([...log.toString().matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)]
  .map(m => [m[1], Number(m[2])]));
const passed = result.status === 0 && counts.tests > 0 && counts.pass === counts.tests
  && ['fail', 'cancelled', 'skipped', 'todo'].every(k => counts[k] === 0);
const proof = {kind: 'mvp09-historical-source-tests', status: passed ? 'passed' : 'failed',
  stage: relative(root, stage), sourceReviewState: 'before-R09-B-adoption', currentRegistryNotSubstituted: true,
  authority: {path: authority.path, sha256: authority.sha256}, files: [...copied.values()],
  suites, counts, exitCode: result.status, log: {path: logPath, byteLength: log.length, sha256: hash(log)},
  liveFilesModified: false, historicalTestsModified: false};
const proofPath = prefix + '/historical-source-tests/' + run + '.json';
await writeExclusive(root, proofPath, encode(proof));
console.log(JSON.stringify({status: proof.status, proofPath, counts, stage: proof.stage}));
assert.ok(passed, log.toString().slice(-5000));
