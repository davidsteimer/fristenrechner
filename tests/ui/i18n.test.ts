// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { translate, translateBlockReason, translateReason, type Locale } from '../../src/ui/i18n';
import type { SpecialDeadlineResult } from '../../src/core';
import { loadCalculationData } from '../core/fixtures';
import { specialGoldenSuite } from '../core/specialFixtures';
import { calculationData as ap11cData } from '../../src/ui/preview/data';

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

describe('AP11C-Sprachkatalog', () => {
  const blockReasons = [
    'specialRegimeCatalogUnresolved',
    'unknownRegime',
    'unknownDeadlineDefinition',
    'deadlineDefinitionRegimeMismatch',
    'authoritativeDeadlineNotCalculable',
    'deadlineDefinitionBeforeLegalEffect',
    'relativeCalculationInputMissing',
    'offsetCalculationInputMissing',
    'weekdayCalculationInputMissing',
    'dualCalculationInputMissing',
    'unknownComponentProfile',
    'componentProfileMismatch',
    'suspensionConfigurationUnresolved',
    'unsupportedSuspensionCombination',
    'calendarRequiredForEndShift',
    'unknownGate',
    'gateComparisonValueMissing',
    'unknownLegalOverride',
    'legalOverrideNotSupported',
    'legalOverrideConfirmationMissing',
    'unexpectedOverrideConfirmation'
  ];
  const traceOperations = [
    'resolveAnchors',
    'calculateRelative',
    'calculateOffset',
    'calculateWeekday',
    'calculateDualBranches',
    'selectDualDeadline',
    'applySuspension',
    'shiftDeadlineEnd',
    'evaluateGate',
    'resolveFilingRequirement',
    'applyLegalOverride',
    'returnResult',
    'blockCalculation'
  ];

  for (const locale of ['de', 'fr'] as const satisfies readonly Locale[]) {
    it(`${locale} deckt Spezialfelder, Fristwahrung, Sperren und Rechenspur ab`, () => {
      const catalog = [...ap11cData.specialRegimeCatalogs.values()][0];
      assert.ok(catalog);
      catalog.deadlineDefinitions.forEach(definition => {
        definition.anchors.forEach(anchor => {
          assert.notEqual(translate(locale, anchor.labelKey), anchor.labelKey);
        });
      });
      catalog.filingProfiles.forEach(profile => {
        profile.acceptedChannels.forEach(channel => {
          assert.notEqual(translate(locale, `special.channel.${channel}`), `special.channel.${channel}`);
        });
        profile.acceptedEvidence.forEach(evidence => {
          assert.notEqual(translate(locale, `special.evidence.${evidence}`), `special.evidence.${evidence}`);
        });
      });
      blockReasons.forEach(reason => {
        assert.notEqual(translateBlockReason(locale, reason), translateReason(locale, reason));
      });
      traceOperations.forEach(operation => {
        assert.notEqual(translate(locale, `special.trace.${operation}`), `special.trace.${operation}`);
      });
      ['calculated', 'manualReview', 'blocked'].forEach(outcome => {
        assert.notEqual(translate(locale, `special.result.${outcome}`), `special.result.${outcome}`);
      });

      const warningKeys = new Set<string>();
      const reasonKeys = new Set<string>();
      const runtimeBlockReasons = new Set<string>();
      specialGoldenSuite.cases.forEach(goldenCase => {
        const expected = goldenCase.expected as unknown as SpecialDeadlineResult;
        expected.warningKeys.forEach(key => warningKeys.add(key));
        expected.blockReasonKeys.forEach(key => runtimeBlockReasons.add(key));
        expected.trace.forEach(step => {
          step.reasonKeys.forEach(key => reasonKeys.add(key));
        });
      });
      warningKeys.forEach(key => assert.notEqual(translate(locale, key), key));
      reasonKeys.forEach(key => assert.notEqual(translateReason(locale, key), key));
      runtimeBlockReasons.forEach(key => {
        assert.notEqual(translateBlockReason(locale, key), translateReason(locale, key));
      });
    });
  }

  it('enthält für die AP11C-Spezialtexte eigenständige französische Fassungen', () => {
    [
      'special.regime.label',
      'special.regime.description',
      'special.result.calculated',
      'special.result.manualReview',
      'special.result.filingRequirements',
      'warning.preparatoryAct.challengeNow'
    ].forEach(key => assert.notEqual(translate('fr', key), translate('de', key)));
  });
});

describe('Issue #18-Sprachkatalog', () => {
  const keys = [
    'calendar.reference',
    'calendar.reference.placeholder',
    'calendar.create',
    'calendar.privacy',
    'calendar.subject',
    'calendar.description',
    'calendar.downloadFailed'
  ];

  for (const locale of ['de', 'fr'] as const satisfies readonly Locale[]) {
    it(`${locale} deckt den Kalendereintrag vollständig ab`, () => {
      keys.forEach(key => assert.notEqual(translate(locale, key), key));
    });
  }

  it('enthält eigenständige französische Produkttexte', () => {
    keys.forEach(key => assert.notEqual(translate('fr', key), translate('de', key)));
  });
});
