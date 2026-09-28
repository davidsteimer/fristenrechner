// SPDX-License-Identifier: AGPL-3.0-only
// Deterministic governance adoption after the exact 2026-09-28 human decision.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { root, approvalPath, hash, verifyMvp05SourceApproval } from './verify-mvp05-source-approval.mjs';
import { persistMvp05Inputs } from './prepare-mvp05-inputs.mjs';

export const releaseId = '2026-09-28-mvp-05-approved.1';
export const eventPath = 'data/source-reviews/events/2026-09-28-mvp-05-prerelease.1.json';
const registerPath = 'data/source-reviews/source-register.json';
const prefix = 'outputs/release-mvp05-2026-09-28/';
const read = path => readFile(resolve(root, path));
const json = async path => JSON.parse(await read(path));
const encoded = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const unique = values => [...new Set(values)].sort();

await verifyMvp05SourceApproval(root);
const oldRegisterBytes = await read(prefix + 'approval-inputs/' + registerPath);
const register = JSON.parse(oldRegisterBytes);
assert.equal(register.sources.length, 42);
assert.equal(register.registerStatus, 'approved');
const manifestPath = `data/releases/${releaseId}/manifest.json`;
const manifest = await json(manifestPath);
assert.equal(manifest.releaseId, releaseId);
assert.equal(manifest.releaseStatus, 'approved');
assert.equal(manifest.formatVersion, '5.0.0');
const approval = await json(approvalPath);
const oldEventPaths = ['2026-08-31-initial-consolidation.1', '2026-09-22-mvp-04-prerelease.1']
  .map(id => `data/source-reviews/events/${id}.json`);
