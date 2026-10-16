// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { assembleMvp08SourceInventory, loadMvp08InventoryInputs, safeRelative,
  writeMvp08Inventory, inventoryPaths } from '../../scripts/inventory-mvp08-sources.mjs';

const inputs = loadMvp08InventoryInputs();
const inventory = assembleMvp08SourceInventory(inputs);
const altered = mutation => {
  const copy = structuredClone(inputs);
  const catalog = copy.candidate.documents.find(row => row.value.dataKind === 'holidayCatalog').value;
  const administrative = copy.candidate.documents.find(row => row.value.dataKind === 'administrativeProcedureCatalog').value;
  mutation(copy, catalog, administrative);
  return () => assembleMvp08SourceInventory(copy);
};

test('current Format8 source population retains 232 references and has all eleven administrative sources registered', () => {
  assert.equal(inventory.counts.candidateManifest, 120);
  assert.equal(inventory.counts.priorManifest, 109);
  assert.equal(inventory.counts.allCanonicalSourceIds, 243);
  assert.equal(inventory.counts.priorReviewedSources, 232);
  assert.equal(inventory.counts.newAdministrativeSources, 11);
  assert.deepEqual(inventory.counts.newAdministrativeKinds, { statute: 5, officialMaterials: 2, judgment: 4 });
  assert.equal(inventory.counts.historicalCatalog, 84);
  assert.equal(inventory.counts.activationEvidence, 157);
  assert.equal(inventory.counts.governanceRegister, 247);
  assert.equal(inventory.counts.missingFromRegister, 0);
  assert.equal(inventory.counts.historicalRegisterOnly, 4);
});

test('the accepted prerelease inventory remains immutable with its then-unregistered eleven sources', () => {
  const bytes = fs.readFileSync(inventoryPaths.output);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '6d40975ddf0fc334a43ae7444033037ab9809a90763be2461dc21b139d589526');
  const historical = JSON.parse(bytes);
  assert.equal(historical.counts.governanceRegister, 236);
  assert.equal(historical.counts.missingFromRegister, 11);
  assert.equal(historical.counts.allCanonicalSourceIds, 243);
  assert.equal(historical.sourceReleaseApproved, false);
  assert.equal(historical.completeReleaseReview, false);
});

test('complete graph preserves old references and includes laws, policies, suspensions, holidays and paths', () => {
  assert.equal(inventory.counts.referenceGraphEdges, 2078);
  assert.equal(inventory.counts.previousReferenceGraphEdges, 2020);
  assert.equal(inventory.counts.newAdministrativeReferenceEdges, 58);
  assert.deepEqual(inventory.counts.referenceGraphKinds, { sourceRef: 1705, activationEvidenceRef: 12, activationSourceId: 361 });
  const admin = inventory.referenceGraph.filter(row => row.documentPath.startsWith('administrative-procedures/'));
  for (const prefix of ['/laws/', '/suspensionProfiles/', '/holidayBindings/', '/paths/']) {
    assert.ok(admin.some(row => row.jsonPath.startsWith(prefix)), prefix);
  }
  assert.ok(admin.some(row => row.jsonPath.includes('/holidayPolicyReview/')));
  assert.ok(admin.some(row => row.jsonPath.includes('/legalBinding/')));
  assert.ok(admin.some(row => row.pathId === 'gr-52-30'));
  assert.ok(admin.some(row => row.lawId === 'lpamm-ti'));
  assert.ok(inventory.referenceGraph.every(row => inventory.rows.some(source => source.sourceId === row.sourceId)));
});

test('historical evidence binds real bytes without implying fresh verification or new source approval', () => {
  assert.equal(inventory.counts.boundHistoricalEvidenceFiles, 266);
  assert.equal(inventory.counts.freshOfficialChecks, 0);
  assert.equal(inventory.freshLegalVerificationPerformed, false);
  assert.equal(inventory.completeReleaseReview, false);
  assert.equal(inventory.sourceReleaseApproved, false);
  assert.ok(inventory.rows.every(row => row.freshEvidence.length === 0 && row.freshLegalReviewStatus === 'pending'));
  const ai = inventory.rows.find(row => row.sourceId === 'SRC-AI-RUHETAGE-LISTE-2026');
  assert.equal(ai.historicalAssessment.outcome, 'unclear');
  const fr = inventory.rows.find(row => row.sourceId === 'SRC-AP22-FR-PRAXIS');
  assert.equal(fr.positiveOrSharedEdges, 0);
  assert.equal(fr.historicalAssessment.outcome, 'unclear');
  const gr = inventory.rows.find(row => row.sourceId === 'SRC-AP23B-GR-VRG');
  assert.equal(gr.historicalAssessment.rawOriginalArchiveBound, false);
  assert.equal(gr.historicalAssessment.reviewedOn, '2026-10-12');
});

