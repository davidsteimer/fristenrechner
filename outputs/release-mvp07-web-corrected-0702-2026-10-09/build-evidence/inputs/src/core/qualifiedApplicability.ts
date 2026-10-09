// SPDX-License-Identifier: AGPL-3.0-only

import { compareIsoDates, parseIsoDate } from './date';
import type { QualifiedDeadlineInput, QualifiedDeadlineResolution } from './qualifiedTypes';
import type { CalculatedDeadlineDefinition, SpecialDeadlineInput } from './specialTypes';
import type { CalculationData } from './types';

export function qualifiedApplicabilityReason(
  input: QualifiedDeadlineInput,
  definition: CalculatedDeadlineDefinition
): string | undefined {
  const rule = definition.applicability;
  if (!rule || input.mappingId !== rule.mappingId) return 'applicabilityMappingMismatch';
  if (rule.authorityCode !== 'BE' || rule.holidayCanton !== 'BE' || rule.deadlineForm !== 'days'
    || (rule.holidayPolicy !== 'partyOrRepresentative' && rule.holidayPolicy !== 'bern')
    || !parseIsoDate(rule.caseCoverageFrom)
    || (rule.caseCoverageTo !== null && (!parseIsoDate(rule.caseCoverageTo)
      || compareIsoDates(rule.caseCoverageTo, rule.caseCoverageFrom) < 0))
    || !parseIsoDate(definition.validity.dataValidFrom)
    || (definition.validity.dataValidTo !== null && (!parseIsoDate(definition.validity.dataValidTo)
      || compareIsoDates(definition.validity.dataValidTo, definition.validity.dataValidFrom) < 0))
    || (definition.validity.legalEffectiveFrom !== undefined && definition.validity.legalEffectiveFrom !== null
      && !parseIsoDate(definition.validity.legalEffectiveFrom))
    || (rule.procedureStartOnOrAfter !== null && !parseIsoDate(rule.procedureStartOnOrAfter))
    || !Array.isArray(rule.notificationChannels) || rule.notificationChannels.length === 0
    || rule.notificationChannels.some(channel => channel !== 'individual-service' && channel !== 'official-publication')) {
    return 'applicabilityContractInvalid';
  }
  if (input.qualificationBasis !== undefined
    && input.qualificationBasis !== 'confirmed-case-facts'
    && input.qualificationBasis !== 'displayed-model-scope') return 'qualificationBasisInvalid';
  if (input.authorityCode !== rule.authorityCode) return 'unsupportedAuthority';
  if (input.matter !== rule.matter) return 'matterMismatch';
  if (input.triggerKind !== rule.triggerKind) return 'triggerKindMismatch';
  if (input.deadlineForm !== rule.deadlineForm) return 'unsupportedDeadlineForm';
  // A visible, single-channel model scope is not a fictitious case confirmation.
  // Multiple supported channels still require an explicit user choice. The older
  // confirmed-case-facts contract remains unchanged for archival reference cases.
  const displayedModelScope = input.qualificationBasis === 'displayed-model-scope';
  const modelSuppliesSingleChannel = displayedModelScope
    && rule.notificationChannels.length === 1
    && input.notificationChannel === rule.notificationChannels[0];
  if (input.notificationConfirmed !== true
    && !(input.notificationConfirmed === false && modelSuppliesSingleChannel)) return 'notificationUnconfirmed';
  if (displayedModelScope && input.notificationChannel === undefined) return 'unsupportedNotificationChannel';
  if (input.notificationChannel !== undefined
    && !rule.notificationChannels.includes(input.notificationChannel)) return 'unsupportedNotificationChannel';
  if (input.holidayAnchorConfirmed !== true) return 'holidayAnchorUnconfirmed';
  if (input.holidayCanton !== rule.holidayCanton) return 'unsupportedHolidayCanton';
  if (!parseIsoDate(input.legalTriggerDate)) return 'triggerDateInvalid';
  if (compareIsoDates(input.legalTriggerDate, rule.caseCoverageFrom) < 0
    || compareIsoDates(input.legalTriggerDate, definition.validity.dataValidFrom) < 0
    || (definition.validity.dataValidTo !== null && compareIsoDates(input.legalTriggerDate, definition.validity.dataValidTo) > 0)
    || (rule.caseCoverageTo !== null && compareIsoDates(input.legalTriggerDate, rule.caseCoverageTo) > 0)) {
    return 'applicabilityDateOutsideValidity';
  }
  if (rule.procedureStartOnOrAfter !== null) {
    if (!input.procedureStartDate) return 'procedureStartMissing';
    if (!parseIsoDate(input.procedureStartDate)) return 'procedureStartInvalid';
    if (compareIsoDates(input.procedureStartDate, rule.procedureStartOnOrAfter) < 0) {
      return 'procurementLegacyProcedure';
    }
    if (compareIsoDates(input.procedureStartDate, input.legalTriggerDate) > 0) return 'procedureStartAfterTrigger';
  } else if (input.procedureStartDate !== undefined) {
    return 'unexpectedProcedureStart';
  }
  const calculation = definition.calculation;
  if (calculation.type !== 'R1_RELATIVE'
    || calculation.direction !== 'after' || calculation.anchorBoundary !== 'excluded'
    || (calculation.duration && (calculation.duration.unit !== 'day'
      || !Number.isInteger(calculation.duration.value) || calculation.duration.value < 1 || calculation.duration.value > 365))
    || (!calculation.duration && !calculation.durationInputId)
    || (calculation.duration && calculation.durationInputId)) {
    return 'qualifiedCalculationContractInvalid';
  }
  if (calculation.duration) {
    if (input.days !== undefined) return 'unexpectedDeadlineDays';
  } else if (!Number.isInteger(input.days) || typeof input.days !== 'number' || input.days < 1 || input.days > 365) {
    return 'deadlineDaysInvalid';
  }
  return undefined;
}

