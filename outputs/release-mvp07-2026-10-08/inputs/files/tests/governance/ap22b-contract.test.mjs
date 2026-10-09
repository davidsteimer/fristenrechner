// SPDX-License-Identifier: AGPL-3.0-only
// Unabhängige Sollauswahl und strukturelle Übernahmeprüfung, keine Fristenarithmetik.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { inputs, buildContract, inspectContract, candidatePath } from '../../scripts/build-ap22b-contract.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const source = await inputs();
const candidate = JSON.parse(await readFile(resolve(root, candidatePath), 'utf8'));
const activation = candidate.activation;
const profiles = ['stpo', 'zpo', 'bgg', 'vwvg'];
const cantons = ['AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'];
const sorted = values => [...values].sort();
const digest = value => createHash('sha256').update(value).digest('hex');
const binding = (canton, profile, value = candidate) => value.activation.procedureBindings.find(row => row.jurisdiction === `CH-${canton}` && row.profileId === profile);
const projection = (id, value = candidate) => value.activation.projections.find(row => row.id === id);
const primary = (canton, profile, index = 0) => projection(binding(canton, profile).variants[index].projectionId);
function expectScopes(canton, profile, scopes, index = 0) {
  assert.deepEqual(primary(canton, profile, index).scopeIds, sorted(scopes), `${canton}/${profile}/${index}`);
}
function reject(change) {
  const changed = structuredClone(candidate);
  change(changed);
  assert.throws(() => inspectContract(changed, source));
}

test('saved draft has the independently stated AP22B inventory and no runtime approval', () => {
  assert.deepEqual(inspectContract(candidate, source), {
    status: 'contractProposal', contractApproved: false, runtimeActive: false,
    matrixDecisions: 198, procedureBindings: 104, projectionRecipes: 32,
    plannedManifestArtifacts: 40, preservedRules: 479, supplementalRules: 12,
    excludedDecisions: 20, resultDependentBindings: 4, regionalBindings: 8,
    sourceEvidence: 157
  });
  assert.equal(activation.contractDecision.status, 'proposed');
  assert.equal(activation.contractDecision.on, null);
  assert.deepEqual(activation.releaseEligibility, { status: 'candidate', releaseId: null, approval: null });
  assert.equal(candidate.acceptance.runtimeEnabled, false);
});

test('building and inspecting the specimen preserve all archival fields and all 479 original rules', () => {
  const original = JSON.stringify(source);
  assert.deepEqual(buildContract(source), candidate);
  inspectContract(candidate, source);
  assert.equal(JSON.stringify(source), original);
  for (const key of Object.keys(source.base).filter(key => !['$schema', 'formatVersion'].includes(key))) {
    assert.deepEqual(candidate[key], source.base[key], `Unveränderter Archivbereich ${key}`);
  }
  assert.equal(candidate.data.rules.length, 479);
  assert.equal(new Set(candidate.data.rules.map(row => row.id)).size, 479);
  assert.deepEqual(activation.sourceEvidence, source.matrix.sources);
  assert.equal(candidate.data.assignments.length, 95);
  assert.equal(candidate.data.assignments.filter(row => row.status === 'open').length, 95);
});

test('all 198 decisions retain their exact source row hashes and selection identities', () => {
  assert.equal(activation.matrixDecisions.length, 198);
  assert.equal(new Set(activation.matrixDecisions.map(row => row.id)).size, 198);
  for (const row of source.matrix.matrix) {
    const actual = activation.matrixDecisions.find(item => item.id === row.id);
    assert.ok(actual, row.id);
    assert.equal(actual.rowSha256, digest(JSON.stringify(row)), row.id);
    assert.equal(actual.mode, row.mode, row.id);
    assert.equal(actual.originScopeId, row.scope, row.id);
    assert.equal(actual.profileId, row.profile.toLowerCase(), row.id);
    assert.equal(actual.jurisdiction, row.jurisdiction, row.id);
    assert.deepEqual(actual.selectedScopeIds, row.selectedScopes.map(id => id === 'SO-PROCEDURAL-DRAFT' ? 'SO-PROCEDURAL-ALL' : id));
  }
  assert.equal(activation.base.catalogSha256, digest(source.raw));
  assert.equal(activation.base.matrixSha256, digest(source.matrixRaw));
});

