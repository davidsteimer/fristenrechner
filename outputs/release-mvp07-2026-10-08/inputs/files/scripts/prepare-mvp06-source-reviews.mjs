// SPDX-License-Identifier: AGPL-3.0-only
// Controlled append-only governance adoption, after a real local-only approval.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { root, prefix, approvalPath, releaseId, hash, encoded, completenessPath,
  verifyMvp06SourceApproval } from './verify-mvp06-source-approval.mjs';
import { persistMvp06ApprovalArtifact } from './record-mvp06-source-approval.mjs';
import { historicalRoot } from './prepare-mvp06-inputs.mjs';

export const registerPath = 'data/source-reviews/source-register.json';
export const indexPath = 'data/source-reviews/index.json';
export const eventPath = 'data/source-reviews/events/2026-10-01-mvp-06-prerelease.1.json';
export const adoptionPath = `${prefix}/source-governance-adoption.json`;
export const approvedManifestSha256 = '637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724';
const oldRegisterHash = 'eb89b94c839fb01d92c4168dd99183d1c40818299b0a364247007b5bd933df7a';
const oldIndexHash = '017179338852bddac965a11718912bf2cf7ef793884a8ae1d5d8f2b639ee31fe';
const unique = values => [...new Set(values)].sort();
const oldEventIds = ['2026-08-31-initial-consolidation.1', '2026-09-22-mvp-04-prerelease.1', '2026-09-28-mvp-05-prerelease.1'];
const oldEventHashes = ['3b6884e3d929bd47006a9aeff453288de6102d2c1c50c8d6f92a88115bdce3dd',
  null, '1d3dc59e02f5c67026cab22d7d20ddcca68840840ec54029c36f51482816f372'];

export function validateMvp06AdoptionManifest(bytes) {
  assert.equal(hash(bytes), approvedManifestSha256, 'Governance adoption requires the exact approved MVP06 manifest');
  return JSON.parse(bytes);
}

