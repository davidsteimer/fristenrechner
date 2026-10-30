// SPDX-License-Identifier: AGPL-3.0-only
// Explicit synthetic current facts and approvals, not product defaults or a legal release.
import assert from 'node:assert/strict';
import { createFormat17CalculationData } from '../../src/core/format17CalculationData';
import { ap23m3CandidateRuntime } from '../../src/release/ap23m3CandidateData';
import { mvp09Runtime } from '../../src/release/mvp09ReleaseData';
import type { CalculationData } from '../../src/core';
import type { SocialCantonalBinding, SocialFederalRule } from '../../src/core/socialTypes';
import { EMPTY_SOCIAL_CONTEXT, socialUiSelection, type SocialUiContext } from '../../src/ui/socialUi';
import type { VrpgSelectionState } from '../../src/ui/vrpgSelection';
import { buildSyntheticFormat17, encode17 } from '../core/ap23m3Fixtures';

export const r10u1Actual17 = ap23m3CandidateRuntime;
export const r10u1Actual9 = mvp09Runtime;
const synthetic = buildSyntheticFormat17('approved');
export const r10u1SyntheticApproved17 = createFormat17CalculationData(encode17(synthetic.manifest), synthetic.files, { mode: 'approved' });
export function r10u1Catalog(data: CalculationData) {
  const catalogs = [...data.socialProcedureCatalogs!.values()];
  assert.equal(catalogs.length, 1);
  return catalogs[0]!;
}
export function r10u1State(rule: SocialFederalRule): VrpgSelectionState {
  return { area: 'social', law: rule.law,
    action: rule.action === 'ordered-administrative-days' ? 'ongoing' : rule.action,
    stage: rule.action === 'ordered-administrative-days' ? 'administration' : '' };
}
/** These are explicitly invented positive facts for this test, not inferred jurisdiction. */
export function r10u1Context(binding: SocialCantonalBinding): SocialUiContext {
  const facts = binding.contextRoutes[0]!.requiredFacts;
  return { ...EMPTY_SOCIAL_CONTEXT, jurisdictionCanton: 'BE', partyDomicileCanton: 'BE',
    holidayConnections: 'partyBE', jurisdictionReferenceDate: '2026-09-16',
    decisionOrigin: String(facts.find(fact => fact.factKey === 'decisionOrigin')?.allowedValues[0] ?? ''),
    eogOfficeType: String(facts.find(fact => fact.factKey === 'eogOfficeType')?.allowedValues[0] ?? ''),
    avigJurisdictionCanton: 'BE', compensationOfficeCanton: 'BE', familyAllowanceOrderCanton: 'BE', uelgAdministrativeCanton: 'BE' };
}
export function r10u1Selection(data: CalculationData, binding: SocialCantonalBinding) {
  const rule = r10u1Catalog(data).federalRules.find(rule => rule.ruleId === binding.ruleId)!;
  const context = r10u1Context(binding);
  const selected = socialUiSelection(data, r10u1State(rule), context.decisionOrigin, context.eogOfficeType);
  assert.ok(selected, binding.bindingId);
  assert.equal(selected.binding.bindingId, binding.bindingId);
  return selected;
}
