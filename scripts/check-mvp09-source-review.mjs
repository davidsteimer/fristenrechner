// SPDX-License-Identifier: AGPL-3.0-only
// Local evidence QA only, no product mutation or approval.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { lstat, writeFile } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { consolidate, encode, hash, readRegular, root, prefix, resultPath, candidatePath, inventoryPath } from './consolidate-mvp09-sources.mjs';

const qaPath = prefix + '/source-review-verification.json';
const logPath = prefix + '/source-review-tests.txt';
const docPath = 'docs/fachrecht/quellenabgleich-mvp09.md';
const testPaths = ['tests/governance/ap23e3-acceptance.test.mjs',
  'tests/governance/mvp09-source-inventory.test.mjs', 'tests/governance/mvp09-source-coverage.test.mjs'];
const scriptPaths = ['scripts/archive-ap23e3-acceptance.mjs', 'scripts/inventory-mvp09-sources.mjs',
  'scripts/consolidate-mvp09-sources.mjs', 'scripts/check-mvp09-source-review.mjs'];
const expectedTestCount = 68;
export function testCounts(log) {
  const counts = {};
  for (const key of ['tests', 'pass', 'fail', 'skipped', 'cancelled', 'todo']) {
    const matches = [...log.matchAll(new RegExp('^# ' + key + ' (\\d+)\\r?$', 'gm'))];
    assert.equal(matches.length, 1, key);
    counts[key] = Number(matches[0][1]);
  }
  assert.equal(counts.tests, expectedTestCount);
  assert.equal(counts.pass, counts.tests);
  for (const key of ['fail', 'skipped', 'cancelled', 'todo']) assert.equal(counts[key], 0);
  return counts;
}
export function validateSealedQa(qa, report, bindings, log, localLinkCount) {
  assert.equal(qa.verificationId, 'MVP09-R09A2-LOCAL-VERIFICATION-20261018');
  assert.equal(qa.checkedOn, report.checkedOn);
  assert.equal(qa.technicalValidationPassed, true);
  for (const field of ['humanApproval', 'sourceReleaseApproved', 'dataPromotionApproved',
    'publicationApproved', 'productDataChanged', 'deploymentPerformed']) assert.equal(qa[field], false);
  assert.deepEqual(qa.counts, report.counts);
  assert.deepEqual(qa.acceptedArchive, report.acceptedSnapshot);
  assert.equal(qa.humanReadableReport, docPath);
  assert.equal(qa.localReportLinksChecked, localLinkCount);
  assert.deepEqual(qa.bindings, bindings, 'Sealed QA must bind the exact expected file set');
  assert.equal(qa.tests.command, 'node --test ' + testPaths.join(' '));
  assert.equal(qa.tests.logPath, logPath);
  assert.match(qa.tests.node, /^v\d+\.\d+\.\d+$/);
  for (const [key, value] of Object.entries(testCounts(log))) assert.equal(qa.tests[key], value);
}
async function boundFile(path) {
  const bytes = await readRegular(root, path);
  return { path, byteLength: bytes.length, sha256: hash(bytes) };
}
export async function main() {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--write'));
  const report = await consolidate();
  assert.deepEqual(await readRegular(root, resultPath), encode(report), 'Consolidated report must reproduce exactly');
  assert.equal(report.counts.sourceIds, 251);
  assert.equal(report.counts.referenceEdges, 2136);
  assert.equal(report.counts.newReferenceEdges, 58);
  assert.equal(report.counts.protectedFilesUnchanged, 624);
  assert.equal(report.counts.groups.baseline.sourceIds, 77);
  assert.equal(report.counts.groups.calendar.sourceIds, 155);
  assert.equal(report.counts.groups.administrative.sourceIds, 19);
  const doc = (await readRegular(root, docPath)).toString('utf8');
  assert.ok(doc.includes('noch nicht abgenommen') && doc.includes('R09-B'), 'Report must retain the human acceptance gate');
  assert.ok(!doc.includes(';'), 'Swiss prose without semicolons');
  const localLinks = [...doc.matchAll(/\]\(([^)]+)\)/g)].map(m => m[1]).filter(link => !/^https?:|^#/.test(link));
  for (const link of localLinks) {
    const path = relative(root, resolve(root, dirname(docPath), link.split('#')[0]));
    assert.ok(!path.startsWith('..'));
    if (path !== qaPath) await boundFile(path);
  }
  const paths = [docPath, resultPath, ...report.partialReports.map(item => item.path), candidatePath, inventoryPath,
    prefix + '/preflight.json', 'outputs/ap23e3-abnahme-2026-10-18/receipt.json',
    'docs/fachrecht/abnahme-ap23e3.md', 'docs/fachrecht/quellenpruefplan-mvp09.md',
    ...scriptPaths, ...testPaths, logPath];
  if (process.argv[2] !== '--write') {
    const qa = JSON.parse(await readRegular(root, qaPath));
    const bindings = await Promise.all([...new Set(paths)].sort().map(boundFile));
    validateSealedQa(qa, report, bindings, (await readRegular(root, logPath)).toString('utf8'), localLinks.length);
    console.log(JSON.stringify({ mode: 'read-only-reverified', qaPath, counts: report.counts, tests: qa.tests }, null, 2));
    return;
  }
  for (const path of [qaPath, logPath]) {
    try { await lstat(resolve(root, path)); assert.fail('Refusing to replace QA: ' + path); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const startedAt = new Date().toISOString();
  const run = spawnSync(process.execPath, ['--test', ...testPaths], {
    cwd: root, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024
  });
  assert.equal(run.status, 0, run.stdout + run.stderr);
  const counts = testCounts(run.stdout);
  assert.equal(run.stderr, '');
  // Recheck data/evidence after tests, before sealing.
  assert.deepEqual(encode(await consolidate()), encode(report), 'Inputs changed during QA');
  await writeFile(resolve(root, logPath), run.stdout, { flag: 'wx' });
  const bindings = await Promise.all([...new Set(paths)].sort().map(boundFile));
  const qa = {
    verificationId: 'MVP09-R09A2-LOCAL-VERIFICATION-20261018', checkedOn: report.checkedOn,
    startedAt, completedAt: new Date().toISOString(), technicalValidationPassed: true,
    humanApproval: false, sourceReleaseApproved: false, dataPromotionApproved: false, publicationApproved: false,
    productDataChanged: false, deploymentPerformed: false,
    counts: report.counts, acceptedArchive: report.acceptedSnapshot,
    tests: { command: 'node --test ' + testPaths.join(' '), node: process.version, ...counts, logPath },
    humanReadableReport: docPath, localReportLinksChecked: localLinks.length, bindings,
    limitations: ['Evidence integrity and coverage are not legal or human acceptance.',
      'Fresh content, version-screen evidence and historical reuse remain distinguishable.',
      'No product regression has been relabelled as newly executed in A2.',
      'No product data, builds, pins, commits, uploads, external writes or deployments.']
  };
  validateSealedQa(qa, report, bindings, run.stdout, localLinks.length);
  await writeFile(resolve(root, qaPath), encode(qa), { flag: 'wx' });
  assert.deepEqual(JSON.parse(await readRegular(root, qaPath)), qa);
  console.log(JSON.stringify({ mode: 'qa-created', qaPath, sha256: hash(encode(qa)), counts: report.counts,
    tests: qa.tests, boundFiles: bindings.length, localReportLinksChecked: localLinks.length }, null, 2));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
