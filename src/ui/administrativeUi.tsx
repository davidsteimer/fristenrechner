// SPDX-License-Identifier: AGPL-3.0-only
import * as React from 'react';
import { PrimaryButton, Dropdown, MessageBar, MessageBarType, TextField } from '@fluentui/react';
import { parseIsoDate } from '../core/date';
import { administrativePeriodDate } from '../core/administrativeCatalog';
import { generateCalendarFromRules } from '../core/generateCalendar';
import { getVerifiedAdministrativeData } from '../core/releaseFormat8';
import type { AdministrativeDeadlineInput, AdministrativeDeadlineResult } from '../core/administrativeDeadline';
import type { AdministrativePath, AdministrativeProcedureCatalog, AdministrativeSourceRef, AdministrativeStage } from '../core/administrativeTypes';
import { calculatorDropdownStyles } from './dropdownStyles';
import { administrativeText } from './administrativeMessages';
import { administrativeExportAvailable } from './administrativeExport';
import type { Locale } from './i18n';
import { translate } from './i18n';
import { calendarCantonLabel } from './calendarMessages';
import { TechnicalTraceDetails } from './tracePresentation';

export interface AdministrativeUiState {
  readonly stage: string;
  readonly pathId: string;
  readonly qualification: '' | 'generalActualReceipt' | 'specialOrDeviating' | 'unknown';
  readonly urgency: '' | 'none' | 'explicitJudicialUrgencyOrder' | 'unknown';
}
export const EMPTY_ADMINISTRATIVE_UI_STATE: AdministrativeUiState = Object.freeze({ stage: '', pathId: '', qualification: '', urgency: '' });

export function administrativeChoices(catalog: AdministrativeProcedureCatalog, lawId: string, state: AdministrativeUiState): {
  readonly stages: readonly AdministrativeStage[]; readonly paths: readonly AdministrativePath[]; readonly path?: AdministrativePath;
} {
  const available = catalog.paths.filter(path => path.lawId === lawId);
  const stages = (['administration', 'administrativeAppeal', 'court'] as const).filter(stage => available.some(path => path.stages.includes(stage)));
  const stage = state.stage || (stages.length === 1 ? stages[0] : '');
  const paths = available.filter(path => path.stages.some(value => value === stage));
  const path = paths.find(value => value.pathId === state.pathId) ?? (!state.pathId && paths.length === 1 ? paths[0] : undefined);
  return { stages, paths, ...(path ? { path } : {}) };
}

/** Only real one-value choices are fixed. No case fact is inferred by this step. */
export function settleAdministrativeUiState(catalog: AdministrativeProcedureCatalog, lawId: string, state: AdministrativeUiState): AdministrativeUiState {
  const choices = administrativeChoices(catalog, lawId, state);
  const stage = state.stage || (choices.stages.length === 1 ? choices.stages[0]! : '');
  return { ...state, stage, pathId: state.pathId || choices.path?.pathId || '' };
}

export function changeAdministrativeSelection(catalog: AdministrativeProcedureCatalog, lawId: string, state: AdministrativeUiState,
  field: 'stage' | 'pathId', value: string): AdministrativeUiState {
  return settleAdministrativeUiState(catalog, lawId, {
    ...state, [field]: value, ...(field === 'stage' ? { pathId: '' } : {}), qualification: '', urgency: ''
  });
}

