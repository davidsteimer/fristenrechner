// SPDX-License-Identifier: AGPL-3.0-only
// R09-A1 preparation only. No network, release promotion or governance mutation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';
import { collectReferenceGraph, safeRelative } from './inventory-mvp08-sources.mjs';
export { safeRelative };

export const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
export const inventoryPaths = Object.freeze({
  candidate: 'outputs/ap23e3-candidate-2026-10-18/bundle',
  prior: 'data/releases/2026-10-15-mvp-08-approved.1',
  priorInventory: 'outputs/release-mvp08-2026-10-15/sources/source-inventory.json',
  priorReview: 'outputs/release-mvp08-2026-10-15/source-review-completeness.json',
  priorApproval: 'outputs/release-mvp08-2026-10-15/source-approval.json',
  priorAdoption: 'outputs/release-mvp08-2026-10-15/source-governance-adoption.json',
  ap23Review: 'docs/fachrecht/quellenpruefung-ap23e1.md',
  ap23Acceptance: 'docs/fachrecht/abnahme-ap23e1.md',
  ap23Versions: 'outputs/ap23e1-2026-10-18/quellenfassungen.json',
  contract: 'outputs/ap23e2-candidate-2026-10-18/bundle/administrative-procedures/ch-cantonal-administrative-procedures.json',
  register: 'data/source-reviews/source-register.json',
  graphImplementation: 'scripts/inventory-mvp08-sources.mjs',
  output: 'outputs/release-mvp09-2026-10-18/sources/source-inventory.json'
});
const expected = Object.freeze({
  [`${inventoryPaths.candidate}/manifest.json`]: '4c9f6025b7e29f577f760d2c9381066a176486983e0bae6997ac8738661ffa31',
  [`${inventoryPaths.prior}/manifest.json`]: '2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4',
  [inventoryPaths.priorInventory]: '6d40975ddf0fc334a43ae7444033037ab9809a90763be2461dc21b139d589526',
  [inventoryPaths.priorReview]: 'e0c1012036fe1ddda95ab660d1153b203de19e8a75d9d6245da78d60e4796c66',
  [inventoryPaths.priorApproval]: '53a7f9e8b304c2552e89dc6fa4787b178170bde31aaf55100f5aed55cd995026',
  [inventoryPaths.priorAdoption]: 'd57a3815ae9f2659cfc85fa5588f941e526282781b45b2a7fc60db472ddc3ec2',
  [inventoryPaths.ap23Review]: '9cdecc68aef5cf0b0280d8403b4f0c1e52ffb713a3687c741541a4bbb028fb3c',
  [inventoryPaths.ap23Acceptance]: '20bdf2f5050d9c902f21fc921d8b640131cc7a45a81a10b108ca69202fbc8418',
  [inventoryPaths.ap23Versions]: '5e3b7eba72210ccd2740c3ab19379c8b7dbb2f16c6d52724dbfd6e9f09a2d71d',
  [inventoryPaths.graphImplementation]: '4004f02b9c462a64430db86fe8c23daaeaa15562feba484d021b90da83d6be15',
  [inventoryPaths.contract]: '0c3aca271cda7e4ffb90221bc44b6064ef795856fc9701c13a50429949e488c9'
});
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const unique = values => [...new Set(values)].sort();
const minus = (a, b) => a.filter(value => !b.includes(value));
const countBy = (rows, key) => rows.reduce((all, row) => ({ ...all, [row[key]]: (all[row[key]] ?? 0) + 1 }), {});
const adminPath = 'administrative-procedures/ch-cantonal-administrative-procedures.json';
const aliases = Object.freeze({
  'SRC-AP23E1-LU-VRG-20210901': ['SRC-LU-VRG-40-20210901', 'SRC-AP22CLOSE-PROC-LU-VRG'],
  'SRC-AP23E1-LU-RTG-20260927': ['SRC-LU-RLG-855-20200501'],
  'SRC-AP23E1-ZG-VRG-20251017': ['SRC-ZG-VRG-1621-20251017', 'SRC-AP22CLOSE-PROC-ZG-VRG'],
  'SRC-AP23E1-AR-ARGV-20160101': ['SRC-AR-ARGV-82211-V1058']
});
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
export function loadMvp09InventoryInputs(root = repositoryRoot) {
  const bindings = new Map();
  function bind(relative, sha256, byteLength) {
    const bytes = readBytes(root, relative);
    const item = { path: relative, sha256: hash(bytes), byteLength: bytes.length };
    if (expected[relative]) assert.equal(item.sha256, expected[relative], `Pinned input changed: ${relative}`);
    if (sha256) assert.equal(item.sha256, sha256, `Evidence hash changed: ${relative}`);
    if (byteLength !== undefined) assert.equal(item.byteLength, byteLength, `Evidence length changed: ${relative}`);
    if (bindings.has(relative)) assert.deepEqual(item, bindings.get(relative), `Conflicting evidence: ${relative}`);
    bindings.set(relative, item);
    return bytes;
  }
  const read = relative => JSON.parse(bind(relative));
  function bundle(prefix) {
    const manifest = read(`${prefix}/manifest.json`);
    uniqueRows(manifest.artifacts, 'path', 'Manifest artifacts');
    return { manifest, documents: manifest.artifacts.map(artifact => ({ path: safeRelative(artifact.path),
      value: JSON.parse(bind(`${prefix}/${safeRelative(artifact.path)}`, artifact.sha256, artifact.byteLength)) })) };
  }
  const candidate = bundle(inventoryPaths.candidate);
  const prior = bundle(inventoryPaths.prior);
  const priorInventory = read(inventoryPaths.priorInventory);
  const priorReview = read(inventoryPaths.priorReview);
  const priorApproval = read(inventoryPaths.priorApproval);
  const priorAdoption = read(inventoryPaths.priorAdoption);
  const contract = read(inventoryPaths.contract);
  const register = read(inventoryPaths.register);
  const ap23Versions = read(inventoryPaths.ap23Versions);
  for (const key of ['ap23Review', 'ap23Acceptance', 'graphImplementation']) bind(inventoryPaths[key]);
  const historicalEvidence = new Map();
  for (const row of priorReview.coverage) for (const item of [...row.freshEvidence, ...row.reusedEvidence]) {
    bind(item.path, item.sha256, item.byteLength);
    historicalEvidence.set(item.path, bindings.get(item.path));
  }
  // Include report-wide evidence as well as per-source originals. The union,
  // not a historic summary count, is what this inventory actually rehashes.
  for (const item of priorReview.evidence) {
    bind(item.path, item.sha256, item.byteLength);
    historicalEvidence.set(item.path, bindings.get(item.path));
  }
  const ap23Originals = ap23Versions.map(row => {
    const relative = `.work/ap23e1-source-checks/${safeRelative(row.id)}.json`;
    bind(relative, row.sha256);
    return { id: row.id, url: row.url, retrievedAt: row.retrievedAt, currentVersion: row.currentVersion,
      futureVersions: row.futureVersions, abrogated: row.abrogated, matchesExpected: row.matchesExpected,
      evidence: bindings.get(relative), evidenceScope: 'Historical AP23E1 original bytes only. Not a new R09 retrieval or assessment.' };
  });
  return { candidate, prior, priorInventory, priorReview, priorApproval, priorAdoption, contract, register, ap23Originals,
    historicalEvidence: [...historicalEvidence.values()].sort((a, b) => a.path.localeCompare(b.path)),
    bindings: [...bindings.values()].sort((a, b) => a.path.localeCompare(b.path)) };
}
function definitions(documents) {
  const all = new Map();
  for (const document of documents) {
    safeRelative(document.path);
    uniqueRows(document.value.sources ?? [], 'sourceId', document.path);
    for (const source of document.value.sources ?? []) {
      if (!all.has(source.sourceId)) all.set(source.sourceId, []);
      all.get(source.sourceId).push({ documentPath: document.path, source });
    }
  }
  return all;
}
/** Workbook references are supplementary provenance, never runtime activation. */
export function collectHistoricalCatalogGraph(catalog, allIds) {
  const graph = [];
  for (const key of ['scopes', 'rules', 'assignments', 'reviews']) for (const [index, row] of catalog.data[key].entries()) {
    const field = key === 'assignments' ? 'sourceId' : 'source';
    if (!row[field]) continue;
    assert.ok(allIds.has(row[field]), `Unknown historical source reference: ${row[field]}`);
    graph.push({ sourceId: row[field], documentPath: 'holiday-catalogs/ch-holiday-catalog.json',
      jsonPath: `/data/${key}/${index}/${field}`, componentId: row.id, locator: row.locator ?? null,
      kind: 'historicalCatalogProvenance', runtimeActivation: false });
  }
  return graph;
}
export function assembleMvp09SourceInventory(inputs) {
  const { candidate, prior, priorInventory, priorReview, priorApproval, priorAdoption, contract, register } = inputs;
  assert.equal(candidate.manifest.formatVersion, '9.0.0');
  assert.equal(candidate.manifest.releaseStatus, 'candidate', 'Only an unpromoted candidate is in scope');
  assert.equal(candidate.manifest.sourceSummary.legalBasisReviewStatus, 'pending');
  assert.equal(prior.manifest.releaseStatus, 'approved');
  assert.equal(priorApproval.recordStatus, 'approved');
  assert.equal(priorAdoption.releaseId, prior.manifest.releaseId);
  const catalog = candidate.documents.find(row => row.value.dataKind === 'holidayCatalog').value;
  const previousCatalog = prior.documents.find(row => row.value.dataKind === 'holidayCatalog').value;
  const administrative = candidate.documents.find(row => row.path === adminPath)?.value;
  const oldAdministrative = prior.documents.find(row => row.path === adminPath)?.value;
  assert.ok(administrative && oldAdministrative, 'Missing administrative catalog');
  assert.equal(administrative.formatVersion, '2.0.0');
  assert.equal(administrative.runtimeActive, false);
  assert.equal(administrative.releaseBinding.status, 'candidate');
  assert.equal(administrative.releaseBinding.approval, null);
  assert.equal(administrative.releaseBinding.sourceReviewRef, null);
  assert.equal(catalog.activation.releaseEligibility.status, 'candidate');
  assert.equal(catalog.activation.releaseEligibility.approval, null);
  assert.deepEqual(catalog.activation.sourceEvidence, previousCatalog.activation.sourceEvidence, 'Existing source evidence changed');
  assert.deepEqual(catalog.activation.sourceIdMap, previousCatalog.activation.sourceIdMap, 'Existing evidence mapping changed');
  assert.deepEqual(catalog.data, previousCatalog.data, 'Historical catalog changed');
  const sourceDefinitions = definitions(candidate.documents);
  const priorDefinitions = definitions(prior.documents);
  const manifestIds = unique(candidate.manifest.sourceSummary.sourceIds);
  assert.equal(manifestIds.length, candidate.manifest.sourceSummary.sourceIds.length, 'Duplicate manifest source');
  assert.deepEqual(manifestIds, unique([...sourceDefinitions.keys()]), 'Manifest source summary differs from definitions');
  for (const [id, occurrences] of priorDefinitions) for (const occurrence of occurrences)
    assert.ok(sourceDefinitions.get(id)?.some(item => isDeepStrictEqual(item, occurrence)), `Prior source metadata changed: ${id}`);
  assert.deepEqual(administrative.sources, contract.sources, 'Administrative source definitions differ from accepted contract');
  for (const old of oldAdministrative.paths)
    assert.deepEqual(administrative.paths.find(row => row.pathId === old.pathId), old, `Prior administrative path changed: ${old.pathId}`);
  for (const key of ['laws', 'suspensionProfiles', 'qualificationPolicies', 'paths', 'excludedPaths'])
    assert.deepEqual(administrative[key], contract[key], `Administrative contract section changed: ${key}`);
  const historical = uniqueRows(catalog.data.sources, 'id', 'Historical catalog');
  const evidence = uniqueRows(catalog.activation.sourceEvidence, 'id', 'Activation evidence');
  const mappings = uniqueRows(catalog.activation.sourceIdMap, 'evidenceId', 'Evidence mapping');
  assert.deepEqual(unique([...evidence.keys()]), unique([...mappings.keys()]), 'Incomplete evidence mapping');
  const mappedIds = [...mappings.values()].map(row => row.sourceId);
  assert.equal(unique(mappedIds).length, mappedIds.length, 'Ambiguous canonical evidence mapping');
  for (const row of mappings.values()) assert.equal(row.sourceId, row.evidenceId.startsWith('SRC-') ? row.evidenceId : `SRC-${row.evidenceId}`, 'Noncanonical evidence mapping');
  const allIds = unique([...manifestIds, ...historical.keys(), ...mappedIds]);
  const allIdSet = new Set(allIds);
  const historicalReviews = uniqueRows(priorReview.coverage, 'sourceId', 'MVP08 coverage');
  assert.deepEqual(unique([...historicalReviews.keys()]), unique(priorInventory.rows.map(row => row.sourceId)), 'Prior review coverage incomplete');
  assert.equal(minus([...historicalReviews.keys()], allIds).length, 0, 'Prior source omitted');
  const newIds = minus(allIds, [...historicalReviews.keys()]);
  const newAdminSources = administrative.sources.filter(row => !oldAdministrative.sources.some(old => old.sourceId === row.sourceId));
  assert.deepEqual(newIds, unique(newAdminSources.map(row => row.sourceId)), 'Unexpected new source population');
  const graph = collectReferenceGraph(candidate.documents, allIdSet, mappings);
  const priorGraph = collectReferenceGraph(prior.documents, allIdSet, mappings);
  assert.deepEqual(priorGraph, priorInventory.referenceGraph, 'Prior approved graph differs from its approved inventory');
  const oldGraphByLocation = new Map(priorGraph.map(row => [`${row.documentPath}#${row.jsonPath}`, row]));
  const graphByLocation = new Map(graph.map(row => [`${row.documentPath}#${row.jsonPath}`, row]));
  for (const [location, old] of oldGraphByLocation) assert.deepEqual(graphByLocation.get(location), old, `Existing reference graph changed: ${location}`);
  const additions = graph.filter(row => !oldGraphByLocation.has(`${row.documentPath}#${row.jsonPath}`));
  assert.ok(additions.every(row => row.documentPath === adminPath), 'Unexpected non-administrative reference addition');
  assert.deepEqual(graph.filter(row => row.documentPath === adminPath),
    collectReferenceGraph([{ path: adminPath, value: contract }], allIdSet, mappings), 'Administrative reference graph differs from accepted contract');
  const historicalGraph = collectHistoricalCatalogGraph(catalog, allIdSet);
  assert.deepEqual(historicalGraph, collectHistoricalCatalogGraph(previousCatalog, allIdSet), 'Historical provenance graph changed');
  const registered = uniqueRows(register.sources, 'sourceId', 'Governance register');
  const binding = key => inputs.bindings.find(item => item.path === inventoryPaths[key]);
  const rows = allIds.map(sourceId => {
    const previous = historicalReviews.get(sourceId);
    const sourceRows = sourceDefinitions.get(sourceId) ?? [];
    const uses = graph.filter(row => row.sourceId === sourceId);
    const newUses = additions.filter(row => row.sourceId === sourceId);
    const historic = historical.get(sourceId);
    const activation = [...mappings.values()].filter(row => row.sourceId === sourceId).map(row => evidence.get(row.evidenceId));
    const rawSource = newAdminSources.find(row => row.sourceId === sourceId);
    return { sourceId, group: previous ? 'priorMvp08' : 'newAdministrativeAP23E1',
      kind: rawSource?.kind ?? registered.get(sourceId)?.sourceType ?? null,
      inManifest: manifestIds.includes(sourceId), inRegister: registered.has(sourceId),
      sourceRecordOccurrences: sourceRows, historicalCatalogRecord: historic ?? null, activationEvidenceRecords: activation,
      urls: unique([...sourceRows.map(row => row.source.url), historic?.url, ...activation.map(row => row.url)].filter(Boolean)),
      samePhysicalInstrumentPriorSourceIds: aliases[sourceId] ?? [],
      priorSourceDefinitionRetained: previous !== undefined,
      referenceUse: uses.some(row => !row.excluded) ? 'positive-or-shared-reference' : uses.length ? 'exclusion-only' : 'supporting-or-monitoring-unreferenced',
      positiveOrSharedEdges: uses.filter(row => !row.excluded).length, exclusionEdges: uses.filter(row => row.excluded).length,
      referenceLocations: uses.map(row => `${row.documentPath}#${row.jsonPath}`),
      newReferenceLocations: newUses.map(row => `${row.documentPath}#${row.jsonPath}`),
      newUseOfPreviouslyReviewedSource: Boolean(previous && newUses.length),
      historicalProvenanceLocations: historicalGraph.filter(row => row.sourceId === sourceId).map(row => `${row.documentPath}#${row.jsonPath}`),
      historicalAssessment: previous ? { review: binding('priorReview'), sourcePointer: `/coverage/${priorReview.coverage.indexOf(previous)}`,
        reviewedOn: priorReview.checkedOn, outcome: previous.outcome, method: previous.method, scope: previous.outcomeScope,
        relevantProvisions: previous.relevantProvisions, versionFinding: previous.versionFinding,
        evidence: [...previous.freshEvidence, ...previous.reusedEvidence], humanApproval: binding('priorApproval'), appliesOnlyToPriorRelease: true }
        : { review: binding('ap23Review'), acceptance: binding('ap23Acceptance'), reviewedOn: rawSource.reviewedOn,
          locators: rawSource.locators, limitation: 'Historical E1 interpretation. Original registry responses are separately bound where available, no new retrieval or release approval.' },
      proposedReviewTreatment: !previous ? 'targetedNewAdministrativeUseAndVersionAssessmentWithExplicitE1Reuse'
        : newUses.length ? 'freshAssessmentOfNewAdministrativeUsePlusBoundedReuseOfUnchangedPriorUses'
          : 'boundedReuseEligibilityToBeAssessedWithCurrentVersionScreen',
      freshLegalReviewStatus: 'pending', freshEvidence: [], sourceReleaseApproved: false };
  });
  for (const row of rows) for (const alias of row.samePhysicalInstrumentPriorSourceIds)
    assert.ok(historicalReviews.has(alias), `Unverified physical-instrument alias: ${alias}`);
  const paths = uniqueRows(administrative.paths, 'pathId', 'Administrative paths');
  const eligibility = uniqueRows(administrative.releaseBinding.pathEligibility, 'pathId', 'Administrative eligibility');
  assert.deepEqual(unique([...paths.keys()]), unique([...eligibility.keys()]), 'Incomplete path eligibility');
  for (const row of eligibility.values()) {
    assert.equal(row.status, 'candidate');
    assert.equal(row.sourceReviewRef, null);
    assert.equal(row.referenceSuiteRef, null);
    assert.deepEqual(row.targetComponentRefs, []);
  }
  return { inventoryId: 'MVP09-SOURCE-INVENTORY-20261018', formatVersion: '1.0.0', preparedOn: '2026-10-18', recordStatus: 'candidate',
    candidateReleaseId: candidate.manifest.releaseId, comparedReleaseId: prior.manifest.releaseId,
    humanApproval: false, sourceReleaseApproved: false, dataPromotionApproved: false, publicationApproved: false,
    freshLegalVerificationPerformed: false, completeReleaseReview: false,
    counts: { candidateManifest: manifestIds.length, priorManifest: prior.manifest.sourceSummary.sourceIds.length,
      allCanonicalSourceIds: allIds.length, priorReviewedSources: historicalReviews.size, newAdministrativeSources: newIds.length,
      newAdministrativeKinds: countBy(newAdminSources, 'kind'), newIdsForPreviouslyKnownInstruments: Object.keys(aliases).length,
      historicalCatalog: historical.size, activationEvidence: evidence.size, referenceGraphEdges: graph.length,
      previousReferenceGraphEdges: priorGraph.length, newAdministrativeReferenceEdges: additions.length,
      existingSourceIdsWithNewUses: rows.filter(row => row.newUseOfPreviouslyReviewedSource).length,
      referenceGraphKinds: countBy(graph, 'kind'), referenceUses: countBy(rows, 'referenceUse'),
      historicalProvenanceEdges: historicalGraph.length, boundHistoricalEvidenceFiles: inputs.historicalEvidence.length,
      boundE1RegistryOriginals: inputs.ap23Originals.length, governanceRegister: registered.size,
      missingFromRegister: minus(allIds, [...registered.keys()]).length, historicalRegisterOnly: minus([...registered.keys()], allIds).length,
      administrativePaths: paths.size, preservedAdministrativePaths: oldAdministrative.paths.length,
      newAdministrativePaths: paths.size - oldAdministrative.paths.length, freshOfficialChecks: 0 },
    groups: { priorMvp08: unique([...historicalReviews.keys()]), newAdministrativeAP23E1: newIds,
      existingSourceIdsWithNewUses: rows.filter(row => row.newUseOfPreviouslyReviewedSource).map(row => row.sourceId) },
    historicalRegisterOnlySourceIds: minus([...registered.keys()], allIds),
    administrativeSourceEligibility: { status: 'candidate', runtimeActive: false, sourceReviewRef: null,
      referenceSuiteRef: administrative.releaseBinding.referenceSuiteRef, approval: null,
      pathEligibility: administrative.releaseBinding.pathEligibility,
      meaning: 'AP23E3 acceptance and DEC-2026-033 approve technical work only, not new source or data release eligibility.' },
    interpretation: {
      countingUnit: 'Canonical source IDs, not unique physical statutes or freshly reviewed documents. Four new IDs represent already known instruments with new administrative uses.',
      sourceScope: 'Union of manifest sources, preserved holiday catalog sources and canonical activation evidence.',
      graph: 'All prior MVP08 literal source edges retained. New administrative edges are separately listed, including new uses of existing source IDs. Supplementary historical workbook provenance is a separate non-runtime graph.',
      historicalEvidence: 'Hashing existing local files confirms byte integrity only. It is not a fresh content or version check.',
      priorReuse: 'Unchanged prior usage allows a bounded-reuse proposal, not automatic approval. Existing IDs with new uses require an explicit new-use assessment.',
      limitations: 'AI conflict, supplementary FR mirror, GR/NE reservations, January uncertainty, TI-O2, AR-O1, AVIV option B and OF-001 remain unchanged.' },
    historicalEvidenceBindings: inputs.historicalEvidence, historicalE1RegistryOriginals: inputs.ap23Originals,
    evidenceBindings: inputs.bindings, referenceGraph: graph, addedReferenceGraph: additions,
    historicalCatalogProvenanceGraph: historicalGraph, rows };
}
export function writeMvp09Inventory(inventory, root = repositoryRoot) {
  assert.equal(inventory.recordStatus, 'candidate');
  for (const key of ['humanApproval', 'sourceReleaseApproved', 'dataPromotionApproved', 'publicationApproved', 'freshLegalVerificationPerformed', 'completeReleaseReview'])
    assert.equal(inventory[key], false, `Preparation status must remain false: ${key}`);
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
  assert.ok(args.length === 0 || args.length === 1 && args[0] === '--write', 'Only --write is supported');
  const inventory = assembleMvp09SourceInventory(loadMvp09InventoryInputs());
  const output = args.includes('--write') ? writeMvp09Inventory(inventory) : null;
  console.log(JSON.stringify({ inventoryId: inventory.inventoryId, counts: inventory.counts, output,
    liveGovernanceWrite: false, freshLegalVerificationPerformed: false, sourceReleaseApproved: false }, null, 2));
}
