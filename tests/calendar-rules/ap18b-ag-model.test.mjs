// SPDX-License-Identifier: AGPL-3.0-only
// Source oracle: docs/fachrecht/quellenpaket-ap18b-01-ag-entwurf.md, sections 2–4.
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { BASELINE, createPilotModel, ruleDate } from '../../scripts/ap18a-model.mjs';
import { createAreaAssignments, BJ_HINTS_URL } from '../../scripts/ap18a-area-assignments.mjs';
import { createAgPackageModel, validateAgPackageModel } from '../../scripts/ap18b-ag-model.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const baseline = await createPilotModel(root);
const model = await createAgPackageModel(root);
const clone = value => structuredClone(value);
const sorted = values => [...values].sort();
const profile = branch => model.profiles.find(item => item.branch === branch);
const rules = branch => model.rules.filter(rule => rule.scope === profile(branch).scopeId);
const agRule = candidate => candidate.rules.find(rule => rule.id === 'AG-WORK-HOL-A-NEW-YEAR');
const rejected = (name, mutate) => it(name, () => {
  const candidate = clone(model);
  mutate(candidate);
  assert.throws(() => validateAgPackageModel(candidate), Error);
});

// Separately transcribed from the eight branches, without importing profile constants.
const expected = {
  a: 'NEW-YEAR BERCHTOLD GOOD-FRIDAY EASTER-MONDAY ASCENSION WHIT-MONDAY CHRISTMAS ST-STEPHEN',
  b1: 'NEW-YEAR BERCHTOLD GOOD-FRIDAY EASTER-MONDAY ASCENSION WHIT-MONDAY CHRISTMAS ST-STEPHEN',
  b2: 'NEW-YEAR GOOD-FRIDAY EASTER-MONDAY ASCENSION WHIT-MONDAY CORPUS-CHRISTI CHRISTMAS ST-STEPHEN',
  c: 'NEW-YEAR GOOD-FRIDAY ASCENSION CORPUS-CHRISTI ASSUMPTION ALL-SAINTS CHRISTMAS ST-STEPHEN',
  d: 'NEW-YEAR GOOD-FRIDAY ASCENSION CORPUS-CHRISTI ASSUMPTION ALL-SAINTS IMMACULATE-CONCEPTION CHRISTMAS',
  e1: 'NEW-YEAR GOOD-FRIDAY ASCENSION CORPUS-CHRISTI ASSUMPTION ALL-SAINTS IMMACULATE-CONCEPTION CHRISTMAS',
  e2: 'NEW-YEAR GOOD-FRIDAY EASTER-MONDAY ASCENSION WHIT-MONDAY ALL-SAINTS CHRISTMAS ST-STEPHEN',
  f: 'NEW-YEAR BERCHTOLD GOOD-FRIDAY ASCENSION CORPUS-CHRISTI ALL-SAINTS CHRISTMAS ST-STEPHEN',
  zpo: 'NEW-YEAR BERCHTOLD GOOD-FRIDAY EASTER-MONDAY MAY1 ASCENSION WHIT-MONDAY CORPUS-CHRISTI NATIONAL-DAY ASSUMPTION ALL-SAINTS IMMACULATE-CONCEPTION CHRISTMAS ST-STEPHEN'
};

