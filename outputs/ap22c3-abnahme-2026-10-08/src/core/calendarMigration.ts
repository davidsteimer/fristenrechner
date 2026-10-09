// SPDX-License-Identifier: AGPL-3.0-only
import { assertSocialProcedureCatalog, canonicalSocialJson } from './socialCatalog';
import type { ReleaseArtifactReference, SocialProcedureCatalog } from './socialTypes';

/** Rebinds metadata only. Historical source-review references are not a new approval. */
export function rebindSocialCalendarCandidate(
  original: SocialProcedureCatalog,
  releaseId: string,
  componentRefs: readonly ReleaseArtifactReference[]
): SocialProcedureCatalog {
  assertSocialProcedureCatalog(original);
  if (original.formatVersion !== '2.0.0' || original.federalRules.length !== 44
    || original.cantonalBindings.length !== 50 || original.releaseEligibility.length !== 50
    || original.cantonalBindings.some(binding => binding.procedureContextCanton !== 'BE')) {
    throw new Error('AP22C1 requires the unchanged AP20 national rules and Bern bindings');
  }
  const expected = ['calendar:be-public-holidays', 'calendar:ch-federal-calendar', 'holidayCatalog:ch-holiday-catalog'];
  if (JSON.stringify(componentRefs.map(ref => `${ref.role}:${ref.contentId}`).sort()) !== JSON.stringify(expected.sort())
    || componentRefs.some(ref => !/^[a-f0-9]{64}$/.test(ref.sha256))) throw new Error('Incomplete calendar component binding');
  if (original.releaseEligibility.some(entry => entry.releaseId === releaseId)) throw new Error('New release identity required');
  const candidate = JSON.parse(canonicalSocialJson(original)) as SocialProcedureCatalog;
  const result: SocialProcedureCatalog = {
    ...candidate,
    review: { ...candidate.review, status: 'candidate' },
    releaseEligibility: candidate.releaseEligibility.map(entry => ({
      ...entry, releaseId, status: 'candidate', approval: null,
      componentRefs: componentRefs.map(ref => ({ ...ref }))
    }))
  };
  assertSocialProcedureCatalog(result);
  return result;
}
