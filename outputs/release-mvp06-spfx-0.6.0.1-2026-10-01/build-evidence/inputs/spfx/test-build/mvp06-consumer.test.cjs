// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const {REPO_ROOT, loadPackagedHost, sha256} = require('./package-harness.cjs');

const releaseId = '2026-10-01-mvp-06-approved.1';
function provider(mutate) {
  const directory = path.join(REPO_ROOT, 'data/releases', releaseId);
  const manifestBytes = fs.readFileSync(path.join(directory, 'manifest.json'));
  const manifest = JSON.parse(manifestBytes);
  const bytes = new Map([['manifest.json', manifestBytes]]);
  for (const item of manifest.artifacts) bytes.set(item.path, fs.readFileSync(path.join(directory, item.path)));
  if (mutate) {
    const descriptor = manifest.artifacts.find(item => item.role === 'socialProcedureCatalog');
    const catalog = JSON.parse(bytes.get(descriptor.path));
    mutate(catalog);
    const content = Buffer.from(JSON.stringify(catalog));
    descriptor.sha256 = sha256(content); descriptor.byteLength = content.length;
    bytes.set(descriptor.path, content);
    bytes.set('manifest.json', Buffer.from(JSON.stringify(manifest)));
  }
  return {id: 'isolated-mvp06-approved-local-bytes', kind: 'sharepointMirror', async fetchBytes(name) {
    assert.ok(bytes.has(name)); return new Uint8Array(bytes.get(name));
  }};
}

test('MVP 0.6 actual package activates the approved format-6 release without synthetic approvals', async t => {
  const runtime = loadPackagedHost();
  t.diagnostic(JSON.stringify(runtime.provenance));
  const activation = await runtime.service.refresh(provider());
  runtime.host.applyActivationResult(activation);
  assert.equal(runtime.host.state.status, 'ready');
  const data = runtime.host.state.calculationData;
  assert.equal(data.releaseId, releaseId);
  const catalog = data.socialProcedureCatalogs.get('ch-social-procedures');
  assert.equal(catalog.federalRules.length, 44);
  assert.equal(catalog.cantonalBindings.length, 50);
  assert.ok(catalog.releaseEligibility.every(item => item.status === 'approved' && item.approval.approvedBy === 'David Steimer'));
});

test('MVP 0.6 emitted ES5 calculates all 50 actual approved bindings and keeps non-Bern contexts blocked', async () => {
  const runtime = loadPackagedHost();
  const activation = await runtime.service.refresh(provider());
  const {createCalculationData} = require('../lib-commonjs/product/core/index.js');
  const {calculateSocialDeadline} = require('../lib-commonjs/product/core/socialDeadline.js');
  const data = createCalculationData(JSON.parse(JSON.stringify(activation.release)));
  const catalog = data.socialProcedureCatalogs.get('ch-social-procedures');
  for (const binding of catalog.cantonalBindings) {
    const rule = catalog.federalRules.find(item => item.ruleId === binding.ruleId), route = binding.contextRoutes[0];
    const input = {
      ruleId: rule.ruleId, bindingId: binding.bindingId, contextRouteId: route.contextRouteId,
      procedureContextCanton: 'BE', caseFacts: Object.fromEntries(route.requiredFacts.map(fact => [fact.factKey, fact.allowedValues[0]])),
      qualificationBasis: 'displayed-model-scope', matter: rule.matter, triggerKind: rule.triggerKind,
      notificationChannel: 'individual-service', notificationConfirmed: false, legalTriggerDate: '2026-09-16',
      ...([...rule.normBindings, ...binding.normBindings].some(norm => norm.temporalSelector === 'jurisdictionReferenceDate')
        ? {jurisdictionReferenceDate: '2026-09-16'} : {}),
      ...(rule.calculation.durationInputId ? {days: 10} : {}),
      holidayResolution: {status: 'resolved', calendarBindingId: 'be-party', anchors: [{role: 'party', canton: 'BE', spatialScopeId: 'BE'}]}
    };
    const result = calculateSocialDeadline(input, data);
    assert.equal(result.outcome, 'calculated', `${binding.bindingId}: ${result.blockReasonKeys}`);
    assert.equal(result.finalDeadline.date, rule.calculation.durationInputId ? '2026-09-28' : '2026-10-16', binding.bindingId);
    assert.equal(result.socialEvidence.releaseId, releaseId);
    const outside = calculateSocialDeadline({...input, procedureContextCanton: 'ZH'}, data);
    assert.equal(outside.outcome, 'blocked', binding.bindingId);
    assert.equal(outside.finalDeadline, undefined, binding.bindingId);
  }
});

test('MVP 0.6 packaged tamper rejection preserves the previously validated active release', async () => {
  const runtime = loadPackagedHost();
  const valid = await runtime.service.refresh(provider());
  const failed = await runtime.service.refresh(provider(catalog => {
    catalog.cantonalBindings.find(binding => binding.bindingId === 'BE-SOC-KVG-OKP-APP').labels.de += ' tampered';
  }));
  assert.equal(failed.mode, 'fallback');
  assert.equal(failed.release.manifestSha256, valid.release.manifestSha256);
  assert.match(failed.warning, /hash mismatch/);
});
