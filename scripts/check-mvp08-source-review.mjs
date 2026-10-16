// SPDX-License-Identifier: AGPL-3.0-only
// Local source-review QA only. Never changes product data or permissions.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { lstat, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { consolidate, encode, hash, root, prefix, resultPath, candidatePath, inventoryPath } from './consolidate-mvp08-sources.mjs';

const qaPath = `${prefix}/source-review-verification.json`;
const logPath = `${prefix}/source-review-tests.txt`;
const docPath = 'docs/fachrecht/quellenabgleich-mvp08.md';
const testPaths = ['tests/governance/ap23d3-acceptance.test.mjs',
  'tests/governance/mvp08-source-inventory.test.mjs', 'tests/governance/mvp08-source-coverage.test.mjs'];
const scriptPaths = ['scripts/archive-ap23d3-acceptance.mjs', 'scripts/inventory-mvp08-sources.mjs',
  'scripts/consolidate-mvp08-sources.mjs', 'scripts/check-mvp08-source-review.mjs'];
const expectedHashes = new Map([
  [resultPath, 'e0c1012036fe1ddda95ab660d1153b203de19e8a75d9d6245da78d60e4796c66'],
  [`${prefix}/sources/baseline-review.json`, '4d03e420cc3d8caf896215cddc6635d89efbe1a26668a82fd0e303578ae9e2f9'],
  [`${prefix}/sources/calendar-review.json`, '6770d43e169cfddbfe541933feb3a3842b4ac5f9d2b89d2d7d57e78944994489'],
  [`${prefix}/sources/administrative-review.json`, '7c2022942e2d153538b28007219da2704ec16c3037d33f97450d2a3a376f2c15']
]);
async function boundFile(path) {
  assert.ok(!path.startsWith('/') && path.split('/').every(part => part && part !== '.' && part !== '..'));
  const pieces = path.split('/');
  for (let i = 1; i <= pieces.length; i++) {
    const st = await lstat(resolve(root, pieces.slice(0, i).join('/')));
    assert.ok(!st.isSymbolicLink() && (i === pieces.length ? st.isFile() : st.isDirectory()), path);
  }
  const bytes = await readFile(resolve(root, path));
  const binding = { path, sha256: hash(bytes), byteLength: bytes.length };
  if (expectedHashes.has(path)) assert.equal(binding.sha256, expectedHashes.get(path), path);
  return binding;
}
async function main() {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--write'));
  const report = await consolidate();
  assert.deepEqual(await readFile(resolve(root, resultPath)), encode(report), 'Actual source review must reproduce exactly');
  for (const [key, value] of Object.entries({ sourceIds: 243, withFreshEvidence: 171, reusedWithoutFreshEvidence: 72,
    uniqueBoundEvidenceFiles: 541, protectedFilesUnchanged: 559 })) assert.equal(report.counts[key], value);
  const doc = await readFile(resolve(root, docPath), 'utf8');
  assert.ok(doc.includes('noch nicht abgenommen') && doc.includes('Datenübernahme und definitive Builds'));
  assert.ok(!doc.includes(';'), 'Use Swiss prose without semicolons');
  const localLinks = [...doc.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]).filter(link => !/^https?:|^#/.test(link));
  for (const link of localLinks) {
    const path = relative(root, resolve(root, dirname(docPath), link.split('#')[0]));
    assert.ok(!path.startsWith('..'));
    if (path !== qaPath) await boundFile(path);
  }
  if (process.argv[2] !== '--write') {
    const qa = JSON.parse(await readFile(resolve(root, qaPath)));
    assert.equal(qa.humanApproval, false);
    assert.equal(qa.sourceReleaseApproved, false);
    assert.equal(qa.dataPromotionApproved, false);
    assert.equal(qa.publicationApproved, false);
    for (const item of qa.bindings) assert.deepEqual(await boundFile(item.path), item);
    console.log(JSON.stringify({ mode: 'read-only-reverified', qaPath, counts: report.counts, tests: qa.tests }, null, 2));
    return;
  }
  for (const path of [qaPath, logPath]) {
    try { await lstat(resolve(root, path)); assert.fail(`Refusing to replace existing QA: ${path}`); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const startedAt = new Date().toISOString();
  const run = spawnSync(process.execPath, ['--test', ...testPaths], { cwd: root, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.match(run.stdout, /# tests 44\n/);
  for (const key of ['pass 44', 'fail 0', 'cancelled 0', 'skipped 0', 'todo 0']) assert.ok(run.stdout.includes(`# ${key}\n`), key);
  assert.equal(run.stderr, '');
  await writeFile(resolve(root, logPath), run.stdout, { flag: 'wx' });
  const paths = [docPath, resultPath, ...expectedHashes.keys(), candidatePath, inventoryPath,
    `${prefix}/preflight.json`, 'outputs/ap23d3-abnahme-2026-10-15/receipt.json', ...scriptPaths, ...testPaths, logPath];
  const bindings = await Promise.all([...new Set(paths)].sort().map(boundFile));
  const qa = {
    verificationId: 'MVP08-R08A2-LOCAL-VERIFICATION-20261015', checkedOn: '2026-10-15',
    startedAt, completedAt: new Date().toISOString(), technicalValidationPassed: true,
    humanApproval: false, sourceReleaseApproved: false, dataPromotionApproved: false, publicationApproved: false,
    productDataChanged: false, deploymentPerformed: false, counts: report.counts, normChangeCounts: report.normChangeCounts,
    acceptedArchive: report.acceptedSnapshot,
    tests: { command: 'node --test ' + testPaths.join(' '), node: process.version, passed: 44, failed: 0, skipped: 0, cancelled: 0, logPath },
    humanReadableReport: docPath, localReportLinksChecked: localLinks.length, bindings,
    limitations: ['Technical validation checks evidence identity and coverage, not legal truth or human release approval.',
      'No product tests were relabelled as fresh. Earlier R08-A1 regression and AP23D3 evidence retain their actual execution dates.',
      'The later local data/build decision is separate. No commits, public writes, installations or operational changes.']
  };
  await writeFile(resolve(root, qaPath), encode(qa), { flag: 'wx' });
  assert.deepEqual(JSON.parse(await readFile(resolve(root, qaPath))), qa);
  await boundFile(qaPath);
  console.log(JSON.stringify({ mode: 'qa-created', qaPath, sha256: hash(encode(qa)), counts: report.counts,
    tests: qa.tests, boundFiles: bindings.length, localReportLinksChecked: localLinks.length }, null, 2));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
