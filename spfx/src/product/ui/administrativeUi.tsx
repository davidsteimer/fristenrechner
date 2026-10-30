// SPDX-License-Identifier: AGPL-3.0-only
import * as React from 'react';
import { PrimaryButton, Dropdown, MessageBar, MessageBarType, TextField } from '@fluentui/react';
import { parseIsoDate } from '../core/date';
import { administrativePeriodDate } from '../core/administrativeCatalog';
import { generateCalendarFromRules } from '../core/generateCalendar';
import { getVerifiedAdministrativeContext } from '../core/administrativeContext';
import type { AdministrativeDeadlineInput, AdministrativeDeadlineResult } from '../core/administrativeDeadline';
import type { AdministrativeProcedureCatalog, AdministrativeProcedureCatalogV2, AdministrativeSourceRef, AdministrativeStage } from '../core/administrativeTypes';
import type { AdministrativeProcedureCatalogV3 } from '../core/administrativeTypesV3';
import type { AdministrativeProcedureCatalogV4, AdministrativePathV4 } from '../core/administrativeTypesV4';
import type { AdministrativeProcedureCatalogV5 } from '../core/administrativeTypesV5';
import type { AdministrativeProcedureCatalogV6, AdministrativePathV6 } from '../core/administrativeTypesV6';
import type { AdministrativeProcedureCatalogV7, AdministrativePathV7 } from '../core/administrativeTypesV7';
import type { AdministrativeProcedureCatalogV8, AdministrativePathV8 } from '../core/administrativeTypesV8';
import type { AdministrativeProcedureCatalogV9, AdministrativePathV9 } from '../core/administrativeTypesV9';
import type { AdministrativeProcedureCatalogV10, AdministrativePathV10 } from '../core/administrativeTypesV10';
import { resolveAdministrativeSuspensionV6 } from '../core/administrativeDeadlineV6';
import { resolveAdministrativeSuspensionV7 } from '../core/administrativeDeadlineV7';
import { resolveAdministrativeCalendarV8, resolveAdministrativeSuspensionV8 } from '../core/administrativeDeadlineV8';
import { resolveAdministrativeCalendarV9, resolveAdministrativeSuspensionV9 } from '../core/administrativeDeadlineV9';
import { resolveAdministrativeCalendarV10, resolveAdministrativeSuspensionV10 } from '../core/administrativeDeadlineV10';
import { calculatorDropdownStyles } from './dropdownStyles';
import { administrativeText } from './administrativeMessages';
import { administrativeExportAvailable } from './administrativeExport';
import type { Locale } from './i18n';
import { translate } from './i18n';
import { calendarCantonLabel, calendarText, calendarReason } from './calendarMessages';
import { ap23k3NormLocator, ap23k3SourceName } from './ap23k3Messages';
import { ap23l3NormLocator, ap23l3SourceName } from './ap23l3Messages';
import { ap23m3NormLocator, ap23m3SourceName } from './ap23m3Messages';
import { TechnicalTraceDetails } from './tracePresentation';

export interface AdministrativeUiState {
  readonly stage: string;
  readonly pathId: string;
  readonly qualification: '' | 'generalActualReceipt' | 'reasonedFollowingTimelyRequest' | 'specialOrDeviating' | 'unknown';
  readonly urgency: '' | 'none' | 'explicitJudicialUrgencyOrder' | 'unknown';
  /** Explicit current alternatives only. This field is never a preference. */
  readonly currentValues?: Readonly<Record<string, string>>;
  /** One already legally qualified current place, not a role inference or preference. */
  readonly legalAnchorCanton?: string;
  readonly areaFacts?: Readonly<Record<string, boolean>>;
}
export const EMPTY_ADMINISTRATIVE_UI_STATE: AdministrativeUiState = Object.freeze({ stage: '', pathId: '', qualification: '', urgency: '' });
export type AdministrativeUiCatalog = AdministrativeProcedureCatalog | AdministrativeProcedureCatalogV2 | AdministrativeProcedureCatalogV3 | AdministrativeProcedureCatalogV4 | AdministrativeProcedureCatalogV5 | AdministrativeProcedureCatalogV6 | AdministrativeProcedureCatalogV7 | AdministrativeProcedureCatalogV8 | AdministrativeProcedureCatalogV9 | AdministrativeProcedureCatalogV10;
export type AdministrativeUiPath = AdministrativeUiCatalog['paths'][number];
function isV6Path(path: AdministrativeUiPath | undefined): path is AdministrativePathV6 {
  return !!path && 'contractFamily' in path && path.contractFamily === 'qualifiedDayProcedureV6';
}
function isV7Path(path: AdministrativeUiPath | undefined): path is AdministrativePathV7 {
  return !!path && 'contractFamily' in path && path.contractFamily === 'qualifiedDayProcedureV7';
}
function isV8Path(path: AdministrativeUiPath | undefined): path is AdministrativePathV8 {
  return !!path && 'contractFamily' in path && path.contractFamily === 'qualifiedDayProcedureV8';
}
function isV9Path(path: AdministrativeUiPath | undefined): path is AdministrativePathV9 {
  return !!path && 'contractFamily' in path && path.contractFamily === 'qualifiedDayProcedureV9';
}
function isV10Path(path: AdministrativeUiPath | undefined): path is AdministrativePathV10 {
  return !!path && 'contractFamily' in path && path.contractFamily === 'qualifiedDayProcedureV10';
}
/** A fixed qualified trigger also has a meaning, even without a mode dropdown. */
export function administrativeDateMeaning(path: AdministrativeUiPath | undefined, state: AdministrativeUiState): string | undefined {
  if (!isV9Path(path) && !isV10Path(path)) return undefined;
  if (path.openingPolicy.kind === 'qualifiedCurrentTrigger') return 'qualifiedLegalOpening';
  const mode = state.currentValues?.openingMode;
  return mode === 'qualifiedLegalOpening' || isV9Path(path) && mode === 'trackingPhysicalReceipt'
    || isV10Path(path) && mode === 'vdUnsignedPostalReceipt' ? mode : undefined;
}

/** Only a current, explicit case choice may confirm the bound path requirements. */
function qualificationPolicy(catalog: AdministrativeUiCatalog, path?: AdministrativeUiPath) {
  return (catalog.formatVersion === '2.0.0' || catalog.formatVersion === '3.0.0' || catalog.formatVersion === '4.0.0' || catalog.formatVersion === '5.0.0' || catalog.formatVersion === '6.0.0' || catalog.formatVersion === '7.0.0' || catalog.formatVersion === '8.0.0' || catalog.formatVersion === '9.0.0' || catalog.formatVersion === '10.0.0') && path
    ? catalog.qualificationPolicies.find(policy => policy.pathId === path.pathId && policy.pathRevision === path.revision)
    : undefined;
}

function holidayRoleKey(catalog: AdministrativeUiCatalog, path?: AdministrativeUiPath): string {
  const policy = qualificationPolicy(catalog, path);
  const role = policy?.mode === 'qualifiedDayProcedureV5'
    ? policy.requirements.find(requirement => requirement.key === 'holidayAnchor')?.value
    : policy?.mode === 'qualifiedDayProcedureV4' ? policy.requirements.holidayAnchor : undefined;
  return typeof role === 'string' ? `holiday.role.${role}` : 'authority';
}

export function administrativeQualificationPresentation(catalog: AdministrativeUiCatalog, path?: AdministrativeUiPath, state?: AdministrativeUiState) {
  const policy = qualificationPolicy(catalog, path);
  if (!path && catalog.formatVersion === '10.0.0') return { choiceKey: 'generalActualReceipt', scopeKey: 'scope.v10.unselected' };
  if (!path && catalog.formatVersion === '8.0.0') return { choiceKey: 'generalActualReceipt', scopeKey: 'scope.v8.unselected' };
  if (!path && catalog.formatVersion === '9.0.0') return { choiceKey: 'generalActualReceipt', scopeKey: 'scope.v9.unselected' };
  if (policy?.mode === 'qualifiedDayProcedureV10' && path) {
    const raw = isV10Path(path) && path.openingPolicy.kind === 'vdQualifiedOrUnsignedPost' && state?.currentValues?.openingMode === 'vdUnsignedPostalReceipt';
    return { choiceKey: `case.v10.${path.pathId}${raw ? '.raw' : ''}`, scopeKey: `scope.v10.${path.pathId}` };
  }
  if (policy?.mode === 'qualifiedDayProcedureV9' && path) {
    return { choiceKey: `case.v9.${path.pathId}`, scopeKey: `scope.v9.${path.pathId}` };
  }
  if (policy?.mode === 'qualifiedDayProcedureV8' && path) {
    return { choiceKey: `case.v8.${path.pathId}`, scopeKey: `scope.v8.${path.pathId}` };
  }
  if (policy?.mode === 'qualifiedDayProcedureV7' && path) {
    return { choiceKey: `case.v7.${path.pathId}`, scopeKey: `scope.v7.${path.pathId}` };
  }
  if (policy?.mode === 'qualifiedDayProcedureV6' && path) {
    return { choiceKey: `case.v6.${path.pathId}`, scopeKey: `scope.v6.${path.pathId}` };
  }
  if (policy?.mode === 'qualifiedDayProcedureV5' && path) {
    const key = path.lawId === 'stvg-vgv-ow'
      ? path.action === 'requestAdministrativeReasons' ? 'owAdministrativeReasons'
        : path.action === 'requestCourtReasons' ? 'owCourtReasons'
        : path.action === 'reviewPresidentialSuspensiveEffectDecision' ? 'owSuspensive'
        : path.action === 'orderedProceduralSubmission' ? 'owSubmission' : 'owAppeal'
      : path.action === 'qualifiedEinsprache' ? 'nwEinsprache'
        : path.action === 'orderedInitialAdministrativeSubmission' ? 'nwInitialSubmission'
        : path.action === 'orderedEinwendungSubmission' ? 'nwEinwendung'
        : path.action === 'orderedEinspracheSubmission' ? 'nwEinspracheSubmission'
        : path.action === 'orderedAdministrativeAppealSubmission' || path.action === 'orderedProceduralSubmission' ? 'nwAppealSubmission'
        : path.action === 'statutoryVERNEHMLASSUNG' ? 'nwVernehmlassung'
        : path.action === 'statutoryREPLIK' ? 'nwReplik'
        : path.action === 'statutoryDUPLIK' ? 'nwDuplik' : 'nwAppeal';
    return { choiceKey: `case.v5.${key}`, scopeKey: `scope.v5.${key}` };
  }
  if (policy?.mode === 'qualifiedDayProcedureV4' && path) {
    const key = policy.requirements.action === 'requestCourtReasons' ? 'shCourtReasons'
      : policy.requirements.action === 'requestAdministrativeReasons' ? path.lawId === 'vrpv-ur' ? 'urReasons' : 'offeredReasons'
      : `${path.lawId === 'vrpv-ur' ? 'ur' : path.lawId === 'vrg-so' ? 'so' : 'sh'}${policy.requirements.action === 'orderedProceduralSubmission' ? 'Submission' : 'Appeal'}`;
    return { choiceKey: `case.v4.${key}`, scopeKey: `scope.v4.${key}` };
  }
  if (policy?.mode === 'qualifiedDayProcedureV3' && path) {
    const key = path.lawId === 'vrg-zh'
      ? policy.requirements.action === 'proceduralSubmission' ? 'zhSubmission' : 'zhOrdinary'
      : path.pathId === 'ag-execution-10' ? 'agExecution'
      : path.pathId === 'sg-admin-measures-5' ? 'sgMeasures'
      : path.pathId === 'sg-court-interim-5' ? 'sgInterim'
      : policy.requirements.procedureMatter === 'documentAccess'
        ? policy.requirements.action === 'proceduralSubmission' ? 'documentAccessSubmission' : 'documentAccessAppeal'
        : policy.requirements.action;
    return { choiceKey: `case.v3.${key}`, scopeKey: `scope.v3.${key}` };
  }
  const kind = policy?.mode === 'qualifiedDayProcedure' ? policy.requirements.action : undefined;
  return { choiceKey: kind ? `case.${kind}` : 'generalActualReceipt', scopeKey: kind ? `scope.${kind}` : 'scope' };
}

