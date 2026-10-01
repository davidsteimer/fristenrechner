// SPDX-License-Identifier: AGPL-3.0-only

import type { QualifiedDeadlineInput } from '../core/qualifiedTypes';
import { qualifiedMappingId, type VrpgChoice, type VrpgSelectionState } from './vrpgSelection';

/** Only genuine case choices. Displayed model prerequisites are derived, never saved here. */
export interface VrpgContextState {
  readonly notificationChannel: string;
  readonly holidayConnections: string;
  readonly procedureStartDate: string;
}

export const EMPTY_VRPG_CONTEXT: VrpgContextState = Object.freeze({
  notificationChannel: '', holidayConnections: '', procedureStartDate: ''
});

const option = (key: string, de: string, fr: string): VrpgChoice => ({ key, labels: { de, fr } });
const PLEASE_CHOOSE = option('', 'Bitte wählen', 'Veuillez choisir');
const OTHER = option('otherOrUnclear', 'Andere oder noch ungeklärte Konstellation', 'Autre situation ou situation non clarifiée');

export function vrpgMatterOptions(selection: VrpgSelectionState): VrpgChoice[] {
  if (selection.area === 'social') {
    const supported = {
      ivg: option('iv-individual-benefits', 'Individuelle IV-Versicherungsleistungen', 'Prestations individuelles de l’AI'),
      ahvg: option('ahv-individual-benefits', 'Individuelle AHV-Versicherungsleistungen', 'Prestations individuelles de l’AVS'),
      uvg: option('uvg-individual-benefits', 'Individuelle Leistungen der obligatorischen Unfallversicherung', 'Prestations individuelles de l’assurance-accidents obligatoire')
    }[selection.law];
    return supported ? [PLEASE_CHOOSE, supported, OTHER] : [];
  }
  if (selection.area === 'procurement') return [PLEASE_CHOOSE,
    selection.action === 'ongoing'
      ? option('bern-procurement-2019-appeal', 'Beschaffungsbeschwerde nach bernischem IVöB-Recht', 'Recours en matière de marchés publics selon le droit bernois de l’AIMP')
      : option('bern-procurement-2019-award', 'Zuschlag nach bernischem IVöB-Recht', 'Adjudication selon le droit bernois de l’AIMP'),
    OTHER];
  return [];
}

export function vrpgTriggerOptions(selection: VrpgSelectionState): VrpgChoice[] {
  let supported: VrpgChoice | undefined;
  if (selection.area === 'social') {
    if (selection.action === 'preliminary-objection') supported = option('iv-preliminary-notice', 'IV-Vorbescheid über Versicherungsleistungen', 'Préavis de l’AI sur des prestations d’assurance');
    if (selection.action === 'objection') supported = option('initial-benefit-disposition', 'Erstinstanzliche Leistungsverfügung', 'Décision initiale sur des prestations');
    if (selection.action === 'appeal') supported = selection.law === 'ivg'
      ? option('iv-disposition', 'Leistungsverfügung der IV-Stelle Bern', 'Décision de l’Office AI Berne sur des prestations')
      : option('objection-decision', 'Einspracheentscheid, Beschwerde ans Versicherungsgericht Bern', 'Décision sur opposition, recours au Tribunal des assurances du canton de Berne');
    if (selection.action === 'ongoing' && selection.stage === 'administration') supported = option('authority-day-order', 'Behördliche Anordnung einer Anzahl Tage', 'Ordonnance administrative fixant un nombre de jours');
    if (selection.action === 'complaint-correction') supported = option('court-correction-day-order', 'Tagesnachfrist des Versicherungsgerichts Bern zur Beschwerdeverbesserung', 'Délai en jours du Tribunal des assurances du canton de Berne pour corriger le recours');
  }
  if (selection.area === 'procurement') {
    if (selection.action === 'appeal') supported = option('disposition', 'Zuschlagsverfügung', 'Décision d’adjudication');
    if (selection.action === 'appeal-second-instance') supported = option('appeal-decision', 'Kantonaler Beschwerdeentscheid über den Zuschlag', 'Décision cantonale sur recours concernant l’adjudication');
    if (selection.action === 'ongoing' && selection.stage === 'administrative-appeal') supported = option('authority-day-order', 'Tagesfrist der verwaltungsinternen Beschwerdeinstanz', 'Délai en jours fixé par l’autorité de recours administrative');
    if (selection.action === 'ongoing' && selection.stage === 'court') supported = option('court-day-order', 'Tagesfrist des kantonalen Beschwerdegerichts', 'Délai en jours fixé par le tribunal cantonal de recours');
  }
  return supported ? [PLEASE_CHOOSE, supported, OTHER] : [];
}

