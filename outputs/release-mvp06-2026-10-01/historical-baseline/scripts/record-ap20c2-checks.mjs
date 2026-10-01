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
  ['core-ui', '.work/ap20c2-core-ui-final.log', 1517],
  ['governance', '.work/ap20c2-governance.log', 133],
  ['public-app', '.work/ap20c2-public.log', 12],
  ['spfx-loader', relative(root, resolve(buildRoot, 'step-1.log')), 123],
  ['spfx-built', relative(root, resolve(buildRoot, 'step-5.log')), 56]
]) {
  const log = read(p).toString('utf8');
  assert.match(log, new RegExp(`# tests ${expected}\\b`));
  assert.match(log, new RegExp(`# pass ${expected}\\b`));
  assert.match(log, /# fail 0\b/);
  assert.doesNotMatch(log, /^\s*not ok /m);
  checks.push({ id, passed: expected, failed: 0, evidence: evidenceFor(p) });
}
assert.equal(read('.work/ap20c2-typecheck.log').length, 0);
checks.push({ id: 'typecheck', status: 'passed', evidence: evidenceFor('.work/ap20c2-typecheck.log') });
const c1Path = 'outputs/ap20c1-2026-09-30/pruefprotokoll.json';
assert.equal(hash(c1Path), '691d831b5220676a89dd48acf9fcab199f52ba66edcfd90fdc2a86f0d3bd8918');
const c1 = json(c1Path);
const preimages = [];
for (const entry of c1.evidence) {
  const archived = 'outputs/ap20c2-2026-10-01/ap20c1-baseline/' + entry.path;
  if (existsSync(resolve(root, archived))) {
    assert.equal(hash(archived), entry.sha256, archived);
    preimages.push({ originalPath: entry.path, originalSha256: entry.sha256,
      preservedAt: archived, currentSha256: hash(entry.path) });
  } else assert.equal(hash(entry.path), entry.sha256, 'Unexpected change outside the bounded C2 source delta: ' + entry.path);
}
assert.equal(preimages.length, 8);
const ap20bPath = 'outputs/ap20b-2026-09-30/pruefprotokoll.json';
assert.equal(hash(ap20bPath), '8d67ad7b6e0541104cfa7e8f124cf1e206cdbe6c82111b287dcc4ae54cf9c25d');
const ap20b = json(ap20bPath);
for (const e of ap20b.evidence) assert.equal(hash(e.path), e.sha256, e.path);
const manifestPath = 'data/candidates/2026-10-01-ap20c2/manifest.json';
assert.equal(hash(manifestPath), 'e7d1921d7a67adc60e49142fe549f1f6113cf73084f94fd1f0f057d3360cc520');
const manifest = json(manifestPath);
assert.equal(manifest.releaseStatus, 'candidate');
for (const a of manifest.artifacts) {
  const bytes = read('data/candidates/2026-10-01-ap20c2/' + a.path);
  assert.equal(sha(bytes), a.sha256); assert.equal(bytes.length, a.byteLength);
}
const catalog = json('data/candidates/2026-10-01-ap20c2/social-procedures/ch-social-procedures.json');
const prior = json('data/candidates/2026-09-30-ap20c1/social-procedures/ch-social-procedures.json');
assert.deepEqual(catalog.federalRules.slice(0, 28), prior.federalRules);
assert.deepEqual(catalog.cantonalBindings.slice(0, 34), prior.cantonalBindings);
assert.equal(catalog.federalRules.length, 36); assert.equal(catalog.cantonalBindings.length, 42);
assert.equal(catalog.releaseEligibility.length, 42);
assert.ok(catalog.releaseEligibility.every(e => e.status === 'candidate' && e.approval === null));
const build = json(relative(root, resolve(buildRoot, 'verification.json')));
assert.equal(build.passed, true); assert.ok(build.steps.every(s => s.exitCode === 0));
assert.equal(build.originalHashAfter, build.originalHash);
assert.equal(hash('spfx/sharepoint/solution/fristenrechner-schweiz.sppkg'), build.originalHash);
const newFiles = [
  'docs/architektur/implementierung-ap20c2.md', 'docs/fachrecht/quellenkontrolle-ap20c2.md',
  'docs/fachrecht/abnahme-ap20c1.md', 'outputs/ap20c2-2026-10-01/quellenkontrolle.json',
  'outputs/ap20c2-2026-10-01/source-refresh.py', 'outputs/ap20c2-2026-10-01/build-verification.json',
  manifestPath, 'scripts/build-ap20c2-candidate.mjs', 'scripts/build-ap20c2-candidate.d.mts',
  'src/release/ap20c2CandidateData.ts', 'tests/core/ap20c2-family.test.ts', 'tests/ui/ap20c2-family.test.ts',
  'spfx/test/ap20c2-loader.test.ts', 'spfx/test-build/ap20c2.test.cjs', 'scripts/record-ap20c2-checks.mjs'
];
const files = [...new Set([...c1.evidence.map(e => e.path), ...newFiles, ...preimages.map(e => e.preservedAt)])];
const report = {
  formatVersion: 'ap20c2-local-verification-1', checkedOn: '2026-10-01', status: 'ready-for-review',
  humanApproval: false, contractDecision: 'DEC-2026-026 approved', productIntegrationPerformed: true, operationallyReleased: false,
  scope: { newLaws: ['FAMZG', 'FLG'], newNationalRules: 8, newBernBindings: 8, totalNationalRules: 36, totalBernBindings: 42,
    sourceWindow: { from: '2026-01-01', to: '2027-12-31' }, candidateEligibility: 42, approval: null },
  candidateManifest: evidenceFor(manifestPath), checks, countsAreNotAdditive: true,
  newTests: { core: 149, ui: 14, dateVectors: 10, dateCases: 80, priorPathComparisons: 34,
    loaderGroups: 17, builtGroups: 8, builtDateCasesWithinOneGroup: 80 },
  preservation: { ap20c1Protocol: evidenceFor(c1Path), historicalEvidenceFiles: c1.evidence.length,
    historicalPreimages: preimages, frozenAp20bFiles: ap20b.evidence.length, priorRules: 28, priorBindings: 34,
    otherArtifacts: 9, originalPackageSha256: build.originalHash, originalPackageUnchanged: true, historicalPinsChanged: false },
  isolatedBuild: { path: relative(root, buildRoot), passed: true, stepExitCodes: build.steps.map(s => s.exitCode),
    testPackageSha256: build.testPackageSha256, deployableRelease: false,
    verification: evidenceFor(relative(root, resolve(buildRoot, 'verification.json'))) },
  browser: { host: 'local-in-app-browser', url: 'http://127.0.0.1:8796/?candidate=ap20c2&qa=ap20c2-famzg',
    performed: ['DE and FR render', 'two-column layout and four action buttons',
      'FamZG objection and appeal complete cases reach not-released only', 'FLG objection complete case reaches not-released only',
      'case-specific order and court selected separately', 'law and action change clear case context and retain same-meaning service date',
      'fresh load has empty dates and case facts', 'no console warnings or errors'],
    liveM365: false, guest: false, manualApproval: false,
    note: 'Native date fields focused before keyboard events. Rapid unconfirmed UI action batches not counted as passing checks. FLG court and ordered-day variants covered by automated tests, not separate complete browser scenarios.' },
  publication: { githubIssues: [35, 42], sourceCommit: false, sourcePush: false, deployment: false, permissionsChanged: false },
  limitations: ['No human AP20C2 acceptance yet', 'Synthetic positive calculation approval exists in test memory only',
    'No operative source-release approval or data promotion', 'No SharePoint Teams guest or production tests',
    'MVG UELG not integrated', 'Source refresh remains required before release'],
  evidence: files.map(evidenceFor)
};
const target = 'outputs/ap20c2-2026-10-01/pruefprotokoll.json';
const bytes = Buffer.from(JSON.stringify(report, null, 2) + '\n');
if (existsSync(resolve(root, target))) assert.ok(read(target).equals(bytes), 'Refusing to overwrite differing completed evidence');
else writeFileSync(resolve(root, target), bytes, { flag: 'wx' });
assert.deepEqual(json(target), report);
console.log(JSON.stringify({ path: target, sha256: hash(target), checks: checks.map(({id, passed, status}) => ({id, passed, status})), evidenceFiles: files.length, historicalPreimages: preimages.length }));
