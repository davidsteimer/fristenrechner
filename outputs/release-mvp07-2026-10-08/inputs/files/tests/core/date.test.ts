// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  addCalendarDays,
  compareIsoDates,
  parseIsoDate,
  weekdayReason
} from '../../src/core';

describe('Reine Kalenderdatumsarithmetik', () => {
  it('behandelt Schaltjahre ohne Date- oder Zeitzonenobjekte', () => {
    assert.equal(addCalendarDays('2028-02-28', 1), '2028-02-29');
    assert.equal(addCalendarDays('2028-02-29', 1), '2028-03-01');
    assert.equal(addCalendarDays('2100-02-28', 1), '2100-03-01');
  });

  it('behandelt Monats- und Jahreswechsel', () => {
    assert.equal(addCalendarDays('2026-12-31', 1), '2027-01-01');
    assert.equal(addCalendarDays('2027-01-01', -1), '2026-12-31');
    assert.ok(compareIsoDates('2027-01-01', '2026-12-31') > 0);
  });

  it('erkennt ungültige ISO-Daten streng', () => {
    assert.equal(parseIsoDate('2026-2-01'), undefined);
    assert.equal(parseIsoDate('2026-04-31'), undefined);
    assert.equal(parseIsoDate('2026-02-29'), undefined);
  });

  it('erkennt Samstag und Sonntag', () => {
    assert.equal(weekdayReason('2026-09-26'), 'saturday');
    assert.equal(weekdayReason('2026-09-27'), 'sunday');
    assert.equal(weekdayReason('2026-09-28'), undefined);
  });
});
