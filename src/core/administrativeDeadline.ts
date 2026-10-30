import {getVerifiedAdministrativeDataV10} from './releaseFormat17';
import {calculateAdministrativeDeadlineV10} from './administrativeDeadlineV10';
import type {AdministrativeCaseQualificationV10,AdministrativeOpeningResolutionV10,AdministrativeCalendarResolutionV10,AdministrativeDurationResolutionV10} from './administrativeTypesV10';
import {getVerifiedAdministrativeDataV9} from './releaseFormat16';
import {calculateAdministrativeDeadlineV9} from './administrativeDeadlineV9';
import type {AdministrativeCaseQualificationV9,AdministrativeOpeningResolutionV9,AdministrativeProceduralCalendarSupplementResolutionV9,AdministrativeDurationResolutionV9} from './administrativeTypesV9';
import {getVerifiedAdministrativeDataV8} from './releaseFormat15';
import {calculateAdministrativeDeadlineV8} from './administrativeDeadlineV8';
import type {AdministrativeOpeningResolutionV8,AdministrativeCalendarResolutionV8,AdministrativeAnnualEndShiftResolutionV8} from './administrativeTypesV8';
import { getVerifiedAdministrativeDataV7 } from './releaseFormat14';
import { calculateAdministrativeDeadlineV7 } from './administrativeDeadlineV7';
import type { AdministrativeOpeningResolutionV7 } from './administrativeTypesV7';
// SPDX-License-Identifier: AGPL-3.0-only
import { parseIsoDate } from './date';
import { countDayDeadline } from './dayDeadlineArithmetic';
import { generateCalendarFromRules } from './generateCalendar';
import { administrativeIntervalContains, administrativePeriodDate } from './administrativeCatalog';
import { getVerifiedAdministrativeContext } from './administrativeContext';
import { getVerifiedAdministrativeDataV6 } from './releaseFormat13';
import { calculateAdministrativeDeadlineV6 } from './administrativeDeadlineV6';
import type { AdministrativeProfileReferenceV6 } from './administrativeTypesV6';
import type { AdministrativeCaseQualification } from './administrativeTypesV2';
import type { AdministrativeCaseQualificationV3, AdministrativeNormSegment } from './administrativeTypesV3';
import type { AdministrativeCaseQualificationV4, AdministrativeQualificationRequirementsV4, AdministrativePathV4 } from './administrativeTypesV4';
import type { AdministrativeCaseQualificationV5, AdministrativeQualificationPolicyV5 } from './administrativeTypesV5';
import type { AdministrativeInterval, AdministrativePath, AdministrativeSourceRef } from './administrativeTypes';
import type { CalendarRuleSet } from './calendarRuleTypes';
import type { Holiday } from './types';

/** Case facts are current facts, never a stored eligibility or calendar capability. */
export interface AdministrativeDeadlineInput {
  readonly selection: {
    readonly kind: 'cantonalAdministrative';
    readonly lawId: string;
    readonly pathId: string;
    readonly revision: number;
    readonly stage: string;
  };
  readonly authoritySeat: {
    readonly canton: string;
    readonly level: 'cantonal';
    readonly qualification: 'competentAuthorityForCurrentAction';
  };
  readonly inputDate: string;
  readonly deadlineDays?: number;
  readonly areaFacts?: Readonly<Record<string,boolean>>;
  readonly qualification: {
    readonly delivery: 'qualifiedActualDelivery' | 'qualifiedTriggerAccordingToOpeningPolicy';
    readonly generalRoute: 'qualified';
    readonly specialLaw: 'excluded' | 'applicableFederalSpecialLaw' | 'unknown';
    readonly explicitHolidayException: 'none' | 'present' | 'unknown';
    readonly fixedEndDate: boolean;
    readonly deviatingStart: boolean;
    readonly evidenceAdvance: boolean;
  };
  readonly urgency: 'none' | 'explicitJudicialUrgencyOrder' | 'unknown';
  readonly caseQualification?: AdministrativeCaseQualification | AdministrativeCaseQualificationV3 | AdministrativeCaseQualificationV4 | AdministrativeCaseQualificationV5 | AdministrativeCaseQualificationV9 | AdministrativeCaseQualificationV10;
}

