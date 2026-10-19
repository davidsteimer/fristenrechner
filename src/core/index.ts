// SPDX-License-Identifier: AGPL-3.0-only

export { calculateDeadline, calculateRuntimeDeadline } from './calculateDeadline';
export { createCalculatorRuntime, createFormat7CalculationData, createFormat8CalculationData, createFormat9CalculationData } from './calculatorRuntime';
export { hasMatchingFormat8Runtime, isFormat8ReferenceData } from './format8Runtime';
export { hasMatchingFormat9Runtime, isFormat9ReferenceData } from './format9Runtime';
export type { Format8CalculatorRuntime, Format8RuntimeOptions } from './calculatorRuntime';
export type { Format9CalculatorRuntime, Format9RuntimeOptions } from './calculatorRuntime';
export type { CalculatorRuntime, Format7RuntimeOptions, ByteBoundReleaseLike } from './calculatorRuntime';
export { assertSocialProcedureCatalog, validateSocialCatalogReferences, canonicalSocialJson, socialObjectSha256 } from './socialCatalog';
export { resolveSocialDeadline, calculateSocialDeadline } from './socialDeadline';
export type { SocialProcedureCatalog, SocialDeadlineInput, SocialDeadlineResult } from './socialTypes';
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
