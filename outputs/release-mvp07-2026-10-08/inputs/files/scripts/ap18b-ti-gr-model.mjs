// SPDX-License-Identifier: AGPL-3.0-only
// Append-only review seed. No production profile, workbook importer or new category enum.
import { isDeepStrictEqual } from 'node:util';
import { createAgPackageModel, validateAgPackageModel } from './ap18b-ag-model.mjs';
import { validateModel, REVIEW_DATE } from './ap18a-model.mjs';
import { validateAreaAssignments } from './ap18a-area-assignments.mjs';

const TI_SCOPE = 'TI-OFFICIAL-ALL';
const GR_SCOPE = 'GR-PUBLIC-ALL';
const CH_SOURCE = 'SRC-BUNDESFEIERTAG-19940701';
const IDS = {
  ti: 'SRC-TI-FEIERTAGE-843200', lall: 'SRC-TI-LALL-843100', lpamm: 'SRC-TI-LPAMM-165100-20250601',
  gr: 'SRC-GR-RUHETAGE-520100-20160101', vrg: 'SRC-GR-VRG-370100-V3521',
  grIt: 'SRC-GR-RUHETAGE-520100-IT-V2604', grRm: 'SRC-GR-RUHETAGE-520100-RM-V2604',
  vrgRm: 'SRC-GR-VRG-370100-RM-V3521', tiCalendar: 'SRC-TI-UIL-FEIERTAGE-2026-2027',
  nationalRm: 'SRC-CH-PARL-BUNDESFEIER-RM-2026', cantonTiRm: 'SRC-TI-KANTONSNAME-RM'
};
const TI_KEYS = ['NEW-YEAR', 'EPIPHANY', 'ST-JOSEPH', 'EASTER-MONDAY', 'MAY1', 'ASCENSION',
  'WHIT-MONDAY', 'CORPUS-CHRISTI', 'ST-PETER-PAUL', 'NATIONAL-DAY', 'ASSUMPTION',
  'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS', 'ST-STEPHEN'];
const GR_KEYS = ['NEW-YEAR', 'GOOD-FRIDAY', 'EASTER', 'EASTER-MONDAY', 'ASCENSION',
  'PENTECOST', 'WHIT-MONDAY', 'NATIONAL-DAY', 'FEDERAL-FAST', 'CHRISTMAS', 'ST-STEPHEN'];
const TI_LABOUR_KEYS = ['NEW-YEAR', 'EPIPHANY', 'EASTER-MONDAY', 'ASCENSION', 'NATIONAL-DAY',
  'ASSUMPTION', 'ALL-SAINTS', 'CHRISTMAS', 'ST-STEPHEN'];
const TI_OTHER_KEYS = ['ST-JOSEPH', 'MAY1', 'WHIT-MONDAY', 'CORPUS-CHRISTI', 'ST-PETER-PAUL', 'IMMACULATE-CONCEPTION'];
const HIGH_KEYS = ['GOOD-FRIDAY', 'EASTER', 'PENTECOST', 'FEDERAL-FAST', 'CHRISTMAS'];
const HIGH_SUNDAYS = ['EASTER', 'PENTECOST', 'FEDERAL-FAST'];
const TI_IT = {
  'NEW-YEAR': 'Capo d’anno', EPIPHANY: 'Epifania', 'ST-JOSEPH': 'San Giuseppe',
  'EASTER-MONDAY': 'Lunedì di Pasqua', MAY1: 'Primo maggio', ASCENSION: 'Ascensione',
  'WHIT-MONDAY': 'Lunedì di Pentecoste', 'CORPUS-CHRISTI': 'Corpus Domini',
  'ST-PETER-PAUL': 'San Pietro e Paolo', 'NATIONAL-DAY': 'Primo agosto', ASSUMPTION: 'Assunzione',
  'ALL-SAINTS': 'Ognissanti', 'IMMACULATE-CONCEPTION': 'Immacolata', CHRISTMAS: 'Natale', 'ST-STEPHEN': 'Santo Stefano'
};
const GR_DE = { 'NEW-YEAR': 'Neujahr', 'GOOD-FRIDAY': 'Karfreitag', EASTER: 'Ostersonntag',
  'EASTER-MONDAY': 'Ostermontag', ASCENSION: 'Auffahrt', PENTECOST: 'Pfingstsonntag',
  'WHIT-MONDAY': 'Pfingstmontag', 'NATIONAL-DAY': 'Bundesfeiertag',
  'FEDERAL-FAST': 'Eidgenössischer Bettag', CHRISTMAS: 'Weihnachtstag', 'ST-STEPHEN': 'Stefanstag' };
