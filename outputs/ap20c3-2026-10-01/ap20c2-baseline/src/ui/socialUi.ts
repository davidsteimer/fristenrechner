// SPDX-License-Identifier: AGPL-3.0-only

import type { CalculationData } from '../core';
import type { SocialCantonalBinding, SocialContextRoute, SocialDeadlineInput, SocialFederalRule, SocialProcedureCatalog } from '../core/socialTypes';
import { SOCIAL_CANTONS } from '../core/socialCatalog';
import type { VrpgSelectionState } from './vrpgSelection';

export interface SocialUiSelection {
  readonly catalog: SocialProcedureCatalog;
  readonly rule: SocialFederalRule;
  readonly binding: SocialCantonalBinding;
  readonly route: SocialContextRoute;
}
export interface SocialUiPath {
  readonly catalog: SocialProcedureCatalog;
  readonly rule: SocialFederalRule;
  readonly selections: readonly SocialUiSelection[];
}
export interface SocialUiContext {
  readonly jurisdictionCanton: string;
  readonly partyDomicileCanton: string;
  readonly holidayConnections: string;
  readonly jurisdictionReferenceDate: string;
  readonly decisionOrigin?: string;
  readonly avigJurisdictionCanton?: string;
  readonly eogOfficeType?: string;
  readonly compensationOfficeCanton?: string;
  readonly familyAllowanceOrderCanton?: string;
}
export const EMPTY_SOCIAL_CONTEXT: SocialUiContext = Object.freeze({
  jurisdictionCanton: '', partyDomicileCanton: '', holidayConnections: '', jurisdictionReferenceDate: '',
  decisionOrigin: '', avigJurisdictionCanton: '', eogOfficeType: '', compensationOfficeCanton: '', familyAllowanceOrderCanton: ''
});

/** Explicit integration list. Loading another law does not make it selectable. */
export const SOCIAL_UI_LAWS = ['ivg', 'ahvg', 'uvg', 'elg', 'avig', 'kvg', 'eog', 'famzg', 'flg'] as const;
export function hasSocialUi(data: CalculationData): boolean {
  return ['5.0.0', '6.0.0'].includes(data.formatVersion) && data.socialProcedureCatalogs?.size === 1;
}
export function socialUiPath(data: CalculationData, selection: VrpgSelectionState): SocialUiPath | undefined {
  if (!hasSocialUi(data) || selection.area !== 'social' || !SOCIAL_UI_LAWS.some(law => law === selection.law)) return undefined;
  const suffix = selection.action === 'preliminary-objection' && selection.law === 'ivg' && !selection.stage ? 'PRE'
    : selection.action === 'objection' && selection.law !== 'ivg' && !selection.stage ? 'OBJ'
      : selection.action === 'appeal' && !selection.stage ? 'APP'
        : selection.action === 'complaint-correction' && !selection.stage ? 'CORRECTION'
          : selection.action === 'ongoing' && selection.stage === 'administration' ? 'ADM' : undefined;
  if (!suffix) return undefined;
  const catalog = [...data.socialProcedureCatalogs!.values()][0]!;
  const scope = selection.law === 'avig' ? 'ALE-' : selection.law === 'kvg' ? 'OKP-' : '';
  const rules = catalog.federalRules.filter(rule => rule.ruleId === `CH-SOC-${selection.law.toUpperCase()}-${scope}${suffix}`);
  if (rules.length !== 1 || rules[0]!.status === 'withdrawn') return undefined;
  const rule = rules[0]!;
  const bindings = catalog.cantonalBindings.filter(binding => binding.ruleId === rule.ruleId && binding.ruleRevision === rule.revision
    && binding.procedureContextCanton === 'BE' && binding.entryProfileId === 'vrpg-be');
  const eogCourt = selection.law === 'eog' && rule.stage === 'cantonal-insurance-court';
  if (bindings.length !== (selection.law === 'avig' || eogCourt ? 2 : 1)
    || bindings.some(binding => binding.status === 'withdrawn' || binding.contextRoutes.length !== 1)) return undefined;
  const selections = bindings.map(binding => ({ catalog, rule, binding, route: binding.contextRoutes[0]! }));
  if (selection.law === 'avig' && !['unemploymentFund', 'cantonalEmploymentOffice'].every(origin =>
    selections.filter(item => item.route.requiredFacts.some(fact => fact.factKey === 'decisionOrigin'
      && fact.allowedValues.length === 1 && fact.allowedValues[0] === origin)).length === 1)) return undefined;
  if (eogCourt && !['cantonal', 'nonCantonal'].every(officeType =>
    selections.filter(item => item.route.requiredFacts.some(fact => fact.factKey === 'eogOfficeType'
      && fact.allowedValues.length === 1 && fact.allowedValues[0] === officeType)).length === 1)) return undefined;
  return { catalog, rule, selections };
}

