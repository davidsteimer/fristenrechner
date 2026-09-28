// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { indexedDB } from 'fake-indexeddb';
import { ReleaseValidator } from '../src/core/ReleaseValidator';
import { IndexedDbValidatedReleaseStore } from '../src/core/ValidatedReleaseStore';
import type { IReleaseProvider } from '../src/core/types';
import { createCalculationData } from '../src/product/core';

const root = resolve(process.cwd(), '..', 'data/candidates/2026-09-25-ap19c1');
type Document = Record<string, any>;
interface Fixture { manifest: Document; documents: Map<string, Document> }

async function fixture(mutate: (value: Fixture) => void = () => undefined): Promise<IReleaseProvider> {
  const manifest = JSON.parse(await readFile(resolve(root, 'manifest.json'), 'utf8')) as Document;
  assert.equal(manifest.releaseStatus, 'candidate');
  const documents = new Map<string, Document>();
  const originals = new Map<string, Uint8Array>();
  for (const descriptor of manifest.artifacts) {
    const bytes = new Uint8Array(await readFile(resolve(root, descriptor.path)));
    originals.set(descriptor.path, bytes);
    documents.set(descriptor.path, JSON.parse(new TextDecoder().decode(bytes)));
  }
  // In-memory transport fixture only. Eligibility records stay candidate and block calculation.
  manifest.releaseStatus = 'approved';
  mutate({ manifest, documents });
  const contents = new Map<string, Uint8Array>();
  for (const descriptor of manifest.artifacts) {
    const original = originals.get(descriptor.path)!;
    const content = JSON.stringify(documents.get(descriptor.path));
    const bytes = JSON.stringify(JSON.parse(new TextDecoder().decode(original))) === content
      ? original : new TextEncoder().encode(content);
    descriptor.sha256 = createHash('sha256').update(bytes).digest('hex');
    descriptor.byteLength = bytes.byteLength;
    contents.set(descriptor.path, bytes);
  }
  contents.set('manifest.json', new TextEncoder().encode(JSON.stringify(manifest)));
  return { id: 'fixture:ap19c1-transport-only', kind: 'github', async fetchBytes(path) {
    const bytes = contents.get(path);
    assert.ok(bytes, path);
    return bytes;
  } };
}

test('actual Format-5 candidate is rejected before fetching any artifacts', async () => {
  const paths: string[] = [];
  const provider: IReleaseProvider = { id: 'fixture:actual-ap19c1', kind: 'github', async fetchBytes(path) {
    paths.push(path);
    return new Uint8Array(await readFile(resolve(root, path)));
  } };
  await assert.rejects(new ReleaseValidator().validateProvider(provider), /Nur freigegebene Datenreleases.*candidate/);
  assert.deepEqual(paths, ['manifest.json']);
});

test('Format 5 carries all catalogs without granting candidate rules operational approval', async () => {
  const release = await new ReleaseValidator().validateProvider(await fixture());
  assert.deepEqual(release.socialProcedureCatalogIds, ['ch-social-procedures']);
  const data = createCalculationData(release);
  const social = data.socialProcedureCatalogs?.get('ch-social-procedures');
  assert.ok(social);
  assert.equal(social.federalRules.length, 16);
  assert.ok(social.releaseEligibility.every(item => item.status === 'candidate' && item.approval === null));
  assert.equal(data.specialRegimeCatalogs.get('vrpg-be-special-regimes-rest')?.deadlineDefinitions.length, 33);
});

test('Format-5 Github and mirror transport have identical bytes and metadata', async () => {
  const github = await fixture();
  const mirror: IReleaseProvider = { ...github, id: 'fixture:ap19c1-mirror', kind: 'sharepointMirror' };
  const validator = new ReleaseValidator();
  const left = await validator.validateProvider(github), right = await validator.validateProvider(mirror);
  assert.equal(left.manifestSha256, right.manifestSha256);
  assert.deepEqual(left.socialProcedureCatalogIds, right.socialProcedureCatalogIds);
  assert.deepEqual(left.artifacts.map(item => item.descriptor.sha256), right.artifacts.map(item => item.descriptor.sha256));
});