export interface AdministrativeProvenance {
  readonly kind: 'cantonalAdministrative';
  readonly catalogId: string;
  readonly lawId: string;
  readonly pathId: string;
  readonly revision: number;
  readonly stage: string;
  readonly releaseId: string;
  readonly holidayBindingId: string;
  readonly calendarId: string;
  readonly projectionId: string;
  readonly holidayRole: 'authoritySeat' | 'targetAuthoritySeat' | 'issuingAuthoritySeat' | 'courtSeat' | 'issuingCourtSeat' | 'sameCourtSeat' | 'qualifiedPartyOrRepresentativeCanton';
  readonly authoritySeatCanton: string;
  readonly suspensionProfileId: string;
  readonly suspensionSelectionSha256?: string;
  readonly suspensionProfileSha256?: string;
  readonly permittedSuspensionProfiles?: readonly AdministrativeProfileReferenceV6[];
  readonly openingResolution?: AdministrativeOpeningResolutionV7 | AdministrativeOpeningResolutionV8 | AdministrativeOpeningResolutionV9 | AdministrativeOpeningResolutionV10;
  readonly proceduralCalendarSupplementResolution?: AdministrativeProceduralCalendarSupplementResolutionV9;
  readonly durationPolicySha256?: string;
  readonly durationResolution?: AdministrativeDurationResolutionV9 | AdministrativeDurationResolutionV10;
  readonly calendarResolution?: AdministrativeCalendarResolutionV8 | AdministrativeCalendarResolutionV10;
  readonly annualEndShiftResolution?: AdministrativeAnnualEndShiftResolutionV8;
  readonly suspensionSelectionFact?: {readonly key: string;readonly value: string} | null;
  readonly urgencyApplied: boolean;
  readonly sourceRefs: readonly AdministrativeSourceRef[];
  readonly qualificationPolicySha256?: string;
  /** Only segments actually touched by the current complete calculation. */
  readonly evaluatedNormSegments?: readonly AdministrativeNormSegment[];
}

export type AdministrativeDeadlineResult = {
  readonly outcome: 'blocked';
  readonly blockReasonKeys: readonly string[];
  readonly calendarExportAllowed: false;
  readonly provisionalEnd?: string;
  readonly blockedDate?: string;
  /** Diagnostic ordinary end shift only, never a definitive deadline. */
  readonly ordinaryShiftEnd?: string;
  readonly periodIds?: readonly string[];
  readonly shiftReasonKeys?: readonly string[];
  readonly shiftedHolidayIds?: readonly string[];
  readonly provenance?: AdministrativeProvenance;
  readonly warningKeys?: readonly string[];
} | {
  readonly outcome: 'calculated';
  readonly ordinaryStart: string;
  readonly deadlineStart: string;
  readonly provisionalEnd: string;
  readonly finalEnd: string;
  readonly deadlineDays: number;
  readonly countedDates: readonly string[];
  readonly skippedCalendarDays: number;
  readonly encounteredPeriodIds: readonly string[];
  readonly shiftReasonKeys: readonly string[];
  readonly shiftedHolidayIds: readonly string[];
  readonly startShiftApplied: boolean;
  readonly referenceOnly: boolean;
  /** Descriptive eligibility, not a serializable export capability. */
  readonly calendarExportAllowed: boolean;
  readonly provenance: AdministrativeProvenance;
  readonly warningKeys?: readonly string[];
};