test('104 bindings are exactly 26 cantons times four federal profiles, never a CH-only authority fallback', () => {
  assert.deepEqual(sorted(activation.procedureBindings.map(row => `${row.jurisdiction}/${row.profileId}`)), sorted(cantons.flatMap(canton => profiles.map(profile => `CH-${canton}/${profile}`))));
  assert.equal(new Set(activation.procedureBindings.map(row => row.id)).size, 104);
  assert.equal(activation.procedureBindings.some(row => row.jurisdiction === 'CH'), false);
  const national = activation.projections.filter(row => row.jurisdiction === 'CH');
  assert.equal(national.length, 1);
  assert.deepEqual(national[0].scopeIds, ['CH-ALL']);
  for (const row of activation.procedureBindings) {
    assert.deepEqual(row.caseCoverage, { from: '2026-08-29', to: null });
    for (const variant of row.variants) {
      const recipe = projection(variant.projectionId);
      assert.equal(recipe.jurisdiction, row.jurisdiction);
      assert.notEqual(recipe.baseScopeId, 'CH-ALL');
      assert.equal(recipe.scopeIds.filter(scope => scope === 'CH-ALL').length, 1);
      assert.equal(new Set(recipe.ruleIds).size, recipe.ruleIds.length);
    }
  }
});

test('literal AG, FR, SO, ZH and ZG selections replace competing lists for all four profiles', () => {
  for (const profile of profiles) {
    expectScopes('AG', profile, ['CH-ALL', 'AG-ZPO-ALL']);
    expectScopes('FR', profile, ['CH-ALL', 'FR-JG-ALL']);
    expectScopes('SO', profile, ['CH-ALL', 'SO-PROCEDURAL-ALL']);
    expectScopes('ZH', profile, ['CH-ALL', 'ZH-GOG-ALL']);
    expectScopes('ZG', profile, ['CH-ALL', 'ZG-VRG-ART10']);
    for (const canton of ['AG', 'FR', 'SO', 'ZH', 'ZG']) assert.deepEqual(binding(canton, profile).requiredAreaScopeIds, []);
  }
});

test('LU explicitly distinguishes the JusG list from the RLG plus VRG composition', () => {
  for (const profile of ['stpo', 'zpo']) expectScopes('LU', profile, ['CH-ALL', 'LU-JUSG-ART76']);
  for (const profile of ['bgg', 'vwvg']) expectScopes('LU', profile, ['CH-ALL', 'LU-RLG-ALL', 'LU-VRG-ADDITIONAL']);
  for (const profile of profiles) {
    expectScopes('AR', profile, ['CH-ALL', 'AR-ARG-ALL']);
    expectScopes('VD', profile, ['CH-ALL', 'VD-LEMP-ALL']);
    expectScopes('VS', profile, ['CH-ALL', 'VS-PUBLIC-ALL', 'VS-LOJ-ADDITIONAL']);
  }
});

test('NE and AI require an explicit regional fact instead of equating unknown with false', () => {
  for (const [canton, scope] of [['NE', 'NE-LANDERON-ADDITIONAL'], ['AI', 'AI-RTG-INNER-ADDITIONAL']]) {
    for (const profile of profiles) {
      const row = binding(canton, profile);
      assert.deepEqual(row.requiredAreaScopeIds, [scope]);
      assert.equal(row.variants.length, 2);
      assert.deepEqual(row.variants.map(variant => variant.areaFacts), [[{ scopeId: scope, member: false }], [{ scopeId: scope, member: true }]]);
      assert.equal(Object.hasOwn(row, 'defaultVariant'), false);
      assert.equal(Object.hasOwn(row, 'resolvedArea'), false);
      assert.equal(primary(canton, profile, 0).scopeIds.includes(scope), false);
      assert.equal(primary(canton, profile, 1).scopeIds.includes(scope), true);
    }
  }
  for (const profile of profiles) {
    expectScopes('NE', profile, ['CH-ALL', 'NE-LDJF-BASE', 'NE-LPA-ADDITIONAL']);
    expectScopes('NE', profile, ['CH-ALL', 'NE-LDJF-BASE', 'NE-LPA-ADDITIONAL', 'NE-LANDERON-ADDITIONAL'], 1);
    expectScopes('AI', profile, ['CH-ALL', 'AI-RTG-ALL']);
    expectScopes('AI', profile, ['CH-ALL', 'AI-RTG-ALL', 'AI-RTG-INNER-ADDITIONAL'], 1);
  }
});

test('GR and NE carry their approved coverage boundaries on the actual calendar binding', () => {
  for (const profile of profiles) {
    expectScopes('GR', profile, ['CH-ALL', 'GR-PUBLIC-ALL']);
    assert.deepEqual(binding('GR', profile).boundaryIds, ['GR-BASE-ONLY']);
    assert.deepEqual(binding('NE', profile).boundaryIds, ['NE-YEAR-LOCAL-RESERVE']);
    assert.deepEqual(binding('BE', profile).boundaryIds, []);
  }
});

