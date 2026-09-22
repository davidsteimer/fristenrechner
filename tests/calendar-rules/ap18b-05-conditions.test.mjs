// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ruleDate05 } from '../../scripts/ap18b-03-contract.mjs';
import { createBatch03Model } from '../../scripts/ap18b-03-cantons.mjs';
import { deriveBatch04Model, validateBatch04Model } from '../../scripts/ap18b-04-cantons.mjs';
import { CONTRACT_VERSION_06, RULE_CONDITIONS_06, V11_SHA256, assertCondition06,
  evaluateRule06, ruleDate06, validateContract06, createBatch05Model } from '../../scripts/ap18b-05-conditions.mjs';

const root = process.cwd();
const batch03 = await createBatch03Model(root);
const base = deriveBatch04Model(batch03);
const model = await createBatch05Model(root);
const clone = value => structuredClone(value);
const fixed = (month, day) => ({ type: 'fixedMonthDay', month, day });
const dateRule = (calculation, condition = 'always', extra = {}) => ({
  calculation, condition, from: '1583-01-01', to: null, dayPortion: 'fullDay', ...extra
});
const stephen = dateRule(fixed(12, 26), 'unlessTuesdayOrSaturday');
const newYearSubstitute = dateRule(fixed(1, 2), 'onlyMonday');
const christmasSubstitute = dateRule(fixed(12, 26), 'onlyMonday');
const fahrt = dateRule({ type: 'nthWeekdayOfMonth', month: 4, isoWeekday: 4, occurrence: 1 }, 'shiftHolyThursdayBy7Days');
const iso = date => date.toISOString().slice(0, 10);

// Independent Gregorian Easter algorithm (Gauss), not the production helper.
function oracleEaster(year) {
  const a = year % 19, b = year % 4, c = year % 7, century = Math.floor(year / 100);
  const p = Math.floor((13 + 8 * century) / 25), q = Math.floor(century / 4);
  const m = (15 - p + century - q) % 30, n = (4 + century - q) % 7;
  const d = (19 * a + m) % 30, e = (2 * b + 4 * c + 6 * d + n) % 7;
  let day = 22 + d + e;
  if (d === 29 && e === 6) day = 50;
  if (d === 28 && e === 6 && a > 10) day = 49;
  return new Date(Date.UTC(year, 2, day));
}

describe('AP18B-05: explicit bounded migration', () => {
  it('migrates 474 existing rules only by adding always and preserves every old date', () => {
    assert.equal(model.contractVersion, CONTRACT_VERSION_06);
    assert.equal(model.rules.length, 479);
    assert.equal(model.contract06Migration.sourceSha256, V11_SHA256);
    assert.equal(model.contract06Migration.preserveActualWorkbookLabels, true);
    assert.equal(model.contract06Migration.priorV09WorkbookUsed, false);
    assert.equal(validateBatch04Model(base, batch03), true);
    for (let index = 0; index < base.rules.length; index++) {
      const migrated = clone(model.rules[index]);
      assert.equal(migrated.condition, 'always');
      delete migrated.condition;
      assert.deepEqual(migrated, base.rules[index]);
      for (const year of [2026, 2027, 2028]) {
        assert.equal(ruleDate06(model.rules[index], year), ruleDate05(base.rules[index], year));
      }
    }
    assert.ok(base.rules.every(rule => !Object.hasOwn(rule, 'condition')));
    for (const field of ['scopes', 'sources', 'mappings', 'reviews', 'assignments', 'areaSourceEvidence']) {
      assert.deepEqual(model[field], base[field], field);
    }
    assert.equal(validateContract06(model), true);
  });

  it('resolves four cases into five candidate rules without approval or export', () => {
    assert.equal(model.resolvedCases.length, 4);
    assert.equal(model.batch05Additions.rules.length, 5);
    assert.deepEqual(model.years, { from: 2026, to: 2028, selected: 2027 });
    assert.deepEqual(new Set(model.resolvedCases.flatMap(item => item.implementedRuleIds)),
      new Set(model.batch05Additions.rules.map(rule => rule.id)));
    for (const rule of model.batch05Additions.rules) {
      assert.equal(rule.status, 'open');
      assert.equal(rule.exportClass, 'blockedEffect');
      assert.equal(rule.reference, null);
      assert.equal(rule.approvalBasis, null);
      assert.equal(rule.from, '2026-01-01');
      for (const language of ['de', 'fr', 'it', 'rm']) assert.ok(rule[language].trim());
      assert.ok(model.sources.some(source => source[0] === rule.source));
    }
    assert.equal(model.contract06Review.contractStatus, 'candidate');
    assert.equal(model.batch05Boundary.productExport, false);
    assert.equal(model.batch05Boundary.completeUniversalCalendarClaim, false);
    assert.equal(model.referenceAcceptance.solothurnMay1HalfDayDeadlineEffect, 'none');
  });

  it('preserves the explicit NE annual/local caveat and all fixed administrative days', () => {
    assert.equal(model.pendingCases.length, 1);
    assert.equal(model.pendingCases[0].id, 'NE-PENDING-COMPENSATION');
    assert.equal(model.pendingCases[0].status, 'acceptedBoundary');
    assert.match(model.pendingCases[0].reason, /RDF Art\. 11 Abs\. 2/);
    assert.match(model.pendingCases[0].reason, /LPA Art\. 33 Abs\. 3/);
    const administrative = model.rules.filter(rule => rule.scope === 'NE-LPA-ADDITIONAL');
    assert.equal(administrative.length, 8);
    assert.ok(administrative.every(rule => rule.condition === 'always'));
    for (const [suffix, date] of [['BERCHTOLD', '2026-01-02'], ['ST-STEPHEN', '2026-12-26']]) {
      assert.equal(ruleDate06(administrative.find(rule => rule.id.endsWith(suffix)), 2026), date);
    }
    assert.equal(model.rules.filter(rule => rule.scope === 'NE-LANDERON-ADDITIONAL').length, 1);
  });
});