export function vrpgNotificationOptions(selection: VrpgSelectionState): VrpgChoice[] {
  return [PLEASE_CHOOSE,
    option('individual-service', 'Massgebende individuelle Zustellung', 'Notification individuelle déterminante'),
    ...(selection.area === 'procurement' ? [option('official-publication', 'Massgebende amtliche Publikation', 'Publication officielle déterminante')] : []),
    option('unresolved', 'Eröffnung ungeklärt oder Zustellfiktion', 'Notification non clarifiée ou fiction de notification')];
}

/** These values describe the selected model, not independently verified case facts. */
export function vrpgModelScope(selection: VrpgSelectionState): {
  readonly matter: VrpgChoice;
  readonly triggerKind: VrpgChoice;
  readonly notification: VrpgChoice | undefined;
} | undefined {
  if (!qualifiedMappingId(selection)) return undefined;
  const supported = (choices: readonly VrpgChoice[]): VrpgChoice[] => choices
    .filter(choice => !['', 'otherOrUnclear', 'unresolved'].includes(choice.key));
  const matters = supported(vrpgMatterOptions(selection));
  const triggers = supported(vrpgTriggerOptions(selection));
  const notifications = supported(vrpgNotificationOptions(selection));
  // Never silently pick the first value if a future model introduces a real choice.
  if (matters.length !== 1 || triggers.length !== 1) return undefined;
  return { matter: matters[0]!, triggerKind: triggers[0]!,
    notification: notifications.length === 1 ? notifications[0] : undefined };
}

export function vrpgHolidayOptions(): VrpgChoice[] {
  return [PLEASE_CHOOSE,
    option('partyBE', 'Partei im Kanton Bern, ohne Vertretung', 'Partie dans le canton de Berne, sans représentation'),
    option('partyAndRepresentativeBE', 'Partei und Vertretung im Kanton Bern', 'Partie et représentation dans le canton de Berne'),
    OTHER];
}

export function qualifiedStage(selection: VrpgSelectionState): VrpgChoice {
  if (selection.area === 'social') return ['appeal', 'complaint-correction'].includes(selection.action)
    ? option('court', 'Versicherungsgericht des Kantons Bern', 'Tribunal des assurances du canton de Berne')
    : option('administration', 'Versicherungsverwaltung', 'Administration de l’assurance');
  if (selection.action === 'appeal') return option('first-instance', 'Zuständige kantonale Beschwerdeinstanz', 'Instance cantonale de recours compétente');
  if (selection.stage === 'administrative-appeal') return option('administrative-appeal', 'Verwaltungsinternes Beschwerdeverfahren', 'Procédure de recours interne à l’administration');
  return option('court', 'Verwaltungsgericht des Kantons Bern', 'Tribunal administratif du canton de Berne');
}

export function qualifiedInputFromForm(
  selection: VrpgSelectionState,
  context: VrpgContextState,
  authorityCode: string,
  legalTriggerDate: string,
  days?: number
): QualifiedDeadlineInput | undefined {
  const mappingId = qualifiedMappingId(selection);
  const scope = vrpgModelScope(selection);
  if (!mappingId || !scope) return undefined;
  // A stale contradictory channel is rejected by the core, not silently replaced.
  const notificationChannel = scope.notification
    ? context.notificationChannel || scope.notification.key
    : context.notificationChannel;
  const notificationKnown = !scope.notification
    && vrpgNotificationOptions(selection).some(choice => choice.key === notificationChannel)
    && ['individual-service', 'official-publication'].includes(notificationChannel);
  const bernAnchor = selection.area === 'social'
    ? ['partyBE', 'partyAndRepresentativeBE'].includes(context.holidayConnections)
    : authorityCode === 'BE';
  return {
    mappingId,
    qualificationBasis: 'displayed-model-scope',
    legalTriggerDate,
    authorityCode,
    matter: scope.matter.key,
    deadlineForm: 'days',
    triggerKind: scope.triggerKind.key,
    holidayCanton: bernAnchor ? 'BE' : '',
    holidayAnchorConfirmed: bernAnchor,
    notificationConfirmed: notificationKnown,
    notificationChannel,
    ...(selection.area === 'procurement' ? { procedureStartDate: context.procedureStartDate } : {}),
    ...(days !== undefined ? { days } : {})
  };
}
