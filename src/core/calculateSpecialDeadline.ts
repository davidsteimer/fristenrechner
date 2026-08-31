// SPDX-License-Identifier: AGPL-3.0-only

import {
  addCalendarDays,
  addCalendarMonths,
  compareIsoDates,
  isDateWithin,
  parseIsoDate,
  weekdayIndex,
  weekdayReason
} from './date';
import {
  calendarGenerationRangeForDates,
  isWithinReleaseCoverage,
  resolveCalendar
} from './data';
import { CalendarGenerationError } from './generateCalendar';
import type {
  CalculationData,
  CalendarTraceEvidence,
  IsoDate,
  ResolvedCalendar,
  SuspensionPeriod
} from './types';
import type {
  CalculatedDeadlineDefinition,
  DeadlineDefinition,
  FilingProfile,
  FilingRequirement,
  SpecialCalculationContext,
  SpecialDeadlineInput,
  SpecialDeadlineResult,
  SpecialDeadlineValue,
  SpecialDuration,
  SpecialGateResult,
  SpecialRegimeCatalog,
  SpecialTraceStep,
  WeekdayCalculation,
  WeekdayName
} from './specialTypes';

type TraceWithoutSequence = Omit<SpecialTraceStep, 'sequence'>;

const WEEKDAY_INDEX: Readonly<Record<WeekdayName, number>> = Object.freeze({
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6
});

const ORDINAL_REASON: Readonly<Record<number, string>> = Object.freeze({
  1: 'first',
  2: 'second',
  3: 'third',
  4: 'fourth',
  5: 'fifth'
});

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function withSequence(steps: readonly TraceWithoutSequence[]): SpecialTraceStep[] {
  return steps.map((step, index) => ({ sequence: index + 1, ...step }));
}

function blocked(
  reasons: readonly string[],
  options: {
    readonly ruleIds?: readonly string[];
    readonly overrideIds?: readonly string[];
    readonly warnings?: readonly string[];
    readonly context?: SpecialCalculationContext;
    readonly inputDates?: readonly IsoDate[];
  } = {}
): SpecialDeadlineResult {
  return {
    outcome: 'blocked',
    ...(options.context ? { calculationContext: options.context } : {}),
    appliedRuleIds: unique(options.ruleIds ?? []),
    appliedOverrideIds: unique(options.overrideIds ?? []),
    gateResults: [],
    warningKeys: unique(options.warnings ?? []),
    blockReasonKeys: unique(reasons),
    trace: withSequence([{
      operation: 'blockCalculation',
      ...(options.inputDates && options.inputDates.length > 0
        ? { inputDates: unique(options.inputDates).sort(compareIsoDates) }
        : {}),
      ruleIds: unique(options.ruleIds ?? []),
      reasonKeys: unique(reasons)
    }])
  };
}

function catalogForProfile(
  data: CalculationData,
  profileId: string
): SpecialRegimeCatalog | undefined {
  const matches = [...data.specialRegimeCatalogs.values()]
    .filter(catalog => catalog.profileId === profileId);
  return matches.length === 1 ? matches[0] : undefined;
}

function findById<T>(values: readonly T[], field: keyof T, id: string): T | undefined {
  return values.find(value => value[field] === id);
}

function allInputDates(input: SpecialDeadlineInput): IsoDate[] {
  return unique(Object.values(input.dateValues)).sort(compareIsoDates);
}