export function assembleMvp06SourceGovernance({ oldRegister, manifest, documents, inventory, completeness, approval }) {
  assert.equal(oldRegister.sources.length, 57);
  assert.equal(oldRegister.registerStatus, 'approved');
  assert.equal(manifest.releaseId, releaseId);
  assert.equal(manifest.releaseStatus, 'approved');
  assert.equal(manifest.formatVersion, '6.0.0');
  assert.equal(approval.reviewId, 'MVP06-SOURCE-APPROVAL-20261001');
  assert.equal(approval.permissions.localDataPromotionAuthorized, true);
  const ids = [...manifest.sourceSummary.sourceIds].sort();
  assert.equal(ids.length, 77);
  assert.equal(new Set(ids).size, 77);
  assert.deepEqual(inventory.entries.map(e => e.sourceId).sort(), ids);
  assert.deepEqual(completeness.manifestCoverage.map(e => e.sourceId).sort(), ids);
  const sources = new Map(), usages = new Map();
  for (const doc of documents) {
    for (const source of doc.sources ?? []) sources.set(source.sourceId, source);
    function walk(node, excluded = false) {
      if (Array.isArray(node)) return node.forEach(item => walk(item, excluded));
      if (!node || typeof node !== 'object') return;
      const isExcluded = excluded || Boolean(node.excludedPathId);
      for (const key of ['sourceRefs', 'normBindings', 'supplementaryLawRefs']) for (const ref of node[key] ?? []) {
        const use = usages.get(ref.sourceId) ?? { locators: [], positive: false, excluded: false };
        if (ref.locator) use.locators.push(ref.locator);
        if (isExcluded) use.excluded = true; else use.positive = true;
        usages.set(ref.sourceId, use);
      }
      for (const [key, value] of Object.entries(node)) walk(value, isExcluded || key === 'excludedPaths');
    }
    walk(doc);
  }
  for (const row of inventory.entries) {
    assert.deepEqual(sources.get(row.sourceId), row.sourceRecord, `Release source metadata drift: ${row.sourceId}`);
    const use = usages.get(row.sourceId);
    const actual = use?.positive ? 'positive-or-shared-reference' : use?.excluded ? 'exclusion-only' : 'supporting-or-monitoring-unreferenced';
    assert.equal(actual, row.referenceUse, `Reference use changed: ${row.sourceId}`);
  }
  const register = structuredClone(oldRegister), oldIds = new Set(register.sources.map(source => source.sourceId));
  const newIds = ids.filter(id => !oldIds.has(id));
  assert.equal(newIds.length, 24);
  for (const id of newIds) {
    const row = inventory.entries.find(e => e.sourceId === id), source = row.sourceRecord;
    const check = completeness.manifestCoverage.find(e => e.sourceId === id);
    const monitoring = row.referenceUse === 'supporting-or-monitoring-unreferenced' && source.documentVersionDate > '2026-10-01';
    const relevantProvisions = unique([...row.locators, ...(check.freshArticleScope ?? []).map(article => `Art. ${article}`)]);
    assert.ok(relevantProvisions.length > 0 && relevantProvisions.every(value => value.length <= 300), `Unbounded provisions: ${id}`);
    register.sources.push({ sourceId: id,
      usageStatus: row.referenceUse === 'positive-or-shared-reference' ? 'productive' : monitoring ? 'monitoring' : 'supporting',
      sourceType: source.sourceType, title: source.title, authority: source.authority,
      jurisdiction: source.authority === 'Kanton Bern' ? 'BE' : 'CH', officialLocator: source.title,
      officialUrl: source.url, retrievalUrl: source.url, documentVersionDate: source.documentVersionDate,
      subjectAreas: monitoring ? ['specialRegimes', 'amendmentMonitoring'] : ['specialRegimes'], relevantProvisions });
  }
  register.sources.sort((a, b) => a.sourceId.localeCompare(b.sourceId, 'en'));
  assert.ok(!register.scope.productiveReleaseIds.includes(releaseId));
  register.scope.productiveReleaseIds.push(releaseId);
  assert.equal(register.sources.length, 81);
  for (const source of oldRegister.sources) assert.deepEqual(register.sources.find(row => row.sourceId === source.sourceId), source);
  const byId = new Map(register.sources.map(source => [source.sourceId, source]));
  const event = { $schema: 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/source-review-event.schema.json',
    formatVersion: '1.0.0', dataKind: 'sourceReviewEvent', reviewEventId: '2026-10-01-mvp-06-prerelease.1',
    recordStatus: 'approved', recordedOn: '2026-10-01', trigger: 'preRelease',
    reviewWindow: { from: '2026-10-01', to: '2026-10-01' }, nextAnnualReviewDue: '2027-11-15',
    comparedReleaseIds: [releaseId], responsibility: { reviewedBy: 'David Steimer', documentedWith: 'Codex', formalFourEyes: false, operatingModel: 'personalUnion' },
    entries: completeness.manifestCoverage.map(item => {
      assert.equal(item.reviewedOn, '2026-10-01');
      assert.equal(item.outcome, 'unchanged');
      const correction = item.inventoryAssertionCorrection;
      let finding = correction ? `Unverändert im abgegrenzten Normumfang. Keine Byteidentität der ganzen Originale. Die Inventarannahme ist durch frischen Vergleich der Normtexte und Absatzinhalte korrigiert. Brücke: ${correction.evidencePath}.`
        : `${item.finding ?? 'Unverändert im abgegrenzten AP20-Modellumfang.'} ${item.limits ?? ''}`;
      if (item.broaderArticleReuse) finding += ' Die breitere frühere Lesung bleibt ausdrücklich wiederverwendet, keine neue uneingeschränkte Gesamtlesung.';
      if (item.referenceUse === 'exclusion-only') finding += ' Ausschliesslich Ausschlusspfad, keine positive operative Aktivierung.';
      if (item.referenceUse === 'supporting-or-monitoring-unreferenced') finding += ' Unterstützende Fassung oder Monitoring, keine eigene positive Regelreferenz.';
      finding += ` Methode: ${item.mode}. Beleg: ${item.evidencePath}. Indexnachtrag und gesonderte ELG-Art.-11-Bewertung bleiben verbindlich.`;
      assert.ok(finding.length <= 2000);
      const relevantProvisions = unique([...byId.get(item.sourceId).relevantProvisions,
        ...(usages.get(item.sourceId)?.locators ?? []), ...(correction?.freshComparedArticles ?? []).map(article => `Art. ${article}`)]);
      assert.ok(relevantProvisions.every(value => value.length <= 300));
      const hasRefs = usages.has(item.sourceId);
      const openWeekendIssue = ['SRC-BGG-20260401', 'SRC-VWVG-20220701'].includes(item.sourceId);
      return { sourceId: item.sourceId, reviewedOn: item.reviewedOn, outcome: 'unchanged',
        comparisonBasis: `Zusammengeführte Quellenprüfung MVP 0.6, am 1. Oktober 2026 von David Steimer abgenommen. ${approval.reviewId}. 82 ausschliessliche Katalogquellen bleiben separat historisch wiederverwendet, AI unverändert unklar.`,
        evidence: { method: /reus|mirror-bytes/.test(item.mode) && !correction ? 'consolidatedAcceptedReview' : 'targetedSubstantiveComparison', relevantProvisions, finding },
        affected: { resolutionMode: hasRefs ? 'allReferencesInRelease' : 'explicit', releaseIds: [releaseId],
          profileIds: hasRefs ? [] : ['vrpg-be'], calendarIds: [], componentIds: hasRefs ? [] : ['ch-social-procedures'] },
        followUp: { required: openWeekendIssue, references: openWeekendIssue ? [{ kind: 'riskRecord', id: 'OF-001', url: null, status: 'open' }] : [] } };
    }) };
  return { register, event, newIds, exclusionOnlySourceIds: inventory.entries.filter(e => e.referenceUse === 'exclusion-only').map(e => e.sourceId).sort() };
}

