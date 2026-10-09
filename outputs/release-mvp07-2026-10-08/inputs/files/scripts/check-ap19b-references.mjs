// SPDX-License-Identifier: AGPL-3.0-only
// AP19B test-only oracle. Deliberately imports no product calculator or data loader.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const candidatePath = 'tests/golden/candidates/ap19b-social-deadlines.json';
const root = fileURLToPath(new URL('../', import.meta.url));
const dayMs = 86_400_000;
const inputKeys = ['action', 'stage', 'document', 'days', 'subject', 'legalTriggerDate', 'triggerStatus', 'durationUnit', 'jurisdictionStatus', 'proceduralCanton', 'holidayAnchor', 'holidayStatus', 'holidayCanton', 'regionalAreaId', 'institutionSeatCanton'];
const actionSpec = {
  OBJ: ['objection', 'administration', 'initial-benefit-disposition', 30],
  APP: ['appeal', 'cantonal-insurance-court', 'objection-decision', 30],
  ADM: ['ordered-administrative-period', 'administration', 'authority-day-order', null],
  CORRECTION: ['formal-complaint-correction', 'cantonal-insurance-court', 'court-correction-day-order', null]
};
const subjects = { ELG: 'el-individual-benefits', 'AVIG-ALE': 'alv-individual-unemployment-benefits', 'KVG-OKP': 'kvg-okp-individual-benefits' };
const excluded = {
  ELG: new Set(['elg-charitable-benefits']),
  'AVIG-ALE': new Set(['avig-collective-amm']),
  'KVG-OKP': new Set(['kvg-provider-admission', 'kvg-tariff-dispute', 'kvg-premium-reduction', 'kvg-inter-insurer-dispute', 'kvg-arbitration'])
};
const productScope = {
  ELG: new Set(['elg-cantonal-extra-benefits']),
  'AVIG-ALE': new Set(['avig-short-time-benefits', 'avig-bad-weather-benefits', 'avig-insolvency-benefits', 'cantonal-amm']),
  'KVG-OKP': new Set(['kvg-daily-allowance', 'vvg-supplementary-insurance', 'kvg-premium-debt', 'kvg-enforcement', 'kvg-cost-sharing-collection', 'kvg-insurance-duty', 'cantonal-care-residual-financing'])
};
const cantonCodes = new Set(['AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH']);
const expectedSources = [
  { id: 'ATSG-38', citation: 'ATSG Art. 38 Abs. 1, 3 und 4', url: 'https://www.fedlex.admin.ch/eli/cc/2002/510/20240101/de' },
  { id: 'ATSG-PATHS', citation: 'ATSG Art. 2, 40, 52, 56, 60 und 61 Bst. b', url: 'https://www.fedlex.admin.ch/eli/cc/2002/510/20240101/de' },
  { id: 'ELG-1', citation: 'ELG Art. 1', url: 'https://www.fedlex.admin.ch/eli/cc/2007/804/20260101/de' },
  { id: 'AVIG-1-100', citation: 'AVIG Art. 1, 100 und 101', url: 'https://www.fedlex.admin.ch/eli/cc/1982/2184_2184_2184/20260101/de' },
  { id: 'KVG-1-80', citation: 'KVG Art. 1, 80 und 85', url: 'https://www.fedlex.admin.ch/eli/cc/1995/1328_1328_1328/20260701/de' },
  { id: 'AVIV-2027-01', citation: 'AVIV Art. 26, 77, 119 und 128, Konsolidierung 01.01.2027', url: 'https://www.fedlex.admin.ch/eli/cc/1983/1205_1205_1205/20270101/de' },
  { id: 'AVIV-AS-2025-814', citation: 'AS 2025 814, Änderung AVIV Art. 46 und 66a, in Kraft 01.01.2027', url: 'https://www.fedlex.admin.ch/eli/oc/2025/814/de' },
  { id: 'AVIV-AS-2026-258', citation: 'AS 2026 258, zeitliche Geltung AVIV Art. 57b bis 31.01.2027', url: 'https://www.fedlex.admin.ch/eli/oc/2026/258/de' },
  { id: 'FRG-BE', citation: 'BSG 555.1 Art. 2', url: 'https://www.belex.sites.be.ch/app/de/texts_of_law/555.1' },
  { id: 'BUNDESFEIERTAG', citation: 'Verordnung über den Bundesfeiertag, SR 116, Art. 1', url: 'https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de' },
  { id: 'BGER-CORRECTION', citation: 'BGer 8C_767/2008 vom 12. Januar 2009, E. 4.3.2', url: 'https://mcp.opencaselaw.ch/entscheid/bger_8C_767_2008#e-4-3-2' }
];
const expectedPaths = Object.keys(subjects).flatMap(law => Object.keys(actionSpec).map(action => `CH-SOC-${law}-${action}`));
const expectedIntervals = [['2026-01-01', '2026-01-02'], ['2026-03-29', '2026-04-12'], ['2026-07-15', '2026-08-15'], ['2026-12-18', '2027-01-02'], ['2027-03-21', '2027-04-04'], ['2027-07-15', '2027-08-15'], ['2027-12-18', '2027-12-31']];
const expectedHolidays = ['2026-01-01', '2026-01-02', '2026-04-03', '2026-04-05', '2026-04-06', '2026-05-14', '2026-05-24', '2026-05-25', '2026-08-01', '2026-09-20', '2026-12-25', '2026-12-26', '2027-01-01', '2027-01-02', '2027-03-26', '2027-03-28', '2027-03-29', '2027-05-06', '2027-05-16', '2027-05-17', '2027-08-01', '2027-09-19', '2027-12-25', '2027-12-26'];
const basis = [
  { path: 'data/releases/2026-09-22-mvp-04-approved.1/calendars/be-public-holidays.json', sha256: '6051094d6179f99276cb55cad0f88e562da02c2396dffcf213d0ac165807d121' },
  { path: 'data/releases/2026-09-22-mvp-04-approved.1/calendars/ch-federal-calendar.json', sha256: 'c851d4839e06ad714aba988b6c92e9ae81c27a507cc004bf0f89046650a3c5c7' }
];

