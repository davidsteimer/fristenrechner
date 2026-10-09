// SPDX-License-Identifier: AGPL-3.0-only
// Read-only AP19B contract probe. This does not build or migrate product data.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const planPath = 'tests/golden/candidates/ap19b-migration-plan.json';
const basePath = 'data/releases/2026-09-22-mvp-04-approved.1/special-regimes/vrpg-be.json';
const baseHash = 'f65af0f1aa73a4dc6e0d9a7b80c8ccd89b7196f3ed1d095ae570a451a7bb0638';
const versions = { releaseManifest: '5.0.0', minimumConsumerFormatVersion: '5.0.0', socialProcedureCatalog: '1.0.0', specialRegimeCatalog: '3.0.0', legalProfile: '1.0.0', calendar: '2.0.0', holidayCatalog: '1.0.0' };
function exactKeys(value, keys) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'object required');
  assert.deepEqual(Object.keys(value).sort(), [...keys].sort(), 'unknown or missing contract field');
}
function equalIds(actual, expected) {
  assert.ok(Array.isArray(actual), 'identifier array required');
  assert.equal(new Set(actual).size, actual.length, 'duplicate identifiers');
  assert.deepEqual([...actual].sort(), [...expected].sort(), 'identifier inventory changed');
}

export function inspectMigrationPlan(plan, rawCatalog) {
  exactKeys(plan, ['kind', 'status', 'contractApproved', 'runtimeActive', 'actualMigrationPerformed', 'base', 'proposedVersions', 'plannedInitialCantons', 'migrations', 'preservedNonSocialDefinitionIds', 'preservedNonSocialRegimeIds', 'preservedBlockedMappingIds', 'newFederalRuleIds', 'publication']);
  assert.equal(plan.kind, 'ap19b-contract-migration-probe');
  assert.equal(plan.status, 'proposal');
  for (const flag of ['contractApproved', 'runtimeActive', 'actualMigrationPerformed']) assert.equal(plan[flag], false);
  assert.deepEqual(plan.base, { releaseId: '2026-09-22-mvp-04-approved.1', catalogPath: basePath, catalogSha256: baseHash });
  assert.deepEqual(plan.proposedVersions, versions);
  assert.deepEqual(plan.plannedInitialCantons, ['BE']);
  assert.deepEqual(plan.publication, { commit: false, push: false, build: false, deploy: false });
  assert.equal(createHash('sha256').update(rawCatalog).digest('hex'), baseHash, 'base release is not the bound original');
  const catalog = JSON.parse(rawCatalog);
  const social = catalog.deadlineDefinitions.filter(def => def.applicability?.selection.area === 'social');
  const socialIds = new Set(social.map(def => def.deadlineDefinitionId));
  assert.equal(social.length, 12);
  assert.ok(Array.isArray(plan.migrations));
  assert.equal(plan.migrations.length, 12);
  for (const route of plan.migrations) exactKeys(route, ['oldMappingId', 'oldDefinitionId', 'oldRegimeId', 'ruleId', 'bindingId']);
  for (const key of ['oldMappingId', 'oldDefinitionId', 'oldRegimeId', 'ruleId', 'bindingId']) assert.equal(new Set(plan.migrations.map(route => route[key])).size, 12, `duplicate migration ${key}`);
  for (const def of social) {
    const mapping = def.applicability;
    const route = plan.migrations.find(item => item.oldMappingId === mapping.mappingId);
    assert.ok(route, `missing route: ${mapping.mappingId}`);
    const regimes = catalog.regimes.filter(regime => regime.deadlineDefinitionIds.includes(def.deadlineDefinitionId));
    assert.equal(regimes.length, 1, 'shared or missing social regime requires separate migration design');
    assert.deepEqual(regimes[0].deadlineDefinitionIds, [def.deadlineDefinitionId]);
    const suffix = mapping.mappingId.split('-').slice(2).join('-');
    const law = mapping.selection.law.toUpperCase();
    assert.deepEqual(route, { oldMappingId: mapping.mappingId, oldDefinitionId: def.deadlineDefinitionId, oldRegimeId: regimes[0].regimeId, ruleId: `CH-SOC-${law}-${suffix}`, bindingId: `BE-SOC-${law}-${suffix}` });
  }
  const retainedDefinitions = catalog.deadlineDefinitions.filter(def => !socialIds.has(def.deadlineDefinitionId));
  const retainedRegimes = catalog.regimes.filter(regime => !regime.deadlineDefinitionIds.some(id => socialIds.has(id)));
  equalIds(plan.preservedNonSocialDefinitionIds, retainedDefinitions.map(def => def.deadlineDefinitionId));
  equalIds(plan.preservedNonSocialRegimeIds, retainedRegimes.map(regime => regime.regimeId));
  equalIds(plan.preservedBlockedMappingIds, catalog.blockedMappings.map(mapping => mapping.mappingId));
  equalIds(plan.newFederalRuleIds, ['ELG', 'AVIG-ALE', 'KVG-OKP'].flatMap(law => ['OBJ', 'APP', 'ADM', 'CORRECTION'].map(action => `CH-SOC-${law}-${action}`)));
  assert.equal(new Set([...plan.newFederalRuleIds, ...plan.migrations.map(route => route.ruleId)]).size, 24, 'new and migrated rule identities overlap');
  const retainedIds = new Set(retainedDefinitions.map(def => def.deadlineDefinitionId));
  for (const regime of retainedRegimes) assert.ok(regime.deadlineDefinitionIds.every(id => retainedIds.has(id)), 'dangling retained regime');
  // Projection is entirely in memory. Existing definitions and regime contents stay whole.
  const partition = { retainedDefinitions, retainedRegimes, movedDefinitions: social, blockedMappings: catalog.blockedMappings };
  assert.equal(partition.retainedDefinitions.length + partition.movedDefinitions.length, catalog.deadlineDefinitions.length);
  assert.equal(partition.retainedRegimes.length + plan.migrations.length, catalog.regimes.length);
  return {
    migrationRoutes: 12, newProposedRules: 12, retainedDefinitions: retainedDefinitions.length,
    retainedRegimes: retainedRegimes.length, preservedBlockedMappings: catalog.blockedMappings.length,
    baseHashVerified: true, contractApproved: false, runtimeActive: false, actualMigrationPerformed: false
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const plan = JSON.parse(await readFile(resolve(root, planPath), 'utf8'));
  const catalog = await readFile(resolve(root, basePath));
  console.log(JSON.stringify(inspectMigrationPlan(plan, catalog), null, 2));
}
