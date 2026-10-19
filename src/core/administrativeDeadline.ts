// SPDX-License-Identifier: AGPL-3.0-only
import { parseIsoDate } from './date';
import { countDayDeadline } from './dayDeadlineArithmetic';
import { generateCalendarFromRules } from './generateCalendar';
import { administrativeIntervalContains, administrativePeriodDate } from './administrativeCatalog';
import { getVerifiedAdministrativeContext } from './administrativeContext';
import type { AdministrativeCaseQualification } from './administrativeTypesV2';
import type { AdministrativeInterval, AdministrativePath, AdministrativeSourceRef } from './administrativeTypes';
import type { CalendarRuleSet } from './calendarRuleTypes';
import type { Holiday } from './types';

/** Case facts are current facts, never a stored eligibility or calendar capability. */
export interface AdministrativeDeadlineInput {
  readonly selection: {
    readonly kind: 'cantonalAdministrative';
    readonly lawId: string;
    readonly pathId: string;
    readonly revision: number;
    readonly stage: string;
  };
  readonly authoritySeat: {
    readonly canton: string;
    readonly level: 'cantonal';
    readonly qualification: 'competentAuthorityForCurrentAction';
  };
  readonly inputDate: string;
  readonly deadlineDays?: number;
  readonly qualification: {
    readonly delivery: 'qualifiedActualDelivery';
    readonly generalRoute: 'qualified';
    readonly specialLaw: 'excluded' | 'applicableFederalSpecialLaw' | 'unknown';
    readonly explicitHolidayException: 'none' | 'present' | 'unknown';
    readonly fixedEndDate: boolean;
    readonly deviatingStart: boolean;
    readonly evidenceAdvance: boolean;
  };
  readonly urgency: 'none' | 'explicitJudicialUrgencyOrder' | 'unknown';
  readonly caseQualification?: AdministrativeCaseQualification;
}

export interface AdministrativeProvenance {
  readonly kind: 'cantonalAdministrative';
  readonly catalogId: string;
  readonly lawId: string;
  readonly pathId: string;
  readonly revision: number;
  readonly stage: string;
  readonly releaseId: string;
  readonly holidayBindingId: string;
  readonly calendarId: string;
  readonly projectionId: string;
  readonly holidayRole: 'authoritySeat';
  readonly authoritySeatCanton: string;
  readonly suspensionProfileId: string;
  readonly urgencyApplied: boolean;
  readonly sourceRefs: readonly AdministrativeSourceRef[];
  readonly qualificationPolicySha256?: string;
}

export type AdministrativeDeadlineResult = {
  readonly outcome: 'blocked';
  readonly blockReasonKeys: readonly string[];
  readonly calendarExportAllowed: false;
  readonly provisionalEnd?: string;
  readonly blockedDate?: string;
  readonly periodIds?: readonly string[];
  readonly shiftReasonKeys?: readonly string[];
  readonly shiftedHolidayIds?: readonly string[];
  readonly provenance?: AdministrativeProvenance;
} | {
  readonly outcome: 'calculated';
  readonly ordinaryStart: string;
  readonly deadlineStart: string;
  readonly provisionalEnd: string;
  readonly finalEnd: string;
  readonly deadlineDays: number;
  readonly countedDates: readonly string[];
  readonly skippedCalendarDays: number;
  readonly encounteredPeriodIds: readonly string[];
  readonly shiftReasonKeys: readonly string[];
  readonly shiftedHolidayIds: readonly string[];
  readonly startShiftApplied: boolean;
  readonly referenceOnly: boolean;
  /** Descriptive eligibility, not a serializable export capability. */
  readonly calendarExportAllowed: boolean;
  readonly provenance: AdministrativeProvenance;
};

