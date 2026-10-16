// SPDX-License-Identifier: AGPL-3.0-only
// AP23C/DEC-2026-032. These are data contracts, never runtime authority.
export type AdministrativeStage = 'administration' | 'administrativeAppeal' | 'court';
export type AdministrativeCanton = 'ZH' | 'BE' | 'LU' | 'UR' | 'SZ' | 'OW' | 'NW' | 'GL' | 'ZG' | 'FR' | 'SO' | 'BS' | 'BL' | 'SH' | 'AR' | 'AI' | 'SG' | 'GR' | 'AG' | 'TG' | 'TI' | 'VD' | 'VS' | 'NE' | 'GE' | 'JU';
export interface AdministrativeInterval { readonly from: string; readonly to: string | null }
export interface AdministrativeClosedInterval extends AdministrativeInterval { readonly to: string }
export interface AdministrativeSourceRef { readonly sourceId: string; readonly locator: string }
export interface AdministrativeEvidenceRef { readonly id: string; readonly sha256: string }
export interface AdministrativeComponentRef { readonly role: 'calendar' | 'holidayCatalog'; readonly contentId: string; readonly sha256: string }
export interface AdministrativeSource {
  readonly sourceId: string;
  readonly kind: 'statute' | 'officialMaterials' | 'judgment';
  readonly url: string;
  readonly versionDescription: string;
  readonly reviewedOn: string;
  readonly reviewBasis: string;
  readonly locators: string;
}
export interface AdministrativeLaw {
  readonly lawId: string;
  readonly canton: AdministrativeCanton;
  readonly title: string;
  readonly holidayPolicyReview: {
    readonly explicitDeviation: 'noneIdentifiedInReviewedGeneralLaw';
    readonly sourceRefs: readonly AdministrativeSourceRef[];
    readonly projectDecisionRef: 'DEC-2026-031';
  };
  readonly sourceRefs: readonly AdministrativeSourceRef[];
}
export type AdministrativePeriodExpression =
  | { readonly type: 'fixedMonthDay'; readonly month: number; readonly day: number; readonly yearOffset: 0 | 1 }
  | { readonly type: 'easterOffset'; readonly days: number; readonly yearOffset: 0 };
export interface AdministrativePeriod {
  readonly periodId: string;
  readonly start: AdministrativePeriodExpression;
  readonly end: AdministrativePeriodExpression;
  readonly inclusive: true;
}
export interface AdministrativeSuspensionProfile {
  readonly suspensionProfileId: string;
  readonly lawId: string;
  readonly periods: readonly AdministrativePeriod[];
  readonly sourceRefs: readonly AdministrativeSourceRef[];
}
export interface AdministrativeHolidayBinding {
  readonly holidayBindingId: string;
  readonly lawId: string;
  readonly authoritySeatCanton: AdministrativeCanton;
  readonly authorityLevel: 'cantonal';
  readonly anchor: 'authoritySeat';
  readonly physicalBaseline: {
    readonly releaseId: string;
    readonly calendarId: string;
    readonly projectionId: string;
    readonly references: readonly (AdministrativeComponentRef & { readonly path: string })[];
    readonly eligibilityMeaning: 'physicalSourceOnlyNotFederalProcedurePermission';
  };
  readonly legalBinding: {
    readonly sourceRefs: readonly AdministrativeSourceRef[];
    readonly projectDecisionRef: 'DEC-2026-031';
    readonly roleUnion: false;
    readonly partyOrRepresentativeRequired: false;
  };
}
export type AdministrativeDuration =
  | { readonly kind: 'statutoryDays'; readonly value: number; readonly overridable: false }
  | { readonly kind: 'authorityOrderedDays'; readonly minimum: 1; readonly maximum: 365; readonly boundMeaning: 'technicalSafetyLimitNotLegalMaximum' };
