// SPDX-License-Identifier: AGPL-3.0-only
// Bounded conditional review-workbook candidate. No runtime data or product approval.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { easterDate } from './ap18a-model.mjs';
import { assertCalculation05, ruleDate05, validateContract05 } from './ap18b-03-contract.mjs';
import { createBatch03Model } from './ap18b-03-cantons.mjs';
import { deriveBatch04Model } from './ap18b-04-cantons.mjs';

export const CONTRACT_VERSION_06 = '0.6.0';
export const RULE_CONDITIONS_06 = Object.freeze([
  'always', 'unlessTuesdayOrSaturday', 'onlyMonday', 'shiftHolyThursdayBy7Days'
]);
export const CONDITION_LABELS_06 = Object.freeze({
  always: 'Immer',
  unlessTuesdayOrSaturday: 'Nicht Dienstag/Samstag',
  onlyMonday: 'Nur Montag',
  shiftHolyThursdayBy7Days: 'Gründonnerstag + 7 Tage'
});
export const V11_WORKBOOK = 'outputs/ap18b-04-restkantone-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-04_Restkantone_V0.11.xlsx';
export const V11_SHA256 = '37d33d4639cc839fc41c9850de8e6551d546167fe8b9ee7f10ea5f2c062d99fd';

const EXPERT_DATE = '2026-09-22';
const NEW_RULE_IDS = Object.freeze([
  'AR-ARG-ALL-DAY-ST-STEPHEN',
  'AI-RTG-ALL-DAY-ST-STEPHEN',
  'GL-RTG-ALL-DAY-NAEFELSER-FAHRT',
  'NE-LDJF-BASE-DAY-NEW-YEAR-SUBSTITUTE',
  'NE-LDJF-BASE-DAY-CHRISTMAS-SUBSTITUTE'
]);

// These named conditions intentionally do not form a general expression language.
// Their exact compatible anchors are part of the explicit workbook contract.
export function assertCondition06(rule) {
  if (!rule || typeof rule !== 'object' || Array.isArray(rule)
    || !Object.hasOwn(rule, 'condition') || !RULE_CONDITIONS_06.includes(rule.condition)) {
    throw new Error('Explicit supported condition required');
  }
  assertCalculation05(rule.calculation);
  const c = rule.calculation;
  if (rule.condition === 'unlessTuesdayOrSaturday'
    && !(c.type === 'fixedMonthDay' && c.month === 12 && c.day === 26)) {
    throw new Error('unlessTuesdayOrSaturday requires 26 December');
  }
  if (rule.condition === 'onlyMonday'
    && !(c.type === 'fixedMonthDay'
      && ((c.month === 1 && c.day === 2) || (c.month === 12 && c.day === 26)))) {
    throw new Error('onlyMonday requires 2 January or 26 December');
  }
  if (rule.condition === 'shiftHolyThursdayBy7Days'
    && !(c.type === 'nthWeekdayOfMonth' && c.month === 4 && c.isoWeekday === 4 && c.occurrence === 1)) {
    throw new Error('shiftHolyThursdayBy7Days requires first Thursday in April');
  }
  if (rule.condition !== 'always'
    && (rule.dayPortion !== 'fullDay' || rule.status === 'approved'
      || (Object.hasOwn(rule, 'exportClass') && rule.exportClass !== 'blockedEffect')
      || rule.reference != null || rule.approvalBasis != null)) {
    throw new Error('Conditional candidate requires full day without inherited approval or export');
  }
  return true;
}

// A missing annual occurrence is distinct from an occurrence outside validity.
// No date is returned in either case, so neither can become a January-zero date.
// year is the Gregorian anchor year, also for old cross-year offset calculations.
export function evaluateRule06(rule, year) {
  assertCondition06(rule);
  const legacy = { ...rule };
  delete legacy.condition;
  // Preserve all 0.5 validation, including strict fields and original validity.
  ruleDate05(legacy, year);
  const raw = ruleDate05({ ...legacy, from: '1583-01-01', to: '9999-12-31' }, year);
  let date = new Date(`${raw}T00:00:00Z`);
  const weekday = date.getUTCDay() || 7;
  if ((rule.condition === 'unlessTuesdayOrSaturday' && [2, 6].includes(weekday))
    || (rule.condition === 'onlyMonday' && weekday !== 1)) {
    return { status: 'notApplicable', date: null };
  }
  if (rule.condition === 'shiftHolyThursdayBy7Days') {
    const holyThursday = easterDate(year);
    holyThursday.setUTCDate(holyThursday.getUTCDate() - 3);
    if (date.getTime() === holyThursday.getTime()) date.setUTCDate(date.getUTCDate() + 7);
  }
  const result = date.toISOString().slice(0, 10);
  if (result < rule.from || (rule.to !== null && result > rule.to)) {
    return { status: 'outsideValidity', date: null };
  }
  return { status: 'occurs', date: result };
}

