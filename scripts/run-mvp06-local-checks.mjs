// SPDX-License-Identifier: AGPL-3.0-only
// Runs real local release checks and retains their outputs. No deployment.
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const phase = process.argv[2];
assert.ok(['product', 'data-governance'].includes(phase));
assert.equal(process.argv.length, 3);
const tests = async (directory, suffix) => (await readdir(resolve(root, directory)))
  .filter(name => name.endsWith(suffix)).sort().map(name => `${directory}/${name}`);
const node = process.execPath;
const python = resolve(root, '.venv/bin/python');
const commands = phase === 'product' ? [
  ['typecheck', node, ['node_modules/typescript/bin/tsc', '--noEmit']],
  ['core-ui', node, ['--import', 'tsx', '--test', '--test-reporter=tap', ...await tests('tests/core', '.test.ts'), ...await tests('tests/ui', '.test.ts')]],
  ['public', node, ['--import', 'tsx', '--test', '--test-reporter=tap', '--test-concurrency=1', ...await tests('tests/public-app', '.test.ts')]],
  ['preview-build', node, ['scripts/build-ui-preview.mjs']],
  ['public-build', node, ['scripts/build-public-app.mjs']]
] : [
  ['data-python', python, ['-m', 'unittest', 'discover', '-s', 'tests/data', '-p', 'test_*.py']],
  ['governance-python', python, ['-m', 'unittest', 'discover', '-s', 'tests/governance', '-p', 'test_*.py']],
  ['governance-validator', python, ['tests/governance/validate_source_reviews.py', '--self-test']],
  ['governance-node', node, ['--test', '--test-reporter=tap', ...await tests('tests/governance', '.test.mjs')]],
  ['approved-data', python, ['tests/data/validate_mvp06_release.py', 'data/releases/2026-10-01-mvp-06-approved.1']],
  ['source-approval', node, ['scripts/verify-mvp06-source-approval.mjs']]
];
await mkdir(resolve(root, '.work'), { recursive: true });
const stage = await mkdtemp(resolve(root, `.work/mvp06-${phase}-checks-`));
const report = { kind: 'mvp06LocalCheckRun', checkedOn: '2026-10-01', phase,
  releaseId: '2026-10-01-mvp-06-approved.1', installation: false, publication: false, steps: [], passed: false };
for (const [id, command, args] of commands) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, PATH: `${dirname(node)}:${process.env.PATH ?? ''}`, FRISTENRECHNER_DATA_CANDIDATE: '' } });
  const content = `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? String(result.error) : ''}`;
  const bytes = Buffer.from(content);
  const log = relative(root, resolve(stage, `${id}.log`));
  await writeFile(resolve(root, log), bytes, { flag: 'wx' });
  const nodeCounts = Object.fromEntries([...content.matchAll(/^# (tests|pass|fail|skipped|cancelled) (\d+)$/gm)].map(match => [match[1], Number(match[2])]));
  const pythonMatch = content.match(/Ran (\d+) tests? in/);
  const step = { id, command: command === node ? 'node' : '.venv/bin/python', args, exitCode: result.status,
    log, sha256: createHash('sha256').update(bytes).digest('hex'), byteLength: bytes.length,
    ...(Object.keys(nodeCounts).length ? { nodeCounts } : {}), ...(pythonMatch ? { pythonTests: Number(pythonMatch[1]) } : {}) };
  report.steps.push(step);
  console.log(JSON.stringify(step));
  if (result.status !== 0) break;
}
report.passed = report.steps.length === commands.length && report.steps.every(step => step.exitCode === 0);
await writeFile(resolve(stage, 'verification.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ report: relative(root, resolve(stage, 'verification.json')), passed: report.passed }));
process.exitCode = report.passed ? 0 : 1;
