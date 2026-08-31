// SPDX-License-Identifier: AGPL-3.0-only

export type IsoDate = string;

export type InputDateSemantics =
  | 'legallyRelevantDeliveryOrEventDate'
  | 'observedOrdinaryMailDeliveryDate'
  | 'failedDeliveryAttemptDate';

export interface CalculationInput {
  readonly profileId: string;
  readonly inputDate: IsoDate;
  readonly inputDateSemantics: InputDateSemantics;
  readonly deadlineDays: number;
  readonly calendarId: string;
  readonly selectors: Readonly<Record<string, string>>;
  readonly confirmations: Readonly<Record<string, boolean>>;
  readonly holidayAnchorCandidates: readonly string[];
}

export interface RuleCondition {
  readonly selector: string;
  readonly operator: 'in';
  readonly values: readonly string[];
}

export interface RuleEffect {
  readonly type: string;
  readonly [property: string]: unknown;
}

export interface RuleValidity {
  readonly dataValidFrom: IsoDate;
  readonly dataValidTo: IsoDate | null;
  readonly legalEffectiveFrom?: IsoDate | null;
}

export interface LegalRule {
  readonly ruleId: string;
  readonly phase: 'delivery' | 'start' | 'count' | 'end' | 'compliance' | 'guardrail';
  readonly priority: number;
  readonly status: 'active';
  readonly validity: RuleValidity;
  readonly conditions: readonly RuleCondition[];
  readonly effect: RuleEffect;
  readonly warningKey?: string;
}

export interface SelectorDefinition {
  readonly selectorId: string;
  readonly required: boolean;
  readonly unknownHandling: 'block' | 'warn';
  readonly options: readonly {
    readonly value: string;
    readonly labelKey: string;
  }[];
}

export interface LegalProfile {
  readonly dataKind: 'legalProfile';
  readonly formatVersion: string;
  readonly profileId: string;
  readonly lawCode: string;
  readonly jurisdiction: {
    readonly level: 'federal' | 'cantonal';
    readonly code: string;
  };
  readonly validity: RuleValidity;
  readonly calculationContract: {
    readonly acceptedDeadlineUnits: readonly ['day'];
    readonly dateInputSemantics: 'legallyRelevantDeliveryOrEventDate';
    readonly timeModel: 'dateOnlyNoTimezone';
    readonly unknownSpecialLawHandling: 'block';
    readonly unsupportedInputHandling: 'block';
  };
  readonly calendarPolicy: {
    readonly holidayAnchor: string;
    readonly jurisdictionSelection: 'explicit' | 'fixedBern';
    readonly conflictHandling: 'requireConfirmation';
    readonly manualOverride: true;
    readonly overrideReasonRequired: true;
  };
  readonly selectors: readonly SelectorDefinition[];
  readonly rules: readonly LegalRule[];
}

export interface Holiday {
  readonly holidayId: string;
  readonly date: IsoDate;
  readonly labelKey: string;
  readonly legalEffect: 'nonWorkingDayEquivalentToSunday';
}

export interface SuspensionPeriod {
  readonly periodId: string;
  readonly startsOn: IsoDate;
  readonly endsOn: IsoDate;
  readonly inclusive: true;
  readonly labelKey: string;
}

export interface SuspensionSet {
  readonly suspensionSetId: string;
  readonly applicableProfileIds: readonly string[];
  readonly periods: readonly SuspensionPeriod[];
}

export interface CalendarData {
  readonly dataKind: 'calendar';
  readonly formatVersion: string;
  readonly calendarId: string;
  readonly jurisdiction: {
    readonly level: 'federal' | 'cantonal';
    readonly code: string;
  };
  readonly coverage: {
    readonly from: IsoDate;
    readonly to: IsoDate;
  };
  readonly inherits: readonly string[];
  readonly holidays: readonly Holiday[];
  readonly suspensionSets: readonly SuspensionSet[];
}

export interface ValidatedReleaseArtifactLike {
  readonly descriptor: {
    readonly role: 'legalProfile' | 'calendar' | 'specialRegimeCatalog';
    readonly contentId: string;
  };
  readonly parsed: unknown;
}

export interface ValidatedReleaseLike {
  readonly releaseId: string;
  readonly formatVersion: string;
  readonly coverageFrom: IsoDate;
  readonly coverageTo: IsoDate;
  readonly profileIds: readonly string[];
  readonly calendarIds: readonly string[];
  readonly specialRegimeCatalogIds?: readonly string[];
  readonly artifacts: readonly ValidatedReleaseArtifactLike[];
}

export interface CalculationData {
  readonly releaseId: string;
  readonly formatVersion: string;
  readonly coverage: {
    readonly from: IsoDate;
    readonly to: IsoDate;
  };
  readonly profiles: ReadonlyMap<string, LegalProfile>;
  readonly calendars: ReadonlyMap<string, CalendarData>;
  readonly specialRegimeCatalogs: ReadonlyMap<string, import('./specialTypes').SpecialRegimeCatalog>;
}

export type TraceOperation =
  | 'resolveInputDate'
  | 'setDeadlineStart'
  | 'countDeadlineDays'
  | 'applySuspension'
  | 'shiftDeadlineEnd'
  | 'returnResult'
  | 'blockCalculation';

export interface TraceStep {
  readonly sequence: number;
  readonly operation: TraceOperation;
  readonly inputDate?: IsoDate;
  readonly outputDate?: IsoDate;
  readonly deadlineDays?: number;
  readonly skippedCalendarDays?: number;
  readonly periodIds?: readonly string[];
  readonly ruleIds: readonly string[];
  readonly reasonKeys: readonly string[];
}

export interface SuspensionResult {
  readonly enabled: boolean;
  readonly periodIds: readonly string[];
  readonly skippedCalendarDays: number;
}

export interface EndShiftResult {
  readonly applied: boolean;
  readonly reasonKeys: readonly string[];
  readonly holidayIds: readonly string[];
}

interface CalculationResultBase {
  readonly suspension: SuspensionResult;
  readonly endShift: EndShiftResult;
  readonly appliedRuleIds: readonly string[];
  readonly warningKeys: readonly string[];
  readonly blockReasonKeys: readonly string[];
  readonly trace: readonly TraceStep[];
}

export interface CalculatedDeadlineResult extends CalculationResultBase {
  readonly outcome: 'calculated';
  readonly legallyRelevantDate: IsoDate;
  readonly deadlineStart: IsoDate;
  readonly provisionalEnd: IsoDate;
  readonly finalEnd: IsoDate;
  readonly blockReasonKeys: readonly [];
}

export interface BlockedDeadlineResult extends CalculationResultBase {
  readonly outcome: 'blocked';
  readonly legallyRelevantDate?: IsoDate;
}

export type CalculationResult = CalculatedDeadlineResult | BlockedDeadlineResult;

export interface ResolvedCalendar {
  readonly calendarId: string;
  readonly jurisdictionCode: string;
  readonly coverage: {
    readonly from: IsoDate;
    readonly to: IsoDate;
  };
  readonly holidaysByDate: ReadonlyMap<IsoDate, readonly Holiday[]>;
  readonly suspensionSets: ReadonlyMap<string, SuspensionSet>;
}
