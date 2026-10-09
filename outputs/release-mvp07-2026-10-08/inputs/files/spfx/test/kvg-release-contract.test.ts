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
import { calculateSocialDeadline } from '../src/product/core/socialDeadline';
import type { SocialDeadlineInput } from '../src/product/core/socialTypes';

const directory = resolve(process.cwd(), '..', 'data/candidates/2026-09-28-ap19c3');
type Document = Record<string, any>;
async function provider(transportApproved = false, mutate?: (manifest: Document, social: Document) => void): Promise<IReleaseProvider> {
  const manifest = JSON.parse(await readFile(resolve(directory, 'manifest.json'), 'utf8')) as Document;
  const contents = new Map<string, Uint8Array>();
  for (const item of manifest.artifacts) contents.set(item.path, new Uint8Array(await readFile(resolve(directory, item.path))));
  if (transportApproved) manifest.releaseStatus = 'approved'; // In-memory envelope only, not rule approval.
  if (mutate) {
    const artifact = manifest.artifacts.find((item: Document) => item.role === 'socialProcedureCatalog');
    const social = JSON.parse(new TextDecoder().decode(contents.get(artifact.path)));
    mutate(manifest, social);
    const bytes = new TextEncoder().encode(JSON.stringify(social));
    artifact.sha256 = createHash('sha256').update(bytes).digest('hex');
    artifact.byteLength = bytes.byteLength;
    contents.set(artifact.path, bytes);
  }
  contents.set('manifest.json', new TextEncoder().encode(JSON.stringify(manifest)));
  return { id: 'fixture:ap19c3-source-transport', kind: 'github', async fetchBytes(path) {
    assert.ok(contents.has(path)); return contents.get(path)!;
  } };
}

test('AP19C3 transport rejects actual candidate without fetching artifacts', async () => {
  const fixture = await provider();
  const paths: string[] = [];
  await assert.rejects(new ReleaseValidator().validateProvider({ ...fixture, async fetchBytes(path) {
    paths.push(path); return fixture.fetchBytes(path);
  } }), /Nur freigegebene Datenreleases.*candidate/);
  assert.deepEqual(paths, ['manifest.json']);
});

test('AP19C3 source consumer transports twenty-four rules and twenty-eight bindings with all four KVG paths blocked', async () => {
  const release = await new ReleaseValidator().validateProvider(await provider(true));
  const data = createCalculationData(release);
  const catalog = data.socialProcedureCatalogs!.get('ch-social-procedures')!;
  assert.equal(catalog.federalRules.length, 24);
  assert.equal(catalog.cantonalBindings.length, 28);
  assert.ok(catalog.releaseEligibility.every(item => item.status === 'candidate' && item.approval === null));
  const bindings = catalog.cantonalBindings.filter(item => item.ruleId.startsWith('CH-SOC-KVG-OKP-'));
  assert.equal(bindings.length, 4);
  for (const binding of bindings) {
    const rule = catalog.federalRules.find(item => item.ruleId === binding.ruleId)!;
    const route = binding.contextRoutes[0]!;
    const input: SocialDeadlineInput = {
      ruleId: rule.ruleId, bindingId: binding.bindingId, contextRouteId: route.contextRouteId,
      procedureContextCanton: 'BE', caseFacts: Object.fromEntries(route.requiredFacts.map(fact => [fact.factKey, fact.allowedValues[0]])),
      qualificationBasis: 'displayed-model-scope', matter: rule.matter, triggerKind: rule.triggerKind,
      notificationChannel: 'individual-service', notificationConfirmed: false, legalTriggerDate: '2026-09-16',
      ...(binding.normBindings.some(norm => norm.temporalSelector === 'jurisdictionReferenceDate') ? { jurisdictionReferenceDate: '2026-09-10' } : {}),
      ...(rule.calculation.durationInputId ? { days: 10 } : {}),
      holidayResolution: { status: 'resolved', calendarBindingId: 'be-party', anchors: [{ role: 'party', canton: 'BE', spatialScopeId: 'BE' }] }
    };
    assert.deepEqual(calculateSocialDeadline(input, data).blockReasonKeys, ['not-released'], binding.bindingId);
  }
});

test('AP19C3 mirror and GitHub transport preserve identical candidate bytes', async () => {
  const github = await provider(true);
  const mirror: IReleaseProvider = { ...github, id: 'fixture:ap19c3-mirror', kind: 'sharepointMirror' };
  const validator = new ReleaseValidator();
  const left = await validator.validateProvider(github), right = await validator.validateProvider(mirror);
  assert.equal(left.manifestSha256, right.manifestSha256);
  assert.deepEqual(left.artifacts.map(item => item.descriptor.sha256), right.artifacts.map(item => item.descriptor.sha256));
});

test('AP19C3 IndexedDB round-trip retains KVG product and court routes and candidate statuses', async () => {
  const release = await new ReleaseValidator().validateProvider(await provider(true));
  const store = new IndexedDbValidatedReleaseStore(`ap19c3-contract-${Date.now()}-${Math.random()}`, indexedDB);
  await store.activate(release);
  const restored = await store.getActive();
  assert.ok(restored);
  const catalog = createCalculationData(restored).socialProcedureCatalogs!.get('ch-social-procedures')!;
  assert.equal(catalog.cantonalBindings.filter(item => item.ruleId.startsWith('CH-SOC-KVG-OKP-')).length, 4);
  assert.ok(catalog.releaseEligibility.every(item => item.status === 'candidate' && item.approval === null));
});

test('AP19C3 rejects new KVG binding tampering even with recomputed artifact hashes', async () => {
  await assert.rejects(new ReleaseValidator().validateProvider(await provider(true, (_manifest, social) => {
    social.cantonalBindings.find((item: Document) => item.bindingId === 'BE-SOC-KVG-OKP-APP').contextRoutes[0].requiredFacts.find((item: Document) => item.factKey === 'partyDomicileCanton').allowedValues = ['ZH'];
  })), /hash mismatch/);
});

test('AP19C3 rejects missing KVG evidence source in a hash-valid envelope', async () => {
  await assert.rejects(new ReleaseValidator().validateProvider(await provider(true, (manifest) => {
    manifest.sourceSummary.sourceIds = manifest.sourceSummary.sourceIds.filter((id: string) => id !== 'SRC-AP19C3-KVG-20260101');
  })), /Operative Quellen-IDs/);
});

