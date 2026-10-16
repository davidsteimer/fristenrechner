// SPDX-License-Identifier: AGPL-3.0-only
// Repeat only the identical built-package suite after a documented contention timeout.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Bind metadata after an already completed retry without executing or replacing
// its evidence. Useful when assembling the final overall work-package report.
if (process.argv[2] === '--bind-report') {
  const reportPath = resolve(root, 'outputs/ap23d3-2026-10-15/spfx-build.json');
  const report = JSON.parse(await readFile(reportPath, 'utf8'));
  assert.equal(report.status, 'passed');
  assert.ok(report.finalPassedSteps.every(step => step.exitCode === 0));
  const metadata = async path => {
    const bytes = await readFile(resolve(root, path));
    return { path, byteLength: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
  };
  assert.equal((await metadata(report.initialAttempt.path)).sha256, report.initialAttempt.sha256);
  assert.deepEqual(await metadata(report.testPackage.path), report.testPackage);
  const original = JSON.parse(await readFile(resolve(root, report.initialAttempt.path), 'utf8'));
  report.initialAttempt.steps = original.steps;
  report.initialAttempt.logArtifact = await metadata(original.steps[4].log);
  report.initialAttempt.originalLog = report.initialAttempt.logArtifact;
  report.retry.logArtifact = await metadata(report.retry.log);
  report.finalSteps = report.finalPassedSteps;
  report.steps = report.finalSteps;
  report.retryHelper = await metadata('scripts/build-ap23d3-spfx-retry.mjs');
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
  await writeFile(resolve(root, report.stage, 'verification-retry.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: report.status, failedLog: report.initialAttempt.logArtifact, retryLog: report.retry.logArtifact }));
  process.exit(0);
}
const supplied = process.argv[2];
assert.match(supplied ?? '', /^\.work\/ap23d3-spfx-build-[A-Za-z0-9]+$/);
const stage = resolve(root, supplied);
const sourceReportPath = relative(root, resolve(stage, 'verification.json'));
const sourceReportBytes = await readFile(resolve(root, sourceReportPath));
const initial = JSON.parse(sourceReportBytes);
assert.equal(initial.workPackage, 'AP23D3');
assert.equal(initial.status, 'failed');
assert.equal(initial.steps.length, 5);
assert.ok(initial.steps.slice(0, 4).every(step => step.exitCode === 0));
assert.notEqual(initial.steps[4].exitCode, 0);
const originalLog = await readFile(resolve(root, initial.steps[4].log), 'utf8');
assert.match(originalLog, /testTimeoutFailure/);
assert.match(originalLog, /# fail 0\b/);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const bind = async path => {
  const bytes = await readFile(resolve(root, path));
  return { path, byteLength: bytes.length, sha256: sha(bytes) };
};
const packagePath = relative(root, resolve(stage, 'spfx/sharepoint/solution/fristenrechner-schweiz.sppkg'));
const packageBefore = await bind(packagePath);
const recordedHashes = [...originalLog.matchAll(/"packageSha256":"([a-f0-9]{64})"/g)].map(match => match[1]);
assert.ok(recordedHashes.length > 0 && recordedHashes.every(hash => hash === packageBefore.sha256));
const args = initial.steps[4].args;
const testPaths = args.filter(arg => arg.endsWith('.test.cjs')).map(path => relative(root, resolve(stage, 'spfx', path)));
testPaths.push(relative(root, resolve(stage, 'spfx/test-build/package-harness.cjs')));
const testsBefore = await Promise.all(testPaths.map(bind));
const protectedBefore = await Promise.all(initial.protectedBefore.map(entry => bind(entry.path)));
assert.deepEqual(protectedBefore, initial.protectedBefore);
const result = spawnSync(process.execPath, args, { cwd: resolve(stage, 'spfx'), encoding: 'utf8',
  env: { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}` }, maxBuffer: 64 * 1024 * 1024 });
const log = relative(root, resolve(stage, 'step-5-retry-unmodified.log'));
const text = `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? String(result.error) : ''}`;
await writeFile(resolve(root, log), text);
const packageAfter = await bind(packagePath);
const testsAfter = await Promise.all(testPaths.map(bind));
const protectedAfter = await Promise.all(initial.protectedBefore.map(entry => bind(entry.path)));
assert.deepEqual(packageAfter, packageBefore);
assert.deepEqual(testsAfter, testsBefore);
assert.deepEqual(protectedAfter, protectedBefore);
const counts = Object.fromEntries(['tests', 'pass', 'fail', 'cancelled', 'skipped'].map(key =>
  [key, Number(text.match(new RegExp(`^# ${key} (\\d+)$`, 'm'))?.[1] ?? NaN)]));
const retry = { command: process.execPath, args, exitCode: result.status, log, counts };
const passed = result.status === 0 && counts.tests === counts.pass && counts.fail === 0 && counts.cancelled === 0 && counts.skipped === 0;
const report = { ...initial, status: passed ? 'passed' : 'failed', testPackage: packageAfter,
  steps: passed ? [...initial.steps.slice(0, 4), retry] : initial.steps,
  initialAttempt: { path: sourceReportPath, sha256: sha(sourceReportBytes), status: initial.status, steps: initial.steps,
    logArtifact: await bind(initial.steps[4].log),
    originalLog: await bind(initial.steps[4].log),
    reason: 'The complete suite exceeded one file timeout while the independent root regression ran in parallel. No failed assertion was reported.' },
  retry: { ...retry, logArtifact: await bind(log), mode: 'identicalBuiltSuiteWithoutParallelRootRegression', packageBefore, packageAfter, testsBefore, testsAfter },
  finalSteps: passed ? [...initial.steps.slice(0, 4), retry] : undefined,
  finalPassedSteps: passed ? [...initial.steps.slice(0, 4), retry] : undefined,
  retryHelper: await bind('scripts/build-ap23d3-spfx-retry.mjs'),
  protectedAfter, operatingPackagePreserved: true };
await writeFile(resolve(stage, 'verification-retry.json'), JSON.stringify(report, null, 2) + '\n');
await writeFile(resolve(root, 'outputs/ap23d3-2026-10-15/spfx-build.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, counts, packageSha256: packageAfter.sha256, log }));
process.exitCode = passed ? 0 : 1;
