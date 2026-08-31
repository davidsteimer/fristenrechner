// SPDX-License-Identifier: AGPL-3.0-only

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createCalculationData } from '../../src/core';
import type {
  CalculationData,
  SpecialDeadlineInput,
  ValidatedReleaseLike
} from '../../src/core';

export const SPECIAL_RELEASE_ID = '2026-08-30-ap11b-approved.1';
const repositoryRoot = process.cwd();

export interface SpecialGoldenCase {
  readonly caseId: string;
  readonly profileId: string;
  readonly input: Omit<SpecialDeadlineInput, 'profileId'>;
  readonly expected: Record<string, unknown>;
}

export interface SpecialGoldenSuite {
  readonly suiteStatus: 'approved';
  readonly cases: readonly SpecialGoldenCase[];
}

function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(join(repositoryRoot, relativePath), 'utf8')) as unknown;
}

function loadSpecialCalculationData(): CalculationData {
  const manifest = readJson(`data/releases/${SPECIAL_RELEASE_ID}/manifest.json`) as {
    readonly releaseId: string;
    readonly formatVersion: string;
    readonly coverage: { readonly from: string; readonly to: string };
    readonly profileIds: readonly string[];
    readonly calendarIds: readonly string[];
    readonly specialRegimeCatalogIds: readonly string[];
    readonly artifacts: readonly {
      readonly role: 'legalProfile' | 'calendar' | 'specialRegimeCatalog';
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
    specialRegimeCatalogIds: manifest.specialRegimeCatalogIds,
    artifacts: manifest.artifacts.map(artifact => ({
      descriptor: { role: artifact.role, contentId: artifact.contentId },
      parsed: readJson(`data/releases/${SPECIAL_RELEASE_ID}/${artifact.path}`)
    }))
  };
  return createCalculationData(release);
}

function loadSuite(): SpecialGoldenSuite {
  return readJson('tests/golden/approved/vrpg-be-special-cases.json') as SpecialGoldenSuite;
}

export const specialCalculationData = loadSpecialCalculationData();
export const specialGoldenSuite = loadSuite();
