// SPDX-License-Identifier: AGPL-3.0-only

import * as React from 'react';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Dropdown, type IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { TextField } from '@fluentui/react/lib/TextField';
import { DateInput } from './DateInput';
import { primaryDateField, reconcilePrimaryDate } from './dateTransition';
import { calculateSocialDeadline } from '../core/socialDeadline';
import type { SocialDeadlineResult } from '../core/socialTypes';
import {
  EMPTY_SOCIAL_CONTEXT, SOCIAL_CANTONS, hasSocialUi, socialInputFromUi,
  socialJurisdictionLabel, socialJurisdictionDateLabel, socialNeedsJurisdictionDate, socialNeedsPartyDomicile, socialUsesDomicileScope, socialScopeKey, socialUiPath, socialUiSelection,
  type SocialUiContext, type SocialUiSelection
} from './socialUi';

import { calculateDeadline, calculateSpecialDeadline, parseIsoDate } from '../core';
import type {
  CalculatedDeadlineDefinition,
  CalculationData,
  CalculationResult,
  CalendarTraceEvidence,
  DeadlineDefinition,
  FilingProfile,
  LegalProfile,
  SpecialDeadlineResult,
  SpecialRegime,
  SpecialTraceStep,
  TraceStep
} from '../core';
import {
  clearDefaults,
  initialDefaults,
  loadDefaults,
  saveDefaults,
  type StorageLike,
  type StoredDefaults
} from './defaults';
import {
  CALENDAR_EXPORT_CONTRACT,
  createDeadlineCalendarEntry,
  downloadDeadlineCalendarEntry
} from './calendarExport';
import { translate, translateBlockReason, translateReason, type Locale } from './i18n';
import {
  automaticCalendarId,
  authorityOptions,
  createCalculationInput,
  createSpecialCalculationInput,
  defaultSelectors,
  effectiveSelectors,
  GENERAL_SPECIAL_REGIME_ID,
  isCalendarOverride,
  isGeneralCalculation,
  profilesForAuthority,
  reconcileProfileId,
  reconcileSpecialSelection,
  requiresDeliveryFictionConfirmation,
  specialCatalogForProfile,
  specialSelection,
  suspensionPresentation,
  type CalculatorFormState
} from './model';
import {
  EMPTY_VRPG_SELECTION,
  changeVrpgSelection,
  resolveVrpgSelection,
  sanitizeVrpgSelection,
  selectionFromLegacy,
  vrpgAreaOptions,
  vrpgLawOptions,
  vrpgActionOptions,
  vrpgFixedAction,
  vrpgStageOptions,
  type VrpgChoice,
  type VrpgSelectionState
} from './vrpgSelection';
import {
  EMPTY_VRPG_CONTEXT,
  vrpgModelScope,
  vrpgNotificationOptions,
  vrpgHolidayOptions,
  qualifiedStage,
  type VrpgContextState
} from './vrpgQualification';

export interface FristenrechnerAppProps {
  readonly data: CalculationData;
  readonly storage?: StorageLike;
  readonly initialState?: Partial<CalculatorFormState>;
}

interface UiValidation {
  readonly [field: string]: string | undefined;
}

type UiResult =
  | { readonly kind: 'general'; readonly value: CalculationResult }
  | { readonly kind: 'special'; readonly value: SpecialDeadlineResult }
  | { readonly kind: 'social'; readonly value: SocialDeadlineResult };

type Notification = { readonly type: MessageBarType; readonly text: string };