export function ruleDate06(rule, year) {
  return evaluateRule06(rule, year).date;
}

export function validateContract06(model) {
  if (model?.contractVersion !== CONTRACT_VERSION_06) throw new Error('Explicit workbook contract 0.6.0 required');
  if (!Array.isArray(model.rules) || !model.rules.length) throw new Error('Missing contract rules');
  for (const rule of model.rules) assertCondition06(rule);
  // Explicit narrow projection preserves every 0.5 reference/effect/area check.
  // It does not mutate the source model or silently extend the 0.5 validator.
  const legacy = structuredClone(model);
  legacy.contractVersion = '0.5.0';
  for (const rule of legacy.rules) delete rule.condition;
  validateContract05(legacy);
  const review = model.contract06Review;
  if (!review || Object.keys(review).length !== 3 || review.contractStatus !== 'candidate'
    || review.approvalBasis !== null || review.runtimeEnabled !== false) {
    throw new Error('Contract 0.6 metadata requires candidate status without product approval');
  }
  for (let year = model.years.from; year <= model.years.to; year++) {
    for (const rule of model.rules) evaluateRule06(rule, year);
  }
  return true;
}

function createNewRules(base) {
  const stephen = base.rules.find(rule => base.ruleKeys[rule.id] === 'ST-STEPHEN' && rule.it && rule.rm);
  assert.ok(stephen, 'Existing four-language Stephanstag donor required');
  const common = { from: '2026-01-01', to: null, status: 'open', approvalBasis: null,
    priority: 100, action: 'add', target: null, exportClass: 'blockedEffect', reference: null, dayPortion: 'fullDay' };
  const christmas = { type: 'fixedMonthDay', month: 12, day: 26 };
  const stepLabels = Object.fromEntries(['de', 'fr', 'it', 'rm'].map(lang => [lang, stephen[lang]]));
  return [
    { ...common, id: NEW_RULE_IDS[0], jurisdiction: 'CH-AR', scope: 'AR-ARG-ALL', ...stepLabels,
      category: 'labourLawHoliday', calculation: { ...christmas }, condition: 'unlessTuesdayOrSaturday',
      source: 'SRC-AR-ARGV-82211-V1058', locator: 'Art. 7, zweiter Weihnachtstag entfällt bei Weihnachten Montag oder Freitag' },
    { ...common, id: NEW_RULE_IDS[1], jurisdiction: 'CH-AI', scope: 'AI-RTG-ALL', ...stepLabels,
      category: 'publicHoliday', calculation: { ...christmas }, condition: 'unlessTuesdayOrSaturday',
      source: 'SRC-AI-RTG-822200-V1327', locator: 'Art. 2 Abs. 1 Bst. b, keine drei aufeinanderfolgenden Ruhetage. Bericht Standeskommission 29.09.2015, S. 7' },
    { ...common, id: NEW_RULE_IDS[2], jurisdiction: 'CH-GL', scope: 'GL-RTG-ALL',
      de: 'Näfelser Fahrt', fr: 'Commémoration de la bataille de Näfels',
      it: 'Commemorazione della battaglia di Näfels', rm: 'Commemoraziun da la battaglia da Näfels',
      category: 'publicHoliday', calculation: { type: 'nthWeekdayOfMonth', month: 4, isoWeekday: 4, occurrence: 1 },
      condition: 'shiftHolyThursdayBy7Days', source: 'SRC-GL-RTG-IXB211-20190701',
      locator: 'Art. 2 Abs. 1 Bst. b. Datumsregel gemäss Regierungsratsmitteilung 06.01.2026, fachlich bestätigt 22.09.2026' },
    { ...common, id: NEW_RULE_IDS[3], jurisdiction: 'CH-NE', scope: 'NE-LDJF-BASE',
      de: 'Ersatzfeiertag nach Neujahr', fr: 'Jour férié de remplacement après Nouvel An',
      it: 'Giorno festivo sostitutivo dopo Capodanno', rm: 'Firà cumpensatoric suenter Bumaun',
      category: 'publicHoliday', calculation: { type: 'fixedMonthDay', month: 1, day: 2 }, condition: 'onlyMonday',
      source: 'SRC-NE-LDJF-94102-20100101', locator: 'Art. 3 Abs. 1, lendemain du Nouvel An lorsque ce jour est un dimanche' },
    { ...common, id: NEW_RULE_IDS[4], jurisdiction: 'CH-NE', scope: 'NE-LDJF-BASE',
      de: 'Ersatzfeiertag nach Weihnachten', fr: 'Jour férié de remplacement après Noël',
      it: 'Giorno festivo sostitutivo dopo Natale', rm: 'Firà cumpensatoric suenter Nadal',
      category: 'publicHoliday', calculation: { ...christmas }, condition: 'onlyMonday',
      source: 'SRC-NE-LDJF-94102-20100101', locator: 'Art. 3 Abs. 1, lendemain de Noël lorsque ce jour est un dimanche' }
  ];
}

