// SPDX-License-Identifier: AGPL-3.0-only
// Records completed local checks, not human approval or data promotion.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const root = process.cwd();
const buildDirectory = process.argv[2];
assert.ok(buildDirectory, 'Pass the completed isolated build directory');
const buildRoot = resolve(root, buildDirectory);
assert.ok(buildRoot.startsWith(resolve(root, '.work') + '/'));
const read = path => readFileSync(resolve(root, path));
const json = path => JSON.parse(read(path).toString('utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const hash = path => sha(read(path));
const evidenceFor = path => ({ path, sha256: hash(path) });
const checks = [];
for (const [id, path, expected] of [
  ['core-ui', '.work/ap20c1-core-ui-tests-final.log', 1354],
  ['governance', '.work/ap20c1-governance-tests.log', 133],
  ['public-app', '.work/ap20c1-public-tests.log', 12],
  ['spfx-loader', relative(root, resolve(buildRoot, 'step-1.log')), 106],
  ['spfx-built', relative(root, resolve(buildRoot, 'final-built-tests.log')), 48]
]) {
  const log = read(path).toString('utf8');
  assert.match(log, new RegExp(`# tests ${expected}\\b`), id);
  assert.match(log, new RegExp(`# pass ${expected}\\b`), id);
  assert.match(log, /# fail 0\b/, id);
  assert.doesNotMatch(log, /^not ok /m, id);
  checks.push({ id, passed: expected, failed: 0, evidence: evidenceFor(path) });
}
assert.equal(read('.work/ap20c1-typecheck.log').length, 0);
checks.push({ id: 'typecheck', status: 'passed', evidence: evidenceFor('.work/ap20c1-typecheck.log') });
const historical = json('outputs/ap20b-2026-09-30/pruefprotokoll.json');
for (const item of historical.evidence) assert.equal(hash(item.path), item.sha256, item.path);
assert.equal(hash('outputs/ap20b-2026-09-30/pruefprotokoll.json'), '8d67ad7b6e0541104cfa7e8f124cf1e206cdbe6c82111b287dcc4ae54cf9c25d');
const manifestPath = 'data/candidates/2026-09-30-ap20c1/manifest.json';
const manifest = json(manifestPath);
assert.equal(hash(manifestPath), 'deb308e319a47eaf80f9056b88ee2bc9ff56c0500e70269fb0bc54e91a1900b5');
assert.equal(manifest.releaseStatus, 'candidate');
for (const item of manifest.artifacts) {
  const bytes = read('data/candidates/2026-09-30-ap20c1/' + item.path);
  assert.equal(sha(bytes), item.sha256); assert.equal(bytes.length, item.byteLength);
}
const build = JSON.parse(readFileSync(resolve(buildRoot, 'verification.json'), 'utf8'));
assert.equal(build.passed, true); assert.ok(build.steps.every(step => step.exitCode === 0));
assert.equal(hash('spfx/sharepoint/solution/fristenrechner-schweiz.sppkg'), build.originalHash);
assert.equal(build.originalHashAfter, build.originalHash);
const files = [
  'docs/architektur/implementierung-ap20c1.md', 'docs/fachrecht/quellenkontrolle-ap20c1.md',
  'docs/entscheidungen/DEC-2026-026-beschluss.md',
  'outputs/ap20c1-2026-09-30/quellenkontrolle.json', 'outputs/ap20c1-2026-09-30/source-refresh.py',
  'outputs/ap20c1-2026-09-30/build-verification.json', manifestPath,
  'schemas/social-procedure-catalog-v2.schema.json', 'schemas/release-manifest-v6.schema.json',
  'src/core/socialTypes.ts', 'src/core/socialCatalog.ts', 'src/core/socialDeadline.ts', 'src/core/data.ts', 'src/core/calculateSpecialDeadline.ts',
  'src/ui/socialUi.ts', 'src/ui/vrpgSelection.ts', 'src/ui/socialMessages.ts', 'src/ui/FristenrechnerApp.tsx',
  'src/ui/preview/main.tsx', 'src/ui/preview/qaPresets.ts', 'src/release/ap20c1CandidateData.ts',
  'spfx/src/core/ReleaseValidator.ts', 'spfx/scripts/sync-schemas.mjs',
  'scripts/build-ap20c1-candidate.mjs', 'scripts/build-ap20c1-candidate.d.mts', 'scripts/check-ap19c-spfx-build.mjs',
  'tests/core/ap20c1-consumer.test.ts', 'tests/core/ap20c1-eog.test.ts', 'tests/ui/ap20c1-eog.test.ts',
  'spfx/test/ap20c1-loader.test.ts', 'spfx/test/release-service.test.ts', 'spfx/test-build/ap20c1.test.cjs',
  'package.json', 'scripts/record-ap20c1-checks.mjs'
];
const report = {
  formatVersion: 'ap20c1-local-verification-1', checkedOn: '2026-09-30', status: 'ready-for-review', humanApproval: false,
  contractDecision: 'DEC-2026-026 approved', productIntegrationPerformed: true, operationallyReleased: false,
  scope: { newLaws: ['EOG'], newNationalRules: 4, newBernBindings: 6, totalNationalRules: 28, totalBernBindings: 34,
    sourceWindow: { from: '2026-01-01', to: '2027-12-31' }, candidateEligibility: 34, approval: null },
  candidateManifest: evidenceFor(manifestPath), checks, countsAreNotAdditive: true,
  eogTests: { totalNewCoreAndUi: 137, dateVectors: 10, dateCases: 60, priorPathComparisons: 28 },
  preservation: { frozenAp20bFiles: historical.evidence.length, priorRules: 24, priorBindings: 28, otherArtifacts: 9,
    originalPackageSha256: build.originalHash, originalPackageUnchanged: true, historicalPinsChanged: false },
  isolatedBuild: { path: relative(root, buildRoot), passed: true, stepExitCodes: build.steps.map(step => step.exitCode),
    testPackageSha256: build.testPackageSha256, deployableRelease: false,
    verification: evidenceFor(relative(root, resolve(buildRoot, 'verification.json'))) },
  browser: { host: 'local-in-app-browser', url: 'http://127.0.0.1:8795/?candidate=ap20c1&qa=ap20c1-eog',
    performed: ['DE/FR render', 'two-column form and four buttons', 'cantonal versus noncantonal court fields',
      'explicit office canton', 'dependent fields reset on route change', 'service date retained on route change',
      'complete cantonal case blocked not-released with no end date', 'empty dates and case facts after reload', 'no console warnings or errors'],
    liveM365: false, guest: false, manualApproval: false,
    note: 'Native date keyboard events used to commit real React state. DOM-only fill was not counted as a passing input test.' },
  publication: { githubIssues: [35, 41], sourceCommit: false, sourcePush: false, deployment: false, permissionsChanged: false },
  limitations: ['No human AP20C1 acceptance yet', 'Positive calculations only under in-memory synthetic test approval',
    'No new source-release approval or promotion', 'No SharePoint Teams guest or public-production tests',
    'FamZG FLG MVG UELG not integrated', 'Source refresh remains required before release'],
  evidence: files.map(evidenceFor)
};
const target = resolve(root, 'outputs/ap20c1-2026-09-30/pruefprotokoll.json');
writeFileSync(target, JSON.stringify(report, null, 2) + '\n');
assert.deepEqual(JSON.parse(readFileSync(target, 'utf8')), report);
console.log(JSON.stringify({ report: relative(root, target), sha256: sha(readFileSync(target)), checks: checks.map(({id, passed, status}) => ({id, passed, status})), evidenceFiles: files.length }));
