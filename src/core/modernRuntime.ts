// SPDX-License-Identifier: AGPL-3.0-only
import { trustedFormat8Runtime, isFormat8ReferenceData, withFormat8CalculationScope } from './format8Runtime';
import { trustedFormat9Runtime, isFormat9ReferenceData, withFormat9CalculationScope } from './format9Runtime';
import type { CalculationData } from './types';

/** Native registries remain separate. Shared dispatch never relabels data. */
export function trustedModernRuntime(data: CalculationData) {
  return trustedFormat8Runtime(data) ?? trustedFormat9Runtime(data);
}
export function isModernReferenceData(data: CalculationData): boolean {
  return isFormat8ReferenceData(data) || isFormat9ReferenceData(data);
}
export function withModernCalculationScope<T>(parent: CalculationData, scoped: CalculationData, operation: () => T): T {
  return parent.formatVersion === '9.0.0'
    ? withFormat9CalculationScope(parent, scoped, operation)
    : withFormat8CalculationScope(parent, scoped, operation);
}
