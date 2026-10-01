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
import {createCalculationData, calculateSocialDeadline} from '../src/product/core';
import type {SocialCantonalBinding, SocialDeadlineInput, SocialProcedureCatalog} from '../src/product/core';

const candidateRoot = resolve(process.cwd(), '..', 'data/candidates/2026-10-01-ap20c2');
const previousRoot = resolve(process.cwd(), '..', 'data/candidates/2026-09-30-ap20c1');
const schemaBase = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
type Document = Record<string, any>;
interface Fixture {manifest: Document; documents: Map<string, Document>}

async function fixture(mutate: (value: Fixture) => void = () => undefined): Promise<IReleaseProvider> {
  const manifest = JSON.parse(await readFile(resolve(candidateRoot, 'manifest.json'), 'utf8')) as Document;
  assert.equal(manifest.releaseStatus, 'candidate');
  const documents = new Map<string, Document>(), originals = new Map<string, Uint8Array>();
  for (const descriptor of manifest.artifacts) {
    const bytes = new Uint8Array(await readFile(resolve(candidateRoot, descriptor.path)));
    originals.set(descriptor.path, bytes);
    documents.set(descriptor.path, JSON.parse(new TextDecoder().decode(bytes)));
  }
  // Transport fixture only. Rule/binding approvals stay candidate, never written.
  manifest.releaseStatus = 'approved';
  mutate({manifest, documents});
  const contents = new Map<string, Uint8Array>();
  for (const descriptor of manifest.artifacts) {
    const original = originals.get(descriptor.path)!;
    const json = JSON.stringify(documents.get(descriptor.path));
    const bytes = JSON.stringify(JSON.parse(new TextDecoder().decode(original))) === json ? original : new TextEncoder().encode(json);
    descriptor.sha256 = createHash('sha256').update(bytes).digest('hex');
    descriptor.byteLength = bytes.byteLength;
    contents.set(descriptor.path, bytes);
  }
  contents.set('manifest.json', new TextEncoder().encode(JSON.stringify(manifest)));
  return {id: 'fixture:ap20c2-transport-only', kind: 'github', async fetchBytes(path) {
    const bytes = contents.get(path); assert.ok(bytes, path); return bytes;
  }};
}

function inputFor(catalog: SocialProcedureCatalog, binding: SocialCantonalBinding): SocialDeadlineInput {
  const rule = catalog.federalRules.find(item => item.ruleId === binding.ruleId)!, route = binding.contextRoutes[0]!;
  return {
    ruleId: rule.ruleId, bindingId: binding.bindingId, contextRouteId: route.contextRouteId,
    procedureContextCanton: 'BE', caseFacts: Object.fromEntries(route.requiredFacts.map(fact => [fact.factKey, fact.allowedValues[0]])),
    qualificationBasis: 'displayed-model-scope', matter: rule.matter, triggerKind: rule.triggerKind,
    notificationChannel: 'individual-service', notificationConfirmed: false, legalTriggerDate: '2026-09-16',
    ...([...rule.normBindings, ...binding.normBindings].some(norm => norm.temporalSelector === 'jurisdictionReferenceDate') ? {jurisdictionReferenceDate: '2026-09-16'} : {}),
    ...(rule.calculation.durationInputId ? {days: 10} : {}),
    holidayResolution: {status: 'resolved', calendarBindingId: 'be-party', anchors: [{role: 'party', canton: 'BE', spatialScopeId: 'BE'}]}
  };
}

test('AP20C2 real candidate transport stops at manifest without fetching any artifact', async () => {
  const paths: string[] = [];
  const provider: IReleaseProvider = {id: 'fixture:ap20c2-real-candidate', kind: 'sharepointMirror', async fetchBytes(path) {
    paths.push(path); return new Uint8Array(await readFile(resolve(candidateRoot, path)));
  }};
  await assert.rejects(new ReleaseValidator().validateProvider(provider), /Nur freigegebene Datenreleases.*candidate/);
  assert.deepEqual(paths, ['manifest.json']);
});

test('AP20C2 unchanged format 6/component 2 transports eight new paths without activating them', async () => {
  const release = await new ReleaseValidator().validateProvider(await fixture());
  assert.equal(release.formatVersion, '6.0.0');
  assert.equal(release.artifacts.length, 10);
  const data = createCalculationData(release), social = data.socialProcedureCatalogs!.get('ch-social-procedures')!;
  assert.equal(social.formatVersion, '2.0.0');
  assert.equal(social.federalRules.length, 36);
  assert.equal(social.cantonalBindings.length, 42);
  assert.equal(social.releaseEligibility.length, 42);
  assert.ok(social.releaseEligibility.every(entry => entry.status === 'candidate' && entry.approval === null));
  const additions = social.cantonalBindings.filter(binding => /^CH-SOC-(FAMZG|FLG)-/.test(binding.ruleId));
  assert.equal(additions.length, 8);
  for (const binding of additions) assert.deepEqual(calculateSocialDeadline(inputFor(social, binding), data).blockReasonKeys, ['not-released']);
});