function own(value: object, key: string): boolean { return Object.prototype.hasOwnProperty.call(value, key); }
function closed(value: unknown, required: readonly string[], optional: readonly string[] = []): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && required.every(key => own(value, key))
    && Object.keys(value).every(key => required.includes(key) || optional.includes(key));
}
function validInput(input: AdministrativeDeadlineInput, catalogFormat: string): boolean {
  const withCase = catalogFormat === '2.0.0' || catalogFormat === '3.0.0' || catalogFormat === '4.0.0' || catalogFormat === '5.0.0' || catalogFormat === '6.0.0' || catalogFormat === '7.0.0' || catalogFormat === '8.0.0' || catalogFormat === '9.0.0' || catalogFormat === '10.0.0';
  if (!closed(input, ['selection', 'authoritySeat', 'inputDate', 'qualification', 'urgency'],
    withCase ? ['deadlineDays', 'caseQualification'] : ['deadlineDays'])) return false;
  if (!['4.0.0','5.0.0','6.0.0','7.0.0','8.0.0','9.0.0','10.0.0'].includes(catalogFormat) && own(input, 'caseQualification') && !closed(input.caseQualification,
    ['action', 'decisionKind', 'unit', 'direction', 'opening', 'notice', 'termChange',
      ...(catalogFormat === '3.0.0' && !!input.caseQualification && own(input.caseQualification, 'targetBody')
        ? ['targetBody', 'procedureMatter', 'channelCase', 'exceptionNotice'] : [])])) return false;
  const selection = input.selection;
  if (!closed(selection, ['kind', 'lawId', 'pathId', 'revision', 'stage'])
    || selection.kind !== 'cantonalAdministrative'
    || (['lawId', 'pathId', 'stage'] as const).some(key => typeof selection[key] !== 'string' || !selection[key])
    || !Number.isInteger(selection.revision) || selection.revision < 1) return false;
  const seat = input.authoritySeat;
  if (!closed(seat, ['canton', 'level', 'qualification']) || typeof seat.canton !== 'string'
    || seat.level !== 'cantonal' || seat.qualification !== 'competentAuthorityForCurrentAction') return false;
  const q = input.qualification;
  if (!closed(q, ['delivery', 'generalRoute', 'specialLaw', 'explicitHolidayException', 'fixedEndDate', 'deviatingStart', 'evidenceAdvance'])
    || q.delivery !== 'qualifiedActualDelivery' || q.generalRoute !== 'qualified'
    || !['excluded', 'applicableFederalSpecialLaw', 'unknown'].includes(q.specialLaw)
    || !['none', 'present', 'unknown'].includes(q.explicitHolidayException)
    || [q.fixedEndDate, q.deviatingStart, q.evidenceAdvance].some(value => typeof value !== 'boolean')) return false;
  return typeof input.inputDate === 'string' && !!parseIsoDate(input.inputDate)
    && ['none', 'explicitJudicialUrgencyOrder', 'unknown'].includes(input.urgency)
    && (!own(input, 'deadlineDays') || (typeof input.deadlineDays === 'number' && Number.isInteger(input.deadlineDays)
      && input.deadlineDays >= 1 && input.deadlineDays <= 365));
}
function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(child => freeze(child));
    Object.freeze(value);
  }
  return value;
}
function blocked(reason: string): AdministrativeDeadlineResult {
  return freeze({outcome: 'blocked', blockReasonKeys: [reason], calendarExportAllowed: false});
}
/** New current facts are required only where the selected V4 policy needs them. */
function qualificationV5(facts:unknown,policy:AdministrativeQualificationPolicyV5):string|undefined {
  if(!facts||typeof facts!=='object'||![Object.prototype,null].includes(Object.getPrototypeOf(facts)))return 'administrative.inputContractInvalid';
  for(const descriptor of Object.values(Object.getOwnPropertyDescriptors(facts)))if(!('value' in descriptor))return 'administrative.inputContractInvalid';
  const required=policy.requirements.map(r=>r.key);
  if(policy.openingChainPolicy==='requireOriginalOrTimelyRequestedReasons')required.push('openingOrigin');
  if(facts&&typeof facts==='object'&&'openingOrigin' in facts&&facts.openingOrigin==='reasonedFollowingTimelyRequest')required.push('priorReasonsRequest');
  if(!closed(facts,required))return 'administrative.inputContractInvalid';
  for(const r of policy.requirements)if(facts[r.key]!==r.value)return 'administrative.'+r.reason;
  if(policy.openingChainPolicy==='requireOriginalOrTimelyRequestedReasons'){
    if(facts.openingOrigin!=='originalReasoned'&&facts.openingOrigin!=='reasonedFollowingTimelyRequest')return 'administrative.openingOriginNotQualified';
    if(facts.openingOrigin==='reasonedFollowingTimelyRequest'&&facts.priorReasonsRequest!=='timelyEstablished')return 'administrative.priorReasonsRequestNotEstablished';
  }
  return undefined;
}
function qualificationV4(facts: unknown, r: AdministrativeQualificationRequirementsV4): string | undefined {
  const required = ['action','opening','holidayAnchor','materialPerformance','unit','direction','notice','termChange','suspensionContext','serviceContext'];
  if (r.requiredTargetCourt !== 'notApplicable') required.push('targetCourt');
  if (r.requiredSameIssuingCourt) required.push('sameIssuingCourt');
  if (r.openingChainPolicy === 'requireOriginalOrTimelyRequestedReasons') required.push('openingOrigin');
  if (r.coordinationPolicy === 'excludeCoordinatedAppeal') required.push('coordinatedDecision');
  if (r.localHolidayPolicy === 'blockConcreteUnresolvedAdditionalEndEffect') required.push('localHolidayEffect');
  if (r.specialOpeningPolicy === 'ordinaryEffectiveUROpening') required.push('urOpeningConsequence');
  if (r.shorteningPolicy === 'noShortenedSHRekurs') required.push('shortenedRekurs');
  if (facts && typeof facts === 'object' && 'openingOrigin' in facts && facts.openingOrigin === 'reasonedFollowingRequest'
    && r.openingChainPolicy === 'requireOriginalOrTimelyRequestedReasons') required.push('priorReasonsRequest');
  if (!closed(facts,required)) return 'administrative.inputContractInvalid';
  if (facts.action !== r.action) return 'administrative.actionMismatch';
  if (facts.opening !== r.opening) return 'administrative.openingNotQualified';
  if (facts.holidayAnchor !== r.holidayAnchor) return 'administrative.holidayRoleNotQualified';
  if (facts.materialPerformance !== false) return 'administrative.materialPerformanceOutsideScope';
  if (facts.direction !== r.direction || facts.unit !== r.unit) return 'administrative.unsupportedProcedure';
  if (facts.notice !== r.notice) return 'administrative.noticeNotQualified';
  if (facts.termChange !== r.termChange) return 'administrative.termChanged';
  if (facts.suspensionContext !== r.suspensionContext) return 'administrative.suspensionExceptionUnresolved';
  if (facts.serviceContext !== r.serviceContext) return 'administrative.serviceContextUnresolved';
  if (r.requiredTargetCourt !== 'notApplicable' && facts.targetCourt !== r.requiredTargetCourt) return 'administrative.targetCourtNotQualified';
  if (r.requiredSameIssuingCourt && facts.sameIssuingCourt !== true) return 'administrative.courtReasonsWrongRecipient';
  if (r.openingChainPolicy === 'requireOriginalOrTimelyRequestedReasons') {
    if (facts.openingOrigin !== 'originalReasoned' && facts.openingOrigin !== 'reasonedFollowingRequest') return 'administrative.openingOriginNotQualified';
    if (facts.openingOrigin === 'reasonedFollowingRequest' && facts.priorReasonsRequest !== 'timelyEstablished') return 'administrative.priorReasonsRequestNotEstablished';
  }
  if (r.coordinationPolicy === 'excludeCoordinatedAppeal' && facts.coordinatedDecision !== false) return 'administrative.urCoordinatedPeriodUnresolved';
  if (r.localHolidayPolicy === 'blockConcreteUnresolvedAdditionalEndEffect' && facts.localHolidayEffect !== 'noAdditionalRelevantLocalHoliday') return 'administrative.urLocalHolidayEffectUnresolved';
  if (r.specialOpeningPolicy === 'ordinaryEffectiveUROpening' && facts.urOpeningConsequence !== 'ordinaryEffectiveOpening') return 'administrative.urOpeningSpecialConsequenceUnresolved';
  if (r.shorteningPolicy === 'noShortenedSHRekurs' && facts.shortenedRekurs !== false) return 'administrative.shShortenedRekursUnresolved';
  return undefined;
}
function uniqueRefs(refs: readonly AdministrativeSourceRef[]): readonly AdministrativeSourceRef[] {
  return refs.filter((ref, index) => refs.findIndex(other => other.sourceId === ref.sourceId && other.locator === ref.locator) === index);
}
function duration(path: Pick<AdministrativePath, 'duration'>, input: AdministrativeDeadlineInput): number | undefined {
  if (path.duration.kind === 'statutoryDays') {
    return own(input, 'deadlineDays') && input.deadlineDays !== path.duration.value ? undefined : path.duration.value;
  }
  return typeof input.deadlineDays === 'number' && input.deadlineDays >= path.duration.minimum
    && input.deadlineDays <= path.duration.maximum ? input.deadlineDays : undefined;
}
function intersection(intervals: readonly AdministrativeInterval[]): {from: string; to: string} | undefined {
  const from = intervals.map(interval => interval.from).sort().at(-1)!;
  const to = intervals.flatMap(interval => interval.to === null ? [] : [interval.to]).sort()[0];
  return to && from <= to ? {from, to} : undefined;
}
function calendarDependencies(calendars: readonly CalendarRuleSet[], calendarId: string): readonly CalendarRuleSet[] {
  const seen = new Set<string>();
  const result: CalendarRuleSet[] = [];
  function collect(id: string): void {
    if (seen.has(id)) return;
    seen.add(id);
    const calendar = calendars.find(candidate => candidate.calendarId === id);
    if (!calendar) throw new Error('Missing bound calendar dependency');
    result.push(calendar);
    calendar.inherits.forEach(collect);
  }
  collect(calendarId);
  return result;
}