test('exactly SH/StPO and SG/StPO/BGG/VwVG have alternatives differing by their single Jan 2 contribution', () => {
  const expected = ['AP22-BIND-SH-STPO', 'AP22-BIND-SG-STPO', 'AP22-BIND-SG-BGG', 'AP22-BIND-SG-VWVG'];
  assert.deepEqual(sorted(activation.procedureBindings.filter(row => row.ambiguity).map(row => row.id)), sorted(expected));
  for (const row of activation.procedureBindings.filter(row => row.ambiguity)) {
    const canton = row.jurisdiction.slice(3);
    const rule = `${canton}-ZPO-ADDITIONAL-DAY-BERCHTOLD`;
    assert.deepEqual(row.ambiguity, { decision: 'DEC-2026-029', catalogRuleIds: [rule], comparison: 'fullCalculation', onDifference: 'clarificationRequired', onEqual: 'resolved' });
    for (const variant of row.variants) {
      const normal = projection(variant.projectionId);
      const alternative = projection(variant.alternativeProjectionId);
      assert.ok(alternative);
      assert.deepEqual(alternative.ruleIds.filter(id => !normal.ruleIds.includes(id)), [rule]);
      assert.deepEqual(normal.ruleIds.filter(id => !alternative.ruleIds.includes(id)), []);
    }
  }
  for (const [canton, profile] of [['SH', 'zpo'], ['SG', 'zpo'], ['SH', 'bgg'], ['SH', 'vwvg']]) {
    assert.equal(binding(canton, profile).ambiguity, null);
    assert.equal(binding(canton, profile).variants[0].alternativeProjectionId, null);
    assert.ok(primary(canton, profile).ruleIds.includes(`${canton}-ZPO-ADDITIONAL-DAY-BERCHTOLD`));
  }
});

test('all 20 negative decisions survive without deleting their original catalogue rules', () => {
  const expected = [
    ...['FR-BAMG-CATHOLIC', 'FR-BAMG-REFORMED', 'SO-RTG-EXCEPT-BUCHEGGBERG', 'SO-RTG-BUCHEGGBERG',
      'AG-ARG-BADEN', 'AG-ARG-BERGDIETIKON', 'AG-ARG-AARAU-BRUGG-KULM-LENZBURG-ZOFINGEN',
      'AG-ARG-BREMGARTEN', 'AG-ARG-LAUFENBURG-MURI', 'AG-ARG-RHEINFELDEN-E1', 'AG-ARG-RHEINFELDEN-E2', 'AG-ARG-ZURZACH']
      .flatMap(scope => (scope.startsWith('AG-') ? ['ZPO'] : ['STPO', 'ZPO']).map(profile => `AP22-${scope}-${profile}`)),
    ...['STPO', 'ZPO', 'BGG', 'VWVG'].map(profile => `AP22-JU-LJF-LABOUR-${profile}`)
  ];
  assert.equal(expected.length, 20);
  assert.deepEqual(sorted(activation.matrixDecisions.filter(row => row.mode === 'exclude').map(row => row.id)), sorted(expected));
  for (const id of expected) {
    const decision = activation.matrixDecisions.find(row => row.id === id);
    assert.deepEqual(decision.selectedScopeIds, []);
    const original = source.matrix.matrix.find(row => row.id === id);
    assert.ok(original.rules.length);
    for (const ruleId of original.rules) assert.ok(candidate.data.rules.some(rule => rule.id === ruleId), ruleId);
  }
});

test('the twelve separate SO rules are full-day additions and retain the archived RTG half-day', () => {
  assert.deepEqual(sorted(activation.supplementalRules.map(rule => rule.id.replace('SO-PROCEDURAL-ALL-DAY-', ''))), sorted([
    'NEW-YEAR', 'BERCHTOLD', 'GOOD-FRIDAY', 'EASTER-MONDAY', 'ASCENSION', 'WHIT-MONDAY',
    'MAY1', 'CORPUS-CHRISTI', 'ASSUMPTION', 'ALL-SAINTS', 'CHRISTMAS', 'ST-STEPHEN'
  ]));
  for (const rule of activation.supplementalRules) {
    assert.equal(rule.dayPortion, 'fullDay');
    assert.equal(rule.category, 'proceduralEquivalentDay');
    assert.equal(rule.scopeId, 'SO-PROCEDURAL-ALL');
    for (const ref of rule.sourceRefs) assert.ok(activation.sourceEvidence.some(source => source.id === ref.evidenceId));
  }
  const may = activation.supplementalRules.find(rule => rule.id === 'SO-PROCEDURAL-ALL-DAY-MAY1');
  assert.deepEqual(may.calculation, { type: 'fixedMonthDay', month: 5, day: 1 });
  const oldMay = source.base.data.rules.filter(rule => rule.scope.startsWith('SO-RTG-') && rule.id.endsWith('-DAY-MAY1'));
  assert.ok(oldMay.length);
  for (const rule of oldMay) assert.deepEqual(candidate.data.rules.find(item => item.id === rule.id), rule);
});

