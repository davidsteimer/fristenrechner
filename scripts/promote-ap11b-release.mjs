// SPDX-License-Identifier: AGPL-3.0-only

import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';

const repositoryRoot = process.cwd();
const candidateReleaseId = '2026-08-30-ap11b-candidate.1';
const approvedReleaseId = '2026-08-30-ap11b-approved.1';
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

function promote() {
  const candidateManifestPath = join(candidateDirectory, 'manifest.json');
  const candidateManifest = readJson(candidateManifestPath);

  if (
    candidateManifest.releaseId !== candidateReleaseId ||
    candidateManifest.releaseStatus !== 'candidate' ||
    candidateManifest.immutable !== true
  ) {
    throw new Error('AP11B-Ausgangsrelease ist kein unveränderlicher Kandidat');
  }

  for (const artifact of candidateManifest.artifacts) {
    const sourcePath = join(candidateDirectory, artifact.path);
    const targetPath = join(approvedDirectory, artifact.path);
    mkdirSync(dirname(targetPath), { recursive: true });
    cpSync(sourcePath, targetPath);

    if (sha256(sourcePath) !== artifact.sha256 || sha256(targetPath) !== artifact.sha256) {
      throw new Error(`Prüfsummenabweichung bei ${artifact.path}`);
    }
  }

  const approvedManifest = {
    ...candidateManifest,
    releaseId: approvedReleaseId,
    releaseStatus: 'approved',
    extensions: {
      'steimer.approval': {
        approvedOn: '2026-08-30',
        approvedBy: 'David Steimer',
        approvalType: 'human',
        approvalScope: 'ap11bSpecialRegimeRelease',
        decisionId: 'DEC-2026-014',
        workPackage: 'AP11B',
        issue: 29
      }
    }
  };

  writeJson(join(approvedDirectory, 'manifest.json'), approvedManifest);
  console.log(
    `PROMOTED ${candidateReleaseId} -> ${approvedReleaseId}: artifacts=${approvedManifest.artifacts.length}`
  );
}

promote();
