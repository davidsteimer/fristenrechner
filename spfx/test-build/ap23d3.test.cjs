// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
// Test-only synthetic approvals in memory. No TypeScript source transpiler and
// no release data mutation. The actual AMD bytes come from the packaged SPPKG.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const {REPO_ROOT, loadPackagedHost, sha256, localMirrorConfiguration} = require('./package-harness.cjs');
const {projectActivatedCalendars} = require('../lib-commonjs/product/core/holidayActivation.js');
const {FORMAT7_LEGACY_CALENDAR_BASELINE} = require('../lib-commonjs/product/core/format7Baseline.js');
const {rebindSocialCalendarCandidate} = require('../lib-commonjs/product/core/calendarMigration.js');

const root = path.join(REPO_ROOT, 'outputs/ap23d2-candidate-2026-10-15/bundle');
const releaseId = '2026-10-15-ap23d3-synthetic-amd.1';
const encode = value => JSON.stringify(value, null, 2) + '\n';
const json = name => JSON.parse(fs.readFileSync(name, 'utf8'));
const hash = text => sha256(Buffer.from(text));
const adminPath = 'administrative-procedures/ch-cantonal-administrative-procedures.json';
function fixture(approved) {
  const manifest = json(path.join(root, 'manifest.json'));
  assert.equal(manifest.releaseStatus, 'candidate');
  const files = new Map(manifest.artifacts.map(item => [item.path, fs.readFileSync(path.join(root, item.path), 'utf8')]));
  if (approved) {
    const holiday = JSON.parse(files.get('holiday-catalogs/ch-holiday-catalog.json'));
    holiday.activation.releaseEligibility = {status: 'approved', releaseId,
      approval: {on: '2026-10-15', by: 'SYNTHETIC AMD TEST ONLY', evidence: 'NO HUMAN RELEASE APPROVAL'}};
    const holidayText = encode(holiday);
    files.set('holiday-catalogs/ch-holiday-catalog.json', holidayText);
    const calendars = projectActivatedCalendars(holiday, hash(holidayText), FORMAT7_LEGACY_CALENDAR_BASELINE);
    for (const calendar of calendars) files.set(`calendars/${calendar.calendarId}.json`, encode(calendar));
    const componentRef = contentId => ({role: contentId === 'ch-holiday-catalog' ? 'holidayCatalog' : 'calendar', contentId,
      sha256: hash(files.get(`${contentId === 'ch-holiday-catalog' ? 'holiday-catalogs' : 'calendars'}/${contentId}.json`))});
    const social = rebindSocialCalendarCandidate(JSON.parse(files.get('social-procedures/ch-social-procedures.json')),
      releaseId, ['ch-federal-calendar', 'be-public-holidays', 'ch-holiday-catalog'].map(componentRef));
    for (const entry of social.releaseEligibility) {
      entry.status = 'approved';
      entry.approval = {approvedBy: 'SYNTHETIC AMD TEST ONLY', approvedOn: '2026-10-15', decisionRef: 'NO HUMAN RELEASE APPROVAL'};
    }
    files.set('social-procedures/ch-social-procedures.json', encode(social));
    const admin = JSON.parse(files.get(adminPath));
    const sourceReviewRef = {id: 'synthetic-amd-review', sha256: hash('synthetic only')};
    const referenceSuiteRef = {id: 'synthetic-amd-suite', sha256: hash('no human release approval')};
    const componentIds = [...new Set(admin.holidayBindings.flatMap(binding => binding.physicalBaseline.references.map(ref => ref.contentId)))];
    Object.assign(admin.releaseBinding, {status: 'approved', releaseId,
      approval: {approvedBy: 'SYNTHETIC AMD TEST ONLY', approvedOn: '2026-10-15', decisionRef: 'NO HUMAN RELEASE APPROVAL'},
      sourceReviewRef, referenceSuiteRef, targetComponentRefs: componentIds.map(componentRef)});
    for (const entry of admin.releaseBinding.pathEligibility) {
      const binding = admin.holidayBindings.find(item => item.holidayBindingId === entry.holidayBindingId);
      Object.assign(entry, {status: 'approved', sourceReviewRef, referenceSuiteRef,
        targetComponentRefs: binding.physicalBaseline.references.map(ref => componentRef(ref.contentId))});
    }
    files.set(adminPath, encode(admin));
    manifest.$schema = manifest.$schema.replace('local-reference-manifest-v8', 'release-manifest-v8');
    manifest.releaseId = releaseId;
    manifest.releaseStatus = 'approved';
    manifest.sourceSummary.latestReviewedOn = '2026-10-15';
    manifest.sourceSummary.legalBasisReviewStatus = 'verified';
    manifest.sourceSummary.technicalValidationStatus = 'passed';
    for (const item of manifest.artifacts) {
      item.byteLength = Buffer.byteLength(files.get(item.path)); item.sha256 = hash(files.get(item.path));
    }
  }
  files.set('manifest.json', encode(manifest));
  return files;
}
const approvedBytes = fixture(true), pendingBytes = fixture(false);
function provider(files = approvedBytes, pin = 'ap23d3-synthetic') {
  const fetched = [];
  return {id: 'same-friendly-provider-label', kind: 'sharepointMirror', cacheConfiguration: localMirrorConfiguration(pin), fetched,
    async fetchBytes(name) { fetched.push(name); assert.ok(files.has(name), name); return new Uint8Array(Buffer.from(files.get(name))); }};
}
function offline(original) { return {...original, async fetchBytes() {throw new Error('SYNTHETIC OFFLINE');}}; }
function historicalProvider() {
  const directory = path.join(REPO_ROOT, 'data/releases/2026-08-29-ap5-approved.1');
  const manifest = json(path.join(directory, 'manifest.json'));
  return provider(new Map(['manifest.json', ...manifest.artifacts.map(item => item.path)]
    .map(name => [name, fs.readFileSync(path.join(directory, name), 'utf8')])), 'ap5');
}

