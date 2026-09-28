// SPDX-License-Identifier: AGPL-3.0-only

import type { CalculationData, SpecialRegimeCatalog } from '../core';
import { hasSocialUi, socialUiPath, socialUiSelection } from './socialUi';

export type VrpgArea = '' | 'general' | 'social' | 'political' | 'procurement';
export interface VrpgSelectionState {
  readonly area: VrpgArea;
  readonly law: string;
  readonly action: string;
  readonly stage: string;
}

export interface VrpgChoice {
  readonly key: string;
  readonly labels: { readonly de: string; readonly fr: string };
}

export interface VrpgSelectionResolution {
  readonly kind: 'incomplete' | 'unavailable' | 'general' | 'special' | 'social';
  readonly regimeId: string;
  readonly definitionId: string;
  readonly reason?: 'missingSelection' | 'invalidSelection' | 'notReleased';
}

export const EMPTY_VRPG_SELECTION: VrpgSelectionState = Object.freeze({ area: '', law: '', action: '', stage: '' });

const choice = (key: string, de: string, fr: string): VrpgChoice => ({ key, labels: { de, fr } });
const PLACEHOLDER = choice('', 'Bitte wählen', 'Veuillez choisir');
const GENERAL = { regimeId: 'vrpg-be-general', definitionId: 'VRPGBE-SPEC-REL-GENERAL-001' } as const;

// Reviewed AP17B mappings are explicit. Loading a similarly named data item must
// never turn an unqualified court/tender pathway into a supported calculation.
const QUALIFIED_MAPPINGS: readonly { readonly id: string; readonly selection: VrpgSelectionState }[] = [
  ...(['ivg', 'ahvg', 'uvg'] as const).flatMap((law, index) => {
    const prefix = ['SOC-IV', 'SOC-AHV', 'SOC-UV'][index]!;
    return [
      { id: `${prefix}-${law === 'ivg' ? 'PRE' : 'OBJ'}`, selection: { area: 'social' as const, law, action: law === 'ivg' ? 'preliminary-objection' : 'objection', stage: '' } },
      { id: `${prefix}-APP`, selection: { area: 'social' as const, law, action: 'appeal', stage: '' } },
      { id: `${prefix}-ADM`, selection: { area: 'social' as const, law, action: 'ongoing', stage: 'administration' } },
      { id: `${prefix}-CORRECTION`, selection: { area: 'social' as const, law, action: 'complaint-correction', stage: '' } }
    ];
  }),
  { id: 'PROC-APPEAL', selection: { area: 'procurement', law: 'ivob', action: 'appeal', stage: '' } },
  { id: 'PROC-APPEAL-SECOND', selection: { area: 'procurement', law: 'ivob', action: 'appeal-second-instance', stage: '' } },
  { id: 'PROC-INTERNAL-DAYS', selection: { area: 'procurement', law: 'ivob', action: 'ongoing', stage: 'administrative-appeal' } },
  { id: 'PROC-COURT-DAYS', selection: { area: 'procurement', law: 'ivob', action: 'ongoing', stage: 'court' } }
];

export function qualifiedMappingId(selection: VrpgSelectionState): string | undefined {
  return QUALIFIED_MAPPINGS.find(mapping => (['area', 'law', 'action', 'stage'] as const)
    .every(key => mapping.selection[key] === selection[key]))?.id;
}

interface PoliticalMapping {
  readonly law: 'federal' | 'cantonal' | 'communal';
  readonly regimeId: string;
  readonly definitionId: string;
  readonly labels?: VrpgChoice['labels'];
}