export function administrativeChoices(catalog: AdministrativeUiCatalog, lawId: string, state: AdministrativeUiState): {
  readonly stages: readonly AdministrativeStage[]; readonly paths: readonly AdministrativeUiPath[]; readonly path?: AdministrativeUiPath;
} {
  const available = catalog.paths.filter(path => path.lawId === lawId);
  const stages = (['administration', 'administrativeAppeal', 'court'] as const).filter(stage => available.some(path => path.stages.includes(stage)));
  const stage = state.stage || (stages.length === 1 ? stages[0] : '');
  const paths = available.filter(path => path.stages.some(value => value === stage));
  const path = paths.find(value => value.pathId === state.pathId) ?? (!state.pathId && paths.length === 1 ? paths[0] : undefined);
  return { stages, paths, ...(path ? { path } : {}) };
}

/** Only real one-value choices are fixed. No case fact is inferred by this step. */
export function settleAdministrativeUiState(catalog: AdministrativeUiCatalog, lawId: string, state: AdministrativeUiState): AdministrativeUiState {
  const choices = administrativeChoices(catalog, lawId, state);
  const stage = state.stage || (choices.stages.length === 1 ? choices.stages[0]! : '');
  return { ...state, stage, pathId: state.pathId || choices.path?.pathId || '' };
}

export function changeAdministrativeSelection(catalog: AdministrativeUiCatalog, lawId: string, state: AdministrativeUiState,
  field: 'stage' | 'pathId', value: string): AdministrativeUiState {
  const { currentValues: _currentValues, legalAnchorCanton: _legalAnchorCanton, areaFacts: _areaFacts, ...stable } = state;
  return settleAdministrativeUiState(catalog, lawId, {
    ...stable, [field]: value, ...(field === 'stage' ? { pathId: '' } : {}), qualification: '', urgency: ''
  });
}

export interface QualifyAdministrativeUiOptions {
  readonly catalog: AdministrativeUiCatalog;
  readonly lawId: string;
  readonly authorityCanton: string;
  readonly inputDate: string;
  readonly deadlineDays: number | undefined;
  readonly state: AdministrativeUiState;
}
export function qualifyAdministrativeUiInput(options: QualifyAdministrativeUiOptions): {
  readonly input?: AdministrativeDeadlineInput; readonly errors: Readonly<Record<string, string>>;
} {
  const { catalog, lawId, authorityCanton, inputDate, deadlineDays } = options;
  const state = settleAdministrativeUiState(catalog, lawId, options.state);
  const choices = administrativeChoices(catalog, lawId, state);
  const law = catalog.laws.find(value => value.lawId === lawId);
  const errors: Record<string, string> = {};
  if (!law) errors.law = 'validation.law';
  else if (law.canton !== authorityCanton) errors.authority = 'validation.authority';
  if (!choices.stages.some(stage => stage === state.stage)) errors.stage = 'validation.stage';
  if (!choices.path) errors.pathId = 'validation.pathId';
  if (!parseIsoDate(inputDate)) errors.inputDate = 'validation.inputDate';
  const path = choices.path;
  const policy = qualificationPolicy(catalog, path);
  const followup = policy?.mode === 'qualifiedDayProcedureV5'
    ? policy.openingChainPolicy === 'requireOriginalOrTimelyRequestedReasons'
    : policy?.mode === 'qualifiedDayProcedureV4' && policy.requirements.openingChainPolicy === 'requireOriginalOrTimelyRequestedReasons';
  if (state.qualification !== 'generalActualReceipt' && !(followup && state.qualification === 'reasonedFollowingTimelyRequest')) {
    errors.qualification = state.qualification === 'specialOrDeviating' ? 'validation.unsupported' : 'validation.qualification';
  }
  if ((catalog.formatVersion === '2.0.0' || catalog.formatVersion === '3.0.0' || catalog.formatVersion === '4.0.0' || catalog.formatVersion === '5.0.0' || catalog.formatVersion === '6.0.0' || catalog.formatVersion === '7.0.0' || catalog.formatVersion === '8.0.0' || catalog.formatVersion === '9.0.0' || catalog.formatVersion === '10.0.0') && path && !policy) errors.qualification = 'validation.qualification';
  const v10Binding = isV10Path(path) ? catalog.holidayBindings.find(value => value.holidayBindingId === path.holidayBindingId) : undefined;
  const regionSelection = v10Binding && 'calendarSelection' in v10Binding && v10Binding.calendarSelection.kind === 'qualifiedAuthoritySeatRegion'
    ? v10Binding.calendarSelection : undefined;
  if (policy?.mode === 'qualifiedDayProcedureV6' || policy?.mode === 'qualifiedDayProcedureV7' || policy?.mode === 'qualifiedDayProcedureV8' || policy?.mode === 'qualifiedDayProcedureV9' || policy?.mode === 'qualifiedDayProcedureV10') {
    const alternatives = policy.requirements.filter(requirement => 'oneOf' in requirement);
    const values = state.currentValues ?? {};
    const plain = values !== null && typeof values === 'object' && !Array.isArray(values)
      && [Object.prototype, null].includes(Object.getPrototypeOf(values))
      && Object.values(Object.getOwnPropertyDescriptors(values)).every(descriptor => 'value' in descriptor);
    if (!plain || Object.keys(values).some(key => !alternatives.some(row => row.key === key) && key !== regionSelection?.factKey)) errors.qualification = 'validation.currentValues';
    for (const requirement of alternatives) {
      const fixedV9 = (isV9Path(path) || isV10Path(path)) && requirement.oneOf?.length === 1;
      if (!fixedV9 && (!plain || !Object.hasOwn(values, requirement.key) || !requirement.oneOf?.some(value => String(value) === values[requirement.key]))) {
        errors[`fact.${requirement.key}`] = 'validation.currentValues';
      }
    }
    if (regionSelection && (!plain || !Object.hasOwn(values, regionSelection.factKey)
      || !regionSelection.cases.some(row => row.value === values[regionSelection.factKey]))) errors[`fact.${regionSelection.factKey}`] = 'validation.currentValues';
  }
  const binding = isV8Path(path) ? catalog.holidayBindings.find(value => value.holidayBindingId === path.holidayBindingId) : undefined;
  const selection = binding && 'calendarSelection' in binding ? binding.calendarSelection : undefined;
  const dynamicAnchor = selection?.kind === 'qualifiedPartyOrRepresentativeCanton' ? selection : undefined;
  const requiredAreaScopes = dynamicAnchor?.terminals.find(value => value.canton === state.legalAnchorCanton)?.requiredAreaScopeIds ?? [];
  if (dynamicAnchor) {
    const terminal = dynamicAnchor.terminals.find(value => value.canton === state.legalAnchorCanton);
    if (!terminal) errors.legalAnchorCanton = 'validation.legalAnchorCanton';
    const facts = state.areaFacts ?? {};
    const plain = facts !== null && typeof facts === 'object' && !Array.isArray(facts)
      && [Object.prototype, null].includes(Object.getPrototypeOf(facts))
      && Object.values(Object.getOwnPropertyDescriptors(facts)).every(descriptor => 'value' in descriptor);
    if (!plain || Object.keys(facts).some(key => !terminal?.requiredAreaScopeIds.some(scope => scope === key))
      || terminal?.requiredAreaScopeIds.some(key => !Object.hasOwn(facts, key) || typeof facts[key] !== 'boolean')) errors.areaFacts = 'validation.areaFacts';
  } else if ((isV8Path(path) || isV10Path(path)) && (state.legalAnchorCanton || Object.keys(state.areaFacts ?? {}).length)) {
    errors.qualification = 'validation.currentValues';
  }
  if (path?.duration.kind === 'statutoryDays') {
    if (deadlineDays !== undefined && deadlineDays !== path.duration.value) errors.deadlineDays = 'validation.durationMismatch';
  } else if (path?.duration.kind === 'concretisedStatutoryDays') {
    if (typeof deadlineDays !== 'number' || !Number.isSafeInteger(deadlineDays)
      || deadlineDays < path.duration.minimum || deadlineDays > path.duration.maximum) errors.deadlineDays = 'validation.concretisedDays';
  } else if (typeof deadlineDays !== 'number' || !Number.isInteger(deadlineDays) || deadlineDays < 1 || deadlineDays > 365) {
    errors.deadlineDays = 'validation.deadlineDays';
  }
  if (isV9Path(path) && path.duration.kind === 'authorityOrderedDays'
    && (typeof deadlineDays !== 'number' || !Number.isSafeInteger(deadlineDays) || deadlineDays < path.duration.minimum || deadlineDays > path.duration.maximum)) {
    errors.deadlineDays = 'v9.durationInvalid';
  }
  if (isV9Path(path) && path.duration.kind === 'qualifiedLongerNoticeDays') {
    const ordinary = Number(state.currentValues?.[path.duration.ordinaryBaseFact]);
    if (typeof deadlineDays !== 'number' || !Number.isSafeInteger(deadlineDays) || deadlineDays < path.duration.minimum
      || deadlineDays > path.duration.maximum || !path.duration.ordinaryBaseAllowed.some(value => value === ordinary) || deadlineDays <= ordinary) errors.deadlineDays = 'v9.noticeInvalid';
  }
  if (isV10Path(path) && path.duration.kind === 'authorityOrderedDays'
    && (typeof deadlineDays !== 'number' || !Number.isSafeInteger(deadlineDays) || deadlineDays < path.duration.minimum || deadlineDays > path.duration.maximum)) errors.deadlineDays = 'v10.durationInvalid';
  if (isV10Path(path) && path.duration.kind === 'qualifiedVsLongerNoticeDays') {
    const ordinary = Number(state.currentValues?.[path.duration.ordinaryBaseFact]);
    if (typeof deadlineDays !== 'number' || !Number.isSafeInteger(deadlineDays) || deadlineDays < path.duration.minimum
      || deadlineDays > path.duration.maximum || !path.duration.ordinaryBaseAllowed.some(value => value === ordinary) || deadlineDays <= ordinary) errors.deadlineDays = 'v10.noticeInvalid';
  }
  const urgencyRelevant = path?.urgencyPolicy === 'explicitGRJudicialUrgencyOrder' && state.stage === 'court';
  if (urgencyRelevant && state.urgency !== 'none' && state.urgency !== 'explicitJudicialUrgencyOrder') errors.urgency = 'validation.urgency';
  if (Object.keys(errors).length > 0 || !path || !law) return { errors };
  // A positive *current* grouped case choice confirms the exact reviewed facts.
  // Neither selecting a path nor loading a stable preference enters this branch.
  const currentCaseFacts: AdministrativeDeadlineInput['caseQualification'] = policy?.mode === 'qualifiedDayProcedureV6' || policy?.mode === 'qualifiedDayProcedureV7' || policy?.mode === 'qualifiedDayProcedureV8' || policy?.mode === 'qualifiedDayProcedureV9' || policy?.mode === 'qualifiedDayProcedureV10'
    ? Object.fromEntries(policy.requirements.map(requirement => [requirement.key,
      'value' in requirement ? requirement.value : policy.mode === 'qualifiedDayProcedureV9' || policy.mode === 'qualifiedDayProcedureV10'
        ? requirement.oneOf?.length === 1 ? requirement.oneOf[0] : requirement.oneOf?.find(value => String(value) === state.currentValues![requirement.key])
        : state.currentValues![requirement.key]])) as AdministrativeDeadlineInput['caseQualification']
    : policy?.mode === 'qualifiedDayProcedureV5'
    ? { ...Object.fromEntries(policy.requirements.map(requirement => [requirement.key, requirement.value])),
      ...(followup ? state.qualification === 'reasonedFollowingTimelyRequest'
        ? { openingOrigin: 'reasonedFollowingTimelyRequest', priorReasonsRequest: 'timelyEstablished' }
        : { openingOrigin: 'originalReasoned' } : {}) } as AdministrativeDeadlineInput['caseQualification']
    : policy?.mode === 'qualifiedDayProcedureV4'
    ? { action: policy.requirements.action, opening: policy.requirements.opening, holidayAnchor: policy.requirements.holidayAnchor,
      materialPerformance: false, unit: 'day', direction: 'forward', notice: 'uncontested', termChange: 'none',
      suspensionContext: 'ordinaryNoException', serviceContext: 'effectiveLegalTriggerKnown',
      ...(policy.requirements.requiredTargetCourt !== 'notApplicable' ? { targetCourt: policy.requirements.requiredTargetCourt } : {}),
      ...(policy.requirements.requiredSameIssuingCourt ? { sameIssuingCourt: true } : {}),
      ...(followup ? state.qualification === 'reasonedFollowingTimelyRequest'
        ? { openingOrigin: 'reasonedFollowingRequest', priorReasonsRequest: 'timelyEstablished' }
        : { openingOrigin: 'originalReasoned' } : {}),
      ...(policy.requirements.coordinationPolicy === 'excludeCoordinatedAppeal' ? { coordinatedDecision: false } : {}),
      ...(policy.requirements.localHolidayPolicy === 'blockConcreteUnresolvedAdditionalEndEffect' ? { localHolidayEffect: 'noAdditionalRelevantLocalHoliday' } : {}),
      ...(policy.requirements.specialOpeningPolicy === 'ordinaryEffectiveUROpening' ? { urOpeningConsequence: 'ordinaryEffectiveOpening' } : {}),
      ...(policy.requirements.shorteningPolicy === 'noShortenedSHRekurs' ? { shortenedRekurs: false } : {}) }
    : policy?.mode === 'qualifiedDayProcedureV3'
    ? { action: policy.requirements.action, decisionKind: policy.requirements.decisionKind,
      unit: policy.requirements.unit, direction: 'forward', opening: policy.requirements.opening,
      notice: policy.requirements.notice, termChange: policy.requirements.termChange,
      targetBody: policy.requirements.targetBody, procedureMatter: policy.requirements.procedureMatter,
      channelCase: policy.requirements.channelCase, exceptionNotice: policy.requirements.exceptionNotice }
    : policy?.mode === 'qualifiedDayProcedure'
      ? { action: policy.requirements.action, decisionKind: policy.requirements.decisionKind,
        unit: policy.requirements.unit, direction: 'forward', opening: policy.requirements.opening,
        notice: policy.requirements.notice, termChange: policy.requirements.termChange }
      : undefined;
  const v9Facts = isV9Path(path) ? {
    ...(path.openingPolicy.kind === 'aiQualifiedOrTrackingPost' && state.currentValues?.openingMode === 'trackingPhysicalReceipt'
      ? Object.fromEntries(path.openingPolicy.trackingRequirements.map(requirement => [requirement.key, requirement.value])) : {}),
    ...(path.duration.kind === 'qualifiedLongerNoticeDays' ? { [path.duration.valueFact]: deadlineDays! } : {})
  } : {};
  // Only the new positive current case choice can supply these exact facts.
  // No AI expectation/receipt-regime facts, regional defaults or inferred base.
  const v10Facts = isV10Path(path) ? {
    ...(path.openingPolicy.kind === 'vdQualifiedOrUnsignedPost' && state.currentValues?.openingMode === 'vdUnsignedPostalReceipt'
      ? Object.fromEntries(path.openingPolicy.trackingRequirements.map(requirement => [requirement.key, requirement.value])) : {}),
    ...(path.duration.kind === 'qualifiedVsLongerNoticeDays' ? { [path.duration.valueFact]: deadlineDays! } : {}),
    ...(regionSelection ? { [regionSelection.factKey]: state.currentValues![regionSelection.factKey]! } : {})
  } : {};
  return { errors, input: {
    selection: { kind: 'cantonalAdministrative', lawId, pathId: path.pathId, revision: path.revision, stage: state.stage },
    authoritySeat: { canton: authorityCanton, level: 'cantonal', qualification: 'competentAuthorityForCurrentAction' },
    inputDate, deadlineDays: path.duration.kind === 'statutoryDays' ? path.duration.value : deadlineDays!,
    qualification: { delivery: isV7Path(path) || isV8Path(path) || isV9Path(path) || isV10Path(path) ? 'qualifiedTriggerAccordingToOpeningPolicy' : 'qualifiedActualDelivery', generalRoute: 'qualified', specialLaw: 'excluded',
      explicitHolidayException: 'none', fixedEndDate: false, deviatingStart: false, evidenceAdvance: false },
    ...(currentCaseFacts ? { caseQualification: { ...currentCaseFacts, ...v9Facts, ...v10Facts, ...(dynamicAnchor ? { legalAnchorCanton: state.legalAnchorCanton! } : {}) } } : {}),
    ...(requiredAreaScopes.length ? { areaFacts: { ...state.areaFacts } } : {}),
    urgency: urgencyRelevant ? state.urgency as 'none' | 'explicitJudicialUrgencyOrder' : 'none'
  } };
}

