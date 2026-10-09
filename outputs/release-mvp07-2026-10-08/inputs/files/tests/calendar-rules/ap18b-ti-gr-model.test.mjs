// SPDX-License-Identifier: AGPL-3.0-only
// Independent legal/date oracles are documented in the TI/GR source notes.
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { createAgPackageModel } from '../../scripts/ap18b-ag-model.mjs';
import { createTiGrPackageModel, validateTiGrPackageModel } from '../../scripts/ap18b-ti-gr-model.mjs';
import { ruleDate } from '../../scripts/ap18a-model.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const base = await createAgPackageModel(root);
const model = await createTiGrPackageModel(root);
const clone = value => structuredClone(value);
const sorted = values => [...values].sort();
const rule = (id, candidate = model) => candidate.rules.find(item => item.id === id);
const mapping = (id, candidate = model) => candidate.mappings.find(item => item[0] === id);
const reject = (name, mutate) => it(name, () => {
  const candidate = clone(model);
  mutate(candidate);
  assert.throws(() => validateTiGrPackageModel(candidate, base), Error);
});
const tiKeys = ['NEW-YEAR', 'EPIPHANY', 'ST-JOSEPH', 'EASTER-MONDAY', 'MAY1', 'ASCENSION',
  'WHIT-MONDAY', 'CORPUS-CHRISTI', 'ST-PETER-PAUL', 'NATIONAL-DAY', 'ASSUMPTION',
  'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS', 'ST-STEPHEN'];
const grKeys = ['NEW-YEAR', 'GOOD-FRIDAY', 'EASTER', 'EASTER-MONDAY', 'ASCENSION',
  'PENTECOST', 'WHIT-MONDAY', 'NATIONAL-DAY', 'FEDERAL-FAST', 'CHRISTMAS', 'ST-STEPHEN'];

describe('AP18B-02: strikte Basiserhaltung und additive Erfassung', () => {
  it('liefert die vollständigen und separat ausgewiesenen Ergänzungsarrays', () => {
    assert.equal(validateTiGrPackageModel(model, base), true);
    assert.deepEqual(Object.keys(model.additions), ['rules', 'scopes', 'sources', 'mappings', 'reviews', 'assignments']);
    const counts = { rules: [90, 26, 116], scopes: [11, 2, 13], sources: [6, 11, 17],
      mappings: [11, 7, 18], reviews: [7, 11, 18], assignments: [29, 2, 31] };
    for (const [key, [oldCount, newCount, total]] of Object.entries(counts)) {
      assert.equal(base[key].length, oldCount);
      assert.equal(model.additions[key].length, newCount);
      assert.equal(model[key].length, total);
      assert.deepEqual(model[key].slice(0, oldCount), base[key]);
      assert.deepEqual(model[key].slice(oldCount), model.additions[key]);
    }
  });

  it('ändert nur die erlaubten TI-/GR-Erfassungsanzeigen in den Gemeinwesen', () => {
    for (const before of base.jurisdictions) {
      const after = model.jurisdictions.find(row => row[0] === before[0]);
      if (['CH-TI', 'CH-GR'].includes(before[0])) {
        assert.equal(after[4], 'Kantonspaket AP18B-02, Fachabnahme offen');
        assert.equal(after[5], 'open');
        assert.deepEqual(after.filter((_, index) => index !== 4), before.filter((_, index) => index !== 4));
      } else assert.deepEqual(after, before);
    }
  });

  it('belässt Produktvertrag, Referenzhashes und bestehende Definitionen unverändert', () => {
    for (const key of ['contractVersion', 'baseline', 'hashes', 'status', 'kind', 'preservedSuspensionRules']) {
      assert.deepEqual(model[key], base[key]);
    }
    for (const [key, value] of Object.entries(base.holidayDefinitions)) assert.deepEqual(model.holidayDefinitions[key], value);
    for (const [id, key] of Object.entries(base.ruleKeys)) assert.equal(model.ruleKeys[id], key);
    assert.deepEqual(model.profiles.slice(0, base.profiles.length), base.profiles);
  });

  it('erfasst genau 15 TI- und 11 GR-Regeln ohne zusätzliche Kategorien', () => {
    const ti = model.additions.rules.filter(item => item.jurisdiction === 'CH-TI');
    const gr = model.additions.rules.filter(item => item.jurisdiction === 'CH-GR');
    assert.deepEqual(ti.map(item => model.ruleKeys[item.id]), tiKeys);
    assert.deepEqual(gr.map(item => model.ruleKeys[item.id]), grKeys);
    assert.ok(model.additions.rules.every(item => item.category === 'publicHoliday'));
    assert.equal(model.rules.length, 116);
  });

  it('gibt weder Normliste, Quellenprüfung noch territoriale Erfassung frei', () => {
    assert.ok(model.additions.rules.every(item => item.status === 'open' && item.approvalBasis === null
      && item.reference === null && item.exportClass === 'blockedEffect'));
    assert.ok(model.additions.sources.every(row => row[8] === 'open' && row[9] === null));
    assert.ok(model.additions.reviews.every(row => row[7] === 'candidate' && row[4] === 'unclear'));
    assert.ok(model.additions.scopes.every(row => row[7] === 'open'));
    assert.ok(model.additions.assignments.every(row => row.status === 'open' && row.officialId === '' && row.officialIdSystem === ''));
  });
});