test('AP20C2 transport preserves all accepted C1 rules, bindings and nine unchanged artifact bytes', async () => {
  const release = await new ReleaseValidator().validateProvider(await fixture());
  const social = createCalculationData(release).socialProcedureCatalogs!.get('ch-social-procedures')!;
  const old = JSON.parse(await readFile(resolve(previousRoot, 'social-procedures/ch-social-procedures.json'), 'utf8'));
  assert.deepEqual(social.federalRules.slice(0, 28), old.federalRules);
  assert.deepEqual(social.cantonalBindings.slice(0, 34), old.cantonalBindings);
  const manifest = JSON.parse(await readFile(resolve(candidateRoot, 'manifest.json'), 'utf8'));
  let count = 0;
  for (const descriptor of manifest.artifacts) if (descriptor.role !== 'socialProcedureCatalog') {
    assert.ok((await readFile(resolve(candidateRoot, descriptor.path))).equals(await readFile(resolve(previousRoot, descriptor.path))));
    count++;
  }
  assert.equal(count, 9);
});

test('AP20C2 mirror and GitHub transports share byte identity and survive IndexedDB restoration', async () => {
  const github = await fixture(), validator = new ReleaseValidator();
  const mirror: IReleaseProvider = {...github, id: 'fixture:ap20c2-mirror', kind: 'sharepointMirror'};
  const left = await validator.validateProvider(github), right = await validator.validateProvider(mirror);
  assert.equal(left.manifestSha256, right.manifestSha256);
  assert.deepEqual(left.artifacts.map(item => item.descriptor.sha256), right.artifacts.map(item => item.descriptor.sha256));
  const store = new IndexedDbValidatedReleaseStore(`ap20c2-${Date.now()}-${Math.random()}`, indexedDB);
  await store.activate(right);
  const restored = await store.getActive(); assert.ok(restored);
  assert.equal(restored.manifestSha256, right.manifestSha256);
  assert.deepEqual(createCalculationData(restored).socialProcedureCatalogs, createCalculationData(right).socialProcedureCatalogs);
});

const invalid: Array<[string, (value: Fixture) => void]> = [
  ['minimum consumer 5', ({manifest}) => {manifest.compatibility.minimumConsumerFormatVersion = '5.0.0';}],
  ['unknown manifest major', ({manifest}) => {manifest.formatVersion = '7.0.0';}],
  ['unknown manifest minor', ({manifest}) => {manifest.formatVersion = '6.1.0';}],
  ['old manifest schema', ({manifest}) => {manifest.$schema = schemaBase + 'release-manifest-v5.schema.json';}],
  ['social component 1 in manifest 6', ({manifest, documents}) => {
    const item = manifest.artifacts.find((entry: Document) => entry.role === 'socialProcedureCatalog');
    item.schemaId = schemaBase + 'social-procedure-catalog.schema.json';
    documents.get(item.path)!.formatVersion = '1.0.0'; documents.get(item.path)!.$schema = item.schemaId;
  }],
  ['unknown social property', ({documents}) => {documents.get('social-procedures/ch-social-procedures.json')!.unrecognised = true;}],
  ['FamZG canton outside the closed domain', ({documents}) => {
    documents.get('social-procedures/ch-social-procedures.json')!.cantonalBindings.find((binding: Document) => binding.bindingId === 'BE-SOC-FAMZG-COURT-APP').contextRoutes[0].requiredFacts.find((fact: Document) => fact.factKey === 'familyAllowanceOrderCanton').allowedValues = ['ZZ'];
  }],
  ['FLG canton outside the closed domain', ({documents}) => {
    documents.get('social-procedures/ch-social-procedures.json')!.cantonalBindings.find((binding: Document) => binding.bindingId === 'BE-SOC-FLG-COURT-APP').contextRoutes[0].requiredFacts.find((fact: Document) => fact.factKey === 'compensationOfficeCanton').allowedValues = ['nonCantonal'];
  }],
  ['unknown family office origin', ({documents}) => {
    documents.get('social-procedures/ch-social-procedures.json')!.cantonalBindings.find((binding: Document) => binding.bindingId === 'BE-SOC-FAMZG-ADMIN-OBJ').contextRoutes[0].requiredFacts.find((fact: Document) => fact.factKey === 'decisionOrigin').allowedValues = ['familyAllowanceEmployer'];
  }],
  ['FamZG binding changed without object hash', ({documents}) => {
    documents.get('social-procedures/ch-social-procedures.json')!.cantonalBindings.find((binding: Document) => binding.bindingId === 'BE-SOC-FAMZG-ADMIN-OBJ').labels.de += ' altered';
  }],
  ['missing operative source', ({manifest}) => {manifest.sourceSummary.sourceIds.pop();}],
  ['conflicting shared source identity', ({documents}) => {
    documents.get('social-procedures/ch-social-procedures.json')!.sources.find((source: Document) => source.sourceId === 'SRC-AP17C-ATSG-20240101').url = 'https://example.org/wrong-source';
  }]
];
for (const [name, mutate] of invalid) test(`AP20C2 transport rejects ${name}`, async () => {
  await assert.rejects(new ReleaseValidator().validateProvider(await fixture(mutate)));
});

test('AP20C2 changed social bytes cannot pass the manifest checksum', async () => {
  const original = await fixture();
  const provider: IReleaseProvider = {...original, async fetchBytes(path) {
    const bytes = await original.fetchBytes(path);
    if (path !== 'social-procedures/ch-social-procedures.json') return bytes;
    const changed = bytes.slice(); changed[changed.length - 1] ^= 1; return changed;
  }};
  await assert.rejects(new ReleaseValidator().validateProvider(provider), /SHA-256/);
});
