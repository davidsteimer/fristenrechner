// SPDX-License-Identifier: AGPL-3.0-only
import type { HolidayCatalog, HolidayCatalogCalculation, HolidayCatalogLabels, HolidayCatalogProvenance, HolidayCatalogStatus } from './holidayCatalogTypes';
import type { CalendarRuleValidity } from './calendarRuleTypes';

export type CalendarProfile = 'stpo' | 'zpo' | 'bgg' | 'vwvg';
export interface CalendarProjectionRecipe {
  readonly id: string;
  readonly calendarId: string;
  readonly jurisdiction: string;
  readonly baseScopeId: string;
  readonly supplementScopeIds: readonly string[];
  readonly scopeIds: readonly string[];
  readonly ruleIds: readonly string[];
}
export interface CalendarMatrixDecision {
  readonly id: string;
  readonly profileId: CalendarProfile;
  readonly jurisdiction: string;
  readonly originScopeId: string;
  readonly mode: 'existing' | 'include' | 'replace' | 'supplement' | 'exclude' | 'limited' | 'resultDependentClarification' | 'create';
  readonly selectedScopeIds: readonly string[];
  readonly rowSha256: string;
}
export interface CalendarEvidence {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly locator: string;
  readonly jurisdiction: string;
  readonly versionOn: string | null;
  readonly retrievedOn: string;
  readonly review: string;
  readonly note: string;
  readonly approvalBasis?: string | null;
  readonly provenance?: HolidayCatalogProvenance;
  readonly status?: HolidayCatalogStatus;
}
export interface SupplementalHolidayRule {
  readonly id: string;
  readonly scopeId: string;
  readonly labels: HolidayCatalogLabels;
  readonly category: 'proceduralEquivalentDay';
  readonly dayPortion: 'fullDay';
  readonly calculation: HolidayCatalogCalculation;
  readonly condition: 'always';
  readonly legalValidity: CalendarRuleValidity;
  readonly sourceRefs: readonly { readonly evidenceId: string; readonly locator: string }[];
}
export interface CalendarAnchorPolicy {
  readonly id: string;
  readonly profileId: CalendarProfile;
  readonly resolvedModes: readonly ('court' | 'partyWithoutRepresentative' | 'qualifiedServiceRepresentative')[];
  readonly unresolvedModes: readonly ('missingCourt' | 'missingParty' | 'unqualifiedRepresentation' | 'nonProfessionalDifferentPlaces' | 'mandateChange' | 'personalActUnqualified' | 'unresolvedMultiplePlaces')[];
  readonly sourceIds: readonly string[];
}
export interface CalendarProcedureBinding {
  readonly id: string;
  readonly profileId: CalendarProfile;
  readonly jurisdiction: string;
  readonly purpose: 'deadlineCalendar';
  readonly anchorPolicyId: string;
  readonly caseCoverage: CalendarRuleValidity;
  readonly requiredAreaScopeIds: readonly string[];
  readonly variants: readonly {
    readonly areaFacts: readonly { readonly scopeId: string; readonly member: boolean }[];
    readonly projectionId: string;
    readonly alternativeProjectionId: string | null;
  }[];
  readonly matrixDecisionIds: readonly string[];
  readonly sourceIds: readonly string[];
  readonly boundaryIds: readonly ('GR-BASE-ONLY' | 'NE-YEAR-LOCAL-RESERVE')[];
  readonly ambiguity: null | {
    readonly decision: 'DEC-2026-029';
    readonly catalogRuleIds: readonly string[];
    readonly comparison: 'fullCalculation';
    readonly onDifference: 'clarificationRequired';
    readonly onEqual: 'resolved';
  };
  readonly approvalBasis: readonly ('DEC-2026-028' | 'DEC-2026-029')[];
  readonly reviewedOn: string;
}
export interface HolidayActivation {
  readonly contractDecision: { readonly id: 'DEC-2026-030'; readonly status: 'proposed' | 'approved'; readonly on: string | null };
  readonly base: { readonly catalogPath: string; readonly catalogSha256: string; readonly matrixPath: string; readonly matrixSha256: string };
  readonly sourceEvidence: readonly CalendarEvidence[];
  readonly sourceIdMap: readonly { readonly evidenceId: string; readonly sourceId: string }[];
  readonly supplementalScopes: readonly { readonly id: string; readonly jurisdiction: string; readonly scopeType: 'canton'; readonly legacyMatrixId: string; readonly legalValidity: CalendarRuleValidity }[];
  readonly supplementalRules: readonly SupplementalHolidayRule[];
  readonly matrixDecisions: readonly CalendarMatrixDecision[];
  readonly anchorPolicies: readonly CalendarAnchorPolicy[];
  readonly procedureBindings: readonly CalendarProcedureBinding[];
  readonly projections: readonly CalendarProjectionRecipe[];
  readonly releaseEligibility: {
    readonly status: 'candidate' | 'approved' | 'withdrawn';
    readonly releaseId: string | null;
    readonly approval: null | { readonly on: string; readonly by: string; readonly evidence: string };
  };
}
export interface HolidayCatalogV2 extends Omit<HolidayCatalog, 'formatVersion'> {
  readonly formatVersion: '2.0.0';
  readonly activation: HolidayActivation;
}
