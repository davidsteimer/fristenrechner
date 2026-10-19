// SPDX-License-Identifier: AGPL-3.0-only
// Actual R09-B data checks. Saves fresh logs, never changes runtime/governance bytes.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { root, prefix, hash, encode } from './consolidate-mvp09-sources.mjs';
import { readRegular, writeExclusive, verifySourceApproval } from './record-mvp09-source-approval.mjs';
import { requireR09BApproval } from './record-r09b-execution-approval.mjs';

assert.deepEqual(process.argv.slice(2), ['--run']);
const source = await verifySourceApproval();
const authority = await requireR09BApproval();
const releaseId = '2026-10-18-mvp-09-approved.1';
const candidate = 'outputs/ap23e3-candidate-2026-10-18/bundle';
const target = `data/releases/${releaseId}`;
const manifest = JSON.parse(await readRegular(root, `${target}/manifest.json`));
const adoption = JSON.parse(await readRegular(root, `${prefix}/source-governance-adoption.json`));
const suite = JSON.parse(await readRegular(root, `${prefix}/administrative-reference-suite.json`));
const fixed = ['scripts/check-mvp09-data.mjs', 'scripts/promote-mvp09-release.ts', 'scripts/prepare-mvp09-source-reviews.mjs',
  'scripts/prepare-mvp09-source-reviews.d.mts', 'scripts/record-r09b-execution-approval.mjs',
  'scripts/record-mvp09-source-approval.mjs', 'scripts/build-source-review-index.mjs',
  'tests/data/validate_mvp09_release.py', 'tests/data/test_mvp09_promotion.py', 'tests/data/ap22c1_contract.py',
  'tests/core/mvp09-promotion-delta.test.ts', 'tests/governance/mvp09-impact-mapping.test.mjs',
  'src/core/releaseFormat9.ts', 'src/core/format9CalculationData.ts', 'src/core/administrativeCatalogV2.ts',
  'src/core/holidayActivation.ts', 'src/core/format7Baseline.ts', 'src/core/socialCatalog.ts',
  `${prefix}/administrative-reference-suite.json`, `${prefix}/source-governance-adoption.json`, `${prefix}/data-promotion.json`,
  '.work/r09-a2-baseline/content-and-version-assessment.json'];
const paths = [...new Set([...fixed, ...adoption.evidence.map(row => row.path), ...suite.evidence.map(row => row.path),
  ...[target, candidate].flatMap(base => ['manifest.json', ...manifest.artifacts.map(row => row.path)].map(path => `${base}/${path}`)),
  ...authority.record.beforeInputs.filter(row => row.path.startsWith('schemas/')).map(row => row.path)])].sort();
async function snapshot() {
  return Promise.all(paths.map(async path => { const bytes = await readRegular(root, path); return { path, byteLength: bytes.length, sha256: hash(bytes) }; }));
}
const inputs = await snapshot();
const steps = [];
const commands = [
  ['approved-reader', process.execPath, ['--import', 'tsx', 'scripts/promote-mvp09-release.ts'], 'json'],
  ['independent-validator', resolve(root, '.venv/bin/python'), ['tests/data/validate_mvp09_release.py', target], 'json'],
  ['public-data-tests', process.execPath, ['--import', 'tsx', '--test', 'tests/core/mvp09-promotion-delta.test.ts', 'tests/governance/mvp09-impact-mapping.test.mjs'], 'tap'],
  ['independent-negative-tests', resolve(root, '.venv/bin/python'), ['-m', 'unittest', 'discover', '-s', 'tests/data', '-p', 'test_mvp09_promotion.py', '-v'], 'unittest']
];
for (const [id, executable, args, mode] of commands) {
  const start = new Date().toISOString(), chunks = [];
  const child = spawn(executable, args, { cwd: root, env: { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}`, FORCE_COLOR: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', chunk => chunks.push(chunk)); child.stderr.on('data', chunk => chunks.push(chunk));
  const exitCode = await new Promise((done, reject) => { child.on('error', reject); child.on('close', done); });
  const bytes = Buffer.concat(chunks), content = bytes.toString('utf8');
  const path = `${prefix}/data-${id}.log`;
  await writeExclusive(root, path, bytes);
  const row = { id, command: [executable, ...args], startedAt: start, finishedAt: new Date().toISOString(), exitCode,
    log: { path, byteLength: bytes.length, sha256: hash(bytes) }, passed: exitCode === 0 };
  if (mode === 'json' && exitCode === 0) row.result = JSON.parse(content);
  if (mode === 'tap') {
    row.counts = Object.fromEntries(['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo'].map(key => {
      const hits = [...content.matchAll(new RegExp(`^# ${key} (\\d+)\\r?$`, 'gm'))];
      assert.equal(hits.length, 1); return [key, Number(hits[0][1])];
    }));
    row.passed &&= row.counts.tests === 24 && row.counts.pass === 24 && ['fail','cancelled','skipped','todo'].every(key => row.counts[key] === 0);
  }
  if (mode === 'unittest') {
    const hit = content.match(/^Ran (\d+) tests? in /m);
    row.tests = hit ? Number(hit[1]) : null;
    row.passed &&= row.tests > 0 && /^OK\s*$/m.test(content) && !/\b(?:skipped|expected failure|unexpected success)\b/i.test(content);
  }
  steps.push(row); console.log(JSON.stringify(row));
  assert.equal(row.passed, true, `Failed fresh check: ${id}`);
}
assert.deepEqual(await snapshot(), inputs, 'Bound data/governance/test input changed during checks');
const report = { kind: 'mvp09IndependentLocalDataVerification', releaseId, manifestSha256: hash(await readRegular(root, `${target}/manifest.json`)),
  sourceApproval: source, executionApproval: { path: authority.path, sha256: authority.sha256 },
  passed: true, inputsUnchanged: true, sourcesAndHistoricalEvidenceReverified: true, inputFiles: inputs.length, inputs, steps,
  sourceReviewAccepted: true, runtimeFiles: 42, localDataCommitPerformed: false, externalDeploymentAuthorized: false,
  installationPerformed: false, uploaded: false, published: false };
await writeExclusive(root, `${prefix}/data-verification.json`, encode(report));
console.log(JSON.stringify({ path: `${prefix}/data-verification.json`, sha256: hash(encode(report)), passed: true,
  publicTests: steps.find(row => row.id === 'public-data-tests').counts.tests,
  independentTests: steps.find(row => row.id === 'independent-negative-tests').tests }));
