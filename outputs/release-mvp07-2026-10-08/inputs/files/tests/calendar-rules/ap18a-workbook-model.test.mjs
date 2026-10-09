// SPDX-License-Identifier: AGPL-3.0-only
// Run with node --import tsx --test tests/calendar-rules/ap18a-workbook-model.test.mjs.
// The immutable expanded MVP-0.2 calendar is an oracle independent of AP18A date code.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { createPilotModel, validateModel, ruleDate, easterDate } from '../../scripts/ap18a-model.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const baseline = '2026-08-31-mvp-03-approved.1';
const baselineDirectory = path.join(root, 'data/releases', baseline);
const json = async file => JSON.parse(await readFile(file, 'utf8'));
const model = await createPilotModel(root);
const manifest = await json(path.join(baselineDirectory, 'manifest.json'));
const ch = await json(path.join(baselineDirectory, 'calendars/ch-federal-calendar.json'));
const be = await json(path.join(baselineDirectory, 'calendars/be-public-holidays.json'));
const referenceRules = [...ch.rules, ...be.rules].filter(rule => rule.effect.type === 'holiday');
const referenceById = new Map(referenceRules.map(rule => [rule.ruleId, rule]));
const clone = value => structuredClone(value);
const approvedRule = candidate => candidate.rules.find(rule => rule.id === 'CH-CAL-HOL-NATIONAL-DAY');
const expectedHashes = {
  'manifest.json': '74583fa4dc9cab8ed99af3f9202782d90b02e9e47578f1dd9d2da40d19357be8',
  'calendars/ch-federal-calendar.json': 'c851d4839e06ad714aba988b6c92e9ae81c27a507cc004bf0f89046650a3c5c7',
  'calendars/be-public-holidays.json': '6051094d6179f99276cb55cad0f88e562da02c2396dffcf213d0ac165807d121'
};

let generateCalendarFromRules;
try {
  ({ generateCalendarFromRules } = await import('../../src/core/generateCalendar.ts'));
} catch (error) {
  // Plain Node may not understand TypeScript. Other import failures must remain failures.
  if (!['ERR_UNKNOWN_FILE_EXTENSION', 'ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING',
    'ERR_MODULE_NOT_FOUND'].includes(error.code)) throw error;
  if (error.code === 'ERR_MODULE_NOT_FOUND' && !String(error.message).includes('/src/core/date')) throw error;
}

function holidayRows(candidate, jurisdiction, year) {
  return candidate.rules
    .filter(rule => rule.status === 'approved' && rule.category === 'publicHoliday'
      && rule.jurisdiction === jurisdiction)
    .map(rule => {
      const date = ruleDate(rule, year);
      const reference = referenceById.get(rule.id);
      assert.ok(reference, `Unbekannte freigegebene Referenz ${rule.id}`);
      return date === null ? null : {
        holidayId: `${reference.jurisdiction.code}-${date}-${reference.effect.resultIdSuffix}`,
        date,
        kind: reference.effect.kind,
        labelKey: reference.labelKey,
        legalEffect: reference.effect.legalEffect,
        sourceRefs: [{ sourceId: rule.source, locator: rule.locator }]
      };
    }).filter(Boolean).sort(compareHolidays);
}

function compareHolidays(left, right) {
  return left.date.localeCompare(right.date) || left.holidayId.localeCompare(right.holidayId);
}

function rejection(name, mutate) {
  it(name, () => {
    const invalid = clone(model);
    mutate(invalid);
    assert.throws(() => validateModel(invalid), Error, name);
  });
}

