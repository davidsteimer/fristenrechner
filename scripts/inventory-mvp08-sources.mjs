// SPDX-License-Identifier: AGPL-3.0-only
// Preparation only. No network, legal approval, governance adoption or promotion.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
export const inventoryPaths = Object.freeze({
  candidate: 'outputs/ap23d2-candidate-2026-10-15/bundle',
  prior: 'data/releases/2026-10-08-mvp-07-approved.1',
  priorInventory: 'outputs/release-mvp07-2026-10-08/sources/source-inventory.json',
  priorReview: 'outputs/release-mvp07-2026-10-08/source-review-completeness.json',
  priorApproval: 'outputs/release-mvp07-2026-10-08/source-approval.json',
  priorAdoption: 'outputs/release-mvp07-2026-10-08/source-governance-adoption.json',
  ap23Review: 'docs/fachrecht/quellenpruefung-ap23b.md',
  ap23Acceptance: 'docs/fachrecht/abnahme-ap23b.md',
  contract: 'tests/golden/candidates/ap23c-administrative-contract.json',
  register: 'data/source-reviews/source-register.json',
  output: 'outputs/release-mvp08-2026-10-15/sources/source-inventory.json'
});
const expected = Object.freeze({
  [`${inventoryPaths.candidate}/manifest.json`]: 'ccb67c22e55737af064f8c9ef7b122db8c5dfe1f4a1f142eb77cd05fd5ac646d',
  [`${inventoryPaths.prior}/manifest.json`]: 'fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597',
  [inventoryPaths.priorInventory]: '4bb394c9b1cccdc50ccae896925a5b64b3a6274fba0fb0b81a35b0ddca7e9c82',
  [inventoryPaths.priorReview]: 'ce9122d5e6a5c3bf8c0fb8061e51e6e1613fbb04f34d65825eeea7a59796f587',
  [inventoryPaths.priorApproval]: '478ca3d20ea1d643bb05379f8acc042560fa9547575d62e5d7afd4c8c1213810',
  [inventoryPaths.priorAdoption]: '41f5cdc3254621e2328a7d9675d922744f446b17a595e723c5d179354e8f162f',
  [inventoryPaths.ap23Review]: '619f99fa7df2a650467e41ce58d443758263e30f54167aacaf096be7a1e7b3af',
  [inventoryPaths.ap23Acceptance]: 'c52680a7ff64aecc46a2889a94edce497364ba03625892fe8f42d033300ca6b0',
  [inventoryPaths.contract]: '9600d1474f3622eb258284bed03d00e99cc7bcd089d5d1452552472b12f2af18'
});
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const unique = values => [...new Set(values)].sort();
const minus = (left, right) => left.filter(value => !right.includes(value));
const countBy = (rows, key) => rows.reduce((counts, row) => {
  counts[row[key]] = (counts[row[key]] ?? 0) + 1;
  return counts;
}, {});
export function safeRelative(relative) {
  assert.ok(typeof relative === 'string' && relative.length && !path.isAbsolute(relative)
    && !relative.includes('\\') && !relative.split('/').some(part => !part || part === '..' || part === '.'), `Unsafe path: ${relative}`);
  return relative;
}
function readBytes(root, relative) {
  const absolute = path.resolve(root, safeRelative(relative));
  const physical = fs.realpathSync(absolute);
  assert.ok(physical.startsWith(fs.realpathSync(root) + path.sep), `Path escapes repository: ${relative}`);
  assert.ok(fs.statSync(physical).isFile(), `Not a regular file: ${relative}`);
  return fs.readFileSync(absolute);
}
function uniqueRows(rows, key, label) {
  const ids = rows.map(row => row[key]);
  assert.ok(ids.every(id => typeof id === 'string' && id.length), `${label}: missing ID`);
  assert.equal(new Set(ids).size, ids.length, `${label}: duplicate ID`);
  return new Map(rows.map(row => [row[key], row]));
}

