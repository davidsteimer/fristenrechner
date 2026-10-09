// SPDX-License-Identifier: AGPL-3.0-only
import { calculateSpecialDeadline } from './calculateSpecialDeadline';
import { addCalendarDays, parseIsoDate } from './date';
import { canonicalSocialJson, SOCIAL_CANTONS, SOCIAL_FACT_KEYS, SOCIAL_V2_ADDITIONAL_LAWS, socialFactValid, socialIntervalContains, validateSocialCatalogReferences } from './socialCatalog';
import type { SocialCatalogFormat, SocialDeadlineInput, SocialDeadlineResult, SocialInterval, SocialNormBinding, SocialResolution } from './socialTypes';
import type { CalculationData } from './types';
import type { SpecialRegimeCatalog, SpecialSourceReference } from './specialTypes';

function blocked(reason: string): SocialResolution { return {outcome: 'blocked', blockReasonKeys: [reason]}; }
function own(value: object, key: string): boolean { return Object.prototype.hasOwnProperty.call(value, key); }
function closed(value: unknown, required: readonly string[], optional: readonly string[] = []): boolean {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && required.every(key => own(value, key)) && Object.keys(value).every(key => required.includes(key) || optional.includes(key));
}
function validInput(input: SocialDeadlineInput, format: SocialCatalogFormat): boolean {
  if (!closed(input, ['ruleId','bindingId','contextRouteId','procedureContextCanton','caseFacts','qualificationBasis','matter','triggerKind','notificationChannel','notificationConfirmed','legalTriggerDate','holidayResolution'], ['authoritySeat','procedureStartDate','jurisdictionReferenceDate','days'])) return false;
  if (['ruleId','bindingId','contextRouteId','procedureContextCanton','matter','triggerKind','legalTriggerDate'].some(key => typeof (input as unknown as Record<string, unknown>)[key] !== 'string')) return false;
  if (!SOCIAL_CANTONS.includes(input.procedureContextCanton) || !parseIsoDate(input.legalTriggerDate)) return false;
  if (!['confirmed-case-facts','displayed-model-scope'].includes(input.qualificationBasis) || typeof input.notificationConfirmed !== 'boolean') return false;
  if (!closed(input.caseFacts, [], SOCIAL_FACT_KEYS) || !Object.keys(input.caseFacts).every(key => socialFactValid(key, input.caseFacts[key as keyof typeof input.caseFacts], format))) return false;
  if (own(input, 'authoritySeat')) {
    const seat = input.authoritySeat;
    if (!closed(seat, ['country','canton']) || !seat || !/^[A-Z]{2}$/.test(seat.country) || (seat.country === 'CH' ? !SOCIAL_CANTONS.includes(seat.canton ?? '') : seat.canton !== null)) return false;
  }
  if (['procedureStartDate','jurisdictionReferenceDate'].some(key => own(input, key) && (typeof input[key as 'procedureStartDate'] !== 'string' || !parseIsoDate(input[key as 'procedureStartDate']!)))) return false;
  const h = input.holidayResolution;
  if (!closed(h, ['status','anchors','calendarBindingId']) || !['resolved','unknown','conflict'].includes(h.status) || !Array.isArray(h.anchors) || typeof h.calendarBindingId !== 'string') return false;
  if (!h.anchors.every(a => closed(a, ['role','canton','spatialScopeId']) && ['party','representative'].includes(a.role) && SOCIAL_CANTONS.includes(a.canton) && typeof a.spatialScopeId === 'string' && !!a.spatialScopeId)) return false;
  return new Set(h.anchors.map(a => a.role)).size === h.anchors.length;
}
function normGroups(norms: readonly SocialNormBinding[]): readonly (readonly SocialNormBinding[])[] {
  const groups = new Map<string, SocialNormBinding[]>();
  norms.forEach(n => { const key = `${n.sourceId}\n${n.locator}\n${n.temporalSelector}`; const group = groups.get(key) ?? []; if (!group.some(existing => canonicalSocialJson(existing) === canonicalSocialJson(n))) group.push(n); groups.set(key, group); });
  return [...groups.values()];
}
function timeReason(input: SocialDeadlineInput, norms: readonly SocialNormBinding[], optionalDates = false): string | undefined {
  const selectors = new Set(norms.map(n => n.temporalSelector));
  for (const key of ['procedureStartDate','jurisdictionReferenceDate'] as const) {
    if (selectors.has(key) ? !own(input, key) : (!optionalDates && own(input, key))) return 'context-unresolved';
    if (key === 'procedureStartDate' && input[key] && input[key]! > input.legalTriggerDate) return 'context-unresolved';
  }
  for (const group of normGroups(norms)) {
    const at = input[group[0]!.temporalSelector];
    const applicable = group.filter(n => at && n.applicableFrom !== null && n.applicableFrom <= at && (n.applicableTo === null || at <= n.applicableTo));
    if (applicable.length !== 1 || applicable[0]!.verification !== 'verified') return 'source-gap';
  }
  return undefined;
}

