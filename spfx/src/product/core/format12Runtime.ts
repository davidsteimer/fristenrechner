// SPDX-License-Identifier: AGPL-3.0-only
import type { CalculationData } from './types';
import type { BoundCalendarRuntime } from './calendarResolution';
import type { ParsedFormat12Data } from './releaseFormat12';
import { assertTrustedFormat12Data } from './releaseFormat12';

interface Capability {
  readonly calendarRuntime: BoundCalendarRuntime;
  readonly administrativeContext: ParsedFormat12Data;
}
// Neither a spread copy, a serialized flag nor a cached parsed object is a
// release capability. Only the byte-validating factory issues this identity.
const issued = new WeakMap<CalculationData, Capability>();
const calendars = new WeakSet<BoundCalendarRuntime>();
/** Internal factory hook, deliberately absent from the public core barrel. */
export function registerFormat12Runtime(data: CalculationData, calendarRuntime: BoundCalendarRuntime,
  administrativeContext: ParsedFormat12Data): void {
  assertTrustedFormat12Data(administrativeContext);
  if (data.formatVersion !== '12.0.0' || data.releaseId !== administrativeContext.manifest.releaseId
    || calendarRuntime.releaseId !== data.releaseId || calendarRuntime.catalog !== administrativeContext.catalog
    || calendarRuntime.calendars !== administrativeContext.calendars
    || calendarRuntime.referenceOnly !== (administrativeContext.mode === 'localReference')) {
    throw new Error('Invalid Format-12 registration');
  }
  issued.set(data, Object.freeze({ calendarRuntime, administrativeContext }));
  calendars.add(calendarRuntime);
}
export function trustedFormat12Runtime(data: CalculationData): BoundCalendarRuntime | undefined {
  const capability = issued.get(data);
  return data.formatVersion === '12.0.0' && capability?.calendarRuntime.releaseId === data.releaseId
    ? capability.calendarRuntime : undefined;
}
export function isIssuedFormat12CalendarRuntime(runtime: BoundCalendarRuntime): boolean { return calendars.has(runtime); }
export function isFormat12ReferenceData(data: CalculationData): boolean { return trustedFormat12Runtime(data)?.referenceOnly === true; }
export function hasMatchingFormat12Runtime(data: CalculationData, calendarRuntime: BoundCalendarRuntime | undefined,
  administrativeContext: unknown): boolean {
  const capability = issued.get(data);
  return !!capability && trustedFormat12Runtime(data) === calendarRuntime
    && capability.administrativeContext === administrativeContext;
}
/** Synchronous internal scope for a qualified, narrower calculation plan. */
export function withFormat12CalculationScope<T>(parent: CalculationData, scoped: CalculationData, operation: () => T): T {
  if (parent.formatVersion !== '12.0.0') return operation();
  const capability = issued.get(parent);
  if (!capability || scoped.formatVersion !== '12.0.0' || scoped.releaseId !== parent.releaseId
    || scoped.profiles !== parent.profiles || scoped.coverage.from < parent.coverage.from
    || (parent.coverage.to !== null && (scoped.coverage.to === null || scoped.coverage.to > parent.coverage.to))) {
    throw new Error('Invalid Format-12 calculation scope');
  }
  const previous = issued.get(scoped);
  issued.set(scoped, capability);
  try { return operation(); } finally {
    if (previous) issued.set(scoped, previous);
    else issued.delete(scoped);
  }
}
