// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { inspectMigrationPlan, planPath } from '../../scripts/check-ap19b-migration.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const source = JSON.parse(await readFile(resolve(root, planPath), 'utf8'));
const raw = await readFile(resolve(root, source.base.catalogPath));
function rejected(change) { const plan = structuredClone(source); change(plan); assert.throws(() => inspectMigrationPlan(plan, raw)); }

test('all old social paths have one route and all other definitions/regimes survive', () => {
  assert.deepEqual(inspectMigrationPlan(source, raw), { migrationRoutes: 12, newProposedRules: 12, retainedDefinitions: 33, retainedRegimes: 40, preservedBlockedMappings: 4, baseHashVerified: true, contractApproved: false, runtimeActive: false, actualMigrationPerformed: false });
});
test('the inspection changes neither candidate nor source bytes', () => {
  const text = JSON.stringify(source); const bytes = Buffer.from(raw);
  inspectMigrationPlan(source, raw);
  assert.equal(JSON.stringify(source), text); assert.deepEqual(raw, bytes);
});
test('missing and duplicate migration routes fail closed', () => {
  rejected(plan => plan.migrations.pop());
  rejected(plan => { plan.migrations[1] = structuredClone(plan.migrations[0]); });
});
test('law, binding, mapping and regime identities cannot silently change', () => {
  for (const key of ['oldMappingId', 'oldDefinitionId', 'oldRegimeId', 'ruleId', 'bindingId']) rejected(plan => { plan.migrations[0][key] = 'UNKNOWN'; });
});
test('none of the political, procurement or general definitions may disappear', () => {
  rejected(plan => plan.preservedNonSocialDefinitionIds.pop());
  rejected(plan => plan.preservedNonSocialRegimeIds.pop());
  rejected(plan => plan.preservedNonSocialDefinitionIds.push(plan.migrations[0].oldDefinitionId));
});
test('all previous block identities remain explicit', () => {
  for (let index = 0; index < 4; index++) rejected(plan => plan.preservedBlockedMappingIds.splice(index, 1));
});
test('the twelve new paths are exact, unique and not copies of the old routes', () => {
  rejected(plan => plan.newFederalRuleIds.pop());
  rejected(plan => { plan.newFederalRuleIds[0] = plan.newFederalRuleIds[1]; });
  rejected(plan => { plan.newFederalRuleIds[0] = plan.migrations[0].ruleId; });
});
test('current consumers cannot be declared compatible with the proposed new manifest', () => {
  rejected(plan => { plan.proposedVersions.minimumConsumerFormatVersion = '4.0.0'; });
  rejected(plan => { plan.proposedVersions.releaseManifest = '4.0.0'; });
  rejected(plan => { plan.proposedVersions.calendar = '3.0.0'; });
});
test('proposal flags cannot be converted into legal or operational approval', () => {
  for (const key of ['contractApproved', 'runtimeActive', 'actualMigrationPerformed']) rejected(plan => { plan[key] = true; });
  rejected(plan => { plan.status = 'approved'; });
  rejected(plan => plan.plannedInitialCantons.push('ZH'));
  for (const key of ['commit', 'push', 'build', 'deploy']) rejected(plan => { plan.publication[key] = true; });
});
test('unknown fields and missing mandatory fields are rejected', () => {
  rejected(plan => { plan.unexpected = true; });
  rejected(plan => { plan.migrations[0].unexpected = true; });
  rejected(plan => { delete plan.base; });
  rejected(plan => { plan.base.extra = true; });
});
test('a modified original catalog fails the immutable source binding', () => {
  assert.throws(() => inspectMigrationPlan(source, Buffer.concat([raw, Buffer.from('\n')])));
  rejected(plan => { plan.base.catalogSha256 = '0'.repeat(64); });
});
test('the current manifest schema does not already allow version 5', async () => {
  const schema = JSON.parse(await readFile(resolve(root, 'schemas/release-manifest.schema.json'), 'utf8'));
  assert.deepEqual(schema.properties.formatVersion.enum, ['1.0.0', '2.0.0', '3.0.0', '4.0.0']);
  assert.equal(schema.properties.socialProcedureCatalogIds, undefined);
});
