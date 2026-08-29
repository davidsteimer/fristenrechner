// SPDX-License-Identifier: AGPL-3.0-only

import type {
  CalculationData,
  CalculationInput,
  InputDateSemantics,
  LegalProfile,
  LegalRule
} from '../core';

export interface AuthorityOption {
  readonly key: string;
  readonly level: 'federal' | 'cantonal';
  readonly code: string;
}

export interface CalculatorFormState {
  readonly authorityCode: string;
  readonly profileId: string;
  readonly inputDate: string;
  readonly deadlineDays: string;
  readonly selectors: Readonly<Record<string, string>>;
  readonly calendarId: string;
  readonly calendarOverrideReason: string;
  readonly additionalHolidayAnchor: string;
  readonly holidayAnchorConfirmed: boolean;
  readonly deliveryFictionConfirmed: boolean;
  readonly specialLawChecked: boolean;
}

export type SuspensionPresentation = 'enabled' | 'disabled' | 'pending';

const DEFAULT_PROFILE_ID = 'stpo';

function conditionsMatch(rule: LegalRule, selectors: Readonly<Record<string, string>>): boolean {
  return rule.conditions.every(condition => condition.values.includes(selectors[condition.selector] ?? ''));
}

export function authorityOptions(data: CalculationData): AuthorityOption[] {
  const cantons = new Set<string>();
  data.profiles.forEach(profile => {
    if (profile.jurisdiction.level === 'cantonal') {
      cantons.add(profile.jurisdiction.code);
    }
  });
  return [
    { key: 'CH', level: 'federal', code: 'CH' },
    ...[...cantons].sort().map(code => ({ key: code, level: 'cantonal' as const, code }))
  ];
}

export function profilesForAuthority(data: CalculationData, authorityCode: string): LegalProfile[] {
  return [...data.profiles.values()]
    .filter(profile => profile.jurisdiction.level === 'federal'
      || (profile.jurisdiction.level === 'cantonal' && profile.jurisdiction.code === authorityCode))
    .sort((left, right) => left.lawCode.localeCompare(right.lawCode, 'de-CH'));
}

export function isProfileAllowed(
  data: CalculationData,
  authorityCode: string,
  profileId: string
): boolean {
  return profilesForAuthority(data, authorityCode).some(profile => profile.profileId === profileId);
}

export function reconcileProfileId(
  data: CalculationData,
  authorityCode: string,
  currentProfileId: string,
  preferredProfileId = DEFAULT_PROFILE_ID
): string {
  const allowed = profilesForAuthority(data, authorityCode);
  if (allowed.some(profile => profile.profileId === currentProfileId)) {
    return currentProfileId;
  }
  if (allowed.some(profile => profile.profileId === preferredProfileId)) {
    return preferredProfileId;
  }
  return allowed[0]?.profileId ?? '';
}

export function defaultSelectors(profile: LegalProfile | undefined): Record<string, string> {
  if (!profile) {
    return {};
  }
  return Object.fromEntries(profile.selectors.flatMap(definition => {
    const direct = definition.options.find(option => option.value === 'otherLegallyRelevantDate');
    return direct ? [[definition.selectorId, direct.value]] : [];
  }));
}

export function reconcileSelectors(
  profile: LegalProfile | undefined,
  candidate: Readonly<Record<string, string>>
): Record<string, string> {
  if (!profile) {
    return {};
  }
  const defaults = defaultSelectors(profile);
  profile.selectors.forEach(definition => {
    const value = candidate[definition.selectorId];
    if (value && definition.options.some(option => option.value === value)) {
      defaults[definition.selectorId] = value;
    }
  });
  return defaults;
}

export function inputDateSemantics(selectors: Readonly<Record<string, string>>): InputDateSemantics {
  const method = selectors.deliveryMethod;
  if (method === 'ordinaryMailWeekendOrHoliday') {
    return 'observedOrdinaryMailDeliveryDate';
  }
  if (method === 'registeredMailUncollected' || method === 'signatureMailUncollected') {
    return 'failedDeliveryAttemptDate';
  }
  return 'legallyRelevantDeliveryOrEventDate';
}

