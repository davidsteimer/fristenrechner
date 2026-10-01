// SPDX-License-Identifier: AGPL-3.0-only
// Bind completed local checks and preserved preimages. No human or operational approval.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const root = process.cwd();
assert.ok(process.argv[2], 'Pass the completed isolated build directory');
const buildRoot = resolve(root, process.argv[2]);
assert.ok(buildRoot.startsWith(resolve(root, '.work') + '/'));
const read = p => readFileSync(resolve(root, p));
const json = p => JSON.parse(read(p).toString('utf8'));
const sha = b => createHash('sha256').update(b).digest('hex');
const hash = p => sha(read(p));
const evidenceFor = p => ({ path: p, sha256: hash(p) });
const checks = [];
for (const [id, p, expected] of [
  ['core-ui', '.work/ap20c3-core-ui-final.log', 1694],
  ['governance', '.work/ap20c3-governance.log', 133],
  ['public-app', '.work/ap20c3-public.log', 12],
  ['spfx-loader', relative(root, resolve(buildRoot, 'step-1.log')), 140],
  ['spfx-built', relative(root, resolve(buildRoot, 'step-5.log')), 65]
]) {
  const log = read(p).toString('utf8');
  assert.match(log, new RegExp(`# tests ${expected}\\b`));
  assert.match(log, new RegExp(`# pass ${expected}\\b`));
  assert.match(log, /# fail 0\b/);
  assert.doesNotMatch(log, /^\s*not ok /m);
  checks.push({ id, passed: expected, failed: 0, evidence: evidenceFor(p) });
}
assert.equal(read('.work/ap20c3-typecheck.log').length, 0);
checks.push({ id: 'typecheck', status: 'passed', evidence: evidenceFor('.work/ap20c3-typecheck.log') });

const c2Path = 'outputs/ap20c2-2026-10-01/pruefprotokoll.json';
assert.equal(hash(c2Path), '311cb80a027c0de883a7c07c46ba59e150065bdad3657a2c4947dec0bbacb2e9');
const c2 = json(c2Path);
assert.equal(c2.evidence.length, 57);
const preimages = [];
for (const entry of c2.evidence) {
  const archived = 'outputs/ap20c3-2026-10-01/ap20c2-baseline/' + entry.path;
  if (existsSync(resolve(root, archived))) {
    assert.equal(hash(archived), entry.sha256, archived);
    preimages.push({ originalPath: entry.path, originalSha256: entry.sha256,
      preservedAt: archived, currentSha256: hash(entry.path) });
  } else assert.equal(hash(entry.path), entry.sha256, 'Unexpected change outside the bounded C3 source delta: ' + entry.path);
}
assert.equal(preimages.length, 8);
assert.equal(hash(c2.preservation.ap20c1Protocol.path), c2.preservation.ap20c1Protocol.sha256);
const acceptancePath = 'docs/fachrecht/abnahme-ap20c2.md';
assert.equal(hash(acceptancePath), '864543a15afb57b205d9a183134a6eeb91bc19aeefd92bbcd9bdefaa2a1bc7b1');
const ap20bPath = 'outputs/ap20b-2026-09-30/pruefprotokoll.json';
assert.equal(hash(ap20bPath), '8d67ad7b6e0541104cfa7e8f124cf1e206cdbe6c82111b287dcc4ae54cf9c25d');
const ap20b = json(ap20bPath);
assert.equal(ap20b.evidence.length, 15);
for (const entry of ap20b.evidence) assert.equal(hash(entry.path), entry.sha256, entry.path);

const sourcePath = 'outputs/ap20c3-2026-10-01/quellenkontrolle.json';
assert.equal(hash(sourcePath), 'b7cfc44bb809f66ff8bbb55e30580710e4716a63253d4125ed6874c55c2b518c');
const source = json(sourcePath);
assert.equal(source.reviewId, 'AP20C3-SOURCE-CONTROL-20261001');
assert.equal(source.checkedOn, '2026-10-01');
assert.equal(source.noDeltaInCheckedScope, true);
assert.deepEqual(source.errors, []);
for (const entry of source.baselineBindings) assert.equal(hash(entry.path), entry.sha256, entry.path);

const candidateRoot = 'data/candidates/2026-10-01-ap20c3/';
const manifestPath = candidateRoot + 'manifest.json';
assert.equal(hash(manifestPath), 'b4250a31d226b4f59e0857a857f49e1ea354722b9ff46b9324d70b330f135450');
const manifest = json(manifestPath);
assert.equal(manifest.releaseStatus, 'candidate');
assert.equal(manifest.formatVersion, '6.0.0');
assert.equal(manifest.compatibility.minimumConsumerFormatVersion, '6.0.0');
assert.equal(manifest.artifacts.length, 10);
const artifactChecks = manifest.artifacts.map(artifact => {
  const path = candidateRoot + artifact.path, bytes = read(path);
  assert.equal(sha(bytes), artifact.sha256); assert.equal(bytes.length, artifact.byteLength);
  if (artifact.role !== 'socialProcedureCatalog') assert.ok(bytes.equals(read('data/candidates/2026-10-01-ap20c2/' + artifact.path)));
  return { path, role: artifact.role, sha256: artifact.sha256, byteLength: artifact.byteLength };
});
const catalog = json(candidateRoot + 'social-procedures/ch-social-procedures.json');
const prior = json('data/candidates/2026-10-01-ap20c2/social-procedures/ch-social-procedures.json');
assert.equal(catalog.formatVersion, '2.0.0');
assert.deepEqual(catalog.federalRules.slice(0, 36), prior.federalRules);
assert.deepEqual(catalog.cantonalBindings.slice(0, 42), prior.cantonalBindings);
assert.equal(catalog.federalRules.length, 44); assert.equal(catalog.cantonalBindings.length, 50);
assert.equal(catalog.releaseEligibility.length, 50);
assert.ok(catalog.releaseEligibility.every(entry => entry.status === 'candidate' && entry.approval === null && entry.releaseId === manifest.releaseId));
assert.equal(catalog.federalRules.filter(rule => ['mvg', 'uelg'].includes(rule.law)).length, 8);

const buildVerificationPath = relative(root, resolve(buildRoot, 'verification.json'));
const build = json(buildVerificationPath);
assert.equal(build.passed, true); assert.equal(build.steps.length, 5);
assert.ok(build.steps.every(step => step.exitCode === 0));
assert.equal(build.originalHashAfter, build.originalHash);
assert.equal(hash('spfx/sharepoint/solution/fristenrechner-schweiz.sppkg'), build.originalHash);
assert.equal(hash(relative(root, resolve(buildRoot, 'spfx/sharepoint/solution/fristenrechner-schweiz.sppkg'))), build.testPackageSha256);
const newFiles = [
  'docs/architektur/implementierung-ap20c3.md', 'docs/fachrecht/quellenkontrolle-ap20c3.md',
  acceptancePath, c2Path, ap20bPath, sourcePath,
  'outputs/ap20c3-2026-10-01/source-refresh.py', 'outputs/ap20c3-2026-10-01/build-verification.json',
  manifestPath, 'scripts/build-ap20c3-candidate.mjs', 'scripts/build-ap20c3-candidate.d.mts',
  'src/release/ap20c3CandidateData.ts', 'tests/core/ap20c3-mvg-uelg.test.ts', 'tests/ui/ap20c3-mvg-uelg.test.ts',
  'spfx/test/ap20c3-loader.test.ts', 'spfx/test-build/ap20c3.test.cjs', 'scripts/record-ap20c3-checks.mjs'
];
const files = [...new Set([...c2.evidence.map(entry => entry.path), ...newFiles, ...preimages.map(entry => entry.preservedAt)])];
const report = {
  formatVersion: 'ap20c3-local-verification-1', checkedOn: '2026-10-01', status: 'ready-for-review',
  humanApproval: false, contractDecision: 'DEC-2026-026 approved', productIntegrationPerformed: true, operationallyReleased: false,
  scope: { newLaws: ['MVG', 'UELG'], newNationalRules: 8, newBernBindings: 8, totalNationalRules: 44, totalBernBindings: 50,
    allAp20LawsModelled: ['EOG', 'FAMZG', 'FLG', 'MVG', 'UELG'],
    sourceWindow: { from: '2026-01-01', to: '2027-12-31' }, candidateEligibility: 50, approval: null },
  candidateManifest: evidenceFor(manifestPath), sourceControl: evidenceFor(sourcePath), artifactChecks,
  checks, countsAreNotAdditive: true,
  newTests: { core: 161, ui: 16, dateVectors: 10, dateCases: 80, priorPathComparisons: 42,
    loaderGroups: 17, builtGroups: 9, builtDateCasesWithinOneGroup: 80 },
  preservation: { ap20c2Protocol: evidenceFor(c2Path), ap20c2Acceptance: evidenceFor(acceptancePath), historicalEvidenceFiles: c2.evidence.length,
    historicalPreimages: preimages, frozenAp20bFiles: ap20b.evidence.length, priorRules: 36, priorBindings: 42,
    priorAp20c1Protocol: c2.preservation.ap20c1Protocol, priorAp20c1PreimagesUnchanged: true,
    otherArtifacts: 9, originalPackageSha256: build.originalHash, originalPackageUnchanged: true, historicalPinsChanged: false },
  isolatedBuild: { path: relative(root, buildRoot), passed: true, stepExitCodes: build.steps.map(step => step.exitCode),
    testPackageSha256: build.testPackageSha256, deployableRelease: false,
    verification: evidenceFor(buildVerificationPath), stepLogs: build.steps.map(step => evidenceFor(relative(root, step.log))) },
  browser: { host: 'local-in-app-browser', url: 'http://127.0.0.1:8797/?candidate=ap20c3&qa=ap20c3-mvg',
    observedBy: 'main implementation agent',
    performed: ['DE and FR render', 'two-column layout and four action buttons',
      'MVG objection and appeal complete cases reach not-released only',
      'UELG objection and appeal complete cases reach not-released only',
      'early service date entry', 'law and action change clear case context and retain same-meaning service date',
      'fresh QA default has empty dates and case facts', 'no console warnings or errors'],
    liveM365: false, guest: false, manualApproval: false,
    note: 'Completed browser findings reported by the main implementation agent. Ordered-day and complaint-correction paths are covered by automated tests, not separate complete browser scenarios. Candidate paths intentionally remain not-released in the UI.' },
  publication: { githubIssues: [35, 43], sourceCommit: false, sourcePush: false, deployment: false, permissionsChanged: false },
  limitations: ['No human AP20C3 acceptance yet', 'Synthetic positive calculation approval exists in test memory only',
    'No operative source-release approval or data promotion', 'No SharePoint Teams guest or production tests',
    'National models remain limited to the explicitly modelled Bern bindings and holiday connections', 'Source refresh remains required before release'],
  evidence: files.map(evidenceFor)
};
const target = 'outputs/ap20c3-2026-10-01/pruefprotokoll.json';
const bytes = Buffer.from(JSON.stringify(report, null, 2) + '\n');
if (existsSync(resolve(root, target))) assert.ok(read(target).equals(bytes), 'Refusing to overwrite differing completed evidence');
else writeFileSync(resolve(root, target), bytes, { flag: 'wx' });
assert.deepEqual(json(target), report);
console.log(JSON.stringify({ path: target, sha256: hash(target), checks: checks.map(({id, passed, status}) => ({id, passed, status})), evidenceFiles: files.length, historicalPreimages: preimages.length }));
