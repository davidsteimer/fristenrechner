// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic descriptor/metadata tests only. Never execute a finalizer or refresh old evidence.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readdir } from 'node:fs/promises';
import { metadataFromEvidence, validateCompletionMetadata, validateBrowserBinding, completionFlags, completionConfig, safe } from '../../scripts/finalize-r10-u1.mjs';
import { buildPlan, tapCounts, assertPassedCounts } from '../../scripts/check-r10-u1.mjs';

const releaseId = '2026-10-28-ap23m3-candidate.1';
const descriptor = (path, number = 1) => ({ path, byteLength: number, sha256: 'a'.repeat(64) });
function fixture() {
  const e = {
    qa: { head: 'b'.repeat(40) },
    preservation: { protectedFilesVerified: 13743 },
    qaCounts: { 'product-regression': 101, 'host-lifecycle': 9, 'actual-web-bundle': 11, governance: 1 },
    stage: { sourceCounts: { tests: 7 }, historicalCounts: { tests: 13 } },
    packaged: { counts: { tests: 35 } },
    spfx: { testPackage: descriptor('.work/r10-u1-spfx-build-ABC123/spfx/sharepoint/solution/fristenrechner-schweiz.sppkg', 123) },
    web: { dataReleaseId: releaseId }
  };
  // A saved JSON proof is independent of the freshly collected evidence objects.
  const saved = structuredClone({ ...metadataFromEvidence(e), localLinksChecked: 1, bindings: [descriptor('synthetic/evidence.txt')] });
  return { e, saved };
}
function rejects(edit) { const { e, saved } = fixture(); edit(saved, e); assert.throws(() => validateCompletionMetadata(saved, e)); }
function browserFixture() {
  const web = { dataReleaseId: releaseId, artifacts: [descriptor('.work/public-r10-u1/index.html'), descriptor('.work/public-r10-u1/assets/app-ABC123.js', 2)] };
  const layout = { artifacts: [descriptor('.work/r10-u1-layout/index.html', 3), descriptor('.work/r10-u1-layout/host.packaged.css', 4)] };
  const browser = {
    workPackage: 'R10-U1', status: 'passed-local-browser', localOnly: true, dataReleaseId: releaseId,
    realDeviceOrM365Test: false, realZoomTest: false, sourceReleaseApproved: false,
    url: 'http://127.0.0.1:8812/fristenrechner/', layoutWidths: [1120, 400, 373, 320], languages: ['de', 'fr'],
    checks: { socialLawSelectionVisible: true, earlyAbortText: true, actualPackageRowWraps: true, localReferenceExportBlocked: true },
    evidence: [...structuredClone(web.artifacts), ...structuredClone(layout.artifacts), descriptor('synthetic/browser.png'), descriptor('synthetic/browser.txt')]
  };
  return { browser, web, layout };
}
function rejectsBrowser(edit) { const f = browserFixture(); edit(f.browser, f.web, f.layout); assert.throws(() => validateBrowserBinding(f.browser, f.web, f.layout)); }

