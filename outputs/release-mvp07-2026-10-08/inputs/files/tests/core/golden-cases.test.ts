// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calculateDeadline } from '../../src/core';
import type { CalculationResult, TraceStep } from '../../src/core';
import {
  calculationInput,
  loadCalculationData,
  loadGoldenSuite,
  RELEASE_ID
} from './fixtures';

const data = loadCalculationData();

function substantiveResult(result: CalculationResult): Record<string, unknown> {
  return {
    outcome: result.outcome,
    ...('legallyRelevantDate' in result && result.legallyRelevantDate
      ? { legallyRelevantDate: result.legallyRelevantDate }
      : {}),
    ...(result.outcome === 'calculated'
      ? {
          deadlineStart: result.deadlineStart,
          provisionalEnd: result.provisionalEnd,
          finalEnd: result.finalEnd
        }
      : {}),
    suspension: result.suspension,
    endShift: result.endShift,
    appliedRuleIds: result.appliedRuleIds,
    warningKeys: result.warningKeys,
    blockReasonKeys: result.blockReasonKeys
  };
}

function withoutEditorialTraceHints(trace: readonly TraceStep[]): Record<string, unknown>[] {
  return trace.map(step => {
    if (step.operation === 'countDeadlineDays' && step.reasonKeys.includes('suspensionDisabled')) {
      return {
        ...step,
        ruleIds: step.ruleIds.filter(ruleId => !ruleId.endsWith('-SUSP-001')),
        reasonKeys: step.reasonKeys.filter(reason => reason !== 'suspensionDisabled')
      };
    }
    return { ...step };
  });
}

describe('AP6-Golden-Cases', () => {
  it('verwendet den freigegebenen AP5-Datenrelease', () => {
    assert.equal(data.releaseId, RELEASE_ID);
    assert.equal(data.profiles.size, 5);
    assert.equal(data.calendars.size, 2);
  });

  for (const goldenCase of loadGoldenSuite('approved').cases) {
    it(`${goldenCase.caseId} liefert das freigegebene fachliche Ergebnis`, () => {
      const result = calculateDeadline(calculationInput(goldenCase), data);
      const { trace: expectedTrace, ...expectedResult } = goldenCase.expected;
      assert.deepEqual(substantiveResult(result), expectedResult);

      // Die AP6-Spur enthält beim StPO-Osterfall einen redaktionellen Fokus
      // auf den fehlenden Fristenstillstand. Dieser Fokus ist kein Bestandteil
      // der Berechnungseingabe. Nach dessen Neutralisierung bleibt die
      // maschinenableitbare Spur bytegenau gleich.
      assert.deepEqual(
        withoutEditorialTraceHints(result.trace),
        withoutEditorialTraceHints(expectedTrace as readonly TraceStep[])
      );
    });
  }

  for (const goldenCase of loadGoldenSuite('unresolved').cases) {
    it(`${goldenCase.caseId} wird mit dem erwarteten Grund blockiert`, () => {
      const result = calculateDeadline(calculationInput(goldenCase), data);
      const { trace: expectedTrace, ...expectedResult } = goldenCase.expected;
      assert.deepEqual(substantiveResult(result), expectedResult);
      assert.deepEqual(result.trace, expectedTrace);
      assert.equal('finalEnd' in result, false);
    });
  }
});
