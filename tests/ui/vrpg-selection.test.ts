// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { CalculationData, SpecialRegime, SpecialRegimeCatalog } from '../../src/core';
import { calculationData as data } from '../../src/ui/preview/data';
import { translate } from '../../src/ui/i18n';
import {
  EMPTY_VRPG_SELECTION,
  changeVrpgSelection,
  resolveVrpgSelection,
  sanitizeVrpgSelection,
  selectionFromLegacy,
  vrpgActionOptions,
  vrpgAreaOptions,
  vrpgFixedAction,
  vrpgLawOptions,
  vrpgStageOptions,
  type VrpgSelectionState
} from '../../src/ui/vrpgSelection';

const catalog = [...data.specialRegimeCatalogs.values()].find(item => item.profileId === 'vrpg-be')!;
const state = (overrides: Partial<VrpgSelectionState>): VrpgSelectionState => ({ ...EMPTY_VRPG_SELECTION, ...overrides });
const municipalElection = selectionFromLegacy(data, 'vrpg-be-67a-1-municipal-election', 'VRPGBE-SPEC-REL-671');
const federalVote = selectionFromLegacy(data, 'bgg-100-3b-federal-vote', 'BGG-SPEC-REL-103');

function replaceCatalog(transform: (current: SpecialRegimeCatalog) => SpecialRegimeCatalog): CalculationData {
  return {
    ...data,
    specialRegimeCatalogs: new Map([...data.specialRegimeCatalogs].map(([key, value]) => [
      key, value === catalog ? transform(value) : value
    ]))
  };
}

function alterMunicipalRegime(patch: Partial<SpecialRegime>): CalculationData {
  return replaceCatalog(current => ({
    ...current,
    regimes: current.regimes.map(regime => regime.regimeId === 'vrpg-be-67a-1-municipal-election'
      ? { ...regime, ...patch } : regime)
  }));
}