describe('AP18B-02: Tessiner Rechtsklassen und gesetzliche Grenzen', () => {
  it('trennt die arbeitsrechtliche 9/6-Einteilung von der vollständigen offiziellen Liste', () => {
    const groups = model.legalClassifications.tiLabourLaw;
    const expectedA = ['NEW-YEAR', 'EPIPHANY', 'EASTER-MONDAY', 'ASCENSION', 'NATIONAL-DAY',
      'ASSUMPTION', 'ALL-SAINTS', 'CHRISTMAS', 'ST-STEPHEN'];
    const expectedB = ['ST-JOSEPH', 'MAY1', 'WHIT-MONDAY', 'CORPUS-CHRISTI', 'ST-PETER-PAUL', 'IMMACULATE-CONCEPTION'];
    assert.deepEqual(groups.sundayEquivalent.ruleIds, expectedA.map(key => `TI-CAL-DAY-${key}`));
    assert.deepEqual(groups.otherOfficial.ruleIds, expectedB.map(key => `TI-CAL-DAY-${key}`));
    assert.equal(new Set([...groups.sundayEquivalent.ruleIds, ...groups.otherOfficial.ruleIds]).size, 15);
    assert.equal(groups.lpammIncludesBothGroups, true);
    assert.ok(expectedB.every(key => rule(`TI-CAL-DAY-${key}`).category === 'publicHoliday'));
    assert.equal(mapping('MAP-TI-LALL-A')[6], 'blocked');
    assert.equal(mapping('MAP-TI-LALL-B')[6], 'blocked');
  });

  it('hält Art. 1 Abs. 2 und 3 LPAmm sichtbar und verhindert eine automatische Aktivierung', () => {
    const bound = model.procedureBoundaries.ti;
    assert.equal(bound.allOfficialDays, true);
    assert.equal(bound.specialLawReserved, true);
    assert.equal(bound.titleIIArticle1Paragraph3Exception, true);
    assert.equal(bound.runtimeEnabled, false);
    assert.match(mapping('MAP-TI-LPAMM-ART13')[4], /Art\. 1 Abs\. 3/);
    assert.match(mapping('MAP-TI-OTHER-PROCESS')[4], /sofort vollstreckbare/);
    assert.equal(mapping('MAP-TI-LPAMM-ART13')[6], 'open');
    assert.equal(mapping('MAP-TI-OTHER-PROCESS')[6], 'blocked');
  });

  it('ergänzt weder Karfreitag noch Berchtoldstag oder Oster-/Pfingstsonntage in TI', () => {
    for (const key of ['GOOD-FRIDAY', 'BERCHTOLD', 'EASTER', 'PENTECOST']) {
      assert.equal(rule(`TI-CAL-DAY-${key}`), undefined);
    }
  });

  it('führt den Bundesfeiertag je neuem Profil nur einmal', () => {
    for (const [jurisdiction, scope] of [['CH-TI', 'TI-OFFICIAL-ALL'], ['CH-GR', 'GR-PUBLIC-ALL']]) {
      assert.equal(model.rules.filter(item => item.jurisdiction === jurisdiction && item.scope === scope
        && model.ruleKeys[item.id] === 'NATIONAL-DAY').length, 1);
    }
    assert.equal(model.rules.filter(item => item.id === 'CH-CAL-HOL-NATIONAL-DAY').length, 1);
  });
});

