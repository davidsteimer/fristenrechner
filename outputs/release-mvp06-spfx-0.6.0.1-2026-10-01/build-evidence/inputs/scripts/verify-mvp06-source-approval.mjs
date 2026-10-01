// SPDX-License-Identifier: AGPL-3.0-only
// Verifies the exact recorded human decision, never supplies a missing decision.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { consolidateMvp06Sources, loadMvp06SourceEvidence } from './consolidate-mvp06-sources.mjs';
import { assertSafeEvidencePath } from './prepare-mvp06-inputs.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const prefix = 'outputs/release-mvp06-2026-10-01';
export const approvalPath = `${prefix}/source-approval.json`;
export const completenessPath = `${prefix}/source-review-completeness.json`;
export const completenessSha256 = 'a389456a87f57e595818c76852360162daab58cc772fda82ae8de8100225c7bb';
export const decisionPath = 'docs/fachrecht/abnahme-quellen-mvp06.md';
export const decisionSha256 = '18adb59a4731838f88761513117041697e5ee6d61b9a40726b5a9945c97dbc15';
export const declaration = 'Ich nehme die zusammengeführten Quellenprüfung einschliesslich der dokumentierten Wiederverwendung und fortbestehenden Vorbehalte ab und gebe die kontrollierte lokale Datenübernahme und des Baus der definitiven Releaseartefakte frei.';
export const releaseId = '2026-10-01-mvp-06-approved.1';
export const requiredBindings = {
  [completenessPath]: completenessSha256,
  [decisionPath]: decisionSha256,
  'docs/fachrecht/quellenabgleich-mvp06.md': 'fe4f3ab29495488c78eeb76729fb0b724d03b6762c08f669f2464e9ddb76819c',
  [`${prefix}/preparation-inputs.json`]: 'e38f06f47f258f3a7d54359d5ca5c0c12bc37fe846f197c4194d784c0a7c585a',
  'docs/fachrecht/abnahme-ap20c1.md': 'f94289c3069128a26bb4a270d178982dac342d0f3267b2059dbe0d8c6e657f11',
  'docs/fachrecht/abnahme-ap20c2.md': '864543a15afb57b205d9a183134a6eeb91bc19aeefd92bbcd9bdefaa2a1bc7b1',
  'docs/fachrecht/abnahme-ap20c3.md': 'cd460ccfb4a9895f53812b54c648b8f834ed61e795914bc6fd7f2f8f3dde6f64',
  'docs/entscheidungen/DEC-2026-026-beschluss.md': '16873c28621edcac92e490814c5196fbbfb34900d8e10d4c767cda8a5359ef7a'
};
export const permissions = { sourceReviewApproved: true, localDataPromotionAuthorized: true,
  definitiveLocalBuildAuthorized: true, installationAuthorized: false, publicationAuthorized: false,
  hostingChangesAuthorized: false, operatingApproval: false };
export const scope = { manifestSources: 77, additionalReusedCatalogSources: 82, catalogSources: 84,
  overlap: 2, distinctSources: 159, federalRules: 44, cantonalBindings: 50,
  operativeCantons: ['BE'], coverage: { from: '2026-01-01', to: '2027-12-31' } };
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const encoded = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');

export async function readMvp06Evidence(repositoryRoot, path) {
  assertSafeEvidencePath(path);
  const realRoot = await realpath(repositoryRoot), selected = await realpath(resolve(realRoot, path));
  const rel = relative(realRoot, selected);
  assert.ok(rel && !isAbsolute(rel) && !rel.startsWith('../'), 'Evidence escapes repository');
  return readFile(selected);
}