describe('AP18B-01: vollständige, getrennte Aargauer Normzweige', () => {
  it('validiert das Paket mit exakt 90 Regeln, davon 75 Ergänzungen', () => {
    assert.equal(validateAgPackageModel(model), true);
    assert.equal(model.rules.length, 90);
    assert.equal(model.rules.length - baseline.rules.length, 75);
    assert.equal(model.scopes.length, 11);
    assert.equal(model.assignments.length, 29);
    assert.equal(model.profiles.length, 9);
    assert.equal(model.rules.filter(rule => rule.category === 'labourLawHoliday').length, 64);
    assert.equal(model.rules.filter(rule => rule.category === 'proceduralEquivalentDay').length, 14);
  });

  for (const [branch, keys] of Object.entries(expected)) {
    it(`übernimmt die exakte Feiertagsmenge des Normzweigs ${branch}`, () => {
      assert.deepEqual(sorted(profile(branch).holidayKeys), sorted(keys.split(' ')));
      assert.deepEqual(sorted(rules(branch).map(rule => model.ruleKeys[rule.id])), sorted(keys.split(' ')));
      assert.equal(new Set(rules(branch).map(rule => model.ruleKeys[rule.id])).size, branch === 'zpo' ? 14 : 8);
    });
  }

  it('führt acht regionale Zweige trotz nur sechs unterschiedlichen Mustern', () => {
    const labour = model.profiles.filter(item => item.kind === 'labour');
    assert.equal(labour.length, 8);
    assert.equal(new Set(labour.map(item => sorted(item.holidayKeys).join('|'))).size, 6);
    assert.notEqual(profile('a').scopeId, profile('b1').scopeId);
    assert.notEqual(profile('a').locator, profile('b1').locator);
    assert.notEqual(profile('d').scopeId, profile('e1').scopeId);
  });

  it('behält alle 15 bestehenden Regelobjekte sowie Scope- und Zuordnungs-IDs bei', () => {
    for (const rule of baseline.rules) assert.deepEqual(model.rules.find(item => item.id === rule.id), rule);
    for (const scope of baseline.scopes) assert.deepEqual(model.scopes.find(item => item[0] === scope[0]), scope);
    for (const assignment of createAreaAssignments(baseline)) {
      assert.deepEqual(model.assignments.find(item => item.id === assignment.id), assignment);
    }
    assert.deepEqual(model.hashes, baseline.hashes);
  });

  it('kopiert die Bundesregel nicht in arbeitsrechtliche Regeln', () => {
    const labour = model.rules.filter(rule => rule.category === 'labourLawHoliday');
    assert.ok(labour.every(rule => model.ruleKeys[rule.id] !== 'NATIONAL-DAY'));
    assert.equal(model.rules.filter(rule => rule.id === 'CH-CAL-HOL-NATIONAL-DAY').length, 1);
    assert.equal(rules('zpo').filter(rule => model.ruleKeys[rule.id] === 'NATIONAL-DAY').length, 1);
    // Calendar view: CH1 + BE(11+CH1) + eight(8+CH1) + ZPO14 = 99,
    // with no second federal row added to the ZPO profile.
    assert.equal(1 + 12 + 8 * 9 + 14, 99);
  });

  it('erfasst in AG weder zusätzliche Oster-/Pfingstsonntage noch einen Ersatzmontag', () => {
    assert.ok(model.rules.filter(rule => rule.jurisdiction === 'CH-AG').every(rule =>
      !['EASTER', 'PENTECOST'].includes(model.ruleKeys[rule.id])
      && !Object.hasOwn(rule.calculation, 'observedDate')));
  });

  it('begrenzt alle AG-Fachstatus und Prüfereignisse ohne Freigabevererbung', () => {
    assert.ok(model.rules.filter(rule => rule.jurisdiction === 'CH-AG').every(rule =>
      rule.status === 'open' && rule.approvalBasis === null && rule.reference === null
      && rule.exportClass !== 'referenceOnly'));
    assert.ok(model.scopes.filter(scope => scope[1] === 'CH-AG').every(scope => scope[7] === 'open'));
    assert.ok(model.sources.filter(source => source[1] === 'CH-AG').every(source => source[8] === 'open' && source[9] === null));
    assert.ok(model.reviews.every(review => review[7] === 'candidate'));
    assert.ok(model.assignments.every(row => row.status === 'open'));
  });

  it('hält das AWA-Merkblatt undatiert und unterscheidet Abruf von Normstand', () => {
    const source = model.sources.find(row => row[0] === 'SRC-AG-AWA-FEIERTAGE');
    assert.equal(source[5], null);
    assert.equal(source[6], '2026-09-13');
    assert.equal(model.sources.find(row => row[0] === 'SRC-BJ-FRISTENHINWEISE-20121217')[4], BJ_HINTS_URL);
    assert.notEqual(baseline.sources.find(row => row[0] === 'SRC-BJ-FRISTENHINWEISE-20121217')[4], BJ_HINTS_URL);
  });

  it('ergänzt drei Prüfkandidaten, ohne die vier früheren Ereignisse zu verändern', () => {
    assert.equal(model.reviews.length, 7);
    for (const review of baseline.reviews) assert.deepEqual(model.reviews.find(row => row[0] === review[0]), review);
    assert.deepEqual(model.reviews.filter(row => row[0].startsWith('AP18B')).map(row => [row[0], row[4], row[7]]), [
      ['AP18B-AG-EGARR-20260913', 'unchanged', 'candidate'],
      ['AP18B-AG-EGZPO-20260913', 'unchanged', 'candidate'],
      ['AP18B-AG-AWA-20260913', 'unclear', 'candidate']
    ]);
  });

  it('präzisiert den belegten ZPO-Normenbezug ohne eine Verfahrensfreigabe', () => {
    const mapping = model.mappings.find(row => row[0] === 'MAP-AG-ZPO');
    assert.equal(mapping[3], 'Art. 142 Abs. 3 ZPO / § 21 Abs. 1 EG ZPO');
    assert.equal(mapping[4], 'Orts-/Profilanknüpfung und Freigabe offen');
    assert.equal(mapping[6], 'open');
    assert.equal(mapping[7], null);
  });
});

