// SPDX-License-Identifier: AGPL-3.0-only

import {
  addCalendarDays,
  compareIsoDates,
  isDateWithin,
  isLeapDay,
  parseIsoDate,
  weekdayReason
} from './date';
import { CoreDataError, resolveCalendar } from './data';
import type {
  BlockedDeadlineResult,
  CalculatedDeadlineResult,
  CalculationData,
  CalculationInput,
  CalculationResult,
  IsoDate,
  LegalProfile,
  LegalRule,
  ResolvedCalendar,
  SuspensionPeriod,
  TraceStep
} from './types';

const EMPTY_SUSPENSION = Object.freeze({ enabled: false, periodIds: [], skippedCalendarDays: 0 });
const EMPTY_END_SHIFT = Object.freeze({ applied: false, reasonKeys: [], holidayIds: [] });

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function effectString(rule: LegalRule, property: string): string | undefined {
  const value = rule.effect[property];
  return typeof value === 'string' ? value : undefined;
}

function effectBoolean(rule: LegalRule, property: string): boolean | undefined {
  const value = rule.effect[property];
  return typeof value === 'boolean' ? value : undefined;
}

function effectNumber(rule: LegalRule, property: string): number | undefined {
  const value = rule.effect[property];
  return typeof value === 'number' ? value : undefined;
}

function activeOn(rule: LegalRule, date: IsoDate): boolean {
  return compareIsoDates(date, rule.validity.dataValidFrom) >= 0
    && (rule.validity.dataValidTo === null || compareIsoDates(date, rule.validity.dataValidTo) <= 0);
}

function conditionsMatch(rule: LegalRule, selectors: Readonly<Record<string, string>>): boolean {
  return rule.conditions.every(condition => condition.values.includes(selectors[condition.selector] ?? ''));
}

function matchingRules(
  profile: LegalProfile,
  effectType: string,
  input: CalculationInput
): LegalRule[] {
  return profile.rules
    .filter(rule => rule.status === 'active')
    .filter(rule => activeOn(rule, input.inputDate))
    .filter(rule => rule.effect.type === effectType)
    .filter(rule => conditionsMatch(rule, input.selectors))
    .sort((left, right) => left.priority - right.priority || left.ruleId.localeCompare(right.ruleId));
}

function warningKeys(rules: readonly LegalRule[]): string[] {
  return unique(rules.flatMap(rule => rule.warningKey ? [rule.warningKey] : []));
}

function ruleIds(rules: readonly LegalRule[]): string[] {
  return unique(rules.map(rule => rule.ruleId));
}

function sortRules(rules: readonly LegalRule[]): LegalRule[] {
  return [...new Map(rules.map(rule => [rule.ruleId, rule])).values()]
    .sort((left, right) => left.priority - right.priority || left.ruleId.localeCompare(right.ruleId));
}

function withSequence(steps: readonly Omit<TraceStep, 'sequence'>[]): TraceStep[] {
  return steps.map((step, index) => ({ sequence: index + 1, ...step }));
}

interface BlockOptions {
  readonly inputDate?: IsoDate;
  readonly legallyRelevantDate?: IsoDate;
  readonly rules?: readonly LegalRule[];
  readonly warnings?: readonly string[];
  readonly reasons: readonly string[];
  readonly includeResolution?: boolean;
}

function blocked(options: BlockOptions): BlockedDeadlineResult {
  const selectedRules = sortRules(options.rules ?? []);
  const steps: Omit<TraceStep, 'sequence'>[] = [];
  if (options.includeResolution && options.inputDate && options.legallyRelevantDate) {
    steps.push({
      operation: 'resolveInputDate',
      inputDate: options.inputDate,
      outputDate: options.legallyRelevantDate,
      ruleIds: [],
      reasonKeys: []
    });
  }
  steps.push({
    operation: 'blockCalculation',
    ...(options.inputDate ? { inputDate: options.inputDate } : {}),
    ruleIds: ruleIds(selectedRules),
    reasonKeys: unique(options.reasons)
  });
  return {
    outcome: 'blocked',
    ...(options.legallyRelevantDate ? { legallyRelevantDate: options.legallyRelevantDate } : {}),
    suspension: EMPTY_SUSPENSION,
    endShift: EMPTY_END_SHIFT,
    appliedRuleIds: ruleIds(selectedRules),
    warningKeys: unique(options.warnings ?? warningKeys(selectedRules)),
    blockReasonKeys: unique(options.reasons),
    trace: withSequence(steps)
  };
}

