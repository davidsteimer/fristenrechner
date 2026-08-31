// SPDX-License-Identifier: AGPL-3.0-only

import type { IsoDate, RuleValidity } from './types';

export interface LocalizedLabels {
  readonly de: string;
  readonly fr: string;
}

export interface SpecialSourceReference {
  readonly sourceId: string;
  readonly locator: string;
}

export type SpecialStatus = 'supported' | 'blocked' | 'open';
export type DeadlineOrigin = 'CALCULATED' | 'AUTHORITATIVE';
export type WeekdayName =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface SpecialAnchor {
  readonly inputId: string;
  readonly role: 'trigger' | 'longstop' | 'comparison' | 'authoritativeDeadline';
  readonly valueType: 'date' | 'localTime';
  readonly labelKey: string;
  readonly fixedMonthDay?: string;
}

export interface SpecialDuration {
  readonly value: number;
  readonly unit: 'day' | 'month';
}

export interface RelativeCalculation {
  readonly type: 'R1_RELATIVE';
  readonly anchorInputId: string;
  readonly direction: 'after' | 'before';
  readonly anchorBoundary: 'included' | 'excluded';
  readonly duration?: SpecialDuration;
  readonly durationInputId?: string;
}

export interface OffsetCalculation {
  readonly type: 'R2_OFFSET';
  readonly anchorInputId: string;
  readonly offsetDays: number;
}

export interface WeekdayCalculation {
  readonly type: 'R3_WEEKDAY';
  readonly anchorInputId: string;
  readonly weekday: WeekdayName;
  readonly direction: 'after' | 'before';
  readonly ordinal: number;
  readonly strict: boolean;
}

export interface DualCalculation {
  readonly type: 'R4_DUAL';
  readonly branches: readonly {
    readonly branchId: string;
    readonly anchorInputId: string;
    readonly anchorBoundary: 'included' | 'excluded';
    readonly duration: SpecialDuration;
  }[];
  readonly selection: 'earliest' | 'latest';
}

export type SpecialCalculation =
  | RelativeCalculation
  | OffsetCalculation
  | WeekdayCalculation
  | DualCalculation;

export interface SpecialResultPolicy {
  readonly calendarProfileId: string;
  readonly suspensionProfileId: string;
  readonly endShiftPolicy: 'nextWorkingDay' | 'noShift' | 'manualReview';
  readonly strictFixedDate: boolean;
}

interface DeadlineDefinitionBase {
  readonly deadlineDefinitionId: string;
  readonly deadlineOrigin: DeadlineOrigin;
  readonly status: SpecialStatus;
  readonly validity: RuleValidity;
  readonly anchors: readonly SpecialAnchor[];
  readonly filingProfileId: string;
  readonly gateIds: readonly string[];
  readonly legalOverrideIds: readonly string[];
  readonly sourceRefs: readonly SpecialSourceReference[];
}

export interface CalculatedDeadlineDefinition extends DeadlineDefinitionBase {
  readonly deadlineOrigin: 'CALCULATED';
  readonly calculation: SpecialCalculation;
  readonly resultPolicy: SpecialResultPolicy;
}

export interface AuthoritativeDeadlineDefinition extends DeadlineDefinitionBase {
  readonly deadlineOrigin: 'AUTHORITATIVE';
  readonly authoritativeDeadline: {
    readonly dateValueId: string;
    readonly timeValueId?: string;
    readonly sourceMode: 'caseSpecificOfficialAct';
    readonly sourceRequired: true;
  };
}

export type DeadlineDefinition = CalculatedDeadlineDefinition | AuthoritativeDeadlineDefinition;

export interface SpecialCalendarProfile {
  readonly calendarProfileId: string;
  readonly calendarId: string | null;
  readonly holidayAnchor: string;
  readonly endShiftPolicy: 'nextWorkingDay' | 'manualReview';
  readonly labels: LocalizedLabels;
}

export interface SpecialSuspensionProfile {
  readonly suspensionProfileId: string;
  readonly mode: 'none' | 'useSet';
  readonly suspensionSetId: string | null;
  readonly labels: LocalizedLabels;
  readonly sourceRefs: readonly SpecialSourceReference[];
}

export interface FilingProfile {
  readonly filingProfileId: string;
  readonly preservationMode:
    | 'notApplicable'
    | 'dispatch'
    | 'receipt'
    | 'originalReceipt'
    | 'registeredDispatch'
    | 'electronicReceipt';
  readonly deadlineDimension: 'dateOnly' | 'dateAndTime';
  readonly acceptedChannels: readonly string[];
  readonly acceptedEvidence: readonly string[];
  readonly originalRequired: boolean;
  readonly cutoffTime: string | null;
  readonly timezone: 'Europe/Zurich' | null;
  readonly labels: LocalizedLabels;
  readonly sourceRefs: readonly SpecialSourceReference[];
}

export interface SpecialGate {
  readonly gateId: string;
  readonly type: 'preparatoryActChallenge';
  readonly status: 'supported';
  readonly leftOperand: 'finalDeadline';
  readonly operator: 'lt' | 'lte';
  readonly rightInputId: string;
  readonly onTrue: 'requireImmediateChallenge';
  readonly labels: LocalizedLabels;
  readonly sourceRefs: readonly SpecialSourceReference[];
}

export interface SpecialLegalOverride {
  readonly overrideId: string;
  readonly kind: 'emptyReference' | 'staleCrossReference' | 'practiceRule' | 'dynamicAuthorityOrder';
  readonly status: SpecialStatus;
  readonly targetRegimeIds: readonly string[];
  readonly warningRequired: boolean;
  readonly confirmationRequired: boolean;
  readonly validity: RuleValidity;
  readonly labels: LocalizedLabels;
  readonly sourceRefs: readonly SpecialSourceReference[];
}