export function loadMvp08InventoryInputs(root = repositoryRoot) {
  const bindings = new Map();
  function bind(relative, sha256, byteLength) {
    const bytes = readBytes(root, relative);
    const record = { path: relative, sha256: hash(bytes), byteLength: bytes.length };
    if (expected[relative]) assert.equal(record.sha256, expected[relative], `Pinned input changed: ${relative}`);
    if (sha256) assert.equal(record.sha256, sha256, `Evidence hash changed: ${relative}`);
    if (byteLength !== undefined) assert.equal(record.byteLength, byteLength, `Evidence length changed: ${relative}`);
    if (bindings.has(relative)) assert.deepEqual(record, bindings.get(relative), `Conflicting evidence: ${relative}`);
    bindings.set(relative, record);
    return bytes;
  }
  const read = relative => JSON.parse(bind(relative));
  function bundle(prefix) {
    const manifest = read(`${prefix}/manifest.json`);
    uniqueRows(manifest.artifacts, 'path', `${prefix} artifacts`);
    const documents = manifest.artifacts.map(artifact => ({
      path: safeRelative(artifact.path),
      value: JSON.parse(bind(`${prefix}/${safeRelative(artifact.path)}`, artifact.sha256, artifact.byteLength))
    }));
    return { manifest, documents };
  }
  const candidate = bundle(inventoryPaths.candidate);
  const prior = bundle(inventoryPaths.prior);
  const priorInventory = read(inventoryPaths.priorInventory);
  const priorReview = read(inventoryPaths.priorReview);
  const priorApproval = read(inventoryPaths.priorApproval);
  const priorAdoption = read(inventoryPaths.priorAdoption);
  const contract = read(inventoryPaths.contract);
  const register = read(inventoryPaths.register);
  bind(inventoryPaths.ap23Review);
  bind(inventoryPaths.ap23Acceptance);
  const historicalEvidence = new Map();
  for (const row of priorReview.coverage) for (const item of [...row.freshEvidence, ...row.reusedEvidence]) {
    bind(item.path, item.sha256, item.byteLength);
    historicalEvidence.set(item.path, bindings.get(item.path));
  }
  return { candidate, prior, priorInventory, priorReview, priorApproval, priorAdoption, contract, register,
    historicalEvidence: [...historicalEvidence.values()].sort((a, b) => a.path.localeCompare(b.path)),
    bindings: [...bindings.values()].sort((a, b) => a.path.localeCompare(b.path)) };
}

function sourceDefinitions(documents) {
  const definitions = new Map();
  for (const document of documents) {
    safeRelative(document.path);
    uniqueRows(document.value.sources ?? [], 'sourceId', document.path);
    for (const source of document.value.sources ?? []) {
      if (!definitions.has(source.sourceId)) definitions.set(source.sourceId, []);
      definitions.get(source.sourceId).push({ documentPath: document.path, source });
    }
  }
  return definitions;
}

/** Complete literal graph following the MVP07 traversal, with administrative context. */
export function collectReferenceGraph(documents, allIds, mappings) {
  const graph = [];
  function add(sourceId, documentPath, jsonPath, context, kind, locator, excluded) {
    assert.ok(allIds.has(sourceId), `Unknown source reference: ${sourceId}`);
    graph.push({ sourceId, documentPath, jsonPath, kind, locator: locator ?? null, excluded, ...context });
  }
  function walk(node, documentPath, jsonPath = '', inherited = {}, excluded = false) {
    if (Array.isArray(node)) return node.forEach((value, index) => walk(value, documentPath, `${jsonPath}/${index}`, inherited, excluded));
    if (!node || typeof node !== 'object') return;
    const context = { ...inherited };
    for (const key of ['profileId', 'calendarId', 'pathId', 'lawId', 'holidayBindingId', 'suspensionProfileId']) {
      if (node[key]) context[key] = node[key];
    }
    if (node.entryProfileId) context.profileId = node.entryProfileId;
    const component = node.ruleId ?? node.bindingId ?? node.id ?? node.excludedPathId ?? node.exclusionId ?? node.eligibilityId ?? node.regimeId;
    if (component) context.componentId = component;
    const isExcluded = excluded || Boolean(node.excludedPathId) || Boolean(node.exclusionId);
    for (const key of ['sourceRefs', 'normBindings', 'supplementaryLawRefs']) {
      for (const [index, reference] of (node[key] ?? []).entries()) {
        const sourceId = reference.evidenceId ? mappings.get(reference.evidenceId)?.sourceId : reference.sourceId;
        assert.ok(sourceId, `Unresolved evidence reference: ${reference.evidenceId}`);
        add(sourceId, documentPath, `${jsonPath}/${key}/${index}`, context,
          reference.evidenceId ? 'activationEvidenceRef' : 'sourceRef', reference.locator, isExcluded);
      }
    }
    if (jsonPath.startsWith('/activation/') && Array.isArray(node.sourceIds)) {
      for (const [index, evidenceId] of node.sourceIds.entries()) {
        const mapping = mappings.get(evidenceId);
        assert.ok(mapping, `Unresolved activation source ID: ${evidenceId}`);
        add(mapping.sourceId, documentPath, `${jsonPath}/sourceIds/${index}`, context, 'activationSourceId', null, isExcluded);
      }
    }
    for (const [key, value] of Object.entries(node)) {
      if (['sources', 'sourceEvidence', 'sourceIdMap', 'sourceRefs', 'normBindings', 'supplementaryLawRefs'].includes(key)) continue;
      if (node.dataKind === 'holidayCatalog' && key === 'data') continue;
      walk(value, documentPath, `${jsonPath}/${key}`, context, isExcluded || key === 'excludedPaths');
    }
  }
  for (const document of documents) walk(document.value, safeRelative(document.path));
  return graph.sort((a, b) => `${a.documentPath}#${a.jsonPath}`.localeCompare(`${b.documentPath}#${b.jsonPath}`));
}

