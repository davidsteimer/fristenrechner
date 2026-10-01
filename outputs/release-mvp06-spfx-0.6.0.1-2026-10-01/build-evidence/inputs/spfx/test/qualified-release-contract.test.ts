// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

import { ReleaseValidator } from '../src/core/ReleaseValidator';
import type { IReleaseManifest, IReleaseProvider } from '../src/core/types';
import { createCalculationData } from '../src/product/core';

const REPOSITORY_ROOT = resolve(process.cwd(), '..');
const BASE_RELEASE_ROOT = resolve(REPOSITORY_ROOT, 'data/releases/2026-08-31-mvp-03-approved.1');
const CANDIDATE_ROOT = resolve(REPOSITORY_ROOT, 'data/releases/2026-09-12-ap17c-candidate.1');
const V2_SCHEMA_ID = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/special-regime-catalog-v2.schema.json';
const V3_SCHEMA_ID = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/special-regime-catalog-v3.schema.json';

interface FixtureCatalog {
  $schema: string;
  formatVersion: string;
  catalogId: string;
  blockedMappings: Array<Record<string, unknown>>;
  deadlineDefinitions: Array<Record<string, unknown>>;
}

interface ContractFixture {
  readonly catalog: FixtureCatalog;
  readonly descriptorSchemaId?: string;
}

/**
 * A synthetic, memory-only format-contract fixture based on the old approved release.
 * It is not the AP17C candidate and is never persisted, promoted or sent to a provider.
 */
async function fixtureProvider(
  mutate: (fixture: ContractFixture) => void = () => undefined
): Promise<IReleaseProvider> {
  const originalManifest = JSON.parse(await readFile(resolve(BASE_RELEASE_ROOT, 'manifest.json'), 'utf8')) as IReleaseManifest;
  const bytes = new Map<string, Uint8Array>();
  for (const descriptor of originalManifest.artifacts) {
    bytes.set(descriptor.path, new Uint8Array(await readFile(resolve(BASE_RELEASE_ROOT, descriptor.path))));
  }
  const originalDescriptor = originalManifest.artifacts.find(artifact => artifact.role === 'specialRegimeCatalog');
  assert.ok(originalDescriptor);
  const catalog = JSON.parse(new TextDecoder().decode(bytes.get(originalDescriptor.path))) as FixtureCatalog;
  catalog.$schema = V3_SCHEMA_ID;
  catalog.formatVersion = '3.0.0';
  catalog.blockedMappings = [];
  for (const definition of catalog.deadlineDefinitions) {
    if (definition.deadlineOrigin === 'CALCULATED') definition.applicability = null;
  }
  const fixture: ContractFixture = { catalog };
  mutate(fixture);
  const catalogBytes = new TextEncoder().encode(JSON.stringify(catalog));
  bytes.set(originalDescriptor.path, catalogBytes);
  const manifest = {
    ...originalManifest,
    releaseId: '2026-09-12-test-v3-contract.1',
    artifacts: originalManifest.artifacts.map(descriptor => descriptor !== originalDescriptor ? descriptor : {
      ...descriptor,
      schemaId: fixture.descriptorSchemaId ?? V3_SCHEMA_ID,
      byteLength: catalogBytes.byteLength,
      sha256: createHash('sha256').update(catalogBytes).digest('hex')
    })
  };
  bytes.set('manifest.json', new TextEncoder().encode(JSON.stringify(manifest)));
  return {
    id: 'fixture:synthetic-v3-contract',
    kind: 'github',
    async fetchBytes(path) {
      const content = bytes.get(path);
      assert.ok(content, `Fehlende lokale Vertragsfixture: ${path}`);
      return content;
    }
  };
}

test('lädt den synthetischen Spezialkatalog-3-Vertrag mit Manifest 3 und Kalender 2', async () => {
  const release = await new ReleaseValidator().validateProvider(await fixtureProvider());
  const data = createCalculationData(release);
  assert.equal(data.formatVersion, '3.0.0');
  assert.equal(data.calendarRuleSets.size, 2);
  assert.deepEqual([...data.specialRegimeCatalogs.values()].map(catalog => catalog.formatVersion), ['3.0.0']);
});

