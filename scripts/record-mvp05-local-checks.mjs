// SPDX-License-Identifier: AGPL-3.0-only
// Local verification receipt, never an operational approval.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = 'outputs/release-mvp05-2026-09-28';
const read = p => readFile(resolve(root, p));
const hash = b => createHash('sha256').update(b).digest('hex');
const inputs = {
  product: '.work/mvp05-release-check.log',
  governance: '.work/mvp05-release-governance.log',
  data: '.work/mvp05-release-data-final.log',
  promotion: '.work/mvp05-release-promotion-tests.log'
};
const files = new Map();
const logs = {};
for (const [id, path] of Object.entries(inputs)) {
  const bytes = await read(path);
  const text = bytes.toString();
  const normalized = text.replaceAll(root.replace(/\/$/, ''), '<REPOSITORY>').replace(/\/Users\/[^/\s]+/g, '<USER>');
  const archivePath = `${out}/build-evidence/logs/local-${id}.txt`;
  files.set(archivePath, Buffer.from(normalized));
  logs[id] = { sourcePath: path, sourceSha256: hash(bytes), archivePath, archivedSha256: hash(normalized) };
}
const text = id => files.get(logs[id].archivePath).toString();
assert.deepEqual([...text('product').matchAll(/^# tests (\d+)$/gm)].map(m => Number(m[1])), [1213, 12]);
assert.deepEqual([...text('product').matchAll(/^# fail (\d+)$/gm)].map(m => Number(m[1])), [0, 0]);
assert.match(text('product'), /tsc --noEmit/);
assert.match(text('product'), /build:public/);
assert.match(text('governance'), /Ran 24 tests/);
assert.match(text('governance'), /\nOK\n/);
assert.match(text('governance'), /^# tests 109$/m);
assert.match(text('governance'), /^# fail 0$/m);
assert.match(text('data'), /Ran 142 tests/);
assert.match(text('data'), /\nOK\n/);
assert.match(text('promotion'), /^# tests 8$/m);
assert.match(text('promotion'), /^# fail 0$/m);
const preserved = JSON.parse(await read('.work/mvp05-release-preservation.json'));
assert.equal(preserved.passed, true);
assert.equal(preserved.count, 69);
const acceptance = 'docs/fachrecht/abnahme-ap19c3.md';
const rows = [...(await read(acceptance)).toString().matchAll(/\| \[[^\]]+\]\(([^)]+)\) \| `([0-9a-f]{64})` \|/g)];
assert.equal(rows.length, 10);
const acceptedC3 = [];
for (const [, path, expected] of rows) {
  const resolved = resolve(root, dirname(acceptance), path);
  assert.equal(hash(await readFile(resolved)), expected, `Accepted C3 bytes changed: ${path}`);
  acceptedC3.push({ path: relative(root, resolved), sha256: expected });
}
const artifactsPath = `${out}/artifact-verification.json`;
const artifactBytes = await read(artifactsPath);
const artifacts = JSON.parse(artifactBytes);
assert.equal(artifacts.status, 'passed');
const browserPath = `${out}/browser-verification.md`;
const report = { kind: 'mvp05DefinitiveLocalVerification', verifiedOn: '2026-09-28', status: 'passed',
  applicationVersion: '0.5.0', spfxVersion: '0.5.0.0', releaseId: artifacts.releaseId,
  dataPinCommit: artifacts.pinCommit, fullProductCommit: null, workingTreeBuild: true,
  artifactVerification: { path: artifactsPath, sha256: hash(artifactBytes) },
  browserVerification: { path: browserPath, sha256: hash(await read(browserPath)), scope: 'local Chrome smoke test only' },
  automatedChecks: { coreAndUi: 1213, publicBuild: 12, pythonDataIncludingArtifactTests: 142,
    pythonGovernance: 24, nodeGovernance: 109, governanceNegativeCases: 8,
    promotionMutationAndIdempotence: 8, spfxSource: 84, spfxCompiledAndPackage: 42, artifactTestsIncludedInData: 19 },
  logs, preservation: { passed: true, historicalChecks: 68, explicitLiveTestEvolution: 1 },
  acceptedC3, retainedBuildWarnings: ['Two SPFx ESLint no-new-null warnings for the explicit JSON wire contract. No build errors.'],
  permissions: { localDataPromotion: true, localDefinitiveBuild: true, eqInstallation: false,
    publication: false, hostingChanges: false, productionActivation: false },
  remainingGates: ['Exact E/Q installation authorisation and live baseline/rollback check',
    'New E/Q environment tests and manual Q acceptance', 'Publication preflight and separately authorised GitHub push',
    'Green hosting GET-header clarification and separate P deployment/operation approval'] };
files.set(`${out}/local-verification.json`, Buffer.from(JSON.stringify(report, null, 2) + '\n'));
for (const [path, bytes] of files) {
  let existing;
  try { existing = await read(path); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (existing) assert.ok(existing.equals(bytes), `Refusing to overwrite differing evidence: ${path}`);
}
for (const [path, bytes] of files) {
  await mkdir(dirname(resolve(root, path)), { recursive: true });
  try { await writeFile(resolve(root, path), bytes, { flag: 'wx' }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  assert.ok((await read(path)).equals(bytes));
}
console.log(JSON.stringify({ status: 'passed', report: `${out}/local-verification.json`, counts: report.automatedChecks }, null, 2));
