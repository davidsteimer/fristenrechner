// SPDX-License-Identifier: AGPL-3.0-only

import type { IsoDate } from './types';
import type { SpecialDeadlineInput, SpecialSourceReference } from './specialTypes';

/**
 * Applicability input, never persistent defaults or a general confirmation checkbox.
 * In displayed-model-scope mode, matter and triggerKind describe visible model
 * prerequisites. They do not claim that the user confirmed these case facts.
 */
export interface QualifiedDeadlineInput {
  readonly mappingId: string;
  /** Absent preserves the original confirmed-case-facts contract. */
  readonly qualificationBasis?: 'confirmed-case-facts' | 'displayed-model-scope';
  readonly legalTriggerDate: IsoDate;
  readonly authorityCode: string;
  readonly matter: string;
  readonly deadlineForm: string;
  readonly triggerKind: string;
  readonly holidayCanton: string;
  readonly holidayAnchorConfirmed: boolean;
  /** False remains false when the model supplies its sole supported channel. */
  readonly notificationConfirmed: boolean;
  readonly notificationChannel?: string;
  readonly procedureStartDate?: IsoDate;
  readonly days?: number;
}

/** Versioned legal prerequisites, evaluated by the core before any day counting. */
export interface QualifiedApplicability {
  readonly mappingId: string;
  readonly selection: {
    readonly area: 'social' | 'procurement';
    readonly law: string;
    readonly action: string;
    readonly stage: string;
  };
  readonly authorityCode: 'BE';
  readonly matter: string;
  readonly deadlineForm: 'days';
  readonly triggerKind: string;
  readonly holidayCanton: 'BE';
  readonly holidayPolicy: 'partyOrRepresentative' | 'bern';
  readonly notificationChannels: readonly string[];
  readonly procedureStartOnOrAfter: IsoDate | null;
  /** Technical candidate coverage, not the legal entry into force or repeal date. */
  readonly caseCoverageFrom: IsoDate;
  readonly caseCoverageTo: IsoDate | null;
  readonly sourceRefs: readonly SpecialSourceReference[];
}

export interface QualifiedCalculationEvidence {
  readonly mappingId: string;
  readonly calendarStart: IsoDate;
  readonly firstCountedDay: IsoDate;
  readonly suspensionDays: number;
  readonly rollDays: number;
  readonly sourceRefs: readonly SpecialSourceReference[];
}

export type QualifiedDeadlineResolution = {
  readonly outcome: 'resolved';
  readonly specialInput: SpecialDeadlineInput;
  readonly mapping: QualifiedApplicability;
  readonly days: number;
} | {
  readonly outcome: 'blocked';
  readonly blockReasonKeys: readonly string[];
};
