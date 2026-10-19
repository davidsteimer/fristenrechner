// SPDX-License-Identifier: AGPL-3.0-only
import { calculateRuntimeDeadline } from './calculateDeadline';
import { assertActivatedCalendarProjection, activatedRuleId } from './holidayActivation';
import { parseIsoDate } from './date';
import { canonicalSocialJson } from './socialCatalog';
import { resolveBoundCalendar, unresolvedCalendar } from './calendarResolution';
import { FORMAT7_LEGACY_CALENDAR_BASELINE } from './format7Baseline';
import { trustedFormat7Runtime, withQualifiedCalendarPath } from './format7Runtime';
import { trustedFormat8Runtime, withFormat8CalculationScope } from './format8Runtime';
import type { BoundCalendarRuntime, CalendarContext, CalendarResolution } from './calendarResolution';
import type { CalendarProjectionRecipe } from './holidayActivationTypes';
import type { CalendarRuleSet, CalendarRuleValidity } from './calendarRuleTypes';
import type { CalculatedDeadlineResult, CalculationData, CalculationInput, CalculationResult, LegalProfile } from './types';

export interface CalendarLegalOutcome {
  readonly legallyRelevantDate: string;
  readonly deadlineStart: string;
  readonly provisionalEnd: string;
  readonly finalEnd: string;
}
export interface JanuaryComparison {
  readonly outcome: 'same' | 'different' | 'blocked';
  readonly variedCatalogRuleIds: readonly string[];
  readonly withoutJanuary2?: CalendarLegalOutcome;
  readonly withJanuary2?: CalendarLegalOutcome;
}
export type CalendarBoundDeadlineResult = CalculationResult & {
  readonly calendarResolution: CalendarResolution;
  readonly referenceOnly: boolean;
  readonly calendarExportAllowed: boolean;
  readonly januaryComparison?: JanuaryComparison;
};
const legalOutcome = (result: CalculatedDeadlineResult): CalendarLegalOutcome => ({
  legallyRelevantDate: result.legallyRelevantDate, deadlineStart: result.deadlineStart,
  provisionalEnd: result.provisionalEnd, finalEnd: result.finalEnd
});
function block(input: CalculationInput, resolution: CalendarResolution, referenceOnly: boolean, reason: string, comparison?: JanuaryComparison): CalendarBoundDeadlineResult {
  return {
    outcome: 'blocked', suspension: { enabled: false, periodIds: [], skippedCalendarDays: 0 },
    endShift: { applied: false, reasonKeys: [], holidayIds: [] }, appliedRuleIds: [],
    warningKeys: resolution.boundaryIds, blockReasonKeys: [reason],
    trace: [{ sequence: 1, operation: 'blockCalculation', ...(parseIsoDate(input.inputDate) ? { inputDate: input.inputDate } : {}),
      ruleIds: resolution.binding ? [resolution.binding.id] : [], reasonKeys: [reason] }],
    calendarResolution: unresolvedCalendar(resolution.context, reason, resolution), referenceOnly, calendarExportAllowed: false,
    ...(comparison ? { januaryComparison: comparison } : {})
  };
}
function intersects(intervals: readonly CalendarRuleValidity[]): CalendarRuleValidity | null {
  if (intervals.some(value => !parseIsoDate(value.from) || (value.to !== null && (!parseIsoDate(value.to) || value.to < value.from)))) return null;
  const from = intervals.map(value => value.from).sort().at(-1)!;
  const to = intervals.flatMap(value => value.to === null ? [] : [value.to]).sort()[0] ?? null;
  return to !== null && from > to ? null : { from, to };
}
function profileInterval(profile: LegalProfile): CalendarRuleValidity {
  return { from: [profile.validity.dataValidFrom, profile.validity.legalEffectiveFrom ?? '0001-01-01'].sort().at(-1)!, to: profile.validity.dataValidTo };
}

