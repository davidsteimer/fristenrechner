// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const {REPO_ROOT, loadPackagedHost, sha256} = require('./package-harness.cjs');
const newRule = id => /^CH-SOC-(MVG|UELG)-/.test(id);

function provider(transportApproved = false, mutate) {
  const directory = path.join(REPO_ROOT, 'data/candidates/2026-10-01-ap20c3');
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json')));
  assert.equal(manifest.releaseStatus, 'candidate');
  const bytes = new Map();
  for (const item of manifest.artifacts) bytes.set(item.path, fs.readFileSync(path.join(directory, item.path)));
  const descriptor = manifest.artifacts.find(item => item.role === 'socialProcedureCatalog');
  const catalog = JSON.parse(bytes.get(descriptor.path));
  // In-memory transport fixture only, never a file or operational approval.
  if (transportApproved) manifest.releaseStatus = 'approved';
  if (mutate) {
    mutate({manifest, catalog, descriptor});
    const content = Buffer.from(JSON.stringify(catalog));
    descriptor.sha256 = sha256(content); descriptor.byteLength = content.length;
    bytes.set(descriptor.path, content);
  }
  bytes.set('manifest.json', Buffer.from(JSON.stringify(manifest)));
  const fetched = [];
  return {id: 'isolated-ap20c3-built-fixture', kind: 'sharepointMirror', fetched, async fetchBytes(name) {
    fetched.push(name); assert.ok(bytes.has(name)); return new Uint8Array(bytes.get(name));
  }};
}

function syntheticMvgUelgApproval({catalog}) {
  const {socialObjectSha256} = require('../lib-commonjs/product/core/socialCatalog.js');
  for (const rule of catalog.federalRules.filter(rule => newRule(rule.ruleId))) rule.status = 'reviewed';
  for (const binding of catalog.cantonalBindings.filter(binding => newRule(binding.ruleId))) binding.status = 'reviewed';
  for (const eligibility of catalog.releaseEligibility.filter(item => newRule(item.ruleRef.ruleId))) {
    eligibility.ruleRef.sha256 = socialObjectSha256(catalog.federalRules.find(rule => rule.ruleId === eligibility.ruleRef.ruleId));
    eligibility.bindingRef.sha256 = socialObjectSha256(catalog.cantonalBindings.find(binding => binding.bindingId === eligibility.bindingRef.bindingId));
    eligibility.status = 'approved';
    eligibility.approval = {approvedBy: 'SYNTHETIC TEST FIXTURE ONLY', approvedOn: '2026-10-01', decisionRef: 'NO HUMAN APPROVAL OR DEPLOYMENT'};
  }
}

function compiledData(release) {
  return require('../lib-commonjs/product/core/index.js').createCalculationData(JSON.parse(JSON.stringify(release)));
}

function inputFor(catalog, binding, trigger = '2026-09-16', days = 10) {
  const rule = catalog.federalRules.find(item => item.ruleId === binding.ruleId), route = binding.contextRoutes[0];
  return {
    ruleId: rule.ruleId, bindingId: binding.bindingId, contextRouteId: route.contextRouteId,
    procedureContextCanton: 'BE', caseFacts: Object.fromEntries(route.requiredFacts.map(fact => [fact.factKey, fact.allowedValues[0]])),
    qualificationBasis: 'displayed-model-scope', matter: rule.matter, triggerKind: rule.triggerKind,
    notificationChannel: 'individual-service', notificationConfirmed: false, legalTriggerDate: trigger,
    ...([...rule.normBindings, ...binding.normBindings].some(norm => norm.temporalSelector === 'jurisdictionReferenceDate') ? {jurisdictionReferenceDate: trigger} : {}),
    ...(rule.calculation.durationInputId ? {days} : {}),
    holidayResolution: {status: 'resolved', calendarBindingId: 'be-party', anchors: [{role: 'party', canton: 'BE', spatialScopeId: 'BE'}]}
  };
}