test('R10-U1 synthetic completion metadata validates without actual proof files or workflow execution', () => {
  const { e, saved } = fixture(), before = structuredClone(saved);
  assert.equal(validateCompletionMetadata(saved, e), true); assert.deepEqual(saved, before);
  assert.equal(saved.workPackage, 'R10-U1'); assert.equal(saved.status, 'local-follow-up-verified-awaiting-human-acceptance');
  assert.deepEqual(saved.scope, ['R10-H01', 'T06-H01', 'B11-H01']);
  assert.equal(saved.immutableFiles, 13743); assert.equal(saved.mutableBoundary, 9); assert.equal(saved.livingBoundary, 8);
  assert.equal(saved.hostCounts.actualPackage, 35); assert.equal(saved.webReleaseId, releaseId);
  assert.ok(saved.limitations.some(value => /not a real zoom or device test/.test(value)));
  assert.ok(saved.limitations.some(value => /non-operational and export-disabled/.test(value)));
});
test('R10-U1 proof and documentation paths are new and distinct from accepted M3 evidence', () => {
  assert.equal(completionConfig.proof, 'outputs/r10-u1-2026-10-28/local-completion.json');
  assert.deepEqual(completionConfig.documents, ['docs/ux/r10-u1-nachtrag.md']);
  assert.equal(completionConfig.living.length, 8);
  assert.ok(completionConfig.living.includes('docs/planung/gebuendelter-release-nach-ap23m3.md'));
  assert.notEqual(completionConfig.proof, 'outputs/ap23m3-2026-10-28/local-completion.json');
});
for (const flag of completionFlags) test('R10-U1 completion cannot grant ' + flag, () => rejects(saved => { saved[flag] = true; }));
for (const [key, value] of [
  ['workPackage', 'AP23M3'], ['asOf', '2026-10-29'], ['status', 'released'], ['head', 'c'.repeat(40)],
  ['formatsUnchanged', false], ['legalDataUnchanged', false], ['calculationRulesUnchanged', false],
  ['acceptedM3ArchiveUnchanged', false], ['immutableFiles', 13742], ['mutableBoundary', 10], ['livingBoundary', 9],
  ['webReleaseId', 'foreign-release'], ['nextGate', 'Deploy and promote without another decision']
]) test('R10-U1 completion metadata remains exact: ' + key, () => rejects(saved => { saved[key] = value; }));
test('R10-U1 head must also be a full lowercase hexadecimal commit when evidence itself is malformed', () => {
  const { e } = fixture(); e.qa.head = 'not-a-commit';
  const saved = { ...metadataFromEvidence(e), localLinksChecked: 1, bindings: [descriptor('synthetic/evidence.txt')] };
  assert.throws(() => validateCompletionMetadata(saved, e));
});
test('R10-U1 fixes cannot be selectively dropped, expanded or changed into approval claims', () => {
  for (const key of ['R10-H01', 'T06-H01', 'B11-H01']) rejects(saved => { saved.localCorrectionVerified[key] = false; });
  rejects(saved => { saved.localCorrectionVerified.other = true; }); rejects(saved => { saved.scope.pop(); });
  rejects(saved => { saved.scope.push('new-social-binding'); }); rejects(saved => { saved.limitations = []; });
  rejects(saved => { saved.limitations.push('Real Teams/SharePoint verification completed'); });
});
test('R10-U1 observed counts and package descriptors are bound to collected evidence', () => {
  for (const key of ['qaCounts', 'hostCounts']) rejects(saved => { saved[key].invented = 999; });
  rejects(saved => { saved.qaCounts['actual-web-bundle']--; }); rejects(saved => { saved.hostCounts.actualPackage++; });
  rejects(saved => { saved.actualPackage.sha256 = '0'.repeat(64); }); rejects(saved => { saved.actualPackage.byteLength++; });
});
test('R10-U1 completion fields cannot be omitted or acquire additional permissions', () => {
  for (const key of ['bindings', 'localLinksChecked', 'scope', 'localCorrectionVerified', 'sourceReleaseApproved', 'actualPackage', 'qaCounts']) rejects(saved => { delete saved[key]; });
  rejects(saved => { saved.deployable = true; }); rejects(saved => { saved.professionalAcceptance = true; });
});
test('R10-U1 local link count is a strictly positive safe integer', () => {
  for (const value of [0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1, '1']) rejects(saved => { saved.localLinksChecked = value; });
});
test('R10-U1 binding inventory cannot be empty, duplicate or add descriptor fields', () => {
  rejects(saved => { saved.bindings = []; }); rejects(saved => { saved.bindings.push({ ...saved.bindings[0] }); });
  rejects(saved => { saved.bindings[0].extra = true; });
  for (const value of [-1, 0.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1, '1']) rejects(saved => { saved.bindings[0].byteLength = value; });
  for (const value of ['z'.repeat(64), 'A'.repeat(64), 'a'.repeat(63), 'a'.repeat(65), '', null]) rejects(saved => { saved.bindings[0].sha256 = value; });
});
for (const path of ['', '/tmp/file', '../file', 'src/../file', 'src/./file', 'src//file', 'src/', 'a\\b', 'a\0b', 'a\nb', 'a\rb', 'C:/file', 'https://example.invalid/file']) {
  test('R10-U1 closed evidence path rejects ' + JSON.stringify(path), () => {
    assert.throws(() => safe(path)); rejects(saved => { saved.bindings[0].path = path; });
  });
}
test('R10-U1 safe relative evidence paths admit only ordinary closed local descriptors', () => {
  for (const path of ['src/ui/administrativeUi.tsx', '.work/r10-u1-layout/index.html', 'outputs/r10-u1-2026-10-28/browser.png']) assert.equal(safe(path), path);
  for (const path of [null, undefined, 1, true, {}, []]) assert.throws(() => safe(path));
});