const GR_IT = { 'NEW-YEAR': 'Capodanno', 'GOOD-FRIDAY': 'Venerdì Santo', EASTER: 'Domenica di Pasqua',
  'EASTER-MONDAY': 'Lunedì di Pasqua', ASCENSION: 'Ascensione', PENTECOST: 'Domenica di Pentecoste',
  'WHIT-MONDAY': 'Lunedì di Pentecoste', 'NATIONAL-DAY': 'Primo agosto',
  'FEDERAL-FAST': 'Festa federale di preghiera', CHRISTMAS: 'Natale', 'ST-STEPHEN': 'Santo Stefano' };
const RM = { 'NEW-YEAR': 'Bumaun', 'GOOD-FRIDAY': 'Venderdi sontg', EASTER: 'Dumengia da Pasca',
  'EASTER-MONDAY': 'Glindesdi da Pasca', ASCENSION: 'Ascensiun', PENTECOST: 'Dumengia da Tschuncaisma',
  'WHIT-MONDAY': 'Glindesdi da Tschuncaisma', 'NATIONAL-DAY': 'Festa naziunala svizra',
  'FEDERAL-FAST': 'Di da la rogaziun federala', CHRISTMAS: 'Di da Nadal', 'ST-STEPHEN': 'Son Steffan' };
const RM_ORIGINAL = { ...RM, EASTER: 'la dumengia da Pasca', PENTECOST: 'la dumengia da Tschuncaisma',
  'EASTER-MONDAY': 'glindesdi da Pasca', 'WHIT-MONDAY': 'glindesdi da Tschuncaisma',
  'NATIONAL-DAY': 'festa naziunala svizra', 'FEDERAL-FAST': 'il di da la rogaziun federala', CHRISTMAS: 'il di da Nadal' };
const URLS = {
  [IDS.ti]: 'https://www3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/legge/num/568',
  [IDS.lall]: 'https://m3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/legge/num/569',
  [IDS.lpamm]: 'https://www3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/legge/num/151',
  [IDS.gr]: 'https://www.gr-lex.gr.ch/api/de/versions/2604/pdf_file',
  [IDS.vrg]: 'https://www.gr-lex.gr.ch/api/de/versions/3521/pdf_file',
  [IDS.grIt]: 'https://www.gr-lex.gr.ch/app/it/texts_of_law/520.100/versions/2604',
  [IDS.grRm]: 'https://www.gr-lex.gr.ch/api/rm/versions/2604/pdf_file',
  [IDS.vrgRm]: 'https://www.gr-lex.gr.ch/api/rm/versions/3521/pdf_file',
  [IDS.tiCalendar]: 'https://www4.ti.ch/dfe/de/uil/legge-lavoro/giorni-festivi-in-ticino-1',
  [IDS.nationalRm]: 'https://www.parlament.ch/agenda/Pages/agenda-1-august-2026.aspx?lang=1047',
  [IDS.cantonTiRm]: 'https://www4.ti.ch/generale/foederalismus11/rumantsch/foederalismus/preschentaziun'
};
const GR_ASSUMPTION = 'Bestätigte Projektannahme nur für Art.-1-VRG-Kontext vor kantonalen Behörden: zusätzliche lokale Ruhetage werden nicht erhoben. Art. 7 Abs. 2 schliesst sie nicht ausdrücklich aus. Örtliche Fristenwirkung bleibt OF-008, keine automatische Berechenbarkeit.';

function source(id, jurisdiction, title, locator, version, note) {
  return [id, jurisdiction, title, locator, URLS[id], version, REVIEW_DATE, note, 'open', null];
}