describe('AP18B-05: AR and AI omission without fictitious replacement dates', () => {
  it('matches Christmas Monday/Friday independently throughout a 400-year cycle', () => {
    const weekdays = new Set();
    let omitted = 0;
    for (let year = 2000; year < 2400; year++) {
      const christmasWeekday = new Date(Date.UTC(year, 11, 25)).getUTCDay();
      weekdays.add(christmasWeekday);
      const expected = [1, 5].includes(christmasWeekday) ? null : `${year}-12-26`;
      if (expected === null) omitted++;
      assert.equal(ruleDate06(stephen, year), expected, String(year));
    }
    assert.equal(weekdays.size, 7);
    assert.ok(omitted > 100 && omitted < 120);
  });

  it('implements both accepted profiles in 2026–2028 and beyond', () => {
    for (const jurisdiction of ['CH-AR', 'CH-AI']) {
      const rule = model.batch05Additions.rules.find(item => item.jurisdiction === jurisdiction);
      assert.deepEqual(evaluateRule06(rule, 2026), { status: 'notApplicable', date: null });
      assert.equal(ruleDate06(rule, 2027), '2027-12-26');
      assert.equal(ruleDate06(rule, 2028), null);
      assert.equal(ruleDate06(rule, 2029), '2029-12-26');
    }
  });
});

describe('AP18B-05: Näfelser Fahrt and Holy Week', () => {
  it('shifts 2 April to 9 April 2026 and retains 1 April 2027', () => {
    assert.equal(ruleDate06(fahrt, 2026), '2026-04-09');
    assert.equal(ruleDate06(fahrt, 2027), '2027-04-01');
    assert.equal(ruleDate06(fahrt, 2028), '2028-04-06');
  });

  it('matches a separate Easter algorithm and day-by-day Holy Week oracle for 400 years', () => {
    const weekdays = new Set();
    let shifted = 0, normal = 0;
    for (let year = 2000; year < 2400; year++) {
      weekdays.add(new Date(Date.UTC(year, 3, 1)).getUTCDay());
      let firstThursday;
      for (let day = 1; day <= 7; day++) {
        const candidate = new Date(Date.UTC(year, 3, day));
        if (candidate.getUTCDay() === 4) firstThursday = candidate;
      }
      const easter = oracleEaster(year);
      const holyMonday = new Date(easter.getTime());
      holyMonday.setUTCDate(holyMonday.getUTCDate() - 6);
      const inHolyWeek = firstThursday >= holyMonday && firstThursday < easter;
      if (inHolyWeek) {
        firstThursday.setUTCDate(firstThursday.getUTCDate() + 7);
        shifted++;
      } else normal++;
      assert.equal(ruleDate06(fahrt, year), iso(firstThursday), String(year));
    }
    assert.equal(weekdays.size, 7);
    assert.ok(shifted > 0 && normal > shifted);
  });

  it('applies inclusive validity after the Holy Week shift, not to the original anchor', () => {
    const valid = { ...fahrt, from: '2026-04-09', to: '2026-04-09' };
    assert.deepEqual(evaluateRule06(valid, 2026), { status: 'occurs', date: '2026-04-09' });
    assert.deepEqual(evaluateRule06({ ...valid, from: '2026-04-10', to: null }, 2026),
      { status: 'outsideValidity', date: null });
    assert.deepEqual(evaluateRule06({ ...valid, from: '2026-04-01', to: '2026-04-08' }, 2026),
      { status: 'outsideValidity', date: null });
  });
});

describe('AP18B-05: NE conditional replacement days', () => {
  it('matches only a Sunday predecessor throughout 400 Gregorian years', () => {
    for (const [month, first, rule] of [[1, 1, newYearSubstitute], [12, 25, christmasSubstitute]]) {
      const weekdays = new Set();
      for (let year = 2000; year < 2400; year++) {
        const predecessor = new Date(Date.UTC(year, month - 1, first));
        weekdays.add(predecessor.getUTCDay());
        const expected = predecessor.getUTCDay() === 0
          ? `${year}-${String(month).padStart(2, '0')}-${String(first + 1).padStart(2, '0')}` : null;
        assert.equal(ruleDate06(rule, year), expected, `${month}/${year}`);
      }
      assert.equal(weekdays.size, 7);
    }
  });

  it('generates 26 December 2033 and 2 January 2034, not 2 January 2033', () => {
    assert.equal(ruleDate06(christmasSubstitute, 2033), '2033-12-26');
    assert.equal(ruleDate06(newYearSubstitute, 2034), '2034-01-02');
    assert.equal(ruleDate06(newYearSubstitute, 2033), null);
    for (const year of [2026, 2027, 2028]) {
      assert.equal(ruleDate06(newYearSubstitute, year), null);
      assert.equal(ruleDate06(christmasSubstitute, year), null);
    }
  });
});

