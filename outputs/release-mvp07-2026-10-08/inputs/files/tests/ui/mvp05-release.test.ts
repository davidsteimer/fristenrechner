// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { calculateSocialDeadline } from '../../src/core';
import { mvp05CalculationData as approved, mvp05Release } from '../../src/release/mvp05ReleaseData';
import { mvp04CalculationData as previous } from '../../src/release/mvp04ReleaseData';
import { ap19c3CandidateCalculationData as candidate } from '../../src/release/ap19c3CandidateData';
import manifest from '../../data/releases/2026-09-28-mvp-05-approved.1/manifest.json';
import { authorityOptions, profilesForAuthority } from '../../src/ui/model';
import { initialDefaults, sanitizeDefaults } from '../../src/ui/defaults';
import { socialInputFromUi, socialUiSelection, EMPTY_SOCIAL_CONTEXT } from '../../src/ui/socialUi';
import { vrpgLawOptions, type VrpgSelectionState } from '../../src/ui/vrpgSelection';

test('MVP 0.5 embeds all ten manifest artifacts including their exact release hashes', async () => {
  assert.equal(approved.releaseId, '2026-09-28-mvp-05-approved.1');
  assert.equal(approved.formatVersion, '5.0.0');
  assert.equal(mvp05Release.artifacts.length, 10);
  assert.deepEqual(mvp05Release.socialProcedureCatalogIds, ['ch-social-procedures']);
  for (const descriptor of manifest.artifacts) {
    const bytes = await readFile(`data/releases/${manifest.releaseId}/${descriptor.path}`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), descriptor.sha256);
    const embedded = mvp05Release.artifacts.find(item => item.descriptor.contentId === descriptor.contentId)!;
    assert.equal(embedded.descriptor.sha256, descriptor.sha256);
    assert.deepEqual(embedded.parsed, JSON.parse(bytes.toString()));
  }
});

test('normal public and preview entry points now select approved MVP 0.6 and explicit candidates remain separate', async () => {
  const preview = await readFile('src/ui/preview/main.tsx', 'utf8');
  const publicEntry = await readFile('src/public-app/main.tsx', 'utf8');
  assert.match(preview, /import \{ mvp06CalculationData \} from '\.\.\/\.\.\/release\/mvp06ReleaseData'/);
  assert.match(preview, /candidate === 'ap19c3' \? ap19c3CandidateCalculationData/);
  assert.match(preview, /candidate === 'ap17c' \? ap17cCandidateCalculationData : mvp06CalculationData/);
  assert.doesNotMatch(preview, /from '\.\/data'/);
  assert.match(publicEntry, /<FristenrechnerApp data=\{mvp06CalculationData\}/);
  assert.doesNotMatch(publicEntry, /ap19c|ap18c|ap17c|qaPreset|initialState|mvp04/i);
});

test('MVP 0.5 preserves the holiday catalog and only offers the existing CH and BE procedure contexts', () => {
  assert.deepEqual(approved.holidayCatalogs, previous.holidayCatalogs);
  assert.deepEqual(approved.calendarRuleSets, previous.calendarRuleSets);
  assert.deepEqual(approved.profiles, previous.profiles);
  assert.deepEqual(authorityOptions(approved), authorityOptions(previous));
  for (const authority of authorityOptions(previous)) {
    assert.deepEqual(profilesForAuthority(approved, authority.code), profilesForAuthority(previous, authority.code));
  }
  const catalog = approved.socialProcedureCatalogs!.get('ch-social-procedures')!;
  assert.equal(catalog.federalRules.length, 24);
  assert.equal(catalog.cantonalBindings.length, 28);
  assert.ok(catalog.cantonalBindings.every(binding => binding.procedureContextCanton === 'BE'));
  assert.ok(catalog.releaseEligibility.every(item => item.status === 'approved' && item.approval?.approvedBy === 'David Steimer'));
  assert.ok(candidate.socialProcedureCatalogs!.get('ch-social-procedures')!.releaseEligibility.every(item => item.status === 'candidate' && item.approval === null));
});

test('all 28 approved social bindings calculate through the unchanged actual UI adapter without invented approvals', () => {
  const catalog = approved.socialProcedureCatalogs!.get('ch-social-procedures')!;
  let count = 0;
  for (const binding of catalog.cantonalBindings) {
    const rule = catalog.federalRules.find(item => item.ruleId === binding.ruleId)!;
    const choice: VrpgSelectionState = {
      area: 'social', law: rule.law,
      action: rule.action === 'ordered-administrative-days' ? 'ongoing' : rule.action,
      stage: rule.action === 'ordered-administrative-days' ? 'administration' : ''
    };
    const origin = binding.contextRoutes[0]!.requiredFacts.find(fact => fact.factKey === 'decisionOrigin')?.allowedValues[0] as string | undefined;
    const selected = socialUiSelection(approved, choice, origin)!;
    assert.equal(selected.binding.bindingId, binding.bindingId);
    const input = socialInputFromUi(selected, 'BE', '2026-09-16', '10', {
      ...EMPTY_SOCIAL_CONTEXT, jurisdictionCanton: 'BE', partyDomicileCanton: 'BE', holidayConnections: 'partyBE',
      jurisdictionReferenceDate: '2026-09-16', decisionOrigin: origin ?? '', avigJurisdictionCanton: 'BE'
    });
    const result = calculateSocialDeadline(input, approved);
    assert.equal(result.outcome, 'calculated', `${binding.bindingId}: ${result.blockReasonKeys}`);
    assert.equal(result.finalDeadline?.date, rule.calculation.durationInputId ? '2026-09-28' : '2026-10-16');
    assert.equal(result.socialEvidence?.releaseId, manifest.releaseId);
    assert.deepEqual(calculateSocialDeadline(input, candidate).blockReasonKeys, ['not-released']);
    count++;
  }
  assert.equal(count, 28);
});

test('release promotion retains selections but cannot persist case facts or a prefilled date in defaults', () => {
  assert.deepEqual(initialDefaults(approved), initialDefaults(candidate));
  for (const law of ['ivg', 'ahvg', 'uvg', 'elg', 'avig', 'kvg']) {
    const selection = {area: 'social', law, action: 'appeal', stage: ''};
    const input = {...initialDefaults(candidate), profileId: 'vrpg-be', vrpgSelection: selection,
      inputDate: '2026-09-16', reference: 'PRIVATE-REFERENCE', socialContext: {partyDomicileCanton: 'BE'}};
    const defaults = sanitizeDefaults(approved, input);
    assert.deepEqual(defaults, sanitizeDefaults(candidate, input));
    assert.equal('inputDate' in defaults, false);
    assert.equal('reference' in defaults, false);
    assert.equal('socialContext' in defaults, false);
  }
});

test('only the actual approved MVP 0.5 data unlocks the new six-law UI, not the historical MVP 0.4 fixture', () => {
  const selection: VrpgSelectionState = {area: 'social', law: '', action: '', stage: ''};
  assert.deepEqual(vrpgLawOptions(selection, approved).map(option => option.key), ['', 'ivg', 'ahvg', 'uvg', 'elg', 'avig', 'kvg']);
  assert.equal(vrpgLawOptions(selection, previous).some(option => option.key === 'kvg'), false);
});
