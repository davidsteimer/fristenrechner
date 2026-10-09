// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { ap18cCandidateCalculationData as candidate } from '../../src/release/ap18cCandidateData';
import { ap17cCandidateCalculationData as ap17c } from '../../src/release/ap17cCandidateData';
import { approvedMvp03CalculationData as approved } from '../../src/release/approvedMvp03Data';
import { mvp04CalculationData as historicalMvp04 } from '../../src/release/mvp04ReleaseData';
import corpus from '../golden/candidates/ap17b-anwendbarkeit.json';
import { resolveVrpgSelection, type VrpgSelectionState } from '../../src/ui/vrpgSelection';
import { authorityOptions, profilesForAuthority } from '../../src/ui/model';
import { initialDefaults } from '../../src/ui/defaults';
import { translate } from '../../src/ui/i18n';

test('AP18C preview remains an explicit historical candidate separate from the approved MVP 0.4 fixture', async () => {
  assert.notEqual(historicalMvp04, candidate);
  assert.equal(historicalMvp04.releaseId, '2026-09-22-mvp-04-approved.1');
  assert.equal(approved.releaseId, '2026-08-31-mvp-03-approved.1');
  assert.equal(candidate.releaseId, '2026-09-22-ap18c-candidate.1');
  assert.equal(candidate.formatVersion, '4.0.0');
  assert.equal(candidate.holidayCatalogs.size, 1);
  assert.equal(candidate.holidayCatalogs.get('ch-holiday-catalog')?.data.rules.length, 479);
  assert.match(await readFile('src/ui/preview/main.tsx', 'utf8'), /candidate === 'ap18c'/);
  const publicEntry = await readFile('src/public-app/main.tsx', 'utf8');
  assert.doesNotMatch(publicEntry, /ap18c|ap17c/i);
});

test('AP18C adds the catalog but not canton choices, operative rules or extra legal profiles', () => {
  assert.deepEqual(candidate.profiles, ap17c.profiles);
  assert.deepEqual(candidate.calendarRuleSets, ap17c.calendarRuleSets);
  assert.deepEqual(candidate.specialRegimeCatalogs, ap17c.specialRegimeCatalogs);
  assert.deepEqual([...candidate.calendarRuleSets.keys()].sort(), ['be-public-holidays', 'ch-federal-calendar']);
  assert.deepEqual([...candidate.profiles.keys()].sort(), ['bgg', 'stpo', 'vrpg-be', 'vwvg', 'zpo']);
  assert.deepEqual(authorityOptions(candidate), authorityOptions(ap17c));
  for (const authority of authorityOptions(candidate)) {
    assert.deepEqual(profilesForAuthority(candidate, authority.code), profilesForAuthority(ap17c, authority.code));
  }
  assert.deepEqual(initialDefaults(candidate), initialDefaults(ap17c));
});
test('AP18C does not accidentally unlock the four unmodelled AP17 collection paths', () => {
  for (const mapping of corpus.mappings) {
    const selection = mapping.selection as VrpgSelectionState;
    assert.deepEqual(resolveVrpgSelection(candidate, selection), resolveVrpgSelection(ap17c, selection));
    if (mapping.disposition === 'blocked') assert.equal(resolveVrpgSelection(candidate, selection).kind, 'unavailable');
  }
});

test('AP18C preview explicitly wires a DE/FR warning that is absent from the approved release', async () => {
  // Fluent UI's ESM directory imports prevent direct Node SSR. This source/label
  // contract supplements, but does not replace, the recorded real-browser check.
  const source = await readFile('src/ui/FristenrechnerApp.tsx', 'utf8');
  assert.match(source, /data\.releaseId\.includes\('-ap18c-candidate\.'\)\s*&&\s*\([\s\S]*?translate\(locale, 'app\.candidate'\)/);
  assert.equal(candidate.releaseId.includes('-ap18c-candidate.'), true);
  assert.equal(approved.releaseId.includes('-ap18c-candidate.'), false);
  assert.match(translate('de', 'app.candidate'), /AP18C.*Lokaler Prüfkandidat.*Nicht für fristgebundene Handlungen/);
  assert.match(translate('fr', 'app.candidate'), /AP18C.*Candidat de test local.*Ne pas utiliser/);
});