/** A complete, fail-closed resolver shared by all hosts. Candidate data never calculate. */
export function resolveSocialDeadline(input: SocialDeadlineInput, data: CalculationData): SocialResolution {
  try {
    if (!validInput(input, data.formatVersion === '6.0.0' ? '2.0.0' : '1.0.0')) return blocked('input-contract-invalid');
    const catalogs = [...(data.socialProcedureCatalogs?.values() ?? [])];
    if (catalogs.length !== 1 || !['5.0.0','6.0.0'].includes(data.formatVersion)) return blocked('unknown-rule');
    const catalog = catalogs[0]!;
    validateSocialCatalogReferences(catalog, data);
    const candidates = catalog.federalRules.filter(r => r.ruleId === input.ruleId && socialIntervalContains(r.caseCoverage, input.legalTriggerDate));
    if (candidates.length !== 1) return blocked(catalog.federalRules.some(r => r.ruleId === input.ruleId) ? 'outside-case-coverage' : 'unknown-rule');
    const rule = candidates[0]!;
    if (rule.matter !== input.matter) return blocked('wrong-matter');
    if (rule.triggerKind !== input.triggerKind) return blocked('wrong-trigger');
    if (!rule.notificationChannels.includes(input.notificationChannel)) return blocked('unsupported-procedure');
    const displayed = input.qualificationBasis === 'displayed-model-scope' && rule.notificationChannels.length === 1;
    if (!input.notificationConfirmed && !displayed) return blocked('context-unresolved');
    const bindings = catalog.cantonalBindings.filter(b => b.bindingId === input.bindingId && b.ruleId === rule.ruleId && b.ruleRevision === rule.revision && socialIntervalContains(b.caseCoverage, input.legalTriggerDate));
    if (bindings.length !== 1) return blocked('context-unresolved');
    const binding = bindings[0]!;
    if (binding.procedureContextCanton !== input.procedureContextCanton) return blocked('context-unresolved');
    if (catalog.excludedPaths.some(e => e.law === rule.law && e.matter === input.matter && e.action === rule.action)) return blocked('unsupported-procedure');
    const routes = binding.contextRoutes.filter(route => route.requiredFacts.length === Object.keys(input.caseFacts).length
      && route.requiredFacts.every(f => own(input.caseFacts, f.factKey) && f.allowedValues.includes(input.caseFacts[f.factKey]!)));
    if (routes.length !== 1 || routes[0]!.contextRouteId !== input.contextRouteId) return blocked('context-unresolved');
    const route = routes[0]!;
    const expandedDateContract = catalog.formatVersion === '2.0.0' && SOCIAL_V2_ADDITIONAL_LAWS.includes(rule.law);
    const time = timeReason(input, [...rule.normBindings, ...binding.normBindings], expandedDateContract);
    if (time) return blocked(time);
    if (expandedDateContract && [input.procedureStartDate, input.jurisdictionReferenceDate].some(date => date
      && [rule,binding].some(record => !socialIntervalContains(record.sourceCoverage, date)))) return blocked('source-gap');
    // A correction order presupposes a complaint already filed. By contrast,
    // the ordinary appeal route may qualify jurisdiction at a later filing date.
    // AVIG fund routes refer to an existing disposition or an independently
    // qualified current jurisdiction, never to a hypothetical future date.
    if ((rule.action === 'complaint-correction' || rule.law === 'avig') && input.jurisdictionReferenceDate
      && input.jurisdictionReferenceDate > input.legalTriggerDate) return blocked('context-unresolved');
    if ([rule,binding].some(r => !socialIntervalContains(r.sourceCoverage, input.legalTriggerDate))) return blocked('source-gap');
    const holiday = input.holidayResolution;
    if (holiday.status !== 'resolved' || holiday.anchors.length === 0) return blocked('holiday-unresolved');
    const calendarBinding = binding.calendarBindings.find(c => c.calendarBindingId === holiday.calendarBindingId);
    if (!calendarBinding) return blocked('calendar-not-released');
    if (!calendarBinding.requiredAnchorRoles.every(role => holiday.anchors.some(a => a.role === role))
      || holiday.anchors.some(a => a.canton !== calendarBinding.holidayCanton || a.spatialScopeId !== calendarBinding.spatialScopeId)) return blocked('holiday-unresolved');
    if (rule.calculation.duration ? own(input, 'days') : (!Number.isInteger(input.days) || typeof input.days !== 'number' || input.days < 1 || input.days > 365)) return blocked('unsupported-procedure');
    const approvals = catalog.releaseEligibility.filter(e => e.status === 'approved' && e.ruleRef.ruleId === rule.ruleId && e.ruleRef.revision === rule.revision && e.bindingRef.bindingId === binding.bindingId && e.bindingRef.revision === binding.revision && e.contextRouteIds.includes(route.contextRouteId) && e.calendarBindingIds.includes(calendarBinding.calendarBindingId) && socialIntervalContains(e.caseCoverage, input.legalTriggerDate));
    if (rule.status !== 'reviewed' || binding.status !== 'reviewed' || approvals.length !== 1) return blocked('not-released');
    const eligibility = approvals[0]!;
    if ([rule,binding].some(r => !r.legalValidity || !socialIntervalContains(r.legalValidity, input.legalTriggerDate))) return blocked('source-gap');
    if (!socialIntervalContains(data.coverage, input.legalTriggerDate)) return blocked('outside-case-coverage');
    return {outcome: 'resolved', catalog, rule, binding, route, calendarBinding, eligibility, days: rule.calculation.duration?.value ?? input.days!};
  } catch { return blocked('data-contract-invalid'); }
}