function browserStorage(): StorageLike | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function stateFromDefaults(
  data: CalculationData,
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
    specialLawChecked: defaults.specialRegimeId === GENERAL_SPECIAL_REGIME_ID
      || defaults.selectors.specialLawStatus === 'noKnownOverride',
    specialRegimeId: defaults.specialRegimeId,
    specialDefinitionId: defaults.specialDefinitionId,
    vrpgSelection: defaults.vrpgSelection,
    vrpgContext: EMPTY_VRPG_CONTEXT,
    specialDateValues: {},
    specialLocalTimeValues: {},
    specialIntegerValues: {},
    specialOverrideConfirmations: []
  };
  const merged = {
    ...base,
    ...initialState,
    selectors: initialState?.selectors ?? base.selectors
  };
  const vrpgSelection = merged.profileId !== 'vrpg-be'
    ? EMPTY_VRPG_SELECTION
    : initialState?.vrpgSelection
      ? sanitizeVrpgSelection(data, initialState.vrpgSelection)
      : initialState?.profileId === 'vrpg-be'
        ? selectionFromLegacy(data, initialState.specialRegimeId ?? '', initialState.specialDefinitionId ?? '')
        : base.vrpgSelection ?? EMPTY_VRPG_SELECTION;
  const resolved = resolveVrpgSelection(data, vrpgSelection);
  return {
    ...merged,
    vrpgSelection,
    ...(merged.profileId === 'vrpg-be' ? {
      specialRegimeId: resolved.regimeId,
      specialDefinitionId: resolved.definitionId,
      specialLawChecked: resolved.kind === 'general'
    } : {})
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

function localizedLabel(value: { readonly labels: { readonly de: string; readonly fr: string } }, locale: Locale): string {
  return value.labels[locale];
}

function formatLocalTime(value: string | null, locale: Locale): string {
  if (!value) return '–';
  const compact = value.slice(0, 5).replace(':', locale === 'de' ? '.' : ' h ');
  return locale === 'de' ? `${compact} Uhr` : compact;
}

function specialDefinitionLabel(definition: DeadlineDefinition, locale: Locale): string {
  if (definition.deadlineOrigin === 'CALCULATED' && definition.applicability
    && definition.calculation.type === 'R1_RELATIVE') {
    return definition.calculation.duration
      ? `${definition.calculation.duration.value} ${translate(locale, 'vrpg.unit.day')}`
      : translate(locale, 'vrpg.orderedDays');
  }
  const translated = translate(locale, `special.definition.${definition.deadlineDefinitionId}`);
  if (translated !== `special.definition.${definition.deadlineDefinitionId}`) return translated;
  return definition.sourceRefs.map(source => source.locator).join(' · ') || definition.deadlineDefinitionId;
}

function CalendarEvidence({ evidence, locale }: {
  readonly evidence: CalendarTraceEvidence;
  readonly locale: Locale;
}): React.ReactElement {
  return (
    <div className="fr-trace__calendar">
      <p>
        {translate(locale, 'trace.calendar')}: <code>{evidence.calendarId}</code>
        {' · '}{translate(locale, 'trace.dataRelease')}: <code>{evidence.releaseId}</code>
      </p>
      <ul>
        {evidence.applications.map(application => (
          <li key={`${application.operation}-${application.ruleId}`}>
            <code>{application.ruleId}</code>
            {' · '}{application.sourceRefs.map(source => `${source.sourceId} ${source.locator}`).join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
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
        {step.calendarEvidence && <CalendarEvidence evidence={step.calendarEvidence} locale={locale} />}
      </div>
    </li>
  );
}

function CalendarExportTile({
  deadlineDate,
  locale,
  reference,
  onReferenceChange,
}: {
  readonly deadlineDate: string;
  readonly locale: Locale;
  readonly reference: string;
  readonly onReferenceChange: (value: string) => void;
}): React.ReactElement {
  const [failed, setFailed] = React.useState(false);

  const createCalendarFile = (): void => {
    try {
      const artifact = createDeadlineCalendarEntry({ deadlineDate, locale, reference });
      downloadDeadlineCalendarEntry(artifact);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  };

  return (
    <div className="fr-calendar-export">
      <dt className="fr-calendar-export__action">
        <PrimaryButton
          className="fr-calendar-export__button"
          type="button"
          iconProps={{ iconName: 'Calendar' }}
          onClick={createCalendarFile}
        >
          {translate(locale, 'calendar.create')}
        </PrimaryButton>
      </dt>
      <dd>
        <TextField
          label={translate(locale, 'calendar.reference')}
          placeholder={translate(locale, 'calendar.reference.placeholder')}
          value={reference}
          maxLength={CALENDAR_EXPORT_CONTRACT.referenceMaxCharacters}
          onChange={(_event, value) => {
            setFailed(false);
            onReferenceChange(value ?? '');
          }}
        />
        <p className="fr-calendar-export__privacy">{translate(locale, 'calendar.privacy')}</p>
        {failed && (
          <MessageBar className="fr-calendar-export__error" messageBarType={MessageBarType.error}>
            {translate(locale, 'calendar.downloadFailed')}
          </MessageBar>
        )}
      </dd>
    </div>
  );
}

function ResultPanel({ result, locale, calendarReference, onCalendarReferenceChange }: {
  readonly result: CalculationResult;
  readonly locale: Locale;
  readonly calendarReference: string;
  readonly onCalendarReferenceChange: (value: string) => void;
}): React.ReactElement {
  return (
    <section className="fr-result" aria-labelledby="fr-result-heading">
      <h2 id="fr-result-heading">{translate(locale, 'result.heading')}</h2>
      <MessageBar messageBarType={result.outcome === 'calculated' ? MessageBarType.success : MessageBarType.blocked}>
        {translate(locale, result.outcome === 'calculated' ? 'result.calculated' : 'result.blocked')}
      </MessageBar>

      {result.outcome === 'calculated' && (
        <>
          <dl className="fr-result__grid">
            <div className="fr-result__hero">
              <dt>{translate(locale, 'result.finalEnd')}</dt>
              <dd><strong>{formatIsoDate(result.finalEnd, locale)}</strong></dd>
            </div>
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
              <dt className="fr-result__secondary">{translate(locale, 'result.shifted')}</dt>
              <dd>{translate(locale, result.endShift.applied ? 'result.yes' : 'result.no')}</dd>
            </div>
            <CalendarExportTile
              deadlineDate={result.finalEnd}
              locale={locale}
              reference={calendarReference}
              onReferenceChange={onCalendarReferenceChange}
            />
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

function SpecialTrace({
  step,
  locale
}: {
  readonly step: SpecialTraceStep;
  readonly locale: Locale;
}): React.ReactElement {
  return (
    <li className="fr-trace__item">
      <div className="fr-trace__number" aria-hidden="true">{step.sequence}</div>
      <div>
        <h4>{translate(locale, `special.trace.${step.operation}`)}</h4>
        {(step.inputDates?.length || step.outputDate) && (
          <p className="fr-trace__dates">
            {step.inputDates?.map(date => formatIsoDate(date, locale)).join(' · ') || '–'}
            {step.outputDate ? ` → ${formatIsoDate(step.outputDate, locale)}` : ''}
          </p>
        )}
        {step.reasonKeys.length > 0 && (
          <p>{step.reasonKeys.map(key => translateReason(locale, key)).join(' · ')}</p>
        )}
        {step.ruleIds.length > 0 && (
          <p className="fr-trace__rules">
            {translate(locale, 'trace.rules')}: {step.ruleIds.join(', ')}
          </p>
        )}
        {step.calendarEvidence && <CalendarEvidence evidence={step.calendarEvidence} locale={locale} />}
      </div>
    </li>
  );
}

function SpecialResultPanel({
  result,
  locale,
  regime,
  definition,
  filingProfile,
  socialSelection,
  calendarReference,
  onCalendarReferenceChange
}: {
  readonly result: SpecialDeadlineResult;
  readonly locale: Locale;
  readonly regime?: SpecialRegime;
  readonly definition?: DeadlineDefinition;
  readonly filingProfile?: FilingProfile;
  readonly socialSelection?: SocialUiSelection;
  readonly calendarReference: string;
  readonly onCalendarReferenceChange: (value: string) => void;
}): React.ReactElement {
  const completed = result.outcome !== 'blocked';
  const messageType = result.outcome === 'blocked'
    ? MessageBarType.blocked
    : result.outcome === 'manualReview'
      ? MessageBarType.severeWarning
      : MessageBarType.success;
  return (
    <section className="fr-result fr-result--special" aria-labelledby="fr-result-heading">
      <h2 id="fr-result-heading">{translate(locale, 'result.heading')}</h2>
      <MessageBar messageBarType={messageType}>
        {translate(locale, result.qualifiedCalculation && result.outcome === 'calculated'
          ? 'result.calculated' : `special.result.${result.outcome}`)}
      </MessageBar>

      {completed && result.finalDeadline && result.provisionalDeadline && (
        <>
          <dl className="fr-result__grid">
            <div className="fr-result__hero">
              <dt>{translate(locale, 'result.finalEnd')}</dt>
              <dd><strong>{formatIsoDate(result.finalDeadline.date, locale)}</strong></dd>
            </div>
            <div>
              <dt>{translate(locale, 'result.provisionalEnd')}</dt>
              <dd>{formatIsoDate(result.provisionalDeadline.date, locale)}</dd>
            </div>
            {result.qualifiedCalculation ? (
              <>
                <div>
                  <dt>{translate(locale, 'vrpg.calendarStart')}</dt>
                  <dd>{formatIsoDate(result.qualifiedCalculation.calendarStart, locale)}</dd>
                </div>
                <div>
                  <dt>{translate(locale, 'vrpg.firstCountedDay')}</dt>
                  <dd>{formatIsoDate(result.qualifiedCalculation.firstCountedDay, locale)}</dd>
                </div>
                <div>
                  <dt>{translate(locale, 'result.suspensionDays')}</dt>
                  <dd>{result.qualifiedCalculation.suspensionDays}</dd>
                </div>
                <div>
                  <dt>{translate(locale, 'result.shifted')}</dt>
                  <dd>{translate(locale, result.qualifiedCalculation.rollDays > 0 ? 'result.yes' : 'result.no')}</dd>
                </div>
              </>
            ) : <>
            <div>
              <dt>{translate(locale, 'special.result.filingMode')}</dt>
              <dd>{filingProfile ? localizedLabel(filingProfile, locale) : result.filingRequirement?.filingProfileId}</dd>
            </div>
            <div>
              <dt>{translate(locale, 'special.result.cutoff')}</dt>
              <dd>{formatLocalTime(result.filingRequirement?.cutoffTime ?? null, locale)}</dd>
            </div>
            <div>
              <dt>{translate(locale, 'special.result.timezone')}</dt>
              <dd>{result.filingRequirement?.timezone ?? '–'}</dd>
            </div>
            <div>
              <dt>{translate(locale, 'special.result.original')}</dt>
              <dd>{translate(locale, result.filingRequirement?.originalRequired ? 'result.yes' : 'result.no')}</dd>
            </div>
            </>}
            <div>
              <dt>{translate(locale, 'special.result.rule')}</dt>
              <dd>{socialSelection ? socialSelection.rule.labels[locale]
                : definition ? specialDefinitionLabel(definition, locale) : '–'}</dd>
            </div>
            {result.outcome === 'calculated' && (
              <CalendarExportTile
                deadlineDate={result.finalDeadline.date}
                locale={locale}
                reference={calendarReference}
                onReferenceChange={onCalendarReferenceChange}
              />
            )}
          </dl>
          {result.filingRequirement && !result.qualifiedCalculation && (
            <div className="fr-filing">
              <h3>{translate(locale, 'special.result.filingRequirements')}</h3>
              <dl>
                <div>
                  <dt>{translate(locale, 'special.result.channels')}</dt>
                  <dd>{result.filingRequirement.acceptedChannels.length > 0
                    ? result.filingRequirement.acceptedChannels
                      .map(channel => translate(locale, `special.channel.${channel}`)).join(' · ')
                    : '–'}</dd>
                </div>
                <div>
                  <dt>{translate(locale, 'special.result.evidence')}</dt>
                  <dd>{result.filingRequirement.acceptedEvidence.length > 0
                    ? result.filingRequirement.acceptedEvidence
                      .map(evidence => translate(locale, `special.evidence.${evidence}`)).join(' · ')
                    : '–'}</dd>
                </div>
              </dl>
            </div>
          )}
        </>
      )}

      {regime && (
        <p className="fr-result__basis">
          <strong>{translate(locale, 'special.result.legalBasis')}:</strong>{' '}
          {result.qualifiedCalculation
            ? <>{localizedLabel(regime, locale)} · {translate(locale, result.qualifiedCalculation.mappingId.startsWith('SOC-')
              ? 'vrpg.socialLegalBasis' : 'vrpg.procurementLegalBasis')}</>
            : <>{regime.lawCode} {regime.provision} · {localizedLabel(regime, locale)}</>}
        </p>
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

      <details className="fr-trace" open={!socialSelection && result.outcome === 'blocked'}>
        <summary>{translate(locale, 'trace.heading')}</summary>
        <ol>{result.trace.map(step => <SpecialTrace key={step.sequence} step={step} locale={locale} />)}</ol>
        {socialSelection && (
          <div className="fr-trace__context">
            <h4>{translate(locale, 'social.scopeLabel')}</h4>
            <p>{translate(locale, socialScopeKey(socialSelection))}</p>
            {socialSelection.rule.law === 'avig' && <p>{translate(locale, 'social.avig.limits')}</p>}
            {socialSelection.rule.law === 'kvg' && <p>{translate(locale, 'social.kvg.limits')}</p>}
            {socialSelection.rule.law === 'eog' && <p>{translate(locale, 'social.eog.limits')}</p>}
            {socialSelection.rule.law === 'famzg' && <p>{translate(locale, 'social.famzg.limits')}</p>}
            {socialSelection.rule.law === 'flg' && <p>{translate(locale, 'social.flg.limits')}</p>}
            <p>{translate(locale, 'social.contextNotice')}</p>
            <p><strong>{translate(locale, 'vrpg.context.triggerKind')}:</strong>{' '}
              {translate(locale, `social.document.${socialSelection.rule.law === 'ivg' && socialSelection.rule.action === 'appeal' ? 'ivg-appeal' : socialSelection.rule.action}`)}
            </p>
            <h4>{translate(locale, 'social.evidence')}</h4>
            <p>{socialSelection.rule.labels[locale]} · <code>{socialSelection.rule.ruleId}</code>
              {' · '}<code>{socialSelection.binding.bindingId}</code></p>
            <p>{[...socialSelection.rule.sourceRefs, ...socialSelection.binding.sourceRefs]
              .filter((ref, index, refs) => refs.findIndex(other => other.sourceId === ref.sourceId && other.locator === ref.locator) === index)
              .map((ref, index) => {
                const source = socialSelection.catalog.sources.find(item => item.sourceId === ref.sourceId);
                return <React.Fragment key={`${ref.sourceId}-${ref.locator}`}>
                  {index > 0 ? ' · ' : ''}
                  {source ? <a href={source.url} target="_blank" rel="noopener noreferrer">{ref.locator}</a> : ref.locator}
                </React.Fragment>;
              })}</p>
          </div>
        )}
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

export function FristenrechnerApp(props: FristenrechnerAppProps): React.ReactElement {
  // A new immutable data release starts a fresh session. Never display an old
  // result beside the new release's parameters or evidence.
  return <CalculatorSession key={props.data.releaseId} {...props} />;
}

function CalculatorSession({
  data,
  storage: explicitStorage,
  initialState
}: FristenrechnerAppProps): React.ReactElement {
  const storage = explicitStorage ?? browserStorage();
  const loaded = React.useMemo(() => loadDefaults(data, storage), [data, storage]);
  const initialForm = React.useMemo(() => stateFromDefaults(data, loaded, initialState), [data, loaded, initialState]);
  const [locale, setLocale] = React.useState<Locale>(loaded.locale);
  const [form, setForm] = React.useState<CalculatorFormState>(initialForm);
  // New case facts never come from local defaults, QA presets or old approvals.
  const [socialContext, setSocialContext] = React.useState<SocialUiContext>(EMPTY_SOCIAL_CONTEXT);
  const [calendarOverrideEnabled, setCalendarOverrideEnabled] = React.useState(
    () => isCalendarOverride(data, data.profiles.get(initialForm.profileId), initialForm.calendarId)
  );
  const [result, setResult] = React.useState<UiResult>();
  const [calendarReference, setCalendarReference] = React.useState('');
  const [validation, setValidation] = React.useState<UiValidation>({});
  const [notification, setNotification] = React.useState<Notification>();

  const profile = data.profiles.get(form.profileId);
  const availableProfiles = profilesForAuthority(data, form.authorityCode);
  const specialCatalog = specialCatalogForProfile(data, form.profileId);
  const vrpgMode = form.profileId === 'vrpg-be';
  const vrpgState = form.vrpgSelection ?? EMPTY_VRPG_SELECTION;
  const vrpgResolution = resolveVrpgSelection(data, vrpgState);
  const socialPath = vrpgMode ? socialUiPath(data, vrpgState) : undefined;
  const socialSelection = vrpgMode ? socialUiSelection(data, vrpgState, socialContext.decisionOrigin, socialContext.eogOfficeType) : undefined;
  const avigCourt = socialPath?.rule.law === 'avig' && socialPath.rule.stage === 'cantonal-insurance-court';
  const eogCourt = socialPath?.rule.law === 'eog' && socialPath.rule.stage === 'cantonal-insurance-court';
  const eogAdministration = socialPath?.rule.law === 'eog' && socialPath.rule.stage === 'administration';
  const familyLaw = socialPath?.rule.law === 'famzg' || socialPath?.rule.law === 'flg';
  const familyAdministration = familyLaw && socialPath?.rule.stage === 'administration';
  const domicileScope = socialPath ? socialUsesDomicileScope(socialPath) : false;
  const selection = specialSelection(
    data,
    form.profileId,
    form.specialRegimeId,
    form.specialDefinitionId
  );
  const specialRegime = selection.regime;
  const specialDefinition = selection.definition;
  const specialFilingProfile = socialPath
    ? socialPath.catalog.filingProfiles.find(item => item.filingProfileId === socialPath.rule.filingProfileId)
    : specialCatalog?.filingProfiles.find(item => item.filingProfileId === (
    specialRegime?.filingProfileId ?? specialDefinition?.filingProfileId
  ));
  const generalMode = isGeneralCalculation(data, form);
  const calculatedDefinition = specialDefinition?.deadlineOrigin === 'CALCULATED'
    ? specialDefinition as CalculatedDeadlineDefinition
    : undefined;
  const specialDurationInputId = calculatedDefinition?.calculation.type === 'R1_RELATIVE'
    ? calculatedDefinition.calculation.durationInputId
    : undefined;
  const primaryAnchor = calculatedDefinition?.anchors.find(anchor => anchor.valueType === 'date');
  const primaryDate = primaryDateField(data, form);
  const fixedSpecialDays = calculatedDefinition?.calculation.type === 'R1_RELATIVE'
    ? calculatedDefinition.calculation.duration
    : undefined;
  const qualifiedMode = Boolean(calculatedDefinition?.applicability);
  const vrpgContext = form.vrpgContext ?? EMPTY_VRPG_CONTEXT;
  const modelScope = qualifiedMode ? vrpgModelScope(vrpgState) : undefined;
  const lawOptions = vrpgLawOptions(vrpgState, data);
  const actionOptions = vrpgActionOptions(data, vrpgState);
  const fixedAction = vrpgFixedAction(data, vrpgState);
  const stageOptions = vrpgStageOptions(vrpgState, data);
  const automaticCalendar = automaticCalendarId(data, profile);
  const fixedCalendar = profile?.calendarPolicy.jurisdictionSelection === 'fixedBern';
  const manualOverride = isCalendarOverride(data, profile, form.calendarId);
  const selectors = effectiveSelectors(data, form);
  const suspension = suspensionPresentation(profile, selectors);
  const additionalAnchor = form.additionalHolidayAnchor.trim().toUpperCase();
  const hasAnchorConflict = /^(CH|[A-Z]{2})$/.test(additionalAnchor)
    && additionalAnchor !== data.calendars.get(form.calendarId)?.jurisdiction.code;
  const hasValidationErrors = Object.keys(validation).length > 0;
  const visibleSelectors = generalMode
    ? profile?.selectors.filter(definition => !(specialCatalog && definition.selectorId === 'specialLawStatus')) ?? []
    : [];

  const mutateForm = (change: Partial<CalculatorFormState>): void => {
    setForm(current => ({ ...current, ...change }));
    setResult(undefined);
    setCalendarReference('');
    setValidation({});
    setNotification(undefined);
  };

  const mutateSelection = (change: Partial<CalculatorFormState>): void => {
    const transition = reconcilePrimaryDate(data, form, { ...form, ...change });
    mutateForm({ ...change, inputDate: transition.inputDate, specialDateValues: transition.specialDateValues });
    if (transition.cleared) {
      setNotification({ type: MessageBarType.info,
        text: `${translate(locale, 'form.inputDate.changed')} ${translate(locale, transition.field.labelKey)}.` });
    }
  };

  const selectOptions = (definition: NonNullable<typeof profile>['selectors'][number]): IDropdownOption[] => [
    ...(definition.required ? [{ key: '', text: translate(locale, 'form.select') }] : []),
    ...definition.options
      .filter(option => option.value !== 'unknown')
      .map(option => ({ key: option.value, text: translate(locale, option.labelKey) }))
  ];

  const validate = (translationLocale: Locale = locale): UiValidation => {
    const errors: Record<string, string> = {};
    if (socialPath) {
      if (!parseIsoDate(form.inputDate)) errors.inputDate = translate(translationLocale, 'form.inputDate.required');
      if (socialPath.rule.calculation.durationInputId) {
        const days = Number(form.specialIntegerValues.deadlineDays);
        if (!Number.isInteger(days) || days < 1 || days > 365) errors.deadlineDays = translate(translationLocale, 'form.deadlineDays.required');
      }
      if (!domicileScope && !familyAdministration && !socialContext.jurisdictionCanton) errors['social.jurisdiction'] = translate(translationLocale, 'form.requiredSelection');
      if (familyLaw && !(socialPath.rule.law === 'famzg' ? socialContext.familyAllowanceOrderCanton : socialContext.compensationOfficeCanton)) {
        errors['social.familyCanton'] = translate(translationLocale, 'form.requiredSelection');
      }
      if (!socialContext.holidayConnections) errors['social.holidays'] = translate(translationLocale, 'form.requiredSelection');
      if (!socialSelection) errors['social.origin'] = translate(translationLocale, 'form.requiredSelection');
      if (eogCourt && socialContext.eogOfficeType === 'cantonal' && !socialContext.compensationOfficeCanton) {
        errors['social.eogCanton'] = translate(translationLocale, 'form.requiredSelection');
      }
      if (avigCourt && !socialContext.avigJurisdictionCanton) errors['social.avigCanton'] = translate(translationLocale, 'form.requiredSelection');
      if (socialSelection && socialNeedsPartyDomicile(socialSelection) && !socialContext.partyDomicileCanton) errors['social.partyDomicile'] = translate(translationLocale, 'form.requiredSelection');
      if (socialSelection && socialNeedsJurisdictionDate(socialSelection) && !parseIsoDate(socialContext.jurisdictionReferenceDate)) {
        errors['social.jurisdictionDate'] = translate(translationLocale, 'form.inputDate.required');
      }
      return errors;
    }
    if (vrpgMode && vrpgResolution.kind === 'incomplete') {
      if (!vrpgState.area) errors['vrpg.area'] = translate(translationLocale, 'vrpg.required');
      else if (lawOptions.length > 0 && !vrpgState.law) errors['vrpg.law'] = translate(translationLocale, 'vrpg.required');
      else if (actionOptions.length > 0 && !vrpgState.action) errors['vrpg.action'] = translate(translationLocale, 'vrpg.required');
      else if (stageOptions.length > 0 && !vrpgState.stage) errors['vrpg.stage'] = translate(translationLocale, 'vrpg.required');
      else errors['vrpg.area'] = translate(translationLocale, 'vrpg.invalid');
      return errors;
    }
    if (vrpgMode && vrpgResolution.kind === 'unavailable') {
      errors['vrpg.action'] = translate(translationLocale, 'vrpg.unavailable');
      return errors;
    }
    if (generalMode) {
      if (!parseIsoDate(form.inputDate)) {
        errors.inputDate = translate(translationLocale, 'form.inputDate.required');
      }
      const days = Number(form.deadlineDays);
      if (!Number.isInteger(days) || days < 1 || days > 365) {
        errors.deadlineDays = translate(translationLocale, 'form.deadlineDays.required');
      }
      visibleSelectors.forEach(definition => {
        if (definition.required && !form.selectors[definition.selectorId]) {
          errors[`selector.${definition.selectorId}`] = translate(translationLocale, 'form.requiredSelection');
        }
      });
      if (manualOverride && form.calendarOverrideReason.trim().length < 3) {
        errors.overrideReason = translate(translationLocale, 'override.reason.required');
      }
      if (additionalAnchor && !/^(CH|[A-Z]{2})$/.test(additionalAnchor)) {
        errors.additionalHolidayAnchor = translate(translationLocale, 'anchor.additional.invalid');
      }
      return errors;
    }

    if (!specialRegime) {
      errors.specialRegime = translate(translationLocale, 'special.validation.regime');
      return errors;
    }
    if (!calculatedDefinition) {
      errors.specialDefinition = translate(translationLocale, 'special.validation.definition');
      return errors;
    }
    if (qualifiedMode) {
      if (!modelScope) {
        errors.specialDefinition = translate(translationLocale, 'special.validation.definition');
      }
      if (!modelScope?.notification && !vrpgContext.notificationChannel) {
        errors['context.notificationChannel'] = translate(translationLocale, 'form.requiredSelection');
      }
      if (vrpgState.area === 'social' && !vrpgContext.holidayConnections) {
        errors['context.holidayConnections'] = translate(translationLocale, 'form.requiredSelection');
      }
      if (vrpgState.area === 'procurement' && !parseIsoDate(vrpgContext.procedureStartDate)) {
        errors['context.procedureStartDate'] = translate(translationLocale, 'form.inputDate.required');
      }
    }
    calculatedDefinition.anchors.forEach(anchor => {
      const key = `special.${anchor.inputId}`;
      if (anchor.valueType === 'date' && !parseIsoDate(form.specialDateValues[anchor.inputId] ?? '')) {
        errors[key] = translate(translationLocale, 'special.validation.date');
      }
      if (anchor.valueType === 'localTime'
        && !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(form.specialLocalTimeValues[anchor.inputId] ?? '')) {
        errors[key] = translate(translationLocale, 'special.validation.time');
      }
    });
    if (calculatedDefinition.calculation.type === 'R1_RELATIVE'
      && calculatedDefinition.calculation.durationInputId) {
      const inputId = calculatedDefinition.calculation.durationInputId;
      const value = Number(form.specialIntegerValues[inputId]);
      if (!Number.isInteger(value) || value < 1 || value > 365) {
        errors[`special.${inputId}`] = translate(translationLocale, 'special.validation.integer');
      }
    }
    const overrideIds = new Set([
      ...specialRegime.legalOverrideIds,
      ...calculatedDefinition.legalOverrideIds
    ]);
    specialCatalog?.legalOverrides
      .filter(override => overrideIds.has(override.overrideId) && override.confirmationRequired)
      .forEach(override => {
        if (!form.specialOverrideConfirmations.includes(override.overrideId)) {
          errors[`override.${override.overrideId}`] = translate(translationLocale, 'special.validation.override');
        }
      });
    return errors;
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const errors = validate();
    setValidation(errors);
    setNotification(undefined);
    setCalendarReference('');
    if (Object.keys(errors).length > 0) {
      setResult(undefined);
      return;
    }
    if (generalMode) {
      setResult({ kind: 'general', value: calculateDeadline(createCalculationInput(data, form), data) });
      return;
    }
    if (socialSelection) {
      const input = socialInputFromUi(socialSelection, form.authorityCode, form.inputDate,
        form.specialIntegerValues.deadlineDays ?? '', socialContext);
      setResult({ kind: 'social', value: calculateSocialDeadline(input, data) });
      return;
    }
    const input = createSpecialCalculationInput(data, form);
    if (!input) {
      setValidation({ specialDefinition: translate(locale, 'special.validation.definition') });
      setResult(undefined);
      return;
    }
    setResult({ kind: 'special', value: calculateSpecialDeadline(input, data) });
  };

  const onAuthorityChange = (_event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
    if (typeof option?.key !== 'string') {
      return;
    }
    setSocialContext(EMPTY_SOCIAL_CONTEXT);
    const profileId = reconcileProfileId(data, option.key, form.profileId);
    const nextProfile = data.profiles.get(profileId);
    const special = reconcileSpecialSelection(
      data,
      profileId,
      '',
      ''
    );
    mutateSelection({
      authorityCode: option.key,
      profileId,
      selectors: defaultSelectors(nextProfile),
      calendarId: automaticCalendarId(data, nextProfile),
      calendarOverrideReason: '',
      deliveryFictionConfirmed: false,
      additionalHolidayAnchor: '',
      holidayAnchorConfirmed: false,
      specialLawChecked: false,
      specialRegimeId: special.regimeId,
      specialDefinitionId: special.definitionId,
      vrpgSelection: EMPTY_VRPG_SELECTION,
      vrpgContext: EMPTY_VRPG_CONTEXT,
      inputDate: '',
      specialDateValues: {},
      specialLocalTimeValues: {},
      specialIntegerValues: {},
      specialOverrideConfirmations: []
    });
    setCalendarOverrideEnabled(false);
  };

  const onProfileChange = (_event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
    if (typeof option?.key !== 'string') {
      return;
    }
    setSocialContext(EMPTY_SOCIAL_CONTEXT);
    const nextProfile = data.profiles.get(option.key);
    const special = reconcileSpecialSelection(
      data,
      option.key,
      '',
      ''
    );
    mutateSelection({
      profileId: option.key,
      selectors: defaultSelectors(nextProfile),
      calendarId: automaticCalendarId(data, nextProfile),
      calendarOverrideReason: '',
      deliveryFictionConfirmed: false,
      additionalHolidayAnchor: '',
      holidayAnchorConfirmed: false,
      specialLawChecked: false,
      specialRegimeId: special.regimeId,
      specialDefinitionId: special.definitionId,
      vrpgSelection: EMPTY_VRPG_SELECTION,
      vrpgContext: EMPTY_VRPG_CONTEXT,
      inputDate: '',
      specialDateValues: {},
      specialLocalTimeValues: {},
      specialIntegerValues: {},
      specialOverrideConfirmations: []
    });
    setCalendarOverrideEnabled(false);
  };

  const onSelectorChange = (selectorId: string, option?: IDropdownOption): void => {
    if (typeof option?.key !== 'string') {
      return;
    }
    mutateSelection({
      selectors: { ...form.selectors, [selectorId]: option.key },
      deliveryFictionConfirmed: selectorId === 'deliveryMethod' ? false : form.deliveryFictionConfirmed,
      specialLawChecked: selectorId === 'specialLawStatus'
        ? option.key === 'noKnownOverride'
        : form.specialLawChecked
    });
  };

  const onVrpgChange = (field: keyof VrpgSelectionState, value: string): void => {
    setSocialContext(EMPTY_SOCIAL_CONTEXT);
    let nextSelection = changeVrpgSelection(data, vrpgState, field, value);
    if (field === 'area' && value === 'procurement') {
      nextSelection = changeVrpgSelection(data, nextSelection, 'law', 'ivob');
    }
    const resolved = resolveVrpgSelection(data, nextSelection);
    mutateSelection({
      vrpgSelection: nextSelection,
      vrpgContext: EMPTY_VRPG_CONTEXT,
      specialRegimeId: resolved.regimeId,
      specialDefinitionId: resolved.definitionId,
      inputDate: '',
      selectors: defaultSelectors(profile),
      deliveryFictionConfirmed: false,
      calendarId: automaticCalendar,
      calendarOverrideReason: '',
      additionalHolidayAnchor: '',
      holidayAnchorConfirmed: false,
      specialDateValues: {},
      specialLocalTimeValues: {},
      specialIntegerValues: {},
      specialOverrideConfirmations: [],
      specialLawChecked: resolved.kind === 'general'
    });
    setCalendarOverrideEnabled(false);
  };

  const onSaveDefaults = (): void => {
    const defaults: StoredDefaults = {
      version: 3,
      locale,
      authorityCode: form.authorityCode,
      profileId: form.profileId,
      deadlineDays: Number.isInteger(Number(form.deadlineDays)) ? Number(form.deadlineDays) : 10,
      selectors: form.selectors,
      calendarId: form.calendarId,
      specialRegimeId: form.specialRegimeId,
      specialDefinitionId: form.specialDefinitionId,
      vrpgSelection: vrpgState
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
    setForm(stateFromDefaults(data, defaults));
    setSocialContext(EMPTY_SOCIAL_CONTEXT);
    setCalendarOverrideEnabled(false);
    setResult(undefined);
    setCalendarReference('');
    setValidation({});
    setNotification({
      type: removed ? MessageBarType.success : MessageBarType.error,
      text: translate(defaults.locale, removed ? 'defaults.reset' : 'defaults.resetFailed')
    });
  };

  const renderVrpgChoice = (
    field: keyof VrpgSelectionState,
    labelKey: string,
    choices: readonly VrpgChoice[],
    disabled = false
  ): React.ReactElement => (
    <Dropdown
      required
      className="fr-procedure-choice"
      label={translate(locale, labelKey)}
      options={(choices.length > 0 ? choices : vrpgAreaOptions().slice(0, 1))
        .map(choice => ({ key: choice.key, text: choice.labels[locale] }))}
      selectedKey={vrpgState[field]}
      disabled={disabled}
      errorMessage={validation[`vrpg.${field}`] ?? ''}
      onChange={(_event, option) => {
        if (typeof option?.key === 'string') onVrpgChange(field, option.key);
      }}
    />
  );

  const renderSelector = (definition: LegalProfile['selectors'][number]): React.ReactElement => (
    <Dropdown
      key={definition.selectorId}
      required={definition.required}
      label={translate(locale, `selector.${definition.selectorId}`)}
      options={selectOptions(definition)}
      selectedKey={form.selectors[definition.selectorId] ?? ''}
      errorMessage={validation[`selector.${definition.selectorId}`] ?? ''}
      onChange={(_event, option) => onSelectorChange(definition.selectorId, option)}
    />
  );

  const renderFixedValue = (labelKey: string, value: VrpgChoice): React.ReactElement => (
    <div className="fr-model-scope">
      <div className="fr-model-scope__label">{translate(locale, labelKey)}</div>
      <output
        className="fr-model-scope__value"
        aria-label={translate(locale, labelKey)}
        aria-live="off"
      >{value.labels[locale]}</output>
    </div>
  );

  const renderModelScope = (field: 'matter' | 'triggerKind' | 'notificationChannel', value: VrpgChoice): React.ReactElement =>
    renderFixedValue(`vrpg.context.${field}`, value);

  const renderSocialFamilyCanton = (): React.ReactElement => (
    <Dropdown required
      label={translate(locale, socialPath?.rule.law === 'famzg' ? 'social.famzg.orderCanton' : 'social.flg.officeCanton')}
      selectedKey={(socialPath?.rule.law === 'famzg' ? socialContext.familyAllowanceOrderCanton : socialContext.compensationOfficeCanton) ?? ''}
      options={[{ key: '', text: translate(locale, 'form.select') }, ...SOCIAL_CANTONS.map(canton => ({ key: canton, text: canton }))]}
      errorMessage={validation['social.familyCanton'] ?? ''}
      onChange={(_event, option) => {
        if (typeof option?.key !== 'string') return;
        const factKey = socialPath?.rule.law === 'famzg' ? 'familyAllowanceOrderCanton' : 'compensationOfficeCanton';
        setSocialContext(current => ({ ...current, [factKey]: option.key as string,
          jurisdictionCanton: '', jurisdictionReferenceDate: '' }));
        mutateForm({});
      }} />
  );

  const renderSocialDomicile = (labelKey: string): React.ReactElement => (
    <Dropdown required label={translate(locale, labelKey)}
      selectedKey={socialContext.partyDomicileCanton}
      options={[{ key: '', text: translate(locale, 'form.select') }, ...SOCIAL_CANTONS.map(canton => ({ key: canton, text: canton }))]}
      errorMessage={validation['social.partyDomicile'] ?? ''}
      onChange={(_event, option) => {
        if (typeof option?.key !== 'string') return;
        setSocialContext(current => ({ ...current, partyDomicileCanton: option.key as string, jurisdictionReferenceDate: '' }));
        mutateForm({});
      }} />
  );

  const renderContextChoice = (field: keyof VrpgContextState, choices: readonly VrpgChoice[]): React.ReactElement => (
    <Dropdown
      required
      className="fr-procedure-choice"
      label={translate(locale, `vrpg.context.${field}`)}
      selectedKey={vrpgContext[field]}
      options={choices.map(choice => ({ key: choice.key, text: choice.labels[locale] }))}
      errorMessage={validation[`context.${field}`] ?? ''}
      onChange={(_event, option) => {
        if (typeof option?.key !== 'string') return;
        mutateSelection({
          vrpgContext: { ...vrpgContext, [field]: option.key },
          ...(field === 'notificationChannel'
            && ((vrpgContext.notificationChannel === 'official-publication') !== (option.key === 'official-publication'))
            ? { specialDateValues: {} } : {})
        });
      }}
    />
  );

  const renderSpecialAnchor = (anchor: CalculatedDeadlineDefinition['anchors'][number]): React.ReactElement => anchor.valueType === 'date' ? (
    <DateInput
      key={anchor.inputId}
      label={qualifiedMode && anchor.inputId === 'legalTriggerDate'
        ? translate(locale, vrpgContext.notificationChannel === 'official-publication'
          ? 'vrpg.publicationDate' : 'vrpg.legalServiceDate')
        : translate(locale, anchor.labelKey)}
      value={form.specialDateValues[anchor.inputId] ?? ''}
      errorMessage={validation[`special.${anchor.inputId}`] ?? ''}
      onChange={value => mutateForm({ specialDateValues: { ...form.specialDateValues, [anchor.inputId]: value } })}
    />
  ) : (
    <TextField
      key={anchor.inputId}
      required
      label={translate(locale, anchor.labelKey)}
      type="time"
      value={form.specialLocalTimeValues[anchor.inputId] ?? ''}
      errorMessage={validation[`special.${anchor.inputId}`] ?? ''}
      onChange={(_event, value) => mutateForm({
        specialLocalTimeValues: { ...form.specialLocalTimeValues, [anchor.inputId]: value ?? '' }
      })}
    />
  );

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
              const nextLocale = option.key;
              setLocale(nextLocale);
              setValidation(current => Object.keys(current).length > 0
                ? validate(nextLocale)
                : current);
              setNotification(undefined);
            }
          }}
        />
      </header>

      <MessageBar className="fr-disclaimer" messageBarType={MessageBarType.warning}>
        {translate(locale, 'app.disclaimer')}
      </MessageBar>
      {data.releaseId.includes('-ap17c-candidate.') && (
        <MessageBar className="fr-selection-notice" messageBarType={MessageBarType.warning}>
          {translate(locale, 'vrpg.candidate')}
        </MessageBar>
      )}
      {data.releaseId.includes('-ap18c-candidate.') && (
        <MessageBar className="fr-selection-notice" messageBarType={MessageBarType.warning}>
          {translate(locale, 'app.candidate')}
        </MessageBar>
      )}
      {hasSocialUi(data) && [...data.socialProcedureCatalogs!.values()].some(catalog =>
        catalog.releaseEligibility.some(eligibility => eligibility.status === 'candidate')) && (
        <MessageBar className="fr-selection-notice" messageBarType={MessageBarType.warning}>
          {translate(locale, data.releaseId.includes('-ap20c2-') ? 'social.candidate.family'
            : data.releaseId.includes('-ap20c1-') ? 'social.candidate.eog'
            : data.releaseId.includes('-ap19c3-') ? 'social.candidate.kvg'
            : data.releaseId.includes('-ap19c2-') ? 'social.candidate.avig' : 'social.candidate')}
        </MessageBar>
      )}

      <form className="fr-form" onSubmit={onSubmit} noValidate>
        <section aria-labelledby="fr-form-heading">
          <h2 id="fr-form-heading">{translate(locale, 'form.heading')}</h2>
          <div className="fr-form__grid">
            {socialPath ? (
              <DateInput label={translate(locale, 'vrpg.legalServiceDate')} value={form.inputDate}
                errorMessage={validation.inputDate ?? ''}
                onChange={value => mutateForm({ inputDate: value })} />
            ) : primaryAnchor && !generalMode ? renderSpecialAnchor(primaryAnchor) : (
              <DateInput
                key="general-input-date"
                label={translate(locale, primaryDate.labelKey)}
                value={form.inputDate}
                {...(validation.inputDate ? { errorMessage: validation.inputDate } : {})}
                onChange={value => mutateForm({ inputDate: value })}
              />
            )}
            {socialPath ? socialPath.rule.calculation.duration ? (
              <TextField readOnly label={translate(locale, 'vrpg.duration')}
                value={`${socialPath.rule.calculation.duration.value} ${translate(locale, 'vrpg.unit.day')}`} />
            ) : (
              <TextField required label={translate(locale, 'vrpg.orderedDays')} type="number" min={1} max={365} step={1}
                value={form.specialIntegerValues.deadlineDays ?? ''} errorMessage={validation.deadlineDays ?? ''}
                onChange={(_event, value) => mutateForm({ specialIntegerValues: { deadlineDays: value ?? '' } })} />
            ) : generalMode ? (
              <TextField
                required
                label={translate(locale, 'form.deadlineDays')}
                type="number"
                min={1}
                max={365}
                step={1}
                value={form.deadlineDays}
                errorMessage={validation.deadlineDays ?? ''}
                onChange={(_event, value) => mutateForm({ deadlineDays: value ?? '' })}
              />
            ) : specialDurationInputId ? (
              <TextField
                required
                label={translate(locale, qualifiedMode ? 'vrpg.orderedDays' : `input.${specialDurationInputId}`)}
                type="number"
                min={1}
                max={365}
                step={1}
                value={form.specialIntegerValues[specialDurationInputId] ?? ''}
                errorMessage={validation[`special.${specialDurationInputId}`] ?? ''}
                onChange={(_event, value) => mutateForm({
                  specialIntegerValues: { ...form.specialIntegerValues, [specialDurationInputId]: value ?? '' }
                })}
              />
            ) : (
              <TextField
                readOnly
                label={translate(locale, 'vrpg.duration')}
                value={fixedSpecialDays
                  ? `${fixedSpecialDays.value} ${translate(locale, `vrpg.unit.${fixedSpecialDays.unit}`)}`
                  : translate(locale, calculatedDefinition ? 'vrpg.duration.rule' : 'vrpg.duration.pending')}
              />
            )}
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
            {vrpgMode && (
              <>
                {renderVrpgChoice('area', 'vrpg.area', vrpgAreaOptions())}
                {generalMode && visibleSelectors.some(item => item.selectorId === 'deliveryMethod')
                  ? renderSelector(visibleSelectors.find(item => item.selectorId === 'deliveryMethod')!)
                  : <div className="fr-grid-spacer" aria-hidden="true" />}
                {lawOptions.length > 0 && (
                  <>
                    {vrpgState.area === 'procurement' && vrpgState.law === 'ivob' ? (
                      <TextField
                        readOnly
                        label={translate(locale, 'vrpg.law')}
                        value={lawOptions.find(option => option.key === 'ivob')?.labels[locale] ?? ''}
                      />
                    ) : renderVrpgChoice('law', vrpgState.area === 'political' ? 'vrpg.level' : 'vrpg.law', lawOptions)}
                    {fixedAction && vrpgState.action === fixedAction.key
                      ? renderFixedValue('vrpg.action', fixedAction)
                      : renderVrpgChoice('action', 'vrpg.action', actionOptions, !vrpgState.law)}
                  </>
                )}
                {stageOptions.length > 0 && renderVrpgChoice('stage', 'vrpg.stage', stageOptions)}
                {stageOptions.length > 0 && socialPath && <div className="fr-grid-spacer" aria-hidden="true" />}
                {socialPath && (
                  <>
                    {renderFixedValue('vrpg.context.matter', { key: socialPath.rule.matter,
                      labels: { de: translate('de', eogAdministration ? 'social.eog.productScope' : domicileScope ? 'social.kvg.productScope' : `social.matter.${socialPath.rule.law}`),
                        fr: translate('fr', eogAdministration ? 'social.eog.productScope' : domicileScope ? 'social.kvg.productScope' : `social.matter.${socialPath.rule.law}`) } })}
                    {renderFixedValue('vrpg.context.notificationChannel', { key: 'individual-service', labels: {
                      de: translate('de', 'social.notification'), fr: translate('fr', 'social.notification') } })}
                    {socialPath.rule.law === 'avig' && <>
                      <Dropdown required label={translate(locale, avigCourt ? 'social.avig.origin.court' : 'social.avig.origin')}
                        selectedKey={socialContext.decisionOrigin ?? ''}
                        options={['', 'unemploymentFund', 'cantonalEmploymentOffice'].map(key => ({ key,
                          text: translate(locale, key ? `social.avig.origin.${key}` : 'form.select') }))}
                        errorMessage={validation['social.origin'] ?? ''}
                        onChange={(_event, option) => {
                          if (typeof option?.key !== 'string') return;
                          setSocialContext(current => ({ ...current, decisionOrigin: option.key as string,
                            jurisdictionCanton: '', avigJurisdictionCanton: '', jurisdictionReferenceDate: '' }));
                          mutateForm({});
                        }} />
                      <div className="fr-grid-spacer" aria-hidden="true" />
                    </>}
                    {eogCourt && <>
                      <Dropdown required label={translate(locale, 'social.eog.officeType')}
                        selectedKey={socialContext.eogOfficeType ?? ''}
                        options={['', 'cantonal', 'nonCantonal'].map(key => ({ key,
                          text: translate(locale, key ? `social.eog.officeType.${key}` : 'form.select') }))}
                        errorMessage={validation['social.origin'] ?? ''}
                        onChange={(_event, option) => {
                          if (typeof option?.key !== 'string') return;
                          setSocialContext(current => ({ ...current, eogOfficeType: option.key as string,
                            compensationOfficeCanton: '', jurisdictionCanton: '', partyDomicileCanton: '', jurisdictionReferenceDate: '' }));
                          mutateForm({});
                        }} />
                      {socialContext.eogOfficeType === 'cantonal' ? <Dropdown required
                        label={translate(locale, 'social.eog.officeCanton')}
                        selectedKey={socialContext.compensationOfficeCanton ?? ''}
                        options={[{ key: '', text: translate(locale, 'form.select') }, ...SOCIAL_CANTONS.map(canton => ({ key: canton, text: canton }))]}
                        errorMessage={validation['social.eogCanton'] ?? ''}
                        onChange={(_event, option) => {
                          if (typeof option?.key !== 'string') return;
                          setSocialContext(current => ({ ...current, compensationOfficeCanton: option.key as string,
                            jurisdictionCanton: '', jurisdictionReferenceDate: '' }));
                          mutateForm({});
                        }} /> : <div className="fr-grid-spacer" aria-hidden="true" />}
                    </>}
                    {familyAdministration ? renderSocialFamilyCanton() : eogAdministration ? renderSocialDomicile('social.eog.partyDomicile') : domicileScope ? renderSocialDomicile('social.kvg.partyDomicile') : <Dropdown required disabled={(socialPath.rule.law === 'avig' || eogCourt) && !socialSelection}
                      label={translate(locale, socialJurisdictionLabel(socialPath, socialContext.decisionOrigin))}
                      selectedKey={socialContext.jurisdictionCanton}
                      options={[{ key: '', text: translate(locale, 'form.select') }, ...SOCIAL_CANTONS.map(canton => ({ key: canton, text: canton }))]}
                      errorMessage={validation['social.jurisdiction'] ?? ''}
                      onChange={(_event, option) => {
                        if (typeof option?.key !== 'string') return;
                        setSocialContext(current => ({ ...current, jurisdictionCanton: option.key as string, partyDomicileCanton: '', jurisdictionReferenceDate: '' }));
                        mutateForm({});
                      }} />}
                    <Dropdown required label={translate(locale, 'vrpg.context.holidayConnections')}
                      selectedKey={socialContext.holidayConnections}
                      options={vrpgHolidayOptions().map(choice => ({ key: choice.key, text: choice.labels[locale] }))}
                      errorMessage={validation['social.holidays'] ?? ''}
                      onChange={(_event, option) => {
                        if (typeof option?.key !== 'string') return;
                        setSocialContext(current => ({ ...current, holidayConnections: option.key as string }));
                        mutateForm({});
                      }} />
                    {avigCourt && socialSelection && <Dropdown required
                      label={translate(locale, socialContext.decisionOrigin === 'unemploymentFund' ? 'social.avig.controlCanton' : 'social.avig.officeCanton')}
                      selectedKey={socialContext.avigJurisdictionCanton ?? ''}
                      options={[{ key: '', text: translate(locale, 'form.select') }, ...SOCIAL_CANTONS.map(canton => ({ key: canton, text: canton }))]}
                      errorMessage={validation['social.avigCanton'] ?? ''}
                      onChange={(_event, option) => {
                        if (typeof option?.key !== 'string') return;
                        setSocialContext(current => ({ ...current, avigJurisdictionCanton: option.key as string, jurisdictionReferenceDate: '' }));
                        mutateForm({});
                      }} />}
                    {familyLaw && !familyAdministration && renderSocialFamilyCanton()}
                    {!domicileScope && socialSelection && socialNeedsPartyDomicile(socialSelection)
                      && renderSocialDomicile('social.partyDomicile')}
                    {socialSelection && socialNeedsJurisdictionDate(socialSelection) && <DateInput
                      label={translate(locale, socialJurisdictionDateLabel(socialSelection))} value={socialContext.jurisdictionReferenceDate}
                      errorMessage={validation['social.jurisdictionDate'] ?? ''}
                      onChange={value => {
                        setSocialContext(current => ({ ...current, jurisdictionReferenceDate: value }));
                        mutateForm({});
                      }} />}
                  </>
                )}
                {qualifiedMode && (
                  <>
                    {modelScope && renderModelScope('matter', modelScope.matter)}
                    {modelScope && renderModelScope('triggerKind', modelScope.triggerKind)}
                    {modelScope?.notification
                      ? renderModelScope('notificationChannel', modelScope.notification)
                      : renderContextChoice('notificationChannel', vrpgNotificationOptions(vrpgState))}
                    {vrpgState.area === 'social'
                      ? renderContextChoice('holidayConnections', vrpgHolidayOptions())
                      : <DateInput
                        label={translate(locale, 'vrpg.context.procedureStartDate')}
                        value={vrpgContext.procedureStartDate}
                        errorMessage={validation['context.procedureStartDate'] ?? ''}
                        onChange={value => mutateForm({ vrpgContext: { ...vrpgContext, procedureStartDate: value } })}
                      />}
                  </>
                )}
              </>
            )}
            {visibleSelectors.filter(item => !vrpgMode || item.selectorId !== 'deliveryMethod').map(renderSelector)}
            {!generalMode && calculatedDefinition?.anchors
              .filter(anchor => anchor !== primaryAnchor)
              .map(renderSpecialAnchor)}
          </div>

          {vrpgMode && vrpgResolution.kind === 'unavailable' && (vrpgState.area === 'social' || vrpgState.area === 'procurement') && (
            <MessageBar className="fr-selection-notice" messageBarType={MessageBarType.info}>
              {translate(locale, 'vrpg.unavailable')}
            </MessageBar>
          )}
          {!generalMode && calculatedDefinition && specialRegime && specialCatalog?.legalOverrides
            .filter(override => (
              specialRegime.legalOverrideIds.includes(override.overrideId)
              || calculatedDefinition.legalOverrideIds.includes(override.overrideId)
            ) && override.confirmationRequired)
            .map(override => (
              <Checkbox
                key={override.overrideId}
                className="fr-confirmation"
                label={localizedLabel(override, locale)}
                checked={form.specialOverrideConfirmations.includes(override.overrideId)}
                onChange={(_event, checked) => mutateForm({
                  specialOverrideConfirmations: checked
                    ? [...new Set([...form.specialOverrideConfirmations, override.overrideId])]
                    : form.specialOverrideConfirmations.filter(item => item !== override.overrideId)
                })}
              />
            ))}

          {generalMode && requiresDeliveryFictionConfirmation(selectors) && (
            <Checkbox
              className="fr-confirmation"
              label={translate(locale, 'confirmation.delivery')}
              checked={form.deliveryFictionConfirmed}
              onChange={(_event, checked) => mutateForm({ deliveryFictionConfirmed: Boolean(checked) })}
            />
          )}
        </section>

        <div className="fr-actions">
          <PrimaryButton type="submit">{translate(locale, 'form.calculate')}</PrimaryButton>
          <DefaultButton
            type="button"
            onClick={() => {
              setResult(undefined);
              setCalendarReference('');
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
            : result?.kind === 'general'
              ? (
                <ResultPanel
                  result={result.value}
                  locale={locale}
                  calendarReference={calendarReference}
                  onCalendarReferenceChange={setCalendarReference}
                />
              )
              : (result?.kind === 'special' || result?.kind === 'social') && (
                <SpecialResultPanel
                  result={result.value}
                  locale={locale}
                  calendarReference={calendarReference}
                  onCalendarReferenceChange={setCalendarReference}
                  {...(specialRegime ? { regime: specialRegime } : {})}
                  {...(specialDefinition ? { definition: specialDefinition } : {})}
                  {...(specialFilingProfile ? { filingProfile: specialFilingProfile } : {})}
                  {...(socialSelection ? { socialSelection } : {})}
                />
              )}
        </div>

        <section className="fr-automatic" aria-labelledby="fr-automatic-heading">
          <h2 id="fr-automatic-heading">{translate(locale, 'automatic.heading')}</h2>
          {socialPath ? (
            <dl className="fr-automatic__grid">
              <div><dt>{translate(locale, 'special.automatic.regime')}</dt><dd><strong>{socialPath.rule.labels[locale]}</strong></dd></div>
              <div><dt>{translate(locale, 'automatic.suspension')}</dt><dd><strong>{socialPath.catalog.suspensionProfiles.find(item => item.suspensionProfileId === socialPath.rule.suspensionProfileId)?.labels[locale] ?? '–'}</strong></dd></div>
              <div><dt>{translate(locale, 'automatic.calendar')}</dt><dd><strong>{socialContext.holidayConnections === 'partyBE' || socialContext.holidayConnections === 'partyAndRepresentativeBE'
                ? translate(locale, 'calendar.be-public-holidays') : translate(locale, 'form.select')}</strong><small>{translate(locale, 'vrpg.anchorExplanation')}</small></dd></div>
              <div><dt>{translate(locale, 'vrpg.caseCoverage')}</dt><dd><strong>{formatIsoDate(socialPath.rule.caseCoverage.from, locale)} – {socialPath.rule.caseCoverage.to ? formatIsoDate(socialPath.rule.caseCoverage.to, locale) : translate(locale, 'dataStatus.openEnded')}</strong></dd></div>
            </dl>
          ) : generalMode ? (
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
          ) : (
            <dl className="fr-automatic__grid fr-automatic__grid--special">
              <div>
                <dt>{translate(locale, 'special.automatic.regime')}</dt>
                <dd>
                  <strong>{specialRegime ? qualifiedMode
                    ? localizedLabel(specialRegime, locale) : `${specialRegime.lawCode} ${specialRegime.provision}` : '–'}</strong>
                  {!qualifiedMode && <small>{specialRegime ? localizedLabel(specialRegime, locale) : '–'}</small>}
                </dd>
              </div>
              <div>
                <dt>{translate(locale, 'special.automatic.rule')}</dt>
                <dd><strong>{specialDefinition ? specialDefinitionLabel(specialDefinition, locale) : '–'}</strong></dd>
              </div>
              <div>
                <dt>{translate(locale, 'automatic.calendar')}</dt>
                <dd><strong>{specialCatalog?.calendarProfiles.find(item => item.calendarProfileId === (
                  specialRegime?.calendarProfileId ?? calculatedDefinition?.resultPolicy.calendarProfileId
                ))?.labels[locale] ?? '–'}</strong>
                  {qualifiedMode && vrpgState.area === 'social' && <small>{translate(locale, 'vrpg.anchorExplanation')}</small>}
                </dd>
              </div>
              <div>
                <dt>{translate(locale, 'automatic.suspension')}</dt>
                <dd><strong>{specialCatalog?.suspensionProfiles.find(item => item.suspensionProfileId === (
                  specialRegime?.suspensionProfileId ?? calculatedDefinition?.resultPolicy.suspensionProfileId
                ))?.labels[locale] ?? '–'}</strong></dd>
              </div>
              <div>
                <dt>{translate(locale, qualifiedMode ? 'vrpg.stage' : 'special.automatic.filing')}</dt>
                <dd><strong>{qualifiedMode ? qualifiedStage(vrpgState).labels[locale]
                  : specialFilingProfile ? localizedLabel(specialFilingProfile, locale) : '–'}</strong></dd>
              </div>
              <div>
                <dt>{translate(locale, qualifiedMode ? 'vrpg.caseCoverage' : 'special.automatic.overrides')}</dt>
                <dd><strong>{qualifiedMode && calculatedDefinition?.applicability
                  ? `${formatIsoDate(calculatedDefinition.applicability.caseCoverageFrom, locale)} – ${calculatedDefinition.applicability.caseCoverageTo
                    ? formatIsoDate(calculatedDefinition.applicability.caseCoverageTo, locale) : translate(locale, 'dataStatus.openEnded')}`
                  : !specialRegime ? '–' : [
                  ...(specialRegime?.legalOverrideIds ?? []),
                  ...(calculatedDefinition?.legalOverrideIds ?? [])
                ].length > 0 ? [...new Set([
                    ...(specialRegime?.legalOverrideIds ?? []),
                    ...(calculatedDefinition?.legalOverrideIds ?? [])
                  ])].map(overrideId => specialCatalog?.legalOverrides
                    .find(item => item.overrideId === overrideId)?.labels[locale] ?? overrideId).join(' · ') : translate(locale, 'special.automatic.none')}</strong></dd>
              </div>
            </dl>
          )}

          {generalMode && !fixedCalendar && (
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
                        mutateForm({ calendarId: option.key, holidayAnchorConfirmed: false });
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

          {generalMode && <details className="fr-anchor">
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
          </details>}
        </section>
      </form>

      <footer className="fr-data-status">
        <span>{translate(locale, 'dataStatus.label')}: <code>{data.releaseId}</code></span>
        <span aria-hidden="true">·</span>
        <span>
          {translate(locale, 'dataStatus.coverage')}: {formatIsoDate(data.coverage.from, locale)} – {data.coverage.to
            ? formatIsoDate(data.coverage.to, locale)
            : translate(locale, 'dataStatus.openEnded')}
        </span>
      </footer>
    </main>
  );
}

export default FristenrechnerApp;