export async function createBatch05Model(root) {
  const digest = createHash('sha256').update(await fs.readFile(path.join(root, V11_WORKBOOK))).digest('hex');
  assert.equal(digest, V11_SHA256, 'Changed V0.11 source requires renewed inspection');
  // V0.11 is this migration's actual source. The pure reviewed calculation seed
  // does not reopen V0.9, whose local package bytes have changed in the meantime.
  // createBatch04Model retains its original strict V0.9 gate unchanged.
  const base = deriveBatch04Model(await createBatch03Model(root));
  assert.equal(base.rules.length, 474, 'Expected the frozen 474-rule calculation base');
  assert.ok(base.rules.every(rule => !Object.hasOwn(rule, 'condition')), 'Unexpected migrated base');
  const model = structuredClone(base);
  for (const rule of model.rules) rule.condition = 'always';
  const rules = createNewRules(base);
  model.rules.push(...rules);
  model.contractVersion = CONTRACT_VERSION_06;
  model.packageId = 'AP18B-05-BEDINGTE-FEIERTAGE';
  model.contract06Review = { contractStatus: 'candidate', approvalBasis: null, runtimeEnabled: false };
  model.contract06Migration = {
    sourceWorkbook: V11_WORKBOOK, sourceSha256: digest, sourceWorkbookContract: '0.5.0',
    calculationSeedPackage: base.packageId, migratedRuleCount: base.rules.length,
    migratedRuleIds: base.rules.map(rule => rule.id), defaultCondition: 'always',
    inheritedRuleApprovalsExtended: false, existingCalendarDatesChanged: false,
    preserveActualWorkbookLabels: true, priorV09WorkbookUsed: false,
    sourceBoundary: 'Actual workbook source is the hash-bound V0.11. The earlier V0.9 remains historical provenance, not migration input. Its changed local bytes are not accepted by weakening the legacy hash gate.'
  };
  model.batch05Additions = { rules: structuredClone(rules) };
  const keys = ['ST-STEPHEN', 'ST-STEPHEN', 'NAEFELSER-FAHRT', 'NEW-YEAR-SUBSTITUTE', 'CHRISTMAS-SUBSTITUTE'];
  for (const [index, rule] of rules.entries()) model.ruleKeys[rule.id] = keys[index];
  const resolutionIds = ['AP18B04-AR-STEPHAN-CONDITION', 'AP18B04-AI-STEPHAN-CONDITION',
    'GAP-GL-FAHRT-APRIL', 'NE-PENDING-SUNDAY-SUBSTITUTION'];
  const decisions = [
    'Bedingung als wiederkehrende Feiertagsregel umsetzen. 26. Dezember entfällt an Dienstag oder Samstag.',
    'Feiertagsliste 2026 enthält einen Fehler. Ruhetagsgesetz anwenden, 26. Dezember entfällt an Dienstag oder Samstag.',
    'Erster Donnerstag im April, in der Karwoche um sieben Tage verschieben. Jährlicher Regierungsbeschluss ist für dieses Muster eine Formalität.',
    '2. Januar beziehungsweise 26. Dezember nur als Ersatzfeiertag, wenn 1. Januar beziehungsweise 25. Dezember Sonntag ist.'
  ];
  model.resolvedCases = resolutionIds.map((id, index) => ({
    ...structuredClone(base.pendingCases.find(item => item.id === id)),
    status: 'implementedCandidate', previousStatus: base.pendingCases.find(item => item.id === id).status,
    resolvedOn: EXPERT_DATE, resolvedBy: 'David Steimer', resolution: decisions[index],
    implementedRuleIds: index === 3 ? NEW_RULE_IDS.slice(3) : [NEW_RULE_IDS[index]],
    productActivation: false
  }));
  model.pendingCases = base.pendingCases.filter(item => !resolutionIds.includes(item.id)).map(item => ({
    ...structuredClone(item), status: 'acceptedBoundary',
    reason: 'Nicht deterministische Einzel- oder Jahresfestlegungen bleiben ausserhalb der automatischen Berechnung. Dies umfasst zusätzlich festgelegte regionale oder örtliche Feiertage sowie weitere Ausgleichs- und Verwaltungsschliesstage nach RDF Art. 11 Abs. 2. Letztere können über LPA Art. 33 Abs. 3 fristrelevant sein. Die acht festen LPA-Ergänzungen und der kantonal festgelegte Fronleichnam in Le Landeron bleiben unverändert.',
    acceptedOn: EXPERT_DATE, acceptedBy: 'David Steimer', productActivation: false
  }));
  model.batch05Boundary = {
    technicalContractStatus: 'candidate', expertInstructionsOn: EXPERT_DATE,
    resolvedCaseCount: 4, newRuleCount: 5, retainedBoundaryCount: 1,
    languageApproval: false, productExport: false, runtimeEnabled: false,
    municipalLawIncluded: false, completeUniversalCalendarClaim: false
  };
  validateContract06(model);
  return model;
}