export function validateMvp06SourceApproval(approval, files) {
  assert.deepEqual(Object.keys(approval).sort(), ['formatVersion', 'dataKind', 'reviewId', 'approvalId',
    'recordStatus', 'approvedOn', 'approvedBy', 'declaration', 'releaseId', 'decisionRef', 'permissions',
    'scope', 'responsibility', 'catalogReuse', 'knownConflict', 'nextAnnualReviewDue', 'retainedLimits', 'evidence'].sort(),
  'Unknown approval field or invented authority');
  assert.equal(approval.formatVersion, '1.0.0');
  assert.equal(approval.dataKind, 'sourceReviewApproval');
  assert.equal(approval.reviewId, 'MVP06-SOURCE-APPROVAL-20261001');
  assert.equal(approval.approvalId, '2026-10-01-mvp-06-source-approval.1');
  assert.equal(approval.recordStatus, 'approved');
  assert.equal(approval.approvedOn, '2026-10-01');
  assert.equal(approval.approvedBy, 'David Steimer');
  assert.equal(approval.declaration, declaration);
  assert.equal(approval.releaseId, releaseId);
  assert.equal(approval.decisionRef, decisionPath);
  assert.deepEqual(approval.permissions, permissions);
  assert.deepEqual(approval.scope, scope);
  assert.deepEqual(approval.responsibility, { operatingModel: 'personalUnion', formalFourEyes: false,
    documentedWith: 'Codex', humanDecisionBy: 'David Steimer' });
  const evidence = new Map();
  for (const item of approval.evidence) {
    assertSafeEvidencePath(item.path);
    assert.ok(!evidence.has(item.path), `Duplicate approval evidence: ${item.path}`);
    assert.ok(files.has(item.path), `Missing approval evidence: ${item.path}`);
    assert.equal(hash(files.get(item.path)), item.sha256, `Changed approval evidence: ${item.path}`);
    assert.equal(files.get(item.path).length, item.byteLength);
    evidence.set(item.path, item);
  }
  for (const [path, expected] of Object.entries(requiredBindings)) {
    assert.ok(evidence.has(path), `Missing required approval binding: ${path}`);
    assert.equal(evidence.get(path).sha256, expected, `Wrong required approval binding: ${path}`);
  }
  assert.ok(files.get(decisionPath).toString().includes(`> ${declaration}`));
  const report = JSON.parse(files.get(completenessPath));
  assert.equal(report.recordStatus, 'candidate');
  for (const flag of ['humanApproval', 'dataPromotionApproved', 'productionActivation']) assert.equal(report[flag], false);
  assert.equal(report.completeTechnicalSourceCoverage, true);
  assert.equal(report.evidence.length, 166);
  const allowed = new Set([...Object.keys(requiredBindings), ...report.evidence.map(item => item.path)]);
  assert.deepEqual([...evidence.keys()].sort(), [...allowed].sort(), 'Approval evidence must be the exact accepted closure');
  for (const item of report.evidence) assert.deepEqual(evidence.get(item.path), item, `Unbound or redirected nested evidence: ${item.path}`);
  for (const item of approval.evidence.filter(item => !report.evidence.some(entry => entry.path === item.path)))
    assert.equal(item.resolvedPath, undefined, 'No arbitrary historical redirection');
  assert.deepEqual(approval.retainedLimits, report.retainedLimits);
  assert.deepEqual(approval.catalogReuse, { originalReviewedOn: '2026-09-22', acceptedReuseOn: '2026-09-28',
    reuseAcceptedOn: '2026-10-01', count: 82, claimedFreshFullReview: false });
  assert.deepEqual(approval.knownConflict, { sourceId: 'SRC-AI-RUHETAGE-LISTE-2026',
    treatmentUnchanged: true, officialCorrectionClaimed: false, retainedOutcome: 'unclear' });
  assert.equal(approval.nextAnnualReviewDue, '2027-11-15');
  return { reviewId: approval.reviewId, releaseId: approval.releaseId, ...permissions,
    verifiedEvidenceFiles: evidence.size, distinctSources: 159 };
}

export async function loadMvp06ApprovalInputs(repositoryRoot = root) {
  const reportBytes = await readMvp06Evidence(repositoryRoot, completenessPath);
  assert.equal(hash(reportBytes), completenessSha256);
  const report = JSON.parse(reportBytes);
  assert.deepEqual(await consolidateMvp06Sources(repositoryRoot), report, 'Accepted source evidence no longer reproduces');
  const context = await loadMvp06SourceEvidence(repositoryRoot);
  const files = new Map(context.files);
  files.set(completenessPath, reportBytes);
  for (const path of Object.keys(requiredBindings)) if (!files.has(path)) files.set(path, await readMvp06Evidence(repositoryRoot, path));
  return { report, files };
}

export async function verifyMvp06SourceApproval(repositoryRoot = root) {
  const approvalBytes = await readMvp06Evidence(repositoryRoot, approvalPath), approval = JSON.parse(approvalBytes);
  const { files } = await loadMvp06ApprovalInputs(repositoryRoot);
  return { ...validateMvp06SourceApproval(approval, files), approvalSha256: hash(approvalBytes) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  console.log(JSON.stringify(await verifyMvp06SourceApproval(), null, 2));
