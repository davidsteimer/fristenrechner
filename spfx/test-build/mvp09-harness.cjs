// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
// Real approved Format-9 bytes through actual packaged AMD handlers. No source
// transpilation and no synthetic release approvals. DOM/download is simulated.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const {REPO_ROOT, loadPackagedHost, localMirrorConfiguration, sha256} = require('./package-harness.cjs');
// Explicit local preflight override. The definitive build forbids this variable.
const actualHost = () => loadPackagedHost(process.env.FRISTENRECHNER_TEST_SPPKG);
const releaseId = '2026-10-18-mvp-09-approved.1';
const manifestSha256 = '3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265';
const adminPath = 'administrative-procedures/ch-cantonal-administrative-procedures.json';
function provider(release = releaseId, suffix = '', corrupt = false) {
  const directory = path.join(REPO_ROOT, 'data/releases', release);
  const manifestBytes = fs.readFileSync(path.join(directory, 'manifest.json'));
  const manifest = JSON.parse(manifestBytes);
  if (release === releaseId) assert.equal(sha256(manifestBytes), manifestSha256);
  const files = new Map([['manifest.json', manifestBytes], ...manifest.artifacts.map(item =>
    [item.path, fs.readFileSync(path.join(directory, item.path))])]);
  if (corrupt) files.set(adminPath, Buffer.concat([files.get(adminPath), Buffer.from('\n')]));
  const fetched = [];
  return {id: 'same-user-facing-label', kind: 'sharepointMirror', fetched,
    cacheConfiguration: localMirrorConfiguration(`${release}${suffix}`),
    async fetchBytes(name) { fetched.push(name); assert.ok(files.has(name)); return new Uint8Array(files.get(name)); }};
}
const offline = original => ({...original, async fetchBytes() {throw new Error('MVP09 TEST OFFLINE');}});
async function runtime() {
  const result = actualHost();
  result.host.applyActivationResult(await result.service.refresh(provider()), result.host.props.configurationKey);
  return result;
}
const basic = {authorityCode: 'BE', profileId: 'stpo', inputDate: '2026-09-16', deadlineDays: '10',
  calendarContext: {role: 'partyWithoutRepresentative', canton: 'BE', areaFacts: {}}};
function inspectAdministrative(host, values, inspect) {
  const canton = values.pathId.split('-')[0].toUpperCase();
  const lawId = {TI: 'lpamm-ti', GR: 'vrg-gr', LU: 'vrg-lu', ZG: 'vrg-zg', AR: 'vrpg-ar'}[canton];
  assert.ok(lawId, `Known exact law for ${values.pathId}`);
  return host.inspectCalculator({authorityCode: canton, profileId: '', inputDate: values.inputDate ?? '2026-10-02', deadlineDays: String(values.days)}, state => {
    let tree = state.tree;
    if (values.locale === 'fr') {
      state.findElement(tree, element => element.props.className === 'fr-language').props.onChange(undefined, {key: 'fr'});
      tree = state.renderSession();
    }
    const law = state.findElement(tree, element => element.props.options?.some(option => option.key === `admin:${lawId}`));
    assert.ok(law, `${lawId} real UI selector`);
    law.props.onChange(undefined, {key: `admin:${lawId}`});
    tree = state.renderSession();
    const fields = state.findElement(tree, element => element.props.lawId === lawId && element.props.catalog && typeof element.props.onChange === 'function');
    assert.ok(fields);
    const selection = {stage: values.stage, pathId: values.pathId, qualification: values.qualification ?? 'generalActualReceipt', urgency: values.urgency ?? 'none'};
    fields.props.onChange(selection);
    tree = state.renderSession();
    state.findElement(tree, element => element.type === 'form').props.onSubmit({preventDefault() {}});
    tree = state.renderSession();
    const result = state.stateValues().find(value => value?.kind === 'administrative');
    assert.ok(result, `Actual administrative submit for ${values.pathId}`);
    return inspect({...state, tree, fields, selection, result: result.value});
  });
}
function attachDownloadBoundary(host) {
  const captured = [], blobs = new Map();
  class DownloadURL extends URL {}
  DownloadURL.createObjectURL = blob => {const id = `blob:local-mvp09/${blobs.size + 1}`; blobs.set(id, blob); return id;};
  DownloadURL.revokeObjectURL = () => {};
  host.context.URL = DownloadURL;
  host.context.Blob = Blob;
  host.context.document = {createElement(tag) {assert.equal(tag, 'a'); return {remove() {}, click() {
    assert.ok(blobs.has(this.href)); captured.push({filename: this.download, blob: blobs.get(this.href)});
  }};}, body: {appendChild() {}}};
  return captured;
}