test('AP20C3 actual packaged consumer rejects candidate before artifact fetch or cache activation', async t => {
  const runtime = loadPackagedHost(), fixture = provider();
  t.diagnostic(JSON.stringify(runtime.provenance));
  await assert.rejects(runtime.service.refresh(fixture), /candidate/);
  assert.deepEqual(fixture.fetched, ['manifest.json']);
  assert.equal(await runtime.store.getActive(), undefined);
});

test('AP20C3 actual bundle retains consumer 6/component 2 and all 50 candidate gates', async () => {
  const runtime = loadPackagedHost(), activation = await runtime.service.refresh(provider(true));
  runtime.host.applyActivationResult(activation);
  assert.equal(runtime.host.state.status, 'ready');
  assert.equal(runtime.host.state.calculationData.formatVersion, '6.0.0');
  const data = compiledData(activation.release), catalog = data.socialProcedureCatalogs.get('ch-social-procedures');
  assert.equal(catalog.formatVersion, '2.0.0');
  assert.equal(catalog.federalRules.length, 44); assert.equal(catalog.cantonalBindings.length, 50);
  assert.ok(catalog.releaseEligibility.every(item => item.status === 'candidate' && item.approval === null));
  const {calculateSocialDeadline} = require('../lib-commonjs/product/core/socialDeadline.js');
  const bindings = catalog.cantonalBindings.filter(binding => newRule(binding.ruleId));
  assert.equal(bindings.length, 8);
  for (const binding of bindings) assert.deepEqual(calculateSocialDeadline(inputFor(catalog, binding), data).blockReasonKeys, ['not-released'], binding.bindingId);
});

test('AP20C3 actual bundle transports C2 rule and binding objects without reinterpretation', async () => {
  const runtime = loadPackagedHost(), activation = await runtime.service.refresh(provider(true));
  const catalog = compiledData(activation.release).socialProcedureCatalogs.get('ch-social-procedures');
  const previous = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'data/candidates/2026-10-01-ap20c2/social-procedures/ch-social-procedures.json')));
  assert.deepEqual(catalog.federalRules.slice(0, 36), previous.federalRules);
  assert.deepEqual(catalog.cantonalBindings.slice(0, 42), previous.cantonalBindings);
});

test('AP20C3 emitted ES5 reproduces all 80 literal AP20B MVG/UELG dates with synthetic test approvals only', async () => {
  const runtime = loadPackagedHost(), activation = await runtime.service.refresh(provider(true, syntheticMvgUelgApproval));
  runtime.host.applyActivationResult(activation);
  assert.equal(runtime.host.state.status, 'ready');
  const data = compiledData(activation.release), catalog = data.socialProcedureCatalogs.get('ch-social-procedures');
  const {calculateSocialDeadline} = require('../lib-commonjs/product/core/socialDeadline.js');
  const bindings = catalog.cantonalBindings.filter(binding => newRule(binding.ruleId));
  const vectors = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'tests/golden/candidates/ap20b-social-dates.json'))).vectors;
  assert.equal(bindings.length, 8); assert.equal(vectors.length, 10);
  for (const binding of bindings) for (const vector of vectors) {
    const input = inputFor(catalog, binding, vector.trigger, vector.orderedDays), rule = catalog.federalRules.find(rule => rule.ruleId === binding.ruleId);
    const expected = rule.calculation.durationInputId ? vector.ordered : vector.fixed;
    const result = calculateSocialDeadline(input, data);
    assert.equal(result.outcome, 'calculated', `${binding.bindingId}/${vector.id}: ${result.blockReasonKeys}`);
    assert.equal(result.provisionalDeadline.date, expected[2]);
    assert.equal(result.finalDeadline.date, expected[3]);
    assert.equal(result.socialEvidence.bindingId, binding.bindingId);
    const suspension = result.trace.find(step => step.operation === 'applySuspension');
    assert.ok(suspension.reasonKeys.includes(expected[4] ? `skipped${expected[4]}CalendarDays` : 'noSuspensionPeriodEncountered'));
  }
});