function sources() {
  return [
    source(IDS.ti, 'CH-TI', 'Legge concernente i giorni festivi ufficiali nel Cantone Ticino', 'RL 843.200, Art. 1', null,
      '15 offizielle Tage. IT amtlich, DE/FR Produktübersetzungen. Acht TI-spezifische RM-Namen offen. Kein gesonderter Fassungsstand ausgewiesen, Inkrafttreten 09.02.2010.'),
    source(IDS.lall, 'CH-TI', 'Legge di applicazione della legge federale sul lavoro, LALL', 'RL 843.100, Art. 6 lit. a und b', null,
      'Arbeitsrechtliche Gruppen 9/6 separat. Alle 15 bleiben offiziell. Kein Ausschluss der sechs Tage aus LPAmm. Kein gesonderter Fassungsstand ausgewiesen, Inkrafttreten 01.06.2011.'),
    source(IDS.lpamm, 'CH-TI', 'Legge sulla procedura amministrativa, LPAmm', 'RL 165.100, Art. 1 und Art. 13 Abs. 3', '2025-06-01',
      'Art. 13 Abs. 3 erfasst offiziell anerkannte Feiertage. Sonderrecht Art. 1 Abs. 2 und Ausschluss von Titel II nach Art. 1 Abs. 3 bleiben vorbehalten.'),
    source(IDS.gr, 'CH-GR', 'Gesetz über die öffentlichen Ruhetage, Ruhetagsgesetz', 'BR 520.100, Art. 2–4', '2016-01-01',
      'DE amtlich. IT/RM separat belegt, FR Produktübersetzung. Art. 2 Abs. 2: hohe Tage samt drei benannten Sonntagen. Bundesfeier aus Bundesregel, lokale Ruhetage nicht erfasst.'),
    source(IDS.vrg, 'CH-GR', 'Gesetz über die Verwaltungsrechtspflege, VRG', 'BR 370.100, Art. 1, 2 und 7 Abs. 2, Version 3521', '2025-01-01', GR_ASSUMPTION),
    source(IDS.grIt, 'CH-GR', 'Legge sui giorni di riposo pubblici, amtliche italienische Sprachfassung', 'BR 520.100, Art. 2, Version 2604, IT', '2016-01-01',
      'Sprachbeleg IT: unter anderem Domenica di Pasqua, Domenica di Pentecoste und Festa federale di preghiera. Keine zusätzliche Rechtswirkung durch Sprachübernahme.'),
    source(IDS.grRm, 'CH-GR', 'Lescha davart ils dis da paus publics, amtliche rätoromanische Sprachfassung', 'BR 520.100, Art. 2, Version 2604, RM', '2016-01-01',
      'Amtliche RG-Namen. Anzeige teilweise ohne Satzartikel und mit grossem Anfangsbuchstaben. Gemeinsame TI-Namen übernehmen nur diesen Sprachbeleg, nicht GR-Recht.'),
    source(IDS.vrgRm, 'CH-GR', 'Lescha davart la giurisdicziun administrativa, rätoromanischer Namensbeleg', 'BR 370.100, Präambel, Version 3521, RM', '2025-01-01',
      'Amtlicher Beleg des Kantonsnamens Grischun. Eigenständiger Sprachbeleg, keine zusätzliche Freigabe der Verfahrenszuordnung.'),
    source(IDS.tiCalendar, 'CH-TI', 'Giorni festivi in Ticino, amtlicher UIL-Kalender 2026/2027', 'Amtliche Informationsseite und Jahreslisten 2026/2027', null,
      'Datumskontrolle 2026/2027. Die Ausprägung 2028 ist regelbasiert abgeleitet, keine behauptete amtliche Jahresliste 2028.'),
    source(IDS.nationalRm, 'CH', 'Parlamentsagenda, Bundesfeier 2026, rätoromanischer Sprachbeleg', 'Agendaeintrag: festa naziunala svizra', null,
      'Nur Sprachbeleg für Festa naziunala svizra. Der Veranstaltungsbezug 2026 ist kein Normstand. Rechtsgrundlage bleibt die bestehende Bundesquelle.'),
    source(IDS.cantonTiRm, 'CH-TI', 'Kanton Tessin, Föderalismusdarstellung in Rumantsch Grischun', 'Infurmaziuns generalas: chantun Tessin', null,
      'Amtlicher Beleg des Kantonsnamens Tessin. Undatierte Webseite, nur Namensbeleg, keine Feiertagsnorm.')
  ];
}

