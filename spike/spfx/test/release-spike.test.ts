// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { indexedDB } from 'fake-indexeddb';

import { ReleaseService } from '../src/core/ReleaseService';
import { ReleaseValidator } from '../src/core/ReleaseValidator';
import {
  IndexedDbValidatedReleaseStore,
  MemoryValidatedReleaseStore
} from '../src/core/ValidatedReleaseStore';
import type { IReleaseProvider } from '../src/core/types';

const RELEASE_ROOT = resolve(
  process.cwd(),
  '..',
  '..',
  'data',
  'releases',
  '2026-08-29-ap5-approved.1'
);

type ByteTransform = (path: string, bytes: Uint8Array) => Uint8Array;

class DirectoryProvider implements IReleaseProvider {
  public readonly kind = 'github' as const;

  public constructor(
    public readonly id: string,
    private readonly transform: ByteTransform = (_path, bytes) => bytes
  ) {}

  public async fetchBytes(relativePath: string): Promise<Uint8Array> {
    const bytes = new Uint8Array(await readFile(resolve(RELEASE_ROOT, relativePath)));
    return this.transform(relativePath, bytes);
  }
}

test('validiert den freigegebenen AP5-Release vollständig', async () => {
  const release = await new ReleaseValidator().validateProvider(
    new DirectoryProvider('fixture:github')
  );

  assert.equal(release.releaseId, '2026-08-29-ap5-approved.1');
  assert.equal(release.formatVersion, '1.0.0');
  assert.equal(release.artifacts.length, 7);
  assert.deepEqual([...release.profileIds].sort(), ['bgg', 'stpo', 'vrpg-be', 'vwvg', 'zpo']);
  assert.deepEqual([...release.calendarIds].sort(), ['be-public-holidays', 'ch-federal-calendar']);
  assert.match(release.manifestSha256, /^[a-f0-9]{64}$/);
});

test('weist für zwei Provider byteidentische Aktivstände nach', async () => {
  const validator = new ReleaseValidator();
  const github = await validator.validateProvider(new DirectoryProvider('fixture:github'));
  const mirror = await validator.validateProvider(new DirectoryProvider('fixture:sharepoint'));

  assert.equal(github.releaseId, mirror.releaseId);
  assert.equal(github.manifestSha256, mirror.manifestSha256);
  assert.deepEqual(
    github.artifacts.map(artifact => artifact.descriptor.sha256),
    mirror.artifacts.map(artifact => artifact.descriptor.sha256)
  );
});

test('lehnt ein manipuliertes Artefakt ab und behält den letzten Aktivstand', async () => {
  const store = new MemoryValidatedReleaseStore();
  const service = new ReleaseService(store);
  const initial = await service.refresh(new DirectoryProvider('fixture:valid'));

  const corrupted = new DirectoryProvider('fixture:corrupted', (path, bytes) => {
    if (path !== 'profiles/stpo.json') {
      return bytes;
    }
    const copy = bytes.slice();
    copy[copy.length - 2] ^= 1;
    return copy;
  });
  const fallback = await service.refresh(corrupted);

  assert.equal(initial.mode, 'network');
  assert.equal(fallback.mode, 'fallback');
  assert.equal(fallback.release.releaseId, initial.release.releaseId);
  assert.match(fallback.warning ?? '', /SHA-256-Prüfsumme/);
  assert.equal((await store.getActive())?.manifestSha256, initial.release.manifestSha256);
});

test('aktiviert bei einem fehlenden Artefakt ohne Altstand nichts', async () => {
  class MissingArtifactProvider extends DirectoryProvider {
    public async fetchBytes(relativePath: string): Promise<Uint8Array> {
      if (relativePath === 'profiles/zpo.json') {
        throw new Error('404 Testartefakt fehlt');
      }
      return super.fetchBytes(relativePath);
    }
  }

  const store = new MemoryValidatedReleaseStore();
  const service = new ReleaseService(store);
  await assert.rejects(
    service.refresh(new MissingArtifactProvider('fixture:missing')),
    /Testartefakt fehlt/
  );
  assert.equal(await store.getActive(), undefined);
});

test('weist eine unbekannte Format-Hauptversion ab', async () => {
  const provider = new DirectoryProvider('fixture:major-version', (path, bytes) => {
    if (path !== 'manifest.json') {
      return bytes;
    }
    const manifest = JSON.parse(new TextDecoder().decode(bytes));
    manifest.formatVersion = '2.0.0';
    return new TextEncoder().encode(JSON.stringify(manifest));
  });

  await assert.rejects(
    new ReleaseValidator().validateProvider(provider),
    /Unbekannte Hauptversion/
  );
});

test('speichert Release und Aktivzeiger in IndexedDB und stellt sie wieder her', async () => {
  const release = await new ReleaseValidator().validateProvider(
    new DirectoryProvider('fixture:indexeddb')
  );
  const databaseName = `fristenrechner-test-${Date.now()}-${Math.random()}`;
  const writer = new IndexedDbValidatedReleaseStore(databaseName, indexedDB);
  const reader = new IndexedDbValidatedReleaseStore(databaseName, indexedDB);

  await writer.activate(release);
  const restored = await reader.getActive();

  assert.equal(restored?.releaseId, release.releaseId);
  assert.equal(restored?.manifestSha256, release.manifestSha256);
  assert.equal(restored?.artifacts.length, release.artifacts.length);
});