function validatePrimitiveInputs(input: SpecialDeadlineInput): string[] {
  const reasons: string[] = [];
  if (!input.profileId) reasons.push('profileMissing');
  if (!input.regimeId) reasons.push('regimeMissing');
  if (!input.ruleId) reasons.push('deadlineDefinitionMissing');
  if (Object.values(input.dateValues).some(value => !parseIsoDate(value))) {
    reasons.push('invalidDateValue');
  }
  if (Object.values(input.localTimeValues)
    .some(value => !/^(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(value))) {
    reasons.push('invalidLocalTimeValue');
  }
  if (Object.values(input.integerValues)
    .some(value => !Number.isInteger(value) || value < 1 || value > 365)) {
    reasons.push('invalidIntegerValue');
  }
  if (new Set(input.overrideConfirmations).size !== input.overrideConfirmations.length) {
    reasons.push('duplicateOverrideConfirmation');
  }
  return reasons;
}

function contextFor(
  data: CalculationData,
  catalog: SpecialRegimeCatalog,
  input: SpecialDeadlineInput,
  definition: DeadlineDefinition,
  calendarId: string | null
): SpecialCalculationContext {
  return {
    releaseId: data.releaseId,
    catalogId: catalog.catalogId,
    profileId: input.profileId,
    regimeId: input.regimeId,
    ruleId: input.ruleId,
    deadlineOrigin: definition.deadlineOrigin,
    calendarProfileId: input.calendarProfileId,
    calendarId,
    suspensionProfileId: input.suspensionProfileId,
    filingProfileId: input.filingProfileId
  };
}

function requiredIntegerIds(definition: CalculatedDeadlineDefinition): string[] {
  const calculation = definition.calculation;
  return calculation.type === 'R1_RELATIVE' && calculation.durationInputId
    ? [calculation.durationInputId]
    : [];
}

function inputContractReasons(
  input: SpecialDeadlineInput,
  definition: CalculatedDeadlineDefinition
): string[] {
  const reasons: string[] = [];
  const dateAnchors = definition.anchors
    .filter(anchor => anchor.valueType === 'date')
    .map(anchor => anchor.inputId);
  const timeAnchors = definition.anchors
    .filter(anchor => anchor.valueType === 'localTime')
    .map(anchor => anchor.inputId);
  const integerIds = requiredIntegerIds(definition);
  const suppliedDates = Object.keys(input.dateValues);
  const suppliedTimes = Object.keys(input.localTimeValues);
  const suppliedIntegers = Object.keys(input.integerValues);

  if (dateAnchors.some(id => input.dateValues[id] === undefined)) reasons.push('requiredDateValueMissing');
  if (timeAnchors.some(id => input.localTimeValues[id] === undefined)) reasons.push('requiredLocalTimeValueMissing');
  if (integerIds.some(id => input.integerValues[id] === undefined)) reasons.push('requiredIntegerValueMissing');
  if (suppliedDates.some(id => !dateAnchors.includes(id))) reasons.push('unexpectedDateValue');
  if (suppliedTimes.some(id => !timeAnchors.includes(id))) reasons.push('unexpectedLocalTimeValue');
  if (suppliedIntegers.some(id => !integerIds.includes(id))) reasons.push('unexpectedIntegerValue');

  definition.anchors.forEach(anchor => {
    if (!anchor.fixedMonthDay || anchor.valueType !== 'date') return;
    const value = input.dateValues[anchor.inputId];
    if (value && value.slice(5) !== anchor.fixedMonthDay) {
      reasons.push('anchorConstraintMismatch');
    }
  });
  return unique(reasons);
}

function durationFor(
  definition: CalculatedDeadlineDefinition,
  input: SpecialDeadlineInput
): SpecialDuration | undefined {
  if (definition.calculation.type !== 'R1_RELATIVE') return undefined;
  if (definition.calculation.duration) return definition.calculation.duration;
  const inputId = definition.calculation.durationInputId;
  const value = inputId ? input.integerValues[inputId] : undefined;
  return value === undefined ? undefined : { value, unit: 'day' };
}

function applyDuration(
  anchor: IsoDate,
  duration: SpecialDuration,
  direction: 'after' | 'before',
  boundary: 'included' | 'excluded'
): IsoDate {
  const sign = direction === 'after' ? 1 : -1;
  if (duration.unit === 'month') {
    return addCalendarMonths(anchor, sign * duration.value);
  }
  const boundaryAdjustment = boundary === 'included' ? 1 : 0;
  return addCalendarDays(anchor, sign * (duration.value - boundaryAdjustment));
}

function calculateWeekday(anchor: IsoDate, calculation: WeekdayCalculation): IsoDate {
  const target = WEEKDAY_INDEX[calculation.weekday];
  const direction = calculation.direction === 'after' ? 1 : -1;
  let current = anchor;
  let matches = !calculation.strict && weekdayIndex(current) === target ? 1 : 0;
  while (matches < calculation.ordinal) {
    current = addCalendarDays(current, direction);
    if (weekdayIndex(current) === target) matches += 1;
  }
  return current;
}

function weekdayReasonKey(calculation: WeekdayCalculation): string {
  const ordinal = ORDINAL_REASON[calculation.ordinal] ?? `ordinal${calculation.ordinal}`;
  const weekday = calculation.weekday[0]?.toUpperCase() + calculation.weekday.slice(1);
  const direction = calculation.direction === 'after' ? 'After' : 'Before';
  return `${ordinal}${weekday}${direction}Anchor`;
}

function activePeriods(periods: readonly SuspensionPeriod[], date: IsoDate): SuspensionPeriod[] {
  return periods.filter(period => isDateWithin(date, period.startsOn, period.endsOn));
}

function countRelativeWithSuspension(
  anchor: IsoDate,
  duration: SpecialDuration,
  direction: 'after' | 'before',
  boundary: 'included' | 'excluded',
  periods: readonly SuspensionPeriod[],
  data: CalculationData,
  calendar: ResolvedCalendar
): { readonly date: IsoDate; readonly periodIds: readonly string[]; readonly skippedDays: number } | undefined {
  if (duration.unit !== 'day' || direction !== 'after') return undefined;
  let current = boundary === 'included' ? anchor : addCalendarDays(anchor, 1);
  let counted = 0;
  let skippedDays = 0;
  const periodIds: string[] = [];
  while (counted < duration.value) {
    if (!isWithinReleaseCoverage(current, data)
      || !isDateWithin(current, calendar.coverage.from, calendar.coverage.to)) {
      return undefined;
    }
    const matches = activePeriods(periods, current);
    if (matches.length > 0) {
      skippedDays += 1;
      matches.forEach(period => {
        if (!periodIds.includes(period.periodId)) periodIds.push(period.periodId);
      });
    } else {
      counted += 1;
    }
    if (counted < duration.value) current = addCalendarDays(current, 1);
  }
  return { date: current, periodIds, skippedDays };
}

function specialCoverage(
  data: CalculationData,
  calendar: ResolvedCalendar | undefined
): { readonly from: IsoDate; readonly to: IsoDate } | undefined {
  const calendars = [...data.calendars.values()];
  if (!calendar && calendars.length === 0) return undefined;
  const from = calendar?.coverage.from ?? calendars
    .map(item => item.coverage.from)
    .sort(compareIsoDates)
    .at(-1);
  const to = calendar?.coverage.to ?? calendars
    .map(item => item.coverage.to)
    .sort(compareIsoDates)[0];
  if (!from || !to) return undefined;
  const intersectedFrom = compareIsoDates(from, data.coverage.from) > 0
    ? from
    : data.coverage.from;
  const releaseTo = data.coverage.to ?? '9999-12-31';
  const intersectedTo = compareIsoDates(to, releaseTo) < 0 ? to : releaseTo;
  return compareIsoDates(intersectedFrom, intersectedTo) <= 0
    ? { from: intersectedFrom, to: intersectedTo }
    : undefined;
}

function calendarEvidenceForIds(
  calendar: ResolvedCalendar | undefined,
  resultIds: readonly string[]
): CalendarTraceEvidence | undefined {
  if (!calendar?.generation || resultIds.length === 0) return undefined;
  const ids = new Set(resultIds);
  const applications = calendar.generation.applications.filter(application =>
    [...application.generatedIds, ...application.removedIds].some(id => ids.has(id))
  );
  return applications.length > 0
    ? {
        releaseId: calendar.generation.releaseId,
        calendarId: calendar.generation.calendarId,
        applications
      }
    : undefined;
}

function evidenceRuleIds(evidence: CalendarTraceEvidence | undefined): string[] {
  return evidence ? unique(evidence.applications.map(application => application.ruleId)) : [];
}

function deadlineValue(date: IsoDate): SpecialDeadlineValue {
  return { date, localTime: null, timezone: null };
}

function filingRequirement(profile: FilingProfile): FilingRequirement {
  return {
    filingProfileId: profile.filingProfileId,
    preservationMode: profile.preservationMode,
    originalRequired: profile.originalRequired,
    cutoffTime: profile.cutoffTime,
    timezone: profile.timezone,
    acceptedChannels: profile.acceptedChannels,
    acceptedEvidence: profile.acceptedEvidence
  };
}

function filingReason(profile: FilingProfile): string {
  if (profile.preservationMode === 'dispatch') return 'dispatchSuffices';
  if (profile.preservationMode === 'receipt') return 'authorityReceiptRequired';
  if (profile.preservationMode === 'originalReceipt' && profile.cutoffTime === '12:00:00') {
    return 'originalReceiptBy1200';
  }
  if (profile.preservationMode === 'registeredDispatch') return 'registeredDispatchRequired';
  if (profile.preservationMode === 'electronicReceipt') return 'electronicReceiptRequired';
  return 'filingNotApplicable';
}

function overrideWarning(overrideId: string): string {
  if (overrideId === 'OVR-PRG111A-CROSSREF') return 'warning.override.prg111aCrossReference';
  return `warning.override.${overrideId.toLowerCase().replaceAll('-', '.')}`;
}

export function calculateSpecialDeadline(
  input: SpecialDeadlineInput,
  data: CalculationData
): SpecialDeadlineResult {
  const primitiveReasons = validatePrimitiveInputs(input);
  if (primitiveReasons.length > 0) {
    return blocked(primitiveReasons, { inputDates: allInputDates(input), warnings: ['warning.input.invalid'] });
  }

  const catalog = catalogForProfile(data, input.profileId);
  if (!catalog) {
    return blocked(['specialRegimeCatalogUnresolved'], {
      inputDates: allInputDates(input),
      warnings: ['warning.catalog.unresolved']
    });
  }
  const regime = findById(catalog.regimes, 'regimeId', input.regimeId);
  const definition = findById(catalog.deadlineDefinitions, 'deadlineDefinitionId', input.ruleId);
  if (!regime) return blocked(['unknownRegime'], { inputDates: allInputDates(input) });
  if (!definition) return blocked(['unknownDeadlineDefinition'], { inputDates: allInputDates(input) });

  const calendarProfile = findById(catalog.calendarProfiles, 'calendarProfileId', input.calendarProfileId);
  const suspensionProfile = findById(
    catalog.suspensionProfiles,
    'suspensionProfileId',
    input.suspensionProfileId
  );
  const filing = findById(catalog.filingProfiles, 'filingProfileId', input.filingProfileId);
  const context = contextFor(data, catalog, input, definition, calendarProfile?.calendarId ?? null);
  const ruleIds = [definition.deadlineDefinitionId];

  if (!regime.deadlineDefinitionIds.includes(definition.deadlineDefinitionId)) {
    return blocked(['deadlineDefinitionRegimeMismatch'], { context, ruleIds, inputDates: allInputDates(input) });
  }
  if (regime.status !== 'supported' || definition.status !== 'supported') {
    return blocked(
      [regime.status === 'blocked' || definition.status === 'blocked' ? 'specialRegimeBlocked' : 'specialRegimeOpen'],
      { context, ruleIds, inputDates: allInputDates(input), warnings: [regime.statusReasonKey] }
    );
  }
  if (definition.deadlineOrigin === 'AUTHORITATIVE') {
    return blocked(['authoritativeDeadlineNotCalculable'], {
      context,
      ruleIds,
      inputDates: allInputDates(input),
      warnings: ['warning.authoritativeDeadline.useOfficialAct']
    });
  }
  if (!calendarProfile || !suspensionProfile || !filing) {
    return blocked(['unknownComponentProfile'], { context, ruleIds, inputDates: allInputDates(input) });
  }
  if (regime.calendarProfileId !== input.calendarProfileId
    || regime.suspensionProfileId !== input.suspensionProfileId
    || regime.filingProfileId !== input.filingProfileId
    || definition.resultPolicy.calendarProfileId !== input.calendarProfileId
    || definition.resultPolicy.suspensionProfileId !== input.suspensionProfileId
    || definition.filingProfileId !== input.filingProfileId) {
    return blocked(['componentProfileMismatch'], { context, ruleIds, inputDates: allInputDates(input) });
  }

  const contractReasons = inputContractReasons(input, definition);
  if (contractReasons.length > 0) {
    return blocked(contractReasons, { context, ruleIds, inputDates: allInputDates(input) });
  }
  const dates = allInputDates(input);
  const legalEffectiveFrom = definition.validity.legalEffectiveFrom;
  if (legalEffectiveFrom && dates.some(date => compareIsoDates(date, legalEffectiveFrom) < 0)) {
    return blocked(['deadlineDefinitionBeforeLegalEffect'], { context, ruleIds, inputDates: dates });
  }
  const overrideIds = unique(definition.legalOverrideIds);
  const overrides = overrideIds.map(id => findById(catalog.legalOverrides, 'overrideId', id));
  if (overrides.some(override => !override)) {
    return blocked(['unknownLegalOverride'], { context, ruleIds, overrideIds, inputDates: dates });
  }
  if (overrides.some(override => override?.status !== 'supported')) {
    return blocked(['legalOverrideNotSupported'], { context, ruleIds, overrideIds, inputDates: dates });
  }
  if (overrides.some(override => override?.confirmationRequired
    && !input.overrideConfirmations.includes(override.overrideId))) {
    return blocked(['legalOverrideConfirmationMissing'], { context, ruleIds, overrideIds, inputDates: dates });
  }
  if (input.overrideConfirmations.some(id => !overrideIds.includes(id))) {
    return blocked(['unexpectedOverrideConfirmation'], { context, ruleIds, overrideIds, inputDates: dates });
  }

  const trace: TraceWithoutSequence[] = [{
    operation: 'resolveAnchors',
    inputDates: dates,
    ruleIds: [],
    reasonKeys: []
  }];
  const appliedCalendarRuleIds: string[] = [];
  const calculation = definition.calculation;
  let provisional: IsoDate;

  if (calculation.type === 'R1_RELATIVE') {
    const duration = durationFor(definition, input);
    const anchor = input.dateValues[calculation.anchorInputId];
    if (!duration || !anchor) {
      return blocked(['relativeCalculationInputMissing'], { context, ruleIds, inputDates: dates });
    }
    provisional = applyDuration(anchor, duration, calculation.direction, calculation.anchorBoundary);
    trace.push({
      operation: 'calculateRelative',
      inputDates: [anchor],
      outputDate: provisional,
      ruleIds,
      reasonKeys: [calculation.anchorBoundary === 'excluded' ? 'anchorDayExcluded' : 'anchorDayIncluded']
    });
  } else if (calculation.type === 'R2_OFFSET') {
    const anchor = input.dateValues[calculation.anchorInputId];
    if (!anchor) return blocked(['offsetCalculationInputMissing'], { context, ruleIds, inputDates: dates });
    provisional = addCalendarDays(anchor, calculation.offsetDays);
    trace.push({
      operation: 'calculateOffset',
      inputDates: [anchor],
      outputDate: provisional,
      ruleIds,
      reasonKeys: [
        `offset${calculation.offsetDays < 0 ? 'Minus' : 'Plus'}${Math.abs(calculation.offsetDays)}Days`
      ]
    });
  } else if (calculation.type === 'R3_WEEKDAY') {
    const anchor = input.dateValues[calculation.anchorInputId];
    if (!anchor) return blocked(['weekdayCalculationInputMissing'], { context, ruleIds, inputDates: dates });
    provisional = calculateWeekday(anchor, calculation);
    trace.push({
      operation: 'calculateWeekday',
      inputDates: [anchor],
      outputDate: provisional,
      ruleIds,
      reasonKeys: [weekdayReasonKey(calculation)]
    });
  } else {
    const branchResults = calculation.branches.map(branch => {
      const anchor = input.dateValues[branch.anchorInputId];
      if (!anchor) return undefined;
      return {
        branch,
        anchor,
        date: applyDuration(anchor, branch.duration, 'after', branch.anchorBoundary)
      };
    });
    if (branchResults.some(result => !result)) {
      return blocked(['dualCalculationInputMissing'], { context, ruleIds, inputDates: dates });
    }
    const completeResults = branchResults.filter(result => result !== undefined);
    trace.push({
      operation: 'calculateDualBranches',
      inputDates: completeResults.map(result => result.anchor),
      ruleIds,
      reasonKeys: completeResults.map(result =>
        `${result.branch.branchId}Plus${result.branch.duration.value}Days`)
    });
    const branchDates = completeResults.map(result => result.date).sort(compareIsoDates);
    provisional = calculation.selection === 'earliest'
      ? branchDates[0] as IsoDate
      : branchDates.at(-1) as IsoDate;
    trace.push({
      operation: 'selectDualDeadline',
      inputDates: branchDates,
      outputDate: provisional,
      ruleIds,
      reasonKeys: [`${calculation.selection}Branch`]
    });
  }

  const calendarRange = calendarGenerationRangeForDates(data, [...dates, provisional]);
  let calendar: ResolvedCalendar | undefined;
  try {
    calendar = calendarProfile.calendarId === null || !calendarRange
      ? undefined
      : resolveCalendar(data, calendarProfile.calendarId, calendarRange);
  } catch (error) {
    const reason = error instanceof CalendarGenerationError
      ? error.reasonKey
      : 'calendarGenerationFailed';
    return blocked([reason], {
      context,
      ruleIds,
      overrideIds,
      inputDates: [...dates, provisional],
      warnings: ['warning.calendar.generationFailed']
    });
  }
  if (calendarProfile.calendarId !== null && !calendarRange) {
    return blocked(['dataCoverageExceeded'], {
      context,
      ruleIds,
      overrideIds,
      inputDates: [...dates, provisional]
    });
  }
  if (calendarProfile.calendarId !== null && !calendar) {
    return blocked(['unknownCalendar'], { context, ruleIds, overrideIds, inputDates: dates });
  }
  const coverage = specialCoverage(data, calendar);
  if (!coverage || !isDateWithin(provisional, coverage.from, coverage.to)) {
    return blocked(['dataCoverageExceeded'], {
      context,
      ruleIds,
      overrideIds,
      inputDates: [...dates, provisional],
      warnings: ['warning.data.coverageExceeded']
    });
  }

  if (definition.resultPolicy.endShiftPolicy !== 'manualReview') {
    if (suspensionProfile.mode === 'none') {
      trace.push({
        operation: 'applySuspension',
        outputDate: provisional,
        ruleIds: [],
        reasonKeys: [definition.deadlineDefinitionId === 'BGG-SPEC-REL-103'
          ? 'suspensionDisabledByVotingRightsException'
          : 'suspensionDisabled']
      });
    } else {
      if (!calendar || !suspensionProfile.suspensionSetId) {
        return blocked(['suspensionConfigurationUnresolved'], { context, ruleIds, inputDates: dates });
      }
      const set = calendar.suspensionSets.get(suspensionProfile.suspensionSetId);
      const duration = durationFor(definition, input);
      if (!set || calculation.type !== 'R1_RELATIVE' || !duration) {
        return blocked(['unsupportedSuspensionCombination'], { context, ruleIds, inputDates: dates });
      }
      const suspended = countRelativeWithSuspension(
        input.dateValues[calculation.anchorInputId] as IsoDate,
        duration,
        calculation.direction,
        calculation.anchorBoundary,
        set.periods,
        data,
        calendar
      );
      if (!suspended) {
        return blocked(['dataCoverageExceeded'], { context, ruleIds, inputDates: dates });
      }
      provisional = suspended.date;
      const suspensionEvidence = calendarEvidenceForIds(calendar, suspended.periodIds);
      appliedCalendarRuleIds.push(...evidenceRuleIds(suspensionEvidence));
      trace.push({
        operation: 'applySuspension',
        outputDate: provisional,
        ruleIds: evidenceRuleIds(suspensionEvidence),
        reasonKeys: suspended.periodIds.length > 0
          ? [...suspended.periodIds, `skipped${suspended.skippedDays}CalendarDays`]
          : ['noSuspensionPeriodEncountered'],
        ...(suspensionEvidence ? { calendarEvidence: suspensionEvidence } : {})
      });
    }
  }

  let finalDeadline = provisional;
  const warnings: string[] = [];
  if (definition.resultPolicy.endShiftPolicy === 'manualReview') {
    warnings.push('warning.fixedDate.verifyElectionOrder');
    trace.push({
      operation: 'shiftDeadlineEnd',
      outputDate: finalDeadline,
      ruleIds: [],
      reasonKeys: ['manualReviewRequired']
    });
  } else if (definition.resultPolicy.endShiftPolicy === 'nextWorkingDay') {
    if (!calendar) return blocked(['calendarRequiredForEndShift'], { context, ruleIds, inputDates: dates });
    const shiftReasons: string[] = [];
    const shiftedHolidayIds: string[] = [];
    const shiftInput = finalDeadline;
    while (true) {
      const weekend = weekdayReason(finalDeadline);
      const holidays = calendar.holidaysByDate.get(finalDeadline) ?? [];
      if (!weekend && holidays.length === 0) break;
      if (weekend && !shiftReasons.includes(weekend)) shiftReasons.push(weekend);
      holidays.forEach(holiday => {
        if (!shiftReasons.includes(holiday.labelKey)) shiftReasons.push(holiday.labelKey);
        if (!shiftedHolidayIds.includes(holiday.holidayId)) shiftedHolidayIds.push(holiday.holidayId);
      });
      finalDeadline = addCalendarDays(finalDeadline, 1);
      if (!isWithinReleaseCoverage(finalDeadline, data)
        || !isDateWithin(finalDeadline, calendar.coverage.from, calendar.coverage.to)) {
        return blocked(['dataCoverageExceeded'], { context, ruleIds, inputDates: [...dates, finalDeadline] });
      }
    }
    if (shiftReasons.length > 0) {
      const endShiftEvidence = calendarEvidenceForIds(calendar, shiftedHolidayIds);
      appliedCalendarRuleIds.push(...evidenceRuleIds(endShiftEvidence));
      trace.push({
        operation: 'shiftDeadlineEnd',
        inputDates: [shiftInput],
        outputDate: finalDeadline,
        ruleIds: [...ruleIds, ...evidenceRuleIds(endShiftEvidence)],
        reasonKeys: shiftReasons,
        ...(endShiftEvidence ? { calendarEvidence: endShiftEvidence } : {})
      });
    }
  }

  const gateResults: SpecialGateResult[] = [];
  for (const gateId of definition.gateIds) {
    const gate = findById(catalog.gates, 'gateId', gateId);
    if (!gate) return blocked(['unknownGate'], { context, ruleIds, inputDates: dates });
    const comparisonDate = input.dateValues[gate.rightInputId];
    if (!comparisonDate) return blocked(['gateComparisonValueMissing'], { context, ruleIds, inputDates: dates });
    const comparison = compareIsoDates(finalDeadline, comparisonDate);
    const matched = gate.operator === 'lte' ? comparison <= 0 : comparison < 0;
    gateResults.push({
      gateId,
      matched,
      action: matched ? gate.onTrue : 'none'
    });
    if (matched) warnings.push('warning.preparatoryAct.challengeNow');
    trace.push({
      operation: 'evaluateGate',
      inputDates: [finalDeadline, comparisonDate].sort(compareIsoDates),
      outputDate: finalDeadline,
      ruleIds: [],
      reasonKeys: [matched ? 'deadlineNotAfterPoll' : 'deadlineAfterPoll']
    });
  }

  const filingResult = filingRequirement(filing);
  trace.push({
    operation: 'resolveFilingRequirement',
    outputDate: finalDeadline,
    ruleIds: [],
    reasonKeys: [filingReason(filing)]
  });

  overrides.forEach(override => {
    if (!override) return;
    if (override.warningRequired) warnings.push(overrideWarning(override.overrideId));
    trace.push({
      operation: 'applyLegalOverride',
      outputDate: finalDeadline,
      ruleIds: [],
      reasonKeys: [overrideWarning(override.overrideId)]
    });
  });
  trace.push({
    operation: 'returnResult',
    outputDate: finalDeadline,
    ruleIds: [],
    reasonKeys: []
  });

  return {
    outcome: definition.resultPolicy.endShiftPolicy === 'manualReview' ? 'manualReview' : 'calculated',
    calculationContext: context,
    provisionalDeadline: deadlineValue(provisional),
    finalDeadline: deadlineValue(finalDeadline),
    appliedRuleIds: unique([...ruleIds, ...appliedCalendarRuleIds]),
    appliedOverrideIds: overrideIds,
    gateResults,
    filingRequirement: filingResult,
    warningKeys: unique(warnings),
    blockReasonKeys: [],
    trace: withSequence(trace)
  };
}