describe('AP18A: Umfang, freigegebene Referenz und unveränderte Basis', () => {
  it('erfasst genau CH und die 26 tatsächlichen Kantonscodes', () => {
    const cantons = ['AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU',
      'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'];
    assert.deepEqual(model.jurisdictions.map(row => row[0]).sort(),
      ['CH', ...cantons.map(code => `CH-${code}`)].sort());
    assert.ok(model.jurisdictions.filter(row => row[0] !== 'CH').every(row => row[3] === 'CH'));
    assert.equal(validateModel(model), true);
  });

  it('enthält genau zwölf freigegebene Feiertagsreferenzen und übernimmt diese verlustfrei', () => {
    const approved = model.rules.filter(rule => rule.status === 'approved');
    assert.equal(approved.length, 12);
    assert.equal(approved.filter(rule => rule.jurisdiction === 'CH').length, 1);
    assert.equal(approved.filter(rule => rule.jurisdiction === 'CH-BE').length, 11);
    assert.deepEqual(approved.map(rule => rule.id).sort(), [...referenceById.keys()].sort());
    for (const rule of approved) {
      const reference = referenceById.get(rule.id);
      assert.deepEqual(rule.reference, reference, rule.id);
      assert.deepEqual(rule.calculation, reference.calculation, rule.id);
      assert.deepEqual([rule.from, rule.to], [reference.validity.from, reference.validity.to]);
      assert.deepEqual([rule.de, rule.fr], [reference.labels.de, reference.labels.fr]);
      assert.deepEqual([{ sourceId: rule.source, locator: rule.locator }], reference.sourceRefs);
      assert.equal(rule.priority, reference.priority);
      assert.equal(rule.approvalBasis, baseline);
      assert.equal(rule.category, 'publicHoliday');
      assert.equal(rule.exportClass, 'referenceOnly');
    }
  });

  it('hält die drei Stillstandsregel-IDs getrennt von den Feiertagszeilen', () => {
    const expected = ['CH-CAL-SUSP-EASTER', 'CH-CAL-SUSP-SUMMER', 'CH-CAL-SUSP-YEAR-END'];
    assert.deepEqual([...model.preservedSuspensionRules].sort(), expected);
    assert.deepEqual(ch.rules.filter(rule => rule.effect.type === 'suspensionPeriod')
      .map(rule => rule.ruleId).sort(), expected);
    assert.ok(model.rules.every(rule => !expected.includes(rule.id)));
    assert.ok(ch.rules.filter(rule => expected.includes(rule.ruleId))
      .every(rule => rule.effect.suspensionSetId === 'ch-court-holidays'));
  });

  it('verankert Prüfsummen im bekannten Approved-Stand und im Manifest', async () => {
    assert.equal(model.baseline, baseline);
    assert.equal(manifest.releaseId, baseline);
    assert.equal(manifest.releaseStatus, 'approved');
    assert.equal(manifest.immutable, true);
    assert.equal(manifest.formatVersion, '3.0.0');
    assert.equal(manifest.compatibility.minimumConsumerFormatVersion, '3.0.0');
    assert.deepEqual(model.hashes, expectedHashes);
    for (const [file, expectedHash] of Object.entries(expectedHashes)) {
      const bytes = await readFile(path.join(baselineDirectory, file));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), expectedHash, file);
      if (file !== 'manifest.json') {
        const artifact = manifest.artifacts.find(entry => entry.path === file);
        assert.equal(artifact.sha256, expectedHash, file);
        assert.equal(artifact.byteLength, bytes.length, file);
      }
    }
  });

  it('verleiht dem AG-Strukturpiloten keine Referenzfreigabe oder generelle Feiertagswirkung', () => {
    const ag = model.rules.filter(rule => rule.jurisdiction === 'CH-AG');
    assert.ok(ag.length > 0);
    assert.ok(ag.every(rule => rule.status !== 'approved' && rule.approvalBasis === null));
    assert.ok(ag.every(rule => rule.exportClass !== 'referenceOnly' && rule.reference === null));
    assert.ok(ag.some(rule => rule.category === 'labourLawHoliday'));
    assert.ok(ag.some(rule => rule.category === 'proceduralEquivalentDay'));
    assert.ok(ag.every(rule => rule.category !== 'publicHoliday'));
  });
});

