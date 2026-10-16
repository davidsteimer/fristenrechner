// SPDX-License-Identifier: AGPL-3.0-only
// Evidence coverage and integrity, never a legal or human release approval.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { archiveAcceptance } from './archive-ap23d3-acceptance.mjs';
import { assembleMvp08SourceInventory, loadMvp08InventoryInputs } from './inventory-mvp08-sources.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const prefix = 'outputs/release-mvp08-2026-10-15';
export const resultPath = `${prefix}/source-review-completeness.json`;
export const inventoryPath = `${prefix}/sources/source-inventory.json`;
export const inventoryHash = '6d40975ddf0fc334a43ae7444033037ab9809a90763be2461dc21b139d589526';
export const candidatePath = 'outputs/ap23d2-candidate-2026-10-15/bundle/manifest.json';
export const candidateHash = 'ccb67c22e55737af064f8c9ef7b122db8c5dfe1f4a1f142eb77cd05fd5ac646d';
const preflightPath = `${prefix}/preflight.json`;
const preflightHash = '1171bb6dfdbe97d5eeb655698a94f892d2af4719c0462b1a68ee7f12b06859c9';
const priorReviewPath = 'outputs/release-mvp07-2026-10-08/source-review-completeness.json';
const priorReviewHash = 'ce9122d5e6a5c3bf8c0fb8061e51e6e1613fbb04f34d65825eeea7a59796f587';
const livingD3Docs = new Set(['README.md', 'docs/architektur/README.md', 'docs/fachrecht/README.md']);
export const deniedPermissions = ['humanApproval', 'sourceReleaseApproved', 'dataPromotionApproved',
  'dataPromotionAuthorized', 'productionActivation', 'publicationApproved', 'operatingApproval'];
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const sorted = values => [...values].sort();
const meaningful = value => typeof value === 'string' ? value.trim().length > 5
  : value && typeof value === 'object' && Object.values(value).some(meaningful);
const checkText = (value, label) => assert.ok(meaningful(value), `Missing ${label}`);

export function safeEvidencePath(path) {
  assert.ok(typeof path === 'string' && path && !path.startsWith('/') && !/[\\\x00-\x1f\x7f:]/.test(path)
    && path.split('/').every(part => part && part !== '.' && part !== '..'), `Unsafe evidence path: ${path}`);
  assert.ok(['outputs/', '.work/', 'docs/fachrecht/', 'docs/entscheidungen/', 'data/source-reviews/']
    .some(prefix => path.startsWith(prefix)), `Out-of-scope evidence: ${path}`);
  assert.ok(!/(?:^|\/)(?:\.git|Userinput|node_modules|private)(?:\/|$)|(?:secret|credential|\.private\.)/i.test(path),
    `Unrelated private evidence: ${path}`);
  return path;
}

