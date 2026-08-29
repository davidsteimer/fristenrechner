// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { translate, translateBlockReason, translateReason, type Locale } from '../../src/ui/i18n';
import { loadCalculationData } from '../core/fixtures';

const data = loadCalculationData();
const coreReasons = [
  'profileMissing',
  'calendarMissing',
  'holidayAnchorMissing',
  'invalidHolidayAnchorCandidates',
  'unsupportedInputDateSemantics',
  'unknownSelector',
  'unknownSelectorValue',
  'requiredSelectorMissing',
  'unknownProfile',
  'unknownCalendar',
  'profileOutsideValidity',
  'deliveryDateRuleUnresolved',
  'deliveryDateRuleInvalid',
  'deliveryFictionApplicabilityUnconfirmed',
  'inputDateSemanticsMismatch',
  'unknownSpecialLaw',
  'knownSpecialLawOverride',
  'specialLawCheckUnconfirmed',
  'holidayAnchorRuleUnresolved',
  'holidayAnchorConflictUnresolved',
  'calculationRuleUnresolved',
  'deadlineStartRuleInvalid',
  'ambiguousSuspensionConfiguration',
  'suspensionSetMissing',
  'unknownOrInapplicableSuspensionSet',
  'dataCoverageExceeded',
  'ordinaryMailWeekendOrHoliday',
  'registeredMailUncollected',
  'signatureMailUncollected',
  'notBernPublicHoliday',
  'saturday',
  'sunday',
  'publicHoliday',
  'suspensionDisabled',
  'leapDayIncluded'
] as const;

describe('AP9-Sprachkatalog', () => {
  for (const locale of ['de', 'fr'] as const satisfies readonly Locale[]) {
    it(`${locale} deckt alle datengetriebenen Selektoren und Warnungen ab`, () => {
      const expectedAuthorityLabel = locale === 'de' ? 'Zuständige Behörde' : 'Autorité compétente';
      const expectedFederalAuthority = locale === 'de' ? 'Bundesbehörde' : 'Autorité fédérale';
      const expectedBernAuthority = locale === 'de' ? 'Behörde des Kantons Bern' : 'Autorité du canton de Berne';
      assert.equal(translate(locale, 'form.authority'), expectedAuthorityLabel);
      assert.equal(translate(locale, 'authority.CH'), expectedFederalAuthority);
      assert.equal(translate(locale, 'authority.BE'), expectedBernAuthority);
      assert.notEqual(translate(locale, 'dataStatus.label'), 'dataStatus.label');
      assert.notEqual(translate(locale, 'dataStatus.coverage'), 'dataStatus.coverage');

      data.profiles.forEach(profile => {
        profile.selectors.forEach(selector => {
          assert.notEqual(translate(locale, `selector.${selector.selectorId}`), `selector.${selector.selectorId}`);
          selector.options.forEach(option => assert.notEqual(translate(locale, option.labelKey), option.labelKey));
        });
        profile.rules.forEach(rule => {
          if (rule.warningKey) {
            assert.notEqual(translate(locale, rule.warningKey), rule.warningKey);
          }
        });
      });
    });

    it(`${locale} deckt alle Sperr- und Rechenspurgründe des MVP ab`, () => {
      coreReasons.forEach(reason => assert.notEqual(translateReason(locale, reason), reason));
      [
        'deliveryFictionApplicabilityUnconfirmed',
        'unknownSpecialLaw',
        'knownSpecialLawOverride',
        'specialLawCheckUnconfirmed',
        'holidayAnchorConflictUnresolved',
        'requiredSelectorMissing',
        'unknownSelectorValue',
        'dataCoverageExceeded'
      ].forEach(reason => assert.notEqual(translateBlockReason(locale, reason), translateReason(locale, reason)));
    });
  }
});