/** Every interval constrains the entire used path, including days without a holiday. */
function pathCoverage(runtime: BoundCalendarRuntime, resolution: CalendarResolution, recipe: CalendarProjectionRecipe, data: CalculationData, profile: LegalProfile): CalendarRuleValidity | null {
  const binding = resolution.binding!;
  const intervals: CalendarRuleValidity[] = [data.coverage, binding.caseCoverage, profileInterval(profile)];
  const scopes = new Set([...recipe.scopeIds, ...binding.requiredAreaScopeIds]);
  for (const id of scopes) {
    const scope = runtime.catalog.data.scopes.find(value => value.id === id);
    const supplemental = runtime.catalog.activation.supplementalScopes.find(value => value.id === id);
    if (!scope && !supplemental) return null;
    intervals.push(scope ? { from: scope.from, to: scope.to } : supplemental!.legalValidity);
    // Explicit membership/nonmembership uses the described region as a whole.
    // Once any bound territorial description changes, qualification is renewed.
    const assignments = runtime.catalog.data.assignments.filter(value => value.scopeId === id);
    if (!supplemental && assignments.length === 0) return null;
    assignments.forEach(value => intervals.push({ from: value.from, to: value.to }));
  }
  for (const id of recipe.ruleIds) {
    const rule = runtime.catalog.data.rules.find(value => value.id === id);
    const supplemental = runtime.catalog.activation.supplementalRules.find(value => value.id === id);
    if (!rule && !supplemental) return null;
    intervals.push(rule ? { from: rule.from, to: rule.to } : supplemental!.legalValidity);
  }
  const visited = new Set<string>();
  function calendarIntervals(id: string): boolean {
    if (visited.has(id)) return false;
    visited.add(id);
    const calendar = runtime.calendars.find(value => value.calendarId === id);
    if (!calendar) return false;
    intervals.push(calendar.validity);
    // Suspension norm limits also bind the path. Calendar 3 has no holiday-only
    // permission to ignore a changed inherited procedural rule.
    calendar.rules.forEach(rule => intervals.push(rule.validity));
    return calendar.inherits.every(calendarIntervals);
  }
  if (!calendarIntervals(recipe.calendarId)) return null;
  return intersects(intervals);
}

function sameRuleSemantics(left: CalendarRuleSet, right: CalendarRuleSet, recipe: CalendarProjectionRecipe,
  alternative: CalendarProjectionRecipe, varied: readonly string[]): boolean {
  const addedIds = alternative.ruleIds.filter(id => !recipe.ruleIds.includes(id));
  if (canonicalSocialJson([...addedIds].sort()) !== canonicalSocialJson([...varied].sort())
    || recipe.ruleIds.some(id => !alternative.ruleIds.includes(id))) return false;
  for (const catalogId of recipe.ruleIds) {
    const first = left.rules.find(rule => rule.ruleId === activatedRuleId(catalogId, recipe));
    const second = right.rules.find(rule => rule.ruleId === activatedRuleId(catalogId, alternative));
    if (!first && !second && catalogId === 'CH-CAL-HOL-NATIONAL-DAY') continue;
    if (!first || !second) return false;
    const { ruleId: _firstId, calendarId: _firstCalendar, ...a } = first;
    const { ruleId: _secondId, calendarId: _secondCalendar, ...b } = second;
    if (canonicalSocialJson(a) !== canonicalSocialJson(b)) return false;
  }
  return canonicalSocialJson(left.inherits) === canonicalSocialJson(right.inherits);
}

function completePath(input: CalculationInput, data: CalculationData, runtime: BoundCalendarRuntime,
  resolution: CalendarResolution, recipe: CalendarProjectionRecipe): CalculationResult {
  const profile = data.profiles.get(input.profileId);
  if (!profile) return block(input, resolution, runtime.referenceOnly, 'unknownProfile');
  if (!parseIsoDate(input.inputDate)) return block(input, resolution, runtime.referenceOnly, 'invalidInputDate');
  const coverage = pathCoverage(runtime, resolution, recipe, data, profile);
  if (!coverage || input.inputDate < coverage.from
    || (coverage.to !== null && input.inputDate > coverage.to)) return block(input, resolution, runtime.referenceOnly, 'calendarBinding.outsideCoverage');
  const calendars = new Map(runtime.calendars.map(calendar => [calendar.calendarId, {
    dataKind: 'calendar' as const, formatVersion: calendar.formatVersion,
    calendarId: calendar.calendarId, jurisdiction: calendar.jurisdiction,
    coverage: { from: coverage.from, to: coverage.to ?? '9999-12-31' },
    inherits: calendar.inherits, holidays: [], suspensionSets: []
  }]));
  const boundData: CalculationData = {
    ...data, releaseId: runtime.releaseId, coverage, calendars,
    calendarRuleSets: new Map(runtime.calendars.map(calendar => [calendar.calendarId, calendar]))
  };
  const result = withFormat8CalculationScope(data, boundData, () => withQualifiedCalendarPath(boundData,
    () => calculateRuntimeDeadline({ ...input, calendarId: recipe.calendarId,
      holidayAnchorCandidates: [resolution.context.canton] }, boundData)));
  if (result.outcome !== 'calculated') return result;
  const from = input.inputDate < result.legallyRelevantDate ? input.inputDate : result.legallyRelevantDate;
  const until = result.finalEnd;
  const applied = new Set(result.appliedRuleIds);
  for (const rule of profile.rules) {
    const matches = rule.conditions.every(condition => condition.values.includes(input.selectors[condition.selector] ?? ''));
    const startsOn = [rule.validity.dataValidFrom, rule.validity.legalEffectiveFrom ?? '0001-01-01'].sort().at(-1)!;
    if (applied.has(rule.ruleId) && (startsOn > from || (rule.validity.dataValidTo !== null && rule.validity.dataValidTo < until))) {
      return block(input, resolution, runtime.referenceOnly, 'calendarBinding.profileRuleOutsideCoverage');
    }
    if (matches && !applied.has(rule.ruleId) && startsOn > from && startsOn <= until) {
      return block(input, resolution, runtime.referenceOnly, 'calendarBinding.profileRuleTransition');
    }
  }
  return result;
}