/** A law/action may be visible before its case-specific jurisdiction route is known. */
export function socialUiSelection(data: CalculationData, selection: VrpgSelectionState, decisionOrigin = '', eogOfficeType = ''): SocialUiSelection | undefined {
  const path = socialUiPath(data, selection);
  if (!path) return undefined;
  const eogCourt = path.rule.law === 'eog' && path.rule.stage === 'cantonal-insurance-court';
  if (path.rule.law !== 'avig' && !eogCourt) return path.selections[0];
  const matches = path.selections.filter(item => item.route.requiredFacts.some(fact =>
    fact.factKey === (eogCourt ? 'eogOfficeType' : 'decisionOrigin')
      && fact.allowedValues.includes(eogCourt ? eogOfficeType : decisionOrigin)));
  return matches.length === 1 ? matches[0] : undefined;
}

export function socialNeedsJurisdictionDate(selection: SocialUiSelection): boolean {
  return [...selection.rule.normBindings, ...selection.binding.normBindings]
    .some(norm => norm.temporalSelector === 'jurisdictionReferenceDate');
}
export function socialNeedsPartyDomicile(selection: SocialUiSelection): boolean {
  return selection.route.requiredFacts.some(fact => fact.factKey === 'partyDomicileCanton');
}
/** Domicile-based administration scope is a product boundary, not insurer-seat jurisdiction. */
export function socialUsesDomicileScope(selection: Pick<SocialUiSelection, 'rule'>): boolean {
  return ['kvg', 'eog'].includes(selection.rule.law) && selection.rule.stage === 'administration';
}