// Deliberately exhaustive for the approved selectable catalogue. A new regime does
// not become selectable merely because its ID, law code or label resembles one here.
const POLITICAL_MAPPINGS: readonly PoliticalMapping[] = [
  { law: 'cantonal', regimeId: 'prg-be-68-grand-council-nomination', definitionId: 'PRGBE-SPEC-OFFSET-068' },
  { law: 'cantonal', regimeId: 'prg-be-74-multiple-nomination', definitionId: 'PRGBE-SPEC-OFFSET-074' },
  { law: 'cantonal', regimeId: 'prg-be-75-list-correction', definitionId: 'PRGBE-SPEC-OFFSET-075' },
  { law: 'cantonal', regimeId: 'prg-be-79-list-connection', definitionId: 'PRGBE-SPEC-OFFSET-075' },
  { law: 'cantonal', regimeId: 'prg-be-98-majority-nomination', definitionId: 'PRGBE-SPEC-OFFSET-098' },
  { law: 'cantonal', regimeId: 'prg-be-101-withdrawal', definitionId: 'PRGBE-SPEC-OFFSET-101' },
  { law: 'cantonal', regimeId: 'prg-be-110-second-ballot-withdrawal', definitionId: 'PRGBE-SPEC-WEEKDAY-110' },
  { law: 'cantonal', regimeId: 'prg-be-111a-replacement-candidacy', definitionId: 'PRGBE-SPEC-WEEKDAY-111' },
  {
    law: 'cantonal', regimeId: 'prg-be-117-prefect-nomination', definitionId: 'PRGBE-SPEC-OFFSET-098',
    labels: { de: 'Regierungsstatthalterwahl: Wahlvorschläge', fr: 'Élection préfectorale: propositions de candidatures' }
  },
  {
    law: 'cantonal', regimeId: 'prg-be-117-prefect-nomination', definitionId: 'PRGBE-SPEC-OFFSET-101',
    labels: { de: 'Regierungsstatthalterwahl: Rückzug von Wahlvorschlägen', fr: 'Élection préfectorale: retrait des propositions de candidatures' }
  },
  {
    law: 'cantonal', regimeId: 'prg-be-121-prefect-second-ballot', definitionId: 'PRGBE-SPEC-TUESDAY-121',
    labels: { de: 'Regierungsstatthalterwahl: Mitteilung am ersten Dienstag nach dem ersten Wahlgang', fr: 'Élection préfectorale: communication le premier mardi après le premier tour' }
  },
  {
    law: 'cantonal', regimeId: 'prg-be-121-prefect-second-ballot', definitionId: 'PRGBE-SPEC-THURSDAY-121',
    labels: { de: 'Regierungsstatthalterwahl: Rückzug oder Ersatzvorschlag am ersten Donnerstag nach dem ersten Wahlgang', fr: 'Élection préfectorale: retrait ou candidature de remplacement le premier jeudi après le premier tour' }
  },
  { law: 'cantonal', regimeId: 'prg-be-130-referendum-signatures', definitionId: 'PRGBE-SPEC-REL-130' },
  { law: 'cantonal', regimeId: 'prg-be-147-initiative-signatures', definitionId: 'PRGBE-SPEC-REL-147' },
  { law: 'cantonal', regimeId: 'prg-be-165-political-rights-complaint', definitionId: 'PRGBE-SPEC-DUAL-165' },
  { law: 'communal', regimeId: 'vrpg-be-67a-1-municipal-election', definitionId: 'VRPGBE-SPEC-REL-671' },
  { law: 'communal', regimeId: 'vrpg-be-67a-2-municipal-vote', definitionId: 'VRPGBE-SPEC-REL-672' },
  { law: 'communal', regimeId: 'vrpg-be-67a-3-preparatory-act', definitionId: 'VRPGBE-SPEC-REL-673' },
  { law: 'communal', regimeId: 'vrpg-be-81-2-municipal-appeal', definitionId: 'VRPGBE-SPEC-REL-081' },
  { law: 'federal', regimeId: 'bgg-100-3b-federal-vote', definitionId: 'BGG-SPEC-REL-103' }
];

function actionKey(mapping: PoliticalMapping): string {
  return `${mapping.regimeId}::${mapping.definitionId}`;
}

function catalogForSelection(data: CalculationData): SpecialRegimeCatalog | undefined {
  if (!data.profiles.has('vrpg-be')) return undefined;
  const catalogs = [...data.specialRegimeCatalogs.values()].filter(catalog => catalog.profileId === 'vrpg-be');
  return catalogs.length === 1 ? catalogs[0] : undefined;
}

