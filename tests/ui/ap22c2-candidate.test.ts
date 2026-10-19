// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { ap22c2CalendarRuntime } from '../../src/release/ap22c2CandidateData';
import { assertActivatedCalendarProjection } from '../../src/core/holidayActivation';
import { mvp06CalculationData } from '../../src/release/mvp06ReleaseData';

const base = 'outputs/ap22c1-2026-10-08/';
const inventory = JSON.parse(readFileSync(`${base}inventory.json`, 'utf8'));

test('C2 preview consumes all 32 byte-bound C1 projections and the unchanged catalog', () => {
  for (const entry of inventory.artifacts) {
    const raw = readFileSync(`${base}${entry.path}`);
    assert.equal(createHash('sha256').update(raw).digest('hex'), entry.sha256, entry.path);
    assert.equal(raw.length, entry.byteLength, entry.path);
  }
  assert.equal(ap22c2CalendarRuntime.calendars.length, 32);
  for (const calendar of ap22c2CalendarRuntime.calendars) {
    assert.deepEqual(calendar, JSON.parse(readFileSync(`${base}calendars/${calendar.calendarId}.json`, 'utf8')));
  }
  assert.deepEqual(ap22c2CalendarRuntime.catalog, JSON.parse(readFileSync(`${base}holiday-catalogs/ch-holiday-catalog.json`, 'utf8')));
  assertActivatedCalendarProjection(ap22c2CalendarRuntime.catalog, ap22c2CalendarRuntime.catalogSha256,
    ap22c2CalendarRuntime.calendars, [...mvp06CalculationData.calendarRuleSets.values()]);
});

test('C2 runtime remains an explicit local reference candidate without a release promotion', () => {
  assert.equal(ap22c2CalendarRuntime.referenceOnly, true);
  assert.equal(ap22c2CalendarRuntime.catalog.activation.releaseEligibility.status, 'candidate');
  assert.equal(ap22c2CalendarRuntime.catalog.activation.releaseEligibility.releaseId, null);
  assert.match(readFileSync('src/ui/preview/main.tsx', 'utf8'), /candidate === 'ap22c2'/);
  assert.doesNotMatch(readFileSync('src/release/mvp06ReleaseData.ts', 'utf8'), /ap22c2|calendarRuntime/);
  const currentEntry = readFileSync('src/public-app/main.tsx', 'utf8');
  assert.doesNotMatch(currentEntry, /ap22c2|ap22c2CalendarRuntime/);
  assert.match(currentEntry, /import \{ mvp09Runtime \} from '\.\.\/release\/mvp09ReleaseData'/);
  assert.match(currentEntry, /<FristenrechnerApp \{\.\.\.mvp09Runtime\} \/>/);
});
