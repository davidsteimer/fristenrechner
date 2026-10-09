// SPDX-License-Identifier: AGPL-3.0-only

import { cpSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';

const repositoryRoot = process.cwd();
const baseReleaseId = '2026-08-31-mvp-02-approved.1';
const candidateReleaseId = '2026-08-31-ap12c-candidate.1';
const baseDirectory = join(repositoryRoot, 'data', 'releases', baseReleaseId);
const candidateDirectory = join(repositoryRoot, 'data', 'releases', candidateReleaseId);
const calendarCandidateDirectory = join(
  repositoryRoot,
  'data',
  'candidates',
  '2026-08-31-ap12a-eternal-calendar'
);
const oldSuspensionSetId = 'ch-court-holidays-2026-2028';
const newSuspensionSetId = 'ch-court-holidays';
const calendarRuleSchemaId =
  'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v2.schema.json';

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

function migrateSuspensionSetIds(value) {
  if (Array.isArray(value)) {
    return value.map(migrateSuspensionSetIds);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
      key,
      migrateSuspensionSetIds(entry)
    ]));
  }
  return value === oldSuspensionSetId ? newSuspensionSetId : value;
}

function candidateReview(document) {
  if (!document.review) return document;
  return {
    ...document,
    review: {
      reviewedOn: '2026-08-31',
      status: 'candidate',
      reviewedBy: 'Codex',
      basis: 'AP12C-Format-3-Migration. Fachregeln aus MVP 0.2 und AP12A unverändert, Stillstandssatz-ID atomar auf ch-court-holidays migriert. Abnahme durch David Steimer ausstehend.'
    }
  };
}

function artifactMetadata(artifact) {
  const path = join(candidateDirectory, artifact.path);
  return {
    ...artifact,
    byteLength: statSync(path).size,
    sha256: sha256(path)
  };
}

function build() {
  const baseManifest = readJson(join(baseDirectory, 'manifest.json'));

  for (const artifact of baseManifest.artifacts) {
    const targetPath = join(candidateDirectory, artifact.path);
    mkdirSync(dirname(targetPath), { recursive: true });
    if (artifact.role === 'calendar') {
      cpSync(join(calendarCandidateDirectory, `${artifact.contentId}.json`), targetPath);
      continue;
    }
    const migrated = candidateReview(migrateSuspensionSetIds(
      readJson(join(baseDirectory, artifact.path))
    ));
    writeJson(targetPath, migrated);
  }

  const artifacts = baseManifest.artifacts.map(artifactMetadata).map(artifact =>
    artifact.role === 'calendar'
      ? { ...artifact, schemaId: calendarRuleSchemaId }
      : artifact
  );

  const manifest = {
    ...baseManifest,
    formatVersion: '3.0.0',
    releaseId: candidateReleaseId,
    releaseStatus: 'candidate',
    createdOn: '2026-08-31',
    coverage: {
      from: '2026-01-01',
      to: null
    },
    compatibility: {
      ...baseManifest.compatibility,
      minimumConsumerFormatVersion: '3.0.0'
    },
    extensions: {
      'steimer.candidate': {
        preparedOn: '2026-08-31',
        preparedWith: 'Codex',
        workPackage: 'AP12C',
        issues: [26],
        decision: 'DEC-2026-015',
        approvalRequired: true,
        baseReleaseId
      }
    },
    artifacts
  };

  const serializedArtifacts = artifacts
    .map(artifact => readFileSync(join(candidateDirectory, artifact.path), 'utf8'))
    .join('\n');
  if (serializedArtifacts.includes(oldSuspensionSetId)) {
    throw new Error(`Atomare Migration unvollständig: ${oldSuspensionSetId} ist noch vorhanden.`);
  }
  if (!serializedArtifacts.includes(newSuspensionSetId)) {
    throw new Error(`Atomare Migration unvollständig: ${newSuspensionSetId} fehlt.`);
  }

  writeJson(join(candidateDirectory, 'manifest.json'), manifest);
  console.log(
    `BUILT ${candidateReleaseId}: format=3.0.0, artifacts=${artifacts.length}, base=${baseReleaseId}`
  );
}

build();