function registerActivationTest() { test('MVP09 actual SPPKG loads exactly 42 approved files with complete 25-path authority', async t => {
  const host = actualHost(), source = provider();
  t.diagnostic(JSON.stringify(host.provenance));
  const activated = await host.service.refresh(source);
  assert.equal(source.fetched.length, 42);
  assert.equal(activated.release.releaseId, releaseId);
  assert.equal(activated.release.manifestSha256, manifestSha256);
  assert.equal(activated.release.formatVersion, '9.0.0');
  assert.equal(activated.release.artifacts.length, 41);
  host.host.applyActivationResult(activated, host.host.props.configurationKey);
  assert.equal(host.host.state.calendarRuntime.referenceOnly, false);
  assert.equal(host.host.state.administrativeContext.manifest.releaseId, releaseId);
  assert.equal(host.host.state.calculationData.profiles.size, 5);
  assert.equal(host.host.state.calculationData.calendarRuleSets.size, 32);
  assert.equal(host.host.state.administrativeContext.administrativeCatalog.paths.length, 25);
  assert.equal(host.host.state.administrativeContext.administrativeCatalog.qualificationPolicies.length, 25);
  assert.equal(host.host.state.administrativeContext.administrativeCatalog.formatVersion, '2.0.0');
  assert.equal(host.host.state.calculationData.socialProcedureCatalogs.get('ch-social-procedures').federalRules.length, 44);
  assert.equal(host.host.state.calculationData.socialProcedureCatalogs.get('ch-social-procedures').cantonalBindings.length, 50);
}); }

const pathCases = [
  ['ti-80-30', 'administrativeAppeal', 30, '2026-11-02'],
  ['ti-84-30', 'court', 30, '2026-11-02'],
  ['ti-reply', 'court', 10, '2026-10-12'],
  ['ti-provisional-15', 'administrativeAppeal', 15, '2026-10-19'],
  ['ti-advance', 'court', 10, '2026-10-12'],
  ['gr-32-30', 'administrativeAppeal', 30, '2026-11-02'],
  ['gr-32-10', 'administrativeAppeal', 10, '2026-10-12'],
  ['gr-admin-ordered', 'administration', 10, '2026-10-12'],
  ['gr-52-30', 'court', 30, '2026-11-02'],
  ['gr-52-10', 'court', 10, '2026-10-12'],
  ['gr-42-10', 'court', 10, '2026-10-12'],
  ['gr-court-ordered', 'court', 10, '2026-10-12'],
  ['lu-admin-30', 'administrativeAppeal', 30, '2026-11-02'],
  ['lu-court-30', 'court', 30, '2026-11-02'],
  ['lu-admin-ordered', 'administration', 10, '2026-10-12'],
  ['lu-court-ordered', 'court', 10, '2026-10-12'],
  ['zg-admin-20', 'administrativeAppeal', 20, '2026-10-22'],
  ['zg-court-30', 'court', 30, '2026-11-02'],
  ['zg-admin-ordered', 'administration', 10, '2026-10-12'],
  ['zg-court-ordered', 'court', 10, '2026-10-12'],
  ['ar-admin-20', 'administrativeAppeal', 20, '2026-10-22'],
  ['ar-execution-5', 'administrativeAppeal', 5, '2026-10-07'],
  ['ar-admin-ordered', 'administration', 10, '2026-10-12'],
  ['ar-court-30', 'court', 30, '2026-11-02'],
  ['ar-court-ordered', 'court', 10, '2026-10-12']
];
function registerPathTests(ids) { for (const [pathId, stage, days, expected] of pathCases.filter(row => ids.includes(row[0]))) test(`MVP09 actual packaged UI calculates released ${pathId}`, async () => {
  inspectAdministrative(await runtime(), {pathId, stage, days}, ({result, stateValues}) => {
    assert.equal(result.outcome, 'calculated'); assert.equal(result.finalEnd, expected);
    assert.equal(result.calendarExportAllowed, true);
    assert.equal(result.provenance.releaseId, releaseId);
    assert.equal(result.provenance.pathId, pathId);
    assert.match(result.provenance.qualificationPolicySha256, /^[a-f0-9]{64}$/);
    const input = stateValues().find(value => value?.kind === 'administrative').input;
    if (/^(lu|zg|ar)-/.test(pathId)) {
      assert.equal(input.caseQualification.notice, 'uncontested');
      assert.equal(input.caseQualification.opening, 'qualifiedCompleteActualDelivery');
      assert.equal(input.caseQualification.unit, 'day');
      assert.equal(input.caseQualification.direction, 'forward');
      assert.equal(input.caseQualification.termChange, 'none');
      const expectedAction = pathId.includes('ordered') ? 'proceduralSubmission'
        : pathId === 'ar-execution-5' ? 'executionAppeal' : 'ordinaryAppeal';
      const expectedDecision = pathId.includes('ordered') ? 'notApplicable'
        : pathId === 'ar-execution-5' ? 'qualifiedVRPGArt63Order' : 'finalDecision';
      assert.equal(input.caseQualification.action, expectedAction);
      assert.equal(input.caseQualification.decisionKind, expectedDecision);
    } else assert.equal(input.caseQualification, undefined);
  });
}); }