describe('AP18B-01: explizite territoriale Abgrenzung', () => {
  const members = {
    a: ['Aarau', 'Brugg', 'Kulm', 'Lenzburg', 'Zofingen'], c: ['Bremgarten'],
    d: ['Laufenburg', 'Muri'], e1: ['Hellikon', 'Mumpf', 'Obermumpf', 'Schupfart', 'Stein', 'Wegenstetten'],
    e2: ['Kaiseraugst', 'Magden', 'Möhlin', 'Olsberg', 'Rheinfelden', 'Wallbach', 'Zeiningen', 'Zuzgen'], f: ['Zurzach']
  };
  for (const [branch, names] of Object.entries(members)) {
    it(`enthält die vollständigen Gebietsmitglieder des Zweigs ${branch}`, () => {
      const assignments = model.assignments.filter(row => row.scopeId === profile(branch).scopeId);
      assert.deepEqual(sorted(assignments.map(row => row.de.replace(/^(Bezirk|Gemeinde) /, ''))), sorted(names));
      assert.ok(assignments.every(row => row.effect === 'include' && row.parentAreaId === 'GEO-AG'));
    });
  }

  it('behält den ausdrücklichen Ausschluss Bergdietikons bei Baden', () => {
    assert.deepEqual(model.assignments.filter(row => row.scopeId === profile('b2').scopeId)
      .map(row => [row.areaId, row.effect]), [['GEO-AG-BADEN', 'include'], ['GEO-AG-BERGDIETIKON', 'exclude']]);
    assert.ok(rules('b2').some(rule => model.ruleKeys[rule.id] === 'CORPUS-CHRISTI'));
    assert.ok(rules('b1').every(rule => model.ruleKeys[rule.id] !== 'CORPUS-CHRISTI'));
  });

  it('trennt Mariä Empfängnis Hellikon/Rheinfelden und Allerheiligen Arbeitsrecht/ZPO', () => {
    assert.ok(rules('e1').some(rule => model.ruleKeys[rule.id] === 'IMMACULATE-CONCEPTION'));
    assert.ok(rules('e2').every(rule => model.ruleKeys[rule.id] !== 'IMMACULATE-CONCEPTION'));
    assert.ok(rules('a').every(rule => model.ruleKeys[rule.id] !== 'ALL-SAINTS'));
    assert.ok(rules('zpo').some(rule => model.ruleKeys[rule.id] === 'ALL-SAINTS'));
  });

  it('erfindet keine Rheinfelder Bezirkszuordnung, amtliche IDs oder Übersetzungen', () => {
    const added = model.assignments.filter(row => row.id.startsWith('AREA-AP18B-'));
    assert.equal(added.length, 23);
    assert.ok(added.every(row => row.fr === '' && row.it === '' && row.rm === ''
      && row.officialIdSystem === '' && row.officialId === ''));
    assert.ok(!added.some(row => row.areaType === 'Bezirk' && row.de === 'Bezirk Rheinfelden'));
    assert.ok(added.some(row => row.areaId === 'GEO-AG-BEZIRK-ZURZACH'));
    assert.ok(added.some(row => row.areaId === 'GEO-AG-GEMEINDE-RHEINFELDEN'));
  });
});

