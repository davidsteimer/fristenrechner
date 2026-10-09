// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { assembleMvp07SourceInventory, loadMvp07InventoryInputs, writeMvp07Inventory, inventoryPaths } from '../../scripts/inventory-mvp07-sources.mjs';

const inputs = loadMvp07InventoryInputs();
// This inventory is the immutable pre-adoption question, not the later answer.
// Bind its original 81-row register. The new adoption suite separately verifies
// the complete living 236-row register and all 155 additions.
const root = fileURLToPath(new URL('../../', import.meta.url));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const originalTest = fs.readFileSync(path.resolve(root, 'outputs/release-mvp07-2026-10-08/inputs/files/tests/governance/mvp07-source-inventory.test.mjs'));
assert.equal(sha256(originalTest), '660f5a3ddf8eb094d3b00aa19a61c8d8789df53507bbcedfcdf5fddde9c7a7a2');
const registerBytes = fs.readFileSync(path.resolve(root, 'outputs/release-mvp07-2026-10-08/inputs/files/data/source-reviews/source-register.json'));
assert.equal(sha256(registerBytes), '1a2c61816d1c86c7731b6c06f2ae13970b28743644ad5f28672f326b45bd02d1');
inputs.register = JSON.parse(registerBytes);
Object.assign(inputs.bindings.find(item => item.path === inventoryPaths.register),
  { sha256: sha256(registerBytes), byteLength: registerBytes.length });
const inventory = assembleMvp07SourceInventory(inputs);
const altered = mutation => {
  const copy = structuredClone(inputs);
  mutation(copy, copy.candidate.documents.find(document => document.value.dataKind === 'holidayCatalog').value);
  return () => assembleMvp07SourceInventory(copy);
};

test('full inventory includes nested Format-7 evidence and partitions without double counting', () => {
  assert.equal(inventory.counts.candidateManifest, 109);
  assert.equal(inventory.counts.manifestCatalogUnion, 160);
  assert.equal(inventory.counts.activationEvidence, 157);
  assert.equal(inventory.counts.newAP22Evidence, 73);
  assert.equal(inventory.counts.allCanonicalSourceIds, 232);
  assert.deepEqual(inventory.counts.groups, {
    priorManifest: 77, priorCatalogNewlyDirect: 36, priorCatalogEvidenceOnly: 46,
    newActivationDirect: 48, newActivationEvidenceOnly: 25
  });
  assert.equal(new Set(Object.values(inventory.groups).flat()).size, 232);
  assert.equal(inventory.rows.length, 232);
  assert.equal(inventory.counts.directReferenceGraphSources, 142);
  assert.equal(inventory.counts.referenceGraphEdges, 2020);
  assert.deepEqual(inventory.counts.referenceGraphKinds, {
    activationEvidenceRef: 12, activationSourceId: 361, sourceRef: 1647
  });
  assert.deepEqual(inventory.counts.directReferenceUses, {
    'positive-or-shared-reference': 138, 'exclusion-only': 4,
    'supporting-or-monitoring-unreferenced': 90
  });
});

test('governance register gap and retained historical extras are explicit', () => {
  assert.equal(inventory.counts.governanceRegister, 81);
  assert.equal(inventory.counts.alreadyRegisteredInCandidateScope, 77);
  assert.equal(inventory.counts.missingFromRegister, 155);
  assert.deepEqual(inventory.historicalRegisterOnlySourceIds, [
    'JUD-BE-VG-100-2021-109', 'JUD-BGER-1C-592-2025', 'SRC-BBL-2025-2891', 'SRC-BJ-WEEKEND-DOSSIER'
  ]);
});

test('activation evidenceId and sourceIds resolve to canonical IDs and contextual use', () => {
  const ag = inventory.referenceGraph.filter(edge => edge.sourceId === 'SRC-AP22CLOSE-AG-STPO');
  assert.ok(ag.some(edge => edge.componentId === 'AP22-BIND-AG-STPO' && edge.profileId === 'stpo'));
  const so = inventory.referenceGraph.filter(edge => edge.sourceId === 'SRC-AP22-SO-GS201463');
  assert.equal(so.filter(edge => edge.kind === 'activationEvidenceRef').length, 12);
  assert.ok(so.some(edge => edge.kind === 'activationSourceId'));
  assert.ok(inventory.referenceGraph.every(edge => edge.sourceId !== undefined));
});

