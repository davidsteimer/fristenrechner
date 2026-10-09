// SPDX-License-Identifier: AGPL-3.0-only

import type { FilingProfile, LocalizedLabels, RelativeCalculation, SpecialDeadlineResult, SpecialSourceReference, SpecialSuspensionProfile } from './specialTypes';

export interface SocialInterval { readonly from: string; readonly to: string | null }
export type SocialStatus = 'candidate' | 'reviewed' | 'withdrawn';
export type SocialLaw = 'ivg' | 'ahvg' | 'uvg' | 'elg' | 'avig' | 'kvg' | 'eog' | 'famzg' | 'flg' | 'mvg' | 'uelg';
export type SocialAction = 'preliminary-objection' | 'objection' | 'appeal' | 'ordered-administrative-days' | 'complaint-correction';
export type SocialFactKey = 'competentBodyQualified' | 'decisionOrigin' | 'elgAdministrativeCanton' | 'avigControlCanton' | 'avigOfficeCanton' | 'courtCanton' | 'partyDomicileCanton' | 'jurisdictionSpecialCase' | 'eogOfficeType' | 'compensationOfficeCanton' | 'familyAllowanceOrderCanton' | 'uelgAdministrativeCanton';
export type SocialCatalogFormat = '1.0.0' | '2.0.0';
export interface SocialNormBinding {
  readonly sourceId: string;
  readonly locator: string;
  readonly temporalSelector: 'legalTriggerDate' | 'procedureStartDate' | 'jurisdictionReferenceDate';
  readonly applicableFrom: string | null;
  readonly applicableTo: string | null;
  readonly verification: 'verified' | 'open';
}
interface SocialTemporalRecord {
  readonly legalValidity: SocialInterval | null;
  readonly caseCoverage: SocialInterval;
  readonly sourceCoverage: SocialInterval;
  readonly normBindings: readonly SocialNormBinding[];
  readonly sourceRefs: readonly SpecialSourceReference[];
}
export interface SocialFederalRule extends SocialTemporalRecord {
  readonly ruleId: string;
  readonly revision: number;
  readonly status: SocialStatus;
  readonly labels: LocalizedLabels;
  readonly law: SocialLaw;
  readonly matter: string;
  readonly action: SocialAction;
  readonly stage: 'administration' | 'cantonal-insurance-court';
  readonly triggerKind: string;
  readonly notificationChannels: readonly 'individual-service'[];
  readonly calculation: RelativeCalculation;
  readonly suspensionProfileId: 'S_ATSG';
  readonly filingProfileId: 'F7_ATSG_DISPATCH';
  readonly holidayPolicy: 'partyOrRepresentative';
  readonly endShiftPolicy: 'nextWorkingDay';
}
export interface SocialContextRoute {
  readonly contextRouteId: string;
  readonly kind: 'legal-jurisdiction' | 'product-scope';
  readonly requiredFacts: readonly {readonly factKey: SocialFactKey; readonly allowedValues: readonly (string | boolean)[]}[];
  readonly sourceRefs: readonly SpecialSourceReference[];
}
export interface SocialCalendarBinding {
  readonly calendarBindingId: string;
  readonly holidayCanton: string;
  readonly spatialScopeId: string;
  readonly calendarId: string;
  readonly requiredAnchorRoles: readonly ('party' | 'representative')[];
  readonly sourceRefs: readonly SpecialSourceReference[];
}
export interface SocialCantonalBinding extends SocialTemporalRecord {
  readonly bindingId: string;
  readonly revision: number;
  readonly status: SocialStatus;
  readonly labels: LocalizedLabels;
  readonly ruleId: string;
  readonly ruleRevision: number;
  readonly procedureContextCanton: string;
  readonly entryProfileId: string;
  readonly contextRoutes: readonly SocialContextRoute[];
  readonly calendarBindings: readonly SocialCalendarBinding[];
  readonly supplementaryLawRefs: readonly SpecialSourceReference[];
}
export interface ReleaseArtifactReference { readonly role: string; readonly contentId: string; readonly sha256: string }
export interface SocialReleaseEligibility {
  readonly eligibilityId: string;
  readonly releaseId: string;
  readonly status: 'candidate' | 'approved' | 'withdrawn';
  readonly ruleRef: {readonly ruleId: string; readonly revision: number; readonly sha256: string};
  readonly bindingRef: {readonly bindingId: string; readonly revision: number; readonly sha256: string};
  readonly contextRouteIds: readonly string[];
  readonly calendarBindingIds: readonly string[];
  readonly componentRefs: readonly ReleaseArtifactReference[];
  readonly sourceReviewRef: {readonly reviewId: string; readonly sha256: string};
  readonly referenceSuiteRef: {readonly suiteId: string; readonly sha256: string};
  readonly caseCoverage: SocialInterval;
  readonly calculationCoverage: SocialInterval;
  readonly approval: null | {readonly approvedBy: string; readonly approvedOn: string; readonly decisionRef: string};
}
export interface SocialSource {
  readonly sourceId: string;
  readonly sourceType: string;
  readonly title: string;
  readonly authority: string;
  readonly url: string;
  readonly documentVersionDate: string | null;
  readonly reviewedOn: string;
  readonly reviewStatus: 'verified' | 'monitored' | 'withdrawn';
}
export interface SocialProcedureCatalog {
  readonly $schema: string;
  readonly formatVersion: SocialCatalogFormat;
  readonly dataKind: 'socialProcedureCatalog';
  readonly catalogId: 'ch-social-procedures';
  readonly labels: LocalizedLabels;
  readonly review: {readonly reviewedOn: string; readonly status: string; readonly reviewedBy: string; readonly basis: string};
  readonly sources: readonly SocialSource[];
  readonly suspensionProfiles: readonly SpecialSuspensionProfile[];
  readonly filingProfiles: readonly FilingProfile[];
  readonly federalRules: readonly SocialFederalRule[];
  readonly cantonalBindings: readonly SocialCantonalBinding[];
  readonly releaseEligibility: readonly SocialReleaseEligibility[];
  readonly excludedPaths: readonly {readonly exclusionId: string; readonly law: SocialLaw; readonly matter: string; readonly action: string; readonly reasonKind: 'statutory-exclusion' | 'product-scope' | 'unsupported-procedure' | 'unresolved-qualification'; readonly reasonKey: string; readonly labels: LocalizedLabels; readonly sourceRefs: readonly SpecialSourceReference[]}[];
}
export interface SocialDeadlineInput {
  readonly ruleId: string;
  readonly bindingId: string;
  readonly contextRouteId: string;
  readonly procedureContextCanton: string;
  readonly authoritySeat?: {readonly country: string; readonly canton: string | null};
  readonly caseFacts: Readonly<Partial<Record<SocialFactKey, string | boolean>>>;
  readonly qualificationBasis: 'confirmed-case-facts' | 'displayed-model-scope';
  readonly matter: string;
  readonly triggerKind: string;
  readonly notificationChannel: 'individual-service';
  readonly notificationConfirmed: boolean;
  readonly legalTriggerDate: string;
  readonly procedureStartDate?: string;
  readonly jurisdictionReferenceDate?: string;
  readonly holidayResolution: {readonly status: 'resolved' | 'unknown' | 'conflict'; readonly anchors: readonly {readonly role: 'party' | 'representative'; readonly canton: string; readonly spatialScopeId: string}[]; readonly calendarBindingId: string};
  readonly days?: number;
}
export type SocialResolution = {readonly outcome: 'blocked'; readonly blockReasonKeys: readonly string[]} | {
  readonly outcome: 'resolved'; readonly catalog: SocialProcedureCatalog; readonly rule: SocialFederalRule; readonly binding: SocialCantonalBinding;
  readonly route: SocialContextRoute; readonly calendarBinding: SocialCalendarBinding; readonly eligibility: SocialReleaseEligibility; readonly days: number;
};
export interface SocialCalculationEvidence {
  readonly ruleId: string;
  readonly ruleRevision: number;
  readonly bindingId: string;
  readonly bindingRevision: number;
  readonly contextRouteId: string;
  readonly eligibilityId: string;
  readonly calendarId: string;
  readonly spatialScopeId: string;
  readonly releaseId: string;
  readonly sourceRefs: readonly SpecialSourceReference[];
}
export type SocialDeadlineResult = SpecialDeadlineResult & {readonly socialEvidence?: SocialCalculationEvidence};