/**
 * The plan is private and synchronously derived from an identity-checked reader
 * result. Neither a UI calendar map nor a serialized approved flag is accepted.
 * Calendar-3 holidays supply physical dates only. The catalogue supplies their
 * independent legal binding and its own suspension rules.
 */
export function calculateAdministrativeDeadline(input: AdministrativeDeadlineInput, context: unknown): AdministrativeDeadlineResult {
  try {
    const nativeV10=getVerifiedAdministrativeDataV10(context);
    if(nativeV10){
      if(!input||typeof input!=='object'||Reflect.ownKeys(input).some(key=>typeof key!=='string'||!Object.getOwnPropertyDescriptor(input,key)!.enumerable||!('value'in Object.getOwnPropertyDescriptor(input,key)!)))return blocked('administrative.inputContractInvalid');
      const selected=input.selection;
      if(!selected||typeof selected!=='object'||Reflect.ownKeys(selected).some(key=>typeof key!=='string'||!Object.getOwnPropertyDescriptor(selected,key)!.enumerable||!('value'in Object.getOwnPropertyDescriptor(selected,key)!)))return blocked('administrative.inputContractInvalid');
      const path=nativeV10.catalog.paths.find(row=>row.pathId===selected.pathId);
      if(!path||'suspensionSelection'in path)return calculateAdministrativeDeadlineV10(input,context);
    }
    const nativeV9=getVerifiedAdministrativeDataV9(context);
    if(nativeV9){
      if(!input||typeof input!=='object'||Reflect.ownKeys(input).some(key=>typeof key!=='string'||!('value'in Object.getOwnPropertyDescriptor(input,key)!)))return blocked('administrative.inputContractInvalid');
      const selected=input.selection;
      if(!selected||typeof selected!=='object'||Reflect.ownKeys(selected).some(key=>typeof key!=='string'||!('value'in Object.getOwnPropertyDescriptor(selected,key)!)))return blocked('administrative.inputContractInvalid');
      const path=nativeV9.catalog.paths.find(row=>row.pathId===selected.pathId);
      if(!path||'suspensionSelection'in path)return calculateAdministrativeDeadlineV9(input,context);
    }
    const nativeV8=getVerifiedAdministrativeDataV8(context);
    if(nativeV8){
      if(!input||typeof input!=='object'||Reflect.ownKeys(input).some(key=>typeof key!=='string'||!('value'in Object.getOwnPropertyDescriptor(input,key)!)))return blocked('administrative.inputContractInvalid');
      const selected=input.selection;
      if(!selected||typeof selected!=='object'||Reflect.ownKeys(selected).some(key=>typeof key!=='string'||!('value'in Object.getOwnPropertyDescriptor(selected,key)!)))return blocked('administrative.inputContractInvalid');
      const path=nativeV8.catalog.paths.find(row=>row.pathId===selected.pathId);
      if(!path||'suspensionSelection'in path)return calculateAdministrativeDeadlineV8(input,context);
    }
    const nativeV7 = getVerifiedAdministrativeDataV7(context);
    if(nativeV7){
      if(!input||typeof input!=='object'||Reflect.ownKeys(input).some(key=>typeof key!=='string'||!('value'in Object.getOwnPropertyDescriptor(input,key)!)))return blocked('administrative.inputContractInvalid');
      const selected=input.selection;
      if(!selected||typeof selected!=='object'||Reflect.ownKeys(selected).some(key=>typeof key!=='string'||!('value'in Object.getOwnPropertyDescriptor(selected,key)!)))return blocked('administrative.inputContractInvalid');
      const candidate=nativeV7.catalog.paths.find(row=>row.pathId===selected.pathId);
      if(!candidate||'suspensionSelection'in candidate)return calculateAdministrativeDeadlineV7(input,context);
    }
    const nativeV6 = getVerifiedAdministrativeDataV6(context);
    if (nativeV6) {
      if (!input || typeof input !== 'object' || Object.values(Object.getOwnPropertyDescriptors(input)).some(d=>!('value' in d))) return blocked('administrative.inputContractInvalid');
      const selected = input.selection;
      if (!selected || typeof selected !== 'object' || Object.values(Object.getOwnPropertyDescriptors(selected)).some(d=>!('value' in d))) return blocked('administrative.inputContractInvalid');
      const candidate = nativeV6.catalog.paths.find(row=>row.pathId===selected.pathId);
      if (!candidate || 'suspensionSelection' in candidate) return calculateAdministrativeDeadlineV6(input,context);
    }
    const data = getVerifiedAdministrativeContext(context);
    if (!data) return blocked('administrative.untrustedRelease');
    if (!validInput(input, data.catalog.formatVersion)) return blocked('administrative.inputContractInvalid');
    const q = input.qualification;
    if (q.specialLaw === 'applicableFederalSpecialLaw') return blocked('administrative.separatelyQualifiedFederalPathRequired');
    if (q.specialLaw !== 'excluded') return blocked('administrative.specialLawUnresolved');
    if (q.explicitHolidayException !== 'none') return blocked('administrative.explicitHolidayExceptionUnresolved');
    if (q.fixedEndDate || q.deviatingStart || q.evidenceAdvance) return blocked('administrative.unsupportedProcedure');
    const {catalog} = data;
    const selection = input.selection;
    const path = catalog.paths.find(candidate => candidate.pathId === selection.pathId && candidate.lawId === selection.lawId
      && candidate.revision === selection.revision);
    if (!path) return blocked('administrative.unknownPath');
    if ('suspensionSelection' in path) return blocked('administrative.dataContractInvalid');
    if (!path.stages.some(stage => stage === selection.stage)) return blocked('administrative.stageMismatch');
    const policy = catalog.formatVersion === '2.0.0' || catalog.formatVersion === '3.0.0' || catalog.formatVersion === '4.0.0' || catalog.formatVersion === '5.0.0' || catalog.formatVersion === '6.0.0' || catalog.formatVersion === '7.0.0' || catalog.formatVersion === '8.0.0' || catalog.formatVersion === '9.0.0' || catalog.formatVersion === '10.0.0'
      ? catalog.qualificationPolicies.find(candidate => candidate.pathId === path.pathId && candidate.pathRevision === path.revision)
      : undefined;
    if (catalog.formatVersion === '2.0.0' || catalog.formatVersion === '3.0.0' || catalog.formatVersion === '4.0.0' || catalog.formatVersion === '5.0.0' || catalog.formatVersion === '6.0.0' || catalog.formatVersion === '8.0.0' || catalog.formatVersion === '9.0.0' || catalog.formatVersion === '10.0.0') {
      if (!policy) return blocked('administrative.qualificationPolicyMissing');
      if (policy.mode === 'qualifiedDayProcedureV6' || policy.mode === 'qualifiedDayProcedureV7' || policy.mode === 'qualifiedDayProcedureV8' || policy.mode === 'qualifiedDayProcedureV9' || policy.mode === 'qualifiedDayProcedureV10') return blocked('administrative.dataContractInvalid');
      if (policy.mode === 'legacyV1') {
        // Preserve the historical case contract. Do not ignore new, conflicting
        // assertions attached to an old route.
        if (own(input, 'caseQualification')) return blocked('administrative.inputContractInvalid');
      } else if (policy.mode === 'qualifiedDayProcedureV5') {
        if (!input.caseQualification) return blocked('administrative.caseQualificationRequired');
        const reason=qualificationV5(input.caseQualification,policy);if(reason)return blocked(reason);
        if(input.urgency!=='none')return blocked('administrative.unsupportedUrgency');
      } else if (policy.mode === 'qualifiedDayProcedureV4') {
        if (!input.caseQualification) return blocked('administrative.caseQualificationRequired');
        const reason = qualificationV4(input.caseQualification,policy.requirements);
        if (reason) return blocked(reason);
        if (input.urgency !== 'none') return blocked('administrative.unsupportedUrgency');
      } else {
        const facts = input.caseQualification as AdministrativeCaseQualification | AdministrativeCaseQualificationV3 | undefined, required = policy.requirements;
        if (!facts) return blocked('administrative.caseQualificationRequired');
        if (policy.mode === 'qualifiedDayProcedure' && !closed(facts,
          ['action', 'decisionKind', 'unit', 'direction', 'opening', 'notice', 'termChange'])) return blocked('administrative.inputContractInvalid');
        if (facts.direction !== 'forward' || facts.unit !== required.unit) return blocked('administrative.unsupportedProcedure');
        if (facts.action !== required.action) return blocked('administrative.actionMismatch');
        if (facts.decisionKind !== required.decisionKind) return blocked('administrative.decisionNotQualified');
        if (facts.opening !== required.opening) return blocked('administrative.openingNotQualified');
        if (facts.notice !== required.notice) return blocked('administrative.noticeNotQualified');
        if (facts.termChange !== required.termChange) return blocked('administrative.termChanged');
        if (input.urgency !== required.urgency) return blocked('administrative.unsupportedUrgency');
        if (policy.mode === 'qualifiedDayProcedureV3') {
          if (!closed(facts, ['action', 'decisionKind', 'unit', 'direction', 'opening', 'notice', 'termChange',
            'targetBody', 'procedureMatter', 'channelCase', 'exceptionNotice'])) return blocked('administrative.inputContractInvalid');
          const expected = policy.requirements;
          if (facts.targetBody !== expected.targetBody) return blocked('administrative.targetBodyMismatch');
          if (facts.procedureMatter !== expected.procedureMatter) return blocked('administrative.matterNotQualified');
          if (facts.channelCase !== expected.channelCase) return blocked('administrative.channelCaseNotQualified');
          if (facts.exceptionNotice !== expected.exceptionNotice) return blocked('administrative.exceptionNoticeNotQualified');
        }
      }
    }
    const law = catalog.laws.find(candidate => candidate.lawId === path.lawId)!;
    const binding = catalog.holidayBindings.find(candidate => candidate.holidayBindingId === path.holidayBindingId)!;
    if(binding && 'physicalSource'in binding)return blocked('administrative.dataContractInvalid');
    if (law.canton !== input.authoritySeat.canton || binding.authoritySeatCanton !== input.authoritySeat.canton) return blocked('administrative.authoritySeatMismatch');
    const days = duration(path, input);
    if (days === undefined) return blocked('administrative.durationMismatch');
    const urgent = input.urgency === 'explicitJudicialUrgencyOrder';
    if (input.urgency === 'unknown') return blocked('administrative.urgencyUnresolved');
    if (urgent && (path.urgencyPolicy !== 'explicitGRJudicialUrgencyOrder' || selection.stage !== 'court')) return blocked('administrative.unsupportedUrgency');
    const eligibility = catalog.releaseBinding.pathEligibility.find(candidate => candidate.pathId === path.pathId
      && candidate.pathRevision === path.revision && candidate.status === (data.referenceOnly ? 'candidate' : 'approved'));
    if (!eligibility) return blocked('administrative.pathNotReleased');
    const temporal = path.temporalBinding;
    if (![temporal.caseCoverage, eligibility.caseCoverage].every(interval => administrativeIntervalContains(interval, input.inputDate))) return blocked('administrative.outsideCaseCoverage');
    const calendars = calendarDependencies(data.calendars, binding.physicalBaseline.calendarId);
    const normTimeline = 'normTimeline' in path ? path.normTimeline : undefined;
    const normCoverage = normTimeline ? {from: normTimeline[0]!.interval.from, to: normTimeline.at(-1)!.interval.to}
      : 'normVersionCoverage' in temporal ? temporal.normVersionCoverage : undefined;
    if (!normCoverage) return blocked('administrative.dataContractInvalid');
    const intervals = [data.coverage, temporal.calculationCoverage, temporal.sourceCoverage, normCoverage,
      eligibility.calculationCoverage, ...calendars.map(calendar => calendar.validity)];
    const touchedNorms = new Set<AdministrativeNormSegment>();
    const covered = (date: string): boolean => {
      if (!intervals.every(interval => administrativeIntervalContains(interval, date))) return false;
      if (normTimeline) {
        const segments = normTimeline.filter(segment => administrativeIntervalContains(segment.interval, date));
        if (segments.length !== 1) return false;
        touchedNorms.add(segments[0]!);
      }
      return true;
    };
    const range = intersection(intervals);
    if (!range || !covered(input.inputDate)) return blocked('dataCoverageExceeded');
    const generated = generateCalendarFromRules(calendars, binding.physicalBaseline.calendarId, range);
    const holidays = new Map<string, Holiday[]>();
    generated.calendar.holidays.forEach(holiday => holidays.set(holiday.date, [...(holidays.get(holiday.date) ?? []), holiday]));
    const suspension = catalog.suspensionProfiles.find(profile => profile.suspensionProfileId === path.suspensionProfileId)!;
    const periods: {periodId: string; startsOn: string; endsOn: string}[] = [];
    if (!urgent) {
      for (let year = Number(range.from.slice(0, 4)) - 1; year <= Number(range.to.slice(0, 4)); year += 1) {
        for (const period of suspension.periods) periods.push({periodId: `${period.periodId}-${year}`,
          startsOn: administrativePeriodDate(period.start, year), endsOn: administrativePeriodDate(period.end, year)});
      }
    }
    const provenanceBase: Omit<AdministrativeProvenance, 'sourceRefs' | 'evaluatedNormSegments'> = {
      kind: 'cantonalAdministrative', catalogId: catalog.catalogId, lawId: path.lawId,
      pathId: path.pathId, revision: path.revision, stage: selection.stage, releaseId: data.releaseId,
      holidayBindingId: binding.holidayBindingId, calendarId: binding.physicalBaseline.calendarId,
      projectionId: binding.physicalBaseline.projectionId,
      holidayRole: policy?.mode === 'qualifiedDayProcedureV5' ? String(policy.requirements.find(r=>r.key==='holidayAnchor')?.value??'authoritySeat') as AdministrativeProvenance['holidayRole'] : policy?.mode === 'qualifiedDayProcedureV4' ? policy.requirements.holidayAnchor : 'authoritySeat', authoritySeatCanton: law.canton,
      suspensionProfileId: suspension.suspensionProfileId, urgencyApplied: urgent,
      ...('qualificationPolicySha256' in eligibility && typeof eligibility.qualificationPolicySha256 === 'string'
        ? { qualificationPolicySha256: eligibility.qualificationPolicySha256 } : {}),
    };
    const result = countDayDeadline({legallyRelevantDate: input.inputDate, deadlineDays: days, periods,
      shiftStartDuringSuspension: true, holidaysByDate: holidays,
      isCovered: covered,
      blockEndShiftIntoSuspension: path.endShiftGuard === 'blockWhenEnteringApplicableSuspension' && !urgent});
    const evaluatedNormSegments = normTimeline?.filter(segment => touchedNorms.has(segment));
    const timelineSources = new Set(normTimeline?.flatMap(segment => segment.sourceRefs.map(ref => ref.sourceId)) ?? []);
    const applicablePathRefs = normTimeline ? path.sourceRefs.filter(ref => !timelineSources.has(ref.sourceId)) : path.sourceRefs;
    const applicableNormSources=new Set(evaluatedNormSegments?.flatMap(segment=>segment.sourceRefs.map(ref=>ref.sourceId))??[]);
    const provenance: AdministrativeProvenance = {
      ...provenanceBase,
      sourceRefs: uniqueRefs([...law.sourceRefs, ...applicablePathRefs, ...binding.legalBinding.sourceRefs,
        ...suspension.sourceRefs, ...(evaluatedNormSegments?.flatMap(segment => segment.sourceRefs) ?? [])])
        .filter(ref=>policy?.mode!=='qualifiedDayProcedureV5'||!timelineSources.has(ref.sourceId)||applicableNormSources.has(ref.sourceId)),
      ...(evaluatedNormSegments ? {evaluatedNormSegments} : {})
    };
    if (result.outcome === 'blocked') {
      const {reason, outcome, ...trace} = result;
      const diagnostic=policy?.mode==='qualifiedDayProcedureV5'&&reason==='endShiftIntoSuspensionUnresolved'
        ? countDayDeadline({legallyRelevantDate:input.inputDate,deadlineDays:days,periods,shiftStartDuringSuspension:true,holidaysByDate:holidays,isCovered:covered,blockEndShiftIntoSuspension:false}) : undefined;
      return freeze({outcome, ...trace, ...(diagnostic?.outcome==='calculated'?{ordinaryShiftEnd:diagnostic.finalEnd}:{}), blockReasonKeys: [reason], calendarExportAllowed: false, provenance});
    }
    const warningKeys = policy?.mode === 'qualifiedDayProcedureV4' ? (path as AdministrativePathV4).openingWarnings.flatMap(warning => {
      const year = Number(input.inputDate.slice(0,4));
      const inOpeningRestriction = [year-1,year].some(y => warning.periods.some(period =>
        administrativeIntervalContains({from:administrativePeriodDate(period.start,y),to:administrativePeriodDate(period.end,y)},input.inputDate)));
      return inOpeningRestriction ? ['administrative.urArt22OpeningRestriction'] : [];
    }) : undefined;
    return freeze({...result, deadlineDays: days, referenceOnly: data.referenceOnly,
      calendarExportAllowed: !data.referenceOnly, provenance, ...(warningKeys ? {warningKeys} : {})});
  } catch {
    return blocked('administrative.dataContractInvalid');
  }
}
