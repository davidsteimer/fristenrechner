// SPDX-License-Identifier: AGPL-3.0-only
// Fresh local checks only. No promotion, build, commit or deployment.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const output = 'outputs/release-mvp09-2026-10-18';
const proofPath = 'outputs/ap23e3-2026-10-18/QA-AP23E3.json';
const proofBytes = await readFile(resolve(root, proofPath));
assert.equal(sha(proofBytes), 'fa564603394ed40a6eebc6a587b5e11111f4f37e75c9930b4a04d1d889991c80');
const proof = JSON.parse(proofBytes);
assert.ok(process.argv.length === 3 && process.argv[2] === '--run', 'Use --run for fresh checks and new logs.');
assert.match(process.version, /^v22\./);

async function descriptor(path) {
  const bytes = await readFile(resolve(root, path));
  return { path, byteLength: bytes.length, sha256: sha(bytes) };
}
async function files(path) {
  const stat = await lstat(resolve(root, path));
  assert.equal(stat.isSymbolicLink(), false, path);
  if (stat.isFile()) return [path];
  assert.ok(stat.isDirectory(), path);
  const nested = await Promise.all((await readdir(resolve(root, path))).sort().map(name => files(`${path}/${name}`)));
  return nested.flat();
}
const roots = ['data/releases', 'data/source-reviews', 'schemas', 'outputs/ap23e3-candidate-2026-10-18', 'outputs/ap23e3-2026-10-18'];
const fixed = [...proof.inputs.map(item => item.path), ...proof.evidence.map(item => item.path),
  'package-lock.json', 'spfx/package.json', 'spfx/package-lock.json', 'spfx/config/package-solution.json',
  'spfx/config/config.json', 'spfx/sharepoint/solution/fristenrechner-schweiz.sppkg'];
for (const item of [...proof.inputs, ...proof.evidence]) assert.deepEqual(await descriptor(item.path), item, `Changed accepted technical input: ${item.path}`);
async function snapshot() {
  const paths = [...new Set([...fixed, ...(await Promise.all(roots.map(files))).flat()])].sort();
  return Promise.all(paths.map(descriptor));
}
const before = await snapshot();
const stage = await mkdtemp(resolve(root, '.work/mvp09-preflight-'));
const commands = [
  ['typecheck', ['node_modules/typescript/bin/tsc', '--noEmit'], false],
  ['candidate-reproduction', ['--import', 'tsx', 'scripts/build-ap23e3-candidate.ts', '--check'], false],
  ['product-regression', ['scripts/run-standard-tests.mjs', 'product'], true],
  ['host-lifecycle', ['--import', 'tsx', '--test', 'tests/hosts/ap22c3-spfx-host.test.ts', 'tests/hosts/ap23d3-spfx-host.test.ts', 'tests/hosts/ap23e3-spfx-host.test.ts'], true],
  ['legacy-equivalence', ['--import', 'tsx', 'scripts/check-ap23d1-legacy-equivalence.mjs'], false]
];
const report = { kind: 'mvp09PreparationPreflight', startedAt: new Date().toISOString(),
  stage: relative(root, stage), versionStatus: 'planning-only', sourceReleaseApproved: false,
  dataPromoted: false, definitiveBuild: false, deployed: false, published: false,
  acceptedProof: await descriptor(proofPath), runner: await descriptor('scripts/prepare-mvp09-local.mjs'),
  commands: [], protectedBefore: before };
for (const [id, args, countTests] of commands) {
  const startedAt = new Date().toISOString();
  const chunks = [];
  const child = spawn(process.execPath, args, { cwd: root,
    env: { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}`, FORCE_COLOR: '0' },
    stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', chunk => chunks.push(chunk));
  child.stderr.on('data', chunk => chunks.push(chunk));
  const exitCode = await new Promise((done, reject) => { child.on('error', reject); child.on('close', done); });
  const bytes = Buffer.concat(chunks), log = relative(root, resolve(stage, `${id}.log`));
  await writeFile(resolve(root, log), bytes, { flag: 'wx' });
  const counts = {};
  let passed = exitCode === 0;
  if (countTests) {
    for (const key of ['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo']) {
      const matches = [...bytes.toString('utf8').matchAll(new RegExp(`^# ${key} (\\d+)\\r?$`, 'gm'))];
      counts[key] = matches.length === 1 ? Number(matches[0][1]) : null;
    }
    passed &&= counts.tests > 0 && counts.tests === counts.pass
      && ['fail', 'cancelled', 'skipped', 'todo'].every(key => counts[key] === 0);
  }
  const step = { id, command: ['node', ...args], startedAt, finishedAt: new Date().toISOString(),
    exitCode, passed, ...(countTests ? { counts } : {}), log: await descriptor(log) };
  if (id === 'legacy-equivalence' && passed) {
    const legacy = JSON.parse(bytes.toString('utf8'));
    passed = legacy.comparisons === 1584;
    step.passed = passed;
    step.comparisons = legacy.comparisons;
  }
  report.commands.push(step);
  console.log(JSON.stringify(step));
  if (!passed) break;
}
report.protectedAfter = await snapshot();
report.protectedUnchanged = JSON.stringify(report.protectedBefore) === JSON.stringify(report.protectedAfter);
report.passed = report.protectedUnchanged && report.commands.length === commands.length && report.commands.every(step => step.passed);
report.finishedAt = new Date().toISOString();
const bytes = Buffer.from(JSON.stringify(report, null, 2) + '\n');
await writeFile(resolve(stage, 'verification.json'), bytes, { flag: 'wx' });
await mkdir(resolve(root, output), { recursive: true });
await writeFile(resolve(root, output, 'preflight.json'), bytes, { flag: 'wx' });
console.log(JSON.stringify({ passed: report.passed, protectedFiles: before.length,
  path: `${output}/preflight.json`, sha256: sha(bytes) }));
process.exitCode = report.passed ? 0 : 1;