test('AP20C3 emitted ES5 distinguishes MVG domicile product scope, UELG administration and ATSG court jurisdiction', async () => {
  const runtime = loadPackagedHost(), activation = await runtime.service.refresh(provider(true, syntheticMvgUelgApproval));
  const data = compiledData(activation.release), catalog = data.socialProcedureCatalogs.get('ch-social-procedures');
  const {calculateSocialDeadline} = require('../lib-commonjs/product/core/socialDeadline.js');
  for (const binding of catalog.cantonalBindings.filter(binding => newRule(binding.ruleId))) {
    const input = inputFor(catalog, binding), military = binding.ruleId.startsWith('CH-SOC-MVG-');
    const court = binding.bindingId.includes('-COURT-');
    const cantonFact = !military && !court ? 'uelgAdministrativeCanton' : 'partyDomicileCanton';
    const expectedOrigin = military ? 'militaryInsurer' : 'compensationOffice';
    const extraFact = !military && !court ? 'partyDomicileCanton' : 'uelgAdministrativeCanton';
    assert.equal(input.caseFacts[cantonFact], 'BE'); assert.equal(input.caseFacts.decisionOrigin, expectedOrigin);
    assert.equal(input.caseFacts[extraFact], undefined);
    assert.equal(binding.contextRoutes[0].kind, military && !court ? 'product-scope' : 'legal-jurisdiction');
    for (const key of Object.keys(input.caseFacts)) {
      const caseFacts = {...input.caseFacts}; delete caseFacts[key];
      assert.deepEqual(calculateSocialDeadline({...input, caseFacts}, data).blockReasonKeys, ['context-unresolved']);
    }
    for (const caseFacts of [
      {...input.caseFacts, [cantonFact]: 'ZH'},
      {...input.caseFacts, decisionOrigin: military ? 'compensationOffice' : 'militaryInsurer'},
      {...input.caseFacts, [extraFact]: 'BE'},
      {...input.caseFacts, jurisdictionSpecialCase: 'abroad'},
      {...input.caseFacts, jurisdictionSpecialCase: 'thirdParty'},
      {...input.caseFacts, competentBodyQualified: false}
    ]) assert.deepEqual(calculateSocialDeadline({...input, caseFacts}, data).blockReasonKeys, ['context-unresolved']);
    assert.equal(calculateSocialDeadline({...input, authoritySeat: {country: 'CH', canton: 'ZH'}}, data).outcome, 'calculated');
    assert.deepEqual(calculateSocialDeadline({...input, holidayResolution: {...input.holidayResolution, status: 'unknown'}}, data).blockReasonKeys, ['holiday-unresolved']);
    if (input.jurisdictionReferenceDate) {
      const {jurisdictionReferenceDate: _omitted, ...missingDate} = input;
      assert.deepEqual(calculateSocialDeadline(missingDate, data).blockReasonKeys, ['context-unresolved']);
      assert.deepEqual(calculateSocialDeadline({...input, caseFacts: {...input.caseFacts, courtCanton: 'ZH'}}, data).blockReasonKeys, ['context-unresolved']);
    }
  }
});