/** Existing deadline arithmetic, one qualified calendar, optionally two full paths. */
export function calculateCalendarBoundDeadline(input: CalculationInput, context: CalendarContext,
  data: CalculationData, runtime: BoundCalendarRuntime): CalendarBoundDeadlineResult {
  if (data.formatVersion === '7.0.0' && trustedFormat7Runtime(data) !== runtime) {
    return block(input, unresolvedCalendar(context, 'calendarBinding.invalidRuntime'), false, 'calendarBinding.invalidRuntime');
  }
  if (data.formatVersion === '8.0.0' && trustedFormat8Runtime(data) !== runtime) {
    return block(input, unresolvedCalendar(context, 'calendarBinding.invalidRuntime'), false, 'calendarBinding.invalidRuntime');
  }
  const resolution = resolveBoundCalendar(input.profileId, context, runtime);
  if (resolution.status === 'clarificationRequired' || !resolution.binding || !resolution.projection) {
    return block(input, resolution, runtime.referenceOnly === true, resolution.reasonKeys[0] ?? 'calendarBinding.bindingUnresolved');
  }
  if (!runtime.referenceOnly && runtime.releaseId !== data.releaseId) return block(input, resolution, false, 'calendarBinding.releaseMismatch');
  try {
    const legacy = ['7.0.0', '8.0.0'].includes(data.formatVersion) ? FORMAT7_LEGACY_CALENDAR_BASELINE
      : ['ch-federal-calendar', 'be-public-holidays'].map(id => data.calendarRuleSets.get(id));
    if (legacy.some(calendar => !calendar || calendar.formatVersion !== '2.0.0')) return block(input, resolution, runtime.referenceOnly, 'calendarBinding.baselineMissing');
    if (!['7.0.0', '8.0.0'].includes(data.formatVersion)) assertActivatedCalendarProjection(runtime.catalog, runtime.catalogSha256, runtime.calendars, legacy as CalendarRuleSet[]);
    const first = completePath(input, data, runtime, resolution, resolution.projection);
    let comparison: JanuaryComparison | undefined;
    if (resolution.alternativeProjection) {
      const varied = resolution.binding.ambiguity?.catalogRuleIds ?? [];
      const left = runtime.calendars.find(calendar => calendar.calendarId === resolution.projection!.calendarId)!;
      const right = runtime.calendars.find(calendar => calendar.calendarId === resolution.alternativeProjection!.calendarId)!;
      if (!sameRuleSemantics(left, right, resolution.projection, resolution.alternativeProjection, varied)) return block(input, resolution, runtime.referenceOnly, 'calendarBinding.invalidJanuaryPair');
      const second = completePath(input, data, runtime, resolution, resolution.alternativeProjection);
      comparison = { outcome: 'blocked', variedCatalogRuleIds: varied,
        ...(first.outcome === 'calculated' ? { withoutJanuary2: legalOutcome(first) } : {}),
        ...(second.outcome === 'calculated' ? { withJanuary2: legalOutcome(second) } : {}) };
      if (first.outcome !== 'calculated' || second.outcome !== 'calculated') return block(input, resolution, runtime.referenceOnly, 'calendarBinding.januaryPathBlocked', comparison);
      if (canonicalSocialJson(legalOutcome(first)) !== canonicalSocialJson(legalOutcome(second))) {
        return block(input, resolution, runtime.referenceOnly, 'calendarBinding.januaryClarificationRequired', { ...comparison, outcome: 'different' });
      }
      comparison = { ...comparison, outcome: 'same' };
    }
    return {
      ...first, calendarResolution: resolution, referenceOnly: runtime.referenceOnly,
      warningKeys: [...new Set([...first.warningKeys, ...resolution.boundaryIds])],
      calendarExportAllowed: first.outcome === 'calculated' && !runtime.referenceOnly,
      ...(comparison ? { januaryComparison: comparison } : {})
    };
  } catch {
    return block(input, resolution, runtime.referenceOnly, 'calendarBinding.invalidRuntime');
  }
}
