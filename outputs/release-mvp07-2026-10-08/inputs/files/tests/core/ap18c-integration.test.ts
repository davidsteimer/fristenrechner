// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  calculateDeadline, calculateSpecialDeadline, calculateQualifiedSpecialDeadline,
  createCalculationData, resolveCalendar, type ValidatedReleaseLike,
  type ValidatedReleaseArtifactLike, type QualifiedDeadlineInput
} from '../../src/core';
import { ap17cCandidateCalculationData as previous } from '../../src/release/ap17cCandidateData';
import { approvedMvp03CalculationData as approved } from '../../src/release/approvedMvp03Data';
import { calculationInput, loadGoldenSuite } from './fixtures';
import { specialGoldenSuite } from './specialFixtures';
import corpus from '../golden/candidates/ap17b-anwendbarkeit.json';

const directory = path.join(process.cwd(), 'data/releases/2026-09-22-ap18c-candidate.1');
const json = (relative: string): unknown => JSON.parse(readFileSync(path.join(directory, relative), 'utf8'));
const manifest = json('manifest.json') as {
  releaseId: string; formatVersion: string; coverage: { from: string; to: null };
  profileIds: string[]; calendarIds: string[]; specialRegimeCatalogIds: string[]; holidayCatalogIds: string[];
  artifacts: Array<ValidatedReleaseArtifactLike['descriptor'] & { path: string }>;
};
const release: ValidatedReleaseLike = {
  releaseId: manifest.releaseId, formatVersion: manifest.formatVersion,
  coverageFrom: manifest.coverage.from, coverageTo: manifest.coverage.to,
  profileIds: manifest.profileIds, calendarIds: manifest.calendarIds,
  specialRegimeCatalogIds: manifest.specialRegimeCatalogIds, holidayCatalogIds: manifest.holidayCatalogIds,
  artifacts: manifest.artifacts.map(descriptor => ({ descriptor, parsed: json(descriptor.path) }))
};
const data = createCalculationData(release);
const normaliseReleaseIdentity = (value: unknown): unknown => JSON.parse(JSON.stringify(value,
  (key, item: unknown) => key === 'releaseId' ? '<release-identity>' : item));

test('Format 4 carries the entire catalog but only the approved operative IDs', () => {
  assert.equal(data.formatVersion, '4.0.0');
  assert.equal(data.coverage.to, null);
  assert.deepEqual([...data.holidayCatalogs.keys()], ['ch-holiday-catalog']);
  assert.equal(data.holidayCatalogs.get('ch-holiday-catalog')?.data.rules.length, 479);
  assert.deepEqual([...data.profiles.keys()].sort(), [...previous.profiles.keys()].sort());
  assert.deepEqual([...data.calendarRuleSets.keys()].sort(), ['be-public-holidays', 'ch-federal-calendar']);
  assert.deepEqual([...data.specialRegimeCatalogs.keys()], [...previous.specialRegimeCatalogs.keys()]);
  assert.deepEqual(data.calendarRuleSets, previous.calendarRuleSets);
  assert.deepEqual(data.profiles, previous.profiles);
  assert.deepEqual(data.specialRegimeCatalogs, previous.specialRegimeCatalogs);
});

test('existing approved data has no catalog and remains independently usable', () => {
  assert.equal(approved.formatVersion, '3.0.0');
  assert.equal(approved.holidayCatalogs.size, 0);
  assert.equal(previous.holidayCatalogs.size, 0);
});

for (const reference of [...loadGoldenSuite('approved').cases, ...loadGoldenSuite('unresolved').cases]) {
  test(`${reference.caseId}: Format 4 preserves ordinary results and complete traces`, () => {
    const input = calculationInput(reference);
    assert.deepEqual(normaliseReleaseIdentity(calculateDeadline(input, data)),
      normaliseReleaseIdentity(calculateDeadline(input, previous)));
  });
}

for (const reference of specialGoldenSuite.cases) {
  test(`${reference.caseId}: Format 4 preserves the approved special-regime result`, () => {
    const input = { profileId: reference.profileId, ...reference.input };
    assert.deepEqual(normaliseReleaseIdentity(calculateSpecialDeadline(input, data)),
      normaliseReleaseIdentity(calculateSpecialDeadline(input, previous)));
  });
}

for (const reference of corpus.referenceCases) {
  test(`${reference.id}: Format 4 preserves the AP17 qualification and negative boundaries`, () => {
    const input = { mappingId: reference.mappingId, ...reference.input } as QualifiedDeadlineInput;
    assert.deepEqual(normaliseReleaseIdentity(calculateQualifiedSpecialDeadline(input, data)),
      normaliseReleaseIdentity(calculateQualifiedSpecialDeadline(input, previous)));
  });
}

