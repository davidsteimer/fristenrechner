// SPDX-License-Identifier: AGPL-3.0-only
import { calculateAdministrativeDeadline } from '../core/administrativeDeadline';
import type { AdministrativeDeadlineInput, AdministrativeDeadlineResult } from '../core/administrativeDeadline';
import { getVerifiedAdministrativeContext } from '../core/administrativeContext';
import { createDeadlineCalendarEntry } from './calendarExport';
import type { DeadlineCalendarArtifact, DeadlineCalendarEntryOptions } from './calendarExport';
import { administrativeText } from './administrativeMessages';

interface BoundCalculation { readonly inputSignature: string; readonly context: unknown }
const calculations = new WeakMap<object, BoundCalculation>();
function signature(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(signature).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${signature((value as Record<string, unknown>)[key])}`).join(',')}}`;
  return JSON.stringify(value) ?? 'undefined';
}

/** Capture the exact actual result, current case facts and verified data identity. */
export function calculateAdministrativeUiDeadline(input: AdministrativeDeadlineInput, context: unknown): AdministrativeDeadlineResult {
  const result = calculateAdministrativeDeadline(input, context);
  calculations.set(result, { inputSignature: signature(input), context });
  return result;
}

export interface AdministrativeCalendarEntryOptions extends Omit<DeadlineCalendarEntryOptions, 'deadlineDate' | 'descriptionAppendix'> {
  readonly input: AdministrativeDeadlineInput;
  readonly context: unknown;
  readonly result: AdministrativeDeadlineResult;
}

export function administrativeExportAvailable(input: AdministrativeDeadlineInput, context: unknown, result: AdministrativeDeadlineResult): boolean {
  const bound = calculations.get(result);
  return !!bound && bound.context === context && bound.inputSignature === signature(input)
    && result.outcome === 'calculated' && !result.referenceOnly && result.calendarExportAllowed;
}

/** Never trust a serialized result flag. Recompute from the exact current context. */
export function createAdministrativeCalendarEntry(options: AdministrativeCalendarEntryOptions): DeadlineCalendarArtifact {
  const { input, context, result, ...calendarOptions } = options;
  if (!administrativeExportAvailable(input, context, result)) throw new Error('administrative.calendarExportNotBound');
  const fresh = calculateAdministrativeDeadline(input, context);
  if (fresh.outcome !== 'calculated' || fresh.referenceOnly || !fresh.calendarExportAllowed || signature(fresh) !== signature(result)) {
    throw new Error('administrative.calendarExportNoLongerEligible');
  }
  const verified = getVerifiedAdministrativeContext(context);
  const provenance = fresh.provenance;
  const law = verified?.catalog.laws.find(item => item.lawId === provenance.lawId);
  if (!verified || !law) throw new Error('administrative.calendarExportProvenanceMissing');
  const text = (key: string): string => administrativeText(calendarOptions.locale, key);
  const sourceLines = provenance.sourceRefs.map(ref => {
    const source = verified.catalog.sources.find(item => item.sourceId === ref.sourceId);
    if (!source) throw new Error('administrative.calendarExportProvenanceMissing');
    return `${ref.sourceId} — ${ref.locator} — ${source.url}`;
  });
  const descriptionAppendix = [
    text('provenance'),
    `kind: ${provenance.kind}`,
    `${text(`law.${provenance.lawId}`)} — ${law.title}`,
    `lawId: ${provenance.lawId}`,
    `pathId: ${provenance.pathId}`,
    `revision: ${provenance.revision}`,
    `stage: ${provenance.stage} (${text(`stage.${provenance.stage}`)})`,
    `releaseId: ${provenance.releaseId}`,
    `catalogId: ${provenance.catalogId}`,
    `holidayBindingId: ${provenance.holidayBindingId}`,
    `calendarId: ${provenance.calendarId}`,
    `projectionId: ${provenance.projectionId}`,
    `holidayRole: ${provenance.holidayRole}`,
    `authoritySeatCanton: ${provenance.authoritySeatCanton}`,
    `suspensionProfileId: ${provenance.suspensionProfileId}`,
    `urgencyApplied: ${provenance.urgencyApplied}`,
    ...(provenance.qualificationPolicySha256 ? [`qualificationPolicySha256: ${provenance.qualificationPolicySha256}`] : []),
    ...sourceLines
  ].join('\n');
  return createDeadlineCalendarEntry({ ...calendarOptions, deadlineDate: fresh.finalEnd, descriptionAppendix });
}