export interface QualifyAdministrativeUiOptions {
  readonly catalog: AdministrativeProcedureCatalog;
  readonly lawId: string;
  readonly authorityCanton: string;
  readonly inputDate: string;
  readonly deadlineDays: number | undefined;
  readonly state: AdministrativeUiState;
}
export function qualifyAdministrativeUiInput(options: QualifyAdministrativeUiOptions): {
  readonly input?: AdministrativeDeadlineInput; readonly errors: Readonly<Record<string, string>>;
} {
  const { catalog, lawId, authorityCanton, inputDate, deadlineDays } = options;
  const state = settleAdministrativeUiState(catalog, lawId, options.state);
  const choices = administrativeChoices(catalog, lawId, state);
  const law = catalog.laws.find(value => value.lawId === lawId);
  const errors: Record<string, string> = {};
  if (!law) errors.law = 'validation.law';
  else if (law.canton !== authorityCanton) errors.authority = 'validation.authority';
  if (!choices.stages.some(stage => stage === state.stage)) errors.stage = 'validation.stage';
  if (!choices.path) errors.pathId = 'validation.pathId';
  if (state.qualification !== 'generalActualReceipt') errors.qualification = state.qualification === 'specialOrDeviating'
    ? 'validation.unsupported' : 'validation.qualification';
  if (!parseIsoDate(inputDate)) errors.inputDate = 'validation.inputDate';
  const path = choices.path;
  if (path?.duration.kind === 'statutoryDays') {
    if (deadlineDays !== undefined && deadlineDays !== path.duration.value) errors.deadlineDays = 'validation.durationMismatch';
  } else if (typeof deadlineDays !== 'number' || !Number.isInteger(deadlineDays) || deadlineDays < 1 || deadlineDays > 365) {
    errors.deadlineDays = 'validation.deadlineDays';
  }
  const urgencyRelevant = path?.urgencyPolicy === 'explicitGRJudicialUrgencyOrder' && state.stage === 'court';
  if (urgencyRelevant && state.urgency !== 'none' && state.urgency !== 'explicitJudicialUrgencyOrder') errors.urgency = 'validation.urgency';
  if (Object.keys(errors).length > 0 || !path || !law) return { errors };
  return { errors, input: {
    selection: { kind: 'cantonalAdministrative', lawId, pathId: path.pathId, revision: path.revision, stage: state.stage },
    authoritySeat: { canton: authorityCanton, level: 'cantonal', qualification: 'competentAuthorityForCurrentAction' },
    inputDate, deadlineDays: path.duration.kind === 'statutoryDays' ? path.duration.value : deadlineDays!,
    qualification: { delivery: 'qualifiedActualDelivery', generalRoute: 'qualified', specialLaw: 'excluded',
      explicitHolidayException: 'none', fixedEndDate: false, deviatingStart: false, evidenceAdvance: false },
    urgency: urgencyRelevant ? state.urgency as 'none' | 'explicitJudicialUrgencyOrder' : 'none'
  } };
}

function FixedValue({ label, value }: { readonly label: string; readonly value: string }): React.ReactElement {
  return <div className="fr-model-scope"><div className="fr-model-scope__label">{label}</div>
    <output className="fr-model-scope__value" aria-label={label} aria-live="off">{value}</output></div>;
}

export interface AdministrativeProcedureFieldsProps {
  readonly catalog: AdministrativeProcedureCatalog;
  readonly lawId: string;
  readonly locale: Locale;
  readonly value: AdministrativeUiState;
  readonly onChange: (state: AdministrativeUiState) => void;
  readonly errors?: Readonly<Record<string, string | undefined>>;
}

/** Fragment belongs directly inside the existing two-column form grid. */
export function AdministrativeProcedureFields({ catalog, lawId, locale, value, onChange, errors = {} }: AdministrativeProcedureFieldsProps): React.ReactElement {
  const text = (key: string): string => administrativeText(locale, key);
  const state = settleAdministrativeUiState(catalog, lawId, value);
  const { stages, paths, path } = administrativeChoices(catalog, lawId, state);
  const error = (key: string): string => errors[key] ? text(errors[key]!) : '';
  const stageLabel = text('stage');
  const actionLabel = text('action');
  return <>
    {stages.length === 1
      ? <FixedValue label={stageLabel} value={text(`stage.${stages[0]}`)} />
      : <Dropdown styles={calculatorDropdownStyles} required label={stageLabel} selectedKey={state.stage}
          options={[{ key: '', text: text('choose') }, ...stages.map(stage => ({ key: stage, text: text(`stage.${stage}`) }))]}
          errorMessage={error('stage')} onChange={(_event, option) => {
            if (typeof option?.key === 'string') onChange(changeAdministrativeSelection(catalog, lawId, state, 'stage', option.key));
          }} />}
    {paths.length === 1
      ? <FixedValue label={actionLabel} value={text(`action.${paths[0]!.action}`)} />
      : <Dropdown styles={calculatorDropdownStyles} required label={actionLabel} selectedKey={state.pathId} disabled={!state.stage}
          options={[{ key: '', text: text('choose') }, ...paths.map(item => ({ key: item.pathId, text: text(`action.${item.action}`) }))]}
          errorMessage={error('pathId')} onChange={(_event, option) => {
            if (typeof option?.key === 'string') onChange(changeAdministrativeSelection(catalog, lawId, state, 'pathId', option.key));
          }} />}
    <Dropdown styles={calculatorDropdownStyles} required label={text('qualification')} selectedKey={state.qualification}
      title={text('scope')} aria-describedby="fr-administrative-scope" disabled={!path} errorMessage={error('qualification')}
      options={[{ key: '', text: text('choose') }, { key: 'generalActualReceipt', text: text('generalActualReceipt') },
        { key: 'specialOrDeviating', text: text('specialOrDeviating') }, { key: 'unknown', text: text('unknown') }]}
      onChange={(_event, option) => {
        if (option?.key === '' || option?.key === 'generalActualReceipt' || option?.key === 'specialOrDeviating' || option?.key === 'unknown') {
          onChange({ ...state, qualification: option.key });
        }
      }} />
    {path?.urgencyPolicy === 'explicitGRJudicialUrgencyOrder' && state.stage === 'court'
      ? <Dropdown styles={calculatorDropdownStyles} required label={text('urgency')} selectedKey={state.urgency} errorMessage={error('urgency')}
          options={[{ key: '', text: text('choose') }, { key: 'none', text: text('urgencyNone') },
            { key: 'explicitJudicialUrgencyOrder', text: text('urgencyOrdered') }, { key: 'unknown', text: text('unknown') }]}
          onChange={(_event, option) => {
            if (option?.key === '' || option?.key === 'none' || option?.key === 'explicitJudicialUrgencyOrder' || option?.key === 'unknown') {
              onChange({ ...state, urgency: option.key });
            }
          }} />
      : null}
  </>;
}