test('IndexedDB persists the complete Format-5 envelope', async () => {
  const release = await new ReleaseValidator().validateProvider(await fixture());
  const name = `ap19c1-contract-${Date.now()}-${Math.random()}`;
  await new IndexedDbValidatedReleaseStore(name, indexedDB).activate(release);
  const restored = await new IndexedDbValidatedReleaseStore(name, indexedDB).getActive();
  assert.ok(restored);
  assert.equal(restored.manifestSha256, release.manifestSha256);
  assert.deepEqual(restored.socialProcedureCatalogIds, ['ch-social-procedures']);
  assert.equal(createCalculationData(restored).socialProcedureCatalogs?.size, 1);
});

const invalid: Array<[string, (value: Fixture) => void]> = [
  ['missing social IDs', ({ manifest }) => { delete manifest.socialProcedureCatalogIds; }],
  ['unknown social ID', ({ manifest }) => { manifest.socialProcedureCatalogIds = ['other']; }],
  ['missing social artifact', ({ manifest }) => { manifest.artifacts = manifest.artifacts.filter((item: Document) => item.role !== 'socialProcedureCatalog'); }],
  ['duplicate social artifact', ({ manifest }) => { manifest.artifacts.push(manifest.artifacts.find((item: Document) => item.role === 'socialProcedureCatalog')); }],
  ['old consumer minimum', ({ manifest }) => { manifest.compatibility.minimumConsumerFormatVersion = '4.0.0'; }],
  ['format 4 smuggling', ({ manifest }) => { manifest.formatVersion = '4.0.0'; manifest.compatibility.minimumConsumerFormatVersion = '4.0.0'; }],
  ['unknown minor', ({ manifest }) => { manifest.formatVersion = '5.1.0'; }],
  ['unknown core field', ({ manifest }) => { manifest.ignoreThis = true; }],
  ['wrong schema-role pair', ({ manifest }) => { manifest.artifacts.find((item: Document) => item.role === 'socialProcedureCatalog').schemaId = manifest.artifacts.find((item: Document) => item.role === 'holidayCatalog').schemaId; }],
  ['unknown social field', ({ manifest, documents }) => { documents.get(manifest.artifacts.find((item: Document) => item.role === 'socialProcedureCatalog').path)!.ignoreThis = true; }]
];
for (const [name, mutate] of invalid) test(`Format 5 rejects ${name}`, async () => {
  await assert.rejects(new ReleaseValidator().validateProvider(await fixture(mutate)));
});

test('Format-5 artifact tampering is rejected before loading the core', async () => {
  const base = await fixture();
  const provider: IReleaseProvider = { ...base, async fetchBytes(path) {
    const bytes = await base.fetchBytes(path);
    if (path !== 'social-procedures/ch-social-procedures.json') return bytes;
    const modified = bytes.slice();
    modified[modified.length - 1] ^= 1;
    return modified;
  } };
  await assert.rejects(new ReleaseValidator().validateProvider(provider), /SHA-256/);
});

test('Format 5 rejects an omitted operative source even when artifact hashes are valid', async () => {
  await assert.rejects(new ReleaseValidator().validateProvider(await fixture(({ manifest }) => {
    manifest.sourceSummary.sourceIds = manifest.sourceSummary.sourceIds.filter((id: string) => id !== 'SRC-AP19C-ELG-20260101');
  })), /Operative Quellen-IDs/);
});

test('Format 5 rejects an unexpected source in the manifest register', async () => {
  await assert.rejects(new ReleaseValidator().validateProvider(await fixture(({ manifest }) => {
    manifest.sourceSummary.sourceIds.push('SRC-NOT-IN-ANY-ARTIFACT');
  })), /Operative Quellen-IDs/);
});

test('Format 5 rejects conflicting metadata for a source ID shared by two artifacts', async () => {
  await assert.rejects(new ReleaseValidator().validateProvider(await fixture(({ documents }) => {
    const social = documents.get('social-procedures/ch-social-procedures.json')!;
    social.sources.find((source: Document) => source.sourceId === 'SRC-AP17C-ATSG-20240101').url = 'https://example.org/different-statute';
  })), /komponentenübergreifende Quellenidentität/);
});

test('Format 5 permits different JSON property order for an identical shared source', async () => {
  const provider = await fixture(({ documents }) => {
    const social = documents.get('social-procedures/ch-social-procedures.json')!;
    social.sources = social.sources.map((source: Document) => Object.fromEntries(Object.entries(source).reverse()));
  });
  const result = await new ReleaseValidator().validateProvider(provider);
  assert.equal(result.formatVersion, '5.0.0');
});