export function calendarForJurisdiction(data: CalculationData, jurisdictionCode: string): string | undefined {
  return [...data.calendars.values()]
    .find(calendar => calendar.jurisdiction.code === jurisdictionCode)?.calendarId;
}

export function automaticCalendarId(data: CalculationData, profile: LegalProfile | undefined): string {
  if (profile?.calendarPolicy.jurisdictionSelection === 'fixedBern') {
    return calendarForJurisdiction(data, 'BE') ?? '';
  }
  return calendarForJurisdiction(data, 'BE')
    ?? calendarForJurisdiction(data, 'CH')
    ?? data.calendars.keys().next().value
    ?? '';
}

export function isCalendarOverride(
  data: CalculationData,
  profile: LegalProfile | undefined,
  calendarId: string
): boolean {
  return calendarId !== automaticCalendarId(data, profile);
}

export function suspensionPresentation(
  profile: LegalProfile | undefined,
  selectors: Readonly<Record<string, string>>
): SuspensionPresentation {
  if (!profile) {
    return 'pending';
  }
  const unresolvedRequired = profile.selectors.some(definition => definition.required
    && (!selectors[definition.selectorId] || selectors[definition.selectorId] === 'unknown'));
  if (unresolvedRequired) {
    return 'pending';
  }

  const baseRules = profile.rules
    .filter(rule => rule.effect.type === 'suspension' && conditionsMatch(rule, selectors));
  let enabled = baseRules.some(rule => rule.effect.mode === 'useSet');
  if (profile.rules.some(rule => rule.effect.type === 'suspensionException' && conditionsMatch(rule, selectors))) {
    enabled = false;
  }
  profile.rules
    .filter(rule => rule.effect.type === 'suspensionRouting' && conditionsMatch(rule, selectors))
    .forEach(rule => {
      const selector = typeof rule.effect.selector === 'string' ? rule.effect.selector : '';
      const cases = Array.isArray(rule.effect.cases) ? rule.effect.cases : [];
      const selectedCase = cases.find(entry => typeof entry === 'object' && entry !== null
        && (entry as Record<string, unknown>).value === selectors[selector]) as Record<string, unknown> | undefined;
      if (typeof selectedCase?.suspensionEnabled === 'boolean') {
        enabled = selectedCase.suspensionEnabled;
      }
    });
  return enabled ? 'enabled' : 'disabled';
}

export function normalizeAdditionalHolidayAnchor(value: string): string {
  return value.trim().toUpperCase();
}

export function holidayAnchorCandidates(
  data: CalculationData,
  calendarId: string,
  additionalHolidayAnchor: string
): string[] {
  const primary = data.calendars.get(calendarId)?.jurisdiction.code;
  const additional = normalizeAdditionalHolidayAnchor(additionalHolidayAnchor);
  return [...new Set([primary, /^(CH|[A-Z]{2})$/.test(additional) ? additional : undefined]
    .filter((value): value is string => Boolean(value)))];
}

export function createCalculationInput(
  data: CalculationData,
  state: CalculatorFormState
): CalculationInput {
  const selectors = Object.fromEntries(Object.entries(state.selectors).filter(([, value]) => value !== ''));
  const candidates = holidayAnchorCandidates(data, state.calendarId, state.additionalHolidayAnchor);
  return {
    profileId: state.profileId,
    inputDate: state.inputDate,
    inputDateSemantics: inputDateSemantics(selectors),
    deadlineDays: Number(state.deadlineDays),
    calendarId: state.calendarId,
    selectors,
    confirmations: {
      holidayAnchorConfirmed: candidates.length <= 1 || state.holidayAnchorConfirmed,
      deliveryFictionApplicabilityConfirmed: state.deliveryFictionConfirmed,
      specialLawChecked: state.specialLawChecked
    },
    holidayAnchorCandidates: candidates
  };
}

export function requiresDeliveryFictionConfirmation(selectors: Readonly<Record<string, string>>): boolean {
  return inputDateSemantics(selectors) !== 'legallyRelevantDeliveryOrEventDate';
}

export function requiresSpecialLawConfirmation(selectors: Readonly<Record<string, string>>): boolean {
  return selectors.specialLawStatus === 'noKnownOverride';
}
