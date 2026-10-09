// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import test from 'node:test';
import {indexedDB} from 'fake-indexeddb';
import {ReleaseValidator} from '../src/core/ReleaseValidator';
import {IndexedDbValidatedReleaseStore} from '../src/core/ValidatedReleaseStore';
import type {IReleaseProvider} from '../src/core/types';
import {createCalculationData} from '../src/product/core';

const candidateRoot = resolve(process.cwd(), '..', 'data/candidates/2026-09-30-ap20c1');
const schemaBase = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
type Document = Record<string, any>;
interface Fixture {manifest: Document; documents: Map<string, Document>}

async function fixture(mutate: (value: Fixture) => void = () => undefined): Promise<IReleaseProvider> {
  const manifest = JSON.parse(await readFile(resolve(candidateRoot, 'manifest.json'),'utf8')) as Document;
  assert.equal(manifest.releaseStatus, 'candidate');
  const documents = new Map<string, Document>(), originals = new Map<string, Uint8Array>();
  for (const descriptor of manifest.artifacts) {
    const bytes = new Uint8Array(await readFile(resolve(candidateRoot, descriptor.path)));
    originals.set(descriptor.path, bytes);
    documents.set(descriptor.path, JSON.parse(new TextDecoder().decode(bytes)));
  }
  // Transport validation fixture in memory only, never product approval or promotion.
  manifest.releaseStatus = 'approved';
  mutate({manifest, documents});
  const contents = new Map<string, Uint8Array>();
  for (const descriptor of manifest.artifacts) {
    const original = originals.get(descriptor.path)!;
    const json = JSON.stringify(documents.get(descriptor.path));
    const bytes = JSON.stringify(JSON.parse(new TextDecoder().decode(original))) === json ? original : new TextEncoder().encode(json);
    descriptor.sha256 = createHash('sha256').update(bytes).digest('hex'); descriptor.byteLength = bytes.byteLength;
    contents.set(descriptor.path, bytes);
  }
  contents.set('manifest.json', new TextEncoder().encode(JSON.stringify(manifest)));
  return {id:'fixture:ap20c1-transport-only', kind:'github', async fetchBytes(path) {
    const bytes = contents.get(path); assert.ok(bytes, path); return bytes;
  }};
}

test('real AP20C1 candidate remains blocked before any artifact fetch', async () => {
  const paths: string[] = [];
  const provider: IReleaseProvider = {id:'fixture:ap20c1-real-candidate', kind:'sharepointMirror', async fetchBytes(path) {
    paths.push(path); return new Uint8Array(await readFile(resolve(candidateRoot,path)));
  }};
  await assert.rejects(new ReleaseValidator().validateProvider(provider), /Nur freigegebene Datenreleases.*candidate/);
  assert.deepEqual(paths, ['manifest.json']);
});

test('format 6 transport retains component 2 and all exact candidate gates', async () => {
  const release = await new ReleaseValidator().validateProvider(await fixture());
  assert.equal(release.formatVersion, '6.0.0'); assert.equal(release.artifacts.length, 10);
  const social = createCalculationData(release).socialProcedureCatalogs!.get('ch-social-procedures')!;
  assert.equal(social.formatVersion, '2.0.0'); assert.equal(social.federalRules.length, 28); assert.equal(social.cantonalBindings.length, 34);
  assert.ok(social.releaseEligibility.every(e => e.status === 'candidate' && e.approval === null));
});

test('format 6 mirror and GitHub transport preserve exact bytes and IndexedDB envelope', async () => {
  const github = await fixture(), validator = new ReleaseValidator();
  const mirror: IReleaseProvider = {...github, id:'fixture:ap20c1-mirror', kind:'sharepointMirror'};
  const left = await validator.validateProvider(github), right = await validator.validateProvider(mirror);
  assert.equal(left.manifestSha256, right.manifestSha256);
  assert.deepEqual(left.artifacts.map(a => a.descriptor.sha256), right.artifacts.map(a => a.descriptor.sha256));
  const store = new IndexedDbValidatedReleaseStore(`ap20c1-${Date.now()}-${Math.random()}`, indexedDB);
  await store.activate(right); const restored = await store.getActive(); assert.ok(restored);
  assert.equal(restored.manifestSha256, right.manifestSha256);
  assert.deepEqual(createCalculationData(restored).socialProcedureCatalogs, createCalculationData(right).socialProcedureCatalogs);
});

