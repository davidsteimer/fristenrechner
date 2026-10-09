// SPDX-License-Identifier: AGPL-3.0-only
import * as React from 'react';
import { Calendar, DayOfWeek, DefaultButton, Dialog, DialogFooter, DialogType } from '@fluentui/react';
import { formatDateEntry, parseDateEntry, zurichToday } from './dateEntry';
import { DateInputSessionContext } from './dateInputSession';
import type { DateInputCommitResult } from './dateInputSession';

let nextDateInputId = 0;
const useDateLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

export interface DateInputProps {
  readonly label: string;
  readonly value: string;
  readonly errorMessage?: string;
  readonly disabled?: boolean;
  readonly onChange: (value: string) => void;
  readonly locale?: 'de' | 'fr';
  readonly name?: string;
  readonly resetKey?: string | number;
  readonly onDraftChange?: () => void;
}

const messages = {
  de: {
    placeholder: 'TT.MM.JJJJ', calendar: 'Datum im Kalender wählen', help: 'Hilfe zur Datumseingabe',
    cancel: 'Abbrechen', close: 'Schliessen', clear: 'Datum leeren',
    format: 'Bitte ein Datum als TT.MM.JJJJ, Tag oder Tag.Monat eingeben.',
    date: 'Dieses Datum gibt es nicht. Bitte die Eingabe prüfen.',
    clock: 'Das heutige Datum kann nicht bestimmt werden. Bitte das vollständige Datum eingeben.',
    helpText: '12 → 12. des aktuellen Monats. 12.10 → 12. Oktober des aktuellen Jahres. h → heute. Mit Tab, Enter oder beim Verlassen des Feldes bestätigen. Kalender: Alt+Pfeil nach unten. Hilfe: F1. Grundlage ist das Datum in der Schweiz (Europe/Zurich). Ein vollständiges Datum benötigt vier Jahresziffern.',
    months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    shortMonths: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    shortDays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], goToToday: 'Heute',
    prevMonthAriaLabel: 'Vorheriger Monat', nextMonthAriaLabel: 'Nächster Monat',
    prevYearAriaLabel: 'Vorheriges Jahr', nextYearAriaLabel: 'Nächstes Jahr',
    prevYearRangeAriaLabel: 'Vorherige Jahre', nextYearRangeAriaLabel: 'Nächste Jahre',
    monthPickerHeaderAriaLabel: '{0}, Jahr wählen', yearPickerHeaderAriaLabel: '{0}, Monat wählen',
    selectedDateFormatString: 'Gewähltes Datum {0}', todayDateFormatString: 'Heutiges Datum {0}'
  },
  fr: {
    placeholder: 'JJ.MM.AAAA', calendar: 'Choisir la date dans le calendrier', help: 'Aide à la saisie de la date',
    cancel: 'Annuler', close: 'Fermer', clear: 'Effacer la date',
    format: 'Saisissez une date au format JJ.MM.AAAA, un jour ou jour.mois.',
    date: 'Cette date n’existe pas. Vérifiez la saisie.',
    clock: 'La date du jour ne peut pas être déterminée. Saisissez la date complète.',
    helpText: '12 → le 12 du mois en cours. 12.10 → le 12 octobre de l’année en cours. a → aujourd’hui (h fonctionne aussi). Validez avec Tab, Entrée ou en quittant le champ. Calendrier : Alt+Flèche bas. Aide : F1. La date de référence est celle de la Suisse (Europe/Zurich). Une date complète nécessite quatre chiffres pour l’année.',
    months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    shortMonths: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
    days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    shortDays: ['di', 'lu', 'ma', 'me', 'je', 've', 'sa'], goToToday: 'Aujourd’hui',
    prevMonthAriaLabel: 'Mois précédent', nextMonthAriaLabel: 'Mois suivant',
    prevYearAriaLabel: 'Année précédente', nextYearAriaLabel: 'Année suivante',
    prevYearRangeAriaLabel: 'Années précédentes', nextYearRangeAriaLabel: 'Années suivantes',
    monthPickerHeaderAriaLabel: '{0}, choisir l’année', yearPickerHeaderAriaLabel: '{0}, choisir le mois',
    selectedDateFormatString: 'Date sélectionnée {0}', todayDateFormatString: 'Date du jour {0}'
  }
};