describe('AP18B-01: unabhängige Datenorakel 2026–2028', () => {
  const fixedDates = { 'NEW-YEAR': '01-01', BERCHTOLD: '01-02', MAY1: '05-01',
    'NATIONAL-DAY': '08-01', ASSUMPTION: '08-15', 'ALL-SAINTS': '11-01',
    'IMMACULATE-CONCEPTION': '12-08', CHRISTMAS: '12-25', 'ST-STEPHEN': '12-26' };
  const movingDates = {
    2026: { 'GOOD-FRIDAY': '04-03', 'EASTER-MONDAY': '04-06', ASCENSION: '05-14', 'WHIT-MONDAY': '05-25', 'CORPUS-CHRISTI': '06-04' },
    2027: { 'GOOD-FRIDAY': '03-26', 'EASTER-MONDAY': '03-29', ASCENSION: '05-06', 'WHIT-MONDAY': '05-17', 'CORPUS-CHRISTI': '05-27' },
    2028: { 'GOOD-FRIDAY': '04-14', 'EASTER-MONDAY': '04-17', ASCENSION: '05-25', 'WHIT-MONDAY': '06-05', 'CORPUS-CHRISTI': '06-15' }
  };
  for (const year of [2026, 2027, 2028]) {
    it(`trifft alle 78 AG-Regeldaten für ${year} ohne Verschiebung auf Ersatzwerktage`, () => {
      let compared = 0;
      for (const rule of model.rules.filter(item => item.jurisdiction === 'CH-AG')) {
        const key = model.ruleKeys[rule.id];
        const suffix = fixedDates[key] ?? movingDates[year][key];
        assert.ok(suffix, rule.id);
        assert.equal(ruleDate(rule, year), `${year}-${suffix}`, rule.id);
        compared++;
      }
      assert.equal(compared, 78);
    });
  }
  it('beginnt das geprüfte Datenfenster 2026 ohne eine Norminkraftsetzung zu behaupten', () => {
    for (const rule of model.rules.filter(item => item.jurisdiction === 'CH-AG')) {
      assert.equal(rule.from, '2026-01-01');
      assert.equal(rule.to, null);
      assert.equal(ruleDate(rule, 2025), null);
    }
    assert.equal(model.sources.find(source => source[0] === 'SRC-AG-EGARR-20250901')[5], '2025-09-01');
  });
});