/** Exact reviewed display labels distinguish real target bodies without adding redundant fields. */
export function administrativeActionLabel(path: AdministrativeUiPath, locale: Locale): string {
  if (isV6Path(path) || isV7Path(path) || isV8Path(path) || isV9Path(path) || isV10Path(path)) return administrativeText(locale, `path.${path.pathId}`);
  const labelledPaths = new Set(['zh-rekurs-30', 'zh-admin-ordered', 'zh-court-30', 'zh-court-ordered',
    'ag-execution-10', 'sg-admin-14', 'sg-vrk-14', 'sg-court-14', 'sg-admin-measures-5',
    'sg-court-interim-5', 'sg-admin-ordered', 'sg-vrk-ordered', 'sg-court-ordered',
    'ur-admin-20', 'ur-court-20', 'ur-admin-ordered', 'ur-court-ordered', 'ur-admin-reasons-10',
    'so-admin-10', 'so-court-10', 'so-admin-ordered', 'so-court-ordered', 'so-admin-reasons-10',
    'sh-admin-20', 'sh-court-20', 'sh-admin-ordered', 'sh-court-ordered', 'sh-admin-reasons-10', 'sh-court-reasons-30',
    'ow-admin-20', 'ow-court-30', 'ow-admin-ordered', 'ow-court-ordered', 'ow-admin-reasons-30', 'ow-court-reasons-30', 'ow-court-suspensive-5',
    'nw-admin-20', 'nw-court-20', 'nw-einsprache-20', 'nw-admin-ordered', 'nw-einwendung-ordered', 'nw-einsprache-ordered', 'nw-appeal-ordered', 'nw-court-ordered',
    'nw-admin-vernehmlassung-20', 'nw-court-vernehmlassung-20', 'nw-admin-replik-20', 'nw-court-replik-20', 'nw-admin-duplik-20', 'nw-court-duplik-20']);
  return administrativeText(locale, labelledPaths.has(path.pathId) ? `path.${path.pathId}` : `action.${path.action}`);
}

function FixedValue({ label, value }: { readonly label: string; readonly value: string }): React.ReactElement {
  return <div className="fr-model-scope"><div className="fr-model-scope__label">{label}</div>
    <output className="fr-model-scope__value" aria-label={label} aria-live="off">{value}</output></div>;
}

export interface AdministrativeProcedureFieldsProps {
  readonly catalog: AdministrativeUiCatalog;
  readonly lawId: string;
  readonly locale: Locale;
  readonly value: AdministrativeUiState;
  readonly onChange: (state: AdministrativeUiState) => void;
  readonly errors?: Readonly<Record<string, string | undefined>>;
}