describe('AP18A: unabhängige Datums- und Generatorparität', () => {
  for (const year of [2026, 2027, 2028]) {
    it(`rekonstruiert die abgenommenen, ausgeprägten CH-/BE-Datumslisten für ${year}`, async () => {
      for (const [jurisdiction, file, count] of [
        ['CH', 'ch-federal-calendar.json', 1], ['CH-BE', 'be-public-holidays.json', 11]
      ]) {
        const legacy = await json(path.join(root,
          'data/releases/2026-08-31-mvp-02-approved.1/calendars', file));
        const expected = legacy.holidays.filter(holiday => holiday.date.startsWith(`${year}-`))
          .sort(compareHolidays);
        assert.equal(expected.length, count);
        assert.deepEqual(holidayRows(model, jurisdiction, year), expected);
      }
    });

    it(`entspricht dem vorhandenen TypeScript-Generator mit BE-Vererbung für ${year}`, t => {
      if (!generateCalendarFromRules) {
        t.skip('Für den zusätzlichen TypeScript-Vergleich mit node --import tsx starten. Legacy-Parität läuft immer.');
        return;
      }
      const range = { from: `${year}-01-01`, to: `${year}-12-31` };
      const federal = holidayRows(model, 'CH', year);
      const bernese = [...federal, ...holidayRows(model, 'CH-BE', year)].sort(compareHolidays);
      assert.deepEqual(federal, generateCalendarFromRules([ch, be], 'ch-federal-calendar', range).calendar.holidays);
      assert.deepEqual(bernese, generateCalendarFromRules([ch, be], 'be-public-holidays', range).calendar.holidays);
      assert.equal(bernese.length, 12);
    });
  }

  it('trifft die unabhängig abgenommenen Jahrhundert-Orakel für Ostern', async () => {
    const suite = await json(path.join(root, 'tests/calendar-rules/candidates/ap12a-reference-cases.json'));
    const cases = suite.algorithmCases.filter(entry => entry.calculation.type === 'easterOffsetDays'
      && entry.calculation.offsetDays === 0);
    assert.deepEqual(cases.map(entry => entry.year).sort(), [1900, 2000, 2100, 2400]);
    for (const entry of cases) {
      assert.equal(easterDate(entry.year).toISOString().slice(0, 10), entry.expected.date, entry.caseId);
    }
  });

  it('berücksichtigt die inklusive Gültigkeit und ein offenes Gültigkeitsende', () => {
    const rule = clone(approvedRule(model));
    rule.from = '2027-08-01';
    rule.to = '2027-08-01';
    assert.equal(ruleDate(rule, 2026), null);
    assert.equal(ruleDate(rule, 2027), '2027-08-01');
    assert.equal(ruleDate(rule, 2028), null);
    rule.to = null;
    assert.equal(ruleDate(rule, 2028), '2028-08-01');
  });
});