const invalid: Array<[string, (value: Fixture) => void]> = [
  ['old minimum', ({manifest}) => {manifest.compatibility.minimumConsumerFormatVersion = '5.0.0';}],
  ['unknown minimum', ({manifest}) => {manifest.compatibility.minimumConsumerFormatVersion = '6.1.0';}],
  ['unknown manifest minor', ({manifest}) => {manifest.formatVersion = '6.1.0';}],
  ['unknown manifest major', ({manifest}) => {manifest.formatVersion = '7.0.0';}],
  ['old manifest schema', ({manifest}) => {manifest.$schema = schemaBase+'release-manifest-v5.schema.json';}],
  ['component 2 in manifest 5', ({manifest}) => {
    manifest.formatVersion = '5.0.0'; manifest.compatibility.minimumConsumerFormatVersion = '5.0.0'; manifest.$schema = schemaBase+'release-manifest-v5.schema.json';
  }],
  ['component 1 in manifest 6', ({manifest, documents}) => {
    const item = manifest.artifacts.find((a: Document) => a.role === 'socialProcedureCatalog');
    item.schemaId = schemaBase+'social-procedure-catalog.schema.json';
    documents.get(item.path)!.formatVersion = '1.0.0'; documents.get(item.path)!.$schema = item.schemaId;
  }],
  ['social format-only relabel', ({documents}) => {documents.get('social-procedures/ch-social-procedures.json')!.formatVersion = '1.0.0';}],
  ['unknown social property', ({documents}) => {documents.get('social-procedures/ch-social-procedures.json')!.unrecognised = true;}],
  ['invalid EOG office domain', ({documents}) => {
    const social = documents.get('social-procedures/ch-social-procedures.json')!;
    social.cantonalBindings.find((b: Document) => b.bindingId === 'BE-SOC-EOG-CANTONAL-APP').contextRoutes[0].requiredFacts.find((f: Document) => f.factKey === 'eogOfficeType').allowedValues = ['BE'];
  }],
  ['missing operative source', ({manifest}) => {manifest.sourceSummary.sourceIds.pop();}],
  ['unknown operative source', ({manifest}) => {manifest.sourceSummary.sourceIds.push('SRC-NOT-REGISTERED');}],
  ['conflicting shared source identity', ({documents}) => {
    documents.get('social-procedures/ch-social-procedures.json')!.sources.find((s: Document) => s.sourceId === 'SRC-AP17C-ATSG-20240101').url = 'https://example.org/wrong-source';
  }]
];
for (const [name, mutate] of invalid) test(`format 6 rejects ${name}`, async () => {
  await assert.rejects(new ReleaseValidator().validateProvider(await fixture(mutate)));
});

test('format 6 rejects changed social bytes without matching file hash', async () => {
  const original = await fixture();
  const provider: IReleaseProvider = {...original, async fetchBytes(path) {
    const bytes = await original.fetchBytes(path); if (path !== 'social-procedures/ch-social-procedures.json') return bytes;
    const changed = bytes.slice(); changed[changed.length - 1] ^= 1; return changed;
  }};
  await assert.rejects(new ReleaseValidator().validateProvider(provider), /SHA-256/);
});

for (const [id, format] of [
  ['2026-08-29-ap5-approved.1','1.0.0'], ['2026-08-31-mvp-02-approved.1','2.0.0'], ['2026-08-31-mvp-03-approved.1','3.0.0'],
  ['2026-09-22-mvp-04-approved.1','4.0.0'], ['2026-09-28-mvp-05-approved.1','5.0.0']
]) test(`consumer 6 validates unchanged transport of ${format} including its data pin`, async () => {
  const root = resolve(process.cwd(),'..','data/releases',id);
  const provider: IReleaseProvider = {id:`fixture:old-${format}`, kind:'github', async fetchBytes(path) {return new Uint8Array(await readFile(resolve(root,path)));}};
  const release = await new ReleaseValidator().validateProvider(provider);
  assert.equal(release.releaseId,id); assert.equal(release.formatVersion,format);
  assert.equal(createCalculationData(release).profiles.size,5);
});
