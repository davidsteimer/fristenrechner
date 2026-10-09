// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { IDBFactory } from 'fake-indexeddb';

import { getProviderCacheIdentity, type ProviderCacheConfiguration } from '../src/core/cacheIdentity';
import { ReleaseService } from '../src/core/ReleaseService';
import { ReleaseValidator } from '../src/core/ReleaseValidator';
import { IndexedDbValidatedReleaseStore, MemoryValidatedReleaseStore } from '../src/core/ValidatedReleaseStore';
import type { IReleaseProvider, IValidatedRelease } from '../src/core/types';

const pin = '0123456789abcdef0123456789abcdef01234567';
const github: ProviderCacheConfiguration = {
  kind: 'github', baseUrl: `https://raw.githubusercontent.com/example/project/${pin}/data/releases/mvp06`
};
const mirror: ProviderCacheConfiguration = {
  kind: 'sharepointMirror', siteAbsoluteUrl: 'https://tenant.sharepoint.com/sites/E',
  mirrorPath: '/sites/E/Shared Documents/releases/mvp06'
};
// Small approved format-2 bytes isolate cache mechanics. The separate final
// cases exercise complete persisted-byte validation for every historic format.
const releaseRoot = resolve(process.cwd(), '../data/releases/2026-08-31-mvp-02-approved.1');

function fixture(configuration: ProviderCacheConfiguration = github, root = releaseRoot): IReleaseProvider {
  return {
    id: 'same-display-name', kind: configuration.kind, cacheConfiguration: configuration,
    async fetchBytes(path) { return new Uint8Array(await readFile(resolve(root, path))); }
  };
}

function offline(provider: IReleaseProvider): IReleaseProvider {
  return { ...provider, async fetchBytes() { throw new Error('Offline: keine Netzverbindung'); } };
}

function indexedStore(): IndexedDbValidatedReleaseStore {
  return new IndexedDbValidatedReleaseStore('ap22c3-cache', new IDBFactory());
}

test('Cacheidentität normalisiert gleichwertige Konfiguration, nicht Provideranzeige oder Release-ID', () => {
  assert.equal(getProviderCacheIdentity(fixture(github)), getProviderCacheIdentity({
    ...fixture(github), id: 'anderer Anzeigename', cacheConfiguration: {
      kind: 'github', baseUrl: `  ${github.baseUrl}///  `
    }
  }));
  assert.equal(getProviderCacheIdentity(fixture(mirror)), getProviderCacheIdentity(fixture({
    kind: 'sharepointMirror', siteAbsoluteUrl: ' https://TENANT.sharepoint.com/sites/E/ ',
    mirrorPath: 'https://tenant.sharepoint.com/sites/E/Shared%20Documents/releases/mvp06/'
  })));
  assert.match(getProviderCacheIdentity(fixture(github)), /^provider-v1:[a-f0-9]{64}$/);
});

for (const [label, other] of Object.entries({
  'anderer GitHub-Commit': { kind: 'github', baseUrl: github.baseUrl.replace(pin, 'a'.repeat(40)) },
  'anderer GitHub-Ordner': { kind: 'github', baseUrl: `${github.baseUrl}-ap5` },
  'anderes GitHub-Repository': { kind: 'github', baseUrl: github.baseUrl.replace('/project/', '/other/') },
  'anderer Providertyp': mirror
}) as Array<[string, ProviderCacheConfiguration]>) {
  test(`${label}: gleicher Release-ID-Stand darf nicht als fremder Fallback dienen`, async () => {
    const service = new ReleaseService(indexedStore());
    await service.refresh(fixture(github));
    await assert.rejects(service.refresh(offline(fixture(other))), /Offline/);
    assert.equal(await service.getActive(fixture(other)), undefined);
  });
}

for (const [label, other] of Object.entries({
  'anderer Tenant': { ...mirror, siteAbsoluteUrl: 'https://other.sharepoint.com/sites/E' },
  'andere Site E/Q': { ...mirror, siteAbsoluteUrl: 'https://tenant.sharepoint.com/sites/Q', mirrorPath: '/sites/Q/Shared Documents/releases/mvp06' },
  'anderer Mirrorordner': { ...mirror, mirrorPath: '/sites/E/Shared Documents/releases/copy-mvp06' },
  'historischer AP5-Datenpin': { ...mirror, mirrorPath: '/sites/E/Shared Documents/releases/ap5' }
}) as Array<[string, ProviderCacheConfiguration]>) {
  test(`${label}: SharePoint-Fallback bleibt an Site und Datenordner gebunden`, async () => {
    const service = new ReleaseService(indexedStore());
    await service.refresh(fixture(mirror));
    await assert.rejects(service.refresh(offline(fixture(other))), /Offline/);
    assert.equal(await service.getActive(fixture(other)), undefined);
  });
}

