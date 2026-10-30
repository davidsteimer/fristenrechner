// SPDX-License-Identifier: AGPL-3.0-only
// DEC-2026-040. Closed V8 meanings are descriptions, never runtime authority.
import type {AdministrativeCanton,AdministrativeComponentRef,AdministrativeDuration,AdministrativeInterval,AdministrativeLaw,AdministrativeSourceRef} from './administrativeTypes';
import type {AdministrativeRequirementV6,AdministrativePathEligibilityV6} from './administrativeTypesV6';
import type {AdministrativePathV7,AdministrativeProcedureCatalogV7,AdministrativeOpeningResolutionV7} from './administrativeTypesV7';
import type {CalendarProcedureBinding} from './holidayActivationTypes';
export type AdministrativeAreaScopeV8='AI-RTG-INNER-ADDITIONAL'|'NE-LANDERON-ADDITIONAL';
export type AdministrativeAreaFactsV8=Readonly<Partial<Record<AdministrativeAreaScopeV8,boolean>>>;
export interface AdministrativeLawV8 extends Omit<AdministrativeLaw,'holidayPolicyReview'> {
 readonly holidayPolicyReview:Omit<AdministrativeLaw['holidayPolicyReview'],'explicitDeviation'>&{
  readonly explicitDeviation:'noneIdentifiedInReviewedGeneralLaw'|'explicitReviewedPathDependentAnchor'};
}
export interface AdministrativeOpeningPolicyV8 {
 readonly kind:'qualifiedCurrentTrigger';readonly triggerKind:'qualifiedLegalOpening';readonly transformation:'none';readonly sourceRefs:readonly AdministrativeSourceRef[];
}
export interface AdministrativePathV8 extends Omit<AdministrativePathV7,'contractFamily'|'duration'|'openingPolicy'> {
 readonly contractFamily:'qualifiedDayProcedureV8';readonly duration:AdministrativeDuration;readonly openingPolicy:AdministrativeOpeningPolicyV8;
}
export interface AdministrativeQualificationPolicyV8 {
 readonly pathId:string;readonly pathRevision:number;readonly pathSha256:string;readonly mode:'qualifiedDayProcedureV8';
 readonly requirements:readonly AdministrativeRequirementV6[];readonly openingChainPolicy:'notApplicable';readonly localHolidayPolicy:'boundEndCalendarPolicy';
}
export interface AdministrativeDynamicTerminalV8 {
 readonly canton:AdministrativeCanton;readonly bindingId:string;readonly bindingSha256:string;readonly requiredAreaScopeIds:readonly AdministrativeAreaScopeV8[];
 readonly variants:readonly{readonly areaFacts:readonly{readonly scopeId:AdministrativeAreaScopeV8;readonly member:boolean}[];
  readonly projectionId:string;readonly projectionSha256:string;readonly calendarId:string;readonly alternativeProjectionId:string|null;readonly alternativeProjectionSha256:string|null}[];
 readonly boundaryIds:CalendarProcedureBinding['boundaryIds'];readonly ambiguity:CalendarProcedureBinding['ambiguity'];
}
export type AdministrativeCalendarSelectionV8=
 {readonly kind:'fixedAuthoritySeat';readonly calendarId:string;readonly projectionId:string}|
 {readonly kind:'qualifiedPartyOrRepresentativeCanton';readonly qualificationFact:'legalAnchorQualification';readonly qualifiedValue:'establishedPartyOrRepresentative';
  readonly cantonFact:'legalAnchorCanton';readonly sourceProfileId:'vwvg';readonly usage:'holidayProjectionOnlyNoFederalProcedurePermission';readonly otherwise:'block';
  readonly terminals:readonly AdministrativeDynamicTerminalV8[]};
