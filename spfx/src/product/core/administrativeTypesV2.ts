// SPDX-License-Identifier: AGPL-3.0-only
// DEC-2026-033. Data descriptions are not release or export capabilities.
import type { AdministrativeProcedureCatalog, AdministrativePathEligibility, AdministrativeReleaseBinding } from './administrativeTypes';

export interface AdministrativeQualificationRequirements {
  readonly action: 'ordinaryAppeal' | 'proceduralSubmission' | 'executionAppeal';
  readonly decisionKind: 'finalDecision' | 'qualifiedVRPGArt63Order' | 'notApplicable';
  readonly unit: 'day';
  readonly opening: 'qualifiedCompleteActualDelivery';
  readonly notice: 'uncontested';
  readonly termChange: 'none';
  readonly urgency: 'none';
}
interface AdministrativeQualificationIdentity {
  readonly pathId: string;
  readonly pathRevision: number;
  readonly pathSha256: string;
}
export type AdministrativeQualificationPolicy = AdministrativeQualificationIdentity & (
  { readonly mode: 'legacyV1'; readonly baseline: { readonly releaseId: '2026-10-15-mvp-08-approved.1'; readonly catalogSha256: string } }
  | { readonly mode: 'qualifiedDayProcedure'; readonly requirements: AdministrativeQualificationRequirements }
);
export interface AdministrativePathEligibilityV2 extends AdministrativePathEligibility {
  readonly qualificationPolicySha256: string;
}
export interface AdministrativeProcedureCatalogV2 extends Omit<AdministrativeProcedureCatalog, 'formatVersion' | 'contractDecision' | 'releaseBinding'> {
  readonly formatVersion: '2.0.0';
  readonly contractDecision: { readonly id: 'DEC-2026-033'; readonly status: 'proposed' | 'approved' | 'withdrawn'; readonly on: string | null };
  readonly qualificationPolicies: readonly AdministrativeQualificationPolicy[];
  readonly releaseBinding: Omit<AdministrativeReleaseBinding, 'pathEligibility'> & { readonly pathEligibility: readonly AdministrativePathEligibilityV2[] };
}
/** Current explicit case facts. Negative values remain representable, never truthy confirmations. */
export interface AdministrativeCaseQualification {
  readonly action: AdministrativeQualificationRequirements['action'] | 'objection' | 'reasonRequest' | 'costAdvance' | 'payment' | 'materialPerformance' | 'mainCaseAppeal' | 'schkgAppeal' | 'unknown';
  readonly decisionKind: AdministrativeQualificationRequirements['decisionKind'] | 'interimDecision' | 'paymentReminder' | 'schkgOrder' | 'mainDecision' | 'unknown';
  readonly unit: 'day' | 'hour' | 'month' | 'year' | 'fixedDate' | 'unknown';
  readonly direction: 'forward' | 'backward' | 'unknown';
  readonly opening: 'qualifiedCompleteActualDelivery' | 'oralAwaitingWrittenConfirmation' | 'dispositiveOnly' | 'fiction' | 'publication' | 'unknown';
  readonly notice: 'uncontested' | 'missing' | 'incorrect' | 'disputed' | 'unknown';
  readonly termChange: 'none' | 'extension' | 'reinstatement' | 'shortened' | 'other' | 'unknown';
}