export interface SpecialRegime {
  readonly regimeId: string;
  readonly regimeKind?: 'deadline' | 'filingOverlay';
  readonly level: 'federal' | 'cantonal';
  readonly lawCode: string;
  readonly provision: string;
  readonly labels: LocalizedLabels;
  readonly status: SpecialStatus;
  readonly statusReasonKey: string;
  readonly deadlineDefinitionIds: readonly string[];
  readonly filingProfileId: string | null;
  readonly calendarProfileId: string | null;
  readonly suspensionProfileId: string | null;
  readonly gateIds: readonly string[];
  readonly legalOverrideIds: readonly string[];
  readonly implementationScope: 'mvp02' | 'followup' | 'documentationOnly';
  readonly uiExposure: 'visible' | 'hidden' | 'documentation';
  readonly sourceRefs: readonly SpecialSourceReference[];
}

export interface SpecialRegimeCatalog {
  readonly dataKind: 'specialRegimeCatalog';
  readonly formatVersion: '2.0.0';
  readonly catalogId: string;
  readonly profileId: string;
  readonly validity: RuleValidity;
  readonly calendarProfiles: readonly SpecialCalendarProfile[];
  readonly suspensionProfiles: readonly SpecialSuspensionProfile[];
  readonly filingProfiles: readonly FilingProfile[];
  readonly gates: readonly SpecialGate[];
  readonly legalOverrides: readonly SpecialLegalOverride[];
  readonly deadlineDefinitions: readonly DeadlineDefinition[];
  readonly regimes: readonly SpecialRegime[];
}

export interface SpecialDeadlineInput {
  readonly profileId: string;
  readonly regimeId: string;
  readonly ruleId: string;
  readonly dateValues: Readonly<Record<string, IsoDate>>;
  readonly localTimeValues: Readonly<Record<string, string>>;
  readonly integerValues: Readonly<Record<string, number>>;
  readonly calendarProfileId: string;
  readonly suspensionProfileId: string;
  readonly filingProfileId: string;
  readonly overrideConfirmations: readonly string[];
}

export interface SpecialDeadlineValue {
  readonly date: IsoDate;
  readonly localTime: string | null;
  readonly timezone: 'Europe/Zurich' | null;
}

export interface SpecialGateResult {
  readonly gateId: string;
  readonly matched: boolean;
  readonly action: 'requireImmediateChallenge' | 'none';
}

export interface FilingRequirement {
  readonly filingProfileId: string;
  readonly preservationMode: FilingProfile['preservationMode'];
  readonly originalRequired: boolean;
  readonly cutoffTime: string | null;
  readonly timezone: 'Europe/Zurich' | null;
  readonly acceptedChannels: readonly string[];
  readonly acceptedEvidence: readonly string[];
}

export type SpecialTraceOperation =
  | 'resolveAnchors'
  | 'calculateRelative'
  | 'calculateOffset'
  | 'calculateWeekday'
  | 'calculateDualBranches'
  | 'selectDualDeadline'
  | 'applySuspension'
  | 'shiftDeadlineEnd'
  | 'evaluateGate'
  | 'resolveFilingRequirement'
  | 'applyLegalOverride'
  | 'returnResult'
  | 'blockCalculation';

export interface SpecialTraceStep {
  readonly sequence: number;
  readonly operation: SpecialTraceOperation;
  readonly inputDates?: readonly IsoDate[];
  readonly outputDate?: IsoDate;
  readonly ruleIds: readonly string[];
  readonly reasonKeys: readonly string[];
  readonly calendarEvidence?: import('./types').CalendarTraceEvidence;
}

export interface SpecialCalculationContext {
  readonly releaseId: string;
  readonly catalogId: string;
  readonly profileId: string;
  readonly regimeId: string;
  readonly ruleId: string;
  readonly deadlineOrigin: DeadlineOrigin;
  readonly calendarProfileId: string;
  readonly calendarId: string | null;
  readonly suspensionProfileId: string;
  readonly filingProfileId: string;
}

interface SpecialDeadlineResultBase {
  readonly outcome: 'calculated' | 'manualReview' | 'blocked';
  readonly calculationContext?: SpecialCalculationContext;
  readonly provisionalDeadline?: SpecialDeadlineValue;
  readonly finalDeadline?: SpecialDeadlineValue;
  readonly appliedRuleIds: readonly string[];
  readonly appliedOverrideIds: readonly string[];
  readonly gateResults: readonly SpecialGateResult[];
  readonly filingRequirement?: FilingRequirement;
  readonly warningKeys: readonly string[];
  readonly blockReasonKeys: readonly string[];
  readonly trace: readonly SpecialTraceStep[];
}

export interface CompletedSpecialDeadlineResult extends SpecialDeadlineResultBase {
  readonly outcome: 'calculated' | 'manualReview';
  readonly calculationContext: SpecialCalculationContext;
  readonly provisionalDeadline: SpecialDeadlineValue;
  readonly finalDeadline: SpecialDeadlineValue;
  readonly filingRequirement: FilingRequirement;
  readonly blockReasonKeys: readonly [];
}

export interface BlockedSpecialDeadlineResult extends SpecialDeadlineResultBase {
  readonly outcome: 'blocked';
}

export type SpecialDeadlineResult = CompletedSpecialDeadlineResult | BlockedSpecialDeadlineResult;
