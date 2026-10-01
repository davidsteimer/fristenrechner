// SPDX-License-Identifier: AGPL-3.0-only
// Test-only AP20B contract probe. No product imports and no runtime approval.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {civilDay, civilDate, verifyCalendarBasis} from './check-ap19b-references.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
export const contractPath = 'tests/golden/candidates/ap20b-social-contract.json';
export const datesPath = 'tests/golden/candidates/ap20b-social-dates.json';
export const contract = JSON.parse(await readFile(resolve(root, contractPath), 'utf8'));
export const dates = JSON.parse(await readFile(resolve(root, datesPath), 'utf8'));
const frozenContract = structuredClone(contract);
const calendarBytes = await readFile(resolve(root, contract.calendarReference));
assert.equal(createHash('sha256').update(calendarBytes).digest('hex'), contract.calendarReferenceSha256);
const prior = JSON.parse(calendarBytes);
const calendar = prior.calendarFixture;
const actions = {
  OBJ: {stage: 'administration', document: 'initial-benefit-disposition', fixed: true},
  APP: {stage: 'cantonal-insurance-court', document: 'objection-decision', fixed: true},
  ADM: {stage: 'administration', document: 'authority-day-order', fixed: false},
  CORRECTION: {stage: 'cantonal-insurance-court', document: 'court-correction-day-order', fixed: false}
};
const inputKeys = ['matter','stage','document','legalTriggerDate','jurisdictionReferenceDate','procedureStartDate','facts','notificationConfirmed','durationUnit','days','procedureContextCanton','holidayRole','holidayCanton','holidayStatus','spatialScopeId','authoritySeatCanton'];
const cantons = 'AG AI AR BE BL BS FR GE GL GR JU LU NE NW OW SG SH SO SZ TG TI UR VD VS ZG ZH'.split(' ');
function keys(value, expected) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value));
  assert.deepEqual(Object.keys(value).sort(), [...expected].sort());
}
export function validateContract(model = contract) {
  // B is a closed proposal, not a configurable runtime schema. Mutations are
  // rejected against the submitted file, while tests also pin its identities.
  assert.deepEqual(model, frozenContract);
  assert.equal(model.status, 'draft'); assert.equal(model.runtimeActive, false);
  assert.equal(model.approvedBy, null); assert.equal(model.legalTimeApproval, false);
  assert.deepEqual(model.proposedVersions, {socialProcedureCatalog:'2.0.0',releaseManifest:'6.0.0',minimumConsumer:'6.0.0'});
  assert.deepEqual(model.laws.map(law => law.law), ['EOG','FAMZG','FLG','MVG','UELG']);
  assert.equal(model.routes.length, 11);
  assert.deepEqual(model.referenceWindow, {from:'2026-01-01',to:'2027-12-31'});
  return model;
}
export const bindings = contract.routes.flatMap(route => route.actions.map(action => ({
  id: `BE-SOC-${route.id}-${action}`, ruleId: `CH-SOC-${route.law}-${action}`, route, action
})));
export function baseInput(bindingId, trigger = '2026-09-16', orderedDays = 10) {
  const binding = bindings.find(item => item.id === bindingId);
  assert.ok(binding, bindingId);
  const {route,action} = binding, law = contract.laws.find(item => item.law === route.law);
  return {
    matter:law.matter, stage:actions[action].stage, document:actions[action].document,
    legalTriggerDate:trigger, jurisdictionReferenceDate:route.dateSelector === 'jurisdictionReferenceDate' ? trigger : null,
    procedureStartDate:null,
    facts:{competentBodyQualified:true,decisionOrigin:law.origin,jurisdictionSpecialCase:'ordinary',...route.facts},
    notificationConfirmed:true,durationUnit:'days',days:actions[action].fixed ? 30 : orderedDays,
    procedureContextCanton:'BE',holidayRole:'party',holidayCanton:'BE',holidayStatus:'resolved',spatialScopeId:'BE',authoritySeatCanton:'ZH'
  };
}
const blocked = reason => ({qualification:'blocked',reason,arithmetic:null,runtimeActive:false,eligibility:'blocked-input'});
const inside = date => date >= contract.referenceWindow.from && date <= contract.referenceWindow.to;

