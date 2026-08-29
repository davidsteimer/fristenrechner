// SPDX-License-Identifier: AGPL-3.0-only

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { CalculationData, CalculationInput, ValidatedReleaseLike } from '../../src/core';
import { createCalculationData } from '../../src/core';

export const RELEASE_ID = '2026-08-29-ap5-approved.1';
const repositoryRoot = process.cwd();

export interface GoldenCase {
  readonly caseId: string;
  readonly profileId: string;
  readonly dataReleaseId: string;
  readonly input: Omit<CalculationInput, 'profileId'>;
  readonly expected: Record<string, unknown>;
}

interface GoldenSuite {
  readonly cases: readonly GoldenCase[];
}

function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(join(repositoryRoot, relativePath), 'utf8')) as unknown;
}

export function loadCalculationData(): CalculationData {
  const manifest = readJson(`data/releases/${RELEASE_ID}/manifest.json`) as {
    readonly releaseId: string;
    readonly formatVersion: string;
    readonly coverage: { readonly from: string; readonly to: string };
    readonly profileIds: readonly string[];
    readonly calendarIds: readonly string[];
    readonly artifacts: readonly {
      readonly role: 'legalProfile' | 'calendar';
      readonly contentId: string;
      readonly path: string;
    }[];
  };
  const release: ValidatedReleaseLike = {
    releaseId: manifest.releaseId,
    formatVersion: manifest.formatVersion,
    coverageFrom: manifest.coverage.from,
    coverageTo: manifest.coverage.to,
    profileIds: manifest.profileIds,
    calendarIds: manifest.calendarIds,
    artifacts: manifest.artifacts.map(artifact => ({
      descriptor: { role: artifact.role, contentId: artifact.contentId },
      parsed: readJson(`data/releases/${RELEASE_ID}/${artifact.path}`)
    }))
  };
  return createCalculationData(release);
}

export function loadGoldenSuite(kind: 'approved' | 'unresolved'): GoldenSuite {
  const file = kind === 'approved' ? 'approved/golden-cases.json' : 'unresolved/open-cases.json';
  return readJson(`tests/golden/${file}`) as GoldenSuite;
}

export function calculationInput(goldenCase: GoldenCase): CalculationInput {
  return { profileId: goldenCase.profileId, ...goldenCase.input };
}