export function AdministrativeAutomaticParameters({ catalog, lawId, state, locale }: {
  readonly catalog: AdministrativeProcedureCatalog; readonly lawId: string; readonly state: AdministrativeUiState; readonly locale: Locale;
}): React.ReactElement {
  const text = (key: string): string => administrativeText(locale, key);
  const { path } = administrativeChoices(catalog, lawId, state);
  const binding = catalog.holidayBindings.find(value => value.holidayBindingId === path?.holidayBindingId);
  const suspension = catalog.suspensionProfiles.find(value => value.suspensionProfileId === path?.suspensionProfileId);
  const unresolvedUrgency = path?.urgencyPolicy === 'explicitGRJudicialUrgencyOrder' && state.stage === 'court'
    && state.urgency !== 'none' && state.urgency !== 'explicitJudicialUrgencyOrder';
  const suspensionText = unresolvedUrgency || !path ? text('unresolved') : state.urgency === 'explicitJudicialUrgencyOrder'
    && path.urgencyPolicy === 'explicitGRJudicialUrgencyOrder' ? text('urgentSuspension')
    : suspension?.periods.length ? text('threePeriods') : text('noSuspension');
  return <><dl className="fr-automatic__grid">
    <div><dt>{text('holiday')}</dt><dd>{binding ? `${binding.authoritySeatCanton} · ${text('authority')}` : text('unresolved')}</dd></div>
    <div><dt>{text('suspension')}</dt><dd>{suspensionText}</dd></div>
  </dl><details className="fr-trace"><summary>{text('scopeHeading')}</summary><p id="fr-administrative-scope">{text('scope')}</p></details></>;
}

function date(value: string): string { return value.split('-').reverse().join('.'); }

/** These are display names, not legal qualification rules or a source-ID prefix heuristic. */
const administrativeSourceNames: Readonly<Record<string, { readonly de: string; readonly fr: string }>> = {
  'SRC-AP23B-TI-HOL': { de: 'Gesetz über die offiziellen Feiertage TI', fr: 'Loi sur les jours fériés officiels TI' },
  'SRC-AP23B-GR-RTG': { de: 'Gesetz über die öffentlichen Ruhetage GR', fr: 'Loi sur les jours de repos publics GR' },
  'SRC-AP23B-CH-HOL': { de: 'Bundesgesetz über den Bundesfeiertag', fr: 'Loi fédérale sur la fête nationale' }
};
const administrativePeriodNames: Readonly<Record<string, string>> = {
  'ti-easter': 'period.easter', 'gr-easter': 'period.easter',
  'ti-summer': 'period.summer', 'gr-summer': 'period.summer',
  'ti-winter': 'period.winter', 'gr-winter': 'period.winter'
};