describe('AP18A: negative Vertrags- und Freigabefälle', () => {
  rejection('weist doppelte Regel-IDs ab', m => m.rules.push(clone(m.rules[0])));
  rejection('weist doppelte Quellen-IDs ab', m => m.sources.push(clone(m.sources[0])));
  rejection('weist doppelte Scope-IDs ab', m => m.scopes.push(clone(m.scopes[0])));
  rejection('weist unbekannte Regelquellen ab', m => { approvedRule(m).source = 'SRC-UNKNOWN'; });
  rejection('weist unbekannte Regelgeltungsbereiche ab', m => { approvedRule(m).scope = 'UNKNOWN'; });
  rejection('weist einen existierenden, aber fremdkantonalen Scope ab', m => {
    m.rules.find(rule => rule.jurisdiction === 'CH-BE').scope = 'CH-ALL';
  });
  rejection('weist einen unbekannten Quellenbezug eines Scope ab', m => { m.scopes[0][5] = 'SRC-UNKNOWN'; });
  rejection('weist einen unbekannten Scope einer Verfahrenszuordnung ab', m => { m.mappings[0][1] = 'UNKNOWN'; });
  rejection('weist eine unbekannte Quelle im Prüfereignis ab', m => { m.reviews[0][1] = 'SRC-UNKNOWN'; });
  rejection('weist einen erfundenen Kantonscode trotz insgesamt 27 Zeilen ab', m => {
    m.jurisdictions.find(row => row[0] === 'CH-ZH')[0] = 'CH-XX';
  });
  rejection('weist einen unbekannten Regelstatus ab', m => { approvedRule(m).status = 'verified'; });
  rejection('weist einen unbekannten Quellen-Arbeitsstatus ab', m => { m.sources[0][8] = 'verified'; });
  rejection('weist einen unbekannten Scope-Arbeitsstatus ab', m => { m.scopes[0][7] = 'verified'; });
  rejection('weist einen unbekannten Zuordnungsstatus ab', m => { m.mappings[0][6] = 'verified'; });
  rejection('weist einen unbekannten Prüfereignisstatus ab', m => { m.reviews[0][7] = 'open'; });
  rejection('weist einen unbekannten Quellenprüfausgang ab', m => { m.reviews[0][4] = 'approved'; });
  rejection('weist eine Freigabe ohne Basis ab', m => { approvedRule(m).approvalBasis = null; });
  rejection('weist eine erfundene Freigabebasis ab', m => { approvedRule(m).approvalBasis = 'self-approved'; });
  rejection('weist einen fremden Referenzrelease ab', m => { m.baseline = '2099-01-01-unapproved.1'; });
  rejection('weist eine als approved markierte AG-Erweiterung ohne Referenzfreigabe ab', m => {
    const rule = m.rules.find(entry => entry.jurisdiction === 'CH-AG');
    rule.status = 'approved';
    rule.approvalBasis = baseline;
  });
  rejection('weist eine unbekannte Exportklasse ab', m => { approvedRule(m).exportClass = 'production'; });
  rejection('weist einen Referenzexport mit besonderer Verfahrenswirkung ab', m => {
    approvedRule(m).category = 'proceduralEquivalentDay';
  });
  rejection('weist einen Referenzexport ohne erhaltene Referenzregel ab', m => { approvedRule(m).reference = null; });
  rejection('weist eine gegenüber der Referenz geänderte Feiertagsberechnung ab', m => {
    const rule = approvedRule(m);
    rule.calculation = { ...rule.calculation, day: 2 };
  });
  rejection('weist eine unbekannte Aktion ab', m => { approvedRule(m).action = 'merge'; });
  rejection('weist im Pilot nicht implementiertes suppress ab', m => { approvedRule(m).action = 'suppress'; });
  rejection('weist einen unbekannten Regeltyp ab', m => { approvedRule(m).calculation.type = 'freeFormula'; });
  rejection('weist eine umgekehrte Gültigkeit ab', m => { approvedRule(m).to = '1900-01-01'; });
  rejection('weist ein unmögliches Gültigkeitsdatum ab', m => { approvedRule(m).from = '2026-02-30'; });
  rejection('weist den 30. Februar als Fixdatum ab', m => {
    approvedRule(m).calculation = { type: 'fixedMonthDay', month: 2, day: 30 };
  });
  rejection('weist einen gebrochenen Osterabstand ab', m => {
    approvedRule(m).calculation = { type: 'easterOffsetDays', offsetDays: 1.5 };
  });
  rejection('weist einen ungültigen ISO-Wochentag ab', m => {
    approvedRule(m).calculation = { type: 'nthWeekdayOfMonth', month: 9, isoWeekday: 8, occurrence: 3 };
  });
});

describe('AP18A: Datumsfehler dürfen nicht still normalisiert werden', () => {
  const rule = calculation => ({ calculation, from: '2026-01-01', to: null });
  it('blockiert den 30. Februar in ruleDate', () => {
    assert.throws(() => ruleDate(rule({ type: 'fixedMonthDay', month: 2, day: 30 }), 2026));
  });
  it('blockiert ein fünftes Wochentagsvorkommen, das den Monat verlässt', () => {
    assert.throws(() => ruleDate(rule({
      type: 'nthWeekdayOfMonth', month: 2, isoWeekday: 1, occurrence: 5
    }), 2026));
  });
  it('blockiert einen Osterabstand mit Tagesbruchteilen', () => {
    assert.throws(() => ruleDate(rule({ type: 'easterOffsetDays', offsetDays: 1.5 }), 2026));
  });
});
