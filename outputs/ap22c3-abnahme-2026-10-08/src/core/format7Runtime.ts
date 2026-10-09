// SPDX-License-Identifier: AGPL-3.0-only
import type { BoundCalendarRuntime } from './calendarResolution';
import type { CalculationData } from './types';

// Runtime capabilities are deliberately not serializable into case inputs or
// cache metadata. Every host restores them by revalidating the actual bytes.
const issued = new WeakSet<BoundCalendarRuntime>();
const qualifiedPaths = new WeakSet<CalculationData>();
export function registerFormat7Runtime(runtime: BoundCalendarRuntime): void { issued.add(runtime); }
export function isIssuedFormat7Runtime(runtime: BoundCalendarRuntime): boolean { return issued.has(runtime); }
export function trustedFormat7Runtime(data: CalculationData): BoundCalendarRuntime | undefined {
  const runtime = data.format7Runtime;
  return data.formatVersion === '7.0.0' && runtime && issued.has(runtime)
    && runtime.releaseId === data.releaseId ? runtime : undefined;
}
export function isFormat7ReferenceData(data: CalculationData): boolean {
  return trustedFormat7Runtime(data)?.referenceOnly === true;
}
export function hasQualifiedCalendarPath(data: CalculationData): boolean { return qualifiedPaths.has(data); }
/** Internal synchronous arithmetic scope. Not exported through the public API. */
export function withQualifiedCalendarPath<T>(data: CalculationData, operation: () => T): T {
  qualifiedPaths.add(data);
  try { return operation(); } finally { qualifiedPaths.delete(data); }
}