describe('AP18B-05: fail-closed contract validation', () => {
  for (const [label, mutate] of [
    ['missing condition', r => { delete r.condition; }],
    ['unknown condition', r => { r.condition = 'sometimes'; }],
    ['object instead of enum', r => { r.condition = { type: 'always' }; }],
    ['undefined condition', r => { r.condition = undefined; }],
    ['unknown rule field', r => { r.shift = 7; }],
    ['unknown calculation field', r => { r.calculation.exceptEaster = true; }],
    ['invalid validity date', r => { r.from = '2026-02-30'; }],
    ['missing validity end', r => { delete r.to; }],
    ['reversed validity', r => { r.from = '2027-01-01'; r.to = '2026-12-31'; }],
    ['partial conditional day', r => { r.dayPortion = 'afternoonFromNoon'; }],
    ['conditional candidate approved', r => { r.status = 'approved'; }],
    ['conditional candidate exported', r => { r.exportClass = 'referenceOnly'; }],
    ['inherited reference', r => { r.reference = {}; }],
    ['inherited approval', r => { r.approvalBasis = 'approved'; }]
  ]) it(`rejects ${label}`, () => {
    const rule = clone(stephen);
    mutate(rule);
    assert.throws(() => ruleDate06(rule, 2026));
    const candidate = clone(model);
    mutate(candidate.rules.find(item => item.id === 'AR-ARG-ALL-DAY-ST-STEPHEN'));
    assert.throws(() => validateContract06(candidate));
  });

  for (const [condition, calculation] of [
    ['unlessTuesdayOrSaturday', fixed(1, 2)],
    ['unlessTuesdayOrSaturday', { type: 'easterOffsetDays', offsetDays: 0 }],
    ['onlyMonday', fixed(12, 25)],
    ['onlyMonday', { type: 'nthWeekdayOfMonth', month: 1, isoWeekday: 1, occurrence: 1 }],
    ['shiftHolyThursdayBy7Days', fixed(4, 2)],
    ['shiftHolyThursdayBy7Days', { type: 'nthWeekdayOfMonth', month: 3, isoWeekday: 4, occurrence: 1 }],
    ['shiftHolyThursdayBy7Days', { type: 'nthWeekdayOfMonth', month: 4, isoWeekday: 5, occurrence: 1 }],
    ['shiftHolyThursdayBy7Days', { type: 'nthWeekdayOfMonth', month: 4, isoWeekday: 4, occurrence: 2 }],
    ['shiftHolyThursdayBy7Days', { type: 'nthWeekdayOffsetDays', month: 4, isoWeekday: 4, occurrence: 1, offsetDays: 0 }]
  ]) it(`rejects incompatible ${condition}/${JSON.stringify(calculation)}`,
    () => assert.throws(() => assertCondition06(dateRule(calculation, condition))));

  it('retains Gregorian limits, old anchor checks and cross-year validity', () => {
    for (const year of [1582, 10000, 2026.5, '2026', NaN, undefined]) {
      assert.throws(() => ruleDate06(stephen, year));
    }
    const shifted = dateRule({ type: 'nthWeekdayOffsetDays', month: 12, isoWeekday: 4, occurrence: 5, offsetDays: 1 },
      'always', { from: '2027-01-01', to: '2027-01-01' });
    assert.equal(ruleDate06(shifted, 2026), '2027-01-01');
    assert.equal(evaluateRule06({ ...shifted, to: '2026-12-31', from: '2026-01-01' }, 2026).status, 'outsideValidity');
    assert.throws(() => ruleDate06(dateRule(fixed(2, 29)), 2027), /Invalid fixed date/);
    assert.throws(() => ruleDate06(dateRule({ type: 'nthWeekdayOfMonth', month: 2, isoWeekday: 1, occurrence: 5 }), 2026), /outside month/);
  });

  it('accepts exactly four explicit conditions and does not silently approve the candidate contract', () => {
    assert.equal(RULE_CONDITIONS_06.length, 4);
    for (const changed of [{ contractStatus: 'approved' }, { approvalBasis: 'David Steimer' },
      { runtimeEnabled: true }, { extra: 'unused' }]) {
      const candidate = clone(model);
      Object.assign(candidate.contract06Review, changed);
      assert.throws(() => validateContract06(candidate), /candidate status/);
    }
    const wrongVersion = clone(model);
    wrongVersion.contractVersion = '0.5.0';
    assert.throws(() => validateContract06(wrongVersion), /contract 0.6.0/);
  });
});
