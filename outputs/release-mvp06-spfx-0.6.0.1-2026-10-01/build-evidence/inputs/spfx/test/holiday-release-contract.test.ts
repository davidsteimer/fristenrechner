// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { indexedDB } from 'fake-indexeddb';

import { ReleaseService } from '../src/core/ReleaseService';
import { ReleaseValidator } from '../src/core/ReleaseValidator';
import { IndexedDbValidatedReleaseStore, MemoryValidatedReleaseStore } from '../src/core/ValidatedReleaseStore';
import type { IReleaseProvider } from '../src/core/types';
import { calculateDeadline, createCalculationData } from '../src/product/core';

const CANDIDATE_ROOT = resolve(process.cwd(), '..', 'data/releases/2026-09-22-ap18c-candidate.1');
const SCHEMAS = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';

interface Descriptor {
  path: string;
  role: string;
  contentId: string;
  schemaId: string;
  sha256: string;
  byteLength: number;
}

interface Fixture {
  manifest: {
    formatVersion: string;
    releaseStatus: string;
    profileIds: string[];
    specialRegimeCatalogIds: string[];
    holidayCatalogIds?: string[];
    compatibility: { minimumConsumerFormatVersion: string };
    artifacts: Descriptor[];
  };
  documents: Map<string, Record<string, unknown>>;
}

interface CatalogFixture extends Record<string, unknown> {
  data: {
    rules: Array<{ id: string; source: string; dayPortion: string }>;
  };
}

function catalog(fixture: Fixture): CatalogFixture {
  const descriptor = fixture.manifest.artifacts.find(item => item.role === 'holidayCatalog');
  assert.ok(descriptor);
  return fixture.documents.get(descriptor.path) as CatalogFixture;
}

/** The candidate is never promoted. Only this in-memory contract fixture is approved. */
async function fixtureProvider(mutate: (fixture: Fixture) => void | Promise<void> = () => undefined): Promise<IReleaseProvider> {
  const manifest = JSON.parse(await readFile(resolve(CANDIDATE_ROOT, 'manifest.json'), 'utf8')) as Fixture['manifest'];
  assert.equal(manifest.releaseStatus, 'candidate');
  const documents = new Map<string, Record<string, unknown>>();
  for (const descriptor of manifest.artifacts) {
    documents.set(descriptor.path, JSON.parse(await readFile(resolve(CANDIDATE_ROOT, descriptor.path), 'utf8')));
  }
  manifest.releaseStatus = 'approved';
  await mutate({ manifest, documents });
  const bytes = new Map<string, Uint8Array>();
  for (const descriptor of manifest.artifacts) {
    const content = new TextEncoder().encode(JSON.stringify(documents.get(descriptor.path)));
    bytes.set(descriptor.path, content);
    descriptor.sha256 = createHash('sha256').update(content).digest('hex');
    descriptor.byteLength = content.byteLength;
  }
  bytes.set('manifest.json', new TextEncoder().encode(JSON.stringify(manifest)));
  return {
    id: 'fixture:memory-only-holiday-catalog-contract', kind: 'github',
    async fetchBytes(path) {
      const content = bytes.get(path);
      assert.ok(content, `Fehlende lokale Vertragsfixture: ${path}`);
      return content;
    }
  };
}

test('Format 4 lädt den vollen Fachkatalog und behält die bestehende Berner Berechnung', async () => {
  const release = await new ReleaseValidator().validateProvider(await fixtureProvider());
  assert.equal(release.formatVersion, '4.0.0');
  assert.deepEqual(release.holidayCatalogIds, ['ch-holiday-catalog']);
  assert.deepEqual([...release.profileIds].sort(), ['bgg', 'stpo', 'vrpg-be', 'vwvg', 'zpo']);
  assert.deepEqual([...release.calendarIds].sort(), ['be-public-holidays', 'ch-federal-calendar']);
  const data = createCalculationData(release);
  const result = calculateDeadline({
    profileId: 'stpo', inputDate: '2027-07-22',
    inputDateSemantics: 'legallyRelevantDeliveryOrEventDate', deadlineDays: 10,
    calendarId: 'be-public-holidays', selectors: {},
    confirmations: { holidayAnchorConfirmed: true }, holidayAnchorCandidates: ['BE']
  }, data);
  assert.equal(result.outcome, 'calculated');
  assert.equal(result.outcome === 'calculated' ? result.finalEnd : undefined, '2027-08-02');
});

