// SPDX-License-Identifier: AGPL-3.0-only

import * as React from 'react';
import {
  Checkbox,
  DefaultButton,
  Dropdown,
  type IDropdownOption,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  TextField
} from '@fluentui/react';

import { calculateDeadline } from '../core';
import type { CalculationData, CalculationResult, LegalProfile, TraceStep } from '../core';
import {
  clearDefaults,
  initialDefaults,
  loadDefaults,
  saveDefaults,
  type StorageLike,
  type StoredDefaults
} from './defaults';
import { translate, translateBlockReason, translateReason, type Locale } from './i18n';
import {
  automaticCalendarId,
  authorityOptions,
  createCalculationInput,
  defaultSelectors,
  inputDateSemantics,
  isCalendarOverride,
  profilesForAuthority,
  reconcileProfileId,
  requiresDeliveryFictionConfirmation,
  requiresSpecialLawConfirmation,
  suspensionPresentation,
  type CalculatorFormState
} from './model';

export interface FristenrechnerAppProps {
  readonly data: CalculationData;
  readonly storage?: StorageLike;
  readonly initialState?: Partial<CalculatorFormState>;
}

interface UiValidation {
  readonly inputDate?: string;
  readonly deadlineDays?: string;
  readonly overrideReason?: string;
  readonly additionalHolidayAnchor?: string;
}

type Notification = { readonly type: MessageBarType; readonly text: string };

function browserStorage(): StorageLike | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function stateFromDefaults(
  defaults: StoredDefaults,
  initialState?: Partial<CalculatorFormState>
): CalculatorFormState {
  const base: CalculatorFormState = {
    authorityCode: defaults.authorityCode,
    profileId: defaults.profileId,
    inputDate: '',
    deadlineDays: String(defaults.deadlineDays),
    selectors: defaults.selectors,
    calendarId: defaults.calendarId,
    calendarOverrideReason: '',
    additionalHolidayAnchor: '',
    holidayAnchorConfirmed: false,
    deliveryFictionConfirmed: false,
    specialLawChecked: false
  };
  return {
    ...base,
    ...initialState,
    selectors: initialState?.selectors ?? base.selectors
  };
}

function formatIsoDate(value: string, locale: Locale): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return value;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-CH' : 'fr-CH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC'
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function profileLabel(profile: LegalProfile, locale: Locale): string {
  const translated = translate(locale, `profile.${profile.profileId}`);
  return translated === `profile.${profile.profileId}` ? profile.lawCode : translated;
}

function dateInputLabel(locale: Locale, state: CalculatorFormState): string {
  const semantics = inputDateSemantics(state.selectors);
  if (semantics === 'failedDeliveryAttemptDate') {
    return translate(locale, 'form.inputDate.failedAttempt');
  }
  if (semantics === 'observedOrdinaryMailDeliveryDate') {
    return translate(locale, 'form.inputDate.observedMail');
  }
  return translate(locale, 'form.inputDate.direct');
}

function Trace({ step, locale }: { readonly step: TraceStep; readonly locale: Locale }): React.ReactElement {
  return (
    <li className="fr-trace__item">
      <div className="fr-trace__number" aria-hidden="true">{step.sequence}</div>
      <div>
        <h4>{translate(locale, `trace.${step.operation}`)}</h4>
        {(step.inputDate || step.outputDate) && (
          <p className="fr-trace__dates">
            {step.inputDate ? formatIsoDate(step.inputDate, locale) : '–'}
            {step.outputDate ? ` → ${formatIsoDate(step.outputDate, locale)}` : ''}
          </p>
        )}
        {step.reasonKeys.length > 0 && (
          <p>{step.reasonKeys.map(key => translateReason(locale, key)).join(' · ')}</p>
        )}
        {step.deadlineDays !== undefined && (
          <p>{translate(locale, 'trace.deadlineDays')}: {step.deadlineDays}</p>
        )}
        {step.skippedCalendarDays !== undefined && (
          <p>{translate(locale, 'trace.skippedCalendarDays')}: {step.skippedCalendarDays}</p>
        )}
        {step.periodIds && step.periodIds.length > 0 && (
          <p>{translate(locale, 'trace.periods')}: {step.periodIds.join(', ')}</p>
        )}
        {step.ruleIds.length > 0 && (
          <p className="fr-trace__rules">
            {translate(locale, 'trace.rules')}: {step.ruleIds.join(', ')}
          </p>
        )}
      </div>
    </li>
  );
}