/** The same entry point is used by the UI resolver and by direct core calls. */
export function resolveQualifiedSpecialDeadline(
  input: QualifiedDeadlineInput,
  data: CalculationData
): QualifiedDeadlineResolution {
  const matches = [...data.specialRegimeCatalogs.values()].flatMap(catalog =>
    catalog.deadlineDefinitions.flatMap(definition =>
      definition.deadlineOrigin === 'CALCULATED' && definition.applicability?.mappingId === input.mappingId
        ? [{ catalog, definition }]
        : []));
  if (matches.length !== 1) {
    const knownBlocked = [...data.specialRegimeCatalogs.values()]
      .some(catalog => catalog.blockedMappings?.some(mapping => mapping.mappingId === input.mappingId));
    return { outcome: 'blocked', blockReasonKeys: [knownBlocked ? 'mappingBlocked' : 'unknownMapping'] };
  }
  const { catalog, definition } = matches[0]!;
  const mapping = definition.applicability!;
  if (catalog.formatVersion !== '3.0.0') {
    return { outcome: 'blocked', blockReasonKeys: ['qualifiedCatalogVersionUnsupported'] };
  }
  const regimes = catalog.regimes.filter(regime => regime.deadlineDefinitionIds.includes(definition.deadlineDefinitionId));
  if (definition.status !== 'supported' || regimes.length !== 1 || regimes[0]?.status !== 'supported') {
    return { outcome: 'blocked', blockReasonKeys: ['mappingBlocked'] };
  }
  const reason = qualifiedApplicabilityReason(input, definition);
  if (reason) return { outcome: 'blocked', blockReasonKeys: [reason] };
  const calculation = definition.calculation;
  if (calculation.type !== 'R1_RELATIVE') {
    return { outcome: 'blocked', blockReasonKeys: ['qualifiedCalculationContractInvalid'] };
  }
  const days = calculation.duration?.value ?? input.days!;
  return {
    outcome: 'resolved',
    mapping,
    days,
    specialInput: {
      profileId: catalog.profileId,
      regimeId: regimes[0]!.regimeId,
      ruleId: definition.deadlineDefinitionId,
      dateValues: { [calculation.anchorInputId]: input.legalTriggerDate },
      localTimeValues: {},
      integerValues: calculation.durationInputId ? { [calculation.durationInputId]: days } : {},
      calendarProfileId: definition.resultPolicy.calendarProfileId,
      suspensionProfileId: definition.resultPolicy.suspensionProfileId,
      filingProfileId: definition.filingProfileId,
      overrideConfirmations: [],
      applicabilityContext: { ...input }
    }
  };
}

export function validateQualifiedSpecialInput(input: SpecialDeadlineInput, data: CalculationData): string | undefined {
  if (!input.applicabilityContext) return 'applicabilityContextMissing';
  const resolution = resolveQualifiedSpecialDeadline(input.applicabilityContext, data);
  if (resolution.outcome === 'blocked') return resolution.blockReasonKeys[0];
  const expected = resolution.specialInput;
  if (input.profileId !== expected.profileId || input.regimeId !== expected.regimeId
    || input.ruleId !== expected.ruleId) return 'applicabilityMappingMismatch';
  if (JSON.stringify(input.dateValues) !== JSON.stringify(expected.dateValues)
    || JSON.stringify(input.integerValues) !== JSON.stringify(expected.integerValues)) {
    return 'applicabilityInputMismatch';
  }
  if (input.calendarProfileId !== expected.calendarProfileId
    || input.suspensionProfileId !== expected.suspensionProfileId
    || input.filingProfileId !== expected.filingProfileId) return 'componentProfileMismatch';
  if (input.overrideConfirmations.length > 0) return 'unexpectedOverrideConfirmation';
  return undefined;
}
