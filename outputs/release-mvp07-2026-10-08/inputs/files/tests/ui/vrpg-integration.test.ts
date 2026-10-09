// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { calculateDeadline, calculateSpecialDeadline } from '../../src/core';
import type { SpecialDeadlineInput } from '../../src/core';
import {
  DEFAULTS_STORAGE_KEY,
  initialDefaults,
  loadDefaults,
  sanitizeDefaults,
  saveDefaults,
  type StorageLike
} from '../../src/ui/defaults';
import {
  createCalculationInput,
  createSpecialCalculationInput,
  isGeneralCalculation,
  specialCatalogForProfile,
  specialRegimeOptions,
  type CalculatorFormState
} from '../../src/ui/model';
import { calculationData as data } from '../../src/ui/preview/data';
import {
  EMPTY_VRPG_SELECTION,
  resolveVrpgSelection,
  selectionFromLegacy,
  type VrpgSelectionState
} from '../../src/ui/vrpgSelection';

interface GoldenCase {
  readonly caseId: string;
  readonly profileId: string;
  readonly input: Omit<SpecialDeadlineInput, 'profileId'>;
  readonly expected: {
    readonly outcome: 'calculated' | 'manualReview' | 'blocked';
    readonly finalDeadline?: { readonly date: string };
  };
}

const goldenCases = (JSON.parse(readFileSync(join(
  process.cwd(), 'tests/golden/approved/vrpg-be-special-cases.json'
), 'utf8')) as { readonly cases: readonly GoldenCase[] }).cases;
const catalog = specialCatalogForProfile(data, 'vrpg-be');
assert.ok(catalog);
const approvedPairs = specialRegimeOptions(data, 'vrpg-be')
  .filter(option => option.selectable)
  .flatMap(option => option.regime.deadlineDefinitionIds.map(definitionId => ({
    regimeId: option.regime.regimeId,
    definitionId
  })));

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  public removeItem(key: string): void {
    this.values.delete(key);
  }
}

function formState(goldenCase: GoldenCase): CalculatorFormState {
  return {
    authorityCode: 'BE',
    profileId: goldenCase.profileId,
    inputDate: goldenCase.input.dateValues.eventDate ?? '2026-09-04',
    deadlineDays: String(goldenCase.input.integerValues.deadlineDays ?? 10),
    selectors: { deliveryMethod: 'otherLegallyRelevantDate' },
    calendarId: 'be-public-holidays',
    calendarOverrideReason: '',
    additionalHolidayAnchor: '',
    holidayAnchorConfirmed: false,
    deliveryFictionConfirmed: false,
    specialLawChecked: true,
    specialRegimeId: goldenCase.input.regimeId,
    specialDefinitionId: goldenCase.input.ruleId,
    vrpgSelection: selectionFromLegacy(data, goldenCase.input.regimeId, goldenCase.input.ruleId),
    specialDateValues: goldenCase.input.dateValues,
    specialLocalTimeValues: goldenCase.input.localTimeValues,
    specialIntegerValues: Object.fromEntries(
      Object.entries(goldenCase.input.integerValues).map(([key, value]) => [key, String(value)])
    ),
    specialOverrideConfirmations: goldenCase.input.overrideConfirmations
  };
}

function legacyDefaults(version: 1 | 2, regimeId: string, definitionId: string): unknown {
  return {
    ...initialDefaults(data),
    version,
    profileId: 'vrpg-be',
    specialRegimeId: regimeId,
    specialDefinitionId: definitionId,
    selectors: { deliveryMethod: 'otherLegallyRelevantDate', specialLawStatus: 'noKnownOverride' },
    // Version 1 and 2 must migrate the actual legacy pair, not trust unrelated new fields.
    vrpgSelection: { area: 'general', law: '', action: '', stage: '' }
  };
}

