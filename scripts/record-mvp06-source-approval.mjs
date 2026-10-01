// SPDX-License-Identifier: AGPL-3.0-only
// Append-only record of the actual, hash-bound 1 October 2026 human decision.
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, approvalPath, declaration, decisionPath, releaseId, permissions, scope,
  requiredBindings, hash, encoded, loadMvp06ApprovalInputs, validateMvp06SourceApproval,
  verifyMvp06SourceApproval } from './verify-mvp06-source-approval.mjs';

export async function persistMvp06ApprovalArtifact(value, path, repositoryRoot = root) {
  assert.ok(path.startsWith('outputs/release-mvp06-2026-10-01/') || /^data\/source-reviews\/events\/2026-10-01-mvp-06-prerelease\.1\.json$/.test(path));
  assert.ok(!path.split('/').some(part => ['..', '.', ''].includes(part)));
  const bytes = encoded(value), destination = resolve(repositoryRoot, path);
  await mkdir(dirname(destination), { recursive: true });
  try { await writeFile(destination, bytes, { flag: 'wx' }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  assert.ok((await readFile(destination)).equals(bytes), `Existing immutable evidence differs: ${path}`);
}

export async function makeMvp06SourceApproval(repositoryRoot = root) {
  const { report, files } = await loadMvp06ApprovalInputs(repositoryRoot);
  const evidence = [...report.evidence];
  for (const path of Object.keys(requiredBindings)) if (!evidence.some(item => item.path === path))
    evidence.push({ path, sha256: hash(files.get(path)), byteLength: files.get(path).length });
  evidence.sort((a, b) => a.path.localeCompare(b.path));
  const approval = { formatVersion: '1.0.0', dataKind: 'sourceReviewApproval',
    reviewId: 'MVP06-SOURCE-APPROVAL-20261001', approvalId: '2026-10-01-mvp-06-source-approval.1',
    recordStatus: 'approved', approvedOn: '2026-10-01', approvedBy: 'David Steimer',
    declaration, releaseId, decisionRef: decisionPath, permissions, scope,
    responsibility: { operatingModel: 'personalUnion', formalFourEyes: false, documentedWith: 'Codex', humanDecisionBy: 'David Steimer' },
    catalogReuse: { originalReviewedOn: '2026-09-22', acceptedReuseOn: '2026-09-28', reuseAcceptedOn: '2026-10-01', count: 82, claimedFreshFullReview: false },
    knownConflict: { sourceId: 'SRC-AI-RUHETAGE-LISTE-2026', treatmentUnchanged: true, officialCorrectionClaimed: false, retainedOutcome: 'unclear' },
    nextAnnualReviewDue: '2027-11-15', retainedLimits: report.retainedLimits, evidence };
  validateMvp06SourceApproval(approval, files);
  return { approval, files };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { approval } = await makeMvp06SourceApproval();
  await persistMvp06ApprovalArtifact(approval, approvalPath);
  console.log(JSON.stringify(await verifyMvp06SourceApproval(), null, 2));
}