test('court and party/representation policies stay distinct without computing an anchor', () => {
  const court = activation.anchorPolicies.find(policy => policy.profileId === 'zpo');
  assert.deepEqual(court.resolvedModes, ['court']);
  assert.deepEqual(court.unresolvedModes, ['missingCourt']);
  for (const profile of ['stpo', 'bgg', 'vwvg']) {
    const policy = activation.anchorPolicies.find(policy => policy.profileId === profile);
    assert.deepEqual(policy.resolvedModes, ['partyWithoutRepresentative', 'qualifiedServiceRepresentative']);
    for (const unresolved of ['nonProfessionalDifferentPlaces', 'mandateChange', 'personalActUnqualified', 'unresolvedMultiplePlaces']) assert.ok(policy.unresolvedModes.includes(unresolved));
    assert.equal(policy.resolvedModes.includes('authority'), false);
  }
});

test('missing, duplicate or reinterpreted decisions and deleted exclusions fail closed', () => {
  for (const change of [
    value => value.activation.matrixDecisions.pop(),
    value => value.activation.matrixDecisions.push(structuredClone(value.activation.matrixDecisions[0])),
    value => { value.activation.matrixDecisions = value.activation.matrixDecisions.filter(row => row.mode !== 'exclude'); },
    value => { value.activation.matrixDecisions.find(row => row.mode === 'exclude').mode = 'include'; },
    value => { value.activation.matrixDecisions[0].rowSha256 = '0'.repeat(64); },
    value => value.activation.procedureBindings.pop(),
    value => value.activation.procedureBindings.push(structuredClone(value.activation.procedureBindings[0]))
  ]) reject(change);
});

test('coverage boundaries, regional uncertainty and the Jan 2 alternative cannot disappear', () => {
  for (const change of [
    value => { binding('GR', 'stpo', value).boundaryIds = []; },
    value => { binding('NE', 'zpo', value).boundaryIds = []; },
    value => { binding('NE', 'zpo', value).requiredAreaScopeIds = []; },
    value => { binding('AI', 'stpo', value).variants.pop(); },
    value => { binding('NE', 'zpo', value).defaultVariant = 0; },
    value => { binding('SG', 'stpo', value).variants[0].alternativeProjectionId = null; },
    value => { binding('SH', 'stpo', value).ambiguity = null; }
  ]) reject(change);
});

test('candidate approval, invalid sources/dates and new profiles are rejected in this bound draft', () => {
  for (const change of [
    value => { value.activation.contractDecision.status = 'approved'; },
    value => { value.activation.releaseEligibility.status = 'approved'; },
    value => { value.activation.releaseEligibility.approval = { on: '2026-10-08', by: 'Codex', evidence: 'invented' }; },
    value => { value.activation.procedureBindings[0].sourceIds.push('MISSING'); },
    value => { value.activation.procedureBindings[0].caseCoverage.from = '2026-02-30'; },
    value => { value.activation.procedureBindings[0].caseCoverage.from = '2025-01-01'; },
    value => { value.activation.procedureBindings[0].profileId = 'atsg'; },
    value => { value.activation.procedureBindings[0].jurisdiction = 'CH'; },
    value => { value.activation.supplementalRules[0].sourceRefs[0].evidenceId = 'MISSING'; },
    value => { value.data.rules[0].status = 'approved-by-candidate'; }
  ]) reject(change);
});

test('the alternative cannot add or remove any contribution other than the bound Jan 2 rule', () => {
  for (const change of [
    value => {
      const id = binding('SG', 'stpo', value).variants[0].alternativeProjectionId;
      projection(id, value).ruleIds.push('SO-PROCEDURAL-ALL-DAY-MAY1');
    },
    value => {
      const id = binding('SG', 'stpo', value).variants[0].alternativeProjectionId;
      const recipe = projection(id, value);
      recipe.ruleIds = recipe.ruleIds.filter(rule => rule !== 'CH-CAL-HOL-NATIONAL-DAY');
    },
    value => { binding('SH', 'stpo', value).ambiguity.catalogRuleIds.push('CH-CAL-HOL-NATIONAL-DAY'); },
    value => { binding('SG', 'zpo', value).ambiguity = structuredClone(binding('SG', 'stpo', value).ambiguity); }
  ]) reject(change);
});