test('der echte AP18C-Kandidat bleibt vor dem ersten Artefaktzugriff gesperrt', async () => {
  const fetched: string[] = [];
  const provider: IReleaseProvider = {
    id: 'fixture:actual-ap18c-candidate', kind: 'github',
    async fetchBytes(path) {
      fetched.push(path);
      return new Uint8Array(await readFile(resolve(CANDIDATE_ROOT, path)));
    }
  };
  await assert.rejects(new ReleaseValidator().validateProvider(provider), /Nur freigegebene Datenreleases.*candidate/);
  assert.deepEqual(fetched, ['manifest.json']);
});

test('Format-4-GitHub- und Mirrorpfad validieren byteidentische Katalogartefakte', async () => {
  const github = await fixtureProvider();
  const mirror: IReleaseProvider = { ...github, id: 'fixture:sharepoint-mirror', kind: 'sharepointMirror' };
  const validator = new ReleaseValidator();
  const [left, right] = await Promise.all([
    validator.validateProvider(github), validator.validateProvider(mirror)
  ]);
  assert.equal(left.manifestSha256, right.manifestSha256);
  assert.deepEqual(left.holidayCatalogIds, right.holidayCatalogIds);
  assert.deepEqual(left.artifacts.map(item => item.descriptor.sha256), right.artifacts.map(item => item.descriptor.sha256));
});

test('IndexedDB erhält den vollständigen Format-4-Katalog beim Wiederöffnen', async () => {
  const release = await new ReleaseValidator().validateProvider(await fixtureProvider());
  const databaseName = `fristenrechner-holiday-contract-${Date.now()}-${Math.random()}`;
  await new IndexedDbValidatedReleaseStore(databaseName, indexedDB).activate(release);
  const restored = await new IndexedDbValidatedReleaseStore(databaseName, indexedDB).getActive();
  assert.ok(restored);
  assert.equal(restored.manifestSha256, release.manifestSha256);
  assert.deepEqual(restored.holidayCatalogIds, ['ch-holiday-catalog']);
  assert.deepEqual(restored.artifacts.find(item => item.descriptor.role === 'holidayCatalog'),
    release.artifacts.find(item => item.descriptor.role === 'holidayCatalog'));
  assert.equal(createCalculationData(restored).calendarRuleSets.size, 2);
});

const invalidManifests: Array<[string, (fixture: Fixture) => void]> = [
  ['fehlende Katalog-ID', ({ manifest }) => { delete manifest.holidayCatalogIds; }],
  ['fehlendes Katalogartefakt', ({ manifest }) => {
    manifest.artifacts = manifest.artifacts.filter(item => item.role !== 'holidayCatalog');
  }],
  ['doppeltes Katalogartefakt', ({ manifest }) => {
    const item = manifest.artifacts.find(artifact => artifact.role === 'holidayCatalog');
    assert.ok(item);
    manifest.artifacts.push({ ...item });
  }],
  ['abweichende Katalog-ID', ({ manifest }) => { manifest.holidayCatalogIds = ['other-holidays']; }],
  ['Format-3-Smuggling mit Katalogrolle', ({ manifest }) => {
    manifest.formatVersion = '3.0.0';
    manifest.compatibility.minimumConsumerFormatVersion = '3.0.0';
    delete manifest.holidayCatalogIds;
  }],
  ['Format-3-Smuggling mit neuem ID-Feld', ({ manifest }) => {
    manifest.formatVersion = '3.0.0';
    manifest.compatibility.minimumConsumerFormatVersion = '3.0.0';
    manifest.artifacts = manifest.artifacts.filter(item => item.role !== 'holidayCatalog');
  }],
  ['zu niedrige Consumer-Hauptversion', ({ manifest }) => {
    manifest.compatibility.minimumConsumerFormatVersion = '3.0.0';
  }],
  ['Feiertagskatalog als Kalenderrolle', ({ manifest }) => {
    const item = manifest.artifacts.find(artifact => artifact.role === 'holidayCatalog');
    assert.ok(item);
    item.role = 'calendar';
  }],
  ['unbekannte Rolle', ({ manifest }) => { manifest.artifacts[0].role = 'unreviewedHolidayCalendar'; }],
  ['unbekannte Manifest-Hauptversion', ({ manifest }) => { manifest.formatVersion = '5.0.0'; }]
];
for (const [label, mutate] of invalidManifests) {
  test(`Format 4 weist ${label} vor Aktivierung ab`, async () => {
    await assert.rejects(new ReleaseValidator().validateProvider(await fixtureProvider(mutate)), /JSON-Schema|Hauptversion/);
  });
}

test('unbekannte fachliche Katalogfelder werden nicht ignoriert', async () => {
  await assert.rejects(new ReleaseValidator().validateProvider(await fixtureProvider(fixture => {
    catalog(fixture).activateAllCantons = true;
  })), /JSON-Schema/);
});

