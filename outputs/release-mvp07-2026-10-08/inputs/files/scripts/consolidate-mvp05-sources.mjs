// SPDX-License-Identifier: AGPL-3.0-only
// Consolidates evidence for human review, never writes an approval or live index.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyMvp04SourceApproval } from './verify-mvp04-source-approval.mjs';
import { candidatePath, candidateHash, persistMvp05Inputs } from './prepare-mvp05-inputs.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const prefix = 'outputs/release-mvp05-2026-09-28';
export const resultPath = `${prefix}/source-review-completeness.json`;
const ap19Path = `${prefix}/sources/ap19-source-review.json`;
const restPath = `${prefix}/sources/remainder/source-review.json`;
const oldApprovalPath = 'outputs/release-mvp04-2026-09-22/source-approval.json';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const unique = values => [...new Set(values)].sort();

export function validateMvp05SourceCoverage(manifest, catalogIds, ap19, remainder, previous) {
  assert.equal(manifest.releaseStatus, 'candidate');
  assert.equal(ap19.status, 'candidate');
  assert.equal(ap19.humanApproval, false);
  assert.equal(remainder.recordStatus, 'candidate');
  assert.equal(remainder.formalApproval, false);
  assert.equal(previous.recordStatus, 'approved');
  assert.equal(previous.approvedOn, '2026-09-22');
  assert.equal(previous.knownConflict.sourceId, 'SRC-AI-RUHETAGE-LISTE-2026');
  assert.equal(ap19.entries.length, 27);
  assert.equal(remainder.checks.length, 26);
  const all = [...ap19.entries, ...remainder.checks].map(entry => entry.sourceId);
  assert.equal(unique(all).length, 53, 'Duplicated or missing manifest source');
  assert.deepEqual(unique(all), unique(manifest.sourceSummary.sourceIds), 'Manifest source coverage mismatch');
  assert.ok(ap19.entries.every(entry => entry.result.startsWith('unchanged-')), 'Unresolved AP19 finding requires separate treatment');
  assert.ok(remainder.checks.every(entry => entry.outcome === 'unchanged'), 'Unresolved remaining finding requires separate treatment');
  assert.equal(catalogIds.length, 84);
  assert.equal(unique(catalogIds).length, 84);
  const catalogOnly = catalogIds.filter(id => !all.includes(id)).sort();
  assert.equal(catalogOnly.length, 82);
  assert.equal(unique([...all, ...catalogIds]).length, 135);
  assert.ok(catalogOnly.includes(previous.knownConflict.sourceId));
  return { manifestSources: 53, ap19Sources: 27, remainingManifestSources: 26,
    holidayCatalogSources: 84, overlap: 2, reusedCatalogOnlySources: 82, distinctSources: 135,
    unchangedInModelledScope: 134, knownUnclearConflict: 1, catalogOnly };
}

export async function consolidateMvp05Sources(repositoryRoot = root) {
  const read = async path => {
    assert.ok(typeof path === 'string' && !isAbsolute(path) && !path.includes('\\') && !path.split('/').some(part => ['..', '.', ''].includes(part)), 'Unsafe evidence path');
    return readFile(resolve(repositoryRoot, path));
  };
  const json = async path => JSON.parse(await read(path));
  await verifyMvp04SourceApproval(repositoryRoot);
  const manifestBytes = await read(`${candidatePath}/manifest.json`);
  assert.equal(digest(manifestBytes), candidateHash);
  const manifest = JSON.parse(manifestBytes);
  const descriptor = manifest.artifacts.find(item => item.role === 'holidayCatalog');
  const catalogPath = `${candidatePath}/${descriptor.path}`;
  const catalogBytes = await read(catalogPath);
  assert.equal(digest(catalogBytes), descriptor.sha256);
  const oldCatalog = await read(`data/releases/2026-09-22-mvp-04-approved.1/${descriptor.path}`);
  assert.ok(catalogBytes.equals(oldCatalog), 'Reused holiday catalog changed');
  const ap19 = await json(ap19Path), remainder = await json(restPath), previous = await json(oldApprovalPath);
  const { catalogOnly, ...counts } = validateMvp05SourceCoverage(manifest, JSON.parse(catalogBytes).data.sources.map(item => item.id), ap19, remainder, previous);
  let checkedBoundEvidence = 0;
  for (const report of [ap19, remainder]) for (const evidence of report.evidenceBindings) {
    assert.equal(digest(await read(evidence.path)), evidence.sha256, `Changed evidence: ${evidence.path}`);
    checkedBoundEvidence += 1;
  }
  for (const entry of ap19.entries.filter(item => item.originalPath))
    assert.equal(digest(await read(entry.originalPath)), entry.originalSha256, `Changed fresh AP19 source: ${entry.sourceId}`);
  for (const entry of remainder.checks)
    assert.equal(digest(await read(`${prefix}/sources/remainder/${entry.retrievedFile}`)), entry.retrievedSha256, `Changed remaining source: ${entry.sourceId}`);
  const evidence = [];
  for (const path of [ap19Path, restPath, oldApprovalPath, catalogPath, `${candidatePath}/manifest.json`,
    `${prefix}/source-inventory.json`, 'docs/fachrecht/quellenpruefplan-mvp05.md', 'docs/fachrecht/quellenabgleich-mvp05-rest.md']) {
    const bytes = await read(path);
    evidence.push({ path, sha256: digest(bytes), byteLength: bytes.length });
  }
  return {
    reviewId: 'MVP05-CONSOLIDATED-SOURCE-PREPARATION-20260928', checkedOn: '2026-09-28',
    recordStatus: 'candidate', humanApproval: false, dataPromotionApproved: false, productionActivation: false,
    counts, checkedBoundEvidence,
    result: 'No additional modelled deadline-rule change identified in the bounded review. Human source acceptance remains pending.',
    evidence,
    manifestCoverage: [...ap19.entries.map(entry => ({ sourceId: entry.sourceId, reviewedOn: entry.checkedOn, mode: entry.mode, outcome: 'unchanged', evidencePath: ap19Path })),
      ...remainder.checks.map(entry => ({ sourceId: entry.sourceId, reviewedOn: entry.checkedOn, mode: entry.method, outcome: entry.outcome, evidencePath: restPath }))]
      .sort((a, b) => a.sourceId.localeCompare(b.sourceId)),
    reusedCatalogCoverage: catalogOnly.map(sourceId => ({ sourceId, reviewedOn: '2026-09-22',
      mode: 'reused-human-approved-review-not-refreshed', outcome: sourceId === previous.knownConflict.sourceId ? 'unclear' : 'unchanged', evidencePath: oldApprovalPath })),
    retainedLimits: ['AI list conflict treatment unchanged, no official correction claimed',
      'AVIV February 2027 remains accepted Option B, no newly retrieved official consolidation claimed',
      'OF-001 remains open, no new delivery fiction activated', 'No comprehensive search for newer case law',
      '15 new AP19 register entries and a new AP13 event/index remain to be prepared and bound during controlled promotion',
      'No new annual full review, next ordinary date remains 2027-11-15',
      'Freshness must be reconsidered if release is delayed or new change evidence appears']
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await consolidateMvp05Sources();
  await persistMvp05Inputs(report, resolve(root, resultPath));
  console.log(JSON.stringify({ resultPath, ...report.counts, recordStatus: report.recordStatus, humanApproval: false }));
}
