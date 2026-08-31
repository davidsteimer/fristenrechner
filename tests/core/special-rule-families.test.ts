// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calculateSpecialDeadline } from '../../src/core';
import { specialCalculationData } from './specialFixtures';

describe('AP11B-Regelfamilien und Einreichung', () => {
  it('berechnet für Art. 16 Abs. 1 PRG den Samstag vor dem Urnengang', () => {
    const result = calculateSpecialDeadline({
      profileId: 'vrpg-be',
      regimeId: 'prg-be-16-postal-vote',
      ruleId: 'PRGBE-SPEC-WEEKDAY-016',
      dateValues: { pollDate: '2026-09-27' },
      localTimeValues: {},
      integerValues: {},
      calendarProfileId: 'C_BE',
      suspensionProfileId: 'S0_NONE',
      filingProfileId: 'F2_RECEIPT',
      overrideConfirmations: []
    }, specialCalculationData);

    assert.equal(result.outcome, 'calculated');
    assert.equal(result.finalDeadline?.date, '2026-09-26');
    assert.equal(result.filingRequirement?.preservationMode, 'receipt');
    assert.deepEqual(result.filingRequirement?.acceptedChannels, ['competentAuthority']);
  });

  it('berechnet Art. 8a Abs. 1 VPR auf den 1. März des Wahljahres', () => {
    const result = calculateSpecialDeadline({
      profileId: 'vrpg-be',
      regimeId: 'vpr-8a-election-notice',
      ruleId: 'VPR-SPEC-REL-008',
      dateValues: { electionYearStartDate: '2027-01-01' },
      localTimeValues: {},
      integerValues: {},
      calendarProfileId: 'C_BE',
      suspensionProfileId: 'S0_NONE',
      filingProfileId: 'F0_NA',
      overrideConfirmations: []
    }, specialCalculationData);

    assert.equal(result.outcome, 'calculated');
    assert.equal(result.finalDeadline?.date, '2027-03-01');
    assert.equal(result.filingRequirement?.preservationMode, 'notApplicable');
  });

  it('zählt beim allgemeinen BGG-Weiterzug den Sommerstillstand nicht mit', () => {
    const result = calculateSpecialDeadline({
      profileId: 'vrpg-be',
      regimeId: 'bgg-100-1-general-appeal',
      ruleId: 'BGG-SPEC-REL-101',
      dateValues: { decisionNoticeDate: '2026-07-14' },
      localTimeValues: {},
      integerValues: {},
      calendarProfileId: 'C_BGG',
      suspensionProfileId: 'S_BGG',
      filingProfileId: 'F1_DISPATCH',
      overrideConfirmations: []
    }, specialCalculationData);

    assert.equal(result.outcome, 'calculated');
    assert.equal(result.finalDeadline?.date, '2026-09-14');
    const suspensionStep = result.trace.find(step => step.operation === 'applySuspension');
    assert.ok(suspensionStep?.reasonKeys.includes('SUMMER-2026'));
    assert.ok(suspensionStep?.reasonKeys.includes('skipped32CalendarDays'));
  });

  it('liefert für Art. 77 Abs. 2 BPR die eingeschriebene Postaufgabe', () => {
    const result = calculateSpecialDeadline({
      profileId: 'vrpg-be',
      regimeId: 'bpr-77-political-rights-complaint',
      ruleId: 'BPR-SPEC-DUAL-077',
      dateValues: {
        discoveryDate: '2026-09-01',
        publicationDate: '2026-09-03'
      },
      localTimeValues: {},
      integerValues: {},
      calendarProfileId: 'C_BE',
      suspensionProfileId: 'S0_NONE',
      filingProfileId: 'F4_REGISTERED',
      overrideConfirmations: []
    }, specialCalculationData);

    assert.equal(result.outcome, 'calculated');
    assert.equal(result.finalDeadline?.date, '2026-09-04');
    assert.equal(result.filingRequirement?.preservationMode, 'registeredDispatch');
    assert.deepEqual(result.filingRequirement?.acceptedEvidence, ['registeredPostalDispatch']);
  });
});