export async function prepareMvp06SourceGovernance(repositoryRoot = root) {
  await verifyMvp06SourceApproval(repositoryRoot);
  const read = path => readFile(resolve(repositoryRoot, path)), json = async path => JSON.parse(await read(path));
  const oldRegisterBytes = await read(`${historicalRoot}/${registerPath}`);
  assert.equal(hash(oldRegisterBytes), oldRegisterHash);
  assert.equal(hash(await read(`${historicalRoot}/${indexPath}`)), oldIndexHash);
  const manifestPath = `data/releases/${releaseId}/manifest.json`;
  const manifest = validateMvp06AdoptionManifest(await read(manifestPath)), documents = [];
  for (const artifact of manifest.artifacts) {
    const bytes = await read(`data/releases/${releaseId}/${artifact.path}`);
    assert.equal(hash(bytes), artifact.sha256);
    assert.equal(bytes.length, artifact.byteLength);
    documents.push(JSON.parse(bytes));
  }
  const result = assembleMvp06SourceGovernance({ oldRegister: JSON.parse(oldRegisterBytes), manifest, documents,
    inventory: await json(`${prefix}/source-inventory.json`), completeness: await json(completenessPath), approval: await json(approvalPath) });
  const historicalEvents = new Map();
  const priorApproval = await json('outputs/release-mvp04-2026-09-22/source-approval.json');
  for (const [index, id] of oldEventIds.entries()) {
    const path = `data/source-reviews/events/${id}.json`, bytes = await read(path);
    assert.equal(hash(bytes), oldEventHashes[index] ?? priorApproval.transition.event.afterSha256);
    historicalEvents.set(path, bytes);
  }
  return { ...result, oldRegisterBytes, manifestPath, historicalEvents };
}