/** Fragment belongs directly inside the existing two-column form grid. */
export function AdministrativeProcedureFields({ catalog, lawId, locale, value, onChange, errors = {} }: AdministrativeProcedureFieldsProps): React.ReactElement {
  const text = (key: string): string => administrativeText(locale, key);
  const state = settleAdministrativeUiState(catalog, lawId, value);
  const { stages, paths, path } = administrativeChoices(catalog, lawId, state);
  const qualification = administrativeQualificationPresentation(catalog, path, state);
  const policy = qualificationPolicy(catalog, path);
  const alternatives = policy?.mode === 'qualifiedDayProcedureV6' || policy?.mode === 'qualifiedDayProcedureV7' || policy?.mode === 'qualifiedDayProcedureV8' || policy?.mode === 'qualifiedDayProcedureV9' || policy?.mode === 'qualifiedDayProcedureV10' ? policy.requirements.filter(requirement => 'oneOf' in requirement) : [];
  const currentFactPrefix = policy?.mode === 'qualifiedDayProcedureV10' ? 'v10' : policy?.mode === 'qualifiedDayProcedureV9' ? 'v9' : policy?.mode === 'qualifiedDayProcedureV8' ? 'v8' : policy?.mode === 'qualifiedDayProcedureV7' ? 'v7' : 'v6';
  const binding = isV8Path(path) ? catalog.holidayBindings.find(value => value.holidayBindingId === path.holidayBindingId) : undefined;
  const calendarSelection = binding && 'calendarSelection' in binding ? binding.calendarSelection : undefined;
  const dynamicAnchor = calendarSelection?.kind === 'qualifiedPartyOrRepresentativeCanton' ? calendarSelection : undefined;
  const terminal = dynamicAnchor?.terminals.find(value => value.canton === state.legalAnchorCanton);
  const v10Binding = isV10Path(path) ? catalog.holidayBindings.find(value => value.holidayBindingId === path.holidayBindingId) : undefined;
  const regionSelection = v10Binding && 'calendarSelection' in v10Binding && v10Binding.calendarSelection.kind === 'qualifiedAuthoritySeatRegion'
    ? v10Binding.calendarSelection : undefined;
  const followup = policy?.mode === 'qualifiedDayProcedureV5'
    ? policy.openingChainPolicy === 'requireOriginalOrTimelyRequestedReasons'
    : policy?.mode === 'qualifiedDayProcedureV4' && policy.requirements.openingChainPolicy === 'requireOriginalOrTimelyRequestedReasons';
  const error = (key: string): string => errors[key] ? text(errors[key]!) : '';
  const stageLabel = text('stage');
  const actionLabel = text('action');
  const qualificationField = (
    <Dropdown styles={calculatorDropdownStyles} required label={text('qualification')} selectedKey={state.qualification}
      title={text(qualification.scopeKey)} aria-describedby="fr-administrative-scope" disabled={!path} errorMessage={error('qualification')}
      options={[{ key: '', text: text('choose') }, { key: 'generalActualReceipt', text: text(qualification.choiceKey) },
        ...(followup ? [{ key: 'reasonedFollowingTimelyRequest', text: text('case.v4.followingTimelyRequest') }] : []),
        { key: 'specialOrDeviating', text: text('specialOrDeviating') }, { key: 'unknown', text: text('unknown') }]}
      onChange={(_event, option) => {
        if (option?.key === '' || option?.key === 'generalActualReceipt' || option?.key === 'specialOrDeviating' || option?.key === 'unknown'
          || followup && option?.key === 'reasonedFollowingTimelyRequest') {
          onChange({ ...state, qualification: option.key });
        }
      }} />
  );
  return <>
    {stages.length === 1
      ? <FixedValue label={stageLabel} value={text(`stage.${stages[0]}`)} />
      : <Dropdown styles={calculatorDropdownStyles} required label={stageLabel} selectedKey={state.stage}
          options={[{ key: '', text: text('choose') }, ...stages.map(stage => ({ key: stage, text: text(`stage.${stage}`) }))]}
          errorMessage={error('stage')} onChange={(_event, option) => {
            if (typeof option?.key === 'string') onChange(changeAdministrativeSelection(catalog, lawId, state, 'stage', option.key));
          }} />}
    {paths.length === 1
      ? <FixedValue label={actionLabel} value={administrativeActionLabel(paths[0]!, locale)} />
      : <Dropdown styles={calculatorDropdownStyles} required label={actionLabel} selectedKey={state.pathId} disabled={!state.stage}
          options={[{ key: '', text: text('choose') }, ...paths.map(item => ({ key: item.pathId, text: administrativeActionLabel(item, locale) }))]}
          errorMessage={error('pathId')} onChange={(_event, option) => {
            if (typeof option?.key === 'string') onChange(changeAdministrativeSelection(catalog, lawId, state, 'pathId', option.key));
          }} />}
    {!isV9Path(path) && !isV10Path(path) && qualificationField}
    {alternatives.map(requirement => (isV9Path(path) || isV10Path(path)) && requirement.oneOf?.length === 1
      ? <FixedValue key={requirement.key} label={text(`${currentFactPrefix}.fact.${requirement.key}`)} value={text(`${currentFactPrefix}.value.${requirement.oneOf[0]}`)} />
      : <Dropdown key={requirement.key} styles={calculatorDropdownStyles} required
      label={text(`${currentFactPrefix}.fact.${requirement.key}`)} selectedKey={state.currentValues?.[requirement.key] ?? ''}
      errorMessage={error(`fact.${requirement.key}`)}
      options={[{ key: '', text: text('choose') }, ...(requirement.oneOf ?? []).map(value => ({ key: String(value), text: text(`${currentFactPrefix}.value.${value}`) })),
        { key: 'unknown', text: text(`${currentFactPrefix}.value.unknown`) }]}
      onChange={(_event, option) => {
        if (typeof option?.key === 'string') onChange({ ...state, qualification: isV9Path(path) || isV10Path(path) ? '' : state.qualification,
          currentValues: { ...state.currentValues, [requirement.key]: option.key } });
      }} />)}
    {regionSelection && <Dropdown styles={calculatorDropdownStyles} required
      label={text('v10.fact.authorityHolidayRegion')} selectedKey={state.currentValues?.[regionSelection.factKey] ?? ''}
      errorMessage={error(`fact.${regionSelection.factKey}`)}
      options={[{ key: '', text: text('choose') }, ...regionSelection.cases.map(row => ({ key: row.value, text: text(`v10.value.${row.value}`) })),
        { key: 'unknown', text: text('v10.value.unknown') }]}
      onChange={(_event, option) => {
        if (typeof option?.key === 'string') onChange({ ...state, qualification: '', currentValues: { ...state.currentValues, [regionSelection.factKey]: option.key } });
      }} />}
    {(isV9Path(path) || isV10Path(path)) && qualificationField}
    {dynamicAnchor && <Dropdown styles={calculatorDropdownStyles} required className="fr-holiday-connections"
      label={text('v8.legalAnchorCanton')} title={text('v8.legalAnchorScope')}
      selectedKey={state.legalAnchorCanton ?? ''} errorMessage={error('legalAnchorCanton')}
      options={[{ key: '', text: text('choose') }, ...dynamicAnchor.terminals.map(value => ({ key: value.canton, text: calendarCantonLabel(value.canton, locale) }))]}
      onChange={(_event, option) => {
        if (typeof option?.key === 'string') onChange({ ...state, legalAnchorCanton: option.key, areaFacts: {} });
      }} />}
    {terminal?.requiredAreaScopeIds.map(scope => <Dropdown key={scope} styles={calculatorDropdownStyles} required
      className="fr-holiday-connections" label={text(terminal.canton === 'AI' ? 'v8.regionalAI' : 'v8.regionalNE')}
      selectedKey={state.areaFacts?.[scope] === true ? 'yes' : state.areaFacts?.[scope] === false ? 'no' : ''}
      errorMessage={error('areaFacts')}
      options={[{ key: '', text: text('choose') }, { key: 'yes', text: calendarText(locale, 'yes') }, { key: 'no', text: calendarText(locale, 'no') }]}
      onChange={(_event, option) => {
        if (option?.key === '' || option?.key === 'yes' || option?.key === 'no') onChange({ ...state, areaFacts: option.key === '' ? {} : { [scope]: option.key === 'yes' } });
      }} />)}
    {path?.urgencyPolicy === 'explicitGRJudicialUrgencyOrder' && state.stage === 'court'
      ? <Dropdown styles={calculatorDropdownStyles} required label={text('urgency')} selectedKey={state.urgency} errorMessage={error('urgency')}
          options={[{ key: '', text: text('choose') }, { key: 'none', text: text('urgencyNone') },
            { key: 'explicitJudicialUrgencyOrder', text: text('urgencyOrdered') }, { key: 'unknown', text: text('unknown') }]}
          onChange={(_event, option) => {
            if (option?.key === '' || option?.key === 'none' || option?.key === 'explicitJudicialUrgencyOrder' || option?.key === 'unknown') {
              onChange({ ...state, urgency: option.key });
            }
          }} />
      : null}
  </>;
}

export function AdministrativeAutomaticParameters({ catalog, lawId, state, locale, context }: {
  readonly catalog: AdministrativeUiCatalog; readonly lawId: string; readonly state: AdministrativeUiState; readonly locale: Locale;
  readonly context?: unknown;
}): React.ReactElement {
  const text = (key: string): string => administrativeText(locale, key);
  const { path } = administrativeChoices(catalog, lawId, state);
  const binding = catalog.holidayBindings.find(value => value.holidayBindingId === path?.holidayBindingId);
  const selected = path && catalog.formatVersion === '10.0.0' && (isV6Path(path) || isV7Path(path) || isV8Path(path) || isV9Path(path) || isV10Path(path))
    ? resolveAdministrativeSuspensionV10(context, path.pathId, state.currentValues)
    : path && catalog.formatVersion === '9.0.0' && (isV6Path(path) || isV7Path(path) || isV8Path(path) || isV9Path(path))
    ? resolveAdministrativeSuspensionV9(context, path.pathId, state.currentValues)
    : path && catalog.formatVersion === '8.0.0' && (isV6Path(path) || isV7Path(path) || isV8Path(path))
    ? resolveAdministrativeSuspensionV8(context, path.pathId, state.currentValues)
    : isV7Path(path) || catalog.formatVersion === '7.0.0' && isV6Path(path)
    ? resolveAdministrativeSuspensionV7(context, path.pathId, state.currentValues)
    : isV6Path(path)
    ? resolveAdministrativeSuspensionV6(context, path.pathId, state.currentValues)
    : undefined;
  const profileId = isV6Path(path) || isV7Path(path) || isV8Path(path) || isV9Path(path) || isV10Path(path) ? selected?.suspensionProfileId : path?.suspensionProfileId;
  const suspension = catalog.suspensionProfiles.find(value => value.suspensionProfileId === profileId);
  const holidayRole = holidayRoleKey(catalog, path);
  const unresolvedUrgency = path?.urgencyPolicy === 'explicitGRJudicialUrgencyOrder' && state.stage === 'court'
    && state.urgency !== 'none' && state.urgency !== 'explicitJudicialUrgencyOrder';
  const suspensionText = unresolvedUrgency || !path || !suspension ? text('unresolved') : state.urgency === 'explicitJudicialUrgencyOrder'
    && path.urgencyPolicy === 'explicitGRJudicialUrgencyOrder' ? text('urgentSuspension')
    : suspension?.periods.length === 1 && suspension.periods[0]?.periodId === 'nw-winter' ? text('winterOnly')
      : suspension?.periods.length === 2 ? text('twoPeriods') : suspension?.periods.length
        ? suspension.suspensionProfileId === 'sz-three' ? text('v9.szWinter') : suspension.suspensionProfileId === 'vs-three' ? text('v10.vsWinter') : text('threePeriods') : text('noSuspension');
  const dynamicAnchor = binding && 'calendarSelection' in binding && binding.calendarSelection.kind === 'qualifiedPartyOrRepresentativeCanton';
  const calendarResolver = catalog.formatVersion === '10.0.0' ? resolveAdministrativeCalendarV10 : catalog.formatVersion === '9.0.0' ? resolveAdministrativeCalendarV9 : resolveAdministrativeCalendarV8;
  const calendar = isV8Path(path) || isV9Path(path) || isV10Path(path) ? calendarResolver(context, path.pathId,
    dynamicAnchor ? { legalAnchorQualification: state.qualification === 'generalActualReceipt' ? 'establishedPartyOrRepresentative' : '', legalAnchorCanton: state.legalAnchorCanton } : isV10Path(path) ? state.currentValues : undefined,
    state.areaFacts && Object.keys(state.areaFacts).length ? state.areaFacts : undefined) : undefined;
  const place = isV8Path(path) || isV9Path(path) || isV10Path(path) ? calendar ? 'authorityHolidayRegion' in calendar && calendar.authorityHolidayRegion
    ? text(`v10.value.${calendar.authorityHolidayRegion}`) : isV10Path(path) && path.holidayBindingId === 'ne-court-qualified-authority-seat'
    ? text('v10.neCourtSeat') : calendar.legalAnchorCanton
    ? `${calendarCantonLabel(calendar.legalAnchorCanton, locale)} · ${text('v8.anchorQualified')}`
    : `${calendarCantonLabel(calendar.authoritySeatCanton, locale)} · ${text('authority')}` : text('unresolved')
    : binding ? `${binding.authoritySeatCanton} · ${text(holidayRole)}` : text('unresolved');
  return <><dl className="fr-automatic__grid">
    <div><dt>{text('holiday')}</dt><dd>{place}</dd></div>
    <div><dt>{text('suspension')}</dt><dd>{suspensionText}</dd></div>
    {binding && 'annualEndShiftPolicy' in binding && binding.annualEndShiftPolicy.kind === 'blCantonalOfficeClosures'
      && <div><dt>{text('v8.annualHeading')}</dt><dd>{text('v8.annualAutomatic')}</dd></div>}
  </dl><details className="fr-trace"><summary>{text('scopeHeading')}</summary><p id="fr-administrative-scope">{text(administrativeQualificationPresentation(catalog, path).scopeKey)}</p></details></>;
}

function date(value: string): string { return value.split('-').reverse().join('.'); }

