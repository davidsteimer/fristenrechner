// SPDX-License-Identifier: AGPL-3.0-only
// DEC-2026-042. Closed descriptions never issue a parser or export capability.
import type {AdministrativeSourceRef} from './administrativeTypes';
import type {AdministrativeNormSegment} from './administrativeTypesV3';
import type {AdministrativePathEligibilityV6,AdministrativeRequirementV6} from './administrativeTypesV6';
import type {AdministrativePathV8,AdministrativeCalendarResolutionV8} from './administrativeTypesV8';
import type {AdministrativeProcedureCatalogV9,AdministrativeHolidayBindingV9,AdministrativeProceduralCalendarSupplementResolutionV9} from './administrativeTypesV9';
export type AdministrativeProceduralCalendarSupplementResolutionV10=AdministrativeProceduralCalendarSupplementResolutionV9;
export type AdministrativeDurationV10=AdministrativePathV8['duration']|{
 readonly kind:'qualifiedVsLongerNoticeDays';readonly valueFact:'actualInstructionDays';readonly ordinaryBaseFact:'ordinaryDays';
 readonly minimum:1;readonly maximum:365;readonly ordinaryBaseAllowed:readonly(10|30)[];
 readonly comparison:'strictlyAboveOrdinaryBase';readonly boundMeaning:'qualifiedCurrentInstructionWithTechnicalSafetyLimit';
};
export type AdministrativeOpeningPolicyV10=AdministrativePathV8['openingPolicy']|{
 readonly kind:'vdQualifiedOrUnsignedPost';readonly factKey:'openingMode';readonly qualifiedMode:'qualifiedLegalOpening';readonly trackingMode:'vdUnsignedPostalReceipt';
 readonly qualifiedTransformation:'none';readonly trackingTransformation:'nextWorkingDayIfNonWorkingReceipt';readonly holidayBinding:'sameAsPath';readonly otherwise:'block';
 readonly trackingRequirements:readonly AdministrativeRequirementV6[];readonly sourceRefs:readonly AdministrativeSourceRef[];
};
export interface AdministrativePathV10 extends Omit<AdministrativePathV8,'contractFamily'|'duration'|'openingPolicy'> {
 readonly contractFamily:'qualifiedDayProcedureV10';readonly duration:AdministrativeDurationV10;readonly openingPolicy:AdministrativeOpeningPolicyV10;
}
export interface AdministrativeQualificationPolicyV10 {
 readonly pathId:string;readonly pathRevision:number;readonly pathSha256:string;readonly mode:'qualifiedDayProcedureV10';
 readonly requirements:readonly AdministrativeRequirementV6[];readonly openingChainPolicy:'notApplicable';readonly localHolidayPolicy:'boundProceduralCalendarSupplement';
}
export type AdministrativeAuthorityHolidayRegionV10='neWithoutLeLanderon'|'leLanderon';
export type AdministrativeCalendarSelectionV10={readonly kind:'fixedAuthoritySeat';readonly calendarId:string;readonly projectionId:string}|{
 readonly kind:'qualifiedAuthoritySeatRegion';readonly factKey:'authorityHolidayRegion';readonly otherwise:'block';readonly defaultAllowed:false;
 readonly cases:readonly{readonly value:AdministrativeAuthorityHolidayRegionV10;readonly calendarId:string;readonly projectionId:string}[];
};
export interface AdministrativeHolidayBindingV10 extends Omit<AdministrativeHolidayBindingV9,'bindingVersion'|'calendarSelection'|'proceduralCalendarSupplement'> {
 readonly bindingVersion:'10.0.0';readonly calendarSelection:AdministrativeCalendarSelectionV10;readonly proceduralCalendarSupplement:{readonly kind:'none'};
}
export interface AdministrativePathEligibilityV10 extends AdministrativePathEligibilityV6 {
 readonly openingPolicySha256:string;readonly calendarSelectionSha256:string;readonly proceduralCalendarSupplementSha256:string;readonly durationPolicySha256:string;
}
export interface AdministrativeProcedureCatalogV10 extends Omit<AdministrativeProcedureCatalogV9,'formatVersion'|'contractDecision'|'paths'|'qualificationPolicies'|'holidayBindings'|'releaseBinding'> {
 readonly formatVersion:'10.0.0';readonly contractDecision:{readonly id:'DEC-2026-042';readonly status:'proposed'|'approved'|'withdrawn';readonly on:string|null};
 readonly paths:readonly(AdministrativeProcedureCatalogV9['paths'][number]|AdministrativePathV10)[];
 readonly qualificationPolicies:readonly(AdministrativeProcedureCatalogV9['qualificationPolicies'][number]|AdministrativeQualificationPolicyV10)[];
 readonly holidayBindings:readonly(AdministrativeProcedureCatalogV9['holidayBindings'][number]|AdministrativeHolidayBindingV10)[];
 readonly releaseBinding:Omit<AdministrativeProcedureCatalogV9['releaseBinding'],'pathEligibility'>&{
  readonly pathEligibility:readonly(AdministrativeProcedureCatalogV9['releaseBinding']['pathEligibility'][number]|AdministrativePathEligibilityV10)[]};
}
export type AdministrativeCaseQualificationV10=Readonly<Record<string,string|number|boolean|null>>;
export interface AdministrativeCalendarResolutionV10 extends Omit<AdministrativeCalendarResolutionV8,'selectionKind'> {
 readonly selectionKind:AdministrativeCalendarResolutionV8['selectionKind']|'qualifiedAuthoritySeatRegion';
 readonly authorityHolidayRegion?:AdministrativeAuthorityHolidayRegionV10|null;
}
export interface AdministrativeOpeningResolutionV10 {
 readonly policyKind:AdministrativeOpeningPolicyV10['kind'];readonly openingPolicySha256:string;
 readonly inputMeaning:'qualifiedLegalOpeningDate'|'physicalUnsignedPostalReceiptDate';readonly inputMode:'qualifiedLegalOpening'|'vdUnsignedPostalReceipt'|null;
 readonly inputDate:string;readonly qualifiedOpeningDate:string;readonly openingShiftDates:readonly string[];readonly triggerKind:'qualifiedLegalOpening';
 readonly evaluatedNormSegments:readonly AdministrativeNormSegment[];readonly sourceRefs:readonly AdministrativeSourceRef[];
}
export interface AdministrativeDurationResolutionV10 {
 readonly kind:'qualifiedVsLongerNoticeDays';readonly actualInstructionDays:number;readonly ordinaryDays:number;
 // Closed absent historical fields keep legacy provenance readers source-compatible.
 readonly actualLongerInstructionDays?:never;readonly ordinaryStatutoryDays?:never;readonly qualification?:never;
}