function definitions(base) {
  return { ...structuredClone(base.holidayDefinitions),
    EPIPHANY: { labels: { de: 'Heilige Drei Könige', fr: 'Épiphanie' }, calculation: { type: 'fixedMonthDay', month: 1, day: 6 } },
    'ST-JOSEPH': { labels: { de: 'Josefstag', fr: 'Saint-Joseph' }, calculation: { type: 'fixedMonthDay', month: 3, day: 19 } },
    'ST-PETER-PAUL': { labels: { de: 'Peter und Paul', fr: 'Saints Pierre et Paul' }, calculation: { type: 'fixedMonthDay', month: 6, day: 29 } }
  };
}

function scopeRows() {
  return [
    [TI_SCOPE, 'CH-TI', 'Tessin, offizielle Feiertage', 'Kanton',
      'Alle 15 Tage nach Art. 1 RL 843.200. Keine Einschränkung auf neun arbeitsrechtlich sonntagsgleiche Feiertage.', IDS.ti, 'Art. 1', 'open', '2026-01-01', null],
    [GR_SCOPE, 'CH-GR', 'Graubünden, kantonale Grundliste', 'Kanton',
      'Art. 2 Ruhetagsgesetz plus separat angewendete Bundesregel. Keine kommunalen Beschlüsse. VRG-Annahme und örtliche Wirkung ausschliesslich im Verfahrensbezug.', IDS.gr, 'Art. 2', 'open', '2026-01-01', null]
  ];
}

function profileRows() {
  return [
    { branch: 'ti', scopeId: TI_SCOPE, kind: 'official', de: 'Tessin, offizielle Feiertage', holidayKeys: [...TI_KEYS], locator: 'Art. 1', sourceId: IDS.ti, areaType: 'Kanton', members: ['Tessin'] },
    { branch: 'gr', scopeId: GR_SCOPE, kind: 'official', de: 'Graubünden, kantonale Grundliste', holidayKeys: [...GR_KEYS], locator: 'Art. 2 und Bundesregel Art. 1', sourceId: IDS.gr, areaType: 'Kanton', members: ['Graubünden'] }
  ];
}

function newRules(base) {
  const dictionary = definitions(base);
  const rules = [];
  for (const [canton, keys, scopeId] of [['TI', TI_KEYS, TI_SCOPE], ['GR', GR_KEYS, GR_SCOPE]]) {
    for (const key of keys) {
      const holiday = dictionary[key];
      const federalApplication = canton === 'GR' && key === 'NATIONAL-DAY';
      const locator = canton === 'TI' ? 'Art. 1' : federalApplication ? 'Art. 1'
        : HIGH_SUNDAYS.includes(key) ? 'Art. 2 Abs. 2'
          : HIGH_KEYS.includes(key) ? 'Art. 2 Abs. 1 Bst. b und Abs. 2' : 'Art. 2 Abs. 1 Bst. b';
      rules.push({
        id: `${canton}-CAL-DAY-${key}`, jurisdiction: `CH-${canton}`, scope: scopeId,
        de: canton === 'GR' ? GR_DE[key] : holiday.labels.de, fr: holiday.labels.fr,
        category: 'publicHoliday', calculation: structuredClone(holiday.calculation), from: '2026-01-01', to: null,
        source: canton === 'TI' ? IDS.ti : federalApplication ? CH_SOURCE : IDS.gr,
        locator, status: 'open', approvalBasis: null, priority: 100, action: 'add', target: null,
        exportClass: 'blockedEffect', reference: null,
        it: canton === 'TI' ? TI_IT[key] : GR_IT[key], rm: RM[key] ?? ''
      });
    }
  }
  return rules;
}

