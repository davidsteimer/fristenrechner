// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { explicitSourceImpacts } from '../../scripts/prepare-mvp09-source-reviews.mjs';

const graph = () => Array.from({ length: 2136 }, (_, index) => ({ sourceId: 'SRC-EXAMPLE', documentPath: 'example.json',
  jsonPath: `/example/${index}`, kind: 'sourceRef', locator: 'Art. 1', excluded: false, profileId: 'stpo' }));
test('complete source graph is required, not only manifest IDs', () => {
  assert.throws(() => explicitSourceImpacts({ referenceGraph: graph().slice(1) }, []));
});
test('explicit mapping retains all administrative component identities', () => {
  const edges = graph();
  edges[0] = { ...edges[0], sourceId: 'SRC-ADMIN', lawId: 'lpamm-ti', pathId: 'ti-80-30', holidayBindingId: 'ti-authority-seat', suspensionProfileId: 'ti-three' };
  assert.deepEqual(explicitSourceImpacts({ referenceGraph: edges }, []).get('SRC-ADMIN'), {
    profileIds: ['stpo'], calendarIds: [], componentIds: ['lpamm-ti', 'ti-80-30', 'ti-authority-seat', 'ti-three'] });
});
test('the additional graph does not discard inherited rule and eligibility relations', () => {
  const document = { dataKind: 'socialProcedureCatalog', federalRules: [{ ruleId: 'rule-a', sourceRefs: [{ sourceId: 'SRC-RULE' }] }],
    cantonalBindings: [{ bindingId: 'binding-a', entryProfileId: 'vrpg-be', sourceRefs: [{ sourceId: 'SRC-BIND' }] }],
    releaseEligibility: [{ eligibilityId: 'elig-a', ruleRef: { ruleId: 'rule-a' }, bindingRef: { bindingId: 'binding-a' } }] };
  const result = explicitSourceImpacts({ referenceGraph: graph() }, [document]);
  assert.deepEqual(result.get('SRC-RULE').componentIds, ['binding-a', 'elig-a', 'rule-a']);
  assert.deepEqual(result.get('SRC-BIND').profileIds, ['vrpg-be']);
});
test('unresolved social eligibility is rejected', () => {
  assert.throws(() => explicitSourceImpacts({ referenceGraph: graph() }, [{ dataKind: 'socialProcedureCatalog', federalRules: [], cantonalBindings: [],
    releaseEligibility: [{ ruleRef: { ruleId: 'missing' }, bindingRef: { bindingId: 'missing' } }] }]));
});
test('supporting mirror without an edge gains no invented positive relationship', () => {
  assert.equal(explicitSourceImpacts({ referenceGraph: graph() }, []).has('SRC-AP22-FR-PRAXIS'), false);
});

test('duplicate graph edge cannot masquerade as complete coverage', () => {
  const edges = graph(); edges[1] = { ...edges[0] };
  assert.throws(() => explicitSourceImpacts({ referenceGraph: edges }, []));
});
test('qualification identity is not discarded from explicit graph edges', () => {
  const edges = graph(); edges[0] = { ...edges[0], sourceId: 'SRC-QUALIFICATION', pathId: 'ar-execution-5', qualificationPolicyId: 'ar-execution-scope' };
  assert.deepEqual(explicitSourceImpacts({ referenceGraph: edges }, []).get('SRC-QUALIFICATION').componentIds,
    ['ar-execution-5', 'ar-execution-scope']);
});