export function validateCoverage(inventory, reviews, prior) {
  assert.equal(inventory.inventoryId, 'MVP08-SOURCE-INVENTORY-20261015');
  assert.equal(inventory.candidateReleaseId, '2026-10-15-ap23d2-reference.1');
  assert.equal(inventory.sourceReleaseApproved, false);
  assert.equal(inventory.freshLegalVerificationPerformed, false);
  assert.equal(inventory.rows.length, 243);
  assert.equal(new Set(inventory.rows.map(row => row.sourceId)).size, 243);
  const priorIds = new Set(prior.coverage.map(row => row.sourceId));
  assert.equal(priorIds.size, 232);
  const expected = {
    baseline: prior.coverage.filter(row => row.reviewGroup === 'baseline').map(row => row.sourceId),
    calendar: prior.coverage.filter(row => ['activation', 'catalog'].includes(row.reviewGroup)).map(row => row.sourceId),
    administrative: inventory.rows.filter(row => !priorIds.has(row.sourceId)).map(row => row.sourceId)
  };
  assert.deepEqual(Object.values(expected).map(ids => ids.length), [77, 155, 11]);
  assert.deepEqual(sorted(Object.keys(reviews)), sorted(Object.keys(expected)));
  const all = [];
  for (const [name, ids] of Object.entries(expected)) {
    const review = reviews[name];
    assert.equal(review.recordStatus, 'candidate', name);
    assert.equal(review.checkedOn, '2026-10-15', name);
    assert.equal(review.candidateReleaseId, inventory.candidateReleaseId);
    assert.equal(review.candidateManifest.path, candidatePath);
    assert.equal(review.candidateManifest.sha256, candidateHash);
    assert.equal(review.inputInventory.path, inventoryPath);
    assert.equal(review.inputInventory.sha256, inventoryHash);
    for (const flag of ['humanApproval', 'sourceReleaseApproved', 'dataPromotionApproved', 'publicationApproved']) assert.equal(review[flag], false, flag);
    for (const flag of deniedPermissions) assert.ok(review[flag] === undefined || review[flag] === false, `Fabricated ${flag}`);
    assert.deepEqual(sorted(review.rows.map(row => row.sourceId)), sorted(ids), `Missing, duplicate or foreign source in ${name}`);
    if (review.sourceIds) assert.deepEqual(sorted(review.sourceIds), sorted(ids));
    for (const row of review.rows) {
      assert.ok(['unchanged', 'changed', 'unclear', 'unavailable'].includes(row.outcome), row.sourceId);
      for (const key of ['method', 'rationale', 'outcomeScope', 'versionFinding']) checkText(row[key], `${row.sourceId} ${key}`);
      assert.ok(Array.isArray(row.relevantProvisions) && row.relevantProvisions.length > 0
        && row.relevantProvisions.every(value => typeof value === 'string' && value.trim().length > 1),
      `Missing ${row.sourceId} relevantProvisions`);
      assert.ok(Array.isArray(row.reusedEvidence) && Array.isArray(row.freshEvidence));
      assert.ok(row.reusedEvidence.length + row.freshEvidence.length > 0, `Unbound assertion: ${row.sourceId}`);
      if (row.outcome !== 'unchanged') checkText(row.followUp, `${row.sourceId} follow-up`);
      for (const flag of deniedPermissions) assert.ok(row[flag] === undefined || row[flag] === false, `Fabricated row ${flag}`);
      for (const item of [...row.reusedEvidence, ...row.freshEvidence]) {
        safeEvidencePath(item.path);
        assert.match(item.sha256, /^[a-f0-9]{64}$/);
        if (item.byteLength !== undefined) assert.ok(Number.isSafeInteger(item.byteLength) && item.byteLength >= 0);
      }
      for (const item of row.reusedEvidence) {
        assert.match(item.originalCheckedOn, /^\d{4}-\d{2}-\d{2}$/);
        assert.ok(item.originalCheckedOn < '2026-10-15', `Historical evidence redated: ${row.sourceId}`);
        checkText(item.scope, 'reuse scope');
      }
      for (const item of row.freshEvidence) {
        assert.match(item.url, /^https?:\/\//);
        checkText(item.method, 'fresh evidence method');
        assert.ok(Number.isFinite(Date.parse(item.retrievedAt)), 'Missing retrieval timestamp');
        const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Zurich' }).format(new Date(item.retrievedAt));
        assert.equal(day, '2026-10-15', `Historical retrieval described as fresh: ${row.sourceId}`);
      }
      const entry = inventory.rows.find(item => item.sourceId === row.sourceId);
      all.push({ ...row, reviewGroup: name, sourceInventoryGroup: entry.group,
        structuralReferenceUse: entry.referenceUse, positiveOrSharedEdges: entry.positiveOrSharedEdges,
        exclusionEdges: entry.exclusionEdges });
    }
  }
  assert.deepEqual(sorted(all.map(row => row.sourceId)), sorted(inventory.rows.map(row => row.sourceId)));
  assert.equal(all.find(row => row.sourceId === 'SRC-AI-RUHETAGE-LISTE-2026').outcome, 'unclear', 'AI conflict cannot silently disappear');
  const fr = all.find(row => row.sourceId === 'SRC-AP22-FR-PRAXIS');
  assert.ok(fr, 'Missing historical FR practice reference');
  assert.equal(fr.positiveOrSharedEdges, 0, 'Supplementary FR mirror cannot become a positive release basis');
  return all.sort((a, b) => a.sourceId.localeCompare(b.sourceId, 'en'));
}

export function validateEvidence(files, descriptors) {
  const seen = new Map();
  for (const item of descriptors) {
    safeEvidencePath(item.path);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    const bytes = files.get(item.path);
    assert.ok(Buffer.isBuffer(bytes), `Missing evidence: ${item.path}`);
    assert.equal(hash(bytes), item.sha256, `Changed evidence: ${item.path}`);
    if (item.byteLength !== undefined) assert.equal(bytes.length, item.byteLength, item.path);
    if (seen.has(item.path)) assert.equal(item.sha256, seen.get(item.path), `Conflicting evidence: ${item.path}`);
    seen.set(item.path, item.sha256);
  }
  return seen.size;
}

export function validateNewNormBridges(review) {
  const bridges = review.newNormBridges;
  assert.deepEqual(sorted(Object.keys(bridges)), ['AHVG', 'ELG', 'EOG', 'EOV', 'IVG', 'IVV', 'UELG', 'UELV']);
  const rows = new Map(review.rows.map(row => [row.sourceId, row]));
  const sourceIds = new Set();
  const acts = new Set();
  const evidence = [];
  let newWindows = 0;
  for (const bridge of Object.values(bridges)) {
    assert.equal(bridge.humanApproval, false);
    assert.equal(bridge.sourceReleaseApproved, false);
    assert.equal(bridge.calculationRulesChanged, false);
    checkText(bridge.finding, 'new norm finding');
    checkText(bridge.requiredR08BBinding, 'required later binding');
    assert.ok(bridge.changedProvisions.length && bridge.usedArticles.length && bridge.freshAmendmentEvidence.length);
    for (const id of bridge.existingSourceIds) {
      assert.equal(rows.get(id)?.versionFinding.newNormDelta, true, `Missing explicit delta: ${id}`);
      assert.deepEqual(rows.get(id).versionFinding.newNormBridge, bridge, `Contradictory bridge: ${id}`);
      sourceIds.add(id);
    }
    bridge.acts.forEach(act => acts.add(act));
    evidence.push(...bridge.freshAmendmentEvidence);
    if (bridge.newIntermediateVersion) {
      assert.equal(bridge.newIntermediateVersion, '2027-01-01');
      assert.equal(bridge.freshVersionIndexRow.start, '2027-01-01');
      assert.equal(bridge.freshVersionIndexRow.work, bridge.work);
      assert.equal(bridge.freshVersionIndexRow.version, `${bridge.work}/20270101`);
      assert.equal(bridge.consolidatedXmlAvailableAtCheckedEndpoint, false);
      checkText(bridge.bridgeScope, 'unavailable consolidation limit');
      evidence.push(bridge.availabilityEvidence);
      newWindows++;
    }
  }
  assert.deepEqual(sorted(acts), ['542', '544', '546', '548', '549']);
  assert.equal(newWindows, 5);
  assert.equal(sourceIds.size, 18);
  assert.deepEqual(sorted(sourceIds), sorted(review.rows.filter(row => row.versionFinding.newNormDelta).map(row => row.sourceId)));
  for (const item of evidence) {
    safeEvidencePath(item.path);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.match(item.url, /^https:\/\//);
  }
  return { bridges, evidence, counts: { newlyPublishedActs: acts.size, affectedLawFamilies: 8,
    newIntermediateVersions: newWindows, sourceRowsWithNormDeltas: sourceIds.size, changedUsedRules: 0 } };
}

async function readRegular(repositoryRoot, path) {
  assert.ok(!path.startsWith('/') && path.split('/').every(part => part && part !== '.' && part !== '..'));
  const parts = path.split('/');
  for (let i = 0; i < parts.length; i++) {
    const stat = await lstat(resolve(repositoryRoot, parts.slice(0, i + 1).join('/')));
    assert.ok(!stat.isSymbolicLink() && (i === parts.length - 1 ? stat.isFile() : stat.isDirectory()), `Not regular: ${path}`);
  }
  return readFile(resolve(repositoryRoot, path));
}

export async function consolidate(repositoryRoot = root) {
  const files = new Map();
  const read = async path => {
    if (!files.has(path)) files.set(path, await readRegular(repositoryRoot, path));
    return files.get(path);
  };
  const invBytes = await read(inventoryPath);
  assert.equal(hash(invBytes), inventoryHash);
  // Rebuild the inventory against all actual current/historical bound bytes.
  assert.deepEqual(invBytes, encode(assembleMvp08SourceInventory(loadMvp08InventoryInputs(repositoryRoot))));
  const inventory = JSON.parse(invBytes);
  const priorBytes = await read(priorReviewPath);
  assert.equal(hash(priorBytes), priorReviewHash);
  const prior = JSON.parse(priorBytes);
  const reviews = {};
  for (const name of ['baseline', 'calendar', 'administrative']) reviews[name] = JSON.parse(await read(`${prefix}/sources/${name}-review.json`));
  const coverage = validateCoverage(inventory, reviews, prior);
  const newNorms = validateNewNormBridges(reviews.baseline);
  const assessmentBinding = reviews.baseline.contentAndVersionAssessment;
  assert.equal(assessmentBinding.sha256, '9f9e500885da0ae1294d0c346683c70a11cbebcf8615fe5e1fe1a6f6dfd6fc9a');
  safeEvidencePath(assessmentBinding.path);
  const assessmentBytes = await read(assessmentBinding.path);
  assert.equal(hash(assessmentBytes), assessmentBinding.sha256);
  assert.deepEqual(JSON.parse(assessmentBytes).newNormBridges, newNorms.bridges);
  const bindings = coverage.flatMap(row => [...row.reusedEvidence, ...row.freshEvidence]);
  bindings.push(...newNorms.evidence);
  for (const review of Object.values(reviews)) bindings.push(...(review.evidenceBindings ?? []));
  for (const item of bindings) { safeEvidencePath(item.path); await read(item.path); }
  const uniqueBoundEvidenceFiles = validateEvidence(files, bindings);
  const archive = await archiveAcceptance({ root: repositoryRoot });
  assert.equal(archive.mode, 'archive-reverified');
  assert.equal(archive.receiptSha256, 'e3641a460497a0047d7968de106575887757f4d8c619d396359ebd62bfb12966');
  const preflightBytes = await read(preflightPath);
  assert.equal(hash(preflightBytes), preflightHash);
  const protectedFiles = JSON.parse(preflightBytes).protectedAfter.filter(item => !livingD3Docs.has(item.path));
  for (const item of protectedFiles) {
    const bytes = await readRegular(repositoryRoot, item.path);
    assert.equal(hash(bytes), item.sha256, `Protected input changed: ${item.path}`);
    assert.equal(bytes.length, item.byteLength, item.path);
  }
  const counts = rows => ({ sourceIds: rows.length,
    withFreshEvidence: rows.filter(row => row.freshEvidence.length).length,
    reusedWithoutFreshEvidence: rows.filter(row => !row.freshEvidence.length).length,
    withExplicitReuse: rows.filter(row => row.reusedEvidence.length).length,
    outcomes: rows.reduce((map, row) => ({ ...map, [row.outcome]: (map[row.outcome] ?? 0) + 1 }), {}) });
  return {
    reviewId: 'MVP08-CONSOLIDATED-SOURCE-REVIEW-20261015', checkedOn: '2026-10-15', recordStatus: 'candidate',
    humanApproval: false, sourceReleaseApproved: false, dataPromotionApproved: false, publicationApproved: false,
    productionActivation: false, completeTechnicalSourceCoverage: true, allSourcesSubstantivelyConfirmed: false,
    candidateReleaseId: inventory.candidateReleaseId, candidateManifest: { path: candidatePath, sha256: candidateHash },
    inputInventory: { path: inventoryPath, sha256: inventoryHash }, acceptedSnapshot: archive,
    counts: { ...counts(coverage), groups: Object.fromEntries(Object.keys(reviews).map(name => [name, counts(coverage.filter(row => row.reviewGroup === name))])),
      uniqueBoundEvidenceFiles, protectedFilesUnchanged: protectedFiles.length },
    normChangeCounts: newNorms.counts,
    retainedVersionBridges: prior.legalChangeEvents,
    newNormBridges: newNorms.bridges,
    coverage,
    evidence: [...files].map(([path, bytes]) => ({ path, sha256: hash(bytes), byteLength: bytes.length })).sort((a, b) => a.path.localeCompare(b.path, 'en')),
    limits: [
      'Coverage and hashes do not replace substantive reading or human approval.',
      'A fresh source can be an index, excerpt or original. Counts are not full new legal readings.',
      'Historical content keeps its actual date and narrowly supported scope. Reuse requires human source-review acceptance.',
      'AI conflict, limited FR supplementary mirror, GR/NE reservations, January uncertainty, TI-O2, AVIV option B and OF-001 remain visible.',
      'TI/GR scope remains 2026-08-29 through 2027-12-31. Social scope remains BE 2026–2027. No new operative path is created.',
      'No exhaustive later-case-law search, unlimited future stability or operative data release is asserted.',
      'Private raw sources and local evidence are not automatically public-publishing approved.'
    ]
  };
}

export async function writeReport(report, repositoryRoot = root) {
  assert.equal(report.recordStatus, 'candidate');
  for (const flag of deniedPermissions) assert.ok(report[flag] === undefined || report[flag] === false, flag);
  const parts = resultPath.split('/');
  for (let i = 1; i < parts.length; i++) {
    const parent = resolve(repositoryRoot, parts.slice(0, i).join('/'));
    try { await mkdir(parent); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = await lstat(parent);
    assert.ok(stat.isDirectory() && !stat.isSymbolicLink());
  }
  for (const item of report.evidence) assert.equal(hash(await readRegular(repositoryRoot, item.path)), item.sha256, `Evidence changed before write: ${item.path}`);
  const payload = encode(report);
  try { await writeFile(resolve(repositoryRoot, resultPath), payload, { flag: 'wx' }); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    assert.deepEqual(await readRegular(repositoryRoot, resultPath), payload, 'Existing report differs. Create a separate revision.');
  }
  assert.deepEqual(await readRegular(repositoryRoot, resultPath), payload);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--write'));
  const report = await consolidate();
  if (process.argv[2] === '--write') await writeReport(report);
  console.log(JSON.stringify({ reviewId: report.reviewId, counts: report.counts, sha256: hash(encode(report)), written: process.argv[2] === '--write' }, null, 2));
}