export interface AdministrativePath {
  readonly pathId: string;
  readonly revision: number;
  readonly researchRef: string;
  readonly lawId: string;
  readonly action: string;
  readonly stages: readonly AdministrativeStage[];
  readonly duration: AdministrativeDuration;
  readonly suspensionProfileId: string;
  readonly holidayBindingId: string;
  readonly urgencyPolicy: 'notApplicable' | 'explicitGRJudicialUrgencyOrder';
  readonly endShiftPolicy: 'nextWorkingDay';
  readonly endShiftGuard: 'none' | 'blockWhenEnteringApplicableSuspension';
  readonly qualification: {
    readonly delivery: 'qualifiedActualDelivery';
    readonly authorityLevel: 'cantonal';
    readonly generalRoute: 'qualified';
    readonly specialLaw: 'excluded';
    readonly fixedEndDate: false;
    readonly deviatingStart: false;
    readonly evidenceAdvance: false;
  };
  readonly temporalBinding: {
    readonly caseCoverage: AdministrativeClosedInterval;
    readonly calculationCoverage: AdministrativeClosedInterval;
    readonly sourceCoverage: AdministrativeClosedInterval;
    readonly normVersionCoverage: AdministrativeInterval;
    readonly evaluation: 'eachEvaluatedDayIncludingEndShift';
    readonly futureNormAssumption: 'proposalAssumingContinuedApplicabilityNotFutureLegalVerification';
  };
  readonly sourceRefs: readonly AdministrativeSourceRef[];
}
export interface AdministrativePathEligibility {
  readonly status: 'candidate' | 'approved' | 'withdrawn';
  readonly pathId: string;
  readonly pathRevision: number;
  readonly pathSha256: string;
  readonly holidayBindingId: string;
  readonly holidayBindingSha256: string;
  readonly suspensionProfileId: string;
  readonly suspensionProfileSha256: string;
  readonly caseCoverage: AdministrativeClosedInterval;
  readonly calculationCoverage: AdministrativeClosedInterval;
  readonly targetComponentRefs: readonly AdministrativeComponentRef[];
  readonly sourceReviewRef: AdministrativeEvidenceRef | null;
  readonly referenceSuiteRef: AdministrativeEvidenceRef | null;
}
export interface AdministrativeReleaseBinding {
  readonly status: 'candidate' | 'approved' | 'withdrawn';
  readonly releaseId: string | null;
  readonly approval: { readonly approvedBy: string; readonly approvedOn: string; readonly decisionRef: string } | null;
  readonly targetComponentRefs: readonly AdministrativeComponentRef[];
  readonly sourceReviewRef: AdministrativeEvidenceRef | null;
  readonly referenceSuiteRef: AdministrativeEvidenceRef | null;
  readonly pathEligibility: readonly AdministrativePathEligibility[];
  readonly promotionRequirement: 'rebindExactTargetReleaseBytesAndApproveBeforeActivation';
}
export interface AdministrativeProcedureCatalog {
  readonly $schema: string;
  readonly formatVersion: '1.0.0';
  readonly dataKind: 'administrativeProcedureCatalog';
  readonly catalogId: 'ch-cantonal-administrative-procedures';
  readonly contractStatus: 'proposed' | 'approved' | 'withdrawn';
  readonly runtimeActive: false;
  readonly contractDecision: { readonly id: 'DEC-2026-032'; readonly status: 'proposed' | 'approved' | 'withdrawn'; readonly on: string | null };
  readonly projectDecisions: readonly { readonly decisionId: 'DEC-2026-031'; readonly kind: 'projectLegalDecisionNotStatute'; readonly status: 'approved'; readonly on: '2026-10-14'; readonly by: 'David Steimer' }[];
  readonly review: { readonly basis: string; readonly sourceReview: string; readonly checkedOn: string };
  readonly holidayResolutionPolicy: {
    readonly precedence: readonly ['applicableFederalSpecialLaw', 'verifiedExplicitProceduralException', 'authoritySeat'];
    readonly unknownHandling: 'block';
    readonly federalSpecialHandling: 'routeOnlyToSeparatelyQualifiedReleasedSpecialPath';
    readonly exceptionHandling: 'requiresExplicitReviewedBinding';
    readonly fallbackMeaning: 'onlyReviewedAndReleasedCantonalProcedurePaths';
  };
  readonly sources: readonly AdministrativeSource[];
  readonly laws: readonly AdministrativeLaw[];
  readonly suspensionProfiles: readonly AdministrativeSuspensionProfile[];
  readonly holidayBindings: readonly AdministrativeHolidayBinding[];
  readonly paths: readonly AdministrativePath[];
  readonly releaseBinding: AdministrativeReleaseBinding;
  readonly excludedPaths: readonly { readonly exclusionId: string; readonly scope: string; readonly reason: string }[];
  readonly preserved: readonly { readonly path: string; readonly sha256: string }[];
}
