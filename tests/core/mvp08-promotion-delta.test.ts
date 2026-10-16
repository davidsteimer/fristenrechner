// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { assertAllowedDelta, catalogPath, socialPath, administrativePath } from '../../scripts/promote-mvp08-release';
const fixture = () => new Map<string, string>([
  [catalogPath, JSON.stringify({ rules: [1,2], activation: { releaseEligibility: { status: 'candidate' }, retained: [1] } })],
  ['calendars/test.json', JSON.stringify({ rules: [1,2], projection: { sourceHash: 'old', id: 'unchanged' } })],
  [socialPath, JSON.stringify({ rules: [1,2], review: {}, releaseEligibility: Array.from({ length: 50 }, (_, id) => ({ id, ruleRef: { id }, status: 'candidate', releaseId: null })) })],
  [administrativePath, JSON.stringify({ runtimeActive: false, paths: [1,2], review: {}, releaseBinding: {
    pathEligibility: Array.from({ length: 12 }, (_, id) => ({ pathId: String(id), pathSha256: 'bound', status: 'candidate' })) } })],
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
test('all twelve administrative paths are retained', () => { assert.throws(() => assertAllowedDelta(...changed(administrativePath, d => d.releaseBinding.pathEligibility.pop()))); });
test('administrative path hashes cannot change', () => { assert.throws(() => assertAllowedDelta(...changed(administrativePath, d => d.releaseBinding.pathEligibility[0].pathSha256='other'))); });
test('runtimeActive remains false even in released data', () => { assert.throws(() => assertAllowedDelta(...changed(administrativePath, d => d.runtimeActive=true))); });
test('ordinary profile bytes remain identical, not merely equivalent JSON', () => { const before=fixture(), after=new Map(before); after.set('profiles/test.json','{ "unchanged": true }'); assert.throws(()=>assertAllowedDelta(before,after)); });
test('no extra runtime file may appear', () => { const before=fixture(), after=new Map(before); after.set('extra.json','{}'); assert.throws(()=>assertAllowedDelta(before,after)); });