function blockedResult(reasons: readonly string[]): SocialDeadlineResult {
  return {outcome: 'blocked', appliedRuleIds: [], appliedOverrideIds: [], gateResults: [], warningKeys: [], blockReasonKeys: reasons, trace: [{sequence: 1, operation: 'blockCalculation', ruleIds: [], reasonKeys: reasons}]};
}
function uniqueRefs(refs: readonly SpecialSourceReference[]): SpecialSourceReference[] {
  return refs.filter((r, i) => refs.findIndex(other => other.sourceId === r.sourceId && other.locator === r.locator) === i);
}

/** Only the existing day arithmetic is reused. No fabricated AP17 qualification. */
export function calculateSocialDeadline(input: SocialDeadlineInput, data: CalculationData): SocialDeadlineResult {
  const resolution = resolveSocialDeadline(input, data);
  if (resolution.outcome === 'blocked') return blockedResult(resolution.blockReasonKeys);
  const {catalog, rule, binding, route, calendarBinding, eligibility} = resolution;
  const intervals: SocialInterval[] = [data.coverage, eligibility.calculationCoverage, rule.sourceCoverage, binding.sourceCoverage, rule.legalValidity!, binding.legalValidity!];
  for (const group of normGroups([...rule.normBindings, ...binding.normBindings])) {
    if (group[0]!.temporalSelector !== 'legalTriggerDate') continue;
    const selected = group.find(n => n.applicableFrom !== null && n.applicableFrom <= input.legalTriggerDate && (n.applicableTo === null || input.legalTriggerDate <= n.applicableTo))!;
    intervals.push({from: selected.applicableFrom!, to: selected.applicableTo});
  }
  const from = intervals.map(v => v.from).sort().slice(-1)[0]!;
  const ends = intervals.map(v => v.to).filter((v): v is string => v !== null).sort();
  const to = ends[0] ?? null;
  if ((to && from > to) || !socialIntervalContains({from,to}, addCalendarDays(input.legalTriggerDate, 1))) return blockedResult(['outside-calculation-coverage']);
  const sourceRefs = uniqueRefs([...rule.sourceRefs, ...binding.sourceRefs, ...binding.supplementaryLawRefs, ...route.sourceRefs, ...calendarBinding.sourceRefs]);
  const definitionId = rule.ruleId;
  const calendarProfileId = `social-${calendarBinding.calendarBindingId}`;
  const adapter: SpecialRegimeCatalog = {
    dataKind: 'specialRegimeCatalog', formatVersion: '2.0.0', catalogId: catalog.catalogId, profileId: binding.entryProfileId,
    validity: {dataValidFrom: from, dataValidTo: to}, calendarProfiles: [{calendarProfileId, calendarId: calendarBinding.calendarId, holidayAnchor: rule.holidayPolicy, endShiftPolicy: rule.endShiftPolicy, labels: rule.labels}],
    suspensionProfiles: catalog.suspensionProfiles, filingProfiles: catalog.filingProfiles, gates: [], legalOverrides: [],
    deadlineDefinitions: [{deadlineDefinitionId: definitionId, deadlineOrigin: 'CALCULATED', status: 'supported', validity: {dataValidFrom: from, dataValidTo: to}, anchors: [{inputId: 'legalTriggerDate', role: 'trigger', valueType: 'date', labelKey: 'legalTriggerDate'}], calculation: rule.calculation, resultPolicy: {calendarProfileId, suspensionProfileId: rule.suspensionProfileId, endShiftPolicy: rule.endShiftPolicy, strictFixedDate: false}, filingProfileId: rule.filingProfileId, gateIds: [], legalOverrideIds: [], sourceRefs}],
    regimes: [{regimeId: rule.ruleId, level: 'federal', lawCode: rule.law, provision: sourceRefs.map(r => r.locator).join(', '), labels: rule.labels, status: 'supported', statusReasonKey: 'socialEligibilityVerified', deadlineDefinitionIds: [definitionId], filingProfileId: rule.filingProfileId, calendarProfileId, suspensionProfileId: rule.suspensionProfileId, gateIds: [], legalOverrideIds: [], implementationScope: 'followup', uiExposure: 'hidden', sourceRefs}]
  };
  const scopedData: CalculationData = {...data, coverage: {from,to}, specialRegimeCatalogs: new Map([[adapter.catalogId, adapter]])};
  const result = calculateSpecialDeadline({profileId: binding.entryProfileId, regimeId: rule.ruleId, ruleId: definitionId, dateValues: {legalTriggerDate: input.legalTriggerDate}, localTimeValues: {}, integerValues: rule.calculation.durationInputId ? {deadlineDays: resolution.days} : {}, calendarProfileId, suspensionProfileId: rule.suspensionProfileId, filingProfileId: rule.filingProfileId, overrideConfirmations: []}, scopedData);
  if (result.outcome === 'blocked') return blockedResult(result.blockReasonKeys.map(reason => reason === 'dataCoverageExceeded' ? 'outside-calculation-coverage' : reason));
  if (!socialIntervalContains({from,to}, result.finalDeadline.date)) return blockedResult(['outside-calculation-coverage']);
  return {...result, socialEvidence: {ruleId: rule.ruleId, ruleRevision: rule.revision, bindingId: binding.bindingId, bindingRevision: binding.revision, contextRouteId: route.contextRouteId, eligibilityId: eligibility.eligibilityId, calendarId: calendarBinding.calendarId, spatialScopeId: calendarBinding.spatialScopeId, releaseId: data.releaseId, sourceRefs}};
}