test('gleichzeitige Kontexte mit gleicher Release-ID behalten je ihre Originalbytes', async () => {
  const store = indexedStore();
  const service = new ReleaseService(store);
  const first = fixture(github);
  const second: IReleaseProvider = { ...fixture(mirror), async fetchBytes(path) {
    const bytes = await first.fetchBytes(path);
    return path === 'manifest.json' ? new TextEncoder().encode(`${new TextDecoder().decode(bytes)}\n`) : bytes;
  } };
  const left = await service.refresh(first);
  const right = await service.refresh(second);
  assert.equal(left.release.releaseId, right.release.releaseId);
  assert.notEqual(left.release.manifestSha256, right.release.manifestSha256);
  assert.equal((await service.refresh(offline(first))).release.manifestSha256, left.release.manifestSha256);
  assert.equal((await service.refresh(offline(second))).release.manifestSha256, right.release.manifestSha256);
  assert.equal(await store.getActive(), undefined);
});

test('gleiche Konfiguration darf nach vollständiger Neuvalidierung aus IndexedDB laden', async () => {
  const factory = new IDBFactory();
  const provider = fixture(mirror);
  const first = await new ReleaseService(new IndexedDbValidatedReleaseStore('persist', factory)).refresh(provider);
  const service = new ReleaseService(new IndexedDbValidatedReleaseStore('persist', factory));
  const fallback = await service.refresh(offline(provider));
  assert.equal(fallback.mode, 'fallback');
  assert.equal(fallback.release.manifestSha256, first.release.manifestSha256);
  assert.match(fallback.warning ?? '', /Offline/);
  assert.notEqual(fallback.release, first.release);
});

test('originweiter ungebundener Altstand wird nicht einem neuen Provider zugeordnet', async () => {
  const store = indexedStore();
  const provider = fixture();
  await store.activate(await new ReleaseValidator().validateProvider(provider));
  const service = new ReleaseService(store);
  assert.ok(await store.getActive());
  assert.equal(await service.getActive(), undefined);
  assert.equal(await service.getActive(provider), undefined);
  await assert.rejects(service.refresh(offline(provider)), /Offline/);
});

