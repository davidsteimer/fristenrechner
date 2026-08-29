// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calculateDeadline } from '../../src/core';
import type { CalculationInput, CalculationResult } from '../../src/core';
import { calculationInput, loadCalculationData, loadGoldenSuite } from './fixtures';

const data = loadCalculationData();
const base = calculationInput(loadGoldenSuite('approved').cases[6] as NonNullable<ReturnType<typeof loadGoldenSuite>['cases'][number]>);

function expectBlocked(input: CalculationInput, reason: string): CalculationResult {
  const result = calculateDeadline(input, data);
  assert.equal(result.outcome, 'blocked');
  assert.ok(result.blockReasonKeys.includes(reason), `Sperrgrund ${reason} fehlt`);
  assert.equal('finalEnd' in result, false);
  return result;
}

describe('Sicherheitsgrenzen', () => {
  it('blockiert ein unbekanntes Rechtsprofil', () => {
    expectBlocked({ ...base, profileId: 'nicht-vorhanden' }, 'unknownProfile');
  });

  it('blockiert einen unbekannten Kalender', () => {
    expectBlocked({ ...base, calendarId: 'nicht-vorhanden' }, 'unknownCalendar');
  });

  it('blockiert ungültige Kalenderdaten und Fristdauern', () => {
    expectBlocked({ ...base, inputDate: '2027-02-29' }, 'invalidInputDate');
    expectBlocked({ ...base, deadlineDays: 0 }, 'invalidDeadlineDays');
    expectBlocked({ ...base, deadlineDays: 366 }, 'invalidDeadlineDays');
  });

  it('blockiert Daten ausserhalb der Releaseabdeckung', () => {
    expectBlocked({ ...base, inputDate: '2029-01-01' }, 'dataCoverageExceeded');
    expectBlocked({ ...base, inputDate: '2028-12-31', deadlineDays: 1 }, 'dataCoverageExceeded');
  });

  it('blockiert fehlende, unbekannte und ungültige Selektoren', () => {
    expectBlocked({ ...base, selectors: {} }, 'requiredSelectorMissing');
    expectBlocked({ ...base, selectors: { ...base.selectors, erfunden: 'wert' } }, 'unknownSelector');
    expectBlocked({ ...base, selectors: { ...base.selectors, procedureVariant: 'erfunden' } }, 'unknownSelectorValue');
  });

  it('blockiert einen Kalender, der nicht zur Feiertagsanknüpfung passt', () => {
    expectBlocked({ ...base, calendarId: 'ch-federal-calendar' }, 'calendarJurisdictionMismatch');
  });

  it('blockiert bekannte und nicht bestätigte spezialgesetzliche Abweichungen', () => {
    const vrpgCase = calculationInput(loadGoldenSuite('approved').cases[12] as NonNullable<ReturnType<typeof loadGoldenSuite>['cases'][number]>);
    expectBlocked(
      { ...vrpgCase, selectors: { specialLawStatus: 'knownOverride' } },
      'knownSpecialLawOverride'
    );
    expectBlocked(
      {
        ...vrpgCase,
        selectors: { specialLawStatus: 'noKnownOverride' },
        confirmations: { specialLawChecked: false }
      },
      'specialLawCheckUnconfirmed'
    );
  });

  it('liefert bei wiederholter Berechnung bytegleiches JSON', () => {
    const first = calculateDeadline(base, data);
    const second = calculateDeadline(base, data);
    assert.equal(JSON.stringify(first), JSON.stringify(second));
  });

  it('wendet eine bestätigte siebentägige Zustellfiktion an', () => {
    const result = calculateDeadline({
      profileId: 'stpo',
      inputDate: '2027-09-01',
      inputDateSemantics: 'failedDeliveryAttemptDate',
      deadlineDays: 1,
      calendarId: 'be-public-holidays',
      selectors: { deliveryMethod: 'registeredMailUncollected' },
      confirmations: {
        deliveryFictionApplicabilityConfirmed: true,
        holidayAnchorConfirmed: true
      },
      holidayAnchorCandidates: ['BE']
    }, data);
    assert.equal(result.outcome, 'calculated');
    if (result.outcome === 'calculated') {
      assert.equal(result.legallyRelevantDate, '2027-09-08');
      assert.equal(result.deadlineStart, '2027-09-09');
      assert.equal(result.finalEnd, '2027-09-09');
      assert.ok(result.appliedRuleIds.includes('STPO-DELIV-001'));
    }
  });

  it('setzt den ZPO-Fristbeginn bei Zustellung im Stillstand auf dessen Folgetag', () => {
    const result = calculateDeadline({
      profileId: 'zpo',
      inputDate: '2027-03-25',
      inputDateSemantics: 'legallyRelevantDeliveryOrEventDate',
      deadlineDays: 1,
      calendarId: 'be-public-holidays',
      selectors: { procedureVariant: 'ordinary' },
      confirmations: { holidayAnchorConfirmed: true },
      holidayAnchorCandidates: ['BE']
    }, data);
    assert.equal(result.outcome, 'calculated');
    if (result.outcome === 'calculated') {
      assert.equal(result.deadlineStart, '2027-04-05');
      assert.equal(result.provisionalEnd, '2027-04-05');
      assert.equal(result.suspension.skippedCalendarDays, 10);
      assert.deepEqual(result.suspension.periodIds, ['EASTER-2027']);
      assert.ok(result.appliedRuleIds.includes('ZPO-SUSP-002'));
    }
  });
});
