// SPDX-License-Identifier: AGPL-3.0-only
// Immutable norm references only. No old release or CalculationData adapter.
import federal from '../../data/releases/2026-10-01-mvp-06-approved.1/calendars/ch-federal-calendar.json';
import bern from '../../data/releases/2026-10-01-mvp-06-approved.1/calendars/be-public-holidays.json';
import type { CalendarRuleSet } from './calendarRuleTypes';
export const FORMAT7_LEGACY_CALENDAR_BASELINE = [federal, bern] as unknown as readonly CalendarRuleSet[];
