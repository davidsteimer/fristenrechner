// SPDX-License-Identifier: AGPL-3.0-only
import schema from '../../schemas/implementation/ap23d1/administrative-procedure-catalog.schema.json';
import { addCalendarDays, parseIsoDate } from './date';
import { calculateGregorianEaster } from './generateCalendar';
import { assertSchema } from './schemaContract';
import { canonicalSocialJson, socialObjectSha256 } from './socialCatalog';
import type { AdministrativeComponentRef, AdministrativeInterval, AdministrativePeriodExpression,
  AdministrativeProcedureCatalog, AdministrativeSourceRef } from './administrativeTypes';

export class AdministrativeCatalogError extends Error {
  constructor(message: string) { super(message); this.name = 'AdministrativeCatalogError'; Object.setPrototypeOf(this, AdministrativeCatalogError.prototype); }
}
function fail(message: string): never { throw new AdministrativeCatalogError(message); }
function identical(a: unknown, b: unknown, label: string): void {
  if (canonicalSocialJson(a) !== canonicalSocialJson(b)) fail(label);
}
function unique<T>(items: readonly T[], key: (item: T) => string, label: string): Map<string, T> {
  const map = new Map(items.map(item => [key(item), item]));
  if (map.size !== items.length) fail(`Duplicate ${label}`);
  return map;
}
function equalIds(a: readonly string[], b: readonly string[], label: string): void {
  if (new Set(a).size !== a.length || new Set(b).size !== b.length) fail(`Duplicate ${label}`);
  identical([...a].sort(), [...b].sort(), label);
}
function interval(value: AdministrativeInterval): void {
  if (!parseIsoDate(value.from) || (value.to !== null && (!parseIsoDate(value.to) || value.from > value.to))) fail('Invalid or reversed temporal interval');
}
export function administrativeIntervalContains(value: AdministrativeInterval, date: string): boolean {
  return !!parseIsoDate(date) && value.from <= date && (value.to === null || date <= value.to);
}
function encloses(outer: AdministrativeInterval, inner: AdministrativeInterval): boolean {
  return outer.from <= inner.from && (outer.to === null || (inner.to !== null && inner.to <= outer.to));
}
function canonicalPath(value: string): void {
  if (value.startsWith('/') || value.includes('\\') || value.split('/').some(part => !part || part === '.' || part === '..')) fail('Non-canonical relative path');
}

/** Shared civil-date generator. No host time zone or permissive Date rollover. */
export function administrativePeriodDate(expression: AdministrativePeriodExpression, baseYear: number): string {
  if (!Number.isSafeInteger(baseYear) || baseYear < 1583 || baseYear > 9998) return fail('Unsupported administrative Gregorian year');
  if (expression.type === 'easterOffset') return addCalendarDays(calculateGregorianEaster(baseYear), expression.days);
  const date = `${baseYear + expression.yearOffset}-${String(expression.month).padStart(2, '0')}-${String(expression.day).padStart(2, '0')}`;
  if (!parseIsoDate(date)) return fail('Impossible suspension date');
  return date;
}