function ResultPanel({ result, locale }: {
  readonly result: CalculationResult;
  readonly locale: Locale;
}): React.ReactElement {
  return (
    <section className="fr-result" aria-labelledby="fr-result-heading">
      <h2 id="fr-result-heading">{translate(locale, 'result.heading')}</h2>
      <MessageBar messageBarType={result.outcome === 'calculated' ? MessageBarType.success : MessageBarType.blocked}>
        {translate(locale, result.outcome === 'calculated' ? 'result.calculated' : 'result.blocked')}
      </MessageBar>

      {result.outcome === 'calculated' && (
        <>
          <div className="fr-result__hero">
            <span>{translate(locale, 'result.finalEnd')}</span>
            <strong>{formatIsoDate(result.finalEnd, locale)}</strong>
          </div>
          <dl className="fr-result__grid">
            <div>
              <dt>{translate(locale, 'result.legallyRelevantDate')}</dt>
              <dd>{formatIsoDate(result.legallyRelevantDate, locale)}</dd>
            </div>
            <div>
              <dt>{translate(locale, 'result.deadlineStart')}</dt>
              <dd>{formatIsoDate(result.deadlineStart, locale)}</dd>
            </div>
            <div>
              <dt>{translate(locale, 'result.provisionalEnd')}</dt>
              <dd>{formatIsoDate(result.provisionalEnd, locale)}</dd>
            </div>
            <div>
              <dt>{translate(locale, 'result.suspensionDays')}</dt>
              <dd>{result.suspension.skippedCalendarDays}</dd>
            </div>
            <div>
              <dt>{translate(locale, 'result.shifted')}</dt>
              <dd>{translate(locale, result.endShift.applied ? 'result.yes' : 'result.no')}</dd>
            </div>
          </dl>
        </>
      )}

      {result.blockReasonKeys.length > 0 && (
        <div className="fr-result__messages">
          <h3>{translate(locale, 'result.blocks')}</h3>
          <ul>{result.blockReasonKeys.map(key => <li key={key}>{translateBlockReason(locale, key)}</li>)}</ul>
        </div>
      )}
      {result.warningKeys.length > 0 && (
        <div className="fr-result__messages">
          <h3>{translate(locale, 'result.warnings')}</h3>
          <ul>{result.warningKeys.map(key => <li key={key}>{translate(locale, key)}</li>)}</ul>
        </div>
      )}

      <details className="fr-trace" open={result.outcome === 'blocked'}>
        <summary>{translate(locale, 'trace.heading')}</summary>
        <ol>{result.trace.map(step => <Trace key={step.sequence} step={step} locale={locale} />)}</ol>
      </details>
    </section>
  );
}

function ValidationPanel({ validation, locale }: {
  readonly validation: UiValidation;
  readonly locale: Locale;
}): React.ReactElement {
  return (
    <section className="fr-result fr-result--validation" aria-labelledby="fr-validation-heading">
      <h2 id="fr-validation-heading">{translate(locale, 'result.heading')}</h2>
      <MessageBar messageBarType={MessageBarType.error}>
        {translate(locale, 'validation.blocked')}
      </MessageBar>
      <div className="fr-result__messages">
        <ul>
          {Object.entries(validation).map(([field, message]) => <li key={field}>{message}</li>)}
        </ul>
      </div>
    </section>
  );
}