function assertUnresolved(defaults: ReturnType<typeof sanitizeDefaults>): void {
  assert.equal(defaults.version, 3);
  assert.deepEqual(defaults.vrpgSelection, EMPTY_VRPG_SELECTION);
  assert.equal(defaults.specialRegimeId, '');
  assert.equal(defaults.specialDefinitionId, '');
  assert.equal(resolveVrpgSelection(data, defaults.vrpgSelection).kind, 'incomplete');
}

describe('VRPG-Auswahl: Integration mit freigegebenem Rechenkern', () => {
  it('prüft alle bisherigen 19 Regime und 21 exakten Regime-Definitions-Paare', () => {
    assert.equal(new Set(approvedPairs.map(pair => pair.regimeId)).size, 19);
    assert.equal(approvedPairs.length, 21);
    assert.ok(goldenCases.some(item => item.input.regimeId === 'vrpg-be-general'));
  });

  for (const goldenCase of goldenCases) {
    it(`${goldenCase.caseId} bleibt über den kontrollierten Auswahlzustand unverändert berechenbar`, () => {
      const state = formState(goldenCase);
      assert.ok(state.vrpgSelection);
      const resolved = resolveVrpgSelection(data, state.vrpgSelection);
      assert.equal(resolved.regimeId, goldenCase.input.regimeId);
      assert.equal(resolved.definitionId, goldenCase.input.ruleId);

      if (goldenCase.input.regimeId === 'vrpg-be-general') {
        assert.equal(isGeneralCalculation(data, state), true);
        assert.equal(createSpecialCalculationInput(data, state), undefined);
        const result = calculateDeadline(createCalculationInput(data, state), data);
        assert.equal(result.outcome, goldenCase.expected.outcome);
        assert.equal(result.outcome === 'calculated' ? result.finalEnd : undefined,
          goldenCase.expected.finalDeadline?.date);
        return;
      }

      assert.equal(isGeneralCalculation(data, state), false);
      // A political selection must never become a generic VRPG calculation.
      assert.equal(calculateDeadline(createCalculationInput(data, state), data).outcome, 'blocked');
      const input = createSpecialCalculationInput(data, state);
      assert.ok(input);
      const result = calculateSpecialDeadline(input, data);
      assert.equal(result.outcome, goldenCase.expected.outcome);
      assert.equal(result.finalDeadline?.date, goldenCase.expected.finalDeadline?.date);
      assert.deepEqual(result, calculateSpecialDeadline({ profileId: goldenCase.profileId, ...goldenCase.input }, data));
    });
  }

  const staleSelections: readonly { readonly label: string; readonly selection: VrpgSelectionState }[] = [
    { label: 'leerer Bereich', selection: EMPTY_VRPG_SELECTION },
    { label: 'Sozialrecht ohne Spezialerlass', selection: { area: 'social', law: '', action: '', stage: '' } },
    { label: 'IV-Beschwerde', selection: { area: 'social', law: 'ivg', action: 'appeal', stage: '' } },
    { label: 'AHV-Verfahren beim Gericht', selection: { area: 'social', law: 'ahvg', action: 'ongoing', stage: 'court' } },
    { label: 'Beschaffungsbeschwerde', selection: { area: 'procurement', law: 'ivob', action: 'appeal', stage: '' } },
    { label: 'Beschaffungsverfahren in der Verwaltung', selection: { area: 'procurement', law: 'ivob', action: 'ongoing', stage: 'administration' } },
    { label: 'allgemein mit unzulässigem Spezialerlass', selection: { area: 'general', law: 'ivg', action: '', stage: '' } },
    { label: 'Politische Rechte ohne konkrete Situation', selection: { area: 'political', law: 'cantonal', action: '', stage: '' } },
    { label: 'falsche Ebene der politischen Situation', selection: { area: 'political', law: 'communal', action: 'prg-be-68-grand-council-nomination::PRGBE-SPEC-OFFSET-068', stage: '' } }
  ];
  const baseCase = goldenCases.find(item => item.input.regimeId === 'vrpg-be-general');
  assert.ok(baseCase);
  const politicalCase = goldenCases.find(item => item.input.regimeId !== 'vrpg-be-general');
  assert.ok(politicalCase);

  for (const stale of staleSelections) {
    for (const original of [baseCase, politicalCase]) {
      it(`blockiert ${stale.label} auch mit alter ${original.input.regimeId}-ID über beide Adapter`, () => {
        const state = { ...formState(original), vrpgSelection: stale.selection };
        assert.equal(isGeneralCalculation(data, state), false);
        assert.equal(createSpecialCalculationInput(data, state), undefined);
        const generic = calculateDeadline(createCalculationInput(data, state), data);
        assert.equal(generic.outcome, 'blocked');
      });
    }
  }

  it('blockiert eine gültige politische Auswahl mit einer anderen weiterhin gültigen Regime-ID', () => {
    const other = approvedPairs.find(pair => pair.regimeId !== 'vrpg-be-general'
      && pair.regimeId !== politicalCase.input.regimeId);
    assert.ok(other);
    const state = {
      ...formState(politicalCase),
      specialRegimeId: other.regimeId,
      specialDefinitionId: other.definitionId
    };
    assert.equal(isGeneralCalculation(data, state), false);
    assert.equal(createSpecialCalculationInput(data, state), undefined);
    assert.equal(calculateDeadline(createCalculationInput(data, state), data).outcome, 'blocked');
  });

  it('blockiert Allgemein mit veralteter politischer Regime-ID und falscher Definition', () => {
    const generalSelection = selectionFromLegacy(data, baseCase.input.regimeId, baseCase.input.ruleId);
    for (const pair of [
      { regimeId: politicalCase.input.regimeId, definitionId: politicalCase.input.ruleId },
      { regimeId: baseCase.input.regimeId, definitionId: politicalCase.input.ruleId }
    ]) {
      const state: CalculatorFormState = {
        ...formState(baseCase),
        vrpgSelection: generalSelection,
        specialRegimeId: pair.regimeId,
        specialDefinitionId: pair.definitionId
      };
      assert.equal(isGeneralCalculation(data, state), false);
      assert.equal(createSpecialCalculationInput(data, state), undefined);
      assert.equal(calculateDeadline(createCalculationInput(data, state), data).outcome, 'blocked');
    }
  });
});

