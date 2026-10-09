// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
// Exercises actual promoted bytes through the packaged AMD consumer. No synthetic approval.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const {REPO_ROOT, loadPackagedHost, localMirrorConfiguration} = require('./package-harness.cjs');

const releaseId = '2026-10-08-mvp-07-approved.1';
function provider(release = releaseId, suffix = '', corrupt = false) {
  const directory = path.join(REPO_ROOT, 'data/releases', release);
  const manifestBytes = fs.readFileSync(path.join(directory, 'manifest.json'));
  const manifest = JSON.parse(manifestBytes);
  const files = new Map([['manifest.json', manifestBytes], ...manifest.artifacts.map(item =>
    [item.path, fs.readFileSync(path.join(directory, item.path))])]);
  if (corrupt) {
    const first = manifest.artifacts[0].path;
    files.set(first, Buffer.concat([files.get(first), Buffer.from('\n')]));
  }
  const fetched = [];
  return {id: `local-approved:${release}${suffix}`, kind: 'sharepointMirror',
    cacheConfiguration: localMirrorConfiguration(`${release}${suffix}`), fetched,
    async fetchBytes(name) { fetched.push(name); assert.ok(files.has(name)); return new Uint8Array(files.get(name)); }};
}
const offline = original => ({...original, async fetchBytes() { throw new Error('LOCAL TEST OFFLINE'); }});

test('MVP07 actual SPPKG activates the 41 real approved files without any synthetic approvals', async t => {
  const runtime = loadPackagedHost(), source = provider();
  t.diagnostic(JSON.stringify(runtime.provenance));
  const activation = await runtime.service.refresh(source);
  assert.equal(activation.mode, 'network');
  assert.equal(activation.release.formatVersion, '7.0.0');
  assert.equal(activation.release.releaseId, releaseId);
  assert.equal(activation.release.artifacts.length, 40);
  assert.equal(source.fetched.length, 41);
  runtime.host.applyActivationResult(activation, runtime.host.props.configurationKey);
  assert.equal(runtime.host.state.status, 'ready');
  assert.equal(runtime.host.state.calendarRuntime.referenceOnly, false);
  const data = runtime.host.state.calculationData;
  assert.equal(data.calendarRuleSets.size, 32);
  const catalog = data.socialProcedureCatalogs.get('ch-social-procedures');
  assert.equal(catalog.federalRules.length, 44);
  assert.equal(catalog.cantonalBindings.length, 50);
  assert.equal(catalog.releaseEligibility.length, 50);
  assert.ok(catalog.releaseEligibility.every(item => item.status === 'approved' && item.releaseId === releaseId
    && item.approval.approvedBy === 'David Steimer'));
});

test('MVP07 actual packaged calculator enters Format7 calculation and blocks divergent January export', async () => {
  const runtime = loadPackagedHost();
  runtime.host.applyActivationResult(await runtime.service.refresh(provider()), runtime.host.props.configurationKey);
  const basic = {authorityCode: 'BE', profileId: 'stpo', inputDate: '2026-09-16', deadlineDays: '10',
    calendarContext: {role: 'partyWithoutRepresentative', canton: 'BE', areaFacts: {}}};
  const calculated = runtime.submitCalculator(basic);
  assert.equal(calculated.outcome, 'calculated');
  assert.equal(calculated.finalEnd, '2026-09-28');
  assert.equal(calculated.calendarExportAllowed, true);
  const january = runtime.submitCalculator({...basic, inputDate: '2029-01-01', deadlineDays: '1',
    calendarContext: {role: 'partyWithoutRepresentative', canton: 'SG', areaFacts: {}}});
  assert.equal(january.outcome, 'blocked');
  assert.equal(january.januaryComparison.outcome, 'different');
  assert.equal(january.finalEnd, undefined);
  assert.equal(january.calendarExportAllowed, false);
});

test('MVP07 actual package keeps the approved cache configuration-bound and historical AP5 distinct', async () => {
  const runtime = loadPackagedHost(), current = provider();
  const good = await runtime.service.refresh(current);
  const same = await runtime.service.refresh(offline(current));
  assert.equal(same.mode, 'fallback');
  assert.equal(same.release.manifestSha256, good.release.manifestSha256);
  await assert.rejects(runtime.service.refresh(offline(provider(releaseId, '-other-Q'))), /LOCAL TEST OFFLINE/);
  const tampered = await runtime.service.refresh(provider(releaseId, '', true));
  assert.equal(tampered.mode, 'fallback');
  assert.equal(tampered.release.manifestSha256, good.release.manifestSha256);
  const historical = provider('2026-08-29-ap5-approved.1');
  await assert.rejects(runtime.service.refresh(offline(historical)), /LOCAL TEST OFFLINE/);
  const ap5 = await runtime.service.refresh(historical);
  assert.equal(ap5.release.formatVersion, '1.0.0');
  assert.equal((await runtime.service.refresh(offline(historical))).release.manifestSha256, ap5.release.manifestSha256);
  assert.equal((await runtime.service.refresh(offline(current))).release.manifestSha256, good.release.manifestSha256);
});