test('R10-U1 actual QA plan has the exact gated order and full standard product selection', async () => {
  const plan = await buildPlan();
  assert.deepEqual(plan.map(row => row[0]), ['preservation-before', 'typecheck', 'product-regression', 'host-lifecycle', 'actual-web-bundle', 'accepted-m3-archive', 'governance', 'web-build', 'preservation-after', 'whitespace']);
  assert.equal(new Set(plan.map(row => row[0])).size, plan.length);
  assert.deepEqual(plan.find(row => row[0] === 'product-regression')[2], ['scripts/run-standard-tests.mjs', 'product']);
  assert.deepEqual(plan.find(row => row[0] === 'actual-web-bundle')[2], ['--import', 'tsx', '--test', '--test-timeout=900000', 'tests/public-app/r10-u1-build.test.ts']);
  assert.deepEqual(plan.find(row => row[0] === 'accepted-m3-archive')[2], ['scripts/archive-ap23m3-acceptance.mjs', '--check']);
  assert.deepEqual(plan.find(row => row[0] === 'web-build')[2], ['scripts/build-r10-u1-public.mjs']);
  assert.deepEqual(plan.at(-1).slice(1), ['git', ['diff', '--check']]);
  for (const row of plan) assert.ok(row[2].every(arg => !/^--test-(?:name|skip)-pattern/.test(arg)), 'No filtered substitute for full QA');
});
test('R10-U1 QA discovers every E3–M3 host lifecycle suite without replaying historical proof writers', async () => {
  const plan = await buildPlan(), expected = (await readdir(new URL('../../tests/hosts', import.meta.url))).filter(name => /^ap23[e-m]3-spfx-host\.test\.ts$/u.test(name)).sort().map(name => 'tests/hosts/' + name);
  assert.equal(expected.length, 9); assert.deepEqual(plan.find(row => row[0] === 'host-lifecycle')[2].filter(arg => arg.endsWith('.test.ts')), expected);
  const governance = plan.find(row => row[0] === 'governance')[2].filter(arg => arg.endsWith('.test.mjs'));
  assert.ok(governance.includes('tests/governance/r10-u1-completion.test.mjs'));
  assert.ok(governance.includes('tests/governance/r10-u1-preservation.test.mjs'));
  for (const path of governance) assert.match(path, /^tests\/governance\/r10-u1[^/]+\.test\.mjs$/u);
  for (const row of plan) assert.ok(!row[2].some(arg => /check-ap23m3\.mjs|finalize-ap23m3\.mjs/.test(arg)), 'Do not overwrite accepted M3 reports');
});
test('R10-U1 clean TAP counts are observed, not inferred from a planned file count', () => {
  const counts = tapCounts('# tests 17\n# pass 17\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n');
  assert.deepEqual(counts, { tests: 17, pass: 17, fail: 0, cancelled: 0, skipped: 0, todo: 0 });
  assert.doesNotThrow(() => assertPassedCounts(counts, 'synthetic'));
});
test('R10-U1 failure, filtering gaps, incomplete counters and empty suites fail the TAP gate', () => {
  const clean = { tests: 1, pass: 1, fail: 0, cancelled: 0, skipped: 0, todo: 0 };
  for (const key of ['fail', 'cancelled', 'skipped', 'todo']) assert.throws(() => assertPassedCounts({ ...clean, [key]: 1 }, key));
  assert.throws(() => assertPassedCounts({ ...clean, pass: 0 }, 'partial'));
  assert.throws(() => assertPassedCounts({ ...clean, tests: 0, pass: 0 }, 'empty'));
  for (const key of Object.keys(clean)) { const missing = { ...clean }; delete missing[key]; assert.throws(() => assertPassedCounts(missing, key)); }
});

