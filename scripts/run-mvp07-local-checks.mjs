// SPDX-License-Identifier: AGPL-3.0-only
// Actual local commands and logs. Never invents a pass or performs deployment.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, mkdtemp } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, relative, resolve } from 'node:path';
import { requireLocalBuildApproval, root, hash } from './record-mvp07-local-build-approval.mjs';
await requireLocalBuildApproval();
const scope = process.argv[2];
assert.ok(['product', 'governance'].includes(scope) && process.argv.length === 3);
const env = { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}` };
const node = process.execPath, python = resolve(root, '.venv/bin/python');
const commands = scope === 'product' ? [
  ['typecheck', node, ['node_modules/typescript/bin/tsc', '--noEmit']],
  ['core-ui', node, ['scripts/run-standard-tests.mjs', 'product']],
  ['public-tests', node, ['--import', 'tsx', '--test', 'tests/public-app/*.test.ts']],
  ['preview-build', node, ['scripts/build-ui-preview.mjs']],
  ['public-build', node, ['scripts/build-public-app.mjs']]
] : [
  ['data-python', python, ['-m', 'unittest', 'discover', '-s', 'tests/data', '-p', 'test_*.py']],
  ['governance-python', python, ['-m', 'unittest', 'discover', '-s', 'tests/governance', '-p', 'test_*.py']],
  ['governance-validator', python, ['tests/governance/validate_source_reviews.py', '--self-test']],
  ['governance-node', node, ['scripts/run-standard-tests.mjs', 'governance']],
  ['approved-data', python, ['tests/data/validate_mvp07_release.py', 'data/releases/2026-10-08-mvp-07-approved.1']],
  ['source-approval', node, ['scripts/record-mvp07-source-approval.mjs']],
  ['local-authority', node, ['scripts/record-mvp07-local-build-approval.mjs']]
];
await mkdir(resolve(root, '.work'), { recursive: true });
const stage = await mkdtemp(resolve(root, `.work/mvp07-${scope}-checks-`));
const report = { kind: 'mvp07LocalChecks', scope, releaseId: '2026-10-08-mvp-07-approved.1',
  startedAt: new Date().toISOString(), installation: false, publication: false, steps: [] };
for (const [id, command, originalArgs] of commands) {
  const args = [...originalArgs];
  if (id === 'public-tests') {
    const { readdir } = await import('node:fs/promises');
    args.splice(-1, 1, ...(await readdir(resolve(root, 'tests/public-app'))).filter(name => name.endsWith('.test.ts')).sort().map(name => `tests/public-app/${name}`));
  }
  const startedAt = new Date().toISOString();
  const result = spawnSync(command, args, { cwd: root, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const text = `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? String(result.error) : ''}`;
  const log = resolve(stage, `${id}.log`);
  await writeFile(log, text, { flag: 'wx' });
  const nodeCounts = Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped) (\d+)$/gm)].map(match => [match[1], Number(match[2])]));
  const pythonMatch = text.match(/Ran (\d+) tests/);
  report.steps.push({ id, command: command === node ? 'node' : '.venv/bin/python', args, startedAt,
    finishedAt: new Date().toISOString(), exitCode: result.status, log: relative(root, log),
    sha256: hash(Buffer.from(text)), byteLength: Buffer.byteLength(text),
    ...(Object.keys(nodeCounts).length ? { nodeCounts } : {}), ...(pythonMatch ? { pythonTests: Number(pythonMatch[1]) } : {}) });
  console.log(JSON.stringify(report.steps.at(-1)));
  if (result.status !== 0) break;
}
report.passed = report.steps.length === commands.length && report.steps.every(step => step.exitCode === 0);
report.finishedAt = new Date().toISOString();
const receipt = resolve(stage, 'verification.json');
await writeFile(receipt, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ passed: report.passed, receipt: relative(root, receipt), sha256: hash(await readFile(receipt)) }));
process.exitCode = report.passed ? 0 : 1;
