// SPDX-License-Identifier: AGPL-3.0-only
// Presentation only. Source identity is resolved by exact bindings, never by ID prefixes.
import * as React from 'react';
import { generateCalendarFromRules } from '../core/generateCalendar';
import { parseIsoDate } from '../core/date';
import type { CalendarRuleSet, CalendarGenerationRange } from '../core/calendarRuleTypes';
import type { CalculationData, CalendarTraceEvidence, LegalProfile } from '../core/types';
import type { Locale } from './i18n';
import { translateReason } from './i18n';
import { calendarReason } from './calendarMessages';

export interface TraceSourceRef { readonly sourceId: string; readonly locator: string }
export interface TraceSourceLink extends TraceSourceRef { readonly title: string; readonly url?: string }
export interface TraceSources { readonly refs: readonly TraceSourceRef[]; readonly links: readonly TraceSourceLink[]; readonly unresolved: boolean }
const words = {
  de: { technical: 'Technische Nachweise', calendar: 'Kalender', release: 'Datenstand', rule: 'Kalenderregel',
    legal: 'Rechtsgrundlage', unavailable: 'Die genaue Quellenzuordnung ist in den technischen Nachweisen dokumentiert.',
    entry: 'Berücksichtigter Kalendereintrag', unnamedSource: 'Gebundene Rechtsquelle', generated: 'Erzeugte Einträge', removed: 'Entfernte Einträge',
    reasonUnknown: 'Weitere Einzelheiten siehe technische Nachweise.' },
  fr: { technical: 'Justificatifs techniques', calendar: 'Calendrier', release: 'Version des données', rule: 'Règle du calendrier',
    legal: 'Base légale', unavailable: 'L’attribution exacte des sources figure dans les justificatifs techniques.',
    entry: 'Élément du calendrier pris en compte', unnamedSource: 'Source juridique liée', generated: 'Éléments générés', removed: 'Éléments supprimés',
    reasonUnknown: 'Pour davantage de précisions, voir les justificatifs techniques.' }
} as const;
function object(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value); }
function refs(value: unknown): TraceSourceRef[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(row => object(row) && typeof row.sourceId === 'string' && row.sourceId.length > 0
    && typeof row.locator === 'string' && row.locator.length > 0 ? [{ sourceId: row.sourceId, locator: row.locator }] : []);
}
function uniqueRefs(values: readonly TraceSourceRef[]): TraceSourceRef[] {
  return values.filter((ref, index) => values.findIndex(other => other.sourceId === ref.sourceId && other.locator === ref.locator) === index);
}
function https(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined; }
  catch { return undefined; }
}

/** Caller supplies the already selected, applicable source references. A source
 * registry does not itself grant applicability. Missing/ambiguous records are
 * not replaced by a similarly named source. The optional title is display-only. */
export function catalogTraceSources(catalog: unknown, boundRefs: readonly TraceSourceRef[], fallbackTitle?: string): TraceSources {
  const selected = uniqueRefs(refs(boundRefs));
  const sourceRows = object(catalog) && Array.isArray(catalog.sources) ? catalog.sources.filter(object) : [];
  const links = selected.flatMap(ref => {
    const matches = sourceRows.filter(source => source.sourceId === ref.sourceId);
    if (matches.length !== 1) return [];
    const source = matches[0]!;
    const title = typeof source.title === 'string' && source.title.trim() ? source.title.trim() : fallbackTitle ?? '';
    const url = https(source.url);
    return [{ ...ref, title, ...(url ? { url } : {}) }];
  });
  return { refs: selected, links, unresolved: links.length !== selected.length };
}

/** LegalProfile intentionally exposes only calculator fields. Its validated
 * runtime document retains sources and per-rule sourceRefs. Read them narrowly
 * here instead of changing the legal format or inventing a parallel mapping. */
