// SPDX-License-Identifier: AGPL-3.0-only

import { createCalculationData } from '../core';
import type { ValidatedReleaseLike } from '../core';
import manifest from '../../data/releases/2026-09-22-mvp-04-approved.1/manifest.json';
import bgg from '../../data/releases/2026-09-22-mvp-04-approved.1/profiles/bgg.json';
import stpo from '../../data/releases/2026-09-22-mvp-04-approved.1/profiles/stpo.json';
import vrpgBe from '../../data/releases/2026-09-22-mvp-04-approved.1/profiles/vrpg-be.json';
import vwvg from '../../data/releases/2026-09-22-mvp-04-approved.1/profiles/vwvg.json';
import zpo from '../../data/releases/2026-09-22-mvp-04-approved.1/profiles/zpo.json';
import beCalendar from '../../data/releases/2026-09-22-mvp-04-approved.1/calendars/be-public-holidays.json';
import chCalendar from '../../data/releases/2026-09-22-mvp-04-approved.1/calendars/ch-federal-calendar.json';
import specialCatalog from '../../data/releases/2026-09-22-mvp-04-approved.1/special-regimes/vrpg-be.json';
import holidayCatalog from '../../data/releases/2026-09-22-mvp-04-approved.1/holiday-catalogs/ch-holiday-catalog.json';

const documents: Readonly<Record<string, unknown>> = {
  bgg, stpo, 'vrpg-be': vrpgBe, vwvg, zpo,
  'be-public-holidays': beCalendar, 'ch-federal-calendar': chCalendar,
  'vrpg-be-special-regimes-ap17c': specialCatalog,
  'ch-holiday-catalog': holidayCatalog
};

export const mvp04Release: ValidatedReleaseLike = {
  releaseId: manifest.releaseId,
  formatVersion: manifest.formatVersion,
  coverageFrom: manifest.coverage.from,
  coverageTo: manifest.coverage.to,
  profileIds: manifest.profileIds,
  calendarIds: manifest.calendarIds,
  specialRegimeCatalogIds: manifest.specialRegimeCatalogIds,
  holidayCatalogIds: manifest.holidayCatalogIds,
  artifacts: manifest.artifacts.map(artifact => ({
    descriptor: {
      role: artifact.role as 'legalProfile' | 'calendar' | 'specialRegimeCatalog' | 'holidayCatalog',
      contentId: artifact.contentId,
      schemaId: artifact.schemaId
    },
    parsed: documents[artifact.contentId]
  }))
};

export const mvp04CalculationData = createCalculationData(mvp04Release);