for (const year of [2026, 2027, 2028, 2100, 2400]) {
  test(`${year}: operative calendars, suspension periods and evidence remain identical`, () => {
    const range = { from: `${year}-01-01`, to: `${year}-12-31` };
    for (const id of ['ch-federal-calendar', 'be-public-holidays']) {
      const actual = resolveCalendar(data, id, range);
      const before = resolveCalendar(previous, id, range);
      assert.ok(actual && before);
      // Maps require direct comparisons, JSON would hide their entries.
      assert.deepEqual(actual.holidaysByDate, before.holidaysByDate);
      assert.deepEqual(actual.suspensionSets, before.suspensionSets);
      assert.deepEqual(normaliseReleaseIdentity(actual.generation), normaliseReleaseIdentity(before.generation));
    }
  });
}

test('catalog presence does not make additional cantonal calendars resolvable', () => {
  for (const id of ['ch-ag', 'ag-public-holidays', 'ti-public-holidays', 'gr-public-holidays', 'ch-holiday-catalog']) {
    assert.equal(resolveCalendar(data, id, { from: '2026-01-01', to: '2026-12-31' }), undefined);
  }
});

test('Format 4 requires its catalog ID and the catalog artifact', () => {
  assert.throws(() => createCalculationData({ ...release, holidayCatalogIds: [] }), /Feiertagskatalog/);
  const { holidayCatalogIds: _unused, ...missingId } = release;
  assert.throws(() => createCalculationData(missingId), /Feiertagskatalog/);
  assert.throws(() => createCalculationData({ ...release,
    artifacts: release.artifacts.filter(artifact => artifact.descriptor.role !== 'holidayCatalog') }), /Feiertagskatalog/);
});

test('duplicate catalogs cannot be silently replaced in the map', () => {
  const catalog = release.artifacts.find(artifact => artifact.descriptor.role === 'holidayCatalog');
  assert.ok(catalog);
  assert.throws(() => createCalculationData({ ...release, artifacts: [...release.artifacts, catalog] }), /Doppelter Feiertagskatalog/);
});

test('major-version downgrade cannot smuggle a catalog through the old calendar fallback', () => {
  assert.throws(() => createCalculationData({ ...release, formatVersion: '3.0.0' }), /Manifestformat 4/);
  const { holidayCatalogIds: _unused, ...noId } = release;
  assert.throws(() => createCalculationData({ ...noId, formatVersion: '3.0.0' }), /Manifestformat 4/);
});

test('unknown roles and unsupported format versions are rejected explicitly', () => {
  const foreign = { descriptor: { role: 'other', contentId: 'other' },
    parsed: { dataKind: 'other', catalogId: 'other' } } as unknown as ValidatedReleaseArtifactLike;
  assert.throws(() => createCalculationData({ ...release, artifacts: [...release.artifacts, foreign] }), /Unbekannte Artefaktrolle/);
  for (const formatVersion of ['0.0.0', '4.0.1', '4-invalid', '6.0.0']) {
    assert.throws(() => createCalculationData({ ...release, formatVersion }), /format|Hauptversion/i);
  }
});

test('Format 4 cannot introduce a new procedural profile without a new consumer contract', () => {
  const copy = structuredClone(release) as unknown as {
    profileIds: string[]; artifacts: Array<{ descriptor: { role: string; contentId: string }; parsed: Record<string, unknown> }>;
  };
  const profile = structuredClone(copy.artifacts.find(artifact => artifact.descriptor.role === 'legalProfile'));
  assert.ok(profile);
  profile.descriptor.contentId = 'vrpg-ag';
  profile.parsed.profileId = 'vrpg-ag';
  copy.profileIds.push('vrpg-ag');
  copy.artifacts.push(profile);
  assert.throws(() => createCalculationData(copy as unknown as ValidatedReleaseLike), /Format-4-Rechtsprofile/);
});

test('Format 4 needs the confirmed AP17 catalog contract', () => {
  const copy = structuredClone(release);
  const special = copy.artifacts.find(artifact => artifact.descriptor.role === 'specialRegimeCatalog');
  assert.ok(special);
  (special.parsed as { formatVersion: string }).formatVersion = '2.0.0';
  assert.throws(() => createCalculationData(copy), /AP17-Spezialkatalog/);
});

test('projection inconsistencies reject the complete calculation data', () => {
  const copy = structuredClone(release);
  const calendar = copy.artifacts.find(artifact => artifact.descriptor.contentId === 'be-public-holidays');
  assert.ok(calendar);
  const document = calendar.parsed as { rules: Array<{ labels: { de: string } }> };
  assert.ok(document.rules[0]);
  document.rules[0].labels.de = 'Altered operational holiday';
  assert.throws(() => createCalculationData(copy));
});
