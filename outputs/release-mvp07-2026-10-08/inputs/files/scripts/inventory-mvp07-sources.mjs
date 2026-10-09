// SPDX-License-Identifier: AGPL-3.0-only
// Local inventory only. No source approval, live governance write or promotion.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
export const inventoryPaths = Object.freeze({
  candidate: 'outputs/ap22c3-2026-10-08/bundle',
  prior: 'data/releases/2026-10-01-mvp-06-approved.1',
  matrix: 'outputs/ap22a-abnahme-2026-10-08/matrix-data-v10.json',
  priorInventory: 'outputs/release-mvp06-2026-10-01/source-inventory.json',
  priorCompleteness: 'outputs/release-mvp06-2026-10-01/source-review-completeness.json',
  register: 'data/source-reviews/source-register.json',
  output: 'outputs/release-mvp07-2026-10-08/sources/source-inventory.json'
});
const expectedCandidateHash = 'b290ece2d105c606b3de8154edade57fcbaf2ff978e42b05b08561fb1c40a0f6';
const expectedPriorHash = '637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724';
const unique = values => [...new Set(values)].sort();
const minus = (left, right) => left.filter(value => !right.includes(value));
const intersection = (left, right) => left.filter(value => right.includes(value));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const countBy = (values, property) => values.reduce((counts, value) => {
  const key = value[property];
  counts[key] = (counts[key] ?? 0) + 1;
  return counts;
}, {});
function uniqueRows(rows, key, label) {
  const ids = rows.map(row => row[key]);
  assert.ok(ids.every(id => typeof id === 'string' && id.length > 0), `${label}: missing ID`);
  assert.equal(new Set(ids).size, ids.length, `${label}: duplicate ID`);
  return new Map(rows.map(row => [row[key], row]));
}
function collectTopSources(documents) {
  const records = new Map();
  for (const document of documents) {
    uniqueRows(document.value.sources ?? [], 'sourceId', document.path);
    for (const source of document.value.sources ?? []) {
      const existing = records.get(source.sourceId);
      if (!existing) records.set(source.sourceId, { record: source, paths: [], records: [] });
      records.get(source.sourceId).paths.push(document.path);
      records.get(source.sourceId).records.push({ path: document.path, source });
    }
  }
  return records;
}

export function loadMvp07InventoryInputs(root = repositoryRoot) {
  const bindings = [];
  const read = relative => {
    const bytes = fs.readFileSync(path.resolve(root, relative));
    bindings.push({ path: relative, sha256: sha256(bytes), byteLength: bytes.length });
    return JSON.parse(bytes);
  };
  function bundle(prefix, expectedHash) {
    const manifest = read(`${prefix}/manifest.json`);
    assert.equal(bindings.at(-1).sha256, expectedHash, `Pinned manifest changed: ${prefix}`);
    const documents = manifest.artifacts.map(artifact => {
      assert.ok(!path.isAbsolute(artifact.path) && !artifact.path.split('/').includes('..'), 'Unsafe artifact path');
      const relative = `${prefix}/${artifact.path}`;
      const value = read(relative);
      assert.equal(bindings.at(-1).sha256, artifact.sha256, `Artifact hash changed: ${relative}`);
      assert.equal(bindings.at(-1).byteLength, artifact.byteLength, `Artifact length changed: ${relative}`);
      return { path: relative, value };
    });
    return { manifest, documents };
  }
  const candidate = bundle(inventoryPaths.candidate, expectedCandidateHash);
  const prior = bundle(inventoryPaths.prior, expectedPriorHash);
  const matrix = read(inventoryPaths.matrix);
  const priorInventory = read(inventoryPaths.priorInventory);
  const priorCompleteness = read(inventoryPaths.priorCompleteness);
  const register = read(inventoryPaths.register);
  for (const relative of [
    'outputs/release-mvp06-2026-10-01/source-approval.json',
    'outputs/release-mvp06-2026-10-01/source-governance-adoption.json',
    'outputs/ap22c3-abnahme-2026-10-08/receipt.json'
  ]) read(relative);
  return { candidate, prior, matrix, priorInventory, priorCompleteness, register, bindings };
}

