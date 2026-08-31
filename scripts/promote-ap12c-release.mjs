// SPDX-License-Identifier: AGPL-3.0-only

import { cpSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';

const repositoryRoot = process.cwd();
const candidateReleaseId = '2026-08-31-ap12c-candidate.1';
const approvedReleaseId = '2026-08-31-mvp-03-approved.1';
const candidateDirectory = join(repositoryRoot, 'data', 'releases', candidateReleaseId);
const approvedDirectory = join(repositoryRoot, 'data', 'releases', approvedReleaseId);

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

function approveReview(document) {
  if (document.review?.status !== 'candidate') return document;
  return {
    ...document,
    review: {
      reviewedOn: '2026-08-31',
      status: 'verified',
      reviewedBy: 'David Steimer',
      basis: 'AP12C am 31. August 2026 fachlich-technisch abgenommen. Format-3-Datenrelease mit ewigem Kalender für MVP 0.3 im Rahmen der Release-2-Finalisierung freigegeben.'
    }
  };
}

function promote() {
  const candidateManifest = readJson(join(candidateDirectory, 'manifest.json'));

  if (
    candidateManifest.releaseId !== candidateReleaseId
    || candidateManifest.releaseStatus !== 'candidate'
    || candidateManifest.immutable !== true
    || candidateManifest.formatVersion !== '3.0.0'
    || candidateManifest.coverage?.to !== null
  ) {
    throw new Error('AP12C-Ausgangsrelease ist kein unveränderlicher Format-3-Kandidat mit offener Abdeckung');
  }

  const artifacts = candidateManifest.artifacts.map(artifact => {
    const sourcePath = join(candidateDirectory, artifact.path);
    const targetPath = join(approvedDirectory, artifact.path);
    mkdirSync(dirname(targetPath), { recursive: true });
    cpSync(sourcePath, targetPath);

    const candidateDocument = readJson(targetPath);
    const approvedDocument = approveReview(candidateDocument);
    if (approvedDocument !== candidateDocument) {
      writeJson(targetPath, approvedDocument);
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
        approvalScope: 'mvp03DataRelease',
        workPackages: ['AP12A', 'AP12B', 'AP12C'],
        issues: [26],
        decision: 'DEC-2026-015',
        candidateReleaseId,
        baseReleaseId: '2026-08-31-mvp-02-approved.1'
      }
    },
    artifacts
  };

  writeJson(join(approvedDirectory, 'manifest.json'), approvedManifest);
  console.log(
    `PROMOTED ${candidateReleaseId} -> ${approvedReleaseId}: format=3.0.0, artifacts=${artifacts.length}`
  );
}

promote();