function validateBasicInput(input: CalculationInput): string[] {
  const reasons: string[] = [];
  if (!parseIsoDate(input.inputDate)) {
    reasons.push('invalidInputDate');
  }
  if (!Number.isInteger(input.deadlineDays) || input.deadlineDays < 1 || input.deadlineDays > 365) {
    reasons.push('invalidDeadlineDays');
  }
  if (!['legallyRelevantDeliveryOrEventDate', 'observedOrdinaryMailDeliveryDate', 'failedDeliveryAttemptDate']
    .includes(input.inputDateSemantics)) {
    reasons.push('unsupportedInputDateSemantics');
  }
  if (!input.profileId) {
    reasons.push('profileMissing');
  }
  if (!input.calendarId) {
    reasons.push('calendarMissing');
  }
  if (!Array.isArray(input.holidayAnchorCandidates) || input.holidayAnchorCandidates.length === 0) {
    reasons.push('holidayAnchorMissing');
  }
  if (new Set(input.holidayAnchorCandidates).size !== input.holidayAnchorCandidates.length
    || input.holidayAnchorCandidates.some(code => !/^(CH|[A-Z]{2})$/.test(code))) {
    reasons.push('invalidHolidayAnchorCandidates');
  }
  return reasons;
}

function selectorBlock(
  input: CalculationInput,
  profile: LegalProfile,
  specialLawRules: readonly LegalRule[]
): CalculationResult | undefined {
  const definitions = new Map(profile.selectors.map(definition => [definition.selectorId, definition]));
  const reasons: string[] = [];
  Object.keys(input.selectors).forEach(selectorId => {
    if (!definitions.has(selectorId)) {
      reasons.push('unknownSelector');
    }
  });
  profile.selectors.forEach(definition => {
    const value = input.selectors[definition.selectorId];
    if (definition.required && value === undefined) {
      reasons.push('requiredSelectorMissing');
      return;
    }
    if (value === undefined) {
      return;
    }
    const validValues = definition.options.map(option => option.value);
    if (!validValues.includes(value)) {
      reasons.push('unknownSelectorValue');
      return;
    }
    if (value === 'unknown' && definition.unknownHandling === 'block' && definition.selectorId !== 'specialLawStatus') {
      reasons.push('unknownSelectorValue');
    }
  });
  if (reasons.length === 0) {
    return undefined;
  }
  return blocked({
    ...(parseIsoDate(input.inputDate) ? { inputDate: input.inputDate } : {}),
    rules: input.selectors.specialLawStatus !== undefined ? specialLawRules : [],
    reasons,
    warnings: ['warning.input.selectorInvalid']
  });
}

function ensureCovered(date: IsoDate, data: CalculationData, calendar: ResolvedCalendar): boolean {
  return isDateWithin(date, data.coverage.from, data.coverage.to)
    && isDateWithin(date, calendar.coverage.from, calendar.coverage.to);
}

interface DateResolution {
  readonly date: IsoDate;
  readonly rule?: LegalRule;
  readonly reasonKeys: readonly string[];
}