/** Pure inventory. The reference graph represents documented use, not legal approval. */
export function assembleMvp07SourceInventory(inputs) {
  const { candidate, prior, matrix, priorInventory, priorCompleteness, register, bindings = [] } = inputs;
  assert.equal(candidate.manifest.releaseStatus, 'candidate', 'Only an unpromoted candidate is in scope');
  assert.equal(candidate.manifest.formatVersion, '7.0.0');
  assert.equal(candidate.manifest.sourceSummary.legalBasisReviewStatus, 'pending');
  const catalogDocument = candidate.documents.find(document => document.value.dataKind === 'holidayCatalog');
  assert.ok(catalogDocument, 'Missing holiday catalog');
  const catalog = catalogDocument.value;
  assert.equal(catalog.activation.releaseEligibility.status, 'candidate');
  assert.equal(catalog.activation.releaseEligibility.approval, null);
  assert.deepEqual(catalog.activation.sourceEvidence, matrix.sources, 'AP22 evidence differs from accepted matrix');
  const matrixBinding = bindings.find(binding => binding.path === inventoryPaths.matrix);
  if (matrixBinding) assert.equal(catalog.activation.base.matrixSha256, matrixBinding.sha256);
  const topSources = collectTopSources(candidate.documents);
  const priorTopSources = collectTopSources(prior.documents);
  const manifestIds = unique(candidate.manifest.sourceSummary.sourceIds);
  assert.equal(manifestIds.length, candidate.manifest.sourceSummary.sourceIds.length, 'Duplicate manifest source ID');
  assert.deepEqual(manifestIds, unique([...topSources.keys()]), 'Manifest source summary must match top-level sources');
  const priorIds = unique(prior.manifest.sourceSummary.sourceIds);
  assert.deepEqual(priorIds, unique([...priorTopSources.keys()]));
  assert.equal(minus(priorIds, manifestIds).length, 0, 'Previous manifest source omitted');
  for (const [id, row] of priorTopSources) {
    for (const occurrence of row.records) {
      const relative = occurrence.path.slice(inventoryPaths.prior.length + 1);
      const corresponding = topSources.get(id).records.find(item => item.path === `${inventoryPaths.candidate}/${relative}`);
      assert.ok(corresponding && isDeepStrictEqual(occurrence.source, corresponding.source), `Prior metadata changed: ${id}`);
    }
  }
  const catalogSources = uniqueRows(catalog.data.sources, 'id', 'Historical catalog');
  const evidence = uniqueRows(catalog.activation.sourceEvidence, 'id', 'Activation evidence');
  const mappings = uniqueRows(catalog.activation.sourceIdMap, 'evidenceId', 'Evidence map');
  const canonicalIds = catalog.activation.sourceIdMap.map(row => row.sourceId);
  assert.equal(new Set(canonicalIds).size, canonicalIds.length, 'Duplicate canonical evidence ID');
  assert.deepEqual(unique([...mappings.keys()]), unique([...evidence.keys()]), 'Incomplete evidence map');
  for (const [id, row] of mappings) assert.equal(row.sourceId, id.startsWith('SRC-') ? id : `SRC-${id}`, `Unexpected canonical ID: ${id}`);
  const allIds = unique([...manifestIds, ...catalogSources.keys(), ...canonicalIds]);
  const allIdSet = new Set(allIds);
  const graph = [];
  function addEdge(sourceId, documentPath, jsonPath, context, kind, locator, excluded) {
    assert.ok(allIdSet.has(sourceId), `Unknown source reference: ${sourceId}`);
    graph.push({ sourceId, documentPath, jsonPath, kind, excluded,
      profileId: context.profileId ?? null, calendarId: context.calendarId ?? null,
      componentId: context.componentId ?? null, locator: locator ?? null });
  }
  function walk(node, documentPath, jsonPath = '', inherited = {}, excluded = false) {
    if (Array.isArray(node)) return node.forEach((value, index) => walk(value, documentPath, `${jsonPath}/${index}`, inherited, excluded));
    if (!node || typeof node !== 'object') return;
    const context = { ...inherited };
    if (node.profileId ?? node.entryProfileId) context.profileId = node.profileId ?? node.entryProfileId;
    if (node.calendarId) context.calendarId = node.calendarId;
    const component = node.ruleId ?? node.bindingId ?? node.id ?? node.excludedPathId ?? node.eligibilityId ?? node.regimeId;
    if (component) context.componentId = component;
    const isExcluded = excluded || Boolean(node.excludedPathId);
    for (const key of ['sourceRefs', 'normBindings', 'supplementaryLawRefs']) {
      for (const [index, reference] of (node[key] ?? []).entries()) {
        const sourceId = reference.evidenceId ? mappings.get(reference.evidenceId)?.sourceId : reference.sourceId;
        assert.ok(sourceId, `Unresolved evidence reference: ${reference.evidenceId}`);
        addEdge(sourceId, documentPath, `${jsonPath}/${key}/${index}`, context,
          reference.evidenceId ? 'activationEvidenceRef' : 'sourceRef', reference.locator, isExcluded);
      }
    }
    // In Format 7 these arrays refer to evidence IDs, not top-level source records.
    if (jsonPath.startsWith('/activation/') && Array.isArray(node.sourceIds)) {
      for (const [index, evidenceId] of node.sourceIds.entries()) {
        const mapping = mappings.get(evidenceId);
        assert.ok(mapping, `Unresolved activation source ID: ${evidenceId}`);
        addEdge(mapping.sourceId, documentPath, `${jsonPath}/sourceIds/${index}`, context,
          'activationSourceId', evidence.get(evidenceId)?.locator, isExcluded);
      }
    }
    for (const [key, value] of Object.entries(node)) {
      // Historical catalog data and source definitions remain evidence, not direct use.
      if (['sources', 'sourceEvidence', 'sourceIdMap', 'sourceRefs', 'normBindings', 'supplementaryLawRefs'].includes(key)) continue;
      if (node.dataKind === 'holidayCatalog' && key === 'data') continue;
      walk(value, documentPath, `${jsonPath}/${key}`, context, isExcluded || key === 'excludedPaths');
    }
  }
  for (const document of candidate.documents) walk(document.value, document.path);
  const graphIds = unique(graph.map(edge => edge.sourceId));
  const activationIds = unique(graph.filter(edge => edge.kind !== 'sourceRef').map(edge => edge.sourceId));
  const declaredOrActivationIds = unique([...manifestIds, ...activationIds]);
  const newEvidenceIds = [...evidence.keys()].filter(id => id.startsWith('AP22'));
  const newIds = unique(newEvidenceIds.map(id => mappings.get(id).sourceId));
  const catalogOnlyIds = minus(unique([...catalogSources.keys()]), priorIds);
  const groups = {
    priorManifest: priorIds,
    priorCatalogNewlyDirect: intersection(catalogOnlyIds, declaredOrActivationIds),
    priorCatalogEvidenceOnly: minus(catalogOnlyIds, declaredOrActivationIds),
    newActivationDirect: intersection(newIds, declaredOrActivationIds),
    newActivationEvidenceOnly: minus(newIds, declaredOrActivationIds)
  };
  assert.equal(Object.values(groups).flat().length, allIds.length, 'Overlapping inventory groups');
  assert.deepEqual(unique(Object.values(groups).flat()), allIds, 'Incomplete inventory partition');
  const priorReviews = new Map([...priorCompleteness.manifestCoverage, ...priorCompleteness.reusedCatalogCoverage].map(row => [row.sourceId, row]));
  const priorUsage = new Map(priorInventory.entries.map(row => [row.sourceId, row.referenceUse]));
  const registered = uniqueRows(register.sources, 'sourceId', 'Governance register');
  const rows = allIds.map(sourceId => {
    const top = topSources.get(sourceId);
    const mapping = catalog.activation.sourceIdMap.find(row => row.sourceId === sourceId);
    const evidenceRow = mapping ? evidence.get(mapping.evidenceId) : null;
    const oldReview = priorReviews.get(sourceId);
    const sourceEdges = graph.filter(edge => edge.sourceId === sourceId);
    return {
      sourceId, evidenceId: mapping?.evidenceId ?? null,
      group: Object.entries(groups).find(([, ids]) => ids.includes(sourceId))[0],
      title: top?.record.title ?? evidenceRow?.title,
      urls: unique([...(top?.records ?? []).map(row => row.source.url), evidenceRow?.url].filter(Boolean)),
      inCandidateManifest: manifestIds.includes(sourceId),
      inHistoricalCatalog: catalogSources.has(sourceId),
      inGovernanceRegister: registered.has(sourceId),
      priorManifestReferenceUse: priorUsage.get(sourceId) ?? null,
      directReferenceUse: sourceEdges.some(edge => !edge.excluded) ? 'positive-or-shared-reference'
        : sourceEdges.length ? 'exclusion-only' : 'supporting-or-monitoring-unreferenced',
      positiveOrSharedEdges: sourceEdges.filter(edge => !edge.excluded).length,
      exclusionEdges: sourceEdges.filter(edge => edge.excluded).length,
      sourceRecord: priorTopSources.get(sourceId)?.record ?? top?.record ?? null,
      sourceRecordOccurrences: top?.records ?? [],
      sourceRecordVariantCount: (top?.records ?? []).reduce((variants, row) => {
        if (!variants.some(variant => isDeepStrictEqual(variant, row.source))) variants.push(row.source);
        return variants;
      }, []).length,
      historicalReleaseReview: oldReview ? { reviewedOn: oldReview.reviewedOn, outcome: oldReview.outcome,
        mode: oldReview.mode, evidencePath: oldReview.evidencePath } : null,
      ap22Documentation: evidenceRow,
      documentPaths: unique(top?.paths ?? []),
      referencePaths: sourceEdges.map(edge => `${edge.documentPath}#${edge.jsonPath}`),
      mvp07FreshReviewStatus: 'pending',
      mvp07FreshOfficialEvidence: []
    };
  });
  return {
    inventoryId: 'MVP07-SOURCE-INVENTORY-20261008', formatVersion: '1.0.0',
    preparedOn: '2026-10-08', recordStatus: 'candidate',
    candidateReleaseId: candidate.manifest.releaseId,
    comparedReleaseId: prior.manifest.releaseId,
    humanApproval: false, dataPromotionApproved: false, publicationApproved: false,
    freshLegalVerificationPerformed: false, completeReleaseReview: false,
    counts: {
      candidateManifest: manifestIds.length, priorManifest: priorIds.length,
      newManifest: minus(manifestIds, priorIds).length,
      historicalCatalog: catalogSources.size,
      manifestCatalogOverlap: intersection(manifestIds, [...catalogSources.keys()]).length,
      manifestCatalogUnion: unique([...manifestIds, ...catalogSources.keys()]).length,
      activationEvidence: evidence.size, newAP22Evidence: newIds.length,
      allCanonicalSourceIds: allIds.length,
      declaredManifestOrActivation: declaredOrActivationIds.length,
      directReferenceGraphSources: graphIds.length,
      referenceGraphEdges: graph.length,
      referenceGraphKinds: countBy(graph, 'kind'),
      directReferenceUses: countBy(rows, 'directReferenceUse'),
      priorManifestReferenceUses: countBy(priorInventory.entries, 'referenceUse'),
      exactDistinctUrls: unique(rows.flatMap(row => row.urls)).length,
      newAP22ExactDistinctUrls: unique(rows.filter(row => row.evidenceId?.startsWith('AP22')).flatMap(row => row.urls)).length,
      freshOfficialChecks: 0, governanceRegister: registered.size,
      sourceIdsWithMetadataVariants: rows.filter(row => row.sourceRecordVariantCount > 1).length,
      alreadyRegisteredInCandidateScope: intersection(allIds, [...registered.keys()]).length,
      missingFromRegister: minus(allIds, [...registered.keys()]).length,
      historicalRegisterOnly: minus([...registered.keys()], allIds).length,
      groups: Object.fromEntries(Object.entries(groups).map(([key, ids]) => [key, ids.length]))
    },
    interpretation: {
      countingUnit: 'Canonical source ID, not physical document, legal instrument or HTTP retrieval',
      sourceScope: 'Union of manifest sources, preserved catalog sources and mapped activation evidence',
      directUse: 'Literal sourceRefs/normBindings/supplementaryLawRefs and mapped activation sourceIds/evidenceId references, excluding source definitions and historical catalog data',
      groupDirect: 'Declared in the manifest or referenced by activation. A manifest declaration alone may be supporting or monitoring.',
      positive: 'At least one structural reference outside excludedPaths. This does not grant operative permission or confirm the legal inference.',
      exclusionOnly: 'References exist only within excludedPaths',
      evidenceOnly: 'No structural reference in the defined graph. May still support a legal interpretation in AP22 prose.',
      historicalDates: 'Preserved dates describe earlier documentation. They do not assert a fresh MVP07 official check.',
      unchangedMetadata: 'All prior source occurrences match their corresponding retained artifact semantically, ignoring JSON property order. Additional projection metadata variants are preserved separately.'
    },
    evidenceBindings: bindings,
    groups,
    historicalRegisterOnlySourceIds: minus([...registered.keys()], allIds),
    structuralGaps: [
      'The candidate manifest summarizes top-level sources only. Its 109 IDs are not the full source review population.',
      'The existing source-index builder does not resolve Format-7 sourceIds arrays, evidenceId, sourceIdMap or procedureBindings.id.',
      'MVP06 review scripts bind format 6, exact release IDs, counts and hashes. New Format-7 preparation must remain separate.',
      'AP22 evidence rows describe earlier findings. They do not supply a fresh MVP07 official retrieval or approve a source release.'
    ],
    metadataPreparation: {
      newEvidenceWithoutISODate: newEvidenceIds.filter(id => !/^\d{4}-\d{2}-\d{2}$/.test(evidence.get(id).versionOn ?? '')),
      evidenceWithoutLocator: newEvidenceIds.filter(id => !evidence.get(id).locator),
      httpEvidenceUrls: newEvidenceIds.filter(id => /^http:/.test(evidence.get(id).url ?? ''))
    },
    reviewStrategy: [
      'Refresh the 77 existing manifest references within modelled scope and retain explicit historical interpretation reuse, exclusions, AVIV option B and OF-001.',
      'For 36 newly direct catalog references, verify official current texts and their particular procedural function. Prior catalog-only reuse alone does not establish the new use.',
      'Map all 73 AP22 evidence aliases to physical source families, versions and provisions. Review the 48 direct IDs and 25 supporting IDs according to their actual function.',
      'Propose bounded historical reuse for 46 remaining catalog evidence IDs only when data, meaning and purpose remain unchanged. Separate annual, geographic, conflicting and changed evidence.',
      'Keep AI conflict, NE annual/local reservations, GR limits and SG/SH 2 January limits explicit. Preserve normative transfers and decision-specific scope.',
      'Build candidate governance artifacts with complete Format-7 reference resolution. No active register/index write, approval or promotion is authorised by this inventory.'
    ],
    referenceGraph: graph,
    rows
  };
}

export function writeMvp07Inventory(inventory, root = repositoryRoot) {
  assert.equal(inventory.recordStatus, 'candidate');
  assert.equal(inventory.humanApproval, false);
  assert.equal(inventory.freshLegalVerificationPerformed, false);
  const destination = path.resolve(root, inventoryPaths.output);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  // No replace, even when a previous file has identical bytes.
  fs.writeFileSync(destination, `${JSON.stringify(inventory, null, 2)}\n`, { flag: 'wx' });
  return destination;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  assert.ok(args.length === 0 || (args.length === 1 && args[0] === '--write'), 'Only --write is supported');
  const inventory = assembleMvp07SourceInventory(loadMvp07InventoryInputs());
  const destination = args.includes('--write') ? writeMvp07Inventory(inventory) : null;
  console.log(JSON.stringify({ inventoryId: inventory.inventoryId, counts: inventory.counts,
    output: destination ? inventoryPaths.output : null, liveGovernanceWrite: false,
    freshLegalVerificationPerformed: false }, null, 2));
}
