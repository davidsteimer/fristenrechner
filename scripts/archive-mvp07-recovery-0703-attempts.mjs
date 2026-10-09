// SPDX-License-Identifier: AGPL-3.0-only
// Separate immutable evidence of unsuccessful local build attempts. No main-archive edits.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const OUT = 'outputs/recovery-mvp07-0.7.0.3-build-attempts-2026-10-09';
const SELF = 'scripts/archive-mvp07-recovery-0703-attempts.mjs';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = file => readFile(resolve(ROOT, file));
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const attempts = [
  { stage: '.work/mvp07-recovery-0703-cLpTiJ', id: 'attempt-01-timeout',
    reportSha256: 'eb980e984aa4c8672c9b3a6f6d6a4f51c867771d261ff5f9f4cd64003b1deece',
    packageLogSha256: '4867695723327ea78d0953cb746732393a9e339667137e3266d1ae5d363a5080',
    packageTestCounts: { tests: 9, pass: 8, fail: 0, cancelled: 1, skipped: 0, todo: 0 },
    cause: 'Die auf die gesamte Pakettestdatei angewendete 60-Sekunden-Grenze brach den Lauf nach acht bestandenen Einzeltests ab.',
    correction: 'Ausschliesslich das Zeitlimit dieser Datei wurde auf 180 Sekunden erhöht. Es gab keine Änderung an Produktquellen oder Testfällen.' },
  { stage: '.work/mvp07-recovery-0703-fUo4nF', id: 'attempt-02-verifier',
    reportSha256: '627f4c414b86f558c94f41b78e909f4614341a0c3bf72e1c70881985cd326ec5',
    packageLogSha256: '6658e34d54fd9fd0afdf73f86a1546dcdcfc1b6ba489da731d210a93daf01dc5',
    packageTestCounts: { tests: 11, pass: 11, fail: 0, cancelled: 0, skipped: 0, todo: 0 },
    cause: 'Nach 32 bestandenen Quelltests und elf bestandenen Pakettests hielt der Bytevergleich wegen einer falschen Annahme des Verifikators zur minifizierten SCSS-Referenzform an.',
    correction: 'Die Prüfung wurde anhand beider tatsächlicher Bundles auf vier konkrete className-Referenzen und eine konkrete const-Referenz berichtigt. Klassen und Vorkommenszahlen bleiben exakt gebunden. Der vollständige Paketvergleich bestand danach für beide Vorläufe. Ein neuer vollständiger Build erfolgte mit eingefrorenem korrigiertem Verifikator.' }
];

assert.equal(process.argv.length, 2, 'Only this fixed local evidence archive is supported');
const rows = [];
for (const attempt of attempts) {
  const reportBytes = await read(`${attempt.stage}/verification.json`), report = JSON.parse(reportBytes);
  const logBytes = await read(`${attempt.stage}/step-5.log`), log = logBytes.toString();
  assert.equal(hash(reportBytes), attempt.reportSha256); assert.equal(hash(logBytes), attempt.packageLogSha256);
  assert.equal(report.passed, false); assert.equal(report.frozenEvidenceUnchanged, true);
  assert.equal(report.installationAuthorized, false); assert.equal(report.deploymentPerformed, false);
  assert.equal(report.steps.length, 5);
  for (const [key, value] of Object.entries(attempt.packageTestCounts)) assert.match(log, new RegExp(`^# ${key} ${value}$`, 'm'));
  if (attempt.id === 'attempt-01-timeout') { assert.match(log, /test timed out after 60000ms/); assert.equal(report.steps[4].exitCode, 1); }
  else { assert.match(report.error, /Current SCSS export: host/); assert.equal(report.steps[4].exitCode, 0); }
  const pkg = await read(`${attempt.stage}/spfx/sharepoint/solution/fristenrechner-schweiz.sppkg`);
  rows.push({ ...attempt, passed: false, isFinalCandidate: false, sourceTestsPassed: 32,
    packageSha256: hash(pkg), packageByteLength: pkg.length,
    protectionCheckPassed: true, contributesToFinalPassedTestCount: false });
}
await mkdir(resolve(ROOT, OUT));
const archivedFiles = [];
async function archive(path, bytes, originalHash) {
  const file = `${OUT}/${path}`; await mkdir(dirname(resolve(ROOT, file)), { recursive: true });
  await writeFile(resolve(ROOT, file), bytes, { flag: 'wx' });
  assert.equal(hash(await read(file)), hash(bytes));
  archivedFiles.push({ path, byteLength: bytes.length, sha256: hash(bytes), ...(originalHash ? { originalSha256: originalHash } : {}) });
}
function sanitize(bytes) {
  return Buffer.from(bytes.toString().replaceAll(pathToFileURL(ROOT).href, '<repository>/')
    .replaceAll(ROOT, '<repository>/').replace(/\/Users\/[^/\s]+/g, '/Users/<user>'));
}
for (const row of rows) {
  const report = await read(`${row.stage}/verification.json`);
  await archive(`${row.id}/verification.sanitized.json`, sanitize(report), hash(report));
  for (let index = 1; index <= 5; index++) {
    const bytes = await read(`${row.stage}/step-${index}.log`);
    await archive(`${row.id}/step-${index}.log`, sanitize(bytes), hash(bytes));
  }
}
await archive(`implementation/${SELF}`, await read(SELF));
const manifest = { kind: 'mvp07Recovery0703UnsuccessfulLocalAttempts', archivedAt: new Date().toISOString(),
  localOnly: true, installationAuthorized: false, deploymentPerformed: false, publicationAuthorized: false,
  scope: 'Separate preserved evidence. Neither attempt is represented as a passed final candidate. The later final package is archived separately.',
  attempts: rows, archivedFiles };
await writeFile(resolve(ROOT, OUT, 'attempt-verification.json'), json(manifest), { flag: 'wx' });
for (const row of archivedFiles) assert.equal(hash(await read(`${OUT}/${row.path}`)), row.sha256);
console.log(json({ archive: OUT, preservedUnsuccessfulAttempts: rows.length, archivedFiles: archivedFiles.length,
  sha256: hash(await read(`${OUT}/attempt-verification.json`)), installationAuthorized: false }));