test('weist einen v3-Inhalt mit v2-Deskriptor ab', async () => {
  await assert.rejects(
    new ReleaseValidator().validateProvider(await fixtureProvider(fixture => {
      Object.assign(fixture, { descriptorSchemaId: V2_SCHEMA_ID });
    })),
    /verletzt das JSON-Schema/
  );
});

test('weist einen v2-Inhalt mit v3-Deskriptor ab', async () => {
  await assert.rejects(
    new ReleaseValidator().validateProvider(await fixtureProvider(({ catalog }) => {
      catalog.$schema = V2_SCHEMA_ID;
      catalog.formatVersion = '2.0.0';
    })),
    /verletzt das JSON-Schema/
  );
});

test('weist einen unbekannten Spezialkatalog-Deskriptor ab', async () => {
  await assert.rejects(
    new ReleaseValidator().validateProvider(await fixtureProvider(fixture => {
      Object.assign(fixture, { descriptorSchemaId: V3_SCHEMA_ID.replace('-v3.', '-v4.') });
    })),
    /verletzt das JSON-Schema|Unbekanntes Spezialregime-Schema/
  );
});

test('verlangt im v3-Altbestand eine ausdrückliche leere Anwendbarkeit', async () => {
  await assert.rejects(
    new ReleaseValidator().validateProvider(await fixtureProvider(({ catalog }) => {
      const definition = catalog.deadlineDefinitions.find(item => item.deadlineOrigin === 'CALCULATED');
      assert.ok(definition);
      delete definition.applicability;
    })),
    /verletzt das JSON-Schema/
  );
});

test('blockiert unbekannte fachliche Felder statt sie stillschweigend zu ignorieren', async () => {
  await assert.rejects(
    new ReleaseValidator().validateProvider(await fixtureProvider(({ catalog }) => {
      const definition = catalog.deadlineDefinitions.find(item => item.deadlineOrigin === 'CALCULATED');
      assert.ok(definition);
      definition.unreviewedLegalFallback = true;
    })),
    /verletzt das JSON-Schema/
  );
});

test('prüft den echten Kandidatenkatalog separat gegen v3 ohne Releaseaktivierung', async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
  addFormats(ajv, ['date', 'uri']);
  for (const name of ['common', 'filing-profile', 'deadline-definition', 'special-regime-catalog-v2']) {
    ajv.addSchema(JSON.parse(await readFile(resolve(REPOSITORY_ROOT, `schemas/${name}.schema.json`), 'utf8')));
  }
  const schema = JSON.parse(await readFile(resolve(REPOSITORY_ROOT, 'schemas/special-regime-catalog-v3.schema.json'), 'utf8'));
  const validate = ajv.compile(schema);
  const manifest = JSON.parse(await readFile(resolve(CANDIDATE_ROOT, 'manifest.json'), 'utf8'));
  assert.equal(manifest.releaseStatus, 'candidate');
  const descriptor = (manifest.artifacts as IReleaseManifest['artifacts']).find(item => item.role === 'specialRegimeCatalog');
  assert.ok(descriptor);
  const catalog = JSON.parse(await readFile(resolve(CANDIDATE_ROOT, descriptor.path), 'utf8')) as FixtureCatalog;
  assert.equal(validate(catalog), true, JSON.stringify(validate.errors));
  assert.equal(catalog.deadlineDefinitions.filter(definition => definition.applicability).length, 16);
  assert.equal(catalog.blockedMappings.length, 4);
});

test('weist den echten AP17C-Kandidaten weiterhin vor dem Laden seiner Artefakte ab', async () => {
  const fetched: string[] = [];
  const provider: IReleaseProvider = {
    id: 'fixture:actual-ap17c-candidate',
    kind: 'github',
    async fetchBytes(path) {
      fetched.push(path);
      return new Uint8Array(await readFile(resolve(CANDIDATE_ROOT, path)));
    }
  };
  await assert.rejects(
    new ReleaseValidator().validateProvider(provider),
    /Nur freigegebene Datenreleases sind zulässig: candidate/
  );
  assert.deepEqual(fetched, ['manifest.json']);
});