/** These are display names, not legal qualification rules or a source-ID prefix heuristic. */
const administrativeSourceNames: Readonly<Record<string, { readonly de: string; readonly fr: string }>> = {
  'SRC-AP23J1-FR-CPJA-7947': { de: 'CPJA FR (Fassung bis 30.09.2026)', fr: 'CPJA FR (version jusqu’au 30.09.2026)' },
  'SRC-AP23J1-FR-CPJA-8637': { de: 'CPJA FR (Fassung ab 01.10.2026)', fr: 'CPJA FR (version dès le 01.10.2026)' },
  'SRC-AP23J1-FR-LJ-7926-FR': { de: 'Justizgesetz FR', fr: 'Loi sur la justice FR' },
  'SRC-AP23J1-FR-LJ-7926-DE': { de: 'Justizgesetz FR (amtlicher deutscher Text)', fr: 'Loi sur la justice FR (texte allemand officiel)' },
  'SRC-AP23J1-FR-ROF-2026-044': { de: 'Änderung des CPJA FR ab Oktober 2026', fr: 'Modification du CPJA FR dès octobre 2026' },
  'SRC-AP23J1-FR-ROF-2014-103': { de: 'Historischer Änderungserlass CPJA FR', fr: 'Modification historique du CPJA FR' },
  'SRC-AP23J1-FR-MESSAGE-175-2009': { de: 'Botschaft zum Justizgesetz FR', fr: 'Message relatif à la loi sur la justice FR' },
  'JUD-AP23J1-FR-BGER-8C884-2010': { de: 'Bundesgericht zum Freiburger Verfahrenskontext', fr: 'Tribunal fédéral sur le contexte procédural fribourgeois' },
  'JUD-AP23J1-FR-BGER-2C741-2016': { de: 'Bundesgericht zur Zahlungskonstellation FR', fr: 'Tribunal fédéral sur une situation de paiement FR' },
  'SRC-J1-GE-LPA-20250601': { de: 'Verwaltungsverfahrensgesetz GE (LPA)', fr: 'Loi sur la procédure administrative GE' },
  'SRC-J1-GE-LJF-19910101': { de: 'Feiertagsgesetz GE', fr: 'Loi sur les jours fériés GE' },
  'JUD-J1-GE-ATA436-20240326': { de: 'Verwaltungsgericht GE zur Eröffnung und Feiertagsbindung', fr: 'Chambre administrative GE sur la notification et les jours fériés' },
  'JUD-J1-GE-BGER7B32-20230906': { de: 'Ergänzender Bundesgerichtsbeleg aus dem Strafprozess', fr: 'Arrêt complémentaire du Tribunal fédéral en procédure pénale' },
  'JUD-J1-GE-ATA520-20260526': { de: 'Verwaltungsgericht GE zur Kostenreklamation', fr: 'Chambre administrative GE sur la réclamation relative aux frais' },
  'SRC-AP23J1-JU-CPA-20240101': { de: 'Verwaltungsverfahrensgesetz JU (CPA)', fr: 'Code de procédure administrative JU' },
  'SRC-AP23J1-JU-LJF-20230101': { de: 'Feiertagsgesetz JU', fr: 'Loi sur les jours fériés officiels JU' },
  'JUD-AP23J1-JU-ADM121-2017': { de: 'Historischer Praxisbeleg JU zu vorsorglichen Massnahmen', fr: 'Pratique historique JU relative aux mesures provisionnelles' },
  'JUD-AP23J1-JU-ADM77-2021': { de: 'Historischer Praxisbeleg JU zum Osterstillstand', fr: 'Pratique historique JU relative à la suspension pascale' },
  'JUD-AP23J1-JU-BGER2D55-2010': { de: 'Ergänzender historischer Beleg zur nachgelieferten Begründung', fr: 'Source historique complémentaire sur la motivation communiquée ultérieurement' },
  'SRC-AP23B-TI-HOL': { de: 'Gesetz über die offiziellen Feiertage TI', fr: 'Loi sur les jours fériés officiels TI' },
  'SRC-AP23B-GR-RTG': { de: 'Gesetz über die öffentlichen Ruhetage GR', fr: 'Loi sur les jours de repos publics GR' },
  'SRC-AP23E1-LU-RTG-20260927': { de: 'Ruhetags- und Ladenschlussgesetz LU', fr: 'Loi sur les jours de repos et la fermeture des magasins LU' },
  'SRC-AP23E1-AR-ARGV-20160101': { de: 'Ruhetagsgesetz AR', fr: 'Loi sur les jours de repos AR' },
  'SRC-AP23B-CH-HOL': { de: 'Bundesgesetz über den Bundesfeiertag', fr: 'Loi fédérale sur la fête nationale' },
  'SRC-AP23F1-ZH-RLG-20040701': { de: 'Ruhetags- und Ladenöffnungsgesetz ZH', fr: 'Loi sur les jours de repos et l’ouverture des magasins ZH' },
  'SRC-AP23F1-ZH-GOG-20260101': { de: 'Gerichtsorganisationsgesetz ZH', fr: 'Loi sur l’organisation judiciaire ZH' },
  'SRC-AP23F1-ZH-VRG-REVISION-20270101': { de: 'VRG ZH – Revision ab 2027', fr: 'VRG ZH – Révision dès 2027' },
  'SRC-AP23F1-ZH-RRB715-2025': { de: 'Inkraftsetzung VRG ZH ab 2027', fr: 'Entrée en vigueur du VRG ZH dès 2027' },
  'SRC-AP23F1-CH-ZPO-20260701': { de: 'Zivilprozessordnung', fr: 'Code de procédure civile' },
  'SRC-AP23F1-AG-EGZPO-20220101': { de: 'Einführungsgesetz zur ZPO AG', fr: 'Loi d’introduction du CPC AG' },
  'SRC-AP23F1-AG-EGARR-20250901': { de: 'Einführungsgesetz zum Arbeitsrecht AG', fr: 'Loi d’introduction du droit du travail AG' },
  'SRC-AP23F1-SG-RLG-20080122': { de: 'Ruhetagsgesetz SG', fr: 'Loi sur les jours de repos SG' },
  'SRC-AP23F1-SG-GERG-20180701': { de: 'Gerichtsgesetz SG', fr: 'Loi sur les tribunaux SG' },
  'SRC-AP23F1-SG-GERG-20270601': { de: 'Gerichtsgesetz SG ab Juni 2027', fr: 'Loi sur les tribunaux SG dès juin 2027' },
  'SRC-AP23F1-SG-OEFFG-20230701': { de: 'Öffentlichkeitsgesetz SG', fr: 'Loi sur la transparence SG' },
  'SRC-AP23G1-UR-LSG-20030101': { de: 'Landessonntagsgesetz UR', fr: 'Loi sur les jours de repos UR' },
  'SRC-AP23G1-SO-GS201463': { de: 'Verfahrensrechtliche Feiertagsregel SO', fr: 'Règle procédurale sur les jours fériés SO' },
  'SRC-AP23G1-SH-JG-20260501': { de: 'Justizgesetz SH', fr: 'Loi sur la justice SH' },
  'SRC-AP23G1-SH-RTG-20070101': { de: 'Ruhetagsgesetz SH', fr: 'Loi sur les jours de repos SH' },
  'JUD-AP23G1-SH-OGE-4020181K-20180824': { de: 'Obergericht SH zur gerichtlichen Feiertagspraxis', fr: 'Tribunal supérieur SH sur la pratique judiciaire des jours fériés' },
  'JUD-AP23G1-SH-BGER-2C4832025-20260312': { de: 'Bundesgericht zur Verwaltungspraxis SH am 2. Januar', fr: 'Tribunal fédéral sur la pratique administrative SH du 2 janvier' },
  'SRC-AP23G1-CH-ZPO-20260701': { de: 'Zivilprozessordnung', fr: 'Code de procédure civile' },
  'SRC-AP23G1-CH-BUNDESFEIERTAG-19940701': { de: 'Bundesgesetz über den Bundesfeiertag', fr: 'Loi fédérale sur la fête nationale' },
  'SRC-AP23H1-OW-STVG-20250101': { de: 'Staatsverwaltungsgesetz OW (Fassung bis Ende 2026)', fr: 'Loi sur l’administration de l’État OW (version jusqu’à fin 2026)' },
  'SRC-AP23H1-OW-STVG-20270101': { de: 'Staatsverwaltungsgesetz OW (Fassung ab 2027)', fr: 'Loi sur l’administration de l’État OW (version dès 2027)' },
  'SRC-AP23H1-OW-VGV-20110101': { de: 'Verordnung über das Verwaltungsgerichtsverfahren OW', fr: 'Ordonnance sur la procédure devant le Tribunal administratif OW' },
  'SRC-AP23H1-OW-VWVV-20200101': { de: 'Verordnung über das Verwaltungs- und Verwaltungsbeschwerdeverfahren OW', fr: 'Ordonnance sur la procédure administrative et le recours administratif OW' },
  'SRC-AP23H1-OW-GOG-20220401': { de: 'Gerichtsorganisationsgesetz OW', fr: 'Loi sur l’organisation judiciaire OW' },
  'SRC-AP23H1-OW-RTG-20090801': { de: 'Ruhetagsgesetz OW', fr: 'Loi sur les jours de repos OW' },
  'SRC-AP23H1-CH-ZPO-20260701': { de: 'Zivilprozessordnung', fr: 'Code de procédure civile' },
  'SRC-AP23H1-CH-BGG-20260401': { de: 'Bundesgerichtsgesetz', fr: 'Loi sur le Tribunal fédéral' },
  'SRC-AP23H1-NW-VRG-20260801': { de: 'Verwaltungsrechtspflegegesetz NW', fr: 'Loi sur la procédure administrative NW' },
  'SRC-AP23H1-NW-RTG-20160101': { de: 'Ruhetagsgesetz NW', fr: 'Loi sur les jours de repos NW' },
  'SRC-AP23I1-GL-VRG-20230101': { de: 'Verwaltungsrechtspflegegesetz GL', fr: 'Loi sur la procédure administrative GL' },
  'SRC-AP23I1-GL-GOG-20220701': { de: 'Gerichtsorganisationsgesetz GL', fr: 'Loi sur l’organisation judiciaire GL' },
  'SRC-AP23I1-GL-RTG-20190701': { de: 'Ruhetagsgesetz GL', fr: 'Loi sur les jours de repos GL' },
  'SRC-AP23I1-GL-FAHRT-18350524': { de: 'Regelung zur Näfelser Fahrt GL', fr: 'Réglementation de la Näfelser Fahrt GL' },
  'SRC-AP23I1-TG-VRG-20240601': { de: 'Verwaltungsrechtspflegegesetz TG', fr: 'Loi sur la procédure administrative TG' },
  'SRC-AP23I1-TG-RTG-20260101': { de: 'Ruhetagsgesetz TG', fr: 'Loi sur les jours de repos TG' },
  'SRC-AP23I1-TG-VEU-20260328': { de: 'Verordnung zur elektronischen Übermittlung TG', fr: 'Ordonnance sur la transmission électronique TG' },
  'JUD-AP23I1-TG-TVR2003-45': { de: 'Regierungsrat TG zur Trennung der Verfahrensstufen', fr: 'Conseil d’État TG sur la séparation des stades de procédure' },
  'JUD-AP23I1-TG-TVR2013-15': { de: 'Verwaltungsgericht TG zum Ferienhinweis', fr: 'Tribunal administratif TG sur l’information relative aux féries' },
  'JUD-AP23I1-TG-TVR2020-7': { de: 'Verwaltungsgericht TG zur Vollstreckungsbeschwerde', fr: 'Tribunal administratif TG sur le recours en matière d’exécution' },
  'SRC-AP23I1-TG-BOTSCHAFT-20130625': { de: 'Amtliche Botschaft TG zur VRG-Revision', fr: 'Message officiel TG sur la révision du VRG' }
};
const administrativePeriodNames: Readonly<Record<string, string>> = {
  'ti-easter': 'period.easter', 'gr-easter': 'period.easter', 'ar-easter': 'period.easter',
  'ti-summer': 'period.summer', 'gr-summer': 'period.summer', 'ar-summer': 'period.summer',
  'ti-winter': 'period.winter', 'gr-winter': 'period.winter', 'ar-winter': 'period.winter',
  'zh-easter': 'period.easter', 'ag-easter': 'period.easter', 'sg-easter': 'period.easter',
  'zh-summer': 'period.summer', 'ag-summer': 'period.summer', 'sg-summer': 'period.summer',
  'zh-winter': 'period.winter', 'ag-winter': 'period.winter', 'sg-winter': 'period.winter',
  'ur-easter': 'period.easter', 'so-easter': 'period.easter', 'sh-easter': 'period.easter',
  'ur-summer': 'period.summer', 'so-summer': 'period.summer', 'sh-summer': 'period.summer',
  'ur-winter': 'period.winter', 'so-winter': 'period.winter', 'sh-winter': 'period.winter',
  'ow-easter': 'period.easter', 'ow-summer': 'period.summer', 'ow-winter': 'period.winter',
  'nw-easter': 'period.easter', 'nw-summer': 'period.summer', 'nw-winter': 'period.winter',
  'gl-easter': 'period.easter', 'gl-summer': 'period.summer', 'gl-winter': 'period.winter',
  'tg-easter': 'period.easter', 'tg-summer': 'period.summer', 'tg-winter': 'period.winter',
  'fr-easter': 'period.easter', 'fr-summer': 'period.summer', 'fr-winter': 'period.winter',
  'ge-easter': 'period.easter', 'ge-summer': 'period.summer', 'ge-winter': 'period.winter',
  'ju-easter': 'period.easter', 'ju-summer': 'period.summer', 'ju-winter': 'period.winter',
  'ai-easter': 'period.easter', 'ai-summer': 'period.summer', 'ai-winter': 'period.winter',
  'sz-easter': 'period.easter', 'sz-summer': 'period.summer', 'sz-winter': 'period.winter',
  'ne-easter': 'period.easter', 'ne-summer': 'period.summer', 'ne-winter': 'period.winter',
  'vd-easter': 'period.easter', 'vd-summer': 'period.summer', 'vd-winter': 'period.winter',
  'vs-easter': 'period.easter', 'vs-summer': 'period.summer', 'vs-winter': 'period.winter'
};

