// SPDX-License-Identifier: AGPL-3.0-only

import { parseIsoDate } from '../core/date';

export type DateEntryResult =
  | Readonly<{ kind: 'empty'; value: ''; display: '' }>
  | Readonly<{ kind: 'valid'; value: string; display: string }>
  | Readonly<{ kind: 'invalid'; reason: 'format' | 'date' | 'clock' }>;

const swissClock = new Intl.DateTimeFormat('en-GB-u-ca-gregory-nu-latn', {
  timeZone: 'Europe/Zurich',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  era: 'short'
});

function pad(value: string): string {
  return value.padStart(2, '0');
}

/** A presentation-only conversion. Invalid or absent committed values stay empty. */
export function formatDateEntry(iso: string): string {
  const date = parseIsoDate(iso);
  return date
    ? `${pad(String(date.day))}.${pad(String(date.month))}.${String(date.year).padStart(4, '0')}`
    : '';
}

/** Resolve the Swiss civil date of this instant, never the host's local date. */
export function zurichToday(now: Date): string {
  if (!Number.isFinite(now.getTime())) {
    throw new RangeError('Ungültiger Zeitpunkt für die Schweizer Datumseingabe.');
  }
  const parts = swissClock.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((entry) => entry.type === type)?.value ?? '';
  const date = `${part('year').padStart(4, '0')}-${part('month')}-${part('day')}`;
  // Without the era check a BC year could accidentally become a supported AD year.
  if (part('era') !== 'AD' || !parseIsoDate(date)) {
    throw new RangeError('Der Schweizer Tag liegt ausserhalb der unterstützten Kalenderjahre.');
  }
  return date;
}

/**
 * Parse once when the field is committed. The result contains a fixed civil date,
 * not a live shortcut that can silently change after midnight or on submission.
 */
export function parseDateEntry(
  text: string,
  locale: 'de' | 'fr',
  now: Date = new Date()
): DateEntryResult {
  const input = text.trim();
  if (input === '') {
    return Object.freeze({ kind: 'empty', value: '', display: '' });
  }

  const shortcut = /^[hH]$/.test(input) || (locale === 'fr' && /^[aA]$/.test(input));
  const match = /^(\d{1,2})(?:\.(\d{1,2})(?:\.(\d{4}))?)?$/.exec(input);
  if (!shortcut && !match) {
    return Object.freeze({ kind: 'invalid', reason: 'format' });
  }

  let value: string;
  if (match?.[3]) {
    value = `${match[3]}-${pad(match[2]!)}-${pad(match[1]!)}`;
  } else {
    let today: string;
    try {
      today = zurichToday(now);
    } catch {
      return Object.freeze({ kind: 'invalid', reason: 'clock' });
    }
    value = shortcut
      ? today
      : `${today.slice(0, 4)}-${pad(match![2] ?? today.slice(5, 7))}-${pad(match![1]!)}`;
  }

  if (!parseIsoDate(value)) {
    return Object.freeze({ kind: 'invalid', reason: 'date' });
  }
  return Object.freeze({ kind: 'valid', value, display: formatDateEntry(value) });
}