function approvedPair(data: CalculationData, regimeId: string, definitionId: string): boolean {
  const catalog = catalogForSelection(data);
  const regimes = catalog?.regimes.filter(regime => regime.regimeId === regimeId) ?? [];
  const definitions = catalog?.deadlineDefinitions.filter(definition => definition.deadlineDefinitionId === definitionId) ?? [];
  const regime = regimes.length === 1 ? regimes[0] : undefined;
  const definition = definitions.length === 1 ? definitions[0] : undefined;
  const qualified = QUALIFIED_MAPPINGS.find(mapping => regimeId === `ap17c-${mapping.id.toLowerCase()}`
    && definitionId === `AP17C-${mapping.id}-001`);
  const qualifiedPair = catalog?.formatVersion === '3.0.0' && qualified
    && definition?.deadlineOrigin === 'CALCULATED'
    && definition.applicability?.mappingId === qualified.id
    && (['area', 'law', 'action', 'stage'] as const)
      .every(key => definition.applicability?.selection[key] === qualified.selection[key]);
  return regime?.status === 'supported'
    && (regime.implementationScope === 'mvp02' || (regime.implementationScope === 'followup' && Boolean(qualifiedPair)))
    && regime.uiExposure === 'visible'
    && regime.regimeKind !== 'filingOverlay'
    && regime.deadlineDefinitionIds.includes(definitionId)
    && definition?.status === 'supported'
    && definition.deadlineOrigin === 'CALCULATED';
}

export function isQualifiedRegimeSelectable(data: CalculationData, regimeId: string): boolean {
  const mapping = QUALIFIED_MAPPINGS.find(item => regimeId === `ap17c-${item.id.toLowerCase()}`);
  return Boolean(mapping && approvedPair(data, regimeId, `AP17C-${mapping.id}-001`));
}

export function vrpgAreaOptions(): VrpgChoice[] {
  return [PLACEHOLDER,
    choice('general', 'Allgemeines Verwaltungsrecht', 'Droit administratif général'),
    choice('social', 'Sozialversicherungsrecht', 'Droit des assurances sociales'),
    choice('political', 'Politische Rechte', 'Droits politiques'),
    choice('procurement', 'Beschaffungsrecht', 'Marchés publics')];
}

export function vrpgLawOptions(selection: VrpgSelectionState, data?: CalculationData): VrpgChoice[] {
  switch (selection.area) {
    case 'social': return [PLACEHOLDER,
      choice('ivg', 'Invalidenversicherung (IVG)', 'Assurance-invalidité (LAI)'),
      choice('ahvg', 'Alters- und Hinterlassenenversicherung (AHVG)', 'Assurance-vieillesse et survivants (LAVS)'),
      choice('uvg', 'Unfallversicherung (UVG)', 'Assurance-accidents (LAA)'),
      ...(data && hasSocialUi(data)
        ? [choice('elg', 'Ergänzungsleistungen (ELG)', 'Prestations complémentaires (LPC)')] : []),
      ...(data && socialUiPath(data, { area: 'social', law: 'avig', action: 'objection', stage: '' })
        ? [choice('avig', 'Arbeitslosenversicherung (AVIG) · Arbeitslosenentschädigung', 'Assurance-chômage (LACI) · indemnité de chômage')] : []),
      ...(data && socialUiPath(data, { area: 'social', law: 'kvg', action: 'objection', stage: '' })
        ? [choice('kvg', 'Krankenversicherung (KVG) · individuelle OKP-Leistungen', 'Assurance-maladie (LAMal) · prestations individuelles AOS')] : [])];
    case 'political': return [PLACEHOLDER,
      choice('federal', 'Eidgenössische Angelegenheit', 'Affaire fédérale'),
      choice('cantonal', 'Kantonale Angelegenheit', 'Affaire cantonale'),
      choice('communal', 'Kommunale Angelegenheit', 'Affaire communale')];
    case 'procurement': return [PLACEHOLDER, choice('ivob', 'IVöB · Kanton Bern', 'AIMP · Canton de Berne')];
    default: return [];
  }
}