export function FristenrechnerApp({
  data,
  storage: explicitStorage,
  initialState
}: FristenrechnerAppProps): React.ReactElement {
  const storage = explicitStorage ?? browserStorage();
  const loaded = React.useMemo(() => loadDefaults(data, storage), [data, storage]);
  const initialForm = React.useMemo(() => stateFromDefaults(loaded, initialState), [loaded, initialState]);
  const [locale, setLocale] = React.useState<Locale>(loaded.locale);
  const [form, setForm] = React.useState<CalculatorFormState>(initialForm);
  const [calendarOverrideEnabled, setCalendarOverrideEnabled] = React.useState(
    () => isCalendarOverride(data, data.profiles.get(initialForm.profileId), initialForm.calendarId)
  );
  const [result, setResult] = React.useState<CalculationResult>();
  const [validation, setValidation] = React.useState<UiValidation>({});
  const [notification, setNotification] = React.useState<Notification>();

  const profile = data.profiles.get(form.profileId);
  const availableProfiles = profilesForAuthority(data, form.authorityCode);
  const automaticCalendar = automaticCalendarId(data, profile);
  const fixedCalendar = profile?.calendarPolicy.jurisdictionSelection === 'fixedBern';
  const manualOverride = isCalendarOverride(data, profile, form.calendarId);
  const suspension = suspensionPresentation(profile, form.selectors);
  const additionalAnchor = form.additionalHolidayAnchor.trim().toUpperCase();
  const hasAnchorConflict = /^(CH|[A-Z]{2})$/.test(additionalAnchor)
    && additionalAnchor !== data.calendars.get(form.calendarId)?.jurisdiction.code;
  const hasValidationErrors = Object.keys(validation).length > 0;

  const mutateForm = (change: Partial<CalculatorFormState>): void => {
    setForm(current => ({ ...current, ...change }));
    setResult(undefined);
    setValidation({});
  };

  const selectOptions = (definition: NonNullable<typeof profile>['selectors'][number]): IDropdownOption[] => [
    ...(definition.required ? [{ key: '', text: translate(locale, 'form.select') }] : []),
    ...definition.options.map(option => ({ key: option.value, text: translate(locale, option.labelKey) }))
  ];

  const validate = (): UiValidation => {
    const errors: {
      inputDate?: string;
      deadlineDays?: string;
      overrideReason?: string;
      additionalHolidayAnchor?: string;
    } = {};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.inputDate)) {
      errors.inputDate = translate(locale, 'form.inputDate.required');
    }
    const days = Number(form.deadlineDays);
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      errors.deadlineDays = translate(locale, 'form.deadlineDays.required');
    }
    if (manualOverride && form.calendarOverrideReason.trim().length < 3) {
      errors.overrideReason = translate(locale, 'override.reason.required');
    }
    if (additionalAnchor && !/^(CH|[A-Z]{2})$/.test(additionalAnchor)) {
      errors.additionalHolidayAnchor = translate(locale, 'anchor.additional.invalid');
    }
    return errors;
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const errors = validate();
    setValidation(errors);
    setNotification(undefined);
    if (Object.keys(errors).length > 0) {
      setResult(undefined);
      return;
    }
    setResult(calculateDeadline(createCalculationInput(data, form), data));
  };

  const onAuthorityChange = (_event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
    if (typeof option?.key !== 'string') {
      return;
    }
    const profileId = reconcileProfileId(data, option.key, form.profileId);
    const nextProfile = data.profiles.get(profileId);
    mutateForm({
      authorityCode: option.key,
      profileId,
      selectors: defaultSelectors(nextProfile),
      calendarId: automaticCalendarId(data, nextProfile),
      calendarOverrideReason: '',
      deliveryFictionConfirmed: false,
      specialLawChecked: false
    });
    setCalendarOverrideEnabled(false);
  };

  const onProfileChange = (_event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
    if (typeof option?.key !== 'string') {
      return;
    }
    const nextProfile = data.profiles.get(option.key);
    mutateForm({
      profileId: option.key,
      selectors: defaultSelectors(nextProfile),
      calendarId: automaticCalendarId(data, nextProfile),
      calendarOverrideReason: '',
      deliveryFictionConfirmed: false,
      specialLawChecked: false
    });
    setCalendarOverrideEnabled(false);
  };

  const onSelectorChange = (selectorId: string, option?: IDropdownOption): void => {
    if (typeof option?.key !== 'string') {
      return;
    }
    mutateForm({
      selectors: { ...form.selectors, [selectorId]: option.key },
      deliveryFictionConfirmed: selectorId === 'deliveryMethod' ? false : form.deliveryFictionConfirmed,
      specialLawChecked: selectorId === 'specialLawStatus' ? false : form.specialLawChecked
    });
  };

  const onSaveDefaults = (): void => {
    const defaults: StoredDefaults = {
      version: 1,
      locale,
      authorityCode: form.authorityCode,
      profileId: form.profileId,
      deadlineDays: Number.isInteger(Number(form.deadlineDays)) ? Number(form.deadlineDays) : 10,
      selectors: form.selectors,
      calendarId: form.calendarId
    };
    const saved = saveDefaults(storage, defaults);
    setNotification({
      type: saved ? MessageBarType.success : MessageBarType.error,
      text: translate(locale, saved ? 'defaults.saved' : 'defaults.saveFailed')
    });
  };

  const onResetDefaults = (): void => {
    const removed = clearDefaults(storage);
    const defaults = initialDefaults(data);
    setLocale(defaults.locale);
    setForm(stateFromDefaults(defaults));
    setCalendarOverrideEnabled(false);
    setResult(undefined);
    setValidation({});
    setNotification({
      type: removed ? MessageBarType.success : MessageBarType.error,
      text: translate(defaults.locale, removed ? 'defaults.reset' : 'defaults.resetFailed')
    });
  };

  return (
    <main className="fr-app">
      <header className="fr-header">
        <div>
          <div className="fr-badge">{translate(locale, 'app.badge')}</div>
          <h1>{translate(locale, 'app.title')}</h1>
          <p>{translate(locale, 'app.intro')}</p>
        </div>
        <Dropdown
          ariaLabel={translate(locale, 'language.label')}
          className="fr-language"
          label={translate(locale, 'language.label')}
          options={[
            { key: 'de', text: translate(locale, 'language.de') },
            { key: 'fr', text: translate(locale, 'language.fr') }
          ]}
          selectedKey={locale}
          onChange={(_event, option) => {
            if (option?.key === 'de' || option?.key === 'fr') {
              setLocale(option.key);
              setNotification(undefined);
            }
          }}
        />
      </header>

      <MessageBar className="fr-disclaimer" messageBarType={MessageBarType.warning}>
        {translate(locale, 'app.disclaimer')}
      </MessageBar>

      <form className="fr-form" onSubmit={onSubmit} noValidate>
        <section aria-labelledby="fr-form-heading">
          <h2 id="fr-form-heading">{translate(locale, 'form.heading')}</h2>
          <div className="fr-form__grid">
            <TextField
              required
              label={dateInputLabel(locale, form)}
              type="date"
              value={form.inputDate}
              {...(validation.inputDate ? { errorMessage: validation.inputDate } : {})}
              onChange={(_event, value) => mutateForm({ inputDate: value ?? '' })}
            />
            <TextField
              required
              label={translate(locale, 'form.deadlineDays')}
              type="number"
              min={1}
              max={365}
              step={1}
              value={form.deadlineDays}
              {...(validation.deadlineDays ? { errorMessage: validation.deadlineDays } : {})}
              onChange={(_event, value) => mutateForm({ deadlineDays: value ?? '' })}
            />
            <Dropdown
              required
              label={translate(locale, 'form.authority')}
              options={authorityOptions(data).map(option => ({
                key: option.code,
                text: translate(locale, `authority.${option.code}`)
              }))}
              selectedKey={form.authorityCode}
              onChange={onAuthorityChange}
            />
            <Dropdown
              required
              label={translate(locale, 'form.profile')}
              options={availableProfiles.map(item => ({ key: item.profileId, text: profileLabel(item, locale) }))}
              selectedKey={form.profileId}
              onChange={onProfileChange}
            />
          </div>

          {profile && profile.selectors.length > 0 && (
            <div className="fr-form__grid fr-form__grid--selectors">
              {profile.selectors.map(definition => (
                <Dropdown
                  key={definition.selectorId}
                  required={definition.required}
                  label={translate(locale, `selector.${definition.selectorId}`)}
                  options={selectOptions(definition)}
                  selectedKey={form.selectors[definition.selectorId] ?? ''}
                  onChange={(_event, option) => onSelectorChange(definition.selectorId, option)}
                />
              ))}
            </div>
          )}

          {requiresDeliveryFictionConfirmation(form.selectors) && (
            <Checkbox
              className="fr-confirmation"
              label={translate(locale, 'confirmation.delivery')}
              checked={form.deliveryFictionConfirmed}
              onChange={(_event, checked) => mutateForm({ deliveryFictionConfirmed: Boolean(checked) })}
            />
          )}
          {requiresSpecialLawConfirmation(form.selectors) && (
            <Checkbox
              className="fr-confirmation"
              label={translate(locale, 'confirmation.specialLaw')}
              checked={form.specialLawChecked}
              onChange={(_event, checked) => mutateForm({ specialLawChecked: Boolean(checked) })}
            />
          )}
        </section>

        <div className="fr-actions">
          <PrimaryButton type="submit">{translate(locale, 'form.calculate')}</PrimaryButton>
          <DefaultButton
            type="button"
            onClick={() => {
              setResult(undefined);
              setValidation({});
            }}
          >
            {translate(locale, 'form.clearResult')}
          </DefaultButton>
          <DefaultButton type="button" onClick={onSaveDefaults}>
            {translate(locale, 'form.saveDefaults')}
          </DefaultButton>
          <DefaultButton type="button" onClick={onResetDefaults}>
            {translate(locale, 'form.resetDefaults')}
          </DefaultButton>
        </div>

        {notification && (
          <MessageBar
            className="fr-notification"
            messageBarType={notification.type}
            onDismiss={() => setNotification(undefined)}
          >
            {notification.text}
          </MessageBar>
        )}

        <div className="fr-result-region" aria-live="polite">
          {hasValidationErrors
            ? <ValidationPanel validation={validation} locale={locale} />
            : result && <ResultPanel result={result} locale={locale} />}
        </div>

        <section className="fr-automatic" aria-labelledby="fr-automatic-heading">
          <h2 id="fr-automatic-heading">{translate(locale, 'automatic.heading')}</h2>
          <dl className="fr-automatic__grid">
            <div>
              <dt>{translate(locale, 'automatic.calendar')}</dt>
              <dd>
                <strong>{translate(locale, `calendar.${form.calendarId}`)}</strong>
                <span className={`fr-status ${manualOverride ? 'fr-status--override' : ''}`}>
                  {translate(locale, manualOverride ? 'automatic.override' : 'automatic.status')}
                </span>
                <small>{translate(locale, fixedCalendar ? 'automatic.calendarReason.fixed' : 'automatic.calendarReason.pilot')}</small>
              </dd>
            </div>
            <div>
              <dt>{translate(locale, 'automatic.suspension')}</dt>
              <dd><strong>{translate(locale, `automatic.suspension.${suspension}`)}</strong></dd>
            </div>
          </dl>

          {!fixedCalendar && (
            <div className="fr-override">
              <Checkbox
                label={translate(locale, 'override.toggle')}
                checked={calendarOverrideEnabled}
                onChange={(_event, checked) => {
                  const enabled = Boolean(checked);
                  setCalendarOverrideEnabled(enabled);
                  if (!enabled) {
                    mutateForm({ calendarId: automaticCalendar, calendarOverrideReason: '' });
                  }
                }}
              />
              {calendarOverrideEnabled && (
                <div className="fr-form__grid fr-form__grid--override">
                  <Dropdown
                    label={translate(locale, 'automatic.calendar')}
                    options={[...data.calendars.values()].map(calendar => ({
                      key: calendar.calendarId,
                      text: translate(locale, `calendar.${calendar.calendarId}`)
                    }))}
                    selectedKey={form.calendarId}
                    onChange={(_event, option) => {
                      if (typeof option?.key === 'string') {
                        mutateForm({ calendarId: option.key });
                      }
                    }}
                  />
                  <TextField
                    required={manualOverride}
                    label={translate(locale, 'override.reason')}
                    value={form.calendarOverrideReason}
                    {...(validation.overrideReason ? { errorMessage: validation.overrideReason } : {})}
                    onChange={(_event, value) => mutateForm({ calendarOverrideReason: value ?? '' })}
                  />
                </div>
              )}
            </div>
          )}

          <details className="fr-anchor">
            <summary>{translate(locale, 'anchor.heading')}</summary>
            <TextField
              className="fr-anchor__field"
              label={translate(locale, 'anchor.additional')}
              placeholder={translate(locale, 'anchor.additional.placeholder')}
              description={translate(locale, 'anchor.additional.description')}
              maxLength={2}
              value={form.additionalHolidayAnchor}
              {...(validation.additionalHolidayAnchor
                ? { errorMessage: validation.additionalHolidayAnchor }
                : {})}
              onChange={(_event, value) => mutateForm({
                additionalHolidayAnchor: (value ?? '').toUpperCase(),
                holidayAnchorConfirmed: false
              })}
            />
            {hasAnchorConflict && (
              <Checkbox
                label={translate(locale, 'anchor.confirm')}
                checked={form.holidayAnchorConfirmed}
                onChange={(_event, checked) => mutateForm({ holidayAnchorConfirmed: Boolean(checked) })}
              />
            )}
          </details>
        </section>
      </form>

      <footer className="fr-data-status">
        <span>{translate(locale, 'dataStatus.label')}: <code>{data.releaseId}</code></span>
        <span aria-hidden="true">·</span>
        <span>
          {translate(locale, 'dataStatus.coverage')}: {formatIsoDate(data.coverage.from, locale)} – {formatIsoDate(data.coverage.to, locale)}
        </span>
      </footer>
    </main>
  );
}

export default FristenrechnerApp;
