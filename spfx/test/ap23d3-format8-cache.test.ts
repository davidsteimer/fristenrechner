// SPDX-License-Identifier: AGPL-3.0-only
// Separated from provider validation so each complete test file stays below
// the unchanged 60-second harness limit under concurrent regression load.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { IDBFactory } from 'fake-indexeddb';
import { getProviderCacheIdentity } from '../src/core/cacheIdentity';
import { ReleaseService } from '../src/core/ReleaseService';
import { IndexedDbValidatedReleaseStore } from '../src/core/ValidatedReleaseStore';
import { createCalculatorRuntime } from '../src/product/core';
import { calculateAdministrativeDeadline } from '../src/product/core/administrativeDeadline';
import type { IReleaseProvider, IValidatedRelease } from '../src/core/types';
import { approved, repository, provider, validator, adminInput, offline, indexedStore } from './ap23d3-fixture';

test('AP23D3 IndexedDB fallback rebuilds Format8 only from the same configuration original bytes', async () => {
  const factory = new IDBFactory();
  const transport = provider(approved, 'sharepointMirror');
  const firstStore = new IndexedDbValidatedReleaseStore('persist-format8', factory);
  const first = await new ReleaseService(firstStore, validator).refresh(transport);
  const stored = (await firstStore.getActive(getProviderCacheIdentity(transport)))!;
  await firstStore.activate({ ...stored, releaseId: 'invented', administrativeProcedureCatalogIds: ['invented'],
    artifacts: stored.artifacts.map(item => ({ ...item, parsed: { runtimeActive: true, manipulated: true } })) }, getProviderCacheIdentity(transport));
  const service = new ReleaseService(new IndexedDbValidatedReleaseStore('persist-format8', factory), validator);
  const restored = await service.refresh(offline(transport));
  assert.equal(restored.mode, 'fallback');
  assert.equal(restored.release.manifestSha256, first.release.manifestSha256);
  assert.equal(restored.release.releaseId, first.release.releaseId);
  assert.deepEqual(restored.release.administrativeProcedureCatalogIds, ['ch-cantonal-administrative-procedures']);
  assert.ok(restored.release.artifacts.every(item => !(item.parsed as Record<string, unknown>).manipulated));
  const runtime = createCalculatorRuntime(restored.release);
  assert.equal(calculateAdministrativeDeadline(adminInput, runtime.administrativeContext).outcome, 'calculated');
});

for (const [label, corrupt] of [
  ['changed administrative bytes', (value: any) => { value.artifacts.find((item: any) => item.descriptor.role === 'administrativeProcedureCatalog').bytes[100] ^= 1; }],
  ['missing administrative bytes', (value: any) => { value.artifacts = value.artifacts.filter((item: any) => item.descriptor.role !== 'administrativeProcedureCatalog'); }],
  ['changed manifest bytes', (value: any) => { value.manifestBytes[100] ^= 1; }]
] as const) {
  test(`AP23D3 cached ${label} never revives a TI or GR calculation`, async () => {
    const store = indexedStore();
    const service = new ReleaseService(store, validator);
    const transport = provider();
    await service.refresh(transport);
    const cached = (await store.getActive(getProviderCacheIdentity(transport)))!;
    corrupt(cached);
    await store.activate(cached, getProviderCacheIdentity(transport));
    await assert.rejects(service.refresh(offline(transport)), /Cache ist nicht verwendbar/);
    await assert.rejects(service.getActive(transport));
  });
}

test('AP23D3 missing new mirror cannot fall back to another Format8 mirror or an unbound AP5 cache', async () => {
  const store = indexedStore();
  const service = new ReleaseService(store, validator);
  const initial = provider(approved, 'sharepointMirror');
  await service.refresh(initial);
  const ap5: IReleaseProvider = { ...provider(), async fetchBytes(path) {
    return new Uint8Array(readFileSync(resolve(repository, 'data/releases/2026-08-29-ap5-approved.1', path)));
  } };
  const historical = await validator.validateProvider(ap5);
  await store.activate(historical);
  const moved: IReleaseProvider = { ...initial, cacheConfiguration: {
    kind: 'sharepointMirror', siteAbsoluteUrl: 'https://tenant.example/sites/E', mirrorPath: '/sites/E/Shared Documents/another-format8'
  } };
  await assert.rejects(service.refresh(offline(moved)), /Synthetic offline/);
  assert.equal(await service.getActive(moved), undefined);
  assert.equal(createCalculatorRuntime(historical).data.releaseId, '2026-08-29-ap5-approved.1');
  assert.equal(createCalculatorRuntime(historical).administrativeContext, undefined);
});

test('AP23D3 same release name at a different immutable GitHub pin has no Format8 fallback', async () => {
  const service = new ReleaseService(indexedStore(), validator);
  const original = provider();
  await service.refresh(original);
  const next: IReleaseProvider = { ...original, cacheConfiguration: {
    kind: 'github', baseUrl: `https://raw.githubusercontent.com/example/project/${'2'.repeat(40)}/format8`
  } };
  await assert.rejects(service.refresh(offline(next)), /Synthetic offline/);
  assert.equal(await service.getActive(next), undefined);
});

test('AP23D3 transport metadata cannot invent an administrative catalog after full byte validation', async () => {
  const original = await validator.validateProvider(provider());
  const altered: IValidatedRelease = { ...original, administrativeProcedureCatalogIds: ['invented'] };
  assert.throws(() => createCalculatorRuntime(altered));
});