/** Closed data validation, not an approval, release capability or runtime token. */
export function assertAdministrativeProcedureCatalog(value: unknown): asserts value is AdministrativeProcedureCatalog {
  try { assertSchema(value, schema); }
  catch (error) { return fail(`Administrative schema: ${error instanceof Error ? error.message : String(error)}`); }
  const catalog = value as AdministrativeProcedureCatalog;
  const sources = unique(catalog.sources, source => source.sourceId, 'source ID');
  const laws = unique(catalog.laws, law => law.lawId, 'law ID');
  const profiles = unique(catalog.suspensionProfiles, profile => profile.suspensionProfileId, 'suspension ID');
  const holidays = unique(catalog.holidayBindings, binding => binding.holidayBindingId, 'holiday binding ID');
  const paths = unique(catalog.paths, path => path.pathId, 'path ID');
  unique(catalog.excludedPaths, row => row.exclusionId, 'exclusion ID');
  unique(catalog.projectDecisions, row => row.decisionId, 'project decision');
  unique(catalog.preserved, row => row.path, 'preserved path');
  catalog.preserved.forEach(row => canonicalPath(row.path));
  function refs(rows: readonly AdministrativeSourceRef[]): void {
    unique(rows, canonicalSocialJson, 'source reference');
    if (rows.some(ref => !sources.has(ref.sourceId) || !ref.locator.trim())) fail('Unknown source or empty locator');
  }
  for (const source of catalog.sources) {
    if (!source.versionDescription.trim() || !source.reviewBasis.trim() || !source.locators.trim()) fail('Blank source evidence');
    if (source.reviewedOn > catalog.review.checkedOn) fail('Source review later than catalog review');
  }
  if (!catalog.review.basis.trim() || !catalog.review.sourceReview.trim()) fail('Blank catalog review');
  for (const law of catalog.laws) {
    if (!law.title.trim()) fail('Blank law title');
    refs(law.sourceRefs); refs(law.holidayPolicyReview.sourceRefs);
  }
  for (const profile of catalog.suspensionProfiles) {
    if (!laws.has(profile.lawId)) fail('Unknown suspension law');
    refs(profile.sourceRefs);
    unique(profile.periods, period => period.periodId, 'period ID');
    // Check a full Gregorian leap-year cycle, including both adjacent winters.
    // Easter expressions are bounded to +/-7 days by the closed schema.
    for (let year = 2000; year < 2400; year += 1) {
      const spans: { from: string; to: string }[] = [];
      for (const period of profile.periods) {
        if (period.start.yearOffset !== 0) fail('Suspension must start in its base year');
        for (const baseYear of [year - 1, year]) {
          const from = administrativePeriodDate(period.start, baseYear), to = administrativePeriodDate(period.end, baseYear);
          if (from > to || parseIsoDate(to)!.ordinal - parseIsoDate(from)!.ordinal >= 366) fail('Reversed or excessive suspension');
          spans.push({ from, to });
        }
      }
      spans.sort((a, b) => a.from.localeCompare(b.from));
      for (let index = 1; index < spans.length; index += 1) if (spans[index]!.from <= spans[index - 1]!.to) fail('Overlapping suspension periods');
    }
  }
  const baselineRefs = new Map<string, AdministrativeComponentRef>();
  for (const binding of catalog.holidayBindings) {
    const law = laws.get(binding.lawId);
    if (!law || law.canton !== binding.authoritySeatCanton) fail('Holiday law/canton mismatch');
    refs(binding.legalBinding.sourceRefs);
    const physical = binding.physicalBaseline;
    const physicalRefs = unique(physical.references, ref => ref.contentId, 'physical component ID');
    equalIds([...physicalRefs.keys()], [physical.calendarId, 'ch-federal-calendar', 'ch-holiday-catalog'], 'Physical component inventory');
    for (const ref of physical.references) {
      canonicalPath(ref.path);
      const expectedRole = ref.contentId === 'ch-holiday-catalog' ? 'holidayCatalog' : 'calendar';
      if (ref.role !== expectedRole) fail('Physical component role mismatch');
      const existing = baselineRefs.get(ref.contentId);
      if (existing) identical(existing, ref, 'Conflicting physical reference');
      baselineRefs.set(ref.contentId, ref);
    }
  }
  for (const path of catalog.paths) {
    const law = laws.get(path.lawId), profile = profiles.get(path.suspensionProfileId), holiday = holidays.get(path.holidayBindingId);
    if (!law || !profile || !holiday || profile.lawId !== path.lawId || holiday.lawId !== path.lawId) fail('Unresolved or foreign path component');
    refs(path.sourceRefs);
    if (!path.researchRef.trim()) fail('Blank research reference');
    if (path.urgencyPolicy === 'explicitGRJudicialUrgencyOrder'
      && (law.canton !== 'GR' || path.stages.length !== 1 || path.stages[0] !== 'court' || !profile.periods.length)) fail('GR urgency outside judicial suspension context');
    if (path.endShiftGuard === 'blockWhenEnteringApplicableSuspension' && !profile.periods.length) fail('Suspension guard without suspension');
    const temporal = path.temporalBinding;
    for (const coverage of [temporal.caseCoverage, temporal.calculationCoverage, temporal.sourceCoverage, temporal.normVersionCoverage]) interval(coverage);
    if (!encloses(temporal.calculationCoverage, temporal.caseCoverage)
      || !encloses(temporal.sourceCoverage, temporal.calculationCoverage)
      || !encloses(temporal.normVersionCoverage, temporal.calculationCoverage)) fail('Temporal coverage not nested');
    if (Number(temporal.calculationCoverage.from.slice(0, 4)) < 1584 || Number(temporal.calculationCoverage.to.slice(0, 4)) > 9998) fail('Unsupported calculation year');
  }
  const release = catalog.releaseBinding;
  const eligibility = unique(release.pathEligibility, entry => entry.pathId, 'path eligibility');
  equalIds([...eligibility.keys()], [...paths.keys()], 'Complete path eligibility required');
  const targetRefs = unique(release.targetComponentRefs, ref => ref.contentId, 'target component');
  if (release.status !== 'candidate') {
    equalIds([...targetRefs.keys()], [...baselineRefs.keys()], 'Release target inventory');
    for (const ref of release.targetComponentRefs) if (ref.role !== baselineRefs.get(ref.contentId)!.role) fail('Release target role mismatch');
    if (!release.approval || !release.approval.approvedBy.trim() || !release.approval.decisionRef.trim()
      || catalog.contractDecision.on === null || catalog.contractDecision.on > release.approval.approvedOn
      || catalog.review.checkedOn > release.approval.approvedOn) fail('Unqualified release approval');
  }
  for (const path of paths.values()) {
    const entry = eligibility.get(path.pathId)!, holiday = holidays.get(path.holidayBindingId)!, profile = profiles.get(path.suspensionProfileId)!;
    if (entry.status !== release.status || entry.pathRevision !== path.revision) fail('Path status or revision mismatch');
    if (entry.pathSha256 !== socialObjectSha256(path) || entry.holidayBindingSha256 !== socialObjectSha256(holiday)
      || entry.suspensionProfileSha256 !== socialObjectSha256(profile)) fail('Path definition hash mismatch');
    if (entry.holidayBindingId !== path.holidayBindingId || entry.suspensionProfileId !== path.suspensionProfileId) fail('Path eligibility component mismatch');
    identical(entry.caseCoverage, path.temporalBinding.caseCoverage, 'Path case coverage mismatch');
    identical(entry.calculationCoverage, path.temporalBinding.calculationCoverage, 'Path calculation coverage mismatch');
    identical(entry.sourceReviewRef, release.sourceReviewRef, 'Path source-review evidence mismatch');
    identical(entry.referenceSuiteRef, release.referenceSuiteRef, 'Path reference-suite evidence mismatch');
    const refsById = unique(entry.targetComponentRefs, ref => ref.contentId, 'path target component');
    if (release.status !== 'candidate') {
      equalIds([...refsById.keys()], holiday.physicalBaseline.references.map(ref => ref.contentId), 'Path target inventory');
      entry.targetComponentRefs.forEach(ref => identical(ref, targetRefs.get(ref.contentId), 'Path target bytes mismatch'));
    }
  }
}

