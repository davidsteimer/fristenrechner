// SPDX-License-Identifier: AGPL-3.0-only

import type {
  CalculationData,
  CalculationInput,
  InputDateSemantics,
  LegalProfile,
  LegalRule,
  SpecialDeadlineInput,
  SpecialRegime,
  SpecialRegimeCatalog,
  DeadlineDefinition,
  CalculatedDeadlineDefinition
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
  readonly specialRegimeId: string;
  readonly specialDefinitionId: string;
  readonly specialDateValues: Readonly<Record<string, string>>;
  readonly specialLocalTimeValues: Readonly<Record<string, string>>;
  readonly specialIntegerValues: Readonly<Record<string, string>>;
  readonly specialOverrideConfirmations: readonly string[];
}

export interface SpecialRegimeOption {
  readonly regime: SpecialRegime;
  readonly selectable: boolean;
  readonly presentationStatus: 'supported' | 'followup' | 'open' | 'blocked';
}

export interface SpecialSelection {
  readonly catalog: SpecialRegimeCatalog | undefined;
  readonly regime: SpecialRegime | undefined;
  readonly definition: DeadlineDefinition | undefined;
}

export type SuspensionPresentation = 'enabled' | 'disabled' | 'pending';

const DEFAULT_PROFILE_ID = 'stpo';
export const GENERAL_SPECIAL_REGIME_ID = 'vrpg-be-general';

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

export function specialCatalogForProfile(
  data: CalculationData,
  profileId: string
): SpecialRegimeCatalog | undefined {
  return [...data.specialRegimeCatalogs.values()].find(catalog => catalog.profileId === profileId);
}

function presentationStatus(regime: SpecialRegime): SpecialRegimeOption['presentationStatus'] {
  if (regime.status === 'blocked') return 'blocked';
  if (regime.status === 'open') return 'open';
  return regime.implementationScope === 'mvp02' ? 'supported' : 'followup';
}

export function specialRegimeOptions(
  data: CalculationData,
  profileId: string
): SpecialRegimeOption[] {
  const catalog = specialCatalogForProfile(data, profileId);
  if (!catalog) return [];
  return catalog.regimes
    .filter(regime => regime.uiExposure !== 'hidden' && regime.regimeKind !== 'filingOverlay')
    .map(regime => ({
      regime,
      selectable: regime.status === 'supported'
        && regime.implementationScope === 'mvp02'
        && regime.uiExposure === 'visible'
        && regime.deadlineDefinitionIds.length > 0,
      presentationStatus: presentationStatus(regime)
    }));
}

export function specialSelection(
  data: CalculationData,
  profileId: string,
  regimeId: string,
  definitionId: string
): SpecialSelection {
  const catalog = specialCatalogForProfile(data, profileId);
  const regime = specialRegimeOptions(data, profileId)
    .find(option => option.selectable && option.regime.regimeId === regimeId)?.regime;
  const definition = regime
    ? catalog?.deadlineDefinitions.find(item => item.deadlineDefinitionId === definitionId
      && regime.deadlineDefinitionIds.includes(item.deadlineDefinitionId))
    : undefined;
  return { catalog, regime, definition };
}

export function reconcileSpecialSelection(
  data: CalculationData,
  profileId: string,
  regimeId: string,
  definitionId: string
): { readonly regimeId: string; readonly definitionId: string } {
  const options = specialRegimeOptions(data, profileId);
  const regime = options.find(option => option.selectable && option.regime.regimeId === regimeId)?.regime;
  if (!regime) return { regimeId: '', definitionId: '' };
  const selectedDefinitionId = regime.deadlineDefinitionIds.includes(definitionId)
    ? definitionId
    : regime.deadlineDefinitionIds[0] ?? '';
  return { regimeId: regime.regimeId, definitionId: selectedDefinitionId };
}

export function isGeneralCalculation(data: CalculationData, state: CalculatorFormState): boolean {
  return !specialCatalogForProfile(data, state.profileId)
    || state.specialRegimeId === GENERAL_SPECIAL_REGIME_ID;
}

export function effectiveSelectors(
  data: CalculationData,
  state: CalculatorFormState
): Readonly<Record<string, string>> {
  if (!specialCatalogForProfile(data, state.profileId)) return state.selectors;
  return {
    ...state.selectors,
    specialLawStatus: state.specialRegimeId === GENERAL_SPECIAL_REGIME_ID
      ? 'noKnownOverride'
      : 'knownOverride'
  };
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
  const selectors = Object.fromEntries(
    Object.entries(effectiveSelectors(data, state)).filter(([, value]) => value !== '')
  );
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

export function createSpecialCalculationInput(
  data: CalculationData,
  state: CalculatorFormState
): SpecialDeadlineInput | undefined {
  const selection = specialSelection(
    data,
    state.profileId,
    state.specialRegimeId,
    state.specialDefinitionId
  );
  const definition = selection.definition;
  const regime = selection.regime;
  if (!selection.catalog || !regime || !definition || definition.deadlineOrigin !== 'CALCULATED') {
    return undefined;
  }
  const calculated = definition as CalculatedDeadlineDefinition;
  const integerValues = Object.fromEntries(
    Object.entries(state.specialIntegerValues)
      .filter(([, value]) => value !== '')
      .map(([key, value]) => [key, Number(value)])
  );
  return {
    profileId: state.profileId,
    regimeId: regime.regimeId,
    ruleId: definition.deadlineDefinitionId,
    dateValues: state.specialDateValues,
    localTimeValues: state.specialLocalTimeValues,
    integerValues,
    calendarProfileId: regime.calendarProfileId ?? calculated.resultPolicy.calendarProfileId,
    suspensionProfileId: regime.suspensionProfileId ?? calculated.resultPolicy.suspensionProfileId,
    filingProfileId: regime.filingProfileId ?? definition.filingProfileId,
    overrideConfirmations: state.specialOverrideConfirmations
  };
}

export function requiresDeliveryFictionConfirmation(selectors: Readonly<Record<string, string>>): boolean {
  return inputDateSemantics(selectors) !== 'legallyRelevantDeliveryOrEventDate';
}
