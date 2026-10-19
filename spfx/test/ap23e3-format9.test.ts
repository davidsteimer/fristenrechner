// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic approvals are exclusively in-memory test shapes, not releases.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

import { getProviderCacheIdentity } from '../src/core/cacheIdentity';
import { ReleaseService } from '../src/core/ReleaseService';
import { MemoryValidatedReleaseStore } from '../src/core/ValidatedReleaseStore';
import { createCalculatorRuntime } from '../src/product/core';
import { calculateAdministrativeDeadline } from '../src/product/core/administrativeDeadline';
import {
  changeSyntheticFormat9, AP23E3_ADMIN
} from '../../tests/core/ap23e3Fixtures';
import { approved, candidateRoot, clone, provider, validator, adminInput } from './ap23e3-fixture';

test('AP23E3 actual E3 candidate is rejected before artifact fetching and cannot activate a cache', async () => {
  const requested: string[] = [];
  const candidate = { ...provider(), async fetchBytes(path: string) {
    requested.push(path);
    return new Uint8Array(readFileSync(resolve(candidateRoot, path)));
  } };
  const store = new MemoryValidatedReleaseStore();
  await assert.rejects(new ReleaseService(store, validator).refresh(candidate), /Format-9-Manifest.*JSON-Schema/);
  assert.deepEqual(requested, ['manifest.json']);
  assert.equal(await store.getActive(getProviderCacheIdentity(candidate)), undefined);
  assert.equal(JSON.parse(readFileSync(resolve(candidateRoot, 'manifest.json'), 'utf8')).releaseStatus, 'candidate');
});

test('AP23E3 full synthetic Format9 passes original bytes through the SPFx factory without Format7 substitution', async () => {
  const release = await validator.validateProvider(provider());
  assert.equal(release.formatVersion, '9.0.0');
  assert.equal(release.artifacts.length, 41);
  assert.equal(release.calendarIds.length, 32);
  assert.equal(release.profileIds.length, 5);
  assert.deepEqual(release.administrativeProcedureCatalogIds, ['ch-cantonal-administrative-procedures']);
  const runtime = createCalculatorRuntime(release);
  assert.equal(runtime.data.formatVersion, '9.0.0');
  assert.equal(runtime.data.releaseId, release.releaseId);
  assert.equal(runtime.calendarRuntime?.releaseId, release.releaseId);
  assert.ok(runtime.administrativeContext);
  const result = calculateAdministrativeDeadline(adminInput, runtime.administrativeContext);
  assert.equal(result.outcome, 'calculated');
  if (result.outcome !== 'calculated') throw new Error('Expected calculation');
  assert.equal(result.finalEnd, '2026-11-02');
  assert.equal(result.provenance.releaseId, release.releaseId);
  assert.equal(result.provenance.lawId, 'lpamm-ti');
  assert.equal(result.referenceOnly, false);
});

test('AP23E3 synthetic GitHub and SharePoint providers yield identical Format9 bytes under different identities', async () => {
  const github = await validator.validateProvider(provider());
  const mirror = await validator.validateProvider(provider(approved, 'sharepointMirror'));
  assert.equal(github.manifestSha256, mirror.manifestSha256);
  assert.deepEqual(github.artifacts.map(item => item.descriptor.sha256), mirror.artifacts.map(item => item.descriptor.sha256));
  assert.notEqual(getProviderCacheIdentity(provider()), getProviderCacheIdentity(provider(approved, 'sharepointMirror')));
});

test('AP23E3 malformed or escaping manifest paths fail before any artifact request', async () => {
  const changed = clone();
  changed.manifest.artifacts[0].path = '../outside.json';
  const requested: string[] = [];
  const transport = provider(changed);
  await assert.rejects(validator.validateProvider({ ...transport, async fetchBytes(path) {
    requested.push(path); return transport.fetchBytes(path);
  } }));
  assert.deepEqual(requested, ['manifest.json']);
});

test('AP23E3 missing administrative file blocks the complete release', async () => {
  await assert.rejects(validator.validateProvider(provider(approved, 'github', AP23E3_ADMIN)), /Missing synthetic artifact/);
});

test('AP23E3 changed UTF-8 bytes fail despite semantically identical JSON', async () => {
  const changed = clone();
  changed.files.set(AP23E3_ADMIN, `${changed.files.get(AP23E3_ADMIN)} `);
  await assert.rejects(validator.validateProvider(provider(changed)));
});

for (const [label, path, change] of [
  ['candidate administrative release', AP23E3_ADMIN, (value: any) => { value.releaseBinding.status = 'candidate'; value.releaseBinding.approval = null; }],
  ['one unapproved administrative path', AP23E3_ADMIN, (value: any) => { value.releaseBinding.pathEligibility[0].status = 'candidate'; }],
  ['wrong administrative component binding', AP23E3_ADMIN, (value: any) => { value.releaseBinding.targetComponentRefs[0].sha256 = '0'.repeat(64); }],
  ['forged serialized runtime capability', AP23E3_ADMIN, (value: any) => { value.runtimeActive = true; }],
  ['unapproved social binding', 'social-procedures/ch-social-procedures.json', (value: any) => { value.releaseEligibility[0].status = 'candidate'; value.releaseEligibility[0].approval = null; }]
] as const) {
  test(`AP23E3 manifest approval cannot replace ${label}`, async () => {
    const changed = clone();
    changeSyntheticFormat9(changed, path, change);
    const store = new MemoryValidatedReleaseStore();
    const transport = provider(changed);
    await assert.rejects(new ReleaseService(store, validator).refresh(transport));
    assert.equal(await store.getActive(getProviderCacheIdentity(transport)), undefined);
  });
}


