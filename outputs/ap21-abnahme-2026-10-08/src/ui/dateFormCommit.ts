// SPDX-License-Identifier: AGPL-3.0-only
import type { CalculatorFormState } from './model';
import { EMPTY_VRPG_CONTEXT } from './vrpgQualification';
import type { SocialUiContext } from './socialUi';

export interface CommittedDateInput {
  readonly value: string;
  readonly errorMessage?: string;
}

/** Apply only mounted date fields. Submit uses this snapshot, never a pending React update. */
export function applyDateInputCommits(
  previousForm: CalculatorFormState,
  previousSocialContext: SocialUiContext,
  commits: Readonly<Record<string, CommittedDateInput>>
): { form: CalculatorFormState; socialContext: SocialUiContext; errors: Record<string, string> } {
  let form = previousForm;
  let socialContext = previousSocialContext;
  const errors: Record<string, string> = {};
  for (const [name, commit] of Object.entries(commits)) {
    if (commit.errorMessage) errors[name] = commit.errorMessage;
    if (name === 'inputDate') form = { ...form, inputDate: commit.value };
    else if (name.startsWith('special.')) {
      const inputId = name.slice('special.'.length);
      if (!inputId || ['__proto__', 'constructor', 'prototype'].includes(inputId)) throw new Error('Invalid date field');
      form = { ...form, specialDateValues: { ...form.specialDateValues, [inputId]: commit.value } };
    } else if (name === 'context.procedureStartDate') {
      form = { ...form, vrpgContext: { ...(form.vrpgContext ?? EMPTY_VRPG_CONTEXT), procedureStartDate: commit.value } };
    } else if (name === 'social.jurisdictionDate') socialContext = { ...socialContext, jurisdictionReferenceDate: commit.value };
    else throw new Error(`Unknown date input: ${name}`);
  }
  return { form, socialContext, errors };
}