export async function archiveMvp05GovernanceTests(repositoryRoot = root) {
  const snapshot = JSON.parse(await readFile(resolve(repositoryRoot, `${prefix}/preparation-inputs.json`)));
  const paths = ['tests/governance/mvp05-source-approval.test.mjs', 'tests/governance/test_source_reviews_mvp05.py'];
  const entries = [];
  for (const path of paths) {
    assert.ok(!snapshot.evidence.some(item => item.path === path), 'Already snapshot-bound test requires its existing archive');
    const destination = `${prefix}/historical-test-baseline/${path}`;
    let bytes;
    try { bytes = await readFile(resolve(repositoryRoot, destination)); }
    catch (error) { if (error.code !== 'ENOENT') throw error; bytes = await readFile(resolve(repositoryRoot, path)); }
    await mkdir(dirname(resolve(repositoryRoot, destination)), { recursive: true });
    try { await writeFile(resolve(repositoryRoot, destination), bytes, { flag: 'wx' }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    assert.ok((await readFile(resolve(repositoryRoot, destination))).equals(bytes));
    entries.push({ path, archivedAt: destination, sha256: hash(bytes), byteLength: bytes.length });
  }
  await persistMvp06ApprovalArtifact({ recordId: 'MVP06-HISTORICAL-GOVERNANCE-TEST-ADAPTATION-20261001',
    reason: 'MVP05-specific assertions must validate the exact historical MVP05 state, not constrain future approved registers to 57 rows.',
    originalSnapshotUnchanged: { evidenceFiles: 180, historicalArchives: 85 }, entries,
    assertions: [
      { path: paths[0], before: 'Read living source-register.json and assert 57 rows.', after: 'Read the exact SHA-256-bound MVP05 historical register and assert the same 57 rows. All source-approval and preparation reproduction checks stay unchanged.' },
      { path: paths[1], before: 'Use living register, all current events and living index as the MVP05 fixture.', after: 'Use the SHA-256-bound historical MVP05 register/index and their exact three event IDs. Same schema, counts, content-preservation, impact-index and negative mutation assertions. New MVP06 tests separately require current 81 rows and four events.' }
    ], noHistoricalAcceptanceChanged: true, noAssertionRelaxation: true }, `${prefix}/historical-test-baseline/manifest.json`, repositoryRoot);
}

export async function adoptMvp06SourceGovernance(repositoryRoot = root) {
  const prepared = await prepareMvp06SourceGovernance(repositoryRoot), read = path => readFile(resolve(repositoryRoot, path));
  const current = await read(registerPath);
  assert.ok(current.equals(prepared.oldRegisterBytes) || current.equals(encoded(prepared.register)), 'Unexpected living register change, refusing overwrite');
  const currentIndex = await read(indexPath);
  const priorAdoption = await read(adoptionPath).then(bytes => JSON.parse(bytes)).catch(error => { if (error.code !== 'ENOENT') throw error; return null; });
  assert.ok(hash(currentIndex) === oldIndexHash || (priorAdoption && hash(currentIndex) === priorAdoption.evidence.find(e => e.path === indexPath).sha256), 'Unexpected living index change, refusing overwrite');
  await persistMvp06ApprovalArtifact(prepared.event, eventPath, repositoryRoot);
  await writeFile(resolve(repositoryRoot, registerPath), encoded(prepared.register));
  execFileSync(process.execPath, [resolve(repositoryRoot, 'scripts/build-source-review-index.mjs')], { stdio: 'inherit' });
  for (const [path, bytes] of prepared.historicalEvents) assert.ok((await read(path)).equals(bytes), `Historical event changed: ${path}`);
  const evidence = [];
  for (const path of [approvalPath, completenessPath, prepared.manifestPath, `${historicalRoot}/${registerPath}`, `${historicalRoot}/${indexPath}`,
    registerPath, eventPath, indexPath, ...prepared.historicalEvents.keys(), `${prefix}/historical-test-baseline/manifest.json`]) {
    const bytes = await read(path); evidence.push({ path, sha256: hash(bytes), byteLength: bytes.length });
  }
  const result = { formatVersion: '1.0.0', dataKind: 'sourceGovernanceAdoption', adoptedOn: '2026-10-01', releaseId,
    approvalRef: { path: approvalPath, sha256: hash(await read(approvalPath)) },
    counts: { previouslyRegistered: 57, added: 24, registered: 81, retainedSupplementalRows: 4, newEventEntries: 77,
      totalEvents: 4, additionalCatalogOnlySourcesReusedSeparately: 82, distinctReleaseSources: 159 },
    newSourceIds: prepared.newIds, exclusionOnlySourceIds: prepared.exclusionOnlySourceIds,
    exclusionPathsNotActivated: true, historicalEventsUnchanged: true, previousRegisterRowsUnchanged: true,
    catalogReuse: { reviewedOn: '2026-09-22', sourceCount: 82, aiOutcome: 'unclear', freshFullReviewClaimed: false },
    installationAuthorized: false, publicationAuthorized: false, hostingChangesAuthorized: false, operatingApproval: false, evidence };
  await persistMvp06ApprovalArtifact(result, adoptionPath, repositoryRoot);
  await verifyMvp06SourceApproval(repositoryRoot);
  return result;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--archive-historical-tests')) await archiveMvp05GovernanceTests();
  else if (process.argv.includes('--write')) console.log(JSON.stringify((await adoptMvp06SourceGovernance()).counts, null, 2));
  else console.log(JSON.stringify({ register: (await prepareMvp06SourceGovernance()).register.sources.length, liveWrite: false }));
}
