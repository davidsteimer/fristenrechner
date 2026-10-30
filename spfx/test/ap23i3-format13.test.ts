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
  changeSyntheticFormat13, AP23I3_ADMIN, administrativeInput13
} from '../../tests/core/ap23i3Fixtures';
import { approved, candidateRoot, clone, provider, validator, adminInput } from './ap23i3-fixture';

test('AP23I3 actual F3 candidate is rejected before artifact fetching and cannot activate a cache', async () => {
  const requested: string[] = [];
  const candidate = { ...provider(), async fetchBytes(path: string) {
    requested.push(path);
    return new Uint8Array(readFileSync(resolve(candidateRoot, path)));
  } };
  const store = new MemoryValidatedReleaseStore();
  await assert.rejects(new ReleaseService(store, validator).refresh(candidate), /Format-13-Manifest.*JSON-Schema/);
  assert.deepEqual(requested, ['manifest.json']);
  assert.equal(await store.getActive(getProviderCacheIdentity(candidate)), undefined);
  assert.equal(JSON.parse(readFileSync(resolve(candidateRoot, 'manifest.json'), 'utf8')).releaseStatus, 'candidate');
});

test('AP23I3 full synthetic Format13 passes original bytes through the SPFx factory without Format7 substitution', async () => {
  const release = await validator.validateProvider(provider());
  assert.equal(release.formatVersion, '13.0.0');
  assert.equal(release.artifacts.length, 44);
  assert.equal(release.calendarIds.length, 35);
  assert.equal(release.profileIds.length, 5);
  assert.deepEqual(release.administrativeProcedureCatalogIds, ['ch-cantonal-administrative-procedures']);
  const runtime = createCalculatorRuntime(release);
  assert.equal(runtime.data.formatVersion, '13.0.0');
  assert.equal(runtime.data.releaseId, release.releaseId);
  assert.equal(runtime.calendarRuntime?.releaseId, release.releaseId);
  assert.ok(runtime.data.calendarRuleSets?.has('ap23h2-ow-procedural-core'));
  assert.ok(runtime.data.calendarRuleSets?.has('ap23h2-nw-procedural-core'));
  assert.ok(runtime.administrativeContext);
  const result = calculateAdministrativeDeadline(adminInput, runtime.administrativeContext);
  assert.equal(result.outcome, 'calculated');
  if (result.outcome !== 'calculated') throw new Error('Expected calculation');
  assert.equal(result.finalEnd, '2026-11-02');
  assert.equal(result.provenance.releaseId, release.releaseId);
  assert.equal(result.provenance.lawId, 'lpamm-ti');
  assert.equal(result.referenceOnly, false);
});

test('AP23I3 synthetic GitHub and SharePoint providers yield identical Format13 bytes under different identities', async () => {
  const github = await validator.validateProvider(provider());
  const mirror = await validator.validateProvider(provider(approved, 'sharepointMirror'));
  assert.equal(github.manifestSha256, mirror.manifestSha256);
  assert.deepEqual(github.artifacts.map(item => item.descriptor.sha256), mirror.artifacts.map(item => item.descriptor.sha256));
  assert.notEqual(getProviderCacheIdentity(provider()), getProviderCacheIdentity(provider(approved, 'sharepointMirror')));
});

test('AP23I3 malformed or escaping manifest paths fail before any artifact request', async () => {
  const changed = clone();
  changed.manifest.artifacts[0].path = '../outside.json';
  const requested: string[] = [];
  const transport = provider(changed);
  await assert.rejects(validator.validateProvider({ ...transport, async fetchBytes(path) {
    requested.push(path); return transport.fetchBytes(path);
  } }));
  assert.deepEqual(requested, ['manifest.json']);
});

test('AP23I3 missing administrative file blocks the complete release', async () => {
  await assert.rejects(validator.validateProvider(provider(approved, 'github', AP23I3_ADMIN)), /Missing synthetic artifact/);
});

test('AP23I3 changed UTF-8 bytes fail despite semantically identical JSON', async () => {
  const changed = clone();
  changed.files.set(AP23I3_ADMIN, `${changed.files.get(AP23I3_ADMIN)} `);
  await assert.rejects(validator.validateProvider(provider(changed)));
});

for (const [label, path, change] of [
  ['candidate administrative release', AP23I3_ADMIN, (value: any) => { value.releaseBinding.status = 'candidate'; value.releaseBinding.approval = null; }],
  ['one unapproved administrative path', AP23I3_ADMIN, (value: any) => { value.releaseBinding.pathEligibility[0].status = 'candidate'; }],
  ['wrong administrative component binding', AP23I3_ADMIN, (value: any) => { value.releaseBinding.targetComponentRefs[0].sha256 = '0'.repeat(64); }],
  ['forged serialized runtime capability', AP23I3_ADMIN, (value: any) => { value.runtimeActive = true; }],
  ['unapproved social binding', 'social-procedures/ch-social-procedures.json', (value: any) => { value.releaseEligibility[0].status = 'candidate'; value.releaseEligibility[0].approval = null; }]
] as const) {
  test(`AP23I3 manifest approval cannot replace ${label}`, async () => {
    const changed = clone();
    changeSyntheticFormat13(changed, path, change);
    const store = new MemoryValidatedReleaseStore();
    const transport = provider(changed);
    await assert.rejects(new ReleaseService(store, validator).refresh(transport));
    assert.equal(await store.getActive(getProviderCacheIdentity(transport)), undefined);
  });
}

test('AP23I3 SPFx factory carries every GL/TG current alternative and actual statutory duration',async()=>{
  const release=await validator.validateProvider(provider()),runtime=createCalculatorRuntime(release);
  const catalog=runtime.administrativeContext!.administrativeCatalog;
  const paths=catalog.paths.filter((path:any)=>path.contractFamily==='qualifiedDayProcedureV6');assert.equal(paths.length,34);
  for(const path of paths){
    const days=path.duration.kind==='statutoryDays'?path.duration.value:path.duration.kind==='concretisedStatutoryDays'?7:10;
    const input=administrativeInput13(catalog,path.pathId,'2026-10-02',days);
    const actual=calculateAdministrativeDeadline(input,runtime.administrativeContext!);
    assert.equal(actual.outcome,'calculated',path.pathId);
    if(actual.outcome==='calculated')assert.equal(actual.finalEnd,({5:'2026-10-07',7:'2026-10-09',10:'2026-10-12',30:'2026-11-02'} as Record<number,string>)[days]);
  }
});

test('AP23I3 SPFx source-bound cache keeps13 separate from old12 and foreign13 configuration',async()=>{
  const service=new ReleaseService(new MemoryValidatedReleaseStore(),validator),source=provider();await service.refresh(source);
  const offline=(p:any)=>({...p,async fetchBytes(){throw Error('AP23I3 OFFLINE');}});
  assert.equal((await service.refresh(offline(source))).mode,'fallback');
  const foreign={...provider(),cacheConfiguration:{kind:'github' as const,baseUrl:'https://raw.githubusercontent.com/example/project/'+'1'.repeat(40)+'/format12'}};
  await assert.rejects(service.refresh(offline(foreign)),/AP23I3 OFFLINE/);
});
