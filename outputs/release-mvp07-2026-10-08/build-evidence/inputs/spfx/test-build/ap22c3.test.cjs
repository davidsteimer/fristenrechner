// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
// No TypeScript or source transpiler. Synthetic approvals exist in memory only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const {REPO_ROOT, loadPackagedHost, sha256, localMirrorConfiguration} = require('./package-harness.cjs');
const {projectActivatedCalendars} = require('../lib-commonjs/product/core/holidayActivation.js');
const {FORMAT7_LEGACY_CALENDAR_BASELINE} = require('../lib-commonjs/product/core/format7Baseline.js');
const {rebindSocialCalendarCandidate} = require('../lib-commonjs/product/core/calendarMigration.js');

const root = path.join(REPO_ROOT, 'outputs/ap22c3-2026-10-08/bundle');
const releaseId = '2026-10-08-synthetic-amd-format7.1';
const encode = value => JSON.stringify(value, null, 2) + '\n';
const json = name => JSON.parse(fs.readFileSync(name, 'utf8'));
function fixture(approved) {
  const manifest = json(path.join(root, 'manifest.json'));
  assert.equal(manifest.releaseStatus, 'candidate');
  const files = new Map(manifest.artifacts.map(item => [item.path, fs.readFileSync(path.join(root, item.path), 'utf8')]));
  if (approved) {
    const catalog = JSON.parse(files.get('holiday-catalogs/ch-holiday-catalog.json'));
    catalog.activation.releaseEligibility = {status:'approved', releaseId,
      approval:{on:'2026-10-08',by:'SYNTHETIC AMD TEST ONLY',evidence:'TEST-NOT-A-RELEASE'}};
    const catalogText = encode(catalog);
    files.set('holiday-catalogs/ch-holiday-catalog.json', catalogText);
    const calendars = projectActivatedCalendars(catalog, sha256(Buffer.from(catalogText)), FORMAT7_LEGACY_CALENDAR_BASELINE);
    for (const calendar of calendars) files.set(`calendars/${calendar.calendarId}.json`, encode(calendar));
    const refs = ['ch-federal-calendar', 'be-public-holidays'].map(contentId => ({role:'calendar', contentId,
      sha256:sha256(Buffer.from(files.get(`calendars/${contentId}.json`)))}));
    const social = rebindSocialCalendarCandidate(json(path.join(REPO_ROOT,
      'data/releases/2026-10-01-mvp-06-approved.1/social-procedures/ch-social-procedures.json')), releaseId,
    [...refs, {role:'holidayCatalog',contentId:'ch-holiday-catalog',sha256:sha256(Buffer.from(catalogText))}]);
    for (const entry of social.releaseEligibility) {
      entry.status = 'approved';
      entry.approval = {approvedBy:'SYNTHETIC AMD TEST ONLY',approvedOn:'2026-10-08',decisionRef:'TEST-NOT-A-RELEASE'};
    }
    files.set('social-procedures/ch-social-procedures.json', encode(social));
    manifest.$schema = manifest.$schema.replace('local-reference-manifest-v7', 'release-manifest-v7');
    manifest.releaseId = releaseId;
    manifest.releaseStatus = 'approved';
    manifest.sourceSummary.latestReviewedOn = '2026-10-08';
    manifest.sourceSummary.legalBasisReviewStatus = 'verified';
    for (const item of manifest.artifacts) {
      item.byteLength = Buffer.byteLength(files.get(item.path));
      item.sha256 = sha256(Buffer.from(files.get(item.path)));
    }
  }
  files.set('manifest.json', encode(manifest));
  return files;
}
const approvedBytes = fixture(true), pendingBytes = fixture(false);
function provider(files = approvedBytes, dataPin = 'ap22c3-synthetic') {
  const fetched = [];
  return {id:`local-amd:${dataPin}`,kind:'sharepointMirror',cacheConfiguration:localMirrorConfiguration(dataPin),fetched,
    async fetchBytes(name) { fetched.push(name); assert.ok(files.has(name), name); return new Uint8Array(Buffer.from(files.get(name))); }};
}
function offline(original) { return {...original,async fetchBytes(){throw new Error('SYNTHETIC OFFLINE');}}; }
function originalProvider(release) {
  const directory = path.join(REPO_ROOT, 'data/releases', release);
  const manifest = json(path.join(directory, 'manifest.json'));
  const files = new Map(['manifest.json', ...manifest.artifacts.map(item=>item.path)]
    .map(name=>[name,fs.readFileSync(path.join(directory,name),'utf8')]));
  return provider(files, release);
}

