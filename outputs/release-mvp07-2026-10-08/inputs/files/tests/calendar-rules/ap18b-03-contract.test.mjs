// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPilotModel, validateModel, ruleDate } from '../../scripts/ap18a-model.mjs';
import { validateAreaAssignments } from '../../scripts/ap18a-area-assignments.mjs';
import { createTiGrPackageModel } from '../../scripts/ap18b-ti-gr-model.mjs';
import { PROVISIONAL_TI_RM_LABELS } from '../../scripts/ap18b-rg-labels.mjs';
import { CONTRACT_VERSION, DAY_PORTIONS, assertCalculation05, ruleDate05,
  createContract05Model, validateContract05 } from '../../scripts/ap18b-03-contract.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const model = await createContract05Model(root);
const legacy = await createTiGrPackageModel(root);
const clone = value => structuredClone(value);
const dateRule = (calculation, extra = {}) => ({ calculation,
  from: '1583-01-01', to: null, dayPortion: 'fullDay', ...extra });
const shifted = (month, isoWeekday, occurrence, offsetDays) => ({
  type: 'nthWeekdayOffsetDays', month, isoWeekday, occurrence, offsetDays
});
const editable = candidate => candidate.rules.find(rule => rule.id === 'TI-CAL-DAY-EPIPHANY');

describe('AP18B-03: ausdrückliche Migration des V0.8-Bestands', () => {
  it('migriert genau 116 Regeln ohne Änderung bestehender Rechtsdaten oder Datumswerte', () => {
    assert.equal(model.contractVersion, CONTRACT_VERSION);
    assert.equal(model.rules.length, 116);
    assert.deepEqual(model.contract05Migration.migratedRuleIds, legacy.rules.map(rule => rule.id));
    assert.ok(model.rules.every(rule => rule.dayPortion === 'fullDay'));
    for (let index = 0; index < legacy.rules.length; index++) {
      const original = clone(legacy.rules[index]);
      const overlay = PROVISIONAL_TI_RM_LABELS.find(label => label.ruleId === original.id);
      if (overlay) original.rm = overlay.rm;
      const migrated = clone(model.rules[index]);
      delete migrated.dayPortion;
      assert.deepEqual(migrated, original, original.id);
      for (const year of [2026, 2027, 2028]) {
        assert.equal(ruleDate05(model.rules[index], year), ruleDate(legacy.rules[index], year), `${original.id}/${year}`);
      }
    }
    assert.equal(model.contract05Review.dayPortionStatus, 'open');
    assert.equal(model.contract05Review.approvalBasis, null);
    assert.equal(model.contract05Review.runtimeEnabled, false);
    assert.equal(validateContract05(model), true);
  });

  it('hält historische Seeds und ihren bisherigen Validator unverändert verwendbar', async () => {
    assert.equal(legacy.contractVersion, '0.1.0');
    assert.ok(legacy.rules.every(rule => !Object.hasOwn(rule, 'dayPortion')));
    assert.equal(validateModel(legacy), true);
    const base = await createPilotModel(root);
    base.rules.at(-1).dayPortion = 'afternoonFromNoon';
    assert.equal(validateModel(base), true, 'Historischer Charakterisierungstest bleibt reproduzierbar');
    assert.throws(() => ruleDate(dateRule(shifted(9, 7, 1, 4)), 2026), /Unsupported calculation/);
    assert.throws(() => validateContract05(legacy), /Explicit workbook contract/);
  });
});

