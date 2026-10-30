// SPDX-License-Identifier: AGPL-3.0-only
// DEC-2026-041. Closed descriptions, never parser or export capabilities.
import type {AdministrativeInterval,AdministrativeSourceRef} from './administrativeTypes';
import type {AdministrativePathEligibilityV6,AdministrativeRequirementV6} from './administrativeTypesV6';
import type {AdministrativeNormSegment} from './administrativeTypesV3';
import type {AdministrativeProcedureCatalogV8,AdministrativePathV8,AdministrativeHolidayBindingV8,AdministrativeCalendarResolutionV8} from './administrativeTypesV8';
export type AdministrativeDurationV9=AdministrativePathV8['duration']|
 {readonly kind:'authorityOrderedDays';readonly minimum:1;readonly maximum:10;readonly boundMeaning:'statutoryMaximumForCurrentOrder'}|
 {readonly kind:'qualifiedLongerNoticeDays';readonly valueFact:'actualLongerInstructionDays';readonly ordinaryBaseFact:'ordinaryStatutoryDays';readonly minimum:31;readonly maximum:365;
  readonly ordinaryBaseAllowed:readonly(7|10|30)[];readonly qualificationFact:'longerInstructionQualification';readonly qualifiedValue:'aboveBothStatutoryAndThirty';
  readonly comparison:'strictlyAboveOrdinaryBaseAndThirty';readonly boundMeaning:'qualifiedCurrentInstructionWithTechnicalSafetyLimit'};
export type AdministrativeOpeningPolicyV9=AdministrativePathV8['openingPolicy']|{
 readonly kind:'aiQualifiedOrTrackingPost';readonly factKey:'openingMode';readonly qualifiedMode:'qualifiedLegalOpening';readonly trackingMode:'trackingPhysicalReceipt';
 readonly qualifiedTransformation:'none';readonly trackingTransformation:'nextWorkingDayIfNonWorkingReceipt';readonly holidayBinding:'sameAsPath';readonly otherwise:'block';
 readonly trackingRequirements:readonly AdministrativeRequirementV6[];readonly sourceRefs:readonly AdministrativeSourceRef[];
};
export interface AdministrativePathV9 extends Omit<AdministrativePathV8,'contractFamily'|'duration'|'openingPolicy'> {
 readonly contractFamily:'qualifiedDayProcedureV9';readonly duration:AdministrativeDurationV9;readonly openingPolicy:AdministrativeOpeningPolicyV9;
}
export interface AdministrativeQualificationPolicyV9 {
 readonly pathId:string;readonly pathRevision:number;readonly pathSha256:string;readonly mode:'qualifiedDayProcedureV9';
 readonly requirements:readonly AdministrativeRequirementV6[];readonly openingChainPolicy:'notApplicable';readonly localHolidayPolicy:'boundProceduralCalendarSupplement';
}
export type AdministrativeProceduralCalendarSupplementV9={readonly kind:'none'}|{
 readonly kind:'szSchwyzMartinstag';readonly effect:'endShiftOnly';readonly coverage:AdministrativeInterval;readonly authorityMunicipality:'Schwyz';
 readonly dates:readonly['2026-11-11','2027-11-11'];readonly sourceRefs:readonly AdministrativeSourceRef[];
};
export interface AdministrativeHolidayBindingV9 extends Omit<AdministrativeHolidayBindingV8,'bindingVersion'|'anchor'|'calendarSelection'|'annualEndShiftPolicy'> {
 readonly bindingVersion:'9.0.0';readonly anchor:'authoritySeat';
 readonly calendarSelection:{readonly kind:'fixedAuthoritySeat';readonly calendarId:string;readonly projectionId:string};
 readonly proceduralCalendarSupplement:AdministrativeProceduralCalendarSupplementV9;
}
export interface AdministrativePathEligibilityV9 extends AdministrativePathEligibilityV6 {
 readonly openingPolicySha256:string;readonly calendarSelectionSha256:string;readonly proceduralCalendarSupplementSha256:string;readonly durationPolicySha256:string;
}
export interface AdministrativeProcedureCatalogV9 extends Omit<AdministrativeProcedureCatalogV8,'formatVersion'|'contractDecision'|'paths'|'qualificationPolicies'|'holidayBindings'|'releaseBinding'> {
 readonly formatVersion:'9.0.0';readonly contractDecision:{readonly id:'DEC-2026-041';readonly status:'proposed'|'approved'|'withdrawn';readonly on:string|null};
 readonly paths:readonly(AdministrativeProcedureCatalogV8['paths'][number]|AdministrativePathV9)[];
 readonly qualificationPolicies:readonly(AdministrativeProcedureCatalogV8['qualificationPolicies'][number]|AdministrativeQualificationPolicyV9)[];
 readonly holidayBindings:readonly(AdministrativeProcedureCatalogV8['holidayBindings'][number]|AdministrativeHolidayBindingV9)[];
 readonly releaseBinding:Omit<AdministrativeProcedureCatalogV8['releaseBinding'],'pathEligibility'>&{
  readonly pathEligibility:readonly(AdministrativeProcedureCatalogV8['releaseBinding']['pathEligibility'][number]|AdministrativePathEligibilityV9)[]};
}
export type AdministrativeCaseQualificationV9=Readonly<Record<string,string|number|boolean>>;
export type AdministrativeCalendarResolutionV9=AdministrativeCalendarResolutionV8;
export interface AdministrativeOpeningResolutionV9 {
 readonly policyKind:AdministrativeOpeningPolicyV9['kind'];readonly openingPolicySha256:string;
 readonly inputMeaning:'qualifiedLegalOpeningDate'|'physicalTrackingReceiptDate';readonly inputMode:'qualifiedLegalOpening'|'trackingPhysicalReceipt'|null;
 readonly inputDate:string;readonly qualifiedOpeningDate:string;readonly openingShiftDates:readonly string[];readonly triggerKind:'qualifiedLegalOpening';
 readonly evaluatedNormSegments:readonly AdministrativeNormSegment[];readonly sourceRefs:readonly AdministrativeSourceRef[];
}
export interface AdministrativeProceduralCalendarSupplementResolutionV9 {
 readonly kind:AdministrativeProceduralCalendarSupplementV9['kind'];readonly proceduralCalendarSupplementSha256:string;readonly effect:'none'|'endShiftOnly';
 readonly coverage:AdministrativeInterval|null;readonly authorityMunicipality:'Schwyz'|null;
 readonly boundDates:readonly{readonly date:string;readonly sourceRefs:readonly AdministrativeSourceRef[]}[];readonly shiftedDates:readonly string[];
}
export interface AdministrativeDurationResolutionV9 {
 readonly kind:'qualifiedLongerNoticeDays';readonly actualLongerInstructionDays:number;readonly ordinaryStatutoryDays:number;readonly qualification:'aboveBothStatutoryAndThirty';
}