test('eine nicht auflösbare Fachkatalogquelle blockiert den gesamten Release', async () => {
  await assert.rejects(new ReleaseValidator().validateProvider(await fixtureProvider(fixture => {
    const rule = catalog(fixture).data.rules.find(item => item.id.startsWith('TI-'));
    assert.ok(rule);
    rule.source = 'SRC-NOT-AVAILABLE';
  })));
});

test('eine neu als Halbtag bezeichnete Berner Regel wird nicht operativ angewendet', async () => {
  await assert.rejects(new ReleaseValidator().validateProvider(await fixtureProvider(fixture => {
    const rule = catalog(fixture).data.rules.find(item => item.id === 'BE-CAL-HOL-NEW-YEAR');
    assert.ok(rule);
    rule.dayPortion = 'afternoonFromNoon';
  })));
});

function inconsistentCalendar(fixture: Fixture): void {
  const descriptor = fixture.manifest.artifacts.find(item => item.contentId === 'be-public-holidays');
  assert.ok(descriptor);
  const calendar = fixture.documents.get(descriptor.path) as {
    rules: Array<{ labels: { de: string } }>;
  };
  calendar.rules[0].labels.de = 'Nicht durch den Katalog gedeckter Feiertag';
}

test('eine korrekt gehashte, aber inkonsistente Kalenderprojektion wird abgewiesen', async () => {
  await assert.rejects(new ReleaseValidator().validateProvider(await fixtureProvider(inconsistentCalendar)));
});

test('Projektionsfehler erhalten atomar den alten verifizierten Aktivstand', async () => {
  const store = new MemoryValidatedReleaseStore();
  const service = new ReleaseService(store);
  const initial = await service.refresh(await fixtureProvider());
  const failed = await service.refresh(await fixtureProvider(inconsistentCalendar));
  assert.equal(initial.mode, 'network');
  assert.equal(failed.mode, 'fallback');
  assert.equal(failed.release.manifestSha256, initial.release.manifestSha256);
  assert.equal((await store.getActive())?.manifestSha256, initial.release.manifestSha256);
});

async function legacySpecialCatalog(fixture: Fixture): Promise<void> {
  const descriptor = fixture.manifest.artifacts.find(item => item.role === 'specialRegimeCatalog');
  assert.ok(descriptor);
  const oldCatalog = JSON.parse(await readFile(resolve(CANDIDATE_ROOT,
    '../2026-08-31-mvp-03-approved.1/special-regimes/vrpg-be.json'), 'utf8')) as Record<string, unknown>;
  fixture.documents.set(descriptor.path, oldCatalog);
  descriptor.contentId = String(oldCatalog.catalogId);
  descriptor.schemaId = String(oldCatalog.$schema);
  fixture.manifest.specialRegimeCatalogIds = [descriptor.contentId];
}

test('Format 4 weist einen Legacy-Spezialkatalog vor Aktivierung ab', async () => {
  await assert.rejects(new ReleaseValidator().validateProvider(await fixtureProvider(legacySpecialCatalog)),
    /Format-4-Spezialkatalog/);
});

test('Format 4 weist ein zusätzliches formal gültiges Rechtsprofil vor Aktivierung ab', async () => {
  await assert.rejects(new ReleaseValidator().validateProvider(await fixtureProvider(fixture => {
    const original = fixture.manifest.artifacts.find(item => item.contentId === 'stpo');
    assert.ok(original);
    const descriptor = { ...original, path: 'profiles/stpo-extra.json', contentId: 'stpo-extra' };
    fixture.documents.set(descriptor.path, { ...fixture.documents.get(original.path), profileId: 'stpo-extra' });
    fixture.manifest.artifacts.push(descriptor);
    fixture.manifest.profileIds.push('stpo-extra');
  })), /Format-4-Rechtsprofile/);
});

test('Format-4-Scopefehler überschreiben den vorherigen verifizierten Aktivstand nicht', async () => {
  const store = new MemoryValidatedReleaseStore();
  const service = new ReleaseService(store);
  const initial = await service.refresh(await fixtureProvider());
  const failed = await service.refresh(await fixtureProvider(legacySpecialCatalog));
  assert.equal(failed.mode, 'fallback');
  assert.match(failed.warning ?? '', /Format-4-Spezialkatalog/);
  assert.equal((await store.getActive())?.manifestSha256, initial.release.manifestSha256);
});

test('Katalog-Komponentenmajor und Deskriptor müssen übereinstimmen', async () => {
  await assert.rejects(new ReleaseValidator().validateProvider(await fixtureProvider(fixture => {
    const document = catalog(fixture);
    document.$schema = `${SCHEMAS}holiday-catalog-v2.schema.json`;
    document.formatVersion = '2.0.0';
  })), /JSON-Schema/);
});
