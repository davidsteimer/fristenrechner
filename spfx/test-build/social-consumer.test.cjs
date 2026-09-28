// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const {REPO_ROOT, loadPackagedHost, sha256} = require('./package-harness.cjs');

function provider(transportApproved = false, mutate) {
  const directory = path.join(REPO_ROOT, 'data/candidates/2026-09-25-ap19c1');
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json')));
  const bytes = new Map();
  for (const item of manifest.artifacts) bytes.set(item.path, fs.readFileSync(path.join(directory, item.path)));
  if (transportApproved) manifest.releaseStatus = 'approved'; // Synthetic transport only, not social approval.
  if (mutate) {
    const item = manifest.artifacts.find(item => item.role === 'socialProcedureCatalog');
    const document = JSON.parse(bytes.get(item.path));
    mutate(document);
    const content = Buffer.from(JSON.stringify(document));
    item.sha256 = sha256(content); item.byteLength = content.length;
    bytes.set(item.path, content);
  }
  bytes.set('manifest.json', Buffer.from(JSON.stringify(manifest)));
  const fetched = [];
  return {id: 'isolated-social-build-fixture', kind: 'sharepointMirror', fetched, async fetchBytes(name) {
    fetched.push(name); assert.ok(bytes.has(name)); return new Uint8Array(bytes.get(name));
  }};
}

test('actual ES5 SocialCatalogError retains its error prototype', () => {
  const {SocialCatalogError} = require('../lib-commonjs/product/core/socialCatalog.js');
  const error = new SocialCatalogError('test');
  assert.ok(error instanceof Error);
  assert.ok(error instanceof SocialCatalogError);
});
test('actual packaged format-5 transport rejects the real candidate before artifact fetch', async () => {
  const runtime = loadPackagedHost(), fixture = provider();
  await assert.rejects(runtime.service.refresh(fixture), /candidate/);
  assert.deepEqual(fixture.fetched, ['manifest.json']);
  assert.equal(await runtime.store.getActive(), undefined);
});
test('actual packaged consumer retains candidate social approvals and blocks calculation', async t => {
  const runtime = loadPackagedHost();
  t.diagnostic(JSON.stringify(runtime.provenance));
  const result = await runtime.service.refresh(provider(true));
  runtime.host.applyActivationResult(result);
  assert.equal(runtime.host.state.status, 'ready');
  const data = runtime.host.state.calculationData;
  const catalog = data.socialProcedureCatalogs.get('ch-social-procedures');
  assert.equal(catalog.federalRules.length, 16);
  assert.ok(catalog.releaseEligibility.every(item => item.status === 'candidate' && item.approval === null));
  assert.equal(data.specialRegimeCatalogs.get('vrpg-be-special-regimes-rest').deadlineDefinitions.length, 33);
  const {calculateSocialDeadline} = require('../lib-commonjs/product/core/socialDeadline.js');
  const rule = catalog.federalRules.find(item => item.ruleId === 'CH-SOC-ELG-OBJ');
  const binding = catalog.cantonalBindings.find(item => item.ruleId === rule.ruleId), route = binding.contextRoutes[0];
  // Cross-realm data is serialized as a persisted transport would be before CommonJS consumption.
  const {createCalculationData} = require('../lib-commonjs/product/core/index.js');
  const ownData = createCalculationData(JSON.parse(JSON.stringify(result.release)));
  const calculation = calculateSocialDeadline({ruleId: rule.ruleId, bindingId: binding.bindingId, contextRouteId: route.contextRouteId, procedureContextCanton: 'BE', caseFacts: Object.fromEntries(route.requiredFacts.map(f => [f.factKey, f.allowedValues[0]])), qualificationBasis: 'displayed-model-scope', matter: rule.matter, triggerKind: rule.triggerKind, notificationChannel: 'individual-service', notificationConfirmed: false, legalTriggerDate: '2026-09-16', holidayResolution: {status: 'resolved', calendarBindingId: 'be-party', anchors: [{role: 'party', canton: 'BE', spatialScopeId: 'BE'}]}}, ownData);
  assert.deepEqual(calculation.blockReasonKeys, ['not-released']);
});
test('actual bundle rejects object-hash tampering without replacing a valid cache', async () => {
  const runtime = loadPackagedHost();
  const valid = await runtime.service.refresh(provider(true));
  const failed = await runtime.service.refresh(provider(true, catalog => { catalog.federalRules[0].labels.de += ' changed'; }));
  assert.equal(failed.mode, 'fallback');
  assert.equal(failed.release.manifestSha256, valid.release.manifestSha256);
  assert.match(failed.warning, /hash mismatch/);
});
