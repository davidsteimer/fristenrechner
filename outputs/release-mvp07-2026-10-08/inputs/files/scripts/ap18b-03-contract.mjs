// SPDX-License-Identifier: AGPL-3.0-only
// Explicit review-workbook contract. Not a product calendar, importer or approval.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { easterDate, validateModel } from './ap18a-model.mjs';
import { validateAreaAssignments } from './ap18a-area-assignments.mjs';
import { createTiGrPackageModel } from './ap18b-ti-gr-model.mjs';
import { PROVISIONAL_TI_RM_LABELS, validateProvisionalTiRmLabels } from './ap18b-rg-labels.mjs';

export const CONTRACT_VERSION = '0.5.0';
export const DAY_PORTIONS = Object.freeze(['fullDay', 'afternoonFromNoon']);
export const DAY_PORTION_LABELS = Object.freeze({ fullDay: 'Ganztägig', afternoonFromNoon: 'Ab 12.00 Uhr' });
export const HOLIDAY_TYPES_05 = Object.freeze([
  'fixedMonthDay', 'easterOffsetDays', 'nthWeekdayOfMonth', 'nthWeekdayOffsetDays'
]);
export const V08_WORKBOOK = 'outputs/ap18b-02-ti-gr-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-02_TI_GR_V0.8.xlsx';
export const V08_SHA256 = 'd3e3bac17464733fa7bc3c42e63db0b5b42502c177914d6dcd9800ba9320461f';

const CALCULATION_FIELDS = Object.freeze({
  fixedMonthDay: ['type', 'month', 'day'],
  easterOffsetDays: ['type', 'offsetDays'],
  nthWeekdayOfMonth: ['type', 'month', 'isoWeekday', 'occurrence'],
  nthWeekdayOffsetDays: ['type', 'month', 'isoWeekday', 'occurrence', 'offsetDays']
});
const REQUIRED_RULE_FIELDS = ['id', 'jurisdiction', 'scope', 'de', 'fr', 'category',
  'calculation', 'from', 'to', 'source', 'locator', 'status', 'approvalBasis',
  'priority', 'action', 'target', 'exportClass', 'reference', 'dayPortion'];
const RULE_FIELDS = [...REQUIRED_RULE_FIELDS, 'it', 'rm'];