export interface AdministrativeReleaseContext {
  readonly releaseId: string;
  /** Exactly the referenced union, obtained from already length/hash-checked files. */
  readonly componentRefs: readonly AdministrativeComponentRef[];
  readonly mode: 'approved' | 'localReference';
}
/** Bind to the actual verified release. Still does not create runtime authority. */
export function validateAdministrativeReleaseBindings(catalog: AdministrativeProcedureCatalog, context: AdministrativeReleaseContext): void {
  assertAdministrativeProcedureCatalog(catalog);
  const actual = unique(context.componentRefs, ref => ref.contentId, 'actual component');
  const expected = new Map(catalog.holidayBindings.flatMap(binding => binding.physicalBaseline.references.map(ref => [ref.contentId, ref] as const)));
  equalIds([...actual.keys()], [...expected.keys()], 'Actual administrative component inventory');
  for (const [id, ref] of actual) if (ref.role !== expected.get(id)!.role || !/^[a-f0-9]{64}$/.test(ref.sha256)) fail('Actual component role/hash invalid');
  if (context.mode === 'localReference') {
    if (catalog.contractStatus === 'withdrawn' || catalog.releaseBinding.status !== 'candidate') fail('Local reference requires non-withdrawn candidate catalog');
    return;
  }
  if (context.mode !== 'approved' || catalog.contractStatus !== 'approved' || catalog.releaseBinding.status !== 'approved'
    || catalog.releaseBinding.releaseId !== context.releaseId) fail('Administrative release not approved or mismatched');
  for (const ref of catalog.releaseBinding.targetComponentRefs) identical(ref, actual.get(ref.contentId), 'Actual release component hash mismatch');
}