export function vrpgActionOptions(data: CalculationData, selection: VrpgSelectionState): VrpgChoice[] {
  if (!selection.law || !vrpgLawOptions(selection, data).some(option => option.key === selection.law)) return [];
  switch (selection.area) {
    case 'social': return [PLACEHOLDER,
      selection.law === 'ivg'
        ? choice('preliminary-objection', 'Einwand gegen Vorbescheid', 'Observations sur un préavis')
        : choice('objection', 'Einsprache gegen Verfügung', 'Opposition à une décision'),
      hasSocialUi(data)
        ? selection.law === 'ivg'
          ? choice('appeal', 'Beschwerde gegen Verfügung', 'Recours contre une décision')
          : choice('appeal', 'Beschwerde gegen Einspracheentscheid', 'Recours contre une décision sur opposition')
        : choice('appeal', 'Beschwerde ans Versicherungsgericht', 'Recours au tribunal des assurances'),
      choice('complaint-correction', 'Nachfrist zur Verbesserung der Beschwerde', 'Délai supplémentaire pour corriger le recours'),
      choice('ongoing', 'Eingabe im laufenden Verfahren', 'Écriture dans une procédure en cours')];
    case 'procurement': return [PLACEHOLDER,
      choice('appeal', 'Beschwerde gegen Zuschlag', 'Recours contre l’adjudication'),
      choice('appeal-second-instance', 'Weiterzug des Beschwerdeentscheids', 'Recours contre la décision sur recours'),
      choice('ongoing', 'Eingabe im laufenden Verfahren', 'Écriture dans une procédure en cours')];
    case 'political': {
      const catalog = catalogForSelection(data);
      return [PLACEHOLDER, ...POLITICAL_MAPPINGS
        .filter(mapping => mapping.law === selection.law && approvedPair(data, mapping.regimeId, mapping.definitionId))
        .map(mapping => ({
          key: actionKey(mapping),
          labels: mapping.labels ?? catalog!.regimes.find(regime => regime.regimeId === mapping.regimeId)!.labels
        }))];
    }
    default: return [];
  }
}

/** Only the explicitly scoped, sole supported federal political action is fixed. */
export function vrpgFixedAction(data: CalculationData, selection: VrpgSelectionState): VrpgChoice | undefined {
  if (selection.area !== 'political' || selection.law !== 'federal') return undefined;
  const actions = vrpgActionOptions(data, selection).filter(option => option.key !== '');
  return actions.length === 1 ? actions[0] : undefined;
}

export function vrpgStageOptions(selection: VrpgSelectionState, data?: CalculationData): VrpgChoice[] {
  if (selection.action !== 'ongoing'
    || !selection.law
    || !vrpgLawOptions(selection, data).some(option => option.key === selection.law)) return [];
  if (selection.area === 'social') return [PLACEHOLDER,
    choice('administration', 'Verwaltungsverfahren', 'Procédure administrative'),
    choice('court', 'Versicherungsgerichtliches Verfahren', 'Procédure devant le tribunal des assurances')];
  if (selection.area === 'procurement') return [PLACEHOLDER,
    choice('administration', 'Vergabeverfahren', 'Procédure d’adjudication'),
    choice('administrative-appeal', 'Verwaltungsinternes Beschwerdeverfahren', 'Procédure de recours interne à l’administration'),
    choice('court', 'Gerichtliches Beschwerdeverfahren', 'Procédure de recours judiciaire')];
  return [];
}

function blocked(kind: 'incomplete' | 'unavailable', reason: VrpgSelectionResolution['reason']): VrpgSelectionResolution {
  return { kind, regimeId: '', definitionId: '', ...(reason ? { reason } : {}) };
}

export function resolveVrpgSelection(data: CalculationData, selection: VrpgSelectionState): VrpgSelectionResolution {
  if (!selection.area) return blocked('incomplete', 'missingSelection');
  if (!vrpgAreaOptions().some(option => option.key === selection.area)) return blocked('unavailable', 'invalidSelection');
  if (selection.area === 'general') {
    if (selection.law || selection.action || selection.stage) return blocked('unavailable', 'invalidSelection');
    return approvedPair(data, GENERAL.regimeId, GENERAL.definitionId)
      ? { kind: 'general', ...GENERAL }
      : blocked('unavailable', 'notReleased');
  }
  if (!selection.law) return blocked('incomplete', 'missingSelection');
  if (!vrpgLawOptions(selection, data).some(option => option.key === selection.law)) return blocked('unavailable', 'invalidSelection');
  if (!selection.action) return blocked('incomplete', 'missingSelection');
  if (selection.area === 'political') {
    const mapping = POLITICAL_MAPPINGS.find(item => item.law === selection.law && actionKey(item) === selection.action);
    if (!mapping || selection.stage) return blocked('unavailable', 'invalidSelection');
    return approvedPair(data, mapping.regimeId, mapping.definitionId)
      ? { kind: 'special', regimeId: mapping.regimeId, definitionId: mapping.definitionId }
      : blocked('unavailable', 'notReleased');
  }
  if (!vrpgActionOptions(data, selection).some(option => option.key === selection.action)) return blocked('unavailable', 'invalidSelection');
  const stages = vrpgStageOptions(selection, data);
  if (stages.length && !selection.stage) return blocked('incomplete', 'missingSelection');
  if (selection.stage && !stages.some(option => option.key === selection.stage)) return blocked('unavailable', 'invalidSelection');
  if (selection.area === 'social' && data.formatVersion === '5.0.0') {
    // Format 5 social selections never fall back to an AP17 or general entry.
    return socialUiPath(data, selection)
      ? { kind: 'social', regimeId: '', definitionId: '' }
      : blocked('unavailable', 'notReleased');
  }
  const mappingId = qualifiedMappingId(selection);
  const regimeId = mappingId ? `ap17c-${mappingId.toLowerCase()}` : '';
  const definitionId = mappingId ? `AP17C-${mappingId}-001` : '';
  if (mappingId && approvedPair(data, regimeId, definitionId)) {
    return { kind: 'special', regimeId, definitionId };
  }
  // Neither absent candidate data nor a broad ongoing/court/tender choice falls
  // back to general VRPG. The central core gate also checks case prerequisites.
  return blocked('unavailable', 'notReleased');
}

