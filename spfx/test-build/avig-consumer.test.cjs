// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const {REPO_ROOT, loadPackagedHost, sha256} = require('./package-harness.cjs');

function provider(transportApproved = false, mutate) {
  const directory = path.join(REPO_ROOT, 'data/candidates/2026-09-28-ap19c2');
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json')));
  const bytes = new Map();
  for (const item of manifest.artifacts) bytes.set(item.path, fs.readFileSync(path.join(directory, item.path)));
  if (transportApproved) manifest.releaseStatus = 'approved'; // Synthetic transport fixture only.
  if (mutate) {
    const descriptor = manifest.artifacts.find(item => item.role === 'socialProcedureCatalog');
    const catalog = JSON.parse(bytes.get(descriptor.path));
    mutate(catalog);
    const content = Buffer.from(JSON.stringify(catalog));
    descriptor.sha256 = sha256(content); descriptor.byteLength = content.length;
    bytes.set(descriptor.path, content);
  }
  bytes.set('manifest.json', Buffer.from(JSON.stringify(manifest)));
  const fetched = [];
  return {id: 'isolated-ap19c2-build-fixture', kind: 'sharepointMirror', fetched, async fetchBytes(name) {
    fetched.push(name); assert.ok(bytes.has(name)); return new Uint8Array(bytes.get(name));
  }};
}
function inputFor(catalog, binding) {
  const rule = catalog.federalRules.find(item => item.ruleId === binding.ruleId), route = binding.contextRoutes[0];
  return {
    ruleId: rule.ruleId, bindingId: binding.bindingId, contextRouteId: route.contextRouteId,
    procedureContextCanton: 'BE', caseFacts: Object.fromEntries(route.requiredFacts.map(fact => [fact.factKey, fact.allowedValues[0]])),
    qualificationBasis: 'displayed-model-scope', matter: rule.matter, triggerKind: rule.triggerKind,
    notificationChannel: 'individual-service', notificationConfirmed: false, legalTriggerDate: '2026-09-16',
    ...(binding.normBindings.some(norm => norm.temporalSelector === 'jurisdictionReferenceDate') ? {jurisdictionReferenceDate: '2026-09-10'} : {}),
    ...(rule.calculation.durationInputId ? {days: 10} : {}),
    holidayResolution: {status: 'resolved', calendarBindingId: 'be-party', anchors: [{role: 'party', canton: 'BE', spatialScopeId: 'BE'}]}
  };
}
function ownData(release) {
  return require('../lib-commonjs/product/core/index.js').createCalculationData(JSON.parse(JSON.stringify(release)));
}
function syntheticAvigApproval(catalog) {
  const {socialObjectSha256} = require('../lib-commonjs/product/core/socialCatalog.js');
  for (const rule of catalog.federalRules.filter(rule => rule.law === 'avig')) rule.status = 'reviewed';
  for (const binding of catalog.cantonalBindings.filter(binding => binding.ruleId.startsWith('CH-SOC-AVIG-ALE-'))) binding.status = 'reviewed';
  for (const eligibility of catalog.releaseEligibility.filter(item => item.ruleRef.ruleId.startsWith('CH-SOC-AVIG-ALE-'))) {
    const rule = catalog.federalRules.find(rule => rule.ruleId === eligibility.ruleRef.ruleId);
    const binding = catalog.cantonalBindings.find(binding => binding.bindingId === eligibility.bindingRef.bindingId);
    eligibility.ruleRef.sha256 = socialObjectSha256(rule);
    eligibility.bindingRef.sha256 = socialObjectSha256(binding);
    eligibility.status = 'approved';
    eligibility.approval = {approvedBy: 'SYNTHETIC TEST FIXTURE ONLY', approvedOn: '2026-09-28', decisionRef: 'NO HUMAN APPROVAL OR DEPLOYMENT'};
  }
}