describe('AP18B-03: Kalendertag nach Monatswochentag und Abstand', () => {
  it('akzeptiert den ausdrücklichen neuen Typ auch im vollständigen Vertragsvalidator', () => {
    const candidate = clone(model);
    editable(candidate).calculation = shifted(9, 7, 1, 4);
    assert.equal(validateContract05(candidate), true);
    assert.equal(ruleDate05(editable(candidate), 2026), '2026-09-10');
  });

  it('trifft den Genfer Bettag über einen Gregorianischen 400-Jahre-Zyklus', () => {
    const rule = dateRule(shifted(9, 7, 1, 4));
    for (let year = 2000; year < 2400; year++) {
      // Independent oracle: Thursday in the fixed day-of-month window 5–11.
      const day = Array.from({ length: 7 }, (_, i) => i + 5)
        .find(d => new Date(Date.UTC(year, 8, d)).getUTCDay() === 4);
      assert.equal(ruleDate05(rule, year), `${year}-09-${String(day).padStart(2, '0')}`);
    }
  });

  for (const [label, calculation, year, expected] of [
    ['Monatswechsel rückwärts', shifted(9, 7, 1, -7), 2026, '2026-08-30'],
    ['Jahreswechsel vorwärts', shifted(12, 4, 5, 1), 2026, '2027-01-01'],
    ['Jahreswechsel rückwärts', shifted(1, 4, 1, -1), 2026, '2025-12-31'],
    ['oberer Abstand 366', shifted(1, 4, 1, 366), 2026, '2027-01-02'],
    ['unterer Abstand -366', shifted(1, 4, 1, -366), 2026, '2024-12-31'],
    ['Nullabstand', shifted(9, 7, 1, 0), 2026, '2026-09-06'],
    ['Sommerzeitgrenze als Kalendertag', shifted(3, 7, 5, 1), 2026, '2026-03-30']
  ]) it(label, () => assert.equal(ruleDate05(dateRule(calculation), year), expected));

  it('prüft inklusive Gültigkeit am Resultat nach dem Jahreswechsel', () => {
    const rule = dateRule(shifted(12, 4, 5, 1), { from: '2027-01-01', to: '2027-01-01' });
    assert.equal(ruleDate05(rule, 2026), '2027-01-01');
    assert.equal(ruleDate05({ ...rule, from: '2027-01-02', to: null }, 2026), null);
    assert.equal(ruleDate05({ ...rule, from: '2026-01-01', to: '2026-12-31' }, 2026), null);
    assert.throws(() => ruleDate05({ ...rule, from: '2027-01-02' }, 2026), /Reversed validity/);
  });

  it('weist nicht existierende Anker vor jeder Verschiebung ab', () => {
    assert.throws(() => ruleDate05(dateRule(shifted(2, 1, 5, 10)), 2026), /anchor outside month/);
    assert.throws(() => ruleDate05(dateRule({ type: 'fixedMonthDay', month: 2, day: 29 }), 2027), /Invalid fixed date/);
    assert.equal(ruleDate05(dateRule({ type: 'fixedMonthDay', month: 2, day: 29 }), 2028), '2028-02-29');
    const invalid = clone(model);
    editable(invalid).calculation = shifted(2, 1, 5, 10);
    assert.throws(() => validateContract05(invalid), /anchor outside month/);
  });

  it('weist verschobene Resultate ausserhalb 1583–9999 auch vor der Gültigkeitsfilterung ab', () => {
    assert.throws(() => ruleDate05(dateRule(shifted(1, 1, 1, -366)), 1583), /outside supported Gregorian range/);
    assert.throws(() => ruleDate05(dateRule(shifted(12, 1, 1, 366)), 9999), /outside supported Gregorian range/);
    assert.throws(() => ruleDate05(dateRule({ type: 'easterOffsetDays', offsetDays: 366 }), 9999), /outside supported Gregorian range/);
    assert.throws(() => ruleDate05(dateRule(shifted(9, 7, 1, 4)), 1582), /Gregorian anchor year/);
    assert.throws(() => ruleDate05(dateRule(shifted(9, 7, 1, 4)), 10000), /Gregorian anchor year/);
  });
});

describe('AP18B-03: strikte Felder und begrenzter Tagesumfang', () => {
  for (const [label, calculation] of [
    ['Offset beim alten Monatswochentag', { type: 'nthWeekdayOfMonth', month: 9, isoWeekday: 7, occurrence: 1, offsetDays: 4 }],
    ['Offset beim Fixdatum', { type: 'fixedMonthDay', month: 1, day: 1, offsetDays: 0 }],
    ['Monat beim Osterabstand', { type: 'easterOffsetDays', offsetDays: 0, month: 4 }],
    ['Fehlender Offset', { type: 'nthWeekdayOffsetDays', month: 9, isoWeekday: 7, occurrence: 1 }],
    ['Zu grosser Offset', shifted(9, 7, 1, 367)],
    ['Zu kleiner Offset', shifted(9, 7, 1, -367)],
    ['Bruchteil eines Tages', shifted(9, 7, 1, 0.5)],
    ['Offset als Text', shifted(9, 7, 1, '4')],
    ['Ungültiger Monat', shifted(13, 7, 1, 4)],
    ['Ungültiger Wochentag', shifted(9, 0, 1, 4)],
    ['Ungültiges Vorkommen', shifted(9, 7, 6, 4)],
    ['Nicht existierendes Fixdatum', { type: 'fixedMonthDay', month: 4, day: 31 }],
    ['Allgemeine Bedingungslogik', { type: 'conditionalShift', offsetDays: 1 }]
  ]) it(`weist ab: ${label}`, () => assert.throws(() => assertCalculation05(calculation)));

  for (const [label, mutate] of [
    ['fehlender Tagesumfang', r => { delete r.dayPortion; }],
    ['unbekannter Tagesumfang', r => { r.dayPortion = 'morning'; }],
    ['unbekanntes Regelfeld', r => { r.conditionalShift = true; }],
    ['Stundenparameter', r => { r.startHour = 12; }],
    ['ungültiger Gültigkeitsbeginn', r => { r.from = '2026-02-30'; }],
    ['fehlendes Gültigkeitsende', r => { delete r.to; }],
    ['offene Regel mit Freigabebasis', r => { r.approvalBasis = model.baseline; }]
  ]) it(`weist ab: ${label}`, () => {
    const invalid = clone(model);
    mutate(editable(invalid));
    assert.throws(() => validateContract05(invalid));
  });

  it('speichert den Halbtag ohne verändertes Datum oder Freigabe einer Fristwirkung', () => {
    assert.deepEqual(DAY_PORTIONS, ['fullDay', 'afternoonFromNoon']);
    const candidate = clone(model);
    const rule = editable(candidate);
    rule.calculation = { type: 'fixedMonthDay', month: 5, day: 1 };
    rule.dayPortion = 'afternoonFromNoon';
    assert.equal(ruleDate05(rule, 2026), '2026-05-01');
    assert.equal(validateContract05(candidate), true);
    rule.exportClass = 'blockedScope';
    assert.throws(() => validateContract05(candidate), /Partial day requires blocked effect/);
    const invalidReference = clone(model);
    invalidReference.rules[0].dayPortion = 'afternoonFromNoon';
    assert.throws(() => validateContract05(invalidReference), /no inherited approval/);
  });

  it('verleiht den neuen Metadaten keine Produktfreigabe', () => {
    for (const changed of [{ dayPortionStatus: 'approved' }, { approvalBasis: model.baseline }, { runtimeEnabled: true }]) {
      const invalid = clone(model);
      Object.assign(invalid.contract05Review, changed);
      assert.throws(() => validateContract05(invalid), /no product approval/);
    }
  });
});

