// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { assertAllowedDelta, catalogPath, socialPath, administrativePath } from '../../scripts/promote-mvp09-release';
const fixture = () => new Map<string, string>([
  [catalogPath, JSON.stringify({ rules: [1,2], activation: { releaseEligibility: { status: 'candidate' }, retained: [1] } })],
  ['calendars/test.json', JSON.stringify({ rules: [1,2], projection: { sourceHash: 'old', id: 'unchanged' } })],
  [socialPath, JSON.stringify({ rules: [1,2], review: {}, releaseEligibility: Array.from({ length: 50 }, (_, id) => ({ id, ruleRef: { id }, status: 'candidate', releaseId: null })) })],
  [administrativePath, JSON.stringify({ runtimeActive: false, paths: [1,2], holidayBindings: Array.from({ length: 5 }, (_, id) => ({ id, legalBinding: { unchanged: true }, physicalBaseline: { releaseId: 'candidate', calendarId: String(id), references: [{ contentId: String(id), path: String(id), sha256: 'old' }] } })), review: {}, releaseBinding: {
    pathEligibility: Array.from({ length: 25 }, (_, id) => ({ pathId: String(id), pathSha256: 'bound', status: 'candidate' })) } })],
  ['profiles/test.json', '{"unchanged":true}\n']
]);
const changed = (path: string, mutate: (value: any) => void) => { const before = fixture(), after = new Map(before); const value = JSON.parse(after.get(path)!); mutate(value); after.set(path, JSON.stringify(value)); return [before, after] as const; };
test('exact original state has no forbidden semantic delta', () => { const x = fixture(); assertAllowedDelta(x, new Map(x)); });
test('calendar source hash alone is rebindable', () => { assertAllowedDelta(...changed('calendars/test.json', d => d.projection.sourceHash='new')); });
test('calendar rule edits are rejected', () => { assert.throws(() => assertAllowedDelta(...changed('calendars/test.json', d => d.rules.push(3)))); });
test('catalog release envelope alone is rebindable', () => { assertAllowedDelta(...changed(catalogPath, d => d.activation.releaseEligibility={status:'approved'})); });
test('catalog source rules are immutable', () => { assert.throws(() => assertAllowedDelta(...changed(catalogPath, d => d.rules.push(3)))); });
test('social rule identity and scope cannot be rewritten', () => { assert.throws(() => assertAllowedDelta(...changed(socialPath, d => d.releaseEligibility[0].ruleRef.id='other'))); });
test('all fifty social eligibility rows are retained', () => { assert.throws(() => assertAllowedDelta(...changed(socialPath, d => d.releaseEligibility.pop()))); });
test('all twenty-five administrative paths are retained', () => { assert.throws(() => assertAllowedDelta(...changed(administrativePath, d => d.releaseBinding.pathEligibility.pop()))); });
test('administrative path hashes cannot change', () => { assert.throws(() => assertAllowedDelta(...changed(administrativePath, d => d.releaseBinding.pathEligibility[0].pathSha256='other'))); });
test('runtimeActive remains false even in released data', () => { assert.throws(() => assertAllowedDelta(...changed(administrativePath, d => d.runtimeActive=true))); });
test('ordinary profile bytes remain identical, not merely equivalent JSON', () => { const before=fixture(), after=new Map(before); after.set('profiles/test.json','{ "unchanged": true }'); assert.throws(()=>assertAllowedDelta(before,after)); });
test('no extra runtime file may appear', () => { const before=fixture(), after=new Map(before); after.set('extra.json','{}'); assert.throws(()=>assertAllowedDelta(before,after)); });

test('physical provenance hashes may change without changing legal binding', () => {
  assertAllowedDelta(...changed(administrativePath, d => { d.holidayBindings[0].physicalBaseline.releaseId='approved'; d.holidayBindings[0].physicalBaseline.references[0].sha256='new'; }));
});
test('the semantic holiday binding hash alone may be rebound', () => {
  assertAllowedDelta(...changed(administrativePath, d => d.releaseBinding.pathEligibility[0].holidayBindingSha256='new'));
});
test('physical calendar identity cannot change', () => {
  assert.throws(() => assertAllowedDelta(...changed(administrativePath, d => d.holidayBindings[0].physicalBaseline.calendarId='wrong')));
});
test('legal holiday basis cannot change', () => {
  assert.throws(() => assertAllowedDelta(...changed(administrativePath, d => d.holidayBindings[0].legalBinding.unchanged=false)));
});
test('qualification policy hash cannot change during promotion', () => {
  assert.throws(() => assertAllowedDelta(...changed(administrativePath, d => d.releaseBinding.pathEligibility[0].qualificationPolicySha256='changed')));
});