function selectedValue(value: unknown, options: readonly VrpgChoice[]): string {
  return typeof value === 'string' && options.some(option => option.key === value) ? value : '';
}

export function sanitizeVrpgSelection(data: CalculationData, candidate: unknown): VrpgSelectionState {
  if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) return { ...EMPTY_VRPG_SELECTION };
  const raw = candidate as Record<string, unknown>;
  const area = selectedValue(raw.area, vrpgAreaOptions()) as VrpgArea;
  const base = { ...EMPTY_VRPG_SELECTION, area };
  const law = selectedValue(raw.law, vrpgLawOptions(base, data));
  const withLaw = { ...base, law };
  const fixedAction = vrpgFixedAction(data, withLaw);
  const action = fixedAction && (raw.action === '' || raw.action === undefined)
    ? fixedAction.key
    : selectedValue(raw.action, vrpgActionOptions(data, withLaw));
  const withAction = { ...withLaw, action };
  return { ...withAction, stage: selectedValue(raw.stage, vrpgStageOptions(withAction, data)) };
}

export function changeVrpgSelection(
  data: CalculationData,
  current: VrpgSelectionState,
  field: keyof VrpgSelectionState,
  value: string
): VrpgSelectionState {
  const clean = sanitizeVrpgSelection(data, current);
  if (clean[field] === value) return clean;
  const next = field === 'area' ? { area: value, law: '', action: '', stage: '' }
    : field === 'law' ? { ...clean, law: value, action: '', stage: '' }
      : field === 'action' ? { ...clean, action: value, stage: '' }
        : { ...clean, stage: value };
  return sanitizeVrpgSelection(data, next);
}

export function selectionFromLegacy(data: CalculationData, regimeId: string, definitionId: string): VrpgSelectionState {
  if (!regimeId) return { ...EMPTY_VRPG_SELECTION };
  if (data.formatVersion === '5.0.0') {
    const socialMapping = QUALIFIED_MAPPINGS.find(mapping => mapping.selection.area === 'social'
      && regimeId === `ap17c-${mapping.id.toLowerCase()}`
      && definitionId === `AP17C-${mapping.id}-001`);
    if (socialMapping && socialUiSelection(data, socialMapping.selection)) {
      // Explicit twelve-row selection migration only, never fact or approval migration.
      return { ...socialMapping.selection };
    }
  }
  if (regimeId === GENERAL.regimeId
    && (!definitionId || definitionId === GENERAL.definitionId)
    && approvedPair(data, GENERAL.regimeId, GENERAL.definitionId)) {
    return { ...EMPTY_VRPG_SELECTION, area: 'general' };
  }
  const matches = POLITICAL_MAPPINGS.filter(mapping => mapping.regimeId === regimeId
    && (!definitionId || mapping.definitionId === definitionId)
    && approvedPair(data, mapping.regimeId, mapping.definitionId));
  // A missing definition is unambiguous only for a single supported pair.
  // Never silently replace one of a multi-definition regime's choices.
  const mapping = matches.length === 1 ? matches[0] : undefined;
  return mapping
    ? { area: 'political', law: mapping.law, action: actionKey(mapping), stage: '' }
    : { ...EMPTY_VRPG_SELECTION };
}