test('C3 actual SPPKG rejects the real pending bundle before fetching any artifact or activating cache', async t => {
  const runtime = loadPackagedHost(), source = provider(pendingBytes, 'ap22c3-pending');
  t.diagnostic(JSON.stringify(runtime.provenance));
  await assert.rejects(runtime.service.refresh(source), /Format-7-Manifest.*JSON-Schema/);
  assert.deepEqual(source.fetched, ['manifest.json']);
  assert.equal(await runtime.service.getActive(source), undefined);
});

test('C3 actual SPPKG validates and activates all 40 synthetic Format7 artifacts and retains 50 joint bindings', async () => {
  const runtime = loadPackagedHost(), source = provider();
  const activation = await runtime.service.refresh(source);
  assert.equal(activation.mode, 'network');
  assert.equal(activation.release.formatVersion, '7.0.0');
  assert.equal(activation.release.artifacts.length, 40);
  assert.equal(source.fetched.length, 41);
  runtime.host.applyActivationResult(activation, runtime.host.props.configurationKey);
  assert.equal(runtime.host.state.status, 'ready');
  assert.equal(runtime.host.state.calculationData.calendarRuleSets.size, 32);
  assert.equal(runtime.host.state.calendarRuntime.referenceOnly, false);
  const social = runtime.host.state.calculationData.socialProcedureCatalogs.get('ch-social-procedures');
  assert.equal(social.releaseEligibility.length, 50);
  assert.ok(social.releaseEligibility.every(item=>item.releaseId===releaseId&&item.status==='approved'));
});

test('C3 actual packaged UI submit enters bound calculation and blocks the differing January comparison', async () => {
  const runtime = loadPackagedHost();
  const activation = await runtime.service.refresh(provider());
  runtime.host.applyActivationResult(activation, runtime.host.props.configurationKey);
  const basic = {authorityCode:'BE',profileId:'stpo',inputDate:'2026-09-16',deadlineDays:'10',
    calendarContext:{role:'partyWithoutRepresentative',canton:'BE',areaFacts:{}}};
  const calculated = runtime.submitCalculator(basic);
  assert.equal(calculated.outcome,'calculated');
  assert.equal(calculated.finalEnd,'2026-09-28');
  assert.equal(calculated.calendarExportAllowed,true);
  const january = runtime.submitCalculator({...basic,inputDate:'2029-01-01',deadlineDays:'1',
    calendarContext:{role:'partyWithoutRepresentative',canton:'SG',areaFacts:{}}});
  assert.equal(january.outcome,'blocked');
  assert.equal(january.januaryComparison.outcome,'different');
  assert.equal(january.finalEnd,undefined);
  assert.equal(january.calendarExportAllowed,false);
});

test('C3 actual packaged cache revalidates Format7 bytes only for the exact same configuration and keeps AP5 separate', async () => {
  const runtime = loadPackagedHost(), current = provider();
  const loaded = await runtime.service.refresh(current);
  const same = await runtime.service.refresh(offline(current));
  assert.equal(same.mode,'fallback');
  assert.equal(same.release.manifestSha256,loaded.release.manifestSha256);
  await assert.rejects(runtime.service.refresh(offline(provider(approvedBytes,'other-Q-mirror'))), /SYNTHETIC OFFLINE/);
  const historical = originalProvider('2026-08-29-ap5-approved.1');
  await assert.rejects(runtime.service.refresh(offline(historical)), /SYNTHETIC OFFLINE/);
  const ap5 = await runtime.service.refresh(historical);
  assert.equal(ap5.release.formatVersion,'1.0.0');
  assert.equal((await runtime.service.refresh(offline(historical))).release.manifestSha256,ap5.release.manifestSha256);
  assert.equal((await runtime.service.refresh(offline(current))).release.manifestSha256,loaded.release.manifestSha256);
});