describe('VRPG-Auswahl: sichere Defaultmigration und Datenminimierung', () => {
  for (const version of [1, 2] as const) {
    for (const pair of approvedPairs) {
      it(`migriert Version ${version}: ${pair.regimeId} / ${pair.definitionId} exakt`, () => {
        const loaded = sanitizeDefaults(data, legacyDefaults(version, pair.regimeId, pair.definitionId));
        assert.equal(loaded.version, 3);
        assert.equal(loaded.specialRegimeId, pair.regimeId);
        assert.equal(loaded.specialDefinitionId, pair.definitionId);
        const resolved = resolveVrpgSelection(data, loaded.vrpgSelection);
        assert.equal(resolved.regimeId, pair.regimeId);
        assert.equal(resolved.definitionId, pair.definitionId);
      });
    }

    const unavailable = catalog.regimes.filter(regime =>
      !approvedPairs.some(pair => pair.regimeId === regime.regimeId));
    for (const regime of unavailable) {
      it(`Version ${version}: ${regime.regimeId} erhält keinen stillen allgemeinen Fallback`, () => {
        assertUnresolved(sanitizeDefaults(data, legacyDefaults(
          version, regime.regimeId, regime.deadlineDefinitionIds[0] ?? ''
        )));
      });
    }

    it(`Version ${version}: leere, entfernte und falsche Paare bleiben ungeklärt`, () => {
      for (const pair of [
        { regimeId: '', definitionId: '' },
        { regimeId: 'removed-regime', definitionId: '' },
        { regimeId: 'vrpg-be-general', definitionId: 'removed-definition' },
        { regimeId: 'prg-be-68-grand-council-nomination', definitionId: 'PRGBE-SPEC-OFFSET-101' },
        { regimeId: 'prg-be-117-prefect-nomination', definitionId: '' },
        { regimeId: 'prg-be-121-prefect-second-ballot', definitionId: '' },
        { regimeId: 'prg-be-117-prefect-nomination', definitionId: 'PRGBE-SPEC-TUESDAY-121' }
      ]) {
        assertUnresolved(sanitizeDefaults(data, legacyDefaults(version, pair.regimeId, pair.definitionId)));
      }
    });

    it(`Version ${version}: ergänzt nur eindeutig fehlende Definitionen`, () => {
      for (const regime of catalog.regimes.filter(item => item.deadlineDefinitionIds.length === 1
        && approvedPairs.some(pair => pair.regimeId === item.regimeId))) {
        const loaded = sanitizeDefaults(data, legacyDefaults(version, regime.regimeId, ''));
        assert.equal(loaded.specialRegimeId, regime.regimeId);
        assert.equal(loaded.specialDefinitionId, regime.deadlineDefinitionIds[0]);
      }
    });
  }

  it('Version 3: vertraut dem leeren neuen Auswahlzustand statt einer alten allgemeinen ID', () => {
    const loaded = sanitizeDefaults(data, {
      ...initialDefaults(data), profileId: 'vrpg-be',
      specialRegimeId: 'vrpg-be-general', specialDefinitionId: 'VRPGBE-SPEC-REL-GENERAL-001',
      vrpgSelection: EMPTY_VRPG_SELECTION
    });
    assertUnresolved(loaded);
  });

  it('Version 3: verwirft abhängige Felder unter einem leeren oder unbekannten Bereich', () => {
    for (const area of ['', 'not-a-real-area']) {
      assertUnresolved(sanitizeDefaults(data, {
        ...initialDefaults(data), profileId: 'vrpg-be',
        specialRegimeId: 'vrpg-be-general', specialDefinitionId: 'VRPGBE-SPEC-REL-GENERAL-001',
        vrpgSelection: { area, law: 'ivg', action: 'ongoing', stage: 'court' }
      }));
    }
  });

  it('Version 3: behält unfertige und noch nicht freigegebene Auswahlwege ohne Rechenfreigabe', () => {
    const selections: readonly VrpgSelectionState[] = [
      { area: 'social', law: '', action: '', stage: '' },
      { area: 'social', law: 'ivg', action: '', stage: '' },
      { area: 'social', law: 'ivg', action: 'ongoing', stage: '' },
      { area: 'social', law: 'ivg', action: 'ongoing', stage: 'court' },
      { area: 'procurement', law: 'ivob', action: 'appeal', stage: '' },
      { area: 'political', law: 'communal', action: '', stage: '' }
    ];
    for (const selection of selections) {
      const defaults = sanitizeDefaults(data, {
        ...initialDefaults(data), profileId: 'vrpg-be',
        specialRegimeId: 'vrpg-be-general', specialDefinitionId: 'VRPGBE-SPEC-REL-GENERAL-001',
        vrpgSelection: selection
      });
      assert.deepEqual(defaults.vrpgSelection, selection);
      assert.equal(defaults.specialRegimeId, '');
      assert.equal(defaults.specialDefinitionId, '');
      const storage = new MemoryStorage();
      assert.equal(saveDefaults(storage, defaults), true);
      assert.deepEqual(loadDefaults(data, storage), defaults);
    }
  });

  it('Version 3: bereinigt falsche Gesetz-/Handlungs-/Stadiumkombinationen nach Abhängigkeit', () => {
    const examples: readonly { readonly raw: VrpgSelectionState; readonly expected: VrpgSelectionState }[] = [
      {
        raw: { area: 'social', law: 'ivob', action: 'ongoing', stage: 'court' },
        expected: { area: 'social', law: '', action: '', stage: '' }
      },
      {
        raw: { area: 'social', law: 'ivg', action: 'objection', stage: 'court' },
        expected: { area: 'social', law: 'ivg', action: '', stage: '' }
      },
      {
        raw: { area: 'social', law: 'ivg', action: 'appeal', stage: 'administration' },
        expected: { area: 'social', law: 'ivg', action: 'appeal', stage: '' }
      },
      {
        raw: { area: 'political', law: 'communal', action: 'prg-be-68-grand-council-nomination::PRGBE-SPEC-OFFSET-068', stage: 'court' },
        expected: { area: 'political', law: 'communal', action: '', stage: '' }
      }
    ];
    for (const example of examples) {
      const loaded = sanitizeDefaults(data, {
        ...initialDefaults(data), profileId: 'vrpg-be', vrpgSelection: example.raw
      });
      assert.deepEqual(loaded.vrpgSelection, example.expected);
      assert.equal(loaded.specialRegimeId, '');
      assert.equal(loaded.specialDefinitionId, '');
    }
  });

  it('verwirft VRPG-Unterauswahlen bei anderem Profil oder unvereinbarer Bundesbehörde', () => {
    for (const scenario of [
      { authorityCode: 'CH', profileId: 'vrpg-be' },
      { authorityCode: 'BE', profileId: 'stpo' },
      { authorityCode: 'BE', profileId: 'zpo' },
      { authorityCode: 'CH', profileId: 'bgg' }
    ]) {
      const loaded = sanitizeDefaults(data, {
        ...initialDefaults(data), ...scenario,
        vrpgSelection: { area: 'social', law: 'ivg', action: 'appeal', stage: '' },
        specialRegimeId: 'vrpg-be-general', specialDefinitionId: 'VRPGBE-SPEC-REL-GENERAL-001'
      });
      assert.notEqual(loaded.profileId, 'vrpg-be');
      assert.deepEqual(loaded.vrpgSelection, EMPTY_VRPG_SELECTION);
      assert.equal(loaded.specialRegimeId, '');
      assert.equal(loaded.specialDefinitionId, '');
    }
  });

  it('speichert auch bei überzähligen Laufzeitfeldern weder Falldaten noch Bestätigungen', () => {
    const storage = new MemoryStorage();
    const defaults = {
      ...initialDefaults(data), profileId: 'vrpg-be',
      vrpgSelection: {
        area: 'social' as const, law: 'ivg', action: 'ongoing', stage: 'court',
        inputDate: '2026-09-16', reference: 'GEHEIME-AKTENREFERENZ', confirmed: true
      },
      inputDate: '2026-09-16',
      reference: 'GEHEIME-AKTENREFERENZ',
      specialDateValues: { eventDate: '2026-09-16' },
      specialLocalTimeValues: { time: '12:00' },
      specialIntegerValues: { duration: '99' },
      specialOverrideConfirmations: ['OVR-PRG111A-CROSSREF'],
      specialLawChecked: true,
      deliveryFictionConfirmed: true,
      holidayAnchorConfirmed: true,
      calendarOverrideReason: 'VERTRAULICHE-BEGRUENDUNG'
    };
    assert.equal(saveDefaults(storage, defaults), true);
    const serialized = storage.getItem(DEFAULTS_STORAGE_KEY);
    assert.ok(serialized);
    assert.doesNotMatch(serialized,
      /2026-09-16|GEHEIME-AKTENREFERENZ|VERTRAULICHE-BEGRUENDUNG|OVR-PRG111A-CROSSREF|inputDate|reference|confirmed|Confirmed|specialDateValues|specialLocalTimeValues|specialIntegerValues|specialLawChecked|calendarOverrideReason/);
    const raw = JSON.parse(serialized) as Record<string, unknown>;
    assert.deepEqual(Object.keys(raw).sort(), [
      'version', 'locale', 'authorityCode', 'profileId', 'deadlineDays', 'calendarId',
      'specialRegimeId', 'specialDefinitionId', 'vrpgSelection', 'selectors'
    ].sort());
    assert.deepEqual(raw.vrpgSelection, { area: 'social', law: 'ivg', action: 'ongoing', stage: 'court' });
    const loaded = loadDefaults(data, storage);
    assert.equal('inputDate' in loaded, false);
    assert.equal('reference' in loaded, false);
    assert.equal(loaded.specialRegimeId, '');
    assert.equal(loaded.specialDefinitionId, '');
  });
});