test('supporting prose evidence is retained without claiming direct runtime use', () => {
  const row = inventory.rows.find(row => row.sourceId === 'SRC-AP22CLOSE-BUND-F10031');
  assert.equal(row.group, 'newActivationEvidenceOnly');
  assert.equal(row.directReferenceUse, 'supporting-or-monitoring-unreferenced');
  assert.equal(row.ap22Documentation.retrievedOn, '2026-10-02');
  assert.equal(row.mvp07FreshReviewStatus, 'pending');
  assert.deepEqual(row.mvp07FreshOfficialEvidence, []);
});

test('projection metadata variants are retained without replacing the prior reviewed record', () => {
  const row = inventory.rows.find(row => row.sourceId === 'SRC-BUNDESFEIERTAG-19940701');
  assert.equal(row.sourceRecordVariantCount, 2);
  assert.equal(row.sourceRecord.sourceType, 'ordinance');
  assert.equal(row.sourceRecord.reviewedOn, '2026-08-29');
  assert.ok(row.sourceRecordOccurrences.some(item => item.source.reviewStatus === 'monitored'));
  assert.equal(inventory.counts.sourceIdsWithMetadataVariants, 1);
});

test('exclusion references and unknown outcomes retain their limited meaning', () => {
  const excluded = inventory.rows.find(row => row.sourceId === 'SRC-AP20C3-EGKUMV-BE-20220101');
  assert.equal(excluded.directReferenceUse, 'exclusion-only');
  assert.equal(excluded.priorManifestReferenceUse, 'exclusion-only');
  const ai = inventory.rows.find(row => row.sourceId === 'SRC-AI-RUHETAGE-LISTE-2026');
  assert.equal(ai.historicalReleaseReview.outcome, 'unclear');
  assert.equal(inventory.counts.freshOfficialChecks, 0);
  assert.equal(inventory.humanApproval, false);
  assert.equal(inventory.completeReleaseReview, false);
});

test('missing evidence mapping fails closed', () => {
  assert.throws(altered((copy, catalog) => { catalog.activation.sourceIdMap.pop(); }), /Incomplete evidence map/);
});

test('duplicate canonical IDs and unresolved binding evidence fail closed', () => {
  assert.throws(altered((copy, catalog) => {
    catalog.activation.sourceIdMap[1].sourceId = catalog.activation.sourceIdMap[0].sourceId;
  }), /Duplicate canonical evidence ID/);
  assert.throws(altered((copy, catalog) => {
    catalog.activation.procedureBindings[0].sourceIds.push('AP22-NOT-A-SOURCE');
  }), /Unresolved activation source ID/);
});

test('manifest-only counting and prior source metadata drift are rejected', () => {
  assert.throws(altered(copy => { copy.candidate.manifest.sourceSummary.sourceIds.pop(); }), /Manifest source summary/);
  assert.throws(altered(copy => {
    for (const document of copy.candidate.documents) {
      const source = document.value.sources?.find(row => row.sourceId === 'SRC-BGG-20260401');
      if (source) source.reviewedOn = '2026-10-08';
    }
  }), /Prior metadata changed/);
});

test('matrix evidence drift and fabricated release approval are rejected', () => {
  assert.throws(altered((copy, catalog) => { catalog.activation.sourceEvidence[0].review = 'Freshly checked'; }), /AP22 evidence differs/);
  assert.throws(altered(copy => { copy.candidate.manifest.releaseStatus = 'approved'; }), /unpromoted candidate/);
});

test('inventory is deterministic and writer never overwrites existing evidence', () => {
  assert.deepEqual(assembleMvp07SourceInventory(inputs), inventory);
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mvp07-inventory-test-'));
  try {
    const destination = writeMvp07Inventory(inventory, temporaryRoot);
    assert.equal(destination, path.join(temporaryRoot, inventoryPaths.output));
    const before = fs.readFileSync(destination);
    assert.throws(() => writeMvp07Inventory(inventory, temporaryRoot), { code: 'EEXIST' });
    assert.deepEqual(fs.readFileSync(destination), before);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true });
  }
});