function own(value: object, key: string): boolean { return Object.prototype.hasOwnProperty.call(value, key); }
function closed(value: unknown, required: readonly string[], optional: readonly string[] = []): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && required.every(key => own(value, key))
    && Object.keys(value).every(key => required.includes(key) || optional.includes(key));
}
function validInput(input: AdministrativeDeadlineInput, format9: boolean): boolean {
  if (!closed(input, ['selection', 'authoritySeat', 'inputDate', 'qualification', 'urgency'],
    format9 ? ['deadlineDays', 'caseQualification'] : ['deadlineDays'])) return false;
  if (own(input, 'caseQualification') && !closed(input.caseQualification,
    ['action', 'decisionKind', 'unit', 'direction', 'opening', 'notice', 'termChange'])) return false;
  const selection = input.selection;
  if (!closed(selection, ['kind', 'lawId', 'pathId', 'revision', 'stage'])
    || selection.kind !== 'cantonalAdministrative'
    || (['lawId', 'pathId', 'stage'] as const).some(key => typeof selection[key] !== 'string' || !selection[key])
    || !Number.isInteger(selection.revision) || selection.revision < 1) return false;
  const seat = input.authoritySeat;
  if (!closed(seat, ['canton', 'level', 'qualification']) || typeof seat.canton !== 'string'
    || seat.level !== 'cantonal' || seat.qualification !== 'competentAuthorityForCurrentAction') return false;
  const q = input.qualification;
  if (!closed(q, ['delivery', 'generalRoute', 'specialLaw', 'explicitHolidayException', 'fixedEndDate', 'deviatingStart', 'evidenceAdvance'])
    || q.delivery !== 'qualifiedActualDelivery' || q.generalRoute !== 'qualified'
    || !['excluded', 'applicableFederalSpecialLaw', 'unknown'].includes(q.specialLaw)
    || !['none', 'present', 'unknown'].includes(q.explicitHolidayException)
    || [q.fixedEndDate, q.deviatingStart, q.evidenceAdvance].some(value => typeof value !== 'boolean')) return false;
  return typeof input.inputDate === 'string' && !!parseIsoDate(input.inputDate)
    && ['none', 'explicitJudicialUrgencyOrder', 'unknown'].includes(input.urgency)
    && (!own(input, 'deadlineDays') || (typeof input.deadlineDays === 'number' && Number.isInteger(input.deadlineDays)
      && input.deadlineDays >= 1 && input.deadlineDays <= 365));
}
function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(child => freeze(child));
    Object.freeze(value);
  }
  return value;
}
function blocked(reason: string): AdministrativeDeadlineResult {
  return freeze({outcome: 'blocked', blockReasonKeys: [reason], calendarExportAllowed: false});
}
function uniqueRefs(refs: readonly AdministrativeSourceRef[]): readonly AdministrativeSourceRef[] {
  return refs.filter((ref, index) => refs.findIndex(other => other.sourceId === ref.sourceId && other.locator === ref.locator) === index);
}
function duration(path: AdministrativePath, input: AdministrativeDeadlineInput): number | undefined {
  if (path.duration.kind === 'statutoryDays') {
    return own(input, 'deadlineDays') && input.deadlineDays !== path.duration.value ? undefined : path.duration.value;
  }
  return typeof input.deadlineDays === 'number' && input.deadlineDays >= path.duration.minimum
    && input.deadlineDays <= path.duration.maximum ? input.deadlineDays : undefined;
}
function intersection(intervals: readonly AdministrativeInterval[]): {from: string; to: string} | undefined {
  const from = intervals.map(interval => interval.from).sort().at(-1)!;
  const to = intervals.flatMap(interval => interval.to === null ? [] : [interval.to]).sort()[0];
  return to && from <= to ? {from, to} : undefined;
}
function calendarDependencies(calendars: readonly CalendarRuleSet[], calendarId: string): readonly CalendarRuleSet[] {
  const seen = new Set<string>();
  const result: CalendarRuleSet[] = [];
  function collect(id: string): void {
    if (seen.has(id)) return;
    seen.add(id);
    const calendar = calendars.find(candidate => candidate.calendarId === id);
    if (!calendar) throw new Error('Missing bound calendar dependency');
    result.push(calendar);
    calendar.inherits.forEach(collect);
  }
  collect(calendarId);
  return result;
}

/**
 * The plan is private and synchronously derived from an identity-checked reader
 * result. Neither a UI calendar map nor a serialized approved flag is accepted.
 * Calendar-3 holidays supply physical dates only. The catalogue supplies their
 * independent legal binding and its own suspension rules.
 */
