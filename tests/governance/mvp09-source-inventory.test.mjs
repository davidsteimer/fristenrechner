// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { assembleMvp09SourceInventory, loadMvp09InventoryInputs, safeRelative,
  collectHistoricalCatalogGraph, writeMvp09Inventory, inventoryPaths } from '../../scripts/inventory-mvp09-sources.mjs';

const inputs = loadMvp09InventoryInputs();
const inventory = assembleMvp09SourceInventory(inputs);
const altered = mutation => {
  const copy = structuredClone(inputs);
  const catalog = copy.candidate.documents.find(row => row.value.dataKind === 'holidayCatalog').value;
  const admin = copy.candidate.documents.find(row => row.value.dataKind === 'administrativeProcedureCatalog').value;
  mutation(copy, catalog, admin);
  return () => assembleMvp09SourceInventory(copy);
};
test('Format9 inventory includes all 251 canonical IDs and distinguishes new IDs from instruments', () => {
  assert.equal(inventory.counts.candidateManifest, 128);
  assert.equal(inventory.counts.priorManifest, 120);
  assert.equal(inventory.counts.allCanonicalSourceIds, 251);
  assert.equal(inventory.counts.priorReviewedSources, 243);
  assert.equal(inventory.counts.newAdministrativeSources, 8);
  assert.deepEqual(inventory.counts.newAdministrativeKinds, { statute: 5, judgment: 1, officialMaterials: 2 });
  assert.equal(inventory.counts.newIdsForPreviouslyKnownInstruments, 4);
  assert.equal(inventory.counts.historicalCatalog, 84);
  assert.equal(inventory.counts.activationEvidence, 157);
  assert.equal(inventory.counts.governanceRegister, 247);
  assert.equal(inventory.counts.missingFromRegister, 8);
  assert.equal(inventory.counts.historicalRegisterOnly, 4);
});
test('complete prior runtime graph is retained and new uses of existing IDs are visible', () => {
  assert.equal(inventory.counts.referenceGraphEdges, 2136);
  assert.equal(inventory.counts.previousReferenceGraphEdges, 2078);
  assert.equal(inventory.counts.newAdministrativeReferenceEdges, 58);
  assert.equal(inventory.counts.existingSourceIdsWithNewUses, 1);
  assert.deepEqual(inventory.groups.existingSourceIdsWithNewUses, ['SRC-AP23B-CH-HOL']);
  const federal = inventory.rows.find(row => row.sourceId === 'SRC-AP23B-CH-HOL');
  assert.equal(federal.newUseOfPreviouslyReviewedSource, true);
  assert.ok(federal.newReferenceLocations.every(value => value.startsWith('administrative-procedures/')));
  assert.equal(federal.proposedReviewTreatment, 'freshAssessmentOfNewAdministrativeUsePlusBoundedReuseOfUnchangedPriorUses');
  assert.ok(inventory.addedReferenceGraph.every(row => row.documentPath.startsWith('administrative-procedures/')));
});
test('workbook provenance is separately complete and is not treated as runtime activation', () => {
  assert.equal(inventory.counts.historicalProvenanceEdges, 713);
  assert.ok(inventory.historicalCatalogProvenanceGraph.every(row => row.runtimeActivation === false));
  for (const key of ['scopes', 'rules', 'assignments', 'reviews'])
    assert.ok(inventory.historicalCatalogProvenanceGraph.some(row => row.jsonPath.startsWith(`/data/${key}/`)));
  const data = structuredClone(inputs.candidate.documents.find(row => row.value.dataKind === 'holidayCatalog').value);
  data.data.rules[0].source = 'UNKNOWN';
  assert.throws(() => collectHistoricalCatalogGraph(data, new Set(inventory.rows.map(row => row.sourceId))), /Unknown historical/);
});
test('report-wide and per-source historic originals are byte bound, not freshly checked', () => {
  assert.ok(inventory.counts.boundHistoricalEvidenceFiles >= inputs.priorReview.evidence.length);
  assert.equal(inventory.counts.boundE1RegistryOriginals, 8);
  assert.equal(inventory.counts.freshOfficialChecks, 0);
  assert.equal(inventory.freshLegalVerificationPerformed, false);
  assert.equal(inventory.completeReleaseReview, false);
  assert.equal(inventory.sourceReleaseApproved, false);
  assert.ok(inventory.rows.every(row => row.freshEvidence.length === 0 && row.freshLegalReviewStatus === 'pending'));
  const lu = inventory.historicalE1RegistryOriginals.find(row => row.id === 'LU-RTG');
  assert.equal(lu.currentVersion.id, 4916);
  assert.equal(lu.evidence.sha256, 'c146470031bb8f3e85cb1cdc6c40692d5580dc2df98eb41311efdb9b51ed1cf1');
  assert.equal(inventory.rows.find(row => row.sourceId === 'SRC-AI-RUHETAGE-LISTE-2026').historicalAssessment.outcome, 'unclear');
  assert.equal(inventory.rows.find(row => row.sourceId === 'SRC-AP22-FR-PRAXIS').positiveOrSharedEdges, 0);
});
test('aliases preserve distinct historical source identity, version and new use', () => {
  const lu = inventory.rows.find(row => row.sourceId === 'SRC-AP23E1-LU-RTG-20260927');
  assert.deepEqual(lu.samePhysicalInstrumentPriorSourceIds, ['SRC-LU-RLG-855-20200501']);
  assert.equal(lu.sourceRecordOccurrences[0].source.versionDescription, '2026-09-27');
  assert.equal(lu.group, 'newAdministrativeAP23E1');
  assert.equal(lu.inRegister, false);
  assert.ok(lu.urls.includes('https://srl.lu.ch/api/de/versions/4916/pdf_file'));
  assert.equal(inventory.rows.find(row => row.sourceId === 'SRC-LU-RLG-855-20200501').historicalCatalogRecord.versionOn, '2020-05-01');
});
test('all 25 path gates remain pending while twelve accepted prior path definitions are preserved', () => {
  assert.equal(inventory.counts.administrativePaths, 25);
  assert.equal(inventory.counts.preservedAdministrativePaths, 12);
  assert.equal(inventory.counts.newAdministrativePaths, 13);
  const eligibility = inventory.administrativeSourceEligibility;
  assert.equal(eligibility.runtimeActive, false);
  assert.equal(eligibility.sourceReviewRef, null);
  assert.equal(eligibility.approval, null);
  assert.ok(eligibility.pathEligibility.every(row => row.status === 'candidate' && row.sourceReviewRef === null));
});
test('missing source, duplicate source or incomplete previous coverage fail closed', () => {
  assert.throws(altered((copy, catalog, admin) => { admin.sources.pop(); }), /Manifest source summary/);
  assert.throws(altered((copy, catalog, admin) => { admin.sources.push(admin.sources[0]); }), /duplicate ID/);
  assert.throws(altered(copy => { copy.priorReview.coverage.pop(); }), /Prior review coverage incomplete/);
});
test('changed mappings, unknown references and incomplete old graph are rejected', () => {
  assert.throws(altered((copy, catalog) => { catalog.activation.sourceIdMap.pop(); }), /Existing evidence mapping changed/);
  assert.throws(altered(copy => { copy.candidate.documents[0].value.rules[0].sourceRefs.pop(); }), /Existing reference graph changed/);
  assert.throws(altered((copy, catalog, admin) => { admin.holidayBindings[4].legalBinding.sourceRefs[0].sourceId = 'UNKNOWN'; }), /Unknown source reference/);
});
test('accepted administrative reference graph and legacy path cannot silently change', () => {
  assert.throws(altered((copy, catalog, admin) => { admin.paths[0].sourceRefs.pop(); }), /Prior administrative path changed/);
  assert.throws(altered((copy, catalog, admin) => { admin.paths[12].sourceRefs.pop(); }), /Administrative contract section changed/);
  assert.throws(altered((copy, catalog, admin) => { admin.holidayBindings[4].legalBinding.sourceRefs.pop(); }), /Administrative reference graph differs/);
  assert.throws(altered((copy, catalog, admin) => { admin.releaseBinding.pathEligibility.pop(); }), /Incomplete path eligibility/);
});
test('historic catalog and prior source metadata cannot be silently revised', () => {
  assert.throws(altered((copy, catalog) => { catalog.data.rules[0].locator = 'invented'; }), /Historical catalog changed/);
  assert.throws(altered((copy, catalog, admin) => { admin.sources[0].locators = 'invented'; }), /Prior source metadata changed/);
});
test('unsafe paths and attempted candidate promotion are rejected', () => {
  for (const relative of ['../outside.json', '/tmp/outside.json', 'safe/../outside.json', 'safe\\outside.json', 'safe//outside.json'])
    assert.throws(() => safeRelative(relative), /Unsafe path/);
  assert.throws(altered(copy => { copy.candidate.documents[0].path = '../outside.json'; }), /Unsafe path/);
  assert.throws(altered(copy => { copy.candidate.manifest.releaseStatus = 'approved'; }), /unpromoted candidate/);
  assert.throws(altered((copy, catalog, admin) => { admin.releaseBinding.sourceReviewRef = { invented: true }; }));
  assert.throws(altered((copy, catalog, admin) => { admin.releaseBinding.pathEligibility[0].status = 'approved'; }));
});
test('assembly is deterministic and does not mutate inputs', () => {
  const before = structuredClone(inputs);
  assert.deepEqual(assembleMvp09SourceInventory(inputs), inventory);
  assert.deepEqual(inputs, before);
});
test('exclusive writer rehashes inputs and prevents implicit approval or overwrite', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'mvp09-inventory-test-'));
  try {
    const bytes = Buffer.from('synthetic evidence\n');
    fs.writeFileSync(path.join(temporary, 'evidence.json'), bytes, { flag: 'wx' });
    const copy = structuredClone(inventory);
    copy.evidenceBindings = [{ path: 'evidence.json', sha256: createHash('sha256').update(bytes).digest('hex'), byteLength: bytes.length }];
    const wrong = structuredClone(copy);
    wrong.evidenceBindings[0].sha256 = '0'.repeat(64);
    assert.throws(() => writeMvp09Inventory(wrong, temporary), /Input changed before write/);
    const promoted = structuredClone(copy);
    promoted.humanApproval = true;
    assert.throws(() => writeMvp09Inventory(promoted, temporary), /Preparation status/);
    const result = writeMvp09Inventory(copy, temporary);
    assert.equal(result.path, inventoryPaths.output);
    const before = fs.readFileSync(path.join(temporary, result.path));
    assert.throws(() => writeMvp09Inventory(copy, temporary), { code: 'EEXIST' });
    assert.deepEqual(fs.readFileSync(path.join(temporary, result.path)), before);
  } finally {
    fs.rmSync(temporary, { recursive: true });
  }
});