function assertFields(value, required, allowed, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || required.some(key => !Object.hasOwn(value, key))
    || Object.keys(value).some(key => !allowed.includes(key))) {
    throw new Error(`Invalid ${label} fields`);
  }
}
function integer(value, min, max, label) {
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`Invalid ${label}`);
}
function text(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Invalid ${label}`);
}
function assertDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)
    || value < '1583-01-01' || value > '9999-12-31') throw new Error('Invalid supported ISO date');
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error('Invalid supported ISO date');
}
function assertValidity(rule) {
  assertDate(rule.from);
  if (rule.to !== null) {
    assertDate(rule.to);
    if (rule.to < rule.from) throw new Error('Reversed validity');
  }
}
function assertDayPortion(rule) {
  if (!DAY_PORTIONS.includes(rule.dayPortion)) throw new Error('Explicit supported dayPortion required');
}

export function assertCalculation05(calculation) {
  const required = CALCULATION_FIELDS[calculation?.type];
  if (!required) throw new Error('Unsupported contract 0.5 calculation');
  assertFields(calculation, required, required, 'calculation');
  if (calculation.type === 'fixedMonthDay') {
    integer(calculation.month, 1, 12, 'month');
    integer(calculation.day, 1, 31, 'day');
    // Leap-day rules are possible, but a non-leap target year is rejected below.
    if (new Date(Date.UTC(2000, calculation.month - 1, calculation.day)).getUTCMonth() !== calculation.month - 1) {
      throw new Error('Invalid fixed date');
    }
  }
  if (['nthWeekdayOfMonth', 'nthWeekdayOffsetDays'].includes(calculation.type)) {
    integer(calculation.month, 1, 12, 'month');
    integer(calculation.isoWeekday, 1, 7, 'ISO weekday');
    integer(calculation.occurrence, 1, 5, 'weekday occurrence');
  }
  if (['easterOffsetDays', 'nthWeekdayOffsetDays'].includes(calculation.type)) {
    integer(calculation.offsetDays, -366, 366, 'calendar day offset');
  }
  return true;
}

// year is the anchor year, not necessarily the resulting calendar year.
// Validity is inclusive and applies to the resulting day after the offset.
export function ruleDate05(rule, year) {
  assertFields(rule, ['calculation', 'from', 'to', 'dayPortion'], RULE_FIELDS, 'rule');
  integer(year, 1583, 9999, 'Gregorian anchor year');
  assertCalculation05(rule.calculation);
  assertValidity(rule);
  assertDayPortion(rule);
  const c = rule.calculation;
  let date;
  if (c.type === 'fixedMonthDay') {
    date = new Date(Date.UTC(year, c.month - 1, c.day));
    if (date.getUTCMonth() !== c.month - 1) throw new Error('Invalid fixed date in year');
  } else if (c.type === 'easterOffsetDays') {
    date = easterDate(year);
    date.setUTCDate(date.getUTCDate() + c.offsetDays);
  } else {
    const first = new Date(Date.UTC(year, c.month - 1, 1));
    const firstIsoWeekday = first.getUTCDay() || 7;
    const day = 1 + (c.isoWeekday - firstIsoWeekday + 7) % 7 + 7 * (c.occurrence - 1);
    date = new Date(Date.UTC(year, c.month - 1, day));
    if (date.getUTCMonth() !== c.month - 1) throw new Error('Weekday anchor outside month');
    if (c.type === 'nthWeekdayOffsetDays') date.setUTCDate(date.getUTCDate() + c.offsetDays);
  }
  if (date.getUTCFullYear() < 1583 || date.getUTCFullYear() > 9999) throw new Error('Result outside supported Gregorian range');
  const result = date.toISOString().slice(0, 10);
  return result < rule.from || (rule.to !== null && result > rule.to) ? null : result;
}

export function validateContract05(model) {
  if (model?.contractVersion !== CONTRACT_VERSION) throw new Error('Explicit workbook contract 0.5.0 required');
  if (!Array.isArray(model.rules) || !model.rules.length) throw new Error('Missing contract rules');
  for (const rule of model.rules) {
    assertFields(rule, REQUIRED_RULE_FIELDS, RULE_FIELDS, 'rule');
    for (const field of ['id', 'jurisdiction', 'scope', 'de', 'fr', 'category', 'source', 'locator', 'status', 'action', 'exportClass']) {
      text(rule[field], `rule ${field}`);
    }
    for (const language of ['it', 'rm']) {
      if (Object.hasOwn(rule, language) && typeof rule[language] !== 'string') throw new Error('Invalid optional language label');
    }
    assertCalculation05(rule.calculation);
    assertValidity(rule);
    assertDayPortion(rule);
    if (rule.target !== null) throw new Error('Add rules cannot have a target');
    if (rule.status !== 'approved' && (rule.approvalBasis !== null || rule.reference !== null)) {
      throw new Error('Unapproved rule carries inherited approval');
    }
    if (rule.dayPortion !== 'fullDay' && (rule.status === 'approved' || rule.exportClass !== 'blockedEffect')) {
      throw new Error('Partial day requires blocked effect and no inherited approval');
    }
  }
  validateModel(model, { holidayTypes: HOLIDAY_TYPES_05, calculationValidator: assertCalculation05 });
  if (!Array.isArray(model.areaSourceEvidence)) throw new Error('Explicit areaSourceEvidence list required');
  validateAreaAssignments(model.assignments, model, { sourceEvidence: model.areaSourceEvidence });
  const yearFields = ['from', 'to', 'selected'];
  assertFields(model.years, yearFields, yearFields, 'year range');
  for (const field of yearFields) integer(model.years[field], 1583, 9999, 'model year');
  if (model.years.from > model.years.to || model.years.selected < model.years.from || model.years.selected > model.years.to) {
    throw new Error('Invalid model year range');
  }
  for (let year = model.years.from; year <= model.years.to; year++) {
    for (const rule of model.rules) ruleDate05(rule, year);
  }
  const reviewFields = ['dayPortionStatus', 'approvalBasis', 'runtimeEnabled'];
  assertFields(model.contract05Review, reviewFields, reviewFields, 'contract metadata review');
  if (model.contract05Review.dayPortionStatus !== 'open' || model.contract05Review.approvalBasis !== null
    || model.contract05Review.runtimeEnabled !== false) throw new Error('Contract metadata has no product approval');
  return true;
}

export async function createContract05Model(root) {
  // Bound the migration to the actual preserved V0.8 workbook and the validated
  // 116-rule seed. Unknown datasets never receive a default day extent.
  const workbook = await fs.readFile(path.join(root, V08_WORKBOOK));
  const digest = createHash('sha256').update(workbook).digest('hex');
  if (digest !== V08_SHA256) throw new Error('V0.8 workbook changed: migration requires renewed inspection');
  const legacy = await createTiGrPackageModel(root);
  if (legacy.rules.length !== 116 || new Set(legacy.rules.map(rule => rule.id)).size !== 116) {
    throw new Error('Expected the verified 116-rule migration base');
  }
  if (legacy.rules.some(rule => Object.hasOwn(rule, 'dayPortion')
    || !['CH', 'CH-BE', 'CH-AG', 'CH-TI', 'CH-GR'].includes(rule.jurisdiction))) {
    throw new Error('Unknown migration day extent or jurisdiction');
  }
  validateProvisionalTiRmLabels();
  const model = structuredClone(legacy);
  // V0.8 changed these eight blank names only. The older V0.7 snapshots under
  // additions remain historical provenance, not the active contract rule list.
  for (const label of PROVISIONAL_TI_RM_LABELS) {
    const rule = model.rules.find(candidate => candidate.id === label.ruleId);
    if (!rule || rule.rm !== '') throw new Error('Changed V0.8 language migration base');
    rule.rm = label.rm;
  }
  const legacyCalculations = legacy.rules.map(rule => rule.calculation);
  for (const rule of model.rules) rule.dayPortion = 'fullDay';
  if (!isDeepStrictEqual(model.rules.map(rule => rule.calculation), legacyCalculations)) throw new Error('Changed migration calculation');
  model.contractVersion = CONTRACT_VERSION;
  model.areaSourceEvidence = [];
  model.contract05Review = { dayPortionStatus: 'open', approvalBasis: null, runtimeEnabled: false };
  model.contract05Migration = {
    sourceWorkbook: V08_WORKBOOK, sourceSha256: digest, sourceWorkbookContract: '0.4.0',
    historicalSeedContract: legacy.contractVersion, ruleCount: 116,
    migratedRuleIds: model.rules.map(rule => rule.id),
    inheritedRuleApprovalsExtended: false, calendarDatesChanged: false
  };
  model.provisionalTiRmLabels = structuredClone(PROVISIONAL_TI_RM_LABELS);
  validateContract05(model);
  return model;
}
