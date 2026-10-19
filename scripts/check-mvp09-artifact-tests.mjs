// SPDX-License-Identifier: AGPL-3.0-only
// Actual sealed files and negative validation tests. No build or deployment.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { root, prefix, hash, encode } from './consolidate-mvp09-sources.mjs';
import { readRegular, writeExclusive } from './record-mvp09-source-approval.mjs';
import { resolve } from 'node:path';
const bind = async path => {const bytes = await readRegular(root, path); return {path, byteLength: bytes.length, sha256: hash(bytes)};};
const sealingPath = `${prefix}/artifact-verification.json`;
const sealing = JSON.parse(await readRegular(root, sealingPath));
assert.equal(sealing.status, 'passed');
const inputs = await Promise.all([sealingPath, `${prefix}/product-build.json`,
  'scripts/check-mvp09-artifact-tests.mjs', 'scripts/prepare_mvp09_artifacts.py',
  'scripts/prepare_mvp04_artifacts.py', 'tests/data/test_mvp09_artifacts.py'].map(bind));
for (const item of sealing.artifacts) assert.deepEqual(await bind(item.path), item);
const child = spawnSync(resolve(root, '.venv/bin/python'), ['-m', 'unittest', 'discover',
  '-s', 'tests/data', '-p', 'test_mvp09_artifacts.py', '-v'], {cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024});
const raw = Buffer.from((child.stdout ?? '') + (child.stderr ?? '') + (child.error ?? ''));
const runId = Date.now();
const logPath = `${prefix}/artifact-negative-attempts/${runId}.log`;
await writeExclusive(root, logPath, raw);
const text = raw.toString();
const count = Number(text.match(/^Ran (\d+) tests? in /m)?.[1] ?? 0);
const passed = child.status === 0 && count === 33 && /^OK\s*$/m.test(text)
  && !/\b(?:skipped|expected failure|unexpected success)\b/i.test(text);
for (const item of inputs) assert.deepEqual(await bind(item.path), item);
for (const item of sealing.artifacts) assert.deepEqual(await bind(item.path), item);
const report = {kind: 'mvp09-actual-artifact-and-negative-test-verification', status: passed ? 'passed' : 'failed',
  recordedAt: new Date().toISOString(), inputs, artifacts: sealing.artifacts, exitCode: child.status,
  tests: count, failures: passed ? 0 : null, errors: passed ? 0 : null, skipped: passed ? 0 : null,
  log: await bind(logPath), inputsUnchanged: true, installationPerformed: false, uploaded: false, published: false};
await writeExclusive(root, `${prefix}/artifact-negative-attempts/${runId}.json`, encode(report));
if (passed) await writeExclusive(root, `${prefix}/artifact-negative-verification.json`, encode(report));
console.log(JSON.stringify({status: report.status, tests: count, log: report.log,
  report: `${prefix}/artifact-negative-attempts/${runId}.json`}));
assert.ok(passed, text.slice(-6000));