function resolveInputDate(
  input: CalculationInput,
  profile: LegalProfile,
  calendar: ResolvedCalendar
): DateResolution | CalculationResult {
  if (input.inputDateSemantics === 'legallyRelevantDeliveryOrEventDate') {
    const conflictingRules = matchingRules(profile, 'deliveryDate', input);
    if (conflictingRules.length > 0) {
      return blocked({
        inputDate: input.inputDate,
        rules: conflictingRules,
        reasons: ['inputDateSemanticsMismatch'],
        warnings: warningKeys(conflictingRules)
      });
    }
    return { date: input.inputDate, reasonKeys: [] };
  }

  const expectedMode = input.inputDateSemantics === 'failedDeliveryAttemptDate'
    ? 'seventhDayAfterFailedAttempt'
    : 'nextWorkingDayAfterWeekendOrHoliday';
  const rules = matchingRules(profile, 'deliveryDate', input)
    .filter(rule => effectString(rule, 'mode') === expectedMode);
  if (rules.length !== 1) {
    return blocked({
      inputDate: input.inputDate,
      rules,
      reasons: ['deliveryDateRuleUnresolved'],
      warnings: ['warning.deliveryDate.ruleUnresolved']
    });
  }
  const rule = rules[0];
  if (!rule) {
    throw new CoreDataError('Interner Fehler bei der Zustellregelauflösung.');
  }
  if (effectBoolean(rule, 'requiresConfirmation') === true
    && input.confirmations.deliveryFictionApplicabilityConfirmed !== true) {
    return blocked({
      inputDate: input.inputDate,
      rules: [rule],
      reasons: ['deliveryFictionApplicabilityUnconfirmed'],
      warnings: warningKeys([rule])
    });
  }

  if (expectedMode === 'seventhDayAfterFailedAttempt') {
    const offset = effectNumber(rule, 'daysAfterFailedAttempt');
    if (!Number.isInteger(offset)) {
      return blocked({ inputDate: input.inputDate, rules: [rule], reasons: ['deliveryDateRuleInvalid'] });
    }
    return {
      date: addCalendarDays(input.inputDate, offset ?? 0),
      rule,
      reasonKeys: [input.selectors.deliveryMethod ?? 'deliveryFiction']
    };
  }

  let date = input.inputDate;
  while (weekdayReason(date) !== undefined || calendar.holidaysByDate.has(date)) {
    date = addCalendarDays(date, 1);
  }
  return {
    date,
    rule,
    reasonKeys: [input.selectors.deliveryMethod ?? 'ordinaryMailWeekendOrHoliday']
  };
}

function periodsForDate(periods: readonly SuspensionPeriod[], date: IsoDate): SuspensionPeriod[] {
  return periods.filter(period => isDateWithin(date, period.startsOn, period.endsOn));
}

interface SuspensionConfiguration {
  readonly enabled: boolean;
  readonly setId?: string;
  readonly periods: readonly SuspensionPeriod[];
  readonly baseRules: readonly LegalRule[];
  readonly modifierRules: readonly LegalRule[];
}

function suspensionConfiguration(
  input: CalculationInput,
  profile: LegalProfile,
  calendar: ResolvedCalendar
): SuspensionConfiguration | CalculationResult {
  const baseRules = matchingRules(profile, 'suspension', input);
  const exceptionRules = matchingRules(profile, 'suspensionException', input);
  const routingRules = matchingRules(profile, 'suspensionRouting', input)
    .filter(rule => {
      const selector = effectString(rule, 'selector');
      const cases = rule.effect.cases;
      return typeof selector === 'string' && Array.isArray(cases)
        && cases.some(entry => typeof entry === 'object' && entry !== null
          && (entry as Record<string, unknown>).value === input.selectors[selector]);
    });

  if (baseRules.length > 1) {
    return blocked({ inputDate: input.inputDate, rules: baseRules, reasons: ['ambiguousSuspensionConfiguration'] });
  }
  let enabled = false;
  let setId: string | undefined;
  const base = baseRules[0];
  if (base && effectString(base, 'mode') === 'useSet') {
    enabled = true;
    setId = effectString(base, 'suspensionSetId');
  }
  exceptionRules.forEach(() => {
    enabled = false;
  });
  routingRules.forEach(rule => {
    const selector = effectString(rule, 'selector');
    const cases = rule.effect.cases;
    if (typeof selector !== 'string' || !Array.isArray(cases)) {
      return;
    }
    const match = cases.find(entry => typeof entry === 'object' && entry !== null
      && (entry as Record<string, unknown>).value === input.selectors[selector]) as Record<string, unknown> | undefined;
    if (match && typeof match.suspensionEnabled === 'boolean') {
      enabled = match.suspensionEnabled;
    }
  });

  if (!enabled) {
    return { enabled, periods: [], baseRules, modifierRules: [...exceptionRules, ...routingRules] };
  }
  if (!setId) {
    return blocked({ inputDate: input.inputDate, rules: [...baseRules, ...routingRules], reasons: ['suspensionSetMissing'] });
  }
  const set = calendar.suspensionSets.get(setId);
  if (!set || !set.applicableProfileIds.includes(profile.profileId)) {
    return blocked({ inputDate: input.inputDate, rules: [...baseRules, ...routingRules], reasons: ['unknownOrInapplicableSuspensionSet'] });
  }
  return {
    enabled,
    setId,
    periods: [...set.periods].sort((left, right) => compareIsoDates(left.startsOn, right.startsOn)),
    baseRules,
    modifierRules: [...exceptionRules, ...routingRules]
  };
}

