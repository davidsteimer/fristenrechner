// SPDX-License-Identifier: AGPL-3.0-only
// Read-only diagnostic after the closed standard portability gate failed.
// Never alters the validator or substitutes an official source URL.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const prefix = 'outputs/release-mvp09-2026-10-18/portability-standard-no-private-20261018-01';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const inventoryBytes = await readFile(resolve(root, prefix, 'input-inventory.json'));
const inputs = JSON.parse(inventoryBytes), stage = resolve(root, inputs.stage);
assert.match(inputs.stage, /^\.work\/mvp09-standard-no-private-[A-Za-z0-9]+$/);
for (const file of inputs.files) assert.equal(hash(await readFile(resolve(stage, file.path))), file.sha256);
const startedAt = new Date().toISOString();
const executable = resolve(root, '.venv/bin/python');
const args = ['-m', 'unittest', 'discover', '-s', 'tests/governance', '-p', 'test_*.py'];
const child = spawnSync(executable, args, { cwd: stage, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
if (child.error) throw child.error;
const log = Buffer.from((child.stdout ?? '') + (child.stderr ?? ''));
const logPath = `${prefix}/diagnostic-python-governance.log`;
await writeFile(resolve(root, logPath), log, { flag: 'wx' });
const tests = Number(log.toString().match(/^Ran (\d+) tests? in /m)?.[1] ?? 0);
const diagnosticPassed = child.status === 0 && tests > 0 && /^OK\s*$/m.test(log.toString())
  && !/\b(?:skipped|expected failure|unexpected success)\b/i.test(log.toString());
for (const file of inputs.files) assert.equal(hash(await readFile(resolve(stage, file.path))), file.sha256);
const schemaLogPath = `${prefix}/governance-schema.log`, schemaLog = await readFile(resolve(root, schemaLogPath));
assert.match(schemaLog.toString(), /SRC-AP23E1-AR-MATERIAL-20180703: officialUrl verweist nicht auf eine zugelassene amtliche Domain/);
const validatorPath = 'tests/governance/validate_source_reviews.py';
const validatorBytes = await readFile(resolve(root, validatorPath));
assert.equal(hash(validatorBytes), inputs.files.find(file => file.path === validatorPath).sha256);
const status = { kind: 'mvp09PortabilityScopeBlocker', status: 'blocked-awaiting-bounded-scope-addition',
  recordedAt: new Date().toISOString(), standardPortabilityPassed: false,
  inputInventory: { path: `${prefix}/input-inventory.json`, sha256: hash(inventoryBytes), byteLength: inventoryBytes.length },
  isolatedInputBytesUnchanged: true, actualValidatorUnchanged: true,
  issue: { sourceId: 'SRC-AP23E1-AR-MATERIAL-20180703', officialHost: 'ar.ch',
    validatorPath, validatorSha256: hash(validatorBytes),
    cause: 'Accepted official AR material uses ar.ch. The existing exact official-domain whitelist does not yet include ar.ch.',
    requiredAddition: 'Add exactly ar.ch to OFFICIAL_HOSTS with a narrow positive/negative provenance regression test. Keep the source URL, data release, calculation rules and other host rules unchanged.',
    existingTestContractOutsideListedR09BPaths: true, additionalAuthorizationRequired: true,
    workaroundApplied: false, unapprovedValidatorPatchApplied: false },
  failedSchemaEvidence: { path: schemaLogPath, sha256: hash(schemaLog), byteLength: schemaLog.length },
  furtherDiagnostic: { command: [executable, ...args], startedAt, finishedAt: new Date().toISOString(),
    exitCode: child.status, tests, passed: diagnosticPassed,
    log: { path: logPath, sha256: hash(log), byteLength: log.length } },
  productPortabilityStarted: false, newBuildStartedByThisDiagnostic: false,
  installationPerformed: false, uploaded: false, githubPushPerformed: false };
await writeFile(resolve(root, prefix, 'blocked-status.json'), encode(status), { flag: 'wx' });
console.log(JSON.stringify({ status: status.status, furtherDiagnostic: status.furtherDiagnostic,
  statusPath: `${prefix}/blocked-status.json`, sha256: hash(encode(status)) }));
process.exitCode = diagnosticPassed ? 0 : 1;
