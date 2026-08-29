// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calculateDeadline } from '../../src/core';
import {
  automaticCalendarId,
  authorityOptions,
  createCalculationInput,
  inputDateSemantics,
  profilesForAuthority,
  reconcileProfileId,
  suspensionPresentation,
  type CalculatorFormState
} from '../../src/ui/model';
import { loadCalculationData, loadGoldenSuite } from '../core/fixtures';

const data = loadCalculationData();

describe('AP9-UI-Modell', () => {
  it('leitet Gemeinwesen und gefilterte Profile aus dem Datenrelease ab', () => {
    assert.deepEqual(authorityOptions(data).map(option => option.code), ['CH', 'BE']);
    assert.deepEqual(
      profilesForAuthority(data, 'CH').map(profile => profile.profileId).sort(),
      ['bgg', 'stpo', 'vwvg', 'zpo']
    );
    assert.deepEqual(
      profilesForAuthority(data, 'BE').map(profile => profile.profileId).sort(),
      ['bgg', 'stpo', 'vrpg-be', 'vwvg', 'zpo']
    );
  });

  it('verwirft ein ausgefiltertes kantonales Profil bei Wechsel zum Bund', () => {
    assert.equal(reconcileProfileId(data, 'CH', 'vrpg-be'), 'stpo');
    assert.equal(reconcileProfileId(data, 'BE', 'vrpg-be'), 'vrpg-be');
  });

  it('leitet Eingabedatumssemantik und Stillstand sichtbar aus der Auswahl ab', () => {
    assert.equal(inputDateSemantics({ deliveryMethod: 'registeredMailUncollected' }), 'failedDeliveryAttemptDate');
    assert.equal(inputDateSemantics({ deliveryMethod: 'ordinaryMailWeekendOrHoliday' }), 'observedOrdinaryMailDeliveryDate');
    assert.equal(inputDateSemantics({}), 'legallyRelevantDeliveryOrEventDate');

    assert.equal(suspensionPresentation(data.profiles.get('stpo'), {}), 'disabled');
    assert.equal(suspensionPresentation(data.profiles.get('zpo'), {}), 'pending');
    assert.equal(suspensionPresentation(data.profiles.get('zpo'), { procedureVariant: 'ordinary' }), 'enabled');
    assert.equal(suspensionPresentation(data.profiles.get('zpo'), { procedureVariant: 'summary' }), 'disabled');
    assert.equal(suspensionPresentation(data.profiles.get('bgg'), { subjectMatter: 'publicProcurement' }), 'disabled');
  });

  for (const goldenCase of [...loadGoldenSuite('approved').cases, ...loadGoldenSuite('unresolved').cases]) {
    it(`${goldenCase.caseId} ist durch das UI-Eingabemodell auslösbar`, () => {
      const profile = data.profiles.get(goldenCase.profileId);
      assert.ok(profile);
      const state: CalculatorFormState = {
        authorityCode: profile.jurisdiction.level === 'cantonal' ? profile.jurisdiction.code : 'BE',
        profileId: goldenCase.profileId,
        inputDate: goldenCase.input.inputDate,
        deadlineDays: String(goldenCase.input.deadlineDays),
        selectors: goldenCase.input.selectors,
        calendarId: goldenCase.input.calendarId,
        calendarOverrideReason: '',
        additionalHolidayAnchor: goldenCase.input.holidayAnchorCandidates[1] ?? '',
        holidayAnchorConfirmed: goldenCase.input.confirmations.holidayAnchorConfirmed === true,
        deliveryFictionConfirmed: goldenCase.input.confirmations.deliveryFictionApplicabilityConfirmed === true,
        specialLawChecked: goldenCase.input.confirmations.specialLawChecked === true
      };
      assert.equal(automaticCalendarId(data, profile), 'be-public-holidays');

      const result = calculateDeadline(createCalculationInput(data, state), data);
      assert.equal(result.outcome, goldenCase.expected.outcome);
      if (result.outcome === 'calculated') {
        assert.equal(result.finalEnd, goldenCase.expected.finalEnd);
      } else {
        assert.deepEqual(result.blockReasonKeys, goldenCase.expected.blockReasonKeys);
        assert.equal('finalEnd' in result, false);
      }
    });
  }
});