test('AP23D3 actual SPPKG rejects the unchanged D2 candidate before any artifact or cache activation', async t => {
  const runtime = loadPackagedHost(), source = provider(pendingBytes, 'pending-format8');
  t.diagnostic(JSON.stringify(runtime.provenance));
  await assert.rejects(runtime.service.refresh(source), /Format-8-Manifest.*JSON-Schema/);
  assert.deepEqual(source.fetched, ['manifest.json']);
  assert.equal(await runtime.service.getActive(source), undefined);
});

test('AP23D3 actual SPPKG activates all 41 synthetic Format8 artifacts and forwards the joint contexts', async () => {
  const runtime = loadPackagedHost(), source = provider();
  const activation = await runtime.service.refresh(source);
  assert.equal(source.fetched.length, 42);
  assert.equal(activation.release.formatVersion, '8.0.0');
  assert.equal(activation.release.artifacts.length, 41);
  assert.equal(activation.release.administrativeProcedureCatalogIds[0], 'ch-cantonal-administrative-procedures');
  runtime.host.applyActivationResult(activation, runtime.host.props.configurationKey);
  assert.equal(runtime.host.state.calculationData.formatVersion, '8.0.0');
  assert.equal(runtime.host.state.calculationData.releaseId, releaseId);
  assert.equal(runtime.host.state.calendarRuntime.releaseId, releaseId);
  assert.equal(runtime.host.state.administrativeContext.manifest.releaseId, releaseId);
  assert.equal(runtime.host.state.calculationData.profiles.size, 5);
  assert.equal(runtime.host.state.calculationData.calendarRuleSets.size, 32);
  const context = runtime.host.state.administrativeContext;
  const data = runtime.host.state.calculationData;
  runtime.host.applyActivationResult({...activation, mode: 'fallback', warning: 'Synthetic byte-identical revalidation'}, runtime.host.props.configurationKey);
  assert.equal(runtime.host.state.administrativeContext, context);
  assert.equal(runtime.host.state.calculationData, data);
  assert.equal(runtime.host.state.status, 'fallback');
  assert.equal(runtime.host.state.message, 'Synthetic byte-identical revalidation');
});

test('AP23D3 actual packaged UI retains StPO calculation and January fail-closed behavior under Format8', async () => {
  const runtime = loadPackagedHost();
  runtime.host.applyActivationResult(await runtime.service.refresh(provider()), runtime.host.props.configurationKey);
  const basic = {authorityCode: 'BE', profileId: 'stpo', inputDate: '2026-09-16', deadlineDays: '10',
    calendarContext: {role: 'partyWithoutRepresentative', canton: 'BE', areaFacts: {}}};
  const result = runtime.submitCalculator(basic);
  assert.equal(result.outcome, 'calculated');
  assert.equal(result.finalEnd, '2026-09-28');
  assert.equal(result.calendarExportAllowed, true);
  const january = runtime.submitCalculator({...basic, inputDate: '2029-01-01', deadlineDays: '1',
    calendarContext: {role: 'partyWithoutRepresentative', canton: 'SG', areaFacts: {}}});
  assert.equal(january.outcome, 'blocked');
  assert.equal(january.januaryComparison.outcome, 'different');
  assert.equal(january.finalEnd, undefined);
  assert.equal(january.calendarExportAllowed, false);
});