export function profileTraceSources(profile: LegalProfile | undefined, appliedRuleIds: readonly string[]): TraceSources {
  if (!profile) return { refs: [], links: [], unresolved: true };
  const raw: unknown = profile;
  if (!object(raw) || !Array.isArray(raw.rules)) return { refs: [], links: [], unresolved: true };
  const selected: TraceSourceRef[] = [];
  let ambiguous = false;
  for (const id of new Set(appliedRuleIds)) {
    const matches = raw.rules.filter(rule => object(rule) && rule.ruleId === id);
    // Calendar rule IDs can legitimately coexist with legal profile rule IDs.
    if (!matches.length) continue;
    if (matches.length !== 1 || !object(matches[0])) { ambiguous = true; continue; }
    const sourceRefs = refs(matches[0].sourceRefs);
    if (!sourceRefs.length) ambiguous = true;
    selected.push(...sourceRefs);
  }
  const evidence = catalogTraceSources(raw, selected);
  return { ...evidence, unresolved: evidence.unresolved || ambiguous || !selected.length };
}

export function LegalTraceSources({ evidence, locale }: { readonly evidence: TraceSources; readonly locale: Locale }): React.ReactElement {
  const text = words[locale];
  return <div className="fr-trace__legal"><p><strong>{text.legal}:</strong>{' '}
    {evidence.links.map((source, index) => <React.Fragment key={`${source.sourceId}:${source.locator}`}>
      {index > 0 ? ' · ' : ''}{source.url
        ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title || text.unnamedSource} — {source.locator}</a>
        : <span>{source.title || text.unnamedSource} — {source.locator}</span>}
    </React.Fragment>)}
    {!evidence.links.length ? text.unavailable : ''}</p>
    {evidence.links.length > 0 && evidence.unresolved ? <p>{text.unavailable}</p> : null}
  </div>;
}

export function TechnicalTraceDetails({ locale, children }: { readonly locale: Locale; readonly children: React.ReactNode }): React.ReactElement {
  return <details className="fr-trace__technical"><summary>{words[locale].technical}</summary>{children}</details>;
}

export function TechnicalCalendarEvidence({ evidence, locale }: { readonly evidence: CalendarTraceEvidence; readonly locale: Locale }): React.ReactElement {
  const text = words[locale];
  return <TechnicalTraceDetails locale={locale}>
    <p>{text.calendar}: <code>{evidence.calendarId}</code> · {text.release}: <code>{evidence.releaseId}</code></p>
    <ul>{evidence.applications.map((application, index) => <li key={`${application.calendarId}:${application.ruleId}:${index}`}>
      <code>{application.ruleId}</code> · <code>{application.calendarId}</code> · <code>{application.operation}</code>
      <p>{application.sourceRefs.map(ref => `${ref.sourceId} ${ref.locator}`).join(' · ')}</p>
      {application.generatedIds.length ? <p>{text.generated}: {application.generatedIds.join(' · ')}</p> : null}
      {application.removedIds.length ? <p>{text.removed}: {application.removedIds.join(' · ')}</p> : null}
    </li>)}</ul>
  </TechnicalTraceDetails>;
}

type LabelData = Pick<CalculationData, 'releaseId' | 'calendarRuleSets'>;
function ruleSets(data: LabelData, calendars?: readonly CalendarRuleSet[]): readonly CalendarRuleSet[] {
  return calendars ?? [...data.calendarRuleSets.values()];
}

/** Decode only established display tokens. Raw diagnostic keys remain available
 * to callers for the technical section, never as an invented legal statement. */
