// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const {REPO_ROOT, loadPackagedHost, sha256} = require('./package-harness.cjs');

function provider(transportApproved = false, mutate) {
  const directory = path.join(REPO_ROOT, 'data/candidates/2026-09-30-ap20c1');
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json')));
  assert.equal(manifest.releaseStatus, 'candidate');
  const bytes = new Map();
  for (const item of manifest.artifacts) bytes.set(item.path, fs.readFileSync(path.join(directory, item.path)));
  const descriptor = manifest.artifacts.find(item => item.role === 'socialProcedureCatalog');
  const catalog = JSON.parse(bytes.get(descriptor.path));
  // In-memory transport fixture only. No file, human approval or deployment.
  if (transportApproved) manifest.releaseStatus = 'approved';
  if (mutate) {
    mutate({manifest, catalog, descriptor});
    const content = Buffer.from(JSON.stringify(catalog));
    descriptor.sha256 = sha256(content); descriptor.byteLength = content.length;
    bytes.set(descriptor.path, content);
  }
  bytes.set('manifest.json', Buffer.from(JSON.stringify(manifest)));
  const fetched = [];
  return {id:'isolated-ap20c1-built-fixture', kind:'sharepointMirror', fetched, async fetchBytes(name) {
    fetched.push(name); assert.ok(bytes.has(name)); return new Uint8Array(bytes.get(name));
  }};
}

function syntheticEogApproval({catalog}) {
  const {socialObjectSha256} = require('../lib-commonjs/product/core/socialCatalog.js');
  for (const rule of catalog.federalRules.filter(rule => rule.law === 'eog')) rule.status = 'reviewed';
  for (const binding of catalog.cantonalBindings.filter(binding => binding.ruleId.startsWith('CH-SOC-EOG-'))) binding.status = 'reviewed';
  for (const eligibility of catalog.releaseEligibility.filter(item => item.ruleRef.ruleId.startsWith('CH-SOC-EOG-'))) {
    eligibility.ruleRef.sha256 = socialObjectSha256(catalog.federalRules.find(rule => rule.ruleId === eligibility.ruleRef.ruleId));
    eligibility.bindingRef.sha256 = socialObjectSha256(catalog.cantonalBindings.find(binding => binding.bindingId === eligibility.bindingRef.bindingId));
    eligibility.status = 'approved';
    eligibility.approval = {approvedBy:'SYNTHETIC TEST FIXTURE ONLY', approvedOn:'2026-09-30', decisionRef:'NO HUMAN APPROVAL OR DEPLOYMENT'};
  }
}

function compiledData(release) {
  return require('../lib-commonjs/product/core/index.js').createCalculationData(JSON.parse(JSON.stringify(release)));
}

function inputFor(catalog, binding) {
  const rule = catalog.federalRules.find(item => item.ruleId === binding.ruleId), route = binding.contextRoutes[0];
  return {
    ruleId:rule.ruleId, bindingId:binding.bindingId, contextRouteId:route.contextRouteId,
    procedureContextCanton:'BE', caseFacts:Object.fromEntries(route.requiredFacts.map(fact => [fact.factKey, fact.allowedValues[0]])),
    qualificationBasis:'displayed-model-scope', matter:rule.matter, triggerKind:rule.triggerKind,
    notificationChannel:'individual-service', notificationConfirmed:false, legalTriggerDate:'2026-09-16',
    ...([...rule.normBindings, ...binding.normBindings].some(norm => norm.temporalSelector === 'jurisdictionReferenceDate') ? {jurisdictionReferenceDate:'2026-09-16'} : {}),
    ...(rule.calculation.durationInputId ? {days:10} : {}),
    holidayResolution:{status:'resolved', calendarBindingId:'be-party', anchors:[{role:'party', canton:'BE', spatialScopeId:'BE'}]}
  };
}

test('AP20C1 actual packaged consumer rejects candidate before artifact fetch', async t => {
  const runtime = loadPackagedHost(), fixture = provider();
  t.diagnostic(JSON.stringify(runtime.provenance));
  await assert.rejects(runtime.service.refresh(fixture), /candidate/);
  assert.deepEqual(fixture.fetched, ['manifest.json']);
  assert.equal(await runtime.store.getActive(), undefined);
});