export function calculateAdministrativeDeadline(input: AdministrativeDeadlineInput, context: unknown): AdministrativeDeadlineResult {
  try {
    const data = getVerifiedAdministrativeContext(context);
    if (!data) return blocked('administrative.untrustedRelease');
    if (!validInput(input, data.catalog.formatVersion === '2.0.0')) return blocked('administrative.inputContractInvalid');
    const q = input.qualification;
    if (q.specialLaw === 'applicableFederalSpecialLaw') return blocked('administrative.separatelyQualifiedFederalPathRequired');
    if (q.specialLaw !== 'excluded') return blocked('administrative.specialLawUnresolved');
    if (q.explicitHolidayException !== 'none') return blocked('administrative.explicitHolidayExceptionUnresolved');
    if (q.fixedEndDate || q.deviatingStart || q.evidenceAdvance) return blocked('administrative.unsupportedProcedure');
    const {catalog} = data;
    const selection = input.selection;
    const path = catalog.paths.find(candidate => candidate.pathId === selection.pathId && candidate.lawId === selection.lawId
      && candidate.revision === selection.revision);
    if (!path) return blocked('administrative.unknownPath');
    if (!path.stages.some(stage => stage === selection.stage)) return blocked('administrative.stageMismatch');
    const policy = catalog.formatVersion === '2.0.0'
      ? catalog.qualificationPolicies.find(candidate => candidate.pathId === path.pathId && candidate.pathRevision === path.revision)
      : undefined;
    if (catalog.formatVersion === '2.0.0') {
      if (!policy) return blocked('administrative.qualificationPolicyMissing');
      if (policy.mode === 'legacyV1') {
        // Preserve the historical case contract. Do not ignore new, conflicting
        // assertions attached to an old route.
        if (own(input, 'caseQualification')) return blocked('administrative.inputContractInvalid');
      } else {
        const facts = input.caseQualification, required = policy.requirements;
        if (!facts) return blocked('administrative.caseQualificationRequired');
        if (facts.direction !== 'forward' || facts.unit !== required.unit) return blocked('administrative.unsupportedProcedure');
        if (facts.action !== required.action) return blocked('administrative.actionMismatch');
        if (facts.decisionKind !== required.decisionKind) return blocked('administrative.decisionNotQualified');
        if (facts.opening !== required.opening) return blocked('administrative.openingNotQualified');
        if (facts.notice !== required.notice) return blocked('administrative.noticeNotQualified');
        if (facts.termChange !== required.termChange) return blocked('administrative.termChanged');
        if (input.urgency !== required.urgency) return blocked('administrative.unsupportedUrgency');
      }
    }
    const law = catalog.laws.find(candidate => candidate.lawId === path.lawId)!;
    const binding = catalog.holidayBindings.find(candidate => candidate.holidayBindingId === path.holidayBindingId)!;
    if (law.canton !== input.authoritySeat.canton || binding.authoritySeatCanton !== input.authoritySeat.canton) return blocked('administrative.authoritySeatMismatch');
    const days = duration(path, input);
    if (days === undefined) return blocked('administrative.durationMismatch');
    const urgent = input.urgency === 'explicitJudicialUrgencyOrder';
    if (input.urgency === 'unknown') return blocked('administrative.urgencyUnresolved');
    if (urgent && (path.urgencyPolicy !== 'explicitGRJudicialUrgencyOrder' || selection.stage !== 'court')) return blocked('administrative.unsupportedUrgency');
    const eligibility = catalog.releaseBinding.pathEligibility.find(candidate => candidate.pathId === path.pathId
      && candidate.pathRevision === path.revision && candidate.status === (data.referenceOnly ? 'candidate' : 'approved'));
    if (!eligibility) return blocked('administrative.pathNotReleased');
    const temporal = path.temporalBinding;
    if (![temporal.caseCoverage, eligibility.caseCoverage].every(interval => administrativeIntervalContains(interval, input.inputDate))) return blocked('administrative.outsideCaseCoverage');
    const calendars = calendarDependencies(data.calendars, binding.physicalBaseline.calendarId);
    const intervals = [data.coverage, temporal.calculationCoverage, temporal.sourceCoverage, temporal.normVersionCoverage,
      eligibility.calculationCoverage, ...calendars.map(calendar => calendar.validity)];
    const range = intersection(intervals);
    if (!range || !intervals.every(interval => administrativeIntervalContains(interval, input.inputDate))) return blocked('dataCoverageExceeded');
    const generated = generateCalendarFromRules(calendars, binding.physicalBaseline.calendarId, range);
    const holidays = new Map<string, Holiday[]>();
    generated.calendar.holidays.forEach(holiday => holidays.set(holiday.date, [...(holidays.get(holiday.date) ?? []), holiday]));
    const suspension = catalog.suspensionProfiles.find(profile => profile.suspensionProfileId === path.suspensionProfileId)!;
    const periods: {periodId: string; startsOn: string; endsOn: string}[] = [];
    if (!urgent) {
      for (let year = Number(range.from.slice(0, 4)) - 1; year <= Number(range.to.slice(0, 4)); year += 1) {
        for (const period of suspension.periods) periods.push({periodId: `${period.periodId}-${year}`,
          startsOn: administrativePeriodDate(period.start, year), endsOn: administrativePeriodDate(period.end, year)});
      }
    }
    const provenance: AdministrativeProvenance = {
      kind: 'cantonalAdministrative', catalogId: catalog.catalogId, lawId: path.lawId,
      pathId: path.pathId, revision: path.revision, stage: selection.stage, releaseId: data.releaseId,
      holidayBindingId: binding.holidayBindingId, calendarId: binding.physicalBaseline.calendarId,
      projectionId: binding.physicalBaseline.projectionId, holidayRole: 'authoritySeat', authoritySeatCanton: law.canton,
      suspensionProfileId: suspension.suspensionProfileId, urgencyApplied: urgent,
      ...('qualificationPolicySha256' in eligibility && typeof eligibility.qualificationPolicySha256 === 'string'
        ? { qualificationPolicySha256: eligibility.qualificationPolicySha256 } : {}),
      sourceRefs: uniqueRefs([...law.sourceRefs, ...path.sourceRefs, ...binding.legalBinding.sourceRefs, ...suspension.sourceRefs])
    };
    const result = countDayDeadline({legallyRelevantDate: input.inputDate, deadlineDays: days, periods,
      shiftStartDuringSuspension: true, holidaysByDate: holidays,
      isCovered: date => intervals.every(interval => administrativeIntervalContains(interval, date)),
      blockEndShiftIntoSuspension: path.endShiftGuard === 'blockWhenEnteringApplicableSuspension' && !urgent});
    if (result.outcome === 'blocked') {
      const {reason, outcome, ...trace} = result;
      return freeze({outcome, ...trace, blockReasonKeys: [reason], calendarExportAllowed: false, provenance});
    }
    return freeze({...result, deadlineDays: days, referenceOnly: data.referenceOnly,
      calendarExportAllowed: !data.referenceOnly, provenance});
  } catch {
    return blocked('administrative.dataContractInvalid');
  }
}
