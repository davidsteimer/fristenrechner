// SPDX-License-Identifier: AGPL-3.0-only
// Actual isolated SPPKG AMD handlers. Hook storage is simulated by the unchanged
// package harness. This is not a DOM, device, installation or legal-release proof.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { buildSyntheticFormat17, encode17 } from '../core/ap23m3Fixtures';

const selectedStage = process.env.R10_U1_PACKAGE_STAGE;
if (selectedStage) assert.match(selectedStage, /^\.work\/r10-u1-spfx-build-[A-Za-z0-9]{6}$/);
const report = selectedStage
  ? { stage: selectedStage, testPackage: { path: `${selectedStage}/spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` } }
  : JSON.parse(readFileSync('outputs/r10-u1-2026-10-28/spfx-build.json', 'utf8'));
if (!selectedStage) assert.equal(report.status, 'passed');
const require = createRequire(import.meta.url);
const { loadPackagedHost, localMirrorConfiguration } = require(resolve(report.stage, 'spfx/test-build/package-harness.cjs'));
const synthetic = buildSyntheticFormat17('approved');
const files = new Map([['manifest.json', encode17(synthetic.manifest)], ...synthetic.files]);
const host = loadPackagedHost(resolve(report.testPackage.path));
const source = { id: 'R10-U1-SYNTHETIC-ONLY', kind: 'sharepointMirror', cacheConfiguration: localMirrorConfiguration('r10-u1-social-native17'),
  async fetchBytes(path: string) { assert.ok(files.has(path), path); return new TextEncoder().encode(files.get(path)!); } };
const activation = await host.service.refresh(source);
host.host.applyActivationResult(activation, host.host.props.configurationKey);

test('R10-U1 actual AMD validates one genuine native17 context with unchanged44 social rules and50 BE bindings', () => {
  const data = host.host.state.calculationData;
  assert.equal(data.formatVersion, '17.0.0');
  const catalogs = [...data.socialProcedureCatalogs.values()]; assert.equal(catalogs.length, 1);
  assert.equal(catalogs[0].federalRules.length, 44); assert.equal(catalogs[0].cantonalBindings.length, 50);
});

const cases = [
  { law: 'ivg', action: 'preliminary-objection', rule: 'CH-SOC-IVG-PRE', fact: /^Kanton der für diesen Fall zuständigen IV-Stelle$/ },
  { law: 'elg', action: 'objection', rule: 'CH-SOC-ELG-OBJ', fact: /^Für diesen Verwaltungsfall zuständiger Kanton$/ },
  { law: 'eog', action: 'objection', rule: 'CH-SOC-EOG-OBJ', fact: /^Wohnsitzkanton.*fristauslösender Zustellung$/ },
  { law: 'mvg', action: 'objection', rule: 'CH-SOC-MVG-OBJ', fact: /^Wohnsitzkanton.*fristauslösender Zustellung$/ }
] as const;
for (const sample of cases) test(`R10-U1 actual AMD ${sample.law} selectors, missing facts, calculation, export gate and invalidation`, () => {
  host.inspectCalculator({ authorityCode: 'BE', profileId: 'vrpg-be', inputDate: '2026-09-16', deadlineDays: '10',
    vrpgSelection: { area: 'social', law: sample.law, action: sample.action, stage: '' } }, (state: any) => {
    let tree = state.tree;
    const find = (predicate: (element: any) => boolean) => state.findElement(tree, predicate);
    const select = (label: RegExp, key: string) => {
      const element = find(element => label.test(element.props.label ?? '') && typeof element.props.onChange === 'function' && Array.isArray(element.props.options));
      assert.ok(element, `Missing packaged control ${label}`);
      assert.ok(element.props.options.some((option: any) => option.key === key), `Missing packaged option ${key}`);
      element.props.onChange(undefined, { key }); tree = state.renderSession();
    };
    const submit = () => {
      const form = find(element => element.type === 'form'); assert.ok(form);
      form.props.onSubmit({ preventDefault() {} }); tree = state.renderSession();
    };
    const result = () => state.stateValues().find((value: any) => value?.kind === 'social');
    const law = find(element => element.props.label === 'Spezialerlass'); assert.ok(law);
    assert.deepEqual(Array.from(law.props.options, (option: any) => option.key),
      ['', 'ivg', 'ahvg', 'uvg', 'elg', 'avig', 'kvg', 'eog', 'famzg', 'flg', 'mvg', 'uelg']);
    assert.equal(law.props.selectedKey, sample.law);
    const actualFact = find(element => sample.fact.test(element.props.label ?? ''));
    assert.ok(actualFact); assert.equal(actualFact.props.selectedKey, '');
    submit(); assert.equal(result(), undefined, 'Selected product path is not a current jurisdiction fact');
    select(sample.fact, 'BE');
    const holidays = find(element => element.props.className === 'fr-holiday-connections'); assert.ok(holidays);
    assert.equal(holidays.props.selectedKey, '');
    holidays.props.onChange(undefined, { key: 'partyBE' }); tree = state.renderSession(); submit();
    const calculated = result(); assert.ok(calculated);
    assert.equal(calculated.value.outcome, 'calculated');
    assert.equal(calculated.value.finalDeadline.date, '2026-10-16');
    const panel = find(element => element.props.socialSelection?.rule.ruleId === sample.rule && element.props.result);
    assert.ok(panel, 'Real packaged result component missing');
    assert.equal(panel.props.socialSelection.rule.ruleId, sample.rule);
    assert.equal(panel.props.allowCalendarExport, true, 'Only the explicitly synthetic-approved context is exportable here');
    assert.equal(panel.props.referenceOnly, false);
    const positivePanel = state.component(panel).render();
    assert.ok(state.findElement(positivePanel, (element: any) => element.props.deadlineDate === '2026-10-16'
      && typeof element.props.onReferenceChange === 'function'), 'The genuine positive result component offers the calendar tile');
    select(sample.fact, 'ZH'); assert.equal(result(), undefined, 'Changing a current fact must immediately remove the old result');
    assert.equal(find(element => element.props.socialSelection && element.props.result), undefined);
    submit(); const blocked = result(); assert.ok(blocked);
    assert.equal(blocked.value.outcome, 'blocked', 'The Bern product boundary cannot be silently extended');
    assert.equal(blocked.value.finalDeadline, undefined);
    const blockedPanel = find(element => element.props.socialSelection?.rule.ruleId === sample.rule && element.props.result);
    assert.ok(blockedPanel);
    assert.equal(state.findElement(state.component(blockedPanel).render(), (element: any) => element.props.deadlineDate !== undefined), undefined,
      'The genuine blocked result component offers no calendar tile');
  });
});
