// SPDX-License-Identifier: AGPL-3.0-only
// Bind the actual completed local runs. Never an installation or publication.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyMvp06SourceApproval } from './verify-mvp06-source-approval.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = 'outputs/release-mvp06-2026-10-01';
const read = path => readFile(resolve(root, path));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const files = new Map(), runs = {}, logs = {}, steps = {};
const runPaths = {
  product: '.work/mvp06-product-checks-35PVbG/verification.json',
  governance: '.work/mvp06-data-governance-checks-xLb2nR/verification.json'
};
for (const [phase, path] of Object.entries(runPaths)) {
  const bytes = await read(path), run = JSON.parse(bytes);
  assert.equal(run.passed, true);
  assert.equal(run.releaseId, '2026-10-01-mvp-06-approved.1');
  assert.equal(run.installation, false);
  assert.equal(run.publication, false);
  assert.deepEqual(run.steps.map(step => step.id), phase === 'product'
    ? ['typecheck', 'core-ui', 'public', 'preview-build', 'public-build']
    : ['data-python', 'governance-python', 'governance-validator', 'governance-node', 'approved-data', 'source-approval']);
  const archivePath = `${out}/local-check-evidence/${phase}.json`;
  files.set(archivePath, bytes);
  runs[phase] = { sourcePath: path, archivePath, sha256: hash(bytes) };
  for (const step of run.steps) {
    assert.equal(step.exitCode, 0);
    const content = await read(step.log);
    assert.equal(hash(content), step.sha256);
    assert.equal(content.length, step.byteLength);
    if (step.nodeCounts) {
      const counts = Object.fromEntries([...content.toString().matchAll(/^# (tests|pass|fail|skipped|cancelled) (\d+)$/gm)].map(m => [m[1], Number(m[2])]));
      assert.deepEqual(counts, step.nodeCounts);
      assert.equal(counts.tests, counts.pass);
      for (const key of ['fail', 'skipped', 'cancelled']) assert.equal(counts[key], 0);
    }
    if (step.pythonTests) {
      assert.match(content.toString(), new RegExp(`Ran ${step.pythonTests} tests`));
      assert.match(content.toString(), /\nOK\s*$/);
    }
    const normalized = Buffer.from(content.toString().replaceAll(root.replace(/\/$/, ''), '<REPOSITORY>').replace(/\/Users\/[^/\s]+/g, '<USER>'));
    const logArchive = `${out}/local-check-evidence/${step.id}.log`;
    files.set(logArchive, normalized);
    logs[step.id] = { sourcePath: step.log, sourceSha256: hash(content), archivePath: logArchive,
      archivedSha256: hash(normalized), byteLength: normalized.length };
    steps[step.id] = step;
  }
}
assert.match(files.get(logs['governance-validator'].archivePath).toString(), /8 Negativtests/);
const approval = await verifyMvp06SourceApproval(root);
assert.equal(approval.verifiedEvidenceFiles, 170);
const artifactPath = `${out}/artifact-verification.json`, artifactBytes = await read(artifactPath), artifacts = JSON.parse(artifactBytes);
assert.equal(hash(artifactBytes), 'b1605744fe22e21aa012a78cb941ea5573fe4962fb1e11ad09b6331116f752ad');
assert.equal(artifacts.status, 'passed');
for (const item of artifacts.artifacts) assert.equal(hash(await read(`${out}/artifacts/${item.path}`)), item.sha256);
for (const item of artifacts.archivedBuildEvidence) assert.equal(hash(await read(item.path)), item.sha256);
const build = JSON.parse(await read(artifacts.spfxBuildEvidence.path));
assert.equal(build.passed, true);
assert.equal(build.packageSha256, artifacts.artifacts.find(item => item.path.endsWith('.sppkg')).sha256);
const sourceLog = await read(`${out}/build-evidence/logs/step-1.txt`);
const builtLog = await read(`${out}/build-evidence/logs/step-5.txt`);
for (const [content, count] of [[sourceLog, 145], [builtLog, 68]]) {
  assert.match(content.toString(), new RegExp(`^# tests ${count}$`, 'm'));
  assert.match(content.toString(), /^# fail 0$/m);
}
const browserPath = `${out}/browser-verification.md`;
const historyPaths = [
  `${out}/preparation-inputs.json`, `${out}/source-governance-adoption.json`,
  `${out}/historical-test-baseline/manifest.json`, `${out}/historical-test-baseline/ap20b-reference-test-adaptation.json`,
  `${out}/historical-test-baseline/ap20-candidate-reproduction-addendum.json`, `${out}/historical-it-baseline/manifest.json`,
  'docs/architektur/mvp06-testvertrag-fortschreibung.md'
];
const history = [];
for (const path of historyPaths) history.push({ path, sha256: hash(await read(path)) });
const report = { kind: 'mvp06DefinitiveLocalVerification', verifiedOn: '2026-10-01', status: 'passed',
  applicationVersion: '0.6.0', spfxVersion: '0.6.0.0', releaseId: artifacts.releaseId,
  dataPinCommit: artifacts.pinCommit, fullProductCommit: null, workingTreeBuild: true,
  artifactVerification: { path: artifactPath, sha256: hash(artifactBytes) },
  browserVerification: { path: browserPath, sha256: hash(await read(browserPath)), scope: 'local Chrome smoke test of the extracted final web archive only' },
  automatedChecks: { coreAndUi: steps['core-ui'].nodeCounts.pass, publicBuild: steps.public.nodeCounts.pass,
    pythonDataIncludingArtifactTests: steps['data-python'].pythonTests, pythonGovernance: steps['governance-python'].pythonTests,
    nodeGovernance: steps['governance-node'].nodeCounts.pass, governanceNegativeCases: 8,
    spfxSource: 145, spfxCompiledAndPackage: 68, artifactTestsIncludedInData: 27 },
  runs, logs, historicalBindings: history, sourceApprovalVerified: approval,
  retainedBuildWarnings: ['Two known no-new-null ESLint warnings for JSON contract fields',
    'Heft/Jest has no separate suites. The source and compiled Node test runs are counted separately.'],
  interimRunIssues: ['Obsolete normal-entry expectations corrected with original tests archived',
    'Historical AP20B test binding preserved through one exact immutable archive resolution',
    'One SPFx run timed out during simultaneous heavy suites. Final separate run passed with unchanged timeouts.'],
  permissions: artifacts.permissions,
  remainingGates: ['Explicit exact E/Q installation authorisation and fresh baseline/rollback checks',
    'New E/Q matrix and manual Q acceptance', 'P06-01 public-checkout evidence separation and publication preflight',
    'Separately authorised GitHub push', 'Fresh hosting check, separate P deployment and operating decision'] };
files.set(`${out}/local-verification.json`, encode(report));
for (const [path, bytes] of files) {
  try { assert.ok((await read(path)).equals(bytes), `Refusing to overwrite differing evidence: ${path}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
for (const [path, bytes] of files) {
  await mkdir(dirname(resolve(root, path)), { recursive: true });
  try { await writeFile(resolve(root, path), bytes, { flag: 'wx' }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  assert.ok((await read(path)).equals(bytes));
}
console.log(JSON.stringify({ status: 'passed', report: `${out}/local-verification.json`, sha256: hash(encode(report)), counts: report.automatedChecks }, null, 2));
