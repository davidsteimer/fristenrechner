// SPDX-License-Identifier: AGPL-3.0-only
// DEC-2026-036. Current case facts are not defaults or release capabilities.
import type { AdministrativeLaw, AdministrativeHolidayBinding, AdministrativePeriod, AdministrativeSourceRef } from './administrativeTypes';
import type { AdministrativeProcedureCatalogV3, AdministrativePathV3 } from './administrativeTypesV3';

export interface AdministrativeOpeningWarning {
  readonly warningId: 'ur-art22-opening-restriction';
  readonly evaluatedOn: 'qualifiedOpeningDate';
  readonly effect: 'noticeOnlyNoDateChange';
  readonly periods: readonly AdministrativePeriod[];
  readonly sourceRefs: readonly AdministrativeSourceRef[];
}
export interface AdministrativePathV4 extends AdministrativePathV3 {
  readonly openingWarnings: readonly AdministrativeOpeningWarning[];
}
export interface AdministrativeLawV4 extends Omit<AdministrativeLaw, 'holidayPolicyReview'> {
  readonly holidayPolicyReview: Omit<AdministrativeLaw['holidayPolicyReview'], 'explicitDeviation'> & {
    readonly explicitDeviation: 'noneIdentifiedInReviewedGeneralLaw' | 'explicitCourtLocationRule';
  };
}
export interface AdministrativeHolidayBindingV4 extends Omit<AdministrativeHolidayBinding, 'anchor'> {
  readonly bindingVersion: '4.0.0';
  readonly anchor: 'authoritySeat' | 'courtSeat';
  readonly physicalReuse: {
    readonly kind: 'sameDatesIndependentLegalBasis';
    readonly sourceReleaseId: string;
    readonly sourceCatalogSha256: string;
    readonly selectedRuleIds: readonly string[];
    readonly projectionRuleIds: readonly string[];
    readonly permissionInheritance: 'none';
    readonly evidenceRefs: readonly AdministrativeSourceRef[];
    readonly notDerivedFrom: 'notApplicable' | 'SH-ZPO-ADDITIONAL';
  };
  readonly practiceAddition: null | {
    readonly day: '01-02'; readonly sourceRefs: readonly AdministrativeSourceRef[];
    readonly evidenceLimit: 'nonDispositiveCantonalLawDescription'; readonly scope: 'newSHGeneralAdministrativeOnly';
  };
}
export interface AdministrativeQualificationRequirementsV4 {
  readonly action: 'ordinaryAdministrativeAppeal' | 'ordinaryAdministrativeCourtAppeal' | 'ordinaryAdministrativeRekurs'
    | 'orderedProceduralSubmission' | 'requestAdministrativeReasons' | 'requestCourtReasons';
  readonly opening: 'completeReasonedAdministrativeDecision' | 'orderedForwardDayPeriod' | 'lawfullyUnreasonedAdministrativeDecision'
    | 'lawfullyUnreasonedAdministrativeDecisionWithExpressReasonsOffer' | 'legallyQualifiedCourtDispositiveOrOralOpening';
  readonly holidayAnchor: 'targetAuthoritySeat' | 'issuingAuthoritySeat' | 'courtSeat';
  readonly authorityLevel: 'cantonal'; readonly specialLaw: 'excluded';
  readonly materialPerformance: false; readonly fixedEndDate: false; readonly deviatingStart: false;
  readonly termChange: 'none'; readonly unit: 'day'; readonly direction: 'forward'; readonly notice: 'uncontested';
  readonly suspensionContext: 'ordinaryNoException'; readonly serviceContext: 'effectiveLegalTriggerKnown';
  readonly requiredTargetCourt: 'notApplicable' | 'UR-Obergericht' | 'SO-Verwaltungsgericht' | 'SH-Obergericht';
  readonly requiredSameIssuingCourt: boolean;
  readonly openingChainPolicy: 'requireOriginalOrTimelyRequestedReasons' | 'notApplicable';
  readonly coordinationPolicy: 'excludeCoordinatedAppeal' | 'notApplicable';
  readonly localHolidayPolicy: 'blockConcreteUnresolvedAdditionalEndEffect' | 'notApplicable';
  readonly specialOpeningPolicy: 'ordinaryEffectiveUROpening' | 'notApplicable';
  readonly shorteningPolicy: 'noShortenedSHRekurs' | 'notApplicable';
}
export interface AdministrativeQualificationPolicyV4 {
  readonly pathId: string; readonly pathRevision: number; readonly pathSha256: string;
  readonly mode: 'qualifiedDayProcedureV4'; readonly requirements: AdministrativeQualificationRequirementsV4;
}
export interface AdministrativeProcedureCatalogV4 extends Omit<AdministrativeProcedureCatalogV3,
  'formatVersion' | 'contractDecision' | 'paths' | 'qualificationPolicies' | 'holidayBindings' | 'laws'> {
  readonly formatVersion: '4.0.0';
  readonly contractDecision: { readonly id: 'DEC-2026-036'; readonly status: 'proposed' | 'approved' | 'withdrawn'; readonly on: string | null };
  readonly paths: readonly (AdministrativeProcedureCatalogV3['paths'][number] | AdministrativePathV4)[];
  readonly qualificationPolicies: readonly (AdministrativeProcedureCatalogV3['qualificationPolicies'][number] | AdministrativeQualificationPolicyV4)[];
  readonly laws: readonly AdministrativeLawV4[];
  readonly holidayBindings: readonly (AdministrativeHolidayBinding | AdministrativeHolidayBindingV4)[];
}
/** Negative or unknown values are explicit states. Only policy-required facts may be present. */
export interface AdministrativeCaseQualificationV4 {
  readonly action: AdministrativeQualificationRequirementsV4['action'] | 'payment' | 'materialPerformance' | 'other' | 'unknown';
  readonly opening: AdministrativeQualificationRequirementsV4['opening'] | 'unreasonedFullAllowanceWithoutReasonsOffer' | 'other' | 'unknown';
  readonly holidayAnchor: AdministrativeQualificationRequirementsV4['holidayAnchor'] | 'partyOrRepresentativeSeat' | 'unknown';
  readonly materialPerformance: boolean;
  readonly unit: 'day' | 'hour' | 'month' | 'year' | 'fixedDate' | 'unknown';
  readonly direction: 'forward' | 'backward' | 'unknown';
  readonly notice: 'uncontested' | 'missing' | 'incorrect' | 'disputed' | 'unknown';
  readonly termChange: 'none' | 'restorationRequested' | 'extension' | 'other' | 'unknown';
  readonly suspensionContext: 'ordinaryNoException' | 'taxCase' | 'other' | 'unknown';
  readonly serviceContext: 'effectiveLegalTriggerKnown' | 'oralOpeningDateUnclear' | 'other' | 'unknown';
  readonly targetCourt?: AdministrativeQualificationRequirementsV4['requiredTargetCourt'] | 'lowerSpecialAdministrativeCourt' | 'unknown';
  readonly sameIssuingCourt?: boolean;
  readonly openingOrigin?: 'originalReasoned' | 'reasonedFollowingRequest' | 'unknown';
  readonly priorReasonsRequest?: 'timelyEstablished' | 'late' | 'unknown';
  readonly coordinatedDecision?: boolean;
  readonly localHolidayEffect?: 'noAdditionalRelevantLocalHoliday' | 'concretePotentialEndChangeUnresolved' | 'unknown';
  readonly urOpeningConsequence?: 'ordinaryEffectiveOpening' | 'specialPostponementClaimed' | 'unknown';
  readonly shortenedRekurs?: boolean;
}
