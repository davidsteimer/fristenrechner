// SPDX-License-Identifier: AGPL-3.0-only
// Fresh local regression. Historical release reports are never overwritten.
import assert from 'node:assert/strict';
import { readdir, readFile, mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { selectStandardSuites } from './run-standard-tests.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const prefix = 'outputs/release-mvp08-2026-10-15';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const inputPaths = [];
const gather = async directory => {
  for (const entry of await readdir(resolve(root, directory), {withFileTypes: true})) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await gather(path);
    else if (entry.isFile() && /\.(?:tsx?|mjs|cjs|py|json)$/.test(entry.name)) inputPaths.push(path);
  }
};
for (const directory of ['src', 'tests', 'schemas']) await gather(directory);
inputPaths.push('package.json', 'package-lock.json', 'tsconfig.json', 'scripts/check-mvp08-local.mjs', 'scripts/run-standard-tests.mjs');
const inputBindings = await Promise.all(inputPaths.sort().map(async path => {
  const bytes = await readFile(resolve(root, path));
  return {path, byteLength: bytes.length, sha256: sha256(bytes)};
}));
const list = async directories => (await Promise.all(directories.map(async directory =>
  (await readdir(resolve(root, directory))).filter(name => /\.test\.(?:tsx?|mjs)$/.test(name)).sort()
    .map(name => `${directory}/${name}`)))).flat();
await mkdir(resolve(root, prefix, 'local-checks'), {recursive: true});
const directory = await mkdtemp(resolve(root, prefix, 'local-checks/run-'));
const scopes = {
  typecheck: [process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit']],
  product: [process.execPath, ['--import', 'tsx', '--test', '--test-concurrency=2', ...selectStandardSuites(await list(['tests/core', 'tests/ui']))]],
  hosts: [process.execPath, ['--import', 'tsx', '--test', '--test-concurrency=2', ...await list(['tests/hosts'])]],
  public: [process.execPath, ['--import', 'tsx', '--test', '--test-concurrency=1', ...await list(['tests/public-app'])]],
  governance: [process.execPath, ['scripts/run-standard-tests.mjs', 'governance']],
  private: [process.execPath, ['scripts/run-standard-tests.mjs', 'private-mvp08']],
  private05: [process.execPath, ['scripts/run-standard-tests.mjs', 'private-mvp05']],
  sources: [resolve(root, '.venv/bin/python'), ['tests/governance/validate_source_reviews.py', '--self-test']],
  sourceTests: [resolve(root, '.venv/bin/python'), ['-m', 'unittest', 'discover', '-s', 'tests/governance', '-p', 'test_*.py']],
  dataTests: [resolve(root, '.venv/bin/python'), ['-m', 'unittest', 'discover', '-s', 'tests/data', '-p', 'test_mvp08_promotion.py']],
  integrity: [process.execPath, ['scripts/verify-mvp08-public-integrity.mjs']]
};
const selected = process.argv.slice(2);
assert.ok(selected.every(name => Object.hasOwn(scopes, name)), 'Unknown explicit local scope');
const report = {kind: 'mvp08-fresh-local-regression', startedAt: new Date().toISOString(),
  node: process.version, status: 'running', inputBindings, steps: [], actualM365Testing: false, actualOutlookImport: false};
for (const name of selected.length ? selected : Object.keys(scopes)) {
  const [command, args] = scopes[name];
  const result = spawnSync(command, args, {cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
    env: {...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}`, FRISTENRECHNER_DATA_CANDIDATE: ''}});
  const log = Buffer.from(`${result.stdout ?? ''}${result.stderr ?? ''}${result.error ?? ''}`);
  const logPath = resolve(directory, `${name}.log`);
  await writeFile(logPath, log, {flag: 'wx'});
  const counts = Object.fromEntries([...log.toString().matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)]
    .map(match => [match[1], Number(match[2])]));
  const step = {name, command: [relative(root, command), ...args], exitCode: result.status,
    log: {path: relative(root, logPath), byteLength: log.length, sha256: sha256(log)}, counts};
  report.steps.push(step);
  console.log(JSON.stringify(step));
  if (result.status !== 0 || (counts.tests !== undefined && (counts.pass !== counts.tests || counts.skipped !== 0 || counts.fail !== 0))) {
    report.status = 'failed'; break;
  }
}
if (report.status === 'running') report.status = 'passed';
report.finishedAt = new Date().toISOString();
await writeFile(resolve(directory, 'verification.json'), JSON.stringify(report, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({status: report.status, path: relative(root, directory)}));
assert.equal(report.status, 'passed');
