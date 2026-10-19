// SPDX-License-Identifier: AGPL-3.0-only
// Evidence coverage and byte integrity, never legal truth or human approval.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { archiveAcceptance } from './archive-ap23e3-acceptance.mjs';
import { assembleMvp09SourceInventory, loadMvp09InventoryInputs } from './inventory-mvp09-sources.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const prefix = 'outputs/release-mvp09-2026-10-18';
export const resultPath = prefix + '/source-review-completeness.json';
export const inventoryPath = prefix + '/sources/source-inventory.json';
export const inventoryHash = 'f1171c9259e27027d1f3da9850f3107897a6cb4d5b6631561165aa2e7df2b4b1';
export const candidatePath = 'outputs/ap23e3-candidate-2026-10-18/bundle/manifest.json';
export const candidateHash = '4c9f6025b7e29f577f760d2c9381066a176486983e0bae6997ac8738661ffa31';
export const priorPrefix = 'outputs/release-mvp08-2026-10-15';
export const deniedFlags = ['humanApproval', 'sourceReleaseApproved', 'dataPromotionApproved',
  'publicationApproved', 'productionActivation', 'deploymentApproved', 'dataPromotionAuthorized', 'operatingApproval'];
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const sorted = items => [...items].sort();
const liveDocs = new Set(['docs/architektur/README.md', 'docs/fachrecht/README.md',
  'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md']);
const pinned = new Map([
  [inventoryPath, inventoryHash],
  [candidatePath, candidateHash],
  [prefix + '/preflight.json', '741b93b7d3237659c28aec6eada30db0f532befd727f0c9a66057ae12828cddf'],
  [priorPrefix + '/source-review-completeness.json', 'e0c1012036fe1ddda95ab660d1153b203de19e8a75d9d6245da78d60e4796c66'],
  [priorPrefix + '/source-approval.json', '53a7f9e8b304c2552e89dc6fa4787b178170bde31aaf55100f5aed55cd995026']
]);