export type AdministrativeAnnualEndShiftPolicyV8={readonly kind:'none'}|{
 readonly kind:'blCantonalOfficeClosures';readonly effect:'endShiftOnly';readonly coverage:AdministrativeInterval;
 readonly years:readonly{readonly year:number;readonly coverage:AdministrativeInterval;readonly dates:readonly string[];readonly sourceRefs:readonly AdministrativeSourceRef[]}[];
 readonly uncertainty:{readonly boundaryId:'BL-B-FASNACHT';readonly dates:readonly string[];readonly comparison:'twoCompleteAdministrativePaths';
  readonly onDifference:'blockDefinitiveResultAndExport';readonly onEqual:'sameResult';readonly inputOverride:'forbidden';readonly sourceRefs:readonly AdministrativeSourceRef[]};
};
export interface AdministrativeHolidayBindingV8 {
 readonly holidayBindingId:string;readonly lawId:string;readonly authoritySeatCanton:AdministrativeCanton;readonly authorityLevel:'cantonal';readonly bindingVersion:'8.0.0';
 readonly anchor:'authoritySeat'|'qualifiedPartyOrRepresentativeCanton';
 readonly physicalSource:{readonly releaseId:string;readonly references:readonly(AdministrativeComponentRef&{readonly path:string})[];
  readonly eligibilityMeaning:'physicalSourceOnlyNotFederalProcedurePermission'};
 readonly legalBinding:{readonly sourceRefs:readonly AdministrativeSourceRef[];readonly projectDecisionRef:'DEC-2026-031';readonly roleUnion:false;readonly partyOrRepresentativeRequired:boolean};
 readonly calendarSelection:AdministrativeCalendarSelectionV8;readonly annualEndShiftPolicy:AdministrativeAnnualEndShiftPolicyV8;
}
export interface AdministrativePathEligibilityV8 extends AdministrativePathEligibilityV6 {
 readonly openingPolicySha256:string;readonly calendarSelectionSha256:string;readonly annualEndShiftPolicySha256:string;
}
export interface AdministrativeProcedureCatalogV8 extends Omit<AdministrativeProcedureCatalogV7,'formatVersion'|'contractDecision'|'laws'|'paths'|'qualificationPolicies'|'holidayBindings'|'releaseBinding'> {
 readonly formatVersion:'8.0.0';readonly contractDecision:{readonly id:'DEC-2026-040';readonly status:'proposed'|'approved'|'withdrawn';readonly on:string|null};
 readonly laws:readonly AdministrativeLawV8[];
 readonly paths:readonly(AdministrativeProcedureCatalogV7['paths'][number]|AdministrativePathV8)[];
 readonly qualificationPolicies:readonly(AdministrativeProcedureCatalogV7['qualificationPolicies'][number]|AdministrativeQualificationPolicyV8)[];
 readonly holidayBindings:readonly(AdministrativeProcedureCatalogV7['holidayBindings'][number]|AdministrativeHolidayBindingV8)[];
 readonly releaseBinding:Omit<AdministrativeProcedureCatalogV7['releaseBinding'],'pathEligibility'>&{
  readonly pathEligibility:readonly(AdministrativeProcedureCatalogV7['releaseBinding']['pathEligibility'][number]|AdministrativePathEligibilityV8)[]};
}
export interface AdministrativeOpeningResolutionV8 extends Omit<AdministrativeOpeningResolutionV7,'triggerKind'|'inputMeaning'> {
 readonly triggerKind:'qualifiedLegalOpening';readonly inputMeaning:'qualifiedLegalOpeningDate';
}
export interface AdministrativeCalendarResolutionV8 {
 readonly selectionKind:AdministrativeCalendarSelectionV8['kind'];readonly calendarSelectionSha256:string;readonly holidayBindingSha256:string;
 readonly calendarId:string;readonly projectionId:string;readonly authoritySeatCanton:AdministrativeCanton;
 readonly legalAnchorQualification:'establishedPartyOrRepresentative'|null;readonly legalAnchorCanton:AdministrativeCanton|null;
 readonly terminalBindingId:string|null;readonly terminalBindingSha256:string|null;readonly requiredAreaScopeIds:readonly AdministrativeAreaScopeV8[];
 readonly areaFacts:AdministrativeAreaFactsV8;readonly boundaryIds:CalendarProcedureBinding['boundaryIds'];
 readonly januaryComparison:null|{readonly variedCatalogRuleIds:readonly string[];readonly withoutJanuary2:string;readonly withJanuary2:string;readonly outcome:'equal'|'different'};
}
export interface AdministrativeAnnualEndShiftResolutionV8 {
 readonly kind:AdministrativeAnnualEndShiftPolicyV8['kind'];readonly annualEndShiftPolicySha256:string;readonly effect:'none'|'endShiftOnly';
 readonly evaluatedYears:readonly number[];readonly boundOfficeClosureDays:readonly{readonly date:string;readonly year:number;readonly sourceRefs:readonly AdministrativeSourceRef[]}[];
 readonly shiftedOfficeClosureDates:readonly string[];
 readonly uncertaintyComparison:null|{readonly boundaryId:'BL-B-FASNACHT';readonly variedDates:readonly string[];readonly withoutOptionalEnd:string;
  readonly withOptionalEnd:string;readonly outcome:'equal'|'different'};
}
