// SPDX-License-Identifier: AGPL-3.0-only

import type { CalendarData, IsoDate } from './types';

export interface CalendarRuleValidity {
  readonly from: IsoDate;
  readonly to: IsoDate | null;
}

export interface CalendarRuleJurisdiction {
  readonly level: 'federal' | 'cantonal';
  readonly code: string;
}

export interface CalendarRuleLabels {
  readonly de: string;
  readonly fr: string;
}

export interface CalendarRuleSourceReference {
  readonly sourceId: string;
  readonly locator: string;
}

export interface FixedMonthDayCalculation {
  readonly type: 'fixedMonthDay';
  readonly month: number;
  readonly day: number;
}

export interface EasterOffsetDaysCalculation {
  readonly type: 'easterOffsetDays';
  readonly offsetDays: number;
}

export interface NthWeekdayOfMonthCalculation {
  readonly type: 'nthWeekdayOfMonth';
  readonly month: number;
  readonly isoWeekday: number;
  readonly occurrence: number;
}

export type PeriodBoundary =
  | {
    readonly anchor: 'fixedMonthDay';
    readonly month: number;
    readonly day: number;
    readonly yearOffset: number;
    readonly offsetDays: number;
  }
  | {
    readonly anchor: 'easterSunday';
    readonly yearOffset: number;
    readonly offsetDays: number;
  };

export interface RelativePeriodCalculation {
  readonly type: 'relativePeriod';
  readonly startsOn: PeriodBoundary;
  readonly endsOn: PeriodBoundary;
}

export interface ExplicitDateOverrideCalculation {
  readonly type: 'explicitDateOverride';
  readonly date?: IsoDate;
  readonly targetDate?: IsoDate;
  readonly replacementDate?: IsoDate;
}

export interface HolidayRuleEffect {
  readonly type: 'holiday';
  readonly kind: 'federalHoliday' | 'cantonalPublicHoliday';
  readonly legalEffect: 'nonWorkingDayEquivalentToSunday';
  readonly resultIdSuffix: string;
}

export interface SuspensionPeriodRuleEffect {
  readonly type: 'suspensionPeriod';
  readonly suspensionSetId: string;
  readonly applicableProfileIds: readonly string[];
  readonly inclusive: true;
  readonly resultIdPrefix: string;
}

export interface ReplacementHoliday {
  readonly kind: 'federalHoliday' | 'cantonalPublicHoliday';
  readonly labelKey: string;
  readonly labels: CalendarRuleLabels;
  readonly legalEffect: 'nonWorkingDayEquivalentToSunday';
  readonly resultIdSuffix: string;
}

export interface ExplicitDateOverrideEffect {
  readonly type: 'explicitDateOverride';
  readonly operation: 'add' | 'suppress' | 'replace';
  readonly targetRuleId?: string;
  readonly replacementHoliday?: ReplacementHoliday;
}

interface CalendarRuleBase {
  readonly ruleId: string;
  readonly calendarId: string;
  readonly jurisdiction: CalendarRuleJurisdiction;
  readonly labelKey: string;
  readonly labels: CalendarRuleLabels;
  readonly priority: number;
  readonly validity: CalendarRuleValidity;
  readonly sourceRefs: readonly CalendarRuleSourceReference[];
}

export type HolidayCalendarRule = CalendarRuleBase & {
  readonly calculation:
    | FixedMonthDayCalculation
    | EasterOffsetDaysCalculation
    | NthWeekdayOfMonthCalculation;
  readonly effect: HolidayRuleEffect;
};

export type SuspensionCalendarRule = CalendarRuleBase & {
  readonly calculation: RelativePeriodCalculation;
  readonly effect: SuspensionPeriodRuleEffect;
};

export type OverrideCalendarRule = CalendarRuleBase & {
  readonly calculation: ExplicitDateOverrideCalculation;
  readonly effect: ExplicitDateOverrideEffect;
};

export type CalendarRule = HolidayCalendarRule | SuspensionCalendarRule | OverrideCalendarRule;

export interface CalendarRuleSet {
  readonly formatVersion: '2.0.0';
  readonly dataKind: 'calendar';
  readonly calendarId: string;
  readonly jurisdiction: CalendarRuleJurisdiction;
  readonly validity: CalendarRuleValidity;
  readonly inherits: readonly string[];
  readonly sources: readonly { readonly sourceId: string }[];
  readonly rules: readonly CalendarRule[];
}

export interface CalendarGenerationRange {
  readonly from: IsoDate;
  readonly to: IsoDate;
}

export type CalendarRuleOperation =
  | 'generateHoliday'
  | 'generateSuspensionPeriod'
  | 'addHoliday'
  | 'suppressHoliday'
  | 'replaceHoliday';

export interface CalendarRuleApplication {
  readonly ruleId: string;
  readonly calendarId: string;
  readonly operation: CalendarRuleOperation;
  readonly sourceRefs: readonly CalendarRuleSourceReference[];
  readonly generatedIds: readonly string[];
  readonly removedIds: readonly string[];
}

export interface GeneratedCalendar {
  readonly calendar: CalendarData;
  readonly appliedRuleIds: readonly string[];
  readonly appliedOverrideRuleIds: readonly string[];
  readonly trace: readonly CalendarRuleApplication[];
}

export type CalendarRuleOccurrence =
  | { readonly date: IsoDate }
  | { readonly startsOn: IsoDate; readonly endsOn: IsoDate };
