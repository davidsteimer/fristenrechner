// SPDX-License-Identifier: AGPL-3.0-only

import { cpSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';

const repositoryRoot = process.cwd();
const candidateReleaseId = '2026-08-30-ap11c-candidate.1';
const approvedReleaseId = '2026-08-31-mvp-02-approved.1';
const candidateDirectory = join(repositoryRoot, 'data', 'releases', candidateReleaseId);
const approvedDirectory = join(repositoryRoot, 'data', 'releases', approvedReleaseId);
const approvedProfileIds = new Set(['zpo', 'vrpg-be']);

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function approveProfileReview(path) {
  const profile = readJson(path);
  writeJson(path, {
    ...profile,
    review: {
      reviewedOn: '2026-08-31',
      status: 'verified',
      reviewedBy: 'David Steimer',
      basis: 'AP11C am 31. August 2026 abgenommen. GitHub-Issues #25 und #30. Materielle Regeln unverändert, redundante UI-Option unknown entfernt.'
    }
  });
}

function promote() {
  const candidateManifest = readJson(join(candidateDirectory, 'manifest.json'));

  if (
    candidateManifest.releaseId !== candidateReleaseId
    || candidateManifest.releaseStatus !== 'candidate'
    || candidateManifest.immutable !== true
    || candidateManifest.formatVersion !== '2.0.0'
  ) {
    throw new Error('AP11C-Ausgangsrelease ist kein unveränderlicher Format-2-Kandidat');
  }

  const artifacts = candidateManifest.artifacts.map(artifact => {
    const sourcePath = join(candidateDirectory, artifact.path);
    const targetPath = join(approvedDirectory, artifact.path);
    mkdirSync(dirname(targetPath), { recursive: true });
    cpSync(sourcePath, targetPath);

    if (artifact.role === 'legalProfile' && approvedProfileIds.has(artifact.contentId)) {
      approveProfileReview(targetPath);
    } else if (sha256(sourcePath) !== sha256(targetPath)) {
      throw new Error(`Byteidentität bei unverändertem Artefakt verletzt: ${artifact.path}`);
    }

    return {
      ...artifact,
      byteLength: statSync(targetPath).size,
      sha256: sha256(targetPath)
    };
  });

  const approvedManifest = {
    ...candidateManifest,
    releaseId: approvedReleaseId,
    releaseStatus: 'approved',
    createdOn: '2026-08-31',
    extensions: {
      'steimer.approval': {
        approvedOn: '2026-08-31',
        approvedBy: 'David Steimer',
        approvalType: 'human',
        approvalScope: 'mvp02DataRelease',
        workPackage: 'AP11C',
        issues: [25, 30],
        candidateReleaseId
      }
    },
    artifacts
  };

  writeJson(join(approvedDirectory, 'manifest.json'), approvedManifest);
  console.log(
    `PROMOTED ${candidateReleaseId} -> ${approvedReleaseId}: artifacts=${artifacts.length}`
  );
}

promote();
