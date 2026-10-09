// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import catalogSchema from '../../schemas/implementation/ap22c1/holiday-catalog-v2.schema.json';
import calendarSchema from '../../schemas/implementation/ap22c1/calendar-rules-v3.schema.json';
import common from '../../schemas/common.schema.json';
import contract from '../golden/candidates/ap22b-holiday-contract.json';
import legacy from '../../data/releases/2026-10-01-mvp-06-approved.1/calendars/be-public-holidays.json';
import social from '../../data/releases/2026-10-01-mvp-06-approved.1/social-procedures/ch-social-procedures.json';
import { assertSchema, assertSchemaContract } from '../../src/core/schemaContract';
import { rawSha256Text, assertSocialProcedureCatalog, socialObjectSha256 } from '../../src/core/socialCatalog';
import { rebindSocialCalendarCandidate } from '../../src/core/calendarMigration';

test('AP22C1 complete bound schema evaluates the frozen catalog including conditional release approval', () => {
  assert.doesNotThrow(() => assertSchema(contract, catalogSchema));
  const v: any = structuredClone(contract);
  v.activation.contractDecision.status = 'approved';
  assert.throws(() => assertSchema(v, catalogSchema));
  v.activation.contractDecision.on = '2026-10-08';
  assert.doesNotThrow(() => assertSchema(v, catalogSchema));
  v.activation.releaseEligibility.status = 'approved';
  assert.throws(() => assertSchema(v, catalogSchema));
});
test('AP22C1 schema validator rejects ignored keywords even inside unused branches', () => {
  assert.throws(() => assertSchemaContract({oneOf: [{type:'null'}, {unevaluatedProperties:false}]}));
  assert.throws(() => assertSchema(null, {type:'null', format:'email'}));
  assert.throws(() => assertSchema([], {type:'array', uniqueItems:true, items:true, contains:{const:1}}));
  assert.throws(() => assertSchema([1,1], {type:'array', uniqueItems:true}));
  assert.throws(() => assertSchema([1,1], {contains:{const:1}, maxContains:1}));
  assert.doesNotThrow(() => assertSchema('ok', {if:false, then:false, else:{const:'ok'}}));
  assert.throws(() => assertSchema('bad', {if:false, then:true, else:{const:'ok'}}));
  assert.throws(() => assertSchema('ok', {not:true}));
  assert.throws(() => assertSchema({}, {$ref:'https://example.test/missing'}));
  assert.throws(() => assertSchema({}, {anyOf:[true, {$ref:'#/missing'}]}));
  assert.throws(() => assertSchema({}, {not:{$ref:'#/missing'}}));
});
test('AP22C1 calendar schema enforces conditions, supplemental effects and inheritance metadata', () => {
  const v: any = {...structuredClone(legacy), $schema:calendarSchema.$id, formatVersion:'3.0.0', projection:null};
  const registry = new Map([[common.$id, common]]);
  v.rules.forEach((r: any) => { r.condition = 'always'; });
  assert.doesNotThrow(() => assertSchema(v, calendarSchema, registry));
  v.rules[0].condition = 'onlyMonday';
  assert.throws(() => assertSchema(v, calendarSchema, registry));
  v.rules[0].calculation.day = 2;
  assert.doesNotThrow(() => assertSchema(v, calendarSchema, registry));
  v.rules[0].unexpected = true;
  assert.throws(() => assertSchema(v, calendarSchema, registry));
});
test('AP22C1 raw SHA hashes actual UTF8 bytes and canonical social hashing is preserved', () => {
  for (const value of ['', 'abc', 'Grüezi 🎄\n', 'a'.repeat(10000)]) {
    assert.equal(rawSha256Text(value), createHash('sha256').update(value).digest('hex'));
  }
  assert.throws(() => rawSha256Text('\ud800'));
  assertSocialProcedureCatalog(social);
  for (const e of social.releaseEligibility) {
    assert.equal(e.ruleRef.sha256, socialObjectSha256(social.federalRules.find(r => r.ruleId === e.ruleRef.ruleId)));
  }
});
test('AP22C1 social migration preserves all 44/50 contents and 2026–2027 limits, drops every old approval', () => {
  assertSocialProcedureCatalog(social);
  const source = social;
  const refs = social.releaseEligibility[0]!.componentRefs.map(ref => ({...ref, sha256:'a'.repeat(64)}));
  const migrated = rebindSocialCalendarCandidate(social, '2026-10-08-ap22c1-candidate.1', refs);
  assert.deepEqual(migrated.federalRules, social.federalRules);
  assert.deepEqual(migrated.cantonalBindings, social.cantonalBindings);
  assert.equal(migrated.releaseEligibility.length, 50);
  migrated.releaseEligibility.forEach((e, i) => {
    assert.equal(e.status, 'candidate'); assert.equal(e.approval, null);
    assert.deepEqual(e.caseCoverage, social.releaseEligibility[i]!.caseCoverage);
    assert.deepEqual(e.ruleRef, social.releaseEligibility[i]!.ruleRef);
    assert.deepEqual(e.bindingRef, social.releaseEligibility[i]!.bindingRef);
    assert.deepEqual(e.componentRefs, refs);
  });
  assert.ok(social.releaseEligibility.every(e => e.status === 'approved'));
  assert.throws(() => rebindSocialCalendarCandidate(source, source.releaseEligibility[0]!.releaseId, refs));
  assert.throws(() => rebindSocialCalendarCandidate(source, '2026-10-08-ap22c1-candidate.1', refs.slice(1)));
});
