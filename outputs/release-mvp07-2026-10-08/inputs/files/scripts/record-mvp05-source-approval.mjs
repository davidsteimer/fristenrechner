// SPDX-License-Identifier: AGPL-3.0-only
// Records exactly David Steimer's 2026-09-28 declaration. No inferred permission.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { persistMvp05Inputs, outputPath } from './prepare-mvp05-inputs.mjs';
import { consolidateMvp05Sources } from './consolidate-mvp05-sources.mjs';
import { root, approvalPath, declaration, completenessPath, completenessSha256, requiredPaths,
  hash, verifyMvp05SourceApproval } from './verify-mvp05-source-approval.mjs';

const read = path => readFile(resolve(root, path));
const reportBytes = await read(completenessPath);
assert.equal(hash(reportBytes), completenessSha256);
const report = JSON.parse(reportBytes);
assert.deepEqual(await consolidateMvp05Sources(root), report);
const evidence = [];
for (const path of [...new Set([...requiredPaths, ...report.evidence.map(item => item.path)])]) {
  const bytes = await read(path);
  evidence.push({ path, sha256: hash(bytes), byteLength: bytes.length });
}
const approval = {
  formatVersion: '1.0.0', dataKind: 'sourceReviewApproval', reviewId: 'MVP05-SOURCE-APPROVAL-20260928',
  approvalId: '2026-09-28-mvp-05-source-approval.1', recordStatus: 'approved', approvedOn: '2026-09-28',
  approvedBy: 'David Steimer', declaration, releaseId: '2026-09-28-mvp-05-approved.1',
  decisionRef: 'docs/fachrecht/abnahme-quellenpruefung-mvp05.md',
  permissions: { sourceReviewApproved: true, localDataPromotionAuthorized: true, definitiveLocalBuildAuthorized: true,
    installationAuthorized: false, publicationAuthorized: false, hostingChangesAuthorized: false, operatingApproval: false },
  scope: { manifestSources: 53, additionalReusedCatalogSources: 82, catalogSources: 84, overlap: 2,
    distinctSources: 135, federalRules: 24, cantonalBindings: 28, operativeCantons: ['BE'],
    coverage: { from: '2026-01-01', to: '2027-12-31' } },
  responsibility: { operatingModel: 'personalUnion', formalFourEyes: false, documentedWith: 'Codex', humanDecisionBy: 'David Steimer' },
  knownConflict: { sourceId: 'SRC-AI-RUHETAGE-LISTE-2026', treatmentUnchanged: true, officialCorrectionClaimed: false },
  nextAnnualReviewDue: '2027-11-15', retainedLimits: report.retainedLimits, evidence
};
await persistMvp05Inputs(approval, resolve(root, approvalPath));
// Immutable copies let historical approvals remain verifiable after living pins/registers evolve.
const snapshot = JSON.parse(await read(outputPath));
const mutablePaths = ['src/public-app/main.tsx', 'spfx/src/core/config.ts', 'spfx/config/package-solution.json',
  'data/source-reviews/source-register.json', 'data/source-reviews/index.json'];
for (const path of mutablePaths) {
  const expected = snapshot.evidence.find(item => item.path === path);
  assert.ok(expected);
  const archivePath = `outputs/release-mvp05-2026-09-28/approval-inputs/${path}`;
  let bytes;
  try { bytes = await read(archivePath); }
  catch (error) { if (error.code !== 'ENOENT') throw error; bytes = await read(path); }
  if (hash(bytes) !== expected.sha256 && path === 'spfx/config/package-solution.json') {
    // The adapter build version may already have advanced. Accept only the exact
    // previously bound tracked bytes, never reconstruct or overwrite live data.
    bytes = execFileSync('git', ['show', 'HEAD:spfx/config/package-solution.json'], { cwd: root });
  }
  assert.equal(hash(bytes), expected.sha256, `Archive before mutation: ${path}`);
  // JSON is copied canonically only when its canonical bytes are proven identical.
  const { mkdir, writeFile } = await import('node:fs/promises');
  const { dirname } = await import('node:path');
  const destination = resolve(root, 'outputs/release-mvp05-2026-09-28/approval-inputs', path);
  await mkdir(dirname(destination), { recursive: true });
  try { await writeFile(destination, bytes, { flag: 'wx' }); } catch (error) { if (error.code !== 'EEXIST') throw error; }
  assert.ok((await readFile(destination)).equals(bytes));
}
console.log(JSON.stringify(await verifyMvp05SourceApproval(root), null, 2));