function registerFederalTest() { test('MVP09 actual packaged UI keeps StPO and January fail-closed behavior', async () => {
  const host = await runtime(), result = host.submitCalculator(basic);
  assert.equal(result.finalEnd, '2026-09-28'); assert.equal(result.calendarExportAllowed, true);
  const blocked = host.submitCalculator({...basic, inputDate: '2029-01-01', deadlineDays: '1',
    calendarContext: {role: 'partyWithoutRepresentative', canton: 'SG', areaFacts: {}}});
  assert.equal(blocked.outcome, 'blocked'); assert.equal(blocked.finalEnd, undefined);
  assert.equal(blocked.januaryComparison.outcome, 'different'); assert.equal(blocked.calendarExportAllowed, false);
}); }
function registerBlockingTest() { test('MVP09 actual packaged UI preserves TI-O2 block and clears stale qualified results', async () => {
  const host = await runtime();
  inspectAdministrative(host, {pathId: 'ti-80-30', stage: 'administrativeAppeal', days: 30, inputDate: '2027-02-17'}, ({result, tree, findElement, component}) => {
    assert.equal(result.outcome, 'blocked'); assert.equal(result.finalEnd, undefined); assert.equal(result.calendarExportAllowed, false);
    const resultView = findElement(tree, element => element.props.result === result && element.props.context);
    const view = component(resultView).render();
    assert.ok(!findElement(view, element => element.props.className === 'fr-calendar-export__button'));
  });
  inspectAdministrative(host, {pathId: 'ti-80-30', stage: 'administrativeAppeal', days: 30}, ({fields, selection, stateValues}) => {
    fields.props.onChange({...selection, qualification: 'unknown'});
    assert.equal(stateValues().some(value => value?.kind === 'administrative'), false);
  });
}); }
function registerCacheTest() { test('MVP09 actual packaged cache never borrows a foreign mirror or historical AP5 cache', async () => {
  const host = actualHost(), source = provider();
  const current = await host.service.refresh(source);
  assert.equal((await host.service.refresh(offline(source))).release.manifestSha256, manifestSha256);
  await assert.rejects(host.service.refresh(offline(provider(releaseId, '-other-mirror'))), /MVP09 TEST OFFLINE/);
  await assert.rejects(host.service.refresh(provider(releaseId, '-tampered', true)));
  const ap5 = provider('2026-08-29-ap5-approved.1');
  await assert.rejects(host.service.refresh(offline(ap5)), /MVP09 TEST OFFLINE/);
  const historical = await host.service.refresh(ap5);
  assert.equal(historical.release.formatVersion, '1.0.0');
  host.host.applyActivationResult(historical, host.host.props.configurationKey);
  assert.equal(host.host.state.administrativeContext, undefined);
  assert.equal(host.host.state.calendarRuntime, undefined);
  host.host.applyActivationResult(current, host.host.props.configurationKey);
  assert.equal(host.host.state.administrativeContext.manifest.releaseId, releaseId);
}); }
function registerExportTests(pathId = 'ti-80-30') { for (const locale of ['de', 'fr']) test(`MVP09 actual AMD administrative export saves a verified ${pathId} ${locale} ICS`, async t => {
  const host = await runtime(), captured = attachDownloadBoundary(host);
  const scenario = pathCases.find(row => row[0] === pathId); assert.ok(scenario);
  const [, stage, days, expected] = scenario;
  inspectAdministrative(host, {pathId, stage, days, locale}, ({tree, result, findElement}) => {
    const view = findElement(tree, element => element.props.result === result && typeof element.props.onExport === 'function');
    assert.ok(view, 'Real UI must offer its real export handler'); view.props.onExport();
  });
  assert.equal(captured.length, 1);
  const content = await captured[0].blob.text(), unfolded = content.replace(/\r\n /g, '');
  assert.ok(unfolded.includes(`DTSTART;VALUE=DATE:${expected.replaceAll('-', '')}\r\n`));
  const nextDate = new Date(expected + 'T00:00:00Z'); nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  assert.ok(unfolded.includes(`DTEND;VALUE=DATE:${nextDate.toISOString().slice(0, 10).replaceAll('-', '')}\r\n`));
  assert.match(unfolded, /TRANSP:TRANSPARENT/); assert.match(unfolded, /CATEGORIES:Fristablauf/);
  assert.match(unfolded, /TRIGGER:-PT112H/);
  assert.match(unfolded, locale === 'de' ? /SUMMARY:Fristablauf/ : /SUMMARY:Échéance du délai/);
  assert.ok(unfolded.includes(releaseId), 'Export provenance includes actual release');
  assert.ok(unfolded.includes(`pathId: ${pathId}`), 'Export provenance includes actual qualified path');
  assert.doesNotMatch(unfolded, /(?:ATTENDEE|ORGANIZER|RRULE|ATTACH):/);
  for (const line of content.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75);
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), `fristenrechner-mvp09-amd-${locale}-`));
  const output = path.join(directory, captured[0].filename);
  fs.writeFileSync(output, content, {flag: 'wx'});
  assert.equal(fs.readFileSync(output, 'utf8'), content);
  t.diagnostic(JSON.stringify({locale, savedCalendar: output, sha256: sha256(Buffer.from(content)),
    package: host.provenance, browserDownloadOrOutlookProof: false}));
}); }
function registerQualificationTests(prefix) {
  for (const [pathId, stage, days] of pathCases.filter(row => row[0].startsWith(prefix))) {
    test(`MVP09 actual packaged UI never derives current facts for ${pathId}`, async () => {
      inspectAdministrative(await runtime(), {pathId, stage, days}, ({fields, selection, stateValues, renderSession, findElement}) => {
        for (const qualification of ['', 'unknown', 'specialOrDeviating']) {
          fields.props.onChange({...selection, qualification});
          const tree = renderSession();
          findElement(tree, element => element.type === 'form').props.onSubmit({preventDefault() {}});
          assert.equal(stateValues().some(value => value?.kind === 'administrative'), false, qualification);
        }
      });
    });
  }
}
function registerArBoundaryTest() {
  test('MVP09 actual packaged AR-O1 stays blocked with no export', async () => {
    inspectAdministrative(await runtime(), {pathId: 'ar-court-30', stage: 'court', days: 30, inputDate: '2027-02-18'},
      ({result, tree, findElement, component}) => {
        assert.equal(result.outcome, 'blocked');
        assert.ok(result.blockReasonKeys.includes('endShiftIntoSuspensionUnresolved'));
        assert.equal(result.finalEnd, undefined); assert.equal(result.calendarExportAllowed, false);
        const resultView = findElement(tree, element => element.props.result === result && element.props.context);
        assert.ok(resultView);
        assert.ok(!findElement(component(resultView).render(), element => element.props.className === 'fr-calendar-export__button'));
      });
  });
}
module.exports = {registerActivationTest, registerPathTests, registerFederalTest,
  registerBlockingTest, registerCacheTest, registerExportTests, registerQualificationTests, registerArBoundaryTest};