function splitSourceModel() {
  const candidate = clone(model);
  const assignment = candidate.assignments.find(row => row.scopeId === 'TI-OFFICIAL-ALL')
    ?? candidate.assignments.find(row => row.areaId === 'GEO-TI');
  const scope = candidate.scopes.find(row => row[0] === assignment.scopeId);
  const source = clone(candidate.sources.find(row => row[0] === scope[5]));
  source[0] = 'SRC-CHECK-TI-AREA';
  source[2] = 'Synthetischer räumlicher Anwendungsbeleg';
  source[3] = 'Synthetischer Gebietsnachweis';
  candidate.sources.push(source);
  assignment.sourceId = source[0];
  assignment.locator = source[3];
  candidate.areaSourceEvidence = [{ assignmentId: assignment.id, scopeId: scope[0],
    normSourceId: scope[5], areaSourceId: source[0], locator: source[3],
    checkedOn: '2026-09-13', checkedBy: 'Synthetischer Test',
    note: 'Getrennter Gebietsnachweis zur konkreten Normquelle. Keine Rechtsdaten.' }];
  return candidate;
}

describe('AP18B-03: belegte Quellenbeziehung statt pauschaler Öffnung', () => {
  it('akzeptiert genau die belegte Beziehung und hält den historischen Standard geschlossen', () => {
    const candidate = splitSourceModel();
    assert.equal(validateContract05(candidate), true);
    assert.throws(() => validateAreaAssignments(candidate.assignments, candidate), /Assignment source differs/);
    candidate.contractVersion = '0.1.0';
    assert.throws(() => validateAreaAssignments(candidate.assignments, candidate,
      { sourceEvidence: candidate.areaSourceEvidence }), /requires contract 0.5.0/);
  });

  for (const [label, mutate] of [
    ['fehlender Beleg', m => { m.areaSourceEvidence = []; }],
    ['unbekannte Quelle', m => { m.areaSourceEvidence[0].areaSourceId = 'UNKNOWN'; }],
    ['andere Zuordnung', m => { m.areaSourceEvidence[0].assignmentId = m.assignments[0].id; }],
    ['andere Normquelle', m => { m.areaSourceEvidence[0].normSourceId = m.sources[0][0]; }],
    ['andere Fundstelle als sichtbarer Gebietsbeleg', m => { m.areaSourceEvidence[0].locator = 'Andere Fundstelle'; }],
    ['anderer Kanton', m => { m.sources.at(-1)[1] = 'CH-GR'; }],
    ['leerer Prüfhinweis', m => { m.areaSourceEvidence[0].note = ''; }],
    ['ungültiges Prüfdatum', m => { m.areaSourceEvidence[0].checkedOn = '2026-02-30'; }],
    ['unbekanntes Belegfeld', m => { m.areaSourceEvidence[0].allowAny = true; }],
    ['doppelter Beleg', m => { m.areaSourceEvidence.push(clone(m.areaSourceEvidence[0])); }]
  ]) it(`weist ab: ${label}`, () => {
    const invalid = splitSourceModel();
    mutate(invalid);
    assert.throws(() => validateContract05(invalid));
  });
});