test('AP20C3 emitted ES5 enforces scoped triggers, exact days and the complete 2026–2027 date window', async () => {
  const runtime = loadPackagedHost(), activation = await runtime.service.refresh(provider(true, syntheticMvgUelgApproval));
  const data = compiledData(activation.release), catalog = data.socialProcedureCatalogs.get('ch-social-procedures');
  const {calculateSocialDeadline} = require('../lib-commonjs/product/core/socialDeadline.js');
  const blocked = (input, reason) => {
    const result = calculateSocialDeadline(input, data);
    assert.equal(result.outcome, 'blocked');
    assert.equal(result.finalDeadline, undefined);
    assert.deepEqual(result.blockReasonKeys, [reason]);
  };
  for (const binding of catalog.cantonalBindings.filter(binding => newRule(binding.ruleId))) {
    const input = inputFor(catalog, binding), rule = catalog.federalRules.find(item => item.ruleId === binding.ruleId);
    blocked({...input, legalTriggerDate: '2025-12-31'}, 'outside-case-coverage');
    blocked({...input, legalTriggerDate: '2028-01-01'}, 'outside-case-coverage');
    for (const key of ['procedureStartDate', 'jurisdictionReferenceDate']) {
      blocked({...input, [key]: '2025-12-31'}, 'source-gap');
      blocked({...input, [key]: 'not-a-date'}, 'input-contract-invalid');
    }
    if (input.jurisdictionReferenceDate) blocked({...input, jurisdictionReferenceDate: '2028-01-01'}, 'source-gap');
    else {
      assert.equal(calculateSocialDeadline({...input, procedureStartDate: '2026-01-01', jurisdictionReferenceDate: '2026-09-16'}, data).outcome, 'calculated');
      blocked({...input, jurisdictionReferenceDate: '2028-01-01'}, 'source-gap');
    }
    if (rule.action === 'complaint-correction') {
      blocked({...input, jurisdictionReferenceDate: '2026-09-17'}, 'context-unresolved');
      for (const triggerKind of ['court-general-day-order', 'reply-order-days', 'cost-advance-order']) blocked({...input, triggerKind}, 'wrong-trigger');
    }
    if (rule.calculation.durationInputId) {
      const {days: _omitted, ...missingDays} = input;
      blocked(missingDays, 'unsupported-procedure');
      for (const days of [0, -1, 1.5, 366]) blocked({...input, days}, 'unsupported-procedure');
      blocked({...inputFor(catalog, binding, '2027-12-17', 1)}, 'outside-calculation-coverage');
    } else {
      blocked({...input, days: 30}, 'unsupported-procedure');
      blocked({...inputFor(catalog, binding, '2027-11-18')}, 'outside-calculation-coverage');
    }
    if (rule.action === 'appeal') blocked({...input, triggerKind: 'initial-benefit-disposition'}, 'wrong-trigger');
    if (rule.law === 'mvg') {
      for (const matter of ['mvg-medical-tariffs', 'mvg-generic-preliminary-notice']) blocked({...input, matter}, 'wrong-matter');
      if (rule.action === 'ordered-administrative-days') blocked({...input, triggerKind: 'preliminary-notice'}, 'wrong-trigger');
    } else for (const matter of ['uelg-material-claim-period', 'uelg-authority-processing-period']) blocked({...input, matter}, 'wrong-matter');
    blocked({...input, holidayResolution: {...input.holidayResolution, anchors: [{role: 'party', canton: 'ZH', spatialScopeId: 'ZH'}]}}, 'holiday-unresolved');
  }
});

for (const [name, mutate] of [
  ['social component 1 descriptor in manifest 6', ({catalog, descriptor}) => {
    descriptor.schemaId = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/social-procedure-catalog.schema.json';
    catalog.$schema = descriptor.schemaId; catalog.formatVersion = '1.0.0';
  }],
  ['minimum consumer 5 in manifest 6', ({manifest}) => {manifest.compatibility.minimumConsumerFormatVersion = '5.0.0';}]
]) test(`AP20C3 actual package rejects ${name} without activating anything`, async () => {
  const runtime = loadPackagedHost();
  await assert.rejects(runtime.service.refresh(provider(true, mutate)), /JSON-Schema/);
  assert.equal(await runtime.store.getActive(), undefined);
});

test('AP20C3 actual package preserves its validated cache after a MVG object is changed', async () => {
  const runtime = loadPackagedHost(), valid = await runtime.service.refresh(provider(true));
  const failed = await runtime.service.refresh(provider(true, ({catalog}) => {
    catalog.cantonalBindings.find(binding => binding.bindingId === 'BE-SOC-MVG-COURT-APP').labels.de += ' tampered';
  }));
  assert.equal(failed.mode, 'fallback');
  assert.equal(failed.release.manifestSha256, valid.release.manifestSha256);
  assert.match(failed.warning, /hash mismatch/);
});