describe('AP18B-02: Graubündner Annahme statt behaupteter lokaler Rechtsausschluss', () => {
  it('beschränkt die Annahme auf Art. 1 VRG mit gleichgestellten Privaten und Sonderrechtsvorbehalt', () => {
    const bound = model.procedureBoundaries.gr;
    assert.equal(bound.authorityContext, 'Art. 1 VRG');
    assert.equal(bound.includesEquivalentPrivateBodies, true);
    assert.equal(bound.specialLawReserved, true);
    assert.equal(bound.article2AuthoritiesIncluded, false);
    assert.match(mapping('MAP-GR-VRG-ART1')[3], /Abs\. 3/);
    assert.equal(mapping('MAP-GR-VRG-ART2')[6], 'blocked');
  });

  it('lässt OF-008 und ungeklärte Ortsfälle ausdrücklich offen', () => {
    const bound = model.procedureBoundaries.gr;
    assert.equal(bound.localHolidaysCollected, false);
    assert.equal(bound.localHolidaysLegallyExcluded, false);
    assert.equal(bound.territorialDeadlineEffectResolved, false);
    assert.equal(bound.openQuestionId, 'OF-008');
    assert.equal(bound.runtimeEnabled, false);
    assert.match(bound.assumption, /Projektannahme/);
    assert.match(bound.assumption, /nicht ausdrücklich aus/);
    assert.match(mapping('MAP-GR-VRG-ART1')[4], /OF-008/);
    assert.ok(model.additions.assignments.every(item => item.areaType === 'Kanton'));
  });

  it('überträgt die VRG-Annahme nicht auf andere Verfahren', () => {
    assert.equal(model.procedureBoundaries.gr.inheritedByOtherProcedures, false);
    assert.equal(mapping('MAP-GR-OTHER-PROCESS')[6], 'blocked');
    for (const name of ['StPO', 'ZPO', 'BGG', 'SchKG', 'ATSG']) assert.ok(mapping('MAP-GR-OTHER-PROCESS')[3].includes(name));
  });

  it('führt fünf hohe Tage als Eigenschaft und drei hohe Sonntage ohne Zusatzvorkommen', () => {
    const high = model.legalClassifications.grHighDays;
    assert.deepEqual(sorted(high.ruleIds), sorted(['GOOD-FRIDAY', 'EASTER', 'PENTECOST', 'FEDERAL-FAST', 'CHRISTMAS'].map(key => `GR-CAL-DAY-${key}`)));
    assert.deepEqual(high.namedSundayRuleIds, ['EASTER', 'PENTECOST', 'FEDERAL-FAST'].map(key => `GR-CAL-DAY-${key}`));
    assert.equal(high.createAdditionalOccurrence, false);
    for (const id of high.ruleIds) assert.equal(model.rules.filter(item => item.id === id).length, 1);
    assert.match(rule('GR-CAL-DAY-GOOD-FRIDAY').locator, /Abs\. 1.*Abs\. 2/);
  });

  it('belegt GR-Bundesfeier als offene Bundesregelanwendung, nicht als neue kantonale Norm', () => {
    const item = rule('GR-CAL-DAY-NATIONAL-DAY');
    const inherited = model.legalClassifications.grFederalApplication;
    assert.equal(item.source, 'SRC-BUNDESFEIERTAG-19940701');
    assert.equal(item.locator, 'Art. 1');
    assert.equal(item.status, 'open');
    assert.equal(item.approvalBasis, null);
    assert.equal(inherited.sourceRuleId, 'CH-CAL-HOL-NATIONAL-DAY');
    assert.equal(inherited.cantonalRecognitionClaimed, false);
    assert.deepEqual(rule('CH-CAL-HOL-NATIONAL-DAY'), base.rules.find(entry => entry.id === 'CH-CAL-HOL-NATIONAL-DAY'));
  });
});