function safeRelativePath(path) {
  assert.ok(typeof path === 'string' && path.length && !path.startsWith('/')
    && !/[\\:\x00-\x1f\x7f]/.test(path) && path.split('/').every(p => p && p !== '.' && p !== '..'), 'Unsafe evidence path');
  return path;
}
export function safeEvidencePath(path) {
  safeRelativePath(path);
  assert.ok(['outputs/', '.work/', 'docs/fachrecht/', 'docs/entscheidungen/', 'data/source-reviews/']
    .some(prefix => path.startsWith(prefix)), 'Out-of-scope evidence: ' + path);
  assert.ok(!/(?:^|\/)(?:\.git|Userinput|node_modules|private)(?:\/|$)|(?:secret|credential|\.private\.)/i.test(path),
    'Unrelated private evidence: ' + path);
  return path;
}
export function meaningful(value, label) {
  assert.ok((typeof value === 'string' && value.trim().length > 10)
    || (value && typeof value === 'object' && !Array.isArray(value)
      && Object.keys(value).length && JSON.stringify(value).length > 15), 'Missing assessment: ' + label);
}
function checkFlags(value, label) {
  for (const flag of deniedFlags) assert.ok(value[flag] === undefined || value[flag] === false,
    'Fabricated approval: ' + label + ' ' + flag);
}
export function expectedGroups(inventory, priorReviews) {
  const groups = {
    baseline: priorReviews.baseline.rows.map(row => row.sourceId),
    calendar: priorReviews.calendar.rows.map(row => row.sourceId),
    administrative: [...priorReviews.administrative.rows.map(row => row.sourceId),
      ...inventory.groups.newAdministrativeAP23E1]
  };
  assert.deepEqual(sorted(Object.values(groups).flat()), sorted(inventory.rows.map(row => row.sourceId)),
    'Review group partition must cover the inventory exactly');
  return groups;
}
export function validateCoverage(inventory, reviews, groups) {
  assert.equal(inventory.inventoryId, 'MVP09-SOURCE-INVENTORY-20261018');
  assert.equal(inventory.candidateReleaseId, '2026-10-18-ap23e3-reference.1');
  assert.equal(inventory.sourceReleaseApproved, false);
  assert.equal(inventory.freshLegalVerificationPerformed, false);
  assert.equal(inventory.rows.length, 251);
  assert.equal(new Set(inventory.rows.map(row => row.sourceId)).size, 251);
  assert.deepEqual(Object.fromEntries(Object.entries(groups).map(([k, ids]) => [k, ids.length])),
    { baseline: 77, calendar: 155, administrative: 19 });
  assert.deepEqual(sorted(Object.keys(reviews)), sorted(Object.keys(groups)));
  const all = [];
  for (const [name, ids] of Object.entries(groups)) {
    const review = reviews[name];
    assert.ok(review, 'Missing group: ' + name);
    assert.equal(review.checkedOn, '2026-10-18', 'Review date must match this bound R09-A2 run');
    assert.equal(review.recordStatus, 'candidate');
    assert.equal(review.candidateReleaseId, inventory.candidateReleaseId);
    assert.equal(review.candidateManifest.sha256, candidateHash);
    assert.equal(review.inputInventory.sha256, inventoryHash);
    for (const flag of deniedFlags.slice(0, 4)) assert.equal(review[flag], false, name + ' ' + flag);
    checkFlags(review, name);
    assert.deepEqual(sorted(review.rows.map(row => row.sourceId)), sorted(ids),
      'Missing, duplicate or foreign source in ' + name);
    if (review.sourceIds) assert.deepEqual(sorted(review.sourceIds), sorted(ids));
    for (const row of review.rows) {
      checkFlags(row, row.sourceId);
      assert.ok(['unchanged', 'changed', 'unclear', 'unavailable'].includes(row.outcome), row.sourceId);
      for (const field of ['method', 'rationale', 'outcomeScope', 'versionFinding'])
        meaningful(row[field], row.sourceId + ' ' + field);
      assert.ok(Array.isArray(row.relevantProvisions) && row.relevantProvisions.length
        && row.relevantProvisions.every(p => typeof p === 'string' && p.trim().length > 1), row.sourceId);
      assert.ok(Array.isArray(row.freshEvidence) && Array.isArray(row.reusedEvidence), row.sourceId);
      assert.ok(row.freshEvidence.length + row.reusedEvidence.length, 'Unbound finding: ' + row.sourceId);
      if (row.outcome !== 'unchanged') meaningful(row.followUp, row.sourceId + ' follow-up');
      const inv = inventory.rows.find(item => item.sourceId === row.sourceId);
      if (inv.group === 'newAdministrativeAP23E1' || inv.newUseOfPreviouslyReviewedSource)
        meaningful(row.newUseAssessment, row.sourceId + ' new use');
      for (const item of [...row.freshEvidence, ...row.reusedEvidence]) {
        safeEvidencePath(item.path);
        assert.match(item.sha256, /^[a-f0-9]{64}$/);
        assert.ok(Number.isSafeInteger(item.byteLength) && item.byteLength >= 0, 'Missing byte length');
      }
      for (const item of row.freshEvidence) {
        assert.match(item.url, /^https?:\/\//);
        meaningful(item.method, row.sourceId + ' evidence method');
        const time = Date.parse(item.retrievedAt);
        assert.ok(Number.isFinite(time), 'Missing retrieval time');
        const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Zurich' }).format(new Date(time));
        assert.ok(day >= '2026-10-18' && day <= review.checkedOn, 'Historical or future retrieval relabelled as fresh');
      }
      for (const item of row.reusedEvidence) {
        assert.match(item.originalCheckedOn, /^\d{4}-\d{2}-\d{2}$/);
        assert.ok(item.originalCheckedOn <= review.checkedOn, 'Future reuse date');
        meaningful(item.scope, row.sourceId + ' reuse scope');
      }
      all.push({ ...row, reviewGroup: name, sourceInventoryGroup: inv.group,
        structuralReferenceUse: inv.referenceUse, positiveOrSharedEdges: inv.positiveOrSharedEdges,
        exclusionEdges: inv.exclusionEdges, newReferenceLocations: inv.newReferenceLocations });
    }
  }
  assert.deepEqual(sorted(all.map(row => row.sourceId)), sorted(inventory.rows.map(row => row.sourceId)));
  assert.equal(all.find(row => row.sourceId === 'SRC-AI-RUHETAGE-LISTE-2026')?.outcome, 'unclear',
    'The documented AI conflict must not silently disappear');
  const fr = all.find(row => row.sourceId === 'SRC-AP22-FR-PRAXIS');
  assert.equal(fr?.outcome, 'unclear', 'Historical FR mirror limitation must remain');
  assert.equal(fr?.positiveOrSharedEdges, 0, 'Historical FR mirror cannot enable a positive path');
  return all.sort((a, b) => a.sourceId.localeCompare(b.sourceId, 'en'));
}
export function validateEvidence(files, descriptors) {
  const seen = new Map();
  for (const item of descriptors) {
    safeEvidencePath(item.path);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    const bytes = files.get(item.path);
    assert.ok(Buffer.isBuffer(bytes), 'Missing evidence: ' + item.path);
    assert.equal(hash(bytes), item.sha256, 'Changed evidence: ' + item.path);
    if (item.byteLength !== undefined) assert.equal(bytes.length, item.byteLength, item.path);
    if (seen.has(item.path)) assert.equal(seen.get(item.path), item.sha256, 'Conflicting evidence');
    seen.set(item.path, item.sha256);
  }
  return seen.size;
}
export function collectEvidenceDescriptors(value) {
  if (!value || typeof value !== 'object') return [];
  const own = typeof value.path === 'string' && typeof value.sha256 === 'string' ? [value] : [];
  return [...own, ...Object.values(value).flatMap(collectEvidenceDescriptors)];
}
export async function readRegular(repositoryRoot, path) {
  safeRelativePath(path);
  const parts = path.split('/');
  for (let i = 1; i <= parts.length; i++) {
    const st = await lstat(resolve(repositoryRoot, parts.slice(0, i).join('/')));
    assert.ok(!st.isSymbolicLink() && (i === parts.length ? st.isFile() : st.isDirectory()), path);
  }
  return readFile(resolve(repositoryRoot, path));
}
export async function consolidate(repositoryRoot = root) {
  const files = new Map();
  const read = async path => {
    if (!files.has(path)) files.set(path, await readRegular(repositoryRoot, path));
    if (pinned.has(path)) assert.equal(hash(files.get(path)), pinned.get(path), path);
    return files.get(path);
  };
  const invBytes = await read(inventoryPath);
  assert.deepEqual(invBytes, encode(assembleMvp09SourceInventory(loadMvp09InventoryInputs(repositoryRoot))),
    'Candidate and historical inputs must reproduce the bound A1 inventory');
  const inventory = JSON.parse(invBytes);
  const candidate = JSON.parse(await read(candidatePath));
  assert.equal(candidate.releaseStatus, 'candidate');
  assert.equal(candidate.sourceSummary.legalBasisReviewStatus, 'pending');
  const prior = JSON.parse(await read(priorPrefix + '/source-review-completeness.json'));
  const priorApproval = JSON.parse(await read(priorPrefix + '/source-approval.json'));
  assert.equal(priorApproval.recordStatus, 'approved');
  const priorReviews = {}, reviews = {}, reviewPaths = [];
  for (const name of ['baseline', 'calendar', 'administrative']) {
    priorReviews[name] = JSON.parse(await read(priorPrefix + '/sources/' + name + '-review.json'));
    const path = prefix + '/sources/' + name + '-review.json';
    reviews[name] = JSON.parse(await read(path));
    reviewPaths.push(path);
  }
  const coverage = validateCoverage(inventory, reviews, expectedGroups(inventory, priorReviews));
  // Include auxiliary checks and index/comparison evidence outside source rows.
  const descriptors = Object.values(reviews).flatMap(collectEvidenceDescriptors);
  // Preserve every historical evidence link and approved version bridge independently
  // of whether the new partial reports repeat all descriptors.
  descriptors.push(...inventory.historicalEvidenceBindings);
  for (const item of descriptors) await read(item.path);
  const uniqueBoundEvidenceFiles = validateEvidence(files, descriptors);
  const archived = await archiveAcceptance({ root: repositoryRoot });
  assert.equal(archived.mode, 'archive-reverified');
  assert.equal(archived.receiptSha256, '18de59434d8dcb8469d0ebad767e6fcea55be089948335930d496990730da3ea');
  const preflight = JSON.parse(await read(prefix + '/preflight.json'));
  assert.equal(preflight.passed, true);
  const protectedFiles = preflight.protectedAfter.filter(item => !liveDocs.has(item.path));
  for (const item of protectedFiles) {
    const bytes = await read(item.path);
    assert.equal(hash(bytes), item.sha256, 'Protected input changed: ' + item.path);
    assert.equal(bytes.length, item.byteLength, item.path);
  }
  const countRows = rows => ({ sourceIds: rows.length,
    withFreshEvidence: rows.filter(row => row.freshEvidence.length).length,
    reusedWithoutFreshEvidence: rows.filter(row => !row.freshEvidence.length).length,
    withExplicitReuse: rows.filter(row => row.reusedEvidence.length).length,
    outcomes: rows.reduce((m, row) => ({ ...m, [row.outcome]: (m[row.outcome] ?? 0) + 1 }), {}) });
  return {
    reviewId: 'MVP09-CONSOLIDATED-SOURCE-REVIEW-20261018', recordStatus: 'candidate',
    checkedOn: sorted(Object.values(reviews).map(review => review.checkedOn)).at(-1),
    humanApproval: false, sourceReleaseApproved: false, dataPromotionApproved: false,
    publicationApproved: false, productionActivation: false,
    completeTechnicalSourceCoverage: true, allSourcesSubstantivelyConfirmed: false,
    candidateReleaseId: inventory.candidateReleaseId,
    candidateManifest: { path: candidatePath, sha256: candidateHash },
    inputInventory: { path: inventoryPath, sha256: inventoryHash },
    priorReview: { path: priorPrefix + '/source-review-completeness.json', sha256: hash(await read(priorPrefix + '/source-review-completeness.json')) },
    priorHumanApproval: { path: priorPrefix + '/source-approval.json', sha256: hash(await read(priorPrefix + '/source-approval.json')), appliesOnlyToPriorRelease: true },
    acceptedSnapshot: archived,
    counts: { ...countRows(coverage),
      groups: Object.fromEntries(Object.keys(reviews).map(name => [name, countRows(coverage.filter(row => row.reviewGroup === name))])),
      uniqueBoundEvidenceFiles, protectedFilesUnchanged: protectedFiles.length,
      referenceEdges: inventory.referenceGraph.length, newReferenceEdges: inventory.addedReferenceGraph.length },
    retainedVersionBridges: prior.retainedVersionBridges,
    retainedMvp08NormBridges: {
      originallyReviewedOn: '2026-10-15', historicalRecordUnmodified: true,
      currentAvailabilityMustBeReadWithR09Assessment: true, records: prior.newNormBridges
    },
    currentNormAssessments: Object.fromEntries(Object.entries(reviews).map(([name, review]) =>
      [name, review.currentNormAssessments ?? review.contentAndVersionAssessment ?? review.assessment ?? null])),
    coverage,
    evidence: [...new Map(descriptors.map(item => [item.path, { path: item.path, sha256: item.sha256,
      byteLength: files.get(item.path).length }])).values()].sort((a, b) => a.path.localeCompare(b.path, 'en')),
    partialReports: reviewPaths.map(path => ({ path, sha256: hash(files.get(path)), byteLength: files.get(path).length })),
    limits: ['Technical coverage is not legal truth or human approval.',
      'Fresh version indices, fresh content and bounded historical reuse remain distinct in each row.',
      'AI conflict, supplementary FR mirror, GR/NE, January comparisons, TI-O2, AR-O1, AVIV option B and OF-001 remain.',
      'No product data, versions, pins, operating environments, commits or publications were changed.',
      'The next step requires human source acceptance and a separate R09-B proposal.']
  };
}
export async function writeReport(report, repositoryRoot = root) {
  assert.equal(report.recordStatus, 'candidate');
  for (const flag of deniedFlags.slice(0, 4)) assert.equal(report[flag], false);
  checkFlags(report, 'report');
  for (const item of report.evidence) {
    safeEvidencePath(item.path);
    const bytes = await readRegular(repositoryRoot, item.path);
    assert.equal(hash(bytes), item.sha256, 'Evidence changed before write: ' + item.path);
    if (item.byteLength !== undefined) assert.equal(bytes.length, item.byteLength);
  }
  const parts = prefix.split('/');
  for (let i = 1; i <= parts.length; i++) {
    const parent = resolve(repositoryRoot, parts.slice(0, i).join('/'));
    try { await mkdir(parent); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const st = await lstat(parent);
    assert.ok(st.isDirectory() && !st.isSymbolicLink(), parent);
  }
  const bytes = encode(report);
  try { await writeFile(resolve(repositoryRoot, resultPath), bytes, { flag: 'wx' }); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    assert.deepEqual(await readRegular(repositoryRoot, resultPath), bytes, 'Existing review differs, preserve it and create a revision');
  }
  assert.deepEqual(await readRegular(repositoryRoot, resultPath), bytes);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--write'));
  const report = await consolidate();
  if (process.argv[2] === '--write') await writeReport(report);
  console.log(JSON.stringify({ resultPath, written: process.argv[2] === '--write',
    sha256: hash(encode(report)), counts: report.counts, humanApproval: false }, null, 2));
}
