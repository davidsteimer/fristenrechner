// SPDX-License-Identifier: AGPL-3.0-only
import schema from '../../schemas/administrative-procedure-catalog-v2.schema.json';
import { assertSchema } from './schemaContract';
import { AdministrativeCatalogError, assertAdministrativeCatalogStructure } from './administrativeCatalog';
import type { AdministrativeReleaseContext } from './administrativeCatalog';
import { canonicalSocialJson, socialObjectSha256 } from './socialCatalog';
import { ADMINISTRATIVE_V2_BASELINE } from './administrativeV2Baseline';
import type { AdministrativeProcedureCatalogV2 } from './administrativeTypesV2';

function fail(message: string): never { throw new AdministrativeCatalogError(message); }
const same = (left: unknown, right: unknown, message: string): void => {
  if (canonicalSocialJson(left) !== canonicalSocialJson(right)) fail(message);
};
function verifyDefinitions(rows: readonly unknown[], id: string, expected: Readonly<Record<string, string>>): void {
  const mapped = new Map(rows.map(row => [String((row as Record<string, unknown>)[id]), row]));
  if (mapped.size !== rows.length) fail('Duplicate accepted definition');
  same([...mapped.keys()].sort(), Object.keys(expected).sort(), 'Unaccepted definition inventory');
  for (const [key, value] of mapped) if (socialObjectSha256(value) !== expected[key]) fail('Changed accepted definition or revision: ' + key);
}

/** Native v2 validation. Never reshapes this catalog into a v1 context. */
export function assertAdministrativeProcedureCatalogV2(value: unknown): asserts value is AdministrativeProcedureCatalogV2 {
  try { assertSchema(value, schema); }
  catch (error) { return fail('Administrative v2 schema: ' + (error instanceof Error ? error.message : String(error))); }
  const catalog = value as AdministrativeProcedureCatalogV2;
  assertAdministrativeCatalogStructure(catalog);
  if (catalog.contractStatus !== 'approved' || catalog.contractDecision.status !== 'approved'
    || catalog.contractDecision.on !== '2026-10-18') fail('DEC-2026-033 is not confirmed');
  for (const [key, id] of [['paths', 'pathId'], ['qualificationPolicies', 'pathId'], ['laws', 'lawId'],
    ['suspensionProfiles', 'suspensionProfileId'], ['excludedPaths', 'exclusionId']] as const) {
    verifyDefinitions(catalog[key], id, ADMINISTRATIVE_V2_BASELINE[key]);
  }
  // Legal use and projection identities stay fixed. Exact physical target
  // bytes are independently rebound and checked by the Format-9 reader.
  verifyDefinitions(catalog.holidayBindings.map(({ physicalBaseline, ...legal }) => ({
    ...legal, calendarId: physicalBaseline.calendarId, projectionId: physicalBaseline.projectionId
  })), 'holidayBindingId', ADMINISTRATIVE_V2_BASELINE.holidayBindings);
  const policies = new Map(catalog.qualificationPolicies.map(policy => [policy.pathId, policy]));
  const paths = new Map(catalog.paths.map(path => [path.pathId, path]));
  if (policies.size !== paths.size) fail('Incomplete qualification policies');
  for (const policy of policies.values()) {
    const path = paths.get(policy.pathId);
    if (!path || policy.pathRevision !== path.revision || policy.pathSha256 !== socialObjectSha256(path)) fail('Qualification path mismatch');
    const eligibility = catalog.releaseBinding.pathEligibility.find(entry => entry.pathId === path.pathId)!;
    if (eligibility.qualificationPolicySha256 !== socialObjectSha256(policy)) fail('Qualification policy hash mismatch');
    if (policy.mode === 'legacyV1' && !['ti', 'gr'].includes(path.pathId.slice(0, 2))) fail('Unqualified legacy branch');
    if (policy.mode === 'qualifiedDayProcedure') {
      const requirements = policy.requirements;
      const actions = { ordinaryAppeal: ['ordinary-administrative-appeal', 'ordinary-court-appeal'],
        proceduralSubmission: ['ordered-administrative-submission', 'ordered-court-submission'],
        executionAppeal: ['execution-order-appeal'] };
      if (!actions[requirements.action].includes(path.action) || path.urgencyPolicy !== 'notApplicable') fail('Qualification action or urgency mismatch');
      if (requirements.action === 'executionAppeal' && (path.pathId !== 'ar-execution-5'
        || path.duration.kind !== 'statutoryDays' || path.duration.value !== 5)) fail('Unqualified AR execution route');
    }
  }
}

export function validateAdministrativeReleaseBindingsV2(catalog: AdministrativeProcedureCatalogV2, context: AdministrativeReleaseContext): void {
  assertAdministrativeProcedureCatalogV2(catalog);
  const actual = new Map(context.componentRefs.map(ref => [ref.contentId, ref]));
  const expected = new Map(catalog.holidayBindings.flatMap(binding => binding.physicalBaseline.references.map(ref => [ref.contentId, ref] as const)));
  if (actual.size !== context.componentRefs.length) fail('Duplicate actual component');
  same([...actual.keys()].sort(), [...expected.keys()].sort(), 'Actual administrative component inventory');
  for (const [id, ref] of actual) {
    const baseline = expected.get(id)!;
    if (ref.role !== baseline.role || !/^[a-f0-9]{64}$/.test(ref.sha256)) fail('Actual component role/hash invalid');
    if (context.mode === 'localReference' && ref.sha256 !== baseline.sha256) fail('Stale local administrative target hash');
  }
  if (context.mode === 'localReference') {
    if (catalog.releaseBinding.status !== 'candidate' || catalog.releaseBinding.releaseId !== null
      || catalog.releaseBinding.approval !== null || catalog.releaseBinding.targetComponentRefs.length) fail('Local reference is not a release approval');
    if (catalog.holidayBindings.some(binding => binding.physicalBaseline.releaseId !== context.releaseId)) fail('Stale local administrative target release');
    return;
  }
  if (context.mode !== 'approved' || catalog.releaseBinding.status !== 'approved'
    || catalog.releaseBinding.releaseId !== context.releaseId) fail('Administrative release not approved or mismatched');
  for (const ref of catalog.releaseBinding.targetComponentRefs) same(ref, actual.get(ref.contentId), 'Actual release component hash mismatch');
}
