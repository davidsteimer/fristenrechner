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

const releaseId = '2026-09-28-mvp-05-approved.1';
const directory = resolve(process.cwd(), '..', 'data/releases', releaseId);
type Document = Record<string, any>;
async function provider(mutate?: (social: Document) => void): Promise<IReleaseProvider> {
  const manifestBytes = await readFile(resolve(directory, 'manifest.json'));
  const manifest = JSON.parse(manifestBytes.toString()) as Document;
  const contents = new Map<string, Uint8Array>([['manifest.json', new Uint8Array(manifestBytes)]]);
  for (const item of manifest.artifacts) contents.set(item.path, new Uint8Array(await readFile(resolve(directory, item.path))));
  if (mutate) {
    const artifact = manifest.artifacts.find((item: Document) => item.role === 'socialProcedureCatalog');
    const social = JSON.parse(new TextDecoder().decode(contents.get(artifact.path)));
    mutate(social);
    const bytes = new TextEncoder().encode(JSON.stringify(social));
    artifact.sha256 = createHash('sha256').update(bytes).digest('hex');
    artifact.byteLength = bytes.byteLength;
    contents.set(artifact.path, bytes);
    contents.set('manifest.json', new TextEncoder().encode(JSON.stringify(manifest)));
  }
  return { id: 'fixture:mvp05-approved-local-bytes', kind: 'sharepointMirror', async fetchBytes(path) {
    assert.ok(contents.has(path)); return contents.get(path)!;
  } };
}

test('MVP 0.5 transports the real approved manifest and all ten artifacts without synthetic approval', async () => {
  const release = await new ReleaseValidator().validateProvider(await provider());
  assert.equal(release.releaseId, releaseId);
  assert.equal(release.formatVersion, '5.0.0');
  assert.equal(release.artifacts.length, 10);
  const data = createCalculationData(release);
  const catalog = data.socialProcedureCatalogs!.get('ch-social-procedures')!;
  assert.equal(catalog.federalRules.length, 24);
  assert.equal(catalog.cantonalBindings.length, 28);
  assert.ok(catalog.releaseEligibility.every(item => item.status === 'approved' && item.approval?.approvedBy === 'David Steimer'));
  assert.ok(catalog.cantonalBindings.every(item => item.procedureContextCanton === 'BE'));
});

test('MVP 0.5 source consumer calculates every approved binding with both Bern holiday anchors', async () => {
  const data = createCalculationData(await new ReleaseValidator().validateProvider(await provider()));
  const catalog = data.socialProcedureCatalogs!.get('ch-social-procedures')!;
  let calculations = 0;
  for (const binding of catalog.cantonalBindings) {
    const rule = catalog.federalRules.find(item => item.ruleId === binding.ruleId)!;
    const route = binding.contextRoutes[0]!;
    for (const role of ['party', 'representative'] as const) {
      const input: SocialDeadlineInput = {
        ruleId: rule.ruleId, bindingId: binding.bindingId, contextRouteId: route.contextRouteId,
        procedureContextCanton: 'BE', caseFacts: Object.fromEntries(route.requiredFacts.map(fact => [fact.factKey, fact.allowedValues[0]])),
        qualificationBasis: 'displayed-model-scope', matter: rule.matter, triggerKind: rule.triggerKind,
        notificationChannel: 'individual-service', notificationConfirmed: false, legalTriggerDate: '2026-09-16',
        ...([...rule.normBindings, ...binding.normBindings].some(norm => norm.temporalSelector === 'jurisdictionReferenceDate')
          ? { jurisdictionReferenceDate: '2026-09-16' } : {}),
        ...(rule.calculation.durationInputId ? { days: 10 } : {}),
        holidayResolution: { status: 'resolved', calendarBindingId: `be-${role}`, anchors: [{ role, canton: 'BE', spatialScopeId: 'BE' }] }
      };
      const result = calculateSocialDeadline(input, data);
      assert.equal(result.outcome, 'calculated', `${binding.bindingId}: ${result.blockReasonKeys}`);
      assert.equal(result.finalDeadline?.date, rule.calculation.durationInputId ? '2026-09-28' : '2026-10-16', binding.bindingId);
      assert.equal(result.socialEvidence?.releaseId, releaseId);
      calculations++;
    }
  }
  assert.equal(calculations, 56);
});

test('MVP 0.5 IndexedDB retains the exact approved source and eligibility bindings', async () => {
  const release = await new ReleaseValidator().validateProvider(await provider());
  const store = new IndexedDbValidatedReleaseStore(`mvp05-contract-${Date.now()}-${Math.random()}`, indexedDB);
  await store.activate(release);
  const restored = await store.getActive();
  assert.ok(restored);
  assert.equal(restored.manifestSha256, release.manifestSha256);
  assert.deepEqual(createCalculationData(restored).socialProcedureCatalogs, createCalculationData(release).socialProcedureCatalogs);
});

test('MVP 0.5 offline fixtures validate equivalent GitHub and Mirror byte transport without claiming publication', async () => {
  const mirror = await provider();
  const github: IReleaseProvider = { ...mirror, id: 'fixture:mvp05-offline-github', kind: 'github' };
  const validator = new ReleaseValidator();
  const left = await validator.validateProvider(mirror), right = await validator.validateProvider(github);
  assert.equal(left.manifestSha256, right.manifestSha256);
  assert.deepEqual(left.artifacts.map(item => item.descriptor.sha256), right.artifacts.map(item => item.descriptor.sha256));
});

test('MVP 0.5 rejects a changed binding even with recomputed outer artifact hashes', async () => {
  await assert.rejects(new ReleaseValidator().validateProvider(await provider(social => {
    social.cantonalBindings.find((item: Document) => item.bindingId === 'BE-SOC-KVG-OKP-APP').labels.de += ' tampered';
  })), /hash mismatch/);
});