describe('Kontrollierte VRPG-Bereichsauswahl', () => {
  it('bietet vier Bereiche und für jedes sichtbare Auswahlfeld einen leeren Platzhalter in DE/FR an', () => {
    assert.deepEqual(vrpgAreaOptions().map(option => option.key), ['', 'general', 'social', 'political', 'procurement']);
    for (const area of ['social', 'political', 'procurement'] as const) {
      const selection = state({ area });
      const laws = vrpgLawOptions(selection);
      assert.equal(laws[0]?.key, '');
      for (const law of laws.filter(option => option.key)) {
        const actions = vrpgActionOptions(data, { ...selection, law: law.key });
        assert.equal(actions[0]?.key, '');
        for (const option of [...laws, ...actions]) {
          assert.ok(option.labels.de);
          assert.ok(option.labels.fr);
          assert.equal(option.labels.de.includes('Berechenbar'), false);
        }
      }
    }
    assert.deepEqual(vrpgLawOptions(state({ area: 'general' })), []);
    assert.deepEqual(vrpgActionOptions(data, state({ area: 'general' })), []);
    assert.deepEqual(vrpgStageOptions(state({ area: 'general' })), []);
  });

  it('unterscheidet leere, allgemeine und noch nicht freigegebene Auswahl ohne allgemeinen Fallback', () => {
    assert.deepEqual(resolveVrpgSelection(data, EMPTY_VRPG_SELECTION), {
      kind: 'incomplete', regimeId: '', definitionId: '', reason: 'missingSelection'
    });
    assert.deepEqual(resolveVrpgSelection(data, state({ area: 'general' })), {
      kind: 'general', regimeId: 'vrpg-be-general', definitionId: 'VRPGBE-SPEC-REL-GENERAL-001'
    });
    for (const selection of [state({ area: 'social', law: 'ivg', action: 'appeal' }),
      state({ area: 'procurement', law: 'ivob', action: 'appeal' })]) {
      assert.deepEqual(resolveVrpgSelection(data, selection), {
        kind: 'unavailable', regimeId: '', definitionId: '', reason: 'notReleased'
      });
    }
  });

  it('bildet jede bereits selektierbare freigegebene Katalogpaarung verlustfrei ab', () => {
    const expectedPairs = catalog.regimes.filter(regime => regime.status === 'supported'
      && regime.implementationScope === 'mvp02'
      && regime.uiExposure === 'visible'
      && regime.regimeKind !== 'filingOverlay')
      .flatMap(regime => regime.deadlineDefinitionIds.map(definitionId => ({ regimeId: regime.regimeId, definitionId })));
    assert.equal(expectedPairs.length, 21);
    for (const pair of expectedPairs) {
      const selected = selectionFromLegacy(data, pair.regimeId, pair.definitionId);
      assert.notEqual(selected.area, '', `${pair.regimeId}/${pair.definitionId}`);
      assert.deepEqual(sanitizeVrpgSelection(data, selected), selected);
      assert.deepEqual(resolveVrpgSelection(data, selected), {
        kind: pair.regimeId === 'vrpg-be-general' ? 'general' : 'special', ...pair
      });
    }
    const visiblePolitical = ['federal', 'cantonal', 'communal'].flatMap(law =>
      vrpgActionOptions(data, state({ area: 'political', law })).filter(option => option.key));
    assert.equal(visiblePolitical.length, 20);
    assert.equal(new Set(visiblePolitical.map(option => option.key)).size, 20);
  });

  it('trennt die beiden Definitionen von Art. 117 und Art. 121 mit fachlichen DE/FR-Beschriftungen', () => {
    const options = vrpgActionOptions(data, state({ area: 'political', law: 'cantonal' }));
    for (const regimeId of ['prg-be-117-prefect-nomination', 'prg-be-121-prefect-second-ballot']) {
      const choices = catalog.regimes.find(regime => regime.regimeId === regimeId)!.deadlineDefinitionIds.map(definitionId => {
        const selection = selectionFromLegacy(data, regimeId, definitionId);
        return options.find(option => option.key === selection.action)!;
      });
      assert.equal(choices.length, 2);
      assert.notEqual(choices[0]?.key, choices[1]?.key);
      assert.notEqual(choices[0]?.labels.de, choices[1]?.labels.de);
      assert.notEqual(choices[0]?.labels.fr, choices[1]?.labels.fr);
    }
    for (const definitionId of ['PRGBE-SPEC-TUESDAY-121', 'PRGBE-SPEC-THURSDAY-121']) {
      const selected = selectionFromLegacy(data, 'prg-be-121-prefect-second-ballot', definitionId);
      const option = options.find(item => item.key === selected.action)!;
      for (const locale of ['de', 'fr'] as const) {
        assert.ok(option.labels[locale].toLocaleLowerCase(locale).includes(
          translate(locale, `special.definition.${definitionId}`).toLocaleLowerCase(locale)
        ));
      }
    }
    const seventyFive = selectionFromLegacy(data, 'prg-be-75-list-correction', 'PRGBE-SPEC-OFFSET-075');
    const seventyNine = selectionFromLegacy(data, 'prg-be-79-list-connection', 'PRGBE-SPEC-OFFSET-075');
    assert.notEqual(seventyFive.action, seventyNine.action);
  });

  it('filtert politische Situationen explizit nach Ebene, nicht nach Erlasspräfix', () => {
    const federal = vrpgActionOptions(data, state({ area: 'political', law: 'federal' }));
    const communal = vrpgActionOptions(data, state({ area: 'political', law: 'communal' }));
    assert.equal(federal.filter(option => option.key).length, 1);
    assert.equal(communal.filter(option => option.key).length, 4);
    assert.ok(communal.some(option => option.key === municipalElection.action));
    assert.equal(federal.some(option => option.key === municipalElection.action), false);
    assert.equal(resolveVrpgSelection(data, { ...municipalElection, law: 'federal' }).kind, 'unavailable');
    assert.equal(sanitizeVrpgSelection(data, { ...municipalElection, law: 'federal' }).action, '');
    const relabelled = alterMunicipalRegime({ lawCode: 'ARBITRARY', level: 'federal', labels: { de: 'Anderer Titel', fr: 'Autre titre' } });
    assert.equal(resolveVrpgSelection(relabelled, municipalElection).kind, 'special');
    assert.ok(vrpgActionOptions(relabelled, state({ area: 'political', law: 'communal' })).some(option => option.key === municipalElection.action));
  });

  it('leitet beim Wechsel auf eine eidgenössische Angelegenheit die einzige unterstützte Handlung ab', () => {
    const selected = changeVrpgSelection(data, state({ area: 'political' }), 'law', 'federal');
    assert.deepEqual(selected, federalVote);
    assert.deepEqual(resolveVrpgSelection(data, selected), {
      kind: 'special', regimeId: 'bgg-100-3b-federal-vote', definitionId: 'BGG-SPEC-REL-103'
    });
  });

  it('ergänzt die eindeutige eidgenössische Handlung bei leeren oder fehlenden gespeicherten Werten', () => {
    for (const saved of [
      { area: 'political', law: 'federal', action: '', stage: '' },
      { area: 'political', law: 'federal' },
      { area: 'political', law: 'federal', action: undefined, stage: 'court', inputDate: '2026-09-16' }
    ]) {
      assert.deepEqual(sanitizeVrpgSelection(data, saved), federalVote);
    }
    assert.deepEqual(sanitizeVrpgSelection(data, federalVote), federalVote);
  });

  it('verwendet für die feste Handlung dieselben fachlichen Beschriftungen in DE und FR', () => {
    const fixed = vrpgFixedAction(data, state({ area: 'political', law: 'federal' }));
    const regime = catalog.regimes.find(item => item.regimeId === 'bgg-100-3b-federal-vote')!;
    assert.equal(fixed?.key, federalVote.action);
    assert.deepEqual(fixed?.labels, regime.labels);
    for (const locale of ['de', 'fr'] as const) {
      assert.ok(fixed?.labels[locale]);
      assert.equal(fixed?.labels[locale].includes('Bitte wählen'), false);
    }
  });

  it('deutet fremde oder beschädigte gespeicherte Handlungen nicht als eidgenössischen Weiterzug um', () => {
    for (const action of [municipalElection.action, 'unknown', ' ', null, false, 42, [], {}]) {
      const sanitized = sanitizeVrpgSelection(data, { area: 'political', law: 'federal', action });
      assert.deepEqual(sanitized, state({ area: 'political', law: 'federal' }));
      assert.equal(resolveVrpgSelection(data, sanitized).kind, 'incomplete');
    }
  });

  it('behält die echte Handlungsauswahl auf kantonaler und kommunaler Ebene sowie in anderen Bereichen', () => {
    for (const selection of [
      state({ area: 'political', law: 'cantonal' }),
      state({ area: 'political', law: 'communal' }),
      state({ area: 'political' }),
      state({ area: 'social', law: 'ivg' }),
      state({ area: 'procurement', law: 'ivob' })
    ]) {
      assert.equal(vrpgFixedAction(data, selection), undefined);
      assert.deepEqual(sanitizeVrpgSelection(data, selection), selection);
    }
  });

  it('zeigt keine feste eidgenössische Handlung bei fehlendem, offenem, verborgenem oder mehrdeutigem Regime', () => {
    const federalRegime = catalog.regimes.find(item => item.regimeId === 'bgg-100-3b-federal-vote')!;
    const altered = (patch: Partial<SpecialRegime>): CalculationData => replaceCatalog(current => ({
      ...current,
      regimes: current.regimes.map(regime => regime.regimeId === federalRegime.regimeId ? { ...regime, ...patch } : regime)
    }));
    const missingRegime = replaceCatalog(current => ({ ...current,
      regimes: current.regimes.filter(regime => regime.regimeId !== federalRegime.regimeId) }));
    const duplicateRegime = replaceCatalog(current => ({ ...current,
      regimes: [...current.regimes, federalRegime] }));
    const missingDefinition = replaceCatalog(current => ({ ...current,
      deadlineDefinitions: current.deadlineDefinitions.filter(definition => definition.deadlineDefinitionId !== 'BGG-SPEC-REL-103') }));
    const duplicateDefinition = replaceCatalog(current => ({ ...current,
      deadlineDefinitions: [...current.deadlineDefinitions,
        current.deadlineDefinitions.find(definition => definition.deadlineDefinitionId === 'BGG-SPEC-REL-103')!] }));
    for (const changed of [
      altered({ status: 'open' }), altered({ status: 'blocked' }), altered({ uiExposure: 'hidden' }),
      altered({ implementationScope: 'followup' }), missingRegime, duplicateRegime, missingDefinition, duplicateDefinition
    ]) {
      const emptyFederal = state({ area: 'political', law: 'federal' });
      assert.equal(vrpgFixedAction(changed, emptyFederal), undefined);
      assert.deepEqual(sanitizeVrpgSelection(changed, emptyFederal), emptyFederal);
      assert.notEqual(resolveVrpgSelection(changed, federalVote).kind, 'special');
    }
  });

  it('entfernt die feste eidgenössische Handlung beim Wechsel der Ebene oder des Bereichs', () => {
    for (const law of ['cantonal', 'communal', '']) {
      assert.deepEqual(changeVrpgSelection(data, federalVote, 'law', law), state({ area: 'political', law }));
    }
    assert.deepEqual(changeVrpgSelection(data, federalVote, 'area', 'social'), state({ area: 'social' }));
    assert.deepEqual(changeVrpgSelection(data, municipalElection, 'law', 'federal'), federalVote);
    assert.deepEqual(changeVrpgSelection(data, federalVote, 'law', 'federal'), federalVote);
  });

  it('übernimmt keine offenen, blockierten, versteckten oder Post-MVP-Regime aus bisherigen Standards', () => {
    for (const regime of catalog.regimes.filter(item => item.status !== 'supported'
      || item.implementationScope !== 'mvp02' || item.uiExposure !== 'visible' || item.regimeKind === 'filingOverlay')) {
      assert.deepEqual(selectionFromLegacy(data, regime.regimeId, regime.deadlineDefinitionIds[0] ?? ''), EMPTY_VRPG_SELECTION);
    }
    assert.deepEqual(selectionFromLegacy(data, '', ''), EMPTY_VRPG_SELECTION);
    assert.deepEqual(selectionFromLegacy(data, 'unknown', 'unknown'), EMPTY_VRPG_SELECTION);
    assert.deepEqual(selectionFromLegacy(data, 'vrpg-be-67a-1-municipal-election', 'VRPGBE-SPEC-REL-672'), EMPTY_VRPG_SELECTION);
    assert.deepEqual(selectionFromLegacy(data, 'vrpg-be-general', 'unrelated'), EMPTY_VRPG_SELECTION);
  });

  it('migriert eine fehlende Legacy-Definition nur bei eindeutigem Regime', () => {
    assert.deepEqual(selectionFromLegacy(data, 'vrpg-be-general', ''), state({ area: 'general' }));
    assert.deepEqual(selectionFromLegacy(data, 'vrpg-be-67a-1-municipal-election', ''), municipalElection);
    assert.deepEqual(selectionFromLegacy(data, 'prg-be-117-prefect-nomination', ''), EMPTY_VRPG_SELECTION);
    assert.deepEqual(selectionFromLegacy(data, 'prg-be-121-prefect-second-ballot', ''), EMPTY_VRPG_SELECTION);
  });

  it('zeigt das Stadium nur bei Eingaben im laufenden Verfahren', () => {
    for (const area of ['social', 'procurement'] as const) {
      const law = area === 'social' ? 'ivg' : 'ivob';
      assert.deepEqual(vrpgStageOptions(state({ area, law, action: 'appeal' })), []);
      assert.deepEqual(vrpgStageOptions(state({ area, law, action: '' })), []);
      const ongoing = state({ area, law, action: 'ongoing' });
      assert.deepEqual(vrpgStageOptions(ongoing).map(option => option.key),
        area === 'procurement' ? ['', 'administration', 'administrative-appeal', 'court'] : ['', 'administration', 'court']);
      assert.equal(resolveVrpgSelection(data, ongoing).kind, 'incomplete');
      for (const stage of ['administration', 'court']) {
        assert.equal(resolveVrpgSelection(data, { ...ongoing, stage }).kind, 'unavailable');
      }
      assert.equal(resolveVrpgSelection(data, { ...ongoing, stage: 'unknown' }).reason, 'invalidSelection');
    }
    assert.deepEqual(vrpgStageOptions(municipalElection), []);
    assert.deepEqual(vrpgStageOptions(state({ area: 'political', law: 'cantonal', action: 'ongoing' })), []);
    assert.deepEqual(vrpgStageOptions(state({ area: 'social', law: '', action: 'ongoing' })), []);
  });

  it('unterscheidet beim Sozialversicherungsrecht IVG-Einwand und AHVG/UVG-Einsprache ohne Rechenfreigabe', () => {
    for (const law of ['ivg', 'ahvg', 'uvg']) {
      const actions = vrpgActionOptions(data, state({ area: 'social', law }));
      assert.equal(actions.some(option => option.key === 'preliminary-objection'), law === 'ivg');
      assert.equal(actions.some(option => option.key === 'objection'), law !== 'ivg');
      for (const action of actions.filter(option => option.key && option.key !== 'ongoing')) {
        assert.equal(resolveVrpgSelection(data, state({ area: 'social', law, action: action.key })).kind, 'unavailable');
      }
    }
    assert.equal(resolveVrpgSelection(data, state({ area: 'social', law: 'ivg', action: 'objection' })).reason, 'invalidSelection');
    assert.equal(resolveVrpgSelection(data, state({ area: 'social', law: 'ahvg', action: 'preliminary-objection' })).reason, 'invalidSelection');
  });

  it('leert nach übergeordneten Änderungen alle abhängigen Werte und behält gleiche Auswahl stabil', () => {
    const selected = state({ area: 'social', law: 'ivg', action: 'ongoing', stage: 'court' });
    assert.deepEqual(changeVrpgSelection(data, selected, 'area', 'political'), state({ area: 'political' }));
    assert.deepEqual(changeVrpgSelection(data, selected, 'law', 'ahvg'), state({ area: 'social', law: 'ahvg' }));
    assert.deepEqual(changeVrpgSelection(data, selected, 'action', 'appeal'), state({ area: 'social', law: 'ivg', action: 'appeal' }));
    assert.deepEqual(changeVrpgSelection(data, selected, 'stage', 'administration'), { ...selected, stage: 'administration' });
    assert.deepEqual(changeVrpgSelection(data, selected, 'law', 'ivg'), selected);
    assert.deepEqual(changeVrpgSelection(data, selected, 'area', ''), EMPTY_VRPG_SELECTION);
    assert.deepEqual(changeVrpgSelection(data, selected, 'area', 'invalid'), EMPTY_VRPG_SELECTION);
    assert.deepEqual(changeVrpgSelection(data, municipalElection, 'law', 'cantonal'), state({ area: 'political', law: 'cantonal' }));
  });

  it('bereinigt beliebige Speicherwerte ohne Daten, Referenzen oder unbekannte Zusatzfelder zu übernehmen', () => {
    for (const candidate of [null, [], true, 'social', 1, undefined, {}]) {
      assert.deepEqual(sanitizeVrpgSelection(data, candidate), EMPTY_VRPG_SELECTION);
    }
    assert.deepEqual(sanitizeVrpgSelection(data, { ...municipalElection, inputDate: '2026-09-16', reference: 'private', stage: 'court' }), municipalElection);
    assert.deepEqual(sanitizeVrpgSelection(data, { area: 'general', law: 'ivg', action: 'appeal', stage: 'court' }), state({ area: 'general' }));
    assert.deepEqual(sanitizeVrpgSelection(data, { area: 'social', law: 'ATSG', action: 'appeal', stage: 'court' }), state({ area: 'social' }));
    const placeholder = state({ area: 'social', law: 'ivg' });
    assert.deepEqual(sanitizeVrpgSelection(data, placeholder), placeholder);
    assert.equal(resolveVrpgSelection(data, placeholder).kind, 'incomplete');
  });

  for (const patch of [
    { status: 'open' }, { status: 'blocked' }, { implementationScope: 'followup' },
    { implementationScope: 'documentationOnly' }, { uiExposure: 'hidden' }, { uiExposure: 'documentation' },
    { regimeKind: 'filingOverlay' }, { deadlineDefinitionIds: ['VRPGBE-SPEC-REL-672'] }
  ] as const) {
    it(`validiert die Katalogfreigabe bei jeder Auflösung erneut: ${JSON.stringify(patch)}`, () => {
      const changed = alterMunicipalRegime(patch);
      assert.deepEqual(resolveVrpgSelection(changed, municipalElection), {
        kind: 'unavailable', regimeId: '', definitionId: '', reason: 'notReleased'
      });
      assert.equal(vrpgActionOptions(changed, municipalElection).some(option => option.key === municipalElection.action), false);
      assert.equal(sanitizeVrpgSelection(changed, municipalElection).action, '');
      assert.deepEqual(selectionFromLegacy(changed, 'vrpg-be-67a-1-municipal-election', 'VRPGBE-SPEC-REL-671'), EMPTY_VRPG_SELECTION);
    });
  }

  it('blockiert fehlende oder gesperrte Definitionen, fehlendes Profil und mehrdeutige Katalogeinträge', () => {
    const noDefinition = replaceCatalog(current => ({ ...current,
      deadlineDefinitions: current.deadlineDefinitions.filter(definition => definition.deadlineDefinitionId !== 'VRPGBE-SPEC-REL-671') }));
    const blockedDefinition = replaceCatalog(current => ({ ...current,
      deadlineDefinitions: current.deadlineDefinitions.map(definition => definition.deadlineDefinitionId === 'VRPGBE-SPEC-REL-671'
        ? { ...definition, status: 'blocked' } : definition) }));
    const duplicateDefinition = replaceCatalog(current => ({ ...current,
      deadlineDefinitions: [...current.deadlineDefinitions, current.deadlineDefinitions.find(definition => definition.deadlineDefinitionId === 'VRPGBE-SPEC-REL-671')!] }));
    const duplicateRegime = replaceCatalog(current => ({ ...current,
      regimes: [...current.regimes, current.regimes.find(regime => regime.regimeId === 'vrpg-be-67a-1-municipal-election')!] }));
    const missingProfile = { ...data, profiles: new Map([...data.profiles].filter(([key]) => key !== 'vrpg-be')) };
    const missingCatalog = { ...data, specialRegimeCatalogs: new Map() };
    const duplicateCatalog = { ...data, specialRegimeCatalogs: new Map([...data.specialRegimeCatalogs, ['another', catalog] as const]) };
    for (const changed of [noDefinition, blockedDefinition, duplicateDefinition, duplicateRegime, missingProfile, missingCatalog, duplicateCatalog]) {
      assert.equal(resolveVrpgSelection(changed, municipalElection).kind, 'unavailable');
      assert.equal(sanitizeVrpgSelection(changed, municipalElection).action, '');
    }
    assert.equal(resolveVrpgSelection(missingCatalog, state({ area: 'general' })).kind, 'unavailable');
  });

  it('schaltet neue ähnlich benannte Regime und nachträglich unterstützte ATSG-Regime nicht automatisch frei', () => {
    const changed = replaceCatalog(current => ({ ...current, regimes: [
      ...current.regimes.map(regime => regime.regimeId === 'atsg-60-social-insurance'
        ? { ...regime, status: 'supported' as const, implementationScope: 'mvp02' as const, uiExposure: 'visible' as const } : regime),
      { ...current.regimes.find(regime => regime.regimeId === 'vrpg-be-67a-1-municipal-election')!, regimeId: 'prg-be-new-rule' }
    ] }));
    assert.deepEqual(selectionFromLegacy(changed, 'prg-be-new-rule', 'VRPGBE-SPEC-REL-671'), EMPTY_VRPG_SELECTION);
    assert.deepEqual(selectionFromLegacy(changed, 'atsg-60-social-insurance', 'ATSG-SPEC-REL-060'), EMPTY_VRPG_SELECTION);
    assert.equal(resolveVrpgSelection(changed, state({ area: 'social', law: 'ivg', action: 'appeal' })).kind, 'unavailable');
    assert.equal(vrpgActionOptions(changed, state({ area: 'political', law: 'cantonal' })).some(option => option.key.includes('prg-be-new-rule')), false);
  });
});