function keys(value, required, where, optional = []) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), `${where}: object required`);
  for (const key of required) assert.ok(Object.hasOwn(value, key), `${where}: missing ${key}`);
  for (const key of Object.keys(value)) assert.ok([...required, ...optional].includes(key), `${where}: unknown ${key}`);
}
function nonempty(value, where) { assert.equal(typeof value, 'string', where); assert.ok(value.trim(), where); }
function unique(items, where) { assert.equal(new Set(items).size, items.length, `${where}: duplicate`); }
export function civilDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1000 || year > 9999) return null;
  const milliseconds = Date.UTC(year, month - 1, day);
  if (new Date(milliseconds).toISOString().slice(0, 10) !== value) return null;
  return milliseconds / dayMs;
}
export function civilDate(day) { return new Date(day * dayMs).toISOString().slice(0, 10); }
const blocked = reason => ({ qualification: 'blocked', reason, eligibility: 'blocked-input', runtimeActive: false, arithmetic: null });

export function validateReferences(model) {
  keys(model, ['formatVersion', 'status', 'approvedBy', 'runtimeActive', 'legalTimeApproval', 'referenceWindow', 'sourceCoverageCeilings', 'sourceEvidenceMode', 'sourceEvidenceDocument', 'sources', 'calendarFixture', 'paths', 'cases'], 'model');
  assert.equal(model.formatVersion, 'ap19b-social-references-1');
  assert.equal(model.status, 'draft'); assert.equal(model.approvedBy, null);
  assert.equal(model.runtimeActive, false); assert.equal(model.legalTimeApproval, false);
  keys(model.referenceWindow, ['from', 'to', 'meaning'], 'referenceWindow');
  assert.equal(model.referenceWindow.from, '2026-01-01'); assert.equal(model.referenceWindow.to, '2027-12-31');
  nonempty(model.referenceWindow.meaning, 'referenceWindow.meaning');
  assert.deepEqual(model.sourceCoverageCeilings, { ELG: '2027-12-31', 'AVIG-ALE': '2027-12-31', 'KVG-OKP': '2027-12-31' });
  assert.deepEqual(model.sourceEvidenceMode, { ELG: 'direct-consolidations', 'AVIG-ALE': 'official-amendment-reconstruction', 'KVG-OKP': 'direct-consolidations' });
  assert.equal(model.sourceEvidenceDocument, 'docs/fachrecht/quellenabgleich-ap19b.md');
  assert.deepEqual(model.sources, expectedSources, 'source ID, citation and versioned URL must remain bound');
  for (const source of model.sources) {
    keys(source, ['id', 'citation', 'url'], 'source'); nonempty(source.citation, 'source.citation');
    assert.match(source.url, /^https:\/\/(www\.fedlex\.admin\.ch|www\.belex\.sites\.be\.ch|mcp\.opencaselaw\.ch)\//);
  }
  keys(model.calendarFixture, ['scope', 'basis', 'holidayDates', 'suspensionIntervals'], 'calendarFixture');
  nonempty(model.calendarFixture.scope, 'calendarFixture.scope');
  assert.deepEqual(model.calendarFixture.basis, basis);
  assert.deepEqual(model.calendarFixture.holidayDates, expectedHolidays);
  assert.deepEqual(model.calendarFixture.suspensionIntervals, expectedIntervals);
  assert.ok(Array.isArray(model.paths)); assert.deepEqual(model.paths.map(path => path.pathId), expectedPaths);
  for (const path of model.paths) {
    keys(path, ['pathId', 'input'], 'path'); keys(path.input, inputKeys, 'path.input');
    const suffix = path.pathId.split('-').at(-1);
    const law = path.pathId.slice(7, -(suffix.length + 1));
    assert.equal(path.input.subject, subjects[law]);
    for (const [index, key] of ['action', 'stage', 'document'].entries()) assert.equal(path.input[key], actionSpec[suffix][index]);
    assert.equal(path.input.days, actionSpec[suffix][3] ?? 10);
    assert.equal(path.input.legalTriggerDate, '2026-09-16');
    for (const [key, value] of Object.entries({ triggerStatus: 'qualified', durationUnit: 'days', jurisdictionStatus: 'qualified', proceduralCanton: 'BE', holidayAnchor: 'party', holidayStatus: 'resolved', holidayCanton: 'BE', regionalAreaId: null })) assert.equal(path.input[key], value);
    assert.equal(path.input.institutionSeatCanton, law === 'KVG-OKP' ? 'ZH' : 'BE');
  }
  assert.ok(Array.isArray(model.cases)); assert.equal(model.cases.length, 77); unique(model.cases.map(item => item.id), 'cases');
  for (const item of model.cases) {
    keys(item, ['id', 'label', 'pathId', 'overrides', 'expected'], 'case'); nonempty(item.id, 'case.id'); nonempty(item.label, 'case.label');
    assert.ok(expectedPaths.includes(item.pathId)); keys(item.overrides, [], 'case.overrides', inputKeys);
    keys(item.expected, ['qualification', 'reason', 'eligibility', 'runtimeActive', 'arithmetic'], 'case.expected');
    assert.equal(item.expected.runtimeActive, false);
    if (item.expected.qualification === 'qualified-reference') {
      assert.equal(item.expected.reason, null); assert.equal(item.expected.eligibility, 'candidate-not-approved');
      keys(item.expected.arithmetic, ['calendarStartDate', 'firstCountedDate', 'nominalEndDate', 'deadline', 'suspensionDays', 'extensionDays'], 'arithmetic');
      for (const key of ['calendarStartDate', 'firstCountedDate', 'nominalEndDate', 'deadline']) assert.notEqual(civilDay(item.expected.arithmetic[key]), null);
      for (const key of ['suspensionDays', 'extensionDays']) assert.ok(Number.isInteger(item.expected.arithmetic[key]) && item.expected.arithmetic[key] >= 0);
    } else {
      assert.equal(item.expected.qualification, 'blocked'); assert.equal(item.expected.eligibility, 'blocked-input');
      nonempty(item.expected.reason, 'blocked reason'); assert.equal(item.expected.arithmetic, null);
    }
  }
  return model;
}

/** A separate civil-date enumeration, not an invocation of the product engine. */
export function evaluateReference(model, pathId, input) {
  try { validateReferences(model); keys(input, inputKeys, 'input'); } catch { return blocked('reference-contract-invalid'); }
  if (!expectedPaths.includes(pathId)) return blocked('path-unavailable');
  const suffix = pathId.split('-').at(-1);
  const law = pathId.slice(7, -(suffix.length + 1));
  if (input.institutionSeatCanton !== null && !cantonCodes.has(input.institutionSeatCanton)) return blocked('reference-contract-invalid');
  if (excluded[law].has(input.subject)) return blocked('statutory-exclusion');
  if (productScope[law].has(input.subject)) return blocked('product-scope');
  if (input.subject !== subjects[law]) return blocked('subject-unqualified');
  const [action, stage, document, fixedDays] = actionSpec[suffix];
  if (input.action !== action) return blocked('action-unqualified');
  if (input.stage !== stage) return blocked('stage-unqualified');
  if (input.document !== document) return blocked('document-unqualified');
  if (input.triggerStatus !== 'qualified') return blocked('trigger-unqualified');
  if (input.jurisdictionStatus !== 'qualified') return blocked('jurisdiction-unqualified');
  if (input.proceduralCanton !== 'BE') return blocked('jurisdiction-unbound');
  if (!['party', 'representative'].includes(input.holidayAnchor) || input.holidayStatus !== 'resolved') return blocked('holiday-anchor-unqualified');
  if (input.holidayCanton !== 'BE' || input.regionalAreaId !== null) return blocked('holiday-scope-unbound');
  if (input.durationUnit !== 'days' || !Number.isInteger(input.days) || input.days < 1 || input.days > 365) return blocked('duration-unqualified');
  if (fixedDays !== null && input.days !== fixedDays) return blocked('fixed-duration-changed');
  const trigger = civilDay(input.legalTriggerDate);
  if (trigger === null) return blocked('date-invalid');
  const windowStart = civilDay(model.referenceWindow.from), windowEnd = civilDay(model.referenceWindow.to);
  if (trigger < windowStart || trigger > windowEnd) return blocked('outside-reference-window');
  const sourceCeiling = civilDay(model.sourceCoverageCeilings[law]);
  if (trigger > sourceCeiling) return blocked('source-coverage-incomplete');
  const suspended = day => model.calendarFixture.suspensionIntervals.some(([from, to]) => day >= civilDay(from) && day <= civilDay(to));
  const nonWorking = day => [0, 6].includes(new Date(day * dayMs).getUTCDay()) || model.calendarFixture.holidayDates.includes(civilDate(day));
  const calendarStart = trigger + 1;
  let cursor = calendarStart, counted = 0, suspendedDays = 0, firstCounted = null;
  while (counted < input.days) {
    if (cursor > windowEnd) return blocked('result-outside-reference-window');
    if (cursor > sourceCeiling) return blocked('source-coverage-incomplete');
    if (suspended(cursor)) suspendedDays++;
    else { counted++; firstCounted ??= cursor; }
    if (counted < input.days) cursor++;
  }
  const nominalEnd = cursor;
  while (nonWorking(cursor)) {
    cursor++;
    if (cursor > windowEnd) return blocked('result-outside-reference-window');
    if (cursor > sourceCeiling) return blocked('source-coverage-incomplete');
  }
  return { qualification: 'qualified-reference', reason: null, eligibility: 'candidate-not-approved', runtimeActive: false, arithmetic: {
    calendarStartDate: civilDate(calendarStart), firstCountedDate: civilDate(firstCounted), nominalEndDate: civilDate(nominalEnd), deadline: civilDate(cursor), suspensionDays: suspendedDays, extensionDays: cursor - nominalEnd
  } };
}

export function runReferenceCases(model) {
  validateReferences(model);
  for (const item of model.cases) {
    const base = model.paths.find(path => path.pathId === item.pathId).input;
    assert.deepEqual(evaluateReference(model, item.pathId, { ...base, ...item.overrides }), item.expected, `${item.id}: ${item.label}`);
  }
  const positiveCases = model.cases.filter(item => item.expected.qualification === 'qualified-reference');
  assert.deepEqual([...new Set(positiveCases.map(item => item.pathId))].sort(), [...expectedPaths].sort());
  return { paths: model.paths.length, cases: model.cases.length, positive: positiveCases.length, blocked: model.cases.length - positiveCases.length, runtimeActive: false, legalTimeApproval: false };
}

export async function verifyCalendarBasis(model) {
  validateReferences(model);
  for (const item of model.calendarFixture.basis) {
    const bytes = await readFile(resolve(root, item.path));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256, item.path);
  }
  return model.calendarFixture.basis.length;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const model = JSON.parse(await readFile(resolve(root, candidatePath), 'utf8'));
  await verifyCalendarBasis(model);
  console.log(JSON.stringify(runReferenceCases(model), null, 2));
}