describe('AP18B-01: negative Abdeckungs- und Freigabefälle', () => {
  rejected('weist eine fehlende Regel ab', m => { m.rules.pop(); });
  rejected('weist eine zusätzliche Bundesfeiertagskopie im ArG ab', m => {
    const rule = agRule(m); rule.calculation = { type: 'fixedMonthDay', month: 8, day: 1 }; m.ruleKeys[rule.id] = 'NATIONAL-DAY';
  });
  rejected('weist einen falschen Osterabstand ab', m => { m.rules.find(rule => rule.id === 'AG-WORK-HOL-CORPUS-CHRISTI').calculation.offsetDays = 59; });
  rejected('weist einen falschen Normzweig einer Regel ab', m => { agRule(m).scope = 'AG-ARG-BADEN'; });
  rejected('weist eine falsche Fundstelle ab', m => { agRule(m).locator = '§ 6 Abs. 1 Bst. f'; });
  rejected('weist veränderte Normzweiglisten ab', m => { m.profiles[0].holidayKeys.pop(); });
  rejected('weist fehlende Schlüsselbezüge ab', m => { delete m.ruleKeys[agRule(m).id]; });
  rejected('weist zusätzliche Schlüsselbezüge ab', m => { m.ruleKeys.UNKNOWN = 'NEW-YEAR'; });
  rejected('weist eine gefälschte Regelfreigabe ab', m => { agRule(m).status = 'approved'; });
  rejected('weist eine gefälschte Gebietskörperschaftsfreigabe ab', m => { m.jurisdictions.find(row => row[0] === 'CH-AG')[5] = 'approved'; });
  rejected('weist eine gefälschte Geltungsbereichsfreigabe ab', m => { m.scopes.find(row => row[0] === 'AG-ARG-BADEN')[7] = 'approved'; });
  rejected('weist eine gefälschte Quellenfreigabe trotz Referenzreleasekennung ab', m => {
    const source = m.sources.find(row => row[0] === 'SRC-AG-EGARR-20250901'); source[8] = 'approved'; source[9] = BASELINE;
  });
  rejected('weist eine als Bundesquelle umetikettierte AG-Quelle ab', m => {
    const source = m.sources.find(row => row[0] === 'SRC-AG-EGARR-20250901'); source[1] = 'CH'; source[8] = 'approved'; source[9] = BASELINE;
  });
  rejected('weist eine gefälschte Verfahrenszuordnungsfreigabe ab', m => {
    const mapping = m.mappings.find(row => row[0] === 'MAP-AG-ZPO'); mapping[6] = 'approved'; mapping[7] = BASELINE;
  });
  rejected('weist einen als freigegeben markierten Quellenprüfungskandidaten ab', m => { m.reviews.find(row => row[0] === 'AP18A-20260913-AG')[7] = 'approved'; });
  rejected('weist einen fehlenden neuen EG-ArR-Prüfkandidaten ab', m => { m.reviews = m.reviews.filter(row => row[0] !== 'AP18B-AG-EGARR-20260913'); });
  rejected('weist eine nicht kandidatierte neue AWA-Quellenprüfung ab', m => { m.reviews.find(row => row[0].startsWith('AP18B'))[7] = 'withdrawn'; });
  rejected('weist eine gefälschte räumliche Freigabe ab', m => { m.assignments.at(-1).status = 'approved'; });
  rejected('weist fremde Kantonszugehörigkeit ab', m => { m.assignments.at(-1).parentAreaId = 'GEO-BE'; });
  rejected('weist den Verlust eines expliziten Gebietseinschlusses ab', m => { m.assignments.pop(); });
  rejected('weist einen Wechsel zwischen Rheinfelder Gemeindegruppen ab', m => {
    const row = m.assignments.find(item => item.de === 'Gemeinde Hellikon');
    row.scopeId = 'AG-ARG-RHEINFELDEN-E2'; row.locator = '§ 6 Abs. 1 Bst. e Ziff. 2';
  });
  rejected('weist die Aufhebung des Baden-Ausschlusses ab', m => { m.assignments.find(row => row.id === 'AREA-AP18A-04').effect = 'include'; });
  rejected('weist unbelegte amtliche Kennungen ab', m => { m.assignments.at(-1).officialIdSystem = 'BFS'; m.assignments.at(-1).officialId = '9999'; });
  rejected('weist eine fehlende Verfahrenssperre ab', m => { m.mappings = m.mappings.filter(row => row[0] !== 'MAP-AP18B-AG-A'); });
  rejected('weist eine unpassende Produktübersetzung ab', m => { agRule(m).fr = 'Autre fête'; });
  rejected('weist eine vorgezogene Datenfenstergrenze ab', m => { agRule(m).from = '2025-01-01'; });
});
