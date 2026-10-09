// SPDX-License-Identifier: AGPL-3.0-only
// Explicit, unapproved MVG/ÜLG integration candidate. Never a default release.
import { createCalculationData } from '../core';
import type { ValidatedReleaseLike } from '../core';
import manifest from '../../data/candidates/2026-10-01-ap20c3/manifest.json';
import bgg from '../../data/candidates/2026-10-01-ap20c3/profiles/bgg.json';
import stpo from '../../data/candidates/2026-10-01-ap20c3/profiles/stpo.json';
import vrpgBe from '../../data/candidates/2026-10-01-ap20c3/profiles/vrpg-be.json';
import vwvg from '../../data/candidates/2026-10-01-ap20c3/profiles/vwvg.json';
import zpo from '../../data/candidates/2026-10-01-ap20c3/profiles/zpo.json';
import beCalendar from '../../data/candidates/2026-10-01-ap20c3/calendars/be-public-holidays.json';
import chCalendar from '../../data/candidates/2026-10-01-ap20c3/calendars/ch-federal-calendar.json';
import specialCatalog from '../../data/candidates/2026-10-01-ap20c3/special-regimes/vrpg-be.json';
import holidayCatalog from '../../data/candidates/2026-10-01-ap20c3/holiday-catalogs/ch-holiday-catalog.json';
import socialCatalog from '../../data/candidates/2026-10-01-ap20c3/social-procedures/ch-social-procedures.json';

const documents: Readonly<Record<string, unknown>> = {
  bgg, stpo, 'vrpg-be': vrpgBe, vwvg, zpo,
  'be-public-holidays': beCalendar, 'ch-federal-calendar': chCalendar,
  'vrpg-be-special-regimes-rest': specialCatalog, 'ch-holiday-catalog': holidayCatalog,
  'ch-social-procedures': socialCatalog
};
export const ap20c3CandidateRelease: ValidatedReleaseLike = {
  releaseId: manifest.releaseId, formatVersion: manifest.formatVersion,
  coverageFrom: manifest.coverage.from, coverageTo: manifest.coverage.to,
  profileIds: manifest.profileIds, calendarIds: manifest.calendarIds,
  specialRegimeCatalogIds: manifest.specialRegimeCatalogIds,
  holidayCatalogIds: manifest.holidayCatalogIds,
  socialProcedureCatalogIds: manifest.socialProcedureCatalogIds,
  artifacts: manifest.artifacts.map(artifact => ({
    descriptor: {
      role: artifact.role as ValidatedReleaseLike['artifacts'][number]['descriptor']['role'],
      contentId: artifact.contentId, schemaId: artifact.schemaId, sha256: artifact.sha256
    }, parsed: documents[artifact.contentId]
  }))
};
export const ap20c3CandidateCalculationData = createCalculationData(ap20c3CandidateRelease);