export function assembleMvp08SourceInventory(inputs) {
  const { candidate, prior, priorInventory, priorReview, priorApproval, priorAdoption, contract, register } = inputs;
  assert.equal(candidate.manifest.formatVersion, '8.0.0');
  assert.equal(candidate.manifest.releaseStatus, 'candidate', 'Only an unpromoted candidate is in scope');
  assert.equal(candidate.manifest.sourceSummary.legalBasisReviewStatus, 'pending');
  assert.equal(prior.manifest.releaseStatus, 'approved');
  assert.equal(priorApproval.recordStatus, 'approved');
  assert.equal(priorAdoption.releaseId, prior.manifest.releaseId);
  const catalog = candidate.documents.find(document => document.value.dataKind === 'holidayCatalog').value;
  const priorCatalog = prior.documents.find(document => document.value.dataKind === 'holidayCatalog').value;
  const adminDocument = candidate.documents.find(document => document.value.dataKind === 'administrativeProcedureCatalog');
  assert.ok(adminDocument, 'Missing administrative catalog');
  const administrative = adminDocument.value;
  assert.equal(administrative.runtimeActive, false);
  assert.equal(administrative.releaseBinding.status, 'candidate');
  assert.equal(administrative.releaseBinding.approval, null);
  assert.equal(administrative.releaseBinding.sourceReviewRef, null);
  assert.equal(catalog.activation.releaseEligibility.status, 'candidate');
  assert.equal(catalog.activation.releaseEligibility.approval, null);
  assert.deepEqual(catalog.activation.sourceEvidence, priorCatalog.activation.sourceEvidence, 'Existing source evidence changed');
  assert.deepEqual(catalog.data, priorCatalog.data, 'Historical catalog changed');
  const definitions = sourceDefinitions(candidate.documents);
  const priorDefinitions = sourceDefinitions(prior.documents);
  const manifestIds = unique(candidate.manifest.sourceSummary.sourceIds);
  assert.equal(manifestIds.length, candidate.manifest.sourceSummary.sourceIds.length, 'Duplicate manifest source');
  assert.deepEqual(manifestIds, unique([...definitions.keys()]), 'Manifest source summary differs from definitions');
  for (const [id, occurrences] of priorDefinitions) for (const occurrence of occurrences) {
    assert.ok(definitions.get(id)?.some(item => isDeepStrictEqual(item, occurrence)), `Prior source metadata changed: ${id}`);
  }
  assert.deepEqual(administrative.sources, contract.sources, 'Administrative source definitions differ from accepted contract');
  const historicalCatalog = uniqueRows(catalog.data.sources, 'id', 'Historical catalog');
  const evidence = uniqueRows(catalog.activation.sourceEvidence, 'id', 'Activation evidence');
  const mappings = uniqueRows(catalog.activation.sourceIdMap, 'evidenceId', 'Evidence mapping');
  assert.deepEqual(unique([...evidence.keys()]), unique([...mappings.keys()]), 'Incomplete evidence mapping');
  const mappedIds = catalog.activation.sourceIdMap.map(row => row.sourceId);
  assert.equal(unique(mappedIds).length, mappedIds.length, 'Ambiguous canonical evidence mapping');
  for (const row of mappings.values()) assert.equal(row.sourceId, row.evidenceId.startsWith('SRC-') ? row.evidenceId : `SRC-${row.evidenceId}`, 'Noncanonical evidence mapping');
  const allIds = unique([...manifestIds, ...historicalCatalog.keys(), ...mappedIds]);
  const allIdSet = new Set(allIds);
  const historicalReviews = uniqueRows(priorReview.coverage, 'sourceId', 'MVP07 source coverage');
  const priorRows = uniqueRows(priorInventory.rows, 'sourceId', 'MVP07 inventory');
  assert.deepEqual(unique([...historicalReviews.keys()]), unique([...priorRows.keys()]), 'Prior review coverage incomplete');
  assert.equal(minus([...historicalReviews.keys()], allIds).length, 0, 'Prior source omitted');
  const newIds = minus(allIds, [...historicalReviews.keys()]);
  assert.deepEqual(newIds, unique(administrative.sources.map(row => row.sourceId)), 'Unexpected new source population');
  const graph = collectReferenceGraph(candidate.documents, allIdSet, mappings);
  const priorGraph = collectReferenceGraph(prior.documents, allIdSet, mappings);
  const oldGraph = graph.filter(edge => edge.documentPath !== adminDocument.path);
  assert.deepEqual(oldGraph, priorGraph, 'Existing reference graph changed or incomplete');
  const administrativeGraph = graph.filter(edge => edge.documentPath === adminDocument.path);
  assert.deepEqual(administrativeGraph, collectReferenceGraph([{ path: adminDocument.path, value: contract }], allIdSet, mappings),
    'Administrative reference graph differs from accepted contract');
  const registered = uniqueRows(register.sources, 'sourceId', 'Governance register');
  const binding = key => inputs.bindings.find(item => item.path === inventoryPaths[key]);
  const rows = allIds.map(sourceId => {
    const previous = historicalReviews.get(sourceId);
    const uses = graph.filter(edge => edge.sourceId === sourceId);
    const definitionRows = definitions.get(sourceId) ?? [];
    const newSource = administrative.sources.find(row => row.sourceId === sourceId);
    return {
      sourceId, group: previous ? 'priorMvp07' : 'newAdministrativeAP23B',
      kind: newSource?.kind ?? registered.get(sourceId)?.sourceType ?? null,
      inManifest: manifestIds.includes(sourceId), inRegister: registered.has(sourceId),
      sourceRecordOccurrences: definitionRows,
      referenceUse: uses.some(edge => !edge.excluded) ? 'positive-or-shared-reference' : uses.length ? 'exclusion-only' : 'supporting-or-monitoring-unreferenced',
      positiveOrSharedEdges: uses.filter(edge => !edge.excluded).length, exclusionEdges: uses.filter(edge => edge.excluded).length,
      referenceLocations: uses.map(edge => `${edge.documentPath}#${edge.jsonPath}`),
      historicalAssessment: previous ? {
        review: binding('priorReview'), sourcePointer: `/coverage/${priorReview.coverage.indexOf(previous)}`,
        reviewedOn: priorReview.checkedOn, outcome: previous.outcome, method: previous.method,
        scope: previous.outcomeScope, relevantProvisions: previous.relevantProvisions,
        evidence: [...previous.freshEvidence, ...previous.reusedEvidence],
        humanApproval: binding('priorApproval'), appliesOnlyToPriorRelease: true
      } : { review: binding('ap23Review'), acceptance: binding('ap23Acceptance'), reviewedOn: newSource.reviewedOn,
        locators: newSource.locators, rawOriginalArchiveBound: false,
        limitation: 'AP23B report and human acceptance only. No archived AP23B original bytes are claimed.' },
      proposedReviewTreatment: previous ? 'boundedReuseEligibilityToBeAssessedWithCurrentVersionScreen' : 'freshTargetedSourceAndVersionReviewWithAP23BInterpretationReuse',
      freshLegalReviewStatus: 'pending', freshEvidence: [], sourceReleaseApproved: false
    };
  });
  const pathMap = uniqueRows(administrative.paths, 'pathId', 'Administrative paths');
  const pathEligibility = uniqueRows(administrative.releaseBinding.pathEligibility, 'pathId', 'Administrative eligibility');
  assert.deepEqual(unique([...pathMap.keys()]), unique([...pathEligibility.keys()]), 'Incomplete path eligibility');
  for (const row of pathEligibility.values()) {
    assert.equal(row.status, 'candidate');
    assert.equal(row.sourceReviewRef, null);
    assert.equal(row.referenceSuiteRef, null);
    assert.deepEqual(row.targetComponentRefs, []);
  }
  return {
    inventoryId: 'MVP08-SOURCE-INVENTORY-20261015', formatVersion: '1.0.0', preparedOn: '2026-10-15', recordStatus: 'candidate',
    candidateReleaseId: candidate.manifest.releaseId, comparedReleaseId: prior.manifest.releaseId,
    humanApproval: false, sourceReleaseApproved: false, dataPromotionApproved: false, publicationApproved: false,
    freshLegalVerificationPerformed: false, completeReleaseReview: false,
    counts: { candidateManifest: manifestIds.length, priorManifest: prior.manifest.sourceSummary.sourceIds.length,
      allCanonicalSourceIds: allIds.length, priorReviewedSources: historicalReviews.size, newAdministrativeSources: newIds.length,
      newAdministrativeKinds: countBy(administrative.sources, 'kind'), historicalCatalog: historicalCatalog.size,
      activationEvidence: evidence.size, referenceGraphEdges: graph.length, previousReferenceGraphEdges: priorGraph.length,
      newAdministrativeReferenceEdges: administrativeGraph.length, referenceGraphKinds: countBy(graph, 'kind'),
      referenceUses: countBy(rows, 'referenceUse'), boundHistoricalEvidenceFiles: inputs.historicalEvidence.length,
      governanceRegister: registered.size, missingFromRegister: minus(allIds, [...registered.keys()]).length,
      historicalRegisterOnly: minus([...registered.keys()], allIds).length, administrativePaths: pathMap.size, freshOfficialChecks: 0 },
    groups: { priorMvp07: unique([...historicalReviews.keys()]), newAdministrativeAP23B: newIds },
    historicalRegisterOnlySourceIds: minus([...registered.keys()], allIds),
    administrativeSourceEligibility: { status: 'candidate', runtimeActive: false, sourceReviewRef: null,
      referenceSuiteRef: administrative.releaseBinding.referenceSuiteRef, approval: null,
      pathEligibility: administrative.releaseBinding.pathEligibility,
      meaning: 'Technical contract approval and AP23D3 acceptance do not approve source release eligibility.' },
    interpretation: {
      countingUnit: 'Canonical source IDs, not unique physical laws or new legal reviews.',
      sourceScope: 'Union of manifest sources, preserved holiday catalog sources and canonical activation evidence.',
      graph: 'Same literal traversal as MVP07 plus administrative laws, holidayPolicyReview, suspensionProfiles, holidayBindings.legalBinding and paths. Source definitions and historical catalog data are not direct edges.',
      sourceEligibility: 'Catalogue and all twelve path release/sourceReview/referenceSuite bindings remain candidate and null. No inferred authority to promote.',
      freshEvidence: 'Reading and hashing existing local files confirms their integrity only. It is not a fresh source retrieval or content/version check.',
      priorReuse: 'All 232 previous source uses are unchanged. Their eligibility for bounded reuse still needs explicit assessment and inclusion in the new source report.',
      aliases: 'AP23B CH-HOL, TI-HOL, GR-RTG and GR-VRG concern already known instruments but use distinct review IDs. Prior calendar review does not silently approve new administrative propositions.',
      limitations: 'AI conflict, supplementary FR mirror, GR/NE reservations, January uncertainty, TI-O2, AVIV option B and OF-001 remain unchanged.'
    },
    historicalEvidenceBindings: inputs.historicalEvidence,
    evidenceBindings: inputs.bindings,
    referenceGraph: graph,
    rows
  };
}