test('R10-U1 browser binding validates exact current application and actual layout bytes', () => {
  const f = browserFixture(), before = structuredClone(f); assert.equal(validateBrowserBinding(f.browser, f.web, f.layout), true); assert.deepEqual(f, before);
});
for (const [key, value] of [['workPackage', 'AP23M3'], ['status', 'passed'], ['localOnly', false], ['realDeviceOrM365Test', true], ['realZoomTest', true], ['sourceReleaseApproved', true], ['url', 'https://www.steimer.ch/fristenrechner/'], ['dataReleaseId', 'foreign']]) {
  test('R10-U1 browser binding rejects scope or identity mutation: ' + key, () => rejectsBrowser(browser => { browser[key] = value; }));
}
test('R10-U1 browser and build must both name the exact unchanged M3 candidate', () => {
  rejectsBrowser(browser => { delete browser.dataReleaseId; }); rejectsBrowser((_browser, web) => { web.dataReleaseId = 'foreign'; });
  rejectsBrowser((browser, web) => { browser.dataReleaseId = 'foreign'; web.dataReleaseId = 'foreign'; });
});
test('R10-U1 current index, application and every layout descriptor must be present byte-for-byte', () => {
  for (const index of [0, 1, 2, 3]) {
    rejectsBrowser(browser => { browser.evidence[index].sha256 = 'c'.repeat(64); });
    rejectsBrowser(browser => { browser.evidence[index].byteLength++; });
    rejectsBrowser(browser => { browser.evidence.splice(index, 1); });
  }
  rejectsBrowser((_browser, _web, layout) => { layout.artifacts[0].byteLength++; });
});
test('R10-U1 browser gate needs one exact current index and one exact current app, not merely two matching rows', () => {
  rejectsBrowser((browser, web) => { web.artifacts = [descriptor('.work/public-r10-u1/assets/app-ABC123.js'), descriptor('.work/public-r10-u1/assets/app-DEF456.js')]; browser.evidence.push(...structuredClone(web.artifacts)); });
  rejectsBrowser((browser, web) => { web.artifacts[1].path = '.work/public-old/assets/app-ABC123.js'; browser.evidence[1].path = web.artifacts[1].path; });
  rejectsBrowser((browser, web) => { web.artifacts.push(descriptor('.work/public-r10-u1/assets/app-DEF456.js')); browser.evidence.push(descriptor('.work/public-r10-u1/assets/app-DEF456.js')); });
});
test('R10-U1 browser claims cannot omit checks, language, widths or the actual visual/text evidence', () => {
  for (const key of ['socialLawSelectionVisible', 'earlyAbortText', 'actualPackageRowWraps', 'localReferenceExportBlocked']) {
    rejectsBrowser(browser => { browser.checks[key] = false; }); rejectsBrowser(browser => { delete browser.checks[key]; });
  }
  rejectsBrowser(browser => { browser.languages = ['de']; }); rejectsBrowser(browser => { browser.layoutWidths = [1120, 400]; });
  rejectsBrowser(browser => { browser.evidence = browser.evidence.filter(row => !row.path.endsWith('.png')); });
  rejectsBrowser(browser => { browser.evidence = browser.evidence.filter(row => !row.path.endsWith('.txt')); });
});
