// SPDX-License-Identifier: AGPL-3.0-only
import type {AdministrativeSourceRef} from './administrativeTypes';
import type {AdministrativeProcedureCatalogV4,AdministrativePathV4} from './administrativeTypesV4';
export type AdministrativeFactV5 = string | number | boolean;
export interface AdministrativeRequirementV5 {readonly key:string;readonly value:AdministrativeFactV5;readonly reason:string;}
export interface AdministrativeQualificationPolicyV5 {
 readonly pathId:string;readonly pathRevision:number;readonly pathSha256:string;
 readonly mode:'qualifiedDayProcedureV5';readonly requirements:readonly AdministrativeRequirementV5[];
 readonly openingChainPolicy:'requireOriginalOrTimelyRequestedReasons'|'notApplicable';
 readonly localHolidayPolicy:'blockConcreteUnresolvedAdditionalEndEffect';
}
export interface AdministrativePathV5 extends AdministrativePathV4 {readonly researchRef:string;readonly contractFamily:'qualifiedDayProcedureV5';}
export interface AdministrativeHolidayBindingV5 extends Omit<AdministrativeProcedureCatalogV4['holidayBindings'][number],'anchor'> {
 readonly bindingVersion:'5.0.0';readonly anchor:'authoritySeat'|'courtSeat';
 readonly projectionEvidence:{readonly kind:'proceduralSupplementProjection';readonly baselineReleaseId:string;readonly baselineCalendarId:string;
 readonly baselineCalendarSha256:string;readonly baselineCatalogSha256:string;readonly baseScopeId:string;readonly supplementScopeIds:readonly string[];
 readonly newRuleIds:readonly string[];readonly catalogRuleIds:readonly string[];readonly permissionInheritance:'none';readonly legalScope:string;
 readonly legalInterpretation:'directVRG34'|'directCourtStatute'|'systematicAdministrativeTransferConfirmedH1D'};
}
export interface AdministrativeProcedureCatalogV5 extends Omit<AdministrativeProcedureCatalogV4,'formatVersion'|'contractDecision'|'paths'|'qualificationPolicies'|'holidayBindings'> {
 readonly formatVersion:'5.0.0';
 readonly contractDecision:{readonly id:'DEC-2026-037';readonly status:'proposed'|'approved'|'withdrawn';readonly on:string|null};
 readonly paths:readonly (AdministrativeProcedureCatalogV4['paths'][number]|AdministrativePathV5)[];
 readonly qualificationPolicies:readonly (AdministrativeProcedureCatalogV4['qualificationPolicies'][number]|AdministrativeQualificationPolicyV5)[];
 readonly holidayBindings:readonly (AdministrativeProcedureCatalogV4['holidayBindings'][number]|AdministrativeHolidayBindingV5)[];
}
/** Exactly the currently selected policy facts. No default can supply these. */
export interface AdministrativeCaseQualificationV5 {readonly [key:string]:AdministrativeFactV5|undefined;}
