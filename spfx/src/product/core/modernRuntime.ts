import {trustedFormat17Runtime,isFormat17ReferenceData,withFormat17CalculationScope} from './format17Runtime';
import {trustedFormat16Runtime,isFormat16ReferenceData,withFormat16CalculationScope} from './format16Runtime';
import {trustedFormat15Runtime,isFormat15ReferenceData,withFormat15CalculationScope} from './format15Runtime';
import { trustedFormat14Runtime, isFormat14ReferenceData, withFormat14CalculationScope } from './format14Runtime';
// SPDX-License-Identifier: AGPL-3.0-only
import { trustedFormat8Runtime, isFormat8ReferenceData, withFormat8CalculationScope } from './format8Runtime';
import { trustedFormat9Runtime, isFormat9ReferenceData, withFormat9CalculationScope } from './format9Runtime';
import { trustedFormat10Runtime, isFormat10ReferenceData, withFormat10CalculationScope } from './format10Runtime';
import { trustedFormat11Runtime, isFormat11ReferenceData, withFormat11CalculationScope } from './format11Runtime';
import { trustedFormat12Runtime, isFormat12ReferenceData, withFormat12CalculationScope } from './format12Runtime';
import { trustedFormat13Runtime, isFormat13ReferenceData, withFormat13CalculationScope } from './format13Runtime';
import type { CalculationData } from './types';

/** Native registries remain separate. Shared dispatch never relabels data. */
export function trustedModernRuntime(data: CalculationData) {
  return trustedFormat8Runtime(data) ?? trustedFormat9Runtime(data) ?? trustedFormat10Runtime(data) ?? trustedFormat11Runtime(data) ?? trustedFormat12Runtime(data) ?? trustedFormat13Runtime(data) ?? trustedFormat14Runtime(data) ?? trustedFormat15Runtime(data) ?? trustedFormat16Runtime(data) ?? trustedFormat17Runtime(data);
}
export function isModernReferenceData(data: CalculationData): boolean {
  return isFormat8ReferenceData(data) || isFormat9ReferenceData(data) || isFormat10ReferenceData(data) || isFormat11ReferenceData(data) || isFormat12ReferenceData(data) || isFormat13ReferenceData(data) || isFormat14ReferenceData(data) || isFormat15ReferenceData(data) || isFormat16ReferenceData(data) || isFormat17ReferenceData(data);
}
export function withModernCalculationScope<T>(parent: CalculationData, scoped: CalculationData, operation: () => T): T {
  return parent.formatVersion === '17.0.0' ? withFormat17CalculationScope(parent, scoped, operation) : parent.formatVersion === '16.0.0' ? withFormat16CalculationScope(parent, scoped, operation) : parent.formatVersion === '15.0.0' ? withFormat15CalculationScope(parent, scoped, operation) : parent.formatVersion === '14.0.0' ? withFormat14CalculationScope(parent, scoped, operation) : parent.formatVersion === '13.0.0' ? withFormat13CalculationScope(parent, scoped, operation) : parent.formatVersion === '12.0.0' ? withFormat12CalculationScope(parent, scoped, operation) : parent.formatVersion === '11.0.0'
    ? withFormat11CalculationScope(parent, scoped, operation)
    : parent.formatVersion === '10.0.0'
    ? withFormat10CalculationScope(parent, scoped, operation)
    : parent.formatVersion === '9.0.0'
    ? withFormat9CalculationScope(parent, scoped, operation)
    : withFormat8CalculationScope(parent, scoped, operation);
}
