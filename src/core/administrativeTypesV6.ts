// SPDX-License-Identifier: AGPL-3.0-only
// DEC-2026-038. Current facts and data descriptions are not capabilities.
import type {AdministrativeDuration} from './administrativeTypes';
import type {AdministrativePathEligibilityV2} from './administrativeTypesV2';
import type {AdministrativeHolidayBindingV4} from './administrativeTypesV4';
import type {AdministrativePathV5,AdministrativeProcedureCatalogV5} from './administrativeTypesV5';
export type AdministrativeFactV6 = string | number | boolean;
export type AdministrativeRequirementV6 = {readonly key:string;readonly reason:string;readonly explanation?:string} & (
  {readonly value:AdministrativeFactV6;readonly oneOf?:never} |
  {readonly oneOf:readonly AdministrativeFactV6[];readonly value?:never});
export interface AdministrativeConcretisedStatutoryDuration {
  readonly kind:'concretisedStatutoryDays';readonly minimum:number;readonly maximum:number;readonly overridable:false;
  readonly confirmationFact:'shorteningEstablished'|'concreteShortenedDurationQualified';readonly legalNature:'statutoryNotExtendable';
}
export type AdministrativeSuspensionSelectionV6 =
  {readonly kind:'fixed';readonly suspensionProfileId:string} |
  {readonly kind:'currentFact';readonly factKey:'exceptionNotice';readonly cases:readonly {readonly value:'given'|'absent';readonly suspensionProfileId:string}[];readonly otherwise:'block'};
export interface AdministrativeProfileReferenceV6 {readonly suspensionProfileId:string;readonly sha256:string}
export interface AdministrativePathV6 extends Omit<AdministrativePathV5,'contractFamily'|'duration'|'suspensionProfileId'> {
  readonly contractFamily:'qualifiedDayProcedureV6';readonly duration:AdministrativeDuration|AdministrativeConcretisedStatutoryDuration;
  readonly suspensionSelection:AdministrativeSuspensionSelectionV6;
}
export interface AdministrativeQualificationPolicyV6 {
  readonly pathId:string;readonly pathRevision:number;readonly pathSha256:string;readonly mode:'qualifiedDayProcedureV6';
  readonly requirements:readonly AdministrativeRequirementV6[];readonly openingChainPolicy:'notApplicable';readonly localHolidayPolicy:'notApplicable';
}
export interface AdministrativePathEligibilityV6 extends Omit<AdministrativePathEligibilityV2,'suspensionProfileId'|'suspensionProfileSha256'> {
  readonly suspensionSelectionSha256:string;readonly suspensionProfiles:readonly AdministrativeProfileReferenceV6[];
}
export interface AdministrativeHolidayBindingV6 extends Omit<AdministrativeHolidayBindingV4,'bindingVersion'> {readonly bindingVersion:'6.0.0'}
export interface AdministrativeProcedureCatalogV6 extends Omit<AdministrativeProcedureCatalogV5,
  'formatVersion'|'contractDecision'|'paths'|'qualificationPolicies'|'holidayBindings'|'releaseBinding'> {
  readonly formatVersion:'6.0.0';
  readonly contractDecision:{readonly id:'DEC-2026-038';readonly status:'proposed'|'approved'|'withdrawn';readonly on:string|null};
  readonly paths:readonly (AdministrativeProcedureCatalogV5['paths'][number]|AdministrativePathV6)[];
  readonly qualificationPolicies:readonly (AdministrativeProcedureCatalogV5['qualificationPolicies'][number]|AdministrativeQualificationPolicyV6)[];
  readonly holidayBindings:readonly (AdministrativeProcedureCatalogV5['holidayBindings'][number]|AdministrativeHolidayBindingV6)[];
  readonly releaseBinding:Omit<AdministrativeProcedureCatalogV5['releaseBinding'],'pathEligibility'> & {
    readonly pathEligibility:readonly (AdministrativeProcedureCatalogV5['releaseBinding']['pathEligibility'][number]|AdministrativePathEligibilityV6)[]};
}
export interface AdministrativeCaseQualificationV6 {readonly [key:string]:AdministrativeFactV6|undefined}
