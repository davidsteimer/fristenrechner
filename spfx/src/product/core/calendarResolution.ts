// SPDX-License-Identifier: AGPL-3.0-only
import { assertHolidayCatalogV2, isHolidayActivationReleased } from './holidayActivation';
import { isIssuedFormat7Runtime } from './format7Runtime';
import { isIssuedFormat8CalendarRuntime } from './format8Runtime';
import type { CalendarRuleSet } from './calendarRuleTypes';
import type { CalendarProcedureBinding, CalendarProjectionRecipe, HolidayCatalogV2 } from './holidayActivationTypes';

export type CalendarAnchorRole = '' | 'court' | 'partyWithoutRepresentative' | 'qualifiedServiceRepresentative'
  | 'missingCourt' | 'missingParty' | 'unqualifiedRepresentation' | 'nonProfessionalDifferentPlaces'
  | 'mandateChange' | 'personalActUnqualified' | 'unresolvedMultiplePlaces';
export interface CalendarContext {
  readonly role: CalendarAnchorRole;
  readonly canton: string;
  readonly areaFacts: Readonly<Record<string, boolean | undefined>>;
}
/** Trusted host configuration. referenceOnly is never a user/default input. */
export interface BoundCalendarRuntime {
  readonly catalog: HolidayCatalogV2;
  readonly calendars: readonly CalendarRuleSet[];
  readonly catalogSha256: string;
  readonly releaseId: string;
  readonly referenceOnly: boolean;
}
export interface CalendarResolution {
  readonly status: 'resolved' | 'resolvedWithBoundary' | 'clarificationRequired';
  readonly context: CalendarContext;
  readonly reasonKeys: readonly string[];
  readonly boundaryIds: readonly string[];
  readonly binding?: CalendarProcedureBinding;
  readonly projection?: CalendarProjectionRecipe;
  readonly alternativeProjection?: CalendarProjectionRecipe;
  readonly calendarId?: string;
}
const CANTONS = new Set('ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' '));
const AREA_FACTS = new Set(['AI-RTG-INNER-ADDITIONAL', 'NE-LANDERON-ADDITIONAL']);
export function unresolvedCalendar(context: CalendarContext, reason: string, previous?: CalendarResolution): CalendarResolution {
  return { ...(previous ?? {}), status: 'clarificationRequired', context, reasonKeys: [reason], boundaryIds: previous?.boundaryIds ?? [] };
}

/** Resolves one terminal procedural binding. No first-match or canton fallback. */
export function resolveBoundCalendar(profileId: string, context: CalendarContext, runtime: BoundCalendarRuntime): CalendarResolution {
  const reject = (reason: string): CalendarResolution => unresolvedCalendar(context, reason);
  if (!context || typeof context !== 'object' || typeof context.canton !== 'string'
    || typeof context.role !== 'string' || !context.areaFacts || typeof context.areaFacts !== 'object'
    || Array.isArray(context.areaFacts)) return reject('calendarBinding.invalidContext');
  if (!['stpo', 'zpo', 'bgg', 'vwvg'].includes(profileId)) return reject('calendarBinding.unsupportedProfile');
  if (!CANTONS.has(context.canton)) return reject('calendarBinding.placeRequired');
  if (Object.entries(context.areaFacts).some(([key, value]) => !AREA_FACTS.has(key)
    || (value !== undefined && typeof value !== 'boolean'))) return reject('calendarBinding.invalidAreaFact');
  try {
    const byteValidated = isIssuedFormat7Runtime(runtime) || isIssuedFormat8CalendarRuntime(runtime);
    // Issued runtimes were fully checked and deeply frozen by the factory.
    // Rechecking the complete 479-rule archive on every keystroke adds no
    // assurance to an immutable object and needlessly stalls all host UIs.
    if (!byteValidated) assertHolidayCatalogV2(runtime.catalog);
    if (typeof runtime.referenceOnly !== 'boolean' || !runtime.releaseId
      || !/^[a-f0-9]{64}$/.test(runtime.catalogSha256)) return reject('calendarBinding.invalidRuntime');
    const activation = runtime.catalog.activation;
    if (activation.contractDecision.status !== 'approved') return reject('calendarBinding.contractNotApproved');
    if (runtime.referenceOnly) {
      if (activation.releaseEligibility.status !== 'candidate') return reject('calendarBinding.invalidReferenceRuntime');
    } else if (byteValidated
      ? activation.releaseEligibility.status !== 'approved' || activation.releaseEligibility.releaseId !== runtime.releaseId || activation.releaseEligibility.approval === null
      : !isHolidayActivationReleased(runtime.catalog, runtime.releaseId)) return reject('calendarBinding.releaseNotApproved');
    const bindings = activation.procedureBindings.filter(binding => binding.profileId === profileId && binding.jurisdiction === `CH-${context.canton}`);
    if (bindings.length !== 1) return reject('calendarBinding.bindingUnresolved');
    const binding = bindings[0]!;
    const policies = activation.anchorPolicies.filter(policy => policy.id === binding.anchorPolicyId && policy.profileId === profileId);
    if (policies.length !== 1 || !policies[0]!.resolvedModes.some(role => role === context.role)) return reject('calendarBinding.roleUnresolved');
    if (binding.requiredAreaScopeIds.some(id => !Object.hasOwn(context.areaFacts, id)
      || typeof context.areaFacts[id] !== 'boolean')) return reject('calendarBinding.areaFactRequired');
    const variants = binding.variants.filter(variant => variant.areaFacts.every(fact => Object.hasOwn(context.areaFacts, fact.scopeId)
      && context.areaFacts[fact.scopeId] === fact.member));
    if (variants.length !== 1) return reject('calendarBinding.variantUnresolved');
    const variant = variants[0]!;
    const projections = activation.projections.filter(projection => projection.id === variant.projectionId);
    const alternatives = variant.alternativeProjectionId === null ? [] : activation.projections.filter(projection => projection.id === variant.alternativeProjectionId);
    if (projections.length !== 1 || (variant.alternativeProjectionId !== null && alternatives.length !== 1)) return reject('calendarBinding.projectionUnresolved');
    const projection = projections[0]!;
    if (runtime.calendars.filter(calendar => calendar.calendarId === projection.calendarId).length !== 1
      || alternatives.some(alternative => runtime.calendars.filter(calendar => calendar.calendarId === alternative.calendarId).length !== 1)) return reject('calendarBinding.calendarMissing');
    return {
      status: binding.boundaryIds.length ? 'resolvedWithBoundary' : 'resolved',
      context: { ...context, areaFacts: { ...context.areaFacts } },
      reasonKeys: [], boundaryIds: [...binding.boundaryIds], binding, projection,
      ...(alternatives[0] ? { alternativeProjection: alternatives[0] } : {}), calendarId: projection.calendarId
    };
  } catch {
    return reject('calendarBinding.invalidRuntime');
  }
}