function mappingRows() {
  return [
    ['MAP-TI-LPAMM-ART13', TI_SCOPE, 'publicHoliday', 'LPAmm Art. 13 Abs. 3 im Anwendungsbereich von Art. 1',
      'Alle 15 offiziellen Tage. Sonderrecht nach Art. 1 Abs. 2 und Ausschluss von Titel II nach Art. 1 Abs. 3 vorbehalten. Orts-/Profilanknüpfung und Freigabe offen.',
      'RL 165.100 Art. 1 und 13 Abs. 3 / RL 843.200 Art. 1', 'open', null],
    ['MAP-TI-LALL-A', TI_SCOPE, 'labourLawHoliday', 'LALL Art. 6 lit. a, neun sonntagsgleiche Tage',
      'Neujahr, Dreikönige, Ostermontag, Auffahrt, Bundesfeier, Mariä Himmelfahrt, Allerheiligen, Weihnachten, Stephanstag. Arbeitsrechtliche Einteilung, kein Filter für LPAmm.',
      'RL 843.100 Art. 6 lit. a', 'blocked', null],
    ['MAP-TI-LALL-B', TI_SCOPE, 'publicHoliday', 'LALL Art. 6 lit. b, sechs weitere offizielle Tage',
      'Josefstag, 1. Mai, Pfingstmontag, Fronleichnam, Peter und Paul, Mariä Empfängnis. Weiterhin offiziell und im LPAmm-Anwendungsbereich zu berücksichtigen.',
      'RL 843.100 Art. 6 lit. b / RL 165.100 Art. 13 Abs. 3', 'blocked', null],
    ['MAP-TI-OTHER-PROCESS', TI_SCOPE, 'publicHoliday', 'Andere Verfahren, Sonderrecht und ausgenommene Erstinstanzverfahren',
      'Keine pauschale Übertragung. Art. 1 Abs. 3 LPAmm nimmt bestimmte formlos durch sofort vollstreckbare Entscheide erledigte Erstinstanzverfahren von Titel II aus.',
      'RL 165.100 Art. 1 Abs. 2 und 3', 'blocked', null],
    ['MAP-GR-VRG-ART1', GR_SCOPE, 'publicHoliday', 'VRG Art. 1, kantonale Behörden einschliesslich gleichgestellter Privater nach Abs. 3',
      GR_ASSUMPTION, 'BR 370.100 Art. 1 Abs. 1–3 und Art. 7 Abs. 2 / BR 520.100 Art. 2 und 3', 'open', null],
    ['MAP-GR-VRG-ART2', GR_SCOPE, 'publicHoliday', 'VRG Art. 2, Regional- und Gemeindebehörden',
      'Aus dem bestätigten Modellkontext ausgeschlossen. Keine Ableitung einer Fristberechenbarkeit aus der kantonalen Grundliste.',
      'BR 370.100 Art. 2', 'blocked', null],
    ['MAP-GR-OTHER-PROCESS', GR_SCOPE, 'publicHoliday', 'StPO, ZPO, BGG, SchKG, ATSG und andere Spezialverfahren',
      'Keine Übertragung der VRG-Projektannahme. Gesetzlicher Ortsbezug, allfällige lokale Ruhetage und Sonderrecht gesondert prüfen. OF-008 bleibt offen.',
      'BR 370.100 Art. 1 Abs. 2 / BR 520.100 Art. 3', 'blocked', null]
  ];
}

function additions(base) {
  const scopes = scopeRows();
  const newSources = sources();
  return {
    rules: newRules(base), scopes, sources: newSources, mappings: mappingRows(),
    reviews: newSources.map((entry, index) => [`AP18B-TI-GR-${String(index + 1).padStart(2, '0')}-20260913`,
      entry[0], 'newScope', REVIEW_DATE, 'unclear', null,
      `${entry[7]} Erstaufnahme als Prüfgrundlage, kein behaupteter Vergleich mit früherem freigegebenem TI-/GR-Stand.`,
      'candidate', 'David Steimer', 'Codex', 'Fachabnahme der Erhebung offen. Sprachbeleg ersetzt keine Verfahrensfreigabe.']),
    assignments: scopes.map((scope, index) => ({
      id: `AREA-AP18B-TI-GR-${String(index + 1).padStart(2, '0')}`, scopeId: scope[0],
      areaId: index === 0 ? 'GEO-TI' : 'GEO-GR', de: index === 0 ? 'Tessin' : 'Graubünden',
      fr: index === 0 ? 'Tessin' : 'Grisons', it: index === 0 ? 'Ticino' : 'Grigioni',
      rm: index === 0 ? 'Tessin' : 'Grischun', areaType: 'Kanton', parentAreaId: 'GEO-CH',
      effect: 'include', officialIdSystem: '', officialId: '', from: '2026-01-01', to: null,
      sourceId: scope[5], locator: scope[6], status: 'open',
      note: index === 0 ? 'Kantonsgebiet für die offizielle Liste. IT/RM-Kantonsnamen amtlich belegt, keine automatische Verfahrensfreigabe.'
        : 'Kantonsgebiet nur für die Grundliste. Lokale Ruhetage nicht vollständig erhoben. Begrenzte VRG-Annahme separat, OF-008 offen.'
    }))
  };
}

