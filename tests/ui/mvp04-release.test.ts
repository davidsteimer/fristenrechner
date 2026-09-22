// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { mvp04CalculationData as approved, mvp04Release } from '../../src/release/mvp04ReleaseData';
import { ap18cCandidateCalculationData as candidate } from '../../src/release/ap18cCandidateData';
import { approvedMvp03CalculationData as previous } from '../../src/release/approvedMvp03Data';
import { calculationData as historicalTestData } from '../../src/ui/preview/data';
import { initialDefaults, sanitizeDefaults } from '../../src/ui/defaults';
import { authorityOptions, profilesForAuthority } from '../../src/ui/model';
import { resolveVrpgSelection, type VrpgSelectionState } from '../../src/ui/vrpgSelection';
import corpus from '../golden/candidates/ap17b-anwendbarkeit.json';
import approvedSpecialCatalog from '../../data/releases/2026-09-22-mvp-04-approved.1/special-regimes/vrpg-be.json';
import candidateSpecialCatalog from '../../data/releases/2026-09-22-ap18c-candidate.1/special-regimes/vrpg-be.json';
import { translate } from '../../src/ui/i18n';

test('MVP 0.4 loads the approved format-4 release including the complete holiday catalog', () => {
  assert.equal(approved.releaseId, '2026-09-22-mvp-04-approved.1');
  assert.equal(approved.formatVersion, '4.0.0');
  assert.equal(mvp04Release.artifacts.length, 9);
  assert.equal(approved.holidayCatalogs.size, 1);
  assert.equal(approved.holidayCatalogs.get('ch-holiday-catalog')?.data.rules.length, 479);
  assert.deepEqual(approved.profiles, candidate.profiles);
  assert.deepEqual(approved.calendarRuleSets, candidate.calendarRuleSets);
  assert.deepEqual([...approved.specialRegimeCatalogs.keys()], [...candidate.specialRegimeCatalogs.keys()]);
  const { review, scope, ...approvedSpecialContract } = approvedSpecialCatalog;
  const { review: candidateReview, scope: candidateScope, ...candidateSpecialContract } = candidateSpecialCatalog;
  assert.deepEqual(approvedSpecialContract, candidateSpecialContract);
  assert.equal(review.status, 'verified');
  assert.equal(review.reviewedBy, 'David Steimer');
  assert.equal(review.reviewedOn, '2026-09-22');
  assert.match(review.basis, /keine erneute juristische Quellenprüfung/);
  assert.notDeepEqual(review, candidateReview);
  assert.notDeepEqual(scope, candidateScope);
  assert.match(scope.de, /MVP 0\.4/);
  assert.match(scope.fr, /MVP 0\.4/);
  assert.deepEqual(approved.holidayCatalogs, candidate.holidayCatalogs);
});

test('normal web and preview entry points select MVP 0.4 while candidates require an explicit parameter', async () => {
  const preview = await readFile('src/ui/preview/main.tsx', 'utf8');
  const publicEntry = await readFile('src/public-app/main.tsx', 'utf8');
  assert.match(preview, /import \{ mvp04CalculationData \} from '\.\.\/\.\.\/release\/mvp04ReleaseData'/);
  assert.match(preview, /candidate === 'ap18c' \? ap18cCandidateCalculationData/);
  assert.match(preview, /candidate === 'ap17c' \? ap17cCandidateCalculationData : mvp04CalculationData/);
  assert.doesNotMatch(preview, /from '\.\/data'/);
  assert.match(publicEntry, /import \{ mvp04CalculationData \} from '\.\.\/release\/mvp04ReleaseData'/);
  assert.match(publicEntry, /<FristenrechnerApp data=\{mvp04CalculationData\}/);
  assert.doesNotMatch(publicEntry, /ap18c|ap17c|qaPreset|approvedMvp03/i);
});

test('release promotion does not enable additional cantons, procedural profiles or unmodelled VRPG mappings', () => {
  assert.deepEqual([...approved.calendarRuleSets.keys()].sort(), ['be-public-holidays', 'ch-federal-calendar']);
  assert.deepEqual([...approved.profiles.keys()].sort(), ['bgg', 'stpo', 'vrpg-be', 'vwvg', 'zpo']);
  assert.deepEqual(authorityOptions(approved), authorityOptions(candidate));
  for (const authority of authorityOptions(approved)) {
    assert.deepEqual(profilesForAuthority(approved, authority.code), profilesForAuthority(candidate, authority.code));
  }
  assert.equal(corpus.mappings.filter(mapping =>
    resolveVrpgSelection(approved, mapping.selection as VrpgSelectionState).kind === 'special').length, 16);
  for (const mapping of corpus.mappings) {
    const selection = mapping.selection as VrpgSelectionState;
    assert.deepEqual(resolveVrpgSelection(approved, selection), resolveVrpgSelection(candidate, selection));
    if (mapping.disposition === 'blocked') assert.equal(resolveVrpgSelection(approved, selection).kind, 'unavailable');
  }
});

test('approved MVP 0.4 has no candidate marker and preserves the historical MVP 0.3 regression fixture', async () => {
  const source = await readFile('src/ui/FristenrechnerApp.tsx', 'utf8');
  assert.match(source, /data\.releaseId\.includes\('-ap17c-candidate\.'\)/);
  assert.match(source, /data\.releaseId\.includes\('-ap18c-candidate\.'\)/);
  assert.equal(approved.releaseId.includes('-ap17c-candidate.'), false);
  assert.equal(approved.releaseId.includes('-ap18c-candidate.'), false);
  assert.equal(historicalTestData, previous);
  assert.equal(previous.releaseId, '2026-08-31-mvp-03-approved.1');
  assert.equal(previous.formatVersion, '3.0.0');
  assert.equal(previous.holidayCatalogs.size, 0);
});

test('stable selections and defaults survive candidate-to-release promotion without carrying case facts', () => {
  assert.deepEqual(initialDefaults(approved), initialDefaults(candidate));
  for (const mapping of corpus.mappings) {
    const input = {
      ...initialDefaults(candidate), profileId: 'vrpg-be',
      vrpgSelection: mapping.selection, inputDate: '2026-09-22',
      reference: 'PRIVATE-REFERENCE', vrpgContext: { procedureStartDate: '2026-01-01' }
    };
    const releaseDefaults = sanitizeDefaults(approved, input);
    assert.deepEqual(releaseDefaults, sanitizeDefaults(candidate, input));
    assert.equal('inputDate' in releaseDefaults, false);
    assert.equal('reference' in releaseDefaults, false);
    assert.equal('vrpgContext' in releaseDefaults, false);
  }
});

test('qualified scope explanations are release-neutral while candidate warnings remain explicit', () => {
  for (const locale of ['de', 'fr'] as const) {
    for (const key of ['vrpg.caseCoverage', 'vrpg.anchorExplanation']) {
      assert.doesNotMatch(translate(locale, key), /Kandidat|candidat/i);
      assert.notEqual(translate(locale, key), key);
    }
  }
  assert.match(translate('de', 'app.candidate'), /AP18C.*Prüfkandidat/);
  assert.match(translate('fr', 'app.candidate'), /AP18C.*Candidat/);
});
