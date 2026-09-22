// SPDX-License-Identifier: AGPL-3.0-only

import { calculateSpecialDeadline } from './calculateSpecialDeadline';
import { resolveQualifiedSpecialDeadline } from './qualifiedApplicability';
import type { QualifiedDeadlineInput } from './qualifiedTypes';
import type { SpecialDeadlineResult } from './specialTypes';
import type { CalculationData } from './types';

export function calculateQualifiedSpecialDeadline(input: QualifiedDeadlineInput, data: CalculationData): SpecialDeadlineResult {
  const resolution = resolveQualifiedSpecialDeadline(input, data);
  if (resolution.outcome === 'resolved') return calculateSpecialDeadline(resolution.specialInput, data);
  return {
    outcome: 'blocked',
    appliedRuleIds: [],
    appliedOverrideIds: [],
    gateResults: [],
    warningKeys: [],
    blockReasonKeys: resolution.blockReasonKeys,
    trace: [{ sequence: 1, operation: 'blockCalculation', ruleIds: [], reasonKeys: resolution.blockReasonKeys }]
  };
}
