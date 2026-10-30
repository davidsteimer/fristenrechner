// SPDX-License-Identifier: AGPL-3.0-only
// DEC-2026-039. Closed current triggers are descriptions, never capabilities.
import type {AdministrativeDuration,AdministrativeSourceRef} from './administrativeTypes';
import type {AdministrativePathV6,AdministrativeQualificationPolicyV6,AdministrativePathEligibilityV6,
 AdministrativeHolidayBindingV6,AdministrativeProcedureCatalogV6} from './administrativeTypesV6';
import type {AdministrativeNormSegment} from './administrativeTypesV3';
export type AdministrativeTriggerKindV7='qualifiedWrittenOpening'|'qualifiedExtensionRefusalAfterExpiredDeadline'|
 'qualifiedTcDispositifOpening'|'qualifiedOralDecisionOpening'|'qualifiedFullyFavourableAbbreviatedOpening';
export type AdministrativeOpeningModeV7='qualifiedLegalOpening'|'ordinaryPostPhysicalReceipt';
export type AdministrativeOpeningPolicyV7=
 {readonly kind:'qualifiedCurrentTrigger';readonly triggerKind:AdministrativeTriggerKindV7;readonly transformation:'none';readonly sourceRefs:readonly AdministrativeSourceRef[]}|
 {readonly kind:'geQualifiedOrOrdinaryPost';readonly factKey:'openingMode';readonly allowedModes:readonly ['qualifiedLegalOpening','ordinaryPostPhysicalReceipt'];
  readonly ordinaryPostTransformation:'nextWorkingDayIfNonWorkingReceipt';readonly holidayBinding:'sameAsPath';readonly otherwise:'block';readonly sourceRefs:readonly AdministrativeSourceRef[]};
export interface AdministrativePathV7 extends Omit<AdministrativePathV6,'contractFamily'|'duration'|'qualification'|'suspensionSelection'> {
 readonly contractFamily:'qualifiedDayProcedureV7';readonly duration:AdministrativeDuration;
 readonly qualification:Omit<AdministrativePathV6['qualification'],'delivery'>&{readonly delivery:'qualifiedTriggerAccordingToOpeningPolicy'};
 readonly suspensionSelection:{readonly kind:'fixed';readonly suspensionProfileId:string};
 readonly openingPolicy:AdministrativeOpeningPolicyV7;
}
export interface AdministrativeQualificationPolicyV7 extends Omit<AdministrativeQualificationPolicyV6,'mode'> {readonly mode:'qualifiedDayProcedureV7'}
export interface AdministrativePathEligibilityV7 extends AdministrativePathEligibilityV6 {readonly openingPolicySha256:string}
export interface AdministrativeHolidayBindingV7 extends Omit<AdministrativeHolidayBindingV6,'bindingVersion'> {readonly bindingVersion:'7.0.0'}
export interface AdministrativeProcedureCatalogV7 extends Omit<AdministrativeProcedureCatalogV6,'formatVersion'|'contractDecision'|'paths'|'qualificationPolicies'|'holidayBindings'|'releaseBinding'> {
 readonly formatVersion:'7.0.0';
 readonly contractDecision:{readonly id:'DEC-2026-039';readonly status:'proposed'|'approved'|'withdrawn';readonly on:string|null};
 readonly paths:readonly(AdministrativeProcedureCatalogV6['paths'][number]|AdministrativePathV7)[];
 readonly qualificationPolicies:readonly(AdministrativeProcedureCatalogV6['qualificationPolicies'][number]|AdministrativeQualificationPolicyV7)[];
 readonly holidayBindings:readonly(AdministrativeProcedureCatalogV6['holidayBindings'][number]|AdministrativeHolidayBindingV7)[];
 readonly releaseBinding:Omit<AdministrativeProcedureCatalogV6['releaseBinding'],'pathEligibility'>&{
  readonly pathEligibility:readonly(AdministrativeProcedureCatalogV6['releaseBinding']['pathEligibility'][number]|AdministrativePathEligibilityV7)[]};
}
export interface AdministrativeOpeningResolutionV7 {
 readonly policyKind:AdministrativeOpeningPolicyV7['kind'];readonly openingPolicySha256:string;
 readonly inputMeaning:'qualifiedCurrentTriggerDate'|'qualifiedLegalOpeningDate'|'physicalOrdinaryPostReceiptDate';
 readonly inputMode:AdministrativeOpeningModeV7|null;readonly inputDate:string;readonly qualifiedOpeningDate:string;
 readonly openingShiftDates:readonly string[];readonly triggerKind:AdministrativeTriggerKindV7|null;
 readonly evaluatedNormSegments:readonly AdministrativeNormSegment[];readonly sourceRefs:readonly AdministrativeSourceRef[];
}
