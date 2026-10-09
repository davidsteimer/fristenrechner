// SPDX-License-Identifier: AGPL-3.0-only

// Explicit local preview entry point. Never imported by an approved production build.
import { createCalculationData } from '../core';
import type { ValidatedReleaseLike } from '../core';
import manifest from '../../data/releases/2026-09-12-ap17c-candidate.1/manifest.json';
import bgg from '../../data/releases/2026-09-12-ap17c-candidate.1/profiles/bgg.json';
import stpo from '../../data/releases/2026-09-12-ap17c-candidate.1/profiles/stpo.json';
import vrpgBe from '../../data/releases/2026-09-12-ap17c-candidate.1/profiles/vrpg-be.json';
import vwvg from '../../data/releases/2026-09-12-ap17c-candidate.1/profiles/vwvg.json';
import zpo from '../../data/releases/2026-09-12-ap17c-candidate.1/profiles/zpo.json';
import beCalendar from '../../data/releases/2026-09-12-ap17c-candidate.1/calendars/be-public-holidays.json';
import chCalendar from '../../data/releases/2026-09-12-ap17c-candidate.1/calendars/ch-federal-calendar.json';
import catalog from '../../data/releases/2026-09-12-ap17c-candidate.1/special-regimes/vrpg-be.json';

const documents: Readonly<Record<string, unknown>> = {
  bgg, stpo, 'vrpg-be': vrpgBe, vwvg, zpo,
  'be-public-holidays': beCalendar, 'ch-federal-calendar': chCalendar,
  'vrpg-be-special-regimes-ap17c': catalog
};

export const ap17cCandidateRelease: ValidatedReleaseLike = {
  releaseId: manifest.releaseId,
  formatVersion: manifest.formatVersion,
  coverageFrom: manifest.coverage.from,
  coverageTo: manifest.coverage.to,
  profileIds: manifest.profileIds,
  calendarIds: manifest.calendarIds,
  specialRegimeCatalogIds: manifest.specialRegimeCatalogIds,
  artifacts: manifest.artifacts.map(artifact => ({
    descriptor: {
      role: artifact.role as 'legalProfile' | 'calendar' | 'specialRegimeCatalog',
      contentId: artifact.contentId,
      schemaId: artifact.schemaId
    },
    parsed: documents[artifact.contentId]
  }))
};

export const ap17cCandidateCalculationData = createCalculationData(ap17cCandidateRelease);
