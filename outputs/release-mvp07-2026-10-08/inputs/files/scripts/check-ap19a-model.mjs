// SPDX-License-Identifier: AGPL-3.0-only
// Standalone architecture probe, never a product resolver or a legal calculation.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const candidatePath = 'tests/golden/candidates/ap19a-national-model.json';
const inputKeys = ['ruleId', 'bindingId', 'law', 'proceduralCanton', 'matter', 'action', 'stage', 'deadlineForm', 'legalTriggerDate', 'triggerKind', 'notificationChannel', 'holidayAnchorRole', 'holidayAnchorStatus', 'holidayCanton', 'holidayScopeId', 'regionalAreaId'];
const cantonCodes = new Set('AG AI AR BE BL BS FR GE GL GR JU LU NE NW OW SG SH SO SZ TG TI UR VD VS ZG ZH'.split(' '));
const approvals = ['federal-legal-review', 'cantonal-binding-review', 'calendar-projection-review', 'product-contract', 'reference-cases', 'release-approval'];
const probeCitations = new Map([
  ['ELG-1', 'Art. 1 ELG'], ['ATSG-2', 'Art. 2 ATSG'], ['ATSG-38', 'Art. 38 ATSG'],
  ['ATSG-52', 'Art. 52 ATSG'], ['ATSG-56', 'Art. 56 ATSG'], ['ATSG-60', 'Art. 60 ATSG']
]);

function exact(value, keys, path, partial = false) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), `${path}: object required`);
  assert.ok(Object.keys(value).every(key => keys.includes(key)), `${path}: unknown field`);
  if (!partial) assert.deepEqual(Object.keys(value).sort(), [...keys].sort(), `${path}: missing field`);
}
function text(value, path) { assert.ok(typeof value === 'string' && value.trim().length > 0, `${path}: nonempty text required`); }
function unique(items, path) { assert.ok(Array.isArray(items) && new Set(items).size === items.length, `${path}: duplicate or invalid array`); }
function list(items, path) { unique(items, path); assert.ok(items.length > 0, `${path}: empty array`); }
function isoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

/** Strict, deliberately small AP19A fixture contract, NOT a new product format. */
export function validateModel(model) {
  exact(model, ['kind', 'status', 'productFormatVersion', 'runtimeActive', 'legalApproval', 'scope', 'modelTestWindow', 'sources', 'federalRules', 'cantonalBindings', 'releaseEligibility', 'referenceInput', 'referenceCases'], 'model');
  assert.equal(model.kind, 'ap19a-architecture-probe');
  assert.equal(model.status, 'draft');
  assert.equal(model.productFormatVersion, null);
  assert.equal(model.runtimeActive, false);
  assert.equal(model.legalApproval, false);
  text(model.scope, 'scope');
  exact(model.modelTestWindow, ['from', 'to'], 'modelTestWindow');
  assert.ok(isoDate(model.modelTestWindow.from) && isoDate(model.modelTestWindow.to) && model.modelTestWindow.from <= model.modelTestWindow.to, 'invalid model test window');
  assert.ok(Array.isArray(model.sources));
  list(model.sources.map(source => source.id), 'sources');
  for (const source of model.sources) {
    exact(source, ['id', 'citation', 'reviewStatus'], 'source');
    text(source.id, 'source.id'); text(source.citation, 'citation');
    assert.ok(probeCitations.has(source.id), 'source unknown to architecture probe');
    assert.equal(source.citation, probeCitations.get(source.id), 'citation contradicts source identifier');
    assert.equal(source.reviewStatus, 'not-approved');
  }
  const sourceIds = new Set(model.sources.map(source => source.id));
  assert.ok(Array.isArray(model.federalRules));
  list(model.federalRules.map(rule => rule.id), 'federalRules');
  for (const rule of model.federalRules) {
    exact(rule, ['id', 'law', 'matter', 'action', 'stage', 'deadlineForm', 'triggerKind', 'notificationChannels', 'holidayAnchor', 'calculationParameters', 'sourceRefs', 'reviewStatus'], 'federalRule');
    assert.match(rule.id, /^CH-SOC-ELG-(OBJ|APP)$/);
    assert.equal(rule.law, 'ELG');
    assert.equal(rule.matter, 'individual-benefits');
    const objection = rule.id.endsWith('-OBJ');
    assert.equal(rule.action, objection ? 'objection' : 'appeal');
    assert.equal(rule.stage, objection ? 'administration' : 'cantonal-insurance-court');
    assert.equal(rule.triggerKind, objection ? 'individual-decision' : 'objection-decision');
    assert.equal(rule.deadlineForm, 'days');
    assert.deepEqual(rule.notificationChannels, ['individual-service']);
    assert.equal(rule.holidayAnchor, 'party-or-representative');
    assert.equal(rule.calculationParameters, null);
    assert.equal(rule.reviewStatus, 'not-approved');
    list(rule.sourceRefs, 'sourceRefs');
    assert.ok(rule.sourceRefs.every(id => sourceIds.has(id)), 'source reference unresolved');
    assert.deepEqual([...rule.sourceRefs].sort(), ['ELG-1', 'ATSG-2', 'ATSG-38', ...(objection ? ['ATSG-52'] : ['ATSG-56', 'ATSG-60'])].sort(), 'norm trail incomplete or changed');
  }
  const ruleIds = new Set(model.federalRules.map(rule => rule.id));
  assert.ok(Array.isArray(model.cantonalBindings));
  list(model.cantonalBindings.map(binding => binding.id), 'cantonalBindings');
  for (const binding of model.cantonalBindings) {
    exact(binding, ['id', 'ruleId', 'proceduralCanton', 'bindingKind', 'localProcedureReview', 'calendarProjectionReview', 'holidayScopes'], 'cantonalBinding');
    text(binding.id, 'binding.id');
    assert.ok(ruleIds.has(binding.ruleId), 'binding rule unresolved');
    assert.ok(cantonCodes.has(binding.proceduralCanton), 'invalid procedural canton');
    assert.equal(binding.bindingKind, binding.proceduralCanton === 'BE' ? 'first-release-draft' : 'synthetic-portability-fixture');
    assert.equal(binding.localProcedureReview, 'pending');
    assert.equal(binding.calendarProjectionReview, 'pending');
    assert.ok(Array.isArray(binding.holidayScopes));
    list(binding.holidayScopes.map(scope => `${scope.canton}/${scope.scopeId}`), 'holidayScopes');
    for (const scope of binding.holidayScopes) {
      exact(scope, ['canton', 'scopeId', 'regionalAreaRequired', 'regionalAreaIds'], 'holidayScope');
      assert.ok(cantonCodes.has(scope.canton), 'invalid holiday canton');
      text(scope.scopeId, 'scopeId');
      assert.equal(typeof scope.regionalAreaRequired, 'boolean');
      unique(scope.regionalAreaIds, 'regionalAreaIds');
      scope.regionalAreaIds.forEach(id => text(id, 'regionalAreaId'));
      assert.equal(scope.regionalAreaRequired, scope.regionalAreaIds.length > 0, 'inconsistent region requirement');
    }
  }
  const release = model.releaseEligibility;
  exact(release, ['plannedInitialCantons', 'approvedBindings', 'runtimeActive', 'calendarProjectionActivation', 'requiredApprovals'], 'releaseEligibility');
  assert.deepEqual(release.plannedInitialCantons, ['BE']);
  assert.deepEqual(release.approvedBindings, []);
  assert.equal(release.runtimeActive, false);
  assert.equal(release.calendarProjectionActivation, false);
  assert.deepEqual(release.requiredApprovals, approvals);
  exact(model.referenceInput, inputKeys, 'referenceInput');
  assert.ok(Array.isArray(model.referenceCases));
  list(model.referenceCases.map(item => item.id), 'referenceCases');
  for (const item of model.referenceCases) {
    exact(item, ['id', 'overrides', 'structure', 'reason', 'eligibility'], 'referenceCase');
    text(item.id, 'referenceCase.id');
    exact(item.overrides, inputKeys, 'overrides', true);
    assert.ok(['complete', 'blocked'].includes(item.structure));
    assert.ok(item.reason === null || typeof item.reason === 'string');
    assert.ok(['candidate-not-approved', 'outside-initial-release', 'blocked-input'].includes(item.eligibility));
  }
  return true;
}

