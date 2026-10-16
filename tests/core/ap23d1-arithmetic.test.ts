// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import { countDayDeadline, type DayDeadlineArithmeticInput } from '../../src/core/dayDeadlineArithmetic';
import { calculateDeadline } from '../../src/core/calculateDeadline';
import type { CalculationData, CalculationInput } from '../../src/core/types';

const input = (patch: Partial<DayDeadlineArithmeticInput> = {}): DayDeadlineArithmeticInput => ({
  legallyRelevantDate: '2026-09-16', deadlineDays: 10, periods: [],
  shiftStartDuringSuspension: true, holidaysByDate: new Map(),
  isCovered: date => date >= '2026-08-29' && date <= '2027-12-31', ...patch
});
const winter = { periodId: 'winter', startsOn: '2026-12-18', endsOn: '2027-01-02' };
test('AP23D1 raw Format 8 cannot use the historical calculator entry point', () => {
  const result = calculateDeadline({} as CalculationInput, { formatVersion: '8.0.0' } as CalculationData);
  assert.equal(result.outcome, 'blocked');
  if (result.outcome !== 'blocked') return;
  assert.deepEqual(result.blockReasonKeys, ['administrativeProcedure.qualifiedContextRequired']);
  assert.equal('finalEnd' in result, false);
});
test('AP23D1 common counter begins next day and extends Saturday through Sunday', () => {
  const result = countDayDeadline(input());
  assert.equal(result.outcome, 'calculated');
  if (result.outcome !== 'calculated') return;
  assert.equal(result.deadlineStart, '2026-09-17');
  assert.equal(result.provisionalEnd, '2026-09-26');
  assert.equal(result.finalEnd, '2026-09-28');
  assert.deepEqual(result.shiftReasonKeys, ['saturday', 'sunday']);
  assert.equal(result.countedDates.length, 10);
});
test('AP23D1 suspension-following Sunday is the first counted day, no extra day', () => {
  const result = countDayDeadline(input({ legallyRelevantDate: '2026-12-21', deadlineDays: 2, periods: [winter] }));
  assert.equal(result.outcome, 'calculated');
  if (result.outcome !== 'calculated') return;
  assert.equal(result.deadlineStart, '2027-01-03');
  assert.equal(result.finalEnd, '2027-01-04');
  assert.deepEqual(result.countedDates, ['2027-01-03', '2027-01-04']);
  assert.equal(result.skippedCalendarDays, 12);
});
test('AP23D1 coverage is checked for every skipped day, not only endpoints', () => {
  const seen: string[] = [];
  const result = countDayDeadline(input({ legallyRelevantDate: '2026-12-21', periods: [winter],
    isCovered: date => { seen.push(date); return date !== '2026-12-25'; } }));
  assert.equal(result.outcome, 'blocked');
  assert.ok(seen.includes('2026-12-25'));
  assert.equal('finalEnd' in result, false);
});
test('AP23D1 delivery outside coverage blocks before arithmetic', () => {
  assert.deepEqual(countDayDeadline(input({ legallyRelevantDate: '2026-08-28' })),
    { outcome: 'blocked', reason: 'dataCoverageExceeded' });
});
test('AP23D1 end shift cannot leave the approved calculation window', () => {
  const result = countDayDeadline(input({ legallyRelevantDate: '2027-12-30', deadlineDays: 1,
    holidaysByDate: new Map([['2027-12-31', [{ holidayId: 'synthetic-last-day' }]]]) }));
  assert.equal(result.outcome, 'blocked');
  assert.equal('finalEnd' in result, false);
});
test('AP23D1 TI-O2 returns diagnostic evidence but no definitive end date', () => {
  const result = countDayDeadline(input({ legallyRelevantDate: '2027-02-17', deadlineDays: 30,
    periods: [{ periodId: 'ti-easter-2027', startsOn: '2027-03-21', endsOn: '2027-04-04' }],
    holidaysByDate: new Map([['2027-03-19', [{ holidayId: 'josef' }]]]), blockEndShiftIntoSuspension: true }));
  assert.equal(result.outcome, 'blocked');
  if (result.outcome !== 'blocked') return;
  assert.equal(result.reason, 'endShiftIntoSuspensionUnresolved');
  assert.equal(result.provisionalEnd, '2027-03-19');
  assert.deepEqual(result.periodIds, ['ti-easter-2027']);
  assert.ok(result.shiftedHolidayIds?.includes('josef'));
  assert.equal('finalEnd' in result, false);
});
test('AP23D1 same physical end shift remains unchanged when TI guard is inapplicable', () => {
  const result = countDayDeadline(input({ legallyRelevantDate: '2027-03-06', deadlineDays: 13,
    holidaysByDate: new Map([['2027-03-19', [{ holidayId: 'josef' }]]]) }));
  assert.equal(result.outcome, 'calculated');
  if (result.outcome === 'calculated') assert.equal(result.finalEnd, '2027-03-22');
});
test('AP23D1 overlapping suspension periods never double-count skipped calendar days', () => {
  const result = countDayDeadline(input({ legallyRelevantDate: '2026-12-21', deadlineDays: 2,
    periods: [winter, { periodId: 'overlap', startsOn: '2026-12-24', endsOn: '2026-12-26' }] }));
  assert.equal(result.outcome, 'calculated');
  if (result.outcome === 'calculated') {
    assert.equal(result.skippedCalendarDays, 12);
    assert.equal(result.finalEnd, '2027-01-04');
    assert.deepEqual(result.encounteredPeriodIds, ['winter', 'overlap']);
  }
});
test('AP23D1 malformed arithmetic inputs fail closed', () => {
  for (const patch of [{ deadlineDays: 0 }, { deadlineDays: 366 }, { deadlineDays: 1.5 },
    { legallyRelevantDate: '2027-02-30' }, { periods: [{ periodId: 'bad', startsOn: '2027-02-30', endsOn: '2027-03-01' }] }]) {
    const result = countDayDeadline(input(patch));
    assert.equal(result.outcome, 'blocked');
    if (result.outcome === 'blocked') assert.equal(result.reason, 'invalidArithmeticInput');
  }
});