function isCalculationResult(value: DateResolution | SuspensionConfiguration | CalculationResult): value is CalculationResult {
  return 'outcome' in value;
}

export function calculateDeadline(input: CalculationInput, data: CalculationData): CalculationResult {
  const basicReasons = validateBasicInput(input);
  if (basicReasons.length > 0) {
    return blocked({
      ...(parseIsoDate(input.inputDate) ? { inputDate: input.inputDate } : {}),
      reasons: basicReasons,
      warnings: ['warning.input.invalid']
    });
  }

  const profile = data.profiles.get(input.profileId);
  if (!profile) {
    return blocked({ inputDate: input.inputDate, reasons: ['unknownProfile'], warnings: ['warning.profile.unknown'] });
  }
  const calendar = resolveCalendar(data, input.calendarId);
  if (!calendar) {
    return blocked({ inputDate: input.inputDate, reasons: ['unknownCalendar'], warnings: ['warning.calendar.unknown'] });
  }
  if (!ensureCovered(input.inputDate, data, calendar)) {
    return blocked({ inputDate: input.inputDate, reasons: ['dataCoverageExceeded'], warnings: ['warning.data.coverageExceeded'] });
  }
  if (!isDateWithin(
    input.inputDate,
    profile.validity.dataValidFrom,
    profile.validity.dataValidTo ?? data.coverage.to
  )) {
    return blocked({ inputDate: input.inputDate, reasons: ['profileOutsideValidity'], warnings: ['warning.profile.outsideValidity'] });
  }

  const holidayRules = matchingRules(profile, 'holidayAnchor', input);
  const holidaySetRules = matchingRules(profile, 'holidaySet', input);
  const specialLawRules = matchingRules(profile, 'specialLaw', input);
  const selectorFailure = selectorBlock(input, profile, specialLawRules);
  if (selectorFailure) {
    return selectorFailure;
  }
  if (profile.calendarPolicy.jurisdictionSelection === 'fixedBern') {
    if (calendar.jurisdictionCode !== 'BE') {
      return blocked({
        inputDate: input.inputDate,
        rules: holidayRules,
        reasons: ['calendarJurisdictionMismatch'],
        warnings: warningKeys(holidayRules)
      });
    }
  } else if (!input.holidayAnchorCandidates.includes(calendar.jurisdictionCode)) {
    return blocked({
      inputDate: input.inputDate,
      rules: holidayRules,
      reasons: ['calendarJurisdictionMismatch'],
      warnings: warningKeys(holidayRules)
    });
  }

  const resolution = resolveInputDate(input, profile, calendar);
  if (isCalculationResult(resolution)) {
    return resolution;
  }
  const legallyRelevantDate = resolution.date;
  if (!ensureCovered(legallyRelevantDate, data, calendar)) {
    return blocked({
      inputDate: input.inputDate,
      legallyRelevantDate,
      rules: resolution.rule ? [resolution.rule] : [],
      reasons: ['dataCoverageExceeded'],
      warnings: ['warning.data.coverageExceeded'],
      includeResolution: true
    });
  }

  const specialLawStatus = input.selectors.specialLawStatus;
  if (specialLawRules.length > 0) {
    let reason: string | undefined;
    if (specialLawStatus === 'unknown') {
      reason = 'unknownSpecialLaw';
    } else if (specialLawStatus === 'knownOverride') {
      reason = 'knownSpecialLawOverride';
    } else if (specialLawStatus === 'noKnownOverride' && input.confirmations.specialLawChecked !== true) {
      reason = 'specialLawCheckUnconfirmed';
    }
    if (reason) {
      return blocked({
        inputDate: input.inputDate,
        legallyRelevantDate,
        rules: specialLawRules,
        reasons: [reason],
        warnings: warningKeys(specialLawRules),
        includeResolution: true
      });
    }
  }

  if (holidayRules.length !== 1) {
    return blocked({
      inputDate: input.inputDate,
      legallyRelevantDate,
      rules: holidayRules,
      reasons: ['holidayAnchorRuleUnresolved'],
      warnings: warningKeys(holidayRules),
      includeResolution: true
    });
  }
  if (input.holidayAnchorCandidates.length > 1 && input.confirmations.holidayAnchorConfirmed !== true) {
    return blocked({
      inputDate: input.inputDate,
      legallyRelevantDate,
      rules: holidayRules,
      reasons: ['holidayAnchorConflictUnresolved'],
      warnings: warningKeys(holidayRules),
      includeResolution: true
    });
  }

  const startRules = matchingRules(profile, 'deadlineStart', input);
  const countRules = matchingRules(profile, 'counting', input);
  const endRules = matchingRules(profile, 'deadlineEnd', input);
  if (startRules.length !== 1 || countRules.length !== 1 || endRules.length !== 1) {
    return blocked({
      inputDate: input.inputDate,
      legallyRelevantDate,
      rules: [...startRules, ...countRules, ...endRules],
      reasons: ['calculationRuleUnresolved'],
      warnings: ['warning.rules.unresolved'],
      includeResolution: true
    });
  }
  const startRule = startRules[0];
  const countRule = countRules[0];
  const endRule = endRules[0];
  if (!startRule || !countRule || !endRule) {
    throw new CoreDataError('Interner Fehler bei der Regelauflösung.');
  }

  const suspension = suspensionConfiguration(input, profile, calendar);
  if (isCalculationResult(suspension)) {
    return suspension;
  }
  const appliedRules: LegalRule[] = [
    ...(resolution.rule ? [resolution.rule] : []),
    startRule,
    countRule,
    ...suspension.baseRules,
    ...suspension.modifierRules,
    endRule,
    ...holidayRules,
    ...holidaySetRules,
    ...specialLawRules
  ];

  const offset = effectNumber(startRule, 'offsetCalendarDays');
  if (offset !== 1) {
    return blocked({
      inputDate: input.inputDate,
      legallyRelevantDate,
      rules: [startRule],
      reasons: ['deadlineStartRuleInvalid'],
      warnings: ['warning.rules.invalid'],
      includeResolution: true
    });
  }
  const ordinaryStart = addCalendarDays(legallyRelevantDate, offset);
  let deadlineStart = ordinaryStart;
  let skippedCalendarDays = 0;
  const encounteredPeriodIds: string[] = [];
  const countedDates: IsoDate[] = [];

  if (suspension.enabled) {
    const deliveryDuringSuspensionRules = matchingRules(profile, 'deliveryDuringSuspension', input);
    const startingPeriods = periodsForDate(suspension.periods, deadlineStart);
    if (deliveryDuringSuspensionRules.length === 1 && startingPeriods.length > 0) {
      const latestEnd = startingPeriods
        .map(period => period.endsOn)
        .sort(compareIsoDates)
        .at(-1);
      if (latestEnd) {
        let skippedDate = deadlineStart;
        while (compareIsoDates(skippedDate, latestEnd) <= 0) {
          skippedCalendarDays += 1;
          periodsForDate(suspension.periods, skippedDate).forEach(period => {
            if (!encounteredPeriodIds.includes(period.periodId)) {
              encounteredPeriodIds.push(period.periodId);
            }
          });
          skippedDate = addCalendarDays(skippedDate, 1);
        }
        deadlineStart = addCalendarDays(latestEnd, 1);
        appliedRules.push(deliveryDuringSuspensionRules[0] as LegalRule);
      }
    }
  }
  if (!ensureCovered(deadlineStart, data, calendar)) {
    return blocked({
      inputDate: input.inputDate,
      legallyRelevantDate,
      rules: appliedRules,
      reasons: ['dataCoverageExceeded'],
      warnings: ['warning.data.coverageExceeded'],
      includeResolution: true
    });
  }

  let current = addCalendarDays(deadlineStart, -1);
  let countedDays = 0;
  while (countedDays < input.deadlineDays) {
    current = addCalendarDays(current, 1);
    if (!ensureCovered(current, data, calendar)) {
      return blocked({
        inputDate: input.inputDate,
        legallyRelevantDate,
        rules: appliedRules,
        reasons: ['dataCoverageExceeded'],
        warnings: ['warning.data.coverageExceeded'],
        includeResolution: true
      });
    }
    const activePeriods = suspension.enabled ? periodsForDate(suspension.periods, current) : [];
    if (activePeriods.length > 0) {
      skippedCalendarDays += 1;
      activePeriods.forEach(period => {
        if (!encounteredPeriodIds.includes(period.periodId)) {
          encounteredPeriodIds.push(period.periodId);
        }
      });
      continue;
    }
    countedDays += 1;
    countedDates.push(current);
  }
  const provisionalEnd = current;

  const shiftReasonKeys: string[] = [];
  const shiftedHolidayIds: string[] = [];
  let finalEnd = provisionalEnd;
  while (true) {
    const weekend = weekdayReason(finalEnd);
    const holidays = calendar.holidaysByDate.get(finalEnd) ?? [];
    if (!weekend && holidays.length === 0) {
      break;
    }
    if (weekend && !shiftReasonKeys.includes(weekend)) {
      shiftReasonKeys.push(weekend);
    }
    if (holidays.length > 0) {
      if (!shiftReasonKeys.includes('publicHoliday')) {
        shiftReasonKeys.push('publicHoliday');
      }
      holidays.forEach(holiday => {
        if (!shiftedHolidayIds.includes(holiday.holidayId)) {
          shiftedHolidayIds.push(holiday.holidayId);
        }
      });
    }
    finalEnd = addCalendarDays(finalEnd, 1);
    if (!ensureCovered(finalEnd, data, calendar)) {
      return blocked({
        inputDate: input.inputDate,
        legallyRelevantDate,
        rules: appliedRules,
        reasons: ['dataCoverageExceeded'],
        warnings: ['warning.data.coverageExceeded'],
        includeResolution: true
      });
    }
  }
  const reasonOrder = new Map([['saturday', 0], ['sunday', 1], ['publicHoliday', 2]]);
  shiftReasonKeys.sort((left, right) => (reasonOrder.get(left) ?? 99) - (reasonOrder.get(right) ?? 99));
  shiftedHolidayIds.sort();

  const trace: Omit<TraceStep, 'sequence'>[] = [
    {
      operation: 'resolveInputDate',
      inputDate: input.inputDate,
      outputDate: legallyRelevantDate,
      ruleIds: resolution.rule ? [resolution.rule.ruleId] : [],
      reasonKeys: resolution.reasonKeys
    },
    {
      operation: 'setDeadlineStart',
      outputDate: deadlineStart,
      ruleIds: [startRule.ruleId],
      reasonKeys: []
    }
  ];
  if (suspension.enabled && skippedCalendarDays > 0) {
    trace.push({
      operation: 'applySuspension',
      inputDate: ordinaryStart,
      outputDate: provisionalEnd,
      skippedCalendarDays,
      periodIds: encounteredPeriodIds,
      ruleIds: ruleIds(suspension.baseRules),
      reasonKeys: []
    });
  }
  const countReasonKeys = countedDates.some(isLeapDay) ? ['leapDayIncluded'] : [];
  if (!suspension.enabled && suspension.modifierRules.length > 0) {
    countReasonKeys.push('suspensionDisabled');
  }
  trace.push({
    operation: 'countDeadlineDays',
    inputDate: deadlineStart,
    outputDate: provisionalEnd,
    deadlineDays: input.deadlineDays,
    ruleIds: [countRule.ruleId, ...ruleIds(suspension.modifierRules)],
    reasonKeys: countReasonKeys
  });
  if (finalEnd !== provisionalEnd) {
    trace.push({
      operation: 'shiftDeadlineEnd',
      inputDate: provisionalEnd,
      outputDate: finalEnd,
      ruleIds: [
        endRule.ruleId,
        ...(shiftedHolidayIds.length > 0 ? ruleIds([...holidayRules, ...holidaySetRules]) : [])
      ],
      reasonKeys: shiftReasonKeys
    });
  }
  const fixedCalendarChecked = finalEnd === provisionalEnd
    && profile.calendarPolicy.jurisdictionSelection === 'fixedBern'
    && holidaySetRules.length > 0;
  trace.push({
    operation: 'returnResult',
    outputDate: finalEnd,
    ruleIds: fixedCalendarChecked ? ruleIds([...holidayRules, ...holidaySetRules]) : [],
    reasonKeys: fixedCalendarChecked ? ['notBernPublicHoliday'] : []
  });

  const result: CalculatedDeadlineResult = {
    outcome: 'calculated',
    legallyRelevantDate,
    deadlineStart,
    provisionalEnd,
    finalEnd,
    suspension: {
      enabled: suspension.enabled,
      periodIds: encounteredPeriodIds,
      skippedCalendarDays
    },
    endShift: {
      applied: finalEnd !== provisionalEnd,
      reasonKeys: shiftReasonKeys,
      holidayIds: shiftedHolidayIds
    },
    appliedRuleIds: ruleIds(sortRules(appliedRules)),
    warningKeys: [],
    blockReasonKeys: [],
    trace: withSequence(trace)
  };
  return result;
}