export function writeMvp08Inventory(inventory, root = repositoryRoot) {
  assert.equal(inventory.recordStatus, 'candidate');
  for (const key of ['humanApproval', 'sourceReleaseApproved', 'dataPromotionApproved', 'publicationApproved', 'freshLegalVerificationPerformed', 'completeReleaseReview']) {
    assert.equal(inventory[key], false, `Preparation status must remain false: ${key}`);
  }
  for (const item of inventory.evidenceBindings) {
    const bytes = readBytes(root, item.path);
    assert.equal(hash(bytes), item.sha256, `Input changed before write: ${item.path}`);
    assert.equal(bytes.length, item.byteLength, `Input length changed before write: ${item.path}`);
  }
  const destination = path.resolve(root, inventoryPaths.output);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  assert.ok(fs.realpathSync(path.dirname(destination)).startsWith(fs.realpathSync(root) + path.sep), 'Output path escapes repository');
  const bytes = Buffer.from(JSON.stringify(inventory, null, 2) + '\n');
  fs.writeFileSync(destination, bytes, { flag: 'wx' });
  assert.equal(hash(fs.readFileSync(destination)), hash(bytes), 'Written inventory differs');
  return { path: inventoryPaths.output, sha256: hash(bytes), byteLength: bytes.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  assert.ok(args.length === 0 || (args.length === 1 && args[0] === '--write'), 'Only --write is supported');
  const inventory = assembleMvp08SourceInventory(loadMvp08InventoryInputs());
  const output = args.includes('--write') ? writeMvp08Inventory(inventory) : null;
  console.log(JSON.stringify({ inventoryId: inventory.inventoryId, counts: inventory.counts, output,
    liveGovernanceWrite: false, freshLegalVerificationPerformed: false, sourceReleaseApproved: false }, null, 2));
}