test('IndexedDB-Upgrade übernimmt originweites Version-1-active ausdrücklich nicht', async () => {
  const factory = new IDBFactory();
  const release = await new ReleaseValidator().validateProvider(fixture());
  const database = await new Promise<IDBDatabase>((resolveDatabase, reject) => {
    const request = factory.open('legacy', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('releases', { keyPath: 'releaseId' });
      request.result.createObjectStore('state', { keyPath: 'key' });
    };
    request.onsuccess = () => resolveDatabase(request.result);
    request.onerror = () => reject(request.error);
  });
  await new Promise<void>((done, reject) => {
    const transaction = database.transaction(['releases', 'state'], 'readwrite');
    transaction.objectStore('releases').put(release);
    transaction.objectStore('state').put({ key: 'active', releaseId: release.releaseId });
    transaction.oncomplete = () => done();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
  const store = new IndexedDbValidatedReleaseStore('legacy', factory);
  assert.equal((await store.getActive())?.releaseId, release.releaseId);
  await assert.rejects(new ReleaseService(store).refresh(offline(fixture())), /Offline/);
});

for (const [label, configuration] of [
  ['fehlende Konfiguration', undefined],
  ['mutabler GitHub-Pin', { kind: 'github', baseUrl: github.baseUrl.replace(pin, 'main') }],
  ['fremde SharePoint-Site', { ...mirror, mirrorPath: '/sites/Q/releases/approved' }],
  ['HTTP-Site', { ...mirror, siteAbsoluteUrl: mirror.siteAbsoluteUrl.replace('https:', 'http:') }],
  ['Providertyp stimmt nicht', mirror]
] as const) {
  test(`${label}: Sperre vor Netzabruf und ohne Zugriff auf alten Aktivstand`, async () => {
    const store = indexedStore();
    const service = new ReleaseService(store);
    await service.refresh(fixture());
    let fetched = false;
    const provider: IReleaseProvider = { id: 'invalid',
      kind: label === 'Providertyp stimmt nicht' ? 'github' : configuration?.kind ?? 'github',
      cacheConfiguration: configuration,
      async fetchBytes() { fetched = true; throw new Error('darf nicht laden'); } };
    await assert.rejects(service.refresh(provider));
    assert.equal(fetched, false);
  });
}

type MutableRelease = {
  -readonly [K in keyof IValidatedRelease]: IValidatedRelease[K]
};

for (const [label, corrupt] of [
  ['Artefaktbytes manipuliert', (release: MutableRelease) => { release.artifacts[0].bytes[10] ^= 1; }],
  ['Manifestbytes manipuliert', (release: MutableRelease) => { release.manifestBytes[10] ^= 1; }],
  ['Manifesthash manipuliert', (release: MutableRelease) => { release.manifestSha256 = 'a'.repeat(64); }],
  ['Artefakt fehlt', (release: MutableRelease) => { release.artifacts = release.artifacts.slice(1); }],
  ['Doppeltes Artefakt', (release: MutableRelease) => { release.artifacts = [...release.artifacts, release.artifacts[0]]; }],
  ['Zusätzliches Artefakt', (release: MutableRelease) => { release.artifacts = [...release.artifacts, {
    ...release.artifacts[0], descriptor: { ...release.artifacts[0].descriptor, path: 'extra.json' }
  }]; }]
] as const) {
  test(`${label}: gespeicherte Validierungsbehauptung genügt nicht für Fallback`, async () => {
    const store = indexedStore();
    const service = new ReleaseService(store);
    const provider = fixture();
    const key = getProviderCacheIdentity(provider);
    await service.refresh(provider);
    const stored = await store.getActive(key) as MutableRelease;
    corrupt(stored);
    await store.activate(stored, key);
    await assert.rejects(service.refresh(offline(provider)), /Cache ist nicht verwendbar/);
    await assert.rejects(service.getActive(provider));
  });
}

test('manipulierte parsed-Objekte und Metadaten werden nicht verwendet, sondern aus Originalbytes neu erzeugt', async () => {
  const store = new MemoryValidatedReleaseStore();
  const service = new ReleaseService(store);
  const provider = fixture();
  const initial = await service.refresh(provider);
  const key = getProviderCacheIdentity(provider);
  const cached = await store.getActive(key) as MutableRelease;
  cached.releaseId = 'erfundener-altstand';
  cached.coverageFrom = '1900-01-01';
  cached.artifacts = cached.artifacts.map(artifact => ({ ...artifact, parsed: { manipulated: true } }));
  const rebuilt = await service.refresh(offline(provider));
  assert.equal(rebuilt.release.releaseId, '2026-08-31-mvp-02-approved.1');
  assert.notEqual(rebuilt.release.coverageFrom, '1900-01-01');
  assert.equal(rebuilt.release.manifestSha256, initial.release.manifestSha256);
  assert.ok(rebuilt.release.artifacts.every(artifact => !(artifact.parsed as Record<string, unknown>).manipulated));
});

for (const [format, releaseId] of [
  ['1.0.0', '2026-08-29-ap5-approved.1'],
  ['2.0.0', '2026-08-31-mvp-02-approved.1'],
  ['3.0.0', '2026-08-31-mvp-03-approved.1'],
  ['4.0.0', '2026-09-22-mvp-04-approved.1'],
  ['5.0.0', '2026-09-28-mvp-05-approved.1'],
  ['6.0.0', '2026-10-01-mvp-06-approved.1']
]) {
  test(`Format ${format}, ${releaseId}: historischer Reader und konfigurierte Offline-Neuprüfung erhalten`, async () => {
    const configuration: ProviderCacheConfiguration = { kind: 'github', baseUrl: `${github.baseUrl}/${releaseId}` };
    const provider = fixture(configuration, resolve(releaseRoot, '..', releaseId));
    const service = new ReleaseService(indexedStore());
    const loaded = await service.refresh(provider);
    const fallback = await service.refresh(offline(provider));
    assert.equal(fallback.mode, 'fallback');
    assert.equal(fallback.release.formatVersion, format);
    assert.equal(fallback.release.releaseId, releaseId);
    assert.equal(fallback.release.manifestSha256, loaded.release.manifestSha256);
  });
}
