// SPDX-License-Identifier: AGPL-3.0-only
// DEC-2026-035. Descriptive contracts do not create runtime or export authority.
import type { AdministrativePath, AdministrativeSourceRef } from './administrativeTypes';
import type { AdministrativeCaseQualification, AdministrativeProcedureCatalogV2,
  AdministrativeQualificationPolicy, AdministrativeQualificationRequirements } from './administrativeTypesV2';

export interface AdministrativeNormSegment {
  readonly interval: { readonly from: string; readonly to: string };
  readonly sourceRefs: readonly AdministrativeSourceRef[];
}
export interface AdministrativePathV3 extends Omit<AdministrativePath, 'temporalBinding'> {
  readonly temporalBinding: Omit<AdministrativePath['temporalBinding'], 'normVersionCoverage'>;
  readonly normTimeline: readonly AdministrativeNormSegment[];
}
export interface AdministrativeQualificationRequirementsV3 extends Omit<AdministrativeQualificationRequirements, 'action' | 'decisionKind'> {
  readonly action: 'ordinaryAppeal' | 'proceduralSubmission' | 'executionAppeal' | 'interimAppeal' | 'measuresAppeal';
  readonly decisionKind: 'finalDecision' | 'notApplicable' | 'qualifiedAGVRPG83ExecutionOrder' | 'qualifiedSGVRP44MeasuresOrder' | 'qualifiedSGVRP60InterimOrder';
  readonly targetBody: 'cantonAdministrativeAuthority' | 'administrativeAppealAuthority' | 'administrativeCourt' | 'administrativeAppealsCommission';
  readonly procedureMatter: 'generalAdministrative' | 'documentAccess';
  readonly channelCase: 'ordinaryNoFictionNoOutage' | 'notApplicable';
  readonly exceptionNotice: 'correctExceptionNotice' | 'notApplicable';
}
export interface AdministrativeQualificationPolicyV3 {
  readonly pathId: string;
  readonly pathRevision: number;
  readonly pathSha256: string;
  readonly mode: 'qualifiedDayProcedureV3';
  readonly requirements: AdministrativeQualificationRequirementsV3;
}
export interface AdministrativeProcedureCatalogV3 extends Omit<AdministrativeProcedureCatalogV2, 'formatVersion' | 'contractDecision' | 'paths' | 'qualificationPolicies'> {
  readonly formatVersion: '3.0.0';
  readonly contractDecision: { readonly id: 'DEC-2026-035'; readonly status: 'proposed' | 'approved' | 'withdrawn'; readonly on: string | null };
  readonly paths: readonly (AdministrativePath | AdministrativePathV3)[];
  readonly qualificationPolicies: readonly (AdministrativeQualificationPolicy | AdministrativeQualificationPolicyV3)[];
}
export interface AdministrativeCaseQualificationV3 extends Omit<AdministrativeCaseQualification, 'action' | 'decisionKind'> {
  readonly action: AdministrativeCaseQualification['action'] | 'interimAppeal' | 'measuresAppeal';
  readonly decisionKind: AdministrativeCaseQualification['decisionKind'] | 'qualifiedAGVRPG83ExecutionOrder' | 'qualifiedSGVRP44MeasuresOrder' | 'qualifiedSGVRP60InterimOrder';
  readonly targetBody: AdministrativeQualificationRequirementsV3['targetBody'] | 'unknown' | 'other';
  readonly procedureMatter: AdministrativeQualificationRequirementsV3['procedureMatter'] | 'unknown' | 'tax' | 'priorRequestForFormalDecisionOeffG17' | 'other';
  readonly channelCase: AdministrativeQualificationRequirementsV3['channelCase'] | 'unknown' | 'channelOutageClaimed' | 'electronicFictionUnresolved';
  readonly exceptionNotice: AdministrativeQualificationRequirementsV3['exceptionNotice'] | 'unknown' | 'missing' | 'incorrect' | 'disputed';
}
