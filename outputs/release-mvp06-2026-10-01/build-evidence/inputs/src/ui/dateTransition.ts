// SPDX-License-Identifier: AGPL-3.0-only

import type { CalculationData } from '../core';
import { inputDateSemantics, isGeneralCalculation, specialSelection, type CalculatorFormState } from './model';
import { socialUiPath } from './socialUi';

export interface PrimaryDateField {
  readonly role: string;
  readonly labelKey: string;
  /** Absent for the general, provisional and format-5 social input. */
  readonly inputId?: string;
}

/** Presentation meaning, not a legal qualification or a persisted data contract. */
export function primaryDateField(data: CalculationData, state: CalculatorFormState): PrimaryDateField {
  if (state.profileId === 'vrpg-be' && state.vrpgSelection && socialUiPath(data, state.vrpgSelection)) {
    return { role: 'service', labelKey: 'vrpg.legalServiceDate' };
  }
  const general = isGeneralCalculation(data, state);
  const definition = specialSelection(data, state.profileId, state.specialRegimeId, state.specialDefinitionId).definition;
  const anchor = !general && definition?.deadlineOrigin === 'CALCULATED'
    ? definition.anchors.find(item => item.valueType === 'date') : undefined;
  if (anchor) {
    if (definition?.deadlineOrigin === 'CALCULATED' && definition.applicability && anchor.inputId === 'legalTriggerDate') {
      const publication = state.vrpgContext?.notificationChannel === 'official-publication';
      return { inputId: anchor.inputId, role: publication ? 'publication' : 'service',
        labelKey: publication ? 'vrpg.publicationDate' : 'vrpg.legalServiceDate' };
    }
    // Explicit aliases only. In particular, preparatoryActNoticeDate may mean
    // knowledge/public announcement and is NOT the date of individual service.
    const role = anchor.inputId === 'decisionNoticeDate' ? 'service'
      : anchor.inputId === 'publicationDate' ? 'publication' : `anchor:${anchor.inputId}`;
    return { inputId: anchor.inputId, role, labelKey: anchor.labelKey };
  }
  const semantics = general ? inputDateSemantics(state.selectors) : 'legallyRelevantDeliveryOrEventDate';
  if (semantics === 'failedDeliveryAttemptDate') return { role: semantics, labelKey: 'form.inputDate.failedAttempt' };
  if (semantics === 'observedOrdinaryMailDeliveryDate') return { role: semantics, labelKey: 'form.inputDate.observedMail' };
  // Before the path is known, the visible field explicitly asks for service.
  return { role: 'service', labelKey: 'form.inputDate.direct' };
}

/** Transfer only the visible primary date. Never reuse a hidden or secondary anchor. */
export function reconcilePrimaryDate(
  data: CalculationData,
  previous: CalculatorFormState,
  next: CalculatorFormState
): Pick<CalculatorFormState, 'inputDate' | 'specialDateValues'> & {
  readonly cleared: boolean;
  readonly field: PrimaryDateField;
} {
  const before = primaryDateField(data, previous);
  const field = primaryDateField(data, next);
  const currentValue = before.inputId ? previous.specialDateValues[before.inputId] ?? '' : previous.inputDate;
  const cleared = Boolean(currentValue) && before.role !== field.role;
  const value = cleared ? '' : currentValue;
  const specialDateValues = { ...next.specialDateValues };
  if (before.inputId) delete specialDateValues[before.inputId];
  if (field.inputId) specialDateValues[field.inputId] = value;
  return { inputDate: field.inputId ? '' : value, specialDateValues, cleared, field };
}