test('AP20C1 actual bundle reads format 6 and component 2 but retains every candidate gate', async () => {
  const runtime = loadPackagedHost(), activation = await runtime.service.refresh(provider(true));
  runtime.host.applyActivationResult(activation);
  assert.equal(runtime.host.state.status, 'ready');
  assert.equal(runtime.host.state.calculationData.formatVersion, '6.0.0');
  const data = compiledData(activation.release), catalog = data.socialProcedureCatalogs.get('ch-social-procedures');
  assert.equal(catalog.formatVersion, '2.0.0'); assert.equal(catalog.federalRules.length, 28); assert.equal(catalog.cantonalBindings.length, 34);
  assert.ok(catalog.releaseEligibility.every(item => item.status === 'candidate' && item.approval === null));
  const {calculateSocialDeadline} = require('../lib-commonjs/product/core/socialDeadline.js');
  const bindings = catalog.cantonalBindings.filter(binding => binding.ruleId.startsWith('CH-SOC-EOG-'));
  assert.equal(bindings.length, 6);
  for (const binding of bindings) assert.deepEqual(calculateSocialDeadline(inputFor(catalog, binding), data).blockReasonKeys, ['not-released'], binding.bindingId);
});

test('AP20C1 emitted ES5 calculates all six EOG routes only under explicit synthetic test approvals', async () => {
  const runtime = loadPackagedHost(), activation = await runtime.service.refresh(provider(true, syntheticEogApproval));
  runtime.host.applyActivationResult(activation);
  assert.equal(runtime.host.state.status, 'ready');
  const data = compiledData(activation.release), catalog = data.socialProcedureCatalogs.get('ch-social-procedures');
  const {calculateSocialDeadline} = require('../lib-commonjs/product/core/socialDeadline.js');
  const bindings = catalog.cantonalBindings.filter(binding => binding.ruleId.startsWith('CH-SOC-EOG-'));
  assert.equal(bindings.length, 6);
  for (const binding of bindings) {
    const input = inputFor(catalog, binding), rule = catalog.federalRules.find(rule => rule.ruleId === binding.ruleId);
    const result = calculateSocialDeadline(input, data);
    assert.equal(result.outcome, 'calculated', `${binding.bindingId}: ${result.blockReasonKeys}`);
    assert.equal(result.finalDeadline.date, rule.calculation.durationInputId ? '2026-09-28' : '2026-10-16', binding.bindingId);
    assert.equal(result.socialEvidence.bindingId, binding.bindingId);
    assert.equal(calculateSocialDeadline({...input, procedureContextCanton:'ZH'}, data).outcome, 'blocked');
  }
});

for (const [name, mutate] of [
  ['social component 1 descriptor in manifest 6', ({catalog, descriptor}) => {
    descriptor.schemaId = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/social-procedure-catalog.schema.json';
    catalog.$schema = descriptor.schemaId; catalog.formatVersion = '1.0.0';
  }],
  ['minimum consumer 5 in manifest 6', ({manifest}) => {manifest.compatibility.minimumConsumerFormatVersion = '5.0.0';}]
]) test(`AP20C1 actual package rejects ${name} without activating anything`, async () => {
  const runtime = loadPackagedHost();
  await assert.rejects(runtime.service.refresh(provider(true, mutate)), /JSON-Schema/);
  assert.equal(await runtime.store.getActive(), undefined);
});

test('AP20C1 actual package preserves its validated cache after EOG object tampering', async () => {
  const runtime = loadPackagedHost(), valid = await runtime.service.refresh(provider(true));
  const failed = await runtime.service.refresh(provider(true, ({catalog}) => {
    catalog.cantonalBindings.find(binding => binding.bindingId === 'BE-SOC-EOG-CANTONAL-APP').labels.de += ' tampered';
  }));
  assert.equal(failed.mode, 'fallback');
  assert.equal(failed.release.manifestSha256, valid.release.manifestSha256);
  assert.match(failed.warning, /hash mismatch/);
});