function metadata(base, added) {
  const keyOf = rule => rule.id.replace(/^(TI|GR)-CAL-DAY-/, '');
  const evidence = [];
  for (const rule of added.rules) {
    const key = keyOf(rule);
    const ti = rule.jurisdiction === 'CH-TI';
    for (const language of ['de', 'fr', 'it', 'rm']) {
      let sourceId = null;
      let kind = 'productTranslation';
      let originalForm = null;
      let note = 'Produktübersetzung, keine amtliche Sprachfassung dieser Norm.';
      if (language === 'it') {
        sourceId = ti || key === 'NATIONAL-DAY' ? IDS.ti : IDS.grIt;
        kind = key === 'NATIONAL-DAY' ? 'normalizedOfficialText' : 'officialText';
        originalForm = key === 'NATIONAL-DAY' ? 'Il Primo agosto (anniversario della fondazione della Confederazione)' : rule.it;
        note = key === 'NATIONAL-DAY' ? 'Verkürzter amtlicher IT-Name, Sprachübernahme ohne Übertragung tessinischen Rechts.' : 'Amtlicher italienischer Wortlaut.';
      } else if (language === 'de' && !ti) {
        sourceId = key === 'NATIONAL-DAY' ? CH_SOURCE : IDS.gr;
        kind = 'officialText'; originalForm = rule.de; note = 'Amtlicher deutscher Name aus der angegebenen Rechtsquelle.';
      } else if (language === 'rm') {
        sourceId = key === 'NATIONAL-DAY' ? IDS.nationalRm : rule.rm ? IDS.grRm : null;
        kind = rule.rm ? 'normalizedOfficialText' : 'notYetVerified';
        originalForm = RM_ORIGINAL[key] ?? null;
        note = rule.rm ? 'Amtlicher RG-Sprachbeleg, Satzartikel entfernt und Anfang grossgeschrieben, soweit erforderlich. Bei TI nur Namensübernahme, keine GR-Rechtswirkung.'
          : 'Im begrenzten Paket kein hinreichender amtlicher RG-Beleg, Feld bleibt leer.';
      }
      evidence.push({ ruleId: rule.id, language, value: rule[language], kind, sourceId,
        sourceUrl: sourceId === CH_SOURCE ? base.sources.find(row => row[0] === CH_SOURCE)[4] : sourceId ? URLS[sourceId] : null,
        originalForm, note });
    }
  }
  return {
    scopeLabels: { [TI_SCOPE]: { fr: 'Canton du Tessin', it: 'Cantone Ticino', rm: 'Chantun Tessin' },
      [GR_SCOPE]: { fr: 'Canton des Grisons', it: 'Cantone dei Grigioni', rm: 'Chantun Grischun' } },
    jurisdictionLabels: { 'CH-TI': { it: 'Ticino', rm: 'Tessin' }, 'CH-GR': { it: 'Grigioni', rm: 'Grischun' } },
    jurisdictionLanguageEvidence: { 'CH-TI': { it: IDS.ti, rm: IDS.cantonTiRm }, 'CH-GR': { it: IDS.grIt, rm: IDS.vrgRm } },
    languageEvidenceDataset: evidence,
    legalClassifications: {
      tiLabourLaw: { sourceId: IDS.lall, sundayEquivalent: { locator: 'Art. 6 lit. a', ruleIds: TI_LABOUR_KEYS.map(key => `TI-CAL-DAY-${key}`) },
        otherOfficial: { locator: 'Art. 6 lit. b', ruleIds: TI_OTHER_KEYS.map(key => `TI-CAL-DAY-${key}`) }, lpammIncludesBothGroups: true },
      grHighDays: { sourceId: IDS.gr, locator: 'Art. 2 Abs. 2', ruleIds: HIGH_KEYS.map(key => `GR-CAL-DAY-${key}`),
        namedSundayRuleIds: HIGH_SUNDAYS.map(key => `GR-CAL-DAY-${key}`), createAdditionalOccurrence: false },
      grFederalApplication: { ruleId: 'GR-CAL-DAY-NATIONAL-DAY', sourceRuleId: 'CH-CAL-HOL-NATIONAL-DAY',
        sourceId: CH_SOURCE, status: 'open', cantonalRecognitionClaimed: false }
    },
    procedureBoundaries: {
      ti: { mappingId: 'MAP-TI-LPAMM-ART13', allOfficialDays: true, specialLawReserved: true, titleIIArticle1Paragraph3Exception: true, runtimeEnabled: false },
      gr: { mappingId: 'MAP-GR-VRG-ART1', authorityContext: 'Art. 1 VRG', includesEquivalentPrivateBodies: true,
        article2AuthoritiesIncluded: false, specialLawReserved: true, assumption: GR_ASSUMPTION,
        localHolidaysCollected: false, localHolidaysLegallyExcluded: false, territorialDeadlineEffectResolved: false,
        openQuestionId: 'OF-008', inheritedByOtherProcedures: false, runtimeEnabled: false }
    }
  };
}

