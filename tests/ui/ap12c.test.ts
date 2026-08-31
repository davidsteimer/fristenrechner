// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { translate, translateBlockReason } from '../../src/ui/i18n';
import { calculationData } from '../../src/ui/preview/data';

const calendarFailureKeys = [
  'calendarGenerationFailed',
  'calendar.unknownRuleType',
  'calendar.invalidFixedDate',
  'calendar.invalidNthWeekday',
  'calendar.duplicateRuleId',
  'calendar.duplicateResultId',
  'calendar.inheritanceCycle',
  'calendar.unknownInheritedCalendar',
  'calendar.unmatchedOverride',
  'calendar.priorityConflict',
  'calendar.outsideValidity',
  'calendar.inconsistentSuspensionSet',
  'calendar.invalidRuleConfiguration',
  'calendar.unsupportedGregorianYear'
] as const;

describe('AP12C-Produktoberfläche', () => {
  it('verwendet in der Preview den freigegebenen MVP-0.3-Format-3-Release', () => {
    assert.equal(calculationData.releaseId, '2026-08-31-mvp-03-approved.1');
    assert.equal(calculationData.formatVersion, '3.0.0');
    assert.equal(calculationData.coverage.to, null);
    assert.equal(calculationData.calendarRuleSets.size, 2);
  });

  for (const locale of ['de', 'fr'] as const) {
    it(`${locale} erklärt sämtliche Sperrgründe des Regelkalenders`, () => {
      calendarFailureKeys.forEach(key => {
        assert.notEqual(translateBlockReason(locale, key), key);
      });
      assert.notEqual(translate(locale, 'dataStatus.openEnded'), 'dataStatus.openEnded');
      assert.notEqual(translate(locale, 'trace.calendar'), 'trace.calendar');
      assert.notEqual(translate(locale, 'trace.dataRelease'), 'trace.dataRelease');
    });
  }
});
