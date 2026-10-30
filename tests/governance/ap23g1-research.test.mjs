// SPDX-License-Identifier: AGPL-3.0-only
// Research checker tests, not assertions about effective application blocking.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { evaluate, runReferences } from '../../scripts/check-ap23g1-references.mjs';
const suite = JSON.parse(await readFile(new URL('../../docs/fachrecht/ap23g1/referenzfaelle.json', import.meta.url)));
const item = (path, facts = {}) => ({ path: path.id, trigger: '2026-10-02', days: path.days ?? 10, facts });
test('Independent research expectations have no discrepancy and no operational status', async () => {
  const { report } = await runReferences();
  assert.equal(report.referenceCases, 115);
  assert.equal(report.paths, 16);
  assert.deepEqual(report.discrepancies, []);
  for (const k of ['runtimeActive', 'productTest', 'exportTest', 'legalApproval']) assert.equal(report[k], false);
});
for (const p of suite.paths) test(`Qualified research path ${p.id}`, () => {
  assert.equal(evaluate(item(p), suite).outcome, 'datedResearchValue');
});
for (const p of suite.paths.filter(p => p.stage === 'court')) test(`Do not transfer ${p.id} to another court`, () => {
  assert.ok(p.requiredCourt);
  assert.equal(evaluate(item(p, { targetCourt: 'unknownOtherCourt' }), suite).reason, 'targetCourtNotQualified');
  const collision = suite.cases.find(c => c.path === p.id && c.expected.outcome === 'unresolvedBoundaryProposed');
  assert.ok(collision);
  assert.equal(Object.hasOwn(evaluate(collision, suite), 'end'), false);
});
for (const id of ['SO-ADMIN-REASONS-10', 'SH-ADMIN-REASONS-10']) test(`Explicit reasons offer required ${id}`, () => {
  const p = suite.paths.find(p => p.id === id);
  assert.match(p.opening, /WithExpressReasonsOffer$/);
  assert.equal(evaluate(item(p, { opening: 'lawfullyUnreasonedAdministrativeDecision' }), suite).reason, 'openingNotQualified');
});
for (const p of suite.paths.filter(p => p.opening === 'completeReasonedAdministrativeDecision')) test(`Timely prior request for second opening ${p.id}`, () => {
  assert.equal(evaluate(item(p, { openingOrigin: 'reasonedFollowingRequest', priorReasonsRequest: 'timelyEstablished' }), suite).outcome, 'datedResearchValue');
  for (const priorReasonsRequest of ['late', 'unknown', 'notApplicable']) {
    const r = evaluate(item(p, { openingOrigin: 'reasonedFollowingRequest', priorReasonsRequest }), suite);
    assert.equal(r.reason, 'priorReasonsRequestNotEstablished');
    assert.equal(Object.hasOwn(r, 'end'), false);
  }
});
test('SH court reasons go to the same issuing Obergericht', () => {
  const p = suite.paths.find(p => p.id === 'SH-COURT-REASONS-30');
  assert.equal(evaluate(item(p, { sameIssuingCourt: false }), suite).reason, 'courtReasonsWrongRecipient');
});
test('UR coordination boundary applies to appeal duration, not every procedural day order', () => {
  const appeal = suite.paths.find(p => p.id === 'UR-ADMIN-20');
  const ordered = suite.paths.find(p => p.id === 'UR-ADMIN-ORDERED');
  assert.equal(evaluate(item(appeal, { coordinatedDecision: true }), suite).reason, 'urCoordinatedLongestPeriodNotQualified');
  assert.equal(evaluate(item(ordered, { coordinatedDecision: true }), suite).outcome, 'datedResearchValue');
});
test('UR actual opening in Art22 time produces warning, no administrative vacation', () => {
  const r = evaluate({ path: 'UR-ADMIN-20', trigger: '2026-12-23', days: 20 }, suite);
  assert.equal(r.end, '2027-01-12');
  assert.equal(r.skippedDays, 0);
  assert.deepEqual(r.warnings, ['UR-ART22']);
});
test('Research window is full-run rather than receipt-only', () => {
  const r = evaluate({ path: 'SH-ADMIN-ORDERED', trigger: '2027-12-31', days: 1 }, suite);
  assert.equal(r.outcome, 'researchWindowBoundary');
  assert.equal(Object.hasOwn(r, 'end'), false);
});