test('all twelve administrative path source/release eligibility gates remain unapproved', () => {
  const eligibility = inventory.administrativeSourceEligibility;
  assert.equal(eligibility.status, 'candidate');
  assert.equal(eligibility.runtimeActive, false);
  assert.equal(eligibility.sourceReviewRef, null);
  assert.equal(eligibility.approval, null);
  assert.equal(eligibility.pathEligibility.length, 12);
  assert.ok(eligibility.pathEligibility.every(row => row.status === 'candidate' && row.sourceReviewRef === null));
});

test('missing and duplicate source definitions fail closed', () => {
  assert.throws(altered((copy, catalog, admin) => { admin.sources.pop(); }), /Manifest source summary/);
  assert.throws(altered((copy, catalog, admin) => { admin.sources.push(admin.sources[0]); }), /duplicate ID/);
  assert.throws(altered(copy => { copy.priorReview.coverage.pop(); }), /Prior review coverage incomplete/);
});

test('missing or ambiguous activation mappings fail closed', () => {
  assert.throws(altered((copy, catalog) => { catalog.activation.sourceIdMap.pop(); }), /Incomplete evidence mapping/);
  assert.throws(altered((copy, catalog) => {
    catalog.activation.sourceIdMap[1].sourceId = catalog.activation.sourceIdMap[0].sourceId;
  }), /Ambiguous canonical/);
  assert.throws(altered((copy, catalog) => { catalog.activation.procedureBindings[0].sourceIds.push('unknown'); }), /Unresolved activation source ID/);
});

test('incomplete old or administrative source graph is rejected', () => {
  assert.throws(altered(copy => { copy.candidate.documents[0].value.rules[0].sourceRefs.pop(); }), /Existing reference graph changed/);
  assert.throws(altered((copy, catalog, admin) => { admin.paths[0].sourceRefs.pop(); }), /Administrative reference graph differs/);
  assert.throws(altered((copy, catalog, admin) => { admin.paths[0].sourceRefs[0].sourceId = 'UNKNOWN'; }), /Unknown source reference/);
  assert.throws(altered((copy, catalog, admin) => { admin.releaseBinding.pathEligibility.pop(); }), /Incomplete path eligibility/);
});

test('unsafe paths and attempts to promote candidate state are rejected', () => {
  for (const relative of ['../outside.json', '/tmp/outside.json', 'safe/../outside.json', 'safe\\outside.json', 'safe//outside.json']) {
    assert.throws(() => safeRelative(relative), /Unsafe path/);
  }
  assert.throws(altered(copy => { copy.candidate.documents[0].path = '../outside.json'; }), /Unsafe path/);
  assert.throws(altered(copy => { copy.candidate.manifest.releaseStatus = 'approved'; }), /unpromoted candidate/);
  assert.throws(altered((copy, catalog, admin) => { admin.releaseBinding.sourceReviewRef = { invented: true }; }));
  assert.throws(altered((copy, catalog, admin) => { admin.releaseBinding.pathEligibility[0].status = 'approved'; }));
});

test('assembly is deterministic and does not mutate inputs', () => {
  const before = structuredClone(inputs);
  assert.deepEqual(assembleMvp08SourceInventory(inputs), inventory);
  assert.deepEqual(inputs, before);
});

test('writer rechecks input bytes, uses exclusive creation and never promotes status', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'mvp08-inventory-test-'));
  try {
    const input = Buffer.from('synthetic evidence\n');
    fs.writeFileSync(path.join(temporary, 'evidence.json'), input, { flag: 'wx' });
    const copy = structuredClone(inventory);
    copy.evidenceBindings = [{ path: 'evidence.json', sha256: createHash('sha256').update(input).digest('hex'), byteLength: input.length }];
    const wrong = structuredClone(copy);
    wrong.evidenceBindings[0].sha256 = '0'.repeat(64);
    assert.throws(() => writeMvp08Inventory(wrong, temporary), /Input changed before write/);
    const promoted = structuredClone(copy);
    promoted.humanApproval = true;
    assert.throws(() => writeMvp08Inventory(promoted, temporary), /Preparation status/);
    const result = writeMvp08Inventory(copy, temporary);
    assert.equal(result.path, inventoryPaths.output);
    const before = fs.readFileSync(path.join(temporary, result.path));
    assert.throws(() => writeMvp08Inventory(copy, temporary), { code: 'EEXIST' });
    assert.deepEqual(fs.readFileSync(path.join(temporary, result.path)), before);
  } finally {
    fs.rmSync(temporary, { recursive: true });
  }
});