describe('AP18B-02: Quellenfassungen und nachvollziehbare vier Sprachen', () => {
  it('verwendet VRG-Version 3521 und behauptet keine Normstände undatierter Quellen', () => {
    const vrg = model.sources.find(row => row[0] === 'SRC-GR-VRG-370100-V3521');
    assert.equal(vrg[4], 'https://www.gr-lex.gr.ch/api/de/versions/3521/pdf_file');
    assert.equal(vrg[5], '2025-01-01');
    for (const id of ['SRC-TI-FEIERTAGE-843200', 'SRC-TI-LALL-843100', 'SRC-TI-UIL-FEIERTAGE-2026-2027',
      'SRC-CH-PARL-BUNDESFEIER-RM-2026', 'SRC-TI-KANTONSNAME-RM']) {
      assert.equal(model.sources.find(row => row[0] === id)[5], null);
    }
    assert.ok(model.additions.sources.every(row => row[6] === '2026-09-13'));
    assert.match(model.sources.find(row => row[0] === 'SRC-TI-UIL-FEIERTAGE-2026-2027')[7], /keine behauptete amtliche Jahresliste 2028/);
  });

  it('hält alle Sprachquellen in Quellen- und Quellenprüfungstabellen sichtbar', () => {
    assert.equal(model.additions.sources.length, 11);
    assert.equal(model.additions.reviews.length, 11);
    for (const item of model.languageEvidenceDataset.filter(entry => entry.sourceId !== null)) {
      assert.ok(model.sources.some(row => row[0] === item.sourceId));
      assert.ok(item.sourceUrl.startsWith('https://'));
    }
    for (const source of model.additions.sources) assert.ok(model.additions.reviews.some(row => row[1] === source[0]));
  });

  it('kennzeichnet TI-DE/FR und GR-FR als Produktübersetzungen', () => {
    assert.equal(model.languageEvidenceDataset.length, 104);
    assert.ok(model.languageEvidenceDataset.filter(item => item.ruleId.startsWith('TI-') && ['de', 'fr'].includes(item.language))
      .every(item => item.kind === 'productTranslation' && item.sourceId === null));
    assert.ok(model.languageEvidenceDataset.filter(item => item.ruleId.startsWith('GR-') && item.language === 'fr')
      .every(item => item.kind === 'productTranslation' && item.sourceId === null));
  });

  it('übernimmt amtliche IT-Namen und normalisierte GR-RG-Formen ohne rückwirkende Umbenennung', () => {
    assert.equal(rule('TI-CAL-DAY-NEW-YEAR').it, 'Capo d’anno');
    assert.equal(rule('TI-CAL-DAY-CORPUS-CHRISTI').it, 'Corpus Domini');
    assert.equal(rule('GR-CAL-DAY-ST-STEPHEN').de, 'Stefanstag');
    assert.equal(rule('BE-CAL-HOL-ST-STEPHEN').de, 'Stephanstag');
    assert.equal(rule('GR-CAL-DAY-CHRISTMAS').rm, 'Di da Nadal');
    assert.equal(rule('GR-CAL-DAY-FEDERAL-FAST').it, 'Festa federale di preghiera');
    assert.equal(rule('GR-CAL-DAY-FEDERAL-FAST').rm, 'Di da la rogaziun federala');
    const rm = model.languageEvidenceDataset.find(item => item.ruleId === 'GR-CAL-DAY-CHRISTMAS' && item.language === 'rm');
    assert.equal(rm.originalForm, 'il di da Nadal');
    assert.equal(rm.kind, 'normalizedOfficialText');
  });

  it('lässt exakt acht nicht belegte TI-RG-Namen leer', () => {
    const missing = model.additions.rules.filter(item => item.jurisdiction === 'CH-TI' && item.rm === '').map(item => model.ruleKeys[item.id]);
    assert.deepEqual(missing, ['EPIPHANY', 'ST-JOSEPH', 'MAY1', 'CORPUS-CHRISTI', 'ST-PETER-PAUL', 'ASSUMPTION', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION']);
    assert.ok(model.additions.rules.filter(item => item.jurisdiction === 'CH-GR').every(item => item.rm !== ''));
    assert.equal(model.languageEvidenceDataset.filter(item => item.kind === 'notYetVerified').length, 8);
  });

  it('belegt die Kantonsnamen Ticino/Tessin und Grigioni/Grischun separat', () => {
    assert.deepEqual(model.jurisdictionLabels, { 'CH-TI': { it: 'Ticino', rm: 'Tessin' }, 'CH-GR': { it: 'Grigioni', rm: 'Grischun' } });
    assert.equal(model.jurisdictionLanguageEvidence['CH-TI'].rm, 'SRC-TI-KANTONSNAME-RM');
    assert.equal(model.jurisdictionLanguageEvidence['CH-GR'].rm, 'SRC-GR-VRG-370100-RM-V3521');
  });
});

describe('AP18B-02: 78 unabhängig tabellierte Datumswerte 2026–2028', () => {
  const fixed = { 'NEW-YEAR': '01-01', EPIPHANY: '01-06', 'ST-JOSEPH': '03-19', MAY1: '05-01',
    'ST-PETER-PAUL': '06-29', 'NATIONAL-DAY': '08-01', ASSUMPTION: '08-15', 'ALL-SAINTS': '11-01',
    'IMMACULATE-CONCEPTION': '12-08', CHRISTMAS: '12-25', 'ST-STEPHEN': '12-26' };
  const moving = {
    2026: { 'GOOD-FRIDAY': '04-03', EASTER: '04-05', 'EASTER-MONDAY': '04-06', ASCENSION: '05-14', PENTECOST: '05-24', 'WHIT-MONDAY': '05-25', 'CORPUS-CHRISTI': '06-04', 'FEDERAL-FAST': '09-20' },
    2027: { 'GOOD-FRIDAY': '03-26', EASTER: '03-28', 'EASTER-MONDAY': '03-29', ASCENSION: '05-06', PENTECOST: '05-16', 'WHIT-MONDAY': '05-17', 'CORPUS-CHRISTI': '05-27', 'FEDERAL-FAST': '09-19' },
    2028: { 'GOOD-FRIDAY': '04-14', EASTER: '04-16', 'EASTER-MONDAY': '04-17', ASCENSION: '05-25', PENTECOST: '06-04', 'WHIT-MONDAY': '06-05', 'CORPUS-CHRISTI': '06-15', 'FEDERAL-FAST': '09-17' }
  };
  for (const year of [2026, 2027, 2028]) {
    it(`trifft alle 26 TI-/GR-Daten für ${year}`, () => {
      let count = 0;
      for (const item of model.additions.rules) {
        const key = model.ruleKeys[item.id];
        assert.equal(ruleDate(item, year), `${year}-${fixed[key] ?? moving[year][key]}`, item.id);
        count++;
      }
      assert.equal(count, 26);
    });
  }
  it('verschiebt kollidierende Feiertage nicht künstlich auf Ersatzmontage', () => {
    assert.equal(ruleDate(rule('TI-CAL-DAY-NATIONAL-DAY'), 2027), '2027-08-01');
    assert.equal(ruleDate(rule('GR-CAL-DAY-NATIONAL-DAY'), 2027), '2027-08-01');
    assert.equal(ruleDate(rule('TI-CAL-DAY-ALL-SAINTS'), 2026), '2026-11-01');
    for (const item of model.additions.rules) assert.equal(ruleDate(item, 2025), null);
  });
});

describe('AP18B-02: negative Fachgrenzen und unveränderter Bestand', () => {
  reject('weist die Entfernung eines der sechs zusätzlichen TI-Tage ab', m => { m.rules = m.rules.filter(item => item.id !== 'TI-CAL-DAY-WHIT-MONDAY'); });
  reject('weist den fachlich falschen Neun-Tage-Filter für LPAmm ab', m => { m.legalClassifications.tiLabourLaw.lpammIncludesBothGroups = false; });
  reject('weist die Aufhebung des Art.-1-Abs.-3-LPAmm-Ausschlusses ab', m => { m.procedureBoundaries.ti.titleIIArticle1Paragraph3Exception = false; });
  reject('weist eine unberechtigt aktive TI-Fristberechnung ab', m => { m.procedureBoundaries.ti.runtimeEnabled = true; });
  reject('weist regionale oder kommunale Art.-2-Behörden im GR-Profil ab', m => { m.procedureBoundaries.gr.article2AuthoritiesIncluded = true; });
  reject('weist einen behaupteten gesetzlichen Ausschluss lokaler GR-Tage ab', m => { m.procedureBoundaries.gr.localHolidaysLegallyExcluded = true; });
  reject('weist eine behauptete Klärung von OF-008 ab', m => { m.procedureBoundaries.gr.territorialDeadlineEffectResolved = true; });
  reject('weist eine fehlende GR-Modellannahme ab', m => { m.procedureBoundaries.gr.assumption = ''; });
  reject('weist die Übertragung der GR-Annahme auf andere Verfahren ab', m => { m.procedureBoundaries.gr.inheritedByOtherProcedures = true; });
  reject('weist die Entfernung der sichtbaren GR-Annahme aus dem Mapping ab', m => { mapping('MAP-GR-VRG-ART1', m)[4] = 'Keine lokalen Feiertage'; });
  reject('weist doppelte Vorkommen hoher Sonntage ab', m => { m.legalClassifications.grHighDays.createAdditionalOccurrence = true; });
  reject('weist eine behauptete kantonale GR-Bundesfeiernorm ab', m => { m.legalClassifications.grFederalApplication.cantonalRecognitionClaimed = true; });
  reject('weist die Verwechslung der GR-Bundesquelle mit dem Ruhetagsgesetz ab', m => { rule('GR-CAL-DAY-NATIONAL-DAY', m).source = 'SRC-GR-RUHETAGE-520100-20160101'; });
  reject('weist eine geänderte bestehende Regel ab', m => { m.rules[0].de = 'Geändert'; });
  reject('weist eine geänderte bestehende Quelle ab', m => { m.sources[0][7] = 'Geändert'; });
  reject('weist eine geänderte bestehende Gebietszuordnung ab', m => { m.assignments[0].note = 'Geändert'; });
  reject('weist eine geänderte alte Quellenprüfung ab', m => { m.reviews[0][7] = 'approved'; });
  reject('weist einen unangeforderten Vertragsversionswechsel ab', m => { m.contractVersion = '9.0.0'; });
  reject('weist einen unbelegten TI-RG-Namen ab', m => { rule('TI-CAL-DAY-ST-JOSEPH', m).rm = 'Ungeprüfter Name'; });
  reject('weist die falsche amtliche Kennzeichnung einer Produktübersetzung ab', m => { m.languageEvidenceDataset.find(item => item.ruleId === 'TI-CAL-DAY-NEW-YEAR' && item.language === 'de').kind = 'officialText'; });
  reject('weist eine unbekannte amtliche Gebietskennung ab', m => { m.additions.assignments[0].officialId = '9999'; });
  reject('weist eine gefälschte neue Regelfreigabe ab', m => { rule('TI-CAL-DAY-NEW-YEAR', m).status = 'approved'; });
  reject('weist eine gefälschte neue Quellenfreigabe ab', m => { m.additions.sources[0][8] = 'approved'; });
  reject('weist eine gefälschte neue Scopefreigabe ab', m => { m.additions.scopes[0][7] = 'approved'; });
  reject('weist eine gefälschte neue Verfahrensfreigabe ab', m => { mapping('MAP-GR-VRG-ART1', m)[6] = 'approved'; });
  reject('weist eine gefälschte neue Prüfereignisfreigabe ab', m => { m.additions.reviews[0][7] = 'approved'; });
  reject('weist eine gefälschte TI-Gemeinwesenfreigabe ab', m => { m.jurisdictions.find(row => row[0] === 'CH-TI')[5] = 'approved'; });
  reject('weist einen falschen Osterabstand ab', m => { rule('TI-CAL-DAY-CORPUS-CHRISTI', m).calculation.offsetDays = 59; });
  reject('weist einen falschen Bettag ab', m => { rule('GR-CAL-DAY-FEDERAL-FAST', m).calculation.occurrence = 2; });
  reject('weist einen als Normstand missbrauchten Sammlungsstand ab', m => { m.additions.sources[0][5] = '2026-09-04'; });
  reject('weist eine alte VRG-Konsolidierung mit gleichem Standdatum ab', m => { m.additions.sources.find(row => row[0] === 'SRC-GR-VRG-370100-V3521')[4] = 'https://www.gr-lex.gr.ch/api/de/versions/3394/pdf_file'; });
});