function AdministrativeNorms({ refs, catalog, locale }: {
  readonly refs: readonly AdministrativeSourceRef[]; readonly catalog: AdministrativeProcedureCatalog; readonly locale: Locale;
}): React.ReactElement | null {
  const statutes = refs.filter((ref, index) => refs.findIndex(other => other.sourceId === ref.sourceId && other.locator === ref.locator) === index)
    .flatMap(ref => {
      const source = catalog.sources.find(value => value.sourceId === ref.sourceId && value.kind === 'statute');
      if (!source || !/^https:\/\//.test(source.url)) return [];
      const law = catalog.laws.find(value => value.sourceRefs.some(item => item.sourceId === ref.sourceId));
      const name = law ? administrativeText(locale, `law.${law.lawId}`) : administrativeSourceNames[ref.sourceId]?.[locale];
      return name ? [{ ref, source, name, title: law?.title ?? name }] : [];
    });
  return statutes.length ? <p className="fr-trace__sources">{administrativeText(locale, 'legalBasis')}: {statutes.map(({ ref, source, name, title }, index) =>
    <React.Fragment key={`${ref.sourceId}:${ref.locator}`}>{index ? ' · ' : ''}<a href={source.url} title={title}
      target="_blank" rel="noopener noreferrer">{name}: {ref.locator}</a></React.Fragment>)}</p> : null;
}

/** Resolve only the exact result bindings. This is presentation of an existing result, never another deadline calculation. */
function administrativeTracePresentation(result: AdministrativeDeadlineResult, input: AdministrativeDeadlineInput,
  context: unknown, catalog: AdministrativeProcedureCatalog, locale: Locale) {
  const data = getVerifiedAdministrativeData(context);
  const provenance = result.provenance;
  if (!data || data.catalog !== catalog || !provenance || provenance.releaseId !== data.releaseId) return undefined;
  const path = catalog.paths.find(value => value.pathId === provenance.pathId && value.revision === provenance.revision && value.lawId === provenance.lawId);
  const binding = catalog.holidayBindings.find(value => value.holidayBindingId === provenance.holidayBindingId && value.lawId === provenance.lawId);
  const suspension = catalog.suspensionProfiles.find(value => value.suspensionProfileId === provenance.suspensionProfileId && value.lawId === provenance.lawId);
  if (!path || !binding || !suspension || path.holidayBindingId !== binding.holidayBindingId || path.suspensionProfileId !== suspension.suspensionProfileId
    || binding.physicalBaseline.calendarId !== provenance.calendarId || binding.physicalBaseline.projectionId !== provenance.projectionId) return undefined;
  const periodIds = result.outcome === 'calculated' ? result.encounteredPeriodIds : result.periodIds ?? [];
  const rangeEnd = result.outcome === 'calculated' ? result.finalEnd : result.blockedDate ?? result.provisionalEnd ?? input.inputDate;
  const firstDate = parseIsoDate(input.inputDate);
  const lastDate = parseIsoDate(rangeEnd);
  if (!firstDate || !lastDate || firstDate.ordinal > lastDate.ordinal) return undefined;
  // Materialise the bound profile for the actual case interval. IDs are opaque
  // join keys only, never an alternate source for a date or an inferred year.
  const materializedPeriods = new Map<string, { id: string; name: string; from: string; to: string }>();
  for (let year = Math.max(1, firstDate.year - 1); year <= lastDate.year + 1; year += 1) {
    for (const period of suspension.periods) {
      const nameKey = administrativePeriodNames[period.periodId];
      if (!nameKey) continue;
      const from = administrativePeriodDate(period.start, year);
      const to = administrativePeriodDate(period.end, year);
      if (from > rangeEnd || to < input.inputDate) continue;
      const id = `${period.periodId}-${year}`;
      materializedPeriods.set(id, { id, name: administrativeText(locale, nameKey), from, to });
    }
  }
  const periods = periodIds.flatMap(id => {
    const period = materializedPeriods.get(id);
    return period ? [period] : [];
  });
  const holidays: { id: string; name: string; date: string }[] = [];
  const shiftedIds = result.shiftedHolidayIds ?? [];
  const from = result.provisionalEnd;
  const to = result.outcome === 'calculated' ? result.finalEnd : result.blockedDate;
  if (shiftedIds.length && from && to) {
    try {
      const generated = generateCalendarFromRules(data.calendars, binding.physicalBaseline.calendarId, { from, to });
      for (const id of shiftedIds) {
        const holiday = generated.calendar.holidays.find(value => value.holidayId === id);
        const application = generated.trace.find(value => value.generatedIds.includes(id));
        const rule = application && data.calendars.find(value => value.calendarId === application.calendarId)?.rules.find(value => value.ruleId === application.ruleId);
        if (!holiday || !rule) continue;
        const replacement = rule.effect.type === 'explicitDateOverride' ? rule.effect.replacementHoliday : undefined;
        const labels = replacement?.labelKey === holiday.labelKey ? replacement.labels : rule.labelKey === holiday.labelKey ? rule.labels : undefined;
        if (labels) holidays.push({ id, name: labels[locale], date: holiday.date });
      }
    } catch { /* A missing presentation detail never changes the existing calculation or fabricates a name. */ }
  }
  const law = catalog.laws.find(value => value.lawId === path.lawId);
  const pathNorms = path.sourceRefs.filter(ref => law?.sourceRefs.some(value => value.sourceId === ref.sourceId));
  return { path, binding, suspension, periods, holidays, pathNorms,
    periodsUnresolved: periods.length !== periodIds.length,
    unresolvedNames: periods.length !== periodIds.length || holidays.length !== shiftedIds.length };
}

export interface AdministrativeResultViewProps {
  readonly result: AdministrativeDeadlineResult;
  readonly input: AdministrativeDeadlineInput;
  readonly context: unknown;
  readonly catalog: AdministrativeProcedureCatalog;
  readonly locale: Locale;
  readonly calendarReference: string;
  readonly onCalendarReferenceChange: (value: string) => void;
  readonly onExport?: () => void;
}
export function AdministrativeResultView({ result, input, context, catalog, locale, calendarReference, onCalendarReferenceChange, onExport }: AdministrativeResultViewProps): React.ReactElement {
  const text = (key: string): string => administrativeText(locale, key);
  const calculated = result.outcome === 'calculated';
  const provenance = result.provenance;
  const presentation = React.useMemo(() => administrativeTracePresentation(result, input, context, catalog, locale), [result, input, context, catalog, locale]);
  const exportAvailable = administrativeExportAvailable(input, context, result);
  return <section className="fr-result" aria-labelledby="fr-administrative-result-heading">
    <h2 id="fr-administrative-result-heading">{text(calculated && result.referenceOnly ? 'referenceResult' : 'result')}</h2>
    <MessageBar messageBarType={calculated ? MessageBarType.success : MessageBarType.blocked}>{text(calculated ? 'calculated' : 'blocked')}</MessageBar>
    {calculated && <dl className="fr-result__grid">
      <div className="fr-result__hero"><dt>{text('finalEnd')}</dt><dd><strong>{date(result.finalEnd)}</strong></dd></div>
      <div><dt>{text('provisionalEnd')}</dt><dd>{date(result.provisionalEnd)}</dd></div>
      <div><dt>{text('deadlineStart')}</dt><dd>{date(result.deadlineStart)}</dd></div>
      <div><dt>{text('skipped')}</dt><dd>{result.skippedCalendarDays}</dd></div>
      <div><dt>{text('days')}</dt><dd>{result.deadlineDays}</dd></div>
      {exportAvailable && onExport ? <div className="fr-calendar-export"><dt className="fr-calendar-export__action"><PrimaryButton type="button" className="fr-calendar-export__button" iconProps={{ iconName: 'Calendar' }} text={text('export')} onClick={onExport} /></dt>
        <dd><TextField label={text('reference')} placeholder={translate(locale, 'calendar.reference.placeholder')} value={calendarReference} maxLength={200}
          onChange={(_event, value) => onCalendarReferenceChange(value ?? '')} /><p className="fr-calendar-export__privacy">{translate(locale, 'calendar.privacy')}</p></dd></div>
        : <div><dt>{text(result.referenceOnly ? 'noExport' : 'exportUnavailable')}</dt></div>}
    </dl>}
    {!calculated && <div className="fr-result__messages"><ul>{result.blockReasonKeys.map(key => <li key={key}>{text(key)}</li>)}</ul></div>}
    <details className="fr-trace" open={!calculated}><summary>{text('trace')}</summary>
      <div data-testid="administrative-readable-trace">
      <dl>
        <div><dt>{text('received')}</dt><dd>{date(input.inputDate)}</dd></div>
        {calculated && <><div><dt>{text('ordinaryStart')}</dt><dd>{date(result.ordinaryStart)} · {text('nextDay')}</dd></div>
          {result.startShiftApplied && <div><dt>{text('deadlineStart')}</dt><dd>{date(result.deadlineStart)} · {text('afterSuspension')}</dd></div>}
          <div><dt>{text('days')}</dt><dd>{result.deadlineDays}</dd></div>
          <div><dt>{text('provisionalEnd')}</dt><dd>{date(result.provisionalEnd)}</dd></div></>}
        {!calculated && result.provisionalEnd && <div><dt>{text('provisionalEnd')}</dt><dd>{date(result.provisionalEnd)}</dd></div>}
        {!calculated && result.blockedDate && <div><dt>{text('blockedAt')}</dt><dd>{date(result.blockedDate)}</dd></div>}
        <div><dt>{text('shifts')}</dt><dd>{calculated && result.finalEnd !== result.provisionalEnd
          ? `${date(result.provisionalEnd)} → ${date(result.finalEnd)} · ` : ''}{result.shiftReasonKeys?.map(text).join(' · ') || text('none')}</dd></div>
      </dl>
      {presentation && <>
        <AdministrativeNorms refs={presentation.pathNorms} catalog={catalog} locale={locale} />
        <h4>{text('periods')}</h4>
        {presentation.periods.length ? <ul>{presentation.periods.map(period => <li key={period.id}>{period.name}: {date(period.from)}–{date(period.to)} ({text('inclusive')})</li>)}</ul>
          : <p>{presentation.periodsUnresolved ? text('traceDetailsUnavailable') : provenance?.urgencyApplied ? text('urgentSuspension')
            : presentation.suspension.periods.length ? text('noEncounteredSuspension') : text('noSuspension')}</p>}
        {calculated && result.skippedCalendarDays > 0 && <p>{text('notCounted')}: {result.skippedCalendarDays}</p>}
        <AdministrativeNorms refs={provenance?.urgencyApplied || !presentation.suspension.periods.length
          ? presentation.pathNorms : presentation.suspension.sourceRefs} catalog={catalog} locale={locale} />
        <h4>{text('holiday')}</h4><p>{calendarCantonLabel(presentation.binding.authoritySeatCanton, locale)} · {text('authority')}</p>
        {presentation.holidays.length > 0 && <ul>{presentation.holidays.map(holiday => <li key={holiday.id}>{holiday.name}: {date(holiday.date)}</li>)}</ul>}
        <AdministrativeNorms refs={presentation.binding.legalBinding.sourceRefs} catalog={catalog} locale={locale} />
      </>}
      {(!presentation || presentation.unresolvedNames) && <p>{text('traceDetailsUnavailable')}</p>}
      <h4>{text('scopeHeading')}</h4><p>{text('scope')}</p>
      </div>
      <div data-testid="administrative-technical-evidence"><TechnicalTraceDetails locale={locale}>
      <dl>
        {calculated && <div><dt>{text('counted')}</dt><dd>{result.countedDates.map(date).join(' · ')}</dd></div>}
        <div><dt>{text('periods')}</dt><dd>{(calculated ? result.encounteredPeriodIds : result.periodIds ?? []).join(' · ') || text('none')}</dd></div>
        <div><dt>{text('shiftHolidays')}</dt><dd>{result.shiftedHolidayIds?.join(' · ') || text('none')}</dd></div>
      </dl>
      {provenance && <><h4>{text('provenance')}</h4><dl>
        <div><dt>{text('path')}</dt><dd>{text(`law.${provenance.lawId}`)} · {provenance.pathId} · r{provenance.revision} · {text(`stage.${provenance.stage}`)}</dd></div>
        <div><dt>{text('holidayBinding')}</dt><dd>{provenance.authoritySeatCanton} · {provenance.holidayBindingId} · {provenance.calendarId}</dd></div>
        <div><dt>{text('release')}</dt><dd>{provenance.releaseId}</dd></div>
      </dl><p>{provenance.sourceRefs.map((ref, index) => {
        const source = catalog.sources.find(value => value.sourceId === ref.sourceId);
        const safeUrl = source && /^https:\/\//.test(source.url) ? source.url : undefined;
        return <React.Fragment key={`${ref.sourceId}:${ref.locator}`}>{index ? ' · ' : ''}{safeUrl
          ? <a href={safeUrl} target="_blank" rel="noopener noreferrer">{ref.locator}</a> : ref.locator}</React.Fragment>;
      })}</p><pre>{JSON.stringify({ result, pathEligibility: catalog.releaseBinding.pathEligibility.find(value => value.pathId === provenance.pathId && value.pathRevision === provenance.revision),
        physicalBaseline: presentation?.binding.physicalBaseline }, null, 2)}</pre></>}
      </TechnicalTraceDetails></div>
    </details>
  </section>;
}
