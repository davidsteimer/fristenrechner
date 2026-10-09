// SPDX-License-Identifier: AGPL-3.0-only
// Verifies an already declared human decision, never grants a new one.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { consolidateMvp05Sources } from './consolidate-mvp05-sources.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const approvalPath = 'outputs/release-mvp05-2026-09-28/source-approval.json';
export const declaration = 'Ich nehme die zusammengeführte Quellenprüfung für MVP 0.5 einschliesslich der dokumentierten Wiederverwendung und der fortbestehenden Vorbehalte ab. Ich gebe die kontrollierte lokale Datenübernahme und den Bau der definitiven Releaseartefakte frei.';
export const completenessPath = 'outputs/release-mvp05-2026-09-28/source-review-completeness.json';
export const completenessSha256 = '67fdf2e5cb3ac19769655ed08f2ff80e9863b76a2526469917832bcba68e27ce';
export const requiredPaths = [completenessPath, 'docs/fachrecht/quellenabgleich-mvp05.md',
  'docs/fachrecht/abnahme-quellenpruefung-mvp05.md',
  ...['1', '2', '3'].map(n => `docs/fachrecht/abnahme-ap19c${n}.md`),
  'docs/entscheidungen/DEC-2026-025-sozialverfahrenskatalog-und-manifest-v5.md'];
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');

export function validateMvp05SourceApproval(approval, files) {
  assert.equal(approval.formatVersion, '1.0.0');
  assert.equal(approval.dataKind, 'sourceReviewApproval');
  assert.equal(approval.reviewId, 'MVP05-SOURCE-APPROVAL-20260928');
  assert.equal(approval.approvalId, '2026-09-28-mvp-05-source-approval.1');
  assert.equal(approval.recordStatus, 'approved');
  assert.equal(approval.approvedOn, '2026-09-28');
  assert.equal(approval.approvedBy, 'David Steimer');
  assert.equal(approval.declaration, declaration);
  assert.equal(approval.releaseId, '2026-09-28-mvp-05-approved.1');
  assert.equal(approval.decisionRef, 'docs/fachrecht/abnahme-quellenpruefung-mvp05.md');
  assert.deepEqual(approval.permissions, { sourceReviewApproved: true, localDataPromotionAuthorized: true,
    definitiveLocalBuildAuthorized: true, installationAuthorized: false, publicationAuthorized: false,
    hostingChangesAuthorized: false, operatingApproval: false });
  assert.deepEqual(approval.scope, { manifestSources: 53, additionalReusedCatalogSources: 82,
    catalogSources: 84, overlap: 2, distinctSources: 135, federalRules: 24, cantonalBindings: 28,
    operativeCantons: ['BE'], coverage: { from: '2026-01-01', to: '2027-12-31' } });
  assert.deepEqual(approval.responsibility, { operatingModel: 'personalUnion', formalFourEyes: false,
    documentedWith: 'Codex', humanDecisionBy: 'David Steimer' });
  const evidence = new Map();
  for (const item of approval.evidence) {
    assert.ok(!evidence.has(item.path), `Duplicate approval evidence: ${item.path}`);
    assert.ok(files.has(item.path), `Missing approval evidence: ${item.path}`);
    assert.equal(hash(files.get(item.path)), item.sha256, `Changed approval evidence: ${item.path}`);
    assert.equal(files.get(item.path).length, item.byteLength);
    evidence.set(item.path, item.sha256);
  }
  for (const path of requiredPaths) assert.ok(evidence.has(path), `Missing required approval binding: ${path}`);
  assert.equal(evidence.get(completenessPath), completenessSha256);
  const report = JSON.parse(files.get(completenessPath));
  assert.equal(report.recordStatus, 'candidate');
  assert.equal(report.humanApproval, false, 'Historical technical report must not be rewritten');
  assert.equal(report.evidence.length, 8);
  for (const item of report.evidence) assert.equal(evidence.get(item.path), item.sha256, `Unbound nested evidence: ${item.path}`);
  assert.deepEqual(approval.retainedLimits, report.retainedLimits);
  assert.equal(approval.knownConflict.sourceId, 'SRC-AI-RUHETAGE-LISTE-2026');
  assert.equal(approval.knownConflict.treatmentUnchanged, true);
  assert.equal(approval.knownConflict.officialCorrectionClaimed, false);
  assert.equal(approval.nextAnnualReviewDue, '2027-11-15');
  return { reviewId: approval.reviewId, releaseId: approval.releaseId, sourceReviewApproved: true,
    localDataPromotionAuthorized: true, definitiveLocalBuildAuthorized: true,
    verifiedEvidenceFiles: evidence.size, distinctSources: 135,
    installationAuthorized: false, publicationAuthorized: false, operatingApproval: false };
}

export async function verifyMvp05SourceApproval(repositoryRoot = root) {
  const realRoot = await realpath(repositoryRoot);
  const read = async path => {
    assert.ok(typeof path === 'string' && !isAbsolute(path) && !path.includes('\\') && !path.split('/').some(p => ['..', '.', ''].includes(p)), 'Unsafe evidence path');
    const resolved = await realpath(resolve(realRoot, path));
    const rel = relative(realRoot, resolved);
    assert.ok(rel && !isAbsolute(rel) && !rel.startsWith('../'), 'Evidence escapes repository');
    return readFile(resolved);
  };
  const approvalBytes = await read(approvalPath);
  const approval = JSON.parse(approvalBytes);
  const files = new Map(await Promise.all(approval.evidence.map(async item => [item.path, await read(item.path)])));
  const result = validateMvp05SourceApproval(approval, files);
  assert.deepEqual(await consolidateMvp05Sources(repositoryRoot), JSON.parse(files.get(completenessPath)), 'Accepted source evidence no longer reproduces');
  return { ...result, approvalSha256: hash(approvalBytes) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  console.log(JSON.stringify(await verifyMvp05SourceApproval(), null, 2));
