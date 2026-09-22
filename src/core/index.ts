// SPDX-License-Identifier: AGPL-3.0-only

export { calculateDeadline } from './calculateDeadline';
export {
  assertHolidayCatalog,
  assertHolidayCatalogProjection,
  evaluateHolidayCatalogRule,
  projectHolidayRules
} from './holidayCatalog';
export type { HolidayCatalog, HolidayCatalogRule } from './holidayCatalogTypes';
export { calculateSpecialDeadline } from './calculateSpecialDeadline';
export { calculateQualifiedSpecialDeadline } from './calculateQualifiedSpecialDeadline';
export { resolveQualifiedSpecialDeadline } from './qualifiedApplicability';
export type { QualifiedDeadlineInput, QualifiedApplicability, QualifiedCalculationEvidence, QualifiedDeadlineResolution } from './qualifiedTypes';
export {
  calendarGenerationRangeForDates,
  createCalculationData,
  CoreDataError,
  isWithinReleaseCoverage,
  resolveCalendar
} from './data';
export {
  calculateCalendarRuleOccurrence,
  calculateGregorianEaster,
  CalendarGenerationError,
  generateCalendarFromRules
} from './generateCalendar';
export {
  addCalendarDays,
  addCalendarMonths,
  compareIsoDates,
  isDateWithin,
  isLeapDay,
  isLeapYear,
  isoDateFromOrdinal,
  parseIsoDate,
  weekdayIndex,
  weekdayReason
} from './date';
export type {
  BlockedDeadlineResult,
  CalculatedDeadlineResult,
  CalculationData,
  CalculationInput,
  CalculationResult,
  CalendarGenerationEvidence,
  CalendarTraceEvidence,
  CalendarData,
  Holiday,
  InputDateSemantics,
  IsoDate,
  LegalProfile,
  LegalRule,
  ResolvedCalendar,
  SuspensionPeriod,
  SuspensionSet,
  TraceStep,
  ValidatedReleaseArtifactLike,
  ValidatedReleaseLike
} from './types';
export type {
  CalendarGenerationRange,
  CalendarRule,
  CalendarRuleApplication,
  CalendarRuleOccurrence,
  CalendarRuleSet,
  GeneratedCalendar
} from './calendarRuleTypes';
export type {
  AuthoritativeDeadlineDefinition,
  BlockedSpecialDeadlineResult,
  CalculatedDeadlineDefinition,
  CompletedSpecialDeadlineResult,
  DeadlineDefinition,
  DeadlineOrigin,
  FilingProfile,
  FilingRequirement,
  SpecialCalculation,
  SpecialCalculationContext,
  SpecialDeadlineInput,
  SpecialDeadlineResult,
  SpecialDeadlineValue,
  SpecialRegime,
  SpecialRegimeCatalog,
  SpecialTraceStep
} from './specialTypes';
