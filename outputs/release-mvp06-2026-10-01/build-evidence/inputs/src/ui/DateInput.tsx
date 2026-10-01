// SPDX-License-Identifier: AGPL-3.0-only
import * as React from 'react';

let nextDateInputId = 0;

interface DateInputProps {
  readonly label: string;
  readonly value: string;
  readonly errorMessage?: string;
  readonly disabled?: boolean;
  readonly onChange: (value: string) => void;
}

// Native ISO date input. Unlike Fluent v8 TextField it does not re-render on focus,
// which can reset Chromium's focused date editor before a value is committed.
export function DateInput({ label, value, errorMessage, disabled, onChange }: DateInputProps): React.ReactElement {
  const id = React.useMemo(() => `fr-native-date-${++nextDateInputId}`, []);
  return (
    <div className={`fr-date-input${disabled ? ' fr-date-input--disabled' : ''}`}>
      <label htmlFor={id}>{label}<span aria-hidden="true"> *</span></label>
      <input
        id={id}
        type="date"
        required
        disabled={disabled}
        value={value}
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        onChange={event => onChange(event.currentTarget.value)}
      />
      {errorMessage && <p id={`${id}-error`} className="fr-date-input__error">{errorMessage}</p>}
    </div>
  );
}
