// SPDX-License-Identifier: AGPL-3.0-only
// Local closure only. All deployments and publication remain out of scope.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { root, prefix, hash, encode } from './consolidate-mvp08-sources.mjs';
import { readRegular, writeExclusive } from './record-mvp08-source-approval.mjs';
import { requireR08BApproval } from './record-r08b-execution-approval.mjs';
const json = async path => JSON.parse(await readRegular(root, path));
const bind = async path => {const bytes = await readRegular(root, path); return {path, byteLength: bytes.length, sha256: hash(bytes)};};
const verify = async descriptor => {
  const actual = await bind(descriptor.path);
  assert.equal(actual.sha256, descriptor.sha256, `Evidence changed: ${descriptor.path}`);
  if (descriptor.byteLength !== undefined) assert.equal(actual.byteLength, descriptor.byteLength);
  return actual;
};
const tapCounts = text => Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)]
  .map(match => [match[1], Number(match[2])]));
const requireTap = (text, expected) => {
  const counts = tapCounts(text);
  assert.ok(Number.isSafeInteger(counts.tests) && counts.tests > 0, 'Missing positive TAP total');
  assert.equal(counts.pass, counts.tests);
  for (const key of ['fail', 'cancelled', 'skipped', 'todo']) assert.equal(counts[key], 0);
  if (expected !== undefined) assert.equal(counts.tests, expected);
  return counts;
};
const requireUnittest = (text, expected) => {
  const match = text.match(/^Ran (\d+) tests? in [\d.]+s\s+OK\s*$/m);
  assert.ok(match && Number(match[1]) > 0, 'Missing positive Python unittest total and OK');
  assert.doesNotMatch(text, /(?:^|\n)(?:FAILED|ERROR:|FAIL:)|\(skipped=/);
  if (expected !== undefined) assert.equal(Number(match[1]), expected);
  return {tests: Number(match[1]), pass: Number(match[1]), fail: 0, cancelled: 0, skipped: 0, todo: 0};
};
const authority = await requireR08BApproval();
const changesAllowed = new Set([
  'data/source-reviews/index.json', 'data/source-reviews/source-register.json', 'package.json', 'package-lock.json',
  'scripts/build-public-app.mjs', 'spfx/config/package-solution.json', 'spfx/package.json', 'spfx/package-lock.json',
  'spfx/src/core/config.ts', 'spfx/src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json',
  'spfx/test/product-integration.test.ts', 'src/public-app/main.tsx', 'tests/public-app/build.test.ts',
  'tests/public-app/ap19c3-build.test.ts', 'tests/public-app/ap21-build.test.ts',
  'tests/public-app/ap22c3-build.test.ts', 'tests/public-app/ap23d3-build.test.ts',
  'tests/ui/ap22c2-candidate.test.ts', 'tests/ui/ap22c3-host-policy.test.tsx', 'tests/ui/mvp05-release.test.ts'
]);
const changed = [], unchanged = [];
for (const prior of authority.record.beforeInputs) {
  const actual = await bind(prior.path);
  if (actual.sha256 === prior.sha256) unchanged.push(actual);
  else {assert.ok(changesAllowed.has(prior.path), `Unapproved prior-input drift: ${prior.path}`); changed.push({before: prior, after: actual});}
}
assert.equal(changed.length, changesAllowed.size);
const pin = await json(`${prefix}/local-data-pin.json`);
const git = args => {const r = spawnSync('git', args, {cwd: root, encoding: 'utf8'}); assert.equal(r.status, 0); return r.stdout.trim();};
assert.equal(git(['rev-parse', 'HEAD']), pin.commit);
assert.equal(git(['rev-parse', 'HEAD^']), pin.parent);
assert.equal(git(['diff', '--cached', '--name-only']), '');
const commitFiles = git(['diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD']).split('\n').sort();
assert.deepEqual(commitFiles, pin.files.map(item => item.path).sort());
for (const descriptor of pin.files) {
  await verify(descriptor);
  const blob = spawnSync('git', ['show', `${pin.commit}:${descriptor.path}`], {cwd: root, maxBuffer: 16 * 1024 * 1024});
  assert.equal(blob.status, 0); assert.equal(hash(blob.stdout), descriptor.sha256);
}
const artifacts = await json(`${prefix}/artifact-verification.json`);
assert.equal(artifacts.status, 'passed');
const recovery = await json(`${prefix}/recovery-0.8.0.1/artifact-verification.json`);
assert.equal(recovery.passed, true);
const product = await json(`${prefix}/product-build.json`);
assert.equal(product.status, 'passed');
await verify(artifacts.buildProof);
await verify(product.oldPackage);
assert.equal(product.inputs.length, 210);
assert.equal(product.runtimeFiles.length, 42);
for (const descriptor of [...product.inputs, ...product.runtimeFiles]) await verify(descriptor);
for (const descriptor of [...product.archivedInputs, ...product.archivedFixtures]) await verify({...descriptor, path: descriptor.archivedAt});
const postBuildTestPaths = ['tests/ui/ap22c2-candidate.test.ts', 'tests/ui/ap22c3-host-policy.test.tsx', 'tests/ui/mvp05-release.test.ts',
  'tests/public-app/ap19c3-build.test.ts', 'tests/public-app/ap21-build.test.ts', 'tests/public-app/ap22c3-build.test.ts',
  'tests/governance/mvp07-public-integrity.test.mjs', 'tests/governance/mvp08-source-inventory.test.mjs'];
const postBuildTestChanges = [];
for (const descriptor of product.fixtures) {
  const actual = await bind(descriptor.path);
  if (actual.sha256 !== descriptor.sha256) {
    assert.ok(postBuildTestPaths.includes(descriptor.path), `Unexpected post-build fixture change: ${descriptor.path}`);
    postBuildTestChanges.push({builtFixture: descriptor, finalRegressionFixture: actual});
  }
}
assert.deepEqual(postBuildTestChanges.map(item => item.builtFixture.path).sort(), [...postBuildTestPaths].sort());
for (const step of product.steps) {
  assert.equal(step.exitCode, 0); await verify(step.log);
  if (['source-tests', 'built-tests'].includes(step.id)) requireTap((await readRegular(root, step.log.path)).toString(), step.id === 'source-tests' ? 204 : 107);
}
for (const step of recovery.steps) {
  assert.equal(step.exitCode, 0); await verify({path: step.archivedLog, sha256: step.sha256});
  if (step.tests !== undefined) requireTap((await readRegular(root, step.archivedLog)).toString(), step.tests);
}
for (const descriptor of recovery.archivedFiles) await verify(descriptor);
const artifactNames = ['fristenrechner-schweiz-0.8.0.0.sppkg', 'fristenrechner-mvp08-sharepoint-mirror.zip',
  'fristenrechner-mvp08-steimer-web.zip', 'fristenrechner-schweiz-recovery-0.8.0.1.sppkg'];
const artifactBindings = await Promise.all(artifactNames.map(name => bind(`${prefix}/${name}`)));
assert.deepEqual(artifactBindings.slice(0, 3), artifacts.artifacts);
assert.equal(artifactBindings[3].sha256, recovery.packageSha256);
const qaPaths = process.argv.slice(2);
assert.ok(qaPaths.length >= 4, 'Provide explicit final regression, browser and roundtrip reports');
const qa = [];
let portabilityClosureToolChange = null;
const completedScopes = new Set();
const acceptedKinds = new Set(['mvp08-fresh-local-regression', 'mvp08-actual-static-browser',
  'mvp08-actual-package-recovery-roundtrip', 'mvp08-actual-artifact-and-negative-test-verification',
  'r08b-standard-test-portability-proof']);
for (const path of qaPaths) {
  const value = await json(path);
  assert.ok(acceptedKinds.has(value.kind), `Unknown final evidence kind: ${value.kind}`);
  assert.ok(value.status === 'passed' || value.passed === true, `Non-passing final evidence: ${path}`);
  if (value.kind === 'mvp08-fresh-local-regression') {
    assert.ok(value.inputBindings?.length > 0, 'Final regression must bind actual inputs');
    for (const descriptor of value.inputBindings) await verify(descriptor);
    for (const step of value.steps) {
      assert.equal(step.exitCode, 0); await verify(step.log);
      const text = (await readRegular(root, step.log.path)).toString();
      if (['product', 'hosts', 'public', 'governance', 'private', 'private05'].includes(step.name)) {
        const expected = {product: 2541, hosts: 20, public: 25, governance: 225, private: 52, private05: 19};
        assert.deepEqual(requireTap(text, expected[step.name]), step.counts);
      } else if (['sourceTests', 'dataTests'].includes(step.name)) {
        step.counts = requireUnittest(text, step.name === 'sourceTests' ? 34 : 50);
      } else if (step.name === 'sources') {
        assert.match(text, /247 Quellen, davon 149 produktiv, 6 Ereignis\(sen\), 4 Ergebnisarten und 8 Negativtests/);
      } else if (step.name === 'integrity') {
        assert.equal(JSON.parse(text).status, 'passed');
      } else assert.equal(step.name, 'typecheck');
      completedScopes.add(step.name);
    }
  }
  if (value.kind === 'mvp08-actual-static-browser') {
    assert.deepEqual(value.webFiles, product.webFiles);
    for (const descriptor of [...value.webFiles, ...value.exports, ...value.screenshots]) await verify(descriptor);
    assert.deepEqual(value.externalRequests, []); assert.deepEqual(value.pageErrors, []);
    assert.deepEqual(value.checks.map(item => item.locale), ['de', 'fr']);
    for (const check of value.checks) {
      assert.equal(check.result, '2026-11-02');
      for (const key of ['download', 'staleExportRemoved', 'tiO2Blocked']) assert.equal(check[key], true);
      assert.equal(check.overflow, false);
    }
  }
  if (value.kind === 'mvp08-actual-package-recovery-roundtrip') {
    assert.deepEqual(value.normalPackage, artifactBindings[0]);
    assert.deepEqual(value.recoveryPackage, artifactBindings[3]);
    for (const descriptor of [...value.inputs, ...value.archivedFiles]) await verify(descriptor);
    assert.equal(value.steps.length, 1);
    const step = value.steps[0]; assert.equal(step.exitCode, 0); assert.equal(step.tests, 6);
    const archivedLog = value.archivedFiles.find(item => item.path.endsWith(`/${step.log}`));
    assert.ok(archivedLog); assert.equal(archivedLog.sha256, step.sha256);
    requireTap((await readRegular(root, archivedLog.path)).toString(), 6);
  }
  if (value.kind === 'mvp08-actual-artifact-and-negative-test-verification') {
    assert.deepEqual(value.artifacts, artifactBindings.slice(0, 3));
    for (const descriptor of [...value.inputs, value.log]) await verify(descriptor);
    requireUnittest((await readRegular(root, value.log.path)).toString(), 33);
    for (const key of ['failures', 'errors', 'skipped']) assert.equal(value[key], 0);
  }
  if (value.kind === 'r08b-standard-test-portability-proof') {
    assert.equal(value.schemaVersion, '1.0.0');
    assert.equal(value.inputTreeVerifiedAfterRun, true);
    assert.equal(value.exclusionsVerifiedAfterRun, true);
    assert.deepEqual(value.standardScopes, ['product', 'governance']);
    for (const descriptor of [value.inputInventory, value.exclusions, value.executionRecord, ...value.evidence]) await verify(descriptor);
    const inventory = await json(value.inputInventory.path);
    const exclusions = await json(value.exclusions.path);
    assert.equal(inventory.kind, 'mvp08-isolated-standard-without-private-originals');
    assert.equal(inventory.sourceAndTestBytesUnchanged, true);
    assert.equal(inventory.nodeModulesSymlinkOnly, true);
    assert.equal(inventory.publicationReviewPerformed, false);
    assert.equal(inventory.completeSourceAuditClaimed, false);
    for (const key of ['privateSourceOriginals', 'websiteHostingBackups', 'currentR08BArchives', 'git']) assert.equal(inventory.excluded[key], true);
    assert.equal(inventory.files.length, value.copiedInputCount);
    assert.equal(new Set(inventory.files.map(item => item.path)).size, inventory.files.length);
    assert.equal(inventory.suites.product.length, 78);
    assert.equal(inventory.suites.governance.length, 20);
    assert.equal(exclusions.kind, 'r08b-portability-exclusion-proof');
    assert.equal(exclusions.inputInventorySha256, value.inputInventory.sha256);
    assert.equal(exclusions.checkedIsolatedFiles, value.copiedInputCount);
    assert.equal(exclusions.allIsolatedInputBytesStillUnchanged, true);
    assert.equal(exclusions.publicationReviewPerformed, false);
    assert.equal(exclusions.noOfficialFullTextsClaimed, false);
    assert.deepEqual(exclusions.excludedHistoricalOriginalPaths, inventory.excludedHistoricalOriginalPaths);
    assert.equal(new Set(inventory.excludedHistoricalOriginalPaths).size, 34);
    assert.deepEqual(exclusions.retainedHistoricalPublicFullTextFixture, inventory.historicalPublicFullTextFixture);
    assert.equal(inventory.historicalPublicFullTextFixture.sha256, '3b0820bf23b551ca0581caa72c8c6cb8570e99a2e2781dfb9af8ac33e2023ddf');
    for (const descriptor of inventory.files) {
      assert.ok(!descriptor.path.startsWith('/') && !descriptor.path.split('/').includes('..'));
      assert.ok(!inventory.excludedHistoricalOriginalPaths.includes(descriptor.path));
      if (descriptor.path === 'scripts/finalize-mvp08-local.mjs') {
        const current = await bind(descriptor.path);
        if (current.sha256 !== descriptor.sha256) portabilityClosureToolChange = {
          copied: descriptor, current, reason: 'Only the closure tool was completed after the isolated input copy. It is not executed by the standard suites.'};
      } else await verify(descriptor);
      await verify({...descriptor, path: `${value.isolatedExecutionPath}/${descriptor.path}`});
    }
    assert.deepEqual(value.steps.map(step => step.name), ['governance-node', 'governance-schema', 'governance-python', 'product']);
    for (const step of value.steps) {
      assert.equal(step.exitCode, 0); await verify(step.log);
      const text = (await readRegular(root, step.log.path)).toString();
      if (step.name === 'governance-schema') {
        assert.match(text, /247 Quellen, davon 149 produktiv, 6 Ereignis\(sen\), 4 Ergebnisarten und 8 Negativtests/);
        assert.deepEqual(step.counts, {negativeTests: 8, sourceRegisterEntries: 247, productiveSourceEntries: 149, events: 6});
      } else {
        const expected = {'governance-node': 225, 'governance-python': 34, product: 2541}[step.name];
        const counts = step.name === 'governance-python' ? requireUnittest(text, expected) : requireTap(text, expected);
        assert.deepEqual(step.counts, {tests: counts.tests, passed: counts.pass, failed: 0, skipped: 0});
      }
    }
  }
  qa.push({...await bind(path), kind: value.kind, steps: value.steps?.map(step => ({name: step.name ?? step.id, counts: step.counts}))});
}
for (const scope of ['typecheck', 'product', 'hosts', 'public', 'governance', 'private', 'private05', 'sources', 'sourceTests', 'dataTests', 'integrity'])
  assert.ok(completedScopes.has(scope), `Missing final regression scope: ${scope}`);
for (const kind of ['mvp08-actual-static-browser', 'mvp08-actual-package-recovery-roundtrip', 'mvp08-actual-artifact-and-negative-test-verification',
  'r08b-standard-test-portability-proof'])
  assert.ok(qa.some(item => item.kind === kind), `Missing final proof: ${kind}`);
for (const item of postBuildTestChanges) {
  item.archivedFinalFixture = `${prefix}/final-regression-inputs/${item.finalRegressionFixture.path}`;
  await writeExclusive(root, item.archivedFinalFixture, await readRegular(root, item.finalRegressionFixture.path));
}
const historicalGovernanceFixtures = [];
for (const name of ['source-register.json', 'index.json']) {
  const prior = authority.record.beforeInputs.find(item => item.path === `data/source-reviews/${name}`);
  assert.ok(prior);
  const fixture = await verify({path: `tests/fixtures/mvp07-public-integrity/${name}`, sha256: prior.sha256, byteLength: prior.byteLength});
  const archivedAt = `${prefix}/final-regression-inputs/${fixture.path}`;
  await writeExclusive(root, archivedAt, await readRegular(root, fixture.path));
  historicalGovernanceFixtures.push({fixture, source: prior, archivedAt});
}
const report = {kind: 'mvp08-r08b-local-completion', recordedAt: new Date().toISOString(), status: 'passed',
  authority: {path: authority.path, sha256: authority.sha256}, applicationVersion: '0.8.0', packageVersion: '0.8.0.0',
  recoveryPackageVersion: '0.8.0.1', recoveryFunctionality: 'MVP 0.7',
  closureTool: await bind('scripts/finalize-mvp08-local.mjs'),
  releaseId: pin.releaseId, dataCommit: pin.commit, parent: pin.parent, additionalCommits: 0,
  dataManifest: await bind(`data/releases/${pin.releaseId}/manifest.json`), artifacts: artifactBindings,
  priorInputs: {count: authority.record.beforeInputs.length, unchanged, boundedChanges: changed},
  builtProductUnchanged: true, postBuildTestChanges, historicalGovernanceFixtures, portabilityClosureToolChange,
  evidence: await Promise.all(['artifact-verification.json', 'product-build.json', 'independent-data-verification.json',
    'public-integrity-verification.json', 'data-promotion.json', 'source-governance-adoption.json', 'source-version-bridges.json',
    'administrative-reference-suite.json', 'local-data-pin.json', 'recovery-0.8.0.1/artifact-verification.json',
    'outlook-reuse-assessment-v2.json', 'outlook-final-artifact-supplement.json'].map(name => bind(`${prefix}/${name}`))),
  finalChecks: qa, installationPerformed: false, uploadsPerformed: false, githubPushPerformed: false,
  outlookImportsPerformed: false, operationalApprovalGranted: false, realM365TestsPerformed: false,
  remoteDataPinPublicationVerified: false,
  remaining: ['R08-C concrete site/package/mirror/recovery approval', 'Actual E/Q tests and human acceptance',
    'Separate Outlook reuse decision or authorised new import', 'Public positive list and GitHub publication approval',
    'Separate production deployment and header/cache risk decision']};
await writeExclusive(root, `${prefix}/local-completion.json`, encode(report));
console.log(JSON.stringify({report: await bind(`${prefix}/local-completion.json`), artifacts: artifactBindings,
  unchangedInputs: unchanged.length, boundedChanges: changed.length, dataCommit: pin.commit}, null, 2));
