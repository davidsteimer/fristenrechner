// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { calculateDeadline, calculateSpecialDeadline } from '../../src/core';
import type { SpecialDeadlineInput } from '../../src/core';
import {
  createCalculationInput,
  createSpecialCalculationInput,
  isGeneralCalculation,
  reconcileSpecialSelection,
  specialRegimeOptions,
  type CalculatorFormState
} from '../../src/ui/model';
import { calculationData as data } from '../../src/ui/preview/data';

interface GoldenCase {
  readonly caseId: string;
  readonly profileId: string;
  readonly input: Omit<SpecialDeadlineInput, 'profileId'>;
  readonly expected: {
    readonly outcome: 'calculated' | 'manualReview' | 'blocked';
    readonly finalDeadline?: { readonly date: string };
  };
}

const suite = JSON.parse(readFileSync(join(
  process.cwd(),
  'tests/golden/approved/vrpg-be-special-cases.json'
), 'utf8')) as { readonly cases: readonly GoldenCase[] };

function formState(goldenCase: GoldenCase): CalculatorFormState {
  const selected = reconcileSpecialSelection(
    data,
    goldenCase.profileId,
    goldenCase.input.regimeId,
    goldenCase.input.ruleId
  );
  return {
    authorityCode: 'BE',
    profileId: goldenCase.profileId,
    inputDate: goldenCase.input.dateValues.eventDate ?? '',
    deadlineDays: String(goldenCase.input.integerValues.deadlineDays ?? ''),
    selectors: { deliveryMethod: 'otherLegallyRelevantDate' },
    calendarId: 'be-public-holidays',
    calendarOverrideReason: '',
    additionalHolidayAnchor: '',
    holidayAnchorConfirmed: false,
    deliveryFictionConfirmed: false,
    specialLawChecked: true,
    specialRegimeId: selected.regimeId,
    specialDefinitionId: selected.definitionId,
    specialDateValues: goldenCase.input.dateValues,
    specialLocalTimeValues: goldenCase.input.localTimeValues,
    specialIntegerValues: Object.fromEntries(
      Object.entries(goldenCase.input.integerValues).map(([key, value]) => [key, String(value)])
    ),
    specialOverrideConfirmations: goldenCase.input.overrideConfirmations
  };
}

describe('AP11C-Spezialregime im UI-Modell', () => {
  it('behält die leere Fristtyp-Auswahl ohne stillen Fallback bei', () => {
    assert.deepEqual(
      reconcileSpecialSelection(data, 'vrpg-be', '', ''),
      { regimeId: '', definitionId: '' }
    );
    assert.deepEqual(
      reconcileSpecialSelection(data, 'vrpg-be', 'removed-regime', ''),
      { regimeId: '', definitionId: '' }
    );
  });

  it('zeigt MVP-Regime selektierbar und übrige Zustände klar deaktiviert', () => {
    const options = specialRegimeOptions(data, 'vrpg-be');
    const byId = new Map(options.map(option => [option.regime.regimeId, option]));

    assert.equal(byId.get('vrpg-be-general')?.selectable, true);
    assert.equal(byId.get('prg-be-111a-replacement-candidacy')?.presentationStatus, 'supported');
    assert.equal(byId.get('bgg-100-1-general-appeal')?.presentationStatus, 'followup');
    assert.equal(byId.get('bgg-100-1-general-appeal')?.selectable, false);
    assert.equal(byId.get('prg-be-69-empty-reference')?.presentationStatus, 'blocked');
    assert.equal(byId.get('prg-be-69-empty-reference')?.selectable, false);
    assert.equal(byId.get('atsg-60-social-insurance')?.presentationStatus, 'open');
    assert.equal(byId.get('atsg-60-social-insurance')?.selectable, false);
    assert.equal(byId.has('bpr-21-nomination-deadline'), false);
    assert.equal(byId.has('prg-be-16-municipal-extension'), false);
    assert.equal(byId.has('vpr-8a-cantonal-nomination-deadline'), false);
    assert.equal(byId.has('prv-be-66-filing-overlay'), false);
  });

  for (const goldenCase of suite.cases) {
    it(`${goldenCase.caseId} ist über das AP11C-UI-Eingabemodell auslösbar`, () => {
      const state = formState(goldenCase);
      const option = specialRegimeOptions(data, state.profileId)
        .find(item => item.regime.regimeId === state.specialRegimeId);
      assert.equal(option?.selectable, true);

      if (isGeneralCalculation(data, state)) {
        const result = calculateDeadline(createCalculationInput(data, state), data);
        assert.equal(result.outcome, goldenCase.expected.outcome);
        assert.equal(result.outcome === 'calculated' ? result.finalEnd : undefined, goldenCase.expected.finalDeadline?.date);
        return;
      }

      const input = createSpecialCalculationInput(data, state);
      assert.ok(input);
      const result = calculateSpecialDeadline(input, data);
      assert.equal(result.outcome, goldenCase.expected.outcome);
      assert.equal(result.finalDeadline?.date, goldenCase.expected.finalDeadline?.date);
    });
  }

  it('blockiert manipulierte unknown-Werte im Rechenkern weiterhin', () => {
    const zpo = calculateDeadline({
      profileId: 'zpo',
      inputDate: '2026-09-16',
      inputDateSemantics: 'legallyRelevantDeliveryOrEventDate',
      deadlineDays: 10,
      calendarId: 'be-public-holidays',
      selectors: {
        deliveryMethod: 'otherLegallyRelevantDate',
        procedureVariant: 'unknown'
      },
      confirmations: {},
      holidayAnchorCandidates: ['BE']
    }, data);
    const vrpg = calculateDeadline({
      profileId: 'vrpg-be',
      inputDate: '2026-09-16',
      inputDateSemantics: 'legallyRelevantDeliveryOrEventDate',
      deadlineDays: 10,
      calendarId: 'be-public-holidays',
      selectors: {
        deliveryMethod: 'otherLegallyRelevantDate',
        specialLawStatus: 'unknown'
      },
      confirmations: {},
      holidayAnchorCandidates: ['BE']
    }, data);

    assert.equal(zpo.outcome, 'blocked');
    assert.ok(zpo.blockReasonKeys.includes('unknownSelectorValue'));
    assert.equal(vrpg.outcome, 'blocked');
    assert.ok(vrpg.blockReasonKeys.includes('unknownSelectorValue'));
  });
});
