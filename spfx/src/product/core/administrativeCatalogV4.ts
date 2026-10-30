// SPDX-License-Identifier: AGPL-3.0-only
import schema from '../../schemas/administrative-procedure-catalog-v4.schema.json';
import { assertSchema } from './schemaContract';
import { AdministrativeCatalogError, assertAdministrativeCatalogStructure } from './administrativeCatalog';
import type { AdministrativeReleaseContext } from './administrativeCatalog';
import { canonicalSocialJson, socialObjectSha256 } from './socialCatalog';
import { ADMINISTRATIVE_V4_BASELINE } from './administrativeV4Baseline';
import type { AdministrativeProcedureCatalogV4, AdministrativePathV4 } from './administrativeTypesV4';

const fail = (message: string): never => { throw new AdministrativeCatalogError(message); };
const same = (left: unknown, right: unknown, message: string): void => {
  if (canonicalSocialJson(left) !== canonicalSocialJson(right)) fail(message);
};
function definitions(rows: readonly unknown[], id: string, expected: Readonly<Record<string, string>>): void {
  const values = new Map(rows.map(row => [String((row as Record<string, unknown>)[id]), row]));
  if (values.size !== rows.length) fail('Duplicate accepted v4 definition');
  same([...values.keys()].sort(), Object.keys(expected).sort(), 'Unaccepted v4 definition inventory');
  for (const [key, value] of values) if (socialObjectSha256(value) !== expected[key]) fail('Changed accepted v4 definition: ' + key);
}

/** Closed native V4 semantics. Historical branches retain their exact identities. */
export function assertAdministrativeProcedureCatalogV4(value: unknown): asserts value is AdministrativeProcedureCatalogV4 {
  try { assertSchema(value, schema); }
  catch (error) { return fail('Administrative v4 schema: ' + (error instanceof Error ? error.message : String(error))); }
  const c = value as AdministrativeProcedureCatalogV4;
  assertAdministrativeCatalogStructure(c);
  if (c.contractStatus !== 'approved' || c.contractDecision.status !== 'approved' || c.contractDecision.on !== '2026-10-22') fail('DEC-2026-036 is not confirmed');
  for (const [key, id] of [['paths','pathId'],['qualificationPolicies','pathId'],['laws','lawId'],
    ['suspensionProfiles','suspensionProfileId'],['excludedPaths','exclusionId']] as const) definitions(c[key],id,ADMINISTRATIVE_V4_BASELINE[key]);
  definitions(c.sources.map(({ reviewedOn, reviewBasis, ...identity }) => identity), 'sourceId', ADMINISTRATIVE_V4_BASELINE.sources);
  definitions(c.holidayBindings.map(({ physicalBaseline, ...legal }) => ({...legal,
    calendarId:physicalBaseline.calendarId,projectionId:physicalBaseline.projectionId})), 'holidayBindingId', ADMINISTRATIVE_V4_BASELINE.holidayBindings);
  const policies = new Map(c.qualificationPolicies.map(q => [q.pathId,q]));
  if (policies.size !== c.paths.length) fail('Incomplete v4 qualification policies');
  for (const path of c.paths) {
    const q = policies.get(path.pathId)!;
    if (q.pathRevision !== path.revision || q.pathSha256 !== socialObjectSha256(path)) fail('V4 policy path mismatch');
    const entry = c.releaseBinding.pathEligibility.find(e => e.pathId === path.pathId)!;
    if (entry.qualificationPolicySha256 !== socialObjectSha256(q)) fail('V4 qualification policy hash mismatch');
    if (q.mode === 'legacyV1' && !['ti','gr'].includes(path.pathId.slice(0,2))) fail('Unqualified legacy branch');
    if (q.mode === 'qualifiedDayProcedureV4') {
      if (!('openingWarnings' in path) || !('normTimeline' in path)) fail('V4 path requires explicit warning and norm definitions');
      const r = q.requirements;
      if (r.requiredSameIssuingCourt && (path.pathId !== 'sh-court-reasons-30' || r.requiredTargetCourt !== 'SH-Obergericht')) fail('Unqualified same issuing court');
      for (const warning of (path as AdministrativePathV4).openingWarnings) {
        if (warning.effect !== 'noticeOnlyNoDateChange' || warning.evaluatedOn !== 'qualifiedOpeningDate') fail('Warning is not a date modifier');
        for (const ref of warning.sourceRefs) if (!c.sources.some(s => s.sourceId === ref.sourceId)) fail('Unknown warning source');
      }
    }
  }
}

/** Actual target bytes and historical physical reuse provenance are distinct. */
export function validateAdministrativeReleaseBindingsV4(c: AdministrativeProcedureCatalogV4, context: AdministrativeReleaseContext): void {
  assertAdministrativeProcedureCatalogV4(c);
  const actual = new Map(context.componentRefs.map(r => [r.contentId,r]));
  const expected = new Map(c.holidayBindings.flatMap(b => b.physicalBaseline.references.map(r => [r.contentId,r] as const)));
  if (actual.size !== context.componentRefs.length) fail('Duplicate actual v4 component');
  same([...actual.keys()].sort(),[...expected.keys()].sort(),'Actual v4 component inventory');
  for (const [id,r] of actual) {
    const pinned = expected.get(id)!;
    if (r.role !== pinned.role || r.sha256 !== pinned.sha256 || !/^[a-f0-9]{64}$/.test(r.sha256)) fail('Stale v4 target hash or role');
  }
  if (c.holidayBindings.some(b => b.physicalBaseline.releaseId !== context.releaseId)) fail('Stale v4 physical target release');
  if (context.mode === 'localReference') {
    if (c.releaseBinding.status !== 'candidate' || c.releaseBinding.releaseId !== null || c.releaseBinding.approval !== null
      || c.releaseBinding.targetComponentRefs.length || c.releaseBinding.sourceReviewRef !== null || c.releaseBinding.referenceSuiteRef !== null) fail('V4 local reference is not a release approval');
    return;
  }
  if (context.mode !== 'approved' || c.releaseBinding.status !== 'approved' || c.releaseBinding.releaseId !== context.releaseId) fail('V4 release not approved');
  for (const r of c.releaseBinding.targetComponentRefs) same(r,actual.get(r.contentId),'Actual v4 release component mismatch');
}
