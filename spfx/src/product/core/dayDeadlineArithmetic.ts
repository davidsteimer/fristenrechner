// SPDX-License-Identifier: AGPL-3.0-only
// Internal arithmetic, not a qualification or release-permission boundary.
// Both legacy profiles and qualified cantonal procedures use this same counter.
import { addCalendarDays, compareIsoDates, isDateWithin, parseIsoDate, weekdayReason } from './date';

export interface ArithmeticSuspensionPeriod {
  readonly periodId: string;
  readonly startsOn: string;
  readonly endsOn: string;
}
export interface DayDeadlineArithmeticInput {
  readonly legallyRelevantDate: string;
  readonly deadlineDays: number;
  readonly periods: readonly ArithmeticSuspensionPeriod[];
  readonly shiftStartDuringSuspension: boolean;
  readonly holidaysByDate: ReadonlyMap<string, readonly { readonly holidayId: string }[]>;
  readonly isCovered: (date: string) => boolean;
  readonly blockEndShiftIntoSuspension?: boolean;
}
export interface DayDeadlineArithmeticResult {
  readonly outcome: 'calculated';
  readonly ordinaryStart: string;
  readonly deadlineStart: string;
  readonly provisionalEnd: string;
  readonly finalEnd: string;
  readonly countedDates: readonly string[];
  readonly skippedCalendarDays: number;
  readonly encounteredPeriodIds: readonly string[];
  readonly shiftReasonKeys: readonly string[];
  readonly shiftedHolidayIds: readonly string[];
  readonly startShiftApplied: boolean;
}
export interface DayDeadlineArithmeticBlock {
  readonly outcome: 'blocked';
  readonly reason: 'dataCoverageExceeded' | 'endShiftIntoSuspensionUnresolved' | 'invalidArithmeticInput';
  readonly provisionalEnd?: string;
  readonly blockedDate?: string;
  readonly periodIds?: readonly string[];
  readonly shiftReasonKeys?: readonly string[];
  readonly shiftedHolidayIds?: readonly string[];
}

/** No profile IDs and no legal assumptions. Callers must qualify the plan first. */
export function countDayDeadline(input: DayDeadlineArithmeticInput): DayDeadlineArithmeticResult | DayDeadlineArithmeticBlock {
  const block = (reason: DayDeadlineArithmeticBlock['reason'], details: Omit<DayDeadlineArithmeticBlock, 'outcome' | 'reason'> = {}): DayDeadlineArithmeticBlock =>
    ({ outcome: 'blocked', reason, ...details });
  if (!parseIsoDate(input.legallyRelevantDate) || !Number.isInteger(input.deadlineDays)
    || input.deadlineDays < 1 || input.deadlineDays > 365
    || input.periods.some(period => !parseIsoDate(period.startsOn) || !parseIsoDate(period.endsOn)
      || period.startsOn > period.endsOn)) return block('invalidArithmeticInput');
  // A finite technical guard, not a newly asserted statutory deadline limit.
  let examinedDays = 0;
  const covered = (date: string): boolean => ++examinedDays <= 36600 && !!parseIsoDate(date) && input.isCovered(date);
  const active = (date: string): readonly ArithmeticSuspensionPeriod[] =>
    input.periods.filter(period => isDateWithin(date, period.startsOn, period.endsOn));
  if (!covered(input.legallyRelevantDate)) return block('dataCoverageExceeded');
  const ordinaryStart = addCalendarDays(input.legallyRelevantDate, 1);
  let deadlineStart = ordinaryStart;
  let skippedCalendarDays = 0;
  let startShiftApplied = false;
  const encounteredPeriodIds: string[] = [];
  const countedDates: string[] = [];
  const remember = (periods: readonly ArithmeticSuspensionPeriod[]): void => {
    for (const period of periods) if (!encounteredPeriodIds.includes(period.periodId)) encounteredPeriodIds.push(period.periodId);
  };
  if (!covered(ordinaryStart)) return block('dataCoverageExceeded', { blockedDate: ordinaryStart });
  if (input.shiftStartDuringSuspension) {
    const startingPeriods = active(deadlineStart);
    const latestEnd = startingPeriods.map(period => period.endsOn).sort(compareIsoDates).at(-1);
    if (latestEnd) {
      let skipped = deadlineStart;
      while (compareIsoDates(skipped, latestEnd) <= 0) {
        if (!covered(skipped)) return block('dataCoverageExceeded', { blockedDate: skipped });
        skippedCalendarDays++;
        remember(active(skipped));
        skipped = addCalendarDays(skipped, 1);
      }
      deadlineStart = addCalendarDays(latestEnd, 1);
      startShiftApplied = true;
    }
  }
  if (!covered(deadlineStart)) return block('dataCoverageExceeded', { blockedDate: deadlineStart });
  let current = addCalendarDays(deadlineStart, -1);
  while (countedDates.length < input.deadlineDays) {
    current = addCalendarDays(current, 1);
    if (!covered(current)) return block('dataCoverageExceeded', { blockedDate: current });
    const periods = active(current);
    if (periods.length) {
      skippedCalendarDays++;
      remember(periods);
    } else countedDates.push(current);
  }
  const provisionalEnd = current;
  let finalEnd = provisionalEnd;
  const shiftReasonKeys: string[] = [];
  const shiftedHolidayIds: string[] = [];
  while (true) {
    const weekend = weekdayReason(finalEnd);
    const holidays = input.holidaysByDate.get(finalEnd) ?? [];
    if (!weekend && !holidays.length) break;
    if (weekend && !shiftReasonKeys.includes(weekend)) shiftReasonKeys.push(weekend);
    if (holidays.length && !shiftReasonKeys.includes('publicHoliday')) shiftReasonKeys.push('publicHoliday');
    for (const holiday of holidays) if (!shiftedHolidayIds.includes(holiday.holidayId)) shiftedHolidayIds.push(holiday.holidayId);
    finalEnd = addCalendarDays(finalEnd, 1);
    if (!covered(finalEnd)) return block('dataCoverageExceeded', { provisionalEnd, blockedDate: finalEnd });
    const entered = active(finalEnd);
    if (input.blockEndShiftIntoSuspension && entered.length) {
      return block('endShiftIntoSuspensionUnresolved', {
        provisionalEnd, blockedDate: finalEnd, periodIds: entered.map(period => period.periodId),
        shiftReasonKeys: [...shiftReasonKeys], shiftedHolidayIds: [...shiftedHolidayIds]
      });
    }
  }
  const reasonOrder = new Map([['saturday', 0], ['sunday', 1], ['publicHoliday', 2]]);
  shiftReasonKeys.sort((left, right) => (reasonOrder.get(left) ?? 99) - (reasonOrder.get(right) ?? 99));
  shiftedHolidayIds.sort();
  return { outcome: 'calculated', ordinaryStart, deadlineStart, provisionalEnd, finalEnd,
    countedDates, skippedCalendarDays, encounteredPeriodIds, shiftReasonKeys, shiftedHolidayIds, startShiftApplied };
}
