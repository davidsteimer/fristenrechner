// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calculateSpecialDeadline } from '../../src/core';
import type { SpecialDeadlineInput } from '../../src/core';
import { specialCalculationData, specialGoldenSuite } from './specialFixtures';

function baseInput(): SpecialDeadlineInput {
  const goldenCase = specialGoldenSuite.cases[0];
  if (!goldenCase) throw new Error('Der AP11B-Golden-Case-Bestand ist leer.');
  return { profileId: goldenCase.profileId, ...goldenCase.input };
}

describe('AP11B-Defensivverhalten', () => {
  it('hält sämtliche behördlich gesetzten Hintergrundregime aus der Fristtyp-Auswahl fern', () => {
    const catalog = [...specialCalculationData.specialRegimeCatalogs.values()][0];
    assert.ok(catalog);
    const authoritativeIds = new Set(
      catalog.deadlineDefinitions
        .filter(definition => definition.deadlineOrigin === 'AUTHORITATIVE')
        .map(definition => definition.deadlineDefinitionId)
    );
    const authoritativeRegimes = catalog.regimes.filter(regime =>
      regime.deadlineDefinitionIds.some(id => authoritativeIds.has(id)));
    assert.equal(authoritativeRegimes.length, 3);
    assert.ok(authoritativeRegimes.every(regime => regime.uiExposure === 'hidden'));
    assert.ok(catalog.deadlineDefinitions.every(definition =>
      definition.deadlineOrigin === 'AUTHORITATIVE'
        || ['R1_RELATIVE', 'R2_OFFSET', 'R3_WEEKDAY', 'R4_DUAL'].includes(definition.calculation.type)));
  });

  it('blockiert eine unbekannte Fristdefinition', () => {
    const result = calculateSpecialDeadline(
      { ...baseInput(), ruleId: 'NOT-AVAILABLE-001' },
      specialCalculationData
    );
    assert.equal(result.outcome, 'blocked');
    assert.deepEqual(result.blockReasonKeys, ['unknownDeadlineDefinition']);
  });

  it('blockiert eine zum Regime widersprüchliche Fristdefinition', () => {
    const result = calculateSpecialDeadline(
      { ...baseInput(), ruleId: 'VRPGBE-SPEC-REL-671' },
      specialCalculationData
    );
    assert.equal(result.outcome, 'blocked');
    assert.deepEqual(result.blockReasonKeys, ['deadlineDefinitionRegimeMismatch']);
  });

  it('blockiert fehlende Ankerwerte', () => {
    const result = calculateSpecialDeadline(
      { ...baseInput(), dateValues: {} },
      specialCalculationData
    );
    assert.equal(result.outcome, 'blocked');
    assert.deepEqual(result.blockReasonKeys, ['requiredDateValueMissing']);
  });

  it('blockiert widersprüchliche Komponentenprofile', () => {
    const result = calculateSpecialDeadline(
      { ...baseInput(), filingProfileId: 'F2_RECEIPT' },
      specialCalculationData
    );
    assert.equal(result.outcome, 'blocked');
    assert.deepEqual(result.blockReasonKeys, ['componentProfileMismatch']);
  });

  it('blockiert offene behördlich gesetzte Termine, statt Eingaben als Rechnung auszugeben', () => {
    const result = calculateSpecialDeadline(
      {
        profileId: 'vrpg-be',
        regimeId: 'bpr-21-nomination-deadline',
        ruleId: 'BPR-SPEC-AUTH-021',
        dateValues: { authorityDeadlineDate: '2026-09-16' },
        localTimeValues: {},
        integerValues: {},
        calendarProfileId: 'C_FIXED_REVIEW',
        suspensionProfileId: 'S0_NONE',
        filingProfileId: 'F2_RECEIPT',
        overrideConfirmations: []
      },
      specialCalculationData
    );
    assert.equal(result.outcome, 'blocked');
    assert.deepEqual(result.blockReasonKeys, ['specialRegimeOpen']);
    assert.equal(result.finalDeadline, undefined);
  });

  it('berechnet einen Behörden-Termin auch bei fehlerhaft unterstütztem Status niemals', () => {
    const catalog = [...specialCalculationData.specialRegimeCatalogs.values()][0];
    assert.ok(catalog);
    const mutatedCatalog = {
      ...catalog,
      deadlineDefinitions: catalog.deadlineDefinitions.map(definition =>
        definition.deadlineDefinitionId === 'BPR-SPEC-AUTH-021'
          ? { ...definition, status: 'supported' as const }
          : definition),
      regimes: catalog.regimes.map(regime =>
        regime.regimeId === 'bpr-21-nomination-deadline'
          ? { ...regime, status: 'supported' as const }
          : regime)
    };
    const defensiveData = {
      ...specialCalculationData,
      specialRegimeCatalogs: new Map([[catalog.catalogId, mutatedCatalog]])
    };
    const result = calculateSpecialDeadline(
      {
        profileId: 'vrpg-be',
        regimeId: 'bpr-21-nomination-deadline',
        ruleId: 'BPR-SPEC-AUTH-021',
        dateValues: { authorityDeadlineDate: '2026-09-16' },
        localTimeValues: {},
        integerValues: {},
        calendarProfileId: 'C_FIXED_REVIEW',
        suspensionProfileId: 'S0_NONE',
        filingProfileId: 'F2_RECEIPT',
        overrideConfirmations: []
      },
      defensiveData
    );
    assert.equal(result.outcome, 'blocked');
    assert.deepEqual(result.blockReasonKeys, ['authoritativeDeadlineNotCalculable']);
    assert.equal(result.finalDeadline, undefined);
  });

  it('erzwingt die vertragliche Jahresanfangs-Anknüpfung für Art. 8a VPR', () => {
    const result = calculateSpecialDeadline(
      {
        profileId: 'vrpg-be',
        regimeId: 'vpr-8a-election-notice',
        ruleId: 'VPR-SPEC-REL-008',
        dateValues: { electionYearStartDate: '2027-01-02' },
        localTimeValues: {},
        integerValues: {},
        calendarProfileId: 'C_BE',
        suspensionProfileId: 'S0_NONE',
        filingProfileId: 'F0_NA',
        overrideConfirmations: []
      },
      specialCalculationData
    );
    assert.equal(result.outcome, 'blocked');
    assert.deepEqual(result.blockReasonKeys, ['anchorConstraintMismatch']);
  });
});