/** Only explicit, transient case selection supplies jurisdiction facts. No defaults or authority-seat inference. */
export function socialInputFromUi(
  selection: SocialUiSelection,
  procedureContextCanton: string,
  legalTriggerDate: string,
  orderedDays: string,
  context: SocialUiContext
): SocialDeadlineInput {
  const facts: Partial<Record<keyof SocialDeadlineInput['caseFacts'], string | boolean>> = {};
  const administration = selection.rule.stage === 'administration';
  const caseCanton = socialUsesDomicileScope(selection) ? context.partyDomicileCanton
    : administration && selection.rule.law === 'famzg' ? context.familyAllowanceOrderCanton ?? ''
      : administration && selection.rule.law === 'flg' ? context.compensationOfficeCanton ?? '' : context.jurisdictionCanton;
  if (SOCIAL_CANTONS.includes(caseCanton) && caseCanton === selection.binding.procedureContextCanton) {
    for (const fact of selection.route.requiredFacts) {
      if (fact.factKey === 'competentBodyQualified') facts[fact.factKey] = true;
      else if (fact.factKey === 'partyDomicileCanton') {
        if (SOCIAL_CANTONS.includes(context.partyDomicileCanton)) facts[fact.factKey] = context.partyDomicileCanton;
      }
      else if (selection.rule.law === 'avig' && fact.factKey === 'decisionOrigin') {
        if (context.decisionOrigin) facts[fact.factKey] = context.decisionOrigin;
      }
      else if (selection.rule.law === 'avig' && selection.rule.stage === 'cantonal-insurance-court'
        && (fact.factKey === 'avigControlCanton' || fact.factKey === 'avigOfficeCanton')) {
        if (SOCIAL_CANTONS.includes(context.avigJurisdictionCanton ?? '')) facts[fact.factKey] = context.avigJurisdictionCanton!;
      }
      else if (fact.factKey === 'eogOfficeType') {
        if (context.eogOfficeType) facts[fact.factKey] = context.eogOfficeType;
      }
      else if (fact.factKey === 'compensationOfficeCanton') {
        if (SOCIAL_CANTONS.includes(context.compensationOfficeCanton ?? '')) facts[fact.factKey] = context.compensationOfficeCanton!;
      }
      else if (fact.factKey === 'familyAllowanceOrderCanton') {
        if (SOCIAL_CANTONS.includes(context.familyAllowanceOrderCanton ?? '')) facts[fact.factKey] = context.familyAllowanceOrderCanton!;
      }
      else if (fact.factKey.endsWith('Canton')) facts[fact.factKey] = context.jurisdictionCanton;
      else if (fact.allowedValues.length === 1 && (fact.factKey === 'decisionOrigin' || fact.factKey === 'jurisdictionSpecialCase')) {
        facts[fact.factKey] = fact.allowedValues[0]!;
      }
    }
  }
  const calendars = selection.binding.calendarBindings.filter(binding => binding.holidayCanton === 'BE'
    && binding.requiredAnchorRoles.length === 1 && binding.requiredAnchorRoles[0] === 'party');
  const calendar = calendars.length === 1 ? calendars[0] : undefined;
  const holidayKnown = Boolean(calendar && ['partyBE', 'partyAndRepresentativeBE'].includes(context.holidayConnections));
  const roles: ('party' | 'representative')[] = context.holidayConnections === 'partyAndRepresentativeBE'
    ? ['party', 'representative'] : ['party'];
  return {
    ruleId: selection.rule.ruleId,
    bindingId: selection.binding.bindingId,
    contextRouteId: selection.route.contextRouteId,
    procedureContextCanton,
    caseFacts: facts,
    qualificationBasis: 'displayed-model-scope',
    matter: selection.rule.matter,
    triggerKind: selection.rule.triggerKind,
    notificationChannel: 'individual-service',
    notificationConfirmed: false,
    legalTriggerDate,
    ...(socialNeedsJurisdictionDate(selection) ? { jurisdictionReferenceDate: context.jurisdictionReferenceDate } : {}),
    holidayResolution: {
      status: holidayKnown ? 'resolved' : 'unknown',
      anchors: holidayKnown ? roles.map(role => ({ role, canton: calendar!.holidayCanton, spatialScopeId: calendar!.spatialScopeId })) : [],
      calendarBindingId: calendar?.calendarBindingId ?? ''
    },
    ...(selection.rule.calculation.durationInputId ? { days: orderedDays.trim() ? Number(orderedDays) : Number.NaN } : {})
  };
}

export function socialJurisdictionLabel(selection: Pick<SocialUiSelection, 'rule'>, decisionOrigin = ''): string {
  return selection.rule.stage === 'cantonal-insurance-court' ? 'social.jurisdiction.court'
    : selection.rule.law === 'avig' ? !decisionOrigin ? 'social.jurisdiction.administration'
      : decisionOrigin === 'unemploymentFund' ? 'social.avig.controlCanton' : 'social.avig.officeCanton'
    : selection.rule.law === 'ivg' ? 'social.jurisdiction.ivg'
    : selection.rule.law === 'ahvg' ? 'social.jurisdiction.ahvg'
      : 'social.jurisdiction.administration';
}

export function socialJurisdictionDateLabel(selection: SocialUiSelection): string {
  return selection.rule.law !== 'avig' ? 'social.jurisdictionDate'
    : selection.rule.action === 'ordered-administrative-days' ? 'social.avig.currentJurisdictionDate' : 'social.avig.dispositionDate';
}

export function socialScopeKey(selection: SocialUiSelection): string {
  if (selection.rule.law === 'eog' && selection.rule.stage === 'cantonal-insurance-court') {
    const officeType = selection.route.requiredFacts.find(fact => fact.factKey === 'eogOfficeType')?.allowedValues[0];
    return `social.scope.eog.court.${officeType}`;
  }
  return `social.scope.${selection.rule.law}.${selection.rule.stage === 'cantonal-insurance-court' ? 'court' : 'administration'}`;
}

export { SOCIAL_CANTONS };