/** The archived review annotation remains in technical provenance, not in a legal article label. */
function readableNormLocator(ref: AdministrativeSourceRef, pathId?: string): string {
  const m3Locator = ap23m3NormLocator(ref.sourceId, pathId);
  if (m3Locator) return m3Locator;
  const l3Locator = ap23l3NormLocator(ref.sourceId, pathId);
  if (l3Locator) return l3Locator;
  const k3Locator = ap23k3NormLocator(ref.sourceId, pathId);
  if (k3Locator) return k3Locator;
  if (ref.sourceId === 'SRC-AP23H1-OW-VGV-20110101'
    && ref.locator === 'Art. 12 Abs. 3 VGV und abgenommene Massnahmenanalogie H1-C') return 'Art. 12 Abs. 3';
  if (ref.sourceId === 'SRC-AP23H1-NW-VRG-20260801'
    && ref.locator === 'Art. 33–36 und Art. 33a VRG, konkrete Tagesanordnung') return 'Art. 33–36, insbesondere Art. 33a';
  const locators: Readonly<Record<string, string>> = {
    'SRC-AP23F1-AG-EGZPO-20220101': '§ 21',
    'SRC-AP23F1-ZH-RLG-20040701': '§ 1',
    'SRC-AP23F1-SG-RLG-20080122': 'Art. 2–3',
    'SRC-AP23F1-SG-GERG-20270601': 'Fassung ab 01.06.2027',
    'SRC-AP23F1-SG-OEFFG-20230701': 'Art. 17–18',
    'SRC-AP23F1-ZH-VRG-REVISION-20270101': '§§ 10a, 11 Abs. 2–4, 12 Abs. 3',
    'SRC-AP23F1-ZH-RRB715-2025': 'Dispositiv I',
    'SRC-AP23H1-OW-STVG-20250101': 'Art. 64, Art. 67–68',
    'SRC-AP23H1-OW-GOG-20220401': 'Art. 1, Art. 28'
  };
  if (locators[ref.sourceId]) return locators[ref.sourceId]!;
  return ref.sourceId === 'SRC-AP23B-CH-HOL' && ref.locator === 'Art. 1, historische Wiederverwendung ohne neue Quellenfreigabe'
    ? 'Art. 1' : ref.locator;
}