export async function createTiGrPackageModel(root) {
  const base = await createAgPackageModel(root);
  const added = additions(base);
  const model = { ...structuredClone(base), packageId: 'AP18B-02-TI-GR', additions: added };
  for (const key of Object.keys(added)) model[key] = [...structuredClone(base[key]), ...added[key]];
  model.profiles = [...structuredClone(base.profiles), ...profileRows()];
  model.holidayDefinitions = definitions(base);
  model.ruleKeys = { ...base.ruleKeys, ...Object.fromEntries(added.rules.map(rule => [rule.id, rule.id.replace(/^(TI|GR)-CAL-DAY-/, '')])) };
  for (const code of ['CH-TI', 'CH-GR']) {
    model.jurisdictions.find(row => row[0] === code)[4] = 'Kantonspaket AP18B-02, Fachabnahme offen';
  }
  Object.assign(model, metadata(base, added));
  validateTiGrPackageModel(model, base);
  return model;
}

// The independently created baseModel is required. This validates a review seed,
// not a future XLSX import and not an approval or signature authority.
export function validateTiGrPackageModel(model, baseModel) {
  validateAgPackageModel(baseModel);
  if (model.packageId !== 'AP18B-02-TI-GR') throw new Error('Unknown TI/GR package');
  const expected = additions(baseModel);
  if (!isDeepStrictEqual(model.additions, expected)) throw new Error('Changed TI/GR additions or unapproved legal boundary');
  for (const key of Object.keys(expected)) {
    if (!isDeepStrictEqual(model[key], [...baseModel[key], ...expected[key]])) throw new Error(`Changed base or incomplete TI/GR ${key}`);
  }
  const jurisdictions = structuredClone(baseModel.jurisdictions);
  for (const code of ['CH-TI', 'CH-GR']) jurisdictions.find(row => row[0] === code)[4] = 'Kantonspaket AP18B-02, Fachabnahme offen';
  if (!isDeepStrictEqual(model.jurisdictions, jurisdictions)) throw new Error('Changed jurisdiction or unapproved TI/GR status');
  if (!isDeepStrictEqual(model.profiles, [...baseModel.profiles, ...profileRows()])) throw new Error('Changed TI/GR profiles');
  if (!isDeepStrictEqual(model.holidayDefinitions, definitions(baseModel))) throw new Error('Changed existing or new holiday definitions');
  const keys = { ...baseModel.ruleKeys, ...Object.fromEntries(expected.rules.map(rule => [rule.id, rule.id.replace(/^(TI|GR)-CAL-DAY-/, '')])) };
  if (!isDeepStrictEqual(model.ruleKeys, keys)) throw new Error('Changed TI/GR holiday keys');
  const expectedMetadata = metadata(baseModel, expected);
  for (const [key, value] of Object.entries(expectedMetadata)) {
    if (!isDeepStrictEqual(model[key], value)) throw new Error(`Changed TI/GR legal or language evidence: ${key}`);
  }
  for (const key of Object.keys(baseModel).filter(key => !Object.hasOwn(expected, key)
    && !['packageId', 'jurisdictions', 'profiles', 'holidayDefinitions', 'ruleKeys'].includes(key))) {
    if (!isDeepStrictEqual(model[key], baseModel[key])) throw new Error(`Changed base metadata: ${key}`);
  }
  validateModel(model);
  validateAreaAssignments(model.assignments, model);
  return true;
}