export function traceReasonLabels(keys: readonly string[], locale: Locale, data: LabelData,
  calendars?: readonly CalendarRuleSet[]): readonly string[] {
  const sets = ruleSets(data, calendars);
  return keys.map(key => {
    const calendarMessage = calendarReason(locale, key);
    if (calendarMessage) return calendarMessage;
    const translated = translateReason(locale, key);
    if (translated !== key) return translated;
    // This is the existing core diagnostic token, not a source/law ID pattern.
    const skipped = /^skipped(0|[1-9][0-9]*)CalendarDays$/.exec(key);
    if (skipped && Number.isSafeInteger(Number(skipped[1]))) {
      const count = Number(skipped[1]);
      return locale === 'de' ? `${count} ${count === 1 ? 'Kalendertag im Friststillstand' : 'Kalendertage im Friststillstand'}`
        : `${count} ${count === 1 ? 'jour calendaire non compté pendant la suspension' : 'jours calendaires non comptés pendant la suspension'}`;
    }
    const labels = new Set(sets.flatMap(set => set.rules.filter(rule => rule.labelKey === key)
      .map(rule => rule.labels[locale]).filter(label => !!label)));
    return labels.size === 1 ? [...labels][0]! : words[locale].reasonUnknown;
  }).filter((label, index, all) => all.indexOf(label) === index);
}

export function calendarApplicationLabels(evidence: CalendarTraceEvidence, data: LabelData, locale: Locale,
  calendars?: readonly CalendarRuleSet[]): readonly string[] {
  const sets = ruleSets(data, calendars);
  return evidence.applications.map(application => {
    if (evidence.releaseId !== data.releaseId) return words[locale].entry;
    const candidates = sets.filter(set => set.calendarId === application.calendarId)
      .flatMap(set => set.rules.filter(rule => rule.ruleId === application.ruleId));
    return candidates.length === 1 && candidates[0]!.labels[locale] ? candidates[0]!.labels[locale] : words[locale].entry;
  });
}

export interface FriendlyCalendarEvidenceProps {
  readonly evidence: CalendarTraceEvidence;
  readonly data: LabelData;
  readonly locale: Locale;
  readonly calendars?: readonly CalendarRuleSet[] | undefined;
  readonly range?: CalendarGenerationRange | undefined;
  /** IDs of entries actually used in this step, not all entries generated by a rule. */
  readonly resultIds?: readonly string[] | undefined;
  readonly legalSources?: TraceSources | undefined;
  readonly includeTechnical?: boolean | undefined;
}

function date(value: string): string { return value.split('-').reverse().join('.'); }
export function FriendlyCalendarEvidence({ evidence, data, locale, calendars, range, resultIds, legalSources, includeTechnical = true }: FriendlyCalendarEvidenceProps): React.ReactElement {
  const labels = calendarApplicationLabels(evidence, data, locale, calendars);
  const dates = new Map<string, string>();
  // Reuse the existing generator only to resolve exact result identities for
  // display. Never derive a year, holiday or legal applicability from an ID.
  if (range && parseIsoDate(range.from) && parseIsoDate(range.to) && range.from <= range.to
    && Number(range.to.slice(0, 4)) - Number(range.from.slice(0, 4)) <= 3
    && resultIds?.length && evidence.releaseId === data.releaseId) {
    try {
      const calendar = generateCalendarFromRules(ruleSets(data, calendars), evidence.calendarId, range).calendar;
      const selected = new Set(resultIds);
      for (const set of calendar.suspensionSets) for (const period of set.periods) {
        if (selected.has(period.periodId)) dates.set(period.periodId, `${date(period.startsOn)}–${date(period.endsOn)}`);
      }
      for (const holiday of calendar.holidays) if (selected.has(holiday.holidayId)) dates.set(holiday.holidayId, date(holiday.date));
    } catch { /* No guessed replacement when historical/display context is incomplete. */ }
  }
  const entries = evidence.applications.map((application, index) => {
    const actualDates = application.generatedIds.flatMap(id => dates.has(id) ? [dates.get(id)!] : []);
    return `${labels[index]}${actualDates.length ? `: ${[...new Set(actualDates)].join(' · ')}` : ''}`;
  }).filter((value, index, all) => all.indexOf(value) === index);
  return <div className="fr-trace__calendar">
    <ul className="fr-trace__calendar-summary">{entries.map((entry, index) => <li key={index}>{entry}</li>)}</ul>
    {legalSources ? <LegalTraceSources evidence={legalSources} locale={locale} /> : null}
    {includeTechnical ? <TechnicalCalendarEvidence evidence={evidence} locale={locale} /> : null}
  </div>;
}