/** Shape and linkage inspection only. Every return explicitly remains inactive. */
export function inspectModelCase(model, input) {
  const blocked = reason => ({ structure: 'blocked', reason, eligibility: 'blocked-input', runtimeActive: false });
  try { validateModel(model); } catch { return blocked('model-invalid'); }
  try { exact(input, inputKeys, 'input'); } catch { return blocked('input-contract-invalid'); }
  const rule = model.federalRules.find(item => item.id === input.ruleId);
  if (!rule) return blocked('rule-unavailable');
  if (input.law !== rule.law) return blocked('law-missing-or-mismatch');
  const binding = model.cantonalBindings.find(item => item.id === input.bindingId);
  if (!binding) return blocked('binding-unavailable');
  if (binding.ruleId !== rule.id || binding.proceduralCanton !== input.proceduralCanton) return blocked('binding-mismatch');
  if (['matter', 'action', 'stage', 'deadlineForm'].some(key => input[key] !== rule[key])) return blocked('selection-mismatch');
  if (!isoDate(input.legalTriggerDate)) return blocked('trigger-date-invalid');
  if (input.legalTriggerDate < model.modelTestWindow.from || input.legalTriggerDate > model.modelTestWindow.to) return blocked('outside-model-test-window');
  if (input.triggerKind !== rule.triggerKind) return blocked('trigger-mismatch');
  if (!rule.notificationChannels.includes(input.notificationChannel)) return blocked('notification-unqualified');
  if (!['party', 'representative'].includes(input.holidayAnchorRole) || input.holidayAnchorStatus !== 'qualified') return blocked('holiday-anchor-unqualified');
  const scope = binding.holidayScopes.find(item => item.canton === input.holidayCanton && item.scopeId === input.holidayScopeId);
  if (!scope) return blocked('holiday-scope-unbound');
  if (scope.regionalAreaRequired && !scope.regionalAreaIds.includes(input.regionalAreaId)) return blocked('regional-area-required-or-unknown');
  if (!scope.regionalAreaRequired && input.regionalAreaId !== null) return blocked('unexpected-regional-area');
  return {
    structure: 'complete', reason: null,
    eligibility: model.releaseEligibility.plannedInitialCantons.includes(binding.proceduralCanton) ? 'candidate-not-approved' : 'outside-initial-release',
    runtimeActive: false
  };
}

export function runModelCases(model) {
  validateModel(model);
  for (const item of model.referenceCases) {
    assert.deepEqual(inspectModelCase(model, { ...model.referenceInput, ...item.overrides }), {
      structure: item.structure, reason: item.reason, eligibility: item.eligibility, runtimeActive: false
    }, item.id);
  }
  return { referenceCases: model.referenceCases.length, completeStructures: model.referenceCases.filter(item => item.structure === 'complete').length, runtimeActive: false, legalApproval: false, calculationPerformed: false };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const model = JSON.parse(await readFile(resolve(root, candidatePath), 'utf8'));
  console.log(JSON.stringify(runModelCases(model), null, 2));
}
