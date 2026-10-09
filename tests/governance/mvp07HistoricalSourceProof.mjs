// SPDX-License-Identifier: AGPL-3.0-only
// The R07-A proof describes its original pre-promotion inputs. R07-B must not
// make that historical assertion refer to today's deliberately changed product.
import assert from 'node:assert/strict';
import { loadMvp07Archive } from '../../scripts/prepare-mvp07-inputs.mjs';
import { loadMvp07ApprovalInputs, verifyMvp07SourceApproval, reportPath } from '../../scripts/record-mvp07-source-approval.mjs';
import { inventoryPath, reviewGroups, validateMvp07SourceCoverage,
  validateMvp07Evidence, validateMvp07VersionBridges, versionBridgeBindings } from '../../scripts/consolidate-mvp07-sources.mjs';

export async function verifyHistoricalMvp07SourceProof() {
  const validation = await verifyMvp07SourceApproval();
  assert.equal(validation.verifiedEvidenceFiles, 583);
  const { files } = await loadMvp07ApprovalInputs();
  const report = JSON.parse(files.get(reportPath));
  const prefix = 'outputs/release-mvp07-2026-10-08/sources';
  const inventory = JSON.parse(files.get(inventoryPath));
  const reviews = Object.fromEntries(Object.keys(reviewGroups)
    .map(name => [name, JSON.parse(files.get(`${prefix}/${name}-review.json`))]));
  assert.deepEqual(validateMvp07SourceCoverage(inventory, reviews), report.coverage);
  validateMvp07Evidence(files, report.evidence);
  assert.deepEqual(validateMvp07VersionBridges(...versionBridgeBindings
    .map(binding => JSON.parse(files.get(binding.path)))), report.legalChangeEvents);
  const archived = await loadMvp07Archive();
  const protectedPaths = [...archived.files.keys()].filter(path => path.startsWith('src/') || path.startsWith('spfx/src/')
    || path.startsWith('spfx/config/') || path.startsWith('data/') || path === 'package.json' || path === 'package-lock.json'
    || path === 'spfx/package.json' || path === 'spfx/package-lock.json' || path.startsWith('outputs/ap22c3-2026-10-08/bundle/'));
  assert.equal(protectedPaths.length, report.counts.protectedFilesUnchanged);
  assert.equal(protectedPaths.length, 185);
  assert.equal(archived.snapshot.evidence.length, report.preparationSnapshot.inputFiles);
  // loadMvp07Archive verifies every archived path, hash, size and acceptance.
  // This does not assert the new live product is still the old MVP06 product.
  return report;
}