function AdministrativeNorms({ refs, catalog, locale, includeOfficialMaterials = false, includeJudgments = false, pathId }: {
  readonly refs: readonly AdministrativeSourceRef[]; readonly catalog: AdministrativeUiCatalog; readonly locale: Locale;
  readonly includeOfficialMaterials?: boolean;
  readonly includeJudgments?: boolean;
  readonly pathId?: string;
}): React.ReactElement | null {
  const statutes = refs.filter((ref, index) => refs.findIndex(other => other.sourceId === ref.sourceId && other.locator === ref.locator) === index)
    .flatMap(ref => {
      const source = catalog.sources.find(value => value.sourceId === ref.sourceId
        && (value.kind === 'statute' || includeOfficialMaterials && value.kind === 'officialMaterials'
          || includeJudgments && value.kind === 'judgment'));
      if (!source || !/^https:\/\//.test(source.url)) return [];
      // K1 records preserve reading scope and raw provenance, not UI article text.
      if (ref.sourceId.startsWith('SRC-K1-') && !ap23k3NormLocator(ref.sourceId, pathId)) return [];
      if (ref.sourceId.startsWith('SRC-L1-') && !ap23l3NormLocator(ref.sourceId, pathId)) return [];
      if ((ref.sourceId.startsWith('SRC-M1-') || ref.sourceId.startsWith('JUD-M1-')) && !ap23m3NormLocator(ref.sourceId, pathId)) return [];
      const law = catalog.laws.find(value => value.sourceRefs.some(item => item.sourceId === ref.sourceId));
      // V5's OW law combines four enactments. Name each concrete source instead
      // of calling every linked ordinance simply "StVG / VGV".
      const name = ap23m3SourceName(ref.sourceId, locale) ?? ap23l3SourceName(ref.sourceId, locale) ?? ap23k3SourceName(ref.sourceId, locale) ?? (ref.sourceId.startsWith('SRC-AP23H1-') || ref.sourceId.startsWith('SRC-AP23J1-') || ref.sourceId.startsWith('SRC-J1-GE-')
        ? administrativeSourceNames[ref.sourceId]?.[locale]
        : law ? administrativeText(locale, `law.${law.lawId}`) : administrativeSourceNames[ref.sourceId]?.[locale]);
      return name ? [{ ref, source, name, title: law?.title ?? name }] : [];
    });
  return statutes.length ? <p className="fr-trace__sources">{administrativeText(locale, 'legalBasis')}: {statutes.map(({ ref, source, name, title }, index) =>
    <React.Fragment key={`${ref.sourceId}:${ref.locator}`}>{index ? ' · ' : ''}<a href={source.url} title={title}
      target="_blank" rel="noopener noreferrer">{name}: {readableNormLocator(ref, pathId)}</a></React.Fragment>)}</p> : null;
}

/** Resolve only the exact result bindings. This is presentation of an existing result, never another deadline calculation. */
function administrativeTracePresentation(result: AdministrativeDeadlineResult, input: AdministrativeDeadlineInput,
  context: unknown, catalog: AdministrativeUiCatalog, locale: Locale) {
  const data = getVerifiedAdministrativeContext(context);
  const provenance = result.provenance;
  if (!data || data.catalog !== catalog || !provenance || provenance.releaseId !== data.releaseId) return undefined;
  const path = catalog.paths.find(value => value.pathId === provenance.pathId && value.revision === provenance.revision && value.lawId === provenance.lawId);
  const binding = catalog.holidayBindings.find(value => value.holidayBindingId === provenance.holidayBindingId && value.lawId === provenance.lawId);
  const suspension = catalog.suspensionProfiles.find(value => value.suspensionProfileId === provenance.suspensionProfileId && value.lawId === provenance.lawId);
  let expectedProfileId: string | undefined;
  if (isV6Path(path) || isV7Path(path) || isV8Path(path) || isV9Path(path) || isV10Path(path)) {
    const selection = path.suspensionSelection;
    const facts = input.caseQualification as Readonly<Record<string, unknown>> | undefined;
    expectedProfileId = selection.kind === 'fixed' ? selection.suspensionProfileId
      : selection.cases.find(row => row.value === facts?.[selection.factKey])?.suspensionProfileId;
  } else expectedProfileId = path?.suspensionProfileId;
  if (!path || !binding || !suspension || path.holidayBindingId !== binding.holidayBindingId || expectedProfileId !== suspension.suspensionProfileId) return undefined;
  const calendarResolver = catalog.formatVersion === '10.0.0' ? resolveAdministrativeCalendarV10 : catalog.formatVersion === '9.0.0' ? resolveAdministrativeCalendarV9 : resolveAdministrativeCalendarV8;
  const calendarResolution = isV8Path(path) || isV9Path(path) || isV10Path(path) ? calendarResolver(context, path.pathId, input.caseQualification, input.areaFacts) : undefined;
  if (isV8Path(path) || isV9Path(path) || isV10Path(path)) {
    if (!calendarResolution || !provenance.calendarResolution
      || calendarResolution.calendarId !== provenance.calendarId || calendarResolution.projectionId !== provenance.projectionId
      || calendarResolution.calendarId !== provenance.calendarResolution.calendarId
      || calendarResolution.projectionId !== provenance.calendarResolution.projectionId
      || calendarResolution.legalAnchorCanton !== provenance.calendarResolution.legalAnchorCanton
      || ('authorityHolidayRegion' in calendarResolution ? calendarResolution.authorityHolidayRegion : undefined)
        !== ('authorityHolidayRegion' in provenance.calendarResolution ? provenance.calendarResolution.authorityHolidayRegion : undefined)
      || calendarResolution.calendarSelectionSha256 !== provenance.calendarResolution.calendarSelectionSha256
      || calendarResolution.holidayBindingSha256 !== provenance.calendarResolution.holidayBindingSha256) return undefined;
  } else if (!('physicalBaseline' in binding) || binding.physicalBaseline.calendarId !== provenance.calendarId
    || binding.physicalBaseline.projectionId !== provenance.projectionId) return undefined;
  const periodIds = result.outcome === 'calculated' ? result.encounteredPeriodIds : result.periodIds ?? [];
  const comparisonEnd = isV8Path(path) ? [provenance.calendarResolution?.januaryComparison?.withoutJanuary2,
    provenance.calendarResolution?.januaryComparison?.withJanuary2, provenance.annualEndShiftResolution?.uncertaintyComparison?.withoutOptionalEnd,
    provenance.annualEndShiftResolution?.uncertaintyComparison?.withOptionalEnd].filter((value): value is string => typeof value === 'string').sort().at(-1) : undefined;
  // Diagnostic branches are not result dates, but their actually evaluated norms
  // must still be displayed over the full comparison interval.
  const rangeEnd = result.outcome === 'calculated' ? result.finalEnd : result.blockedDate ?? result.provisionalEnd ?? comparisonEnd ?? input.inputDate;
  const firstDate = parseIsoDate(input.inputDate);
  const lastDate = parseIsoDate(rangeEnd);
  if (!firstDate || !lastDate || firstDate.ordinal > lastDate.ordinal) return undefined;
  // Materialise the bound profile for the actual case interval. IDs are opaque
  // join keys only, never an alternate source for a date or an inferred year.
  const materializedPeriods = new Map<string, { id: string; name: string; from: string; to: string }>();
  for (let year = Math.max(1, firstDate.year - 1); year <= lastDate.year + 1; year += 1) {
    for (const period of suspension.periods) {
      const nameKey = administrativePeriodNames[period.periodId];
      if (!nameKey) continue;
      const from = administrativePeriodDate(period.start, year);
      const to = administrativePeriodDate(period.end, year);
      if (from > rangeEnd || to < input.inputDate) continue;
      const id = `${period.periodId}-${year}`;
      materializedPeriods.set(id, { id, name: administrativeText(locale, nameKey), from, to });
    }
  }
  const periods = periodIds.flatMap(id => {
    const period = materializedPeriods.get(id);
    return period ? [period] : [];
  });
  const holidays: { id: string; name: string; date: string }[] = [];
  const shiftedIds = result.shiftedHolidayIds ?? [];
  const from = result.provisionalEnd;
  const to = result.outcome === 'calculated' ? result.finalEnd : result.blockedDate;
  if (shiftedIds.length && from && to) {
    try {
      const generated = generateCalendarFromRules(data.calendars, provenance.calendarId, { from, to });
      for (const id of shiftedIds) {
        const holiday = generated.calendar.holidays.find(value => value.holidayId === id);
        const application = generated.trace.find(value => value.generatedIds.includes(id));
        const rule = application && data.calendars.find(value => value.calendarId === application.calendarId)?.rules.find(value => value.ruleId === application.ruleId);
        if (!holiday || !rule) continue;
        const replacement = rule.effect.type === 'explicitDateOverride' ? rule.effect.replacementHoliday : undefined;
        const labels = replacement?.labelKey === holiday.labelKey ? replacement.labels : rule.labelKey === holiday.labelKey ? rule.labels : undefined;
        if (labels) holidays.push({ id, name: labels[locale], date: holiday.date });
      }
    } catch { /* A missing presentation detail never changes the existing calculation or fabricates a name. */ }
  }
  const law = catalog.laws.find(value => value.lawId === path.lawId);
  const currentNormRefs = isV7Path(path) || isV8Path(path) || isV9Path(path) || isV10Path(path) ? (provenance.evaluatedNormSegments ?? []).flatMap(segment => segment.sourceRefs) : path.sourceRefs;
  const usedByPath = (ref: AdministrativeSourceRef) => isV9Path(path)
    ? (path.lawId === 'ai-general-administrative'
      ? [path.stages.includes('court') ? 'SRC-L1-AI-VERWGG' : 'SRC-L1-AI-VERWVG', 'SRC-L1-AI-FRIG',
        ...(['ai-court-president-7','ai-court-personnel-10'].includes(path.pathId) ? ['SRC-L1-AI-GOG'] : [])]
      : ['SRC-L1-SZ-VRP-20260701','SRC-L1-SZ-JG-20260701']).includes(ref.sourceId)
    : !isV8Path(path) || path.sourceRefs.some(value => value.sourceId === ref.sourceId);
  const pathNorms = currentNormRefs.filter(ref => law?.sourceRefs.some(value => value.sourceId === ref.sourceId) && usedByPath(ref));
  // A versioned whole-law reference is current only if the authenticated result
  // actually evaluated its segment. Historical origin remains in technical evidence.
  const applicableRefs = (refs: readonly AdministrativeSourceRef[]) => isV9Path(path) || isV10Path(path)
    ? refs.filter(ref => !law?.sourceRefs.some(value => value.sourceId === ref.sourceId) || currentNormRefs.some(value => value.sourceId === ref.sourceId))
    : isV8Path(path)
    ? refs.filter(ref => !['SRC-K1-BS-VWVG-20220701', 'SRC-K1-BS-VWVG-20270101', 'SRC-K1-BL-RRB2025-51', 'SRC-K1-BL-OVERVIEW2026', 'SRC-K1-BL-RRB2026-217', 'SRC-K1-BL-OVERVIEW2027'].includes(ref.sourceId)
      || currentNormRefs.some(value => value.sourceId === ref.sourceId)) : isV7Path(path)
    ? refs.filter(ref => !law?.sourceRefs.some(value => value.sourceId === ref.sourceId)
      || currentNormRefs.some(value => value.sourceId === ref.sourceId)) : refs;
  const normSegments = (provenance.evaluatedNormSegments ?? []).map(segment => ({
      from: segment.interval.from < input.inputDate ? input.inputDate : segment.interval.from,
      to: segment.interval.to > rangeEnd ? rangeEnd : segment.interval.to,
      sourceRefs: segment.sourceRefs.filter(usedByPath)
    }));
  return { path, binding, suspension, periods, holidays, pathNorms, normSegments, calendarResolution,
    suspensionNorms: applicableRefs(suspension.sourceRefs), holidayNorms: applicableRefs(binding.legalBinding.sourceRefs),
    periodsUnresolved: periods.length !== periodIds.length,
    unresolvedNames: periods.length !== periodIds.length || holidays.length !== shiftedIds.length };
}

export interface AdministrativeResultViewProps {
  readonly result: AdministrativeDeadlineResult;
  readonly input: AdministrativeDeadlineInput;
  readonly context: unknown;
  readonly catalog: AdministrativeUiCatalog;
  readonly locale: Locale;
  readonly calendarReference: string;
  readonly onCalendarReferenceChange: (value: string) => void;
  readonly onExport?: () => void;
}
export function AdministrativeResultView({ result, input, context, catalog, locale, calendarReference, onCalendarReferenceChange, onExport }: AdministrativeResultViewProps): React.ReactElement {
  const text = (key: string): string => administrativeText(locale, key);
  const calculated = result.outcome === 'calculated';
  const provenance = result.provenance;
  const stoppedBeforeProvenance = !calculated && !provenance;
  const opening = provenance?.openingResolution;
  const annual = provenance?.annualEndShiftResolution;
  const supplement = provenance?.proceduralCalendarSupplementResolution;
  const durationResolution = provenance?.durationResolution;
  const calendarResolution = provenance?.calendarResolution;
  const presentation = React.useMemo(() => administrativeTracePresentation(result, input, context, catalog, locale), [result, input, context, catalog, locale]);
  const unresolvedOfficeEndShift = !calculated && isV8Path(presentation?.path) && annual?.kind === 'blCantonalOfficeClosures'
    && annual.uncertaintyComparison?.outcome === 'different';
  const exportAvailable = administrativeExportAvailable(input, context, result);
  const warningKeys = result.warningKeys ?? [];
  const policy = qualificationPolicy(catalog, presentation?.path);
  const holidayRole = holidayRoleKey(catalog, presentation?.path);
  const openingWarnings = presentation && policy?.mode === 'qualifiedDayProcedureV4'
    ? (presentation.path as AdministrativePathV4).openingWarnings : [];
  const reason = (key: string): string => key === 'endShiftIntoSuspensionUnresolved' && provenance?.lawId === 'vrpg-ar'
    ? text('endShiftIntoSuspensionUnresolvedAR')
    : key === 'endShiftIntoSuspensionUnresolved' && ['ne-general-administrative','vd-general-administrative','vs-general-administrative'].includes(provenance?.lawId ?? '')
      ? text('v10.endCollision')
    : key === 'endShiftIntoSuspensionUnresolved' && ['ai-general-administrative','sz-general-administrative'].includes(provenance?.lawId ?? '')
      ? text('v9.endCollision')
    : key === 'endShiftIntoSuspensionUnresolved' && ['vrg-zh', 'vrpg-ag', 'vrp-sg', 'vrpv-ur', 'vrg-so', 'vrg-sh', 'stvg-vgv-ow', 'vrg-nw', 'vrg-gl', 'vrg-tg', 'cpja-fr', 'lpa-ge', 'cpa-ju'].includes(provenance?.lawId ?? '')
      ? text('endShiftIntoSuspensionUnresolvedF1') : calendarReason(locale, key) ?? text(key);
  return <section className="fr-result" aria-labelledby="fr-administrative-result-heading">
    <h2 id="fr-administrative-result-heading">{text(calculated && result.referenceOnly ? 'referenceResult' : 'result')}</h2>
    <MessageBar messageBarType={calculated ? MessageBarType.success : MessageBarType.blocked}>{text(calculated ? 'calculated' : 'blocked')}</MessageBar>
    {warningKeys.length > 0 && <MessageBar messageBarType={MessageBarType.warning}>{warningKeys.map(key => <p key={key}>{text(key)}</p>)}</MessageBar>}
    {calculated && <dl className="fr-result__grid">
      <div className="fr-result__hero"><dt>{text('finalEnd')}</dt><dd><strong>{date(result.finalEnd)}</strong></dd></div>
      <div><dt>{text('provisionalEnd')}</dt><dd>{date(result.provisionalEnd)}</dd></div>
      <div><dt>{text('deadlineStart')}</dt><dd>{date(result.deadlineStart)}</dd></div>
      <div><dt>{text('skipped')}</dt><dd>{result.skippedCalendarDays}</dd></div>
      <div><dt>{text('days')}</dt><dd>{result.deadlineDays}</dd></div>
      {exportAvailable && onExport ? <div className="fr-calendar-export"><dt className="fr-calendar-export__action"><PrimaryButton type="button" className="fr-calendar-export__button" iconProps={{ iconName: 'Calendar' }} text={text('export')} onClick={onExport} /></dt>
        <dd><TextField label={text('reference')} placeholder={translate(locale, 'calendar.reference.placeholder')} value={calendarReference} maxLength={200}
          onChange={(_event, value) => onCalendarReferenceChange(value ?? '')} /><p className="fr-calendar-export__privacy">{translate(locale, 'calendar.privacy')}</p></dd></div>
        : <div><dt>{text(result.referenceOnly ? 'noExport' : 'exportUnavailable')}</dt></div>}
    </dl>}
    {!calculated && <div className="fr-result__messages"><ul>{result.blockReasonKeys.map(key => <li key={key}>{reason(key)}</li>)}</ul></div>}
    <details className="fr-trace" open={!calculated}><summary>{text('trace')}</summary>
      <div data-testid="administrative-readable-trace">
      <dl>
        <div><dt>{text(isV10Path(presentation?.path) ? opening?.inputMode === 'vdUnsignedPostalReceipt' ? 'v10.physicalReceipt' : 'v10.qualifiedDate'
          : isV9Path(presentation?.path) ? opening?.inputMode === 'trackingPhysicalReceipt' ? 'v9.physicalReceipt' : 'v9.qualifiedDate' : 'received')}</dt><dd>{date(input.inputDate)}</dd></div>
        {calculated && <><div><dt>{text('ordinaryStart')}</dt><dd>{date(result.ordinaryStart)} · {text(isV10Path(presentation?.path) ? 'v10.nextDay' : isV9Path(presentation?.path) ? 'v9.nextDay' : 'nextDay')}</dd></div>
          {result.startShiftApplied && <div><dt>{text('deadlineStart')}</dt><dd>{date(result.deadlineStart)} · {text('afterSuspension')}</dd></div>}
          <div><dt>{text('days')}</dt><dd>{result.deadlineDays}</dd></div>
          <div><dt>{text('provisionalEnd')}</dt><dd>{date(result.provisionalEnd)}</dd></div></>}
        {!calculated && result.provisionalEnd && <div><dt>{text('provisionalEnd')}</dt><dd>{date(result.provisionalEnd)}</dd></div>}
        {!calculated && result.blockedDate && <div><dt>{text('blockedAt')}</dt><dd>{date(result.blockedDate)}</dd></div>}
        {!stoppedBeforeProvenance && <div><dt>{text('shifts')}</dt><dd>{unresolvedOfficeEndShift ? text('v8.unresolvedOfficeEndShift')
          : <>{calculated && result.finalEnd !== result.provisionalEnd
            ? `${date(result.provisionalEnd)} → ${date(result.finalEnd)} · ` : ''}{result.shiftReasonKeys?.map(text).join(' · ') || text('none')}</>}</dd></div>}
      </dl>
      {presentation && <>
        {(isV7Path(presentation.path) || isV8Path(presentation.path) || isV9Path(presentation.path) || isV10Path(presentation.path)) && opening && <section className="fr-trace__opening">
          <h4>{text('v7.openingHeading')}</h4>
          <p>{text(opening.inputMode === 'vdUnsignedPostalReceipt' ? 'v10.postExplanation' : opening.inputMode === 'trackingPhysicalReceipt' ? 'v9.trackingExplanation' : opening.inputMode === 'ordinaryPostPhysicalReceipt' ? 'v7.openingExplanation' : 'v7.identityOpeningExplanation')}</p>
          <dl>
            <div><dt>{text(opening.inputMode === 'vdUnsignedPostalReceipt' ? 'v10.physicalReceipt' : opening.inputMode === 'trackingPhysicalReceipt' ? 'v9.physicalReceipt' : opening.inputMode === 'ordinaryPostPhysicalReceipt' ? 'v7.physicalReceipt' : 'received')}</dt><dd>{date(opening.inputDate)}</dd></div>
            <div><dt>{text('v7.qualifiedOpening')}</dt><dd>{date(opening.qualifiedOpeningDate)}</dd></div>
          </dl>
          {['qualifiedOralDecisionOpening', 'qualifiedFullyFavourableAbbreviatedOpening', 'qualifiedTcDispositifOpening'].includes('triggerKind' in opening ? opening.triggerKind ?? '' : '')
            && <p>{text('v7.noAutomaticFollowup')}</p>}
          {isV10Path(presentation.path) && ['vs-admin-written-5', 'vs-court-written-5', 'vs-admin-full-30', 'vs-court-full-30'].includes(presentation.path.pathId)
            && <p>{text('v10.noAutomaticFollowup')}</p>}
        </section>}
        {isV9Path(presentation.path) && durationResolution?.kind === 'qualifiedLongerNoticeDays' && <section data-testid="administrative-current-notice-trace">
          <h4>{text('v9.noticeHeading')}</h4><p>{text('v9.fact.ordinaryStatutoryDays')}: {durationResolution.ordinaryStatutoryDays}</p>
          <p>{text('v9.longerDays')}: {durationResolution.actualLongerInstructionDays}</p>
        </section>}
        {isV10Path(presentation.path) && durationResolution?.kind === 'qualifiedVsLongerNoticeDays' && <section data-testid="administrative-current-notice-trace">
          <h4>{text('v10.noticeHeading')}</h4><p>{text('v10.fact.ordinaryDays')}: {durationResolution.ordinaryDays}</p>
          <p>{text('v10.longerDays')}: {durationResolution.actualInstructionDays}</p>
        </section>}
        <AdministrativeNorms refs={presentation.pathNorms} catalog={catalog} locale={locale} pathId={presentation.path.pathId} />
        {warningKeys.length > 0 && openingWarnings.length > 0 && <>
          <h4>{text('openingNotice')}</h4>
          <AdministrativeNorms refs={openingWarnings.flatMap(warning => warning.sourceRefs)} catalog={catalog} locale={locale} />
        </>}
        {presentation.normSegments.length > 0 && <section className="fr-trace__norm-segments"><h4>{text('normSegments')}</h4>
          {presentation.normSegments.map(segment => <div key={`${segment.from}:${segment.to}`}>
            <p>{date(segment.from)}–{date(segment.to)}</p>
            <AdministrativeNorms refs={segment.sourceRefs} catalog={catalog} locale={locale} pathId={presentation.path.pathId}
              includeOfficialMaterials={!isV6Path(presentation.path) && !isV7Path(presentation.path)} />
          </div>)}</section>}
        <h4>{text('periods')}</h4>
        {isV6Path(presentation.path)
          && presentation.path.suspensionSelection.kind === 'currentFact' && <p>{text('v6.noticeTrace')}: {text(`v6.value.${(input.caseQualification as Readonly<Record<string, unknown>> | undefined)?.exceptionNotice}`)}</p>}
        {presentation.periods.length ? <ul>{presentation.periods.map(period => <li key={period.id}>{period.name}: {date(period.from)}–{date(period.to)} ({text('inclusive')})</li>)}</ul>
          : <p>{presentation.periodsUnresolved ? text('traceDetailsUnavailable') : provenance?.urgencyApplied ? text('urgentSuspension')
            : presentation.suspension.periods.length ? text('noEncounteredSuspension') : text('noSuspension')}</p>}
        {calculated && result.skippedCalendarDays > 0 && <p>{text('notCounted')}: {result.skippedCalendarDays}</p>}
        <AdministrativeNorms refs={provenance?.urgencyApplied || !presentation.suspension.periods.length
          ? presentation.pathNorms : presentation.suspensionNorms} catalog={catalog} locale={locale} pathId={presentation.path.pathId} />
        <h4>{text('holiday')}</h4><p>{calendarResolution && 'authorityHolidayRegion' in calendarResolution && calendarResolution.authorityHolidayRegion
          ? text(`v10.value.${calendarResolution.authorityHolidayRegion}`)
          : isV10Path(presentation.path) && presentation.path.holidayBindingId === 'ne-court-qualified-authority-seat'
          ? text('v10.neCourtSeat') : calendarResolution?.legalAnchorCanton
          ? `${calendarCantonLabel(calendarResolution.legalAnchorCanton, locale)} · ${text('v8.anchorQualified')}`
          : `${calendarCantonLabel(presentation.binding.authoritySeatCanton, locale)} · ${text(holidayRole)}`}</p>
        {isV8Path(presentation.path) && calendarResolution?.legalAnchorCanton && <section className="fr-trace__anchor" data-testid="administrative-anchor-trace">
          <h4>{text('v8.anchorHeading')}</h4><p>{text('v8.legalAnchorScope')}</p>
          {calendarResolution.requiredAreaScopeIds.map(scope => <p key={scope}>{text(calendarResolution.legalAnchorCanton === 'AI' ? 'v8.regionalAI' : 'v8.regionalNE')}
            {' '}{calendarText(locale, calendarResolution.areaFacts[scope] === true ? 'yes' : 'no')}</p>)}
          {calendarResolution.boundaryIds.map(id => <p key={id}>{calendarReason(locale, id)}</p>)}
          {calendarResolution.januaryComparison && <section data-testid="administrative-january-comparison">
            <h4>{calendarText(locale, 'comparison')}</h4><p>{calendarText(locale, 'withoutJanuary')}: {date(calendarResolution.januaryComparison.withoutJanuary2)}</p>
            <p>{calendarText(locale, 'withJanuary')}: {date(calendarResolution.januaryComparison.withJanuary2)}</p>
            <p>{text(calendarResolution.januaryComparison.outcome === 'equal' ? 'v8.comparisonEqual' : 'v8.comparisonDifferent')}</p>
          </section>}
        </section>}
        {presentation.holidays.length > 0 && <ul>{presentation.holidays.map(holiday => <li key={holiday.id}>{holiday.name}: {date(holiday.date)}</li>)}</ul>}
        <AdministrativeNorms refs={presentation.holidayNorms} catalog={catalog} locale={locale}
          pathId={presentation.path.pathId} includeJudgments={'bindingVersion' in presentation.binding && presentation.binding.bindingVersion === '4.0.0'} />
        {isV8Path(presentation.path) && annual?.kind === 'blCantonalOfficeClosures' && <section className="fr-trace__annual-closures" data-testid="administrative-office-closure-trace">
          <h4>{text('v8.annualHeading')}</h4><p>{text('v8.annualExplanation')}</p>
          {annual.shiftedOfficeClosureDates.length > 0 ? <ul>{annual.shiftedOfficeClosureDates.map(value => <li key={value}>{date(value)}</li>)}</ul>
            : <p>{text(unresolvedOfficeEndShift ? 'v8.unresolvedOfficeEndShift' : 'v8.annualNoneEncountered')}</p>}
          <AdministrativeNorms refs={annual.boundOfficeClosureDays.filter(value => annual.evaluatedYears.includes(value.year)).flatMap(value => value.sourceRefs)} catalog={catalog} locale={locale}
            pathId={presentation.path.pathId} includeOfficialMaterials />
          {annual.uncertaintyComparison && <section data-testid="administrative-office-comparison">
            <h4>{text('v8.annualComparisonHeading')}</h4>
            <p>{text('v8.withoutOptional')}: {date(annual.uncertaintyComparison.withoutOptionalEnd)}</p>
            <p>{text('v8.withOptional')}: {date(annual.uncertaintyComparison.withOptionalEnd)}</p>
            <p>{text(annual.uncertaintyComparison.outcome === 'equal' ? 'v8.comparisonEqual' : 'v8.comparisonDifferent')}</p>
          </section>}
        </section>}
        {isV9Path(presentation.path) && supplement?.kind === 'szSchwyzMartinstag' && <section data-testid="administrative-procedural-supplement-trace">
          <h4>{text('v9.supplementHeading')}</h4><p>{text('v9.supplementExplanation')}</p>
          {supplement.shiftedDates.length ? <ul>{supplement.shiftedDates.map(value => <li key={value}>{text('v9.martinstag')}: {date(value)}</li>)}</ul>
            : <p>{text('v9.noSupplementShift')}</p>}
          <AdministrativeNorms refs={supplement.boundDates.flatMap(value => value.sourceRefs)} catalog={catalog} locale={locale} pathId={presentation.path.pathId} includeOfficialMaterials />
        </section>}
        {presentation.path.lawId === 'stvg-vgv-ow' && <p>{text(input.selection.stage === 'court' ? 'owCourtGogDirect' : 'owAdministrativeGogTransfer')}</p>}
        {presentation.path.pathId === 'ow-court-suspensive-5' && <p>{text('owSuspensiveVacationAnalogy')}</p>}
        {'practiceAddition' in presentation.binding && presentation.binding.practiceAddition !== null && <p>{text('shAdministrativePractice')}</p>}
      </>}
      {stoppedBeforeProvenance
        ? <p data-testid="administrative-trace-before-provenance">{text('traceBeforeProvenance')}</p>
        : (!presentation || presentation.unresolvedNames) && <p>{text('traceDetailsUnavailable')}</p>}
      {!stoppedBeforeProvenance && <><h4>{text('scopeHeading')}</h4><p>{text(administrativeQualificationPresentation(catalog, presentation?.path).scopeKey)}</p></>}
      </div>
      {!stoppedBeforeProvenance && <div data-testid="administrative-technical-evidence"><TechnicalTraceDetails locale={locale}>
      <dl>
        {calculated && <div><dt>{text('counted')}</dt><dd>{result.countedDates.map(date).join(' · ')}</dd></div>}
        <div><dt>{text('periods')}</dt><dd>{(calculated ? result.encounteredPeriodIds : result.periodIds ?? []).join(' · ') || text('none')}</dd></div>
        <div><dt>{text('shiftHolidays')}</dt><dd>{result.shiftedHolidayIds?.join(' · ') || text('none')}</dd></div>
      </dl>
      {provenance && <><h4>{text('provenance')}</h4><dl>
        <div><dt>{text('path')}</dt><dd>{text(`law.${provenance.lawId}`)} · {provenance.pathId} · r{provenance.revision} · {text(`stage.${provenance.stage}`)}</dd></div>
        <div><dt>{text('holidayBinding')}</dt><dd>{provenance.authoritySeatCanton} · {provenance.holidayBindingId} · {provenance.calendarId}</dd></div>
        <div><dt>{text('release')}</dt><dd>{provenance.releaseId}</dd></div>
      </dl><p>{provenance.sourceRefs.map((ref, index) => {
        const source = catalog.sources.find(value => value.sourceId === ref.sourceId);
        const safeUrl = source && /^https:\/\//.test(source.url) ? source.url : undefined;
        return <React.Fragment key={`${ref.sourceId}:${ref.locator}`}>{index ? ' · ' : ''}{safeUrl
          ? <a href={safeUrl} target="_blank" rel="noopener noreferrer">{ref.locator}</a> : ref.locator}</React.Fragment>;
      })}</p><pre>{JSON.stringify({ result, pathEligibility: catalog.releaseBinding.pathEligibility.find(value => value.pathId === provenance.pathId && value.pathRevision === provenance.revision),
        physicalBaseline: presentation && 'physicalBaseline' in presentation.binding ? presentation.binding.physicalBaseline : undefined,
        ...('calendarResolution' in (provenance ?? {}) ? { calendarResolution, annualEndShiftResolution: annual } : {}) }, null, 2)}</pre></>}
      </TechnicalTraceDetails></div>}
    </details>
  </section>;
}