test('AP19C2 real packaged consumer rejects actual candidate before fetching any artifacts', async () => {
  const runtime = loadPackagedHost(), fixture = provider();
  await assert.rejects(runtime.service.refresh(fixture), /candidate/);
  assert.deepEqual(fixture.fetched, ['manifest.json']);
  assert.equal(await runtime.store.getActive(), undefined);
});

test('AP19C2 compiled consumer transports twenty rules, twenty-four bindings and blocks all actual AVIG paths', async t => {
  const runtime = loadPackagedHost();
  t.diagnostic(JSON.stringify(runtime.provenance));
  const activation = await runtime.service.refresh(provider(true));
  runtime.host.applyActivationResult(activation);
  assert.equal(runtime.host.state.status, 'ready');
  const data = ownData(activation.release), catalog = data.socialProcedureCatalogs.get('ch-social-procedures');
  assert.equal(catalog.federalRules.length, 20);
  assert.equal(catalog.cantonalBindings.length, 24);
  const {calculateSocialDeadline} = require('../lib-commonjs/product/core/socialDeadline.js');
  const bindings = catalog.cantonalBindings.filter(binding => binding.ruleId.startsWith('CH-SOC-AVIG-ALE-'));
  assert.equal(bindings.length, 8);
  for (const binding of bindings) assert.deepEqual(calculateSocialDeadline(inputFor(catalog, binding), data).blockReasonKeys, ['not-released'], binding.bindingId);
});

test('AP19C2 actual ES5 product computes all eight AVIG bindings only under isolated synthetic approvals', async () => {
  const runtime = loadPackagedHost();
  const activation = await runtime.service.refresh(provider(true, syntheticAvigApproval));
  const data = ownData(activation.release), catalog = data.socialProcedureCatalogs.get('ch-social-procedures');
  const {calculateSocialDeadline} = require('../lib-commonjs/product/core/socialDeadline.js');
  for (const binding of catalog.cantonalBindings.filter(binding => binding.ruleId.startsWith('CH-SOC-AVIG-ALE-'))) {
    const rule = catalog.federalRules.find(rule => rule.ruleId === binding.ruleId);
    const result = calculateSocialDeadline(inputFor(catalog, binding), data);
    assert.equal(result.outcome, 'calculated', binding.bindingId);
    assert.equal(result.finalDeadline.date, rule.calculation.durationInputId ? '2026-09-28' : '2026-10-16', binding.bindingId);
  }
});

test('AP19C2 compiled resolver rejects future fund reference dates and office/fund substitutions', async () => {
  const runtime = loadPackagedHost();
  const activation = await runtime.service.refresh(provider(true, syntheticAvigApproval));
  const data = ownData(activation.release), catalog = data.socialProcedureCatalogs.get('ch-social-procedures');
  const {calculateSocialDeadline} = require('../lib-commonjs/product/core/socialDeadline.js');
  for (const binding of catalog.cantonalBindings.filter(binding => binding.bindingId.startsWith('BE-SOC-AVIG-ALE-') && binding.bindingId.endsWith('-FUND'))) {
    const input = inputFor(catalog, binding);
    assert.deepEqual(calculateSocialDeadline({...input, jurisdictionReferenceDate: '2026-09-17'}, data).blockReasonKeys, ['context-unresolved']);
    assert.deepEqual(calculateSocialDeadline({...input, caseFacts: {...input.caseFacts, decisionOrigin: 'cantonalEmploymentOffice'}}, data).blockReasonKeys, ['context-unresolved']);
  }
});

test('AP19C2 packaged transport rejects tampered AVIG binding without replacing a valid cache', async () => {
  const runtime = loadPackagedHost();
  const valid = await runtime.service.refresh(provider(true));
  const failed = await runtime.service.refresh(provider(true, catalog => {
    catalog.cantonalBindings.find(binding => binding.bindingId === 'BE-SOC-AVIG-ALE-APP-FUND').labels.de += ' tampered';
  }));
  assert.equal(failed.mode, 'fallback');
  assert.equal(failed.release.manifestSha256, valid.release.manifestSha256);
  assert.match(failed.warning, /hash mismatch/);
});