function calendarDate(iso: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return undefined;
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year!, month! - 1, day!);
  date.setHours(12, 0, 0, 0);
  return date;
}

/** Stable native text editor, with an optional controlled Fluent calendar. */
export function DateInput(props: DateInputProps): React.ReactElement {
  const { label, value, errorMessage, disabled, locale = 'de', name, resetKey } = props;
  const text = messages[locale];
  const id = React.useMemo(() => `fr-native-date-${++nextDateInputId}`, []);
  const session = React.useContext(DateInputSessionContext);
  const latest = React.useRef(props);
  latest.current = props;
  const [draft, setDraft] = React.useState(() => formatDateEntry(value));
  const draftRef = React.useRef(draft);
  const [localError, setLocalError] = React.useState<'format' | 'date' | 'clock'>();
  const [popup, setPopup] = React.useState<'calendar' | 'help'>();
  const popupRef = React.useRef<'calendar' | 'help'>();
  const expectedEcho = React.useRef<string>();
  const observed = React.useRef({ value, resetKey });
  const auxiliaryPointer = React.useRef(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const previousPopup = React.useRef(popup);

  function replaceDraft(next: string): void {
    draftRef.current = next;
    setDraft(next);
  }
  function emit(next: string): void {
    if (latest.current.value !== next) {
      expectedEcho.current = next;
      latest.current.onChange(next);
    }
  }
  function closePopup(): void {
    popupRef.current = undefined;
    auxiliaryPointer.current = false;
    setPopup(undefined);
  }

  const commit = React.useCallback((now: Date): DateInputCommitResult => {
    const current = latest.current;
    const parsed = parseDateEntry(draftRef.current, current.locale ?? 'de', now);
    if (parsed.kind === 'invalid') {
      const message = messages[current.locale ?? 'de'][parsed.reason];
      setLocalError(parsed.reason);
      emit('');
      return { value: '', errorMessage: message };
    }
    setLocalError(undefined);
    const next = parsed.kind === 'valid' ? parsed.value : '';
    replaceDraft(parsed.kind === 'valid' ? parsed.display : '');
    emit(next);
    return { value: next };
  }, []);

  useDateLayoutEffect(() => {
    const reset = observed.current.resetKey !== resetKey;
    const changed = observed.current.value !== value;
    observed.current = { value, resetKey };
    if (reset || (changed && expectedEcho.current !== value)) {
      replaceDraft(formatDateEntry(value));
      setLocalError(undefined);
      closePopup();
    }
    if (changed || reset) expectedEcho.current = undefined;
  }, [value, resetKey]);

  useDateLayoutEffect(() => {
    if (!disabled && name && session) return session.register(name, { commit });
    return undefined;
  }, [session, name, disabled, commit]);

  useDateLayoutEffect(() => {
    if (previousPopup.current && !popup && !disabled) inputRef.current?.focus();
    previousPopup.current = popup;
  }, [popup, disabled]);

  function openPopup(next: 'calendar' | 'help'): void {
    popupRef.current = next;
    auxiliaryPointer.current = false;
    setPopup(next);
  }
  function auxiliaryBlur(event: React.FocusEvent<HTMLButtonElement>): void {
    const target = event.relatedTarget as HTMLElement | null;
    if (popupRef.current || target?.id === id || target?.getAttribute('data-date-aux') === id) return;
    auxiliaryPointer.current = false;
    commit(new Date());
  }
  function selectDate(date: Date): void {
    const display = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getFullYear()).padStart(4, '0')}`;
    latest.current.onDraftChange?.();
    replaceDraft(display);
    commit(new Date());
    closePopup();
  }
  const shownError = localError ? text[localError] : errorMessage;
  const parsedForCalendar = popup === 'calendar' ? parseDateEntry(draft, locale, new Date()) : undefined;
  let today: string | undefined;
  if (popup === 'calendar') {
    try { today = zurichToday(new Date()); } catch { /* Absolute date selection remains available without a usable clock. */ }
  }
  const selectedDate = parsedForCalendar?.kind === 'valid' ? calendarDate(parsedForCalendar.value) : calendarDate(value);
  const calendarToday = today ? calendarDate(today) : undefined;

  return (
    <div className={`fr-date-input${disabled ? ' fr-date-input--disabled' : ''}`}>
      <label htmlFor={id}>{label}<span aria-hidden="true"> *</span></label>
      <div className="fr-date-input__controls">
        <input
          ref={inputRef} id={id} name={name} type="text" inputMode="text" autoComplete="off" autoCapitalize="none" spellCheck={false}
          required disabled={disabled} value={draft} placeholder={text.placeholder}
          aria-keyshortcuts="Alt+ArrowDown F1"
          aria-invalid={Boolean(shownError)} aria-describedby={shownError ? `${id}-error` : undefined}
          onChange={event => {
            replaceDraft(event.currentTarget.value);
            setLocalError(undefined);
            auxiliaryPointer.current = false;
            latest.current.onDraftChange?.();
          }}
          onKeyDown={event => {
            if (!event.nativeEvent.isComposing && (event.key === 'F1' || (event.key === 'ArrowDown' && event.altKey))) {
              event.preventDefault();
              openPopup(event.key === 'F1' ? 'help' : 'calendar');
              return;
            }
            if ((event.key === 'Enter' || event.key === 'Tab') && !event.nativeEvent.isComposing) {
              if (event.key === 'Enter') event.preventDefault();
              commit(new Date());
            }
          }}
          onBlur={event => {
            const target = event.relatedTarget as HTMLElement | null;
            if (popupRef.current || auxiliaryPointer.current || target?.getAttribute('data-date-aux') === id) return;
            commit(new Date());
          }}
        />
        <button type="button" className="fr-date-input__aux" disabled={disabled} tabIndex={-1}
          aria-label={`${text.calendar}: ${label}`} title={`${text.calendar} (Alt+↓)`} data-date-aux={id}
          aria-haspopup="dialog" aria-expanded={popup === 'calendar'}
          onPointerDown={() => { auxiliaryPointer.current = true; }} onPointerCancel={() => { auxiliaryPointer.current = false; }}
          onBlur={auxiliaryBlur}
          onClick={() => openPopup('calendar')}>
          <svg aria-hidden="true" focusable="false" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18M7 14h3M14 14h3M7 18h3" />
          </svg>
        </button>
        <button type="button" className="fr-date-input__aux fr-date-input__help" disabled={disabled} tabIndex={-1}
          aria-label={`${text.help}: ${label}`} title={`${text.help} (F1)`} data-date-aux={id}
          aria-haspopup="dialog" aria-expanded={popup === 'help'}
          onPointerDown={() => { auxiliaryPointer.current = true; }} onPointerCancel={() => { auxiliaryPointer.current = false; }}
          onBlur={auxiliaryBlur}
          onClick={() => openPopup('help')}><span aria-hidden="true">?</span></button>
      </div>
      {shownError && <p id={`${id}-error`} role="alert" className="fr-date-input__error">{shownError}</p>}
      {popup && <Dialog hidden={false} onDismiss={closePopup} minWidth={280} maxWidth={420}
        dialogContentProps={{ type: DialogType.normal, title: popup === 'calendar' ? text.calendar : text.help, closeButtonAriaLabel: text.close }}
        modalProps={{ isBlocking: false, className: 'fr-date-dialog' }}>
        {popup === 'help' ? <p>{text.helpText}</p> : !calendarToday ? <p role="alert">{text.clock}</p> : <Calendar
          value={selectedDate ?? calendarToday} today={calendarToday} firstDayOfWeek={DayOfWeek.Monday}
          strings={text} showMonthPickerAsOverlay showGoToToday onSelectDate={selectDate}
          dateTimeFormatter={{
            formatDay: date => String(date.getDate()), formatMonth: date => text.months[date.getMonth()]!,
            formatYear: date => String(date.getFullYear()),
            formatMonthDayYear: date => `${date.getDate()}. ${text.months[date.getMonth()]} ${date.getFullYear()}`,
            formatMonthYear: date => `${text.months[date.getMonth()]} ${date.getFullYear()}`
          }}
        />}
        <DialogFooter>
          {popup === 'calendar' && <DefaultButton text={text.clear} onClick={() => {
            latest.current.onDraftChange?.(); replaceDraft(''); commit(new Date()); closePopup();
          }} />}
          <DefaultButton text={popup === 'calendar' ? text.cancel : text.close} onClick={closePopup} />
        </DialogFooter>
      </Dialog>}
    </div>
  );
}