test('AP23D3 actual AMD UI selects TI, calculates its qualified administrative path and invalidates changed facts', async () => {
  const runtime = loadPackagedHost();
  runtime.host.applyActivationResult(await runtime.service.refresh(provider()), runtime.host.props.configurationKey);
  runtime.inspectCalculator({authorityCode: 'TI', profileId: '', inputDate: '2026-10-02', deadlineDays: '30'},
    ({tree, renderSession, findElement, stateValues}) => {
      const lawField = findElement(tree, node => node.props.options?.some(option => option.key === 'admin:lpamm-ti'));
      assert.ok(lawField, 'TI law choice must be present in the actual AMD UI');
      lawField.props.onChange(undefined, {key: 'admin:lpamm-ti'});
      tree = renderSession();
      const fields = findElement(tree, node => node.props.lawId === 'lpamm-ti' && node.props.catalog && typeof node.props.onChange === 'function');
      assert.ok(fields, 'Actual administrative field group must be mounted');
      fields.props.onChange({stage: 'administrativeAppeal', pathId: 'ti-80-30', qualification: 'generalActualReceipt', urgency: 'none'});
      tree = renderSession();
      findElement(tree, node => node.type === 'form').props.onSubmit({preventDefault() {}});
      const result = stateValues().find(value => value?.kind === 'administrative');
      assert.ok(result, 'Actual UI submit must invoke the issued administrative context');
      assert.equal(result.value.outcome, 'calculated');
      assert.equal(result.value.finalEnd, '2026-11-02');
      assert.equal(result.value.provenance.releaseId, releaseId);
      assert.equal(result.value.provenance.lawId, 'lpamm-ti');
      assert.equal(result.value.calendarExportAllowed, true);
      fields.props.onChange({stage: 'administrativeAppeal', pathId: 'ti-80-30', qualification: 'unknown', urgency: 'none'});
      assert.equal(stateValues().some(value => value?.kind === 'administrative'), false);
    });
});

test('AP23D3 actual packaged cache rejects modified admin bytes and never borrows another mirror or AP5', async () => {
  const runtime = loadPackagedHost(), source = provider();
  const initial = await runtime.service.refresh(source);
  const restored = await runtime.service.refresh(offline(source));
  assert.equal(restored.mode, 'fallback');
  assert.equal(restored.release.manifestSha256, initial.release.manifestSha256);
  await assert.rejects(runtime.service.refresh(offline(provider(approvedBytes, 'other-Q-mirror'))), /SYNTHETIC OFFLINE/);
  const ap5 = historicalProvider();
  await assert.rejects(runtime.service.refresh(offline(ap5)), /SYNTHETIC OFFLINE/);
  const old = await runtime.service.refresh(ap5);
  assert.equal(old.release.formatVersion, '1.0.0');
  runtime.host.applyActivationResult(old, runtime.host.props.configurationKey);
  assert.equal(runtime.host.state.administrativeContext, undefined);
  assert.equal(runtime.host.state.calendarRuntime, undefined);
  assert.equal((await runtime.service.refresh(offline(source))).release.manifestSha256, initial.release.manifestSha256);
  const changed = new Map(approvedBytes);
  changed.set(adminPath, changed.get(adminPath) + ' ');
  await assert.rejects(runtime.service.refresh(provider(changed, 'tampered-admin')));
});

test('AP23D3 actual package clears all old contexts when the configuration becomes unavailable', async () => {
  const runtime = loadPackagedHost();
  const activation = await runtime.service.refresh(provider());
  runtime.host.applyActivationResult(activation, runtime.host.props.configurationKey);
  const oldContext = runtime.host.state.administrativeContext;
  assert.ok(oldContext);
  const previous = runtime.host.props;
  runtime.host.props = {...previous, provider: undefined, configurationError: 'Deliberately unavailable new configuration'};
  runtime.host.componentDidUpdate(previous);
  assert.equal(runtime.host.state.status, 'error');
  assert.equal(runtime.host.state.calculationData, undefined);
  assert.equal(runtime.host.state.calendarRuntime, undefined);
  assert.equal(runtime.host.state.administrativeContext, undefined);
});
