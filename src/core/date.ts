// SPDX-License-Identifier: AGPL-3.0-only

import type { IsoDate } from './types';

export interface CivilDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly ordinal: number;
}

function floorDiv(dividend: number, divisor: number): number {
  return Math.floor(dividend / divisor);
}

function modulo(dividend: number, divisor: number): number {
  return ((dividend % divisor) + divisor) % divisor;
}

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return lengths[month - 1] ?? 0;
}

// Howard Hinnants Algorithmus bildet ein gregorianisches Kalenderdatum auf
// ganze Tage relativ zum 01.01.1970 ab. Es werden weder Uhrzeiten noch
// Zeitzonen erzeugt.
function daysFromCivil(yearValue: number, month: number, day: number): number {
  let year = yearValue;
  year -= month <= 2 ? 1 : 0;
  const era = floorDiv(year, 400);
  const yearOfEra = year - era * 400;
  const shiftedMonth = month + (month > 2 ? -3 : 9);
  const dayOfYear = floorDiv(153 * shiftedMonth + 2, 5) + day - 1;
  const dayOfEra = yearOfEra * 365 + floorDiv(yearOfEra, 4) - floorDiv(yearOfEra, 100) + dayOfYear;
  return era * 146097 + dayOfEra - 719468;
}

function civilFromDays(ordinalValue: number): Omit<CivilDate, 'ordinal'> {
  const shifted = ordinalValue + 719468;
  const era = floorDiv(shifted, 146097);
  const dayOfEra = shifted - era * 146097;
  const yearOfEra = floorDiv(
    dayOfEra - floorDiv(dayOfEra, 1460) + floorDiv(dayOfEra, 36524) - floorDiv(dayOfEra, 146096),
    365
  );
  let year = yearOfEra + era * 400;
  const dayOfYear = dayOfEra - (365 * yearOfEra + floorDiv(yearOfEra, 4) - floorDiv(yearOfEra, 100));
  const monthPrime = floorDiv(5 * dayOfYear + 2, 153);
  const day = dayOfYear - floorDiv(153 * monthPrime + 2, 5) + 1;
  const month = monthPrime + (monthPrime < 10 ? 3 : -9);
  year += month <= 2 ? 1 : 0;
  return { year, month, day };
}

function pad(value: number, width: number): string {
  return String(value).padStart(width, '0');
}

export function parseIsoDate(value: string): CivilDate | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return undefined;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    return undefined;
  }

  return { year, month, day, ordinal: daysFromCivil(year, month, day) };
}

export function isoDateFromOrdinal(ordinal: number): IsoDate {
  const date = civilFromDays(ordinal);
  return `${pad(date.year, 4)}-${pad(date.month, 2)}-${pad(date.day, 2)}`;
}

export function addCalendarDays(value: IsoDate, days: number): IsoDate {
  const parsed = parseIsoDate(value);
  if (!parsed) {
    throw new Error(`Ungültiges ISO-Kalenderdatum: ${value}`);
  }
  return isoDateFromOrdinal(parsed.ordinal + days);
}

export function compareIsoDates(left: IsoDate, right: IsoDate): number {
  const parsedLeft = parseIsoDate(left);
  const parsedRight = parseIsoDate(right);
  if (!parsedLeft || !parsedRight) {
    throw new Error('Kalenderdaten können wegen eines ungültigen ISO-Datums nicht verglichen werden.');
  }
  return parsedLeft.ordinal - parsedRight.ordinal;
}

export function isDateWithin(value: IsoDate, from: IsoDate, to: IsoDate): boolean {
  return compareIsoDates(value, from) >= 0 && compareIsoDates(value, to) <= 0;
}

export function weekdayReason(value: IsoDate): 'saturday' | 'sunday' | undefined {
  const parsed = parseIsoDate(value);
  if (!parsed) {
    throw new Error(`Ungültiges ISO-Kalenderdatum: ${value}`);
  }
  const weekday = modulo(parsed.ordinal + 4, 7);
  if (weekday === 6) {
    return 'saturday';
  }
  if (weekday === 0) {
    return 'sunday';
  }
  return undefined;
}

export function isLeapDay(value: IsoDate): boolean {
  const parsed = parseIsoDate(value);
  return parsed?.month === 2 && parsed.day === 29;
}