export function evaluate(bindingId, input, model = contract) {
  try {validateContract(model); keys(input, inputKeys); keys(input.facts, Object.keys(baseInput(bindingId).facts));}
  catch {return blocked('reference-contract-invalid');}
  const {route,action} = bindings.find(item => item.id === bindingId);
  const law = contract.laws.find(item => item.law === route.law);
  const excluded = model.exclusions.find(item => item.law === route.law && item.matter === input.matter);
  if (excluded) return blocked(excluded.reason);
  if (input.matter !== law.matter) return blocked('subject-unqualified');
  if (input.stage !== actions[action].stage) return blocked('stage-unqualified');
  if (input.document !== actions[action].document) return blocked('document-unqualified');
  if (input.notificationConfirmed !== true) return blocked('trigger-unqualified');
  if (input.facts.competentBodyQualified !== true) return blocked('competence-unqualified');
  if (input.facts.decisionOrigin !== law.origin) return blocked('origin-unqualified');
  if (input.facts.jurisdictionSpecialCase !== 'ordinary') return blocked('unsupported-special-case');
  for (const [key,value] of Object.entries(route.facts)) if (input.facts[key] !== value) return blocked('jurisdiction-unbound');
  if (input.procedureContextCanton !== 'BE') return blocked('product-canton-unbound');
  if (input.authoritySeatCanton !== null && !cantons.includes(input.authoritySeatCanton)) return blocked('reference-contract-invalid');
  if (!['party','representative'].includes(input.holidayRole) || input.holidayStatus !== 'resolved') return blocked('holiday-anchor-unqualified');
  if (input.holidayCanton !== 'BE' || input.spatialScopeId !== 'BE') return blocked('holiday-scope-unbound');
  if (input.durationUnit !== 'days' || !Number.isInteger(input.days) || input.days < 1 || input.days > 365) return blocked('duration-unqualified');
  if (actions[action].fixed && input.days !== 30) return blocked('fixed-duration-changed');
  if (civilDay(input.legalTriggerDate) === null) return blocked('date-invalid');
  if (!inside(input.legalTriggerDate)) return blocked('outside-reference-window');
  if (input.procedureStartDate !== null && (civilDay(input.procedureStartDate) === null || input.procedureStartDate > input.legalTriggerDate)) return blocked('procedure-date-invalid');
  if (input.procedureStartDate !== null && !inside(input.procedureStartDate)) return blocked('outside-reference-window');
  if (route.dateSelector === 'jurisdictionReferenceDate') {
    if (civilDay(input.jurisdictionReferenceDate) === null) return blocked('jurisdiction-date-required');
    if (!inside(input.jurisdictionReferenceDate)) return blocked('jurisdiction-date-uncovered');
    if (action === 'CORRECTION' && input.jurisdictionReferenceDate > input.legalTriggerDate) return blocked('jurisdiction-date-after-correction');
  } else if (input.jurisdictionReferenceDate !== null) return blocked('unexpected-jurisdiction-date');
  const arithmetic = enumerate(input.legalTriggerDate,input.days);
  if (arithmetic === null) return blocked('result-outside-reference-window');
  return {qualification:'qualified-reference',reason:null,arithmetic,runtimeActive:false,eligibility:'candidate-not-approved'};
}

// Independent day-by-day test oracle. Expected dates are literal fixture data.
export function enumerate(trigger, days) {
  const start = civilDay(trigger) + 1;
  let cursor = start, count = 0, pauses = 0, first = null;
  const paused = day => calendar.suspensionIntervals.some(([from,to]) => day >= civilDay(from) && day <= civilDay(to));
  const nonWorking = day => [0,6].includes(new Date(day * 86400000).getUTCDay()) || calendar.holidayDates.includes(civilDate(day));
  while (count < days) {
    if (!inside(civilDate(cursor))) return null;
    if (paused(cursor)) pauses++;
    else {count++; first ??= cursor;}
    if (count < days) cursor++;
  }
  const nominal = cursor;
  while (nonWorking(cursor)) {cursor++; if (!inside(civilDate(cursor))) return null;}
  return [civilDate(start),civilDate(first),civilDate(nominal),civilDate(cursor),pauses,cursor - nominal];
}
export function runDateReferences(vectors = dates) {
  validateContract();
  keys(vectors, ['formatVersion','status','runtimeActive','vectors']);
  assert.equal(vectors.formatVersion,'ap20b-date-vectors-1'); assert.equal(vectors.status,'draft'); assert.equal(vectors.runtimeActive,false);
  assert.equal(vectors.vectors.length,10); assert.equal(new Set(vectors.vectors.map(row=>row.id)).size,10);
  let cases = 0;
  for (const vector of vectors.vectors) {
    keys(vector,['id','trigger','orderedDays','fixed','ordered']);
    for (const binding of bindings) {
      const result = evaluate(binding.id,baseInput(binding.id,vector.trigger,vector.orderedDays));
      assert.equal(result.qualification,'qualified-reference',`${binding.id}/${vector.id}`);
      assert.deepEqual(result.arithmetic,vector[actions[binding.action].fixed ? 'fixed' : 'ordered'],`${binding.id}/${vector.id}`);
      assert.equal(result.eligibility,'candidate-not-approved'); cases++;
    }
  }
  return {nationalRules:new Set(bindings.map(item=>item.ruleId)).size,bernBindings:bindings.length,dateCases:cases,runtimeActive:false};
}
export async function verifyPreserved() {
  for (const item of contract.preserved) assert.equal(createHash('sha256').update(await readFile(resolve(root,item.path))).digest('hex'),item.sha256,item.path);
  return {ap20aFiles:contract.preserved.length,calendarFiles:await verifyCalendarBasis(prior)};
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify({...runDateReferences(),preserved:await verifyPreserved()}));
}
