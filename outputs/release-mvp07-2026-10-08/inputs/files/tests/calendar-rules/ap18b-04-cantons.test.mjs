// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {createBatch03Model} from '../../scripts/ap18b-03-cantons.mjs';
import {BATCH04_CANTONS,deriveBatch04Model,validateBatch04Model,V09_SHA256} from '../../scripts/ap18b-04-cantons.mjs';
// Semantic seed fixtures only. These tests do not prove the byte identity of
// the archived V0.9 workbook. That evidence belongs to the separate archive
// checks, while createBatch04Model retains its original strict SHA-256 gate.
const root=process.cwd(),base=await createBatch03Model(root),model=deriveBatch04Model(base);

test('AP18B-04 preserves all 192 accepted-reference rules and all metadata prefixes',()=>{
  assert.equal(base.rules.length,192);
  for(const k of ['rules','scopes','sources','mappings','reviews','assignments','areaSourceEvidence'])
    assert.deepEqual(model[k].slice(0,base[k].length),base[k],k);
});
test('the remaining eighteen cantons complete jurisdictional capture, not legal completeness',()=>{
  assert.equal(BATCH04_CANTONS.length,18);
  assert.deepEqual(new Set(model.rules.map(r=>r.jurisdiction)),new Set(model.jurisdictions.map(r=>r[0])));
  assert.equal(model.batch04Boundary.completeDateCoverage,false);
  assert.equal(model.batch04Boundary.productExport,false);
  assert.equal(model.batch04Boundary.legalApproval,false);
  assert.equal(model.contractVersion,'0.5.0');
});
test('acceptance and SO half-day decision are provenance, not retroactive seed mutations',()=>{
  assert.equal(model.referenceAcceptance.sourceSha256,V09_SHA256);
  assert.equal(model.referenceAcceptance.solothurnMay1HalfDayDeadlineEffect,'none');
  assert.equal(model.batch03Boundary.soPartialDayDeadlineEffect,'open');
  assert.equal(model.referenceAcceptance.productActivation,false);
});
test('each unresolved case is visible through a worksheet-bound note with linked sources',()=>{
  assert.ok(model.pendingCases.length>=4);
  for(const p of model.pendingCases) {
    assert.ok(model.mappings.concat(model.reviews).some(r=>r.some(v=>typeof v==='string'&&v.includes(p.id))),p.id);
    assert.ok(p.sourceIds.every(id=>model.sources.some(s=>s[0]===id)),p.id);
  }
});
for(const [label,change] of [
  ['old rule modified',m=>{m.rules[0].de='Replacement';}],
  ['source removed',m=>{m.sources.pop();}],
  ['new rule approved',m=>{m.rules[192].status='approved';}],
  ['new scope removed',m=>{m.scopes.pop();}],
  ['pending case hidden',m=>{m.pendingCases=[];}],
  ['complete-calendar claim',m=>{m.batch04Boundary.completeDateCoverage=true;}],
  ['SO decision lost',m=>{m.referenceAcceptance.solothurnMay1HalfDayDeadlineEffect='open';}],
  ['new product format',m=>{m.contractVersion='0.6.0';}]
])test(`AP18B-04 validator rejects ${label}`,()=>{
  const copy=structuredClone(model);change(copy);assert.throws(()=>validateBatch04Model(copy,base));
});
