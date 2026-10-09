// SPDX-License-Identifier: AGPL-3.0-only

import { cpSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';

const repositoryRoot = process.cwd();
const baseReleaseId = '2026-08-30-ap11b-approved.1';
const candidateReleaseId = '2026-08-30-ap11c-candidate.1';
const baseDirectory = join(repositoryRoot, 'data', 'releases', baseReleaseId);
const candidateDirectory = join(repositoryRoot, 'data', 'releases', candidateReleaseId);

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

function removeUnknownOption(document, selectorId) {
  return {
    ...document,
    review: {
      reviewedOn: '2026-08-30',
      status: 'candidate',
      reviewedBy: 'Codex',
      basis: 'GitHub-Issues #25 und #30. Materielle Regeln unverändert, redundante UI-Option unknown entfernt.'
    },
    selectors: document.selectors.map(selector => selector.selectorId === selectorId
      ? {
          ...selector,
          options: selector.options.filter(option => option.value !== 'unknown')
        }
      : selector)
  };
}

function build() {
  const baseManifest = readJson(join(baseDirectory, 'manifest.json'));

  for (const artifact of baseManifest.artifacts) {
    const sourcePath = join(baseDirectory, artifact.path);
    const targetPath = join(candidateDirectory, artifact.path);
    mkdirSync(dirname(targetPath), { recursive: true });
    cpSync(sourcePath, targetPath);

    if (artifact.contentId === 'zpo') {
      writeJson(targetPath, removeUnknownOption(readJson(targetPath), 'procedureVariant'));
    }
    if (artifact.contentId === 'vrpg-be') {
      writeJson(targetPath, removeUnknownOption(readJson(targetPath), 'specialLawStatus'));
    }
  }

  const artifacts = baseManifest.artifacts.map(artifact => {
    const path = join(candidateDirectory, artifact.path);
    return {
      ...artifact,
      byteLength: statSync(path).size,
      sha256: sha256(path)
    };
  });

  const manifest = {
    ...baseManifest,
    releaseId: candidateReleaseId,
    releaseStatus: 'candidate',
    createdOn: '2026-08-30',
    extensions: {
      'steimer.candidate': {
        preparedOn: '2026-08-30',
        preparedWith: 'Codex',
        workPackage: 'AP11C',
        issues: [25, 30],
        approvalRequired: true,
        baseReleaseId
      }
    },
    artifacts
  };

  writeJson(join(candidateDirectory, 'manifest.json'), manifest);
  console.log(`BUILT ${candidateReleaseId}: artifacts=${artifacts.length}, base=${baseReleaseId}`);
}

build();
