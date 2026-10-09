// SPDX-License-Identifier: AGPL-3.0-only

import { addCalendarDays, parseIsoDate } from '../core';
import type { IsoDate } from '../core';
import { translate, type Locale } from './i18n';

const CRLF = '\r\n';
const MAX_REFERENCE_CHARACTERS = 200;
const REMINDER_TRIGGER = '-PT112H';
const OUTLOOK_CATEGORY = 'Fristablauf';

export interface DeadlineCalendarEntryOptions {
  readonly deadlineDate: string;
  readonly locale: Locale;
  readonly reference?: string;
  readonly uid?: string;
  readonly createdAt?: Date;
}

export interface DeadlineCalendarArtifact {
  readonly content: string;
  readonly filename: string;
  readonly mimeType: 'text/calendar;charset=utf-8';
}

function utf8Length(value: string): number {
  return new TextEncoder().encode(value).length;
}

function foldContentLine(line: string): string {
  const segments: string[] = [];
  let current = '';

  for (const character of line) {
    const limit = segments.length === 0 ? 75 : 74;
    if (current && utf8Length(current + character) > limit) {
      segments.push(current);
      current = character;
    } else {
      current += character;
    }
  }
  segments.push(current);

  return segments
    .map((segment, index) => index === 0 ? segment : ` ${segment}`)
    .join(CRLF);
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

function compactDate(value: string): string {
  return value.replace(/-/g, '');
}

function formatTimestamp(value: Date): string {
  if (!Number.isFinite(value.getTime())) {
    throw new Error('Der Erstellungszeitpunkt des Kalendereintrags ist ungültig.');
  }
  return value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function createUid(deadlineDate: string): string {
  const randomPart = typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `fristenrechner-${compactDate(deadlineDate)}-${randomPart}@steimer.ch`;
}

export function normalizeCalendarReference(value: string): string {
  return Array.from(value.replace(/\s+/g, ' ').trim())
    .slice(0, MAX_REFERENCE_CHARACTERS)
    .join('');
}

export function createDeadlineCalendarEntry(
  options: DeadlineCalendarEntryOptions
): DeadlineCalendarArtifact {
  const parsedDate = parseIsoDate(options.deadlineDate);
  if (!parsedDate) {
    throw new Error('Der Kalendereintrag benötigt einen gültigen Fristablauf.');
  }
  const deadlineDate = options.deadlineDate as IsoDate;
  const endDate = addCalendarDays(deadlineDate, 1);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    throw new Error('Der Fristablauf liegt ausserhalb des unterstützten Kalenderbereichs.');
  }

  const reference = normalizeCalendarReference(options.reference ?? '');
  const subjectBase = translate(options.locale, 'calendar.subject');
  const summary = reference ? `${subjectBase} (${reference})` : subjectBase;
  const uid = options.uid?.trim() || createUid(deadlineDate);
  const createdAt = options.createdAt ?? new Date();
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//STEIMER//Fristenrechner Schweiz//DE-FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escapeText(uid)}`,
    `DTSTAMP:${formatTimestamp(createdAt)}`,
    `DTSTART;VALUE=DATE:${compactDate(deadlineDate)}`,
    `DTEND;VALUE=DATE:${compactDate(endDate)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(translate(options.locale, 'calendar.description'))}`,
    'TRANSP:TRANSPARENT',
    'X-MICROSOFT-CDO-BUSYSTATUS:FREE',
    `CATEGORIES:${OUTLOOK_CATEGORY}`,
    'BEGIN:VALARM',
    `TRIGGER:${REMINDER_TRIGGER}`,
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(summary)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return {
    content: `${lines.map(foldContentLine).join(CRLF)}${CRLF}`,
    filename: `fristablauf-${deadlineDate}.ics`,
    mimeType: 'text/calendar;charset=utf-8'
  };
}

export function downloadDeadlineCalendarEntry(artifact: DeadlineCalendarArtifact): void {
  if (typeof document === 'undefined' || typeof URL === 'undefined') {
    throw new Error('In dieser Umgebung kann keine Kalenderdatei heruntergeladen werden.');
  }

  const objectUrl = URL.createObjectURL(new Blob([artifact.content], { type: artifact.mimeType }));
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = artifact.filename;
  anchor.hidden = true;
  document.body.appendChild(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove();
    globalThis.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  }
}

export const CALENDAR_EXPORT_CONTRACT = Object.freeze({
  category: OUTLOOK_CATEGORY,
  reminderTrigger: REMINDER_TRIGGER,
  referenceMaxCharacters: MAX_REFERENCE_CHARACTERS
});