const historicalBytes = new Map(await Promise.all(oldEventPaths.map(async path => [path, await read(path)])));
const ap19 = await json(prefix + 'sources/ap19-source-review.json');
const remainder = await json(prefix + 'sources/remainder/source-review.json');
const completeness = await json(prefix + 'source-review-completeness.json');
const sources = new Map();
const sourceLocators = new Map();
for (const artifact of manifest.artifacts) {
  const bytes = await read(`data/releases/${releaseId}/${artifact.path}`);
  assert.equal(hash(bytes), artifact.sha256);
  const document = JSON.parse(bytes);
  for (const source of document.sources ?? []) sources.set(source.sourceId, source);
  function walk(node) {
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (!node || typeof node !== 'object') return;
    for (const key of ['sourceRefs', 'normBindings', 'supplementaryLawRefs']) {
      for (const ref of node[key] ?? []) {
        const locators = sourceLocators.get(ref.sourceId) ?? new Set();
        if (ref.locator) locators.add(ref.locator);
        sourceLocators.set(ref.sourceId, locators);
      }
    }
    Object.values(node).forEach(walk);
  }
  walk(document);
}
const known = new Set(register.sources.map(item => item.sourceId));
const newIds = manifest.sourceSummary.sourceIds.filter(id => !known.has(id)).sort();
assert.equal(newIds.length, 15);
for (const id of newIds) {
  const source = sources.get(id), review = ap19.entries.find(item => item.sourceId === id);
  assert.ok(source && review, `Missing accepted source for registration: ${id}`);
  const referenced = sourceLocators.has(id);
  const monitoring = /FUTURE-INDEX|20270101/.test(id);
  const relevantProvisions = review.articles?.length ? review.articles.map(article => `Art. ${article}`)
    : [...(sourceLocators.get(id) ?? ['Vollständiger amtlicher Zukunftsänderungsindex 28. September 2026 bis 31. Dezember 2027'])];
  register.sources.push({ sourceId: id, usageStatus: referenced ? 'productive' : monitoring ? 'monitoring' : 'supporting',
    sourceType: source.sourceType, title: source.title, authority: source.authority,
    jurisdiction: source.authority === 'Kanton Bern' ? 'BE' : 'CH', officialLocator: source.title,
    officialUrl: source.url, retrievalUrl: review.officialUrl ?? source.url,
    documentVersionDate: source.documentVersionDate, subjectAreas: monitoring ? ['specialRegimes', 'amendmentMonitoring'] : ['specialRegimes'],
    relevantProvisions });
}
register.sources.sort((a, b) => a.sourceId.localeCompare(b.sourceId, 'en'));
register.scope.productiveReleaseIds.push(releaseId);
assert.equal(register.sources.length, 57);
const byId = new Map(register.sources.map(source => [source.sourceId, source]));
const event = {
  $schema: 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/source-review-event.schema.json',
  formatVersion: '1.0.0', dataKind: 'sourceReviewEvent', reviewEventId: '2026-09-28-mvp-05-prerelease.1',
  recordStatus: 'approved', recordedOn: '2026-09-28', trigger: 'preRelease',
  reviewWindow: { from: '2026-09-28', to: '2026-09-28' }, nextAnnualReviewDue: '2027-11-15',
  comparedReleaseIds: [releaseId], responsibility: { reviewedBy: 'David Steimer', documentedWith: 'Codex',
    formalFourEyes: false, operatingModel: 'personalUnion' },
  entries: completeness.manifestCoverage.map(item => {
    const ap = ap19.entries.find(entry => entry.sourceId === item.sourceId);
    const rest = remainder.checks.find(entry => entry.sourceId === item.sourceId);
    assert.ok(Boolean(ap) !== Boolean(rest));
    const mode = ap?.mode ?? rest.method;
    const finding = ap ? `Unverändert im abgegrenzten AP19-Modellumfang. Nachweismethode: ${mode}. Befund: ${ap.result}. Teilnachweis: ${item.evidencePath}.`
      : `${rest.finding} Grenze: ${rest.limits ?? rest.outcomeScope}. Nachweismethode: ${mode}. Teilnachweis: ${item.evidencePath}.`;
    const documentHash = ap?.originalSha256 ?? rest?.retrievedSha256;
    const relatedOF001 = ['SRC-STPO-20260101', 'SRC-ZPO-20250101', 'SRC-AP17C-VRPG-BE-20260901'].includes(item.sourceId);
    return { sourceId: item.sourceId, reviewedOn: item.reviewedOn, outcome: 'unchanged',
      comparisonBasis: `Zusammengeführte Quellenprüfung MVP 0.5, am 28. September 2026 von David Steimer abgenommen. ${approval.reviewId}. Keine neue Vollprüfung der 82 ausschliesslichen Katalogquellen.`,
      evidence: { method: mode.startsWith('reused-') ? 'consolidatedAcceptedReview' : 'targetedSubstantiveComparison',
        relevantProvisions: unique([...(byId.get(item.sourceId).relevantProvisions), ...(sourceLocators.get(item.sourceId) ?? [])]),
        finding, ...(documentHash ? { stableDocumentSha256: documentHash } : {}) },
      affected: { resolutionMode: sourceLocators.has(item.sourceId) ? 'allReferencesInRelease' : 'explicit',
        releaseIds: [releaseId], profileIds: sourceLocators.has(item.sourceId) ? [] : ['vrpg-be'], calendarIds: [],
        componentIds: sourceLocators.has(item.sourceId) ? [] : ['ch-social-procedures'] },
      followUp: { required: relatedOF001, references: relatedOF001 ? [{ kind: 'riskRecord', id: 'OF-001', url: null, status: 'open' }] : [] }
    };
  })
};
assert.deepEqual(event.entries.map(e => e.sourceId).sort(), [...manifest.sourceSummary.sourceIds].sort());
assert.equal(event.entries.length, 53);
const currentRegisterBytes = await read(registerPath);
assert.ok(currentRegisterBytes.equals(oldRegisterBytes) || currentRegisterBytes.equals(encoded(register)), 'Unexpected living-register change, refusing overwrite');
await persistMvp05Inputs(event, resolve(root, eventPath));
await writeFile(resolve(root, registerPath), encoded(register));
execFileSync(process.execPath, [resolve(root, 'scripts/build-source-review-index.mjs')], { stdio: 'inherit' });
for (const [path, bytes] of historicalBytes) assert.ok((await read(path)).equals(bytes), `Historical event changed: ${path}`);
const evidence = [];
for (const path of [approvalPath, manifestPath, registerPath, eventPath, 'data/source-reviews/index.json', ...oldEventPaths]) {
  const bytes = await read(path);
  evidence.push({ path, sha256: hash(bytes), byteLength: bytes.length });
}
await persistMvp05Inputs({ formatVersion: '1.0.0', dataKind: 'sourceGovernanceAdoption', adoptedOn: '2026-09-28',
  releaseId, approvalRef: { path: approvalPath, sha256: hash(await read(approvalPath)) },
  counts: { previouslyRegistered: 42, added: 15, registered: 57, newEventEntries: 53, totalEvents: 3,
    additionalCatalogOnlySourcesReusedSeparately: 82 }, historicalEventsUnchanged: true,
  installationAuthorized: false, publicationAuthorized: false, operatingApproval: false, evidence
}, resolve(root, prefix + 'source-governance-adoption.json'));
console.log(JSON.stringify({ registerSources: 57, eventEntries: 53, priorEventsUnchanged: true, releaseId }));
